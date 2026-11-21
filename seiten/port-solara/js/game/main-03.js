'use strict';
const rampGeo=(()=>{const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(1,0);s.lineTo(1,1);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false});g.rotateY(-Math.PI/2);g.translate(.5,0,0);return g;})();
const rampTex=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#d9a300';g.fillRect(0,0,w,h);g.fillStyle='#1a1a1a';for(let i=-4;i<8;i++){g.beginPath();g.moveTo(i*32,0);g.lineTo(i*32+16,0);g.lineTo(i*32+16-h,h);g.lineTo(i*32-h,h);g.fill();}});
const rampMat=M({map:rampTex,roughness:.6});

// ---------- Ampeln ----------
const TL={bulbs:null,info:[],t:0};const tlRed=new THREE.Color(3,.15,.1),tlYel=new THREE.Color(3,1.8,.1),tlGrn=new THREE.Color(.2,3,.5);

const blockInfo=[];
for(let i=0;i<N;i++)for(let j=0;j<N;j++){
 const x0=nodeX(i)+ROAD/2,x1=nodeX(i+1)-ROAD/2,z0=nodeX(j)+ROAD/2,z1=nodeX(j+1)-ROAD/2,cx=(x0+x1)/2,cz=(z0+z1)/2;
 const type=district(i,j,cx,cz);blockInfo.push({i,j,x0,x1,z0,z1,type});
 addStatic(boxG(BLK,.3,BLK,null,[4,4]),sidewalkMat,cx,0,cz,0,1,1,1,{noShadow:true});
 const inner=BLK-7;
 if(SPECIAL[i+','+j]){buildSpecial(SPECIAL[i+','+j],{i,j,x0,x1,z0,z1,cx,cz,inner,type});continue;}
 if(type==='park'){
  addStatic(boxG(inner,.05,inner,null,[8,8]),grassMat,cx,.3,cz,0,1,1,1,{noShadow:true});
  if(i+','+j===LAKE){const lake=new THREE.Mesh(new THREE.CircleGeometry(18,40),waterMat);lake.rotation.x=-Math.PI/2;lake.position.set(cx,.37,cz);scene.add(lake);addStatic(GEO.cyl,cm(0x8d8578,.9),cx,.3,cz,0,18.8,.12,18.8,{noShadow:true});addSolid(cx-15,cx+15,cz-15,cz+15,-10);
   for(let k=0;k<16;k++){const a=k/16*Math.PI*2;tree(cx+Math.cos(a)*23,cz+Math.sin(a)*23,R(.8,1.2),k%5===2?'birch':'round');if(k%2)tree(cx+Math.cos(a+.2)*20.5,cz+Math.sin(a+.2)*20.5,R(.7,1),'bush');}for(let k=0;k<24;k++){const a=k/24*Math.PI*2;grassPatch(cx+Math.cos(a)*19.6,cz+Math.sin(a)*19.6,1.2,6);}}
  else{addStatic(boxG(inner,.06,3,null,[4,4]),sidewalkMat,cx,.3,cz,0,1,1,1,{noShadow:true});addStatic(boxG(3,.06,inner,null,[4,4]),sidewalkMat,cx,.3,cz,0,1,1,1,{noShadow:true});
   FOUNTAINS.push({x:cx,z:cz,r:4.5});addStatic(GEO.cyl,cm(0xbab3a5,.7),cx,.3,cz,0,4.5,.8,4.5);const fw=new THREE.Mesh(new THREE.CircleGeometry(4,24),waterMat);fw.rotation.x=-Math.PI/2;fw.position.set(cx,.66,cz);scene.add(fw);addStatic(GEO.cyl,cm(0xbab3a5,.7),cx,1.1,cz,0,.5,2.5,.5);addSolid(cx-4.5,cx+4.5,cz-4.5,cz+4.5,1.1);
   for(let k=0;k<14;k++){let tx=R(x0+6,x1-6),tz=R(z0+6,z1-6);if(Math.abs(tx-cx)<4||Math.abs(tz-cz)<4)continue;tree(tx,tz,R(.8,1.3));}
   for(let k=0;k<12;k++){const gx=R(x0+6,x1-6),gz=R(z0+6,z1-6);if(Math.abs(gx-cx)<3||Math.abs(gz-cz)<3)continue;grassPatch(gx,gz,3.5,14);if(k<6)tree(gx+R(-2,2),gz+R(-2,2),R(.8,1.2),'bush');}
   for(const [bx,bz,r] of [[cx+8,cz+3.5,0],[cx-8,cz-3.5,Math.PI],[cx+3.5,cz-8,Math.PI/2]])addStatic(GEO.box,cm(0x6b4a30,.8),bx,.75,bz,r,2.4,.15,.7);}
  continue;}
 if(type==='garage'){
  addStatic(boxG(inner,.05,inner,null,[4,4]),yardMat,cx,.3,cz,0,1,1,1,{noShadow:true});
  buildWerkstatt(cx,cz);
  const st=sign('MILAS WERKSTATT','#151515','#ffb347'),se=sign('MILAS WERKSTATT','#000','#ffb347');
  const s=new THREE.Mesh(new THREE.PlaneGeometry(20,3.6),new THREE.MeshStandardMaterial({map:st,emissive:0xffffff,emissiveMap:se,emissiveIntensity:1.3}));s.position.set(cx,7,cz+8.06);scene.add(s);
  for(let k=0;k<4;k++)addStatic(GEO.cyl,cm(0x1a1a1a,.9),cx-18+k*1.1,.7,cz+14,0,.45,.8,.45);
  continue;}
 if(type==='hospital'){
  addStatic(boxG(inner,.05,inner,null,[8,8]),grassMat,cx,.3,cz,0,1,1,1,{noShadow:true});
  addStatic(boxG(40,4.2,30,[16,4.2]),MATS.office[0],cx,.3,cz-5);addStatic(boxG(40,18,30,[24,32]),MATS.office[0],cx,4.5,cz-5);addStatic(boxG(40.5,.7,30.5),roofMat,cx,22.5,cz-5);addSolid(cx-20.3,cx+20.3,cz-20.3,cz+10.3,23);
  const st=sign('KRANKENHAUS','#ffffff','#d01818');const sm=new THREE.Mesh(new THREE.PlaneGeometry(18,3),new THREE.MeshStandardMaterial({map:st,emissive:0xffffff,emissiveMap:st,emissiveIntensity:.5}));sm.position.set(cx,19,cz+10.06);scene.add(sm);
  const cr=canvasTex(128,128,(g)=>{g.fillStyle='#fff';g.fillRect(0,0,128,128);g.fillStyle='#d01818';g.fillRect(44,14,40,100);g.fillRect(14,44,100,40);});const cp=new THREE.Mesh(new THREE.PlaneGeometry(5,5),new THREE.MeshStandardMaterial({map:cr,emissive:0xffffff,emissiveMap:cr,emissiveIntensity:.6}));cp.position.set(cx,12,cz+10.07);scene.add(cp);
  continue;}
 if(type==='police'){
  addStatic(boxG(inner,.05,inner,null,[4,4]),darkConcrete,cx,.3,cz,0,1,1,1,{noShadow:true});
  addStatic(boxG(36,4.2,36,[16,4.2]),MATS.office[1],cx,.3,cz);addStatic(boxG(36,12,36,[24,32]),MATS.office[1],cx,4.5,cz);addStatic(boxG(36.5,.7,36.5),roofMat,cx,16.5,cz);addSolid(cx-18.3,cx+18.3,cz-18.3,cz+18.3,17);
  const st=sign('POLIZEI','#0d1b3d','#ffffff');const s=new THREE.Mesh(new THREE.PlaneGeometry(16,3),new THREE.MeshStandardMaterial({map:st,emissive:0xffffff,emissiveMap:st,emissiveIntensity:.9}));s.position.set(cx,12,cz+18.06);scene.add(s);
  continue;}
 if(type==='industrial'){
  addStatic(boxG(inner,.05,inner,null,[6,6]),darkConcrete,cx,.3,cz,0,1,1,1,{noShadow:true});
  const w=R(24,40),d=R(18,30),h=R(8,15);building(cx+R(-4,4),cz-BLK/2+3.5+d/2+R(0,3),w,d,h,'warehouse');
  const n=4+(rand()*5|0);for(let k=0;k<n;k++){const ry=rand()<.5?0:Math.PI/2;const px=R(x0+7,x1-7),pz=R(cz+6,z1-7);containerStack(px,pz,ry);}
  if(rand()<.35){for(let k=0;k<2;k++){const tx=x0+10+k*12,tz=cz+12;addStatic(GEO.cyl,cm(0xe8e8e8,.4,.3),tx,.3+6,tz,0,4.2,12,4.2);addStatic(GEO.cyl,cm(0xcccccc,.4,.3),tx,12.5,tz,0,4.4,.6,4.4);addSolid(tx-4.3,tx+4.3,tz-4.3,tz+4.3,12.5);}}
  if(j>=N-2&&rand()<.7)crane(cx+R(-10,10),cz+8);
  continue;}
 if(type==='residential'){
  addStatic(boxG(inner,.05,inner,null,[8,8]),grassMat,cx,.3,cz,0,1,1,1,{noShadow:true});
  for(const [lx,lz,ry] of [[x0+14,z0+14,Math.PI],[x1-14,z0+14,Math.PI],[x0+14,z1-14,0],[x1-14,z1-14,0]]){
   const w=R(9,12.5),d=R(8,11),h=R(3.6,7);house(lx,lz+(ry?3:-3),w,d,h,ry);
   const fz=ry?-1:1;addStatic(boxG(3,.06,9,null,[4,4]),sidewalkMat,lx-w/2+1.5,.3,lz+fz*(d/2+4.5)+(ry?3:-3),0,1,1,1,{noShadow:true});
   if(rand()<.6)tree(lx+R(-8,8),lz+(ry?-8:8),R(.7,1.1));
   if(rand()<.25){const pl=new THREE.Mesh(new THREE.BoxGeometry(5,.08,3.2),poolMat);pl.position.set(lx+5,.36,lz+(ry?-9:9));scene.add(pl);addStatic(GEO.box,cm(0xeeeeee,.6),lx+5,.33,lz+(ry?-9:9),0,5.6,.06,3.8,{noShadow:true});}
   hedge(lx-12,lz-fz*12.5,lx+12,lz-fz*12.5,1.15,false);if(vrand()<.7)grassPatch(lx+R(-6,6),lz+(ry?-7:7),3,10);
  }
  continue;}
 if(type==='beach'){
  addStatic(boxG(inner,.05,inner,null,[8,8]),grassMat,cx,.3,cz,0,1,1,1,{noShadow:true});
  const w=R(22,34),d=R(14,20),h=R(16,48);building(cx+R(-6,6),cz-6,w,d,h,'plaster');
  const pl=new THREE.Mesh(new THREE.BoxGeometry(14,.08,6),poolMat);pl.position.set(cx,.37,z1-8);scene.add(pl);addStatic(GEO.box,cm(0xf2f2f2,.6),cx,.33,z1-8,0,15,.06,7,{noShadow:true});
  for(let k=0;k<3;k++)tree(R(x0+5,x1-5),z1-R(2.5,4),R(.9,1.1),'palm');
  continue;}
 // downtown / mixed
 const down=type==='downtown';const dd=Math.hypot(cx,cz+30),k=down?Math.max(0,1-dd/215):0;
 if(down&&rand()<.35){const w=R(30,42),d=R(30,42);building(cx,cz,w,d,Math.round(70+k*k*130+R(0,30)),rand()<.65?'glass':'office');
  for(const [px,pz] of [[x0+4,z0+4],[x1-4,z0+4],[x0+4,z1-4],[x1-4,z1-4]])tree(px,pz,.8,'round');continue;}
 for(const [lx,lz] of [[x0+14,z0+14],[x1-14,z0+14],[x0+14,z1-14],[x1-14,z1-14]]){
  if(!down&&rand()<.1){tree(lx,lz,1.1);continue;}
  const w=R(15,21),d=R(15,21);
  const h=down?Math.round(R(30,60)+k*k*R(40,130)):Math.round(R(9,30));
  const kind=down?(rand()<.55?'glass':'office'):pickR(['brick','brick','plaster','plaster','office']);
  building(lx+R(-1,1),lz+R(-1,1),w,d,h,kind);
 }
}
// Pier & Boote & Strandpromenade
const wood=cm(0x8a6a45,.85);
addStatic(boxG(10,.5,80,[2,2]),wood,PIERX,0,WATER_Z+28);
for(let k=0;k<8;k++)for(const s of [-1,1])addStatic(GEO.cyl,cm(0x5a4530,1),PIERX+s*4.6,-1,WATER_Z-8+k*10,0,.3,3,.3);
for(let x=-HALF;x<HALF;x+=R(16,26)){if(Math.abs(x-PIERX)<10)continue;tree(x,COAST+R(4,14),R(.9,1.2),'palm');}
for(let x=-HALF+30;x<HALF;x+=R(40,80)){if(Math.abs(x-PIERX)<12)continue;const c=pick([0xe74c3c,0x3498db,0xf1c40f,0x2ecc71,0xffffff]);addStatic(GEO.cyl,cm(0xdddddd,.5),x,1.3,COAST+20,0,.05,2.6,.05);addStatic(GEO.cone,cm(c,.8),x,2.6,COAST+20,0,1.6,.6,1.6);}
const boats=[];
// Liegeplatz-Boote: echte Modelle (Segelboote/Yachten) – werden beim Start in 16f (initMarina) erzeugt
for(const [bx,bz,c] of []){
 const b=new THREE.Group();b.add(mesh(new THREE.BoxGeometry(4,1.4,11),cm(c,.35,.2),0,.5,0),mesh(new THREE.BoxGeometry(3.2,1.4,4),cm(0xeeeeee,.4),0,1.7,-1),mesh(new THREE.BoxGeometry(2.8,.5,3),cm(0x1d2a33,.1,.8),0,2.1,-.2));b.position.set(bx,0,bz);scene.add(b);boats.push(b);}
// Laternen (instanziert)
const LAMP_G={base:.3,pts:[],parts:[]};
const bulbMat=new THREE.MeshStandardMaterial({color:0x222222,emissive:0xffe2a8,emissiveIntensity:0});
{const lp=[];for(const b of blockInfo){lp.push([b.x0+1,b.z0+1],[b.x1-1,b.z0+1],[b.x0+1,b.z1-1],[b.x1-1,b.z1-1]);}
 const poles=new THREE.InstancedMesh(new THREE.CylinderGeometry(.1,.15,7,6),cm(0x2b2f33,.45,.7),lp.length);
 const heads=new THREE.InstancedMesh(new THREE.BoxGeometry(.5,.25,.9),cm(0x2b2f33,.45,.7),lp.length);
 const bulbs=new THREE.InstancedMesh(new THREE.BoxGeometry(.38,.08,.7),bulbMat,lp.length);
 const o=new THREE.Object3D();lp.forEach((p,i)=>{o.position.set(p[0],3.8,p[1]);o.updateMatrix();poles.setMatrixAt(i,o.matrix);o.position.y=7.35;o.updateMatrix();heads.setMatrixAt(i,o.matrix);o.position.y=7.2;o.updateMatrix();bulbs.setMatrixAt(i,o.matrix);const s=addSolid(p[0]-.2,p[0]+.2,p[1]-.2,p[1]+.2,7.4);s.breakable=true;s.bg=LAMP_G;s.bi=i;s.box={x0:s.x0,x1:s.x1,z0:s.z0,z1:s.z1};});
 poles.castShadow=true;scene.add(poles,heads,bulbs);LAMP_G.pts=lp;LAMP_G.parts=[{im:poles,off:3.5,ix:[0]},{im:heads,off:7.05,ix:[0]},{im:bulbs,off:6.9,ix:[0]}];}
// Flugplatz im Osten
const hpadTex=canvasTex(256,256,(g)=>{g.fillStyle='#3a3c40';g.fillRect(0,0,256,256);g.strokeStyle='#f2c230';g.lineWidth=10;g.beginPath();g.arc(128,128,110,0,7);g.stroke();g.fillStyle='#fff';g.font='bold 150px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('H',128,138);});
{const t=concreteTex.clone();t.needsUpdate=true;t.repeat.set(40,90);const a=new THREE.Mesh(new THREE.PlaneGeometry(AIRX1-AIRX0,AIRZ1-AIRZ0),M({map:t,color:0x9a9a96,roughness:.95}));a.rotation.x=-Math.PI/2;a.position.set((AIRX0+AIRX1)/2,.02,0);a.receiveShadow=true;scene.add(a);
 const r=new THREE.Mesh(new THREE.PlaneGeometry(46,720),M({map:asphaltTex,roughness:.85}));r.rotation.x=-Math.PI/2;r.position.set(RWX,.08,0);decal(r.material);r.receiveShadow=true;scene.add(r);
 const rd=new THREE.Mesh(new THREE.PlaneGeometry(AIRX0-COAST+4,14),M({map:asphaltTex,roughness:.88}));rd.rotation.x=-Math.PI/2;rd.position.set((COAST+AIRX0)/2,.06,0);decal(rd.material);rd.receiveShadow=true;scene.add(rd);
 for(let z=-330;z<=330;z+=30)addStatic(GEO.box,decal(cm(0xf2f2f2,.7)),RWX,.12,z,0,1.2,.04,15,{noShadow:true});
 for(const zz of [-345,345])for(let k=-4;k<=4;k++)if(k)addStatic(GEO.box,cm(0xf2f2f2,.7),RWX+k*4.6,.12,zz,0,2.2,.04,14,{noShadow:true});
 for(let k=0;k<4;k++){const hz=-260+k*95;addStatic(boxG(42,14,34,[30,12]),MATS.warehouse[3],AIRX0+36,0,hz);addStatic(GEO.cyl,cm(0x8a9097,.5,.5),AIRX0+36,14,hz,0,21,34,6,{rx:Math.PI/2});addSolid(AIRX0+15,AIRX0+57,hz-17,hz+17,20);}
 addStatic(GEO.cyl,cm(0xd8d4cc,.7),880,15,250,0,4,30,4);addStatic(GEO.cyl,cm(0x1a2a3a,.05,.9),880,32,250,0,6,4,6);addStatic(GEO.cyl,roofMat,880,34.5,250,0,6.5,1,6.5);addSolid(874,886,244,256,35);
 for(const [hx,hz] of [[AIRX0+90,200],[AIRX0+90,250],[AIRX0+90,300]])helipad(hx,hz);
 helipad(PIERX-40,COAST+18);
}
buildWorldExtras();

// ================= NEUE GEBIETE: Hügel, Mount Solara, Calvera-Wüste, Küstenorte, Skatepark, Rostviertel =================
const RQ=mulberry32(4242);const DENS=[.5,.8,1][SET.quality]??.8;const RN=(a,b)=>a+RQ()*(b-a);const PK=a=>a[Math.floor(RQ()*a.length)];
const AREA={fires:[],socks:[],rotors:[],pumps:[],weeds:[],flags:[]};
// ---------- Texturen ----------
const wellTex=canvasTex(256,256,(g,w,h)=>{for(let x=0;x<w;x+=8){const gr=g.createLinearGradient(x,0,x+8,0);gr.addColorStop(0,'#7f858a');gr.addColorStop(.5,'#d0d5d9');gr.addColorStop(1,'#70767b');g.fillStyle=gr;g.fillRect(x,0,8,h);}
 for(let i=0;i<70;i++){const x=Math.random()*w,y=Math.random()*h,r=6+Math.random()*34;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(125,60,18,.6)');gr.addColorStop(1,'rgba(125,60,18,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
 for(let i=0;i<50;i++){g.fillStyle='rgba(95,42,12,.45)';g.fillRect(Math.random()*w,Math.random()*h,2,10+Math.random()*34);}});wellTex.wrapS=wellTex.wrapT=THREE.RepeatWrapping;
const WELL=[0xffffff,0xd4c0a4,0xb9c7cf,0xc9a98f].map(c=>M({map:wellTex,color:c,roughness:.55,metalness:.45}));const WELL2=M({map:wellTex,color:0xe0e4e6,roughness:.5,metalness:.45,side:THREE.DoubleSide});
const plankTex=canvasTex(256,256,(g,w,h)=>{for(let y=0;y<h;y+=16){const v=Math.random()*30;g.fillStyle=`rgb(${150+v|0},${120+v|0},${88+v|0})`;g.fillRect(0,y,w,15);g.fillStyle='rgba(40,25,10,.55)';g.fillRect(0,y+15,w,1.5);
 for(let k=0;k<8;k++){g.strokeStyle=`rgba(70,45,20,${.1+Math.random()*.2})`;g.beginPath();g.moveTo(0,y+Math.random()*15);g.bezierCurveTo(w*.3,y+Math.random()*15,w*.6,y+Math.random()*15,w,y+Math.random()*15);g.stroke();}}
 for(let i=0;i<3000;i++){g.fillStyle=`rgba(${Math.random()<.5?40:230},${Math.random()<.5?30:220},20,.1)`;g.fillRect(Math.random()*w,Math.random()*h,2,1);}});plankTex.wrapS=plankTex.wrapT=THREE.RepeatWrapping;
const PLANK=[0xffffff,0xa9c0cf,0xe0d4b4,0xd49a78,0xb7c99a,0x8f8f8f].map(c=>M({map:plankTex,color:c,roughness:.9}));
const trailerTex=canvasTex(512,128,(g,w,h)=>{g.fillStyle='#ece8dc';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=6){g.fillStyle='rgba(0,0,0,.08)';g.fillRect(0,y,w,1);}
 g.fillStyle='#3a6e9e';g.fillRect(0,h*.62,w,10);g.fillStyle='#c94c3c';g.fillRect(0,h*.62+12,w,4);
 for(const x of [40,150,300,420]){g.fillStyle='#4c5a63';g.fillRect(x,22,52,34);g.fillStyle='rgba(180,210,230,.45)';g.fillRect(x+3,25,46,10);g.strokeStyle='#ddd';g.lineWidth=3;g.strokeRect(x,22,52,34);}
 g.fillStyle='#8c7a66';g.fillRect(230,20,34,96);g.fillStyle='#222';g.fillRect(256,66,4,4);
 for(let i=0;i<30;i++){const x=Math.random()*w,y=Math.random()*h,r=4+Math.random()*16;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(120,80,40,.35)');gr.addColorStop(1,'rgba(120,80,40,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
 for(let i=0;i<12;i++){g.fillStyle='rgba(110,60,20,.35)';g.fillRect(Math.random()*w,h*.66,2,20+Math.random()*30);}});
const TRAILER=[0xffffff,0xf2e6c9,0xd9e4ea,0xe8d0c0].map(c=>M({map:trailerTex,color:c,roughness:.6,metalness:.2}));
const rustMat=M({map:wellTex,color:0x6b3a20,roughness:.95,metalness:.3}),wreckBurnt=cm(0x1d1a18,.95,.2),wreckTire=cm(0x151515,.9);
const chainTex=canvasTex(64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='rgba(200,205,210,1)';g.lineWidth=2;for(let k=-64;k<128;k+=16){g.beginPath();g.moveTo(k,0);g.lineTo(k+64,64);g.moveTo(k+64,0);g.lineTo(k,64);g.stroke();}});chainTex.wrapS=chainTex.wrapT=THREE.RepeatWrapping;
const chainMat=new THREE.MeshStandardMaterial({map:chainTex,alphaTest:.4,side:THREE.DoubleSide,roughness:.4,metalness:.7,color:0xb0b5ba});
const saltTex=canvasTex(512,512,(g,w,h)=>{g.fillStyle='#ecebe6';g.fillRect(0,0,w,h);for(let i=0;i<9000;i++){g.fillStyle=`rgba(${Math.random()<.5?180:255},${Math.random()<.5?175:255},${Math.random()<.5?160:250},.35)`;g.fillRect(Math.random()*w,Math.random()*h,2,2);}
 g.strokeStyle='rgba(150,140,120,.6)';g.lineWidth=2;const pts=[];for(let i=0;i<70;i++)pts.push([Math.random()*w,Math.random()*h]);for(const [x,y] of pts){let best=[],bd=[];for(const q of pts){const d=Math.hypot(q[0]-x,q[1]-y);if(d>1)best.push([d,q]);}best.sort((a,b)=>a[0]-b[0]);for(const [,q] of best.slice(0,3)){g.beginPath();g.moveTo(x,y);g.lineTo((x+q[0])/2+(Math.random()-.5)*8,(y+q[1])/2+(Math.random()-.5)*8);g.stroke();}}});
saltTex.wrapS=saltTex.wrapT=THREE.RepeatWrapping;
const GRAFF=['SKY','SOLARA','VALLE','NEON','FLOW','ROST','KAOS','DUST','2626','HYPE'];
const GRAFFMAT=[1,2,3,4,5,6].map(k=>M({map:graffitiTex(k*13),roughness:.85}));
const plinthMat=M({map:concreteTex,color:0xcfc6b6,roughness:.9});
// ---------- Skatepark West (umzäunt, mitten in der Stadt) ----------
const skateConc=M({map:(()=>{const t=concreteTex.clone();t.needsUpdate=true;t.repeat.set(3,3);return t;})(),color:0xd2cfc8,roughness:.7});
const skateConcDS=M({map:concreteTex,color:0xcfccc4,roughness:.65,side:THREE.DoubleSide});
const SOLIDS_TOWN=[];
// ---------- Animationen ----------
let tumble=null;
buildNewAreas();
// ================= WELT ABSCHLIESSEN (statische Geometrie bündeln, Vegetation instanzieren) =================
{const t=canvasTex(128,128,(g,w,h)=>{const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.45,'rgba(255,255,255,.45)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
 var lampPoolMat=new THREE.MeshBasicMaterial({map:t,color:0xffd49a,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,fog:true});
 const pts=[...LAMP_G.pts.map(p=>[p[0],p[1],7]),...RLAMP_G.pts.map(p=>[p[0],p[1],9])];const geo=new THREE.PlaneGeometry(1,1);geo.rotateX(-Math.PI/2);
 const im=new THREE.InstancedMesh(geo,lampPoolMat,pts.length);const o=new THREE.Object3D();pts.forEach((p,i)=>{o.position.set(p[0],groundY(p[0],p[1])+.06,p[1]);o.scale.set(p[2]*2.4,1,p[2]*2.4);o.updateMatrix();im.setMatrixAt(i,o.matrix);});im.renderOrder=2;im.frustumCulled=false;scene.add(im);}
finalizeStatic();buildVegetation();initGrass();
for(const m of allMats){if(m.metalness<.5&&!m.transparent)m.envMapIntensity=.55;}
{const pts=[];for(let z=-350;z<=350;z+=25)pts.push([RWX-24,z],[RWX+24,z]);const im=new THREE.InstancedMesh(new THREE.BoxGeometry(.5,.25,.5),bulbMat,pts.length);const o=new THREE.Object3D();pts.forEach((q,i)=>{o.position.set(q[0],.15,q[1]);o.updateMatrix();im.setMatrixAt(i,o.matrix);});scene.add(im);}

// ================= FIGUREN: weiche Körper mit Skelett (eine Geometrie, ein Draw-Call pro Person) =================
const SK={
 statur:['Schmal','Normal','Kräftig','Sportlich','Mollig'],
 koerper:['Männlich','Weiblich'],
 haut:[0xf6d5b8,0xe8b48a,0xc68e5e,0x9a6440,0x6b4428,0x45291a],
 frisur:['Kurz','Seitenscheitel','Lang','Irokese','Afro','Zopf','Glatze','Locken','Dutt'],
 haarfarbe:[0x111111,0x4a2f1b,0x8a5a2b,0xd8b56b,0xb33a1f,0x9a9a9a,0x3a6ee8,0xe84393],
 oberteil:['T-Shirt','Hoodie','Jacke','Hemd','Tanktop','Sakko'],
 oberteilfarbe:[0xf2f2f2,0x1b1b1b,0xc0392b,0x1f5fbf,0x27ae60,0xf1c40f,0xe67e22,0x8e44ad,0x1f8a8a,0xe84393,0x6d4c41,0x7f8c8d],
 hose:['Jeans','Jogger','Shorts','Rock','Stoffhose'],
 hosenfarbe:[0x2a3550,0x1b1b1b,0x6d5a42,0x7f8c8d,0x3b5323,0xc9b28a,0x8b1e1e],
 schuhe:[0xf2f2f2,0x1b1b1b,0xc0392b,0x1f5fbf,0xf1c40f,0x6d4c41],
 extra:['Nichts','Sonnenbrille','Brille','Cap','Kopfhörer','Kette','Bart','Mütze'],
};
const SKL={statur:'Statur',koerper:'Körperbau',haut:'Hautfarbe',frisur:'Frisur',haarfarbe:'Haarfarbe',oberteil:'Oberteil',oberteilfarbe:'Oberteil-Farbe',hose:'Hose',hosenfarbe:'Hosen-Farbe',schuhe:'Schuhe',extra:'Extra'};
const randomSkin=()=>{const s={};for(const k in SK)s[k]=Math.floor(Math.random()*SK[k].length);if(Math.random()<.5)s.extra=0;
 if(s.koerper===1){if(s.extra===6)s.extra=0;if(Math.random()<.6)s.frisur=pick([2,5,7,8,1]);}else{if(s.hose===3)s.hose=0;if(s.frisur===8)s.frisur=0;}
 if(Math.random()<.3)s.statur=1;return s;};
// ---------- Geometrie-Baukasten ----------
const BONES=['hips','spine','chest','neck','head','armL','foreL','handL','armR','foreR','handR','legL','shinL','footL','legR','shinR','footR'];
const BI={};BONES.forEach((b,i)=>BI[b]=i);
const BONE_PARENT={spine:'hips',chest:'spine',neck:'chest',head:'neck',armL:'chest',foreL:'armL',handL:'foreL',armR:'chest',foreR:'armR',handR:'foreR',legL:'hips',shinL:'legL',footL:'shinL',legR:'hips',shinR:'legR',footR:'shinR'};
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const STATUR_P={Schmal:{w:.86,belly:0,arm:.88,leg:.9,sh:.95},Normal:{w:1,belly:.012,arm:1,leg:1,sh:1},Kräftig:{w:1.14,belly:.04,arm:1.16,leg:1.12,sh:1.12},Sportlich:{w:1.04,belly:-.008,arm:1.2,leg:1.08,sh:1.16},Mollig:{w:1.22,belly:.085,arm:1.12,leg:1.16,sh:1.04}};
const BODY_GEO=new Map();
const CHAR_PAL_N=14;
const CHAR_ROUGH=[.55,.85,.88,.5,.62,.2,.15,.45,.7,.25,.3,.6,.7,.6];
// ---------- Skelett ----------
const CHARS=new Set();

// ================= AUTO-MODELLE: glatte Karosserien, Radkästen, Felgen, Lichter =================
// L Länge, W Breite, yb Unterkante, hood/belt/trunk Höhen, roof Dach, cab [hinten,vorn] Kabine, ws/rw Rampen der Scheiben,
// wr Radradius, wz [vorn,hinten], nose/tail Rundung, side Seitenfenster-Bereich [hinten,vorn]
const CARDEF={
 sedan:{L:4.75,W:1.86,yb:.3,hood:.86,belt:.95,trunk:.98,roof:1.45,cab:[-1.3,.92],ws:.78,rw:.6,wr:.35,wz:[1.48,-1.42],nose:.55,tail:.42,rim:0},
 sport:{L:4.55,W:1.94,yb:.24,hood:.74,belt:.83,trunk:.88,roof:1.22,cab:[-1.05,.85],ws:1.0,rw:.95,wr:.36,wz:[1.42,-1.36],nose:.65,tail:.45,spoiler:1,rim:1,cal:1},
 suv:{L:4.85,W:1.98,yb:.46,hood:1.12,belt:1.18,trunk:1.2,roof:1.84,cab:[-2.1,1.05],ws:.62,rw:.22,wr:.43,wz:[1.52,-1.5],nose:.45,tail:.28,rails:1,rim:2},
 muscle:{L:4.95,W:1.95,yb:.3,hood:.92,belt:.98,trunk:.98,roof:1.36,cab:[-1.25,.55],ws:.72,rw:.8,wr:.38,wz:[1.56,-1.5],nose:.32,tail:.3,scoop:1,rim:3},
 super:{L:4.6,W:2.02,yb:.2,hood:.66,belt:.76,trunk:.9,roof:1.12,cab:[-.85,1.02],ws:1.2,rw:1.15,wr:.36,wz:[1.46,-1.38],nose:.8,tail:.42,spoiler:2,rim:1,cal:1,intake:1},
 compact:{L:3.95,W:1.76,yb:.3,hood:.86,belt:.95,trunk:1.02,roof:1.5,cab:[-1.72,.78],ws:.72,rw:.28,wr:.32,wz:[1.25,-1.25],nose:.55,tail:.26,rim:0},
 pickup:{L:5.35,W:1.98,yb:.5,hood:1.16,belt:1.2,trunk:1.18,roof:1.9,cab:[-.6,1.12],ws:.62,rw:.12,wr:.45,wz:[1.72,-1.62],nose:.42,tail:.12,bed:1,rim:2},
 van:{L:5.05,W:2.04,yb:.42,hood:1.15,belt:1.2,trunk:1.22,roof:2.22,cab:[-2.5,1.5],ws:.78,rw:.08,wr:.4,wz:[1.66,-1.62],nose:.6,tail:.12,side:[-.4,1.5],rim:0},
 limo:{L:6.4,W:1.94,yb:.3,hood:.9,belt:.97,trunk:1.0,roof:1.45,cab:[-2.35,.98],ws:.78,rw:.55,wr:.36,wz:[2.15,-2.25],nose:.48,tail:.38,rim:2},
 bus:{L:11.2,W:2.5,yb:.45,hood:2.95,belt:1.25,trunk:2.95,roof:3.15,cab:[-5.55,5.6],ws:.25,rw:.06,wr:.55,wz:[3.7,-3.6],nose:.22,tail:.16,side:[-5.0,5.4],rim:4,bus:1},
 armored:{L:5.7,W:2.22,yb:.52,hood:1.45,belt:1.5,trunk:2.42,roof:2.46,cab:[-2.85,1.6],ws:.55,rw:.02,wr:.48,wz:[1.85,-1.8],nose:.38,tail:.1,side:[.55,1.6],rim:4,box:1},
 truck:{L:7.2,W:2.4,yb:.55,hood:1.6,belt:1.6,trunk:3.2,roof:3.25,cab:[-3.6,2.5],ws:.55,rw:.02,wr:.52,wz:[2.3,-2.4],nose:.35,tail:.06,side:[1.4,2.5],rim:4,box:1},
};
const carTrimMat=cm(0x16181b,.62,.15),carChromeMat=cm(0xe2e2e2,.16,1),carRubberMat=cm(0x121212,.9),carDarkMat=cm(0x0b0c0e,.85);
const carGlassMat=new THREE.MeshPhysicalMaterial({color:0x0b1118,metalness:.1,roughness:.04,transparent:true,opacity:.8,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:1.7});allMats.push(carGlassMat);
const grilleTex=canvasTex(128,64,(g,w,h)=>{g.fillStyle='#0b0b0c';g.fillRect(0,0,w,h);g.strokeStyle='#3a3d42';g.lineWidth=2;for(let y=-8;y<h+8;y+=8)for(let x=-8;x<w+8;x+=10){g.beginPath();g.moveTo(x,y+4);g.lineTo(x+5,y);g.lineTo(x+10,y+4);g.lineTo(x+5,y+8);g.closePath();g.stroke();}});
const grilleMat=M({map:grilleTex,roughness:.5,metalness:.4});
const plateTexs=[];
const sm1=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
// Räder: Reifen (gedrehtes Profil) + Felge
const WHEEL_GEO={};
const rimMats=[cm(0xc9ccd0,.22,1),cm(0x2b2d31,.35,.8),cm(0xb7b9bc,.28,1),cm(0xd6d8da,.12,1),cm(0x6f7378,.4,.7)];
const caliperMat=cm(0xc0201a,.4,.3);
// Karosserie-Teile je Typ (gecacht)
const CAR_GEO={};

// ================= AUTOS & FAHRZEUGE =================
const VST={
 sedan:{name:'Solara Kombi',max:42,acc:14,hp:550,price:2500},
 sport:{name:'Viper GT',max:52,acc:19,hp:500,price:12000},
 suv:{name:'Bulldog SUV',max:40,acc:13,hp:750,price:6000},
 muscle:{name:'Thunder 70',max:50,acc:20,hp:600,price:15000},
 super:{name:'Phantom X',max:62,acc:24,hp:450,price:38000},
 van:{name:'Lastesel Van',max:34,acc:10,hp:800},
 bus:{name:'Stadtbus',max:28,acc:7,hp:1500},
 limo:{name:'Royal Limousine',max:42,acc:12,hp:900,price:22000},
 taxi:{name:'Taxi',max:42,acc:14,hp:550},
 police:{name:'Streifenwagen',max:50,acc:17,hp:700},
 ambulance:{name:'Rettungswagen',max:40,acc:12,hp:900},
 armored:{name:'Geldtransporter',max:30,acc:8,hp:2600},
 bike:{name:'Blitz 600',max:58,acc:26,hp:300,price:7000},
 scooter:{name:'Roller',max:28,acc:12,hp:250},
 boat:{name:'Speedboot',max:34,acc:13,hp:700},
 tank:{name:'Panzer',max:15,acc:6,hp:6000},
 compact:{name:'Stadtflitzer',max:38,acc:13,hp:480,price:1800},
 pickup:{name:'Ranchero Pickup',max:40,acc:13,hp:800,price:5200},
 truck:{name:'Kastenlaster',max:30,acc:7,hp:1600},
};
const BODY={taxi:'sedan',police:'sedan',ambulance:'van'};
const paintCache={};
const glassMat=M({color:0x0b1219,roughness:.04,metalness:.95});
const tireMat=cm(0x141414,.9),rimMat=cm(0xc0c0c0,.25,.95);
const headMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xfff3d0,emissiveIntensity:.5});
const tailMat=new THREE.MeshStandardMaterial({color:0x550000,emissive:0xff1010,emissiveIntensity:.8});
const polRed=new THREE.MeshStandardMaterial({color:0x300000,emissive:0xff0010,emissiveIntensity:0});
const polBlue=new THREE.MeshStandardMaterial({color:0x000030,emissive:0x1040ff,emissiveIntensity:0});
const carColors=[0xb3221c,0x1f5fbf,0xf2f2f2,0x111111,0xe3b505,0x16a085,0x7f8c8d,0x6c3483,0xe67e22,0x1c2833,0x9b1d20,0xbdc3c7,0x2e4053,0x0e6655];
const polSign=sign('POLIZEI','#f4f4f4','#14295e',256,64,46);
const taxiSignTex=canvasTex(128,48,(g,w,h)=>{g.fillStyle='#ffe066';g.fillRect(0,0,w,h);g.fillStyle='#111';g.font='bold 34px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('TAXI',w/2,h/2+2);});
const taxiSignMat=new THREE.MeshStandardMaterial({map:taxiSignTex,emissive:0xffffff,emissiveMap:taxiSignTex,emissiveIntensity:.6});
const checkerTex=canvasTex(128,16,(g)=>{for(let x=0;x<16;x++)for(let y=0;y<2;y++){g.fillStyle=(x+y)%2?'#111':'#f2f2f2';g.fillRect(x*8,y*8,8,8);}});checkerTex.wrapS=THREE.RepeatWrapping;checkerTex.repeat.set(3,1);
const checkerMat=M({map:checkerTex,roughness:.5});
const ambSignMat=new THREE.MeshStandardMaterial({map:sign('RETTUNG','#f4f4f4','#c0392b',256,64,46)});
const armSignMat=new THREE.MeshStandardMaterial({map:sign('GELDTRANSPORT','#3d4249','#f2d06b',256,64,30)});
const beamMat=new THREE.MeshBasicMaterial({color:0xfff2cc,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
const beamGeo=(()=>{const g=new THREE.ConeGeometry(2.6,13,16,1,true);g.rotateX(-Math.PI/2);g.translate(0,0,6.5);return g;})();
const cars=[];
const TRAFFIC_MIX=[['sedan',26],['compact',12],['suv',13],['van',8],['taxi',9],['sport',6],['muscle',5],['pickup',6],['truck',3],['bus',4],['bike',6],['scooter',3],['limo',2],['super',2]];
const TRAFFIC_SUM=TRAFFIC_MIX.reduce((a,b)=>a+b[1],0);
for(let k=0;k<54;k++)spawnTraffic();
parkedCar(GARAGE.x-12,GARAGE.z-12,Math.PI/2,0xff8c1a,'sport');parkedCar(GARAGE.x+12,GARAGE.z-12,-Math.PI/2,0x1c2833,'suv');
const SPAWN={x:JX,z:WATER_Z+20};
const prologCar=parkedCar(nodeX(1)+5.5,nodeX(N-1)+10,Math.PI,0xff8c1a,'sport');prologCar.keep=true;
// Parkende Autos am Straßenrand
for(let k=0;k<26;k++){const a={i:Math.floor(Math.random()*(N+1)),j:Math.floor(Math.random()*(N+1))};const b=pick(nbrs(a));const A=nd(a.i,a.j),Bp=nd(b.i,b.j);const t=R(.3,.7);const dx=Math.sign(Bp.x-A.x),dz=Math.sign(Bp.z-A.z);const h=Math.atan2(dx,dz);
 const x=A.x+(Bp.x-A.x)*t-Math.cos(h)*6.4,z=A.z+(Bp.z-A.z)*t+Math.sin(h)*6.4;if(Math.hypot(x-SPAWN.x,z-SPAWN.z)<60)continue;
 parkedCar(x,z,h,pick(carColors),pick(['sedan','sedan','suv','van','sport','muscle','bike']));}
// Verkehr auf der Ringautobahn
const RING_PTS=[{x:RING.x0,z:RING.z0},{x:RING.x1,z:RING.z0},{x:RING.x1,z:RING.zs},{x:RING.x0,z:RING.zs}];
const RING_LEN=[];let RING_TOTAL=0;for(let k=0;k<4;k++){const a=RING_PTS[k],b=RING_PTS[(k+1)%4];const l=Math.hypot(b.x-a.x,b.z-a.z);RING_LEN.push(l);RING_TOTAL+=l;}
for(let k=0;k<16;k++)spawnRingCar();

// ---------- Texturen ----------
const VTX={
 camo:itx(256,256,(g,w,h)=>{g.fillStyle='#55603a';g.fillRect(0,0,w,h);const R=mulberry32(4411);
  const blob=(col,n,rs)=>{g.fillStyle=col;for(let i=0;i<n;i++){let cx=R()*w,cy=R()*h;const cs=[],m=3+Math.floor(R()*4);for(let k=0;k<m;k++){cs.push([cx,cy,rs*(.4+R()*.55),R()*1.2-.6]);cx+=(R()-.5)*rs*1.7;cy+=(R()-.5)*rs*1.1;}
   for(const ox of [-w,0,w])for(const oy of [-h,0,h])for(const [a,b2,r,an] of cs){g.beginPath();g.ellipse(a+ox,b2+oy,r*1.35,r*.8,an,0,7);g.fill();}}};
  blob('#3d4729',10,22);blob('#6a5a3e',8,17);blob('#262b1d',7,12);
  for(let i=0;i<2600;i++){g.fillStyle=`rgba(${R()<.5?'20,22,14':'200,190,160'},${.03+R()*.05})`;g.fillRect(R()*w,R()*h,1+R()*2,1+R()*2);}
  for(let i=0;i<40;i++){const x=R()*w,y=R()*h;g.fillStyle=`rgba(40,34,24,${.05+R()*.08})`;g.fillRect(x,y,1+R()*2,8+R()*30);}}),
 deck:itx(64,64,(g,w,h)=>{g.fillStyle='#d9d8d1';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=4)for(let x=(y/4%2)*2;x<w;x+=4){g.fillStyle='rgba(120,120,112,.28)';g.fillRect(x,y,2,2);}}),
 gps:canvasTex(128,80,(g,w,h)=>{g.fillStyle='#0c2238';g.fillRect(0,0,w,h);g.fillStyle='#c9b77a';g.beginPath();g.moveTo(0,0);g.lineTo(70,0);g.bezierCurveTo(60,20,80,30,52,48);g.bezierCurveTo(30,62,20,70,0,80);g.fill();
  g.strokeStyle='rgba(120,190,255,.35)';for(let i=0;i<6;i++){g.beginPath();g.arc(70,40,10+i*9,0,7);g.stroke();}g.strokeStyle='#ff5a3c';g.lineWidth=2;g.setLineDash([4,3]);g.beginPath();g.moveTo(100,70);g.lineTo(84,44);g.lineTo(62,30);g.stroke();
  g.fillStyle='#ffffff';g.beginPath();g.moveTo(100,64);g.lineTo(96,74);g.lineTo(104,74);g.fill();g.fillStyle='rgba(255,255,255,.85)';g.font='bold 9px sans-serif';g.fillText('24 kn',4,76);g.fillText('N',118,10);}),
 reg:canvasTex(256,48,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#1b2430';g.font='bold 34px Arial, sans-serif';g.textBaseline='middle';g.fillText('PS-2187-SL',8,26);})};
VTX.gps.colorSpace=VTX.reg.colorSpace=THREE.SRGBColorSpace;
const VMAT={
 hullW:M({color:0xe4e4df,roughness:.32,metalness:.05}),bottom:M({color:0x23272d,roughness:.6}),cap:M({color:0xcfcdc4,roughness:.45}),
 rub:cm(0x26292e,.55,.1),liner:M({color:0xd6d0c1,roughness:.6}),deck:M({map:VTX.deck,roughness:.8}),
 cush:M({color:0xe2dbcb,roughness:.66}),cushD:M({color:0x2d3a4a,roughness:.6}),dash:M({color:0x16181b,roughness:.35,metalness:.2}),
 chrome:M({color:0xdfe5ea,roughness:.12,metalness:1}),steelD:cm(0x8d969e,.3,.85),eng:M({color:0x0e1012,roughness:.25,metalness:.35}),engG:cm(0x50555a,.45,.55),
 glass:M({color:0xa9c4d2,roughness:.04,metalness:.2,transparent:true,opacity:.32,depthWrite:false}),glassD:M({color:0x18252e,roughness:.05,metalness:.8}),
 screen:M({map:VTX.gps,emissive:0xffffff,emissiveMap:VTX.gps,emissiveIntensity:.75,roughness:.3}),
 navR:M({color:0xff3a2a,emissive:0xff2010,emissiveIntensity:1.4}),navG:M({color:0x30ff6a,emissive:0x10ff50,emissiveIntensity:1.4}),navW:M({color:0xffffff,emissive:0xfff4d8,emissiveIntensity:1.2}),
 camo:M({map:VTX.camo,roughness:.86,metalness:.12}),camoD:M({map:VTX.camo,color:0xb8b8b0,roughness:.88,metalness:.12}),
 track:M({color:0x2c2b28,roughness:.7,metalness:.55}),rubber:cm(0x161616,.9),tank:cm(0x3a3d33,.6,.5),
 tarp:M({color:0x5c5a3e,roughness:.95}),wood:IM.oak,tail:M({color:0xc01818,emissive:0x600808,emissiveIntensity:.6,roughness:.3}),
 lamp:M({color:0xfff3d6,emissive:0xfff0cc,emissiveIntensity:.35,roughness:.1}),black:cm(0x101112,.5,.2)};
const VPLANAR={deck:2,camo:.36,camoD:.36,wood:1};

// ---------- Sportboot (Mittelkonsole, zwei Außenborder) ----------
const BOATZ=[-3.0,-2.2,-1.2,-.2,.8,1.6,2.3,2.85,3.25,3.55],BOATHW=[1.10,1.16,1.19,1.20,1.17,1.06,.86,.6,.33,.03],BOATKY=[-.28,-.30,-.31,-.31,-.29,-.22,-.06,.15,.42,.72],
 BOATSH=[1.10,1.11,1.12,1.14,1.18,1.24,1.32,1.40,1.47,1.52],BOATDR=[.20,.21,.22,.24,.27,.31,.35,.38,.36,.3];
const BOAT_SEAT={x:0,y:.6,z:-.42};
let BOATGEO=null;

// ---------- Kampfpanzer (eigenes Design, Tarnlackierung) ----------
let TANKGEO=null;

// ================= FUSSGÄNGER =================
const peds=[];
// Der Passanten-Pool (reich/normal/arm/Strand) wird beim Start in 16e_leben.js aufgebaut (initPedPool)

// ================= SPIELER =================
let skin=null;try{skin=JSON.parse(localStorage.getItem('portsolara_skin'));}catch(e){}
if(!skin||typeof skin!=='object')skin={statur:1,haut:2,frisur:0,haarfarbe:0,oberteil:2,oberteilfarbe:8,hose:0,hosenfarbe:0,schuhe:0,extra:1};
for(const k in SK)if(!(skin[k]>=0&&skin[k]<SK[k].length))skin[k]=k==='koerper'?0:0;
for(const k in SK)if(!(skin[k]>=0&&skin[k]<SK[k].length))skin[k]=0;
const P={pos:new THREE.Vector3(SPAWN.x,0,SPAWN.z),vy:0,face:Math.PI,phase:0,inCar:null,inAir:null,name:'Fremder',money:0,swing:0,char:null,hp:100,dead:false,deadT:0,armor:0,stunT:0,stepT:0,ride:null};
rebuildPlayer();
const headSpot=new THREE.SpotLight(0xfff1d6,0,70,0.5,0.5,1);headSpot.position.set(0,1,2);const headTgt=new THREE.Object3D();headTgt.position.set(0,0,18);headSpot.target=headTgt;scene.add(headSpot,headTgt);

// ================= EINGABE =================
let mode='title';
const K={};let camYaw=Math.PI,camPitch=.3,mouseIdle=9,creatorYaw=0,cineRace=null,cineCombat=null,cineLookTouch=null;
// Dev-Freecam: friert die Welt und alle LOD-/Streaming-Zustände am Aktivierungsort ein.
const DEV_CAM={active:false,token:'PORTSOLARA-VALLE-DEV-2026',keys:new Set(),anchor:new THREE.Vector3(),pos:new THREE.Vector3(),returnPos:new THREE.Vector3(),returnQuat:new THREE.Quaternion(),returnFov:62,yaw:0,pitch:0,speed:35};
// Capture-Listener läuft vor der normalen Spielsteuerung, damit Y/WASD nicht den Spieler bewegen.
addEventListener('keydown',e=>{if(e.code==='F12'||(e.ctrlKey&&e.shiftKey&&e.code==='KeyI')){DEV_CAM.devtoolsRequestedUntil=performance.now()+20000;return;}if(DEV_CAM.active){if(e.code==='F12'||(e.ctrlKey&&e.shiftKey&&e.code==='KeyI'))return;e.preventDefault();e.stopImmediatePropagation();if(!e.repeat&&(e.code==='KeyY'||e.code==='Escape')){toggleDevFreecam();return;}DEV_CAM.keys.add(e.code);return;}if(e.code==='KeyY'&&!e.repeat&&mode==='play'&&devCookieEnabled()){e.preventDefault();e.stopImmediatePropagation();toggleDevFreecam();}},true);
addEventListener('keyup',e=>{if(DEV_CAM.active||DEV_CAM.keys.has(e.code)){e.preventDefault();e.stopImmediatePropagation();DEV_CAM.keys.delete(e.code);}},true);
addEventListener('mousemove',e=>{if(!DEV_CAM.active)return;e.stopImmediatePropagation();DEV_CAM.yaw-=clamp(e.movementX||0,-250,250)*.0026;DEV_CAM.pitch=clamp(DEV_CAM.pitch-(e.movementY||0)*.0022,-1.48,1.48);},{capture:true});
const CINE_RACE_CODES=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space']);
bindCineRaceButtons();
for(const b of document.querySelectorAll('#cineCombatControls button')){b.addEventListener('pointerdown',e=>{e.preventDefault();cineCombatButtonDown(b,e);try{b.setPointerCapture(e.pointerId);}catch(_){} });const up=e=>{e.preventDefault();cineCombatButtonUp(b);};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);}
renderer.domElement.addEventListener('pointerdown',e=>{if(mode==='cine'&&cineCombat&&cineCombat.active&&cineCombat.ready&&SET.input==='touch'){cineLookTouch={id:e.pointerId,x:e.clientX,y:e.clientY};try{renderer.domElement.setPointerCapture(e.pointerId);}catch(_){}}});
renderer.domElement.addEventListener('pointermove',e=>{if(!cineLookTouch||cineLookTouch.id!==e.pointerId)return;const dx=e.clientX-cineLookTouch.x,dy=e.clientY-cineLookTouch.y;cineLookTouch.x=e.clientX;cineLookTouch.y=e.clientY;camYaw-=dx*.006*SET.touchSens;camPitch=clamp(camPitch+dy*.0045*SET.touchSens,-.5,1.1);});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(ev,e=>{if(cineLookTouch&&cineLookTouch.id===e.pointerId)cineLookTouch=null;});
