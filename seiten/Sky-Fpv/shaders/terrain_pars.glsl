// Sky FPV – Terrain: Deklarationen & Hilfsfunktionen (wird in MeshStandardMaterial injiziert)
uniform sampler2DArray tAlb;
uniform sampler2DArray tNrm;
uniform sampler2DArray tOrm;
uniform sampler2D tSplatA;
uniform sampler2D tSplatB;
uniform sampler2D tMacro;
uniform float uSize;
uniform float uSnowLine;
uniform float uGrassTint;
varying vec3 vWPos;
varying vec3 vWNrm;

vec3 tNormalW;
float tRough;
float tAO;

// Ebene projizieren (XZ) – liefert Albedo, Weltnormale, ORM
void layerXZ(float idx, float tile, vec3 nG, float nStr, out vec3 a, out vec3 n, out vec3 o) {
  vec2 uv = vWPos.xz / tile;
  a = texture(tAlb, vec3(uv, idx)).rgb;
  vec3 tn = texture(tNrm, vec3(uv, idx)).xyz * 2.0 - 1.0;
  o = texture(tOrm, vec3(uv, idx)).rgb;
  n = normalize(nG + vec3(tn.x, 0.0, tn.y) * nStr);
}

// Fels: triplanare Projektion für steile Hänge
void layerTri(float idx, float tile, vec3 nG, out vec3 a, out vec3 n, out vec3 o) {
  vec3 bw = pow(abs(nG), vec3(4.0));
  bw /= (bw.x + bw.y + bw.z);
  vec3 p = vWPos / tile;
  vec3 ax = texture(tAlb, vec3(p.zy, idx)).rgb, ay = texture(tAlb, vec3(p.xz, idx)).rgb, az = texture(tAlb, vec3(p.xy, idx)).rgb;
  vec3 nx = texture(tNrm, vec3(p.zy, idx)).xyz * 2.0 - 1.0;
  vec3 ny = texture(tNrm, vec3(p.xz, idx)).xyz * 2.0 - 1.0;
  vec3 nz = texture(tNrm, vec3(p.xy, idx)).xyz * 2.0 - 1.0;
  vec3 ox = texture(tOrm, vec3(p.zy, idx)).rgb, oy = texture(tOrm, vec3(p.xz, idx)).rgb, oz = texture(tOrm, vec3(p.xy, idx)).rgb;
  a = ax * bw.x + ay * bw.y + az * bw.z;
  o = ox * bw.x + oy * bw.y + oz * bw.z;
  vec3 wx = vec3(0.0, nx.y, nx.x) * 1.4, wy = vec3(ny.x, 0.0, ny.y) * 1.4, wz = vec3(nz.x, nz.y, 0.0) * 1.4;
  n = normalize(nG + wx * bw.x + wy * bw.y + wz * bw.z);
}

// Höhenbasiertes Überblenden (natürlichere Übergänge)
float hblend(float w, float hNew, float hOld) {
  return smoothstep(0.0, 1.0, clamp(w * 1.5 - 0.25 + (hNew - hOld) * 0.9 * w * (1.0 - w) * 4.0, 0.0, 1.0));
}
