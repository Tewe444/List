// Sky FPV – Kollisionswelt: Heightfield-Terrain, Wasser, Boxen (OBB), Zylinder, Kugeln, Kabel (Kapseln)
import * as THREE from 'three';

const CELL = 8;
const _l = new THREE.Vector3(), _d = new THREE.Vector3(), _qi = new THREE.Quaternion();

export class CollisionWorld {
  constructor(heights, res, size, water) {
    this.h = heights; this.res = res; this.size = size; this.water = water;
    this.grid = new Map(); this.list = []; this.stamp = 0;
  }

  height(x, z) {
    const n = this.res - 1, s = this.size;
    const fx = THREE.MathUtils.clamp((x + s / 2) / s * n, 0, n - 1e-4);
    const fz = THREE.MathUtils.clamp((z + s / 2) / s * n, 0, n - 1e-4);
    const i = Math.floor(fx), j = Math.floor(fz), tx = fx - i, tz = fz - j, h = this.h, r = this.res;
    const a = h[j * r + i], b = h[j * r + i + 1], c = h[(j + 1) * r + i], d = h[(j + 1) * r + i + 1];
    return (a * (1 - tx) + b * tx) * (1 - tz) + (c * (1 - tx) + d * tx) * tz;
  }

  normal(x, z, out = new THREE.Vector3()) {
    const e = 1.0;
    return out.set(this.height(x - e, z) - this.height(x + e, z), 2 * e, this.height(x, z - e) - this.height(x, z + e)).normalize();
  }

  groundHeight(x, z) {
    let h = this.height(x, z);
    if (this.water !== null && this.water !== undefined) h = Math.max(h, this.water);
    return h;
  }

  add(c) {
    // c: {t:'box', c:Vector3, h:Vector3, q:Quaternion} | {t:'cyl', c, r, hh} | {t:'sph', c, r} | {t:'seg', a, b, r}
    let min, max;
    if (c.t === 'box') {
      const ext = new THREE.Vector3();
      const m = new THREE.Matrix4().makeRotationFromQuaternion(c.q).elements;
      ext.set(
        Math.abs(m[0]) * c.h.x + Math.abs(m[4]) * c.h.y + Math.abs(m[8]) * c.h.z,
        Math.abs(m[1]) * c.h.x + Math.abs(m[5]) * c.h.y + Math.abs(m[9]) * c.h.z,
        Math.abs(m[2]) * c.h.x + Math.abs(m[6]) * c.h.y + Math.abs(m[10]) * c.h.z);
      min = c.c.clone().sub(ext); max = c.c.clone().add(ext);
      c.qi = c.q.clone().invert();
    } else if (c.t === 'cyl') {
      min = new THREE.Vector3(c.c.x - c.r, c.c.y - c.hh, c.c.z - c.r); max = new THREE.Vector3(c.c.x + c.r, c.c.y + c.hh, c.c.z + c.r);
    } else if (c.t === 'sph') {
      min = c.c.clone().subScalar(c.r); max = c.c.clone().addScalar(c.r);
    } else {
      min = c.a.clone().min(c.b).subScalar(c.r); max = c.a.clone().max(c.b).addScalar(c.r);
    }
    c.min = min; c.max = max; c.s = 0; c.y0 = min.y; c.y1 = max.y;
    this.list.push(c);
    for (let i = Math.floor(min.x / CELL); i <= Math.floor(max.x / CELL); i++)
      for (let k = Math.floor(min.z / CELL); k <= Math.floor(max.z / CELL); k++) {
        const key = i * 100003 + k;
        let b = this.grid.get(key);
        if (!b) this.grid.set(key, (b = []));
        b.push(c);
      }
  }

  contacts(p, r) {
    const out = [];
    const th = this.height(p.x, p.z);
    if (p.y - r < th) {
      const n = this.normal(p.x, p.z);
      out.push({ n, depth: (th + r - p.y) * n.y });
    }
    if (this.water !== null && this.water !== undefined && p.y - r < this.water) out.push({ n: new THREE.Vector3(0, 1, 0), depth: 0, water: true });
    this.stamp++;
    for (let i = Math.floor((p.x - r) / CELL); i <= Math.floor((p.x + r) / CELL); i++)
      for (let k = Math.floor((p.z - r) / CELL); k <= Math.floor((p.z + r) / CELL); k++) {
        const b = this.grid.get(i * 100003 + k);
        if (!b) continue;
        for (const c of b) {
          if (c.s === this.stamp) continue;
          c.s = this.stamp;
          if (p.y + r < c.y0 || p.y - r > c.y1) continue;
          const ct = this.test(c, p, r);
          if (ct) out.push(ct);
        }
      }
    return out;
  }

  test(c, p, r) {
    if (c.t === 'box') {
      _l.copy(p).sub(c.c).applyQuaternion(c.qi);
      const h = c.h;
      const cx = THREE.MathUtils.clamp(_l.x, -h.x, h.x), cy = THREE.MathUtils.clamp(_l.y, -h.y, h.y), cz = THREE.MathUtils.clamp(_l.z, -h.z, h.z);
      _d.set(_l.x - cx, _l.y - cy, _l.z - cz);
      const d = _d.length();
      if (d > r) return null;
      if (d > 1e-6) return { n: _d.divideScalar(d).applyQuaternion(c.q).clone(), depth: r - d };
      const px = h.x - Math.abs(_l.x), py = h.y - Math.abs(_l.y), pz = h.z - Math.abs(_l.z);
      const n = new THREE.Vector3();
      if (px < py && px < pz) n.x = Math.sign(_l.x) || 1; else if (py < pz) n.y = Math.sign(_l.y) || 1; else n.z = Math.sign(_l.z) || 1;
      return { n: n.applyQuaternion(c.q), depth: Math.min(px, py, pz) + r };
    }
    if (c.t === 'cyl') {
      const dx = p.x - c.c.x, dz = p.z - c.c.z, dh = Math.hypot(dx, dz);
      const dy = p.y - c.c.y;
      const qy = THREE.MathUtils.clamp(dy, -c.hh, c.hh);
      const rad = Math.min(dh, c.r);
      const nx = dh > 1e-6 ? dx / dh : 1, nz = dh > 1e-6 ? dz / dh : 0;
      _d.set(dx - nx * rad, dy - qy, dz - nz * rad);
      const d = _d.length();
      if (d > r) return null;
      if (d > 1e-6) return { n: _d.divideScalar(d).clone(), depth: r - d };
      const side = c.r - dh, vert = c.hh - Math.abs(dy);
      if (side < vert) return { n: new THREE.Vector3(nx, 0, nz), depth: side + r };
      return { n: new THREE.Vector3(0, Math.sign(dy) || 1, 0), depth: vert + r };
    }
    if (c.t === 'sph') {
      _d.copy(p).sub(c.c);
      const d = _d.length();
      if (d > r + c.r) return null;
      return { n: d > 1e-6 ? _d.divideScalar(d).clone() : new THREE.Vector3(0, 1, 0), depth: r + c.r - d };
    }
    // Kapsel (Kabel)
    const ab = _l.copy(c.b).sub(c.a);
    const t = THREE.MathUtils.clamp(_d.copy(p).sub(c.a).dot(ab) / ab.lengthSq(), 0, 1);
    _d.copy(c.a).addScaledVector(ab, t);
    const v = p.clone().sub(_d), d = v.length();
    if (d > r + c.r) return null;
    return { n: d > 1e-6 ? v.divideScalar(d) : new THREE.Vector3(0, 1, 0), depth: r + c.r - d };
  }

  // Funkdämpfung entlang der Sichtlinie Pilot -> Drohne (dB-ähnliches Maß):
  // Terrain dämpft stark, Gebäude/Container/Masten mittel, Bäume leicht.
  obstruction(a, b) {
    const len = a.distanceTo(b);
    const steps = Math.min(400, Math.max(8, Math.ceil(len / (CELL * 0.5))));
    const p = new THREE.Vector3();
    let terrain = 0, solid = 0;
    const seen = new Set(), hitOwners = new Set();
    for (let i = 1; i < steps; i++) {
      p.lerpVectors(a, b, i / steps);
      if (p.y < this.height(p.x, p.z) - 0.5) terrain++;
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
        const bucket = this.grid.get((Math.floor(p.x / CELL) + dx) * 100003 + Math.floor(p.z / CELL) + dz);
        if (!bucket) continue;
        for (const c of bucket) {
          if (seen.has(c) || c.t === 'seg' || (c.owner && hitOwners.has(c.owner))) continue;
          seen.add(c);
          if (segHit(c, a, b)) { solid += c.t === 'box' ? 1 : c.t === 'sph' ? 0.35 : 0.25; if (c.owner) hitOwners.add(c.owner); }
        }
      }
    }
    return Math.min(1, terrain / steps * 6) * 1.4 + Math.min(1.0, solid * 0.16);
  }
}

// Exakter Schnitttest Strecke a-b gegen Kollider (für die Funk-Abschattung)
const _a = new THREE.Vector3(), _b = new THREE.Vector3();
function segHit(c, a, b) {
  if (c.t === 'box') {
    _a.copy(a).sub(c.c).applyQuaternion(c.qi);
    _b.copy(b).sub(c.c).applyQuaternion(c.qi);
    let t0 = 0, t1 = 1;
    for (const k of ['x', 'y', 'z']) {
      const d = _b[k] - _a[k], h = c.h[k];
      if (Math.abs(d) < 1e-9) { if (Math.abs(_a[k]) > h) return false; continue; }
      let u = (-h - _a[k]) / d, v = (h - _a[k]) / d;
      if (u > v) [u, v] = [v, u];
      t0 = Math.max(t0, u); t1 = Math.min(t1, v);
      if (t0 > t1) return false;
    }
    return true;
  }
  // Zylinder (vertikal) & Kugel: Abstand Strecke–Mittelpunkt
  const ab = _b.copy(b).sub(a);
  const t = THREE.MathUtils.clamp(_a.copy(c.c).sub(a).dot(ab) / ab.lengthSq(), 0, 1);
  const q = _a.copy(a).addScaledVector(ab, t);
  if (c.t === 'sph') return q.distanceTo(c.c) < c.r;
  return Math.hypot(q.x - c.c.x, q.z - c.c.z) < c.r && Math.abs(q.y - c.c.y) < c.hh;
}

