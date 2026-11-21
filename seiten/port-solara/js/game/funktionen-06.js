'use strict';
function tankLinks(K,xc){// Kettenglieder gleichmäßig entlang der Kettenbahn verteilen
 const r1=.395,r2=.4;
 const pts=[];const L=(a,b,step)=>{const d=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(d/step));for(let i=0;i<n;i++){const t=i/n;pts.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}};
 const A=(cz,cy,r,a0,a1,step)=>{const n=Math.max(2,Math.ceil(Math.abs(a1-a0)*r/step));for(let i=0;i<n;i++){const a=a0+(a1-a0)*i/n;pts.push([cz+Math.cos(a)*r,cy+Math.sin(a)*r]);}};
 const fa=-0.9,ra=Math.PI+.95,st=.04;
 L([-2.62,.035],[2.62,.035],st);L([2.62,.035],[3.05+Math.cos(fa)*r1,.64+Math.sin(fa)*r1],st);A(3.05,.64,r1,fa,Math.PI/2,st);L([3.05,.64+r1],[-3.05,.62+r2],st);A(-3.05,.62,r2,Math.PI/2,ra,st);L([-3.05+Math.cos(ra)*r2,.62+Math.sin(ra)*r2],[-2.62,.035],st);
 // Bogenlänge → Glieder alle .172 m
 const cum=[0];for(let i=1;i<=pts.length;i++){const a=pts[i-1],b=pts[i%pts.length];cum.push(cum[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1]));}const tot=cum[cum.length-1],n=Math.round(tot/.172),sp=tot/n;
 let k=0;for(let i=0;i<n;i++){const s=i*sp;while(k<pts.length-1&&cum[k+1]<s)k++;const a=pts[k],b=pts[(k+1)%pts.length],t=(s-cum[k])/Math.max(1e-6,cum[k+1]-cum[k]);
  const z=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,ang=Math.atan2(b[1]-a[1],b[0]-a[0]);
  // Außen-Normale der Bahn: Kette läuft im Uhrzeigersinn (von außen gesehen) → Normale = (sin, -cos)
  const nz=Math.sin(ang),ny=-Math.cos(ang);
  K.B(.64,.055,.15,'track',xc,y,z,-ang);K.B(.64,.03,.045,'track',xc,y+ny*.035,z+nz*.035,-ang);K.B(.07,.07,.08,'track',xc,y-ny*.05,z-nz*.05,-ang);}}
function tankHullGeo(){const K=partKit();
 // Wanne (Seitenprofil extrudiert), Oberwanne über den Ketten, Kotflügel
 K.add(extrudeSide([[-3.3,.45],[-3.42,.95],[-3.34,1.55],[1.9,1.55],[3.36,1.12],[3.3,.64],[2.55,.36],[-2.85,.36]],2.24),'camo');
 K.B(3.66,.36,5.2,'camo',0,1.37,-.72);K.B(3.4,.04,5.0,'camoD',0,1.57,-.75);
 for(const s of [-1,1]){K.B(.74,.06,1.5,'camo',s*1.47,1.18,2.6);K.B(.74,.05,.5,'camo',s*1.47,1.07,3.46,.55);K.B(.74,.05,.36,'camo',s*1.47,1.12,-3.45,-.3);
  // Seitenschürzen (6 Segmente) mit Schrauben
  for(let i=0;i<6;i++){const zc=-2.45+i*.99;K.B(.05,.62,.97,'camo',s*1.87,.9,zc);for(const dz of [-.36,0,.36])K.Cx(.022,.022,.03,'tank',s*1.9,1.13,zc+dz,8);K.B(.052,.03,.97,'camoD',s*1.87,.6,zc);}
  K.B(.05,.5,.5,'camo',s*1.87,.95,3.18,0,0,0);
  // Laufrollen (Doppelrollen) mit Gummibandagen, Naben, Stützrollen, Turas & Leitrad
  for(let i=0;i<6;i++){const z=-2.42+i*.968;for(const dx of [-.16,.16]){const x=s*1.45+dx;K.Cx(.36,.36,.12,'rubber',x,.415,z,20);K.Cx(.3,.3,.13,'camoD',x,.415,z,18);}K.Cx(.11,.11,.46,'tank',s*1.45,.415,z,10);K.Cx(.13,.13,.06,'camo',s*1.68,.415,z,10);}
  for(const z of [-1.5,0,1.5])K.Cx(.1,.1,.5,'rubber',s*1.45,.9,z,10);
  K.Cx(.36,.36,.5,'tank',s*1.45,.62,-3.05,20);K.Cx(.2,.2,.56,'camoD',s*1.45,.62,-3.05,12);for(let t=0;t<12;t++){const a=t/12*Math.PI*2;K.B(.5,.09,.1,'tank',s*1.45,.62+Math.sin(a)*.37,-3.05+Math.cos(a)*.37,-a);}
  K.Cx(.36,.36,.5,'tank',s*1.45,.64,3.05,20);K.Cx(.15,.15,.56,'camoD',s*1.45,.64,3.05,12);
  tankLinks(K,s*1.45);
  // Staukästen, Schaufel, Abschleppseil, Lampen
  K.B(.55,.32,.9,'camo',s*1.5,1.75,-2.6);K.B(.57,.04,.92,'camoD',s*1.5,1.93,-2.6);K.B(.04,.06,.1,'tank',s*1.79,1.78,-2.6);
  K.B(.18,.15,.14,'black',s*1.5,1.36,3.22);K.Cz(.055,.055,.02,'lamp',s*1.5,1.36,3.3,14);K.B(.24,.02,.02,'tank',s*1.5,1.47,3.32);for(const d of [-1,1])K.B(.02,.13,.02,'tank',s*1.5+d*.11,1.41,3.32);
  K.B(.11,.08,.03,'tail',s*1.6,1.42,-3.335);K.B(.09,.18,.12,'tank',s*.75,.78,3.4);K.B(.09,.18,.12,'tank',s*.75,.82,-3.45);}
 K.T([[-1.1,1.6,1.6],[-1.2,1.58,0],[-1.3,1.6,-1.2],[-1.25,1.6,-2.2]],.03,'tank',30,6);
 K.B(.06,.05,1.0,'wood',1.25,1.6,.4);K.B(.2,.02,.26,'tank',1.25,1.6,1.0);
 // Fahrerluke + Winkelspiegel auf dem Glacis, Lüftergitter & Auspuff am Heck, Planenrolle, Kanister
 K.C(.32,.32,.05,'camoD',0,1.58,1.62,18);K.B(.08,.05,.3,'tank',.24,1.6,1.62);for(const x of [-.22,0,.22])K.B(.14,.07,.08,'glassD',x,1.585,1.86);
 for(let i=0;i<9;i++)K.B(1.7,.025,.07,'tank',0,1.6,-3.15+i*.17);K.B(1.8,.04,1.55,'black',0,1.582,-2.45);
 for(const s of [-1,1]){K.B(.62,.26,.06,'black',s*.8,1.18,-3.44);for(let i=0;i<4;i++)K.B(.6,.02,.03,'tank',s*.8,1.08+i*.065,-3.47);}
 K.Cx(.13,.13,1.5,'tarp',0,1.72,-3.08,12);for(const x of [-.5,.5])K.B(.04,.27,.04,'tank',x,1.72,-3.08);
 for(const x of [1.15,1.35])K.B(.17,.34,.25,'camoD',x,1.75,-2.0);
 return K.done(VPLANAR);}
function tankTurretGeo(){const K=partKit();
 K.add(new THREE.CylinderGeometry(1.18,1.18,.12,28),'tank',0,.03,0);
 K.add(prismLoft([[-1.3,-1.95],[1.3,-1.95],[1.52,-1.05],[1.52,.55],[1.06,1.62],[-1.06,1.62],[-1.52,.55],[-1.52,-1.05]],[[-1.1,-1.85],[1.1,-1.85],[1.31,-1.0],[1.31,.45],[.82,1.38],[-.82,1.38],[-1.31,.45],[-1.31,-1.0]],.07,.84),'camo');
 // Blende, Rohr mit Wärmeschutzhülle, Rauchabsauger, Mündung
 K.B(1.0,.58,.32,'camo',0,.48,1.56);K.B(.74,.46,.2,'tarp',0,.48,1.78);K.Cz(.18,.18,.5,'camoD',0,.5,1.98,16);
 K.Cz(.1,.118,3.95,'camo',0,.5,4.1,14);for(const z of [2.7,4.6,5.4])K.Cz(.124,.124,.05,'tank',0,.5,z,14);K.Cz(.158,.158,.62,'camoD',0,.5,3.6,16);
 K.Cz(.122,.122,.14,'tank',0,.5,6.08,14);K.B(.06,.06,.1,'tank',0,.63,5.98);
 // Kommandantenkuppel mit Winkelspiegeln & Waffenstation, Ladeschützenluke, Richtschützenvisier
 K.C(.4,.42,.24,'camo',.6,.95,-.55,18);K.C(.36,.36,.05,'camoD',.6,1.09,-.55,18);for(let i=0;i<6;i++){const a=i/6*Math.PI*2+.3;K.B(.12,.07,.06,'glassD',.6+Math.cos(a)*.4,1.0,-.55+Math.sin(a)*.4,0,-a+Math.PI/2);}
 K.B(.3,.22,.42,'camoD',.6,1.26,-.42);K.Cz(.026,.026,.75,'black',.6,1.29,.1,8);K.B(.16,.14,.24,'camo',.8,1.22,-.5);K.B(.1,.12,.08,'glassD',.6,1.27,-.19);
 K.C(.32,.32,.05,'camoD',-.55,.865,-.45,18);K.B(.07,.05,.3,'tank',-.32,.885,-.45);
 K.B(.44,.32,.44,'camo',-.55,.99,.62);K.B(.38,.2,.02,'glassD',-.55,1.02,.85);K.B(.46,.03,.46,'camoD',-.55,1.165,.62);
 K.S(.13,'camoD',0,.84,-1.25,1,.4,1,12,6);for(const [x,z] of [[-1.0,1.0],[1.0,1.0],[-1.0,-1.5],[1.0,-1.5]])K.add(new THREE.TorusGeometry(.05,.012,6,12),'tank',x,.88,z);
 // Nebelwerfer (2×4), Antennen, Seiten-Staukästen
 for(const s of [-1,1])for(let i=0;i<4;i++)K.C(.045,.045,.24,'black',s*(1.18+(i%2)*.1),.56+(i>>1)*.1,.98,8,.95,0,-s*.35);
 for(const s of [-1,1]){K.C(.05,.06,.09,'tank',s*.95,.88,-1.6,8);K.C(.013,.005,2.2,'black',s*.95,1.97,-1.6,5);
  K.B(.2,.34,1.05,'camo',s*1.56,.42,-.62);K.B(.21,.03,1.07,'camoD',s*1.56,.6,-.62);}
 // Heckkorb mit Ladung
 K.B(2.24,.03,.5,'tank',0,.18,-2.2);for(const x of [-1.1,-.37,.37,1.1])for(const z of [-1.97,-2.43])K.B(.03,.48,.03,'tank',x,.4,z);
 for(const z of [-1.97,-2.43])K.B(2.24,.03,.03,'tank',0,.63,z);for(const x of [-1.1,1.1])K.B(.03,.03,.5,'tank',x,.63,-2.2);for(const x of [-.75,0,.75])K.B(.02,.02,.48,'tank',x,.63,-2.2);
 K.Cx(.15,.15,.9,'tarp',-.45,.35,-2.2,12);K.B(.5,.32,.38,'camoD',.55,.36,-2.2);K.B(.2,.3,.16,'tarp',.95,.36,-2.15);
 return K.done(VPLANAR);}
function placePed(p,farFrom){
 let b;for(let t=0;t<30;t++){b=pick(blockInfo);if(!farFrom||Math.hypot((b.x0+b.x1)/2-farFrom.x,(b.z0+b.z1)/2-farFrom.z)>90)break;}
 p.b=b;p.L=(b.x1-b.x0)-3.2;p.s=Math.random()*p.L*4;p.dir=Math.random()<.5?1:-1;p.spd=R(1.1,1.7);p.state='walk';p.hp=100;p.stagger=0;p.dropped=false;p.c.g.rotation.order='XYZ';p.c.g.rotation.set(0,0,0);p.c.g.visible=true;
 p.role=null;p.umbOn=false;p.vig=null;if(p.props)propsOff(p);if(p.dog){p.dog.owner=null;p.dog=null;}}
function pedPos(p){const b=p.b,L=p.L,x0=b.x0+1.6,z0=b.z0+1.6,x1=b.x1-1.6,z1=b.z1-1.6;let s=((p.s%(4*L))+4*L)%(4*L);const seg=Math.floor(s/L),u=s-seg*L;
 if(seg===0)return [x0+u,z0,Math.atan2(p.dir,0)];if(seg===1)return [x1,z0+u,Math.atan2(0,p.dir)];if(seg===2)return [x1-u,z1,Math.atan2(-p.dir,0)];return [x0,z1-u,Math.atan2(0,-p.dir)];}
function makeCiv(aggro,armed){const sk=randomSkin();if(aggro){sk.topC=pick([0x8b1a1a,0x5b1010,0x5b2a86,0x3d1a5c,0x151515]);sk.extra=pick([0,3,1,3]);}const c=buildChar(sk);scene.add(c.g);
 const p={c,kind:'civ',hp:100,aggro,armed,vel:new THREE.Vector3(),timer:0,phase:Math.random()*6,atkT:0,stagger:0};if(armed){if(window.__combatReady)armNPC(p,'pistol');else p.wantGun=true;}return p;}
function armNPC(n,id){const gm=weaponModel(id);gm.rotation.x=Math.PI/2;n.c.handR.add(gm);n.armed=true;}
function rebuildPlayer(){if(P.char){scene.remove(P.char.g);P.char.dispose();}P.char=buildChar(skin);scene.add(P.char.g);P.char.g.position.copy(P.pos);P.char.g.rotation.y=P.face;if(window.__combatReady)attachWeapon();}
function devCookieEnabled(){try{const c=document.cookie.split(';').map(v=>v.trim());if(c.includes('PORT_SOLARA_DEV='+DEV_CAM.token))return true;}catch(e){}try{return localStorage.getItem('PORT_SOLARA_DEV')===DEV_CAM.token;}catch(e){return false;}}
function toggleDevFreecam(){
 if(!DEV_CAM.active){if(mode!=='play'||!devCookieEnabled())return;updateStaticLOD(true);clearKeys();DEV_CAM.keys.clear();fireHeld=false;aimHeld=false;DEV_CAM.anchor.copy(P.inCar&&P.inCar.pos?P.inCar.pos:P.pos);DEV_CAM.returnPos.copy(camera.position);DEV_CAM.returnQuat.copy(camera.quaternion);DEV_CAM.returnFov=camera.fov;DEV_CAM.pos.copy(camera.position);const d=camera.getWorldDirection(new THREE.Vector3());DEV_CAM.yaw=Math.atan2(d.x,d.z);DEV_CAM.pitch=Math.asin(clamp(d.y,-1,1));DEV_CAM.active=true;const b=$('devFreecamBadge');if(b)b.style.display='block';console.info('[PORT SOLARA] Dev-Freecam an. Streaming-/LOD-Anker eingefroren bei',DEV_CAM.anchor.toArray());}
 else{DEV_CAM.active=false;DEV_CAM.keys.clear();camera.position.copy(DEV_CAM.returnPos);camera.quaternion.copy(DEV_CAM.returnQuat);camera.fov=DEV_CAM.returnFov;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);clearKeys();const b=$('devFreecamBadge');if(b)b.style.display='none';console.info('[PORT SOLARA] Dev-Freecam aus. Zurück am Spielerstandort.');}
}
function updateDevFreecam(dt){const k=DEV_CAM.keys,fast=k.has('ShiftLeft')||k.has('ShiftRight'),slow=k.has('ControlLeft')||k.has('ControlRight'),speed=fast?DEV_CAM.speed*5:slow?DEV_CAM.speed*.25:DEV_CAM.speed;const cp=Math.cos(DEV_CAM.pitch),forward=new THREE.Vector3(Math.sin(DEV_CAM.yaw)*cp,Math.sin(DEV_CAM.pitch),Math.cos(DEV_CAM.yaw)*cp),right=new THREE.Vector3(Math.cos(DEV_CAM.yaw),0,-Math.sin(DEV_CAM.yaw)),move=new THREE.Vector3();if(k.has('KeyW')||k.has('ArrowUp'))move.add(forward);if(k.has('KeyS')||k.has('ArrowDown'))move.sub(forward);if(k.has('KeyD')||k.has('ArrowRight'))move.add(right);if(k.has('KeyA')||k.has('ArrowLeft'))move.sub(right);if(k.has('Space'))move.y+=1;if(k.has('KeyC'))move.y-=1;if(move.lengthSq()>0)camera.position.addScaledVector(move.normalize(),speed*dt);camera.lookAt(camera.position.clone().add(forward));camera.updateMatrixWorld(true);}
function cineRaceInput(code,down){
 if(mode!=='cine'||!cineRace||!cineRace.active||shotI!==2||!CINE_RACE_CODES.has(code))return false;
 if(down){
  if(!cineRace.manual){cineRace.manual=true;cineRace.effect=1.15;if(race1&&race1.body)race1.body.visible=false;$('cineCockpit').classList.remove('active');$('cineWarp').classList.add('takeover');$('cinePrompt').classList.remove('active');
   const hud=$('cineRaceHud');hud.classList.add('manual','takeover');setTimeout(()=>{hud.classList.remove('takeover');$('cineWarp').classList.remove('takeover');},720);
   shake=Math.max(shake,.75);if(AC){tone(440,.13,'sawtooth',.08);tone(660,.18,'triangle',.045);}}
  cineRace.keys.add(code);
 }else cineRace.keys.delete(code);
 return true;
}
function bindCineRaceButtons(){for(const b of document.querySelectorAll('#cineRaceHud [data-race-code]')){const code=b.dataset.raceCode;b.addEventListener('pointerdown',e=>{e.preventDefault();cineRaceInput(code,true);try{b.setPointerCapture(e.pointerId);}catch(_){} });const up=e=>{e.preventDefault();cineRaceInput(code,false);};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);}}
function cineCombatButtonDown(b,e){if(!cineCombat||!cineCombat.active||!cineCombat.ready)return;const code=b.dataset.cineCode,action=b.dataset.cineAction;if(code){K[code]=true;b.dataset.held='1';}else if(action==='fire'){fireHeld=true;tryFire();b.dataset.held='1';}else if(action==='reload'){startReload();}}
function cineCombatButtonUp(b){const code=b.dataset.cineCode;if(code)K[code]=false;if(b.dataset.cineAction==='fire')fireHeld=false;delete b.dataset.held;}
function clearKeys(){for(const k in K)K[k]=false;for(const k in HOLD)HOLD[k].clear();}
function lockMouse(){if(SET.input!=='kb'||plEl())return;const el=renderer.domElement,f=el.requestPointerLock||el.webkitRequestPointerLock||el.mozRequestPointerLock;
 if(!f){plFail(true);return;}PL.tryT=performance.now();try{const r=f.call(el);if(r&&r.catch)r.catch(()=>plFail());}catch(e){plFail();}}
function plFail(hard){PL.tryT=0;PL.fail++;if((hard||PL.fail>=2)&&!PL.off){PL.off=true;toast('🖱️ Dieser Browser lässt die Maus nicht einfangen – die Kamera dreht am Bildschirmrand automatisch weiter.');}}
function mouseTick(dt){// Zeigerstatus + Rückfall-Kamera; jedes Bild aufgerufen
 if(PL.tryT&&!plEl()&&performance.now()-PL.tryT>1600)plFail();
 const play=mode==='play'&&SET.input==='kb'&&!P.dead;
 const hide=mouseWanted()&&(plEl()||PL.off);document.body.classList.toggle('nocur',!!hide);
 const ov=document.getElementById('plock');if(ov){const show=play&&!plEl()&&!PL.off&&!wheelOpen;if(show!==(ov.style.display==='flex'))ov.style.display=show?'flex':'none';}
 if(play&&PL.off&&!plEl()&&PL.inWin&&PL.mx>=0&&!wheelOpen){const W=innerWidth,H=innerHeight,e=.045,sp=1.9*SET.sens*dt;
  if(PL.mx<W*e)camYaw+=sp*(1-PL.mx/(W*e)+.3);else if(PL.mx>W*(1-e))camYaw-=sp*((PL.mx-W*(1-e))/(W*e)+.3);
  if(PL.my<H*e)camPitch=clamp(camPitch-sp*.6,-.5,1.25);else if(PL.my>H*(1-e))camPitch=clamp(camPitch+sp*.6,-.5,1.25);}}
function initAudio(){if(AC)return;try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){AC=null;return;}
 const comp=AC.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=3;comp.connect(AC.destination);
 musicOut=AC.createGain();musicOut.gain.value=SET.music;musicOut.connect(comp);
 sfxOut=AC.createGain();sfxOut.gain.value=SET.sfx;sfxOut.connect(comp);
 ambOut=AC.createGain();ambOut.gain.value=SET.sfx;ambOut.connect(comp);
 noiseBuf=makeNoiseBuffer(2);
 radioStaticGain=loopNoise('bandpass',2350,.7,musicOut);radioStaticLowGain=loopNoise('lowpass',420,.3,musicOut);
 engOsc=AC.createOscillator();engOsc.type='sawtooth';engOsc2=AC.createOscillator();engOsc2.type='square';engFilt=AC.createBiquadFilter();engFilt.type='lowpass';engFilt.frequency.value=420;engGain=AC.createGain();engGain.gain.value=0;
 const e2=AC.createGain();e2.gain.value=.35;engOsc.connect(engFilt);engOsc2.connect(e2);e2.connect(engFilt);engFilt.connect(engGain);engGain.connect(sfxOut);engOsc.start();engOsc2.start();
 sirOsc=AC.createOscillator();sirOsc.type='triangle';sirGain=AC.createGain();sirGain.gain.value=0;sirOsc.connect(sirGain);sirGain.connect(sfxOut);sirOsc.start();
 screechGain=loopNoise('bandpass',2400,4,sfxOut);rainGain=makeRain();windGain=loopNoise('lowpass',500,.7,ambOut);cityGain=loopNoise('lowpass',240,.6,ambOut);waveGain=loopNoise('lowpass',650,.5,ambOut);
 // Rotor: Rauschen mit „Hacken“
 {const s=AC.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=320;const chop=AC.createGain();chop.gain.value=.5;const lfo=AC.createOscillator();lfo.type='square';lfo.frequency.value=11;const lg=AC.createGain();lg.gain.value=.5;lfo.connect(lg);lg.connect(chop.gain);rotorGain=AC.createGain();rotorGain.gain.value=0;s.connect(f);f.connect(chop);chop.connect(rotorGain);rotorGain.connect(sfxOut);s.start();lfo.start();rotorGain._lfo=lfo;}
 startMusicEngine();}
// Regen: rosa Rauschen (weich, nicht zischend) + tiefes Prasseln; dazu einzelne Tropfen in updateAmbience
function makeRain(){const n=Math.floor(AC.sampleRate*3),b=AC.createBuffer(2,n,AC.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,mx=0;
  for(let i=0;i<n;i++){const w=Math.random()*2-1;b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;b2=.969*b2+w*.153852;b3=.8665*b3+w*.3104856;b4=.55*b4+w*.5329522;b5=-.7616*b5-w*.016898;const v=b0+b1+b2+b3+b4+b5+b6+w*.5362;b6=w*.115926;d[i]=v;mx=Math.max(mx,Math.abs(v));}
  for(let i=0;i<n;i++)d[i]/=mx;}
 const out=AC.createGain();out.gain.value=0;out.connect(ambOut);
 const s=AC.createBufferSource();s.buffer=b;s.loop=true;
 const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=380;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=5200;const g1=AC.createGain();g1.gain.value=.8;s.connect(hp);hp.connect(lp);lp.connect(g1);g1.connect(out);
 const lo=AC.createBiquadFilter();lo.type='lowpass';lo.frequency.value=260;const g2=AC.createGain();g2.gain.value=.9;s.connect(lo);lo.connect(g2);g2.connect(out);s.start();return out;}
function rainDrop(car){if(!AC||!noiseBuf)return;const t=AC.currentTime,n=AC.createBufferSource();n.buffer=noiseBuf;n.playbackRate.value=.6+Math.random()*.8;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=car?900+Math.random()*1400:2200+Math.random()*4200;f.Q.value=car?3:1.6;const g=AC.createGain();const v=(car?.05:.025)*(.4+Math.random());
 g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.012+Math.random()*.02);const pn=AC.createStereoPanner?AC.createStereoPanner():null;n.connect(f);f.connect(g);if(pn){pn.pan.value=Math.random()*1.6-.8;g.connect(pn);pn.connect(ambOut);}else g.connect(ambOut);n.start(t,Math.random()*1.5);n.stop(t+.05);}
function makeNoiseBuffer(sec){const b=AC.createBuffer(1,Math.floor(AC.sampleRate*sec),AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b;}
function loopNoise(type,freq,q,out){const s=AC.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=AC.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;const g=AC.createGain();g.gain.value=0;s.connect(f);f.connect(g);g.connect(out);s.start();return g;}
function applyVolumes(){if(!AC)return;musicOut.gain.setTargetAtTime(SET.music*(mode==='menu'?.45:1),AC.currentTime,.1);sfxOut.gain.setTargetAtTime(SET.sfx,AC.currentTime,.1);ambOut.gain.setTargetAtTime(SET.sfx,AC.currentTime,.1);if(typeof radioIsAudible==='function'){const audible=radioIsAudible();setRadioWidgetVolume(audible?(radioVoiceBusy?SET.music*24:SET.music*100):0);if(radioVoiceAudio)radioVoiceAudio.volume=audible?clamp(SET.music*.85,0,1):0;if(!audible)setRadioStatic(false);}}
// räumlicher Ausgang (Lautstärke & Stereo je nach Position)
function outAt(pos,maxD=140){if(!AC)return null;let vol=1,pan=0;if(pos){const d=pos.distanceTo(camera.position);if(d>maxD)return null;vol=Math.pow(1-d/maxD,1.5);tmpA.copy(pos).sub(camera.position).normalize();tmpB.set(1,0,0).applyQuaternion(camera.quaternion);pan=clamp(tmpA.dot(tmpB),-1,1);}
 const g=AC.createGain();g.gain.value=vol;if(AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.value=pan;g.connect(p);p.connect(sfxOut);}else g.connect(sfxOut);return g;}
function tone(f,d,type='square',v=.08,pos){if(!AC)return;const out=outAt(pos);if(!out)return;const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;g.gain.value=v;g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.connect(g);g.connect(out);o.start();o.stop(AC.currentTime+d+.02);}
function noiseBurst(dur,vol,freq,q=1,pos,type='bandpass'){if(!AC)return;const out=outAt(pos);if(!out)return;const n=AC.createBufferSource();n.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;const g=AC.createGain();const t=AC.currentTime;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);n.connect(f);f.connect(g);g.connect(out);n.start(t,Math.random()*1.5);n.stop(t+dur+.02);}
function horn(){if(P.inCar){tone(330,.35,'square',.06);tone(415,.35,'square',.05);}}
function hornAt(pos){tone(300+Math.random()*80,.4,'square',.05,pos);}
function crashSound(v){noiseBurst(.35,Math.min(.6,v*.025),700,.6);noiseBurst(.25,Math.min(.4,v*.015),180,.5);}
function gunSound(v,id,pos){const big=id==='sniper'||id==='shotgun'||id==='rpg';noiseBurst(big?.4:.16,v*3,id==='smg'?1500:id==='sniper'?550:id==='mg'?1200:id==='rifle'?1000:850,.7,pos);noiseBurst(big?.25:.1,v*1.6,120,.5,pos);setTimeout(()=>noiseBurst(.25,v*.6,700,.4,pos),110);}
function boomSound(p,pos){noiseBurst(1.4,Math.min(1.5,1.2*p),110,.5,pos);noiseBurst(.45,.6*p,480,.5,pos);}
function punchSound(pos){noiseBurst(.08,.5,600,.8,pos);tone(140,.1,'sine',.12,pos);}
function footstep(run){const sand=P.pos.z>COAST||Math.hypot(P.pos.x-IX,P.pos.z-IZ)<IR;noiseBurst(run?.06:.05,run?.12:.08,sand?500:2200,1.2,null,sand?'lowpass':'bandpass');}
function doorSound(){tone(110,.12,'square',.05);noiseBurst(.08,.15,300,.7);}
function cashSound(){tone(1320,.08,'square',.05);setTimeout(()=>tone(1760,.25,'triangle',.06),70);}
function pickupSound(){[880,1100,1320].forEach((f,i)=>setTimeout(()=>tone(f,.12,'sine',.06),i*60));}
function glassSound(pos){noiseBurst(.5,.5,4200,1,pos);for(let k=0;k<5;k++)setTimeout(()=>tone(2500+Math.random()*2500,.15,'sine',.04,pos),k*40);}
function wantedSound(){tone(660,.18,'sawtooth',.05);setTimeout(()=>tone(880,.25,'sawtooth',.05),150);}
function uiClick(){tone(900,.04,'square',.03);}
function passedJingle(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>{tone(f,.35,'triangle',.07);tone(f/2,.35,'sine',.05);},i*120));}
function failJingle(){[392,330,262].forEach((f,i)=>setTimeout(()=>tone(f,.4,'sawtooth',.05),i*180));}
function alarmAt(pos,dur){let t=0;const iv=setInterval(()=>{t+=.25;tone(t%.5<.25?950:1250,.24,'square',.04,pos);if(t>=dur)clearInterval(iv);},250);}
function thunder(){if(!AC)return;setTimeout(()=>{noiseBurst(2.6,1.2,90,.4,null,'lowpass');noiseBurst(.6,.6,300,.5);},400+Math.random()*1600);}
function chirp(){if(!AC)return;const base=2400+Math.random()*1800;for(let k=0;k<3;k++)setTimeout(()=>{const o=AC.createOscillator(),g=AC.createGain();o.type='sine';const t=AC.currentTime;o.frequency.setValueAtTime(base,t);o.frequency.exponentialRampToValueAtTime(base*1.4,t+.08);g.gain.setValueAtTime(.015,t);g.gain.exponentialRampToValueAtTime(.0001,t+.1);o.connect(g);g.connect(ambOut);o.start(t);o.stop(t+.12);},k*110);}
function cricket(){if(!AC)return;for(let k=0;k<4;k++)setTimeout(()=>tone(5200,.03,'sine',.012),k*45);}
function loadVoices(){try{const all=speechSynthesis.getVoices()||[];const de=all.filter(v=>/^de/i.test(v.lang));VOICE.voices=de.length?de:all;}catch(e){}}
function speak(text,o={}){if(!VOICE.ok||!SET.voice||mode==='menu')return;const now=performance.now();const prio=o.prio||0;
 try{if(prio<2&&(speechSynthesis.speaking||now<VOICE.last+700))return;let vol=o.vol??1;if(o.pos){const d=o.pos.distanceTo(camera.position);if(d>45)return;vol*=clamp(1-d/45,.2,1);}
  if(prio>=2)speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='de-DE';const vs=VOICE.voices;if(vs.length)u.voice=vs[(o.who||0)%vs.length];u.pitch=clamp(o.pitch??1,0,2);u.rate=clamp(o.rate??1.05,.5,2);u.volume=clamp(vol*SET.sfx,0,1);speechSynthesis.speak(u);VOICE.last=now;}catch(e){}}
function speakAs(who,text){const name=who.replace(/\s*\(.*\)/,'');const v=CHAR_VOICE[name]||{pitch:1,rate:1.05,who:0};speak(text,{...v,prio:2});}
function radioIsAudible(){return !!(P.inCar&&mode==='play');}
function setRadioWidgetVolume(value){if(!radioWidget)return;try{radioWidget.setVolume(clamp(value,0,100));}catch(e){}}
function restoreRadioWidgetVolume(){setRadioWidgetVolume(radioIsAudible()?(radioVoiceBusy?SET.music*24:SET.music*100):0);}
function stopRadioVoice(){if(radioVoiceAudio){try{radioVoiceAudio.pause();radioVoiceAudio.currentTime=0;}catch(e){}radioVoiceAudio=null;}radioVoiceDone=null;radioVoiceBusy=false;restoreRadioWidgetVolume();}
// Eine Ansage wird auch außerhalb des Autos zeitlich abgespielt, dort aber stumm. So bleibt die Song-Reihenfolge synchron.
function playRadioVoice(afterDone=null){const data=stationData(MUS.station);if(!data?.url||!PLAYLIST_STORE.consentSC||radioVoiceBusy||!RADIO_VOICE_CLIPS.length){if(afterDone)afterDone();return false;}
 let i=Math.floor(Math.random()*RADIO_VOICE_CLIPS.length);if(RADIO_VOICE_CLIPS.length>1&&i===radioVoiceLast)i=(i+1+Math.floor(Math.random()*(RADIO_VOICE_CLIPS.length-1)))%RADIO_VOICE_CLIPS.length;radioVoiceLast=i;
 try{if(radioVoiceAudio){try{radioVoiceAudio.pause();}catch(e){}}radioVoiceBusy=true;radioVoiceDone=afterDone;setRadioWidgetVolume(radioIsAudible()?SET.music*24:0);radioVoiceAudio=new Audio(RADIO_VOICE_CLIPS[i]);radioVoiceAudio.preload='auto';radioVoiceAudio.volume=radioIsAudible()?clamp(SET.music*.85,0,1):0;let completed=false;const done=()=>{if(completed)return;completed=true;radioVoiceBusy=false;radioVoiceAudio=null;const next=radioVoiceDone;radioVoiceDone=null;restoreRadioWidgetVolume();if(next)next();};radioVoiceAudio.onended=done;radioVoiceAudio.onerror=done;const promise=radioVoiceAudio.play();if(promise&&promise.catch)promise.catch(done);return true;
 }catch(e){radioVoiceBusy=false;radioVoiceAudio=null;radioVoiceDone=null;restoreRadioWidgetVolume();if(afterDone)afterDone();return false;}}
function radioVoiceTick(dt){const audible=radioIsAudible();if(radioVoiceAudio)radioVoiceAudio.volume=audible?clamp(SET.music*.85,0,1):0;if(!audible){setRadioWidgetVolume(0);setRadioStatic(false);}else if(radioWidgetStarted&&!radioVoiceBusy)setRadioWidgetVolume(SET.music*100);}
function startMusicEngine(){MUS.next=AC.currentTime+.1;const ws=AC.createWaveShaper();const cv=new Float32Array(256);for(let i=0;i<256;i++){const x=i/128-1;cv[i]=Math.tanh(x*5);}ws.curve=cv;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=2400;ws.connect(f);f.connect(musicOut);MUS.guitarBus=ws;setInterval(musicTick,30);}
function desiredStyle(){if(mode==='title'||mode==='creator')return 'menu';if(mode==='cine')return 'synth';
 if(P.inCar||P.inAir)return null;if(wanted>=2||time-lastCombatT<8)return 'chase';return SET.footMusic?'ambient':null;}
function newMotif(){const pos=[0,2,3,6,8,10,12,14],m=new Array(16).fill(null),len=new Array(16).fill(1);let d=Math.floor(Math.random()*5);for(const p of pos){if(Math.random()<.72){d=clamp(d+Math.floor(Math.random()*5)-2,0,7);m[p]=d;len[p]=1+Math.floor(Math.random()*2);}}return {m,len};}
function musicTick(){if(!AC||AC.state!=='running')return;const want=mode==='menu'?MUS.name:desiredStyle();
 if(want!==MUS.name){MUS.name=want;MUS.st=want?STY[want]:null;MUS.step=0;MUS.motif=newMotif();MUS.next=Math.max(MUS.next,AC.currentTime+.05);}
 const st=MUS.st;if(!st){MUS.next=AC.currentTime+.05;return;}
 const spb=60/st.bpm/4;
 while(MUS.next<AC.currentTime+.15){scheduleStep(MUS.step,MUS.next,spb);let adv=spb;if(st.swing)adv*=MUS.step%2===0?1+st.swing:1-st.swing;MUS.next+=adv;MUS.step++;if(MUS.step%256===0)MUS.motif=newMotif();}}
function mtof(m){return 440*Math.pow(2,(m-69)/12);}
function sNote(st,deg){const sc=SC[st.scale];const o=Math.floor(deg/7);return st.root+12*o+sc[((deg%7)+7)%7];}
function vEnv(g,t,a,peak,dur,r){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.setTargetAtTime(peak*.6,t+a,.08);g.gain.setTargetAtTime(0,t+dur,r);}
function voice(type,midi,t,dur,vol,filt,a=.005,r=.08,det=0,dest){const o=AC.createOscillator();o.type=type;o.frequency.value=mtof(midi);o.detune.value=det;const g=AC.createGain();let n=o;if(filt){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=filt;o.connect(f);n=f;}n.connect(g);g.connect(dest||musicOut);vEnv(g,t,a,vol,dur,r);o.start(t);o.stop(t+dur+r*6+.05);}
function drumNoise(t,dur,vol,type,freq){const n=AC.createBufferSource();n.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type=type;f.frequency.value=freq;const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);n.connect(f);f.connect(g);g.connect(musicOut);n.start(t,Math.random()*1.5);n.stop(t+dur+.02);}
function kick(t,v){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.32);o.connect(g);g.connect(musicOut);o.start(t);o.stop(t+.35);}
function scheduleStep(step,t,spb){const st=MUS.st,L=st.L,s=step%16,bar=Math.floor(step/16),D=DR[st.drum||'none']||{};
 const deg=st.prog[bar%st.prog.length];const ch=[0,2,4].map(k=>sNote(st,deg+k));
 if(L.kick&&D.kick&&D.kick[s])kick(t,L.kick);
 if(L.snare&&D.snare&&D.snare[s]){drumNoise(t,.18,L.snare*.6,'bandpass',1800);voice('triangle',55,t,.06,L.snare*.25,0,.001,.03);}
 if(L.hat&&D.hat&&D.hat[s])drumNoise(t,.04,L.hat*.35,'highpass',7000);
 if(L.shaker&&D.shaker&&D.shaker[s])drumNoise(t,.05,L.shaker*(s%2?.18:.3),'highpass',5000);
 if(L.clave&&D.clave&&D.clave[s])voice('sine',96,t,.03,L.clave*.3,0,.001,.02);
 if(L.vinyl&&Math.random()<.06)drumNoise(t,.01,.04,'highpass',3000);
 if(L.bass&&D.bass?D.bass[s]:(L.bass&&s%8===0)){const n=ch[0]-12+((D.bassOct&&D.bassOct[s])?12:0);voice('sawtooth',n,t,spb*1.6,L.bass*.22,520,.005,.05);voice('sine',n-12,t,spb*1.6,L.bass*.25,0,.005,.05);}
 if(L.pad&&s===0)for(const n of ch)for(const d of [-8,8])voice('sawtooth',n,t,spb*15,L.pad*.035,1100,.3,.5,d);
 if(L.arp)voice('square',ch[step%3]+12*(1+((step>>2)&1)),t,spb*.8,L.arp*.06,2200,.003,.05);
 if(L.keys&&(s===0||s===10))for(const n of ch){voice('sine',n,t,spb*5,L.keys*.09,0,.004,.25);voice('sine',n+12,t,spb*2,L.keys*.03,0,.004,.15);}
 if(L.pluck&&D.pluck&&D.pluck[s])voice('triangle',ch[D.pluck[s]-1]+12,t,spb*1.2,L.pluck*.14,0,.002,.06);
 if(L.guitar&&s%2===0){for(const n of [ch[0],ch[0]+7])voice('sawtooth',n-12,t,spb*1.6,L.guitar*(s%8===0?.16:.1),0,.003,.05,0,MUS.guitarBus);}
 if(L.piano&&s%4===0)voice('triangle',ch[(s/4)%3]+12,t,spb*6,L.piano*.12,0,.003,.4);
 if(L.lead&&(bar%4===1||bar%4===3)&&MUS.motif){const m=MUS.motif;if(m.m[s]!=null)voice('sawtooth',sNote(st,deg+m.m[s])+12,t,spb*m.len[s],L.lead*.07,1800,.02,.1);}
}
function playlistStatus(t){const e=$('plStatus');if(e)e.textContent=t;}
function normalizeSoundCloud(raw){let u;try{u=new URL(raw.trim());}catch(e){return null;}if(!/(^|\.)soundcloud\.com$/i.test(u.hostname)||u.hostname.toLowerCase()==='w.soundcloud.com')return null;if(u.pathname==='/'||u.pathname.length<2)return null;return u.origin+u.pathname;}
function loadSoundCloudApi(done){if(window.SC&&window.SC.Widget){done();return;}radioApiWaiters.push(done);if(radioApiLoading)return;radioApiLoading=true;const sc=document.createElement('script');sc.src='https://w.soundcloud.com/player/api.js';sc.async=true;sc.onload=()=>{radioApiLoading=false;const q=radioApiWaiters.splice(0);q.forEach(fn=>{try{fn();}catch(e){console.warn(e);}});};sc.onerror=()=>{radioApiLoading=false;radioApiWaiters=[];setRadioStatic(true);};document.head.appendChild(sc);}
function stationData(index){const st=STATIONS[index];if(!st||st.kind!=='soundcloud')return null;return PLAYLIST_STORE.stations[st.slot]||null;}
function soundCloudPlayerUrl(url){return 'https://w.soundcloud.com/player/?url='+encodeURIComponent(url)+'&color=%23ff9a3c&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_artwork=false&visual=false';}
function setRadioStatic(on){if(!AC||!radioStaticGain||!radioStaticLowGain)return;const t=AC.currentTime;radioStaticGain.gain.setTargetAtTime(on?SET.music*.075:0,t,.16);radioStaticLowGain.gain.setTargetAtTime(on?SET.music*.018:0,t,.2);}
function randomSoundCloudTrack(autoPlay=true){if(!radioWidget||radioRandomBusy)return;radioRandomBusy=true;const stationAtCall=MUS.station;try{radioWidget.getSounds(sounds=>{
  radioRandomBusy=false;if(MUS.station!==stationAtCall)return;
  if(!Array.isArray(sounds)||!sounds.length){radioWidgetStarted=false;radioWidgetError=true;setRadioStatic(radioIsAudible());return;}
  let pickIndex=Math.floor(Math.random()*sounds.length),lastIndex=radioLastTrackByStation[stationAtCall];
  if(sounds.length>1&&pickIndex===lastIndex)pickIndex=(pickIndex+1+Math.floor(Math.random()*(sounds.length-1)))%sounds.length;
  radioLastTrackByStation[stationAtCall]=pickIndex;
  try{setRadioWidgetVolume(radioIsAudible()?(radioVoiceBusy?SET.music*24:SET.music*100):0);radioWidget.skip(pickIndex);if(autoPlay)setTimeout(()=>{if(MUS.station===stationAtCall){try{radioWidget.play();radioWidgetStarted=true;radioWidgetError=false;setRadioWidgetVolume(radioIsAudible()?(radioVoiceBusy?SET.music*24:SET.music*100):0);}catch(e){radioWidgetError=true;setRadioStatic(radioIsAudible());}}},280);}catch(e){radioWidgetError=true;setRadioStatic(radioIsAudible());}
 });}catch(e){radioRandomBusy=false;radioWidgetError=true;setRadioStatic(radioIsAudible());console.warn('SoundCloud-Zufallstitel:',e);}}
// Außerhalb eines Fahrzeugs läuft der Stream weiter, wird aber vollständig stummgeschaltet.
function pauseSoundCloudRadio(){setRadioWidgetVolume(0);if(radioVoiceAudio)radioVoiceAudio.volume=0;setRadioStatic(false);}
function handleRadioTrackFinished(){if(radioTrackTransitionBusy||!radioWidget||!stationData(MUS.station)?.url||!PLAYLIST_STORE.consentSC)return;radioTrackTransitionBusy=true;const stationAtFinish=MUS.station;radioWidgetStarted=false;
 const playNext=()=>{if(MUS.station!==stationAtFinish){radioTrackTransitionBusy=false;return;}radioTrackTransitionBusy=false;randomSoundCloudTrack(true);};
 // Erst kommt eine zufällige Durchsage, danach startet der nächste zufällige Titel.
 playRadioVoice(playNext);
}
function bindSoundCloudWidget(){if(!radioWidget||radioWidget._portsolaraBound)return;radioWidget._portsolaraBound=true;const E=window.SC.Widget.Events;radioWidget.bind(E.PLAY,()=>{radioWidgetStarted=true;radioWidgetError=false;setRadioStatic(false);setRadioWidgetVolume(radioIsAudible()?(radioVoiceBusy?SET.music*24:SET.music*100):0);});radioWidget.bind(E.FINISH,handleRadioTrackFinished);radioWidget.bind(E.ERROR,()=>{radioWidgetError=true;radioWidgetStarted=false;setRadioStatic(radioIsAudible());});}
function activateSoundCloudRadio(index){const data=stationData(index),url=data&&normalizeSoundCloud(data.url||'');if(!url||!PLAYLIST_STORE.consentSC){if(radioWidget&&radioWidgetStation!==index){try{radioWidget.setVolume(0);radioWidget.pause();}catch(e){}radioWidgetStarted=false;radioWidgetStation=-1;}stopRadioVoice();setRadioStatic(radioIsAudible());return;}
 const host=$('radioPlayerHost');if(!host)return;setRadioStatic(false);
 loadSoundCloudApi(()=>{
  if(MUS.station!==index)return;
  if(!radioWidgetFrame){radioWidgetFrame=document.createElement('iframe');radioWidgetFrame.id='radioSCWidget';radioWidgetFrame.title='SoundCloud audio stream';radioWidgetFrame.allow='autoplay; encrypted-media';radioWidgetFrame.scrolling='no';radioWidgetFrame.src=soundCloudPlayerUrl(url);host.innerHTML='';host.appendChild(radioWidgetFrame);radioWidget=window.SC.Widget(radioWidgetFrame);bindSoundCloudWidget();radioWidget.bind(window.SC.Widget.Events.READY,()=>{if(MUS.station===index){radioWidgetStarted=false;randomSoundCloudTrack(true);}});radioWidgetStation=index;}
  else if(radioWidgetStation!==index){radioRandomBusy=false;radioTrackTransitionBusy=false;stopRadioVoice();radioWidget.setVolume(0);radioWidgetStation=index;radioWidgetStarted=false;radioWidgetError=false;try{radioWidget.load(url,{auto_play:true,visual:false,show_comments:false,show_user:false,show_reposts:false,show_artwork:false,callback:()=>{if(MUS.station===index)randomSoundCloudTrack(true);}});}catch(e){radioWidgetError=true;setRadioStatic(radioIsAudible());}}
  else{setRadioWidgetVolume(radioIsAudible()?(radioVoiceBusy?SET.music*24:SET.music*100):0);if(!radioWidgetStarted&&!radioWidgetError)randomSoundCloudTrack(true);else if(radioWidgetError)setRadioStatic(radioIsAudible());}
 });}
function syncCarRadio(){if(!P.inCar||mode!=='play'){pauseSoundCloudRadio();return;}activateSoundCloudRadio(MUS.station);}
function fillRadioSettings(){for(let i=0;i<5;i++){const d=PLAYLIST_STORE.stations[i]||{};const n=$('radioStationName'+i),u=$('radioStationUrl'+i),label=d.name||('SoundCloud '+(i+1));if(n)n.value=label;if(u)u.value=d.url||'';if(STATIONS[SC_STATION_BASE+i])STATIONS[SC_STATION_BASE+i].name=label;}const c=$('plConsentSC');if(c)c.checked=!!PLAYLIST_STORE.consentSC;}
function saveRadioSettings(){const stations=[];for(let i=0;i<5;i++){const name=($('radioStationName'+i).value||'').trim().slice(0,24)||('SoundCloud '+(i+1));const raw=($('radioStationUrl'+i).value||'').trim();const url=raw?normalizeSoundCloud(raw):'';if(raw&&!url){playlistStatus('Sender '+(i+1)+': Bitte einen gültigen SoundCloud-Track- oder Playlist-Link eingeben.');return;}stations.push({name,url});}
 const anySC=stations.some(x=>x.url);if(anySC&&!$('plConsentSC').checked){playlistStatus('Bitte bestätige den Hinweis zu Einbettungsrechten und erforderlichen Genehmigungen.');return;}
 PLAYLIST_STORE.stations=stations;PLAYLIST_STORE.consentSC=$('plConsentSC').checked;try{localStorage.setItem('portsolara_radio_v3',JSON.stringify(PLAYLIST_STORE));}catch(e){playlistStatus('Speichern im Browser nicht möglich.');return;}
 for(let i=0;i<5;i++)STATIONS[i].name=stations[i].name||('SoundCloud '+(i+1));radioWidgetStation=-1;playlistStatus('Die fünf SoundCloud-Sender wurden gespeichert. Im Auto mit Q wechseln.');if(P.inCar)syncCarRadio();}
function togglePlaylistDock(open=true){const d=$('playlistDock');if(!d)return;d.classList.toggle('open',!!open);if(open)fillRadioSettings();}
function radioNext(){if(!P.inCar)return;MUS.station=(MUS.station+1)%STATIONS.length;radioTrackTransitionBusy=false;stopRadioVoice();syncCarRadio();uiClick();}
function showRadio(){const e=$('radio');if(e)e.style.opacity=0;}
function onVehicleChange(){if(P.inCar){syncCarRadio();}else{pauseSoundCloudRadio();}} // Stream bleibt aktiv, nur die Lautstärke geht außerhalb des Autos auf 0.
function updateAmbience(dt){if(!AC)return;const t=AC.currentTime;
 const c=P.inCar,a=P.inAir;if(!c||c.boat||mode!=='play')screechLevel=0;const sp=c?Math.abs(c.speed):a?(a.type==='heli'?a.vel.length():a.speed):0;
 const eng=c?(c.bike?60+Math.abs(c.speed)*6:42+Math.abs(c.speed)*4.2):a?(a.type==='heli'?28+a.spool*20:60+a.speed*2.2):42;
 engOsc.frequency.setTargetAtTime(eng,t,.05);engOsc2.frequency.setTargetAtTime(eng*.5,t,.05);engFilt.frequency.setTargetAtTime(300+sp*25,t,.1);engGain.gain.setTargetAtTime(c||(a&&a.type==='plane')?.05:0,t,.1);
 rotorGain.gain.setTargetAtTime(a&&a.type==='heli'?.35*a.spool:0,t,.1);if(a&&a.type==='heli')rotorGain._lfo.frequency.setTargetAtTime(6+a.spool*8,t,.2);
 screechGain.gain.setTargetAtTime(screechLevel*.12,t,.05);
 const inside=!c&&!a&&interiorAt(P.pos.x,P.pos.z);rainGain.gain.setTargetAtTime(WX.rain>.08&&mode==='play'?WX.rain*.16*(c?.7:1)*(a?.4:1)*(inside?.3:1):0,t,.4);if(mode==='play'&&WX.rain>.15&&!a){const n=dt*WX.rain*(c?22:38);for(let k=0;k<3;k++)if(Math.random()<n/3)rainDrop(!!c);}
 windGain.gain.setTargetAtTime(mode==='play'&&(a||(c&&!c.boat&&sp>25))?Math.min(.06,(sp-(a?0:25))*.0012):0,t,.3);
 const dc=Math.hypot(P.pos.x,P.pos.z+30);cityGain.gain.setTargetAtTime(mode==='play'?.005*clamp(1-dc/500,0,1)*(1-night*.5):0,t,.5);
 const dw=Math.abs(P.pos.z-WATER_Z);waveGain.gain.setTargetAtTime(mode==='play'&&!c&&!a?.03*clamp(1-dw/60,0,1):0,t,.5);
 if(mode==='play'&&!c&&!a){if(night<.5&&Math.random()<dt*.25&&WX.rain<.2)chirp();if(night>.6&&Math.random()<dt*.6)cricket();}}
function big(t,sub='',color='#ffd84a'){const b=$('big');b.innerHTML=`<span style="color:${color}">${KT(t)}</span><small>${KT(sub)}</small>`;b.style.opacity=1;bigT=3.5;}
function say(who,txt){const t=KT(txt.replace(/\{n\}/g,esc(P.name)));$('dialog').innerHTML=`<b>${who}:</b> ${t}`;dialogT=Math.max(6,t.length*.075);speakAs(who,t);}
function gpsTrackerTick(dt){const c=P.inCar;if(!c||!c.stolen||!c.hasTracker)return;c.trackerT=(c.trackerT??20)-dt;if(c.trackerT<=0){c.trackerT=20;GPS_TRACK.last=c.pos.clone();GPS_TRACK.lastAt=time;setWanted(Math.max(wanted,1));toast('📡 GPS-Punkt an Polizei gesendet – letzter Standort markiert');if(AC)tone(880,.12,'sine',.035,c.pos);}}
function removeCar(c){scene.remove(c.g);const i=cars.indexOf(c);if(i>=0)cars.splice(i,1);}
function wantedCap(){try{return mission&&mission===missions[0]?1:5;}catch(e){return 5;}}
function setWanted(n){const old=wanted;wanted=clamp(n,0,wantedCap());evadeT=0;if(wanted>old&&mode==='play'){wantedSound();if(Math.random()<.7)speak(pick(LINES.radio),{pitch:.8,rate:1.15,prio:1});}if(wanted===0){for(const c of police)removeCar(c);police.length=0;removeCops();}}
function removeCops(){for(let i=peds.length-1;i>=0;i--){const n=peds[i];if(n.kind==='cop'){scene.remove(n.c.g);n.c.dispose();peds.splice(i,1);}}}
function spawnPolice(){
 const target=GPS_TRACK.last&&time-GPS_TRACK.lastAt<22?GPS_TRACK.last:P.pos;const tracked=target!==P.pos;
 const cand=[];for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){const p=nd(i,j),d=Math.hypot(p.x-target.x,p.z-target.z);if(d>(tracked?55:110)&&d<(tracked?145:200))cand.push(p);}
 if(!cand.length){for(let t=0;t<30&&cand.length<6;t++){const r=pick(ROADS);const q=roadPoint(r,Math.random()*r.len);const d=Math.hypot(q.x-target.x,q.z-target.z);if(d>(tracked?60:120)&&d<(tracked?180:280))cand.push({x:q.x,z:q.z});}}
 if(!cand.length)return;const p=pick(cand);const c=makeCar(0,true);c.mode='police';c.pos.set(p.x,0,p.z);c.g.position.copy(c.pos);c.g.position.y=groundY(p.x,p.z);c.h=Math.atan2(target.x-p.x,target.z-p.z);c.speed=10;cars.push(c);police.push(c);}
function busted(){
 const lost=Math.min(P.money,200+Math.floor(P.money*.1));P.money-=lost;
 big('VERHAFTET',`-$${lost}`,'#6fa8ff');
 if(P.inCar)exitCar(true);if(P.inAir)exitAir(true);
 setWanted(0);P.pos.set(POLICE_SPAWN.x,.3,POLICE_SPAWN.z);P.face=0;camYaw=0;
 if(mission)failMission('Du wurdest verhaftet.');
 if(activity)endActivity(false,'Du wurdest verhaftet.');if(race)endRace(false,true);
}

// ================= EIN-/AUSSTEIGEN =================
function nearestCar(r){let best=null,bd=1e9;for(const c of cars){if(c.mode==='wreck'||c.mode==='cine'||c.mode==='tumble')continue;const d=Math.hypot(c.pos.x-P.pos.x,c.pos.z-P.pos.z)-(c.boat?(onIsland(P.pos)?26:2.2):c.vt==='tank'?1.6:0);if(d<r&&d<bd){bd=d;best=c;}}return best;}
function exitCar(force){const c=P.inCar;if(!c)return;if(!force&&Math.abs(c.speed)>8)return;
 let lp=null;if(c.boat){lp=boatExitPoint(c);if(!lp&&!force){toast('Fahr ans Ufer oder an einen Steg, um auszusteigen');return;}if(!lp)lp=nearestShore(c.pos.x,c.pos.z);}
 c.mode='parked';c.dropped=true;c.speed=0;c.air=false;c.y=null;c.onRamp=null;if(c._driverViewHidden&&c.body){c.body.visible=true;c._driverViewHidden=false;}c.g.visible=true;
 if(c.bike||c.boat){scene.add(P.char.g);P.char.g.rotation.set(0,0,0);P.char.armL.rotation.z=-.06;P.char.armR.rotation.z=.06;}
 if(lp){P.pos.set(lp.x,groundY(lp.x,lp.z),lp.z);}else{const off=c.bike?1.2:c.vt==='tank'?3.6:2.4;P.pos.set(c.pos.x+Math.cos(c.h)*off,groundY(c.pos.x,c.pos.z),c.pos.z-Math.sin(c.h)*off);collideCircle(P.pos,.5);}
 P.inCar=null;if(c._driverViewHidden&&c.body){c.body.visible=true;c._driverViewHidden=false;}c.g.visible=true;P.char.g.visible=true;P.char.g.position.copy(P.pos);scene.add(headSpot);scene.add(headTgt);headSpot.intensity=0;P.face=c.h;camYaw=c.h;camPitch=.12;doorSound();onVehicleChange();}
function ejectDriver(c){let p=null,best=-1;for(const n of peds){if(n.kind!=='civ'||n.state!=='walk'||n.mission)continue;const d=n.c.g.position.distanceTo(camera.position);if(d>best){best=d;p=n;}}
 if(c.rider){c.body.remove(c.rider.g);c.rider.dispose();c.rider=null;}
 if(!p)return;const side=c.bike?1.3:2.6;p.c.g.position.set(c.pos.x-Math.cos(c.h)*side,groundY(c.pos.x,c.pos.z),c.pos.z+Math.sin(c.h)*side);p.c.g.visible=true;
 if(p.aggro||Math.random()<.2){p.state='fight';npcSay(p,'thug',1);}else{p.state='flee';p.fleeT=8;p.threat=P.pos.clone();npcSay(p,'jacked',1);}}
function enterCar(c){
 if(c.locked){toast(c.lockMsg||'Abgeschlossen');return;}
 const sourceMode=c.mode;
 const stolenNow=!c.owned&&!c.police&&!c.heavy&&['ai','ring','land','flee','parked'].includes(sourceMode);
 if(c.mode==='police'){const pi=police.indexOf(c);if(pi>=0)police.splice(pi,1);setWanted(Math.max(wanted,2));}
 if(c.mode==='ai'||c.mode==='ring'||c.mode==='land'||c.mode==='flee'){ejectDriver(c);}
 if(c.alarm){c.alarm=false;carAlarm(c);}
 c.mode='player';P.inCar=c;c.y=c.g.position.y;c.dropped=false;
 if(stolenNow){c.stolen=true;c.trackerT=20;setWanted(Math.max(wanted,1));if(c.hasTracker)toast('FAHRZEUG GESTOHLEN · GPS-Tracker erkannt – Standort alle 20 Sekunden an die Polizei');else toast('FAHRZEUG GESTOHLEN · 1 Fahndungsstern');}
 if(c.bike||c.boat){if(c._driverViewHidden&&c.body){c.body.visible=true;c._driverViewHidden=false;}P.char.g.visible=true;c.body.add(P.char.g);if(c.boat)P.char.g.position.set(BOAT_SEAT.x,BOAT_SEAT.y,BOAT_SEAT.z);else P.char.g.position.set(0,c.wr-.28,-.3);P.char.g.rotation.set(0,0,0);}
 else{P.char.g.visible=false;c._driverViewHidden=false;if(c.body)c.body.visible=true;c.g.visible=true;camYaw=c.h;camPitch=.12;mouseIdle=9;c.g.add(headSpot);c.g.add(headTgt);}
 doorSound();onVehicleChange();showVehicleName((VST[c.vt]||VST.sedan).name);}
function toggleCar(){
 if(P.dead)return;if(P.inAir){exitAir(false);return;}
 if(P.inCar){exitCar(false);return;}
 const a=nearestAir(7.5);if(a){enterAir(a);return;}
 const c=nearestCar(4.3);if(c)enterCar(c);
}

// ================= KOLLISION =================
function onIsland(p){return Math.hypot(p.x-IX,p.z-IZ)<IR+30;}
function collideCircle(p,r){let hit=false;const isl=onIsland(p);hitSolids.length=0;
 for(const b of solidsNear(p.x,p.z,r+1)){if(b.water&&isl)continue;if(b.open||b.camOnly)continue;if(p.x+r<b.x0||p.x-r>b.x1||p.z+r<b.z0||p.z-r>b.z1)continue;
  const cx=clamp(p.x,b.x0,b.x1),cz=clamp(p.z,b.z0,b.z1),dx=p.x-cx,dz=p.z-cz,d=Math.hypot(dx,dz);
  if(d<r){hit=true;hitSolids.push(b);if(d<1e-4){const l=p.x-b.x0,rr=b.x1-p.x,t=p.z-b.z0,bt=b.z1-p.z,m=Math.min(l,rr,t,bt);
    if(m===l)p.x=b.x0-r;else if(m===rr)p.x=b.x1+r;else if(m===t)p.z=b.z0-r;else p.z=b.z1+r;}
   else{p.x=cx+dx/d*r;p.z=cz+dz/d*r;}}}
 if(!isl&&r>=.3&&seaPush(p))hit=true;
 if(isl){const dx=p.x-IX,dz=p.z-IZ,d=Math.hypot(dx,dz);if(d>IR-1){p.x=IX+dx/d*(IR-1);p.z=IZ+dz/d*(IR-1);hit=true;}}
 return hit;}
function separateCar(c){let hit=false;const A0=vehBox(c),ra=Math.hypot(A0.hx,A0.hz)+Math.abs(A0.oz);
 for(const o of cars){if(o===c||o.mode==='cine'||o.mode==='tumble')continue;const B0=vehBox(o),rb=Math.hypot(B0.hx,B0.hz)+Math.abs(B0.oz),dx=c.pos.x-o.pos.x,dz=c.pos.z-o.pos.z,d2=dx*dx+dz*dz;
  if(d2>(ra+rb)*(ra+rb))continue;const m=satRR(vehOBB(c),vehOBB(o));
  if(m){const push=m.o,nx=m.x/m.o,nz=m.z/m.o;hit=true;
   if(o.mode==='ai'||o.mode==='ring'||o.mode==='land'||o.heavy){c.pos.x+=nx*push;c.pos.z+=nz*push;if(o.mode==='ai'||o.mode==='ring'||o.mode==='land')o.bump=2.5;}
   else{c.pos.x+=nx*push/2;c.pos.z+=nz*push/2;o.pos.x-=nx*push/2;o.pos.z-=nz*push/2;}
   if(c===P.inCar){const imp=Math.abs(c.speed);if(o.bike&&!c.bike&&imp>5&&o.mode!=='player'&&o.mode!=='wreck'&&o.mode!=='tumble'){launchBike(o,c);continue;}
    if(imp>6&&!(c.crashCD>time)){c.crashCD=time+.6;damageCar(o,imp*7,'ram');damageCar(c,imp*(c.vt==='tank'?.2:2.0),'crash');shake=Math.max(shake,Math.min(.7,imp*.012));noiseBurst(.12,.18,520,.8,c.pos);}}}}
 return hit;}
function camBlocked(x,y,z){for(const b of solidsNear(x,z,.1)){if(b.open)continue;if(y<b.h&&x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1)return true;}return false;}
// ================= HITBOXEN: exakte Fahrzeug-Quader, Körper-Kapseln an den Knochen, Flugzeug-Teilquader =================
// ---------- Fahrzeuge: Grundriss als gedrehtes Rechteck (OBB), Maße 1:1 aus den Modellkonstanten ----------
function vehBox(c){if(c.box)return c.box;let b;
 if(c.boat)b={hx:1.25,hz:3.78,oz:.05};                                  // Rumpf ±1,20 + Scheuerleiste; Außenborder (−3,72) bis Bugbeschlag (+3,82)
 else if(c.vt==='tank')b={hx:1.92,hz:3.66,oz:.03};                      // Kettenschürzen ±1,895 + Schrauben; Heckblech −3,63 … Bugschürze +3,69
 else if(c.bike)b=c.vt==='scooter'?{hx:.42,hz:.96,oz:.01}:{hx:.44,hz:1.16,oz:.01}; // Reifen, Lenker und Fahrer mit kleiner Sicherheitsreserve
 else{const d=CARDEF[BODY[c.vt]||c.vt]||CARDEF.sedan;const padW=d.W>2.3?.16:.13,padL=d.L>9?.32:d.L>6?.24:.19;b={hx:d.W/2+padW,hz:d.L/2+padL,oz:0};}
 return c.box=b;}
function vehOBB(c){const b=vehBox(c),s=Math.sin(c.h),co=Math.cos(c.h);return {cx:c.pos.x+s*b.oz,cz:c.pos.z+co*b.oz,fx:s,fz:co,rx:co,rz:-s,hx:b.hx,hz:b.hz};}
// Trennende-Achsen-Test: gedrehtes Rechteck gegen achsparallelen Kasten → kleinster Verschiebevektor (oder null)
function satRA(R,b){let best=1e9,ax=0,az=0;const bx=(b.x0+b.x1)/2,bz=(b.z0+b.z1)/2,ex=(b.x1-b.x0)/2,ez=(b.z1-b.z0)/2;
 const T=(nx,nz)=>{const rc=R.cx*nx+R.cz*nz,rr=Math.abs(R.fx*nx+R.fz*nz)*R.hz+Math.abs(R.rx*nx+R.rz*nz)*R.hx,bc=bx*nx+bz*nz,br=Math.abs(nx)*ex+Math.abs(nz)*ez;
  const d=rc-bc,o=rr+br-Math.abs(d);if(o<=0)return false;if(o<best){best=o;const sg=d<0?-1:1;ax=nx*sg;az=nz*sg;}return true;};
 if(!T(1,0)||!T(0,1)||!T(R.fx,R.fz)||!T(R.rx,R.rz))return null;return {x:ax*best,z:az*best,o:best};}
function satRR(A,B){let best=1e9,ax=0,az=0;
 for(const [nx,nz] of [[A.fx,A.fz],[A.rx,A.rz],[B.fx,B.fz],[B.rx,B.rz]]){const pa=A.cx*nx+A.cz*nz,ra=Math.abs(A.fx*nx+A.fz*nz)*A.hz+Math.abs(A.rx*nx+A.rz*nz)*A.hx;
  const pb=B.cx*nx+B.cz*nz,rb=Math.abs(B.fx*nx+B.fz*nz)*B.hz+Math.abs(B.rx*nx+B.rz*nz)*B.hx;const d=pa-pb,o=ra+rb-Math.abs(d);if(o<=0)return null;if(o<best){best=o;const sg=d<0?-1:1;ax=nx*sg;az=nz*sg;}}
 return {x:ax*best,z:az*best,o:best};}
// Fahrzeug gegen Wände/Gebäude/Möbel (ersetzt den alten Kreis mit Radius c.rad)
function collideCar(c){const isl=onIsland(c.pos);hitSolids.length=0;let hit=false;const b0=vehBox(c),reach=Math.hypot(b0.hx,b0.hz)+Math.abs(b0.oz)+.3;
 for(let it=0;it<5;it++){const R=vehOBB(c);let any=false;
  for(const b of solidsNear(c.pos.x,c.pos.z,reach+1)){if(b.water&&isl)continue;if(b.open||b.camOnly)continue;
   if(c.pos.x+reach<b.x0||c.pos.x-reach>b.x1||c.pos.z+reach<b.z0||c.pos.z-reach>b.z1)continue;
   const m=satRA(R,b);if(m){c.pos.x+=m.x;c.pos.z+=m.z;R.cx+=m.x;R.cz+=m.z;hit=any=true;if(!hitSolids.includes(b))hitSolids.push(b);}}
  if(!any)break;}
 if(!isl&&seaPush(c.pos))hit=true;
 if(isl){const dx=c.pos.x-IX,dz=c.pos.z-IZ,d=Math.hypot(dx,dz),lim=IR-1-b0.hx;if(d>lim){c.pos.x=IX+dx/d*lim;c.pos.z=IZ+dz/d*lim;hit=true;}}
 return hit;}
// Kreis (Figur) gegen Fahrzeug-Rechteck: schiebt p hinaus, true bei Kontakt
function circleVsCar(p,r,c){const R=vehOBB(c),dx=p.x-R.cx,dz=p.z-R.cz,lx=dx*R.rx+dz*R.rz,lz=dx*R.fx+dz*R.fz;
 const qx=clamp(lx,-R.hx,R.hx),qz=clamp(lz,-R.hz,R.hz),ex=lx-qx,ez=lz-qz,d=Math.hypot(ex,ez);if(d>=r)return false;let nx,nz,push;
 if(d>1e-4){nx=ex/d;nz=ez/d;push=r-d;}else{const px=R.hx-Math.abs(lx),pz=R.hz-Math.abs(lz);if(px<pz){nx=Math.sign(lx)||1;nz=0;push=px+r;}else{nx=0;nz=Math.sign(lz)||1;push=pz+r;}}
 p.x+=(nx*R.rx+nz*R.fx)*push;p.z+=(nx*R.rz+nz*R.fz)*push;return true;}
function nearCar(x,z,c,m=0){const R=vehOBB(c),dx=x-R.cx,dz=z-R.cz;return Math.abs(dx*R.rx+dz*R.rz)<R.hx+m&&Math.abs(dx*R.fx+dz*R.fz)<R.hz+m;}
