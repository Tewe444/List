# -----------------------------------------------------------------------------
# Sky FPV - Drohnen-Einzelteile (Frames, Motoren, Props, Stacks, Kameras, Akkus,
# Actioncams, Werkbank).  Jede Komponente wird als eigene GLB exportiert, dazu
# assets/data/frames.json mit den Montagepunkten.
# Aufruf: blender -b --factory-startup -P make_drone_parts.py
# -----------------------------------------------------------------------------
import os
import sys
import math
import json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bmesh
from mathutils import Vector, Matrix
from _common import (reset, material, Model, mtx, bm_box, bm_cyl, bm_tube, bm_prism, bm_uvsphere,
                     bm_beam, rounded_rect, b2t, ensure_dir, MODELS, DATA)

OUT = os.path.join(MODELS, 'drone')


def base_materials():
    material('T_carbon', '#ffffff', 0.3, 0.0)
    material('T_tpu', '#ffffff', 0.7)
    material('M_Standoff', '#7a2bd1', 0.3, 1.0)
    material('M_Bolt', '#2a2a2e', 0.35, 1.0)
    material('M_Steel', '#c8c8cc', 0.25, 1.0)
    material('M_Copper', '#b8692e', 0.35, 1.0)
    material('M_MotorDark', '#101012', 0.45, 0.6)
    material('M_MotorBase', '#1c1c20', 0.4, 0.8)
    material('M_PCB', '#141416', 0.35, 0.0)
    material('M_Chip', '#0a0a0b', 0.45, 0.0)
    material('M_Gold', '#d9a93a', 0.25, 1.0)
    material('M_Connector', '#e6e0cc', 0.55, 0.0)
    material('M_Cap', '#1d2340', 0.4, 0.2)
    material('M_Rubber', '#141414', 0.85, 0.0)
    material('M_WireRed', '#c41a1a', 0.5, 0.0)
    material('M_WireBlack', '#121212', 0.5, 0.0)
    material('M_XT60', '#e3bd1a', 0.45, 0.0)
    material('M_CamBody', '#1a1a1c', 0.5, 0.1)
    material('M_Glass', '#0b1420', 0.04, 0.6)
    material('M_Shield', '#b9bcc0', 0.3, 1.0)
    material('M_Alu', '#9a9ea4', 0.35, 1.0)
    material('M_LED_Blue', '#3a6bff', 0.3, 0.0, emit='#3a6bff', emit_strength=4.0)
    material('M_LED_Red', '#ff2a2a', 0.3, 0.0, emit='#ff2a2a', emit_strength=4.0)
    material('M_Label', '#ececec', 0.55, 0.0)
    material('M_Strap', '#161616', 0.8, 0.0)
    material('M_Ribbon', '#b07a2a', 0.5, 0.0)
    material('M_GPS', '#202022', 0.5, 0.0)
    material('M_Duct', '#18181a', 0.6, 0.0)


def prism_at(model, pts, th, z, mat, uv=0.05):
    bm = bm_prism(pts, th)
    model.add(bm, mat, mtx((0, 0, z)), uv)


def arm(model, p_from, p_to, width, th, zc, mat, uv=0.06):
    bm, m, L = bm_beam((p_from[0], p_from[1], zc), (p_to[0], p_to[1], zc), th, width)
    # bm_beam richtet Z entlang der Strecke aus; Querschnitt: w=th (lokal X), d=width (lokal Y)
    # Damit die Plattendicke vertikal liegt, wird lokal um Z gedreht.
    v = Vector((p_to[0] - p_from[0], p_to[1] - p_from[1], 0)).normalized()
    side = Vector((-v.y, v.x, 0))
    # Eigene Matrix: X = side (Breite), Y = up (Dicke), Z = Richtung
    rot = Matrix((side, Vector((0, 0, 1)), v)).transposed().to_4x4()
    m = Matrix.Translation(((p_from[0] + p_to[0]) / 2, (p_from[1] + p_to[1]) / 2, zc)) @ rot
    bm.free()
    bm = bm_box(width, th, L, 0.0008)
    model.add(bm, mat, m, uv)


# ----------------------------------------------------------------------------- Frames
FRAMES = {}


def frame_generic(fid, d, plate_th, body_w, body_l, arm_w, pad_r, top_w, top_l, top_z, so, cam_y, cam_z,
                  stack, extra=None, prop_max=5.1, mass=110, standoff_color='#7a2bd1'):
    reset()
    base_materials()
    material('M_Standoff_' + fid, standoff_color, 0.3, 1.0)
    m = Model('frame_' + fid)
    # Bodenplatte
    prism_at(m, rounded_rect(body_w, body_l, 0.008), plate_th, plate_th / 2, 'T_carbon')
    motors = [(d, d), (d, -d), (-d, -d), (-d, d)]  # FR, RR, RL, FL
    for (x, y) in motors:
        sx, sy = (1 if x > 0 else -1), (1 if y > 0 else -1)
        start = (sx * body_w * 0.25, sy * body_l * 0.2)
        arm(m, start, (x, y), arm_w, plate_th * 0.92, plate_th / 2, 'T_carbon')
        m.add(bm_cyl(pad_r, plate_th, 32), 'T_carbon', mtx((x, y, plate_th / 2)), 0.06)
        # Motorschrauben-Löcher (dunkle Einsätze)
        for k in range(4):
            a = math.radians(45 + 90 * k)
            m.add(bm_cyl(0.0012, plate_th * 1.02, 10), 'M_Bolt', mtx((x + math.cos(a) * pad_r * 0.62, y + math.sin(a) * pad_r * 0.62, plate_th / 2)), 0.05)
    # Kamerakäfig-Seitenplatten
    cage_h = top_z - plate_th
    for sx in (-1, 1):
        prism = bm_prism(rounded_rect(0.026, cage_h, 0.004), 0.0025)
        m.add(prism, 'T_carbon', mtx((sx * 0.01085, cam_y, plate_th + cage_h / 2), (90, 0, 90)), 0.05)
    # Topplatte
    prism_at(m, rounded_rect(top_w, top_l, 0.007), 0.0022, top_z + 0.0011, 'T_carbon')
    # Abstandsbolzen
    for (x, y) in so:
        m.add(bm_cyl(0.0026, cage_h, 16), 'M_Standoff_' + fid, mtx((x, y, plate_th + cage_h / 2)), 0.05)
        m.add(bm_cyl(0.0028, 0.0016, 6), 'M_Bolt', mtx((x, y, top_z + 0.0022 + 0.0008)), 0.05)
        m.add(bm_cyl(0.0028, 0.0016, 6), 'M_Bolt', mtx((x, y, -0.0008)), 0.05)
    # Antennenhalter hinten (TPU)
    m.add(bm_box(0.016, 0.012, 0.012, 0.002), 'T_tpu', mtx((0, -top_l / 2 + 0.004, top_z + 0.0082)), 0.03)
    if extra:
        extra(m)
    m.meta = {}
    m.export(OUT)
    z_top = top_z + 0.0022
    FRAMES[fid] = {
        'motors': [b2t((x, y, plate_th)) for (x, y) in motors],
        'spin': [1, -1, 1, -1],
        'stack': b2t((0, stack[0], plate_th + 0.0005)),
        'stackSize': stack[1],
        'camera': b2t((0, cam_y, cam_z)),
        'battery': b2t((0, -0.012 * (top_l / 0.118), z_top)),
        'actioncam': b2t((0, top_l / 2 - 0.022, z_top)),
        'vtx': b2t((0, stack[0], stack[2])),
        'propMax': prop_max,
        'mass': mass,
        'armLength': round(math.hypot(d, d), 4),
        'topZ': round(z_top, 4),
    }


def cinewhoop_extra(d):
    def f(m):
        for (x, y) in [(d, d), (d, -d), (-d, -d), (-d, d)]:
            m.add(bm_tube(0.0405, 0.0428, 0.027, 64), 'M_Duct', mtx((x, y, 0.0085)), 0.05)
            m.add(bm_tube(0.0405, 0.047, 0.0022, 64), 'M_Duct', mtx((x, y, -0.0038)), 0.05)
            m.add(bm_tube(0.0428, 0.0445, 0.004, 64), 'M_Duct', mtx((x, y, 0.0205)), 0.05)
            # Speichen vom Motor zum Duct
            for k in range(3):
                a = math.atan2(y, x) + math.radians(60 + 120 * k)
                p0 = (x + math.cos(a) * 0.008, y + math.sin(a) * 0.008)
                p1 = (x + math.cos(a) * 0.041, y + math.sin(a) * 0.041)
                arm(m, p0, p1, 0.004, 0.0024, 0.0012, 'M_Duct')
        # Verbindungsstege zwischen den Ducts
        pts = [(d, d), (d, -d), (-d, -d), (-d, d)]
        for i in range(4):
            a, b = pts[i], pts[(i + 1) % 4]
            mid = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
            out = Vector((mid[0], mid[1])).normalized() * 0.006
            p0 = (a[0] * 0.55 + b[0] * 0.45 + out.x, a[1] * 0.55 + b[1] * 0.45 + out.y)
            p1 = (a[0] * 0.45 + b[0] * 0.55 + out.x, a[1] * 0.45 + b[1] * 0.55 + out.y)
            arm(m, p0, p1, 0.006, 0.006, 0.006, 'M_Duct')
    return f


def lr_extra(m):
    # GPS-Mast hinten
    m.add(bm_box(0.008, 0.008, 0.03, 0.001), 'T_tpu', mtx((0, -0.072, 0.052)), 0.03)
    m.add(bm_cyl(0.013, 0.008, 32), 'M_GPS', mtx((0, -0.072, 0.071)), 0.05)
    m.add(bm_cyl(0.011, 0.001, 32), 'M_Label', mtx((0, -0.072, 0.0755)), 0.05)


def build_frames():
    frame_generic('falke5', 0.0795, 0.005, 0.044, 0.115, 0.017, 0.0135, 0.040, 0.118, 0.034,
                  [(0.0155, 0.040), (-0.0155, 0.040), (0.0155, -0.040), (-0.0155, -0.040)],
                  0.047, 0.0195, (-0.004, '30', 0.0245), None, 5.1, 112, '#7a2bd1')
    frame_generic('spatz3', 0.0502, 0.0025, 0.034, 0.072, 0.013, 0.010, 0.032, 0.072, 0.026,
                  [(0.012, 0.026), (-0.012, 0.026), (0.012, -0.026), (-0.012, -0.026)],
                  0.03, 0.0135, (0.0, '20', 0.012), cinewhoop_extra(0.0502), 3.0, 128, '#d12b2b')
    frame_generic('albatros7', 0.1114, 0.0055, 0.05, 0.14, 0.019, 0.016, 0.048, 0.15, 0.036,
                  [(0.018, 0.05), (-0.018, 0.05), (0.018, -0.05), (-0.018, -0.05)],
                  0.06, 0.021, (-0.005, '30', 0.0265), lr_extra, 7.0, 165, '#2b6bd1')
    frame_generic('kranich4', 0.0636, 0.003, 0.036, 0.09, 0.012, 0.0115, 0.034, 0.094, 0.028,
                  [(0.0125, 0.032), (-0.0125, 0.032), (0.0125, -0.032), (-0.0125, -0.032)],
                  0.038, 0.0155, (0.0, '20', 0.016), None, 4.0, 68, '#2fbf71')
    frame_generic('adler6', 0.0919, 0.0055, 0.046, 0.128, 0.018, 0.015, 0.044, 0.134, 0.035,
                  [(0.017, 0.045), (-0.017, 0.045), (0.017, -0.045), (-0.017, -0.045)],
                  0.054, 0.0205, (-0.004, '30', 0.0255), None, 6.0, 135, '#ff8c1a')


# ----------------------------------------------------------------------------- Motoren
MOTORS = {}


def build_motor(mid, bell_d, bell_h, base_h, shaft_r, shaft_h, color, mount_w):
    reset()
    base_materials()
    belm = 'M_Bell_' + mid
    material(belm, color, 0.28, 0.85)
    m = Model('motor_' + mid)
    R = bell_d / 2
    # Basis mit Kreuzfuß
    m.add(bm_cyl(R * 0.82, base_h, 40), 'M_MotorBase', mtx((0, 0, base_h / 2)), 0.05)
    for a in (45, 135):
        m.add(bm_box(mount_w * 1.25, R * 0.5, base_h * 0.7, 0.0008), 'M_MotorBase', mtx((0, 0, base_h * 0.35), (0, 0, a)), 0.05)
    # Statorspalt (Kupfer)
    m.add(bm_cyl(R * 0.93, 0.0016, 40), 'M_Copper', mtx((0, 0, base_h + 0.0008)), 0.05)
    z0 = base_h + 0.0016
    # Glocke
    m.add(bm_cyl(R, bell_h * 0.82, 48), belm, mtx((0, 0, z0 + bell_h * 0.41)), 0.05)
    m.add(bm_cyl(R, bell_h * 0.18, 48, r2=R * 0.86), belm, mtx((0, 0, z0 + bell_h * 0.82 + bell_h * 0.09)), 0.05)
    top = z0 + bell_h
    # Kühlfenster auf der Glocke
    for k in range(5):
        a = 2 * math.pi * k / 5
        m.add(bm_box(R * 0.42, R * 0.2, 0.0005, 0.0003), 'M_MotorDark',
              mtx((math.cos(a) * R * 0.5, math.sin(a) * R * 0.5, top + 0.00005), (0, 0, math.degrees(a))), 0.05)
    # Magnetring sichtbar unten
    m.add(bm_tube(R * 0.86, R * 0.995, 0.0012, 48), 'M_MotorDark', mtx((0, 0, z0 + 0.0006)), 0.05)
    # Welle
    m.add(bm_cyl(shaft_r, shaft_h, 16), 'M_Steel', mtx((0, 0, top + shaft_h / 2)), 0.05)
    # Motorkabel (Richtung -X => zeigt zur Frame-Mitte)
    for k, mat in enumerate(('M_WireBlack', 'M_WireBlack', 'M_WireBlack')):
        y = (k - 1) * 0.0022
        bm, mm, L = bm_beam((-R * 0.6, y, base_h * 0.5), (-R * 0.6 - 0.035, y, base_h * 0.4), 0.0011)
        m.add(bm, mat, mm, 0.05)
    m.export(OUT)
    MOTORS[mid] = {'propZ': round(top, 5), 'bellR': round(R, 5)}


def build_motors():
    build_motor('1404', 0.0185, 0.0085, 0.003, 0.00075, 0.005, '#c9cbd0', 0.016)
    build_motor('2207', 0.0275, 0.0125, 0.004, 0.0025, 0.010, '#7a2bd1', 0.025)
    build_motor('2306', 0.0285, 0.0115, 0.004, 0.0025, 0.010, '#d12b2b', 0.025)
    build_motor('2806', 0.0335, 0.0145, 0.0045, 0.0025, 0.011, '#2b6bd1', 0.03)
    build_motor('1804', 0.0225, 0.008, 0.0035, 0.0015, 0.007, '#2fbf71', 0.019)
    build_motor('2208', 0.0275, 0.0135, 0.004, 0.0025, 0.010, '#ff8c1a', 0.025)
    build_motor('2507', 0.031, 0.0125, 0.0045, 0.0025, 0.011, '#c0c0c8', 0.03)


# ----------------------------------------------------------------------------- Propeller
def naca(t, n=7):
    """Dünnes Profil: Liste (x 0..1 von Vorderkante, z) oben und unten."""
    xs = [0.5 - 0.5 * math.cos(math.pi * i / (n - 1)) for i in range(n)]
    yt = lambda x: 5 * t * (0.2969 * math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1015 * x ** 4)
    camber = lambda x: 0.035 * (1 - (2 * x - 1) ** 2)
    up = [(x, camber(x) + yt(x)) for x in xs]
    lo = [(x, camber(x) - yt(x) * 0.35) for x in reversed(xs[1:-1])]
    return up + lo


def blade_bm(R, r0, cmax, pitch, z):
    bm = bmesh.new()
    st = 16
    rings = []
    for i in range(st):
        s = i / (st - 1)
        r = r0 + (R - r0) * s
        c = cmax * (0.62 + 1.5 * s * (1 - s))
        if s > 0.78:
            c *= max(0.18, math.sqrt(max(0.0, 1 - ((s - 0.78) / 0.22) ** 2)))
        t = 0.13 - 0.08 * s
        beta = min(math.radians(38), math.atan(pitch / (2 * math.pi * max(r, 1e-3))))
        sweep = -0.25 * cmax * s * s
        prof = naca(t)
        ring = []
        for (xc, zc) in prof:
            ly = (0.5 - xc) * c + sweep   # Vorderkante bei +Y
            lz = zc * c
            # Verwindung um die radiale Achse (X)
            y2 = ly * math.cos(beta) - lz * math.sin(beta)
            z2 = ly * math.sin(beta) + lz * math.cos(beta)
            ring.append(bm.verts.new((r, y2, z + z2)))
        rings.append(ring)
    k = len(rings[0])
    for i in range(st - 1):
        A, B = rings[i], rings[i + 1]
        for j in range(k):
            j2 = (j + 1) % k
            bm.faces.new((A[j], A[j2], B[j2], B[j]))
    bm.faces.new(list(reversed(rings[0])))
    bm.faces.new(rings[-1])
    bm.normal_update()
    return bm


PROPS = {}


def build_prop(pid, d_in, p_in, blades, color, cmax, hub_r, hub_h):
    reset()
    base_materials()
    pm = 'M_Prop_' + pid
    material(pm, color, 0.32, 0.0)
    material('M_Nut', '#2a2a2e', 0.3, 1.0)
    m = Model('prop_' + pid)
    R = d_in * 0.0254 / 2
    P = p_in * 0.0254
    m.add(bm_cyl(hub_r, hub_h, 32), pm, mtx((0, 0, hub_h / 2)), 0.02)
    for b in range(blades):
        bm = blade_bm(R, hub_r * 0.7, cmax, P, hub_h * 0.5)
        m.add(bm, pm, mtx((0, 0, 0), (0, 0, 360.0 * b / blades)), 0.02)
    # Propmutter
    m.add(bm_cyl(hub_r * 0.72, 0.005, 6), 'M_Nut', mtx((0, 0, hub_h + 0.0025)), 0.02)
    m.add(bm_cyl(hub_r * 0.6, 0.003, 16, r2=hub_r * 0.25), 'M_Nut', mtx((0, 0, hub_h + 0.0065)), 0.02)
    m.export(OUT, angle=40.0)
    PROPS[pid] = {'radius': round(R, 4), 'hubH': hub_h}


def build_props():
    build_prop('3018_3b', 3.0, 1.8, 3, '#2fd4c4', 0.0125, 0.0045, 0.0055)
    build_prop('5136_3b', 5.1, 3.6, 3, '#ff7a1a', 0.0185, 0.0065, 0.0068)
    build_prop('5043_2b', 5.0, 4.3, 2, '#e8e8ec', 0.0175, 0.0065, 0.0068)
    build_prop('7035_2b', 7.0, 3.5, 2, '#ff2d6e', 0.0215, 0.0070, 0.0075)
    build_prop('4024_3b', 4.0, 2.4, 3, '#ffd400', 0.0155, 0.0055, 0.006)
    build_prop('6030_3b', 6.0, 3.0, 3, '#00c2ff', 0.0205, 0.0068, 0.0072)
    build_prop('5145_3b', 5.1, 4.5, 3, '#ff3b30', 0.0195, 0.0065, 0.0068)
    # Unschärfe-Scheibe (Prop dreht), Radius 1, UV radial
    reset()
    material('M_PropDisc', '#ffffff', 0.5)
    m = Model('prop_disc')
    bm = bmesh.new()
    segs = 64
    c = bm.verts.new((0, 0, 0))
    ring = [bm.verts.new((math.cos(2 * math.pi * i / segs), math.sin(2 * math.pi * i / segs), 0)) for i in range(segs)]
    for i in range(segs):
        bm.faces.new((c, ring[i], ring[(i + 1) % segs]))
    uv = bm.loops.layers.uv.verify()
    for f in bm.faces:
        for l in f.loops:
            l[uv].uv = (l.vert.co.x * 0.5 + 0.5, l.vert.co.y * 0.5 + 0.5)
    m.add(bm, 'M_PropDisc', None, uv=1.0, uv_mode=None)
    m.export(OUT)


# ----------------------------------------------------------------------------- Elektronik
def board(m, size, z, th=0.0016, holes=True):
    m.add(bm_prism(rounded_rect(size, size, 0.004), th), 'M_PCB', mtx((0, 0, z + th / 2)), 0.05)
    return z + th


def build_stacks():
    # 30.5 mm Stack (ESC + FC)
    reset()
    base_materials()
    m = Model('stack_30')
    for sx in (-1, 1):
        for sy in (-1, 1):
            m.add(bm_cyl(0.0024, 0.003, 12), 'M_Rubber', mtx((sx * 0.01525, sy * 0.01525, 0.0015)), 0.05)
    z = board(m, 0.036, 0.003)
    for side in (-1, 1):
        for k in range(3):
            for row in (0, 1):
                m.add(bm_box(0.0042, 0.005, 0.0011, 0.0002), 'M_Chip', mtx((side * (0.0105 + row * 0.0055), -0.009 + k * 0.009, z + 0.00055)), 0.05)
    for sx in (-1, 1):
        for sy in (-1, 1):
            m.add(bm_box(0.004, 0.003, 0.0002), 'M_Gold', mtx((sx * 0.0155, sy * 0.008, z + 0.0001)), 0.05)
    m.add(bm_cyl(0.0048, 0.016, 24), 'M_Cap', mtx((0, -0.026, z + 0.005), (0, 90, 0)), 0.05)
    # Akkukabel + XT60
    for sx, mat in ((-0.003, 'M_WireRed'), (0.003, 'M_WireBlack')):
        bm, mm, L = bm_beam((sx, -0.016, z + 0.001), (sx, -0.06, z + 0.012), 0.0034)
        m.add(bm, mat, mm, 0.05)
    m.add(bm_box(0.0158, 0.016, 0.0082, 0.001), 'M_XT60', mtx((0, -0.068, z + 0.014)), 0.05)
    for sx in (-1, 1):
        for sy in (-1, 1):
            m.add(bm_cyl(0.0022, 0.008, 10), 'M_Rubber', mtx((sx * 0.01525, sy * 0.01525, z + 0.004)), 0.05)
    z2 = board(m, 0.036, z + 0.008)
    m.add(bm_box(0.007, 0.007, 0.0011, 0.0003), 'M_Chip', mtx((0, 0.002, z2 + 0.00055), (0, 0, 45)), 0.05)
    m.add(bm_box(0.003, 0.003, 0.0009), 'M_Chip', mtx((0.006, -0.007, z2 + 0.00045)), 0.05)
    for k, (x, y, w, d) in enumerate(((0.013, 0.0, 0.004, 0.012), (-0.013, 0.0, 0.004, 0.012), (0.0, 0.013, 0.012, 0.004), (0.0, -0.013, 0.012, 0.004))):
        m.add(bm_box(w, d, 0.0028, 0.0003), 'M_Connector', mtx((x, y, z2 + 0.0014)), 0.05)
    m.add(bm_box(0.009, 0.0035, 0.0032, 0.0008), 'M_Steel', mtx((0, 0.0165, z2 + 0.0016)), 0.05)
    m.add(bm_box(0.0016, 0.0008, 0.0006), 'M_LED_Blue', mtx((-0.007, 0.008, z2 + 0.0003)), 0.05)
    m.add(bm_box(0.0016, 0.0008, 0.0006), 'M_LED_Red', mtx((-0.004, 0.008, z2 + 0.0003)), 0.05)
    m.export(OUT)

    # 20 mm AIO (Cinewhoop)
    reset()
    base_materials()
    m = Model('stack_20')
    for sx in (-1, 1):
        for sy in (-1, 1):
            m.add(bm_cyl(0.002, 0.0025, 12), 'M_Rubber', mtx((sx * 0.01275, sy * 0.01275, 0.00125)), 0.05)
    z = board(m, 0.031, 0.0025)
    for side in (-1, 1):
        for k in range(4):
            m.add(bm_box(0.003, 0.0035, 0.0009, 0.0002), 'M_Chip', mtx((side * 0.0115, -0.009 + k * 0.006, z + 0.00045)), 0.05)
    m.add(bm_box(0.0055, 0.0055, 0.001, 0.0002), 'M_Chip', mtx((0, 0, z + 0.0005), (0, 0, 45)), 0.05)
    m.add(bm_box(0.008, 0.004, 0.0025, 0.0003), 'M_Connector', mtx((0, 0.011, z + 0.00125)), 0.05)
    m.add(bm_cyl(0.004, 0.012, 20), 'M_Cap', mtx((0, -0.02, z + 0.004), (0, 90, 0)), 0.05)
    for sx, mat in ((-0.0025, 'M_WireRed'), (0.0025, 'M_WireBlack')):
        bm, mm, L = bm_beam((sx, -0.014, z + 0.001), (sx, -0.045, z + 0.008), 0.0024)
        m.add(bm, mat, mm, 0.05)
    m.add(bm_box(0.0102, 0.012, 0.0052, 0.0008), 'M_XT60', mtx((0, -0.05, z + 0.009)), 0.05)
    m.add(bm_box(0.0016, 0.0008, 0.0006), 'M_LED_Blue', mtx((0.006, 0.006, z + 0.0003)), 0.05)
    m.export(OUT)


def antenna_whip(m, p0, p1, cap_color_mat):
    bm, mm, L = bm_beam(p0, p1, 0.0024)
    m.add(bm, 'M_WireBlack', mm, 0.05)
    tip = Vector(p1)
    dirv = (Vector(p1) - Vector(p0)).normalized()
    q = Vector((0, 0, 1)).rotation_difference(dirv)
    mat = Matrix.Translation(tip + dirv * 0.008) @ q.to_matrix().to_4x4()
    m.add(bm_cyl(0.0055, 0.016, 20), cap_color_mat, mat, 0.05)


def build_cameras():
    # Analoge Micro-Kamera 19 mm
    reset()
    base_materials()
    m = Model('cam_analog')
    m.add(bm_box(0.019, 0.017, 0.019, 0.0018), 'M_CamBody', mtx((0, -0.001, 0)), 0.05)
    m.add(bm_cyl(0.0078, 0.004, 32), 'M_CamBody', mtx((0, 0.0095, 0), (90, 0, 0)), 0.05)
    m.add(bm_cyl(0.0064, 0.007, 32), 'M_CamBody', mtx((0, 0.0145, 0), (90, 0, 0)), 0.05)
    g = bm_uvsphere(0.0056, 24, 12)
    m.add(g, 'M_Glass', mtx((0, 0.0178, 0), (0, 0, 0), (1, 0.45, 1)), 0.05)
    for sx in (-1, 1):
        m.add(bm_cyl(0.0014, 0.0012, 12), 'M_Bolt', mtx((sx * 0.0098, -0.001, 0), (0, 90, 0)), 0.05)
    m.export(OUT)

    # Analoge Nano-Kamera 14 mm (mit 19-mm-Adapterplatten)
    reset()
    base_materials()
    material('M_Adapter', '#d12b2b', 0.4, 0.8)
    m = Model('cam_nano')
    m.add(bm_box(0.014, 0.014, 0.014, 0.0014), 'M_CamBody', mtx((0, -0.001, 0)), 0.05)
    m.add(bm_cyl(0.0055, 0.006, 28), 'M_CamBody', mtx((0, 0.009, 0), (90, 0, 0)), 0.05)
    m.add(bm_uvsphere(0.0046, 20, 10), 'M_Glass', mtx((0, 0.0125, 0), (0, 0, 0), (1, 0.45, 1)), 0.05)
    for sx in (-1, 1):
        m.add(bm_box(0.0025, 0.012, 0.012, 0.001), 'M_Adapter', mtx((sx * 0.0083, -0.001, 0)), 0.05)
    m.export(OUT)

    # Digitale HD-Kamera
    reset()
    base_materials()
    m = Model('cam_digital')
    m.add(bm_box(0.019, 0.02, 0.019, 0.0018), 'M_CamBody', mtx((0, -0.003, 0)), 0.05)
    m.add(bm_cyl(0.0088, 0.006, 32), 'M_CamBody', mtx((0, 0.0095, 0), (90, 0, 0)), 0.05)
    m.add(bm_cyl(0.0078, 0.008, 32), 'M_Alu', mtx((0, 0.0158, 0), (90, 0, 0)), 0.05)
    g = bm_uvsphere(0.0068, 24, 12)
    m.add(g, 'M_Glass', mtx((0, 0.0198, 0), (0, 0, 0), (1, 0.4, 1)), 0.05)
    bm, mm, L = bm_beam((0, -0.013, -0.004), (0, -0.03, -0.012), 0.008, 0.0006)
    m.add(bm, 'M_Ribbon', mm, 0.05)
    for sx in (-1, 1):
        m.add(bm_cyl(0.0014, 0.0012, 12), 'M_Bolt', mtx((sx * 0.0098, -0.002, 0), (0, 90, 0)), 0.05)
    m.export(OUT)

    # Analoger VTX + Lollipop-Antenne
    reset()
    base_materials()
    material('M_AntCap', '#1f8fff', 0.5)
    m = Model('vtx_analog')
    m.add(bm_prism(rounded_rect(0.027, 0.027, 0.003), 0.0012), 'M_PCB', mtx((0, 0, 0.0006)), 0.05)
    m.add(bm_box(0.012, 0.012, 0.0022, 0.0003), 'M_Shield', mtx((0, 0.003, 0.0023)), 0.05)
    m.add(bm_box(0.0016, 0.0008, 0.0006), 'M_LED_Red', mtx((0.009, 0.009, 0.0015)), 0.05)
    antenna_whip(m, (0, -0.012, 0.002), (0, -0.064, 0.012), 'M_AntCap')
    bm, mm, L = bm_beam((0, -0.064, 0.012), (0, -0.09, 0.05), 0.0018)
    m.add(bm, 'M_WireBlack', mm, 0.05)
    m.add(bm_uvsphere(0.008, 20, 10), 'M_AntCap', mtx((0, -0.094, 0.057), (0, 0, 0), (1, 1, 0.55)), 0.05)
    m.export(OUT)

    # Digitale Air-Unit mit Kühlkörper und zwei Antennen
    reset()
    base_materials()
    material('M_AntCap', '#e8e8e8', 0.5)
    m = Model('vtx_digital')
    m.add(bm_box(0.03, 0.03, 0.0045, 0.001), 'M_Alu', mtx((0, 0, 0.00225)), 0.05)
    for k in range(7):
        m.add(bm_box(0.0012, 0.026, 0.004, 0.0002), 'M_Alu', mtx((-0.0108 + k * 0.0036, 0, 0.0065)), 0.05)
    m.add(bm_box(0.004, 0.004, 0.003), 'M_Rubber', mtx((0.009, -0.0165, 0.003)), 0.05)
    for sx in (-1, 1):
        bm, mm, L = bm_beam((sx * 0.006, -0.015, 0.003), (sx * 0.02, -0.06, 0.012), 0.0018)
        m.add(bm, 'M_WireBlack', mm, 0.05)
        bm, mm, L = bm_beam((sx * 0.02, -0.06, 0.012), (sx * 0.034, -0.085, 0.05), 0.0032)
        m.add(bm, 'M_AntCap', mm, 0.05)
    m.export(OUT)


# ----------------------------------------------------------------------------- Akkus
BATTS = {}


def build_lipo(bid, w, l, h, color, xt='60'):
    reset()
    base_materials()
    wm = 'M_Wrap_' + bid
    material(wm, color, 0.42, 0.0)
    m = Model('batt_' + bid)
    m.add(bm_box(w, l, h, 0.004, 3), wm, mtx((0, 0, h / 2)), 0.05)
    m.add(bm_box(w * 0.98, l * 0.55, 0.0004, 0.0001), 'M_Label', mtx((0, l * 0.08, h + 0.0002)), 0.05)
    m.add(bm_box(w * 0.3, l * 0.5, 0.0005, 0.0001), 'M_WireBlack', mtx((-w * 0.28, l * 0.06, h + 0.0004)), 0.05)
    # Akkugurt
    sw = 0.02
    m.add(bm_box(w + 0.003, sw, 0.0014, 0.0005), 'M_Strap', mtx((0, -l * 0.08, h + 0.0012)), 0.05)
    for sx in (-1, 1):
        m.add(bm_box(0.0014, sw, h + 0.002, 0.0005), 'M_Strap', mtx((sx * (w / 2 + 0.0012), -l * 0.08, h / 2 + 0.0004)), 0.05)
    m.add(bm_box(w + 0.003, sw, 0.0014, 0.0005), 'M_Strap', mtx((0, -l * 0.08, -0.0007)), 0.05)
    # Kabel & Stecker
    r = 0.0019 if xt == '60' else 0.0014
    for sx, mat in ((-0.0035, 'M_WireRed'), (0.0035, 'M_WireBlack')):
        bm, mm, L = bm_beam((sx, -l / 2 + 0.002, h * 0.75), (sx, -l / 2 - 0.035, h * 0.55), r * 2)
        m.add(bm, mat, mm, 0.05)
    cs = (0.0158, 0.016, 0.0082) if xt == '60' else (0.0102, 0.012, 0.0052)
    m.add(bm_box(cs[0], cs[1], cs[2], 0.001), 'M_XT60', mtx((0, -l / 2 - 0.035 - cs[1] / 2, h * 0.55)), 0.05)
    # Balancer-Kabel
    bm, mm, L = bm_beam((w * 0.3, -l / 2 + 0.002, h * 0.85), (w * 0.3, -l / 2 - 0.02, h * 0.95), 0.006, 0.0012)
    m.add(bm, 'M_Label', mm, 0.05)
    m.add(bm_box(0.012, 0.005, 0.004, 0.0006), 'M_Connector', mtx((w * 0.3, -l / 2 - 0.024, h * 0.97)), 0.05)
    m.export(OUT)
    BATTS[bid] = {'size': [w, h, l]}


def build_liion(bid, color):
    reset()
    base_materials()
    wm = 'M_Wrap_' + bid
    material(wm, color, 0.45, 0.0)
    m = Model('batt_' + bid)
    r, L = 0.0106, 0.071
    for ix in range(3):
        for iz in range(2):
            m.add(bm_cyl(r, L, 32), wm, mtx(((ix - 1) * 2 * r, 0, r + iz * 2 * r), (90, 0, 0)), 0.05)
    m.add(bm_box(6 * r * 0.98, L * 0.5, 0.0004), 'M_Label', mtx((0, 0, 4 * r + 0.0002)), 0.05)
    for yy in (-L * 0.3, L * 0.3):
        m.add(bm_box(6 * r + 0.003, 0.016, 0.0014, 0.0005), 'M_Strap', mtx((0, yy, 4 * r + 0.0012)), 0.05)
    for sx, mat in ((-0.0035, 'M_WireRed'), (0.0035, 'M_WireBlack')):
        bm, mm, LL = bm_beam((sx, -L / 2, 2 * r), (sx, -L / 2 - 0.035, 1.5 * r), 0.0038)
        m.add(bm, mat, mm, 0.05)
    m.add(bm_box(0.0158, 0.016, 0.0082, 0.001), 'M_XT60', mtx((0, -L / 2 - 0.043, 1.5 * r)), 0.05)
    m.export(OUT)
    BATTS[bid] = {'size': [6 * r, 4 * r, L]}


def build_batteries():
    build_lipo('4s650', 0.030, 0.058, 0.027, '#2e6bd6', '30')
    build_lipo('4s1300', 0.035, 0.074, 0.034, '#d63b2e')
    build_lipo('6s1100', 0.036, 0.076, 0.037, '#1f9e57')
    build_lipo('6s1300', 0.036, 0.076, 0.044, '#e0b21f')
    build_liion('6s4500', '#5a5f66')
    build_lipo('4s850', 0.031, 0.062, 0.030, '#7a2bd1', '30')
    build_lipo('6s850', 0.033, 0.066, 0.034, '#ff6a1a', '30')
    build_lipo('6s1800', 0.038, 0.090, 0.045, '#222222')


# ----------------------------------------------------------------------------- Actioncams
def build_actioncams():
    reset()
    base_materials()
    material('M_TPU_Orange', '#ff6a1a', 0.7)
    material('M_RecRed', '#d81f1f', 0.4)
    m = Model('actioncam_mini')
    m.add(bm_prism([(-0.014, -0.015), (0.014, -0.015), (0.014, 0.015), (-0.014, 0.015)], 0.006), 'M_TPU_Orange', mtx((0, 0, 0.003)), 0.05)
    m.add(bm_box(0.03, 0.03, 0.03, 0.004, 3), 'M_CamBody', mtx((0, 0, 0.022), (-12, 0, 0)), 0.05)
    m.add(bm_cyl(0.0095, 0.006, 32), 'M_CamBody', mtx((0, 0.017, 0.025), (78, 0, 0)), 0.05)
    m.add(bm_uvsphere(0.0078, 24, 12), 'M_Glass', mtx((0, 0.0205, 0.0257), (-12, 0, 0), (1, 0.4, 1)), 0.05)
    m.add(bm_cyl(0.003, 0.0012, 16), 'M_RecRed', mtx((0.006, 0, 0.0375), (-12, 0, 0)), 0.05)
    m.export(OUT)

    reset()
    base_materials()
    material('M_TPU_Orange', '#ff6a1a', 0.7)
    material('M_RecRed', '#d81f1f', 0.4)
    material('M_Screen', '#05070a', 0.08, 0.2)
    m = Model('actioncam_full')
    m.add(bm_box(0.05, 0.036, 0.008, 0.002), 'M_TPU_Orange', mtx((0, 0, 0.004)), 0.05)
    for sx in (-1, 1):
        m.add(bm_box(0.004, 0.03, 0.03, 0.0015), 'M_TPU_Orange', mtx((sx * 0.033, 0, 0.022)), 0.05)
    m.add(bm_box(0.062, 0.033, 0.045, 0.005, 3), 'M_CamBody', mtx((0, 0, 0.032), (-10, 0, 0)), 0.05)
    m.add(bm_box(0.024, 0.008, 0.024, 0.003), 'M_CamBody', mtx((-0.015, 0.018, 0.038), (-10, 0, 0)), 0.05)
    m.add(bm_cyl(0.0095, 0.006, 32), 'M_CamBody', mtx((-0.015, 0.0235, 0.039), (80, 0, 0)), 0.05)
    m.add(bm_uvsphere(0.008, 24, 12), 'M_Glass', mtx((-0.015, 0.0268, 0.0396), (-10, 0, 0), (1, 0.4, 1)), 0.05)
    m.add(bm_box(0.022, 0.001, 0.022, 0.001), 'M_Screen', mtx((0.015, 0.0167, 0.036), (-10, 0, 0)), 0.05)
    m.add(bm_box(0.012, 0.004, 0.0015, 0.0005), 'M_RecRed', mtx((0.016, 0.0, 0.0555), (-10, 0, 0)), 0.05)
    m.export(OUT)


# ----------------------------------------------------------------------------- Werkbank (Werkstatt-Szene)
def build_workbench():
    reset()
    material('T_wood', '#ffffff', 0.7)
    material('M_BenchMetal', '#2f3338', 0.45, 0.8)
    material('M_Mat', '#1d4a3a', 0.85)
    material('M_MatLine', '#7fb59a', 0.8)
    material('M_Peg', '#b48e63', 0.75)
    material('M_PegHole', '#3a2c1e', 0.9)
    material('M_ToolRed', '#c2271f', 0.45)
    material('M_ToolBlack', '#151515', 0.5)
    material('M_Steel', '#c8c8cc', 0.25, 1.0)
    material('M_LampBody', '#e8e4da', 0.4, 0.1)
    material('M_LampEmit', '#fff4dd', 0.2, 0.0, emit='#fff4dd', emit_strength=8.0)
    m = Model('workbench')
    m.box((1.8, 0.85, 0.045), (0, 0.1, 0.8775), 'T_wood', bevel=0.004, uv=1.2)
    for sx in (-1, 1):
        for sy in (-1, 1):
            m.box((0.05, 0.05, 0.855), (sx * 0.84, 0.1 + sy * 0.37, 0.4275), 'M_BenchMetal', bevel=0.004)
        m.box((0.04, 0.74, 0.04), (sx * 0.84, 0.1, 0.18), 'M_BenchMetal', bevel=0.003)
    m.box((1.64, 0.04, 0.04), (0, 0.47, 0.18), 'M_BenchMetal', bevel=0.003)
    m.box((0.62, 0.46, 0.003), (0, 0.0, 0.9015), 'M_Mat', bevel=0.001)
    for i in range(-6, 7):
        m.box((0.0012, 0.44, 0.0004), (i * 0.045, 0.0, 0.9033), 'M_MatLine', collide=False)
    for j in range(-4, 5):
        m.box((0.6, 0.0012, 0.0004), (0, j * 0.045, 0.9034), 'M_MatLine', collide=False)
    # Lochwand
    m.box((1.8, 0.02, 1.1), (0, 0.55, 1.45), 'M_Peg', bevel=0.003)
    for i in range(36):
        for j in range(20):
            if (i * 7 + j * 3) % 5 == 0:
                continue
            m.add(bm_cyl(0.0035, 0.002, 8), 'M_PegHole', mtx((-0.86 + i * 0.049, 0.539, 0.94 + j * 0.052), (90, 0, 0)), 0.05)
    # Werkzeuge an der Wand
    for k, x in enumerate((-0.6, -0.5, -0.4, -0.3)):
        m.add(bm_cyl(0.012, 0.09, 16), 'M_ToolRed' if k % 2 == 0 else 'M_ToolBlack', mtx((x, 0.52, 1.5)), 0.05)
        m.add(bm_cyl(0.0025, 0.1, 8), 'M_Steel', mtx((x, 0.52, 1.41)), 0.05)
    # Lötstation
    m.box((0.16, 0.12, 0.08), (0.62, 0.3, 0.94), 'M_ToolBlack', bevel=0.008)
    m.add(bm_cyl(0.035, 0.006, 24), 'M_ToolRed', mtx((0.48, 0.3, 0.906)), 0.05)
    bm, mm, L = bm_beam((0.48, 0.3, 0.91), (0.46, 0.27, 1.02), 0.012)
    m.add(bm, 'M_Steel', mm, 0.05)
    # Lampe
    m.add(bm_cyl(0.07, 0.02, 32), 'M_LampBody', mtx((-0.62, 0.35, 0.91)), 0.05)
    bm, mm, L = bm_beam((-0.62, 0.35, 0.92), (-0.55, 0.3, 1.4), 0.015)
    m.add(bm, 'M_LampBody', mm, 0.05)
    bm, mm, L = bm_beam((-0.55, 0.3, 1.4), (-0.25, 0.12, 1.36), 0.015)
    m.add(bm, 'M_LampBody', mm, 0.05)
    m.add(bm_cyl(0.09, 0.07, 32, r2=0.05), 'M_LampBody', mtx((-0.22, 0.1, 1.33), (12, -18, 0)), 0.05)
    m.add(bm_cyl(0.082, 0.004, 32), 'M_LampEmit', mtx((-0.215, 0.105, 1.293), (12, -18, 0)), 0.05)
    # Teileschale
    m.box((0.2, 0.14, 0.012), (0.45, -0.2, 0.906), 'M_ToolBlack', bevel=0.004, collide=False)
    m.export(OUT)


def main():
    ensure_dir(OUT)
    ensure_dir(DATA)
    build_frames()
    build_motors()
    build_props()
    build_stacks()
    build_cameras()
    build_batteries()
    build_actioncams()
    build_workbench()
    with open(os.path.join(DATA, 'drone_parts.json'), 'w') as fh:
        json.dump({'frames': FRAMES, 'motors': MOTORS, 'props': PROPS, 'batteries': BATTS}, fh, indent=1)
    print('[SkyFPV] Drohnenteile fertig')


main()
