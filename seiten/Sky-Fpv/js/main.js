// Sky FPV – Einstiegspunkt: Zustände (Menü, Flug, Werkstatt, Einstellungen), Hauptschleife
import * as THREE from 'three';
import { Renderer } from './render.js';
import { Input } from './input.js';
import { loadSettings, saveSettings, QUALITY } from './settings.js';
import { loadJSON } from './assets.js';
import { buildWorld } from './world.js';
import { Flight } from './flight.js';
import { Workshop } from './builder.js';
import { SettingsUI } from './settings_ui.js';
import { MAPS } from './maps.js';
import { DEFAULT_BUILDS, isComplete } from './parts.js';
import { buildParams } from './physics.js';
import { AudioEngine } from './audio.js';
import { Wizard } from './wizard.js';
import { Music } from './music.js';
import { ClipRecorder } from './clips.js';
import { Multiplayer } from './multiplayer.js';
import { ClipLib, ReplayPlayer, VideoLib, thumbOf } from './replay.js';

const $ = (id) => document.getElementById(id);
const SCREENS = ['loading', 'menu', 'fly', 'builder', 'settings', 'pause', 'wizard', 'cliplist', 'replay'];   // sc-consent ist ein eigenes Overlay

class App {
  async start() {
    this.settings = loadSettings();
    if (!this.settings.builds) this.settings.builds = structuredClone(DEFAULT_BUILDS);
    this.renderer = new Renderer();
    await this.renderer.init($('gl'));
    this.renderer.setScale(this.settings.renderScale * QUALITY[this.settings.quality].pixelRatio);
    this.input = new Input(this.settings);
    this.audio = new AudioEngine(this.settings);
    this.input.onReset = () => { if (this.flight && (this.state === 'flight' || this.state === 'pause')) { this.flight.reset(); if (this.state === 'pause') this.show('flight'); } };
    const unlock = () => this.audio.init();
    addEventListener('pointerdown', unlock); addEventListener('keydown', unlock);
    document.addEventListener('click', (e) => { if (e.target.closest('button, .card, .opt, .slot')) this.audio.play('click', 0.35); });
    this.frames = await loadJSON('assets/data/drone_parts.json');
    this.workshop = new Workshop();
    await this.workshop.init(this);
    this.setui = new SettingsUI(this);
    this.wizard = new Wizard(this);
    this.music = new Music(this);
    this.clips = new ClipRecorder(this);
    this.mp = new Multiplayer(this);
    this.state = 'loading';
    this.mapId = 'steelworks'; this.flyMode = 'free';
    this.wireMenus();
    await this.loadMap('steelworks');
    if (this.settings.setupDone) this.show('menu'); else this.wizard.start();
    this.last = performance.now();
    this.orbit = 0;
    requestAnimationFrame((t) => this.loop(t));
  }

  save() { saveSettings(this.settings); }

  // ---- Replays
  async saveReplay() {
    const f = this.flight;
    if (!f) return;
    const data = f.rec.snapshot();
    if (data.length < 13 * 30) return;
    const thumb = thumbOf(this.renderer.r.domElement);   // direkt nach dem Rendern -> Bild ist noch da
    const b = f.build;
    try {
      await ClipLib.save({ id: Date.now(), map: this.worldId, mapTitle: MAPS[this.worldId].title, build: structuredClone(b), buildName: b.name, duration: data[data.length - 13], data: data.buffer, thumb });
      setTimeout(() => this.toast('Replay gespeichert – Hauptmenü → Clips & Replays'), 2300);
    } catch (e) { this.toast('Replay konnte nicht gespeichert werden'); }
  }

  async fillClips() {
    const box = $('clip-items'), tab = this.clipTab || 'replays', q = ($('clip-search').value || '').toLowerCase();
    document.querySelectorAll('#clip-tabs button').forEach((b) => { b.classList.toggle('on', b.dataset.t === tab); b.onclick = () => { this.clipTab = b.dataset.t; this.fillClips(); }; });
    $('clip-search').oninput = () => this.fillClips();
    const when = (id) => new Date(id).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
    const img = (t) => (t ? `<img class="thumb" src="${t}" alt="">` : '<div class="thumb"></div>');
    if (tab === 'replays') {
      const list = (await ClipLib.list().catch(() => [])).filter((c) => !q || `${c.mapTitle} ${c.buildName} ${when(c.id)}`.toLowerCase().includes(q));
      box.innerHTML = list.length ? list.map((c) => `<div class="clip-row" data-open="${c.id}">${img(c.thumb)}<div class="clip-info"><b>${c.mapTitle}</b><span>${c.buildName} · ${c.duration.toFixed(1)} s</span></div><span class="clip-date">${when(c.id)}</span><button data-del="${c.id}" title="Löschen">🗑</button></div>`).join('')
        : '<p class="note">Keine Replays. Drück beim Fliegen F8.</p>';
      box.querySelectorAll('.clip-row').forEach((el) => (el.onclick = (e) => { if (e.target.dataset.del) return; this.openReplay(list.find((c) => c.id === +el.dataset.open)); }));
      box.querySelectorAll('[data-del]').forEach((el) => (el.onclick = async (e) => { e.stopPropagation(); await ClipLib.del(+el.dataset.del); this.fillClips(); }));
    } else {
      const list = (await VideoLib.list().catch(() => [])).filter((v) => !q || `${v.name} ${v.mapTitle}`.toLowerCase().includes(q));
      box.innerHTML = list.length ? list.map((v) => `<div class="clip-row" data-play="${v.id}">${img(v.thumb)}<div class="clip-info"><b>${v.mapTitle || v.map}</b><span>${v.name} · ${Math.round(v.dur || 0)} s</span></div><span class="clip-date">${when(v.id)}</span><button data-dl="${v.id}" title="Herunterladen">⬇</button><button data-del="${v.id}" title="Löschen">🗑</button></div>`).join('')
        : '<p class="note">Noch keine Aufnahmen. F8 beim Fliegen speichert die letzte Minute als MP4.</p>';
      const find = (id) => list.find((v) => v.id === +id);
      box.querySelectorAll('.clip-row').forEach((el) => (el.onclick = (e) => { if (e.target.tagName === 'BUTTON') return; const v = find(el.dataset.play); $('video-player').src = URL.createObjectURL(v.blob); $('video-modal').classList.remove('hidden'); }));
      box.querySelectorAll('[data-dl]').forEach((el) => (el.onclick = () => { const v = find(el.dataset.dl); const a = document.createElement('a'); a.href = URL.createObjectURL(v.blob); a.download = v.name; a.click(); }));
      box.querySelectorAll('[data-del]').forEach((el) => (el.onclick = async () => { await VideoLib.del(+el.dataset.del); this.fillClips(); }));
    }
    $('video-close').onclick = () => { const p = $('video-player'); p.pause(); URL.revokeObjectURL(p.src); p.removeAttribute('src'); $('video-modal').classList.add('hidden'); };
  }

  async openReplay(clip) {
    if (this.flight) { this.flight.dispose(); this.flight = null; }
    this.audio.init();
    this.replay = await ReplayPlayer.open(this, clip);
    this.show('replay');
  }

  closeReplay() {
    if (this.replay) { this.replay.dispose(); this.replay = null; }
    this.show('cliplist');
  }

  // Performance-Modus: Auflösung dynamisch an die Ziel-Bildrate anpassen (50–100 % der eingestellten Auflösung)
  dynRes(dt) {
    const r = this.renderer, s = this.settings;
    r.perf = !!s.perfMode;
    if (!s.perfMode || this.state !== 'flight') return;
    this.ftAvg = (this.ftAvg ?? dt) * 0.95 + dt * 0.05;
    this.drT = (this.drT || 0) + dt;
    if (this.drT < 1) return;
    this.drT = 0;
    const base = s.renderScale * QUALITY[s.quality].pixelRatio, target = 1 / (s.targetFps || 60);
    let f = this.dynF ?? 1;
    if (this.ftAvg > target * 1.08) f = Math.max(0.5, f - 0.08);
    else if (this.ftAvg < target * 0.8) f = Math.min(1, f + 0.05);
    if (f !== this.dynF) { this.dynF = f; r.setScale(base * f); }
  }
  warmUp() {
    const w = this.world, f = this.flight, cam = f.camera, r = this.renderer;
    if (this._warmed === w) return;
    this._warmed = w;
    const t = performance.now();
    w.update(0.5, w.spawn);
    r.r.setRenderTarget(r.rt);
    r.r.compile(w.scene, cam);           // alle Materialien, auch außerhalb des Blickfelds
    r.r.setRenderTarget(null);
    const p = w.spawn.clone(); p.y += 4;
    for (let i = 0; i < 8; i++) {         // + Schatten/Instanzen aus allen Richtungen
      cam.position.copy(p); cam.rotation.set(-0.12, i * Math.PI / 4, 0, 'YXZ'); cam.updateMatrixWorld();
      r.render(w.scene, cam, f.fx || {});
    }
    console.info(`Shader vorbereitet in ${Math.round(performance.now() - t)} ms`);
  }
  toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(this._tt); this._tt = setTimeout(() => t.classList.remove('show'), 2200); }
  best(map, time) {
    const k = 'skyfpv.best.' + map;
    let b = null;
    try { b = parseFloat(localStorage.getItem(k)) || null; } catch (e) { /* */ }
    if (time !== undefined && (!b || time < b)) { try { localStorage.setItem(k, time); } catch (e) { /* */ } return true; }
    return time === undefined ? b : false;
  }

  show(name) {
    this.prevScreen = this.state;
    this.state = name;
    SCREENS.forEach((s) => $(s).classList.toggle('hidden', s !== name));
    $('hud').classList.toggle('hidden', name !== 'flight');
    if (name === 'flight' && document.activeElement) document.activeElement.blur(); // Leertaste darf keinen Button auslösen
    if (name === 'builder') this.workshop.enter(); else this.workshop.leave();
    if (name === 'settings') this.setui.render();
    if (name === 'fly') this.fillFly();
    if (name === 'cliplist') this.fillClips();
  }

  progress(f, text) { $('load-fill').style.width = Math.round(f * 100) + '%'; $('load-text').textContent = text; }

  async loadMap(id) {
    const qkey = this.settings.quality + (this.settings.perfMode ? '+perf' : '');
    if (this.world && this.worldId === id && this.worldQuality === qkey) return;
    if (this.flight) { this.flight.dispose(); this.flight = null; }
    this.mp.clear();
    if (this.world) { this.world.dispose(); this.world = null; this.renderer.r.renderLists.dispose(); }
    const prev = this.state;
    SCREENS.forEach((s) => $(s).classList.toggle('hidden', s !== 'loading'));
    this.progress(0, 'Lade Karte …');
    const gfx = { ...QUALITY[this.settings.quality], perf: !!this.settings.perfMode };
    if (this.settings.perfMode) gfx.shadows = Math.min(gfx.shadows, 2048);
    this.world = await buildWorld(this.renderer.r, id, gfx, (f, t) => this.progress(f, t));
    this.worldId = id;
    this.worldQuality = this.settings.quality + (this.settings.perfMode ? '+perf' : '');
    this.menuCam = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 6000);
    this.state = prev;
  }

  wireMenus() {
    document.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => {
      const g = b.dataset.go;
      if (g === 'back') return this.show(this.flight ? 'pause' : 'menu');
      this.show(g);
    }));
    $('mode-seg').querySelectorAll('button').forEach((b) => (b.onclick = () => {
      this.flyMode = b.dataset.mode;
      $('mode-seg').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
    }));
    $('btn-start').onclick = () => this.startFlight();
    $('b-fly').onclick = () => this.show('fly');
    $('fly-build').onchange = (e) => { this.settings.activeBuild = +e.target.value; this.save(); this.fillFly(); };
    $('p-resume').onclick = () => this.show('flight');
    $('p-reset').onclick = () => { this.flight.reset(); this.show('flight'); };
    $('p-settings').onclick = () => this.show('settings');
    $('p-menu').onclick = () => { this.flight.dispose(); this.flight = null; this.mp.clear(); this.clips.stop(); this.show('menu'); };
    addEventListener('gamepadconnected', (e) => this.toast('Controller verbunden: ' + e.gamepad.id.slice(0, 40)));
  }

  fillFly() {
    $('map-list').innerHTML = Object.entries(MAPS).map(([id, m]) => `<div class="card ${id === this.mapId ? 'on' : ''}" data-map="${id}"><b>${m.title}</b><span>${m.desc}</span></div>`).join('');
    $('map-list').querySelectorAll('.card').forEach((c) => (c.onclick = () => { this.mapId = c.dataset.map; this.fillFly(); }));
    const sel = $('fly-build');
    sel.innerHTML = this.settings.builds.map((b, i) => `<option value="${i}">${b.name}</option>`).join('');
    sel.value = this.settings.activeBuild;
    const bb = this.settings.builds[this.settings.activeBuild];
    if (!isComplete(bb)) { $('fly-build-info').innerHTML = '<span class="warn" style="grid-column:1/-1">Diese Drohne ist noch nicht fertig gebaut – in der Werkstatt fertigstellen.</span>'; return; }
    const p = buildParams(bb, this.frames.frames);
    $('fly-build-info').innerHTML = [['Gewicht', `${(p.mass * 1000).toFixed(0)} g`], ['Schub/Gewicht', `${p.tw.toFixed(1)}:1`], ['Flugzeit', `~${p.flightMin.toFixed(1)} min`]]
      .map(([k, v]) => `<span class="k">${k}</span><span>${v}</span>`).join('') + (p.flyable ? '' : '<span class="warn" style="grid-column:1/-1">Nicht flugfähig – in der Werkstatt prüfen</span>');
  }

  async startFlight() {
    const build = this.settings.builds[this.settings.activeBuild];
    if (!isComplete(build)) { this.toast('Drohne ist noch nicht fertig gebaut'); return; }
    await this.loadMap(this.mapId);
    if (this.flight) { this.flight.dispose(); this.flight = null; }
    this.flight = await Flight.create(this, this.world, build, this.flyMode);
    this.warmUp();
    this.show('flight');
    this.toast('Leertaste / Arm-Schalter zum Scharfschalten');
  }

  loop(t) {
    const dt = Math.min(0.1, (t - this.last) / 1000);
    this.last = t;
    this.dynRes(dt);
    this.input.poll(dt);
    const ps = $('pad-status');
    if (this.input.pad) { ps.textContent = 'Controller: ' + this.input.out.source; ps.classList.add('ok'); }
    if (this.input.pressed('Escape')) {
      if (this.state === 'flight') this.show('pause');
      else if (this.state === 'pause') this.show('flight');
    }
    if (this.state === 'flight' && this.flight) {
      this.flight.update(dt);
      this.audio.update(this.flight, dt);
      this.mp.update(dt, this.flight);
      this.renderer.render(this.world.scene, this.flight.camera, this.flight.fx);
      this.clips.start();
      this.clips.frame();
      if (this.input.pressed('F8') || this.input.clipBtn) { this.clips.save(); this.saveReplay(); }
    } else if (this.state === 'replay' && this.replay) {
      this.replay.update(dt);
      this.renderer.render(this.world.scene, this.replay.camera, this.replay.fx);
      if (this.input.pressed('Escape')) this.closeReplay();
    } else if (this.state === 'builder') {
      if (!this.workshop.test) this.audio.silence();
      this.workshop.update(dt);
      this.workshop.camera.aspect = innerWidth / innerHeight; this.workshop.camera.updateProjectionMatrix();
      this.renderer.render(this.workshop.scene, this.workshop.camera, { uFocus: this.workshop.camera.position.distanceTo(this.workshop.controls.target), uDof: 0.45, uFisheye: 0, uAnalog: 0, uNoise: 0, uFlash: 0, uExposure: 1.1, uTime: t / 1000 });
    } else if (this.world) {
      this.audio.silence();
      if (this.state === 'settings') this.setui.tick(dt);
      if (this.state === 'wizard') this.wizard.tick(dt);
      if (this.flight && this.state !== 'menu') {
        this.renderer.render(this.world.scene, this.flight.camera, { ...this.flight.fx, uDof: 0.9, uFocus: 0.5 });
      } else {
        // Kamerafahrt im Hauptmenü
        this.orbit += dt * 0.04;
        const c = this.menuCam, w = this.world;
        const target = w.spawn.clone().add(new THREE.Vector3(-60, 8, -110));
        c.position.set(target.x + Math.cos(this.orbit) * 150, 0, target.z + Math.sin(this.orbit) * 150);
        c.position.y = Math.max(w.H(c.position.x, c.position.z), w.meta.water ?? -1e9) + 28;
        c.lookAt(target);
        c.aspect = innerWidth / innerHeight; c.updateProjectionMatrix();
        w.update(dt, target);
        this.renderer.render(w.scene, c, { uFocus: c.position.distanceTo(target), uDof: 0.7, uFisheye: 0, uAnalog: 0, uNoise: 0, uFlash: 0, uExposure: 1.0, uTime: t / 1000 });
      }
    }
    this.input.endFrame();
    requestAnimationFrame((tt) => this.loop(tt));
  }
}

const app = new App();
window.skyfpv = app; // für Debugging in der Konsole
app.start().catch((e) => {
  console.error(e);
  $('load-text').textContent = 'Fehler: ' + e.message + ' – bitte über start.bat (lokaler Server) öffnen.';
});

// Slider-Füllung (orange bis zum Punkt) – auch für Werte, die per Code gesetzt werden
const fillRange = (el) => { const mn = +el.min || 0, mx = el.max === '' ? 100 : +el.max; el.style.setProperty('--p', ((el.value - mn) / (mx - mn || 1) * 100) + '%'); };
document.addEventListener('input', (e) => { if (e.target.type === 'range') fillRange(e.target); });
setInterval(() => document.querySelectorAll('input[type=range]').forEach(fillRange), 300);
