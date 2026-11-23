'use strict';
// PORT SOLARA – echte Sprachaufnahmen (ElevenLabs) für NPCs und Story-Dialoge.
// Dateien: assets/voices/manifest.json (erzeugt von tools/elevenlabs_voices.py). Ohne Aufnahmen bleibt alles wie vorher (Computerstimme, falls eingeschaltet).
(function(){
const VO=window.VO={man:null,buffers:new Map(),loading:new Map(),active:0,story:null,suppressTTS:false,slots:{male:[],female:[],rare:[]}};
const BASE='assets/voices/';
const FALLBACK={carNear:'bump',carHit:'hurt',shotNear:'flee',chatter:'greet',copArrest:'cop'};

fetch(BASE+'manifest.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(m=>{
 if(!m||!m.npc)return;VO.man=m;
 for(const [k,v] of Object.entries(m.npc)){if(v.rare)VO.slots.rare.push(k);else if(v.gender==='female')VO.slots.female.push(k);else VO.slots.male.push(k);}
 const n=Object.values(m.npc).reduce((a,v)=>a+Object.values(v.cats).reduce((b,c)=>b+c.length,0),0);
 console.info(`[Stimmen] ${n} NPC-Aufnahmen, ${Object.keys(m.story||{}).length} Story-Aufnahmen geladen.`);
}).catch(()=>{});

function fnv1a(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return ('0000000'+h.toString(16)).slice(-8);}
const enabled=()=>VO.man&&SET.npcVoices!==0&&SET.npcVoices!==false&&typeof AC!=='undefined'&&AC;

function load(url){
 if(VO.buffers.has(url))return Promise.resolve(VO.buffers.get(url));
 if(VO.loading.has(url))return VO.loading.get(url);
 const p=fetch(BASE+url).then(r=>{if(!r.ok)throw new Error(r.status);return r.arrayBuffer();}).then(b=>new Promise((ok,no)=>AC.decodeAudioData(b,ok,no))).then(buf=>{
  VO.buffers.set(url,buf);VO.loading.delete(url);if(VO.buffers.size>160){const first=VO.buffers.keys().next().value;VO.buffers.delete(first);}return buf;})
  .catch(e=>{VO.loading.delete(url);throw e;});
 VO.loading.set(url,p);return p;}

// Abspielen: räumlich (Lautstärke nach Entfernung, Stereo nach Richtung), optional Funk-/Telefonfilter
function play(url,o={}){
 if(!enabled())return false;
 if(!o.force&&VO.active>=3)return false;
 VO.active++;
 load(url).then(buf=>{
  if(AC.state!=='running'){VO.active--;return;}
  const src=AC.createBufferSource();src.buffer=buf;src.playbackRate.value=o.rate||1;
  const g=AC.createGain();let vol=(SET.voiceVol??.9)*(o.vol??1);let node=src;
  if(o.pos){const d=o.pos.distanceTo(camera.position);if(d>48){VO.active--;return;}vol*=Math.max(.12,1-d/48);
   if(AC.createStereoPanner){const pn=AC.createStereoPanner();const r=new THREE.Vector3().subVectors(o.pos,camera.position).applyQuaternion(camera.quaternion.clone().invert());pn.pan.value=clamp(r.x/Math.max(4,Math.hypot(r.x,r.z)),-.85,.85);node.connect(pn);node=pn;}}
  if(o.radio){const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1700;bp.Q.value=.9;node.connect(bp);node=bp;vol*=1.4;}
  g.gain.value=vol;node.connect(g);g.connect(sfxOut);
  src.onended=()=>{VO.active=Math.max(0,VO.active-1);if(o.onend)o.onend();};
  src.start();if(o.keep)o.keep(src);
 }).catch(()=>{VO.active=Math.max(0,VO.active-1);});
 return true;}

// Jedem NPC fest eine Stimme zuordnen: Frauen weibliche Stimmen, selten die englische Stimme mit indischem Akzent
function slotFor(n){
 if(n.voSlot!==undefined)return n.voSlot;
 const S=VO.slots;let slot=null;
 const female=n.c&&n.c.sk&&n.c.sk.koerper===1&&n.kind!=='cop';
 if(!female&&n.kind==='civ'&&S.rare.length&&Math.random()<.05)slot=pick(S.rare);
 else if(female&&S.female.length)slot=pick(S.female);
 else if(S.male.length)slot=pick(S.male);
 n.voSlot=slot;return slot;}
// Sprache der NPC-Stimmen (Einstellung): Englisch nutzt npc_en, fehlt dort etwas, wird auf Deutsch zurückgegriffen
function clipIn(folder,slot,cat){const tbl=VO.man[folder];const v=tbl&&tbl[slot];if(!v)return null;let list=v.cats[cat];if(!list||!list.length)list=v.cats[FALLBACK[cat]];if(!list||!list.length)return null;return folder+'/'+slot+'/'+pick(list);}
function clipFor(slot,cat){
 const rare=VO.man.npc[slot]&&VO.man.npc[slot].rare;
 if(SET.voiceLang==='en'&&!rare&&VO.man.npc_en){
  let c=clipIn('npc_en',slot,cat);if(c)return c;
  const g=VO.man.npc[slot]&&VO.man.npc[slot].gender;const alt=Object.keys(VO.man.npc_en).filter(k=>VO.man.npc_en[k].gender===g);
  for(const k of alt){c=clipIn('npc_en',k,cat);if(c)return c;}}
 return clipIn('npc',slot,cat);}

function sayClip(n,cat,o={}){
 if(!enabled()||!n||!n.c||!n.c.g)return false;if(mode!=='play'&&mode!=='cine')return false;
 const slot=slotFor(n);if(!slot)return false;const url=clipFor(slot,cat);if(!url)return false;
 if(n.voRate==null)n.voRate=RR(.95,1.06);
 return play(url,{pos:n.c.g.position,rate:n.voRate,force:o.force,vol:o.vol});}
VO.sayClip=sayClip;

// npcSay: erst Aufnahme versuchen, sonst wie bisher die Computerstimme
const _npcSay=npcSay;
npcSay=function(n,cat,prio=0){
 if(enabled()&&n&&(n.sayT||0)<=time){if(sayClip(n,cat,{force:prio>=2})){n.sayT=time+RR(4,8);return;}}
 return _npcSay.apply(this,arguments);};

// Story-Dialoge: speakAs(who,text) -> Aufnahme mit gleichem Schlüssel wie im Generator
const _speakAs=speakAs;
speakAs=function(who,text){
 if(enabled()&&VO.man.story){const role=String(who).replace(/\s*\(.*\)/,'').trim();const t=String(text).replace(/<[^>]+>/g,'').trim();
  const url=VO.man.story[fnv1a(role+'|'+t)];
  if(url){if(VO.story){try{VO.story.stop();}catch(e){}VO.story=null;}
   if(play(url,{force:true,radio:/\((Telefon|Funk)\)/.test(who),keep:s=>VO.story=s}))return;}}
 return _speakAs.apply(this,arguments);};

// Neue Reaktionen: angefahren, knapp verfehlt, Schüsse in der Nähe, Smalltalk
const _knockOut=knockOut;
knockOut=function(n,dir,force){
 const wasUp=n&&n.state!=='ko'&&n.state!=='fly';const r=_knockOut.apply(this,arguments);
 if(wasUp&&enabled()&&n.kind!=='dummy'){const car=P.inCar;const byCar=car&&Math.abs(car.speed||0)>4&&car.pos.distanceTo(n.c.g.position)<9;
  sayClip(n,byCar?'carHit':'hurt',{force:true});}
 return r;};
const _shotNoise=shotNoise;
shotNoise=function(p){const r=_shotNoise.apply(this,arguments);
 if(enabled()&&mode==='play'&&time>(VO.shotT||0)){VO.shotT=time+RR(1.2,2.5);let said=0;
  for(const n of peds){if(said>=2)break;if(n.kind!=='civ'||n.state==='ko'||n.state==='fly'||n.mission||(n.sayT||0)>time)continue;
   if(n.c.g.position.distanceTo(p)<26&&Math.random()<.5){if(sayClip(n,'shotNear')){n.sayT=time+RR(4,8);said++;}}}}
 return r;};

let tickT=0;
function voTick(){requestAnimationFrame(voTick);
 if(!enabled()||mode!=='play'||P.dead)return;const now=performance.now();if(now<tickT)return;tickT=now+150;
 const car=P.inCar;
 if(car&&Math.abs(car.speed||0)>9){const cp=car.pos;
  for(const n of peds){if(n.kind!=='civ'||n.state==='ko'||n.state==='fly'||(n.sayT||0)>time)continue;const d=n.c.g.position.distanceTo(cp);
   if(d<7.5&&d>2.2){if(sayClip(n,'carNear')){n.sayT=time+RR(5,9);break;}}}}
 else if(!car&&time>(VO.chatT||0)){VO.chatT=time+RR(5,10);
  for(const n of peds){if(n.kind!=='civ'||n.mission||n.aggro||(n.state!=='idle'&&n.state!=='walk'&&n.state!=='wait')||(n.sayT||0)>time)continue;
   if(n.c.g.position.distanceTo(P.pos)<5&&Math.random()<.35){if(sayClip(n,'chatter',{vol:.75})){n.sayT=time+RR(10,18);break;}}}}}
requestAnimationFrame(voTick);
})();
