'use strict';
// SoundCloud-Radio-Einstellungen im Hauptmenü (vor dem Spielstart). Gleiches Speicherformat wie im Spiel.
(function(){
const $=id=>document.getElementById(id),KEY='portsolara_radio_v3';
const load=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'null');if(v&&Array.isArray(v.stations))return v;}catch(e){}
 return {stations:Array.from({length:5},(_,i)=>({name:'SoundCloud '+(i+1),url:''})),consentSC:false};};
const status=t=>{const e=$('plStatus');if(e)e.textContent=t;};
function norm(raw){let u;try{u=new URL(raw.trim());}catch(e){return null;}
 if(!/(^|\.)soundcloud\.com$/i.test(u.hostname)||u.hostname.toLowerCase()==='w.soundcloud.com')return null;
 if(u.pathname==='/'||u.pathname.length<2)return null;return u.origin+u.pathname;}
function fill(){const s=load();for(let i=0;i<5;i++){const d=s.stations[i]||{};const n=$('radioStationName'+i),u=$('radioStationUrl'+i);
 if(n)n.value=d.name||('SoundCloud '+(i+1));if(u)u.value=d.url||'';}const c=$('plConsentSC');if(c)c.checked=!!s.consentSC;}
function save(){if(window.__booted)return; // im Spiel übernimmt der Spielcode
 const stations=[];for(let i=0;i<5;i++){const name=($('radioStationName'+i).value||'').trim().slice(0,24)||('SoundCloud '+(i+1));
  const raw=($('radioStationUrl'+i).value||'').trim(),url=raw?norm(raw):'';
  if(raw&&!url){status('Sender '+(i+1)+': Bitte einen gültigen SoundCloud-Track- oder Playlist-Link eingeben.');return;}stations.push({name,url});}
 const consent=$('plConsentSC').checked;
 if(stations.some(x=>x.url)&&!consent){status('Bitte bestätige den Hinweis zu Einbettungsrechten und erforderlichen Genehmigungen.');return;}
 try{localStorage.setItem(KEY,JSON.stringify({stations,consentSC:consent}));}catch(e){status('Speichern im Browser nicht möglich.');return;}
 status('Gespeichert – die fünf Sender sind im Spiel verfügbar (im Auto mit Q wechseln).');}
window.__togglePlaylistDock=function(open=true){const d=$('playlistDock');if(!d)return;d.classList.toggle('open',!!open);if(open)fill();};
$('saveRadioStations').addEventListener('click',save);
$('plClose').addEventListener('click',()=>{if(!window.__booted)window.__togglePlaylistDock(false);});
$('playlistDock').addEventListener('click',e=>{if(!window.__booted&&e.target===$('playlistDock'))window.__togglePlaylistDock(false);});
window.addEventListener('keydown',e=>{const d=$('playlistDock');if(!window.__booted&&e.key==='Escape'&&d.classList.contains('open')){e.stopImmediatePropagation();window.__togglePlaylistDock(false);}},true);
})();
