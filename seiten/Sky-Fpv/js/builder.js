// Sky FPV – Werkstatt: Drohne aus Einzelteilen bauen (Blender-Modelle auf der Werkbank)
// Live-3D-Vorschau jedes Teils mit Datenblatt, Vergleich mit dem aktuellen Build, Explosionsansicht,
// Farben, Kamerafokus auf die Baugruppe und ein Motortest mit Sound.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { loadModel } from './assets.js';
import { CATALOG, SLOTS, part, fits, emptyBuild, isComplete } from './parts.js';
import { buildParams } from './physics.js';
import { assembleDrone, recolor } from './drone.js';

const $ = (id) => document.getElementById(id);
const BENCH_Y = 0.9045;
const EXPLODE = { frame: [0, 0, 0], motor: [0, 0.035, 0], prop: [0, 0.09, 0], stack: [0, 0.07, 0.0], camera: [0, 0.05, -0.09], battery: [0, 0.16, 0.02], actioncam: [0, 0.22, -0.05] };
const COLORS = {
  prop: ['#ff7a1a', '#2fd4c4', '#ff2d6e', '#e8e8ec', '#ffd400', '#7a2bd1', '#111111', '#39ff14'],
  bell: ['#7a2bd1', '#d12b2b', '#2b6bd1', '#c9cbd0', '#111111', '#e0b21f', '#1f9e57', '#ff6a1a'],
  accent: ['#7a2bd1', '#d12b2b', '#2b6bd1', '#c9cbd0', '#111111', '#e0b21f', '#1f9e57', '#ff6a1a'],
  wrap: ['#2e6bd6', '#d63b2e', '#1f9e57', '#e0b21f', '#222222', '#ff2d95', '#f0f0f0', '#5a5f66'],
};
const LEFT = ['frame', 'motor', 'prop', 'stack'], RIGHT = ['battery', 'camera', 'actioncam'];
// Balken unten: Wert, Maximum, höher = besser?
const BARS = [['top', 'Top-Speed', ' km/h', 0, 220, true], ['mass', 'Gewicht', ' g', 0, 1200, false], ['tw', 'Schub/Gewicht', ':1', 1, 14, true], ['flight', 'Flugzeit', ' min', 1, 12, true], ['hover', 'Schwebegas', ' %', 0, 100, false]];
const COLOR_NAMES = { prop: 'Propeller', bell: 'Motorglocken', accent: 'Abstandsbolzen', wrap: 'Akku-Folie' };

// Datenblatt je Kategorie
function specs(cat, p) {
  const g = (v) => `${(v * 1000).toFixed(v < 0.01 ? 1 : 0)} g`;
  switch (cat) {
    case 'frame': return [['Gewicht', g(p.mass)], ['Info', p.info]];
    case 'motor': return [['KV', p.kv], ['Wicklung', `${(p.R * 1000).toFixed(0)} mΩ`], ['Max. Strom', `${p.imax} A`], ['Gewicht', g(p.mass)], ['Einsatz', p.info]];
    case 'prop': return [['Durchmesser', `${p.inch}"`], ['Steigung', `${(p.P / 0.0254).toFixed(1)}"`], ['Blätter', /3b/.test(p.id) ? 3 : 2], ['Schubbeiwert', p.Ct], ['Gewicht', g(p.mass)]];
    case 'stack': return [['Lochabstand', `${p.size}x${p.size} mm`], ['ESC', `${p.amps} A`], ['Gewicht', g(p.mass)]];
    case 'battery': return [['Zellen', `${p.cells}S (${(p.cells * 3.7).toFixed(1)} V)`], ['Kapazität', `${p.mah} mAh`], ['Energie', `${(p.cells * 3.7 * p.mah / 1000).toFixed(1)} Wh`], ['Innenwid.', `${(p.rCell * 1000).toFixed(1)} mΩ/Zelle`], ['Gewicht', g(p.mass)]];
    case 'camera': return [['Video', p.digital ? 'Digital HD' : 'Analog'], ['Reichweite', p.digital ? '~1500 m' : '~850 m'], ['Gewicht', g(p.mass)]];
    default: return [['Gewicht', p.mass ? g(p.mass) : '–']];
  }
}

export class Workshop {
  async init(app) {
    this.app = app;
    const scene = (this.scene = new THREE.Scene());
    scene.background = new THREE.Color(0x07080a);
    scene.fog = new THREE.Fog(0x07080a, 2.2, 5.5);
    const pm = new THREE.PMREMGenerator(app.renderer.r);
    this.envTex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = this.envTex;
    scene.environmentIntensity = 0.22;
    scene.add((await loadModel('drone/workbench')).scene);
    const lamp = new THREE.SpotLight(0xfff1dc, 18, 3, 0.7, 0.5, 1.5);
    lamp.position.set(-0.22, 1.33, -0.1);
    lamp.target.position.set(0, BENCH_Y, 0);
    lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048); lamp.shadow.bias = -0.0002;
    scene.add(lamp, lamp.target);
    const key = new THREE.DirectionalLight(0xdfe8ff, 1.2);
    key.position.set(1.5, 2.5, 1.5);
    key.intensity = 0.35;
    scene.add(key, new THREE.AmbientLight(0x30343c, 0.35));
    await this.garage(scene);
    this.camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.01, 50);
    this.camera.position.set(0.32, 1.12, 0.42);
    this.controls = new OrbitControls(this.camera, app.renderer.r.domElement);
    this.controls.target.set(0, BENCH_Y + 0.03, 0);
    this.controls.enableDamping = true;
    this.controls.minDistance = 0.08; this.controls.maxDistance = 1.6;
    this.controls.maxPolarAngle = Math.PI * 0.49;
    this.controls.enabled = false;
    this.focus = null; this.exploded = false; this.explodeT = 0; this.test = null;
    this.slot = 'frame';
    this.drone = null;
    this.initPreview();
    $('b-builds').onchange = (e) => { app.settings.activeBuild = +e.target.value; app.save(); this.refresh(true); };
    $('b-name').onchange = (e) => { this.build().name = e.target.value || 'Drohne'; app.save(); this.fillBuilds(); };
    $('b-new').onclick = () => { app.settings.builds.push(emptyBuild('Neue Drohne ' + app.settings.builds.length)); app.settings.activeBuild = app.settings.builds.length - 1; this.slot = 'frame'; app.save(); this.refresh(true); };
    $('b-copy').onclick = () => { app.settings.builds.push({ ...structuredClone(this.build()), name: this.build().name + ' (Kopie)' }); app.settings.activeBuild = app.settings.builds.length - 1; app.save(); this.refresh(true); };
    $('b-del').onclick = () => {
      if (app.settings.builds.length <= 1) return app.toast('Mindestens eine Drohne muss bleiben');
      app.settings.builds.splice(app.settings.activeBuild, 1); app.settings.activeBuild = 0; app.save(); this.refresh(true);
    };
    $('b-pick-close').onclick = () => this.closePicker();
    $('b-colors-btn').onclick = () => { $('b-colorpop').classList.toggle('hidden'); $('b-colors-btn').classList.toggle('on', !$('b-colorpop').classList.contains('hidden')); };
    $('b-explode').onclick = () => { this.exploded = !this.exploded; $('b-explode').classList.toggle('on', this.exploded); };
    $('b-test').onclick = () => this.motorTest();
    $('b-reset-view').onclick = () => { this.focus = { target: new THREE.Vector3(0, BENCH_Y + 0.03, 0), dist: 0.55 }; };
  }

  // ---------------------------------------------------------------- Garage: Raum, Neonleisten, Deko an der Lochwand
  async garage(scene) {
    const concrete = new THREE.MeshStandardMaterial({ color: 0x24262a, roughness: 0.92 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshStandardMaterial({ color: 0x1a1b1e, roughness: 0.55, metalness: 0.1 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
    const back = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), concrete); back.position.set(0, 2, -0.6);
    const side = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), concrete); side.position.set(-1.6, 2, 1); side.rotation.y = Math.PI / 2;
    const side2 = side.clone(); side2.position.x = 1.6; side2.rotation.y = -Math.PI / 2;
    scene.add(floor, back, side, side2);
    // Neonröhren: links grün, rechts orange (+ farbiges Licht)
    const tube = (col, x, y, z, rotZ) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.1, 10), new THREE.MeshBasicMaterial({ color: col }));
      m.position.set(x, y, z); m.rotation.z = rotZ;
      const l = new THREE.PointLight(col, 2.2, 3.2, 1.6); l.position.set(x * 0.9, y, z + 0.25);
      scene.add(m, l);
    };
    tube(0x3dff7a, -1.25, 1.55, -0.52, 0);
    tube(0xff7a1a, 1.25, 1.55, -0.52, 0);
    tube(0xffa040, 0, 2.15, -0.5, Math.PI / 2);
    const rim = new THREE.PointLight(0x3dff9a, 0.8, 2.2, 1.5); rim.position.set(-0.7, 1.1, 0.6);
    const rim2 = new THREE.PointLight(0xff8a2a, 0.9, 2.2, 1.5); rim2.position.set(0.8, 1.05, 0.5);
    scene.add(rim, rim2);
    // Teile an der Lochwand (Wand bei z = -0.54, Höhe 0.9 … 2.0)
    const hang = async (name, x, y, s = 1, rz = 0) => {
      try {
        const o = (await loadModel('drone/' + name)).scene.clone(true);
        o.rotation.set(Math.PI / 2, 0, rz);
        o.scale.setScalar(s);
        o.position.set(x, y, -0.515);
        scene.add(o);
      } catch (e) { /* Deko optional */ }
    };
    await Promise.all([
      hang('frame_falke5', 0.12, 1.55, 1, 0.3), hang('frame_spatz3', 0.62, 1.68, 1, -0.2),
      hang('prop_5136_3b', -0.12, 1.25), hang('prop_5043_2b', 0.36, 1.2, 1, 0.5), hang('prop_7035_2b', 0.7, 1.3, 1, 1.2),
      hang('motor_2207', -0.05, 1.82), hang('motor_2806', 0.42, 1.88), hang('batt_6s1300', -0.2, 1.62, 1, 1.57),
    ]);
  }

  // Kleines 3D-Bild eines Teils für die Karten (eigener Offscreen-Renderer, gecacht)
  async thumb(cat, p) {
    const key = cat + ':' + p.id + ':' + JSON.stringify(this.build().colors || {});
    this.thumbs ||= new Map();
    if (this.thumbs.has(key)) return this.thumbs.get(key);
    if (!this.tr) {
      this.tr = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      this.tr.setSize(320, 200, false);
      this.tr.toneMapping = THREE.ACESFilmicToneMapping;
      this.tScene = new THREE.Scene();
      const pm = new THREE.PMREMGenerator(this.tr);
      this.tScene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
      const l = new THREE.DirectionalLight(0xffffff, 2.2); l.position.set(1, 2, 1.5);
      const g = new THREE.DirectionalLight(0x3dff9a, 0.8); g.position.set(-2, 0.5, -1);
      this.tScene.add(l, g, new THREE.AmbientLight(0xffffff, 0.25));
      this.tCam = new THREE.PerspectiveCamera(28, 320 / 200, 0.001, 10);
    }
    const obj = await this.partObject(cat, p);
    if (!obj) return null;
    const box = new THREE.Box3().setFromObject(obj);
    obj.position.sub(box.getCenter(new THREE.Vector3()));
    obj.rotation.y = 0.6;
    const size = box.getSize(new THREE.Vector3()).length();
    this.tCam.position.set(0, size * 0.62, size * 1.45); this.tCam.lookAt(0, 0, 0);
    this.tScene.add(obj);
    this.tr.render(this.tScene, this.tCam);
    const url = this.tr.domElement.toDataURL('image/png');
    this.tScene.remove(obj);
    this.thumbs.set(key, url);
    return url;
  }

  async partObject(cat, p) {
    if (!p?.model) return null;
    const obj = recolor((await loadModel('drone/' + p.model)).scene.clone(true), this.build().colors || {});
    if (cat === 'camera' && p.vtx) {
      const v = (await loadModel('drone/' + p.vtx)).scene.clone(true);
      v.position.set(0, -0.02, 0.03);
      obj.add(v);
    }
    return obj;
  }

  // ---------------------------------------------------------------- Teile-Vorschau (eigener kleiner Renderer)
  initPreview() {
    const c = $('b-preview');
    this.pr = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true });
    this.pr.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.pr.setSize(c.clientWidth || 280, c.clientHeight || 170, false);
    this.pr.toneMapping = THREE.ACESFilmicToneMapping;
    this.prScene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(this.pr);
    this.prScene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    const l = new THREE.DirectionalLight(0xffffff, 2.0); l.position.set(1, 2, 1.5);
    this.prScene.add(l, new THREE.AmbientLight(0xffffff, 0.3));
    this.prCam = new THREE.PerspectiveCamera(30, 280 / 170, 0.001, 10);
    this.prPivot = new THREE.Group();
    this.prScene.add(this.prPivot);
    this.prKey = '';
  }

  async showPreview(cat, p) {
    if (!p) { this.prPivot.clear(); this.prKey = ''; $('b-spec').innerHTML = '<span class="k" style="grid-column:1/-1">Fahr mit der Maus über ein Teil für Vorschau &amp; Daten</span>'; return; }
    this.ghost(cat, p);
    const key = cat + ':' + p.id + ':' + JSON.stringify(this.build().colors || {});
    $('b-spec').innerHTML = `<b>${p.name}</b>` + specs(cat, p).map(([k, v]) => `<span class="k">${k}</span><span>${v}</span>`).join('');
    if (key === this.prKey) return;
    this.prKey = key;
    this.prPivot.clear();
    const obj = await this.partObject(cat, p);
    if (!obj || this.prKey !== key) return;
    const box = new THREE.Box3().setFromObject(obj);
    const ctr = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3()).length();
    obj.position.sub(ctr);
    this.prPivot.add(obj);
    this.prCam.position.set(0, size * 0.55, size * 1.5);
    this.prCam.lookAt(0, 0, 0);
  }

  build() { return this.app.settings.builds[this.app.settings.activeBuild]; }

  fillBuilds() {
    const sel = $('b-builds');
    sel.innerHTML = this.app.settings.builds.map((b, i) => `<option value="${i}">${b.name}</option>`).join('');
    sel.value = this.app.settings.activeBuild;
    $('b-name').value = this.build().name;
  }

  async enter() { this.controls.enabled = true; await this.refresh(true); }
  leave() { this.controls.enabled = false; if (this.test) this.stopTest(); this.closePicker(); }
  openPicker(slot) {
    this.slot = slot; this.picking = true;
    const pk = $('b-picker');
    pk.classList.remove('hidden', 'at-l', 'at-r'); pk.classList.add(LEFT.includes(slot) ? 'at-l' : 'at-r');
    requestAnimationFrame(() => { const c = $('b-preview'); this.pr.setSize(c.clientWidth || 300, c.clientHeight || 170, false); this.prCam.aspect = (c.clientWidth || 300) / (c.clientHeight || 170); this.prCam.updateProjectionMatrix(); });
  }
  closePicker() { this.picking = false; $('b-picker').classList.add('hidden'); this.ghost(); }
  // Stats-Balken: Ghost-Marker zeigt, wie sich das gehoverte Teil auswirken würde
  ghost(cat, p) {
    const b = this.build();
    let a = null;
    if (cat && p && isComplete({ ...b, [cat]: p.id }) && p.id !== b[cat] && fits(cat, p, b)) a = this.statLine(buildParams({ ...b, [cat]: p.id }, this.app.frames.frames));
    for (const [k, , , lo, hi, up] of BARS) {
      const el = document.querySelector(`#b-bars [data-k="${k}"]`);
      if (!el) continue;
      el.classList.toggle('ghost', !!a);
      el.classList.remove('better', 'worse');
      if (!a) continue;
      el.querySelector('.bg').style.left = Math.max(0, Math.min(100, (a[k] - lo) / (hi - lo) * 100)) + '%';
      const cur = this.cs?.[k];
      if (cur != null && Math.abs(a[k] - cur) > 1e-3) el.classList.add((a[k] > cur) === up ? 'better' : 'worse');
    }
  }

  statLine(p) { return { mass: p.mass * 1000, tw: p.tw, flight: p.flightMin, top: p.topSpeed, hover: p.hoverThrottle * 100 }; }

  async refresh(full = false, changed = null) {
    const b = this.build();
    if (full) this.fillBuilds();
    const complete = isComplete(b);
    const cur = complete ? buildParams(b, this.app.frames.frames) : null;
    const cs = cur && this.statLine(cur);
    const next = SLOTS.find(([k]) => !b[k]);   // nächster sinnvoller Bauschritt
    this.cs = cs;
    // Teile-Karten links/rechts um die Drohne
    const card = (k) => {
      const label = SLOTS.find((s) => s[0] === k)[1], p = b[k] && part(k, b[k]);
      const cls = ['pcard', this.picking && k === this.slot ? 'on' : '', !p ? 'empty' : '', next && next[0] === k ? 'next' : '', p && !fits(k, p, b) ? 'misfit' : ''].join(' ');
      return `<div class="${cls}" data-slot="${k}"><div class="pc-lbl">${label}</div>${p && p.model ? `<img data-th="${k}" alt="">` : '<div class="pc-empty">+</div>'}<div class="pc-name">${p ? p.name : next && next[0] === k ? 'als Nächstes wählen' : 'leer'}</div></div>`;
    };
    $('b-cards-l').innerHTML = LEFT.map(card).join('');
    $('b-cards-r').innerHTML = RIGHT.map(card).join('');
    document.querySelectorAll('#builder .pcard').forEach((el) => (el.onclick = () => {
      const k = el.dataset.slot;
      if (this.picking && this.slot === k) { this.closePicker(); this.refresh(); return; }
      this.openPicker(k); this.focusSlot(k); this.refresh();
    }));
    document.querySelectorAll('#builder .pcard img').forEach(async (im) => { const k = im.dataset.th; const u = await this.thumb(k, part(k, b[k])); if (u) im.src = u; });
    $('b-cat-title').textContent = SLOTS.find((s) => s[0] === this.slot)[1];
    // Optionen mit Vergleich zum aktuellen Build
    const fmt = (d, unit, dec, invert) => {
      if (Math.abs(d) < Math.pow(10, -dec) / 2) return '';
      const good = invert ? d < 0 : d > 0;
      return `<i class="${good ? 'up' : 'down'}">${d > 0 ? '+' : ''}${d.toFixed(dec)}${unit}</i>`;
    };
    // passende Teile zuerst und hervorgehoben, unpassende gedimmt darunter
    const opts = [...CATALOG[this.slot]].sort((x, y) => fits(this.slot, y, b) - fits(this.slot, x, b));
    $('b-options').innerHTML = opts.map((p) => {
      const ok = fits(this.slot, p, b);
      let delta = '';
      if (complete && p.id !== b[this.slot] && ok) {
        const a = this.statLine(buildParams({ ...b, [this.slot]: p.id }, this.app.frames.frames));
        delta = [fmt(a.mass - cs.mass, ' g', 0, true), fmt(a.tw - cs.tw, ' T/W', 1), fmt(a.flight - cs.flight, ' min', 1), fmt(a.top - cs.top, ' km/h', 0)].filter(Boolean).join(' ');
      }
      return `<div class="opt ${p.id === b[this.slot] ? 'on' : ''} ${ok ? 'fit' : 'nofit'}" data-id="${p.id}"><b>${p.name}</b><span>${p.info || ''}${p.mass ? ` · ${(p.mass * 1000).toFixed(0)} g` : ''}</span>${delta ? `<div class="delta">${delta}</div>` : ''}</div>`;
    }).join('');
    $('b-options').querySelectorAll('.opt').forEach((el) => {
      const p = part(this.slot, el.dataset.id);
      el.onmouseenter = () => this.showPreview(this.slot, p);
      el.onclick = () => {
        b[this.slot] = el.dataset.id; this.app.save();
        const done = this.slot;
        const nx = SLOTS.find(([k]) => !b[k]);   // automatisch zum nächsten fehlenden Teil
        if (nx) this.openPicker(nx[0]); else this.closePicker();
        this.refresh(false, done);
      };
    });
    this.showPreview(this.slot, part(this.slot, b[this.slot]));
    $('b-options').onmouseleave = () => this.showPreview(this.slot, part(this.slot, b[this.slot]));
    // Farben
    b.colors ||= {};
    $('b-colors').innerHTML = Object.entries(COLORS).map(([k, list]) => `<div class="crow"><span>${COLOR_NAMES[k]}</span><div class="sw">${list.map((c) => `<button class="swatch ${b.colors[k] === c ? 'on' : ''}" data-k="${k}" data-c="${c}" style="background:${c}" title="${c}"></button>`).join('')}<button class="swatch none ${!b.colors[k] ? 'on' : ''}" data-k="${k}" data-c="" title="Original">×</button></div></div>`).join('');
    $('b-colors').querySelectorAll('.swatch').forEach((el) => (el.onclick = () => {
      if (el.dataset.c) b.colors[el.dataset.k] = el.dataset.c; else delete b.colors[el.dataset.k];
      this.app.save(); this.refresh(false, el.dataset.k === 'prop' ? 'prop' : el.dataset.k === 'wrap' ? 'battery' : el.dataset.k === 'bell' ? 'motor' : 'frame');
    }));
    // Daten als Balken unten
    $('b-bars').innerHTML = BARS.map(([k, label, unit, lo, hi]) => {
      const v = cs ? cs[k] : null;
      const w = v == null ? 0 : Math.max(0, Math.min(100, (v - lo) / (hi - lo) * 100));
      const txt = v == null ? '–' : (k === 'tw' || k === 'flight' ? v.toFixed(1) : v.toFixed(0)) + unit;
      return `<div class="sbar" data-k="${k}"><div class="bl"><span>${label}</span><b>${txt}</b></div><div class="bt"><div class="bf" style="width:${w}%"></div><div class="bg"></div></div></div>`;
    }).join('');
    if (!complete) {
      const missing = SLOTS.filter(([k]) => !b[k]).map(([, l]) => l);
      $('b-warn').innerHTML = `<div class="warn soft">Noch nicht flugbereit – es fehlen: ${missing.join(', ')}</div>`;
    } else {
      $('b-warn').innerHTML = cur.warnings.map((w) => `<div class="warn ${cur.flyable ? 'soft' : ''}">⚠ ${w}</div>`).join('')
        || `<span style="color:var(--ok)">✔ Flugbereit</span> <span class="k" style="color:var(--mute)">· ${cur.cells}S ${(cur.cap * 1000).toFixed(0)} mAh · max. ${(cur.maxAmps || 0).toFixed(0)} A · ${cur.digital ? 'Digital HD' : 'Analog'}</span>`;
    }
    // 3D-Modell
    const d = await assembleDrone(b, this.app.frames, this.app.settings.uptilt);
    if (this.drone) this.scene.remove(this.drone.group);
    this.drone = d;
    d.group.position.set(0, BENCH_Y + 0.012, 0);
    d.group.rotation.y = Math.PI * 0.85;
    this.scene.add(d.group);
    if (changed && d.slots[changed]) {
      this.anim = { g: d.slots[changed], t: 0 };
      this.focusSlot(changed);
    }
  }

  focusSlot(slot) {
    const g = this.drone?.slots[slot];
    if (!g) return;
    this.drone.group.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(g);
    const c = box.getCenter(new THREE.Vector3());
    const r = Math.max(0.05, box.getSize(new THREE.Vector3()).length());
    this.focus = { target: c, dist: Math.min(0.9, Math.max(0.12, r * 1.6)) };
  }

  motorTest() {
    // nochmal klicken = Motortest aus
    if (this.test) { this.stopTest(); return; }
    this.app.audio.init();
    this.test = { t: 0 };
    $('b-test').classList.add('on');
    $('b-test').textContent = 'Motortest stoppen';
  }

  stopTest() {
    this.test = null;
    this.app.audio.silence();
    $('b-test').classList.remove('on');
    $('b-test').textContent = 'Motortest';
  }

  update(dt) {
    // Kamera sanft auf die gewählte Baugruppe
    if (this.focus) {
      const c = this.controls;
      c.target.lerp(this.focus.target, 1 - Math.exp(-dt * 6));
      const dir = this.camera.position.clone().sub(c.target);
      const len = dir.length();
      dir.setLength(len + (this.focus.dist - len) * (1 - Math.exp(-dt * 4)));
      this.camera.position.copy(c.target).add(dir);
      if (c.target.distanceTo(this.focus.target) < 0.002 && Math.abs(len - this.focus.dist) < 0.005) this.focus = null;
    }
    this.controls.update();
    // Explosionsansicht
    this.explodeT += ((this.exploded ? 1 : 0) - this.explodeT) * (1 - Math.exp(-dt * 6));
    if (this.drone) {
      for (const [k, g] of Object.entries(this.drone.slots)) {
        const o = EXPLODE[k] || [0, 0, 0];
        g.position.set(o[0] * this.explodeT, o[1] * this.explodeT, o[2] * this.explodeT);
      }
    }
    if (this.anim) {
      this.anim.t += dt;
      const t = Math.min(1, this.anim.t / 0.55), e = 1 - Math.pow(1 - t, 3);
      this.anim.g.position.y += (1 - e) * 0.12;
      this.anim.g.rotation.y = (1 - e) * 0.6;
      if (t >= 1) { this.anim.g.rotation.y = 0; this.anim = null; }
    }
    // Motortest: Hochlauf, halten, Auslauf – mit Sound
    let om = null;
    if (this.test && this.drone) {
      this.test.t += dt;
      if (!isComplete(this.build())) { this.stopTest(); this.app.toast('Erst alle Teile einbauen'); return; }
      const t = this.test.t, cur = buildParams(this.build(), this.app.frames.frames);
      const lvl = t < 1.2 ? t / 1.2 * 0.35 : t < 2.4 ? 0.35 + (t - 1.2) / 1.2 * 0.65 : t < 3.4 ? 1 : Math.max(0, 1 - (t - 3.4) / 1.2);
      const wmax = cur.kvRad * cur.cells * 3.9 * 0.82;
      om = [0, 1, 2, 3].map((i) => lvl * wmax * (1 + 0.01 * i));
      this.app.audio.send(om.map((w) => ({ f: w / (2 * Math.PI), load: lvl, dmg: 0 })), cur.blades, 0.7, 0, 1);
      if (t > 4.8) this.test.t = 1.2;   // läuft weiter, bis man wieder klickt
    }
    if (this.drone) this.drone.update(dt, om);
    // Vorschau drehen
    if (this.pr && this.prPivot.children.length) {
      this.prPivot.rotation.y += dt * 0.8;
      this.pr.render(this.prScene, this.prCam);
    }
  }
}
