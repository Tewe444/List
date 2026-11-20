// Sky FPV – Musik über SoundCloud (nur nach ausdrücklicher Zustimmung)
// Ohne Zustimmung wird weder das SoundCloud-Skript noch der Player geladen -> keine Verbindung zu SoundCloud.
const $ = (id) => document.getElementById(id);
const API = 'https://w.soundcloud.com/player/api.js';

export class Music {
  constructor(app) {
    this.app = app;
    this.s = app.settings;
    this.s.soundcloud ||= { consent: false, url: '', volume: 60 };
    this.widget = null;
    this.sounds = []; this.queue = []; this.cur = -1;
    $('pl-qclear').onclick = () => { this.queue = []; this.renderList(); };
    this.renderList();
    $('sc-accept-check').onchange = (e) => { $('sc-accept').disabled = !e.target.checked; };
    $('sc-accept').onclick = () => this.accept();
    $('sc-decline').onclick = () => this.decline();
    $('mb-play').onclick = () => this.widget && this.widget.toggle();
    $('mb-next').onclick = () => this.next();
    $('mb-vol').oninput = (e) => { this.s.soundcloud.volume = +e.target.value; this.app.save(); this.widget && this.widget.setVolume(+e.target.value); };
    if (this.s.soundcloud.consent && this.s.soundcloud.url) this.load(this.s.soundcloud.url);
  }

  // ---- Zustimmung
  askConsent() {
    $('sc-accept-check').checked = false;
    $('sc-accept').disabled = true;
    $('sc-consent').classList.remove('hidden');
  }
  accept() {
    this.s.soundcloud.consent = true;
    this.app.save();
    $('sc-consent').classList.add('hidden');
    this.app.toast('SoundCloud aktiviert');
    this.app.setui.render();
    this.renderList();
  }
  decline() {
    this.s.soundcloud.consent = false;
    this.app.save();
    $('sc-consent').classList.add('hidden');
    this.app.toast('Abgelehnt – SoundCloud bleibt aus');
  }
  revoke() {
    this.s.soundcloud.consent = false;
    this.unload();
    document.querySelectorAll(`script[src="${API}"]`).forEach((s) => s.remove());
    this.app.save();
    this.app.toast('Zustimmung widerrufen – SoundCloud entfernt');
    this.app.setui.render();
    this.renderList();
  }

  // ---- Player
  loadApi() {
    if (window.SC && window.SC.Widget) return Promise.resolve();
    return new Promise((res, rej) => {
      const sc = document.createElement('script');
      sc.src = API; sc.onload = res; sc.onerror = () => rej(new Error('SoundCloud nicht erreichbar'));
      document.head.appendChild(sc);
    });
  }

  async load(url) {
    if (!this.s.soundcloud.consent) { this.askConsent(); return; }       // ohne Zustimmung: nichts laden
    if (!/^https:\/\/(on\.|m\.|www\.)?soundcloud\.com\//.test(url)) { this.app.toast('Bitte einen soundcloud.com-Link einfügen'); return; }
    this.s.soundcloud.url = url;
    this.app.save();
    try { await this.loadApi(); } catch (e) { this.app.toast(e.message); return; }
    this.unload();
    const f = document.createElement('iframe');
    f.id = 'sc-frame';
    f.allow = 'autoplay';
    f.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true&visual=false&show_comments=false&show_user=true&hide_related=true`;
    $('sc-holder').appendChild(f);
    this.widget = window.SC.Widget(f);
    const W = window.SC.Widget.Events;
    this.queue = []; this.sounds = []; this.cur = -1; this._fn = 0;
    this.widget.bind(W.READY, () => { this.widget.setVolume(this.s.soundcloud.volume); this.widget.play(); this.fetchSounds(); });
    const title = () => this.widget.getCurrentSound((snd) => { $('mb-title').textContent = snd ? `${snd.title}` : 'SoundCloud'; });
    this.widget.bind(W.PLAY, () => { $('mb-play').textContent = '⏸'; title(); this.widget.getCurrentSoundIndex((i) => { this.cur = i; this.fetchSounds(); }); });
    this.widget.bind(W.PAUSE, () => { $('mb-play').textContent = '▶'; });
    this.widget.bind(W.FINISH, () => this.next());
    $('mb-vol').value = this.s.soundcloud.volume;
    $('musicbar').classList.remove('hidden');
  }

  unload() {
    const f = $('sc-frame');
    if (f) f.remove();
    this.widget = null;
    this.sounds = []; this.queue = []; this.cur = -1;
    $('musicbar').classList.add('hidden');
    this.renderList();
  }

  // ---- Playlist & Warteschlange
  next() {
    if (!this.widget) return;
    if (this.queue.length) { this.widget.skip(this.queue.shift()); this.renderList(); } else this.widget.next();
  }
  fetchSounds() {
    // SoundCloud liefert Details späterer Tracks erst nach und nach -> mehrmals nachladen
    if (!this.widget) return;
    this.widget.getSounds((list) => {
      this.sounds = list || [];
      this.renderList();
      clearTimeout(this._ft);
      if (this.sounds.some((s) => !s.title) && (this._fn = (this._fn || 0) + 1) < 20) this._ft = setTimeout(() => this.fetchSounds(), 2500);
    });
  }
  renderList() {
    const items = $('pl-items'), q = $('pl-queue');
    const esc = (t) => String(t || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const dur = (ms) => (ms ? `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}` : '');
    const row = (s, i, on, extra) => `<div class="pl-row ${on ? 'on' : ''}" data-i="${i}">${s.artwork_url ? `<img src="${esc(s.artwork_url)}" alt="">` : '<div class="pl-art"></div>'}<div class="pl-t"><b>${esc(s.title || 'Track ' + (i + 1))}</b><span>${esc(s.user?.username || '')} ${dur(s.duration)}</span></div>${extra}</div>`;
    if (!this.s.soundcloud.consent || !this.widget) {
      $('pl-count').textContent = ''; $('pl-now').textContent = '';
      items.innerHTML = `<p class="pl-empty">${this.s.soundcloud.consent ? 'Noch keine Musik geladen.' : 'Musik von SoundCloud ist aus.'}</p><button id="pl-setup">${this.s.soundcloud.consent ? 'Playlist-Link einfügen' : 'SoundCloud verbinden'}</button>`;
      $('pl-setup').onclick = () => { if (!this.s.soundcloud.consent) this.askConsent(); else this.app.show('settings'); };
      q.innerHTML = '';
      return;
    }
    $('pl-count').textContent = this.sounds.length ? `${this.sounds.length} Titel` : 'lädt …';
    const now = this.sounds[this.cur];
    $('pl-now').textContent = now ? `▶ ${now.title || ''}` : '';
    items.innerHTML = this.sounds.map((s, i) => row(s, i, i === this.cur, `<button data-q="${i}" title="Zur Warteschlange">＋</button>`)).join('') || '<p class="pl-empty">Lädt …</p>';
    items.querySelectorAll('.pl-row').forEach((el) => (el.onclick = (e) => {
      const qi = e.target.dataset.q;
      if (qi != null) { this.queue.push(+qi); this.app.toast('Zur Warteschlange hinzugefügt'); this.renderList(); return; }
      this.widget.skip(+el.dataset.i); this.widget.play();
    }));
    q.innerHTML = this.queue.map((i, k) => row(this.sounds[i] || {}, i, false, `<button data-k="${k}" title="Entfernen">×</button>`)).join('') || '<p class="pl-empty">Leer – tippe ＋ bei einem Titel.</p>';
    q.querySelectorAll('.pl-row').forEach((el, k) => (el.onclick = (e) => {
      if (e.target.dataset.k != null) { this.queue.splice(+e.target.dataset.k, 1); this.renderList(); return; }
      this.queue.splice(k, 1); this.widget.skip(+el.dataset.i); this.widget.play(); this.renderList();
    }));
  }

  // ---- Einstellungs-Abschnitt
  html() {
    const c = this.s.soundcloud;
    if (!c.consent) {
      return `<p class="note">Spiele beim Fliegen deine Musik von SoundCloud ab (öffentliche Tracks, Playlists oder Profile per Link).</p>
        <div class="row"><button class="primary" id="sc-connect">SoundCloud verbinden</button></div>
        <p class="note">Vor dem Verbinden musst du dem Datenschutz-Hinweis zustimmen. Ohne Zustimmung wird keine Verbindung zu SoundCloud aufgebaut.</p>`;
    }
    return `<p class="note">SoundCloud ist aktiviert. Füge einen Link zu einem Track, einer Playlist oder einem Profil ein.</p>
      <div class="row"><input id="sc-url" placeholder="https://soundcloud.com/…" value="${(c.url || '').replace(/"/g, '&quot;')}"><button class="primary" id="sc-load">Abspielen</button></div>
      <div class="row"><button id="sc-stop">Player schließen</button><button id="sc-revoke">Zustimmung widerrufen</button></div>
      <p class="note">Hinweis: Ein Login in dein SoundCloud-Konto ist nicht möglich. Private Inhalte gehen nur per geheimem Teilen-Link.</p>`;
  }
  wire() {
    const b = (id, fn) => { const el = $(id); if (el) el.onclick = fn; };
    b('sc-connect', () => this.askConsent());
    b('sc-load', () => this.load($('sc-url').value.trim()));
    b('sc-stop', () => this.unload());
    b('sc-revoke', () => this.revoke());
  }
}
