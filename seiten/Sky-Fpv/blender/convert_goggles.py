# -----------------------------------------------------------------------------
# Sky FPV - Video für analoge FPV-Goggles (DVR-Wiedergabe) umwandeln
# Mittig auf 4:3 zuschneiden, 640x480, 30 fps. Ausgabe: AVI (Motion-JPEG bzw. MPEG-4) + MP4 (H.264).
# blender -b --factory-startup -P convert_goggles.py -- <eingabe.mp4> <ausgabeordner> [--probe]
# -----------------------------------------------------------------------------
import bpy
import os
import sys

argv = sys.argv[sys.argv.index('--') + 1:]
src, outdir = argv[0], argv[1]
probe = '--probe' in argv
W, H, FPS = 640, 480, 30

sc = bpy.context.scene
se = sc.sequence_editor_create()
strips = se.strips if hasattr(se, 'strips') else se.sequences
kw = {}
try:
    st = strips.new_movie('video', src, 1, 1, fit_method='FILL')
except TypeError:
    st = strips.new_movie('video', src, 1, 1)
sw, sh = st.elements[0].orig_width, st.elements[0].orig_height
print('[SkyFPV] Quelle: %dx%d, %.3f fps, %d Bilder, %.1f s' % (sw, sh, st.fps, st.frame_final_duration, st.frame_final_duration / max(st.fps, 1)))
if probe:
    sys.exit(0)

# Bildrate: Szene auf Quell-fps (max. 30); bei 60 fps jedes 2. Bild
src_fps = st.fps if st.fps > 0 else 30
sc.render.fps = FPS if src_fps > 31 else max(1, round(src_fps))
step = 2 if src_fps > 31 else 1
if step > 1:
    try:
        st.speed_factor = 2.0          # Blender 4.x: Retiming
    except Exception:
        pass
sc.frame_start = 1
sc.frame_end = max(1, int(st.frame_final_duration / step))

# Ton übernehmen, falls vorhanden
try:
    snd = strips.new_sound('audio', src, 2, 1)
    if step > 1:
        pass
except Exception:
    snd = None

# 4:3 mittig füllen (Zuschnitt)
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = W, H, 100
try:
    st.fit_method = 'FILL'
except Exception:
    s = max(W / sw, H / sh)
    st.transform.scale_x = st.transform.scale_y = s
sc.render.use_sequencer = True
sc.view_settings.view_transform = 'Standard'
os.makedirs(outdir, exist_ok=True)
base = os.path.join(outdir, os.path.splitext(os.path.basename(src))[0].replace(' ', '_') + '_goggles_640x480')


def render(container, codec, ext, audio):
    try:
        sc.render.image_settings.media_type = 'VIDEO'   # Blender 5.x
    except Exception:
        pass
    sc.render.image_settings.file_format = 'FFMPEG'
    ff = sc.render.ffmpeg
    ff.format = container
    ff.codec = codec
    ff.constant_rate_factor = 'HIGH' if codec == 'H264' else ff.constant_rate_factor
    if codec != 'H264':
        ff.video_bitrate = 6000
    ff.audio_codec = audio if snd else 'NONE'
    sc.render.filepath = base + ext
    bpy.ops.render.render(animation=True)
    print('[SkyFPV] geschrieben:', base + ext)


# 1) AVI – das Format, in dem solche Goggles-DVRs selbst aufnehmen
done = False
for fmt in ():
    try:
        sc.render.image_settings.file_format = fmt
        sc.render.filepath = base + '.avi'
        bpy.ops.render.render(animation=True)
        print('[SkyFPV] geschrieben (Motion-JPEG):', base + '.avi')
        done = True
    except Exception as e:
        print('[SkyFPV] AVI_JPEG nicht verfügbar:', e)
if not done:
    render('AVI', 'MPEG4', '.avi', 'MP3')
# 2) MP4 / H.264 als Alternative
render('MPEG4', 'H264', '.mp4', 'AAC')
