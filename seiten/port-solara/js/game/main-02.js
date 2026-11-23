'use strict';
// ---------- Rinde: dunkel-/hellbraun, Risse, Moos ----------
const barkCanvas=(kind)=>cvs(256,512,(g,w,h)=>{const pal=kind==='palm'?['#6e5a44','#8a7458','#a58e6c','#4c3d2e']:kind==='birch'?['#d9d4c8','#efe9dc','#b9b2a3','#2b2622']:['#3d2c1f','#5b4330','#7d6146','#2a1d14'];
 g.fillStyle=pal[1];g.fillRect(0,0,w,h);
 if(kind==='palm'){for(let y=0;y<h;y+=18+Math.random()*6){g.fillStyle=pal[3];g.globalAlpha=.75;g.fillRect(0,y,w,3+Math.random()*3);g.globalAlpha=.35;g.fillStyle=pal[2];g.fillRect(0,y+4,w,6);g.globalAlpha=1;
   for(let x=0;x<w;x+=10+Math.random()*12){g.fillStyle=pal[3];g.globalAlpha=.4;g.fillRect(x,y-8,2,10);g.globalAlpha=1;}}
  for(let i=0;i<900;i++){g.fillStyle=Math.random()<.5?pal[0]:pal[2];g.globalAlpha=.25;g.fillRect(Math.random()*w,Math.random()*h,2,3);}g.globalAlpha=1;}
 else if(kind==='birch'){for(let i=0;i<700;i++){g.fillStyle=Math.random()<.5?pal[0]:pal[2];g.globalAlpha=.3;g.fillRect(Math.random()*w,Math.random()*h,3,1);}
  for(let i=0;i<70;i++){const y=Math.random()*h,x=Math.random()*w,l=8+Math.random()*30;g.fillStyle=pal[3];g.globalAlpha=.75;g.fillRect(x,y,l,2+Math.random()*3);g.globalAlpha=1;}}
 else{for(let x=0;x<w;x+=2){const v=Math.random();g.fillStyle=v<.5?pal[0]:pal[2];g.globalAlpha=.25;g.fillRect(x,0,2,h);g.globalAlpha=1;}
  for(let i=0;i<46;i++){let x=Math.random()*w,y=Math.random()*h-h*.3;const len=60+Math.random()*220;g.strokeStyle=pal[3];g.lineWidth=2+Math.random()*4;g.globalAlpha=.85;g.beginPath();g.moveTo(x,y);
   for(let s=0;s<len;s+=10){x+=(Math.random()-.5)*7;y+=10;g.lineTo(x,y);}g.stroke();g.strokeStyle=pal[2];g.lineWidth=1.2;g.globalAlpha=.5;g.beginPath();g.moveTo(x+4,y-len);g.lineTo(x+4,y);g.stroke();g.globalAlpha=1;}
  for(let i=0;i<1600;i++){g.fillStyle=Math.random()<.5?pal[0]:pal[2];g.globalAlpha=.3;g.fillRect(Math.random()*w,Math.random()*h,2,2+Math.random()*4);}g.globalAlpha=1;
  // Moos & Flechten
  for(let i=0;i<9;i++){const cx=Math.random()*w*.6,cy=h*.35+Math.random()*h*.65,r=14+Math.random()*34;for(let k=0;k<180;k++){const a=Math.random()*6.28,d=Math.random()*r;g.fillStyle=['#55692b','#6d7f35','#3f5221','#8a9a4a'][k%4];g.globalAlpha=.55*(1-d/r);g.fillRect(cx+Math.cos(a)*d,cy+Math.sin(a)*d*1.6,2+Math.random()*3,2+Math.random()*3);}}
  for(let i=0;i<40;i++){g.fillStyle='#a6ae95';g.globalAlpha=.5;g.beginPath();g.arc(Math.random()*w,Math.random()*h,1+Math.random()*3,0,7);g.fill();}g.globalAlpha=1;}});
const BARK={};for(const k of ['oak','palm','birch']){const c=barkCanvas(k);BARK[k]=M({map:texOf(c),normalMap:normalFromCanvas(c,k==='palm'?3:4.5),normalScale:new THREE.Vector2(1.3,1.3),roughness:.96});}
const LEAF={meadow:leafMaterial('meadow',83,0xffffff,{bend:.9,amp:1.4,trans:.06,ao:.55}),broad:[leafMaterial('broad',11),leafMaterial('broad',23,0xdcefc0)],birch:leafMaterial('birch',37),needle:leafMaterial('needle',41,0xffffff,{bend:.6}),palm:leafMaterial('palm',53,0xffffff,{bend:.45,amp:.8}),
 dry:leafMaterial('dry',61),bush:leafMaterial('bush',67),grass:leafMaterial('grass',71,0xffffff,{bend:.9,amp:1.4,trans:.06,ao:.55}),drygrass:leafMaterial('drygrass',79,0xffffff,{bend:.9,amp:1.2,trans:.05,ao:.5})};
// ---------- Sammellisten für Instanzen (nach Gebiet, damit Frustum-Culling greift) ----------
const VEG={},VCH=260,vCol=new THREE.Color(),vegLodGroups=[];
const cardGeo=(()=>{const g=new THREE.PlaneGeometry(1,1,1,2);g.translate(0,.5,0);return g;})();
const frondGeo=(()=>{const g=new THREE.PlaneGeometry(1.4,5,2,12);g.rotateX(Math.PI/2);g.translate(0,0,2.5);const p=g.attributes.position;for(let i=0;i<p.count;i++){const z=p.getZ(i),x=p.getX(i);const t=z/5;p.setY(i,Math.sin(t*1.5)*1.1-t*t*2.2+Math.abs(x)*.25*t);p.setX(i,x*(1-.35*t));}g.computeVertexNormals();return g;})();
const vM=new THREE.Matrix4(),vQ=new THREE.Quaternion(),vE=new THREE.Euler(),vS=new THREE.Vector3(),vP=new THREE.Vector3(),vN=new THREE.Vector3();
const tint=(base,ao)=>{const v=VR(.82,1.12);return vCol.setRGB(base[0]*v*ao,base[1]*v*ao*VR(.96,1.04),base[2]*v*ao);};
// ---------- Wüste: Kakteen & Felsen ----------
const cactusMat=(()=>{const c=cvs(256,256,(g,w,h)=>{g.fillStyle='#4f7a3a';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=16){const gr=g.createLinearGradient(x,0,x+16,0);gr.addColorStop(0,'#2f4f24');gr.addColorStop(.5,'#6f9a52');gr.addColorStop(1,'#2f4f24');g.fillStyle=gr;g.fillRect(x,0,16,h);}
 for(let i=0;i<500;i++){g.fillStyle=Math.random()<.5?'#e8e0b8':'#c9c09a';const x=Math.floor(Math.random()*16)*16+8,y=Math.random()*h;g.fillRect(x-1,y,2,2);g.globalAlpha=.6;g.fillRect(x-4,y-1,3,1);g.fillRect(x+2,y-1,3,1);g.globalAlpha=1;}});
 return M({map:texOf(c),normalMap:normalFromCanvas(c,5),roughness:.75});})();
const rockMat=(()=>{const c=cvs(256,256,(g,w,h)=>{noiseFill(g,w,h,'#9a7f63',.35,12000,3);for(let i=0;i<30;i++){g.strokeStyle='rgba(40,28,18,.5)';g.lineWidth=1+Math.random()*2;g.beginPath();let x=Math.random()*w,y=Math.random()*h;g.moveTo(x,y);for(let k=0;k<8;k++){x+=(Math.random()-.5)*40;y+=(Math.random()-.5)*40;g.lineTo(x,y);}g.stroke();}
 for(let y=0;y<h;y+=6){g.fillStyle=`rgba(${Math.random()<.5?60:200},${Math.random()<.5?40:170},30,.08)`;g.fillRect(0,y,w,3);}});return M({map:texOf(c,[2,2]),normalMap:normalFromCanvas(c,6),roughness:.95});})();
const rockGeos=[0,1,2,3].map(k=>{const g=new THREE.IcosahedronGeometry(1,2);const p=g.attributes.position;const rr=mulberry32(900+k);const ph=[rr()*9,rr()*9,rr()*9];
 for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i);const n=1+.22*Math.sin(v.x*2.3+ph[0])*Math.sin(v.y*2.9+ph[1])+.12*Math.sin(v.z*5.1+ph[2])+.06*Math.sin(v.x*11+v.z*9);v.multiplyScalar(n);v.y=v.y<0?v.y*.35:v.y*.85;p.setXYZ(i,v.x,v.y,v.z);}
 g.computeVertexNormals();return g;});

// ---------- Dynamisches Gras rund um die Kamera (Wiesen, Hügel, Steppe) ----------
const GRASS={ims:[],ax:1e9,az:1e9,cap:0,hidden:false};

// ================= WASSER: Wellen, Tiefenfarben, Glitzern, Gischt =================
// Feine Wellen-Normalen (kachelbar) und Rauschen für Schaum
const waterNormTex=(()=>{const s=512,c=document.createElement('canvas');c.width=c.height=s;const g=c.getContext('2d'),img=g.createImageData(s,s);const W=[];const rr=mulberry32(4711);
 for(let k=0;k<26;k++){const a=rr()*Math.PI*2,f=Math.round(2+rr()*rr()*30);W.push([Math.round(Math.cos(a)*f),Math.round(Math.sin(a)*f),rr()*6.28,1/(f*.35+1)]);}
 const H=new Float32Array(s*s);for(let y=0;y<s;y++)for(let x=0;x<s;x++){let h=0;for(const w of W)h+=Math.sin((w[0]*x+w[1]*y)/s*6.2831853+w[2])*w[3];H[y*s+x]=h;}
 for(let y=0;y<s;y++)for(let x=0;x<s;x++){const hx=H[y*s+((x+1)%s)]-H[y*s+((x-1+s)%s)],hy=H[((y+1)%s)*s+x]-H[((y-1+s)%s)*s+x];let nx=-hx*1.6,ny=-hy*1.6,nz=1;const l=Math.hypot(nx,ny,nz);const i=(y*s+x)*4;img.data[i]=(nx/l*.5+.5)*255;img.data[i+1]=(ny/l*.5+.5)*255;img.data[i+2]=(nz/l*.5+.5)*255;img.data[i+3]=255;}
 g.putImageData(img,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.NoColorSpace;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;return t;})();
const waterNoiseTex=(()=>{const s=256,c=document.createElement('canvas');c.width=c.height=s;const g=c.getContext('2d'),img=g.createImageData(s,s);const rr=mulberry32(99);
 const grid=new Float32Array(17*17);for(let i=0;i<grid.length;i++)grid[i]=rr();const gv=(x,y)=>grid[(y%16)*17+(x%16)];
 const vn=(x,y,f)=>{const X=x*f/s,Y=y*f/s,ix=Math.floor(X),iy=Math.floor(Y),fx=X-ix,fy=Y-iy,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);const m=16/f*f;const a=gv(ix%16,iy%16),b=gv((ix+1)%16,iy%16),cc=gv(ix%16,(iy+1)%16),d=gv((ix+1)%16,(iy+1)%16);return a+(b-a)*sx+(cc-a)*sy+(a-b-cc+d)*sx*sy;};
 for(let y=0;y<s;y++)for(let x=0;x<s;x++){let v=vn(x,y,4)*.5+vn(x,y,8)*.3+vn(x,y,16)*.2;v=Math.pow(v,1.6);const i=(y*s+x)*4;img.data[i]=img.data[i+1]=img.data[i+2]=v*255;img.data[i+3]=255;}
 g.putImageData(img,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.NoColorSpace;return t;})();
// Wassertiefe als Textur (wird nach dem Bau des Geländes neu berechnet)
const WDEPTH={x0:-1900,z0:-4000,x1:2000,z1:1700,n:1024,data:null,tex:null};
bakeWaterDepth();
const WATER_UNI={uTime:{value:0},uSunDir:{value:new THREE.Vector3(.3,.8,.2)},uSunCol:{value:new THREE.Color(1,.97,.9)},uSkyH:{value:new THREE.Color(.62,.74,.86)},uSkyZ:{value:new THREE.Color(.16,.33,.68)},
 uNorm:{value:waterNormTex},uNoise:{value:waterNoiseTex},uDepth:{value:WDEPTH.tex},uDepthBox:{value:new THREE.Vector4(WDEPTH.x0,WDEPTH.z0,WDEPTH.x1,WDEPTH.z1)},uNight:{value:0},uCam:{value:new THREE.Vector2()}};
const WATER_VS=`
uniform float uTime,uAmp,uFade,uConstDepth;uniform sampler2D uDepth;uniform vec4 uDepthBox;uniform vec2 uCam;
varying vec3 vW;varying vec3 vN;varying float vDepth;varying float vCrest;
#include <fog_pars_vertex>
vec3 gerst(vec2 d,float steep,float wl,vec3 p,inout vec3 T,inout vec3 Bn,float amp){
 float k=6.2831853/wl;float c=sqrt(9.8/k);d=normalize(d);float f=k*(dot(d,p.xz)-c*uTime);float st=steep*amp;float a=st/k;float s=sin(f),co=cos(f);
 T+=vec3(-d.x*d.x*st*s,d.x*st*co,-d.x*d.y*st*s);Bn+=vec3(-d.x*d.y*st*s,d.y*st*co,-d.y*d.y*st*s);return vec3(d.x*a*co,a*s,d.y*a*co);}
void main(){
 vec4 wp=modelMatrix*vec4(position,1.0);vec3 p=wp.xyz;
 float depth=uConstDepth;
 float calm=0.0;
 if(uConstDepth<0.0){vec2 duv=(p.xz-uDepthBox.xy)/(uDepthBox.zw-uDepthBox.xy);vec4 dt4=texture2D(uDepth,duv);depth=dt4.r*48.0;calm=dt4.b;}
 vDepth=depth;
 float amp=uAmp*(1.0-calm*.9)*smoothstep(0.0,7.0,depth)*(1.0-smoothstep(uFade*0.72,uFade,distance(p.xz,uCam)));
 vec3 T=vec3(1.0,0.0,0.0),Bn=vec3(0.0,0.0,1.0),o=vec3(0.0);
 o+=gerst(vec2(1.0,.35),.15,64.0,p,T,Bn,amp);o+=gerst(vec2(.55,1.0),.12,33.0,p,T,Bn,amp);
 o+=gerst(vec2(-.45,.9),.10,19.0,p,T,Bn,amp);o+=gerst(vec2(.95,-.3),.07,9.5,p,T,Bn,amp);o+=gerst(vec2(-.8,-.5),.05,5.3,p,T,Bn,amp*.8);
 p+=o;vCrest=o.y/max(amp,.05);vN=normalize(cross(Bn,T));vW=p;
 vec4 mvPosition=viewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;
 #include <fog_vertex>
}`;
const WATER_FS=`
uniform float uTime,uNight,uHole,uTint,uFragDepth;uniform vec3 uSunDir,uSunCol,uSkyH,uSkyZ;uniform sampler2D uNorm,uNoise,uDepth;uniform vec4 uDepthBox;uniform vec2 uCam;uniform vec3 uShallow,uMid,uDeep;
varying vec3 vW;varying vec3 vN;varying float vDepth;varying float vCrest;
#include <fog_pars_fragment>
vec2 nrm(vec2 uv){return texture2D(uNorm,uv).xy*2.0-1.0;}
void main(){
 float dpt=vDepth;
 if(uFragDepth>.5){vec2 duv=(vW.xz-uDepthBox.xy)/(uDepthBox.zw-uDepthBox.xy);dpt=(duv.x<0.0||duv.y<0.0||duv.x>1.0||duv.y>1.0)?48.0:texture2D(uDepth,duv).r*48.0;}
 if(dpt<0.015)discard;
 if(uHole>0.0&&max(abs(vW.x-uCam.x),abs(vW.z-uCam.y))<uHole)discard;
 vec3 V=normalize(cameraPosition-vW);float dist=length(cameraPosition-vW);
 vec2 uv=vW.xz;
 vec2 n1=nrm(uv*.019+vec2(uTime*.011,uTime*.007)),n2=nrm(uv*.043+vec2(-uTime*.016,uTime*.012)),n3=nrm(uv*.11+vec2(uTime*.028,-uTime*.021)),n4=nrm(uv*.31+vec2(-uTime*.05,-uTime*.04));
 float detail=mix(1.0,.35,smoothstep(80.0,900.0,dist));
 vec2 dn=(n1*.9+n2*.7+n3*.5+n4*.3*smoothstep(160.0,20.0,dist))*detail;
 vec3 N=normalize(vN+vec3(dn.x,0.0,dn.y)*.42);
 float ndv=max(dot(N,V),0.0);float fres=.02+.98*pow(1.0-ndv,5.0);
 vec3 R=reflect(-V,N);R.y=abs(R.y);
 vec3 sky=mix(uSkyH,uSkyZ,smoothstep(0.0,.55,R.y));
 float d=dpt;
 vec3 wc=mix(uShallow,uMid,smoothstep(.2,5.0,d));wc=mix(wc,uDeep,smoothstep(4.0,40.0,d));
 float sunUp=smoothstep(-.05,.15,uSunDir.y);
 float diff=max(dot(N,uSunDir),0.0)*.45+.55;
 vec3 col=wc*(diff*uSunCol*(.18+.5*sunUp)+uSkyZ*.35);
 col+=vec3(.015,.11,.10)*smoothstep(.15,.85,vCrest)*sunUp*uTint;
 col=mix(col,sky*(1.0-.25*uNight),fres*.92);
 vec3 H=normalize(uSunDir+V);float nh=max(dot(N,H),0.0);
 float glit=pow(nh,2200.0)*90.0*smoothstep(.4,.9,texture2D(uNoise,uv*.9+uTime*.07).r);
 float spec=pow(nh,220.0)*3.0+pow(nh,1100.0)*24.0+glit;
 col+=uSunCol*spec*(sunUp*1.0+uNight*.25);
 float nz=texture2D(uNoise,uv*.08+vec2(uTime*.013,0.0)).r,nz2=texture2D(uNoise,uv*.31-vec2(0.0,uTime*.05)).r;
 float shore=smoothstep(.42,0.0,d);
 float band=.5+.5*sin(d*24.0-uTime*2.2+nz*5.0);
 float foam=shore*smoothstep(.5,.85,band*.6+nz2*.7)+smoothstep(.75,1.0,vCrest)*smoothstep(.62,.9,nz2)*.35;
 foam=clamp(foam,0.0,1.0)*(1.0-smoothstep(300.0,900.0,dist));
 col=mix(col,vec3(.82,.88,.9)*(diff*(.3+.7*sunUp)+.12),foam);
 gl_FragColor=vec4(col,1.0);
 #include <fog_fragment>
}`;
const oceanMat=makeWaterMat({fade:700}),oceanFarMat=makeWaterMat({amp:0,hole:690,fragDepth:1});
const waterMat=makeWaterMat({amp:.15,depth:2.2,shallow:0x2a9c9c,mid:0x1a6a80,deep:0x0a3a55});
const poolMat=makeWaterMat({amp:0,depth:1.6,shallow:0x5fe0f0,mid:0x2ab0d8,deep:0x1388c0,tint:0});

const oceanNear=new THREE.Mesh((()=>{const g=new THREE.PlaneGeometry(1400,1400,224,224);g.rotateX(-Math.PI/2);return g;})(),oceanMat);oceanNear.frustumCulled=false;oceanNear.position.y=SEA_Y;scene.add(oceanNear);
const oceanFar=new THREE.Mesh((()=>{const g=new THREE.PlaneGeometry(24000,24000,6,6);g.rotateX(-Math.PI/2);return g;})(),oceanFarMat);oceanFar.frustumCulled=false;oceanFar.position.y=SEA_Y-.02;scene.add(oceanFar);
const OCEAN_STEP=1400/224;
// Wellenhöhe auf der CPU (dieselben Gerstner-Wellen wie im Shader) – Boote reiten auf den Wellen
const GWAVES=[[1,.35,.15,64,1],[.55,1,.12,33,1],[-.45,.9,.10,19,1],[.95,-.3,.07,9.5,1],[-.8,-.5,.05,5.3,.8]].map(([x,z,st,wl,m])=>{const l=Math.hypot(x,z),k=6.2831853/wl;return {dx:x/l,dz:z/l,st:st*m,k,c:Math.sqrt(9.8/k)};});

// ================= INNENRÄUME: Materialien, Baukasten, Türen, Innenlicht =================
// Begehbare Gebäude: Wände mit Tür-/Tor-/Fensteröffnungen (Außenhaut + Innenputz), Böden, Decken,
// automatische Türen (Schiebe-, Dreh-, Rolltor), ein fester Pool aus Punktlichtern für das Innenlicht,
// Kontaktschatten unter Möbeln und eine große Möbel-Bibliothek. Alles Statische wird zusammengefasst (addStatic).
const IF=.36;// Boden-Oberkante in Innenräumen
const IRND=mulberry32(9137);const ir=(a,b)=>a+IRND()*(b-a);
const IT={
 oak:itx(256,256,(g,w,h)=>grain(g,w,h,'#b98b58','92,58,28','222,180,130',90)),
 walnut:itx(256,256,(g,w,h)=>grain(g,w,h,'#5b3a22','30,18,8','140,95,60',90)),
 white:itx(128,128,(g,w,h)=>noiseFill(g,w,h,'#f1efea',.05,2500,2)),
 parquet:itx(512,512,(g,w,h)=>{const pw=64,ph=512/4;for(let r=0;r<8;r++)for(let c=0;c<4;c++){const x=c*128+(r%2)*64,y=r*64;const v=IRND()*36-18;g.fillStyle=`rgb(${168+v},${120+v*.8},${78+v*.6})`;g.fillRect(x%512,y,128,64);if(x+128>512){g.fillRect(x-512,y,128,64);}
  for(let i=0;i<10;i++){g.strokeStyle=`rgba(80,45,20,${.08+IRND()*.12})`;g.lineWidth=1+IRND();const yy=y+6+IRND()*52;g.beginPath();g.moveTo(x%512,yy);g.bezierCurveTo((x%512)+40,yy+IRND()*4-2,(x%512)+80,yy+IRND()*4-2,(x%512)+128,yy);g.stroke();}}
  g.strokeStyle='rgba(40,22,10,.55)';g.lineWidth=2;for(let r=0;r<=8;r++){g.beginPath();g.moveTo(0,r*64);g.lineTo(512,r*64);g.stroke();for(let c=0;c<5;c++){const x=(c*128+(r%2)*64)%512;g.beginPath();g.moveTo(x,r*64);g.lineTo(x,r*64+64);g.stroke();}}}),
 tiles:itx(256,256,(g,w,h)=>{for(let y=0;y<2;y++)for(let x=0;x<2;x++){const v=IRND()*14;g.fillStyle=`rgb(${214+v},${210+v},${202+v})`;g.fillRect(x*128,y*128,128,128);for(let i=0;i<400;i++){g.fillStyle=`rgba(120,110,100,${IRND()*.08})`;g.fillRect(x*128+IRND()*128,y*128+IRND()*128,3,3);}}
  g.strokeStyle='#8f8a82';g.lineWidth=3;for(let i=0;i<=2;i++){g.beginPath();g.moveTo(i*128,0);g.lineTo(i*128,256);g.moveTo(0,i*128);g.lineTo(256,i*128);g.stroke();}}),
 checker:itx(256,256,(g,w,h)=>{for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.fillStyle=(x+y)%2?'#1c1c1e':'#ecebe6';g.fillRect(x*64,y*64,64,64);}for(let i=0;i<1500;i++){g.fillStyle=`rgba(128,128,128,${IRND()*.08})`;g.fillRect(IRND()*256,IRND()*256,2,2);}g.strokeStyle='rgba(90,90,90,.5)';g.lineWidth=1.5;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*64,0);g.lineTo(i*64,256);g.moveTo(0,i*64);g.lineTo(256,i*64);g.stroke();}}),
 wtile:itx(128,128,(g,w,h)=>{g.fillStyle='#f4f4f2';g.fillRect(0,0,w,h);for(let y=0;y<4;y++)for(let x=0;x<4;x++){const v=IRND()*8;g.fillStyle=`rgb(${236+v},${238+v},${238+v})`;g.fillRect(x*32+1,y*32+1,30,30);}g.strokeStyle='#c9cbcc';g.lineWidth=2;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*32,0);g.lineTo(i*32,128);g.moveTo(0,i*32);g.lineTo(128,i*32);g.stroke();}}),
 marble:itx(512,512,(g,w,h)=>{g.fillStyle='#ece8e1';g.fillRect(0,0,w,h);for(let i=0;i<2500;i++){g.fillStyle=`rgba(150,140,130,${IRND()*.06})`;g.fillRect(IRND()*w,IRND()*h,4,4);}
  for(let i=0;i<14;i++){let x=IRND()*w,y=IRND()*h;g.strokeStyle=`rgba(${110+IRND()*40|0},${105+IRND()*40|0},${100+IRND()*40|0},${.15+IRND()*.35})`;g.lineWidth=.6+IRND()*2.2;g.beginPath();g.moveTo(x,y);for(let k=0;k<12;k++){x+=IRND()*60-20;y+=IRND()*60-30;g.lineTo(x,y);}g.stroke();}
  g.strokeStyle='rgba(160,150,140,.55)';g.lineWidth=2;for(let i=0;i<=2;i++){g.beginPath();g.moveTo(i*256,0);g.lineTo(i*256,512);g.moveTo(0,i*256);g.lineTo(512,i*256);g.stroke();}}),
 marbleD:itx(256,256,(g,w,h)=>{g.fillStyle='#1e2a26';g.fillRect(0,0,w,h);for(let i=0;i<10;i++){let x=IRND()*w,y=IRND()*h;g.strokeStyle=`rgba(${190+IRND()*40|0},${200+IRND()*40|0},${190},${.12+IRND()*.3})`;g.lineWidth=.5+IRND()*1.6;g.beginPath();g.moveTo(x,y);for(let k=0;k<10;k++){x+=IRND()*40-14;y+=IRND()*40-20;g.lineTo(x,y);}g.stroke();}}),
 carpetR:itx(256,256,(g,w,h)=>{noiseFill(g,w,h,'#7d1620',.12,9000,2);g.strokeStyle='rgba(220,170,70,.55)';g.lineWidth=5;g.strokeRect(14,14,228,228);g.lineWidth=2;g.strokeRect(26,26,204,204);g.beginPath();g.moveTo(128,40);g.lineTo(216,128);g.lineTo(128,216);g.lineTo(40,128);g.closePath();g.stroke();}),
 carpetG:itx(128,128,(g,w,h)=>noiseFill(g,w,h,'#4a5560',.18,6000,2)),
 rug:itx(256,256,(g,w,h)=>{noiseFill(g,w,h,'#c9b79a',.12,7000,2);g.fillStyle='#8a3a2a';g.fillRect(12,12,232,10);g.fillRect(12,234,232,10);g.fillRect(12,12,10,232);g.fillRect(234,12,10,232);g.strokeStyle='#2f4a5a';g.lineWidth=4;for(let k=0;k<5;k++){g.beginPath();g.moveTo(40,60+k*34);for(let x=40;x<=216;x+=22)g.lineTo(x,60+k*34+((x/22)%2?9:-9));g.stroke();}}),
 fabric:itx(128,128,(g,w,h)=>{g.fillStyle='#bdbdbd';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=2){g.fillStyle=`rgba(0,0,0,${.03+IRND()*.05})`;g.fillRect(0,y,w,1);}for(let x=0;x<w;x+=2){g.fillStyle=`rgba(255,255,255,${.02+IRND()*.05})`;g.fillRect(x,0,1,h);}}),
 leather:itx(128,128,(g,w,h)=>{noiseFill(g,w,h,'#d0d0d0',.1,3000,2);for(let i=0;i<60;i++){g.strokeStyle=`rgba(0,0,0,${IRND()*.12})`;g.lineWidth=1;g.beginPath();const x=IRND()*w,y=IRND()*h;g.moveTo(x,y);g.quadraticCurveTo(x+IRND()*20-10,y+IRND()*20-10,x+IRND()*30-15,y+IRND()*30-15);g.stroke();}}),
 brushed:itx(256,64,(g,w,h)=>{g.fillStyle='#b9bdc2';g.fillRect(0,0,w,h);for(let i=0;i<500;i++){g.fillStyle=`rgba(${IRND()<.5?'255,255,255':'0,0,0'},${.03+IRND()*.05})`;g.fillRect(0,IRND()*h,w,1);}}),
 concrete:itx(512,512,(g,w,h)=>{noiseFill(g,w,h,'#8f8d88',.12,26000,2);for(let i=0;i<5;i++){const x=IRND()*w,y=IRND()*h,r=14+IRND()*50;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(30,26,20,${.1+IRND()*.16})`);gr.addColorStop(1,'rgba(20,18,14,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
  g.strokeStyle='rgba(50,48,44,.6)';g.lineWidth=2;g.beginPath();g.moveTo(256,0);g.lineTo(256,512);g.moveTo(0,256);g.lineTo(512,256);g.stroke();for(let i=0;i<5;i++){g.strokeStyle='rgba(40,38,34,.3)';g.lineWidth=1;g.beginPath();let x=IRND()*w,y=IRND()*h;g.moveTo(x,y);for(let k=0;k<6;k++){x+=IRND()*30-15;y+=IRND()*30-15;g.lineTo(x,y);}g.stroke();}}),
 plaster:itx(256,256,(g,w,h)=>{noiseFill(g,w,h,'#f6f4ef',.05,9000,3);for(let i=0;i<20;i++){g.fillStyle=`rgba(0,0,0,${IRND()*.03})`;g.beginPath();g.arc(IRND()*w,IRND()*h,10+IRND()*40,0,7);g.fill();}}),
 brick:itx(256,256,(g,w,h)=>{g.fillStyle='#b9b2a6';g.fillRect(0,0,w,h);for(let r=0;r<8;r++)for(let c=-1;c<5;c++){const v=IRND()*40-20;g.fillStyle=`rgb(${150+v},${68+v*.6},${48+v*.4})`;g.fillRect(c*64+(r%2)*32+2,r*32+2,60,28);}for(let i=0;i<1600;i++){g.fillStyle=`rgba(0,0,0,${IRND()*.1})`;g.fillRect(IRND()*w,IRND()*h,2,2);}}),
 pegboard:itx(128,128,(g,w,h)=>{g.fillStyle='#c9a57a';g.fillRect(0,0,w,h);for(let y=8;y<h;y+=16)for(let x=8;x<w;x+=16){g.fillStyle='#3a2a1a';g.beginPath();g.arc(x,y,2.2,0,7);g.fill();}}),
 deposit:itx(256,256,(g,w,h)=>{g.fillStyle='#8c9196';g.fillRect(0,0,w,h);let n=101;for(let y=0;y<4;y++)for(let x=0;x<4;x++){const X=x*64,Y=y*64;const gr=g.createLinearGradient(X,Y,X+64,Y+64);gr.addColorStop(0,'#c9ced3');gr.addColorStop(1,'#8f959b');g.fillStyle=gr;g.fillRect(X+3,Y+3,58,58);g.strokeStyle='#4a4f55';g.lineWidth=2;g.strokeRect(X+3,Y+3,58,58);
  g.fillStyle='#2a2d31';g.beginPath();g.arc(X+46,Y+32,4,0,7);g.fill();g.fillRect(X+45,Y+32,2,7);g.fillStyle='#e8e2c8';g.fillRect(X+10,Y+10,22,10);g.fillStyle='#222';g.font='bold 9px Arial';g.fillText(String(n++),X+12,Y+18);}}),
 cash:itx(128,64,(g,w,h)=>{for(let x=0;x<w;x+=32){g.fillStyle='#4d7a4a';g.fillRect(x,0,30,h);g.fillStyle='#d8e4c4';g.fillRect(x+3,6,24,h-12);g.fillStyle='#4d7a4a';g.beginPath();g.arc(x+15,h/2,8,0,7);g.fill();g.fillStyle='#c9a84a';g.fillRect(x,h/2-5,30,10);}}),
 books:itx(256,128,(g,w,h)=>{g.fillStyle='#2a1c12';g.fillRect(0,0,w,h);let x=2;while(x<w-4){const bw=6+IRND()*12,bh=h*(.68+IRND()*.3);const c=['#8a1c1c','#1c3a8a','#2a6a3a','#c9a227','#5a2a6a','#d8d0c0','#2a2a2a','#a0522d','#1f6f7a'][IRND()*9|0];g.fillStyle=c;g.fillRect(x,h-bh,bw,bh);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x+1,h-bh+4,bw-2,2);g.fillRect(x+1,h-12,bw-2,2);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+bw-1.5,h-bh,1.5,bh);x+=bw+.6;if(IRND()<.06)x+=10;}}),
 art1:itx(256,192,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#f2a65a');gr.addColorStop(.55,'#e05a47');gr.addColorStop(1,'#2a1d3a');g.fillStyle=gr;g.fillRect(0,0,w,h);g.fillStyle='#ffd27a';g.beginPath();g.arc(w*.62,h*.5,26,0,7);g.fill();g.fillStyle='#1b1428';for(let x=0;x<w;x+=18){const hh=30+IRND()*60;g.fillRect(x,h-hh,14,hh);}g.fillStyle='rgba(30,60,90,.7)';g.fillRect(0,h*.86,w,h*.14);}),
 art2:itx(192,256,(g,w,h)=>{g.fillStyle='#e9e4d8';g.fillRect(0,0,w,h);for(let i=0;i<9;i++){g.fillStyle=['#1f5fbf','#d64541','#f1c40f','#111','#2a9d8f'][i%5];g.globalAlpha=.85;g.fillRect(IRND()*w*.7,IRND()*h*.75,20+IRND()*70,20+IRND()*90);}g.globalAlpha=1;g.strokeStyle='#111';g.lineWidth=5;for(let i=0;i<4;i++){g.beginPath();g.moveTo(0,IRND()*h);g.lineTo(w,IRND()*h);g.stroke();}}),
 car1:itx(256,192,(g,w,h)=>{g.fillStyle='#101418';g.fillRect(0,0,w,h);const gr=g.createLinearGradient(0,h*.4,0,h);gr.addColorStop(0,'#ff7a1a');gr.addColorStop(1,'#7a2a05');g.fillStyle=gr;g.beginPath();g.moveTo(30,140);g.lineTo(60,105);g.lineTo(120,90);g.lineTo(180,100);g.lineTo(226,125);g.lineTo(230,145);g.lineTo(30,148);g.closePath();g.fill();g.fillStyle='#111';for(const x of [75,190]){g.beginPath();g.arc(x,148,17,0,7);g.fill();g.fillStyle='#888';g.beginPath();g.arc(x,148,8,0,7);g.fill();g.fillStyle='#111';}g.fillStyle='#9fd0ff';g.beginPath();g.moveTo(92,104);g.lineTo(122,94);g.lineTo(160,99);g.lineTo(150,110);g.lineTo(96,112);g.closePath();g.fill();g.fillStyle='#ffb347';g.font='bold 22px Arial';g.fillText('MILAS',12,30);g.fillStyle='#fff';g.font='12px Arial';g.fillText('Tuning · Service · Lack',12,48);}),
 cal:itx(160,224,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='#2a6a9a';g.fillRect(0,0,w,90);g.fillStyle='#ffd27a';g.beginPath();g.arc(110,45,22,0,7);g.fill();g.fillStyle='#174a6a';g.beginPath();g.moveTo(0,90);g.lineTo(60,40);g.lineTo(110,90);g.closePath();g.fill();g.fillStyle='#c0392b';g.font='bold 18px Arial';g.fillText('NOVEMBER',10,112);g.fillStyle='#333';g.font='11px Arial';for(let d=0;d<30;d++)g.fillText(String(d+1),12+(d%7)*20,132+(d/7|0)*18);}),
 screenPC:itx(256,160,(g,w,h)=>{g.fillStyle='#0f2236';g.fillRect(0,0,w,h);g.fillStyle='#1d4a7a';g.fillRect(0,0,w,14);g.fillStyle='#fff';g.font='9px Arial';g.fillText('SOLARA BANK · Kundenkonto',6,10);for(let i=0;i<9;i++){g.fillStyle=i%2?'#163a5c':'#1a4268';g.fillRect(8,22+i*14,w-16,12);g.fillStyle='#bcd8f0';g.fillText('Konto '+(48210+i*317)+'   € '+(Math.random()*90000|0).toLocaleString('de-DE'),12,31+i*14);}}),
 screenTV:itx(256,144,(g,w,h)=>{const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#2b5876');gr.addColorStop(1,'#4e4376');g.fillStyle=gr;g.fillRect(0,0,w,h);g.fillStyle='#ffd23a';g.beginPath();g.arc(70,60,26,0,7);g.fill();g.fillStyle='#1a1a2a';g.fillRect(0,100,w,44);g.fillStyle='#fff';g.font='bold 14px Arial';g.fillText('SOLARA NEWS 24',10,124);g.fillStyle='#e74c3c';g.fillRect(160,112,90,16);g.fillStyle='#fff';g.font='bold 10px Arial';g.fillText('LIVE',190,124);}),
 cctv:itx(256,160,(g,w,h)=>{g.fillStyle='#050805';g.fillRect(0,0,w,h);for(let k=0;k<4;k++){const X=(k%2)*128,Y=(k>>1)*80;g.fillStyle='#16241a';g.fillRect(X+3,Y+3,122,74);g.strokeStyle='rgba(120,200,140,.5)';g.lineWidth=1;g.beginPath();g.moveTo(X+10,Y+70);g.lineTo(X+60,Y+30);g.lineTo(X+120,Y+70);g.stroke();g.strokeRect(X+40,Y+40,30,30);g.fillStyle='#9fe8b0';g.font='9px monospace';g.fillText('CAM 0'+(k+1),X+6,Y+12);g.fillText('REC',X+100,Y+12);}for(let y=0;y<h;y+=3){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,y,w,1);}}),
 atm:itx(128,160,(g,w,h)=>{g.fillStyle='#1b3c5a';g.fillRect(0,0,w,h);g.fillStyle='#bfe0ff';g.font='bold 12px Arial';g.fillText('SOLARA BANK',14,20);g.fillStyle='#e8f4ff';g.font='10px Arial';g.fillText('Bitte Karte',30,70);g.fillText('einführen',32,84);for(let i=0;i<4;i++){g.fillStyle='#2d6a9a';g.fillRect(4,40+i*24,10,14);g.fillRect(w-14,40+i*24,10,14);}}),
 ticker:itx(512,64,(g,w,h)=>{g.fillStyle='#06121e';g.fillRect(0,0,w,h);g.font='bold 22px monospace';let x=6;for(const [s,v] of [['SOL',+1.8],['PRT',-0.6],['OIL',+2.4],['GLD',+0.3],['TEC',-1.1],['CAR',+0.9]]){g.fillStyle='#d8e4f0';g.fillText(s,x,40);x+=52;g.fillStyle=v>0?'#3fdc7a':'#ff5050';g.fillText((v>0?'▲':'▼')+Math.abs(v).toFixed(1)+'%',x,40);x+=86;}}),
 menuB:itx(512,192,(g,w,h)=>{g.fillStyle='#1b1b1b';g.fillRect(0,0,w,h);g.fillStyle='#ffd23a';g.font='bold 26px Arial';g.fillText('BURGER',18,34);g.fillStyle='#fff';g.font='15px Arial';const it=[['Classic Burger','4,90'],['Cheese Double','6,50'],['Bacon Royal','7,20'],['Veggie Deluxe','5,90'],['Pommes','2,50'],['Cola groß','2,20']];it.forEach(([a,b],i)=>{const x=18+(i%2)*250,y=70+(i>>1)*40;g.fillText(a,x,y);g.fillStyle='#ffd23a';g.fillText(b+' €',x+150,y);g.fillStyle='#fff';});
  for(let k=0;k<2;k++){const x=420+k*40,y=40;g.fillStyle='#d9902b';g.beginPath();g.ellipse(x,y,18,9,0,Math.PI,0);g.fill();g.fillStyle='#5a2e12';g.fillRect(x-18,y,36,6);g.fillStyle='#3fae3a';g.fillRect(x-19,y-2,38,3);g.fillStyle='#e0a040';g.fillRect(x-17,y+6,34,5);}}),
 menuP:itx(512,192,(g,w,h)=>{g.fillStyle='#14321c';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.font='bold 26px Georgia';g.fillText('Pizza Presto',18,34);g.font='15px Georgia';[['Margherita','7,50'],['Salami','8,90'],['Funghi','8,50'],['Quattro Formaggi','9,90'],['Diavola','9,50'],['Calzone','10,50']].forEach(([a,b],i)=>{const x=18+(i%2)*250,y=72+(i>>1)*40;g.fillStyle='#fff';g.fillText(a,x,y);g.fillStyle='#ffd27a';g.fillText(b+' €',x+170,y);});g.fillStyle='#c0392b';g.fillRect(0,h-10,w/3,10);g.fillStyle='#fff';g.fillRect(w/3,h-10,w/3,10);g.fillStyle='#27ae60';g.fillRect(2*w/3,h-10,w/3,10);}),
 products:itx(512,128,(g,w,h)=>{g.fillStyle='#d8d8d4';g.fillRect(0,0,w,h);let x=2;while(x<w){const kind=IRND();const bw=kind<.4?18+IRND()*10:kind<.75?12+IRND()*6:26+IRND()*14,bh=kind<.4?h*(.55+IRND()*.3):kind<.75?h*(.7+IRND()*.25):h*(.35+IRND()*.2);const c=['#c0392b','#e67e22','#f1c40f','#27ae60','#2980b9','#8e44ad','#ecf0f1','#2c3e50','#d35400','#16a085'][IRND()*10|0];
  const n=kind<.75?2+(IRND()*3|0):1;for(let k=0;k<n&&x<w;k++){g.fillStyle=c;g.fillRect(x,h-bh,bw,bh);g.fillStyle='rgba(255,255,255,.75)';g.fillRect(x+2,h-bh*.6,bw-4,bh*.22);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+bw-2,h-bh,2,bh);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(x+1,h-bh,1.5,bh);x+=bw+1;}x+=2;}}),
 drinks:itx(256,128,(g,w,h)=>{g.fillStyle='#1a2a33';g.fillRect(0,0,w,h);for(let r=0;r<2;r++)for(let x=3;x<w;x+=13){const c=['#c0392b','#27ae60','#f39c12','#2980b9','#ecf0f1','#8e44ad'][(x/13+r*3)%6|0];const y=r*64;g.fillStyle=c;g.fillRect(x,y+18,10,44);g.fillRect(x+3,y+8,4,12);g.fillStyle='rgba(255,255,255,.6)';g.fillRect(x+1,y+30,8,10);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x+1,y+18,2,44);}}),
 clothes:itx(256,128,(g,w,h)=>{g.fillStyle='rgba(0,0,0,0)';g.clearRect(0,0,w,h);let x=4;while(x<w-8){const c=['#c0392b','#1f5fbf','#2c3e50','#ecf0f1','#27ae60','#f1c40f','#8e44ad','#d35400','#7f8c8d','#111'][IRND()*10|0];const bw=10+IRND()*6;g.fillStyle=c;g.fillRect(x,6,bw,h-6-IRND()*40);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+bw-2,6,2,h-30);g.fillStyle='#888';g.fillRect(x+bw/2-1,0,2,8);x+=bw+1;}}),
 grate:itx(64,64,(g,w,h)=>{g.fillStyle='#2a2c2e';g.fillRect(0,0,w,h);g.strokeStyle='#8a8f94';g.lineWidth=3;for(let i=0;i<=64;i+=16){g.beginPath();g.moveTo(i,0);g.lineTo(i,64);g.moveTo(0,i);g.lineTo(64,i);g.stroke();}}),
 roll:itx(128,128,(g,w,h)=>{for(let y=0;y<h;y+=8){const gr=g.createLinearGradient(0,y,0,y+8);gr.addColorStop(0,'#b8bcc1');gr.addColorStop(.5,'#8d9297');gr.addColorStop(1,'#6a6f74');g.fillStyle=gr;g.fillRect(0,y,w,8);}}),
 tread:itx(128,128,(g,w,h)=>{g.fillStyle='#8a8f94';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=16)for(let x=0;x<w;x+=16){g.fillStyle='#b4b9be';g.save();g.translate(x+8,y+8);g.rotate((x+y)/16%2?.8:-.8);g.fillRect(-6,-1.5,12,3);g.restore();}}),
 logoBank:itx(256,256,(g,w,h)=>{g.fillStyle='#0d2a4a';g.beginPath();g.arc(128,128,124,0,7);g.fill();g.strokeStyle='#f2d06b';g.lineWidth=8;g.beginPath();g.arc(128,128,108,0,7);g.stroke();g.fillStyle='#f2d06b';g.font='bold 110px Georgia';g.textAlign='center';g.textBaseline='middle';g.fillText('S',128,136);g.font='bold 20px Georgia';g.fillText('SEIT 1921',128,214);}),
};
const IM={
 oak:M({map:IT.oak,roughness:.55}),walnut:M({map:IT.walnut,roughness:.48}),parquet:M({map:IT.parquet,roughness:.42}),white:M({map:IT.white,color:0xf4f3ef,roughness:.5}),
 tiles:M({map:IT.tiles,roughness:.3}),checker:M({map:IT.checker,roughness:.25}),wtile:M({map:IT.wtile,roughness:.2}),wtileR:M({map:IT.wtile,color:0xd84a3a,roughness:.25}),
 marble:M({map:IT.marble,roughness:.16,metalness:.05}),marbleD:M({map:IT.marbleD,roughness:.15,metalness:.05}),carpetR:M({map:IT.carpetR,roughness:1}),carpetG:M({map:IT.carpetG,roughness:1}),rug:M({map:IT.rug,roughness:1}),
 fabG:M({map:IT.fabric,color:0x7d828c,roughness:.95}),fabB:M({map:IT.fabric,color:0x3d5a80,roughness:.95}),fabBe:M({map:IT.fabric,color:0xcdb994,roughness:.95}),fabR:M({map:IT.fabric,color:0xa1282c,roughness:.92}),fabW:M({map:IT.fabric,color:0xf0eee8,roughness:.95}),fabT:M({map:IT.fabric,color:0x2a8a8a,roughness:.95}),
 leather:M({map:IT.leather,color:0x4a2c1c,roughness:.42}),leatherB:M({map:IT.leather,color:0x1a1a1c,roughness:.38}),leatherR:M({map:IT.leather,color:0xb3202a,roughness:.35}),
 steel:M({map:IT.brushed,color:0xd0d4d8,roughness:.32,metalness:.85}),chrome:cm(0xe9eef2,.1,1),black:cm(0x1a1b1d,.5,.2),gloss:cm(0x0c0d0f,.18,.35),whiteP:cm(0xf4f4f2,.4),ceramic:cm(0xf8f8f6,.1,.05),
 gold:cm(0xd9ae3e,.28,.9),brass:cm(0xbb9040,.32,.85),copper:cm(0xb06a3a,.35,.8),
 plaster:M({map:IT.plaster,color:0xf2efe9,roughness:.93}),plasterBe:M({map:IT.plaster,color:0xe8dcc4,roughness:.93}),plasterBl:M({map:IT.plaster,color:0xc9d8e2,roughness:.93}),plasterGr:M({map:IT.plaster,color:0xd3dcc6,roughness:.93}),plasterD:M({map:IT.plaster,color:0x3a3d44,roughness:.9}),plasterR:M({map:IT.plaster,color:0xb33a2c,roughness:.9}),
 concrete:M({map:IT.concrete,roughness:.86}),brick:M({map:IT.brick,roughness:.9}),peg:M({map:IT.pegboard,roughness:.8}),
 yellow:cm(0xf2c12e,.45,.25),red:cm(0xc4271d,.4,.35),blue:cm(0x1f4f9a,.45,.3),green:cm(0x2a7a3a,.5,.2),orange:cm(0xe8701a,.45,.25),rubber:cm(0x141414,.92),greyM:cm(0x5c6166,.5,.6),darkM:cm(0x2a2d31,.45,.65),
 glass:M({color:0xc8e2ee,roughness:.04,metalness:.15,transparent:true,opacity:.24,depthWrite:false}),glassT:M({color:0x9fc4dc,roughness:.05,metalness:.3,transparent:true,opacity:.42,depthWrite:false}),mirror:cm(0xd9e4ea,.02,1),
 deposit:M({map:IT.deposit,roughness:.35,metalness:.75}),cash:M({map:IT.cash,roughness:.8}),books:M({map:IT.books,roughness:.85}),products:M({map:IT.products,roughness:.6}),drinks:M({map:IT.drinks,roughness:.3,emissive:0xffffff,emissiveMap:IT.drinks,emissiveIntensity:.35}),
 clothes:M({map:IT.clothes,transparent:true,alphaTest:.3,roughness:.95,side:THREE.DoubleSide}),grate:M({map:IT.grate,roughness:.5,metalness:.7}),roll:M({map:IT.roll,roughness:.45,metalness:.6}),tread:M({map:IT.tread,roughness:.4,metalness:.8}),
 pc:new THREE.MeshStandardMaterial({map:IT.screenPC,emissive:0xffffff,emissiveMap:IT.screenPC,emissiveIntensity:.9,roughness:.2}),tv:new THREE.MeshStandardMaterial({map:IT.screenTV,emissive:0xffffff,emissiveMap:IT.screenTV,emissiveIntensity:1,roughness:.2}),
 cctv:new THREE.MeshStandardMaterial({map:IT.cctv,emissive:0xffffff,emissiveMap:IT.cctv,emissiveIntensity:1.1,roughness:.2}),atm:new THREE.MeshStandardMaterial({map:IT.atm,emissive:0xffffff,emissiveMap:IT.atm,emissiveIntensity:.9}),ticker:new THREE.MeshStandardMaterial({map:IT.ticker,emissive:0xffffff,emissiveMap:IT.ticker,emissiveIntensity:1.1}),
 menuB:new THREE.MeshStandardMaterial({map:IT.menuB,emissive:0xffffff,emissiveMap:IT.menuB,emissiveIntensity:.95}),menuP:new THREE.MeshStandardMaterial({map:IT.menuP,emissive:0xffffff,emissiveMap:IT.menuP,emissiveIntensity:.85}),
 art1:M({map:IT.art1,roughness:.7}),art2:M({map:IT.art2,roughness:.7}),car1:M({map:IT.car1,roughness:.6}),cal:M({map:IT.cal,roughness:.8}),logoBank:M({map:IT.logoBank,roughness:.3,metalness:.3}),
 lamp:new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xfff2dc,emissiveIntensity:2.4}),lampW:new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xeef6ff,emissiveIntensity:2.6}),lampY:new THREE.MeshStandardMaterial({color:0xffe9b0,emissive:0xffc870,emissiveIntensity:2.2}),
 fire:new THREE.MeshStandardMaterial({color:0xff7a1a,emissive:0xff5a10,emissiveIntensity:3}),led:new THREE.MeshStandardMaterial({color:0x111111,emissive:0x3fdc7a,emissiveIntensity:2}),ledR:new THREE.MeshStandardMaterial({color:0x111111,emissive:0xff3030,emissiveIntensity:2}),
 aoMat:null,
};
for(const k of ['pc','tv','cctv','atm','ticker','menuB','menuP','art1','art2','car1','cal','logoBank'])IM[k].userData.fit=true;
// weicher Kontaktschatten (dunkler Fleck unter Möbeln)
{const t=canvasTex(128,128,(g,w,h)=>{const gr=g.createRadialGradient(64,64,6,64,64,64);gr.addColorStop(0,'rgba(0,0,0,.62)');gr.addColorStop(.55,'rgba(0,0,0,.3)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);});IM.aoMat=new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});}
const AOGEO=(()=>{const g=new THREE.PlaneGeometry(1,1);g.rotateX(-Math.PI/2);return g;})();
// ---------- Räume / Innenlicht / Türen ----------
const INTERIORS=[];GY_INT=INTERIORS;
// ---------- NPC-Navigation in Gebäuden: Flussfeld (Breitensuche) auf einem 0,5-m-Raster ----------
// Jedes Gebäude bekommt beim ersten Bedarf ein Belegungsraster (Wände, Möbel, Tresen). Türen sind passierbar,
// solange sie nicht verschlossen sind. Vom Ziel (Spieler) aus wird ein Abstandsfeld berechnet, dem alle NPCs folgen.
const IOPEN=[],INAVC=.5,INAVR=.42,INB8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
const ILP=[];
{const n=[2,4,6][SET.quality]??4;for(let i=0;i<n;i++){const l=new THREE.PointLight(0xfff0dc,0,15,2);l.position.set(0,-500,0);scene.add(l);ILP.push({l,key:null,cur:0});}}
let ilT=0;const ilCand=[];
const IDOORS=[];
// Personal (wird beim Start erzeugt, weil die Figuren-Bibliothek später geladen wird)
const ISTAFF=[],IDECO=[];
// Belebte Innenräume: Läden/Bank melden hier Plätze für Kunden, Personal und Wachen an (Logik in 16g_innenleben.js)
const IPOPS=[];

// ================= MÖBEL & EINRICHTUNG (detaillierte Innenraum-Modelle) =================
// Jedes Möbelstück wird in einem eigenen lokalen Rahmen gebaut (Vorderseite = +z) und zusammengefasst gezeichnet.
const IM2={leaf:M({color:0x2f7d3a,roughness:.55,side:THREE.DoubleSide}),leafD:M({color:0x1f5a2a,roughness:.6,side:THREE.DoubleSide}),soil:cm(0x3a2a1c,1),pot:cm(0xe8e2d6,.5),potT:cm(0xb5623a,.8),
 paper:cm(0xf4f2ea,.9),cardboard:cm(0xb08a5a,.95),wood2:cm(0x8a5a32,.6),pink:cm(0xe86a8a,.6),teal:cm(0x2a9d8f,.5),purple:cm(0x6a3a8a,.5),cream:cm(0xf2e6c8,.6),olive:cm(0x6b7a3a,.6),navy:cm(0x1c2a4a,.5),burg:cm(0x6a1c2a,.5),grey:cm(0x8a8f96,.5),dkgrey:cm(0x3c4046,.55),
 tyre:M({color:0x1a1a1a,roughness:.88}),rim:cm(0xb8bcc2,.25,.9),oilRed:cm(0xb02a1e,.5,.4),oilBlue:cm(0x1f4f9a,.5,.4),glow:new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xfff0d0,emissiveIntensity:2})};
const TORUS=new THREE.TorusGeometry(1,.38,10,22),SPH=new THREE.SphereGeometry(1,16,12),CONE=new THREE.ConeGeometry(1,1,16),TAPER=new THREE.CylinderGeometry(1,.75,1,16);

// ================= BEGEHBARE GEBÄUDE: Bank, Wohnung, Garage, Werkstatt, Läden =================
const IMB={stone:M({map:IT.plaster,color:0xd8ccb2,roughness:.82}),stoneD:M({map:IT.plaster,color:0xa59a86,roughness:.85}),panel:M({map:IT.walnut,roughness:.5}),fabBank:M({map:IT.fabric,color:0x0d2a4a,roughness:.9}),
 check:M({map:itx(64,64,(g)=>{for(let y=0;y<8;y++)for(let x=0;x<8;x++){g.fillStyle=(x+y)%2?'#b8202a':'#f4f0e6';g.fillRect(x*8,y*8,8,8);}}),roughness:.9}),
 target:M({map:canvasTex(128,160,(g,w,h)=>{g.fillStyle='#f4f2ea';g.fillRect(0,0,w,h);for(let r=5;r>0;r--){g.fillStyle=r%2?'#111':'#f4f2ea';g.beginPath();g.ellipse(64,72,r*11,r*13,0,0,7);g.fill();}g.fillStyle='#c0392b';g.beginPath();g.arc(64,72,5,0,7);g.fill();g.fillStyle='#111';g.font='bold 12px Arial';g.fillText('KOWALSKI',30,150);}),roughness:.8}),
 sale:new THREE.MeshStandardMaterial({map:canvasTex(256,96,(g,w,h)=>{g.fillStyle='#e63946';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.font='bold 54px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('SALE -30%',w/2,h/2+2);}),emissive:0xffffff,emissiveIntensity:.25})};
for(const k of ['target','sale'])IMB[k].userData.fit=true;
// Werbeplakate & Schilder für Läden (einmal erzeugt, von allen Läden geteilt)
let STP=null;

// ================= WELT-ERWEITERUNG: Sonderorte, Zonen, Details =================
const winGlass=M({color:0x9fc4dc,roughness:.05,metalness:.85,transparent:true,opacity:.5});
const gemMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x88ccff,emissiveIntensity:1.5,metalness:.9,roughness:.1});
const neonMats=[],glowMats=[];
const SPECIAL={
 '7,6':{type:'bank',name:'Solara Nationalbank'},
 '5,7':{type:'jewel',name:'Juwelier Brillant'},
 '8,6':{type:'club',name:'Club NEON'},
 '6,8':{type:'cinema',name:'Kino Palast'},
 '12,6':{type:'dealer',name:'Autohaus Hyperion'},
 '12,8':{type:'tuning',name:'Jax Tuning-Treff'},
 '3,7':{type:'gunshop',name:'Waffen Kowalski'},
 '10,11':{type:'gunshop',name:'Waffen Kowalski Ost'},
 '8,4':{type:'clothes',name:'Mode Solara'},
 '6,12':{type:'respray',name:'Sprühwerk Süd'},
 '1,5':{type:'respray',name:'Sprühwerk West'},
 '8,10':{type:'burger',name:'Burger Bude'},
 '3,3':{type:'burger',name:'Burger Bude Nord'},
 '3,10':{type:'gas',name:'SolarOil Hafen'},
 '11,4':{type:'gas',name:'SolarOil Ost'},
 '6,2':{type:'gas',name:'SolarOil Nord'},
 '12,12':{type:'gas',name:'SolarOil Strand'},
 '0,6':{type:'gas',name:'SolarOil West'},
 '5,11':{type:'shop',name:'Späti Altstadt'},
 '9,12':{type:'shop',name:'Späti am Strand'},
 '2,3':{type:'shop',name:'Späti Nord'},
 '3,5':{type:'safehouse',name:'Deine Wohnung'},
 '1,10':{type:'fight',name:'Faustkampf-Club'},
 '10,7':{type:'taxi',name:'Solara Taxi'},
 '4,9':{type:'pizza',name:'Pizza Presto'},
 '2,11':{type:'rocco',name:'Roccos Auto-Export'},
};
const places=[],stores=[],gasPumps=[],ramps=[],packageSpots=[],bldgs=[],jewelCases=[],ZONES=[],funObjs={};
const RING={x0:-770,x1:548,z0:-770,zs:nodeX(N)};
ZONES.push({name:'Flughafen Solara',x0:AIRX0,x1:AIRX1,z0:AIRZ0,z1:AIRZ1});
// eigene Werbe-Marken (frei erfunden)
const ADS=[['SOLARA COLA','Erfrischt die ganze Stadt','#c8102e','#ffffff'],['NEON BANK','Ihr Geld. Unsere Sorge.','#0b1d3a','#3ee6ff'],['BURGER BUDE','Doppelt hält besser!','#ffcc00','#c8102e'],['PFAU MOBIL','Telefonieren mit Stil','#0f7c7c','#ffffff'],['HYPERION','Schneller als dein Schatten','#111111','#ff8a2a'],['RADIO NEON 101.5','Die Hits der Nacht','#3a0f5c','#ff5ad6'],['SONNENBRAND 50+','Schutz für Profis','#ff7a1a','#ffffff'],['KINO PALAST','Jetzt: Hafenfieber 2','#5a0b0b','#ffd86b'],['SPRÜHWERK','Neue Farbe, neues Leben','#0f5132','#c6ff9a'],['MAXI MARKT','Alles. Immer. Billig.','#1f4fbf','#ffe14d']];
const adMats=ADS.map(([t,s,bg,fg])=>{const tex=canvasTex(512,224,(g,w,h)=>{g.fillStyle=bg;g.fillRect(0,0,w,h);const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(255,255,255,.18)');gr.addColorStop(1,'rgba(0,0,0,.35)');g.fillStyle=gr;g.fillRect(0,0,w,h);g.fillStyle=fg;g.font='900 76px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(t,w/2,h*.42,w-30);g.font='italic 600 34px Arial';g.fillText(s,w/2,h*.78,w-40);g.strokeStyle=fg;g.lineWidth=8;g.strokeRect(10,10,w-20,h-20);});const m=M({map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.3,roughness:.5});m.userData={kind:'sign',glow:.9};facadeMats.push(m);return m;});
const floorTex=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#ddd8cf';g.fillRect(0,0,w,h);g.strokeStyle='#b5afa4';g.lineWidth=2;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*32,0);g.lineTo(i*32,h);g.moveTo(0,i*32);g.lineTo(w,i*32);g.stroke();}});floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping;
const floorMat=M({map:floorTex,roughness:.45});
const shelfCols=[0xd64541,0x2e86de,0xf6b93b,0x38ada9,0xf8f8f8,0x8e44ad].map(c=>cm(c,.7));
const counterMat=cm(0x6b4a30,.6);
const ringTex=asphaltTex.clone();ringTex.needsUpdate=true;ringTex.repeat.set(1,1);ringTex.wrapS=ringTex.wrapT=THREE.RepeatWrapping;
const ringMat=decal(M({map:ringTex,roughness:.88})),lotMat=M({map:ringTex,roughness:.7});
const dirtTex=canvasTex(128,128,(g,w,h)=>noiseFill(g,w,h,'#6b5a45',.25,6000,2));dirtTex.wrapS=dirtTex.wrapT=THREE.RepeatWrapping;
const dirtMat=decal(M({map:dirtTex,roughness:1}));
// Flache Bodenteile nie unter das Gelände legen (sonst „frisst“ Sand/Gras sie flackernd auf)
const FLAT_EX=[];
// ---------- Clubs mit echtem Innenraum: DJ, Tanzfläche, Bar, VIP-Lounge, Lichtshow ----------
const CLUBS=[];let CLUBM=null;
const BUILD={
 gas(info,sp){const {x1,z1,cx}=info;baseFloor(info,darkConcrete,[6,6]);
  const kx=cx-10,kz=z1-14;
  addStatic(boxG(20,.8,14),cm(0xf2f2f2,.5),kx,5.6,kz);addStatic(boxG(20.3,.35,14.3),cm(0xe23b2e,.6),kx,6.4,kz);
  for(const [px,pz] of [[-9,-6],[9,-6],[-9,6],[9,6]]){addStatic(GEO.box,cm(0xdddddd,.5),kx+px,3.0,kz+pz,0,.5,5.4,.5);addSolid(kx+px-.3,kx+px+.3,kz+pz-.3,kz+pz+.3,6);}
  const pumpMat=cm(0xe23b2e,.5),screenMat=cm(0x111111,.3);
  for(const [px,pz] of [[-4,-3],[4,-3],[-4,3],[4,3]]){const g=new THREE.Group();g.add(mesh(new THREE.BoxGeometry(.9,1.7,.6),pumpMat,0,1.15,0),mesh(new THREE.BoxGeometry(.7,.35,.62),screenMat,0,1.6,0,false));g.position.set(kx+px,0,kz+pz);scene.add(g);addSolid(kx+px-.5,kx+px+.5,kz+pz-.35,kz+pz+.35,2);gasPumps.push({x:kx+px,z:kz+pz,hp:60,dead:false,g});}
  regStore(storeShell(cx+13,z1-12,14,10,4.6,1,MATS.plaster[3],'SOLAROIL SHOP','#c0392b','#ffffff'),sp,'gas');
  addStatic(GEO.box,cm(0x222222,.5),x1-4,4.3,z1-2.6,0,.5,8,.5);signMesh('SolarOil',5,2.2,x1-4,8.6,z1-2.3,0,'#e23b2e','#ffffff',1,70);
  addPlace('store',sp.name,cx+13,z1-4,{label:'$',col:'#56d364',r:0});fillBack(info,2);},
 shop(info,sp){baseFloor(info);regStore(storeShell(info.cx,info.z1-10,16,12,4.6,1,pickR(MATS.plaster),'SPÄTI 24/7','#1d6b3a','#ffffff'),sp,'shop');addPlace('store',sp.name,info.cx,info.z1-3,{label:'$',col:'#56d364',r:0});fillBack(info,2);},
 bank(info,sp){const {cx,cz}=info;baseFloor(info);const bz=cz+4;
  buildBankInterior(info,sp);addStatic(boxG(43,1,33),cm(0xc9a227,.35,.7),cx,28.8,bz);
  for(let k=0;k<6;k++){const x=cx-15+k*6;addStatic(GEO.cyl,cm(0xe8e2d0,.6),x,4.8,bz+17.4,0,.7,9,.7);addStatic(GEO.cyl,cm(0xd8d0bc,.6),x,.45,bz+17.4,0,.9,.3,.9);addSolid(x-.72,x+.72,bz+16.68,bz+18.12,9.6);}
  addStatic(boxG(36,1.2,3),cm(0xe8e2d0,.6),cx,9.3,bz+17.4);addStatic(boxG(36,.25,2.2),cm(0xd8d0bc,.6),cx,.3,bz+17.2,0,1,1,1,{noShadow:true});
  signMesh('SOLARA NATIONALBANK',24,2,cx,11.4,bz+18.95,0,'#0d2a4a','#f2d06b',1,46);},
 jewel(info,sp){const {cx,z1}=info;baseFloor(info);const scx=cx-8,scz=z1-10;
  const st=storeShell(scx,scz,18,12,4.8,1,MATS.brick[0],'JUWELIER BRILLANT','#1b1b1b','#f2d06b',{shelves:false,counterX:-4});
  for(const dx of [-6,-2.2,1.6,5.4]){const x=scx+dx,z=scz+.5;addStatic(boxG(1.6,.9,.9),cm(0x3b2a20,.6),x,.3,z);const gl=new THREE.Mesh(new THREE.BoxGeometry(1.5,.55,.8),winGlass);gl.position.set(x,1.5,z);scene.add(gl);const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.13),gemMat);gem.position.set(x,1.38,z);scene.add(gem);addSolid(x-.8,x+.8,z-.45,z+.45,1.8);jewelCases.push({x,z,glass:gl,gem,smashed:false});}
  jewelDeco(st);st.kind='jewel';st.name=sp.name;sp.store=st;sp.carStop={x:scx,z:z1+3.6};sp.inside={x:scx,z:scz+3};
  building(cx+14,z1-14,14,16,Math.round(R(10,16)),'brick');fillBack(info,2);},
 club(info,sp){const {cx,z1}=info;baseFloor(info);const bz=z1-15;
  addStatic(boxG(34.6,4,22.6),cm(0x1b1b24,.6,.2),cx,8.3,bz);sp.cl=buildClubInterior(cx,bz,'Club NEON',0xff2bd6,0x22e5ff);
  const nP=neon(0xff2bd6),nC=neon(0x22e5ff);nP.userData.k=nC.userData.k=.7;
  scene.add(mesh(new THREE.BoxGeometry(34.3,.2,.2),nP,cx,3.1,bz+11.38,false),mesh(new THREE.BoxGeometry(34.3,.2,.2),nC,cx,11.9,bz+11.38,false));
  for(const sx of [-1,1])scene.add(mesh(new THREE.BoxGeometry(.2,11.6,.2),nC,cx+sx*17.1,6.2,bz+11.38,false));
  const nt=canvasTex(512,160,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);g.font='900 120px Arial';g.textAlign='center';g.textBaseline='middle';g.shadowColor='#ff3ce0';g.shadowBlur=30;g.fillStyle='#ff9cf2';g.fillText('NEON',w/2,h/2+6);});
  const nm=new THREE.MeshStandardMaterial({map:nt,emissive:0xffffff,emissiveMap:nt,emissiveIntensity:2});nm.userData.k=.42;neonMats.push(nm);const ns=new THREE.Mesh(new THREE.PlaneGeometry(14,4.4),nm);ns.position.set(cx,7.4,bz+11.42);scene.add(ns);
  for(let k=0;k<6;k++)addStatic(GEO.cyl,cm(0xc9a227,.3,.8),cx-6+k*2.4,.85,bz+13.5,0,.07,1.1,.07);
  sp.door={x:cx,z:bz+14.6};fillBack(info,2);},
 cinema(info,sp){const {cx,z1}=info;baseFloor(info);const bz=z1-17;
  addStatic(boxG(36,16,24,[16,28]),MATS.brick[1],cx,.3,bz);addStatic(boxG(36.5,.7,24.5),roofMat,cx,16.3,bz);addSolid(cx-18.2,cx+18.2,bz-12.2,bz+12.2,17);
  addStatic(boxG(22,1.2,3.4),cm(0x7a1010,.5),cx,5.3,bz+13.6);
  signMesh('KINO PALAST',18,2,cx,7.4,bz+12.3,0,'#7a1010','#ffd86b',1.4,64);
  [['DIE NACHT VON SOLARA','#1a1a40'],['HAFENFIEBER 2','#402010'],['LIEBE & LACK','#401030']].forEach(([t,c],k)=>{const tx=canvasTex(160,240,(g,w,h)=>{g.fillStyle=c;g.fillRect(0,0,w,h);g.fillStyle='#ffd86b';g.font='bold 22px Arial';g.textAlign='center';t.split(' ').forEach((wd,i)=>g.fillText(wd,w/2,70+i*28));g.fillStyle='#fff';g.font='14px Arial';g.fillText('BALD IM KINO',w/2,h-24);g.strokeStyle='#ffd86b';g.lineWidth=4;g.strokeRect(6,6,w-12,h-12);});const pm=new THREE.MeshStandardMaterial({map:tx,emissive:0xffffff,emissiveMap:tx,emissiveIntensity:.4});pm.userData={kind:'sign',glow:.8};facadeMats.push(pm);const m=new THREE.Mesh(new THREE.PlaneGeometry(2.4,3.6),pm);m.position.set(cx-8+k*8,2.6,bz+12.25);scene.add(m);});
  fillBack(info,2);},
 dealer(info,sp){const {cx,cz,z1}=info;baseFloor(info,cm(0xc9c9c4,.45),[6,6]);const bz=cz-6;
  addStatic(boxG(32,.06,18),cm(0xf0f0f0,.35),cx,.3,bz,0,1,1,1,{noShadow:true});
  const gl=new THREE.Mesh(new THREE.BoxGeometry(32,7,18),winGlass);gl.position.set(cx,3.9,bz);scene.add(gl);
  addStatic(boxG(32.6,.6,18.6),cm(0xf2f2f2,.5),cx,7.4,bz);addSolid(cx-16,cx+16,bz-9,bz+9,8);
  for(const [px,pz] of [[-15.8,-8.8],[15.8,-8.8],[-15.8,8.8],[15.8,8.8]])addStatic(GEO.box,cm(0xdddddd,.4,.5),cx+px,3.9,bz+pz,0,.4,7.2,.4);
  signMesh('AUTOHAUS HYPERION',20,2,cx,9,bz+9.35,0,'#111111','#ff8a2a',1.2,60);
  for(let k=0;k<6;k++){const fx=cx-25+k*10;addStatic(GEO.cyl,cm(0xdddddd,.4,.5),fx,4.3,z1-1.2,0,.07,8,.07);addStatic(GEO.box,cm([0xff8a2a,0x1f5fbf,0xffffff][k%3],.7),fx+.8,7.6,z1-1.2,0,1.6,1,.05);}
  sp.lot=[{x:cx-15,z:z1-8},{x:cx-5,z:z1-8},{x:cx+5,z:z1-8},{x:cx+15,z:z1-8}];sp.showroom=[{x:cx-7,z:bz},{x:cx+7,z:bz}];sp.spawn={x:cx,z:z1+3.6};
  addPlace('dealer',sp.name,cx,z1-3,{label:'A',col:'#4aa3ff'});},
 tuning(info,sp){const {cx,cz,z0,z1}=info;baseFloor(info,lotMat,[6,6]);
  const nO=neon(0xff7b1a),nB=neon(0x3a8bff);
  for(let k=0;k<5;k++)scene.add(mesh(new THREE.BoxGeometry(.25,.04,9),k%2?nO:nB,cx-20+k*10,.34,cz+4,false));
  addStatic(boxG(12.2,2.6,2.5,[2.5,2.6]),containerCols[3],cx-15,.3,z0+8);addSolid(cx-21.2,cx-8.8,z0+6.7,z0+9.3,3);signMesh('JAX TUNING',8,1.2,cx-15,3.6,z0+9.3,0,'#111','#ff7b1a',1.3,64);
  for(let k=0;k<4;k++)addStatic(GEO.cyl,cm(0x2b2f33,.45,.7),cx-18+k*12,3.5,z1-1.2,0,.12,7,.12);
  sp.door={x:cx-2,z:z1-4};sp.cars=[{x:cx-15,z:cz+4},{x:cx-5,z:cz+4},{x:cx+5,z:cz+4},{x:cx+15,z:cz+4}];
  addPlace('race','Straßenrennen',cx+14,z1-4,{label:'Re',col:'#ff7b39'});},
 gunshop(info,sp){const {cx,cz,z0,z1}=info;baseFloor(info,darkConcrete,[6,6]);
  const bx=cx-12,bz=z1-10;const gi=buildGunshopInt(bx,bz,sp);
  signMesh('WAFFEN KOWALSKI',14,1.7,bx,3.9,bz+6.27,0,'#2a2a2a','#ff4a3a',1,58);
  const rx=cx+12,rz0=z0+5;addStatic(boxG(20,.06,35,null,[4,4]),cm(0x7d6e58,1),rx,.3,cz-5.5,0,1,1,1,{noShadow:true});
  for(const sx of [-1,1]){addStatic(GEO.box,cm(0x6b5a45,.9),rx+sx*10,1.8,cz-5.5,0,.4,3,35);addSolid(rx+sx*10-.25,rx+sx*10+.25,cz-23,cz+12,3.3);}
  addStatic(GEO.box,cm(0x5b4a35,.9),rx,2.3,rz0,0,20,4,1);addSolid(rx-10,rx+10,rz0-.5,rz0+.5,4.3);
  sp.range={x:rx,z:cz+9,targets:[...Array(8)].map((_,k)=>({x:rx-7.5+(k%4)*5,z:rz0+3+(k>>2)*4}))};
  addPlace('gunshop',sp.name,gi.counter.x,gi.counter.z,{label:'W',col:'#ff5a4a'});addPlace('range','Schießstand',rx,cz+11,{label:'S',col:'#ff9a6a',data:{sp}});},
 clothes(info,sp){const {cx,z1}=info;baseFloor(info);const bz=z1-10;
  const ci=buildClothesInt(cx,bz);
  signMesh('MODE SOLARA',14,1.8,cx,6,bz+6.27,0,'#ff7ad9','#ffffff',1.2,64);
  addPlace('clothes',sp.name,ci.counter.x,ci.counter.z,{label:'K',col:'#ff7ad9'});fillBack(info,2);},
 respray(info,sp){const {cx,cz}=info;baseFloor(info,darkConcrete,[6,6]);const bz=cz-6;
  addStatic(boxG(20,8,14,[30,12]),MATS.warehouse[1],cx,.3,bz);addStatic(boxG(20.4,.6,14.4),roofMat,cx,8.3,bz);addSolid(cx-10.2,cx+10.2,bz-7.2,bz+7.2,9);
  addStatic(GEO.box,cm(0x3a3f45,.5,.6),cx,3,bz+7.1,0,8,5.4,.15);
  signMesh('SPRÜHWERK',12,1.8,cx,7,bz+7.3,0,'#0f5132','#c6ff9a',1.2,64);
  sp.zone={x:cx,z:bz+13};addPlace('respray',sp.name,cx,bz+13,{label:'L',col:'#3fdc7a',car:true,r:5});},
 burger(info,sp){const {cx,z1}=info;baseFloor(info);const bx=cx-8,bz=z1-10;
  const bi=buildBurgerInt(bx,bz);
  addStatic(GEO.cyl,cm(0xd9902b,.7),bx,6.6,bz,0,2.6,1.1,2.6);addStatic(GEO.cyl,cm(0x5a2e12,.8),bx,7.4,bz,0,2.8,.6,2.8);addStatic(GEO.cyl,cm(0x3fae3a,.8),bx,7.85,bz,0,2.9,.25,2.9);addStatic(GEO.blob,cm(0xe0a040,.7),bx,8.2,bz,0,2.7,1.3,2.7);
  signMesh('BURGER BUDE',12,1.8,bx,4,bz+5.27,0,'#d62d20','#ffd23a',1.2,64);
  Object.assign(sp,bi);sp.carSpot={x:bx+9.5,z:z1+2.4};addPlace('burger',sp.name,bi.counter.x,bi.counter.z,{label:'B',col:'#ffb13b'});fillBack(info,2);},
 safehouse(info,sp){const {cx,cz}=info;baseFloor(info,grassMat,[8,8]);const hx=cx-9,hz=cz-2;
  const ap=buildApartment(hx,hz);addStatic(boxG(2,.06,3.2,null,[2,2]),sidewalkMat,hx+6,.3,hz+9.6,0,1,1,1,{noShadow:true});
  const gx=cx+15,gz=cz-2;buildHomeGarage(gx,gz);
  addStatic(boxG(10,.06,14,null,[4,4]),sidewalkMat,gx,.3,gz+13,0,1,1,1,{noShadow:true});
  sp.door=ap.door;sp.inside=ap.inside;sp.bed=ap.bed;sp.garage={x:gx-4,z:gz+8.5};sp.carSpawn={x:gx,z:gz+14};
  addPlace('safehouse','Deine Wohnung',ap.bed.x,ap.bed.z,{label:'H',col:'#ffffff',r:2.2});addPlace('garage','Deine Garage',gx-4,gz+8.5,{label:'G',col:'#cfd8ff'});},
 fight(info,sp){const {cx,z0,z1}=info;baseFloor(info,darkConcrete,[6,6]);
  building(cx,z0+16,40,22,11,'warehouse');signMesh('FAUSTKAMPF',12,2,cx,8.6,z0+27.3,0,'#111','#ff4f6f',1.2,64);
  const rx=cx,rz=z1-14;addStatic(boxG(12,.25,12,null,[2,2]),cm(0x2a4a8a,.8),rx,.3,rz,0,1,1,1,{noShadow:true});
  for(const [px,pz] of [[-6,-6],[6,-6],[-6,6],[6,6]])addStatic(GEO.cyl,cm(0xc0392b,.6),rx+px,1.1,rz+pz,0,.15,1.6,.15);
  for(const y of [.95,1.45])for(const [ax,az,lx,lz] of [[0,-6,12,.06],[0,6,12,.06],[-6,0,.06,12],[6,0,.06,12]])addStatic(GEO.box,cm(0xf2f2f2,.6),rx+ax,y,rz+az,0,lx,.05,lz);
  sp.ring={x:rx,z:rz};addPlace('fight','Faustkampf-Club',rx+8,rz,{label:'FK',col:'#ff4f6f',data:{sp}});},
 taxi(info,sp){const {cx,cz}=info;baseFloor(info,lotMat,[6,6]);building(cx,cz-14,30,14,7,'plaster');signMesh('SOLARA TAXI',14,2,cx,6.3,cz-6.7,0,'#f2c230','#111111',1.2,64);
  sp.cars=[{x:cx-15,z:cz+9},{x:cx-5,z:cz+9},{x:cx+5,z:cz+9},{x:cx+15,z:cz+9}];addPlace('taxi','Taxi-Zentrale',cx,cz+2,{label:'T',col:'#ffd23a'});},
 pizza(info,sp){const {cx,z1}=info;baseFloor(info);const bx=cx-9,bz=z1-10;
  const pi=buildPizzaInt(bx,bz);
  signMesh('PIZZA PRESTO',12,1.8,bx,4,bz+5.27,0,'#1e7b34','#ffffff',1.2,60);
  sp.scooters=[{x:cx+8,z:z1-6},{x:cx+11,z:z1-6},{x:cx+14,z:z1-6}];addPlace('pizza','Pizza Presto',pi.counter.x,pi.counter.z,{label:'Pz',col:'#ff6b3b'});fillBack(info,2);},
 rocco(info,sp){const {cx,cz,x0,x1,z0}=info;baseFloor(info,darkConcrete,[6,6]);
  for(let k=0;k<5;k++)containerStack(x0+8+k*9,z0+8,0);
  crane(x1-14,cz-8);
  addStatic(boxG(6.1,2.6,2.5,[2.5,2.6]),containerCols[1],cx-14,.3,cz+14);addSolid(cx-17.1,cx-10.9,cz+12.7,cz+15.3,3);signMesh('ROCCOS AUTO-EXPORT',7,1,cx-14,3.4,cz+15.3,0,'#2a1a40','#c38bff',1.3,40);
  addStatic(boxG(10,.06,10,null,[2,2]),cm(0x6a4a9a,.6),cx+6,.3,cz+10,0,1,1,1,{noShadow:true});
  sp.export={x:cx+6,z:cz+10};sp.door={x:cx-14,z:cz+17};
  addPlace('export','Auto-Export',cx+6,cz+10,{label:'Ex',col:'#c38bff',car:true,r:6});},
};

// ---------- Ringautobahn ----------
const roadDashPts=[],roadLampPts=[];const RLAMP_G={base:0,pts:[],parts:[]},TL_G={base:.3,pts:[],parts:[]};

// ---------- Nordzone: Militärbasis, Stadion, Stuntpark, Nordpark ----------
const MIL={pads:[{x:-660,z:-600},{x:-610,z:-640}],jet:{x:-720,z:-548},gate:{x:-430,z:-645},tanks:[{x:-560,z:-650,h:0},{x:-545,z:-690,h:.4}],jeep:{x:-600,z:-605,h:-.3}};
const MO={x:-315,z:-2185},PO={x:1448,z:-3408};// Fort Adler & JVA liegen jetzt in der Wüste
for(const p of [...MIL.pads,...MIL.tanks,MIL.jet,MIL.gate,MIL.jeep]){p.x+=MO.x;p.z+=MO.z;}

// ---------- Straßenmöbel, Werbung, Rampen, Pakete ----------
const BENCHES=[],SHELTERS=[],FOUNTAINS=[];
