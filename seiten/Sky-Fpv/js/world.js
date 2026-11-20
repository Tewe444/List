// Sky FPV – Welt: Himmel, Licht, Terrain (Blender-Heightmap + PBR-Layer), Modelle, Vegetation, Wasser
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { loadJSON, loadBin, loadModel, loadTex, loadText, textureArray, imageData } from './assets.js';
import { CollisionWorld } from './collision.js';
import { MAPS } from './maps.js';

const LAYERS = ['grass', 'dirt', 'concrete', 'gravel', 'asphalt', 'rock'];
const LOOK_DEFAULT = { layers: LAYERS, sky: [3.2, 1.1, 0.004, 0.82], sun: [0xfff0dc, 3.4], hemi: [0xbcd2ff, 0x4a4030, 0.35], env: 0.55,
  snowLine: 380, water: 0x1b3b42, grassTint: 1 };

export async function buildWorld(renderer, mapId, gfx, progress = () => {}) {
  const def = MAPS[mapId];
  const look = { ...LOOK_DEFAULT, ...(def.look || {}) };
  const base = `assets/terrain/${mapId}`;
  const meta = await loadJSON(`${base}/meta.json`);
  const heights = await loadBin(`${base}/height.bin`);
  progress(0.1, 'Terrain');
  const scene = new THREE.Scene();
  const coll = new CollisionWorld(heights, meta.res, meta.size, meta.water);
  const H = (x, z) => coll.height(x, z);

  // ---------------------------------------------------------------- Himmel & Licht
  const sunDir = new THREE.Vector3(...meta.sun).normalize();
  const sky = new Sky();
  sky.scale.setScalar(30000);
  const u = sky.material.uniforms;
  [u.turbidity.value, u.rayleigh.value, u.mieCoefficient.value, u.mieDirectionalG.value] = look.sky;
  u.sunPosition.value.copy(sunDir).multiplyScalar(1000);
  scene.add(sky);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  const sky2 = new Sky(); sky2.scale.setScalar(1000);
  Object.keys(u).forEach((k) => { if (sky2.material.uniforms[k]) sky2.material.uniforms[k].value = u[k].value; });
  envScene.add(sky2);
  const envRT = pmrem.fromScene(envScene, 0.02);
  scene.environment = envRT.texture;
  scene.environmentIntensity = look.env;
  const fogDef = look.fog || meta.fog;
  scene.fog = new THREE.FogExp2(new THREE.Color(fogDef[1]), fogDef[0]);

  const sun = new THREE.DirectionalLight(look.sun[0], look.sun[1]);
  sun.castShadow = gfx.shadows > 0;
  sun.shadow.mapSize.set(gfx.shadows || 1024, gfx.shadows || 1024);
  const sc = sun.shadow.camera;
  sc.left = -90; sc.right = 90; sc.top = 90; sc.bottom = -90; sc.near = 1; sc.far = 900;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight(...look.hemi));

  // ---------------------------------------------------------------- Terrain
  const ts = gfx.terrainTex;
  const [tAlb, tNrm, tOrm, pars, main] = await Promise.all([
    textureArray(look.layers, 'albedo', ts, true), textureArray(look.layers, 'normal', ts, false),
    textureArray(look.layers, 'orm', Math.min(ts, 1024), false),
    loadText('shaders/terrain_pars.glsl'), loadText('shaders/terrain_main.glsl')]);
  progress(0.35, 'Oberflächen');
  const splat = (n) => { const t = new THREE.TextureLoader().load(`${base}/${n}.png`); t.flipY = false; return t; };
  const [sA, sB] = await Promise.all([imageData(`${base}/splat_a.png`, 512), imageData(`${base}/splat_b.png`, 512)]);
  const splatAt = (x, z) => {
    const i = Math.min(511, Math.max(0, Math.floor((x + meta.size / 2) / meta.size * 512)));
    const j = Math.min(511, Math.max(0, Math.floor((z + meta.size / 2) / meta.size * 512)));
    const k = (j * 512 + i) * 4;
    return [sA[k] / 255, sA[k + 1] / 255, sA[k + 2] / 255, sB[k] / 255, sB[k + 2] / 255];
  };
  const seg = meta.res - 1;
  const geo = new THREE.PlaneGeometry(meta.size, meta.size, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let j = 0; j < meta.res; j++) for (let i = 0; i < meta.res; i++) pos.setY(j * meta.res + i, heights[j * meta.res + i]);
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  const tmat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0 });
  const uniforms = {
    tAlb: { value: tAlb }, tNrm: { value: tNrm }, tOrm: { value: tOrm }, tSplatA: { value: splat('splat_a') },
    tSplatB: { value: splat('splat_b') }, tMacro: { value: loadTex('assets/textures/macro.jpg') }, uSize: { value: meta.size }, uSnowLine: { value: look.snowLine }, uGrassTint: { value: look.grassTint },
  };
  tmat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;\nvarying vec3 vWNrm;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvWNrm = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + pars)
      .replace('#include <map_fragment>', main)
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = tRough;')
      .replace('#include <normal_fragment_maps>', 'normal = normalize((viewMatrix * vec4(tNormalW, 0.0)).xyz);')
      .replace('#include <aomap_fragment>', 'reflectedLight.indirectDiffuse *= tAO; reflectedLight.indirectSpecular *= tAO;');
  };
  const terrain = new THREE.Mesh(geo, tmat);
  terrain.receiveShadow = true; terrain.castShadow = gfx.shadows >= 4096;
  scene.add(terrain);

  // ---------------------------------------------------------------- Wasser
  let water = null;
  if (meta.water !== null && meta.water !== undefined) {
    const wn = loadTex('assets/textures/water_normal.jpg');
    wn.repeat.set(160, 160);
    water = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshStandardMaterial({
      color: look.water, roughness: 0.05, metalness: 0.1, normalMap: wn, normalScale: new THREE.Vector2(0.35, 0.35),
      transparent: true, opacity: 0.9, envMapIntensity: 1.4,
    }));
    water.rotation.x = -Math.PI / 2; water.position.y = meta.water; water.receiveShadow = true;
    scene.add(water);
  }

  // ---------------------------------------------------------------- Modelle platzieren
  const layout = def.build(H, meta);
  // Gates zeigen immer entlang der Strecke: Mittel aus Richtung vom vorigen und zum nächsten Gate
  {
    const gs = layout.props.slice(layout.gateStart).filter((p) => p.model === 'gate');
    const n = gs.length;
    gs.forEach((g, i) => {
      if (n < 2) return;
      const a = gs[(i - 1 + n) % n], b = gs[(i + 1) % n];
      let ix = g.x - a.x, iz = g.z - a.z, ox = b.x - g.x, oz = b.z - g.z;
      const li = Math.hypot(ix, iz) || 1, lo = Math.hypot(ox, oz) || 1;
      ix /= li; iz /= li; ox /= lo; oz /= lo;
      let dx = ix + ox, dz = iz + oz;
      if (Math.hypot(dx, dz) < 0.2) { dx = ox; dz = oz; }   // Haarnadel: zum nächsten Gate zeigen
      g.yaw = Math.atan2(-dx, -dz);
      // am Hang: Gate anheben, bis die Anflug-/Abflugbahn (±8 m) nicht mehr im Gelände steckt
      const nx = -Math.sin(g.yaw), nz = -Math.cos(g.yaw);
      let need = g.y;
      for (let k = -8; k <= 8; k += 2) need = Math.max(need, H(g.x + nx * k, g.z + nz * k) - 0.6);
      g.y = need;
    });
  }
  const placements = [...layout.props];
  progress(0.5, 'Vegetation');
  scatter(placements, layout.scatter, meta, H, coll, splatAt);
  const byModel = new Map();
  placements.forEach((p) => { if (!byModel.has(p.model)) byModel.set(p.model, []); byModel.get(p.model).push(p); });
  const infos = {};
  const names = [...byModel.keys()];
  const models = await Promise.all(names.map((n) => loadModel('env/' + n)));
  const HAS_LOD = ['pine_a', 'pine_b', 'pine_c', 'tree_a', 'tree_b'];
  const lodModels = {};
  await Promise.all(names.filter((n) => HAS_LOD.includes(n)).map(async (n) => { lodModels[n] = await loadModel('env/' + n + '_lod'); }));
  const perf = !!gfx.perf;
  const DIST = perf ? { lod: 110, cull: 450, small: 140 } : { lod: 260, cull: 2500, small: 700 };
  const veg = [];
  progress(0.75, 'Modelle');
  names.forEach((n, idx) => {
    const { scene: src, info } = models[idx];
    infos[n] = info;
    const list = byModel.get(n);
    src.updateMatrixWorld(true);
    const mats = list.map((p) => new THREE.Matrix4().compose(new THREE.Vector3(p.x, p.y, p.z),
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.yaw), new THREE.Vector3().setScalar(p.scale)));
    const isVeg = /pine|tree|bush|palm|fern|cactus/.test(n);
    if (isVeg) {
      // Vegetation: nahe = volles Modell mit Schatten, fern = LOD ohne Schatten, sehr fern = ausgeblendet
      const cols = list.map((p) => { const h = p.hue || 0; return p.tint ? new THREE.Color(p.tint) : new THREE.Color(0.78 + h * 0.35, 0.85 + h * 0.2, 0.72 + h * 0.1); });
      const mk = (srcScene, shadow) => { const out = []; srcScene.updateMatrixWorld(true); srcScene.traverse((o) => {
        if (!o.isMesh) return;
        const im = new THREE.InstancedMesh(o.geometry, o.material, list.length);
        im.count = 0; im.frustumCulled = false; im.castShadow = shadow; im.receiveShadow = true;
        im.setColorAt(0, cols[0]);
        scene.add(im); out.push({ im, local: o.matrixWorld.clone() });
      }); return out; };
      const small = /bush|fern|cactus/.test(n);
      veg.push({ list, mats, cols, full: mk(src, !perf || !small), lod: lodModels[n] ? mk(lodModels[n].scene, false) : null, cull: small ? DIST.small : DIST.cull });
      list.forEach((p) => addColliders(coll, info.colliders, p));
      return;
    }
    src.traverse((o) => {
      if (!o.isMesh) return;
      const im = new THREE.InstancedMesh(o.geometry, o.material, list.length);
      list.forEach((p, i) => {
        im.setMatrixAt(i, new THREE.Matrix4().multiplyMatrices(mats[i], o.matrixWorld));
        if (p.tint) im.setColorAt(i, new THREE.Color(p.tint));
        else if (isVeg) { const h = p.hue || 0; im.setColorAt(i, new THREE.Color(0.78 + h * 0.35, 0.85 + h * 0.2, 0.72 + h * 0.1)); }
      });
      im.castShadow = o.castShadow; im.receiveShadow = true; im.renderOrder = o.renderOrder;
      im.computeBoundingSphere();
      scene.add(im);
    });
    list.forEach((p) => addColliders(coll, info.colliders, p));
  });

  // Kabel zwischen Masten / Seilbahnstützen (Kettenlinie)
  const lines = layout.lines || (layout.pylons.length ? [{ idx: layout.pylons, sag: 5 }] : []);
  const gondolaSpots = [];
  for (const line of lines) {
  const pyl = line.idx.map((i) => placements[i]);
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x222426, roughness: 0.5, metalness: 0.6 });
  for (let i = 0; i + 1 < pyl.length; i++) {
    const ca = infos[pyl[i].model]?.cables || [], cb = infos[pyl[i + 1].model]?.cables || [];
    for (let ai = 0; ai < Math.min(ca.length, cb.length); ai++) {
      const pa = local(pyl[i], ca[ai]);
      let pb = local(pyl[i + 1], cb[ai]);
      if (cb.length === 2) { const alt = local(pyl[i + 1], cb[1 - ai]); if (alt.distanceTo(pa) < pb.distanceTo(pa)) pb = alt; }
      const pts = [];
      for (let k = 0; k <= 16; k++) { const t = k / 16; const pt = pa.clone().lerp(pb, t); pt.y -= (line.sag ?? 5) * 4 * t * (1 - t); pts.push(pt); }
      if (line.gondola) for (const t of [0.3, 0.7]) { if ((i + ai) % 2 === (t < 0.5 ? 0 : 1)) { const g = pa.clone().lerp(pb, t); g.y -= (line.sag ?? 5) * 4 * t * (1 - t); gondolaSpots.push(g); } }
      const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.03, 5), cableMat);
      scene.add(m);
      for (let k = 0; k < 16; k++) coll.add({ t: 'seg', a: pts[k], b: pts[k + 1], r: 0.04 });
    }
  }
  }
  if (gondolaSpots.length) {
    const { scene: gs, info: gi } = await loadModel('env/gondola');
    gs.updateMatrixWorld(true);
    gs.traverse((o) => {
      if (!o.isMesh) return;
      const im = new THREE.InstancedMesh(o.geometry, o.material, gondolaSpots.length);
      gondolaSpots.forEach((p, i) => im.setMatrixAt(i, new THREE.Matrix4().makeTranslation(p.x, p.y, p.z).multiply(o.matrixWorld)));
      im.castShadow = true; scene.add(im);
    });
    gondolaSpots.forEach((p) => addColliders(coll, gi.colliders, { x: p.x, y: p.y, z: p.z, yaw: 0, scale: 1 }));
  }

  // Race-Gates
  const gi = infos.gate?.gate;
  const gates = placements.slice(layout.gateStart, layout.gateStart + (layout.props.length - layout.gateStart)).filter((p) => p.model === 'gate').map((p) => {
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.yaw);
    return { center: local(p, gi.center), q, qi: q.clone().invert(), half: gi.half };
  });

  // ---------------------------------------------------------------- Update
  const snap = 180 / (gfx.shadows || 1024);
  const tmpM = new THREE.Matrix4();
  let vegT = 1;
  const updateVeg = (focus) => {
    for (const v of veg) {
      const near = [], far = [];
      const c2 = v.cull * v.cull, l2 = DIST.lod * DIST.lod;
      v.list.forEach((p, i) => {
        const d2 = (p.x - focus.x) ** 2 + (p.z - focus.z) ** 2;
        if (d2 > c2) return;
        (v.lod && d2 > l2 ? far : near).push(i);
      });
      const fill = (parts, idx) => parts && parts.forEach(({ im, local }) => {
        idx.forEach((i, k) => { im.setMatrixAt(k, tmpM.multiplyMatrices(v.mats[i], local)); im.setColorAt(k, v.cols[i]); });
        im.count = idx.length; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
      });
      fill(v.full, near); fill(v.lod, far);
    }
  };
  const update = (dt, focus) => {
    vegT += dt;
    if (vegT > 0.4) { vegT = 0; updateVeg(focus); }
    const f = focus.clone();
    f.x = Math.round(f.x / snap) * snap; f.z = Math.round(f.z / snap) * snap;
    sun.target.position.copy(f);
    sun.position.copy(f).addScaledVector(sunDir, 400);
    if (water) water.material.normalMap.offset.x += dt * 0.004, water.material.normalMap.offset.y += dt * 0.0025;
  };
  progress(1, 'Fertig');
  const spawn = new THREE.Vector3(meta.spawn[0], H(meta.spawn[0], meta.spawn[2]) + 0.05, meta.spawn[2]);
  // Pilot (Goggles + Funke) steht kurz hinter dem Startpunkt und schaut in Flugrichtung
  try {
    const pm = (await loadModel('pilot/pilot')).scene.clone(true);
    const yaw = meta.spawnYaw || 0, back = new THREE.Vector3(0.7, 0, 2.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    const px = spawn.x + back.x, pz = spawn.z + back.z;
    pm.position.set(px, H(px, pz), pz);
    pm.rotation.y = yaw;
    scene.add(pm);
  } catch (e) { console.warn('Pilot-Modell fehlt', e); }
  const dispose = () => {
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      ms.forEach((m) => { Object.values(m).forEach((v) => { if (v && v.isTexture) v.dispose(); }); m.dispose(); });
      if (o.isInstancedMesh) o.dispose();
    });
    [tAlb, tNrm, tOrm, uniforms.tSplatA.value, uniforms.tSplatB.value].forEach((t) => t.dispose());
    envRT.dispose();
    pmrem.dispose();
  };
  return { scene, coll, meta, gates, update, spawn, dispose, spawnYaw: meta.spawnYaw, pilot: new THREE.Vector3(...meta.pilot), H, sunDir };
}

function local(p, v) {
  return new THREE.Vector3(v[0], v[1], v[2]).multiplyScalar(p.scale).applyAxisAngle(new THREE.Vector3(0, 1, 0), p.yaw).add(new THREE.Vector3(p.x, p.y, p.z));
}

let ownerId = 0;
function addColliders(coll, list, p) {
  const owner = ++ownerId;
  const yq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.yaw);
  for (const c of list) {
    const ctr = local(p, c.c);
    if (c.t === 'box') coll.add({ t: 'box', c: ctr, h: new THREE.Vector3(...c.h).multiplyScalar(p.scale), q: yq.clone().multiply(new THREE.Quaternion(...c.q)), owner });
    else if (c.t === 'cyl') coll.add({ t: 'cyl', c: ctr, r: c.r * p.scale, hh: c.hh * p.scale, owner });
    else if (c.t === 'sph') coll.add({ t: 'sph', c: ctr, r: c.r * p.scale, owner });
  }
}

function scatter(out, cfg, meta, H, coll, splatAt) {
  let seed = 1234;
  const R = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const n = new THREE.Vector3();
  const lim = meta.size / 2 - 40;
  const wl = meta.water ?? -1e9;
  const tryPlace = (count, accept, pick) => {
    let placed = 0;
    for (let k = 0; k < count * 8 && placed < count; k++) {
      const x = (R() * 2 - 1) * lim, z = (R() * 2 - 1) * lim;
      if (cfg.exclude(x, z)) continue;
      const h = H(x, z);
      if (h < wl + 1.2) continue;
      coll.normal(x, z, n);
      const s = splatAt(x, z);
      if (!accept(x, z, h, n, s)) continue;
      out.push(pick(x, z, h));
      placed++;
    }
  };
  const ground = (s) => (cfg.anyGround || (s[0] < 0.25 && s[2] < 0.25)) && s[1] < 0.2 && s[3] < 0.2;
  tryPlace(cfg.trees, (x, z, h, nn, s) => ground(s) && nn.y > (cfg.treeSlope ?? 0.8) && h < cfg.treeline + R() * 60 && (s[4] > (cfg.forestCut ?? 0.45) || R() < 0.06), (x, z, h) => {
    const list = cfg.treeModels || ['pine_a', 'pine_a', 'pine_b', 'pine_b', 'pine_c', 'pine_c', 'tree_a', 'tree_b'];
    const model = cfg.treeModels ? list[Math.floor(R() * list.length)] : (h > cfg.treeline * 0.55 || R() < 0.72 ? ['pine_a', 'pine_b', 'pine_c'][Math.floor(R() * 3)] : (R() < 0.5 ? 'tree_a' : 'tree_b'));
    return { model, x, z, y: h - 0.2, yaw: R() * 6.28, scale: 0.75 + R() * 0.6, hue: R() };
  });
  tryPlace(cfg.bushes, (x, z, h, nn, s) => ground(s) && nn.y > 0.75 && h < cfg.treeline && s[4] > 0.3, (x, z, h) => ({ model: cfg.bushModel || 'bush', x, z, y: h - 0.1, yaw: R() * 6.28, scale: 0.6 + R() * 0.9, hue: R() }));
  tryPlace(cfg.rocks, (x, z, h, nn) => nn.y < 0.93 || R() < 0.15, (x, z, h) => ({ model: (cfg.rockModels || ['rock_a', 'rock_b', 'rock_c'])[Math.floor(R() * (cfg.rockModels || [0, 0, 0]).length)], x, z, y: h - 0.3, yaw: R() * 6.28, scale: 0.5 + R() * 1.4, tint: cfg.rockTint }));
}
