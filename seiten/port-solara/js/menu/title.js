'use strict';
// Hauptmenü: Liste mit Tastatur-, Maus- und Controller-Steuerung.
(function(){
const root=document.getElementById('title'),nav=document.getElementById('tmenu');let sel=0,items=[];
const hasSave=()=>{try{return !!localStorage.getItem('portsolara_save_v1');}catch(e){return false;}};
function saveInfo(){try{const d=JSON.parse(localStorage.getItem('portsolara_save_v1'));return d&&d.name?d.name+' · $'+(d.money||0):'';}catch(e){return '';}}
function build(){
 items=[];
 if(hasSave())items.push({t:'Weiterspielen',s:saveInfo(),f:()=>__cont()});
 items.push({t:'Neues Spiel',f:()=>__go()},
  {t:'Spielstände',f:()=>openSettings('sav')},
  {t:'Einstellungen',f:()=>openSettings('gfx')},
  {t:'Radio & Musik',f:()=>window.__togglePlaylistDock&&window.__togglePlaylistDock(true)});
 nav.innerHTML='';
 items.forEach((it,i)=>{const b=document.createElement('button');b.className='tm';b.setAttribute('role','menuitem');
  b.innerHTML=it.t+(it.s?'<small>'+it.s.replace(/[<>&]/g,'')+'</small>':'');
  b.onmouseenter=()=>mark(i);b.onclick=()=>{mark(i);it.f();};nav.appendChild(b);});
 mark(Math.min(sel,items.length-1));
}
function mark(i){sel=i;[...nav.children].forEach((b,j)=>b.classList.toggle('sel',j===i));}
const visible=()=>root.style.display!=='none'&&getComputedStyle(root).display!=='none'&&!document.getElementById('gset').style.display.includes('flex')&&!(document.getElementById('playlistDock')||{}).classList?.contains('open');
function act(k){if(!visible())return;
 if(k==='up'||k==='ArrowUp')mark((sel+items.length-1)%items.length);
 else if(k==='down'||k==='ArrowDown')mark((sel+1)%items.length);
 else if(k==='ok'||k==='Enter')items[sel].f();}
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','Enter'].includes(e.key)&&visible()){const t=e.target;if(t&&/INPUT|SELECT|TEXTAREA/.test(t.tagName))return;e.preventDefault();act(e.key);}});
PSPad.on(act);
window.addEventListener('storage',build);window.addEventListener('focus',build);
window.__rebuildTitleMenu=build;build();
})();
