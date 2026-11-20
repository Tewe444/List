# Sky FPV – realistischer Pilot mit Skelett.
# Körper: src/koerper_male.glb (realistisches Mesh, A-Pose). Das Skript
#   1) zieht Kleidung an (Jacke, Jeans, Schuhe, Handschuhe, Mütze – Flächen eingefärbt und aufgepolstert),
#   2) baut ein Skelett (Hüfte, Wirbelsäule, Kopf, Arme, Hände, Finger, Beine) und bindet das Mesh mit
#      automatischen Gewichten (Bone Heat),
#   3) posiert die Knochen: Ellbogen am Körper, Hände greifen die Funke, Finger umschließen die Griffe,
#   4) setzt Goggles (am Kopf-Knochen) und Funke dazu und exportiert pilot.glb MIT Skelett
#      (Ruhepose = A-Pose, aktuelle Pose = Halte-Pose -> später animierbar).
# Aufruf:  blender -b --factory-startup -P make_pilot.py   (SKYFPV_PREVIEW=Ordner für Vorschaubilder)
import os
import sys
import math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import bmesh
import numpy as np
from mathutils import Vector, Matrix
from _common import material, mtx, bm_box, bm_cyl, bm_tube, Model, MODELS
from make_pilot_gear import sweep

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(MODELS, 'pilot')

# Gelenke (rechte Seite +X, Gesicht +Y, Meter) – am Mesh gemessen
J = dict(hip=(0.09, 0.02, 0.93), knee=(0.10, 0.03, 0.50), ankle=(0.10, 0.0, 0.085), toe=(0.11, 0.15, 0.02),
         sh=(0.165, 0.015, 1.375), el=(0.31, 0.025, 1.215), wr=(0.415, 0.09, 1.10), kn=(0.465, 0.20, 1.03), tip=(0.50, 0.30, 0.98))
GRIP = Vector((0.0, 0.30, 1.13))      # Mitte der Funke


def V(p, s=1):
    return Vector((p[0] * s, p[1], p[2]))


def import_body():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=os.path.join(HERE, 'src', 'koerper_male.glb'))
    o = [x for x in bpy.data.objects if x.type == 'MESH'][0]
    mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = Matrix.Identity(4); o.data.transform(mw)
    o.name = 'Pilot'
    return o


def dress(o):
    me = o.data
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bm.to_mesh(me); bm.free()

    def mat(name, col, rough):
        m = material(name, col, rough)
        me.materials.append(m)
        return len(me.materials) - 1
    jacket = mat('Jacke', '#6f6b58', 0.92)
    pants = mat('Jeans', '#2c3442', 0.88)
    shoes = mat('Schuhe', '#1d1d20', 0.6)
    gloves = mat('Handschuhe', '#141517', 0.7)
    beanie = mat('Muetze', '#2a2a2c', 0.95)
    skin = [i for i, m in enumerate(me.materials) if m.name.startswith('Haut')]
    for m in me.materials:
        if m.name.startswith('Haut') and m.node_tree:
            bs = m.node_tree.nodes.get('Principled BSDF')
            if bs:
                bs.inputs['Base Color'].default_value = (0.62, 0.42, 0.32, 1)
                bs.inputs['Roughness'].default_value = 0.6
    push = np.zeros(len(me.vertices))
    for f in me.polygons:
        if skin and f.material_index not in skin:
            continue
        x, y, z = f.center
        ax = abs(x)
        if ax > 0.40 and z > 0.9:
            f.material_index, d = gloves, 0.004
        elif z > 1.645 or (z > 1.57 and y < -0.01):
            f.material_index, d = beanie, 0.008
        elif 0.88 < z < 1.50 and ax < 0.40:
            f.material_index, d = jacket, 0.014
        elif z < 0.09:
            f.material_index, d = shoes, 0.012
        elif z < 0.98 and ax < 0.25:
            f.material_index, d = pants, 0.005
        else:
            continue
        for vi in f.vertices:
            push[vi] = max(push[vi], d)
    cloth = {jacket, pants}
    bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
    inner = [v for v in bm.verts if v.link_faces and all(f.material_index in cloth for f in v.link_faces)]
    for _ in range(14):
        bmesh.ops.smooth_vert(bm, verts=inner, factor=0.6, use_axis_x=True, use_axis_y=True, use_axis_z=True)
    bm.to_mesh(me); bm.free(); me.update()
    for v, d in zip(me.vertices, push):
        if d:
            v.co += v.normal * d
    me.update()
    dec = o.modifiers.new('dec', 'DECIMATE'); dec.ratio = 0.4
    with bpy.context.temp_override(object=o, active_object=o):
        bpy.ops.object.modifier_apply(modifier='dec')


def bands(body):
    """Saubere Kanten statt Zickzack: Kragen, Jackensaum, Ärmelbündchen, Mützenrand."""
    m = Model('bands')
    m.add(bm_tube(0.062, 0.074, 0.035, 32), 'Jacke', mtx((0, 0.015, 1.485), (-8, 0, 0), scale=(1.05, 1.0, 1.0)))
    m.add(bm_tube(0.170, 0.186, 0.03, 40), 'Jacke', mtx((0, 0.012, 0.885), scale=(1.0, 0.74, 1.0)))
    m.add(bm_tube(0.083, 0.094, 0.026, 36), 'Muetze', mtx((0, 0.03, 1.638), (-10, 0, 0), scale=(1.0, 1.2, 1.0)))
    for s in (1, -1):
        e, w = V(J['el'], s), V(J['wr'], s)
        c = e.lerp(w, 0.84)
        q = Vector((0, 0, 1)).rotation_difference((w - e).normalized())
        m.add(bm_tube(0.036, 0.047, 0.028, 24), 'Handschuhe', Matrix.Translation(c) @ q.to_matrix().to_4x4())
    objs = m.build_objects(angle=50)
    with bpy.context.temp_override(active_object=body, selected_editable_objects=[body] + objs, selected_objects=[body] + objs):
        bpy.ops.object.join()


def make_rig():
    arm = bpy.data.armatures.new('Rig')
    ob = bpy.data.objects.new('Rig', arm)
    bpy.context.scene.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.mode_set(mode='EDIT')
    eb = arm.edit_bones

    def bone(name, h, t, parent=None, conn=False):
        b = eb.new(name); b.head = h; b.tail = t
        if parent:
            b.parent = eb[parent]; b.use_connect = conn
        return b
    bone('hips', (0, 0.02, 0.92), (0, 0.02, 1.05))
    bone('spine', (0, 0.02, 1.05), (0, 0.015, 1.25), 'hips', True)
    bone('chest', (0, 0.015, 1.25), (0, 0.01, 1.43), 'spine', True)
    bone('neck', (0, 0.01, 1.43), (0, 0.03, 1.56), 'chest', True)
    bone('head', (0, 0.03, 1.56), (0, 0.04, 1.74), 'neck', True)
    for s, side in ((1, 'R'), (-1, 'L')):
        bone(f'shoulder.{side}', (s * 0.03, 0.01, 1.41), V(J['sh'], s), 'chest')
        bone(f'upperarm.{side}', V(J['sh'], s), V(J['el'], s), f'shoulder.{side}', True)
        bone(f'forearm.{side}', V(J['el'], s), V(J['wr'], s), f'upperarm.{side}', True)
        bone(f'hand.{side}', V(J['wr'], s), V(J['kn'], s), f'forearm.{side}', True)
        bone(f'fingers.{side}', V(J['kn'], s), V(J['tip'], s), f'hand.{side}', True)
        bone(f'thigh.{side}', V(J['hip'], s), V(J['knee'], s), 'hips')
        bone(f'shin.{side}', V(J['knee'], s), V(J['ankle'], s), f'thigh.{side}', True)
        bone(f'foot.{side}', V(J['ankle'], s), V(J['toe'], s), f'shin.{side}', True)
    bpy.ops.object.mode_set(mode='OBJECT')
    return ob


def bind(body, rig):
    for o in bpy.context.view_layer.objects:
        o.select_set(False)
    body.select_set(True); rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')
    empty = [g.name for g in body.vertex_groups if not any(g.index in [x.group for x in v.groups] for v in body.data.vertices[:1])]
    print('vertex groups', len(body.vertex_groups))


def two_bone(S, T, L1, L2, pole):
    d = max(1e-4, min((T - S).length, L1 + L2 - 1e-4))
    n = (T - S).normalized()
    a = (L1 * L1 - L2 * L2 + d * d) / (2 * d)
    h = math.sqrt(max(0.0, L1 * L1 - a * a))
    p = (pole - n * pole.dot(n)).normalized()
    return S + n * a + p * h, S + n * d


def aim(rig, name, head, tail):
    """Pose-Knochen so ausrichten, dass er von head nach tail zeigt (Rest-Roll bleibt)."""
    pb = rig.pose.bones[name]
    rest = rig.data.bones[name].matrix_local
    q = (rest.to_3x3() @ Vector((0, 1, 0))).rotation_difference((tail - head).normalized())
    pb.matrix = Matrix.Translation(head) @ (q.to_matrix() @ rest.to_3x3()).to_4x4()
    bpy.context.view_layer.update()


def pose(rig):
    B = rig.data.bones
    for s, side in ((1, 'R'), (-1, 'L')):
        S = rig.pose.bones[f'upperarm.{side}'].head.copy()
        L1, L2 = B[f'upperarm.{side}'].length, B[f'forearm.{side}'].length
        Lh, Lf = B[f'hand.{side}'].length, B[f'fingers.{side}'].length
        W = GRIP + Vector((s * 0.115, -0.07, -0.03))               # Handgelenk neben dem Griff
        E, W = two_bone(S, W, L1, L2, Vector((s * 0.35, -0.45, -0.8)))
        aim(rig, f'upperarm.{side}', S, E)
        aim(rig, f'forearm.{side}', E, W)
        hd = Vector((-s * 0.12, 0.85, 0.35)).normalized()            # Hand nach vorn/innen
        K = W + hd * Lh
        aim(rig, f'hand.{side}', W, K)
        fd = (hd * 0.2 + Vector((-s * 0.35, 0.05, -0.9))).normalized()   # Finger um den Griff gekrümmt
        aim(rig, f'fingers.{side}', K, K + fd * Lf)
    hb = rig.pose.bones['head']                                    # Kopf leicht gesenkt, Blick nach vorn
    aim(rig, 'head', hb.head.copy(), hb.head + Vector((0, 0.06, 1)).normalized() * B['head'].length)


def gear(rig):
    """Goggles am Kopf, Funke zwischen den Händen (beides aus Blender-Grundformen)."""
    for n, c, r in (('P_Gog', '#3b3e44', 0.5), ('P_Visor', '#0a0b0d', 0.12), ('P_Foam', '#141414', 0.95),
                    ('P_Remote', '#9a9da2', 0.55), ('P_RemDark', '#26282c', 0.5), ('P_Accent', '#ff6a1a', 0.45)):
        material(n, c, r)
    # Goggles im Kopf-Knochen-Raum aufbauen
    hb = rig.pose.bones['head']
    Hm = rig.matrix_world @ hb.matrix
    eye = Hm @ Vector((0, 0.035, 0.0)) if False else None
    g = Model('goggles')
    gz, gy = 1.597, 0.142
    g.add(bm_tube(0.103, 0.111, 0.03, 40), 'P_RemDark', mtx((0, 0.02, gz + 0.01), (-6, 0, 0), scale=(1.0, 1.12, 1.0)))
    g.add(bm_box(0.19, 0.08, 0.08, 0.028, 4), 'P_Gog', mtx((0, gy, gz)))
    g.add(bm_box(0.16, 0.02, 0.058, 0.017, 3), 'P_Visor', mtx((0, gy + 0.04, gz + 0.002)))
    g.add(bm_box(0.165, 0.03, 0.064, 0.012, 2), 'P_Foam', mtx((0, gy - 0.048, gz)))
    for sx in (1, -1):
        for sz in (1, -1):
            base = Vector((sx * 0.09, gy + 0.01, gz + sz * 0.027))
            d = Vector((sx * 0.75, 0.0, 0.66 if sz > 0 else -0.55)).normalized()
            g.add(sweep([base, base + d * 0.075], [0.008, 0.007], 10), 'P_RemDark')
    g.add(bm_cyl(0.006, 0.01, 12), 'P_Accent', mtx((0.07, gy + 0.03, gz + 0.042)))
    gobjs = g.build_objects(angle=50)
    # Goggles mit dem Kopf-Knochen verbinden (folgen später jeder Kopfbewegung)
    for o in gobjs:
        mw = o.matrix_world.copy()
        o.parent = rig; o.parent_type = 'BONE'; o.parent_bone = 'head'
        o.matrix_world = mw
    # Funke
    r = Model('remote')
    Z = Vector((0, -1.0, 1.0)).normalized(); X = Vector((1, 0, 0)); Y = Z.cross(X).normalized()
    R = Matrix((X, Y, Z)).transposed().to_4x4()

    def L(loc=(0, 0, 0), rot=(0, 0, 0)):
        return Matrix.Translation(GRIP) @ R @ Matrix.Diagonal((1.25, 1.25, 1.25, 1)) @ mtx(loc, rot)
    r.add(bm_box(0.15, 0.08, 0.036, 0.016, 3), 'P_Remote', L())
    for sx in (1, -1):
        r.add(bm_cyl(0.024, 0.075, 20, r2=0.02), 'P_Remote', L((sx * 0.066, -0.055, -0.006), (90, 0, sx * -12)))
        r.add(bm_cyl(0.021, 0.006, 20), 'P_RemDark', L((sx * 0.04, 0.0, 0.019)))
        r.add(bm_cyl(0.0032, 0.024, 8), 'P_RemDark', L((sx * 0.04, 0.0, 0.032)))
        r.add(bm_cyl(0.0075, 0.007, 14), 'P_RemDark', L((sx * 0.04, 0.0, 0.045)))
        r.add(bm_box(0.008, 0.012, 0.016, 0.003), 'P_RemDark', L((sx * 0.06, 0.042, 0.01)))
    r.add(bm_box(0.05, 0.022, 0.006, 0.004), 'P_RemDark', L((0, 0.012, 0.019)))
    r.add(bm_box(0.014, 0.05, 0.014, 0.004), 'P_RemDark', L((0, 0.062, -0.004)))
    r.add(bm_box(0.12, 0.016, 0.012, 0.005), 'P_RemDark', L((0, 0.09, -0.004)))
    r.add(bm_cyl(0.004, 0.004, 10), 'P_Accent', L((0.0, -0.025, 0.019)))
    r.build_objects(angle=50)


def preview(base):
    sc = bpy.context.scene
    sc.render.engine = 'BLENDER_WORKBENCH'
    sc.display.shading.light = 'STUDIO'
    sc.display.shading.color_type = 'MATERIAL'
    sc.render.resolution_x = 520; sc.render.resolution_y = 760
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    cam.data.type = 'ORTHO'; cam.data.ortho_scale = 1.0
    sc.collection.objects.link(cam); sc.camera = cam
    for name, loc, rot in (('front', (0, 3, 1.3), (90, 0, 180)), ('side', (3, 0, 1.3), (90, 0, 90)), ('q', (2.2, 2.2, 1.6), (80, 0, 135))):
        cam.location = loc; cam.rotation_euler = [math.radians(a) for a in rot]
        sc.render.filepath = f'{base}_{name}.png'
        bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(cam)


def main():
    body = import_body()
    dress(body)
    bands(body)
    rig = make_rig()
    bind(body, rig)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode='POSE')
    pose(rig)
    bpy.ops.object.mode_set(mode='OBJECT')
    gear(rig)
    prev = os.environ.get('SKYFPV_PREVIEW')
    if prev:
        preview(os.path.join(prev, 'rig'))
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, 'pilot.glb')
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', export_skins=True, export_animations=False,
                              export_reset_pose_bones=False, export_yup=True)
    print('PILOT', path, os.path.getsize(path) // 1024, 'KB', len(body.data.vertices), 'verts', len(rig.data.bones), 'bones')


main()
