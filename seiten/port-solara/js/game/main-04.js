'use strict';
addEventListener('keydown',e=>{const tg=e.target;if(tg&&(tg.tagName==='INPUT'||tg.tagName==='TEXTAREA')&&!KCAP)return;if(e.metaKey||e.key==='Meta'){clearKeys();return;}
 if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.code))e.preventDefault();
 if(kbCaptureKey(e))return;
 if(cineRaceInput(e.code,true)){e.preventDefault();return;}
 if(mode==='cine'&&cineCombat&&cineCombat.active&&cineCombat.ready&&e.code==='KeyR'){e.preventDefault();startReload();return;}
 if(isOpen('tedit')||isOpen('ctrl')){if(e.code==='Escape'&&!e.repeat){if(isOpen('tedit'))closeTEdit();else closeCtrl();}return;}
 if(SET.input!=='kb'&&!e.repeat&&mode==='play'&&!/^(Shift|Control|Alt|Meta|OS)/.test(e.code))setInput('kb',true);
 const a=kbAct(e.code);if(a){actDown(a,'kb:'+e.code,e.repeat);return;}
 if(GUARDED.has(e.code)&&mode!=='cine'&&mode!=='mcine')return;
 vPress(e.code,'kb:'+e.code,e.repeat);});
addEventListener('keyup',e=>{if(cineRaceInput(e.code,false))return;const a=kbAct(e.code);if(a)actUp(a,'kb:'+e.code);else vRelease(e.code,'kb:'+e.code);if(e.key==='Meta'||e.code==='MetaLeft'||e.code==='MetaRight'||e.code==='OSLeft'||e.code==='OSRight')clearKeys();});
addEventListener('blur',()=>{clearKeys();if(typeof DEV_CAM!=='undefined')DEV_CAM.keys.clear();if(cineRace)cineRace.keys.clear();if(cineCombat&&cineCombat.active){fireHeld=false;aimHeld=false;cineLookTouch=null;}fireHeld=false;aimHeld=false;if(wheelOpen)closeWheel(false);});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearKeys();if(cineRace)cineRace.keys.clear();if(cineCombat&&cineCombat.active){fireHeld=false;aimHeld=false;cineLookTouch=null;}fireHeld=false;aimHeld=false;}});
const key=(a,b)=>K[a]||K[b];
// ---------- Maus einfangen (Pointer Lock) – robust auch für Safari/macOS ----------
// Im Spiel ist der Mauszeiger unsichtbar und gefangen; nur in Menüs (Pause, Kleidung, Titel …) ist er sichtbar.
// Kann der Browser die Maus nicht fangen, dreht die Kamera am Bildschirmrand automatisch weiter (Rückfall).
const plEl=()=>document.pointerLockElement||document.webkitPointerLockElement||document.mozPointerLockElement||null;
const PL={fail:0,off:false,tryT:0,mx:-1,my:-1,inWin:true};
for(const ev of ['pointerlockerror','webkitpointerlockerror','mozpointerlockerror'])document.addEventListener(ev,()=>plFail());
for(const ev of ['pointerlockchange','webkitpointerlockchange','mozpointerlockchange'])document.addEventListener(ev,()=>{if(plEl()){PL.fail=0;PL.off=false;PL.tryT=0;}else{clearKeys();fireHeld=false;aimHeld=false;}});
// Maus soll im Spiel gefangen sein (Spielmodus + Zwischensequenzen); sonst sichtbar
const mouseWanted=()=>SET.input==='kb'&&(mode==='play'||mode==='cine'||mode==='mcine');
addEventListener('mousedown',e=>{if(e.target&&e.target.closest&&e.target.closest('#cineRaceHud'))return;if(mouseWanted()&&!plEl())lockMouse();});
addEventListener('mousemove',e=>{PL.mx=e.clientX;PL.my=e.clientY;PL.inWin=true;},{passive:true});
document.addEventListener('mouseleave',()=>{PL.inWin=false;});
let dragging=false;renderer.domElement.addEventListener('mousedown',()=>dragging=true);addEventListener('mouseup',()=>dragging=false);
addEventListener('mousemove',e=>{
 if(mode==='creator'&&dragging){creatorYaw-=e.movementX*.008;return;}
 const cineLook=mode==='cine'&&cineCombat&&cineCombat.active&&cineCombat.ready;
 if((mode!=='play'&&!cineLook)||SET.input==='touch')return;if(wheelOpen){wheelMouse(e.movementX||0,e.movementY||0);return;}if(SET.input==='kb'&&!plEl()&&!PL.off)return;{const sens=(scoped()?.22:aiming()?.6:1)*SET.sens;const mx=clamp(e.movementX||0,-150,150),my=clamp(e.movementY||0,-150,150);camYaw-=mx*.0026*sens;camPitch=clamp(camPitch+my*.0022*sens,-.5,1.1);mouseIdle=0;}});

// ================= AUDIO: Musik, Radio, Geräusche, Stimmen =================
let AC=null,musicOut=null,sfxOut=null,ambOut=null,engOsc,engOsc2,engGain,engFilt,sirOsc,sirGain,screechGain,rainGain,windGain,cityGain,waveGain,rotorGain,noiseBuf=null,radioStaticGain=null,radioStaticLowGain=null;
let screechLevel=0,lastCombatT=-99;
const tmpA=new THREE.Vector3(),tmpB=new THREE.Vector3();

// ---------- Stimmen (Sprachausgabe des Browsers) ----------
const VOICE={ok:typeof speechSynthesis!=='undefined'&&typeof SpeechSynthesisUtterance!=='undefined',voices:[],last:0};
if(VOICE.ok){loadVoices();try{speechSynthesis.onvoiceschanged=loadVoices;}catch(e){}}
const CHAR_VOICE={'Mila':{pitch:1.3,rate:1.08,who:1},'Jax':{pitch:.95,rate:1.12,who:0},'Rocco':{pitch:.7,rate:.95,who:2},'Der Professor':{pitch:.8,rate:.92,who:3},'Krake':{pitch:.5,rate:.9,who:0},'Kurier':{pitch:1.1,rate:1.15,who:2},'Verkäufer':{pitch:1.2,rate:1.2,who:1},'Wachmann':{pitch:.85,rate:1.2,who:2}};
const LINES={
 bump:['Hey, pass doch auf!','Was soll das?','Augen auf, Mann!','Na hör mal!','Rempel jemand anderen an!'],
 hurt:['Au!','Hilfe!','Lass mich in Ruhe!','Spinnst du?','Aua!'],
 flee:['Hilfe! Der hat eine Waffe!','Lauft!','Polizei! Hilfe!','Nicht schießen!','Weg hier!'],
 handsup:['Bitte nicht schießen!','Ich hab nichts getan!','Okay, okay, ganz ruhig!'],
 greet:['Guten Tag!','Willkommen!','Hallo, was darf es sein?','Schönen guten Tag!','Hereinspaziert!'],
 guard:['Sicherheitsdienst! Waffe runter!','Stehen bleiben!','Alarm! Keine Bewegung!','Wir haben einen Bewaffneten!'],
 cower:['Bitte tu mir nichts!','Ich hab Familie!','Nicht schießen, bitte!','Ich mach alles, was du willst!'],
 thug:['Was guckst du so?','Du bist hier falsch, Kumpel!','Jetzt gibt es Ärger!','Das ist unser Revier!','Dich mach ich fertig!'],
 cop:['Polizei! Stehen bleiben!','Waffe fallen lassen!','Keine Bewegung!','Wir haben ihn umstellt!','Feuer frei!'],
 copArrest:['Hände hoch!','Sie sind verhaftet!','Bleiben Sie stehen!'],
 radio:['Zentrale an alle Einheiten: Verdächtiger flüchtig.','Alle Einheiten, Schüsse gemeldet.','Verstärkung angefordert!','Achtung, Verdächtiger ist bewaffnet.'],
 jacked:['Hey! Mein Auto!','Das ist mein Wagen!','Polizei! Autodieb!'],
 clerk:['Bitte nicht schießen! Nimm das Geld!','Ganz ruhig, hier ist alles!','Nimm es, nimm alles!'],
 passengerIn:['Zum Hafen, bitte. Und schnell!','Bringen Sie mich hin, ich hab es eilig!','Fahren Sie, ich zahle gut!','Bitte schnell, ich bin spät dran!'],
 passengerOut:['Danke, stimmt so!','Super Fahrt!','Na endlich!'],
 patient:['Danke … Sie haben mich gerettet.','Endlich, das Krankenhaus …'],
 burn:['Es brennt! Weg hier!','Das Ding fliegt gleich in die Luft!','Feuer! Lauft!'],
};

// ---------- Musik: selbst erzeugte Songs & Radiosender ----------
const SC={minor:[0,2,3,5,7,8,10],major:[0,2,4,5,7,9,11],dorian:[0,2,3,5,7,9,10],phryg:[0,1,3,5,7,8,10]};
const STY={
 menu:{bpm:80,root:45,scale:'minor',prog:[0,5,3,6],L:{pad:.5,piano:.35,bass:.22}},
 ambient:{bpm:92,root:50,scale:'dorian',prog:[0,3,6,4],L:{pad:.32,pluck:.22,bass:.28,kick:.25,shaker:.12},drum:'soft'},
 synth:{bpm:106,root:52,scale:'minor',prog:[0,5,2,6],L:{pad:.3,arp:.22,bass:.42,lead:.17,kick:.55,snare:.45,hat:.22},drum:'d80'},
 hiphop:{bpm:88,root:48,scale:'minor',prog:[0,3,5,4],L:{keys:.32,bass:.5,kick:.75,snare:.55,hat:.28,lead:.12,vinyl:1},drum:'boombap',swing:.12},
 latin:{bpm:114,root:55,scale:'major',prog:[0,4,5,3],L:{pluck:.32,bass:.38,pad:.12,kick:.42,shaker:.22,clave:.22,lead:.17},drum:'latin'},
 rock:{bpm:132,root:40,scale:'minor',prog:[0,5,3,6],L:{guitar:.3,bass:.42,kick:.65,snare:.55,hat:.28,lead:.15},drum:'rock'},
 chase:{bpm:140,root:45,scale:'phryg',prog:[0,1,0,6],L:{bass:.5,kick:.65,snare:.45,hat:.3,pad:.18,arp:.22},drum:'chase'},
};
const DR={
 soft:{kick:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],shaker:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],bass:[1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0]},
 d80:{kick:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],hat:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],bass:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],bassOct:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]},
 boombap:{kick:[1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0],snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],hat:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1],bass:[1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0]},
 latin:{kick:[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],clave:[1,0,0,1,0,0,1,0,0,0,1,0,1,0,0,0],shaker:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],bass:[1,0,0,1,0,0,1,0,1,0,0,1,0,1,0,0],pluck:[1,0,2,0,3,0,2,0,1,0,2,0,3,0,2,1]},
 rock:{kick:[1,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0],snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],hat:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],bass:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
 chase:{kick:[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,1],hat:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],bass:[1,1,0,1,1,0,1,0,1,1,0,1,1,0,1,1]},
 none:{}
};
DR.soft.pluck=[1,0,0,2,0,0,3,0,0,2,0,0,1,0,3,0];
const RADIO_VOICE_CLIPS=Array.from({length:26},(_,i)=>'assets/audio/radio-voice-'+(i+1)+'.mp3');
let radioVoiceAudio=null,radioVoiceLast=-1,radioVoiceBusy=false,radioVoiceDone=null,radioTrackTransitionBusy=false;
const STATIONS=Array.from({length:5},(_,i)=>({name:'SoundCloud '+(i+1),style:null,kind:'soundcloud',slot:i}));
const SC_STATION_BASE=0;
const RADIO_OFF_INDEX=-1;
const MUS={name:null,st:null,next:0,step:0,motif:null,station:0,guitarBus:null};
// ---------- Ingame-Radio: fünf stille SoundCloud-Widgets, Zufallstitel und Funk-Sprüche ----------
const PLAYLIST_STORE=(()=>{
 const empty=()=>({stations:Array.from({length:5},(_,i)=>({name:'SoundCloud '+(i+1),url:''})),consentSC:false});
 try{
  const v3=JSON.parse(localStorage.getItem('portsolara_radio_v3')||'null');
  if(v3&&Array.isArray(v3.stations))return {stations:Array.from({length:5},(_,i)=>v3.stations[i]||{name:'SoundCloud '+(i+1),url:''}),consentSC:!!v3.consentSC};
  const old=JSON.parse(localStorage.getItem('portsolara_radio_v2')||'null');
  if(old&&Array.isArray(old.stations))return {stations:Array.from({length:5},(_,i)=>old.stations[i]||{name:'SoundCloud '+(i+1),url:''}),consentSC:false};
  const legacy=JSON.parse(localStorage.getItem('portsolara_playlist')||'{}')||{};
  const out=empty();if(legacy.source==='soundcloud'&&legacy.url)out.stations[0].url=legacy.url;return out;
 }catch(e){return empty();}
})();
let radioWidget=null,radioWidgetFrame=null,radioWidgetStation=-1,radioApiLoading=false,radioApiWaiters=[],radioRandomBusy=false,radioWidgetStarted=false,radioWidgetError=false;
const radioLastTrackByStation={};
window.__togglePlaylistDock=(open=true)=>togglePlaylistDock(open);
$('saveRadioStations').addEventListener('click',saveRadioSettings);$('plClose').addEventListener('click',()=>togglePlaylistDock(false));$('playlistDock').addEventListener('click',e=>{if(e.target===$('playlistDock'))togglePlaylistDock(false);});
fillRadioSettings();

// ================= HUD =================
let bigT=0,dialogT=0,shake=0;

// ================= FAHNDUNG =================
let wanted=0,evadeT=0,spawnT=0,bustT=0,heatT=0;
const police=[];
const GPS_TRACK={last:null,lastAt:-9999};
const hitSolids=[];
// Figuren-Kollisionsradius: Schulterbreite des Körpermodells (≈ ±0,25 m) + Armschwung
const PLAYER_R=.32,NPC_R=.32;

// ---------- Flugzeuge/Hubschrauber: Teilquader aus den echten Bauteilen (Rumpf, Flügel, Leitwerk, Rotor …) ----------
let _airIM=null,_airN=null,_airO=null,_airD=null;

// ---------- Figuren: Kapseln an den Knochen, Maße direkt aus den Vertices des Körpermodells ----------
// Kopf, Rumpf (zwei Kapseln = Stadion-Querschnitt), Ober-/Unterarme mit Hand, Ober-/Unterschenkel, Füße
const CHAR_CAPS=new Map();
const _cA=new THREE.Vector3(),_cB=new THREE.Vector3();

// ================= UPDATES =================
let stuntCam=0;
const SKID_N=600;const tmpObj=new THREE.Object3D();
const skidMesh=new THREE.InstancedMesh(new THREE.PlaneGeometry(.28,.9).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x111111,transparent:true,opacity:.55,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}),SKID_N);
skidMesh.frustumCulled=false;{tmpObj.position.set(0,-50,0);tmpObj.updateMatrix();for(let i=0;i<SKID_N;i++)skidMesh.setMatrixAt(i,tmpObj.matrix);}scene.add(skidMesh);let skidI=0,skidT=0;

// ---------- NPC-Verhalten (Passanten, Gangs, Polizei, Wachen, Übungsziele) ----------
const RR=(a,b)=>a+Math.random()*(b-a);
let tutBag=null,tutTargets=[],tutThugs=[],mGroup=[],mCars=[],mGuards=[];const HELIPOS={x:0,z:0};
const allDown=a=>a.length>0&&a.every(t=>t.downOnce);
const arrowGeo=new THREE.ConeGeometry(.2,.42,4).rotateX(Math.PI),arrowMat=new THREE.MeshBasicMaterial({color:new THREE.Color(2.4,.25,.2)});
// Wachen mit Sichtfeld (Schleich-Missionen)
const exclTex=canvasTex(64,64,(g,w,h)=>{g.fillStyle='#000';g.beginPath();g.arc(32,32,30,0,7);g.fill();g.fillStyle='#ffd23a';g.font='bold 52px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('!',32,35);});
const bagMesh=new THREE.Group();bagMesh.add(mesh(new THREE.BoxGeometry(.9,.45,.45),cm(0x1f5fbf,.7),0,.23,0),mesh(new THREE.BoxGeometry(.6,.08,.08),cm(0x111111,.6),0,.5,0));bagMesh.scale.setScalar(1.35);bagMesh.visible=false;scene.add(bagMesh);

// ================= VERKEHR AUF DEN LANDSTRASSEN (Autobahn, Küstenstraßen, Wüste) =================
// Verbindungen an den Straßenenden: wohin kann ein Auto weiterfahren?
for(const r of ROADS){r.links=[[],[]];for(const end of [0,1]){const p=end?r.pts[r.pts.length-1]:r.pts[0];
 for(const o of ROADS){if(o===r)continue;let best=-1,bd=1e9;for(let i=0;i<o.pts.length;i+=2){const d=Math.hypot(o.pts[i].x-p.x,o.pts[i].z-p.z);if(d<bd){bd=d;best=i;}}
  if(bd<24){const q=o.pts[best];if(best>4)r.links[end].push({r:o,s:q.s,dir:-1});if(best<o.pts.length-5)r.links[end].push({r:o,s:q.s,dir:1});}}}}
const LAND_TYPES={hw:['sedan','sedan','suv','sport','van','truck','muscle','super','compact','pickup','bus','limo'],road:['sedan','pickup','suv','compact','van','muscle','truck','bike'],dirt:['pickup','pickup','suv','bike','compact']};
let landTick=0;
// Statisten (nicht im Passanten-System): tanzen, klatschen, zuschauen
const PUPPETS=[];
// ---------- Zufallsereignisse ----------
const EV={list:[],t:20,chase:0};
// ================= CLUBS: Leben im Club (DJ, Tänzer, Bar, VIP, Lichtshow, Beat) =================
const CLUBVIP={};
let clubBeatT=0;
const tmpC2=new THREE.Color();
// ================= MEHR LEBEN: Wohlstand, Passanten, Szenen, Requisiten, Hunde, Vögel =================
// ---------- Wohlstandskarte (0 = arm … 1 = reich) ----------
const WEALTH_ZONE={'Rostviertel':.05,'Trailerpark Rostbach':.05,'Camp Ostklippe':.08,'Dustwater':.2,'Flugfeld Dustwater':.3,'Kaktus-Tankstelle':.3,'Skatepark West':.35,
 'Vista Mar':.96,'Sternwarte':.9,'Mount Solara':.7,'Funland':.6,'Solara-Arena':.62,'Stuntpark':.5,'Nordpark':.72,'Schrottplatz Müller':.15,'JVA Steinfeld':.25,
 'Ölfeld Calvera':.22,'Windpark Calvera':.3,'Salzsee':.35,'Flughafen Solara':.7};
const DIST_WEALTH={downtown:.86,residential:.74,beach:.76,mixed:.42,industrial:.2,park:.66,garage:.3,police:.5,hospital:.55};
const wealthClass=w=>w<.3?'poor':w>.68?'rich':'mid';

// ---------- Kleidung nach Wohlstand ----------
const MUTED=[0x5b5346,0x4a4f45,0x66645e,0x3d4652,0x7a6a55,0x4d3b2f,0x585048,0x3f4a3c,0x6e5f4f,0x2f3338];

// ---------- Requisiten in der Hand (geteilte Geometrien) ----------
const PROPM={dark:cm(0x15171a,.4,.3),brown:cm(0x5a3a22,.55,.1),paperA:cm(0xc9a77a,.85),paperB:cm(0xf2f2ee,.8),paperC:cm(0x1e2a3a,.6),red:cm(0xc0392b,.6),cup:cm(0xf4f2ec,.5),lid:cm(0x4a3020,.6),screen:M({color:0x101820,emissive:0x2a6fbf,emissiveIntensity:.5,roughness:.3}),
 wood:cm(0x8a5a2b,.5),woodD:cm(0x3a2416,.6),string:cm(0xdddddd,.3,.8),news:cm(0xe9e6dc,.9),umb:[0x1b1b1b,0xc0392b,0x1f5fbf,0x2e7d32,0x6a1b9a,0xf1c40f,0xe84393].map(c=>M({color:c,roughness:.55,side:THREE.DoubleSide}))};
const PROPG={phone:new THREE.BoxGeometry(.075,.15,.012),case:new THREE.BoxGeometry(.42,.3,.1),caseH:new THREE.TorusGeometry(.05,.012,5,10,Math.PI),bag:new THREE.BoxGeometry(.26,.32,.13),
 cup:new THREE.CylinderGeometry(.04,.032,.12,10),cupL:new THREE.CylinderGeometry(.043,.043,.02,10),cam:new THREE.BoxGeometry(.13,.08,.07),news:new THREE.BoxGeometry(.42,.32,.01),
 umbC:new THREE.ConeGeometry(.55,.28,10,1,true),umbS:new THREE.CylinderGeometry(.012,.012,.95,5)};

// ---------- Passanten-Pool: Wohlstands-Klassen, Umsetzen in Spielernähe ----------
const AMB={t:0,vt:1,vigs:[],spots:null,dogs:[],gulls:[],pigeons:[],pT:6};
const PED_POOL=[60,76,92][SET.quality]??76,WALK_NEAR=[14,20,26][SET.quality]??20,VIG_NEAR=[5,7,9][SET.quality]??7;
const CLS_AFF={rich:{rich:1,mid:.45,poor:.06},mid:{rich:.5,mid:1,poor:.5},poor:{rich:.08,mid:.5,poor:1},beach:{rich:.5,mid:.6,poor:.15}};

// ---------- Szenen erzeugen/entfernen ----------
const VIG_MAT={cart:[0xf4f4f4,0xd8e8f0,0xfff2d0].map(c=>cm(c,.45,.3)),stripe:[0xc0392b,0x1f8a8a,0xe84393,0x1f5fbf].map(c=>cm(c,.55)),metal:cm(0x9aa2aa,.35,.8),dark:cm(0x222428,.6),
 tow:[0xe74c3c,0x3498db,0xf1c40f,0x2ecc71,0x9b59b6,0xff7f50].map(c=>cm(c,.9)),umb:[0xff5a4a,0x2a9df4,0xffd23a,0x7ed957].map(c=>M({color:c,roughness:.7,side:THREE.DoubleSide})),
 blanket:M({map:itx(64,64,(g,w,h)=>{g.fillStyle='#d64541';g.fillRect(0,0,w,h);g.fillStyle='#f4f1ea';for(let y=0;y<h;y+=16)for(let x=(y/16%2)*16;x<w;x+=32)g.fillRect(x,y,16,16);}),roughness:.95}),
 sign:{vendor:['HOT DOGS','EIS','KAFFEE','TACOS','LIMO'].map(t=>new THREE.MeshBasicMaterial({map:sign(t,'#1b2433','#ffd23a',256,64,34)}))},hat:cm(0x2b2b2b,.7),basket:cm(0x9a6a3a,.8),chair:cm(0x6e5f4f,.85),seat:cm(0x3a6e8a,.8)};
const MZONES={jewel:()=>JEWEL&&JEWEL.store&&{x:JEWEL.store.cx,z:JEWEL.store.cz,r:40},bank:()=>BANK&&{x:BANK.cx,z:BANK.bz,r:60},burger:()=>SPECIAL['8,10'].door&&{x:SPECIAL['8,10'].door.x,z:SPECIAL['8,10'].door.z-5,r:40},home:()=>SPECIAL['3,5'].door&&{x:SPECIAL['3,5'].door.x-6,z:SPECIAL['3,5'].door.z-9,r:40}};

// ---------- Hunde (mit Leine) ----------
const DOGM=[0x6b4a2e,0x1c1c1c,0xd9c7a2,0xb9773a,0x8d8d8d,0xf2efe8].map(c=>cm(c,.85));
const LEASH_MAT=new THREE.LineBasicMaterial({color:0x1b1b1b});
const _dv=new THREE.Vector3();

// ---------- Vögel: Möwen über der Küste, Tauben auf Plätzen ----------
const BIRDM={gull:cm(0xf2f2f2,.7),gullW:M({color:0xd9dde0,roughness:.7,side:THREE.DoubleSide}),tip:M({color:0x222222,roughness:.7,side:THREE.DoubleSide}),beak:cm(0xf1c40f,.6),pig:cm(0x7c8088,.75),pigW:M({color:0x6e737b,roughness:.8,side:THREE.DoubleSide})};
const BIRDG={body:new THREE.SphereGeometry(.12,8,6).scale(.8,.7,2),head:new THREE.SphereGeometry(.07,8,6),wing:new THREE.PlaneGeometry(.55,.2).translate(.28,0,0).rotateX(-Math.PI/2),tip:new THREE.PlaneGeometry(.16,.12).translate(.6,0,-.02).rotateX(-Math.PI/2)};
// ================= MEHR VERKEHR: Rost-Autos, neue Modelle, parkende Autos, Verkehr in Spielernähe, Boote & Flugverkehr =================
// ---------- Neue Automodelle (eigene Designs) ----------
CARDEF.kombi={L:4.85,W:1.8,yb:.32,hood:.9,belt:.98,trunk:1.0,roof:1.47,cab:[-2.2,.86],ws:.56,rw:.1,wr:.33,wz:[1.5,-1.45],nose:.32,tail:.12,rails:1,rim:0};
CARDEF.rostlaube={L:3.72,W:1.64,yb:.3,hood:.84,belt:.93,trunk:.97,roof:1.44,cab:[-1.5,.72],ws:.74,rw:.36,wr:.31,wz:[1.16,-1.15],nose:.46,tail:.3,rim:0};
VST.kombi={name:'Familienkombi',max:38,acc:11,hp:520,price:1500};VST.rostlaube={name:'Rostlaube',max:31,acc:9,hp:420,price:600};

// ---------- Rost-Lack: ausgeblichen, Rostflecken unten/an Kanten, Grundierungs-Flicken (prozedural, ohne Textur) ----------
const rustCache={};

// ---------- Autos passend zur Gegend ----------
const RICH_COL=[0x111111,0xf2f2f2,0xbdc3c7,0x1c2833,0x2e4053,0x0b2545,0x5a0f14,0x7f8c8d,0x0e3b2e];
const POOR_COL=[0x8a7a5a,0x6b7a6a,0x7a5a4a,0x9a9070,0x5a6a7a,0xa08060,0x6a4a3a,0x8a8a80,0x4a5a4a,0xb0a080,0x7a3a2a];
const MIX_RICH=[['sport',4],['super',2.5],['limo',2],['suv',6],['sedan',4],['muscle',1],['taxi',2],['bike',1.2]];
const MIX_POOR=[['rostlaube',5],['kombi',4],['compact',3],['sedan',3],['pickup',3],['van',2],['scooter',1.5],['bike',.8],['muscle',.6]];

// ---------- Parkende Autos am Straßenrand (laufend in Spielernähe) ----------
const PARK={t:0,list:[]};const PARK_N=[24,34,44][SET.quality]??34;
// KI-Verkehr: weit entfernte Autos abbauen – sie entstehen in Spielernähe neu (passend zur Gegend)
const AI_N=[44,58,70][SET.quality]??58;
const SAILM={sail:M({color:0xf6f3ea,roughness:.85,side:THREE.DoubleSide}),mast:cm(0xd8dde2,.25,.85),teak:IM.oak,win:M({color:0x18252e,roughness:.08,metalness:.7}),navy:cm(0x16243a,.6),funnel:cm(0xc0392b,.5),white:cm(0xf2f2ee,.35)};
let SAILGEO=null,YACHTGEO=null,FERRYGEO=null;
const AMBB={list:[],t:0,ferry:null};const AMBB_N=[3,4,6][SET.quality]??4;

// ---------- Flugverkehr: Linienflüge am Flughafen, Hubschrauber über der Stadt, Überflüge ----------
const AMBA={list:[],t:3};const AMBA_H=[1,2,3][SET.quality]??2;
window.__lifeReady=true;
// ================= BELEBTE INNENRÄUME =================
// Bank, Läden, Restaurants und Werkstatt bekommen echte Figuren: Kunden (sitzen, warten, bummeln, kommen und gehen),
// Personal und – je nach Laden – Sicherheitsleute. Regeln:
//  • Bank: Metalldetektor am Eingang – mit Waffe in der Hand gibt es Alarm und Sterne.
//  • Ist nur noch eine Person im Laden bei Bewusstsein, kann man sie mit der Waffe bedrohen – sie rückt etwas Geld heraus.
//  • Danach rüstet der Laden auf (mehr Wachen beim nächsten Besuch, bis Stufe 3).
//  • Während Missionen in der Nähe bleiben die Räume ruhig (keine neuen Figuren, keine Überfälle).
const IP={t:0,cur:null,threat:null,hintT:0,lockMsg:0,doorWarnT:0};
const IP_NEAR=70,IP_FAR=110;
const ipInside=(V,x,z)=>x>V.x0&&x<V.x1&&z>V.z0&&z<V.z1;
// ---------- Verhalten der Figuren (aus updateNPCs) ----------
const ipVis=(n,V)=>V.camVis||!ipInside(V,n.c.g.position.x,n.c.g.position.z);

// ================= MISSIONEN =================
let hintMsg='';
const CONTACTS={
 mila:{name:'Mila',label:'M',col:'#ffd23a',pos:()=>({x:GARAGE.x+1,z:GARAGE.z-36})},
 jax:{name:'Jax',label:'J',col:'#ff8a3a',pos:()=>SPECIAL['12,8'].door},
 rocco:{name:'Rocco',label:'R',col:'#c38bff',pos:()=>SPECIAL['2,11'].door},
 prof:{name:'Der Professor',label:'P',col:'#6fd3ff',pos:()=>SPECIAL['8,6'].door},
};
const BANK=SPECIAL['7,6'],JEWEL=SPECIAL['5,7'];
const EXPORTPOS=()=>SPECIAL['2,11'].export;
let mJet=null,mObjs=[],mCarsS=[],mCourier=null,mTail=null,mTalk=0,mGetaway=null,mTruck=null,mPlane=null,mRings=null,mHeli=null,mLimo=null,mBug=false,mWave=0,mTimerS=0;
const allCopsDown=a=>a.every(n=>n.downOnce||n.state==='ko'||n.state==='fly'||!peds.includes(n));
const near=(p,r)=>Math.hypot(P.pos.x-p.x,P.pos.z-p.z)<r;
const ringMatOn=new THREE.MeshBasicMaterial({color:new THREE.Color(3,2.4,.4),transparent:true,opacity:.9}),ringMatOff=new THREE.MeshBasicMaterial({color:new THREE.Color(.6,.8,1.4),transparent:true,opacity:.35});
const AIR_COURSE1=[[RWX,40,-180],[700,80,-480],[420,100,-680],[0,90,-650],[-380,110,-600],[-640,90,-260],[-600,70,140],[-300,60,COAST+40],[100,70,WATER_Z+300],[IX+160,55,IZ-60],[IX,45,IZ]].map(p=>new THREE.Vector3(p[0],p[1],p[2]));
