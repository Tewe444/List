'use strict';
// ================= HELFER =================
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
function saveSettings(){try{localStorage.setItem('portsolara_settings',JSON.stringify(SET));}catch(e){}}
function M(p){const m=new THREE.MeshStandardMaterial(p);allMats.push(m);return m;}
function cm(color,rough=.8,metal=0){const k=color+'_'+rough+'_'+metal;return matCache[k]||(matCache[k]=M({color,roughness:rough,metalness:metal}));}
function mesh(geo,mat,x=0,y=0,z=0,cast=true){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;return m;}
function canvasTex(w,h,draw,repeat){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;if(repeat){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);}return t;}
function noiseFill(g,w,h,base,amt,n=9000,size=2){g.fillStyle=base;g.fillRect(0,0,w,h);for(let i=0;i<n;i++){const v=Math.random()<.5?0:255;g.fillStyle=`rgba(${v},${v},${v},${amt*Math.random()})`;g.fillRect(Math.random()*w,Math.random()*h,size,size);}}
function updateEnv(){const sp=sky.position.clone();sky.position.set(0,0,0);envScene.add(sky);const n=pmrem.fromScene(envScene,0,0.1,10000);scene.add(sky);sky.position.copy(sp);if(envRT)envRT.dispose();envRT=n;scene.environment=n.texture;}
function addSolid(x0,x1,z0,z1,h){if(SX||SZ){x0+=SX;x1+=SX;z0+=SZ;z1+=SZ;}if(SY&&h>0)h+=SY;const s={x0,x1,z0,z1,h};if(x1-x0>400||z1-z0>400){bigSolids.push(s);return s;}
 for(let gx=Math.floor(x0/GRID);gx<=Math.floor(x1/GRID);gx++)for(let gz=Math.floor(z0/GRID);gz<=Math.floor(z1/GRID);gz++){const k=gx*10007+gz;let a=grid.get(k);if(!a)grid.set(k,a=[]);a.push(s);}return s;}
function solidsNear(x,z,r){const out=[];for(let gx=Math.floor((x-r)/GRID);gx<=Math.floor((x+r)/GRID);gx++)for(let gz=Math.floor((z-r)/GRID);gz<=Math.floor((z+r)/GRID);gz++){const a=grid.get(gx*10007+gz);if(a)for(const s of a)out.push(s);}for(const s of bigSolids)out.push(s);return out;}
function islandY(x,z){const r=Math.hypot(x-IX,z-IZ);return r<100?2.05:r<IR+4?1.6:-1;}
function groundY(x,z){
 if(z>WATER_Z+400){const iy=islandY(x,z);if(iy>=0)return iy;}
 if(z>WATER_Z-14&&z<JZ1&&Math.abs(x-JX)<3.2)return .5;
 if(z>WATER_Z-12&&Math.abs(x-PIERX)<5)return 0.5;
 const lx=x+HALF,lz=z+HALF,i=Math.floor(lx/CELL),j=Math.floor(lz/CELL);
 if(i<0||j<0||i>=N||j>=N){const ry=roadY(x,z);return ry!=null?ry:terrainH(x,z);}
 const ux=lx-i*CELL,uz=lz-j*CELL;
 if(ux>ROAD/2&&ux<CELL-ROAD/2&&uz>ROAD/2&&uz<CELL-ROAD/2){for(const I of GY_INT)if(x>I.x0&&x<I.x1&&z>I.z0&&z<I.z1)return I.fy;return .3;}return 0;
}
function prepGeo(g){g=g.index?g.toNonIndexed():g.clone();for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);if(!g.attributes.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));return g;}
function addStatic(geo,mat,x,y,z,ry=0,sx=1,sy=1,sz=1,o={}){
 x+=SX;y+=SY;z+=SZ;
 const g=prepGeo(geo);tmpM.compose(tmpP.set(x,y,z),tmpQ.setFromEuler(tmpE.set(o.rx||0,ry,o.rz||0,'YXZ')),tmpS.set(sx,sy,sz));g.applyMatrix4(tmpM);g.computeBoundingBox();
 const cx=Math.floor((x+HALF+600)/STATIC_CHUNK_SIZE),cz=Math.floor((z+HALF+600)/STATIC_CHUNK_SIZE),chunkKey=cx+'_'+cz;
 const key=chunkKey+'_'+mat.uuid+(o.noShadow?'n':'');
 let b=buckets.get(key);if(!b){b={mat,list:[],shadow:!o.noShadow,cx,cz,chunkKey,minX:Infinity,minY:Infinity,minZ:Infinity,maxX:-Infinity,maxY:-Infinity,maxZ:-Infinity,triangles:0};buckets.set(key,b);}
 b.list.push(g);b.triangles+=g.attributes.position.count/3;
 const bb=g.boundingBox;b.minX=Math.min(b.minX,bb.min.x);b.minY=Math.min(b.minY,bb.min.y);b.minZ=Math.min(b.minZ,bb.min.z);b.maxX=Math.max(b.maxX,bb.max.x);b.maxY=Math.max(b.maxY,bb.max.y);b.maxZ=Math.max(b.maxZ,bb.max.z);
}
function finalizeStatic(){
 for(const b of buckets.values()){
  const g=mergeGeometries(b.list,false);if(!g)continue;g.computeBoundingSphere();g.computeBoundingBox();
  const m=new THREE.Mesh(g,b.mat);m.castShadow=b.shadow;m.receiveShadow=true;m.matrixAutoUpdate=false;m.updateMatrix();m.matrixWorld.copy(m.matrix);m.matrixWorldAutoUpdate=false;scene.add(m);
  let ch=staticChunkMap.get(b.chunkKey);if(!ch){const ox=b.cx*STATIC_CHUNK_SIZE-HALF-600,oz=b.cz*STATIC_CHUNK_SIZE-HALF-600;ch={key:b.chunkKey,cx:b.cx,cz:b.cz,x0:ox,x1:ox+STATIC_CHUNK_SIZE,z0:oz,z1:oz+STATIC_CHUNK_SIZE,meshes:[],minX:Infinity,minY:Infinity,minZ:Infinity,maxX:-Infinity,maxY:-Infinity,maxZ:-Infinity,triangles:0,proxy:null};staticChunkMap.set(b.chunkKey,ch);}
  ch.meshes.push(m);ch.triangles+=b.triangles;ch.minX=Math.min(ch.minX,b.minX);ch.minY=Math.min(ch.minY,b.minY);ch.minZ=Math.min(ch.minZ,b.minZ);ch.maxX=Math.max(ch.maxX,b.maxX);ch.maxY=Math.max(ch.maxY,b.maxY);ch.maxZ=Math.max(ch.maxZ,b.maxZ);
 }
 for(const ch of staticChunkMap.values()){
  const w=clamp(ch.maxX-ch.minX,4,STATIC_CHUNK_SIZE*1.35),d=clamp(ch.maxZ-ch.minZ,4,STATIC_CHUNK_SIZE*1.35),h=clamp(ch.maxY-ch.minY,2,125);
  const pg=new THREE.BoxGeometry(w,h,d);const proxy=new THREE.Mesh(pg,staticBlockMat);proxy.position.set((ch.minX+ch.maxX)/2,(ch.minY+ch.maxY)/2,(ch.minZ+ch.maxZ)/2);proxy.castShadow=false;proxy.receiveShadow=false;proxy.visible=false;proxy.matrixAutoUpdate=false;proxy.updateMatrix();proxy.matrixWorld.copy(proxy.matrix);proxy.matrixWorldAutoUpdate=false;scene.add(proxy);ch.proxy=proxy;staticChunks.push(ch);
 }
 buckets.clear();staticChunkMap.clear();
}
function updateStaticLOD(force=false){
 if((typeof DEV_CAM!=='undefined'&&DEV_CAM.active)||!staticChunks.length||mode!=='play')return;
 staticLodT-=force?1:1/60;if(!force&&staticLodT>0)return;staticLodT=.18;
 const px=P.pos.x,pz=P.pos.z,dir=camera.getWorldDirection(tmpV),dxv=dir.x,dzv=dir.z;
 let forwardTris=0,forwardChunks=0;
 const activeFar=getEffectiveGfxFar(),activeNear=getEffectiveGfxNear();
 for(const ch of staticChunks){const cx=(ch.x0+ch.x1)/2,cz=(ch.z0+ch.z1)/2,dx=cx-px,dz=cz-pz,dist=Math.hypot(dx,dz)||1,dot=(dx*dxv+dz*dzv)/dist;if(dot>.34&&dist<activeFar*1.45){forwardTris+=ch.triangles;forwardChunks++;}}
 const trisLimit=SET.gfxPreset==='potato'?42000:SET.gfxPreset==='leicht'?95000:SET.gfxPreset==='ultra'?330000:220000;
 const overload=Math.max(0,forwardTris/trisLimit-1)+Math.max(0,forwardChunks-9)*.018;
 const densityScale=clamp(1-overload*(SET.gfxPreset==='potato'?.17:.12),SET.gfxPreset==='potato'?.56:.68,1);
 const detailR=activeNear*densityScale+3,farR=(activeFar+5)*densityScale,farSq=farR*farR;
 const resScale=clamp(1-overload*(SET.gfxPreset==='potato'?.16:.12),SET.gfxPreset==='potato'?.62:.72,1);if(Math.abs(gfxDynamicScale-resScale)>.06){gfxDynamicScale=resScale;renderer.setPixelRatio(PR());composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(innerWidth,innerHeight);}
 for(const ch of staticChunks){const nx=clamp(px,ch.x0,ch.x1),nz=clamp(pz,ch.z0,ch.z1),dx=px-nx,dz=pz-nz,d2=dx*dx+dz*dz;
  const detailed=d2<=detailR*detailR,block=!detailed&&d2<=farSq;
  for(const m of ch.meshes)if(m.visible!==detailed)m.visible=detailed;
  if(ch.proxy&&ch.proxy.visible!==block)ch.proxy.visible=block;
 }
 // Baumkronen und Büsche werden einzeln ausgeblendet; die Stämme bleiben Teil des Block-LOD.
 if(typeof vegLodGroups!=='undefined')for(const group of vegLodGroups){const a=group.im.instanceMatrix.array,base=group.base,xz=group.xz;let changed=false;for(let i=0;i<group.cnt;i++){const dx=xz[i*2]-px,dz=xz[i*2+1]-pz,show=Math.max(0,Math.hypot(dx,dz)-3.2)<=detailR,off=i*16;if(show){if(a[off]===0){for(let j=0;j<16;j++)a[off+j]=base[off+j];changed=true;}}else if(a[off]!==0){for(let j=0;j<16;j++)a[off+j]=0;a[off+12]=base[off+12];a[off+13]=base[off+13];a[off+14]=base[off+14];a[off+15]=1;changed=true;}}if(changed)group.im.instanceMatrix.needsUpdate=true;}
 // Terrain-Chunks außerhalb der Maximaldistanz werden ausgeblendet.
 if(typeof terrainChunks!=='undefined'){for(const m of terrainChunks){if(!m.geometry.boundingSphere)m.geometry.computeBoundingSphere();const c=m.geometry.boundingSphere.center,dx=c.x-px,dz=c.z-pz,r=m.geometry.boundingSphere.radius||0,lim=farR+r;m.visible=dx*dx+dz*dz<lim*lim;}}
 // Autos und NPCs wechseln ebenfalls zwischen Detailmodell, einfachem Block und Unsichtbarkeit.
 const applyDynamicLOD=(obj,group,kind,d2)=>{
  if(!obj||!group)return;
  let rec=obj._dynamicLod;
  if(!rec){
   const vb=kind==='car'&&typeof vehBox==='function'?vehBox(obj):null;
   const geo=kind==='car'?new THREE.BoxGeometry(vb?vb.hx*2:Math.max(2.2,(obj.rad||1.7)*2.15),vb?Math.max(1.05,Math.min(2.8,(obj.g&&obj.g.userData&&obj.g.userData.lodHeight)||1.35)):1.05,vb?vb.hz*2:Math.max(1.25,(obj.rad||1.7)*.78)):new THREE.BoxGeometry(.58,1.65,.58);
   const mat=kind==='car'?dynamicCarBlockMat:dynamicNpcBlockMat;
   const proxy=new THREE.Mesh(geo,mat);proxy.position.y=kind==='car'?.78:.825;proxy.rotation.y=kind==='car'?0:0;proxy.castShadow=false;proxy.receiveShadow=false;proxy.visible=false;group.add(proxy);
   rec=obj._dynamicLod={proxy,states:new Map(),proxyMode:false};
  }
  const extent=kind==='car'?(typeof vehBox==='function'?Math.hypot(vehBox(obj).hx,vehBox(obj).hz):Math.max(2,(obj.rad||1.7)*1.4)):.65;
  const surfaceDist=Math.max(0,Math.sqrt(d2)-extent),detailLimit=detailR+1.5,objectFar=kind==='car'?farR+Math.max(10,activeFar*.18):farR;
  const detail=surfaceDist<=detailLimit,block=!detail&&surfaceDist<=objectFar;
  if(!detail&&!rec.proxyMode){
   group.traverse(o=>{if(o===group||o===rec.proxy)return;rec.states.set(o,o.visible);o.visible=false;});
   rec.proxyMode=true;
  }else if(detail&&rec.proxyMode){
   group.traverse(o=>{if(o===group||o===rec.proxy)return;if(rec.states.has(o))o.visible=rec.states.get(o);});
   rec.states.clear();rec.proxyMode=false;
  }
  rec.proxy.visible=block;group.visible=detail||block;
 };
 const dynamicCarBlockMat=updateStaticLOD.carMat||(updateStaticLOD.carMat=new THREE.MeshLambertMaterial({color:0x68727e}));
 const dynamicNpcBlockMat=updateStaticLOD.npcMat||(updateStaticLOD.npcMat=new THREE.MeshLambertMaterial({color:0x9b8b72}));
 if(typeof cars!=='undefined')for(const c of cars){if(c===P.inCar)continue;const dx=c.pos.x-px,dz=c.pos.z-pz;applyDynamicLOD(c,c.g,'car',dx*dx+dz*dz);}
 if(typeof peds!=='undefined')for(const n of peds){const g=n.c&&n.c.g;if(!g)continue;const dx=g.position.x-px,dz=g.position.z-pz;applyDynamicLOD(n,g,'npc',dx*dx+dz*dz);}
}

function boxG(w,h,d,side,top){const g=new THREE.BoxGeometry(w,h,d);const uv=g.attributes.uv;
 for(let f=0;f<6;f++)for(let k=0;k<4;k++){const i=f*4+k;let u=uv.getX(i),v=uv.getY(i);
  if(f===2||f===3){if(top){u*=w/top[0];v*=d/top[1];}else{u=.002;v=.002;}}
  else{if(side){u*=(f<2?d:w)/side[0];v*=h/side[1];}else if(top){u*=(f<2?d:w)/top[0];v*=h/top[1];}else{u=.002;v=.002;}}
  uv.setXY(i,u,v);}
 g.translate(0,h/2,0);return g;}

// ---------- Fassaden-Texturen ----------
function facade(kind){
 const W=512,H=kind==='shop'?128:kind==='adobe'?256:512;
 const c1=document.createElement('canvas'),c2=document.createElement('canvas');c1.width=c2.width=W;c1.height=c2.height=H;
 const g=c1.getContext('2d'),e=c2.getContext('2d');e.fillStyle='#000';e.fillRect(0,0,W,H);
 const litC=()=>['#ffd49a','#ffe4b5','#d4e6ff','#ffc87a','#fff0d0'][Math.floor(Math.random()*5)];
 const L=(x,y,w,h,p=.4)=>{if(Math.random()<p){e.fillStyle=litC();e.fillRect(x,y,w,h);}};
 const grain=a=>{for(let i=0;i<7000;i++){const v=Math.random()<.5?0:255;g.fillStyle=`rgba(${v},${v},${v},${a*Math.random()})`;g.fillRect(Math.random()*W,Math.random()*H,2,2);}};
 let tw=16,th=28;
 if(kind==='glass'){tw=24;th=32;
  for(let y=0;y<8;y++)for(let x=0;x<8;x++){const v=Math.random()*28;g.fillStyle=`rgb(${28+v|0},${46+v|0},${66+v*1.3|0})`;g.fillRect(x*64,y*64,64,64);
   const gr=g.createLinearGradient(0,y*64,0,y*64+64);gr.addColorStop(0,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(x*64,y*64,64,64);L(x*64+4,y*64+5,56,54,.33);}
  g.fillStyle='#aeb8c2';for(let i=0;i<=8;i++){g.fillRect(i*64-2,0,4,H);g.fillRect(0,i*64-3,W,6);}
 }else if(kind==='office'){tw=24;th=32;
  g.fillStyle='#c6c3bb';g.fillRect(0,0,W,H);grain(.07);
  for(let y=0;y<8;y++){g.fillStyle='#1f2b35';g.fillRect(0,y*64+16,W,38);g.fillStyle='rgba(160,190,220,.18)';g.fillRect(0,y*64+16,W,10);
   for(let x=0;x<16;x++){g.fillStyle='#8d949b';g.fillRect(x*32,y*64+16,3,38);L(x*32+3,y*64+16,29,38,.4);}
   g.fillStyle='rgba(0,0,0,.18)';g.fillRect(0,y*64+54,W,3);}
 }else if(kind==='brick'){tw=16;th=28;
  g.fillStyle='#b6a493';g.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=12)for(let x=-((y/12)%2)*16;x<W;x+=32){const v=Math.random()*34;g.fillStyle=`rgb(${138+v|0},${68+v*.5|0},${50+v*.4|0})`;g.fillRect(x+1,y+1,30,10);}
  for(let y=0;y<8;y++)for(let x=0;x<4;x++){const px=x*128+32,py=y*64+12;g.fillStyle='#ece6da';g.fillRect(px-4,py-4,72,46);g.fillStyle='#1d2730';g.fillRect(px,py,64,38);g.fillStyle='rgba(150,180,210,.2)';g.fillRect(px,py,64,12);g.fillStyle='#ece6da';g.fillRect(px+30,py,4,38);g.fillStyle='#d0c8b8';g.fillRect(px-6,py+42,76,5);L(px,py,64,38,.45);}
 }else if(kind==='plaster'){tw=16;th=24;
  g.fillStyle='#efefef';g.fillRect(0,0,W,H);grain(.06);
  for(let y=0;y<8;y++)for(let x=0;x<4;x++){const px=x*128+38,py=y*64+14;g.fillStyle='#6f757c';g.fillRect(px-16,py,12,38);g.fillRect(px+56,py,12,38);g.fillStyle='#24303a';g.fillRect(px,py,52,38);g.fillStyle='rgba(150,180,210,.2)';g.fillRect(px,py,52,12);g.fillStyle='#fafafa';g.fillRect(px+24,py,4,38);L(px,py,52,38,.45);
   if(y%2===1){g.fillStyle='#4a4e54';g.fillRect(px-10,py+36,72,4);for(let k=0;k<9;k++)g.fillRect(px-10+k*9,py+20,2,18);}}
 }else if(kind==='shop'){tw=16;th=4.2;
  g.fillStyle='#2d2b29';g.fillRect(0,0,W,H);
  for(let x=0;x<4;x++){const px=x*128+8,aw=['#c0392b','#1e8449','#1f5fbf','#d68910','#7d3c98','#117a65'][Math.floor(Math.random()*6)];
   for(let k=0;k<8;k++){g.fillStyle=k%2?aw:'#f2f2f2';g.fillRect(px+k*14,6,14,20);}
   g.fillStyle='#1a232b';g.fillRect(px,32,112,88);g.fillStyle='#6d6a66';g.fillRect(px+54,32,4,88);
   e.fillStyle=['#ffd9a0','#ffe9c9','#cde3ff','#ffc9a0'][Math.floor(Math.random()*4)];e.globalAlpha=.8;e.fillRect(px+2,34,108,84);e.globalAlpha=1;}
 }else if(kind==='house'||kind==='adobe'||kind==='shabby'){const ad=kind==='adobe',sh=kind==='shabby';tw=8;th=ad?4:6;
  g.fillStyle=ad?'#efe6d6':'#f1eee8';g.fillRect(0,0,W,H);grain(.09);
  for(let i=0;i<26;i++){const x=Math.random()*W,y=Math.random()*H,r=10+Math.random()*50;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${ad?120:90},${ad?90:85},${ad?60:80},.12)`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
  const gr=g.createLinearGradient(0,H*.82,0,H);gr.addColorStop(0,'rgba(80,60,40,0)');gr.addColorStop(1,'rgba(80,60,40,.45)');g.fillStyle=gr;g.fillRect(0,H*.82,W,H*.18);
  const rows=ad?[.3]:[.16,.62];const cols=ad?[.12,.64]:[.1,.6];
  for(const fy of rows)for(const fx of cols){const px=fx*W,py=fy*H,ww=W*.24,hh=ad?H*.36:H*.22;
   g.fillStyle='rgba(0,0,0,.25)';g.fillRect(px-3,py-3,ww+6,hh+8);g.fillStyle='#f7f5f0';g.fillRect(px-5,py-5,ww+10,hh+10);
   g.fillStyle='#22303a';g.fillRect(px,py,ww,hh);const lg=g.createLinearGradient(px,py,px+ww,py+hh);lg.addColorStop(0,'rgba(170,200,225,.45)');lg.addColorStop(.5,'rgba(170,200,225,.05)');lg.addColorStop(1,'rgba(170,200,225,.25)');g.fillStyle=lg;g.fillRect(px,py,ww,hh);
   g.fillStyle='#f7f5f0';g.fillRect(px+ww/2-2,py,4,hh);g.fillRect(px,py+hh*.45,ww,3);
   g.fillStyle='#cfc8bb';g.fillRect(px-8,py+hh+4,ww+16,7);
   if(!ad&&Math.random()<.6){const sc=['#4a6b8a','#7a4a3a','#3f6b4a','#8a7a4a'][Math.floor(Math.random()*4)];g.fillStyle=sc;g.fillRect(px-ww*.32,py-4,ww*.26,hh+8);g.fillRect(px+ww+ww*.06,py-4,ww*.26,hh+8);g.fillStyle='rgba(0,0,0,.25)';for(let k=0;k<hh;k+=7){g.fillRect(px-ww*.32,py+k,ww*.26,2);g.fillRect(px+ww+ww*.06,py+k,ww*.26,2);}}
   if(sh&&Math.random()<.45){g.fillStyle='#6b5038';for(let b=0;b<4;b++){g.save();g.translate(px+ww/2,py+hh*(.15+b*.24));g.rotate((Math.random()-.5)*.25);g.fillRect(-ww*.6,-6,ww*1.2,12);g.fillStyle='rgba(40,25,10,.5)';g.fillRect(-ww*.6,4,ww*1.2,2);g.fillStyle='#6b5038';g.restore();}}else L(px,py,ww,hh,sh?.25:.45);}
  if(sh){for(let i=0;i<40;i++){const x=Math.random()*W,y=Math.random()*H,r=8+Math.random()*40;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(70,55,35,.3)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
   for(let i=0;i<25;i++){g.fillStyle='rgba(160,150,135,.6)';const x=Math.random()*W,y=Math.random()*H;g.beginPath();g.ellipse(x,y,6+Math.random()*16,4+Math.random()*10,Math.random()*3,0,7);g.fill();}
   for(let i=0;i<14;i++){g.fillStyle='rgba(60,40,20,.35)';g.fillRect(Math.random()*W,Math.random()*H*.3,2,40+Math.random()*120);}
   for(let i=0;i<3;i++){g.save();g.translate(40+Math.random()*(W-80),H*.82+Math.random()*H*.1);g.rotate((Math.random()-.5)*.3);g.font='900 34px Impact, Arial Black';g.lineWidth=5;g.strokeStyle='#111';const w2=['ROST','KAOS','SKY','R2','ZONE'][Math.floor(Math.random()*5)];g.strokeText(w2,0,0);g.fillStyle=`hsl(${Math.random()*360},80%,55%)`;g.fillText(w2,0,0);g.restore();}}
  if(ad)for(let i=0;i<10;i++){g.strokeStyle='rgba(90,70,50,.4)';g.lineWidth=1;g.beginPath();let x=Math.random()*W,y=Math.random()*H;g.moveTo(x,y);for(let k=0;k<5;k++){x+=(Math.random()-.5)*30;y+=Math.random()*20;g.lineTo(x,y);}g.stroke();}
 }else if(kind==='warehouse'){tw=30;th=12;
  for(let x=0;x<W;x+=8){g.fillStyle=(x/8)%2?'#c3c7cb':'#a7abb0';g.fillRect(x,0,8,H);}grain(.06);
  g.fillStyle='#7c8288';g.fillRect(170,240,170,272);g.fillStyle='#646a70';for(let y=244;y<H;y+=10)g.fillRect(170,y,170,3);
  for(let x=0;x<6;x++){g.fillStyle='#2a3640';g.fillRect(20+x*82,50,56,28);L(20+x*82,50,56,28,.3);}
 }
 const mk=c=>{const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;};
 return {map:mk(c1),em:mk(c2),tw,th};
}
function fmat(kind,color,rough=.78,metal=0){const f=FAC[kind];const m=M({color,map:f.map,emissive:0xffffff,emissiveMap:f.em,emissiveIntensity:0,roughness:rough,metalness:metal});m.userData.kind=kind;facadeMats.push(m);return m;}
// ---------- Fahrbahnmarkierungen ----------
function decal(m){m.polygonOffset=true;m.polygonOffsetFactor=-4;m.polygonOffsetUnits=-4;return m;}
function building(x,z,w,d,h,kind){
 const mat=pickR(MATS[kind]),f=FAC[kind];let base=.3;
 if(kind!=='glass'&&kind!=='warehouse'&&h>9){addStatic(boxG(w+.3,4.2,d+.3,[FAC.shop.tw,FAC.shop.th]),MATS.shop[0],x,base,z);base+=4.2;}
 addStatic(boxG(w,h-(base-.3),d,[f.tw,f.th]),mat,x,base,z);
 if(kind!=='glass'&&kind!=='warehouse')facadeDetail(x,z,w,d,h,base,kind);
 let top=.3+h;addStatic(boxG(w+.5,.7,d+.5),roofMat,x,top,z);top+=.7;bldgs.push({x:x+SX,z:z+SZ,w,d,h,top:top+SY});
 if(kind==='glass'&&h>55&&rand()<.65){const w2=w*R(.55,.75),d2=d*R(.55,.75),h2=h*R(.12,.25);addStatic(boxG(w2,h2,d2,[f.tw,f.th]),mat,x,top,z);addStatic(boxG(w2+.4,.6,d2+.4),roofMat,x,top+h2,z);top+=h2+.6;}
 if(h>70){addStatic(GEO.cyl,cm(0x8a8a8a,.4,.6),x,top+6,z,0,.18,12,.18);const al=mesh(new THREE.BoxGeometry(.8,.8,.8),antMat,x,top+12.3,z,false);scene.add(al);antennaLights.push(al);}
 else for(let k=0;k<(rand()*3|0);k++)addStatic(boxG(R(1.5,3.5),R(1,2),R(1.5,3.5)),cm(0x9a9a9a,.6,.4),x+R(-w/3,w/3),top,z+R(-d/3,d/3));
 if(kind==='brick'&&rand()<.4){addStatic(GEO.cyl,cm(0x6b4a30,.9),x+w/4,top+2.4,z-d/4,0,1.3,3,1.3);addStatic(GEO.cone,cm(0x4a3220,.9),x+w/4,top+4.4,z-d/4,0,1.4,1,1.4);}
 addSolid(x-w/2-.2,x+w/2+.2,z-d/2-.2,z+d/2+.2,top+1);
}
// Art-déco-Fassaden (Miami-Stil): Eckpilaster, umlaufende Gesimse, gestufte Dachaufbauten, Neonband
let FAC_TRIM=null,FAC_NEON=null;
function facadeDetail(x,z,w,d,h,base,kind){
 if(!FAC_TRIM){FAC_TRIM=[cm(0xfbf8f0,.75),cm(0xe9e2d2,.8)];FAC_NEON=[0xff3fa4,0x2ff3ff,0xb44dff,0x3dffb0,0xffb03b].map(c=>new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:1.8,roughness:.4}));}
 const T=FAC_TRIM[kind==='brick'?1:0],top=.3+h,span=top-base;if(span<5)return;
 for(const sx of [-1,1])for(const sz of [-1,1])addStatic(boxG(.7,span,.7),T,x+sx*w/2,base,z+sz*d/2);
 const n=Math.min(6,Math.floor(span/6.5));for(let k=1;k<=n;k++)addStatic(boxG(w+.5,.24,d+.5),T,x,base+k*span/(n+1),z,0,1,1,1,{noShadow:true});
 if(kind==='plaster'||(kind==='office'&&rand()<.4)){
  addStatic(boxG(w+.6,.14,d+.6),pickR(FAC_NEON),x,top-.55,z,0,1,1,1,{noShadow:true});
  if(h<60&&rand()<.8){const cw=Math.min(w*.45,9),cd=Math.min(d*.3,4);addStatic(boxG(cw,2.2,cd),T,x,top+.7,z);addStatic(boxG(cw*.6,1.4,cd*.7),T,x,top+2.9,z);addStatic(boxG(.5,2.2,.5),T,x,top+4.3,z);}}}
function house(x,z,w,d,h,ry){
 addStatic(boxG(w,h,d,[8,6]),pickR(MATS.house),x,.3,z,ry);
 addStatic(roofGeo,pickR(roofMats),x,.3+h,z,ry,w+1.2,w*.9,d+1.2);
 const fx=Math.sin(ry),fz=Math.cos(ry);
 addStatic(GEO.box,cm(0x5a3a22,.7),x+fx*(d/2+.05),.3+1.05,z+fz*(d/2+.05),ry,1.1,2.1,.12);
 if(rand()<.5)addStatic(GEO.box,cm(0x8a8a8a,.8),x+fx*.0+Math.cos(ry)*w*.25,.3+h+w*.25,z-Math.sin(ry)*w*.25,ry,.7,2,.7);
 const ax=Math.abs(fx)>.5;addSolid(x-(ax?d:w)/2-.3,x+(ax?d:w)/2+.3,z-(ax?w:d)/2-.3,z+(ax?w:d)/2+.3,.3+h+w*.45);
}
function containerStack(x,z,ry){const n=1+(rand()*3|0);for(let k=0;k<n;k++)addStatic(boxG(2.5,2.6,6.1,[2.5,2.6]),pickR(containerCols),x,.3+k*2.6,z,ry);const ax=Math.abs(Math.sin(ry))>.5;addSolid(x-(ax?3.05:1.25),x+(ax?3.05:1.25),z-(ax?1.25:3.05),z+(ax?1.25:3.05),.3+n*2.6);}
function crane(x,z){const m=cm(0xe0a21b,.6,.3);for(const [dx,dz] of [[-4,-4],[4,-4],[-4,4],[4,4]])addStatic(GEO.box,m,x+dx,15,z+dz,0,.8,30,.8);
 addStatic(GEO.box,m,x,30.5,z+6,0,9,1.5,40);addStatic(GEO.box,cm(0x333333,.6),x,27,z+18,0,3,3,3);addStatic(GEO.box,m,x,12,z,0,9,1,9);
 for(const [dx,dz] of [[-4,-4],[4,-4],[-4,4],[4,4]])addSolid(x+dx-.5,x+dx+.5,z+dz-.5,z+dz+.5,30);}
function sign(text,bg,fg,w=512,h=96,font=60){return canvasTex(w,h,(g)=>{g.fillStyle=bg;g.fillRect(0,0,w,h);g.fillStyle=fg;g.font=`bold ${font}px Arial`;g.textAlign='center';g.textBaseline='middle';g.fillText(text,w/2,h/2+3);});}
function vnoise(x,z){const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi,u=xf*xf*(3-2*xf),v=zf*zf*(3-2*zf);const X=xi&255,X1=(xi+1)&255,Z=NPm[zi&255],Z1=NPm[(zi+1)&255];
 const a=NGv[NPm[X+Z]],b=NGv[NPm[X1+Z]],c=NGv[NPm[X+Z1]],d=NGv[NPm[X1+Z1]];return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function fbm(x,z,o=4){let s=0,a=.5,f=1,n=0;for(let i=0;i<o;i++){s+=vnoise(x*f+i*17.3,z*f-i*9.1)*a;n+=a;a*=.5;f*=2.03;}return s/n;}
function ridged(x,z,o=4){let s=0,a=.5,f=1,n=0;for(let i=0;i<o;i++){const v=1-Math.abs(vnoise(x*f+i*31.7,z*f+i*7.9)*2-1);s+=v*v*a;n+=a;a*=.5;f*=2.1;}return s/n;}
function smin(a,b,k){const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;}
function siteD(x,z){let d=-1e9;for(const k in SITES){const s=SITES[k];const dx=Math.max(s.x0-x,x-s.x1,0),dz=Math.max(s.z0-z,z-s.z1,0);d=Math.max(d,90-Math.hypot(dx,dz));}return d;}
function landD(x,z){
 const wx=-1190+(fbm(z/900+11,3.3,3)-.5)*230+(vnoise(z/170+5,1.7)-.5)*50;
 const ex=1300+(fbm(z/850+31,7.1,3)-.5)*230+(vnoise(z/160+9,2.9)-.5)*50;
 const nz=-3400+(fbm(x/900+51,5.5,3)-.5)*260+(vnoise(x/150+3,8.8)-.5)*50;
 const ox=x<-830?-830-x:x>990?x-990:0;
 const sz=ox>0?WATER_Z-ox*ox/1100+(vnoise(x/140,4.4)-.5)*26*Math.min(1,ox/80):WATER_Z;
 let d=smin(smin(x-wx,ex-x,120),smin(z-nz,sz-z,120),140);
 for(const b of BAYS)d=smin(d,Math.hypot(x-b[0],(z-b[1])*b[3])-b[2],60);for(const c of CAPES)d=Math.max(d,c[2]-Math.hypot(x-c[0],z-c[1]));
 return Math.max(d,Math.min(siteD(x,z),sz-z+40));}
// Stadtstrand (Port Solara Süd): flacher Sandstrand mit Wall
function seaFloor(dd){return SEA_Y-Math.min(42,dd*.035+dd*dd*.00012);}
function cityBeach(z){const t=z-COAST;if(t<8)return .02+t*.035;if(t<34)return .3-(t-8)*.0096;return seaFloor(z-WATER_Z);}
function mountainH(x,z){let h=0;for(const p of PEAKS){const r=Math.hypot(x-p.x,(z-p.z)*1.15);if(r>=p.R)continue;const t=1-r/p.R;h=Math.max(h,p.H*Math.pow(t,1.45));}
 if(h<=0)return 0;const rg=ridged(x/260,z/260,4);h*=.72+.5*rg;
 const pass=Math.exp(-Math.pow((x-140)/170,2));return h*(1-.8*pass);}
function desertH(x,z){let h=20+fbm(x/700+90,z/700+90,3)*20+fbm(x/180,z/180,2)*4;
 const dm=sstep(.5,.68,fbm(x/1100+200,z/1100+200,3));if(dm>0){const ph=(x*.55+z*.83)/44+fbm(x/260,z/260,2)*5.5;const ph2=(x*.8-z*.6)/15+fbm(x/90,z/90,2)*3;h+=dm*(Math.pow(Math.abs(Math.sin(ph)),1.7)*6.5+Math.pow(Math.abs(Math.sin(ph2)),2)*1.4);}
 for(const m of MESAS){const r=Math.hypot(x-m.x,z-m.z)+(vnoise(x/30,z/30)-.5)*24;if(r<m.R+40)h=Math.max(h,lerpN(h,h*.3+m.H+fbm(x/40,z/40,2)*4,sstep(m.R+36,m.R,r)));}
 return h;}
function rawH(x,z){
 const inGrid=x>-HALF-ROAD/2&&x<HALF+ROAD/2&&z>-HALF-ROAD/2&&z<COAST;
 if(inGrid)return 0;
 const d=landD(x,z);
 const cityX=x>-850&&x<1000;
 if(cityX&&z>COAST-1){const b=cityBeach(z);const w=sstep(-850,-800,x)*(1-sstep(950,1000,x));if(w>=1)return b;}
 if(d<0)return seaFloor(-d);
 let h=SEA_Y+Math.min(1.5,d*.03);
 const n1=fbm(x/520,z/520,4),n2=fbm(x/160+40,z/160+40,3);
 let r=4+n1*18+n2*5;
 r=lerpN(r,18+n1*62+n2*13,sstep(-930,-1380,z+(n1-.5)*140));
 r+=mountainH(x,z);
 r=lerpN(r,desertH(x,z),sstep(-1820,-2120,z+(n2-.5)*120));
 // West-/Ostküste etwas sanfter
 h+=r*sstep(25,260,d);
 // Stadtgebiet flach
 const dxo=Math.max(0,-805-x,x-965),dzo=Math.max(0,-805-z);const cw=(1-sstep(0,260,dxo))*(1-sstep(0,260,dzo));
 h=lerpN(h,0,cw);
 if(cityX&&z>COAST-1){const b=cityBeach(z);const w=sstep(-850,-800,x)*(1-sstep(950,1000,x));h=lerpN(h,b,w);}
 return h;}
// Plätze ebnen
function padH(s){if(s.h!=null)return s.h;const cx=(s.x0+s.x1)/2,cz=(s.z0+s.z1)/2;let a=0,n=0;for(let k=0;k<9;k++){const x=lerpN(s.x0,s.x1,(k%3+.5)/3),z=lerpN(s.z0,s.z1,(Math.floor(k/3)+.5)/3);a+=rawH(x,z);n++;}return a/n+(s.dh||0);}
// ---------- Höhe abfragen (gleiche Dreiecke wie das Gelände-Mesh) ----------
function thAt(i,j){i=i<0?0:i>=TNX?TNX-1:i;j=j<0?0:j>=TNZ?TNZ-1:j;return TH[j*TNX+i];}
function terrainH(x,z){const fx=(x-TX0)/TC,fz=(z-TZ0)/TC;if(fx<0||fz<0||fx>=TNX-1||fz>=TNZ-1)return SEA_Y-40;
 const i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j,q=j*TNX+i;const h00=TH[q],h10=TH[q+1],h01=TH[q+TNX],h11=TH[q+TNX+1];
 return v>u?h00+(h11-h01)*u+(h01-h00)*v:h00+(h10-h00)*u+(h11-h10)*v;}
function terrainN(x,z,o){const e=2;const a=terrainH(x-e,z),b=terrainH(x+e,z),c=terrainH(x,z-e),d=terrainH(x,z+e);o=o||new THREE.Vector3();o.set(a-b,2*e,c-d);return o.normalize();}
function catmull(ctrl,step){const P=ctrl.map(p=>({x:p[0],z:p[1]}));const out=[];
 for(let k=0;k<P.length-1;k++){const p0=P[Math.max(0,k-1)],p1=P[k],p2=P[k+1],p3=P[Math.min(P.length-1,k+2)];const L=Math.hypot(p2.x-p1.x,p2.z-p1.z);const n=Math.max(1,Math.ceil(L/step));
  for(let s=0;s<n;s++){const t=s/n,t2=t*t,t3=t2*t;const f=(a,b,c,d)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);out.push({x:f(p0.x,p1.x,p2.x,p3.x),z:f(p0.z,p1.z,p2.z,p3.z)});}}
 const l=P[P.length-1];out.push({x:l.x,z:l.z});return out;}
function defRoad(name,type,ctrl,o={}){const T=RTYPE[type];const pts=catmull(ctrl,4);let s=0;
 for(let i=0;i<pts.length;i++){if(i)s+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].z-pts[i-1].z);pts[i].s=s;pts[i].t=Math.max(SEA_Y+.7,terrainH(pts[i].x,pts[i].z));}
 // Höhenprofil glätten
 const n=pts.length,W=Math.max(2,Math.round(T.smooth/4));const raw=pts.map(p=>p.t);const sm=new Float32Array(n);
 for(let i=0;i<n;i++){let a=0,c=0;for(let k=-W;k<=W;k++){const q=Math.min(n-1,Math.max(0,i+k));const w=1-Math.abs(k)/(W+1);a+=raw[q]*w;c+=w;}sm[i]=a/c;}
 if(o.y0!=null)sm[0]=o.y0;if(o.y1!=null)sm[n-1]=o.y1;
 for(let pass=0;pass<3;pass++){for(let i=1;i<n;i++){const ds=pts[i].s-pts[i-1].s,g=T.grade*ds;if(i===n-1&&o.y1!=null)continue;sm[i]=clamp(sm[i],sm[i-1]-g,sm[i-1]+g);}
  for(let i=n-2;i>=0;i--){const ds=pts[i+1].s-pts[i].s,g=T.grade*ds;if(i===0&&o.y0!=null)continue;sm[i]=clamp(sm[i],sm[i+1]-g,sm[i+1]+g);}}
 for(let i=0;i<n;i++)pts[i].y=Math.max(SEA_Y+.6,sm[i]);
 const r={id:ROADS.length,name,type,hw:T.hw,sh:T.sh,pts,len:s,o};ROADS.push(r);return r;}
function roadAt(x,z,pad=0){const L=RGRID.get(Math.floor(x/RG)*100003+Math.floor(z/RG));if(!L)return null;let best=null,bd=1e9;
 for(const sg of L){const a=sg.a,b=sg.b;const ex=b.x-a.x,ez=b.z-a.z,l2=ex*ex+ez*ez||1;const t=clamp(((x-a.x)*ex+(z-a.z)*ez)/l2,0,1);const d=Math.hypot(x-a.x-ex*t,z-a.z-ez*t);
  if(d<sg.r.hw+pad&&d<bd){bd=d;best={r:sg.r,k:sg.k,t,d,y:a.y+(b.y-a.y)*t,side:Math.sign(ex*(z-a.z)-ez*(x-a.x))};}}return best;}
function roadY(x,z){const q=roadAt(x,z,.6);return q?q.y+.04:null;}
function onDeck(x,z){return (Math.abs(x-PIERX)<5.2&&z>WATER_Z-14&&z<WATER_Z+68)||(Math.abs(x-JX)<3.4&&z>WATER_Z-16&&z<JZ1+.5);}
function isSea(x,z,depth=.5){return terrainH(x,z)<SEA_Y-depth&&!onDeck(x,z);}
function nearestLand(x,z){if(terrainH(x,z)>SEA_Y+.25)return {x,z};for(let r=12;r<2600;r+=12){const n=Math.max(8,Math.round(r/6));for(let k=0;k<n;k++){const a=k/n*Math.PI*2,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(terrainH(px,pz)>SEA_Y+.35&&!onIsland({x:px,z:pz}))return {x:px,z:pz};}}return {x:0,z:0};}
function seaPush(p){const h=terrainH(p.x,p.z);if(h>=SEA_Y-.55||onDeck(p.x,p.z))return false;const e=4,gx=terrainH(p.x+e,p.z)-terrainH(p.x-e,p.z),gz=terrainH(p.x,p.z+e)-terrainH(p.x,p.z-e);const gl=Math.hypot(gx,gz);
 if(gl<1e-4){const L=nearestLand(p.x,p.z);const dx=L.x-p.x,dz=L.z-p.z,dl=Math.hypot(dx,dz)||1;p.x+=dx/dl*2;p.z+=dz/dl*2;return true;}
 const mv=Math.min(3,(SEA_Y-.55-h)/(gl/(2*e))+.05);p.x+=gx/gl*mv;p.z+=gz/gl*mv;return true;}
// ---------- Gelände-Texturen (prozedural) ----------
function terrTex(kind){return cvs(512,512,(g,w,h)=>{const R=Math.random;
 if(kind==='grass'){g.fillStyle='#55683a';g.fillRect(0,0,w,h);for(let i=0;i<60;i++){const x=R()*w,y=R()*h,r=20+R()*70;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,R()<.33?'rgba(120,125,60,.55)':R()<.5?'rgba(95,80,45,.4)':'rgba(45,65,28,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
  for(let i=0;i<9000;i++){const x=R()*w,y=R()*h,l=3+R()*7,a=-Math.PI/2+(R()-.5)*1.2;g.strokeStyle=`hsl(${55+R()*50},${25+R()*30}%,${16+R()*32}%)`;g.lineWidth=1+R();g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();}
  for(let i=0;i<500;i++){g.fillStyle=`rgba(${90+R()*40|0},${70+R()*30|0},40,.45)`;g.fillRect(R()*w,R()*h,2,2);}}
 else if(kind==='rock'){g.fillStyle='#8a8378';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=4+R()*10){g.fillStyle=`rgba(${R()<.5?40:200},${R()<.5?35:190},${R()<.5?30:170},${.06+R()*.1})`;g.fillRect(0,y,w,2+R()*6);}
  for(let i=0;i<16000;i++){const v=R()*255|0;g.fillStyle=`rgba(${v},${v*.95|0},${v*.88|0},.12)`;g.fillRect(R()*w,R()*h,2+R()*3,2+R()*3);}
  for(let i=0;i<70;i++){g.strokeStyle='rgba(30,26,22,.55)';g.lineWidth=1+R()*2.5;g.beginPath();let x=R()*w,y=R()*h;g.moveTo(x,y);for(let k=0;k<10;k++){x+=(R()-.5)*50;y+=(R()-.3)*30;g.lineTo(x,y);}g.stroke();}
  for(let i=0;i<40;i++){g.fillStyle=`rgba(${120+R()*40|0},${130+R()*30|0},90,.18)`;g.beginPath();g.ellipse(R()*w,R()*h,10+R()*30,6+R()*18,R()*3,0,7);g.fill();}}
 else if(kind==='sand'){g.fillStyle='#d3ad7a';g.fillRect(0,0,w,h);
  for(let i=0;i<50;i++){const x=R()*w,y=R()*h,r=30+R()*90;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,R()<.5?'rgba(150,105,60,.18)':'rgba(255,235,200,.16)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
  const ang=(R()-.5)*.3;for(let y=-40;y<h+40;y+=9+R()*7){const amp=3+R()*5,fr=.01+R()*.02,ph=R()*6;g.lineWidth=2.2;
   for(const [dy,c] of [[0,'rgba(95,65,35,.32)'],[2.5,'rgba(255,240,215,.26)']]){g.strokeStyle=c;g.beginPath();for(let x=0;x<=w;x+=8){const yy=y+dy+Math.sin(x*fr+ph)*amp+x*ang;if(x===0)g.moveTo(x,yy);else g.lineTo(x,yy);}g.stroke();}}
  for(let i=0;i<26000;i++){const v=R();g.fillStyle=v<.4?'rgba(110,80,45,.3)':v<.8?'rgba(255,248,230,.3)':'rgba(70,55,40,.35)';g.fillRect(R()*w,R()*h,1+R()*1.4,1+R()*1.4);}}
 else{g.fillStyle='#6e5a42';g.fillRect(0,0,w,h);for(let i=0;i<20000;i++){const v=R();g.fillStyle=v<.5?'rgba(50,38,26,.3)':'rgba(150,125,95,.3)';g.fillRect(R()*w,R()*h,1+R()*3,1+R()*3);}
  for(let i=0;i<700;i++){const x=R()*w,y=R()*h,r=1.5+R()*5;g.fillStyle=`hsl(${25+R()*20},${10+R()*20}%,${30+R()*35}%)`;g.beginPath();g.ellipse(x,y,r,r*(.6+R()*.4),R()*3,0,7);g.fill();g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.ellipse(x-r*.3,y-r*.3,r*.4,r*.3,0,0,7);g.fill();}
  for(let i=0;i<40;i++){g.strokeStyle='rgba(35,25,15,.4)';g.lineWidth=1+R()*2;g.beginPath();let x=R()*w,y=R()*h;g.moveTo(x,y);for(let k=0;k<6;k++){x+=(R()-.5)*40;y+=(R()-.5)*40;g.lineTo(x,y);}g.stroke();}}});}
// Splat-Gewichte & Tönung je Vertex
function terrSplat(x,z,h,ny,out,col){const d=landD(x,z);const slope=1-ny;const n=fbm(x/90+300,z/90+300,2),n2=fbm(x/35+700,z/35+700,2);
 let g=1,r=0,s=0,di=0;
 const des=sstep(-1780,-2060,z+(n-.5)*160);
 // Wüste: Sand, mit Erde/Fels
 s=des*(1-sstep(.62,.8,n2)*.6);di=des*sstep(.55,.85,n2)*.9+des*.15;g=(1-des);
 // Strand & Meeresboden
 const beach=h<SEA_Y+2.6?1-sstep(18,55,d):0;s=Math.max(s,beach);if(h<SEA_Y-.25&&d<0)s=Math.max(s,.9);
 // Berge: Fels an Hängen & oben
 r=sstep(.22,.42,slope)+sstep(150,215,h)*.8;
 // Erde in Senken & Pfaden
 di+=sstep(.6,.82,n)*g*.7+sstep(.14,.24,slope)*.4;
 // Hügel: trockenes Gras
 const dry=sstep(-700,-1150,z)*(1-des)*(.5+n*.6)+sstep(.55,.8,n2)*.3;
 g*=Math.max(0,1-r)*(1-beach);s*=Math.max(0,1-r*.8);di*=Math.max(0,1-r*.6)*(1-beach*.8);
 const sum=g+r+s+di||1;out[0]=g/sum;out[1]=r/sum;out[2]=s/sum;out[3]=di/sum;
 // Tönung: Gras saftig ↔ trocken, Wüste warm, Strand hell
 const lush=1-clamp(dry,0,1);let cr=lerpN(1.2,.9,lush),cg=lerpN(1.0,.97,lush),cb=lerpN(.62,.78,lush);
 cr=lerpN(cr,1.12,des);cg=lerpN(cg,.97,des);cb=lerpN(cb,.84,des);
 if(beach>0&&des<.5){cr=lerpN(cr,1.12,beach);cg=lerpN(cg,1.08,beach);cb=lerpN(cb,1.02,beach);}
 if(h<SEA_Y){const k=clamp((SEA_Y-h)/3,0,1);cr*=1-k*.35;cg*=1-k*.25;cb*=1-k*.1;}
 col[0]=cr;col[1]=cg;col[2]=cb;col[3]=clamp(Math.max(des,dry*.8),0,1);}
// ---------- Fahrbahn-Meshes ----------
function roadTexCanvas(type){return cvs(256,1024,(g,w,h)=>{const R=Math.random;
 if(type==='dirt'){g.fillStyle='#8a7052';g.fillRect(0,0,w,h);for(let i=0;i<16000;i++){g.fillStyle=R()<.5?'rgba(60,45,30,.3)':'rgba(190,165,130,.3)';g.fillRect(R()*w,R()*h,1+R()*3,1+R()*3);}
  for(const cx of [.3,.7]){const gr=g.createLinearGradient((cx-.1)*w,0,(cx+.1)*w,0);gr.addColorStop(0,'rgba(60,45,30,0)');gr.addColorStop(.5,'rgba(60,45,30,.35)');gr.addColorStop(1,'rgba(60,45,30,0)');g.fillStyle=gr;g.fillRect((cx-.1)*w,0,.2*w,h);}
  for(let i=0;i<300;i++){const x=R()*w,y=R()*h,r=1+R()*3;g.fillStyle=`hsl(30,${10+R()*15}%,${35+R()*30}%)`;g.beginPath();g.arc(x,y,r,0,7);g.fill();}return;}
 g.fillStyle='#3c3e42';g.fillRect(0,0,w,h);
 for(let i=0;i<26000;i++){const v=R();g.fillStyle=v<.45?'rgba(20,20,22,.35)':v<.9?'rgba(120,120,118,.28)':'rgba(190,185,175,.35)';g.fillRect(R()*w,R()*h,1+R()*1.6,1+R()*1.6);}
 const lanes=type==='hw'?4:2;for(let l=0;l<lanes;l++){const c=(l+.5)/lanes;for(const o of [-.11,.11]){const x=(c+o/lanes*1.6)*w;const gr=g.createLinearGradient(x-14,0,x+14,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.5,'rgba(10,10,12,.28)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-14,0,28,h);}}
 for(let i=0;i<6;i++){const x=R()*w,y=R()*h;{const v=R()<.5?28:84;g.fillStyle=`rgba(${v},${v},${v+3},.35)`;}g.fillRect(x,y,30+R()*90,40+R()*160);}
 for(let i=0;i<26;i++){g.strokeStyle='rgba(15,15,15,.6)';g.lineWidth=1+R()*1.5;g.beginPath();let x=R()*w,y=R()*h;g.moveTo(x,y);for(let k=0;k<7;k++){x+=(R()-.5)*30;y+=(R()-.5)*50;g.lineTo(x,y);}g.stroke();}
 for(let i=0;i<5;i++){const x=R()*w,y=R()*h,r=8+R()*18;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(10,10,10,.45)');gr.addColorStop(1,'rgba(10,10,10,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
 const line=(x,dash,col,lw)=>{g.fillStyle=col;if(!dash)g.fillRect(x-lw/2,0,lw,h);else for(let y=0;y<h;y+=256)g.fillRect(x-lw/2,y+30,lw,128);};
 line(.035*w,false,'#e9e6dc',6);line(.965*w,false,'#e9e6dc',6);
 if(type==='hw'){line(.49*w,false,'#e7c33a',5);line(.51*w,false,'#e7c33a',5);line(.255*w,true,'#ece9e0',5);line(.745*w,true,'#ece9e0',5);}
 else line(.5*w,true,'#e7c33a',5);
 // Abnutzung über den Markierungen
 for(let i=0;i<4000;i++){g.fillStyle='rgba(60,62,66,.5)';g.fillRect(R()*w,R()*h,2,2);}});}
function roadRibbon(r,w0,w1,yo,vlen,mat,shadow){const P=r.pts,n=P.length;const pos=[],uv=[],idx=[];
 for(let i=0;i<n;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)];let tx=b.x-a.x,tz=b.z-a.z;const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;const nx=-tz,nz=tx;
  for(const [o,u] of [[w0,0],[w1,1]]){const x=P[i].x+nx*o,z=P[i].z+nz*o;let y=P[i].y+yo;if(Math.abs(o)>r.hw+.5){y=Math.max(terrainH(x,z)+.03,P[i].y+yo-Math.abs(Math.abs(o)-r.hw)*.15);}pos.push(x,y,z);uv.push(u,P[i].s/vlen);}
  if(i<n-1){const q=i*2;idx.push(q,q+1,q+2,q+1,q+3,q+2);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 // Normalen nach oben zwingen (Kurven-Artefakte vermeiden)
 const nn=g.attributes.normal;for(let i=0;i<nn.count;i++){if(nn.getY(i)<0)nn.setXYZ(i,-nn.getX(i),-nn.getY(i),-nn.getZ(i));}
 g.computeBoundingSphere();const m=new THREE.Mesh(g,mat);m.receiveShadow=true;m.castShadow=false;scene.add(m);return m;}

function gridSample(A,x,z){const fx=(x-TX0)/TC,fz=(z-TZ0)/TC;if(fx<0||fz<0||fx>=TNX-1||fz>=TNZ-1)return 0;const i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j,q=j*TNX+i;return (A[q]*(1-u)+A[q+1]*u)*(1-v)+(A[q+TNX]*(1-u)+A[q+TNX+1]*u)*v;}
// Normalen-Textur aus einem Graustufen-Canvas (Sobel)
function normalFromCanvas(src,str=2){const w=src.width,h=src.height;const sd=src.getContext('2d').getImageData(0,0,w,h).data;const H=new Float32Array(w*h);for(let i=0;i<w*h;i++)H[i]=(sd[i*4]*.3+sd[i*4+1]*.59+sd[i*4+2]*.11)/255;
 const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');const img=g.createImageData(w,h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const l=H[y*w+((x-1+w)%w)],r=H[y*w+((x+1)%w)],u=H[((y-1+h)%h)*w+x],d=H[((y+1)%h)*w+x];let nx=(l-r)*str,ny=(d-u)*str,nz=1;const L=Math.hypot(nx,ny,nz);const i=(y*w+x)*4;img.data[i]=(nx/L*.5+.5)*255;img.data[i+1]=(ny/L*.5+.5)*255;img.data[i+2]=(nz/L*.5+.5)*255;img.data[i+3]=255;}
 g.putImageData(img,0,0);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.NoColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;}
function cvs(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return c;}
function texOf(c,rep){const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;t.wrapS=t.wrapT=THREE.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);return t;}
// ---------- Blätter-Texturen: jedes Blatt einzeln gezeichnet ----------
function drawLeaf(g,x,y,len,ang,col,vein){g.save();g.translate(x,y);g.rotate(ang);const w=len*.42;
 const gr=g.createLinearGradient(-w/2,0,w/2,0);gr.addColorStop(0,col[0]);gr.addColorStop(.5,col[1]);gr.addColorStop(1,col[2]);g.fillStyle=gr;
 g.beginPath();g.moveTo(0,0);g.bezierCurveTo(w*.75,-len*.18,w*.55,-len*.78,0,-len);g.bezierCurveTo(-w*.55,-len*.78,-w*.75,-len*.18,0,0);g.fill();
 g.strokeStyle=vein;g.lineWidth=Math.max(1,len*.035);g.globalAlpha=.7;g.beginPath();g.moveTo(0,0);g.lineTo(0,-len*.95);g.stroke();
 g.lineWidth=Math.max(.6,len*.015);for(let k=1;k<6;k++){const t=k/6;g.beginPath();g.moveTo(0,-len*t);g.lineTo(w*.32,-len*(t+.12));g.moveTo(0,-len*t);g.lineTo(-w*.32,-len*(t+.12));g.stroke();}
 g.globalAlpha=1;g.restore();}
function leafCanvas(kind,seed){return cvs(512,512,(g,w,h)=>{g.clearRect(0,0,w,h);const rr=mulberry32(seed);const Rr=(a,b)=>a+rr()*(b-a);
 if(kind==='broad'||kind==='birch'||kind==='dry'||kind==='bush'){
  const hue=kind==='dry'?[30,48]:kind==='birch'?[78,96]:kind==='bush'?[95,130]:[88,122];
  g.strokeStyle=kind==='birch'?'#4a3a2a':'#4b3524';g.lineCap='round';
  const tw=[];for(let k=0;k<7;k++){const a=-Math.PI/2+Rr(-1.1,1.1);let x=w/2,y=h-10,len=Rr(170,260);g.lineWidth=Rr(3,6);g.beginPath();g.moveTo(x,y);const ex=x+Math.cos(a)*len,ey=y+Math.sin(a)*len;g.quadraticCurveTo(x+Math.cos(a)*len*.4+Rr(-30,30),y+Math.sin(a)*len*.6,ex,ey);g.stroke();tw.push([x,y,ex,ey]);}
  const n=kind==='birch'?160:kind==='bush'?150:120;
  for(let k=0;k<n;k++){const t=tw[k%tw.length],f=Rr(.25,1);const x=t[0]+(t[2]-t[0])*f+Rr(-40,40),y=t[1]+(t[3]-t[1])*f+Rr(-40,40);if(Math.hypot(x-w/2,y-h*.5)>w*.48)continue;
   const L=kind==='birch'?Rr(26,40):kind==='bush'?Rr(24,40):Rr(38,64);const hh=Rr(hue[0],hue[1]),s=Rr(38,62),l=kind==='dry'?Rr(30,48):Rr(20,36);
   drawLeaf(g,x,y,L,Rr(-3.1,3.1),[`hsl(${hh},${s}%,${l-6}%)`,`hsl(${hh+4},${s+6}%,${l+8}%)`,`hsl(${hh},${s}%,${l-9}%)`],`hsla(${hh+10},40%,${l+18}%,1)`);}}
 else if(kind==='needle'){g.lineCap='round';
  for(let b=0;b<5;b++){let x=w/2+Rr(-40,40),y=h-6;const a=-Math.PI/2+Rr(-.5,.5),len=Rr(300,440);const ex=x+Math.cos(a)*len,ey=y+Math.sin(a)*len;
   g.strokeStyle='#4a3626';g.lineWidth=5;g.beginPath();g.moveTo(x,y);g.lineTo(ex,ey);g.stroke();
   for(let s=0;s<len;s+=5){const px=x+Math.cos(a)*s,py=y+Math.sin(a)*s,nl=Rr(18,34)*(1-s/len*.55);for(const sd of [-1,1]){const na=a+sd*Rr(.6,1.0);g.strokeStyle=`hsl(${Rr(105,140)},${Rr(30,50)}%,${Rr(16,30)}%)`;g.lineWidth=Rr(1.5,2.5);g.beginPath();g.moveTo(px,py);g.lineTo(px+Math.cos(na)*nl,py+Math.sin(na)*nl);g.stroke();}}}}
 else if(kind==='palm'){g.lineCap='round';
  g.strokeStyle='#8a9a4a';g.lineWidth=7;g.beginPath();g.moveTo(w/2,h);g.lineTo(w/2,4);g.stroke();
  for(let y=h-14;y>8;y-=7){const t=1-y/h,L=Rr(150,215)*(1-Math.pow(t,3)*.75)*(t<.08?t/.08:1);for(const sd of [-1,1]){const a=(sd<0?Math.PI:0)+sd*(-.55-t*.25)+Rr(-.06,.06);
   const ex=w/2+Math.cos(a)*L,ey=y+Math.sin(a)*L*.55;const hh=Rr(85,110),l=Rr(22,36);g.strokeStyle=`hsl(${hh},${Rr(40,60)}%,${l}%)`;g.lineWidth=Rr(5,8)*(1-t*.5);g.beginPath();g.moveTo(w/2,y);g.quadraticCurveTo(w/2+Math.cos(a)*L*.5,y+Math.sin(a)*L*.2-10,ex,ey);g.stroke();
   g.strokeStyle=`hsla(${hh+8},50%,${l+16}%,.6)`;g.lineWidth=1;g.beginPath();g.moveTo(w/2,y);g.quadraticCurveTo(w/2+Math.cos(a)*L*.5,y+Math.sin(a)*L*.2-10,ex,ey);g.stroke();}}}
 else if(kind==='meadow'){for(let k=0;k<150;k++){const x=Rr(10,w-10),hh=Rr(.35,.9)*h*.95,bend=Rr(-40,40);g.strokeStyle=`hsl(${Rr(70,110)},${Rr(35,60)}%,${Rr(22,42)}%)`;g.lineWidth=Rr(2,5);g.lineCap='round';g.beginPath();g.moveTo(x,h);g.quadraticCurveTo(x+bend*.3,h-hh*.6,x+bend,h-hh);g.stroke();}
  for(let k=0;k<26;k++){const x=Rr(30,w-30),y=Rr(h*.1,h*.55),c=['#ffe14d','#ffffff','#c77dff','#ff6b6b','#ffb347'][k%5];g.strokeStyle='hsl(95,40%,30%)';g.lineWidth=2;g.beginPath();g.moveTo(x,h);g.lineTo(x+Rr(-10,10),y);g.stroke();for(let p=0;p<5;p++){const a=p/5*Math.PI*2;g.fillStyle=c;g.beginPath();g.arc(x+Math.cos(a)*6,y+Math.sin(a)*6,5,0,7);g.fill();}g.fillStyle='#e0a020';g.beginPath();g.arc(x,y,3.5,0,7);g.fill();}}
 else if(kind==='grass'||kind==='drygrass'){const dry=kind==='drygrass';for(let k=0;k<170;k++){const x=Rr(10,w-10),hh=Rr(.4,1)*h*.95,bend=Rr(-40,40);g.strokeStyle=dry?`hsl(${Rr(42,70)},${Rr(22,42)}%,${Rr(28,48)}%)`:`hsl(${Rr(70,110)},${Rr(35,60)}%,${Rr(22,42)}%)`;g.lineWidth=Rr(2,5);g.lineCap='round';g.beginPath();g.moveTo(x,h);g.quadraticCurveTo(x+bend*.3,h-hh*.6,x+bend,h-hh);g.stroke();}}});}
// Blattmaterial: Alpha-to-Coverage (weiche Kanten mit MSAA), Mip-Alpha-Korrektur, gebogene Normalen (Kronen-Licht), Wind
function leafMaterial(kind,seed,color=0xffffff,o={}){const c=leafCanvas(kind,seed);const t=texOf(c);t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
 const m=new THREE.MeshStandardMaterial({map:t,color,alphaTest:.42,side:THREE.DoubleSide,roughness:.74,metalness:0,alphaToCoverage:true});
 const bend=o.bend??.72,amp=o.amp??1,trans=o.trans??.1,ao=o.ao??.25;
 m.onBeforeCompile=sh=>{sh.uniforms.uTime=VEGU.uTime;sh.uniforms.uWind=VEGU.uWind;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime,uWind;attribute vec3 aN;').replace('#include <begin_vertex>',`#include <begin_vertex>
  #ifdef USE_INSTANCING
  vec3 ip=vec3(instanceMatrix[3][0],instanceMatrix[3][1],instanceMatrix[3][2]);
  #else
  vec3 ip=vec3(0.0);
  #endif
  float ph=ip.x*.21+ip.z*.17+ip.y*.05;float tip=clamp(uv.y,0.0,1.0)*${amp.toFixed(2)};
  transformed.x+=(sin(uTime*2.1+ph+position.y*1.3)*.07+sin(uTime*5.3+ph*3.1)*.015)*uWind*tip;transformed.z+=cos(uTime*1.7+ph*1.4)*.06*uWind*tip;transformed.y+=sin(uTime*2.6+ph*.7)*.025*uWind*tip;`)
  .replace('#include <defaultnormal_vertex>',`#include <defaultnormal_vertex>
  if(dot(aN,aN)>.01)transformedNormal=normalize(mix(normalize(transformedNormal),normalize(normalMatrix*aN),${bend.toFixed(2)}));`);
  sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>',THREE.ShaderChunk.normal_fragment_begin.replace('normal *= faceDirection;',''))
  .replace('#include <alphatest_fragment>',`{vec2 dx_=dFdx(vMapUv*512.0),dy_=dFdy(vMapUv*512.0);float lod_=max(0.0,.5*log2(max(dot(dx_,dx_),dot(dy_,dy_))));diffuseColor.a*=1.0+lod_*.3;
   diffuseColor.a=(diffuseColor.a-alphaTest)/max(fwidth(diffuseColor.a),1e-4)+.5;if(diffuseColor.a<.02)discard;diffuseColor.a=clamp(diffuseColor.a,0.,1.);diffuseColor.rgb*=(gl_FrontFacing?1.0:.86)*mix(${(1-ao).toFixed(2)},1.,smoothstep(0.,.5,vMapUv.y));}`)
  .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=diffuseColor.rgb*'+trans.toFixed(3)+';')
  .replace('#include <opaque_fragment>','gl_FragColor=vec4(outgoingLight,diffuseColor.a);');};
 m.customProgramCacheKey=()=>'leaf-v3-'+bend+'-'+amp+'-'+trans+'-'+ao;return m;}
function vegPush(key,mat,geo,m,n,col){const cx=Math.floor(m.elements[12]/VCH),cz=Math.floor(m.elements[14]/VCH);const k=key+'|'+cx+'_'+cz;
 const v=VEG[k]||(VEG[k]={key,mat,geo,m:[],n:[],c:[]});v.m.push(...m.elements);v.n.push(n.x,n.y,n.z);v.c.push(col.r,col.g,col.b);}
// Stamm mit Biegung & Rinde
function trunkGeo(h,r0,r1,bx,bz,seg=8){const g=new THREE.CylinderGeometry(r1,r0,h,seg,6,true);g.translate(0,h/2,0);const p=g.attributes.position,uv=g.attributes.uv;
 for(let i=0;i<p.count;i++){const y=p.getY(i),t=y/h;const n=1+.08*Math.sin(p.getX(i)*13+y*3)*Math.sin(p.getZ(i)*11)+(t<.08?(.08-t)*3:0);p.setX(i,p.getX(i)*n+bx*t*t);p.setZ(i,p.getZ(i)*n+bz*t*t);uv.setXY(i,uv.getX(i)*2,uv.getY(i)*h/1.6);}g.computeVertexNormals();return g;}
function branchAt(x,y,z,len,r,yaw,tilt,mat){const g=trunkGeo(len,r,r*.35,0,0,6);addStatic(g,mat,x,y,z,yaw,1,1,1,{rx:tilt});}
function crownCards(key,mat,cx,cy,cz,rx,ry,rz,n,size,shell=.5,base=[1,1,1]){for(let k=0;k<n;k++){const u=vrand()*2-1,a=vrand()*Math.PI*2,rr=Math.sqrt(1-u*u),f=shell+(1-shell)*Math.cbrt(vrand());
  const dx=Math.cos(a)*rr*f,dy=u*f,dz=Math.sin(a)*rr*f;vP.set(cx+dx*rx,cy+dy*ry,cz+dz*rz);
  vE.set(VR(-.7,.25)+(dy>0?-.3:.2),Math.atan2(dx,dz)+VR(-.6,.6),VR(-.5,.5),'YXZ');vQ.setFromEuler(vE);const sz=size*VR(.75,1.2);vS.set(sz,sz,sz);vM.compose(vP,vQ,vS);
  vN.set(dx,dy*.8+.3,dz);const ao=(.5+.5*f)*(.78+.22*(dy*.5+.5));vegPush(key,mat,cardGeo,vM,vN,tint(base,ao));}}
