'use strict';
// Gemeinsamer Einstellungs-Speicher (gleicher Schlüssel wie das Spiel) und Controller-Eingabe für die Menüs.
window.PSStore={
 KEY:'portsolara_settings',
 DEF:{ao:1,motionBlur:0,sens:1,npcVoices:1,voiceVol:.9,voiceLang:'de',music:.5,sfx:.8,voice:false,uiScale:1,reduceMotion:false,autosave:true,autoPause:true,autoSlowdown:true,fpsCap:0},
 read(){try{return JSON.parse(localStorage.getItem(this.KEY)||'{}')||{};}catch(e){return {};}},
 get(k,d){if(typeof SET!=='undefined'&&SET[k]!==undefined)return SET[k];const v=this.read()[k];return v===undefined?(d!==undefined?d:this.DEF[k]):v;},
 set(k,v){const o=this.read();o[k]=v;try{localStorage.setItem(this.KEY,JSON.stringify(o));}catch(e){}
  if(typeof SET!=='undefined'){SET[k]=v;if(typeof applyVolumes==='function'){try{applyVolumes();}catch(e){}}}this.apply();},
 apply(){document.documentElement.style.setProperty('--ui',this.get('uiScale'));document.body.classList.toggle('rm',!!this.get('reduceMotion'));}
};
PSStore.apply();
// Controller: D-Pad/Stick, A = OK, B = Zurück, LB/RB = Reiter wechseln
window.PSPad={handlers:[],prev:{},on(fn){this.handlers.push(fn);},
 poll(){const gp=(navigator.getGamepads?navigator.getGamepads():[])[0]||[...(navigator.getGamepads?navigator.getGamepads():[])].find(Boolean);if(!gp)return;
  const b=i=>gp.buttons[i]&&gp.buttons[i].pressed;
  const s={up:b(12)||gp.axes[1]<-.6,down:b(13)||gp.axes[1]>.6,left:b(14)||gp.axes[0]<-.6,right:b(15)||gp.axes[0]>.6,ok:b(0),back:b(1),lb:b(4),rb:b(5)};
  for(const k in s){if(s[k]&&!this.prev[k])this.handlers.forEach(h=>h(k));this.prev[k]=s[k];}}};
setInterval(()=>PSPad.poll(),90);
