'use strict';
addPickup(nodeX(7)+9.5,nodeX(6)+9.5,'weapon','pistol',48);
addPickup(nodeX(6)+9.5,nodeX(10)+9.5,'weapon','bat',0);
addPickup(nodeX(12)+9.5,nodeX(3)+9.5,'weapon','smg',60);
addPickup(nodeX(4)+9.5,nodeX(12)+9.5,'weapon','knife',0);
addPickup(nodeX(9)+9.5,nodeX(2)+9.5,'weapon','rifle',60);
addPickup(nodeX(13)+9.5,nodeX(9)+9.5,'weapon','grenade',4);
addPickup(nodeX(1)+9.5,nodeX(8)+9.5,'weapon','grenade',3);
addPickup(nodeX(11)+9.5,nodeX(13)-9.5,'weapon','pistol',36);
addPickup(HOSPITAL_SPAWN.x+6,HOSPITAL_SPAWN.z,'health');
addPickup(nodeX(9)+9.5,nodeX(5)-9.5,'health');
addPickup(nodeX(3)+9.5,nodeX(11)+9.5,'health');
addPickup(nodeX(12)+9.5,nodeX(12)+9.5,'health');
addPickup(nodeX(5)+9.5,nodeX(2)+9.5,'health');
addPickup(POLICE_SPAWN.x+6,POLICE_SPAWN.z,'armor');
addPickup(nodeX(10)+9.5,nodeX(9)+9.5,'armor');
addPickup(nodeX(2)+9.5,nodeX(13)-9.5,'armor');

// ================= HUBSCHRAUBER & FLUGZEUGE =================
const aircraft=[];const rotorMat=cm(0x1a1a1a,.6,.4);
let policeHeli=null,heliRespawnT=0;
const searchLight=new THREE.SpotLight(0xf4f8ff,0,160,.22,.5,1);const slTgt=new THREE.Object3D();searchLight.target=slTgt;scene.add(searchLight,slTgt);
const ROTOR_TEX=canvasTex(256,256,(g,w,h)=>{g.clearRect(0,0,w,h);const c=w/2;for(let r=c;r>c*.12;r-=1){const k=r/c;g.strokeStyle=`rgba(30,32,36,${(.10+.32*k*k)*(Math.random()*.25+.75)})`;g.lineWidth=1.2;g.beginPath();g.arc(c,c,r,0,7);g.stroke();}
 for(let i=0;i<4;i++){const a0=i*Math.PI/2;for(let j=0;j<14;j++){g.strokeStyle=`rgba(20,20,22,${.05*(1-j/14)})`;g.lineWidth=7;g.beginPath();g.arc(c,c,c*.6,a0-j*.06,a0-j*.06-.06,true);g.stroke();}}
 g.globalCompositeOperation='destination-out';g.beginPath();g.arc(c,c,c*.1,0,7);g.fill();});
const heliGlass=M({color:0x3d5a70,roughness:.05,metalness:.5});
placeAir(makeHeli(0x2e86de,false),PIERX-40,COAST+18,Math.PI*.9);
placeAir(makeHeli(0xd35400,false),AIRX0+90,200,-Math.PI/2);
placeAir(makeHeli(0x4b5a2e,true),AIRX0+90,250,-Math.PI/2);
placeAir(makeHeli(0x111111,true),AIRX0+90,300,-Math.PI/2);
placeAir(makePlane(0xf2f2f2,false),RWX-10,-300,0);
placeAir(makePlane(0xc0392b,false),AIRX0+80,-180,Math.PI/2);
placeAir(makePlane(0xf4f4f4,true,'private'),RWX+10,-300,0);
placeAir(makePlane(0xf4f4f4,true,'liner'),730,180,0);
placeAir(makePlane(0xdedede,false,'cargo'),730,-60,0);
placeAir(makePlane(0xe8d9b0,false),1236,-2318,-Math.PI/2).name='Propellermaschine';placeAir(makePlane(0x9fc4d6,false),1158,-2287,Math.PI);
for(const pd of MIL.pads){const mh=placeAir(makeHeli(0x3d4a2a,true),pd.x,pd.z,Math.PI/2);mh.mil=true;}
{const mj=placeAir(makePlane(0x4a5560,true),MIL.jet.x,MIL.jet.z,Math.PI/2);mj.mil=true;mj.name='Militärjet';}
const overWater=p=>p.z>WATER_Z&&Math.abs(p.x-PIERX)>5&&!onIsland(p);

window.__combatReady=true;attachWeapon();for(const p of peds)if(p.wantGun){armNPC(p,'pistol');p.wantGun=false;}

// ---------- Fallschirm ----------
const chute=new THREE.Group();
{const cols=[0xe74c3c,0xf1c40f];for(let k=0;k<8;k++){const seg=new THREE.Mesh(new THREE.SphereGeometry(3.4,4,6,k*Math.PI/4,Math.PI/4,0,Math.PI/2.6),new THREE.MeshStandardMaterial({color:cols[k%2],roughness:.8,side:THREE.DoubleSide}));seg.scale.y=.55;chute.add(seg);}
 for(const [x,z] of [[-2.4,-1.2],[2.4,-1.2],[-2.4,1.2],[2.4,1.2]]){const l=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,4.6,4),cm(0x222222,.8));l.position.set(x*.5,-2.2,z*.5);l.rotation.z=-x*.1;l.rotation.x=z*.08;chute.add(l);}}
chute.visible=false;scene.add(chute);

// ---------- Waffenrad (Tab gedrückt halten) ----------
let wheelOpen=false,wheelSel=0;const wheelV={x:0,y:0};
$('wwheel').addEventListener('click',e=>{const s=e.target.closest('.ws');if(!s)return;wheelSel=+s.dataset.k;closeWheel(true);});

// ---------- Panzer ----------
let tankCD=0;

// ---------- Tod & Verhaftung: Zeitlupe und Grau ----------
let deathFx=0;

// ---------- Umfahrbare Laternen & Ampeln ----------
const fallingProps=[],brokenProps=[],propM=new THREE.Matrix4(),propR=new THREE.Matrix4(),propPiv=new THREE.Matrix4(),propT=new THREE.Matrix4();

// ================= FLUGHAFEN & MILITÄRGELÄNDE =================
const barTex=canvasTex(128,16,(g,w,h)=>{for(let i=0;i<8;i++){g.fillStyle=i%2?'#d62020':'#f4f4f4';g.fillRect(i*16,0,16,h);}});
const barMat=new THREE.MeshStandardMaterial({map:barTex,roughness:.5});

// ---------- Flughafen Solara ----------
const APT={x0:AIRX0-8,x1:AIRX1+8,z0:AIRZ0-8,z1:AIRZ1+8,alarm:false,guards:[],bar:null,side:null,sideOpen:false,pick:null,camT:0,hintT:0};
const aptIn=(x,z)=>x>APT.x0&&x<APT.x1&&z>APT.z0&&z<APT.z1;

// ---------- Fort Adler (wie im echten Open-World-Klassiker: Sperrgebiet = 4 Sterne) ----------
const MILS={alert:false,warned:false,soldiers:[],bar:null,sirenT:0,beams:[],z:null};

// ---------- Abfangjäger bei 4+ Sternen in der Luft ----------
const enemyJets=[];let ejT=0;

// ---------- Boote am Steg und am Pier ----------
let introBoat=null;

// ================= SYSTEME: Wetter, Speichern, Orte, Läden =================
// ---------- Wetter ----------
const WX={type:'klar',rain:0,cloud:.12,fog:0,wet:0,next:RR(200,380),flashT:0,boltT:6,target:{rain:0,cloud:.12,fog:0}};
const WX_TYPES={klar:{rain:0,cloud:.12,fog:0},wolkig:{rain:0,cloud:.65,fog:.08},regen:{rain:.75,cloud:.9,fog:.3},gewitter:{rain:1,cloud:1,fog:.35},nebel:{rain:0,cloud:.45,fog:1}};
const WX_ICON={klar:'☀️',wolkig:'☁️',regen:'🌧️',gewitter:'⛈️',nebel:'🌫️'};
// Regen: GPU-animierte Regenstreifen (Billboards), wandern mit der Kamera, auf allen Qualitätsstufen
const RAIN_N=[2600,4200,6000][SET.quality]||4200;
const rainGeo=new THREE.BufferGeometry();
{const pos=new Float32Array(RAIN_N*12),off=new Float32Array(RAIN_N*16),idx=new Uint32Array(RAIN_N*6);const C=[-1,0,0,1,0,0,-1,1,0,1,1,0];
 for(let i=0;i<RAIN_N;i++){const o=[RR(-35,35),RR(0,32),RR(-35,35),Math.random()];for(let k=0;k<4;k++){pos.set(C.slice(k*3,k*3+3),i*12+k*3);off.set(o,i*16+k*4);}idx.set([0,1,2,2,1,3].map(v=>v+i*4),i*6);}
 rainGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));rainGeo.setAttribute('aOff',new THREE.BufferAttribute(off,4));rainGeo.setIndex(new THREE.BufferAttribute(idx,1));}
const rainU={uTime:{value:0},uCam:{value:new THREE.Vector3()},uOp:{value:0},uCol:{value:new THREE.Color(0xc9d6e4)},uWind:{value:new THREE.Vector2(.12,.05)}};
const rainMat=new THREE.ShaderMaterial({uniforms:rainU,transparent:true,depthWrite:false,side:THREE.DoubleSide,
 vertexShader:`attribute vec4 aOff;uniform float uTime;uniform vec3 uCam;uniform vec2 uWind;varying float vE;
 void main(){float y=mod(aOff.y-uTime*(23.0+aOff.w*9.0),32.0);float px=uCam.x+mod(aOff.x-uCam.x+35.0,70.0)-35.0,pz=uCam.z+mod(aOff.z-uCam.z+35.0,70.0)-35.0,py=uCam.y-13.0+y;
  vec2 v0=vec2(uCam.x-px,uCam.z-pz);vec2 v=v0/max(length(v0),.001);vec2 r=vec2(-v.y,v.x);
  vec3 p=vec3(px,py,pz)+vec3(r.x,0.0,r.y)*position.x*(.017+.0022*length(v0))+vec3(uWind.x,1.0,uWind.y)*position.y*(1.1+aOff.w*.6);
  vE=position.y;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.0);}`,
 fragmentShader:`uniform float uOp;uniform vec3 uCol;varying float vE;void main(){gl_FragColor=vec4(uCol,uOp*(.15+.85*vE));}`});
const rainLines=new THREE.Mesh(rainGeo,rainMat);rainLines.frustumCulled=false;rainLines.onBeforeRender=(r,sc,cam)=>{rainU.uCam.value.copy(cam.position);rainU.uTime.value=performance.now()/1000;};rainLines.visible=false;rainLines.renderOrder=3;scene.add(rainLines);
// Wolkendecke bei Regen: dunkle Kuppel + große, dunkle Regenwolken direkt über dem Spieler
const ovGeo=new THREE.SphereGeometry(1700,32,14,0,Math.PI*2,0,Math.PI*.55);{const pa=ovGeo.attributes.position,cols=[];for(let i=0;i<pa.count;i++){const k=clamp(pa.getY(i)/1700,0,1);const v=.55+.45*(1-k);cols.push(v,v,v*1.04);}ovGeo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));}
const ovMat=new THREE.MeshBasicMaterial({color:0x40454d,vertexColors:true,transparent:true,opacity:0,depthWrite:false,fog:false,side:THREE.BackSide});
const ovDome=new THREE.Mesh(ovGeo,ovMat);ovDome.renderOrder=-1;ovDome.frustumCulled=false;ovDome.visible=false;scene.add(ovDome);
const stormMat=new THREE.SpriteMaterial({map:cloudTex,transparent:true,depthWrite:false,fog:false,opacity:0,color:0x3a3e45});
const storms=[];for(let i=0;i<70;i++){const sp=new THREE.Sprite(stormMat);const sc=RR(420,820);sp.scale.set(sc,sc*RR(.45,.65),1);sp.userData={x:RR(-1600,1600),z:RR(-1600,1600),y:RR(170,300)};sp.visible=false;scene.add(sp);storms.push(sp);}
let stormDrift=0;
const FOG_FAR=()=>Math.max(getEffectiveGfxFar()+24,[1700,2400,3000][SET.quality]||2400);

// ---------- Fortschritt & Speichern ----------
const PROG={mi:0,mv:2,story:false,stunts:[],packages:[],robbed:[],taxi:0,vig:0,para:0,pizza:0,exp:[],bounty:0,races:[],flight:[],fight:0,range:0,movies:0,cars:[],air:[],truck:0,meteors:[],views:[],skate:0,sec:{},ipRob:0};
const STUNT_TOTAL=()=>Math.max(1,ramps.filter(r=>r.stunt).length);
let saveIcoT=0;
const BIZ={active:false,role:null,owned:[],up:{},safe:{},stock:{},pop:{},raidT:600,raid:null,best:0,rank:0};
const SAVE_KEY=()=>BIZ.active?'portsolara_biz_v1':'portsolara_save_v1';

// ---------- Freischaltungen (nach und nach) ----------
const UNLOCK_AT={safehouse:1,garage:1,gunshop:1,burger:1,clothes:1,respray:1,store:1,taxi:2,pizza:2,dealer:2,cinema:2,club:2,coaster:2,wheel:2,range:2,race:3,bounty:3,flight:3,fight:3,export:3,vig:3,para:3};
const UNLOCK_NAMES={safehouse:'Deine Wohnung (H)',garage:'Garage (G)',gunshop:'Waffenläden (W)',burger:'Burger Buden (B)',clothes:'Kleiderladen (K)',respray:'Sprühwerke (L)',store:'Überfälle auf Läden & Tankstellen',taxi:'Taxi-Job (T)',pizza:'Pizza Presto (Pz)',dealer:'Autohaus (A)',cinema:'Kino',club:'Club NEON',coaster:'Freizeitpark',range:'Schießstand (S)',race:'Straßenrennen (Re)',bounty:'Kopfgeld-Büro (KG)',flight:'Flugschule (F)',fight:'Faustkampf-Club (FK)',export:'Auto-Export (Ex)',vig:'Bürgerwehr (F im Streifenwagen)',para:'Rettungsdienst (F im Rettungswagen)'};
let unlockCheckT=0;

// ---------- Interaktionen & Orte ----------
const interacts=[];
const placeMarkGeo=new THREE.TorusGeometry(1,.07,6,32).rotateX(Math.PI/2);
const PLACE_HINT={dealer:'Autohaus',gunshop:'Waffenladen',range:'Schießstand',clothes:'Kleidung kaufen',respray:'Neu lackieren (mit Auto)',burger:'Essen kaufen',safehouse:'Wohnung',garage:'Garage',fight:'Faustkampf',taxi:'Taxi-Job',pizza:'Pizza-Job',export:'Export-Liste',race:'Straßenrennen',bounty:'Kopfgeld-Aufträge',flight:'Flugschule',cinema:'Kino',club:'Club NEON',coaster:'Achterbahn fahren ($20)',wheel:'Riesenrad fahren ($10)'};

// ---------- Fenster (Läden) ----------
let panelOpen=null;
$('pbody').addEventListener('click',e=>{const b=e.target.closest('.pi');if(!b||!panelOpen)return;const it=panelOpen._items[+b.dataset.i];if(!it||it.dis)return;
 if(it.price&&P.money<it.price){toast('Nicht genug Geld!');tone(160,.2,'square',.05);return;}if(it.price){P.money-=it.price;cashSound();}else uiClick();it.act();if(panelOpen)renderPanel();});
$('pclose').onclick=()=>closePanel();

// ---------- Waffenladen ----------
const GUN_SHOP={knife:[150,0],bat:[100,0],pistol:[600,48],smg:[1800,120],rifle:[3500,120],shotgun:[2200,24],sniper:[5000,15],rpg:[9000,4],grenade:[900,5]};
const AMMO_SHOP={pistol:[120,48],smg:[300,120],rifle:[450,120],shotgun:[250,24],sniper:[400,10],rpg:[1500,2],grenade:[900,5]};

// ---------- Autohaus ----------
const DEALER_CARS=['sedan','suv','sport','bike','muscle','limo','super'];
const AIR_SHOP={heli:{name:'Hubschrauber',price:60000},plane:{name:'Propellerflugzeug',price:45000}};
const OWN_AIR_SPOT={heli:{x:AIRX0+90,z:150,h:-Math.PI/2},plane:{x:AIRX0+80,z:-120,h:Math.PI/2}};
const NICE_COLORS=[0xc0392b,0x2e86de,0x111111,0xf2f2f2,0xf1c40f,0x27ae60,0x8e44ad,0xe67e22,0x7f8c8d,0x16a085];

// ---------- Garage ----------
let garageCar=null;
const FILMS=[['Die Nacht von Solara','Ein Krimi im Hafenviertel'],['Hafenfieber 2','Action mit vielen Explosionen'],['Liebe & Lack','Eine Romanze in der Autowerkstatt']];

// ---------- Ladenkassen (Überfälle) ----------
let rob=null;
let aimCheckT=0;
let progT=0;

// ---------- Fracht-Kisten ----------
const crates=[];

// ---------- Versteckte Pakete ----------
const pkgMat=new THREE.MeshStandardMaterial({color:0x2a7a3a,emissive:0x3cff6a,emissiveIntensity:.8,roughness:.5});const pkgGeo=new THREE.BoxGeometry(.6,.6,.6);

// ---------- Ort-Aktionen ----------
const PLACE_ACT={
 dealer:p=>openDealer(p),gunshop:p=>openGunshop(p),clothes:p=>openShopCreator(),burger:p=>openBurger(p),safehouse:p=>openSafehouse(p),garage:p=>openGarage(p),
 cinema:p=>openCinema(p),club:p=>openClub(p),
 coaster:p=>startRide('coaster'),wheel:p=>startRide('wheel'),
 range:p=>openRange(p),fight:p=>openFight(p),taxi:p=>openTaxiDepot(p),pizza:p=>openPizza(p),export:p=>openExport(p),race:p=>openRaces(p),bounty:p=>openBounty(p),flight:p=>openFlight(p),
};

// ================= NEBENMISSIONEN & AKTIVITÄTEN =================
let activity=null;
const distP=p=>Math.hypot(P.pos.x-p.x,P.pos.z-p.z);

// ---------- Kopfgeld ----------
const BOUNTIES=[{name:'„Zahnlücke“ Hugo',i:2,j:8,guards:1,reward:1200},{name:'Die Brenner-Brüder',i:11,j:3,guards:2,reward:1800},{name:'Ratten-Rudi',i:5,j:12,guards:2,reward:2200},{name:'„Stahlkappe“ Vera',i:12,j:11,guards:3,reward:3000},{name:'Der Schatten',i:1,j:1,guards:3,reward:4000},{name:'Big Toni',i:8,j:2,guards:4,reward:6000}];

// ---------- Straßenrennen ----------
const RACES=[{name:'Hafen-Sprint',laps:1,wp:[[13,9],[13,13],[9,13],[9,10],[6,10],[6,13],[2,13],[2,9],[6,9],[9,9],[13,9]],rivals:3,speed:29,reward:1500},
 {name:'Downtown-Rundkurs',laps:2,wp:[[9,5],[9,9],[5,9],[5,5],[9,5]],rivals:4,speed:30,reward:2500},
 {name:'Große Stadtrunde',laps:1,wp:[[13,2],[13,13],[1,13],[1,1],[13,1],[13,2]],rivals:4,speed:33,reward:4000},
 {name:'Salzsee-Sprint',laps:2,pts:()=>[[-300,-2470],[-60,-2462],[200,-2470],[245,-2560],[200,-2655],[-60,-2662],[-300,-2655],[-312,-2560],[-300,-2470]].map(p=>({x:p[0],z:p[1]})),rivals:4,speed:36,reward:3500},
 {name:'Küstensprint',laps:1,pts:()=>[{x:-700,z:150}].concat(roadPts('Westküstenstraße',0,1650,55)),rivals:3,speed:30,reward:3000},
 {name:'Bergrennen Mount Solara',laps:1,pts:()=>roadPts('Bergstraße Mount Solara',0,-4,45),rivals:3,speed:17,reward:4500,offroad:true},
 {name:'Wüstenrallye',laps:1,pts:()=>roadPts('Wüstenstraße',20,-15,60),rivals:4,speed:31,reward:5000,offroad:true}];
let race=null;
const cpNext=new THREE.Mesh(new THREE.TorusGeometry(3,.25,8,32),new THREE.MeshBasicMaterial({color:new THREE.Color(.6,1,2.6),transparent:true,opacity:.6}));cpNext.rotation.x=Math.PI/2;cpNext.visible=false;scene.add(cpNext);

// ---------- Flugschule ----------
const LESSONS=[
 {name:'Propeller-Grundkurs',air:'plane',start:{x:RWX-12,z:-345,h:0},rings:[[RWX,14,-150],[RWX,45,80],[RWX+30,80,330],[RWX+160,90,420],[RWX+260,90,150],[RWX+230,80,-300],[RWX+170,65,-640],[RWX,30,-560]],land:true,tg:[80,105,150],reward:800},
 {name:'Hubschrauber-Stadtflug',air:'heli',start:{x:AIRX0+90,z:100,h:-Math.PI/2},rings:[[AIRX0+40,25,100],[450,60,120],[300,150,0],[100,150,-200],[-150,150,-150],[-300,150,100],[-150,120,300],[150,80,380],[400,40,300],[AIRX0+40,15,120]],tg:[85,110,150],reward:1200},
 {name:'Kampfjet-Parcours',air:'jet',start:{x:RWX+12,z:-345,h:0},rings:[[RWX+12,20,-80],[RWX,90,250],[600,160,650],[200,180,800],[-300,180,700],[-650,160,300],[-650,170,-300],[-300,150,-700],[200,140,-700],[700,100,-600],[RWX,60,-450]],tg:[60,75,100],reward:2000}];

// ---------- Faustkampf ----------
const FIGHTERS=[{name:'Kalle',hp:110},{name:'Brutus',hp:150},{name:'Die Walze',hp:190},{name:'Iron Ina',hp:240},{name:'Champion Drago',hp:320}];

// ---------- Auto-Export ----------
const EXPORT_LIST=[{vt:'sport',pay:1800},{vt:'suv',pay:1200},{vt:'muscle',pay:2000},{vt:'van',pay:900},{vt:'limo',pay:2600},{vt:'taxi',pay:800},{vt:'super',pay:4000},{vt:'bike',pay:1100},{vt:'sedan',pay:700},{vt:'bus',pay:1500}];
// ================= NEUE NEBENJOBS: Trucker, Skatepark-Challenge, Meteoriten, Aussichtspunkte, Wüstenflug =================
LESSONS.push(
 {name:'Wüsten-Rundflug',air:'plane',start:{x:1236,z:-2318,h:-Math.PI/2},rings:[[1060,24,-2318],[860,60,-2250],[600,80,-2150],[260,110,-1820],[140,120,-1550],[380,110,-1700],[700,90,-2000],[980,60,-2230],[1180,30,-2318]].map(p=>[p[0],terrainH(p[0],p[2])+p[1],p[2]]),
  land:true,landAt:{x:1000,z:-2318},landOk:a=>a.g.position.x>860&&a.g.position.x<1260&&Math.abs(a.g.position.z+2318)<26,tg:[95,125,170],reward:1600},
 {name:'Hubschrauber-Gipfeltour',air:'heli',start:{x:AIRX0+90,z:200,h:-Math.PI/2},rings:[[AIRX0+60,30,150],[500,70,-600],[200,90,-1000],[-300,90,-1180],[-620,300,-1640],[-200,180,-1500],[150,120,-1300],[500,70,-800],[AIRX0+40,20,180]].map(p=>[p[0],Math.max(p[1],terrainH(p[0],p[2])+30),p[2]]),tg:[110,140,190],reward:2200});
PLACE_HINT.truck='Trucker-Job (Spedition)';PLACE_HINT.skate='Skatepark-Challenge';
PLACE_ACT.truck=p=>{if(!canStartSide())return;startTrucker(p);};
PLACE_ACT.skate=p=>{if(!canStartSide())return;startSkate(p);};
// ---------- Trucker-Job ----------
const TRUCK_DEST=[{n:'Hafen Port Solara',x:nodeX(1)+30,z:nodeX(N)-2},{n:'Flughafen Solara (Fracht)',x:AIRX0-14,z:-60},{n:'Vista Mar',x:-950,z:300},{n:'Kaktus-Tankstelle',x:300,z:-2075},{n:'JVA Steinfeld',x:860,z:-2925},{n:'Sternwarte',x:-420,z:-1150},{n:'Camp Ostklippe',x:1090,z:-960},{n:'Fort Adler (Lieferanten)',x:-700,z:-2828}];
// ---------- Skatepark-Challenge: 12 Münzen in 60 Sekunden ----------
const tokenMat=new THREE.MeshBasicMaterial({color:new THREE.Color(2.4,.8,2.2)});
// ---------- Meteoritensplitter (20 Sammelobjekte) ----------
const METEORS=[];{const rr=mulberry32(777);let tries=0;const cand=[[-620,-1600],[-480,-1500],[140,-1620],[560,-1560],[930,-1400],[-980,-1480],[-520,-2180],[1080,-3010],[-200,-3170],[620,-2750],[-900,-2290],[-60,-2560],[300,-3000],[1150,-2700],[-1050,-3050],[700,-2050],[-300,-2000],[0,-1250],[-1100,-600],[1150,-500]];
 for(const [x0,z0] of cand){let x=x0,z=z0;for(let k=0;k<20&&(terrainH(x,z)<SEA_Y+1||roadAt(x,z,3));k++){x=x0+(rr()-.5)*60;z=z0+(rr()-.5)*60;}METEORS.push({id:METEORS.length,x,z,y:terrainH(x,z),m:null});}}
const meteorMat=new THREE.MeshStandardMaterial({color:0x2a1f3a,emissive:0x7a4dff,emissiveIntensity:2.2,roughness:.3,metalness:.4});const meteorGeo=new THREE.OctahedronGeometry(.55,0);
// ---------- Aussichtspunkte ----------
const VIEWS=[['Gipfel Mount Solara',()=>({x:(SITES.peak.x0+SITES.peak.x1)/2+8,z:(SITES.peak.z0+SITES.peak.z1)/2+4})],['Sternwarte',()=>({x:-420,z:-1150})],['Ende des Piers',()=>({x:PIERX,z:WATER_Z+60})],['Windpark-Hügel',()=>({x:1070,z:-2440})],
 ['Tafelberg Nord',()=>({x:-520,z:-2180})],['Rettungsturm Vista Mar',()=>({x:-990,z:497})],['Nordkap',()=>({x:-1150,z:-3150})],['Salzsee-Ufer',()=>({x:-330,z:-2560})]].map(([n,f],i)=>({id:i,n,p:f()}));

// ================= BUSINESS-MODUS (nach der Story): Nachtclub, Ware-Schmuggel, Waffenschmuggel, Autohandel =================
const BIZ_ROLES={
 club:{name:'Nachtclubbesitzer',icon:'🎧',desc:'Kauf einen Club, bau ihn aus (Sound, Licht, VIP, Star-DJ) und mach ihn mit Promo-Touren zum angesagtesten Laden der Insel.'},
 ware:{name:'Schmuggler',icon:'📦',desc:'Lagerhallen und Verstecke kaufen, Ware produzieren lassen und riskante Lieferungen über die ganze Insel fahren.'},
 waffen:{name:'Waffenschmuggler',icon:'🛡️',desc:'Bunker und Hangar in der Wüste. Produziere Ausrüstung, beliefere Käufer – und pass auf Überfälle auf.'},
 autos:{name:'Autohändler',icon:'🚗',desc:'Autohaus kaufen, seltene Wagen beschaffen und mit Gewinn verkaufen. Je schöner der Ausstellungsraum, desto schneller der Umsatz.'}};
const BIZ_PROPS=[
 {id:'neon',role:'club',name:'Club NEON',price:1800000,pos:()=>{const d=SPECIAL['8,6'].door;return {x:d.x-7,z:d.z};}},
 {id:'mirage',role:'club',name:'Club Mirage (Vista Mar)',price:1250000,pos:()=>({x:-1032,z:410}),club:'Club Mirage'},
 {id:'hafen',role:'ware',name:'Lagerhalle am Hafen',price:900000,pos:()=>({x:nodeX(1)+30,z:nodeX(N)-4})},
 {id:'farm',role:'ware',name:'Farm in den Solara Hills',price:700000,pos:()=>({x:-660,z:-1090})},
 {id:'labor',role:'ware',name:'Versteck Rostbach',price:450000,pos:()=>({x:300,z:-2200})},
 {id:'bunker',role:'waffen',name:'Bunker Calvera',price:1400000,pos:()=>({x:-560,z:-2978})},
 {id:'hangar',role:'waffen',name:'Hangar Flugfeld Dustwater',price:800000,pos:()=>({x:1160,z:-2246})},
 {id:'autohaus',role:'autos',name:'Autohaus Solara',price:1600000,pos:()=>{const d=SPECIAL['12,6'].door||{x:nodeX(12)+35,z:nodeX(7)-4};return {x:d.x+6,z:d.z};}},
 {id:'gebraucht',role:'autos',name:'Gebrauchtwagen Dustwater',price:550000,pos:()=>({x:700,z:-2340})}];
BIZ_PROPS.find(p=>p.id==='neon').club='Club NEON';
const BIZ_UP={
 club:[['sound','Soundanlage',250000,.2],['light','Lichtshow & Laser',180000,.15],['vip','VIP-Lounge',300000,.25],['sec','Security-Team',150000,0],['dj','Star-DJ',400000,.35]],
 ware:[['staff','Mehr Personal',200000,.3],['equip','Bessere Ausrüstung',300000,.4],['store','Größeres Lager',180000,0],['sec','Sicherheit',150000,0]],
 waffen:[['staff','Mehr Personal',260000,.3],['equip','Werkstatt-Upgrade',380000,.4],['store','Größeres Lager',220000,0],['sec','Sicherheit',200000,0]],
 autos:[['shop','Tuning-Werkstatt',250000,.25],['show','Ausstellungsraum',350000,.3],['mkt','Marketing',150000,.2],['sec','Sicherheit',120000,0]]};
const bizP=id=>BIZ_PROPS.find(p=>p.id===id);
const bizHas=(id,u)=>!!(BIZ.up[id]&&BIZ.up[id].includes(u));
const bizBoost=id=>{const p=bizP(id);let b=0;for(const [k,,,v] of BIZ_UP[p.role])if(bizHas(id,k))b+=v;return b;};
const BIZ_RANKS=[[10e6,'Aufsteiger'],[25e6,'Mogul'],[50e6,'Legende von Port Solara']];
const fmt$=v=>'$'+Math.round(v).toLocaleString('de-DE');
// Orte auf der Karte
for(const p of BIZ_PROPS){const q=p.pos();p.place=addPlace('biz',p.name,q.x,q.z,{label:'$',col:'#ffd23a',data:{id:p.id}});}
PLACE_HINT.biz='Business verwalten';PLACE_ACT.biz=p=>openProperty(p.data.id);
addEventListener('keydown',e=>{if(e.code==='KeyB'&&BIZ.active&&mode==='play'&&!e.repeat)openBizApp();});
// ---------- Einnahmen, Produktion, Überfälle ----------
let bizSaveT=0;
// ---------- Aufträge ----------
const BIZ_BUYERS=[{n:'Kunde am Hafen',x:nodeX(2)-4,z:nodeX(N)-3},{n:'Käufer in Vista Mar',x:-970,z:420},{n:'Kontakt an der Kaktus-Tankstelle',x:300,z:-2075},{n:'Abnehmer beim Windpark',x:1050,z:-2600},{n:'Käufer am Salzsee',x:-300,z:-2470},{n:'Treffpunkt Sternwarte',x:-420,z:-1150},{n:'Abnehmer am Camp Ostklippe',x:1090,z:-960},{n:'Kontakt im Rostviertel',x:-600,z:-640}];
{const t=$('title');if(t&&t.insertBefore){const b=document.createElement('button');b.className='bigbtn alt2';b.id='bizbtn';b.textContent='💼 BUSINESS-MODUS';b.onclick=()=>openBizTitle();t.insertBefore(b,$('status'));}}

// ================= ONLINE-MODUS (PeerJS): Freies Spiel, Duell, Rennen, Koop-Aufträge =================
const NET={on:false,host:false,peer:null,conns:[],code:'',players:new Map(),mode:null,score:{},sendT:0,envT:0,coop:null,cpup:new Map(),raceFin:null,chatOpen:false};
const netName=()=>{const d=loadGame();return (d&&d.name)||localStorage.getItem('portsolara_name')||'Spieler';};
// ---------- Modi: Duell, Rennen, Koop ----------
const DUEL_SPAWNS=()=>[nd(5,5),nd(9,5),nd(5,9),nd(9,9),nd(7,7),nd(6,4),nd(10,8),nd(4,10)];
const COOP_SPOTS=[{n:'Rostviertel',x:-600,z:-650},{n:'Industriegebiet',x:nodeX(1)+35,z:nodeX(6)},{n:'Dustwater',x:560,z:-2300},{n:'Ölfeld Calvera',x:30,z:-2975},{n:'Schrottplatz Müller',x:-640,z:100}];
addEventListener('keydown',e=>{if(!NET.on||mode!=='play')return;if(e.code==='Enter'&&!NET.chatOpen){e.preventDefault();netChatOpen();}else if(e.code==='KeyO'&&!NET.chatOpen&&!e.repeat)openNetMenu();});
{const t=$('title');if(t&&t.insertBefore){const b=document.createElement('button');b.className='bigbtn alt2';b.id='netbtn';b.textContent='🌐 ONLINE';b.onclick=()=>openNetTitle();t.insertBefore(b,$('status'));}}

// ================= PAUSEMENÜ & EINSTELLUNGEN =================
let pauseOpen=false,pauseTab='map';
document.querySelectorAll('#ptabs button').forEach(b=>b.onclick=()=>{uiClick();showPauseTab(b.dataset.t);});
$('presume').onclick=()=>closePause();
$('psave').onclick=()=>{saveGame(false);uiClick();};
$('pbiz').onclick=()=>{closePause();setTimeout(()=>{try{openBizApp();}catch(e){}},30);};
$('pnet').onclick=()=>{closePause();setTimeout(()=>{try{openNetMenu();}catch(e){}},30);};
for(const ev of ['pointerlockchange','webkitpointerlockchange','mozpointerlockchange'])document.addEventListener(ev,()=>{if(!plEl()&&mode==='play'&&!panelOpen&&!pauseOpen&&!P.dead&&SET.input==='kb'&&!(typeof DEV_CAM!=='undefined'&&(DEV_CAM.active||performance.now()<(DEV_CAM.devtoolsRequestedUntil||0))))openPause();});

// ================= STEUERUNG: Tastenbelegung · Controller · Touch =================
const IN_LS={keys:'portsolara_keys',pad:'portsolara_pad',touch:'portsolara_touch'};
const DEV_NAME={kb:'⌨️ Tastatur & Maus',pad:'🎮 Controller',touch:'📱 Touch'};

// ---------- Aktionen & Tastatur-Belegung ----------
const ACTS={
 fwd:{n:'Vorwärts',d:'laufen · Gas geben · Schub',v:'KeyW',def:['KeyW','ArrowUp']},
 back:{n:'Rückwärts',d:'laufen · bremsen / rückwärts',v:'KeyS',def:['KeyS','ArrowDown']},
 left:{n:'Links',d:'laufen · lenken · drehen',v:'KeyA',def:['KeyA','ArrowLeft']},
 right:{n:'Rechts',d:'laufen · lenken · drehen',v:'KeyD',def:['KeyD','ArrowRight']},
 sprint:{n:'Sprinten',d:'Heli: sinken · Flugzeug: Nase runter',v:'ShiftLeft',def:['ShiftLeft','ShiftRight']},
 jump:{n:'Springen',d:'Handbremse · Heli: steigen · Nase hoch · Fallschirm',v:'Space',def:['Space','']},
 use:{n:'Einsteigen / Benutzen',d:'Fahrzeuge, Läden, Türen, Abspringen',v:'KeyE',def:['KeyE','']},
 fire:{n:'Schießen / Schlagen',d:'auch Panzer-Kanone und MG',v:null,def:['Mouse0','']},
 aim:{n:'Zielen',d:'bei Fluggeräten: Raketen',v:null,def:['Mouse2','']},
 reload:{n:'Nachladen',d:'',v:'KeyR',def:['KeyR','']},
 wheel:{n:'Waffenrad',d:'gedrückt halten',v:'Tab',def:['Tab','']},
 wnext:{n:'Nächste Waffe',d:'das Mausrad geht immer',v:null,def:['','']},
 wprev:{n:'Vorherige Waffe',d:'',v:null,def:['','']},
 job:{n:'Nebenjob starten',d:'Taxi, Polizei, Rettungswagen',v:'KeyF',def:['KeyF','']},
 horn:{n:'Hupen',d:'',v:'KeyH',def:['KeyH','']},
 radio:{n:'Radiosender wechseln',d:'im Fahrzeug',v:'KeyQ',def:['KeyQ','']},
 map:{n:'Große Karte',d:'',v:'KeyM',def:['KeyM','']},
 pause:{n:'Pausemenü',d:'Esc geht immer',v:'KeyP',def:['KeyP','']},
 time:{n:'Zeit vorspulen',d:'gedrückt halten',v:'KeyT',def:['KeyT','']},
};
const ACT_IDS=Object.keys(ACTS);
let KB={},KBMAP={},KLBL={},KB_DEF=true;
const RESERVED=new Set(['Escape','MetaLeft','MetaRight','OSLeft','OSRight','ContextMenu']);
const GUARDED=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftRight']);
for(const a of ACT_IDS){for(const c of ACTS[a].def)if(c)GUARDED.add(c);if(ACTS[a].v)GUARDED.add(ACTS[a].v);}
const KN={Space:'Leertaste',ShiftLeft:'Shift',ShiftRight:'Shift rechts',ControlLeft:'Strg',ControlRight:'Strg rechts',AltLeft:'Alt',AltRight:'Alt Gr',Tab:'Tab',CapsLock:'Feststell',Enter:'Enter',NumpadEnter:'Num Enter',Backspace:'Rücktaste',Escape:'Esc',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',
 Mouse0:'Linksklick',Mouse1:'Mausrad-Klick',Mouse2:'Rechtsklick',Mouse3:'Maustaste 4',Mouse4:'Maustaste 5',Backquote:'^',Minus:'ß',Equal:'´',BracketLeft:'Ü',BracketRight:'+',Semicolon:'Ö',Quote:'Ä',Backslash:'#',Comma:',',Period:'.',Slash:'-',IntlBackslash:'<',
 Insert:'Einfg',Delete:'Entf',Home:'Pos1',End:'Ende',PageUp:'Bild ↑',PageDown:'Bild ↓'};
kbLoad();

// ---------- Controller-Belegung ----------
const PADN_X=['A','B','X','Y','LB','RB','LT','RT','Back','Start','L3','R3','D-Pad ↑','D-Pad ↓','D-Pad ←','D-Pad →','Home'];
const PADN_PS=['✕','○','□','△','L1','R1','L2','R2','Share','Options','L3','R3','↑','↓','←','→','PS'];
const PADG={foot:'Zu Fuß',car:'Fahrzeug',air:'Fliegen',all:'Allgemein'};
const PADA={
 foot:[['jump','Springen'],['sprint','Sprinten'],['use','Einsteigen / Benutzen'],['reload','Nachladen'],['aim','Zielen'],['fire','Schießen / Schlagen'],['wheel','Waffenrad (halten)'],['wnext','Nächste Waffe'],['job','Nebenjob starten']],
 car:[['gas','Gas'],['brake','Bremse / Rückwärts'],['hand','Handbremse'],['use','Aussteigen'],['horn','Hupe'],['radio','Radiosender'],['job','Nebenjob starten'],['fire','Kanone (Panzer)']],
 air:[['up','Heli: steigen · Flugzeug: Schub'],['down','Heli: sinken · Flugzeug: bremsen'],['use','Aussteigen / Abspringen'],['fire','MG'],['aim','Raketen']],
 all:[['pause','Pausemenü'],['map','Karte']]};
const PAD_DEF={foot:{jump:2,sprint:0,use:3,reload:1,aim:6,fire:7,wheel:4,wnext:5,job:-1},car:{gas:7,brake:6,hand:5,use:3,horn:10,radio:15,job:12,fire:0},air:{up:7,down:6,use:3,fire:5,aim:4},all:{pause:9,map:8}};
let PADB={};
