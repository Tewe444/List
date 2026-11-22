'use strict';
// PORT SOLARA – Leistungs-Update:
// 1) Entfernungs-Culling: kleine, weit entfernte Objekte (Requisiten, Flugzeuge, Autos …) werden nicht mehr gezeichnet.
//    Statt .visible (das die Spiellogik selbst nutzt) wird die Render-Ebene umgeschaltet – Kamera und Schatten zeichnen nur Ebene 0.
// 2) Schatten werden bei langsamer Bewegung nur jedes zweite Bild neu berechnet.
(function(){
const HIDE_LAYER=5;
const info=new WeakMap();     // obj -> {cx,cz,r,moving,off}
let list=[],scanT=0,cullT=0,frameN=0;
const box=new THREE.Box3(),tmp=new THREE.Vector3(),sz=new THREE.Vector3();
const skip=new WeakSet();
function managed(o){if(skip.has(o))return true;let lit=false;o.traverse(c=>{if(c.isLight||c.isCamera)lit=true;});if(lit){skip.add(o);return true;}return false;}
function chunkSet(){const s=new WeakSet();try{for(const ch of staticChunks){for(const m of ch.meshes)s.add(m);if(ch.proxy)s.add(ch.proxy);}}catch(e){}return s;}
let chunks=null;
function scan(){
 if(!chunks)chunks=chunkSet();const fresh=[];const moving=new WeakSet();
 try{for(const c of cars)moving.add(c.g);for(const n of peds)n.c&&moving.add(n.c.g);for(const a of aircraft)moving.add(a.g);}catch(e){}
 for(const o of scene.children){if(chunks.has(o)||managed(o))continue;let I=info.get(o);
  if(!I){let hasMesh=false;o.traverse(c=>{if(c.isMesh||c.isSkinnedMesh||c.isPoints||c.isLine)hasMesh=true;});if(!hasMesh){skip.add(o);continue;}
   o.updateMatrixWorld(true);box.setFromObject(o);if(box.isEmpty()){skip.add(o);continue;}box.getCenter(tmp);box.getSize(sz);const r=sz.length()/2;
   if(r>150||!isFinite(r)){skip.add(o);continue;}   // Gelände, Wasser, Himmel usw. nie ausblenden
   I={ox:tmp.x-o.position.x,oz:tmp.z-o.position.z,r,moving:moving.has(o),off:false};info.set(o,I);}
  fresh.push(o);}
 list=fresh;}
function setLayer(o,off){o.traverse(c=>{if(off)c.layers.set(HIDE_LAYER);else c.layers.set(0);});}
function cull(){
 const cx=camera.position.x,cz=camera.position.z,base=Math.max(180,getEffectiveGfxFar()*1.7);
 for(const o of list){const I=info.get(o);if(!I)continue;const x=o.position.x+I.ox,z=o.position.z+I.oz;
  const d=Math.hypot(x-cx,z-cz)-I.r,lim=base+I.r*12;const off=d>lim;if(off!==I.off){I.off=off;setLayer(o,off);}}}
function tick(){requestAnimationFrame(tick);if(typeof mode==='undefined'||mode==='title')return;const now=performance.now();
 if(now>scanT){scanT=now+2000;scan();}
 if(now>cullT){cullT=now+200;cull();}}
requestAnimationFrame(tick);

// Schatten nur jedes zweite Bild aktualisieren, solange man sich langsam bewegt
renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
{const cr=composer.render.bind(composer);composer.render=function(dt){frameN++;
 const fast=(P.inCar&&Math.abs(P.inCar.speed||0)>9)||P.inAir||(typeof DEV_CAM!=='undefined'&&DEV_CAM.active);
 if(fast||frameN%2===0)renderer.shadowMap.needsUpdate=true;return cr(dt);};}

window.PERF={get culled(){return list.filter(o=>info.get(o)&&info.get(o).off).length;},get tracked(){return list.length;}};
console.info('[Leistung] Entfernungs-Culling und Schatten-Drosselung aktiv.');
})();
