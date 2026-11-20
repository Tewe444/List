// Sky FPV – Renderer + Nachbearbeitung (eigener Pass mit Tiefenpuffer für DOF)
import * as THREE from 'three';
import { loadText } from './assets.js';
import { setAniso } from './assets.js';

export class Renderer {
  async init(canvas) {
    this.r = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.r.shadowMap.enabled = true;
    this.r.shadowMap.type = THREE.PCFSoftShadowMap;
    this.r.toneMapping = THREE.NoToneMapping;
    setAniso(Math.min(16, this.r.capabilities.getMaxAnisotropy()));
    this.scale = 1;
    const [vs, fs] = await Promise.all([loadText('shaders/post.vert.glsl'), loadText('shaders/post.frag.glsl')]);
    this.post = new THREE.ShaderMaterial({
      vertexShader: vs, fragmentShader: fs, depthTest: false, depthWrite: false,
      uniforms: {
        tColor: { value: null }, tDepth: { value: null }, uRes: { value: new THREE.Vector2() }, uNear: { value: 0.05 }, uFar: { value: 6000 },
        uFocus: { value: 30 }, uDof: { value: 0.3 }, uFisheye: { value: 0.6 }, uAnalog: { value: 0 }, uNoise: { value: 0 },
        uTime: { value: 0 }, uExposure: { value: 1.0 }, uFlash: { value: 0 },
      },
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
    this.quad = new THREE.Mesh(g, this.post);
    this.quad.frustumCulled = false;
    this.postScene = new THREE.Scene();
    this.postScene.add(this.quad);
    this.postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.rt = null;
    this.resize();
    addEventListener('resize', () => this.resize());
  }

  setScale(s) { this.scale = s; this.resize(); }

  resize() {
    const w = innerWidth, h = innerHeight, pr = Math.min(devicePixelRatio, 2) * this.scale;
    this.r.setPixelRatio(pr);
    this.r.setSize(w, h, false);
    const W = Math.floor(w * pr), H = Math.floor(h * pr);
    if (this.rt) this.rt.dispose();
    this.rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: this.perf ? 0 : 4 });
    this.rt.depthTexture = new THREE.DepthTexture(W, H);
    this.rt.depthTexture.type = THREE.UnsignedIntType;
    this.post.uniforms.uRes.value.set(W, H);
  }

  render(scene, camera, fx) {
    const u = this.post.uniforms;
    this.r.setRenderTarget(this.rt);
    this.r.render(scene, camera);
    this.r.setRenderTarget(null);
    u.tColor.value = this.rt.texture;
    u.tDepth.value = this.rt.depthTexture;
    u.uNear.value = camera.near; u.uFar.value = camera.far;
    Object.entries(fx).forEach(([k, v]) => { if (u[k]) u[k].value = v; });
    if (this.perf) u.uDof.value = 0;   // Tiefenschärfe kostet am meisten
    this.r.render(this.postScene, this.postCam);
  }
}
