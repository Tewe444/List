# Sky FPV – Pilot am Startpunkt, komplett in Blender modelliert (stilisiert, sauber):
# Jacke mit Kapuze, Hose, Schuhe, Handschuhe, DJI-artige Goggles und Funke – alles aufeinander abgestimmt.
# Hände und Daumen werden im Koordinatensystem der Funke gebaut, damit sie exakt greifen.
# Aufruf:  blender -b --factory-startup -P make_pilot.py
import math
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bmesh
from mathutils import Vector, Matrix
from _common import reset, material, mtx, bm_box, bm_cyl, bm_uvsphere, bm_tube, Model, MODELS


def ring_faces(bm, rings, caps=True):
    for a, b in zip(rings, rings[1:]):
        n = len(a)
        for i in range(n):
            bm.faces.new((a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]))
    if caps:
        bm.faces.new(list(reversed(rings[0])))
        bm.faces.new(rings[-1])


def sweep(pts, radii, segs=18, caps=True):
    """Rohr entlang einer Punktliste mit Radius je Punkt (Arme, Beine, Daumen)."""
    bm = bmesh.new()
    pts = [Vector(p) for p in pts]
    rings = []
    u = None
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized()
        # Paralleltransport des Ring-Rahmens -> keine Verdrehung an Knie/Ellbogen
        ref = u if u is not None else (Vector((1, 0, 0)) if abs(t.x) < 0.9 else Vector((0, 1, 0)))
        u = (ref - t * ref.dot(t)).normalized()
        v = t.cross(u)
        r = radii[i]
        rings.append([bm.verts.new(p + u * (r * math.cos(a)) + v * (r * math.sin(a)))
                      for a in [2 * math.pi * k / segs for k in range(segs)]])
    ring_faces(bm, rings, caps)
    return bm


def loft(sections, segs=28):
    """Rumpf aus Ellipsen-Querschnitten (z, rx, ry, cy)."""
    bm = bmesh.new()
    rings = [[bm.verts.new((rx * math.cos(a), cy + ry * math.sin(a), z))
              for a in [2 * math.pi * k / segs for k in range(segs)]] for z, rx, ry, cy in sections]
    ring_faces(bm, rings)
    return bm


def build():
    reset()
    material('P_Jacket', '#77725f', 0.92)
    material('P_Pants', '#2a2e35', 0.9)
    material('P_Shoe', '#1c1c1f', 0.7)
    material('P_Sole', '#d9d6cf', 0.8)
    material('P_Skin', '#c4957a', 0.65)
    material('P_Beard', '#3a2e26', 0.95)
    material('P_Glove', '#18191b', 0.75)
    material('P_Gog', '#3b3e44', 0.5)
    material('P_Visor', '#0a0b0d', 0.12)
    material('P_Foam', '#141414', 0.95)
    material('P_Remote', '#9a9da2', 0.55)
    material('P_RemDark', '#26282c', 0.5)
    material('P_Accent', '#ff6a1a', 0.45)
    m = Model('pilot')

    # ---- Beine + Schuhe
    for s in (1, -1):
        hip, knee, ank = Vector((s * 0.088, 0.0, 0.90)), Vector((s * 0.10, 0.025, 0.50)), Vector((s * 0.10, -0.005, 0.10))
        m.add(sweep([hip, hip.lerp(knee, 0.5), knee, knee.lerp(ank, 0.5), ank], [0.076, 0.072, 0.063, 0.056, 0.05]), 'P_Pants')
        m.add(bm_uvsphere(0.064, 18, 10), 'P_Pants', mtx(knee))
        m.add(bm_box(0.105, 0.27, 0.085, 0.035, 3), 'P_Shoe', mtx((s * 0.10, 0.045, 0.06)))
        m.add(bm_box(0.11, 0.275, 0.022, 0.008), 'P_Sole', mtx((s * 0.10, 0.045, 0.011)))
    m.add(loft([(0.80, 0.165, 0.11, 0.0), (0.97, 0.165, 0.11, 0.0)]), 'P_Pants')

    # ---- Rumpf (Jacke) + Hals
    m.add(loft([(0.84, 0.182, 0.128, 0.0), (0.92, 0.176, 0.122, 0.0), (1.08, 0.168, 0.115, 0.005),
                (1.25, 0.186, 0.128, 0.01), (1.38, 0.195, 0.125, 0.0), (1.45, 0.17, 0.11, -0.005),
                (1.49, 0.085, 0.075, 0.0)]), 'P_Jacket')
    m.add(bm_cyl(0.075, 0.07, 24, r2=0.068), 'P_Jacket', mtx((0, 0.0, 1.51)))          # Kragen
    m.add(bm_cyl(0.05, 0.12, 20), 'P_Skin', mtx((0, 0.01, 1.55)))
    m.add(bm_box(0.012, 0.012, 0.5, 0.003), 'P_RemDark', mtx((0, 0.126, 1.2)))         # Reißverschluss

    # ---- Kopf mit Bart, Kapuze auf
    m.add(bm_uvsphere(0.1, 28, 16), 'P_Skin', mtx((0, 0.012, 1.675), scale=(0.9, 1.0, 1.13)))
    m.add(bm_uvsphere(0.1, 24, 12), 'P_Beard', mtx((0, 0.03, 1.615), scale=(0.82, 0.9, 0.55)))
    hood = bm_uvsphere(0.128, 30, 16)
    bmesh.ops.delete(hood, geom=[f for f in hood.faces if f.calc_center_median().y > 0.055 and f.calc_center_median().z < 0.09], context='FACES')
    m.add(hood, 'P_Jacket', mtx((0, -0.012, 1.685), scale=(0.95, 1.0, 1.08)))

    # ---- Goggles (Kopfband, Gehäuse, Visier, Polster, 4 Antennen)
    gz, gy = 1.705, 0.118
    m.add(bm_tube(0.112, 0.121, 0.032, 40), 'P_RemDark', mtx((0, -0.005, gz), (-8, 0, 0), scale=(1.0, 1.12, 1.0)))
    m.add(bm_box(0.195, 0.085, 0.082, 0.03, 4), 'P_Gog', mtx((0, gy, gz)))
    m.add(bm_box(0.165, 0.02, 0.06, 0.018, 3), 'P_Visor', mtx((0, gy + 0.042, gz + 0.002)))
    m.add(bm_box(0.17, 0.03, 0.068, 0.012, 2), 'P_Foam', mtx((0, gy - 0.05, gz)))
    for sx in (1, -1):
        for sz in (1, -1):
            base = Vector((sx * 0.092, gy + 0.01, gz + sz * 0.028))
            d = Vector((sx * 0.75, 0.0, 0.66 if sz > 0 else -0.55)).normalized()
            m.add(sweep([base, base + d * 0.075], [0.008, 0.007], 10), 'P_RemDark')
    m.add(bm_cyl(0.006, 0.01, 12), 'P_Accent', mtx((0.07, gy + 0.03, gz + 0.044)))

    # ---- Funke: lokales System (x = Breite, y = Oberkante, z = Stick-Seite), schräg zum Gesicht
    C = Vector((0, 0.25, 1.12))
    Z = Vector((0, -1.0, 1.0)).normalized()          # ca. 45° zum Piloten gekippt
    X = Vector((1, 0, 0))
    Y = Z.cross(X).normalized()
    R = Matrix((X, Y, Z)).transposed().to_4x4()

    def L(loc=(0, 0, 0), rot=(0, 0, 0), scale=None):
        return Matrix.Translation(C) @ R @ mtx(loc, rot, scale)
    m.add(bm_box(0.15, 0.08, 0.036, 0.016, 3), 'P_Remote', L())
    for sx in (1, -1):
        m.add(bm_cyl(0.024, 0.075, 20, r2=0.02), 'P_Remote', L((sx * 0.066, -0.055, -0.006), (90, 0, sx * -12)))   # Griffe
        m.add(bm_cyl(0.021, 0.006, 20), 'P_RemDark', L((sx * 0.04, 0.0, 0.019)))      # Gimbal
        m.add(bm_cyl(0.0032, 0.024, 8), 'P_RemDark', L((sx * 0.04, 0.0, 0.032)))      # Stick
        m.add(bm_cyl(0.0075, 0.007, 14), 'P_RemDark', L((sx * 0.04, 0.0, 0.045)))     # Kappe
        m.add(bm_box(0.008, 0.012, 0.016, 0.003), 'P_RemDark', L((sx * 0.06, 0.042, 0.01)))   # Schalter
    m.add(bm_box(0.05, 0.022, 0.006, 0.004), 'P_RemDark', L((0, 0.012, 0.019)))       # Display
    m.add(bm_box(0.014, 0.05, 0.014, 0.004), 'P_RemDark', L((0, 0.062, -0.004)))      # Antennen-Fuß
    m.add(bm_box(0.12, 0.016, 0.012, 0.005), 'P_RemDark', L((0, 0.09, -0.004)))       # Antenne (T)
    m.add(bm_cyl(0.004, 0.004, 10), 'P_Accent', L((0.0, -0.025, 0.019)))

    # ---- Hände: Faust um den Griff, Daumen auf dem Stick
    wrists = []
    for sx in (1, -1):
        m.add(bm_box(0.05, 0.085, 0.058, 0.022, 3), 'P_Glove', L((sx * 0.078, -0.045, -0.012), (0, 0, sx * -12)))
        m.add(bm_box(0.034, 0.07, 0.034, 0.014, 2), 'P_Glove', L((sx * 0.058, -0.055, -0.034), (0, 0, sx * -12)))
        th = [L((sx * 0.07, -0.02, 0.018)).translation, L((sx * 0.056, -0.008, 0.036)).translation, L((sx * 0.045, -0.002, 0.048)).translation]
        m.add(sweep(th, [0.012, 0.010, 0.009], 12), 'P_Glove')
        m.add(bm_uvsphere(0.009, 10, 6), 'P_Glove', mtx(th[-1]))
        wrists.append(L((sx * 0.085, -0.085, -0.02)).translation)

    # ---- Arme (Ärmel): Schulter -> Ellbogen -> Handgelenk
    for k, sx in enumerate((1, -1)):
        sh, el, wr = Vector((sx * 0.195, 0.0, 1.42)), Vector((sx * 0.215, 0.07, 1.14)), wrists[k]
        m.add(sweep([sh, sh.lerp(el, 0.5), el, el.lerp(wr, 0.5), wr], [0.062, 0.056, 0.052, 0.048, 0.044]), 'P_Jacket')
        m.add(bm_uvsphere(0.064, 20, 10), 'P_Jacket', mtx(sh))
        m.add(bm_uvsphere(0.054, 18, 10), 'P_Jacket', mtx(el))
        d = (wr - el).normalized()
        m.add(sweep([wr - d * 0.012, wr + d * 0.006], [0.047, 0.047], 18), 'P_RemDark')

    m.export(os.path.join(MODELS, 'pilot'), angle=62)


if __name__ == "__main__":
    build()
