// Sky FPV – Clips wie bei Medal: F8 (oder Clip-Schalter) speichert die letzte Minute als Video (.webm)
// Zwei Rekorder laufen zeitversetzt (Neustart alle 120 s, Versatz 60 s). Beim Speichern wird der genommen,
// der schon am längsten läuft – er enthält immer mindestens die letzte Minute (max. 2 min).
// Bild = fertiges FPV-Bild + einfaches OSD, Ton = Spielton.
import { VideoLib, thumbOf } from './replay.js';
const W = 1280, H = 720, PERIOD = 120000, MIN = 60000;
// MP4 (H.264 + AAC) bevorzugt, WebM nur als Notlösung
export function pickMime() {
  return ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm']
    .find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m));
}
export const extOf = (mime) => (mime && mime.startsWith('video/mp4') ? 'mp4' : 'webm');
export function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 30000);
}
export const stamp = () => { const d = new Date(), p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`; };

export class ClipRecorder {
  constructor(app) {
    this.app = app;
    this.cv = document.createElement('canvas');
    this.cv.width = W; this.cv.height = H;
    this.g = this.cv.getContext('2d');
    this.recs = [];
    this.active = false;
    this.mime = pickMime();
  }

  stream() {
    if (this._stream) return this._stream;
    const s = this.cv.captureStream(30);
    const ad = this.app.audio.streamDest;
    if (ad) ad.stream.getAudioTracks().forEach((t) => s.addTrack(t));
    return (this._stream = s);
  }

  makeRec(offset) {
    const r = { chunks: [], start: 0, mr: null };
    const begin = () => {
      r.chunks = [];
      r.start = performance.now();
      r.mr = new MediaRecorder(this.stream(), { mimeType: this.mime, videoBitsPerSecond: 8e6 });
      r.mr.ondataavailable = (e) => { if (e.data.size) r.chunks.push(e.data); };
      r.mr.start(1000);
    };
    r.restart = () => { try { if (r.mr && r.mr.state !== 'inactive') r.mr.stop(); } catch (e) { /* */ } begin(); };
    r.timer = setTimeout(function loop() { r.restart(); r.timer = setTimeout(loop, PERIOD); }, offset);
    return r;
  }

  start() {
    if (this.active || !this.mime || this.app.settings.clips === false) return;
    this.active = true;
    this.recs = [this.makeRec(0), this.makeRec(MIN)];
  }

  stop() {
    this.active = false;
    for (const r of this.recs) { clearTimeout(r.timer); try { if (r.mr && r.mr.state !== 'inactive') r.mr.stop(); } catch (e) { /* */ } }
    this.recs = [];
  }

  // pro Bild: FPV-Bild + OSD auf die Aufnahme-Leinwand zeichnen
  frame() {
    if (!this.active) return;
    const src = this.app.renderer.r.domElement, g = this.g;
    const s = Math.max(W / src.width, H / src.height);
    const w = src.width * s, h = src.height * s;
    g.drawImage(src, (W - w) / 2, (H - h) / 2, w, h);
    g.font = '24px "Share Tech Mono", monospace';
    g.lineWidth = 4; g.strokeStyle = '#000'; g.fillStyle = '#fff';
    const txt = (t, x, y, al = 'left') => { g.textAlign = al; g.strokeText(t, x, y); g.fillText(t, x, y); };
    const q = (id) => (document.getElementById(id)?.innerText || '').split('\n');
    q('osd-tl').forEach((l, i) => txt(l, 40, 50 + i * 28));
    q('osd-tr').forEach((l, i) => txt(l, W - 40, 50 + i * 28, 'right'));
    q('osd-bl').forEach((l, i) => txt(l, 40, H - 70 + i * 28));
    q('osd-br').forEach((l, i) => txt(l, W - 40, H - 70 + i * 28, 'right'));
    const c = q('osd-center').join(' ');
    if (c.trim()) txt(c, W / 2, H * 0.36, 'center');
  }

  async save() {
    if (!this.active || !this.recs.length) { this.app.toast('Clips sind aus (Einstellungen → Grafik & Ton)'); return; }
    const thumb = thumbOf(this.app.renderer.r.domElement);
    const age = (x) => (x.mr && x.mr.state === 'recording' ? performance.now() - x.start : -1);
    const r = this.recs.reduce((a, b) => (age(a) >= age(b) ? a : b));
    if (age(r) < 0) { this.app.toast('Aufnahme startet gerade …'); return; }
    const dur = (performance.now() - r.start) / 1000;
    const done = new Promise((res) => { r.mr.onstop = res; });
    r.mr.stop();
    await done;
    const blob = new Blob(r.chunks, { type: this.mime.split(';')[0] });
    r.restart();
    const name = `SkyFPV_${this.app.worldId}_${stamp()}.${extOf(this.mime)}`;
    VideoLib.save({ id: Date.now(), name, map: this.app.worldId, mapTitle: this.app.world?.meta?.name || '', dur, blob, thumb }).catch(() => {});
    this.app.toast(`Clip gespeichert (${Math.round(dur)} s) – zu finden unter Clips & Replays`);
  }
}
