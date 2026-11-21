'use strict';
function tree(x,z,s=1,kind){kind=kind||(rand()<.22?'pine':rand()<.2?'birch':'round');const y0=groundY(x,z);
 if(kind==='round'||kind==='birch'){const birch=kind==='birch';const h=(birch?4.2:3.1)*s*VR(.9,1.1),bx=VR(-.3,.3)*s,bz=VR(-.3,.3)*s;const bm=birch?BARK.birch:BARK.oak;
  addStatic(trunkGeo(h,(birch?.17:.3)*s,(birch?.11:.2)*s,bx,bz),bm,x,y0-.1,z);
  const tx=x+bx,tz=z+bz,ty=y0+h;const nb=birch?3:5;for(let k=0;k<nb;k++){const yaw=k/nb*Math.PI*2+VR(-.4,.4);branchAt(tx-bx*.15,ty-VR(.2,1.1)*s,tz-bz*.15,VR(1.6,2.6)*s,(birch?.07:.12)*s,yaw,VR(.55,1.05),bm);}
  const li=vrand()<.5?0:1,lm=birch?LEAF.birch:LEAF.broad[li];const key=birch?'birch':'broad'+li;const base=birch?[1,1.02,.9]:[VR(.9,1.05),1,VR(.85,1)];
  crownCards(key,lm,tx,ty+(birch?1.6:1.5)*s,tz,(birch?1.7:2.7)*s,(birch?2.3:2.0)*s,(birch?1.7:2.7)*s,birch?46:66,(birch?1.25:1.55)*s,.5,base);
  crownCards(key,lm,tx+VR(-1,1)*s,ty+.6*s,tz+VR(-1,1)*s,1.8*s,1.2*s,1.8*s,14,1.3*s,.2,base);}
 else if(kind==='pine'){const h=7.5*s*VR(.9,1.15);addStatic(trunkGeo(h,.28*s,.06*s,0,0),BARK.oak,x,y0-.1,z);
  for(let wv=0;wv<8;wv++){const t=wv/8,yy=y0+1.8*s+t*(h-1.6*s),rad=(3.0-2.5*t)*s;for(let k=0;k<7;k++){const a=k/7*Math.PI*2+VR(-.3,.3)+wv*.4;
   vP.set(x+Math.cos(a)*.15*s,yy,z+Math.sin(a)*.15*s);vE.set(1.45+(1-t)*.25+VR(-.12,.12),Math.atan2(Math.cos(a),Math.sin(a)),VR(-.2,.2),'YXZ');vQ.setFromEuler(vE);vS.set(rad*1.1,rad*1.25,rad);vM.compose(vP,vQ,vS);
   vN.set(Math.cos(a),.7,Math.sin(a));vegPush('needle',LEAF.needle,cardGeo,vM,vN,tint([.95,1,.95],.62+.38*t));}}
  crownCards('needle',LEAF.needle,x,y0+h-.3*s,z,.6*s,1*s,.6*s,6,1.6*s,.1);}
 else if(kind==='palm'){const lean=VR(0,6.28),h=VR(7,10.5)*s,lx=Math.cos(lean),lz=Math.sin(lean);
  addStatic(trunkGeo(h,.27*s,.19*s,lx*h*.12,lz*h*.12,9),BARK.palm,x,y0-.1,z);const px=x+lx*h*.12,pz=z+lz*h*.12,py=y0+h-.1;
  addStatic(GEO.blob,cm(0x6d5a3a,.95),px,py-.1,pz,0,.42*s,.5*s,.42*s);
  for(let k=0;k<3;k++){const a=k*2.1+VR(0,1);addStatic(GEO.blob,cm(0x4f3d1c,.6),px+Math.cos(a)*.32*s,py-.45*s,pz+Math.sin(a)*.32*s,0,.17*s,.2*s,.17*s);}
  const n=11;for(let k=0;k<n;k++){const yaw=k/n*Math.PI*2+VR(-.2,.2);vP.set(px,py,pz);vE.set(VR(-.35,.15),yaw,VR(-.15,.15),'YXZ');vQ.setFromEuler(vE);const sz=s*VR(.85,1.1);vS.set(sz,sz,sz);vM.compose(vP,vQ,vS);
   vN.set(Math.sin(yaw),1.1,Math.cos(yaw));vegPush('palm',LEAF.palm,frondGeo,vM,vN,tint([1,1,.95],VR(.8,1)));}
  for(let k=0;k<4;k++){const yaw=k/4*Math.PI*2+.4;vP.set(px,py+.2,pz);vE.set(-1.0,yaw,0,'YXZ');vQ.setFromEuler(vE);vS.set(.6*s,.7*s,.6*s);vM.compose(vP,vQ,vS);vN.set(Math.sin(yaw),1.5,Math.cos(yaw));vegPush('palm',LEAF.palm,frondGeo,vM,vN,tint([1.05,1.08,.9],1));}}
 else if(kind==='bush'){crownCards('bush',LEAF.bush,x,y0+.55*s,z,1.1*s,.6*s,1.1*s,14,1.0*s,.2,[1,1,1]);}
 else if(kind==='dry'){crownCards('dry',LEAF.dry,x,y0+.45*s,z,.9*s,.45*s,.9*s,10,.9*s,.1,[1,1,1]);}
 if(kind!=='bush'&&kind!=='dry')addSolid(x-.45*s,x+.45*s,z-.45*s,z+.45*s,kind==='palm'?9:5);}
// Hecke aus Blätterkarten
function hedge(x0,z0,x1,z1,h=1.2,solid=true){const L=Math.hypot(x1-x0,z1-z0),n=Math.ceil(L*2.2);for(let k=0;k<n;k++){const t=(k+vrand())/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t,y=groundY(x,z);
  crownCards('bush',LEAF.bush,x,y+h*.55,z,.55,h*.5,.55,3,.95,.3,[.9,1,.9]);}if(solid)addSolid(Math.min(x0,x1)-.5,Math.max(x0,x1)+.5,Math.min(z0,z1)-.5,Math.max(z0,z1)+.5,h);}
// Grasbüschel
function grassPatch(x,z,r,n,dry){const key=dry?'drygrass':'grass',mat=LEAF[key];for(let k=0;k<n;k++){const a=vrand()*6.28,d=Math.sqrt(vrand())*r;const px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;vP.set(px,groundY(px,pz)-.03,pz);vE.set(0,vrand()*6.28,0);vQ.setFromEuler(vE);const sz=VR(.35,.75);vS.set(sz*1.4,sz,sz);vM.compose(vP,vQ,vS);vN.set(0,1,0);vegPush(key,mat,cardGeo,vM,vN,tint([1,1,1],1));
  if(vrand()<.5){vE.set(0,vE.y+1.57,0);vQ.setFromEuler(vE);vM.compose(vP,vQ,vS);vegPush(key,mat,cardGeo,vM,vN,tint([1,1,1],.95));}}}
function cactus(x,z,s=1){const y0=groundY(x,z),h=VR(3.2,5.5)*s;const body=new THREE.CylinderGeometry(.32*s,.36*s,h,12,4);body.translate(0,h/2,0);const uv=body.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*3,uv.getY(i)*h/1.5);
 addStatic(body,cactusMat,x,y0-.05,z);addStatic(new THREE.SphereGeometry(.32*s,12,6,0,Math.PI*2,0,Math.PI/2),cactusMat,x,y0+h-.05,z);
 const arms=vrand()<.25?0:vrand()<.5?1:2;for(let k=0;k<arms;k++){const a=k*Math.PI+VR(-.5,.5),ay=h*VR(.35,.6),out=VR(.7,1.1)*s,up=VR(1,1.8)*s;
  const hx=Math.sin(a),hz=Math.cos(a);const arm=new THREE.CylinderGeometry(.2*s,.2*s,out,10);arm.rotateX(Math.PI/2);arm.translate(0,0,out/2);addStatic(arm,cactusMat,x,y0+ay,z,a);
  const up1=new THREE.CylinderGeometry(.22*s,.22*s,up,10);up1.translate(0,up/2,0);addStatic(up1,cactusMat,x+hx*out,y0+ay-.15,z+hz*out);addStatic(new THREE.SphereGeometry(.22*s,10,5,0,Math.PI*2,0,Math.PI/2),cactusMat,x+hx*out,y0+ay+up-.15,z+hz*out);}
 addSolid(x-.4*s,x+.4*s,z-.4*s,z+.4*s,h);}
function rock(x,z,s=1,solid=true){const y0=groundY(x,z);addStatic(pickR(rockGeos),rockMat,x,y0,z,vrand()*6.28,s*VR(.8,1.3),s*VR(.6,1.1),s*VR(.8,1.3));if(solid&&s>.8)addSolid(x-s*.9,x+s*.9,z-s*.9,z+s*.9,s*.9);}
function buildVegetation(){for(const k in VEG){const v=VEG[k];const cnt=v.c.length/3;if(!cnt)continue;const geo=v.geo.clone();geo.setAttribute('aN',new THREE.InstancedBufferAttribute(new Float32Array(v.n),3));
  const im=new THREE.InstancedMesh(geo,v.mat,cnt);im.instanceMatrix.array.set(v.m);im.instanceMatrix.needsUpdate=true;im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(v.c),3);
  const base=new Float32Array(im.instanceMatrix.array),xz=new Float32Array(cnt*2);for(let i=0;i<cnt;i++){xz[i*2]=base[i*16+12];xz[i*2+1]=base[i*16+14];}
  vegLodGroups.push({im,base,xz,cnt});im.castShadow=!v.key.includes('grass');im.receiveShadow=true;im.computeBoundingSphere();if(im.boundingSphere)im.boundingSphere.radius+=3;scene.add(im);delete VEG[k];}}
function vegTick(dt){VEGU.uTime.value+=dt;VEGU.uWind.value=1+(typeof WX!=='undefined'&&WX?(WX.rain||0)*1.6+(WX.cloud||0)*.5:0);}
function hash2(x,z,k){let h=(x*374761393+z*668265263+k*2147483647)|0;h=(h^(h>>>13))*1274126177|0;return ((h^(h>>>16))>>>0)/4294967296;}
function initGrass(){const cap=({potato:760,leicht:2600,normal:6000,ultra:10000}[SET.gfxPreset]||6000);GRASS.cap=cap;
 for(const k of ['grass','drygrass','meadow']){const geo=cardGeo.clone();const an=new Float32Array(cap*3);for(let i=0;i<cap;i++)an[i*3+1]=1;geo.setAttribute('aN',new THREE.InstancedBufferAttribute(an,3));
  const im=new THREE.InstancedMesh(geo,LEAF[k],cap);im.count=0;im.frustumCulled=false;im.castShadow=false;im.receiveShadow=true;im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(cap*3).fill(1),3);scene.add(im);GRASS.ims.push(im);}}
function grassExcluded(x,z){if(typeof FLAT_EX!=='undefined')for(const r of FLAT_EX)if(x>r[0]&&x<r[1]&&z>r[2]&&z<r[3])return true;if(x>-HALF-ROAD/2-2&&x<HALF+ROAD/2+2&&z>-HALF-ROAD/2-2&&z<COAST+2)return true;if(x>AIRX0-12&&x<AIRX1+12&&z>AIRZ0-12&&z<AIRZ1+12)return true;
 for(const q of ZONES){if(q.region||q.ring)continue;if(q.cx!=null){if(Math.hypot(x-q.cx,z-q.cz)<(q.r||0)*.6)return true;continue;}if(x>q.x0-2&&x<q.x1+2&&z>q.z0-2&&z<q.z1+2)return true;}
 for(const k in SITES){const s=SITES[k];if(s.pad&&x>s.x0&&x<s.x1&&z>s.z0&&z<s.z1)return true;}return false;}
function grassTick(){if(!GRASS.ims.length)return;const cx=camera.position.x,cz=camera.position.z;const high=camera.position.y-groundY(cx,cz)>70;
 if(high){if(!GRASS.hidden){for(const im of GRASS.ims)im.count=0;GRASS.hidden=true;GRASS.ax=1e9;}return;}GRASS.hidden=false;
 const ax=Math.round(cx/10)*10,az=Math.round(cz/10)*10;if(ax===GRASS.ax&&az===GRASS.az)return;GRASS.ax=ax;GRASS.az=az;
 const R=({potato:18,leicht:32,normal:52,ultra:66}[SET.gfxPreset]||52),C=3.2,n=[0,0,0],cap=GRASS.cap,ims=GRASS.ims;const zx=Math.floor((ax-R)/C),zx1=Math.floor((ax+R)/C),zz=Math.floor((az-R)/C),zz1=Math.floor((az+R)/C);
 const zoneSkip=new Map();
 for(let iz=zz;iz<=zz1;iz++)for(let ix=zx;ix<=zx1;ix++){const bx=ix*C,bz=iz*C;const dx=bx-ax,dz=bz-az;if(dx*dx+dz*dz>R*R)continue;
  const ck=(Math.floor(bx/40))*100003+Math.floor(bz/40);let ex=zoneSkip.get(ck);if(ex===undefined){ex=grassExcluded(bx+20,bz+20)&&grassExcluded(bx,bz)&&grassExcluded(bx+39,bz+39);zoneSkip.set(ck,ex);}if(ex)continue;
  const w=gridSample(TGR,bx,bz)/255;if(w<.25)continue;
  for(let k=0;k<3;k++){if(hash2(ix,iz,k*7+1)>w*w*.9)continue;const x=bx+hash2(ix,iz,k*7+2)*C,z=bz+hash2(ix,iz,k*7+3)*C;if(grassExcluded(x,z))continue;if(roadAt(x,z,1.2))continue;const h=terrainH(x,z);if(h<SEA_Y+.25)continue;
   const dry=gridSample(TDRY,x,z)/255;const hr=hash2(ix,iz,k*7+4);const t=hr<sstep(.5,.85,dry)?1:hr>.86?2:0;if(n[t]>=cap)continue;const im=ims[t];
   const sz=.32+hash2(ix,iz,k*7+5)*.45;vP.set(x,h-.1,z);vE.set(0,hash2(ix,iz,k*7+6)*6.28,0);vQ.setFromEuler(vE);vS.set(sz*1.5,sz*(.8+dry*.3),sz);vM.compose(vP,vQ,vS);im.setMatrixAt(n[t],vM);
   const v=.78+hash2(ix,iz,k*7+8)*.34;im.instanceColor.setXYZ(n[t],v,v*(.97+hash2(ix,k,iz)*.06),v*.92);n[t]++;
   if(n[t]<cap){vE.y+=1.57;vQ.setFromEuler(vE);vS.x*=.85;vM.compose(vP,vQ,vS);im.setMatrixAt(n[t],vM);im.instanceColor.setXYZ(n[t],v*.95,v*.95,v*.88);n[t]++;}}}
 for(let t=0;t<3;t++){const im=ims[t];im.count=n[t];im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;}}
function waterDepthAt(x,z){let d=landD(x,z)>0&&!(z>COAST&&x>-850&&x<1000&&terrainH(x,z)<SEA_Y-.02)?0:SEA_Y-terrainH(x,z);const r=Math.hypot(x-IX,z-IZ);if(r<IR+300)d=Math.min(d,(r-IR-2)*.09);return Math.max(0,d);}
// Ruhiges Wasser an Stegen (Wellen sollen die Holzstege nicht überspülen)
function calmAt(x,z){let best=1e9;for(const r of [[PIERX-5.2,PIERX+5.2,WATER_Z-14,WATER_Z+68],[JX-3.4,JX+3.4,WATER_Z-16,JZ1]]){const dx=Math.max(r[0]-x,0,x-r[1]),dz=Math.max(r[2]-z,0,z-r[3]);best=Math.min(best,Math.hypot(dx,dz));}const s=clamp((best-22)/55,0,1);return 1-s*s*(3-2*s);}
function bakeWaterDepth(){const n=WDEPTH.n,d=WDEPTH.data||(WDEPTH.data=new Uint8Array(n*n*4));
 for(let j=0;j<n;j++){const z=WDEPTH.z0+(j+.5)/n*(WDEPTH.z1-WDEPTH.z0);for(let i=0;i<n;i++){const x=WDEPTH.x0+(i+.5)/n*(WDEPTH.x1-WDEPTH.x0);const v=clamp(waterDepthAt(x,z),0,48)/48;const k=(j*n+i)*4;d[k]=Math.round(v*255);d[k+1]=Math.round(Math.min(1,v*8)*255);d[k+2]=Math.round(calmAt(x,z)*255);d[k+3]=255;}}
 if(!WDEPTH.tex){WDEPTH.tex=new THREE.DataTexture(d,n,n,THREE.RGBAFormat);WDEPTH.tex.magFilter=WDEPTH.tex.minFilter=THREE.LinearFilter;WDEPTH.tex.wrapS=WDEPTH.tex.wrapT=THREE.ClampToEdgeWrapping;}
 WDEPTH.tex.needsUpdate=true;}
function makeWaterMat(o={}){const u=Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uAmp:{value:o.amp??1},uFade:{value:o.fade??1e6},uConstDepth:{value:o.depth??-1},uHole:{value:o.hole??0},uTint:{value:o.tint??1},uFragDepth:{value:o.fragDepth?1:0},
  uShallow:{value:new THREE.Color(o.shallow??0x1a9a98)},uMid:{value:new THREE.Color(o.mid??0x08426e)},uDeep:{value:new THREE.Color(o.deep??0x021230)}});
 for(const k in WATER_UNI)u[k]=WATER_UNI[k];
 const m=new THREE.ShaderMaterial({uniforms:u,vertexShader:WATER_VS,fragmentShader:WATER_FS,fog:true});m.userData.water=true;return m;}
function seaAmp(x,z){const cl=1-calmAt(x,z)*.9,s=clamp(clamp(waterDepthAt(x,z),0,48)/7,0,1),u=WATER_UNI.uCam.value,q=clamp((Math.hypot(x-u.x,z-u.y)-504)/196,0,1);return cl*s*s*(3-2*s)*(1-q*q*(3-2*q));}
function seaWaveY(x,z,amp){if(!(amp>0))return 0;const t=WATER_UNI.uTime.value;let ox=0,oz=0;
 for(const w of GWAVES){const a=w.st*amp/w.k*Math.cos(w.k*(w.dx*x+w.dz*z-w.c*t));ox+=w.dx*a;oz+=w.dz*a;}
 x-=ox;z-=oz;let y=0;for(const w of GWAVES)y+=w.st*amp/w.k*Math.sin(w.k*(w.dx*x+w.dz*z-w.c*t));return y;}
function seaSurfaceY(x,z){return SEA_Y+seaWaveY(x,z,seaAmp(x,z));}
function boatFloat(c,dt){if(!(c._ampT>0)){c._amp=seaAmp(c.pos.x,c.pos.z);c._ampT=.3;}c._ampT-=dt;const A=c._amp,x=c.pos.x,z=c.pos.z,fx=Math.sin(c.h),fz=Math.cos(c.h),L=2.3,W=1.1;
 const y0=seaWaveY(x,z,A),yf=seaWaveY(x+fx*L,z+fz*L,A),yb=seaWaveY(x-fx*L,z-fz*L,A),yl=seaWaveY(x+fz*W,z-fx*W,A),yr=seaWaveY(x-fz*W,z+fx*W,A);
 const k=Math.min(1,dt*7),ty=(y0*2+yf+yb)/4;c._wy=c._wy==null?ty:c._wy+(ty-c._wy)*k;c._wp=(c._wp||0)+(-Math.atan2(yf-yb,2*L)-(c._wp||0))*k;c._wr=(c._wr||0)+(Math.atan2(yl-yr,2*W)-(c._wr||0))*k;
 return SEA_Y-.12+c._wy;}
function waterTick(dt){const t=WATER_UNI.uTime.value+=dt;
 const cx=Math.round(camera.position.x/OCEAN_STEP)*OCEAN_STEP,cz=Math.round(camera.position.z/OCEAN_STEP)*OCEAN_STEP;oceanNear.position.x=cx;oceanNear.position.z=cz;WATER_UNI.uCam.value.set(cx,cz);
 const sd=WATER_UNI.uSunDir.value;if(typeof sunDir!=='undefined'){if(sunDir.y>-.03)sd.copy(sunDir);else sd.set(-sunDir.x,Math.max(.12,-sunDir.y),.3).normalize();}
 const day=1-night;WATER_UNI.uNight.value=night;WATER_UNI.uSunCol.value.copy(sun.color).multiplyScalar(Math.max(.18,sun.intensity/3.4));
 WATER_UNI.uSkyH.value.copy(scene.fog.color);WATER_UNI.uSkyZ.value.setRGB(.012+.17*day,.02+.33*day,.05+.66*day);}
function itx(w,h,draw){const t=canvasTex(w,h,draw);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
function grain(g,w,h,base,dark,light,n){g.fillStyle=base;g.fillRect(0,0,w,h);
 for(let i=0;i<n;i++){const y=IRND()*h,amp=1+IRND()*4,f=.01+IRND()*.04;g.strokeStyle=`rgba(${IRND()<.6?dark:light},${.06+IRND()*.2})`;g.lineWidth=.5+IRND()*2.4;g.beginPath();for(let x=-4;x<=w+4;x+=8){const yy=y+Math.sin(x*f+i)*amp+Math.sin(x*.11+i*3)*.6;x<0?g.moveTo(x,yy):g.lineTo(x,yy);}g.stroke();}
 for(let k=0;k<3;k++){const x=IRND()*w,y=IRND()*h;for(let r=9;r>1;r-=2){g.strokeStyle=`rgba(${dark},${.1+.05*(9-r)})`;g.lineWidth=1.2;g.beginPath();g.ellipse(x,y,r*1.8,r*.6,0,0,7);g.stroke();}}}
// ---------- Baukasten: lokale Koordinaten (x quer, z nach vorn), Boden auf Höhe F ----------
function IK(x,z,ry=0,F=IF){const c=Math.cos(ry),s=Math.sin(ry);const W=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c];
 const o0={noShadow:true};
 return {F,ry,W,
  b(lx,ly,lz,w,h,d,mat,o){const [wx,wz]=W(lx,lz);const oo=o?Object.assign({noShadow:true},o):o0;let sd=oo.side,tp=oo.top;if(mat.map&&!sd&&!tp){if(mat.userData.fit){sd=[w,h];tp=[w,d];}else{sd=[1,1];tp=[1,1];}}addStatic(boxG(w,h,d,sd,tp),mat,wx,F+ly,wz,ry+(oo.ry||0),1,1,1,oo);},
  c(lx,ly,lz,r,h,mat,o){const [wx,wz]=W(lx,lz);const oo=o?Object.assign({noShadow:true},o):o0;addStatic(oo.seg?new THREE.CylinderGeometry(1,1,1,oo.seg):GEO.cyl,mat,wx,F+ly+h/2,wz,ry+(oo.ry||0),r*(oo.sx||1),h,r*(oo.sz||1),oo);},
  g(geo,mat,lx,ly,lz,sx=1,sy=1,sz=1,o){const [wx,wz]=W(lx,lz);const oo=o?Object.assign({noShadow:true},o):o0;addStatic(geo,mat,wx,F+ly,wz,ry+(oo.ry||0),sx,sy,sz,oo);},
  ao(lx,lz,w,d,a=1){const [wx,wz]=W(lx,lz);addStatic(AOGEO,IM.aoMat,wx,F+.012,wz,ry,w*1.25*a,1,d*1.25*a,o0);},
  s(lx,lz,w,d,h){const P=[[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2]].map(([a,b])=>W(lx+a,lz+b));const xs=P.map(p=>p[0]),zs=P.map(p=>p[1]);return addSolid(Math.min(...xs),Math.max(...xs),Math.min(...zs),Math.max(...zs),F+h);}};}
function regInterior(o){if(o.fy==null)o.fy=IF;INTERIORS.push(o);if(!o.lights)o.lights=[];return o;}
function interiorAt(x,z){let best=null,ba=1e18;for(const I of INTERIORS)if(x>I.x0&&x<I.x1&&z>I.z0&&z<I.z1){const a=(I.x1-I.x0)*(I.z1-I.z0);if(a<ba){ba=a;best=I;}}return best;}
function iLight(I,x,y,z,int=38,dist=15,col=0xfff0dc){I.lights.push({x,y,z,int,dist,col:new THREE.Color(col)});}
function segBlocked(ax,az,bx,bz,r=.36){const dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz),n=Math.ceil(L/.4);
 for(let i=1;i<n;i++){const t=i/n,x=ax+dx*t,z=az+dz*t;for(const b of solidsNear(x,z,r+.4)){if(b.open||b.camOnly)continue;if(x+r>b.x0&&x-r<b.x1&&z+r>b.z0&&z-r<b.z1)return true;}}return false;}
function outerInterior(x,z){let best=null,ba=-1;for(const I of INTERIORS)if(x>I.x0&&x<I.x1&&z>I.z0&&z<I.z1){const a=(I.x1-I.x0)*(I.z1-I.z0);if(a>ba){ba=a;best=I;}}return best;}
function navRegion(I){if(I._nav)return I._nav;const m=10,x0=I.x0-m,z0=I.z0-m,nx=Math.ceil((I.x1-I.x0+2*m)/INAVC),nz=Math.ceil((I.z1-I.z0+2*m)/INAVC);
 const st=new Uint8Array(nx*nz),dr=new Int16Array(nx*nz).fill(-1),dm=new Map();IDOORS.forEach((d,i)=>dm.set(d.solid,i));
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+(i+.5)*INAVC,z=z0+(j+.5)*INAVC,k=j*nx+i;
  for(const b of solidsNear(x,z,INAVR+.6)){if(b.camOnly||b.water)continue;if(x+INAVR>b.x0&&x-INAVR<b.x1&&z+INAVR>b.z0&&z-INAVR<b.z1){const di=dm.get(b);if(di!=null)dr[k]=di;else{st[k]=1;break;}}}}
 // Durchgänge (Türen + Maueröffnungen) freiräumen, damit schmale Türen im Raster nicht verschwinden
 const clr=(cx,cz,alongX,w,di)=>{const hw=Math.max(.2,w/2-.12);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+(i+.5)*INAVC,z=z0+(j+.5)*INAVC;const a=alongX?x-cx:z-cz,c=alongX?z-cz:x-cx;if(Math.abs(a)<=hw&&Math.abs(c)<=.85){const k=j*nx+i;st[k]=0;if(di!=null)dr[k]=di;}}};
 for(const o of IOPEN)if(o.x>x0&&o.x<x0+nx*INAVC&&o.z>z0&&o.z<z0+nz*INAVC)clr(o.x,o.z,o.alongX,o.w,null);
 IDOORS.forEach((d,i)=>{if(d.x>x0&&d.x<x0+nx*INAVC&&d.z>z0&&d.z<z0+nz*INAVC)clr(d.x,d.z,d.axis!=='z',d.w,i);});
 return I._nav={x0,z0,nx,nz,st,dr,ff:null,fk:'',ft:-9};}
function navField(R,tx,tz){const ti=clamp(Math.floor((tx-R.x0)/INAVC),0,R.nx-1),tj=clamp(Math.floor((tz-R.z0)/INAVC),0,R.nz-1);
 let dv=0;for(let i=0;i<IDOORS.length;i++){const d=IDOORS[i];if(d.lock&&!d.force)dv=(dv*31+i+1)|0;}
 const key=ti+','+tj+'|'+dv;if(R.ff&&(R.fk===key||time-R.ft<.35&&R.fdv===dv))return R.ff;
 const N=R.nx*R.nz,D=R.ff||new Float32Array(N);D.fill(1e9);
 const pass=k=>{if(R.st[k])return false;const di=R.dr[k];if(di<0)return true;const d=IDOORS[di];return !(d.lock&&!d.force);};
 let s=-1;for(let r=0;r<8&&s<0;r++)for(let dj=-r;dj<=r&&s<0;dj++)for(let di=-r;di<=r;di++){const i=ti+di,j=tj+dj;if(i<0||j<0||i>=R.nx||j>=R.nz)continue;const k=j*R.nx+i;if(pass(k)){s=k;break;}}
 R.ff=D;R.fk=key;R.ft=time;R.fdv=dv;if(s<0)return D;
 const q=R.q||(R.q=new Int32Array(N));let h=0,t=0;q[t++]=s;D[s]=0;
 while(h<t){const k=q[h++],i=k%R.nx,d=D[k]+1;
  if(i>0&&D[k-1]>d&&pass(k-1)){D[k-1]=d;q[t++]=k-1;}if(i<R.nx-1&&D[k+1]>d&&pass(k+1)){D[k+1]=d;q[t++]=k+1;}
  if(k>=R.nx&&D[k-R.nx]>d&&pass(k-R.nx)){D[k-R.nx]=d;q[t++]=k-R.nx;}if(k+R.nx<N&&D[k+R.nx]>d&&pass(k+R.nx)){D[k+R.nx]=d;q[t++]=k+R.nx;}}
 return D;}
function navFieldFixed(R,tx,tz){const ti=clamp(Math.floor((tx-R.x0)/INAVC),0,R.nx-1),tj=clamp(Math.floor((tz-R.z0)/INAVC),0,R.nz-1),N=R.nx*R.nz,D=new Float32Array(N).fill(1e9);
 const pass=k=>{if(R.st[k])return false;const di=R.dr[k];if(di<0)return true;const d=IDOORS[di];return !(d.lock&&!d.force);};
 let s=-1;for(let r=0;r<8&&s<0;r++)for(let dj=-r;dj<=r&&s<0;dj++)for(let di=-r;di<=r;di++){const i=ti+di,j=tj+dj;if(i<0||j<0||i>=R.nx||j>=R.nz)continue;const k=j*R.nx+i;if(pass(k)){s=k;break;}}
 if(s<0)return D;const q=new Int32Array(N);let h=0,t=0;q[t++]=s;D[s]=0;
 while(h<t){const k=q[h++],i=k%R.nx,d=D[k]+1;
  if(i>0&&D[k-1]>d&&pass(k-1)){D[k-1]=d;q[t++]=k-1;}if(i<R.nx-1&&D[k+1]>d&&pass(k+1)){D[k+1]=d;q[t++]=k+1;}
  if(k>=R.nx&&D[k-R.nx]>d&&pass(k-R.nx)){D[k-R.nx]=d;q[t++]=k-R.nx;}if(k+R.nx<N&&D[k+R.nx]>d&&pass(k+R.nx)){D[k+R.nx]=d;q[t++]=k+R.nx;}}
 return D;}
// Laufrichtung um Wände/Möbel herum (null = direkter Weg ist frei)
function npcNav(n,tx,tz,dt,fieldFn,I0){const g=n.c.g.position;n.navT=(n.navT||0)-dt;if(n.navT>0)return n.navDir;n.navT=.2+Math.random()*.08;n.navDir=null;
 const I=I0||outerInterior(tx,tz)||outerInterior(g.x,g.z);if(!I||!segBlocked(g.x,g.z,tx,tz))return null;
 const R=navRegion(I),ci=Math.floor((g.x-R.x0)/INAVC),cj=Math.floor((g.z-R.z0)/INAVC);if(ci<0||cj<0||ci>=R.nx||cj>=R.nz)return null;
 const D=fieldFn?fieldFn(R):navField(R,tx,tz);let k=cj*R.nx+ci;
 if(D[k]>=1e9){let bk=-1,bd=1e9;for(let dj=-2;dj<=2;dj++)for(let di=-2;di<=2;di++){const i=ci+di,j=cj+dj;if(i<0||j<0||i>=R.nx||j>=R.nz)continue;const kk=j*R.nx+i;if(D[kk]<bd){bd=D[kk];bk=kk;}}if(bk<0||bd>=1e9)return null;k=bk;}
 const path=[k];for(let s=0;s<12&&D[k]>0;s++){const i=k%R.nx,j=(k-i)/R.nx;let nk=-1,nd=D[k];
  for(const [di,dj] of INB8){const i2=i+di,j2=j+dj;if(i2<0||j2<0||i2>=R.nx||j2>=R.nz)continue;const kk=j2*R.nx+i2;if(di&&dj&&(D[j*R.nx+i2]>=1e9||D[j2*R.nx+i]>=1e9))continue;const v=D[kk]+(di&&dj?.42:0);if(v<nd){nd=v;nk=kk;}}
  if(nk<0)break;k=nk;path.push(k);}
 const cen=kk=>{const i=kk%R.nx,j=(kk-i)/R.nx;return [R.x0+(i+.5)*INAVC,R.z0+(j+.5)*INAVC];};
 let tgt=null;for(let p=path.length-1;p>=1;p--){const c=cen(path[p]);if(!segBlocked(g.x,g.z,c[0],c[1],.3)){tgt=c;break;}}
 if(!tgt&&path.length>1)tgt=cen(path[1]);if(!tgt)return null;
 const dx=tgt[0]-g.x,dz=tgt[1]-g.z,l=Math.hypot(dx,dz);if(l<.05)return null;return n.navDir=[dx/l,dz/l];}
function intLightTick(dt){const cx=camera.position.x,cz=camera.position.z;ilCand.length=0;
 for(const I of INTERIORS){const dx=Math.max(I.x0-cx,0,cx-I.x1),dz=Math.max(I.z0-cz,0,cz-I.z1);if(dx*dx+dz*dz>55*55)continue;for(const L of I.lights)ilCand.push({L,d:(L.x-cx)**2+(L.z-cz)**2+(dx||dz?400:0)});}
 ilCand.sort((a,b)=>a.d-b.d);
 for(let i=0;i<ILP.length;i++){const p=ILP[i],c=ilCand[i];if(!c){p.cur=Math.max(0,p.cur-dt*3);p.l.intensity=p.cur*(p.base||0);if(p.cur<=0)p.key=null;continue;}
  if(p.key!==c.L){p.key=c.L;p.cur=0;p.base=c.L.int;p.l.position.set(c.L.x,c.L.y,c.L.z);p.l.distance=c.L.dist;p.l.color.copy(c.L.col);}
  p.cur=Math.min(1,p.cur+dt*4);p.l.intensity=p.cur*p.base;}}
function iDoor(o){// o:{x,z,y,axis:'x'|'z',w,h,type:'slide'|'swing'|'roll'|'vault',mat,car,inward(+1/-1),hinge(-1/1),r}
 const g=new THREE.Group();g.position.set(o.x+SX,(o.y??IF)+SY,o.z+SZ);if(o.axis==='z')g.rotation.y=Math.PI/2;scene.add(g);const parts=[];const W=o.w,H=o.h;
 if(o.type==='slide'){for(const s of [-1,1]){const p=new THREE.Group();p.add(mesh(new THREE.BoxGeometry(W/2-.04,H-.08,.06),IM.glassT,0,H/2,0,false));p.add(mesh(new THREE.BoxGeometry(W/2,.08,.09),IM.steel,0,H-.04,0,false),mesh(new THREE.BoxGeometry(W/2,.08,.09),IM.steel,0,.04,0,false),mesh(new THREE.BoxGeometry(.06,H,.09),IM.steel,s*(W/4-.03),H/2,0,false),mesh(new THREE.BoxGeometry(.04,.5,.12),IM.chrome,-s*(W/4-.12),1.05,0,false));p.position.x=s*W/4;p.userData.s=s;g.add(p);parts.push(p);}}
 else if(o.type==='swing'||o.type==='vault'){const hg=o.hinge||-1;const piv=new THREE.Group();piv.position.x=hg*W/2;g.add(piv);
  if(o.type==='vault'){const R=H/2;const dm=new THREE.Mesh(new THREE.CylinderGeometry(R,R,.55,40),IM.steel);dm.rotation.x=Math.PI/2;dm.position.set(-hg*R,R,0);piv.add(dm);dm.castShadow=true;
   for(let k=0;k<12;k++){const a=k/12*Math.PI*2;const bolt=mesh(new THREE.CylinderGeometry(.09,.09,.6,10),IM.chrome,-hg*R+Math.cos(a)*R*.82,R+Math.sin(a)*R*.82,0,false);bolt.rotation.x=Math.PI/2;piv.add(bolt);}
   const hub=mesh(new THREE.CylinderGeometry(.32,.32,.7,20),IM.chrome,-hg*R,R,.08,false);hub.rotation.x=Math.PI/2;piv.add(hub);const wheel=new THREE.Group();wheel.position.set(-hg*R,R,.42);for(let k=0;k<3;k++){const sp=mesh(new THREE.BoxGeometry(1.5,.08,.08),IM.chrome,0,0,0,false);sp.rotation.z=k*Math.PI/3;wheel.add(sp);}const rim=new THREE.Mesh(new THREE.TorusGeometry(.75,.05,8,32),IM.chrome);wheel.add(rim);piv.add(wheel);o.wheel=wheel;
   const ring=new THREE.Mesh(new THREE.TorusGeometry(R*.93,.06,8,40),IM.darkM);ring.position.set(-hg*R,R,.29);piv.add(ring);}
  else{const p=mesh(new THREE.BoxGeometry(W-.06,H-.04,.06),o.mat||IM.walnut,-hg*(W/2),H/2,0,false);piv.add(p);const kn=mesh(new THREE.SphereGeometry(.045,10,8),IM.brass,-hg*(W-.16),1.05,(o.inward||1)*-.06,false);piv.add(kn);const kn2=kn.clone();kn2.position.z*=-1;piv.add(kn2);
   if(o.glass){p.material=o.mat||IM.walnut;const gp=mesh(new THREE.BoxGeometry(W*.6,H*.45,.07),IM.glassT,-hg*(W/2),H*.62,0,false);piv.add(gp);}}
  parts.push(piv);}
 else if(o.type==='roll'){const p=mesh(new THREE.BoxGeometry(W,H,.08),IM.roll,0,H/2,0,true);g.add(p);parts.push(p);const box=mesh(new THREE.BoxGeometry(W+.2,.45,.45),IM.greyM,0,H+.22,-.1,true);g.add(box);
  const tex=IM.roll.map;p.material=new THREE.MeshStandardMaterial({map:tex,roughness:.45,metalness:.6});p.material.map=tex.clone();p.material.map.needsUpdate=true;p.material.map.repeat.set(W/2,H/1.4);}
 const ax=o.axis==='z';const solid=ax?addSolid(o.x-.25,o.x+.25,o.z-W/2,o.z+W/2,(o.y??IF)+H):addSolid(o.x-W/2,o.x+W/2,o.z-.25,o.z+.25,(o.y??IF)+H);
 const d=Object.assign({g,parts,open:0,lock:!!o.lock,force:0,solid,snd:0},o);IDOORS.push(d);return d;}
function doorTick(dt){const c=P.inCar,px=c?c.pos.x:P.pos.x,pz=c?c.pos.z:P.pos.z;
 for(const d of IDOORS){const ax=d.axis==='z';const along=ax?Math.abs(pz-d.z):Math.abs(px-d.x),across=ax?Math.abs(px-d.x):Math.abs(pz-d.z);
  let want=0;if(d.force)want=1;else if(!d.lock&&!(c&&!d.car)){const r=c?(d.car?10:0):(d.r||3.4);if(along<d.w/2+(c?2:1.2)&&across<r)want=1;}
  if(!want&&!d.lock)for(const n of peds){if(!(n.kind==='cop'||n.mission||n.navDir||n.ipDoor))continue;const q=n.c.g.position;const al=ax?Math.abs(q.z-d.z):Math.abs(q.x-d.x),ac=ax?Math.abs(q.x-d.x):Math.abs(q.z-d.z);if(al<d.w/2+.8&&ac<2.2){want=1;break;}}
  if(want&&d.open<.05&&d.snd<=0){d.snd=1;try{if(d.type==='roll')tone(90,.6,'sawtooth',.03,d.g.position);else if(d.type!=='vault')doorSound();}catch(e){}}if(!want)d.snd=Math.max(0,d.snd-dt);
  const sp=d.type==='vault'?.25:d.type==='roll'?1.1:want?4.5:2.2;d.open+=clamp(want-d.open,-sp*dt,sp*dt);const o=d.open,e=o*o*(3-2*o);
  if(d.type==='slide')for(const p of d.parts)p.position.x=p.userData.s*(d.w/4+e*d.w/2*.92);
  else if(d.type==='swing'||d.type==='vault'){d.parts[0].rotation.y=(d.hinge||-1)*(d.inward||1)*e*(d.type==='vault'?1.75:1.5);if(d.wheel)d.wheel.rotation.z=e*7;}
  else if(d.type==='roll'){const p=d.parts[0];p.scale.y=Math.max(.05,1-e*.95);p.position.y=d.h-(d.h*p.scale.y)/2;}
  d.solid.open=d.open>.62;}}
function iStaff(x,z,face,anim,skin){ISTAFF.push({x,z,face,anim,skin});}
function initStaff(){for(const s of ISTAFF){const p=puppet(s.x,s.z,s.face,s.anim,{skin:s.skin,group:'staff'});p.far=70;p.staff=s;}
 for(const d of IDECO)if(d.kind==='car'){const c=makeCar(pick([0x1f5fbf,0xc0392b,0xf2f2f2,0x2c3e50]),false,pick(['sedan','sport','suv']));const [x,z]=d.k.W(0,0);c.g.position.set(x,d.y,z);c.g.rotation.y=d.k.ry;c.mode='deco';d.car=c;}}
// ---------- Wandbau: Außenhaut + Innenputz, Öffnungen für Türen/Fenster ----------
// side: 'n'(z0) 's'(z1) 'w'(x0) 'e'(x1); ops: [{c (Mitte entlang der Wand), w, y (Brüstung), h}]
function iWall(x0,z0,x1,z1,o){const t=o.t??.3,H=o.h,F=o.F??IF,ax=Math.abs(x1-x0)>Math.abs(z1-z0);const L=ax?x1-x0:z1-z0,a0=ax?x0:z0;
 const ops=(o.ops||[]).slice().sort((p,q)=>p.c-q.c);let cur=a0;const segs=[];
 for(const p of ops){const s=p.c-p.w/2,e=p.c+p.w/2;if(s>cur)segs.push([cur,s,0,H]);if((p.y||0)>0)segs.push([s,e,0,p.y]);const top=(p.y||0)+p.h;if(top<H)segs.push([s,e,top,H]);cur=e;}
 if(cur<a0+L)segs.push([cur,a0+L,0,H]);
 const nIn=o.inDir||1;// +1: Innenseite liegt in +Normalenrichtung
 for(const [s,e,y0,y1] of segs){const len=e-s,mid=(s+e)/2;if(len<.01||y1-y0<.01)continue;
  const cx=ax?mid:x0,cz=ax?z0:mid;const w=ax?len:t,d=ax?t:len;
  if(o.outMat&&o.inMat){const half=t/2;const ox=ax?0:-nIn*half/2,oz=ax?-nIn*half/2:0;
   addStatic(boxG(ax?len:half,y1-y0,ax?half:len,o.outSide||[4,4]),o.outMat,cx+ox,F+y0-.01,cz+oz,0,1,1,1,{noShadow:!!o.noShadow});
   addStatic(boxG(ax?len:half,y1-y0,ax?half:len,o.inSide||[3,3]),o.inMat,cx-ox,F+y0-.01,cz-oz,0,1,1,1,{noShadow:true});}
  else addStatic(boxG(w,y1-y0,d,o.inSide||[3,3]),o.inMat||o.outMat,cx,F+y0-.01,cz,0,1,1,1,{noShadow:o.noShadow??true});
  if(y0<1.9)addSolid(cx-w/2,cx+w/2,cz-d/2,cz+d/2,F+y1);
  if(o.base&&y0===0)addStatic(boxG(ax?len:.03,.12,ax?.03:len),o.base,cx+(ax?0:nIn*(t/2+.015)),F,cz+(ax?nIn*(t/2+.015):0),0,1,1,1,{noShadow:true});}
 for(const p of ops){const pcx=ax?p.c:x0,pcz=ax?z0:p.c;if(!p.glass&&(p.y||0)<.05&&p.h>=1.9)IOPEN.push({x:pcx,z:pcz,alongX:ax,w:p.w});
  if(p.glass&&(p.y||0)<1.9){const w=ax?p.w:t,d=ax?t:p.w;addSolid(pcx-w/2,pcx+w/2,pcz-d/2,pcz+d/2,F+(p.y||0)+p.h);}}
 for(const p of ops)if(p.glass){const cx=ax?p.c:x0,cz=ax?z0:p.c;addStatic(boxG(ax?p.w:.05,p.h,ax?.05:p.w),IM.glass,cx,F+(p.y||0),cz,0,1,1,1,{noShadow:true});
  const fr=o.frame||IM.whiteP;for(const yy of [p.y||0,(p.y||0)+p.h-.06])addStatic(boxG(ax?p.w:.12,.06,ax?.12:p.w),fr,cx,F+yy,cz,0,1,1,1,{noShadow:true});for(const s of [-1,1])addStatic(boxG(ax?.06:.12,p.h,ax?.12:.06),fr,cx+(ax?s*(p.w/2-.03):0),F+(p.y||0),cz+(ax?0:s*(p.w/2-.03)),0,1,1,1,{noShadow:true});
  if(p.mull)addStatic(boxG(ax?.05:.1,p.h,ax?.1:.05),fr,cx,F+(p.y||0),cz,0,1,1,1,{noShadow:true});}}
// Raum mit Boden, Decke, vier Wänden
function iRoom(o){const {x0,x1,z0,z1,h}=o,F=o.F??IF;const w=x1-x0,d=z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2;
 if(o.floor)addStatic(boxG(w,.04,d,null,o.floorT||[2,2]),o.floor,cx,F-.035,cz,0,1,1,1,{noShadow:true});
 if(o.ceil!==false)addStatic(boxG(w,.08,d,null,[3,3]),o.ceil||IM.plaster,cx,F+h,cz,0,1,1,1,{noShadow:true});
 const base={h,t:o.t??.3,F,outMat:o.outMat,inMat:o.inMat,outSide:o.outSide,inSide:o.inSide,base:o.base,frame:o.frame,noShadow:o.wallNoShadow};
 const W=o.walls||{};
 if(o.ao!==false)for(const [ax,az,sx,sz] of [[cx,z0+.42,w,.9],[cx,z1-.42,w,.9],[x0+.42,cz,.9,d],[x1-.42,cz,.9,d]])addStatic(AOGEO,IM.aoMat,ax,F+.011,az,0,sx*1.02,1,sz,{noShadow:true});
 if(W.n!==false)iWall(x0,z0,x1,z0,Object.assign({},base,{ops:W.n||[],inDir:1}));
 if(W.s!==false)iWall(x0,z1,x1,z1,Object.assign({},base,{ops:W.s||[],inDir:-1}));
 if(W.w!==false)iWall(x0,z0,x0,z1,Object.assign({},base,{ops:W.w||[],inDir:1}));
 if(W.e!==false)iWall(x1,z0,x1,z1,Object.assign({},base,{ops:W.e||[],inDir:-1}));}
function iLampPanel(x,y,z,w,d,mat){addStatic(boxG(w,.06,d),mat||IM.lampW,x,y-.07,z,0,1,1,1,{noShadow:true});addStatic(boxG(w+.08,.04,d+.08),IM.whiteP,x,y-.03,z,0,1,1,1,{noShadow:true});}
function sub(k,lx,lz,r=0){const [x,z]=k.W(lx,lz);return IK(x,z,k.ry+r,k.F);}
function legs4(k,w,d,h,r,mat,inset=.06){for(const sx of [-1,1])for(const sz of [-1,1])k.c(sx*(w/2-inset),0,sz*(d/2-inset),r,h,mat,{seg:8});}
// ---------- Wohnen ----------
function pSofa(k,L=2.2,mat=IM.fabG,acc=IM.fabR){legs4(k,L,.9,.1,.03,IM.black,.08);k.b(0,.1,0,L,.26,.9,mat);const n=L>1.7?3:L>1.2?2:1,cw=(L-.36)/n;
 for(let i=0;i<n;i++)k.b(-L/2+.18+cw*(i+.5),.36,.06,cw-.025,.14,.66,mat);
 k.b(0,.36,-.35,L,.46,.2,mat);for(let i=0;i<n;i++)k.b(-L/2+.18+cw*(i+.5),.48,-.2,cw-.03,.42,.16,mat,{rx:-.14});
 for(const s of [-1,1]){k.b(s*(L/2-.09),.36,0,.18,.28,.9,mat);k.b(s*(L/2-.09),.64,.02,.2,.05,.86,mat);}
 if(acc){const p=sub(k,-L/2+.42,-.08,.25);p.b(0,.5,0,.4,.36,.12,acc,{rx:-.2});const q=sub(k,L/2-.42,-.08,-.25);q.b(0,.5,0,.4,.36,.12,acc,{rx:-.2});}
 k.ao(0,0,L,.95);k.s(0,0,L,.9,.8);}
function pArmchair(k,mat=IM.fabBe){pSofa(k,1.05,mat,null);}
function pCoffeeTable(k,w=1.2,d=.62){k.b(0,.38,0,w,.05,d,IM.oak);for(const sx of [-1,1])for(const sz of [-1,1])k.b(sx*(w/2-.05),0,sz*(d/2-.05),.04,.38,.04,IM.black);k.b(0,.1,0,w-.12,.03,d-.12,IM.oak);
 k.b(-.25,.43,.05,.32,.012,.24,IM2.paper,{ry:.2});k.b(-.22,.442,.06,.3,.01,.22,IM.blue,{ry:.35});k.c(.3,.43,0,.12,.07,IM.ceramic);k.g(SPH,IM.orange,.28,.53,.02,.04,.04,.04);k.g(SPH,IM.green,.33,.53,-.03,.04,.04,.04);k.ao(0,0,w,d,.9);k.s(0,0,w,d,.45);}
function pTVUnit(k,w=2.2){k.b(0,.05,0,w,.46,.45,IM.walnut);k.b(0,0,0,w-.1,.05,.4,IM.black);for(let i=0;i<3;i++){const x=-w/3+i*w/3;k.b(x,.09,.226,w/3-.03,.38,.01,IM.walnut);k.b(x,.31,.235,.22,.02,.02,IM.steel);}
 k.b(0,.52,-.05,.45,.03,.25,IM.black);k.b(0,.55,-.08,.06,.25,.06,IM.black);k.b(0,.78,-.1,1.64,.95,.06,IM.gloss);k.b(0,.8,-.066,1.56,.88,.008,IM.tv);
 k.b(.65,.51,.05,.36,.06,.24,IM.black);k.b(.72,.535,.172,.08,.012,.008,IM.led);for(const s of [-1,1]){k.b(s*(w/2+.3),0,0,.24,1.05,.26,IM.black);k.c(s*(w/2+.3),.75,.13,.07,.012,IM.darkM,{rx:Math.PI/2});k.c(s*(w/2+.3),.4,.13,.1,.012,IM.darkM,{rx:Math.PI/2});}
 k.ao(0,0,w+.8,.5);k.s(0,0,w+.9,.5,1.75);}
function pBookshelf(k,w=1.6,h=2.1,d=.34){const t=.03;for(const s of [-1,1])k.b(s*(w/2-t/2),0,0,t,h,d,IM.oak);k.b(0,h-t,0,w,t,d,IM.oak);k.b(0,0,-d/2+.01,w,h,.02,IM.oak);k.b(0,0,0,w,.08,d,IM.oak);
 const n=5;for(let i=1;i<n;i++){const y=i*h/n;k.b(0,y,0,w-2*t,t,d-.02,IM.oak);}
 for(let i=0;i<n;i++){const y0=(i?i*h/n+t:.08),avail=h/n-t-.04;const bw=w-2*t-.02;let x=-bw/2;
  const segs=IRND()<.5?[[bw*.65,'b'],[bw*.35,'o']]:[[bw,'b']];for(const [sw,kind] of segs){if(kind==='b')k.b(x+sw/2,y0,.02,sw,Math.min(.3,avail),d-.1,IM.books,{side:[.8,.32]});else{k.c(x+sw/2,y0,0,.06,.18,IRND()<.5?IM.ceramic:IM2.potT);k.g(SPH,IM2.leaf,x+sw/2,y0+.24,0,.1,.08,.1);}x+=sw;}}
 k.ao(0,0,w,d+.1);k.s(0,0,w,d,h);}
function pFloorLamp(k){k.c(0,0,0,.16,.03,IM.black);k.c(0,.03,0,.015,1.45,IM.brass);k.g(TAPER,IM.fabW,0,1.62,0,.2,.32,.2,{seg:16});k.g(SPH,IM.lampY,0,1.52,0,.06,.06,.06);k.s(0,0,.32,.32,1.7);}
function pPlant(k,s=1,pot=IM2.pot){k.g(TAPER,pot,0,.2*s,0,.2*s,.4*s,.2*s);k.c(0,.38*s,0,.17*s,.03,IM2.soil);for(let i=0;i<9;i++){const a=i/9*Math.PI*2+IRND()*.4,tl=.35+IRND()*.5;k.g(GEO.leaf,i%3?IM2.leaf:IM2.leafD,Math.cos(a)*.05,.4*s,Math.sin(a)*.05,.2*s*(.8+IRND()*.5),.24*s*(.8+IRND()*.6),.2*s,{ry:-a+Math.PI/2,rx:0,rz:0});}
 k.ao(0,0,.5*s,.5*s);k.s(0,0,.34*s,.34*s,1.2*s);}
function pRug(k,w,d,mat=IM.rug){k.b(0,0,0,w,.014,d,mat,{top:[w,d]});}
function pChair(k,mat=IM.oak,seat=null){legs4(k,.44,.44,.45,.018,mat,.03);k.b(0,.45,0,.46,.04,.46,seat||mat);for(const s of [-1,1])k.b(s*.2,.45,-.21,.03,.5,.03,mat);for(let i=0;i<3;i++)k.b(0,.62+i*.12,-.21,.38,.05,.02,mat);}
function pDining(k,w=1.7,d=.9,n=4){k.b(0,.73,0,w,.05,d,IM.oak);for(const sx of [-1,1])for(const sz of [-1,1])k.b(sx*(w/2-.08),0,sz*(d/2-.08),.06,.73,.06,IM.oak);
 const xs=n>4?[-.55,0,.55]:[-.4,.4];for(const x of xs)for(const sd of [-1,1]){const c=sub(k,x,sd*(d/2+.28),sd>0?Math.PI:0);pChair(c,IM.oak,IM.fabBe);c.s(0,0,.46,.46,.95);}
 k.b(0,.78,0,w*.75,.004,.3,IM.fabW);k.c(0,.78,0,.14,.06,IM.ceramic);k.g(SPH,IM.orange,-.05,.88,0,.05,.05,.05);k.g(SPH,IM.green,.05,.88,.03,.05,.05,.05);k.g(SPH,IM.red,.02,.88,-.05,.05,.05,.05);
 k.ao(0,0,w+.4,d+.9);k.s(0,0,w,d,.8);}
function pPendant(x,y,z){addStatic(GEO.cyl,IM.black,x,y-.35,z,0,.006,.7,.006,{noShadow:true});addStatic(CONE,IM.black,x,y-.85,z,0,.22,.25,.22,{noShadow:true});addStatic(SPH,IM.lampY,x,y-.94,z,0,.07,.05,.07,{noShadow:true});}
// ---------- Küche ----------
function pKitchenRun(k,L,o={}){const d=.62,front=IM.white,top=o.top||IM.marbleD;k.b(0,0,0,L,.1,d-.06,IM.black);const n=Math.max(2,Math.round(L/.6)),cw=L/n;
 for(let i=0;i<n;i++){const x=-L/2+cw*(i+.5);k.b(x,.1,-.02,cw-.01,.76,d-.04,front);k.b(x,.12,d/2-.04,cw-.03,.72,.02,front);const isDr=i%3===1;if(isDr){for(let r=0;r<3;r++)k.b(x,.18+r*.24,d/2-.025,cw-.08,.012,.01,IM.steel);}else k.b(x+(i%2?-1:1)*(cw/2-.08),.55,d/2-.02,.015,.22,.02,IM.steel);}
 k.b(0,.86,0,L+.02,.04,d,top);k.b(0,.9,-d/2+.02,L,.62,.02,IM.wtile,{side:[.4,.4]});
 // Spüle, Herd, Backofen
 const sx=o.sink??-L/4,hx=o.hob??L/4;k.b(sx,.84,.02,.58,.065,.42,IM.steel);k.b(sx,.82,.02,.52,.08,.36,IM.darkM);k.c(sx,.9,-.18,.018,.26,IM.chrome);k.b(sx,1.15,-.1,.025,.025,.17,IM.chrome);
 k.b(hx,.9,0,.6,.012,.52,IM.gloss);for(const [bx,bz,r] of [[-.15,-.12,.09],[.15,-.12,.07],[-.15,.12,.07],[.15,.12,.09]]){k.g(TORUS,IM.darkM,hx+bx,.915,bz,r,r,r,{rx:Math.PI/2});}
 k.b(hx,.14,.28,.58,.56,.02,IM.gloss);k.b(hx,.58,.3,.48,.025,.03,IM.steel);
 // Oberschränke + Haube
 const ux=o.upper??L;if(ux>0){const un=Math.max(1,Math.round(ux/.6)),uw=ux/un;for(let i=0;i<un;i++){const x=-ux/2+uw*(i+.5);if(Math.abs(x-hx)<.4)continue;k.b(x,1.52,-d/2+.2,uw-.012,.72,.36,front);k.b(x+(i%2?-1:1)*(uw/2-.07),1.56,-d/2+.385,.015,.16,.02,IM.steel);}}
 k.b(hx,1.6,-d/2+.22,.62,.12,.45,IM.steel);k.b(hx,1.72,-d/2+.1,.28,.85,.2,IM.steel);
 // Kleinkram
 k.b(sx+.5,.9,-.15,.22,.3,.24,IM.black);k.c(sx+.5,1.21,-.15,.05,.03,IM.chrome);k.b(hx-.6,.9,-.12,.3,.02,.2,IM2.wood2);k.c(-L/2+.3,.9,-.15,.08,.2,IM.red);k.b(L/2-.25,.9,-.18,.12,.2,.08,IM2.wood2);for(let i=0;i<3;i++)k.b(L/2-.25-.03+i*.03,1.1,-.18,.012,.08,.012,IM.black);
 k.s(0,0,L,d,.95);}
function pFridge(k){k.b(0,0,0,.72,2,.7,IM.steel);k.b(0,1.22,.352,.7,.76,.01,IM.steel);k.b(0,.02,.352,.7,1.17,.01,IM.steel);k.b(-.29,1.3,.37,.03,.55,.03,IM.chrome);k.b(-.29,.6,.37,.03,.5,.03,IM.chrome);k.b(.2,1.55,.36,.16,.2,.005,IM.gloss);k.b(.2,1.6,.364,.1,.04,.002,IM.led);k.ao(0,0,.8,.75);k.s(0,0,.72,.7,2);}
function pIsland(k,L=2){k.b(0,0,0,L,.88,.8,IM.white);k.b(0,.88,.08,L+.1,.04,1.05,IM.oak);for(let i=0;i<3;i++){const x=-L/2+.45+i*(L-.9)/2;const s=sub(k,x,.85);s.c(0,0,0,.2,.02,IM.chrome);s.c(0,.02,0,.025,.6,IM.chrome);s.c(0,.62,0,.2,.06,IM.leatherB);s.g(TORUS,IM.chrome,0,.3,0,.17,.17,.17,{rx:Math.PI/2});s.s(0,0,.4,.4,.7);}k.ao(0,0,L,.9);k.s(0,0,L,.8,.95);}
// ---------- Schlafzimmer & Bad ----------
function pBed(k,w=1.8,L=2.1){k.b(0,0,0,w+.08,.32,L,IM.walnut);k.b(0,.32,.02,w,.24,L-.06,IM.fabW);k.b(0,.56,.32,w+.04,.07,L*.62,IM.fabB);k.b(0,.55,-.02+L*.62/2+.3,w+.02,.09,.22,IM.fabB,{rx:.1});
 for(const s of [-1,1])k.b(s*w/4.2,.56,-L/2+.3,w/2.4,.15,.42,IM.fabW,{rx:-.15});k.b(0,.32,-L/2-.04,w+.24,1.05,.1,IM.fabG);for(let i=0;i<4;i++)k.b(-w/2+w/4*(i+.5),.42,-L/2+.012,w/4-.04,.85,.03,IM.fabG);
 for(const s of [-1,1]){const n=sub(k,s*(w/2+.38),-L/2+.25);n.b(0,0,0,.5,.5,.42,IM.walnut);n.b(0,.26,.212,.44,.18,.01,IM.oak);n.b(0,.33,.225,.12,.02,.02,IM.brass);n.c(0,.5,0,.08,.04,IM.brass);n.c(0,.54,0,.012,.25,IM.brass);n.g(TAPER,IM.fabW,0,.86,0,.14,.2,.14);n.g(SPH,IM.lampY,0,.78,0,.045,.045,.045);n.b(.12,.5,.08,.16,.03,.22,IM.blue,{ry:.3});n.s(0,0,.5,.42,.6);}
 k.ao(0,0,w+1.4,L+.2);k.s(0,0,w+.1,L+.1,.7);}
function pWardrobe(k,w=2,h=2.2,d=.6){k.b(0,0,0,w,h,d,IM.white);const n=w>1.6?3:2,dw=w/n;for(let i=0;i<n;i++){const x=-w/2+dw*(i+.5);k.b(x,.04,d/2+.004,dw-.012,h-.08,.012,i===1&&n===3?IM.mirror:IM.white);k.b(x+(i%2?-1:1)*(dw/2-.07),h*.48,d/2+.02,.02,.32,.02,IM.steel);}k.b(0,h,0,w+.02,.04,d+.02,IM.oak);k.ao(0,0,w,d+.1);k.s(0,0,w,d,h);}
function pDesk(k,w=1.4,pc=true){k.b(0,.72,0,w,.035,.7,IM.oak);for(const s of [-1,1])k.b(s*(w/2-.03),0,0,.04,.72,.66,IM.black);k.b(w/2-.25,.25,0,.42,.47,.62,IM.white);for(let r=0;r<3;r++)k.b(w/2-.25,.3+r*.15,.316,.4,.13,.01,IM.white);
 if(pc){k.b(0,.755,-.18,.2,.012,.16,IM.black);k.b(0,.765,-.2,.04,.22,.03,IM.black);k.b(0,.94,-.2,.62,.38,.03,IM.gloss);k.b(0,.955,-.184,.58,.34,.004,IM.pc);k.b(0,.755,.1,.44,.018,.14,IM.black);k.b(.33,.755,.12,.06,.02,.1,IM.black);}
 k.b(-w/2+.25,.755,.05,.22,.004,.3,IM2.paper,{ry:.15});k.c(-w/2+.5,.755,-.12,.04,.1,IM.red);const l=sub(k,-w/2+.15,-.2);l.c(0,.755,0,.07,.02,IM.black);l.b(0,.775,0,.02,.4,.02,IM.black,{rz:.2});l.g(CONE,IM.black,.08,1.13,.05,.08,.1,.08,{rx:.5});k.ao(0,0,w,.75);k.s(0,0,w,.7,.8);}
function pOfficeChair(k,mat=IM.leatherB){for(let i=0;i<5;i++){const a=i/5*Math.PI*2;k.b(Math.sin(a)*.17,.05,Math.cos(a)*.17,.05,.04,.34,IM.black,{ry:a});k.c(Math.sin(a)*.32,0,Math.cos(a)*.32,.03,.05,IM.black);}k.c(0,.06,0,.03,.38,IM.chrome);k.b(0,.44,0,.5,.08,.48,mat);k.b(0,.52,-.24,.46,.62,.07,mat,{rx:-.1});for(const s of [-1,1]){k.b(s*.27,.5,0,.04,.18,.04,IM.black);k.b(s*.27,.68,0,.07,.03,.3,IM.black);}k.ao(0,0,.6,.6);k.s(0,0,.55,.55,1.1);}
function pToilet(k){k.b(0,0,-.08,.36,.4,.3,IM.ceramic);k.g(GEO.cyl,IM.ceramic,0,.38,.12,.2,.08,.27);k.g(GEO.cyl,IM.whiteP,0,.43,.12,.19,.02,.25);k.b(0,.4,-.26,.42,.4,.18,IM.ceramic);k.b(0,.8,-.26,.44,.03,.2,IM.ceramic);k.c(.08,.83,-.26,.025,.012,IM.chrome);k.ao(0,0,.5,.7);k.s(0,0,.42,.65,.85);}
function pVanity(k,w=.9){k.b(0,0,0,w,.82,.48,IM.walnut);k.b(0,.82,0,w+.02,.04,.5,IM.ceramic);k.g(GEO.cyl,IM.ceramic,0,.86,.02,.21,.06,.16);k.c(0,.86,-.17,.02,.2,IM.chrome);k.b(0,1.04,-.11,.02,.02,.12,IM.chrome);for(const s of [-1,1])k.b(s*.08,.92,-.17,.04,.02,.04,IM.chrome);
 k.b(0,1.15,-.235,w,.8,.03,IM.mirror);k.b(0,1.97,-.2,w*.8,.06,.08,IM.lampW);k.b(-w/2+.15,.86,-.12,.06,.16,.06,IM2.teal);k.b(w/2-.15,.86,-.12,.05,.12,.05,IM2.pink);k.ao(0,0,w,.55);k.s(0,0,w,.48,.9);}
function pShower(k,w=1,d=1){k.b(0,0,0,w,.08,d,IM.ceramic);k.b(0,.08,0,w-.1,.005,d-.1,IM.wtile);k.b(0,.08,d/2-.01,w,2,.012,IM.glass);k.b(w/2-.01,.08,0,.012,2,d,IM.glass);k.b(-w/2+.02,.08,-d/2+.02,.04,1.9,.04,IM.chrome);k.c(-w/2+.1,2.0,-d/2+.15,.12,.02,IM.chrome);k.b(-w/2+.06,1.95,-d/2+.15,.12,.02,.02,IM.chrome);k.b(-w/2+.08,1.1,-d/2+.04,.12,.18,.04,IM.chrome);k.s(0,0,w,d,2.1);}
function pWasher(k){k.b(0,0,0,.6,.85,.6,IM.whiteP);k.c(0,.48,.3,.2,.02,IM.gloss,{rx:Math.PI/2});k.g(TORUS,IM.chrome,0,.48,.31,.2,.2,.2);k.b(0,.74,.302,.5,.08,.005,IM2.dkgrey);k.c(.18,.78,.31,.03,.01,IM.chrome,{rx:Math.PI/2});k.ao(0,0,.7,.7);k.s(0,0,.6,.6,.85);}
function pTowelRack(k){k.b(0,1.1,0,.6,.02,.04,IM.chrome);k.b(0,.75,.02,.5,.36,.025,IM.fabT);k.b(-.3,.9,0,.02,.3,.02,IM.chrome);}
function pCoatRack(k){k.c(0,0,0,.18,.02,IM.black);k.c(0,0,0,.02,1.75,IM.walnut);for(let i=0;i<4;i++){const a=i*Math.PI/2;k.b(Math.sin(a)*.1,1.6,Math.cos(a)*.1,.02,.02,.2,IM.walnut,{ry:a});}k.b(.12,1.15,0,.3,.55,.12,IM2.navy);k.s(0,0,.3,.3,1.8);}
function pPicture(k,w,h,mat,y=1.5){k.b(0,y-h/2,0,w+.06,h+.06,.03,IM.black);k.b(0,y-h/2+.03,.016,w,h,.005,mat);}
function pClock(k,y=2.3){k.c(0,y,0,.22,.04,IM.whiteP,{rx:Math.PI/2});k.g(TORUS,IM.black,0,y,.02,.22,.22,.12);k.b(0,y,.03,.012,.15,.004,IM.black,{rz:.6});k.b(0,y,.03,.01,.11,.004,IM.black,{rz:2.2});}
// ---------- Büro & Bank ----------
function pFileCab(k,h=1.3){k.b(0,0,0,.48,h,.6,IM.greyM||IM.steel);const n=Math.round(h/.33);for(let i=0;i<n;i++){k.b(0,.04+i*h/n,.301,.44,h/n-.03,.01,IM.steel);k.b(0,.04+i*h/n+h/n*.6,.31,.14,.025,.02,IM.chrome);}k.ao(0,0,.55,.65);k.s(0,0,.48,.6,h);}
function pBench(k,L=2.4,mat=IM.leatherB){for(const s of [-1,1])k.b(s*(L/2-.15),0,0,.06,.42,.45,IM.chrome);k.b(0,.42,0,L,.09,.48,mat);for(let i=0;i<Math.round(L/.6);i++)k.b(-L/2+.3+i*.6,.51,0,.02,.006,.46,IM.black);k.ao(0,0,L,.5);k.s(0,0,L,.48,.55);}
function pColumn(k,r,h){k.c(0,0,0,r*1.25,.32,IM.marbleD);k.c(0,.32,0,r,h-.7,IM.marble,{seg:24});for(let i=0;i<16;i++){const a=i/16*Math.PI*2;k.b(Math.cos(a)*r*.98,.32,Math.sin(a)*r*.98,.035,h-.7,.035,IM.white,{ry:-a});}k.c(0,h-.38,0,r*1.2,.14,IM.gold);k.c(0,h-.24,0,r*1.3,.24,IM.marble);k.s(0,0,r*2.3,r*2.3,h);}
function pChandelier(x,y,z,r=1.1){addStatic(GEO.cyl,IM.gold,x,y-.5,z,0,.02,1,.02,{noShadow:true});addStatic(TORUS,IM.gold,x,y-1.15,z,0,r,r,r*.05,{noShadow:true,rx:Math.PI/2});addStatic(TORUS,IM.gold,x,y-1.45,z,0,r*.6,r*.6,r*.04,{noShadow:true,rx:Math.PI/2});
 for(let i=0;i<10;i++){const a=i/10*Math.PI*2;addStatic(SPH,IM.lampY,x+Math.cos(a)*r,y-1.05,z+Math.sin(a)*r,0,.07,.09,.07,{noShadow:true});addStatic(GEO.cyl,IM.gold,x+Math.cos(a)*r,y-1.17,z+Math.sin(a)*r,0,.03,.08,.03,{noShadow:true});}
 for(let i=0;i<6;i++){const a=i/6*Math.PI*2+.3;addStatic(SPH,IM.lampY,x+Math.cos(a)*r*.6,y-1.37,z+Math.sin(a)*r*.6,0,.06,.08,.06,{noShadow:true});}for(let i=0;i<24;i++){const a=IRND()*Math.PI*2,rr=IRND()*r;addStatic(new THREE.OctahedronGeometry(1),IM.glass,x+Math.cos(a)*rr,y-1.3-IRND()*.4,z+Math.sin(a)*rr,0,.04,.07,.04,{noShadow:true});}}
function pATM(k){k.b(0,0,0,.8,1.75,.45,IM.darkM);k.b(0,1.75,0,.82,.05,.47,IM.steel);k.b(0,1.08,.23,.5,.4,.01,IM.atm);k.b(0,1.02,.25,.62,.04,.08,IM.steel,{rx:-.4});k.b(0,.88,.23,.42,.12,.02,IM.black);for(let i=0;i<4;i++)for(let j=0;j<3;j++)k.b(-.08+j*.08,.62+i*.055,.24,.06,.04,.015,IM.steel);k.b(.26,.95,.235,.12,.025,.01,IM.led);k.b(0,1.5,.24,.6,.14,.01,IM.blue);k.ao(0,0,.9,.6);k.s(0,0,.8,.45,1.8);}
function pStanchions(k,L,n){for(let i=0;i<n;i++){const x=-L/2+i*L/(n-1);k.c(x,0,0,.14,.03,IM.brass);k.c(x,.03,0,.025,.92,IM.brass);k.g(SPH,IM.brass,x,.97,0,.04,.04,.04);}for(let i=0;i<n-1;i++){const x=-L/2+(i+.5)*L/(n-1);const sl=L/(n-1);for(let k2=0;k2<6;k2++){const t=(k2+.5)/6;k.b(x-sl/2+t*sl,.9-Math.sin(t*Math.PI)*.12,0,sl/6+.01,.03,.03,IM.fabR);}}}
function pSafe(k){k.b(0,0,0,.7,.9,.65,IM.darkM);k.b(0,.06,.326,.62,.78,.02,IM.greyM);k.c(-.12,.48,.34,.1,.03,IM.chrome,{rx:Math.PI/2});for(let i=0;i<3;i++)k.b(.15,.48,.35,.14,.02,.02,IM.chrome,{rz:i*1.05});k.ao(0,0,.8,.75);k.s(0,0,.7,.65,.9);}
function pCashStack(k,n=6){for(let i=0;i<n;i++){const x=(i%3-1)*.17,z=(i/3|0)*.09-.05;for(let j=0;j<2+(i*7%3);j++)k.b(x,j*.05,z,.16,.048,.075,IM.cash,{side:[.32,.1],top:[.32,.16]});}}
function pGold(k){for(let i=0;i<10;i++){const r=i<6?0:1;const x=(r?(i-7.5)*.12:(i-2.5)*.12),z=r?0:.06;k.g(new THREE.CylinderGeometry(.04,.055,.12,4),IM.gold,x,.03+r*.06,z-.03,1,.5,1.6,{ry:Math.PI/4,rx:Math.PI/2});}}
function pCashCart(k){k.b(0,.1,0,.9,.06,.55,IM.steel);for(const sx of [-1,1])for(const sz of [-1,1]){k.c(sx*.38,0,sz*.22,.05,.1,IM.rubber,{rz:Math.PI/2});}k.b(-.45,.16,0,.03,.9,.55,IM.steel);k.b(-.43,1.06,0,.06,.03,.5,IM.chrome);const c=sub(k,.05,0);pCashStack(c,9);k.s(0,0,.95,.6,1.1);}
function pCamera(k,y=3){k.b(0,y,0,.1,.08,.08,IM.whiteP);k.b(0,y-.12,.12,.16,.13,.28,IM.whiteP,{rx:.4});k.c(0,y-.17,.27,.05,.02,IM.gloss,{rx:Math.PI/2-.4});k.b(.06,y-.07,.1,.02,.02,.02,IM.ledR);}
function pMetalDetector(k){for(const s of [-1,1])k.b(s*.48,0,0,.16,2.15,.5,IM.greyM);k.b(0,2.15,0,1.12,.18,.5,IM.greyM);k.b(0,2.2,.252,.5,.06,.005,IM.led);for(const s of [-1,1])k.s(s*.48,0,.16,.5,2.2);}
// ---------- Werkstatt ----------
function pLift(k,car){for(const s of [-1,1]){k.b(s*1.75,0,0,.6,.04,.6,IM.darkM);k.b(s*1.75,.04,0,.34,3.6,.34,IM.yellow,{side:[.4,.4]});k.b(s*1.75,3.64,0,.38,.05,.38,IM.darkM);for(let i=0;i<14;i++)k.b(s*1.75+s*-.172,.2+i*.24,0,.01,.04,.2,IM.darkM);
  const y=car?1.75:.12;for(const sz of [-1,1])k.b(s*1.2,y,sz*.45,1.1,.07,.12,IM.yellow,{ry:sz*s*.35});k.b(s*1.75,y-.05,0,.4,.22,.42,IM.darkM);}
 k.b(0,3.6,0,3.9,.12,.18,IM.yellow);k.b(1.45,.04,.3,.2,.4,.2,IM.darkM);k.b(1.45,.25,.4,.12,.06,.005,IM.led);for(const s of [-1,1])k.s(s*1.75,0,.6,.6,3.7);if(car)IDECO.push({kind:'car',k,y:1.86});}
function pWorkbench(k,L=2.4){k.b(0,.88,0,L,.06,.75,IM.steel);k.b(0,0,0,L,.08,.7,IM.darkM);for(const s of [-1,1])k.b(s*(L/2-.05),.08,0,.06,.8,.7,IM.darkM);const n=Math.max(2,Math.round(L/.6)-1);for(let i=0;i<n;i++){const x=-L/2+.4+i*(L-.8)/(n-1||1);k.b(x,.25,.3,.5,.5,.06,IM.red);for(let r=0;r<3;r++){k.b(x,.3+r*.15,.335,.46,.012,.01,IM.black);k.b(x,.36+r*.15,.34,.16,.02,.02,IM.chrome);}}
 k.b(-L/2+.3,.94,.25,.18,.12,.22,IM.blue);k.b(-L/2+.3,1.06,.25,.24,.04,.12,IM.blue);k.c(-L/2+.3,1.0,.42,.012,.14,IM.chrome,{rz:Math.PI/2});k.b(L/2-.5,.94,0,.36,.18,.24,IM.red);k.b(.2,.94,-.1,.42,.012,.3,IM2.paper,{ry:.2});k.c(.6,.94,.12,.05,.11,IM.orange);k.b(-.3,.94,.1,.25,.03,.03,IM.chrome,{ry:.5});k.b(0,.94,.15,.22,.05,.04,IM.yellow,{ry:-.3});
 k.ao(0,0,L,.8);k.s(0,0,L,.75,1);}
function pToolWall(k,L=2.6,h=1.3){k.b(0,1.05,0,L,h,.03,IM.peg,{side:[.5,.5]});const tools=()=>{const t=IRND();return t<.3?[.05,.32,IM.red]:t<.55?[.04,.26,IM.chrome]:t<.75?[.12,.04,IM.steel]:[.08,.2,IM.yellow];};
 for(let i=0;i<Math.round(L*7);i++){const [w,hh,m]=tools();const x=-L/2+.12+IRND()*(L-.24),y=1.15+IRND()*(h-.35);k.b(x,y,.03,w,hh,.025,m,{rz:IRND()<.3?.6:0});}
 for(let i=0;i<Math.round(L*2.5);i++){const x=-L/2+.15+i*(L-.3)/(L*2.5);k.b(x,1.1,.035,.03,.18+IRND()*.08,.02,IM.chrome);}}
function pToolChest(k){k.b(0,.1,0,.75,1.05,.48,IM.red);k.b(0,1.15,0,.78,.04,.5,IM.darkM);for(let r=0;r<7;r++){k.b(0,.16+r*.135,.242,.7,.12,.01,IM.red);k.b(0,.24+r*.135,.25,.4,.018,.015,IM.chrome);}for(const sx of [-1,1])for(const sz of [-1,1])k.c(sx*.3,0,sz*.18,.05,.1,IM.rubber,{rz:Math.PI/2});k.b(-.2,1.19,0,.2,.1,.08,IM.yellow);k.ao(0,0,.85,.6);k.s(0,0,.78,.5,1.2);}
function pTyre(k,x,y,z,flat=true){if(flat)k.g(TORUS,IM2.tyre,x,y+.12,z,.3,.3,.33,{rx:Math.PI/2});else{k.g(TORUS,IM2.tyre,x,y+.42,z,.3,.3,.33);k.c(x,y+.42,z,.2,.2,IM2.rim,{rx:Math.PI/2});}}
function pTyreStack(k,n=4){for(let i=0;i<n;i++)pTyre(k,0,i*.24,0,true);k.ao(0,0,.9,.9);k.s(0,0,.85,.85,n*.24);}
function pTyreRack(k,L=2.4){for(const s of [-1,1])k.b(s*L/2,0,0,.06,1.6,.5,IM.blue);for(const y of [.5,1.2])for(const s of [-1,1])k.b(0,y,s*.2,L,.05,.05,IM.blue);for(let i=0;i<Math.floor(L/.36);i++)for(const y of [.06,.76])pTyre(k,-L/2+.25+i*.36,y,0,false);k.s(0,0,L,.55,1.7);}
function pDrum(k,mat=IM2.oilBlue){k.c(0,0,0,.29,.88,mat);for(const y of [.29,.59])k.g(TORUS,mat,0,y,0,.295,.295,.04,{rx:Math.PI/2});k.c(0,.88,0,.27,.01,IM.darkM);k.c(.12,.88,0,.04,.02,IM.darkM);k.ao(0,0,.7,.7);k.s(0,0,.6,.6,.9);}
function pCompressor(k){k.c(0,.2,0,.28,.9,IM.red,{rz:Math.PI/2});k.b(0,.55,0,.5,.32,.35,IM.darkM);k.c(.15,.95,0,.08,.12,IM.chrome);k.b(-.3,.95,0,.06,.18,.06,IM.black);for(const sx of [-1,1])k.c(sx*.32,0,.18,.08,.07,IM.rubber,{rz:Math.PI/2});k.ao(0,0,1,.5);k.s(0,0,1,.5,1);}
function pHoist(k){k.b(0,.06,0,.12,.12,1.4,IM.red);for(const s of [-1,1])k.b(s*.4,.06,.55,.1,.1,.9,IM.red,{ry:s*.35});k.b(0,.12,-.6,.14,1.7,.14,IM.red);k.b(0,1.7,-.25,.12,.12,1.6,IM.red,{rx:-.25});k.c(0,1.3,.55,.008,.6,IM.chrome);k.b(0,.9,.55,.12,.1,.08,IM.yellow);k.c(0,.4,-.45,.06,.7,IM.chrome,{rx:.6});k.s(0,0,.9,1.6,2);}
function pJack(k){k.b(0,.05,0,.4,.12,1.1,IM.red);k.b(0,.17,.4,.24,.08,.28,IM.darkM);k.b(0,.2,-.6,.05,.05,1.1,IM.chrome,{rx:-.45});for(const sx of [-1,1])k.c(sx*.17,0,-.4,.06,.08,IM.rubber,{rz:Math.PI/2});}
function pShelfUnit(k,L=2,h=2.2,boxes=true){for(const s of [-1,1])for(const sz of [-1,1])k.b(s*(L/2-.03),0,sz*.24,.05,h,.05,IM.blue);for(let i=0;i<4;i++){const y=.1+i*(h-.2)/3;k.b(0,y,0,L,.04,.52,IM.greyM);if(boxes&&i<3){let x=-L/2+.08;while(x<L/2-.2){const bw=.25+IRND()*.35,bh=.18+IRND()*.25;k.b(x+bw/2,y+.04,IRND()*.1-.05,bw,bh,.38,IRND()<.6?IM2.cardboard:IRND()<.5?IM.blue:IM.orange);x+=bw+.04;}}}k.ao(0,0,L,.6);k.s(0,0,L,.55,h);}
function pFluoro(x,y,z,len,ax){addStatic(boxG(ax?len:.22,.06,ax?.22:len),IM.whiteP,x,y-.06,z,0,1,1,1,{noShadow:true});addStatic(boxG(ax?len-.1:.12,.035,ax?.12:len-.1),IM.lampW,x,y-.095,z,0,1,1,1,{noShadow:true});for(const s of [-1,1])addStatic(GEO.cyl,IM.black,x+(ax?s*len/3:0),y+.2,z+(ax?0:s*len/3),0,.006,.5,.006,{noShadow:true});}
// ---------- Läden ----------
function pGondola(k,L=3,h=1.6,two=true){k.b(0,0,0,L,.12,two?1:.55,IM.whiteP);k.b(0,0,0,L,h,.06,IM.whiteP);for(const sd of two?[-1,1]:[1]){for(let i=0;i<4;i++){const y=.12+i*(h-.2)/3.4;k.b(0,y,sd*.27,L-.02,.025,.48,IM.whiteP);k.b(0,y+.025,sd*.3,L-.06,(h-.2)/3.4-.06,.36,IM.products,{side:[1.2,.32]});k.b(0,y-.02,sd*.51,L,.04,.012,i%2?IM.red:IM.yellow);}}for(const s of [-1,1])k.b(s*L/2,0,0,.04,h,two?1:.55,IM.whiteP);k.ao(0,0,L,two?1.1:.65);k.s(0,0,L,two?1:.55,h);}
function pFridgeWall(k,L=3,h=2.1){k.b(0,0,0,L,h,.75,IM.black);const n=Math.max(1,Math.round(L/.8)),dw=L/n;for(let i=0;i<n;i++){const x=-L/2+dw*(i+.5);for(let r=0;r<4;r++)k.b(x,.25+r*.42,0,dw-.06,.38,.6,IM.drinks,{side:[.5,.4]});k.b(x,.12,.38,dw-.02,h-.24,.02,IM.glassT);k.b(x+dw/2-.06,.9,.4,.025,.5,.025,IM.chrome);}k.b(0,h-.18,.37,L,.14,.02,IM.lampW);k.s(0,0,L,.8,h);}
function pCheckout(k,L=1.8){k.b(0,0,0,L,.9,.6,IM.white);k.b(0,.9,0,L+.04,.04,.64,IM.marbleD);k.b(-.4,.94,-.05,.36,.24,.3,IM.black);k.b(-.4,1.18,-.05,.3,.2,.04,IM.gloss,{rx:-.3});k.b(-.4,1.19,-.03,.26,.16,.004,IM.pc,{rx:-.3});k.b(.1,.94,.1,.12,.04,.18,IM.black);k.b(.1,.98,.12,.1,.012,.06,IM.led);
 k.b(L/2-.25,.94,-.05,.3,.3,.3,IM2.cardboard);for(let i=0;i<4;i++)k.b(-L/2+.2,.95+i*.12,.33,.3,.08,.08,[IM.red,IM.yellow,IM.green,IM.blue][i]);k.s(0,0,L,.6,1.2);}
function pMag(k,L=1.2){k.b(0,0,0,L,1.4,.3,IM.walnut);for(let r=0;r<4;r++)for(let i=0;i<5;i++)k.b(-L/2+.13+i*(L-.2)/4.4,.15+r*.32,.16,.2,.26,.02,[IM.red,IM.blue,IM.yellow,IM2.paper,IM.green,IM2.pink][(r*5+i)%6],{rx:-.15});k.s(0,0,L,.3,1.4);}
function pGlassCounter(k,L=3){k.b(0,0,0,L,.3,.7,IM.walnut);k.b(0,.3,0,L,.68,.7,IM.glassT);k.b(0,.98,0,L+.03,.03,.73,IM.glassT);k.b(0,.62,0,L-.08,.02,.62,IM.walnut);for(const s of [-1,1])k.b(s*(L/2-.02),.3,0,.04,.7,.7,IM.chrome);k.b(0,.33,0,L-.08,.01,.6,IM.carpetR);k.s(0,0,L,.7,1.05);}
function pPistol(k,x,y,z,r=0){const s=sub(k,x,z,r);s.b(0,y,0,.2,.06,.035,IM.black);s.b(-.06,y-.1,0,.05,.12,.03,IM.walnut,{rz:-.25});s.b(.02,y-.035,0,.035,.04,.02,IM.black);}
function pRifle(k,x,y,z,r=0,mat=IM.black){const s=sub(k,x,z,r);s.b(0,y,0,.62,.06,.04,mat);s.b(-.48,y-.06,0,.36,.1,.035,IM.walnut,{rz:-.08});s.b(.5,y+.02,0,.42,.025,.025,IM.darkM);s.b(.05,y-.12,0,.06,.13,.03,mat,{rz:.15});s.c(.05,y+.08,0,.025,.28,IM.darkM,{rz:Math.PI/2});}
function pGunWall(k,L=4){k.b(0,.9,0,L,1.9,.04,IM.walnut,{side:[1,1]});for(let r=0;r<3;r++)for(let i=0;i<Math.floor(L/1.1);i++){const x=-L/2+.6+i*1.1;pRifle(k,x,1.25+r*.55,.06,0,r===1?IM2.olive:IM.black);k.b(x-.2,1.17+r*.55,.04,.04,.06,.06,IM.brass);k.b(x+.2,1.17+r*.55,.04,.04,.06,.06,IM.brass);}}
function pAmmoShelf(k,L=2){k.b(0,0,0,L,2,.4,IM.walnut);for(let r=0;r<5;r++){k.b(0,.1+r*.38,.01,L-.06,.03,.38,IM.oak);let x=-L/2+.08;while(x<L/2-.18){const bw=.14+IRND()*.1;k.b(x+bw/2,.13+r*.38,.05,bw,.12+IRND()*.08,.22,[IM.green,IM.red,IM.yellow,IM2.olive,IM2.cardboard][IRND()*5|0]);x+=bw+.02;}}k.s(0,0,L,.4,2);}
function pVest(k){k.c(0,0,0,.2,.04,IM.black);k.c(0,.04,0,.02,1.05,IM.chrome);k.b(0,1.05,0,.46,.6,.24,IM2.olive);for(let i=0;i<3;i++)k.b(-.12+i*.12,1.12,.13,.1,.14,.04,IM2.olive);k.b(0,1.62,0,.12,.12,.12,IM.black);}
function pClothesRack(k,L=1.6,two=false){for(const s of [-1,1]){k.b(s*L/2,0,0,.05,.04,.5,IM.chrome);k.c(s*L/2,.04,0,.018,1.45,IM.chrome);}k.c(0,1.47,0,.015,L,IM.chrome,{rz:Math.PI/2});k.b(0,.45,0,L-.06,1,.5,IM.clothes,{side:[1.6,1.1]});k.b(0,.45,0,.002,1,.5,IM.clothes,{side:[1.6,1.1]});k.ao(0,0,L,.6);k.s(0,0,L,.5,1.5);}
function pFoldShelf(k,L=2,h=2.2){k.b(0,0,0,L,h,.4,IM.oak);for(let r=0;r<5;r++){const y=.15+r*.42;k.b(0,y,.02,L-.06,.03,.36,IM.white);for(let i=0;i<Math.floor(L/.34);i++){const x=-L/2+.2+i*.34;const c=[IM2.navy,IM.red,IM.fabW,IM2.olive,IM2.purple,IM.fabB,IM2.burg,IM.yellow][(r*3+i)%8];for(let j=0;j<4;j++)k.b(x,y+.03+j*.05,.05,.28,.045,.26,c);}}k.s(0,0,L,.4,h);}
function pMannequin(k,top,bot){k.c(0,0,0,.18,.03,IM.chrome);k.c(0,.03,0,.015,.25,IM.chrome);k.b(-.09,.28,0,.1,.75,.12,bot);k.b(.09,.28,0,.1,.75,.12,bot);k.b(0,1.0,0,.38,.5,.2,top);k.b(-.23,1.05,0,.08,.42,.1,top,{rz:.12});k.b(.23,1.05,0,.08,.42,.1,top,{rz:-.12});k.c(0,1.5,0,.045,.08,IM.whiteP);k.g(SPH,IM.whiteP,0,1.67,0,.1,.12,.1);k.s(0,0,.5,.4,1.8);}
function pBooth(k,L=1.6,mat=IM.leatherR){k.b(0,0,0,L,.42,.5,IM.walnut);k.b(0,.42,0,L,.1,.5,mat);k.b(0,.42,-.22,L,.75,.14,mat);for(let i=0;i<Math.round(L/.5);i++)k.b(-L/2+.25+i*.5,.55,-.15,.02,.6,.02,IM.walnut);k.s(0,0,L,.55,1.2);}
function pTable(k,w=.8,d=.8,mat=IM.white,round=false){if(round){k.c(0,.72,0,w/2,.04,mat);k.c(0,0,0,.25,.03,IM.black);}else{k.b(0,.72,0,w,.04,d,mat);k.b(0,.0,0,.4,.03,.4,IM.black);}k.c(0,.03,0,.04,.69,IM.chrome);k.s(0,0,w,d,.78);}
function pGrill(k,L=1.4){k.b(0,0,0,L,.85,.75,IM.steel);k.b(0,.85,0,L,.03,.7,IM.darkM);for(let i=0;i<6;i++)k.c(-L/2+.2+i*(L-.4)/5,.88,(i%2)*.15-.07,.07,.025,IM2.wood2);k.b(0,.88,-.36,L,.25,.03,IM.steel);for(let i=0;i<3;i++)k.c(-L/2+.2+i*.15,.45,.38,.025,.02,IM.black,{rx:Math.PI/2});k.s(0,0,L,.75,.9);}
function pFryer(k){k.b(0,0,0,.6,.9,.7,IM.steel);for(const s of [-1,1]){k.b(s*.14,.9,0,.24,.02,.4,IM.darkM);k.b(s*.14,.95,.1,.22,.1,.3,IM.grate);k.b(s*.14,1.0,.3,.03,.03,.25,IM.black);}k.s(0,0,.6,.7,1);}
function pSoda(k){k.b(0,0,0,.8,1.35,.6,IM.red);k.b(0,1.35,0,.8,.45,.6,IM.lampY);k.b(0,.95,.305,.7,.3,.01,IM.black);for(let i=0;i<4;i++){k.b(-.27+i*.18,.85,.32,.08,.1,.08,IM.chrome);}k.b(0,.5,.3,.7,.04,.25,IM.grate);k.s(0,0,.8,.6,1.8);}
function pOven(k){k.b(0,0,0,1.8,.95,1.6,IM.brick,{side:[.6,.4]});k.g(new THREE.SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI/2),IM.brick,0,.95,0,.9,.85,.8);k.b(0,.98,.62,.55,.38,.4,IM.black);k.b(0,1.0,.79,.5,.3,.01,IM.fire);k.c(0,1.75,-.2,.12,.9,IM.brick);for(let i=0;i<4;i++)k.b(-.5+i*.33,.2,.81,.28,.1,.01,IM2.wood2);k.s(0,0,1.8,1.6,1.9);}
function bldgTop(x,z,w,d,h,y0,mat){addStatic(boxG(w,h,d,[FAC[mat.userData.kind]?.tw||4,FAC[mat.userData.kind]?.th||4]),mat,x,y0,z);addStatic(boxG(w+.5,.7,d+.5),roofMat,x,y0+h,z);bldgs.push({x,z,w,d,h:y0+h-.3,top:y0+h+.7});}
