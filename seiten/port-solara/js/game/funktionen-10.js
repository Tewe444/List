'use strict';
function navUpd(k,tg,p){if(!tg){NAVR[k]=null;return;}let R=NAVR[k];
 if(Math.hypot(tg.x-p.x,tg.z-p.z)<(p.air?40:P.inCar?55:85)){NAVR[k]=null;return;}// nah genug: Marker ist sichtbar, keine Route nötig
 if(p.air||p.boat){NAVR[k]={pts:[[p.x,p.z],[tg.x,tg.z]],idx:0,px:p.x,pz:p.z,tx:tg.x,tz:tg.z,direct:true,at:time,rem:Math.hypot(tg.x-p.x,tg.z-p.z)};return;}
 const moved=!R||R.direct&&!R.road||Math.hypot(R.tx-tg.x,R.tz-tg.z)>14;let need=moved;
 if(!need){const d=navProgress(R,p);if(d>(P.inCar?18:26)){R.off=(R.off||0)+1;if(R.off>=2)need=true;}else R.off=0;}
 if(need&&(moved||time-R.at>.8)){const r=navRoute(p.x,p.z,p.h,p.mv,tg.x,tg.z);if(r){r.at=time;r.tx=tg.x;r.tz=tg.z;r.road=!r.direct;NAVR[k]=r;navProgress(r,p);}}}
function navTick(dt){if(mode!=='play')return;NAVR.t-=dt;if(NAVR.t>0)return;NAVR.t=.3;const p=navPlayer();
 if(waypoint&&Math.hypot(waypoint.x-p.x,waypoint.z-p.z)<(P.inCar?16:8)){waypoint=null;NAVR.wp=null;toast('Ziel erreicht');tone(880,.12,'sine',.05);setTimeout(()=>tone(1320,.15,'sine',.05),120);}
 navUpd('mission',marker.visible?{x:marker.position.x,z:marker.position.z}:null,p);
 navUpd('wp',waypoint,p);}
function navDraw(g,W,Z,lw){g.save();g.lineJoin='round';g.lineCap='round';
 for(const [k,col] of [['wp','#c060ff'],['mission','#ffd23a']]){const R=NAVR[k];if(!R||R.pts.length<2)continue;const P0=R.pts;
  for(const pass of [0,1]){g.strokeStyle=pass?col:'rgba(0,0,0,.55)';g.lineWidth=pass?lw:lw+3;g.setLineDash(R.direct?[lw*1.6,lw*1.4]:[]);g.beginPath();g.moveTo(W(R.px??P0[0][0]),Z(R.pz??P0[0][1]));for(let i=(R.idx||0)+1;i<P0.length;i++)g.lineTo(W(P0[i][0]),Z(P0[i][1]));g.stroke();}}
 g.setLineDash([]);g.restore();}
function navRem(){const R=NAVR.mission||NAVR.wp;return R&&R.rem!=null?R.rem:null;}
// ---------- Ziele auf der Karte auswählen ----------
function navSetWaypoint(x,z,name){waypoint={x,z,name:name||null};NAVR.wp=null;try{navUpd('wp',waypoint,navPlayer());}catch(e){}if(name)toast('Route zu: '+name);}
function navPickType(type){const p0=navPlayer();
 if(type==='mission'){if(mission){toast('Du bist schon in einer Mission – folge der gelben Route.');return;}if(storyDone||mi>=missions.length){toast('Keine Hauptmission mehr offen.');return;}const ct=CONTACTS[missions[mi].contact],cp=ct.pos();navSetWaypoint(cp.x,cp.z,'Mission: '+missions[mi].name);return;}
 let best=null,bd=1e18;for(const p of places){if(p.type!==type||!p.blip||!isUnlocked(p.type))continue;const d=Math.hypot(p.x-p0.x,p.z-p0.z);if(d<bd){bd=d;best=p;}}
 if(best)navSetWaypoint(best.x,best.z,best.name);}
function renderOpts(){
 const box=$('opts');box.innerHTML='';
 for(const k in SK){const grp=document.createElement('div');const l=document.createElement('div');l.className='lbl';l.textContent=SKL[k];grp.appendChild(l);
  const ch=document.createElement('div');ch.className='chips';
  SK[k].forEach((v,i)=>{const b=document.createElement('button');b.dataset.k=k;b.dataset.i=i;
   if(typeof v==='number'){b.className='sw'+(skin[k]===i?' on':'');b.style.background='#'+v.toString(16).padStart(6,'0');}
   else{b.className='chip'+(skin[k]===i?' on':'');b.textContent=v;}
   b.onclick=()=>{skin[k]=i;rebuildPlayer();renderOpts();uiClick();};ch.appendChild(b);});
  grp.appendChild(ch);box.appendChild(grp);}
}
function setCreatorMode(shop){shopMode=shop;{const iw=$('inwrap');if(iw)iw.style.display=shop?'none':'block';}const sm=$('creator').querySelector('small');if(sm)sm.textContent=shop?'Outfit auswählen und für $150 kaufen. Änderungen gelten erst nach dem Kauf.':'Dein Start-Outfit festlegen. Spätere Outfit-Wechsel gibt es nur in Kleidungsgeschäften.';$('ctitle2').textContent=shop?'MODE SOLARA':'DEIN CHARAKTER';$('namewrap').style.display=shop?'none':'block';$('play').textContent=shop?'KAUFEN – $150':"LOS GEHT'S ▶";$('ccancel').style.display=shop?'block':'none';}
function openCreator(){
 if(mode!=='title')return;renderer.domElement.style.display='block';setCreatorMode(false);mode='creator';$('title').style.display='none';$('creator').style.display='flex';renderOpts();renderInChoice();
 const nm=(()=>{try{return localStorage.getItem('portsolara_name')||'';}catch(e){return '';}})();if(nm&&!$('name').value)$('name').value=nm;
 P.pos.set(SPAWN.x,0,SPAWN.z);P.face=Math.PI*0.75;creatorYaw=0;
}
function openShopCreator(){if(P.inCar||P.inAir)return;shopBackup=JSON.stringify(skin);setCreatorMode(true);mode='creator';for(const k in K)K[k]=false;try{(document.exitPointerLock||document.webkitExitPointerLock||(()=>{})).call(document);}catch(e){}try{(()=>{})();}catch(e){}aimHeld=false;fireHeld=false;
 $('hud').style.display='none';$('creator').style.display='flex';renderOpts();creatorYaw=0;speakAs('Verkäufer','Willkommen bei Mode Solara! Probier ruhig alles an.');}
function closeShopCreator(buy){if(buy){if(P.money<150){toast('Nicht genug Geld!');tone(160,.2,'square',.05);return;}P.money-=150;cashSound();try{localStorage.setItem('portsolara_skin',JSON.stringify(skin));}catch(e){}toast('Neues Outfit gekauft!');}
 else{try{skin=JSON.parse(shopBackup);}catch(e){}rebuildPlayer();}
 shopMode=false;$('creator').style.display='none';$('hud').style.display='block';mode='play';last=performance.now();lockMouse();}
function startGame(){
 if(mode!=='creator'||shopMode)return;
 goFullscreen();lockMouse();
 P.name=$('name').value.trim()||'Fremder';
 try{localStorage.setItem('portsolara_skin',JSON.stringify(skin));localStorage.setItem('portsolara_name',P.name);}catch(e){}
 try{document.activeElement&&document.activeElement.blur&&document.activeElement.blur();}catch(e){}clearKeys();
 ensureAudio();startIntro();
}
function beginPlay(){
 $('creator').style.display='none';$('title').style.display='none';$('cine').style.display='none';$('hud').style.display='block';
 P.pos.set(JX,.5,WATER_Z+20);P.face=Math.PI;P.char.g.visible=true;P.char.g.position.copy(P.pos);P.char.g.rotation.set(0,P.face,0);
 mode='play';last=performance.now();camYaw=Math.PI;camPitch=.25;
 camera.position.set(P.pos.x,P.pos.y+3,P.pos.z+6);camera.fov=62;camera.updateProjectionMatrix();updateStaticLOD(true);
 try{document.activeElement&&document.activeElement.blur&&document.activeElement.blur();}catch(e){}clearKeys();
 ensureAudio();lockMouse();missionWait=2;PROG.unlockSeen=0;
}
function wBuild(id){const parts=[];const mats=[];const mi=m=>{let i=mats.indexOf(m);if(i<0){mats.push(m);i=mats.length-1;}return i;};
 const add=(geo,m,x,y,z,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>{const g=(geo.index?geo.toNonIndexed():geo.clone());g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(sx,sy,sz)));for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);parts.push([g,mi(m)]);};
 const B=(w,h,d,m,x,y,z,rx,ry,rz)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z,rx,ry,rz);
 const C=(r0,r1,len,m,x,y,z,seg=12,rx=Math.PI/2,ry=0,rz=0)=>add(new THREE.CylinderGeometry(r0,r1,len,seg),m,x,y,z,rx,ry,rz);
 const A=(w,h,d,m,x,yT,zT,th,t)=>B(w,h,d,m,x,yT-Math.cos(th)*t,zT-Math.sin(th)*t,th);
 const W=WMAT;
 if(id==='pistol'){B(.032,.036,.188,W.metal,0,.034,.062);for(let i=0;i<6;i++)B(.034,.028,.004,W.steel,0,.036,-.02+i*.008);B(.012,.008,.03,W.poly,0,.036,.1);
  B(.029,.022,.165,W.poly,0,.006,.058);C(.0065,.0065,.02,W.steel,0,.033,.16,10);B(.005,.008,.006,W.metal,0,.056,.15);for(const s of [-1,1])B(.005,.008,.006,W.metal,s*.007,.056,-.026);
  A(.028,.116,.048,W.poly,0,-.002,-.008,.26,.058);for(let i=0;i<5;i++)A(.031,.006,.04,W.metal,0,-.002,-.008,.26,.022+i*.019);A(.031,.008,.052,W.steel,0,-.002,-.008,.26,.118);
  B(.006,.004,.05,W.poly,0,-.016,.035);B(.006,.022,.004,W.poly,0,-.006,.06);B(.004,.016,.004,W.steel,0,-.006,.028,.3);}
 else if(id==='smg'){B(.05,.062,.25,W.metal,0,.03,.06);C(.022,.022,.17,W.poly,0,.032,.255,14);for(let i=0;i<5;i++)C(.023,.023,.008,W.steel,0,.032,.19+i*.03,14);C(.009,.009,.06,W.steel,0,.032,.36,10);
  A(.034,.17,.04,W.poly,0,.004,.13,-.04,.085);A(.037,.007,.045,W.steel,0,.004,.13,-.04,.171);A(.032,.1,.045,W.poly,0,.002,-.022,.28,.05);B(.008,.004,.06,W.poly,0,-.006,.02);B(.006,.024,.004,W.poly,0,-.002,.04);
  for(const s of [-1,1])B(.006,.006,.2,W.steel,s*.018,.02,-.17);B(.044,.05,.012,W.steel,0,.02,-.27);B(.012,.02,.03,W.steel,0,.068,.13);B(.012,.016,.012,W.steel,0,.068,-.05);B(.016,.012,.03,W.steel,.03,.045,.02);}
 else if(id==='rifle'){B(.05,.055,.3,W.metal,0,.038,.05);B(.046,.045,.22,W.metal,0,.0,.05);C(.026,.026,.3,W.poly,0,.04,.35,8);for(const [x,y] of [[0,.068],[.028,.04],[-.028,.04],[0,.012]])B(x?.008:.02,x?.02:.008,.29,W.metal,x,y,.35);
  C(.009,.009,.24,W.steel,0,.04,.58,10);C(.014,.014,.05,W.metal,0,.04,.715,10);for(let i=0;i<3;i++)B(.016,.003,.008,W.poly,0,.054,.7+i*.012);B(.008,.05,.012,W.metal,0,.075,.48);
  B(.022,.012,.26,W.metal,0,.072,.05);B(.03,.032,.05,W.poly,0,.098,.06);C(.012,.012,.012,W.lens,0,.1,.087,12);C(.014,.014,.01,W.poly,0,.1,.036,12);
  A(.032,.125,.06,W.metal,0,-.016,.13,-.14,.0625);A(.033,.125,.06,W.metal,0,-.016-Math.cos(-.14)*.12,.13-Math.sin(-.14)*.12,-.42,.0625);A(.034,.108,.046,W.poly,0,-.018,-.036,.34,.054);B(.006,.004,.06,W.metal,0,-.018,.03);B(.006,.022,.004,W.metal,0,-.01,.05);
  B(.026,.022,.2,W.metal,0,.02,-.19);B(.042,.075,.18,W.poly,0,.0,-.23);B(.046,.09,.02,W.tape,0,.0,-.33);B(.008,.012,.04,W.steel,0,.06,-.12);}
 else if(id==='shotgun'){B(.05,.06,.24,W.metal,0,.03,.0);C(.013,.013,.62,W.steel,0,.045,.43,12);C(.011,.011,.5,W.metal,0,.016,.36,10);B(.05,.05,.2,W.wood,0,.016,.34);for(let i=0;i<7;i++)B(.052,.004,.008,W.woodD,0,.04,.26+i*.025);
  add(new THREE.SphereGeometry(.004,6,4),W.brass,0,.06,.735);B(.006,.004,.06,W.metal,0,-.01,.0);B(.006,.022,.004,W.metal,0,-.006,.02);B(.04,.052,.13,W.wood,0,.022,-.18,-.13);B(.044,.096,.2,W.wood,0,-.006,-.33,-.08);B(.047,.1,.022,W.tape,0,-.014,-.437,-.08);B(.046,.022,.1,W.woodD,0,-.044,-.3,-.08);B(.006,.006,.03,W.brass,.026,.03,.05);}
 else if(id==='sniper'){B(.052,.056,.32,W.metal,0,.03,.0);C(.012,.01,.68,W.steel,0,.035,.5,12);C(.019,.019,.06,W.metal,0,.035,.86,12);for(let i=0;i<4;i++)B(.04,.004,.01,W.metal,0,.035,.84+i*.015);
  C(.022,.022,.3,W.poly,0,.105,.02,14);C(.022,.032,.06,W.poly,0,.105,.2,14);C(.032,.032,.02,W.poly,0,.105,.24,14);C(.028,.028,.004,W.lens,0,.105,.251,14);C(.022,.028,.05,W.poly,0,.105,-.15,14);C(.026,.026,.004,W.lens,0,.105,-.176,14);
  C(.011,.011,.03,W.metal,0,.13,.03,10,0);C(.011,.011,.03,W.metal,.03,.105,.03,10,0,0,Math.PI/2);for(const z of [-.06,.1])B(.024,.024,.014,W.metal,0,.075,z);
  C(.004,.004,.06,W.steel,.035,.04,-.06,8,0,0,Math.PI/2.4);add(new THREE.SphereGeometry(.011,8,6),W.steel,.062,.03,-.06);
  B(.05,.07,.42,W.olive,0,-.005,.25);A(.044,.11,.055,W.olive,0,.0,-.07,.3,.055);B(.048,.1,.3,W.olive,0,-.02,-.29,-.04);B(.03,.03,.16,W.olive,0,.04,-.3,-.04);B(.05,.11,.025,W.tape,0,-.026,-.45,-.04);
  for(const s of [-1,1])C(.004,.004,.2,W.metal,s*.012,-.025,.5,6);B(.032,.06,.05,W.metal,0,-.05,.05);}
 else if(id==='rpg'){C(.055,.055,1.0,W.olive,0,.09,.12,16);C(.06,.06,.03,W.metal,0,.09,.6,16);C(.07,.055,.12,W.olive,0,.09,-.43,16);
  C(.055,.075,.12,W.olive,0,.09,.68,16);add(new THREE.SphereGeometry(.075,16,10),W.olive,0,.09,.75,0,0,0,1,1,1.4);add(new THREE.ConeGeometry(.045,.14,14),W.olive,0,.09,.89,Math.PI/2);C(.012,.012,.05,W.metal,0,.09,.97,8);
  A(.035,.12,.05,W.poly,0,.04,.02,.24,.06);A(.035,.11,.05,W.poly,0,.04,.26,-.04,.055);B(.03,.05,.07,W.metal,-.06,.15,.2);B(.012,.02,.012,W.metal,-.06,.185,.22);for(const s of [-1,1])B(.012,.012,.3,W.poly,s*.058,.1,-.15);}
 else if(id==='knife'){B(.026,.03,.11,W.poly,0,0,-.03);for(let i=0;i<4;i++)B(.028,.032,.006,W.tape,0,0,-.07+i*.025);B(.07,.012,.014,W.steel,0,0,.03);add(new THREE.SphereGeometry(.016,8,6),W.steel,0,0,-.09);
  add(new THREE.BoxGeometry(.006,.034,.22),W.blade,0,.004,.15);add(new THREE.ConeGeometry(.018,.06,4),W.blade,0,.004,.29,Math.PI/2,0,Math.PI/4,.35,1,1);B(.007,.004,.18,W.steel,0,.02,.13);}
 else if(id==='bat'){C(.05,.032,.42,W.bat,0,0,.55,16);C(.032,.019,.32,W.bat,0,0,.18,16);C(.02,.02,.2,W.tape,0,0,-.08,12);add(new THREE.SphereGeometry(.032,12,8),W.bat,0,0,.76,0,0,0,1,1,.5);C(.03,.03,.02,W.bat,0,0,-.19,12);for(let i=0;i<5;i++)C(.0205,.0205,.006,W.tape,0,0,-.17+i*.035,12);}
 else if(id==='grenade'){add(new THREE.SphereGeometry(.075,16,12),W.gren,0,0,.05,0,0,0,1,1.18,1);for(let i=0;i<3;i++)add(new THREE.TorusGeometry(.073,.006,6,20),W.gren,0,(i-1)*.04,.05,Math.PI/2);for(let i=0;i<4;i++)add(new THREE.TorusGeometry(.078,.005,6,20),W.gren,0,0,.05,0,i*Math.PI/4);
  C(.022,.022,.04,W.metal,0,.095,.05,10,0);B(.014,.11,.006,W.steel,.022,.06,.05,0,0,-.15);add(new THREE.TorusGeometry(.016,.003,6,14),W.brass,-.028,.1,.05,0,Math.PI/2);}
 if(!parts.length)return null;parts.sort((a,b)=>a[1]-b[1]);const geo=mergeGeometries(parts.map(p=>p[0]),false);if(!geo)return null;geo.clearGroups();let st=0,cur=-1,cs=0;for(const [g,m] of parts){const n=g.attributes.position.count;if(m!==cur){if(cur>=0)geo.addGroup(cs,st-cs,cur);cur=m;cs=st;}st+=n;}geo.addGroup(cs,st-cs,cur);
 geo.computeBoundingBox();geo.computeBoundingSphere();return {geo,mats};}
function weaponModel(id){const g=new THREE.Group();let W=WGEO.get(id);if(W===undefined){W=wBuild(id);WGEO.set(id,W);}
 if(W){const m=new THREE.Mesh(W.geo,W.mats);m.castShadow=true;g.add(m);}return g;}
function attachWeapon(){if(!P.char)return;const h=P.char.handR;h.clear();const w=WEAPONS[INV.cur];if(w.id!=='fist'&&!(w.thrown&&!(INV.ammo[w.id]>0))){const m=weaponModel(w.id);m.rotation.x=Math.PI/2;h.add(m);}}
function giveWeapon(id,ammo=0){const w=WEAPONS[WI[id]];const first=!INV.owned[id];INV.owned[id]=true;
 if(w.thrown)INV.ammo[id]=(INV.ammo[id]||0)+ammo;
 else if(!w.melee){INV.ammo[id]=(INV.ammo[id]||0)+ammo;if(INV.clip[id]==null){const c=Math.min(w.mag,INV.ammo[id]);INV.clip[id]=c;INV.ammo[id]-=c;}}
 if(first&&!w.melee&&!w.thrown&&curW().melee)selectWeapon(WI[id]);else if(INV.cur===WI[id])attachWeapon();}
function selectWeapon(i){if(i<0||i>=WEAPONS.length||!INV.owned[WEAPONS[i].id])return;INV.cur=i;reloadT=0;attachWeapon();tone(700,.04,'square',.02);}
function cycleWeapon(d){for(let k=1;k<=WEAPONS.length;k++){const i=((INV.cur+d*k)%WEAPONS.length+WEAPONS.length)%WEAPONS.length;if(INV.owned[WEAPONS[i].id]){selectWeapon(i);return;}}}
function toast(t){const e=$('toast');e.textContent=KT(t);e.style.opacity=1;toastT=2.4;}
function cashPop(t,col='#7dff8a'){const e=$('cashpop');if(!e)return;e.textContent=t;e.style.color=col;e.style.opacity=1;cashPopT=1.6;}

// ---------- Strahlen-Treffer ----------
function rayAABB(o,d,b,maxT){let t0=0,t1=maxT;const mn=[b.x0,0,b.z0],mx=[b.x1,b.h,b.z1],oo=[o.x,o.y,o.z],dd=[d.x,d.y,d.z];
 for(let a=0;a<3;a++){if(Math.abs(dd[a])<1e-9){if(oo[a]<mn[a]||oo[a]>mx[a])return -1;}else{let ta=(mn[a]-oo[a])/dd[a],tb=(mx[a]-oo[a])/dd[a];if(ta>tb){const t=ta;ta=tb;tb=t;}if(ta>t0)t0=ta;if(tb<t1)t1=tb;if(t0>t1)return -1;}}return t0;}
function terrainHitT(o,d,maxT){const st=1.6,n=Math.min(Math.ceil(maxT/st),260);let pt=0,pd=o.y-groundY(o.x,o.z);if(pd<-.5)return -1;
 for(let k=1;k<=n;k++){const t=Math.min(maxT,k*st);const x=o.x+d.x*t,z=o.z+d.z*t,dd=o.y+d.y*t-groundY(x,z);if(dd<0){return pt+(t-pt)*pd/Math.max(1e-4,pd-dd);}pt=t;pd=dd;}return -1;}
function worldHitT(o,d,maxT){let best=maxT;{const tg=terrainHitT(o,d,maxT);if(tg>=0&&tg<best)best=tg;}
 const seen=new Set();const steps=Math.ceil(maxT/25);
 for(let k=0;k<=steps;k++){const t=Math.min(maxT,k*25);if(t>best+25)break;const x=o.x+d.x*t,z=o.z+d.z*t;for(const sd of solidsNear(x,z,26)){if(sd.h<=0||sd.water||sd.open||sd.camOnly||seen.has(sd))continue;seen.add(sd);const th=rayAABB(o,d,sd,best);if(th>=0&&th<best)best=th;}}
 return best;}
function charHit(o,d,base,maxT,r,h){const dx=d.x,dz=d.z,hh=dx*dx+dz*dz;if(hh<1e-8)return -1;const t=((base.x-o.x)*dx+(base.z-o.z)*dz)/hh;if(t<0||t>maxT)return -1;
 const px=o.x+dx*t-base.x,pz=o.z+dz*t-base.z;if(px*px+pz*pz>r*r)return -1;const y=o.y+d.y*t-base.y;if(y<0||y>h)return -1;return t;}
function sphereHit(o,d,c,r,maxT){const ox=o.x-c.x,oy=o.y-c.y,oz=o.z-c.z;const b=ox*d.x+oy*d.y+oz*d.z,cc=ox*ox+oy*oy+oz*oz-r*r;const disc=b*b-cc;if(disc<0)return -1;const t=-b-Math.sqrt(disc);return t>=0&&t<maxT?t:-1;}
function raycast(o,d,range,ignore){
 let best=worldHitT(o,d,range),res={};
 for(const n of peds){if(n===ignore||n.state==='ko'||n.state==='fly'||n.state==='ride'||!n.c.g.visible&&n.kind!=='dummy')continue;const dm=n.kind==='dummy';
  if(dm){const t=charHit(o,d,n.c.g.position,best,.6,n.dh);if(t>=0&&t<best){best=t;res={npc:n,head:false};}continue;}
  if(charHit(o,d,n.c.g.position,best,.9,2.3)<0&&charHit(o,d,n.c.g.position,best+1,.9,2.3)<0)continue;// grober Vortest, dann exakte Körper-Kapseln
  const h=charRayHit(n.c,o,d,best);if(h&&h.t<best){best=h.t;res={npc:n,head:h.head};}}
 for(const c of cars){if(c===P.inCar||c===ignore||c.mode==='cine')continue;const wx=c.pos.x-o.x,wy=c.g.position.y+1-o.y,wz=c.pos.z-o.z,R=(c.vt==='tank'?7:c.boat?4.5:c.rad*2.2)+.5,tp=wx*d.x+wy*d.y+wz*d.z;if(tp<-R||tp>best+R)continue;const qx=wx-d.x*tp,qy=wy-d.y*tp,qz=wz-d.z*tp;if(qx*qx+qy*qy+qz*qz>R*R)continue;const t=vehRayHit(c,o,d,best);if(t>=0&&t<best){best=t;res={car:c};}}
 for(const a of aircraft){if(a===P.inAir||a===ignore||a.dead)continue;const t=airRayHit(a,o,d,best);if(t>=0&&t<best){best=t;res={air:a};}}
 res.t=best;res.point=o.clone().addScaledVector(d,best);return res;}
function sprite(tex,color,additive=true){return new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color,transparent:true,depthWrite:false,blending:additive?THREE.AdditiveBlending:THREE.NormalBlending,fog:!additive}));}
function flash(p,size=.7){const sp=sprite(flashTex,new THREE.Color(4,3,2));sp.position.copy(p);sp.scale.setScalar(size);scene.add(sp);fx.push({s:sp,t:.06,life:.06});}
function sparks(p){for(let k=0;k<5;k++){const sp=sprite(flashTex,new THREE.Color(3,2.2,1));sp.position.copy(p);sp.scale.setScalar(.2);scene.add(sp);fx.push({s:sp,t:.25,life:.25,vel:new THREE.Vector3(RR(-3,3),RR(0,5),RR(-3,3)),grav:true});}}
function smoke(p,size=2,dark=.35,life=2.5){if(fx.length>420)return;const sp=sprite(smokeTex,new THREE.Color(dark,dark,dark),false);sp.position.copy(p);sp.scale.setScalar(size);scene.add(sp);fx.push({s:sp,t:life,life,vel:new THREE.Vector3(RR(-.5,.5),RR(1.5,3),RR(-.5,.5)),grow:size*.7,fade:.75});}
function fire(p,size=1.6){if(fx.length>420)return;const sp=sprite(flashTex,new THREE.Color(3.2,1.5,.35));sp.position.copy(p);sp.scale.setScalar(size);scene.add(sp);fx.push({s:sp,t:.5,life:.5,vel:new THREE.Vector3(RR(-.4,.4),RR(2,3.5),RR(-.4,.4)),grow:-size*.8});}
function tracer(a,b){const g=new THREE.BufferGeometry().setFromPoints([a.clone(),b.clone()]);const l=new THREE.Line(g,tracerMat.clone());scene.add(l);tracers.push({l,t:.07});}
function updateFX(dt){
 for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t-=dt;if(f.vel){f.s.position.addScaledVector(f.vel,dt);if(f.grav)f.vel.y-=15*dt;}if(f.grow){f.s.scale.addScalar(f.grow*dt);if(f.s.scale.x<.05)f.t=0;}
  f.s.material.opacity=Math.max(0,f.t/f.life)*(f.fade||1);if(f.t<=0){scene.remove(f.s);f.s.material.dispose();fx.splice(i,1);}}
 for(let i=tracers.length-1;i>=0;i--){const t=tracers[i];t.t-=dt;t.l.material.opacity=Math.max(0,t.t/.07);if(t.t<=0){scene.remove(t.l);t.l.geometry.dispose();t.l.material.dispose();tracers.splice(i,1);}}}

// ---------- Fahndung & Schaden ----------
function noHeat(){return mission&&mission.steps[si]&&mission.steps[si].noHeat;}
const HEAT={pts:0,lvlT:0};
function addHeat(n,cop){if(noHeat()||(activity&&activity.noHeat))return;if(heatT>0)return;heatT=cop?1.2:2.5;
 if(wanted===0){setWanted(cop?2:1);return;}if(cop&&wanted<2){setWanted(2);return;}
 HEAT.pts+=n*(cop?1:.6);const need=wanted===1?1:wanted===2?3:wanted===3?6:10,minT=wanted<=2?5:wanted===3?25:40;
 if(HEAT.pts>=need&&time-HEAT.lvlT>minT){HEAT.pts=0;setWanted(Math.min(5,wanted+1));}}
{const _sw=setWanted;setWanted=function(n){const o=wanted;const r=_sw.apply(this,arguments);if(wanted!==o){HEAT.lvlT=time;if(wanted<o)HEAT.pts=0;}return r;};}
// Suchmodus: Sieht dich keine Streife und kein Heli, sucht die Polizei nur am zuletzt gesehenen Ort
const SEEN={pos:null,t:-99,set:false};
setInterval(()=>{try{if(mode!=='play'||wanted===0){SEEN.pos=null;return;}let seen=false;
 for(const c of police){if(Math.hypot(c.pos.x-P.pos.x,c.pos.z-P.pos.z)<70){seen=true;break;}}
 if(!seen)for(const n of peds){if(n.kind==='cop'&&n.state==='fight'&&n.c.g.position.distanceTo(P.pos)<50){seen=true;break;}}
 if(!seen&&policeHeli&&policeHeli.g.position.distanceTo(P.pos)<110)seen=true;
 if(seen||!SEEN.pos){SEEN.pos=P.pos.clone();SEEN.t=time;if(SEEN.set){SEEN.set=false;GPS_TRACK.lastAt=-9999;}}
 else if(time-SEEN.t>3){if(!SEEN.set)toast('Die Polizei hat dich aus den Augen verloren – bleib außer Sicht!');SEEN.set=true;GPS_TRACK.last=SEEN.pos;GPS_TRACK.lastAt=time;}}catch(e){}},250);
function hitMarker(){hitT=.15;}
function spawnCash(x,z,amt){const m=new THREE.Mesh(cashGeo,cashMat);m.position.set(x+RR(-.5,.5),groundY(x,z)+.18,z+RR(-.5,.5));scene.add(m);loot.push({m,amt,t:45,type:'cash'});}
function spawnAmmo(x,z,wid,amt){const m=weaponModel(wid);m.scale.setScalar(1.5);m.position.set(x,groundY(x,z)+.25,z);scene.add(m);loot.push({m,amt,wid,t:45,type:'ammo'});}
function dropLoot(n){const p=n.c.g.position;if(n.kind==='dummy'||n.kind==='clerk'||n.patient||n.fare)return;
 if(n.kind==='cop'){if(Math.random()<.6)spawnAmmo(p.x,p.z,n.wdmg>7?'smg':'pistol',n.wdmg>7?30:12);return;}
 const r=Math.random();if(n.mission)spawnCash(p.x,p.z,Math.round(RR(30,120)));else if(n.aggro){if(r<.7)spawnCash(p.x,p.z,Math.round(RR(15,70)));}else if(r<.5)spawnCash(p.x,p.z,Math.round(RR(5,45)));}
function updateLoot(dt){for(let i=loot.length-1;i>=0;i--){const l=loot[i];l.t-=dt;l.m.rotation.y+=dt*3;
 if(mode==='play'&&!P.dead&&!P.inAir&&Math.hypot(P.pos.x-l.m.position.x,P.pos.z-l.m.position.z)<(P.inCar?2.8:1.4)&&Math.abs(P.pos.y-l.m.position.y)<3){
  if(l.type==='cash'){P.money+=l.amt;cashSound();cashPop('+$'+l.amt);}else{giveWeapon(l.wid,l.amt);pickupSound();toast(`${WEAPONS[WI[l.wid]].name}  +${l.amt}`);}l.t=0;}
 if(l.t<=0){scene.remove(l.m);loot.splice(i,1);}}}
function knockOut(n,dir,force){if(n.kind==='dummy')return;{const g=n.c.g;if(g.rotation.order!=='XYZ'){const y=g.rotation.y;g.rotation.order='XYZ';g.rotation.set(0,y,0);}}if(n.props)propsOff(n);if(n.post&&n.post.alarm)n.post.alarm();n.hp=0;n.downOnce=true;n.state='fly';n.vel.set(dir.x*force,3+force*.3,dir.z*force);n.timer=n.kind==='cop'?15:13;if(n.kind==='clerk'&&n.store){n.resetAt=Math.max(n.resetAt||0,time+300);n.store.cool=Math.max(n.store.cool||0,time+300);}
 if(!n.dropped){n.dropped=true;dropLoot(n);}if(n.c.g.visible)tone(120+Math.random()*60,.18,'sawtooth',.035,n.c.g.position);}
function damageNPC(n,dmg,dir,src){
 if(n.state==='ko'||n.state==='fly')return;n.hp-=dmg;if(src==='player'){hitMarker();lastCombatT=time;n.playerMemoryUntil=time+180;n.playerMemoryPos=P.pos.clone();}
 if(n.kind==='dummy'){n.wob=.4;if(n.hp<=0){n.state='ko';n.c.g.rotation.x=-Math.PI/2*.92;tone(220,.2,'sine',.06);}return;}
 if(n.post&&n.post.alarm&&src==='player')n.post.alarm();
 if(n.hp<=0)knockOut(n,dir,dmg>60?9:4);
 else{n.stagger=.35;npcSay(n,'hurt');if(n.mission)alertGroup(n);
  if(n.state==='patrol'||n.state==='guard'){n.state='fight';if(n.mission)alertGroup(n);}
  if(n.ip)ipHit(n,src);
  else if(n.kind==='civ'&&n.state!=='fight'&&!n.mission&&!n.patient){if(n.aggro||Math.random()<.25){n.state='fight';npcSay(n,'thug',1);}else{n.state='flee';n.fleeT=10;n.threat=P.pos.clone();}}}
 if(src==='player'){if(n.kind==='cop')addHeat(1,true);else if(!n.aggro)addHeat(1,false);}
}
function shotNoise(p){let witness=false;scareBirds(p);ipShot(p);for(const n of peds){if(n.kind!=='civ'||n.ip||n.state==='ko'||n.state==='fly'||n.mission||n.patient||n.fare)continue;const d=n.c.g.position.distanceTo(p);if(d<38){witness=true;if(n.state==='idle'){if(n.aggro&&d<22&&!mission){idleToFlee(n,p);n.state='fight';npcSay(n,'thug',1);}else{idleToFlee(n,p);if(Math.random()<.3)npcSay(n,'flee');}}else if(n.state==='walk'||n.state==='wait'){propsOff(n);if(n.aggro&&d<22){n.state='fight';npcSay(n,'thug',1);}else{n.state='flee';n.fleeT=9;n.threat=p.clone();if(Math.random()<.25)npcSay(n,'flee');}}}}
 for(const c of cars)if(c.mode==='ai'&&Math.abs(c.pos.x-p.x)<45&&Math.abs(c.pos.z-p.z)<45)c.panicT=6;
 if(witness&&wanted===0)addHeat(1,false);}
function damageCar(c,dmg,src){if(c.mode==='wreck'||c.mode==='cine')return;c.lastSrc=src;if(c.armor)dmg*=c.armor;c.hp-=dmg;
 if(src==='player'){hitMarker();if(c.police)addHeat(1,true);if(c.mode==='ai')c.panicT=6;}
 if(src==='ram'&&c.police)addHeat(1,true);
 if(c.mode==='ai')c.bump=Math.max(c.bump,src==='player'?1.2:3);
 if(c.hp<=0&&(src==='crash'||src==='ram')&&!c.bike){c.hp=1;if(!(c.burning>0)){c.burning=5;if(P.inCar===c)big('DEIN WAGEN BRENNT','Steig schnell aus (E)!','#ff6a00');}else c.burning=Math.min(c.burning,2.5);return;}
 if(c.hp<=0){c.burning=0;const wasPlayer=P.inCar===c;c.mode='wreck';c.speed=0;c.wreckT=40;for(const m of (c.burnMeshes||[c.bodyMesh]))m.material=burntMat;if(c.beam)c.beam.visible=false;const i=police.indexOf(c);if(i>=0)police.splice(i,1);
  if(c.rider){c.body.remove(c.rider.g);c.rider.dispose();c.rider=null;}
  if(wasPlayer){if(c._driverViewHidden&&c.body){c.body.visible=true;c._driverViewHidden=false;}c.g.visible=true;P.inCar=null;P.char.g.visible=true;scene.add(headSpot);scene.add(headTgt);headSpot.intensity=0;onVehicleChange();}
  explode(new THREE.Vector3(c.pos.x,c.g.position.y+1,c.pos.z),c.bike?.8:1.1,src);
  if(wasPlayer)hurtPlayer(999);}}
function damageAir(a,d,src){if(a.dead)return;a.hp-=d;if(src==='player'){hitMarker();if(a.police)addHeat(1,true);}
 if(a.hp<=0){a.dead=true;a.deadT=30;const wasPlayer=P.inAir===a;a.body.traverse(o=>{if(o.isMesh&&o.material!==glassMat)o.material=burntMat;});
  if(wasPlayer){P.inAir=null;P.char.g.visible=true;P.pos.copy(a.g.position);onVehicleChange();}
  if(a===policeHeli){policeHeli=null;heliRespawnT=30;searchLight.intensity=0;}
  explode(a.g.position.clone(),1.5,src);if(wasPlayer)hurtPlayer(999);}}
function hitProp(p,dmg,src){for(const gp of gasPumps){if(gp.dead)continue;if(Math.abs(p.x-gp.x)<1.3&&Math.abs(p.z-gp.z)<1.1&&p.y<2.8){gp.hp-=dmg;sparks(p);if(gp.hp<=0)pumpBoom(gp,src,.05);return true;}}return false;}
function pumpBoom(gp,src,delay){if(gp.dead)return;gp.dead=true;gp.fireT=30;pendingBooms.push({gp,src,t:delay});}
function updateProps(dt){
 for(let i=pendingBooms.length-1;i>=0;i--){const b=pendingBooms[i];b.t-=dt;if(b.t<=0){pendingBooms.splice(i,1);b.gp.g.visible=false;explode(new THREE.Vector3(b.gp.x,1.1,b.gp.z),1.35,b.src);if(b.src==='player')addHeat(1,false);}}
 for(const gp of gasPumps){if(!gp.dead)continue;if(gp.fireT>0){gp.fireT-=dt;if(Math.hypot(gp.x-camera.position.x,gp.z-camera.position.z)<160){if(Math.random()<dt*14)fire(new THREE.Vector3(gp.x+RR(-.8,.8),.6+RR(0,.6),gp.z+RR(-.8,.8)),RR(1.2,2.2));if(Math.random()<dt*4)smoke(new THREE.Vector3(gp.x,2.5,gp.z),2.5,.1,4);}
   if(!P.inCar&&!P.inAir&&Math.hypot(P.pos.x-gp.x,P.pos.z-gp.z)<1.8&&Math.random()<dt*3)hurtPlayer(4);}
  else if(Math.hypot(gp.x-P.pos.x,gp.z-P.pos.z)>220){gp.dead=false;gp.hp=60;gp.g.visible=true;}}}
function explode(p,power=1,src){
 for(let k=0;k<14;k++){const sp=sprite(flashTex,new THREE.Color(4,2.2,.8));sp.position.copy(p).add(tmpV.set(RR(-1.5,1.5),RR(0,2),RR(-1.5,1.5)));sp.scale.setScalar(3*power);scene.add(sp);fx.push({s:sp,t:.6,life:.6,vel:new THREE.Vector3(RR(-5,5),RR(0,8),RR(-5,5)),grow:6*power});}
 for(let k=0;k<10;k++)smoke(p.clone().add(tmpV.set(RR(-2,2),RR(0,3),RR(-2,2))),3*power,.16,4);
 boomSound(power,p);shake=Math.max(shake,Math.min(1.3,40/(p.distanceTo(camera.position)+5)));lastCombatT=time;
 const Rr=9*power;
 for(const n of peds){if(n.state==='ko'||n.state==='fly'||n.state==='ride')continue;const d=n.c.g.position.distanceTo(p);if(d<Rr){const dir=n.c.g.position.clone().sub(p).setY(0).normalize();if(n.kind==='dummy')damageNPC(n,999,dir,src);else{knockOut(n,dir,14*(1-d/Rr)+4);if(src==='player'&&!n.aggro)addHeat(1,n.kind==='cop');}}}
 for(const c of cars.slice()){const d=tmpV.set(c.pos.x,c.g.position.y+.8,c.pos.z).distanceTo(p);if(d<Rr)damageCar(c,900*(1-d/Rr)+100,src);}
 for(const a of aircraft.slice()){if(a.dead)continue;const d=a.g.position.distanceTo(p);if(d<Rr+a.r)damageAir(a,700*(1-d/(Rr+a.r))+100,src);}
 for(const gp of gasPumps){if(gp.dead)continue;if(Math.hypot(gp.x-p.x,gp.z-p.z)<Rr*.9)pumpBoom(gp,src,RR(.25,.6));}
 if(!P.inCar&&!P.inAir){const d=tmpV.copy(P.pos).setY(P.pos.y+1).distanceTo(p);if(d<Rr)hurtPlayer(110*(1-d/Rr)+10,p);}
}

// ---------- Spieler-Gesundheit ----------
function hurtPlayer(d,from){if(P.dead||mode!=='play')return;
 if(P.inCar&&d<500){damageCar(P.inCar,d*2.5,'npc');d*=.3;}
 if(P.inAir&&d<500){damageAir(P.inAir,d*2,'npc');d*=.2;}
 if(P.dead)return;
 if(P.armor>0&&d<500){const ab=Math.min(P.armor,d*.7);P.armor-=ab;d-=ab;}
 P.hp-=d;lastHurtT=time;lastCombatT=time;hurtFade=Math.min(1,.35+d/30);if(d>2&&!P.inCar&&!P.inAir)tone(150,.1,'sawtooth',.04);if(P.hp<=0)playerDown();}
function playerDown(){if(P.dead)return;P.dead=true;P.hp=0;P.deadT=4;deathFx=2.2;if(P.para)endPara();if(wheelOpen)closeWheel(false);if(P.inCar)exitCar(true);if(P.inAir)exitAir(true);aimHeld=false;fireHeld=false;failJingle();
 big('AUSGESCHALTET','Du wachst gleich im Krankenhaus auf …','#ff5050');P.char.g.visible=true;P.char.g.rotation.set(-Math.PI/2,P.face,0);P.char.g.position.y=P.pos.y+.15;}
function respawnHospital(){if(NET.on&&NET.mode==='duel'){duelRespawn();return;}P.dead=false;P.hp=100;P.armor=0;const lost=Math.min(P.money,100+Math.floor(P.money*.1));P.money-=lost;setWanted(0);
 P.pos.set(HOSPITAL_SPAWN.x,.3,HOSPITAL_SPAWN.z);P.face=0;camYaw=0;P.char.g.rotation.set(0,0,0);big('KRANKENHAUS',lost?`Behandlung: -$${lost}`:'Du bist wieder fit.','#7dff8a');
 if(mission)failMission('Du wurdest ausgeschaltet.');if(activity)endActivity(false,'Du wurdest ausgeschaltet.');if(race)endRace(false,true);}

// ---------- Schießen & Schlagen ----------
function muzzlePos(){const fxx=Math.sin(P.face),fzz=Math.cos(P.face);return new THREE.Vector3(P.pos.x+fxx*.75-fzz*.32,P.pos.y+1.45,P.pos.z+fzz*.75+fxx*.32);}
function startReload(){const w=curW();if(w.melee||w.thrown||reloadT>0||P.inCar||P.inAir)return;const need=w.mag-(INV.clip[w.id]||0);if(need<=0||(INV.ammo[w.id]||0)<=0)return;reloadT=(w.id==='sniper'||w.id==='rpg')?2:1.4;tone(500,.06,'square',.03);setTimeout(()=>tone(380,.05,'square',.03),300);}
function finishReload(){const w=curW();if(w.melee||w.thrown)return;const need=w.mag-(INV.clip[w.id]||0);const t=Math.min(need,INV.ammo[w.id]||0);INV.clip[w.id]=(INV.clip[w.id]||0)+t;INV.ammo[w.id]-=t;}
function tryFire(){
 if(P.inCar||P.inAir||P.dead)return;const w=curW();if(fireCD>0||reloadT>0)return;
 if(w.melee){fireCD=w.rate;meleeT=.3;doMelee(w);return;}
 if(w.thrown){if((INV.ammo[w.id]||0)<=0){tone(900,.03,'square',.02);fireCD=.3;return;}INV.ammo[w.id]--;fireCD=w.rate;throwGrenade();if(INV.ammo[w.id]<=0)attachWeapon();return;}
 if((INV.clip[w.id]||0)<=0){if((INV.ammo[w.id]||0)>0)startReload();else{tone(900,.03,'square',.02);fireCD=.3;}return;}
 INV.clip[w.id]--;fireCD=w.rate;shootPoseT=1.6;P.face=camYaw;lastCombatT=time;if(mode==='cine'&&cineCombat&&cineCombat.active)cineCombat.recoil=.12;
 const o=camera.position.clone(),dir=new THREE.Vector3();camera.getWorldDirection(dir);assistMagnet(o,dir,w.range||80);
 const mz=muzzlePos();
 if(w.rocket){fireRocket(mz,raycast(o,dir,w.range,null).point,'player');}
 else for(let k=0;k<(w.pellets||1);k++){const d=dir.clone();const spr=(w.spread||0)*(aimHeld?1:1.8);if(spr){d.x+=RR(-spr,spr);d.y+=RR(-spr,spr);d.z+=RR(-spr,spr);d.normalize();}
  const hit=raycast(o,d,w.range,null);tracer(mz,hit.point);if(NET.on)netSendShot(o,d,w,mz);
  if(hit.npc)damageNPC(hit.npc,w.dmg*(hit.head?2:1),d,'player');else if(hit.car)damageCar(hit.car,w.dmg,'player');else if(hit.air)damageAir(hit.air,w.dmg,'player');else if(!hitProp(hit.point,w.dmg,'player'))sparks(hit.point);}
 flash(mz);gunSound(w.vol||.15,w.id,P.pos);shotNoise(P.pos);
 if(INV.clip[w.id]<=0&&(INV.ammo[w.id]||0)>0)startReload();
}
function doMelee(w){P.face=camYaw;const fxx=Math.sin(P.face),fzz=Math.cos(P.face);let hit=false;
 for(const n of peds){if(n.state==='ko'||n.state==='fly'||n.state==='ride')continue;const q=n.c.g.position;const dx=q.x-P.pos.x,dz=q.z-P.pos.z,d=Math.hypot(dx,dz);if(d>w.range+.5||d<.01||Math.abs(q.y-P.pos.y)>1.6)continue;if((dx*fxx+dz*fzz)/d<.4)continue;
  damageNPC(n,w.dmg,new THREE.Vector3(fxx,0,fzz),'player');hit=true;}
 if(w.id==='bat')for(const c of cars){const dx=c.pos.x-P.pos.x,dz=c.pos.z-P.pos.z,d=Math.hypot(dx,dz);if(d<3.2&&(dx*fxx+dz*fzz)/d>.3){damageCar(c,15,'player');hit=true;}}
 if(hit){punchSound(P.pos);shake=Math.max(shake,.12);lastCombatT=time;}else noiseBurst(.12,.12,w.id==='knife'?3200:1800,1.2,P.pos);}
function throwGrenade(){P.face=camYaw;meleeT=.3;const dir=new THREE.Vector3();camera.getWorldDirection(dir);
 const from=new THREE.Vector3(P.pos.x+Math.sin(P.face)*.5,P.pos.y+1.7,P.pos.z+Math.cos(P.face)*.5);
 const m=new THREE.Mesh(grenadeGeo,grenadeMat);m.position.copy(from);m.castShadow=true;scene.add(m);
 const v=dir.multiplyScalar(17);v.y+=5.5;grenades.push({m,v,t:2.4});noiseBurst(.15,.1,900,1,from);}
function updateGrenades(dt){for(let i=grenades.length-1;i>=0;i--){const g=grenades[i];g.t-=dt;g.v.y-=20*dt;const p=g.m.position;const ox=p.x,oz=p.z;p.addScaledVector(g.v,dt);
 const gy=groundY(p.x,p.z);if(p.y<gy+.12){p.y=gy+.12;if(g.v.y<-2)tone(700,.03,'square',.02,p);g.v.y*=-.35;g.v.x*=.6;g.v.z*=.6;}
 for(const sd of solidsNear(p.x,p.z,3)){if(sd.h<=0||sd.water||sd.open||sd.camOnly||p.y>sd.h)continue;if(p.x>sd.x0&&p.x<sd.x1&&p.z>sd.z0&&p.z<sd.z1){if(ox<=sd.x0||ox>=sd.x1)g.v.x*=-.4;else g.v.z*=-.4;p.x=ox;p.z=oz;break;}}
 g.m.rotation.x+=dt*8;
 if(g.t<=0){scene.remove(g.m);grenades.splice(i,1);explode(p.clone().setY(p.y+.3),1,'player');}}}
function fireRocket(from,target,src,ignore){const dir=target.clone().sub(from).normalize();const m=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.8,8),rocketMat);m.position.copy(from);m.lookAt(target);m.rotateX(Math.PI/2);scene.add(m);
 rockets.push({m,vel:dir.multiplyScalar(95),t:6,src,ignore});noiseBurst(.5,.4,300,.6,from);}
function updateRockets(dt){for(let i=rockets.length-1;i>=0;i--){const r=rockets[i];r.t-=dt;const step=r.vel.length()*dt;const d=r.vel.clone().normalize();const o=r.m.position.clone();
 const hit=raycast(o,d,step+.5,r.ignore);
 if(hit.t<step+.4||r.t<=0){scene.remove(r.m);rockets.splice(i,1);explode(hit.point,1.2,r.src);continue;}
 r.m.position.addScaledVector(r.vel,dt);if(Math.random()<.7)smoke(r.m.position.clone(),.7,.6,1.2);const f=sprite(flashTex,new THREE.Color(3,1.8,.6));f.position.copy(r.m.position);f.scale.setScalar(.9);scene.add(f);fx.push({s:f,t:.05,life:.05});}}
function addPickup(x,z,type,wid,amount){const g=new THREE.Group();let m;if(type==='weapon'){m=weaponModel(wid);m.scale.setScalar(1.7);}else if(type==='armor'){m=new THREE.Group();m.add(mesh(new THREE.BoxGeometry(.6,.7,.22),armorMat,0,0,0,false));}else{m=new THREE.Group();m.add(mesh(new THREE.BoxGeometry(.55,.18,.18),healthMat,0,0,0,false),mesh(new THREE.BoxGeometry(.18,.55,.18),healthMat,0,0,0,false));}
 g.add(m);m.position.y=1;const ring=new THREE.Mesh(new THREE.TorusGeometry(.8,.05,6,24),new THREE.MeshBasicMaterial({color:type==='health'?new THREE.Color(.4,2,.6):type==='armor'?new THREE.Color(.5,1,2.4):new THREE.Color(2.2,1.7,.4)}));ring.rotation.x=Math.PI/2;ring.position.y=.12;g.add(ring);
 const y=groundY(x,z);g.position.set(x,y,z);scene.add(g);pickups.push({g,m,type,wid,amount,cd:0,x,y,z});}
function updatePickups(dt){for(const p of pickups){if(p.cd>0){p.cd-=dt;if(p.cd<=0)p.g.visible=true;continue;}if(Math.abs(p.x-camera.position.x)>200||Math.abs(p.z-camera.position.z)>200)continue;p.m.rotation.y+=dt*2;p.m.position.y=1+Math.sin(time*2)*.12;
 if(mode==='play'&&!P.inCar&&!P.inAir&&!P.dead&&Math.hypot(P.pos.x-p.x,P.pos.z-p.z)<1.7&&Math.abs(P.pos.y-p.y)<2.5){
  if(p.type==='health'){if(P.hp>=100)continue;P.hp=100;toast('+ Gesundheit');}
  else if(p.type==='armor'){if(P.armor>=100)continue;P.armor=100;toast('+ Schutzweste');}
  else{giveWeapon(p.wid,p.amount);toast(`${WEAPONS[WI[p.wid]].name}  +${p.amount}`);}
  p.g.visible=false;p.cd=60;pickupSound();}}}
function makeHeli(color,armed,police){const g=new THREE.Group(),body=new THREE.Group();g.add(body);const pm=paint(color);
 const acc=cm(police?0x1c2c4c:armed?0x2a2f22:0x22252b,.45,.4);
 // Rumpf als Ellipsoid, Kanzel als passgenaue Glaskappe
 const fus=new THREE.Group();fus.position.set(0,1.72,.15);fus.scale.set(1.22,1.18,2.15);body.add(fus);
 const hull=new THREE.Mesh(new THREE.SphereGeometry(1,28,18),pm);hull.castShadow=true;fus.add(hull);
 const cap=new THREE.Mesh(new THREE.SphereGeometry(1.012,28,12,0,Math.PI*2,0,Math.PI*.36),heliGlass);cap.rotation.x=1.12;cap.position.y=.04;fus.add(cap);
 const belly=new THREE.Mesh(new THREE.SphereGeometry(1.006,28,10,0,Math.PI*2,Math.PI*.62,Math.PI*.38),acc);fus.add(belly);
 for(const sx of [-1,1]){const w=new THREE.Mesh(new THREE.CircleGeometry(1,20),heliGlass);w.scale.set(.55,.36,1);w.position.set(sx*1.19,1.98,-.35);w.rotation.y=sx*Math.PI/2;body.add(w);}
 // Triebwerksverkleidung
 const cow=new THREE.Mesh(new THREE.CapsuleGeometry(.5,1.5,6,14),pm);cow.rotation.x=Math.PI/2;cow.scale.set(1.25,1,1);cow.position.set(0,2.72,-.55);cow.castShadow=true;body.add(cow);
 for(const sx of [-1,1])body.add(mesh(new THREE.BoxGeometry(.04,.28,.7),acc,sx*.62,2.75,-.9));
 // Heckausleger, Leitwerk
 const boom=new THREE.Mesh(new THREE.CylinderGeometry(.42,.15,6.2,14),pm);boom.rotation.x=Math.PI/2+.05;boom.position.set(0,2.08,-4.3);boom.castShadow=true;body.add(boom);
 const fin=mesh(new THREE.BoxGeometry(.1,1.6,1.05),pm,0,2.85,-7.15);fin.rotation.x=-.42;body.add(fin);
 const fin2=mesh(new THREE.BoxGeometry(.1,.7,.6),acc,0,1.65,-7.05);fin2.rotation.x=.4;body.add(fin2);
 body.add(mesh(new THREE.BoxGeometry(2.1,.07,.6),pm,0,2.12,-6.3));for(const sx of [-1,1])body.add(mesh(new THREE.BoxGeometry(.06,.45,.5),acc,sx*1.05,2.2,-6.3));
 const tr=new THREE.Group();tr.position.set(.2,2.95,-7.3);for(let k=0;k<2;k++){const bl=mesh(new THREE.BoxGeometry(.04,1.6,.14),rotorMat,0,0,0,false);bl.rotation.x=k*Math.PI/2;tr.add(bl);}
 const tdMat=new THREE.MeshBasicMaterial({map:ROTOR_TEX,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});const td=new THREE.Mesh(new THREE.CircleGeometry(.85,24),tdMat);td.rotation.y=Math.PI/2;tr.add(td);body.add(tr);
 // Kufen
 const skid=cm(0x2a2a2a,.4,.7);for(const sx of [-1,1]){body.add(mesh(new THREE.BoxGeometry(.11,.11,3.9),skid,sx*1.25,.1,.05));const up=mesh(new THREE.BoxGeometry(.11,.11,.6),skid,sx*1.25,.24,2.18);up.rotation.x=-.55;body.add(up);
  for(const zz of [1.0,-.9]){const st=mesh(new THREE.BoxGeometry(.09,1.05,.09),skid,sx*1.02,.58,zz);st.rotation.z=-sx*.42;body.add(st);}}
 // Rotor: Mast, Nabe, Blätter, Bewegungsunschärfe-Scheibe
 body.add(mesh(new THREE.CylinderGeometry(.11,.14,.6,10),rotorMat,0,3.25,-.2));body.add(mesh(new THREE.CylinderGeometry(.3,.3,.16,12),rotorMat,0,3.52,-.2));
 const bladeMat=new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:.6,metalness:.4,transparent:true,opacity:1});
 const rotor=new THREE.Group();rotor.position.set(0,3.55,-.2);for(let k=0;k<4;k++){const pv=new THREE.Group();pv.rotation.y=k*Math.PI/2;const bl=new THREE.Mesh(new THREE.BoxGeometry(.34,.04,5.4),bladeMat);bl.position.z=2.75;bl.rotation.z=.06;pv.add(bl);rotor.add(pv);}
 const dMat=new THREE.MeshBasicMaterial({map:ROTOR_TEX,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});const disc=new THREE.Mesh(new THREE.CircleGeometry(5.5,48),dMat);disc.rotation.x=-Math.PI/2;disc.position.y=.02;rotor.add(disc);body.add(rotor);
 if(armed)for(const sx of [-1,1]){body.add(mesh(new THREE.BoxGeometry(1.2,.1,.4),pm,sx*1.6,1.2,.2));const pod=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,1.5,10),cm(0x3a3a3a,.5,.6));pod.rotation.x=Math.PI/2;pod.position.set(sx*2.2,1.05,.3);body.add(pod);}
 if(police){const st=sign('POLIZEI','#1c2c4c','#ffffff',256,64,46);for(const sx of [-1,1]){const pl=new THREE.Mesh(new THREE.PlaneGeometry(1.7,.42),new THREE.MeshStandardMaterial({map:st}));pl.position.set(sx*1.205,1.45,-1.1);pl.rotation.y=sx*Math.PI/2;body.add(pl);}}
 const nl=new THREE.Mesh(new THREE.SphereGeometry(.09,6,6),new THREE.MeshBasicMaterial({color:new THREE.Color(4,.3,.3)}));nl.position.set(0,.55,-1.2);body.add(nl);
 const tl=new THREE.Mesh(new THREE.SphereGeometry(.07,6,6),new THREE.MeshBasicMaterial({color:new THREE.Color(.4,4,.6)}));tl.position.set(0,3.7,-7.5);body.add(tl);
 scene.add(g);
 return {g,body,rotor,tr,bladeMat,dMat,tdMat,_ls:0,type:'heli',armed,police,vel:new THREE.Vector3(),prev:new THREE.Vector3(),h:0,hp:armed?950:650,r:4.2,spool:0,dead:false,mode:'parked',spin:0,name:armed?'Kampfhubschrauber':police?'Polizeihubschrauber':'Hubschrauber'};}
// Rotor-Optik: schnelle Rotoren als halbtransparente Unschärfe-Scheibe (verhindert das „Stroboskop“-Stehen)
function heliFx(dt){for(const a of aircraft){if(a.type!=='heli'||!a.dMat)continue;const rate=dt>0?Math.abs(a.spin-a._ls)/dt:0;a._ls=a.spin;a._rate=(a._rate||0)+(rate-(a._rate||0))*Math.min(1,dt*5);const k=clamp((a._rate-6)/22,0,1);
 a.dMat.opacity=k*.75;a.tdMat.opacity=k*.7;a.bladeMat.opacity=1-k*.82;a.bladeMat.depthWrite=k<.5;if(k>.3)a.rotor.rotation.y+=dt*9;}}
// Propellerflugzeug (Schulterdecker): gedrechselter Rumpf, Streben, Spinner, Propeller mit Unschärfe-Scheibe
function makePropPlane(color){const g=new THREE.Group(),body=new THREE.Group();g.add(body);const pm=paint(color);const acc=cm(0x1f5fbf,.45,.3),dark=cm(0x222428,.6,.4);
 const prof=[[0.001,-4.1],[.16,-4.05],[.24,-3.2],[.42,-1.6],[.6,-.3],[.72,.8],[.74,2.2],[.66,3.3],[.5,3.95],[.32,4.25],[0.001,4.3]].map(([r,z])=>new THREE.Vector2(r,z));
 const fg=new THREE.LatheGeometry(prof,20);fg.rotateX(Math.PI/2);const fus=new THREE.Mesh(fg,pm);fus.scale.set(1,1.18,1);fus.position.y=1.55;fus.castShadow=true;body.add(fus);
 // Fensterband
 for(const sx of [-1,1]){const w=new THREE.Mesh(new THREE.PlaneGeometry(1.7,.48),heliGlass);w.position.set(sx*.735,1.98,1.55);w.rotation.y=sx*Math.PI/2;body.add(w);const st=mesh(new THREE.BoxGeometry(.02,.12,6.6),acc,sx*.7,1.38,.1,false);body.add(st);}
 const ws=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.75),heliGlass);ws.position.set(0,2.1,2.75);ws.rotation.x=-.95;body.add(ws);
 // Hochdecker-Flügel + Streben
 body.add(mesh(new THREE.BoxGeometry(11,.13,1.55),pm,0,2.42,1.3));for(const sx of [-1,1]){body.add(mesh(new THREE.BoxGeometry(.9,.135,1.56),acc,sx*5.1,2.42,1.3,false));const st=mesh(new THREE.BoxGeometry(.06,1.7,.12),dark,sx*1.55,1.8,1.3);st.rotation.z=sx*1.02;body.add(st);}
 // Leitwerk
 const fin=mesh(new THREE.BoxGeometry(.1,1.45,1.2),pm,0,2.35,-3.55);fin.rotation.x=-.5;body.add(fin);body.add(mesh(new THREE.BoxGeometry(.11,.4,.5),acc,0,2.95,-3.95,false));
 body.add(mesh(new THREE.BoxGeometry(3.6,.08,.95),pm,0,1.72,-3.6));
 // Fahrwerk
 for(const [x,z,h] of [[-1.15,1.1,1],[1.15,1.1,1],[0,3.35,.9]]){const st=mesh(new THREE.BoxGeometry(.07,h,.09),dark,x*.8,.35+h/2,z);if(x)st.rotation.z=-Math.sign(x)*.45;body.add(st);const w=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.18,14),dark);w.rotation.z=Math.PI/2;w.position.set(x,.29,z);body.add(w);const f=new THREE.Mesh(new THREE.SphereGeometry(.34,10,8),pm);f.scale.set(.45,.6,1.2);f.position.set(x,.42,z);body.add(f);}
 // Spinner + Propeller
 const sp=new THREE.Mesh(new THREE.ConeGeometry(.24,.5,14),cm(0xdddddd,.3,.6));sp.rotation.x=Math.PI/2;sp.position.set(0,1.55,4.48);body.add(sp);
 const prop=new THREE.Group();prop.position.set(0,1.55,4.36);const bm=new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:.5,metalness:.3,transparent:true,opacity:1});
 for(const sy of [-1,1]){const bl=new THREE.Mesh(new THREE.BoxGeometry(.17,1.05,.05),bm);bl.position.y=sy*.56;bl.rotation.y=sy*.25;prop.add(bl);}
 const pdm=new THREE.MeshBasicMaterial({map:ROTOR_TEX,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});prop.add(new THREE.Mesh(new THREE.CircleGeometry(1.15,32),pdm));body.add(prop);
 for(const sx of [-1,1]){const wl=new THREE.Mesh(new THREE.SphereGeometry(.08,6,6),new THREE.MeshBasicMaterial({color:sx<0?new THREE.Color(4,.2,.2):new THREE.Color(.2,4,.4)}));wl.position.set(sx*5.52,2.42,1.3);body.add(wl);}
 scene.add(g);
 return {g,body,prop,glow:null,propBM:bm,propDM:pdm,type:'plane',jet:false,armed:false,vel:new THREE.Vector3(),prev:new THREE.Vector3(),speed:0,h:0,p:0,roll:0,airborne:false,hp:650,r:5,dead:false,mode:'parked',name:'Propellerflugzeug'};}
function makePlane(color,jet,kind){if(!jet&&!kind)return makePropPlane(color);const g=new THREE.Group(),body=new THREE.Group();g.add(body);const pm=paint(color);const L=jet?11:8;
 const fus=new THREE.Mesh(new THREE.CylinderGeometry(jet?.78:.62,jet?.45:.32,L,16),pm);fus.rotation.x=Math.PI/2;fus.position.y=1.6;fus.castShadow=true;body.add(fus);
 const nose=new THREE.Mesh(new THREE.ConeGeometry(jet?.78:.62,jet?2.8:1.1,16),pm);nose.rotation.x=Math.PI/2;nose.position.set(0,1.6,L/2+(jet?1.4:.55));nose.castShadow=true;body.add(nose);
 const can=new THREE.Mesh(new THREE.SphereGeometry(.62,16,10),heliGlass);can.scale.set(.8,.75,2);can.position.set(0,2.15,jet?L*.22:L*.08);body.add(can);
 body.add(mesh(new THREE.BoxGeometry(jet?9:11,.16,jet?3.2:1.8),pm,0,jet?1.5:1.3,jet?-.6:.4));
 body.add(mesh(new THREE.BoxGeometry(.14,jet?2:1.6,1.5),pm,0,jet?2.8:2.5,-L/2+.7));
 body.add(mesh(new THREE.BoxGeometry(jet?4.2:3.6,.12,1.1),pm,0,1.8,-L/2+.55));
 const gear=cm(0x222222,.7);for(const [x,z] of [[-1.3,.5],[1.3,.5],[0,L/2-.5]]){body.add(mesh(new THREE.BoxGeometry(.08,1,.08),gear,x,.65,z));const w=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.2,12),gear);w.rotation.z=Math.PI/2;w.position.set(x,.3,z);body.add(w);}
 let prop=null,glow=null;
 if(!jet){prop=new THREE.Group();prop.position.set(0,1.6,L/2+1.12);prop.add(mesh(new THREE.BoxGeometry(.16,2.3,.06),rotorMat,0,0,0,false));body.add(prop);}
 else{glow=new THREE.Mesh(new THREE.CircleGeometry(.42,16),new THREE.MeshStandardMaterial({color:0x220800,emissive:0xff6a1a,emissiveIntensity:1}));glow.rotation.y=Math.PI;glow.position.set(0,1.6,-L/2-.02);body.add(glow);
  if(!kind)for(const sx of [-1,1]){const ms=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,1.8,8),cm(0xdddddd,.4,.4));ms.rotation.x=Math.PI/2;ms.position.set(sx*2.6,1.25,-.4);body.add(ms);}}
 for(const sx of [-1,1]){const wl=new THREE.Mesh(new THREE.SphereGeometry(.1,6,6),new THREE.MeshBasicMaterial({color:sx<0?new THREE.Color(4,.2,.2):new THREE.Color(.2,4,.4)}));wl.position.set(sx*(jet?4.5:5.5),jet?1.5:1.3,jet?-.6:.4);body.add(wl);}
 if(kind==='liner')for(const sx of [-1,1]){const en=new THREE.Mesh(new THREE.CylinderGeometry(.42,.36,1.8,12),cm(0xb8bec6,.35,.6));en.rotation.x=Math.PI/2;en.position.set(sx*2.4,1.05,-.2);body.add(en);}
 if(kind==='liner'||kind==='cargo')body.add(mesh(new THREE.BoxGeometry(jet?1.62:1.3,.22,L*.8),cm(kind==='liner'?0x1f5fbf:0xe67e22,.5),0,1.75,0,false));
 scene.add(g);
 const a={g,body,prop,glow,type:'plane',jet,armed:jet&&!kind,vel:new THREE.Vector3(),prev:new THREE.Vector3(),speed:0,h:0,p:0,roll:0,airborne:false,hp:jet?950:650,r:jet?6:5,dead:false,mode:'parked',name:jet?'Kampfjet':'Propellerflugzeug'};
 if(kind){const sc=kind==='liner'?2.3:kind==='cargo'?1.9:1.15;body.scale.setScalar(sc);a.r=a.r*sc*.9;a.kind=kind;a.name=kind==='liner'?'Passagierjet':kind==='cargo'?'Frachtflugzeug':'Privatjet';a.maxS=kind==='private'?110:88;a.tko=kind==='private'?40:46;a.acc=kind==='private'?20:9;a.hp=kind==='private'?700:1600;}
 return a;}
function placeAir(a,x,z,h){a.g.position.set(x,groundY(x,z),z);a.h=h;a.g.rotation.y=h;aircraft.push(a);return a;}
function nearestAir(r){let best=null,bd=r;for(const a of aircraft){if(a.dead||a.police||a.mode!=='parked')continue;const d=Math.hypot(a.g.position.x-P.pos.x,a.g.position.z-P.pos.z);if(d<bd&&Math.abs(a.g.position.y-P.pos.y)<4){bd=d;best=a;}}return best;}
function enterAir(a){P.inAir=a;a.mode='player';P.char.g.visible=false;aimHeld=false;doorSound();onVehicleChange();showVehicleName(a.name);
 if(!$('tut').innerHTML||flyTutT>0){flyTutT=14;setTut(a.type==='heli'?'<b>HUBSCHRAUBER</b><br><k>W</k><k>S</k> vor / zurück · <k>A</k><k>D</k> drehen<br><k>Leertaste</k> steigen · <k>Shift</k> sinken<br>'+(a.armed?'<b>Linksklick</b> MG · <b>Rechtsklick</b> Raketen<br>':'')+'<k>E</k> aussteigen (nur gelandet)':'<b>FLUGZEUG</b><br><k>W</k> Gas geben · <k>S</k> bremsen<br><k>A</k><k>D</k> Kurven fliegen<br><k>Leertaste</k> Nase hoch – Abheben ab ca. '+(a.jet?150:100)+' km/h · <k>Shift</k> Nase runter<br>'+(a.armed?'<b>Linksklick</b> MG · <b>Rechtsklick</b> Raketen<br>':'')+'Langsam und flach landen, dann <k>E</k>');}}
function exitAir(force){const a=P.inAir;if(!a)return;const gy=groundY(a.g.position.x,a.g.position.z);const low=a.g.position.y-gy<1.6;const slow=a.type==='heli'?a.vel.length()<6:a.speed<7;
 if(!force&&!(low&&slow)){if(a.g.position.y-gy>18){bailOut();return;}toast('Erst landen!');return;}
 a.mode='parked';P.inAir=null;P.char.g.visible=true;const off=a.type==='heli'?3.2:4.5;P.pos.set(a.g.position.x+Math.cos(a.h)*off,0,a.g.position.z-Math.sin(a.h)*off);P.pos.y=groundY(P.pos.x,P.pos.z);collideCircle(P.pos,.5);P.face=a.h;doorSound();onVehicleChange();
 if(flyTutT>0){flyTutT=0;setTut(mission&&mission.steps[si]?mission.steps[si].tut:'');}}
function airCollide(a){const p=a.g.position;
 if(Math.abs(p.x)>2600||Math.abs(p.z)>2600){p.x=clamp(p.x,-2600,2600);p.z=clamp(p.z,-2600,2600);}
 for(const sd of solidsNear(p.x,p.z,a.r+1)){if(sd.h<=0||sd.water||p.y>sd.h+.5)continue;const rr=a.r*.55;if(p.x+rr<sd.x0||p.x-rr>sd.x1||p.z+rr<sd.z0||p.z-rr>sd.z1)continue;
  const sp=a.type==='heli'?a.vel.length():a.speed;
  if(a.type==='plane'&&sp>14){damageAir(a,9999,'crash');return;}
  p.copy(a.prev);if(sp>9)damageAir(a,sp*14,'crash');if(a.type==='heli')a.vel.multiplyScalar(-.3);else a.speed=0;return;}}
function updateHeli(a,dt,fwd,turn,up){
 a.spool=Math.min(1,a.spool+dt*.5);const gy=groundY(a.g.position.x,a.g.position.z);const onGround=a.g.position.y<=gy+.06;
 const fxx=Math.sin(a.h),fzz=Math.cos(a.h);const tv=fwd>0?40:fwd<0?-14:0;const k=onGround?0:Math.min(1,dt*1.1);
 a.vel.x+=(fxx*tv-a.vel.x)*k;a.vel.z+=(fzz*tv-a.vel.z)*k;
 const ty=a.spool>.7?up*11:-6;a.vel.y+=(ty-a.vel.y)*Math.min(1,dt*2);
 if(onGround&&a.vel.y<0){a.vel.y=0;a.vel.x*=.8;a.vel.z*=.8;}
 if(!onGround)a.h+=turn*1.5*dt;
 a.prev.copy(a.g.position);a.g.position.addScaledVector(a.vel,dt);
 if(a.g.position.y<gy){if(a.vel.y<-13)damageAir(a,500,'crash');a.g.position.y=gy;a.vel.y=0;}
 if(a.g.position.y<.4&&overWater(a.g.position)){damageAir(a,9999,'crash');return;}
 a.g.position.y=Math.min(a.g.position.y,700);airCollide(a);
 const fs=a.vel.x*fxx+a.vel.z*fzz;a.body.rotation.x+=((fs/40)*.32-a.body.rotation.x)*Math.min(1,dt*3);a.body.rotation.z+=((onGround?0:-turn*.2)-a.body.rotation.z)*Math.min(1,dt*3);a.g.rotation.y=a.h;
 a.spin+=dt*a.spool*40;a.rotor.rotation.y=a.spin;a.tr.rotation.x=a.spin*1.4;}
function updatePlane(a,dt,thr,pitch,roll){
 const max=a.maxS||(a.jet?120:75),tko=a.tko||(a.jet?42:28);
 if(thr>0)a.speed+=(a.acc||(a.jet?22:14))*dt;else if(thr<0)a.speed-=24*dt;else a.speed-=(a.airborne?.8:4)*dt;a.speed=clamp(a.speed,0,max);
 const gy=groundY(a.g.position.x,a.g.position.z);a.roll+=(roll*.9-a.roll)*Math.min(1,dt*3);
 if(!a.airborne){a.p=0;a.h+=roll*.7*dt*Math.min(1,a.speed/8);if(a.speed>tko&&pitch>0){a.airborne=true;a.p=.18;}}
 else{a.p=clamp(a.p+pitch*.9*dt,-.9,.9);if(!pitch)a.p*=1-Math.min(1,dt*.35);a.p-=Math.abs(a.roll)*.12*dt;a.h+=a.roll*.9*clamp(45/Math.max(a.speed,1),.6,1.3)*dt;a.speed=clamp(a.speed-Math.sin(a.p)*9.81*.55*dt,0,max*1.08);if(a.speed<tko*.8){a.p-=.5*dt;if(a===P.inAir&&time>(a.stallT||0)){a.stallT=time+.6;tone(880,.08,'square',.03);}}}
 const cp=Math.cos(a.p);const v=tmpV.set(Math.sin(a.h)*cp,Math.sin(a.p),Math.cos(a.h)*cp).multiplyScalar(a.speed);
 if(a.airborne&&a.speed<tko*.8)v.y-=(tko*.8-a.speed)*.6;
 a.prev.copy(a.g.position);a.g.position.addScaledVector(v,dt);
 if(a.airborne&&a.g.position.y<=gy+.05){if(a.p<-.38||v.y<-15||overWater(a.g.position)){damageAir(a,9999,'crash');return;}a.airborne=false;a.g.position.y=gy;a.p=0;}
 if(!a.airborne){a.g.position.y=gy;if(overWater(a.g.position)){damageAir(a,9999,'crash');return;}}
 a.g.position.y=Math.min(a.g.position.y,900);airCollide(a);
 a.g.rotation.set(-a.p,a.h,a.airborne?-a.roll*.8:0,'YXZ');
 if(a.prop){const pr=a.airborne||a.speed>1||a===P.inAir?16+a.speed*1.4:0;a.prop.rotation.z+=dt*Math.min(pr,22);if(a.propDM){const k=clamp(pr/30,0,1);a.propDM.opacity=k*.7;a.propBM.opacity=1-k*.8;}}if(a.glow)a.glow.material.emissiveIntensity=1+(thr>0?7:2);}
function airForward(a){const cp=Math.cos(a.p||0);return new THREE.Vector3(Math.sin(a.h)*cp,a.type==='plane'?Math.sin(a.p):0,Math.cos(a.h)*cp).normalize();}
