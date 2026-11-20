// Sky FPV – Multiplayer über den eigenen Server (server.py): ~15 Updates/s per HTTP,
// andere Piloten erscheinen mit ihrer gebauten Drohne, Namen und Prop-Animation.
import * as THREE from 'three';
import { assembleDrone } from './drone.js';

const $ = (id) => document.getElementById(id);

function label(text) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const g = c.getContext('2d');
  g.font = 'bold 34px Rajdhani, sans-serif';
  g.textAlign = 'center';
  g.lineWidth = 6; g.strokeStyle = 'rgba(0,0,0,.8)'; g.fillStyle = '#ffb35c';
  g.strokeText(text, 128, 44); g.fillText(text, 128, 44);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
  s.scale.set(1.6, 0.4, 1);
  s.renderOrder = 10;
  return s;
}

export class Multiplayer {
  constructor(app) {
    this.app = app;
    const s = (app.settings.mp ||= { on: false, name: 'Pilot' + Math.floor(Math.random() * 900 + 100), room: 'sky' });
    this.id = Math.random().toString(36).slice(2, 10);
    this.peers = new Map();
    this.t = 0; this.busy = false; this.n = 1; this.err = '';
    $('mp-on').checked = s.on;
    $('mp-name').value = s.name;
    $('mp-room').value = s.room;
    $('mp-on').onchange = (e) => { s.on = e.target.checked; app.save(); if (!s.on) this.clear(); this.status(); };
    $('mp-name').onchange = (e) => { s.name = e.target.value.slice(0, 20) || 'Pilot'; app.save(); };
    $('mp-room').onchange = (e) => { s.room = e.target.value.slice(0, 32) || 'sky'; app.save(); this.clear(); };
    fetch('/mp/info').then((r) => r.json()).then((d) => {
      this.info = d.ips.map((ip) => `http://${ip}:${d.port}`);
      this.status();
    }).catch(() => { this.info = null; this.status(); });
  }

  status() {
    const s = this.app.settings.mp;
    const el = $('mp-status');
    if (!this.info) { el.innerHTML = 'Multiplayer braucht den Sky-FPV-Server (start.bat).'; return; }
    el.innerHTML = s.on
      ? `Online in Raum <b>${s.room}</b> · ${this.n} Pilot${this.n === 1 ? '' : 'en'}${this.err ? ` · <span class="warn">${this.err}</span>` : ''}<br>Freunde im selben Netz öffnen: ${this.info.map((u) => `<b>${u}</b>`).join(' oder ')}`
      : 'Aus. Haken setzen, um mit Freunden in derselben Karte zu fliegen.';
  }

  clear() {
    for (const p of this.peers.values()) if (p.obj) p.obj.parent?.remove(p.obj);
    this.peers.clear();
  }

  // Aufruf jeden Frame während des Flugs
  update(dt, flight) {
    const s = this.app.settings.mp;
    if (!s.on || !this.info) return;
    this.t += dt;
    if (this.t > 0.066 && !this.busy) {
      this.t = 0;
      this.busy = true;
      const sim = flight.sim, b = flight.build;
      const msg = {
        id: this.id, name: s.name, room: s.room, map: this.app.worldId,
        build: { frame: b.frame, motor: b.motor, prop: b.prop, stack: b.stack, battery: b.battery, camera: b.camera, actioncam: b.actioncam, colors: b.colors || {} },
        p: [sim.pos.x, sim.pos.y, sim.pos.z], q: [sim.q.x, sim.q.y, sim.q.z, sim.q.w], v: [sim.vel.x, sim.vel.y, sim.vel.z],
        w: sim.omega.map((x) => Math.round(x)), crashed: sim.crashed,
      };
      fetch('/mp/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(msg) })
        .then((r) => r.json()).then((d) => { this.err = ''; this.n = d.n; this.receive(d.peers, flight); })
        .catch(() => { this.err = 'Server nicht erreichbar'; })
        .finally(() => { this.busy = false; this.status(); });
    }
    // Interpolation + Props
    for (const p of this.peers.values()) {
      if (!p.obj) continue;
      p.pos.addScaledVector(p.vel, dt);
      p.obj.position.lerp(p.pos, 1 - Math.exp(-dt * 12));
      p.obj.quaternion.slerp(p.q, 1 - Math.exp(-dt * 12));
      p.visual.update(dt, p.w);
    }
  }

  async receive(list, flight) {
    const seen = new Set();
    for (const d of list) {
      if (d.map !== this.app.worldId) continue;
      seen.add(d.id);
      let p = this.peers.get(d.id);
      if (!p) {
        p = { pos: new THREE.Vector3(...d.p), q: new THREE.Quaternion(...d.q), vel: new THREE.Vector3(), w: [0, 0, 0, 0], loading: true };
        this.peers.set(d.id, p);
        try {
          p.visual = await assembleDrone(d.build, this.app.frames, 25);
          p.obj = new THREE.Group();
          p.obj.add(p.visual.group);
          const lb = label(d.name);
          lb.position.y = 0.35;
          p.obj.add(lb);
          p.obj.position.copy(p.pos);
          flight.world.scene.add(p.obj);
        } catch (e) { console.warn('Multiplayer-Drohne', e); }
        p.loading = false;
      }
      p.pos.set(...d.p); p.q.set(...d.q); p.vel.set(...(d.v || [0, 0, 0])); p.w = d.w || [0, 0, 0, 0];
    }
    for (const [id, p] of this.peers) if (!seen.has(id) && !p.loading) { if (p.obj) p.obj.parent?.remove(p.obj); this.peers.delete(id); }
  }
}
