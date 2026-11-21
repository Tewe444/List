'use strict';

// ---------- Schuss-Treffer gegen Fahrzeuge: mehrere Teilquader im Fahrzeugrahmen ----------
function rayBox(ox,oy,oz,dx,dy,dz,b,maxT){let t0=0,t1=maxT;const O=[ox,oy,oz],D=[dx,dy,dz];
 for(let i=0;i<3;i++){const lo=b[i*2],hi=b[i*2+1];if(Math.abs(D[i])<1e-9){if(O[i]<lo||O[i]>hi)return -1;continue;}let a=(lo-O[i])/D[i],e=(hi-O[i])/D[i];if(a>e){const q=a;a=e;e=q;}if(a>t0)t0=a;if(e<t1)t1=e;if(t0>t1)return -1;}
 return t0;}
function vehHitBoxes(c){if(c.hitB)return c.hitB;let L;
 if(c.boat)L=[[-1.25,1.25,-.35,1.2,-3.0,1.0],[-1.12,1.12,-.3,1.35,1.0,2.3],[-.78,.78,-.1,1.5,2.3,3.05],[-.4,.4,.2,1.62,3.05,3.82],[-.66,.66,-.25,1.72,-3.75,-3.0],[-.52,.52,.6,2.02,-.08,.95],[-1.05,1.05,1.2,1.98,1.7,3.5],[-1.02,1.02,.6,1.45,-2.95,-.85]];
 else if(c.vt==='tank')L=[[-1.92,1.92,0,1.62,-3.63,3.69],[-1.8,1.8,1.55,1.95,-3.2,-1.6]];
 else if(c.bike)L=[[-vehBox(c).hx,vehBox(c).hx,0,1.3,-vehBox(c).hz+.01,vehBox(c).hz+.01]];
 else{const d=CARDEF[BODY[c.vt]||c.vt]||CARDEF.sedan,W=d.W/2,top=Math.max(d.hood,d.trunk,d.belt)+.02;
  L=[[-W,W,0,top,-d.L/2,d.L/2],[-W*.9,W*.9,top-.05,d.roof+(c.police?.18:0),d.cab[0]-.05,d.cab[1]+.05]];}
 return c.hitB=L;}
function vehRayHit(c,o,d,maxT){const g=c.g.position,h=c.g.rotation.y,s=Math.sin(h),co=Math.cos(h),px=o.x-g.x,pz=o.z-g.z;
 const lx=px*co-pz*s,lz=px*s+pz*co,ly=o.y-g.y,dx=d.x*co-d.z*s,dz=d.x*s+d.z*co;let best=-1;
 for(const b of vehHitBoxes(c)){const t=rayBox(lx,ly,lz,dx,d.y,dz,b,maxT);if(t>=0&&(best<0||t<best))best=t;}
 if(c.turret){// Turm + Rohr drehen sich mit dem Turm
  const tp=c.turret.position,a=c.turret.rotation.y,s2=Math.sin(a),c2=Math.cos(a),qx=lx-tp.x,qz=lz-tp.z,qy=ly-tp.y;
  const ux=qx*c2-qz*s2,uz=qx*s2+qz*c2,vx=dx*c2-dz*s2,vz=dx*s2+dz*c2;
  for(const b of [[-1.68,1.68,-.04,1.38,-2.45,1.85],[-.19,.19,.31,.69,1.7,6.16]]){const t=rayBox(ux,qy,uz,vx,d.y,vz,b,maxT);if(t>=0&&(best<0||t<best))best=t;}}
 return best;}
function airParts(a){if(a.hitParts!==undefined)return a.hitParts;a.hitParts=null;
 try{a.g.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(a.g.matrixWorld).invert(),rel=new THREE.Matrix4(),parts=[];
  a.g.traverse(m=>{if(!m.isMesh||!m.geometry||!m.visible)return;const mt=m.material;if(mt&&!Array.isArray(mt)&&mt.transparent&&mt.depthWrite===false)return;
   const geo=m.geometry;if(!geo.boundingBox)geo.computeBoundingBox();const bb=geo.boundingBox.clone().applyMatrix4(rel.multiplyMatrices(inv,m.matrixWorld));
   const v=[bb.min.x,bb.max.x,bb.min.y,bb.max.y,bb.min.z,bb.max.z];if(v.every(Number.isFinite)&&bb.max.x-bb.min.x<90&&bb.max.z-bb.min.z<90)parts.push(v);});
  if(parts.length)a.hitParts=parts;}catch(e){a.hitParts=null;}
 return a.hitParts;}
function airRayHit(a,o,d,maxT){const parts=airParts(a);if(!parts)return sphereHit(o,d,a.g.position,a.r,maxT);
 if(!_airIM){_airIM=new THREE.Matrix4();_airN=new THREE.Matrix3();_airO=new THREE.Vector3();_airD=new THREE.Vector3();}
 if(sphereHit(o,d,a.g.position,(a.r||8)*1.6,maxT)<0&&o.distanceTo(a.g.position)>(a.r||8)*1.6)return -1;
 a.g.updateMatrixWorld();_airIM.copy(a.g.matrixWorld).invert();_airN.setFromMatrix4(_airIM);_airO.copy(o).applyMatrix4(_airIM);_airD.copy(d).applyMatrix3(_airN);
 let best=-1;for(const b of parts){const t=rayBox(_airO.x,_airO.y,_airO.z,_airD.x,_airD.y,_airD.z,b,maxT);if(t>=0&&(best<0||t<best))best=t;}return best;}
function buildCharCaps(c,key){if(key&&CHAR_CAPS.has(key))return CHAR_CAPS.get(key);let out=null;
 try{const geo=c.mesh.geometry,pa=geo.attributes.position,si=geo.attributes.skinIndex,sw=geo.attributes.skinWeight;if(!pa||!si||!sw||!(pa.count>0))throw 0;
  const P0={};for(const n of BONES){const q=c.rest&&c.rest[n];if(!q||![q.x,q.y,q.z].every(Number.isFinite))throw 0;P0[n]=new THREE.Vector3(q.x,q.y,q.z);}
  const pos=pa.array,ix=si.array,wt=sw.array,N=pa.count,dom=new Int16Array(N);
  for(let i=0;i<N;i++){let bi=ix[i*4],bw=wt[i*4];for(let k=1;k<4;k++)if(wt[i*4+k]>bw){bw=wt[i*4+k];bi=ix[i*4+k];}dom[i]=bi;}
  const sel=names=>{const S=new Set(names.map(n=>BI[n]));const r=[];for(let i=0;i<N;i++)if(S.has(dom[i]))r.push(i);return r;};
  // Kapsel entlang einer Achse (A→B) aus den zugehörigen Vertices
  const axisCap=(bone,names,A,B)=>{const idx=sel(names);if(idx.length<4)return null;const ax=B.clone().sub(A),L=ax.length();ax.normalize();let tmin=1e9,tmax=-1e9,rmax=0;
   for(const i of idx){const x=pos[i*3]-A.x,y=pos[i*3+1]-A.y,z=pos[i*3+2]-A.z,t=x*ax.x+y*ax.y+z*ax.z;tmin=Math.min(tmin,t);tmax=Math.max(tmax,t);const px=x-ax.x*t,py=y-ax.y*t,pz=z-ax.z*t;rmax=Math.max(rmax,Math.hypot(px,py,pz));}
   const r=rmax,t0=Math.min(tmin+r,(tmin+tmax)/2),t1=Math.max(tmax-r,(tmin+tmax)/2),o=P0[bone];
   return {bone,r,a:new THREE.Vector3(A.x+ax.x*t0-o.x,A.y+ax.y*t0-o.y,A.z+ax.z*t0-o.z),b:new THREE.Vector3(A.x+ax.x*t1-o.x,A.y+ax.y*t1-o.y,A.z+ax.z*t1-o.z)};};
  const caps=[];
  // Kopf (inkl. Hals und Haare)
  {const idx=sel(['head','neck']);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;for(const i of idx){x0=Math.min(x0,pos[i*3]);x1=Math.max(x1,pos[i*3]);y0=Math.min(y0,pos[i*3+1]);y1=Math.max(y1,pos[i*3+1]);z0=Math.min(z0,pos[i*3+2]);z1=Math.max(z1,pos[i*3+2]);}
   const cx=(x0+x1)/2,cz=(z0+z1)/2;let r=0;for(const i of idx)if(pos[i*3+1]>P0.head.y-.02)r=Math.max(r,Math.hypot(pos[i*3]-cx,pos[i*3+2]-cz));
   const ya=Math.max(y0,P0.head.y-.02)+r,yb=Math.max(ya,y1-r),o=P0.head;caps.push({bone:'head',head:true,r,a:new THREE.Vector3(cx-o.x,ya-o.y,cz-o.z),b:new THREE.Vector3(cx-o.x,yb-o.y,cz-o.z)});
   // Hals extra (schmal)
   const nk=axisCap('neck',['neck'],P0.neck,P0.head);if(nk){nk.head=true;caps.push(nk);}}
  // Rumpf als Stadion: zwei Kapseln links/rechts (Breite rx, Tiefe rz)
  {const idx=sel(['hips','spine','chest']).filter(i=>pos[i*3+1]>P0.legL.y-.04);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;
   for(const i of idx){x0=Math.min(x0,pos[i*3]);x1=Math.max(x1,pos[i*3]);y0=Math.min(y0,pos[i*3+1]);y1=Math.max(y1,pos[i*3+1]);z0=Math.min(z0,pos[i*3+2]);z1=Math.max(z1,pos[i*3+2]);}
   const rz=(z1-z0)/2,zc=(z0+z1)/2,rx=Math.max(Math.abs(x0),Math.abs(x1)),off=Math.max(0,rx-rz),o=P0.spine;
   for(const s of [-1,1])caps.push({bone:'spine',r:rz,a:new THREE.Vector3(s*off,y0+rz-o.y,zc-o.z),b:new THREE.Vector3(s*off,Math.max(y0+rz,y1-rz)-o.y,zc-o.z)});}
  for(const S of ['L','R']){
   const tip=P0['hand'+S].clone().add(new THREE.Vector3(0,-.2,0));
   for(const q of [axisCap('arm'+S,['arm'+S],P0['arm'+S],P0['fore'+S]),axisCap('fore'+S,['fore'+S,'hand'+S],P0['fore'+S],tip),axisCap('leg'+S,['leg'+S],P0['leg'+S],P0['shin'+S]),axisCap('shin'+S,['shin'+S],P0['shin'+S],P0['foot'+S]),
     axisCap('foot'+S,['foot'+S],P0['foot'+S].clone().add(new THREE.Vector3(0,-.05,-.06)),P0['foot'+S].clone().add(new THREE.Vector3(0,-.05,.22)))])if(q)caps.push(q);}
  if(caps.length>=8&&caps.every(q=>Number.isFinite(q.r)&&q.r>0&&q.r<.5))out=caps;}catch(e){out=null;}
 if(key)CHAR_CAPS.set(key,out);return out;}
// Strahl gegen Kapsel (Segment pa–pb, Radius r) = Zylinderkörper ∪ zwei Endkugeln; d normiert; liefert erstes t ≥ 0 oder −1
function rayCapsule(o,d,pa,pb,r){let best=-1;const bax=pb.x-pa.x,bay=pb.y-pa.y,baz=pb.z-pa.z,oax=o.x-pa.x,oay=o.y-pa.y,oaz=o.z-pa.z;
 const baba=bax*bax+bay*bay+baz*baz,bard=bax*d.x+bay*d.y+baz*d.z,baoa=bax*oax+bay*oay+baz*oaz,rdoa=d.x*oax+d.y*oay+d.z*oaz,oaoa=oax*oax+oay*oay+oaz*oaz;
 const a=baba-bard*bard;if(baba>1e-10&&a>1e-12){const b=baba*rdoa-baoa*bard,c=baba*oaoa-baoa*baoa-r*r*baba,h=b*b-a*c;if(h>=0){const t=(-b-Math.sqrt(h))/a,y=baoa+t*bard;if(t>=0&&y>0&&y<baba)best=t;}}
 for(const P of [pa,pb]){const ox=o.x-P.x,oy=o.y-P.y,oz=o.z-P.z,bb=ox*d.x+oy*d.y+oz*d.z,cc=ox*ox+oy*oy+oz*oz-r*r,hh=bb*bb-cc;if(hh>=0){const t=-bb-Math.sqrt(hh);if(t>=0&&(best<0||t<best))best=t;}}
 return best;}
// liefert {t,head} oder null
function charRayHit(c,o,d,maxT){const caps=c.caps!==undefined?c.caps:(c.caps=buildCharCaps(c,c.bkey));if(!caps){const base=c.g.position,t=charHit(o,d,base,maxT,.42,1.85);return t>=0?{t,head:(o.y+d.y*t-base.y)>1.55}:null;}
 const sc=c.g.scale.x;let best=null;
 for(const q of caps){const B=c[q.bone];_cA.copy(q.a).applyMatrix4(B.matrixWorld);_cB.copy(q.b).applyMatrix4(B.matrixWorld);
  const t=rayCapsule(o,d,_cA,_cB,q.r*sc);if(t>=0&&t<maxT&&(!best||t<best.t))best={t,head:!!q.head};}
 return best;}
function updateFoot(dt){
 if(P.stunT>0)P.stunT-=dt;
 let f=(key('KeyW','ArrowUp')?1:0)-(key('KeyS','ArrowDown')?1:0),r=(key('KeyD','ArrowRight')?1:0)-(key('KeyA','ArrowLeft')?1:0),amag=1;if(AN.on){f=-AN.y;r=AN.x;amag=Math.min(1,Math.hypot(AN.x,AN.y));}
 const sy=Math.sin(camYaw),cy=Math.cos(camYaw);let mx=sy*f-cy*r,mz=cy*f+sy*r;const len=P.stunT>0?0:Math.hypot(mx,mz);
 const aim=aiming();const sp=(aim?3.2:(K.ShiftLeft||K.ShiftRight)?9:4.5)*(AN.on&&amag<.85?Math.max(.4,amag/.85):1);
 if(len>0){mx/=len;mz/=len;P.pos.x+=mx*sp*dt;P.pos.z+=mz*sp*dt;P.face=lerpAng(P.face,Math.atan2(mx,mz),dt*12);P.phase+=dt*sp*1.7;P.stepT-=dt*sp*.42;if(P.stepT<=0){P.stepT=1;footstep(sp>5);}}
 collideCircle(P.pos,PLAYER_R);
 for(const c of cars){if(c.mode==='cine')continue;const dx=P.pos.x-c.pos.x,dz=P.pos.z-c.pos.z;if(dx*dx+dz*dz>(c.rad*2.2+1)**2)continue;circleVsCar(P.pos,PLAYER_R,c);}
 const gy=groundY(P.pos.x,P.pos.z);P.vy-=25*dt;P.pos.y+=P.vy*dt;
 if(P.pos.y<=gy){P.pos.y=gy;P.vy=0;if(K.Space&&P.stunT<=0)P.vy=8;}
 P.swing+=((len>0?Math.sin(P.phase)*(sp>5?.9:.6):0)-P.swing)*Math.min(1,dt*12);P.walkA=(P.walkA||0)+((len>0?(sp>5?.9:.6):0)-(P.walkA||0))*Math.min(1,dt*7);
 if(P.walkA>.06)animWalk(P.char,P.phase,P.walkA);else if(P.dancing)animDance(P.char,time,P.danceSt||0);else animIdle(P.char);P.char.g.position.copy(P.pos);P.char.g.rotation.y=P.face;
}
function bikeCrash(c){const sp=Math.abs(c.speed);exitCar(true);P.vy=5;P.stunT=1.3;hurtPlayer(10+sp*.6);toast('Autsch!');}
function vehicleVertical(c,dt){
 const gy=groundY(c.pos.x,c.pos.z);let ry=null,rmp=null;
 for(const r of ramps){const dx=c.pos.x-r.x,dz=c.pos.z-r.z;if(dx*dx+dz*dz>r.len*r.len+r.w*r.w)continue;const sn=Math.sin(r.ry),cs=Math.cos(r.ry);const lz=dx*sn+dz*cs,lx=dx*cs-dz*sn;if(Math.abs(lx)<r.w/2&&lz>=0&&lz<=r.len){ry=r.y0+r.h*lz/r.len;rmp=r;break;}}
 if(c.y==null)c.y=c.g.position.y;
 if(c.air){c.vy-=24*dt;c.y+=c.vy*dt;c.airT+=dt;const floor=ry!=null?Math.max(gy,ry):gy;if(c.y<=floor&&c.vy<0){c.y=floor;c.air=false;landing(c);}}
 else if(ry!=null){c.y=ry;c.onRamp=rmp;}
 else if(c.onRamp){const r=c.onRamp;c.onRamp=null;const fwd=Math.sin(c.h)*Math.sin(r.ry)+Math.cos(c.h)*Math.cos(r.ry);
  if(c.speed>10&&fwd>.55){c.air=true;c.vy=c.speed*(r.h/r.len)*1.1+2.5;c.airT=0;c.jumpRamp=r;c.y=r.y0+r.h;if(r.stunt&&!PROG.stunts.includes(r.id))stuntCam=1;}else c.y=gy;}
 else c.y+=(gy-c.y)*Math.min(1,dt*10);
}
function landing(c){const r=c.jumpRamp;c.jumpRamp=null;stuntCam=0;if(c.vy<-16)damageCar(c,(-c.vy-16)*12,'crash');
 if(r&&r.stunt&&c.airT>.8){if(!PROG.stunts.includes(r.id)){PROG.stunts.push(r.id);P.money+=500;cashSound();big('STUNTSPRUNG!',`${PROG.stunts.length}/${STUNT_TOTAL()} · +$500`,'#7fd1ff');saveGame(true);}else toast('Stuntsprung (schon geschafft)');}
 else if(c.airT>1.2)toast(`Sprung: ${c.airT.toFixed(1)} s in der Luft!`);}
function skid(c,dt){skidT-=dt;if(skidT>0)return;skidT=.035;for(const s of [-1,1]){const x=c.pos.x-Math.sin(c.h)*1.35+Math.cos(c.h)*s*.85,z=c.pos.z-Math.cos(c.h)*1.35-Math.sin(c.h)*s*.85;tmpObj.position.set(x,groundY(x,z)+.04,z);tmpObj.rotation.set(0,c.h,0);tmpObj.updateMatrix();skidMesh.setMatrixAt(skidI,tmpObj.matrix);skidI=(skidI+1)%SKID_N;}skidMesh.instanceMatrix.needsUpdate=true;}
function updatePlayerCar(dt){
 if(P.inCar.boat){updateBoat(P.inCar,dt);return;}
 const c=P.inCar,st=VST[c.vt]||VST.sedan,frozen=!!(race&&race.count>0);
 const up=!frozen&&key('KeyW','ArrowUp'),dn=!frozen&&key('KeyS','ArrowDown'),hb=K.Space;
 let s=(key('KeyA','ArrowLeft')?1:0)-(key('KeyD','ArrowRight')?1:0);if(AN.on)s=clamp(-AN.x*1.12,-1,1);
 if(!c.air){
  if(up)c.speed+=(c.speed<0?32:st.acc*(1-Math.max(0,c.speed)/st.max*.5))*dt;else if(dn)c.speed-=(c.speed>0?30:10)*dt;else c.speed*=1-.6*dt;
  if(hb)c.speed*=1-2.2*dt;if(frozen)c.speed=0;
  c.speed=clamp(c.speed,-13,st.max);}
 c.steer+=(s-c.steer)*Math.min(1,dt*6);
 const grip=WX.wet>.5?.86:1;
 const turn=c.air?0:c.steer*(c.bike?2.4:1.9)*grip*clamp(Math.abs(c.speed)/6,0,1)*Math.sign(c.speed)*(hb?1.55:1)*(1-Math.min(Math.abs(c.speed),55)/110);
 c.h+=turn*dt;
 if(!c.air&&c.slope)c.speed-=9.8*c.slope*dt*.75;
 c.pos.x+=Math.sin(c.h)*c.speed*dt;c.pos.z+=Math.cos(c.h)*c.speed*dt;
 const sp0=Math.abs(c.speed);
 vehicleVertical(c,dt);
 if(!c.air&&collideCar(c)){const br=hitSolids.filter(b=>b.breakable&&!b.broken);
  if(br.length&&sp0>4){const sg=Math.sign(c.speed)||1;for(const b of br)breakProp(b,Math.sin(c.h)*sg,Math.cos(c.h)*sg,sp0);c.speed*=c.bike?.55:c.vt==='tank'?.97:.86;shake=Math.max(shake,.18);if(c.vt!=='tank')damageCar(c,Math.min(12,sp0*.25),'crash');if(c.bike&&sp0>20&&P.inCar===c){bikeCrash(c);return;}}
  else if(sp0>7&&barrierRam(c))c.speed*=.75;else{if(sp0>6){shake=Math.min(1,sp0/30);crashSound(sp0);damageCar(c,Math.max(0,sp0-12)*4,'crash');if(c.bike&&sp0>15&&P.inCar===c){bikeCrash(c);return;}}c.speed*=-.25;}}
 if(P.inCar!==c)return;
 if(separateCar(c)){if(sp0>8){shake=Math.min(1,sp0/35);crashSound(sp0);c.speed*=.55;if(c.bike&&sp0>16&&P.inCar===c){bikeCrash(c);return;}}}
 if(P.inCar!==c)return;
 if(sp0>6&&!c.air)for(const p of peds){if(p.kind==='dummy'||p.state==='ko'||p.state==='fly'||p.state==='ride')continue;const g=p.c.g;const dx=g.position.x-c.pos.x,dz=g.position.z-c.pos.z;
  if(dx*dx+dz*dz<(c.rad*2.2+1)**2&&nearCar(g.position.x,g.position.z,c,NPC_R)){knockOut(p,new THREE.Vector3(Math.sin(c.h),0,Math.cos(c.h)),sp0*.6);p.vel.y=7+sp0*.15;tone(120,.12,'sine',.08,g.position);if(!p.aggro&&!p.patient&&!p.mission)addHeat(1,p.kind==='cop');}}
 const drift=!c.air&&!c.bike&&sp0>14&&(hb||Math.abs(c.steer)>.75&&sp0>28);
 if(drift)skid(c,dt);screechLevel=drift?Math.min(1,sp0/30):0;
 if(c.bike){c.body.rotation.z=-c.steer*Math.min(sp0,30)/30*.45;const ch=P.char;ch.legL.rotation.x=ch.legR.rotation.x=-1.3;ch.armL.rotation.x=ch.armR.rotation.x=-1.05;ch.armL.rotation.z=-.15;ch.armR.rotation.z=.15;}
 else c.body.rotation.z=-c.steer*Math.min(sp0,30)/30*.06;
 c.body.rotation.x=c.air?clamp(-c.vy*.02,-.3,.3):(up&&c.speed<15?-.02:0)+(dn&&c.speed>3?.03:0);
 for(const f of c.fronts)f.rotation.y=c.steer*.45;
 headSpot.intensity=night*80;
 P.pos.set(c.pos.x,c.g.position.y,c.pos.z);
}
function updateAI(c,dt){
 const A=nd(c.a.i,c.a.j),Bn=nd(c.b.i,c.b.j),fx=Math.sign(Bn.x-A.x),fz=Math.sign(Bn.z-A.z),h=Math.atan2(fx,fz),rx=-Math.cos(h),rz=Math.sin(h);
 let blocked=false,blocker=null;const red=c.t>.74&&c.t<.85&&lightState(c.b.i,c.b.j,fx!==0?'x':'z')!=='g';
 if(c.ghost>0)c.ghost-=dt;else{
  for(const o of cars){if(o===c||o.mode==='cine')continue;const ox=o.pos.x-c.pos.x,oz=o.pos.z-c.pos.z;if(ox*ox+oz*oz>110)continue;const al=ox*fx+oz*fz,lat=Math.abs(ox*rx+oz*rz);if(al>.5&&al<8.5&&lat<2.6){blocked=true;blocker=o;break;}}
  if(!P.inCar&&!P.inAir){const ox=P.pos.x-c.pos.x,oz=P.pos.z-c.pos.z,al=ox*fx+oz*fz,lat=Math.abs(ox*rx+oz*rz);if(al>0&&al<7&&lat<2.2)blocked=true;}}
 c.queued=red||(blocker&&blocker.queued);
 if(blocked&&!c.queued){c.blockT+=dt;if(c.blockT>2.5&&!c.honked){c.honked=true;hornAt(c.pos);}if(c.blockT>5){c.ghost=2;c.blockT=0;c.honked=false;}}else if(!blocked){c.blockT=0;c.honked=false;}
 if(c.bump>0){c.bump-=dt;blocked=true;}
 let panic=1;if(c.panicT>0){c.panicT-=dt;panic=1.6;}
 const stop=blocked||red;
 c.speed+=((stop?0:c.cruise*panic)-c.speed)*Math.min(1,dt*(stop?6:1.4));
 c.t+=c.speed*dt/CELL;
 if(c.t>=1){c.t-=1;const prev=c.a;c.a=c.b;let ns=nbrs(c.a).filter(n=>!(n.i===prev.i&&n.j===prev.j));if(!ns.length)ns=[prev];c.b=pick(ns);return;}
 const tx=A.x+(Bn.x-A.x)*c.t+rx*3.5,tz=A.z+(Bn.z-A.z)*c.t+rz*3.5,k=Math.min(1,dt*5);
 c.pos.x+=(tx-c.pos.x)*k;c.pos.z+=(tz-c.pos.z)*k;c.h=lerpAng(c.h,h,dt*4);
}
function updateRing(c,dt){const q=ringAt(c.rs);const h=Math.atan2(q.dx*c.rdir,q.dz*c.rdir),fx=Math.sin(h),fz=Math.cos(h),rx=-Math.cos(h),rz=Math.sin(h);
 let blocked=false;if(c.ghost>0)c.ghost-=dt;else{for(const o of cars){if(o===c||o.mode==='cine')continue;const ox=o.pos.x-c.pos.x,oz=o.pos.z-c.pos.z;if(ox*ox+oz*oz>200)continue;const al=ox*fx+oz*fz,lat=Math.abs(ox*rx+oz*rz);if(al>.5&&al<12&&lat<2.4){blocked=true;break;}}
  if(!P.inCar&&!P.inAir){const ox=P.pos.x-c.pos.x,oz=P.pos.z-c.pos.z,al=ox*fx+oz*fz,lat=Math.abs(ox*rx+oz*rz);if(al>0&&al<9&&lat<2.2)blocked=true;}}
 if(blocked){c.blockT+=dt;if(c.blockT>5){c.ghost=2;c.blockT=0;}}else c.blockT=0;
 if(c.bump>0){c.bump-=dt;blocked=true;}
 c.speed+=((blocked?0:c.cruise)-c.speed)*Math.min(1,dt*(blocked?5:1));c.rs+=c.speed*dt*c.rdir;
 const q2=ringAt(c.rs),h2=Math.atan2(q2.dx*c.rdir,q2.dz*c.rdir),tx=q2.x-Math.cos(h2)*c.lane,tz=q2.z+Math.sin(h2)*c.lane,k=Math.min(1,dt*4);
 c.pos.x+=(tx-c.pos.x)*k;c.pos.z+=(tz-c.pos.z)*k;c.h=lerpAng(c.h,h2,dt*3);}
function moveCarFwd(c,dt){c.pos.x+=Math.sin(c.h)*c.speed*dt;c.pos.z+=Math.cos(c.h)*c.speed*dt;}
// Skript-Fahrzeuge (Kurier, Rennfahrer, Geldtransporter) fahren eine Punkteliste ab
function routeCarSpawn(vt,color,nodes,speed,lane=3.5){const pts=nodes.map(n=>({x:n.x,z:n.z}));const c=makeCar(color,false,vt);c.mode='route';const p0=pts[0],p1=pts[1];const dx=Math.sign(p1.x-p0.x),dz=Math.sign(p1.z-p0.z);c.h=Math.atan2(dx,dz);
 c.pos.set(p0.x-Math.cos(c.h)*lane,0,p0.z+Math.sin(c.h)*lane);c.g.position.copy(c.pos);c.route={pts,idx:1,speed,lane,done:false,stop:false};cars.push(c);if(c.bike)addRider(c);return c;}
function updateRouteCar(c,dt){const R2=c.route;
 if(R2.done||R2.stop||R2.hold){c.speed*=1-Math.min(1,dt*2.5);moveCarFwd(c,dt);return;}
 const tgt=R2.pts[R2.idx],prev=R2.pts[R2.idx-1];const dx0=tgt.x-prev.x,dz0=tgt.z-prev.z,l0=Math.hypot(dx0,dz0)||1;
 const tx=tgt.x-dz0/l0*R2.lane,tz=tgt.z+dx0/l0*R2.lane;
 const ax=tx-c.pos.x,az=tz-c.pos.z,dist=Math.hypot(ax,az);
 const des=Math.atan2(ax,az);c.h+=clamp(angWrap(des-c.h),-2.6*dt,2.6*dt);
 let target=R2.speed*(R2.boost||1);const nxt=R2.pts[R2.idx+1];if(nxt){const t1=Math.atan2(dx0,dz0),t2=Math.atan2(nxt.x-tgt.x,nxt.z-tgt.z);if(Math.abs(angWrap(t2-t1))>.5&&dist<30)target=Math.min(target,11+dist*.6);}
 c.speed+=(target-c.speed)*Math.min(1,dt*1.5);moveCarFwd(c,dt);
 if(dist<8){R2.idx++;if(R2.idx>=R2.pts.length){R2.done=true;if(R2.onDone)R2.onDone();}}}
// Flüchtende Gangster (Bürgerwehr) – fahren durchs Straßennetz weg vom Spieler
function updateFleeCar(c,dt){if(c.stopped){c.speed*=1-Math.min(1,dt*2);moveCarFwd(c,dt);collideCar(c);return;}
 const A=nd(c.a.i,c.a.j),Bn=nd(c.b.i,c.b.j),fx=Math.sign(Bn.x-A.x),fz=Math.sign(Bn.z-A.z),h=Math.atan2(fx,fz),rx=-Math.cos(h),rz=Math.sin(h);
 c.speed+=(c.cruise-c.speed)*Math.min(1,dt*1.5);c.t+=c.speed*dt/CELL;
 if(c.t>=1){c.t-=1;const prev=c.a;c.a=c.b;let ns=nbrs(c.a).filter(n=>!(n.i===prev.i&&n.j===prev.j));if(!ns.length)ns=[prev];
  ns.sort((p,q)=>{const P1=nd(p.i,p.j),Q1=nd(q.i,q.j);return Math.hypot(Q1.x-P.pos.x,Q1.z-P.pos.z)-Math.hypot(P1.x-P.pos.x,P1.z-P.pos.z);});c.b=Math.random()<.75?ns[0]:pick(ns);if(Math.random()<.3)hornAt(c.pos);return;}
 const tx=A.x+(Bn.x-A.x)*c.t+rx*3.5,tz=A.z+(Bn.z-A.z)*c.t+rz*3.5,k=Math.min(1,dt*5);c.pos.x+=(tx-c.pos.x)*k;c.pos.z+=(tz-c.pos.z)*k;c.h=lerpAng(c.h,h,dt*4);}
function updatePolice(c,dt){
 if(c.halt>0){c.halt-=dt;c.speed*=1-Math.min(1,dt*4);moveCarFwd(c,dt);return;}
 // Mit GPS-Tracker fährt die Streife erst den zuletzt gemeldeten Punkt an.
 // Zwischen zwei Pings wird nicht magisch die aktuelle Spielerposition verfolgt.
 const hasFreshPing=!!(GPS_TRACK.last&&time-GPS_TRACK.lastAt<22);
 const target=hasFreshPing?GPS_TRACK.last:P.pos;
 const tx=target.x-c.pos.x,tz=target.z-c.pos.z,d=Math.hypot(tx,tz);
 if(c.rev>0){c.rev-=dt;c.speed=-8;c.h+=c.revDir*1.6*dt;}
 else{const des=Math.atan2(tx,tz);c.h+=clamp(angWrap(des-c.h),-2.5*dt,2.5*dt);
  const ts=d>16?24+wanted*3.5:Math.max(0,(d-4.5)*2.2);c.speed+=(ts-c.speed)*Math.min(1,dt*1.6);}
 moveCarFwd(c,dt);
 if(collideCar(c)){c.speed*=.3;c.stuck+=dt;if(c.stuck>.7){c.rev=1.1;c.revDir=Math.random()<.5?-1:1;c.stuck=0;}}else c.stuck=Math.max(0,c.stuck-dt*.5);
 separateCar(c);
}
function syncCar(c,dt){
 if(cineHide&&cineHide(c)){c.g.visible=false;return;}
 const d=Math.hypot(c.pos.x-camera.position.x,c.pos.z-camera.position.z);c.g.visible=d<cullCar||c.mode==='police'||c===P.inCar||c.mode==='route'||c.mode==='cine';if(!c.g.visible)return;
 if(c.mode==='tumble')return;
 if(c.boat){c.g.position.set(c.pos.x,boatFloat(c,dt)+Math.sin(time*1.6+c.bob)*.03,c.pos.z);c.g.rotation.y=c.h;if(c!==P.inCar){c.body.rotation.x=c._wp+Math.sin(time*1.1+c.bob)*.012;c.body.rotation.z=c._wr+Math.sin(time*1.3+c.bob)*.02;}return;}
 const gy=groundY(c.pos.x,c.pos.z);c.g.position.x=c.pos.x;c.g.position.z=c.pos.z;
 if(c===P.inCar&&c.y!=null)c.g.position.y=c.y;else c.g.position.y+=(gy-c.g.position.y)*Math.min(1,dt*10);
 c.g.rotation.y=c.h;for(const w of c.wheels)w.rotation.x+=c.speed*dt/.4;
 if(!c.air)carTilt(c,dt);
}
function npcSay(n,cat,prio=0){if(!n||(n.sayT||0)>time)return;n.sayT=time+RR(4,8);if(!n.voice)n.voice={pitch:n.kind==='cop'?RR(.75,.95):n.aggro?RR(.6,.9):RR(.8,1.45),rate:RR(.95,1.15),who:Math.floor(Math.random()*4)};speak(pick(LINES[cat]),{pitch:n.voice.pitch,rate:n.voice.rate,who:n.voice.who,prio,pos:n.c.g.position});}
function moveNPC(n,ux,uz,sp,dt){const g=n.c.g;if(n.stagger>0)sp*=.25;g.position.x+=ux*sp*dt;g.position.z+=uz*sp*dt;collideCircle(g.position,NPC_R);g.position.y=groundY(g.position.x,g.position.z);
 g.rotation.y=lerpAng(g.rotation.y,Math.atan2(ux,uz),dt*10);g.rotation.x=0;g.rotation.z=0;n.phase+=dt*sp*1.7;animWalk(n.c,n.phase,sp>5?.88:.62);g.visible=true;}
function faceNPC(n,ux,uz,dt){n.c.g.rotation.y=lerpAng(n.c.g.rotation.y,Math.atan2(ux,uz),dt*10);}
function spawnThug(x,z,armed){const p=makeCiv(true,armed);placePed(p);p.c.g.position.set(x,groundY(x,z),z);p.state='fight';peds.push(p);npcSay(p,'thug',1);return p;}
function spawnCop(x,z,o={}){const swat=o.swat||wanted>=4;const sk={statur:1,haut:Math.floor(Math.random()*6),frisur:0,haarfarbe:0,oberteil:3,oberteilfarbe:0,hose:0,hosenfarbe:0,schuhe:1,extra:3,topC:swat?0x161616:0x1c2c4c,pantsC:swat?0x161616:0x141c30};
 const c=buildChar(sk);scene.add(c.g);c.g.position.set(x,groundY(x,z),z);const n={c,kind:'cop',hp:swat?150:100,state:'fight',vel:new THREE.Vector3(),timer:0,phase:0,atkT:RR(1,2),stagger:0,armed:true,wdmg:swat?8:7,wrate:swat?.55:1};
 const gm=weaponModel(swat?'smg':'pistol');gm.rotation.x=Math.PI/2;c.handR.add(gm);peds.push(n);if(Math.random()<.5)npcSay(n,'cop',1);return n;}
function spawnGang(x,z,armed,guard,o={}){const p=makeCiv(true,false);
 if(o.boss||o.topC){scene.remove(p.c.g);p.c.dispose();const sk=randomSkin();if(o.boss){sk.statur=2;sk.topC=0x7a0f0f;sk.extra=1;sk.frisur=3;}if(o.topC){sk.topC=o.topC;sk.pantsC=o.pantsC??0x222222;sk.extra=o.extra??3;}p.c=buildChar(sk);if(o.boss)p.c.g.scale.setScalar(1.08);scene.add(p.c.g);}
 placePed(p);if(armed)armNPC(p,o.weapon||(o.boss?'shotgun':'pistol'));p.armed=armed;p.mission=true;p.downOnce=false;p.hp=o.hp||(o.boss?320:100);p.c.g.position.set(x,groundY(x,z),z);p.c.g.rotation.y=o.face??Math.random()*6.28;p.state=guard?'guard':'fight';p.label=o.name||null;if(!p.arrow){const ar=new THREE.Mesh(arrowGeo,arrowMat);ar.position.y=2.85;p.c.g.add(ar);p.arrow=ar;}peds.push(p);return p;}
function spawnPatrol(xa,za,xb,zb,o={}){const p=spawnGang(xa,za,o.armed!==false,true,o);p.state='patrol';p.pa={x:xa,z:za};p.pb={x:xb,z:zb};p.pdir=true;p.pwait=0;p.sus=0;
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:exclTex,transparent:true,depthTest:false,opacity:0}));s.scale.setScalar(.7);s.position.y=2.45;p.c.g.add(s);p.excl=s;return p;}
function stealthTick(guards,dt){let det=false;
 for(const n of guards){if(n.state==='ko'||n.state==='fly'||!n.excl)continue;const g=n.c.g;const dx=P.pos.x-g.position.x,dz=P.pos.z-g.position.z,d=Math.hypot(dx,dz);
  const ang=Math.abs(angWrap(Math.atan2(dx,dz)-g.rotation.y));let see=0;
  if(d<3.5)see=2.5;else if(d<16&&ang<.8){const from=new THREE.Vector3(g.position.x,g.position.y+1.6,g.position.z),to=new THREE.Vector3(P.pos.x,P.pos.y+1.2,P.pos.z);const dir=to.clone().sub(from);const L=dir.length();dir.normalize();if(worldHitT(from,dir,L)>=L-.5)see=(1.9-d/11)*((K.ShiftLeft||K.ShiftRight)?1.5:1)*(P.inCar?1.6:1);}
  n.sus=clamp(n.sus+(see>0?see*dt:-dt*.4),0,1);n.excl.material.opacity=n.sus>0?.35+n.sus*.65:0;n.excl.material.color.setRGB(1,1-n.sus*.8,1-n.sus);
  if(n.state==='patrol'&&n.sus>.3){g.rotation.y=lerpAng(g.rotation.y,Math.atan2(dx,dz),dt*2*n.sus);}
  if(n.sus>=1)det=true;}
 if(det)for(const n of guards){if(n.state==='patrol'||n.state==='guard'){n.state='fight';npcSay(n,'thug',1);}if(n.excl)n.excl.material.opacity=1;}
 return det;}
function alertGroup(n){for(const o of peds)if(o.mission&&(o.state==='guard')&&o.c.g.position.distanceTo(n.c.g.position)<45)o.state='fight';}
function clearMission(){for(let i=peds.length-1;i>=0;i--){const n=peds[i];if(n.mission&&!n.downOnce){scene.remove(n.c.g);n.c.dispose();peds.splice(i,1);}}for(const c of mCars)if(c.mode!=='wreck')removeCar(c);mCars=[];mGroup=[];mGuards=[];}
function gangCar(x,z,h){const c=parkedCar(x,z,h,0x2b0f0f,'suv');c.gang=true;c.keep=true;return c;}
function ensureArmedHeli(){let a=aircraft.find(q=>q.armed&&q.type==='heli'&&!q.dead&&!q.police&&q.mode==='parked');if(!a)a=placeAir(makeHeli(0x4b5a2e,true),AIRX0+90,250,-Math.PI/2);return a;}
function ensureBeachHeli(){let a=aircraft.find(q=>q.type==='heli'&&!q.dead&&!q.police&&q.mode==='parked'&&Math.hypot(q.g.position.x-(PIERX-40),q.g.position.z-(COAST+18))<40);if(!a)a=placeAir(makeHeli(0x2e86de,false),PIERX-40,COAST+18,Math.PI*.9);return a;}
function makeDummy(x,z,kind){const g=new THREE.Group();let dh;
 if(kind==='bag'){g.add(mesh(new THREE.CylinderGeometry(.04,.04,2.4,6),cm(0x555555,.5,.6),0,1.2,0),mesh(new THREE.CylinderGeometry(.33,.33,1.15,14),cm(0x8b2a1a,.8),0,1.25,0));dh=1.9;}
 else{const t=canvasTex(128,128,(c)=>{const cols=['#ffffff','#d22222','#ffffff','#d22222','#ffffff','#d22222'];for(let i=0;i<6;i++){c.fillStyle=cols[i];c.beginPath();c.arc(64,64,62-i*10,0,7);c.fill();}});
  const board=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.08,24),M({map:t,roughness:.8}));board.rotation.x=Math.PI/2;board.position.y=1.45;board.castShadow=true;g.add(board,mesh(new THREE.BoxGeometry(.08,1.3,.08),cm(0x6b4a2b,.8),0,.65,-.06));dh=2.1;}
 g.position.set(x,groundY(x,z),z);scene.add(g);const n={c:{g,dispose(){}},kind:'dummy',hp:kind==='bag'?60:1,state:'idle',vel:new THREE.Vector3(),dh,wob:0};peds.push(n);return n;}
function clearDummies(){for(let i=peds.length-1;i>=0;i--)if(peds[i].kind==='dummy'){scene.remove(peds[i].c.g);peds.splice(i,1);}}
function showBag(v,x=nodeX(1)+2,z=nodeX(N-1)+30){bagMesh.visible=v;if(v)bagMesh.position.set(x,groundY(x,z),z);}
function npcShoot(n){const g=n.c.g;const from=new THREE.Vector3(g.position.x,g.position.y+1.45,g.position.z);
 const to=P.inAir?P.inAir.g.position.clone():new THREE.Vector3(P.pos.x,P.pos.y+(P.inCar?1:1.2),P.pos.z);
 const d=to.clone().sub(from);const dist=d.length();d.normalize();
 if(worldHitT(from,d,dist)<dist-1.5)return;
 const moving=P.inCar?Math.min(1,Math.abs(P.inCar.speed)/25):P.inAir?1:(K.KeyW||K.KeyA||K.KeyS||K.KeyD)?.45:0;
 const acc=clamp(.7-dist*.012-moving*.35,.06,.75);
 const mz=from.clone().addScaledVector(d,.8);flash(mz,.45);gunSound(.09,'pistol',from);
 const end=to.clone();if(Math.random()<acc)hurtPlayer(n.wdmg||(n.kind==='cop'?7:6),from);else end.add(tmpV.set(RR(-1.5,1.5),RR(-1,1),RR(-1.5,1.5)));
 tracer(mz,end);lastCombatT=time;}
function updateNPCs(dt){
 const pp=P.pos,onFoot=!P.inCar&&!P.inAir&&!P.dead,play=mode==='play'||(mode==='cine'&&!!(cineCombat&&cineCombat.active&&cineCombat.ready));
 const moving=onFoot&&(K.KeyW||K.KeyA||K.KeyS||K.KeyD||K.ArrowUp||K.ArrowDown);
 for(let i=peds.length-1;i>=0;i--){const n=peds[i];const g=n.c.g;
  if(n.arrow){const v=!!n.mission&&!n.downOnce&&n.state!=='ko'&&n.state!=='fly';n.arrow.visible=v;if(v)n.arrow.rotation.y+=dt*3;}
  if(n.kind==='dummy'){if(n.wob>0){n.wob-=dt;if(n.state!=='ko')g.rotation.z=Math.sin(n.wob*25)*n.wob*.5;}continue;}
  if(n.stagger>0)n.stagger-=dt;
  const dx=pp.x-g.position.x,dz=pp.z-g.position.z,dist=Math.hypot(dx,dz);
  let st=n.state;
  if(play&&!P.dead&&n.kind==='civ'&&!n.ip&&n.playerMemoryUntil>time&&dist<24&&time-(n.memoryReactAt||-99)>12&&['idle','walk','wait'].includes(st)){n.memoryReactAt=time;n.state='flee';n.fleeT=9;n.threat=pp.clone();propsOff(n);npcSay(n,'hurt',1);st=n.state;}
  const nearAI=dist<=13;
  // Auf Distanz laufen Zivilisten nur mit einfacher, seltener aktualisierter Routine.
  // Ab etwa 13 m schalten sie wieder auf Navigation, Reaktion und vollständige Animation um.
  if(!nearAI&&!n.ip&&!n.post&&!n.mission&&(st==='walk'||st==='idle')){
   n.aiLodAcc=(n.aiLodAcc||0)+dt;const interval=clamp(.16+dist/260,.2,.7);g.visible=dist<cullPed;
   if(n.aiLodAcc<interval)continue;const step=n.aiLodAcc;n.aiLodAcc=0;
   if(st==='walk'){n.s+=n.dir*n.spd*step;const [x,z,f]=pedPos(n);g.position.set(x,.3,z);g.rotation.y=f;if(g.visible&&dist<38){n.phase+=step*n.spd*(n.role==='jog'?2.6:4);animWalk(n.c,n.phase,n.role==='jog'?.92:.55);walkerPose(n);}}
   else if(g.visible&&dist<30)idlePedTick(n,step,dist,false,false);
   continue;
  }
  // Entfernte Kämpfer verfolgen das Ziel grob und feuern seltener; komplexe Navigation gibt es nah am Spieler.
  if(!nearAI&&!n.ip&&st==='fight'){
   if(n.post&&(!play||P.dead||dist>95||!postAlert(n))){toPost(n);continue;}
   if(n.mission&&(!play||P.dead||dist>80)){n.state='guard';continue;}
   if(!play||P.dead||dist>55&&!n.post){if(n.kind==='cop'){if(dist>90||!play){scene.remove(g);n.c.dispose();peds.splice(i,1);}else moveNPC(n,dx/(dist||1),dz/(dist||1),4,dt);}else placePed(n,pp);continue;}
   n.aiLodAcc=(n.aiLodAcc||0)+dt;const interval=.35+Math.min(.45,(dist-13)/90);if(n.aiLodAcc<interval)continue;const step=n.aiLodAcc;n.aiLodAcc=0;
   if(dist>1.5)moveNPC(n,dx/(dist||1),dz/(dist||1),n.kind==='cop'?3.5:2.8,step);
   if((n.armed||n.kind==='cop')&&dist<38){n.atkT=(n.atkT||0)-step;if(n.atkT<=0&&Math.random()<.22){n.atkT=2.4;npcShoot(n);}}
   g.visible=dist<cullPed;continue;
  }
  // Entfernte Patrouillen halten nur ihren Weg; Spieler-Erkennung startet erst in Nahdistanz.
  if(!nearAI&&!n.ip&&st==='patrol'){
   n.aiLodAcc=(n.aiLodAcc||0)+dt;const interval=.3+Math.min(.4,dist/250);g.visible=dist<cullPed;if(n.aiLodAcc<interval)continue;const step=n.aiLodAcc;n.aiLodAcc=0;const tgt=n.pdir?n.pb:n.pa,ax=tgt.x-g.position.x,az=tgt.z-g.position.z,l=Math.hypot(ax,az);if(n.pwait>0)n.pwait-=step;else if(l<.8){n.pdir=!n.pdir;n.pwait=RR(1.5,3);}else moveNPC(n,ax/l,az/l,1.0,step);continue;
  }
  if(n.ip&&ipNPC(n,dt,dist,play,onFoot))continue;
  if(st==='walk'){n.s+=n.dir*n.spd*dt;const [x,z,f]=pedPos(n);g.position.set(x,.3,z);g.rotation.y=f;
   g.visible=Math.hypot(x-camera.position.x,z-camera.position.z)<cullPed;if(g.visible){n.phase+=dt*n.spd*(n.role==='jog'?2.6:4);animWalk(n.c,n.phase,n.role==='jog'?.92:.55);walkerPose(n);}
   if(play&&moving&&dist<1.1)npcSay(n,'bump');
   if(n.aggro&&play&&onFoot&&dist<6.5&&!(mission&&n.amb)){n.state='fight';propsOff(n);npcSay(n,'thug',1);}}
  else if(st==='idle'){idlePedTick(n,dt,dist,play,onFoot);}
  else if(st==='wait'){g.visible=dist<cullPed;animChar(n.c,0);n.c.armR.rotation.x=-2.7+Math.sin(time*6)*.25;if(play&&dist<13)faceNPC(n,dx/(dist||1),dz/(dist||1),dt);}
  else if(st==='ride'){g.visible=false;}
  else if(st==='clerk'){g.visible=Math.hypot(g.position.x-camera.position.x,g.position.z-camera.position.z)<cullPed;animChar(n.c,0);}
  else if(st==='handsup'){g.visible=true;animChar(n.c,0);n.c.armL.rotation.x=n.c.armR.rotation.x=-2.9;n.hT-=dt;if(n.hT<=0&&n.kind!=='clerk'){n.state='flee';n.fleeT=8;n.threat=pp.clone();}}
  else if(st==='patrol'){g.visible=true;const tgt=n.pdir?n.pb:n.pa;const ax=tgt.x-g.position.x,az=tgt.z-g.position.z,l=Math.hypot(ax,az);
   if(n.pwait>0){n.pwait-=dt;animChar(n.c,0);g.rotation.y+=Math.sin(time*.8+i)*dt*.9;}else if(l<.6){n.pdir=!n.pdir;n.pwait=RR(1.5,3);}else moveNPC(n,ax/l,az/l,1.5,dt);if(n.armed)n.c.armR.rotation.x=-.35;
   if(n.post&&play&&!P.dead&&postAlert(n)&&dist<(n.post.zone==='mil'?85:50)){n.state='fight';npcSay(n,'cop',1);}}
  else if(st==='guard'){g.visible=dist<cullPed;animChar(n.c,0);if(n.armed)n.c.armR.rotation.x=-.35;
   if(n.post){if(play&&!P.dead&&postAlert(n)&&dist<(n.post.zone==='mil'?85:50)){n.state='fight';npcSay(n,'cop',1);}}
   else if(play&&!P.dead&&dist<13){n.state='fight';alertGroup(n);npcSay(n,'thug',1);}}
  else if(st==='flee'){n.fleeT-=dt;const tx=n.threat?n.threat.x:pp.x,tz=n.threat?n.threat.z:pp.z;const ax=g.position.x-tx,az=g.position.z-tz,l=Math.hypot(ax,az)||1;moveNPC(n,ax/l,az/l,6.5,dt);
   if(n.fleeT<=0){if(dist>60||!play)placePed(n,pp);else n.fleeT=4;}}
  else if(st==='fight'){
   if(n.post&&(!play||P.dead||dist>95||!postAlert(n))){toPost(n);continue;}
   if(n.mission&&(!play||P.dead||dist>80)){n.state='guard';continue;}
   if(!play||P.dead||dist>55&&!n.post){if(n.kind==='cop'){if(dist>90||!play){scene.remove(g);n.c.dispose();peds.splice(i,1);}else moveNPC(n,dx/dist,dz/dist,6,dt);}else placePed(n,pp);continue;}
   n.atkT-=dt;const ux=dx/(dist||1),uz=dz/(dist||1);
   const ranged=n.kind==='cop'?wanted>=2:n.armed;
   if(n.kind==='civ'&&!ranged&&!onFoot&&!n.mission&&!n.fistFight){n.state='flee';n.fleeT=8;n.threat=null;continue;}
   if(n.kind==='cop'&&Math.random()<dt*.12)npcSay(n,wanted>=2?'cop':'copArrest');
   const nv=npcNav(n,pp.x,pp.z,dt);
   if(ranged){const want=n.kind==='cop'?13:9;
    if(nv&&dist>1.6)moveNPC(n,nv[0],nv[1],n.kind==='cop'?5.2:4.4,dt);
    else if(dist>want+5)moveNPC(n,ux,uz,n.kind==='cop'?5.5:4.5,dt);else if(dist<want-5)moveNPC(n,-ux,-uz,3,dt);else{faceNPC(n,ux,uz,dt);animChar(n.c,0);}
    n.c.armR.rotation.x=-Math.PI/2;g.rotation.y=lerpAng(g.rotation.y,Math.atan2(ux,uz),dt*10);
    if(n.atkT<=0&&dist<48){n.atkT=(n.wrate||1)*(n.kind==='cop'?RR(.8,1.4):RR(1,1.7));npcShoot(n);}}
   else{
    if(nv&&dist>1.35)moveNPC(n,nv[0],nv[1],n.kind==='cop'?5.6:5,dt);else if(dist>1.35)moveNPC(n,ux,uz,n.kind==='cop'?6.2:5.3,dt);else{faceNPC(n,ux,uz,dt);animChar(n.c,0);
     if(n.kind!=='cop'&&n.atkT<=0&&onFoot){n.atkT=n.fistFight?.85:1.0;n.punchT=.3;hurtPlayer(n.punch||(n.fistFight?7:9),g.position);punchSound(g.position);lastCombatT=time;}}
    if(n.punchT>0){n.punchT-=dt;n.c.armR.rotation.x=-1.7*Math.sin(Math.max(0,.3-n.punchT)/.3*Math.PI);}}}
  else if(st==='fly'){n.timer-=dt;n.vel.y-=22*dt;g.position.addScaledVector(n.vel,dt);g.rotation.x+=dt*7;
   const gy=groundY(g.position.x,g.position.z);if(g.position.y<=gy&&n.vel.y<0){g.position.y=gy+.15;n.state='ko';g.rotation.set(-Math.PI/2,g.rotation.y,0);}
   if(n.timer<-6){n.state='ko';g.position.y=gy+.15;}}
  else if(st==='ko'){n.timer-=dt;if(n.post){if(n.timer<=0&&dist>80&&!postAlert(n))resetPost(n);continue;}if(n.timer<=0&&!n.patient){n.mission=false;if(n.kind==='cop'){scene.remove(g);n.c.dispose();peds.splice(i,1);}else if(n.kind==='clerk')resetClerk(n);else if(peds.length>92){scene.remove(g);n.c.dispose();peds.splice(i,1);}else placePed(n,pp);}}
 }
}
function roadPoint(r,s){const P=r.pts;s=clamp(s,0,r.len);let lo=0,hi=P.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(P[m].s<=s)lo=m;else hi=m;}const a=P[lo],b=P[hi],t=b.s>a.s?(s-a.s)/(b.s-a.s):0;
 return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,y:a.y+(b.y-a.y)*t,dx:b.x-a.x,dz:b.z-a.z};}
function laneFor(r){return r.type==='hw'?(Math.random()<.5?1.9:5.6):r.type==='road'?2.5:1.8;}
function cruiseFor(r,c){const b=r.type==='hw'?R(27,36):r.type==='road'?R(18,26):R(10,15);return c.vt==='truck'||c.vt==='bus'?b*.78:b;}
function spawnLandCar(near,minD=170,maxD=520){for(let tries=0;tries<24;tries++){const r=pick(ROADS);const s=Math.random()*r.len;const q=roadPoint(r,s);const d=Math.hypot(q.x-near.x,q.z-near.z);if(d<minD||d>maxD)continue;
  if(Math.hypot(q.x-camera.position.x,q.z-camera.position.z)<140)continue;
  let clash=false;for(const o of cars){if(o.mode==='land'&&Math.abs(o.pos.x-q.x)<14&&Math.abs(o.pos.z-q.z)<14){clash=true;break;}}if(clash)continue;
  const c=makeCar(pick(carColors),false,pick(LAND_TYPES[r.type]));c.mode='land';c.rd=r;c.rs=s;c.rdir=Math.random()<.5?1:-1;c.lane=laneFor(r);c.cruise=cruiseFor(r,c);c.blockT=0;c.ghost=0;
  const h=Math.atan2(q.dx*c.rdir,q.dz*c.rdir);c.h=h;c.pos.set(q.x-Math.cos(h)*c.lane,0,q.z+Math.sin(h)*c.lane);c.g.position.set(c.pos.x,q.y,c.pos.z);c.speed=c.cruise*.8;
  if(c.bike&&typeof addRider==='function')addRider(c);cars.push(c);return c;}return null;}
function updateLand(c,dt){const r=c.rd;if(!r){c.mode='parked';return;}
 const q=roadPoint(r,c.rs);const h=Math.atan2(q.dx*c.rdir,q.dz*c.rdir),fx=Math.sin(h),fz=Math.cos(h),rx=-Math.cos(h),rz=Math.sin(h);
 let blocked=false;if(c.ghost>0)c.ghost-=dt;else{for(const o of cars){if(o===c||o.mode==='cine')continue;const ox=o.pos.x-c.pos.x,oz=o.pos.z-c.pos.z;if(ox*ox+oz*oz>420)continue;const al=ox*fx+oz*fz,lat=Math.abs(ox*rx+oz*rz);if(al>.5&&al<(c.speed>20?18:12)&&lat<2.4){blocked=true;break;}}
  if(!P.inAir){const ox=P.pos.x-c.pos.x,oz=P.pos.z-c.pos.z,al=ox*fx+oz*fz,lat=Math.abs(ox*rx+oz*rz);if(al>0&&al<(P.inCar?14:10)&&lat<2.3){blocked=true;if(!c.honkT||c.honkT<time){c.honkT=time+3;hornAt(c.pos);}}}}
 if(blocked){c.blockT+=dt;if(c.blockT>6){c.ghost=2;c.blockT=0;}}else c.blockT=0;
 if(c.bump>0){c.bump-=dt;blocked=true;}
 // vor Kurven abbremsen
 const ahead=roadPoint(r,c.rs+c.rdir*30);const ha=Math.atan2(ahead.dx*c.rdir,ahead.dz*c.rdir);const bend=Math.abs(angWrap(ha-h));const tgt=blocked?0:c.cruise*clamp(1-bend*1.4,.45,1);
 c.speed+=(tgt-c.speed)*Math.min(1,dt*(blocked?5:1.2));c.rs+=c.speed*dt*c.rdir;
 if(c.rs<0||c.rs>r.len){const end=c.rs>r.len?1:0;const L=r.links[end];
  if(L.length&&Math.random()<.85){const k=pick(L);c.rd=k.r;c.rs=k.s;c.rdir=k.dir;c.lane=laneFor(k.r);c.cruise=cruiseFor(k.r,c);}
  else{c.rdir*=-1;c.rs=clamp(c.rs,0,r.len);}}
 const q2=roadPoint(c.rd,c.rs),h2=Math.atan2(q2.dx*c.rdir,q2.dz*c.rdir),tx=q2.x-Math.cos(h2)*c.lane,tz=q2.z+Math.sin(h2)*c.lane,k=Math.min(1,dt*4);
 c.pos.x+=(tx-c.pos.x)*k;c.pos.z+=(tz-c.pos.z)*k;c.h=lerpAng(c.h,h2,dt*3);}
function landTrafficTick(dt){landTick-=dt;if(landTick>0)return;landTick=.5;
 const outside=Math.abs(P.pos.x)>HALF+120||P.pos.z<-HALF-120||P.pos.z>COAST+80;const want=outside?[10,18,26][SET.quality]||18:6;
 let n=0;for(let i=cars.length-1;i>=0;i--){const c=cars[i];if(c.mode!=='land')continue;n++;const d=Math.hypot(c.pos.x-P.pos.x,c.pos.z-P.pos.z);
  if(d>720&&c!==P.inCar&&!c.keep){removeCar(c);n--;}}
 if(n<want)spawnLandCar(P.pos,outside?160:300,outside?520:700);}
// Gelände-Neigung für Fahrzeuge (Nicken & Rollen auf Hügeln)
function carTilt(c,dt){const x=c.pos.x,z=c.pos.z;if(Math.abs(x)<HALF+ROAD/2&&z>-HALF-ROAD/2&&z<COAST){if(c.g.rotation.x||c.g.rotation.z){c.g.rotation.x*=.8;c.g.rotation.z*=.8;}return;}
 if(c.g.rotation.order!=='YXZ')c.g.rotation.order='YXZ';const sh=Math.sin(c.h),ch=Math.cos(c.h),L=c.bike?1:1.7,W=c.bike?.2:.85;
 const hf=groundY(x+sh*L,z+ch*L),hb=groundY(x-sh*L,z-ch*L),hl=groundY(x+ch*W,z-sh*W),hr=groundY(x-ch*W,z+sh*W);
 const pt=-Math.atan2(hf-hb,2*L),rl=c.bike?0:Math.atan2(hl-hr,2*W);const k=Math.min(1,dt*8);c.g.rotation.x+=(clamp(pt,-.5,.5)-c.g.rotation.x)*k;c.g.rotation.z+=(clamp(rl,-.4,.4)-c.g.rotation.z)*k;c.slope=Math.sin(-pt);}

// ================= STADTLEBEN: Zufallsereignisse, Tänzer, Straßenkünstler =================
// Tanzen (für Clubs, Partys, Straßenkünstler)
function animDance(c,t,st=0,e=1){poseReset(c);const b=t*Math.PI*2*2.1,s=Math.sin(b),s2=Math.sin(b*.5),bo=Math.abs(Math.sin(b));
 c.hips.position.y=.95-.055*bo*e;c.hips.position.x=.045*s2*e;c.hips.rotation.y=.28*s2*e;c.hips.rotation.z=.07*s*e;
 c.legL.rotation.x=-.14*bo;c.legR.rotation.x=-.14*bo;c.shinL.rotation.x=.3*bo+.05;c.shinR.rotation.x=.3*bo+.05;c.footL.rotation.x=-.15*bo;c.footR.rotation.x=-.15*bo;
 c.chest.rotation.y=-.22*s2*e;c.chest.rotation.x=.07*bo;c.head.rotation.x=.2*bo-.06;c.head.rotation.y=.16*s2;
 if(st===0){c.armL.rotation.z=-2.4-.35*s;c.armR.rotation.z=2.4-.35*s;c.foreL.rotation.x=-.35;c.foreR.rotation.x=-.35;}
 else if(st===1){c.armR.rotation.x=-1.5-1.1*bo;c.foreR.rotation.x=-.7;c.armL.rotation.z=-.35;c.foreL.rotation.x=-1.3;c.armL.rotation.x=-.3;}
 else if(st===2){c.armL.rotation.x=-.9*s;c.armR.rotation.x=.9*s;c.armL.rotation.z=-.45;c.armR.rotation.z=.45;c.foreL.rotation.x=-1;c.foreR.rotation.x=-1;}
 else if(st===3){// Breakdance-Toprock & Freeze
  const ph=(t*.5)%4;if(ph<3){c.hips.rotation.y=b*.5;c.legL.rotation.x=-.6*Math.max(0,s);c.legR.rotation.x=-.6*Math.max(0,-s);c.shinL.rotation.x=.9*Math.max(0,s);c.shinR.rotation.x=.9*Math.max(0,-s);c.armL.rotation.x=-1.1;c.armR.rotation.x=-1.1;c.foreL.rotation.x=-1.2;c.foreR.rotation.x=-1.2;c.armL.rotation.z=-.3*s;c.armR.rotation.z=.3*s;}
  else{c.hips.position.y=.45;c.hips.rotation.z=1.2;c.armR.rotation.z=2.9;c.legL.rotation.z=.6;c.legR.rotation.z=-.3;c.shinL.rotation.x=1.2;c.head.rotation.z=-.4;}}
 else{c.armL.rotation.z=-.6-.3*bo;c.armR.rotation.z=.6+.3*bo;c.foreL.rotation.x=-1.6;c.foreR.rotation.x=-1.6;c.armL.rotation.x=-.5;c.armR.rotation.x=-.5;}}
function puppet(x,z,face,anim,o={}){const sk=randomSkin();Object.assign(sk,o.skin||{});const c=buildChar(sk);c.g.position.set(x,o.y??groundY(x,z),z);c.g.rotation.y=face;scene.add(c.g);const p={c,anim,t:Math.random()*5,st:o.st??Math.floor(Math.random()*3),x,z,group:o.group||null,face};PUPPETS.push(p);return p;}
function removePuppets(group){for(let i=PUPPETS.length-1;i>=0;i--){const p=PUPPETS[i];if(p.group!==group)continue;scene.remove(p.c.g);p.c.dispose();PUPPETS.splice(i,1);}}
function puppetsTick(dt){const cx=camera.position.x,cz=camera.position.z;for(const p of PUPPETS){const g=p.c.g;const d=Math.hypot(g.position.x-cx,g.position.z-cz);g.visible=!p.ipHide&&d<(p.far||110);if(!g.visible)continue;p.t+=dt;
 applyAnim(p.c,p.anim,p.t,p.st);}}
function evNearNode(minD,maxD){for(let k=0;k<60;k++){const a={i:Math.floor(Math.random()*(N+1)),j:Math.floor(Math.random()*(N+1))};const p=nd(a.i,a.j);const d=distP(p);if(d>minD&&d<maxD)return a;}return null;}
function sirenAt(pos){tone(780,.22,'sawtooth',.03,pos);setTimeout(()=>tone(1040,.22,'sawtooth',.03,pos),240);}
function evChase(){const a=evNearNode(120,240);if(!a)return null;const c=makeCar(pick(carColors),false,pick(['sport','muscle','sedan','compact']));placeAI(c,a,pick(nbrs(a)),0);c.mode='flee';c.cruise=R(17,22);c.keep=true;cars.push(c);
 const cops=[0,1].map(k=>{const p=makeCar(0,true);p.mode='evcop';p.target=c;const A=nd(c.a.i,c.a.j);p.pos.set(A.x-Math.sin(c.h)*(14+k*10),0,A.z-Math.cos(c.h)*(14+k*10));p.h=c.h;p.g.position.copy(p.pos);p.keep=true;cars.push(p);return p;});
 toast('🚨 Polizeiverfolgung in der Nähe!');return {type:'chase',c,cops,t:0,sir:0,
  tick(e,dt){e.t+=dt;e.sir-=dt;if(e.sir<=0){e.sir=.6;sirenAt(e.cops[0].pos);}EV.chase=1;
   if(e.c.mode==='wreck'&&!e.paid){e.paid=true;if(['player','ram','crash','rocket','boom'].includes(e.c.lastSrc)){P.money+=250;cashSound();big('VERDÄCHTIGER GESTOPPT','+$250 Belohnung','#7fd1ff');}for(const p of e.cops)p.target=null;}
   if(e.t>75||distP(e.c.pos)>420)e.done=true;},
  end(e){for(const q of [e.c,...e.cops])if(cars.includes(q)&&q!==P.inCar){q.keep=false;if(distP(q.pos)>140)removeCar(q);else if(q.mode!=='wreck'){if(q.police){q.mode='parked';}else q.mode='parked';}}}};}
function updateEvCop(c,dt){const t=c.target;if(!t||t.mode==='wreck'||!cars.includes(t)){c.speed*=1-Math.min(1,dt*1.5);moveCarFwd(c,dt);collideCar(c);return;}
 const tx=t.pos.x-c.pos.x,tz=t.pos.z-c.pos.z,d=Math.hypot(tx,tz);const des=Math.atan2(tx,tz);c.h+=clamp(angWrap(des-c.h),-2.4*dt,2.4*dt);
 const ts=d>12?Math.max(t.speed+5,16):Math.max(0,t.speed-2);c.speed+=(ts-c.speed)*Math.min(1,dt*1.6);moveCarFwd(c,dt);
 if(collideCar(c)){c.speed*=.4;c.h+=(Math.random()-.5)*.6;}}
function evRobbery(){const b=pick(blockInfo.filter(q=>distP({x:(q.x0+q.x1)/2,z:(q.z0+q.z1)/2})<150&&distP({x:(q.x0+q.x1)/2,z:(q.z0+q.z1)/2})>40));if(!b)return null;
 const x=b.x0+1.6,z=(b.z0+b.z1)/2;const v=makeCiv(false,false);v.c.g.position.set(x,.3,z);v.state='handsup';v.hT=6;peds.push(v);
 const r=makeCiv(true,false);r.c.g.position.set(x+1.5,.3,z+1);r.state='flee';r.fleeT=40;r.threat=v.c.g.position.clone();r.robber=true;peds.push(r);r.hp=60;
 npcSay(v,'jacked',1);toast('Ein Taschendieb rennt davon – halt ihn auf!');return {type:'rob',v,r,t:0,
  tick(e,dt){e.t+=dt;const r=e.r;if(!e.paid&&(r.state==='ko'||r.hp<=0||!peds.includes(r))){e.paid=true;P.money+=150;cashSound();big('DIEB GESTOPPT','+$150 Finderlohn','#7fd1ff');e.done=true;}
   if(e.t>45||distP(r.c.g.position)>250)e.done=true;},end(e){e.r.robber=false;}};}
function evCrash(){const a=evNearNode(60,180);if(!a)return null;const b=pick(nbrs(a));const A=nd(a.i,a.j),B=nd(b.i,b.j);const x=(A.x*.7+B.x*.3),z=(A.z*.7+B.z*.3);const h=Math.atan2(B.x-A.x,B.z-A.z);
 const c1=parkedCar(x-Math.cos(h)*3.5,z+Math.sin(h)*3.5,h+.5,pick(carColors),pick(['sedan','compact','suv']));const c2=parkedCar(x-Math.cos(h)*3.5+Math.sin(h)*4.8,z+Math.sin(h)*3.5+Math.cos(h)*4.8,h+2.6,pick(carColors),pick(['sedan','van','pickup']));
 for(const c of [c1,c2]){c.hp=c.maxHp*.3;c.keep=true;}const d1=puppet(x+2,z+2,h,'idle',{group:'crash'}),d2=puppet(x+3.2,z+1.2,h+Math.PI,'idle',{group:'crash'});
 const amb=routeCarSpawn('ambulance',0,gridPath(evNearNode(200,300)||{i:0,j:0},a).map(n=>nd(n.i,n.j)),15);amb.keep=true;
 return {type:'crash',cars:[c1,c2,amb],t:0,tick(e,dt){e.t+=dt;if(Math.random()<dt*3)smoke(new THREE.Vector3(c1.pos.x,1.4,c1.pos.z),1,.2,1.6);if(e.t>70||distP({x,z})>330)e.done=true;
   const k=Math.sin(e.t*5);d1.c.armR.rotation.x=-1.2+k*.5;d2.c.armL.rotation.x=-1.3-k*.4;},end(e){removePuppets('crash');for(const q of e.cars)if(cars.includes(q)&&q!==P.inCar){q.keep=false;if(distP(q.pos)>120)removeCar(q);}}};}
function evBreakdance(){const b=pick(blockInfo.filter(q=>(q.type==='downtown'||q.type==='mixed'||q.type==='park')&&distP({x:(q.x0+q.x1)/2,z:(q.z0+q.z1)/2})<160));if(!b)return null;const x=(b.x0+b.x1)/2,z=b.z1-2.2;
 const g='bd'+Math.random();puppet(x,z,Math.PI,'break',{group:g});puppet(x+1.6,z+.4,Math.PI,'dance',{group:g,st:1});
 for(let k=0;k<6;k++){const a=-.3-k*.5;puppet(x+Math.cos(a)*3.4,z+Math.sin(a)*2.2+.5,Math.atan2(x-(x+Math.cos(a)*3.4),z-(z+Math.sin(a)*2.2)),k%2?'clap':'idle',{group:g});}
 return {type:'break',g,t:0,x,z,beat:0,tick(e,dt){e.t+=dt;e.beat-=dt;if(e.beat<=0&&distP(e)<45){e.beat=.476;tone(e.t%1.9<.95?70:110,.12,'sine',.07,new THREE.Vector3(e.x,1,e.z));}if(e.t>110||distP(e)>260)e.done=true;},end(e){removePuppets(e.g);}};}
function evRacers(){const a=evNearNode(150,260);if(!a)return null;const path=[a];let cur=a,prev=null;for(let k=0;k<14;k++){const ns=nbrs(cur).filter(n=>!prev||!(n.i===prev.i&&n.j===prev.j));const n=pick(ns);prev=cur;cur=n;path.push(n);}
 const pts=path.map(n=>nd(n.i,n.j));const rs=[0,1].map(k=>{const c=routeCarSpawn(pick(['sport','super','muscle']),pick(NICE_COLORS),pts,R(26,31),k?5.6:2);c.keep=true;c.racer=true;return c;});toast('🏁 Illegales Straßenrennen in der Nähe!');
 return {type:'racers',rs,t:0,tick(e,dt){e.t+=dt;if(Math.random()<dt*.8)hornAt(e.rs[0].pos);if(e.t>60||e.rs.every(c=>c.route.done))e.done=true;},end(e){for(const q of e.rs)if(cars.includes(q)&&q!==P.inCar){q.keep=false;removeCar(q);}}};}
function evTick(dt){EV.chase=0;for(let i=EV.list.length-1;i>=0;i--){const e=EV.list[i];try{e.tick(e,dt);}catch(err){e.done=true;}if(e.done){try{e.end(e);}catch(err){}EV.list.splice(i,1);}}
 if(mode!=='play'||mission||activity||race||wanted>0)return;const inCity=Math.abs(P.pos.x)<HALF+40&&Math.abs(P.pos.z)<HALF+40;if(!inCity)return;
 EV.t-=dt;if(EV.t>0||EV.list.length>=2)return;EV.t=R(30,60);const f=pick([evChase,evChase,evRobbery,evCrash,evBreakdance,evRacers]);const e=f();if(e)EV.list.push(e);}
