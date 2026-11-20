# -----------------------------------------------------------------------------
# Sky FPV - Umgebungsmodelle (Gebäude, Bando-Ruine, Container, Strommasten,
# Bäume, Felsen, Staudamm, Race-Gates ...).  Pro Modell: <name>.glb + <name>.json
# mit Kollisionsvolumen (Boxen/Zylinder/Kugeln) für die Flugphysik.
# Aufruf: blender -b --factory-startup -P make_env_props.py
# -----------------------------------------------------------------------------
import os
import sys
import math
import random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bmesh
from mathutils import Vector, Matrix, noise
from _common import (reset, material, Model, mtx, bm_box, bm_cyl, bm_tube, bm_prism, bm_sphere,
                     bm_beam, displace, b2t, ensure_dir, MODELS)

OUT = os.path.join(MODELS, 'env')


def mats():
    material('T_concrete', '#ffffff', 0.9)
    material('T_concrete_dark', '#b4b1aa', 0.9)
    material('T_brick', '#ffffff', 0.85)
    material('T_metal_paint', '#ffffff', 0.5, 0.15)
    material('T_metal_sheet', '#ffffff', 0.55, 0.3)
    material('T_rust', '#ffffff', 0.85, 0.35)
    material('T_wood', '#ffffff', 0.8)
    material('T_bark', '#ffffff', 0.95)
    material('T_foliage', '#ffffff', 0.7)
    material('T_needles', '#ffffff', 0.75)
    material('T_rock', '#ffffff', 0.85)
    material('T_asphalt', '#ffffff', 0.9)
    material('M_Galv', '#8d9399', 0.45, 0.85)
    material('M_SteelDark', '#3a3d40', 0.5, 0.8)
    material('M_Lamp', '#fff1d0', 0.3, 0.0, emit='#fff1d0', emit_strength=6.0)
    material('M_Insulator', '#5d7d6a', 0.2, 0.0)
    material('M_GlassDirty', '#4d5a5e', 0.15, 0.2)
    material('M_GateA', '#ff5a14', 0.55)
    material('M_GateB', '#141414', 0.6)
    material('M_GateFoot', '#2a2a2a', 0.8)
    material('M_Rubber', '#141414', 0.9)
    material('M_RoofDark', '#3b3532', 0.8, 0.1)
    material('M_Grass', '#4f7a2a', 0.8)
    material('M_Graffiti', '#ffffff', 0.85)
    material('M_Stains', '#ffffff', 1.0)
    material('M_GlassShard', '#a9bcc0', 0.05, 0.2)
    material('M_WinFrame', '#3b2a22', 0.7, 0.4)


def new(name):
    reset()
    mats()
    return Model(name)


# ----------------------------------------------------------------------------- Container
def corrugated_wall(length, height, pitch=0.28, depth=0.035):
    """Trapez-Wellblech in der XZ-Ebene, Welle in Y-Richtung (Außenseite +Y)."""
    bm = bmesh.new()
    xs = []
    n = int(length / pitch)
    p = length / n
    for i in range(n):
        x0 = -length / 2 + i * p
        xs += [(x0, 0.0), (x0 + p * 0.2, depth), (x0 + p * 0.5, depth), (x0 + p * 0.7, 0.0)]
    xs.append((length / 2, 0.0))
    bot = [bm.verts.new((x, y, 0)) for x, y in xs]
    top = [bm.verts.new((x, y, height)) for x, y in xs]
    for i in range(len(xs) - 1):
        bm.faces.new((bot[i], bot[i + 1], top[i + 1], top[i]))
    bm.normal_update()
    return bm


def build_container():
    m = new('container')
    L, W, H = 6.06, 2.44, 2.59
    m.add(bm_box(L - 0.1, W - 0.12, H - 0.12), 'T_metal_paint', mtx((0, 0, H / 2)), 3.0)
    for sy in (-1, 1):
        w = corrugated_wall(L - 0.3, H - 0.3)
        m.add(w, 'T_metal_paint', mtx((0, sy * (W / 2 - 0.06), 0.15), (0, 0, 0 if sy > 0 else 180)), 3.0)
    w = corrugated_wall(W - 0.3, H - 0.3)
    m.add(w, 'T_metal_paint', mtx((-(L / 2 - 0.05), 0, 0.15), (0, 0, 90)), 3.0)
    # Rahmen
    for sx in (-1, 1):
        for sy in (-1, 1):
            m.add(bm_box(0.16, 0.16, H, 0.01), 'T_metal_paint', mtx((sx * (L / 2 - 0.08), sy * (W / 2 - 0.08), H / 2)), 3.0)
            for z in (0.08, H - 0.08):
                m.add(bm_box(0.18, 0.18, 0.12, 0.01), 'M_SteelDark', mtx((sx * (L / 2 - 0.08), sy * (W / 2 - 0.08), z)), 1.0)
        for z in (0.08, H - 0.08):
            m.add(bm_box(0.12, W - 0.2, 0.14, 0.01), 'T_metal_paint', mtx((sx * (L / 2 - 0.07), 0, z)), 3.0)
    for sy in (-1, 1):
        for z in (0.08, H - 0.08):
            m.add(bm_box(L - 0.2, 0.12, 0.15, 0.01), 'T_metal_paint', mtx((0, sy * (W / 2 - 0.07), z)), 3.0)
    m.add(bm_box(L - 0.2, W - 0.2, 0.03), 'T_metal_paint', mtx((0, 0, H - 0.02)), 3.0)
    # Türen (+X) mit Verriegelungsstangen
    for sy in (-1, 1):
        m.add(bm_box(0.04, W / 2 - 0.14, H - 0.3, 0.008), 'T_metal_paint', mtx((L / 2 - 0.03, sy * (W / 4 - 0.02), H / 2)), 3.0)
        for k in (0.28, 0.75):
            y = sy * (W / 2 - 0.12) * k
            m.add(bm_cyl(0.022, H - 0.25, 12), 'M_SteelDark', mtx((L / 2 + 0.02, y, H / 2)), 1.0)
            m.add(bm_box(0.05, 0.03, 0.35, 0.005), 'M_SteelDark', mtx((L / 2 + 0.05, y + 0.06 * sy, 1.1)), 1.0)
    m.col_box((L, W, H), mtx((0, 0, H / 2)))
    m.export(OUT)


# ----------------------------------------------------------------------------- Lagerhalle
def ibeam(m, p0, p1, size=0.35, mat='T_rust'):
    p0, p1 = Vector(p0), Vector(p1)
    d = (p1 - p0)
    L = d.length
    q = Vector((0, 0, 1)).rotation_difference(d.normalized())
    base = Matrix.Translation((p0 + p1) / 2) @ q.to_matrix().to_4x4()
    t = size * 0.08
    for off in (-1, 1):
        m.add(bm_box(size, t, L), mat, base @ mtx((0, off * (size / 2 - t / 2), 0)), 2.0)
    m.add(bm_box(t, size - 2 * t, L), mat, base, 2.0)
    m.col_box((size, size, L), base)


def build_warehouse():
    random.seed(4)
    m = new('warehouse')
    LX, LY, HE, HR = 40.0, 24.0, 10.0, 12.5
    m.box((LX + 1, LY + 1, 0.25), (0, 0, 0.125), 'T_concrete', uv=4.0)
    slope = math.atan((HR - HE) / (LY / 2))
    bays = 8
    bw = LX / bays
    xs = [-LX / 2 + i * bw for i in range(bays + 1)]
    for x in xs:
        for sy in (-1, 1):
            ibeam(m, (x, sy * LY / 2, 0.25), (x, sy * LY / 2, HE), 0.4)
            ibeam(m, (x, sy * LY / 2, HE), (x, 0, HR), 0.4)
    # Längsträger / Kranbahn
    for sy in (-1, 1):
        ibeam(m, (-LX / 2, sy * (LY / 2 - 0.5), 7.5), (LX / 2, sy * (LY / 2 - 0.5), 7.5), 0.45)
        m.beam((-LX / 2, sy * LY / 2, HE), (LX / 2, sy * LY / 2, HE), 0.25, 'T_rust', uv=2.0)
    m.beam((-LX / 2, 0, HR), (LX / 2, 0, HR), 0.25, 'T_rust', uv=2.0)
    # Laufkran
    cx = 5.0
    ibeam(m, (cx, -LY / 2 + 0.5, 7.95), (cx, LY / 2 - 0.5, 7.95), 0.7, 'T_metal_paint')
    m.box((1.4, 1.6, 1.0), (cx, 3.0, 7.2), 'T_metal_paint', bevel=0.05, uv=2.0)
    m.cyl(0.03, 4.5, (cx, 3.0, 4.5), 'M_SteelDark', segs=8, collide=False)
    m.box((0.5, 0.3, 0.6), (cx, 3.0, 2.1), 'M_SteelDark', bevel=0.04)
    # Längswände je Feld (Wellblech), manche mit Toren / Löchern
    kinds_s = ['full', 'door', 'window', 'full', 'gone', 'window', 'door', 'full']
    kinds_n = ['window', 'full', 'gone', 'door', 'full', 'window', 'full', 'gone']
    for sy, kinds in ((-1, kinds_s), (1, kinds_n)):
        for i in range(bays):
            x0 = xs[i] + 0.25
            x1 = xs[i + 1] - 0.25
            w = x1 - x0
            cxm = (x0 + x1) / 2
            y = sy * (LY / 2 + 0.1)
            k = kinds[i]
            parts = []
            if k == 'full':
                parts = [(0.25, HE)]
            elif k == 'door':
                parts = [(6.0, HE)]
            elif k == 'window':
                parts = [(0.25, 4.5), (6.5, HE)]
            elif k == 'gone':
                parts = [(0.25, 1.2), (8.5, HE)]
            for (z0, z1) in parts:
                m.box((w, 0.08, z1 - z0), (cxm, y, (z0 + z1) / 2), 'T_metal_sheet', rot=(0, 0, 0), uv=2.0)
    # Giebelwände
    for sx in (-1, 1):
        x = sx * (LX / 2 + 0.1)
        segs = 6
        sw = LY / segs
        for j in range(segs):
            y0 = -LY / 2 + j * sw
            yc = y0 + sw / 2
            ztop = HE + (HR - HE) * (1 - abs(yc) / (LY / 2))
            if sx > 0 and j in (2, 3):
                m.box((0.08, sw, ztop - 7.0), (x, yc, (ztop + 7.0) / 2), 'T_metal_sheet', uv=2.0)
            elif sx < 0 and j == 1:
                m.box((0.08, sw, ztop - 3.5), (x, yc, (ztop + 3.5) / 2 + 0.0), 'T_metal_sheet', uv=2.0)
                m.box((0.08, sw, 2.0), (x, yc, 1.25), 'T_metal_sheet', uv=2.0)
            else:
                m.box((0.08, sw, ztop - 0.25), (x, yc, (ztop + 0.25) / 2), 'T_metal_sheet', uv=2.0)
    # Dach mit Lücken
    missing = {(1, -1), (2, -1), (4, 1), (5, 1), (6, -1)}
    rl = (LY / 2) / math.cos(slope) + 0.3
    for i in range(bays):
        for sy in (-1, 1):
            if (i, sy) in missing:
                continue
            cxm = (xs[i] + xs[i + 1]) / 2
            yc = sy * LY / 4
            zc = (HE + HR) / 2 + 0.25
            m.box((bw, rl, 0.08), (cxm, yc, zc), 'T_metal_sheet', rot=(math.degrees(slope) * (-sy), 0, 0), uv=2.0)
    # Regale innen
    for k in range(3):
        y = -6 + k * 6
        for x in (-15, -9):
            for dz in (0.0,):
                for px in (x - 2.4, x, x + 2.4):
                    for py in (y - 0.5, y + 0.5):
                        m.box((0.1, 0.1, 5.0), (px, py, 2.75), 'T_metal_paint', uv=2.0, collide=False)
                for z in (1.0, 2.5, 4.0, 5.2):
                    m.box((5.0, 1.2, 0.08), (x, y, z), 'T_metal_paint', uv=2.0, collide=False)
                m.col_box((5.0, 1.2, 5.0), mtx((x, y, 2.75)))
    m.export(OUT)


# ----------------------------------------------------------------------------- Bando (Betonruine)
def build_bando():
    random.seed(7)
    m = new('bando')
    gx = [-12, -6, 0, 6, 12]
    gy = [-7, 0, 7]
    fh = 3.6
    floors = 3
    m.box((25.5, 15.5, 0.3), (0, 0, 0.15), 'T_concrete', uv=4.0)
    for fi in range(floors):
        z0 = 0.3 + fi * fh
        for x in gx:
            for y in gy:
                if fi == 2 and (x, y) in ((12, 7), (6, 7), (12, 0)):
                    continue
                h = fh - 0.3
                if fi == 2 and (x, y) in ((-12, -7), (0, 7)):
                    h = 1.6
                m.box((0.45, 0.45, h), (x, y, z0 + h / 2), 'T_concrete', uv=3.0)
                if fi == 2 and h > 1.6:
                    for k in range(4):
                        a = k * math.pi / 2 + 0.6
                        m.cyl(0.012, 0.9, (x + math.cos(a) * 0.15, y + math.sin(a) * 0.15, z0 + h + 0.45), 'T_rust',
                              rot=(random.uniform(-12, 12), random.uniform(-12, 12), 0), segs=6, collide=False)
        # Decke dieser Etage
        zs = z0 + fh - 0.3
        holes = {0: {(1, 0)}, 1: {(2, 1), (0, 0)}, 2: {(1, 1), (2, 0), (3, 1), (3, 0)}}[fi]
        for i in range(4):
            for j in range(2):
                if (i, j) in holes:
                    continue
                x0, x1 = gx[i], gx[i + 1]
                y0, y1 = gy[j], gy[j + 1]
                m.box((x1 - x0 + 0.45, y1 - y0 + 0.45, 0.28), ((x0 + x1) / 2, (y0 + y1) / 2, zs + 0.14), 'T_concrete', uv=4.0)
        # Unterzüge
        for y in gy:
            m.box((24.45, 0.35, 0.4), (0, y, zs - 0.2), 'T_concrete', uv=3.0)
        # Ausfachungswände (Ziegel) mit Fensteröffnungen
        if fi < 2:
            for (side, coord) in (('y', -7.2), ('y', 7.2)):
                for i in range(4):
                    if (fi, i, coord) in ((0, 1, -7.2), (1, 3, 7.2), (0, 2, 7.2)):
                        continue
                    x0, x1 = gx[i] + 0.25, gx[i + 1] - 0.25
                    w = x1 - x0
                    xc = (x0 + x1) / 2
                    m.box((w, 0.25, 1.0), (xc, coord, z0 + 0.5), 'T_brick', uv=2.0)
                    m.box((w, 0.25, 0.7), (xc, coord, z0 + fh - 0.3 - 0.35 - 0.4), 'T_brick', uv=2.0)
                    for px in (x0 + 0.5, xc, x1 - 0.5):
                        m.box((0.8 if px != xc else 1.0, 0.25, 1.5), (px, coord, z0 + 1.75), 'T_brick', uv=2.0)
            for (coord) in (-12.2, 12.2):
                for j in range(2):
                    if (fi, j, coord) in ((1, 0, 12.2),):
                        continue
                    y0, y1 = gy[j] + 0.25, gy[j + 1] - 0.25
                    yc = (y0 + y1) / 2
                    h = fh - 0.7
                    if (fi, j) == (0, 1):
                        m.box((0.25, y1 - y0, 1.0), (coord, yc, z0 + h - 0.5), 'T_brick', uv=2.0)
                    else:
                        m.box((0.25, y1 - y0, h), (coord, yc, z0 + h / 2), 'T_brick', uv=2.0)
    # Treppenhaus
    sx0 = -9
    for (dx, dy, w, d) in ((0, -3.5, 4.0, 0.25), (-2.0, -1.75, 0.25, 3.5), (2.0, -1.75, 0.25, 3.5)):
        m.box((w, d, floors * fh + 1.2), (sx0 + dx, dy, (floors * fh + 1.2) / 2 + 0.3), 'T_concrete', uv=3.0)
    for k in range(12):
        z = 0.3 + k * 0.3
        m.box((1.6, 0.32, 0.3), (sx0 - 0.9, -3.2 + k * 0.28, z + 0.15), 'T_concrete', uv=2.0)
    # Schuttberge
    for k in range(14):
        x = random.uniform(-11, 11)
        y = random.uniform(-6.5, 6.5)
        s = random.uniform(0.3, 0.9)
        bm = bm_sphere(1.0, 1)
        displace(bm, 0.35, 1.5, seed=k)
        m.add(bm, 'T_concrete_dark', mtx((x, y, 0.3 + s * 0.3), (random.uniform(0, 40), 0, random.uniform(0, 180)), (s * 1.3, s, s * 0.6)), 2.0)
    m.export(OUT)


# ----------------------------------------------------------------------------- Straßenlaterne / Schornstein / Wasserturm
def build_light_pole():
    m = new('light_pole')
    m.cyl(0.14, 10.0, (0, 0, 5.0), 'M_Galv', segs=16, r2=0.07)
    m.add(bm_cyl(0.25, 0.4, 16), 'T_concrete', mtx((0, 0, 0.2)), 1.0)
    m.beam((0, 0, 9.6), (1.6, 0, 10.1), 0.07, 'M_Galv', collide=False)
    m.box((0.7, 0.32, 0.16), (1.8, 0, 10.05), 'M_SteelDark', bevel=0.04)
    m.box((0.6, 0.26, 0.02), (1.8, 0, 9.96), 'M_Lamp', collide=False)
    m.meta = {'light': b2t((1.8, 0, 9.9))}
    m.export(OUT)


def build_chimney():
    m = new('chimney')
    H = 55.0
    m.add(bm_cyl(3.2, H, 40, r2=1.9), 'T_brick', mtx((0, 0, H / 2)), 2.0)
    for z in (12, 25, 38, 50):
        r = 3.2 + (1.9 - 3.2) * (z / H) + 0.08
        m.add(bm_cyl(r, 0.6, 40), 'T_concrete', mtx((0, 0, z)), 2.0)
    m.add(bm_tube(1.5, 1.95, 1.0, 40), 'T_concrete_dark', mtx((0, 0, H + 0.4)), 2.0)
    m.add(bm_box(4.0, 4.0, 0.6, 0.05), 'T_concrete', mtx((0, 0, 0.3)), 3.0)
    for k in range(int(H / 0.6)):
        z = 3 + k * 0.6
        if z > H - 3:
            break
        r = 3.2 + (1.9 - 3.2) * (z / H)
        m.add(bm_box(0.5, 0.04, 0.04), 'M_SteelDark', mtx((0, -r - 0.18, z)), 1.0)
    for z in (0, H * 0.25, H * 0.5, H * 0.75):
        r = 3.2 + (1.9 - 3.2) * ((z + H * 0.125) / H)
        m.col_cyl((0, 0, z + H * 0.125), r + 0.05, H * 0.25)
    m.export(OUT)


def build_water_tower():
    m = new('water_tower')
    H = 24.0
    legs = [(4, 4), (4, -4), (-4, -4), (-4, 4)]
    top = [(2.4, 2.4), (2.4, -2.4), (-2.4, -2.4), (-2.4, 2.4)]
    for (b, t) in zip(legs, top):
        m.beam((b[0], b[1], 0), (t[0], t[1], H), 0.35, 'T_rust', uv=2.0)
        m.add(bm_box(1.0, 1.0, 0.8, 0.05), 'T_concrete', mtx((b[0], b[1], 0.4)), 2.0)
    levels = [0.0, 6.0, 12.0, 18.0, 24.0]
    lerp = lambda a, b, t: a + (b - a) * t
    for li in range(len(levels) - 1):
        z0, z1 = levels[li] + 0.8, levels[li + 1]
        for i in range(4):
            a0, a1 = legs[i], legs[(i + 1) % 4]
            t0a, t1a = top[i], top[(i + 1) % 4]
            f0, f1 = z0 / H, z1 / H
            p00 = (lerp(a0[0], t0a[0], f0), lerp(a0[1], t0a[1], f0), z0)
            p10 = (lerp(a1[0], t1a[0], f0), lerp(a1[1], t1a[1], f0), z0)
            p01 = (lerp(a0[0], t0a[0], f1), lerp(a0[1], t0a[1], f1), z1)
            p11 = (lerp(a1[0], t1a[0], f1), lerp(a1[1], t1a[1], f1), z1)
            m.beam(p01, p11, 0.18, 'T_rust', uv=2.0)
            m.beam(p00, p11, 0.1, 'T_rust', uv=2.0)
            m.beam(p10, p01, 0.1, 'T_rust', uv=2.0)
    m.box((6.0, 6.0, 0.35), (0, 0, H + 0.18), 'T_rust', uv=2.0)
    m.cyl(4.6, 7.0, (0, 0, H + 3.85), 'T_metal_paint', segs=48, uv=3.0)
    m.cyl(4.75, 2.6, (0, 0, H + 8.65), 'T_metal_paint', segs=48, r2=0.4, uv=3.0)
    m.cyl(4.85, 0.3, (0, 0, H + 1.3), 'M_SteelDark', segs=48)
    for k in range(48):
        a = 2 * math.pi * k / 48
        m.beam((math.cos(a) * 5.3, math.sin(a) * 5.3, H + 0.35), (math.cos(a) * 5.3, math.sin(a) * 5.3, H + 1.4), 0.04, 'M_SteelDark', collide=False)
    m.add(bm_tube(5.25, 5.35, 0.05, 48), 'M_SteelDark', mtx((0, 0, H + 1.4)), 1.0)
    m.add(bm_tube(4.6, 5.4, 0.08, 48), 'M_SteelDark', mtx((0, 0, H + 0.3)), 1.0)
    m.export(OUT)


# ----------------------------------------------------------------------------- Strommast (Gittermast)
def build_pylon():
    m = new('pylon')
    H1, H2, H = 22.0, 27.0, 34.0
    base, mid, tip = 3.6, 1.1, 0.7
    hs = [0, 4, 8, 12, 16, 20, 22, 25, 27, 30, 34]

    def half_w(z):
        if z <= H1:
            return base + (mid - base) * (z / H1)
        return mid + (tip - mid) * ((z - H1) / (H - H1))

    corners = [(1, 1), (1, -1), (-1, -1), (-1, 1)]
    for c in corners:
        for k in range(len(hs) - 1):
            z0, z1 = hs[k], hs[k + 1]
            w0, w1 = half_w(z0), half_w(z1)
            m.beam((c[0] * w0, c[1] * w0, z0), (c[0] * w1, c[1] * w1, z1), 0.16, 'M_Galv', uv=2.0)
        m.add(bm_box(0.8, 0.8, 0.5, 0.05), 'T_concrete', mtx((c[0] * base, c[1] * base, 0.15)), 2.0)
    for k in range(1, len(hs)):
        z0, z1 = hs[k - 1], hs[k]
        w0, w1 = half_w(z0), half_w(z1)
        for i in range(4):
            a, b = corners[i], corners[(i + 1) % 4]
            m.beam((a[0] * w1, a[1] * w1, z1), (b[0] * w1, b[1] * w1, z1), 0.08, 'M_Galv', uv=2.0)
            m.beam((a[0] * w0, a[1] * w0, z0), (b[0] * w1, b[1] * w1, z1), 0.06, 'M_Galv', uv=2.0)
            m.beam((b[0] * w0, b[1] * w0, z0), (a[0] * w1, a[1] * w1, z1), 0.06, 'M_Galv', uv=2.0)
    attach = []
    for (z, span) in ((H1, 8.0), (H2, 6.0)):
        w = half_w(z)
        for s in (-1, 1):
            for dy in (-1, 1):
                m.beam((s * w, dy * w, z), (s * span, 0, z), 0.12, 'M_Galv', uv=2.0)
                m.beam((s * w, dy * w, z + 1.6), (s * span, 0, z), 0.08, 'M_Galv', uv=2.0)
            for k in range(1, 4):
                x = s * (w + (span - w) * k / 4)
                m.beam((x, -w * (1 - k / 4), z), (x, w * (1 - k / 4), z), 0.05, 'M_Galv', uv=2.0, collide=False)
            m.cyl(0.13, 2.0, (s * (span - 0.3), 0, z - 1.0), 'M_Insulator', segs=12)
            for kk in range(7):
                m.add(bm_cyl(0.2, 0.06, 12), 'M_Insulator', mtx((s * (span - 0.3), 0, z - 0.2 - kk * 0.26)), 1.0)
            attach.append(b2t((s * (span - 0.3), 0, z - 2.0)))
    m.beam((0, 0, H), (0, 0, H + 1.5), 0.08, 'M_Galv', collide=False)
    attach.append(b2t((0, 0, H + 1.5)))
    m.meta = {'cables': attach}
    m.export(OUT)


# ----------------------------------------------------------------------------- Kleinkram
def build_barrier():
    m = new('barrier')
    prof = [(-0.3, 0.0), (0.3, 0.0), (0.3, 0.08), (0.2, 0.33), (0.075, 0.81), (-0.075, 0.81), (-0.2, 0.33), (-0.3, 0.08)]
    bm = bm_prism(prof, 3.0)
    m.add(bm, 'T_concrete', mtx((0, 0, 0), (90, 0, 90)), 2.0)
    m.col_box((3.0, 0.5, 0.81), mtx((0, 0, 0.405)))
    m.export(OUT)


def build_pallet():
    m = new('pallet')
    for k in range(7):
        x = -0.55 + k * (1.1 / 6)
        m.box((0.1, 0.8, 0.022), (x, 0, 0.133), 'T_wood', uv=1.5, collide=False)
    for y in (-0.35, 0, 0.35):
        for x in (-0.55, 0, 0.55):
            m.box((0.1, 0.1, 0.078), (x, y, 0.083), 'T_wood', uv=1.5, collide=False)
        m.box((1.2, 0.1, 0.022), (0, y, 0.033), 'T_wood', uv=1.5, collide=False)
    for x in (-0.55, 0, 0.55):
        m.box((0.1, 0.8, 0.022), (x, 0, 0.011), 'T_wood', uv=1.5, collide=False)
    m.col_box((1.2, 0.8, 0.144), mtx((0, 0, 0.072)))
    m.export(OUT)


def build_spool():
    m = new('spool')
    for x in (-0.55, 0.55):
        m.add(bm_cyl(0.9, 0.06, 40), 'T_wood', mtx((x, 0, 0.9), (0, 90, 0)), 1.5)
    m.add(bm_cyl(0.35, 1.04, 32), 'T_wood', mtx((0, 0, 0.9), (0, 90, 0)), 1.5)
    m.add(bm_cyl(0.55, 0.98, 32), 'M_SteelDark', mtx((0, 0, 0.9), (0, 90, 0)), 1.5)
    m.col_box((1.16, 1.8, 1.8), mtx((0, 0, 0.9)))
    m.export(OUT)


def build_barrel():
    m = new('barrel')
    m.add(bm_cyl(0.29, 0.88, 32), 'T_metal_paint', mtx((0, 0, 0.44)), 1.5)
    for z in (0.02, 0.3, 0.58, 0.86):
        m.add(bm_cyl(0.3, 0.025, 32), 'T_metal_paint', mtx((0, 0, z)), 1.5)
    m.col_cyl((0, 0, 0.44), 0.3, 0.88)
    m.export(OUT)


def build_gate():
    m = new('gate')
    inner, t = 1.6, 0.14
    zb = 0.6
    out = inner + 2 * t
    segs = 4

    def bar(p0, p1):
        p0, p1 = Vector(p0), Vector(p1)
        for k in range(segs):
            a = p0 + (p1 - p0) * (k / segs)
            b = p0 + (p1 - p0) * ((k + 1) / segs)
            bm, mm, L = bm_beam(a, b, t, t, 0.02)
            m.add(bm, 'M_GateA' if k % 2 == 0 else 'M_GateB', mm, 1.0)
        bm, mm, L = bm_beam(p0, p1, t, t)
        bm.free()
        m.col_box((t, t, L), mm)

    x0, x1 = -inner / 2 - t / 2, inner / 2 + t / 2
    z0, z1 = zb + t / 2, zb + t + inner + t / 2
    bar((x0 - t / 2, 0, z0), (x1 + t / 2, 0, z0))
    bar((x0 - t / 2, 0, z1), (x1 + t / 2, 0, z1))
    bar((x0, 0, z0 + t / 2), (x0, 0, z1 - t / 2))
    bar((x1, 0, z0 + t / 2), (x1, 0, z1 - t / 2))
    for x in (x0, x1):
        m.box((0.1, 0.1, zb), (x, 0, zb / 2), 'M_GateB', collide=True)
        m.box((0.16, 0.9, 0.06), (x, 0, 0.03), 'M_GateFoot', bevel=0.01)
    m.meta = {'gate': {'center': b2t((0, 0, zb + t + inner / 2)), 'half': [inner / 2, inner / 2]}}
    m.export(OUT)


def build_pier():
    m = new('pier')
    L, W = 22.0, 3.0
    for k in range(int(L / 0.18)):
        y = -L / 2 + 0.09 + k * 0.18
        m.box((W, 0.16, 0.05), (0, y, 1.0), 'T_wood', uv=1.5, collide=False)
    for y in (-L / 2 + 0.3, -L / 4, 0, L / 4, L / 2 - 0.3):
        for x in (-W / 2 + 0.15, W / 2 - 0.15):
            m.cyl(0.13, 4.0, (x, y, -1.0), 'T_wood', segs=12, uv=1.5)
        m.box((W, 0.2, 0.2), (0, y, 0.87), 'T_wood', uv=1.5, collide=False)
    for x in (-W / 2 + 0.15, W / 2 - 0.15):
        m.box((0.2, L, 0.2), (x, 0, 0.87), 'T_wood', uv=1.5, collide=False)
    m.col_box((W, L, 0.3), mtx((0, 0, 0.9)))
    m.export(OUT)


def build_cabin():
    m = new('cabin')
    LX, LY, H = 7.0, 5.5, 2.8
    r = 0.13
    for k in range(int(H / (2 * r))):
        z = r + k * 2 * r
        for sy in (-1, 1):
            if k in (4, 5, 6) and sy < 0:
                for (xa, xb) in ((-LX / 2 - 0.3, -1.8), (-0.6, 0.6), (1.8, LX / 2 + 0.3)):
                    m.add(bm_cyl(r, xb - xa, 10), 'T_wood', mtx(((xa + xb) / 2, sy * LY / 2, z), (0, 90, 0)), 1.5)
                continue
            m.add(bm_cyl(r, LX + 0.6, 10), 'T_wood', mtx((0, sy * LY / 2, z), (0, 90, 0)), 1.5)
        for sx in (-1, 1):
            if sx > 0 and k < 8:
                for (ya, yb) in ((-LY / 2 - 0.3, -0.6), (0.6, LY / 2 + 0.3)):
                    m.add(bm_cyl(r, yb - ya, 10), 'T_wood', mtx((sx * LX / 2, (ya + yb) / 2, z + r), (90, 0, 0)), 1.5)
                continue
            m.add(bm_cyl(r, LY + 0.6, 10), 'T_wood', mtx((sx * LX / 2, 0, z + r), (90, 0, 0)), 1.5)
    m.col_box((LX, LY, H), mtx((0, 0, H / 2)))
    # Giebel + Dach
    rh = 2.0
    for sx in (-1, 1):
        bm = bm_prism([(-LY / 2, 0), (LY / 2, 0), (0, rh)], 0.2)
        m.add(bm, 'T_wood', mtx((sx * LX / 2, 0, H), (90, 0, 90)), 1.5)
    ang = math.degrees(math.atan(rh / (LY / 2)))
    rl = math.hypot(rh, LY / 2) + 0.6
    for sy in (-1, 1):
        m.box((LX + 1.2, rl, 0.12), (0, sy * LY / 4 * 1.05, H + rh / 2 + 0.08), 'M_RoofDark', rot=(-sy * ang, 0, 0), uv=2.0)
    m.box((0.6, 0.6, 1.6), (-1.8, 1.4, H + rh), 'T_brick', uv=1.5)
    m.export(OUT)


# ----------------------------------------------------------------------------- Staudamm
def build_dam():
    m = new('dam')
    L, Hd, top_t, base_t = 150.0, 40.0, 7.0, 32.0
    # Profil (Y,Z): Wasserseite +Y senkrecht, Luftseite -Y geneigt
    prof = [(top_t / 2, 0), (top_t / 2, Hd), (-top_t / 2, Hd), (-top_t / 2, Hd - 4), (-base_t + top_t / 2, 0)]
    for (x0, x1, h) in ((-L / 2, -12.0, Hd), (12.0, L / 2, Hd), (-12.0, 12.0, Hd - 5.0)):
        p = [(y, min(z, h) if z > 0 else 0) for (y, z) in prof]
        if h < Hd:
            p = [(top_t / 2, 0), (top_t / 2, h), (-top_t / 2 - 2, h), (-base_t + top_t / 2, 0)]
        bm = bm_prism(p, x1 - x0)
        m.add(bm, 'T_concrete', mtx(((x0 + x1) / 2, 0, 0), (90, 0, 90)), 6.0)
        # Kollider: Kern + geneigte Luftseite
        m.col_box((x1 - x0, top_t, h), mtx(((x0 + x1) / 2, 0, h / 2)))
        y_top, z_top = -top_t / 2, h - 4 if h == Hd else h
        y_bot = -base_t + top_t / 2
        a = Vector((0, y_top, z_top))
        b = Vector((0, y_bot, 0))
        d = b - a
        Ls = d.length
        n = Vector((0, -d.z, d.y)).normalized()
        if n.z < 0:
            n = -n
        c = (a + b) / 2 - n * 2.0
        q = Vector((0, 0, 1)).rotation_difference(d.normalized())
        mm = Matrix.Translation(Vector(((x0 + x1) / 2, c.y, c.z))) @ q.to_matrix().to_4x4()
        m.col_box((x1 - x0, 4.0, Ls), mm)
    # Pfeiler am Überlauf
    for x in (-12.5, 12.5):
        m.box((2.0, top_t + 2, Hd + 2), (x, 0, (Hd + 2) / 2), 'T_concrete', uv=6.0)
    # Geländer
    for sy in (-1, 1):
        for x0, x1 in ((-L / 2, -13.5), (13.5, L / 2)):
            m.box((x1 - x0, 0.08, 0.08), ((x0 + x1) / 2, sy * (top_t / 2 - 0.1), Hd + 1.1), 'M_Galv', collide=False)
            n = int((x1 - x0) / 2.0)
            for k in range(n + 1):
                x = x0 + k * (x1 - x0) / n
                m.box((0.06, 0.06, 1.1), (x, sy * (top_t / 2 - 0.1), Hd + 0.55), 'M_Galv', collide=False)
    # Entnahmeturm im See + Brücke
    tx, ty = 30.0, 28.0
    m.cyl(5.0, Hd + 8, (tx, ty, (Hd + 8) / 2 - 8), 'T_concrete', segs=40, uv=5.0)
    m.cyl(5.6, 1.2, (tx, ty, Hd + 0.6), 'T_concrete_dark', segs=40)
    m.cyl(4.0, 3.5, (tx, ty, Hd + 2.95), 'T_brick', segs=32, uv=2.0)
    m.cyl(4.6, 1.8, (tx, ty, Hd + 5.6), 'M_RoofDark', segs=32, r2=0.3)
    for k in range(8):
        a = 2 * math.pi * k / 8
        m.box((0.9, 0.2, 1.4), (tx + math.cos(a) * 4.02, ty + math.sin(a) * 4.02, Hd + 3.0), 'M_GlassDirty', rot=(0, 0, math.degrees(a) + 90), collide=False)
    m.box((2.6, ty - 5.0 - top_t / 2, 0.5), (tx, (ty - 5.0 + top_t / 2) / 2, Hd - 0.25), 'T_concrete', uv=4.0)
    for k in range(3):
        y = top_t / 2 + (ty - 5 - top_t / 2) * (k + 1) / 4
        m.box((1.6, 1.6, Hd + 10), (tx, y, (Hd + 10) / 2 - 10), 'T_concrete', uv=4.0)
    m.export(OUT)


# ----------------------------------------------------------------------------- Vegetation & Felsen
def cone_tier(r, h, segs, seed, star=0.28):
    bm = bmesh.new()
    apex = bm.verts.new((0, 0, h))
    rings = []
    nr = 3
    for k in range(1, nr + 1):
        f = k / nr
        ring = []
        for i in range(segs):
            a = 2 * math.pi * (i + (0.5 if k % 2 else 0)) / segs
            rr = r * f
            if k == nr:
                rr *= (1.0 + star) if i % 2 == 0 else (1.0 - star * 0.6)
            zz = h * (1 - f) - (0.18 * h if (k == nr and i % 2 == 0) else 0)
            ring.append(bm.verts.new((math.cos(a) * rr, math.sin(a) * rr, zz)))
        rings.append(ring)
    for i in range(segs):
        bm.faces.new((apex, rings[0][i], rings[0][(i + 1) % segs]))
    for k in range(nr - 1):
        A, B = rings[k], rings[k + 1]
        for i in range(segs):
            j = (i + 1) % segs
            bm.faces.new((A[i], B[i], B[j], A[j]))
    under = bm.verts.new((0, 0, h * 0.25))
    last = rings[-1]
    for i in range(segs):
        bm.faces.new((last[(i + 1) % segs], last[i], under))
    bm.normal_update()
    off = Vector((seed * 3.7, seed * 1.3, seed * 0.7))
    for v in bm.verts:
        n = noise.noise(v.co * 0.9 + off)
        v.co += Vector((v.co.x, v.co.y, 0)) * n * 0.22
    bm.normal_update()
    return bm


def build_pine(name, H, seed, lod=False):
    random.seed(seed)
    m = new(name)
    rb = H * 0.016
    m.add(bm_cyl(rb, H * 0.97, 7 if lod else 12, r2=rb * 0.15), 'T_bark', mtx((0, 0, H * 0.485)), 1.5)
    tiers = 5 if lod else 10
    z0 = H * 0.18
    rmax = H * 0.22
    for k in range(tiers):
        f = k / (tiers - 1)
        z = z0 + (H * 0.97 - z0 - H * 0.12) * f
        r = rmax * (1 - f * 0.88) * random.uniform(0.9, 1.1)
        h = (H - z0) / tiers * (2.4 if lod else 2.0)
        bm = cone_tier(r, h, 7 if lod else 12, seed * 10 + k)
        m.add(bm, 'T_needles', mtx((random.uniform(-0.1, 0.1), random.uniform(-0.1, 0.1), z), (0, 0, random.uniform(0, 360))), 1.5)
    m.col_cyl((0, 0, H * 0.25), rb * 1.2, H * 0.5)
    m.col_cyl((0, 0, z0 + (H * 0.5 - z0) / 2), rmax * 0.55, H * 0.5 - z0)
    m.col_cyl((0, 0, H * 0.72), rmax * 0.3, H * 0.4)
    m.export(OUT, angle=70.0)


def build_broadleaf(name, H, seed, lod=False):
    random.seed(seed)
    m = new(name)
    rb = H * 0.03
    m.add(bm_cyl(rb, H * 0.55, 8 if lod else 14, r2=rb * 0.6), 'T_bark', mtx((0, 0, H * 0.275)), 1.5)
    clusters = []
    nb = 4
    for k in range(nb):
        a = 2 * math.pi * k / nb + random.uniform(-0.3, 0.3)
        tip = (math.cos(a) * H * 0.2, math.sin(a) * H * 0.2, H * random.uniform(0.6, 0.75))
        if not lod:
            m.beam((0, 0, H * 0.45), tip, rb * 0.6, 'T_bark', uv=1.5, collide=False)
        clusters.append((tip, H * random.uniform(0.17, 0.22)))
    clusters.append(((0, 0, H * 0.82), H * 0.24))
    for k in range(3):
        a = random.uniform(0, 2 * math.pi)
        clusters.append(((math.cos(a) * H * 0.12, math.sin(a) * H * 0.12, H * random.uniform(0.7, 0.9)), H * 0.16))
    for i, (c, r) in enumerate(clusters):
        bm = bm_sphere(r, 1 if lod else 2)
        displace(bm, r * 0.35, 0.8 / r * 2.0, seed=seed * 7 + i, octaves=3)
        m.add(bm, 'T_foliage', mtx(c, (0, 0, random.uniform(0, 360)), (1, 1, 0.8)), 2.0)
    m.col_cyl((0, 0, H * 0.25), rb * 1.1, H * 0.5)
    m.col_sphere((0, 0, H * 0.74), H * 0.3)
    m.export(OUT, angle=75.0)


def build_bush():
    m = new('bush')
    random.seed(21)
    for i in range(4):
        r = random.uniform(0.5, 0.9)
        bm = bm_sphere(r, 2)
        displace(bm, r * 0.35, 2.5, seed=i * 3)
        m.add(bm, 'T_foliage', mtx((random.uniform(-0.6, 0.6), random.uniform(-0.6, 0.6), r * 0.7), (0, 0, random.uniform(0, 360)), (1, 1, 0.75)), 2.0)
    m.col_sphere((0, 0, 0.6), 0.9)
    m.export(OUT, angle=75.0)


def build_rock(name, seed, scale):
    m = new(name)
    bm = bm_sphere(1.0, 4)
    displace(bm, 0.45, 1.2, seed=seed, octaves=5)
    off = Vector((seed * 5.1, 0, 0))
    for v in bm.verts:
        d = noise.noise(v.co * 3.0 + off)
        v.co *= 1.0 + 0.08 * d
        if v.co.z < -0.35:
            v.co.z = -0.35 + (v.co.z + 0.35) * 0.15
    bm.normal_update()
    lo = Vector((min(v.co.x for v in bm.verts), min(v.co.y for v in bm.verts), min(v.co.z for v in bm.verts)))
    hi = Vector((max(v.co.x for v in bm.verts), max(v.co.y for v in bm.verts), max(v.co.z for v in bm.verts)))
    s = Vector(scale)
    zoff = -lo.z * s.z - 0.25 * s.z
    m.add(bm, 'T_rock', mtx((0, 0, zoff), (0, 0, 0), scale), 4.0)
    size = Vector(((hi.x - lo.x) * s.x, (hi.y - lo.y) * s.y, (hi.z - lo.z) * s.z)) * 0.82
    center = Vector(((hi.x + lo.x) / 2 * s.x, (hi.y + lo.y) / 2 * s.y, (hi.z + lo.z) / 2 * s.z + zoff))
    m.col_box(size, mtx(center))
    m.export(OUT, angle=55.0)


def build_grass_clump():
    m = new('grass_clump')
    random.seed(3)
    bm = bmesh.new()
    nb = 11
    for b in range(nb):
        a = random.uniform(0, 2 * math.pi)
        rx, ry = random.uniform(-0.12, 0.12), random.uniform(-0.12, 0.12)
        h = random.uniform(0.22, 0.48)
        w = random.uniform(0.012, 0.02)
        lean = random.uniform(0.15, 0.45)
        seg = 4
        dx, dy = math.cos(a), math.sin(a)
        px, py = -dy, dx
        prev = None
        for s in range(seg + 1):
            t = s / seg
            off = lean * h * t * t
            cx, cy, cz = rx + dx * off, ry + dy * off, h * t * (1 - 0.15 * t)
            ww = w * (1 - t) + 0.0005
            v1 = bm.verts.new((cx - px * ww, cy - py * ww, cz))
            v2 = bm.verts.new((cx + px * ww, cy + py * ww, cz))
            if prev:
                bm.faces.new((prev[0], prev[1], v2, v1))
            prev = (v1, v2)
    bm.normal_update()
    uv = bm.loops.layers.uv.verify()
    for f in bm.faces:
        for l in f.loops:
            l[uv].uv = (0.5, l.vert.co.z / 0.48)
    m.add(bm, 'M_Grass', None, uv_mode=None)
    m.export(OUT, angle=89.0)


# ----------------------------------------------------------------------------- Industrie: offene Bauwerke zum Durchfliegen
def build_steel_frame():
    """Unfertiges 3-geschossiges Stahlskelett mit Gitterrost-Böden und Verbänden."""
    m = new('steel_frame')
    xs, ys, fh = [-15, -7.5, 0, 7.5, 15], [-9, 0, 9], 4.6
    m.box((31, 19, 0.3), (0, 0, 0.15), 'T_concrete', uv=4.0)
    for x in xs:
        for y in ys:
            m.box((0.35, 0.35, fh * 3), (x, y, fh * 1.5 + 0.3), 'T_rust', uv=2.0)
    holes = {1: {(0, 0), (2, 1), (3, 0)}, 2: {(1, 1), (1, 0), (2, 0), (3, 1)}, 3: {(0, 1), (1, 0), (2, 1), (3, 0), (0, 0)}}
    for f in (1, 2, 3):
        z = 0.3 + f * fh
        for y in ys:
            m.box((30.35, 0.3, 0.45), (0, y, z - 0.22), 'T_rust', uv=2.0)
        for x in xs:
            m.box((0.3, 18.35, 0.45), (x, 0, z - 0.22), 'T_rust', uv=2.0)
        for i in range(4):
            for j in range(2):
                if (i, j) in holes[f]:
                    continue
                m.box((7.2, 8.7, 0.06), ((xs[i] + xs[i + 1]) / 2, (ys[j] + ys[j + 1]) / 2, z + 0.03), 'M_SteelDark', uv=2.0)
    # Diagonalverbände in einigen Außenfeldern
    for (x0, x1, y, f) in ((-15, -7.5, -9, 0), (7.5, 15, 9, 0), (0, 7.5, -9, 1), (-7.5, 0, 9, 2)):
        z0, z1 = 0.3 + f * fh, 0.3 + (f + 1) * fh - 0.45
        m.beam((x0, y, z0), (x1, y, z1), 0.15, 'T_rust', uv=2.0)
        m.beam((x1, y, z0), (x0, y, z1), 0.15, 'T_rust', uv=2.0)
    m.export(OUT)


def build_pipe_rack():
    """40 m Rohrbrücke: Portalrahmen, Rohre oben – unten und zwischen den Ebenen durchfliegbar."""
    m = new('pipe_rack')
    for x in range(-20, 21, 8):
        for y in (-3.2, 3.2):
            m.box((0.35, 0.35, 8.0), (x, y, 4.0), 'T_rust', uv=2.0)
            m.box((0.8, 0.8, 0.4), (x, y, 0.2), 'T_concrete', uv=2.0)
        m.box((0.3, 6.75, 0.35), (x, 0, 4.6), 'T_rust', uv=2.0)
        m.box((0.3, 6.75, 0.35), (x, 0, 7.8), 'T_rust', uv=2.0)
    for y in (-3.2, 3.2):
        m.box((40.4, 0.3, 0.35), (0, y, 7.8), 'T_rust', uv=2.0)
    for (y, r, mat) in ((-2.2, 0.45, 'M_Galv'), (-0.9, 0.3, 'M_Galv'), (0.3, 0.55, 'T_metal_paint'), (1.7, 0.35, 'M_Galv'), (2.6, 0.2, 'M_SteelDark')):
        m.cyl(r, 40.4, (0, y, 8.0 + r), mat, rot=(0, 90, 0), segs=20, uv=2.0)
    for (y, r) in ((-1.5, 0.25), (1.2, 0.3)):
        m.cyl(r, 40.4, (0, y, 4.8 + r), 'M_Galv', rot=(0, 90, 0), segs=16, uv=2.0)
    m.export(OUT)


def build_conveyor():
    """Förderband-Brücke (Fachwerk-Tunnel 3x3 m) vom Boden bis auf einen 22 m Turm."""
    m = new('conveyor')
    L, H, w, h = 46.0, 20.0, 3.2, 3.2
    a, b = Vector((-L, 0, 1.0)), Vector((-3.0, 0, H))
    d = (b - a)
    n = int(d.length / 3.2)
    for k in range(n + 1):
        p = a + d * (k / n)
        for sy in (-1, 1):
            m.beam((p.x, sy * w / 2, p.z), (p.x, sy * w / 2, p.z + h), 0.14, 'T_rust', uv=2.0)
        m.beam((p.x, -w / 2, p.z + h), (p.x, w / 2, p.z + h), 0.14, 'T_rust', uv=2.0)
        if k < n:
            q = a + d * ((k + 1) / n)
            for sy in (-1, 1):
                m.beam((p.x, sy * w / 2, p.z), (q.x, sy * w / 2, q.z + h), 0.1, 'T_rust', uv=2.0)
    for sy in (-1, 1):
        for zz in (0.0, h):
            m.beam((a.x, sy * w / 2, a.z + zz), (b.x, sy * w / 2, b.z + zz), 0.22, 'T_rust', uv=2.0)
    m.beam((a.x, 0, a.z + 0.35), (b.x, 0, b.z + 0.35), 1.6, 'M_SteelDark', d=0.25, uv=2.0)
    for k in (1, 2, 3):
        p = a + d * (k / 4)
        for sy in (-1, 1):
            m.box((0.4, 0.4, p.z), (p.x, sy * (w / 2 + 0.3), p.z / 2), 'T_rust', uv=2.0)
    # Turm (offenes Stahlgerüst mit teilweiser Verkleidung)
    for sx in (-1, 1):
        for sy in (-1, 1):
            m.box((0.4, 0.4, H + 6), (sx * 3.0, sy * 3.0, (H + 6) / 2), 'T_rust', uv=2.0)
    for z in (6, 12, H, H + 6):
        for sy in (-1, 1):
            m.box((6.4, 0.3, 0.35), (0, sy * 3.0, z), 'T_rust', uv=2.0)
            m.box((0.3, 6.4, 0.35), (sy * 3.0, 0, z), 'T_rust', uv=2.0)
    m.box((6.4, 6.4, 0.2), (0, 0, H), 'M_SteelDark', uv=2.0)
    m.box((6.6, 6.6, 0.25), (0, 0, H + 6.1), 'T_metal_sheet', uv=2.0)
    m.box((6.4, 0.08, 4.0), (0, 3.05, H + 3.6), 'T_metal_sheet', uv=2.0)
    m.box((0.08, 6.4, 2.0), (3.05, 0, H + 4.6), 'T_metal_sheet', uv=2.0)
    m.export(OUT)


def build_silos():
    """Vier Silos auf Stützen, enge Lücken dazwischen, Laufsteg oben."""
    m = new('silos')
    R, z0, z1 = 3.8, 7.0, 27.0
    pos = [(-5.0, -5.0), (5.0, -5.0), (-5.0, 5.0), (5.0, 5.0)]
    for (x, y) in pos:
        m.cyl(R, z1 - z0, (x, y, (z0 + z1) / 2), 'T_metal_paint', segs=36, uv=3.0)
        m.cyl(R, 3.5, (x, y, z0 - 1.75), 'T_metal_paint', segs=36, r2=0.6, uv=3.0, collide=False)
        m.col_cyl((x, y, z0 - 1.75), R * 0.6, 3.5)
        m.cyl(R + 0.05, 1.6, (x, y, z1 + 0.8), 'T_metal_paint', segs=36, r2=0.5, uv=3.0)
        for k in range(6):
            ang = k * math.pi / 3
            m.box((0.35, 0.35, z0), (x + math.cos(ang) * (R - 0.4), y + math.sin(ang) * (R - 0.4), z0 / 2), 'T_rust', uv=2.0)
        for z in (9, 15, 21):
            m.add(bm_tube(R, R + 0.12, 0.25, 36), 'M_SteelDark', mtx((x, y, z)), 2.0)
    for y in (-5.0, 5.0):
        m.box((24, 1.4, 0.15), (0, y, z1 + 1.7), 'M_SteelDark', uv=2.0)
        for sy in (-0.7, 0.7):
            m.box((24, 0.06, 0.06), (0, y + sy, z1 + 2.8), 'M_Galv', collide=False)
    m.box((1.4, 11.4, 0.15), (0, 0, z1 + 1.7), 'M_SteelDark', uv=2.0)
    m.box((26, 26, 0.3), (0, 0, 0.15), 'T_concrete', uv=4.0)
    m.export(OUT)


def build_shed():
    """Offene Überdachung 30 x 15 m, Dach mit Oberlichtern."""
    m = new('shed')
    for x in range(-15, 16, 6):
        for y in (-7.5, 7.5):
            m.box((0.3, 0.3, 7.0), (x, y, 3.5), 'T_rust', uv=2.0)
        m.box((0.3, 15.3, 0.5), (x, 0, 7.0), 'T_rust', uv=2.0)
    for y in (-7.5, 7.5):
        m.box((30.3, 0.3, 0.5), (0, y, 7.0), 'T_rust', uv=2.0)
    for i in range(5):
        x = -12 + i * 6
        for (y0, y1) in ((-7.8, -1.0), (1.0, 7.8)):
            m.box((6.0, y1 - y0, 0.08), (x, (y0 + y1) / 2, 7.35), 'T_metal_sheet', uv=2.0)
    m.box((30, 15, 0.2), (0, 0, 0.1), 'T_concrete', uv=4.0)
    m.export(OUT)


def build_parking():
    """Parkhaus-Rohbau: 4 Decks, offene Seiten, Rampenöffnungen."""
    m = new('parking')
    LX, LY, fh, floors = 40.0, 30.0, 3.3, 4
    xs = [-20, -12, -4, 4, 12, 20]
    ys = [-15, -5, 5, 15]
    m.box((LX + 1, LY + 1, 0.3), (0, 0, 0.15), 'T_concrete', uv=4.0)
    for f in range(1, floors + 1):
        z = f * fh
        for i in range(len(xs) - 1):
            for j in range(len(ys) - 1):
                if (i, j) == ((f % 2) * 3 + 0, 1) or (i, j) == ((f % 2) * 3 + 1, 1):
                    continue
                m.box((xs[i + 1] - xs[i], ys[j + 1] - ys[j], 0.3), ((xs[i] + xs[i + 1]) / 2, (ys[j] + ys[j + 1]) / 2, z), 'T_concrete', uv=4.0)
        for sy in (-1, 1):
            m.box((LX, 0.2, 0.9), (0, sy * LY / 2, z + 0.6), 'T_concrete_dark', uv=3.0)
        for sx in (-1, 1):
            m.box((0.2, LY, 0.9), (sx * LX / 2, 0, z + 0.6), 'T_concrete_dark', uv=3.0)
        # Rampe im ausgesparten Feld
        x0 = xs[(f % 2) * 3]
        rl = math.hypot(16.0, fh)
        m.box((16.0 * 1.0, 9.6, 0.25), (x0 + 8.0, 0, z - fh / 2), 'T_concrete', rot=(0, -math.degrees(math.atan2(fh, 16.0)) * (1 if f % 2 else -1), 0), uv=4.0)
    for x in xs:
        for y in ys:
            m.box((0.5, 0.5, floors * fh), (x, y, floors * fh / 2), 'T_concrete', uv=3.0)
    m.box((4, 6, 3.5), (-LX / 2 + 2, LY / 2 - 3, floors * fh + 1.9), 'T_brick', uv=2.0)
    m.export(OUT)


def build_gantry():
    """Portalkran 30 m Spannweite, 26 m hoch – riesiges Tor zum Durchfliegen."""
    m = new('gantry')
    H, S = 26.0, 15.0
    for sy in (-1, 1):
        y = sy * S
        for sx in (-1, 1):
            m.beam((sx * 6.0, y, 0.8), (sx * 2.0, y, H), 0.9, 'T_metal_paint', uv=3.0)
        m.box((14.0, 1.6, 1.2), (0, y, 0.6), 'T_metal_paint', uv=3.0)
        for sx in (-1, 1):
            m.cyl(0.6, 1.0, (sx * 5.5, y, 0.6), 'M_SteelDark', rot=(90, 0, 0), segs=16)
        m.box((5.0, 1.2, 1.0), (0, y, H * 0.45), 'T_metal_paint', uv=3.0)
    for sx in (-1, 1):
        m.box((1.6, 2 * S + 14, 2.2), (sx * 2.0, 0, H + 1.1), 'T_metal_paint', uv=3.0)
    for k in range(-6, 7):
        m.box((4.0, 0.25, 0.25), (0, k * 3.6, H + 2.3), 'T_metal_paint', uv=3.0)
    m.box((4.2, 4.0, 2.5), (0, 4.0, H - 0.6), 'T_metal_paint', uv=3.0)
    m.box((2.6, 2.4, 2.6), (0, -11.0, H - 3.5), 'M_SteelDark', uv=2.0)
    m.box((2.4, 0.05, 1.4), (0, -12.22, H - 3.2), 'M_GlassDirty', collide=False)
    m.cyl(0.04, 10.0, (0.4, 4.0, H - 6.8), 'M_SteelDark', segs=6, collide=False)
    m.cyl(0.04, 10.0, (-0.4, 4.0, H - 6.8), 'M_SteelDark', segs=6, collide=False)
    m.box((3.0, 2.4, 0.5), (0, 4.0, H - 12.0), 'M_SteelDark', uv=2.0)
    m.export(OUT)


# ----------------------------------------------------------------------------- Karte "Hüttenwerk": dichte Fabrik
def axes_matrix(center, xa, za):
    """Matrix aus Mittelpunkt, lokaler X- und Z-Achse (für schräge Kollider)."""
    z = Vector(za).normalized()
    x = Vector(xa)
    x = (x - z * x.dot(z)).normalized()
    y = z.cross(x)
    return Matrix.Translation(Vector(center)) @ Matrix((x, y, z)).transposed().to_4x4()


FACES = {'+y': ((-1, 0, 0), (0, 1, 0)), '-y': ((1, 0, 0), (0, -1, 0)), '+x': ((0, 1, 0), (1, 0, 0)), '-x': ((0, -1, 0), (-1, 0, 0))}


def decal(m, c, face, w, h, mat, cell, cols, rows, flipv=False):
    """Flaches Decal (Graffiti/Schmutz) 3 cm vor einer Wand. face = Außennormale."""
    r, n = (Vector(v) for v in FACES[face])
    up = Vector((0, 0, 1))
    c = Vector(c) + n * 0.03
    bm = bmesh.new()
    corners = ((0, 0), (1, 0), (1, 1), (0, 1))
    vs = [bm.verts.new(c + r * (u - 0.5) * w + up * (v - 0.5) * h) for u, v in corners]
    f = bm.faces.new(vs)
    uvl = bm.loops.layers.uv.verify()
    col, row = cell % cols, cell // cols
    for l, (u, v) in zip(f.loops, corners):
        vv = 1 - v if flipv else v
        l[uvl].uv = ((col + u) / cols, 1 - (row + 1 - vv) / rows)
    m.add(bm, mat, None, uv_mode=None)


def graffiti(m, c, face, w, h=None):
    decal(m, c, face, w, h or w / 2, 'M_Graffiti', random.randrange(16), 4, 4)


def stain(m, c, face, w, h, kind=None):
    k = kind if kind is not None else random.choice((0, 1, 1, 2))
    decal(m, c, face, w, h, 'M_Stains', k, 4, 1)


def broken_window(m, a0, a1, z0, z1, fixed, axis, face, frame=True, stains=True, board_p=0.08):
    """Rahmen, Glasscherben am Rand, ab und zu vernagelt, Laufspur darunter."""
    P = (lambda u, z: (u, fixed, z)) if axis == 'x' else (lambda u, z: (fixed, u, z))
    w, h = a1 - a0, z1 - z0
    um, zm = (a0 + a1) / 2, (z0 + z1) / 2
    if random.random() < board_p:
        for k in range(random.randint(2, 4)):
            zz = z0 + h * random.uniform(0.15, 0.85)
            size = (w + 0.3, 0.05, 0.22) if axis == 'x' else (0.05, w + 0.3, 0.22)
            m.box(size, P(um, zz), 'T_wood', rot=(0, random.uniform(-8, 8), 0) if axis == 'x' else (random.uniform(-8, 8), 0, 0), uv=1.5)
        return
    if frame:
        t = 0.07
        for (u, z, su, sz) in ((um, z0 + t / 2, w, t), (um, z1 - t / 2, w, t), (a0 + t / 2, zm, t, h), (a1 - t / 2, zm, t, h)):
            m.box((su, 0.1, sz) if axis == 'x' else (0.1, su, sz), P(u, z), 'M_WinFrame', uv=1.0, collide=False)
        if random.random() < 0.5:
            m.box((t, 0.08, h) if axis == 'x' else (0.08, t, h), P(um, zm), 'M_WinFrame', uv=1.0, collide=False)
            if random.random() < 0.6:
                m.box((w, 0.08, t) if axis == 'x' else (0.08, w, t), P(um, z0 + h * 0.62), 'M_WinFrame', uv=1.0, collide=False)
    if random.random() < 0.8:
        # Scherben in den Ecken (Mitte bleibt frei zum Durchfliegen)
        for (cu, cz, du, dz) in random.sample([(a0, z0, 1, 1), (a1, z0, -1, 1), (a0, z1, 1, -1), (a1, z1, -1, -1)], random.randint(1, 4)):
            bm = bmesh.new()
            la, lb = random.uniform(0.15, min(0.7, w * 0.45)), random.uniform(0.15, min(0.8, h * 0.4))
            tri = [(cu, cz), (cu + du * la, cz), (cu + du * random.uniform(0.0, la * 0.4), cz + dz * lb)]
            vs = [bm.verts.new(P(u, z)) for u, z in tri]
            bm.faces.new(vs)
            m.add(bm, 'M_GlassShard', None, uv_mode=None)
    if stains and random.random() < 0.6:
        stain(m, P(um, z0 - 0.85), face, w * 0.95, 1.7)


def window_wall(m, x0, x1, y, z0, z1, mat, win_w=1.8, sill=1.0, head=0.9, pier=1.1, th=0.45, axis='x', uv=2.0, decor=False):
    """Wand mit offenen Fensteröffnungen (fliegbar). axis='x': Wand verläuft entlang X bei y."""
    L = x1 - x0
    h = z1 - z0
    n = max(1, int((L - pier) / (win_w + pier)))
    pw = (L - n * win_w) / (n + 1)
    def bx(cx, cz, sx, sz):
        if axis == 'x':
            m.box((sx, th, sz), (cx, y, cz), mat, uv=uv)
        else:
            m.box((th, sx, sz), (y, cx, cz), mat, uv=uv)
    bx((x0 + x1) / 2, z0 + sill / 2, L, sill)
    bx((x0 + x1) / 2, z1 - head / 2, L, head)
    for k in range(n + 1):
        cx = x0 + pw / 2 + k * (pw + win_w)
        bx(cx, z0 + sill + (h - sill - head) / 2, pw, h - sill - head)
        if decor and k < n:
            wa = x0 + pw + k * (pw + win_w)
            face = ('+y' if y > 0 else '-y') if axis == 'x' else ('+x' if y > 0 else '-x')
            broken_window(m, wa, wa + win_w, z0 + sill, z1 - head, y, axis, face)


def rubble(m, x, y, z, r, n, seed, mats=('T_concrete_dark', 'T_brick')):
    """Schutthaufen aus Brocken (ein flacher Kollider)."""
    rnd = random.Random(seed)
    for k in range(n):
        a, d = rnd.uniform(0, 6.283), rnd.uniform(0, r) * rnd.uniform(0.3, 1.0)
        s = rnd.uniform(0.25, 0.9) * (1.2 - d / max(r, 0.1) * 0.6)
        bm = bm_box(s * rnd.uniform(0.8, 1.6), s, s * rnd.uniform(0.5, 1.0))
        displace(bm, s * 0.15, 3.0, seed=seed * 31 + k)
        m.add(bm, rnd.choice(mats), mtx((x + math.cos(a) * d, y + math.sin(a) * d, z + s * 0.3 * (1.5 - d / max(r, 0.1))),
                                        (rnd.uniform(-25, 25), rnd.uniform(-25, 25), rnd.uniform(0, 180))), 1.5)
    m.col_box((r * 1.6, r * 1.6, 0.9), mtx((x, y, z + 0.45)))


def build_factory_hall():
    random.seed(11)
    m = new('factory_hall')
    LX, LY, HW, HR = 96.0, 40.0, 18.0, 25.0
    m.box((LX + 2, LY + 2, 0.3), (0, 0, 0.15), 'T_concrete', uv=5.0)
    bay = 8.0
    nb = int(LX / bay)
    # Längswände: Ziegelpfeiler + riesige offene Fensterbänder
    for sy in (-1, 1):
        y = sy * LY / 2
        for i in range(nb + 1):
            x = -LX / 2 + i * bay
            hp = HW if not (sy > 0 and i >= 10) else random.uniform(4.0, 9.0)  # eingestürzte Ecke
            m.box((1.4, 1.0, hp), (x, y, hp / 2), 'T_brick', uv=2.0)
        for i in range(nb):
            xa, xb = -LX / 2 + i * bay + 0.7, -LX / 2 + (i + 1) * bay - 0.7
            xc = (xa + xb) / 2
            if (i, sy) not in ((2, 1), (8, -1), (5, 1)):  # sonst: Tor im Erdgeschoss
                m.box((xb - xa, 0.7, 3.2), (xc, y, 1.6), 'T_brick', uv=2.0)
            collapsed = sy > 0 and i >= 10
            if not collapsed:
                if random.random() < 0.35:  # abgebrochene Mauerkrone
                    hb = random.uniform(0.8, 2.0)
                    m.box(((xb - xa) * random.uniform(0.3, 0.7), 0.7, hb), (xc + random.uniform(-1.5, 1.5), y, HW - 3.0 + hb / 2), 'T_brick', uv=2.0)
                else:
                    m.box((xb - xa, 0.7, 3.0), (xc, y, HW - 1.5), 'T_brick', uv=2.0)
                m.box((xb - xa, 0.6, 0.6), (xc, y, 9.6), 'T_concrete_dark', uv=2.0)
                face = '+y' if sy > 0 else '-y'
                for (wz0, wz1) in ((3.2, 9.3), (9.9, 15.0)):
                    broken_window(m, xa, xb, wz0, wz1, y, 'x', face, frame=(i % 3 != 1), stains=False, board_p=0.05)
                if random.random() < 0.6:
                    stain(m, (xc, y + sy * 0.35, 13.0), face, xb - xa, 4.0)
                if (i, sy) not in ((2, 1), (8, -1), (5, 1)) and random.random() < 0.7:
                    graffiti(m, (xc, y + sy * 0.35, 1.7), face, min(5.6, xb - xa - 0.3), 2.8)
            if i % 3 == 1:  # Sprossen in jedem dritten Feld
                for k in (1, 2):
                    m.box((0.12, 0.2, 5.9), (xa + (xb - xa) * k / 3, y, 6.4), 'M_SteelDark', uv=1.0)
                    m.box((0.12, 0.2, 4.1), (xa + (xb - xa) * k / 3, y, 12.0), 'M_SteelDark', uv=1.0)
    # Giebel mit riesigem Tor
    for sx in (-1, 1):
        x = sx * LX / 2
        for (ya, yb) in ((-LY / 2, -8.0), (8.0, LY / 2)):
            window_wall(m, ya, yb, x, 0.3, HW, 'T_brick', win_w=2.4, sill=3.0, head=3.0, pier=1.6, th=0.9, axis='y')
        m.box((0.9, 16.0, HW - 13.0), (x, 0, 13.0 + (HW - 13.0) / 2), 'T_brick', uv=2.0)
        steps = 6
        for k in range(steps):
            t0, t1 = k / steps, (k + 1) / steps
            ya, yb = -LY / 2 + LY * t0, -LY / 2 + LY * t1
            zt = HW + (HR - HW) * (1 - abs((ya + yb) / 2) / (LY / 2))
            m.box((0.9, yb - ya, zt - HW), (x, (ya + yb) / 2, HW + (zt - HW) / 2), 'T_brick', uv=2.0)
    # Innenstützen + Kranbahn + Laufkran
    for i in range(1, nb, 2):
        x = -LX / 2 + i * bay
        for y in (-11.0, 11.0):
            m.box((0.7, 0.7, 14.0), (x, y, 7.0), 'T_rust', uv=2.0)
    for y in (-11.0, 11.0):
        m.box((LX - 4, 0.6, 1.0), (0, y, 14.4), 'T_rust', uv=2.0)
    m.box((2.0, 23.0, 1.6), (-12.0, 0, 15.3), 'T_metal_paint', uv=3.0)
    m.box((3.0, 3.0, 2.2), (-12.0, 4.0, 13.6), 'T_metal_paint', uv=3.0)
    m.cyl(0.05, 7.0, (-12.0, 4.0, 9.0), 'M_SteelDark', segs=6, collide=False)
    m.box((2.2, 1.4, 1.0), (-12.0, 4.0, 5.0), 'M_SteelDark', uv=2.0)
    # Fachwerk-Binder unter dem Sheddach
    for i in range(nb + 1):
        x = -LX / 2 + i * bay
        m.box((0.5, LY, 0.6), (x, 0, HW + 0.3), 'T_rust', uv=2.0)
    # Sheddach: Schrägflächen, senkrechte Fensterbänder offen, einige Felder fehlen
    missing = {1, 3, 4, 6, 9, 10, 11}
    for i in range(nb):
        x0 = -LX / 2 + i * bay
        if i in missing:
            continue
        rl = math.hypot(bay, HR - HW - 1.0)
        ang = math.degrees(math.atan2(HR - HW - 1.0, bay))
        m.box((rl, LY, 0.15), (x0 + bay / 2, 0, HW + 0.6 + (HR - HW - 1.0) / 2), 'T_metal_sheet', rot=(0, -ang, 0), uv=2.0)
        m.box((0.2, LY, 0.4), (x0 + bay, 0, HR - 0.4), 'T_rust', uv=2.0)
    # Galerie (Laufsteg) entlang der Nordseite
    m.box((LX - 8, 3.0, 0.15), (0, LY / 2 - 3.5, 7.0), 'M_SteelDark', uv=2.0)
    for i in range(0, nb + 1, 2):
        m.box((0.25, 0.25, 7.0), (-LX / 2 + 4 + i * bay * 0.95, LY / 2 - 5.0, 3.5), 'T_rust', uv=2.0)
    m.box((LX - 8, 0.06, 1.0), (0, LY / 2 - 5.0, 7.6), 'M_Galv', uv=1.0, collide=False)
    m.box((6.0, 3.0, 2.8), (30.0, LY / 2 - 3.5, 8.5), 'T_brick', uv=2.0)
    # Öfen / Maschinen / Trennwand
    for k, x in enumerate((-30.0, -18.0, 22.0)):
        m.box((7.0, 7.0, 6.0), (x, -6.0, 3.3), 'M_SteelDark', bevel=0.2, uv=2.0)
        m.cyl(2.2, 5.0, (x, -6.0, 8.8), 'T_rust', segs=24, r2=1.2)
        m.cyl(0.8, 9.0, (x + 2.5, -6.0, 13.0), 'M_Galv', segs=16)
        m.box((1.2, 6.0, 1.2), (x + 2.5, -3.0, 17.0), 'M_Galv', uv=1.0)
    m.box((0.5, 26.0, 6.0), (6.0, -7.0, 3.3), 'T_brick', uv=2.0)
    for k in range(8):
        m.box((1.2, 1.2, 1.2), (36 + (k % 3) * 1.4, 10 + (k // 3) * 1.4, 0.9), 'T_wood', uv=1.5)
    # Verfall: heruntergestürzte Dachplatten als Rampen, hängende Träger, Schutt
    for (x, y, rz, ang) in ((-36.0, 6.0, 0, 28), (-4.0, -14.0, 90, 22), (28.0, 4.0, 15, 34), (40.0, -10.0, -20, 18)):
        m.box((8.2, 9.0, 0.15), (x, y, 0.6 + 4.2 * math.sin(math.radians(ang))), 'T_metal_sheet', rot=(ang, 0, rz), uv=2.0)
    m.beam((-28.0, -11.0, 14.6), (-20.0, -6.0, 0.6), 0.45, 'T_rust', uv=2.0)
    m.beam((14.0, 11.0, 14.6), (19.0, 2.0, 5.0), 0.45, 'T_rust', uv=2.0)
    for k, (x, y, r) in enumerate(((42.0, 16.0, 5.0), (36.0, 18.5, 3.5), (-40.0, -15.0, 3.0), (2.0, 12.0, 2.5), (-12.0, -16.0, 2.0), (24.0, -16.0, 3.0))):
        rubble(m, x, y, 0.3, r, int(r * 9), 100 + k)
    m.export(OUT)


def build_brick_block(name, W, D, floors, seed, tower=False, ruin=False):
    """Mehrgeschossiges Ziegelgebäude, hohl mit Decken – Fenster offen zum Durchfliegen.
    Seitenwände (X) geschlossen, damit Häuser Wand an Wand stehen können."""
    random.seed(seed)
    m = new(name)
    fh = 4.0
    H = floors * fh
    th = 0.45
    for f in range(floors):
        z0 = 0.3 + f * fh
        for sy in (-1, 1):
            if f == 0 and sy > 0:
                # Erdgeschoss vorne: große Toröffnung
                m.box((W * 0.25, th, fh), (-W / 2 + W * 0.125, D / 2 - th / 2, z0 + fh / 2), 'T_brick', uv=2.0)
                m.box((W * 0.25, th, fh), (W / 2 - W * 0.125, D / 2 - th / 2, z0 + fh / 2), 'T_brick', uv=2.0)
                m.box((W * 0.5, th, 0.8), (0, D / 2 - th / 2, z0 + fh - 0.4), 'T_brick', uv=2.0)
                continue
            if ruin and f == floors - 1 and sy > 0:
                for k in range(3):  # obere Fassade weggebrochen
                    hb = random.uniform(0.5, 1.8)
                    m.box((W / 4, th, hb), (-W / 3 + k * W / 3, sy * (D / 2 - th / 2), z0 + hb / 2), 'T_brick', uv=2.0)
                continue
            window_wall(m, -W / 2, W / 2, sy * (D / 2 - th / 2), z0, z0 + fh, 'T_brick', win_w=1.7, sill=1.0, head=0.9, pier=1.2, th=th, decor=True)
        for sx in (-1, 1):
            hs = fh if not (ruin and f == floors - 1) else random.uniform(1.5, 3.5)
            m.box((th, D, hs), (sx * (W / 2 - th / 2), 0, z0 + hs / 2), 'T_brick', uv=2.0)
        # Decke mit Treppenloch
        zc = z0 + fh
        hx = W / 2 - 3.2
        if ruin and (f == floors - 1 or random.random() < 0.5):
            # eingebrochene Decke: Randstreifen + abgesackte Platte -> senkrechte Dives
            m.box((W - 2 * th, 2.5, 0.3), (0, -D / 2 + th + 1.25, zc - 0.15), 'T_concrete', uv=3.0)
            m.box((W * 0.5, 4.0, 0.3), (-W / 4, 1.0, zc - 1.2), 'T_concrete', rot=(-18, 0, 8), uv=3.0)
        else:
            m.box((W - 2 * th - 3.0, D - 2 * th, 0.3), (-1.5, 0, zc - 0.15), 'T_concrete', uv=3.0)
            m.box((3.0, D - 2 * th - 3.2, 0.3), (hx + 1.6 - 0.2, -1.6, zc - 0.15), 'T_concrete', uv=3.0)
    # Graffiti, Moos, Ruß- und Regenspuren
    if random.random() < 0.75:
        for sx in (-1, 1):
            graffiti(m, (sx * (W / 2 - W * 0.125), D / 2, 2.2), '+y', W * 0.22)
    for sx in (-1, 1):
        if random.random() < 0.55:
            graffiti(m, (sx * W / 2, random.uniform(-2.5, 2.5), 2.0), '+x' if sx > 0 else '-x', random.uniform(3.0, 5.0))
        if random.random() < 0.5:
            stain(m, (sx * W / 2, 0, 0.3 + H - 2.0), '+x' if sx > 0 else '-x', D * 0.9, 4.0)
    if random.random() < 0.6:
        graffiti(m, (random.uniform(-W / 3, W / 3), -D / 2, 0.85), '-y', 2.2, 1.0)
    for sy, face in ((1, '+y'), (-1, '-y')):
        if random.random() < 0.6:
            stain(m, (0, sy * D / 2, 1.05), face, W * 0.98, 1.5, kind=3)
        if random.random() < 0.7:
            stain(m, (0, sy * D / 2, 0.3 + H - 1.6), face, W * 0.95, 3.2)
    if ruin:
        rubble(m, 0.5, 1.0, 0.3, min(W, D) * 0.3, 18, seed * 7)
        rubble(m, -W * 0.2, D / 2 + 1.5, 0.0, 2.0, 10, seed * 7 + 1)
        m.box((W, D, 0.3), (0, 0, 0.15), 'T_concrete', uv=3.0)
        m.export(OUT)
        return
    # Gesims + Attika
    m.box((W + 0.4, D + 0.4, 0.35), (0, 0, 0.3 + H + 0.2), 'T_concrete_dark', uv=3.0)
    for sy in (-1, 1):
        m.box((W, 0.3, 0.9), (0, sy * (D / 2 - 0.15), 0.3 + H + 0.8), 'T_brick', uv=2.0)
    # Dachaufbauten
    m.box((1.2, 1.2, 2.5), (W / 2 - 1.5, -D / 2 + 1.8, 0.3 + H + 1.6), 'T_brick', uv=2.0)
    if tower:
        tz = 0.3 + H + 0.35
        m.box((4.0, 4.0, 7.0), (-W / 2 + 2.6, 0, tz + 3.5), 'T_brick', uv=2.0)
        m.box((4.6, 4.6, 0.4), (-W / 2 + 2.6, 0, tz + 7.2), 'T_concrete_dark', uv=2.0)
        m.cyl(2.2, 3.0, (-W / 2 + 2.6, 0, tz + 9.0), 'T_rust', segs=24)
    else:
        m.cyl(1.4, 2.0, (0, 1.5, 0.3 + H + 1.4), 'T_rust', segs=20)
    m.box((W, D, 0.3), (0, 0, 0.15), 'T_concrete', uv=3.0)
    m.export(OUT)


def build_cooling_tower():
    """Kühlturm (Hyperboloid) 64 m – unten zwischen den Stützen hinein, oben hinaus."""
    m = new('cooling_tower')
    N, M = 40, 12
    z0, z1 = 9.0, 64.0
    rz = lambda z: 17.0 * math.sqrt(1 + ((z - 48.0) / 30.0) ** 2)
    bm = bmesh.new()
    th = 0.6
    rings_o, rings_i = [], []
    for j in range(M + 1):
        z = z0 + (z1 - z0) * j / M
        r = rz(z)
        rings_o.append([bm.verts.new((math.cos(2 * math.pi * i / N) * r, math.sin(2 * math.pi * i / N) * r, z)) for i in range(N)])
        rings_i.append([bm.verts.new((math.cos(2 * math.pi * i / N) * (r - th), math.sin(2 * math.pi * i / N) * (r - th), z)) for i in range(N)])
    for j in range(M):
        for i in range(N):
            k = (i + 1) % N
            bm.faces.new((rings_o[j][i], rings_o[j][k], rings_o[j + 1][k], rings_o[j + 1][i]))
            bm.faces.new((rings_i[j][k], rings_i[j][i], rings_i[j + 1][i], rings_i[j + 1][k]))
    for (ro, ri, up) in ((rings_o[-1], rings_i[-1], True), (rings_o[0], rings_i[0], False)):
        for i in range(N):
            k = (i + 1) % N
            q = (ro[i], ro[k], ri[k], ri[i]) if up else (ro[k], ro[i], ri[i], ri[k])
            bm.faces.new(q)
    bm.normal_update()
    m.add(bm, 'T_concrete', None, uv=6.0)
    # Kollider: Schalen-Segmente
    for j in range(M):
        za, zb = z0 + (z1 - z0) * j / M, z0 + (z1 - z0) * (j + 1) / M
        for i in range(0, N, 1):
            a = 2 * math.pi * (i + 0.5) / N
            pa = Vector((math.cos(a) * rz(za), math.sin(a) * rz(za), za))
            pb = Vector((math.cos(a) * rz(zb), math.sin(a) * rz(zb), zb))
            chord = 2 * math.pi * rz((za + zb) / 2) / N
            mm = axes_matrix((pa + pb) / 2, (-math.sin(a), math.cos(a), 0), pb - pa)
            m.col_box((chord * 1.05, th + 0.3, (pb - pa).length), mm)
    # V-Stützen unten
    for i in range(0, N, 2):
        a0 = 2 * math.pi * i / N
        a1 = 2 * math.pi * (i + 2) / N
        r0 = rz(z0) - th / 2
        top = (math.cos((a0 + a1) / 2) * r0, math.sin((a0 + a1) / 2) * r0, z0)
        for a in (a0, a1):
            m.beam((math.cos(a) * (r0 + 1.0), math.sin(a) * (r0 + 1.0), 0.0), top, 0.7, 'T_concrete', uv=3.0)
    m.add(bm_tube(rz(0) - 6, rz(0) + 2, 1.2, 48), 'T_concrete_dark', mtx((0, 0, 0.6)), 4.0)
    m.export(OUT, angle=40.0)


def build_furnace():
    """Hochofen-Turm mit Gerüst, Bühnen und schrägem Abgasrohr."""
    m = new('furnace')
    m.cyl(5.5, 22.0, (0, 0, 11.0), 'T_rust', segs=36)
    m.cyl(5.5, 8.0, (0, 0, 26.0), 'T_rust', segs=36, r2=3.2)
    m.cyl(3.2, 10.0, (0, 0, 35.0), 'M_SteelDark', segs=28)
    m.cyl(3.6, 2.0, (0, 0, 41.0), 'T_rust', segs=28, r2=1.6)
    for z in (6.0, 14.0, 22.0, 30.0):
        r = 5.5 if z < 22 else 4.5
        m.add(bm_tube(r, r + 2.2, 0.2, 36), 'M_SteelDark', mtx((0, 0, z)), 2.0)
        for k in range(12):
            a = k * math.pi / 6
            m.box((0.05, 0.05, 1.0), (math.cos(a) * (r + 2.1), math.sin(a) * (r + 2.1), z + 0.6), 'M_Galv', collide=False)
    # Gerüst (4 Stützen + Riegel)
    for sx in (-1, 1):
        for sy in (-1, 1):
            m.box((0.6, 0.6, 38.0), (sx * 8.5, sy * 8.5, 19.0), 'T_rust', uv=2.0)
    for z in (10.0, 20.0, 30.0, 38.0):
        for s in (-1, 1):
            m.box((17.6, 0.5, 0.6), (0, s * 8.5, z), 'T_rust', uv=2.0)
            m.box((0.5, 17.6, 0.6), (s * 8.5, 0, z), 'T_rust', uv=2.0)
    for (x0, y0, x1, y1, z0, z1) in ((-8.5, -8.5, 8.5, -8.5, 0, 10), (8.5, 8.5, -8.5, 8.5, 10, 20), (8.5, -8.5, 8.5, 8.5, 20, 30)):
        m.beam((x0, y0, z0), (x1, y1, z1), 0.3, 'T_rust', uv=2.0)
    # Großes Abgasrohr schräg zum Boden + Staubsack
    m.beam((0, 0, 40.0), (26.0, 0, 18.0), 2.4, 'M_SteelDark', uv=3.0)
    m.cyl(4.0, 14.0, (28.0, 0, 11.0), 'T_rust', segs=28)
    m.cyl(4.0, 4.0, (28.0, 0, 2.0), 'T_rust', segs=28, r2=1.0)
    for sx in (-1, 1):
        for sy in (-1, 1):
            m.box((0.5, 0.5, 18.0), (28.0 + sx * 3.5, sy * 3.5, 9.0), 'T_rust', uv=2.0)
    m.box((40.0, 22.0, 0.3), (8.0, 0, 0.15), 'T_concrete', uv=4.0)
    m.export(OUT)


def build_skywalk():
    """Geschlossene Verbindungsbrücke (4 x 4 m, 30 m) auf Stützen – Tunnel zum Durchfliegen."""
    m = new('skywalk')
    L, W, Hh, z0 = 30.0, 4.2, 3.8, 11.0
    m.box((L, W, 0.3), (0, 0, z0), 'T_concrete', uv=3.0)
    m.box((L, W + 0.4, 0.25), (0, 0, z0 + Hh), 'T_metal_sheet', uv=2.0)
    for sy in (-1, 1):
        m.box((L, 0.12, 1.1), (0, sy * W / 2, z0 + 0.7), 'T_metal_sheet', uv=2.0)
        m.box((L, 0.12, 0.9), (0, sy * W / 2, z0 + Hh - 0.45), 'T_metal_sheet', uv=2.0)
        for k in range(11):
            m.box((0.15, 0.15, Hh), (-L / 2 + k * 3.0, sy * W / 2, z0 + Hh / 2), 'T_rust', uv=2.0)
    for x in (-L / 2 + 1.5, L / 2 - 1.5):
        for sy in (-1, 1):
            m.box((0.6, 0.6, z0), (x, sy * (W / 2 - 0.4), z0 / 2), 'T_rust', uv=2.0)
        m.beam((x, -W / 2 + 0.4, 0.3), (x, W / 2 - 0.4, z0 - 0.3), 0.2, 'T_rust', uv=2.0)
    m.export(OUT)


def build_rubble_pile():
    m = new('rubble_pile')
    rubble(m, 0, 0, 0.0, 4.0, 40, 77)
    m.export(OUT, angle=60.0)


def build_car_wreck():
    """Ausgebranntes Autowrack (rostig, ohne Scheiben)."""
    m = new('car_wreck')
    m.box((4.3, 1.75, 0.75), (0, 0, 0.75), 'T_rust', bevel=0.12, uv=2.0, collide=False)
    for sx in (-1, 1):
        m.box((0.12, 1.6, 0.55), (sx * 0.85 - 0.3, 0, 1.4), 'T_rust', rot=(0, -sx * 18, 0), uv=2.0, collide=False)
    for sy in (-1, 1):
        for x in (-1.0, 0.05, 0.9):
            m.box((0.1, 0.1, 0.55), (x - 0.3, sy * 0.78, 1.4), 'T_rust', uv=2.0, collide=False)
    m.box((2.2, 1.6, 0.08), (-0.25, 0, 1.68), 'T_rust', uv=2.0, collide=False)
    for sx in (-1, 1):
        for sy in (-1, 1):
            m.cyl(0.33, 0.22, (sx * 1.35, sy * 0.78, 0.33), 'M_SteelDark', rot=(90, 0, 0), segs=14, collide=False)
    m.col_box((4.3, 1.8, 1.7), mtx((0, 0, 0.85)))
    m.export(OUT)


def build_fallen_beams():
    m = new('fallen_beams')
    for (a, b, w) in (((-6, -1, 0.2), (6, 1.5, 0.25), 0.45), ((-4, 2, 0.2), (3, -2.5, 3.2), 0.4), ((1, -3, 0.2), (2, 3, 1.4), 0.35)):
        m.beam(a, b, w, 'T_rust', uv=2.0)
    m.export(OUT)


def main():
    ensure_dir(OUT)
    jobs = [build_rubble_pile, build_car_wreck, build_fallen_beams, build_factory_hall, build_cooling_tower, build_furnace, build_skywalk, build_container, build_warehouse, build_bando, build_light_pole, build_chimney, build_water_tower,
            build_pylon, build_barrier, build_pallet, build_spool, build_barrel, build_gate, build_pier,
            build_cabin, build_dam, build_bush, build_grass_clump, build_steel_frame, build_pipe_rack,
            build_conveyor, build_silos, build_shed, build_parking, build_gantry]
    only = os.environ.get('SKYFPV_ONLY', '')
    for j in jobs:
        if only and j.__name__ not in only.split(','):
            continue
        j()
    if not only or 'blocks' in only:
        build_brick_block('brick_a', 14.0, 12.0, 3, 1)
        build_brick_block('brick_b', 10.0, 12.0, 5, 2, tower=True)
        build_brick_block('brick_c', 18.0, 12.0, 2, 3)
        build_brick_block('brick_d', 12.0, 12.0, 4, 4)
        build_brick_block('ruin_a', 14.0, 12.0, 3, 5, ruin=True)
        build_brick_block('ruin_b', 10.0, 12.0, 4, 6, ruin=True)
        build_brick_block('ruin_c', 18.0, 12.0, 2, 7, ruin=True)
        build_brick_block('ruin_d', 12.0, 12.0, 4, 8, ruin=True)
    if not only or 'trees' in only:
        build_pine('pine_a', 16.0, 1)
        build_pine('pine_b', 21.0, 2)
        build_pine('pine_c', 12.0, 3)
        build_pine('pine_a_lod', 16.0, 1, True)
        build_pine('pine_b_lod', 21.0, 2, True)
        build_pine('pine_c_lod', 12.0, 3, True)
        build_broadleaf('tree_a', 13.0, 4)
        build_broadleaf('tree_b', 10.0, 5)
        build_broadleaf('tree_a_lod', 13.0, 4, True)
        build_broadleaf('tree_b_lod', 10.0, 5, True)
    if not only or 'rocks' in only:
        build_rock('rock_a', 1, (2.2, 1.6, 1.3))
        build_rock('rock_b', 2, (1.2, 1.0, 0.9))
        build_rock('rock_c', 3, (4.5, 3.5, 2.8))
    print('[SkyFPV] Umgebungsmodelle fertig')


main()
