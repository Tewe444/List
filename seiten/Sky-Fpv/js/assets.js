// Sky FPV – Laden von Blender-Modellen (GLB), PBR-Texturen und Shader-Dateien
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader();
const texLoader = new THREE.TextureLoader();
const cacheModels = new Map(), cacheTex = new Map(), cacheText = new Map(), cacheJson = new Map();
let maxAniso = 8;
export const setAniso = (a) => { maxAniso = a; };

export function loadText(url) {
  if (!cacheText.has(url)) cacheText.set(url, fetch(url).then((r) => { if (!r.ok) throw new Error(url); return r.text(); }));
  return cacheText.get(url);
}
export function loadJSON(url) {
  if (!cacheJson.has(url)) cacheJson.set(url, fetch(url).then((r) => { if (!r.ok) throw new Error(url); return r.json(); }));
  return cacheJson.get(url);
}
export async function loadBin(url) { const r = await fetch(url); return new Float32Array(await r.arrayBuffer()); }

export function loadTex(url, srgb = false, repeat = true) {
  const key = url + srgb;
  if (!cacheTex.has(key)) {
    const t = texLoader.load(url);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = maxAniso;
    cacheTex.set(key, t);
  }
  return cacheTex.get(key);
}

const texSet = (name) => ({
  map: loadTex(`assets/textures/${name}_albedo.jpg`, true),
  normalMap: loadTex(`assets/textures/${name}_normal.jpg`),
  orm: loadTex(`assets/textures/${name}_orm.jpg`),
});

// Material-Konvention aus Blender: "T_<set>" => Blender-gebackenes PBR-Set, Farbe = Tönung
function atlas(url) {
  const key = 'atlas:' + url;
  if (!cacheTex.has(key)) {
    const t = texLoader.load(url);
    t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; t.anisotropy = maxAniso;
    cacheTex.set(key, t);
  }
  return cacheTex.get(key);
}

const DECALS = {
  // Blender-gerenderte Graffiti (Alpha-Kante, wirft keinen Schatten)
  M_Graffiti: () => new THREE.MeshStandardMaterial({ map: atlas('assets/textures/graffiti.png'), alphaTest: 0.35, roughness: 0.8,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
  // Rost-/Wasser-/Ruß-/Moos-Laufspuren
  M_Stains: () => new THREE.MeshStandardMaterial({ map: atlas('assets/textures/stains.png'), transparent: true, depthWrite: false, roughness: 1,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
  // Glasscherben
  M_GlassShard: () => new THREE.MeshStandardMaterial({ color: 0x9fb4b8, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.4,
    side: THREE.DoubleSide, envMapIntensity: 1.6, depthWrite: false }),
};
const decalCache = {};

function upgradeMaterial(mat) {
  const base = (mat.name || '').replace(/\.\d+$/, '');
  if (DECALS[base]) { const d = (decalCache[base] ||= DECALS[base]()); d.name = base; return d; }
  const m = /^T_([a-z_]+?)(_dark)?(\.\d+)?$/.exec(mat.name || '');
  if (!m) { mat.envMapIntensity = 1.0; return mat; }
  const set = texSet(m[1]);
  const nm = new THREE.MeshStandardMaterial({
    name: mat.name, color: mat.color.clone(), map: set.map, normalMap: set.normalMap,
    roughnessMap: set.orm, aoMap: set.orm, roughness: 1.0, metalness: mat.metalness,
    normalScale: new THREE.Vector2(1, 1), aoMapIntensity: 0.8,
  });
  if (m[2]) nm.color.multiplyScalar(0.75);
  return nm;
}

export async function loadModel(path) {
  if (!cacheModels.has(path)) {
    cacheModels.set(path, (async () => {
      const g = await gltfLoader.loadAsync(`assets/models/${path}.glb`);
      g.scene.traverse((o) => {
        if (o.isMesh) {
          o.material = upgradeMaterial(o.material);
          const decal = !!DECALS[o.material.name];
          o.castShadow = !decal; o.receiveShadow = true;
          if (decal) o.renderOrder = 1;
        }
      });
      let info = null;
      try { info = await loadJSON(`assets/models/${path}.json`); } catch (e) { info = { colliders: [] }; }
      return { scene: g.scene, info };
    })());
  }
  return cacheModels.get(path);
}

// Bild -> Pixeldaten (für Textur-Arrays & CPU-Abfragen)
export async function imageData(url, size) {
  // createImageBitmap dekodiert auch, wenn das Fenster im Hintergrund ist (img.decode wartet dann)
  const img = await createImageBitmap(await (await fetch(url)).blob());
  const s = size || img.width;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0, s, s);
  return g.getImageData(0, 0, s, s).data;
}

export async function textureArray(names, suffix, size, srgb) {
  const layers = await Promise.all(names.map((n) => imageData(`assets/textures/${n}_${suffix}.jpg`, size)));
  const data = new Uint8Array(size * size * 4 * names.length);
  layers.forEach((l, i) => data.set(l, i * size * size * 4));
  const t = new THREE.DataArrayTexture(data, size, size, names.length);
  t.format = THREE.RGBAFormat;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
  t.generateMipmaps = true; t.anisotropy = maxAniso;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}
