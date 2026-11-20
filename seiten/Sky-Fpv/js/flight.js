// Sky FPV – Flugsitzung: Physik-Schleife, Kameras (FPV / Verfolger / Sichtflug), Rennen, OSD
import * as THREE from 'three';
import { DroneSim, buildParams } from './physics.js';
import { assembleDrone } from './drone.js';
import { CRASH } from './settings.js';
import { FlightRecorder } from './replay.js';

const $ = (id) => document.getElementById(id);
const fmt = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${(t % 60).toFixed(2).padStart(5, '0')}`;

export class Flight {
  static async create(app, world, build, mode) {
    const f = new Flight();
    f.app = app; f.world = world; f.build = build; f.mode = mode;
    f.params = buildParams(build, app.frames.frames);
    f.simS = {};
    f.syncSettings();
    f.sim = new DroneSim(f.params, f.simS);
    f.visual = await assembleDrone(build, app.frames, app.settings.uptilt);
    world.scene.add(f.visual.group);
    f.camera = new THREE.PerspectiveCamera(80, innerWidth / innerHeight, 0.03, 6000);
    f.camMode = 'fpv';
    f.chasePos = new THREE.Vector3();
    f.flash = 0; f.flightTime = 0; f.shake = 0;
    f.marker = f.makeMarker();
    f.line = f.makeLine();
    if (f.line) world.scene.add(f.line.mesh);
    f.rec = new FlightRecorder(+app.settings.replaySec || 60);
    world.scene.add(f.marker);
    f.reset();
    return f;
  }

  syncSettings() {
    const s = this.app.settings;
    Object.assign(this.simS, { rates: s.rates, angleMode: s.angleMode, crashSpeed: CRASH[s.crash] ?? 7.5, propDamage: s.propDamage && s.crash !== 'aus', propwash: s.propwash, wind: s.wind, pidScale: s.pidScale });
  }

  makeLine() {
    const gates = this.world.gates;
    if (gates.length < 2) return null;
    // Kontrollpunkte: je Gate vor, in und hinter dem Gate -> die Linie geht gerade durch die Öffnung
    const pts = [];
    gates.forEach((g) => {
      const n = new THREE.Vector3(0, 0, -1).applyQuaternion(g.q);
      [-5, 0, 5].forEach((k) => pts.push(g.center.clone().addScaledVector(n, k)));
    });
    const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal');
    const N = gates.length, step = 2.2;
    const seg = Array.from({ length: N }, () => []);   // seg[k] = Punkte auf dem Weg ZU Gate k
    const p = new THREE.Vector3(), last = new THREE.Vector3(), t0 = new THREE.Vector3();
    for (let i = 0; i < N; i++) {
      const to = (i + 1) % N, ta = (3 * i + 1) / (3 * N), tb = (3 * i + 4) / (3 * N);
      curve.getPoint(ta % 1, last);
      let acc = 0;
      for (let j = 1; j <= 400; j++) {
        const t = ta + (tb - ta) * j / 400;
        curve.getPoint(t % 1, p);
        acc += p.distanceTo(last); last.copy(p);
        if (acc < step) continue;
        acc = 0;
        if (p.distanceTo(gates[to].center) < 1.6 || p.distanceTo(gates[i].center) < 1.6) continue;   // nicht in der Gate-Öffnung
        curve.getTangent(t % 1, t0);
        seg[to].push({ p: p.clone(), t: t0.clone() });
      }
    }
    const max = Math.max(...seg.map((s) => s.length)) * 2 + 4;
    const geo = new THREE.ConeGeometry(0.16, 0.45, 3); geo.rotateX(-Math.PI / 2);   // kleine Pfeile in Flugrichtung
    const mat = new THREE.MeshBasicMaterial({ color: 0x38ff7a, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    const mesh = new THREE.InstancedMesh(geo, mat, max);
    mesh.frustumCulled = false; mesh.count = 0; mesh.renderOrder = 2;
    return { mesh, seg, shown: -1 };
  }

  updateLine(next) {
    const L = this.line;
    if (!L) return;
    L.mesh.visible = !this.race.done && this.app.settings.racingLine !== false;
    if (L.shown === next) return;
    L.shown = next;
    const N = L.seg.length, m = new THREE.Matrix4(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1), fwd = new THREE.Vector3(0, 0, -1);
    let k = 0;
    // Weg zum nächsten Gate + zum übernächsten (vor dem Start: ab Gate 1 weiter)
    for (const g of [next, (next + 1) % N]) {
      for (const d of L.seg[g]) {
        q.setFromUnitVectors(fwd, d.t);
        L.mesh.setMatrixAt(k++, m.compose(d.p, q, one));
      }
    }
    L.mesh.count = k;
    L.mesh.instanceMatrix.needsUpdate = true;
  }

  makeMarker() {
    const g = new THREE.Group();
    const m = new THREE.MeshBasicMaterial({ color: 0x38ff7a, transparent: true, opacity: 0.55, depthWrite: false });
    const s = 1.75, t = 0.05;
    [[0, s / 2, s, t], [0, -s / 2, s, t], [s / 2, 0, t, s], [-s / 2, 0, t, s]].forEach(([x, y, w, h]) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, t), m); b.position.set(x, y, 0); g.add(b);
    });
    const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 4), m);
    arrow.rotation.x = Math.PI; arrow.position.y = s / 2 + 0.9; g.add(arrow);
    g.visible = false;
    return g;
  }

  reset() {
    const w = this.world;
    this.sim.reset(w.spawn.clone().add(new THREE.Vector3(0, 0.08, 0)), w.spawnYaw);
    this.flightTime = 0;
    this.race = { next: 0, lap: 0, start: null, lapStart: 0, laps: [], best: this.app.best(this.world.meta.name), done: false };
    this.prevPos = this.sim.pos.clone();
    this.app.input.armToggle = false;
    this.app.input.turtleToggle = false;
    this.armPrev = true;
    this.chasePos.copy(this.sim.pos).add(new THREE.Vector3(0, 1, 3));
  }

  update(dt) {
    const app = this.app, inp = app.input, s = app.settings, sim = this.sim;
    this.syncSettings();
    if (inp.resetBtn) this.reset();
    if (inp.pressed('KeyC') || inp.cameraSwitch) this.camMode = { fpv: 'chase', chase: 'los', los: 'fpv' }[this.camMode];
    if (inp.pressed('KeyM')) { s.angleMode = !s.angleMode; app.toast(s.angleMode ? 'Angle-Modus (selbststabilisierend)' : 'Acro-Modus'); }
    const o = inp.out;
    this.simS.angleMode = o.angle;
    sim.turtleReq = !!o.turtle;
    // Scharf schalten (nur mit Gas unten)
    this.learnArmSwitch(inp, s);
    let warn = '';
    const ARM_MAX_THR = 0.10;   // Scharfschalten bis 10 % Gas erlaubt
    if (o.arm && (!this.armPrev || this.armBlocked) && !sim.armed) {
      if (o.thr > ARM_MAX_THR) { warn = 'GAS RUNTER ZUM SCHARFSCHALTEN'; this.armBlocked = true; }
      else if (!this.params.flyable) warn = 'DROHNE NICHT FLUGFÄHIG';
      else if (!sim.crashed) { sim.armed = true; this.armBlocked = false; }
    }
    if (!o.arm) { sim.armed = false; this.armBlocked = false; }
    if (o.arm && !sim.armed && o.thr > ARM_MAX_THR && !sim.crashed) warn = 'GAS RUNTER';
    else if (o.arm && !sim.armed && !sim.crashed && this.armPrev && !this.armBlocked) warn = 'ARM-SCHALTER AUS UND WIEDER AN';
    this.armPrev = o.arm;
    if (sim.crashed && !this.wasCrashed) { this.flash = 0.8; this.shake = 1; }
    this.wasCrashed = sim.crashed;

    const h = Math.min(dt, 0.05);
    this.clock = (this.clock || 0) + h;
    this.prevPos.copy(sim.pos);
    // feste 1-kHz-Schleife wie ein echter Flugcontroller (unabhängig von der Bildrate)
    this.acc = Math.min((this.acc || 0) + h, 0.05);
    while (this.acc >= 0.001) { sim.step(0.001, o, this.world.coll); this.acc -= 0.001; }
    if (sim.armed) this.flightTime += h;
    this.rec.tick(h, sim);
    if (sim.impact > 2) this.shake = Math.min(1, this.shake + sim.impact * 0.05);

    // Modell
    const g = this.visual.group;
    g.position.copy(sim.pos); g.quaternion.copy(sim.q);
    this.visual.update(h, sim.omega);
    this.world.update(h, sim.pos);

    // Kamera
    const cam = this.camera;
    const aspect = innerWidth / innerHeight;
    cam.aspect = aspect;
    this.shake *= Math.exp(-h * 4);
    this.flash *= Math.exp(-h * 5);
    let focus = 30, dof = s.dof, fisheye = 0;
    if (this.camMode === 'fpv') {
      g.visible = false;
      cam.position.copy(this.visual.camPos).applyQuaternion(sim.q).add(sim.pos);
      cam.quaternion.copy(sim.q).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), THREE.MathUtils.degToRad(s.uptilt)));
      const vib = (sim.armed ? 0.0006 + o.thr * 0.0012 : 0) + this.shake * 0.02 + Math.min(0.03, sim.vibration * 0.02);
      cam.rotateX((Math.random() - 0.5) * vib); cam.rotateY((Math.random() - 0.5) * vib);
      const hf = THREE.MathUtils.degToRad(s.fov * 0.82);
      cam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(hf / 2) / aspect));
      fisheye = s.fisheye; focus = 18; dof = s.dof * 0.55;
    } else if (this.camMode === 'chase') {
      g.visible = true;
      const yaw = new THREE.Euler().setFromQuaternion(sim.q, 'YXZ').y;
      const want = new THREE.Vector3(0, 0.55, 1.9).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).add(sim.pos);
      this.chasePos.lerp(want, 1 - Math.exp(-h * 6));
      cam.position.copy(this.chasePos);
      cam.lookAt(sim.pos);
      cam.fov = 70;
      focus = cam.position.distanceTo(sim.pos); dof = s.cinematicDof * 0.5;
    } else {
      g.visible = true;
      cam.position.copy(this.world.pilot);
      cam.lookAt(sim.pos);
      const d = cam.position.distanceTo(sim.pos);
      cam.fov = THREE.MathUtils.clamp(2 * THREE.MathUtils.radToDeg(Math.atan(4 / d)), 8, 60);
      focus = d; dof = s.cinematicDof * 0.35;
    }
    cam.updateProjectionMatrix();

    // Analoges Signal
    // Videoverbindung: Reichweite (Freiraumdämpfung) + Abschattung durch Terrain/Gebäude/Bäume
    const dist = sim.pos.distanceTo(this.world.pilot);
    const dig = this.params.digital;
    if ((this._losT = (this._losT || 0) + h) > 0.1) {
      this._losT = 0;
      this._obs = this.world.coll.obstruction(this.world.pilot, sim.pos);
    }
    const range = dig ? 1500 : 850;
    const loss = Math.pow(dist / range, 1.7) + (this._obs || 0) * (dig ? 0.32 : 0.55);
    let q = THREE.MathUtils.clamp(1 - loss, 0, 1);
    // Mehrwege-Flackern: je schlechter das Signal, desto unruhiger
    const t = performance.now() / 1000;
    q -= (1 - q) * 0.35 * (0.5 + 0.5 * Math.sin(t * 7.3) * Math.sin(t * 2.9 + 1.7)) + (1 - q) ** 2 * 0.25 * Math.random();
    q = THREE.MathUtils.clamp(q, 0, 1);
    const target = dig ? (q < 0.35 ? (0.35 - q) / 0.35 : 0) : THREE.MathUtils.clamp((0.92 - q) / 0.92, 0, 1);
    this.sig = THREE.MathUtils.lerp(this.sig ?? 0, target, 1 - Math.exp(-h * (target > (this.sig ?? 0) ? 14 : 4)));
    this.linkQ = q;
    let noise = this.sig;
    if (sim.crashed && !dig) noise = Math.max(noise, 0.2);
    this.fx = { uFocus: focus, uDof: dof, uFisheye: fisheye, uAnalog: (dig || this.camMode !== 'fpv') ? 0 : 1, uNoise: this.camMode === 'fpv' ? noise : 0, uTime: t, uFlash: this.flash, uExposure: 1.0 };

    if (this.mode === 'race') this.updateRace(h);
    this.updateHUD(warn, dist);
  }

  // Arm-Schalter automatisch erkennen: Bewegt sich der zugeordnete Arm-Kanal nie, aber ein anderer
  // Schalter (Achse ab 5 oder Taste) wird umgelegt, wird dieser als Arm-Schalter übernommen.
  learnArmSwitch(inp, s) {
    const raw = inp.raw || [];
    if (!inp.pad || !raw.length || s.armLearned) { this.rawPrev = raw.slice(); return; }
    const am = s.map.arm;
    if (this.rawPrev && this.rawPrev.length === raw.length) {
      if (am.axis >= 0 && Math.abs(raw[am.axis] - this.rawPrev[am.axis]) > 0.6) { s.armLearned = true; this.app.save(); }
      else {
        for (let k = 4; k < raw.length; k++) {
          if (k === am.axis || Math.abs(raw[k] - this.rawPrev[k]) < 1.2) continue;   // nur echte Schalter-Flanken
          if (['mode', 'camera', 'reset', 'turtle', 'clip'].some((n) => s.map[n] && s.map[n].axis === k)) continue;
          am.axis = k; am.inv = raw[k] < 0;   // die Stellung, in die umgelegt wurde = AN
          s.armLearned = true; this.app.save();
          this.armPrev = false;
          this.app.toast(`Arm-Schalter erkannt: ${inp.label(k)} – änderbar unter Einstellungen → Steuerung`);
          break;
        }
      }
    }
    this.rawPrev = raw.slice();
  }

  updateRace() {
    const R = this.race, gates = this.world.gates, sim = this.sim;
    if (!gates.length || R.done) { this.marker.visible = false; if (this.line) this.line.mesh.visible = false; return; }
    const gt = gates[R.next];
    this.marker.visible = true;
    this.marker.position.copy(gt.center);
    this.marker.quaternion.copy(gt.q);
    const a = this.prevPos.clone().sub(gt.center).applyQuaternion(gt.qi);
    const b = sim.pos.clone().sub(gt.center).applyQuaternion(gt.qi);
    if (Math.sign(a.z) !== Math.sign(b.z) && a.z !== 0) {
      const t = a.z / (a.z - b.z);
      const p = a.clone().lerp(b, t);
      if (Math.abs(p.x) < gt.half[0] && Math.abs(p.y) < gt.half[1]) {
        const now = this.clock;
        if (R.next === 0) {
          if (R.start === null) { R.start = now; R.lapStart = now; this.app.toast('Los!'); }
          else {
            const lt = now - R.lapStart; R.laps.push(lt); R.lapStart = now; R.lap++;
            if (R.lap >= 3) {
              R.done = true; const total = now - R.start;
              const nb = this.app.best(this.world.meta.name, total);
              this.app.toast(`Ziel! ${fmt(total)}${nb ? ' – neue Bestzeit!' : ''}`);
              R.best = this.app.best(this.world.meta.name);
            }
          }
        }
        R.next = (R.next + 1) % gates.length;
      }
    }
    this.updateLine(R.start === null && R.next === 0 ? 0 : R.next);
    const el = $('race');
    el.classList.remove('hidden');
    const now = this.clock;
    el.innerHTML = R.start === null ? `Fliege durch <b>Gate 1</b> um zu starten` :
      `Runde <b>${Math.min(R.lap + 1, 3)}/3</b> · Gate <b>${R.next + 1}/${gates.length}</b> · ${fmt(R.done ? R.laps.reduce((x, y) => x + y, 0) : now - R.start)}` +
      (R.best ? ` · Best ${fmt(R.best)}` : '');
  }

  updateHUD(warn, dist) {
    const sim = this.sim, p = this.params;
    const cellV = sim.volt / p.cells;
    const spd = sim.vel.length() * 3.6;
    const alt = sim.pos.y - this.world.spawn.y;
    $('osd-tl').innerHTML = `${sim.volt.toFixed(1)}V <small>${cellV.toFixed(2)}</small><br>${Math.round(sim.used)} mAh<br>${sim.amps.toFixed(0)} A`;
    const lq = Math.round((this.linkQ ?? 1) * 100);
    $('osd-tr').innerHTML = `${fmt(this.flightTime).slice(0, 5)}<br>${this.simS.angleMode ? 'ANGL' : 'ACRO'} · ${this.camMode.toUpperCase()}<br>${p.digital ? 'HD' : 'VID'} ${lq < 25 ? `<span class="blink">${lq}%</span>` : lq + '%'}`;
    $('osd-bl').innerHTML = `THR ${Math.round(this.app.input.out.thr * 100)}%<br>${spd.toFixed(0)} KM/H`;
    $('osd-br').innerHTML = `ALT ${alt.toFixed(1)} M<br>DST ${dist.toFixed(0)} M`;
    let c = '';
    if (sim.turtleActive) c = '<span class="blink">TURTLE</span><br><small>Stick in Kipp-Richtung</small>';
    else if (sim.crashed) c = '<span class="blink">ABSTURZ</span><br><small>R = Reset · T = Turtle</small>';
    else if (!sim.armed) c = 'DISARMED';
    $('osd-center').innerHTML = c;
    const ph = Math.min(...sim.propHealth);
    if (!warn && ph < 0.6) warn = ph < 0.15 ? 'PROP GEBROCHEN' : `PROP BESCHÄDIGT ${Math.round(ph * 100)}%`;
    if (!warn && sim.brownout && sim.armed) warn = 'AKKU TIEFENTLADEN – LANDEN!';
    if (!warn && cellV < 3.4 && sim.armed) warn = 'AKKU LEER';
    $('osd-warn').innerHTML = warn ? `<span class="blink">${warn}</span>` : '';
    // Stick-Anzeige (Mode 2)
    const st = $('sticks');
    st.style.display = this.app.settings.showSticks === false ? 'none' : '';
    const io = this.app.input.out, pos = (el, x, y) => { el.style.left = (50 + x * 50) + '%'; el.style.top = (50 - y * 50) + '%'; };
    pos($('st-l'), io.yaw, io.thr * 2 - 1);
    pos($('st-r'), io.roll, -io.pitch);
    // Seitenpanels: Prop-Zustand, Akku, Höhe
    for (let i = 0; i < 4; i++) {
      const h = sim.propHealth[i];
      const col = h > 0.85 ? '#4fd18b' : h > 0.5 ? '#ffd23f' : h > 0.15 ? '#ff7a1a' : '#ff3030';
      $('pc' + i).setAttribute('fill', col);
      $('pt' + i).textContent = h <= 0.15 ? '✕' : Math.round(h * 100);
    }
    const soc = Math.max(0, Math.min(1, sim.soc));
    const bf = $('batt-fill');
    bf.style.width = soc * 100 + '%';
    bf.style.background = cellV < 3.3 ? '#ff3030' : soc < 0.3 ? '#ffd23f' : '#4fd18b';
    $('batt-info').innerHTML = `${cellV.toFixed(2)} V/Zelle · ${p.cells}S<br>${Math.round(sim.used)} / ${Math.round(p.cap * 1000)} mAh`;
    const agl = sim.pos.y - this.world.coll.groundHeight(sim.pos.x, sim.pos.z);
    // Höhenleiter im Stil eines analogen OSD (Betaflight-Schrift, keine Grafik)
    const a = Math.max(0, agl), base = Math.floor(a / 5) * 5, pad = (v) => String(v).padStart(4, ' ');
    const lines = [];
    for (let k = 3; k >= -2; k--) {
      const v = base + k * 5;
      if (k === 0) lines.push(`▶${a.toFixed(1).padStart(5, ' ')}M`);
      if (v >= 0) lines.push(`${pad(v)} ${v % 10 === 0 ? '──' : '─'}`); else lines.push('');
    }
    $('alt-ladder').textContent = lines.join('\n');
    document.querySelector('.crosshair').style.display = this.camMode === 'fpv' ? '' : 'none';
  }

  dispose() {
    this.world.scene.remove(this.visual.group);
    this.world.scene.remove(this.marker);
    this.marker.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    $('race').classList.add('hidden');
  }
}
