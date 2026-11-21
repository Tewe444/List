'use strict';
padLoad();
const PADS={cur:[],prev:[],connected:false,ps:false,id:'',fire:false,aim:false,hold:new Set(),cap:null,rumbleT:0,nav:{el:null,root:null,dir:'',rt:0}};
const PADAX={lx:0,ly:0,rx:0,ry:0};
if(!['kb','pad','touch'].includes(SET.input))SET.input=detectInput();
for(const [k,v] of Object.entries({padSens:1,touchSens:1,invY:false,flightInv:true,assist:true,rumble:true,tOpacity:.75,aimToggle:true}))if(SET[k]==null)SET[k]=v;
addEventListener('resize',()=>{hudZoom();TCH.sig='';});

// ---------- Halten-Logik: mehrere Quellen (Tastatur, Maus, Controller, Touch) ----------
const HOLD={};

// ---------- Analoge Eingabe (Stick / Touch-Joystick) ----------
const AN={x:0,y:0,on:false};const TJ={x:0,y:0};

// ---------- Tasten neu belegen (Tastatur & Maus) ----------
let KCAP=null;
let KCAP_IGN=-1e9;
const dzn=(v,d=.17)=>Math.abs(v)<d?0:(v-Math.sign(v)*d)/(1-d);
const pp=i=>i>=0&&!!PADS.cur[i],pe=i=>i>=0&&!!PADS.cur[i]&&!PADS.prev[i];
const lctx=c=>c==='para'?'foot':c==='heli'||c==='plane'?'air':c;
const MC={x:.5,y:.5};

// ---------- Touch-Steuerung ----------
const TL_DEF={joy:{x:.15,y:.7,s:.32},map:{x:.62,y:.09,s:.11},pause:{x:.7,y:.09,s:.11},
 foot:{fire:{x:.88,y:.72,s:.22},aim:{x:.72,y:.85,s:.15},jump:{x:.9,y:.45,s:.14},sprint:{x:.75,y:.62,s:.14},use:{x:.58,y:.85,s:.13},reload:{x:.61,y:.66,s:.12},weapon:{x:.76,y:.42,s:.12}},
 car:{gas:{x:.89,y:.7,s:.2},brake:{x:.73,y:.84,s:.15},jump:{x:.9,y:.44,s:.14},use:{x:.58,y:.85,s:.13},horn:{x:.74,y:.58,s:.12},radio:{x:.6,y:.62,s:.11},job:{x:.76,y:.4,s:.11},fire:{x:.46,y:.85,s:.13}},
 air:{gas:{x:.89,y:.7,s:.18},brake:{x:.73,y:.84,s:.14},jump:{x:.9,y:.44,s:.14},sprint:{x:.75,y:.58,s:.14},use:{x:.58,y:.85,s:.13},fire:{x:.6,y:.63,s:.13},aim:{x:.46,y:.85,s:.12}}};
let TLAY=null;
tLoad();
const TB={fire:{i:'💥',l:{foot:'Feuer',car:'Kanone',air:'MG'}},aim:{i:'🎯',l:{foot:'Zielen',air:'Raketen'}},
 jump:{i:'⤒',l:{foot:'Springen',para:'Schirm',car:'Handbremse',heli:'Steigen',plane:'Nase hoch',air:'Steigen'}},sprint:{i:'»',l:{foot:'Sprint',heli:'Sinken',plane:'Nase runter',air:'Sinken'}},
 use:{i:'✋',l:{foot:'Aktion',car:'Aussteigen',air:'Raus'}},reload:{i:'⟳',l:{foot:'Laden'}},weapon:{i:'🔫',l:{foot:'Waffe'}},
 gas:{i:'▲',l:{car:'Gas',air:'Schub'}},brake:{i:'▼',l:{car:'Bremse',air:'Bremse'}},horn:{i:'📯',l:{car:'Hupe'}},radio:{i:'📻',l:{car:'Radio'}},job:{i:'★',l:{car:'Job'}},
 map:{i:'🗺️',l:{all:'Karte'}},pause:{i:'⏸️',l:{all:'Pause'}}};
const TCH={joy:null,look:null,btn:new Map(),hold:new Set(),sig:'',els:{},hlT:0};
const tBase=()=>Math.min(innerWidth,innerHeight,560);

// ---------- Zielhilfe (Controller & Touch) ----------
const AST={t:null,fast:0,chk:0};

// ---------- Tasten-Texte passend zum Gerät (für Tipps & Hinweise) ----------
const KTC=new Map();
const KTOK={W:'fwd',A:'left',S:'back',D:'right',Shift:'sprint',Leertaste:'jump',E:'use',F:'job',R:'reload',H:'horn',Q:'radio',M:'map',P:'pause',Esc:'pause',Tab:'wheel',T:'time'};

// ---------- Oberflächen: Steuerungs-Menü, Touch-Editor, Auswahl im Charakter-Editor ----------
try{document.body.insertAdjacentHTML('beforeend',`<div id="touch"></div><div id="tportrait"><i>📱</i>Bitte dreh dein Handy quer</div>
<div id="ctrl"><div class="cbox"><div class="chead"><h2>STEUERUNG</h2><button class="smallbtn" id="cclose">✕ Fertig</button></div><div id="cbody"></div></div></div>
<div id="tedit"><div id="tearea"></div><div id="tebar"><b>Touch-Buttons anpassen</b><div class="teseg" id="tectx"><button data-c="foot" class="on">Zu Fuß</button><button data-c="car">Fahrzeug</button><button data-c="air">Fliegen</button></div>
<small id="tesel">Zieh die Buttons an eine neue Stelle. Tipp einen an, um seine Größe zu ändern.</small><input type="range" id="tesize" min="0.06" max="0.45" step="0.005" value="0.14">
<div class="terow"><button class="smallbtn" id="tereset">Standard</button><button class="bigbtn" id="tedone">Fertig ✓</button></div></div></div><div id="mapcur"></div>`);}catch(e){}
const CTRL={dev:'kb'};
$('cclose').onclick=()=>closeCtrl();
// --- Touch-Layout-Editor ---
const TED={ctx:'foot',sel:null,drag:null};
$('tectx').onclick=e=>{const b=e.target.closest('button');if(!b)return;TED.ctx=b.dataset.c;TED.sel=null;renderTEdit();uiClick();};
$('tesize').oninput=()=>{if(!TED.sel)return;tEdP(TED.sel).s=clamp(+$('tesize').value,.06,.45);renderTEdit();};
$('tereset').onclick=()=>{const c=TED.ctx;TLAY[c]=JSON.parse(JSON.stringify(TL_DEF[c]));for(const k of ['joy','map','pause'])TLAY[k]=Object.assign({},TL_DEF[k]);TED.sel=null;renderTEdit();uiClick();};
$('tedone').onclick=()=>closeTEdit();
$('tearea').addEventListener('pointerdown',e=>{const el=e.target.closest('[data-id]');if(!el)return;e.preventDefault();TED.sel=el.dataset.id;const p=tEdP(TED.sel);TED.drag={id:e.pointerId,ox:p.x*innerWidth-e.clientX,oy:p.y*innerHeight-e.clientY,moved:false};try{$('tearea').setPointerCapture(e.pointerId);}catch(_){}renderTEdit();});
$('tearea').addEventListener('pointermove',e=>{const d=TED.drag;if(!d||d.id!==e.pointerId)return;const p=tEdP(TED.sel);p.x=clamp((e.clientX+d.ox)/innerWidth,.02,.98);p.y=clamp((e.clientY+d.oy)/innerHeight,.03,.97);d.moved=true;
 const el=$('tearea').querySelector(`[data-id="${TED.sel}"]`);if(el){el.style.left=p.x*100+'%';el.style.top=p.y*100+'%';}});
$('tearea').addEventListener('pointerup',()=>{TED.drag=null;});$('tearea').addEventListener('pointercancel',()=>{TED.drag=null;});
// Die Leiste selbst lässt sich am Titel verschieben, falls sie einen Button verdeckt
{const bar=$('tebar'),ttl=bar.querySelector('b');let bd=null;
 ttl.style.cursor='move';ttl.textContent='⠿ Touch-Buttons anpassen';
 ttl.addEventListener('pointerdown',e=>{e.preventDefault();const r=bar.getBoundingClientRect();bd={id:e.pointerId,ox:r.left+r.width/2-e.clientX,oy:r.top+r.height/2-e.clientY};try{ttl.setPointerCapture(e.pointerId);}catch(_){}});
 ttl.addEventListener('pointermove',e=>{if(!bd||bd.id!==e.pointerId)return;bar.style.left=clamp(e.clientX+bd.ox,60,innerWidth-60)+'px';bar.style.top=clamp(e.clientY+bd.oy,40,innerHeight-40)+'px';});
 ttl.addEventListener('pointerup',()=>{bd=null;});ttl.addEventListener('pointercancel',()=>{bd=null;});}
// --- Touch-Ebene: Joystick, Kamera wischen, Buttons ---
{const tl=$('touch');
 tl.addEventListener('pointerdown',e=>{if(SET.input!=='touch'||mode!=='play')return;e.preventDefault();try{tl.setPointerCapture(e.pointerId);}catch(_){}
  const b=e.target&&e.target.closest?e.target.closest('.tb'):null;if(b){tBtnDown(b.dataset.id,e);return;}
  if(!TCH.joy&&e.clientX<innerWidth*.45){tJoyStart(e);return;}if(!TCH.look)TCH.look={id:e.pointerId,x:e.clientX,y:e.clientY};},{passive:false});
 tl.addEventListener('pointermove',e=>{if(TCH.joy&&TCH.joy.id===e.pointerId){tJoyMove(e);return;}if(TCH.look&&TCH.look.id===e.pointerId){tLookMove(e);return;}
  const b=TCH.btn.get(e.pointerId);if(b&&b.wheel&&wheelOpen){wheelMouse((e.clientX-b.x)*1.6,(e.clientY-b.y)*1.6);}if(b){b.x=e.clientX;b.y=e.clientY;}});
 tl.addEventListener('pointerup',tEnd);tl.addEventListener('pointercancel',tEnd);tl.addEventListener('contextmenu',e=>e.preventDefault());}
// Auf Touch-Geräten automatisch Touch nehmen, wenn ins Spiel getippt wird
renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&SET.input!=='touch'&&mode==='play'){let fine=false;try{fine=matchMedia('(pointer:fine)').matches;}catch(_){}if(!fine)setInput('touch',true);}});
// Charakter im Editor auch per Finger drehen
{let cx=null;renderer.domElement.addEventListener('pointerdown',e=>{if(mode==='creator'&&e.pointerType!=='mouse')cx=e.clientX;});addEventListener('pointermove',e=>{if(cx!=null&&mode==='creator'&&e.pointerType!=='mouse'){creatorYaw-=(e.clientX-cx)*.01;cx=e.clientX;}});addEventListener('pointerup',()=>{cx=null;});}
// --- Auswahl im Charakter-Editor ---
try{$('namewrap').insertAdjacentHTML('afterend',`<div id="inwrap"><label>STEUERUNG</label><div class="inch">${['kb','touch','pad'].map(k=>`<button data-in="${k}"><i>${DEV_NAME[k].split(' ')[0]}</i>${k==='kb'?'Tastatur':k==='touch'?'Touch':'Controller'}</button>`).join('')}</div><div class="insub" id="insub"></div><button class="smallbtn" id="inbind">⚙️ Tasten belegen</button></div>`);
 $('inwrap').addEventListener('click',e=>{const b=e.target.closest('[data-in]');if(b){setInput(b.dataset.in);uiClick();return;}if(e.target.closest('#inbind'))openCtrl(SET.input);});}catch(e){}
addEventListener('touchend',()=>{try{if(AC&&AC.state==='suspended')AC.resume();}catch(e){}},{passive:true});
// ---------- Pro Bild: Eingaben abfragen ----------
let inT=0;
try{$('presume').classList.add('navfirst');$('play').classList.add('navfirst');}catch(e){}
applyInputMode();

// ================= INTRO-ZWISCHENSEQUENZ (mit Ankunft per Boot) =================
let cineT=0,shotI=0,shotT=0,cineCars=[],shadowFocus=null,cineHide=null;
const cineFocus=new THREE.Vector3(),RZ=nodeX(9),PX=nodeX(7);
let race1=null,race2=null,flee=null,cop1=null,cop2=null;
// Boot-Fahrt: z(T) bremst weich bis zum Steg ab
const BOAT_T=13,BOAT_DOCK={x:JX+4.6,z:WATER_Z+22};
const boatZ=T=>BOAT_DOCK.z+280*Math.pow(1-clamp(T/BOAT_T,0,1),2);
let cinePlane=null,cineGroup=[],cineDt=1/60;
const CINE_BAG_GEO=new THREE.BoxGeometry(.42,.34,.24),CINE_BAG_MAT=cm(0x2d3a2a,.9);
const BANKC=()=>{const i=SPECIAL['7,6'].info;return {x:i.cx,z:i.cz+4};};
const cineEase=u=>{u=clamp(u,0,1);return u*u*(3-2*u);};
const SHOTS=[
 // 1 — großer Stadt-Reveal
 {d:7.4,txt:'PORT SOLARA. EINE STADT OHNE PAUSE.',tod:.34,
  start(){cineHide=null;lastEnvTod=-1;polRed.emissiveIntensity=0;polBlue.emissiveIntensity=0;},
  cam(t,u){const e=cineEase(u),a=t*.12;const x=520-330*e+Math.sin(a)*18,z=980-650*e,y=720-500*e;cineCam(x,y,z,30+Math.sin(a*.7)*12,8,-60+380*e,58-3*e);}},
 // 2 — Kamera gleitet durch den Verkehr auf Straßenhöhe
 {d:5.1,txt:'LICHTER. MOTORen. GESCHICHTEN AN JEDER ECKE.',
  start(){cineHide=null;},
  cam(t,u){const x=nodeX(2)+t*27,z=nodeX(6)+7,bob=Math.sin(t*2.1)*.13;cineCam(x-20,2.6+bob,z+13,x+24,1.15,z-7,68);}},
 // 3 — interaktives Straßenrennen, zunächst Autopilot, dann freie Übernahme
 {d:9.5,txt:'AUF DIESEN STRASSEN ZÄHLT JEDE SEKUNDE.',engine:1,
  start(){race1=cineCar(0xff8c1a,'sport');race2=cineCar(0x1f5fbf,'super');cineHide=c=>c.mode==='ai'&&Math.abs(c.pos.z-RZ)<10;
   cineRace={active:true,manual:false,keys:new Set(),x:nodeX(1),speed:37,steer:0,lateral:0,effect:0};
   $('cineRaceHud').classList.toggle('active',SET.input==='touch');$('cineRaceHud').classList.remove('manual','takeover');$('cinePrompt').classList.remove('active');$('cineCockpit').classList.remove('active');},
  cam(t,u){const R=cineRace,dt=cineDt,startX=nodeX(1),autoX=startX+t*39,w=Math.sin(t*1.65)*2.7;
   if(R){
    if(!R.manual){R.x=autoX;R.speed=39;R.lateral=0;}
    else{const Kc=R.keys,gas=Kc.has('KeyW')||Kc.has('ArrowUp'),brake=Kc.has('KeyS')||Kc.has('ArrowDown'),left=Kc.has('KeyA')||Kc.has('ArrowLeft'),right=Kc.has('KeyD')||Kc.has('ArrowRight');
     const steer=(left?1:0)-(right?1:0);R.steer+=(steer-R.steer)*Math.min(1,dt*7.5);
     if(gas)R.speed+=29*dt;else R.speed-=1.1*dt;if(brake)R.speed-=42*dt;if(Kc.has('Space'))R.speed*=Math.max(0,1-1.9*dt);
     R.speed=clamp(R.speed,0,68);R.lateral+=R.steer*(2.4+R.speed*.09)*dt;
     if(!left&&!right)R.lateral*=Math.max(0,1-dt*.2);
     if(Math.abs(R.lateral)>7.6){R.lateral=clamp(R.lateral,-7.6,7.6);R.speed=Math.max(0,R.speed-15*dt);R.effect=Math.max(R.effect,.2);}
     R.x+=R.speed*dt;
    }
    if(R.effect>0){R.effect=Math.max(0,R.effect-dt);shake=Math.max(shake,.035+R.effect*.16);}
   }
   const px=R&&R.manual?R.x:autoX+w,pz=R&&R.manual?RZ-3.5+R.lateral:RZ-3.5;
   setCar(race1,px,pz,Math.PI/2-(R&&R.manual?R.steer*.18:0),R?R.speed:39);setCar(race2,autoX-w-3,RZ+3.5,Math.PI/2,37);
   if(R&&R.manual){race1.g.visible=true;if(race1.body)race1.body.visible=false;const h=Math.PI/2-R.steer*.18;camYaw=h;camera.position.set(race1.pos.x+Math.sin(h)*.36,1.48,race1.pos.z+Math.cos(h)*.36);cineFocus.set(camera.position.x+Math.sin(h)*65,1.42,camera.position.z+Math.cos(h)*65);cineCam(camera.position.x,camera.position.y,camera.position.z,cineFocus.x,cineFocus.y,cineFocus.z,75+Math.min(R.speed,55)*.08);if(R.speed>35&&Math.random()<dt*2.5)shake=Math.max(shake,.06);}
   else{race1.g.visible=true;if(race1.body)race1.body.visible=true;
    if(t<1.8) cineCam(px-13,1.05,pz+5.6,px+9,1.05,pz,61);
    else if(t<4.3) cineCam(px-7,3.5,pz+13,px+6,1.2,pz,65);
    else cineCam(px-15,2.4,pz+7.5,px+16,1.35,pz,68);
   }
  }},
 // 4 — Verfolgungsjagd, wechselnde Totale und tiefe Verfolgerkamera
 {d:6.2,txt:'UND DIE POLIZEI IST NIE WEIT ENTFERNT.',siren:1,engine:1,
  start(){if(cineRace){cineRace.active=false;cineRace.keys.clear();}cineRace=null;$('cineRaceHud').classList.remove('active','manual','takeover');$('cineCockpit').classList.remove('active');removeCine(race1,race2);flee=cineCar(0x6c3483,'muscle');cop1=cineCar(0,'sedan',true);cop2=cineCar(0,'sedan',true);cineHide=c=>c.mode==='ai'&&Math.abs(c.pos.x-PX)<12;},
  cam(t,u){const z=nodeX(N-1)-t*34,lane=PX+3.5,wv=k=>Math.sin((t-k)*2.4)*1.9;setCar(flee,lane+wv(0),z,Math.PI-Math.cos(t*2.4)*.17,35);setCar(cop1,lane+wv(.4),z+10.5,Math.PI-Math.cos((t-.4)*2.4)*.17,36);setCar(cop2,lane-1+wv(.8),z+21,Math.PI-Math.cos((t-.8)*2.4)*.17,34);
   if(t<1.8) cineCam(PX-22,28,z+42,PX+2,0,z-7,55);else if(t<4.1)cineCam(PX+17,3.2,z+13,flee.pos.x,1.2,flee.pos.z-3,67);else cineCam(PX+2,1.55,z+25,flee.pos.x,1.2,flee.pos.z,72);
   if(Math.random()<cineDt*4)smoke(new THREE.Vector3(flee.pos.x-.4,.35,flee.pos.z+2.6),.7,.45,.65);polRed.emissiveIntensity=(time*8|0)%2?7:0;polBlue.emissiveIntensity=(time*8|0)%2?0:7;}},
 // 5 — der Überfall wird aus mehreren Blickwinkeln gezeigt
 {d:6.4,txt:'EIN PLAN. EIN VAN. UND EIN ZIEL: DIE NATIONALBANK.',siren:1,
  start(){removeCine(flee,cop1,cop2);polRed.emissiveIntensity=polBlue.emissiveIntensity=0;const B=BANKC(),mask={koerper:0,extra:7,oberteil:1,oberteilfarbe:1,hose:1,hosenfarbe:1,frisur:0};
   cineHide=c=>c.mode==='ai'&&Math.abs(c.pos.z-B.z-30)<14&&Math.abs(c.pos.x-B.x)<95;clearCineGroup();
   for(let k=0;k<3;k++){const c=cineGuy(B.x-3+k*3,B.z+17,0,mask),gm=weaponModel('smg');gm.rotation.x=Math.PI/2;c.handR.add(gm);const bag=new THREE.Mesh(CINE_BAG_GEO,CINE_BAG_MAT);bag.position.set(0,-.3,0);c.handL.add(bag);}
   const v=cineCar(0x3a4250,'van');setCar(v,B.x+6,B.z+31.5,Math.PI/2,0);cineCars.v=v;alarmAt(new THREE.Vector3(B.x,3,B.z+16),7);
   const p=cineCar(0,'sedan',true);setCar(p,B.x-60,B.z+28.5,Math.PI/2,0);cineCars.p=p;},
  cam(t,u){const B=BANKC();cineGroup.forEach((c,k)=>{const tt=Math.max(0,t-k*.22),z=B.z+17+Math.min(13,tt*5.1),x=B.x-3+k*3+Math.min(1,tt/2.3)*(6-(-3+k*3))*.6;c.g.position.set(x,groundY(x,z),z);c.g.rotation.y=Math.atan2(B.x+6-x,B.z+31.5-z);if(tt<2.7)animWalk(c,tt*9,.9);else animIdle(c);c.armR.rotation.x=-.5;c.armL.rotation.x=.15;});
   const v=cineCars.v,p=cineCars.p;if(t>3.25)setCar(v,B.x+6+(t-3.25)*(t-3.25)*8,B.z+31.5,Math.PI/2,(t-3.25)*16);if(t>2.0)setCar(p,B.x-60+(t-2)*24,B.z+28.5,Math.PI/2,24);
   if(t<1.6)cineCam(B.x-28,8,B.z+52,B.x,2.5,B.z+18,54);else if(t<4.1)cineCam(B.x-10+u*8,2.1,B.z+40,B.x+2,3.2,B.z+18,64);else cineCam(B.x+17,3.3,B.z+38,B.x+6,1.6,B.z+30,70);
   polRed.emissiveIntensity=(time*8|0)%2?7:0;polBlue.emissiveIntensity=(time*8|0)%2?0:7;}},
 // 6 — interaktiver Bankkampf in echter First Person
 {d:13.8,txt:'DIE WACHEN BLOCKIEREN DEN AUSGANG. JETZT BIST DU DRAN.',
  start(){clearCineGroup();polRed.emissiveIntensity=polBlue.emissiveIntensity=0;removeCine(cineCars.v,cineCars.p);beginCineCombat();const X=BANK.cx,z0=BANK.z1+12;cineHide=c=>c.mode==='ai'&&Math.abs(c.pos.x-X)<36&&Math.abs(c.pos.z-z0)<105;alarmAt(new THREE.Vector3(X,3,z0+18),9);
   const c=cineCar(0x8b1e1e,'suv');setCar(c,X-5,z0+4,.1,0);cineCars.b=c;},
  cam(t,u){const X=BANK.cx,z0=BANK.z1+12,c=cineCars.b;
   if(t<1.35){cineCam(X-4+t*1.3,2.25+t*.08,z0-11+t*2.6,X+1,1.55,z0+18,59);}
   else if(cineCombat&&cineCombat.ready)cineCombatCamera();
   else cineCam(X-3,1.7,z0-5,X,1.55,z0+15,64);
   if(t>3.1&&c&&c.mode==='cine'&&!cineCombat.carExploded){cineCombat.carExploded=true;c.mode='parked';damageCar(c,99999,'cine');shake=Math.max(shake,.5);}
  }},
 // 7 — Flucht aus dem Bankviertel
 {d:5.8,txt:'DER FLUCHTWAGEN DURCHBRICHT DIE SPERRE.',engine:1,siren:1,
  start(){clearCineCombat();clearCineGroup();if(cineCars.b)removeCine(cineCars.b);$('cineCross').classList.remove('active');$('cineCombatControls').classList.remove('active');$('cineCockpit').classList.remove('active');const B=BANKC();cineHide=c=>c.mode==='ai'&&Math.abs(c.pos.x-B.x)<32&&Math.abs(c.pos.z-B.z)<90;
   const v=cineCar(0x252b32,'van');setCar(v,B.x+2,B.z+34,Math.PI/2,28);cineCars.escape=v;const p1=cineCar(0,true,'sedan');setCar(p1,B.x-22,B.z+47,Math.PI/2,26);cineCars.escapeCop=p1;},
  cam(t,u){const B=BANKC(),v=cineCars.escape,p=cineCars.escapeCop,x=B.x+2+Math.max(0,t-.5)*31,z=B.z+34+Math.sin(t*1.4)*2;setCar(v,x,z,Math.PI/2,32+Math.min(12,t*2));if(p)setCar(p,B.x-22+Math.max(0,t-1)*34,B.z+47,Math.PI/2,31);
   if(t<1.9)cineCam(x-16,5,z+18,x+10,1.2,z,58);else if(t<4.2)cineCam(x-7,2.2,z+10,x+18,1.1,z,70);else cineCam(x+12,3.8,z-14,x+24,1.1,z+8,68);
   if(Math.random()<cineDt*3)smoke(new THREE.Vector3(v.pos.x-.2,.45,v.pos.z+2.4),.8,.5,.75);}},
 // 8 — die Nordautobahn und der weite Horizont
 {d:6.2,txt:'HINTER DER STADT WARTEN HÜGEL UND BERGE …',
  start(){removeCine(cineCars.escape,cineCars.escapeCop);cineHide=null;},
  cam(t,u){const r=RD('Nordautobahn'),q=roadPoint(r,120+u*1380),q2=roadPoint(r,180+u*1380+60),e=cineEase(u),cx=q.x+38-22*e,cz=q.z+55-15*e;cineCam(cx,Math.max(q.y+42-10*e,terrainH(cx,cz)+15),cz,q2.x,q2.y+7,q2.z-145,56);}},
 // 9 — Flug über die Calvera-Wüste
 {d:6.6,txt:'… UND DIE ENDLOSE CALVERA-WÜSTE.',engine:3,
  start(){const pl=makePlane(0xe8d9b0,false);scene.add(pl.g);cinePlane=pl;if(pl.propDM){pl.propDM.opacity=.7;pl.propBM.opacity=.2;}},
  cam(t,u){const D=SITES.dust,cx=(D.x0+D.x1)/2,cz=(D.z0+D.z1)/2,gy=terrainH(cx,cz),px=cx-270+t*48,pz=cz+36+Math.sin(t*.7)*11,py=gy+40+Math.sin(t*.9)*3;cinePlane.g.position.set(px,py,pz);cinePlane.g.rotation.set(0,Math.PI/2,Math.sin(t*.9)*.13);if(cinePlane.prop)cinePlane.prop.rotation.z+=.95;
   if(t<2.6)cineCam(px-70,py+22,pz+60,px+30,py-10,pz-45,55);else cineCam(px-28,py+8,pz+28,px+55,py-12,pz-52,65);}},
 // 10 — Militärkontrolle
 {d:5.2,txt:'WO DAS MILITÄR DIE REGELN MACHT.',
  start(){if(cinePlane){scene.remove(cinePlane.g);cinePlane=null;}},
  cam(t,u){const T=MIL.tanks[0],gy=groundY(T.x,T.z);if(t<2.3)cineCam(T.x+34-t*4,gy+8,T.z+30,T.x-12,gy+2.5,T.z-8,56);else cineCam(T.x+18-u*12,gy+4.5,T.z+19-u*6,T.x-14,gy+2.2,T.z-10,62);}},
 // 11 — Nachtleben / Neon
 {d:5,txt:'UND WENN ES NACHT WIRD, BEGINNT DIE PARTY.',tod:.93,
  start(){lastEnvTod=-1;},
  cam(t,u){const cx=-1040,cz=395,gy=groundY(cx,cz),a=t*.28;cineCam(cx+24*Math.cos(a)-u*7,gy+5+Math.sin(t*1.7)*.35,cz+34*Math.sin(a)+24,cx-4,gy+5.2,cz+10,63);}},
 // 12 — Titel-Enthüllung
 {d:8.3,txt:'',
  start(){cineHide=null;lastEnvTod=-1;polRed.emissiveIntensity=0;polBlue.emissiveIntensity=0;$('ctitle').style.opacity=1;},
  cam(t,u){$('cpre').style.opacity=t>.5&&t<3.8?1:0;$('ch1').style.opacity=t>3.5?1:0;$('cby').style.opacity=t>4.6?1:0;const e=cineEase(u);cineCam(PIERX+65-46*e,12+4*Math.sin(t*.45),WATER_Z+75-22*e,PIERX-130,34+9*e,-60,55);}},
 // 13 — Rückkehr über das Wasser, Boot kommt auf den Hafen zu
 {d:5.2,txt:'EIN BOOT NÄHERT SICH DEM WESTHAFEN …',engine:2,
  start(){$('ctitle').style.opacity=0;for(const id of ['cpre','ch1','cby'])$(id).style.opacity=0;boardIntroBoat();},
  cam(t,u){placeIntroBoat(t);const b=introBoat.pos,e=cineEase(u);cineCam(b.x-54+e*18,11-e*3,b.z-22,b.x,1.5,b.z-5,61);}},
 // 14 — Perspektive knapp über dem Wasser
 {d:4.8,txt:'DIE LICHTER DES HAFENS KOMMEN NÄHER.',engine:2,
  cam(t,u){placeIntroBoat(5+t);const b=introBoat.pos;cineCam(b.x-7,2.2,b.z+13-u*3,b.x,1.8,b.z-8,69);}},
 // 15 — Ankunft und Übergang ins freie Spiel
 {d:4.6,txt:'WILLKOMMEN IN PORT SOLARA.',engine:2,
  cam(t,u){placeIntroBoat(9.5+t*.9);const b=introBoat.pos;cineCam(JX-15,5.5,WATER_Z+15,b.x,1.5,b.z,62);}}
];
const CINE_TOTAL=SHOTS.reduce((a,s)=>a+s.d,0);

// ================= AUFTRAGGEBER & MISSIONS-ZWISCHENSEQUENZEN =================
const CONTACT_SKIN={
 mila:{statur:0,haut:1,frisur:5,haarfarbe:4,oberteil:0,oberteilfarbe:6,hose:0,hosenfarbe:0,schuhe:1,extra:0},
 jax:{statur:1,haut:3,frisur:3,haarfarbe:0,oberteil:2,oberteilfarbe:1,hose:1,hosenfarbe:1,schuhe:2,extra:1},
 rocco:{statur:2,haut:0,frisur:6,haarfarbe:0,oberteil:3,oberteilfarbe:10,hose:0,hosenfarbe:1,schuhe:5,extra:5},
 prof:{statur:1,haut:2,frisur:1,haarfarbe:5,oberteil:3,oberteilfarbe:3,hose:0,hosenfarbe:3,schuhe:1,extra:2},
 dusty:{statur:4,koerper:0,haut:1,frisur:0,haarfarbe:5,oberteil:2,oberteilfarbe:10,hose:0,hosenfarbe:2,schuhe:5,extra:6},
 nova:{statur:0,koerper:1,haut:3,frisur:8,haarfarbe:7,oberteil:1,oberteilfarbe:9,hose:1,hosenfarbe:1,schuhe:0,extra:4}};
const contactNpc={};
let mc=null;
$('skip').onclick=()=>{if(mode==='cine')endCine();else if(mode==='mcine')endMissionCine();};

// ================= HAUPTSCHLEIFE =================
let last=performance.now(),shownMoney=0,lastArea='',areaT=0,areaCheckT=0;
let unlockT=0;
const errSeen=new Set();
addEventListener('pointerdown',()=>{try{if(AC&&AC.state==='suspended')AC.resume();}catch(e){}});
const fmtT=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
let perfWindowStart=performance.now(),perfWindowFrames=0,perfBadWindows=0,perfGoodWindows=0,perfLastDrop=0,lastMeasuredFps=60;
const SIM_RATE={tps:60,lastChange:0};let simAccumulator=0;
renderBaseMap();addExtraPlaces();initPlaces();spawnCityCars();initPackages();initMeteors();initClubs();initStaff();initPedPool();initIpop();initMarina();initZones();initContacts();applyQuality();setWeather('klar',true);
updateSky(0);
loop();
window.__openCreator=()=>{ensureAudio();openCreator();};
window.__continue=continueGame;
window.__playing=()=>mode==='play'||mode==='menu';
__status('Spielwelt bereit.');
window.__booted=true;window.__booting=false;
if(startMode==='continue')window.__continue();else window.__openCreator();
