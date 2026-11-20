# -----------------------------------------------------------------------------
# Sky FPV - Decal-Atlanten für die verlassene Fabrik
#   graffiti.png : 4 x 4 Graffiti-Pieces (Blender-Textobjekte, Workbench-Render, transparent)
#   stains.png   : 4 Schmutzspuren (Rost, Wasser, Ruß, Moos) als vertikale Laufspuren mit Alpha
# Aufruf: blender -b --factory-startup -P make_decals.py
# -----------------------------------------------------------------------------
import os
import sys
import math
import random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import numpy as np
from _common import reset, bake_fields, ensure_dir, TEXTURES, srgb_to_lin, hex_rgb

WORDS = ['SKY', 'BANDO', 'RUST', 'KAOS', 'DIVE', 'NOVA', 'ZERO', 'FLOW', 'GHOST', 'LOOP', 'KRANK', 'VOID', 'ACRO', 'ROST', 'FUZE', 'NEON']
COLS = ['#ff3b30', '#ffcc00', '#34c759', '#00c7ff', '#ff2d95', '#af52de', '#ff9500', '#5ac8fa', '#e5e5ea', '#30d158']


def flat_mat(name, hexc):
    m = bpy.data.materials.new(name)
    c = srgb_to_lin(hex_rgb(hexc))
    m.diffuse_color = (c[0], c[1], c[2], 1.0)
    return m


def text_obj(body, size, mat, offset, z, shear, rot):
    cu = bpy.data.curves.new('t', 'FONT')
    cu.body = body
    cu.size = size
    cu.align_x = 'CENTER'
    cu.align_y = 'CENTER'
    cu.offset = offset
    cu.shear = shear
    cu.space_character = 0.85
    ob = bpy.data.objects.new('t', cu)
    ob.location = (0, 0, z)
    ob.rotation_euler = (0, 0, rot)
    ob.data.materials.append(mat)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def graffiti_atlas():
    reset()
    rnd = random.Random(5)
    sc = bpy.context.scene
    cols, rows, cw, ch = 4, 4, 1.0, 0.5
    black = flat_mat('blk', '#0b0b0d')
    for k, word in enumerate(WORDS):
        cx = (k % cols) * cw + cw / 2
        cy = -(k // cols) * ch - ch / 2
        fill = flat_mat('f%d' % k, rnd.choice(COLS))
        outer = flat_mat('o%d' % k, rnd.choice(['#ffffff', '#ffe66d', '#111111', '#9be7ff']))
        size = min(0.36, 1.6 / max(3, len(word)) * 0.42)
        shear = rnd.uniform(-0.15, 0.35)
        rot = math.radians(rnd.uniform(-6, 6))
        for (mat, off, z) in ((outer, 0.03, 0.0), (black, 0.017, 0.01), (fill, 0.0, 0.02)):
            ob = text_obj(word, size, mat, off, z, shear, rot)
            ob.location.x += cx
            ob.location.y += cy
        # Farbnasen (Drips)
        for d in range(rnd.randint(2, 6)):
            L = rnd.uniform(0.03, 0.12)
            bpy.ops.mesh.primitive_plane_add(size=1, location=(cx + rnd.uniform(-0.35, 0.35), cy - 0.07 - L / 2, 0.015))
            p = bpy.context.active_object
            p.scale = (0.006, L / 2 * 2, 1)
            p.data.materials.append(fill)
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = cols * cw
    cam.location = (cols * cw / 2, -rows * ch / 2, 5)
    sc.collection.objects.link(cam)
    sc.camera = cam
    sc.render.engine = 'BLENDER_WORKBENCH'
    sc.display.shading.light = 'FLAT'
    sc.display.shading.color_type = 'MATERIAL'
    sc.render.film_transparent = True
    sc.view_settings.view_transform = 'Standard'
    sc.render.resolution_x = 2048
    sc.render.resolution_y = 1024
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.render.filepath = os.path.join(TEXTURES, 'graffiti.png')
    bpy.ops.render.render(write_still=True)
    print('[SkyFPV] graffiti.png')


def nrm(a):
    lo, hi = np.percentile(a, 1), np.percentile(a, 99)
    return np.clip((a - lo) / max(hi - lo, 1e-6), 0, 1)


def stains_atlas():
    reset()
    S = 1024
    F = lambda cells, seed, st: {'kind': 'noise', 'cells': cells, 'detail': 6, 'tile': False, 'seed': seed, 'stretch': st}
    streak, blot, fine = bake_fields([F(22, 1.0, (1.0, 0.06)), F(5, 2.0, (1.0, 1.0)), F(60, 3.0, (1.0, 0.2))], S)
    v = np.linspace(0, 1, S)[:, None].repeat(S, 1)   # Zeile 0 = unten
    u = (np.arange(S) % (S // 4)) / (S // 4)
    u = u[None, :].repeat(S, 0)
    cell = (np.arange(S) // (S // 4))[None, :].repeat(S, 0)
    edge = np.clip(np.minimum(u, 1 - u) * 6, 0, 1)
    top = v ** 1.6                                   # oben kräftig, nach unten auslaufend
    streaks = np.clip(nrm(streak) * 1.6 - 0.45, 0, 1)
    rgba = np.zeros((S, S, 4), np.float32)
    cols = {0: ('#5b3014', '#8a4a20'), 1: ('#1d1f1f', '#3a3c3a'), 2: ('#0a0a0a', '#1c1a18'), 3: ('#2f4a1b', '#5d7a2c')}
    for c, (a, b) in cols.items():
        m = cell == c
        ca, cb = np.array(hex_rgb(a)), np.array(hex_rgb(b))
        t = nrm(fine)
        col = ca[None, None, :] * (1 - t[..., None]) + cb[None, None, :] * t[..., None]
        if c == 3:   # Moos: von unten nach oben, fleckig
            al = np.clip(nrm(blot) * 1.8 - 0.6, 0, 1) * np.clip((1 - v) * 1.8, 0, 1) * (0.6 + 0.4 * nrm(fine))
        elif c == 2:  # Ruß: wolkig, oben stark
            al = np.clip(nrm(blot) * 1.3 - 0.2, 0, 1) * top * 0.9
        else:
            al = streaks * top * (0.75 + 0.25 * nrm(blot))
        al = al * edge * 0.85
        rgba[m, :3] = col[m]
        rgba[m, 3] = al[m]
    img = bpy.data.images.new('stains', S, S, alpha=True, float_buffer=False)
    try:
        img.colorspace_settings.name = 'Non-Color'
    except Exception:
        pass
    img.alpha_mode = 'STRAIGHT'
    img.pixels.foreach_set(rgba.ravel())
    img.filepath_raw = os.path.join(TEXTURES, 'stains.png')
    img.file_format = 'PNG'
    img.save()
    print('[SkyFPV] stains.png')


ensure_dir(TEXTURES)
graffiti_atlas()
stains_atlas()
