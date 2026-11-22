'use strict';
// PORT SOLARA – fehlende Kollisionen: Flugzeuge/Helis gegen Spieler, Autos gegen Autos, Menschen gegen Menschen und Spieler.
(function(){
const CELL=8;
function grid(items,posOf){const g=new Map();for(const it of items){const p=posOf(it);if(!p)continue;const k=Math.floor(p.x/CELL)*73856093^Math.floor(p.z/CELL)*19349663;let a=g.get(k);if(!a)g.set(k,a=[]);a.push(it);}return g;}
function near(g,p,fn){const cx=Math.floor(p.x/CELL),cz=Math.floor(p.z/CELL);for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const a=g.get((cx+i)*73856093^(cz+j)*19349663);if(a)for(const it of a)fn(it);}}
function allAir(){const out=[];try{for(const a of aircraft)if(a&&!a.dead)out.push(a);}catch(e){}try{for(const q of AMBA.list)if(q.a&&!q.a.dead&&!out.includes(q.a))out.push(q.a);}catch(e){}return out;}
function airR(a){return a.type==='heli'||a.kind==='heli'?5.5:a.jet?7:8;}

// ---------- Autos gegen Autos (Verkehr) ----------
const fwd=new THREE.Vector3();
function carCircles(c){const h=c.h||0,s=Math.sin(h),co=Math.cos(h),L=c.big?2.2:1.25;return [[c.pos.x+s*L,c.pos.z+co*L],[c.pos.x-s*L,c.pos.z-co*L]];}
function carsTick(){
 const list=cars.filter(c=>c&&c.pos&&c.mode!=='wreck'&&c.g&&c.g.visible!==false);
 const g=grid(list,c=>c.pos);const R=1.15,done=new Set();
 for(const a of list){near(g,a.pos,b=>{if(b===a)return;const key=a.id<b.id?a.id+'_'+b.id:b.id+'_'+a.id;if(done.has(key))return;done.add(key);
  if(a===P.inCar&&b===P.inCar)return;const ca=carCircles(a),cb=carCircles(b);let best=null;
  for(const p of ca)for(const q of cb){const dx=p[0]-q[0],dz=p[1]-q[1],d=Math.hypot(dx,dz);if(d<R*2&&(!best||d<best.d))best={dx,dz,d};}
  if(!best)return;const pen=R*2-best.d,nx=best.d>1e-4?best.dx/best.d:1,nz=best.d>1e-4?best.dz/best.d:0;
  // Spieler-Auto wird von der Spiellogik behandelt; hier nur KI-Fahrzeuge verschieben (geparkte etwas schwerer)
  const ma=a===P.inCar?0:a.mode==='parked'?.3:1,mb=b===P.inCar?0:b.mode==='parked'?.3:1;const sum=ma+mb;if(sum===0)return;
  a.pos.x+=nx*pen*(ma/sum);a.pos.z+=nz*pen*(ma/sum);b.pos.x-=nx*pen*(mb/sum);b.pos.z-=nz*pen*(mb/sum);
  for(const c of [a,b]){if(c===P.inCar)continue;c.g.position.x=c.pos.x;c.g.position.z=c.pos.z;c.speed*=.6;}
 });}}
let carId=1;

// ---------- Menschen gegen Menschen und gegen den Spieler ----------
const FREE=new Set(['idle','walk','wait','flee','fight','ipwalk','ipret','cower']);
function pedsTick(){
 const list=peds.filter(n=>n&&n.c&&n.c.g&&FREE.has(n.state)&&!n.anchor&&Math.abs(n.c.g.position.x-P.pos.x)<80&&Math.abs(n.c.g.position.z-P.pos.z)<80);
 const g=grid(list,n=>n.c.g.position);const R=.34,done=new Set();
 for(const a of list){const pa=a.c.g.position;near(g,pa,b=>{if(b===a)return;const k=a.pid<b.pid?a.pid+'_'+b.pid:b.pid+'_'+a.pid;if(done.has(k))return;done.add(k);
  const pb=b.c.g.position,dx=pa.x-pb.x,dz=pa.z-pb.z,d=Math.hypot(dx,dz);if(d>=R*2||d<1e-4)return;const pen=(R*2-d)/2,nx=dx/d,nz=dz/d;
  pa.x+=nx*pen;pa.z+=nz*pen;pb.x-=nx*pen;pb.z-=nz*pen;});}
 if(!P.inCar&&!P.inAir&&!P.dead&&!P.ride){const pp=P.pos;near(g,pp,n=>{const p=n.c.g.position,dx=pp.x-p.x,dz=pp.z-p.z,d=Math.hypot(dx,dz),min=.62;if(d>=min||d<1e-4)return;
  const pen=min-d,nx=dx/d,nz=dz/d;pp.x+=nx*pen*.6;pp.z+=nz*pen*.6;p.x-=nx*pen*.4;p.z-=nz*pen*.4;});}}
let pedId=1;

// ---------- Flugzeuge & Helis ----------
let airHitT=0;
function airTick(){
 const air=allAir();if(!air.length)return;const me=P.inAir,myPos=me?me.g.position:P.inCar?P.inCar.g.position:P.pos;
 for(const a of air){if(a===me)continue;const p=a.g.position,r=airR(a)+(me?airR(me):P.inCar?2.2:.5);const dy=Math.abs(p.y-(me?myPos.y:myPos.y+1));
  const dxz=Math.hypot(p.x-myPos.x,p.z-myPos.z);
  const moving=(a.speed||0)>4||(a.vel&&a.vel.lengthSq()>16)||a.airborne;
  if(!moving&&!me){ // geparktes Flugzeug = Hindernis
   if(dxz<r&&dy<6){const nx=(myPos.x-p.x)/(dxz||1),nz=(myPos.z-p.z)/(dxz||1),pen=r-dxz;if(P.inCar){P.inCar.pos.x+=nx*pen;P.inCar.pos.z+=nz*pen;P.inCar.speed*=.3;}else{P.pos.x+=nx*pen;P.pos.z+=nz*pen;}}continue;}
  if(dxz<r&&dy<r*.8&&time>airHitT){airHitT=time+1.5;
   try{explode(p.clone(),1.2,'air');}catch(e){}
   if(me){damageAir(me,9999,'crash');}
   else if(P.inCar){try{damageCar(P.inCar,450,'crash');}catch(e){}hurtPlayer(35);}
   else hurtPlayer(80);
   try{damageAir(a,9999,'crash');}catch(e){a.dead=true;}
   toast('Kollision mit einem Fluggerät!');}}}

// Eindeutige IDs für stabile Paare
function ids(){for(const c of cars)if(c&&c.id==null)c.id=carId++;for(const n of peds)if(n&&n.pid==null)n.pid=pedId++;}
let t=0;
function tick(){requestAnimationFrame(tick);if(typeof mode==='undefined'||mode!=='play')return;const now=performance.now();if(now-t<33)return;t=now;
 try{ids();carsTick();}catch(e){}try{pedsTick();}catch(e){}try{airTick();}catch(e){}}
requestAnimationFrame(tick);
window.PHYS={step(){ids();carsTick();pedsTick();airTick();}};
console.info('[Physik] Kollisionen für Fahrzeuge, Menschen und Fluggeräte aktiv.');
})();
