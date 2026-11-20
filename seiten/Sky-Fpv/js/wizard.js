// Sky FPV – Einrichtungs-Assistent für die Funke (überspringbar, Ergebnis wird im Browser gespeichert)
import { DEFAULTS } from './settings.js';

const $ = (id) => document.getElementById(id);
const STEPS = [
  { title: 'Funke einrichten', text: 'Verbinde deine FPV-Funke per USB und wähle an der Funke <b>„USB-Joystick (HID)“</b>. Bewege einen Stick, bis sie unten als verbunden angezeigt wird.', intro: true },
  { title: 'Ausgangsstellung', text: '<b>Gas ganz nach UNTEN</b>, die anderen Sticks in der Mitte lassen, <b>alle Schalter auf AUS</b>. Dann „Weiter“.', base: true },
  { title: 'Kalibrieren', text: 'Bewege jetzt <b>beide Sticks 5 Sekunden lang in vollen Kreisen</b> bis an die Anschläge und lege alle Schalter einmal um.', cal: 5 },
  { title: 'Gas', text: 'Schiebe den <b>GAS-Stick ganz nach OBEN</b> und halte ihn dort.', map: 'throttle' },
  { title: 'Roll', text: 'Gas wieder runter. Drücke den <b>ROLL-Stick ganz nach RECHTS</b> und halte ihn.', map: 'roll' },
  { title: 'Pitch', text: 'Drücke den <b>PITCH-Stick ganz nach VORNE</b> (weg von dir) und halte ihn.', map: 'pitch' },
  { title: 'Yaw', text: 'Drücke den <b>YAW-Stick ganz nach RECHTS</b> und halte ihn.', map: 'yaw' },
  { title: 'Arm-Schalter', text: 'Lege den Schalter zum <b>Scharfschalten auf AN</b>. (Ohne Schalter: überspringen, dann Leertaste.)', map: 'arm', optional: true },
  { title: 'Angle-Schalter', text: 'Optional: Schalter für den <b>Angle-Modus</b> (selbststabilisierend) auf AN.', map: 'mode', optional: true },
  { title: 'Kamera-Schalter', text: 'Optional: Schalter zum <b>Kamera wechseln</b> umlegen (z. B. Kanal 8 deiner Funke – kann als Achse oder Taste erscheinen).', map: 'camera', optional: true },
  { title: 'Reset-Schalter', text: 'Optional: Schalter oder Taste für <b>Reset nach Absturz</b> umlegen.', map: 'reset', optional: true },
  { title: 'Fertig!', text: 'Deine Funke ist eingerichtet. Alles ist in diesem Browser gespeichert und lässt sich unter <b>Einstellungen → Steuerung</b> jederzeit ändern.', done: true },
];

export class Wizard {
  constructor(app) {
    this.app = app;
    $('wz-next').onclick = () => this.next();
    $('wz-skip').onclick = () => this.skipAll();
    $('wz-skipstep').onclick = () => { const st = STEPS[this.i]; if (st.map) this.app.settings.map[st.map].axis = -1; this.go(this.i + 1); };
  }

  start() {
    this.used = new Set(); this.base = null; this.map = structuredClone(this.app.settings.map);
    this.app.show('wizard');
    this.go(0);
  }

  go(i) {
    this.i = i; this.timer = null;
    const st = STEPS[i];
    $('wz-step').textContent = `Schritt ${i + 1} / ${STEPS.length}`;
    $('wz-title').textContent = st.title;
    $('wz-text').innerHTML = st.text;
    $('wz-next').textContent = st.intro ? 'Assistent starten' : st.done ? 'Los geht’s' : st.cal ? 'Kalibrierung starten' : 'Weiter';
    $('wz-skipstep').classList.toggle('hidden', !st.optional);
    $('wz-skip').classList.toggle('hidden', !!st.done);
    $('wz-skip').textContent = st.intro ? 'Überspringen – mit Standard-Einstellungen spielen' : 'Assistent abbrechen (Standard-Einstellungen)';
    $('wz-detect').textContent = '';
  }

  next() {
    const st = STEPS[this.i], s = this.app.settings, inp = this.app.input;
    if (st.intro && !inp.pad) { $('wz-detect').textContent = 'Noch keine Funke erkannt – Stick bewegen oder „Überspringen“ wählen.'; return; }
    if (st.base) { this.base = [...inp.raw]; s.calib = {}; }
    if (st.cal) {
      if (!this.timer) { this.timer = { t: st.cal, mm: {} }; $('wz-next').textContent = 'Läuft …'; }
      return;
    }
    if (st.map) {
      const d = this.detect();
      if (!d) { $('wz-detect').textContent = 'Keine Bewegung erkannt – Stick/Schalter weiter ausgelenkt halten.'; return; }
      s.map[st.map].axis = d.axis; s.map[st.map].inv = d.inv;
      if (st.map === 'arm') s.armLearned = true;
      this.used.add(d.axis);
    }
    if (st.done) { s.setupDone = true; this.app.save(); this.app.show('menu'); this.app.toast('Funke eingerichtet'); return; }
    this.app.save();
    this.go(this.i + 1);
  }

  skipAll() {
    const s = this.app.settings;
    s.map = structuredClone(DEFAULTS.map); s.calib = {}; s.setupDone = true;
    this.app.save();
    this.app.show('menu');
    this.app.toast('Standard-Einstellungen aktiv – änderbar unter Einstellungen → Steuerung');
  }

  // Achse mit der größten Auslenkung gegenüber der Ausgangsstellung
  detect() {
    const raw = this.app.input.raw || [], base = this.base || raw.map(() => 0);
    let best = null;
    raw.forEach((v, i) => {
      if (this.used.has(i)) return;
      const dv = v - (base[i] ?? 0);
      if (Math.abs(dv) > 0.4 && (!best || Math.abs(dv) > Math.abs(best.dv))) best = { axis: i, dv, inv: dv < 0 };
    });
    return best;
  }

  tick(dt) {
    const inp = this.app.input, st = STEPS[this.i];
    $('wz-pad').textContent = inp.pad ? `✔ Verbunden: ${inp.pad.id.slice(0, 60)}` : 'Keine Funke erkannt';
    $('wz-pad').className = inp.pad ? 'ok' : '';
    const raw = inp.raw || [];
    $('wz-axes').innerHTML = raw.map((v, i) => `<span>${inp.label(i)}</span><div class="meter"><i style="left:${(Math.max(-1, Math.min(1, v)) * 0.5 + 0.5) * 100}%"></i></div>`).join('');
    if (this.timer) {
      this.timer.t -= dt;
      raw.forEach((v, i) => { const m = (this.timer.mm[i] ||= { min: v, max: v }); m.min = Math.min(m.min, v); m.max = Math.max(m.max, v); });
      $('wz-detect').textContent = `Kalibriere … ${Math.max(0, this.timer.t).toFixed(1)} s`;
      if (this.timer.t <= 0) {
        Object.entries(this.timer.mm).forEach(([i, m]) => { if (m.max - m.min > 0.3) this.app.settings.calib[i] = m; });
        this.app.save();
        this.go(this.i + 1);
      }
    } else if (st.map) {
      // Automatisch übernehmen, wenn die Auslenkung 1 s lang gehalten wird (Hände bleiben an der Funke)
      const d = this.detect();
      if (d && this.hold && this.hold.axis === d.axis) this.hold.t += dt; else this.hold = d ? { axis: d.axis, t: 0 } : null;
      $('wz-detect').textContent = d ? `Erkannt: ${this.app.input.label(d.axis)}${d.inv ? ' (invertiert)' : ''} – halten … ${Math.max(0, 1 - this.hold.t).toFixed(1)} s` : 'Warte auf Bewegung …';
      if (this.hold && this.hold.t > 1) { this.hold = null; this.next(); }
    }
  }
}
