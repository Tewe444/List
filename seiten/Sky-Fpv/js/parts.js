// Sky FPV – Teilekatalog (fiktive Hersteller, echte Größenordnungen)
export const CATALOG = {
  frame: [
    { id: 'falke5', name: 'Falke 5" Freestyle', model: 'frame_falke5', mass: 0.112, cls: 5, propMax: 5.1, stack: '30', info: '225 mm, True-X, 5 mm Arme' },
    { id: 'spatz3', name: 'Spatz 3" Cinewhoop', model: 'frame_spatz3', mass: 0.128, cls: 3, propMax: 3.0, stack: '20', info: '142 mm, Ducts, für Indoor & Cinematic' },
    { id: 'albatros7', name: 'Albatros 7" Long Range', model: 'frame_albatros7', mass: 0.165, cls: 7, propMax: 7.0, stack: '30', info: '315 mm, GPS-Mast' },
    { id: 'kranich4', name: 'Kranich 4" Ultralight', model: 'frame_kranich4', mass: 0.068, cls: 4, propMax: 4.0, stack: '20', info: '180 mm, 3 mm Arme, 20x20 – leicht & wendig' },
    { id: 'adler6', name: 'Adler 6" Mid Range', model: 'frame_adler6', mass: 0.135, cls: 6, propMax: 6.0, stack: '30', info: '260 mm, 5,5 mm Arme – Cruiser & Mountain Surfing' },
  ],
  motor: [
    { id: '1404', name: 'Brumm 1404 3800KV', model: 'motor_1404', cls: [3], s: [4], kv: 3800, R: 0.2, mass: 0.009, imax: 16, J: 4e-7, info: 'Für 3" auf 4S' },
    { id: '2207', name: 'Vortex 2207 1950KV', model: 'motor_2207', cls: [5], s: [6], kv: 1950, R: 0.085, mass: 0.033, imax: 45, J: 2.2e-6, info: 'Freestyle 6S' },
    { id: '2306', name: 'Vortex 2306 2450KV', model: 'motor_2306', cls: [5], s: [4, 6], kv: 2450, R: 0.07, mass: 0.031, imax: 50, J: 2.0e-6, info: 'Race 4S/6S – heiß auf 6S!' },
    { id: '1804', name: 'Brumm 1804 2450KV', model: 'motor_1804', cls: [3, 4], s: [4, 6], kv: 2450, R: 0.13, mass: 0.019, imax: 25, J: 1.0e-6, info: '4" auf 4S/6S' },
    { id: '2208', name: 'Vortex 2208 1750KV', model: 'motor_2208', cls: [5, 6], s: [6], kv: 1750, R: 0.075, mass: 0.036, imax: 42, J: 2.6e-6, info: 'Bassig, 5-6" auf 6S' },
    { id: '2507', name: 'Zugvogel 2507 1800KV', model: 'motor_2507', cls: [6, 7], s: [6], kv: 1800, R: 0.07, mass: 0.040, imax: 45, J: 3.2e-6, info: '6" Cruiser 6S' },
    { id: '2806', name: 'Zugvogel 2806.5 1300KV', model: 'motor_2806', cls: [7], s: [6], kv: 1300, R: 0.11, mass: 0.048, imax: 40, J: 4.5e-6, info: '7" Long Range 6S' },
  ],
  prop: [
    { id: '3018_3b', name: '3018 Tri-Blade', model: 'prop_3018_3b', D: 0.0762, P: 0.0457, Ct: 0.11, Cp: 0.065, mass: 0.0016, inch: 3.0 },
    { id: '5136_3b', name: '5136 Tri-Blade', model: 'prop_5136_3b', D: 0.1295, P: 0.0914, Ct: 0.11, Cp: 0.078, mass: 0.0043, inch: 5.1 },
    { id: '5043_2b', name: '5043 Bi-Blade', model: 'prop_5043_2b', D: 0.127, P: 0.109, Ct: 0.11, Cp: 0.075, mass: 0.0040, inch: 5.0 },
    { id: '4024_3b', name: '4024 Tri-Blade', model: 'prop_4024_3b', D: 0.1016, P: 0.061, Ct: 0.115, Cp: 0.07, mass: 0.0028, inch: 4.0 },
    { id: '5145_3b', name: '5145 Tri-Blade (Race)', model: 'prop_5145_3b', D: 0.1295, P: 0.1143, Ct: 0.125, Cp: 0.095, mass: 0.0045, inch: 5.1 },
    { id: '6030_3b', name: '6030 Tri-Blade', model: 'prop_6030_3b', D: 0.1524, P: 0.0762, Ct: 0.11, Cp: 0.065, mass: 0.0062, inch: 6.0 },
    { id: '7035_2b', name: '7035 Bi-Blade', model: 'prop_7035_2b', D: 0.1778, P: 0.0889, Ct: 0.10, Cp: 0.05, mass: 0.0085, inch: 7.0 },
  ],
  stack: [
    { id: 'aio25', name: 'Kolibri AIO 25A (20x20)', model: 'stack_20', size: '20', amps: 25, mass: 0.008 },
    { id: 'stack45', name: 'Blitz F7 + 45A (30x30)', model: 'stack_30', size: '30', amps: 45, mass: 0.022 },
    { id: 'stack60', name: 'Blitz F7 + 60A (30x30)', model: 'stack_30', size: '30', amps: 60, mass: 0.026 },
    { id: 'aio35', name: 'Kolibri AIO 35A (20x20)', model: 'stack_20', size: '20', amps: 35, mass: 0.009 },
  ],
  battery: [
    { id: '4s650', name: '4S 650 mAh LiPo', model: 'batt_4s650', cls: [3], cells: 4, mah: 650, rCell: 0.007, mass: 0.080, size: [0.030, 0.027, 0.058] },
    { id: '4s1300', name: '4S 1300 mAh LiPo', model: 'batt_4s1300', cls: [4, 5], cells: 4, mah: 1300, rCell: 0.0045, mass: 0.160, size: [0.035, 0.034, 0.074] },
    { id: '4s850', name: '4S 850 mAh LiPo', model: 'batt_4s850', cls: [3, 4], cells: 4, mah: 850, rCell: 0.006, mass: 0.098, size: [0.031, 0.030, 0.062] },
    { id: '6s850', name: '6S 850 mAh LiPo', model: 'batt_6s850', cls: [4, 5], cells: 6, mah: 850, rCell: 0.006, mass: 0.135, size: [0.033, 0.034, 0.066] },
    { id: '6s1100', name: '6S 1100 mAh LiPo', model: 'batt_6s1100', cls: [5], cells: 6, mah: 1100, rCell: 0.0045, mass: 0.180, size: [0.036, 0.037, 0.076] },
    { id: '6s1300', name: '6S 1300 mAh LiPo', model: 'batt_6s1300', cls: [5, 6], cells: 6, mah: 1300, rCell: 0.0038, mass: 0.225, size: [0.036, 0.044, 0.076] },
    { id: '6s1800', name: '6S 1800 mAh LiPo', model: 'batt_6s1800', cls: [5, 6, 7], cells: 6, mah: 1800, rCell: 0.0035, mass: 0.290, size: [0.038, 0.045, 0.090] },
    { id: '6s4500', name: '6S1P 4500 mAh Li-Ion', model: 'batt_6s4500', cls: [6, 7], cells: 6, mah: 4500, rCell: 0.011, mass: 0.420, size: [0.064, 0.043, 0.072] },
  ],
  camera: [
    { id: 'analog', name: 'Analog Micro + 600 mW VTX', model: 'cam_analog', vtx: 'vtx_analog', mass: 0.016, digital: false },
    { id: 'nano', name: 'Analog Nano 14 mm + 400 mW VTX', model: 'cam_nano', vtx: 'vtx_analog', mass: 0.011, digital: false },
    { id: 'digital', name: 'Digital HD + Air-Unit', model: 'cam_digital', vtx: 'vtx_digital', mass: 0.048, digital: true },
  ],
  actioncam: [
    { id: 'none', name: 'Keine', model: null, mass: 0 },
    { id: 'mini', name: 'Mini-Actioncam', model: 'actioncam_mini', mass: 0.035 },
    { id: 'full', name: 'Große Actioncam', model: 'actioncam_full', mass: 0.125 },
  ],
};

// Reihenfolge = sinnvolle Bau-Reihenfolge
export const SLOTS = [
  ['frame', 'Frame'], ['motor', 'Motoren (4x)'], ['prop', 'Propeller (4x)'], ['stack', 'FC / ESC'],
  ['camera', 'FPV-System'], ['battery', 'Akku'], ['actioncam', 'Actioncam'],
];

export const emptyBuild = (name = 'Neue Drohne') => ({ name, frame: null, motor: null, prop: null, stack: null, battery: null, camera: null, actioncam: null });
export const isComplete = (b) => SLOTS.every(([k]) => b[k]);

// Passt ein Teil zu den bereits eingebauten Teilen?
export function fits(cat, p, b) {
  const fr = b.frame && part('frame', b.frame), mo = b.motor && part('motor', b.motor);
  switch (cat) {
    case 'motor': return !fr || p.cls.includes(fr.cls);
    case 'prop': return !fr || (p.inch <= fr.propMax + 0.05 && p.inch >= fr.propMax - 1.2);
    case 'stack': return !fr || p.size === fr.stack;
    case 'battery': return (!fr || p.cls.includes(fr.cls)) && (!mo || mo.s.includes(p.cells));
    case 'actioncam': return p.id !== 'full' || !fr || fr.cls >= 5;
    default: return true;
  }
}

export const DEFAULT_BUILDS = [
  { name: 'Falke Freestyle', frame: 'falke5', motor: '2207', prop: '5136_3b', stack: 'stack45', battery: '6s1100', camera: 'analog', actioncam: 'none' },
  { name: 'Spatz Cinewhoop', frame: 'spatz3', motor: '1404', prop: '3018_3b', stack: 'aio25', battery: '4s650', camera: 'digital', actioncam: 'mini' },
  { name: 'Albatros Long Range', frame: 'albatros7', motor: '2806', prop: '7035_2b', stack: 'stack45', battery: '6s4500', camera: 'digital', actioncam: 'full' },
];

export const part = (cat, id) => CATALOG[cat].find((p) => p.id === id);
