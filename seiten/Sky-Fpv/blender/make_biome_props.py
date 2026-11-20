# -----------------------------------------------------------------------------
# Sky FPV - Modelle für die Biome Dschungel, Wüsten-Canyon und Winter
# Aufruf: blender -b --factory-startup -P make_biome_props.py   (SKYFPV_ONLY=name1,name2 optional)
# -----------------------------------------------------------------------------
import os
import sys
import math
import random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bmesh
from mathutils import Vector, Matrix, noise
from _common import (reset, material, Model, mtx, bm_box, bm_cyl, bm_tube, bm_sphere, bm_beam, bm_prism,
                     displace, b2t, ensure_dir, MODELS)

OUT = os.path.join(MODELS, 'env')


def new(name):
    reset()
    for n, c, r, m in (('T_mossy_stone', '#ffffff', 0.85, 0), ('T_red_rock', '#ffffff', 0.85, 0), ('T_snow', '#ffffff', 0.6, 0),
                       ('T_wood', '#ffffff', 0.8, 0), ('T_bark', '#ffffff', 0.95, 0), ('T_foliage', '#ffffff', 0.7, 0),
                       ('T_needles', '#ffffff', 0.75, 0), ('T_metal_paint', '#ffffff', 0.5, 0.15), ('T_rust', '#ffffff', 0.85, 0.35),
                       ('T_concrete', '#ffffff', 0.9, 0), ('M_SteelDark', '#3a3d40', 0.5, 0.8), ('M_Galv', '#8d9399', 0.45, 0.85),
                       ('M_GlassDirty', '#4d5a5e', 0.15, 0.2), ('M_Vine', '#2d4a1a', 0.8, 0), ('M_Rope', '#8a7350', 0.9, 0),
                       ('M_Alu', '#a7adb3', 0.4, 0.9), ('M_RedPaint', '#b0362a', 0.5, 0.2), ('M_Cactus', '#4d6b35', 0.7, 0)):
        material(n, c, r, m)
    return Model(name)


def axes_matrix(center, xa, za):
    z = Vector(za).normalized()
    x = Vector(xa)
    x = (x - z * x.dot(z)).normalized()
    y = z.cross(x)
    return Matrix.Translation(Vector(center)) @ Matrix((x, y, z)).transposed().to_4x4()


def box_hole(m, size, c, hole, mat, uv=3.0):
    """Quader mit rechteckigem Loch (hx, hy) in der Mitte -> 4 Quader."""
    sx, sy, sz = size
    hx, hy = hole
    m.box((sx, (sy - hy) / 2, sz), (c[0], c[1] + (sy + hy) / 4, c[2]), mat, uv=uv)
    m.box((sx, (sy - hy) / 2, sz), (c[0], c[1] - (sy + hy) / 4, c[2]), mat, uv=uv)
    m.box(((sx - hx) / 2, hy, sz), (c[0] + (sx + hx) / 4, c[1], c[2]), mat, uv=uv)
    m.box(((sx - hx) / 2, hy, sz), (c[0] - (sx + hx) / 4, c[1], c[2]), mat, uv=uv)


def vine(m, p0, length, seed):
    rnd = random.Random(seed)
    p = Vector(p0)
    for k in range(4):
        q = p + Vector((rnd.uniform(-0.3, 0.3), rnd.uniform(-0.3, 0.3), -length / 4))
        m.beam(p, q, rnd.uniform(0.04, 0.08), 'M_Vine', uv=1.0, collide=False)
        p = q


def blob(m, c, r, mat, seed, squash=0.8, sub=2):
    bm = bm_sphere(r, sub)
    displace(bm, r * 0.3, 1.6 / r, seed=seed, octaves=3)
    m.add(bm, mat, mtx(c, (0, 0, seed * 37 % 360), (1, 1, squash)), 2.0)


# ============================================================================ DSCHUNGEL
def temple_pyramid():
    """Stufenpyramide mit Treppe, Tempel oben, Tunnel unten und Schacht senkrecht hindurch."""
    random.seed(1)
    m = new('temple_pyramid')
    base, tiers, th, step = 44.0, 8, 2.8, 2.4
    for t in range(tiers):
        s = base - 2 * step * t
        z0 = t * th
        if t == 0:
            for sy in (-1, 1):
                m.box((s, (s - 6.0) / 2, th), (0, sy * (3.0 + (s - 6.0) / 4), z0 + th / 2), 'T_mossy_stone', uv=4.0)
        elif t == 1:
            for sy in (-1, 1):
                m.box((s, (s - 6.0) / 2, 1.7), (0, sy * (3.0 + (s - 6.0) / 4), z0 + 0.85), 'T_mossy_stone', uv=4.0)
            box_hole(m, (s, s, th - 1.7), (0, 0, z0 + 1.7 + (th - 1.7) / 2), (4.5, 4.5), 'T_mossy_stone', uv=4.0)
        else:
            box_hole(m, (s, s, th), (0, 0, z0 + th / 2), (4.5, 4.5), 'T_mossy_stone', uv=4.0)
        # bröckelnde Kanten
        for k in range(3):
            a = random.uniform(-s / 2, s / 2)
            m.box((random.uniform(1, 3), 1.2, 0.8), (a, s / 2 + 0.3, z0 + th + 0.2), 'T_mossy_stone', rot=(random.uniform(-15, 15), 0, random.uniform(0, 20)), uv=3.0, collide=False)
    # Freitreppe (+Y)
    H = tiers * th
    n = 48
    for k in range(n):
        z = k * H / n
        y = base / 2 + 1.5 - k * (base / 2 - (base - 2 * step * (tiers - 1)) / 2 + 1.5) / n
        m.box((8.0, 1.6, H / n + 0.02), (0, y, z + H / (2 * n)), 'T_mossy_stone', uv=3.0, collide=False)
    m.col_box((8.0, 3.0, H), axes_matrix((0, base / 4 + 0.5, H / 2), (1, 0, 0), (0, -(base / 2 - 6), H)))
    # Tempel oben (offen, Türen in drei Richtungen, Dachkamm)
    tz = H
    for (x, y, sx, sy) in ((0, -4.0, 12, 1.0), (-5.5, 0, 1.0, 9), (5.5, 0, 1.0, 9)):
        m.box((sx, sy, 6.0), (x, y, tz + 3.0), 'T_mossy_stone', uv=3.0)
    for sx in (-1, 1):
        m.box((3.5, 1.0, 6.0), (sx * 4.25, 4.0, tz + 3.0), 'T_mossy_stone', uv=3.0)
    m.box((12.5, 9.5, 0.8), (0, 0, tz + 6.4), 'T_mossy_stone', uv=3.0)
    box_hole(m, (12.5, 9.5, 0.01), (0, 0, tz + 0.01), (4.5, 4.5), 'T_mossy_stone', uv=3.0)
    for k in range(4):
        m.box((10.0 - k * 2.2, 0.8, 1.6), (0, -1.0, tz + 7.6 + k * 1.6), 'T_mossy_stone', uv=3.0)
    # Lianen über die Stufen
    for k in range(26):
        t = random.randrange(1, tiers)
        s = base - 2 * step * t
        a = random.uniform(-s / 2, s / 2)
        side = random.choice(((a, s / 2), (a, -s / 2), (s / 2, a), (-s / 2, a)))
        vine(m, (side[0], side[1], t * th), random.uniform(2, 6), k)
    m.export(OUT)


def corbel_wall(name, L=14.0, Hh=7.0, arches=1, broken=True, seed=0):
    random.seed(seed)
    m = new(name)
    th = 1.4
    aw, ah = 3.6, 5.0
    xs = [(-L / 2 + L * (k + 0.5) / arches) for k in range(arches)]
    cuts = sorted([(x - aw / 2, x + aw / 2) for x in xs])
    x = -L / 2
    for (a, b) in cuts:
        if a > x:
            hh = Hh if not broken else random.uniform(Hh * 0.6, Hh)
            m.box((a - x, th, hh), ((x + a) / 2, 0, hh / 2), 'T_mossy_stone', uv=3.0)
        x = b
    if x < L / 2:
        hh = Hh if not broken else random.uniform(Hh * 0.6, Hh)
        m.box((L / 2 - x, th, hh), ((x + L / 2) / 2, 0, hh / 2), 'T_mossy_stone', uv=3.0)
    for cx in xs:
        for k in range(5):   # Kragbogen: Stufen nach innen
            w = aw - k * 0.75
            m.box(((aw - w) / 2 + 0.01, th, 0.5), (cx - aw / 2 + (aw - w) / 4, 0, ah + k * 0.5 - 0.25 - 2.0 + 2.0), 'T_mossy_stone', uv=3.0)
            m.box(((aw - w) / 2 + 0.01, th, 0.5), (cx + aw / 2 - (aw - w) / 4, 0, ah + k * 0.5 - 0.25), 'T_mossy_stone', uv=3.0)
        m.box((aw, th, Hh - ah - 2.5), (cx, 0, ah + 2.5 + (Hh - ah - 2.5) / 2), 'T_mossy_stone', uv=3.0)
    for k in range(8):
        bm = bm_box(random.uniform(0.6, 1.4), random.uniform(0.5, 1.0), random.uniform(0.4, 0.8), 0.08)
        m.add(bm, 'T_mossy_stone', mtx((random.uniform(-L / 2, L / 2), random.uniform(-3, 3), 0.3), (random.uniform(-20, 20), 0, random.uniform(0, 90))), 2.0)
    for k in range(6):
        vine(m, (random.uniform(-L / 2, L / 2), random.choice((-th / 2 - 0.05, th / 2 + 0.05)), Hh * 0.9), random.uniform(2.5, 5), seed * 10 + k)
    m.export(OUT)


def stelae():
    random.seed(3)
    m = new('stelae')
    for k, (x, y) in enumerate(((-4, 0), (0, 1), (4.5, -0.5))):
        h = random.uniform(3.5, 5.5)
        m.box((1.4, 0.7, h), (x, y, h / 2), 'T_mossy_stone', rot=(random.uniform(-6, 6), random.uniform(-8, 8), random.uniform(-20, 20)), bevel=0.1, uv=2.0)
    m.box((3.2, 1.0, 0.8), (1.5, 3.0, 0.4), 'T_mossy_stone', rot=(0, 10, 30), bevel=0.1, uv=2.0)
    m.box((2.4, 2.4, 1.2), (-1.5, -3.0, 0.6), 'T_mossy_stone', bevel=0.15, uv=2.0)
    m.export(OUT)


def jungle_tree(name, H, seed):
    random.seed(seed)
    m = new(name)
    rb = H * 0.045
    m.add(bm_cyl(rb, H * 0.8, 14, r2=rb * 0.55), 'T_bark', mtx((0, 0, H * 0.4)), 1.5)
    for k in range(5):   # Brettwurzeln
        a = 2 * math.pi * k / 5 + random.uniform(-0.2, 0.2)
        L = rb * random.uniform(2.6, 3.4)
        p = bm_prism([(0, 0), (L, 0), (0, H * 0.14)], 0.25)
        m.add(p, 'T_bark', mtx((0, 0, 0), (90, 0, math.degrees(a))), 1.5)
    tops = []
    for k in range(4):
        a = 2 * math.pi * k / 4 + random.uniform(-0.4, 0.4)
        tip = (math.cos(a) * H * 0.18, math.sin(a) * H * 0.18, H * random.uniform(0.75, 0.88))
        m.beam((0, 0, H * 0.62), tip, rb * 0.5, 'T_bark', uv=1.5, collide=False)
        tops.append(tip)
    tops.append((0, 0, H * 0.93))
    for i, c in enumerate(tops):
        r = H * random.uniform(0.15, 0.2)
        blob(m, c, r, 'T_foliage', seed * 7 + i, 0.55)
        for v in range(3):
            vine(m, (c[0] + random.uniform(-r * 0.7, r * 0.7), c[1] + random.uniform(-r * 0.7, r * 0.7), c[2] - r * 0.4), random.uniform(H * 0.25, H * 0.6), seed * 31 + i * 5 + v)
    m.col_cyl((0, 0, H * 0.4), rb * 1.1, H * 0.8)
    m.col_sphere((0, 0, H * 0.84), H * 0.26)
    m.export(OUT, angle=75.0)


def frond(m, base, ang, L, droop, w, mat, seed):
    bm = bmesh.new()
    seg = 6
    prev = None
    d = Vector((math.cos(ang), math.sin(ang), 0))
    side = Vector((-d.y, d.x, 0))
    for s in range(seg + 1):
        t = s / seg
        p = Vector(base) + d * L * t + Vector((0, 0, L * 0.35 * t - droop * t * t))
        ww = w * math.sin(math.pi * min(1, t * 1.1 + 0.05))
        v1, v2 = bm.verts.new(p - side * ww), bm.verts.new(p + side * ww)
        if prev:
            bm.faces.new((prev[0], prev[1], v2, v1))
        prev = (v1, v2)
    bm.normal_update()
    m.add(bm, mat, None, uv=1.5)


def palm(name, H, seed):
    random.seed(seed)
    m = new(name)
    bend = random.uniform(1.5, 3.5)
    p = Vector((0, 0, 0))
    n = 8
    for k in range(n):
        t = (k + 1) / n
        q = Vector((bend * t * t, 0, H * t))
        m.beam(p, q, 0.32 - 0.1 * t, 'T_bark', uv=1.5, collide=False)
        p = q
    for k in range(9):
        frond(m, p, 2 * math.pi * k / 9 + random.uniform(-0.2, 0.2), random.uniform(4.0, 5.5), random.uniform(3.0, 4.5), 0.7, 'T_foliage', seed + k)
    blob(m, p, 0.6, 'T_bark', seed, 1.0, 1)
    m.col_cyl((bend * 0.5, 0, H / 2), 0.4, H)
    m.export(OUT, angle=80.0)


def fern():
    m = new('fern')
    random.seed(9)
    for k in range(12):
        frond(m, (0, 0, 0.1), 2 * math.pi * k / 12 + random.uniform(-0.15, 0.15), random.uniform(1.2, 1.8), random.uniform(1.0, 1.5), 0.25, 'T_foliage', k)
    m.export(OUT, angle=80.0)


def rope_bridge():
    m = new('rope_bridge')
    L, sag = 44.0, 3.0
    zc = lambda x: -sag * (1 - (2 * x / L) ** 2)
    n = int(L / 0.7)
    for k in range(n + 1):
        x = -L / 2 + k * L / n
        if random.random() < 0.06:
            continue   # fehlende Planken
        m.box((0.3, 2.0, 0.08), (x, 0, zc(x)), 'T_wood', rot=(random.uniform(-3, 3), 0, random.uniform(-4, 4)), uv=1.5, collide=False)
    seg = 16
    for (y, dz) in ((-1.1, 0.0), (1.1, 0.0), (-1.1, 1.1), (1.1, 1.1)):
        for k in range(seg):
            x0, x1 = -L / 2 + k * L / seg, -L / 2 + (k + 1) * L / seg
            m.beam((x0, y, zc(x0) + dz), (x1, y, zc(x1) + dz), 0.06, 'M_Rope', uv=1.0, collide=False)
    for k in range(0, n, 3):
        x = -L / 2 + k * L / n
        for y in (-1.1, 1.1):
            m.beam((x, y, zc(x)), (x, y, zc(x) + 1.1), 0.025, 'M_Rope', uv=1.0, collide=False)
    for k in range(8):   # Deck-Kollider
        x0, x1 = -L / 2 + k * L / 8, -L / 2 + (k + 1) * L / 8
        m.col_box((L / 8, 2.0, 0.2), axes_matrix(((x0 + x1) / 2, 0, (zc(x0) + zc(x1)) / 2), (0, 1, 0), (x1 - x0, 0, zc(x1) - zc(x0))))
    for x in (-L / 2 - 0.6, L / 2 + 0.6):
        for y in (-1.3, 1.3):
            m.box((0.4, 0.4, 3.0), (x, y, 0.4), 'T_wood', uv=1.5)
    m.export(OUT)


# ============================================================================ WÜSTEN-CANYON
def trestle():
    """Hölzerne Eisenbahnbrücke 80 m: Joche mit Schrägstützen zum Durchfliegen."""
    m = new('trestle')
    L, H = 80.0, 18.0
    for k in range(17):
        x = -L / 2 + k * 5.0
        for sy in (-1, 1):
            m.beam((x, sy * 4.2, 0), (x, sy * 1.4, H), 0.35, 'T_wood', uv=1.5)
            m.beam((x, sy * 2.2, 0), (x, sy * 0.6, H), 0.3, 'T_wood', uv=1.5)
        for z in (5.0, 11.0):
            w = 4.2 - (4.2 - 1.4) * z / H
            m.box((0.25, 2 * w + 0.6, 0.3), (x, 0, z), 'T_wood', uv=1.5)
        m.beam((x, -3.2, 0.5), (x, 2.6, 10.5), 0.18, 'T_wood', uv=1.5, collide=False)
        m.beam((x, 2.6, 6.0), (x, -2.0, H - 0.5), 0.18, 'T_wood', uv=1.5, collide=False)
        m.box((0.4, 3.4, 0.4), (x, 0, H), 'T_wood', uv=1.5)
    for y in (-0.8, 0.8):
        m.box((L + 1, 0.35, 0.6), (0, y, H + 0.5), 'T_wood', uv=1.5)
    for k in range(int(L / 0.6)):
        m.box((0.22, 3.0, 0.15), (-L / 2 + k * 0.6, 0, H + 0.88), 'T_wood', uv=1.5, collide=False)
    for y in (-0.72, 0.72):
        m.box((L + 1, 0.08, 0.15), (0, y, H + 1.03), 'M_SteelDark', uv=1.0, collide=False)
    m.col_box((L + 1, 3.0, 0.5), mtx((0, 0, H + 0.85)))
    m.export(OUT)


def rock_arch():
    """Natürlicher Sandsteinbogen."""
    random.seed(4)
    m = new('rock_arch')
    R, n = 17.0, 15
    for k in range(n + 1):
        a = math.pi * k / n
        c = (math.cos(a) * R, 0, math.sin(a) * R * 1.15 + 2.0)
        r = 4.2 + 1.2 * math.cos(a * 2) ** 2
        bm = bm_sphere(1.0, 2)
        displace(bm, 0.25, 1.4, seed=k + 3)
        m.add(bm, 'T_red_rock', mtx(c, (random.uniform(0, 40), random.uniform(0, 40), 0), (r, r * 1.1, r * 0.8)), 5.0)
        m.col_sphere(c, r * 0.8)
    for sx in (-1, 1):
        bm = bm_sphere(1.0, 3)
        displace(bm, 0.25, 1.2, seed=20 + sx)
        m.add(bm, 'T_red_rock', mtx((sx * R, 0, 1.0), (0, 0, 0), (7, 8, 5)), 5.0)
        m.col_box((11, 12, 7), mtx((sx * R, 0, 1.0)))
    m.export(OUT, angle=50.0)


def hoodoo(name, H, seed):
    random.seed(seed)
    m = new(name)
    z, n = 0.0, 7
    for k in range(n):
        h = H / n
        r = 3.8 - 1.6 * k / n + random.uniform(-0.4, 0.4)
        bm = bm_sphere(1.0, 2)
        displace(bm, 0.2, 1.5, seed=seed * 10 + k)
        m.add(bm, 'T_red_rock', mtx((random.uniform(-0.3, 0.3), random.uniform(-0.3, 0.3), z + h / 2), (0, 0, random.uniform(0, 90)), (r, r, h * 0.7)), 4.0)
        m.col_cyl((0, 0, z + h / 2), r * 0.85, h)
        z += h
    bm = bm_sphere(1.0, 2)
    displace(bm, 0.2, 1.2, seed=seed)
    m.add(bm, 'T_red_rock', mtx((0, 0, z + 1.0), (0, 0, 0), (4.5, 4.0, 1.8)), 4.0)
    m.col_cyl((0, 0, z + 1.0), 4.0, 3.0)
    m.export(OUT, angle=50.0)


def plane_wreck():
    """Abgestürztes Transportflugzeug, Rumpf aufgebrochen – man kann hindurchfliegen."""
    random.seed(8)
    m = new('plane_wreck')
    R, th = 2.4, 0.15
    N = 16
    for (x0, x1, tilt) in ((-14.0, 0.0, 0.0), (1.5, 11.0, 6.0)):
        L = x1 - x0
        mat_tilt = mtx(((x0 + x1) / 2, 0, R + 0.2), (0, tilt, 0))
        tube = bm_tube(R - th, R, L, 28)
        m.add(tube, 'M_Alu', mat_tilt @ mtx((0, 0, 0), (0, 90, 0)), 3.0)
        for k in range(N):
            a = 2 * math.pi * (k + 0.5) / N
            if abs(math.sin(a) + 1) < 0.05:
                continue
            c = mat_tilt @ Vector((0, math.cos(a) * R, math.sin(a) * R))
            tang = (mat_tilt.to_3x3() @ Vector((0, -math.sin(a), math.cos(a))))
            axis = (mat_tilt.to_3x3() @ Vector((1, 0, 0)))
            m.col_box((2 * math.pi * R / N, th + 0.3, L), axes_matrix(c, tang, axis))
    m.add(bm_cyl(R, 3.0, 28, r2=0.6), 'M_Alu', mtx((-15.5, 0, R + 0.2), (0, -90, 0)), 3.0)
    m.col_box((3, 4, 4), mtx((-15.5, 0, R + 0.2)))
    m.box((3.0, 0.3, 4.5), (10.0, 0, R + 4.0), 'M_Alu', rot=(0, -20, 0), uv=3.0)
    m.box((5.0, 9.0, 0.25), (-3.0, 7.0, 3.6), 'M_Alu', rot=(-8, 0, 4), uv=3.0)
    m.box((5.0, 7.0, 0.25), (-2.0, -9.0, 0.8), 'M_Alu', rot=(14, 0, -10), uv=3.0)
    for y in (6.0, -6.0):
        m.cyl(0.9, 3.0, (-2.5, y, 2.8 if y > 0 else 1.0), 'M_SteelDark', rot=(0, 90, 0), segs=16)
    m.box((3.0, 0.2, 1.0), (-8.0, R - 0.1, R + 1.0), 'M_RedPaint', uv=2.0, collide=False)
    m.export(OUT)


def mine_head():
    """Förderturm aus Holz mit Seilrad + Schuppen."""
    m = new('mine_head')
    H = 16.0
    for sx in (-1, 1):
        for sy in (-1, 1):
            m.beam((sx * 3.0, sy * 3.0, 0), (sx * 1.2, sy * 1.2, H), 0.4, 'T_wood', uv=1.5)
    for z in (4, 8, 12):
        f = z / H
        w = 3.0 - 1.8 * f
        for s in (-1, 1):
            m.box((2 * w, 0.25, 0.3), (0, s * w, z), 'T_wood', uv=1.5)
            m.box((0.25, 2 * w, 0.3), (s * w, 0, z), 'T_wood', uv=1.5)
    m.beam((4.5, 0, 0), (1.2, 0, H - 1), 0.4, 'T_wood', uv=1.5)
    m.add(bm_tube(1.3, 1.6, 0.2, 24), 'T_rust', mtx((0, 0, H + 0.6), (90, 0, 0)), 1.5)
    m.col_cyl((0, 0, H + 0.6), 1.6, 0.4)
    m.box((8.0, 6.0, 4.0), (8.0, 0, 2.0), 'T_wood', uv=1.5)
    m.box((8.6, 6.6, 0.2), (8.0, 0, 4.4), 'T_rust', rot=(0, 6, 0), uv=2.0)
    m.export(OUT)


def cactus():
    m = new('cactus')
    m.add(bm_cyl(0.35, 6.0, 14, r2=0.3), 'M_Cactus', mtx((0, 0, 3.0)), 1.0)
    m.add(bm_sphere(0.3, 1), 'M_Cactus', mtx((0, 0, 6.0)), 1.0)
    for (sx, h, z) in ((1, 2.4, 2.6), (-1, 1.8, 3.4)):
        m.beam((0, 0, z), (sx * 1.0, 0, z), 0.42, 'M_Cactus', uv=1.0, collide=False)
        m.add(bm_cyl(0.28, h, 12), 'M_Cactus', mtx((sx * 1.0, 0, z + h / 2)), 1.0)
    m.col_cyl((0, 0, 3.0), 0.5, 6.0)
    m.export(OUT)


# ============================================================================ WINTER
def lift_tower():
    """Seilbahnstütze 20 m mit Querträger; meta.cables = Seilaufhängepunkte."""
    m = new('lift_tower')
    H = 20.0
    m.cyl(0.55, H, (0, 0, H / 2), 'T_metal_paint', segs=16, r2=0.4)
    m.box((10.0, 1.0, 1.0), (0, 0, H), 'T_metal_paint', uv=2.0)
    for sx in (-1, 1):
        m.box((2.4, 0.6, 0.5), (sx * 4.5, 0, H - 0.6), 'M_SteelDark', uv=1.0)
        for k in range(3):
            m.cyl(0.25, 0.2, (sx * 4.5 - 0.8 + k * 0.8, 0, H - 0.95), 'M_SteelDark', rot=(90, 0, 0), segs=10, collide=False)
    for z in range(2, int(H), 1):
        m.box((0.5, 0.06, 0.06), (0, -0.6, z), 'M_Galv', collide=False)
    m.box((2.5, 2.5, 0.8), (0, 0, 0.4), 'T_concrete', uv=2.0)
    m.meta = {'cables': [b2t((-4.5, 0, H - 1.1)), b2t((4.5, 0, H - 1.1))]}
    m.export(OUT)


def lift_station():
    """Offene Seilbahnstation – man fliegt durch die Halle am Bullwheel vorbei."""
    m = new('lift_station')
    W, L, H = 14.0, 22.0, 9.0
    for sx in (-1, 1):
        for y in (-L / 2, -L / 6, L / 6, L / 2):
            m.box((0.5, 0.5, H), (sx * W / 2, y, H / 2), 'T_metal_paint', uv=2.0)
    m.box((W + 2, L + 2, 0.5), (0, 0, H + 0.25), 'T_metal_sheet' if False else 'M_SteelDark', uv=3.0)
    m.box((W + 2.2, L + 2.2, 0.35), (0, 0, H + 0.65), 'T_snow', uv=3.0)
    m.box((W, L, 0.4), (0, 0, 0.2), 'T_concrete', uv=3.0)
    m.add(bm_tube(4.0, 4.6, 0.6, 40), 'M_SteelDark', mtx((0, -L / 2 + 5, 6.5)), 2.0)
    m.col_cyl((0, -L / 2 + 5, 6.5), 4.6, 0.6)
    m.box((0.8, 0.8, 6.0), (0, -L / 2 + 5, 3.5), 'M_SteelDark', uv=1.0)
    m.box((W * 0.6, 4.0, 3.0), (0, L / 2 - 2.5, 1.7), 'M_GlassDirty', uv=1.0)
    m.meta = {'cables': [b2t((-4.0, L / 2, 6.4)), b2t((4.0, L / 2, 6.4))]}
    m.export(OUT)


def gondola():
    m = new('gondola')
    m.box((2.2, 2.0, 2.2), (0, 0, -3.4), 'M_RedPaint', bevel=0.25, uv=2.0)
    m.box((2.25, 2.05, 0.8), (0, 0, -3.1), 'M_GlassDirty', uv=2.0, collide=False)
    m.beam((0, 0, -2.3), (0, 0, 0), 0.12, 'M_SteelDark', uv=1.0, collide=False)
    m.box((1.0, 0.3, 0.3), (0, 0, 0), 'M_SteelDark', uv=1.0, collide=False)
    m.export(OUT)


def ski_jump():
    """Skisprungschanze: Anlaufbahn auf Fachwerk – darunter durchfliegen."""
    m = new('ski_jump')
    L, H = 90.0, 38.0
    ang = math.atan2(H - 4.0, L)
    p0, p1 = Vector((-L / 2, 0, H)), Vector((L / 2, 0, 4.0))
    d = p1 - p0
    m.col_box((d.length, 4.0, 0.6), axes_matrix((p0 + p1) / 2, (0, 1, 0), d))
    deck = bm_box(d.length, 4.0, 0.5)
    m.add(deck, 'T_snow', axes_matrix((p0 + p1) / 2, (0, 1, 0), d) @ mtx((0, 0, 0), (0, 90, 0)), 3.0)
    for k in range(10):
        p = p0 + d * (k / 9)
        for sy in (-1.6, 1.6):
            m.box((0.5, 0.5, p.z - 0.3), (p.x, sy, (p.z - 0.3) / 2), 'T_metal_paint', uv=2.0)
        if k < 9:
            q = p0 + d * ((k + 1) / 9)
            for sy in (-1.6, 1.6):
                m.beam((p.x, sy, 0.5), (q.x, sy, q.z - 0.5), 0.2, 'T_metal_paint', uv=2.0, collide=False)
        m.box((0.3, 3.8, 0.3), (p.x, 0, p.z * 0.5), 'T_metal_paint', uv=2.0)
    for sy in (-2.1, 2.1):
        m.beam(p0 + Vector((0, sy, 0.9)), p1 + Vector((0, sy, 0.9)), 0.08, 'M_Galv', collide=False)
    m.box((6.0, 6.0, 4.0), (-L / 2 - 2, 0, H + 2.0), 'T_wood', uv=1.5)
    m.box((7.0, 7.0, 0.4), (-L / 2 - 2, 0, H + 4.2), 'T_snow', uv=2.0)
    m.box((6.0, 4.4, 1.2), (L / 2 + 3, 0, 3.4), 'T_snow', rot=(0, -8, 0), uv=2.0)
    m.export(OUT)


def radio_mast():
    """Abgespannter Funkmast 60 m mit Antennenschüsseln."""
    m = new('radio_mast')
    H, r = 60.0, 1.0
    pts = [(math.cos(a) * r, math.sin(a) * r) for a in (0, 2.094, 4.189)]
    for (x, y) in pts:
        m.beam((x, y, 0), (x, y, H), 0.12, 'M_RedPaint' if False else 'T_metal_paint', uv=2.0, collide=False)
    for z in range(0, int(H), 3):
        for i in range(3):
            a, b = pts[i], pts[(i + 1) % 3]
            m.beam((a[0], a[1], z), (b[0], b[1], z + 3), 0.05, 'M_Galv', uv=1.0, collide=False)
    for k in range(4):
        z = H * (0.25 + 0.15 * k)
        m.col_cyl((0, 0, z), r + 0.2, H * 0.15)
    m.col_cyl((0, 0, H * 0.12), r + 0.2, H * 0.24)
    for (z, a) in ((32, 0), (40, 120), (46, 240)):
        c = (math.cos(math.radians(a)) * 1.8, math.sin(math.radians(a)) * 1.8, z)
        m.add(bm_cyl(1.3, 0.6, 24, r2=0.3), 'M_Galv', mtx(c, (0, 90, a)), 1.0)
    for frac in (0.4, 0.75):
        for i in range(3):
            a = 2.094 * i
            m.beam((math.cos(a) * 1.0, math.sin(a) * 1.0, H * frac), (math.cos(a) * 28, math.sin(a) * 28, 0.2), 0.03, 'M_SteelDark', uv=1.0, collide=False)
    for i in range(3):
        a = 2.094 * i
        m.box((1.2, 1.2, 0.6), (math.cos(a) * 28, math.sin(a) * 28, 0.3), 'T_concrete', uv=2.0)
    m.box((4.0, 3.0, 2.6), (4.0, 0, 1.3), 'T_concrete', uv=2.0)
    m.export(OUT)


def chalet():
    m = new('chalet')
    W, D, H = 10.0, 8.0, 3.2
    m.box((W + 0.6, D + 0.6, 1.2), (0, 0, 0.6), 'T_mossy_stone', uv=2.0)
    for sy in (-1, 1):
        for x0, x1 in ((-W / 2, -1.6), (1.6, W / 2)):
            m.box((x1 - x0, 0.3, H), ((x0 + x1) / 2, sy * D / 2, 1.2 + H / 2), 'T_wood', uv=1.5)
        m.box((3.2, 0.3, 0.9), (0, sy * D / 2, 1.2 + H - 0.45), 'T_wood', uv=1.5)
        m.box((3.2, 0.3, 0.9), (0, sy * D / 2, 1.65), 'T_wood', uv=1.5)
    for sx in (-1, 1):
        m.box((0.3, D, H), (sx * W / 2, 0, 1.2 + H / 2), 'T_wood', uv=1.5)
        g = bm_prism([(-D / 2 - 0.2, 0), (D / 2 + 0.2, 0), (0, 3.2)], 0.3)
        m.add(g, 'T_wood', mtx((sx * W / 2, 0, 1.2 + H), (90, 0, 90)), 1.5)
    ang = math.degrees(math.atan2(3.2, D / 2))
    rl = math.hypot(3.2, D / 2) + 1.0
    for sy in (-1, 1):
        m.box((W + 2.0, rl, 0.25), (0, sy * D / 4 * 1.1, 1.2 + H + 1.65), 'T_wood', rot=(-sy * ang, 0, 0), uv=1.5)
        m.box((W + 2.1, rl, 0.35), (0, sy * D / 4 * 1.1, 1.2 + H + 1.95), 'T_snow', rot=(-sy * ang, 0, 0), uv=2.0)
    m.box((W, 2.0, 0.2), (0, D / 2 + 1.0, 1.2 + H * 0.5), 'T_wood', uv=1.5)
    m.box((0.7, 0.7, 2.0), (2.5, -1.5, 1.2 + H + 3.0), 'T_mossy_stone', uv=1.5)
    m.export(OUT)


def snow_pine(name, H, seed):
    random.seed(seed)
    m = new(name)
    rb = H * 0.016
    m.add(bm_cyl(rb, H * 0.97, 10, r2=rb * 0.15), 'T_bark', mtx((0, 0, H * 0.485)), 1.5)
    tiers, z0, rmax = 8, H * 0.15, H * 0.2
    for k in range(tiers):
        f = k / (tiers - 1)
        z = z0 + (H * 0.85 - z0) * f
        r = rmax * (1 - f * 0.85) * random.uniform(0.9, 1.1)
        h = (H - z0) / tiers * 2.0
        cone = bm_cyl(r, h, 12, r2=0.05)
        displace(cone, r * 0.12, 0.8, seed=seed * 10 + k, octaves=2)
        m.add(cone, 'T_needles', mtx((0, 0, z + h / 2)), 1.5)
        cap = bm_cyl(r * 0.92, h * 0.35, 12, r2=r * 0.35)
        displace(cap, r * 0.08, 0.8, seed=seed * 20 + k, octaves=2)
        m.add(cap, 'T_snow', mtx((0, 0, z + h * 0.62)), 1.5)
    m.col_cyl((0, 0, H * 0.25), rb * 1.2, H * 0.5)
    m.col_cyl((0, 0, z0 + (H * 0.5 - z0) / 2), rmax * 0.55, H * 0.5 - z0)
    m.col_cyl((0, 0, H * 0.72), rmax * 0.3, H * 0.4)
    m.export(OUT, angle=70.0)


# ============================================================================ FABRIK (Zusatz)
def lattice(m, p0, p1, w, mat, every=2.0, chord=0.18, brace=0.08, collide=True):
    """Quadratischer Gitterträger von p0 nach p1 (Breite w)."""
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    L = d.length
    z = d.normalized()
    x = Vector((0, 0, 1)).cross(z) if abs(z.z) < 0.9 else Vector((1, 0, 0))
    x.normalize()
    y = z.cross(x)
    cs = [(-1, -1), (1, -1), (1, 1), (-1, 1)]
    for (a, b) in cs:
        o = x * a * w / 2 + y * b * w / 2
        m.beam(p0 + o, p1 + o, chord, mat, uv=2.0, collide=False)
    n = max(1, int(L / every))
    for k in range(n):
        q0, q1 = p0 + d * (k / n), p0 + d * ((k + 1) / n)
        for i in range(4):
            a, b = cs[i], cs[(i + 1) % 4]
            oa, ob = x * a[0] * w / 2 + y * a[1] * w / 2, x * b[0] * w / 2 + y * b[1] * w / 2
            m.beam(q0 + oa, q1 + ob, brace, mat, uv=2.0, collide=False)
    if collide:
        m.col_box((w + chord, w + chord, L), axes_matrix((p0 + p1) / 2, x, d))


def tower_crane():
    """Turmdrehkran: 42 m Gittermast, 50 m Ausleger – zwischen den Streben hindurchfliegen."""
    m = new('tower_crane')
    material('M_CraneYellow', '#d9a400', 0.5, 0.3)
    H = 42.0
    m.box((6, 6, 1.2), (0, 0, 0.6), 'T_concrete', uv=3.0)
    lattice(m, (0, 0, 1.2), (0, 0, H), 2.0, 'M_CraneYellow')
    m.box((2.6, 2.6, 0.6), (0, 0, H + 0.3), 'M_CraneYellow', uv=2.0)
    m.box((2.2, 2.6, 2.4), (1.6, 0, H + 1.8), 'M_CraneYellow', uv=2.0)
    m.box((0.05, 2.0, 1.2), (2.72, 0, H + 2.0), 'M_GlassDirty', collide=False)
    lattice(m, (0, 0, H + 0.6), (0, 0, H + 8), 1.2, 'M_CraneYellow', every=1.8)
    lattice(m, (1.0, 0, H + 1.2), (50, 0, H + 1.2), 1.4, 'M_CraneYellow', every=2.2, chord=0.14, brace=0.06)
    lattice(m, (-1.0, 0, H + 1.2), (-14, 0, H + 1.2), 1.4, 'M_CraneYellow', every=2.2, chord=0.14, brace=0.06)
    for k in range(4):
        m.box((1.0, 2.2, 1.6), (-10.5 - k * 1.05, 0, H + 0.0), 'T_concrete', uv=2.0)
    for (x, z) in ((30, H + 1.9), (-12, H + 1.9)):
        m.beam((0, 0, H + 8), (x, 0, z), 0.05, 'M_SteelDark', collide=False)
    hx = 26.0
    m.box((1.2, 1.6, 0.6), (hx, 0, H + 0.3), 'M_SteelDark', uv=1.0)
    m.cyl(0.03, 16.0, (hx, 0, H - 8.0), 'M_SteelDark', segs=6, collide=False)
    m.box((0.8, 0.6, 1.0), (hx, 0, H - 16.5), 'M_CraneYellow', uv=1.0)
    m.export(OUT)


def chimney_tall():
    m = new('chimney_tall')
    material('T_brick', '#ffffff', 0.85)
    H = 78.0
    m.add(bm_cyl(4.2, H, 44, r2=2.4), 'T_brick', mtx((0, 0, H / 2)), 2.0)
    for z in (8, 20, 34, 48, 62, 74):
        r = 4.2 + (2.4 - 4.2) * (z / H) + 0.1
        m.add(bm_cyl(r, 0.8, 44), 'T_concrete', mtx((0, 0, z)), 2.0)
    m.add(bm_tube(2.0, 2.6, 1.4, 40), 'T_concrete', mtx((0, 0, H + 0.6)), 2.0)
    m.box((10, 10, 3.0), (0, 0, 1.5), 'T_brick', uv=2.0)
    for z0 in range(0, int(H), 13):
        r = 4.2 + (2.4 - 4.2) * ((z0 + 6.5) / H)
        m.col_cyl((0, 0, z0 + 6.5), r + 0.1, 13)
    m.export(OUT)


def roof_shed(name, seed):
    """Wellblech-Unterstand auf rostigen Stützen, teils eingesackt und löchrig."""
    random.seed(seed)
    m = new(name)
    material('T_metal_sheet', '#ffffff', 0.55, 0.3)
    L, W, H = 14.0, 8.0, 5.0
    for x in (-L / 2, 0, L / 2):
        for y in (-W / 2, W / 2):
            h = H + (0.8 if y > 0 else 0)
            m.box((0.25, 0.25, h), (x, y, h / 2), 'T_rust', uv=2.0)
    ang = math.degrees(math.atan2(0.8, W))
    for i in range(7):
        x = -L / 2 + 1 + i * 2.0
        if random.random() < 0.25:
            continue
        sag = random.random() < 0.2
        m.box((2.05, W + 0.6, 0.05), (x, 0, H + 0.45 - (0.9 if sag else 0)), 'T_metal_sheet', rot=(ang + (14 if sag else 0) * random.choice((-1, 1)), 0, random.uniform(-2, 2)), uv=2.0)
    for y in (-W / 2, W / 2):
        m.box((L, 0.2, 0.25), (0, y, H + (0.8 if y > 0 else 0)), 'T_rust', uv=2.0)
    if random.random() < 0.7:
        m.box((2.0, 6.0, 0.05), (random.uniform(-4, 4), random.uniform(-1, 1), 1.6), 'T_metal_sheet', rot=(35, 0, random.uniform(-30, 30)), uv=2.0)
    m.export(OUT)


def scrap_pile():
    random.seed(77)
    m = new('scrap_pile')
    material('T_metal_sheet', '#ffffff', 0.55, 0.3)
    for k in range(18):
        mat = random.choice(('T_metal_sheet', 'T_wood', 'T_rust'))
        sx, sy = random.uniform(1.0, 3.0), random.uniform(0.3, 1.2)
        m.box((sx, sy, random.uniform(0.04, 0.25)), (random.uniform(-2.5, 2.5), random.uniform(-2.5, 2.5), random.uniform(0.1, 1.4)),
              mat, rot=(random.uniform(-40, 40), random.uniform(-40, 40), random.uniform(0, 180)), uv=2.0, collide=False)
    for k in range(4):
        m.cyl(0.29, 0.88, (random.uniform(-2, 2), random.uniform(-2, 2), 0.3), 'T_rust', rot=(90, 0, random.uniform(0, 180)), segs=14, collide=False)
    m.col_box((5.5, 5.5, 1.4), mtx((0, 0, 0.7)))
    m.export(OUT)


def main():
    ensure_dir(OUT)
    jobs = {
        'temple_pyramid': temple_pyramid,
        'ruin_wall': lambda: corbel_wall('ruin_wall', 14.0, 7.0, 1, True, 5),
        'ruin_gate': lambda: corbel_wall('ruin_gate', 20.0, 10.0, 2, False, 6),
        'stelae': stelae,
        'jungle_tree_a': lambda: jungle_tree('jungle_tree_a', 30.0, 11),
        'jungle_tree_b': lambda: jungle_tree('jungle_tree_b', 22.0, 12),
        'palm_a': lambda: palm('palm_a', 11.0, 21),
        'palm_b': lambda: palm('palm_b', 14.0, 22),
        'fern': fern,
        'rope_bridge': rope_bridge,
        'trestle': trestle,
        'rock_arch': rock_arch,
        'hoodoo_a': lambda: hoodoo('hoodoo_a', 22.0, 31),
        'hoodoo_b': lambda: hoodoo('hoodoo_b', 15.0, 32),
        'plane_wreck': plane_wreck,
        'mine_head': mine_head,
        'cactus': cactus,
        'lift_tower': lift_tower,
        'lift_station': lift_station,
        'gondola': gondola,
        'ski_jump': ski_jump,
        'radio_mast': radio_mast,
        'chalet': chalet,
        'snow_pine_a': lambda: snow_pine('snow_pine_a', 16.0, 41),
        'snow_pine_b': lambda: snow_pine('snow_pine_b', 22.0, 42),
        'tower_crane': tower_crane,
        'chimney_tall': chimney_tall,
        'roof_shed_a': lambda: roof_shed('roof_shed_a', 1),
        'roof_shed_b': lambda: roof_shed('roof_shed_b', 2),
        'scrap_pile': scrap_pile,
    }
    only = os.environ.get('SKYFPV_ONLY', '')
    for name, fn in jobs.items():
        if only and name not in only.split(','):
            continue
        fn()
    print('[SkyFPV] Biom-Modelle fertig')


main()
