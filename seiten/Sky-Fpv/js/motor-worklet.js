// Sky FPV – Motor-Synthese im Audio-Thread (AudioWorklet)
// Pro Motor: Blattfrequenz mit Obertönen (Propeller-Brummen), Motorpfeifen (elektrische Frequenz),
// rotierendes Luftrauschen (vom Blatt "zerhackt"), Unwucht-Rattern bei beschädigten Props,
// Flattern im Wirbelring. Werte kommen ~60x pro Sekunde vom Spiel und werden geglättet.
class MotorProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.m = [0, 1, 2, 3].map((i) => ({ f: 0, ft: 0, load: 0, lt: 0, dmg: 0, ph: Math.random(), pe: Math.random(), lp: 0, hp: 0, hpx: 0, det: 1 + (i - 1.5) * 0.004 }));
    this.blades = 3; this.gain = 0; this.gt = 0; this.vrs = 0; this.doppler = 1; this.lpOut = 0; this.t = 0;
    this.port.onmessage = (e) => {
      const d = e.data;
      d.motors.forEach((mm, i) => { this.m[i].ft = mm.f; this.m[i].lt = mm.load; this.m[i].dmg = mm.dmg; });
      this.blades = d.blades; this.gt = d.gain; this.vrs = d.vrs; this.doppler = d.doppler;
    };
  }

  process(_in, outputs) {
    const out = outputs[0][0];
    const sr = sampleRate, ny = sr * 0.45;
    const sm = 1 - Math.exp(-1 / (sr * 0.012));    // ~12 ms Glättung
    for (let n = 0; n < out.length; n++) {
      this.gain += (this.gt - this.gain) * sm;
      this.t += 1 / sr;
      let s = 0;
      for (const m of this.m) {
        m.f += (m.ft - m.f) * sm;
        m.load += (m.lt - m.load) * sm;
        const fr = m.f * this.doppler * m.det;
        if (fr < 2) continue;
        m.ph = (m.ph + fr / sr) % 1;
        const bp = (m.ph * this.blades) % 1;
        const fb = fr * this.blades;
        // Propeller: Obertonreihe der Blattfrequenz (bandbegrenzt)
        let tone = 0;
        for (let k = 1; k <= 7; k++) {
          if (fb * k > ny) break;
          tone += Math.sin(6.2831853 * k * bp) / Math.pow(k, 1.15);
        }
        // Unwucht / beschädigter Prop: Amplitudenmodulation mit der Drehfrequenz
        const am = 1 + (0.08 + m.dmg * 0.9) * Math.sin(6.2831853 * m.ph) + this.vrs * 0.5 * Math.sin(6.2831853 * this.t * (9 + fr * 0.002));
        // Motorpfeifen: elektrische Frequenz (7 Polpaare), leise, lastabhängig
        m.pe = (m.pe + fr * 7 / sr) % 1;
        const whine = fr * 7 < ny ? Math.sin(6.2831853 * m.pe + 0.6 * Math.sin(6.2831853 * bp)) : 0;
        // Luftrauschen, vom Blatt zerhackt
        const wn = Math.random() * 2 - 1;
        const a = Math.min(0.95, fb * 6 / sr);
        m.lp += (wn - m.lp) * a;
        const hpv = m.lp - m.hpx; m.hpx += hpv * 0.02;
        const chop = 0.55 + 0.45 * Math.sin(3.14159 * bp) ** 2;
        const air = hpv * chop;
        const level = Math.min(1, fr / 120);
        s += level * ((0.35 + 0.65 * m.load) * tone * 0.22 * am + whine * (0.02 + 0.05 * m.load) + air * (0.12 + 0.5 * m.load + this.vrs * 0.3));
      }
      s *= this.gain;
      this.lpOut += (s - this.lpOut) * 0.6;
      out[n] = Math.tanh(this.lpOut * 1.4) * 0.8;
    }
    for (let c = 1; c < outputs[0].length; c++) outputs[0][c].set(out);
    return true;
  }
}
registerProcessor('skyfpv-motors', MotorProcessor);
