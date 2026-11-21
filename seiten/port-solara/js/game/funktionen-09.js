'use strict';
function ipSpawn(V){V.active=true;V.blkLeave=false;V.alarm=false;V.hostile=false;V.peds=[];V.rs=null;V.cnt=-1;V.greeted=false;V.lvl=Math.min(3,(PROG.sec&&PROG.sec[V.id])||0);
 for(const w of V.walk)w.busy=null;for(const p of V.pups)p.ipHide=true;
 const staff=V.pups.map(p=>({x:p.x,z:p.z,face:p.face,anim:p.anim,skin:p.staff.skin}));
 for(const s of V.staffX||[])staff.push({x:s[0],z:s[1],face:s[2],anim:s[3],skin:V.staffSkin});
 let ai=-1;if(V.anchor&&V.rob!==false){let bd=1e9;staff.forEach((s,i)=>{const d=Math.hypot(s.x-V.anchor[0],s.z-V.anchor[1]);if(d<bd){bd=d;ai=i;}});}
 const Q=V.queue=[];const job=f=>Q.push(()=>{const n=f();if(!n)return;if(V.alarm)ipPanicOne(n,V,V.hostile);else if(V.blkLeave&&n.ip.role==='cust')ipExit(n,V,false);});
 staff.forEach((s,i)=>job(()=>{const n=ipMake(V,'staff',s.skin?Object.assign(randomSkin(),s.skin):classSkin('mid'),s.x,s.z,s.face,s.anim);n.anchor=i===ai;
  for(const a of V.armed||[])if(Math.hypot(a[0]-s.x,a[1]-s.z)<.8){n.ipArmed=a[2];armNPC(n,a[2]);n.hp=130;}return n;}));
 const nc=Math.min(V.cust.length,Math.round(RR(V.ncust[0],V.ncust[1]+.49)*ipDens()));const sl=ipShuffle(V.cust.slice());
 for(let k=0;k<nc;k++){const s=sl[k];job(()=>{const n=ipMake(V,'cust',classSkin(pick(V.cls)),s[0],s[1],s[2],s[3]);if(s[4]){propShow(n,s[4]);n.role=s[4];}return n;});}
 for(let k=0;k<(V.nstroll||0)&&V.walk.length;k++){const free=V.walk.filter(w=>!w.busy);if(!free.length)break;const w=pick(free);w.busy=true;job(()=>{const n=ipMake(V,'cust',classSkin(pick(V.cls)),w[0],w[1],w[2],w[3]);n.ip.stroll=true;n.ipW=w;w.busy=n;n.ipT=RR(3,10);return n;});}
 const ng=Math.min(V.guards.length,(V.gBase||0)+V.lvl);
 for(let k=0;k<ng;k++){const s=V.guards[k];const wp=V.lvl>=2&&s[3]==='pistol'?'smg':s[3];job(()=>{const n=ipMake(V,'guard',ipGuardSkin(),s[0],s[1],s[2],'guard');n.ipArmed=wp;armNPC(n,wp);n.hp=V.lvl>=2?150:115;n.wdmg=V.lvl>=2?8:6;return n;});}}
function ipRemove(n){const i=peds.indexOf(n);if(i>=0)peds.splice(i,1);if(n.props)propsOff(n);scene.remove(n.c.g);n.c.dispose();n.gone=true;const V=n.ip.v,k=V.peds.indexOf(n);if(k>=0)V.peds.splice(k,1);if(n.ipW&&n.ipW.busy===n)n.ipW.busy=null;}
function ipDespawn(V){for(const n of V.peds.slice())ipRemove(n);V.peds=[];V.queue=[];V.active=false;V.rs=null;for(const p of V.pups)p.ipHide=false;if(IP.cur===V)IP.cur=null;}
// Wegfelder (fest gespeichert je Ausgang/Bummelpunkt – stören das gemeinsame Feld der Polizei nicht)
function ipField(o,R){if(!o.D||o.R!==R){o.D=navFieldFixed(R,o[0],o[1]);o.R=R;}return o.D;}
function ipNearestExit(V,n){if(V.exits.length===1||!V.I)return V.exits[0];const R=navRegion(V.I),g=n.c.g.position;
 const ci=clamp(Math.floor((g.x-R.x0)/INAVC),0,R.nx-1),cj=clamp(Math.floor((g.z-R.z0)/INAVC),0,R.nz-1),k=cj*R.nx+ci;let best=V.exits[0],bd=1e18;
 for(const ex of V.exits){const D=ipField(ex,R);const v=D[k]<1e9?D[k]:1e6+Math.hypot(ex[0]-g.x,ex[1]-g.z);if(v<bd){bd=v;best=ex;}}return best;}
function ipUnsit(n){poseReset(n.c);if(/^sit|^read/.test(n.anim||'')){ipUnstick(n);n.anim='idle';}}
function ipExit(n,V,panic){if(n.ipW&&n.ipW.busy===n)n.ipW.busy=null;n.ipW=null;ipUnsit(n);if(panic){propsOff(n);n.role=null;}
 const ex=ipNearestExit(V,n);n.state='ipexit';n.ipEx=ex;n.ipOut=false;n.ipPanic=panic;n.ipDoor=true;n.ipStuck=0;n.navT=0;n.ipDelay=0;}
function ipStrollNext(n,V,fresh){if(n.ipW&&n.ipW.busy===n)n.ipW.busy=null;
 if(!fresh&&Math.random()<.32&&V.exits.length){ipExit(n,V,false);return;}
 const free=V.walk.filter(w=>!w.busy&&w!==n.ipW);if(!free.length){n.state='ipidle';n.ipT=RR(3,6);return;}
 const w=pick(free);w.busy=n;n.ipW=w;ipUnsit(n);n.state='ipwalk';n.ipTo={x:w[0],z:w[1],w,f:R=>ipField(w,R)};n.ipSpd=RR(1.05,1.4);n.ipStuck=0;n.navT=0;}
function ipEnter(V){const ex=pick(V.exits);const ox=ex[2]-ex[0],oz=ex[3]-ex[1],ol=Math.hypot(ox,oz)||1,lx=-oz/ol,lz=ox/ol,sd=Math.random()<.5?-1:1,off=RR(2.5,5);
 const x=ex[2]+lx*sd*off+ox/ol*RR(0,1.5),z=ex[3]+lz*sd*off+oz/ol*RR(0,1.5);
 const vx=x-camera.position.x,vz=z-camera.position.z,vd=Math.hypot(vx,vz)||1,cf=new THREE.Vector3();camera.getWorldDirection(cf);
 if(vd<45&&(vx*cf.x+vz*cf.z)/vd>.2||!ipFree([x,z])){V.enterT=RR(2,4);return;}
 const n=ipMake(V,'cust',classSkin(pick(V.cls)),x,z,Math.atan2(ex[0]-x,ex[1]-z),'wait');n.ip.stroll=true;n.state='ipwalk';n.ipDoor=true;n.ipSpd=RR(1.1,1.4);
 n.ipTo={x:ex[0],z:ex[1],enter:true,f:R=>ipField(ex,R)};if(Math.random()<.35){const r=pick(['phone','bags','cup']);propShow(n,r);n.role=r;}}
function ipSeen(n){const g=n.c.g.position,vx=g.x-camera.position.x,vz=g.z-camera.position.z,vd=Math.hypot(vx,vz)||1;if(vd>75)return false;const cf=new THREE.Vector3();camera.getWorldDirection(cf);return (vx*cf.x+vz*cf.z)/vd>.15;}
function ipConscious(V){let c=0;for(const n of V.peds)if(n.state!=='ko'&&n.state!=='fly'&&!n.gone&&ipInside(V,n.c.g.position.x,n.c.g.position.z))c++;return c;}
// ---------- Alarm / Panik ----------
function ipAlarm(V,why,pos){const hostile=why!=='shot'||ipInside(V,P.pos.x,P.pos.z);
 if(!V.alarm){V.alarm=true;V.cnt=-1;IP.threat=(pos||P.pos).clone();
  if(!mission&&(why==='aim'||why==='metal'))setWanted(Math.max(wanted,V.wantA||1));
  if(V.kind==='bank'&&why!=='shot')alarmAt(new THREE.Vector3(V.cx,2.5,V.cz),14);}
 if(hostile)V.hostile=true;
 for(const n of V.peds)if(n.state==='ipidle'||n.state==='ipwalk'||n.state==='ipret')ipPanicOne(n,V,hostile);}
function ipPanicOne(n,V,hostile){if(n.state==='ko'||n.state==='fly'||n.gone||V.rs&&V.rs.n===n)return;const r=n.ip.role;
 if(r==='guard'||n.ipArmed){if(hostile){ipUnsit(n);n.state='fight';n.atkT=RR(.3,.9);npcSay(n,'guard',1);}else n.ipAlert=true;return;}
 if(n.state==='ipwalk'&&n.ipTo&&n.ipTo.enter&&!ipInside(V,n.c.g.position.x,n.c.g.position.z)){propsOff(n);n.role=null;n.state='flee';n.fleeT=7;n.threat=IP.threat.clone();return;}
 if(r==='staff'){ipUnsit(n);propsOff(n);n.role=null;n.state='cower';n.it=0;n.cowT=n.anchor?1e9:RR(6,15);if(Math.random()<.4)npcSay(n,'cower');return;}
 ipExit(n,V,true);n.ipDelay=RR(0,.9);if(Math.random()<.3)npcSay(n,'flee');}
function ipShot(p){for(const V of IPOPS){if(!V.active)continue;const dx=Math.max(V.x0-p.x,0,p.x-V.x1),dz=Math.max(V.z0-p.z,0,p.z-V.z1);if(dx*dx+dz*dz<12*12)ipAlarm(V,'shot',p);}}
function ipHit(n,src){const V=n.ip.v;if(src!=='player'){if(!V.alarm)ipAlarm(V,'shot',n.c.g.position);return;}ipAlarm(V,'hit');if(n.state==='ipidle'||n.state==='ipwalk'||n.state==='ipret')ipPanicOne(n,V,true);}
function ipStorePanic(st){for(const V of IPOPS)if(V.active&&V.store===st)ipAlarm(V,'rob');}
// Spieler zielt auf eine Figur im Laden
function ipAimed(n){const V=n.ip.v;if(!V.active||n.state==='ko'||n.state==='fly')return;
 const can=V.rob!==false&&!ipBlocked(V)&&!mission;
 if(!V.alarm||!V.hostile)ipAlarm(V,'aim');
 if(!can||V.rs||!ipInside(V,n.c.g.position.x,n.c.g.position.z))return;
 if(!isUnlocked('store')){if(time>IP.lockMsg){IP.lockMsg=time+8;toast('Überfälle schaltest du in der Story frei');}return;}
 if(V.cool>time){if(time>(V.coolMsg||0)){V.coolMsg=time+6;toast('Hier ist gerade nichts mehr zu holen – komm später wieder');}return;}
 const cnt=ipConscious(V);
 if(cnt===1&&ipInside(V,n.c.g.position.x,n.c.g.position.z)){V.rs={n,t:0};ipUnsit(n);propsOff(n);n.state='handsup';n.hT=99;npcSay(n,'clerk',2);return;}
 if(time>IP.hintT){IP.hintT=time+3.5;toast(`Zu viele Zeugen – noch ${cnt} Personen bei Bewusstsein`);}}
function ipRobTick(V,dt){const r=V.rs,n=r.n;
 if(n.state==='ko'||n.state==='fly'||n.gone){toast('K.O. – jetzt rückt niemand mehr Geld heraus!');V.cool=time+120;V.rs=null;return;}
 const g=n.c.g.position,d=Math.hypot(P.pos.x-g.x,P.pos.z-g.z);
 if(d>16||P.inCar||P.dead||mode!=='play'){toast('Überfall abgebrochen');n.state='cower';n.cowT=1e9;V.rs=null;return;}
 const on=aiming();r.t+=dt*(on?1:.25);setProg(on?'Geld wird herausgegeben …':'Halte die Waffe auf die Person gerichtet!',r.t/4,'#ffd23a');
 if(r.t>=4){const amt=Math.round(RR(V.cash[0],V.cash[1]));P.money+=amt;cashSound();cashPop('+$'+amt);big('ÜBERFALL!',`${V.name}: +$${amt}`,'#7dff8a');
  V.cool=time+300;PROG.sec=PROG.sec||{};const lv=Math.min(3,(PROG.sec[V.id]||0)+1);PROG.sec[V.id]=lv;PROG.ipRob=(PROG.ipRob||0)+1;
  setWanted(Math.max(wanted,V.wantR||2));if(V.kind==='bank')alarmAt(new THREE.Vector3(V.cx,2.5,V.cz),15);
  setTimeout(()=>toast(V.kind==='bank'?`Die Bank rüstet auf – beim nächsten Mal mehr Wachen (Stufe ${lv}/3)`:`${V.name} rüstet auf – mehr Sicherheitsleute (Stufe ${lv}/3)`),1800);
  V.rs=null;n.state='cower';n.cowT=1e9;saveGame(true);}}
// ---------- pro Bild ----------
function ipTick(dt){if(mode!=='play'&&mode!=='cine'&&mode!=='mcine')return;IP.t-=dt;
 if(IP.t<=0){IP.t=.4;const px=mode==='play'?P.pos.x:camera.position.x,pz=mode==='play'?P.pos.z:camera.position.z;
  for(const V of IPOPS){const d=Math.hypot(V.cx-px,V.cz-pz),blk=ipBlocked(V),pin=ipInside(V,P.pos.x,P.pos.z);
   if(!V.active){if(mode==='play'&&d<IP_NEAR&&!blk&&!pin)ipSpawn(V);}
   else if(d>IP_FAR||blk&&!pin)ipDespawn(V);
   else if(blk&&!V.blkLeave){V.blkLeave=true;for(const n of V.peds)if(n.ip.role==='cust'&&(n.state==='ipidle'||n.state==='ipwalk'))ipExit(n,V,false);}
   else if(!blk&&V.blkLeave)V.blkLeave=false;}}
 for(const V of IPOPS)if(V.active)ipVenueTick(V,dt);}
function ipVenueTick(V,dt){if(V.queue&&V.queue.length)for(let k=0;k<2&&V.queue.length;k++)V.queue.shift()();
 {const cx=camera.position.x,cz=camera.position.z,dx=Math.max(V.x0-cx,0,cx-V.x1),dz=Math.max(V.z0-cz,0,cz-V.z1);V.camVis=dx*dx+dz*dz<26*26;}
 if(V.rs)ipRobTick(V,dt);if(mode!=='play')return;
 const pin=ipInside(V,P.pos.x,P.pos.z);if(pin)IP.cur=V;else if(IP.cur===V)IP.cur=null;
 // Metalldetektor (Bank): Waffe in der Hand = Alarm
 if(V.metal&&!V.alarm&&!P.inCar&&!P.dead&&!mission){const armed=INV.cur!==0;
  if(armed&&pin){for(let k=0;k<4;k++)setTimeout(()=>tone(k%2?1050:1500,.12,'square',.05,new THREE.Vector3(V.metal.x,1.5,V.metal.z)),k*140);
   toast('🚨 Metalldetektor! Waffe entdeckt – der Sicherheitsdienst greift ein!');ipAlarm(V,'metal');}
  else if(armed&&time>IP.doorWarnT){const ex=V.exits[0];if(Math.hypot(P.pos.x-ex[2],P.pos.z-ex[3])<8){IP.doorWarnT=time+12;toast('⚠️ Metalldetektor am Eingang – steck die Waffe weg (Taste 1 = Fäuste), sonst gibt es Alarm!');}}}
 // Hinweise während eines Überfalls
 if(V.alarm&&V.hostile&&pin&&!V.rs&&V.rob!==false&&!mission&&V.cool<time&&isUnlocked('store')){const c=ipConscious(V);if(c!==V.cnt){V.cnt=c;
  if(c===1)toast('Nur noch eine Person bei Bewusstsein – richte deine Waffe auf sie!');else if(c===0)toast('Niemand mehr da, der dir Geld geben könnte.');else if(c<=4)toast(`Noch ${c} Personen bei Bewusstsein`);}}
 // Kundschaft kommt herein
 if(!V.alarm&&!V.blkLeave&&V.walk.length&&V.nstroll){V.enterT-=dt;if(V.enterT<=0){V.enterT=RR(9,22)/ipDens();let s=0;for(const n of V.peds)if(n.ip.stroll&&!n.gone&&n.state!=='ipgone')s++;if(s<V.nstroll+1)ipEnter(V);}}}
function ipNPC(n,dt,dist,play,onFoot){const V=n.ip.v,g=n.c.g,st=n.state;
 if(st==='ipidle'){const dc=Math.hypot(g.position.x-camera.position.x,g.position.z-camera.position.z);g.visible=V.camVis&&dc<Math.min(cullPed,85);
  if(g.visible){n.it+=dt;applyAnim(n.c,n.anim,n.it,n.ast);if(n.ip.role==='guard'||n.ipArmed)n.c.armR.rotation.x=n.ipAlert?-1.2:-.35;}
  g.rotation.y=lerpAng(g.rotation.y,n.ip.face,dt*5);
  if(n.ip.stroll&&play){n.ipT-=dt;if(n.ipT<=0)ipStrollNext(n,V);}
  if((n.ip.role==='guard'||n.ipArmed)&&V.hostile&&play&&!P.dead&&dist<32){n.state='fight';n.atkT=RR(.3,.9);}
  if(play&&!V.alarm&&!V.greeted&&n.ip.role==='staff'&&onFoot&&dist<4.2){V.greeted=true;npcSay(n,'greet');}
  return true;}
 if(st==='ipwalk'||st==='ipret'){const t=st==='ipret'?{x:n.ip.x,z:n.ip.z}:n.ipTo;const ax=t.x-g.position.x,az=t.z-g.position.z,l=Math.hypot(ax,az);
  if(l<.4){n.ipStuck=0;
   if(st==='ipret'){n.state='ipidle';n.anim=n.ip.anim;n.ipAlert=V.alarm;return true;}
   if(t.enter){ipStrollNext(n,V,true);return true;}
   const w=t.w;n.state='ipidle';n.anim=w[3];n.it=0;n.ip.x=w[0];n.ip.z=w[1];n.ip.face=w[2];n.ip.anim=w[3];n.ipT=RR(5,13);return true;}
  const nv=npcNav(n,t.x,t.z,dt,t.f,V.I);moveNPC(n,nv?nv[0]:ax/l,nv?nv[1]:az/l,st==='ipret'?1.7:n.ipSpd||1.25,dt);g.visible=ipVis(n,V);if(n.role)walkerPose(n);
  n.ipStuck=(n.ipStuck||0)+dt;if(n.ipStuck>28){if(st==='ipret'){g.position.set(n.ip.x,groundY(n.ip.x,n.ip.z),n.ip.z);n.state='ipidle';}else ipExit(n,V,false);}
  if((n.ip.role==='guard'||n.ipArmed)&&V.hostile&&play&&!P.dead&&dist<32)n.state='fight';
  return true;}
 if(st==='ipexit'){if(n.ipDelay>0){n.ipDelay-=dt;g.visible=ipVis(n,V);n.it+=dt;applyAnim(n.c,'handsup',n.it,0);return true;}
  const ex=n.ipEx,tx=n.ipOut?ex[2]:ex[0],tz=n.ipOut?ex[3]:ex[1],ax=tx-g.position.x,az=tz-g.position.z,l=Math.hypot(ax,az);
  if(!n.ipOut&&l<.9){n.ipOut=true;n.ipStuck=0;return true;}
  if(n.ipOut&&l<1.2){n.ipDoor=false;
   if(n.ipPanic){n.state='flee';n.fleeT=RR(6,9);n.threat=(IP.threat||P.pos).clone();}
   else{const a=Math.atan2(ex[2]-ex[0],ex[3]-ex[1])+(Math.random()<.5?-1:1)*RR(.9,1.4);n.goneDir=[Math.sin(a),Math.cos(a)];n.goneT=0;n.state='ipgone';}return true;}
  const nv=n.ipOut?null:npcNav(n,tx,tz,dt,R=>ipField(ex,R),V.I);moveNPC(n,nv?nv[0]:ax/l,nv?nv[1]:az/l,n.ipPanic?5.4:1.3,dt);g.visible=ipVis(n,V);if(!n.ipPanic&&n.role)walkerPose(n);
  n.ipStuck=(n.ipStuck||0)+dt;if(n.ipStuck>(n.ipPanic?20:40)){if(ipSeen(n)&&dist<40)n.ipStuck=0;else ipRemove(n);}
  return true;}
 if(st==='ipgone'){n.goneT+=dt;moveNPC(n,n.goneDir[0],n.goneDir[1],1.3,dt);if(n.role)walkerPose(n);if(n.goneT>3&&(dist>32||!ipSeen(n))||n.goneT>30)ipRemove(n);return true;}
 if(st==='cower'){g.visible=ipVis(n,V);n.it+=dt;applyAnim(n.c,'cower',n.it,0);n.cowT-=dt;
  if(n.cowT<=0){if(dist>6.5&&!aiming())ipExit(n,V,true);else n.cowT=RR(3,6);}return true;}
 if(st==='flee'){n.fleeT-=dt;const tx=n.threat?n.threat.x:P.pos.x,tz=n.threat?n.threat.z:P.pos.z,ax=g.position.x-tx,az=g.position.z-tz,l=Math.hypot(ax,az)||1;
  if(ipInside(V,g.position.x,g.position.z)){ipExit(n,V,true);return true;}
  moveNPC(n,ax/l,az/l,6.2,dt);if(n.fleeT<=0){if(dist>35||!ipSeen(n))ipRemove(n);else n.fleeT=3;}return true;}
 if(st==='ko')return true;// bleibt liegen, solange der Laden aktiv ist
 if(st==='handsup'){if(V.rs&&V.rs.n===n){g.visible=true;animChar(n.c,0);n.c.armL.rotation.x=n.c.armR.rotation.x=-2.9;faceNPC(n,P.pos.x-g.position.x,P.pos.z-g.position.z,dt);return true;}
  n.state='cower';n.cowT=n.anchor?1e9:RR(4,8);return true;}
 if(st==='fight'){if(!play||P.dead||dist>45){n.state='ipret';n.ipStuck=0;n.navT=0;return true;}return false;}
 return false;}
function weakThug(x,z,armed){const p=spawnGang(x,z,!!armed,false,{hp:65});p.punch=4;p.wdmg=3;p.wrate=1.8;return p;}
function mTrack(o){mObjs.push(o);return o;}
function cleanupMission(fail){removeDrill();restoreStaff();removePuppets('mission');mPups=[];if(BANK&&BANK.vaultDoor){BANK.vaultDoor.force=0;}for(const o of mObjs){if(o.car){o.car.keep=false;if(fail&&o.car!==P.inCar&&o.car.mode!=='wreck')removeCar(o.car);else{o.car.locked=false;o.car.dropped=true;}}
  if(o.air&&fail&&o.air!==P.inAir&&!o.air.dead){scene.remove(o.air.g);const i=aircraft.indexOf(o.air);if(i>=0)aircraft.splice(i,1);}}
 mObjs=[];removeInteracts(true);if(mRings){clearRings(mRings);mRings=null;}hideProg();}
function exportCar(c){if(P.inCar===c)exitCar(true);removeCar(c);cashSound();}
function makeRings(list){const rings=list.map((p,i)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(9,.6,8,40),i===0?ringMatOn:ringMatOff);m.position.copy(p);m.lookAt(list[i+1]||list[i-1]);scene.add(m);return m;});return {rings,list,idx:0,done:false};}
function ringTick(Rg){if(Rg.done)return;const p=P.inAir?P.inAir.g.position:P.pos;const target=Rg.list[Rg.idx];if(p.distanceTo(target)<11){Rg.rings[Rg.idx].visible=false;Rg.idx++;tone(1200,.12,'sine',.06);if(Rg.idx>=Rg.list.length){Rg.done=true;return;}Rg.rings[Rg.idx].material=ringMatOn;}
 const t2=Rg.list[Math.min(Rg.idx,Rg.list.length-1)];marker.visible=true;marker.position.set(t2.x,groundY(t2.x,t2.z),t2.z);setProg(`Ring ${Rg.idx+1}/${Rg.list.length}`,Rg.idx/Rg.list.length,'#ffd23a');}
function clearRings(Rg){for(const m of Rg.rings)scene.remove(m);}
function hideStaffIn(pred){for(const p of PUPPETS)if(p.staff&&!mHidden.includes(p)&&pred(p)){p.far0=p.far;p.far=-1;mHidden.push(p);}}
function restoreStaff(){for(const p of mHidden)p.far=p.far0||70;mHidden=[];}
function calmTick(where){if(!mission)return true;if(where()&&aiming()){failMission('Du hast deine Waffe gezogen – Alarm!');return true;}if(wanted>0){failMission('Die Polizei ist auf dich aufmerksam geworden.');return true;}return false;}
function parkedPolice(x,z,h){const c=makeCar(0xf4f4f4,true);c.mode='parked';c.pos.set(x,0,z);c.g.position.copy(c.pos);c.g.position.y=groundY(x,z);c.h=h;c.g.rotation.y=h;c.speed=0;cars.push(c);return c;}
function makeDrill(x,z){const g=new THREE.Group();g.position.set(x,groundY(x,z),z);const dk=cm(0x2b2e33,.5,.6),yl=cm(0xe8b21a,.45,.2),st=cm(0xc9ced4,.25,.9);
 for(let k=0;k<3;k++){const a=k/3*Math.PI*2+.5;const l=mesh(new THREE.CylinderGeometry(.025,.025,1.5,6),dk,Math.cos(a)*.42,.72,Math.sin(a)*.42+.25);l.rotation.z=Math.cos(a)*.28;l.rotation.x=-Math.sin(a)*.28;g.add(l);}
 g.add(mesh(new THREE.BoxGeometry(.34,.34,.62),yl,0,1.45,.2),mesh(new THREE.BoxGeometry(.22,.12,.3),dk,0,1.68,.25),mesh(new THREE.CylinderGeometry(.09,.09,.2,12).rotateX(Math.PI/2),dk,0,1.45,-.18));
 const bit=new THREE.Group();bit.position.set(0,1.45,-.3);bit.add(mesh(new THREE.CylinderGeometry(.03,.012,.36,8).rotateX(Math.PI/2),st,0,0,-.18,false));for(let k=0;k<3;k++){const f=mesh(new THREE.BoxGeometry(.075,.012,.3),st,0,0,-.17,false);f.rotation.z=k*Math.PI/3;bit.add(f);}g.add(bit);
 g.add(mesh(new THREE.BoxGeometry(.5,.4,.35),cm(0x8a1c1c,.6),.55,.2,.6));g.userData={bit,tip:new THREE.Vector3(x,groundY(x,z)+1.45,z-.66)};scene.add(g);return g;}
function drillTick(dt){if(!mDrill)return;mDrill.userData.bit.rotation.z+=dt*28;mSpark-=dt;if(mSpark<=0){mSpark=.09;const t=mDrill.userData.tip;flash(tmpV.set(t.x+RR(-.06,.06),t.y+RR(-.06,.06),t.z),.22+Math.random()*.2);if(Math.random()<.35)tone(2100+Math.random()*900,.05,'square',.01,t);}}
function removeDrill(){if(mDrill){scene.remove(mDrill);mDrill=null;}}
function setMarkerNext(p){markerNext=p||null;}
function updateMarkerArrow(){const mp=marker.position,bob=Math.sin(time*3.2)*.35;
 const fin=markerNext==='finish';markerFlag.visible=fin;markerArrow.visible=!fin;
 if(fin){camera.getWorldDirection(tmpV);markerFlag.rotation.y=Math.atan2(tmpV.x,tmpV.z)+Math.PI/2;const cl=markerFlag.userData.cloth,pa=cl.geometry.attributes.position;
  for(let i=0;i<pa.count;i++){const x=pa.getX(i)+1.4;pa.setZ(i,Math.sin(time*6-x*2.2)*.12*x);}pa.needsUpdate=true;return;}
 let th=Math.PI;
 if(markerNext){const dx=markerNext.x-mp.x,dz=markerNext.z-mp.z,l=Math.hypot(dx,dz)||1;camera.getWorldDirection(tmpV);const fl=Math.hypot(tmpV.x,tmpV.z)||1,fx=tmpV.x/fl,fz=tmpV.z/fl;
  th=Math.atan2((dx*-fz+dz*fx)/l,(dx*fx+dz*fz)/l);}
 const sharp=markerNext&&Math.abs(th)>.85;markerArrow.children[1].visible=!!sharp;
 markerArrow.position.set(0,(markerNext?6.2:7.2)+bob,0);
 markerArrow.quaternion.copy(camera.quaternion).multiply(tmpQ.setFromAxisAngle(tmpV.set(0,0,1),-th));
 const pulse=1+Math.sin(time*6)*.05;markerArrow.scale.setScalar(2.1*pulse);}
function labelTex(l,col){const k=l+col;return labelTexCache[k]||(labelTexCache[k]=canvasTex(64,64,(g)=>{g.fillStyle='#000';g.beginPath();g.arc(32,32,30,0,7);g.fill();g.fillStyle=col;g.beginPath();g.arc(32,32,26,0,7);g.fill();g.fillStyle='#000';g.font=`bold ${l.length>1?24:34}px Arial`;g.textAlign='center';g.textBaseline='middle';g.fillText(l,32,34);}));}
function setTut(h){$('tut').innerHTML=h?`<div class="h">TIPP</div>${KT(h)}`:'';}
function placeMarker(p){markerNext=null;if(p){marker.visible=true;marker.position.set(p.x,groundY(p.x,p.z),p.z);}else marker.visible=false;}
function startStep(){const st=mission.steps[si];st.prog=0;mTimer=st.time??null;if(st.noHeat&&wanted>0)setWanted(0);if(st.say)say(...st.say);if(st.onStart)st.onStart(st);setTut(st.tut);
 if(st.type==='race'&&!startRace(st.race,true)){failMission('Du brauchst ein Auto für das Rennen!');return;}
 st._pos=st.pos?resolvePos(st.pos):null;placeMarker(st._pos);}
function startMission(idx){mi=idx;mission=missions[mi];si=mission.resume?resumeSi:0;resumeSi=0;cMarker.visible=false;
 const go=()=>{if(!mission)return;big(mission.name,mi===0?'Prolog':`Mission ${mi} von ${missions.length-1}`,'#ffb35c');startStep();};
 if(mi>0)startMissionCine(mi,go);else go();}
function completeStep(){const st=mission.steps[si];if(st.end)say(...st.end);if(st.onDone)st.onDone();tone(880,.15,'sine',.06);hideProg();si++;
 if(si>=mission.steps.length){P.money+=mission.reward;passedJingle();big('MISSION ERFÜLLT',`+$${mission.reward.toLocaleString('de-DE')}`,'#7dff8a');setTut('');marker.visible=false;cleanupMission(false);mission=null;mTimer=null;mi++;PROG.mi=mi;
  if(mi>=missions.length){storyDone=true;PROG.story=true;setTimeout(showCredits,4500);}
  saveGame(true);}
 else if(mission)startStep();}
function failMission(reason){if(!mission)return;if(mission.resume)resumeSi=si;failJingle();big('MISSION GESCHEITERT',reason,'#ff5050');marker.visible=false;clearMission();showBag(false);cleanupMission(true);if(race)endRace(false,true);mission=null;mTimer=null;mCool=4;if(mi===0)missionWait=4;setTut('');}
function updateMission(dt){
 if(!mission){mCool-=dt;
  if(mi===0&&!storyDone){cMarker.visible=false;if(missionWait>0){missionWait-=dt;if(missionWait<=0)startMission(0);}return;}
  if(mi<missions.length&&!storyDone){const ct=CONTACTS[missions[mi].contact],cp=ct.pos();cMarker.visible=!activity&&!race;cMarker.position.set(cp.x,groundY(cp.x,cp.z),cp.z);cLabel.material.map=labelTex(ct.label,ct.col);
   if(!activity&&!race&&!P.ride&&mCool<=0&&Math.hypot(P.pos.x-cp.x,P.pos.z-cp.z)<3.2&&!P.inAir&&(!P.inCar||Math.abs(P.inCar.speed)<3)){if(wanted>0)hintMsg='Häng zuerst die Polizei ab!';else startMission(mi);}}
  else cMarker.visible=false;return;}
 const st=mission.steps[si];
 if(mTimer!=null){mTimer-=dt;if(mTimer<=0){failMission('Die Zeit ist abgelaufen.');return;}}
 if(st.track){const p=st.track();marker.visible=true;marker.position.set(p.x,groundY(p.x,p.z),p.z);}
 if(st.tick){st.tick(dt,st);if(!mission||mission.steps[si]!==st)return;}
 const pos=st._pos;
 if(st.type==='goto'){const p=typeof st.pos==='function'?st.pos():pos;if(p&&Math.hypot(P.pos.x-p.x,P.pos.z-p.z)<(st.r||7)&&(!st.car||P.inCar)&&(!st.air||P.inAir))completeStep();}
 else if(st.type==='car'){if(P.inCar)completeStep();}
 else if(st.type==='lose'){if(wanted===0)completeStep();}
 else if(st.type==='check'){if(st.check())completeStep();}
 else if(st.type==='hold'){const p=resolvePos(st.pos);const inside=Math.hypot(P.pos.x-p.x,P.pos.z-p.z)<(st.r||4)&&!P.dead;if(inside)st.prog+=dt;setProg((st.label||'Halten')+(inside?'':' – zurück in den Kreis!'),st.prog/st.time,inside?'#5fd38a':'#ff9a3c');if(st.prog>=st.time)completeStep();}
 else if(st.type==='race'){if(race&&race.result==='win'){endRace(true,true);completeStep();}else if(race&&race.result==='lose'){const r=race.rankText;endRace(false,true);failMission(r);}}
}
function nearestS(n,x,z){const r=RD(n);let b=0,bd=1e9;for(const p of r.pts){const d=Math.hypot(p.x-x,p.z-z);if(d<bd){bd=d;b=p.s;}}return b;}
function RP(n,s){const r=RD(n);return roadPoint(r,s<0?r.len+s:s);}
function roadPts(n,s0,s1,step=40){const r=RD(n);if(s1<0)s1=r.len+s1;if(s0<0)s0=r.len+s0;const out=[];const d=s1>s0?1:-1,L=Math.abs(s1-s0);for(let t=0;t<=L;t+=step){const q=roadPoint(r,s0+d*t);out.push({x:q.x,z:q.z});}const q=roadPoint(r,s1);out.push({x:q.x,z:q.z});return out;}
function routeOnRoad(vt,color,n,s0,s1,speed,lane=2.5){const c=routeCarSpawn(vt,color,roadPts(n,s0,s1,14),speed,lane);const p=c.route.pts[0],p1=c.route.pts[1];c.h=Math.atan2(p1.x-p.x,p1.z-p.z);c.pos.set(p.x-Math.cos(c.h)*lane,0,p.z+Math.sin(c.h)*lane);c.g.position.set(c.pos.x,groundY(c.pos.x,c.pos.z),c.pos.z);return c;}
function geier(x,z,armed=true,o={}){return spawnGang(x,z,armed,false,Object.assign({},GEIER,o));}
function ring(x,z,r){const out=[];for(let k=0;k<r.n;k++){const a=k/r.n*Math.PI*2+(r.a||0);out.push([x+Math.cos(a)*r.d,z+Math.sin(a)*r.d]);}return out;}
function moveBoatOnPath(b,pts,sp,dt){if(!b.path){b.path={pts,i:1};}const P2=b.path;const t=P2.pts[P2.i];if(!t)return true;const dx=t.x-b.pos.x,dz=t.z-b.pos.z,d=Math.hypot(dx,dz);if(d<10){P2.i++;return P2.i>=P2.pts.length;}
 b.h=lerpAng(b.h,Math.atan2(dx,dz),dt*1.5);b.pos.x+=Math.sin(b.h)*sp*dt;b.pos.z+=Math.cos(b.h)*sp*dt;b.speed=sp;return false;}
function updateSky(dt){
 const a=(tod-.25)*Math.PI*2;sunDir.set(Math.cos(a),Math.sin(a),.3).normalize();
 const day=THREE.MathUtils.smoothstep(sunDir.y,-.1,.22);night=1-day;const dusk=Math.max(0,1-Math.abs(sunDir.y)/.25);
 su.sunPosition.value.copy(sunDir);
 scene.fog.color.lerpColors(fogNight,fogDay,day).lerp(fogDusk,dusk*.55*day+dusk*.25);
 const up=sunDir.y>-.03,ld=up?sunDir:tmpV.set(-sunDir.x,-sunDir.y,.3).normalize();
 sun.intensity=up?3.7*THREE.MathUtils.smoothstep(sunDir.y,-.03,.18):1.8;
 sun.color.copy(up?tmpC.setRGB(1,.97,.92).lerp(fogDusk,dusk*.6):tmpC.set(0xaebcff));
 const c0=shadowFocus||P.pos,cy0=Number.isFinite(c0.y)?c0.y:0;
 // Schattenkamera auf Texel-Raster einrasten (verhindert Flimmern/Kriechen der Schatten bei Kamerabewegung)
 {const ts=280/sun.shadow.mapSize.x;{let rx=ld.z,rz=-ld.x;const l=Math.hypot(rx,rz);if(l<1e-4){rx=1;rz=0;}else{rx/=l;rz/=l;}SH_R.set(rx,0,rz);SH_U.set(ld.y*rz,ld.z*rx-ld.x*rz,-ld.y*rx);}SH_C.set(c0.x,cy0,c0.z);
  const px=Math.round(SH_C.dot(SH_R)/ts)*ts,py=Math.round(SH_C.dot(SH_U)/ts)*ts,pz=SH_C.dot(ld);SH_C.copy(SH_R).multiplyScalar(px).addScaledVector(SH_U,py).addScaledVector(ld,pz);}
 sun.position.set(SH_C.x+ld.x*300,SH_C.y+ld.y*300,SH_C.z+ld.z*300);sun.target.position.copy(SH_C);
 hemi.intensity=1.2*night+(.16+.46)*day;hemi.color.set(day>.5?0xcfe6ff:0x8a9ad0);
 for(const m of facadeMats){const k=m.userData.kind;m.emissiveIntensity=k==='shop'?.3+night*.65:k==='sign'?(.4+night*.55)*(m.userData.glow||1):night*.7;}for(const m of neonMats)m.emissiveIntensity=(1.0+night*1.05)*(m.userData.k||1);for(const m of glowMats)m.emissiveIntensity=.2+night*1.0;for(const m of adMats)m.emissiveIntensity=.25+night*.45;
 bulbMat.emissiveIntensity=night*2.4;headMat.emissiveIntensity=.4+night*3.4;if(typeof lampPoolMat!=='undefined')lampPoolMat.opacity=night*.5;tailMat.emissiveIntensity=.8+night*2.5;antMat.emissiveIntensity=(time%1.5<.4)?6:.2;
 starMat.opacity=Math.max(0,night-.25);bloom.strength=.28+night*.03;renderer.toneMappingExposure=.82+night*(.8+(SET.quality===0?.15:0));
 cloudMat.color.setRGB(1,1,1).lerp(fogDusk,dusk*.6).multiplyScalar(.12+.88*day);cloudMat.opacity=.85;
 stars.position.copy(camera.position);sky.position.copy(camera.position);
 moonMesh.position.copy(camera.position).addScaledVector(tmpV.set(-sunDir.x,-sunDir.y,-.25).normalize(),2200);moonMesh.visible=sunDir.y<.12;
 envT-=dt;if(envT<=0||lastEnvTod<0){envT=4;if(Math.abs(tod-lastEnvTod)>.004||lastEnvTod<0){updateEnv();lastEnvTod=tod;}}
 const hh=Math.floor(tod*24)%24,mm=Math.floor(tod*24*60)%60;$('clock').textContent=`🕒 ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
}
function zoneCol(z){const n=z.name;return z.col?z.col:z.military?'#56623a':/Nordpark/.test(n)?'#3f7d34':/Funland/.test(n)?'#7d5f86':/Schrott/.test(n)?'#6a5a44':/JVA/.test(n)?'#6f6f6f':/Arena/.test(n)?'#3f8f3a':/Stunt/.test(n)?'#8a7350':'#4a4740';}
function renderBaseMap(){const g=baseMap.getContext('2d');const X=x=>(x-MX0)*BS,Z=z=>(z-MZ0)*BS,L=v=>v*BS;
 g.fillStyle='#1b5a88';g.fillRect(0,0,baseMap.width,baseMap.height);
 // Gelände mit Relief-Schattierung
 {const c=document.createElement('canvas');c.width=TNX;c.height=TNZ;const cg=c.getContext('2d');const img=cg.createImageData(TNX,TNZ),D=img.data;
  for(let j=0;j<TNZ;j++)for(let i=0;i<TNX;i++){const q=j*TNX+i,h=TH[q],k=q*4;let r,gg,b;
   if(h<-.18){const dp=clamp((SEA_Y-h)/22,0,1);r=lerpN(64,20,dp);gg=lerpN(150,72,dp);b=lerpN(178,122,dp);}
   else{const gr=TGR[q]/255,dry=TDRY[q]/255;const hx=thAt(i+1,j)-thAt(i-1,j),hz=thAt(i,j+1)-thAt(i,j-1);const sh=clamp(1+(-hx*.6-hz*.8)/(2*TC)*1.6,.55,1.35);
    const x=TX0+i*TC,z=TZ0+j*TC;const des=sstep(-1780,-2060,z);
    let cr=lerpN(205,196,des),cgc=lerpN(184,160,des),cb=lerpN(128,104,des);// Sand
    if(gr>.05){const gR=lerpN(76,140,dry),gG=lerpN(112,128,dry),gB=lerpN(56,70,dry);cr=lerpN(cr,gR,gr);cgc=lerpN(cgc,gG,gr);cb=lerpN(cb,gB,gr);}
    if(h>150){const rk=clamp((h-150)/90,0,.7);cr=lerpN(cr,140,rk);cgc=lerpN(cgc,132,rk);cb=lerpN(cb,122,rk);}
    r=cr*sh;gg=cgc*sh;b=cb*sh;}
   D[k]=r;D[k+1]=gg;D[k+2]=b;D[k+3]=255;}
  cg.putImageData(img,0,0);g.imageSmoothingEnabled=true;g.drawImage(c,X(TX0),Z(TZ0),L(TNX*TC),L(TNZ*TC));}
 g.fillStyle='#d8c690';g.beginPath();g.arc(X(IX),Z(IZ),L(IR+14),0,7);g.fill();g.fillStyle='#4f7d3a';g.beginPath();g.arc(X(IX),Z(IZ),L(IR-12),0,7);g.fill();
 g.fillStyle='#646468';g.fillRect(X(-HALF-ROAD/2),Z(-HALF-ROAD/2),L(HALF*2+ROAD),L(HALF*2+ROAD));
 for(const b of blockInfo){g.fillStyle=MCOL[b.type]||'#3a3a40';g.fillRect(X(b.x0),Z(b.z0),L(b.x1-b.x0),L(b.z1-b.z0));}
 for(const k in SPECIAL){const sp=SPECIAL[k];if(!sp.info)continue;const i=sp.info;if(i.x0==null)continue;g.fillStyle='#4b4a55';g.fillRect(X(i.x0),Z(i.z0),L(i.x1-i.x0),L(i.z1-i.z0));}
 for(const z of ZONES){if(z.ring||z.region||z.nofill||z.cx!=null||/Flughafen/.test(z.name))continue;g.fillStyle=zoneCol(z);g.globalAlpha=.85;g.fillRect(X(z.x0),Z(z.z0),L(z.x1-z.x0),L(z.z1-z.z0));g.globalAlpha=1;}
 // Landstraßen
 g.lineJoin='round';g.lineCap='round';
 for(const pass of [0,1])for(const r of ROADS){g.strokeStyle=pass?(r.type==='dirt'?'#9a7d58':r.type==='hw'?'#8d8d92':'#7a7a7f'):'rgba(0,0,0,.45)';g.lineWidth=L(r.hw*2)+(pass?0:L(5))+(r.type==='hw'?1.5:.8);g.beginPath();r.pts.forEach((p,i)=>{if(i)g.lineTo(X(p.x),Z(p.z));else g.moveTo(X(p.x),Z(p.z));});g.stroke();}
 g.strokeStyle='#707074';g.lineWidth=L(22);g.beginPath();g.moveTo(X(-HALF),Z(RING.zs));g.lineTo(X(RING.x0),Z(RING.zs));g.lineTo(X(RING.x0),Z(RING.z0));g.lineTo(X(RING.x1),Z(RING.z0));g.lineTo(X(RING.x1),Z(RING.zs));g.lineTo(X(HALF),Z(RING.zs));g.stroke();
 g.fillStyle='#7c7c78';g.fillRect(X(AIRX0),Z(AIRZ0),L(AIRX1-AIRX0),L(AIRZ1-AIRZ0));g.fillStyle='#48484a';g.fillRect(X(RWX-23),Z(-360),L(46),L(720));g.fillStyle='#646468';g.fillRect(X(HALF),Z(-7),L(AIRX0-HALF),L(14));
 g.fillStyle='#b99a6c';g.fillRect(X(870),Z(-2333),L(380),L(30));
 g.fillStyle='#8a6a45';g.fillRect(X(PIERX-5),Z(WATER_Z-10),L(10),L(80));
 g.textAlign='center';g.textBaseline='middle';
 for(const z of ZONES){if(z.ring)continue;const cx=z.cx!=null?z.cx:(z.x0+z.x1)/2,cz=z.cz!=null?z.cz:(z.z0+z.z1)/2;const big=!!z.region;g.font=big?'italic bold 15px Arial':'bold 10px Arial';g.fillStyle=big?'rgba(255,255,255,.42)':'rgba(255,255,255,.72)';g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=3;const t=z.name.replace(' – Sperrgebiet','');g.strokeText(t,X(cx),Z(cz));g.fillText(t,X(cx),Z(cz));}
 g.font='italic bold 22px Arial';g.fillStyle='rgba(255,255,255,.5)';g.fillText('PORT SOLARA',X(0),Z(-120));}
function areaName(x,z){
 for(const q of ZONES){if(q.ring)continue;if(q.cx!=null){if(Math.hypot(x-q.cx,z-q.cz)<q.r)return q.name;}else if(x>q.x0&&x<q.x1&&z>q.z0&&z<q.z1)return q.name;}
 if(terrainH(x,z)<SEA_Y-.4&&!(Math.abs(x)<=HALF+ROAD&&Math.abs(z)<=HALF+ROAD))return z>WATER_Z-40&&x>-1000&&x<1100?'Bucht von Solara':'Offenes Meer';if(z>COAST-4&&x>-850&&x<1000)return 'Sonnenstrand';
 if(Math.abs(x)<=HALF+ROAD&&Math.abs(z)<=HALF+ROAD){const i=clamp(Math.floor((x+HALF)/CELL),0,N-1),j=clamp(Math.floor((z+HALF)/CELL),0,N-1);const sp=SPECIAL[i+','+j];if(sp)return sp.name;
  const b=blockInfo.find(b=>x>=b.x0-ROAD/2&&x<=b.x1+ROAD/2&&z>=b.z0-ROAD/2&&z<=b.z1+ROAD/2);return b?DIST_NAME[b.type]||'Port Solara':'Port Solara';}
 const nearRing=Math.abs(x-RING.x0)<18||Math.abs(x-RING.x1)<18||Math.abs(z-RING.z0)<18||Math.abs(z-RING.zs)<12;
 return nearRing?'Ringautobahn':'Umland';}
function blipList(){const L=[];
 for(const p of places)if(p.blip&&isUnlocked(p.type))L.push({x:p.x,z:p.z,l:p.label,c:p.col,n:p.name});
 if(!mission&&!storyDone&&mi<missions.length&&!activity){const ct=CONTACTS[missions[mi].contact],cp=ct.pos();L.push({x:cp.x,z:cp.z,l:ct.label,c:ct.col,big:true,n:'Mission: '+missions[mi].name});}
 return L;}
function drawBlip(g,x,y,l,c,r=7){g.fillStyle='#000';g.beginPath();g.arc(x,y,r+1.5,0,7);g.fill();g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.fillStyle='#000';g.font=`bold ${l.length>1?r*1.05:r*1.4}px Arial`;g.textAlign='center';g.textBaseline='middle';g.fillText(l,x,y+.5);}
function dynBlips(g,W,Z,clampR){
 const edge=(x,y,r)=>{if(clampR){const l=Math.hypot(x,y);if(l>clampR){x*=clampR/l;y*=clampR/l;}}return [x,y];};
 for(const a of aircraft){if(a.dead)continue;g.fillStyle=a.police?'#6fa8ff':'#9fe8ff';g.fillRect(W(a.g.position.x)-3,Z(a.g.position.z)-3,6,6);}
 for(const c of mCars){if(c.mode==='wreck')continue;g.fillStyle='#ff2020';g.fillRect(W(c.pos.x)-4,Z(c.pos.z)-4,8,8);}
 for(const n of peds){if(n.kind==='cop'&&n.state==='fight'||n.kind==='civ'&&(n.state==='fight'||n.mission&&(n.state==='guard'||n.state==='patrol'))){g.fillStyle=n.kind==='cop'?'#4f86ff':'#ff4040';g.fillRect(W(n.c.g.position.x)-2.5,Z(n.c.g.position.z)-2.5,5,5);}}
 if(activity){if(activity.blips)for(const n of activity.blips){if(n.state==='ride')continue;g.fillStyle='#ff4060';g.beginPath();g.arc(W(n.c.g.position.x),Z(n.c.g.position.z),3.5,0,7);g.fill();}
  if(activity.blipPts)for(const p of activity.blipPts){g.fillStyle='#ffb13b';g.beginPath();g.arc(W(p.x),Z(p.z),3.5,0,7);g.fill();}}
 if(race)for(const q of race.rivals){g.fillStyle='#ff9a3c';g.fillRect(W(q.pos.x)-3,Z(q.pos.z)-3,6,6);}
 for(const c of police){g.fillStyle=(time*6|0)%2?'#ff3030':'#3060ff';g.beginPath();g.arc(W(c.pos.x),Z(c.pos.z),4.5,0,7);g.fill();}
 if(waypoint){const [x,y]=edge(W(waypoint.x),Z(waypoint.z));g.fillStyle='#c060ff';g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.moveTo(x,y-8);g.lineTo(x+6,y);g.lineTo(x,y+8);g.lineTo(x-6,y);g.closePath();g.fill();g.stroke();}
 if(marker.visible){const [x,y]=edge(W(marker.position.x),Z(marker.position.z));g.fillStyle='#ffd23a';g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.arc(x,y,6.5,0,7);g.fill();g.stroke();}}
function drawMini(){
 const S=200,c=P.inCar,a=P.inAir;const zoom=a?.14:c?clamp(.32-Math.abs(c.speed)*.003,.2,.32):.36;const px=P.pos.x,pz=P.pos.z,g=mini;
 g.save();g.clearRect(0,0,S,S);g.beginPath();g.arc(S/2,S/2,S/2,0,Math.PI*2);g.clip();g.fillStyle='#1b5a88';g.fillRect(0,0,S,S);
 g.translate(S/2,S/2);g.rotate(camYaw-Math.PI);
 g.save();const k=zoom/BS;g.scale(k,k);g.drawImage(baseMap,-(px-MX0)*BS,-(pz-MZ0)*BS);g.restore();
 const W=x=>(x-px)*zoom,Z=z=>(z-pz)*zoom;
 const R2=S/2-8;
 navDraw(g,W,Z,4.5);
 for(const b of blipList()){let x=W(b.x),y=Z(b.z);const l=Math.hypot(x,y);if(l>R2){if(!b.big)continue;x*=R2/l;y*=R2/l;}g.save();g.translate(x,y);g.rotate(Math.PI-camYaw);drawBlip(g,0,0,b.l,b.c,b.big?7.5:6);g.restore();}
 dynBlips(g,W,Z,88);
 const h=c?c.h:a?a.h:P.face;g.rotate(Math.PI-h);g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=1.5;g.beginPath();g.moveTo(0,-9);g.lineTo(6.5,6.5);g.lineTo(0,3);g.lineTo(-6.5,6.5);g.closePath();g.fill();g.stroke();
 g.restore();
 {const rem=navRem();if(rem!=null){const t=rem>=1000?(rem/1000).toFixed(1).replace('.',',')+' km':Math.round(rem/10)*10+' m';g.font='bold 12px Arial';const w=g.measureText(t).width+14;g.fillStyle='rgba(0,0,0,.65)';g.beginPath();g.roundRect?g.roundRect(S/2-w/2,S-34,w,18,9):g.rect(S/2-w/2,S-34,w,18);g.fill();g.fillStyle=NAVR.mission?'#ffd23a':'#d9a0ff';g.textAlign='center';g.textBaseline='middle';g.fillText(t,S/2,S-25);}}
 const na=camYaw-Math.PI;const nx=S/2+Math.sin(-na)*(S/2-10)*-1,ny=S/2-Math.cos(-na)*(S/2-10);g.fillStyle='#000a';g.beginPath();g.arc(nx,ny,8,0,7);g.fill();g.fillStyle='#fff';g.font='bold 11px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('N',nx,ny+.5);}
function drawBigMap(){const cv=$('bigmap');if(!cv)return;const g=cv.getContext('2d');const Wd=cv.width,Ht=cv.height;
 const fit=Math.min(Wd/(MX1-MX0),Ht/(MZ1-MZ0));if(BMV.cx==null){BMV.cx=P.pos.x;BMV.cz=P.pos.z;BMV.z=2.6;}
 const sc=fit*BMV.z;BMV.cx=clamp(BMV.cx,MX0+Wd/sc/2,MX1-Wd/sc/2);BMV.cz=clamp(BMV.cz,MZ0+Ht/sc/2,MZ1-Ht/sc/2);if(Wd/sc>MX1-MX0)BMV.cx=(MX0+MX1)/2;if(Ht/sc>MZ1-MZ0)BMV.cz=(MZ0+MZ1)/2;
 const ox=Wd/2-(BMV.cx-MX0)*sc,oy=Ht/2-(BMV.cz-MZ0)*sc;
 g.fillStyle='#1b5a88';g.fillRect(0,0,Wd,Ht);g.imageSmoothingEnabled=true;g.drawImage(baseMap,ox,oy,(MX1-MX0)*sc,(MZ1-MZ0)*sc);
 const W=x=>ox+(x-MX0)*sc,Z=z=>oy+(z-MZ0)*sc;
 navDraw(g,W,Z,4);
 for(const b of blipList())drawBlip(g,W(b.x),Z(b.z),b.l,b.c,b.big?9:7);
 dynBlips(g,W,Z,0);
 if(waypoint&&waypoint.name){const x=W(waypoint.x),y=Z(waypoint.z)-16;g.font='bold 13px Arial';g.textAlign='center';g.textBaseline='bottom';g.lineWidth=4;g.strokeStyle='rgba(0,0,0,.8)';g.strokeText(waypoint.name,x,y);g.fillStyle='#e6c2ff';g.fillText(waypoint.name,x,y);}
 {const R=NAVR.wp||NAVR.mission;if(R&&R.rem!=null){const km=(R.rem/1000).toFixed(1).replace('.',',');const mins=Math.max(1,Math.round((R.time||R.rem/22)/60));g.fillStyle='rgba(0,0,0,.6)';g.fillRect(Wd-238,8,230,24);g.fillStyle=NAVR.wp?'#e6c2ff':'#ffd23a';g.font='bold 13px Arial';g.textAlign='right';g.textBaseline='middle';g.fillText(`Route: ${km} km · ca. ${mins} Min.`,Wd-16,20);}}
 g.save();g.translate(W(P.pos.x),Z(P.pos.z));g.rotate(Math.PI-(P.inCar?P.inCar.h:P.inAir?P.inAir.h:P.face));g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.moveTo(0,-11);g.lineTo(8,8);g.lineTo(0,4);g.lineTo(-8,8);g.closePath();g.fill();g.stroke();g.restore();
 g.fillStyle='rgba(0,0,0,.55)';g.fillRect(8,Ht-30,330,22);g.fillStyle='#fff';g.font='12px Arial';g.textAlign='left';g.textBaseline='middle';g.fillText('Mausrad = Zoom · Ziehen = verschieben · Klick = Ziel (auch auf Symbole)',14,Ht-19);
 cv.onwheel=e=>{e.preventDefault();const r=cv.getBoundingClientRect();const mx=(e.clientX-r.left)*Wd/r.width,my=(e.clientY-r.top)*Ht/r.height;const wx=MX0+(mx-ox)/sc,wz=MZ0+(my-oy)/sc;const nz=clamp(BMV.z*(e.deltaY<0?1.2:1/1.2),1,9);const nsc=fit*nz;BMV.z=nz;BMV.cx=wx-(mx-Wd/2)/nsc;BMV.cz=wz-(my-Ht/2)/nsc;drawBigMap();};
 cv.onpointerdown=e=>{BMV.drag={x:e.clientX,y:e.clientY,cx:BMV.cx,cz:BMV.cz,moved:false};};
 cv.onpointermove=e=>{const d=BMV.drag;if(!d)return;const r=cv.getBoundingClientRect();const dx=(e.clientX-d.x)*Wd/r.width,dy=(e.clientY-d.y)*Ht/r.height;if(Math.abs(dx)+Math.abs(dy)>6)d.moved=true;if(d.moved){BMV.cx=d.cx-dx/sc;BMV.cz=d.cz-dy/sc;drawBigMap();}};
 cv.onpointerup=()=>{setTimeout(()=>{BMV.drag=null;},0);};
 cv.onclick=e=>{if(BMV.drag&&BMV.drag.moved)return;const r=cv.getBoundingClientRect();const x=(e.clientX-r.left)*Wd/r.width,y=(e.clientY-r.top)*Ht/r.height;const wx=MX0+(x-ox)/sc,wz=MZ0+(y-oy)/sc;
  let hit=null,hd=17;for(const b of blipList()){const d=Math.hypot(W(b.x)-x,Z(b.z)-y);if(d<hd){hd=d;hit=b;}}
  if(waypoint&&Math.hypot(W(waypoint.x)-x,Z(waypoint.z)-y)<14){waypoint=null;NAVR.wp=null;}else if(hit)navSetWaypoint(hit.x,hit.z,hit.n);else navSetWaypoint(wx,wz,null);
  uiClick();setTimeout(()=>{if(pauseOpen)drawBigMap();},60);try{const lw=$('lgwp');if(lw)lw.style.display=waypoint?'':'none';}catch(e){}};}
function navNode(x,z){const L=NAV.nodes;for(let i=0;i<L.length;i++)if(Math.abs(L[i].x-x)<2.2&&Math.abs(L[i].z-z)<2.2)return i;L.push({x,z});NAV.out.push([]);return L.length-1;}
function navResample(pts,step){const o=[pts[0]];for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(l/step));for(let k=1;k<=n;k++)o.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}return o;}
// Fahrzeit entlang einer Linie: Kurvengeschwindigkeit, dann Beschleunigungs-/Bremsgrenzen vorwärts & rückwärts
function navTime(pts,vmax){const p=navResample(pts,10),n=p.length;if(n<2)return 0;const v=new Float32Array(n),ds=new Float32Array(n);
 for(let i=1;i<n;i++)ds[i]=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);
 v[0]=v[n-1]=vmax;for(let i=1;i<n-1;i++){const a1=Math.atan2(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]),a2=Math.atan2(p[i+1][0]-p[i][0],p[i+1][1]-p[i][1]);const th=Math.abs(angWrap(a2-a1));const R=(ds[i]+ds[i+1])/2/Math.max(th,1e-4);v[i]=Math.min(vmax,Math.sqrt(NAV_LAT*R));}
 for(let i=1;i<n;i++)v[i]=Math.min(v[i],Math.sqrt(v[i-1]*v[i-1]+2*NAV_A*ds[i]));
 for(let i=n-2;i>=0;i--)v[i]=Math.min(v[i],Math.sqrt(v[i+1]*v[i+1]+2*NAV_B*ds[i+1]));
 let t=0;for(let i=1;i<n;i++)t+=2*ds[i]/Math.max(.5,v[i]+v[i-1]);return t;}
function navEdge(a,b,pts,vmax,kind){if(a===b||pts.length<2)return;
 for(const o of NAV.out[a]){const e=NAV.edges[o.e];if((e.a===a&&e.b===b||e.a===b&&e.b===a)&&e.kind===kind&&Math.abs(e.len-navLen(pts))<3)return;}
 const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));const len=cum[cum.length-1];if(len<.5)return;
 const n=pts.length,h0=Math.atan2(pts[1][0]-pts[0][0],pts[1][1]-pts[0][1]),h1=Math.atan2(pts[n-1][0]-pts[n-2][0],pts[n-1][1]-pts[n-2][1]);
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const q of pts){x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);z0=Math.min(z0,q[1]);z1=Math.max(z1,q[1]);}
 const e={a,b,pts,cum,len,time:navTime(pts,vmax),vmax,kind,h0,h1,bb:[x0,x1,z0,z1]};NAV.edges.push(e);const id=NAV.edges.length-1;NAV.out[a].push({e:id,fwd:true});NAV.out[b].push({e:id,fwd:false});}
function navLen(pts){let l=0;for(let i=1;i<pts.length;i++)l+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);return l;}
function navProj(pts,x,z){let best=null,bd=1e18,s=0;for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],ex=b[0]-a[0],ez=b[1]-a[1],l2=ex*ex+ez*ez,l=Math.sqrt(l2);if(l2<1e-6)continue;const t=clamp(((x-a[0])*ex+(z-a[1])*ez)/l2,0,1);const px=a[0]+ex*t,pz=a[1]+ez*t,d=(px-x)*(px-x)+(pz-z)*(pz-z);if(d<bd){bd=d;best={x:px,z:pz,d:Math.sqrt(d),s:s+l*t,i,t};}s+=l;}return best;}
// Linie an Abzweigungen (cuts) in Kanten zerlegen
function navPoly(pts,vmax,kind,cuts){const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));const L=cum[cum.length-1];
 const S=[{s:0,p:pts[0]},{s:L,p:pts[pts.length-1]}];
 for(const c of cuts){const q=navProj(pts,c[0],c[1]);if(q&&!S.some(o=>Math.abs(o.s-q.s)<3))S.push({s:q.s,p:[q.x,q.z]});}
 S.sort((a,b)=>a.s-b.s);
 for(let k=0;k<S.length-1;k++){const A=S[k],B=S[k+1];const sub=[A.p];for(let i=0;i<pts.length;i++)if(cum[i]>A.s+.5&&cum[i]<B.s-.5)sub.push(pts[i]);sub.push(B.p);navEdge(navNode(A.p[0],A.p[1]),navNode(B.p[0],B.p[1]),sub,vmax,kind);}}
function navBuild(){if(NAV.built)return;NAV.built=true;
 const V={city:24,link:30,ring:38,hw:42,road:32,dirt:19};
 // Stadtraster
 for(let i=0;i<=N;i++)for(let j=0;j<=N;j++)NAV.city.add(navNode(nodeX(i),nodeX(j)));
 for(let i=0;i<=N;i++)for(let j=0;j<N;j++){const a=nodeX(i),b=nodeX(j),c=nodeX(j+1);navEdge(navNode(a,b),navNode(a,c),[[a,b],[a,c]],V.city,'city');navEdge(navNode(b,a),navNode(c,a),[[b,a],[c,a]],V.city,'city');}
 // Ring, Zubringer, Flughafenstraße, Landstraßen
 const {x0,x1,z0,zs}=RING;const polys=[];
 const ring={pts:[[x0,zs],[x0,z0],[x1,z0],[x1,zs]],v:V.ring,kind:'ring',cuts:[]};polys.push(ring);
 polys.push({pts:[[x0,zs],[nodeX(0),zs]],v:V.ring,kind:'ring',cuts:[]},{pts:[[nodeX(N),zs],[x1,zs]],v:V.ring,kind:'ring',cuts:[]});
 for(const i of [2,7,12]){ring.cuts.push([nodeX(i),z0]);polys.push({pts:[[nodeX(i),z0],[nodeX(i),nodeX(0)]],v:V.link,kind:'link',cuts:[]});}
 for(const j of [1,10]){ring.cuts.push([x0,nodeX(j)]);polys.push({pts:[[x0,nodeX(j)],[nodeX(0),nodeX(j)]],v:V.link,kind:'link',cuts:[]});}
 for(const j of [2,11]){ring.cuts.push([x1,nodeX(j)]);polys.push({pts:[[nodeX(N),nodeX(j)],[x1,nodeX(j)]],v:V.link,kind:'link',cuts:[]});}
 ring.cuts.push([x1,0]);polys.push({pts:[[nodeX(N),0],[x1,0]],v:V.link,kind:'link',cuts:[]},{pts:[[x1,0],[AIRX0,0]],v:V.link,kind:'link',cuts:[]});
 const roadPolys=[];for(const r of ROADS){const p={pts:r.pts.map(q=>[q.x,q.z]),v:V[r.type]||V.road,kind:r.type,cuts:[],road:r};polys.push(p);roadPolys.push(p);}
 // Abzweigungen: Straßenenden, die an eine andere Straße / den Ring stoßen
 const links=[];
 for(const rp of roadPolys)for(const end of [rp.pts[0],rp.pts[rp.pts.length-1]]){
  for(const o of polys){if(o===rp||o.kind==='link')continue;const q=navProj(o.pts,end[0],end[1]);if(q&&q.d<26){o.cuts.push([q.x,q.z]);links.push([end,[q.x,q.z]]);}}}
 for(const p of polys)navPoly(p.pts,p.v,p.kind,p.cuts);
 for(const [a,b] of links){const na=navNode(a[0],a[1]),nb=navNode(b[0],b[1]);if(na!==nb)navEdge(na,nb,[a,b],V.road,'joint');}}
// nächster Punkt auf dem Straßennetz
function navSnap(x,z){let best=null;for(let k=0;k<NAV.edges.length;k++){const e=NAV.edges[k],bb=e.bb,lim=best?best.d:1e9;if(x<bb[0]-lim||x>bb[1]+lim||z<bb[2]-lim||z>bb[3]+lim)continue;
  const q=navProj(e.pts,x,z);if(q&&(!best||q.d<best.d)){const a=e.pts[q.i],b=e.pts[q.i+1];best={e:k,i:q.i,x:q.x,z:q.z,d:q.d,f:clamp(q.s/e.len,0,1),h:Math.atan2(b[0]-a[0],b[1]-a[1])};}}return best;}
function navTurnPen(h1,h2,v1,v2,city){const th=Math.abs(angWrap(h2-h1));let pen=city?.35:0;
 if(th>.12){const vt=Math.min(v1,v2,Math.sqrt(NAV_LAT*9/Math.max(th,.05)));pen+=Math.max(0,v1-vt)**2/(2*v1*NAV_B)+Math.max(0,v2-vt)**2/(2*v2*NAV_A);if(th>2.6)pen+=6;}return pen;}
// kleiner Binär-Heap
function NavHeap(){this.c=[];this.k=[];}
// Route berechnen: Zustand = gerichtete Kante (damit Abbiege-Kosten stimmen)
function navRoute(sx,sz,sh,moving,tx,tz){navBuild();const S=navSnap(sx,sz),T=navSnap(tx,tz);if(!S||!T)return null;const E=NAV.edges;
 const dist=new Map(),prev=new Map(),heap=new NavHeap();const es=E[S.e],et=E[T.e];
 const startPen=h=>moving&&sh!=null&&Math.cos(angWrap(h-sh))<-.2?7:0;
 const push=(key,c,pv)=>{if(c<(dist.has(key)?dist.get(key):1e18)){dist.set(key,c);prev.set(key,pv);heap.push(c,key);}};
 push(S.e*2,es.time*(1-S.f)+startPen(S.h),-1);push(S.e*2+1,es.time*S.f+startPen(S.h+Math.PI),-1);
 let best=1e18,bestKey=-2,bestFromA=true;
 if(S.e===T.e){const fwd=T.f>=S.f;best=es.time*Math.abs(T.f-S.f)+startPen(fwd?S.h:S.h+Math.PI);bestKey=-3;}
 while(heap.c.length){const [c,key]=heap.pop();if(c>(dist.has(key)?dist.get(key):1e18))continue;if(c>=best)break;
  const e=key>>1,fwd=!(key&1),ed=E[e],w=fwd?ed.b:ed.a,hin=fwd?ed.h1:ed.h0+Math.PI,city=NAV.city.has(w);
  if(w===et.a||w===et.b){for(const fromA of [true,false]){if((fromA?et.a:et.b)!==w)continue;const cc=c+et.time*(fromA?T.f:1-T.f)+navTurnPen(hin,fromA?et.h0:et.h1+Math.PI,ed.vmax,et.vmax,city);if(cc<best){best=cc;bestKey=key;bestFromA=fromA;}}}
  const outs=NAV.out[w];for(const o of outs){if(o.e===e&&o.fwd!==fwd&&outs.length>1)continue;const ed2=E[o.e];const h2=o.fwd?ed2.h0:ed2.h1+Math.PI;push(o.e*2+(o.fwd?0:1),c+ed2.time+navTurnPen(hin,h2,ed.vmax,ed2.vmax,city),key);}}
 const pts=[];const add=q=>{const l=pts[pts.length-1];if(!l||Math.hypot(l[0]-q[0],l[1]-q[1])>.3)pts.push([q[0],q[1]]);};
 if(Math.hypot(S.x-sx,S.z-sz)>4)add([sx,sz]);add([S.x,S.z]);
 if(bestKey===-3){const P0=es.pts;if(T.f>=S.f){for(let i=S.i+1;i<=T.i;i++)add(P0[i]);}else{for(let i=S.i;i>T.i;i--)add(P0[i]);}}
 else if(bestKey>=0){const keys=[];for(let k=bestKey;k>=0;k=prev.get(k))keys.push(k);keys.reverse();
  keys.forEach((key,n)=>{const ed=E[key>>1],fwd=!(key&1),P0=ed.pts;
   if(n===0){if(fwd){for(let i=S.i+1;i<P0.length;i++)add(P0[i]);}else{for(let i=S.i;i>=0;i--)add(P0[i]);}}
   else if(fwd){for(let i=1;i<P0.length;i++)add(P0[i]);}else{for(let i=P0.length-2;i>=0;i--)add(P0[i]);}});
  const P1=et.pts;if(bestFromA){for(let i=1;i<=T.i;i++)add(P1[i]);}else{for(let i=P1.length-2;i>T.i;i--)add(P1[i]);}}
 else return {pts:[[sx,sz],[tx,tz]],time:0,len:Math.hypot(tx-sx,tz-sz),idx:0,direct:true};
 add([T.x,T.z]);if(Math.hypot(T.x-tx,T.z-tz)>4)add([tx,tz]);
 // für die Karte ausdünnen (≥ 9 m Abstand, Ecken bleiben erhalten)
 const out=[pts[0]];for(let i=1;i<pts.length-1;i++){const l=out[out.length-1],q=pts[i],nx=pts[i+1];const turn=Math.abs(angWrap(Math.atan2(nx[0]-q[0],nx[1]-q[1])-Math.atan2(q[0]-l[0],q[1]-l[1])));if(Math.hypot(q[0]-l[0],q[1]-l[1])>=9||turn>.5)out.push(q);}out.push(pts[pts.length-1]);
 return {pts:out,time:best,len:navLen(out),idx:0};}
function navPlayer(){const c=P.inCar,a=P.inAir;if(c)return {x:c.pos.x,z:c.pos.z,h:c.h,mv:Math.abs(c.speed)>4,boat:!!c.boat};if(a)return {x:a.g.position.x,z:a.g.position.z,h:a.h,mv:true,air:true};return {x:P.pos.x,z:P.pos.z,h:P.face,mv:false};}
function navProgress(R,p){const P0=R.pts;let bd=1e18,bi=R.idx||0,bx=P0[0][0],bz=P0[0][1];const i0=Math.max(0,(R.idx||0)-2),i1=Math.min(P0.length-1,(R.idx||0)+60);
 for(let i=i0;i<i1;i++){const a=P0[i],b=P0[i+1],ex=b[0]-a[0],ez=b[1]-a[1],l2=ex*ex+ez*ez||1;const t=clamp(((p.x-a[0])*ex+(p.z-a[1])*ez)/l2,0,1);const x=a[0]+ex*t,z=a[1]+ez*t,d=(x-p.x)**2+(z-p.z)**2;if(d<bd){bd=d;bi=i;bx=x;bz=z;}}
 R.idx=bi;R.px=bx;R.pz=bz;let rem=Math.hypot(P0[Math.min(bi+1,P0.length-1)][0]-bx,P0[Math.min(bi+1,P0.length-1)][1]-bz);for(let i=bi+1;i<P0.length-1;i++)rem+=Math.hypot(P0[i+1][0]-P0[i][0],P0[i+1][1]-P0[i][1]);R.rem=rem;return Math.sqrt(bd);}
