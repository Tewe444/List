'use strict';
// PORT SOLARA – Wahrzeichen aus Blender (assets/models/*.glb, gebaut mit tools/blender/build_landmarks.py)
// und eine schärfere, übersichtlichere Kartenansicht (Gebietsnamen live, Wahrzeichen-Symbole, Maßstab, Nordpfeil).
(function(){
const LM=window.LANDMARKS=[];   // {name,x,z,l,c} – für die Karte
const ANIM=[];                  // pro Bild: {fn}
const CULL=[];                  // {obj,x,z,r}

// ---------- Hilfen ----------
function mergeByMaterial(node,skip){
 // Alle Meshes unter node (außer Teilbäumen in skip) zu einem Mesh pro Material zusammenführen -> wenige Draw Calls
 node.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(node.matrixWorld).invert();const groups=new Map(),remove=[];
 node.traverse(o=>{if(skip&&skip(o))return;if(!o.isMesh)return;let p=o.parent;while(p&&p!==node){if(skip&&skip(p))return;p=p.parent;}
  let g=o.geometry.clone();for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal')g.deleteAttribute(k);if(!g.attributes.normal)g.computeVertexNormals();
  if(g.index)g=g.toNonIndexed();g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld));
  const key=o.material.uuid;if(!groups.has(key))groups.set(key,{m:o.material,list:[]});groups.get(key).list.push(g);remove.push(o);});
 for(const o of remove)o.parent.remove(o);
 for(const {m,list} of groups.values()){const g=mergeGeometries(list,false);if(!g)continue;g.computeBoundingSphere();const mesh=new THREE.Mesh(g,m);node.add(mesh);}
 return node;}
function shade(root,cast=true){root.traverse(o=>{if(o.isMesh){o.castShadow=cast;o.receiveShadow=true;}});}
function freeze(root){root.updateMatrixWorld(true);root.traverse(o=>{o.matrixAutoUpdate=false;o.matrixWorldAutoUpdate=false;});}
function place(root,x,y,z,ry=0){root.position.set(x,y,z);root.rotation.y=ry;scene.add(root);return root;}
function byName(root,n){let f=null;root.traverse(o=>{if(!f&&o.name===n)f=o;});return f;}
function tint(root,matName,hex){root.traverse(o=>{if(o.isMesh&&o.material&&o.material.name===matName){o.material=o.material.clone();o.material.color.setHex(hex);}});}

// Für andere Module (z. B. epilogue.js): Modelle laden und wie die Wahrzeichen platzieren
window.LMK={mergeByMaterial,shade,freeze,place,byName,tint,LM,ANIM,CULL,
 load:n=>new Promise((ok,no)=>{if(!window.GLTFLoader)return no(new Error('kein GLTFLoader'));new GLTFLoader().load('assets/models/'+n+'.glb',g=>ok(g.scene),undefined,no);})};
function loadAll(){
 if(!window.GLTFLoader){console.info('[Wahrzeichen] Kein GLTFLoader – Modelle werden übersprungen.');return;}
 const loader=new GLTFLoader();
 const get=n=>new Promise((ok,no)=>loader.load('assets/models/'+n+'.glb',g=>ok(g.scene),undefined,no));
 Promise.all(['lighthouse','ferriswheel','lifeguard','sign'].map(n=>get(n).catch(e=>{console.warn('[Wahrzeichen] fehlt:',n,e);return null;}))).then(([lh,fw,lg,sg])=>{
  try{if(lh)addLighthouse(lh);}catch(e){console.warn(e);}
  try{if(fw)addFerris(fw);}catch(e){console.warn(e);}
  try{if(lg)addLifeguards(lg);}catch(e){console.warn(e);}
  try{if(sg)addSign(sg);}catch(e){console.warn(e);}
  console.info('[Wahrzeichen] geladen:',LM.map(l=>l.name).join(', '));
 });}

// ---------- Leuchtturm in der Bucht ----------
function addLighthouse(src){
 const x=470,z=610;const root=src;
 const beamNode=byName(root,'Strahl');if(beamNode)beamNode.parent.remove(beamNode);
 mergeByMaterial(root);shade(root);place(root,x,SEA_Y-1,z);freeze(root);
 if(beamNode){const b=new THREE.Group();b.position.set(x,SEA_Y-1+beamNode.position.y,z);beamNode.position.set(0,0,0);beamNode.updateMatrix();b.add(beamNode);scene.add(b);
  beamNode.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;o.material=o.material.clone();Object.assign(o.material,{transparent:true,opacity:.18,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});o.material.emissiveIntensity=1.5;}});
  ANIM.push(dt=>{b.rotation.y+=dt*.45;const night=clamp(1-(sun.intensity||0)/2.2,0,1);beamNode.traverse(o=>{if(o.isMesh)o.material.opacity=.03+night*.22;});});
  CULL.push({obj:b,x,z,r:80});}
 addSolid(x-8,x+8,z-6,z+6,6);CULL.push({obj:root,x,z,r:40});
 LM.push({name:'Leuchtturm',x,z,l:'L',c:'#ffe27a'});}

// ---------- Riesenrad am Stadtstrand ----------
function addFerris(src){
 const x=-110,z=COAST+16,y=groundY(x,z);const root=src;
 const wheel=byName(root,'Rad'),gond=byName(root,'Gondel');
 const HUB=wheel?wheel.position.y:20.5,R=17;
 if(gond)gond.parent.remove(gond);
 if(wheel){mergeByMaterial(wheel);}
 mergeByMaterial(root,o=>o===wheel);
 shade(root);place(root,x,y,z,0);
 const cols=[0xffc93c,0xff6b9a,0x4fd1c5,0x7ab8ff,0xb38cff,0xff8f4f,0x8fe06b,0xffffff];const gons=[];
 if(gond){mergeByMaterial(gond);for(let k=0;k<16;k++){const c=gond.clone(true);c.traverse(o=>{if(o.isMesh&&o.material.name==='Gondel'){o.material=o.material.clone();o.material.color.setHex(cols[k%cols.length]);}});shade(c);root.add(c);gons.push(c);}}
 const upd=a0=>{if(wheel)wheel.rotation.z=a0;for(let k=0;k<gons.length;k++){const a=a0+k/gons.length*Math.PI*2;gons[k].position.set(Math.cos(a)*R,HUB+Math.sin(a)*R,0);}};
 let ang=0;upd(0);
 ANIM.push((dt,near)=>{if(!near)return;ang+=dt*.07;upd(ang);});
 addSolid(x-8,x+8,z-5.5,z+5.5,3);CULL.push({obj:root,x,z,r:45,anim:true});
 LM.push({name:'Riesenrad',x,z,l:'R',c:'#ff6b9a'});}

// ---------- Rettungsschwimmer-Türme ----------
function addLifeguards(src){
 mergeByMaterial(src);
 const spots=[[40,0x4fd1c5],[290,0xff6b9a],[610,0xffc93c],[820,0x7ab8ff],[-620,0xff8f4f],[-770,0x8fe06b]];
 for(const [x,col] of spots){const z=COAST+24;const t=src.clone(true);tint(t,'Kabine',col);shade(t);place(t,x,groundY(x,z),z,0);freeze(t);addSolid(x-1.6,x+1.6,z-1.4,z+1.4,2.6);CULL.push({obj:t,x,z,r:12});}
 LM.push({name:'Strandwache',x:290,z:COAST+24,l:'+',c:'#ff5050',small:true});}

// ---------- Schriftzug auf den Hügeln ----------
function addSign(src){
 const x=540,z=-1360;let y=1e9;for(let dx=-36;dx<=36;dx+=6)y=Math.min(y,groundY(x+dx,z));
 mergeByMaterial(src);shade(src);place(src,x,y+.6,z,0);freeze(src);CULL.push({obj:src,x,z,r:60});
 LM.push({name:'Port-Solara-Schriftzug',x,z,l:'S',c:'#ffffff'});}

// ---------- pro Bild: Animation + Ausblenden im Nebel ----------
let last=performance.now();
function tick(){requestAnimationFrame(tick);const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;
 if(typeof mode==='undefined'||mode==='title')return;
 const cx=camera.position.x,cz=camera.position.z,far=(scene.fog?scene.fog.far:400)+30;
 for(const c of CULL){const d=Math.hypot(c.x-cx,c.z-cz)-c.r;const v=d<far;if(c.obj.visible!==v)c.obj.visible=v;c.near=v;}
 const nearAny=CULL.some(c=>c.anim&&c.near);
 for(const f of ANIM)f(dt,nearAny);}
requestAnimationFrame(tick);
loadAll();

// ================= Kartenansicht =================
// Gebietsnamen werden jetzt live und gestochen scharf gezeichnet (statt unscharf ins Kartenbild eingebrannt)
const _draw=drawBigMap;
drawBigMap=function(){
 _draw.apply(this,arguments);
 const cv=$('bigmap');if(!cv)return;const g=cv.getContext('2d');const Wd=cv.width,Ht=cv.height;
 const fit=Math.min(Wd/(MX1-MX0),Ht/(MZ1-MZ0)),sc=fit*BMV.z,ox=Wd/2-(BMV.cx-MX0)*sc,oy=Ht/2-(BMV.cz-MZ0)*sc;
 const W=x=>ox+(x-MX0)*sc,Z=z=>oy+(z-MZ0)*sc;
 g.save();g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
 const label=(t,x,y,font,fill,stroke=4)=>{g.font=font;g.lineWidth=stroke;g.strokeStyle='rgba(0,0,0,.7)';g.strokeText(t,x,y);g.fillStyle=fill;g.fillText(t,x,y);};
 // Regionen immer, Stadtteile erst ab mittlerem Zoom
 for(const q of ZONES){if(q.ring)continue;const cx=q.cx!=null?q.cx:(q.x0+q.x1)/2,cz=q.cz!=null?q.cz:(q.z0+q.z1)/2;const x=W(cx),y=Z(cz);if(x<-80||y<-30||x>Wd+80||y>Ht+30)continue;
  if(q.region)label(q.name.toUpperCase(),x,y,'italic 800 '+Math.round(clamp(sc*28,13,22))+'px Arial','rgba(255,255,255,.62)',5);
  else if(sc>.3)label(q.name,x,y,'bold '+Math.round(clamp(sc*14,10,15))+'px Arial','rgba(255,255,255,.92)');}
 if(sc<.5)label('PORT SOLARA',W(0),Z(-120),'italic 900 '+Math.round(clamp(sc*60,16,30))+'px Arial','rgba(255,255,255,.75)',6);
 // Wahrzeichen
 for(const l of LM){const x=W(l.x),y=Z(l.z);if(x<-20||y<-20||x>Wd+20||y>Ht+20)continue;const r=l.small?6:9;
  g.beginPath();g.arc(x,y,r,0,7);g.fillStyle='rgba(10,14,24,.85)';g.fill();g.lineWidth=2;g.strokeStyle=l.c;g.stroke();
  g.fillStyle=l.c;g.font='bold '+(l.small?9:11)+'px Arial';g.fillText(l.l,x,y+.5);
  if(sc>.45&&!l.small)label(l.name,x,y+r+10,'bold 11px Arial',l.c,3);}
 // Nordpfeil
 g.translate(30,34);g.beginPath();g.arc(0,0,17,0,7);g.fillStyle='rgba(0,0,0,.55)';g.fill();g.beginPath();g.moveTo(0,-12);g.lineTo(6,4);g.lineTo(0,1);g.lineTo(-6,4);g.closePath();g.fillStyle='#ff5050';g.fill();
 g.fillStyle='#fff';g.font='bold 10px Arial';g.fillText('N',0,10);g.setTransform(1,0,0,1,0,0);
 // Maßstab
 const opts=[25,50,100,200,500,1000,2000,5000];let m=opts[0];for(const o of opts){if(o*sc<=140)m=o;}const px=m*sc,bx=Wd-px-20,by=Ht-44;
 g.fillStyle='rgba(0,0,0,.55)';g.fillRect(bx-8,by-16,px+16,26);g.fillStyle='#fff';g.fillRect(bx,by,px,3);g.fillRect(bx,by-4,2,7);g.fillRect(bx+px-2,by-4,2,7);
 g.font='bold 11px Arial';g.textBaseline='bottom';g.fillText(m>=1000?(m/1000)+' km':m+' m',bx+px/2,by-2);
 g.restore();};
})();
