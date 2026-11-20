// Sky FPV – Einstellungen (localStorage)
const KEY = 'skyfpv.settings.v1';

export const DEFAULTS = {
  rates: { roll: { center: 200, max: 720, expo: 0.55 }, pitch: { center: 200, max: 720, expo: 0.55 }, yaw: { center: 180, max: 540, expo: 0.4 } },
  angleMode: false,
  uptilt: 28, fov: 118, fisheye: 0.7, dof: 0.35, cinematicDof: 0.2,
  quality: 'hoch', renderScale: 1.0,
  crash: 'realistisch', propDamage: true, setupDone: false, propwash: 1.0, wind: 1.0, pidScale: 1.0,
  volume: 0.6,
  map: { roll: { axis: 0, inv: false }, pitch: { axis: 1, inv: false }, throttle: { axis: 2, inv: false }, yaw: { axis: 3, inv: false },
    arm: { axis: 4, inv: false }, mode: { axis: -1, inv: false }, reset: { axis: -1, inv: false, button: 0 }, camera: { axis: -1, inv: false }, turtle: { axis: -1, inv: false }, clip: { axis: -1, inv: false } },
  clips: true, replaySec: 60, perfMode: false, targetFps: 60, showSticks: true,
  calib: {},
  deadband: 0.01,
  activeBuild: 0,
  builds: null,
};

export const QUALITY = {
  niedrig: { shadows: 1024, terrainTex: 512, pixelRatio: 0.75, dofSamples: 1 },
  mittel: { shadows: 2048, terrainTex: 1024, pixelRatio: 1.0, dofSamples: 1 },
  hoch: { shadows: 4096, terrainTex: 1024, pixelRatio: 1.0, dofSamples: 1 },
  ultra: { shadows: 4096, terrainTex: 2048, pixelRatio: 1.25, dofSamples: 1 },
};

export const CRASH = { realistisch: 7.5, tolerant: 14, aus: 1e9 };

export function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || '{}');
    const out = deepMerge(structuredClone(DEFAULTS), s);
    // einmalig: alle Invertierungen standardmäßig aus
    // einmalig: Angle-Schalter-Standard (Achse 6) entfernen – passte bei vielen Funken nicht
    if (!out.dofResetV6) { if (out.cinematicDof > 0.3) out.cinematicDof = 0.2; out.dofResetV6 = true; }
    if (!out.modeResetV5) { if (out.map.mode && out.map.mode.axis === 5) out.map.mode.axis = -1; out.modeResetV5 = true; }
    if (!out.invResetV4) { Object.values(out.map).forEach((m) => { if (m && 'inv' in m) m.inv = false; }); out.invResetV4 = true; }
    return out;
  } catch (e) { return structuredClone(DEFAULTS); }
}
export function saveSettings(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* privat */ } }

function deepMerge(a, b) {
  for (const k of Object.keys(b || {})) {
    if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') deepMerge(a[k], b[k]);
    else a[k] = b[k];
  }
  return a;
}
