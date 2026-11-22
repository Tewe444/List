'use strict';
// Lädt die 3D-Engine und danach alle Spielteile der Reihe nach (klassische Skripte teilen sich den globalen Scope).
(function(){
const ADDONS=['postprocessing/EffectComposer.js','postprocessing/RenderPass.js','postprocessing/UnrealBloomPass.js','postprocessing/OutputPass.js','postprocessing/ShaderPass.js','objects/Sky.js','utils/BufferGeometryUtils.js'];
const SOURCES=[
 {three:'vendor/three/three.module.js',add:p=>`vendor/three/examples/jsm/${p}`}, // optional: lokale Kopie für Offline-Betrieb
 {three:'https://cdn.jsdelivr.net/npm/three@0.160.0/+esm',add:p=>`https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/${p}/+esm`},
 {three:'https://esm.sh/three@0.160.0',add:p=>`https://esm.sh/three@0.160.0/examples/jsm/${p}`},
 {three:'https://unpkg.com/three@0.160.0/build/three.module.js?module',add:p=>`https://unpkg.com/three@0.160.0/examples/jsm/${p}?module`},
];
const PARTS=["funktionen-01.js", "funktionen-02.js", "funktionen-03.js", "funktionen-04.js", "funktionen-05.js", "funktionen-06.js", "funktionen-07.js", "funktionen-08.js", "funktionen-09.js", "funktionen-10.js", "funktionen-11.js", "funktionen-12.js", "funktionen-13.js", "funktionen-14.js", "main-01.js", "main-02.js", "main-03.js", "main-04.js", "main-05.js", "main-06.js", "main-07.js", "voices.js", "landmarks.js", "epilogue.js", "perf.js", "sfx.js", "physics.js"].map(n=>'js/game/'+n);
const bar=p=>{const i=document.querySelector('#loadbar i');if(i)i.style.width=Math.round(p*100)+'%';};
const loadScript=src=>new Promise((ok,fail)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=ok;s.onerror=()=>fail(new Error('Datei fehlt: '+src));document.head.appendChild(s);});
window.__bootGame=async function(startMode='new'){
 if(window.__booted){if(startMode==='continue'&&window.__continue)window.__continue();else if(window.__openCreator)window.__openCreator();return;}
 if(window.__booting)return;
 window.__booting=true;window.startMode=startMode;if(window.SGIntro)SGIntro.start();
 __status(startMode==='continue'?'Spielstand wird geladen …':'Spielwelt wird vorbereitet …');bar(.03);
 try{
  let ok=null;
  for(const src of SOURCES){
   try{
    const m=await Promise.all([import(src.three),...ADDONS.map(p=>import(src.add(p)))]);
    const t=m[0];if(!(t.WebGLRenderer&&m[1].EffectComposer&&m[6].Sky&&m[7].mergeGeometries))continue;
    ok=m;ok.src=src;break;
   }catch(e){console.warn('Quelle fehlgeschlagen:',src.three,e);}
  }
  if(!ok){__status('Die 3D-Engine konnte nicht geladen werden. Bitte Internetverbindung prüfen und die Seite über einen Webserver öffnen (nicht in einer Vorschau).',true);window.__booting=false;bar(0);if(window.SGIntro)SGIntro.abort();return;}
  Object.assign(window,{THREE:ok[0],EffectComposer:ok[1].EffectComposer,RenderPass:ok[2].RenderPass,UnrealBloomPass:ok[3].UnrealBloomPass,OutputPass:ok[4].OutputPass,ShaderPass:ok[5].ShaderPass,Sky:ok[6].Sky,mergeGeometries:ok[7].mergeGeometries});
  // glTF-Lader für Blender-Modelle (optional: fehlt er, startet das Spiel trotzdem)
  try{const gm=await import(ok.src.add('loaders/GLTFLoader.js'));window.GLTFLoader=gm.GLTFLoader;}catch(e){console.warn('GLTFLoader nicht verfügbar – Wahrzeichen werden übersprungen.',e);}
  bar(.15);__status('Stadt wird gebaut …');
  for(let i=0;i<PARTS.length;i++){await loadScript(PARTS[i]);bar(.15+.85*(i+1)/PARTS.length);}
  // Admin-Werkzeuge nur mit Dev-Key laden (Cookie oder localStorage PORT_SOLARA_DEV).
  try{if(typeof window.devCookieEnabled==="function"&&window.devCookieEnabled())await loadScript("js/game/admin.js");}catch(e){console.warn("Admin-Modul nicht geladen:",e);}
  if(!window.__booted)throw new Error('Start nicht abgeschlossen – bitte Konsole prüfen.');
  if(window.SGIntro)SGIntro.done();
 }catch(err){
  window.__booting=false;console.error('Port Solara konnte nicht gestartet werden:',err);
  __status('Fehler beim Laden: '+(err&&err.message||String(err)),true);bar(0);if(window.SGIntro)SGIntro.abort();
  const t=document.getElementById('title');if(t)t.style.display='flex';
 }
};
if(window.__startMode){const r=window.__startMode;window.__startMode=null;window.__bootGame(r);}
})();
