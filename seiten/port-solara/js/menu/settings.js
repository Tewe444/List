'use strict';
// Einstellungen (Reiter) und Spielstand-Slots.
(function(){
const g=document.getElementById('gset'),tabs=[...document.querySelectorAll('#gsTabs button')],panels=[...document.querySelectorAll('.gs-panel')];
const isOpen=()=>g.style.display==='flex';
function tab(p){tabs.forEach(b=>b.classList.toggle('on',b.dataset.p===p));panels.forEach(x=>x.classList.toggle('on',x.dataset.p===p));if(p==='sav')renderSlots();}
function sync(){g.querySelectorAll('[data-key]').forEach(el=>{const k=el.dataset.key,v=PSStore.get(k);
 if(el.type==='checkbox')el.checked=!!v;else if(el.type==='range'){el.value=v*(+el.dataset.scale||1);}else el.value=v;upd(el);});}
function upd(el){const o=el.parentNode.querySelector('.gval');if(o&&el.type==='range')o.textContent=Math.round(el.value)+' %';}
g.addEventListener('input',e=>{const el=e.target;if(!el.dataset||!el.dataset.key)return;
 let v=el.type==='checkbox'?el.checked:el.type==='range'?el.value/(+el.dataset.scale||1):+el.value;PSStore.set(el.dataset.key,v);upd(el);});
window.openSettings=function(p){g.style.display='flex';tab(p||'gfx');if(window.__gfxRefresh)__gfxRefresh();sync();};
function close(){g.style.display='none';if(window.__rebuildTitleMenu)__rebuildTitleMenu();}
window.__openGraphicsMenu=()=>openSettings('gfx');window.__closeGraphicsMenu=close;
tabs.forEach(b=>b.onclick=()=>tab(b.dataset.p));
document.getElementById('gsClose').onclick=close;document.getElementById('gsBack').onclick=close;
window.addEventListener('keydown',e=>{if(isOpen()&&e.key==='Escape'&&!document.getElementById('playlistDock').classList.contains('open')){e.stopImmediatePropagation();e.preventDefault();close();}},true);
PSPad.on(k=>{if(!isOpen())return;const i=tabs.findIndex(b=>b.classList.contains('on'));
 if(k==='back')close();else if(k==='rb'||k==='right')tab(tabs[(i+1)%tabs.length].dataset.p);else if(k==='lb'||k==='left')tab(tabs[(i+tabs.length-1)%tabs.length].dataset.p);});
// ----- Spielstände -----
const MAIN='portsolara_save_v1',slotKey=n=>'portsolara_slot_'+n,note=t=>document.getElementById('gsNote').textContent=t;
const rd=k=>{try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}};
function renderSlots(){const box=document.getElementById('slotList');box.innerHTML='';const main=localStorage.getItem(MAIN);
 for(let n=1;n<=3;n++){const s=rd(slotKey(n)),d=s&&rd(slotKey(n)).save?JSON.parse(s.save):null;
  const row=document.createElement('div');row.className='slot';
  row.innerHTML='<b>SLOT '+n+'</b><span>'+(d?(String(d.name||'Spieler').replace(/[<>&]/g,'')+' · $'+(d.money||0)+' · '+new Date(s.ts).toLocaleString('de-DE')):'Leer')+'</span>';
  const bs=btn('SPEICHERN',()=>{localStorage.setItem(slotKey(n),JSON.stringify({ts:Date.now(),save:main}));note('In Slot '+n+' gespeichert.');renderSlots();});bs.disabled=!main;
  const bl=btn('LADEN',()=>{if(!confirm('Slot '+n+' laden? Der aktuelle Stand wird überschrieben.'))return;localStorage.setItem(MAIN,s.save);
   if(window.__booted)location.reload();else{close();__cont();}});bl.disabled=!d;
  const bd=btn('✕',()=>{localStorage.removeItem(slotKey(n));renderSlots();});bd.disabled=!d;
  row.append(bs,bl,bd);box.appendChild(row);}}
function btn(t,f){const b=document.createElement('button');b.className='gs-btn';b.textContent=t;b.onclick=f;return b;}
document.getElementById('slotExport').onclick=()=>{const m=localStorage.getItem(MAIN);if(!m){note('Kein Spielstand zum Exportieren vorhanden.');return;}
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([m],{type:'application/json'}));a.download='port-solara-spielstand.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);};
const fi=document.getElementById('slotFile');document.getElementById('slotImport').onclick=()=>fi.click();
fi.onchange=()=>{const f=fi.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d||!d.prog)throw 0;
 localStorage.setItem(MAIN,r.result);note('Spielstand importiert – jetzt „Weiterspielen“ wählen.');if(window.__rebuildTitleMenu)__rebuildTitleMenu();}catch(e){note('Datei ist kein gültiger Spielstand.');}fi.value='';};r.readAsText(f);};
})();
