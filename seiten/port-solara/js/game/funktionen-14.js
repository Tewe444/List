'use strict';
function boardIntroBoat(){const b=introBoat;b.mode='cine';P.char.g.visible=true;b.body.add(P.char.g);P.char.g.position.set(BOAT_SEAT.x,BOAT_SEAT.y,BOAT_SEAT.z);P.char.g.rotation.set(0,0,0);const ch=P.char;ch.armL.rotation.x=ch.armR.rotation.x=-1.05;}
function cineGuy(x,z,face,sk){const k=randomSkin();Object.assign(k,sk||{});const c=buildChar(k);c.g.position.set(x,groundY(x,z),z);c.g.rotation.y=face;scene.add(c.g);cineGroup.push(c);return c;}
function clearCineGroup(){for(const c of cineGroup){scene.remove(c.g);c.dispose();}cineGroup=[];if(cinePlane){scene.remove(cinePlane.g);cinePlane=null;}}
function cineCam(x,y,z,tx,ty,tz,fov=62){
 const dx=x-tx,dy=y-ty,dz=z-tz,len=Math.hypot(dx,dy,dz)||1;let safe=len;
 for(let d=.75;d<len;d+=.55){const px=tx+dx/len*d,py=ty+dy/len*d,pz=tz+dz/len*d;if(camBlocked(px,py,pz)){safe=Math.max(1.6,d-.85);break;}}
 const floor=groundY(tx+dx/len*safe,tz+dz/len*safe)+.6;const cy=Math.max(ty+dy/len*safe,floor);
 camera.position.set(tx+dx/len*safe,cy,tz+dz/len*safe);cineFocus.set(tx,ty,tz);camera.lookAt(cineFocus);
 if(Math.abs(camera.fov-fov)>.08){camera.fov+=(fov-camera.fov)*Math.min(1,cineDt*3.8);camera.updateProjectionMatrix();}
}
function cineTransition(){const w=$('cineWarp');w.classList.remove('cut');void w.offsetWidth;w.classList.add('cut');setTimeout(()=>w.classList.remove('cut'),460);}
function clearCineCombat(){
 if(cineCombat&&cineCombat.group){for(const n of cineCombat.group){const i=peds.indexOf(n);if(i>=0)peds.splice(i,1);if(n.c&&n.c.g){scene.remove(n.c.g);if(n.c.dispose)n.c.dispose();}}}
 if(cineCombat&&cineCombat.weapon){scene.remove(cineCombat.weapon);cineCombat.weapon.traverse(o=>{if(o.geometry&&o.geometry!==undefined&&o.geometry!==null&&o.geometry!==null)o.geometry.dispose();});}
 cineCombat=null;cineLookTouch=null;fireHeld=false;aimHeld=false;clearKeys();
 $('cineCombatControls').classList.remove('active');$('cineCross').classList.remove('active');$('cinePrompt').classList.remove('active');$('cineCockpit').classList.remove('active');
}
function beginCineCombat(){
 clearCineCombat();const X=BANK.cx,z0=BANK.z1+12,px=X,pz=z0+2;
 P.inCar=null;P.inAir=null;P.dead=false;P.hp=220;P.armor=100;P.vy=0;P.stunT=0;P.pos.set(px,groundY(px,pz),pz);P.face=0;camYaw=0;camPitch=.035;
 P.char.g.visible=false;P.char.g.position.copy(P.pos);P.char.g.rotation.set(0,0,0);
 giveWeapon('smg',180);selectWeapon(WI.smg);attachWeapon();
 const coords=[[-5,17],[0,21],[5,17],[-2,27],[7,25]],group=[];
 coords.forEach((q,k)=>{const n=spawnGang(X+q[0],z0+q[1],true,false,{weapon:k===2?'shotgun':'smg',hp:k===4?180:135,face:Math.PI,topC:0x343b46,pantsC:0x1d2631,extra:3});n.mission=false;n.aggro=true;n.state='fight';n.arrow&& (n.arrow.visible=false);n.wdmg=4.5;n.wrate=1.6;n.atkT=1.8+k*.22;group.push(n);});
 cineCombat={active:true,ready:false,t:0,group,doneAt:0,carExploded:false,shots:0,recoil:0,weapon:createCineViewWeapon()};
 scene.add(cineCombat.weapon);cineCombat.weapon.frustumCulled=false;
 $('cineCombatControls').classList.toggle('active',SET.input==='touch');$('cineCross').classList.remove('active');$('cinePrompt').textContent='';$('cinePrompt').classList.remove('active');
 $('cineCockpit').classList.remove('active');camera.fov=62;camera.updateProjectionMatrix();
}
function createCineViewWeapon(){
 const g=new THREE.Group();
 const dark=cm(0x171c23,.58,.42),steel=cm(0x48515d,.38,.72),grip=cm(0x292a2d,.9,0),sight=cm(0x111820,.3,.4),amber=cm(0xffa13a,.28,.35);
 const part=(geo,mat,x,y,z,rx=0,ry=0,rz=0)=>{const m=mesh(geo,mat,x,y,z,false);m.rotation.set(rx,ry,rz);g.add(m);return m;};
 part(new THREE.BoxGeometry(.15,.115,.39),dark,0,0,0);
 part(new THREE.BoxGeometry(.158,.018,.25),steel,0,.059,-.025);
 part(new THREE.CylinderGeometry(.024,.024,.29,12),steel,0,.005,-.31,Math.PI/2);
 part(new THREE.CylinderGeometry(.032,.032,.045,12),dark,0,.005,-.47,Math.PI/2);
 part(new THREE.BoxGeometry(.075,.18,.12),grip,0,-.13,.1,-.18);
 part(new THREE.BoxGeometry(.09,.15,.13),dark,0,-.13,-.045,-.12);
 part(new THREE.BoxGeometry(.07,.075,.12),grip,0,-.095,-.19);
 part(new THREE.BoxGeometry(.085,.025,.12),sight,0,.085,.025);
 part(new THREE.BoxGeometry(.045,.035,.045),amber,0,.103,-.005);
 part(new THREE.BoxGeometry(.055,.028,.045),steel,0,.065,-.22);
 g.scale.setScalar(.88);g.userData.baseY=-.255;g.userData.baseZ=-.58;return g;
}
function cineCombatCamera(){
 if(!cineCombat||!cineCombat.active)return;P.char.g.visible=false;
 camera.position.set(P.pos.x,P.pos.y+1.62,P.pos.z);
 const cp=Math.cos(camPitch),sp=Math.sin(camPitch),dir=new THREE.Vector3(Math.sin(camYaw)*cp,-sp,Math.cos(camYaw)*cp);
 camera.lookAt(camera.position.clone().addScaledVector(dir,70));
 if(shake>0){camera.position.x+=(Math.random()-.5)*shake*.55;camera.position.y+=(Math.random()-.5)*shake*.4;}camera.updateMatrixWorld(true);
 if(cineCombat.weapon){const kick=cineCombat.recoil||0;const local=new THREE.Vector3(.31,cineCombat.weapon.userData.baseY+kick*.38,cineCombat.weapon.userData.baseZ+kick);cineCombat.weapon.position.copy(camera.position).add(local.applyQuaternion(camera.quaternion));cineCombat.weapon.quaternion.copy(camera.quaternion);cineCombat.weapon.visible=true;}
 if(Math.abs(camera.fov-68)>.1){camera.fov+=(68-camera.fov)*Math.min(1,cineDt*8);camera.updateProjectionMatrix();}
}
function cineCombatTick(dt){
 const C=cineCombat;if(!C||!C.active)return;C.t+=dt;C.recoil=Math.max(0,(C.recoil||0)-dt*.85);
 if(!C.ready&&C.t>=1.25){C.ready=true;$('cineCross').classList.add('active');$('cineCombatControls').classList.toggle('active',SET.input==='touch');$('cinePrompt').textContent='';$('cinePrompt').classList.remove('active');if(AC){tone(310,.12,'sawtooth',.07);tone(520,.18,'triangle',.045);}}
 if(!C.ready)return;
 P.char.g.visible=false;cineCombatCamera();
 if(fireHeld&&curW().auto)tryFire();
 const down=C.group.length&&C.group.every(n=>n.downOnce);
 if(down&&!C.doneAt){C.doneAt=C.t+1.1;$('cinePrompt').textContent='WEG FREI';$('cinePrompt').classList.add('active');}
 if(C.t>13.2&&!C.doneAt){C.doneAt=C.t+.9;$('cinePrompt').textContent='WEITER';$('cinePrompt').classList.add('active');}
 if(C.doneAt&&C.t>=C.doneAt){const sh=SHOTS[shotI];if(sh)shotT=sh.d;}
}
function startIntro(){
 if(mode!=='creator'&&mode!=='title')return;clearCineCombat();cineRace=null;$('cineRaceHud').classList.remove('active','manual','takeover');$('cineCockpit').classList.remove('active');$('cineCombatControls').classList.remove('active');$('cineCross').classList.remove('active');$('cinePrompt').classList.remove('active');$('cineWarp').classList.remove('takeover');
 mode='cine';$('title').style.display='none';$('creator').style.display='none';$('cine').style.display='block';$('fade').style.opacity=1;$('mctitle').style.opacity=0;
 $('cineWarp').classList.remove('active');void $('cineWarp').offsetWidth;$('cineWarp').classList.add('active');setTimeout(()=>$('cineWarp').classList.remove('active'),2800);
 ensureAudio();cineT=0;shotI=0;shotT=0;camera.fov=50;camera.updateProjectionMatrix();
 if(SHOTS[0].start)SHOTS[0].start();ctext(SHOTS[0].txt);
}
function endCine(){
 if(mode!=='cine')return;
 if(cineRace){cineRace.active=false;cineRace.keys.clear();}cineRace=null;clearCineCombat();$('cineRaceHud').classList.remove('active','manual','takeover');$('cineWarp').classList.remove('active','takeover','cut');$('cineCockpit').classList.remove('active');$('cinePrompt').classList.remove('active');
 removeCine(...cineCars.slice());clearCineGroup();cineHide=null;shadowFocus=null;
 $('cine').style.display='none';$('ctitle').style.opacity=0;for(const id of ['cpre','ch1','cby'])$(id).style.opacity=0;const ct=$('ctext');ct.innerHTML='';ct.dataset.t='';ct.style.opacity=0;
 polRed.emissiveIntensity=0;polBlue.emissiveIntensity=0;
 if(AC){sirGain.gain.setTargetAtTime(0,AC.currentTime,.05);engGain.gain.setTargetAtTime(0,AC.currentTime,.05);}
 const b=introBoat;if(P.char.g.parent!==scene)scene.add(P.char.g);P.char.g.rotation.set(0,0,0);b.mode='parked';b.speed=0;b.pos.set(BOAT_DOCK.x,0,BOAT_DOCK.z);b.h=Math.PI;b.body.rotation.set(0,0,0);
 camera.fov=62;camera.updateProjectionMatrix();tod=.34;lastEnvTod=-1;setWeather('klar',true);beginPlay();
}
function cineUpdate(dt){
 time+=dt;cineT+=dt;shotT+=dt;cineDt=dt;
 let sh=SHOTS[shotI];
 if(shotT>=sh.d){shotI++;shotT=0;if(shotI>=SHOTS.length){endCine();return;}sh=SHOTS[shotI];if(sh.start)sh.start();cineTransition();ctext(sh.txt);}
 tod=sh.tod??(.29+Math.min(1,(cineT-shotT)/CINE_TOTAL)*.05);
 if(cineCombat&&cineCombat.active&&cineCombat.ready){updateFoot(dt);P.char.g.visible=false;}
 worldTick(dt);
 sh.cam(shotT,shotT/sh.d);
 if(cineCombat&&cineCombat.active)cineCombatTick(dt);
 if(shake>0){camera.position.x+=(Math.random()-.5)*shake*.45;camera.position.y+=(Math.random()-.5)*shake*.45;shake=Math.max(0,shake-dt*2.2);}
 shadowFocus=cineFocus;
 const first=shotI===0?1.2:.45,f=Math.max(0,1-shotT/first,shotI===SHOTS.length-1?Math.max(0,(shotT-sh.d+.6)/.6):1-(sh.d-shotT)/.45);$('fade').style.opacity=f;
 if(AC){const t=AC.currentTime;
  sirGain.gain.setTargetAtTime(sh.siren?.03:0,t,.1);sirOsc.frequency.setTargetAtTime((time%1)<.5?720:960,t,.02);
  engGain.gain.setTargetAtTime(sh.engine?.04:0,t,.1);engOsc.frequency.setTargetAtTime(sh.engine===2?90+introBoat.speed*2:sh.engine===3?104+Math.sin(time*9)*5:170+Math.sin(time*3)*20,t,.05);}
 updateSky(dt);applyWeatherLight();
}
function initContacts(){for(const k in CONTACTS){const c=buildChar(CONTACT_SKIN[k]);scene.add(c.g);const p=CONTACTS[k].pos();c.g.position.set(p.x,groundY(p.x,p.z),p.z);contactNpc[k]={c,k,home:{x:p.x,z:p.z},talk:0};}}
function contactsTick(dt){for(const k in contactNpc){const n=contactNpc[k],g=n.c.g;const d=Math.hypot(g.position.x-camera.position.x,g.position.z-camera.position.z);g.visible=d<160&&mode!=='cine';if(!g.visible)continue;
 if(mc&&mc.npc===n)continue;const dx=P.pos.x-g.position.x,dz=P.pos.z-g.position.z;if(Math.hypot(dx,dz)<14)g.rotation.y=lerpAng(g.rotation.y,Math.atan2(dx,dz),dt*4);animChar(n.c,0);n.c.armR.rotation.x=Math.sin(time*1.3+n.home.x)*.08;}}
function freeCam(x,y,z,ax,az){for(let k=0;k<4;k++){if(!camBlocked(x,y,z)&&!camBlocked((x+ax)/2,y,(z+az)/2))return [x,z];x=ax+(x-ax)*.6;z=az+(z-az)*.6;}return [x,z];}
function startMissionCine(idx,done){const m=missions[idx];const n=contactNpc[m.contact];if(!n||!m.intro||m.cineSeen){done();return;}m.cineSeen=true;
 if(P.inCar)exitCar(true);if(P.inAir)exitAir(true);if(wheelOpen)closeWheel(false);
 const g=n.c.g,c=g.position.clone();let dx=P.pos.x-c.x,dz=P.pos.z-c.z,l=Math.hypot(dx,dz);if(l<.5){dx=Math.sin(g.rotation.y);dz=Math.cos(g.rotation.y);l=1;}dx/=l;dz/=l;
 const px=c.x+dx*2.1,pz=c.z+dz*2.1;P.pos.set(px,groundY(px,pz),pz);P.face=Math.atan2(-dx,-dz);P.char.g.visible=true;P.char.g.position.copy(P.pos);P.char.g.rotation.set(0,P.face,0);animChar(P.char,0);g.rotation.y=Math.atan2(dx,dz);
 const nm=esc(P.name);const lines=m.intro.map(([w,t])=>[w==='P'?nm:w,t.replace(/\{n\}/g,nm),w==='P']);const lens=lines.map(l=>Math.max(2.8,l[1].length*.06));
 mc={idx,t:0,lines,lens,li:-1,npc:n,done,c,dx,dz,px,pz,dur:lens.reduce((a,b)=>a+b,0)+2.2,side:1};
 const rx=-dz,rz=dx;if(camBlocked(c.x+rx*7,2.5,c.z+rz*7))mc.side=-1;
 mode='mcine';clearKeys();aimHeld=false;fireHeld=false;$('hud').style.display='none';$('cine').style.display='block';$('ctitle').style.opacity=0;$('fade').style.opacity=1;
 $('mctitle').innerHTML=`<small>MISSION ${idx}</small>${m.name}`;$('mctitle').style.opacity=1;camera.fov=45;camera.updateProjectionMatrix();}
function mcineUpdate(dt){const M=mc;time+=dt;M.t+=dt;worldTick(dt);
 let acc=1.2,li=-1;for(let i=0;i<M.lines.length;i++){if(M.t>=acc)li=i;acc+=M.lens[i];}
 if(li!==M.li){M.li=li;if(li>=0){const [w,t,pl]=M.lines[li];ctext(`<b style="color:${pl?'#9fe8ff':'#ffb35c'}">${w}:</b> ${t}`);if(!pl)speakAs(w,t);}}
 const speaking=li>=0&&!M.lines[li][2];
 const npc=M.npc.c;animChar(npc,0);npc.armR.rotation.x=speaking?-.6+Math.sin(time*5)*.35:0;npc.armL.rotation.x=speaking?Math.sin(time*3.6)*.25:0;
 animChar(P.char,0);P.char.armR.rotation.x=li>=0&&!speaking?-.5+Math.sin(time*5)*.3:0;
 const c=M.c,dx=M.dx,dz=M.dz,rx=-dz*M.side,rz=dx*M.side,y0=groundY(c.x,c.z),u=M.t/M.dur;let x,z;
 if(u<.34){[x,z]=freeCam(c.x+rx*7+dx*3.5,y0+2.4,c.z+rz*7+dz*3.5,c.x,c.z);camera.position.set(x,y0+2.2+u*2.5,z);camera.lookAt((c.x+M.px)/2,y0+1.35,(c.z+M.pz)/2);}
 else if(u<.68){[x,z]=freeCam(M.px+dx*1.7+rx*.75,y0+1.9,M.pz+dz*1.7+rz*.75,M.px,M.pz);camera.position.set(x,y0+1.9,z);camera.lookAt(c.x,y0+1.5,c.z);}
 else{[x,z]=freeCam(c.x+dx*.9-rx*1.7,y0+1.7,c.z+dz*.9-rz*1.7,c.x,c.z);camera.position.set(x,y0+1.7,z);camera.lookAt(M.px,y0+1.5,M.pz);}
 shadowFocus=c;$('fade').style.opacity=Math.max(0,1-M.t/.5,(M.t-M.dur+.45)/.45);if(M.t>2.8)$('mctitle').style.opacity=0;
 updateSky(dt);applyWeatherLight();
 if(M.t>=M.dur)endMissionCine();}
function endMissionCine(){const M=mc;if(!M)return;mc=null;clearKeys();shadowFocus=null;mode='play';last=performance.now();$('cine').style.display='none';$('mctitle').style.opacity=0;const ct=$('ctext');ct.innerHTML='';ct.dataset.t='';ct.style.opacity=0;$('fade').style.opacity=0;$('hud').style.display='block';
 M.npc.c.armR.rotation.x=M.npc.c.armL.rotation.x=0;camYaw=P.face;M.done();}
function earlyDay(){return !storyDone&&mi<3;}
function S(f,a){try{f(a);}catch(e){const k=f.name||'?';if(!errSeen.has(k)){errSeen.add(k);console.error('Fehler in '+k,e);}}}
function ensureAudio(){initAudio();if(AC&&!MUS.started){MUS.started=true;try{startMusicEngine();}catch(e){}}try{if(AC&&AC.state==='suspended')AC.resume();}catch(e){}}
function worldTick(dt){
 for(const c of cars){const m=c.mode;if(m==='ai')updateAI(c,dt);else if(m==='ring')updateRing(c,dt);else if(m==='land')updateLand(c,dt);else if(m==='evcop')updateEvCop(c,dt);else if(m==='route')updateRouteCar(c,dt);else if(m==='flee')updateFleeCar(c,dt);else if(m==='police')updatePolice(c,dt);else if(m==='parked')c.speed*=.9;}
 for(const c of cars)syncCar(c,dt);
 S(updateNPCs,dt);S(contactsTick,dt);S(doorTick,dt);S(intLightTick,dt);S(updateFX,dt);S(updateRockets,dt);S(updateGrenades,dt);S(updatePickups,dt);S(updateLoot,dt);S(updateProps,dt);S(updateAircraftWorld,dt);S(updateCrates,dt);S(updateTrafficLights,dt);S(funTick,dt);S(propFallTick,dt);S(tumbleTick,dt);S(burnTick,dt);
 for(let i=cars.length-1;i>=0;i--){const c=cars[i];
  if(c.mode==='wreck'){c.wreckT-=dt;if(c.g.visible&&Math.random()<dt*5)smoke(new THREE.Vector3(c.pos.x,c.g.position.y+1.2,c.pos.z),1.6,.12,2.5);if(c.wreckT<=0&&Math.hypot(c.pos.x-P.pos.x,c.pos.z-P.pos.z)>80)removeCar(c);}
  else if(c.hp<c.maxHp*.35&&c.g.visible&&Math.random()<dt*4)smoke(new THREE.Vector3(c.pos.x+Math.sin(c.h)*1.6,c.g.position.y+1,c.pos.z+Math.cos(c.h)*1.6),1,.3,1.6);}
 S(waterTick,dt);S(vegTick,dt);S(areaTick,dt);S(grassTick,0);S(landTrafficTick,dt);S(sideTick2,dt);S(evTick,dt);S(puppetsTick,dt);S(clubTick,dt);S(bizTick,dt);S(netTick,dt);
 for(const [k,b] of boats.entries()){b.position.y=Math.sin(time*1.2+k)*.15;b.rotation.z=Math.sin(time*.9+k)*.04;}
 for(const cl of clouds){cl.position.x+=dt*(4+WX.cloud*6);if(cl.position.x>3200)cl.position.x=-3200;}
 beamMat.opacity=night*.09;
}
function updateFootCombat(dt){
 const w=curW(),gun=!w.melee&&!w.thrown,ch=P.char;
 if(gun&&(aimHeld||shootPoseT>0)){P.face=camYaw;const ap=-Math.PI/2+camPitch*.55;ch.armR.rotation.x=ap;ch.armR.rotation.z=.06;
  if(w.id!=='pistol'){ch.armL.rotation.x=ap+.2;ch.armL.rotation.z=.5;}else ch.armL.rotation.z=-.06;}
 else ch.armL.rotation.z=-.06;
 if(meleeT>0){const pr=1-meleeT/.3;ch.armR.rotation.x=(w.thrown?-2.8:-2.3)*Math.sin(pr*Math.PI);ch.armR.rotation.z=w.id==='bat'?.7*Math.sin(pr*Math.PI):.06;}
 ch.g.rotation.y=P.face;
 ch.g.visible=!scoped();
}
function policeTick(dt){
 if(wanted>0&&!P.dead){
  const want=Math.min(7,wanted+(wanted>2?1:0)+(wanted>4?1:0));spawnT-=dt;if(police.length<want&&spawnT<=0){spawnPolice();spawnT=2.5;}
  const freshGps=!!(GPS_TRACK.last&&time-GPS_TRACK.lastAt<22),responsePoint=freshGps?GPS_TRACK.last:P.pos;
  let nearest=1e9;for(const c of police){const d=Math.hypot(c.pos.x-P.pos.x,c.pos.z-P.pos.z);nearest=Math.min(nearest,d);const responseD=Math.hypot(c.pos.x-responsePoint.x,c.pos.z-responsePoint.z);if(responseD>320){police.splice(police.indexOf(c),1);removeCar(c);break;}}
  let cops=0,nearCop=1e9;for(const n of peds)if(n.kind==='cop'&&n.state==='fight'){cops++;nearCop=Math.min(nearCop,n.c.g.position.distanceTo(P.pos));}
  for(const c of police){if(c.deployT>0){c.deployT-=dt;continue;}const d=Math.hypot(c.pos.x-responsePoint.x,c.pos.z-responsePoint.z);
   if(d<26&&Math.abs(c.speed)<9&&cops<10&&!P.inAir){c.deployT=25;c.halt=5;for(const sx of [-1,1])spawnCop(c.pos.x+Math.cos(c.h)*2.3*sx,c.pos.z-Math.sin(c.h)*2.3*sx);cops+=2;}}
  const pspd=P.inCar?Math.abs(P.inCar.speed):0;
  if(!P.inAir&&wanted<=2&&((P.inCar&&nearest<7&&pspd<3)||(!P.inCar&&(nearest<5||wanted<=1&&nearCop<1.8))))bustT+=dt;else bustT=Math.max(0,bustT-dt);
  if(bustT>2.2){bustT=0;busted();}
  const far=nearest>95&&nearCop>60;
  if(far){evadeT+=dt;if(evadeT>(wanted>=4?18:wanted>=3?14:10)){evadeT=0;setWanted(wanted-1);}}else evadeT=0;}
 const fl=(time*7|0)%2;const on=wanted>0||police.length||EV.chase;polRed.emissiveIntensity=on?(fl?7:0):2.5;polBlue.emissiveIntensity=on?(fl?0:7):2.5;}
function updateCamera(dt){
 const c=P.inCar,a=P.inAir,aim=aiming(),sc=scoped();
 if(stuntCam>0&&c&&c.air){const sx=c.pos.x+Math.cos(c.h)*12,sz=c.pos.z-Math.sin(c.h)*12;camera.position.lerp(tmpP.set(sx,c.g.position.y+3.5,sz),1-Math.exp(-dt*6));camera.lookAt(c.pos.x,c.g.position.y+1,c.pos.z);return;}
 let tx=P.pos.x,ty=c?c.g.position.y+1.4:a?a.g.position.y+2:P.pos.y+1.6,tz=P.pos.z;
 if(c&&mouseIdle>1.3&&Math.abs(c.speed)>2&&c.vt!=='tank')camYaw=lerpAng(camYaw,c.h,dt*2.5);
 if(P.para&&mouseIdle>1)camYaw=lerpAng(camYaw,P.face,dt*2);
 if(a&&(mouseIdle>1||a.type==='plane'&&a.airborne))camYaw=lerpAng(camYaw,a.h,dt*(a.type==='plane'?4:2));
 // Third-Person-Kamera im Hauptspiel: Fahrzeug bleibt sichtbar, Kamera folgt sicher hinter dem Wagen.
 if(c&&!c.bike&&!c.boat){
  if(c.body)c.body.visible=true;c._driverViewHidden=false;
  const fx=Math.sin(c.h),fz=Math.cos(c.h),spd=Math.abs(c.speed);
  let dist=(c.vt==='bus'||c.vt==='truck'?11.5:c.vt==='tank'?12.5:8.5)+Math.min(5,spd*.055);
  const focusX=c.pos.x+fx*1.1,focusY=c.g.position.y+1.15,focusZ=c.pos.z+fz*1.1;
  for(let d=.5;d<dist;d+=.5){const px=focusX-fx*d,py=focusY+2.8,pz=focusZ-fz*d;if(camBlocked(px,py,pz)){dist=Math.max(4.2,d-.8);break;}}
  const desired=tmpP.set(focusX-fx*dist,focusY+2.8,focusZ-fz*dist);
  camera.position.lerp(desired,1-Math.exp(-dt*6.5));
  camera.position.y=Math.max(camera.position.y,groundY(camera.position.x,camera.position.z)+.65);
  const lookX=c.pos.x+fx*5,lookY=c.g.position.y+1.0,lookZ=c.pos.z+fz*5;
  camera.lookAt(lookX,lookY,lookZ);
  const carFov=62+Math.min(spd,55)*.14;
  if(Math.abs(camera.fov-carFov)>.08){camera.fov+=(carFov-camera.fov)*Math.min(1,dt*4);camera.updateProjectionMatrix();}
  if(shake>0){camera.position.x+=(Math.random()-.5)*shake*.7;camera.position.y+=(Math.random()-.5)*shake*.45;shake=Math.max(0,shake-dt*2.5);}
  camera.updateMatrixWorld(true);return;
 }
 let dist=P.para?(P.para.open?9:6):P.ride?8:c?(c.bike?6.2:c.vt==='bus'?13:c.vt==='tank'?11:c.boat?9.5:8.8)+Math.abs(c.speed)*.07:a?(a.type==='heli'?15:a.kind==='liner'||a.kind==='cargo'?34:19):aim?2.3:4.8;
 const pitchEff=a&&a.type==='plane'?camPitch*.6-a.p*.8:camPitch;
 const cp=Math.cos(pitchEff),spp=Math.sin(pitchEff);
 const rx=-Math.cos(camYaw),rz=Math.sin(camYaw),side=aim&&!sc?.75:0;
 if(sc)dist=.05;
 for(let d=1;d<=dist;d+=.5){if(camBlocked(tx+rx*side-Math.sin(camYaw)*cp*d,ty+spp*d,tz+rz*side-Math.cos(camYaw)*cp*d)){dist=Math.max(1.0,d-.6);break;}}
 const want=tmpP.set(tx+rx*side-Math.sin(camYaw)*cp*dist,ty+spp*dist+(sc?0:.4),tz+rz*side-Math.cos(camYaw)*cp*dist);
 if(aim||P.dead)camera.position.lerp(want,1-Math.exp(-dt*22));else camera.position.lerp(want,1-Math.exp(-dt*(c||a?9:14)));
 camera.position.y=Math.max(camera.position.y,groundY(camera.position.x,camera.position.z)+.4);
 {const I=!a&&interiorAt(P.pos.x,P.pos.z);if(I)camera.position.y=Math.min(camera.position.y,I.ceil-.32);}
 if(aim)camera.lookAt(tmpV.set(camera.position.x+Math.sin(camYaw)*cp*50,camera.position.y-spp*50,camera.position.z+Math.cos(camYaw)*cp*50));
 else camera.lookAt(tx,ty+.3,tz);
 if(shake>0){camera.position.x+=(Math.random()-.5)*shake;camera.position.y+=(Math.random()-.5)*shake;shake=Math.max(0,shake-dt*2.5);}
 const vs=c?Math.abs(c.speed):a?(a.type==='heli'?a.vel.length():a.speed)*.5:0;
 const fov=sc?14:aim?48:62+Math.min(vs,48)*.35;if(Math.abs(camera.fov-fov)>.1){camera.fov+=(fov-camera.fov)*Math.min(1,dt*(sc?20:6));camera.updateProjectionMatrix();}}
function updateHUD(dt){
 const c=P.inCar,a=P.inAir;
 shownMoney+=(P.money-shownMoney)*Math.min(1,dt*6);$('money').textContent='$'+Math.round(shownMoney).toLocaleString('de-DE');
 if(cashPopT>0){cashPopT-=dt;if(cashPopT<=0)$('cashpop').style.opacity=0;}
 if(frame%6===0){let s='';for(let i=0;i<5;i++)s+=`<span class="${i<wanted?'on':'off'}">★</span>`;$('stars').innerHTML=s;$('stars').className=wanted>0&&police.length?'flash':'';}
 const tm=mTimer!=null?mTimer:activity&&activity.timer!=null?activity.timer:null;
 $('timer').textContent=tm!=null?'⏱ '+fmtT(Math.max(0,tm)):race&&race.count<=0&&!race.result?'🏁 '+fmtT(race.t):'';
 $('clock').textContent+=' '+WX_ICON[WX.type]+(saveIcoT>0?' 💾':'');if(saveIcoT>0)saveIcoT-=dt;
 if(c)$('speed').innerHTML=`${Math.round(Math.abs(c.speed)*3.6)}<small> km/h</small>`;
 else if(a)$('speed').innerHTML=`${Math.round((a.type==='heli'?a.vel.length():a.speed)*3.6)}<small> km/h · ${Math.max(0,Math.round(a.g.position.y))} m</small>`;
 else $('speed').innerHTML='';
 if(frame%3===0){const w=curW();let wh='';
  if(a)wh=a.armed?`<div class="wn">${a.name}</div><div class="ws">Linksklick MG · Rechtsklick Raketen</div>`:`<div class="wn">${a.name}</div>`;
  else if(!c){wh=`<div class="wn">${w.name}</div>`;if(w.thrown)wh+=`<div class="wa">${INV.ammo[w.id]||0}</div>`;else if(!w.melee)wh+=reloadT>0?`<div class="wa">lädt …</div>`:`<div class="wa">${INV.clip[w.id]||0} <span style="font-size:18px;color:#ddd">/ ${INV.ammo[w.id]||0}</span></div>`;wh+=`<div class="ws">${aiming()?'':'Rechtsklick zielen · '}1–0 / Mausrad wechseln</div>`;}
  const we=$('weapon');wh=KT(wh);if(we.innerHTML!==wh)we.innerHTML=wh;}
 const hp=Math.max(0,P.hp);const hb=$('hpbar');hb.style.width=hp+'%';hb.style.background=hp<30?'linear-gradient(90deg,#d42020,#ff6060)':'linear-gradient(90deg,#3ddc6a,#8cff8c)';
 $('armorbar').style.width=Math.max(0,P.armor||0)+'%';
 hurtFade=Math.max(0,hurtFade-dt*1.5);$('hurt').style.opacity=Math.max(hurtFade,hp<30?.35+Math.sin(time*5)*.1:0);
 $('scope').style.display=scoped()?'block':'none';
 const tank=c&&c.vt==='tank';const cr=$('cross');const showGun=(!c&&!a&&!curW().melee)||(a&&a.armed&&a.type==='heli')||tank;cr.className=(showGun?'gun':'')+(hitT>0?' hit':'');cr.style.display=((c&&!tank)||P.dead||P.ride||P.para||(a&&!(a.armed&&a.type==='heli')))?'none':'block';
 if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').style.opacity=0;}
 if(flyTutT>0){flyTutT-=dt;if(flyTutT<=0)setTut(mission&&mission.steps[si]?mission.steps[si].tut:'');}
 if(progT>0){progT-=dt;if(progT<=0)hideProg();}
 const st=mission?mission.steps[si]:null;let mt='';
 if(st)mt=`${mission.name}: ${st.text}`;
 else if(race)mt=`${race.def.name}: Platz ${race.rank}/${race.rivals.length+1} · Checkpoint ${Math.min(race.cp,race.pts.length-1)}/${race.pts.length-1}`;
 else if(activity)mt=activity.text||activity.title;
 else if(!storyDone&&mi>0&&mi<missions.length){const ct=CONTACTS[missions[mi].contact];mt=`Nächster Auftrag: ${ct.name} (${ct.label} auf der Karte)`;}
 else if(storyDone)mt='Freies Spiel – Port Solara gehört dir';
 const me=$('mission');if(me.textContent!==mt)me.textContent=mt;
 let hint='';if(!P.dead&&!a&&!P.ride&&!P.para){const na=nearAction();if(na&&!c)hint=`<k>E</k> ${na.label}`;else if(na&&c&&na.label==='Wagen einstellen')hint=`<k>E</k> ${na.label}`;
  else if(!c){const nair=nearestAir(7.5);if(nair)hint=`<k>E</k> Einsteigen (${nair.name})`;else if(nearestCar(4.3))hint='<k>E</k> Einsteigen';else if(st&&st.car)hint='Steig in ein Auto ein (<k>E</k>)';}
  else if(!activity&&!mission&&(c.vt==='taxi'&&isUnlocked('taxi')||c.police&&isUnlocked('vig')||c.vt==='ambulance'&&isUnlocked('para'))&&Math.abs(c.speed)<2)hint='<k>F</k> Nebenjob starten';
  else if(c.vt==='tank')hint='<b>Linksklick</b> Kanone abfeuern · Maus zielt';}
 if(hintMsg){hint=`<span style="color:#ffd23a">${hintMsg}</span>`;hintMsg='';}
 if(P.inCar&&P.inCar.boat&&!hint&&Math.abs(P.inCar.speed)<3&&boatExitPoint(P.inCar))hint='<k>E</k> Aussteigen';
 if(P.inAir&&!hint&&P.inAir.g.position.y-groundY(P.inAir.g.position.x,P.inAir.g.position.z)>18)hint='<k>E</k> Abspringen (Fallschirm)';
 if(P.para)hint=P.para.open?'<k>A</k><k>D</k> lenken · <k>W</k> schneller · <k>S</k> langsamer':'<k>Leertaste</k> Fallschirm öffnen';

 if(bustT>0)hint='<span style="color:#ff6060">Die Polizei nimmt dich gleich fest – hau ab!</span>';
 const he=$('hint');hint=KT(hint);if(he.innerHTML!==hint)he.innerHTML=hint;
 if(bigT>0){bigT-=dt;if(bigT<=0)$('big').style.opacity=0;}
 if(dialogT>0){dialogT-=dt;if(dialogT<=0)$('dialog').innerHTML='';}
 areaCheckT-=dt;if(areaCheckT<=0){areaCheckT=.5;const an=areaName(P.pos.x,P.pos.z);if(an!==lastArea){lastArea=an;const e=$('area');e.textContent=an;e.style.opacity=1;areaT=4;}}
 if(areaT>0){areaT-=dt;if(areaT<=0)$('area').style.opacity=0;}
 if(frame%2===0)drawMini();
}
function update(dt){
 time+=dt;const dunkel=tod<.21||tod>.86;tod=(tod+dt*(K.KeyT?0.02:dunkel?1/700:1/2100))%1;if(earlyDay())tod=clamp(tod,.29,.68);mouseIdle+=dt;heatT-=dt;
 if(frame%30===0&&document.hasFocus&&!document.hasFocus())clearKeys();
 fireCD-=dt;shootPoseT-=dt;meleeT-=dt;hitT-=dt;
 if(reloadT>0){reloadT-=dt;if(reloadT<=0)finishReload();}
 if(fireHeld&&!P.inAir&&curW().auto)tryFire();
 if(P.dead){P.deadT-=dt;if(P.deadT<=0)respawnHospital();}
 else if(P.ride)rideTick(dt);
 else if(P.para)chuteTick(dt);
 if(wheelOpen&&!K.Tab)closeWheel(true);
 else if(P.inAir)updateAirPlayer(dt);
 else if(P.inCar)updatePlayerCar(dt);
 else{updateFoot(dt);updateFootCombat(dt);}
 if(!P.dead&&P.hp<100&&time-lastHurtT>6)P.hp=Math.min(100,P.hp+4*dt);
 worldTick(dt);S(updatePoliceHeli,dt);S(updateWeather,dt);
 if(frame%15===0){let ai=0,ring=0;for(const c of cars){if(c.mode==='ai')ai++;else if(c.mode==='ring')ring++;}if(ai<AI_N)spawnTraffic(P.pos);if(ring<14)spawnRingCar();trafficRecycle();
  const dropped=cars.filter(c=>c.mode==='parked'&&c.dropped&&!c.keep&&c!==P.inCar&&c!==garageCar);if(dropped.length>18){const c=dropped[0];if(Math.hypot(c.pos.x-P.pos.x,c.pos.z-P.pos.z)>150)removeCar(c);}}
 S(policeTick,dt);S(gpsTrackerTick,dt);S(radioVoiceTick,dt);S(airportTick,dt);S(milTick,dt);S(enemyJetTick,dt);S(tankTick,dt);S(unlockTick,dt);S(gradeTick,dt);
 S(updateMission,dt);S(activityTick,dt);S(raceTick,dt);S(robTick,dt);S(aimTick,dt);S(assistTick,dt);S(resprayTick,dt);S(exportTick);S(packagesTick,dt);
 if(marker.visible){marker.children[1].scale.setScalar(1+Math.sin(time*4)*.1);marker.children[0].material.opacity=.22+Math.sin(time*3)*.06;S(updateMarkerArrow,0);}
 if(frame%3===0)for(const p of places){if(!p.mark)continue;const near=Math.abs(p.x-P.pos.x)<90&&Math.abs(p.z-P.pos.z)<90&&(p.type!=='biz'||BIZ.active);p.mark.visible=near;p.lab.visible=near;if(near)p.lab.position.y=groundY(p.x,p.z)+2.6+Math.sin(time*2+p.x)*.15;}
 updateCamera(dt);if(P.tipsy>0){const k=Math.min(1,P.tipsy/6);camera.rotateZ(Math.sin(time*1.1)*.05*k);camera.rotateX(Math.sin(time*.7)*.015*k);}if(window.__camOv){const o=window.__camOv;camera.position.set(o[0],o[1],o[2]);camera.lookAt(o[3],o[4],o[5]);}
 if(frame%6===0)updateStaticLOD();
 updateSky(dt);applyWeatherLight();
 S(updateAmbience,dt);S(heliFx,dt);S(navTick,dt);
 if(AC){const t=AC.currentTime;let nd2=1e9;for(const p of police)nd2=Math.min(nd2,Math.hypot(p.pos.x-P.pos.x,p.pos.z-P.pos.z));
  sirGain.gain.setTargetAtTime(wanted>0&&nd2<160?.035*(1-nd2/160):0,t,.1);sirOsc.frequency.setTargetAtTime((time%1)<.5?720:960,t,.02);}
 S(updateHUD,dt);
}
function menuCam(dt){
 time+=dt;worldTick(dt);
 if(mode==='title'){const a=time*.04;camera.position.set(Math.cos(a)*420,170,Math.sin(a)*420+100);camera.lookAt(0,30,60);}
 else{P.char.g.position.copy(P.pos);P.char.g.rotation.y=P.face+creatorYaw;animChar(P.char,Math.sin(time*1.5)*.04);
  const fx=Math.sin(P.face),fz=Math.cos(P.face);const camPos=tmpP.set(P.pos.x+fx*3.6,P.pos.y+1.35,P.pos.z+fz*3.6);
  camera.position.lerp(camPos,1-Math.exp(-dt*6));camera.lookAt(P.pos.x-fz*1.0,P.pos.y+1.0,P.pos.z+fx*1.0);
  if(Math.abs(camera.fov-50)>.1){camera.fov=50;camera.updateProjectionMatrix();}}
 updateSky(dt);applyWeatherLight();
}
function refreshPerformanceReadout(){const t=$('simTps');if(t)t.textContent=SIM_RATE.tps+' / s';const r=$('renderDistanceStatus');if(r)r.textContent=getEffectiveGfxFar()+' m';const f=$('fpsReadout');if(f)f.textContent=Math.round(lastMeasuredFps)+' FPS';}
function autoQualityTick(now){perfWindowFrames++;if(now-perfWindowStart<3000)return;const fps=perfWindowFrames*1000/(now-perfWindowStart);lastMeasuredFps=fps;perfWindowStart=now;perfWindowFrames=0;
 if(mode!=='play'){perfBadWindows=0;perfGoodWindows=0;refreshPerformanceReadout();return;}
 // Ziel-Tickrate an die gemessene Bildrate anpassen, aber nie unter 40 oder über 60.
 if(SET.autoSlowdown===false){SIM_RATE.tps=60;}
 else{let target=60;if(fps<58)target=clamp(Math.round(60-(58-fps)*.72),40,60);if(target<SIM_RATE.tps)SIM_RATE.tps=Math.max(target,SIM_RATE.tps-4);else if(target>SIM_RATE.tps)SIM_RATE.tps=Math.min(target,SIM_RATE.tps+2);}
 // Erst unter 20 FPS wird die wirksame Render-/Simulationsdistanz stufenweise verkleinert.
 if(SET.autoQuality!==false){
  if(fps<20){perfBadWindows++;perfGoodWindows=0;if(perfBadWindows>=2&&now-perfLastDrop>4500&&perfVisibilityScale>.38){perfLastDrop=now;perfBadWindows=0;perfVisibilityScale=Math.max(.38,+(perfVisibilityScale-.09).toFixed(2));syncAdaptiveDistances();toast('Leistungsschutz: Sichtweite jetzt '+getEffectiveGfxFar()+' m ('+Math.round(fps)+' FPS)');}}
  else if(fps>26){perfGoodWindows++;perfBadWindows=0;if(perfGoodWindows>=4&&now-perfLastDrop>9000&&perfVisibilityScale<1){perfLastDrop=now;perfGoodWindows=0;perfVisibilityScale=Math.min(1,+(perfVisibilityScale+.05).toFixed(2));syncAdaptiveDistances();toast('Leistung erholt: Sichtweite wieder '+getEffectiveGfxFar()+' m');}}
  else{perfGoodWindows=0;}
 }else if(perfVisibilityScale<1){perfVisibilityScale=1;perfBadWindows=0;perfGoodWindows=0;syncAdaptiveDistances();}
 refreshPerformanceReadout();
}
function loop(){
 requestAnimationFrame(loop);const now=performance.now();const dt=Math.min(.05,(now-last)/1000);last=now;frame++;
 if(mode==='title'){autoQualityTick(now);return;}
 if(DEV_CAM.active){updateDevFreecam(dt);composer.render();autoQualityTick(now);return;}
 S(pollInput,dt);S(mouseTick,dt);S(ambTick,dt);S(ambBoatsTick,dt);S(ambAirTick,dt);S(parkTick,dt);S(ipTick,dt);
 if(mode==='play'){let simScale=1;if(stuntCam>0&&P.inCar&&P.inCar.air)simScale*=.4;if(deathFx>0){deathFx-=dt;simScale*=.35;}if(wheelOpen)simScale*=.25;simAccumulator+=dt*simScale;const fixed=1/SIM_RATE.tps;let steps=0;while(simAccumulator>=fixed&&steps<4){update(fixed);simAccumulator-=fixed;steps++;}if(steps>=4)simAccumulator=Math.min(simAccumulator,fixed*2);}
 else if(mode==='cine'){simAccumulator=0;cineUpdate(dt);}
 else if(mode==='mcine'){simAccumulator=0;mcineUpdate(dt);}
 else if(mode==='menu'){simAccumulator=0;if(pauseOpen&&pauseTab==='map'&&frame%20===0)drawBigMap();}
 else{simAccumulator=0;menuCam(dt);}
 S(charsPostTick,0);composer.render();autoQualityTick(now);
}
function continueGame(){if(mode!=='title')return;goFullscreen();lockMouse();const d=loadGame();if(!d){__status('Kein Spielstand gefunden – starte ein neues Spiel.',true);return;}applySave(d);}
function applySave(d){
 renderer.domElement.style.display='block';ensureAudio();Object.assign(PROG,d.prog);P.money=d.money||0;P.armor=d.armor||0;
 // Spielstände von vor den neuen Missionen (Lauschangriff, Ungebetene Gäste, Der Insider) auf die neue Reihenfolge umrechnen
 if((d.prog.mv||1)<2){const mp=o=>o+(o>=9)+(o>=12)+(o>=13);if(PROG.mi)PROG.mi=mp(PROG.mi);if(PROG.unlockSeen!=null)PROG.unlockSeen=mp(PROG.unlockSeen);}PROG.mv=2;
 if(d.inv){for(const k in d.inv.owned)INV.owned[k]=d.inv.owned[k];Object.assign(INV.clip,d.inv.clip||{});Object.assign(INV.ammo,d.inv.ammo||{});INV.cur=d.inv.cur||0;if(!WEAPONS[INV.cur]||!INV.owned[WEAPONS[INV.cur].id])INV.cur=0;attachWeapon();}
 tod=d.tod??.4;lastEnvTod=-1;setWeather(d.wx||'klar',true);mi=PROG.mi||0;storyDone=!!PROG.story;if(PROG.unlockSeen==null)PROG.unlockSeen=mi;
 P.name=d.name||'Fremder';
 for(const k of PROG.air)spawnOwnedAir(k);
 for(const s of packageSpots)if(s.m&&PROG.packages.includes(s.id)){scene.remove(s.m);s.m=null;}
 for(const s of METEORS)if(s.m&&PROG.meteors.includes(s.id)){scene.remove(s.m);s.m=null;}
 const h=SPECIAL['3,5'];const sp=mi===0||!h||!h.door?SPAWN:h.door;P.pos.set(sp.x,0,sp.z);P.pos.y=groundY(sp.x,sp.z);P.face=Math.PI;camYaw=Math.PI;camPitch=.3;
 $('title').style.display='none';$('hud').style.display='block';mode='play';last=performance.now();camera.position.set(P.pos.x,P.pos.y+3,P.pos.z+6);updateStaticLOD(true);
 if(mi===0)missionWait=1.2;lockMouse();big('WILLKOMMEN ZURÜCK',`${P.name} · ${completion()} % geschafft`,'#ffb35c');}
function ipVenue(o){IPOPS.push(o);return o;}
function plateMat(){if(plateTexs.length<6){const n='PS·'+(1000+Math.floor(Math.random()*8999));const t=canvasTex(128,32,(g,w,h)=>{g.fillStyle='#f2f2ee';g.fillRect(0,0,w,h);g.fillStyle='#1d4fa8';g.fillRect(0,0,14,h);g.strokeStyle='#222';g.lineWidth=2;g.strokeRect(1,1,w-2,h-2);g.fillStyle='#151515';g.font='bold 21px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(n,w/2+6,h/2+1);});plateTexs.push(M({map:t,roughness:.5,metalness:.2}));}return pickR(plateTexs);}
