# -----------------------------------------------------------------------------
# Sky FPV - Video in das DVR-Format der BETAFPV VR03 Goggles umwandeln
#   AVI, Motion-JPEG 640x480 YCbCr 4:2:2 (baseline), ~29 fps, Ton PCM 8 kHz mono 16 bit,
#   Datenblöcke auf 512-Byte-Grenzen, idx1-Index – exakt wie die eigenen PICTxxxx.AVI.
# Header, Quantisierungs- und Huffman-Tabellen werden aus einer echten DVR-Aufnahme übernommen.
# blender -b --factory-startup -P make_goggles_avi.py -- <video> <muster.AVI> <ausgabe.AVI> <tempordner>
# -----------------------------------------------------------------------------
import bpy
import os
import sys
import glob
import struct
import wave
import numpy as np

argv = sys.argv[sys.argv.index('--') + 1:]
SRC, SAMPLE, OUT, TMP = argv[:4]
W, H = 640, 480
os.makedirs(TMP, exist_ok=True)

# ----------------------------------------------------------------- Muster-AVI auswerten
S = open(SAMPLE, 'rb').read()
movi_list = S.find(b'LIST', S.find(b'JUNK'))
assert S[movi_list + 8:movi_list + 12] == b'movi'
movi_fourcc = movi_list + 8
data_start = movi_fourcc + 4                       # erster Chunk (bei der Brille: 32768)
avih = S.find(b'avih')
strh_v = S.find(b'strh')
strh_a = S.find(b'strh', strh_v + 8)
us_per_frame = struct.unpack('<I', S[avih + 8:avih + 12])[0]
fps_out = 1e6 / us_per_frame
idx = S.rfind(b'idx1')
first_off, first_size = struct.unpack('<II', S[idx + 16:idx + 24])
frame0 = S[movi_fourcc + first_off + 8:movi_fourcc + first_off + 8 + first_size]


def segments(jpg):
    i, out = 2, {}
    while i < len(jpg):
        assert jpg[i] == 0xFF
        m = jpg[i + 1]
        L = struct.unpack('>H', jpg[i + 2:i + 4])[0]
        out.setdefault(m, []).append(jpg[i:i + 2 + L])
        if m == 0xDA:
            break
        i += 2 + L
    return out


seg = segments(frame0)
HEADER = b'\xff\xd8' + b''.join(b''.join(seg[m]) for m in (0xDB, 0xC0, 0xC4, 0xFE) if m in seg) + seg[0xDA][0]
# Quantisierungstabellen (Zickzack-Reihenfolge)
qt = {}
for s_ in seg[0xDB]:
    p = 4
    while p < len(s_):
        tq = s_[p] & 15
        qt[tq] = np.frombuffer(s_[p + 1:p + 65], dtype=np.uint8).astype(np.float64)
        p += 65
sof = seg[0xC0][0]
comps = [(sof[10 + 3 * k], sof[11 + 3 * k], sof[12 + 3 * k]) for k in range(sof[9])]
assert [c[1] for c in comps] == [0x21, 0x11, 0x11], 'erwartet YCbCr 4:2:2'
# Huffman-Tabellen
huff = {}
for s_ in seg[0xC4]:
    p = 4
    while p < len(s_):
        tc, th = s_[p] >> 4, s_[p] & 15
        counts = list(s_[p + 1:p + 17])
        vals = list(s_[p + 17:p + 17 + sum(counts)])
        code, k, tab = 0, 0, {}
        for ln in range(1, 17):
            for _ in range(counts[ln - 1]):
                tab[vals[k]] = (code, ln)
                code += 1
                k += 1
            code <<= 1
        cl = np.zeros(256, np.int64)
        ll = np.zeros(256, np.int64)
        for v, (c, ln) in tab.items():
            cl[v], ll[v] = c, ln
        huff[(tc, th)] = (cl, ll)
        p += 17 + sum(counts)
sos = seg[0xDA][0]
sel = {sos[5 + 2 * k]: (sos[6 + 2 * k] >> 4, sos[6 + 2 * k] & 15) for k in range(sos[4])}
comp_tabs = [(qt[c[2]], huff[(0, sel[c[0]][0])], huff[(1, sel[c[0]][1])]) for c in comps]
print('[SkyFPV] Muster: %.3f fps, Tabellen übernommen' % fps_out, flush=True)

# ----------------------------------------------------------------- JPEG-Encoder (baseline, 4:2:2, numpy)
ZZ = np.array([0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19, 26, 33, 40, 48, 41, 34, 27, 20, 13, 6, 7, 14, 21,
               28, 35, 42, 49, 56, 57, 50, 43, 36, 29, 22, 15, 23, 30, 37, 44, 51, 58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54,
               47, 55, 62, 63])
D = np.array([[(np.sqrt(1 / 8) if u == 0 else 0.5) * np.cos((2 * x + 1) * u * np.pi / 16) for x in range(8)] for u in range(8)])


def blocks(plane):
    h, w = plane.shape
    return plane.reshape(h // 8, 8, w // 8, 8).transpose(0, 2, 1, 3)   # (by, bx, 8, 8)


def dct_q(bl, q):
    F = np.einsum('ux,abxy,vy->abuv', D, bl, D)
    z = F.reshape(F.shape[0], F.shape[1], 64)[:, :, ZZ]
    return np.round(z / q).astype(np.int64)


def bitlen(a):
    a = np.abs(a)
    return np.where(a > 0, np.floor(np.log2(np.maximum(a, 1))).astype(np.int64) + 1, 0)


def encode(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    Y = 0.299 * r + 0.587 * g + 0.114 * b - 128
    Cb = -0.168736 * r - 0.331264 * g + 0.5 * b
    Cr = 0.5 * r - 0.418688 * g - 0.081312 * b
    Cb = 0.5 * (Cb[:, 0::2] + Cb[:, 1::2])
    Cr = 0.5 * (Cr[:, 0::2] + Cr[:, 1::2])
    zy = dct_q(blocks(Y), comp_tabs[0][0])          # (60, 80, 64)
    zb = dct_q(blocks(Cb), comp_tabs[1][0])         # (60, 40, 64)
    zr = dct_q(blocks(Cr), comp_tabs[2][0])
    by, bx = zb.shape[:2]
    # MCU-Reihenfolge: Y(2c), Y(2c+1), Cb, Cr
    yy = zy.reshape(by, bx, 2, 64)
    allb = np.concatenate([yy, zb[:, :, None], zr[:, :, None]], axis=2).reshape(-1, 64)   # (N, 64)
    comp = np.tile(np.array([0, 0, 1, 2]), by * bx)
    # DC-Differenzen je Komponente
    dc = allb[:, 0].copy()
    diff = np.zeros_like(dc)
    for c in (0, 1, 2):
        m = comp == c
        v = dc[m]
        diff[m] = v - np.concatenate([[0], v[:-1]])
    N = allb.shape[0]
    keys, vals, lens = [], [], []
    # DC-Ereignisse
    s = bitlen(diff)
    amp = np.where(diff >= 0, diff, diff + (1 << s) - 1)
    code = np.zeros(N, np.int64)
    cl = np.zeros(N, np.int64)
    for c in (0, 1, 2):
        m = comp == c
        code[m] = comp_tabs[c][1][0][s[m]]
        cl[m] = comp_tabs[c][1][1][s[m]]
    keys.append(np.arange(N) * 256)
    vals.append((code << s) | amp)
    lens.append(cl + s)
    # AC-Ereignisse
    ac = allb[:, 1:]
    bi, k = np.nonzero(ac)
    v = ac[bi, k]
    same = np.concatenate([[False], bi[1:] == bi[:-1]])
    prev = np.where(same, np.concatenate([[-1], k[:-1]]), -1)
    run = k - prev - 1
    nz = run // 16
    run = run % 16
    s = bitlen(v)
    amp = np.where(v >= 0, v, v + (1 << s) - 1)
    sym = run * 16 + s
    tsel = comp[bi]
    code = np.zeros(len(v), np.int64)
    cl = np.zeros(len(v), np.int64)
    for c in (0, 1, 2):
        m = tsel == c
        code[m] = comp_tabs[c][2][0][sym[m]]
        cl[m] = comp_tabs[c][2][1][sym[m]]
    keys.append(bi * 256 + 2 + 2 * k)
    vals.append((code << s) | amp)
    lens.append(cl + s)
    # ZRL (16 Nullen) vor langen Lücken
    if nz.max(initial=0) > 0:
        rep = np.repeat(np.arange(len(v)), nz)
        zt = comp[bi[rep]]
        zc = np.where(zt == 0, comp_tabs[0][2][0][0xF0], comp_tabs[1][2][0][0xF0])
        zl = np.where(zt == 0, comp_tabs[0][2][1][0xF0], comp_tabs[1][2][1][0xF0])
        keys.append(bi[rep] * 256 + 1 + 2 * k[rep])
        vals.append(zc)
        lens.append(zl)
    # EOB, wenn der letzte Koeffizient nicht an Position 63 steht
    last = np.full(N, -1)
    last[bi] = k                                   # nonzero() ist sortiert -> letzter Wert gewinnt
    eb = np.nonzero(last < 62)[0]
    et = comp[eb]
    keys.append(eb * 256 + 255)
    vals.append(np.where(et == 0, comp_tabs[0][2][0][0x00], comp_tabs[1][2][0][0x00]))
    lens.append(np.where(et == 0, comp_tabs[0][2][1][0x00], comp_tabs[1][2][1][0x00]))
    K = np.concatenate(keys)
    order = np.argsort(K, kind='stable')
    V = np.concatenate(vals)[order]
    L = np.concatenate(lens)[order]
    total = int(L.sum())
    starts = np.cumsum(L) - L
    ev = np.repeat(np.arange(len(L)), L)
    off = np.arange(total) - starts[ev]
    bits = ((V[ev] >> (L[ev] - 1 - off)) & 1).astype(np.uint8)
    pad = (-total) % 8
    bits = np.concatenate([bits, np.ones(pad, np.uint8)])
    by_ = np.packbits(bits)
    ff = np.nonzero(by_ == 0xFF)[0]
    if len(ff):
        by_ = np.insert(by_, ff + 1, 0)
    return HEADER + by_.tobytes() + b'\xff\xd9'


# ----------------------------------------------------------------- Video -> Einzelbilder (4:3 mittig zugeschnitten)
sc = bpy.context.scene
se = sc.sequence_editor_create()
strips = se.strips if hasattr(se, 'strips') else se.sequences
try:
    st = strips.new_movie('video', SRC, 1, 1, fit_method='FILL')
except TypeError:
    st = strips.new_movie('video', SRC, 1, 1)
src_fps = st.fps
nsrc = st.frame_final_duration
if os.environ.get('SKYFPV_FRAMES'):
    nsrc = min(nsrc, int(os.environ['SKYFPV_FRAMES']))   # Testlauf
sc.render.fps = max(1, round(src_fps))
sc.frame_start, sc.frame_end = 1, nsrc
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = W, H, 100
sc.render.use_sequencer = True
sc.view_settings.view_transform = 'Standard'
try:
    sc.render.image_settings.media_type = 'IMAGE'
except Exception:
    pass
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGB'
sc.render.filepath = os.path.join(TMP, 'f_')
if len(glob.glob(os.path.join(TMP, 'f_*.png'))) < nsrc:
    bpy.ops.render.render(animation=True)
print('[SkyFPV] %d Einzelbilder gerendert' % nsrc, flush=True)

# Ton: Mixdown -> 8 kHz mono 16 bit
wav = os.path.join(TMP, 'audio.wav')
pcm = b''
try:
    strips.new_sound('audio', SRC, 2, 1)
    bpy.ops.sound.mixdown(filepath=wav, container='WAV', codec='PCM', format='S16', mixrate=48000)
    with wave.open(wav, 'rb') as wf:
        ch, rate = wf.getnchannels(), wf.getframerate()
        a = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float64).reshape(-1, ch).mean(axis=1)
    n8 = int(len(a) * 8000 / rate)
    t = np.linspace(0, len(a) - 1, n8)
    a = np.interp(t, np.arange(len(a)), np.convolve(a, np.ones(5) / 5, mode='same'))
    pcm = np.clip(a, -32768, 32767).astype('<i2').tobytes()
    print('[SkyFPV] Ton: %.1f s bei 8 kHz' % (n8 / 8000), flush=True)
except Exception as e:
    print('[SkyFPV] Ton übersprungen:', e, flush=True)

# ----------------------------------------------------------------- AVI schreiben
n_out = int(round(nsrc / src_fps * fps_out))
files = sorted(glob.glob(os.path.join(TMP, 'f_*.png')))
out = open(OUT, 'wb')
prefix = bytearray(S[:data_start])
out.write(prefix)
index = []
pos = data_start
last_src, last_entry = -1, None
for j in range(n_out):
    si = min(len(files) - 1, int(j * src_fps / fps_out))
    if si == last_src:
        index.append(last_entry)                    # doppeltes Bild wie beim echten DVR
        continue
    img = bpy.data.images.load(files[si])
    px = np.empty(W * H * 4, np.float32)
    img.pixels.foreach_get(px)
    bpy.data.images.remove(img)
    rgb = np.flipud(px.reshape(H, W, 4)[:, :, :3]) * 255.0
    jpg = encode(rgb.astype(np.float64))
    chunk = b'00dc' + struct.pack('<I', len(jpg)) + jpg + (b'\x00' if len(jpg) & 1 else b'')
    out.write(chunk)
    pad = (-(pos + len(chunk))) % 512
    out.write(b'\x00' * pad)
    last_entry = (b'00dc', 0x10, pos - movi_fourcc, len(jpg))
    index.append(last_entry)
    last_src = si
    pos += len(chunk) + pad
    if j % 200 == 0:
        print('[SkyFPV] Bild %d / %d' % (j, n_out), flush=True)
if pcm:
    out.write(b'01wb' + struct.pack('<I', len(pcm)) + pcm)
    index.append((b'01wb', 0x10, pos - movi_fourcc, len(pcm)))
    pos += 8 + len(pcm)
movi_end = pos
out.write(b'idx1' + struct.pack('<I', 16 * len(index)))
for (cid, fl, off, sz) in index:
    out.write(struct.pack('<4sIII', cid, fl, off, sz))
total = out.tell()
# Kopf anpassen: RIFF-Größe, Bildanzahl, Stream-Längen, movi-Größe
out.seek(4)
out.write(struct.pack('<I', total - 8))
out.seek(avih + 8 + 16)
out.write(struct.pack('<I', n_out))
out.seek(strh_v + 8 + 32)
out.write(struct.pack('<I', n_out))
out.seek(strh_a + 8 + 32)
out.write(struct.pack('<I', len(pcm) // 2))
out.seek(movi_list + 4)
out.write(struct.pack('<I', movi_end - (movi_list + 8)))
out.close()
print('[SkyFPV] fertig: %s (%d Bilder, %.1f MB)' % (OUT, n_out, total / 1e6), flush=True)
