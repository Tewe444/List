'use strict';
function clubInside(cl,p){return Math.abs(p.x-cl.cx)<cl.W/2-.3&&Math.abs(p.z-cl.cz)<cl.D/2-.3;}
function initClubs(){for(const cl of CLUBS){const y=cl.y0;const g='club:'+cl.name;
  puppet(cl.dj.x,cl.dj.z,0,'dj',{group:g,y});
  puppet(cl.bar.x-2.5,cl.bar.z,Math.PI/2,'bar',{group:g,y,skin:{oberteil:3,oberteilfarbe:1}});
  for(let k=0;k<16;k++){const x=cl.floor.x-6+Math.random()*12,z=cl.floor.z-3.5+Math.random()*7;puppet(x,z,Math.random()*6.28,'dance',{group:g,y,st:k%3});}
  for(let k=0;k<4;k++)puppet(cl.bar.x+.9,cl.bar.z-5+k*2.4,-Math.PI/2,'idle',{group:g,y});
  for(const dz of [-5,0,5])puppet(cl.vip.x+6.6,cl.vip.z+dz,-Math.PI/2,'sit',{group:g,y:y+.6});
  puppet(cl.vip.x-.6,cl.vip.z-6.8,Math.PI/2,'idle',{group:g,y,skin:{statur:2,oberteil:2,oberteilfarbe:1,extra:1}});
  puppet(cl.door.x+2.6,cl.door.z+.6,0,'idle',{group:g,skin:{statur:2,oberteil:2,oberteilfarbe:1,extra:1}});
  const vipGate=addSolid(cl.vip.x-.1,cl.vip.x+.1,cl.vip.z-6,cl.vip.z+6,y+3);vipGate.vipClub=cl.name;cl.gate=vipGate;
  addInteract({x:cl.bar.x+.9,z:cl.bar.z,r:3.2,label:'An der Bar bestellen',cond:()=>!P.inCar,use(){openBar(cl);return false;}});
  addInteract({x:cl.floor.x,z:cl.floor.z,r:5,label:'Tanzen',cond:()=>!P.inCar&&!P.dancing,use(){P.dancing=true;P.danceSt=Math.floor(Math.random()*3);toast('Du tanzt! (Bewegen zum Aufhören)');return false;}});
  addInteract({x:cl.vip.x-1.2,z:cl.vip.z,r:2.4,label:'VIP-Bereich ($500)',cond:()=>!P.inCar&&!CLUBVIP[cl.name]&&!ownsClub(cl.name),use(){if(P.money<500){toast('Dafür reicht dein Geld nicht');return false;}P.money-=500;cashSound();CLUBVIP[cl.name]=true;toast('Willkommen in der VIP-Lounge!');return false;}});}}
function ownsClub(name){return typeof BIZ!=='undefined'&&BIZ.active&&BIZ.owned&&BIZ.owned.includes('club:'+name);}
function openBar(cl){openPanel(cl.name+' – Bar',()=>[
 {label:'Sonnen-Cocktail',sub:'Fruchtig – du fühlst dich beschwingt',price:15,act(){eat(5);P.tipsy=Math.min(40,(P.tipsy||0)+14);toast('Prost!');}},
 {label:'Neon-Limo',sub:'+10 Gesundheit',price:6,act(){eat(10);}},
 {label:'Energy-Drink',sub:'+20 Gesundheit',price:12,act(){eat(20);}},
 {label:'Runde für alle',sub:'Der ganze Club jubelt dir zu',price:300,act(){big('RUNDE FÜR ALLE!','Der Club feiert dich','#ff5ad6');}}]);}
function clubTick(dt){const cp=camera.position;let inside=null;
 for(const cl of CLUBS){const d=Math.hypot(cp.x-cl.cx,cp.z-cl.cz);const near=d<70;cl.tiles.visible=cl.ball.visible=near;for(const b of cl.beams)b.piv.visible=near;for(const l of cl.lasers)l.piv.visible=near;if(!near)continue;
  const t=time,bpm=2.1;const beat=Math.floor(t*bpm),bf=(t*bpm)%1;
  for(let i=0;i<14;i++)for(let j=0;j<8;j++){const k=i*8+j;const w=Math.sin(i*.7+t*3)+Math.cos(j*.9-t*2.2);const on=((i+j+beat)%3===0)||w>1.2;const c=on?(((i+beat)%2)?cl.colA:cl.colB):tmpC.setRGB(.02,.02,.04);tmpC2.copy(c).multiplyScalar(on?1.6*(1-bf*.5):1);cl.tiles.setColorAt(k,tmpC2);}
  cl.tiles.instanceColor.needsUpdate=true;
  for(const b of cl.beams){b.piv.rotation.x=Math.sin(t*.9+b.ph)*.7;b.piv.rotation.z=Math.cos(t*.7+b.ph*1.7)*.7;}
  for(const l of cl.lasers){l.piv.rotation.y=Math.sin(t*1.3+l.ph*.6)*.9;l.piv.rotation.x=.12+Math.sin(t*2.1+l.ph)*.1;l.piv.visible=(beat%4)<2;}
  cl.ball.rotation.y+=dt*.8;
  cl.bt-=dt;if(cl.bt<=0){cl.bt=1/12;const g=cl.led.getContext('2d'),W=256,H=96;g.fillStyle='#000';g.fillRect(0,0,W,H);for(let b=0;b<32;b++){const v=(Math.sin(b*.6+t*5)+Math.sin(b*1.7-t*7)+2)/4*(1-bf*.4);const h=v*H;const gr=g.createLinearGradient(0,H,0,H-h);gr.addColorStop(0,'#'+cl.colA.getHexString());gr.addColorStop(1,'#'+cl.colB.getHexString());g.fillStyle=gr;g.fillRect(b*8+1,H-h,6,h);}
   g.font='bold 18px Arial';g.fillStyle='#fff';g.textAlign='center';g.fillText(cl.name.toUpperCase(),W/2,18);cl.ledT.needsUpdate=true;}
  if(clubInside(cl,P.pos))inside=cl;}
 // Beat nur drinnen
 if(inside&&AC){clubBeatT-=dt;if(clubBeatT<=0){clubBeatT=1/2.1;const b=Math.floor(time*2.1);const pos=new THREE.Vector3(inside.dj.x,2,inside.dj.z);tone(52,.16,'sine',.16,pos);if(b%2)tone(9000,.03,'square',.012,pos);if(b%4===2)tone(180,.12,'triangle',.05,pos);tone([55,55,65,49][b%4]*2,.22,'sawtooth',.025,pos);}}
 if(P.dancing&&(!inside||P.inCar||key('KeyW','ArrowUp')||key('KeyS','ArrowDown')||key('KeyA','ArrowLeft')||key('KeyD','ArrowRight')||(AN.on&&Math.hypot(AN.x,AN.y)>.3)))P.dancing=false;
 if(P.tipsy>0)P.tipsy=Math.max(0,P.tipsy-dt);
 for(const cl of CLUBS)if(cl.gate)cl.gate.open=!!(CLUBVIP[cl.name]||ownsClub(cl.name));}
function blockAt(x,z){if(Math.abs(x)>HALF+ROAD||Math.abs(z)>HALF+ROAD)return null;const i=clamp(Math.floor((x+HALF)/CELL),0,N-1),j=clamp(Math.floor((z+HALF)/CELL),0,N-1);return blockInfo[i*N+j]||null;}
function blockWealth(b){let w=DIST_WEALTH[b.type]??.5;if(b.type==='residential')w=b.j<=3?.82:.62;return w;}
function wealthAt(x,z){for(const q of ZONES){if(q.ring||q.region)continue;const ins=q.cx!=null?Math.hypot(x-q.cx,z-q.cz)<q.r:(x>q.x0&&x<q.x1&&z>q.z0&&z<q.z1);if(!ins)continue;if(q.poor)return .06;const w=WEALTH_ZONE[q.name];if(w!=null)return w;}
 if(typeof onIsland==='function'&&onIsland({x,z}))return .9;const b=blockAt(x,z);if(b)return blockWealth(b);return .42;}
function classSkin(cls){const s=randomSkin();
 if(cls==='rich'){s.oberteil=pick([5,5,3,3,2,5]);s.topC=pick([0x1b2433,0x2b2b2b,0x3a3f4a,0xece8df,0x5a2a2a,0x23395d,0xf4f4f4,0x2f4a3a,0xd9c7a7]);
  s.hose=s.koerper===1?pick([4,3,4,3]):4;s.pantsC=pick([0x1b1f27,0x2a2a2a,0x3d3a36,0xd8d2c4,0x23395d,0x111111]);s.schuhe=pick([1,5,1]);s.extra=pick([0,1,2,5,0,1,2]);
  if(s.frisur===3||s.frisur===6&&s.koerper===1)s.frisur=s.koerper===1?pick([2,5,8]):1;if(s.statur===4)s.statur=1;}
 else if(cls==='poor'){s.oberteil=pick([0,1,1,4,2,0]);s.topC=pick(MUTED);s.hose=pick([0,1,1,0]);s.pantsC=pick([0x2c3440,0x3a3328,0x4a4a44,0x2b2b2b,0x5b5346]);
  s.schuhe=pick([1,5,1]);s.extra=s.koerper===1?pick([0,3,7,0]):pick([0,3,7,6,6,0]);if(s.hose===3)s.hose=0;}
 else if(cls==='beach'){s.oberteil=pick([0,4,4,0,3]);s.hose=2;s.topC=pick([0xf2f2f2,0xf1c40f,0x1f8a8a,0xe84393,0x27ae60,0xff7f50,0x5dade2]);s.pantsC=pick([0x1f5fbf,0xe67e22,0x27ae60,0xc0392b,0xf2f2f2]);s.extra=pick([1,1,3,0]);s.schuhe=pick([0,2,3]);}
 else{if(s.oberteil===5&&Math.random()<.6)s.oberteil=pick([0,2,3]);}
 return s;}

// ---------- Animations-Posen (Puppen und echte Passanten) ----------
function applyAnim(c,anim,t,st){switch(anim){
 case 'dance':animDance(c,t,st);break;case 'break':animDance(c,t,3);break;
 case 'clap':{animIdle(c);const k=Math.abs(Math.sin(t*7));c.armL.rotation.x=c.armR.rotation.x=-1.2;c.armL.rotation.z=-.15-.35*k;c.armR.rotation.z=.15+.35*k;c.foreL.rotation.x=c.foreR.rotation.x=-1.1;break;}
 case 'dj':{animIdle(c);const k=Math.sin(t*13.2);c.head.rotation.x=.25*Math.abs(k);c.armL.rotation.x=-1.2;c.foreL.rotation.x=-.6;c.armR.rotation.x=-1.1+.15*k;c.foreR.rotation.x=-.8;if(Math.sin(t*.7)>.8){c.armR.rotation.z=2.6;c.armR.rotation.x=0;}break;}
 case 'bar':{animIdle(c);c.armR.rotation.x=-.9+Math.sin(t*2)*.3;c.foreR.rotation.x=-1.2;break;}
 case 'sit':case 'sitb':{poseReset(c);c.hips.position.y=.55;c.legL.rotation.x=c.legR.rotation.x=-1.5;c.shinL.rotation.x=c.shinR.rotation.x=1.5;c.armL.rotation.x=c.armR.rotation.x=-.4;c.head.rotation.y=Math.sin(t*.3+st)*.3;if(anim==='sitb'){c.armL.rotation.z=-.25;c.armR.rotation.z=.25;c.spine.rotation.x=-.08;}break;}
 case 'read':{poseReset(c);c.hips.position.y=.55;c.legL.rotation.x=c.legR.rotation.x=-1.5;c.shinL.rotation.x=c.shinR.rotation.x=1.5;c.armL.rotation.x=c.armR.rotation.x=-.95;c.foreL.rotation.x=c.foreR.rotation.x=-.85;c.armL.rotation.z=-.18;c.armR.rotation.z=.18;c.head.rotation.x=.35;break;}
 case 'type':{animIdle(c);c.armL.rotation.x=c.armR.rotation.x=-.78;c.foreL.rotation.x=-.85+Math.sin(t*13)*.07;c.foreR.rotation.x=-.85+Math.sin(t*11+1)*.07;c.armL.rotation.z=-.12;c.armR.rotation.z=.12;c.head.rotation.x=.18;break;}
 case 'work':{animIdle(c);const k=Math.sin(t*3.2);c.armR.rotation.x=-2.55+k*.22;c.foreR.rotation.x=-.45+k*.25;c.armL.rotation.x=-2.3;c.foreL.rotation.x=-.35;c.head.rotation.x=-.5;break;}
 case 'wait':{animIdle(c);c.head.rotation.y=Math.sin(t*.45+st)*.55;c.head.rotation.x=.05;break;}
 case 'phone':{animIdle(c);c.armR.rotation.x=-.7;c.armR.rotation.z=.22;c.foreR.rotation.x=-2.3;c.handR.rotation.z=.3;c.head.rotation.y=Math.sin(t*.6)*.25-.15;c.head.rotation.z=-.08;c.armL.rotation.x=-.15*Math.max(0,Math.sin(t*1.3));c.foreL.rotation.x=-.4*Math.max(0,Math.sin(t*1.3));break;}
 case 'chat':{animIdle(c);const a=Math.sin(t*2.3+st),b=Math.sin(t*1.9+1+st);c.armL.rotation.x=-.35+.25*a;c.foreL.rotation.x=-.9-.2*a;c.armR.rotation.x=-.3+.2*b;c.foreR.rotation.x=-.75-.3*b;c.armL.rotation.z=-.2;c.armR.rotation.z=.2;c.head.rotation.x=.08*Math.sin(t*3.1);c.head.rotation.y=.2*Math.sin(t*.5+st);break;}
 case 'listen':{animIdle(c);c.armL.rotation.x=c.armR.rotation.x=-.25;c.foreL.rotation.x=c.foreR.rotation.x=-1.3;c.armL.rotation.z=-.05;c.armR.rotation.z=.05;c.head.rotation.x=.12*Math.sin(t*1.7)*Math.sin(t*.3);break;}
 case 'warm':{animIdle(c);const k=Math.sin(t*2.1+st);c.armL.rotation.x=c.armR.rotation.x=-1.05;c.foreL.rotation.x=c.foreR.rotation.x=-.45+.08*k;c.armL.rotation.z=-.08;c.armR.rotation.z=.08;c.spine.rotation.x=.12;c.head.rotation.x=.25;break;}
 case 'lie':{poseReset(c);c.armL.rotation.z=-.35;c.armR.rotation.z=.35;c.legL.rotation.z=.06;c.legR.rotation.z=-.06;c.head.rotation.y=Math.sin(t*.2+st)*.4;if(st%2){c.armL.rotation.z=-2.7;c.armR.rotation.z=2.7;c.foreL.rotation.x=c.foreR.rotation.x=-1.6;}break;}
 case 'guitar':{animIdle(c);const k=Math.sin(t*9.5);c.armL.rotation.x=-.85;c.armL.rotation.z=-.5;c.foreL.rotation.x=-1.35;c.armR.rotation.x=-.45+.08*k;c.armR.rotation.z=.3;c.foreR.rotation.x=-1.25+.12*k;c.head.rotation.x=.25+.06*Math.sin(t*4.7);c.head.rotation.z=.1*Math.sin(t*2.35);break;}
 case 'photo':{animIdle(c);c.armL.rotation.x=c.armR.rotation.x=-1.25;c.foreL.rotation.x=c.foreR.rotation.x=-1.25;c.armL.rotation.z=-.42;c.armR.rotation.z=.42;c.head.rotation.x=-.05;break;}
 case 'pose':{animIdle(c);c.armR.rotation.z=1.25+.1*Math.sin(t*2);c.foreR.rotation.x=-.4;c.armL.rotation.z=-.3;c.head.rotation.z=.1;break;}
 case 'eat':{animIdle(c);const k=Math.max(0,Math.sin(t*1.1+st));c.armR.rotation.x=-.4-1.1*k;c.foreR.rotation.x=-.6-1.4*k;c.head.rotation.x=.08*k;break;}
 case 'look':{animIdle(c);c.head.rotation.y=.6+Math.sin(t*.3+st)*.25;c.head.rotation.x=.12;c.armL.rotation.x=-.12;c.armR.rotation.x=-.12;break;}
 case 'stretch':{animIdle(c);const k=Math.sin(t*1.4);c.spine.rotation.z=.25*k;c.armL.rotation.z=-2.6;c.armR.rotation.z=2.6;c.legL.rotation.z=.12;c.legR.rotation.z=-.12;break;}
 case 'sitEat':case 'sitChat':case 'sitPhone':case 'sitType':{applyAnim(c,anim==='sitEat'?'eat':anim==='sitChat'?'chat':anim==='sitPhone'?'phone':'type',t,st);c.hips.position.set(0,.55,0);c.hips.rotation.z=0;c.spine.rotation.z=0;c.legL.rotation.x=c.legR.rotation.x=-1.5;c.legL.rotation.z=c.legR.rotation.z=0;c.shinL.rotation.x=c.shinR.rotation.x=1.5;if(anim==='sitType')c.head.rotation.x=.22;break;}
 case 'guard':{animIdle(c);c.armL.rotation.x=-.42;c.armL.rotation.z=.2;c.foreL.rotation.x=-1.15;c.armR.rotation.x=-.35;c.head.rotation.y=Math.sin(t*.35+st)*.55;break;}
 case 'cower':{poseReset(c);c.hips.position.y=.55;c.legL.rotation.x=c.legR.rotation.x=-1.9;c.shinL.rotation.x=c.shinR.rotation.x=2.3;c.spine.rotation.x=.45;c.armL.rotation.x=c.armR.rotation.x=-2.5+.05*Math.sin(t*9);c.foreL.rotation.x=c.foreR.rotation.x=-.9;c.head.rotation.x=.35;break;}
 case 'handsup':{animIdle(c);c.armL.rotation.x=c.armR.rotation.x=-2.9;c.foreL.rotation.x=c.foreR.rotation.x=-.2;break;}
 default:animIdle(c);}}
// Requisit an einen Knochen hängen (einmal pro Figur, danach nur sichtbar/unsichtbar)
function propOn(n,key){n.props=n.props||{};if(n.props[key])return n.props[key];const g=new THREE.Group();const c=n.c;
 const add=(geo,mat,x,y,z,rx=0,ry=0,rz=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=false;g.add(m);return m;};
 if(key==='phone'){add(PROPG.phone,PROPM.dark,0,-.06,.03,0,0,0);c.handR.add(g);}
 else if(key==='case'){add(PROPG.case,PROPM.brown,0,-.24,0,0,Math.PI/2,0);add(PROPG.caseH,PROPM.dark,0,-.08,0,0,Math.PI/2,0);c.handR.add(g);}
 else if(key==='bags'){add(PROPG.bag,pick([PROPM.paperA,PROPM.paperB,PROPM.paperC,PROPM.red]),.02,-.26,0,0,Math.PI/2,0);add(PROPG.bag,pick([PROPM.paperA,PROPM.paperB,PROPM.paperC]),-.04,-.24,.06,0,Math.PI/2+.3,0);c.handL.add(g);}
 else if(key==='cup'){add(PROPG.cup,PROPM.cup,0,-.08,.05);add(PROPG.cupL,PROPM.lid,0,-.01,.05);c.handR.add(g);}
 else if(key==='cam'){add(PROPG.cam,PROPM.dark,0,-.06,.06);c.handR.add(g);}
 else if(key==='news'){add(PROPG.news,PROPM.news,0,-.05,.12,-.3,0,0);c.handR.add(g);}
 else if(key==='umb'){const m=pick(PROPM.umb);add(PROPG.umbS,PROPM.dark,0,.3,.05);const cn=add(PROPG.umbC,m,0,.8,.05);c.handR.add(g);}
 else if(key==='guitar'){add(new THREE.CylinderGeometry(.2,.2,.09,14).rotateX(Math.PI/2),PROPM.wood,0,-.08,.2);add(new THREE.CylinderGeometry(.15,.15,.092,14).rotateX(Math.PI/2),PROPM.wood,.0,.14,.2);
  add(new THREE.BoxGeometry(.05,.55,.03),PROPM.woodD,0,.5,.21);add(new THREE.CylinderGeometry(.045,.045,.095,10).rotateX(Math.PI/2),PROPM.dark,0,0,.205);g.rotation.z=-.85;g.position.set(.02,-.08,.05);c.spine.add(g);}
 n.props[key]=g;return g;}
function propsOff(n){if(!n.props)return;for(const k in n.props)n.props[k].visible=false;}
function propShow(n,key,on=true){if(!on&&!(n.props&&n.props[key]))return;propOn(n,key).visible=on;}
function initPedPool(){const want=PED_POOL-peds.filter(n=>n.kind==='civ').length;
 for(let k=0;k<want;k++){const r=Math.random(),cls=r<.3?'rich':r<.7?'mid':r<.88?'poor':'beach';const ag=cls!=='rich'&&cls!=='beach'&&Math.random()<.1;
  const sk=classSkin(ag?'poor':cls);if(ag){sk.topC=pick([0x8b1a1a,0x5b1010,0x5b2a86,0x3d1a5c,0x151515]);sk.extra=pick([0,3,1,3]);}
  const c=buildChar(sk);scene.add(c.g);const p={c,kind:'civ',hp:100,aggro:ag,armed:false,vel:new THREE.Vector3(),timer:0,phase:Math.random()*6,atkT:0,stagger:0,cls,amb:true};
  if(ag&&Math.random()<.35){if(window.__combatReady)armNPC(p,'pistol');else p.wantGun=true;}placePed(p);peds.push(p);}
 for(const n of peds)if(n.kind==='civ'&&!n.cls){n.cls='mid';n.amb=true;}}
// Dichte pro Block (Tag/Nacht)
function blockDensity(b){const nt=night>.5;const t=b.type;let d={downtown:1.3,beach:1.15,mixed:1,residential:.7,park:.85,industrial:.3,garage:.35,police:.55,hospital:.7}[t]??.6;
 if(nt)d*=t==='downtown'?.8:t==='beach'?.3:.5;if(WX.rain>.5)d*=.6;return d;}
function placePedNear(n,px,pz){const cf=new THREE.Vector3();camera.getWorldDirection(cf);let best=null,bw=0;
 for(let k=0;k<14;k++){const b=blockInfo[Math.floor(Math.random()*blockInfo.length)];const cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2,d=Math.hypot(cx-px,cz-pz);if(d>150||d<12)continue;
  if(SPECIAL[b.i+','+b.j]&&Math.random()<.5)continue;let w=blockDensity(b)*(CLS_AFF[n.cls]||CLS_AFF.mid)[wealthClass(blockWealth(b))]*(1-d/175);if(n.cls==='beach')w*=b.type==='beach'?3:b.type==='park'?1.4:.4;if(w>bw){bw=w;best=b;}}
 if(!best)return false;
 const b=best,L=(b.x1-b.x0)-3.2;n.b=b;n.L=L;
 for(let k=0;k<8;k++){n.s=Math.random()*L*4;const [x,z]=pedPos(n);const vx=x-camera.position.x,vz=z-camera.position.z,dd=Math.hypot(vx,vz);if(dd>62||(vx*cf.x+vz*cf.z)/dd<-.15)break;}
 n.dir=Math.random()<.5?1:-1;n.state='walk';n.stagger=0;n.hp=100;n.dropped=false;n.c.g.rotation.set(0,0,0);n.c.g.rotation.order='XYZ';
 // Rolle: Jogger, Hund, Einkaufstüten, Aktenkoffer, Kaffee, Telefon
 propsOff(n);n.role=null;n.spd=R(1.1,1.7);const w=blockWealth(b),r=Math.random();
 if((n.cls==='rich'||n.cls==='beach'||b.type==='park'||b.type==='beach')&&r<.12&&!n.aggro){n.role='jog';n.spd=R(2.7,3.3);}
 else if(r<.24&&n.cls==='rich'&&b.type==='downtown')n.role='case';
 else if(r<.36&&(n.cls==='rich'||n.cls==='mid')&&(b.type==='downtown'||b.type==='mixed'))n.role='bags';
 else if(r<.44&&n.cls!=='poor')n.role='cup';
 else if(r<.52)n.role='phone';
 if(n.role&&n.role!=='jog')propShow(n,n.role);
 if(n.dog){n.dog.owner=null;n.dog=null;}if(!n.aggro&&n.role!=='jog'&&(n.cls==='rich'||n.cls==='mid')&&Math.random()<(w>.6?.14:.07))dogFor(n);
 return true;}
function isAmbCiv(n){return n.kind==='civ'&&n.amb&&!n.mission&&!n.patient&&!n.fare&&!n.vipP;}
function ambTick(dt){if(mode!=='play'&&mode!=='cine'&&mode!=='mcine')return;AMB.t-=dt;dogsTick(dt);birdsTick(dt);if(AMB.t>0)return;AMB.t=.33;
 if(!AMB.spots)buildSpots();
 const px=mode==='play'?P.pos.x:camera.position.x,pz=mode==='play'?P.pos.z:camera.position.z;
 AMB.top=(AMB.top||0)-.33;if(AMB.top<=0){AMB.top=4;let civ=0;for(const n of peds)if(n.kind==='civ'&&n.amb)civ++;if(civ<PED_POOL-4){const r=Math.random(),cls=r<.3?'rich':r<.7?'mid':r<.88?'poor':'beach';const c=buildChar(classSkin(cls));scene.add(c.g);const p={c,kind:'civ',hp:100,aggro:false,armed:false,vel:new THREE.Vector3(),timer:0,phase:Math.random()*6,atkT:0,stagger:0,cls,amb:true};placePed(p,P.pos);peds.push(p);}}
 // 1) Fußgänger in Spielernähe halten
 const b0=blockAt(px,pz);const dens=b0?blockDensity(b0):0;let near=0;const far=[];
 for(const n of peds){if(!isAmbCiv(n))continue;const g=n.c.g.position,d=Math.hypot(g.x-px,g.z-pz);
  if(n.state==='walk'){if(d<125)near++;else if(d>cullPed+25||d>150&&!n.c.g.visible)far.push(n);}else if(n.state==='flee'&&d>cullPed+30&&!n.vig){placePed(n);}}
 const want=Math.round(WALK_NEAR*(b0?Math.max(.35,dens):.15)*(mission?.8:1));
 for(let k=0;k<3&&near<want&&far.length;k++){const n=far.splice(Math.floor(Math.random()*far.length),1)[0];if(placePedNear(n,px,pz))near++;}
 // 2) Szenen (stehende/sitzende Gruppen)
 sceneTick(px,pz);
 // 3) Regen: Schirme für Fußgänger
 const rain=WX.rain>.3;for(const n of peds){if(!isAmbCiv(n)||n.state!=='walk')continue;const want2=rain&&n.role!=='jog'&&((n.phase*1000|0)%10)<6;if(want2!==!!n.umbOn){n.umbOn=want2;propShow(n,'umb',want2);}}}
// Laufende Passanten: nach animWalk Requisiten-Posen setzen (Telefon, Kaffee, Schirm …)
function walkerPose(n){const c=n.c;
 if(n.umbOn){c.armR.rotation.x=-.85;c.armR.rotation.z=.15;c.foreR.rotation.x=-.95;}
 else if(n.role==='phone'){c.armR.rotation.x=-.7;c.armR.rotation.z=.22;c.foreR.rotation.x=-2.3;}
 else if(n.role==='cup'){c.armR.rotation.x=-.25;c.foreR.rotation.x=-1.25;}
 if(n.role==='case'&&!n.umbOn){c.armR.rotation.x*=.4;}if(n.role==='bags'){c.armL.rotation.x*=.4;c.armL.rotation.z=-.12;}}

// ---------- Szenen-Orte (einmalig gesammelt) ----------
function safeSpot(x,z,r=1.1){for(const b of solidsNear(x,z,r+1)){if(b.camOnly||b.water)continue;if(x+r>b.x0&&x-r<b.x1&&z+r>b.z0&&z-r<b.z1)return false;}return !interiorAt(x,z);}
function buildSpots(){const S=[];const add=(x,z,face,kind,extra)=>S.push(Object.assign({x,z,face,kind,w:wealthAt(x,z),busy:false},extra||{}));
 for(const b of blockInfo){const t=b.type;if(t==='industrial'||t==='garage')continue;const sp=SPECIAL[b.i+','+b.j];
  // Ecken an den Zebrastreifen (warten), Gehweg-Mitte (plaudern, telefonieren)
  if(t!=='park'){for(const [x,z,f] of [[b.x0+1.1,b.z0+1.1,-2.36],[b.x1-1.1,b.z0+1.1,2.36],[b.x0+1.1,b.z1-1.1,-.78],[b.x1-1.1,b.z1-1.1,.78]])if(Math.random()<.5)add(x,z,f,'corner');
   for(const [x,z,f] of [[(b.x0+b.x1)/2+R(-12,12),b.z1-2.4,0],[(b.x0+b.x1)/2+R(-12,12),b.z0+2.4,Math.PI],[b.x0+2.4,(b.z0+b.z1)/2+R(-12,12),-Math.PI/2],[b.x1-2.4,(b.z0+b.z1)/2+R(-12,12),Math.PI/2]])if(Math.random()<.45&&!sp)add(x,z,f,Math.random()<.25&&(t==='downtown'||t==='beach'||t==='mixed')?'vendor':Math.random()<.12&&(t==='downtown'||t==='mixed')?'music':Math.random()<.2&&(t==='downtown'||t==='beach')?'photo':'chat');}}
 for(const q of BENCHES)add(q.x,q.z,q.face,'bench');for(const q of SHELTERS)add(q.x,q.z+.45,q.face,'shelter');
 for(const q of FOUNTAINS){for(let k=0;k<4;k++){const a=k/4*Math.PI*2+.4;add(q.x+Math.cos(a)*(q.r+.35),q.z+Math.sin(a)*(q.r+.35),Math.atan2(Math.cos(a),Math.sin(a)),'fountain');}
  for(let k=0;k<3;k++){const a=Math.random()*6.28,r=R(10,18);add(q.x+Math.cos(a)*r,q.z+Math.sin(a)*r,Math.random()*6.28,Math.random()<.6?'picnic':'music');}}
 for(let x=-780;x<930;x+=24){const z=COAST+R(11,23);if(Math.abs(x-JX)<16||Math.abs(x-PIERX)<20)continue;add(x+R(-6,6),z,R(-.6,.6)+Math.PI,Math.random()<.7?'beach':Math.random()<.5?'vendor':'photo');}
 for(const f of AREA.fires)for(let k=0;k<1;k++)add(f.x,f.z,0,'barrel');
 for(const q of ZONES){if(!(q.poor||q.name==='Dustwater')||q.x0==null)continue;for(let k=0;k<10;k++){const x=R(q.x0+10,q.x1-10),z=R(q.z0+10,q.z1-10);if(safeSpot(x,z,1.4))add(x,z,Math.random()*6.28,Math.random()<.5?'porch':'chat');}}
 for(const q of ZONES){if(q.name!=='Vista Mar'||q.x0==null)continue;for(let k=0;k<10;k++){const x=R(q.x0+10,q.x1-10),z=R(q.z0+10,q.z1-10);if(safeSpot(x,z,1.4))add(x,z,Math.random()*6.28,Math.random()<.4?'photo':'chat');}}
 AMB.spots=S.filter(q=>q.kind==='barrel'||safeSpot(q.x,q.z,q.kind==='vendor'?1.3:.7));}
function sceneProps(v){const g=new THREE.Group(),y=groundY(v.x,v.z);g.position.set(v.x,y,v.z);g.rotation.y=v.face;const add=(geo,m,x,yy,z,rx=0,ry=0,rz=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,yy,z);o.rotation.set(rx,ry,rz);o.castShadow=true;g.add(o);return o;};
 if(v.kind==='vendor'){const k=Math.floor(Math.random()*VIG_MAT.cart.length),st=pick(VIG_MAT.stripe);add(new THREE.BoxGeometry(1.7,.85,.85),VIG_MAT.cart[k],0,.55,0);add(new THREE.BoxGeometry(1.72,.12,.87),st,0,.92,0);add(new THREE.BoxGeometry(1.75,.05,.9),VIG_MAT.metal,0,1.0,0);
  for(const s of [-1,1])add(new THREE.CylinderGeometry(.22,.22,.08,14).rotateZ(Math.PI/2),VIG_MAT.dark,s*.62,.22,.4);add(new THREE.CylinderGeometry(.02,.02,1.4,6),VIG_MAT.metal,.6,1.65,-.2);
  add(new THREE.ConeGeometry(1.1,.4,8,1,true),pick(VIG_MAT.umb),.6,2.45,-.2);const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.28),pick(VIG_MAT.sign.vendor));sg.position.set(0,.62,.44);g.add(sg);
  for(let i=0;i<3;i++)add(new THREE.CylinderGeometry(.03,.03,.16,6),pick(VIG_MAT.stripe),-.5+i*.12,1.1,-.1);}
 else if(v.kind==='music'){add(new THREE.CylinderGeometry(.16,.13,.1,14),VIG_MAT.hat,.2,.05,.9);add(new THREE.CylinderGeometry(.24,.24,.012,16),VIG_MAT.hat,.2,.012,.9);}
 else if(v.kind==='beach'){add(new THREE.BoxGeometry(.9,.02,1.9),pick(VIG_MAT.tow),0,.02,0);if(v.n>1)add(new THREE.BoxGeometry(.9,.02,1.9),pick(VIG_MAT.tow),1.1,.02,.1);add(new THREE.CylinderGeometry(.025,.025,2.2,6),VIG_MAT.metal,.55,1.1,-1.1);add(new THREE.ConeGeometry(1.3,.45,10,1,true),pick(VIG_MAT.umb),.55,2.25,-1.1);
  add(new THREE.BoxGeometry(.45,.32,.3),pick(VIG_MAT.stripe),-.7,.16,-.9);}
 else if(v.kind==='picnic'){add(new THREE.BoxGeometry(2,.015,1.6),VIG_MAT.blanket,0,.31,0);add(new THREE.BoxGeometry(.42,.26,.3),VIG_MAT.basket,.6,.44,-.4);}
 else if(v.kind==='porch'){for(let i=0;i<v.n;i++){const cx=(i-(v.n-1)/2)*1.1;add(new THREE.BoxGeometry(.5,.06,.5),VIG_MAT.chair,cx,.45,-.05);add(new THREE.BoxGeometry(.5,.5,.06),VIG_MAT.chair,cx,.72,-.28);for(const sx of [-.2,.2])for(const sz of [-.2,.2])add(new THREE.BoxGeometry(.04,.45,.04),VIG_MAT.dark,cx+sx,.22,sz-.05);}}
 scene.add(g);return g;}
// Mitglieder-Plan je Szene: [dx,dz,blick,anim,requisit]
function scenePlan(v){const r=Math.random();switch(v.kind){
 case 'corner':return r<.5?[[0,0,0,'wait']]:[[0,0,0,'wait'],[.7,.35,-.4,'phone','phone']];
 case 'chat':return r<.35?[[-.45,0,Math.PI/2,'chat'],[.45,0,-Math.PI/2,'chat']]:r<.7?[[-.5,.2,1.9,'chat'],[.5,.2,-1.9,'listen'],[0,-.55,0,'chat']]:[[0,0,0,'phone','phone']];
 case 'bench':return r<.5?[[-.5,0,0,'sitb']]:r<.8?[[-.5,0,0,'sitb'],[.45,0,0,'read','news']]:[[0,0,0,'read','news']];
 case 'shelter':return [[-1,0,0,'wait'],[.3,.15,0,'phone','phone'],[1.2,.05,-.3,'wait']].slice(0,1+Math.floor(r*3));
 case 'fountain':return r<.6?[[0,0,0,'sitb']]:[[0,0,0,'sitb'],[.7,.1,0,'sitb']];
 case 'picnic':return [[-.5,.2,.4,'sit'],[.5,-.1,-2.6,'eat']];
 case 'vendor':return [[0,-.9,0,'bar'],[.2,1.3,Math.PI,'eat'],[-.8,1.6,Math.PI-.4,'wait']].slice(0,2+(r<.5?1:0));
 case 'music':return [[0,0,0,'guitar','guitar'],[-.8,2.4,Math.PI+.35,'clap'],[.9,2.6,Math.PI-.3,'listen'],[0,3.1,Math.PI,'clap']].slice(0,2+Math.floor(r*3));
 case 'photo':return [[0,0,0,'photo','cam'],[0,3.2,Math.PI,'pose']];
 case 'beach':return r<.55?[[0,.8,0,'lie']]:[[0,.8,0,'lie'],[1.1,.9,0,'lie']];
 case 'barrel':return night>.4||Math.random()<.3?[[0,-1.1,0,'warm'],[1,.4,-2.1,'warm'],[-1,.5,2.1,'warm']].slice(0,2+(r<.5?1:0)):[[0,-1.3,0,'wait']];
 case 'porch':return r<.5?[[0,0,0,'sit']]:[[-.55,0,0,'sit'],[.55,0,0,'sit']];
 default:return [[0,0,0,'wait']];}}
function sceneClass(v){if(v.kind==='beach')return 'beach';return wealthClass(v.w);}
function sceneCreate(v){const plan=scenePlan(v);v.n=plan.length;const cls=sceneClass(v);
 // passende Figuren aus dem Pool holen (weit weg, unsichtbar)
 const cand=[];for(const n of peds){if(!isAmbCiv(n)||n.state!=='walk'||n.aggro||n.c.g.visible)continue;const g=n.c.g.position;if(Math.hypot(g.x-P.pos.x,g.z-P.pos.z)<130)continue;cand.push(n);}
 if(cand.length<plan.length+4)return false;
 const mem=[];for(const pl of plan){let bi=-1,bs=-1;for(let k=0;k<cand.length;k++){const n=cand[k];const s=(CLS_AFF[n.cls]||CLS_AFF.mid)[cls==='beach'?'mid':cls]+(n.cls===cls?.6:0)+Math.random()*.25;if(s>bs){bs=s;bi=k;}}
  const n=cand.splice(bi,1)[0];mem.push([n,pl]);}
 const cs=Math.cos(v.face),sn=Math.sin(v.face);
 for(const [n,[dx,dz,f,anim,prop]] of mem){if(n.dog){n.dog.owner=null;n.dog=null;}propsOff(n);n.umbOn=false;
  const x=v.x+dx*cs+dz*sn,z=v.z-dx*sn+dz*cs;let y=groundY(x,z);const g=n.c.g;g.rotation.set(0,0,0);g.rotation.order='XYZ';
  if(anim==='lie'){g.rotation.order='YXZ';g.rotation.set(-Math.PI/2,v.face+f,0);y+=.14;}else g.rotation.y=v.face+f;
  if(v.kind==='porch'&&anim==='sit')y+=.0;g.position.set(x,y,z);n.state='idle';n.anim=anim;n.it=Math.random()*5;n.ast=Math.floor(Math.random()*3);n.vig=v;n.hp=100;n.stagger=0;if(prop)propShow(n,prop);}
 v.mem=mem.map(m=>m[0]);v.props=sceneProps(v);v.busy=true;AMB.vigs.push(v);return true;}
function sceneRemove(v,i){for(const n of v.mem){if(n.vig!==v)continue;n.vig=null;propsOff(n);n.c.g.rotation.set(0,0,0);n.c.g.rotation.order='XYZ';if(n.state==='idle'||n.state==='flee'||n.state==='handsup'){placePed(n);}}
 if(v.props){scene.remove(v.props);v.props.traverse(o=>{if(o.isMesh&&o.geometry&&!Object.values(PROPG).includes(o.geometry))o.geometry.dispose();});v.props=null;}v.busy=false;v.mem=[];AMB.vigs.splice(i,1);}
function missionBlocks(x,z){if(!mission||!mission.steps)return false;const st=mission.steps[si];if(!st)return false;let p=null;try{p=typeof st.pos==='function'?st.pos():st.pos;}catch(e){p=null;}if(p&&Math.hypot(p.x-x,p.z-z)<45)return true;if(mission.zones){for(const zname of mission.zones){const Z=MZONES[zname]&&MZONES[zname]();if(Z&&Math.hypot(Z.x-x,Z.z-z)<(Z.r||50))return true;}}return false;}
function sceneTick(px,pz){
 // entfernen: zu weit weg, oder alle geflohen/K.O. und außer Sicht
 for(let i=AMB.vigs.length-1;i>=0;i--){const v=AMB.vigs[i];const d=Math.hypot(v.x-px,v.z-pz);const alive=v.mem.some(n=>n.vig===v&&n.state==='idle');
  if(d>240||!alive&&d>70||missionBlocks(v.x,v.z)&&d>35)sceneRemove(v,i);}
 const b0=blockAt(px,pz);const dens=b0?blockDensity(b0):(wealthAt(px,pz)<.3?.45:.6);const want=Math.round(VIG_NEAR*Math.max(.35,dens)*(mission?.7:1));
 let near=0;for(const v of AMB.vigs)if(Math.hypot(v.x-px,v.z-pz)<150)near++;if(near>=want)return;
 const cf=new THREE.Vector3();camera.getWorldDirection(cf);
 for(let k=0;k<12;k++){const v=AMB.spots[Math.floor(Math.random()*AMB.spots.length)];if(!v||v.busy)continue;const dx=v.x-px,dz=v.z-pz,d=Math.hypot(dx,dz);if(d<38||d>165)continue;
  const vx=v.x-camera.position.x,vz=v.z-camera.position.z,dd=Math.hypot(vx,vz);if(dd<75&&(vx*cf.x+vz*cf.z)/dd>.2)continue;
  if(v.kind==='barrel'&&night<.3&&Math.random()<.6)continue;if(v.kind==='beach'&&(night>.5||WX.rain>.3))continue;if((v.kind==='vendor'||v.kind==='music'||v.kind==='picnic')&&(night>.6||WX.rain>.4))continue;
  if(v.w<.3&&Math.random()<.45)continue;if(missionBlocks(v.x,v.z))continue;
  if(sceneCreate(v))return;}}
// Passanten in Szenen: Zustand 'idle' (wird aus updateNPCs aufgerufen)
function idlePedTick(n,dt,dist,play,onFoot){const g=n.c.g;g.visible=dist<cullPed;if(g.visible){n.it+=dt;applyAnim(n.c,n.anim,n.it,n.ast);}
 if(n.aggro&&play&&onFoot&&dist<6.5&&!mission){n.state='fight';g.rotation.set(0,g.rotation.y,0);g.rotation.order='XYZ';npcSay(n,'thug',1);}}
function idleToFlee(n,threat){const g=n.c.g;if(g.rotation.order==='YXZ'){const y=g.rotation.y;g.rotation.order='XYZ';g.rotation.set(0,y,0);g.position.y=groundY(g.position.x,g.position.z);}propsOff(n);n.state='flee';n.fleeT=9;n.threat=threat.clone?threat.clone():new THREE.Vector3(threat.x,0,threat.z);}
function makeDog(){const g=new THREE.Group(),m=pick(DOGM),dk=cm(0x141414,.6),sc=R(.65,1.1);const add=(geo,mat,x,y,z,par=g)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;par.add(o);return o;};
 const body=new THREE.Group();g.add(body);add(new THREE.CapsuleGeometry(.14,.42,4,8).rotateX(Math.PI/2),m,0,.42,0,body);add(new THREE.BoxGeometry(.2,.2,.22),m,0,.6,.33,body);add(new THREE.BoxGeometry(.11,.1,.14),m,0,.56,.48,body);add(new THREE.SphereGeometry(.028,6,5),dk,0,.58,.55,body);
 for(const s of [-1,1]){const e=add(new THREE.BoxGeometry(.05,.11,.03),m,s*.07,.73,.3,body);e.rotation.z=s*.25;}
 const tail=new THREE.Group();tail.position.set(0,.5,-.27);body.add(tail);add(new THREE.CylinderGeometry(.025,.015,.26,5),m,0,.11,-.04,tail).rotation.x=-.6;
 const legs=[];for(const [x,z] of [[-.08,.2],[.08,.2],[-.08,-.2],[.08,-.2]]){const p=new THREE.Group();p.position.set(x,.36,z);body.add(p);add(new THREE.CylinderGeometry(.035,.03,.36,6),m,0,-.18,0,p);legs.push(p);}
 g.scale.setScalar(sc);scene.add(g);return {g,body,legs,tail,ph:Math.random()*6,owner:null,spd:0,leash:null,x:0,z:0,h:0};}
function dogFor(n){let d=AMB.dogs.find(q=>!q.owner&&!q.g.visible);if(!d){if(AMB.dogs.length>=6)return;d=makeDog();const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);d.leash=new THREE.Line(geo,LEASH_MAT);scene.add(d.leash);AMB.dogs.push(d);}
 d.owner=n;n.dog=d;const p=n.c.g.position;d.x=p.x;d.z=p.z;d.g.position.set(p.x,groundY(p.x,p.z),p.z);d.g.visible=true;d.leash.visible=true;}
function dogsTick(dt){for(const d of AMB.dogs){if(!d.g.visible)continue;const o=d.owner;
  if(!o||o.dog!==d||o.state==='ko'||o.state==='fly'||o.state==='ride'||!o.c.g.visible&&o.state!=='walk'){// Hund läuft weg und verschwindet
   if(o&&o.dog===d)o.dog=null;d.owner=null;d.leash.visible=false;d.run=(d.run||0)+dt;d.h+=Math.sin(time*2+d.ph)*dt;d.x+=Math.sin(d.h)*4.5*dt;d.z+=Math.cos(d.h)*4.5*dt;d.g.position.set(d.x,groundY(d.x,d.z),d.z);d.g.rotation.y=d.h;
   if(d.run>6||Math.hypot(d.x-P.pos.x,d.z-P.pos.z)>cullPed){d.g.visible=false;d.run=0;}dogAnim(d,dt,4.5);continue;}
  const g=o.c.g,f=g.rotation.y,tx=g.position.x-Math.sin(f)*1.25+Math.cos(f)*.45,tz=g.position.z-Math.cos(f)*1.25-Math.sin(f)*.45;const dx=tx-d.x,dz=tz-d.z,dd=Math.hypot(dx,dz);
  if(dd>8){d.x=tx;d.z=tz;}const sp=o.state==='flee'?6:Math.min(4,dd*2.2);if(dd>.15){d.x+=dx/dd*sp*dt;d.z+=dz/dd*sp*dt;d.h=lerpAng(d.h,Math.atan2(dx,dz),dt*6);}
  d.g.position.set(d.x,groundY(d.x,d.z),d.z);d.g.rotation.y=d.h;d.g.visible=o.c.g.visible;dogAnim(d,dt,dd>.15?sp:0);
  if(d.leash.visible=d.g.visible&&o.state==='walk'){o.c.handL.getWorldPosition(_dv);const a=d.leash.geometry.attributes.position;a.setXYZ(0,_dv.x,_dv.y,_dv.z);const s=d.g.scale.x;a.setXYZ(1,d.x+Math.sin(d.h)*.36*s,d.g.position.y+.6*s,d.z+Math.cos(d.h)*.36*s);a.needsUpdate=true;d.leash.geometry.computeBoundingSphere();}}}
function dogAnim(d,dt,sp){d.ph+=dt*(2+sp*2.6);const a=sp>.2?Math.min(.7,.25+sp*.1):0;const s=Math.sin(d.ph);d.legs[0].rotation.x=s*a;d.legs[3].rotation.x=s*a;d.legs[1].rotation.x=-s*a;d.legs[2].rotation.x=-s*a;d.tail.rotation.z=Math.sin(time*9+d.ph)*.6;d.body.position.y=sp>.2?Math.abs(Math.cos(d.ph))*.025:0;}
function makeBird(kind){const g=new THREE.Group(),gull=kind==='gull';const bm=gull?BIRDM.gull:BIRDM.pig,wm=gull?BIRDM.gullW:BIRDM.pigW;
 g.add(new THREE.Mesh(BIRDG.body,bm));const h=new THREE.Mesh(BIRDG.head,bm);h.position.set(0,.06,.24);g.add(h);const bk=new THREE.Mesh(new THREE.ConeGeometry(.02,.07,5).rotateX(Math.PI/2),BIRDM.beak);bk.position.set(0,.05,.32);g.add(bk);
 const wings=[];for(const s of [-1,1]){const w=new THREE.Group();w.position.set(s*.05,.05,0);const m=new THREE.Mesh(BIRDG.wing,wm);m.scale.x=s;w.add(m);if(gull){const t=new THREE.Mesh(BIRDG.tip,BIRDM.tip);t.scale.x=s;w.add(t);}g.add(w);wings.push(w);}
 g.scale.setScalar(gull?1:.55);scene.add(g);return {g,wings,ph:Math.random()*6,kind};}
function birdsTick(dt){const px=camera.position.x,pz=camera.position.z;
 // Möwen: kreisen über Strand/Hafen/Meer, wenn man in der Nähe der Küste ist
 const nearCoast=pz>COAST-160&&pz<WATER_Z+500&&px>-1000&&px<1150||(typeof onIsland==='function'&&onIsland({x:px,z:pz}));
 if(nearCoast&&AMB.gulls.length<14&&mode!=='title'){for(let k=0;k<14;k++){const b=makeBird('gull');b.cx=px+R(-120,120);b.cz=Math.max(WATER_Z-10,pz+R(-60,120));b.r=R(14,36);b.alt=R(18,42);b.sp=R(.25,.45)*(Math.random()<.5?1:-1);b.a=Math.random()*6.28;AMB.gulls.push(b);}}
 for(const b of AMB.gulls){b.g.visible=nearCoast;if(!nearCoast)continue;b.a+=b.sp*dt;if(Math.hypot(b.cx-px,b.cz-pz)>260){b.cx=px+R(-140,140);b.cz=Math.max(WATER_Z-20,pz+R(-40,160));}
  const x=b.cx+Math.cos(b.a)*b.r,z=b.cz+Math.sin(b.a)*b.r,y=Math.max(groundY(x,z)+6,b.alt+Math.sin(time*.4+b.ph)*3);b.g.position.set(x,y,z);b.g.rotation.set(Math.sin(time*.7+b.ph)*.15,Math.atan2(-Math.sin(b.a)*Math.sign(b.sp),Math.cos(b.a)*Math.sign(b.sp)),b.sp>0?-.3:.3);
  const glide=Math.sin(time*.5+b.ph)>.2;const f=glide?.08:Math.sin(time*9+b.ph)*.7;b.wings[0].rotation.z=f;b.wings[1].rotation.z=-f;}
 // Tauben: Schwärme auf Plätzen/Parks, fliegen auf, wenn man ihnen zu nahe kommt
 AMB.pT-=dt;if(AMB.pT<=0&&mode==='play'){AMB.pT=4;const act=AMB.pigeons.filter(p=>p.state!=='gone').length;
  if(act<20&&AMB.spots){for(let k=0;k<10;k++){const s=AMB.spots[Math.floor(Math.random()*AMB.spots.length)];if(!s||!(s.kind==='fountain'||s.kind==='bench'||s.kind==='chat'&&s.w>.5))continue;const d=Math.hypot(s.x-P.pos.x,s.z-P.pos.z);if(d<35||d>110)continue;
    const cx=s.x+R(-4,4),cz=s.z+R(-4,4);for(let i=0;i<8;i++){let p=AMB.pigeons.find(q=>q.state==='gone');if(!p){p=makeBird('pigeon');AMB.pigeons.push(p);}p.state='walk';p.x=cx+R(-2.5,2.5);p.z=cz+R(-2.5,2.5);p.h=Math.random()*6.28;p.vy=0;p.t=0;p.g.visible=true;}break;}}}
 for(const p of AMB.pigeons){if(p.state==='gone'){p.g.visible=false;continue;}const dP=Math.hypot(p.x-P.pos.x,p.z-P.pos.z);
  if(p.state==='walk'){p.t+=dt;if(dP<5.5||(P.inCar&&dP<14)||dP>150){if(dP>150){p.state='gone';continue;}p.state='fly';p.h=Math.atan2(p.x-P.pos.x,p.z-P.pos.z)+R(-.6,.6);p.vy=R(3,5);tone(900+Math.random()*400,.04,'triangle',.006,p.g.position);}
   else{if(Math.sin(p.t*1.3+p.ph)>.3){p.x+=Math.sin(p.h)*.35*dt;p.z+=Math.cos(p.h)*.35*dt;}if(Math.random()<dt*.4)p.h+=R(-1.2,1.2);
    const y=groundY(p.x,p.z);p.g.position.set(p.x,y+.08,p.z);p.g.rotation.set(Math.max(0,Math.sin(p.t*6+p.ph))*.5,p.h,0);p.wings[0].rotation.z=.05;p.wings[1].rotation.z=-.05;}}
  else{p.x+=Math.sin(p.h)*7*dt;p.z+=Math.cos(p.h)*7*dt;p.vy=Math.max(1.2,p.vy-dt*.8);p.g.position.set(p.x,p.g.position.y+p.vy*dt,p.z);p.g.rotation.set(-.3,p.h,0);const f=Math.sin(time*22+p.ph)*.9;p.wings[0].rotation.z=f;p.wings[1].rotation.z=-f;
   if(p.g.position.y>40||Math.hypot(p.x-P.pos.x,p.z-P.pos.z)>140)p.state='gone';}}}
// Schüsse/Explosionen erschrecken Tauben
function scareBirds(p){for(const q of AMB.pigeons)if(q.state==='walk'&&Math.hypot(q.x-p.x,q.z-p.z)<40){q.state='fly';q.h=Math.atan2(q.x-p.x,q.z-p.z)+R(-.5,.5);q.vy=R(3.5,5.5);}}
function rustPaint(color,v=0){const k=color+'_'+v;if(rustCache[k])return rustCache[k];
 const base=new THREE.Color(color),hsl={};base.getHSL(hsl);base.setHSL(hsl.h,hsl.s*.5,Math.min(.72,hsl.l*.88+.07));
 const m=new THREE.MeshStandardMaterial({color:base,roughness:.64,metalness:.22});const seed=v*17.31+(color%97)*.137+.5;
 m.onBeforeCompile=sh=>{sh.uniforms.uSeed={value:seed};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vRP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvRP=position;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vRP;uniform float uSeed;
float rh(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float rn(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(rh(i),rh(i+vec3(1,0,0)),f.x),mix(rh(i+vec3(0,1,0)),rh(i+vec3(1,1,0)),f.x),f.y),mix(mix(rh(i+vec3(0,0,1)),rh(i+vec3(1,0,1)),f.x),mix(rh(i+vec3(0,1,1)),rh(i+vec3(1,1,1)),f.x),f.y),f.z);}
float rf(vec3 p){return rn(p)*.55+rn(p*2.3)*.3+rn(p*5.1)*.15;}`)
  .replace('#include <color_fragment>',`#include <color_fragment>
  float rn0=rf(vRP*2.2+uSeed);float low=1.-smoothstep(.35,1.05,vRP.y);float edg=rf(vRP*7.+uSeed*1.7);
  float rust=smoothstep(.58,.72,rn0*.85+low*.34+edg*.18);float spots=smoothstep(.78,.86,rf(vRP*11.+uSeed*3.1));rust=max(rust,spots*.85);
  vec3 rc=mix(vec3(.19,.08,.035),vec3(.43,.19,.07),rn(vRP*14.+uSeed));
  float prim=step(.5,fract(uSeed*.37))*smoothstep(.6,.62,rn(vRP*.55+uSeed*2.))*(1.-rust);
  diffuseColor.rgb=mix(diffuseColor.rgb*(.82+.18*rn0),vec3(.43,.44,.43),prim*.92);diffuseColor.rgb=mix(diffuseColor.rgb,rc,rust);`)
  .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n  roughnessFactor=mix(roughnessFactor,.96,rust);')
  .replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\n  metalnessFactor=mix(metalnessFactor,.04,rust);');};
 m.customProgramCacheKey=()=>'rustpaint1';allMats.push(m);return rustCache[k]=m;}
function pickW(list){let s=0;for(const q of list)s+=q[1];let r=Math.random()*s;for(const [t,w] of list)if((r-=w)<0)return t;return list[0][0];}
function carFor(w,o={}){const cls=wealthClass(w);let vt,col,rust=false;
 if(cls==='rich'){vt=pickW(MIX_RICH);col=pick(RICH_COL);}
 else if(cls==='poor'){vt=pickW(MIX_POOR);col=pick(POOR_COL);rust=vt!=='bike'&&vt!=='scooter'&&Math.random()<.82;}
 else{vt=Math.random()<.07?'kombi':Math.random()<.03?'rostlaube':pickTrafficType();col=pick(carColors);rust=!['bike','scooter','bus','taxi','truck'].includes(vt)&&Math.random()<.1;}
 if(o.noBus&&(vt==='bus'||vt==='truck'))vt=cls==='poor'?'van':'sedan';
 const c=makeCar(vt==='bus'?pick([0x1f6fb2,0xd35400,0x16a085]):col,false,vt,{rust,rv:Math.floor(Math.random()*3)});if(rust)c.rusty=true;if(c.bike&&!o.noRider&&!o.parked)addRider(c);return c;}
function curbSpot(){const cf=new THREE.Vector3();camera.getWorldDirection(cf);const gi=Math.round((P.pos.x+HALF)/CELL),gj=Math.round((P.pos.z+HALF)/CELL);
 for(let t=0;t<18;t++){const a={i:clamp(gi+Math.floor(R(-3,4)),0,N),j:clamp(gj+Math.floor(R(-3,4)),0,N)};const b=pick(nbrs(a));const A=nd(a.i,a.j),B=nd(b.i,b.j);const tt=R(.22,.78);
  const dx=Math.sign(B.x-A.x),dz=Math.sign(B.z-A.z),h=Math.atan2(dx,dz);const x=A.x+(B.x-A.x)*tt-Math.cos(h)*6.35,z=A.z+(B.z-A.z)*tt+Math.sin(h)*6.35;
  const d=Math.hypot(x-P.pos.x,z-P.pos.z);if(d<45||d>215)continue;const vx=x-camera.position.x,vz=z-camera.position.z,dd=Math.hypot(vx,vz);if(dd<120&&(vx*cf.x+vz*cf.z)/dd>.1)continue;
  let ok=true;for(const o of cars)if(Math.abs(o.pos.x-x)<7&&Math.abs(o.pos.z-z)<7){ok=false;break;}if(!ok)continue;
  for(const p of places)if(Math.abs(p.x-x)<10&&Math.abs(p.z-z)<10){ok=false;break;}if(!ok||Math.hypot(x-GARAGE.x,z-GARAGE.z)<26||missionBlocks(x,z))continue;
  return {x,z,h};}return null;}
function parkTick(dt){PARK.t-=dt;if(PARK.t>0)return;PARK.t=.5;if(mode!=='play')return;let near=0;
 for(let i=PARK.list.length-1;i>=0;i--){const c=PARK.list[i];if(!cars.includes(c)||c.mode!=='parked'||c.dropped||c.keep){PARK.list.splice(i,1);continue;}const d=Math.hypot(c.pos.x-P.pos.x,c.pos.z-P.pos.z);
  if(d>cullCar+30&&!c.g.visible){removeCar(c);PARK.list.splice(i,1);}else if(d<230)near++;}
 if(!blockAt(P.pos.x,P.pos.z))return;
 for(let k=0;k<2&&near<PARK_N;k++){const s=curbSpot();if(!s)continue;const c=carFor(wealthAt(s.x,s.z),{noBus:true,parked:true});c.mode='parked';c.pos.set(s.x,0,s.z);c.h=s.h;c.g.position.set(s.x,groundY(s.x,s.z),s.z);c.g.rotation.y=s.h;c.speed=0;c.ambPark=true;cars.push(c);PARK.list.push(c);near++;}}
function trafficRecycle(){for(const c of cars){if(c.mode!=='ai'||c.keep||c===P.inCar||c.g.visible||c.panicT>0)continue;if(Math.hypot(c.pos.x-P.pos.x,c.pos.z-P.pos.z)>cullCar+40){removeCar(c);return;}}}

// ---------- Boote auf dem Wasser: Speedboote, Segelboote, Yachten, Fähre zur Insel ----------
function loftHull(o){// o:{L,B,fb,fbBow,draft,dr,deck:'deck'|'hullW',stripe}
 const K=partKit();const z0=-o.L*.46,z1=o.L*.54;
 const CT=[0,.12,.3,.5,.68,.8,.9,.96,1],CW=[.9,.96,1,1,.95,.83,.62,.36,.03],CK=[0,0,0,0,.05,.16,.38,.62,.92],CS=[0,0,.01,.04,.09,.16,.26,.36,.42];
 const ip=(A,t)=>{let i=1;while(i<CT.length-1&&t>CT[i])i++;const u=clamp((t-CT[i-1])/(CT[i]-CT[i-1]),0,1);return A[i-1]+(A[i]-A[i-1])*u*u*(3-2*u)*.5+(A[i]-A[i-1])*u*.5;};
 const sec=z=>{const t=(z-z0)/(z1-z0),hw=Math.max(.03,o.B/2*ip(CW,t)),k=-o.draft+o.draft*1.6*ip(CK,t)/.92*.92,sh=o.fb+(o.fbBow-o.fb)*ip(CS,t)/.42;
  const y1=Math.min(k+o.dr*hw/1.2,sh-.4),y2=Math.min(Math.max(y1+.12,.2),sh-.3),y3=sh-o.fb*.32,y4=sh-o.fb*.18;return {hw,sh,pts:[[0,k],[hw*.8,y1],[hw*.93,y2],[hw*.975,y3],[hw*.99,y4],[hw,sh]]};};
 const zs=[];for(let i=0;i<=26;i++){const t=i/26;zs.push(z0+(z1-z0)*(1-Math.pow(1-t,1.4)));}const S=zs.map(z=>[z,sec(z)]);
 const band=['bottom','bottom','hullW','paint','hullW'];
 for(const s of [-1,1])for(let j=0;j<5;j++)K.add(gridStrip(S.map(([z,q])=>[[s*q.pts[j][0],q.pts[j][1],z],[s*q.pts[j+1][0],q.pts[j+1][1],z]]),(x,y)=>[x,y-o.fb*.4,0]),band[j]);
 K.add(gridStrip(S.map(([z,q])=>{const r=[];for(let j=0;j<=6;j++){const u=-1+j/3;r.push([u*q.hw*.985,q.sh+.08*(1-u*u)*Math.min(1,q.hw/.6),z]);}return r;}),()=>[0,1,0]),o.deck||'deck');
 {const q=sec(z0),pos=[],poly=[];for(let j=5;j>=0;j--)poly.push(q.pts[j]);for(let j=1;j<=5;j++)poly.push([-q.pts[j][0],q.pts[j][1]]);const cy=(q.pts[0][1]+q.sh)/2;
  for(let i=0;i<poly.length-1;i++){const a=poly[i],b=poly[i+1];pos.push(0,cy,z0,a[0],a[1],z0,b[0],b[1],z0);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
  if(g.attributes.normal.array[2]>0){for(let t=0;t<pos.length;t+=9)for(let c=0;c<3;c++){const kk=pos[t+3+c];pos[t+3+c]=pos[t+6+c];pos[t+6+c]=kk;}g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();}K.add(g,'hullW');}
 K.T(S.map(([z,q])=>[q.hw+.02,q.sh-.06,z]),.035,'rub',40,5);K.T(S.map(([z,q])=>[-q.hw-.02,q.sh-.06,z]),.035,'rub',40,5);
 return {K,sec,z0,z1};}
function sailGeo(){if(SAILGEO)return SAILGEO;const H=loftHull({L:8.6,B:2.7,fb:1.15,fbBow:1.45,draft:.55,dr:.35,deck:'wood'});const K=H.K;
 K.B(1.6,.42,3.2,'hullW',0,1.35,.2);K.B(1.5,.06,3.0,'deck',0,1.58,.2);for(const s of [-1,1])K.B(.02,.14,2.4,'glassD',s*.81,1.36,.25);
 K.C(.07,.05,11,'chrome',0,6.7,1.2,10);K.Cz(.045,.045,3.6,'chrome',0,2.25,-.6,8);K.T([[-1.1,1.55,-3.3],[-1.15,1.85,-3.6],[1.15,1.85,-3.6],[1.1,1.55,-3.3]],.02,'chrome',16,5);
 const sail=(pts)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));g.computeVertexNormals();return g;};
 K.add(sail([0,2.35,1.1, 0,11.6,1.15, 0,2.35,-2.35, 0,2.35,-2.35, 0,11.6,1.15, .12,6.5,-.4]),'sail');K.add(sail([0,1.6,4.0, 0,10.6,1.3, 0,2.1,1.35, 0,2.1,1.35, 0,10.6,1.3, .1,5.6,2.4]),'sail');
 SAILGEO=K.done(VPLANAR);return SAILGEO;}
function yachtGeo(){if(YACHTGEO)return YACHTGEO;const H=loftHull({L:17,B:4.6,fb:2.1,fbBow:2.7,draft:.9,dr:.45,deck:'wood'});const K=H.K;
 K.B(3.9,1.5,8.2,'hullW',0,2.85,-1.2);K.B(3.95,.55,8.0,'glassD',0,2.85,-1.2);K.B(3.2,1.2,5.0,'hullW',0,4.2,-1.8);K.B(3.25,.45,4.8,'glassD',0,4.25,-1.8);K.B(3.6,.1,5.6,'hullW',0,4.86,-2.0);
 K.B(.5,1.6,.5,'hullW',0,5.6,-1.0);K.B(1.6,.18,.35,'chrome',0,6.4,-1.0);K.C(.6,.6,.12,'white',0,5.0,.8,16);K.T([[-1.9,2.1,-6.8],[-2.0,3.0,-7.2],[2.0,3.0,-7.2],[1.9,2.1,-6.8]],.03,'chrome',16,5);
 for(const s of [-1,1])K.T([[s*1.9,2.25,-4],[s*1.95,2.95,0],[s*1.6,2.95,4],[s*.6,3.1,7.2]],.025,'chrome',30,5);
 YACHTGEO=K.done(VPLANAR);return YACHTGEO;}
function ferryGeo(){if(FERRYGEO)return FERRYGEO;const H=loftHull({L:34,B:8.6,fb:2.6,fbBow:3.3,draft:1.4,dr:.4,deck:'deck'});const K=H.K;
 K.B(7.6,2.6,20,'hullW',0,3.9,-1.5);K.B(7.65,1.0,19.6,'glassD',0,4.2,-1.5);K.B(6.6,2.2,13,'hullW',0,6.3,-2.5);K.B(6.65,.85,12.6,'glassD',0,6.55,-2.5);
 K.B(5.6,1.5,4.2,'hullW',0,8.2,3.0);K.B(5.65,.6,4.0,'glassD',0,8.45,3.6);K.C(.9,1.1,3.4,'funnel',0,9.3,-6.5,14);K.C(.95,.95,.6,'navy',0,11.05,-6.5,14);
 for(const s of [-1,1]){K.B(.3,.3,15,'paint',s*3.85,3.0,-1.5);K.C(.45,.45,1.6,'paint',s*3.3,5.6,6.5,10,0,0,Math.PI/2);}
 FERRYGEO=K.done(VPLANAR);return FERRYGEO;}
function waterPathOk(ax,az,bx,bz){const L=Math.hypot(bx-ax,bz-az),n=Math.ceil(L/12);for(let i=0;i<=n;i++){const t=i/n,x=ax+(bx-ax)*t,z=az+(bz-az)*t;if(!isWater(x,z)||!isWater(x+9,z)||!isWater(x-9,z)||!isWater(x,z+9)||!isWater(x,z-9))return false;}return true;}
function ambBoatMake(kind){const g=new THREE.Group(),body=new THREE.Group();g.add(body);let geo,mats,spd,L;
 if(kind==='speed'){const pm=paint(pick([0x1f5fbf,0xc0392b,0x111111,0xf1c40f,0x16a085]));geo=boatGeo();mats=boatMats(pm);spd=R(11,16);L=7;
  const d=buildChar(classSkin(pick(['rich','mid','beach'])));d.g.position.set(BOAT_SEAT.x,BOAT_SEAT.y,BOAT_SEAT.z);d.armL.rotation.x=d.armR.rotation.x=-1.05;body.add(d.g);g.userData.driver=d;}
 else{geo=kind==='sail'?sailGeo():kind==='yacht'?yachtGeo():ferryGeo();const pm=paint(kind==='ferry'?0x1f5fbf:pick([0x16243a,0x1f5fbf,0x7a1f1f,0x0e6655]));mats=geo.userData.keys.map(k=>k==='paint'?pm:(VMAT[k]||SAILM[k]||VMAT.hullW));spd=kind==='sail'?R(3.5,5.5):kind==='yacht'?R(6,9):7.5;L=kind==='sail'?8.6:kind==='yacht'?17:34;}
 const m=new THREE.Mesh(geo,mats);m.castShadow=true;m.receiveShadow=true;body.add(m);scene.add(g);
 return {g,body,kind,spd,L,pos:new THREE.Vector3(),h:0,tx:0,tz:0,wakeT:0};}
function ambBoatsTick(dt){if(mode!=='play'&&mode!=='cine')return;const px=camera.position.x,pz=camera.position.z;AMBB.t-=dt;
 const nearSea=pz>WATER_Z-260||Math.hypot(px-IX,pz-IZ)<700;
 if(AMBB.t<=0){AMBB.t=1.2;
  // Fähre: Stadtpier ↔ Insel
  if(!AMBB.ferry){const f=ambBoatMake('ferry');f.route=[{x:PIERX+60,z:WATER_Z+120},{x:(PIERX+IX)/2+140,z:(WATER_Z+IZ)/2},{x:IX+IR+70,z:IZ-40}];f.ri=1;f.pos.set(f.route[0].x,0,f.route[0].z);f.h=Math.atan2(f.route[1].x-f.pos.x,f.route[1].z-f.pos.z);f.wait=0;AMBB.ferry=f;AMBB.list.push(f);}
  for(let i=AMBB.list.length-1;i>=0;i--){const b=AMBB.list[i];if(b===AMBB.ferry)continue;if(Math.hypot(b.pos.x-px,b.pos.z-pz)>950||!nearSea&&Math.hypot(b.pos.x-px,b.pos.z-pz)>500){scene.remove(b.g);AMBB.list.splice(i,1);}}
  const cnt=AMBB.list.length-1;if(nearSea&&cnt<AMBB_N){for(let k=0;k<10;k++){const a=Math.random()*6.28,r=R(260,620),x=px+Math.cos(a)*r,z=pz+Math.sin(a)*r;if(!isWater(x,z)||!waterPathOk(x,z,x+1,z+1))continue;
    const kind=pickW([['speed',4],['sail',3],['yacht',2]]);const b=ambBoatMake(kind);b.pos.set(x,0,z);b.h=Math.random()*6.28;ambBoatTarget(b);AMBB.list.push(b);break;}}}
 for(const b of AMBB.list){if(b.route){const t=b.route[b.ri];const dx=t.x-b.pos.x,dz=t.z-b.pos.z,d=Math.hypot(dx,dz);if(b.wait>0){b.wait-=dt;}else{if(d<14){if(b.ri===0||b.ri===b.route.length-1){b.wait=25;b.dir=b.ri===0?1:-1;}b.ri=clamp(b.ri+(b.dir||1),0,b.route.length-1);}
    const des=Math.atan2(dx,dz);b.h=lerpAng(b.h,des,dt*.25);const sp=b.wait>0?0:Math.min(b.spd,d*.18+1);b.pos.x+=Math.sin(b.h)*sp*dt;b.pos.z+=Math.cos(b.h)*sp*dt;}}
  else{const dx=b.tx-b.pos.x,dz=b.tz-b.pos.z,d=Math.hypot(dx,dz);if(d<20)ambBoatTarget(b);const des=Math.atan2(dx,dz);b.h=lerpAng(b.h,des,dt*(b.kind==='speed'?.8:.35));
   let sp=b.spd;const pp=P.inCar&&P.inCar.boat?P.inCar.pos:null;if(pp){const ox=pp.x-b.pos.x,oz=pp.z-b.pos.z,od=Math.hypot(ox,oz);if(od<b.L+8&&(ox*Math.sin(b.h)+oz*Math.cos(b.h))>0)sp*=.25;}
   const nx=b.pos.x+Math.sin(b.h)*sp*dt,nz=b.pos.z+Math.cos(b.h)*sp*dt;if(isWater(nx+Math.sin(b.h)*b.L*.6,nz+Math.cos(b.h)*b.L*.6)){b.pos.x=nx;b.pos.z=nz;}else ambBoatTarget(b);}
  const vis=Math.hypot(b.pos.x-px,b.pos.z-pz)<(b.kind==='ferry'?1400:900);b.g.visible=vis;if(!vis)continue;
  const y=boatFloat(b,dt);const s=b.kind==='ferry'?.35:b.kind==='yacht'?.55:1;b.g.position.set(b.pos.x,y+(b.kind==='ferry'?.25:b.kind==='yacht'?.15:0),b.pos.z);b.g.rotation.y=b.h;b.body.rotation.x=(b._wp||0)*s;b.body.rotation.z=(b._wr||0)*s+(b.kind==='sail'?.12:0);
  b.wakeT-=dt;if(b.wakeT<=0&&b.kind!=='sail'&&mode==='play'){b.wakeT=b.kind==='speed'?.14:.32;const bx=b.pos.x-Math.sin(b.h)*b.L*.5,bz=b.pos.z-Math.cos(b.h)*b.L*.5;if(Math.hypot(bx-px,bz-pz)<240&&fx.length<380){const sp=sprite(smokeTex,new THREE.Color(1,1,1),false);sp.position.set(bx,SEA_Y+.3,bz);sp.scale.setScalar(b.kind==='ferry'?2.6:1.4);scene.add(sp);fx.push({s:sp,t:1.6,life:1.6,vel:new THREE.Vector3(0,.15,0),grow:b.kind==='ferry'?3:1.6,fade:.55});}}}}
function ambBoatTarget(b){for(let k=0;k<14;k++){const a=b.h+R(-1.4,1.4),r=R(120,320),x=b.pos.x+Math.sin(a)*r,z=b.pos.z+Math.cos(a)*r;if(waterPathOk(b.pos.x,b.pos.z,x,z)){b.tx=x;b.tz=z;return;}}b.tx=b.pos.x-Math.sin(b.h)*150;b.tz=b.pos.z-Math.cos(b.h)*150;}
function ambAirTick(dt){if(mode!=='play'&&mode!=='cine')return;AMBA.t-=dt;const px=camera.position.x,pz=camera.position.z;
 if(AMBA.t<=0){AMBA.t=4;const hel=AMBA.list.filter(a=>a.kind==='heli').length,pl=AMBA.list.filter(a=>a.kind!=='heli').length;
  if(hel<AMBA_H){const a=makeHeli(pick([0xf4f4f4,0x1f5fbf,0xc0392b,0x111111,0xf1c40f]),false,false);const ang=Math.random()*6.28;a.g.position.set(px+Math.cos(ang)*700,R(80,140),pz+Math.sin(ang)*700);AMBA.list.push({kind:'heli',a,h:0,alt:R(70,130),tx:px+R(-300,300),tz:pz+R(-300,300),spd:R(26,36),life:R(90,160)});}
  if(pl<2){const r=Math.random();if(r<.5){// Landeanflug oder Start am Flughafen
    const arr=Math.random()<.5,dirz=Math.random()<.5?1:-1,a=makePlane(pick([0xf4f4f4,0xf4f4f4,0xe8eef4]),true,pick(['liner','liner','cargo','private']));
    const z0=arr?-dirz*2600:dirz*340,y0=arr?150:groundY(RWX,dirz*340);a.g.position.set(RWX,y0,z0);AMBA.list.push({kind:arr?'arr':'dep',a,h:dirz>0?0:Math.PI,dz:dirz,spd:arr?75:0,t:0});}
   else{const a=makePlane(pick([0xf4f4f4,0xffffff,0xd8e0ea]),true,pick(['liner','cargo']));const ang=Math.random()*6.28;a.g.position.set(px+Math.cos(ang)*2400,R(480,700),pz+Math.sin(ang)*2400);AMBA.list.push({kind:'over',a,h:Math.atan2(-Math.cos(ang),-Math.sin(ang))+R(-.3,.3),spd:R(120,160),t:0});}}}
 for(let i=AMBA.list.length-1;i>=0;i--){const o=AMBA.list[i],a=o.a,g=a.g;let done=false;
  if(o.kind==='heli'){o.life-=dt;const dx=o.tx-g.position.x,dz=o.tz-g.position.z,d=Math.hypot(dx,dz);if(d<60){o.tx=(o.life>0?px:g.position.x+dx*10)+R(-350,350);o.tz=(o.life>0?pz:g.position.z+dz*10)+R(-350,350);}
   const des=Math.atan2(dx,dz);o.h=lerpAng(o.h,des,dt*.6);const turn=angWrap(des-o.h);g.position.x+=Math.sin(o.h)*o.spd*dt;g.position.z+=Math.cos(o.h)*o.spd*dt;const gy=groundY(g.position.x,g.position.z);g.position.y+=(Math.max(o.alt,gy+60)-g.position.y)*Math.min(1,dt*.5);
   g.rotation.set(.12,o.h,-clamp(turn,-.5,.5)*.5);a.spin=(a.spin||0)+dt*32;if(a.rotor)a.rotor.rotation.y=a.spin;if(a.tailRotor)a.tailRotor.rotation.x=a.spin*1.5;
   if(o.life<0&&Math.hypot(g.position.x-px,g.position.z-pz)>900)done=true;}
  else if(o.kind==='arr'){o.t+=dt;const z=g.position.z,zTD=-o.dz*330;// Aufsetzpunkt
   if(!o.ground){const rem=(zTD-z)*o.dz,gy=groundY(RWX,clamp(z,-370,370));const tgtY=Math.max(gy,gy+rem*Math.tan(.052));g.position.y+=(tgtY-g.position.y)*Math.min(1,dt*1.5);g.position.z+=o.dz*o.spd*dt;g.rotation.set(-.06,o.h,0);if(rem<5){o.ground=true;tone(90,.4,'sawtooth',.02,g.position);}}
   else{o.spd=Math.max(9,o.spd-dt*9);g.position.y=groundY(g.position.x,g.position.z);g.position.z+=o.dz*o.spd*dt;g.rotation.set(0,o.h,0);if((g.position.z*o.dz)>320)done=true;}}
  else if(o.kind==='dep'){o.t+=dt;if(o.t<6){o.spd=0;}else{o.spd=Math.min(95,o.spd+dt*7);}g.position.z-=o.dz*o.spd*dt;const air=o.spd>62;if(air)g.position.y+=dt*o.spd*.09;g.rotation.set(air?.12:0,o.h+Math.PI,0);if(Math.abs(g.position.z)>2800||g.position.y>600)done=true;}
  else{g.position.x+=Math.sin(o.h)*o.spd*dt;g.position.z+=Math.cos(o.h)*o.spd*dt;g.rotation.set(0,o.h,0);o.t+=dt;if(o.t>60)done=true;}
  if(done){scene.remove(g);AMBA.list.splice(i,1);}}}
// Liegeplatz-Boote im Hafen (statt der alten Kästen)
function initMarina(){for(const [bx,bz,k,h] of [[PIERX-16,WATER_Z+22,'sail',0],[PIERX+17,WATER_Z+14,'yacht',Math.PI],[PIERX-24,WATER_Z+58,'sail',.3],[-300,WATER_Z+62,'yacht',2.2],[420,WATER_Z+92,'sail',-.8]]){
 const b=ambBoatMake(k);b.g.position.set(bx,SEA_Y-.1,bz);b.g.rotation.y=h;if(k==='sail'){b.body.children.forEach(m=>{});}boats.push(b.g);}}
function ipShuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
// Platz frei? (Sitzplätze stehen absichtlich auf Möbeln)
function ipFree(s,m=.2){const x=s[0],z=s[1];if(/^sit|^read/.test(s[3]||''))return true;
 for(const b of solidsNear(x,z,1)){if(b.camOnly||b.open||b.water)continue;if(x+m>b.x0&&x-m<b.x1&&z+m>b.z0&&z-m<b.z1)return false;}return true;}
// Aufstehen: wer in einer Sitzbank/einem Stuhl steckt, tritt erst einmal ins Freie
function ipUnstick(n){const g=n.c.g.position;if(ipFree([g.x,g.z],.3))return;for(let r=.35;r<=2.45;r+=.35)for(let a=0;a<12;a++){const an=a/12*Math.PI*2+n.ip.face,x=g.x+Math.sin(an)*r,z=g.z+Math.cos(an)*r;if(ipFree([x,z],.34)){g.x=x;g.z=z;g.y=groundY(x,z);return;}}}
// Spätis, Tankstellen-Shops und der Juwelier bekommen ein Standard-Layout
function ipStoreVenue(st,jewel){const f=st.front||1,cx=st.cx,cz=st.cz,w=st.w,d=st.d,fz=cz+f*d/2,bz=cz-f*d/2,F=f>0?0:Math.PI,B=f>0?Math.PI:0,kx=st.counter.x,kz=st.counter.z,H2=Math.PI/2;
 const wc=wealthClass(wealthAt(cx,cz)),cls=wc==='rich'?['rich','rich','mid']:wc==='poor'?['poor','poor','mid']:['mid','mid','poor','rich','beach'];
 const V={id:jewel?'jewel':'st'+st.id,kind:jewel?'jewel':'store',name:st.name||'Laden',x0:cx-w/2,x1:cx+w/2,z0:cz-d/2,z1:cz+d/2,cls:jewel?['rich','rich','mid']:cls,store:jewel?null:st,
  exits:[[cx,fz-f*1.3,cx,fz+f*4]],walk:[],cust:[],staffX:[],guards:[],gBase:0,ncust:[1,2],nstroll:1};
 if(jewel)Object.assign(V,{zone:'jewel',cash:[1200,2200],wantA:1,wantR:2,anchor:[st.clerk.x,st.clerk.z],ncust:[2,3],
  staffX:[[st.clerk.x,st.clerk.z,F,'idle'],[cx+3,bz+f*1.6,F,'idle']],staffSkin:{oberteil:5,oberteilfarbe:2,hose:4,hosenfarbe:1},
  cust:[[cx-2.2,cz+f*1.45,B,'look'],[cx+5.4,cz+f*1.45,B,'look','bags'],[kx,kz+f*1.05,B,'chat']],
  walk:[[cx+1.6,cz+f*1.5,B,'look'],[cx-6,cz+f*1.5,B,'look'],[cx+3,cz+f*3.4,B,'wait']],
  guards:[[cx+6.5,fz-f*1.7,B,'pistol'],[cx-6.5,fz-f*1.7,B,'pistol'],[cx+6,bz+f*2.4,F,'smg']],gBase:1});
 else{V.rob=false;
  V.cust=[[kx+w*.12,kz+f*.95,B,'wait'],[cx+w*.1,cz+f*.6,B,'look'],[cx+w*.3,cz+f*.6,F,'look'],[cx+w*.25,bz+f*1.7,B,'look'],[cx-w/2+1.2,fz-f*1.4,-H2,'read','news'],[cx+w/2-1.2,fz-f*1.1,H2,'type']];
  V.walk=[[cx+w*.05,cz+f*.6,B,'look'],[cx+w*.12,cz+f*3.2,B,'look'],[cx+w*.4,bz+f*1.7,B,'look'],[cx-w*.25,cz+f*2.5,B,'wait']];}
 IPOPS.push(V);}
function initIpop(){
 for(const st of stores)if(st.cx!=null&&st.counter)ipStoreVenue(st,false);
 try{if(JEWEL&&JEWEL.store)ipStoreVenue(JEWEL.store,true);}catch(e){}
 const ids={};for(const V of IPOPS){if(ids[V.id])V.id+=++ids[V.id];else ids[V.id]=1;}
 for(const V of IPOPS){V.peds=[];V.active=false;V.alarm=false;V.hostile=false;V.cool=0;V.rs=null;V.enterT=RR(4,12);
  V.cx=(V.x0+V.x1)/2;V.cz=(V.z0+V.z1)/2;V.I=outerInterior(V.cx,V.cz);
  V.pups=PUPPETS.filter(p=>p.staff&&ipInside(V,p.x,p.z));
  V._drop=[];for(const k of ['cust','walk','staffX','guards'])if(V[k])V[k]=V[k].filter(s=>{const ok=ipFree(s);if(!ok)V._drop.push(k+':'+s.slice(0,2).map(v=>v.toFixed(1)).join(','));return ok;});}
 // Läden mit Alarm verkaufen nichts
 for(const k of ['gunshop','clothes','burger','pizza']){const f=PLACE_ACT[k];if(!f)continue;PLACE_ACT[k]=p=>{for(const V of IPOPS)if(V.active&&V.alarm&&ipInside(V,p.x,p.z)){toast('Gerade geschlossen – hier herrscht Alarm!');return;}return f(p);};}}
function ipBlocked(V){if(!mission)return false;if(V.hub)return true;if(V.zone&&mission.zones&&mission.zones.includes(V.zone))return true;return missionBlocks(V.cx,V.cz);}
function ipDens(){return (1-.35*night)*(WX.rain>.3?1.15:1);}
function ipGuardSkin(){const s=randomSkin();s.oberteil=3;s.topC=pick([0x34404f,0x2b2f36,0x3a3f47]);s.hose=0;s.pantsC=0x1f242b;s.schuhe=1;s.extra=3;if(s.statur===4)s.statur=2;return s;}
function ipMake(V,role,sk,x,z,face,anim){const c=buildChar(sk);scene.add(c.g);c.g.position.set(x,groundY(x,z),z);c.g.rotation.set(0,face,0);
 const n={c,kind:'civ',hp:100,aggro:false,armed:false,vel:new THREE.Vector3(),timer:0,phase:Math.random()*6,atkT:RR(.6,1.4),stagger:0,state:'ipidle',
  ip:{v:V,role,x,z,face,anim},anim,it:Math.random()*5,ast:Math.floor(Math.random()*3)};
 peds.push(n);V.peds.push(n);return n;}
