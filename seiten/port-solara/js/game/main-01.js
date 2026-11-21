'use strict';
const rand=mulberry32(90210);
const R=(a,b)=>a+rand()*(b-a);
const pickR=a=>a[Math.floor(rand()*a.length)];
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const angWrap=x=>((x+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;
const lerpAng=(a,b,t)=>a+angWrap(b-a)*Math.min(1,t);
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let time=0,frame=0;
const tmpM=new THREE.Matrix4(),tmpQ=new THREE.Quaternion(),tmpE=new THREE.Euler(),tmpS=new THREE.Vector3(),tmpP=new THREE.Vector3(),tmpV=new THREE.Vector3(),tmpC=new THREE.Color();

// ================= RENDERER =================
const STORED_SET=(()=>{try{return JSON.parse(localStorage.getItem('portsolara_settings'))||{};}catch(e){return {};}})();
const SET=Object.assign({quality:1,gfxPreset:'normal',gfxNear:30,gfxFar:100,gfxResolution:.85,autoQuality:true,autoSlowdown:true,music:.5,sfx:.8,voice:false,sens:1,footMusic:true},STORED_SET);
if(!STORED_SET.gfxPreset){const legacy=Number(STORED_SET.quality);SET.gfxPreset=legacy===0?'leicht':legacy>=2?'ultra':'normal';}
if(!(SET.v>=2)){SET.voice=false;SET.v=2;}
const GFX_PRESETS={potato:{near:18,far:55,res:.38,quality:0},leicht:{near:33,far:80,res:.62,quality:0},normal:{near:33,far:105,res:.82,quality:1},ultra:{near:53,far:155,res:1.15,quality:2}};
if(GFX_PRESETS[SET.gfxPreset]){const gp=GFX_PRESETS[SET.gfxPreset];SET.gfxNear=gp.near;SET.gfxFar=gp.far;SET.gfxResolution=gp.res;SET.quality=gp.quality;}
SET.gfxNear=clamp(Number(SET.gfxNear)||30,10,39990);SET.gfxFar=clamp(Number(SET.gfxFar)||100,SET.gfxNear+10,40000);SET.gfxResolution=clamp(Number(SET.gfxResolution)||.85,.35,1.3);SET.autoQuality=SET.autoQuality!==false;if(SET.gfxPreset==='custom')SET.quality=SET.gfxResolution<.6?0:SET.gfxResolution<1.05?1:2;
let perfVisibilityScale=1; // temporäre Sichtweiten-Skalierung bei weniger als 20 FPS
let cullCar=SET.gfxFar,cullPed=SET.gfxFar;
const getEffectiveGfxFar=()=>Math.max(40,Math.round(SET.gfxFar*perfVisibilityScale));
const getEffectiveGfxNear=()=>Math.min(getEffectiveGfxFar()-10,Math.max(10,Math.round(SET.gfxNear*perfVisibilityScale)));
let gfxDynamicScale=1;
const PR=()=>Math.max(.35,Math.min(devicePixelRatio*(SET.gfxResolution||.85)*gfxDynamicScale,[1,1.25,1.75][SET.quality]||1.25));
const renderer=new THREE.WebGLRenderer({antialias:SET.quality>=2,powerPreference:'high-performance'});
renderer.setPixelRatio(PR());
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=SET.quality>0;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
document.body.prepend(renderer.domElement);renderer.domElement.style.display='none';
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0xb9d3ea,220,1500);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,0.5,40500);
const pmrem=new THREE.PMREMGenerator(renderer);

const rt=new THREE.WebGLRenderTarget(innerWidth,innerHeight,{type:THREE.HalfFloatType,samples:SET.quality>=2?4:SET.quality===1?2:0});
const composer=new EffectComposer(renderer,rt);
composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(innerWidth,innerHeight);
composer.addPass(new RenderPass(scene,camera));
// Schutz: NaN/Unendlich-Pixel (z.B. Sonnenscheibe im Half-Float-Puffer) würden im Bloom zu großen schwarzen Flächen verschmieren
const sanitize=new ShaderPass({uniforms:{tDiffuse:{value:null}},
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);vec3 r=min(max(c.rgb,vec3(0.)),vec3(12.));float s=c.r+c.g+c.b;if(any(isnan(c.rgb))||!(s>=-1.0))r=vec3(0.);gl_FragColor=vec4(r,1.);}`});
composer.addPass(sanitize);
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.35,0.55,0.92);
composer.addPass(bloom);
composer.addPass(new OutputPass());
const grade=new ShaderPass({uniforms:{tDiffuse:{value:null},vig:{value:.4},sat:{value:1.22},con:{value:1.15}},
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform sampler2D tDiffuse;uniform float vig,sat,con;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);float l=dot(c.rgb,vec3(.299,.587,.114));c.rgb=mix(vec3(l),c.rgb,sat);c.rgb=clamp((c.rgb-.5)*con+.5,0.,1.);c.rgb=mix(c.rgb,c.rgb*c.rgb*(3.-2.*c.rgb),.35);c.rgb*=mix(vec3(1.0,.995,.985),vec3(1.06,1.0,.92),smoothstep(.12,.85,l));float d=distance(vUv,vec2(.5));c.rgb*=1.-vig*smoothstep(.38,.9,d);gl_FragColor=c;}`});
composer.addPass(grade);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);});

const allMats=[];
const matCache={};

// ================= HIMMEL & LICHT =================
const hemi=new THREE.HemisphereLight(0xcfe6ff,0x5a4a35,0.7);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffffff,3);
sun.castShadow=SET.quality>0;sun.shadow.mapSize.set(SET.quality>=2?4096:2048,SET.quality>=2?4096:2048);
Object.assign(sun.shadow.camera,{left:-140,right:140,top:140,bottom:-140,near:1,far:800});
sun.shadow.bias=-0.0003;sun.shadow.normalBias=0.05;
scene.add(sun);scene.add(sun.target);
const sky=new Sky();sky.scale.setScalar(4500);
const su=sky.material.uniforms;su.turbidity.value=2.1;su.rayleigh.value=1.55;su.mieCoefficient.value=0.0028;su.mieDirectionalG.value=0.88;
su.skyGain={value:.5};
sky.material.fragmentShader='uniform float skyGain;\n'+sky.material.fragmentShader.replace(/gl_FragColor\s*=\s*vec4\(\s*retColor\s*,\s*1\.0\s*\)\s*;/,'gl_FragColor = vec4( retColor*skyGain, 1.0 );');
scene.add(sky);
const envScene=new THREE.Scene();let envRT=null;
const moonMesh=new THREE.Mesh(new THREE.SphereGeometry(30,24,12),new THREE.MeshBasicMaterial({color:new THREE.Color(2.4,2.5,2.8),fog:false}));scene.add(moonMesh);
const starGeo=new THREE.BufferGeometry();{const a=[];for(let i=0;i<2500;i++){const t=Math.random()*Math.PI*2,p=Math.acos(Math.random()*0.97);a.push(Math.sin(p)*Math.cos(t)*2500,Math.cos(p)*2500,Math.sin(p)*Math.sin(t)*2500);}starGeo.setAttribute('position',new THREE.Float32BufferAttribute(a,3));}
const starMat=new THREE.PointsMaterial({color:0xffffff,size:1.7,sizeAttenuation:false,transparent:true,fog:false,depthWrite:false});
const stars=new THREE.Points(starGeo,starMat);scene.add(stars);
const cloudTex=canvasTex(256,128,(g,w,h)=>{for(let i=0;i<45;i++){const x=40+Math.random()*(w-80),y=45+Math.random()*(h-75),r=14+Math.random()*30;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);}});
const cloudMat=new THREE.SpriteMaterial({map:cloudTex,transparent:true,depthWrite:false,fog:false,opacity:.9});
const clouds=[];for(let i=0;i<46;i++){const s=new THREE.Sprite(cloudMat);const sc=R(380,820);s.scale.set(sc,sc*.45,1);s.position.set(R(-3000,3000),R(380,620),R(-3000,2200));scene.add(s);clouds.push(s);}

// ================= STADT-LAYOUT =================
const N=14,CELL=70,ROAD=14,HALF=N*CELL/2,BLK=CELL-ROAD;
const nodeX=i=>i*CELL-HALF;
const nd=(i,j)=>({x:nodeX(i),z:nodeX(j)});
const COAST=HALF+ROAD/2;            // Ende Asphalt
const WATER_Z=COAST+32;            // Wasserkante
const PIERX=210;
const GBLK={i:4,j:5},PBLK={i:9,j:8},HBLK={i:11,j:9};
const AIRX0=600,AIRX1=920,AIRZ0=-380,AIRZ1=380,RWX=790;
const GARAGE={x:nodeX(GBLK.i)+35,z:nodeX(GBLK.j+1)};
const POLICE_SPAWN={x:nodeX(PBLK.i)+35,z:nodeX(PBLK.j+1)-11};
const HOSPITAL_SPAWN={x:nodeX(HBLK.i)+35,z:nodeX(HBLK.j+1)-9.5};
const PARKS=new Set(['9,3','10,3','9,4','10,4','6,10','2,9']),LAKE='10,4';

// Kollision: räumliches Raster
const GRID=40,grid=new Map(),bigSolids=[];
let SX=0,SY=0,SZ=0;// Bau-Versatz für verlegte Orte
const B=HALF+60;
const JX=-420,JZ1=WATER_Z+34;
const IX=-700,IZ=WATER_Z+700,IR=118;
let GY_INT=[];// Innenräume (Boden etwas höher als der Bürgersteig)

// ---------- statisches Zusammenfassen (viel schneller) ----------
// Kleinere räumliche Zellen ermöglichen echte Detail-/Block-/Ausblend-LOD-Stufen.
const CH=.5,STATIC_CHUNK_SIZE=CELL*CH,buckets=new Map(),staticChunkMap=new Map(),staticChunks=[];
const staticBlockMat=new THREE.MeshLambertMaterial({color:0x66717d,roughness:1,fog:true});
let staticLodT=0;
const FAC={};for(const k of ['glass','office','brick','plaster','shop','warehouse','house','adobe','shabby'])FAC[k]=facade(k);
const facadeMats=[];
const MATS={
 glass:[fmat('glass',0xe4f1ff,.08,.85),fmat('glass',0xd2e6dc,.1,.85),fmat('glass',0xeee2cc,.12,.8),fmat('glass',0xc8d4f0,.07,.9)],
 office:[fmat('office',0xffffff),fmat('office',0xd8dde4),fmat('office',0xe9dfcd)],
 brick:[fmat('brick',0xffffff),fmat('brick',0xdcc6b4),fmat('brick',0xbcaaa2)],
 plaster:[0xf3e3c3,0xe9c9b0,0xcfe0e8,0xf4f2ea,0xe7d0e4,0xd9e8c9,0xf0c9a0,0xbfd7ea].map(c=>fmat('plaster',c)),
 shop:[fmat('shop',0xffffff,.6)],
 warehouse:[fmat('warehouse',0xc9ccd0),fmat('warehouse',0xb4c2ae),fmat('warehouse',0xd0b9a0),fmat('warehouse',0xa9b8cc)],
 house:[0xf6efe2,0xf3dcc8,0xdfeaf0,0xe9f0dc,0xf2e2ea,0xfaf3d2,0xe6e0d4].map(c=>fmat('house',c,.85)),
 adobe:[0xe8cfa6,0xdfc19a,0xf0dcbc,0xd7b28c,0xe2c9b0].map(c=>fmat('adobe',c,.92)),
 shabby:[0xd8cfc0,0xc9c2a8,0xb9c4c0,0xd6b9a6,0xc4b59a,0xa9b3b9].map(c=>fmat('shabby',c,.95)),
};
const roofMat=cm(0x3b3d40,.92),concreteTex=canvasTex(256,256,(g,w,h)=>{noiseFill(g,w,h,'#9b9b98',.12);g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=2;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*64,0);g.lineTo(i*64,h);g.moveTo(0,i*64);g.lineTo(w,i*64);g.stroke();}});
concreteTex.wrapS=concreteTex.wrapT=THREE.RepeatWrapping;
const sidewalkMat=M({map:concreteTex,roughness:.9});
const grassTex=canvasTex(256,256,(g,w,h)=>{noiseFill(g,w,h,'#4f7f3a',.18,14000,2);for(let i=0;i<500;i++){g.fillStyle=`rgba(${80+Math.random()*60|0},${120+Math.random()*60|0},40,.5)`;g.fillRect(Math.random()*w,Math.random()*h,1,4);}});
grassTex.wrapS=grassTex.wrapT=THREE.RepeatWrapping;
const grassMat=M({map:grassTex,roughness:1});
const yardMat=cm(0x7c7a74,.9),darkConcrete=M({map:concreteTex,color:0x8a8780,roughness:.95});

// ---------- Boden ----------
const asphaltTex=canvasTex(512,512,(g,w,h)=>{noiseFill(g,w,h,'#3a3c41',.22,30000,2);for(let i=0;i<14;i++){g.fillStyle=`rgba(0,0,0,${.05+Math.random()*.08})`;g.beginPath();g.ellipse(Math.random()*w,Math.random()*h,20+Math.random()*60,10+Math.random()*30,Math.random()*3,0,7);g.fill();}g.strokeStyle='rgba(20,20,20,.5)';g.lineWidth=1;for(let i=0;i<10;i++){g.beginPath();let x=Math.random()*w,y=Math.random()*h;g.moveTo(x,y);for(let k=0;k<6;k++){x+=Math.random()*30-15;y+=Math.random()*30-15;g.lineTo(x,y);}g.stroke();}});
asphaltTex.wrapS=asphaltTex.wrapT=THREE.RepeatWrapping;asphaltTex.repeat.set(70,70);
// Stadtstraßen: eine 70×70-m-Kachel pro Kreuzung mit aufgemalten Markierungen, Zebrastreifen, Flicken, Gullys, Reifenspuren
const cityRoadCanvas=(()=>{const S=1024,P=S/70,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');const R=Math.random,C=S/2;
 g.fillStyle='#4f5155';g.fillRect(0,0,S,S);
 for(let i=0;i<90000;i++){const v=R();g.fillStyle=v<.42?'rgba(18,18,20,.32)':v<.86?'rgba(118,118,116,.26)':'rgba(195,190,182,.32)';g.fillRect(R()*S,R()*S,1+R()*1.7,1+R()*1.7);}
 for(let i=0;i<26;i++){const x=R()*S,y=R()*S,r=30+R()*120;const gr=g.createRadialGradient(x,y,0,x,y,r);const v=R()<.5?20:95;gr.addColorStop(0,`rgba(${v},${v},${v+3},.16)`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
 // Reifenspuren in beiden Fahrtrichtungen
 for(const ax of [0,1])for(const off of [-3.5,3.5])for(const w of [-.85,.85]){const p=C+(off+w)*P;const gr=ax?g.createLinearGradient(0,p-10,0,p+10):g.createLinearGradient(p-10,0,p+10,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.5,'rgba(12,12,14,.3)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;if(ax)g.fillRect(0,p-10,S,20);else g.fillRect(p-10,0,20,S);}
 // Öl- & Gummiflecken in der Spurmitte
 for(let i=0;i<34;i++){const ax=R()<.5,lane=(R()<.5?-3.5:3.5)*P,along=R()*S;const x=ax?along:C+lane,y=ax?C+lane:along;const r=8+R()*22;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(8,8,10,.42)');gr.addColorStop(1,'rgba(8,8,10,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
 // Flicken & Risse
 for(let i=0;i<9;i++){const ax=R()<.5,a=R()*S,b=C+(R()-.5)*12*P,w=40+R()*120,h=30+R()*70;{const v=R()<.5?32:72;g.fillStyle=`rgba(${v},${v},${v+3},.55)`;}if(ax)g.fillRect(a,b-h/2,w,h);else g.fillRect(b-h/2,a,h,w);g.strokeStyle='rgba(15,15,15,.5)';g.lineWidth=2;if(ax)g.strokeRect(a,b-h/2,w,h);else g.strokeRect(b-h/2,a,h,w);}
 for(let i=0;i<70;i++){g.strokeStyle=`rgba(12,12,12,${.35+R()*.3})`;g.lineWidth=1+R()*1.6;g.beginPath();let x=R()*S,y=R()*S;g.moveTo(x,y);for(let k=0;k<6+R()*8;k++){x+=(R()-.5)*44;y+=(R()-.5)*44;g.lineTo(x,y);}g.stroke();}
 // Rinnstein-Schatten an den Bordsteinen
 for(const sgn of [-1,1])for(const ax of [0,1]){const p=C+sgn*7*P;const gr=ax?g.createLinearGradient(0,p-sgn*26,0,p):g.createLinearGradient(p-sgn*26,0,p,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.42)');g.fillStyle=gr;if(ax)g.fillRect(0,Math.min(p,p-sgn*26),S,26);else g.fillRect(Math.min(p,p-sgn*26),0,26,S);}
 const paint=(x,y,w,h,col='rgba(236,234,226,.92)')=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
 const wear=(x,y,w,h)=>{for(let i=0;i<w*h/30;i++){g.fillStyle='rgba(60,62,66,.55)';g.fillRect(x+R()*w,y+R()*h,2,2);}};
 const box=8.5*P;// Kreuzungsbereich ohne Markierung
 // Doppelte gelbe Mittellinie & Randlinien auf allen vier Armen
 for(const [x0,x1] of [[0,C-box-3.5*P],[C+box+3.5*P,S]]){for(const o of [-.18,.18]){paint(x0,C+o*P-3,x1-x0,6,'rgba(231,190,52,.95)');paint(C+o*P-3,x0,6,x1-x0,'rgba(231,190,52,.95)');}
  for(const o of [-6.35,6.35]){paint(x0,C+o*P-3,x1-x0,6);paint(C+o*P-3,x0,6,x1-x0);}wear(x0,C-7*P,x1-x0,14*P);wear(C-7*P,x0,14*P,x1-x0);}
 // Zebrastreifen & Haltelinien
 for(let k=-6;k<=6;k++){if(Math.abs(k)>5.5)continue;const q=C+k*1.05*P-7;for(const d of [-1,1]){paint(q,C+d*(box+.4*P)-(d<0?2.6*P:0),14,2.6*P);paint(C+d*(box+.4*P)-(d<0?2.6*P:0),q,2.6*P,14);}}
 for(const d of [-1,1]){const y=C+d*(box+3.6*P);paint(d>0?C-6.6*P:C,y-5,6.6*P,10);paint(y-5,d<0?C-6.6*P:C,10,6.6*P);}
 // Pfeile auf den Zufahrten (Rechtsverkehr)
 const arrow=(x,y,rot)=>{g.save();g.translate(x,y);g.rotate(rot);g.fillStyle='rgba(236,234,226,.9)';g.fillRect(-5,-10,10,58);g.beginPath();g.moveTo(-20,-6);g.lineTo(0,-38);g.lineTo(20,-6);g.closePath();g.fill();g.restore();};
 arrow(C-3.5*P,C+17*P,0);arrow(C+3.5*P,C-17*P,Math.PI);arrow(C-17*P,C-3.5*P,Math.PI/2);arrow(C+17*P,C+3.5*P,-Math.PI/2);
 // Gullydeckel & Kanaldeckel
 const grate=(x,y)=>{g.fillStyle='#1b1c1e';g.fillRect(x-14,y-8,28,16);g.strokeStyle='#4a4c50';g.lineWidth=2;for(let k=-10;k<=10;k+=5){g.beginPath();g.moveTo(x+k,y-7);g.lineTo(x+k,y+7);g.stroke();}};
 for(const d of [-1,1]){grate(C+d*6.6*P,C+20*P);grate(C+d*6.6*P,C-24*P);grate(C+20*P,C+d*6.6*P);grate(C-26*P,C+d*6.6*P);}
 for(const [mx,my] of [[C+1.8*P,C+27*P],[C-27*P,C-1.6*P]]){g.fillStyle='#2a2b2e';g.beginPath();g.arc(mx,my,18,0,7);g.fill();g.strokeStyle='#55575b';g.lineWidth=3;g.beginPath();g.arc(mx,my,15,0,7);g.stroke();for(let k=-12;k<=12;k+=6){g.beginPath();g.moveTo(mx-12,my+k);g.lineTo(mx+12,my+k);g.stroke();}}
 return c;})();
const cityRoadTex=(()=>{const t=new THREE.CanvasTexture(cityRoadCanvas);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=16;return t;})();
const asphaltDetail=(()=>{const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.fillStyle='#808080';g.fillRect(0,0,512,512);for(let i=0;i<60000;i++){const v=Math.random();g.fillStyle=v<.5?'rgba(40,40,40,.5)':'rgba(200,200,200,.45)';g.fillRect(Math.random()*512,Math.random()*512,1+Math.random()*2,1+Math.random()*2);}return c;})();
const asphaltDetailTex=(()=>{const t=new THREE.CanvasTexture(asphaltDetail);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.NoColorSpace;return t;})();
const asphaltMat=M({map:cityRoadTex,roughness:.88});
asphaltMat.onBeforeCompile=sh=>{sh.uniforms.tDet={value:asphaltDetailTex};sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vWxz;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWxz=(modelMatrix*vec4(transformed,1.)).xz;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D tDet;varying vec2 vWxz;').replace('#include <map_fragment>','#include <map_fragment>\n{float d1=texture2D(tDet,vWxz/3.1).r,d2=texture2D(tDet,vWxz/11.7+.3).r;diffuseColor.rgb*=.7+.62*(d1*.6+d2*.4);}');};
asphaltMat.customProgramCacheKey=()=>'cityroad-v1';
{const s=HALF*2+ROAD;const geo=new THREE.PlaneGeometry(s,s);geo.rotateX(-Math.PI/2);const pa=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<pa.count;i++)uv.setXY(i,(pa.getX(i)+525)/70,(pa.getZ(i)+525)/70);
 const g=new THREE.Mesh(geo,asphaltMat);g.receiveShadow=true;scene.add(g);}
const sandTex=canvasTex(256,256,(g,w,h)=>noiseFill(g,w,h,'#e2cd98',.16,16000),1);sandTex.repeat.set(200,6);
// ---------- Bäume ----------
const trunkMat=cm(0x5b4128,1);
const leafMats=[0x3f7d34,0x2f6b2c,0x5a8f3a,0x4a7a2a,0x6d9a3e].map(c=>M({color:c,roughness:.85,flatShading:true}));
const palmLeafMat=M({color:0x3d7a2e,roughness:.8,side:THREE.DoubleSide});
const GEO={trunk:new THREE.CylinderGeometry(.22,.34,1,7),blob:new THREE.IcosahedronGeometry(1,1),cone:new THREE.ConeGeometry(1,1,8),cyl:new THREE.CylinderGeometry(1,1,1,16),box:new THREE.BoxGeometry(1,1,1),leaf:(()=>{const g=new THREE.PlaneGeometry(.9,4.2,1,4);g.translate(0,2.1,0);const p=g.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);p.setZ(i,y*y*.07);p.setX(i,p.getX(i)*(1-y/5));}g.computeVertexNormals();return g;})()};

// ---------- Gebäude ----------
const antennaLights=[];const antMat=new THREE.MeshStandardMaterial({color:0x330000,emissive:0xff2020,emissiveIntensity:3});
const roofGeo=(()=>{const s=new THREE.Shape();s.moveTo(-.5,0);s.lineTo(.5,0);s.lineTo(0,.5);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false});g.translate(0,0,-.5);return g;})();
const roofMats=[cm(0x8a3b2a,.8),cm(0x4a4f57,.8),cm(0x6b4a35,.8),cm(0x2f3a44,.8)];
const containerCols=[0xc0392b,0x1f5fbf,0x27ae60,0xe67e22,0x8e44ad,0x16a085,0xd4ac0d,0x7f8c8d].map(c=>{const t=canvasTex(64,64,(g)=>{g.fillStyle='#fff';g.fillRect(0,0,64,64);for(let x=0;x<64;x+=6){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x,0,2,64);}});t.wrapS=t.wrapT=THREE.RepeatWrapping;return M({color:c,map:t,roughness:.65,metalness:.3});});

// ================= GELÄNDE: Insel mit Hügeln, Bergen, Wüste, Stränden & Landstraßen =================
const SEA_Y=0.12;
const TC=8,TX0=-1600,TZ0=-3800,TX1=1704,TZ1=1304;
const TNX=Math.round((TX1-TX0)/TC)+1,TNZ=Math.round((TZ1-TZ0)/TC)+1;
const TH=new Float32Array(TNX*TNZ);
// ---------- Rauschen ----------
const NPm=new Uint8Array(512),NGv=new Float32Array(256);{const r=mulberry32(7331);const p=[...Array(256).keys()];for(let i=255;i>0;i--){const j=Math.floor(r()*(i+1));const t=p[i];p[i]=p[j];p[j]=t;}for(let i=0;i<512;i++)NPm[i]=p[i&255];for(let i=0;i<256;i++)NGv[i]=r();}
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const lerpN=(a,b,t)=>a+(b-a)*t;
// ---------- Orte, die sicher an Land liegen (Rechtecke) ----------
const SITES={
 vistamar:{x0:-1110,x1:-850,z0:150,z1:440,name:'Vista Mar',h:2.2},
 hills:{x0:-760,x1:80,z0:-1250,z1:-880,name:'Solara Hills'},
 observ:{x0:-470,x1:-370,z0:-1215,z1:-1135,name:'Sternwarte',pad:1},
 peak:{x0:-660,x1:-580,z0:-1680,z1:-1600,name:'Mount Solara'},
 dust:{x0:380,x1:820,z0:-2440,z1:-2150,name:'Dustwater',pad:1},
 field:{x0:860,x1:1262,z0:-2352,z1:-2236,name:'Flugfeld Dustwater',pad:1},
 trailer:{x0:150,x1:340,z0:-2262,z1:-2150,name:'Trailerpark Rostbach',pad:1},
 fort:{x0:-1080,x1:-745,z0:-2950,z1:-2710,name:'Fort Adler – Sperrgebiet',pad:1},
 prison:{x0:700,x1:920,z0:-3150,z1:-2938,name:'JVA Steinfeld',pad:1},
 salt:{x0:-330,x1:270,z0:-2690,z1:-2445,name:'Salzsee',pad:1,dh:-2.5},
 oil:{x0:-220,x1:280,z0:-3090,z1:-2860,name:'Ölfeld Calvera'},
 wind:{x0:940,x1:1200,z0:-2760,z1:-2470,name:'Windpark'},
 camp:{x0:1020,x1:1170,z0:-1085,z1:-955,name:'Camp Ostklippe',pad:1},
 diner:{x0:250,x1:330,z0:-2090,z1:-2030,name:'Kaktus-Tankstelle',pad:1},
};
// ---------- Küste (Abstand zur Küste, >0 = Land) ----------
const BAYS=[[1430,-1520,230,1],[-1370,-720,200,.8],[-1250,-2550,180,1],[300,-3560,260,1.4],[1380,-430,150,1]],CAPES=[[-1150,-3150,170],[1330,-2850,140],[-200,-3420,120]];
// ---------- Berge & Wüste ----------
const PEAKS=[{x:-620,z:-1640,R:560,H:250},{x:-180,z:-1560,R:330,H:140},{x:560,z:-1580,R:470,H:205},{x:930,z:-1430,R:330,H:120},{x:-980,z:-1500,R:330,H:150},{x:330,z:-1760,R:260,H:95}];
const MESAS=[{x:-520,z:-2180,R:62,H:34},{x:1080,z:-3020,R:80,H:42},{x:-200,z:-3180,R:70,H:30},{x:620,z:-2760,R:48,H:26},{x:-900,z:-2300,R:55,H:30}];
// ---------- Raster füllen ----------
for(let j=0;j<TNZ;j++){const z=TZ0+j*TC;for(let i=0;i<TNX;i++)TH[j*TNX+i]=rawH(TX0+i*TC,z);}
const TH0=TH.slice();
for(const k in SITES){const s=SITES[k];if(!s.pad&&s.h==null)continue;s.y=padH(s);const B=40;
 const i0=Math.max(0,Math.floor((s.x0-B-TX0)/TC)),i1=Math.min(TNX-1,Math.ceil((s.x1+B-TX0)/TC)),j0=Math.max(0,Math.floor((s.z0-B-TZ0)/TC)),j1=Math.min(TNZ-1,Math.ceil((s.z1+B-TZ0)/TC));
 for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=TX0+i*TC,z=TZ0+j*TC;const dx=Math.max(s.x0-x,x-s.x1,0),dz=Math.max(s.z0-z,z-s.z1,0),d=Math.hypot(dx,dz);const w=1-sstep(4,B,d);const q=j*TNX+i;TH[q]=lerpN(TH[q],s.y,w);}}
// ---------- Landstraßen ----------
const ROADS=[];const RTYPE={hw:{hw:7.5,sh:9,grade:.07,smooth:70},road:{hw:5,sh:9,grade:.09,smooth:45},dirt:{hw:3.6,sh:9,grade:.13,smooth:30}};
// Straßennetz (Ring: x0=-770,x1=548,z0=-770)
defRoad('Nordautobahn','hw',[[100,-781],[104,-860],[130,-1000],[168,-1150],[160,-1300],[132,-1450],[140,-1610],[188,-1780],[258,-1940],[330,-2070],[420,-2185],[520,-2265],[630,-2385],[705,-2560],[770,-2760],[808,-2930]],{y0:0});
defRoad('Westküstenstraße','road',[[-781,150],[-850,152],[-950,190],[-1045,165],[-1095,50],[-1110,-170],[-1100,-430],[-1080,-700],[-1060,-950],[-1075,-1200],[-1085,-1460],[-1050,-1720],[-990,-1980],[-925,-2230],[-860,-2470],[-790,-2680],[-735,-2830]],{y0:0});
defRoad('Ostküstenstraße','road',[[559,-600],[640,-640],[800,-690],[975,-730],[1095,-880],[1150,-1120],[1165,-1380],[1145,-1650],[1105,-1900],[1052,-2140],[1005,-2290],[965,-2500],[905,-2700],[850,-2880],[815,-2938]],{y0:0});
defRoad('Wüstenstraße','road',[[430,-2205],[320,-2285],[160,-2320],[-40,-2385],[-260,-2420],[-470,-2490],[-620,-2610],[-700,-2740],[-735,-2830]]);
defRoad('Flugfeldweg','road',[[640,-2392],[760,-2370],[850,-2330],[920,-2300],[1005,-2290]]);
defRoad('Bergstraße Mount Solara','dirt',[[140,-1430],[20,-1380],[-130,-1385],[-270,-1440],[-380,-1500],[-450,-1430],[-540,-1470],[-500,-1560],[-560,-1615],[-615,-1640]]);
defRoad('Hügelstraße','road',[[118,-940],[-40,-965],[-200,-950],[-330,-1010],[-410,-1110],[-540,-1060],[-690,-985],[-860,-930],[-1060,-950]]);
defRoad('Ölfeldweg','dirt',[[-40,-2385],[-20,-2600],[10,-2800],[30,-2980]]);
defRoad('Windparkweg','dirt',[[705,-2560],[840,-2585],[960,-2600],[1080,-2620]]);
defRoad('Vista-Mar-Allee','road',[[-950,190],[-960,300],[-970,420]]);
defRoad('Rostbach-Zufahrt','dirt',[[250,-2300],[245,-2240],[240,-2190]]);
// Fahrbahn ins Gelände schneiden (Damm/Einschnitt)
{const N2=TNX*TNZ,cD=new Float32Array(N2).fill(1e9),cY=new Float32Array(N2),cR=new Float32Array(N2);
 for(const r of ROADS){const fl=r.hw+r.sh,R=fl+92,P=r.pts;
  for(let k=0;k<P.length-1;k++){const a=P[k],b=P[k+1];const ex=b.x-a.x,ez=b.z-a.z,l2=ex*ex+ez*ez||1;
   const i0=Math.max(0,Math.floor((Math.min(a.x,b.x)-R-TX0)/TC)),i1=Math.min(TNX-1,Math.ceil((Math.max(a.x,b.x)+R-TX0)/TC)),j0=Math.max(0,Math.floor((Math.min(a.z,b.z)-R-TZ0)/TC)),j1=Math.min(TNZ-1,Math.ceil((Math.max(a.z,b.z)+R-TZ0)/TC));
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=TX0+i*TC,z=TZ0+j*TC;const t=clamp(((x-a.x)*ex+(z-a.z)*ez)/l2,0,1);const d=Math.hypot(x-a.x-ex*t,z-a.z-ez*t);const q=j*TNX+i;if(d<cD[q]){cD[q]=d;cY[q]=a.y+(b.y-a.y)*t;cR[q]=fl;}}}}
 for(let q=0;q<N2;q++){if(cD[q]>=1e9)continue;const d=cD[q],fl=cR[q];const bl=clamp(Math.abs(TH[q]-cY[q])*2.6,8,90);const w=d<=fl?1:1-sstep(fl,fl+bl,d);if(w>0)TH[q]=lerpN(TH[q],cY[q]-.05,w);}}
// Straßenabschnitte räumlich einsortieren (für exakte Fahrbahnhöhe)
const RGRID=new Map(),RG=32;
for(const r of ROADS){const P=r.pts;for(let k=0;k<P.length-1;k++){const a=P[k],b=P[k+1],m=r.hw+2;const seg={r,a,b,k};
 for(let gx=Math.floor((Math.min(a.x,b.x)-m)/RG);gx<=Math.floor((Math.max(a.x,b.x)+m)/RG);gx++)for(let gz=Math.floor((Math.min(a.z,b.z)-m)/RG);gz<=Math.floor((Math.max(a.z,b.z)+m)/RG);gz++){const key=gx*100003+gz;let L=RGRID.get(key);if(!L)RGRID.set(key,L=[]);L.push(seg);}}}
const TERR={};for(const k of ['grass','rock','sand','dirt']){const c=terrTex(k);TERR[k]=texOf(c);TERR[k+'N']=normalFromCanvas(c,k==='sand'?7:k==='rock'?5:k==='dirt'?4:3);}
TERR.mac=(()=>{const c=cvs(256,256,(g,w,h)=>{const img=g.createImageData(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;img.data[i]=fbm(x/38,y/38,4)*255;img.data[i+1]=fbm(x/13+50,y/13+50,3)*255;img.data[i+2]=fbm(x/90+9,y/90+9,2)*255;img.data[i+3]=255;}g.putImageData(img,0,0);});const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.NoColorSpace;return t;})();
const terrainMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.94,metalness:0,vertexColors:true,polygonOffset:true,polygonOffsetFactor:2,polygonOffsetUnits:4});
terrainMat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{tG:{value:TERR.grass},tR:{value:TERR.rock},tS:{value:TERR.sand},tD:{value:TERR.dirt},tGn:{value:TERR.grassN},tRn:{value:TERR.rockN},tSn:{value:TERR.sandN},tDn:{value:TERR.dirtN},tMac:{value:TERR.mac}});
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aSp;varying vec4 vSp;varying vec3 vWP;varying vec3 vWN;')
  .replace('#include <begin_vertex>','#include <begin_vertex>\nvSp=aSp;vWP=(modelMatrix*vec4(transformed,1.)).xyz;vWN=normalize(mat3(modelMatrix)*objectNormal);');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
uniform sampler2D tG,tR,tS,tD,tGn,tRn,tSn,tDn,tMac;varying vec4 vSp;varying vec3 vWP;varying vec3 vWN;
vec3 sN(vec3 v){float l=length(v);return l>1e-5?v/l:vec3(0.);}
vec3 tri(sampler2D t,vec3 p,vec3 a,float s){return texture2D(t,p.zy/s).rgb*a.x+texture2D(t,p.xz/s).rgb*a.y+texture2D(t,p.xy/s).rgb*a.z;}`)
 .replace('#include <map_fragment>',`
 vec2 wuv=vWP.xz;vec3 WN=normalize(vWN);vec3 an=pow(abs(WN),vec3(4.));an/=dot(an,vec3(1.));
 vec4 mc=texture2D(tMac,wuv/900.);vec4 mc2=texture2D(tMac,wuv/210.+.31);
 vec3 cG=mix(texture2D(tG,wuv/6.5).rgb,texture2D(tG,wuv/29.+.5).rgb,.4);
 vec3 cR=tri(tR,vWP,an,11.);
 vec3 cS=mix(texture2D(tS,wuv/5.).rgb,texture2D(tS,wuv/23.+.2).rgb,.35);
 vec3 cD=mix(texture2D(tD,wuv/6.).rgb,texture2D(tD,wuv/27.+.7).rgb,.35);
 vec4 w=vSp;float hR=dot(cR,vec3(.33)),hS=dot(cS,vec3(.33)),hD=dot(cD,vec3(.33)),hGr=dot(cG,vec3(.33));
 w*=vec4(.6+hGr,.6+hR,.6+hS,.6+hD);w=pow(w,vec4(2.2));w/=max(1e-4,dot(w,vec4(1.)));
 vec3 tcol=cG*w.x+cR*w.y+cS*w.z+cD*w.w;
 tcol*=mix(.74,1.2,mc.r)*mix(.86,1.1,mc2.g);float dryv=smoothstep(.45,.8,mc2.b)*w.x;tcol=mix(tcol,tcol*vec3(1.22,1.05,.62),dryv*.55);
 diffuseColor.rgb*=tcol;`)
 .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
 {vec3 nG=texture2D(tGn,wuv/6.5).xyz*2.-1.,nS=texture2D(tSn,wuv/5.).xyz*2.-1.,nD=texture2D(tDn,wuv/6.).xyz*2.-1.;
  vec3 n1=texture2D(tRn,vWP.zy/11.).xyz*2.-1.,n2=texture2D(tRn,vWP.xz/11.).xyz*2.-1.,n3=texture2D(tRn,vWP.xy/11.).xyz*2.-1.;
  vec3 T=sN(vec3(1.,0.,0.)-WN*WN.x),B=sN(vec3(0.,0.,1.)-WN*WN.z);
  vec3 nw=(T*nG.x+B*nG.y+WN*nG.z)*w.x+(T*nS.x+B*nS.y+WN*nS.z)*w.z+(T*nD.x+B*nD.y+WN*nD.z)*w.w;
  vec3 Ty=sN(vec3(0.,1.,0.)-WN*WN.y);
  nw+=((B*n1.x+Ty*n1.y+WN*n1.z)*an.x+(T*n2.x+B*n2.y+WN*n2.z)*an.y+(T*n3.x+Ty*n3.y+WN*n3.z)*an.z)*w.y;
  vec3 nwn=sN(nw);if(dot(nwn,nwn)<.5)nwn=WN;normal=normalize((viewMatrix*vec4(nwn,0.)).xyz);}`)
 .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(.97-w.z*.06-w.y*.1,.5,1.);');};
terrainMat.customProgramCacheKey=()=>'terrain-v1';
// Gelände-Kacheln bauen
const TCHUNK=48;const terrainChunks=[];const TGR=new Uint8Array(TNX*TNZ),TDRY=new Uint8Array(TNX*TNZ);
{const inCity=(x,z)=>x>-HALF-ROAD/2+1&&x<HALF+ROAD/2-1&&z>-HALF-ROAD/2+1&&z<COAST-1;const sp=[0,0,0,0],col=[0,0,0,0],nv=new THREE.Vector3();
 for(let cj=0;cj<TNZ-1;cj+=TCHUNK)for(let ci=0;ci<TNX-1;ci+=TCHUNK){const ni=Math.min(TCHUNK,TNX-1-ci),nj=Math.min(TCHUNK,TNZ-1-cj);
  let any=false;for(let j=0;j<=nj&&!any;j++)for(let i=0;i<=ni;i++){if(TH[(cj+j)*TNX+ci+i]>SEA_Y-2.5){any=true;break;}}if(!any)continue;
  const nvx=(ni+1)*(nj+1),pos=new Float32Array(nvx*3),nor=new Float32Array(nvx*3),spl=new Float32Array(nvx*4),cl=new Float32Array(nvx*3);
  for(let j=0;j<=nj;j++)for(let i=0;i<=ni;i++){const gi=ci+i,gj=cj+j,v=j*(ni+1)+i,x=TX0+gi*TC,z=TZ0+gj*TC,h=TH[gj*TNX+gi];pos[v*3]=x;pos[v*3+1]=h;pos[v*3+2]=z;
   nv.set(thAt(gi-1,gj)-thAt(gi+1,gj),2*TC,thAt(gi,gj-1)-thAt(gi,gj+1)).normalize();nor[v*3]=nv.x;nor[v*3+1]=nv.y;nor[v*3+2]=nv.z;
   terrSplat(x,z,h,nv.y,sp,col);spl.set(sp,v*4);cl[v*3]=col[0];cl[v*3+1]=col[1];cl[v*3+2]=col[2];TGR[gj*TNX+gi]=Math.min(255,sp[0]*255*(nv.y>.8?1:0))|0;TDRY[gj*TNX+gi]=Math.min(255,col[3]*255)|0;}
  const idx=[];for(let j=0;j<nj;j++)for(let i=0;i<ni;i++){const a=j*(ni+1)+i,b=a+1,c=a+ni+1,d=c+1;const x=TX0+(ci+i)*TC,z=TZ0+(cj+j)*TC;
   if(inCity(x,z)&&inCity(x+TC,z+TC))continue;const hm=Math.max(pos[a*3+1],pos[b*3+1],pos[c*3+1],pos[d*3+1]);if(hm<SEA_Y-2.5)continue;
   idx.push(a,c,d,a,d,b);}
  if(!idx.length)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('aSp',new THREE.BufferAttribute(spl,4));g.setAttribute('color',new THREE.BufferAttribute(cl,3));
  g.setIndex(idx);g.computeBoundingSphere();const m=new THREE.Mesh(g,terrainMat);m.receiveShadow=true;m.castShadow=true;scene.add(m);terrainChunks.push(m);}}
const ROADMAT={};for(const t of ['hw','road','dirt']){const c=roadTexCanvas(t);const tex=texOf(c);tex.anisotropy=16;ROADMAT[t]=M({map:tex,normalMap:normalFromCanvas(c,t==='dirt'?4:2.5),normalScale:new THREE.Vector2(.8,.8),roughness:t==='dirt'?.98:.86,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});}
const shoulderMat=M({map:(()=>{const t=TERR.dirt.clone();t.needsUpdate=true;return t;})(),color:0xb9a88e,roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
for(const r of ROADS){const tl=r.type==='hw'?36:r.type==='road'?30:24;roadRibbon(r,-r.hw,r.hw,.05,tl,ROADMAT[r.type]);
 if(r.type!=='dirt'){roadRibbon(r,r.hw,r.hw+2.6,.02,8,shoulderMat);roadRibbon(r,-r.hw-2.6,-r.hw,.02,8,shoulderMat);}}

// ================= VEGETATION: Bäume mit Rinde & einzelnen Blättern (Wind), Palmen, Kiefern, Büsche, Kakteen, Felsen =================
const VEGU={uTime:{value:0},uWind:{value:1}};
const vrand=mulberry32(5150);const VR=(a,b)=>a+vrand()*(b-a);
