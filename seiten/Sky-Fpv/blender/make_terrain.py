# -----------------------------------------------------------------------------
# Sky FPV - Terrain-Generator
# Backt Noise-Felder in Blender (Cycles) und formt daraus mit numpy die Karten:
#   assets/terrain/<map>/height.bin   Float32, N x N, Zeile j = Welt-Z, Spalte i = Welt-X
#   assets/terrain/<map>/splat_a.png  R = Erde, G = Beton, B = Kies
#   assets/terrain/<map>/splat_b.png  R = Asphalt, G = Sand, B = Waldmaske
#   assets/terrain/<map>/meta.json
# Aufruf: blender -b --factory-startup -P make_terrain.py
# -----------------------------------------------------------------------------
import os
import sys
import json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from _common import reset, bake_fields, save_image, ensure_dir, TERRAIN

N = 1025
SIZE = 2048.0
SPLAT = 1024


def nrm(a, lo=1.0, hi=99.0):
    a0, a1 = np.percentile(a, lo), np.percentile(a, hi)
    return np.clip((a - a0) / max(a1 - a0, 1e-6), 0.0, 1.0)


def sstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def F(kind, cells, **kw):
    d = {'kind': kind, 'cells': cells, 'tile': False}
    d.update(kw)
    return d


def grid(n):
    c = np.linspace(-SIZE / 2, SIZE / 2, n, dtype=np.float32)
    return c[None, :].repeat(n, 0), c[:, None].repeat(n, 1)


def resample(a, n):
    """Bilineares Resampling eines (N,N)-Feldes auf (n,n) (Pixelzentren)."""
    src = a.shape[0]
    t = (np.arange(n) + 0.5) / n * (src - 1)
    i0 = np.floor(t).astype(int)
    i1 = np.minimum(i0 + 1, src - 1)
    f = (t - i0).astype(np.float32)
    rows = a[i0, :] * (1 - f)[:, None] + a[i1, :] * f[:, None]
    return rows[:, i0] * (1 - f)[None, :] + rows[:, i1] * f[None, :]


def write_map(name, h, splat_a, splat_b, meta):
    d = ensure_dir(os.path.join(TERRAIN, name))
    h.astype('<f4').tofile(os.path.join(d, 'height.bin'))
    # Bildzeile 0 ist in Blender unten => für den Browser (Zeile 0 oben = Welt-Z min) spiegeln
    save_image(os.path.join(d, 'splat_a.png'), np.flipud(splat_a))
    save_image(os.path.join(d, 'splat_b.png'), np.flipud(splat_b))
    meta.update({'size': SIZE, 'res': N, 'minH': float(h.min()), 'maxH': float(h.max())})
    with open(os.path.join(d, 'meta.json'), 'w') as fh:
        json.dump(meta, fh, indent=1)
    print('[SkyFPV] Terrain', name, 'Höhe %.1f .. %.1f' % (h.min(), h.max()), flush=True)


def sample(h, x, z):
    i = (x + SIZE / 2) / SIZE * (N - 1)
    j = (z + SIZE / 2) / SIZE * (N - 1)
    return float(h[int(round(j)), int(round(i))])


# ----------------------------------------------------------------------------- Karte 1: Altes Stahlwerk
def map_steelworks():
    big, med, rid = bake_fields([F('noise', 2.5, detail=6, seed=1.0), F('noise', 9, detail=6, seed=2.0),
                                 F('ridged', 3.5, detail=9, seed=3.0)], N)
    fine, patch, forest = bake_fields([F('noise', 70, detail=4, seed=4.0), F('noise', 14, detail=5, seed=5.0),
                                       F('noise', 5, detail=4, seed=6.0)], N)
    X, Z = grid(N)
    r = np.sqrt(X ** 2 + Z ** 2)
    h = (nrm(big) - 0.5) * 38 + (nrm(med) - 0.5) * 14 + (nrm(fine) - 0.5) * 2.0
    mount = sstep(380, 920, r + (nrm(med) - 0.5) * 240)
    h += mount * (nrm(rid) ** 1.35 * 320 + 25)
    # Industriehof planieren
    dx = np.maximum(np.abs(X) - 420, 0)
    dz = np.maximum(np.abs(Z) - 335, 0)
    yard = 1 - sstep(0, 95, np.sqrt(dx ** 2 + dz ** 2))
    h = h * (1 - yard)
    # Steinbruch mit Terrassen im Nordosten
    qx, qz = 600.0, -500.0
    qd = np.sqrt((X - qx) ** 2 + (Z - qz) ** 2)
    depth = 24 * (1 - sstep(10, 120, qd))
    t = depth / 6.0
    terr = (np.floor(t) + sstep(0.7, 1.0, t - np.floor(t))) * 6.0
    qmask = 1 - sstep(105, 150, qd)
    base_q = np.minimum(h, 4.0)
    h = h * (1 - qmask) + (base_q - terr) * qmask
    # Splat
    sx, sz = grid(SPLAT)
    rs = lambda a: resample(a, SPLAT)
    p = rs(nrm(patch))
    fi = rs(nrm(fine))
    core = ((np.abs(sx) < 405) & (np.abs(sz) < 320)).astype(np.float32)
    concrete = core * (1 - sstep(0.66, 0.74, p))
    road_z = np.where(sx < -420, -40 + 30 * np.sin((sx + 420) / 120.0), -40.0)
    asphalt = (1 - sstep(4.5, 6.5, np.abs(sz - road_z))) * (sx < 420)
    asphalt = np.maximum(asphalt, (1 - sstep(4.0, 6.0, np.abs(sx - 60))) * core)
    gravel = ((sx > 95) & (sx < 235) & (sz > 15) & (sz < 195)).astype(np.float32) * (0.6 + 0.4 * fi)
    qd_s = np.sqrt((sx - qx) ** 2 + (sz - qz) ** 2)
    gravel = np.maximum(gravel, 1 - sstep(95, 125, qd_s))
    gravel = np.maximum(gravel, (1 - sstep(2.5, 4.0, np.abs(sx + 205))) * (np.abs(sz) < 320))
    gravel = np.maximum(gravel, ((sx > 280) & (sx < 400) & (sz > -20) & (sz < 100)).astype(np.float32) * (0.6 + 0.4 * fi))
    yard_s = rs(yard)
    path_z = 400 + 40 * np.sin(sx / 90.0) + 25 * np.sin(sx / 31.0)
    dirt = (1 - sstep(2.0, 3.5, np.abs(sz - path_z))) * (np.abs(sx) < 700)
    path_x = -470 + 40 * np.sin(sz / 70.0)
    dirt = np.maximum(dirt, (1 - sstep(2.0, 3.5, np.abs(sx - path_x))) * (np.abs(sz) < 600))
    dirt = np.maximum(dirt, sstep(0.15, 0.4, yard_s) * (1 - sstep(0.6, 0.95, yard_s)) * sstep(0.45, 0.6, p))
    dirt = np.maximum(dirt, core * sstep(0.68, 0.76, p) * 0.9)
    concrete *= (1 - asphalt)
    gravel *= (1 - asphalt) * (1 - concrete * 0.0)
    forest_m = rs(nrm(forest)) * (1 - yard_s) * (1 - (1 - sstep(95, 160, qd_s)))
    splat_a = np.stack([dirt, concrete, gravel], -1)
    splat_b = np.stack([asphalt, np.zeros_like(dirt), forest_m], -1)
    meta = {'name': 'Altes Stahlwerk', 'water': None,
            'spawn': [0.0, 0.0, 150.0], 'spawnYaw': 0.0, 'pilot': [6.0, 1.7, 158.0],
            'fog': [0.00045, '#b9c7d3'], 'sun': [0.55, 0.62, 0.35]}
    write_map('steelworks', h.astype(np.float32), splat_a, splat_b, meta)


# ----------------------------------------------------------------------------- Karte 2: Bergsee & Staudamm
def map_alpsee():
    big, med, rid = bake_fields([F('noise', 2.5, detail=6, seed=11.0), F('noise', 10, detail=7, seed=12.0),
                                 F('ridged', 4.0, detail=10, seed=13.0)], N)
    fine, patch, forest = bake_fields([F('noise', 80, detail=4, seed=14.0), F('noise', 16, detail=5, seed=15.0),
                                       F('noise', 6, detail=4, seed=16.0)], N)
    X, Z = grid(N)
    DAM_X = 262.0

    def zc(x):
        return 70 * np.sin(x / 320.0) + 25 * np.sin(x / 97.0)

    def hw(x):
        return 300 - 225 * sstep(120, 235, x) + 25 * sstep(300, 480, x)

    d = np.abs(Z - zc(X))
    H = hw(X)
    floor = np.where(X < DAM_X - 4, 2.2 + (nrm(med) - 0.5) * 3.0 + (nrm(fine) - 0.5) * 0.8,
                     -38.0 - np.maximum(X - 300, 0) * 0.025 + (nrm(fine) - 0.5) * 0.6)
    # See
    lake_hw = np.where(X < 200, H - 95, H - 4) * sstep(-600, -470, X)
    lake_hw = np.maximum(lake_hw, 1.0)
    bed = -1.0 - 15.0 * np.clip(1 - (d / lake_hw) ** 2, 0, 1) - (nrm(med) - 0.5) * 2
    in_lake = (X < DAM_X - 3).astype(np.float32)
    shore = sstep(lake_hw * 0.86, lake_hw * 1.12, d)
    valley = floor * (1 - in_lake) + (bed * (1 - shore) + floor * shore) * in_lake
    # Talflanken / Berge
    wd = np.maximum(d - H, 0)
    walls = wd * 0.85 + (nrm(rid) ** 1.25) * 420 * sstep(0, 260, wd) + (nrm(big) - 0.5) * 60 * sstep(0, 120, wd)
    base_floor = np.where(X < DAM_X - 4, 2.0, -38.0)
    h = valley + walls + (base_floor - floor) * 0 * sstep(0, 1, wd)
    # Talenden schließen
    ends = sstep(780, 1000, np.abs(X)) * (300 + nrm(rid) * 200)
    h = h + ends
    # Dammbereich glätten (Fundament)
    damzone = (1 - sstep(0, 6, np.abs(X - (DAM_X + 12)) - 18)) * (1 - sstep(70, 95, d))
    h = h * (1 - damzone) + np.minimum(h, -38.0) * damzone
    # Splat
    sx, sz = grid(SPLAT)
    rs = lambda a: resample(a, SPLAT)
    ds = np.abs(sz - zc(sx))
    lhw = rs(lake_hw)
    fi = rs(nrm(fine))
    p = rs(nrm(patch))
    gravel = (1 - sstep(0.07, 0.12, np.abs(ds / np.maximum(lhw, 1) - 1.0))) * (sx < DAM_X - 3) * sstep(-560, -500, sx)
    road_d = -(hw(sx) - 40)
    asphalt = (1 - sstep(3.0, 4.5, np.abs((sz - zc(sx)) - road_d))) * (sx < DAM_X) * (sx > -760)
    trail = zc(sx) + (lhw + 45)
    dirt = (1 - sstep(1.5, 3.0, np.abs(sz - trail))) * (sx < 200) * (sx > -700)
    dirt = np.maximum(dirt, sstep(0.72, 0.8, p) * 0.8)
    gravel = np.maximum(gravel, ((sx > DAM_X + 25) & (ds < 30)).astype(np.float32) * (0.5 + 0.5 * fi))
    concrete = ((np.abs(sx - DAM_X) < 4) & (ds < 80)).astype(np.float32) * 0.0
    sand = gravel * sstep(0.4, 0.6, fi) * 0.0
    forest_m = rs(nrm(forest))
    splat_a = np.stack([dirt * (1 - asphalt), concrete, gravel * (1 - asphalt)], -1)
    splat_b = np.stack([asphalt, sand, forest_m], -1)
    sp_x = -20.0
    sp_z = float(zc(np.array(sp_x)) + (float(hw(np.array(sp_x))) - 95) + 32)
    sp_y = sample(h, sp_x, sp_z)
    meta = {'name': 'Bergsee & Staudamm', 'water': 0.0, 'damX': DAM_X, 'damZ': float(zc(np.array(DAM_X))),
            'spawn': [sp_x, sp_y, sp_z], 'spawnYaw': 0.0, 'pilot': [sp_x + 5, sp_y + 1.7, sp_z + 8],
            'fog': [0.00032, '#c3d2df'], 'sun': [-0.45, 0.55, 0.5],
            'shoreZ': float(zc(np.array(sp_x)) + (float(hw(np.array(sp_x))) - 95))}
    write_map('alpsee', h.astype(np.float32), splat_a, splat_b, meta)

# ----------------------------------------------------------------------------- Karte 3: Hüttenwerk (dichte Fabrik)
def map_factory():
    big, med, rid = bake_fields([F('noise', 2.5, detail=6, seed=21.0), F('noise', 9, detail=6, seed=22.0),
                                 F('ridged', 3.5, detail=9, seed=23.0)], N)
    fine, patch, forest = bake_fields([F('noise', 70, detail=4, seed=24.0), F('noise', 14, detail=5, seed=25.0),
                                       F('noise', 5, detail=4, seed=26.0)], N)
    X, Z = grid(N)
    r = np.sqrt(X ** 2 + Z ** 2)
    h = (nrm(big) - 0.5) * 30 + (nrm(med) - 0.5) * 10 + (nrm(fine) - 0.5) * 1.5
    h += sstep(560, 950, r + (nrm(med) - 0.5) * 200) * (nrm(rid) ** 1.3 * 280 + 30)
    dx = np.maximum(np.abs(X) - 470, 0)
    dz = np.maximum(np.abs(Z) - 470, 0)
    plant = 1 - sstep(0, 80, np.sqrt(dx ** 2 + dz ** 2))
    h = h * (1 - plant) + (nrm(fine) - 0.5) * 0.05 * plant
    sx, sz = grid(SPLAT)
    rs = lambda a: resample(a, SPLAT)
    p = rs(nrm(patch))
    fi = rs(nrm(fine))
    core = ((np.abs(sx) < 465) & (np.abs(sz) < 465)).astype(np.float32)
    asphalt = np.zeros_like(sx)
    for c in (-180, -60, 60, 180):
        asphalt = np.maximum(asphalt, (1 - sstep(6.0, 7.5, np.abs(sz - c))) * core)
    for c in (-260, -120, 120, 260):
        asphalt = np.maximum(asphalt, (1 - sstep(6.0, 7.5, np.abs(sx - c))) * core)
    gravel = (1 - sstep(2.5, 4.0, np.abs(sz + 250))) * core
    gravel = np.maximum(gravel, (1 - sstep(2.5, 4.0, np.abs(sx + 330))) * core)
    gravel = np.maximum(gravel, ((sx > 300) & (sx < 440) & (sz > -60) & (sz < 120)).astype(np.float32) * (0.6 + 0.4 * fi))
    # Verlassen: Gras bricht durch Beton und Asphalt, Erde in Senken
    over = sstep(0.48, 0.66, p * 0.7 + fi * 0.3)
    asphalt = asphalt * (1 - over * 0.85)
    concrete = core * (1 - asphalt) * (1 - gravel) * (1 - over)
    dirt = core * sstep(0.62, 0.75, fi) * (1 - asphalt) * 0.7 * (1 - over * 0.5)
    dirt = np.maximum(dirt, sstep(0.2, 0.5, rs(plant)) * (1 - sstep(0.6, 0.95, rs(plant))))
    forest_m = rs(nrm(forest)) * (1 - rs(plant))
    splat_a = np.stack([dirt, concrete, gravel], -1)
    splat_b = np.stack([asphalt, np.zeros_like(dirt), forest_m], -1)
    meta = {'name': 'Verlassene Fabrik', 'water': None,
            'spawn': [-20.0, 0.0, 60.0], 'spawnYaw': 0.0, 'pilot': [-14.0, 1.7, 66.0],
            'fog': [0.0015, '#8e8d86'], 'sun': [0.55, 0.3, 0.5]}
    write_map('factory', h.astype(np.float32), splat_a, splat_b, meta)


# ----------------------------------------------------------------------------- Karte 4: Dschungel-Tempel
def zr_jungle(x):
    return 150 + 70 * np.sin(x / 210.0)


def map_jungle():
    big, med, rid = bake_fields([F('noise', 3, detail=6, seed=31.0), F('noise', 12, detail=6, seed=32.0), F('ridged', 4, detail=8, seed=33.0)], N)
    fine, patch, _ = bake_fields([F('noise', 80, detail=4, seed=34.0), F('noise', 16, detail=5, seed=35.0), F('noise', 3)], N)
    X, Z = grid(N)
    r = np.sqrt(X ** 2 + Z ** 2)
    h = 8 + (nrm(big) - 0.5) * 60 + (nrm(med) - 0.5) * 18 + (nrm(fine) - 0.5) * 2
    h += sstep(520, 960, r) * (nrm(rid) ** 1.2 * 260 + 30)
    h += 30 * np.exp(-((X + 230) / 45.0) ** 2) * (np.abs(Z - zr_jungle(X)) > 10)   # Hügelrücken -> Schlucht für die Hängebrücke
    d = np.abs(Z - zr_jungle(X))
    bank = sstep(14, 55, d)
    h = -4.0 * (1 - bank) + np.maximum(h, 1.5) * bank
    plaza = 1 - sstep(62, 95, r)
    h = h * (1 - plaza) + 6.0 * plaza
    sx, sz = grid(SPLAT)
    rs = lambda a: resample(a, SPLAT)
    p, fi = rs(nrm(patch)), rs(nrm(fine))
    rr = np.sqrt(sx ** 2 + sz ** 2)
    ds = np.abs(sz - zr_jungle(sx))
    stone = (1 - sstep(48, 60, rr)) * (1 - sstep(0.62, 0.75, p))
    mud = np.maximum((1 - sstep(16, 34, ds)) * sstep(8, 14, ds), sstep(0.7, 0.82, p) * 0.7)
    trail = (1 - sstep(2.0, 3.5, np.abs(sx - 25 * np.sin(sz / 60.0)))) * (sz > 50) * (sz < zr_jungle(sx) - 14)
    mud = np.maximum(mud, trail)
    gravel = 1 - sstep(10, 16, ds)
    forest = (1 - stone) * sstep(16, 30, ds)
    meta = {'name': 'Dschungel-Tempel', 'water': 0.0, 'spawn': [0.0, 6.0, 72.0], 'spawnYaw': 0.0, 'pilot': [6.0, 7.7, 80.0],
            'fog': [0.0021, '#9fb29c'], 'sun': [0.35, 0.8, 0.3]}
    write_map('jungle', h.astype(np.float32), np.stack([mud * (1 - stone), stone, gravel], -1),
              np.stack([np.zeros_like(p), np.zeros_like(p), forest], -1), meta)


# ----------------------------------------------------------------------------- Karte 5: Wüsten-Canyon
def zc_canyon(x):
    return 90 * np.sin(x / 230.0) + 30 * np.sin(x / 90.0)


def map_canyon():
    big, med, rid = bake_fields([F('noise', 2.5, detail=5, seed=41.0), F('noise', 10, detail=6, seed=42.0), F('ridged', 5, detail=8, seed=43.0)], N)
    fine, patch, _ = bake_fields([F('noise', 70, detail=4, seed=44.0), F('noise', 14, detail=5, seed=45.0), F('noise', 3)], N)
    X, Z = grid(N)
    P = 62.0
    d = np.abs(Z - zc_canyon(X))
    w = 48 + 22 * np.sin(X / 150.0) + (nrm(med) - 0.5) * 20
    t = np.clip((d - w) / 55.0, 0, 1)
    raw = P * sstep(0, 1, t)
    st = raw / 10.0
    terr = (np.floor(st) + sstep(0.55, 1.0, st - np.floor(st))) * 10.0
    h = terr + (nrm(fine) - 0.5) * 1.2 + t * (nrm(big) - 0.5) * 14
    # Seitenrinne quer über das Plateau (für die Holzbrücke)
    dr = np.abs(X + 300 - 15 * np.sin(Z / 40.0))
    h -= 18 * (1 - sstep(18, 42, dr)) * sstep(0.8, 1.0, t)
    r = np.sqrt(X ** 2 + Z ** 2)
    h += sstep(650, 980, r) * (nrm(rid) ** 1.3 * 220 + 20)
    sx, sz = grid(SPLAT)
    rs = lambda a: resample(a, SPLAT)
    p, fi, ts = rs(nrm(patch)), rs(nrm(fine)), rs(t)
    ds = np.abs(sz - zc_canyon(sx))
    wash = (1 - sstep(6, 14, ds)) * (ts < 0.05)
    dirt = np.maximum(sstep(0.68, 0.8, p) * 0.8, wash * 0.0)
    rockflat = sstep(0.55, 0.7, p * 0.6 + fi * 0.4) * sstep(0.85, 1.0, ts)
    gravel = wash
    meta = {'name': 'Wüsten-Canyon', 'water': None, 'spawn': [-40.0, 2.0, float(zc_canyon(np.array(-40.0)))], 'spawnYaw': -1.4,
            'pilot': [-50.0, 3.7, float(zc_canyon(np.array(-50.0)))], 'fog': [0.0006, '#d8b994'], 'sun': [0.7, 0.42, 0.25]}
    write_map('canyon', h.astype(np.float32), np.stack([dirt, rockflat, gravel], -1),
              np.stack([np.zeros_like(p), np.zeros_like(p), np.zeros_like(p)], -1), meta)


# ----------------------------------------------------------------------------- Karte 6: Winter-Bergstation
def map_alpine():
    big, med, rid = bake_fields([F('noise', 2.5, detail=6, seed=51.0), F('noise', 10, detail=6, seed=52.0), F('ridged', 4, detail=9, seed=53.0)], N)
    fine, patch, forest = bake_fields([F('noise', 70, detail=4, seed=54.0), F('noise', 14, detail=5, seed=55.0), F('noise', 6, detail=4, seed=56.0)], N)
    X, Z = grid(N)
    slope = np.maximum(0, 270 - Z) * 0.42
    ridges = (nrm(rid) ** 1.3) * 200 * sstep(90, 320, np.abs(X))
    h = slope + ridges + (nrm(big) - 0.5) * 40 * sstep(0, 200, 270 - Z) + (nrm(med) - 0.5) * 10 + (nrm(fine) - 0.5) * 1.5
    piste = 1 - sstep(40, 75, np.abs(X - 20 * np.sin(Z / 120.0)))
    h = h * (1 - piste * 0.85) + (slope + (nrm(med) - 0.5) * 4) * piste * 0.85
    h = np.where(Z > 270, (nrm(fine) - 0.5) * 1.0 + (nrm(med) - 0.5) * 3, h)
    r = np.sqrt(X ** 2 + (Z - 200) ** 2)
    h += sstep(700, 1000, np.maximum(np.abs(X), np.abs(Z - 150) * 0.8)) * (nrm(rid) * 200 + 60)
    sx, sz = grid(SPLAT)
    rs = lambda a: resample(a, SPLAT)
    p, fi = rs(nrm(patch)), rs(nrm(fine))
    road = (1 - sstep(4.0, 5.5, np.abs(sz - 330 - 10 * np.sin(sx / 80.0)))) * (np.abs(sx) < 600)
    gravel = sstep(0.72, 0.84, p) * 0.6
    meta = {'name': 'Winter-Bergstation', 'water': None, 'spawn': [40.0, 0.5, 320.0], 'spawnYaw': 0.0, 'pilot': [46.0, 2.2, 330.0],
            'fog': [0.0008, '#d3deea'], 'sun': [-0.4, 0.55, 0.45]}
    write_map('alpine', h.astype(np.float32), np.stack([gravel, np.zeros_like(p), np.zeros_like(p)], -1),
              np.stack([road, np.zeros_like(p), rs(nrm(forest))], -1), meta)


def main():
    reset()
    if not os.environ.get('SKYFPV_ONLY'):
        map_steelworks()
        map_alpsee()
    only = os.environ.get('SKYFPV_ONLY', '')
    for name, fn in (('factory', map_factory), ('jungle', map_jungle), ('canyon', map_canyon), ('alpine', map_alpine)):
        if not only or name in only.split(','):
            fn()


main()
