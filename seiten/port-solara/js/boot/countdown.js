'use strict';
// Zeigt bis zum festen Freischaltzeitpunkt nur den Countdown.
(function(){
 const root=document.getElementById('release-countdown');
 if(!root)return;
 // 24.12.2026, 00:00:00 Uhr MEZ (UTC+1).
 const target=Date.parse('2026-12-24T00:00:00+01:00');
 const fields={
  days:document.getElementById('rc-days'),
  hours:document.getElementById('rc-hours'),
  minutes:document.getElementById('rc-minutes'),
  seconds:document.getElementById('rc-seconds')
 };
 let unlocked=false,interval=null;
 function blockInput(event){
  if(unlocked)return;
  event.preventDefault();
  event.stopImmediatePropagation();
 }
 function unlock(){
  unlocked=true;
  root.style.display='none';
  root.setAttribute('aria-hidden','true');
  window.removeEventListener('keydown',blockInput,true);
  if(interval!==null)clearInterval(interval);
 }
 function update(){
  const remaining=target-Date.now();
  if(remaining<=0){unlock();return;}
  let total=Math.ceil(remaining/1000);
  const days=Math.floor(total/86400);total%=86400;
  const hours=Math.floor(total/3600);total%=3600;
  const minutes=Math.floor(total/60);
  const seconds=total%60;
  fields.days.textContent=String(days);
  fields.hours.textContent=String(hours).padStart(2,'0');
  fields.minutes.textContent=String(minutes).padStart(2,'0');
  fields.seconds.textContent=String(seconds).padStart(2,'0');
 }
 window.addEventListener('keydown',blockInput,true);
 update();
 if(!unlocked)interval=setInterval(update,100);
})();
