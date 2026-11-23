'use strict';
// ---------- Körper bauen ----------
// Regionen: 0 Haut,1 Oberteil,2 Hose,3 Schuh,4 Haar,5 Augenweiß,6 Iris,7 Lippen,8 Sohle,9 Dunkel(Brille),10 Gold,11 Gürtel,12 Hell(Streifen),13 Mund
function buildBodyGeo(s){const B=GB();
 const st=SK.statur[s.statur]||'Normal',fem=s.koerper===1;const P0=STATUR_P[st]||STATUR_P.Normal;
 const W=P0.w,belly=P0.belly,shW=(fem?.9:1)*P0.sh,hipW=(fem?1.12:1)*W,bust=fem?.035:0;
 const top0=SK.oberteil[s.oberteil]||'T-Shirt',shortHemd=top0==='Hawaiihemd'||top0==='Poloshirt',top=shortHemd?'Hemd':top0,pants=SK.hose[s.hose]||'Jeans',hair=SK.frisur[s.frisur]||'Kurz',ex=SK.extra[s.extra]||'Nichts';
 const longSleeve=top==='Hoodie'||top==='Jacke'||(top==='Hemd'&&!shortHemd)||top==='Sakko',noSleeve=top==='Tanktop';
 const wTorso=(y,x)=>{const ax=Math.abs(x);let w;
  if(y<.98)w=[[BI.hips,1]];else if(y<1.12){const t=smooth(.98,1.12,y);w=[[BI.hips,1-t],[BI.spine,t]];}else if(y<1.27){const t=smooth(1.12,1.27,y);w=[[BI.spine,1-t],[BI.chest,t]];}else if(y<1.47)w=[[BI.chest,1]];else{const t=smooth(1.47,1.54,y);w=[[BI.chest,1-t],[BI.neck,t]];}
  if(y>1.3&&ax>.13){const t=smooth(.13,.2*shW,ax)*smooth(1.3,1.42,y)*.45;const arm=x<0?BI.armL:BI.armR;w=w.map(q=>[q[0],q[1]*(1-t)]);w.push([arm,t]);}
  if(y<1.0&&ax>.04){const t=smooth(1.0,.88,y)*.5;const leg=x<0?BI.legL:BI.legR;w=w.map(q=>[q[0],q[1]*(1-t)]);w.push([leg,t]);}
  return w;};
 const regTorso=(y)=>{if(y<1.0)return 2;if(pants==='Rock'&&y<1.02)return 2;if(top==='Tanktop'&&y>1.37)return 0;return 1;};
 const rings=[];const ys=[.86,.92,.98,1.04,1.1,1.16,1.22,1.28,1.34,1.39,1.43,1.47,1.51];
 for(const y of ys){let rx,rzF,rzB;
  if(y<=.92){rx=.135*hipW;rzF=.095*W;rzB=.11*W*(fem?1.12:1);}
  else if(y<=1.0){rx=.172*hipW;rzF=.105*W+belly*.3;rzB=.125*W*(fem?1.1:1);}
  else if(y<=1.06){rx=(.162*hipW+.158*W)/2;rzF=.103*W+belly*.8;rzB=.112*W;}
  else if(y<=1.12){rx=.148*W*(fem?.9:1);rzF=.098*W+belly*1.05;rzB=.1*W;}
  else if(y<=1.18){rx=.152*W;rzF=.1*W+belly*.9;rzB=.1*W;}
  else if(y<=1.24){rx=.163*W*(fem?.95:1)+.008*shW;rzF=.105*W+belly*.55+bust*.55;rzB=.102*W;}
  else if(y<=1.3){rx=.172*W*.5+.172*shW*.5;rzF=.112*W+belly*.25+bust;rzB=.106*W;}
  else if(y<=1.36){rx=.182*shW;rzF=.112*W+bust*.7;rzB=.108*W;}
  else if(y<=1.4){rx=.192*shW;rzF=.1*W+bust*.2;rzB=.104*W;}
  else if(y<=1.44){rx=.19*shW;rzF=.088*W;rzB=.095*W;}
  else if(y<=1.48){rx=.15*shW;rzF=.072;rzB=.08;}
  else{rx=.075;rzF=.058;rzB=.062;}
  rings.push({y,rx,rzF,rzB});}
 rings[0].capH=.02;rings[rings.length-1].capH=.01;
 gbRings(B,rings,24,regTorso,wTorso,true,true);
 // Hals & Kopf
 gbLimb(B,0,.005,1.49,1.62,.054,.05,14,()=>0,(y)=>y<1.52?[[BI.chest,.5],[BI.neck,.5]]:y>1.6?[[BI.neck,.5],[BI.head,.5]]:[[BI.neck,1]]);
 const hy=1.695,hrx=.093,hry=.118,hrz=.106;
 gbEllip(B,0,hy,.008,hrx,hry,hrz,0,[[BI.head,1]],24,18,(x,y,z)=>{let k=1;if(y<-.1){const t=smooth(-.1,-.95,y);k=1-t*(fem?.32:.26);}if(y>.2)k*=1-.05*(y-.2);let zz=z;if(z<0)zz*=1.06;return [x*k,y,zz*(y<-.4?1+.08*(-.4-y):1)+(y<-.6?.05:0)];});
 for(const sx of [-1,1]){gbEllip(B,sx*.036,hy+.012,.086,.019,.013,.012,5,[[BI.head,1]],8,5);gbEllip(B,sx*.036,hy+.012,.097,.0095,.0095,.004,6,[[BI.head,1]],8,4);
  gbEllip(B,sx*.038,hy+.04,.094,.023,.0055,.008,4,[[BI.head,1]],6,3,(x,y,z)=>[x,y+(x*sx)*.18,z]);
  gbEllip(B,sx*.094,hy-.002,0,.012,.029,.02,0,[[BI.head,1]],7,5);}
 gbEllip(B,0,hy-.022,.103,.015,.03,.02,0,[[BI.head,1]],8,6,(x,y,z)=>[x*(1-.3*y),y,z+(y<0?.25*(-y):0)]);
 gbEllip(B,0,hy-.0615,.094,.0275,.0062,.0105,7,[[BI.head,1]],12,5,(x,y,z)=>[x,y+.35*(x*x)*-6,z]);gbEllip(B,0,hy-.0715,.0925,.026,.0072,.0112,7,[[BI.head,1]],12,5);gbEllip(B,0,hy-.0668,.0995,.022,.0016,.004,13,[[BI.head,1]],10,3);
 for(const sx of [-1,1]){gbEllip(B,sx*.036,hy+.0262,.0905,.0215,.0052,.0122,0,[[BI.head,1]],10,4,(x,y,z)=>[x,y,z+(y<0?.2*y:0)]);gbEllip(B,sx*.035,hy-.0008,.0895,.019,.0034,.0102,0,[[BI.head,1]],10,3);
  gbEllip(B,sx*.054,hy-.016,.074,.03,.022,.026,0,[[BI.head,1]],10,6);gbEllip(B,sx*.0085,hy-.0455,.1145,.0052,.0036,.004,13,[[BI.head,1]],6,3);gbEllip(B,sx*.0125,hy-.039,.108,.0085,.0085,.0095,0,[[BI.head,1]],8,4);}
 gbEllip(B,0,hy-.094,.07,.032,.026,.028,0,[[BI.head,1]],12,6);if(!fem)gbEllip(B,0,1.565,.045,.014,.016,.012,0,[[BI.neck,1]],8,5);
 if(ex==='Bart'&&!fem)gbEllip(B,0,hy-.07,.05,.08,.06,.07,4,[[BI.head,1]],12,7,(x,y,z)=>[x,Math.min(y,.1),z<0?z*.2:z]);
 const hW=[[BI.head,1]];
 const cap=(sc=1.07,cut=-.12)=>gbEllip(B,0,hy+.012,-.006,hrx*sc,hry*sc*.98,hrz*sc,4,hW,16,8,(x,y,z)=>{const yy=Math.max(y,cut+(z>0?.55*z:0));return [x,yy,z];});
 if(hair==='Kurz')cap(1.06,-.2);
 else if(hair==='Seitenscheitel'){cap(1.07,-.18);gbEllip(B,.03,hy+.1,.04,.07,.035,.07,4,hW,10,5);}
 else if(hair==='Lang'){cap(1.08,-.25);gbEllip(B,0,hy-.1,-.05,.1,.17,.07,4,hW,12,8);for(const sx of [-1,1])gbEllip(B,sx*.085,hy-.06,.01,.025,.13,.05,4,hW,8,6);}
 else if(hair==='Irokese')gbEllip(B,0,hy+.105,-.01,.022,.07,.12,4,hW,8,6);
 else if(hair==='Afro')gbEllip(B,0,hy+.05,-.015,.16,.15,.16,4,hW,14,9,(x,y,z)=>{const n=1+.06*Math.sin(x*13+y*7)*Math.sin(z*11);return [x*n,Math.max(y,-.45+(z>0?.6*z:0))*n,z*n];});
 else if(hair==='Zopf'){cap(1.07,-.2);gbLimb(B,0,-.15,hy-.02,hy-.3,.035,.022,8,()=>4,()=>hW);gbEllip(B,0,hy+.02,-.12,.045,.045,.04,4,hW,8,5);}
 else if(hair==='Locken'){cap(1.1,-.3);for(let k=0;k<14;k++){const a=k/14*Math.PI*2;gbEllip(B,Math.sin(a)*.09,hy+.03+Math.cos(a*3)*.03,Math.cos(a)*.085-.01,.035,.035,.035,4,hW,6,4);}}
 else if(hair==='Dutt'){cap(1.06,-.15);gbEllip(B,0,hy+.1,-.07,.05,.05,.05,4,hW,10,6);}
 if(ex==='Cap'){gbEllip(B,0,hy+.035,-.004,hrx*1.12,hry*.8,hrz*1.12,1,hW,16,7,(x,y,z)=>[x,Math.max(y,-.05),z]);gbEllip(B,0,hy+.035,.1,.075,.008,.08,1,hW,12,3);}
 if(ex==='Mütze')gbEllip(B,0,hy+.045,-.006,hrx*1.13,hry*.95,hrz*1.13,1,hW,16,8,(x,y,z)=>[x,Math.max(y,-.1),z]);
 if(ex==='Sonnenbrille'){for(const sx of [-1,1])gbEllip(B,sx*.037,hy+.012,.1,.03,.019,.008,9,hW,10,5);gbEllip(B,0,hy+.02,.104,.075,.004,.004,9,hW,6,3);}
 if(ex==='Brille'){for(const sx of [-1,1]){const base=B.n;for(let k=0;k<12;k++){const a=k/12*Math.PI*2;gbVert(B,sx*.037+Math.cos(a)*.024,hy+.012+Math.sin(a)*.017,.1,9,hW);gbVert(B,sx*.037+Math.cos(a)*.03,hy+.012+Math.sin(a)*.022,.1,9,hW);}for(let k=0;k<12;k++){const a=base+k*2,b=base+((k+1)%12)*2;B.idx.push(a,a+1,b,b,a+1,b+1,a,b,a+1,b,b+1,a+1);}}}
 if(ex==='Kopfhörer'){for(const sx of [-1,1])gbEllip(B,sx*.103,hy,0,.022,.04,.04,9,hW,8,5);gbEllip(B,0,hy+.125,0,.1,.02,.016,9,hW,10,3,(x,y,z)=>[x,y-x*x*1.4,z]);}
 if(ex==='Kette'){const base=B.n;for(let k=0;k<20;k++){const a=k/20*Math.PI*2;const x=Math.sin(a)*.085*shW,z=Math.cos(a)*.075+.012,y=1.5-Math.max(0,Math.cos(a))*.07;gbVert(B,x,y,z,10,[[BI.chest,1]]);gbVert(B,x,y-.008,z+.004,10,[[BI.chest,1]]);}for(let k=0;k<20;k++){const a=base+k*2,b=base+((k+1)%20)*2;B.idx.push(a,b,a+1,b,b+1,a+1,a,a+1,b,b,a+1,b+1);}}
 if(top==='Hoodie'){gbEllip(B,0,1.5,-.075,.12,.06,.07,1,[[BI.chest,.6],[BI.neck,.4]],12,6);gbEllip(B,0,1.12,.1*W+belly,.11*W,.05,.025,12,[[BI.spine,1]],10,4,(x,y,z)=>[x,y,z<0?0:z]);}
 if(top==='Jacke'||top==='Sakko'){gbEllip(B,0,1.2,.105*W+belly*.6+bust*.4,.008,.26,.012,top==='Sakko'?12:9,(px,py)=>py>1.27?[[BI.chest,1]]:[[BI.spine,1]],6,10);
  for(const sx of [-1,1])gbEllip(B,sx*.06,1.4,.1,.045,.07,.02,1,[[BI.chest,1]],8,5,(x,y,z)=>[x,y,z+.3*(1-y)]);}
 if(top==='Sakko')gbEllip(B,0,1.32,.118*W+bust,.026,.13,.012,13,[[BI.chest,1]],8,8,(x,y,z)=>[x*(1-.3*(1-y)),y,z]);
 if(top0==='Hawaiihemd'){for(let k=0;k<16;k++){const a=k*2.399,yy=1.02+((k*37)%44)/100,front=k%2===0;gbEllip(B,Math.sin(a)*.085*W,yy,front?(.104*W+belly*.5+bust*.6):-(.098*W),.024,.024,.012,12,[[BI.chest,yy>1.2?1:.5],[BI.spine,yy>1.2?0:.5]],6,4);}}
 if(top==='Hemd'){for(const sx of [-1,1])gbEllip(B,sx*.035,1.5,.055,.04,.03,.02,12,[[BI.chest,.6],[BI.neck,.4]],8,5);for(let k=0;k<4;k++)gbEllip(B,0,1.42-k*.085,.112*W+belly*(k>1?.8:.2)+bust*(k<2?.7:.2),.007,.007,.004,12,[[k<2?BI.chest:BI.spine,1]],6,3);}
 if(pants==='Jeans'||pants==='Stoffhose')gbRings(B,[{y:.985,rx:.176*hipW,rzF:.107*W+belly*.35,rzB:.127*W*(fem?1.1:1)},{y:1.02,rx:.168*hipW,rzF:.106*W+belly*.6,rzB:.118*W}],18,()=>11,()=>[[BI.hips,1]],false,false);
 if(pants==='Rock'){const r=[];for(let k=0;k<6;k++){const t=k/5,y=1.0-t*.42;r.push({y,rx:(.175+t*.11)*hipW,rzF:(.12+t*.1)*W,rzB:(.13+t*.1)*W});}gbRings(B,r,18,()=>2,(y,x)=>{const t=smooth(.98,.62,y)*.6;const leg=x<0?BI.legL:BI.legR;return [[BI.hips,1-t],[leg,t]];},false,false);}
 // Arme
 const aW=P0.arm*(fem?.88:1);
 for(const sd of [-1,1]){const ax=sd*.205*shW,arm=sd<0?BI.armL:BI.armR,fore=sd<0?BI.foreL:BI.foreR,hand=sd<0?BI.handL:BI.handR;
  gbLimb(B,ax,0,1.47,1.19,.066*aW,.052*aW,10,(y)=>noSleeve?0:(longSleeve||y>1.3)?1:0,(y)=>y>1.43?[[arm,.65],[BI.chest,.35]]:y<1.22?[[arm,.6],[fore,.4]]:[[arm,1]]);
  gbLimb(B,ax,0,1.2,.955,.05*aW,.039*aW,10,(y)=>longSleeve&&y>.975?1:0,(y)=>y>1.17?[[fore,.6],[arm,.4]]:y<.975?[[fore,.6],[hand,.4]]:[[fore,1]]);
  gbEllip(B,ax,.905,.008,.024*aW,.043,.04*aW,0,(px,py,pz)=>py>.94?[[hand,.6],[fore,.4]]:[[hand,1]],12,8,(x,y,z)=>[x*(y<-.3?.86:1),y,z*(1-.18*Math.max(0,-y))]);
  for(const [fz,fl,fr] of [[.026,.072,.0085],[.009,.08,.009],[-.008,.075,.0086],[-.024,.06,.0078]]){const fx=ax+sd*.002;gbLimb(B,fx,fz+.006,.872,.872-fl*aW,fr*aW,fr*.82*aW,8,()=>0,()=>[[hand,1]],1.05);gbEllip(B,fx-sd*.0055,.872-fl*aW*.84,fz+.006,.0045,.0065,.0055,5,[[hand,1]],5,3);}
  gbLimb(B,ax-sd*.022,.036,.915,.858,.0105*aW,.0085*aW,8,()=>0,()=>[[hand,1]],1.0);
  if(longSleeve)gbRings(B,[{y:.99,x:ax,rx:.047*aW,rzF:.047*aW,rzB:.047*aW},{y:.965,x:ax,rx:.046*aW,rzF:.046*aW,rzB:.046*aW}],12,()=>1,()=>[[fore,.7],[hand,.3]],false,false);}
 // Beine
 const lW=P0.leg*(fem?1.04:1);
 for(const sd of [-1,1]){const lx=sd*.094*hipW,leg=sd<0?BI.legL:BI.legR,shin=sd<0?BI.shinL:BI.shinR,foot=sd<0?BI.footL:BI.footR;
  const regLeg=(y)=>pants==='Shorts'?(y>.66?2:0):pants==='Rock'?0:2;
  gbLimb(B,lx,0,.96,.5,.098*lW,.062*lW,12,regLeg,(y)=>y>.9?[[leg,.6],[BI.hips,.4]]:y<.54?[[leg,.55],[shin,.45]]:[[leg,1]],1.0);
  gbLimb(B,lx,-.005,.52,.1,.061*lW,.043*lW,12,(y)=>pants==='Shorts'||pants==='Rock'?0:(pants==='Jogger'&&y<.16)?11:2,(y)=>y>.48?[[shin,.55],[leg,.45]]:y<.14?[[shin,.6],[foot,.4]]:[[shin,1]],1.05);
  gbEllip(B,lx,.065,.045,.055,.06,.135,3,[[foot,1]],12,7,(x,y,z)=>[x*(z>.3?.92:1),Math.max(y,-.72),z+(z>0&&y>.2?-.15*y:0)]);
  gbEllip(B,lx,.012,.045,.058,.016,.138,8,[[foot,1]],14,4);gbEllip(B,lx,.04,.14,.05,.03,.045,8,[[foot,1]],10,4,(x,y,z)=>[x,Math.max(y,-.2),z]);
  for(let k=0;k<4;k++)gbEllip(B,lx,.1-k*.012,.115-k*.018,.028,.0035,.006,8,[[foot,1]],6,3);
  if(pants==='Jeans'||pants==='Stoffhose')gbEllip(B,lx*.8,.935,-.128*W*(fem?1.08:1),.048,.055,.008,2,[[BI.hips,.7],[leg,.3]],8,5);}
 if(pants!=='Rock')gbEllip(B,0,1.0,.112*W+belly*.45,.022,.016,.007,10,[[BI.hips,1]],8,4);
 if(top==='Hoodie')for(const sx of [-1,1])gbLimb(B,sx*.03,.098+bust,1.44,1.3,.004,.004,6,()=>12,()=>[[BI.chest,1]],1);
 if(top==='T-Shirt'||top==='Tanktop')gbRings(B,[{y:1.505,z:.005,rx:.068,rzF:.064,rzB:.066},{y:1.49,z:.005,rx:.074,rzF:.07,rzB:.072}],14,()=>1,()=>[[BI.chest,.6],[BI.neck,.4]],false,false);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(B.p,3));g.setAttribute('region',new THREE.Float32BufferAttribute(B.r,1));
 g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(B.si,4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(B.sw,4));g.setIndex(B.idx);g.computeVertexNormals();g.computeBoundingSphere();g.boundingSphere.radius=1.4;return g;}
function bodyKey(s){return [s.statur,s.koerper|0,s.frisur,s.oberteil,s.hose,s.extra].join('|');}
function getBodyGeo(s){const k=bodyKey(s);let e=BODY_GEO.get(k);if(!e){e={geo:buildBodyGeo(s),refs:0};BODY_GEO.set(k,e);}e.refs++;return e;}
function releaseBodyGeo(k){const e=BODY_GEO.get(k);if(!e)return;if(--e.refs<=0){e.geo.dispose();BODY_GEO.delete(k);}}
function charMaterial(pal,rough){const m=new THREE.MeshStandardMaterial({roughness:.8,metalness:0});m.userData.pal=pal;
 m.onBeforeCompile=sh=>{sh.uniforms.uPal={value:pal};sh.uniforms.uRough={value:rough};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float region;uniform vec3 uPal['+CHAR_PAL_N+'];uniform float uRough['+CHAR_PAL_N+'];varying vec3 vPalCol;varying float vPalRough;varying vec3 vObjP;varying float vReg;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\nint ri=int(region+.5);vPalCol=uPal[ri];vPalRough=uRough[ri];vObjP=position;vReg=region;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vPalCol;varying float vPalRough;varying vec3 vObjP;varying float vReg;\nfloat chash(vec3 p){p=fract(p*.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}\nfloat cnoise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.0-2.0*f);return mix(mix(mix(chash(i),chash(i+vec3(1,0,0)),f.x),mix(chash(i+vec3(0,1,0)),chash(i+vec3(1,1,0)),f.x),f.y),mix(mix(chash(i+vec3(0,0,1)),chash(i+vec3(1,0,1)),f.x),mix(chash(i+vec3(0,1,1)),chash(i+vec3(1,1,1)),f.x),f.y),f.z);}')
   .replace('#include <color_fragment>','#include <color_fragment>\n{vec3 pc=vPalCol;float r=vReg;\n if(r>0.5&&r<3.5||r>10.5&&r<11.5){float n=cnoise(vObjP*vec3(90.0,140.0,90.0))*.6+cnoise(vObjP*vec3(14.0,40.0,14.0))*.4;float fold=sin(vObjP.y*55.0+cnoise(vObjP*9.0)*6.0)*.5+.5;pc*=.84+.22*n-.08*fold*fold;}\n else if(r<0.5){float n=cnoise(vObjP*180.0);pc*=.95+.08*n;}\n else if(r>3.5&&r<4.5){float st=sin(vObjP.y*260.0+vObjP.z*40.0+cnoise(vObjP*60.0)*5.0)*.5+.5;pc*=.75+.4*st;}\n diffuseColor.rgb*=pc;}')
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=vPalRough;')
   .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n{float r=vReg;float hgt=0.0;if(r>0.5&&r<3.5||r>10.5&&r<11.5){hgt=cnoise(vObjP*vec3(16.0,48.0,16.0))*.003+cnoise(vObjP*110.0)*.0005+sin(vObjP.y*55.0+cnoise(vObjP*9.0)*6.0)*.0011;if(r>1.5&&r<2.5)hgt+=sin((vObjP.x+vObjP.y)*300.0)*.00022;}else if(r>3.5&&r<4.5)hgt=sin(vObjP.y*260.0+vObjP.z*40.0+cnoise(vObjP*60.0)*5.0)*.0008;else if(r<0.5)hgt=cnoise(vObjP*300.0)*.00018;\n vec3 sp=-vViewPosition;vec3 dpx=dFdx(sp),dpy=dFdy(sp);vec3 R1=cross(dpy,normal),R2=cross(normal,dpx);float det=dot(dpx,R1);float dhx=dFdx(hgt),dhy=dFdy(hgt);vec3 grad=sign(det)*(dhx*R1+dhy*R2);vec3 nn=abs(det)*normal-grad;if(dot(nn,nn)>1e-12)normal=normalize(nn);}');};
 m.customProgramCacheKey=()=>'char-v3';return m;}
function charPalette(s){const skin=new THREE.Color(SK.haut[s.haut]??SK.haut[1]),hair=new THREE.Color(SK.haarfarbe[s.haarfarbe]??0x222222),top=new THREE.Color(s.topC??SK.oberteilfarbe[s.oberteilfarbe]??0xffffff),pants=new THREE.Color(s.pantsC??SK.hosenfarbe[s.hosenfarbe]??0x223344),shoe=new THREE.Color(SK.schuhe[s.schuhe]??0x111111);
 const lips=skin.clone().lerp(new THREE.Color(0x9a3a3a),.42),belt=new THREE.Color(0x2b1d12),stripe=top.clone().lerp(new THREE.Color(0xffffff),.75);
 return [skin,top,pants,shoe,hair,new THREE.Color(0xf4f1ea),new THREE.Color(0x2a1c10),lips,new THREE.Color(0xeeeeee),new THREE.Color(0x0c0c0c),new THREE.Color(0xd4af37),belt,stripe,new THREE.Color(0x401a1a)];}
function buildChar(s){
 const st=SK.statur[s.statur]||'Normal',fem=s.koerper===1,P0=STATUR_P[st]||STATUR_P.Normal;const shW=(fem?.9:1)*P0.sh,hipW=(fem?1.12:1)*P0.w;
 const bones={};const mk=(n,x,y,z,parent)=>{const b=new THREE.Bone();b.name=n;b.position.set(x,y,z);if(parent)bones[parent].add(b);bones[n]=b;return b;};
 mk('hips',0,.95,0);mk('spine',0,.13,0,'hips');mk('chest',0,.19,0,'spine');mk('neck',0,.22,0,'chest');mk('head',0,.1,0,'neck');
 for(const [sd,L] of [[-1,'L'],[1,'R']]){mk('arm'+L,sd*.205*shW,.19,0,'chest');mk('fore'+L,0,-.275,0,'arm'+L);mk('hand'+L,0,-.25,0,'fore'+L);
  mk('leg'+L,sd*.094*hipW,.01,0,'hips');mk('shin'+L,0,-.45,0,'leg'+L);mk('foot'+L,0,-.415,0,'shin'+L);}
 const skel=new THREE.Skeleton(BONES.map(n=>bones[n]));
 const ge=getBodyGeo(s),key=bodyKey(s);const mat=charMaterial(charPalette(s),CHAR_ROUGH);
 const mesh=new THREE.SkinnedMesh(ge.geo,mat);mesh.add(bones.hips);mesh.updateMatrixWorld(true);mesh.bind(skel);mesh.castShadow=true;mesh.receiveShadow=true;
 const g=new THREE.Group();g.add(mesh);
 const handR=new THREE.Group();handR.position.set(0,-.075,.02);bones.handR.add(handR);
 const c={g,mesh,skel,sk:s,...bones,handR,_elL:-.12,_elR:-.12,_psw:0,_amp:.6,_dir:1,_idle:Math.random()*100,
  dispose(){CHARS.delete(c);mat.dispose();releaseBodyGeo(key);}};
 // Ruhelage der Knochen (für die exakten Treffer-Kapseln)
 const rest={};for(const n of BONES){const b=bones[n],pn=BONE_PARENT[n],pp=pn?rest[pn]:{x:0,y:0,z:0};rest[n]={x:pp.x+(+b.position.x||0),y:pp.y+(+b.position.y||0),z:pp.z+(+b.position.z||0)};}c.rest=rest;c.bkey=key;
 c.armL.rotation.z=-.07;c.armR.rotation.z=.07;g.scale.setScalar(.97);CHARS.add(c);return c;}
// ---------- Animation ----------
function poseReset(c){c.hips.position.set(0,.95,0);c.hips.rotation.set(0,0,0);c.spine.rotation.set(0,0,0);c.chest.rotation.set(0,0,0);c.neck.rotation.set(0,0,0);c.head.rotation.set(0,0,0);
 c.foreL.rotation.set(0,0,0);c.foreR.rotation.set(0,0,0);c.handL.rotation.set(0,0,0);c.handR.rotation.set(0,0,0);c.shinL.rotation.set(0,0,0);c.shinR.rotation.set(0,0,0);c.footL.rotation.set(0,0,0);c.footR.rotation.set(0,0,0);
 c.legL.rotation.y=c.legR.rotation.y=c.legL.rotation.z=c.legR.rotation.z=0;c.armL.rotation.y=c.armR.rotation.y=0;}
// Gehen/Rennen: Phase ph, Amplitude A (0.55 gehen … 0.9 rennen)
function animWalk(c,ph,A){poseReset(c);const s=Math.sin(ph),co=Math.cos(ph),run=clamp((A-.55)/.35,0,1);
 c.legL.rotation.x=A*s;c.legR.rotation.x=-A*s;
 const kL=A*(1.25+run*.6)*Math.max(0,-co)+.07+run*.15*Math.max(0,s),kR=A*(1.25+run*.6)*Math.max(0,co)+.07+run*.15*Math.max(0,-s);
 c.shinL.rotation.x=kL;c.shinR.rotation.x=kR;c.footL.rotation.x=-kL*.35+Math.max(0,A*s)*.25;c.footR.rotation.x=-kR*.35+Math.max(0,-A*s)*.25;
 c.hips.position.y=.95-.025*A-(.022+.03*run)*Math.abs(co)*A;c.hips.position.x=.028*A*s*(1-run*.5);
 c.hips.rotation.y=-.17*A*s;c.hips.rotation.z=.05*A*co;c.spine.rotation.x=.04+.16*run;c.chest.rotation.y=.28*A*s;c.chest.rotation.x=.03*Math.abs(co)*A;c.chest.rotation.z=-.03*A*co;
 c.neck.rotation.y=-.18*A*s;c.head.rotation.y=-.1*A*s;c.head.rotation.x=-.04-.1*run+.03*Math.abs(co);
 c.armL.rotation.x=-A*.85*s;c.armR.rotation.x=A*.85*s;c.armL.rotation.z=-.08-.04*run;c.armR.rotation.z=.08+.04*run;
 c._elL=-(.22+run*1.05+.25*A*Math.max(0,-s));c._elR=-(.22+run*1.05+.25*A*Math.max(0,s));
 c.handL.rotation.x=c.handR.rotation.x=-.1;}
// Stehen: atmen, Gewicht verlagern, umschauen
function animIdle(c){poseReset(c);const t=time+c._idle;const br=Math.sin(t*1.7);
 c.legL.rotation.x=c.legR.rotation.x=0;c.armL.rotation.x=c.armR.rotation.x=.02*br;c.armL.rotation.z=-.09-.01*br;c.armR.rotation.z=.09+.01*br;
 const sh=Math.sin(t*.37);c.hips.position.x=.018*sh;c.hips.rotation.z=-.03*sh;c.spine.rotation.z=.025*sh;c.legL.rotation.z=.03*sh;c.legR.rotation.z=.03*sh;c.shinL.rotation.x=sh>0?.04:.1*-sh;c.shinR.rotation.x=sh<0?.04:.1*sh;
 c.chest.rotation.x=-.015*br;c.hips.position.y=.95-.004*br;
 const look=Math.sin(t*.23)*Math.sin(t*.61);c.neck.rotation.y=look*.35;c.head.rotation.y=look*.2;c.head.rotation.x=.05*Math.sin(t*.4);
 c._elL=c._elR=-.14-.02*br;}
// alte Schnittstelle: Schwungwert -> Phase schätzen
function animChar(c,sw){if(!c||!c.hips)return;
 if(Math.abs(sw)<.015){c._amp=Math.max(.5,c._amp*.98);animIdle(c);c._psw=sw;return;}
 const A=Math.max(c._amp*.985,Math.abs(sw),.45);c._amp=A;const d=sw-c._psw;if(Math.abs(d)>1e-4)c._dir=d>0?1:-1;c._psw=sw;
 const a=Math.asin(clamp(sw/A,-1,1));const ph=c._dir>0?a:Math.PI-a;animWalk(c,ph,clamp(A,.45,.95));}
// Nach der Spiellogik: Ellbogen/Knie passend zur Arm-/Beinhaltung
function charPost(c){if(!c.foreL)return;
 for(const L of ['L','R']){const arm=c['arm'+L],fore=c['fore'+L],ax=arm.rotation.x,el=L==='L'?c._elL:c._elR;
  let e=el;if(ax<-.75){const t=smooth(-.75,-1.35,ax);e=el*(1-t);if(ax<-2.2)e=-.35;}fore.rotation.x=e;}
 for(const L of ['L','R']){const leg=c['leg'+L],shin=c['shin'+L],foot=c['foot'+L],lx=leg.rotation.x;if(lx<-.8){shin.rotation.x=Math.max(shin.rotation.x,clamp(-lx*.95,0,1.7));foot.rotation.x=-.15;}}}
function charsPostTick(){for(const c of CHARS){if(!c.g.visible||!c.g.parent)continue;charPost(c);}}
function carProfile(d,z){const L2=d.L/2,c0=d.cab[0],c1=d.cab[1];
 // Gürtellinie / Motorhaube / Heck
 let belt;if(z>c1)belt=d.hood+(d.belt-d.hood)*sm1(L2,c1,z);else if(z<c0)belt=d.trunk+(d.belt-d.trunk)*sm1(-L2,c0,z);else belt=d.belt;
 const nf=sm1(L2-d.nose,L2,z),nr=sm1(-L2+d.tail,-L2,z);belt-=nf*nf*.16*(d.box?.4:1)+nr*nr*.12;
 // Dach mit Scheiben-Rampen
 let roof=belt+.06;if(z>=c0-.001&&z<=c1+.001){let r=d.roof;const ramp=(t)=>{t=clamp(t,0,1);return Math.pow(t,1.35)*(1-.12*Math.sin(t*Math.PI));};if(z>c1-d.ws)r=d.roof+(belt-d.roof)*ramp((z-(c1-d.ws))/d.ws);if(z<c0+d.rw)r=Math.min(r,d.roof+(belt-d.roof)*ramp(((c0+d.rw)-z)/Math.max(.01,d.rw)));roof=Math.max(roof,r);}
 if(d.box&&z<c0+.02)roof=Math.max(roof,d.trunk);
 // Breite (Grundriss gerundet)
 let w=d.W/2;const tf=sm1(L2-d.nose*1.1,L2+.02,z),tr=sm1(-L2+d.tail*1.1,-L2-.02,z);w*=1-.16*tf*tf-.1*tr*tr;
 let yb=d.yb+sm1(L2-.5,L2,z)*.1+sm1(-L2+.45,-L2,z)*.12;
 return {belt,roof,w,yb};}
function buildCarGeo(type){const d=CARDEF[type];const L2=d.L/2;const NS=Math.round(d.L*14)+8;const NP=11;
 const pos=[],paintI=[],glassI=[],trimI=[];
 const archR=d.wr+.07;
 for(let s=0;s<=NS;s++){const z=-L2+s/NS*d.L;const P=carProfile(d,z);const h=P.roof-P.belt,k=sm1(.08,.26,h);const w=P.w,yb=P.yb;
  let arch=0;for(const wz of d.wz){const dz=Math.abs(z-wz);if(dz<archR)arch=Math.max(arch,d.wr+Math.sqrt(archR*archR-dz*dz));}
  const sideBot=Math.max(yb+.2,arch);
  const gw=w*(d.box||d.bus?.97:.88),gtw=w*(d.box||d.bus?.95:.74);
  const pts=[[0,yb],[w*(arch?.6:.86),yb],[w*(arch?.6:.98),arch?arch-.02:yb+.07],[w,sideBot],[w*1.0,(sideBot+P.belt)/2+.02],[w*.985,P.belt-.06],[w*.95,P.belt],
   [w*.84*(1-k)+gw*k,P.belt+.03],[w*.6*(1-k)+gtw*k,(P.belt+.05)*(1-k)+(P.roof-.07)*k],[w*.3*(1-k)+gtw*.86*k,(P.belt+.06)*(1-k)+(P.roof-.01)*k],[0,(P.belt+.065)*(1-k)+(P.roof+.02)*k]];
  for(const sd of [1,-1])for(const p of pts)pos.push(p[0]*sd,p[1],z);}
 const vi=(s,sd,p)=>s*NP*2+(sd>0?0:NP)+p;
 const inRamp=z=>(z>d.cab[1]-d.ws-.02&&z<d.cab[1]+.02)||(z<d.cab[0]+d.rw+.02&&z>d.cab[0]-.02&&d.rw>.1);
 const side=d.side||[d.cab[0]+(d.rw>.3?d.rw*.85:.06),d.cab[1]-d.ws*.86];
 const pillar=z=>{if(d.bus)return ((z-side[0])%1.4+1.4)%1.4<.12;const mid=(side[0]+side[1])/2;return Math.abs(z-mid)<.07||z<side[0]+.02||z>side[1]-.02;};
 for(let s=0;s<NS;s++){const z=-L2+(s+.5)/NS*d.L;const P=carProfile(d,z),h=P.roof-P.belt,cab=h>.22;
  for(const sd of [1,-1])for(let p=0;p<NP-1;p++){const a=vi(s,sd,p),b=vi(s,sd,p+1),c=vi(s+1,sd,p),e=vi(s+1,sd,p+1);const tri=sd>0?[a,b,c,b,e,c]:[a,c,b,b,c,e];
   let L=paintI;if(p<=1)L=trimI;else if(p===2)L=trimI;else if(p===7&&cab&&z>side[0]&&z<side[1]&&!pillar(z))L=glassI;else if(p===9&&cab&&inRamp(z))L=glassI;else if(p===8&&cab&&inRamp(z)&&d.bus)L=glassI;
   L.push(...tri);}}
 // Front- und Heckabschluss
 const capEnd=(s,front)=>{const ctr=pos.length/3;const z=-L2+s/NS*d.L;const P=carProfile(d,z);pos.push(0,(P.yb+P.belt)/2,z+(front?.02:-.02));
  for(const sd of [1,-1])for(let p=0;p<NP-1;p++){const a=vi(s,sd,p),b=vi(s,sd,p+1);const fw=(sd>0)===front;(p<2?trimI:paintI).push(...(fw?[a,b,ctr]:[b,a,ctr]));}};
 capEnd(NS,true);capEnd(0,false);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex([...paintI,...glassI,...trimI]);g.computeVertexNormals();
 const sub=I=>{const q=new THREE.BufferGeometry();q.setAttribute('position',g.attributes.position);q.setAttribute('normal',g.attributes.normal);q.setIndex(I);q.computeBoundingSphere();return q;};
 return {paint:sub(paintI),glass:sub(glassI),trim:sub(trimI),d};}
function wheelGeo(R,Wd,style){const key=R+'_'+Wd+'_'+style;if(WHEEL_GEO[key])return WHEEL_GEO[key];
 const prof=[];const r0=R*.66,hw=Wd/2;const N=10;
 prof.push(new THREE.Vector2(r0,-hw*.92));for(let k=0;k<=N;k++){const a=-Math.PI/2+k/N*Math.PI;prof.push(new THREE.Vector2(R-.045+Math.cos(a)*.045,Math.sin(a)*hw));}prof.push(new THREE.Vector2(r0,hw*.92));
 const tire=new THREE.LatheGeometry(prof,28);tire.rotateZ(Math.PI/2);
 const parts=[];const rr=r0*.98;
 const dish=new THREE.LatheGeometry([new THREE.Vector2(.02,hw*.55),new THREE.Vector2(rr*.25,hw*.6),new THREE.Vector2(rr*.92,hw*.25),new THREE.Vector2(rr,hw*.7),new THREE.Vector2(rr,hw*.2)],24);dish.rotateZ(-Math.PI/2);parts.push(dish);
 const spokes=[5,6,10,5,8][style]||5;
 for(let k=0;k<spokes;k++){const a=k/spokes*Math.PI*2;const sp=new THREE.BoxGeometry(.035,rr*(style===4?.5:.86),style===3?.06:.03);sp.translate(0,rr*(style===4?.45:.5),0);sp.rotateX(a);sp.translate(hw*.62,0,0);parts.push(sp);}
 const hub=new THREE.CylinderGeometry(rr*.2,rr*.24,.06,12);hub.rotateZ(Math.PI/2);hub.translate(hw*.66,0,0);parts.push(hub);
 const rim=mergeGeometries(parts.map(p=>p.index?p.toNonIndexed():p).map(p=>{for(const k of Object.keys(p.attributes))if(k!=='position'&&k!=='normal')p.deleteAttribute(k);return p;}));
 const disc=new THREE.CylinderGeometry(rr*.78,rr*.78,.03,20);disc.rotateZ(Math.PI/2);disc.translate(hw*.1,0,0);
 return WHEEL_GEO[key]={tire,rim,disc};}
function makeWheel(R,Wd,style,cal,side){const wg=wheelGeo(R,Wd,style);const w=new THREE.Group();
 const t=new THREE.Mesh(wg.tire,carRubberMat);t.castShadow=true;const r=new THREE.Mesh(wg.rim,rimMats[style]||rimMats[0]);const dsk=new THREE.Mesh(wg.disc,cm(0x55585c,.5,.8));
 w.add(t,r,dsk);if(side<0)w.scale.x=-1;return w;}
function carGeo(type){if(CAR_GEO[type])return CAR_GEO[type];const G=buildCarGeo(type);const d=G.d,L2=d.L/2;
 const trim=[],chrome=[],head=[],tail=[],grille=[],dark=[];
 const P1=carProfile(d,L2-.12),P0=carProfile(d,-L2+.1);
 const hy=P1.belt-.1,hx=P1.w-.32,ty=Math.min(P0.belt-.12,P0.yb+.75);
 const add=(L,geo,x,y,z,rx=0,ry=0,rz=0)=>{geo.rotateX(rx);geo.rotateY(ry);geo.rotateZ(rz);geo.translate(x,y,z);L.push(geo);};
 for(const sd of [-1,1]){
  // Scheinwerfer (Linse + Chrom-Reflektor), Rückleuchten
  add(head,new THREE.SphereGeometry(1,14,8).scale(.22*(d.box?1.1:1),.075,.08),sd*hx,hy,L2-.07*(1+P1.w*0));
  add(chrome,new THREE.SphereGeometry(1,12,6).scale(.24,.09,.05),sd*hx,hy,L2-.11);
  add(tail,new THREE.BoxGeometry(d.bus||d.box?.32:.48,d.box?.3:.12,.07),sd*(P0.w-.3),ty,-L2+.05);
  if(!d.bus)add(tail,new THREE.BoxGeometry(.1,.05,.05),sd*(P0.w-.5),ty-.11,-L2+.06);
  // Spiegel
  if(!d.bus){const mz=d.cab[1]-d.ws*.75,P=carProfile(d,mz);add(trim,new THREE.SphereGeometry(1,10,6).scale(.1,.07,.12),sd*(P.w+.1),P.belt+.13,mz);add(trim,new THREE.BoxGeometry(.12,.03,.05),sd*(P.w+.03),P.belt+.1,mz);}
  // Türfugen und Griffe
  if(!d.bus&&!d.box){const zs=[d.cab[1]-d.ws*.55,(d.cab[0]+d.cab[1])/2+.05];if(d.cab[1]-d.cab[0]>1.9&&type!=='sport'&&type!=='super'&&type!=='muscle')zs.push(d.cab[0]+d.rw*.6);
   for(const z of zs){const P=carProfile(d,z);add(dark,new THREE.BoxGeometry(.012,P.belt-P.yb-.25,.012),sd*(P.w+.004),(P.belt+P.yb+.2)/2,z);}
   for(const z of [(d.cab[0]+d.cab[1])/2-.15,d.cab[1]-d.ws*.55-.65].slice(0,zs.length>2?2:1)){const P=carProfile(d,z);add(chrome,new THREE.BoxGeometry(.03,.035,.17),sd*(P.w+.012),P.belt-.12,z);}}
  // Seitenschweller-Leiste
  add(trim,new THREE.BoxGeometry(.03,.07,d.wz[0]-d.wz[1]-d.wr*2-.3),sd*(carProfile(d,0).w+.005),d.yb+.14,(d.wz[0]+d.wz[1])/2);}
 // Kühlergrill, Kennzeichen-Halter, Lufteinlässe
 add(grille,new THREE.BoxGeometry(P1.w*(d.box?1.3:.95),d.box?.42:.2,.04),0,hy-(d.box?.15:.08),L2-.02);
 add(dark,new THREE.BoxGeometry(P1.w*1.5,.12,.05),0,P1.yb+.12,L2-.05);
 if(d.intake)for(const sd of [-1,1])add(dark,new THREE.BoxGeometry(.05,.22,.7),sd*(carProfile(d,-.6).w-.01),d.belt-.18,-.6);
 // Auspuff
 for(const sd of (d.spoiler||type==='muscle'?[-1,1]:[1])){add(chrome,new THREE.CylinderGeometry(.045,.05,.18,10),sd*(P0.w-.45),P0.yb+.05,-L2+.02,Math.PI/2);}
 // Innenraum (dunkel, damit man durch die Scheiben nicht durchsieht) + Sitze
 {const c0=d.cab[0]+d.rw*.5+.1,c1=d.cab[1]-d.ws*.7;const Pm=carProfile(d,(c0+c1)/2);const hh=Math.max(.15,(d.roof-d.belt)*.62);add(dark,new THREE.BoxGeometry(Pm.w*(d.box||d.bus?1.75:1.36),hh,Math.max(.3,c1-c0)),0,d.belt+hh/2-.02,(c0+c1)/2);}
 // Typ-Extras
 if(d.spoiler===1){add(trim,new THREE.BoxGeometry(d.W*.8,.04,.28),0,P0.belt+.22,-L2+.3);for(const sd of [-1,1])add(trim,new THREE.BoxGeometry(.05,.2,.08),sd*d.W*.3,P0.belt+.1,-L2+.32);}
 if(d.spoiler===2){add(trim,new THREE.BoxGeometry(d.W*.92,.05,.36),0,P0.belt+.3,-L2+.25);for(const sd of [-1,1])add(trim,new THREE.BoxGeometry(.05,.3,.1),sd*d.W*.36,P0.belt+.14,-L2+.28);}
 if(d.rails)for(const sd of [-1,1])add(chrome,new THREE.BoxGeometry(.05,.05,(d.cab[1]-d.cab[0])*.75),sd*carProfile(d,0).w*.68,d.roof+.04,(d.cab[0]+d.cab[1])/2-.15);
 if(d.scoop)add(dark,new THREE.BoxGeometry(.55,.1,.75),0,carProfile(d,1.6).belt+.06,1.55);
 if(d.bed){const z0=-L2+.12,z1=d.cab[0]-.05;const P=carProfile(d,(z0+z1)/2);add(dark,new THREE.BoxGeometry(P.w*1.7,.06,z1-z0),0,P.belt-.32,(z0+z1)/2);}
 const mg=(L)=>{if(!L.length)return null;const g=mergeGeometries(L.map(q=>{q=q.index?q.toNonIndexed():q;for(const k of Object.keys(q.attributes))if(k!=='position'&&k!=='normal')q.deleteAttribute(k);return q;}));g.computeBoundingSphere();return g;};
 const plate=new THREE.PlaneGeometry(.52,.13);
 return CAR_GEO[type]={...G,trimX:mg(trim),chromeX:mg(chrome),head:mg(head),tail:mg(tail),grilleG:mg(grille),darkX:mg(dark),plate,hy,hx,ty,P0,P1};}
// komplettes Modell aufbauen (für makeCar)
function buildCarModel(type,pm,body,g,o={}){const G=carGeo(type),d=G.d,L2=d.L/2;
 const bodyMesh=mesh(G.paint,pm);body.add(bodyMesh);
 const glass=new THREE.Mesh(G.glass,carGlassMat);glass.castShadow=false;body.add(glass);
 const tr=mesh(G.trim,carTrimMat);body.add(tr);
 for(const [geo,mat,sh] of [[G.trimX,carTrimMat,true],[G.chromeX,carChromeMat,false],[G.head,headMat,false],[G.tail,tailMat,false],[G.grilleG,grilleMat,false],[G.darkX,carDarkMat,false]])if(geo)body.add(mesh(geo,mat,0,0,0,sh));
 const pmF=plateMat();for(const [z,ry] of [[L2+.005,0],[-L2-.005,Math.PI]]){const pl=new THREE.Mesh(G.plate,pmF);pl.position.set(0,(z>0?G.P1.yb+.26:G.P0.yb+.3),z);pl.rotation.y=ry;body.add(pl);}
 const wheels=[],fronts=[];const Wd=d.wr*.62+.05,wx=d.W/2-Wd/2-.04;
 for(const wz of d.wz)for(const sd of [-1,1]){const pv=new THREE.Group();pv.position.set(sd*wx,d.wr,wz);const w=makeWheel(d.wr,Wd,d.rim||0,d.cal,sd);pv.add(w);g.add(pv);wheels.push(w);if(wz>0)fronts.push(pv);
  if(d.cal){const cl=mesh(new THREE.BoxGeometry(.05,.14,.2),caliperMat,sd*(wx-Wd*.1),d.wr+.12,wz+.08,false);g.add(cl);}}
 if(d.bus&&d.L>9)for(const sd of [-1,1]){const pv=new THREE.Group();pv.position.set(sd*wx,d.wr,d.wz[1]+1.25);const w=makeWheel(d.wr,Wd,d.rim||0,0,sd);pv.add(w);g.add(pv);wheels.push(w);}
 return {bodyMesh,wheels,fronts,G};}
function extrudeSide(pts,depth){const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:2});g.rotateY(-Math.PI/2);g.translate(depth/2,0,0);g.computeVertexNormals();return g;}
function paint(c){return paintCache[c]||(paintCache[c]=(()=>{const m=new THREE.MeshPhysicalMaterial({color:c,metalness:.55,roughness:.3,clearcoat:1,clearcoatRoughness:.06});allMats.push(m);return m;})());}
function pickTrafficType(){let r=Math.random()*TRAFFIC_SUM;for(const [t,w] of TRAFFIC_MIX){if((r-=w)<0)return t;}return 'sedan';}
function carBase(o){return Object.assign({wreckT:0,pos:new THREE.Vector3(),h:0,speed:0,steer:0,mode:'ai',police:false,hasTracker:!o.police&&Math.random()<.34,trackerT:20,stolen:false,a:null,b:null,t:0,cruise:R(9,14),bump:0,blockT:0,ghost:0,stuck:0,rev:0,revDir:1,y:null,air:false,vy:0,rider:null},o);}
function makeBike(color,vt){const sc=vt==='scooter';const g=new THREE.Group(),body=new THREE.Group();g.add(body);const pm=paint(color);const wr=sc?.3:.36;
 const wG=new THREE.CylinderGeometry(wr,wr,.14,16).rotateZ(Math.PI/2);const wheels=[],fronts=[];
 for(const z of [sc?.6:.74,sc?-.58:-.72]){const pv=new THREE.Group();pv.position.set(0,wr,z);const w=new THREE.Mesh(wG,tireMat);w.castShadow=true;pv.add(w);body.add(pv);wheels.push(w);if(z>0)fronts.push(pv);}
 const tank=mesh(new THREE.BoxGeometry(.32,.36,sc?.8:1.05),pm,0,wr+.36,sc?-.05:.02);body.add(tank);
 body.add(mesh(new THREE.BoxGeometry(.3,.1,.62),cm(0x111111,.6),0,wr+.6,-.3));
 body.add(mesh(new THREE.BoxGeometry(.06,.66,.06),cm(0x333333,.4,.7),0,wr+.38,sc?.52:.66,false));
 body.add(mesh(new THREE.BoxGeometry(.66,.05,.05),cm(0x222222,.4,.7),0,wr+.74,sc?.47:.58,false));
 body.add(mesh(new THREE.BoxGeometry(.16,.1,.06),headMat,0,wr+.52,sc?.66:.8,false),mesh(new THREE.BoxGeometry(.14,.07,.05),tailMat,0,wr+.5,sc?-.72:-.86,false));
 if(sc)body.add(mesh(new THREE.BoxGeometry(.42,.32,.55),pm,0,wr+.28,-.38),mesh(new THREE.BoxGeometry(.5,.4,.45),cm(0xc0392b,.6),0,wr+.86,-.62));
 else{const ex=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.7,8).rotateX(Math.PI/2),cm(0x999999,.3,.9));ex.position.set(.16,wr+.08,-.45);body.add(ex);}
 const beam=new THREE.Mesh(beamGeo,beamMat);beam.position.set(0,wr+.52,sc?.7:.85);beam.scale.set(.45,.8,.8);body.add(beam);
 scene.add(g);const st=VST[vt];
 return carBase({g,body,bodyMesh:tank,vt,bike:true,wr,hp:st.hp,maxHp:st.hp,rad:.9,wheels,fronts,cruise:R(10,15)});}
function addRider(c){const r=buildChar(randomSkin());r.g.position.set(0,c.wr-.28,-.3);r.legL.rotation.x=r.legR.rotation.x=-1.3;r.armL.rotation.x=r.armR.rotation.x=-1.05;c.body.add(r.g);c.rider=r;}
// ---------- Boote & Panzer (Modelle in 07b) ----------
function makeBoat(color){const g=new THREE.Group(),body=new THREE.Group();g.add(body);const pm=paint(color);
 const hull=new THREE.Mesh(boatGeo(),boatMats(pm));hull.castShadow=true;hull.receiveShadow=true;body.add(hull);boatRegDecals(body);
 scene.add(g);const st=VST.boat;
 return carBase({g,body,bodyMesh:hull,vt:'boat',boat:true,color,seat:BOAT_SEAT,hp:st.hp,maxHp:st.hp,rad:2.3,wheels:[],fronts:[],cruise:0,bob:Math.random()*6});}
function makeTank(){const g=new THREE.Group(),body=new THREE.Group();g.add(body);if(!TANKGEO)TANKGEO={hull:tankHullGeo(),tur:tankTurretGeo()};
 const mk=geo=>{const m=new THREE.Mesh(geo,geo.userData.keys.map(k=>VMAT[k]));m.castShadow=true;m.receiveShadow=true;return m;};
 const hull=mk(TANKGEO.hull);body.add(hull);const turret=new THREE.Group();turret.position.set(0,1.6,-.25);body.add(turret);const tm=mk(TANKGEO.tur);turret.add(tm);
 scene.add(g);const st=VST.tank;
 return carBase({g,body,bodyMesh:hull,burnMeshes:[hull,tm],vt:'tank',hp:st.hp,maxHp:st.hp,rad:3.3,wheels:[],fronts:[],turret,heavy:true,armor:.15,cruise:0});}

function makeCar(color,police=false,vt,o={}){
 vt=police?'police':(vt||pickTrafficType());
 if(vt==='bike'||vt==='scooter')return makeBike(color,vt);
 const type=BODY[vt]||vt;const d=CARDEF[type]||CARDEF.sedan;
 if(vt==='taxi')color=0xf2c230;if(vt==='ambulance')color=0xf4f4f4;if(vt==='armored')color=0x3d4249;
 const g=new THREE.Group(),body=new THREE.Group();g.add(body);
 const pm=o.rust&&!police?rustPaint(color,o.rv||0):paint(police?0xf4f4f4:color);
 const Mo=buildCarModel(CARDEF[type]?type:'sedan',pm,body,g);const {bodyMesh,wheels,fronts}=Mo,G=Mo.G;
 const L2=d.L/2,roofY=d.roof;
 if(police){const P=carProfile(d,.1);for(const sd of [-1,1]){const st=mesh(new THREE.BoxGeometry(.02,.3,2.6),cm(0x111111,.35,.5),sd*(P.w+.004),(P.belt+P.yb)/2+.12,.1,false);body.add(st);
   const pl=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.36),new THREE.MeshStandardMaterial({map:polSign,roughness:.5}));pl.position.set(sd*(P.w+.018),(P.belt+P.yb)/2+.12,.1);pl.rotation.y=sd*Math.PI/2;body.add(pl);}
  const lb=new THREE.Group();lb.position.set(0,roofY+.07,-.2);lb.add(mesh(new THREE.BoxGeometry(1.3,.1,.32),cm(0x111111,.4,.4),0,-.02,0,false),mesh(new THREE.BoxGeometry(.6,.13,.3),polRed,-.33,.05,0,false),mesh(new THREE.BoxGeometry(.6,.13,.3),polBlue,.33,.05,0,false));body.add(lb);
  body.add(mesh(new THREE.BoxGeometry(d.W*.8,.12,.12),cm(0x111111,.5,.3),0,d.yb+.2,L2+.06,false));}
 if(vt==='taxi'){body.add(mesh(new THREE.BoxGeometry(.8,.26,.32),taxiSignMat,0,roofY+.15,-.25,false));const P=carProfile(d,0);for(const sd of [-1,1]){const ch=new THREE.Mesh(new THREE.PlaneGeometry(2.0,.12),checkerMat);ch.position.set(sd*(P.w+.012),P.belt-.16,0);ch.rotation.y=sd*Math.PI/2;body.add(ch);}}
 if(vt==='ambulance'){const P=carProfile(d,-.6);for(const sd of [-1,1]){const st=new THREE.Mesh(new THREE.PlaneGeometry(4.2,.32),cm(0xc0392b,.5));st.position.set(sd*(P.w+.012),1.15,-.4);st.rotation.y=sd*Math.PI/2;body.add(st);const pl=new THREE.Mesh(new THREE.PlaneGeometry(2.4,.5),ambSignMat);pl.position.set(sd*(P.w+.014),1.62,-.6);pl.rotation.y=sd*Math.PI/2;body.add(pl);}
  const lb=new THREE.Group();lb.position.set(0,roofY+.08,.9);lb.add(mesh(new THREE.BoxGeometry(.6,.16,.3),polRed,-.34,0,0,false),mesh(new THREE.BoxGeometry(.6,.16,.3),polBlue,.34,0,0,false));body.add(lb);}
 if(vt==='bus'){const P=carProfile(d,0);for(const sd of [-1,1]){const st=new THREE.Mesh(new THREE.PlaneGeometry(10.6,.4),cm(0xf2f2f2,.5));st.position.set(sd*(P.w+.012),1.0,0);st.rotation.y=sd*Math.PI/2;body.add(st);}}
 if(vt==='armored')for(const sd of [-1,1]){const P=carProfile(d,-1.2);const pl=new THREE.Mesh(new THREE.PlaneGeometry(2.6,.55),armSignMat);pl.position.set(sd*(P.w+.014),1.7,-1.2);pl.rotation.y=sd*Math.PI/2;body.add(pl);}
 const beam=new THREE.Mesh(beamGeo,beamMat);beam.position.set(0,G.hy,L2+.05);beam.scale.set(d.W/1.9,1,1);body.add(beam);
 scene.add(g);const st=VST[vt]||VST.sedan;
 return carBase({g,body,bodyMesh,vt,police,color,hp:st.hp,maxHp:st.hp,rad:d.L>9?2.4:d.L>6?1.95:d.L>5.2?1.75:1.6,wheels,fronts,beam,cruise:R(9,14)*(vt==='bus'||vt==='truck'?.8:1)});
}
function nbrs(n){const r=[];for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const i=n.i+di,j=n.j+dj;if(i>=0&&j>=0&&i<=N&&j<=N)r.push({i,j});}return r;}
function placeAI(c,a,b,t){c.a=a;c.b=b;c.t=t;const A=nd(a.i,a.j),Bn=nd(b.i,b.j);const dx=Math.sign(Bn.x-A.x),dz=Math.sign(Bn.z-A.z);c.h=Math.atan2(dx,dz);
 c.pos.set(A.x+(Bn.x-A.x)*t-Math.cos(c.h)*3.5,0,A.z+(Bn.z-A.z)*t+Math.sin(c.h)*3.5);c.g.position.copy(c.pos);c.speed=c.cruise;}
function spawnTraffic(farFrom){
 for(let tries=0;tries<20;tries++){const a={i:Math.floor(Math.random()*(N+1)),j:Math.floor(Math.random()*(N+1))};const b=pick(nbrs(a));
  const p=nd(a.i,a.j);if(farFrom){const d=Math.hypot(p.x-farFrom.x,p.z-farFrom.z);if(d<110||d>(window.__lifeReady?330:1e9))continue;}
  let c;if(window.__lifeReady)c=carFor(wealthAt(p.x,p.z),{noRider:true});else{const vt=pickTrafficType();c=makeCar(vt==='bus'?pick([0x1f6fb2,0xd35400,0x16a085]):pick(carColors),false,vt);}if(c.bike)addRider(c);placeAI(c,a,b,Math.random()*.6+.2);cars.push(c);return c;}}
function parkedCar(x,z,h,color,type){const c=makeCar(color,false,type);c.mode='parked';c.pos.set(x,0,z);c.g.position.copy(c.pos);c.g.position.y=groundY(x,z);c.h=h;c.g.rotation.y=h;c.speed=0;cars.push(c);return c;}
function ringAt(s){s=((s%RING_TOTAL)+RING_TOTAL)%RING_TOTAL;for(let k=0;k<4;k++){if(s<=RING_LEN[k]){const a=RING_PTS[k],b=RING_PTS[(k+1)%4],t=s/RING_LEN[k];return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,dx:Math.sign(b.x-a.x),dz:Math.sign(b.z-a.z)};}s-=RING_LEN[k];}return {x:RING_PTS[0].x,z:RING_PTS[0].z,dx:1,dz:0};}
function spawnRingCar(){const c=makeCar(pick(carColors),false,pick(['sedan','suv','sport','van','muscle','sedan','super']));c.mode='ring';c.rs=Math.random()*RING_TOTAL;c.rdir=Math.random()<.5?1:-1;c.lane=3.6;c.cruise=R(22,30);
 const q=ringAt(c.rs),h=Math.atan2(q.dx*c.rdir,q.dz*c.rdir);c.h=h;c.pos.set(q.x-Math.cos(h)*c.lane,0,q.z+Math.sin(h)*c.lane);c.g.position.copy(c.pos);cars.push(c);return c;}
// ---------- Detaillierte Fahrzeugmodelle: Sportboot & Kampfpanzer (pro Material zusammengefügt) ----------
// partKit: sammelt Teile (Box/Zylinder/Kugel/Rohr/eigene Geometrie) und fügt sie zu EINER Geometrie mit Material-Gruppen zusammen
function partKit(){const parts=[],keys=[];const ki=k=>{let i=keys.indexOf(k);if(i<0){keys.push(k);i=keys.length-1;}return i;};
 const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_e=new THREE.Euler(),_p=new THREE.Vector3(),_s=new THREE.Vector3();
 const add=(geo,k,x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>{const g=geo.index?geo.toNonIndexed():geo.clone();geo.dispose&&geo.dispose();
  g.applyMatrix4(_m.compose(_p.set(x,y,z),_q.setFromEuler(_e.set(rx,ry,rz)),_s.set(sx,sy,sz)));
  for(const a of Object.keys(g.attributes))if(a!=='position'&&a!=='normal'&&a!=='uv')g.deleteAttribute(a);
  if(!g.attributes.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
  if(!g.attributes.normal)g.computeVertexNormals();g.clearGroups();parts.push([g,ki(k)]);return g;};
 return {keys,add,
  B:(w,h,d,k,x,y,z,rx=0,ry=0,rz=0)=>add(new THREE.BoxGeometry(w,h,d),k,x,y,z,rx,ry,rz),
  C:(r0,r1,len,k,x,y,z,seg=12,rx=0,ry=0,rz=0)=>add(new THREE.CylinderGeometry(r0,r1,len,seg),k,x,y,z,rx,ry,rz),
  Cz:(r0,r1,len,k,x,y,z,seg=12)=>add(new THREE.CylinderGeometry(r0,r1,len,seg),k,x,y,z,Math.PI/2,0,0),
  Cx:(r0,r1,len,k,x,y,z,seg=12)=>add(new THREE.CylinderGeometry(r0,r1,len,seg),k,x,y,z,0,0,Math.PI/2),
  S:(r,k,x,y,z,sx=1,sy=1,sz=1,ws=12,hs=8)=>add(new THREE.SphereGeometry(r,ws,hs),k,x,y,z,0,0,0,sx,sy,sz),
  T:(pts,r,k,seg=24,rs=6,closed=false)=>add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0],p[1],p[2])),closed,'centripetal'),seg,r,rs,closed),k),
  done(planar){parts.sort((a,b)=>a[1]-b[1]);
   if(planar)for(const [g,m] of parts){const sc=planar[keys[m]];if(sc)planarUV(g,sc);}
   const geo=mergeGeometries(parts.map(p=>p[0]),false);let st=0,cur=-1,cs=0;
   for(const [g,m] of parts){const n=g.attributes.position.count;if(m!==cur){if(cur>=0)geo.addGroup(cs,st-cs,cur);cur=m;cs=st;}st+=n;}geo.addGroup(cs,st-cs,cur);
   for(const [g] of parts)g.dispose();geo.computeBoundingBox();geo.computeBoundingSphere();geo.userData.keys=keys.slice();return geo;}};}
// Planare UVs pro Dreieck (nach Hauptachse der Fläche) – nahtlose Texturen über Kanten hinweg (Tarnmuster, Rutschbelag)
function planarUV(g,sc){const p=g.attributes.position.array,uv=g.attributes.uv.array;
 for(let t=0;t<p.length;t+=9){const ax=p[t+3]-p[t],ay=p[t+4]-p[t+1],az=p[t+5]-p[t+2],bx=p[t+6]-p[t],by=p[t+7]-p[t+1],bz=p[t+8]-p[t+2];
  const nx=Math.abs(ay*bz-az*by),ny=Math.abs(az*bx-ax*bz),nz=Math.abs(ax*by-ay*bx);
  for(let v=0;v<3;v++){const i=t+v*3,o=(t/9*3+v)*2;if(nx>=ny&&nx>=nz){uv[o]=p[i+2]*sc;uv[o+1]=p[i+1]*sc;}else if(ny>=nz){uv[o]=p[i]*sc;uv[o+1]=p[i+2]*sc;}else{uv[o]=p[i]*sc;uv[o+1]=p[i+1]*sc;}}}
 g.attributes.uv.needsUpdate=true;}
// Gitterfläche (Spanten × Punkte) mit weichen Normalen; Ausrichtung automatisch nach außen (ref-Funktion)
function gridStrip(P,ref){const nu=P.length,nv=P[0].length,pos=[],uv=[],idx=[];
 for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const q=P[i][j];pos.push(q[0],q[1],q[2]);uv.push(q[2]*.5,j/(nv-1));}
 for(let i=0;i<nu-1;i++)for(let j=0;j<nv-1;j++){const a=i*nv+j,b=(i+1)*nv+j,c=(i+1)*nv+j+1,d=i*nv+j+1;idx.push(a,b,d,b,c,d);}
 let s=0;for(let t=0;t<idx.length;t+=3){const A=idx[t]*3,Bq=idx[t+1]*3,Cq=idx[t+2]*3;const ax=pos[Bq]-pos[A],ay=pos[Bq+1]-pos[A+1],az=pos[Bq+2]-pos[A+2],bx=pos[Cq]-pos[A],by=pos[Cq+1]-pos[A+1],bz=pos[Cq+2]-pos[A+2];
  const nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;const r=ref(pos[A],pos[A+1],pos[A+2]);s+=nx*r[0]+ny*r[1]+nz*r[2];}
 if(s<0)for(let t=0;t<idx.length;t+=3){const k=idx[t+1];idx[t+1]=idx[t+2];idx[t+2]=k;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
// Prisma zwischen zwei Grundrissen (unten/oben) – facettierte Panzerformen
function prismLoft(Bp,Tp,y0,y1){const n=Bp.length,pos=[];let cx=0,cz=0;for(const q of Bp){cx+=q[0]/n;cz+=q[1]/n;}
 const tri=(a,b,c,out)=>{const ax=b[0]-a[0],ay=b[1]-a[1],az=b[2]-a[2],bx=c[0]-a[0],by=c[1]-a[1],bz=c[2]-a[2];const nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;
  if(nx*out[0]+ny*out[1]+nz*out[2]<0)pos.push(...a,...c,...b);else pos.push(...a,...b,...c);};
 for(let i=0;i<n;i++){const j=(i+1)%n;const b0=[Bp[i][0],y0,Bp[i][1]],b1=[Bp[j][0],y0,Bp[j][1]],t0=[Tp[i][0],y1,Tp[i][1]],t1=[Tp[j][0],y1,Tp[j][1]];
  const mx=(b0[0]+b1[0])/2-cx,mz=(b0[2]+b1[2])/2-cz,out=[mx,0,mz];tri(b0,b1,t1,out);tri(b0,t1,t0,out);}
 let tx=0,tz=0;for(const q of Tp){tx+=q[0]/n;tz+=q[1]/n;}
 for(let i=0;i<n;i++){const j=(i+1)%n;tri([tx,y1,tz],[Tp[i][0],y1,Tp[i][1]],[Tp[j][0],y1,Tp[j][1]],[0,1,0]);tri([cx,y0,cz],[Bp[i][0],y0,Bp[i][1]],[Bp[j][0],y0,Bp[j][1]],[0,-1,0]);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g;}
function bInt(A,z){const Z=BOATZ;let i=1;while(i<Z.length-1&&z>Z[i])i++;const t=clamp((z-Z[i-1])/(Z[i]-Z[i-1]),0,1);
 const p0=A[Math.max(0,i-2)],p1=A[i-1],p2=A[i],p3=A[Math.min(A.length-1,i+1)],t2=t*t,t3=t2*t;return .5*(2*p1+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3);}
function boatSec(z){const hw=Math.max(.02,bInt(BOATHW,z)),k=bInt(BOATKY,z),sh=bInt(BOATSH,z),dr=bInt(BOATDR,z);
 const y1=Math.min(k+dr,sh-.5),y2=Math.min(y1+.03,sh-.46),y3=Math.min(Math.max(y2+.08,.22),sh-.4),y4=sh-.34,y5=sh-.2;
 return {hw,k,sh,cw:Math.min(.09,hw*.45),pts:[[0,k],[hw*.78,y1],[hw*.86,y2],[hw*.93,y3],[hw*.965,y4],[hw*.985,y5],[hw,sh]]};}
function boatGeo(){if(BOATGEO)return BOATGEO;const K=partKit();const FD=1.6,FL=.6;
 let zs=[];for(let i=0;i<=34;i++){const t=i/34;zs.push(-3.0+6.55*(1-Math.pow(1-t,1.45)));}zs.push(FD);zs.sort((a,b)=>a-b);zs=zs.filter((z,i)=>i===0||z-zs[i-1]>.015);
 const SEC=zs.map(z=>[z,boatSec(z)]);const out=(x,y)=>[x,y-.45,0];
 const band=['bottom','bottom','bottom','hullW','paint','hullW'];
 for(const s of [-1,1]){for(let j=0;j<6;j++)K.add(gridStrip(SEC.map(([z,S])=>[[s*S.pts[j][0],S.pts[j][1],z],[s*S.pts[j+1][0],S.pts[j+1][1],z]]),out),band[j]);
  K.add(gridStrip(SEC.map(([z,S])=>[[s*S.hw,S.sh,z],[s*(S.hw-S.cw),S.sh,z]]),()=>[0,1,0]),'cap');
  K.add(gridStrip(SEC.filter(([z])=>z<=FD+1e-6).map(([z,S])=>[[s*(S.hw-S.cw),S.sh,z],[s*(S.hw-S.cw-.035),FL-.01,z]]),x=>[-x,0,0]),'liner');
  K.T(SEC.map(([z,S])=>[s*(S.hw+.016),S.sh-.05,z]),.03,'rub',60,6);}
 // Vordeck (gewölbt) + Spiegel (Heck)
 K.add(gridStrip(SEC.filter(([z])=>z>=FD-1e-6).map(([z,S])=>{const w=S.hw-S.cw;const r=[];for(let j=0;j<=6;j++){const u=-1+j/3;r.push([u*w,S.sh+.06*(1-u*u)*Math.min(1,w/.5),z]);}return r;}),()=>[0,1,0]),'deck');
 {const S=boatSec(-3.0),z0=-3.0,poly=[];for(let j=6;j>=0;j--)poly.push([S.pts[j][0],S.pts[j][1]]);for(let j=1;j<=6;j++)poly.push([-S.pts[j][0],S.pts[j][1]]);
  const pos=[],cy=(S.k+S.sh)/2+.1;for(let i=0;i<poly.length-1;i++){const a=poly[i],b=poly[i+1];pos.push(0,cy,z0,b[0],b[1],z0,a[0],a[1],z0);}pos.push(0,cy,z0,poly[0][0],poly[0][1],z0,poly[poly.length-1][0],poly[poly.length-1][1],z0);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();if(g.attributes.normal.array[2]>0){for(let t=0;t<pos.length;t+=9)for(let c=0;c<3;c++){const k=pos[t+3+c];pos[t+3+c]=pos[t+6+c];pos[t+6+c]=k;}g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();}
  K.add(g,'hullW');}
 const hwA=z=>bInt(BOATHW,z),shA=z=>bInt(BOATSH,z);
 // Cockpitboden, Innenspiegel, Schott zum Vordeck mit Stufe
 K.add(gridStrip(SEC.filter(([z])=>z>=-2.97&&z<=FD+1e-6).map(([z,S])=>{const x=S.hw-S.cw-.035;return [[-x,FL,z],[0,FL,z],[x,FL,z]];}),()=>[0,1,0]),'deck');K.B(2*(hwA(-2.95)-.1),shA(-2.95)-FL,.08,'liner',0,(shA(-2.95)+FL)/2,-2.93);
 K.B(2*(hwA(FD)-.1),shA(FD)+.05-FL,.06,'liner',0,(shA(FD)+.05+FL)/2,FD-.02);K.B(.7,.26,.3,'liner',0,FL+.13,FD-.2);K.B(.72,.02,.32,'deck',0,FL+.27,FD-.2);
 // Heckbank mit Polstern + Spritzschutz
 K.B(2.0,.4,.5,'liner',0,FL+.2,-2.63);K.B(1.96,.09,.5,'cush',0,FL+.445,-2.63);K.B(1.96,.32,.1,'cush',0,FL+.66,-2.84);for(const x of [-.66,0,.66])K.B(.02,.3,.1,'cushD',x,FL+.66,-2.84);K.B(1.96,.025,.5,'cushD',0,FL+.5,-2.63);
 // Lehnstand hinter dem Fahrer mit Kühlbox und Rutenhaltern
 K.B(.76,.52,.44,'hullW',0,FL+.26,-1.18);K.B(.8,.17,.46,'cush',0,FL+.6,-1.18);K.B(.8,.33,.11,'cush',0,FL+.85,-1.4);K.B(.6,.32,.36,'liner',0,FL+.16,-.86);K.B(.62,.04,.38,'cushD',0,FL+.34,-.86);
 for(const x of [-.3,-.1,.1,.3]){K.C(.025,.025,.34,'chrome',x,FL+1.06,-1.47,10,-.25);}
 K.T([[-.45,FL+.5,-1.42],[-.45,FL+1.12,-1.45],[.45,FL+1.12,-1.45],[.45,FL+.5,-1.42]],.016,'chrome',30,6);
 // Mittelkonsole: Korpus, schräges Armaturenbrett, Display, Steuerrad, Gashebel, Kompass, Windschutzscheibe
 K.B(.9,.85,.9,'hullW',0,FL+.425,.4);K.B(.94,.05,.94,'rub',0,FL+.02,.4);K.B(.86,.05,.44,'dash',0,1.5,.12,-.55);K.B(.9,.16,.55,'hullW',0,1.53,.575);
 K.add(new THREE.BoxGeometry(.34,.012,.21),'screen',.15,1.5+.85*.03,.12-.52*.03,-.55);K.B(.38,.012,.25,'black',.15,1.5+.85*.022,.12-.52*.022,-.55);
 for(let i=0;i<4;i++)K.B(.04,.012,.03,i?'black':'navR',-.32+i*.055,1.43+.85*.028,-.02-.52*.028+.0,-.55);
 {const wc=[-.15,1.5,-.13];K.add(new THREE.TorusGeometry(.17,.016,8,28),'black',wc[0],wc[1],wc[2],.58);K.C(.035,.035,.08,'chrome',wc[0],wc[1],wc[2],10,Math.PI/2+.58);
  for(let a=0;a<3;a++){const ph=a*Math.PI*2/3+Math.PI/2,ox=Math.cos(ph)*.085,oy=Math.sin(ph)*.085*Math.cos(.58),oz=Math.sin(ph)*.085*Math.sin(.58);K.B(.17,.02,.012,'chrome',wc[0]+ox,wc[1]+oy,wc[2]+oz,.58,0,ph);}
  K.C(.022,.022,.16,'chrome',wc[0],wc[1]-.03,wc[2]+.07,8,Math.PI/2+.58);}
 K.B(.12,.13,.15,'dash',.31,1.5,-.03);K.B(.024,.19,.024,'chrome',.31,1.62,-.05,-.45);K.S(.03,'black',.31,1.71,-.09);K.B(.024,.16,.024,'chrome',.36,1.6,-.04,-.45);K.S(.026,'navR',.36,1.68,-.08);
 K.C(.06,.065,.03,'dash',0,1.625,.42,14);K.S(.055,'glassD',0,1.64,.42,1,.55,1,14,8);
 K.B(.92,.42,.012,'glass',0,1.807,.378,-.35);K.B(.94,.035,.025,'black',0,1.6,.46);
 for(const s of [-1,1]){K.B(.012,.4,.32,'glass',s*.468,1.79,.27,-.2,0,-s*.06);}
 K.T([[-.47,1.95,.12],[-.465,1.99,.27],[0,2.0,.306],[.465,1.99,.27],[.47,1.95,.12]],.012,'chrome',30,6);
 K.T([[-.5,FL+.4,.86],[-.5,FL+.62,.9],[.5,FL+.62,.9],[.5,FL+.4,.86]],.016,'chrome',24,6);
 for(const s of [-1,1])K.T([[s*.47,FL+.55,-.05],[s*.5,FL+.85,-.06],[s*.5,FL+.85,.7],[s*.47,FL+.55,.72]],.014,'chrome',24,6);
 // Sitz vor der Konsole
 K.B(.82,.42,.5,'hullW',0,FL+.21,1.12);K.B(.82,.09,.5,'cush',0,FL+.465,1.12);K.B(.82,.38,.09,'cush',0,FL+.7,.9);K.B(.84,.025,.52,'cushD',0,FL+.51,1.12);
 // Vordeck: Ankerkasten-Luke, Bugkorb, Bugbeschlag mit Anker, Klampen, Positionslichter
 K.B(.52,.035,.46,'hullW',0,shA(2.4)+.075,2.4);K.B(.54,.01,.48,'rub',0,shA(2.4)+.058,2.4);K.B(.12,.025,.03,'chrome',0,shA(2.4)+.105,2.2);
 const rail=[];for(const s of [-1,1]){const zz=s<0?[1.75,2.3,2.85,3.2]:[3.2,2.85,2.3,1.75];for(const z of zz)rail.push([s*Math.max(.12,hwA(z)-.07),shA(z)+.44,z]);if(s<0)rail.push([0,shA(3.42)+.44,3.42]);}
 K.T(rail,.016,'chrome',60,6);for(const s of [-1,1])for(const z of [1.75,2.3,2.85,3.2]){const x=s*Math.max(.12,hwA(z)-.07);K.C(.013,.013,.44,'chrome',x,shA(z)+.22,z,8);}
 K.C(.013,.013,.44,'chrome',0,shA(3.42)+.22,3.42,8);
 K.B(.1,.07,.4,'steelD',0,shA(3.5)+.02,3.55);K.Cx(.03,.03,.1,'black',0,shA(3.5)+.03,3.74,10);K.B(.035,.16,.03,'steelD',0,shA(3.5)-.1,3.78);K.B(.16,.03,.06,'steelD',0,shA(3.5)-.18,3.78,0,0,0);
 const cleat=(x,y,z,ry=0)=>{K.B(.04,.025,.18,'chrome',x,y+.05,z,0,ry);K.C(.012,.014,.04,'chrome',x,y+.02,z+Math.cos(ry)*.05,8);K.C(.012,.014,.04,'chrome',x,y+.02,z-Math.cos(ry)*.05,8);};
 for(const s of [-1,1]){cleat(s*1.0,shA(-2.7),-2.7);cleat(s*(hwA(.3)-.05),shA(.3),.3);cleat(s*.32,shA(2.95)+.04,2.95,s*.4);}
 {const z=2.65,S=boatSec(z);K.B(.02,.05,.13,'navR',S.hw*.99+.012,S.sh-.1,z,0,-.35);K.B(.02,.05,.13,'navG',-S.hw*.99-.012,S.sh-.1,z,0,.35);}
 K.C(.014,.014,.75,'chrome',.92,shA(-2.85)+.37,-2.85,8);K.S(.03,'navW',.92,shA(-2.85)+.77,-2.85,1,1.3,1);
 // Außenborder (2×): Halterung, Haube mit Zierstreifen, Schaft, Getriebe, Propeller
 for(const x of [-.43,.43]){K.B(.22,.32,.2,'engG',x,.98,-3.1);K.B(.44,.55,.7,'eng',x,1.27,-3.36);K.S(.3,'eng',x,1.53,-3.36,.73,.38,1.17,16,10);K.B(.452,.06,.52,'paint',x,1.24,-3.38);
  K.B(.3,.06,.08,'engG',x,1.08,-3.72);K.B(.17,.76,.3,'engG',x,.62,-3.32);K.B(.36,.022,.46,'engG',x,.09,-3.33);K.Cz(.07,.07,.46,'engG',x,-.02,-3.32,12);K.S(.07,'engG',x,-.02,-3.1,1,1,.8,12,8);
  K.B(.02,.26,.16,'engG',x,-.17,-3.38);K.C(.035,.03,.06,'steelD',x,-.02,-3.58,10,Math.PI/2);for(let b=0;b<3;b++){const a=b*Math.PI*2/3;K.B(.2,.012,.07,'steelD',x+Math.cos(a)*.1,-.02+Math.sin(a)*.1,-3.6,.3,0,a);}
  K.B(.12,.05,.06,'black',x,.95,-3.25);}
 // Badeplattformen (Teak) + Badeleiter
 for(const s of [-1,1])K.B(.4,.05,.36,'wood',s*.9,.4,-3.18);K.B(.42,.02,.38,'rub',.9,.37,-3.18);
 K.T([[-.78,.42,-3.32],[-.78,.05,-3.36],[-.78,-.3,-3.36]],.012,'chrome',8,6);K.T([[-1.0,.42,-3.32],[-1.0,.05,-3.36],[-1.0,-.3,-3.36]],.012,'chrome',8,6);
 for(const y of [.1,-.12])K.B(.24,.02,.04,'chrome',-.89,y,-3.36);
 BOATGEO=K.done(VPLANAR);BOATGEO.userData.keys=K.keys;return BOATGEO;}
function boatMats(pm){return BOATGEO.userData.keys.map(k=>k==='paint'?pm:VMAT[k]);}
function boatRegDecals(body){const m=new THREE.MeshBasicMaterial({map:VTX.reg,transparent:true,depthWrite:false,toneMapped:true});
 for(const s of [-1,1]){const z=2.15,S=boatSec(z),dw=(bInt(BOATHW,z+.1)-bInt(BOATHW,z-.1))/.2;const p=new THREE.Mesh(new THREE.PlaneGeometry(.9,.17),m);p.position.set(s*(S.hw*.955+.014),S.sh-.55,z);p.rotation.y=s*(Math.PI/2+Math.atan(dw));body.add(p);}}
