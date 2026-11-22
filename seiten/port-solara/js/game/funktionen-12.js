'use strict';
function dropPed(n){n.fare=false;n.patient=false;n.c.g.rotation.set(0,0,0);if(!peds.includes(n))return;if(peds.length>92)killPed(n);else placePed(n,P.pos);}
function killPed(n){if(!n)return;const i=peds.indexOf(n);if(i>=0){scene.remove(n.c.g);n.c.dispose();peds.splice(i,1);}}
function vehOut(A,dt,test,what){const c=P.inCar;if(c&&test(c)&&c.mode!=='wreck'){A.out=0;return false;}A.out=(A.out||0)+dt;setProg('Steig wieder ein: '+what,1-A.out/12,'#ff5050');if(A.out>12)endActivity(false,what+' verlassen');return true;}
function farNode(minD,maxD){for(let t=0;t<80;t++){const a={i:Math.floor(Math.random()*(N+1)),j:Math.floor(Math.random()*(N+1))};const d=distP(nd(a.i,a.j));if(d>minD&&d<maxD)return a;}return {i:7,j:7};}

// ---------- Taxi ----------
function startTaxi(){startActivity({type:'taxi',title:'TAXI',sub:'Bring deine Fahrgäste ans Ziel',text:'Taxi: Hol den Fahrgast ab',rides:0,timer:null,
 start(A){nextFare(A);},tick:taxiTick,cleanup(A){const f=A.fare;if(f&&peds.includes(f)){if(f.state==='ride')dropPed(f);else f.fare=false;}}});}
function nextFare(A){const p=curbPoint(50,260);A.dest=null;A.timer=null;A.fare=p?spawnWaiter(p):null;A.text='Taxi: Hol den Fahrgast ab (er winkt am Straßenrand)';}
function taxiTick(A,dt){if(vehOut(A,dt,c=>c.vt==='taxi','Taxi'))return;const c=P.inCar;
 if(!A.fare){nextFare(A);return;}const f=A.fare;
 if(!A.dest){if(f.state!=='wait'||!peds.includes(f)){toast('Der Fahrgast ist weg!');f.fare=false;nextFare(A);return;}
  markAt(f.c.g.position);
  if(distP(f.c.g.position)<9&&Math.abs(c.speed)<3){f.state='ride';f.c.g.visible=false;npcSay(f,'passengerIn',1);const d=curbPoint(220,650)||{x:HOSPITAL_SPAWN.x,z:HOSPITAL_SPAWN.z};A.dest=d;A.dist=distP(d);A.timer=Math.round(A.dist/9+22);A.text='Taxi: Bring den Fahrgast ans Ziel';}}
 else{f.c.g.position.set(c.pos.x,0,c.pos.z);A.timer-=dt;markAt(A.dest);
  if(A.timer<=0){toast('Zu langsam! Der Fahrgast steigt aus.');dropPed(f);A.fare=null;return;}
  if(distP(A.dest)<9&&Math.abs(c.speed)<4){const pay=Math.round(20+A.dist*.06+A.timer*1.5);P.money+=pay;cashSound();cashPop('+$'+pay);npcSay(f,'passengerOut',1);dropPed(f);A.rides++;PROG.taxi++;
   toast(`Fahrt ${A.rides} geschafft! +$${pay}`);if(PROG.taxi===10){P.money+=1000;big('TAXI-PROFI','10 Fahrten · +$1.000 Bonus','#ffd23a');}A.fare=null;A.timer=null;saveGame(true);}}}

// ---------- Bürgerwehr ----------
function startVigilante(){startActivity({type:'vig',title:'BÜRGERWEHR',sub:'Stoppe die Verdächtigen',noHeat:true,level:Math.min(8,PROG.vig+1),start(A){vigLevel(A);},tick:vigTick,cleanup(A){vigClean(A);}});}
function vigLevel(A){const a=farNode(140,320);const c=makeCar(0x2b2b2b,false,pick(['sedan','suv','muscle','sport']));placeAI(c,a,pick(nbrs(a)),0);c.mode='flee';c.cruise=12+A.level*1.1;c.keep=true;c.locked=true;c.lockMsg='Die Verdächtigen sitzen noch drin!';cars.push(c);
 A.car=c;A.crew=Math.min(4,1+Math.floor(A.level/2));A.thugs=[];A.bailed=false;A.closeT=0;A.timer=75+A.level*8;A.text=`Bürgerwehr Level ${A.level}/8: Stoppe den Fluchtwagen`;toast(`Level ${A.level}: Verdächtige gesichtet!`);}
function vigClean(A){const c=A.car;if(c&&cars.includes(c)){c.keep=false;c.locked=false;if(c.mode==='flee'){c.mode='parked';c.dropped=true;}}for(const t of A.thugs||[])if(!t.downOnce)killPed(t);}
function vigTick(A,dt){if(vehOut(A,dt,c=>c.police,'Streifenwagen'))return;
 A.timer-=dt;if(A.timer<=0){endActivity(false,'Die Verdächtigen sind entkommen');return;}
 const c=A.car;
 if(!A.bailed){markAt(c.pos);const d=distP(c.pos);if(d<16)A.closeT+=dt;else A.closeT=Math.max(0,A.closeT-dt*.5);setProg('Dranbleiben!',A.closeT/4,'#4f86ff');
  if(c.mode==='wreck'||c.hp<c.maxHp*.5||A.closeT>4){A.bailed=true;if(c.mode!=='wreck'){c.mode='parked';c.stopped=true;c.speed=0;c.locked=false;c.dropped=true;}
   for(let k=0;k<A.crew;k++){const ang=c.h+(k%2?1:-1)*Math.PI/2;A.thugs.push(spawnGang(c.pos.x+Math.cos(ang)*2.8+k*.5,c.pos.z-Math.sin(ang)*2.8,A.level>5||(A.level>2&&k%2===0),false));}
   A.text=`Bürgerwehr Level ${A.level}/8: Schalte die Verdächtigen aus`;A.timer+=30;}}
 else{const alive=A.thugs.filter(t=>!t.downOnce);
  if(!alive.length){const pay=A.level*120+50;P.money+=pay;cashSound();cashPop('+$'+pay);PROG.vig=Math.max(PROG.vig,A.level);
   if(A.level>=8){P.armor=100;endActivity(true,'Bürgerwehr komplett! Schutzweste aufgefüllt');return;}
   toast(`Level ${A.level} geschafft! +$${pay}`);vigClean(A);A.level++;vigLevel(A);return;}
  let best=alive[0],bd=1e9;for(const t of alive){const d=distP(t.c.g.position);if(d<bd){bd=d;best=t;}}markAt(best.c.g.position);}}

// ---------- Rettungsdienst ----------
function startParamedic(){startActivity({type:'para',title:'RETTUNGSDIENST',sub:'Bring die Verletzten ins Krankenhaus',level:Math.min(8,PROG.para+1),start(A){paraLevel(A);},tick:paraTick,cleanup(A){for(const n of A.pts||[])killPed(n);A.blips=null;}});}
function paraLevel(A){A.pts=[];for(let k=0;k<A.level;k++){const p=curbPoint(60,380);if(p)A.pts.push(spawnWaiter(p,true));}A.load=[];A.timer=55+A.level*12;A.blips=A.pts;A.text=`Rettungsdienst Level ${A.level}/8: Hol die Verletzten ab`;}
function paraTick(A,dt){if(vehOut(A,dt,c=>c.vt==='ambulance','Rettungswagen'))return;const c=P.inCar;
 A.timer-=dt;if(A.timer<=0){endActivity(false,'Zu spät – die Zeit ist abgelaufen');return;}
 for(const n of A.pts){if(n.state==='ride'){n.c.g.position.set(c.pos.x,0,c.pos.z);continue;}
  if(A.load.length<3&&distP(n.c.g.position)<9&&Math.abs(c.speed)<3){n.state='ride';n.c.g.visible=false;A.load.push(n);A.timer+=8;npcSay(n,'patient',1);toast(`Patient eingeladen (${A.load.length}/3)`);}}
 const waiting=A.pts.filter(n=>n.state!=='ride'),H=HOSPITAL_SPAWN;
 if(A.load.length&&(A.load.length>=3||!waiting.length)){markAt(H);A.text=`Rettungsdienst: Fahr ins Krankenhaus (${A.load.length} an Bord)`;}
 else if(waiting.length){let best=waiting[0],bd=1e9;for(const n of waiting){const d=distP(n.c.g.position);if(d<bd){bd=d;best=n;}}markAt(best.c.g.position);A.text=`Rettungsdienst Level ${A.level}/8: Hol die Verletzten ab (${A.load.length}/3 an Bord)`;}
 if(A.load.length&&distP(H)<14&&Math.abs(c.speed)<4){const k=A.load.length;for(const n of A.load){killPed(n);A.pts.splice(A.pts.indexOf(n),1);}A.load=[];const pay=k*60;P.money+=pay;cashSound();cashPop('+$'+pay);A.timer+=6*k;}
 if(!A.pts.length){const bonus=A.level*100;P.money+=bonus;PROG.para=Math.max(PROG.para,A.level);
  if(A.level>=8){P.hp=100;endActivity(true,'Rettungsdienst komplett! +$'+bonus);return;}toast(`Level ${A.level} geschafft! +$${bonus}`);A.level++;paraLevel(A);}}

// ---------- Pizzabote ----------
function openPizza(p){const sp=SPECIAL['4,9'];openPanel('Pizza Presto',()=>[{label:`Pizzas ausliefern – Level ${Math.min(8,PROG.pizza+1)}/8`,sub:'Mit dem Roller heiße Pizzas zu den Kunden bringen',right:'',act(){if(!canStartSide())return;closePanel();startPizza(sp);}}],()=>`Bisher geschafft: Level ${PROG.pizza}/8`);}
function startPizza(sp){let c=P.inCar;if(!c||c.vt!=='scooter'){const s=sp.scooters[0];c=parkedCar(s.x+RR(-.5,.5),s.z,0,0xd35400,'scooter');if(P.inCar)exitCar(true);enterCar(c);}c.keep=true;
 startActivity({type:'pizza',title:'PIZZABOTE',sub:'Liefere alle Pizzas aus, bevor sie kalt werden',level:Math.min(8,PROG.pizza+1),scooter:c,start(A){pizzaLevel(A);},tick:pizzaTick,cleanup(A){A.scooter.keep=false;A.blipPts=null;}});}
function pizzaLevel(A){A.drops=[];for(let k=0;k<2+A.level;k++){const p=curbPoint(50,330);if(p)A.drops.push(p);}A.timer=35+A.level*14;A.blipPts=A.drops;A.text=`Pizzabote Level ${A.level}/8: ${A.drops.length} Pizzas ausliefern`;}
function pizzaTick(A,dt){if(vehOut(A,dt,c=>c.vt==='scooter','Roller'))return;const c=P.inCar;
 A.timer-=dt;if(A.timer<=0){endActivity(false,'Die Pizzas sind kalt geworden!');return;}
 let best=null,bd=1e9;for(const d of A.drops){const dd=distP(d);if(dd<bd){bd=dd;best=d;}}
 if(best){markAt(best);if(bd<7&&Math.abs(c.speed)<15){A.drops.splice(A.drops.indexOf(best),1);const tip=Math.round(RR(8,25));P.money+=tip;cashSound();cashPop('+$'+tip);A.timer+=4;toast(`Pizza geliefert! Noch ${A.drops.length}`);A.text=`Pizzabote Level ${A.level}/8: noch ${A.drops.length} Pizzas`;}}
 if(!A.drops.length){const bonus=A.level*80;P.money+=bonus;PROG.pizza=Math.max(PROG.pizza,A.level);if(A.level>=8){endActivity(true,'Pizzabote komplett! +$'+bonus);return;}toast(`Level ${A.level} geschafft! +$${bonus}`);A.level++;pizzaLevel(A);}}
function openBounty(p){openPanel('Kopfgeld-Büro',()=>BOUNTIES.map((b,k)=>({label:b.name,sub:k<PROG.bounty?'erledigt':k===PROG.bounty?`${b.guards} Leibwächter · Belohnung $${b.reward.toLocaleString('de-DE')}`:'gesperrt',dis:k!==PROG.bounty,right:k<PROG.bounty?'✓':k===PROG.bounty?'▶':'gesperrt',act(){if(!canStartSide())return;closePanel();startBounty(k);}})),()=>`Gesuchte Gangster ausschalten und Kopfgeld kassieren. Erledigt: ${PROG.bounty}/6`);}
function startBounty(k){const b=BOUNTIES[k];const x=nodeX(b.i)+9.5,z=nodeX(b.j)+9.5;
 startActivity({type:'bounty',title:'KOPFGELD',sub:b.name,text:`Kopfgeld: Schalte ${b.name} aus`,
  start(A){A.target=spawnGang(x,z,true,true,{boss:true,name:b.name,hp:220+k*40,weapon:k>2?'smg':'pistol'});A.guards=[];for(let g=0;g<b.guards;g++){const a=g/b.guards*Math.PI*2;A.guards.push(spawnGang(x+Math.cos(a)*5,z+Math.sin(a)*5,true,true,{weapon:k>3&&g%2?'smg':'pistol'}));}},
  tick(A){const t=A.target;if(t.downOnce){P.money+=b.reward;cashSound();PROG.bounty=Math.max(PROG.bounty,k+1);endActivity(true,`${b.name} erledigt! +$${b.reward.toLocaleString('de-DE')}`);return;}markAt(t.c.g.position);},
  cleanup(A){for(const n of [A.target,...(A.guards||[])])if(n&&!n.downOnce)killPed(n);}});}
function gridPath(a,b){const key=n=>n.i*100+n.j;const prev=new Map([[key(a),null]]);const q=[a];
 while(q.length){const n=q.shift();if(n.i===b.i&&n.j===b.j)break;for(const m of nbrs(n)){const k=key(m);if(!prev.has(k)){prev.set(k,n);q.push(m);}}}
 if(!prev.has(key(b)))return [a,b];const out=[];let n=b;while(n){out.unshift(n);n=prev.get(key(n));}return out;}
function racePath(def){if(def.pts){const P0=def.pts();let all=[];for(let l=0;l<def.laps;l++)all=all.concat(l?P0.slice(1):P0);return all;}let nodes=[];for(let k=0;k<def.wp.length-1;k++){const seg=gridPath({i:def.wp[k][0],j:def.wp[k][1]},{i:def.wp[k+1][0],j:def.wp[k+1][1]});if(nodes.length)seg.shift();nodes=nodes.concat(seg);}
 let all=[];for(let l=0;l<def.laps;l++)all=all.concat(l?nodes.slice(1):nodes);return all.map(n=>nd(n.i,n.j));}
function openRaces(p){openPanel('Straßenrennen',()=>RACES.map((r,k)=>({label:r.name,sub:`${r.laps} Runde${r.laps>1?'n':''} · ${r.rivals} Gegner · Siegprämie $${r.reward.toLocaleString('de-DE')}${PROG.races.includes(k)?' · schon gewonnen':''}`,right:PROG.races.includes(k)?'gewonnen':'▶',act(){if(!canStartSide())return;closePanel();startRace(k,false);}})),()=>'Du startest direkt in der Startaufstellung. Kein Auto? Jax leiht dir eins.');}
function startRace(idx,forMission){const def=RACES[idx];if(!P.inCar&&forMission)return false;
 const pts=racePath(def);let c=P.inCar;
 if(!c){c=parkedCar(pts[0].x,pts[0].z,0,0xff2d55,'sport');c.keep=true;enterCar(c);}
 const p0=pts[0],p1=pts[1];const h=def.pts?Math.atan2(p1.x-p0.x,p1.z-p0.z):Math.atan2(Math.sign(p1.x-p0.x),Math.sign(p1.z-p0.z));const fx=Math.sin(h),fz=Math.cos(h),px=-Math.cos(h),pz=Math.sin(h);
 const slot=k=>{const row=Math.floor(k/2),lane=k%2?5.6:2;return {x:p0.x-fx*(row*9+4)+px*lane,z:p0.z-fz*(row*9+4)+pz*lane};};
 const s0=slot(0);c.pos.set(s0.x,0,s0.z);c.h=h;c.speed=0;c.g.position.copy(c.pos);c.g.rotation.y=h;camYaw=h;
 const rivals=[];for(let k=1;k<=(window.__NETRACE?0:def.rivals);k++){const s=slot(k);const rc=routeCarSpawn(pick(def.offroad?['suv','pickup','bike','muscle']:['sport','muscle','super','sport','bike']),pick(NICE_COLORS),pts,def.speed*RR(.93,1.04),def.pts?1.8:3.5);rc.pos.set(s.x,0,s.z);rc.g.position.y=groundY(s.x,s.z);rc.h=h;rc.g.position.copy(rc.pos);rc.g.rotation.y=h;rc.route.hold=true;rc.keep=true;rc.racer=true;rivals.push(rc);}
 race={idx,def,pts,cp:1,count:3.99,lastCount:5,rivals,mission:!!forMission,result:null,rankText:'',rank:1,t:0,out:0};return true;}
function raceTick(dt){const r=race;if(!r)return;
 if(r.count>0){r.count-=dt;const n=Math.ceil(r.count);if(n!==r.lastCount&&n>0){r.lastCount=n;big(String(n),r.def.name,'#ffd23a');tone(600,.15,'square',.06);}if(r.count<=0){big('LOS!','','#7dff8a');tone(1200,.35,'square',.07);for(const q of r.rivals)q.route.hold=false;}}
 else if(!r.result)r.t+=dt;
 if(r.result)return;
 const c=P.inCar;
 if(!c||c.mode==='wreck'){r.out+=dt;setProg('Zurück ins Auto!',1-r.out/10,'#ff5050');if(r.out>10){r.result='lose';r.rankText='Rennen aufgegeben';if(!r.mission)finishRace(false,r.rankText);}return;}r.out=0;
 const cp=r.pts[r.cp];markAt(cp);const nx=r.pts[r.cp+1];setMarkerNext(nx||'finish');if(nx){cpNext.visible=true;cpNext.position.set(nx.x,groundY(nx.x,nx.z)+.6,nx.z);}else cpNext.visible=false;
 if(Math.hypot(c.pos.x-cp.x,c.pos.z-cp.z)<16){r.cp++;tone(1000,.08,'sine',.05);
  if(r.cp>=r.pts.length){const rank=1+r.rivals.filter(q=>q.route.done).length;r.rankText=`Platz ${rank} von ${r.rivals.length+1}`;r.result=rank===1?'win':'lose';r.rank=rank;marker.visible=false;cpNext.visible=false;if(!r.mission)finishRace(rank===1,r.rankText);return;}}
 const cpp=r.pts[Math.min(r.cp,r.pts.length-1)],myD=Math.hypot(c.pos.x-cpp.x,c.pos.z-cpp.z);let ahead=0;
 for(const q of r.rivals){const qi=q.route.done?1e9:q.route.idx;if(qi>r.cp||qi===r.cp&&Math.hypot(q.pos.x-cpp.x,q.pos.z-cpp.z)<myD)ahead++;const diff=qi-r.cp;q.route.boost=diff>2?.85:diff<-1?1.18:1;}
 r.rank=ahead+1;}
function finishRace(win,text){const r=race;if(!r)return;if(win){const pay=r.def.reward;P.money+=pay;cashSound();if(!PROG.races.includes(r.idx))PROG.races.push(r.idx);big('SIEG!',`${r.def.name} · +$${pay.toLocaleString('de-DE')}`,'#7dff8a');passedJingle();}else{big('VERLOREN',text||'','#ff9a3c');failJingle();}endRace(win,true);saveGame(true);}
function endRace(win,silent){const r=race;if(!r)return;race=null;for(const q of r.rivals)if(cars.includes(q)){if(q===P.inCar)exitCar(true);removeCar(q);}marker.visible=false;cpNext.visible=false;hideProg();}
function openFlight(p){openPanel('Flugschule Solara',()=>LESSONS.map((L,k)=>({label:`Lektion ${k+1}: ${L.name}`,sub:`${L.air==='heli'?'Hubschrauber':L.air==='jet'?'Kampfjet':'Propellerflugzeug'} · Gold unter ${L.tg[0]} s${PROG.flight.includes(k)?' · bestanden':''}`,dis:k>PROG.flight.length,right:PROG.flight.includes(k)?'✓':k>PROG.flight.length?'gesperrt':'▶',act(){if(!canStartSide())return;closePanel();startLesson(k);}})),()=>'Flieg durch alle Ringe – je schneller, desto besser die Medaille.');}
function startLesson(k){const L=LESSONS[k],s=L.start;const a=placeAir(L.air==='heli'?makeHeli(0xf1c40f,false):makePlane(L.air==='jet'?0x5d6d7e:0xf1c40f,L.air==='jet'),s.x,s.z,s.h);a.keep=true;
 startActivity({type:'flight',title:'FLUGSCHULE',sub:L.name,noHeat:true,air:a,timer:L.tg[2]+40,text:`Flugschule: ${L.name} – flieg durch alle Ringe`,
  start(A){if(P.inCar)exitCar(true);enterAir(a);A.rings=makeRings(L.rings.map(p=>new THREE.Vector3(p[0],p[1],p[2])));A.t=0;},
  tick(A,dt){A.t+=dt;A.timer-=dt;if(A.timer<=0){endActivity(false,'Zeit abgelaufen');return;}if(A.air.dead){endActivity(false,'Bruchlandung!');return;}if(P.inAir!==A.air){endActivity(false,'Flugzeug verlassen');return;}
   if(!A.rings.done){ringTick(A.rings);return;}
   if(L.land){const lp=L.landAt||{x:RWX,z:0};markAt(lp);A.text='Flugschule: Lande auf der Landebahn';const ok=L.landOk?L.landOk(A.air):Math.abs(A.air.g.position.x-RWX)<45&&Math.abs(A.air.g.position.z)<380;if(!A.air.airborne&&A.air.speed<8&&ok)lessonDone(A,k);}else lessonDone(A,k);},
  cleanup(A){if(A.rings){clearRings(A.rings);A.rings=null;}A.air.keep=false;}});}
function lessonDone(A,k){const L=LESSONS[k],t=A.t;const medal=t<L.tg[0]?'GOLD':t<L.tg[1]?'SILBER':'BRONZE';const pay=Math.round(L.reward*(medal==='GOLD'?1.5:medal==='SILBER'?1.2:1));P.money+=pay;cashSound();if(!PROG.flight.includes(k))PROG.flight.push(k);endActivity(true,`${medal} · ${Math.round(t)} s · +$${pay.toLocaleString('de-DE')}`);}
function openFight(p){const sp=p.data.sp;openPanel('Faustkampf-Club',()=>FIGHTERS.map((f,k)=>({label:`Kampf ${k+1}: ${f.name}`,sub:k<PROG.fight?'schon besiegt – Revanche möglich':k===PROG.fight?'Nur Fäuste erlaubt!':'gesperrt',dis:k>PROG.fight,right:k<PROG.fight?'✓':k===PROG.fight?'▶':'gesperrt',act(){if(!canStartSide())return;closePanel();startFight(sp,k);}})),()=>`Besiegte Gegner: ${PROG.fight}/5`);}
function startFight(sp,k){const f=FIGHTERS[k],R0=sp.ring;
 startActivity({type:'fight',title:'FAUSTKAMPF',sub:`Gegner: ${f.name}`,noHeat:true,text:`Faustkampf: Besiege ${f.name}`,
  start(A){if(P.inCar)exitCar(true);P.pos.set(R0.x-3,groundY(R0.x,R0.z),R0.z);P.face=Math.PI/2;camYaw=Math.PI/2;A.prevW=INV.cur;selectWeapon(0);A.op=spawnGang(R0.x+3,R0.z,false,false,{name:f.name,hp:f.hp,face:-Math.PI/2,topC:0x222222,pantsC:0x8b1a1a,extra:0});A.op.fistFight=true;A.op.state='fight';},
  tick(A,dt){if(INV.cur!==0)selectWeapon(0);
   if(A.op.downOnce){const pay=k>=PROG.fight?300*(k+1):100;P.money+=pay;PROG.fight=Math.max(PROG.fight,k+1);cashSound();endActivity(true,`${f.name} ist K.O.! +$${pay}`);return;}
   if(P.hp<20){P.hp=35;endActivity(false,'Du wurdest ausgeknockt!');return;}if(distP(R0)>16)endActivity(false,'Ring verlassen – Kampf verloren');},
  cleanup(A){if(A.op&&!A.op.downOnce)killPed(A.op);if(A.prevW!=null)selectWeapon(A.prevW);}});}

// ---------- Schießstand ----------
function openRange(p){const sp=p.data.sp;openPanel('Schießstand',()=>[{label:'Zielscheiben-Challenge',sub:`8 Ziele so schnell wie möglich · Bestzeit: ${PROG.rangeBest?PROG.rangeBest+' s':'–'}`,price:50,act(){if(!canStartSide()){P.money+=50;return;}closePanel();startRange(sp);}}],()=>'Gold unter 14 Sekunden, Silber unter 22 Sekunden.');}
function startRange(sp){const R0=sp.range;
 startActivity({type:'range',title:'SCHIESSSTAND',sub:'Triff alle 8 Ziele!',noHeat:true,timer:45,text:'Schießstand: Triff alle Zielscheiben',
  start(A){P.pos.set(R0.x,groundY(R0.x,R0.z),R0.z);let tx=0,tz=0;for(const t of R0.targets){tx+=t.x/8;tz+=t.z/8;}camYaw=P.face=Math.atan2(tx-R0.x,tz-R0.z);camPitch=.05;
   if(((INV.clip.pistol||0)+(INV.ammo.pistol||0))<16)giveWeapon('pistol',48);selectWeapon(WI.pistol);A.t=0;
   A.ts=R0.targets.map(t=>{const d=makeDummy(t.x,t.z,'target');d.c.g.rotation.y=Math.atan2(R0.x-t.x,R0.z-t.z);return d;});},
  tick(A,dt){A.t+=dt;A.timer-=dt;const hit=A.ts.filter(d=>d.state==='ko').length;setProg(`Treffer ${hit}/8`,hit/8,'#ff9a6a');
   if(hit>=8){const t=A.t;const medal=t<14?'GOLD':t<22?'SILBER':'BRONZE';const pay=medal==='GOLD'?600:medal==='SILBER'?300:150;P.money+=pay;cashSound();PROG.range=1;PROG.rangeBest=Math.min(PROG.rangeBest||999,Math.round(t*10)/10);endActivity(true,`${medal} · ${t.toFixed(1)} s · +$${pay}`);return;}
   if(A.timer<=0)endActivity(false,`Zeit abgelaufen – ${hit}/8 Treffer`);},
  cleanup(A){for(const d of A.ts||[]){scene.remove(d.c.g);const i=peds.indexOf(d);if(i>=0)peds.splice(i,1);}}});}
function exportWanted(){return EXPORT_LIST.map((e,i)=>({vt:e.vt,pay:e.pay,i})).filter(e=>!PROG.exp.includes(e.i)).slice(0,3);}
function openExport(p){openPanel('Roccos Auto-Export',()=>{const w=exportWanted();if(!w.length)return [{label:'Alle Aufträge erledigt!',sub:'Rocco hat keine Wünsche mehr.',dis:true,right:'✓'}];return w.map(e=>({label:VST[e.vt].name,sub:'Gesucht – möglichst ohne Kratzer',right:'$'+e.pay.toLocaleString('de-DE'),dis:true}));},()=>`Geliefert: ${PROG.exp.length}/10. Fahr ein gesuchtes Fahrzeug ohne Fahndungssterne in den lila Kreis.`);}
function exportTick(){if(!P.inCar||mission||activity||race||!isUnlocked('export'))return;const p=places.find(q=>q.type==='export');if(!p||distP(p)>p.r)return;const c=P.inCar;if(c.owned||c.police||c.keep)return;
 const say=t=>{if(!p.msgT||time>p.msgT){p.msgT=time+6;toast(t);}};
 const e=exportWanted().find(q=>q.vt===c.vt);if(!e){say('Rocco will diesen Wagen nicht – schau auf die Liste (zu Fuß E drücken)');return;}
 if(wanted>0){say('Häng erst die Polizei ab!');return;}if(Math.abs(c.speed)>4)return;
 const pay=Math.round(e.pay*clamp(c.hp/c.maxHp,.35,1));PROG.exp.push(e.i);const nm=VST[c.vt].name;exitCar(true);removeCar(c);P.money+=pay;cashSound();big('EXPORTIERT',`${nm} · +$${pay.toLocaleString('de-DE')} (${PROG.exp.length}/10)`,'#c38bff');
 if(PROG.exp.length===10){P.money+=5000;toast('Alle Export-Aufträge erledigt! +$5.000 Bonus');}saveGame(true);}

// ---------- Taxi-Zentrale ----------
function openTaxiDepot(p){openPanel('Solara Taxi',()=>[{label:'Taxi-Job starten',sub:`Fahrgäste befördern · bisher ${PROG.taxi} Fahrten`,right:'',act(){if(!canStartSide())return;closePanel();let c=cars.find(q=>q.vt==='taxi'&&q.mode==='parked'&&Math.hypot(q.pos.x-p.x,q.pos.z-p.z)<45);const sp=SPECIAL['10,7'];if(!c){const s=sp.cars[0];c=parkedCar(s.x,s.z,0,0,'taxi');}enterCar(c);startTaxi();}}],()=>'Tipp: In jedem Taxi startest du den Job auch mit <k>F</k>.');}

// ---------- Orte & Fahrzeuge in der Stadt ----------
function addExtraPlaces(){
 const ci=SPECIAL['6,8'];if(ci&&ci.info)addPlace('cinema','Kino Palast',ci.info.cx,ci.info.z1-2.5,{label:'Ki',col:'#ffd86b'});
 const cl=SPECIAL['8,6'];if(cl&&cl.door)addPlace('club','Club NEON',cl.door.x+7,cl.door.z,{label:'C',col:'#ff3ce0'});
 addPlace('bounty','Kopfgeld-Büro',POLICE_SPAWN.x-7,POLICE_SPAWN.z,{label:'KG',col:'#ff9a3c'});
 addPlace('flight','Flugschule',AIRX0-26,22,{label:'F',col:'#9fe8ff'});
 addPlace('coaster','Achterbahn',-735,-126,{label:'A',col:'#ff5ad6'});
 addPlace('wheel','Riesenrad',-697,-300,{label:'R',col:'#ff5ad6'});}
function spawnCityCars(){
 const d=SPECIAL['12,6'];const lt=['sport','muscle','super','limo'];(d.lot||[]).forEach((p,k)=>{const c=parkedCar(p.x,p.z,0,pick(NICE_COLORS),lt[k%4]);c.locked=true;c.lockMsg='Den kannst du im Autohaus kaufen (E an der Tür)';c.keep=true;});
 (d.showroom||[]).forEach((p,k)=>{const c=parkedCar(p.x,p.z,Math.PI*.25,k?0xf1c40f:0xc0392b,k?'super':'sport');c.locked=true;c.lockMsg='Ausstellungsstück – im Autohaus kaufen';c.keep=true;});
 const t=SPECIAL['12,8'];(t.cars||[]).slice(1).forEach(p=>parkedCar(p.x,p.z,0,pick(NICE_COLORS),pick(['sport','muscle','bike'])));
 const tx=SPECIAL['10,7'];(tx.cars||[]).forEach(p=>parkedCar(p.x,p.z,0,0,'taxi'));
 const pz=SPECIAL['4,9'];(pz.scooters||[]).forEach(p=>parkedCar(p.x,p.z,0,0xd35400,'scooter'));
 const ro=SPECIAL['2,11'];(ro.cars||[]).slice(0,2).forEach(p=>parkedCar(p.x,p.z,0,pick(carColors),pick(['sedan','suv','van'])));
 parkedCar(HOSPITAL_SPAWN.x+12,HOSPITAL_SPAWN.z+5,Math.PI/2,0,'ambulance');
 const pc=makeCar(0,true);pc.mode='parked';pc.pos.set(POLICE_SPAWN.x+14,0,POLICE_SPAWN.z+5);pc.h=Math.PI/2;pc.g.position.copy(pc.pos);pc.g.rotation.y=pc.h;pc.speed=0;cars.push(pc);
 for(const st of stores)makeClerk(st);}
function showCredits(){const e=$('credits2');e.innerHTML='<div class="cr"><h1>PORT SOLARA</h1><p class="big">SKY GAMES PRESENTS</p><p>Ein Spiel von Valle</p><p>&nbsp;</p><p>Danke fürs Spielen!</p><p>Die Stadt gehört jetzt dir – es gibt noch viel zu tun.</p><p class="sm">(Klicken zum Schließen)</p></div>';e.style.display='flex';e.onclick=()=>e.style.display='none';setTimeout(()=>e.style.display='none',12000);}
function startTrucker(p){const tr=parkedCar(p.x+8,p.z+4,Math.PI/2,pick([0xc0392b,0x1f5fbf,0xf1c40f,0xe67e22]),'truck');tr.keep=true;
 startActivity({type:'truck',title:'TRUCKER-JOB',sub:'Liefere die Fracht pünktlich ab',truck:tr,n:0,dest:null,timer:null,text:'Trucker: Steig in den Lastwagen',
  tick(A,dt){if(A.truck.mode==='wreck'){endActivity(false,'Lastwagen zerstört');return;}
   if(!A.dest){markAt(A.truck.pos);if(P.inCar===A.truck)nextTruckDest(A);return;}
   if(vehOut(A,dt,c=>c===A.truck,'Lastwagen'))return;A.timer-=dt;markAt(A.dest);setProg(`Lieferung ${A.n+1}/3 · ${Math.max(0,Math.ceil(A.timer))} s`,A.timer/A.t0,A.timer<15?'#ff5050':'#ffb347');
   if(A.timer<=0){endActivity(false,'Zu spät geliefert');return;}
   if(distP(A.dest)<12&&Math.abs(A.truck.speed)<4){const pay=Math.round(250+A.dist*.9+A.timer*4-(1-A.truck.hp/A.truck.maxHp)*300);P.money+=Math.max(100,pay);cashSound();cashPop('+$'+Math.max(100,pay));A.n++;PROG.truck++;
    if(A.n>=3){endActivity(true,`3 Lieferungen · Trucker-Level ${Math.min(PROG.truck,5)}/5`);if(PROG.truck===5){P.money+=5000;big('TRUCKER-PROFI','+$5.000 Bonus','#ffd23a');}return;}
    toast(`Geliefert: ${A.dest.n}! Nächstes Ziel …`);nextTruckDest(A);}},
  cleanup(A){A.truck.keep=false;hideProg();}});}
function nextTruckDest(A){const cand=TRUCK_DEST.filter(d=>distP(d)>600&&d!==A.dest);const d=pick(cand.length?cand:TRUCK_DEST);A.dest=d;A.dist=distP(d);A.t0=A.timer=Math.round(A.dist/13+45);A.text=`Trucker: Bring die Fracht nach ${d.n}`;}
function startSkate(p){const pts=[[-660,330,1.2],[-655,345,1],[-641,352,2.3],[-632,352,2.6],[-623,352,2.3],[-606,365,2.4],[-606,370,2.2],[-650,368,1.5],[-618,322,1.4],[-600,335,1.2],[-630,325,3.4],[-664,370,3]];
 const toks=pts.map(([x,z,h])=>{const m=new THREE.Mesh(new THREE.TorusGeometry(.5,.12,8,20),tokenMat);m.position.set(x,groundY(x,z)+h,z);scene.add(m);return {m,x,z,y:groundY(x,z)+h,got:false};});
 startActivity({type:'skate',title:'SKATEPARK-CHALLENGE',sub:'Sammle alle 12 Ringe in 60 Sekunden',toks,timer:60,t:0,text:'Skatepark: Sammle die pinken Ringe (springen mit Leertaste!)',
  tick(A,dt){A.timer-=dt;A.t+=dt;const left=A.toks.filter(t=>!t.got);setProg(`Ringe: ${12-left.length}/12 · ${Math.ceil(A.timer)} s`,A.timer/60,'#ff5ad6');
   for(const t of left){t.m.rotation.y+=dt*3;if(Math.hypot(P.pos.x-t.x,P.pos.z-t.z)<1.6&&Math.abs((P.pos.y+1)-t.y)<1.8){t.got=true;scene.remove(t.m);pickupSound();}}
   if(!left.length){const pay=600+Math.round(A.timer*20);P.money+=pay;cashSound();PROG.skate=Math.max(PROG.skate,1);endActivity(true,`Geschafft in ${Math.round(A.t)} s · +$${pay}`);return;}
   if(A.timer<=0)endActivity(false,'Zeit abgelaufen');else markAt(left[0]);},
  cleanup(A){for(const t of A.toks)if(!t.got)scene.remove(t.m);hideProg();}});}
function initMeteors(){for(const s of METEORS){if(PROG.meteors.includes(s.id)||s.m)continue;const m=new THREE.Mesh(meteorGeo,meteorMat);m.position.set(s.x,s.y+.9,s.z);m.castShadow=true;scene.add(m);s.m=m;}}
function meteorsTick(dt){for(const s of METEORS){if(!s.m)continue;if(Math.abs(s.x-P.pos.x)>140||Math.abs(s.z-P.pos.z)>140)continue;s.m.rotation.y+=dt*1.2;s.m.rotation.x+=dt*.7;s.m.position.y=s.y+.9+Math.sin(time*1.7+s.id)*.2;
 if(Math.hypot(s.x-P.pos.x,s.z-P.pos.z)<(P.inCar?3:1.7)&&Math.abs(P.pos.y-s.y)<4){scene.remove(s.m);s.m=null;PROG.meteors.push(s.id);P.money+=250;pickupSound();cashPop('+$250');const n=PROG.meteors.length;
  big('METEORITENSPLITTER',`${n}/20 gefunden`,'#b38cff');if(n===10){giveWeapon('sniper',20);toast('Belohnung: Scharfschützengewehr & Munition!');}if(n===20){P.money+=30000;big('ALLE 20 SPLITTER!','+$30.000','#b38cff');}saveGame(true);}}}
function viewsTick(){for(const v of VIEWS){if(PROG.views.includes(v.id))continue;if(Math.abs(v.p.x-P.pos.x)>14||Math.abs(v.p.z-P.pos.z)>14)continue;if(Math.hypot(v.p.x-P.pos.x,v.p.z-P.pos.z)<9){PROG.views.push(v.id);P.money+=300;cashSound();big('AUSSICHTSPUNKT',`${v.n} · ${PROG.views.length}/8`,'#7fd1ff');if(PROG.views.length===8){P.money+=8000;big('ALLE AUSSICHTSPUNKTE!','+$8.000','#7fd1ff');}saveGame(true);}}}
function sideTick2(dt){meteorsTick(dt);viewsTick();}
function bizCap(id){const p=bizP(id);return p.role==='ware'?(bizHas(id,'store')?35:20):p.role==='waffen'?(bizHas(id,'store')?25:15):p.role==='autos'?8:0;}
function bizUnit(id){const p=bizP(id);return p.role==='ware'?9000*(1+(bizHas(id,'equip')?.4:0)):p.role==='waffen'?16000*(1+(bizHas(id,'equip')?.4:0)):60000*(1+bizBoost(id));}
function bizClubRate(id){return 2500*(BIZ.pop[id]||1)*(1+bizBoost(id));}
function bizWorth(){let w=P.money;for(const id of BIZ.owned){const p=bizP(id);w+=p.price;for(const [k,,c] of BIZ_UP[p.role])if(bizHas(id,k))w+=c*.5;w+=(BIZ.safe[id]||0)+(BIZ.stock[id]||0)*(p.role==='autos'?bizUnit(id)*.7:bizUnit(id));}return Math.round(w);}
// ---------- Verwaltung ----------
function openProperty(id){const p=bizP(id);if(p.role!==BIZ.role){toast(`Das passt nicht zu deiner Rolle (${BIZ_ROLES[BIZ.role].name})`);return;}
 openPanel(p.name,()=>{const own=BIZ.owned.includes(id);if(!own)return [{label:'Kaufen',sub:'Danach verdienst du hier Geld',price:p.price,act(){BIZ.owned.push(id);BIZ.up[id]=[];BIZ.safe[id]=0;BIZ.stock[id]=0;BIZ.pop[id]=1;big('GEKAUFT!',p.name,'#ffd23a');saveGame(true);}}];
  const L=[];
  if(p.role==='club'){L.push({label:'Tresor leeren',sub:`Im Tresor: ${fmt$(BIZ.safe[id]||0)}`,right:'',act(){bizCollect(id);}});L.push({label:'Promo-Tour starten',sub:`Beliebtheit ${Math.round((BIZ.pop[id]||1)*100)} % · mehr Gäste, mehr Umsatz`,right:'▶',act(){closePanel();startPromo(id);}});}
  else if(p.role==='autos'){L.push({label:'Auto beschaffen',sub:`Im Bestand: ${BIZ.stock[id]||0}/${bizCap(id)} Wagen · Verkauf läuft automatisch`,right:'▶',act(){closePanel();startProcure(id);}});L.push({label:'Einnahmen abholen',sub:`Kasse: ${fmt$(BIZ.safe[id]||0)}`,right:'',act(){bizCollect(id);}});}
  else{const st=Math.floor(BIZ.stock[id]||0);L.push({label:'Lieferung starten',sub:`Lager: ${st}/${bizCap(id)} Einheiten · Wert ${fmt$(st*bizUnit(id))}`,right:st>0?'▶':'leer',dis:st<1,act(){closePanel();startDelivery(id);}});}
  for(const [k,n,c,v] of BIZ_UP[p.role]){const has=bizHas(id,k);L.push({label:n,sub:has?'eingebaut':v?`+${Math.round(v*100)} % ${p.role==='club'?'Umsatz':p.role==='autos'?'Verkaufswert':'Leistung'}`:k==='sec'?'Weniger Überfälle':'Mehr Platz',price:has?0:c,right:has?'✓':'',dis:has,act(){if(!BIZ.up[id])BIZ.up[id]=[];BIZ.up[id].push(k);big('UPGRADE',n,'#ffd23a');saveGame(true);}});}
  L.push({label:'Verkaufen',sub:`Du bekommst ${fmt$(p.price*.5)} zurück`,right:'↩',act(){BIZ.owned=BIZ.owned.filter(q=>q!==id);P.money+=p.price*.5+(BIZ.safe[id]||0);cashSound();toast('Verkauft');saveGame(true);}});
  return L;},()=>`<b>${BIZ_ROLES[BIZ.role].icon} ${BIZ_ROLES[BIZ.role].name}</b> · Vermögen ${fmt$(bizWorth())}`);}
function bizCollect(id){const v=Math.round(BIZ.safe[id]||0);if(v<=0){toast('Noch nichts drin');return;}BIZ.safe[id]=0;P.money+=v;cashSound();cashPop('+'+fmt$(v));saveGame(true);}
function openBizApp(){if(!BIZ.active||mode!=='play')return;const R=BIZ_ROLES[BIZ.role];
 openPanel('Business-App',()=>{const L=[];for(const p of BIZ_PROPS.filter(q=>q.role===BIZ.role)){const own=BIZ.owned.includes(p.id);
   L.push({label:(own?'':'')+p.name,sub:own?(p.role==='club'?`Tresor ${fmt$(BIZ.safe[p.id]||0)} · ${fmt$(bizClubRate(p.id))}/min`:p.role==='autos'?`${BIZ.stock[p.id]||0} Wagen · Kasse ${fmt$(BIZ.safe[p.id]||0)}`:`Lager ${Math.floor(BIZ.stock[p.id]||0)}/${bizCap(p.id)}`):`zu verkaufen · ${fmt$(p.price)}`,right:'',act(){const q=p.pos();waypoint={x:q.x,z:q.z};closePanel();toast('Wegpunkt gesetzt: '+p.name);}});}
  if(BIZ.owned.length)L.push({label:'Alle Kassen per App abholen',sub:'Bequem, aber 10 % Gebühr',right:'',act(){let v=0;for(const id of BIZ.owned){v+=BIZ.safe[id]||0;BIZ.safe[id]=0;}v*=.9;P.money+=v;cashSound();toast('+'+fmt$(v));saveGame(true);}});
  return L;},()=>{const w=bizWorth();const nx=BIZ_RANKS.find(r=>w<r[0]);return `<b>${R.icon} ${R.name}</b><br>Bargeld ${fmt$(P.money)} · Vermögen <b>${fmt$(w)}</b>${nx?`<br>Nächstes Ziel: ${nx[1]} ab ${fmt$(nx[0])}`:'<br>Du bist die Legende von Port Solara!'}`;});}
function bizTick(dt){if(!BIZ.active||mode!=='play')return;
 for(const id of BIZ.owned){const p=bizP(id);
  if(p.role==='club'){BIZ.safe[id]=Math.min((BIZ.safe[id]||0)+bizClubRate(id)/60*dt,bizClubRate(id)*30);BIZ.pop[id]=Math.max(.8,(BIZ.pop[id]||1)-dt*.0004);}
  else if(p.role==='autos'){p.sellT=(p.sellT??90)-dt*(1+bizBoost(id));if(p.sellT<=0){p.sellT=110;if((BIZ.stock[id]||0)>0){BIZ.stock[id]--;const v=Math.round(bizUnit(id)*(.8+Math.random()*.6));BIZ.safe[id]=(BIZ.safe[id]||0)+v;toast(`Wagen verkauft: +${fmt$(v)} (in der Kasse)`);}}}
  else{const rate=(p.role==='ware'?1:.6)/60*(1+(bizHas(id,'staff')?.3:0));BIZ.stock[id]=Math.min(bizCap(id),(BIZ.stock[id]||0)+rate*dt);}}
 const w=bizWorth();for(let k=BIZ.rank;k<BIZ_RANKS.length;k++){if(w>=BIZ_RANKS[k][0]){BIZ.rank=k+1;big('NEUER RANG',BIZ_RANKS[k][1],'#ffd23a');passedJingle();}}
 // Überfälle auf deine Geschäfte
 if(!BIZ.raid&&BIZ.owned.length&&!mission&&!activity){BIZ.raidT-=dt;if(BIZ.raidT<=0){BIZ.raidT=R(420,720);const id=pick(BIZ.owned);if(!(bizHas(id,'sec')&&Math.random()<.6))startRaid(id);}}
 if(BIZ.raid){const r=BIZ.raid;r.t-=dt;markAt(r.pos);setProg(`Überfall auf ${bizP(r.id).name}: ${Math.ceil(r.t)} s`,r.t/r.t0,'#ff5050');
  if(allDown(r.group)){BIZ.raid=null;hideProg();marker.visible=false;P.money+=25000;cashSound();big('ÜBERFALL ABGEWEHRT','+$25.000 Bonus','#7dff8a');saveGame(true);}
  else if(r.t<=0){BIZ.raid=null;hideProg();marker.visible=false;BIZ.safe[r.id]=(BIZ.safe[r.id]||0)*.6;BIZ.stock[r.id]=(BIZ.stock[r.id]||0)*.7;for(const n of r.group)if(peds.includes(n)){scene.remove(n.c.g);n.c.dispose();peds.splice(peds.indexOf(n),1);}big('ÜBERFALL!','Sie haben Ware und Geld erbeutet','#ff5050');saveGame(true);}}
 bizSaveT-=dt;if(bizSaveT<=0){bizSaveT=45;saveGame(true);}}
function startRaid(id){const q=bizP(id).pos();const group=[0,1,2,3,4].map(k=>{const a=k/5*Math.PI*2;return spawnGang(q.x+Math.cos(a)*12,q.z+Math.sin(a)*12,true,true,{topC:0x3a2a1a,pantsC:0x1b1b1b,extra:7});});BIZ.raid={id,pos:q,group,t:180,t0:180};waypoint={x:q.x,z:q.z};
 big('ÜBERFALL!',`Gangster greifen ${bizP(id).name} an – 3 Minuten!`,'#ff5050');tone(500,.3,'square',.05);}
function startDelivery(id){const p=bizP(id),q=p.pos();const units=Math.floor(BIZ.stock[id]||0);if(units<1){toast('Das Lager ist leer');return;}if(!canStartSide())return;
 BIZ.stock[id]-=units;const v=parkedCar(q.x+6,q.z+4,0,p.role==='waffen'?0x3b4a2a:0x2f3b4a,p.role==='waffen'?'truck':'van');v.keep=true;const cands=BIZ_BUYERS.filter(b=>Math.hypot(b.x-q.x,b.z-q.z)>600);const dest=pick(cands.length?cands:BIZ_BUYERS);
 const value=Math.round(units*bizUnit(id));
 startActivity({type:'bizdel',title:'LIEFERUNG',sub:`${units} Einheiten · Wert ${fmt$(value)}`,v,dest,value,units,id,t:0,amb:Math.random()<.45,text:'Lieferung: Steig in den Wagen',
  tick(A,dt){A.t+=dt;if(A.v.mode==='wreck'){BIZ.stock[A.id]+=A.units*.4;endActivity(false,'Wagen zerstört – Teil der Ware verloren');return;}
   if(P.inCar!==A.v&&!A.started){markAt(A.v.pos);return;}A.started=true;if(vehOut(A,dt,c=>c===A.v,'Lieferwagen'))return;A.text=`Lieferung: Bring die Ware zu: ${A.dest.n}`;markAt(A.dest);
   if(A.amb&&!A.chasers&&A.t>20){A.chasers=[0,1].map(k=>{const c=makeCar(0x2b0f0f,false,'suv');c.mode='evcop';c.target=A.v;c.pos.set(A.v.pos.x-Math.sin(A.v.h)*(40+k*12),0,A.v.pos.z-Math.cos(A.v.h)*(40+k*12));c.g.position.set(c.pos.x,groundY(c.pos.x,c.pos.z),c.pos.z);c.h=A.v.h;c.keep=true;cars.push(c);return c;});big('VERFOLGER!','Rivalen wollen deine Ware – häng sie ab!','#ff5050');if(Math.random()<.4)setWanted(Math.max(wanted,1));}
   if(distP(A.dest)<12&&Math.abs(A.v.speed)<4){const bonus=1-(1-A.v.hp/A.v.maxHp)*.3;const pay=Math.round(A.value*bonus);P.money+=pay;cashSound();cashPop('+'+fmt$(pay));endActivity(true,`Geliefert! +${fmt$(pay)}`);}},
  cleanup(A){A.v.keep=false;if(A.chasers)for(const c of A.chasers)if(cars.includes(c)){c.keep=false;removeCar(c);}}});}
function startProcure(id){if(!canStartSide())return;if((BIZ.stock[id]||0)>=bizCap(id)){toast('Der Ausstellungsraum ist voll');return;}const p=bizP(id),home=p.pos();
 let s=null;for(let k=0;k<40&&!s;k++){const r=pick(ROADS);const q=roadPoint(r,Math.random()*r.len);if(Math.hypot(q.x-home.x,q.z-home.z)>500)s=q;}if(!s){const c=curbPoint(300,800);s=c||{x:0,z:0};}
 const car=parkedCar(s.x+6,s.z,Math.random()*6,pick(NICE_COLORS),pick(['super','sport','muscle','limo','suv']));car.keep=true;car.alarm=Math.random()<.5;
 startActivity({type:'bizcar',title:'BESCHAFFUNG',sub:'Hol den Wagen und bring ihn unbeschädigt ins Autohaus',car,id,home,text:'Beschaffung: Hol dir den markierten Wagen',
  tick(A,dt){if(A.car.mode==='wreck'){endActivity(false,'Der Wagen ist Schrott');return;}if(P.inCar!==A.car){markAt(A.car.pos);A.text='Beschaffung: Hol dir den markierten Wagen';return;}
   A.text='Beschaffung: Bring den Wagen ins Autohaus'+(wanted?' (erst Polizei abhängen!)':'');markAt(A.home);
   if(distP(A.home)<10&&Math.abs(A.car.speed)<3&&wanted===0){BIZ.stock[A.id]=(BIZ.stock[A.id]||0)+1;exitCar(true);removeCar(A.car);P.money+=5000;cashSound();endActivity(true,`Wagen im Bestand (${BIZ.stock[A.id]}/${bizCap(A.id)}) · +$5.000`);}},
  cleanup(A){if(cars.includes(A.car))A.car.keep=false;}});}
function startPromo(id){if(!canStartSide())return;const p=bizP(id),q=p.pos();const v=parkedCar(q.x+6,q.z+4,0,0xff2bd6,'van');v.keep=true;
 const pts=[];for(let k=0;k<6;k++){const a=farNode(120,520);pts.push(nd(a.i,a.j));}
 startActivity({type:'promo',title:'PROMO-TOUR',sub:'Fahr mit dem Club-Van durch die Stadt',v,id,pts,i:0,timer:200,text:'Promo-Tour: Steig in den Club-Van',
  tick(A,dt){if(A.v.mode==='wreck'){endActivity(false,'Van zerstört');return;}if(P.inCar!==A.v&&!A.go){markAt(A.v.pos);return;}A.go=true;if(vehOut(A,dt,c=>c===A.v,'Club-Van'))return;A.timer-=dt;
   const t=A.pts[A.i];markAt(t);setMarkerNext(A.pts[A.i+1]||'finish');A.text=`Promo-Tour: Station ${A.i+1}/6`;setProg(`Promo-Tour · ${Math.ceil(A.timer)} s`,A.timer/200,'#ff5ad6');
   if(A.timer<=0){endActivity(false,'Zeit abgelaufen');return;}if(distP(t)<14){A.i++;tone(1000,.1,'sine',.05);if(A.i>=6){BIZ.pop[A.id]=Math.min(1.6,(BIZ.pop[A.id]||1)+.15);endActivity(true,`Beliebtheit jetzt ${Math.round(BIZ.pop[A.id]*100)} %`);}}},
  cleanup(A){A.v.keep=false;hideProg();}});}
// ---------- Start (Titelbildschirm) ----------
function bizUnlocked(){const d=loadGame();return !!(d&&d.prog&&d.prog.story);}
function openBizTitle(){let ov=$('bizsel');if(!ov||!ov.style){ov=document.createElement('div');ov.id='bizsel';document.body.appendChild(ov);}
 ov.style.cssText='position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(5,6,12,.86);font-family:Arial,sans-serif;color:#fff';
 const can=bizUnlocked(),cont=!!loadGame('portsolara_biz_v1');
 ov.innerHTML=`<div style="max-width:860px;width:92%;text-align:center"><h1 style="margin:0 0 6px;font-size:40px;letter-spacing:2px">BUSINESS-MODUS</h1>
  <p style="opacity:.85;margin:0 0 18px">Startkapital <b>$4.000.000</b> · Kaufe Geschäfte, Upgrades, Autos und Waffen und bau dein Imperium auf.</p>
  ${can?`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px">${Object.entries(BIZ_ROLES).map(([k,r])=>`<button data-r="${k}" style="cursor:pointer;text-align:left;padding:14px;border-radius:12px;border:2px solid #ffd23a55;background:#151826;color:#fff"><div style="font-size:30px">${r.icon}</div><b style="font-size:17px">${r.name}</b><div style="font-size:13px;opacity:.8;margin-top:6px">${r.desc}</div></button>`).join('')}</div>
   ${cont?'<p><button data-c="1" style="cursor:pointer;margin-top:16px;padding:10px 22px;border-radius:10px;border:0;background:#ffd23a;font-weight:bold">Business-Spielstand fortsetzen ▶</button></p>':''}`
  :'<p style="font-size:18px;background:#2a1a1a;padding:16px;border-radius:12px">Den Business-Modus schaltest du frei, indem du den <b>Story-Modus</b> komplett durchspielst (alle Missionen).</p>'}
  <p><button data-x="1" style="cursor:pointer;margin-top:14px;padding:8px 18px;border-radius:10px;border:1px solid #fff5;background:transparent;color:#fff">Zurück</button></p></div>`;
 ov.onclick=e=>{const b=e.target.closest('button');if(!b)return;uiClick();if(b.dataset.x){ov.style.display='none';return;}if(b.dataset.r){ov.style.display='none';startBusiness(b.dataset.r);}if(b.dataset.c){ov.style.display='none';continueBusiness();}};}
function bizEnterWorld(spawn){const sp=spawn||{x:SPECIAL['3,5'].door.x,z:SPECIAL['3,5'].door.z};P.pos.set(sp.x,0,sp.z);P.pos.y=groundY(sp.x,sp.z);P.face=Math.PI;camYaw=Math.PI;camPitch=.3;
 $('title').style.display='none';$('creator').style.display='none';$('hud').style.display='block';mode='play';last=performance.now();camera.position.set(P.pos.x,P.pos.y+3,P.pos.z+6);updateStaticLOD(true);P.char.g.visible=true;lockMouse();
 setTut(`<b>Business-Modus:</b> Mit <k>B</k> öffnest du die Business-App (auch im Pausemenü).<br>Gelbe <b>$</b> auf der Karte sind Geschäfte, die du kaufen kannst.`);setTimeout(()=>setTut(''),16000);}
function startBusiness(role){if(mode!=='title')return;goFullscreen();lockMouse();ensureAudio();
 BIZ.active=true;BIZ.role=role;BIZ.owned=[];BIZ.up={};BIZ.safe={};BIZ.stock={};BIZ.pop={};BIZ.raidT=600;BIZ.rank=0;BIZ.raid=null;
 const main=loadGame();P.name=(main&&main.name)||localStorage.getItem('portsolara_name')||'Boss';
 mi=missions.length;storyDone=true;PROG.mi=mi;PROG.story=true;PROG.unlockSeen=mi;P.money=4000000;P.armor=100;giveWeapon('pistol',60);giveWeapon('smg',150);
 const first=BIZ_PROPS.find(p=>p.role===role).pos();bizEnterWorld({x:first.x+4,z:first.z+6});
 big(BIZ_ROLES[role].icon+' '+BIZ_ROLES[role].name.toUpperCase(),'Startkapital $4.000.000','#ffd23a');waypoint={x:first.x,z:first.z};saveGame(true);}
function continueBusiness(){if(mode!=='title')return;const d=loadGame('portsolara_biz_v1');if(!d){toast('Kein Business-Spielstand');return;}goFullscreen();BIZ.active=true;
 const b=d.biz||{};Object.assign(BIZ,{role:b.role||'club',owned:b.owned||[],up:b.up||{},safe:b.safe||{},stock:b.stock||{},pop:b.pop||{},best:b.best||0,rank:b.rank||0,raid:null,raidT:600});
 applySave(d);mi=missions.length;storyDone=true;const q=(BIZ.owned.length?bizP(BIZ.owned[0]):BIZ_PROPS.find(p=>p.role===BIZ.role)).pos();bizEnterWorld({x:q.x+4,z:q.z+6});big('BUSINESS-MODUS',`${BIZ_ROLES[BIZ.role].name} · Vermögen ${fmt$(bizWorth())}`,'#ffd23a');}
function netStatus(t){const e=$('netstat');if(e&&e.style)e.innerHTML=t;}
function loadPeerJS(cb){if(window.Peer){cb();return;}const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js';s.onload=()=>cb();s.onerror=()=>netStatus('PeerJS konnte nicht geladen werden – bist du online?');document.head.appendChild(s);}
function openNetTitle(){let ov=$('netsel');if(!ov||!ov.style){ov=document.createElement('div');ov.id='netsel';document.body.appendChild(ov);}
 ov.style.cssText='position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(5,6,12,.88);font-family:Arial,sans-serif;color:#fff';
 ov.innerHTML=`<div style="max-width:560px;width:92%;text-align:center"><h1 style="margin:0 0 6px;font-size:38px">ONLINE</h1><p style="opacity:.85">Spiel mit Freunden zusammen: freies Spiel, Duelle, Rennen und Koop-Aufträge.<br>Einer erstellt einen Raum, die anderen treten mit dem Code bei (bis zu 4 Spieler).</p>
  <p><button data-h="1" style="cursor:pointer;padding:12px 26px;border-radius:12px;border:0;background:#3ee6ff;font-weight:bold;font-size:17px">Raum erstellen</button></p>
  <p><input id="netcode" maxlength="6" placeholder="CODE" style="text-transform:uppercase;font-size:20px;width:140px;text-align:center;padding:8px;border-radius:10px;border:0"> <button data-j="1" style="cursor:pointer;padding:10px 20px;border-radius:12px;border:0;background:#ffd23a;font-weight:bold">Beitreten</button></p>
  <div id="netstat" style="min-height:44px;margin:10px 0;font-size:15px"></div><p><button data-x="1" style="cursor:pointer;padding:8px 18px;border-radius:10px;border:1px solid #fff5;background:transparent;color:#fff">Zurück</button></p></div>`;
 ov.onclick=e=>{const b=e.target.closest('button');if(!b)return;uiClick();if(b.dataset.x){ov.style.display='none';if(NET.peer&&!NET.on){try{NET.peer.destroy();}catch(er){}NET.peer=null;}return;}
  if(b.dataset.h)netHost();if(b.dataset.j){const c=($('netcode').value||'').trim().toUpperCase();if(c.length<4){netStatus('Bitte den Code eingeben');return;}netJoin(c);}};}
function netHost(){netStatus('Verbinde mit dem Server …');loadPeerJS(()=>{const code=Array.from({length:5},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*32)]).join('');
 const peer=new window.Peer('portsolara-'+code);NET.peer=peer;NET.code=code;NET.host=true;
 peer.on('open',()=>{netStatus(`Dein Raum-Code: <b style="font-size:28px;letter-spacing:4px">${code}</b><br>Gib ihn deinen Freunden. <button id="netgo" style="margin-left:8px;padding:6px 14px;border-radius:8px;border:0;background:#7dff8a;font-weight:bold;cursor:pointer">Losspielen ▶</button>`);const g=$('netgo');if(g)g.onclick=()=>startOnlineWorld();});
 peer.on('connection',conn=>{if(NET.conns.length>=3){conn.on('open',()=>{conn.send({t:'full'});setTimeout(()=>conn.close(),300);});return;}netWire(conn);});
 peer.on('error',e=>netStatus('Fehler: '+(e.type||e)));});}
function netJoin(code){netStatus('Verbinde …');loadPeerJS(()=>{const peer=new window.Peer();NET.peer=peer;NET.host=false;NET.code=code;
 peer.on('open',()=>{const conn=peer.connect('portsolara-'+code,{reliable:true});netWire(conn);conn.on('open',()=>{netStatus('Verbunden! Es geht los …');setTimeout(startOnlineWorld,600);});});
 peer.on('error',e=>netStatus('Raum nicht gefunden oder Fehler: '+(e.type||e)));});}
function netWire(conn){NET.conns.push(conn);conn.on('open',()=>{conn.send({t:'hello',name:P.name||netName(),skin});if(NET.host)toast('Ein Spieler ist beigetreten!');});
 conn.on('data',m=>netRecv(m,conn));conn.on('close',()=>{NET.conns=NET.conns.filter(c=>c!==conn);const pl=NET.players.get(conn.peer);if(pl){netRemovePlayer(conn.peer);toast(pl.name+' hat den Raum verlassen');}if(!NET.host&&NET.on){big('VERBINDUNG GETRENNT','Der Host hat den Raum geschlossen','#ff5050');}});}
function netSend(m,except){m.from=NET.peer&&NET.peer.id;for(const c of NET.conns){if(c===except||!c.open)continue;try{c.send(m);}catch(e){}}}
function netRecv(m,conn){if(!m||!m.t)return;if(NET.host&&conn&&m.t!=='hello'){const fwd=Object.assign({},m);for(const c of NET.conns){if(c!==conn&&c.open)try{c.send(fwd);}catch(e){}}}
 const id=m.from||conn.peer;
 switch(m.t){
  case 'full':netStatus('Der Raum ist voll');break;
  case 'hello':{netAddPlayer(id,m.name,m.skin);toast(`${m.name} ist da!`);if(NET.host)for(const [pid,p] of NET.players){if(pid!==id)try{conn.send({t:'hello',from:pid,name:p.name,skin:p.skin});}catch(e){}}break;}
  case 'st':{const p=NET.players.get(id);if(p){p.st=m;p.lastT=time;}break;}
  case 'shot':netGotShot(m,id);break;
  case 'killed':{if(m.by===NET.peer.id){NET.score[NET.peer.id]=(NET.score[NET.peer.id]||0)+1;big('ERWISCHT!',`Punkte: ${NET.score[NET.peer.id]}`,'#7dff8a');netSend({t:'score',id:NET.peer.id,v:NET.score[NET.peer.id]});netDuelCheck();}break;}
  case 'score':{NET.score[m.id]=m.v;netDuelCheck();break;}
  case 'chat':{const p=NET.players.get(id);netChatLine((p?p.name:'?')+': '+m.txt);break;}
  case 'env':{if(!NET.host){tod=m.tod;lastEnvTod=-1;if(m.wx&&m.wx!==WX.type)setWeather(m.wx,false);}break;}
  case 'mode':netMode(m);break;
  case 'fin':{if(!NET.raceFin){NET.raceFin=id;const p=NET.players.get(id);big('RENNEN VORBEI',`${p?p.name:'Gegner'} war schneller (${m.time.toFixed(1)} s)`,'#ff9a3c');}break;}
  case 'npcs':netGotNpcs(m);break;
  case 'hitnpc':{if(NET.host&&NET.coop){const n=NET.coop.npcs[m.id];if(n&&peds.includes(n))damageNPC(n,m.dmg,new THREE.Vector3(m.dx||0,0,m.dz||1),'player');}break;}
  case 'hitcar':{if(NET.host&&NET.coop&&NET.coop.truck)damageCar(NET.coop.truck,m.dmg,'player');break;}
  case 'coopdone':{P.money+=m.reward;cashSound();big('KOOP-AUFTRAG ERFÜLLT',`+$${m.reward.toLocaleString('de-DE')}`,'#7dff8a');netClearCoop();break;}}}
// ---------- Mitspieler darstellen ----------
function netAddPlayer(id,name,sk){if(NET.players.has(id))return;const s=Object.assign({},sk||randomSkin());for(const k in SK)if(!(s[k]>=0&&s[k]<SK[k].length))s[k]=0;const c=buildChar(s);scene.add(c.g);
 const lab=new THREE.Sprite(new THREE.SpriteMaterial({map:canvasTex(256,64,(g,w,h)=>{g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,8,w,48);g.font='bold 34px Arial';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#3ee6ff';g.fillText(name,w/2,33);}),transparent:true,depthWrite:false,fog:false}));lab.scale.set(2.6,.65,1);scene.add(lab);
 NET.players.set(id,{id,name,skin:s,c,lab,car:null,st:null,lastT:time,ph:0});}
function netRemovePlayer(id){const p=NET.players.get(id);if(!p)return;scene.remove(p.c.g);p.c.dispose();scene.remove(p.lab);if(p.car&&cars.includes(p.car))removeCar(p.car);NET.players.delete(id);}
function netPlayersTick(dt){for(const p of NET.players.values()){const s=p.st;if(!s)continue;const g=p.c.g;
  if(s.car){if(!p.car||p.car.vt!==s.car.vt){if(p.car&&cars.includes(p.car))removeCar(p.car);const c=makeCar(s.car.col,s.car.vt==='police',s.car.vt==='police'?undefined:s.car.vt);c.mode='net';c.netOf=p.id;c.pos.set(s.x,0,s.z);c.h=s.car.h;c.g.position.set(s.x,s.y,s.z);cars.push(c);p.car=c;}
   const c=p.car,k=Math.min(1,dt*10);c.pos.x+=(s.x-c.pos.x)*k;c.pos.z+=(s.z-c.pos.z)*k;c.h=lerpAng(c.h,s.car.h,k);c.speed=s.car.sp;g.visible=false;}
  else{if(p.car){if(cars.includes(p.car))removeCar(p.car);p.car=null;}g.visible=!s.air;const k=Math.min(1,dt*12);g.position.x+=(s.x-g.position.x)*k;g.position.y+=(s.y-g.position.y)*k;g.position.z+=(s.z-g.position.z)*k;g.rotation.y=lerpAng(g.rotation.y,s.f,k);
   if(s.dead){g.rotation.x=-Math.PI/2;}else{g.rotation.x=0;p.ph+=dt*(s.w>.7?9:6);if(s.w>.06)animWalk(p.c,p.ph,s.w);else animIdle(p.c);}}
  p.lab.position.set(s.car?p.car.pos.x:g.position.x,(s.car?p.car.g.position.y+2.6:g.position.y+2.4),s.car?p.car.pos.z:g.position.z);
  if(time-p.lastT>12){toast(p.name+' reagiert nicht mehr');netRemovePlayer(p.id);}}}
function updateNetCar(c,dt){/* Position kommt übers Netz */}
// ---------- Schüsse über das Netz (der Getroffene entscheidet selbst) ----------
function netSendShot(o,d,w,mz){if(!NET.on)return;netSend({t:'shot',o:[o.x,o.y,o.z],d:[d.x,d.y,d.z],dmg:w.dmg,rng:w.range||80,mz:[mz.x,mz.y,mz.z]});
 if(NET.coop&&!NET.host){let best=null,bt=1e9;for(const [id,pu] of NET.cpup){if(pu.dn)continue;const t=charHit(o,d,pu.c.g.position,w.range||80,.45,1.85);if(t>=0&&t<bt){bt=t;best=id;}}
  if(best!=null&&worldHitT(o,d,bt)>=bt-.5)netSend({t:'hitnpc',id:best,dmg:w.dmg,dx:d.x,dz:d.z});
  if(NET.coop.truckPup&&NET.coop.truckPup.mode!=='wreck'){const t=sphereHit(o,d,tmpV.set(NET.coop.truckPup.pos.x,NET.coop.truckPup.g.position.y+1,NET.coop.truckPup.pos.z),2.4,w.range||80);if(t>=0)netSend({t:'hitcar',dmg:w.dmg});}}}
function netGotShot(m,from){const o=new THREE.Vector3(...m.o),d=new THREE.Vector3(...m.d),mz=new THREE.Vector3(...m.mz);const blk=worldHitT(o,d,m.rng);let end=o.clone().addScaledVector(d,blk);
 if(!P.dead&&mode==='play'&&(NET.mode==='duel'||NET.pvp)){const base=P.inCar?P.inCar.g.position:P.pos;const t=charHit(o,d,base,blk,P.inCar?1.7:.45,P.inCar?2.2:1.85);
  if(t>=0){end=o.clone().addScaledVector(d,t);const was=P.dead;hurtPlayer(m.dmg*(NET.mode==='duel'?1:.7),o);if(!was&&P.dead)netSend({t:'killed',by:from});}}
 tracer(mz,end);flash(mz,.4);gunSound(.12,'pistol',mz);}
function netMode(m){if(m.m==='duel'){NET.mode='duel';NET.score={};NET.duelTo=m.to||10;giveWeapon('rifle',300);giveWeapon('shotgun',60);giveWeapon('smg',300);P.hp=100;P.armor=100;duelRespawn();big('DUELL!',`Wer zuerst ${NET.duelTo} Treffer landet, gewinnt`,'#ff5050');}
 else if(m.m==='race'){NET.mode='race';NET.raceFin=null;window.__NETRACE=true;if(race)endRace(false,true);startRace(m.k,false);window.__NETRACE=false;big('ONLINE-RENNEN',RACES[m.k].name,'#ffd23a');}
 else if(m.m==='coop'){NET.mode='coop';NET.coop={type:m.type,pos:m.pos,npcs:[],truck:null};big('KOOP-AUFTRAG',m.title,'#7fd1ff');waypoint={x:m.pos.x,z:m.pos.z};if(NET.host)netCoopSpawn(m);}
 else if(m.m==='end'){NET.mode=null;netClearCoop();toast('Modus beendet – freies Spiel');}}
function hostMode(m){if(!NET.host)return;netSend(m);netMode(m);}
function duelRespawn(){const sp=pick(DUEL_SPAWNS());P.dead=false;P.hp=100;P.armor=50;if(P.inCar)exitCar(true);P.pos.set(sp.x+R(-5,5),0,sp.z+R(-5,5));P.pos.y=groundY(P.pos.x,P.pos.z);P.char.g.rotation.set(0,0,0);setWanted(0);}
function netDuelCheck(){if(NET.mode!=='duel')return;for(const [id,v] of Object.entries(NET.score)){if(v>=NET.duelTo){const me=id===NET.peer.id;const p=NET.players.get(id);big(me?'DU HAST GEWONNEN!':'DUELL VERLOREN',me?'+$5.000':(p?p.name:'Gegner')+' gewinnt','#ffd23a');if(me){P.money+=5000;cashSound();}NET.mode=null;break;}}}
function netCoopSpawn(m){const q=m.pos;const C=NET.coop;C.npcs=[0,1,2,3,4,5].map(k=>{const a=k/6*Math.PI*2;return spawnGang(q.x+Math.cos(a)*14,q.z+Math.sin(a)*14,true,true,{topC:0x3a2a1a,pantsC:0x1b1b1b,extra:7,boss:k===0,name:k===0?'Zielperson':undefined,hp:k===0?400:110});});}
function netClearCoop(){const C=NET.coop;if(!C)return;for(const [id,pu] of NET.cpup){scene.remove(pu.c.g);pu.c.dispose();}NET.cpup.clear();NET.coop=null;NET.mode=NET.mode==='coop'?null:NET.mode;waypoint=null;}
function netGotNpcs(m){if(NET.host||!NET.coop)return;for(const s of m.l){let pu=NET.cpup.get(s.i);if(!pu){const sk=randomSkin();sk.topC=0x3a2a1a;sk.pantsC=0x1b1b1b;sk.extra=7;const c=buildChar(sk);scene.add(c.g);pu={c,ph:0};NET.cpup.set(s.i,pu);}
 const g=pu.c.g;g.position.set(s.x,s.y,s.z);g.rotation.y=s.r;pu.dn=s.dn;if(s.dn){g.rotation.x=-Math.PI/2;}else{g.rotation.x=0;pu.ph+=.4;if(s.mv)animWalk(pu.c,pu.ph,.6);else animIdle(pu.c);}}}
function netCoopTick(dt){const C=NET.coop;if(!C||!NET.host)return;C.syncT=(C.syncT||0)-dt;if(C.syncT<=0){C.syncT=.15;netSend({t:'npcs',l:C.npcs.map((n,i)=>{const g=n.c.g;return {i,x:+g.position.x.toFixed(2),y:+g.position.y.toFixed(2),z:+g.position.z.toFixed(2),r:+g.rotation.y.toFixed(2),dn:n.downOnce||n.state==='ko'||!peds.includes(n),mv:n.state==='fight'};})});}
 if(C.npcs.length&&allDown(C.npcs)){const rw=12000;netSend({t:'coopdone',reward:rw});P.money+=rw;cashSound();big('KOOP-AUFTRAG ERFÜLLT',`+$${rw.toLocaleString('de-DE')}`,'#7dff8a');netClearCoop();}}
// ---------- Netz-Takt ----------
function netTick(dt){if(!NET.on)return;netPlayersTick(dt);netCoopTick(dt);
 NET.sendT-=dt;if(NET.sendT<=0){NET.sendT=1/12;const c=P.inCar;netSend({t:'st',x:+(c?c.pos.x:P.pos.x).toFixed(2),y:+(c?c.g.position.y:P.pos.y).toFixed(2),z:+(c?c.pos.z:P.pos.z).toFixed(2),f:+P.face.toFixed(2),w:+(P.walkA||0).toFixed(2),dead:P.dead,air:!!P.inAir,
  car:c&&!c.boat?{vt:c.police?'police':c.vt,col:c.color??0x888888,h:+c.h.toFixed(3),sp:+c.speed.toFixed(1)}:null});}
 if(NET.host){NET.envT-=dt;if(NET.envT<=0){NET.envT=5;netSend({t:'env',tod,wx:WX.type});}}
 if(NET.mode==='race'&&race&&race.result&&!NET.sentFin){NET.sentFin=true;netSend({t:'fin',time:race.t});if(!NET.raceFin){NET.raceFin='me';big('GEWONNEN!','Du warst als Erste(r) im Ziel','#7dff8a');P.money+=3000;}}
 if(NET.mode!=='race')NET.sentFin=false;}
// Chat (Enter)
function netChatLine(t){const f=$('netchat');if(!f||!f.style)return;const d=document.createElement('div');d.textContent=t;f.appendChild(d);while(f.children.length>6)f.removeChild(f.firstChild);setTimeout(()=>{if(d.parentNode)d.parentNode.removeChild(d);},14000);}
function netChatOpen(){if(!NET.on||NET.chatOpen)return;NET.chatOpen=true;const i=document.createElement('input');i.id='netin';i.maxLength=80;i.placeholder='Nachricht … (Enter senden, Esc abbrechen)';i.style.cssText='position:fixed;left:16px;bottom:220px;width:340px;z-index:70;padding:8px;border-radius:8px;border:0;font-size:15px';document.body.appendChild(i);try{document.exitPointerLock();}catch(e){}i.focus();
 i.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'){const t=i.value.trim();if(t){netSend({t:'chat',txt:t});netChatLine((P.name||'Ich')+': '+t);}i.remove();NET.chatOpen=false;clearKeys();lockMouse();}else if(e.key==='Escape'){i.remove();NET.chatOpen=false;clearKeys();}};}
function openNetMenu(){if(!NET.on)return;openPanel(`Online · Raum ${NET.code}`,()=>{const L=[];for(const p of NET.players.values())L.push({label:''+p.name,sub:NET.mode==='duel'?`Punkte: ${NET.score[p.id]||0}`:'Mitspieler',right:'',act(){const s=p.st;if(s){waypoint={x:s.x,z:s.z};closePanel();}}});
  L.push({label:NET.pvp?'Freies Spiel: Schaden zwischen Spielern AN':'Freies Spiel: Schaden zwischen Spielern AUS',sub:'Nur für dich – im Duell zählt immer jeder Treffer',right:NET.pvp?'AN':'AUS',act(){NET.pvp=!NET.pvp;}});
  if(NET.host){L.push({label:'Duell starten',sub:'Alle gegen alle in der Innenstadt – erster mit 10 Treffern gewinnt',right:'',act(){closePanel();hostMode({t:'mode',m:'duel',to:10});}});
   RACES.forEach((r,k)=>L.push({label:'Rennen: '+r.name,sub:'Alle starten gleichzeitig',right:'',act(){closePanel();hostMode({t:'mode',m:'race',k});}}));
   L.push({label:'Koop-Auftrag: Kopfgeld',sub:'Schaltet zusammen eine Gang und ihre Zielperson aus',right:'',act(){closePanel();const s=pick(COOP_SPOTS);hostMode({t:'mode',m:'coop',type:'bounty',pos:{x:s.x,z:s.z},title:'Kopfgeld: '+s.n});}});
   L.push({label:'Modus beenden',sub:'Zurück ins freie Spiel',right:'',act(){closePanel();hostMode({t:'mode',m:'end'});}});}
  L.push({label:'Raum verlassen',sub:'Zurück zum Titelbildschirm',right:'',act(){closePanel();try{NET.peer.destroy();}catch(e){}location.reload();}});return L;},
 ()=>`Raum-Code <b>${NET.code}</b> · ${NET.players.size+1} Spieler${NET.host?' · Du bist Host':''}<br><small>Enter = Chat · O = dieses Menü</small>`);}
function startOnlineWorld(){if(NET.on)return;const ov=$('netsel');if(ov&&ov.style)ov.style.display='none';NET.on=true;window.__NETON=true;goFullscreen();ensureAudio();
 const d=loadGame();if(d)applySave(d);else{P.money=25000;P.name=netName();}mi=missions.length;storyDone=true;
 const sp=nd(7,7);P.pos.set(sp.x+R(-6,6),0,sp.z+R(-6,6));P.pos.y=groundY(P.pos.x,P.pos.z);$('title').style.display='none';$('creator').style.display='none';$('hud').style.display='block';mode='play';last=performance.now();camera.position.set(P.pos.x,P.pos.y+3,P.pos.z+6);P.char.g.visible=true;lockMouse();
 let f=$('netchat');if(!f||!f.style){f=document.createElement('div');f.id='netchat';f.style.cssText='position:fixed;left:16px;bottom:262px;z-index:40;font:14px Arial;color:#fff;text-shadow:0 1px 3px #000;pointer-events:none;max-width:360px';document.body.appendChild(f);}
 big('ONLINE',NET.host?`Raum ${NET.code} · Warte auf Freunde`:'Verbunden mit Raum '+NET.code,'#3ee6ff');setTut('<b>Online:</b> <k>O</k> = Online-Menü (Duell, Rennen, Koop) · <k>Enter</k> = Chat');setTimeout(()=>setTut(''),15000);
 for(const c of NET.conns)if(c.open)c.send({t:'hello',name:P.name,skin,from:NET.peer.id});}
function syncAdaptiveDistances(){const far=getEffectiveGfxFar(),near=getEffectiveGfxNear();cullCar=far*1.18+12;cullPed=far+3;scene.fog.near=Math.max(12,near*.7);scene.fog.far=far+24;camera.far=Math.max(6000,far+500);camera.updateProjectionMatrix();if(mode==='play'&&!(typeof DEV_CAM!=='undefined'&&DEV_CAM.active))updateStaticLOD(true);}
function applyQuality(){const q=SET.quality;gfxDynamicScale=1;renderer.setPixelRatio(PR());composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(innerWidth,innerHeight);
 renderer.shadowMap.enabled=q>=1;sun.castShadow=q>=1;const ms=q>=2?2048:q===1?1024:512;if(sun.shadow.mapSize.x!==ms){sun.shadow.mapSize.set(ms,ms);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}}
 bloom.enabled=q>=1;syncAdaptiveDistances();
}
function setGfxPreset(id){SET.gfxPreset=id;if(GFX_PRESETS[id]){const p=GFX_PRESETS[id];SET.gfxNear=p.near;SET.gfxFar=p.far;SET.gfxResolution=p.res;SET.quality=p.quality;}else if(id==='custom'){SET.quality=SET.gfxResolution<.6?0:SET.gfxResolution<1.05?1:2;}
 saveSettings();applyQuality();}

function openPause(tab){if(mode!=='play')return;pauseOpen=true;mode='menu';for(const k in K)K[k]=false;aimHeld=false;fireHeld=false;try{(document.exitPointerLock||document.webkitExitPointerLock||(()=>{})).call(document);}catch(e){}const mapMode=tab==='map';$('pause').classList.toggle('mapmode',mapMode);const ph=document.querySelector('#pause h1');if(ph)ph.textContent=mapMode?'KARTE':'PAUSE';const pr=$('presume');if(pr)pr.textContent=mapMode?'KARTE SCHLIESSEN (M)':'WEITER';if(!mapMode&&(tab||pauseTab)==='map')tab='stats';try{renderPauseInfo(mapMode);}catch(e){}$('pause').style.display='flex';try{$('pbiz').style.display=BIZ.active?'':'none';$('pnet').style.display=NET.on?'':'none';}catch(e){}showPauseTab(tab||pauseTab);uiClick();applyVolumes();}
function renderPauseInfo(mapMode){const el=$('pinfo');if(!el)return;
 const cur=mission?mission.name:(typeof storyDone!=='undefined'&&storyDone)?'Story abgeschlossen':(missions[mi]?'Als Nächstes: '+missions[mi].name:'–');
 const it=(k,v)=>`<div class="pstat"><span>${k}</span><b>${v}</b></div>`;
 el.innerHTML=it('Geld','$'+(P.money||0).toLocaleString('de-DE'))+it('Gesundheit',Math.max(0,Math.round(P.hp))+(P.armor>0?' · Rüstung '+Math.round(P.armor):''))+it('Fahndung',wanted>0?'★'.repeat(wanted):'keine')+it('Mission',cur)+it('Gebiet',areaName(P.pos.x,P.pos.z))+it('Uhrzeit',($('clock')&&$('clock').textContent)||'–')
  +`<div class="pkeys">${mapMode?'M oder Esc: Karte schließen':'Esc oder P: Weiter · M: Karte'}</div>`;}
function closePause(){if(!pauseOpen)return;pauseOpen=false;$('pause').style.display='none';if(!panelOpen){mode='play';last=performance.now();lockMouse();}uiClick();applyVolumes();}
