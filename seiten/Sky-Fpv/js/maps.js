// Sky FPV – Kartendefinitionen (Platzierung der Blender-Modelle, Race-Strecken, Streuung)
const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const GRIME = ['#d9d0c4', '#c8bfb2', '#bdb4a6', '#e2dbcf', '#cbbfae'];
const TINTS = ['#a8382a', '#2b5d9c', '#2f7a46', '#c9a227', '#8a8f94', '#b05a1e', '#e9e6df'];

export const MAPS = {
  steelworks: {
    title: 'Altes Stahlwerk', desc: 'Riesiges verlassenes Industriegebiet: Hallen, Bandos, Stahlskelette, Rohrbrücken, Förderbänder, Silos, Parkhäuser, Portalkräne, Containerlager, Steinbruch.',
    build(h) {
      const P = [], R = rnd(42);
      const add = (model, x, z, yaw = 0, o = {}) => P.push({ model, x, z, y: o.y ?? h(x, z), yaw, scale: o.scale || 1, tint: o.tint });
      add('warehouse', -120, -80); add('warehouse', -120, 70, Math.PI);
      add('bando', 55, -125); add('bando', 160, -55, Math.PI / 2);
      add('chimney', -20, -175); add('water_tower', 200, -170); add('water_tower', -215, -175, 0.4);
      for (let i = 0; i < 6; i++) for (let j = 0; j < 5; j++) {
        if (R() < 0.18) continue;
        const x = 112 + i * 21, z = 40 + j * 34, yaw = (j % 2) * 0 + (R() < 0.2 ? Math.PI / 2 : 0);
        const n = 1 + Math.floor(R() * 3);
        for (let k = 0; k < n; k++) add('container', x + (R() - 0.5) * 0.4, z, yaw, { y: k * 2.59, tint: TINTS[Math.floor(R() * TINTS.length)] });
      }
      for (let x = -230; x <= 230; x += 32) { add('light_pole', x, -50, Math.PI / 2); add('light_pole', x + 16, -30, -Math.PI / 2); }
      for (let i = 0; i < 26; i++) add('barrier', -60 + i * 3.05, -10, 0);
      for (let i = 0; i < 14; i++) add('barrier', 20, 20 + i * 3.05, Math.PI / 2);
      for (let i = 0; i < 40; i++) add('pallet', -95 + R() * 30, -40 + R() * 25, R() * 3, { y: Math.floor(R() * 3) * 0.144 });
      for (let i = 0; i < 12; i++) add('spool', -60 + R() * 50, 120 + R() * 60, R() * 6);
      for (let i = 0; i < 40; i++) add('barrel', 20 + R() * 60, -60 + R() * 25, R() * 6, { tint: TINTS[Math.floor(R() * 4)] });
      for (let i = 0; i < 18; i++) add(['rock_a', 'rock_b', 'rock_c'][i % 3], 600 + (R() - 0.5) * 220, -500 + (R() - 0.5) * 220, R() * 6, { scale: 0.7 + R() });
      // ---- Erweitertes Industriegebiet: offene Bauwerke zum Durchfliegen
      add('warehouse', -40, -265); add('warehouse', 330, 200, Math.PI / 2); add('bando', 250, 255); add('bando', -330, 250, 0.0);
      add('steel_frame', -300, -195); add('steel_frame', 330, 100, Math.PI / 2); add('steel_frame', -70, 255);
      for (let k = 0; k < 6; k++) add('pipe_rack', -380 + k * 40.4, 150);          // lange Rohrbrücke West
      for (let k = 0; k < 5; k++) add('pipe_rack', 260, -280 + k * 40.4, Math.PI / 2); // Rohrbrücke Ost
      for (let k = 0; k < 4; k++) add('pipe_rack', -20 + k * 40.4, -215);          // Rohrbrücke Süd
      add('conveyor', -220, 10); add('conveyor', 380, -240, Math.PI); add('conveyor', 70, 300, -Math.PI / 2);
      add('silos', -340, 50); add('silos', 120, -275); add('silos', 380, -120);
      add('shed', 40, 85); add('shed', -190, 245); add('shed', 200, -235, Math.PI / 2); add('shed', -250, -290);
      add('parking', -330, -60, Math.PI / 2); add('parking', 0, 280);
      add('gantry', 165, 110, Math.PI / 2); add('gantry', 340, 30, 0);
      add('chimney', 300, -300); add('water_tower', -380, -300);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        if (R() < 0.2) continue;
        const n = 1 + Math.floor(R() * 4);
        for (let k = 0; k < n; k++) add('container', 290 + i * 28, -5 + j * 28, R() < 0.3 ? Math.PI / 2 : 0, { y: k * 2.59, tint: TINTS[Math.floor(R() * TINTS.length)] });
      }
      for (let x = -400; x <= 400; x += 40) { if (Math.abs(x) > 240) { add('light_pole', x, -50, Math.PI / 2); } }
      const pyl = [];
      for (let i = -3; i <= 3; i++) { const x = i * 180, z = 440 + Math.sin(i) * 25; add('pylon', x, z, Math.PI / 2); pyl.push(P.length - 1); }
      const gates = [[0, 120, 0], [-40, 40, 0.4], [-120, -10, Math.PI / 2], [-150, -80, Math.PI / 2], [-80, -80, Math.PI / 2],
        [55, -100, 0], [130, -150, -1.2], [160, -5, Math.PI], [160, 90, Math.PI], [90, 150, Math.PI / 2], [30, 160, 1.2]];
      gates.forEach(([x, z, yaw]) => add('gate', x, z, yaw));
      return { props: P, pylons: pyl, gateStart: P.length - gates.length, scatter: { trees: 3800, rocks: 260, bushes: 900, treeline: 230, exclude: (x, z) => Math.abs(x) < 470 && Math.abs(z) < 385 } };
    },
  },
  factory: {
    look: { sky: [10, 0.6, 0.012, 0.7], sun: [0xffe6c8, 2.4] },
    title: 'Verlassene Fabrik', desc: 'Verfallene Fabrikstadt für FPV: eingestürzte Werkshalle, Ruinen mit eingebrochenen Decken, Kühltürme, Hochöfen, Verbindungsbrücken, Schutt, Wracks und Bewuchs.',
    build(h) {
      const P = [], R = rnd(99);
      const add = (model, x, z, yaw = 0, o = {}) => P.push({ model, x, z, y: o.y ?? Math.max(0, h(x, z)), yaw, scale: o.scale || 1, tint: o.tint });
      const W = { brick_a: 14, brick_b: 10, brick_c: 18, brick_d: 12 };
      const kinds = Object.keys(W);
      // Häuserzeile entlang einer Straße: Wand an Wand, gelegentlich eine Gasse zum Durchfliegen
      const row = (a0, a1, c, yaw, alongX) => {
        let p = a0;
        while (p < a1 - 9) {
          const k = kinds[Math.floor(R() * kinds.length)];
          const w = W[k];
          if (p + w > a1) break;
          const m = p + w / 2;
          const name = R() < 0.45 ? k.replace('brick', 'ruin') : k;   // fast jedes zweite Haus ist eine Ruine
          const tint = GRIME[Math.floor(R() * GRIME.length)];
          alongX ? add(name, m, c, yaw, { tint }) : add(name, c, m, yaw, { tint });
          p += w + (R() < 0.15 ? 6 : 0);
        }
      };
      const segX = [[-253, -127], [-113, 113], [127, 253]];
      const segZ = [[-153, -87], [-33, 33], [87, 153]];
      for (const [a, b] of segX) { row(a, b, -74, Math.PI, true); row(a, b, 74, 0, true); row(a, b, -166, 0, true); row(a, b, 166, Math.PI, true); }
      for (const [a, b] of segZ) { row(a, b, -246, Math.PI / 2, false); row(a, b, 246, -Math.PI / 2, false); row(a, b, -274, -Math.PI / 2, false); row(a, b, 274, Math.PI / 2, false); }
      row(-33, 33, -106, Math.PI / 2, false); row(-33, 33, 106, -Math.PI / 2, false);
      // Zentrum: Werkshalle mit Rohrbrücken und Schornsteinen
      add('factory_hall', 0, 0, 0, { tint: '#cfc6ba' });
      for (let k = 0; k < 4; k++) { add('pipe_rack', -60.6 + k * 40.4, -40); add('pipe_rack', -60.6 + k * 40.4, 40); }
      add('chimney', 92, -36); add('chimney', -92, 36); add('chimney', -330, -110); add('chimney', 90, -240); add('chimney', -30, -232);
      // Verbindungsbrücken über die Straßen
      for (const x of [-190, -80, 0, 80, 190]) { add('skywalk', x, -60, Math.PI / 2); add('skywalk', x, 60, Math.PI / 2); }
      for (const z of [-120, 0, 120]) { add('skywalk', -120, z, 0); add('skywalk', 120, z, 0); }
      for (const z of [-120, 120]) { add('skywalk', -260, z, 0); add('skywalk', 260, z, 0); }
      // Höfe zwischen den Zeilen
      add('furnace', -190, -125); add('silos', -40, -125); add('conveyor', 30, -118, Math.PI); add('furnace', 175, -125, Math.PI);
      add('steel_frame', -190, 120); add('shed', -40, 120); add('gantry', 40, 120, Math.PI / 2); add('water_tower', 190, 120);
      for (let i = 0; i < 6; i++) add('container', 10 + (i % 3) * 7, 110 + Math.floor(i / 3) * 18, Math.PI / 2, { tint: TINTS[i % TINTS.length] });
      // Norden: Kühltürme, Hochofen, Schienen
      add('cooling_tower', -200, -310); add('cooling_tower', 210, -320); add('furnace', -10, -300); add('silos', 90, -380);
      add('water_tower', -380, -380); add('steel_frame', -380, -230, Math.PI / 2);
      for (let k = 0; k < 18; k++) add('container', -420 + k * 22, -250, 0, { tint: TINTS[k % TINTS.length], y: (k % 4 === 0 ? 2.59 : 0) });
      // Osten: Containerlager mit Portalkran
      for (let i = 0; i < 5; i++) for (let j = 0; j < 6; j++) {
        if (R() < 0.15) continue;
        const n = 1 + Math.floor(R() * 4);
        for (let k = 0; k < n; k++) add('container', 315 + i * 26, -45 + j * 28, R() < 0.3 ? Math.PI / 2 : 0, { y: k * 2.59, tint: TINTS[Math.floor(R() * TINTS.length)] });
      }
      add('gantry', 370, 20, 0); add('steel_frame', 340, -150, Math.PI / 2); add('conveyor', 420, -230, Math.PI);
      // Süden & Westen
      add('parking', -180, 280); add('steel_frame', 0, 260); add('shed', 150, 250); add('silos', 300, 260); add('conveyor', 250, 300, -Math.PI / 2);
      for (let k = 0; k < 6; k++) add('pipe_rack', -305, -101 + k * 40.4, Math.PI / 2);
      add('silos', -390, 10); add('conveyor', -420, -60, Math.PI / 2); add('bando', -390, 250); add('warehouse', 380, 200, Math.PI / 2);
      for (const z of [-180, -60, 60, 180]) for (let x = -440; x <= 440; x += 45) if (Math.abs(x) % 120 > 15 && R() < 0.3) add('light_pole', x, z - 8, Math.PI / 2);
      // Verfall: Wracks, Schutt, umgestürzte Träger auf Straßen und Höfen
      const streetSpot = () => {
        const alongX = R() < 0.5, c = [-180, -60, 60, 180][Math.floor(R() * 4)], t = (R() * 2 - 1) * 430;
        const off = (R() * 2 - 1) * 4.5;
        return alongX ? [t, c + off, R() < 0.5 ? 0.05 : Math.PI + 0.1] : [[-260, -120, 120, 260][Math.floor(R() * 4)] + off, t, Math.PI / 2];
      };
      const nearSpawn = (x, z) => Math.hypot(x + 20, z - 60) < 18;
      for (let i = 0; i < 28; i++) { const [x, z, yaw] = streetSpot(); if (!nearSpawn(x, z)) add('car_wreck', x, z, yaw + (R() - 0.5) * 0.6); }
      for (let i = 0; i < 22; i++) { const [x, z] = streetSpot(); if (!nearSpawn(x, z)) add('rubble_pile', x, z, R() * 6, { scale: 0.5 + R() * 0.5 }); }
      for (const [x, z] of [[-120, -125], [90, -125], [-40, 160], [120, 140], [-300, -60], [330, 60], [0, -200], [200, -200]]) add('fallen_beams', x, z, R() * 6);
      // Bewuchs: Büsche auf Straßen/Höfen, Bäume in Höfen und in der eingestürzten Halle
      for (let i = 0; i < 160; i++) { const [x, z] = streetSpot(); if (!nearSpawn(x, z)) add('bush', x, z + (R() - 0.5) * 3, R() * 6, { scale: 0.35 + R() * 0.5 }); }
      for (const [x, z] of [[-150, -120], [-90, -100], [60, -150], [130, -100], [-150, 130], [-90, 100], [90, 150], [150, 100], [-200, -230], [210, -230], [0, -150], [-380, 120], [380, 140]]) {
        add(R() < 0.5 ? 'tree_b' : 'tree_a', x + (R() - 0.5) * 10, z + (R() - 0.5) * 10, R() * 6, { scale: 0.55 + R() * 0.4 });
        add('bush', x + 6, z + 4, R() * 6, { scale: 0.8 });
      }
      for (const [x, z] of [[-8, -6], [36, 8], [-38, -4], [10, 12]]) add('tree_b', x, z, R() * 6, { y: 0.3, scale: 0.45 + R() * 0.2 });
      // ---- dichter: Baukräne, hohe Schornsteine, Wellblech-Unterstände und Schrott in Höfen und an Straßen
      add('tower_crane', -105, 140, 0.6); add('tower_crane', 150, -135, 2.3); add('tower_crane', 360, 150, -1.2);
      add('chimney_tall', -110, -262); add('chimney_tall', 330, -330); add('chimney_tall', -340, 330);
      const free = (x, z, d) => P.every((q) => Math.hypot(q.x - x, q.z - z) > d + (q.model.startsWith('brick') || q.model.startsWith('ruin') ? 6 : q.model === 'factory_hall' ? 50 : q.model === 'cooling_tower' ? 36 : 8));
      const scatterIn = (model, n, x0, x1, z0, z1, d) => { for (let k = 0, tries = 0; k < n && tries < n * 30; tries++) { const x = x0 + R() * (x1 - x0), z = z0 + R() * (z1 - z0); if (!free(x, z, d)) continue; add(model, x, z, R() * 6); k++; } };
      for (const [z0, z1] of [[-150, -95], [95, 150]]) for (const [x0, x1] of [[-245, -135], [-105, 105], [135, 245]]) {
        scatterIn(R() < 0.5 ? 'roof_shed_a' : 'roof_shed_b', 2, x0, x1, z0, z1, 9);
        scatterIn('scrap_pile', 2, x0, x1, z0, z1, 5);
      }
      scatterIn('roof_shed_a', 6, -450, 450, -440, -200, 10); scatterIn('roof_shed_b', 6, -450, 450, 200, 440, 10);
      scatterIn('scrap_pile', 12, -450, 450, -450, 450, 6);
      // Rennstrecke: in die Halle, quer hindurch, raus durchs Westtor, um den Block
      const pts = [[20, 34, 0], [20, 8, 0.3], [-20, 0, 0.3], [-62, 0, 0], [-120, -30, 0], [-80, -60, 0], [0, -60, 0], [120, -25, 0], [120, 30, 0], [60, 60, 0]];
      pts.forEach(([x, z, y], i) => {
        const [nx, nz] = pts[(i + 1) % pts.length];
        add('gate', x, z, Math.atan2(-(nx - x), -(nz - z)), { y });
      });
      return { props: P, pylons: [], gateStart: P.length - pts.length, scatter: { trees: 3000, rocks: 200, bushes: 600, treeline: 260, exclude: (x, z) => Math.abs(x) < 520 && Math.abs(z) < 520 } };
    },
  },
  jungle: {
    title: 'Dschungel-Tempel', desc: 'Überwucherte Stufenpyramide mit Tunnel und Schacht, Kragbogen-Ruinen, Urwaldriesen mit Lianen, Fluss mit Hängebrücke.',
    look: { layers: ['jungle_floor', 'mud', 'mossy_stone', 'gravel', 'mud', 'rock'], sky: [7, 2.2, 0.012, 0.78], sun: [0xfff0d0, 2.6],
      hemi: [0xc8f0c0, 0x2a3518, 0.45], env: 0.45, snowLine: 9999, water: 0x2e3a1e, grassTint: 0, fog: [0.0012, '#7c8c76'] },
    build(h) {
      const P = [], R = rnd(17);
      const add = (model, x, z, yaw = 0, o = {}) => P.push({ model, x, z, y: o.y ?? h(x, z), yaw, scale: o.scale || 1, tint: o.tint });
      const zr = (x) => 150 + 70 * Math.sin(x / 210);
      add('temple_pyramid', 0, 0, Math.PI, { y: 6 });
      add('ruin_gate', 0, 54, 0, { y: 6 });
      for (let k = 0; k < 9; k++) {
        const a = k / 9 * Math.PI * 2 + 0.35, r = 46 + R() * 10;
        if (Math.abs(Math.sin(a) - 1) < 0.15) continue;
        add(k % 3 === 0 ? 'stelae' : 'ruin_wall', Math.cos(a) * r, Math.sin(a) * r, -a + Math.PI / 2, { y: 6 });
      }
      // Ruinen-Gruppen im Urwald
      for (let k = 0; k < 14; k++) {
        const a = R() * Math.PI * 2, r = 110 + R() * 320, x = Math.cos(a) * r, z = Math.sin(a) * r;
        if (Math.abs(z - zr(x)) < 40) continue;
        add(R() < 0.6 ? 'ruin_wall' : 'ruin_gate', x, z, R() * 6, { y: h(x, z) - 0.5 });
        add('stelae', x + 12, z + 6, R() * 6);
      }
      const bx = -230, bz = zr(bx);
      add('rope_bridge', bx, bz, Math.PI / 2, { y: Math.min(h(bx, bz - 23), h(bx, bz + 23)) - 0.3 });
      for (let k = 0; k < 40; k++) { const x = -400 + k * 20, z = zr(x) + (R() < 0.5 ? -1 : 1) * (18 + R() * 8); add('fern', x, z, R() * 6, { scale: 0.8 + R() * 0.8 }); }
      const pts = [[0, 52], [-40, 0], [0, 0], [40, 0], [70, 60], [10, zr(10)], [-120, zr(-120)], [bx, bz], [-150, 30]];
      pts.forEach(([x, z], i) => { const [nx, nz] = pts[(i + 1) % pts.length]; add('gate', x, z, Math.atan2(-(nx - x), -(nz - z)), { y: Math.abs(x) < 70 && Math.abs(z) < 70 ? 6 : Math.max(0, h(x, z)) }); });
      return { props: P, pylons: [], gateStart: P.length - pts.length,
        scatter: { trees: 6500, rocks: 250, bushes: 2500, treeline: 300, treeSlope: 0.65, forestCut: 0.25, anyGround: true,
          treeModels: ['jungle_tree_a', 'jungle_tree_b', 'jungle_tree_b', 'palm_a', 'palm_b', 'tree_a'], bushModel: 'fern', rockTint: '#7d8a6a',
          exclude: (x, z) => Math.hypot(x, z) < 66 || Math.abs(z - zr(x)) < 16 } };
    },
  },
  canyon: {
    title: 'Wüsten-Canyon', desc: 'Tiefe, terrassierte Schlucht: Felsbogen, Hoodoos, Flugzeugwrack, Holz-Eisenbahnbrücke über eine Rinne, alte Mine, Kakteen.',
    look: { layers: ['sand', 'dirt', 'red_rock', 'gravel', 'asphalt', 'red_rock'], sky: [2.4, 0.8, 0.006, 0.86], sun: [0xffdcb0, 3.8],
      hemi: [0xbfd6ff, 0x8a5a3a, 0.45], env: 0.5, snowLine: 9999, grassTint: 0 },
    build(h) {
      const P = [], R = rnd(29);
      const add = (model, x, z, yaw = 0, o = {}) => P.push({ model, x, z, y: o.y ?? h(x, z), yaw, scale: o.scale || 1, tint: o.tint });
      const zc = (x) => 90 * Math.sin(x / 230) + 30 * Math.sin(x / 90);
      const tz = zc(-300) + 160, tx = -300 + 15 * Math.sin(tz / 40);
      add('trestle', tx, tz, 0, { y: h(tx, tz) - 0.5 });
      add('mine_head', tx + 70, tz + 40, 0.4);
      add('plane_wreck', 180, zc(180), -0.3, { y: h(180, zc(180)) - 0.6 });
      add('rock_arch', -150, zc(-150), Math.PI / 2 + 0.2);
      add('rock_arch', 330, zc(330) + 20, Math.PI / 2 - 0.3, { scale: 0.8 });
      for (let k = 0; k < 34; k++) {
        const x = -520 + R() * 1040, side = R() < 0.5 ? -1 : 1, z = zc(x) + side * (130 + R() * 260);
        add(R() < 0.5 ? 'hoodoo_a' : 'hoodoo_b', x, z, R() * 6, { y: h(x, z) - 1, scale: 0.7 + R() * 0.6 });
      }
      for (let k = 0; k < 10; k++) { const x = -500 + k * 100, z = zc(x) + (R() - 0.5) * 40; add(R() < 0.5 ? 'hoodoo_b' : 'rock_c', x, z, R() * 6, { scale: 0.5 + R() * 0.4, tint: '#c88a5a' }); }
      const pts = [];
      for (let x = -450; x <= 450; x += 90) pts.push([x, zc(x) + (pts.length % 2 ? 14 : -14)]);
      pts.push([300, zc(300) + 160], [-300, tz - 60]);
      pts.forEach(([x, z], i) => { const [nx, nz] = pts[(i + 1) % pts.length]; add('gate', x, z, Math.atan2(-(nx - x), -(nz - z))); });
      return { props: P, pylons: [], gateStart: P.length - pts.length,
        scatter: { trees: 1100, rocks: 500, bushes: 400, treeline: 999, treeSlope: 0.9, forestCut: -1, anyGround: true,
          treeModels: ['cactus'], rockModels: ['rock_a', 'rock_b', 'rock_c'], rockTint: '#c98a5c',
          exclude: (x, z) => Math.hypot(x + 40, z - zc(-40)) < 30 } };
    },
  },
  alpine: {
    title: 'Winter-Bergstation', desc: 'Verschneiter Berghang: Seilbahn mit Gondeln und offenen Stationen, Skisprungschanze, Funkmast, Almhütten und verschneite Tannen.',
    look: { layers: ['snow', 'gravel', 'concrete', 'gravel', 'asphalt', 'rock'], sky: [1.8, 0.9, 0.003, 0.88], sun: [0xffffff, 3.6],
      hemi: [0xd8e8ff, 0x8a98a8, 0.6], env: 0.75, snowLine: 9999, grassTint: 0 },
    build(h) {
      const P = [], R = rnd(41);
      const add = (model, x, z, yaw = 0, o = {}) => P.push({ model, x, z, y: o.y ?? h(x, z), yaw, scale: o.scale || 1, tint: o.tint });
      const lift = [];
      add('lift_station', 80, 300, 0); lift.push(P.length - 1);
      for (const z of [190, 60, -70, -200, -330]) { add('lift_tower', 80, z, 0); lift.push(P.length - 1); }
      add('lift_station', 80, -460, Math.PI); lift.push(P.length - 1);
      add('ski_jump', -170, 120, -Math.PI / 2, { y: h(-170, 165) - 1.5 });
      add('radio_mast', -360, -250, 0.3);
      for (let k = 0; k < 12; k++) { const x = -180 + R() * 360, z = 310 + R() * 110; if (Math.abs(x - 80) < 25) continue; add('chalet', x, z, R() * 6); }
      add('chalet', 60, -500, 0.2); add('chalet', -60, -330, 1.1);
      const pist = (z) => 20 * Math.sin(z / 120);
      const pts = [[pist(-300), -300], [pist(-180) + 15, -180], [pist(-60) - 15, -60], [pist(60) + 15, 60], [pist(180) - 15, 180], [40, 268], [100, 150], [100, 0], [100, -150]];
      pts.forEach(([x, z], i) => { const [nx, nz] = pts[(i + 1) % pts.length]; add('gate', x, z, Math.atan2(-(nx - x), -(nz - z))); });
      return { props: P, pylons: [], lines: [{ idx: lift, sag: 3, gondola: true }], gateStart: P.length - pts.length,
        scatter: { trees: 4000, rocks: 300, bushes: 0, treeline: 330, treeSlope: 0.78, forestCut: 0.4, anyGround: true,
          treeModels: ['snow_pine_a', 'snow_pine_b', 'snow_pine_b'], rockTint: '#9aa0a8',
          exclude: (x, z) => Math.abs(x - pist(z)) < 60 || Math.abs(x - 80) < 14 || (z > 280 && Math.abs(x) < 200) || Math.hypot(x + 170, z - 120) < 55 } };
    },
  },
  alpsee: {
    title: 'Bergsee & Staudamm', desc: 'Alpines Tal mit See, 40 m hoher Staumauer, Entnahmeturm, Steg und dichten Nadelwäldern.',
    build(h, meta) {
      const P = [], R = rnd(7);
      const add = (model, x, z, yaw = 0, o = {}) => P.push({ model, x, z, y: o.y ?? h(x, z), yaw, scale: o.scale || 1, tint: o.tint });
      add('dam', meta.damX + 3.5, meta.damZ, Math.PI / 2, { y: -38 });
      const [sx, , sz] = meta.spawn;
      add('pier', sx + 25, meta.shoreZ - 4, 0, { y: 0 });
      add('cabin', sx - 30, sz + 14, 0.2); add('cabin', sx + 70, sz + 22, -0.3);
      for (let i = 0; i < 30; i++) add(['rock_a', 'rock_b', 'rock_c'][i % 3], sx - 300 + R() * 600, sz - 10 + R() * 60, R() * 6, { scale: 0.5 + R() });
      const zc = (x) => 70 * Math.sin(x / 320) + 25 * Math.sin(x / 97);
      const gates = [];
      const pts = [[0, 0.45], [-160, 0.55], [-320, 0.3], [-420, -0.1], [-330, -0.5], [-150, -0.55], [20, -0.45], [150, -0.25], [210, 0.05], [120, 0.3]];
      pts.forEach(([x, f], i) => {
        const z = zc(x) + f * 210, nx = pts[(i + 1) % pts.length];
        const yaw = Math.atan2(-(nx[0] - x), -((zc(nx[0]) + nx[1] * 210) - z));
        gates.push([x, z, yaw]);
      });
      gates.forEach(([x, z, yaw]) => add('gate', x, z, yaw, { y: Math.max(0, h(x, z)) }));
      return { props: P, pylons: [], gateStart: P.length - gates.length, scatter: { trees: 6000, rocks: 500, bushes: 1200, treeline: 520, exclude: (x, z) => Math.abs(x - meta.damX) < 60 && Math.abs(z - meta.damZ) < 110 } };
    },
  },
};
