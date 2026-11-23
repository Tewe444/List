'use strict';
// PORT SOLARA – echte Soundeffekte (Kenney.nl, CC0) statt Synthesizer-Töne: Menü-Klicks, Geld, Schläge, Crashs, Glas, Schritte.
// Fehlt eine Datei oder ist Audio nicht bereit, laufen automatisch die alten Töne weiter.
(function(){
const BASE='assets/sfx/';
const SET_={ui:['click_001','click_002','click_003','click_004'],err:['error_001'],cash:['handleCoins','handleCoins2','chips-handle-1','chips-handle-2','chips-handle-3'],
 punch:['impactPunch_medium_000','impactPunch_medium_001','impactPunch_medium_002','impactPunch_medium_003','impactPunch_medium_004'],punchBig:['impactPunch_heavy_000','impactPunch_heavy_001','impactPunch_heavy_002'],
 crash:['impactMetal_heavy_000','impactMetal_heavy_001','impactMetal_heavy_002','impactMetal_heavy_003','impactMetal_heavy_004','impactPlate_heavy_000','impactPlate_heavy_001','impactPlate_heavy_002'],
 glass:['impactGlass_heavy_000','impactGlass_heavy_001','impactGlass_heavy_002','impactGlass_heavy_003'],
 stepC:[0,1,2,3,4].map(i=>'footstep_concrete_00'+i),stepG:[0,1,2,3,4].map(i=>'footstep_grass_00'+i),stepW:[0,1,2,3,4].map(i=>'footstep_wood_00'+i)};
const buf=new Map(),loading=new Set();
function load(n){if(buf.has(n)||loading.has(n)||!AC)return;loading.add(n);fetch(BASE+n+'.ogg').then(r=>r.ok?r.arrayBuffer():Promise.reject(r.status)).then(b=>AC.decodeAudioData(b)).then(a=>buf.set(n,a)).catch(()=>buf.set(n,null)).finally(()=>loading.delete(n));}
function preload(){if(typeof AC==='undefined'||!AC)return false;for(const k in SET_)for(const n of SET_[k])load(n);return true;}
const pre=setInterval(()=>{if(preload())clearInterval(pre);},1000);
let last={};
function play(kind,o={}){if(typeof AC==='undefined'||!AC||AC.state!=='running')return false;const list=SET_[kind];if(!list)return false;
 const now=performance.now();if(o.gap&&now-(last[kind]||0)<o.gap)return true;last[kind]=now;
 const n=list[Math.floor(Math.random()*list.length)],b=buf.get(n);if(!b){load(n);return false;}
 let vol=o.vol??1;if(o.pos){const d=o.pos.distanceTo(camera.position);if(d>70)return true;vol*=Math.max(.08,1-d/70);}
 const s=AC.createBufferSource();s.buffer=b;s.playbackRate.value=(o.rate??1)*(0.94+Math.random()*.12);const g=AC.createGain();g.gain.value=vol;s.connect(g);g.connect(o.ui?(typeof musicOut!=='undefined'?sfxOut:sfxOut):sfxOut);s.start();return true;}
window.SFX={play};

// ---------- in die bestehenden Sound-Funktionen einhängen ----------
const _ui=uiClick;uiClick=function(){if(play('ui',{vol:.5,gap:40}))return;return _ui.apply(this,arguments);};
const _cash=cashSound;cashSound=function(){if(play('cash',{vol:.8,gap:80}))return;return _cash.apply(this,arguments);};
const _crash=crashSound;crashSound=function(v){const r=_crash.apply(this,arguments);if((v||0)>3)play('crash',{vol:Math.min(1,.25+(v||0)*.03),gap:120,pos:P.inCar?null:undefined});return r;};
const _foot=footstep;footstep=function(run){const x=P.pos.x,z=P.pos.z;
 const pier=Math.abs(x-PIERX)<7&&z>WATER_Z-12,city=Math.abs(x)<=HALF+ROAD&&Math.abs(z)<=HALF+ROAD;
 const ok=play(pier?'stepW':city?'stepC':'stepG',{vol:run?.55:.35,rate:run?1.08:1});if(ok)return;return _foot.apply(this,arguments);};
// Nahkampf-Treffer bekommen einen echten Schlag-Sound
const _dmg=damageNPC;damageNPC=function(n,dmg,dir,src){const w=typeof curW==='function'?curW():null;const r=_dmg.apply(this,arguments);
 if(src==='player'&&w&&w.melee&&n&&n.c)play(dmg>=50?'punchBig':'punch',{pos:n.c.g.position,vol:.9,gap:60});return r;};
})();
