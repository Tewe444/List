'use strict';
// Steuert die Sky-Games-Ladeanimation: start() beim Laden, done() wenn fertig, abort() bei Fehlern.
(function(){
const root=document.getElementById('sg-intro'),loader=document.getElementById('sg-loader'),plane=document.getElementById('sg-plane'),sun=document.getElementById('sg-sun'),rays=document.getElementById('sg-rays');
const ns='http://www.w3.org/2000/svg';
for(let k=0;k<16;k++){const a=k*Math.PI/8,m=k%2===0,r1=m?54:56,r2=m?76:68,l=document.createElementNS(ns,'line');
 l.setAttribute('x1',(Math.cos(a)*r1).toFixed(1));l.setAttribute('y1',(Math.sin(a)*r1).toFixed(1));
 l.setAttribute('x2',(Math.cos(a)*r2).toFixed(1));l.setAttribute('y2',(Math.sin(a)*r2).toFixed(1));rays.appendChild(l);}
const T_FLY=1800,T_PAUSE=500,T_GROW=2600,T_FADE=500,TOTAL=T_FLY+T_PAUSE+T_GROW,HOLD=700;
let t0=null,running=false,loaded=false,skip=false,timer=0;
const eo=t=>1-Math.pow(1-t,3),ei=t=>t*t*t;
function hide(){running=false;root.style.opacity='0';root.style.pointerEvents='none';loader.style.opacity='0';
 clearTimeout(timer);timer=setTimeout(()=>{if(!running){root.style.display='none';loader.style.display='none';}},650);}
function frame(now){if(!running)return;if(t0===null)t0=now;const e=now-t0;
 const p=eo(Math.min(e/T_FLY,1));
 plane.setAttribute('transform','translate('+(800-352*p).toFixed(1)+','+(700-330*p).toFixed(1)+') rotate(-45) scale(0.95)');
 const g=Math.max(0,Math.min((e-T_FLY-T_PAUSE)/T_GROW,1));
 sun.setAttribute('transform','translate(264,184) scale('+(1+17*ei(g)).toFixed(3)+')');
 if(g>0.72)root.style.backgroundColor='#FFB000';
 loader.style.opacity=loaded&&e>=TOTAL+T_FADE+HOLD?'0':Math.max(0,Math.min((e-TOTAL)/T_FADE,1)).toFixed(2);
 if(loaded&&(skip||e>=TOTAL+T_FADE+HOLD)){hide();return;}
 requestAnimationFrame(frame);}
window.SGIntro={
 start(){if(running)return;clearTimeout(timer);running=true;loaded=false;skip=false;t0=null;
  root.style.display='flex';root.style.opacity='1';root.style.pointerEvents='auto';root.style.backgroundColor='#000';
  loader.style.display='flex';loader.style.opacity='0';
  if(document.body.classList.contains('rm'))t0=-1e9; // Bewegung reduziert: Animation überspringen
  requestAnimationFrame(frame);},
 done(){loaded=true;}, // Laden fertig – Animation läuft noch zu Ende
 abort(){if(running)hide();}
};
const sk=()=>{if(running&&loaded)skip=true;};
root.addEventListener('click',sk);
window.addEventListener('keydown',ev=>{if(running&&loaded&&['Escape','Space','Enter'].includes(ev.code)){ev.stopImmediatePropagation();skip=true;}},true);
})();
