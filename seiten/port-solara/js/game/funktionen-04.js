'use strict';
function buildStuntpark(){const X0=40,X1=320,Z0=-750,Z1=-530;groundRect(X0,X1,Z0,Z1,dirtMat,.025);
 for(let k=0;k<14;k++){const x=R(X0+10,X1-10),z=R(Z0+10,Z1-10);if(Math.abs(x-180)<40&&Math.abs(z+640)<70)continue;for(let q=0;q<3;q++)addStatic(GEO.cyl,cm(0x151515,.9),x,.35+q*.7,z,0,.7,.7,.7);addSolid(x-.8,x+.8,z-.8,z+.8,2);}
 for(const [x,z] of [[110,-560],[260,-720],[300,-620]])containerStack(x,z,0);
 signMesh('STUNTPARK',12,2,180,6,-528,0,'#111','#ffd23a',1,64);addStatic(GEO.box,cm(0x2b2f33,.5,.6),174,3,-528.2,0,.3,6,.3);addStatic(GEO.box,cm(0x2b2f33,.5,.6),186,3,-528.2,0,.3,6,.3);
 ZONES.push({name:'Stuntpark',x0:X0,x1:X1,z0:Z0,z1:Z1});}
function buildNorthPark(){const X0=380,X1=535,Z0=-750,Z1=-530;
 const lake=new THREE.Mesh(new THREE.CircleGeometry(24,40),waterMat);lake.rotation.x=-Math.PI/2;lake.position.set(450,.12,-600);scene.add(lake);addSolid(433,467,-617,-583,-10);
 for(let k=0;k<18;k++){const a=k/18*Math.PI*2;tree(450+Math.cos(a)*32,-600+Math.sin(a)*32,R(.8,1.2));}
 addStatic(boxG(150,7,22),grassMat,457,0,-722);addSolid(382,532,-733,-711,7);
 const LT={S:['01111','10000','10000','01110','00001','00001','11110'],O:['01110','10001','10001','10001','10001','10001','01110'],L:['10000','10000','10000','10000','10000','10000','11111'],A:['01110','10001','10001','11111','10001','10001','10001'],R:['11110','10001','10001','11110','10100','10010','10001']};
 const lm=new THREE.MeshStandardMaterial({color:0xf4f4f4,roughness:.5,emissive:0xffffff,emissiveIntensity:0});glowMats.push(lm);
 const word='SOLARA',px=2.3;let lx=457-((word.length*5+(word.length-1)*1.5)*px)/2;
 for(const ch of word){const bm=LT[ch];for(let r=0;r<7;r++)for(let c=0;c<5;c++)if(bm[r][c]==='1')addStatic(GEO.box,lm,lx+c*px+px/2,7+(6-r)*px+px/2,-716,0,px*.92,px*.92,1.2);lx+=6.5*px;}
 ZONES.push({name:'Nordpark',x0:X0,x1:X1,z0:Z0,z1:Z1});}

// ---------- Insel ----------
function buildIsland(){const st=sandTex.clone();st.needsUpdate=true;st.repeat.set(24,3);
 const s=new THREE.Mesh(new THREE.CylinderGeometry(IR+4,IR+22,3.2,64),M({map:st,roughness:1}));s.position.set(IX,0,IZ);s.receiveShadow=true;scene.add(s);
 const gt=grassTex.clone();gt.needsUpdate=true;gt.repeat.set(30,30);const g=new THREE.Mesh(new THREE.CylinderGeometry(100,103,.9,56),M({map:gt,roughness:1}));g.position.set(IX,1.6,IZ);g.receiveShadow=true;scene.add(g);
 const vx=IX+12,vz=IZ-14;addStatic(boxG(32,5,20,[16,24]),MATS.plaster[3],vx,2.05,vz);addStatic(boxG(24,4,14,[16,24]),MATS.plaster[3],vx-3,7.05,vz-2);addStatic(boxG(33,.5,21),cm(0x2b2b2b,.5),vx,7.05,vz);addStatic(boxG(25,.5,15),cm(0x2b2b2b,.5),vx-3,11.05,vz-2);
 addStatic(boxG(24,1,.15),winGlass,vx-3,7.55,vz+5.2,0,1,1,1,{noShadow:true});addSolid(vx-16,vx+16,vz-10,vz+10,11.5);
 const pool=new THREE.Mesh(new THREE.BoxGeometry(14,.1,6),poolMat);pool.position.set(vx,2.12,vz+16);scene.add(pool);addStatic(GEO.box,cm(0xeeeeee,.6),vx,2.07,vz+16,0,15,.1,7,{noShadow:true});
 for(let k=0;k<14;k++){const a=k/14*Math.PI*2;tree(IX+Math.cos(a)*90,IZ+Math.sin(a)*90,R(.9,1.2),'palm');}
 const hp=new THREE.Mesh(new THREE.CircleGeometry(9,32),new THREE.MeshStandardMaterial({map:hpadTex,roughness:.8}));hp.rotation.x=-Math.PI/2;hp.position.set(IX-40,2.12,IZ+30);hp.receiveShadow=true;scene.add(hp);
 for(let k=0;k<5;k++){const x=IX-60+k*14,z=IZ+80;addStatic(GEO.cyl,cm(0xdddddd,.5),x,3.3,z,0,.05,2.6,.05);addStatic(GEO.cone,cm([0xe74c3c,0x3498db,0xf1c40f][k%3],.8),x,4.6,z,0,1.6,.6,1.6);}
 ZONES.push({name:'Insel Solara Isla',cx:IX,cz:IZ,r:IR+10});}
function buildProps(){const benchM=cm(0x6b4a30,.8),metal=cm(0x3a3f45,.5,.6),binM=cm(0x2f5f3a,.7),hydM=cm(0xc0392b,.5);
 for(const b of blockInfo){const sp=SPECIAL[b.i+','+b.j];const t=b.type;const cx=(b.x0+b.x1)/2;
  addStatic(GEO.cyl,binM,b.x0+4,.75,b.z1-.9,0,.32,.9,.32);addStatic(GEO.cyl,hydM,b.x1-5,.65,b.z0+.9,0,.18,.7,.18);
  if(sp||t==='park'||t==='industrial'||t==='garage'||t==='police'||t==='hospital')continue;
  if(rand()<.6){const bx=b.x0+R(10,BLK-10);BENCHES.push({x:bx,z:b.z1-2.9,face:0,t});addStatic(boxG(2.2,.1,.6),benchM,bx,.75,b.z1-2.8);addStatic(boxG(2.2,.6,.1),benchM,bx,.85,b.z1-3.1);addStatic(GEO.box,metal,bx-.9,.52,b.z1-2.85,0,.08,.45,.5);addStatic(GEO.box,metal,bx+.9,.52,b.z1-2.85,0,.08,.45,.5);}
  if((t==='downtown'||t==='mixed')&&rand()<.5)for(let x=b.x0+8;x<b.x1-6;x+=13)tree(x,b.z1-1.2,.7,'round');
  if((t==='mixed'||t==='downtown')&&rand()<.22){const bx=cx+R(-12,12),bz=b.z1-1.6;SHELTERS.push({x:bx,z:bz-.1,face:0,t});addStatic(boxG(4.6,.15,1.6),metal,bx,2.6,bz);addStatic(boxG(4.6,2.3,.06),winGlass,bx,.3,bz-.75,0,1,1,1,{noShadow:true});addStatic(GEO.box,metal,bx-2.2,1.45,bz,0,.1,2.3,.1);addStatic(GEO.box,metal,bx+2.2,1.45,bz,0,.1,2.3,.1);const ap=new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.9),pickR(adMats));ap.position.set(bx+2.6,1.4,bz+.05);scene.add(ap);}
 }}
function buildBillboards(){const metal=cm(0x2b2f33,.5,.6);let n=0;
 for(const b of bldgs){if(b.h<12||b.h>55||Math.abs(b.x)>HALF||Math.abs(b.z)>HALF||rand()>.22)continue;const face=rand()<.5?1:-1;const bw=Math.min(b.w-2,13),bh=bw*.44;const y=b.top+1.6+bh/2,z=b.z+face*(b.d/2-1.4);
  for(const s of [-1,1])addStatic(GEO.box,metal,b.x+s*bw*.33,b.top+.9,z,0,.25,1.6,.25);
  addStatic(boxG(bw+.3,bh+.3,.12),metal,b.x,y-bh/2-.15,z);
  const pl=new THREE.Mesh(new THREE.PlaneGeometry(bw,bh),pickR(adMats));pl.position.set(b.x,y,z+face*.08);pl.rotation.y=face>0?0:Math.PI;scene.add(pl);
  if(++n>=28)break;}}
function ramp(x,z,ry,len,w,h,stunt){const y0=groundY(x,z);addStatic(rampGeo,rampMat,x,y0,z,ry,w,h,len);ramps.push({x,z,ry,len,w,h,y0,stunt,id:ramps.length});}
function buildRamps(){
 ramp(80,-640,Math.PI/2,12,6,4,true);ramp(180,-700,Math.PI/2,14,6,5,true);ramp(270,-580,-Math.PI/2,12,6,4.5,true);
 ramp(-150,COAST+12,Math.PI/2,10,6,3.4,true);ramp(-300,RING.z0+16,Math.PI/2,12,6,3.6,true);ramp(AIRX0+150,-120,0,12,7,4,true);
 ramp(160,-245,Math.PI/2,10,5,3.2,true);ramp(-722,100,Math.PI/2,10,5,3,true);ramp(RING.x0+16,-100,0,12,6,3.6,true);ramp(505,nodeX(2),Math.PI/2,10,6,3.4,true);
 ramp(120,-580,0,10,6,3,false);ramp(220,-650,Math.PI,10,6,3,false);ramp(300,-720,-Math.PI/2,12,6,4,false);}
function buildPackages(){const L=[];
 for(const b of blockInfo)if(b.type==='park')L.push([b.x0+5,0,b.z0+5]);
 L.push([PIERX+2.5,0,WATER_Z+64],[IX+30,0,IZ+22],[IX-80,0,IZ-20],[-175,0,-640],[-690,0,-262],[-600,0,-232],[-575,0,150],[-600,0,-690],[200,0,-600],[457,0,-702],[870,0,236],[AIRX0+62,0,-70],[-420,0,COAST+15],[420,0,COAST+15],[RING.x0+18,0,RING.z0+18],[RING.x1-18,0,RING.z0+18]);
 const tall=bldgs.filter(b=>Math.abs(b.x)<HALF&&Math.abs(b.z)<HALF).sort((a,b)=>b.top-a.top).slice(0,4);for(const b of tall)L.push([b.x,b.top+1.4,b.z]);
 L.push([880,36.2,250]);
 while(L.length<30){const b=pickR(blockInfo);L.push([b.x0+1.8,0,(b.z0+b.z1)/2]);}
 L.slice(0,30).forEach((p,k)=>packageSpots.push({id:k,x:p[0],y:p[1]>0?p[1]:groundY(p[0],p[2]),z:p[2],roof:p[1]>3}));}
function lightState(i,j,axis){const T=(time+((i+j)%2)*11)%22;if(axis==='x')return T<9?'g':T<11?'y':'r';return T>=11&&T<20?'g':T>=20?'y':'r';}
function buildTrafficLights(){const pos=[];
 for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){const x=nodeX(i),z=nodeX(j);
  for(const [sx,sz,axis] of [[1,1,'z'],[-1,-1,'z'],[1,-1,'x'],[-1,1,'x']]){const px=axis==='z'?x+sx*8.3:x+sx*12.4,pz=axis==='z'?z+sz*12.4:z+sz*8.3;if(Math.abs(px)>HALF+6||Math.abs(pz)>HALF+6)continue;pos.push({i,j,axis,x:px,z:pz});}}
 const pm=new THREE.InstancedMesh(new THREE.CylinderGeometry(.09,.12,5.2,6),cm(0x2b2f33,.45,.7),pos.length);
 const hm=new THREE.InstancedMesh(new THREE.BoxGeometry(.45,1.1,.45),cm(0x1a1a1a,.6),pos.length);
 const bm=new THREE.InstancedMesh(new THREE.SphereGeometry(.16,8,6),new THREE.MeshBasicMaterial({color:0xffffff}),pos.length*2);
 const o=new THREE.Object3D();
 pos.forEach((q,k)=>{o.position.set(q.x,2.9,q.z);o.updateMatrix();pm.setMatrixAt(k,o.matrix);o.position.y=5.3;o.updateMatrix();hm.setMatrixAt(k,o.matrix);
  for(let s=0;s<2;s++){o.position.set(q.x+(q.axis==='x'?(s?.25:-.25):0),5.45,q.z+(q.axis==='z'?(s?.25:-.25):0));o.updateMatrix();bm.setMatrixAt(k*2+s,o.matrix);bm.setColorAt(k*2+s,tlRed);}
  const sd=addSolid(q.x-.18,q.x+.18,q.z-.18,q.z+.18,5.6);sd.breakable=true;sd.bg=TL_G;sd.bi=k;sd.box={x0:sd.x0,x1:sd.x1,z0:sd.z0,z1:sd.z1};});
 pm.castShadow=true;scene.add(pm,hm,bm);TL.bulbs=bm;TL.info=pos;TL_G.pts=pos.map(q=>[q.x,q.z]);TL_G.parts=[{im:pm,off:2.6,ix:[0]},{im:hm,off:5,ix:[0]},{im:bm,off:5.15,ix:[0,1],mul:2}];}
function updateTrafficLights(dt){TL.t-=dt;if(TL.t>0||!TL.bulbs)return;TL.t=.25;const bm=TL.bulbs;TL.info.forEach((f,k)=>{const s=lightState(f.i,f.j,f.axis);const c=s==='g'?tlGrn:s==='y'?tlYel:tlRed;bm.setColorAt(k*2,c);bm.setColorAt(k*2+1,c);});bm.instanceColor.needsUpdate=true;}
// ---------- Westhafen-Steg (Ankunft im Intro) ----------
function buildJetty(){const wd=cm(0x8a6a45,.85);addStatic(boxG(6.4,.5,JZ1-(WATER_Z-14),[2,2]),wd,JX,0,(JZ1+WATER_Z-14)/2);
 for(let z=WATER_Z-4;z<JZ1;z+=7)for(const s of [-1,1])addStatic(GEO.cyl,cm(0x5a4530,1),JX+s*3,-1,z,0,.28,2.6,.28);
 for(const s of [-1,1])for(const z of [WATER_Z+8,WATER_Z+30])addStatic(GEO.cyl,cm(0x2b2f33,.6,.5),JX+s*2.8,.75,z,0,.18,.5,.18);
 for(const z of [WATER_Z+2,WATER_Z+26]){addStatic(GEO.cyl,cm(0x2b2f33,.45,.7),JX-2.9,3,z,0,.09,5.4,.09);scene.add(mesh(new THREE.BoxGeometry(.5,.18,.5),bulbMat,JX-2.9,5.7,z,false));}
 signMesh('WESTHAFEN',5,1,JX,3.4,WATER_Z-13.6,0,'#0f3d5c','#ffffff',.8,64);addStatic(GEO.box,cm(0x2b2f33,.6,.5),JX-2.4,0,WATER_Z-13.8,0,.15,3,.15);addStatic(GEO.box,cm(0x2b2f33,.6,.5),JX+2.4,0,WATER_Z-13.8,0,.15,3,.15);}
// ---------- Flughafen: Zaun, Wachhaus, Tore ----------
function buildAirportSecurity(){const X0=AIRX0-8,X1=AIRX1+8,Z0=AIRZ0-8,Z1=AIRZ1+8,fm=cm(0x8a9097,.6,.5);
 fenceBox(X0,Z0,X0,-9,3.2,fm);fenceBox(X0,9,X0,246,3.2,fm);fenceBox(X0,254,X0,Z1,3.2,fm);fenceBox(X0,Z0,X1,Z0,3.2,fm);fenceBox(X0,Z1,X1,Z1,3.2,fm);fenceBox(X1,Z0,X1,Z1,3.2,fm);
 addStatic(boxG(3.2,2.8,3.2,[2,2]),MATS.office[0],580,0,-18);addStatic(boxG(3.6,.3,3.6),roofMat,580,2.8,-18);addSolid(578.4,581.6,-19.6,-16.4,3.1);
 for(const s of [-1,1])addStatic(GEO.box,cm(0x2b2f33,.5,.6),X0-1,3.2,s*12,0,.4,6.4,.4);addStatic(GEO.box,cm(0x1f2f4f,.6),X0-1,6.5,0,0,.6,1.6,24.4);
 for(const s of [-1,1])signMesh('FLUGHAFEN SOLARA',11,1.4,X0-1+s*.34,6.5,0,s*Math.PI/2,'#1f2f4f','#ffffff',1.2,60);
 for(const [sx,sz] of [[X0-.25,120],[X0-.25,-200],[X0-.25,320]])signMesh('NUR FÜR BEFUGTE – VIDEOÜBERWACHT',8,1,sx,2.2,sz,-Math.PI/2,'#b8860b','#111111',.6,40);
 signMesh('LIEFERANTEN',4,.8,X0-.3,3.6,250,-Math.PI/2,'#333333','#ffd23a',.8,52);}
function buildWorldExtras(){buildJetty();buildAirportSecurity();buildRing();buildFunland();buildJunkyard();relocated(buildPrison,PO.x,PO.z,SITES.prison.y);relocated(buildMilitary,MO.x,MO.z,SITES.fort.y);buildStadium();buildStuntpark();buildNorthPark();buildIsland();buildProps();buildBillboards();buildRamps();buildPackages();buildTrafficLights();}
function district(i,j,cx,cz){
 if(i===GBLK.i&&j===GBLK.j)return 'garage';if(i===PBLK.i&&j===PBLK.j)return 'police';
 if(i===HBLK.i&&j===HBLK.j)return 'hospital';
 if(PARKS.has(i+','+j))return 'park';
 if(i<=2)return 'industrial';
 if(Math.hypot(cx,cz+30)<215)return 'downtown';
 if(j>=N-1)return 'beach';
 if(j<=3||i>=N-3)return 'residential';
 return 'mixed';
}
function helipad(x,z){const m=new THREE.Mesh(new THREE.CircleGeometry(9,32),new THREE.MeshStandardMaterial({map:hpadTex,roughness:.8}));m.rotation.x=-Math.PI/2;const X=x+SX,Z=z+SZ;FLAT_EX.push([X-10,X+10,Z-10,Z+10]);m.position.set(X,Math.max(.14+SY,surfTop(X-9,X+9,Z-9,Z+9)+.06),Z);m.receiveShadow=true;decal(m.material);scene.add(m);}
function graffitiTex(seed){const r=mulberry32(seed);return canvasTex(512,192,(g,w,h)=>{g.fillStyle=['#8d8d8a','#9a8f84','#7f8a8f'][seed%3];g.fillRect(0,0,w,h);for(let i=0;i<2000;i++){g.fillStyle=`rgba(0,0,0,${r()*.12})`;g.fillRect(r()*w,r()*h,2,2);}
 for(let k=0;k<2;k++){const word=GRAFF[Math.floor(r()*GRAFF.length)];const cx=w*(.28+k*.45),cy=h*(.45+r()*.15),fs=70+r()*40;g.save();g.translate(cx,cy);g.rotate((r()-.5)*.25);g.font=`900 ${fs}px Impact, Arial Black, sans-serif`;g.textAlign='center';g.textBaseline='middle';
  const c1=`hsl(${r()*360},85%,55%)`,c2=`hsl(${r()*360},90%,60%)`;g.lineJoin='round';g.lineWidth=14;g.strokeStyle='#111';g.strokeText(word,0,0);const gr=g.createLinearGradient(0,-fs/2,0,fs/2);gr.addColorStop(0,c1);gr.addColorStop(1,c2);g.fillStyle=gr;g.fillText(word,0,0);
  g.lineWidth=3;g.strokeStyle='#fff';g.strokeText(word,0,0);for(let d=0;d<6;d++){g.fillStyle=c2;g.fillRect(-fs+r()*fs*2,fs*.35,3,8+r()*24);}g.restore();}});}
// ---------- Bau-Helfer (Gelände) ----------
function baseAt(x,z,w,d){let mx=-1e9,mn=1e9;for(const [a,b] of [[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5],[0,0]]){const y=groundY(x+a*w,z+b*d);mx=Math.max(mx,y);mn=Math.min(mn,y);}return {top:mx,low:mn};}
function onBase(x,z,w,d,fn){const b=baseAt(x,z,w,d);if(b.top-b.low>.12)addStatic(boxG(w+.5,b.top-b.low+.7,d+.5,[3,3],[3,3]),plinthMat,x,b.low-.6,z);const o=SY;SY=b.top-.3;try{fn(b.top);}finally{SY=o;}return b.top;}
function freeSpot(x,z,m=6){if(roadAt(x,z,m))return false;if(terrainH(x,z)<SEA_Y+.8)return false;for(const k in SITES){const s=SITES[k];if(x>s.x0-m&&x<s.x1+m&&z>s.z0-m&&z<s.z1+m)return false;}
 if(x>-830&&x<990&&z>-830&&z<600)return false;return true;}
function shack(x,z,ry,w=RN(4,6),d=RN(3.5,5)){const h=RN(2.4,2.9);onBase(x,z,Math.max(w,d),Math.max(w,d),()=>{const m=PK(WELL);addStatic(boxG(w,h,d,[3,3]),m,x,.3,z,ry);
  addStatic(GEO.box,PK(WELL),x,.3+h+.25,z,ry,w+.6,.12,d+.8,{rx:.12});const fx=Math.sin(ry),fz=Math.cos(ry);addStatic(GEO.box,cm(0x2b241e,.9),x+fx*(d/2+.03),.3+1,z+fz*(d/2+.03),ry,.9,2,.06);
  addStatic(GEO.box,cm(0x1c2328,.3),x+fx*(d/2+.03)+Math.cos(ry)*w*.28,.3+1.5,z+fz*(d/2+.03)-Math.sin(ry)*w*.28,ry,.8,.6,.06);
  const r=Math.max(w,d)/2;addSolid(x-r,x+r,z-r,z+r,.3+h+.4);});}
function trailerHome(x,z,ry,k){onBase(x,z,11,11,()=>{const m=TRAILER[k%TRAILER.length];addStatic(boxG(3.2,2.6,11,[11,2.6],[3.2,11]),m,x,.85,z,ry);addStatic(boxG(3.4,.18,11.2),cm(0x9aa0a4,.5,.4),x,3.45,z,ry);
  for(const s of [-1,1])for(const t of [-3.5,0,3.5])addStatic(GEO.box,cm(0x6a6a66,.9),x+Math.cos(ry)*s*1.1+Math.sin(ry)*t,.55,z-Math.sin(ry)*s*1.1+Math.cos(ry)*t,ry,.4,.6,.4);
  const sx=x+Math.cos(ry)*2,sz=z-Math.sin(ry)*2;addStatic(GEO.box,PK(PLANK),sx,.5,sz,ry,1.2,.5,1.6);
  if(RQ()<.6){addStatic(GEO.box,PK([cm(0x2e7d6b,.8),cm(0xb03a2e,.8),cm(0xd9a93b,.8)]),x+Math.cos(ry)*3.2,3,z-Math.sin(ry)*3.2,ry,3,.06,5,{rz:-.25});
   for(const t of [-2.3,2.3])addStatic(GEO.cyl,cm(0x9aa0a4,.4,.6),x+Math.cos(ry)*4.4+Math.sin(ry)*t,1.9,z-Math.sin(ry)*4.4+Math.cos(ry)*t,0,.05,2.6,.05);}
  const ax=Math.abs(Math.sin(ry))>.5;addSolid(x-(ax?5.6:1.7),x+(ax?5.6:1.7),z-(ax?1.7:5.6),z+(ax?1.7:5.6),3.6);});}
function wreck(x,z,ry,burnt){const y=groundY(x,z);const m=burnt?wreckBurnt:rustMat;addStatic(GEO.box,m,x,y+.55,z,ry,1.8,.75,4.3);addStatic(GEO.box,m,x-Math.sin(ry)*.3,y+1.2,z-Math.cos(ry)*.3,ry,1.6,.6,2.1);
 if(!burnt)for(const [a,b] of [[-.9,1.4],[.9,1.4],[-.9,-1.4]])addStatic(GEO.cyl,wreckTire,x+Math.cos(ry)*a+Math.sin(ry)*b,y+.35,z-Math.sin(ry)*a+Math.cos(ry)*b,ry,.36,.25,.36,{rz:Math.PI/2});
 addSolid(x-2,x+2,z-2,z+2,1.5);}
function chainFence(x0,z0,x1,z1,h=2.6,gaps=[]){const L=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(x1-x0,z1-z0),yb=Math.min(groundY(x0,z0),groundY(x1,z1));
 const g=new THREE.PlaneGeometry(L,h);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*L/1.2,uv.getY(i)*h/1.2);const m=new THREE.Mesh(g,chainMat);m.position.set((x0+x1)/2,yb+h/2+.05,(z0+z1)/2);m.rotation.y=ry+Math.PI/2;m.castShadow=true;scene.add(m);
 for(let t=0;t<=L;t+=3){const x=x0+(x1-x0)*t/L,z=z0+(z1-z0)*t/L;addStatic(GEO.cyl,cm(0x8a9097,.4,.7),x,groundY(x,z)+h/2,z,0,.05,h+.2,.05);}
 addStatic(GEO.cyl,cm(0x8a9097,.4,.7),(x0+x1)/2,yb+h,(z0+z1)/2,ry,.035,L,.035,{rx:Math.PI/2});
 const s=addSolid(Math.min(x0,x1)-.2,Math.max(x0,x1)+.2,Math.min(z0,z1)-.2,Math.max(z0,z1)+.2,yb+h);return s;}
function fenceRect(x0,z0,x1,z1,h,gate){// gate: {side:'e'|'w'|'n'|'s',at,w}
 const segs=[['n',x0,z0,x1,z0],['s',x0,z1,x1,z1],['w',x0,z0,x0,z1],['e',x1,z0,x1,z1]];
 for(const [sd,a,b,c,d] of segs){if(gate&&gate.side===sd){const horiz=b===d;const m=gate.at,w=gate.w/2;if(horiz){chainFence(a,b,m-w,d,h);chainFence(m+w,b,c,d,h);}else{chainFence(a,b,c,m-w,h);chainFence(a,m+w,c,d,h);}}else chainFence(a,b,c,d,h);}}
function barrelFire(x,z){const y=groundY(x,z);addStatic(GEO.cyl,rustMat,x,y+.5,z,0,.32,1,.32);addSolid(x-.35,x+.35,z-.35,z+.35,1);
 const fm=new THREE.MeshBasicMaterial({color:new THREE.Color(3,1.3,.3),transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false});
 const f=new THREE.Mesh(new THREE.ConeGeometry(.24,.8,7),fm);f.position.set(x,y+1.35,z);scene.add(f);AREA.fires.push({m:f,x,y:y+1.1,z,ph:RQ()*9});}
function lampPost(x,z,h=6){const y=groundY(x,z);addStatic(GEO.cyl,cm(0x3a3a38,.6,.5),x,y+h/2,z,0,.09,h,.09);const b=new THREE.Mesh(new THREE.BoxGeometry(.4,.15,.4),bulbMat);b.position.set(x,y+h,z);scene.add(b);addSolid(x-.15,x+.15,z-.15,z+.15,h);}
function couch(x,z,ry){const y=groundY(x,z),m=PK([cm(0x6b3e2e,.95),cm(0x3e5a6b,.95),cm(0x7a6a3a,.95)]);addStatic(GEO.box,m,x,y+.3,z,ry,2,.5,.9);addStatic(GEO.box,m,x-Math.sin(ry)*.35,y+.75,z-Math.cos(ry)*.35,ry,2,.6,.25);}
function trashPile(x,z){const y=groundY(x,z);for(let k=0;k<5;k++)addStatic(GEO.blob,PK([cm(0x1a1a1a,.4),cm(0x2b2f2a,.5),cm(0x3a3020,.8)]),x+RN(-1,1),y+.3,z+RN(-1,1),RQ()*3,RN(.35,.6),RN(.3,.45),RN(.35,.6));}
function graffitiWall(x,z,ry,L=8,h=2.6){const y=groundY(x,z);const m=PK(GRAFFMAT);addStatic(boxG(L,h,.35,[L,h]),m,x,y,z,ry);const ax=Math.abs(Math.sin(ry))>.5;addSolid(x-(ax?.3:L/2),x+(ax?.3:L/2),z-(ax?L/2:.3),z+(ax?L/2:.3),y+h);}
function hoop(x,z,ry){const y=groundY(x,z);addStatic(GEO.cyl,cm(0x2b4a7a,.5,.5),x,y+1.7,z,0,.08,3.4,.08);addStatic(GEO.box,cm(0xf2f2f2,.5),x+Math.sin(ry)*.3,y+3.3,z+Math.cos(ry)*.3,ry,1.8,1.1,.06);
 const r=new THREE.Mesh(new THREE.TorusGeometry(.23,.02,6,16),cm(0xe25a1c,.5,.5));r.rotation.x=Math.PI/2;r.position.set(x+Math.sin(ry)*.58,y+3.05,z+Math.cos(ry)*.58);scene.add(r);}
function quarterPipe(x,z,ry,w=10,r=2.6){const y=groundY(x,z);// Rampe steigt in Blickrichtung ry an
 const g=new THREE.BufferGeometry();const pos=[],idx=[];const seg=12;for(let k=0;k<=seg;k++){const a=k/seg*Math.PI/2;const d=Math.sin(a)*r,hh=(1-Math.cos(a))*r;for(const s of [-w/2,w/2])pos.push(s,hh,d);}
 for(let k=0;k<seg;k++){const q=k*2;idx.push(q,q+2,q+1,q+1,q+2,q+3);}g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
 const uv=[];for(let k=0;k<=seg;k++)uv.push(0,k/seg*2,w/4,k/seg*2);g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 addStatic(g,skateConcDS,x,y+.02,z,ry);addStatic(boxG(w,r,1.6,[3,3]),skateConc,x+Math.sin(ry)*(r+.8),y,z+Math.cos(ry)*(r+.8),ry);
 addStatic(GEO.cyl,cm(0xc9ced3,.25,.9),x+Math.sin(ry)*r,y+r+.05,z+Math.cos(ry)*r,ry,.06,w,.06,{rz:Math.PI/2});
 ramps.push({x,z,ry,len:r,w,h:r*.92,y0:y,stunt:false,id:ramps.length});const ax=Math.abs(Math.sin(ry))>.5,cx=x+Math.sin(ry)*(r+.8),cz=z+Math.cos(ry)*(r+.8);addSolid(cx-(ax?.8:w/2),cx+(ax?.8:w/2),cz-(ax?w/2:.8),cz+(ax?w/2:.8),y+r);}
function skateWedge(x,z,ry,len,w,h){const y=groundY(x,z);addStatic(rampGeo,skateConc,x,y,z,ry,w,h,len);ramps.push({x,z,ry,len,w,h,y0:y,stunt:false,id:ramps.length});}
function buildSkatepark(){const X0=-668,X1=-592,Z0=318,Z1=378,y=groundY(-630,350);
 groundRect(X0,X1,Z0,Z1,decal(skateConc),.05);
 fenceRect(X0-3,Z0-3,X1+3,Z1+3,3.2,{side:'e',at:348,w:8});
 quarterPipe(X0+3,Z0+18,-Math.PI/2,14,2.8);quarterPipe(X0+3,Z1-16,-Math.PI/2,12,2.2);quarterPipe(X1-3,Z0+16,Math.PI/2,12,2.4);quarterPipe(-630,Z0+3,Math.PI,16,2);
 // Funbox mit Rail
 addStatic(boxG(8,.9,5,[3,3],[3,3]),skateConc,-632,y,352);addSolid(-636,-628,349.5,354.5,y+.9);skateWedge(-641,352,-Math.PI/2,5,5,.9);skateWedge(-623,352,Math.PI/2,5,5,.9);
 addStatic(GEO.cyl,cm(0xd0d4d8,.25,.9),-632,y+1.35,352,0,.05,7,.05,{rz:Math.PI/2});for(const t of [-3.2,3.2])addStatic(GEO.cyl,cm(0x6a6e72,.4,.8),-632+t,y+1.1,352,0,.04,.5,.04);
 // erhöhter Bowl
 {const pts=[new THREE.Vector2(3.2,0)];for(let k=1;k<=12;k++){const t=k/12;pts.push(new THREE.Vector2(3.2+Math.sin(t*Math.PI/2)*4.3,(1-Math.cos(t*Math.PI/2))*1.9));}pts.push(new THREE.Vector2(9.2,1.9),new THREE.Vector2(9.25,0));
  const g=new THREE.LatheGeometry(pts,44);addStatic(g,skateConcDS,-610,y+.05,330);const fl=new THREE.CircleGeometry(3.25,30);fl.rotateX(-Math.PI/2);addStatic(fl,skateConc,-610,y+.07,330);
  const rim=new THREE.TorusGeometry(7.5,.07,6,48);rim.rotateX(Math.PI/2);addStatic(rim,cm(0xc9ced3,.25,.9),-610,y+1.98,330);addSolid(-619.3,-600.7,320.7,339.3,y+1.95);}
 // Treppe mit Geländer & Ledges
 for(let k=0;k<4;k++)addStatic(boxG(7,.32,1.1,[3,3]),skateConc,-606,y+k*.32,362+k*1.1);addStatic(boxG(7,1.28,3,[3,3]),skateConc,-606,y,367.9);addSolid(-609.5,-602.5,362,369.4,y+1.28);
 addStatic(GEO.cyl,cm(0xd0d4d8,.25,.9),-606,y+1.1,364,0,.04,5,.04,{rx:Math.PI/2-.28});
 for(const [lx,lz,L] of [[-650,368,9],[-618,322,6]]){addStatic(boxG(L,.55,1.2,[3,3]),skateConc,lx,y,lz);addStatic(GEO.box,cm(0x8a9097,.3,.8),lx,y+.56,lz-.6,0,L,.04,.06);addSolid(lx-L/2,lx+L/2,lz-.6,lz+.6,y+.55);}
 graffitiWall(-640,Z0-1.2,0,20,3);graffitiWall(X0-1.2,348,Math.PI/2,14,3);graffitiWall(-612,Z1+1.2,Math.PI,16,3);graffitiWall(-655,Z1+1.2,Math.PI,12,3);
 for(const [x,z] of [[X0-2,Z0-2],[X1+2,Z0-2],[X0-2,Z1+2],[X1+2,Z1+2]])lampPost(x,z,8);
 for(const bx of [-660,-640])addStatic(boxG(2.2,.45,.6),PLANK[0],bx,y,Z1-1.5);
 // Basketball-Platz daneben
 const court=canvasTex(512,256,(g,w,h)=>{g.fillStyle='#b5523a';g.fillRect(0,0,w,h);g.strokeStyle='#f2f2f2';g.lineWidth=4;g.strokeRect(8,8,w-16,h-16);g.beginPath();g.moveTo(w/2,8);g.lineTo(w/2,h-8);g.stroke();g.beginPath();g.arc(w/2,h/2,34,0,7);g.stroke();for(const sx of [0,1]){g.beginPath();g.arc(sx?w-8:8,h/2,110,sx?Math.PI/2:-Math.PI/2,sx?Math.PI*1.5:Math.PI/2);g.stroke();g.strokeRect(sx?w-80:8,h/2-40,72,80);}});
 const cm2=new THREE.Mesh(new THREE.PlaneGeometry(28,15),decal(M({map:court,roughness:.8})));cm2.rotation.x=-Math.PI/2;cm2.position.set(-640,y+.07,405);cm2.receiveShadow=true;scene.add(cm2);hoop(-653.5,405,Math.PI/2);hoop(-626.5,405,-Math.PI/2);
 chainFence(-656,396,-624,396,3.5);chainFence(-656,414,-624,414,3.5);
 signMesh('SKATEPARK WEST',10,1.6,X1+3.4,4.2,348,Math.PI/2,'#1b1b1b','#ff5ad6',1.4,58);
 ZONES.push({name:'Skatepark West',x0:X0-3,x1:X1+3,z0:Z0-3,z1:Z1+3,col:'#8a8794'});}
// ---------- Rostviertel (armes Viertel, ehem. Militärgelände) ----------
function buildRostviertel(){const X0=-765,X1=-440,Z0=-765,Z1=-530;
 const dirt=decal(M({map:(()=>{const t=TERR.dirt.clone();t.needsUpdate=true;t.repeat.set(4,4);return t;})(),color:0xc8b49a,roughness:1}));
 const brokenAsph=decal(M({map:ringTex,color:0x8e8a86,roughness:.95}));
 const streets=[Z0+48,Z0+118,Z0+188];
 for(const sz of streets){groundRect(X0,X1,sz-4,sz+4,brokenAsph,.035);
  for(let x=X0+16;x<X1-10;x+=23)for(const side of [-1,1]){const lx=x+RN(-2,2),lz=sz+side*15;groundRect(lx-10,lx+10,lz-9,lz+9,dirt,.03);const r=RQ();const ry=side>0?0:Math.PI;
   if(r<.55){SY=groundY(lx,lz)-.3;addStatic(boxG(RN(7,9.5),RN(3,4),RN(6.5,8),[8,6]),PK(MATS.shabby),lx,.3,lz,ry);addStatic(roofGeo,PK(roofMats),lx,.3+3.8,lz,ry,10.4,5.4,9);addSolid(lx-5,lx+5,lz-4.4,lz+4.4,.3+6);
     addStatic(GEO.box,cm(0x3a2a1c,.8),lx,.3+1.05,lz+(side>0?-4.05:4.05),ry,1.1,2.1,.12);SY=0;}
   else if(r<.75)shack(lx,lz,ry);else if(r<.88)trailerHome(lx,lz,ry+Math.PI/2,Math.floor(RQ()*4));else{trashPile(lx,lz);wreck(lx+3,lz,RQ()*3,RQ()<.5);}
   if(RQ()<.45)chainFence(lx-10,lz-side*9,lx+10,lz-side*9,1.6);if(RQ()<.3)wreck(lx+RN(-6,6),lz-side*6.5,RQ()*.4+(side>0?0:Math.PI),RQ()<.35);if(RQ()<.35)couch(lx+RN(-5,5),lz-side*5,ry);if(RQ()<.4)trashPile(lx+RN(-7,7),lz+side*7);}
  for(let x=X0+30;x<X1;x+=52)lampPost(x,sz+5.5,6.5);}
 const px=-600,pz=Z0+153;barrelFire(px,pz);couch(px+3,pz+2,-.6);couch(px-3,pz-2.4,2.4);hoop(px+12,pz-6,Math.PI);graffitiWall(px-14,pz,Math.PI/2,12,2.6);
 for(let k=0;k<5;k++)barrelFire(RN(X0+20,X1-20),streets[k%3]+PK([-9,9]));
 for(let k=0;k<4;k++)graffitiWall(RN(X0+30,X1-30),streets[k%3]+PK([-25,25]),PK([0,Math.PI]),RN(6,10),2.4);
 ZONES.push({name:'Rostviertel',x0:X0,x1:X1,z0:Z0,z1:Z1,poor:true,col:'#6b5a48'});}
// ---------- Vista Mar (Küstenort im Westen) ----------
function buildVistaMar(){const S=SITES.vistamar,y=S.y;
 const pastel=[0xf6d7c3,0xcfe8e0,0xf7efc6,0xd8d2ef,0xf2c9d0,0xc8e3f2];
 for(let k=0;k<14;k++){const x=S.x0+25+(k%7)*36,z=k<7?S.z0+40:S.z0+120;const hh=RN(4,7);onBase(x,z,12,10,()=>{const m=PK(MATS.house);addStatic(boxG(11,hh,9,[8,6]),m,x,.3,z);addStatic(roofGeo,PK(roofMats),x,.3+hh,z,0,12.2,8,10.2);addSolid(x-6,x+6,z-5,z+5,.3+hh+4);});
  if(RQ()<.6)tree(x+RN(-8,8),z+RN(7,10),RN(.9,1.2),'palm');}
 {let st;onBase(-905,S.z0+190,15,11,()=>{st=storeShell(-905,S.z0+190,14,10,4.6,1,MATS.plaster[2],'SURF & SUN','#0a7ca8','#fff8d0');});regStore(st,{name:'Surf & Sun',type:'shop'},'shop');addPlace('store','Surf & Sun',st.door.x,st.door.z,{label:'$',col:'#56d364',r:0});}
 // Rettungsturm & Beachvolleyball am Strand
 const bx=-990,bz=495,by=groundY(bx,bz);for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])addStatic(GEO.cyl,cm(0xd9d2c0,.8),bx+a*1.3,by+1.6,bz+b*1.3,0,.1,3.2,.1);
 addStatic(boxG(3.6,2.2,3.6,[2,2]),PLANK[1],bx,by+3.2,bz);addStatic(GEO.box,cm(0xd8402c,.7),bx,by+5.6,bz,0,4.2,.2,4.2,{rx:.06});addStatic(GEO.box,PLANK[0],bx,by+1.6,bz+2.8,0,1,.1,3.4,{rx:.9});addSolid(bx-1.8,bx+1.8,bz-1.8,bz+1.8,by+5.6);
 const vx=-1040,vz=480,vy=groundY(vx,vz);for(const s of [-1,1])addStatic(GEO.cyl,cm(0xe8e8e8,.5,.4),vx,vy+1.2,vz+s*4.5,0,.06,2.5,.06);
 const net=new THREE.Mesh(new THREE.PlaneGeometry(9,1),new THREE.MeshStandardMaterial({map:chainTex,alphaTest:.4,side:THREE.DoubleSide,color:0x222222}));net.position.set(vx,vy+2,vz);net.rotation.y=Math.PI/2;scene.add(net);
 for(const [a,b,c,d] of [[-8,-4,8,-4],[-8,4,8,4],[-8,-4,-8,4],[8,-4,8,4]])addStatic(GEO.box,cm(0x2a6fd6,.6),vx+(a+c)/2,vy+.03,vz+(b+d)/2,0,Math.abs(c-a)+.1,.02,Math.abs(d-b)+.1);
 for(let k=0;k<10;k++)tree(S.x0+RN(0,S.x1-S.x0),S.z1+RN(10,40),RN(.9,1.2),'palm');
 // Club Mirage (zweiter Club, an der Küste)
 {const cx=-1040,cz=395;const o=SY;SY=groundY(cx,cz)-.3;const cl=buildClubInterior(cx,cz,'Club Mirage',0xffb03a,0x3ee6ff);
  addStatic(boxG(34.6,2.2,22.6),cm(0x241a2e,.6,.2),cx,8.3,cz);SY=o;const y=groundY(cx,cz);const nO=neon(0xffb03a),nT=neon(0x3ee6ff);nO.userData.k=nT.userData.k=.7;
  scene.add(mesh(new THREE.BoxGeometry(34.4,.2,.2),nO,cx,y+2.9,cz+11.38,false),mesh(new THREE.BoxGeometry(34.4,.2,.2),nT,cx,y+10.2,cz+11.38,false));
  const t=canvasTex(512,160,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);g.font='italic 900 110px Arial';g.textAlign='center';g.textBaseline='middle';g.shadowColor='#ffb03a';g.shadowBlur=30;g.fillStyle='#ffc56a';g.fillText('MIRAGE',w/2,h/2+6);});
  const nm=new THREE.MeshStandardMaterial({map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:2});nm.userData.k=.42;neonMats.push(nm);const ns=new THREE.Mesh(new THREE.PlaneGeometry(13,4),nm);ns.position.set(cx,y+6.4,cz+11.42);scene.add(ns);
  for(let k=0;k<6;k++)addStatic(GEO.cyl,cm(0xc9a227,.3,.8),cx-6+k*2.4,y+.55,cz+13.5,0,.07,1.1,.07);
  for(const sx of [-1,1])tree(cx+sx*20,cz+14,1.1,'palm');}
 ZONES.push({name:'Vista Mar',x0:S.x0,x1:S.x1,z0:S.z0,z1:S.z1+60,nofill:true});}
// ---------- Solara Hills: Villen, Sternwarte ----------
function villa(x,z,ry){const w=RN(16,22),d=RN(11,15);onBase(x,z,w+8,d+10,(top)=>{const wm=PK(MATS.house);
  addStatic(boxG(w,3.6,d,[8,6]),wm,x,.3,z,ry);addStatic(boxG(w*.7,3.3,d*.8,[8,6]),wm,x-Math.cos(ry)*w*.12,3.9,z+Math.sin(ry)*w*.12,ry);
  addStatic(boxG(w+.6,.3,d+.6),cm(0x2b2b2b,.5),x,3.9,z,ry);addStatic(boxG(w*.7+.6,.3,d*.8+.6),cm(0x2b2b2b,.5),x-Math.cos(ry)*w*.12,7.2,z+Math.sin(ry)*w*.12,ry);
  const fx=Math.sin(ry),fz=Math.cos(ry);addStatic(boxG(w*.8,2.6,.12),winGlass,x,.6,z+0,ry,1,1,1,{noShadow:true});
  addStatic(boxG(w*.9,2.6,.1),winGlass,x+fx*(d/2+.06),.6,z+fz*(d/2+.06),ry,1,1,1,{noShadow:true});
  const px=x+fx*(d/2+5),pz=z+fz*(d/2+5);const pl=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(fx)>.5?4.2:9,.1,Math.abs(fx)>.5?9:4.2),poolMat);pl.position.set(px,top+.06,pz);scene.add(pl);
  addStatic(GEO.box,cm(0xe8e2d6,.6),px,.32,pz,ry,11,.08,6.4,{noShadow:true});
  const r=Math.max(w,d)/2+.3;addSolid(x-r,x+r,z-r,z+r,.3+7.6);});
 for(let k=0;k<3;k++)tree(x+RN(-16,16),z+RN(-16,16),RN(.9,1.3),PK(['round','pine','palm']));}
function buildHills(){for(const [x,z,ry] of [[-130,-905,0],[-260,-915,0],[-470,-1020,.4],[-610,-1035,-.3],[-300,-1075,Math.PI],[-80,-1060,Math.PI],[-720,-925,0],[60,-1010,-.2]])if(freeSpot(x,z,10)||true)villa(x,z,ry);
 const S=SITES.observ,cx=(S.x0+S.x1)/2,cz=(S.z0+S.z1)/2,y=S.y;
 addStatic(GEO.cyl,cm(0xe9e4d8,.6),cx,y+5,cz,0,13,10,13);addStatic(new THREE.SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI/2),cm(0xf4f4f4,.35,.4),cx,y+10,cz,0,12.5,12.5,12.5);
 addStatic(GEO.box,cm(0x2b2f33,.5),cx,y+16,cz+4,0,2.2,9,.4,{rx:-.5});for(let k=0;k<3;k++){const a=k*2.1;addStatic(new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2),cm(0xf4f4f4,.35,.4),cx+Math.cos(a)*24,y+3,cz+Math.sin(a)*24,0,3,3,3);addStatic(GEO.cyl,cm(0xe9e4d8,.6),cx+Math.cos(a)*24,y+1.5,cz+Math.sin(a)*24,0,3.2,3,3.2);}
 addSolid(cx-13,cx+13,cz-13,cz+13,y+22);signMesh('STERNWARTE SOLARA',12,1.6,cx,y+3,cz+13.2,0,'#18263a','#ffffff',1,52);
 ZONES.push({name:'Sternwarte',x0:S.x0,x1:S.x1,z0:S.z0,z1:S.z1,nofill:true});
 // Gipfel Mount Solara: Funkmast & Aussichtsplattform
 const P=SITES.peak,px=(P.x0+P.x1)/2,pz=(P.z0+P.z1)/2,py=terrainH(px,pz);
 for(let k=0;k<4;k++)addStatic(GEO.cyl,cm(0xc8cdd2,.4,.7),px+(k%2?1.2:-1.2),py+20,pz+(k<2?1.2:-1.2),0,.12,40,.12);for(let h=2;h<40;h+=4)addStatic(GEO.box,cm(0xc8cdd2,.4,.7),px,py+h,pz,0,2.6,.12,2.6);
 const al=mesh(new THREE.BoxGeometry(.8,.8,.8),antMat,px,py+40.6,pz,false);scene.add(al);antennaLights.push(al);addSolid(px-1.6,px+1.6,pz-1.6,pz+1.6,py+40);
 addStatic(boxG(10,.4,6),PLANK[0],px+8,py-.2,pz+4);for(const s of [-1,1])addStatic(GEO.box,cm(0x5a4530,.9),px+8,py+.6,pz+4+s*3,0,10,.08,.08);
 ZONES.push({name:'Mount Solara',cx:px,cz:pz,r:260});}
// ---------- Dustwater (Wüstenstadt) ----------
function buildDustwater(){const S=SITES.dust,y=S.y;const xs=S.x0,xe=S.x1;
 const adobe=MATS.adobe;
 // Hauptstraße folgt der Nordautobahn; Häuser beidseitig
 const rd=ROADS.find(r=>r.name==='Nordautobahn');const P=rd.pts.filter(p=>p.x>xs+10&&p.x<xe-10&&p.z>S.z0+10&&p.z<S.z1-10);
 let k=0;for(let i=0;i<P.length;i+=7){const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)];const tx=b.x-a.x,tz=b.z-a.z,l=Math.hypot(tx,tz)||1;const nx=-tz/l,nz=tx/l;const ry=Math.atan2(tx,tz);
  for(const s of [-1,1]){const off=RN(20,26);const x=P[i].x+nx*off*s,z=P[i].z+nz*off*s;if(!freeSpotTown(x,z))continue;k++;const kind=k%9;
   if(kind===0||kind===5){trailerHome(x,z,ry,k);continue;}
   const w=RN(9,14),d=RN(8,11),h=RN(3.4,5);onBase(x,z,Math.max(w,d)+1,Math.max(w,d)+1,()=>{const m=PK(adobe);addStatic(boxG(w,h,d,[8,4]),m,x,.3,z,ry);addStatic(boxG(w+.8,.3,d+1.6),PK(WELL),x,.3+h,z,ry);
   const fx=Math.sin(ry)*s*-1,fz=Math.cos(ry)*s*-1;addStatic(GEO.box,cm(0x3a2a1c,.8),x-nx*s*(d/2+.05),.3+1.1,z-nz*s*(d/2+.05),ry,1.2,2.2,.1);
   if(RQ()<.5){addStatic(GEO.box,PK(PLANK),x-nx*s*(d/2+1.6),.3+2.9,z-nz*s*(d/2+1.6),ry,w,.12,3,{rx:.08});for(const t of [-w/2+.4,w/2-.4])addStatic(GEO.cyl,cm(0x5a4530,.9),x-nx*s*(d/2+3)+Math.sin(ry+Math.PI/2)*t,.3+1.4,z-nz*s*(d/2+3)+Math.cos(ry+Math.PI/2)*t,0,.1,2.8,.1);}
   const r=Math.max(w,d)/2;addSolid(x-r,x+r,z-r,z+r,.3+h+.3);});
   if(RQ()<.35)wreck(x+nx*s*-8+RN(-4,4),z+nz*s*-8+RN(-4,4),RQ()*3,false);}}
 // Wasserturm
 const wx=xs+60,wz=S.z1-40;for(const [a,b] of [[-3,-3],[3,-3],[-3,3],[3,3]])addStatic(GEO.cyl,cm(0x7a6e62,.7,.3),wx+a,y+9,wz+b,0,.25,18,.25);addStatic(GEO.cyl,cm(0xcfc3ae,.6,.3),wx,y+21.5,wz,0,6,7,6);addStatic(GEO.cone,cm(0x8a7e70,.6,.3),wx,y+26,wz,0,6.4,2.2,6.4);addSolid(wx-4,wx+4,wz-4,wz+4,y+27);
 for(const a of [0,Math.PI])signMesh('DUSTWATER',10,1.8,wx+Math.sin(a)*6.1,y+21.5,wz+Math.cos(a)*6.1,a,'#cfc3ae','#7a2a1a',.2,64);
 // Diner, Motel, Laden, Sheriff
 const shops=[['KAKTUS DINER',-1,'#2f8f6a','#ffe7a3'],['MOTEL OASE',1,'#a23b2a','#ffe7a3'],['GEMISCHTWAREN',-1,'#5a4530','#ffffff'],['SHERIFF',1,'#3a3f45','#ffd23a']];
 const mid=P[Math.floor(P.length/2)]||{x:(xs+xe)/2,z:(S.z0+S.z1)/2};
 shops.forEach(([n,s,bg,fg],i)=>{const q=P[Math.min(P.length-1,Math.floor(P.length*(.2+i*.2)))]||mid;const a=P[Math.max(0,P.indexOf(q)-1)]||q,b=P[Math.min(P.length-1,P.indexOf(q)+1)]||q;const tx=b.x-a.x,tz=b.z-a.z,l=Math.hypot(tx,tz)||1;
  const x=q.x-tz/l*44*s,z=q.z+tx/l*44*s;if(!freeSpotTown(x,z))return;let st;onBase(x,z,17,12,()=>{st=storeShell(x,z,16,11,4.8,Math.sign(q.z-z)||1,PK(adobe),n,bg,fg);});if(i===2&&st){regStore(st,{name:'Gemischtwaren Dustwater',type:'shop'},'shop');addPlace('store','Gemischtwaren',st.door.x,st.door.z,{label:'$',col:'#56d364',r:0});}});
 // Neonschild am Diner
 for(let i=0;i<4;i++){const x=RN(xs+20,xe-20),z=RN(S.z0+20,S.z1-20);if(freeSpotTown(x,z))barrelFire(x,z);}
 ZONES.push({name:'Dustwater',x0:xs,x1:xe,z0:S.z0,z1:S.z1,nofill:true});}
function freeSpotTown(x,z){if(roadAt(x,z,7))return false;for(const s of SOLIDS_TOWN)if(Math.abs(x-s[0])<14&&Math.abs(z-s[1])<14)return false;SOLIDS_TOWN.push([x,z]);return true;}
// ---------- Flugfeld Dustwater ----------
function buildAirfield(){const S=SITES.field,y=S.y;const rz=-2318,x0=870,x1=1250;
 const rwt=canvasTex(512,512,(g,w,h)=>{g.fillStyle='#cfae80';g.fillRect(0,0,w,h);for(let i=0;i<22000;i++){const v=Math.random();g.fillStyle=v<.45?'rgba(120,90,55,.3)':v<.9?'rgba(245,225,190,.3)':'rgba(90,70,50,.4)';g.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*2);}
  for(const v of [.22,.36,.64,.78]){const gr=g.createLinearGradient(0,v*h-24,0,v*h+24);gr.addColorStop(0,'rgba(90,65,40,0)');gr.addColorStop(.5,'rgba(90,65,40,.42)');gr.addColorStop(1,'rgba(90,65,40,0)');g.fillStyle=gr;g.fillRect(0,v*h-24,w,48);}
  for(let i=0;i<60;i++){const x=Math.random()*w,y=Math.random()*h,r=8+Math.random()*30;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(110,80,50,.25)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}});
 rwt.wrapS=rwt.wrapT=THREE.RepeatWrapping;const rwm=decal(M({map:rwt,roughness:1}));groundRect(x0,x1,rz-15,rz+15,rwm,S.y+.04);
 for(let x=x0+20;x<x1-10;x+=30)addStatic(GEO.box,cm(0xe8e2d6,.8),x,y+.06,rz,0,9,.03,.8,{noShadow:true});
 for(let x=x0;x<=x1;x+=38)for(const s of [-1,1])addStatic(GEO.box,cm(0xe0e0d8,.7),x,y+.2,rz+s*16,0,.6,.4,.6);
 // Hangar (Wellblech, halbrund)
 const hx=1185,hz=-2268;const hg=new THREE.CylinderGeometry(11,11,24,24,1,true,-Math.PI/2,Math.PI);hg.rotateX(-Math.PI/2);addStatic(hg,WELL2,hx,y,hz,0,1,1,1);
 addStatic(boxG(22,11,.4,[3,3]),WELL[2],hx,y,hz-12);addSolid(hx-11,hx+11,hz-12.3,hz-11.7,y+11);addSolid(hx-11.3,hx-10.5,hz-12,hz+12,y+9);addSolid(hx+10.5,hx+11.3,hz-12,hz+12,y+9);
 signMesh('FLUGFELD DUSTWATER',12,1.6,hx,y+9.6,hz+12.1,0,'#5a4530','#ffe7a3',.8,52);
 // Kleiner Tower & Tank & Windsack
 addStatic(boxG(4,6,4,[3,3]),PLANK[2],1130,y,-2262);addStatic(boxG(5,2.4,5),winGlass,1130,y+6,-2262,0,1,1,1,{noShadow:true});addStatic(boxG(5.6,.4,5.6),cm(0x3a3a3a,.6),1130,y+8.4,-2262);addSolid(1127.5,1132.5,-2264.5,-2259.5,y+8.8);
 addStatic(GEO.cyl,cm(0xd8d8d0,.5,.4),1215,y+2,-2290,0,2,4,2,{rz:Math.PI/2});addSolid(1213,1217,-2292,-2288,y+3);
 {const px=1100,pz=-2300;addStatic(GEO.cyl,cm(0xdddddd,.5,.5),px,y+3.5,pz,0,.07,7,.07);const sock=new THREE.Group();sock.position.set(px,y+6.8,pz);const sm=new THREE.Mesh(new THREE.ConeGeometry(.45,2.6,10,4,true),M({color:0xff7a1a,roughness:.7,side:THREE.DoubleSide}));sm.rotation.z=Math.PI/2;sm.position.x=1.4;sock.add(sm);scene.add(sock);AREA.socks.push(sock);}
 ZONES.push({name:'Flugfeld Dustwater',x0:S.x0,x1:S.x1,z0:S.z0,z1:S.z1,nofill:true});}
// ---------- Trailerpark Rostbach & Camp Ostklippe ----------
function buildTrailerparks(){const S=SITES.trailer;let k=0;for(let x=S.x0+12;x<S.x1-8;x+=24)for(let z=S.z0+14;z<S.z1-8;z+=30){trailerHome(x+RN(-2,2),z+RN(-2,2),RN(-.2,.2)+(k%2?Math.PI:0),k++);if(RQ()<.5)wreck(x+RN(5,9),z+RN(-6,6),RQ()*3,RQ()<.3);if(RQ()<.4)couch(x-4,z+7,RQ()*6);if(RQ()<.5)trashPile(x+RN(-8,8),z+RN(8,12));}
 for(let i=0;i<5;i++)barrelFire(RN(S.x0+10,S.x1-10),RN(S.z0+10,S.z1-10));fenceRect(S.x0,S.z0,S.x1,S.z1,2,{side:'n',at:245,w:10});
 signMesh('TRAILERPARK ROSTBACH',9,1.3,245,S.y+2.8,S.z0-.4,Math.PI,'#3a2a1c','#ffd9a0',.6,46);
 ZONES.push({name:'Trailerpark Rostbach',x0:S.x0,x1:S.x1,z0:S.z0,z1:S.z1,poor:true,col:'#8a7458'});
 const C=SITES.camp;for(let i=0;i<9;i++)(RQ()<.5?shack:((x,z,ry)=>trailerHome(x,z,ry,i)))(RN(C.x0+10,C.x1-10),RN(C.z0+10,C.z1-10),RQ()*6);
 for(let i=0;i<3;i++)barrelFire(RN(C.x0+15,C.x1-15),RN(C.z0+15,C.z1-15));
 ZONES.push({name:'Camp Ostklippe',x0:C.x0,x1:C.x1,z0:C.z0,z1:C.z1,poor:true,nofill:true});}
// ---------- Kaktus-Tankstelle an der Nordautobahn ----------
function buildDesertGas(){const S=SITES.diner,cx=(S.x0+S.x1)/2,cz=(S.z0+S.z1)/2,y=S.y;
 addStatic(boxG(22,.7,13),cm(0xf2f2f2,.5),cx,y+5.6,cz);addStatic(boxG(22.3,.35,13.3),cm(0x2f8f6a,.6),cx,y+6.4,cz);
 for(const [px,pz] of [[-9,-5],[9,-5],[-9,5],[9,5]]){addStatic(GEO.box,cm(0xdddddd,.5),cx+px,y+3,cz+pz,0,.5,5.4,.5);addSolid(cx+px-.3,cx+px+.3,cz+pz-.3,cz+pz+.3,y+6);}
 const pumpMat=cm(0x2f8f6a,.5),screenMat=cm(0x111111,.3);
 for(const [px,pz] of [[-4,0],[4,0]]){const g=new THREE.Group();g.add(mesh(new THREE.BoxGeometry(.9,1.7,.6),pumpMat,0,1.15,0),mesh(new THREE.BoxGeometry(.7,.35,.62),screenMat,0,1.6,0,false));g.position.set(cx+px,y,cz+pz);scene.add(g);addSolid(cx+px-.5,cx+px+.5,cz+pz-.35,cz+pz+.35,y+2);gasPumps.push({x:cx+px,z:cz+pz,hp:60,dead:false,g});}
 let st;onBase(cx+22,cz,13,11,()=>{st=storeShell(cx+22,cz,12,10,4.4,-1,MATS.plaster[6],'KAKTUS-TANKE','#2f8f6a','#ffffff');});regStore(st,{name:'Kaktus-Tankstelle',type:'gas'},'gas');addPlace('store','Kaktus-Tankstelle',st.door.x,st.door.z,{label:'$',col:'#56d364',r:0});
 addStatic(GEO.box,cm(0x222222,.5),cx-14,y+4.3,cz-6,0,.5,8.6,.5);signMesh('KAKTUS',5,2.2,cx-14,y+9.4,cz-5.7,0,'#2f8f6a','#ffffff',1,70);
 ZONES.push({name:'Kaktus-Tankstelle',x0:S.x0,x1:S.x1,z0:S.z0,z1:S.z1,nofill:true});}
// ---------- Salzsee, Ölfeld, Windpark ----------
function buildDesertSites(){const S=SITES.salt;const st=saltTex.clone();st.needsUpdate=true;st.repeat.set((S.x1-S.x0)/40,(S.z1-S.z0)/40);groundRect(S.x0+10,S.x1-10,S.z0+10,S.z1-10,decal(M({map:st,color:0xb9b5aa,roughness:.75})),S.y+.03);
 ZONES.push({name:'Salzsee',x0:S.x0,x1:S.x1,z0:S.z0,z1:S.z1,col:'#e6e2d8'});
 // Ölpumpen (animiert)
 const O=SITES.oil;for(let i=0;i<9;i++){const x=RN(O.x0+20,O.x1-20),z=RN(O.z0+20,O.z1-20);if(!freeSpotTown(x,z))continue;const y=groundY(x,z);
  addStatic(boxG(7,.6,2.4),cm(0x3a3d40,.7,.4),x,y,z);for(const s of [-1,1])addStatic(GEO.box,cm(0x2f3438,.6,.5),x,y+2.4,z+s*.7,0,.3,4.6,.3,{rx:s*-.2});
  const beam=new THREE.Group();beam.position.set(x,y+4.6,z);const bm=mesh(new THREE.BoxGeometry(7,.5,.4),cm(0x2e5f8a,.6,.5),0,0,0);const head=mesh(new THREE.CylinderGeometry(1.2,1.2,.5,12,1,false,0,Math.PI),cm(0x2e5f8a,.6,.5),3.6,-.4,0);head.rotation.x=Math.PI/2;head.rotation.z=Math.PI/2;beam.add(bm,head);scene.add(beam);
  const rod=mesh(new THREE.CylinderGeometry(.05,.05,3.4,5),cm(0x888888,.4,.8),x+4.3,y+2,z);scene.add(rod);AREA.pumps.push({beam,rod,ph:RQ()*6,y});addSolid(x-3.5,x+3.5,z-1.3,z+1.3,y+5);}
 for(let i=0;i<4;i++){const x=RN(O.x0+20,O.x1-20),z=RN(O.z0+20,O.z1-20),y=groundY(x,z);addStatic(GEO.cyl,cm(0xd0c8b8,.5,.4),x,y+4,z,0,5,8,5);addSolid(x-5,x+5,z-5,z+5,y+8);}
 ZONES.push({name:'Ölfeld Calvera',x0:O.x0,x1:O.x1,z0:O.z0,z1:O.z1,nofill:true});
 const W=SITES.wind;for(let i=0;i<7;i++){const x=W.x0+20+(i%4)*70+RN(-8,8),z=W.z0+40+Math.floor(i/4)*150+RN(-10,10),y=groundY(x,z);
  addStatic(GEO.cyl,cm(0xf2f2f0,.4,.2),x,y+24,z,0,1.2,48,1.6);const rotor=new THREE.Group();rotor.position.set(x,y+48.5,z+1.6);const nac=mesh(new THREE.BoxGeometry(2,2,5),cm(0xf2f2f0,.4,.2),x,y+48.5,z);scene.add(nac);
  for(let b=0;b<3;b++){const bl=mesh(new THREE.BoxGeometry(1.1,19,.25),cm(0xf7f7f5,.35,.2),0,9.5,0);const piv=new THREE.Group();piv.rotation.z=b*Math.PI*2/3;piv.add(bl);rotor.add(piv);}scene.add(rotor);AREA.rotors.push({g:rotor,sp:RN(.6,1)});addSolid(x-1.6,x+1.6,z-1.6,z+1.6,y+50);}
 ZONES.push({name:'Windpark Calvera',x0:W.x0,x1:W.x1,z0:W.z0,z1:W.z1,nofill:true});}
// ---------- Natur verteilen: Wälder, Kakteen, Felsen, Büsche ----------
function scatterNature(){let n=0;
 for(let z=-860;z>-3350;z-=22)for(let x=-1180;x<1300;x+=22){const px=x+RN(-9,9),pz=z+RN(-9,9);if(!freeSpot(px,pz,5))continue;const h=terrainH(px,pz),nv=terrainN(px,pz);if(nv.y<.72)continue;
  const des=sstep(-1780,-2060,pz),f=fbm(px/300+40,pz/300+40,3),r=RQ();
  if(des<.5){// Hügel & Berge: Wälder in Gruppen
   const forest=sstep(.45,.62,f);const p=(h>150?.12:.05+forest*.36)*DENS;if(r<p){tree(px,pz,RN(.85,1.35),h>90||pz<-1250?(RQ()<.8?'pine':'round'):(RQ()<.3?'pine':RQ()<.2?'birch':'round'));n++;}
   else if(r<p+.05)tree(px,pz,RN(.8,1.2),'bush');else if(r<p+.08&&nv.y<.9)rock(px,pz,RN(1,2.6));}
  else{// Wüste
   const q=r/DENS;if(q<.07)cactus(px,pz,RN(.8,1.25));else if(q<.15)tree(px,pz,RN(.7,1.2),'dry');else if(q<.195)rock(px,pz,RN(.8,2.8));else if(q<.205)deadTree(px,pz);}}
 // Küsten: Palmen & Büsche am Westufer
 for(let z=480;z>-700;z-=30){const x=-1130+RN(-30,30),zz=z+RN(-10,10);if(freeSpot(x,zz,4)&&terrainH(x,zz)>SEA_Y+1)tree(x,zz,RN(.9,1.2),RQ()<.5?'palm':'bush');}
 return n;}
function deadTree(x,z){const y=groundY(x,z);addStatic(trunkGeo(3.2,.22,.1,RN(-.4,.4),RN(-.4,.4),6),BARK.oak,x,y-.1,z);for(let k=0;k<3;k++)branchAt(x,y+RN(1.6,2.8),z,RN(1,1.8),.07,RQ()*6.28,RN(.6,1.1),BARK.oak);addSolid(x-.3,x+.3,z-.3,z+.3,3);}
// Leitplanken an Bergstrecken & Wegweiser
function roadFurniture(){const railM=cm(0xb8bec4,.35,.8),postM=cm(0x6a6f74,.5,.6);
 for(const r of ROADS){if(r.type==='dirt')continue;const P=r.pts;for(let i=2;i<P.length-2;i+=2){const p=P[i];const drop=p.y-terrainH(p.x+0,p.z);
   for(const s of [-1,1]){const a=P[i-1],b=P[i+1];const tx=b.x-a.x,tz=b.z-a.z,l=Math.hypot(tx,tz)||1;const nx=-tz/l*s,nz=tx/l*s;const ex=p.x+nx*(r.hw+1.4),ez=p.z+nz*(r.hw+1.4);
    const below=p.y-terrainH(p.x+nx*(r.hw+8),p.z+nz*(r.hw+8));if(below<3.2)continue;addStatic(GEO.box,postM,ex,p.y+.4,ez,0,.12,.9,.12);addStatic(GEO.box,railM,ex,p.y+.75,ez,Math.atan2(tx,tz),.08,.3,8.4);}}
  // Schild am Anfang
  const p0=P[3],p1=P[5];const tx=p1.x-p0.x,tz=p1.z-p0.z,l=Math.hypot(tx,tz)||1;const sx=p0.x+(-tz/l)*(r.hw+3),sz=p0.z+(tx/l)*(r.hw+3);if(r.type!=='dirt'){addStatic(GEO.cyl,cm(0x9aa0a4,.4,.7),sx,groundY(sx,sz)+1.6,sz,0,.06,3.2,.06);signMesh(r.name.toUpperCase(),5,.8,sx,groundY(sx,sz)+3.2,sz,Math.atan2(tx,tz)+Math.PI,'#1f6b3a','#ffffff',.3,44);}}}
function areaTick(dt){const cx=camera.position.x,cz=camera.position.z;
 for(const f of AREA.fires){if(Math.abs(f.x-cx)>180||Math.abs(f.z-cz)>180)continue;const t=time*9+f.ph;f.m.scale.set(1+Math.sin(t)*.2,1+Math.sin(t*1.7)*.35,1+Math.cos(t*1.3)*.2);f.m.rotation.y+=dt*3;if(Math.random()<dt*2.2)smoke(new THREE.Vector3(f.x,f.y+.8,f.z),.6,.25,2.2);}
 for(const s of AREA.socks){s.rotation.y=-.6+Math.sin(time*.7)*.35;s.rotation.z=Math.sin(time*5.1)*.06;}
 for(const r of AREA.rotors)r.g.rotation.z-=dt*r.sp*1.4;
 for(const p of AREA.pumps){const a=Math.sin(time*1.1+p.ph)*.32;p.beam.rotation.z=a;p.rod.position.y=p.y+2+a*3.2;}
 // Steppenläufer rollen durch die Wüste
 if(cz<-1900){if(!tumble){tumble=[];const m=new THREE.MeshStandardMaterial({map:LEAF.dry.map,alphaTest:.4,color:0xc9a77a,side:THREE.DoubleSide,roughness:1});for(let k=0;k<7;k++){const g=new THREE.Mesh(new THREE.IcosahedronGeometry(.55,1),m);g.castShadow=true;scene.add(g);tumble.push({g,x:cx+RN(-80,80),z:cz+RN(-80,80),v:RN(2.5,5),ph:RQ()*6});}}
  for(const t of tumble){t.x+=t.v*dt;t.z+=Math.sin(time*.4+t.ph)*dt*1.2;if(Math.hypot(t.x-cx,t.z-cz)>110){t.x=cx-RN(60,100);t.z=cz+RN(-90,90);}const y=groundY(t.x,t.z);t.g.visible=true;t.g.position.set(t.x,y+.55+Math.abs(Math.sin(time*3+t.ph))*.5,t.z);t.g.rotation.z-=t.v*dt/.55;}}
 else if(tumble)for(const t of tumble)t.g.visible=false;}
function newStunts(){// fünf neue Stuntsprünge im Umland
 for(const [x,z,ry,len,h] of [[560,-2520,-Math.PI/2,12,4.2],[-610,-2310,Math.PI/2,12,4],[940,-2460,0,11,3.8],[-140,-985,Math.PI*.98,10,3.4],[1110,-1180,Math.PI,12,4]])ramp(x,z,ry,len,7,h,true);
 // Spedition in Dustwater
 const S=SITES.dust,x=S.x0+46,z=S.z0+36;SOLIDS_TOWN.push([x,z],[x+12,z],[x-12,z]);onBase(x,z,26,16,()=>{addStatic(boxG(24,7,14,[3,3]),WELL[1],x,.3,z);addStatic(boxG(24.6,.4,14.6),cm(0x3a3a3a,.7),x,7.3,z);addSolid(x-12,x+12,z-7,z+7,.3+7.6);});
 signMesh('SPEDITION CALVERA',10,1.4,x,groundY(x,z)+5.4,z+7.05,0,'#2a4a6a','#ffd23a',.6,46);
 addPlace('truck','Spedition Calvera',x,z+11,{label:'T',col:'#ffb347'});
 addPlace('skate','Skatepark West',-586,348,{label:'S',col:'#ff5ad6'});
 // Bunker-Eingang (Business: Waffen) & Gebrauchtwagen-Platz
 {const x=-560,z=-2985;onBase(x,z,14,10,()=>{addStatic(boxG(12,4,8,[3,3],[3,3]),darkConcrete,x,.3,z);addStatic(boxG(4,3,.3),cm(0x3a4228,.6,.6),x,.3,z+4.05);for(const sx of [-4,4])addStatic(GEO.cyl,cm(0x6a6e72,.5,.6),x+sx,4.6,z-2,0,.4,1.2,.4);addSolid(x-6,x+6,z-4,z+4,.3+4);});
  signMesh('BUNKER CALVERA',6,.9,x,groundY(x,z)+3.6,z+4.25,0,'#3a4228','#ffd23a',.4,44);}
 {const x=700,z=-2352;SOLIDS_TOWN.push([x,z],[x+15,z],[x-15,z]);groundRect(x-18,x+18,z-10,z+10,decal(M({map:concreteTex,color:0xb5ad9e,roughness:.95})),groundY(x,z)+.03);signMesh('GEBRAUCHTWAGEN',8,1.2,x,groundY(x,z)+4.2,z+10.5,0,'#c0392b','#ffffff',.6,52);addStatic(GEO.cyl,cm(0x9aa0a4,.4,.7),x-3.6,groundY(x,z)+2,z+10.4,0,.08,4,.08);addStatic(GEO.cyl,cm(0x9aa0a4,.4,.7),x+3.6,groundY(x,z)+2,z+10.4,0,.08,4,.08);}}
function buildNewAreas(){newStunts();buildSkatepark();buildRostviertel();buildVistaMar();buildHills();buildDustwater();buildAirfield();buildTrailerparks();buildDesertGas();buildDesertSites();roadFurniture();scatterNature();
 // große Regionen (nur für Ortsnamen)
 ZONES.push({name:'Solara Hills',x0:-1100,x1:1300,z0:-1300,z1:-805,region:true},{name:'Mount Solara',x0:-1300,x1:1300,z0:-1850,z1:-1300,region:true},{name:'Calvera-Wüste',x0:-1400,x1:1500,z0:-3700,z1:-1850,region:true},{name:'Westküste',x0:-1500,x1:-805,z0:-805,z1:700,region:true},{name:'Ostküste',x0:965,x1:1600,z0:-805,z1:700,region:true});}
function GB(){return {p:[],r:[],si:[],sw:[],idx:[],n:0};}
function gbVert(B,x,y,z,reg,w){B.p.push(x,y,z);B.r.push(reg);const s=[0,0,0,0],ww=[0,0,0,0];for(let k=0;k<Math.min(4,w.length);k++){s[k]=w[k][0];ww[k]=w[k][1];}const t=ww[0]+ww[1]+ww[2]+ww[3]||1;B.si.push(s[0],s[1],s[2],s[3]);B.sw.push(ww[0]/t,ww[1]/t,ww[2]/t,ww[3]/t);return B.n++;}
// Röhre aus Ringen: rings=[{y,x?,z?,rx,rzF,rzB}]
function gbRings(B,rings,seg,regFn,wFn,capBot,capTop){const base=B.n;
 for(const R of rings){for(let s=0;s<seg;s++){const a=s/seg*Math.PI*2,sa=Math.sin(a),ca=Math.cos(a);const rz=ca>0?R.rzF:R.rzB;const x=(R.x||0)+sa*R.rx,z=(R.z||0)+ca*rz;gbVert(B,x,R.y,z,regFn(R.y,x,z),wFn(R.y,x,z));}}
 for(let i=0;i<rings.length-1;i++)for(let s=0;s<seg;s++){const a=base+i*seg+s,b=base+i*seg+(s+1)%seg,c=a+seg,d=b+seg;const up=rings[i+1].y>rings[i].y;if(up)B.idx.push(a,b,c,b,d,c);else B.idx.push(a,c,b,b,c,d);}
 const dirUp=rings[rings.length-1].y>rings[0].y;
 const cap=(ri,top)=>{const R=rings[ri];const sgn=(top===dirUp)?1:-1;const cy=R.y+sgn*(R.capH||0);const ctr=gbVert(B,R.x||0,cy,R.z||0,regFn(R.y,R.x||0,R.z||0),wFn(R.y,R.x||0,R.z||0));
  for(let s=0;s<seg;s++){const a=base+ri*seg+s,b=base+ri*seg+(s+1)%seg;if(sgn>0)B.idx.push(a,b,ctr);else B.idx.push(b,a,ctr);}};
 if(capBot)cap(0,false);if(capTop)cap(rings.length-1,true);}
// Ellipsoid (optional verformt)
function gbEllip(B,cx,cy,cz,rx,ry,rz,reg,w,seg=10,rows=7,deform){const base=B.n;
 for(let j=0;j<=rows;j++){const v=j/rows*Math.PI,sy=Math.cos(v),sr=Math.sin(v);for(let s=0;s<seg;s++){const a=s/seg*Math.PI*2;let x=Math.sin(a)*sr,y=sy,z=Math.cos(a)*sr;if(deform){const o=deform(x,y,z);x=o[0];y=o[1];z=o[2];}
  const px=cx+x*rx,py=cy+y*ry,pz=cz+z*rz;gbVert(B,px,py,pz,typeof reg==='function'?reg(x,y,z):reg,typeof w==='function'?w(px,py,pz):w);}}
 for(let j=0;j<rows;j++)for(let s=0;s<seg;s++){const a=base+j*seg+s,b=base+j*seg+(s+1)%seg,c=a+seg,d=b+seg;B.idx.push(a,c,b,b,c,d);}}
// Gliedmaße: Ringe von y0 nach y1, Radius r0->r1, abgerundete Enden
function gbLimb(B,x,z,y0,y1,r0,r1,seg,regFn,wFn,flatZ=1){const rings=[];const n=7;const dn=y1<y0?-1:1;
 rings.push({y:y0-dn*r0*.45,x,z,rx:r0*.55,rzF:r0*.55*flatZ,rzB:r0*.55*flatZ,capH:r0*.25});
 for(let k=0;k<=n;k++){const t=k/n,y=y0+(y1-y0)*t,r=r0+(r1-r0)*t;const bul=1+.1*Math.sin(t*Math.PI);rings.push({y,x,z,rx:r*bul,rzF:r*bul*flatZ,rzB:r*bul*flatZ});}
 rings.push({y:y1+dn*r1*.45,x,z,rx:r1*.55,rzF:r1*.55*flatZ,rzB:r1*.55*flatZ,capH:r1*.25});
 gbRings(B,rings,seg,regFn,wFn,true,true);}
