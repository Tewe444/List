'use strict';
// Zusatzfunktionen: Autospeichern mit Anzeige, Auto-Pause, Bildraten-Limit.
(function(){
const ind=document.getElementById('saveInd');let t=0;
function flash(){ind.classList.add('on');clearTimeout(t);t=setTimeout(()=>ind.classList.remove('on'),1800);}
// saveGame des Spiels erweitern, sobald es geladen ist
const hook=setInterval(()=>{if(typeof saveGame==='function'&&!saveGame.__ps){const o=saveGame;const w=function(){const r=o.apply(this,arguments);flash();return r;};w.__ps=1;window.saveGame=w;clearInterval(hook);}},1000);
setInterval(()=>{if(PSStore.get('autosave')&&typeof mode!=='undefined'&&mode==='play'&&typeof saveGame==='function'){try{saveGame(true);}catch(e){}}},60000);
// Auto-Pause beim Tab-Wechsel
document.addEventListener('visibilitychange',()=>{if(document.hidden&&PSStore.get('autoPause')&&typeof mode!=='undefined'&&mode==='play'&&typeof openPause==='function'){try{openPause();}catch(e){}}});
// Schutz vor versehentlichem Schließen (Strg+W): Browser fragt nach, im Vollbild (F11) wird Strg+W ganz abgefangen
addEventListener('beforeunload',e=>{if(typeof mode!=='undefined'&&mode!=='title'&&mode!=='creator'){e.preventDefault();e.returnValue='';}});
function lockKeys(){try{if(document.fullscreenElement&&navigator.keyboard&&navigator.keyboard.lock)navigator.keyboard.lock(['KeyW','KeyT','KeyN']).catch(()=>{});}catch(e){}}
document.addEventListener('fullscreenchange',lockKeys);
addEventListener('keydown',e=>{
 if((e.ctrlKey||e.metaKey)&&(e.code==='KeyW'||e.code==='KeyT'||e.code==='KeyN')){e.preventDefault();}
 if(e.code==='F11'){e.preventDefault();try{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().then(lockKeys).catch(()=>{});}catch(err){}}
},true);
// Bildraten-Limit (pro Callback, damit sich Schleifen nicht stören)
const raf=window.requestAnimationFrame.bind(window),lastBy=new WeakMap();let capV=0,capT=0;
const getCap=()=>{const n=performance.now();if(n-capT>1000){capT=n;capV=+PSStore.get('fpsCap')||0;}return capV;}; // nicht jedes Bild localStorage lesen
window.requestAnimationFrame=cb=>raf(ts=>{const cap=getCap();if(cap){const l=lastBy.get(cb)||0;if(ts-l<1000/cap-3)return window.requestAnimationFrame(cb);lastBy.set(cb,ts);}cb(ts);});
})();
