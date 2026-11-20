// Sky FPV – Einstellungs-Oberfläche (Funke einrichten, Rates, Kamera, Grafik, Physik)
import { actualRate } from './physics.js';
import { QUALITY } from './settings.js';

const $ = (id) => document.getElementById(id);
const CH = [['roll', 'Roll'], ['pitch', 'Pitch'], ['throttle', 'Gas'], ['yaw', 'Yaw'], ['arm', 'Arm-Schalter'], ['mode', 'Angle-Schalter'], ['reset', 'Reset-Schalter'], ['camera', 'Kamera-Schalter'], ['turtle', 'Turtle-Schalter'], ['clip', 'Clip speichern']];

export class SettingsUI {
  constructor(app) {
    this.app = app; this.tab = 'ctrl'; this.cal = null;
    $('set-tabs').querySelectorAll('button').forEach((b) => (b.onclick = () => {
      this.tab = b.dataset.tab;
      $('set-tabs').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
      this.render();
    }));
  }

  slider(label, obj, key, min, max, step, fmt = (v) => v, after) {
    const id = 's' + Math.random().toString(36).slice(2);
    setTimeout(() => {
      const el = $(id), v = $(id + 'v');
      if (!el) return;
      el.oninput = () => { obj[key] = +el.value; v.textContent = fmt(obj[key]); this.app.save(); after && after(); };
    });
    return `<label>${label}</label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${obj[key]}"><span class="v" id="${id}v">${fmt(obj[key])}</span>`;
  }

  select(label, obj, key, opts, after) {
    const id = 's' + Math.random().toString(36).slice(2);
    setTimeout(() => { if ($(id)) $(id).onchange = (e) => { obj[key] = e.target.value; this.app.save(); after && after(); }; });
    return `<label>${label}</label><select id="${id}">${opts.map(([v, t]) => `<option value="${v}" ${String(v) === String(obj[key]) ? 'selected' : ''}>${t}</option>`).join('')}</select><span></span>`;
  }

  render() {
    const s = this.app.settings, body = $('set-body');
    if (this.tab === 'ctrl') {
      const axOpts = (sel) => ['<option value="-1">–</option>', ...Array.from({ length: Math.max(16, (this.app.input.raw || []).length) }, (_, i) => `<option value="${i}" ${i === sel ? 'selected' : ''}>${this.app.input.label(i)}</option>`)].join('');
      body.innerHTML = `<p class="note">FPV-Funke per USB anschließen und im Menü der Funke <b>„USB Joystick (HID)“</b> wählen (EdgeTX/OpenTX: „Joystick“). Ohne Funke: Tastatur (W/S Gas, A/D Yaw, Pfeile Pitch/Roll) oder Gamepad.</p>
        <div class="row"><b id="pad-name">–</b><button id="btn-wizard">Einrichtungs-Assistent</button></div>
        <h3>Kanalzuordnung</h3>
        ${CH.map(([k, t]) => `<div class="chan"><span>${t}</span><select data-ch="${k}">${axOpts(s.map[k].axis)}</select><label><input type="checkbox" data-inv="${k}" ${s.map[k].inv ? 'checked' : ''}> invert</label><div class="meter"><i id="m-${k}"></i></div></div>`).join('')}
        <div id="map-conflict" class="conflict"></div>
        <div class="row"><button id="btn-cal">Kalibrieren</button><span class="note" id="cal-note">Klicken, dann alle Sticks 5 Sekunden lang voll im Kreis bewegen und Schalter umlegen.</span></div>
        <h3>Rohe Achsen</h3><div class="axes" id="raw-axes"></div>
        <h3>Feinheiten</h3><div class="set-grid">${this.slider('Deadband', s, 'deadband', 0, 0.08, 0.005, (v) => v.toFixed(3))}</div>`;
      body.querySelectorAll('[data-ch]').forEach((el) => (el.onchange = () => { s.map[el.dataset.ch].axis = +el.value; if (el.dataset.ch === 'arm') s.armLearned = true; this.app.save(); }));
      body.querySelectorAll('[data-inv]').forEach((el) => (el.onchange = () => { s.map[el.dataset.inv].inv = el.checked; this.app.save(); }));
      $('btn-cal').onclick = () => { this.cal = { t: 5, mm: {} }; };
      $('btn-wizard').onclick = () => this.app.wizard.start();
    } else if (this.tab === 'rates') {
      body.innerHTML = `<p class="note">Betaflight „Actual“-Rates: Mitten-Empfindlichkeit, Maximalrate (°/s) und Expo.</p>
        <div class="cols"><div class="set-grid" style="grid-template-columns:160px 1fr 60px">
        ${['roll', 'pitch', 'yaw'].map((a) => `<h3 style="grid-column:1/-1">${a.toUpperCase()}</h3>` +
          this.slider('Center', s.rates[a], 'center', 50, 500, 5, (v) => v, () => this.curve()) +
          this.slider('Max Rate', s.rates[a], 'max', 200, 1800, 10, (v) => v, () => this.curve()) +
          this.slider('Expo', s.rates[a], 'expo', 0, 1, 0.01, (v) => v.toFixed(2), () => this.curve())).join('')}
        </div><div><canvas class="curve" id="rate-curve" width="420" height="300"></canvas></div></div>`;
      setTimeout(() => this.curve());
    } else if (this.tab === 'cam') {
      body.innerHTML = `<div class="set-grid">
        ${this.slider('Kamera-Uptilt', s, 'uptilt', 0, 60, 1, (v) => v + '°')}
        ${this.slider('Sichtfeld (horizontal)', s, 'fov', 80, 150, 1, (v) => v + '°')}
        ${this.slider('Weitwinkel-Verzerrung', s, 'fisheye', 0, 1.2, 0.05, (v) => v.toFixed(2))}
        ${this.slider('Tiefenschärfe FPV', s, 'dof', 0, 1, 0.05, (v) => v.toFixed(2))}
        ${this.slider('Tiefenschärfe Verfolger', s, 'cinematicDof', 0, 1, 0.05, (v) => v.toFixed(2))}</div>`;
    } else if (this.tab === 'gfx') {
      body.innerHTML = `<div class="set-grid">
        ${this.select('Qualität', s, 'quality', Object.keys(QUALITY).map((k) => [k, k[0].toUpperCase() + k.slice(1)]), () => { this.app.renderer.setScale(s.renderScale * QUALITY[s.quality].pixelRatio); this.app.toast('Wird beim nächsten Kartenstart übernommen'); })}
        ${this.slider('Renderauflösung', s, 'renderScale', 0.5, 1.5, 0.05, (v) => Math.round(v * 100) + ' %', () => this.app.renderer.setScale(s.renderScale * QUALITY[s.quality].pixelRatio))}
        ${this.select('Performance-Modus', s, 'perfMode', [['false', 'Aus'], ['true', 'An']], () => { s.perfMode = s.perfMode === true || s.perfMode === 'true'; this.app.renderer.perf = s.perfMode; this.app.renderer.resize(); this.app.save(); this.app.toast(s.perfMode ? 'Performance-Modus an – greift ab dem nächsten Kartenstart voll' : 'Performance-Modus aus'); })}
        ${this.slider('Ziel-FPS (dynamische Auflösung)', s, 'targetFps', 30, 144, 1, (v) => v)}
        ${this.select('Stick-Anzeige im HUD', s, 'showSticks', [['true', 'An'], ['false', 'Aus']], () => { s.showSticks = s.showSticks === true || s.showSticks === 'true'; this.app.save(); })}
        ${this.slider('Lautstärke', s, 'volume', 0, 1, 0.05, (v) => Math.round(v * 100) + ' %')}
        ${this.select('Replay-Länge (F8 speichert die letzten …)', s, 'replaySec', [['60', '1 Minute'], ['300', '5 Minuten'], ['600', '10 Minuten']], () => { s.replaySec = +s.replaySec; this.app.save(); if (this.app.flight) this.app.flight.rec.resize?.(s.replaySec); })}
        ${this.select('Clips (F8 = letzte Minute)', s, 'clips', [['true', 'An'], ['false', 'Aus']], () => { s.clips = s.clips === true || s.clips === 'true'; this.app.save(); if (!s.clips) this.app.clips.stop(); })}</div>
        <p class="note">„Ultra“ lädt die Terrain-Texturen in 2048×2048 (Blender-gebacken) – braucht viel Grafikspeicher.</p>`;
    } else if (this.tab === 'music') {
      body.innerHTML = this.app.music.html();
      this.app.music.wire();
    } else {
      body.innerHTML = `<div class="set-grid">
        ${this.select('Absturz-Modus', s, 'crash', [['realistisch', 'Realistisch'], ['tolerant', 'Tolerant'], ['aus', 'Unzerstörbar']])}
        ${this.select('Flugmodus (ohne Schalter)', s, 'angleMode', [[false, 'Acro'], [true, 'Angle']].map(([v, t]) => [String(v), t]), () => { s.angleMode = s.angleMode === 'true' || s.angleMode === true; this.app.save(); })}
        ${this.select('Prop-Schaden', s, 'propDamage', [['true', 'An'], ['false', 'Aus']].map(([v, t]) => [v, t]), () => { s.propDamage = s.propDamage === true || s.propDamage === 'true'; this.app.save(); })}
        ${this.slider('Propwash-Stärke', s, 'propwash', 0, 2, 0.05, (v) => v.toFixed(2))}
        ${this.slider('Wind (m/s)', s, 'wind', 0, 8, 0.5, (v) => v.toFixed(1))}
        ${this.slider('PID-Härte', s, 'pidScale', 0.5, 1.6, 0.05, (v) => v.toFixed(2))}</div>`;
    }
  }

  curve() {
    const c = $('rate-curve');
    if (!c) return;
    const g = c.getContext('2d'), s = this.app.settings, W = c.width, H = c.height;
    g.clearRect(0, 0, W, H);
    g.strokeStyle = 'rgba(255,255,255,.1)';
    for (let i = 0; i <= 10; i++) { g.beginPath(); g.moveTo(i * W / 10, 0); g.lineTo(i * W / 10, H); g.stroke(); }
    const maxR = 1800;
    [['roll', '#ff6a1a'], ['pitch', '#4fd18b'], ['yaw', '#5ab0ff']].forEach(([a, col]) => {
      g.strokeStyle = col; g.lineWidth = 2; g.beginPath();
      for (let i = 0; i <= 100; i++) { const x = i / 100, r = actualRate(x, s.rates[a].center, s.rates[a].max, s.rates[a].expo); g.lineTo(x * W, H - r / maxR * H); }
      g.stroke();
      g.fillStyle = col; g.fillText(`${a} ${s.rates[a].max}°/s`, 8, 16 + ['roll', 'pitch', 'yaw'].indexOf(a) * 16);
    });
  }

  tick(dt) {
    if (this.tab !== 'ctrl') return;
    const inp = this.app.input, s = this.app.settings;
    const n = $('pad-name');
    if (!n) return;
    n.textContent = inp.pad ? `Verbunden: ${inp.pad.id}` : 'Kein Controller – Funke anschließen und Stick bewegen';
    const raw = inp.raw || [];
    if (this.cal) {
      this.cal.t -= dt;
      raw.forEach((v, i) => { const m = (this.cal.mm[i] ||= { min: v, max: v }); m.min = Math.min(m.min, v); m.max = Math.max(m.max, v); });
      $('cal-note').textContent = `Kalibriere … ${Math.max(0, this.cal.t).toFixed(1)} s`;
      if (this.cal.t <= 0) {
        Object.entries(this.cal.mm).forEach(([i, m]) => { if (m.max - m.min > 0.3) s.calib[i] = m; });
        this.cal = null; this.app.save(); $('cal-note').textContent = 'Kalibrierung gespeichert.';
      }
    }
    $('raw-axes').innerHTML = raw.map((v, i) => `<span>${this.app.input.label(i)}</span><div class="meter"><i style="left:${(inp.axis(i) * 0.5 + 0.5) * 100}%"></i></div><span>${v.toFixed(2)}</span>`).join('');
    const used = {};
    CH.forEach(([k]) => { const a = s.map[k].axis; if (a >= 0) (used[a] ||= []).push(CH.find((c) => c[0] === k)[1]); });
    const cf = Object.entries(used).filter(([, v]) => v.length > 1).map(([a, v]) => `⚠ ${inp.label(+a)} ist doppelt belegt: ${v.join(' + ')}`);
    if ($('map-conflict')) $('map-conflict').innerHTML = cf.join('<br>');
    CH.forEach(([k]) => {
      const el = $('m-' + k);
      if (el) el.style.left = ((s.map[k].axis >= 0 ? inp.chan(k) : 0) * 0.5 + 0.5) * 100 + '%';
    });
  }
}
