# Sky FPV - Vorschau-Renderer (Entwicklerwerkzeug)
# blender -b --factory-startup -P preview_models.py -- <ausgabe.png> <modell1.glb> [modell2.glb ...]
import bpy
import sys
import math
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
out, files = argv[0], argv[1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
x = 0.0
objs_all = []
for f in files:
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=f)
    new = [o for o in bpy.data.objects if o not in before and o.type == 'MESH']
    if not new:
        continue
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for o in new:
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            lo = Vector(map(min, lo, w))
            hi = Vector(map(max, hi, w))
    size = max((hi - lo).length, 1e-3)
    s = 1.0 / size
    for o in [o for o in bpy.data.objects if o not in before and o.parent is None]:
        o.scale = o.scale * s
        o.location = (o.location - (lo + hi) / 2) * s + Vector((x, 0, 0))
    objs_all += new
    x += 1.2
cam_data = bpy.data.cameras.new('cam')
cam = bpy.data.objects.new('cam', cam_data)
sc.collection.objects.link(cam)
cx = (x - 1.2) / 2
cam.location = (cx, -2.2 - x * 0.35, 1.2 + x * 0.12)
d = Vector((cx, 0, 0)) - cam.location
cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
sc.camera = cam
sc.render.engine = 'BLENDER_WORKBENCH'
sc.display.shading.light = 'STUDIO'
sc.display.shading.color_type = 'MATERIAL'
sc.display.shading.show_shadows = True
sc.display.shading.show_cavity = True
sc.render.resolution_x = 1600
sc.render.resolution_y = 800
sc.render.filepath = out
bpy.ops.render.render(write_still=True)
