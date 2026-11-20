# -----------------------------------------------------------------------------
# Sky FPV - PBR-Texturen aus Blender
# Prozedurale Felder (Noise/Voronoi, 4D-Torus => nahtlos kachelbar) werden mit
# Cycles in Float-Bilder gebacken und anschließend mit numpy zu
#   <name>_albedo.jpg  (sRGB)
#   <name>_normal.jpg  (OpenGL, Y+)
#   <name>_orm.jpg     (R = Ambient Occlusion, G = Rauheit, B = Höhe)
# kombiniert.  Aufruf:  blender -b --factory-startup -P make_textures.py
# Umgebungsvariable SKYFPV_TEX=4096 für noch höhere Auflösung.
# -----------------------------------------------------------------------------
import os
import sys
import time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from _common import reset, bake_fields, save_image, ensure_dir, TEXTURES, hex_rgb

S = int(os.environ.get('SKYFPV_TEX', '2048'))
ONLY = os.environ.get('SKYFPV_ONLY', '')


# ----------------------------------------------------------------------------- numpy-Helfer
def nrm(a, lo=1.0, hi=99.0):
    a0, a1 = np.percentile(a, lo), np.percentile(a, hi)
    return np.clip((a - a0) / max(a1 - a0, 1e-6), 0.0, 1.0)


def sstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def ramp(t, stops):
    pos = [p for p, _ in stops]
    cols = [hex_rgb(c) for _, c in stops]
    out = np.zeros(t.shape + (3,), np.float32)
    for ch in range(3):
        out[..., ch] = np.interp(t, pos, [c[ch] for c in cols])
    return out


def mix(a, b, m):
    m = np.asarray(m, dtype=np.float32)
    if a.ndim == 3 and m.ndim == 2:
        m = m[..., None]
    return a * (1 - m) + b * m


def col(hexc, shape):
    return np.broadcast_to(np.array(hex_rgb(hexc), np.float32), shape + (3,)).copy()


def blur(a, r):
    r = int(max(1, r))
    out = a
    for axis in (0, 1):
        p = np.concatenate([out.take(range(-r, 0), axis=axis), out, out.take(range(0, r + 1), axis=axis)], axis=axis)
        c = np.cumsum(p, axis=axis)
        n = out.shape[axis]
        if axis == 0:
            out = (c[2 * r + 1:2 * r + 1 + n] - c[0:n]) / (2 * r + 1)
        else:
            out = (c[:, 2 * r + 1:2 * r + 1 + n] - c[:, 0:n]) / (2 * r + 1)
    return out


def normal_map(h, strength):
    k = strength * (h.shape[0] / 2048.0)
    dx = (np.roll(h, -1, axis=1) - np.roll(h, 1, axis=1)) * 0.5 * k
    dy = (np.roll(h, -1, axis=0) - np.roll(h, 1, axis=0)) * 0.5 * k
    n = np.stack([-dx, -dy, np.ones_like(h)], axis=-1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    return n * 0.5 + 0.5


def cavity_ao(h, radius, amount):
    b = blur(h, radius)
    return np.clip(1.0 - np.maximum(b - h, 0) * amount, 0.0, 1.0)


def write_set(name, albedo, rough, height, nstrength, ao=None, ao_radius=None, ao_amount=2.5):
    if ao is None:
        ao = cavity_ao(height, ao_radius or max(2, S // 256), ao_amount)
    base = os.path.join(TEXTURES, name)
    save_image(base + '_albedo.jpg', albedo, 92)
    save_image(base + '_normal.jpg', normal_map(height, nstrength), 95)
    orm = np.stack([ao, np.clip(rough, 0.02, 1.0), height], axis=-1)
    save_image(base + '_orm.jpg', orm, 92)


def F(kind, cells, **kw):
    d = {'kind': kind, 'cells': cells}
    d.update(kw)
    return d


# ----------------------------------------------------------------------------- Materialien
def tex_grass():
    macro, clump, fine = bake_fields([F('noise', 5, detail=6), F('noise', 40, detail=5), F('noise', 700, detail=2)], S)
    patch, cell, blade = bake_fields([F('noise', 12, detail=5, seed=3.1), F('vor_cell', 260), F('noise', 260, detail=3, stretch=(1.0, 4.0))], S)
    m, c, f = nrm(macro), nrm(clump), nrm(fine)
    bl, ce = nrm(blade), cell
    t = np.clip(m * 0.55 + c * 0.35 + ce * 0.1, 0, 1)
    alb = ramp(t, [(0, '#2a4314'), (0.35, '#40601d'), (0.6, '#5b7a28'), (0.82, '#7d8a37'), (1, '#9b9449')])
    alb *= (0.72 + 0.5 * f * bl)[..., None]
    dirt = sstep(0.8, 0.9, nrm(patch)) * (0.5 + 0.4 * (1 - f))
    soil = ramp(f, [(0, '#3b2c1e'), (1, '#6a523a')])
    alb = mix(alb, soil, dirt)
    h = np.clip(0.55 * f * bl + 0.3 * c + 0.15 * ce - 0.25 * dirt, 0, 1)
    rough = 0.8 + 0.15 * (1 - f) + 0.05 * dirt
    write_set('grass', alb, rough, nrm(h), 3.0)


def tex_dirt():
    macro, mid, f1 = bake_fields([F('noise', 4, detail=6), F('noise', 50, detail=6, distort=0.3), F('vor_f1', 150)], S)
    cell, grain, crack = bake_fields([F('vor_cell', 150), F('noise', 650, detail=2), F('vor_edge', 9)], S)
    m, md, g = nrm(macro), nrm(mid), nrm(grain)
    alb = ramp(np.clip(m * 0.5 + md * 0.5, 0, 1), [(0, '#3f2e20'), (0.4, '#5a4330'), (0.75, '#755a40'), (1, '#8d7152')])
    alb *= (0.8 + 0.35 * g)[..., None]
    has = (cell > 0.55).astype(np.float32)
    dome = np.clip(1.0 - (f1 / 0.38) ** 2, 0, 1) * has
    pcol = ramp(cell, [(0, '#6e665c'), (0.5, '#8d857a'), (1, '#a39a8e')])
    alb = mix(alb, pcol, sstep(0.02, 0.2, dome))
    cr = (1 - sstep(0.0, 0.03, crack)) * sstep(0.55, 0.7, md)
    alb *= (1 - 0.45 * cr)[..., None]
    h = np.clip(0.35 * md + 0.15 * g + 0.6 * np.sqrt(dome) - 0.3 * cr, 0, 1)
    rough = 0.92 - 0.15 * sstep(0.05, 0.3, dome)
    write_set('dirt', alb, rough, nrm(h), 4.5)


def tex_rock():
    rid, mid, edge = bake_fields([F('ridged', 4, detail=8, rough=0.55), F('noise', 18, detail=8, distort=0.6), F('vor_edge', 6)], S)
    fine, lich, edge2 = bake_fields([F('noise', 140, detail=4), F('noise', 3, detail=3, seed=5.0), F('vor_edge', 26)], S)
    r, md, fi = nrm(rid), nrm(mid), nrm(fine)
    cr = 1 - sstep(0.0, 0.04, edge)
    cr2 = (1 - sstep(0.0, 0.02, edge2)) * sstep(0.45, 0.65, md)
    h = np.clip(0.45 * r + 0.35 * md + 0.15 * fi - 0.35 * cr - 0.12 * cr2, 0, 1)
    h = nrm(h)
    alb = ramp(np.clip(h * 0.8 + fi * 0.2, 0, 1), [(0, '#3f3c38'), (0.3, '#5c5852'), (0.6, '#7b766d'), (0.85, '#958f84'), (1, '#aca598')])
    lm = sstep(0.62, 0.78, nrm(lich) * 0.75 + fi * 0.25) * sstep(0.4, 0.7, h)
    lcol = ramp(fi, [(0, '#6d7840'), (0.6, '#8f9459'), (1, '#b8b07c')])
    alb = mix(alb, lcol, lm * 0.75)
    alb *= (1 - 0.55 * np.maximum(cr, cr2))[..., None]
    rough = 0.72 + 0.2 * (1 - h) + 0.05 * lm
    write_set('rock', alb, rough, h, 7.0, ao_amount=3.0)


def tex_gravel():
    f1, cell, macro = bake_fields([F('vor_f1', 170), F('vor_cell', 170), F('noise', 5, detail=4)], S)
    grain, f1s, cells = bake_fields([F('noise', 800, detail=2), F('vor_f1', 420), F('vor_cell', 420)], S)
    big = np.clip(1.0 - (f1 / 0.62) ** 2, 0, 1)
    small = np.clip(1.0 - (f1s / 0.6) ** 2, 0, 1)
    use_big = big > small * 0.75
    h = np.where(use_big, np.sqrt(big) * 0.95, np.sqrt(small) * 0.6) + nrm(grain) * 0.05
    cid = np.where(use_big, cell, cells)
    stones = ramp(cid, [(0, '#57524b'), (0.25, '#77716a'), (0.5, '#938c80'), (0.7, '#6b5f50'), (0.85, '#a59d90'), (1, '#80786c')])
    stones *= (0.85 + 0.25 * nrm(grain))[..., None] * (0.85 + 0.3 * nrm(macro))[..., None]
    gap = 1 - sstep(0.02, 0.25, h)
    alb = mix(stones, col('#2a2622', h.shape), gap)
    rough = 0.78 + 0.15 * gap
    write_set('gravel', alb, rough, nrm(h), 6.0, ao_amount=4.0)


def tex_concrete():
    st, mid, pores = bake_fields([F('noise', 3, detail=6), F('noise', 36, detail=6), F('noise', 900, detail=2)], S)
    edge, cm, wat = bake_fields([F('vor_edge', 5), F('noise', 9, detail=7, seed=2.0), F('noise', 2, detail=4, seed=7.0)], S)
    s, m, p = nrm(st), nrm(mid), nrm(pores)
    alb = ramp(np.clip(s * 0.6 + m * 0.4, 0, 1), [(0, '#66645f'), (0.35, '#7e7c76'), (0.65, '#94928b'), (1, '#aaa79f')])
    alb *= (0.9 + 0.18 * p)[..., None]
    pore = 1 - sstep(0.0, 0.12, p)
    alb *= (1 - 0.35 * pore)[..., None]
    crack = (1 - sstep(0.0, 0.012, edge)) * sstep(0.5, 0.62, nrm(cm))
    alb *= (1 - 0.6 * crack)[..., None]
    wet = sstep(0.6, 0.85, nrm(wat))
    alb = mix(alb, alb * np.array(hex_rgb('#8a8a84')) * 0.85, wet * 0.6)
    h = np.clip(0.5 + 0.12 * m + 0.08 * p - 0.35 * pore - 0.6 * crack, 0, 1)
    rough = 0.9 - 0.12 * wet - 0.04 * s
    write_set('concrete', alb, rough, h, 2.2)


def tex_asphalt():
    agg, mid, wear = bake_fields([F('noise', 1000, detail=1), F('noise', 30, detail=6), F('noise', 4, detail=5)], S)
    edge, cell, f1 = bake_fields([F('vor_edge', 6), F('vor_cell', 520), F('vor_f1', 520)], S)
    a, m, w = nrm(agg), nrm(mid), nrm(wear)
    alb = ramp(np.clip(w * 0.6 + m * 0.4, 0, 1), [(0, '#232324'), (0.5, '#2e2e2f'), (1, '#454442')])
    stone = (f1 < 0.33) & (cell > 0.6)
    scol = ramp(cell, [(0, '#55524d'), (1, '#7a7670')])
    alb = np.where(stone[..., None], mix(alb, scol, 0.7), alb)
    alb *= (0.85 + 0.3 * a)[..., None]
    crack = (1 - sstep(0.0, 0.01, edge)) * sstep(0.55, 0.65, m)
    alb *= (1 - 0.65 * crack)[..., None]
    h = np.clip(0.5 + 0.25 * stone + 0.1 * a - 0.6 * crack, 0, 1)
    rough = 0.88 - 0.08 * w
    write_set('asphalt', alb, rough, h, 2.5)


def tex_metal_paint():
    rm, rd, fine = bake_fields([F('noise', 4, detail=8), F('noise', 50, detail=8), F('noise', 300, detail=3)], S)
    streak, scr, chip = bake_fields([F('noise', 3, detail=6, stretch=(10.0, 0.5)), F('noise', 40, detail=2, stretch=(0.3, 30.0)), F('vor_edge', 30)], S)
    paint = ramp(nrm(fine) * 0.4 + nrm(rm) * 0.6, [(0, '#c4c4bf'), (1, '#e6e5e0')])
    t = nrm(rm) * 0.6 + nrm(rd) * 0.3 + nrm(streak) * 0.25
    rust = sstep(0.7, 0.82, t)
    rcol = ramp(nrm(rd), [(0, '#4c2715'), (0.5, '#7d4321'), (1, '#a3622f')])
    alb = mix(paint, rcol, rust)
    drip = sstep(0.75, 0.95, nrm(streak)) * (1 - rust)
    alb = mix(alb, alb * np.array(hex_rgb('#b08a6a')), drip * 0.5)
    sc = sstep(0.93, 0.99, nrm(scr))
    alb = mix(alb, col('#8a8a88', fine.shape), sc * 0.6)
    h = np.clip(0.5 + 0.25 * rust * nrm(rd) - 0.15 * sc, 0, 1)
    rough = 0.42 + 0.48 * rust + 0.1 * sc
    write_set('metal_paint', alb, rough, h, 1.8)


def tex_rust():
    a, b, c = bake_fields([F('noise', 5, detail=8), F('noise', 40, detail=8, distort=0.4), F('noise', 260, detail=3)], S)
    alb = ramp(np.clip(nrm(a) * 0.5 + nrm(b) * 0.5, 0, 1), [(0, '#2e221c'), (0.3, '#55311c'), (0.6, '#7f4723'), (0.85, '#9c5e2e'), (1, '#b07843')])
    alb *= (0.8 + 0.35 * nrm(c))[..., None]
    h = nrm(nrm(b) * 0.7 + nrm(c) * 0.3)
    write_set('rust', alb, 0.8 + 0.15 * nrm(c), h, 3.5)


def tex_metal_sheet():
    streak, rm, fine = bake_fields([F('noise', 4, detail=6, stretch=(12.0, 0.4)), F('noise', 5, detail=7), F('noise', 200, detail=3)], S)
    u = (np.arange(S) / S)[None, :].repeat(S, 0)
    corr = 0.5 + 0.5 * np.sin(u * 2 * np.pi * 26)
    paint = ramp(nrm(fine) * 0.3 + nrm(rm) * 0.7, [(0, '#5d6c74'), (0.5, '#72828a'), (1, '#8a989d')])
    rs = sstep(0.62, 0.85, nrm(streak) * 0.6 + nrm(rm) * 0.4)
    rcol = ramp(nrm(fine), [(0, '#5a301a'), (1, '#93582b')])
    alb = mix(paint, rcol, rs * 0.85)
    alb *= (0.85 + 0.15 * corr)[..., None]
    h = np.clip(corr * 0.9 + 0.1 * nrm(fine), 0, 1)
    write_set('metal_sheet', alb, 0.5 + 0.4 * rs, h, 9.0, ao=0.75 + 0.25 * corr)


def tex_bark():
    rid, mid, fine = bake_fields([F('ridged', 3, detail=6, stretch=(9.0, 0.7)), F('noise', 20, detail=6, stretch=(4.0, 0.8)), F('noise', 220, detail=3)], S)
    moss, edge, _x = bake_fields([F('noise', 3, detail=5, seed=4.0), F('vor_edge', 5, stretch=(4.0, 0.6)), F('noise', 2, detail=1)], S)
    h = nrm(nrm(rid) * 0.6 + nrm(mid) * 0.3 + nrm(fine) * 0.1)
    cr = 1 - sstep(0.0, 0.05, edge)
    h = np.clip(h - 0.3 * cr, 0, 1)
    alb = ramp(h, [(0, '#1f1813'), (0.35, '#3a2e25'), (0.7, '#5a4a3c'), (1, '#7a6a5a')])
    mm = sstep(0.62, 0.8, nrm(moss)) * (1 - h)
    alb = mix(alb, ramp(nrm(fine), [(0, '#344018'), (1, '#5d6a2c')]), mm * 0.8)
    write_set('bark', alb, 0.92 + 0.06 * (1 - h), h, 8.0, ao_amount=3.0)


def tex_wood():
    grain, mid, knot = bake_fields([F('noise', 8, detail=5, stretch=(0.25, 14.0)), F('noise', 30, detail=4, stretch=(0.5, 6.0)), F('noise', 400, detail=2, stretch=(0.2, 6.0))], S)
    weather, edge, _ = bake_fields([F('noise', 4, detail=5), F('vor_edge', 7, stretch=(0.3, 3.0)), F('noise', 2)], S)
    g = nrm(np.sin(nrm(grain) * 18.0) * 0.5 + 0.5 + 0.3 * nrm(mid))
    alb = ramp(g, [(0, '#6a4c30'), (0.5, '#8d6a46'), (1, '#b08b62')])
    wm = sstep(0.4, 0.75, nrm(weather))
    alb = mix(alb, ramp(nrm(knot), [(0, '#6e6a63'), (1, '#9c968c')]), wm * 0.7)
    cr = 1 - sstep(0.0, 0.02, edge)
    alb *= (1 - 0.5 * cr)[..., None]
    h = np.clip(0.5 + 0.2 * g + 0.1 * nrm(knot) - 0.4 * cr, 0, 1)
    write_set('wood', alb, 0.75 + 0.15 * wm, h, 3.0)


def tex_brick():
    grime, fine, chips = bake_fields([F('noise', 4, detail=6), F('noise', 300, detail=3), F('noise', 60, detail=5)], S)
    nx, ny = 8, 26
    v = (np.arange(S) / S)[:, None].repeat(S, 1)
    u = (np.arange(S) / S)[None, :].repeat(S, 0)
    row = np.floor(v * ny).astype(np.int32)
    off = 0.5 * (row % 2)
    uu = u * nx + off
    colid = np.floor(uu).astype(np.int32) % nx
    fu, fv = uu - np.floor(uu), v * ny - row
    rng = np.random.default_rng(11)
    tab = rng.random((ny + 1, nx + 1)).astype(np.float32)
    rnd = tab[row % ny, colid]
    mu, mv = 0.05, 0.13
    edge = np.minimum(np.minimum(fu, 1 - fu) / mu, np.minimum(fv, 1 - fv) / mv)
    brick = sstep(0.9, 1.3, edge)
    bcol = ramp(rnd, [(0, '#6e3426'), (0.3, '#8a4532'), (0.6, '#9a5640'), (0.85, '#7c4a3a'), (1, '#a66a4f')])
    bcol *= (0.85 + 0.25 * nrm(fine))[..., None]
    mcol = ramp(nrm(fine), [(0, '#7d786e'), (1, '#a39d90')])
    alb = mix(mcol, bcol, brick)
    gm = sstep(0.55, 0.85, nrm(grime))
    alb = mix(alb, alb * 0.55, gm * 0.6)
    ch = sstep(0.8, 0.9, nrm(chips)) * brick
    h = np.clip(brick * (0.75 + 0.15 * nrm(fine)) - 0.25 * ch + 0.15, 0, 1)
    write_set('brick', alb, 0.85 + 0.1 * (1 - brick), h, 6.0)


def tex_carbon():
    N = 32
    v = (np.arange(S) / S)[:, None].repeat(S, 1)
    u = (np.arange(S) / S)[None, :].repeat(S, 0)
    i, j = np.floor(u * N).astype(np.int32), np.floor(v * N).astype(np.int32)
    fu, fv = u * N - i, v * N - j
    over = ((i - j) % 4) < 2
    warp = 0.55 + 0.45 * np.sin(np.pi * fu)
    weft = 0.55 + 0.45 * np.sin(np.pi * fv)
    fib_u = 0.9 + 0.1 * np.sin(u * N * 2 * np.pi * 14)
    fib_v = 0.9 + 0.1 * np.sin(v * N * 2 * np.pi * 14)
    b = np.where(over, warp * fib_u, weft * fib_v * 0.7)
    alb = ramp(b, [(0, '#0d0d0f'), (0.6, '#1c1c20'), (1, '#34343a')])
    h = np.where(over, np.sin(np.pi * fv) * 0.6 + 0.4, np.sin(np.pi * fu) * 0.6 + 0.2)
    write_set('carbon', alb, 0.3 + 0.1 * (1 - b), nrm(h), 1.5, ao=0.85 + 0.15 * b)


def tex_foliage():
    cell, f1, macro = bake_fields([F('vor_cell', 150), F('vor_f1', 150), F('noise', 6, detail=5)], S)
    alb = ramp(np.clip(cell * 0.6 + nrm(macro) * 0.4, 0, 1), [(0, '#223a15'), (0.4, '#335220'), (0.7, '#4a6d27'), (1, '#6a8a33')])
    leaf = np.clip(1.0 - (f1 / 0.65) ** 2, 0, 1)
    alb *= (0.4 + 0.75 * leaf)[..., None]
    write_set('foliage', alb, 0.65 + 0.25 * (1 - leaf), nrm(np.sqrt(leaf)), 4.0)


def tex_needles():
    a, b, macro = bake_fields([F('noise', 30, detail=3, stretch=(1.0, 22.0)), F('noise', 30, detail=3, stretch=(22.0, 1.0), seed=2.0), F('noise', 6, detail=5)], S)
    h = nrm(np.maximum(nrm(a), nrm(b)))
    alb = ramp(np.clip(h * 0.7 + nrm(macro) * 0.3, 0, 1), [(0, '#0f1d0c'), (0.4, '#1e3518'), (0.75, '#2f4d22'), (1, '#4c6b30')])
    write_set('needles', alb, 0.7 + 0.2 * (1 - h), h, 4.0)


def tex_water():
    s = max(1024, S // 2)
    a, b, c = bake_fields([F('noise', 5, detail=6), F('noise', 14, detail=5), F('noise', 40, detail=3)], s)
    h = nrm(nrm(a) * 0.5 + nrm(b) * 0.35 + nrm(c) * 0.15)
    save_image(os.path.join(TEXTURES, 'water_normal.jpg'), normal_map(h, 5.0 * 2048 / s * (s / 2048.0)), 95)


def tex_macro():
    a, b, c = bake_fields([F('noise', 3, detail=4), F('noise', 9, detail=5), F('noise', 27, detail=5)], 1024)
    save_image(os.path.join(TEXTURES, 'macro.jpg'), np.stack([nrm(a), nrm(b), nrm(c)], axis=-1), 95)


def tex_tpu():
    a, b, c = bake_fields([F('noise', 120, detail=3), F('noise', 20, detail=4), F('noise', 900, detail=1)], 1024)
    alb = ramp(nrm(b) * 0.4 + nrm(a) * 0.6, [(0, '#1b1b1d'), (1, '#2b2b2e')])
    v = (np.arange(1024) / 1024)[:, None].repeat(1024, 1)
    layer = 0.5 + 0.5 * np.sin(v * 2 * np.pi * 120)
    h = nrm(layer * 0.7 + nrm(c) * 0.3)
    global S
    old = S
    S = 1024
    write_set('tpu', alb, 0.65 + 0.2 * nrm(c), h, 2.0)
    S = old


# ----------------------------------------------------------------------------- Neue Biome
def tex_sand():
    dunes, mid, grain = bake_fields([F('noise', 3, detail=4, stretch=(1.0, 3.0)), F('noise', 30, detail=5), F('noise', 900, detail=1)], S)
    rip, peb, pcell = bake_fields([F('noise', 40, detail=2, stretch=(0.15, 6.0)), F('vor_f1', 200), F('vor_cell', 200)], S)
    r = 0.5 + 0.5 * np.sin(nrm(rip) * 30.0)
    alb = ramp(np.clip(nrm(dunes) * 0.5 + nrm(mid) * 0.3 + r * 0.2, 0, 1), [(0, '#a8774a'), (0.4, '#c49460'), (0.75, '#d7ab78'), (1, '#e6c18e')])
    alb *= (0.9 + 0.2 * nrm(grain))[..., None]
    pm = (pcell > 0.8).astype(np.float32) * np.clip(1 - (peb / 0.35) ** 2, 0, 1)
    alb = mix(alb, ramp(pcell, [(0, '#7a5a3a'), (1, '#9a7a5a')]), sstep(0.05, 0.3, pm))
    h = nrm(r * 0.4 + nrm(mid) * 0.3 + nrm(grain) * 0.1 + pm * 0.6)
    write_set('sand', alb, 0.9 - 0.1 * pm, h, 3.0)


def tex_red_rock():
    strata, rid, fine = bake_fields([F('noise', 2, detail=4, stretch=(0.3, 18.0)), F('ridged', 5, detail=8), F('noise', 160, detail=4)], S)
    edge, blot, _ = bake_fields([F('vor_edge', 8), F('noise', 6, detail=5), F('noise', 2)], S)
    band = 0.5 + 0.5 * np.sin(nrm(strata) * 25.0)
    h = nrm(nrm(rid) * 0.5 + band * 0.25 + nrm(fine) * 0.25 - (1 - sstep(0, 0.04, edge)) * 0.4)
    alb = ramp(np.clip(band * 0.45 + h * 0.4 + nrm(blot) * 0.15, 0, 1), [(0, '#6e2f1c'), (0.3, '#94442a'), (0.55, '#b5603a'), (0.8, '#c98352'), (1, '#dcae7c')])
    alb *= (0.8 + 0.3 * nrm(fine))[..., None]
    write_set('red_rock', alb, 0.82 + 0.12 * (1 - h), h, 6.5, ao_amount=3.0)


def tex_snow():
    drift, mid, fine = bake_fields([F('noise', 3, detail=5), F('noise', 25, detail=5), F('noise', 600, detail=2)], S)
    crust, _, _ = bake_fields([F('vor_edge', 30), F('noise', 2), F('noise', 3)], S)
    h = nrm(nrm(drift) * 0.5 + nrm(mid) * 0.35 + nrm(fine) * 0.15)
    alb = ramp(h, [(0, '#b9c6d6'), (0.5, '#dfe7f0'), (1, '#f4f7fb')])
    alb *= (0.97 + 0.06 * nrm(fine))[..., None]
    cr = (1 - sstep(0.0, 0.02, crust)) * sstep(0.5, 0.7, nrm(mid))
    alb = mix(alb, alb * 0.9, cr)
    write_set('snow', alb, 0.55 + 0.3 * nrm(fine) * (1 - h), h, 2.0)


def tex_jungle_floor():
    cell, f1, macro = bake_fields([F('vor_cell', 90), F('vor_f1', 90), F('noise', 6, detail=5)], S)
    moss, twig, fine = bake_fields([F('noise', 14, detail=6, seed=3.0), F('noise', 50, detail=2, stretch=(0.2, 8.0)), F('noise', 500, detail=2)], S)
    leaf = np.clip(1.0 - (f1 / 0.62) ** 2, 0, 1)
    lcol = ramp(cell, [(0, '#3a2a16'), (0.3, '#5a3f1e'), (0.55, '#6e5427'), (0.75, '#4a5a24'), (1, '#7a6a30')])
    alb = mix(ramp(nrm(fine), [(0, '#1e160d'), (1, '#33261a')]), lcol, sstep(0.05, 0.3, leaf))
    mm = sstep(0.55, 0.75, nrm(moss) * 0.7 + nrm(macro) * 0.3)
    alb = mix(alb, ramp(nrm(fine), [(0, '#2b4a17'), (1, '#4f7a25')]), mm * 0.85)
    tw = sstep(0.82, 0.9, nrm(twig))
    alb = mix(alb, col('#4a3828', fine.shape), tw * 0.7)
    h = nrm(np.sqrt(leaf) * 0.5 + nrm(moss) * 0.3 * mm + tw * 0.3 + nrm(fine) * 0.1)
    write_set('jungle_floor', alb, 0.7 + 0.2 * (1 - mm), h, 4.0)


def tex_mud():
    a, b, c = bake_fields([F('noise', 5, detail=6), F('noise', 40, detail=6, distort=0.5), F('noise', 300, detail=3)], S)
    wet = sstep(0.6, 0.75, nrm(a))
    alb = ramp(np.clip(nrm(b) * 0.7 + nrm(c) * 0.3, 0, 1), [(0, '#2a1d12'), (0.5, '#4a3522'), (1, '#6a4e34')])
    alb = mix(alb, alb * 0.6, wet)
    h = nrm(nrm(b) * 0.7 + nrm(c) * 0.3 - wet * 0.4)
    write_set('mud', alb, 0.85 - 0.6 * wet, h, 3.5)


def tex_mossy_stone():
    cellv, edge, mm = bake_fields([F('vor_cell', 7), F('vor_edge', 7), F('noise', 6, detail=6)], S)
    fine, rid, drip = bake_fields([F('noise', 120, detail=4), F('ridged', 20, detail=6), F('noise', 4, detail=4, stretch=(8.0, 0.4))], S)
    block = sstep(0.02, 0.08, edge)
    stone = ramp(np.clip(cellv * 0.5 + nrm(fine) * 0.5, 0, 1), [(0, '#6f6a5c'), (0.5, '#8d877a'), (1, '#a8a294')])
    alb = mix(col('#2b2a22', fine.shape), stone, block)
    m = np.clip(sstep(0.45, 0.7, nrm(mm) * 0.6 + (1 - block) * 0.5 + nrm(fine) * 0.2), 0, 1)
    alb = mix(alb, ramp(nrm(fine), [(0, '#2c4a18'), (0.6, '#4a7224'), (1, '#6e8f34')]), m * 0.85)
    alb = mix(alb, alb * 0.6, sstep(0.7, 0.9, nrm(drip)) * 0.5)
    h = nrm(block * 0.6 + nrm(rid) * 0.25 + m * 0.2 + nrm(fine) * 0.1)
    write_set('mossy_stone', alb, 0.8 + 0.15 * m, h, 5.5, ao_amount=3.5)


JOBS = [('sand', tex_sand), ('red_rock', tex_red_rock), ('snow', tex_snow), ('jungle_floor', tex_jungle_floor),
        ('mud', tex_mud), ('mossy_stone', tex_mossy_stone),('grass', tex_grass), ('dirt', tex_dirt), ('rock', tex_rock), ('gravel', tex_gravel),
        ('concrete', tex_concrete), ('asphalt', tex_asphalt), ('metal_paint', tex_metal_paint),
        ('rust', tex_rust), ('metal_sheet', tex_metal_sheet), ('bark', tex_bark), ('wood', tex_wood),
        ('brick', tex_brick), ('carbon', tex_carbon), ('foliage', tex_foliage), ('needles', tex_needles),
        ('water', tex_water), ('macro', tex_macro), ('tpu', tex_tpu)]


def main():
    reset()
    ensure_dir(TEXTURES)
    t0 = time.time()
    for name, fn in JOBS:
        if ONLY and name not in ONLY.split(','):
            continue
        t = time.time()
        fn()
        print('[SkyFPV] Textur %-12s %.1fs' % (name, time.time() - t), flush=True)
    print('[SkyFPV] Texturen fertig in %.1fs' % (time.time() - t0), flush=True)


main()
