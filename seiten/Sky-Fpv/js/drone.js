// Sky FPV – Zusammenbau des 3D-Modells einer Drohne aus den Blender-Einzelteilen
import * as THREE from 'three';
import { loadModel } from './assets.js';
import { part } from './parts.js';

let discTex = null;
function propDiscTexture() {
  if (discTex) return discTex;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(128, 128, 10, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,255,255,0.0)');
  gr.addColorStop(0.15, 'rgba(255,255,255,0.35)');
  gr.addColorStop(0.75, 'rgba(255,255,255,0.22)');
  gr.addColorStop(0.95, 'rgba(255,255,255,0.4)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  discTex = new THREE.CanvasTexture(c);
  discTex.colorSpace = THREE.SRGBColorSpace;
  return discTex;
}

// Eigene Farben (Werkstatt): Props, Motorglocken, Akku-Folie, Abstandsbolzen
const RECOLOR = [[/^M_Prop_/, 'prop'], [/^M_Bell_/, 'bell'], [/^M_Wrap_/, 'wrap'], [/^M_Standoff_/, 'accent']];
export function recolor(obj, colors = {}) {
  obj.traverse((o) => {
    if (!o.isMesh) return;
    for (const [re, key] of RECOLOR) {
      if (colors[key] && re.test(o.material.name)) { o.material = o.material.clone(); o.material.color.set(colors[key]); }
    }
  });
  return obj;
}
const clone = async (name, colors) => recolor((await loadModel('drone/' + name)).scene.clone(true), colors);

export async function assembleDrone(build, frames, uptilt = 25) {
  const fr = part('frame', build.frame), mo = part('motor', build.motor), pr = part('prop', build.prop);
  const st = part('stack', build.stack), ba = part('battery', build.battery), ca = part('camera', build.camera);
  const ac = part('actioncam', build.actioncam);
  const group = new THREE.Group();
  const slots = {};
  if (!fr) return { group, slots, props: [], camPos: new THREE.Vector3(), update() {} };   // noch kein Frame
  const fd = frames.frames[fr.id];
  const propZ = mo ? frames.motors[mo.id].propZ : 0;
  const put = (slot, obj) => { (slots[slot] ||= new THREE.Group()).add(obj); };
  const C = build.colors || {};

  put('frame', await clone(fr.model, C));
  const props = [];
  const propColor = pr ? recolor((await loadModel('drone/' + pr.model)).scene.clone(true), C) : null;
  for (let i = 0; i < 4 && mo; i++) {
    const [x, y, z] = fd.motors[i];
    const m = await clone(mo.model, C);
    m.position.set(x, y, z);
    m.rotation.y = Math.atan2(-z, x);
    put('motor', m);
    if (!pr) continue;
    const p = propColor.clone(true);
    const holder = new THREE.Group();
    holder.position.set(x, y + propZ, z);
    if (fd.spin[i] < 0) p.scale.x = -1;
    holder.add(p);
    const disc = await clone('prop_disc');
    disc.scale.setScalar(pr.D / 2);
    disc.position.y = 0.004;
    let col = new THREE.Color(1, 1, 1);
    p.traverse((o) => { if (o.isMesh && /Prop/.test(o.material.name)) col = o.material.color; });
    disc.traverse((o) => {
      if (o.isMesh) {
        o.material = new THREE.MeshBasicMaterial({ map: propDiscTexture(), color: col, transparent: true, depthWrite: false, side: THREE.DoubleSide });
        o.castShadow = false;
      }
    });
    disc.visible = false;
    holder.add(disc);
    put('prop', holder);
    props.push({ blades: p, disc, spin: fd.spin[i], angle: Math.random() * 6 });
  }
  if (st) { const stack = await clone(st.model); stack.position.set(...fd.stack); put('stack', stack); }
  if (ca) {
  const cam = await clone(ca.model);
  cam.position.set(...fd.camera);
  cam.rotation.x = THREE.MathUtils.degToRad(uptilt);
  put('camera', cam);
  const vtx = await clone(ca.vtx);
  vtx.position.set(...fd.vtx);
  put('camera', vtx);
  }
  if (ba) { const bat = await clone(ba.model, C); bat.position.set(...fd.battery); put('battery', bat); }
  if (ac && ac.model) {
    const a = await clone(ac.model);
    a.position.set(...fd.actioncam);
    a.position.z += fr.id === 'spatz3' ? 0.0 : 0.0;
    put('actioncam', a);
  }
  Object.values(slots).forEach((g) => group.add(g));
  group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  return {
    group, slots, props, camPos: new THREE.Vector3(...fd.camera),
    update(dt, omegas) {
      props.forEach((p, i) => {
        const w = omegas ? omegas[i] : 0;
        p.angle += w * dt * p.spin;
        p.blades.rotation.y = p.angle;
        const fast = w > 260;
        p.disc.visible = fast;
        p.blades.visible = !fast || w < 600;
        p.disc.traverse((o) => { if (o.isMesh) o.material.opacity = THREE.MathUtils.clamp((w - 200) / 900, 0.15, 0.9); });
      });
    },
  };
}
