'use strict';
// Zusatzfunktionen: Autospeichern mit Anzeige, Auto-Pause, Bildraten-Limit.
(function(){
const ind=document.getElementById('saveInd');let t=0;
function flash(){ind.classList.add('on');clearTimeout(t);t=setTimeout(()=>ind.classList.remove('on'),1800);}
// saveGame des Spiels erweitern, sobald es geladen ist
const hook=setInterval(()=>{if(typeof saveGame==='function'&&!saveGame.__ps){const o=saveGame;const w=function(){const r=o.apply(this,arguments);flash();return r;};w.__ps=1;window.saveGame=w;clearInterval(hook);}},1000);
setInterval(()=>{if(PSStore.get('autosave')&&typeof mode!=='undefined'&&mode==='play'&&typeof saveGame==='function'){try{saveGame(true);}catch(e){}}},60000);
// Auto-Pause beim Tab-Wechsel
document.addEventListener('visibilitychange',()=>{if(document.hidden&&PSStore.get('autoPause')&&typeof mode!=='undefined'&&mode==='play'&&typeof openPause==='function'){try{openPause('map');}catch(e){}}});
// Bildraten-Limit (pro Callback, damit sich Schleifen nicht stören)
const raf=window.requestAnimationFrame.bind(window),lastBy=new WeakMap();
window.requestAnimationFrame=cb=>raf(ts=>{const cap=+PSStore.get('fpsCap');if(cap){const l=lastBy.get(cb)||0;if(ts-l<1000/cap-3)return window.requestAnimationFrame(cb);lastBy.set(cb,ts);}cb(ts);});
})();
