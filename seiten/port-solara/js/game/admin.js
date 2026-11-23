'use strict';
// PORT SOLARA – Admin-/Testwerkzeuge. Wird vom Loader NUR geladen, wenn der Dev-Key (Cookie oder localStorage) gesetzt ist.
// F8 = Admin-Panel · Y = FreeCam (in der FreeCam: T = Spieler hierher teleportieren, Mausrad = Tempo)
(function(){
if(typeof devCookieEnabled!=='function'||!devCookieEnabled())return;

const ADM=window.ADM={open:false,god:false,noWanted:false,infAmmo:false,aura:false,auraCars:false,auraR:25,teleportOnExit:false};
try{Object.assign(ADM,JSON.parse(localStorage.getItem('PORT_SOLARA_ADM')||'{}'),{open:false});}catch(e){}
const persist=()=>{try{const {open,...rest}=ADM;localStorage.setItem('PORT_SOLARA_ADM',JSON.stringify(rest));}catch(e){}};
const msg=t=>{try{toast('[ADMIN] '+t);}catch(e){}console.info('[ADMIN]',t);};

// ---------- Hooks in bestehende Spielfunktionen ----------
const _hurt=hurtPlayer;hurtPlayer=function(d,from){if(ADM.god)return;return _hurt.apply(this,arguments);};
const _pause=openPause;openPause=function(){if(ADM.open)return;return _pause.apply(this,arguments);};
const _fc=updateDevFreecam;
updateDevFreecam=function(dt){
 const k=DEV_CAM.keys;
 if(k.has('KeyT')){k.delete('KeyT');ADM.teleportOnExit=true;toggleDevFreecam();return;}
 _fc.apply(this,arguments);
};
const _toggle=toggleDevFreecam;
toggleDevFreecam=function(){
 const wasActive=DEV_CAM.active;
 let tp=null;if(wasActive&&ADM.teleportOnExit)tp=camera.position.clone();
 ADM.teleportOnExit=false;
 _toggle.apply(this,arguments);
 if(!wasActive&&DEV_CAM.active)updateBadge();
 if(tp)teleportPlayer(tp.x,tp.z);
};
function updateBadge(){const b=$('devFreecamBadge');if(b)b.innerHTML=`DEV FREECAM · Y = zurück · T = Spieler hierher<small>WASD bewegen · Maus schauen · Leertaste hoch · C runter · Shift schneller · Strg langsamer · Mausrad Tempo (${Math.round(DEV_CAM.speed)})<br>Es wird nichts nachgeladen – nur der Bereich, in dem du warst.</small>`;}
addEventListener('wheel',e=>{if(!DEV_CAM.active)return;e.preventDefault();e.stopImmediatePropagation();DEV_CAM.speed=clamp(DEV_CAM.speed*(e.deltaY<0?1.2:1/1.2),2,600);updateBadge();},{capture:true,passive:false});

function teleportPlayer(x,z){
 if(P.inAir){msg('Teleport im Flugzeug nicht möglich.');return;}
 const y=groundY(x,z);
 if(P.inCar){const c=P.inCar;c.pos.set(x,0,z);c.g.position.set(x,y,z);c.speed=0;}
 P.pos.set(x,y,z);P.vy=0;
 updateStaticLOD(true);msg(`Teleportiert nach ${Math.round(x)} / ${Math.round(z)}`);
}

// ---------- Tick: Kill-Aura, Godmode, Munition, Fahndung ----------
const dirV=new THREE.Vector3();
function tick(){
 requestAnimationFrame(tick);
 if(mode!=='play'||DEV_CAM.active)return;
 if(ADM.god&&!P.dead){P.hp=Math.max(P.hp,100);P.armor=Math.max(P.armor,100);}
 if(ADM.noWanted&&wanted>0)setWanted(0);
 if(ADM.infAmmo){const w=WEAPONS[INV.cur];if(w&&!w.melee){if(w.thrown)INV.ammo[w.id]=Math.max(INV.ammo[w.id]||0,9);else{INV.clip[w.id]=w.mag;INV.ammo[w.id]=Math.max(INV.ammo[w.id]||0,w.mag*4);}}}
 if(ADM.aura&&!P.dead){
  const c0=P.inCar?P.inCar.pos:P.pos,r2=ADM.auraR*ADM.auraR;
  for(let i=peds.length-1;i>=0;i--){const n=peds[i];if(!n||!n.c||n.state==='ko'||n.state==='fly'||n.kind==='dummy')continue;const p=n.c.g.position,dx=p.x-c0.x,dz=p.z-c0.z;if(dx*dx+dz*dz>r2)continue;dirV.set(dx,0,dz).normalize();try{damageNPC(n,99999,dirV,'admin');}catch(e){}}
  if(ADM.auraCars)for(let i=cars.length-1;i>=0;i--){const c=cars[i];if(!c||c===P.inCar||c.mode==='wreck')continue;const dx=c.pos.x-c0.x,dz=c.pos.z-c0.z;if(dx*dx+dz*dz>r2)continue;try{damageCar(c,99999,'admin');}catch(e){}}
 }
}
requestAnimationFrame(tick);

// ---------- Aktionen ----------
function money(d){P.money=Math.max(0,Math.round(P.money+d));try{cashPop((d>=0?'+$':'-$')+Math.abs(d).toLocaleString('de-DE'),d>=0?'#7dff8a':'#ff6b6b');}catch(e){}render();}
function giveAll(){for(const w of WEAPONS){if(w.id==='fist')continue;giveWeapon(w.id,w.thrown?25:w.melee?0:(w.mag||1)*10);}msg('Alle Waffen erhalten.');}
function refill(){for(const w of WEAPONS){if(!INV.owned[w.id]||w.melee)continue;if(w.thrown)INV.ammo[w.id]=Math.max(INV.ammo[w.id]||0,25);else{INV.clip[w.id]=w.mag;INV.ammo[w.id]=Math.max(INV.ammo[w.id]||0,w.mag*10);}}msg('Munition aufgefüllt.');}
function quietAbort(){if(!mission)return;try{if(race)endRace(false,true);}catch(e){}marker.visible=false;clearMission();try{showBag(false);}catch(e){}cleanupMission(true);mission=null;mTimer=null;mCool=0;setTut('');hideProg();}
function abortMission(){if(!mission){msg('Keine aktive Mission.');return;}failMission('Vom Admin abgebrochen.');mCool=15;missionWait=1e9;msg('Mission abgebrochen – Kontakt 15 s gesperrt.');render();}
function skipStep(){if(!mission){msg('Keine aktive Mission.');return;}const nx=mission.steps[si+1];if(nx&&nx.type==='race'&&!P.inCar){msg('Nächster Schritt ist ein Rennen – erst in ein Auto steigen oder „Mission bestehen“.');return;}try{if(race)endRace(true,true);}catch(e){}completeStep();render();}
function passMission(){if(!mission){msg('Keine aktive Mission.');return;}try{if(race)endRace(true,true);}catch(e){}si=mission.steps.length-1;completeStep();render();}
function startM(i){if(mode!=='play'){msg('Erst im Spiel möglich.');return;}quietAbort();missionWait=1e9;startMission(i);setPanel(false);}
function unlockStory(){quietAbort();mi=missions.length-1;PROG.mi=mi;msg('Alle Missionen bis auf die letzte freigeschaltet.');render();}

// ---------- Panel ----------
const css=document.createElement('style');css.textContent=`
#admPanel{position:fixed;right:16px;top:16px;z-index:9999;width:340px;max-height:calc(100vh - 32px);overflow:auto;display:none;padding:12px 14px;border:1px solid #ff4d6d99;border-radius:10px;background:#080d18f2;color:#e6e9ef;font:13px/1.35 Segoe UI,Arial,sans-serif;box-shadow:0 6px 28px #000b}
#admPanel h3{margin:0 0 8px;color:#ff8fa3;font-size:15px;display:flex;justify-content:space-between}
#admPanel h4{margin:12px 0 5px;color:#ffd23a;font-size:12px;text-transform:uppercase;letter-spacing:.06em}
#admPanel button{margin:2px 2px 2px 0;padding:4px 8px;border:1px solid #ffffff33;border-radius:6px;background:#1b2436;color:#fff;font:inherit;cursor:pointer}
#admPanel button:hover{background:#2a3958}
#admPanel button.on{background:#1f6f43;border-color:#5fd38a}
#admPanel input,#admPanel select{background:#111a2b;color:#fff;border:1px solid #ffffff33;border-radius:6px;padding:3px 6px;font:inherit}
#admPanel .row{display:flex;gap:4px;align-items:center;flex-wrap:wrap}
#admPanel .info{color:#9fb0c8;font-size:12px}`;
document.head.appendChild(css);
const el=document.createElement('div');el.id='admPanel';document.body.appendChild(el);
for(const ev of ['mousedown','mouseup','pointerdown','pointerup','click','dblclick','wheel','keydown','keyup','contextmenu'])el.addEventListener(ev,e=>e.stopPropagation());

const tg=(k,label)=>`<button data-t="${k}" class="${ADM[k]?'on':''}">${label}: ${ADM[k]?'AN':'AUS'}</button>`;
function render(){
 if(!ADM.open)return;
 const cur=mission?`<b>${mission.name}</b> – Schritt ${si+1}/${mission.steps.length}`:'keine aktive Mission';
 el.innerHTML=`<h3>ADMIN <span class="info">F8 schließen</span></h3>
 <h4>Kamera</h4>
 <div class="row"><button data-a="freecam">FreeCam starten (Y)</button></div>
 <div class="info">Lädt nichts nach – nur der aktuelle Bereich bleibt sichtbar. In der FreeCam: T = Spieler dorthin teleportieren.</div>
 <h4>Kampf</h4>
 <div class="row">${tg('aura','Kill-Aura')}${tg('auraCars','Aura trifft Autos')}</div>
 <div class="row">Radius <input type="range" min="3" max="120" value="${ADM.auraR}" data-r> <span data-rv>${ADM.auraR} m</span></div>
 <div class="row">${tg('god','Godmode')}${tg('infAmmo','Unendl. Munition')}${tg('noWanted','Keine Fahndung')}</div>
 <div class="row"><button data-a="heal">Heilen + Rüstung</button><button data-a="w0">Fahndung 0</button><button data-a="w5">Fahndung 5</button></div>
 <h4>Geld (aktuell $${(P.money||0).toLocaleString('de-DE')})</h4>
 <div class="row"><button data-m="1000">+1.000</button><button data-m="100000">+100.000</button><button data-m="1000000">+1 Mio</button></div>
 <div class="row"><button data-m="-1000">−1.000</button><button data-m="-100000">−100.000</button><button data-a="money0">auf 0</button></div>
 <div class="row"><input type="number" data-amt value="5000" style="width:110px"><button data-a="madd">+</button><button data-a="msub">−</button><button data-a="mset">setzen</button></div>
 <h4>Waffen</h4>
 <div class="row"><button data-a="allw">Alle Waffen</button><button data-a="refill">Munition auffüllen</button></div>
 <div class="row">${WEAPONS.filter(w=>w.id!=='fist').map(w=>`<button data-w="${w.id}" class="${INV.owned[w.id]?'on':''}">${w.name}</button>`).join('')}</div>
 <h4>Missionen</h4>
 <div class="info">${cur}</div>
 <div class="row"><button data-a="skip">Schritt überspringen</button><button data-a="pass">Mission bestehen</button><button data-a="abort">Abbrechen</button></div>
 <div class="row"><select data-ms>${missions.map((m,i)=>`<option value="${i}" ${i===mi?'selected':''}>${i}: ${m.name}</option>`).join('')}</select><button data-a="startm">Starten</button></div>
 <div class="row"><button data-a="unlock">Story freischalten</button></div>
 <h4>Sonstiges</h4>
 <div class="row"><button data-a="save">Spiel speichern</button><button data-a="pos">Position loggen</button></div>`;
}
el.addEventListener('input',e=>{if(e.target.matches('[data-r]')){ADM.auraR=+e.target.value;el.querySelector('[data-rv]').textContent=ADM.auraR+' m';persist();}});
el.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.t){const k=b.dataset.t;ADM[k]=!ADM[k];persist();if(k==='god'&&ADM.god){P.hp=100;P.armor=100;}render();return;}
 if(b.dataset.m){money(+b.dataset.m);return;}
 if(b.dataset.w){const w=WEAPONS[WI[b.dataset.w]];giveWeapon(w.id,w.thrown?25:w.melee?0:(w.mag||1)*10);msg(w.name+' erhalten.');render();return;}
 const amt=Math.abs(+(el.querySelector('[data-amt]')||{}).value||0);
 switch(b.dataset.a){
  case 'freecam':if(mode!=='play'){msg('FreeCam geht nur im Spiel.');break;}setPanel(false);toggleDevFreecam();try{lockMouse();}catch(e){}break;
  case 'heal':if(P.dead){msg('Spieler ist bereits tot.');break;}P.hp=100;P.armor=100;msg('Geheilt.');break;
  case 'w0':setWanted(0);break;
  case 'w5':setWanted(5);break;
  case 'money0':money(-P.money);break;
  case 'madd':money(amt);break;
  case 'msub':money(-amt);break;
  case 'mset':money(amt-P.money);break;
  case 'allw':giveAll();render();break;
  case 'refill':refill();break;
  case 'skip':skipStep();break;
  case 'pass':passMission();break;
  case 'abort':abortMission();break;
  case 'startm':startM(+el.querySelector('[data-ms]').value);break;
  case 'unlock':unlockStory();break;
  case 'save':try{saveGame(true);msg('Gespeichert.');}catch(err){msg('Speichern fehlgeschlagen: '+err.message);}break;
  case 'pos':{const p=P.pos;console.info('[ADMIN] Position',{x:+p.x.toFixed(2),y:+p.y.toFixed(2),z:+p.z.toFixed(2)});msg(`Position: ${p.x.toFixed(1)} / ${p.z.toFixed(1)} (Konsole)`);break;}
 }
});
function setPanel(on){
 ADM.open=on;el.style.display=on?'block':'none';
 if(on){try{clearKeys();}catch(e){}fireHeld=false;aimHeld=false;try{document.exitPointerLock&&document.exitPointerLock();}catch(e){}render();}
 else if(mode==='play'&&!pauseOpen){try{lockMouse();}catch(e){}}
}
addEventListener('keydown',e=>{if(e.code!=='F8'||e.repeat)return;if(DEV_CAM.active)return;if(pauseOpen&&!ADM.open){try{closePause();}catch(err){}}if(mode!=='play'&&!ADM.open){msg('Admin-Panel geht nur im Spiel.');return;}e.preventDefault();e.stopImmediatePropagation();setPanel(!ADM.open);},true);
setInterval(()=>{if(ADM.open&&!el.contains(document.activeElement))render();},1000);
console.info('%c[PORT SOLARA] Admin-Modus aktiv – F8 = Panel, Y = FreeCam','color:#ff8fa3;font-weight:bold');
})();
