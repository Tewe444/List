# -----------------------------------------------------------------------------
# Sky FPV - gemeinsame Blender-Helfer
# Wird von allen Generator-Skripten importiert (Modelle, Texturen, Terrain).
# Koordinaten in Blender: Z = oben, +Y = vorne (Drohnen-Nase), Einheiten = Meter.
# -----------------------------------------------------------------------------
import bpy
import bmesh
import math
import os
import json
import random
from mathutils import Vector, Matrix, Euler, Quaternion, noise

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
MODELS = os.path.join(ROOT, 'assets', 'models')
TEXTURES = os.path.join(ROOT, 'assets', 'textures')
TERRAIN = os.path.join(ROOT, 'assets', 'terrain')
DATA = os.path.join(ROOT, 'assets', 'data')


def ensure_dir(p):
    os.makedirs(p, exist_ok=True)
    return p


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


# ----------------------------------------------------------------------------- Farben / Materialien
def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4))


def srgb_to_lin(c):
    def f(x):
        return x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4
    return tuple(f(x) for x in c)


def material(name, color='#cccccc', rough=0.5, metal=0.0, emit=None, emit_strength=0.0):
    """Principled-Material. Name-Konvention: 'T_<texset>' => im Spiel mit Blender-gebackenen
    PBR-Texturen ersetzt, die Farbe wirkt dann als Tönung."""
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    bsdf = None
    for n in nt.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            bsdf = n
    if bsdf is None:
        nt.nodes.clear()
        bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
        out = nt.nodes.new('ShaderNodeOutputMaterial')
        nt.links.new(bsdf.outputs[0], out.inputs[0])
    col = hex_rgb(color) if isinstance(color, str) else color
    lin = srgb_to_lin(col)
    bsdf.inputs['Base Color'].default_value = (lin[0], lin[1], lin[2], 1.0)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metal
    if emit:
        e = srgb_to_lin(hex_rgb(emit))
        for key in ('Emission Color', 'Emission'):
            if key in bsdf.inputs:
                bsdf.inputs[key].default_value = (e[0], e[1], e[2], 1.0)
                break
        if 'Emission Strength' in bsdf.inputs:
            bsdf.inputs['Emission Strength'].default_value = emit_strength
    m.diffuse_color = (lin[0], lin[1], lin[2], 1.0)
    return m


# ----------------------------------------------------------------------------- Transform-Helfer
def mtx(loc=(0, 0, 0), rot=(0, 0, 0), scale=None):
    m = Matrix.Translation(Vector(loc)) @ Euler([math.radians(a) for a in rot], 'XYZ').to_matrix().to_4x4()
    if scale is not None:
        s = scale if hasattr(scale, '__len__') else (scale, scale, scale)
        m = m @ Matrix.Diagonal((s[0], s[1], s[2], 1.0))
    return m


def b2t(v):
    """Blender (Z-up) -> three.js (Y-up)."""
    return [round(v[0], 5), round(v[2], 5), round(-v[1], 5)]


def q2t(q):
    """Blender-Quaternion -> three.js [x,y,z,w]."""
    return [round(q.x, 6), round(q.z, 6), round(-q.y, 6), round(q.w, 6)]


# ----------------------------------------------------------------------------- BMesh-Primitive
def bm_box(sx, sy, sz, bevel=0.0, segs=2):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(sx, sy, sz), verts=bm.verts)
    if bevel > 0:
        b = min(bevel, min(sx, sy, sz) * 0.45)
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=b, offset_type='OFFSET', segments=segs,
                        profile=0.5, affect='EDGES', clamp_overlap=True)
    return bm


def bm_cyl(r, h, segs=24, r2=None, caps=True):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=caps, cap_tris=False, segments=segs, radius1=r,
                          radius2=(r if r2 is None else r2), depth=h)
    return bm


def bm_tube(r_in, r_out, h, segs=32):
    bm = bmesh.new()
    rings = []
    for (r, z) in ((r_out, -h / 2), (r_out, h / 2), (r_in, h / 2), (r_in, -h / 2)):
        ring = []
        for i in range(segs):
            a = 2 * math.pi * i / segs
            ring.append(bm.verts.new((math.cos(a) * r, math.sin(a) * r, z)))
        rings.append(ring)
    for k in range(4):
        A, B = rings[k], rings[(k + 1) % 4]
        for i in range(segs):
            j = (i + 1) % segs
            bm.faces.new((A[i], A[j], B[j], B[i]))
    bm.normal_update()
    return bm


def bm_sphere(r, subdiv=3):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=r)
    return bm


def bm_uvsphere(r, u=24, v=12):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=r)
    return bm


def rounded_rect(w, h, r, segs=6):
    pts = []
    r = min(r, w / 2 - 1e-4, h / 2 - 1e-4)
    for cx, cy, a0 in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90),
                       (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)):
        for i in range(segs + 1):
            a = math.radians(a0 + 90 * i / segs)
            pts.append((cx + math.cos(a) * r, cy + math.sin(a) * r))
    return pts


def bm_prism(points, thickness):
    """Extrudiert ein 2D-Polygon (XY, gegen den Uhrzeigersinn) entlang Z (zentriert)."""
    bm = bmesh.new()
    n = len(points)
    bot = [bm.verts.new((x, y, -thickness / 2)) for x, y in points]
    top = [bm.verts.new((x, y, thickness / 2)) for x, y in points]
    bm.faces.new(list(reversed(bot)))
    bm.faces.new(top)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((bot[i], bot[j], top[j], top[i]))
    bm.normal_update()
    return bm


def bm_beam(p0, p1, w, d=None, bevel=0.0):
    """Quader von Punkt p0 nach p1 (Querschnitt w x d). Gibt (bm, matrix, length) zurück."""
    d = w if d is None else d
    p0, p1 = Vector(p0), Vector(p1)
    v = p1 - p0
    L = v.length
    bm = bm_box(w, d, L, bevel)
    q = Vector((0, 0, 1)).rotation_difference(v.normalized())
    m = Matrix.Translation((p0 + p1) / 2) @ q.to_matrix().to_4x4()
    return bm, m, L


def displace(bm, amount, scale, seed=0, octaves=4):
    off = Vector((seed * 13.1, seed * 7.7, seed * 3.3))
    for v in bm.verts:
        n = v.normal if v.normal.length > 0 else v.co.normalized()
        f = noise.fractal(v.co * scale + off, 0.6, 2.0, octaves, noise_basis='PERLIN_ORIGINAL')
        v.co += n * f * amount
    bm.normal_update()


# ----------------------------------------------------------------------------- UV / Shading
def box_uv(bm, size=1.0, offset=(0.0, 0.0, 0.0)):
    uv = bm.loops.layers.uv.verify()
    ox, oy, oz = offset
    for f in bm.faces:
        n = f.normal
        ax = max(range(3), key=lambda i: abs(n[i]))
        for l in f.loops:
            co = l.vert.co
            if ax == 2:
                u, v = co.x + ox, co.y + oy
            elif ax == 0:
                u, v = co.y + oy, co.z + oz
            else:
                u, v = co.x + ox, co.z + oz
            l[uv].uv = (u / size, v / size)


def cyl_uv(bm, size=1.0):
    uv = bm.loops.layers.uv.verify()
    for f in bm.faces:
        if abs(f.normal.z) > 0.7:
            for l in f.loops:
                l[uv].uv = (l.vert.co.x / size, l.vert.co.y / size)
            continue
        us = []
        for l in f.loops:
            a = math.atan2(l.vert.co.y, l.vert.co.x)
            us.append(a)
        # Naht glätten
        if max(us) - min(us) > math.pi:
            us = [a + 2 * math.pi if a < 0 else a for a in us]
        for l, a in zip(f.loops, us):
            r = max(Vector((l.vert.co.x, l.vert.co.y)).length, 1e-4)
            l[uv].uv = (a * 0.5 / math.pi * (2 * math.pi * 0.25) / size * 4.0 * max(r, 0.05), l.vert.co.z / size)


def finish_shading(bm, angle=48.0):
    thr = math.radians(angle)
    bm.normal_update()
    for f in bm.faces:
        f.smooth = True
    for e in bm.edges:
        if len(e.link_faces) != 2:
            e.smooth = False
            continue
        e.smooth = e.calc_face_angle(0.0) < thr


# ----------------------------------------------------------------------------- Modell-Sammler
class Model:
    """Sammelt Teile pro Material in je einem BMesh (wenige Draw-Calls) und
    protokolliert Kollisions-Volumen für das Spiel."""

    def __init__(self, name):
        self.name = name
        self.parts = {}
        self.order = []
        self.colliders = []
        self.meta = {}

    def add(self, bm_part, mat, m=None, uv=1.0, uv_mode='box', world_uv=True):
        m = Matrix.Identity(4) if m is None else m
        if not world_uv:
            if uv_mode == 'box':
                box_uv(bm_part, uv)
            elif uv_mode == 'cyl':
                cyl_uv(bm_part, uv)
        bm_part.transform(m)
        bm_part.normal_update()
        if world_uv and uv_mode is not None:
            box_uv(bm_part, uv)
        if mat not in self.parts:
            self.parts[mat] = bmesh.new()
            self.order.append(mat)
        tmp = bpy.data.meshes.new('tmp')
        bm_part.to_mesh(tmp)
        self.parts[mat].from_mesh(tmp)
        bpy.data.meshes.remove(tmp)
        bm_part.free()

    # ---- Komfort-Funktionen mit Kollider
    def box(self, size, loc, mat, rot=(0, 0, 0), bevel=0.0, uv=1.0, collide=True, segs=2):
        m = mtx(loc, rot)
        self.add(bm_box(size[0], size[1], size[2], bevel, segs), mat, m, uv)
        if collide:
            self.col_box(size, m)
        return m

    def beam(self, p0, p1, w, mat, d=None, bevel=0.0, uv=1.0, collide=True):
        bm, m, L = bm_beam(p0, p1, w, d, bevel)
        self.add(bm, mat, m, uv)
        if collide:
            self.col_box((w, w if d is None else d, L), m)

    def cyl(self, r, h, loc, mat, rot=(0, 0, 0), segs=24, r2=None, uv=1.0, collide=True, caps=True):
        m = mtx(loc, rot)
        self.add(bm_cyl(r, h, segs, r2, caps), mat, m, uv)
        if collide:
            if abs(rot[0]) < 1e-3 and abs(rot[1]) < 1e-3:
                self.col_cyl(loc, max(r, r2 or 0), h)
            else:
                rr = max(r, r2 or 0)
                self.col_box((rr * 2, rr * 2, h), m)
        return m

    def col_box(self, size, m):
        loc, rot, sc = m.decompose()
        self.colliders.append({'t': 'box', 'c': b2t(loc),
                               'h': [round(size[0] * sc.x / 2, 4), round(size[2] * sc.z / 2, 4), round(size[1] * sc.y / 2, 4)],
                               'q': q2t(rot)})

    def col_cyl(self, loc, r, h):
        self.colliders.append({'t': 'cyl', 'c': b2t(Vector(loc)), 'r': round(r, 4), 'hh': round(h / 2, 4)})

    def col_sphere(self, loc, r):
        self.colliders.append({'t': 'sph', 'c': b2t(Vector(loc)), 'r': round(r, 4)})

    # ---- Export
    def build_objects(self, angle=48.0):
        objs = []
        for matname in self.order:
            bm = self.parts[matname]
            bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
            finish_shading(bm, angle)
            me = bpy.data.meshes.new(self.name + '_' + matname)
            bm.to_mesh(me)
            bm.free()
            me.materials.append(bpy.data.materials.get(matname) or material(matname))
            ob = bpy.data.objects.new(self.name + '_' + matname, me)
            bpy.context.scene.collection.objects.link(ob)
            objs.append(ob)
        self.parts = {}
        return objs

    def export(self, folder=MODELS, angle=48.0, extra=None):
        ensure_dir(folder)
        objs = self.build_objects(angle)
        export_glb(objs, os.path.join(folder, self.name + '.glb'))
        info = {'name': self.name, 'colliders': self.colliders}
        info.update(self.meta)
        if extra:
            info.update(extra)
        with open(os.path.join(folder, self.name + '.json'), 'w') as fh:
            json.dump(info, fh, separators=(',', ':'))
        for ob in objs:
            me = ob.data
            bpy.data.objects.remove(ob)
            bpy.data.meshes.remove(me)
        print('[SkyFPV] exportiert', self.name, len(self.colliders), 'Kollider')


def export_glb(objs, path):
    for ob in bpy.context.scene.objects:
        ob.select_set(False)
    for ob in objs:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True,
                              export_apply=True, export_yup=True)


# ----------------------------------------------------------------------------- Bake-Helfer (Texturen)
_bake_obj = None


def _bake_setup(size):
    global _bake_obj
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    try:
        sc.cycles.device = 'CPU'
        sc.cycles.samples = 1
        sc.cycles.use_denoising = False
    except Exception:
        pass
    if _bake_obj is None or _bake_obj.name not in bpy.data.objects:
        bm = bmesh.new()
        v = [bm.verts.new(p) for p in ((0, 0, 0), (1, 0, 0), (1, 1, 0), (0, 1, 0))]
        f = bm.faces.new(v)
        uv = bm.loops.layers.uv.verify()
        for l in f.loops:
            l[uv].uv = (l.vert.co.x, l.vert.co.y)
        me = bpy.data.meshes.new('BakePlane')
        bm.to_mesh(me)
        bm.free()
        _bake_obj = bpy.data.objects.new('BakePlane', me)
        sc.collection.objects.link(_bake_obj)
    return _bake_obj


class NodeKit:
    def __init__(self, nt):
        self.nt = nt

    def n(self, kind, **props):
        node = self.nt.nodes.new(kind)
        for k, v in props.items():
            setattr(node, k, v)
        return node

    def link(self, a, b):
        self.nt.links.new(a, b)

    def math(self, op, a, b=None):
        node = self.n('ShaderNodeMath', operation=op)
        for i, x in enumerate((a, b)):
            if x is None:
                continue
            if isinstance(x, (int, float)):
                node.inputs[i].default_value = x
            else:
                self.link(x, node.inputs[i])
        return node.outputs[0]


def _coords(k, spec):
    """Liefert (Vector-Socket, W-Socket) für die Noise-Nodes.
    tile=True => 4D-Torus-Abbildung, die Textur kachelt nahtlos."""
    tc = k.n('ShaderNodeTexCoord')
    sep = k.n('ShaderNodeSeparateXYZ')
    k.link(tc.outputs['UV'], sep.inputs[0])
    su, sv = spec.get('stretch', (1.0, 1.0))
    seed = spec.get('seed', 0.0)
    if spec.get('tile', True):
        u = k.math('MULTIPLY', sep.outputs[0], 2 * math.pi)
        v = k.math('MULTIPLY', sep.outputs[1], 2 * math.pi)
        cu = k.math('MULTIPLY', k.math('COSINE', u), su)
        sn_u = k.math('MULTIPLY', k.math('SINE', u), su)
        cv = k.math('MULTIPLY', k.math('COSINE', v), sv)
        sn_v = k.math('ADD', k.math('MULTIPLY', k.math('SINE', v), sv), seed)
        comb = k.n('ShaderNodeCombineXYZ')
        k.link(cu, comb.inputs[0])
        k.link(sn_u, comb.inputs[1])
        k.link(cv, comb.inputs[2])
        return comb.outputs[0], sn_v, True
    comb = k.n('ShaderNodeCombineXYZ')
    k.link(k.math('MULTIPLY', sep.outputs[0], su), comb.inputs[0])
    k.link(k.math('MULTIPLY', sep.outputs[1], sv), comb.inputs[1])
    comb.inputs[2].default_value = seed
    return comb.outputs[0], None, False


def _field_node(k, spec):
    vec, w, tiled = _coords(k, spec)
    kind = spec['kind']
    cells = spec.get('cells', 8.0)
    scale = cells / (2 * math.pi) if tiled else cells
    if kind in ('noise', 'ridged'):
        nd = k.n('ShaderNodeTexNoise')
        nd.noise_dimensions = '4D' if tiled else '3D'
        try:
            nd.noise_type = 'RIDGED_MULTIFRACTAL' if kind == 'ridged' else 'FBM'
        except Exception:
            pass
        nd.inputs['Scale'].default_value = scale
        nd.inputs['Detail'].default_value = spec.get('detail', 6.0)
        nd.inputs['Roughness'].default_value = spec.get('rough', 0.55)
        if 'Lacunarity' in nd.inputs:
            nd.inputs['Lacunarity'].default_value = spec.get('lac', 2.0)
        nd.inputs['Distortion'].default_value = spec.get('distort', 0.0)
        if kind == 'ridged':
            if 'Offset' in nd.inputs:
                nd.inputs['Offset'].default_value = spec.get('offset', 1.0)
            if 'Gain' in nd.inputs:
                nd.inputs['Gain'].default_value = spec.get('gain', 2.0)
        k.link(vec, nd.inputs['Vector'])
        if w is not None:
            k.link(w, nd.inputs['W'])
        return nd.outputs['Fac']
    # Voronoi-Varianten
    nd = k.n('ShaderNodeTexVoronoi')
    nd.voronoi_dimensions = '4D' if tiled else '3D'
    feat = {'vor_f1': 'F1', 'vor_edge': 'DISTANCE_TO_EDGE', 'vor_cell': 'F1', 'vor_f2': 'F2'}[kind]
    nd.feature = feat
    nd.inputs['Scale'].default_value = scale
    nd.inputs['Randomness'].default_value = spec.get('rand', 1.0)
    k.link(vec, nd.inputs['Vector'])
    if w is not None:
        k.link(w, nd.inputs['W'])
    if kind == 'vor_cell':
        sepc = k.n('ShaderNodeSeparateColor')
        k.link(nd.outputs['Color'], sepc.inputs[0])
        return sepc.outputs[0]
    return nd.outputs['Distance']


def bake_fields(specs, size):
    """Backt bis zu 3 skalare Prozedural-Felder (R,G,B) in ein Float-Bild und gibt
    numpy-Arrays (size x size) zurück."""
    import numpy as np
    ob = _bake_setup(size)
    mat = bpy.data.materials.new('BakeMat')
    try:
        mat.use_nodes = True
    except Exception:
        pass
    nt = mat.node_tree
    nt.nodes.clear()
    k = NodeKit(nt)
    comb = k.n('ShaderNodeCombineXYZ')
    for i, s in enumerate(specs[:3]):
        k.link(_field_node(k, s), comb.inputs[i])
    em = k.n('ShaderNodeEmission')
    k.link(comb.outputs[0], em.inputs['Color'])
    em.inputs['Strength'].default_value = 1.0
    out = k.n('ShaderNodeOutputMaterial')
    k.link(em.outputs[0], out.inputs['Surface'])
    img = bpy.data.images.new('BakeImg', size, size, alpha=False, float_buffer=True)
    try:
        img.colorspace_settings.name = 'Non-Color'
    except Exception:
        pass
    tex = k.n('ShaderNodeTexImage')
    tex.image = img
    for n in nt.nodes:
        n.select = False
    tex.select = True
    nt.nodes.active = tex
    ob.data.materials.clear()
    ob.data.materials.append(mat)
    for o in bpy.context.scene.objects:
        o.select_set(False)
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.bake(type='EMIT', margin=0, use_clear=True)
    arr = np.empty(size * size * 4, dtype=np.float32)
    img.pixels.foreach_get(arr)
    arr = arr.reshape(size, size, 4)
    res = [arr[:, :, i].copy() for i in range(len(specs[:3]))]
    bpy.data.images.remove(img)
    bpy.data.materials.remove(mat)
    return res


def save_image(path, rgb, quality=92):
    """rgb: numpy (H,W,3) oder (H,W) mit Werten 0..1 (bereits im Ziel-Farbraum)."""
    import numpy as np
    if rgb.ndim == 2:
        rgb = np.stack([rgb, rgb, rgb], axis=-1)
    h, w = rgb.shape[:2]
    rgba = np.ones((h, w, 4), dtype=np.float32)
    rgba[:, :, :3] = np.clip(rgb, 0.0, 1.0)
    name = os.path.basename(path)
    img = bpy.data.images.new(name, w, h, alpha=False, float_buffer=False)
    try:
        img.colorspace_settings.name = 'Non-Color'
    except Exception:
        pass
    img.pixels.foreach_set(rgba.ravel())
    ext = os.path.splitext(path)[1].lower()
    img.file_format = 'JPEG' if ext in ('.jpg', '.jpeg') else 'PNG'
    img.filepath_raw = path
    try:
        img.save(filepath=path, quality=quality)
    except TypeError:
        img.save()
    bpy.data.images.remove(img)
