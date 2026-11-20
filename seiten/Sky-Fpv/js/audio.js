// Sky FPV – Ton (Web Audio)
// Motoren: eigene sample-genaue Synthese im AudioWorklet (js/motor-worklet.js) – je Motor
// Blattfrequenz mit Obertönen, Motorpfeifen, zerhacktes Luftrauschen, Unwucht, Wirbelring-Flattern, Doppler.
// Wind: CC0-Loop (gefiltert). Ereignisse: CC0-Sounds (siehe assets/sounds/CREDITS.txt).
const FILES = {
  air: 'air_loop.wav', crash: 'crash.ogg', hit: 'hit.wav', arm: 'arm.ogg',
  disarm: 'disarm.ogg', gate: 'gate.ogg', lap: 'lap.ogg', click: 'click.ogg', glitch: 'glitch.ogg',
};

export class AudioEngine {
  constructor(settings) { this.s = settings; this.ctx = null; this.buf = {}; this.prev = {}; this.glitchT = 0; }

  async init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const ctx = (this.ctx = new AudioContext());
    this.master = ctx.createGain();
    this.master.connect(ctx.destination);
    this.streamDest = ctx.createMediaStreamDestination();   // Spielton für Clips
    this.master.connect(this.streamDest);
    this.setVolume();
    await Promise.all(Object.entries(FILES).map(async ([k, f]) => {
      try { this.buf[k] = await ctx.decodeAudioData(await (await fetch('assets/sounds/' + f)).arrayBuffer()); } catch (e) { console.warn('Sound', f, e); }
    }));
    // Motor-Synthese
    try {
      await ctx.audioWorklet.addModule('js/motor-worklet.js');
      this.motors = new AudioWorkletNode(ctx, 'skyfpv-motors', { outputChannelCount: [2] });
      // leichte "Raum"-Färbung: Hochpass gegen Dröhnen, sanfter Höhenabfall
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 90;
      this.motorLP = ctx.createBiquadFilter(); this.motorLP.type = 'lowpass'; this.motorLP.frequency.value = 9000;
      this.motors.connect(hp).connect(this.motorLP).connect(this.master);
    } catch (e) { console.warn('AudioWorklet nicht verfügbar', e); }
    // Fahrtwind
    if (this.buf.air) {
      const src = ctx.createBufferSource();
      src.buffer = this.buf.air; src.loop = true;
      const flt = ctx.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = 400;
      const g = ctx.createGain(); g.gain.value = 0;
      src.connect(flt).connect(g).connect(this.master);
      src.start(0, Math.random() * src.buffer.duration);
      this.wind = { src, flt, g };
    }
  }

  setVolume() { if (this.master) this.master.gain.value = this.s.volume; }

  play(name, vol = 1, rate = 1) {
    if (!this.ctx || !this.buf[name]) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.buf[name]; src.playbackRate.value = rate;
    const g = this.ctx.createGain(); g.gain.value = vol;
    src.connect(g).connect(this.master);
    src.start();
  }

  send(motors, blades, gain, vrs, doppler) {
    if (this.motors) this.motors.port.postMessage({ motors, blades, gain, vrs, doppler });
  }

  silence() {
    if (!this.ctx) return;
    this.send([0, 1, 2, 3].map(() => ({ f: 0, load: 0, dmg: 0 })), 3, 0, 0, 1);
    if (this.wind) this.wind.g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
  }

  // Wird jeden Frame während des Flugs aufgerufen
  update(f, dt) {
    if (!this.ctx) return;
    this.setVolume();
    const sim = f.sim, p = f.params, t = this.ctx.currentTime;
    const tPer = p.mass * 9.81 * Math.max(2, p.tw) / 4;
    const speed = sim.vel.length();
    // Entfernung + Doppler (Verfolger-/Sichtflug-Kamera)
    let att = 1, doppler = 1;
    if (f.camMode !== 'fpv') {
      const d = sim.pos.clone().sub(f.camera.position);
      const dist = Math.max(0.5, d.length());
      att = f.camMode === 'los' ? 1 / (1 + dist / 10) : 1 / (1 + dist / 6);
      const vr = sim.vel.dot(d.normalize());
      doppler = 343 / (343 + Math.max(-150, Math.min(150, vr)));
    }
    const motors = [0, 1, 2, 3].map((i) => ({
      f: sim.omega[i] / (2 * Math.PI),
      load: Math.min(1, sim.thrust[i] / tPer),
      dmg: 1 - (sim.propHealth ? sim.propHealth[i] : 1),
    }));
    this.send(motors, p.blades || 3, 0.9 * att * (p.D < 0.09 ? 0.8 : 1), sim.vrs || 0, doppler);
    if (this.motorLP) this.motorLP.frequency.setTargetAtTime(f.camMode === 'los' ? 2500 + 6000 * att : 9000, t, 0.1);
    if (this.wind) {
      this.wind.src.playbackRate.setTargetAtTime(0.45 + Math.min(1.5, speed / 45), t, 0.05);
      this.wind.flt.frequency.setTargetAtTime(300 + speed * 25, t, 0.05);
      this.wind.g.gain.setTargetAtTime(Math.min(0.6, (speed / 40) ** 1.5) * (f.camMode === 'los' ? 0.15 : 1), t, 0.05);
    }

    // Ereignisse
    const pv = this.prev;
    if (sim.armed && !pv.armed) this.play('arm', 0.6);
    if (!sim.armed && pv.armed && !sim.crashed) this.play('disarm', 0.5);
    if (sim.propHit) { sim.propHit = false; this.play('hit', 0.6 * att, 1.6 + Math.random() * 0.4); }
    if (sim.crashed && !pv.crashed) this.play('crash', 0.9 * Math.max(att, 0.3), 0.9 + Math.random() * 0.2);
    else if (sim.impact > 1.2 && (pv.impactCd || 0) <= 0) { this.play('hit', Math.min(1, sim.impact / 6) * att, 0.8 + Math.random() * 0.4); pv.impactCd = 0.15; }
    pv.impactCd = (pv.impactCd || 0) - dt;
    if (f.race) {
      if (pv.next !== undefined && f.race.next !== pv.next) this.play(f.race.lap !== pv.lap ? 'lap' : 'gate', 0.7);
      pv.next = f.race.next; pv.lap = f.race.lap;
    }
    // Analoges Rauschen: Störgeräusche im Videoempfänger
    const n = f.fx?.uNoise || 0;
    this.glitchT -= dt;
    if (n > 0.35 && this.glitchT <= 0 && !p.digital) { this.play('glitch', n * 0.35, 0.7 + Math.random() * 0.6); this.glitchT = 0.15 + Math.random() * (1.2 - n); }
    pv.armed = sim.armed; pv.crashed = sim.crashed;
  }
}
