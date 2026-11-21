'use strict';
function updateAirPlayer(dt){const a=P.inAir;
 if(a.type==='heli')updateHeli(a,dt,(key('KeyW','ArrowUp')?1:0)-(key('KeyS','ArrowDown')?1:0),(key('KeyA','ArrowLeft')?1:0)-(key('KeyD','ArrowRight')?1:0),(K.Space?1:0)-((K.ShiftLeft||K.ShiftRight)?1:0));
 else updatePlane(a,dt,(key('KeyW','ArrowUp')?1:0)-(key('KeyS','ArrowDown')?1:0),(K.Space?1:0)-((K.ShiftLeft||K.ShiftRight)?1:0),(key('KeyA','ArrowLeft')?1:0)-(key('KeyD','ArrowRight')?1:0));
 if(!P.inAir)return;
 P.pos.copy(a.g.position);
 airCD-=dt;rocketCD-=dt;
 if(a.armed&&fireHeld&&airCD<=0){airCD=.08;let o,d;lastCombatT=time;
  if(a.type==='heli'){o=camera.position.clone();d=new THREE.Vector3();camera.getWorldDirection(d);}else{d=airForward(a);o=a.g.position.clone().add(tmpV.set(0,1.4,0)).addScaledVector(d,a.r+1);}
  d.x+=RR(-.012,.012);d.y+=RR(-.012,.012);d.z+=RR(-.012,.012);d.normalize();
  const mz=a.g.position.clone().add(tmpV.set(0,a.type==='heli'?.9:1.4,0)).addScaledVector(airForward(a),a.r);
  const hit=raycast(o,d,450,a);tracer(mz,hit.point);flash(mz,.9);gunSound(.1,'mg',a.g.position);
  if(hit.npc)damageNPC(hit.npc,30,d,'player');else if(hit.car)damageCar(hit.car,40,'player');else if(hit.air)damageAir(hit.air,40,'player');else if(!hitProp(hit.point,40,'player'))sparks(hit.point);shotNoise(hit.point);}
 if(a.armed&&aimHeld&&rocketCD<=0){rocketCD=1;let target;
  if(a.type==='heli'){const o=camera.position.clone(),d=new THREE.Vector3();camera.getWorldDirection(d);target=raycast(o,d,600,a).point;}else target=a.g.position.clone().addScaledVector(airForward(a),300);
  for(const sx of [-1,1]){const from=a.g.position.clone().add(tmpV.set(Math.cos(a.h)*sx*2.3,1.1,-Math.sin(a.h)*sx*2.3));fireRocket(from,target,'player',a);}}
}
function updateAircraftWorld(dt){
 for(let i=aircraft.length-1;i>=0;i--){const a=aircraft[i];if(a===P.inAir||a===policeHeli&&!a.dead||a.enemy&&!a.dead)continue;
  const gy=groundY(a.g.position.x,a.g.position.z);
  if(a.g.position.y>gy+.06||a.dead&&a.g.position.y>gy){a.vel.y-=15*dt;a.vel.x*=1-dt*.3;a.vel.z*=1-dt*.3;a.g.position.addScaledVector(a.vel,dt);if(a.type==='heli'){a.spin+=dt*12;a.rotor.rotation.y=a.spin;}
   if(a.g.position.y<=gy){const hard=a.vel.y<-10;a.g.position.y=gy;a.vel.set(0,0,0);if(hard&&!a.dead)damageAir(a,9999,'crash');}}
  else if(a.type==='heli'&&a.spool>0){a.spool=Math.max(0,a.spool-dt*.3);a.spin+=dt*a.spool*32;a.rotor.rotation.y=a.spin;}
  if(a.dead){a.deadT-=dt;if(Math.random()<dt*6)smoke(a.g.position.clone().add(tmpV.set(0,1.5,0)),2,.12,3);
   if(a.deadT<=0&&a.g.position.distanceTo(P.pos)>120&&!a.keep){scene.remove(a.g);aircraft.splice(i,1);}}}
}
function updatePoliceHeli(dt){
 if(wanted>=3&&!policeHeli&&mode==='play'){heliRespawnT-=dt;if(heliRespawnT<=0){const a=makeHeli(0x1c2c4c,false,true);a.police=true;a.hp=750;a.mode='ai';a.spool=1;const ang=Math.random()*6.28;a.g.position.set(P.pos.x+Math.cos(ang)*230,80,P.pos.z+Math.sin(ang)*230);aircraft.push(a);policeHeli=a;heliRespawnT=4;}}
 const a=policeHeli;if(!a)return;
 if(wanted<3||mode!=='play'){a.vel.lerp(tmpV.set(0,10,-40),Math.min(1,dt));a.g.position.addScaledVector(a.vel,dt);a.leave=(a.leave||0)+dt;a.spin+=dt*32;a.rotor.rotation.y=a.spin;searchLight.intensity=0;
  if(a.leave>10){scene.remove(a.g);aircraft.splice(aircraft.indexOf(a),1);policeHeli=null;heliRespawnT=6;}return;}
 a.leave=0;a.orbit=(a.orbit||Math.random()*6)+dt*.35;const tx=P.pos.x+Math.cos(a.orbit)*32,tz=P.pos.z+Math.sin(a.orbit)*32;
 let top=0;for(const sd of solidsNear(tx,tz,30))if(sd.h>top)top=sd.h;const ty=Math.max(P.pos.y+28,top+16);
 const d=tmpV.set(tx-a.g.position.x,ty-a.g.position.y,tz-a.g.position.z);const l=d.length();d.normalize().multiplyScalar(Math.min(45,l*.9));a.vel.lerp(d,Math.min(1,dt*1.5));
 a.g.position.addScaledVector(a.vel,dt);a.h=lerpAng(a.h,Math.atan2(P.pos.x-a.g.position.x,P.pos.z-a.g.position.z),dt*2);a.g.rotation.y=a.h;a.body.rotation.x=.12;
 a.spin+=dt*32;a.rotor.rotation.y=a.spin;a.tr.rotation.x=a.spin*1.4;
 searchLight.intensity=night*450;searchLight.position.copy(a.g.position);slTgt.position.copy(P.pos);
 a.atkT=(a.atkT??3)-dt;if(a.atkT<=0){a.burst=7;a.atkT=4;}
 if(a.burst>0){a.bT=(a.bT||0)-dt;if(a.bT<=0){a.bT=.13;a.burst--;
  const from=a.g.position.clone().add(tmpV.set(0,.6,0));const to=P.inAir?P.inAir.g.position.clone():new THREE.Vector3(P.pos.x,P.pos.y+1.1,P.pos.z);const dd=to.clone().sub(from);const dist=dd.length();dd.normalize();
  if(worldHitT(from,dd,dist)>=dist-1.5&&!P.dead){flash(from.clone().addScaledVector(dd,2.5),.8);gunSound(.07,'mg',from);lastCombatT=time;const hitP=Math.random()<clamp(.45-dist*.004,.1,.45);const end=to.clone();if(hitP)hurtPlayer(5,from);else end.add(tmpV.set(RR(-2,2),RR(-1,1),RR(-2,2)));tracer(from,end);}}}}

// ================= GTA-EXTRAS: Boote, Fallschirm, Waffenrad, Panzer, Todes-Zeitlupe =================
// ---------- Boote ----------
function isWater(x,z){if(onDeck(x,z))return false;if(Math.hypot(x-IX,z-IZ)<IR+13)return false;if(x<TX0+40||x>TX1-40||z<TZ0+40)return false;if(z>TZ1-40)return z<WATER_Z+2400&&Math.abs(x)<2600;return terrainH(x,z)<SEA_Y-.5;}
function nearestShore(x,z){const di=Math.hypot(x-IX,z-IZ);if(di<IR+160&&di>.1){const k=(IR-6)/di;return {x:IX+(x-IX)*k,z:IZ+(z-IZ)*k};}const L=nearestLand(x,z);return {x:L.x,z:L.z};}
function boatExitPoint(c){const x=c.pos.x,z=c.pos.z;
 if(Math.abs(x-JX)<10&&z<JZ1+7&&z>WATER_Z-16)return {x:JX,z:clamp(z,WATER_Z-10,JZ1-1.5)};
 if(Math.abs(x-PIERX)<11&&z<WATER_Z+73)return {x:PIERX,z:clamp(z,WATER_Z-8,WATER_Z+64)};
 const di=Math.hypot(x-IX,z-IZ);if(di<IR+38){const k=(IR-6)/di;return {x:IX+(x-IX)*k,z:IZ+(z-IZ)*k};}
 let best=null,bd=1e9;for(let r=3;r<=15;r+=3)for(let k=0;k<16;k++){const a=k/16*Math.PI*2,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;const h=terrainH(px,pz);if(h>SEA_Y+.05&&h<SEA_Y+4&&r<bd){bd=r;best={x:px,z:pz};}}
 return best;}
function updateBoat(c,dt){const st=VST.boat;const up=key('KeyW','ArrowUp'),dn=key('KeyS','ArrowDown');const s=(key('KeyA','ArrowLeft')?1:0)-(key('KeyD','ArrowRight')?1:0);
 if(up)c.speed+=st.acc*(1-Math.max(0,c.speed)/st.max*.6)*dt;else if(dn)c.speed-=(c.speed>0?18:8)*dt;else c.speed*=1-.35*dt;c.speed=clamp(c.speed,-8,st.max);
 c.steer+=(s-c.steer)*Math.min(1,dt*4);c.h+=c.steer*1.15*clamp(Math.abs(c.speed)/5,0,1)*Math.sign(c.speed||1)*dt;
 const nx=c.pos.x+Math.sin(c.h)*c.speed*dt,nz=c.pos.z+Math.cos(c.h)*c.speed*dt,dir=c.speed>=0?1:-1;
 if(isWater(nx,nz)&&isWater(nx+Math.sin(c.h)*3.2*dir,nz+Math.cos(c.h)*3.2*dir)){c.pos.x=nx;c.pos.z=nz;}
 else{const sp=Math.abs(c.speed);if(sp>6){crashSound(sp);damageCar(c,sp*3,'crash');shake=Math.min(.6,sp/40);}c.speed*=-.2;}
 if(P.inCar!==c)return;
 if(separateCar(c))c.speed*=.6;
 const sp=Math.abs(c.speed);c.body.rotation.x=-Math.min(.16,sp*.0055)+Math.sin(time*2.2)*.008+(c._wp||0);c.body.rotation.z=-c.steer*Math.min(sp,25)/25*.2+(c._wr||0);
 if(sp>5&&c.g.visible&&Math.random()<dt*sp*.7)smoke(new THREE.Vector3(c.pos.x-Math.sin(c.h)*3.4+RR(-.6,.6),c.g.position.y+.5,c.pos.z-Math.cos(c.h)*3.4+RR(-.6,.6)),.9+sp*.03,.92,.9);
 screechLevel=0;const ch=P.char;ch.armL.rotation.x=ch.armR.rotation.x=-1.05;ch.legL.rotation.x=ch.legR.rotation.x=0;
 P.pos.set(c.pos.x,c.g.position.y+BOAT_SEAT.y,c.pos.z);}
function bailOut(){const a=P.inAir;if(!a)return;const f=airForward(a);const sp=a.type==='heli'?a.vel.length():a.speed;
 a.mode='parked';if(a.type==='plane'){a.vel.copy(f).multiplyScalar(a.speed*.8);a.airborne=false;}P.inAir=null;
 P.char.g.visible=true;scene.add(P.char.g);P.pos.copy(a.g.position);P.pos.y-=2.5;P.pos.x-=f.x*4;P.pos.z-=f.z*4;
 P.para={open:false,vy:-2,t:0,fwd:Math.min(25,sp*.35)};P.face=a.h;onVehicleChange();doorSound();
 if(flyTutT>0){flyTutT=0;setTut(mission&&mission.steps[si]?mission.steps[si].tut:'');}
 big('ABGESPRUNGEN','Leertaste: Fallschirm öffnen','#7fd1ff');}
function endPara(){P.para=null;chute.visible=false;}
function chuteTick(dt){const p=P.para;p.t+=dt;const gy=groundY(P.pos.x,P.pos.z);
 const turn=(key('KeyA','ArrowLeft')?1:0)-(key('KeyD','ArrowRight')?1:0);P.face+=turn*(p.open?1.2:.6)*dt;
 if(!p.open){p.vy=Math.max(-48,p.vy-9.8*dt);p.fwd*=1-dt*.3;if((K.Space&&p.t>.35)||(P.pos.y-gy<55&&p.t>1.2)){p.open=true;chute.visible=true;noiseBurst(.4,.25,700,.8);}}
 else{p.vy+=(-4.2-(key('KeyS','ArrowDown')?2:0)-p.vy)*Math.min(1,dt*2.2);p.fwd+=((key('KeyW','ArrowUp')?11:7)-p.fwd)*Math.min(1,dt*1.5);}
 P.pos.x+=Math.sin(P.face)*p.fwd*dt;P.pos.z+=Math.cos(P.face)*p.fwd*dt;P.pos.y+=p.vy*dt;
 for(const b of solidsNear(P.pos.x,P.pos.z,1)){if(b.h>0&&!b.water&&!b.camOnly&&!b.open&&P.pos.y<b.h&&P.pos.x>b.x0&&P.pos.x<b.x1&&P.pos.z>b.z0&&P.pos.z<b.z1){P.pos.y=gy;break;}}
 if(P.pos.y<=gy+.05){const hard=!p.open&&p.vy<-14;endPara();P.pos.y=gy;
  if(isWater(P.pos.x,P.pos.z)){const s=nearestShore(P.pos.x,P.pos.z);P.pos.set(s.x,groundY(s.x,s.z),s.z);toast('Du schwimmst an Land …');}
  collideCircle(P.pos,.5);if(hard)hurtPlayer(999);else if(!p.open)hurtPlayer(-p.vy*2);P.stunT=.6;return;}
 chute.position.set(P.pos.x,P.pos.y+5.6,P.pos.z);chute.rotation.y=P.face;
 const ch=P.char;ch.g.position.copy(P.pos);ch.g.rotation.set(p.open?0:.9,P.face,0);
 if(p.open){ch.armL.rotation.x=ch.armR.rotation.x=-2.8;ch.legL.rotation.x=ch.legR.rotation.x=.1;}else{animChar(ch,Math.sin(time*9)*.5);ch.armL.rotation.x=ch.armR.rotation.x=-2.2;}}
function openWheel(){if(mode!=='play'||P.inCar||P.inAir||P.dead||P.para||P.ride||wheelOpen)return;wheelOpen=true;wheelV.x=wheelV.y=0;wheelSel=INV.cur;renderWheel();$('wwheel').style.display='block';tone(500,.05,'sine',.03);}
function closeWheel(apply){if(!wheelOpen)return;wheelOpen=false;$('wwheel').style.display='none';if(apply&&INV.owned[WEAPONS[wheelSel].id]&&wheelSel!==INV.cur)selectWeapon(wheelSel);}
function wheelMouse(dx,dy){wheelV.x=clamp(wheelV.x+dx,-140,140);wheelV.y=clamp(wheelV.y+dy,-140,140);if(Math.hypot(wheelV.x,wheelV.y)<25)return;
 const a=(Math.atan2(wheelV.x,-wheelV.y)+Math.PI*2)%(Math.PI*2);const k=Math.round(a/(Math.PI*2)*WEAPONS.length)%WEAPONS.length;if(k!==wheelSel){wheelSel=k;renderWheel();tone(800,.02,'sine',.015);}}
function renderWheel(){const e=$('wwheel');let h='<div class="wc"><b>'+WEAPONS[wheelSel].name+'</b><small>'+(INV.owned[WEAPONS[wheelSel].id]?(WEAPONS[wheelSel].melee?'Nahkampf':WEAPONS[wheelSel].thrown?(INV.ammo[WEAPONS[wheelSel].id]||0)+' Stück':((INV.clip[WEAPONS[wheelSel].id]||0)+' / '+(INV.ammo[WEAPONS[wheelSel].id]||0))):'nicht im Besitz')+'</small></div>';
 WEAPONS.forEach((w,k)=>{const a=k/WEAPONS.length*Math.PI*2;const x=Math.sin(a)*150,y=-Math.cos(a)*150;const own=INV.owned[w.id];h+=`<div class="ws${k===wheelSel?' on':''}${own?'':' no'}" data-k="${k}" style="left:${200+x-48}px;top:${200+y-30}px"><i>${(k+1)%10}</i>${w.name}</div>`;});
 e.innerHTML=h;}
function tankTick(dt){const c=P.inCar;tankCD-=dt;if(!c||c.vt!=='tank')return;c.turret.rotation.y=lerpAng(c.turret.rotation.y,camYaw-c.h,dt*2.5);
 if(fireHeld&&tankCD<=0){tankCD=1.6;const a=c.h+c.turret.rotation.y;const from=new THREE.Vector3(c.pos.x-Math.sin(c.h)*.25+Math.sin(a)*6.2,c.g.position.y+2.1,c.pos.z-Math.cos(c.h)*.25+Math.cos(a)*6.2);
  const o=camera.position.clone(),d=new THREE.Vector3();camera.getWorldDirection(d);let tgt=raycast(o,d,500,c).point;if(tgt.distanceTo(from)<6)tgt=from.clone().add(tmpV.set(Math.sin(a)*60,0,Math.cos(a)*60));
  fireRocket(from,tgt,'player',c);flash(from,2.2);boomSound(.45,from);shake=Math.max(shake,.35);smoke(from.clone(),2.5,.5,1.5);lastCombatT=time;}}
function gradeTick(dt){const want=P.dead?.12:1.16;grade.uniforms.sat.value+=(want-grade.uniforms.sat.value)*Math.min(1,dt*(P.dead?2.5:1.5));}
function partIdx(part,i){const mul=part.mul||1;return part.ix.map(k=>i*mul+k);}
function breakProp(s,dx,dz,sp){if(s.broken)return;s.broken=true;s.x0=s.x1=s.z0=s.z1=1e7;const g=s.bg,i=s.bi;if(!g||!g.parts.length)return;
 for(const part of g.parts){if(!part.orig)part.orig={};for(const ix of partIdx(part,i))if(!part.orig[ix]){const m=new THREE.Matrix4();part.im.getMatrixAt(ix,m);part.orig[ix]=m;}}
 fallingProps.push({g,i,t:0,dx,dz,v:Math.min(2.2,.8+sp*.04)});brokenProps.push({s,g,i,t:0});
 const p=g.pts[i];const at=new THREE.Vector3(p[0],1.2,p[1]);noiseBurst(.4,.35,700,.7,at);tone(240,.25,'triangle',.05,at);sparks(at);}
function setPropPose(g,i,dx,dz,th){const p=g.pts[i];const l=Math.hypot(dx,dz)||1;tmpQ.setFromAxisAngle(tmpV.set(dz/l,0,-dx/l),th);propR.makeRotationFromQuaternion(tmpQ);
 propPiv.makeTranslation(p[0],g.base,p[1]).multiply(propR).multiply(propT.makeTranslation(-p[0],-g.base,-p[1]));
 for(const part of g.parts){for(const ix of partIdx(part,i))if(part.orig&&part.orig[ix]){propM.multiplyMatrices(propPiv,part.orig[ix]);part.im.setMatrixAt(ix,propM);}part.im.instanceMatrix.needsUpdate=true;}}
function restoreProp(b){const g=b.g,i=b.i;for(const part of g.parts){for(const ix of partIdx(part,i))if(part.orig&&part.orig[ix])part.im.setMatrixAt(ix,part.orig[ix]);part.im.instanceMatrix.needsUpdate=true;}Object.assign(b.s,b.s.box);b.s.broken=false;}
function propFallTick(dt){for(let k=fallingProps.length-1;k>=0;k--){const f=fallingProps[k];f.t+=dt;const th=Math.min(1.5,f.t*f.t*4.5*f.v+f.t*f.v);setPropPose(f.g,f.i,f.dx,f.dz,th);if(th>=1.5){fallingProps.splice(k,1);const p=f.g.pts[f.i];tone(160,.18,'square',.03,new THREE.Vector3(p[0],0,p[1]));}}
 for(let k=brokenProps.length-1;k>=0;k--){const b=brokenProps[k];b.t+=dt;if(b.t<90||fallingProps.some(f=>f.g===b.g&&f.i===b.i))continue;const p=b.g.pts[b.i];if(Math.hypot(p[0]-P.pos.x,p[1]-P.pos.z)>170){restoreProp(b);brokenProps.splice(k,1);}}}

// ---------- Angefahrene Motorräder fliegen weg ----------
function launchBike(o,c){const sp=Math.abs(c.speed),sg=Math.sign(c.speed)||1,fx=Math.sin(c.h)*sg,fz=Math.cos(c.h)*sg,was=o.mode;
 o.mode='tumble';o.tumbleT=0;o.speed=0;o.y=o.g.position.y;o.vel=new THREE.Vector3(fx*sp*.75+(o.pos.x-c.pos.x)*.8,4+sp*.18,fz*sp*.75+(o.pos.z-c.pos.z)*.8);o.spin=new THREE.Vector3(RR(-6,6),RR(-4,4),RR(-8,8));
 o.hp=Math.max(40,o.hp-70);if(o.alarm){o.alarm=false;}
 if(o.rider){const at=o.g.position.clone();o.body.remove(o.rider.g);o.rider.dispose();o.rider=null;let p=null,best=-1;
  for(const n of peds){if(n.kind!=='civ'||n.state!=='walk'||n.mission||n.post||n.store)continue;const d=n.c.g.position.distanceTo(camera.position);if(d>best){best=d;p=n;}}
  if(p){p.c.g.position.set(at.x,at.y+.6,at.z);p.c.g.visible=true;knockOut(p,new THREE.Vector3(fx,0,fz),Math.min(14,sp*.45)+3);p.vel.y=5+sp*.1;tone(120,.12,'sine',.08,p.c.g.position);}
  if(was!=='parked'&&!o.racer)addHeat(1,false);}
 c.crashCD=time+.8;damageCar(c,Math.min(18,sp*.45),'crash');c.speed*=.9;crashSound(sp*.5);shake=Math.max(shake,.25);}
function tumbleTick(dt){for(const c of cars){if(c.mode!=='tumble')continue;c.tumbleT+=dt;const v=c.vel;v.y-=22*dt;c.pos.x+=v.x*dt;c.pos.z+=v.z*dt;c.y+=v.y*dt;
 if(collideCircle(c.pos,.8)){v.x*=-.35;v.z*=-.35;}const gy=groundY(c.pos.x,c.pos.z);
 if(c.y<=gy){c.y=gy;if(v.y<-4){v.y*=-.3;tone(200,.08,'square',.025,c.g.position);}else v.y=0;v.x*=.75;v.z*=.75;c.spin.multiplyScalar(.7);}
 c.body.rotation.x+=c.spin.x*dt;c.body.rotation.z+=c.spin.z*dt;c.h+=c.spin.y*dt;
 c.g.position.set(c.pos.x,c.y,c.pos.z);c.g.rotation.y=c.h;
 if(c.tumbleT>1.2&&Math.hypot(v.x,v.z)<1.2&&c.y<=gy+.05){c.mode='parked';c.dropped=true;c.speed=0;c.body.rotation.set(0,0,1.35);c.g.position.y=gy+.15;}}}
// ---------- Brennende Autos explodieren erst nach ein paar Sekunden ----------
function burnBail(c){c.mode='parked';c.dropped=true;c.speed=0;let p=null,best=-1;if(c.rider){c.body.remove(c.rider.g);c.rider.dispose();c.rider=null;}
 for(const n of peds){if(n.kind!=='civ'||n.state!=='walk'||n.mission||n.post||n.store)continue;const d=n.c.g.position.distanceTo(camera.position);if(d>best){best=d;p=n;}}
 if(p){const side=c.bike?1.3:2.6;p.c.g.position.set(c.pos.x-Math.cos(c.h)*side,groundY(c.pos.x,c.pos.z),c.pos.z+Math.sin(c.h)*side);p.c.g.visible=true;p.state='flee';p.fleeT=8;p.threat=c.pos.clone();npcSay(p,'burn',1);}}
function burnTick(dt){for(const c of cars){if(!(c.burning>0)||c.mode==='wreck')continue;c.burning-=dt;if(c.mode==='ai'||c.mode==='ring'||c.mode==='land')burnBail(c);
 if(c.g.visible&&Math.random()<dt*14){const fr=new THREE.Vector3(c.pos.x+Math.sin(c.h)*1.4+RR(-.5,.5),c.g.position.y+1.1+RR(0,.4),c.pos.z+Math.cos(c.h)*1.4+RR(-.5,.5));fire(fr,RR(1,1.8));if(Math.random()<.4)smoke(fr.clone().setY(fr.y+1),1.8,.12,2.5);}
 if(c.burning<=0){c.burning=0;c.hp=0;damageCar(c,1,'fire');}}}
function makeBarrier(x,z0,z1){const len=z1-z0;const pivot=new THREE.Group();pivot.position.set(x,1.1,z0);scene.add(pivot);
 const bar=new THREE.Mesh(new THREE.BoxGeometry(.22,.22,len),barMat);bar.position.z=len/2;bar.castShadow=true;pivot.add(bar);
 scene.add(mesh(new THREE.BoxGeometry(.7,1.3,.7),cm(0x3a3a3a,.5,.4),x,.65,z0-.5));
 const s=addSolid(x-.35,x+.35,z0,z1,1.4);return {x,z0,z1,pivot,s,box:{x0:s.x0,x1:s.x1,z0:s.z0,z1:s.z1},open:false,broken:false,rx:0};}
function openBarrier(B,broken){if(B.open)return;B.open=true;B.broken=!!broken;B.s.x0=B.s.x1=B.s.z0=B.s.z1=1e7;if(broken){crashSound(18);sparks(new THREE.Vector3(B.x,1.1,(B.z0+B.z1)/2));}else tone(400,.3,'square',.03);}
function closeBarrier(B){B.open=false;B.broken=false;Object.assign(B.s,B.box);B.pivot.rotation.set(0,0,0);B.pivot.position.y=1.1;}
function barrierTick(B,dt){const want=B.open?(B.broken?-1.25:-1.45):0;B.pivot.rotation.x+=(want-B.pivot.rotation.x)*Math.min(1,dt*3);if(B.broken){B.pivot.rotation.z+=(.5-B.pivot.rotation.z)*Math.min(1,dt*3);}
 if(B.rammed){B.rammed=false;return true;}return false;}
function barrierRam(c){for(const B of [APT.bar,MILS.bar]){if(!B||B.open)continue;if(Math.abs(c.pos.x-B.x)<c.rad+2.2&&c.pos.z>B.z0-1.5&&c.pos.z<B.z1+1.5){openBarrier(B,true);B.rammed=true;return true;}}return false;}
// Wachen mit festem Posten (Sicherheitsdienst / Soldaten)
function spawnPost(o){const p=makeCiv(true,false);scene.remove(p.c.g);p.c.dispose();const sk=randomSkin();sk.topC=o.top;sk.pantsC=o.pants;sk.extra=o.extra??3;sk.frisur=o.hair??0;p.c=buildChar(sk);scene.add(p.c.g);
 p.post={x:o.x,z:o.z,ry:o.ry||0,zone:o.zone,alarm:o.alarm,pa:o.pa,pb:o.pb};p.mission=false;p.hp=o.hp||100;p.maxHp0=p.hp;armNPC(p,o.weapon||'pistol');p.armed=true;p.wdmg=o.wdmg||7;p.wrate=o.wrate||1;p.label=null;
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:exclTex,transparent:true,depthTest:false,opacity:0}));s.scale.setScalar(.7);s.position.y=2.45;p.c.g.add(s);p.excl=s;
 resetPost(p);peds.push(p);return p;}
function resetPost(n){const o=n.post;n.c.g.position.set(o.x,groundY(o.x,o.z),o.z);n.c.g.rotation.set(0,o.ry,0);n.hp=n.maxHp0||100;n.stagger=0;n.downOnce=false;n.dropped=false;n.sus=0;n.c.g.visible=true;
 if(o.pa){n.state='patrol';n.pa=o.pa;n.pb=o.pb;n.pdir=true;n.pwait=0;}else n.state='guard';if(n.excl)n.excl.material.opacity=0;}
function toPost(n){if(n.state==='ko'||n.state==='fly')return;const o=n.post;n.sus=0;if(n.excl)n.excl.material.opacity=0;if(Math.hypot(n.c.g.position.x-o.x,n.c.g.position.z-o.z)>25&&Math.hypot(n.c.g.position.x-P.pos.x,n.c.g.position.z-P.pos.z)>60)resetPost(n);else n.state=o.pa?'patrol':'guard';}
function postAlert(n){return n.post.zone==='mil'?MILS.alert:n.post.zone==='apt'?APT.alarm:false;}
function airportAccess(){const st=mission&&mission.steps[si];return !!(st&&st.airport)||(activity&&activity.type==='flight')||PROG.air.length>0;}
function airportAlarm(why){if(APT.alarm)return;APT.alarm=true;big('SICHERHEITSALARM',why||'Der Sicherheitsdienst hat dich entdeckt!','#ff5050');alarmAt(new THREE.Vector3(P.pos.x,2,P.pos.z),6);if(!noHeat())setWanted(Math.max(wanted,2));
 for(const n of APT.guards)if(n.state==='guard'||n.state==='patrol'){n.state='fight';npcSay(n,'cop',1);}}
function initAirport(){const al=()=>{if(!airportAccess())airportAlarm('Ein Wachmann wurde angegriffen!');};
 const G=(x,z,ry,pa,pb)=>APT.guards.push(spawnPost({x,z,ry,pa,pb,zone:'apt',alarm:al,top:0x6f8fb3,pants:0x1f2a3a,extra:3,weapon:'pistol'}));
 G(APT.x0-9,-14,-Math.PI/2);G(APT.x0+9,13,-Math.PI/2);
 G(612,190,0,{x:612,z:190},{x:612,z:310});G(705,-40,0,{x:705,z:-40},{x:705,z:110});G(850,-210,0,{x:850,z:-210},{x:850,z:190});G(760,330,0,{x:640,z:350},{x:880,z:350});
 APT.bar=makeBarrier(APT.x0,-9,9);
 const sg=new THREE.Group();sg.position.set(APT.x0,0,246);scene.add(sg);const gm=cm(0x8a9097,.5,.6);
 sg.add(mesh(new THREE.BoxGeometry(.12,2.6,8),gm,0,1.3,4,false));for(let k=0;k<5;k++)sg.add(mesh(new THREE.BoxGeometry(.18,2.8,.12),gm,0,1.4,k*2,false));
 APT.side={g:sg,s:addSolid(APT.x0-.3,APT.x0+.3,246,254,3),box:null,open:false};APT.side.box={x0:APT.side.s.x0,x1:APT.side.s.x1,z0:APT.side.s.z0,z1:APT.side.s.z1};
 addInteract({x:APT.x0-3.2,z:250,r:2.6,label:'Schloss knacken (Hintereingang)',cond:()=>!APT.side.open&&!APT.pick,use(){APT.pick={t:0};return false;}});
 addInteract({x:APT.x0+3.2,z:250,r:2.6,label:'Tor von innen öffnen',cond:()=>!APT.side.open,use(){openSide();return false;}});
 addInteract({x:APT.x0-9,z:-19,r:2.4,label:'Schranke öffnen',cond:()=>!APT.bar.open,use(){openBarrier(APT.bar,false);if(!airportAccess()&&APT.guards.slice(0,2).some(n=>n.state!=='ko'&&n.state!=='fly'))airportAlarm('Der Wachmann am Tor hat dich gesehen!');return false;}});}
function openSide(){if(APT.side.open)return;APT.side.open=true;const s=APT.side.s;s.x0=s.x1=s.z0=s.z1=1e7;tone(300,.2,'square',.03);}
function airportTick(dt){const inside=aptIn(P.pos.x,P.pos.z)&&!P.inAir&&!P.dead&&P.pos.y<40;
 if(APT.pick){const d=Math.hypot(P.pos.x-(APT.x0-3.2),P.pos.z-250);if(d>3||P.inCar||P.dead){APT.pick=null;toast('Abgebrochen');}else{APT.pick.t+=dt;setProg('Schloss knacken …',APT.pick.t/4,'#9fe8ff');if(Math.random()<dt*5)tone(1800+Math.random()*900,.03,'square',.012);if(APT.pick.t>=4){APT.pick=null;openSide();toast('Das Tor ist offen – sei leise!');}}}
 if(barrierTick(APT.bar,dt)&&!airportAccess())airportAlarm('Du hast die Schranke durchbrochen!');
 const g=APT.side.g;g.rotation.y+=((APT.side.open?-1.5:0)-g.rotation.y)*Math.min(1,dt*2);
 if(APT.alarm){if(wanted===0&&!inside){APT.alarm=false;for(const n of APT.guards)toPost(n);}}
 else if((inside||APT.pick)&&!airportAccess()){if(stealthTick(APT.guards,dt))airportAlarm();else if(inside){APT.camT+=dt;if(APT.camT>35)airportAlarm('Eine Überwachungskamera hat dich erfasst!');}
  if(inside&&APT.hintT<=0){APT.hintT=60;toast('Flughafen: Lass dich nicht vom Sicherheitsdienst sehen!');}}
 else{APT.camT=Math.max(0,APT.camT-dt*.5);for(const n of APT.guards)if(n.excl&&n.sus>0){n.sus=Math.max(0,n.sus-dt*.5);n.excl.material.opacity=n.sus>0?.35+n.sus*.65:0;}}
 APT.hintT-=dt;
 if(!APT.alarm&&!inside){if(APT.bar.open&&Math.hypot(P.pos.x-APT.x0,P.pos.z)>260)closeBarrier(APT.bar);if(APT.side.open&&Math.hypot(P.pos.x-APT.x0,P.pos.z-250)>220){APT.side.open=false;Object.assign(APT.side.s,APT.side.box);}}}
function milPass(){const st=mission&&mission.steps[si];return !!(st&&st.mil)||noHeat();}
function milAlert(why){if(MILS.alert)return;MILS.alert=true;if(!milPass())setWanted(Math.max(wanted,4));big('FORT ADLER',why||'Eindringling! Das Militär eröffnet das Feuer!','#ff5050');
 for(const n of MILS.soldiers)if(n.state==='guard'||n.state==='patrol')n.state='fight';}
function initMilitary(){const z=ZONES.find(q=>q.military);MILS.z=z;const al=()=>milAlert();
 const S=(x,zz,ry,pa,pb)=>MILS.soldiers.push(spawnPost({x,z:zz,ry,pa,pb,zone:'mil',alarm:al,top:0x4b5a2e,pants:0x3d4a2a,extra:3,hair:6,weapon:'rifle',hp:140,wdmg:9,wrate:.55}));
 S(MIL.gate.x+8,MIL.gate.z-10,Math.PI/2);S(MIL.gate.x+8,MIL.gate.z+10,Math.PI/2);
 const SO=(x,zz,ry,pa,pb)=>S(x+MO.x,zz+MO.z,ry,pa&&{x:pa.x+MO.x,z:pa.z+MO.z},pb&&{x:pb.x+MO.x,z:pb.z+MO.z});
 SO(-480,-600,0,{x:-480,z:-590},{x:-480,z:-740});SO(-600,-560,0,{x:-740,z:-575},{x:-480,z:-575});SO(-650,-690,0,{x:-750,z:-690},{x:-560,z:-690});SO(-560,-620,0,{x:-560,z:-610},{x:-560,z:-740});SO(-700,-640,Math.PI/2);SO(-720,-700,0);
 MILS.bar=makeBarrier(MIL.gate.x,MIL.gate.z-6,MIL.gate.z+6);
 for(const t of MIL.tanks){const tk=makeTank();tk.mode='parked';tk.pos.set(t.x,0,t.z);tk.h=t.h;tk.g.position.set(t.x,groundY(t.x,t.z),t.z);tk.g.rotation.y=t.h;tk.keep=true;cars.push(tk);}
 {const j=makeCar(0x4b5320,false,'suv');j.mode='parked';j.pos.set(MIL.jeep.x,0,MIL.jeep.z);j.h=MIL.jeep.h;j.g.position.copy(j.pos);j.g.position.y=groundY(j.pos.x,j.pos.z);j.g.rotation.y=j.h;j.keep=true;cars.push(j);}
 const bm=new THREE.MeshBasicMaterial({color:0xfff4d0,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
 for(const [tx,tz] of [[z.x0+6,z.z0+6],[z.x1-6,z.z0+6],[z.x0+6,z.z1-6],[z.x1-6,z.z1-6]]){const piv=new THREE.Group();piv.position.set(tx,groundY(tx,tz)+12.4,tz);const cone=new THREE.Mesh(new THREE.ConeGeometry(7,60,16,1,true),bm);cone.rotation.x=Math.PI/2+.45;cone.position.set(0,-12,27);piv.add(cone);scene.add(piv);MILS.beams.push({piv,ph:Math.random()*6});}
 MILS.beamMat=bm;}
function milTick(dt){const z=MILS.z;if(!z)return;const x=P.pos.x,zz=P.pos.z,high=P.pos.y>300;
 const inside=!high&&x>z.x0&&x<z.x1&&zz>z.z0&&zz<z.z1,near=!high&&!inside&&x>z.x0-80&&x<z.x1+80&&zz>z.z0-80&&zz<z.z1+80;
 if(near&&!MILS.warned&&!MILS.alert&&!P.dead){MILS.warned=true;big('SPERRGEBIET','Militärgelände – Betreten verboten! Es wird geschossen!','#ffb000');tone(520,.25,'square',.04);}
 if(!near&&!inside)MILS.warned=false;
 if(inside&&!P.dead){if(!MILS.alert)milAlert();else if(wanted<4&&!milPass())setWanted(4);}
 if(barrierTick(MILS.bar,dt))milAlert('Du hast die Schranke von Fort Adler durchbrochen!');
 if(MILS.alert){MILS.sirenT-=dt;const cx=(z.x0+z.x1)/2,cz=(z.z0+z.z1)/2;if(MILS.sirenT<=0&&Math.hypot(x-cx,zz-cz)<380){MILS.sirenT=2.4;alarmAt(new THREE.Vector3(cx,8,cz),2.4);}
  if(wanted===0&&!inside){MILS.alert=false;for(const n of MILS.soldiers)toPost(n);}}
 if(!MILS.alert&&MILS.bar.open&&Math.hypot(x-MIL.gate.x,zz-MIL.gate.z)>220)closeBarrier(MILS.bar);
 MILS.beamMat.opacity=night*.16;if(night>.05)for(const b of MILS.beams){b.piv.rotation.y=Math.sin(time*.35+b.ph)*1.6+b.ph;}}
function enemyJetTick(dt){const want=P.inAir&&wanted>=4&&!P.dead?(wanted>=5?2:1):0;ejT-=dt;
 if(enemyJets.length<want&&ejT<=0){ejT=12;const a=makePlane(0x3d4450,true);a.enemy=true;a.mode='ai';a.hp=520;a.name='Abfangjäger';const ang=Math.random()*6.28;
  a.g.position.set(P.pos.x+Math.cos(ang)*900,Math.max(140,P.pos.y+70),P.pos.z+Math.sin(ang)*900);a.h=Math.atan2(P.pos.x-a.g.position.x,P.pos.z-a.g.position.z);a.p=0;a.speed=85;a.airborne=true;a.fireT=3;a.roll=0;aircraft.push(a);enemyJets.push(a);toast('Abfangjäger im Anflug!');}
 for(let i=enemyJets.length-1;i>=0;i--){const a=enemyJets[i];if(a.dead){enemyJets.splice(i,1);continue;}
  const leave=i>=want;let tx,ty,tz;
  if(leave){a.leaveT=(a.leaveT||0)+dt;tx=a.g.position.x+Math.sin(a.h)*600;tz=a.g.position.z+Math.cos(a.h)*600;ty=450;if(a.leaveT>15){scene.remove(a.g);const k=aircraft.indexOf(a);if(k>=0)aircraft.splice(k,1);enemyJets.splice(i,1);continue;}}
  else{a.leaveT=0;const t=P.inAir?P.inAir.g.position:P.pos;tx=t.x;ty=t.y;tz=t.z;}
  const dx=tx-a.g.position.x,dy=ty-a.g.position.y,dz=tz-a.g.position.z,dist=Math.hypot(dx,dy,dz);
  const wantH=Math.atan2(dx,dz),wantP=Math.atan2(dy,Math.hypot(dx,dz));const dH=angWrap(wantH-a.h);
  a.h+=clamp(dH,-.85*dt,.85*dt);a.p+=clamp(wantP-a.p,-.6*dt,.6*dt);a.p=clamp(a.p,-.55,.6);
  const gy=groundY(a.g.position.x,a.g.position.z);if(a.g.position.y<gy+45)a.p=Math.max(a.p,.35);
  a.speed+=((dist<160&&!leave?60:88)-a.speed)*Math.min(1,dt);const cp=Math.cos(a.p);
  a.g.position.x+=Math.sin(a.h)*cp*a.speed*dt;a.g.position.z+=Math.cos(a.h)*cp*a.speed*dt;a.g.position.y+=Math.sin(a.p)*a.speed*dt;
  a.roll+=(clamp(dH*2,-1,1)-a.roll)*Math.min(1,dt*2);a.g.rotation.set(-a.p,a.h,-a.roll*.8,'YXZ');if(a.glow)a.glow.material.emissiveIntensity=7;
  a.fireT-=dt;if(!leave&&dist<400&&a.fireT<=0){const f=airForward(a);tmpV.set(dx,dy,dz).normalize();if(f.dot(tmpV)>.965){a.fireT=.11;a.burst=(a.burst||0)+1;if(a.burst>12){a.burst=0;a.fireT=2.6;}
   const mz=a.g.position.clone().addScaledVector(f,7);const end=new THREE.Vector3(tx,ty,tz);if(Math.random()<.3)hurtPlayer(7,mz);else end.add(tmpV.set(RR(-5,5),RR(-3,3),RR(-5,5)));tracer(mz,end);gunSound(.08,'mg',mz);flash(mz,.9);lastCombatT=time;}}}}
function initBoats(){introBoat=makeBoat(0x1f5fbf);introBoat.mode='parked';introBoat.keep=true;introBoat.pos.set(JX+4.6,0,WATER_Z+22);introBoat.h=Math.PI;introBoat.g.position.copy(introBoat.pos);cars.push(introBoat);
 for(const [x,z,h,c] of [[PIERX+7.2,WATER_Z+40,Math.PI,0xc0392b],[PIERX-7.2,WATER_Z+52,Math.PI,0xf1c40f]]){const b=makeBoat(c);b.mode='parked';b.keep=true;b.pos.set(x,0,z);b.h=h;b.g.position.copy(b.pos);cars.push(b);}}
function initZones(){initAirport();initMilitary();initBoats();}
function setWeather(t,instant){if(!WX_TYPES[t])t='klar';WX.type=t;Object.assign(WX.target,WX_TYPES[t]);if(instant){WX.rain=WX.target.rain;WX.cloud=WX.target.cloud;WX.fog=WX.target.fog;WX.wet=WX.rain>.3?1:0;}}
function updateWeather(dt){
 WX.next-=dt;if(WX.next<=0){WX.next=RR(240,480);const r=Math.random();setWeather(earlyDay()?(r<.75?'klar':'wolkig'):r<.42?'klar':r<.64?'wolkig':r<.8?'regen':r<.9?'gewitter':'nebel');}
 if(earlyDay()&&WX.type!=='klar'&&WX.type!=='wolkig')setWeather('klar');
 const k=Math.min(1,dt*.07);WX.rain+=(WX.target.rain-WX.rain)*k;WX.cloud+=(WX.target.cloud-WX.cloud)*k;WX.fog+=(WX.target.fog-WX.fog)*k;
 WX.wet=clamp(WX.wet+(WX.rain>.2?dt*.05:-dt*.012),0,1);
 rainLines.visible=WX.rain>.03&&camera.position.y<160&&!interiorAt(camera.position.x,camera.position.z);
 if(rainLines.visible){rainU.uOp.value=Math.min(.55,WX.rain*.65)*(1-night*.35);}
 const sk=clamp((WX.cloud-.45)/.55,0,1),cam=camera.position;stormDrift+=dt*9;
 const ovA=clamp(sk*.45+WX.rain*.4,0,.9);ovDome.visible=ovA>.01;if(ovDome.visible){ovMat.opacity=ovA;ovDome.position.set(cam.x,cam.y-60,cam.z);const lv=(.16+.84*(1-night))*(1+(WX.flashT>0?5*WX.flashT:0));ovMat.color.setRGB(.42*lv,.44*lv,.48*lv);}
 const sa=sk*.96;stormMat.opacity=sa;const lv2=(.1+.9*(1-night))*(1-WX.rain*.35)*(1+(WX.flashT>0?4*WX.flashT:0));stormMat.color.setRGB(.2*lv2,.21*lv2,.24*lv2);
 for(const sp of storms){sp.visible=sa>.01;if(!sp.visible)continue;const u=sp.userData;sp.position.set(cam.x+((u.x+stormDrift-cam.x)%3200+4800)%3200-1600,u.y+Math.max(0,cam.y-120)*.0,cam.z+((u.z+stormDrift*.4-cam.z)%3200+4800)%3200-1600);}
 if(WX.type==='gewitter'&&WX.rain>.6){WX.boltT-=dt;if(WX.boltT<=0){WX.boltT=RR(5,14);WX.flashT=.3;setTimeout(thunder,RR(250,1400));}}
 WX.flashT=Math.max(0,WX.flashT-dt);}
function applyWeatherLight(){const c=WX.cloud,rn=WX.rain;sun.intensity*=(1-c*.62)*(1-rn*.55);hemi.intensity*=(1-c*.18)*(1-rn*.22);renderer.toneMappingExposure*=1-rn*.15;
 su.skyGain.value=.5*(1-c*.45)*(1-rn*.5)+(WX.flashT>0?1.6*WX.flashT/.3:0);
 const far=FOG_FAR(),alt=1+clamp((camera.position.y-40)/380,0,2.2);scene.fog.near=THREE.MathUtils.lerp(420,25,WX.fog)*(1-WX.rain*.45)*alt;scene.fog.far=THREE.MathUtils.lerp(far,300,WX.fog)*(1-WX.rain*.42)*alt;
 if(WX.flashT>0)hemi.intensity+=4*WX.flashT;
 tmpC.setRGB(.52,.56,.6);scene.fog.color.lerp(tmpC,c*.45*(1-night*.8));if(rn>.02){tmpC.setRGB(.3,.33,.37);scene.fog.color.lerp(tmpC,rn*.7*(1-night*.8));}
 cloudMat.color.multiplyScalar(1-c*.5);cloudMat.opacity=.85+c*.15;
 if(asphaltMat){asphaltMat.roughness=.88-WX.wet*.6;asphaltMat.metalness=WX.wet*.18;}}
function saveGame(silent){if(window.__NETON)return;try{const d={v:1,prog:PROG,biz:BIZ.active?{role:BIZ.role,owned:BIZ.owned,up:BIZ.up,safe:BIZ.safe,stock:BIZ.stock,pop:BIZ.pop,best:BIZ.best,rank:BIZ.rank}:undefined,money:Math.round(P.money),armor:Math.round(P.armor||0),inv:{owned:INV.owned,clip:INV.clip,ammo:INV.ammo,cur:INV.cur},tod,wx:WX.type,name:P.name,date:Date.now()};localStorage.setItem(SAVE_KEY(),JSON.stringify(d));saveIcoT=1.8;if(!silent)toast('Spielstand gespeichert');}catch(e){if(!silent)toast('Speichern nicht möglich');}}
function loadGame(key){try{const d=JSON.parse(localStorage.getItem(key||'portsolara_save_v1'));return d&&d.prog?d:null;}catch(e){return null;}}
function completion(){const parts=[[Math.min(PROG.mi,missions.length)/missions.length,40],[Math.min(PROG.taxi,10)/10,3],[PROG.vig/8,3],[PROG.para/8,3],[PROG.pizza/8,3],[PROG.exp.length/10,4],[PROG.bounty/6,4],[PROG.races.length/RACES.length,4],[PROG.flight.length/LESSONS.length,4],[PROG.fight/5,3],[Math.min(PROG.range,1),2],[PROG.robbed.length/stores.length,8],[PROG.stunts.length/STUNT_TOTAL(),7],[PROG.packages.length/30,9],[Math.min(PROG.truck,5)/5,2],[PROG.meteors.length/20,3],[PROG.views.length/8,2],[Math.min(PROG.skate,1),1]];
 let s=0,t=0;for(const [v,w] of parts){s+=clamp(v,0,1)*w;t+=w;}return Math.round(s/t*100);}
function isUnlocked(t){if(t==='biz')return BIZ.active;return storyDone||mi>=(UNLOCK_AT[t]??0);}
function unlockTick(dt){unlockCheckT-=dt;if(unlockCheckT>0)return;unlockCheckT=1;if(PROG.unlockSeen==null)PROG.unlockSeen=mi;if(mission||bigT>0||PROG.unlockSeen>=mi)return;
 const L=[];for(const k in UNLOCK_AT){const v=UNLOCK_AT[k];if(v>PROG.unlockSeen&&v<=mi&&UNLOCK_NAMES[k])L.push(UNLOCK_NAMES[k]);}PROG.unlockSeen=mi;
 if(L.length){big('NEU FREIGESCHALTET',L.slice(0,4).join(' · ')+(L.length>4?' …':''),'#7fd1ff');passedJingle();say('Info','Neu in der Stadt: '+L.join(', ')+'. Schau auf die Karte (M)!');saveGame(true);}}
function addInteract(o){interacts.push(o);return o;}
function removeInteracts(missionOnly){for(let i=interacts.length-1;i>=0;i--)if(!missionOnly||interacts[i].mission)interacts.splice(i,1);}
function initPlaces(){for(const p of places){if(p.r<=0)continue;const col=new THREE.Color(p.col);
 const m=new THREE.Mesh(placeMarkGeo,new THREE.MeshBasicMaterial({color:col.clone().multiplyScalar(2.2),transparent:true,opacity:.8,depthWrite:false}));m.scale.setScalar(p.r);m.position.set(p.x,groundY(p.x,p.z)+.08,p.z);scene.add(m);p.mark=m;
 const lab=new THREE.Sprite(new THREE.SpriteMaterial({map:labelTex(p.label,p.col),transparent:true,depthWrite:false,fog:false}));lab.position.set(p.x,groundY(p.x,p.z)+2.6,p.z);lab.scale.setScalar(1.1);scene.add(lab);p.lab=lab;}}
function nearAction(){if(P.dead||P.inAir||P.ride)return null;
 for(const it of interacts){if(P.inCar&&!it.car)continue;if(Math.hypot(P.pos.x-it.x,P.pos.z-it.z)<it.r&&(!it.cond||it.cond()))return {label:it.label,run:()=>{if(it.use()){const i=interacts.indexOf(it);if(i>=0)interacts.splice(i,1);}}};}
 for(const p of places){if(p.r<=0)continue;const d=Math.hypot(P.pos.x-p.x,P.pos.z-p.z);if(d>p.r+.8)continue;
  if(!isUnlocked(p.type))continue;
  if(P.inCar){if(p.type==='garage')return {label:'Wagen einstellen',run:()=>storeCar()};continue;}
  if(p.type==='respray')continue;const h=PLACE_HINT[p.type];if(h&&PLACE_ACT[p.type])return {label:h,run:()=>PLACE_ACT[p.type](p)};}
 return null;}
function interactKey(){if(mode!=='play'||P.ride)return;const a=nearAction();if(a){a.run();return;}toggleCar();}
function openPanel(title,items,info){panelOpen={items,info};$('ptitle').textContent=title;renderPanel();$('panel').style.display='flex';mode='menu';for(const k in K)K[k]=false;try{document.exitPointerLock();}catch(e){}aimHeld=false;fireHeld=false;uiClick();}
function renderPanel(){const p=panelOpen;if(!p)return;const items=p.items();p._items=items;
 $('pbody').innerHTML=(p.info?`<div class="pinfo">${p.info()}</div>`:'')+items.map((it,i)=>`<button class="pi${it.dis?' dis':''}" data-i="${i}"><span>${it.label}${it.sub?`<small>${it.sub}</small>`:''}</span><b>${it.price?'$'+it.price.toLocaleString('de-DE'):(it.right||'')}</b></button>`).join('');
 $('pmoney').textContent='$'+Math.round(P.money).toLocaleString('de-DE');}
function closePanel(){if(!panelOpen)return;panelOpen=null;$('panel').style.display='none';if(mode==='menu'&&!pauseOpen){mode='play';last=performance.now();lockMouse();}}
function openGunshop(p){speakAs('Verkäufer','Willkommen bei Kowalski. Was darf es sein?');
 openPanel(p.name,()=>{const L=[];for(const id in GUN_SHOP){const w=WEAPONS[WI[id]];const own=INV.owned[id];
   if(!own)L.push({label:w.name,sub:w.melee?'Nahkampf':GUN_SHOP[id][1]?`inkl. ${GUN_SHOP[id][1]} Schuss`:'',price:GUN_SHOP[id][0],act(){giveWeapon(id,GUN_SHOP[id][1]);selectWeapon(WI[id]);toast(w.name+' gekauft!');}});
   else if(AMMO_SHOP[id]&&id!=='grenade')L.push({label:'Munition: '+w.name,sub:`+${AMMO_SHOP[id][1]} · Vorrat ${(INV.clip[id]||0)+(INV.ammo[id]||0)}`,price:AMMO_SHOP[id][0],act(){giveWeapon(id,AMMO_SHOP[id][1]);}});
   else if(id==='grenade')L.push({label:'Granaten',sub:`+5 · Vorrat ${INV.ammo.grenade||0}`,price:AMMO_SHOP.grenade[0],act(){giveWeapon('grenade',5);attachWeapon();}});
   else L.push({label:w.name,sub:'schon gekauft',dis:true,right:'✓'});}
  L.push({label:'Schutzweste',sub:`fängt 70 % Schaden ab · aktuell ${Math.round(P.armor||0)} %`,price:350,dis:(P.armor||0)>=100,act(){P.armor=100;}});
  return L;},()=>'Tasten <k>1</k>–<k>9</k>, <k>0</k> oder Mausrad wechseln die Waffe.');}
function spawnOwnedAir(k){const s=OWN_AIR_SPOT[k];const a=placeAir(k==='heli'?makeHeli(0x1abc9c,false):makePlane(0x2c3e50,false),s.x+RR(-6,6),s.z,s.h);a.keep=true;a.owned=true;return a;}
function openDealer(p){const sp=SPECIAL['12,6'];speakAs('Verkäufer','Willkommen bei Hyperion! Suchen Sie etwas Schnelles?');
 openPanel(p.name,()=>{const L=DEALER_CARS.map(vt=>({label:VST[vt].name,sub:`Spitze ${Math.round(VST[vt].max*3.6)} km/h · ${PROG.cars.filter(c=>c.vt===vt).length?'schon in deiner Garage':'wird geliefert'}`,price:VST[vt].price,act(){const col=pick(NICE_COLORS);PROG.cars.push({vt,color:col});const c=parkedCar(sp.spawn.x,sp.spawn.z,Math.PI/2,col,vt);c.keep=true;c.owned=true;big('GEKAUFT!',VST[vt].name+' steht vor der Tür','#7dff8a');saveGame(true);closePanel();}}));
  for(const k in AIR_SHOP)L.push({label:AIR_SHOP[k].name,sub:PROG.air.includes(k)?'gehört dir (Flughafen)':'wird am Flughafen geliefert',price:PROG.air.includes(k)?0:AIR_SHOP[k].price,dis:PROG.air.includes(k),right:PROG.air.includes(k)?'✓':'',act(){PROG.air.push(k);spawnOwnedAir(k);big('GEKAUFT!',AIR_SHOP[k].name+' steht am Flughafen','#7dff8a');saveGame(true);}});
  return L;},()=>'Gekaufte Fahrzeuge kannst du jederzeit in deiner <b>Garage</b> (G auf der Karte) abholen.');}
function storeCar(){const c=P.inCar;if(!c)return;if(c.police||c.vt==='armored'||c.vt==='ambulance'){toast('Diesen Wagen will keiner in seiner Garage …');return;}
 if(Math.abs(c.speed)>3){toast('Erst anhalten!');return;}if(wanted>0){toast('Häng erst die Polizei ab!');return;}
 const col=c.bodyMesh.material.color?c.bodyMesh.material.color.getHex():0x888888;if(!c.owned)PROG.cars.push({vt:c.vt,color:col});exitCar(true);removeCar(c);if(garageCar===c)garageCar=null;big('EINGESTELLT',(VST[c.vt]||VST.sedan).name+' steht jetzt in deiner Garage','#cfd8ff');saveGame(true);}
function openGarage(p){const sp=SPECIAL['3,5'];
 openPanel('Deine Garage',()=>{if(!PROG.cars.length)return [{label:'Deine Garage ist leer',sub:'Kauf Autos im Autohaus oder stell geklaute Autos hier ab (mit dem Auto in den Kreis fahren und E drücken).',dis:true}];
  return PROG.cars.map((o,i)=>({label:(VST[o.vt]||VST.sedan).name,sub:'Wagen holen',right:'▶',act(){if(garageCar&&garageCar!==P.inCar&&cars.includes(garageCar))removeCar(garageCar);const c=parkedCar(sp.carSpawn.x,sp.carSpawn.z,Math.PI/2,o.color,o.vt);c.keep=true;c.owned=true;garageCar=c;closePanel();toast('Dein Wagen steht bereit');}}));});}

// ---------- Essen, Wohnung, Kino, Club ----------
function eat(hp){P.hp=Math.min(100,P.hp+hp);tone(300,.08,'sine',.05);setTimeout(()=>tone(260,.08,'sine',.05),120);toast('+'+hp+' Gesundheit');}
function openBurger(p){speakAs('Verkäufer','Hallo! Einmal das Übliche?');openPanel(p.name,()=>[{label:'Burger',sub:'+30 Gesundheit',price:8,act(){eat(30);}},{label:'Salat',sub:'+20 Gesundheit',price:6,act(){eat(20);}},{label:'Großes Menü',sub:'+100 Gesundheit',price:20,act(){eat(100);}},{label:'Milchshake',sub:'+15 Gesundheit',price:4,act(){eat(15);}}]);}
function fadeSkip(hours,text,col='#000'){const f=$('blackout');f.style.background=col;f.style.opacity=1;setTimeout(()=>{tod=(tod+hours/24)%1;lastEnvTod=-1;f.style.opacity=0;if(text)big(text[0],text[1],'#ffb35c');},1300);}
function openSafehouse(p){openPanel('Deine Wohnung',()=>[
 {label:'Spiel speichern',sub:'Dein Fortschritt wird im Browser gespeichert',right:'💾',act(){saveGame(false);}},
 {label:'Schlafen (8 Stunden)',sub:'Gesundheit auffüllen und speichern',right:'🛏',act(){closePanel();P.hp=100;fadeSkip(8,['AUSGESCHLAFEN','Spiel gespeichert']);setTimeout(()=>saveGame(true),1500);}},
 {label:'Fortschritt',sub:`${completion()} % abgeschlossen · Pausemenü (P) zeigt Details`,dis:true,right:'📊'}]);}
function openCinema(p){openPanel('Kino Palast',()=>FILMS.map(f=>({label:f[0],sub:f[1],price:15,act(){closePanel();PROG.movies++;P.hp=Math.min(100,P.hp+20);fadeSkip(2,['FILM GESEHEN','„'+f[0]+'“ war super!']);}})));}
function openClub(p){openPanel('Club NEON',()=>[{label:'Die Nacht durchtanzen',sub:'Spaß bis zum Morgen',price:20,act(){closePanel();fadeSkip(5,['WAS FÜR EINE NACHT!','Du hast getanzt bis zum Morgen'],'#300040');}},{label:'Saft-Cocktail',sub:'+10 Gesundheit',price:5,act(){eat(10);}}]);}
function rideMsg(){toast('Steig aus und geh hin');}
function makeClerk(st){const sk=randomSkin();sk.topC=st.kind==='gas'?0xc0392b:0x2e86de;sk.extra=0;const c=buildChar(sk);scene.add(c.g);
 const n={c,kind:'clerk',hp:100,state:'clerk',vel:new THREE.Vector3(),timer:0,phase:0,atkT:0,stagger:0,store:st};peds.push(n);st.clerkN=n;resetClerk(n);
 const fx=st.clerk.ry===0?1:-1;addInteract({x:st.counter.x,z:st.counter.z+fx*1.6,r:1.7,label:'Snack kaufen ($5)',cond:()=>n.state==='clerk'&&!rob&&isUnlocked('store'),use(){if(P.money<5){toast('Nicht genug Geld!');return false;}P.money-=5;cashSound();eat(25);npcSay(n,'clerk');return false;}});return n;}
function resetClerk(n){const st=n.store,k=st.clerk;n.c.g.position.set(k.x,groundY(k.x,k.z),k.z);n.c.g.rotation.set(0,k.ry,0);n.state='clerk';n.hp=100;n.stagger=0;n.c.g.visible=true;n.dropped=false;n.downOnce=false;n.resetAt=0;n.c.armL.rotation.x=n.c.armR.rotation.x=0;}
function startRobbery(st){if(rob)return;if(st.cool>time){if(!st.coolMsg||time>st.coolMsg){st.coolMsg=time+5;toast('Die Kasse ist leer – komm später wieder');}return;}
 const n=st.clerkN;rob={st,t:0};ipStorePanic(st);n.state='handsup';n.hT=99;npcSay(n,'handsup',2);if(wanted===0&&Math.random()<.5)setTimeout(()=>{if(rob&&rob.st===st)toast('Der Kassierer hat den stillen Alarm gedrückt!');},2000);}
function endRob(){if(!rob)return;const st=rob.st,n=st.clerkN;n.resetAt=Math.max(n.resetAt||0,time+300);st.cool=Math.max(st.cool||0,time+300);rob=null;}
function robTick(dt){
 for(const st0 of stores){const n0=st0.clerkN;if(n0&&n0.resetAt>0&&time>=n0.resetAt&&Math.hypot(P.pos.x-st0.cx,P.pos.z-st0.cz)>100&&(!rob||rob.st!==st0)){resetClerk(n0);toast('Der Laden hat wieder geöffnet');}}
 if(!rob)return;const st=rob.st,n=st.clerkN;
 if(n.state==='ko'||n.state==='fly'){toast('Der Kassierer ist K.O. – die Kasse bleibt zu!');setWanted(Math.max(wanted,1));st.cool=time+300;endRob();return;}
 const d=Math.hypot(P.pos.x-n.c.g.position.x,P.pos.z-n.c.g.position.z);
 if(d>15||P.inCar||P.dead){toast('Überfall abgebrochen');endRob();return;}
 rob.t+=dt*(aiming()?1:.3);setProg(rob.t<2.5?'Kassierer öffnet die Kasse …':rob.t<5?'Geld wird aus der Kasse genommen …':'Bargeld wird übergeben …',rob.t/6,'#ffd23a');
 if(rob.t>=6){const amt=Math.round(st.kind==='gas'?RR(400,950):RR(250,650));P.money+=amt;cashSound();cashPop('+$'+amt);big('ÜBERFALL!',`${st.name}: +$${amt}`,'#7dff8a');st.cool=time+300;
  if(!PROG.robbed.includes(st.id)){PROG.robbed.push(st.id);toast(`Überfälle: ${PROG.robbed.length}/${stores.length}`);}
  alarmAt(new THREE.Vector3(st.cx,2,st.cz),10);setWanted(Math.max(wanted,2));endRob();saveGame(true);}}
function aimTick(dt){aimCheckT-=dt;if(aimCheckT>0)return;aimCheckT=.15;if(!aiming())return;
 const o=camera.position,d=new THREE.Vector3();camera.getWorldDirection(d);let best=null,bt=35;
 for(const n of peds){if(n.kind==='dummy'||n.state==='ko'||n.state==='fly'||n.state==='ride'||!n.c.g.visible)continue;const t=charHit(o,d,n.c.g.position,bt,.75,1.9);if(t>=0&&t<bt){bt=t;best=n;}}
 if(!best)return;const n=best;
 if(n.ip){ipAimed(n);return;}
 if(n.kind==='clerk'){if(!isUnlocked('store')){if(!n.store.lockMsg||time>n.store.lockMsg){n.store.lockMsg=time+8;toast('Überfälle schaltest du in der Story frei');}return;}if(n.state==='clerk'&&n.store.inside(P.pos.x,P.pos.z)||n.state==='clerk'&&bt<10)startRobbery(n.store);}
 else if(n.kind==='cop'){if(wanted===0)addHeat(1,true);}
 else if(n.kind==='civ'&&!n.mission&&!n.patient&&!n.fare){if(n.state==='idle'){idleToFlee(n,P.pos);n.state='handsup';n.hT=3.5;npcSay(n,'handsup');}else if(n.state==='walk'||n.state==='wait'){propsOff(n);if(n.aggro){n.state='fight';npcSay(n,'thug',1);}else{n.state='handsup';n.hT=3.5;npcSay(n,'handsup');}}}}

// ---------- Umlackieren ----------
function resprayTick(dt){if(!P.inCar)return;const c=P.inCar;
 if(!isUnlocked('respray'))return;
 for(const p of places){if(p.type!=='respray')continue;const d=Math.hypot(P.pos.x-p.x,P.pos.z-p.z);if(d>p.r){if(p.used&&d>p.r+6)p.used=false;continue;}
  if(p.used||Math.abs(c.speed)>6)continue;p.used=true;
  if(c.police){toast('Einen Streifenwagen lackieren wir nicht!');continue;}
  if(P.money<100){toast('Neu lackieren kostet $100');continue;}
  P.money-=100;const col=pick(NICE_COLORS);c.bodyMesh.material=paint(col);c.hp=c.maxHp;const had=wanted>0;setWanted(0);
  noiseBurst(1.2,.25,2500,.6);setTimeout(()=>cashSound(),900);big('NEU LACKIERT',had?'Fahndung gelöscht · -$100':'Wagen repariert · -$100','#3fdc7a');}}

// ---------- Autoalarm & Anzeigen ----------
function carAlarm(c){alarmAt(new THREE.Vector3(c.pos.x,1,c.pos.z),8);toast('Alarmanlage!');if(Math.random()<.6)setTimeout(()=>{if(mode==='play'&&P.inCar===c)addHeat(1,false);},2500);}
function showVehicleName(n){const e=$('vehname');if(!e)return;e.textContent=n;e.style.opacity=1;clearTimeout(e._t);e._t=setTimeout(()=>e.style.opacity=0,2600);}
function setProg(label,f,col='#ffd23a'){const e=$('prog');e.style.display='block';e.querySelector('.pl').textContent=label;const fl=e.querySelector('.pf');fl.style.width=(clamp(f,0,1)*100)+'%';fl.style.background=col;progT=.3;}
function hideProg(){$('prog').style.display='none';progT=0;}
function dropCrate(p){const g=new THREE.Group();g.add(mesh(new THREE.BoxGeometry(1.4,1.4,1.4),cm(0x8b6b3a,.8),0,0,0));const ch=new THREE.Mesh(new THREE.SphereGeometry(2.4,14,6,0,Math.PI*2,0,Math.PI/2),cm(0xe74c3c,.8));ch.position.y=3.4;g.add(ch);
 for(const [x,z] of [[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]])g.add(mesh(new THREE.BoxGeometry(.03,3,.03),cm(0xdddddd,.5),x*.6,1.8,z*.6,false));g.position.copy(p);scene.add(g);crates.push({g,ch,landed:false});}
function updateCrates(dt){for(const c of crates){if(c.landed)continue;const p=c.g.position;const gy=groundY(p.x,p.z);p.y-=4*dt;c.g.rotation.y+=dt*.4;if(p.y<=gy+.7){p.y=gy+.7;c.landed=true;c.ch.visible=false;smoke(p.clone(),2,.6,3);}}}
function initPackages(){for(const s of packageSpots){if(PROG.packages.includes(s.id)){s.m=null;continue;}if(s.m)continue;const m=new THREE.Mesh(pkgGeo,pkgMat);m.position.set(s.x,s.y+.7,s.z);m.castShadow=true;scene.add(m);s.m=m;}}
function packagesTick(dt){for(const s of packageSpots){if(!s.m)continue;if(Math.abs(s.x-P.pos.x)>120||Math.abs(s.z-P.pos.z)>120){continue;}s.m.rotation.y+=dt*1.6;s.m.position.y=s.y+.7+Math.sin(time*2+s.id)*.15;
 if(Math.hypot(s.x-P.pos.x,s.z-P.pos.z)<(P.inCar?2.6:1.5)&&Math.abs(P.pos.y-s.y)<3){scene.remove(s.m);s.m=null;PROG.packages.push(s.id);P.money+=100;pickupSound();cashPop('+$100');
  const n=PROG.packages.length;big('VERSTECKTES PAKET',`${n}/30 gefunden`,'#3cff6a');if(n===10){giveWeapon('rifle',120);toast('Belohnung: Sturmgewehr!');}if(n===20){P.armor=100;giveWeapon('rpg',6);toast('Belohnung: Raketenwerfer!');}if(n===30){P.money+=25000;big('ALLE 30 PAKETE!','+$25.000','#3cff6a');}saveGame(true);}}}

// ---------- Freizeitpark ----------
function funTick(dt){const w=funObjs.wheel,ca=funObjs.carousel,co=funObjs.coaster;
 if(w){w.g.rotation.x+=dt*.07;for(const g of w.gond)g.rotation.x=-w.g.rotation.x;}
 if(ca){ca.g.rotation.y+=dt*.5;for(const h of ca.horses)h.hb.position.y=1.6+Math.sin(time*2.4+h.ph)*.35;}
 if(co){co.u=(co.u+dt*(.018+Math.max(0,-(co.curve.getTangentAt(co.u).y))*.03))%1;for(let k=0;k<co.train.length;k++){const u=(co.u-k*.006+1)%1;const p=co.curve.getPointAt(u),t=co.curve.getTangentAt(u);co.train[k].position.copy(p);co.train[k].lookAt(tmpV.copy(p).add(t));}}}
function startRide(type){if(P.money<(type==='coaster'?20:10)){toast('Nicht genug Geld!');return;}P.money-=type==='coaster'?20:10;cashSound();
 P.ride={type,t:0,u0:funObjs.coaster?funObjs.coaster.u:0,start:P.pos.clone()};P.char.g.visible=false;toast(type==='coaster'?'Festhalten!':'Genieß die Aussicht!');}
function rideTick(dt){const r=P.ride;r.t+=dt;
 if(r.type==='coaster'){const co=funObjs.coaster;const p=co.train[0].position;P.pos.set(p.x,p.y+.6,p.z);const t=co.curve.getTangentAt(co.u);camYaw=lerpAng(camYaw,Math.atan2(t.x,t.z),dt*3);if(r.t>2&&r.t>(1/.022))endRide();}
 else{const w=funObjs.wheel;const g=w.gond[0];g.getWorldPosition(tmpV);P.pos.set(tmpV.x,tmpV.y-2.4,tmpV.z);if(r.t>45)endRide();}}
function endRide(){const r=P.ride;P.ride=null;P.pos.copy(r.start);P.pos.y=groundY(P.pos.x,P.pos.z);P.char.g.visible=true;P.char.g.position.copy(P.pos);toast('Das war toll!');}
function canStartSide(){if(mission){toast('Beende zuerst deine Mission!');return false;}if(activity){toast('Beende zuerst deine Nebenmission (F)');return false;}if(race){toast('Du fährst gerade ein Rennen!');return false;}if(wanted>0){toast('Häng zuerst die Polizei ab!');return false;}return true;}
function startActivity(a){activity=a;big(a.title,a.sub||'','#ffb35c');passedJingle();if(a.start)a.start(a);return true;}
function endActivity(ok,reason){const a=activity;if(!a)return;activity=null;if(a.cleanup)a.cleanup(a);marker.visible=false;hideProg();if(reason)big(ok?'GESCHAFFT!':'NEBENMISSION BEENDET',reason,ok?'#7dff8a':'#ff9a3c');if(ok)passedJingle();else failJingle();saveGame(true);}
function activityTick(dt){if(activity&&activity.tick)activity.tick(activity,dt);}
function activityKey(){if(mode!=='play'||P.dead||P.ride)return;
 if(activity){endActivity(false,'Abgebrochen');return;}
 const c=P.inCar;const ok=c&&(c.vt==='taxi'||c.police||c.vt==='ambulance');
 if(!ok){toast('F startet Nebenjobs im Taxi, Streifenwagen oder Rettungswagen');return;}
 const need=c.vt==='taxi'?'taxi':c.police?'vig':'para';if(!isUnlocked(need)){toast('Diesen Nebenjob schaltest du später in der Story frei');return;}
 if(!canStartSide())return;
 if(c.vt==='taxi')startTaxi();else if(c.police)startVigilante();else startParamedic();}
function markAt(p){markerNext=null;marker.visible=true;marker.position.set(p.x,groundY(p.x,p.z),p.z);}
function curbPoint(minD,maxD){for(let t=0;t<60;t++){const b=pick(blockInfo);const s=Math.floor(Math.random()*4);const cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2;let x,z;
  if(s===0){x=cx;z=b.z0+1.6;}else if(s===1){x=cx;z=b.z1-1.6;}else if(s===2){x=b.x0+1.6;z=cz;}else{x=b.x1-1.6;z=cz;}
  const d=Math.hypot(x-P.pos.x,z-P.pos.z);if(d>=minD&&d<=maxD&&z<COAST-2)return {x,z};}return null;}
function spawnWaiter(p,patient){const n=makeCiv(false,false);n.c.g.position.set(p.x,groundY(p.x,p.z),p.z);n.timer=1e9;
 if(patient){n.patient=true;n.state='ko';n.c.g.rotation.set(-Math.PI/2,Math.random()*6,0);n.c.g.position.y+=.15;}else{n.fare=true;n.state='wait';}peds.push(n);return n;}
