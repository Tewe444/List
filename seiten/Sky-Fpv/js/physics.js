// Sky FPV – Quadcopter-Physik
// Motor-/Propellermodell (KV, Wicklungswiderstand, Ct/Cp), Akku mit Spannungseinbruch,
// Rate-Regler (PID) mit Airmode-Mixer, Luftwiderstand, Propwash, Bodeneffekt.
import * as THREE from 'three';
import { part } from './parts.js';

const RHO = 1.225, G = 9.81, TAU = Math.PI * 2;
const OCV = [3.27, 3.61, 3.69, 3.71, 3.73, 3.75, 3.77, 3.79, 3.82, 3.87, 3.92, 3.97, 4.03, 4.08, 4.13, 4.2];
const ocv = (soc) => {
  if (soc < 0) return Math.max(2.6, OCV[0] + soc * 3.5); // Tiefentladung: Spannung bricht ein
  const t = Math.min(soc, 1) * 15, i = Math.min(14, Math.floor(t)); return OCV[i] + (OCV[i + 1] - OCV[i]) * (t - i);
};

// Betaflight "Actual"-Rates (Grad/s)
export function actualRate(x, center, max, expo) {
  const a = Math.abs(x);
  const expof = a * (Math.pow(x, 5) * expo + x * (1 - expo));
  return x * center + Math.max(0, max - center) * expof;
}

// ------------------------------------------------------------------ Parameter aus den Bauteilen
export function buildParams(build, frames) {
  const fr = part('frame', build.frame), mo = part('motor', build.motor), pr = part('prop', build.prop);
  const st = part('stack', build.stack), ba = part('battery', build.battery), ca = part('camera', build.camera);
  const ac = part('actioncam', build.actioncam);
  const fd = frames[fr.id];
  const warnings = [];
  if (pr.inch > fd.propMax + 0.05) warnings.push(`Propeller zu groß für den Frame (max. ${fd.propMax}")`);
  if (st.size !== fd.stackSize) warnings.push(`Stack-Lochabstand ${st.size} mm passt nicht (Frame: ${fd.stackSize} mm)`);
  const motorMass = 4 * (mo.mass + pr.mass);
  // + Kleinteile: Empfänger, Kabel, Schrauben, Kondensator, TPU, Akkugurt, Antennen
  const mass = fr.mass + motorMass + st.mass + ba.mass + ca.mass + ac.mass + 0.045;
  const kT = pr.Ct * RHO * Math.pow(pr.D, 4) / (TAU * TAU);
  const kQ = pr.Cp * RHO * Math.pow(pr.D, 5) / (TAU * TAU * TAU);
  const kvRad = mo.kv * TAU / 60;
  const J = mo.J + 0.3 * pr.mass * Math.pow(pr.D / 2, 2);
  const motors = fd.motors.map((m) => new THREE.Vector3(m[0], m[1], m[2]));
  // Schwerpunkt (Akku oben verschiebt ihn nach oben)
  const battY = fd.battery[1] + ba.size[1] / 2;
  const cgY = (ba.mass * battY + motorMass * fd.motors[0][1] + (mass - ba.mass - motorMass) * 0.015) / mass;
  const rel = motors.map((p) => new THREE.Vector3(p.x, p.y - cgY, p.z));
  const arm = fd.armLength;
  const body = mass - motorMass - ba.mass;
  const bw = 0.05, bl = 0.11, bh = 0.03;
  const I = new THREE.Vector3().addScalar(0); const I0 = new THREE.Vector3(
    motorMass * arm * arm / 2 + body * (bh * bh + bl * bl) / 12 + ba.mass * ((ba.size[1] ** 2 + ba.size[2] ** 2) / 12 + (battY - cgY) ** 2),
    motorMass * arm * arm + body * (bw * bw + bl * bl) / 12 + ba.mass * (ba.size[0] ** 2 + ba.size[2] ** 2) / 12,
    motorMass * arm * arm / 2 + body * (bw * bw + bh * bh) / 12 + ba.mass * ((ba.size[0] ** 2 + ba.size[1] ** 2) / 12 + (battY - cgY) ** 2),
  );
  I.copy(I0).multiplyScalar(1.3); // Arme, Kabel, Antennen, Glocken
  const acA = ac.id === 'full' ? 0.0028 : ac.id === 'mini' ? 0.0009 : 0;
  const area = new THREE.Vector3(
    0.004 + ba.size[2] * ba.size[1] + arm * 0.012,           // seitlich
    0.010 + ba.size[0] * ba.size[2] + arm * arm * 0.35,       // oben
    0.003 + ba.size[0] * ba.size[1] + acA + arm * 0.006,      // vorne
  );
  if (fr.id === 'spatz3') area.y += 0.012, area.x += 0.004, area.z += 0.004;
  const p = {
    mass, I, rel, spin: fd.spin, kT, kQ, kvRad, R: mo.R, J, imax: Math.min(mo.imax * 1.4, st.amps * 1.6),
    cells: ba.cells, cap: ba.mah / 1000, rPack: ba.rCell * ba.cells + 0.004, D: pr.D, pitch: pr.P, area,
    digital: ca.digital, propRadius: pr.D / 2, arm, frameId: fr.id, bodyR: Math.max(0.045, arm * 0.45), warnings,
    flyable: warnings.length === 0, blades: /3b/.test(pr.id) ? 3 : 2,
  };
  // Leistungsdaten (statisch, voller Akku unter Last)
  const V = ba.cells * 3.9;
  const wmax = maxOmega(p, V);
  const Tmax = kT * wmax * wmax;
  p.tw = (4 * Tmax) / (mass * G);
  const wh = Math.sqrt(mass * G / 4 / kT);
  const Ihover = Math.max(0, (V * hoverDuty(p, wh, V) - wh / kvRad) / mo.R);
  p.hoverThrottle = hoverDuty(p, wh, V);
  p.hoverAmps = 4 * Ihover * p.hoverThrottle + 0.6;
  p.flightMin = (ba.mah / 1000 * 0.8) / (p.hoverAmps * 2.8) * 60;
  p.topSpeed = Math.min(60, (wmax / TAU) * pr.P * 0.85 * Math.sqrt(Math.max(0.1, 1 - 1 / Math.max(p.tw, 1.01) ** 2)) * 0.9) * 3.6;
  const ampsMax = Math.min(mo.imax * 1.4, (V - wmax / kvRad) / mo.R);
  if (ampsMax > st.amps * 1.25) warnings.push(`ESC überlastet: ~${ampsMax.toFixed(0)} A pro Motor bei ${st.amps} A ESC`);
  if (ba.cells === 6 && mo.kv > 2200) warnings.push('Hohe KV auf 6S – Motoren werden heiß');
  if (mo.id === '1404' && fr.id !== 'spatz3') warnings.push('1404-Motoren sind für diesen Frame viel zu schwach');
  // Echtes Schub/Gewicht unter Last (Spannungseinbruch, Stromgrenzen) per Kurz-Simulation messen
  try {
    const sim = new DroneSim(p, { rates: { roll: { center: 0, max: 0, expo: 0 }, pitch: { center: 0, max: 0, expo: 0 }, yaw: { center: 0, max: 0, expo: 0 } }, angleMode: false, crashSpeed: 1e9, propwash: 0, wind: 0, pidScale: 1 });
    sim.reset(new THREE.Vector3(0, 100, 0), 0); sim.armed = true;
    for (let i = 0; i < 150; i++) { sim.step(0.002, { thr: 1, roll: 0, pitch: 0, yaw: 0 }, null); sim.vel.set(0, 0, 0); }
    p.tw = sim.thrust.reduce((a, b) => a + b, 0) / (mass * G);
    p.maxAmps = sim.amps;
  } catch (e) { /* Formelwert behalten */ }
  if (p.tw < 2) warnings.push('Schub/Gewicht unter 2:1 – träge');
  p.flyable = !warnings.some((w) => w.startsWith('Propeller') || w.startsWith('Stack'));
  return p;
}

function maxOmega(p, V) {
  const a = p.kQ, b = 1 / (p.kvRad * p.kvRad * p.R), c = V / (p.kvRad * p.R);
  return (-b + Math.sqrt(b * b + 4 * a * c)) / (2 * a);
}
function hoverDuty(p, w, V) { return (w / p.kvRad + p.R * p.kQ * w * w * p.kvRad) / V; }

// ------------------------------------------------------------------ Simulation
const _q = new THREE.Quaternion(), _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _m = new THREE.Matrix3();

export class DroneSim {
  constructor(params, settings) {
    this.p = params; this.s = settings;
    this.pos = new THREE.Vector3(); this.vel = new THREE.Vector3();
    this.q = new THREE.Quaternion(); this.w = new THREE.Vector3();
    this.omega = [0, 0, 0, 0]; this.thrust = [0, 0, 0, 0]; this.current = [0, 0, 0, 0];
    this.integ = new THREE.Vector3(); this.wPrev = new THREE.Vector3(); this.dFilt = new THREE.Vector3(); this.gyroF = new THREE.Vector3();
    this.propHealth = [1, 1, 1, 1]; this.propCd = [0, 0, 0, 0]; this.vibration = 0;
    this.spPrev = new THREE.Vector3();
    this.soc = 1; this.used = 0; this.volt = params.cells * 4.2; this.amps = 0;
    this.armed = false; this.crashed = false; this.time = 0; this.pwT = Math.random() * 100;
    this.impact = 0; this.ground = -1e9;
    // Mixer: Thrust/Drehmoment -> Motorschübe (4x4 invertiert)
    const k = params.kQ / params.kT;
    const A = [0, 1, 2, 3].map((i) => [1, -params.rel[i].z, -params.spin[i] * k, params.rel[i].x]);
    // A^T: Zeilen = [F, tx, ty, tz], Spalten = Motoren
    const M = [0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => A[c][r]));
    this.mixInv = invert4(M);
  }

  reset(pos, yaw) {
    this.pos.copy(pos); this.vel.set(0, 0, 0); this.w.set(0, 0, 0);
    this.q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    this.omega.fill(0); this.integ.set(0, 0, 0); this.armed = false; this.crashed = false;
    this.soc = 1; this.used = 0; this.time = 0;
    this.propHealth = [1, 1, 1, 1]; this.propCd = [0, 0, 0, 0]; this.vibration = 0;
    this.gyroF = new THREE.Vector3(); this.wPrev.set(0, 0, 0); this.dFilt.set(0, 0, 0); this.ampsF = 0; this.amps = 0;
  }

  // input: {thr 0..1, roll, pitch, yaw -1..1}, world: Kollisionswelt
  step(dt, input, world) {
    const p = this.p, s = this.s;
    // ---------- Sollwerte
    const sp = _v.set(0, 0, 0);
    const rr = s.rates;
    const rate = (x, a) => THREE.MathUtils.degToRad(actualRate(x, rr[a].center, rr[a].max, rr[a].expo));
    if (s.angleMode) {
      const R = _m.setFromMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(this.q));
      const e = R.elements; // Spalten: x-Achse (0,1,2), y (3,4,5), z (6,7,8)
      const roll = Math.asin(THREE.MathUtils.clamp(-e[1], -1, 1));
      const pitch = Math.asin(THREE.MathUtils.clamp(-e[7], -1, 1));
      const maxA = THREE.MathUtils.degToRad(55);
      sp.z = -(input.roll * maxA - roll) * 7;
      sp.x = (-input.pitch * maxA - pitch) * 7;
    } else {
      sp.z = -rate(input.roll, 'roll');
      sp.x = -rate(input.pitch, 'pitch');
    }
    sp.y = -rate(input.yaw, 'yaw');

    // ---------- Akku
    this.ampsF = (this.ampsF || 0) + (this.amps - (this.ampsF || 0)) * 0.04;
    const rEff = p.rPack * (1 + 2.0 * Math.pow(1 - Math.min(1, Math.max(0, this.soc)), 3) + (this.soc < 0 ? 2 : 0));
    const V = Math.max(0.5, p.cells * ocv(this.soc) - this.ampsF * rEff);
    this.brownout = V / p.cells < 2.9;
    this.volt = V;
    const wmax = maxOmega(p, V);
    const Tmax = p.kT * wmax * wmax;
    const idle = 0.055;
    // Dynamic Idle (Betaflight): Mindestdrehzahl hält die Props unter Last -> weniger Propwash, mehr Kontrolle bei Gas 0
    const Tmin = p.kT * (Math.max(idle, 0.13) * wmax) ** 2;

    // ---------- PID (Ratenregler, Ausgabe = Winkelbeschleunigung)
    const tq = _v2;
    if (this.armed && !this.crashed) {
      // TPA: P/D oberhalb 60 % Gas reduzieren (verhindert Schwingen bei Vollgas)
      const tpa = 1 - 0.3 * THREE.MathUtils.clamp((input.thr - 0.6) / 0.4, 0, 1);
      const kp = 58 * s.pidScale * tpa, ki = 55, kd = 0.45 * tpa, kff = 0.6;
      // Anti-Gravity: I-Anteil bei schnellen Gasänderungen verstärken (Nase bleibt beim Punch stabil)
      this.thrRate = (this.thrRate || 0) * 0.98 + Math.abs(input.thr - (this.thrPrev ?? input.thr)) / dt * 0.02;
      this.thrPrev = input.thr;
      const ag = 1 + THREE.MathUtils.clamp(this.thrRate * 0.5, 0, 1.5);
      const g = this.gyroF;
      const dw = new THREE.Vector3().subVectors(g, this.wPrev).divideScalar(dt);
      this.dFilt.lerp(dw, 0.25);
      this.ffF = (this.ffF || new THREE.Vector3()).lerp(new THREE.Vector3().subVectors(sp, this.spPrev).divideScalar(dt).clampLength(0, 4000), 0.08);
      const ff = this.ffF;   // Feedforward (Sollwert-Ableitung, geglättet) -> sofortiges Anlaufen/Abstoppen
      const err = new THREE.Vector3().subVectors(sp, g);
      // I-Term-Relax: während schneller Sollwertänderungen (Flips/Rolls) kaum integrieren -> kein Nachfedern
      const relax = (r) => 1 / (1 + (Math.abs(r) / 25) ** 2);
      const ie = new THREE.Vector3(err.x * relax(ff.x), err.y * relax(ff.y), err.z * relax(ff.z));
      if (input.thr > 0.02) this.integ.addScaledVector(ie, dt * ag).clampLength(0, 0.8);
      const Ic = p.I.clone().multiplyScalar(0.78); // Modellfehler wie bei echtem Tuning
      tq.set(
        (kp * err.x + ki * this.integ.x - kd * this.dFilt.x + kff * ff.x * 0.12) * Ic.x,
        (kp * 0.7 * err.y + ki * this.integ.y - kd * 0.3 * this.dFilt.y) * Ic.y,
        (kp * err.z + ki * this.integ.z - kd * this.dFilt.z + kff * ff.z * 0.12) * Ic.z,
      );
    } else tq.set(0, 0, 0);
    this.wPrev.copy(this.gyroF); this.spPrev.copy(sp);
    // Gyro mit Tiefpass (~110 Hz) und 1 Schritt Verzögerung -> realistisches Nachlaufen
    this.gyroF.lerp(this.w, 1 - Math.exp(-2 * Math.PI * 110 * dt));

    // ---------- Mixer mit Airmode
    const mi = this.mixInv;
    const delta = [0, 1, 2, 3].map((i) => mi[i][1] * tq.x + mi[i][2] * tq.y + mi[i][3] * tq.z);
    let lo = Math.min(...delta), hi = Math.max(...delta);
    const span = Tmax - Tmin;
    if (hi - lo > span) { const f = span / (hi - lo); for (let i = 0; i < 4; i++) delta[i] *= f; lo *= f; hi *= f; }
    const thrC = idle + (1 - idle) * THREE.MathUtils.clamp(input.thr, 0, 1);
    let base = p.kT * (thrC * wmax) ** 2;
    if (this.armed && !this.crashed) base = THREE.MathUtils.clamp(base, Tmin - lo, Tmax - hi);

    // ---------- Motoren
    let thrustSum = 0, ampsSum = 0, yawQ = 0;
    const tauBody = new THREE.Vector3();
    const upB = _v.set(0, 1, 0).applyQuaternion(this.q);
    const vin = this.vel.dot(upB);
    // Wirbelring / Propwash: Sinken in den eigenen Abwind (bezogen auf die induzierte Geschwindigkeit)
    const diskA = 4 * Math.PI * (p.D / 2) ** 2;
    const vh = Math.sqrt(Math.max(this.thrustSum || p.mass * G, 0.1) / (2 * RHO * diskA));
    const latV = Math.sqrt(Math.max(0, this.vel.lengthSq() - vin * vin));
    const dr = -vin / vh;
    // Wirbelring nur bei mäßigem Schub: wer mit viel Leistung durch den Abwind drückt, kommt sofort heraus
    const pushOut = THREE.MathUtils.clamp(1.6 - (this.thrustSum || 0) / (p.mass * G), 0, 1);
    const vrs = Math.exp(-(((dr - 0.9) / 0.55) ** 2)) * THREE.MathUtils.clamp(1 - latV / (1.2 * vh + 1), 0, 1) * pushOut * s.propwash;
    this.vrs = vrs;
    this.pwT += dt;
    for (let i = 0; i < 4; i++) {
      let duty = 0;
      if (this.armed && !this.crashed) {
        const Ti = THREE.MathUtils.clamp(base + delta[i], Tmin, Tmax);
        const wd = Math.sqrt(Ti / p.kT);
        duty = THREE.MathUtils.clamp((wd / p.kvRad + p.R * p.kQ * wd * wd * p.kvRad) / V, idle, 1);
        if (this.brownout) duty *= 0.4 + 0.6 * Math.random(); // ESC/FC-Brownout bei leerem Akku
      }
      const w = this.omega[i];
      let I = (duty * V - w / p.kvRad) / p.R;
      I = THREE.MathUtils.clamp(I, (this.armed && !this.crashed) ? -p.imax * 0.35 : 0, p.imax);
      const Q = p.kQ * w * w;
      this.omega[i] = Math.max(0, w + ((I / p.kvRad) - Q - 1.5e-7 * w) / p.J * dt);
      const n = this.omega[i] / TAU;
      // Einstrom: Steigen kostet Schub; Sinken gibt KEINEN Bonus (in den eigenen Abwind)
      const inflow = THREE.MathUtils.clamp(1 - vin / (n * p.pitch * 1.1 + 2), 0, 1.0);
      // Beschädigter Prop: weniger Schub + Unwucht
      const ph = this.propHealth[i];
      const tt = this.pwT, nz = Math.sin(tt * (11 + i * 3.7) + i * 1.9) * 0.6 + Math.sin(tt * (23 + i * 5.3) + i * 4.1) * 0.4;
      const rev = this.turtleActive && this.turtleRev && this.turtleRev[i] ? -1 : 1;   // Turtle: Prop dreht rückwärts
      const T = rev * p.kT * this.omega[i] ** 2 * (rev > 0 ? inflow : 1) * (0.25 + 0.75 * ph) * (1 - vrs * (0.1 + 0.14 * nz));
      this.thrust[i] = T; this.current[i] = Math.max(0, I);
      thrustSum += T; ampsSum += Math.max(0, I * duty);
      const r = p.rel[i];
      tauBody.x += -r.z * T; tauBody.z += r.x * T;
      yawQ += -p.spin[i] * Q;
    }
    tauBody.y += yawQ;
    // Turtle-Mode (Betaflight): auf dem Rücken liegend laufen die Motoren einer Seite rückwärts
    // und drücken diese Seite hoch -> die Drohne kippt in Stick-Richtung wieder auf die Füße.
    const upW = _v.set(0, 1, 0).applyQuaternion(this.q);
    this.turtleActive = !!(this.turtleReq && (!this.armed || this.crashed) && upW.y < 0.05 && Math.min(...this.propHealth) > 0.15);   // nur bis über den Kipppunkt
    this.turtleRev = [false, false, false, false];
    if (this.turtleActive) {
      // Motoren auf der Gegenseite zur Stick-Richtung laufen rückwärts (Schub kehrt sich im Motor-Modell um)
      const sx = input.roll, sz = -input.pitch, mag = Math.min(1, Math.hypot(sx, sz));
      for (let i = 0; i < 4; i++) {
        const r = p.rel[i], rl = Math.hypot(r.x, r.z);
        const w = mag > 0.05 ? Math.max(0, -(sx * r.x + sz * r.z) / (rl * mag)) : 0;
        this.turtleRev[i] = w > 0.1;
        // Schub je Motor ~ 0,8 x Gewicht bei vollem Stick -> gleiches Verhalten bei allen Builds
        const slow = THREE.MathUtils.clamp(1 - this.w.length() / 7, 0.15, 1);   // nicht überschlagen
        if (w > 0.1) this.omega[i] = Math.min(maxOmega(p, V), Math.sqrt(0.8 * p.mass * G * w * mag * slow / p.kT));
      }
    }
    // Unwucht durch verbogene Props -> Vibration (rotiert mit der Drehzahl)
    let vib = 0;
    for (let i = 0; i < 4; i++) {
      const dmg = 1 - this.propHealth[i];
      if (dmg <= 0) continue;
      const ang = this.time * this.omega[i] * p.spin[i];
      const f = dmg * p.kT * this.omega[i] ** 2 * 0.06;
      tauBody.x += f * Math.sin(ang) * p.arm; tauBody.z += f * Math.cos(ang) * p.arm;
      vib += dmg * this.omega[i] / 4000;
    }
    this.vibration = vib;
    this.amps = ampsSum + 0.6;
    this.used += this.amps * dt / 3.6;
    this.soc = Math.max(-0.25, 1 - this.used / 1000 / p.cap);

    // ---------- Propwash & Bodeneffekt
    const hg = this.pos.y - this.ground;
    const ge = 1 + 0.3 * Math.max(0, 1 - hg / (p.D * 3)) ** 2;
    this.thrustSum = thrustSum;
    thrustSum *= ge;

    // ---------- Kräfte
    const qi = _q.copy(this.q).invert();
    const vb = this.vel.clone().applyQuaternion(qi);
    if (s.wind > 0) {
      const t = this.time;
      vb.sub(new THREE.Vector3(Math.sin(t * 0.3) * s.wind, Math.sin(t * 1.7) * s.wind * 0.2, Math.cos(t * 0.23) * s.wind * 0.6).applyQuaternion(qi));
    }
    const ws = this.omega[0] + this.omega[1] + this.omega[2] + this.omega[3];
    // Luftwiderstand (CdA je Körperachse) + Rotorscheiben-Widerstand bei vertikaler Anströmung
    const disk = 4 * Math.PI * (p.D / 2) ** 2 * (ws > 400 ? 0.1 : 0.05);
    const spd = vb.length();
    const mixv = (c) => 0.5 * Math.abs(c) + 0.5 * spd;   // Kopplung: schräge Anströmung erzeugt Plattenkräfte
    const fb = new THREE.Vector3(
      -0.5 * RHO * 2.0 * p.area.x * mixv(vb.x) * vb.x,
      -0.5 * RHO * (1.15 * p.area.y + disk) * mixv(vb.y) * vb.y + thrustSum,
      -0.5 * RHO * 2.2 * p.area.z * mixv(vb.z) * vb.z,
    );
    // Blattschlagen: im schnellen Vorwärtsflug neigt sich die Rotorebene zurück -> Aufbäumen
    const kf = 2.5e-5 * (p.D / 0.127) * thrustSum;   // klein halten: starres Blatt, nur leichtes Aufbäumen
    const vx = THREE.MathUtils.clamp(vb.x, -35, 35), vz = THREE.MathUtils.clamp(vb.z, -35, 35);
    tauBody.x += -kf * vz; tauBody.z += kf * vx;
    // H-Kraft: Rotoren bremsen seitliche Bewegung (Grip in Kurven)
    const kh = 1.5e-5 * (p.D / 0.127) ** 2;
    fb.x -= kh * ws * vb.x; fb.z -= kh * ws * vb.z;
    const F = fb.applyQuaternion(this.q);
    F.y -= p.mass * G;
    this.vel.addScaledVector(F, dt / p.mass);
    this.pos.addScaledVector(this.vel, dt);

    // ---------- Rotation (Euler-Gleichungen, Körperkoordinaten)
    const Iw = new THREE.Vector3(p.I.x * this.w.x, p.I.y * this.w.y, p.I.z * this.w.z);
    const gyro = new THREE.Vector3().crossVectors(this.w, Iw);
    tauBody.sub(gyro).addScaledVector(this.w, -0.0006 * (p.arm / 0.11));
    // Kreiselmoment der drehenden Rotoren
    const Lr = p.J * (p.spin[0] * this.omega[0] + p.spin[1] * this.omega[1] + p.spin[2] * this.omega[2] + p.spin[3] * this.omega[3]);
    tauBody.x += this.w.z * Lr; tauBody.z += -this.w.x * Lr;
    this.w.x += tauBody.x / p.I.x * dt;
    this.w.y += tauBody.y / p.I.y * dt;
    this.w.z += tauBody.z / p.I.z * dt;
    const wq = new THREE.Quaternion(this.w.x * dt * 0.5, this.w.y * dt * 0.5, this.w.z * dt * 0.5, 0);
    const dq = this.q.clone().multiply(wq);
    this.q.set(this.q.x + dq.x, this.q.y + dq.y, this.q.z + dq.z, this.q.w + dq.w).normalize();

    if (world) this.collide(world);
    // wieder auf den Füßen -> Absturz aufgehoben, neu scharfschalten möglich
    if (this.crashed && this.turtleReq && _v.set(0, 1, 0).applyQuaternion(this.q).y > 0.7 && this.vel.length() < 1.5) this.crashed = false;
    this.time += dt;
  }

  collide(world) {
    const p = this.p;
    const pts = [[0, 0, 0, p.bodyR]];
    for (const r of p.rel) pts.push([r.x, r.y + 0.008, r.z, p.propRadius * 0.85]);
    const R = new THREE.Matrix4().makeRotationFromQuaternion(this.q);
    const Rm = new THREE.Matrix3().setFromMatrix4(R);
    const Iinv = new THREE.Matrix3().set(1 / p.I.x, 0, 0, 0, 1 / p.I.y, 0, 0, 0, 1 / p.I.z);
    const IinvW = Rm.clone().multiply(Iinv).multiply(Rm.clone().transpose());
    const wW = this.w.clone().applyQuaternion(this.q);
    let maxImpact = 0;
    this.ground = world.groundHeight(this.pos.x, this.pos.z);
    const upW = new THREE.Vector3(0, 1, 0).applyQuaternion(this.q);
    for (let i = 0; i < 4; i++) this.propCd[i] -= 1 / 500;
    for (let pi = 0; pi < pts.length; pi++) {
      const [x, y, z, rad] = pts[pi];
      const r = new THREE.Vector3(x, y, z).applyQuaternion(this.q);
      const c = r.clone().add(this.pos);
      const contacts = world.contacts(c, rad);
      for (const ct of contacts) {
        const n = ct.n;
        this.pos.addScaledVector(n, ct.depth * 0.9);
        const vp = this.vel.clone().add(new THREE.Vector3().crossVectors(wW, r));
        const vn = vp.dot(n);
        if (vn >= 0) continue;
        maxImpact = Math.max(maxImpact, -vn);
        // Prop trifft etwas: verbiegt/bricht je nach Aufprall und Drehzahl
        if (pi > 0 && this.s.propDamage && !ct.water && !(this.propCd[pi - 1] > 0)) {
          const k = pi - 1;
          const side = Math.abs(n.dot(upW)) < 0.6;   // Treffer in der Propellerebene (Kante/Wand/Ast)
          const hit = side ? (-vn) * 0.05 + this.omega[k] / 14000 : Math.max(0, (-vn - 4) * 0.05);
          if (hit > 0.02) { this.propHealth[k] = Math.max(0, this.propHealth[k] - hit); this.propCd[k] = 0.12; this.propHit = true; }
        }
        if (ct.water) { this.crashed = true; this.vel.multiplyScalar(0.2); continue; }
        const rn = new THREE.Vector3().crossVectors(r, n);
        const k = 1 / p.mass + n.dot(new THREE.Vector3().crossVectors(rn.clone().applyMatrix3(IinvW), r));
        const e = Math.abs(vn) > 2 ? 0.25 : 0.05;
        const jn = -(1 + e) * vn / k;
        const vt = vp.clone().addScaledVector(n, -vn);
        const vtl = vt.length();
        const imp = n.clone().multiplyScalar(jn);
        if (vtl > 1e-4) imp.addScaledVector(vt, -Math.min(0.6 * jn, vtl / k) / vtl);
        this.vel.addScaledVector(imp, 1 / p.mass);
        wW.add(new THREE.Vector3().crossVectors(r, imp).applyMatrix3(IinvW));
      }
    }
    this.w.copy(wW.applyQuaternion(this.q.clone().invert()));
    this.impact = maxImpact;
    if (this.armed && maxImpact > this.s.crashSpeed) this.crashed = true;
  }
}

function invert4(m) {
  const n = 4, a = m.map((r, i) => [...r, ...[0, 1, 2, 3].map((j) => (i === j ? 1 : 0))]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[piv][c])) piv = r;
    [a[c], a[piv]] = [a[piv], a[c]];
    const d = a[c][c];
    for (let j = 0; j < 2 * n; j++) a[c][j] /= d;
    for (let r = 0; r < n; r++) if (r !== c) { const f = a[r][c]; for (let j = 0; j < 2 * n; j++) a[r][j] -= f * a[c][j]; }
  }
  return a.map((r) => r.slice(n));
}
