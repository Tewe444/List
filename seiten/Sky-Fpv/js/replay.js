// Sky FPV – Replays: Flugdaten-Aufzeichnung (letzte 60 s), Clip-Bibliothek (IndexedDB),
// Wiedergabe mit Spectator-Kamera (Frei / FPV / Verfolger / Orbit), Zeitlupe, Zeitleiste und MP4-Export.
import * as THREE from 'three';
import { assembleDrone } from './drone.js';
import { pickMime, extOf, download, stamp } from './clips.js';

const RATE = 60, KEEP = 60, F = 13;   // je Sample: t, pos(3), quat(4), Motordrehzahlen(4), Flags
const $ = (id) => document.getElementById(id);
const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;

// ------------------------------------------------------------------ Aufzeichnung (Ringpuffer)
export class FlightRecorder {
  constructor(keep = KEEP) { this.cap = RATE * keep; this.buf = new Float32Array(this.cap * F); this.n = 0; this.head = 0; this.acc = 0; this.t = 0; }
  tick(dt, sim) {
    this.t += dt; this.acc += dt;
    if (this.acc < 1 / RATE) return;
    this.acc -= 1 / RATE;
    const o = this.head * F, b = this.buf;
    b[o] = this.t;
    b[o + 1] = sim.pos.x; b[o + 2] = sim.pos.y; b[o + 3] = sim.pos.z;
    b[o + 4] = sim.q.x; b[o + 5] = sim.q.y; b[o + 6] = sim.q.z; b[o + 7] = sim.q.w;
    for (let i = 0; i < 4; i++) b[o + 8 + i] = sim.omega[i];
    b[o + 12] = (sim.armed ? 1 : 0) + (sim.crashed ? 2 : 0);
    this.head = (this.head + 1) % this.cap;
    this.n = Math.min(this.n + 1, this.cap);
  }
  // Länge ändern (Einstellung), vorhandene Aufzeichnung bleibt soweit möglich erhalten
  resize(keep) {
    const old = this.snapshot(), cap = RATE * keep, n = Math.min(old.length / F, cap);
    this.cap = cap; this.buf = new Float32Array(cap * F);
    this.buf.set(old.subarray(old.length - n * F));
    this.n = n; this.head = n % cap;
  }
  snapshot() {
    const out = new Float32Array(this.n * F);
    const start = (this.head - this.n + this.cap) % this.cap;
    for (let k = 0; k < this.n; k++) out.set(this.buf.subarray(((start + k) % this.cap) * F, ((start + k) % this.cap) * F + F), k * F);
    const t0 = out[0];
    for (let k = 0; k < this.n; k++) out[k * F] -= t0;
    return out;
  }
}

// ------------------------------------------------------------------ Bibliothek (IndexedDB, nur in diesem Browser)
function db() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('skyfpv', 2);
    r.onupgradeneeded = () => {
      const d = r.result;
      if (!d.objectStoreNames.contains('clips')) d.createObjectStore('clips', { keyPath: 'id' });
      if (!d.objectStoreNames.contains('videos')) d.createObjectStore('videos', { keyPath: 'id' });
    };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
const tx = async (mode, fn, store = 'clips') => { const d = await db(); return new Promise((res, rej) => { const t = d.transaction(store, mode); const st = t.objectStore(store); const r = fn(st); t.oncomplete = () => res(r && r.result); t.onerror = () => rej(t.error); }); };
export const ClipLib = {
  save: (c) => tx('readwrite', (s) => s.put(c)),
  list: async () => ((await tx('readonly', (s) => s.getAll())) || []).sort((a, b) => b.id - a.id),
  del: (id) => tx('readwrite', (s) => s.delete(id)),
};
// zuletzt gespeicherte MP4-Aufnahmen (max. 10) – im Spiel abspielbar, erneut herunterladbar
export const VideoLib = {
  async save(v) {
    await tx('readwrite', (s) => s.put(v), 'videos');
    const all = await this.list();
    for (const old of all.slice(10)) await this.del(old.id);
  },
  list: async () => ((await tx('readonly', (s) => s.getAll(), 'videos')) || []).sort((a, b) => b.id - a.id),
  del: (id) => tx('readwrite', (s) => s.delete(id), 'videos'),
};

// kleines Vorschaubild vom aktuellen Spielbild
export function thumbOf(canvas) {
  const c = document.createElement('canvas');
  c.width = 192; c.height = 108;
  const g = c.getContext('2d');
  const s = Math.max(192 / canvas.width, 108 / canvas.height);
  g.drawImage(canvas, (192 - canvas.width * s) / 2, (108 - canvas.height * s) / 2, canvas.width * s, canvas.height * s);
  return c.toDataURL('image/jpeg', 0.72);
}

// ------------------------------------------------------------------ Wiedergabe
export class ReplayPlayer {
  static async open(app, clip) {
    const r = new ReplayPlayer();
    r.app = app; r.clip = clip;
    r.data = new Float32Array(clip.data);
    r.n = r.data.length / F;
    r.dur = r.data[(r.n - 1) * F];
    await app.loadMap(clip.map);
    r.world = app.world;
    r.visual = await assembleDrone(clip.build, app.frames, app.settings.uptilt);
    r.world.scene.add(r.visual.group);
    r.camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.03, 6000);
    r.t = 0; r.playing = true; r.speed = 1; r.mode = 'free';
    r.inPt = 0; r.outPt = r.dur;
    const s0 = r.sample(0);
    r.free = { pos: s0.pos.clone().add(new THREE.Vector3(0, 2, 6)), yaw: 0, pitch: -0.2, v: new THREE.Vector3() };
    r.orbitA = 0; r.chase = s0.pos.clone();
    r.keys = new Set();
    r.bind();
    r.ui();
    return r;
  }

  sample(t) {
    const d = this.data, f = Math.max(0, Math.min(this.n - 1.001, t * RATE));
    const i = Math.floor(f), a = f - i, o = i * F, p = (i + 1) * F;
    const pos = new THREE.Vector3(d[o + 1] + (d[p + 1] - d[o + 1]) * a, d[o + 2] + (d[p + 2] - d[o + 2]) * a, d[o + 3] + (d[p + 3] - d[o + 3]) * a);
    const q = new THREE.Quaternion(d[o + 4], d[o + 5], d[o + 6], d[o + 7]).slerp(new THREE.Quaternion(d[p + 4], d[p + 5], d[p + 6], d[p + 7]), a);
    const w = [0, 1, 2, 3].map((k) => d[o + 8 + k] + (d[p + 8 + k] - d[o + 8 + k]) * a);
    return { pos, q, w, crashed: (d[o + 12] & 2) > 0 };
  }

  // ---- Eingaben (Spectator-Kamera): WASD/QE fliegen, Shift schneller, Maus ziehen = umsehen, Rad = Tempo
  bind() {
    const c = this.app.renderer.r.domElement;
    this.onKey = (e) => { if (e.type === 'keydown') this.keys.add(e.code); else this.keys.delete(e.code); if (e.type === 'keydown' && e.code === 'Space') { this.toggle(); e.preventDefault(); } };
    this.onDown = (e) => { this.drag = { x: e.clientX, y: e.clientY }; };
    this.onMove = (e) => {
      if (!this.drag) return;
      const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y;
      this.drag = { x: e.clientX, y: e.clientY };
      if (this.mode === 'orbit') { this.orbitA -= dx * 0.005; this.orbitH = THREE.MathUtils.clamp((this.orbitH ?? 0.3) + dy * 0.004, -0.3, 1.3); return; }
      this.free.yaw -= dx * 0.004; this.free.pitch = THREE.MathUtils.clamp(this.free.pitch - dy * 0.004, -1.5, 1.5);
    };
    this.onUp = () => { this.drag = null; };
    this.onWheel = (e) => { this.flySpeed = THREE.MathUtils.clamp((this.flySpeed || 8) * (e.deltaY > 0 ? 0.85 : 1.18), 1, 60); };
    addEventListener('keydown', this.onKey); addEventListener('keyup', this.onKey);
    c.addEventListener('pointerdown', this.onDown); addEventListener('pointermove', this.onMove); addEventListener('pointerup', this.onUp);
    c.addEventListener('wheel', this.onWheel, { passive: true });
  }

  ui() {
    $('rp-title').textContent = `${this.clip.mapTitle} · ${new Date(this.clip.id).toLocaleString('de-DE')} · ${this.clip.buildName}`;
    const tl = $('rp-time');
    tl.max = this.dur; tl.step = 1 / RATE; tl.value = 0;
    tl.oninput = () => { this.t = +tl.value; };
    $('rp-play').onclick = () => this.toggle();
    $('rp-speed').value = '1';
    $('rp-speed').onchange = (e) => { this.speed = +e.target.value; };
    document.querySelectorAll('#replay [data-cam]').forEach((b) => (b.onclick = () => this.setMode(b.dataset.cam)));
    $('rp-in').onclick = () => { this.inPt = Math.min(this.t, this.outPt - 0.5); this.marks(); };
    $('rp-out').onclick = () => { this.outPt = Math.max(this.t, this.inPt + 0.5); this.marks(); };
    $('rp-export').onclick = () => this.export();
    $('rp-back').onclick = () => this.app.closeReplay();
    this.setMode('free');
    this.marks();
  }

  setMode(m) {
    if (m === 'free' && this.mode !== 'free') {   // freie Kamera dort starten, wo die aktuelle Kamera ist
      this.free.pos.copy(this.camera.position);
      const e = new THREE.Euler().setFromQuaternion(this.camera.quaternion, 'YXZ');
      this.free.yaw = e.y; this.free.pitch = e.x;
    }
    this.mode = m;
    document.querySelectorAll('#replay [data-cam]').forEach((b) => b.classList.toggle('on', b.dataset.cam === m));
  }

  marks() {
    $('rp-range').style.left = (this.inPt / this.dur * 100) + '%';
    $('rp-range').style.width = ((this.outPt - this.inPt) / this.dur * 100) + '%';
    $('rp-marks').textContent = `Export: ${fmt(this.inPt)} – ${fmt(this.outPt)} (${(this.outPt - this.inPt).toFixed(1)} s)`;
  }

  toggle() { this.playing = !this.playing; if (this.playing && this.t >= this.dur - 0.01) this.t = 0; }

  update(dt) {
    if (this.playing) {
      this.t += dt * this.speed;
      if (this.exporting && this.t >= this.outPt) { this.finishExport(); }
      if (this.t >= this.dur) { this.t = this.dur; this.playing = false; }
    }
    $('rp-play').textContent = this.playing ? '⏸' : '▶';
    if (document.activeElement !== $('rp-time')) $('rp-time').value = this.t;
    $('rp-clock').textContent = `${fmt(this.t)} / ${fmt(this.dur)}`;
    const s = this.sample(this.t);
    const g = this.visual.group;
    g.position.copy(s.pos); g.quaternion.copy(s.q);
    this.visual.update(dt * this.speed, this.playing ? s.w : s.w.map(() => 0));
    this.world.update(dt, s.pos);
    const cam = this.camera, set = this.app.settings;
    cam.aspect = innerWidth / innerHeight;
    let fx = { uFocus: 10, uDof: set.cinematicDof * 0.35, uFisheye: 0, uAnalog: 0, uNoise: 0, uFlash: 0, uExposure: 1, uTime: performance.now() / 1000 };
    g.visible = this.mode !== 'fpv';
    if (this.mode === 'free') {
      const k = this.keys, f = this.free, sp = (this.flySpeed || 8) * (k.has('ShiftLeft') || k.has('ShiftRight') ? 3 : 1);
      const fwd = new THREE.Vector3(-Math.sin(f.yaw) * Math.cos(f.pitch), Math.sin(f.pitch), -Math.cos(f.yaw) * Math.cos(f.pitch));
      const right = new THREE.Vector3(Math.cos(f.yaw), 0, -Math.sin(f.yaw));
      const want = new THREE.Vector3();
      if (k.has('KeyW')) want.add(fwd); if (k.has('KeyS')) want.sub(fwd);
      if (k.has('KeyD')) want.add(right); if (k.has('KeyA')) want.sub(right);
      if (k.has('KeyE')) want.y += 1; if (k.has('KeyQ')) want.y -= 1;
      // Funke als Kamera-Steuerung (Mode 2): rechter Stick bewegen, linker Stick hoch/runter + drehen
      const o = this.app.input.out;
      if (this.app.input.pad) {
        want.addScaledVector(fwd, o.pitch).addScaledVector(right, o.roll); want.y += (o.thr - 0.5) * 2;
        f.yaw -= o.yaw * dt * 1.6;
      }
      f.v.lerp(want.multiplyScalar(sp), 1 - Math.exp(-dt * 5));
      f.pos.addScaledVector(f.v, dt);
      const gh = this.world.coll.groundHeight(f.pos.x, f.pos.z) + 0.3;
      if (f.pos.y < gh) f.pos.y = gh;
      cam.position.copy(f.pos);
      cam.quaternion.setFromEuler(new THREE.Euler(f.pitch, f.yaw, 0, 'YXZ'));
      cam.fov = 70;
      fx.uFocus = cam.position.distanceTo(s.pos);
    } else if (this.mode === 'fpv') {
      cam.position.copy(this.visual.camPos).applyQuaternion(s.q).add(s.pos);
      cam.quaternion.copy(s.q).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), THREE.MathUtils.degToRad(set.uptilt)));
      const hf = THREE.MathUtils.degToRad(set.fov * 0.82);
      cam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(hf / 2) / cam.aspect));
      fx = { ...fx, uFocus: 18, uDof: set.dof * 0.55, uFisheye: set.fisheye };
    } else if (this.mode === 'chase') {
      const yaw = new THREE.Euler().setFromQuaternion(s.q, 'YXZ').y;
      const want = new THREE.Vector3(0, 0.55, 1.9).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).add(s.pos);
      this.chase.lerp(want, 1 - Math.exp(-dt * 6 * Math.max(this.speed, 0.25)));
      cam.position.copy(this.chase); cam.lookAt(s.pos); cam.fov = 70;
      fx.uFocus = cam.position.distanceTo(s.pos);
    } else {
      if (this.playing && !this.drag) this.orbitA += dt * 0.25;
      const r = 3.5, h = this.orbitH ?? 0.3;
      cam.position.set(s.pos.x + Math.cos(this.orbitA) * r * Math.cos(h), s.pos.y + Math.sin(h) * r, s.pos.z + Math.sin(this.orbitA) * r * Math.cos(h));
      cam.lookAt(s.pos); cam.fov = 60;
      fx.uFocus = r;
    }
    cam.updateProjectionMatrix();
    this.fx = fx;
    // Ton
    const d = Math.max(0.5, cam.position.distanceTo(s.pos));
    const att = this.mode === 'fpv' ? 1 : 1 / (1 + d / 8);
    const p = this.blades || (this.blades = /3b/.test(this.clip.build.prop) ? 3 : 2);
    this.app.audio.send(s.w.map((x) => ({ f: this.playing ? x / (2 * Math.PI) * this.speed : 0, load: 0.5, dmg: 0 })), p, 0.9 * att, 0, 1);
  }

  // ---- Export: gewählten Abschnitt mit der aktuellen Kamera als MP4 aufnehmen
  export() {
    if (this.exporting) return;
    const mime = pickMime();
    if (!mime) { this.app.toast('Videoaufnahme wird von diesem Browser nicht unterstützt'); return; }
    const stream = this.app.renderer.r.domElement.captureStream(60);
    const ad = this.app.audio.streamDest;
    if (ad) ad.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
    this.chunks = [];
    this.mr = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 16e6 });
    this.mr.ondataavailable = (e) => { if (e.data.size) this.chunks.push(e.data); };
    this.mr.onstop = () => {
      const blob = new Blob(this.chunks, { type: mime.split(';')[0] });
      download(blob, `SkyFPV_Replay_${this.clip.map}_${stamp()}.${extOf(mime)}`);
      this.app.toast('Export fertig – Video gespeichert');
    };
    this.t = this.inPt; this.playing = true; this.exporting = true;
    this.mr.start(500);
    $('replay').classList.add('exporting');
    $('rp-export').textContent = 'Exportiere …';
  }

  finishExport() {
    this.exporting = false; this.playing = false;
    try { this.mr.stop(); } catch (e) { /* */ }
    $('replay').classList.remove('exporting');
    $('rp-export').textContent = 'Exportieren (MP4)';
  }

  dispose() {
    if (this.exporting) this.finishExport();
    this.world.scene.remove(this.visual.group);
    removeEventListener('keydown', this.onKey); removeEventListener('keyup', this.onKey);
    const c = this.app.renderer.r.domElement;
    c.removeEventListener('pointerdown', this.onDown); removeEventListener('pointermove', this.onMove); removeEventListener('pointerup', this.onUp);
    c.removeEventListener('wheel', this.onWheel);
    this.app.audio.silence();
  }
}
