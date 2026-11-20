// Sky FPV – Eingabe: FPV-Funke (USB-Joystick / HID via Gamepad-API), Gamepad, Tastatur
export class Input {
  constructor(settings) {
    this.s = settings;
    this.keys = new Set();
    this.kbThr = 0;
    this.out = { thr: 0, roll: 0, pitch: 0, yaw: 0, arm: false, angle: false, source: 'Tastatur' };
    this.raw = [];
    this.pad = null;
    this.armToggle = false;
    this.edges = new Set();
    addEventListener('keydown', (e) => {
      if (!e.repeat) this.edges.add(e.code); // nicht von 'hängenden' Tasten abhängig
      this.keys.add(e.code);
      if (e.code === 'KeyR' || e.code === 'Backspace') this.onReset && this.onReset();
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'F8'].includes(e.code)) e.preventDefault();
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
    document.addEventListener('visibilitychange', () => this.keys.clear());
  }

  label(i) { return i < (this.nAxes ?? 99) ? `Achse ${i + 1}` : `Taste ${i - this.nAxes + 1}`; }

  pressed(code) { const p = this.edges.has(code); return p; }

  axis(i) {
    const v = this.raw[i] ?? 0;
    const c = this.s.calib[i];
    if (!c) return v;
    const mid = (c.min + c.max) / 2, half = Math.max(1e-3, (c.max - c.min) / 2);
    return Math.max(-1, Math.min(1, (v - mid) / half));
  }

  chan(name) {
    const m = this.s.map[name];
    let v = this.axis(m.axis);
    if (m.inv) v = -v;
    return v;
  }

  poll(dt) {
    const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
    this.pad = pads[0] || null;
    const o = this.out;
    if (this.pad) {
      // Achsen + Tasten (manche Funken melden Schalter/Kanäle als Tasten) als gemeinsame Kanalliste
      this.buttons = this.pad.buttons.map((b) => b.pressed);
      this.nAxes = this.pad.axes.length;
      this.raw = [...this.pad.axes, ...this.buttons.slice(0, 16).map((b) => (b ? 1 : -1))];
      const db = this.s.deadband;
      const d = (v) => (Math.abs(v) < db ? 0 : v);
      o.roll = d(this.chan('roll'));
      o.pitch = d(this.chan('pitch'));
      o.yaw = d(this.chan('yaw'));
      o.thr = (this.chan('throttle') + 1) / 2;
      const am = this.s.map.arm;
      // Arm: zugeordneter Schalter ODER Leertaste (funktioniert auch mit angeschlossener Funke)
      o.arm = (am.axis >= 0 && am.axis < this.raw.length && this.chan('arm') > 0.3) || this.armToggle;
      const mm = this.s.map.mode;
      // Angle-Modus: Schalter (falls zugeordnet) ODER Taste M / Einstellung
      o.angle = (mm.axis >= 0 && mm.axis < this.raw.length && this.chan('mode') > 0.3) || !!this.s.angleMode;
      o.source = this.pad.id.replace(/\(.*?\)/g, '').trim().slice(0, 40) || 'Controller';
      const rb = this.s.map.reset.button;
      // Schalter auf Achsen (z. B. Achse 8 der Funke): Flanke löst Aktion aus
      const sw = (name) => { const m = this.s.map[name]; return m && m.axis >= 0 && m.axis < this.raw.length && this.chan(name) > 0.3; };
      const rs = sw('reset'), cs = sw('camera'), cl = sw('clip');
      this.clipBtn = cl && !this._cl; this._cl = cl;
      o.turtle = sw('turtle') || this.turtleToggle;
      const bp = rb >= 0 && !!this.buttons[rb];
      this.resetBtn = (bp && !this._rb) || (rs && !this._rs);
      this._rb = bp;
      this.cameraSwitch = cs !== !!this._cs && this._cs !== undefined;
      this._rs = rs; this._cs = cs;
    } else {
      const k = this.keys;
      const ax = (a, b) => (k.has(a) ? 1 : 0) - (k.has(b) ? 1 : 0);
      this.kbThr = Math.max(0, Math.min(1, this.kbThr + ax('KeyW', 'KeyS') * dt * 0.8));
      const sm = (cur, tgt) => cur + (tgt - cur) * Math.min(1, dt * 10);
      o.thr = this.kbThr;
      o.yaw = sm(o.yaw, ax('KeyD', 'KeyA') * 0.6);
      o.pitch = sm(o.pitch, ax('ArrowUp', 'ArrowDown') * 0.7);
      o.roll = sm(o.roll, ax('ArrowRight', 'ArrowLeft') * 0.7);
      o.arm = this.armToggle;
      o.angle = this.s.angleMode;
      o.source = 'Tastatur';
      o.turtle = this.turtleToggle;
      this.resetBtn = false;
      this.cameraSwitch = false;
    }
    if (this.edges.has('Space')) this.armToggle = !this.armToggle;
    if (this.edges.has('KeyT')) this.turtleToggle = !this.turtleToggle;
  }

  endFrame() { this.edges.clear(); }
}
