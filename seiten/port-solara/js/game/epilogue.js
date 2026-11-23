'use strict';
// PORT SOLARA – Epilog: drei Story-Missionen nach dem Finale, mit interaktiven Szenen (Entscheidungen).
// Modelle aus Blender: assets/models/boathouse.glb, courthouse.glb, visitor.glb (tools/blender/build_mission_models.py)
(function(){
const BH={x:-695,z:COAST+16};          // Bootshaus am Weststrand
const CH={x:0,z:-578};                 // Justizpalast nördlich der Innenstadt
const VY={x:860,z:-2925};              // Besucherhof vor der JVA Steinfeld
PROG.ep=PROG.ep||{};

// ---------- Modelle platzieren ----------
function setup(){
 if(!window.LMK)return;const L=LMK;
 L.load('boathouse').then(m=>{L.mergeByMaterial(m);L.shade(m);L.place(m,BH.x,groundY(BH.x,BH.z-2),BH.z,0);L.freeze(m);addSolid(BH.x-5.2,BH.x+5.2,BH.z-3.7,BH.z+3.7,6);L.CULL.push({obj:m,x:BH.x,z:BH.z,r:20});L.LM.push({name:'Altes Bootshaus',x:BH.x,z:BH.z,l:'B',c:'#d9a066'});}).catch(e=>console.warn('[Epilog] Bootshaus',e));
 L.load('courthouse').then(m=>{L.mergeByMaterial(m);L.shade(m);L.place(m,CH.x,groundY(CH.x,CH.z),CH.z,0);L.freeze(m);addSolid(CH.x-17,CH.x+17,CH.z-10,CH.z+10,16);L.CULL.push({obj:m,x:CH.x,z:CH.z,r:30});L.LM.push({name:'Justizpalast',x:CH.x,z:CH.z,l:'J',c:'#e8d6a0'});}).catch(e=>console.warn('[Epilog] Justizpalast',e));
 L.load('visitor').then(m=>{L.mergeByMaterial(m);L.shade(m);L.place(m,VY.x,groundY(VY.x,VY.z),VY.z,0);L.freeze(m);
  const x=VY.x,z=VY.z;addSolid(x-9,x+9,z-7.15,z-6.85,3.2);addSolid(x-9.15,x-8.85,z-7,z+7,3.2);addSolid(x+8.85,x+9.15,z-7,z+7,3.2);addSolid(x-9,x-2.2,z+6.85,z+7.15,3.2);addSolid(x+2.2,x+9,z+6.85,z+7.15,3.2);
  addSolid(x-2.5,x+2.5,z-.7,z+.7,1.1);addSolid(x-8,x-5,z-6,z-3,3);L.CULL.push({obj:m,x,z,r:14});}).catch(e=>console.warn('[Epilog] Besucherhof',e));}

// ---------- Figuren für die Szenen ----------
const PROPS=[];
function figure(sk,x,z,faceX,faceZ){const c=buildChar(sk);c.g.position.set(x,groundY(x,z),z);c.g.rotation.y=Math.atan2(faceX-x,faceZ-z);try{animChar(c,0);}catch(e){}scene.add(c.g);PROPS.push(c);return c;}
function clearProps(){for(const c of PROPS){scene.remove(c.g);try{c.dispose&&c.dispose();}catch(e){}}PROPS.length=0;}
const _cleanup=cleanupMission;cleanupMission=function(){clearProps();return _cleanup.apply(this,arguments);};
function skinOf(key){const n=typeof contactNpc!=='undefined'&&contactNpc[key];return n&&n.c&&n.c.sk?Object.assign({},n.c.sk):randomSkin();}

// ---------- Interaktive Szene: Dialog mit Entscheidungen ----------
const SC=window.SCENE={active:false};
const css=document.createElement('style');css.textContent=`
#scn{position:fixed;inset:0;z-index:60;display:none;pointer-events:auto;font-family:Segoe UI,Arial,sans-serif}
#scn .bar{position:absolute;left:0;right:0;height:11vh;background:#000}#scn .bar.t{top:0}#scn .bar.b{bottom:0}
#scn .box{position:absolute;left:50%;bottom:13vh;transform:translateX(-50%);width:min(760px,92vw);background:rgba(8,10,18,.88);border:1px solid #ffffff22;border-radius:12px;padding:16px 20px;color:#fff;box-shadow:0 8px 30px #000a}
#scn .who{color:#ffb35c;font-weight:800;margin-right:6px}#scn .txt{font-size:17px;line-height:1.45}
#scn .hint{margin-top:10px;font-size:12px;color:#ffffff80;text-align:right}
#scn .opts{display:flex;flex-direction:column;gap:8px;margin-top:12px}
#scn .opts button{text-align:left;padding:10px 14px;border-radius:9px;border:1px solid #ffffff30;background:#ffffff10;color:#fff;font:600 15px Segoe UI,Arial;cursor:pointer}
#scn .opts button:hover,#scn .opts button.sel{background:linear-gradient(90deg,#ff2d8f55,#ff9a3c40);border-color:#ff9a3c}
#scn .opts b{color:#ff9a3c;margin-right:8px}`;
document.head.appendChild(css);
const el=document.createElement('div');el.id='scn';el.innerHTML='<div class="bar t"></div><div class="bar b"></div><div class="box"><div class="txt"></div><div class="opts"></div><div class="hint"></div></div>';document.body.appendChild(el);
const txt=el.querySelector('.txt'),opts=el.querySelector('.opts'),hint=el.querySelector('.hint');
let waitFn=null,optList=null,sel=0;
const nm=w=>w==='P'?esc(P.name):esc(w);
const fill=t=>KT(t.replace(/\{n\}/g,esc(P.name)));
function showLine([w,t]){return new Promise(ok=>{opts.innerHTML='';optList=null;txt.innerHTML=`<span class="who">${nm(w)}:</span>${fill(t)}`;hint.textContent='Weiter: Leertaste / Klick';
 if(w!=='P'){try{speakAs(w,t.replace(/\{n\}/g,P.name));}catch(e){}}waitFn=()=>{waitFn=null;ok();};});}
function showChoice(list){return new Promise(ok=>{optList=list;sel=0;hint.textContent='Wähle mit 1–'+list.length+', Pfeiltasten + Enter oder per Klick';
 const draw=()=>{opts.innerHTML=list.map((o,i)=>`<button class="${i===sel?'sel':''}" data-i="${i}"><b>${i+1}</b>${fill(o.label)}</button>`).join('');};draw();optList.draw=draw;
 opts.onclick=e=>{const b=e.target.closest('button');if(b){pickOpt(+b.dataset.i);}};optList.done=i=>{optList=null;opts.innerHTML='';ok(list[i]);};});}
function pickOpt(i){if(!optList||i<0||i>=optList.length)return;uiClick&&uiClick();optList.done(i);}
el.addEventListener('click',e=>{if(e.target.closest('button'))return;if(waitFn)waitFn();});
addEventListener('keydown',e=>{if(!SC.active)return;if(e.code==='F12')return;e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;
 if(optList){const n=+e.key;if(n>=1&&n<=optList.length)return pickOpt(n-1);if(e.code==='ArrowDown'||e.code==='KeyS'){sel=(sel+1)%optList.length;optList.draw();}if(e.code==='ArrowUp'||e.code==='KeyW'){sel=(sel+optList.length-1)%optList.length;optList.draw();}if(e.code==='Enter'||e.code==='Space')pickOpt(sel);return;}
 if((e.code==='Space'||e.code==='Enter'||e.code==='KeyE')&&waitFn)waitFn();},true);
addEventListener('keyup',e=>{if(SC.active){e.stopImmediatePropagation();}},true);
const _op=openPause;openPause=function(){if(SC.active)return;return _op.apply(this,arguments);};
// Szene abspielen: Einträge sind ["Wer","Text"] oder {choice:[{label,then:[[...]],set(){}}]}
async function play(items){SC.active=true;el.style.display='block';try{clearKeys();}catch(e){}fireHeld=false;aimHeld=false;try{document.exitPointerLock&&document.exitPointerLock();}catch(e){}
 const hud=['dialog','tut'].map(id=>$(id)).filter(Boolean);hud.forEach(h=>h.style.visibility='hidden');
 const freeze=setInterval(()=>{try{clearKeys();}catch(e){}if(P.hp<40&&!P.dead)P.hp=40;},100);
 try{for(const it of items){if(Array.isArray(it))await showLine(it);else if(it.choice){const o=await showChoice(it.choice);if(o.set)o.set();if(o.then)for(const l of o.then)await showLine(l);}else if(typeof it==='function'){const more=it();if(more)for(const l of more)await showLine(l);}}}
 finally{clearInterval(freeze);SC.active=false;el.style.display='none';hud.forEach(h=>h.style.visibility='');try{lockMouse();}catch(e){}}}
SC.play=play;

// ---------- Epilog-Missionen ----------
const st1={},st2={},st3={};
missions.push(
 {name:'Epilog: Alte Schulden',contact:'mila',reward:5000,intro:[["Mila","Rocco hat angerufen. Er versteckt sich im alten Bootshaus am Weststrand."],["P","Rocco? Nach allem, was er getan hat?"],["Mila","Krakes letzte Leute sind hinter ihm her. Sie wollen sich rächen – an jedem, der geredet hat."],["Mila","Ob du ihm hilfst, ist deine Entscheidung, {n}."]],steps:[
  {type:'goto',r:12,pos:()=>({x:BH.x,z:BH.z-12}),text:'Fahr zum alten Bootshaus am Weststrand',onStart:()=>{clearProps();}},
  {type:'check',text:'Schalte Krakes letzte Leute am Bootshaus aus',say:['Rocco','{n}! Du bist gekommen … sie sind hier – hilf mir!'],
   onStart:()=>{st1.rocco=figure(skinOf('rocco'),BH.x+3.5,BH.z-5.2,BH.x,BH.z-15);mGroup=ring(BH.x,BH.z-14,{n:5,d:16,a:.6}).map(([x,z])=>{const n=spawnThug(x,z,true);n.mission=true;return n;});},check:()=>allDown(mGroup)},
  {type:'goto',r:3,pos:()=>({x:BH.x+3.5,z:BH.z-7.5}),text:'Sprich mit Rocco'},
  {type:'check',text:'Entscheide über Rocco',onStart:()=>{st1.done=false;setWanted(0);play([
    ["Rocco","Danke … ich dachte, diesmal erwischen sie mich wirklich."],["P","Du hast mich an Krake verkauft, Rocco."],
    ["Rocco","Ich weiß. Und ich weiß auch, dass ich keine zweite Chance verdient habe."],["Rocco","Also … was machst du jetzt mit mir?"],
    {choice:[
     {label:'„Verschwinde aus Port Solara. Für immer.“',set(){PROG.ep.rocco='frei';},then:[["Rocco","Für immer. Versprochen."],["Rocco","Mein Boot liegt hier am Steg. Bevor die Sonne untergeht, bin ich weg – und das hier ist alles, was ich noch habe. Nimm es."]]},
     {label:'„Du stellst dich – und sagst gegen Krakes Leute aus.“',set(){PROG.ep.rocco='polizei';},then:[["Rocco","… Okay. Vielleicht kann ich so wenigstens etwas wiedergutmachen."],["Rocco","Ruf sie an. Ich warte hier."]]}]}
   ]).then(()=>{if(PROG.ep.rocco==='frei'){P.money+=3000;cashSound();cashPop('+$3000');}st1.done=true;});},check:()=>st1.done}]},

 {name:'Epilog: Das Buch',contact:'prof',reward:8000,intro:[["Der Professor","Morgen beginnt Brandts Prozess. Aber die Zeitung traut sich nicht, Krakes Buch zu drucken."],["P","Dann bringen wir es direkt zum Gericht."],["Der Professor","Genau das. Brandts alte Kollegen werden versuchen, es zu verhindern."],["Der Professor","Das Buch liegt in meinem Wagen. Bring es zum Justizpalast – und lass dich nicht aufhalten."]],steps:[
  {type:'car',text:'Steig in ein Auto – das Buch ist dabei'},
  {type:'goto',r:12,car:true,pos:()=>({x:CH.x,z:CH.z+24}),text:'Bring Krakes Buch zum Justizpalast',say:['Der Professor (Funk)','Brandts Freunde haben Wind davon bekommen. Fahr, {n}!'],onStart:()=>{setWanted(Math.max(wanted,3));}},
  {type:'check',text:'Halte die Treppe, bis die Richterin das Buch hat',say:['Der Professor (Funk)','Raus aus dem Wagen – die Richterin holt das Buch. Gib ihr Deckung!'],
   onStart:()=>{st2.t=25;mGroup=[];for(let k=0;k<5;k++){const a=Math.PI*(.15+k*.175);mGroup.push(spawnCop(CH.x+Math.cos(a)*30,CH.z+20+Math.sin(a)*22));}},
   tick:dt=>{st2.t-=dt;setProg('Deckung geben',1-Math.max(0,st2.t)/25,'#ff5050');},check:()=>st2.t<=0||allCopsDown(mGroup)},
  {type:'check',text:'Entscheide: aussagen oder anonym bleiben',onStart:()=>{st2.done=false;setWanted(0);hideProg();
   figure(Object.assign(randomSkin(),{koerper:1,topC:0x16161a,pantsC:0x16161a}),CH.x-1.5,CH.z+17,P.pos.x,P.pos.z);
   figure(Object.assign(randomSkin(),{koerper:1,topC:0xc0392b}),CH.x+2.5,CH.z+19,P.pos.x,P.pos.z);
   play([["Richterin","Das Buch ist angekommen. Der Prozess gegen Kommissar Brandt kann beginnen."],
    ["Reporterin","Einen Moment! Sie sind die Person, die das Buch gebracht hat, oder?"],["Reporterin","Werden Sie vor Gericht aussagen?"],
    {choice:[
     {label:'„Ich sage aus. Die Stadt soll wissen, was passiert ist.“',set(){PROG.ep.buch='aussage';},then:[["Reporterin","Dann sehen wir uns morgen im Gerichtssaal – und auf der Titelseite."]]},
     {label:'„Ich war nie hier. Das Buch spricht für sich.“',set(){PROG.ep.buch='anonym';},then:[["Reporterin","Verstehe. Eine anonyme Quelle also."],["Reporterin","Port Solara wird nie erfahren, wem es danken muss."]]}]}
   ]).then(()=>{st2.done=true;});},check:()=>st2.done}]},

 {name:'Epilog: Besuch in Steinfeld',contact:'mila',reward:1000,intro:[["Mila","Die JVA Steinfeld hat angerufen. Teo will dich sehen."],["P","Nach zehn Jahren will er reden."],["Mila","Du musst nicht hingehen, {n}."],["P","Doch. Ich muss."]],steps:[
  {type:'goto',r:14,pos:()=>({x:VY.x,z:VY.z+14}),text:'Fahr zur JVA Steinfeld in der Wüste'},
  {type:'goto',r:1.8,pos:()=>({x:VY.x,z:VY.z+2.4}),text:'Setz dich an den Besuchertisch',onStart:()=>{clearProps();
   st3.teo=figure(Object.assign(randomSkin(),{koerper:0,extra:6,topC:0xff7a1a,pantsC:0xff7a1a}),VY.x,VY.z-1.9,VY.x,VY.z+5);}},
  {type:'check',text:'Sprich mit Teo',onStart:()=>{st3.done=false;setWanted(0);play([
    ["Teo","Du bist gekommen. Das hätte ich nicht gedacht."],
    {choice:[
     {label:'„Warum bist du gegangen?“',then:[["Teo","Krake wollte den Hafen. Ich hätte kämpfen können – aber ich hatte Angst um euch. Also bin ich verschwunden."],["Teo","Und dann war da die Wüste. Und das Geld. Irgendwann gab es keinen Weg zurück mehr."]]},
     {label:'„Wusstest du, dass ich es war – im Ölfeld?“',then:[["Teo","Ich hab dich an deiner Art zu fahren erkannt. So bin ich früher auch gefahren."],["Teo","Ich hab meinen Leuten gesagt, sie sollen nicht auf dich zielen. Nicht alle haben gehört."]]},
     {label:'„Ich habe keine Fragen.“',then:[["Teo","Das ist dein gutes Recht."]]}]},
    ["Teo","Ich erwarte nicht, dass du mir verzeihst."],
    {choice:[
     {label:'„Ich verzeihe dir. Nicht für dich – für mich.“',set(){PROG.ep.teo='verziehen';},then:[["Teo","… Danke, {n}."],["Teo","Sag Mila, dass es mir leidtut. Und Dusty soll Bessy behalten."]]},
     {label:'„Ich bin nur gekommen, um dich ein letztes Mal zu sehen.“',set(){PROG.ep.teo='abschied';},then:[["Teo","Dann ist das hier ein Abschied."],["Teo","Pass auf dich auf. Port Solara braucht jemanden wie dich – nicht wie mich."]]}]},
    ()=>[["Mila (Telefon)",PROG.ep.rocco==='frei'?'Übrigens: Rocco hat eine Postkarte geschickt. Aus dem Süden. Ohne Absender.':PROG.ep.rocco==='polizei'?'Übrigens: Roccos Aussage hat die letzten von Krakes Leuten hinter Gitter gebracht.':'Übrigens: Von Rocco hat niemand mehr etwas gehört.'],
     ["Mila (Telefon)",PROG.ep.buch==='aussage'?'Brandt hat zwölf Jahre bekommen. Dein Name stand auf jeder Titelseite.':'Brandt hat zwölf Jahre bekommen. Wer das Buch gebracht hat, weiß bis heute niemand – nur wir.'],
     ["Mila (Telefon)","Komm nach Hause, {n}. Die Werkstatt wartet. Und Port Solara auch."]]
   ]).then(()=>{st3.done=true;});},check:()=>st3.done}]}
);

// Alte Spielstände, deren Story schon fertig war: Epilog freischalten
setInterval(()=>{try{if(storyDone&&mi<missions.length&&!mission){storyDone=false;PROG.story=false;}}catch(e){}},2000);
setup();
console.info('[Epilog] 3 Missionen geladen (insgesamt '+missions.length+').');
})();
