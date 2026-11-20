// Sky FPV – Nachbearbeitung: Tiefenschärfe (DOF), Tiefendunst, FPV-Weitwinkel-Verzerrung,
// chromatische Aberration, Vignette, analoges Rauschen, ACES-Tonemapping, sRGB-Ausgabe.
uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform vec2 uRes;
uniform float uNear;
uniform float uFar;
uniform float uFocus;      // Fokusdistanz (m)
uniform float uDof;        // Stärke 0..1
uniform float uFisheye;    // Barrel-Verzerrung
uniform float uAnalog;     // 0 = digital, >0 = analoges Bild
uniform float uNoise;      // Signalstörung 0..1
uniform float uTime;
uniform float uExposure;
uniform float uFlash;      // Crash-Blitz
varying vec2 vUv;

float viewZ(float d) {
  float z = d * 2.0 - 1.0;
  return 2.0 * uNear * uFar / (uFar + uNear - z * (uFar - uNear));
}
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

float coc(float z) {
  float c = abs(z - uFocus) / max(z, 0.01) * (uFocus * 0.35 + 0.6);
  return clamp(c, 0.0, 1.0) * uDof;
}

vec3 aces(vec3 x) {
  x *= uExposure;
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}
vec3 toSRGB(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

void main() {
  // FPV-Weitwinkel (Tonnenverzerrung) mit Randzoom, damit keine leeren Ecken entstehen
  vec2 c = vUv * 2.0 - 1.0;
  float asp = uRes.x / uRes.y;
  vec2 cc = vec2(c.x * asp, c.y);
  float r2 = dot(cc, cc) / (asp * asp);
  float k = uFisheye * 0.45;
  float rmax2 = (asp * asp + 1.0) / (asp * asp);
  vec2 uv = c * (1.0 + k * r2) / (1.0 + k * rmax2);
  // Analog: Zeilenversatz bei Störung
  if (uAnalog > 0.0) {
    float line = floor(vUv.y * 240.0);
    uv.x += (hash(vec2(line, floor(uTime * 30.0))) - 0.5) * 0.06 * uNoise * uNoise;
    // Bildsynchronisation reißt ab: Bild rollt vertikal
    float roll = smoothstep(0.75, 1.0, uNoise);
    uv.y = mod(uv.y + 1.0 + roll * fract(uTime * 0.9) * 2.0, 2.0) - 1.0;
  }
  uv = uv * 0.5 + 0.5;
  // Digital: Makroblöcke bei schwachem Signal
  if (uAnalog == 0.0 && uNoise > 0.0) {
    float blocks = mix(260.0, 24.0, uNoise);
    uv = (floor(uv * vec2(blocks * uRes.x / uRes.y, blocks)) + 0.5) / vec2(blocks * uRes.x / uRes.y, blocks);
  }

  float z = viewZ(texture(tDepth, uv).r);
  float cc0 = coc(z);
  vec2 px = 1.0 / uRes;
  vec3 col = vec3(0.0);
  float wsum = 0.0;
  float rad = cc0 * 14.0;
  if (rad > 0.4) {
    for (int i = 0; i < 28; i++) {
      float fi = float(i);
      float r = sqrt((fi + 0.5) / 28.0) * rad;
      float a = fi * 2.39996;
      vec2 o = vec2(cos(a), sin(a)) * r * px;
      float zs = viewZ(texture(tDepth, uv + o).r);
      float w = (zs < z) ? clamp(coc(zs) * 14.0 / max(r, 0.5), 0.0, 1.0) : 1.0;
      col += texture(tColor, uv + o).rgb * w;
      wsum += w;
    }
    col /= max(wsum, 1e-3);
  } else {
    col = texture(tColor, uv).rgb;
  }
  // Chromatische Aberration am Rand
  float ca = (uFisheye * 0.004 + uAnalog * 0.002) * r2;
  if (ca > 0.0) {
    col.r = mix(col.r, texture(tColor, uv + (uv - 0.5) * ca * 2.0).r, 0.8);
    col.b = mix(col.b, texture(tColor, uv - (uv - 0.5) * ca * 2.0).b, 0.8);
  }

  col = aces(col);
  // Vignette
  col *= 1.0 - smoothstep(0.55, 1.35, length(c * vec2(1.0, 0.85))) * 0.45;

  if (uAnalog > 0.0) {
    float l = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(l), 0.18 + uNoise * 0.5);
    col = mix(col, col * vec3(1.03, 1.0, 0.95), 0.6);
    float scan = 0.94 + 0.06 * sin(vUv.y * uRes.y * 1.6);
    float n = hash(vUv * uRes + uTime * 61.0);
    col = col * scan + (n - 0.5) * (0.06 + uNoise * 0.7);
    float tear = step(0.985 - uNoise * 0.25, hash(vec2(floor(vUv.y * 80.0), floor(uTime * 24.0))));
    col = mix(col, vec3(n), tear * uNoise);
    // Kompletter Bildverlust: nur noch Schnee
    col = mix(col, vec3(n * 0.85 + 0.05), smoothstep(0.55, 1.0, uNoise) * 0.95);
  } else {
    col += (hash(vUv * uRes + uTime * 13.0) - 0.5) * 0.015;
  }
  col = mix(col, vec3(1.0), uFlash);
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) col = vec3(0.0);
  gl_FragColor = vec4(toSRGB(clamp(col, 0.0, 1.0)), 1.0);
}
