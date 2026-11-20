// Sky FPV – Terrain: Layer-Mischung (ersetzt <map_fragment>)
// Layer: 0 Gras, 1 Erde, 2 Beton, 3 Kies, 4 Asphalt, 5 Fels
{
  vec3 nG = normalize(vWNrm);
  vec2 suv = (vWPos.xz + uSize * 0.5) / uSize;
  vec4 sa = texture(tSplatA, suv);
  vec4 sb = texture(tSplatB, suv);
  vec3 mac = texture(tMacro, vWPos.xz / 210.0).rgb;
  vec3 mac2 = texture(tMacro, vWPos.xz / 47.0).rgb;
  float dist = length(vWPos - cameraPosition);
  float nStr = mix(1.0, 0.35, smoothstep(40.0, 400.0, dist));

  vec3 A, N, O, a, n, o;
  // Gras in zwei Maßstäben gegen Kachelmuster
  layerXZ(0.0, 3.5, nG, nStr, A, N, O);
  layerXZ(0.0, 17.0, nG, nStr * 0.5, a, n, o);
  float m = smoothstep(0.3, 0.7, mac2.g);
  A = mix(A, a, m * 0.5); N = normalize(mix(N, n, m * 0.4));
  A *= mix(vec3(1.0), mix(vec3(0.82, 0.86, 0.72), vec3(1.12, 1.05, 0.9), mac.r), uGrassTint);

  float w;
  layerXZ(1.0, 5.0, nG, nStr, a, n, o);
  w = hblend(smoothstep(0.25, 0.75, sa.r + (mac2.b - 0.5) * 0.35), o.b, O.b);
  A = mix(A, a, w); N = normalize(mix(N, n, w)); O = mix(O, o, w);

  layerXZ(3.0, 3.0, nG, nStr, a, n, o);
  w = hblend(smoothstep(0.25, 0.7, sa.b + (mac2.r - 0.5) * 0.3), o.b, O.b);
  A = mix(A, a, w); N = normalize(mix(N, n, w)); O = mix(O, o, w);

  layerXZ(2.0, 6.0, nG, nStr, a, n, o);
  w = hblend(smoothstep(0.3, 0.6, sa.g + (mac.g - 0.5) * 0.2), o.b, O.b);
  A = mix(A, a * mix(0.85, 1.1, mac2.g), w); N = normalize(mix(N, n, w)); O = mix(O, o, w);

  layerXZ(4.0, 6.0, nG, nStr, a, n, o);
  w = smoothstep(0.3, 0.6, sb.r);
  A = mix(A, a, w); N = normalize(mix(N, n, w)); O = mix(O, o, w);

  float slope = 1.0 - nG.y;
  layerTri(5.0, 9.0, nG, a, n, o);
  w = hblend(smoothstep(0.16, 0.3, slope + (mac.b - 0.5) * 0.14), o.b, O.b * 0.6);
  A = mix(A, a * mix(0.85, 1.1, mac.g), w); N = normalize(mix(N, n, w)); O = mix(O, o, w);

  // Schnee auf den höchsten Gipfeln
  float snow = smoothstep(uSnowLine, uSnowLine + 90.0, vWPos.y + (mac.r - 0.5) * 80.0) * smoothstep(0.55, 0.25, slope);
  A = mix(A, vec3(0.86, 0.88, 0.92), snow); O.g = mix(O.g, 0.55, snow);

  diffuseColor.rgb *= A;
  tNormalW = N;
  tRough = clamp(O.g, 0.3, 1.0);
  tAO = mix(1.0, O.r, 0.85);
}
