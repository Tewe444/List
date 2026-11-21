'use strict';
function showPauseTab(t){pauseTab=t;for(const b of document.querySelectorAll('#ptabs button'))b.classList.toggle('on',b.dataset.t===t);const pg=$('ppage');
 if(t==='map'){BMV.cx=null;pg.innerHTML=`<div class="mapwrap"><canvas id="bigmap" width="840" height="1020"></canvas><div class="legend">${legendHTML()}<p class="tip">${KT('Klick auf die Karte oder ein Symbol setzt ein <b style="color:#c060ff">Ziel mit Route</b>.<br>Nochmal klicken entfernt es. <b style="color:#ffd23a">Gelb</b> = Missionsroute.')}</p><p class="tip">Gebiet: <b>${areaName(P.pos.x,P.pos.z)}</b> · Wetter: ${WX_ICON[WX.type]}</p></div></div>`;drawBigMap();for(const b of pg.querySelectorAll('[data-goto]'))b.onclick=()=>{uiClick();const k=b.dataset.goto;if(k==='clear'){waypoint=null;NAVR.wp=null;}else navPickType(k);const lw=$('lgwp');if(lw)lw.style.display=waypoint?'':'none';if(waypoint&&k!=='clear'){BMV.cx=(waypoint.x+P.pos.x)/2;BMV.cz=(waypoint.z+P.pos.z)/2;}drawBigMap();};}
 else if(t==='stats')pg.innerHTML=statsHTML();
 else if(t==='set'){pg.innerHTML=settingsHTML();bindSettings();}
 else{pg.innerHTML=helpHTML();for(const b of pg.querySelectorAll('#indev button'))b.onclick=()=>{setInput(b.dataset.in);uiClick();showPauseTab('help');};const oc=pg.querySelector('#openctrl');if(oc)oc.onclick=()=>openCtrl(SET.input);}}
function legendHTML(){const seen={};let h='';for(const p of places){if(!p.blip||seen[p.type]||!isUnlocked(p.type))continue;seen[p.type]=1;const nm={store:'Laden / Tankstelle (ausrauben!)',bank:'Nationalbank',dealer:'Autohaus',race:'Straßenrennen',gunshop:'Waffenladen',range:'Schießstand',clothes:'Kleidung',respray:'Sprühwerk (Fahndung löschen)',burger:'Burger Bude',safehouse:'Deine Wohnung (speichern)',garage:'Deine Garage',fight:'Faustkampf-Club',taxi:'Taxi-Zentrale',pizza:'Pizza Presto',export:'Auto-Export',bounty:'Kopfgeld-Büro',flight:'Flugschule',cinema:'Kino',club:'Club NEON',skate:'Skatepark-Challenge',truck:'Spedition (Trucker-Job)',coaster:'Achterbahn',wheel:'Riesenrad'}[p.type]||p.name;
  h+=`<button class="lg go" data-goto="${p.type}"><i style="background:${p.col}">${p.label}</i>${nm}</button>`;}
 h='<p class="tip" style="margin:0 0 6px">Eintrag anklicken = Route zum nächsten Ort</p><button class="lg go" data-goto="mission"><i style="background:#ffd23a">M</i><b>Nächste Hauptmission</b></button><button class="lg go" id="lgwp" data-goto="clear" style="display:'+(waypoint?'':'none')+'"><i style="background:#c060ff">✕</i>Wegpunkt löschen</button>'+h;
 h+='<div class="lg"><i style="background:#ffd23a">M</i>Auftraggeber (Hauptmission)</div><div class="lg"><i style="background:#ffd23a;border-radius:50%"> </i>Ziel</div><div class="lg"><i style="background:#ff4040"> </i>Gegner</div><div class="lg"><i style="background:#4f86ff"> </i>Polizei</div>';return h;}
function statsHTML(){const row=(n,v,max)=>`<div class="st"><span>${n}</span><b>${v}${max!=null?' / '+max:''}</b>${max?`<em><i style="width:${Math.min(100,v/max*100)}%"></i></em>`:''}</div>`;
 return `<div class="stats"><h3>Gesamtfortschritt: ${completion()} %</h3><div class="cols"><div>
 <h4>Story</h4>${row('Hauptmissionen',Math.min(PROG.mi,missions.length),missions.length)}
 <h4>Nebenmissionen</h4>${row('Taxi-Fahrten',Math.min(PROG.taxi,10),10)}${row('Bürgerwehr (Level)',PROG.vig,8)}${row('Rettungsdienst (Level)',PROG.para,8)}${row('Pizzabote (Level)',PROG.pizza,8)}${row('Auto-Export',PROG.exp.length,10)}${row('Kopfgelder',PROG.bounty,6)}${row('Straßenrennen gewonnen',PROG.races.length,RACES.length)}${row('Flugschule',PROG.flight.length,LESSONS.length)}${row('Faustkämpfe',PROG.fight,5)}${row('Schießstand',PROG.range,1)}</div><div>
 <h4>Sammeln & Entdecken</h4>${row('Überfälle',PROG.robbed.length,stores.length)}${row('Stuntsprünge',PROG.stunts.length,STUNT_TOTAL())}${row('Versteckte Pakete',PROG.packages.length,30)}${row('Meteoritensplitter',PROG.meteors.length,20)}${row('Aussichtspunkte',PROG.views.length,8)}${row('Trucker-Lieferungen',Math.min(PROG.truck,5),5)}${row('Skatepark-Challenge',Math.min(PROG.skate,1),1)}${row('Kinobesuche',PROG.movies)}
 <h4>Besitz</h4>${row('Fahrzeuge in der Garage',PROG.cars.length)}${row('Eigene Flugzeuge',PROG.air.length)}${row('Geld','$'+Math.round(P.money).toLocaleString('de-DE'))}</div></div></div>`;}
function seg(k,opts){return `<div class="seg" data-k="${k}">${opts.map(([v,n])=>`<button data-v="${v}" class="${String(SET[k])===String(v)?'on':''}">${n}</button>`).join('')}</div>`;}
function settingsHTML(){return `<div class="set">
 <div class="row"><span>Grafikprofil</span>${seg('gfxPreset',[['potato','Potato'],['leicht','Leicht'],['normal','Normal'],['ultra','Ultra'],['custom','Eigenes']])}</div>
 <div class="row"><span>Automatisch reduzieren</span>${seg('autoQuality',[[true,'An'],[false,'Aus']])}</div>
 <div class="row"><span>Tickrate automatisch anpassen (60–40)</span>${seg('autoSlowdown',[[true,'An'],[false,'Aus']])}</div>
 <div class="row"><span>Simulationstakte (40–60)</span><span class="val" id="simTps">${SIM_RATE.tps} / s</span></div>
 <div class="row"><span>Aktuelle Sichtweite</span><span class="val" id="renderDistanceStatus">${Math.round(getEffectiveGfxFar())} m</span></div>
 <div class="row"><span>Gemessene Bildrate</span><span class="val" id="fpsReadout">${Math.round(lastMeasuredFps)} FPS</span></div>
 <div class="row"><span>Grafik-Auflösung</span><div><input type="range" min="35" max="130" step="5" data-k="gfxResolution" value="${Math.round(SET.gfxResolution*100)}"><span class="val"> ${Math.round(SET.gfxResolution*100)} %</span></div></div>
 <div class="row"><span>Detailradius (10–39.990 m)</span><div><input type="range" min="10" max="39990" step="10" data-k="gfxNear" value="${SET.gfxNear}"><span class="val" id="val-gfxNear"> ${SET.gfxNear} m</span></div></div>
 <div class="row"><span>Maximale Sichtweite (bis 40.000 m)</span><div><input type="range" min="40" max="40000" step="10" data-k="gfxFar" value="${SET.gfxFar}"><span class="val" id="val-gfxFar"> ${SET.gfxFar} m</span></div></div>
 <div class="row"><span>Musik</span><input type="range" min="0" max="1" step="0.05" data-k="music" value="${SET.music}"></div>
 <div class="row"><span>Soundeffekte</span><input type="range" min="0" max="1" step="0.05" data-k="sfx" value="${SET.sfx}"></div>
 <div class="row"><span>Maus-Empfindlichkeit</span><input type="range" min="0.3" max="2" step="0.05" data-k="sens" value="${SET.sens}"></div>
 <div class="row"><span>Stimmen (Sprachausgabe)</span>${seg('voice',[[1,'An'],[0,'Aus']])}</div>
 <div class="row"><span>Musik zu Fuß</span>${seg('footMusic',[[1,'An'],[0,'Aus']])}</div>
 <div class="row"><span>Radiosender</span><span class="val">${STATIONS[MUS.station].name} – ${KT('im Fahrzeug mit <k>Q</k> wechseln','car')}</span></div>
 <div class="row"><span>SoundCloud-Radio</span><button class="smallbtn" id="openPlaylistSetup">5 Radiosender einrichten …</button></div>
 <div class="row"><span>Steuerung</span><button class="smallbtn" id="setctrl">${DEV_NAME[SET.input]} – anpassen …</button></div>
 <p class="tip">Standard sind 60 Simulationstakte/s. Bei hoher Last sinkt die Rate schrittweise bis auf 40 Takte/s, ohne die Spielzeit künstlich zu verlangsamen. Fällt die Bildrate unter 20 FPS, reduziert das Spiel automatisch die wirksame Sichtweite; erholt sie sich, wird die Sichtweite langsam wieder erhöht. Deine eingestellte Maximaldistanz bis 40.000 m bleibt gespeichert.</p></div>`;}
function bindSettings(){for(const s of $('ppage').querySelectorAll('.seg'))s.onclick=e=>{const b=e.target.closest('button');if(!b)return;const k=s.dataset.k,raw=b.dataset.v;if(k==='gfxPreset')setGfxPreset(raw);else if(k==='autoQuality'){SET.autoQuality=raw==='true'||raw==='1';saveSettings();}else if(k==='autoSlowdown'){SET.autoSlowdown=raw==='true'||raw==='1';saveSettings();}else{SET[k]=+raw;saveSettings();if(k==='quality')applyQuality();}applyVolumes();showPauseTab('set');uiClick();};
 for(const inp of $('ppage').querySelectorAll('input[type=range]'))inp.oninput=()=>{const k=inp.dataset.k;let v=+inp.value;if(k==='gfxResolution')v=clamp(v/100,.35,1.3);if(k==='gfxNear'){SET.gfxNear=clamp(v,10,39990);if(SET.gfxFar<SET.gfxNear+10)SET.gfxFar=Math.min(40000,SET.gfxNear+10);}else if(k==='gfxFar'){SET.gfxFar=clamp(v,40,40000);if(SET.gfxFar<SET.gfxNear+10)SET.gfxNear=Math.max(10,SET.gfxFar-10);}else if(k==='gfxResolution')SET.gfxResolution=v;else SET[k]=v;if(k&&k.startsWith('gfx'))SET.gfxPreset='custom';saveSettings();applyQuality();applyVolumes();const el=$('val-'+k);if(el)el.textContent=' '+(k==='gfxResolution'?Math.round(v*100)+' %':Math.round(SET[k])+' m');const out=inp.parentElement&&inp.parentElement.querySelector('.val');if(out&&k==='gfxResolution')out.textContent=' '+Math.round(v*100)+' %';};
 {const sc=$('ppage').querySelector('#setctrl');if(sc)sc.onclick=()=>openCtrl(SET.input);const pl=$('ppage').querySelector('#openPlaylistSetup');if(pl)pl.onclick=()=>togglePlaylistDock(true);}}
function helpHTML(){const im=SET.input,r=(k,t)=>`<div class="hk"><span>${k}</span>${t}</div>`,kk=(a,ctx)=>`<k>${esc(LB(a,ctx))}</k>`;
 const top=`<div class="ctop"><span>Steuerung:</span><div id="indev">${['kb','pad','touch'].map(k=>`<button data-in="${k}" class="${im===k?'on':''}">${DEV_NAME[k]}</button>`).join('')}</div><button class="smallbtn" id="openctrl">${im==='touch'?'✏️ Buttons anpassen':im==='pad'?'⚙️ Controller-Tasten belegen':'⚙️ Tasten belegen'}</button></div>`+(im==='pad'&&!PADS.connected?'<p class="tip">🔴 Noch kein Controller erkannt – schließ ihn an und drück eine Taste am Controller.</p>':'');
 const pitch=im==='pad'?'<k>L-Stick ↕</k>':kk('jump','plane')+' / '+kk('sprint','plane');
 return top+`<div class="help"><div><h4>Zu Fuß</h4>${r(kk('move','foot'),'laufen')}${r(kk('look','foot'),'umsehen')}${r(kk('sprint','foot'),'sprinten')}${r(kk('jump','foot'),'springen')}${r(kk('use','foot'),'einsteigen / benutzen / Läden')}${r(kk('aim','foot'),'zielen (auf Kassierer zielen = Überfall)')}${r(kk('fire','foot'),'schießen / schlagen / werfen')}${r(kk('weapons','foot'),im==='touch'?'antippen: nächste Waffe · halten: Waffenrad':'Waffe wechseln')}${im!=='touch'?r(kk('wheel','foot')+' halten','Waffenrad'):''}${r(kk('reload','foot'),'nachladen')}
 <h4>Fahrzeuge</h4>${r(kk('fwd','car')+' '+kk('back','car'),'Gas / Bremse, rückwärts')}${r(kk('steer','car'),'lenken')}${r(kk('jump','car'),'Handbremse')}${r(kk('horn','car'),'hupen')}${r(kk('radio','car'),'Radiosender wechseln')}${r(kk('job','car'),'Nebenjob starten (Taxi, Polizei, Rettungswagen)')}${r(kk('fire','car'),'Panzer: Kanone abfeuern')}${r(kk('use','car'),'aussteigen (Boot: am Ufer / Steg)')}</div>
 <div><h4>Hubschrauber</h4>${r(kk('move','heli'),'vor / zurück / drehen')}${r(kk('jump','heli')+' / '+kk('sprint','heli'),'steigen / sinken')}${r(kk('fire','heli')+' / '+kk('aim','heli'),'MG / Raketen (bewaffnet)')}
 <h4>Flugzeug</h4>${r(kk('fwd','plane')+' / '+kk('back','plane'),'Schub / bremsen')}${r(kk('steer','plane'),'Kurven fliegen')}${r(pitch,'Nase hoch / runter – abheben ab ca. 100 km/h')}${r(kk('use','plane'),'in der Luft: abspringen')}${r(kk('jump','para'),'im Fall: Fallschirm öffnen')}
 <h4>Allgemein</h4>${r(kk('pause','foot')+(im==='kb'?' / <k>Esc</k>':''),'Pausemenü')}${r(kk('map','foot'),'große Karte')}${im==='kb'?r(kk('time','foot')+' halten','Zeit vorspulen'):''}
 <h4>Tipps</h4><p>Buchstaben auf der Karte sind Läden und Jobs. <b>M, J, R, P</b> sind deine Auftraggeber.<br>Fahndung loswerden: weit wegfahren oder ins <b>Sprühwerk (L)</b>.<br>Grüne Kreuze = Gesundheit, blaue Westen = Schutzweste.<br><b>Flughafen:</b> Schranke durchbrechen oder am Lieferanteneingang das Schloss knacken – der Sicherheitsdienst schlägt Alarm.<br><b>Fort Adler:</b> Betreten = sofort 4 Sterne. Dort stehen Panzer und ein Militärjet.<br>Neue Läden und Jobs schaltest du mit der Story frei.<br>In deiner <b>Wohnung (H)</b> kannst du speichern.</p></div></div>`;}
function lsGet(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function kbLoad(){const s=lsGet(IN_LS.keys)||{};KB={};for(const a of ACT_IDS){const v=s.b&&s.b[a];KB[a]=Array.isArray(v)&&v.length===2&&v.every(c=>typeof c==='string')?v.slice():ACTS[a].def.slice();}KLBL=s.l&&typeof s.l==='object'?s.l:{};kbIndex();}
function kbIndex(){KBMAP={};for(const a of ACT_IDS)for(const c of KB[a])if(c)KBMAP[c]=a;KB_DEF=ACT_IDS.every(a=>KB[a][0]===ACTS[a].def[0]&&KB[a][1]===ACTS[a].def[1]);}
function kbSave(){lsSet(IN_LS.keys,{b:KB,l:KLBL});kbIndex();KTC.clear();}
function kbAct(code){return KBMAP[code]||null;}
function keyName(c){if(!c)return '—';if(KLBL[c])return KLBL[c];if(KN[c])return KN[c];if(/^Key[A-Z]$/.test(c))return c==='KeyY'?'Z':c==='KeyZ'?'Y':c.slice(3);if(/^Digit\d$/.test(c))return c.slice(5);if(/^Numpad\d$/.test(c))return 'Num '+c.slice(6);return c;}
function padLoad(){const s=lsGet(IN_LS.pad)||{};PADB={};for(const g in PAD_DEF){PADB[g]={};for(const a in PAD_DEF[g]){const v=s[g]&&s[g][a];PADB[g][a]=Number.isInteger(v)&&v>=-1&&v<20?v:PAD_DEF[g][a];}}}
function padSave(){lsSet(IN_LS.pad,PADB);KTC.clear();}
function padName(i){if(i==null||i<0)return '—';return (PADS.ps?PADN_PS:PADN_X)[i]||('Taste '+i);}

// ---------- Eingabegerät ----------
function detectInput(){try{if(matchMedia('(pointer:coarse)').matches&&!matchMedia('(pointer:fine)').matches)return 'touch';}catch(e){}try{if(navigator.maxTouchPoints>0&&/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent||''))return 'touch';}catch(e){}return 'kb';}
function setInput(m,auto){if(!['kb','pad','touch'].includes(m)||SET.input===m)return;SET.input=m;saveSettings();applyInputMode();if(auto)toast(m==='pad'?'🎮 Steuerung: Controller':m==='touch'?'📱 Steuerung: Touch':'⌨️ Steuerung: Tastatur & Maus');}
function applyInputMode(){KTC.clear();const im=SET.input;
 try{document.body.classList.toggle('touch',im==='touch');document.body.classList.toggle('padmode',im==='pad');}catch(e){}
 if(im==='touch'&&!SET.tInit){SET.tInit=1;if(SET.quality>1)SET.quality=1;saveSettings();}
 if(im!=='pad'){padRelease();setFocus(null);}
 if(im!=='touch')tReleaseAll();
 TCH.sig='';hudZoom();inputTexts();renderInChoice();if(isOpen('ctrl'))renderCtrl();}
function inputTexts(){const im=SET.input;
 try{$('skip').textContent='Überspringen ⏭ ('+(im==='pad'?padName(0):im==='touch'?'antippen':'Leertaste')+')';}catch(e){}
 try{const f=$('panel').querySelector('.pfoot');if(f)f.textContent=im==='pad'?`${padName(0)} auswählen · ${padName(1)} schließen`:im==='touch'?'Antippen zum Kaufen · ✕ schließt':`${keyName(KB.use[0]||KB.use[1])} oder Esc zum Schließen`;}catch(e){}}
function hudZoom(){const z=clamp(Math.min(innerHeight/820,innerWidth/1400),.5,1);try{const de=document.documentElement;if(de&&de.style){de.style.setProperty('--hz',z.toFixed(3));de.style.setProperty('--to',String(SET.tOpacity));}}catch(e){}}
function isOpen(id){const e=$(id);const d=e&&e.style&&e.style.display;return typeof d==='string'&&d!==''&&d!=='none';}
function vPress(code,src,rep){if(!code)return;const h=HOLD[code]||(HOLD[code]=new Set());if(rep&&!h.has(src))rep=false;h.add(src);vDown(code,!!rep);}
function vRelease(code,src){const h=HOLD[code];if(!h||!h.has(src))return;h.delete(src);if(!h.size)vUp(code);}
function vTap(code,src){vPress(code,src,false);vRelease(code,src);}
function vDown(code,rep){K[code]=true;
 if(mode==='cine'&&['Space','Enter','Escape'].includes(code)){endCine();return;}
 if(mode==='mcine'&&['Space','Enter','Escape'].includes(code)&&!rep){endMissionCine();return;}
 if(code==='Tab'){if(mode==='play'&&!rep)openWheel();return;}
 if(mode==='creator'&&shopMode&&code==='Escape'){closeShopCreator(false);return;}
 if(mode==='menu'){if(rep)return;if(panelOpen&&['Escape','KeyE','KeyP'].includes(code)){closePanel();return;}if(pauseOpen&&['Escape','KeyP','KeyM'].includes(code))closePause();return;}
 if(mode!=='play')return;
 if(!plEl()&&!rep&&code!=='Escape'&&code!=='KeyP'&&code!=='KeyM')lockMouse();
 if((code==='Escape'||code==='KeyP')&&!rep){openPause();return;}
 if(code==='KeyM'&&!rep){openPause('map');return;}
 if(code.startsWith('Digit')){const n=+code.slice(5);const idx=n===0?9:n-1;if(!P.inCar&&!P.inAir)selectWeapon(idx);}
 if(code==='KeyR')startReload();
 if(code==='KeyE'&&!rep)interactKey();
 if(code==='KeyF'&&!rep)activityKey();
 if(code==='KeyQ'&&!rep)radioNext();
 if(code==='KeyH'&&!rep)horn();}
function vUp(code){K[code]=false;if(code==='Tab')closeWheel(true);}
function actDown(a,src,rep){const d=ACTS[a];if(!d)return;
 if(a==='fire'){if(rep||mode!=='play'||wheelOpen)return;fireHeld=true;if(!P.inAir)tryFire();return;}
 if(a==='aim'){if(mode==='play'&&!wheelOpen)aimHeld=true;return;}
 if(a==='wnext'||a==='wprev'){if(!rep&&mode==='play'&&!P.inCar&&!P.inAir)cycleWeapon(a==='wnext'?1:-1);return;}
 vPress(d.v,src,rep);}
function actUp(a,src){const d=ACTS[a];if(!d)return;if(a==='fire'){fireHeld=false;return;}if(a==='aim'){aimHeld=false;return;}if(d.v)vRelease(d.v,src);}
function updAN(){let x=0,y=0;if(SET.input==='pad'){x=PADAX.lx;y=PADAX.ly;}else if(SET.input==='touch'){x=TJ.x;y=TJ.y;}AN.x=x;AN.y=y;AN.on=mode==='play'&&!wheelOpen&&Math.hypot(x,y)>.14;}
function kbCaptureStart(a,s){KCAP={a,s,t0:performance.now()};PADS.cap=null;renderCtrl();}
function kbCaptureKey(e){if(!KCAP)return false;e.preventDefault();if(e.repeat)return true;if(e.code==='Escape'){KCAP=null;renderCtrl();return true;}if(RESERVED.has(e.code))return true;kbAssign(e.code,e.key&&e.key.length===1&&e.key.trim()?e.key.toUpperCase():null);return true;}
function kbCaptureMouse(e){if(!KCAP)return false;try{e.preventDefault();}catch(_){}if(performance.now()-KCAP.t0<250)return true;KCAP_IGN=performance.now();kbAssign('Mouse'+e.button,null);return true;}
function kbAssign(code,lbl){const {a,s}=KCAP;KCAP=null;let moved='';
 for(const b of ACT_IDS)for(let k=0;k<2;k++)if(KB[b][k]===code&&!(b===a&&k===s)){KB[b][k]='';moved=ACTS[b].n;}
 KB[a][s]=code;if(lbl)KLBL[code]=lbl;kbSave();uiClick();
 if(moved)toast(`${keyName(code)} war bei „${moved}“ – dort entfernt`);renderCtrl();inputTexts();}
function kbReset(){for(const a of ACT_IDS)KB[a]=ACTS[a].def.slice();KLBL={};kbSave();renderCtrl();inputTexts();}

// ---------- Controller: Abfrage, Spiel, Menü-Navigation ----------
function getPad(){try{const l=navigator.getGamepads?navigator.getGamepads():null;if(!l)return null;for(const g of l)if(g&&g.connected!==false&&g.buttons&&g.buttons.length>=4)return g;}catch(e){}return null;}
function padCtx(){return P.para?'para':P.inAir?(P.inAir.type==='heli'?'heli':'plane'):P.inCar?'car':'foot';}
function pollPad(dt){const gp=getPad();
 if(!gp){if(PADS.connected){PADS.connected=false;padRelease();if(SET.input==='pad')toast('🎮 Controller getrennt');renderCtrl();}PADS.cur=[];PADS.prev=[];return;}
 if(!PADS.connected){PADS.connected=true;PADS.id=String(gp.id||'Controller');PADS.ps=/054c|playstation|dualsense|dualshock/i.test(PADS.id)||/wireless controller/i.test(PADS.id)&&!/xbox|xinput|microsoft|045e/i.test(PADS.id);KTC.clear();renderCtrl();}
 PADS.prev=PADS.cur;PADS.cur=Array.from(gp.buttons,b=>!!(b&&(b.pressed||b.value>.5)));
 const ax=gp.axes||[];PADAX.lx=dzn(ax[0]||0);PADAX.ly=dzn(ax[1]||0);PADAX.rx=dzn(ax[2]||0);PADAX.ry=dzn(ax[3]||0);
 if(PADS.cap){padCaptureTick(dt);return;}
 if(SET.input!=='pad'){if(PADS.cur.some((b,i)=>b&&!PADS.prev[i])&&!isOpen('tedit'))setInput('pad',true);else return;}
 if(navActive()){padRelease();padNav(dt);return;}
 if(PADS.nav.el)setFocus(null);
 if(mode==='cine'||mode==='mcine'){padRelease();if(pe(0)||pe(1)||pe(9))vTap('Enter','pad');return;}
 if(mode!=='play'){padRelease();return;}
 padPlay(dt);
 if(SET.rumble&&shake>.14&&time>PADS.rumbleT){PADS.rumbleT=time+.2;try{const va=gp.vibrationActuator;if(va&&va.playEffect)va.playEffect('dual-rumble',{duration:160,strongMagnitude:Math.min(1,shake),weakMagnitude:Math.min(1,shake*.7)}).catch(()=>{});}catch(e){}}}
function padRelease(){for(const c of PADS.hold)vRelease(c,'pad');PADS.hold.clear();if(PADS.fire){PADS.fire=false;fireHeld=false;}if(PADS.aim){PADS.aim=false;aimHeld=false;}}
function padPlay(dt){const B=PADB,ctx=padCtx(),H=new Set(),lx=PADAX.lx,ly=PADAX.ly;
 const bp=(g,a)=>pp(B[g][a]),be=(g,a)=>pe(B[g][a]);
 if(be('all','pause')){padRelease();vTap('KeyP','pad');return;}
 if(be('all','map')){padRelease();vTap('KeyM','pad');return;}
 let fire=false,aim=false;
 if((ctx==='foot'||ctx==='para')&&!wheelOpen){if(ly<-.5)H.add('KeyW');if(ly>.5)H.add('KeyS');if(lx<-.5)H.add('KeyA');if(lx>.5)H.add('KeyD');}
 if(ctx==='foot'){if(bp('foot','jump'))H.add('Space');if(bp('foot','sprint'))H.add('ShiftLeft');if(bp('foot','wheel'))H.add('Tab');
  if(be('foot','use'))vTap('KeyE','pad');if(be('foot','reload'))vTap('KeyR','pad');if(be('foot','job'))vTap('KeyF','pad');if(be('foot','wnext')&&!wheelOpen)cycleWeapon(1);
  aim=bp('foot','aim');fire=bp('foot','fire');}
 else if(ctx==='para'){if(bp('foot','jump')||bp('foot','sprint'))H.add('Space');if(be('foot','use'))vTap('KeyE','pad');}
 else if(ctx==='car'){if(lx<-.3)H.add('KeyA');if(lx>.3)H.add('KeyD');if(bp('car','gas'))H.add('KeyW');if(bp('car','brake'))H.add('KeyS');if(bp('car','hand'))H.add('Space');
  if(be('car','use'))vTap('KeyE','pad');if(be('car','horn'))vTap('KeyH','pad');if(be('car','radio'))vTap('KeyQ','pad');if(be('car','job'))vTap('KeyF','pad');fire=bp('car','fire');}
 else{if(lx<-.35)H.add('KeyA');if(lx>.35)H.add('KeyD');
  if(ctx==='heli'){if(ly<-.35)H.add('KeyW');if(ly>.35)H.add('KeyS');if(bp('air','up'))H.add('Space');if(bp('air','down'))H.add('ShiftLeft');}
  else{const nu=SET.flightInv?ly>.35:ly<-.35,nd=SET.flightInv?ly<-.35:ly>.35;if(nu)H.add('Space');if(nd)H.add('ShiftLeft');if(bp('air','up'))H.add('KeyW');if(bp('air','down'))H.add('KeyS');}
  if(be('air','use'))vTap('KeyE','pad');fire=bp('air','fire');aim=bp('air','aim');}
 if(mode!=='play')return;
 for(const c of [...PADS.hold])if(!H.has(c)){PADS.hold.delete(c);vRelease(c,'pad');}
 for(const c of H)if(!PADS.hold.has(c)){PADS.hold.add(c);vPress(c,'pad');}
 if(fire!==PADS.fire){PADS.fire=fire;if(fire){if(!wheelOpen){fireHeld=true;if(!P.inAir)tryFire();}}else fireHeld=false;}
 if(aim!==PADS.aim){PADS.aim=aim;aimHeld=aim&&!wheelOpen;if(aimHeld)assistAcquire();}
 const rx=PADAX.rx,ry=PADAX.ry;
 if(wheelOpen){const useR=Math.hypot(rx,ry)>=Math.hypot(lx,ly),sx=useR?rx:lx,sy=useR?ry:ly;if(Math.hypot(sx,sy)>.5){wheelV.x=0;wheelV.y=0;wheelMouse(sx*140,sy*140);}}
 else if(rx||ry){const s=(scoped()?.3:aiming()?.55:1)*SET.padSens;camYaw-=rx*Math.abs(rx)*3.3*s*dt;camPitch=clamp(camPitch+ry*Math.abs(ry)*(SET.invY?-1:1)*2.3*s*dt,-.5,1.25);mouseIdle=0;}}
// --- Menüs mit dem Controller bedienen ---
function navRoot(){if(isOpen('tedit'))return $('tedit');if(isOpen('bizsel'))return $('bizsel');if(isOpen('netsel'))return $('netsel');if(isOpen('ctrl'))return $('ctrl');if(isOpen('credits2'))return $('credits2');
 if(mode==='title')return $('title');if(mode==='creator')return $('creator');if(mode==='menu')return panelOpen?$('panel'):pauseOpen?$('pause'):null;return null;}
function navActive(){return !!navRoot();}
function visibleEl(el){if(!el||!el.isConnected)return false;const r=el.getBoundingClientRect();if(r.width<2||r.height<2)return false;if(r.bottom<0||r.top>innerHeight+400)return false;const cs=getComputedStyle(el);return cs.visibility!=='hidden'&&cs.display!=='none'&&!el.disabled;}
function navItems(root){const out=[];for(const el of root.querySelectorAll('button,input,select,[data-nav]'))if(visibleEl(el))out.push(el);return out;}
function navKey(el){if(!el)return '';const d=JSON.stringify(Object.assign({},el.dataset||{})),pd=el.parentElement&&el.parentElement.dataset?JSON.stringify(Object.assign({},el.parentElement.dataset)):'{}';const k=(el.id||'')+'|'+d+'|'+pd;return k==='|{}|{}'?'':k;}
function setFocus(el){const N=PADS.nav;if(N.el&&N.el.classList)N.el.classList.remove('padf');N.el=el;N.key=el?navKey(el):'';if(el){el.classList.add('padf');try{el.scrollIntoView({block:'nearest',inline:'nearest'});}catch(e){}}}
function pickFirst(root){const nf=root.querySelector('.navfirst');if(nf&&visibleEl(nf))return nf;if(root.id==='panel'){const it=[...root.querySelectorAll('.pi:not(.dis)')].find(visibleEl);if(it)return it;}const items=navItems(root);return items[0]||null;}
function navMove(root,dir){const el=PADS.nav.el;
 if(el&&el.type==='range'&&(dir==='l'||dir==='r')){const st=+el.step||((+el.max-+el.min)/20);el.value=String(clamp(+el.value+(dir==='r'?st:-st),+el.min,+el.max));el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));tone(700,.02,'sine',.02);return;}
 const items=navItems(root);if(!items.length)return;if(!el||!items.includes(el)){setFocus(items[0]);return;}
 const r0=el.getBoundingClientRect(),cx=r0.left+r0.width/2,cy=r0.top+r0.height/2;let best=null,bs=1e9;
 for(const it of items){if(it===el)continue;const r=it.getBoundingClientRect(),dx=r.left+r.width/2-cx,dy=r.top+r.height/2-cy;let m,s;
  if(dir==='u'){m=-dy;s=dx;}else if(dir==='d'){m=dy;s=dx;}else if(dir==='l'){m=-dx;s=dy;}else{m=dx;s=dy;}
  if(m<=4)continue;const sc=m+Math.abs(s)*2.4;if(sc<bs){bs=sc;best=it;}}
 if(best){setFocus(best);tone(820,.015,'sine',.015);}}
function navActivate(){const el=PADS.nav.el;if(!el)return;if(el.tagName==='INPUT'&&el.type!=='range'){try{el.focus();}catch(e){}return;}el.click();}
function navBack(){if(isOpen('tedit')){closeTEdit();return;}if(isOpen('ctrl')){closeCtrl();return;}if(isOpen('credits2')){$('credits2').click();return;}
 if(mode==='menu'){vTap('Escape','pad');return;}if(mode==='creator'&&shopMode){closeShopCreator(false);return;}}
function pauseTabStep(d){const tabs=['map','stats','set','help'];const i=tabs.indexOf(pauseTab);showPauseTab(tabs[(i+d+tabs.length)%tabs.length]);uiClick();setFocus(null);}
function onMapTab(){return mode==='menu'&&pauseOpen&&!panelOpen&&pauseTab==='map'&&!isOpen('ctrl');}
function padNav(dt){const root=navRoot(),N=PADS.nav;
 if(root!==N.root){N.root=root;setFocus(null);N.dir='';}
 if(N.el&&!N.el.isConnected&&N.key){const k=N.key,it=navItems(root).find(e=>navKey(e)===k);if(it)setFocus(it);}
 if(!N.el||!visibleEl(N.el)||!root.contains(N.el))setFocus(pickFirst(root));
 const mapMode=onMapTab();const lx=mapMode?0:PADAX.lx,ly=mapMode?0:PADAX.ly;let dir='';
 if(pp(12)||ly<-.6)dir='u';else if(pp(13)||ly>.6)dir='d';else if(pp(14)||lx<-.6)dir='l';else if(pp(15)||lx>.6)dir='r';
 if(dir){if(dir!==N.dir){N.dir=dir;N.rt=.4;navMove(root,dir);}else{N.rt-=dt;if(N.rt<=0){N.rt=.11;navMove(root,dir);}}}else N.dir='';
 if(mapMode){MC.x=clamp(MC.x+PADAX.lx*dt*.55,0,1);MC.y=clamp(MC.y+PADAX.ly*dt*.55,0,1);if(pe(0))mapClickAt();if(pe(3))navActivate();}
 else if(pe(0))navActivate();
 if(pe(1)||(pe(8)&&mode==='menu'))navBack();
 if(pe(9)){if(mode==='menu'||isOpen('ctrl')||isOpen('tedit'))navBack();else if(mode==='creator')$('play').click();else navActivate();}
 if(mode==='menu'&&pauseOpen&&!panelOpen&&!isOpen('ctrl')){if(pe(4))pauseTabStep(-1);if(pe(5))pauseTabStep(1);}
 if(mode==='creator'&&PADAX.rx)creatorYaw-=PADAX.rx*2.6*dt;}
function mapClickAt(){const cv=$('bigmap');if(!cv||!cv.onclick)return;const r=cv.getBoundingClientRect();cv.onclick({clientX:r.left+MC.x*r.width,clientY:r.top+MC.y*r.height});}
function mapCursorTick(){const e=$('mapcur');if(!e)return;const on=SET.input==='pad'&&PADS.connected&&onMapTab();if(!on){if(e.style.display!=='none')e.style.display='none';return;}
 const cv=$('bigmap');if(!cv)return;const r=cv.getBoundingClientRect();e.style.display='block';e.style.left=(r.left+MC.x*r.width)+'px';e.style.top=(r.top+MC.y*r.height)+'px';}
// --- Controller-Taste neu belegen ---
function padCaptureStart(g,a){PADS.cap={g,a,wait:true,t:0};KCAP=null;renderCtrl();}
function padCaptureTick(dt){const c=PADS.cap;c.t+=dt;if(c.t>8){PADS.cap=null;renderCtrl();return;}
 if(c.wait){if(!PADS.cur.some(b=>b))c.wait=false;return;}
 const i=PADS.cur.findIndex((b,k)=>b&&!PADS.prev[k]);if(i<0)return;
 const old=PADB[c.g][c.a];const groups=c.g==='all'?Object.keys(PADB):[c.g,'all'];
 for(const g of groups)for(const a in PADB[g])if(PADB[g][a]===i&&!(g===c.g&&a===c.a))PADB[g][a]=g==='all'||c.g==='all'?-1:old;
 PADB[c.g][c.a]=i;PADS.cap=null;padSave();uiClick();renderCtrl();inputTexts();}
function padReset(){PADB=JSON.parse(JSON.stringify(PAD_DEF));padSave();renderCtrl();inputTexts();}
function sanP(p){const o={};if(p&&isFinite(p.x))o.x=clamp(+p.x,0,1);if(p&&isFinite(p.y))o.y=clamp(+p.y,0,1);if(p&&isFinite(p.s))o.s=clamp(+p.s,.06,.45);return o;}
function tLoad(){const s=lsGet(IN_LS.touch);TLAY=JSON.parse(JSON.stringify(TL_DEF));if(s&&typeof s==='object'){for(const k of ['joy','map','pause'])if(s[k])Object.assign(TLAY[k],sanP(s[k]));for(const c of ['foot','car','air'])if(s[c])for(const b in TLAY[c])if(s[c][b])Object.assign(TLAY[c][b],sanP(s[c][b]));}}
function tSave(){lsSet(IN_LS.touch,TLAY);}
function tLabel(id,ctx){const l=TB[id].l;return l[ctx]||l[lctx(ctx)]||l.all||'';}
function tVisible(ctx){
 if(ctx==='foot')return ['fire','aim','jump','sprint','use','reload','weapon'];
 if(ctx==='para')return P.para&&!P.para.open?['jump']:[];
 if(ctx==='car'){const l=['gas','brake','jump','use','horn','radio','job'];if(P.inCar&&P.inCar.vt==='tank')l.push('fire');return l;}
 const a=P.inAir,l=['jump','sprint','use'];if(ctx==='plane')l.push('gas','brake');if(a&&a.armed)l.push('fire','aim');return l;}
function tPos(id,ctx){const c=lctx(ctx);if(id==='map'||id==='pause'||id==='joy')return TLAY[id];return (TLAY[c]&&TLAY[c][id])||(TLAY.foot[id])||{x:.5,y:.5,s:.12};}
function tBtnHTML(id,ctx,p,extra){const px=p.s*tBase();return `<div class="tb${extra||''}" data-id="${id}" style="left:${(p.x*100).toFixed(2)}%;top:${(p.y*100).toFixed(2)}%;width:${px.toFixed(0)}px;height:${px.toFixed(0)}px"><i style="font-size:${(px*.36).toFixed(0)}px">${TB[id].i}</i><span style="font-size:${Math.max(9,px*.15).toFixed(0)}px">${tLabel(id,ctx)}</span></div>`;}
function tSync(){const show=SET.input==='touch'&&mode==='play'&&!P.dead;const layer=$('touch');if(!layer)return;
 if(!show){if(layer.style.display!=='none'){layer.style.display='none';tReleaseAll();}TCH.sig='';return;}
 if(layer.style.display!=='block')layer.style.display='block';
 const ctx=padCtx(),vis=tVisible(ctx);const sig=ctx+'|'+vis.join(',')+'|'+innerWidth+'x'+innerHeight;
 if(sig!==TCH.sig){TCH.sig=sig;const jp=TLAY.joy,js=jp.s*tBase();
  layer.innerHTML=`<div id="tjoy" style="left:${jp.x*100}%;top:${jp.y*100}%;width:${js.toFixed(0)}px;height:${js.toFixed(0)}px"><div class="knob"></div></div>`+[...vis,'map','pause'].map(id=>tBtnHTML(id,ctx,tPos(id,ctx))).join('');
  TCH.els={};for(const el of layer.querySelectorAll('.tb'))TCH.els[el.dataset.id]=el;if(TCH.joy)tJoyDraw();}
 const st={fire:fireHeld,aim:aimHeld,sprint:!!K.ShiftLeft,jump:!!K.Space,gas:!!K.KeyW,brake:!!K.KeyS};
 for(const id in TCH.els){const el=TCH.els[id];const on=!!st[id];if(el._on!==on){el._on=on;el.classList.toggle('on',on);}}
 TCH.hlT-=1;if(TCH.hlT<=0){TCH.hlT=12;const u=TCH.els.use;if(u){const can=!P.inCar&&!P.inAir&&!!(nearAction()||nearestCar(4.3)||nearestAir(7.5));if(u._hl!==can){u._hl=can;u.classList.toggle('hl',can);}}}}
function tJoyDraw(){const e=$('tjoy');if(!e)return;const j=TCH.joy;if(!j){const jp=TLAY.joy;e.style.left=jp.x*100+'%';e.style.top=jp.y*100+'%';const k=e.firstChild;if(k)k.style.transform='';return;}
 e.style.left=j.cx+'px';e.style.top=j.cy+'px';const k=e.firstChild;if(k)k.style.transform=`translate(${(TJ.x*j.R).toFixed(1)}px,${(TJ.y*j.R).toFixed(1)}px)`;}
function tJoyStart(e){const R=TLAY.joy.s*tBase()/2;const cx=clamp(e.clientX,R+4,innerWidth-R-4),cy=clamp(e.clientY,R+4,innerHeight-R-4);TCH.joy={id:e.pointerId,cx,cy,R};tJoyMove(e);}
function tJoyMove(e){const j=TCH.joy;let dx=(e.clientX-j.cx)/j.R,dy=(e.clientY-j.cy)/j.R;const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m;}TJ.x=dx;TJ.y=dy;tJoyDraw();}
function tJoyEnd(){TCH.joy=null;TJ.x=TJ.y=0;tJoyDraw();}
function tBtnDown(id,e){const b={id,x:e.clientX,y:e.clientY,wheel:false,timer:0};TCH.btn.set(e.pointerId,b);const el=TCH.els[id];if(el)el.classList.add('dn');const ctx=padCtx();
 if(id==='fire'){if(!wheelOpen){fireHeld=true;if(!P.inAir)tryFire();}}
 else if(id==='aim'){if(ctx==='foot'&&SET.aimToggle){aimHeld=!aimHeld;if(aimHeld)assistAcquire();}else{aimHeld=true;if(ctx==='foot')assistAcquire();}}
 else if(id==='use')vTap('KeyE','touch');else if(id==='reload')vTap('KeyR','touch');else if(id==='horn')vTap('KeyH','touch');else if(id==='radio')vTap('KeyQ','touch');else if(id==='job')vTap('KeyF','touch');
 else if(id==='map')vTap('KeyM','touch');else if(id==='pause')vTap('KeyP','touch');
 else if(id==='weapon')b.timer=setTimeout(()=>{if(TCH.btn.get(e.pointerId)===b&&mode==='play'){b.wheel=true;vPress('Tab','touch');}},320);
 try{if(SET.rumble&&navigator.vibrate)navigator.vibrate(8);}catch(_){}}
function tBtnUp(pid){const b=TCH.btn.get(pid);if(!b)return;TCH.btn.delete(pid);const el=TCH.els[b.id];if(el)el.classList.remove('dn');
 if(b.id==='fire')fireHeld=false;
 else if(b.id==='aim'){if(!(padCtx()==='foot'&&SET.aimToggle))aimHeld=false;}
 else if(b.id==='weapon'){clearTimeout(b.timer);if(b.wheel)vRelease('Tab','touch');else if(mode==='play'&&!P.inCar&&!P.inAir)cycleWeapon(1);}}
function tHoldCode(id){return id==='jump'?'Space':id==='sprint'?'ShiftLeft':id==='gas'?'KeyW':id==='brake'?'KeyS':null;}
function tReleaseAll(){for(const c of TCH.hold)vRelease(c,'touch');TCH.hold.clear();for(const [pid,b] of [...TCH.btn])tBtnUp(pid);TCH.joy=null;TCH.look=null;TJ.x=TJ.y=0;}
function tTick(dt){if(SET.input!=='touch'){if(TCH.hold.size||TCH.btn.size)tReleaseAll();tSync();return;}
 tSync();if(mode!=='play'){if(TCH.hold.size||TCH.btn.size)tReleaseAll();return;}
 const ctx=padCtx(),H=new Set(),x=TJ.x,y=TJ.y;
 if(!wheelOpen){
  if(ctx==='foot'||ctx==='para'){if(y<-.45)H.add('KeyW');if(y>.45)H.add('KeyS');if(x<-.45)H.add('KeyA');if(x>.45)H.add('KeyD');}
  else if(ctx==='car'){if(x<-.3)H.add('KeyA');if(x>.3)H.add('KeyD');if(y<-.55)H.add('KeyW');if(y>.55)H.add('KeyS');}
  else if(ctx==='heli'){if(y<-.35)H.add('KeyW');if(y>.35)H.add('KeyS');if(x<-.35)H.add('KeyA');if(x>.35)H.add('KeyD');}
  else{if(x<-.35)H.add('KeyA');if(x>.35)H.add('KeyD');const nu=SET.flightInv?y>.4:y<-.4,nd=SET.flightInv?y<-.4:y>.4;if(nu)H.add('Space');if(nd)H.add('ShiftLeft');}}
 for(const b of TCH.btn.values()){const v=tHoldCode(b.id);if(v)H.add(v);}
 for(const c of [...TCH.hold])if(!H.has(c)){TCH.hold.delete(c);vRelease(c,'touch');}
 for(const c of H)if(!TCH.hold.has(c)){TCH.hold.add(c);vPress(c,'touch');}}
function tLookMove(e){const L=TCH.look;const dx=e.clientX-L.x,dy=e.clientY-L.y;L.x=e.clientX;L.y=e.clientY;
 if(wheelOpen){wheelMouse(dx*1.5,dy*1.5);return;}
 const s=(scoped()?.3:aiming()?.6:1)*SET.touchSens;camYaw-=dx*.0062*s;camPitch=clamp(camPitch+dy*.0048*s*(SET.invY?-1:1),-.5,1.25);mouseIdle=0;}
function tEnd(e){const pid=e.pointerId;if(TCH.joy&&TCH.joy.id===pid)tJoyEnd();if(TCH.look&&TCH.look.id===pid)TCH.look=null;if(TCH.btn.has(pid))tBtnUp(pid);}
function assistOn(){return SET.assist!==false&&SET.input!=='kb';}
function assistCand(n){return n&&n.c&&n.c.g.visible&&n.hp>0&&n.state!=='ko'&&n.state!=='fly'&&n.state!=='ride'&&n.state!=='dead';}
function assistHostile(n){return n.kind==='dummy'||n.kind==='cop'&&wanted>0||n.aggro||n.state==='fight'||!!n.mission||!!(n.post&&n.post.alarmed)||n.state==='clerk';}
function assistFind(cone,range){const cp=camera.position,yaw=camYaw;const list=[];
 for(const n of peds){if(!assistCand(n))continue;const g=n.c.g.position,dx=g.x-cp.x,dz=g.z-cp.z,d=Math.hypot(dx,dz);if(d>range||d<1)continue;
  const ad=Math.abs(((Math.atan2(dx,dz)-yaw+Math.PI*3)%(Math.PI*2))-Math.PI);if(ad>cone)continue;list.push({n,s:ad*(assistHostile(n)?1:2.4)+d*.006});}
 list.sort((a,b)=>a.s-b.s);
 for(const c of list.slice(0,4)){const g=c.n.c.g.position,to=new THREE.Vector3(g.x-cp.x,g.y+1.2-cp.y,g.z-cp.z);const L=to.length();to.normalize();const h=raycast(cp.clone(),to,L+1,null);if(!h||h.npc===c.n||!h.npc&&h.point&&cp.distanceTo(h.point)>=L-.8)return c.n;}
 return null;}
function assistAcquire(){if(!assistOn()||P.inCar||P.inAir||P.dead)return;AST.t=assistFind(.62,55);AST.fast=.3;AST.chk=.3;}
function assistTick(dt){if(!assistOn()||!aimHeld||P.inCar||P.inAir||P.dead){AST.t=null;return;}
 const n=AST.t;if(!n||!assistCand(n)){AST.t=null;return;}
 const cp=camera.position,g=n.c.g.position,dx=g.x-cp.x,dy=g.y+1.2-cp.y,dz=g.z-cp.z,L=Math.hypot(dx,dy,dz);if(L>70){AST.t=null;return;}
 AST.chk-=dt;if(AST.chk<=0){AST.chk=.4;const ad=Math.abs(((Math.atan2(dx,dz)-camYaw+Math.PI*3)%(Math.PI*2))-Math.PI);if(ad>.9){AST.t=null;return;}}
 AST.fast-=dt;const userLook=SET.input==='pad'?Math.hypot(PADAX.rx,PADAX.ry)>.35:!!TCH.look;const rate=AST.fast>0?16:userLook?0:5;if(!rate)return;
 const k=Math.min(1,dt*rate);camYaw=lerpAng(camYaw,Math.atan2(dx,dz),k);camPitch=clamp(camPitch+(-Math.asin(clamp(dy/L,-1,1))-camPitch)*k,-.5,1.25);}
function assistMagnet(o,dir,range){if(!assistOn())return;let best=null,bc=.9955;
 for(const n of peds){if(!assistCand(n))continue;const g=n.c.g.position,vx=g.x-o.x,vy=g.y+1.2-o.y,vz=g.z-o.z,L=Math.hypot(vx,vy,vz);if(L>range||L<1)continue;const c=(vx*dir.x+vy*dir.y+vz*dir.z)/L;if(c>bc){bc=c;best=[vx/L,vy/L,vz/L];}}
 if(best)dir.set(best[0],best[1],best[2]);}
function padLbl(a,ctx){const c=lctx(ctx),B=PADB,n=padName;
 switch(a){case 'move':case 'steer':case 'left':case 'right':return 'L-Stick';case 'look':return 'R-Stick';
  case 'fwd':return c==='car'?n(B.car.gas):ctx==='plane'?n(B.air.up):'L-Stick ↑';case 'back':return c==='car'?n(B.car.brake):ctx==='plane'?n(B.air.down):'L-Stick ↓';
  case 'sprint':return ctx==='heli'?n(B.air.down):ctx==='plane'?'L-Stick':n(B.foot.sprint);
  case 'jump':return c==='car'?n(B.car.hand):ctx==='heli'?n(B.air.up):ctx==='plane'?'L-Stick':n(B.foot.jump);
  case 'use':return n(c==='car'?B.car.use:c==='air'?B.air.use:B.foot.use);
  case 'fire':return n(c==='car'?B.car.fire:c==='air'?B.air.fire:B.foot.fire);case 'aim':return n(c==='air'?B.air.aim:B.foot.aim);
  case 'reload':return n(B.foot.reload);case 'wheel':case 'weapons':return n(B.foot.wheel);case 'wnext':return n(B.foot.wnext);
  case 'job':return n(B.car.job>=0?B.car.job:B.foot.job);case 'horn':return n(B.car.horn);case 'radio':return n(B.car.radio);
  case 'map':return n(B.all.map);case 'pause':return n(B.all.pause);}return '—';}
function touchLbl(a,ctx){const c=lctx(ctx);
 switch(a){case 'move':case 'steer':case 'left':case 'right':return 'Joystick';case 'look':return 'Wischen';
  case 'fwd':return c==='car'?'▲ Gas':ctx==='plane'?'▲ Schub':'Joystick ↑';case 'back':return c==='car'||ctx==='plane'?'▼ Bremse':'Joystick ↓';
  case 'sprint':return '» '+tLabel('sprint',ctx);case 'jump':return '⤒ '+tLabel('jump',ctx);case 'use':return '✋';case 'fire':return '💥';case 'aim':return '🎯';case 'reload':return '⟳';
  case 'wheel':case 'wnext':case 'weapons':return '🔫';case 'job':return '★ Job';case 'horn':return '📯';case 'radio':return '📻';case 'map':return '🗺️';case 'pause':return '⏸️';}return '—';}
function LB(a,ctx){ctx=ctx||padCtx();const im=SET.input;if(im==='pad')return padLbl(a,ctx);if(im==='touch')return touchLbl(a,ctx);
 switch(a){case 'move':return [KB.fwd,KB.left,KB.back,KB.right].map(b=>keyName(b[0]||b[1])).join(' ');case 'steer':return keyName(KB.left[0]||KB.left[1])+' '+keyName(KB.right[0]||KB.right[1]);case 'look':return 'Maus';case 'weapons':return '1–0 / Mausrad';}
 const b=KB[a];return b?keyName(b[0]||b[1]):'—';}
function KT(s,ctx){if(s==null||s==='')return s;s=String(s);const im=SET.input;if(im==='kb'&&KB_DEF)return s;ctx=ctx||padCtx();
 const key=im+ctx+'|'+s;let r=KTC.get(key);if(r!==undefined)return r;r=ktDo(s,ctx);if(KTC.size>500)KTC.clear();KTC.set(key,r);return r;}
function ktDo(s,ctx){const im=SET.input,lb=a=>LB(a,ctx),K_=a=>`<k>${esc(lb(a))}</k>`;
 if(im!=='kb'){
  s=s.replace(/<k>W<\/k><k>A<\/k><k>S<\/k><k>D<\/k>/g,K_('move')).replace(/<k>A<\/k><k>D<\/k>/g,K_('steer'))
   .replace(/<k>W<\/k><k>S<\/k>/g,lctx(ctx)==='car'||ctx==='plane'?K_('fwd')+K_('back'):K_('move'))
   .replace(/<k>P<\/k> (oder|\/) <k>Esc<\/k>/g,K_('pause'))
   .replace(/Tasten <k>1<\/k>–<k>9<\/k>, <k>0<\/k> oder Mausrad wechseln die Waffe\./g,im==='pad'?`${K_('wheel')} gedrückt halten öffnet das Waffenrad, ${K_('wnext')} nimmt die nächste Waffe.`:'🔫 antippen wechselt die Waffe, gedrückt halten öffnet das Waffenrad.')
   .replace(/<k>1<\/k>–<k>9<\/k>, <k>0<\/k>(, Mausrad| oder Mausrad)?/g,K_('weapons'))
   .replace(/<k>(\d)<\/k> ([^<·]+?) wählen/g,(m,d,w)=>im==='pad'?`${w} im Waffenrad (${K_('wheel')}) wählen`:`${w} mit 🔫 wählen`)
   .replace(/ \(<k>\d<\/k>\)/g,'')
   .replace(/ – vorher einmal ins Bild klicken/g,'')
   .replace(/<b>Maus<\/b> umsehen/g,im==='pad'?'<k>R-Stick</k> umsehen':'<b>rechts wischen</b> = umsehen')
   .replace(/Mit der Maus zielst du/g,im==='pad'?'Mit dem rechten Stick zielst du':'Durch Wischen zielst du')
   .replace(/Maus zielt/g,im==='pad'?'R-Stick zielt':'Wischen zielt')
   .replace(/1–0 \/ Mausrad wechseln/g,im==='pad'?`${lb('wheel')} Waffenrad · ${lb('wnext')} nächste`:'🔫 wechseln')
   .replace(/Klick auf die Karte setzt einen/g,im==='pad'?`${padName(0)} setzt am Cursor (L-Stick) einen`:'Tipp auf die Karte setzt einen').replace(/Nochmal klicken entfernt ihn\./g,im==='pad'?`Nochmal ${padName(0)} entfernt ihn. Reiter: ${padName(4)} / ${padName(5)}`:'Nochmal tippen entfernt ihn.');}
 s=s.replace(/<k>([^<]+)<\/k>|<b>(Linksklick gedrückt halten|Linksklick|Rechtsklick|Mausrad)<\/b>|\b(Linksklick|Rechtsklick|Mausrad|Maustasten|Leertaste|Shift)\b|aus \(E\)|Nebenmission \(F\)|\b([EF]) drücken/g,(m,k,b,w,d)=>{
  if(k!=null){if(k==='Esc'&&im==='kb')return m;const a=KTOK[k];if(a)return K_(a);if(/^\d$/.test(k))return im==='kb'?m:K_('weapons');return m;}
  if(b!=null){if(b==='Linksklick gedrückt halten')return K_('fire')+' gedrückt halten';return K_(b==='Linksklick'?'fire':b==='Rechtsklick'?'aim':'weapons');}
  if(w!=null){if(w==='Linksklick')return lb('fire');if(w==='Rechtsklick')return lb('aim');if(w==='Mausrad')return im==='kb'?w:lb('weapons');if(w==='Maustasten')return lb('fire')+' / '+lb('aim');if(w==='Leertaste')return lb('jump');return lb('sprint');}
  if(m==='aus (E)')return 'aus ('+lb('use')+')';if(m==='Nebenmission (F)')return 'Nebenmission ('+lb('job')+')';
  if(d!=null)return lb(d==='E'?'use':'job')+' drücken';return m;});
 return s;}
function openCtrl(dev){CTRL.dev=dev||SET.input;KCAP=null;PADS.cap=null;$('ctrl').style.display='flex';renderCtrl();uiClick();}
function closeCtrl(){KCAP=null;PADS.cap=null;$('ctrl').style.display='none';uiClick();if(mode==='menu'&&pauseOpen&&pauseTab==='help')showPauseTab('help');renderInChoice();}
function rowSeg(n,k,opts){return `<div class="row"><span>${n}</span><div class="seg" data-k="${k}">${opts.map(([v,t])=>`<button data-v="${v}" class="${(+SET[k])===v?'on':''}">${t}</button>`).join('')}</div></div>`;}
function rowRange(n,k,a,b,st){return `<div class="row"><span>${n}</span><input type="range" min="${a}" max="${b}" step="${st}" data-k="${k}" value="${SET[k]}"></div>`;}
function renderCtrl(){if(!isOpen('ctrl'))return;const d=CTRL.dev;
 let h=`<div class="cdev">${['kb','pad','touch'].map(k=>`<button data-dev="${k}" class="${d===k?'on':''}">${DEV_NAME[k]}</button>`).join('')}</div>`;
 h+=`<div class="cuse">Aktiv im Spiel: <b>${DEV_NAME[SET.input]}</b>${d!==SET.input?`<button class="smallbtn" id="cuse">${DEV_NAME[d]} benutzen</button>`:''}</div>`;
 if(d==='kb'){h+=`<table class="btab"><tr><th>Aktion</th><th>Taste</th><th>Zweite Taste</th></tr>${ACT_IDS.map(a=>`<tr><td><b>${ACTS[a].n}</b>${ACTS[a].d?`<small>${ACTS[a].d}</small>`:''}</td>${[0,1].map(s=>{const cap=KCAP&&KCAP.a===a&&KCAP.s===s;return `<td><button class="kbtn${cap?' cap':''}" data-a="${a}" data-s="${s}">${cap?'Taste drücken …':esc(keyName(KB[a][s]))}</button></td>`;}).join('')}</tr>`).join('')}</table>
  <p class="tip">Klick auf ein Feld und drück dann die neue Taste oder Maustaste. <b>Esc</b> bricht ab. Mit <k>1</k>–<k>0</k> wählst du Waffen direkt, das Mausrad wechselt sie immer.</p>
  <div class="set">${rowRange('Maus-Empfindlichkeit','sens',.3,2,.05)}</div><div class="crow2"><button class="smallbtn" id="kbreset">Standard wiederherstellen</button></div>`;}
 else if(d==='pad'){h+=`<p class="pstat">${PADS.connected?'🟢 Verbunden: '+esc(PADS.id.slice(0,70)):'🔴 Noch kein Controller erkannt – schließ ihn an (USB oder Bluetooth) und drück eine Taste am Controller.'}</p>
  <div class="pcols">${['foot','car','air','all'].map(g=>`<div><h4>${PADG[g]}</h4>${PADA[g].map(([a,n])=>{const cap=PADS.cap&&PADS.cap.g===g&&PADS.cap.a===a;return `<div class="prow"><span>${n}</span><button class="kbtn${cap?' cap':''}" data-g="${g}" data-a="${a}">${cap?'Taste drücken …':padName(PADB[g][a])}</button></div>`;}).join('')}</div>`).join('')}</div>
  <div class="pfix"><b>Fest belegt:</b> linker Stick = laufen / lenken / steuern · rechter Stick = Kamera · im Menü: Steuerkreuz bewegen, ${padName(0)} auswählen, ${padName(1)} zurück, ${padName(4)}/${padName(5)} Reiter wechseln.</div>
  <div class="set">${rowRange('Kamera-Empfindlichkeit','padSens',.3,2.5,.05)}${rowSeg('Kamera hoch / runter','invY',[[0,'Normal'],[1,'Umgekehrt']])}${rowSeg('Flugzeug: Stick nach hinten =','flightInv',[[1,'Nase hoch'],[0,'Nase runter']])}${rowSeg('Zielhilfe (rastet auf Gegner ein)','assist',[[1,'An'],[0,'Aus']])}${rowSeg('Vibration','rumble',[[1,'An'],[0,'Aus']])}</div>
  <div class="crow2"><button class="smallbtn" id="padreset">Standard wiederherstellen</button></div>`;}
 else{h+=`<p class="tip">Links tippen und ziehen = Joystick zum Laufen, Lenken und Steuern (er erscheint da, wo du hintippst). Rechts wischen = Kamera drehen. Die Buttons wechseln automatisch – zu Fuß, im Fahrzeug und beim Fliegen gibt es eigene Layouts.<br>🔫 antippen = nächste Waffe, gedrückt halten = Waffenrad.</p>
  <div class="crow2"><button class="bigbtn" id="tedopen">✏️ Buttons verschieben & Größe ändern</button></div>
  <div class="set">${rowRange('Button-Sichtbarkeit','tOpacity',.25,1,.05)}${rowRange('Wisch-Empfindlichkeit','touchSens',.3,2.5,.05)}${rowSeg('Zielen-Button','aimToggle',[[1,'Antippen = an / aus'],[0,'Gedrückt halten']])}${rowSeg('Zielhilfe (rastet auf Gegner ein)','assist',[[1,'An'],[0,'Aus']])}${rowSeg('Flugzeug: Joystick nach hinten =','flightInv',[[1,'Nase hoch'],[0,'Nase runter']])}${rowSeg('Vibration beim Tippen','rumble',[[1,'An'],[0,'Aus']])}</div>`;}
 const cb=$('cbody');cb.innerHTML=h;
 for(const b of cb.querySelectorAll('.cdev button'))b.onclick=()=>{CTRL.dev=b.dataset.dev;KCAP=null;PADS.cap=null;uiClick();renderCtrl();};
 for(const b of cb.querySelectorAll('.kbtn[data-s]'))b.onclick=()=>{if(performance.now()-KCAP_IGN<500)return;kbCaptureStart(b.dataset.a,+b.dataset.s);};
 for(const b of cb.querySelectorAll('.kbtn[data-g]'))b.onclick=()=>padCaptureStart(b.dataset.g,b.dataset.a);
 const on=(id,f)=>{const e=cb.querySelector('#'+id);if(e)e.onclick=f;};
 on('kbreset',kbReset);on('padreset',padReset);on('tedopen',()=>openTEdit());on('cuse',()=>{setInput(CTRL.dev);renderCtrl();uiClick();});
 for(const s of cb.querySelectorAll('.seg'))s.onclick=e=>{const b=e.target.closest('button');if(!b)return;SET[s.dataset.k]=!!+b.dataset.v;saveSettings();KTC.clear();uiClick();renderCtrl();};
 for(const inp of cb.querySelectorAll('input[type=range]'))inp.oninput=()=>{SET[inp.dataset.k]=+inp.value;saveSettings();hudZoom();};}
function openTEdit(){TED.ctx='foot';TED.sel=null;$('tedit').style.display='block';renderTEdit();uiClick();}
function closeTEdit(){tSave();$('tedit').style.display='none';TCH.sig='';uiClick();}
function tedIds(){const c=TED.ctx;return [...Object.keys(TLAY[c]),'map','pause'];}
function renderTEdit(){const c=TED.ctx,area=$('tearea');const jp=TLAY.joy,js=jp.s*tBase();
 area.innerHTML=`<div class="tj${TED.sel==='joy'?' sel':''}" data-id="joy" style="left:${jp.x*100}%;top:${jp.y*100}%;width:${js.toFixed(0)}px;height:${js.toFixed(0)}px">Joystick</div>`+tedIds().map(id=>tBtnHTML(id,c==='air'?'heli':c,tPos(id,c==='air'?'heli':c),TED.sel===id?' sel':'')).join('');
 for(const b of $('tectx').querySelectorAll('button'))b.classList.toggle('on',b.dataset.c===c);
 const sel=TED.sel;$('tesel').textContent=sel?`Ausgewählt: ${sel==='joy'?'Joystick':TB[sel].i+' '+tLabel(sel,c==='air'?'heli':c)} – Größe mit dem Regler ändern`:'Zieh die Buttons an eine neue Stelle. Tipp einen an, um seine Größe zu ändern.';
 const sz=$('tesize');sz.disabled=!sel;if(sel)sz.value=String(tEdP(sel).s);}
function tEdP(id){return id==='joy'||id==='map'||id==='pause'?TLAY[id]:TLAY[TED.ctx][id];}
function renderInChoice(){try{const w=$('inwrap');if(!w||!w.querySelectorAll)return;for(const b of w.querySelectorAll('[data-in]'))b.classList.toggle('on',b.dataset.in===SET.input);
 const im=SET.input;$('insub').textContent=im==='kb'?'WASD laufen · Maus umsehen · Linksklick schießen':im==='touch'?'Joystick links · rechts wischen · Buttons frei verschiebbar':PADS.connected?'🟢 Controller verbunden':'Controller anschließen und eine Taste drücken';
 $('inbind').textContent=im==='touch'?'✏️ Buttons anpassen':im==='pad'?'⚙️ Controller-Tasten belegen':'⚙️ Tasten belegen';
 const sm=$('creator').querySelector('small');if(sm)sm.textContent=im==='touch'?'Wisch im Bild, um die Figur zu drehen.':im==='pad'?'Mit dem rechten Stick drehst du die Figur. Start = los geht’s.':'Mit gedrückter Maus im Bild kannst du die Figur drehen.';}catch(e){}}
// --- Querformat-Hinweis & Vollbild auf dem Handy ---
function portraitTick(){const e=$('tportrait');if(!e)return;const on=SET.input==='touch'&&(mode==='play'||mode==='cine'||mode==='mcine')&&innerHeight>innerWidth*1.05;const want=on?'flex':'none';if(e.style.display!==want)e.style.display=want;}
function goFullscreen(){if(SET.input!=='touch')return;try{const de=document.documentElement;if(!document.fullscreenElement&&de.requestFullscreen){const r=de.requestFullscreen({navigationUI:'hide'});if(r&&r.then)r.then(()=>{try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{});}catch(_){}}).catch(()=>{});}}catch(e){}}
function pollInput(dt){S(pollPad,dt);S(tTick,dt);updAN();inT-=dt;if(inT<=0){inT=.25;mapCursorTick();portraitTick();}else if(PADS.connected&&SET.input==='pad')mapCursorTick();}
function cineCar(color,type,pol){const c=makeCar(color,!!pol,type);c.mode='cine';cars.push(c);cineCars.push(c);return c;}
function removeCine(...cs){for(const c of cs){if(!c)continue;removeCar(c);const i=cineCars.indexOf(c);if(i>=0)cineCars.splice(i,1);}}
function setCar(c,x,z,h,sp){c.pos.set(x,0,z);c.g.position.set(x,groundY(x,z),z);c.h=h;c.g.rotation.y=h;c.speed=sp;}
function ctext(t){const e=$('ctext');if(e.dataset.t===t)return;e.dataset.t=t;e.style.opacity=0;setTimeout(()=>{if(e.dataset.t!==t)return;e.innerHTML=t;e.style.opacity=t?1:0;},350);}
function placeIntroBoat(T){const b=introBoat;const z=boatZ(T),sp=560/BOAT_T*(1-clamp(T/BOAT_T,0,1));b.pos.set(BOAT_DOCK.x+Math.sin(T*.5)*Math.max(0,1-T/BOAT_T)*3,0,z);b.h=Math.PI;b.speed=sp;
 b.g.position.set(b.pos.x,boatFloat(b,cineDt)+Math.sin(time*1.6)*.03,b.pos.z);b.g.rotation.y=b.h;b.body.rotation.x=-Math.min(.16,sp*.0055)+(b._wp||0);b.body.rotation.z=Math.sin(time*1.3)*.015+(b._wr||0);
 if(sp>5&&Math.random()<.6)smoke(new THREE.Vector3(b.pos.x+RR(-.6,.6),b.g.position.y+.5,b.pos.z+3.4),1+sp*.03,.92,.9);}
