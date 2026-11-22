'use strict';
// ---------- Solara Nationalbank ----------
function buildBankInterior(info,sp){const {cx,cz}=info,bz=cz+4,F=IF,x0=cx-21,x1=cx+21,z0=bz-16,z1=bz+16,H=6.5;
 // Hülle: Halle (Marmor), Front mit großen Fenstern + Schiebetüren, Notausgang hinten
 iRoom({x0,x1,z0,z1,h:H,floor:IM.marble,floorT:[2.4,2.4],ceil:IM.plaster,outMat:IMB.stone,inMat:IMB.stone,outSide:[3,3],inSide:[3,3],base:IM.marbleD,frame:IM.darkM,
  walls:{s:[{c:cx,w:4.4,h:3.6},{c:cx-5.4,w:2.6,y:.9,h:3.6,glass:true},{c:cx+5.4,w:2.6,y:.9,h:3.6,glass:true},{c:cx-11,w:4.6,y:.9,h:3.6,glass:true,mull:true},{c:cx+11,w:4.6,y:.9,h:3.6,glass:true,mull:true},{c:cx-17.3,w:4.6,y:.9,h:3.6,glass:true,mull:true},{c:cx+17.3,w:4.6,y:.9,h:3.6,glass:true,mull:true}],
   n:[{c:cx+18.2,w:1.35,h:2.4}],w:[{c:bz+9,w:3,y:1.2,h:3,glass:true},{c:bz+3,w:3,y:1.2,h:3,glass:true}],e:[{c:bz+9,w:3,y:1.2,h:3,glass:true},{c:bz+3,w:3,y:1.2,h:3,glass:true}]}});
 for(const s of [[x0,x1,z0-.2,z0+.2],[x0,x1,z1-.2,z1+.2],[x0-.2,x0+.2,z0,z1],[x1-.2,x1+.2,z0,z1]]){const so=addSolid(s[0],s[1],s[2],s[3],29);so.camOnly=true;}
 bldgTop(cx,bz,42,32,22,6.8,MATS.office[2]);
 // Marmorleiste innen auf halber Höhe, Kassettendecke
 for(const [a,b,c,d] of [[x0+.16,x1-.16,z0+.16,z0+.2],[x0+.16,x1-.16,z1-.2,z1-.16],[x0+.16,x0+.2,z0+.16,z1-.16],[x1-.2,x1-.16,z0+.16,z1-.16]])addStatic(boxG(b-a,.25,d-c),IM.gold,(a+b)/2,F+5.6,(c+d)/2,0,1,1,1,{noShadow:true});
 for(let x=x0+3.5;x<x1-1;x+=7)addStatic(boxG(.35,.35,z1-(bz-1.6)),IM.white,x,F+H-.35,(z1+bz-1.6)/2,0,1,1,1,{noShadow:true});for(let z=bz-1.6+3;z<z1;z+=5)addStatic(boxG(x1-x0,.35,.35),IM.white,cx,F+H-.35,z,0,1,1,1,{noShadow:true});
 const I=regInterior({name:'bank',x0,x1,z0,z1,ceil:F+H});
 // Eingang: Schiebetüren, Sicherheitsschleusen, Läufer, Logo im Boden
 sp.doorMain=iDoor({x:cx,z:z1,axis:'x',w:4.3,h:3.5,type:'slide',r:4});
 iDoor({x:cx+18.2,z:z0,axis:'x',w:1.3,h:2.35,type:'swing',mat:IM.steel,hinge:1,inward:-1,r:2.4});
 {const k=IK(cx,z1-3.2);for(const s of [-1,1]){const d=sub(k,s*1.15,0);pMetalDetector(d);}}
 {const k=IK(cx,bz+6);k.c(0,.005,0,2.2,.012,IM.marbleD);k.b(0,.008,0,2.6,.006,2.6,IM.logoBank,{top:[2.6,2.6]});}
 {const k=IK(cx,z1-3);k.b(0,.01,0,3,.012,5.4,IM.carpetR,{top:[3,3]});const k2=IK(cx,bz+1.6);k2.b(0,.01,0,3,.012,6,IM.carpetR,{top:[3,3]});}
 // Säulen, Kronleuchter
 for(const x of [cx-11,cx+11])for(const z of [bz+4,bz+10]){pColumn(IK(x,z),.55,H);}
 pChandelier(cx-6,F+H,bz+7,1.15);pChandelier(cx+6,F+H,bz+7,1.15);iLight(I,cx-6,F+H-1.6,bz+7,70,20,0xffe2b0);iLight(I,cx+6,F+H-1.6,bz+7,70,20,0xffe2b0);
 // Wartebereich links + Geldautomaten + Kursanzeige
 {pBench(IK(cx-18.6,bz+8.2,Math.PI/2),2.6);pBench(IK(cx-15.2,bz+8.2,-Math.PI/2),2.6);pCoffeeTable(IK(cx-16.9,bz+8.2,Math.PI/2),1.2,.6);pPlant(IK(cx-19.8,bz+5.3),1.3);pPlant(IK(cx-19.8,bz+11.2),1.3);
  const t=IK(x0+.17,bz+8.2,Math.PI/2);t.b(0,2.2,0,3.4,.6,.05,IM.black);t.b(0,2.24,.03,3.3,.52,.005,IM.ticker);pPicture(IK(x0+.17,bz+2.4,Math.PI/2),2,1.4,IM.art1,2.6);
  for(let i=0;i<3;i++)pATM(IK(x0+.45,z1-2.4-i*1.15,Math.PI/2));}
 // Infotheke rechts
 {const k=IK(cx+17.2,bz+10,-Math.PI/2);k.b(0,0,0,3.2,1.05,.7,IMB.panel);k.b(0,1.05,0,3.3,.05,.8,IM.marble);k.b(0,1.1,-.1,.5,.32,.04,IM.gloss);k.b(0,1.12,-.08,.46,.28,.004,IM.pc);k.b(.9,1.1,.15,.22,.25,.12,IM2.paper);k.s(0,0,3.2,.8,1.1);pPlant(IK(cx+19.8,bz+12.8),1.2);pPicture(IK(x1-.17,bz+3,-Math.PI/2),2.2,1.5,IM.art2,2.7);iStaff(cx+18.6,bz+10,-Math.PI/2,'idle',{oberteil:5,oberteilfarbe:1,hose:4,hosenfarbe:1});}
 // Schlangen-Absperrung, Schalterhalle mit Glas
 pStanchions(IK(cx-2,bz+1.2),16,9);
 {const k=IK(cx-1,bz-2);const L=26;k.b(0,0,0,L,1.08,.75,IMB.panel);k.b(0,1.08,.05,L+.1,.06,.9,IM.marble);for(let i=0;i<6;i++){const x=-L/2+L/6*(i+.5);k.b(x,.12,.38,L/6-.12,.85,.01,IM.walnut);
   k.b(x,1.14,-.05,.04,1.35,.04,IM.brass);k.b(x+L/12,1.14,-.05,.06,1.35,.06,IM.brass);k.b(x,1.14,-.05,L/6-.1,1.3,.03,IM.glass);k.b(x,1.14,.25,.5,.012,.3,IM2.paper,{ry:.1});k.b(x,2.5,-.05,L/6,.12,.08,IM.brass);
   const num=canvasTex(64,32,(g)=>{g.fillStyle='#0d2a4a';g.fillRect(0,0,64,32);g.fillStyle='#f2d06b';g.font='bold 22px Georgia';g.textAlign='center';g.fillText(String(i+1),32,24);});k.b(x,2.62,-.05,.32,.16,.02,M({map:num,emissive:0xffffff,emissiveMap:num,emissiveIntensity:.5}));}
  k.s(0,0,L,.9,1.2);}
 // Abtrennung mit Durchgang (Tür) rechts, Glaswand links
 {const k=IK(cx+13.175,bz-2);k.b(0,0,0,2.35,1.08,.75,IMB.panel);k.b(0,1.08,0,2.41,.06,.85,IM.marble);k.s(0,0,2.35,.75,1.2);const k2=IK(cx+18.325,bz-2);k2.b(0,0,0,5.35,1.08,.75,IMB.panel);k2.b(0,1.08,0,5.45,.06,.85,IM.marble);k2.b(0,1.14,0,5.35,1.2,.04,IM.glass);k2.s(0,0,5.35,.75,2.3);
  iDoor({x:cx+15,z:bz-2,axis:'x',w:1.3,h:1.05,type:'swing',mat:IMB.panel,hinge:-1,inward:-1,r:1.8});
  const k3=IK(cx-17.5,bz-2);k3.b(0,0,0,7,1.08,.75,IMB.panel);k3.b(0,1.08,0,7.1,.06,.85,IM.marble);k3.b(0,1.14,0,7,1.2,.04,IM.glass);k3.s(0,0,7,.75,2.3);}
 // Personal hinter dem Schalter + Arbeitsplätze
 for(let i=0;i<4;i++){const x=cx-1-13+26/6*(i+1.5);iStaff(x,bz-3.1,0,'type',{oberteil:3,oberteilfarbe:[0,3,10,0][i],hose:4,hosenfarbe:1});const ch=sub(IK(x,bz-3.4),0,0,0);ch.b(0,.44,0,.44,.06,.44,IM.leatherB);ch.c(0,.06,0,.025,.38,IM.chrome);}
 for(const x of [cx-12,cx-5,cx+2,cx+9]){const d=IK(x,bz-6.6,Math.PI);pDesk(d,1.5,true);pOfficeChair(IK(x,bz-5.6,Math.PI));}
 for(let i=0;i<6;i++)pFileCab(IK(cx-19.5+i*.55,bz-8.45),1.3);pPlant(IK(cx+19.7,bz-8.2),1.1);
 {const k=IK(cx+16.5,bz-7.6);k.b(0,0,0,1.6,.75,.7,IM.white);k.b(0,.75,0,1.65,.04,.75,IM.marbleD);k.b(-.4,.79,0,.5,.32,.45,IM.black);k.b(-.4,1.11,-.05,.42,.02,.3,IM2.paper);k.b(.35,.79,0,.42,.26,.36,IM.greyM);k.b(.35,.95,.18,.3,.06,.005,IM.led);k.s(0,0,1.6,.7,1);}
 pCashCart(IK(cx+4.6,bz-7.8,-.3));pCashCart(IK(cx-4.6,bz-7.8,.3));iLight(I,cx,F+5,bz-5,45,16);
 // Hintere Räume: Sicherheitsraum | Tresor | Direktorbüro
 const ZB=bz-9,RH=3.6;
 const RW={h:RH,t:.3,F,inMat:IM.plaster,outMat:IMB.stone,base:IM.marbleD};
 iWall(x0,ZB,x1,ZB,Object.assign({},RW,{inDir:1,inMat:IMB.stone,outMat:IM.plaster,ops:[{c:cx-15,w:1.3,h:2.3},{c:cx,w:3.3,h:3.3},{c:cx+15,w:1.3,h:2.3}]}));
 addStatic(boxG(x1-x0,H-RH,.3),IMB.stone,cx,F+RH,ZB,0,1,1,1,{noShadow:true});
 iWall(cx-9,z0,cx-9,ZB,Object.assign({},RW,{t:.6,inMat:IM.concrete,outMat:IM.plaster,inDir:1}));iWall(cx+9,z0,cx+9,ZB,Object.assign({},RW,{t:.6,inMat:IM.concrete,outMat:IM.plaster,inDir:-1}));
 addStatic(boxG(x1-x0-.6,.1,ZB-z0),IM.plaster,cx,F+RH,(ZB+z0)/2,0,1,1,1,{noShadow:true});
 regInterior({name:'bank-sec',x0,x1:cx-9,z0,z1:ZB,ceil:F+RH});const IV=regInterior({name:'bank-vault',x0:cx-9,x1:cx+9,z0,z1:ZB,ceil:F+RH});regInterior({name:'bank-office',x0:cx+9,x1,z0,z1:ZB,ceil:F+RH});
 // Tresortür (rund, nur per Mission zu öffnen)
 sp.vaultDoor=iDoor({x:cx,z:ZB+.32,axis:'x',w:3.2,h:3.2,type:'vault',hinge:-1,inward:-1,lock:true});
 {const k=IK(cx,ZB+.3);k.g(TORUS,IM.darkM,0,1.6,.02,1.72,1.72,.6);for(const s of [-1,1])k.b(s*2.4,0,.05,.6,RH,.12,IM.darkM);k.b(0,3.3,.05,5.4,.3,.12,IM.darkM);const sg=canvasTex(256,48,(g)=>{g.fillStyle='#1a1d22';g.fillRect(0,0,256,48);g.fillStyle='#f2d06b';g.font='bold 28px Georgia';g.textAlign='center';g.fillText('TRESOR',128,34);});k.b(0,3.32,.12,1.6,.26,.01,M({map:sg,roughness:.4}));pCamera(IK(cx+2.6,ZB+.2),3.3);}
 // Tresorraum: Schließfächer, Bargeld, Gold
 {for(const [a,b,c,d,ry] of [[cx-8.65,cx-8.6,z0+.3,ZB-.3,Math.PI/2],[cx+8.6,cx+8.65,z0+.3,ZB-.3,-Math.PI/2]]){const L=d-c;const k=IK((a+b)/2,(c+d)/2,ry);k.b(0,0,0,L,3.2,.1,IM.deposit,{side:[1.2,1.2]});}
  {const k=IK(cx,z0+.2);k.b(0,0,0,17.2,3.2,.1,IM.deposit,{side:[1.2,1.2]});}
  const t=IK(cx,bz-13.1);t.b(0,0,0,2.4,.9,1.2,IM.steel);t.b(0,.9,0,2.5,.04,1.3,IM.darkM);pCashStack(sub(t,-.6,0),9);const g2=sub(t,.6,0);g2.b(0,.94,0,.01,.001,.01,IM.gold);pGold(IK(cx+.6,bz-13.1,0,F+.94));t.s(0,0,2.4,1.2,1);
  for(const [x,z] of [[cx-5.5,bz-13.6],[cx+5.5,bz-13.6],[cx-5.5,bz-10.7],[cx+5.5,bz-10.7]]){const p=IK(x,z);p.b(0,0,0,1.2,.14,1,IM2.wood2);pCashStack(IK(x-.2,z-.25,0,F+.14),9);pCashStack(IK(x+.2,z+.2,0,F+.14),6);p.s(0,0,1.2,1,.6);}
  pCashCart(IK(cx-6.6,ZB-1.2,0));iLight(IV,cx,F+3.1,bz-12,20,11,0xe8f2ff);iLampPanel(cx,F+RH,bz-12.5,3,1,IM.lampW);iLampPanel(cx-5,F+RH,bz-12.5,1.2,1.2,IM.lampW);iLampPanel(cx+5,F+RH,bz-12.5,1.2,1.2,IM.lampW);}
 // Sicherheitsraum: Monitorwand, Pult, Serverschrank
 {const k=IK(cx-15,z0+.2);for(let i=0;i<3;i++)for(let r=0;r<2;r++){k.b(-2.1+i*2.1,1.35+r*1.05,.05,1.9,.95,.08,IM.black);k.b(-2.1+i*2.1,1.39+r*1.05,.095,1.82,.86,.005,IM.cctv);}
  k.b(0,0,1.3,5,.78,.8,IM.darkM);k.b(0,.78,1.3,5.1,.04,.85,IM.black);for(let i=0;i<4;i++)k.b(-1.8+i*1.2,.82,1.3,.5,.02,.18,IM.black);k.s(0,1.3,5,.8,.85);pOfficeChair(IK(cx-16,bz-12.6,Math.PI));pOfficeChair(IK(cx-14,bz-12.6,Math.PI));
  const sr=IK(cx-20.4,bz-12.5,Math.PI/2);sr.b(0,0,0,1,2.1,.8,IM.black);for(let i=0;i<14;i++)sr.b(-.3+((i%2)*.6),.2+(i>>1)*.27,.41,.04,.02,.01,i%3?IM.led:IM.ledR);sr.s(0,0,1,.8,2.1);
  iLampPanel(cx-15,F+RH,bz-12.5,2.2,1.2,IM.lampW);iLight(I,cx-15,F+3,bz-12.5,22,9,0xdfe8ff);iStaff(cx-15,bz-12.6,Math.PI,'type',{oberteil:3,oberteilfarbe:11,hose:4,hosenfarbe:1});}
 // Direktorbüro: Schreibtisch, Ledersessel, Regal, Safe, Akten (Spionage-Ziel)
 {const ox=cx+15,oz=bz-12.5;pRug(IK(ox,oz+.4),4,3,IM.carpetR);pDesk(IK(ox,oz-1.2,0),1.9,true);pOfficeChair(IK(ox,oz-2.0,0),IM.leather);for(const s of [-1,1])pArmchair(sub(IK(ox+s*.8,oz+.9,Math.PI),0,0),IM.leather);
  pBookshelf(IK(x1-.4,oz-1,-Math.PI/2),2.2,2.2);pSafe(IK(x1-.55,oz+2.3,-Math.PI/2));pPlant(IK(cx+9.6,z0+.6),1.1);pPicture(IK(ox,z0+.2),2,1.3,IM.art1,2.1);pFileCab(IK(cx+9.7,oz+1.2,Math.PI/2),1.3);
  iLampPanel(ox,F+RH,oz,2,1.2,IM.lampY);iLight(I,ox,F+3,oz,22,9,0xffe8c8);iStaff(ox,oz-2.0,0,'type',{oberteil:5,oberteilfarbe:2,hose:4,hosenfarbe:1,frisur:6});sp.office={x:ox,z:oz-.6};sp.officeDesk={x:ox,z:oz-1.2};sp.bugSpot={x:ox,z:oz-.2};}
 // Wanduhr, Logo, Kameras, Lichtfelder
 pClock(IK(cx-1,ZB+.17),2.95);{const k=IK(cx-8,ZB+.17);k.b(0,1.8,0,1.4,1.4,.05,IM.logoBank);}for(const [x,z,r] of [[x0+.3,z1-.3,-Math.PI*.75],[x1-.3,z1-.3,Math.PI*.75],[x0+.3,bz-1,-Math.PI/4],[x1-.3,bz-1,Math.PI/4]])pCamera(IK(x,z,r),5.7);
 for(const x of [cx-15,cx+15])iLampPanel(x,F+H,bz+7,2.4,2.4,IM.lampY);iLight(I,cx-15.5,F+5.5,bz+9,40,16,0xffe2b0);iLight(I,cx+15.5,F+5.5,bz+9,40,16,0xffe2b0);
 iStaff(cx+3.2,z1-3.6,Math.PI,'idle',{oberteil:2,oberteilfarbe:1,hose:4,hosenfarbe:1,extra:2});
 sp.vault={x:cx,z:bz-10.9};sp.vaultApproach={x:cx,z:ZB+2.6};sp.lobby={x:cx,z:bz+6};sp.backdoor={x:cx+18.2,z:z0-1.6};sp.gate={x:cx+15,z:bz-2};sp.gateIn={x:cx+15,z:bz-3.4};sp.counter={x:cx-4,z:bz-.6};sp.security={x:cx-15,z:bz-12};sp.server={x:cx-19.3,z:bz-12.5};sp.photo={x:cx-2,z:bz+.5};sp.outside={x:cx,z:z1+4};sp.front={x:cx,z:z1-2};sp.staffArea={x:cx,z:bz-5};sp.director={x:cx+15,z:bz-14.5};sp.x0=x0;sp.x1=x1;sp.z0=z0;sp.z1=z1;sp.ZB=ZB;sp.cx=cx;sp.bz=bz;
 {const P2=Math.PI,H2=P2/2,W=i=>cx-1-13+26/6*(i+.5);
  ipVenue({id:'bank',kind:'bank',name:'Nationalbank',x0,x1,z0,z1,zone:'bank',cls:['rich','rich','mid'],cash:[1800,3200],wantA:2,wantR:3,metal:{x:cx,z:z1-3.2},
   exits:[[cx,z1-1.6,cx,z1+5.5],[cx+18.2,z0+1.4,cx+18.2,z0-3.5]],anchor:[W(2),bz-3.1],
   cust:[[W(1),bz-1,P2,'wait'],[W(3),bz-1,P2,'chat'],[W(4),bz-1,P2,'wait','bags'],[cx-6.4,bz+2.3,P2,'phone','phone'],[cx-6.1,bz+3.3,P2,'wait'],
    [cx-18.6,bz+7.6,H2,'sitb'],[cx-18.6,bz+8.8,H2,'read','news'],[cx-15.2,bz+7.8,-H2,'sitPhone','phone'],[cx-15.2,bz+9,-H2,'sit'],
    [x0+1.25,z1-2.4,-H2,'type'],[x0+1.25,z1-3.55,-H2,'type'],[cx+15.9,bz+10,H2,'chat'],[cx+8.6,bz+12.2,P2,'look','case']],ncust:[7,10],
   walk:[[cx-7,bz+11,H2,'phone'],[cx+6,bz+9.5,0,'wait'],[cx-13.5,bz+5.5,-H2,'look'],[cx-2,bz+6.5,P2,'wait'],[cx+13.5,bz+5,H2,'look'],[x0+1.25,z1-4.7,-H2,'type'],[cx+4,bz+13,P2,'look'],[cx+14.8,bz+8.5,H2,'wait']],nstroll:2,
   staffX:[[cx-12,bz-5.6,P2,'sitType'],[cx+2,bz-5.6,P2,'sitType']],staffSkin:{oberteil:3,oberteilfarbe:0,hose:4,hosenfarbe:1},
   guards:[[cx-3.3,z1-5.2,0,'pistol'],[cx+9.6,bz+6,-H2,'pistol'],[cx+12.8,bz-4.6,0,'smg'],[cx-1.8,ZB+1.4,0,'smg'],[cx-9.6,bz+4,H2,'pistol'],[cx-3,bz+12.6,P2,'shotgun']],gBase:2});}
 addPlace('bank',sp.name,cx-4,bz-.4,{label:'Bk',col:'#f2d06b',r:0});}
// ---------- Deine Wohnung ----------
function buildApartment(hx,hz){const F=IF,x0=hx-11,x1=hx+11,z0=hz-8,z1=hz+8,H=3.2,L=(lx,lz)=>[hx+lx,hz+lz];
 iRoom({x0,x1,z0,z1,h:H,floor:IM.parquet,floorT:[2.6,2.6],ceil:IM.plaster,outMat:IM.plasterBe,inMat:IM.plaster,outSide:[3,3],inSide:[3,3],base:IM.white,frame:IM.whiteP,
  walls:{s:[{c:hx+6,w:1.3,h:2.3},{c:hx-6,w:2.2,y:.9,h:1.6,glass:true,mull:true},{c:hx-1.5,w:2.2,y:.9,h:1.6,glass:true,mull:true},{c:hx+9,w:1,y:1.2,h:1.1,glass:true}],
   w:[{c:hz-4,w:1.8,y:1.05,h:1.3,glass:true},{c:hz+4,w:2,y:.9,h:1.6,glass:true,mull:true}],e:[{c:hz-4.5,w:2,y:.9,h:1.5,glass:true,mull:true},{c:hz+2.5,w:.8,y:1.6,h:.6,glass:true}],n:[{c:hx-9.1,w:1.6,y:1.1,h:1.1,glass:true}]}});
 for(const s of [[x0,x1,z0-.2,z0+.2],[x0,x1,z1-.2,z1+.2],[x0-.2,x0+.2,z0,z1],[x1-.2,x1+.2,z0,z1]]){const so=addSolid(s[0],s[1],s[2],s[3],16);so.camOnly=true;}
 bldgTop(hx,hz,22,16,11.4,3.6,MATS.plaster[3]);
 const I=regInterior({name:'wohnung',x0,x1,z0,z1,ceil:F+H});
 iDoor({x:hx+6,z:z1,axis:'x',w:1.25,h:2.25,type:'swing',mat:IM.walnut,hinge:1,inward:-1,r:2.6});
 // Innenwände (Schlafzimmer, Bad) mit Türen
 const IW={h:H,t:.14,F,inMat:IM.plaster};
 iWall(hx+2,hz-1,hx+7,hz-1,Object.assign({},IW,{ops:[{c:hx+3.5,w:1.25,h:2.1}]}));
 iWall(hx+7,hz-1,hx+11,hz-1,Object.assign({},IW,{outMat:IM.plaster,inMat:IM.wtile,inDir:1}));
 iWall(hx+2,hz-8,hx+2,hz-1,IW);
 iWall(hx+7,hz-1,hx+7,hz+4,Object.assign({},IW,{outMat:IM.plaster,inMat:IM.wtile,inDir:1}));
 iWall(hx+7,hz+4,hx+11,hz+4,Object.assign({},IW,{outMat:IM.plaster,inMat:IM.wtile,inDir:-1,ops:[{c:hx+8.7,w:1.25,h:2.1}]}));
 iDoor({x:hx+3.5,z:hz-1,axis:'x',w:1.22,h:2.08,type:'swing',mat:IM.white,hinge:-1,inward:-1,r:1.8});iDoor({x:hx+8.7,z:hz+4,axis:'x',w:1.22,h:2.08,type:'swing',mat:IM.white,hinge:1,inward:-1,r:1.8});
 {const k=IK(hx+10.98,hz+1.5,-Math.PI/2);k.b(0,0,0,5,2.2,.02,IM.wtile,{side:[.5,.5]});const fl=IK(hx+9,hz+1.5);fl.b(0,.002,0,4,.01,5,IM.tiles,{top:[.8,.8]});}
 // Wohnzimmer
 pRug(IK(hx-8.2,hz+4,Math.PI/2),3.2,3.6);pTVUnit(IK(x0+.45,hz+4,Math.PI/2),2.2);pSofa(IK(hx-4.4,hz+4,-Math.PI/2),2.6,IM.fabG,IM.fabR);pCoffeeTable(IK(hx-7.2,hz+4,Math.PI/2),1.2,.62);
 pArmchair(IK(hx-7.5,z1-.9,Math.PI),IM.fabBe);pBookshelf(IK(hx-9.5,z1-.35,Math.PI),1.6,2.1);pFloorLamp(IK(x0+.5,z1-.5));pPlant(IK(hx+1.4,z1-.5),1.1);pPlant(IK(x0+.5,hz+.6),1.2);
 pPendant(hx-7.2,F+H,hz+4);pPicture(IK(hx+1.93,hz+1.6,-Math.PI/2),1.2,.9,IM.art2,1.7);
 {const k=IK(x0+.4,hz+4,Math.PI/2);k.b(.75,.52,.05,.3,.05,.2,IM.black);k.b(-.75,.52,.05,.2,.25,.2,IM.white);}
 // Küche
 pKitchenRun(IK(hx-7.6,z0+.47,0),6.4,{sink:-1.5,hob:1.6,upper:6.4});pFridge(IK(hx-3.85,z0+.5));pIsland(IK(hx-7.4,hz-4.6),2.4);pDining(IK(hx-1.4,hz-4.2,Math.PI/2),1.6,.9,4);
 pPendant(hx-7.4,F+H,hz-4.6);pPendant(hx-6.4,F+H,hz-4.6);pPendant(hx-1.4,F+H,hz-4.2);pClock(IK(hx+1.93,hz-4.5,-Math.PI/2),2.3);pPlant(IK(x0+.45,hz-1.2),.9,IM2.potT);
 // Flur
 pCoatRack(IK(x1-.45,z1-.45));{const k=IK(hx+10.6,hz+5.7,-Math.PI/2);k.b(0,0,0,1.4,.5,.36,IM.oak);k.b(0,.5,0,1.42,.02,.38,IM.walnut);k.c(.3,.52,0,.12,.08,IM.ceramic);k.b(-.3,.52,0,.12,.02,.07,IM.brass);k.s(0,0,1.4,.36,.6);}
 {const k=IK(hx+7.6,hz+4.1,0);k.b(0,.9,0,.9,1.4,.03,IM.mirror);k.b(0,.85,0,1,1.5,.02,IM.walnut);}pRug(IK(hx+6,hz+6),1.1,2.6,IM.carpetG);pPlant(IK(hx+4.4,z1-.5),.8);
 // Bad
 pVanity(IK(hx+9.1,hz-.62,0),.9);pToilet(IK(x1-.55,hz+1.2,-Math.PI/2));pShower(IK(x1-.62,hz+3.35,Math.PI),1,1);pWasher(IK(hx+7.45,hz+3.3,Math.PI/2));pTowelRack(IK(hx+7.1,hz+1.2,Math.PI/2));
 // Schlafzimmer
 pBed(IK(hx+6.6,z0+1.2,0),1.8,2.1);pWardrobe(IK(hx+2.4,hz-5.6,Math.PI/2),2,2.2,.6);pDesk(IK(x1-.5,hz-2.5,-Math.PI/2),1.3,true);pOfficeChair(IK(x1-1.2,hz-2.5,-Math.PI/2));pRug(IK(hx+6.6,hz-4),2.6,1.9);pPicture(IK(hx+6.6,z0+.17),1.6,.9,IM.art1,2.05);pPlant(IK(hx+2.5,hz-1.6),.8);
 // Licht
 for(const [x,z,i] of [[hx-7,hz+4,26],[hx-6,hz-4.5,26],[hx+6.5,hz-4.6,20],[hx+8,hz+3,14]]){iLight(I,x,F+H-.25,z,i,11,0xffe9cc);}
 iLampPanel(hx+6.5,F+H,hz-4.6,.8,.8,IM.lampY);iLampPanel(hx+9,F+H,hz+1.5,.6,.6,IM.lampW);iLampPanel(hx+8,F+H,hz+6,.5,.5,IM.lampY);
 return {door:{x:hx+6,z:z1+.9},bed:{x:hx+6.6,z:z0+3.25},inside:{x:hx+5,z:hz+5.5}};}
// ---------- Garage neben der Wohnung ----------
function buildHomeGarage(gx,gz){const F=IF,H=4.2;iRoom({x0:gx-6,x1:gx+6,z0:gz-6,z1:gz+6,h:H,floor:IM.concrete,floorT:[3,3],ceil:IM.darkM,outMat:MATS.warehouse[0],inMat:IM.plasterBl,outSide:[30,12],inSide:[3,3],walls:{s:[{c:gx,w:9,h:3.8}]}});
 addStatic(boxG(12.4,.4,12.4),roofMat,gx,F+H+.1,gz);addSolid(gx-6.2,gx+6.2,gz-6.2,gz-5.8,5.2);
 const I=regInterior({name:'garage',x0:gx-6,x1:gx+6,z0:gz-6,z1:gz+6,ceil:F+H});
 iDoor({x:gx,z:gz+6,axis:'x',w:8.9,h:3.75,type:'roll',car:true,r:4});
 pWorkbench(IK(gx-2.5,gz-5.45),3);pToolWall(IK(gx-2.5,gz-5.82),3,1.2);pShelfUnit(IK(gx+4.2,gz-5.4),2.6,2.2);pTyreStack(IK(gx+5.2,gz-2.6),4);pDrum(IK(gx+5.3,gz-.9),IM2.oilRed);pToolChest(IK(gx-5.4,gz-3.4,Math.PI/2));
 pFluoro(gx-2,F+H,gz-2,3,true);pFluoro(gx+2,F+H,gz+2,3,true);iLight(I,gx,F+H-.4,gz,30,12,0xeef4ff);}
// ---------- Milas Werkstatt ----------
function buildWerkstatt(cx,cz){const F=IF,bx=cx,bz=cz-6,x0=bx-20,x1=bx+20,z0=bz-14,z1=bz+14,H=8.7;
 iRoom({x0,x1,z0,z1,h:H,floor:IM.concrete,floorT:[8,8],ceil:IM.darkM,outMat:MATS.plaster[6],inMat:IM.plasterBl,outSide:[16,24],inSide:[3,3],
  walls:{s:[{c:bx-10,w:8,h:5.2},{c:bx+10,w:8,h:5.2},{c:bx+18.3,w:1.3,h:2.3}],w:[{c:bz-4,w:6,y:5.6,h:1.8,glass:true,mull:true},{c:bz+6,w:6,y:5.6,h:1.8,glass:true,mull:true}],e:[{c:bz+4,w:5,y:5.6,h:1.8,glass:true,mull:true}],n:[{c:bx-6,w:8,y:5.6,h:1.8,glass:true,mull:true}]}});
 addStatic(boxG(40.5,.7,28.5),roofMat,bx,F+H+.3,bz);for(const s of [[x0,x1,z0-.2,z0+.2],[x0,x1,z1-.2,z1+.2],[x0-.2,x0+.2,z0,z1],[x1-.2,x1+.2,z0,z1]]){const so=addSolid(s[0],s[1],s[2],s[3],10);so.camOnly=true;}
 for(let x=x0+5;x<x1;x+=10)addStatic(boxG(.35,.6,z1-z0),IM.darkM,x,F+H-.6,bz,0,1,1,1,{noShadow:true});
 const I=regInterior({name:'werkstatt',x0,x1,z0,z1,ceil:F+H});
 iDoor({x:bx-10,z:z1,axis:'x',w:7.9,h:5.15,type:'roll',car:true,r:4.5});iDoor({x:bx+10,z:z1,axis:'x',w:7.9,h:5.15,type:'roll',car:true,r:4.5});iDoor({x:bx+18.3,z:z1,axis:'x',w:1.25,h:2.25,type:'swing',mat:IM.steel,hinge:1,inward:-1,r:2.4});
 // Bodenmarkierungen
 for(const xc of [bx-10,bx+10]){for(const s of [-1,1])addStatic(boxG(.12,.006,13),IM.yellow,xc+s*3.4,F+.004,bz+3,0,1,1,1,{noShadow:true});addStatic(boxG(6.9,.006,.12),IM.yellow,xc,F+.004,bz-3.5,0,1,1,1,{noShadow:true});}
 // Bühne 1 mit angehobenem Auto, Bühne 2 frei
 pLift(IK(bx-10,bz+1),true);{const j=IK(bx-12.5,bz+5.5,.4);pJack(j);}pTyreStack(IK(bx-14.6,bz+7.4),3);iStaff(bx-9.2,bz+1.6,Math.PI,'work',{oberteil:2,oberteilfarbe:3,hose:1,hosenfarbe:1,extra:3});
 pLift(IK(bx+10,bz+1),false);pJack(IK(bx+6.6,bz+4,-.3));{const k=IK(bx+13.6,bz+6.2,-Math.PI/2);k.b(0,0,0,.9,.9,.9,IM.red);k.c(0,.9,0,.42,.08,IM.darkM);k.c(0,.98,0,.3,.04,IM.chrome);k.b(.32,.9,0,.08,.6,.08,IM.darkM);k.s(0,0,.9,.9,1.5);}
 // Rückwand: Werkbänke, Werkzeugwände, Werkzeugwagen, Kompressor, Regale
 pWorkbench(IK(bx-13,z0+.56),3.2);pToolWall(IK(bx-13,z0+.17),3.4,1.4);pWorkbench(IK(bx-6,z0+.56),3.2);pToolWall(IK(bx-6,z0+.17),3.4,1.4);pToolChest(IK(bx-1.5,z0+.5));pToolChest(IK(bx-.5,z0+.5,-.2));pCompressor(IK(bx+2.5,z0+.6));pHoist(IK(bx+5,z0+1.6,Math.PI*.15));
 pShelfUnit(IK(x0+.45,bz-8,Math.PI/2),3,2.4);pShelfUnit(IK(x0+.45,bz-4,Math.PI/2),3,2.4);pTyreRack(IK(x0+.5,bz+2.5,Math.PI/2),3.2);for(let i=0;i<4;i++)pDrum(IK(x0+.55+(i%2)*.65,bz+7+(i>>1)*.65),i%2?IM2.oilRed:IM2.oilBlue);
 {const k=IK(x0+.17,bz-6,Math.PI/2);pPicture(k,2.4,1.8,IM.car1,4.2);}{const k=IK(bx-9,z0+.17);pPicture(k,1.1,1.5,IM.cal,4.4);}
 // Büro (Glas) hinten rechts
 {const ox0=bx+12,oz1=bz-6;iWall(ox0,z0,ox0,oz1,{h:2.8,t:.1,F,inMat:IM.whiteP,ops:[{c:z0+3,w:4.5,y:1,h:1.5,glass:true}]});iWall(ox0,oz1,x1,oz1,{h:2.8,t:.1,F,inMat:IM.whiteP,ops:[{c:ox0+1.7,w:1.3,h:2.2},{c:ox0+5,w:4,y:1,h:1.5,glass:true}]});addStatic(boxG(x1-ox0,.08,oz1-z0),IM.whiteP,(ox0+x1)/2,F+2.8,(z0+oz1)/2,0,1,1,1,{noShadow:true});
  pDesk(IK(bx+16.5,z0+2.2,Math.PI),1.6,true);pOfficeChair(IK(bx+16.5,z0+1.3,Math.PI));pFileCab(IK(x1-.4,bz-8,-Math.PI/2),1.3);pSofa(IK(bx+13.2,z0+2.6,Math.PI/2),1.9,IM.leatherB,null);pPlant(IK(x1-.5,z0+.5),1);
  {const k=IK(bx+19.4,bz-12,-Math.PI/2);k.b(0,0,0,.9,.85,.5,IM.walnut);k.b(-.2,.85,0,.3,.38,.3,IM.black);k.c(.2,.85,0,.06,.12,IM.white);k.s(0,0,.9,.5,1.3);}{const k=IK(x1-.17,z0+3.5,-Math.PI/2);pPicture(k,1,1.4,IM.cal,1.7);}
  regInterior({name:'werkstatt-buero',x0:ox0,x1,z0,z1:oz1,ceil:F+2.8});iLampPanel(bx+16,F+2.8,z0+3.5,1.4,1.2,IM.lampW);iLight(I,bx+16,F+2.4,z0+4,20,8,0xeef4ff);}
 for(const xr of [bx-14,bx-6,bx+6,bx+14])for(const zr of [bz-6,bz+4])pFluoro(xr,F+H-.6,zr,4,false);
 iLight(I,bx-10,F+6.5,bz+1,55,20,0xeef4ff);iLight(I,bx+10,F+6.5,bz+1,55,20,0xeef4ff);iLight(I,bx-4,F+6.5,z0+4,40,16,0xeef4ff);
 {const P2=Math.PI,H2=P2/2;ipVenue({id:'werkstatt',kind:'garage',name:'Werkstatt',x0,x1,z0,z1,cls:['mid','poor'],rob:false,hub:true,
  exits:[[bx+18.3,z1-1.4,bx+18.3,z1+4],[bx+10,z1-2.2,bx+10,z1+5]],
  cust:[[bx+3.2,bz+9.4,-H2,'phone','phone'],[bx+13.55,z0+2.6,H2,'sitPhone','phone'],[bx-15.5,bz+4.5,H2,'look']],ncust:[1,2],walk:[],nstroll:0,
  staffX:[[bx-13,z0+1.45,P2,'type'],[bx+12.6,bz+6.2,H2,'type'],[bx+16.5,z0+1.3,0,'sitType']],staffSkin:{oberteil:2,oberteilfarbe:3,hose:1,hosenfarbe:1,extra:3},guards:[],gBase:0});}}
// ---------- Läden ----------
function shopShell(x,z,w,d,h,outMat,inMat,floor,ops,o={}){iRoom({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,h,floor,floorT:o.floorT||[2,2],ceil:o.ceil||IM.plaster,outMat,inMat,outSide:o.outSide||[16,24],inSide:[3,3],base:o.base||IM.black,frame:o.frame||IM.darkM,walls:{s:ops}});
 for(const s of [[x-w/2,x+w/2,z-d/2-.2,z-d/2+.2],[x-w/2,x+w/2,z+d/2-.2,z+d/2+.2],[x-w/2-.2,x-w/2+.2,z-d/2,z+d/2],[x+w/2-.2,x+w/2+.2,z-d/2,z+d/2]]){const so=addSolid(s[0],s[1],s[2],s[3],o.solidH||h+1.5);so.camOnly=true;}
 return regInterior({name:o.name||'laden',x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,ceil:IF+h});}
function buildGunshopInt(bx,bz,sp){const F=IF,H=4.3;const I=shopShell(bx,bz,18,12,H,MATS.brick[2],IM.plasterBe,IM.concrete,[{c:bx,w:1.8,h:2.5},{c:bx-5.5,w:4,y:.8,h:2,glass:true,mull:true},{c:bx+5.5,w:4,y:.8,h:2,glass:true,mull:true}],{name:'waffenladen',floorT:[3,3]});
 addStatic(boxG(18.5,.6,12.5),roofMat,bx,F+H+.05,bz);for(const s of [-1,1])for(let i=0;i<7;i++)addStatic(boxG(.04,2,.04),IM.darkM,bx+s*5.5-1.8+i*.6,F+.8,bz+6.18,0,1,1,1,{noShadow:true});
 iDoor({x:bx,z:bz+6,axis:'x',w:1.75,h:2.45,type:'swing',mat:IM.darkM,glass:true,hinge:-1,inward:-1,r:2.6});
 pGlassCounter(IK(bx-1,bz-1.4),6);for(let i=0;i<8;i++)pPistol(IK(bx-1,bz-1.4),-2.6+i*.72,.36,(i%2)*.12-.05,i%2?.4:-.3);{const k=IK(bx-1,bz-1.4);k.b(2.2,1.02,0,.38,.24,.3,IM.black);k.b(2.2,1.26,-.05,.32,.18,.03,IM.gloss,{rx:-.3});k.b(2.2,1.27,-.03,.28,.14,.004,IM.pc,{rx:-.3});}
 pGlassCounter(IK(bx+3.7,bz-3.2,-Math.PI/2),2.6);iStaff(bx-1,bz-2.7,0,'idle',{oberteil:4,oberteilfarbe:1,hose:0,hosenfarbe:1,extra:6,statur:2});
 for(const [a,b,c,e] of [[bx-8.84,bx-8.8,bz-5.8,bz+5.8],[bx+8.8,bx+8.84,bz-5.8,bz+5.8],[bx-8.8,bx+8.8,bz-5.84,bz-5.8]])addStatic(boxG(b-a,1.15,e-c,[1,1]),IMB.panel,(a+b)/2,F,(c+e)/2,0,1,1,1,{noShadow:true});
 pGunWall(IK(bx-1,bz-5.76),8.6);pAmmoShelf(IK(bx-8.6,bz-1.8,Math.PI/2),3.4);pVest(IK(bx-7.6,bz+3.6));pVest(IK(bx-6.6,bz+3.8));pSafe(IK(bx+8.4,bz-4.6,-Math.PI/2));pAmmoShelf(IK(bx+8.6,bz+.8,-Math.PI/2),3);
 for(let i=0;i<3;i++)pPicture(IK(bx+8.83,bz+3.2-i*1.2,-Math.PI/2),.75,.95,IMB.target,2.6);{const k=IK(bx-8.83,bz+1.6,Math.PI/2);pPicture(k,1.6,1,IM.car1,2.6);}
 for(const [x,z] of [[bx-4,bz-1],[bx+3,bz-1],[bx,bz+3]])iLampPanel(x,F+H,z,2.2,.3,IM.lampW);iLight(I,bx-3.5,F+3.8,bz-.5,30,12);iLight(I,bx+4,F+3.8,bz+1,24,12);
 {const P2=Math.PI,H2=P2/2;ipVenue({id:'gun',kind:'gun',name:'Waffen Kowalski',x0:bx-9,x1:bx+9,z0:bz-6,z1:bz+6,cls:['mid','poor','poor'],cash:[700,1300],wantA:1,wantR:2,
  exits:[[bx,bz+4.7,bx,bz+9.5]],anchor:[bx+5,bz-3.2],armed:[[bx-1,bz-2.7,'shotgun']],
  cust:[[bx-3.2,bz-.35,P2,'look'],[bx+.9,bz-.35,P2,'chat'],[bx-7.6,bz-1.8,-H2,'look'],[bx+7.6,bz+.8,H2,'look'],[bx-6.4,bz+2.5,P2*.85,'look'],[bx+7.7,bz+3.4,H2,'look']],ncust:[2,4],
  walk:[[bx-2,bz+1.5,P2,'look'],[bx+4,bz+1.2,P2,'wait'],[bx-6,bz+.5,-H2,'look']],nstroll:1,
  staffX:[[bx+5,bz-3.2,-H2,'idle']],staffSkin:{oberteil:4,oberteilfarbe:1,hose:0,hosenfarbe:1},
  guards:[[bx+2.6,bz+4.4,P2,'pistol'],[bx-6.2,bz+4.4,P2,'smg'],[bx-4.6,bz-3.8,0,'shotgun']],gBase:0});}
 return {counter:{x:bx-1,z:bz+.2}};}
function buildClothesInt(cx,bz){const F=IF,H=4.2;const I=shopShell(cx,bz,22,12,H,MATS.shop[0],IM.white,IM.parquet,[{c:cx,w:2.4,h:2.7},{c:cx-6.6,w:6.6,y:.45,h:2.9,glass:true,mull:true},{c:cx+6.6,w:6.6,y:.45,h:2.9,glass:true,mull:true}],{name:'mode',floorT:[2.6,2.6],outSide:[16,4.2]});
 addStatic(boxG(22,3.2,12,[16,24]),MATS.plaster[4],cx,F+H,bz);addStatic(boxG(22.4,.5,12.4),roofMat,cx,F+H+3.2,bz);
 iDoor({x:cx,z:bz+6,axis:'x',w:2.35,h:2.65,type:'slide',r:3.4});
 for(const s of [-1,1]){pMannequin(IK(cx+s*5,bz+5.2,0),s>0?IM.fabR:IM.fabB,IM2.navy);pMannequin(IK(cx+s*8.3,bz+5.1,0),IM.fabW,IM.fabG);const p=IK(cx+s*6.6,bz+5.4);p.b(0,0,0,6,.25,1.1,IM.white);}
 for(const [x,z,r] of [[cx-5,bz+1,0],[cx-5,bz-1.6,0],[cx+1,bz+1.2,.3],[cx+1,bz-1.6,-.2]])pClothesRack(IK(x,z,r),1.8);
 pFoldShelf(IK(cx-6,bz-5.62),3.2,2.3);pFoldShelf(IK(cx-2.2,bz-5.62),3.2,2.3);{const k=IK(cx-10.64,bz-1,Math.PI/2);k.b(0,0,0,4,2.2,.35,IM.white);for(let r=0;r<5;r++){k.b(0,.25+r*.4,.02,3.9,.025,.3,IM.oak);for(let i=0;i<9;i++)k.b(-1.75+i*.43,.28+r*.4,.04,.26,.1,.14,[IM.black,IM.whiteP,IM.red,IM.leather,IM.blue][(i+r)%5]);}k.s(0,0,4,.35,2.2);}
 {const k=IK(cx-10.82,bz+3.5,Math.PI/2);k.b(0,.2,0,1.6,2,.04,IM.mirror);k.b(0,.15,0,1.75,2.1,.03,IM.oak);}
 for(let i=0;i<2;i++){const k=IK(cx+5.2+i*1.6,bz-5);k.b(0,0,-.65,1.5,2.4,.08,IM.white);for(const s of [-1,1])k.b(s*.75,0,0,.08,2.4,1.4,IM.white);k.b(0,2.4,0,1.5,.04,1.4,IM.chrome);k.b(0,.15,.68,1.42,2.2,.03,IM.fabR);k.c(-.4,.42,-.3,.2,.45,IM.leatherB);k.s(0,0,1.6,1.4,2.4);}
 pCheckout(IK(cx+8.2,bz-1,-Math.PI/2),2.2);iStaff(cx+9.2,bz-1,-Math.PI/2,'idle',{oberteil:0,oberteilfarbe:9,koerper:1,hose:3,hosenfarbe:1});pPlant(IK(cx+10.5,bz+2.5),1.2);pPlant(IK(cx-10.4,bz-5.5),1);
 {const k=IK(cx+10.82,bz-3.6,-Math.PI/2);k.b(0,2.3,0,2.4,.9,.04,IMB.sale);}
 pRug(IK(cx-2,bz+2.6),3,2,IM.carpetG);for(let x=cx-8;x<=cx+8;x+=4)for(const z of [bz-2.5,bz+2])iLampPanel(x,F+H,z,.5,.5,IM.lampY);iLight(I,cx-5,F+3.7,bz,30,13,0xfff0dc);iLight(I,cx+5,F+3.7,bz,30,13,0xfff0dc);
 {const P2=Math.PI,H2=P2/2;ipVenue({id:'clothes',kind:'clothes',name:'Mode Solara',x0:cx-11,x1:cx+11,z0:bz-6,z1:bz+6,cls:['rich','mid','mid','beach'],cash:[450,850],wantA:1,wantR:2,
  exits:[[cx,bz+4.6,cx,bz+9.5]],anchor:[cx+9.2,bz-1],
  cust:[[cx-5,bz+1.95,P2,'look','bags'],[cx+1.1,bz-.5,P2,'look'],[cx-9.5,bz+3.5,-H2,'pose'],[cx-9.4,bz-1,-H2,'look'],[cx+6.3,bz+.6,2.07,'wait','bags'],[cx+5.8,bz-3.2,P2,'phone','phone'],[cx-2.4,bz-4.2,P2,'look']],ncust:[3,5],
  walk:[[cx-3,bz+3.2,0,'look'],[cx+3.5,bz+2.6,0,'look'],[cx-7.5,bz-3.6,P2,'look'],[cx+3.2,bz-3.4,P2,'wait']],nstroll:2,
  staffX:[[cx-6,bz-4.6,P2,'type']],staffSkin:{oberteil:0,oberteilfarbe:9,hose:3,hosenfarbe:1},
  guards:[[cx-2.4,bz+4.3,0,'pistol'],[cx+4.5,bz+3.2,P2,'pistol']],gBase:0});}
 return {counter:{x:cx+7,z:bz-1}};}
function buildBurgerInt(bx,bz){const F=IF,H=4.4;const I=shopShell(bx,bz,16,10,H,MATS.plaster[6],IM.wtileR,IM.checker,[{c:bx+4,w:1.8,h:2.5},{c:bx-3.2,w:5,y:.85,h:1.8,glass:true,mull:true},{c:bx+7,w:1.4,y:.85,h:1.8,glass:true}],{name:'burger',floorT:[1.4,1.4],ceil:IM.whiteP});
 addStatic(boxG(16.4,.5,10.4),roofMat,bx,F+H+.6,bz);addStatic(boxG(16,.6,10),MATS.plaster[6],bx,F+H,bz);
 iDoor({x:bx+4,z:bz+5,axis:'x',w:1.75,h:2.45,type:'swing',mat:IM.chrome,glass:true,hinge:1,inward:-1,r:2.6});
 {const k=IK(bx-1.8,bz-1.3);const L=8.4;k.b(0,0,0,L,1.02,.7,IM.red);k.b(0,1.02,0,L+.06,.05,.8,IM.steel);for(let i=0;i<2;i++){const x=-1.8+i*3.2;k.b(x,1.07,0,.4,.22,.32,IM.black);k.b(x,1.29,-.05,.34,.2,.03,IM.gloss,{rx:-.3});k.b(x,1.3,-.03,.3,.16,.004,IM.pc,{rx:-.3});}k.b(2.6,1.07,.1,.5,.3,.3,IM.yellow);for(let i=0;i<4;i++)k.b(2.6,1.15+i*.06,.1,.4,.04,.26,IM2.paper);k.s(0,0,L,.8,1.1);}
 {const k=IK(bx-1.8,bz-4.45);pGrill(sub(k,-2.6,0),1.6);pFryer(sub(k,-.8,0));pFryer(sub(k,.0,0));pSoda(sub(k,1.4,.1));k.b(3,0,0,1.2,2,.6,IM.steel);for(let i=0;i<3;i++)k.b(3,.4+i*.5,.05,1.1,.03,.5,IM.chrome);for(let i=0;i<6;i++)k.b(2.6+i*.16,.95,0,.13,.08,.13,IM2.paper);}
 {const k=IK(bx-1.8,bz-4.8);k.b(-2.4,2.05,0,3,1.1,.04,IM.black);k.b(-2.4,2.08,.025,2.9,1.04,.005,IM.menuB);k.b(1.2,2.05,0,3,1.1,.04,IM.black);k.b(1.2,2.08,.025,2.9,1.04,.005,IM.menuB);}
 for(const z of [bz+1.4,bz+3.6]){pBooth(IK(bx-7.45,z,Math.PI/2),1.5);pTable(IK(bx-6.45,z,0),.7,1.2,IM.whiteP);pBooth(IK(bx-5.4,z,-Math.PI/2),1.5);}
 for(const [x,z] of [[bx+.6,bz+2.6],[bx+4.6,bz+1.6]]){pTable(IK(x,z),.8,.8,IM.whiteP,true);for(let i=0;i<3;i++){const a=i/3*Math.PI*2;const c=IK(x+Math.sin(a)*.75,z+Math.cos(a)*.75,a+Math.PI);pChair(c,IM.chrome,IM.leatherR);c.s(0,0,.45,.45,.9);}}
 {const k=IK(bx+7.4,bz+.6,-Math.PI/2);k.b(0,0,0,.6,1,.5,IM.red);k.b(0,.7,.26,.4,.2,.01,IM.black);k.s(0,0,.6,.5,1);}iStaff(bx-3,bz-2.4,0,'idle',{oberteil:0,oberteilfarbe:2,extra:3,hose:0,hosenfarbe:1});iStaff(bx-4.4,bz-4,Math.PI,'work',{oberteil:0,oberteilfarbe:0,extra:3});
 for(const [x,z] of [[bx-4,bz-3],[bx+1,bz-3],[bx-4,bz+2.5],[bx+3,bz+2.5]])iLampPanel(x,F+H,z,1.6,.4,IM.lampW);iLight(I,bx-2,F+3.4,bz-2,28,11);iLight(I,bx+1,F+3.4,bz+2.4,24,11,0xffefd8);
 {const P2=Math.PI,H2=P2/2,tp=(x,z,i)=>{const a=i/3*P2*2;return [x+Math.sin(a)*.75,z+Math.cos(a)*.75,a+P2];};
  ipVenue({id:'burger',kind:'food',name:'Burger Bude',x0:bx-8,x1:bx+8,z0:bz-5,z1:bz+5,zone:'burger',cls:['mid','poor','mid','beach'],cash:[220,420],wantA:1,wantR:2,
   exits:[[bx+4,bz+3.8,bx+4,bz+8.5]],anchor:[bx-3,bz-2.4],
   cust:[[bx-3.5,bz-.3,P2,'wait'],[bx-.5,bz-.25,P2,'phone','phone'],[bx-3.3,bz+.85,P2,'wait'],[bx-7.05,bz+3.6,H2,'sitEat'],[bx-5.85,bz+3.6,-H2,'sitChat'],[...tp(bx+.6,bz+2.6,0),'sitEat'],[...tp(bx+.6,bz+2.6,1),'sitChat'],[...tp(bx+4.6,bz+1.6,2),'sitPhone','phone'],[bx+6.6,bz+.6,H2,'look']],ncust:[4,6],
   walk:[[bx-1.8,bz+1.2,P2,'wait'],[bx+6.2,bz-2.6,H2,'look']],nstroll:1,
   staffX:[[bx-.4,bz-2.4,0,'idle']],staffSkin:{oberteil:0,oberteilfarbe:2,extra:3,hose:0,hosenfarbe:1},
   guards:[[bx+5.9,bz+3.4,-H2,'pistol'],[bx-6.4,bz-.6,H2,'pistol']],gBase:0});}
 return {counter:{x:bx-1.8,z:bz+.1},door:{x:bx+4,z:bz+6.6},inside:{x:bx+3,z:bz+3},boothT:{x:bx-6.45,z:bz+1.4},listen:{x:bx-4.55,z:bz+2.55},seatA:{x:bx-7.05,z:bz+1.4},seatB:{x:bx-5.85,z:bz+1.4}};}
function buildPizzaInt(bx,bz){const F=IF,H=4.4;const I=shopShell(bx,bz,16,10,H,MATS.plaster[5],IM.brick,IM.tiles,[{c:bx+4,w:1.8,h:2.5},{c:bx-3.2,w:5,y:.85,h:1.8,glass:true,mull:true}],{name:'pizza',floorT:[1.2,1.2],ceil:IM.oak});
 addStatic(boxG(16.4,.5,10.4),roofMat,bx,F+H+.6,bz);addStatic(boxG(16,.6,10),MATS.plaster[5],bx,F+H,bz);
 iDoor({x:bx+4,z:bz+5,axis:'x',w:1.75,h:2.45,type:'swing',mat:IM.walnut,glass:true,hinge:1,inward:-1,r:2.6});
 pOven(IK(bx-5.6,bz-3.9));{const k=IK(bx+.6,bz-1.3);const L=6.4;k.b(0,0,0,L,1,.75,IM.walnut);k.b(0,1,0,L+.06,.05,.85,IM.marble);k.b(-1.2,1.05,-.05,2.4,.42,.6,IM.glassT);for(let i=0;i<3;i++){k.c(-2+i*.8,1.06,0,.3,.03,IMB.check===null?IM.orange:cm(0xd9902b,.7));k.c(-2+i*.8,1.09,0,.27,.012,cm(0xc0392b,.7));}k.b(1.9,1.05,0,.38,.24,.3,IM.black);for(let i=0;i<5;i++)k.b(2.7,1.05+i*.05,.1,.45,.045,.45,IM2.cardboard);k.s(0,0,L,.85,1.1);}
 {const k=IK(bx+.6,bz-4.8);k.b(0,2.05,0,3.4,1.1,.04,IM.black);k.b(0,2.08,.025,3.3,1.04,.005,IM.menuP);k.b(4,1.2,.1,2,1.6,.3,IM.walnut);for(let r=0;r<3;r++)for(let i=0;i<7;i++)k.c(3.2+i*.26,1.3+r*.52,.12,.04,.32,[IM.green,IM2.burg,IM.black][(i+r)%3]);}
 for(const [x,z] of [[bx-4.8,bz+2.2],[bx-1,bz+2.6],[bx+3.6,bz+2.2],[bx-4.8,bz-.6]]){const t=IK(x,z);t.b(0,.72,0,1,.04,1,IM.walnut);t.b(0,.76,0,1.1,.004,1.1,IMB.check,{top:[1,1]});t.c(0,0,0,.05,.72,IM.black);t.c(0,.76,0,.04,.16,IM.green);t.s(0,0,1,1,.8);for(const s of [-1,1]){const c=IK(x+s*.75,z,s>0?-Math.PI/2:Math.PI/2);pChair(c,IM.walnut,IM.fabR);c.s(0,0,.45,.45,.9);}}
 pPlant(IK(bx+7.4,bz+4.4),1.2,IM2.potT);pPlant(IK(bx-7.4,bz+4.4),1.2,IM2.potT);iStaff(bx+.6,bz-2.5,0,'idle',{oberteil:0,oberteilfarbe:0,extra:0});iStaff(bx-4.6,bz-2.4,Math.PI,'work',{oberteil:0,oberteilfarbe:0});
 for(const [x,z] of [[bx-4,bz+1.5],[bx+1,bz+2.2],[bx+4,bz+1.5]])pPendant(x,F+H,z);iLight(I,bx-4,F+3,bz-2,26,10,0xffd8a0);iLight(I,bx+1,F+3,bz+2,28,12,0xffe0b8);
 {const P2=Math.PI,H2=P2/2;ipVenue({id:'pizza',kind:'food',name:'Pizza Presto',x0:bx-8,x1:bx+8,z0:bz-5,z1:bz+5,cls:['mid','mid','poor','rich'],cash:[220,420],wantA:1,wantR:2,
  exits:[[bx+4,bz+3.8,bx+4,bz+8.5]],anchor:[bx+.6,bz-2.5],
  cust:[[bx-5.55,bz+2.2,H2,'sitEat'],[bx-4.05,bz+2.2,-H2,'sitChat'],[bx-1.75,bz+2.6,H2,'sitPhone','phone'],[bx+4.35,bz+2.2,-H2,'sitEat'],[bx-5.55,bz-.6,H2,'sitEat'],[bx-1.8,bz+.15,P2,'wait'],[bx+3.2,bz-.2,P2,'phone','phone']],ncust:[3,5],
  walk:[[bx+6.2,bz+1.2,H2,'look'],[bx+1.6,bz+.9,P2,'wait']],nstroll:1,
  guards:[[bx+5.9,bz+3.4,-H2,'pistol'],[bx-6.6,bz+.9,H2,'pistol']],gBase:0});}
 return {counter:{x:bx+.6,z:bz+.1}};}
function storePosterMats(){if(STP)return STP;
 const mk=(bg,fg,l1,l2,l3)=>{const t=canvasTex(256,320,(g,W,H)=>{g.fillStyle=bg;g.fillRect(0,0,W,H);g.fillStyle=fg;g.textAlign='center';g.font='bold 58px Arial';g.fillText(l1,W/2,112);g.font='bold 42px Arial';g.fillText(l2,W/2,178);g.font='30px Arial';g.fillText(l3,W/2,255);g.strokeStyle=fg;g.lineWidth=8;g.strokeRect(12,12,W-24,H-24);});return M({map:t,roughness:.6,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.12});};
 const wide=(bg,fg,txt)=>{const t=canvasTex(512,96,(g,W,H)=>{g.fillStyle=bg;g.fillRect(0,0,W,H);g.fillStyle=fg;g.textAlign='center';g.font='bold 50px Arial';g.fillText(txt,W/2,66);});return M({map:t,roughness:.5,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.35});};
 STP={kaffee:mk('#c0392b','#ffffff','KAFFEE','TO GO','nur 1,50'),lotto:wide('#b3171d','#ffe14d','LOTTO · TABAK · TICKETS'),eis:mk('#2e86de','#ffffff','EIS','2 FÜR 1','nur heute'),
  broet:mk('#f39c12','#2b1a0a','FRISCHE','BRÖTCHEN','jeden Morgen'),snack:mk('#5b2a86','#ffffff','SNACKS','& CHIPS','Aktion!'),kasse:wide('#1d1d1d','#7dff8a','KASSE'),brill:wide('#111111','#f2d06b','BRILLANT · SEIT 1962')};return STP;}
// Mehr Leben im Laden: Tabakregal, Kaffee-Ecke, Eistruhe, Getränkekisten, Plakate, Fußmatte, Pflanze
function storeDeco(cx,cz,w,d,h,f){const fz=cz+f*d/2,bz=cz-f*d/2,ry=f>0?0:Math.PI,kx=cx-w*.22,PM=storePosterMats(),H2=Math.PI/2;
 {const L=Math.min(3.2,w*.3),k=IK(kx,bz+f*.34,ry);k.b(0,0,0,L,2.1,.36,IM.walnut);const cols=[IM.red,IM.blue,IM.yellow,IM.green,IM.white,IM.black,IM.orange];
  for(let r=0;r<5;r++){k.b(0,.33+r*.34,.02,L-.08,.02,.32,IM.whiteP);for(let i=0;i<Math.floor((L-.12)/.17);i++)k.b(-L/2+.14+i*.17,.35+r*.34,.06,.13,.17,.2,cols[(i*3+r*2)%7]);}
  k.b(0,2.16,.12,L,.3,.03,PM.lotto);k.s(0,0,L,.36,2.1);}
 {const k=IK(cx-w/2+.5,cz+f*.4,H2);k.b(0,0,0,1.8,.9,.6,IM.white);k.b(0,.9,0,1.84,.04,.64,IM.marbleD);k.b(-.45,.94,-.06,.46,.56,.42,IM.black);k.b(-.45,1.16,.16,.32,.1,.04,IM.chrome);k.b(-.45,1.36,.16,.3,.1,.005,IM.led);
  for(let i=0;i<3;i++)k.c(.2+i*.16,.94,.05,.045,.22+i*.04,IM.whiteP);k.b(.62,.94,0,.3,.12,.3,IM2.cardboard);k.b(0,1.75,-.26,.8,1,.02,PM.kaffee);k.ao(0,0,1.8,.6);k.s(0,0,1.8,.6,1);}
 {const k=IK(cx+w*.26,fz-f*1.35,ry);k.b(0,0,0,1.4,.8,.75,IM.whiteP);k.b(0,.8,0,1.38,.05,.73,IM.glassT);for(let i=0;i<6;i++)k.b(-.55+i*.22,.62,(i%2)*.12-.06,.18,.14,.28,[IM.blue,IM.yellow,IM.red,IM2.pink,IM.white,IM.green][i]);
  k.b(0,.3,.38,.9,.42,.006,PM.eis,{side:[1,1]});k.ao(0,0,1.4,.75);k.s(0,0,1.4,.75,.9);}
 {const k=IK(cx+w*.44,bz+f*.6,ry);const cs=[IM.yellow,IM.blue,IM.green,IM.red];for(let st=0;st<2;st++)for(let i=0;i<3;i++){const x=(st-.5)*.46;k.b(x,i*.3,0,.42,.28,.32,cs[(st*3+i)%4]);for(let b=0;b<6;b++)k.c(x-.15+(b%3)*.15,i*.3+.28,(b>2?.07:-.07),.025,.05,IM.black);}k.s(0,0,.92,.4,.9);}
 {const k=IK(cx+w/2-.24,cz-f*.8,-H2);k.b(0,2.2,0,.8,1,.02,PM.broet);}{const k=IK(cx+w*.18,bz+f*.26,ry);k.b(0,2.75,0,.8,1,.02,PM.snack);}
 {const k=IK(kx,bz+f*2.3,ry);k.b(0,2.95,0,1.2,.26,.03,PM.kasse);for(const s of [-.5,.5])k.c(s,3.08,0,.008,h-2.85,IM.chrome);}
 {const k=IK(cx,fz-f*.9,ry);k.b(0,.006,0,2.6,.016,1.3,IM.rubber);}pPlant(IK(cx-w/2+.5,fz-f*.45),1);}
// Juwelier: Wandvitrinen, Läufer, Pflanzen, Schriftzug, Bild
function jewelDeco(st){const {cx,cz,w,d}=st,f=st.front||1,fz=cz+f*d/2,bz=cz-f*d/2,ry=f>0?0:Math.PI,PM=storePosterMats();
 for(const s of [-1,1]){const k=IK(cx+s*(w/2-.5),cz+f*.4,-s*Math.PI/2);k.b(0,0,0,3.2,.9,.55,IM.walnut);k.b(0,.9,-.22,3.15,1.25,.04,IM.fabB);k.b(0,.9,0,3.2,1.25,.5,IM.glassT);
  for(const y of [1.32,1.72])k.b(0,y,0,3.1,.02,.44,IM.glass);for(let i=0;i<8;i++){k.c(-1.4+i*.4,.92,.02,.045,.03,IM.gold);k.g(SPH,IM.gold,-1.3+i*.37,1.4,0,.05,.05,.05);k.c(-1.35+i*.38,1.75,-.05,.06,.02,i%2?IM.chrome:IM.gold);}
  k.b(0,2.15,0,3.3,.08,.6,IM.walnut);k.s(0,0,3.2,.55,2.2);}
 {const k=IK(cx,cz+f*2.6,ry);k.b(0,.01,0,2.2,.012,5,IM.carpetR,{top:[2,4]});}
 for(const s of [-1,1])pPlant(IK(cx+s*2.7,fz-f*.6),1.25);
 {const k=IK(cx-4,bz+f*.26,ry);k.b(0,2.35,0,3.6,.6,.03,PM.brill);}pPicture(IK(cx+4.2,bz+f*.24,ry),2.4,1.4,IM.art2,2.4);}
// Supermarkt/Tankstellenshop: zusätzliche Einrichtung zu storeShell
function storeExtras(cx,cz,w,d,h,front,o){const F=IF,fz=cz+front*d/2,bz=cz-front*d/2,ry=front>0?0:Math.PI;
 for(const [a,b,c,e] of [[cx-w/2+.2,cx+w/2-.2,bz+front*.21,bz+front*.22],[cx-w/2+.2,cx-w/2+.21,cz-d/2+.2,cz+d/2-.2],[cx+w/2-.21,cx+w/2-.2,cz-d/2+.2,cz+d/2-.2]])addStatic(boxG(Math.max(.02,Math.abs(b-a)),h-.05,Math.max(.02,Math.abs(e-c))),IM.plaster,(a+b)/2,F,(c+e)/2,0,1,1,1,{noShadow:true});
 for(const s of [-1,1]){const seg=(w-3.4)/2,xc=cx+s*(1.7+seg/2);addStatic(boxG(seg-.1,h-3.3,.02),IM.plaster,xc,F+3.3,fz-front*.21,0,1,1,1,{noShadow:true});}
 const I=regInterior({name:'laden',x0:cx-w/2,x1:cx+w/2,z0:cz-d/2,z1:cz+d/2,ceil:h+.22});addStatic(boxG(w-.4,.04,d-.4),IM.plaster,cx,h+.24,cz,0,1,1,1,{noShadow:true});
 iDoor({x:cx,z:fz,axis:'x',w:3.3,h:3.2,type:'slide',r:3.6});
 if(o.shelves!==false){storeDeco(cx,cz,w,d,h,front);pFridgeWall(IK(cx+w*.18,bz+front*.6,ry),w*.42,2.1);pMag(IK(cx-w/2+.35,fz-front*1.4,ry+Math.PI/2*(front>0?1:-1)),1.2);pATM(IK(cx+w/2-.45,fz-front*1.1,ry-Math.PI/2*(front>0?1:-1)));}
 for(let k=0;k<2;k++)for(const s of [-1,1])iLampPanel(cx+s*w*.22,h+.24,cz+(k-.5)*d*.45,1.6,.35,IM.lampW);
 iLight(I,cx-w*.2,F+h-.5,cz,26,12,0xf2f6ff);iLight(I,cx+w*.2,F+h-.5,cz,26,12,0xf2f6ff);return I;}
function neon(c){const m=new THREE.MeshStandardMaterial({color:0x111111,emissive:c,emissiveIntensity:2.5});neonMats.push(m);return m;}
function addPlace(type,name,x,z,o={}){const p={type,name,x,z,r:o.r??2.6,car:!!o.car,label:o.label||'?',col:o.col||'#ffffff',blip:o.blip!==false,data:o.data||{}};places.push(p);return p;}
function signMesh(text,w,h,x,y,z,ry,bg='#111',fg='#fff',glow=1,font=60){const t=sign(text,bg,fg,512,96,font);const mat=new THREE.MeshStandardMaterial({map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.5,roughness:.6});mat.userData={kind:'sign',glow};facadeMats.push(mat);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);m.position.set(x+SX,y+SY,z+SZ);m.rotation.y=ry;scene.add(m);return m;}
function stripGeo(w,l){const g=new THREE.PlaneGeometry(w,l);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/14,uv.getY(i)*l/14);g.rotateX(-Math.PI/2);return g;}
function surfTop(x0,x1,z0,z1){let m=-1e9;for(let i=0;i<=6;i++)for(let j=0;j<=6;j++)m=Math.max(m,terrainH(x0+(x1-x0)*i/6,z0+(z1-z0)*j/6));return m;}
function groundRect(xa,xb,za,zb,mat,y=.03){const m=new THREE.Mesh(stripGeo(xb-xa,zb-za),mat);const X0=xa+SX,X1=xb+SX,Z0=za+SZ,Z1=zb+SZ;FLAT_EX.push([X0-1,X1+1,Z0-1,Z1+1]);m.position.set((xa+xb)/2+SX,Math.max(y+SY,surfTop(X0,X1,Z0,Z1)+.05),(za+zb)/2+SZ);m.receiveShadow=true;scene.add(m);return m;}

// ---------- hohler Laden mit Theke (betretbar) ----------
function storeShell(cx,cz,w,d,h,front,wallMat,name,bg,fg,o={}){
 const t=.4,door=3.4,fz=cz+front*d/2,bz=cz-front*d/2;
 addStatic(boxG(w,.06,d,null,[2,2]),floorMat,cx,.3,cz,0,1,1,1,{noShadow:true});
 addStatic(boxG(w,h,t,[16,24]),wallMat,cx,.3,bz);addSolid(cx-w/2,cx+w/2,bz-t/2,bz+t/2,h+.3);
 for(const sx of [-1,1]){addStatic(boxG(t,h,d,[16,24]),wallMat,cx+sx*w/2,.3,cz);addSolid(cx+sx*w/2-t/2,cx+sx*w/2+t/2,cz-d/2,cz+d/2,h+.3);}
 const seg=(w-door)/2;
 for(const sx of [-1,1]){const xc=cx+sx*(door/2+seg/2);addStatic(boxG(seg,1,t),wallMat,xc,.3,fz);addStatic(boxG(seg,h-3.3,t,[16,24]),wallMat,xc,3.6,fz);addStatic(boxG(seg-.3,2.3,.1),winGlass,xc,1.3,fz,0,1,1,1,{noShadow:true});addSolid(xc-seg/2,xc+seg/2,fz-t/2,fz+t/2,h+.3);}
 addStatic(boxG(door,h-3.6,t,[16,24]),wallMat,cx,3.9,fz);
 const roof=new THREE.Mesh(new THREE.BoxGeometry(w+.5,.5,d+.5),roofMat);roof.position.set(cx+SX,h+.55+SY,cz+SZ);roof.receiveShadow=true;scene.add(roof);
 const kx=cx+(o.counterX??-w*.22),kz=bz+front*2.3;
 addStatic(boxG(w*.38,1.05,.8),counterMat,kx,.3,kz);addSolid(kx-w*.19,kx+w*.19,kz-.4,kz+.4,1.4);
 addStatic(boxG(.5,.35,.4),cm(0x222222,.4,.5),kx+w*.1,1.35,kz);
 if(o.shelves!==false)for(let r=0;r<2;r++){const sx2=cx+w*.18,sz=cz+front*(r*2.4-.6);pGondola(IK(sx2,sz,front>0?0:Math.PI),w*.42,1.65,true);}
 storeExtras(cx,cz,w,d,h,front,o);
 if(name)signMesh(name,Math.min(w-1,12),1.4,cx,h-.95,fz+front*.23,front>0?0:Math.PI,bg,fg,1.1,52);
 return {roof,cx,cz,w,d,h,front,door:{x:cx,z:fz+front*1.4},clerk:{x:kx,z:bz+front*1.1,ry:front>0?0:Math.PI},counter:{x:kx,z:kz},cool:0,inside:(x,z)=>Math.abs(x-cx)<w/2-.2&&Math.abs(z-cz)<d/2-.2};
}
function genericKind(cx,cz){if(Math.hypot(cx,cz+30)<215)return rand()<.55?'glass':'office';return pickR(['plaster','plaster','plaster','brick','office']);}
function fillBack(info,n=2){const {x0,x1,z0,cx,cz}=info;const k=genericKind(cx,cz);const dd=Math.hypot(cx,cz+30),down=Math.max(0,1-dd/215);
 const lots=[[x0+14,z0+14],[x1-14,z0+14]];for(let q=0;q<Math.min(n,2);q++){const [lx,lz]=lots[q];building(lx,lz,R(15,20),R(15,20),Math.round(down>0?R(30,60)+down*down*R(30,100):R(9,26)),k);}}
function baseFloor(info,mat=sidewalkMat,rep=[4,4]){addStatic(boxG(BLK-7,.05,BLK-7,null,rep),mat,info.cx,.3,info.cz,0,1,1,1,{noShadow:true});}
function regStore(st,sp,kind){st.id=stores.length;st.name=sp.name;st.kind=kind;stores.push(st);sp.store=st;}
function clubMats(){if(CLUBM)return CLUBM;const wall=M({map:canvasTex(256,256,(g,w,h)=>{g.fillStyle='#0d0d14';g.fillRect(0,0,w,h);for(let i=0;i<3000;i++){g.fillStyle=`rgba(255,255,255,${Math.random()*.05})`;g.fillRect(Math.random()*w,Math.random()*h,2,2);}for(let y=0;y<h;y+=32){g.fillStyle='rgba(255,255,255,.04)';g.fillRect(0,y,w,2);}},2),roughness:.7});
 const floor=M({color:0x0b0b10,roughness:.18,metalness:.6});const velvet=M({color:0x5a0f2a,roughness:.9});const leather=M({color:0x151515,roughness:.35,metalness:.1});const chrome=cm(0xdadfe4,.15,1);
 const bottleM=[0x3ee6ff,0xff5ad6,0xffd23a,0x7dff8a,0xff7b1a].map(c=>{const m=new THREE.MeshStandardMaterial({color:0x111111,emissive:c,emissiveIntensity:1.6,roughness:.2,transparent:true,opacity:.85});neonMats.push(m);return m;});
 const shelfGlow=neon(0xff9a3c),barTop=M({color:0x1a1a1a,roughness:.15,metalness:.8}),speaker=cm(0x0a0a0a,.6,.2),cone=cm(0x2a2a2a,.4,.5);
 const ext=M({map:canvasTex(128,128,(g,w,h)=>{g.fillStyle='#5b5f6c';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=16){g.fillStyle='#777b88';g.fillRect(x,0,3,h);g.fillStyle='#3a3d47';g.fillRect(x+12,0,2,h);}for(let i=0;i<900;i++){g.fillStyle=`rgba(${Math.random()<.5?'255,255,255':'0,0,0'},${Math.random()*.06})`;g.fillRect(Math.random()*w,Math.random()*h,2,2);}g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,h-6,w,6);},2),roughness:.55,metalness:.25});
 CLUBM={wall,ext,floor,velvet,leather,chrome,bottleM,shelfGlow,barTop,speaker,cone};return CLUBM;}
function buildClubInterior(cx,cz,name,colA,colB){const m=clubMats();const W=34,D=22,H=8,t=.5,y0=.3+SY,ys=.3;
 // Hülle: Wände mit Eingang vorne (+z), Dach
 addStatic(boxG(W,H,t,[4,4]),m.wall,cx,ys,cz-D/2);addSolid(cx-W/2,cx+W/2,cz-D/2-t/2,cz-D/2+t/2,ys+H);
 for(const sx of [-1,1]){addStatic(boxG(t,H,D,[4,4]),m.wall,cx+sx*W/2,ys,cz);addSolid(cx+sx*W/2-t/2,cx+sx*W/2+t/2,cz-D/2,cz+D/2,ys+H);}
 const dw=3.2,seg=(W-dw)/2;for(const sx of [-1,1]){const xc=cx+sx*(dw/2+seg/2);addStatic(boxG(seg,H,t,[4,4]),m.wall,xc,ys,cz+D/2);addSolid(xc-seg/2,xc+seg/2,cz+D/2-t/2,cz+D/2+t/2,ys+H);}
 addStatic(boxG(dw,H-3,t,[4,4]),m.wall,cx,ys+3,cz+D/2);
 // Außenhaut: dunkle Metall-Lamellen statt schwarzer Wand (tagsüber sichtbar strukturiert)
 {const ex=m.ext,o=t/2+.05,k=.08;addStatic(boxG(W+2*o+k,H,k,[3,3]),ex,cx,ys,cz-D/2-o);for(const sx of [-1,1])addStatic(boxG(k,H,D+2*o,[3,3]),ex,cx+sx*(W/2+o),ys,cz);
  for(const sx of [-1,1])addStatic(boxG(seg,H,k,[3,3]),ex,cx+sx*(dw/2+seg/2),ys,cz+D/2+o);addStatic(boxG(dw,H-3,k,[3,3]),ex,cx,ys+3,cz+D/2+o);}
 addStatic(boxG(W+.5,.6,D+.5),roofMat,cx,ys+H,cz);addStatic(boxG(W-1,.08,D-1),m.wall,cx,ys+H-.1,cz);
 addStatic(boxG(W-1,.06,D-1,null,[2,2]),m.floor,cx,ys,cz,0,1,1,1,{noShadow:true});
 // Tanzfläche (14×8 leuchtende Kacheln)
 const tiles=new THREE.InstancedMesh(new THREE.BoxGeometry(.96,.06,.96),new THREE.MeshBasicMaterial({color:0xffffff}),112);const o=new THREE.Object3D();let k=0;
 for(let i=0;i<14;i++)for(let j=0;j<8;j++){o.position.set(cx-6.5+i,y0+.09,cz-5.5+j);o.updateMatrix();tiles.setMatrixAt(k,o.matrix);tiles.setColorAt(k,new THREE.Color(0,0,0));k++;}scene.add(tiles);
 // DJ-Pult mit Boxen & LED-Wand
 addStatic(boxG(8,1,3),m.leather,cx,ys,cz-D/2+2.2);addStatic(boxG(4.4,1.1,.9),m.barTop,cx,ys+1,cz-D/2+3);addSolid(cx-4,cx+4,cz-D/2,cz-D/2+3.7,ys+1);
 for(const sx of [-1,1]){addStatic(boxG(1.8,4.2,1.6),m.speaker,cx+sx*6,ys,cz-D/2+1.4);for(const yy of [.9,2.2,3.5])addStatic(GEO.cyl,m.cone,cx+sx*6,ys+yy,cz-D/2+2.22,0,.55,.05,.55,{rx:Math.PI/2});addSolid(cx+sx*6-.9,cx+sx*6+.9,cz-D/2+.6,cz-D/2+2.2,ys+4.2);}
 const led=document.createElement('canvas');led.width=256;led.height=96;const ledT=new THREE.CanvasTexture(led);ledT.colorSpace=THREE.SRGBColorSpace;const ledM=new THREE.MeshBasicMaterial({map:ledT,toneMapped:false});
 const ledP=new THREE.Mesh(new THREE.PlaneGeometry(14,4.6),ledM);ledP.position.set(cx,y0+4.2,cz-D/2+.3);scene.add(ledP);
 // Bar links
 const bx=cx-W/2+3.2;addStatic(boxG(1.2,1.15,14),m.barTop,bx+1.6,ys,cz-1);addStatic(boxG(1.6,.08,14.4),m.chrome,bx+1.6,ys+1.15,cz-1);addSolid(bx+.9,bx+2.3,cz-8,cz+6,ys+1.2);
 addStatic(boxG(.4,3.4,15),m.wall,bx-1.4,ys,cz-1);for(let r=0;r<3;r++){addStatic(boxG(.5,.06,14),m.shelfGlow,bx-1,ys+1.4+r*.9,cz-1);for(let q=0;q<16;q++)addStatic(GEO.cyl,m.bottleM[(q+r)%5],bx-1,ys+1.62+r*.9,cz-7.6+q*.88,0,.09,.4,.09);}
 for(let q=0;q<6;q++){const sz=cz-6+q*2.2;addStatic(GEO.cyl,m.chrome,bx+3.1,ys+.4,sz,0,.05,.8,.05);addStatic(GEO.cyl,m.leather,bx+3.1,ys+.85,sz,0,.28,.12,.28);}
 // VIP-Lounge rechts (erhöht, Kordel)
 const vx=cx+W/2-4;addStatic(boxG(7,.6,15),m.velvet,vx,ys,cz-1);addSolid(vx-3.5,vx+3.5,cz-8.5,cz-6.8,ys+.6);
 for(const [a,b,ry] of [[vx+2.4,cz-6,0],[vx+2.4,cz-1,0],[vx+2.4,cz+4,0]]){addStatic(boxG(1,.7,3.2),m.leather,a,ys+.6,b);addStatic(boxG(.4,1.4,3.2),m.leather,a+.5,ys+.6,b);addStatic(boxG(1.2,.5,1.2),m.barTop,a-1.6,ys+.6,b);}
 for(let q=0;q<5;q++){const pz=cz-7+q*3;addStatic(GEO.cyl,cm(0xc9a227,.25,.9),vx-3.6,ys+.6,pz,0,.06,1.2,.06);}addStatic(GEO.cyl,m.velvet,vx-3.6,ys+1.1,cz-1,0,.05,12,.05,{rx:Math.PI/2});
 // Lichtshow: bewegliche Scheinwerfer, Laser, Discokugel
 const beams=[];const bm=new THREE.MeshBasicMaterial({color:colA,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
 const bm2=bm.clone();bm2.color=new THREE.Color(colB);
 for(let q=0;q<6;q++){const piv=new THREE.Group();piv.position.set(cx-10+q*4,y0+H-.4,cz-2+(q%2?3:-3));const co=new THREE.Mesh(new THREE.ConeGeometry(1.4,9,16,1,true),q%2?bm:bm2);co.position.y=-4.5;piv.add(co);scene.add(piv);beams.push({piv,ph:q*1.3});}
 const lasers=[];const lm=new THREE.MeshBasicMaterial({color:new THREE.Color(colB).multiplyScalar(2.2),transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
 for(let q=0;q<8;q++){const piv=new THREE.Group();piv.position.set(cx+(q-3.5)*.5,y0+5.2,cz-D/2+1);const l=new THREE.Mesh(new THREE.BoxGeometry(.03,.03,26),lm);l.position.z=13;piv.add(l);scene.add(piv);lasers.push({piv,ph:q});}
 const ball=new THREE.Mesh(new THREE.IcosahedronGeometry(.8,2),new THREE.MeshStandardMaterial({color:0xffffff,metalness:1,roughness:.05,flatShading:true}));ball.position.set(cx,y0+H-1.4,cz-2);scene.add(ball);
 const cl={name,cx,cz,W,D,y0,tiles,ledT,led,beams,lasers,ball,colA:new THREE.Color(colA),colB:new THREE.Color(colB),inside:false,beat:0,bt:0,
  bar:{x:bx+3.4,z:cz-1},vip:{x:vx-4.4,z:cz-1},dj:{x:cx,z:cz-D/2+2.4},door:{x:cx,z:cz+D/2+1.5},floor:{x:cx,z:cz-1.5}};
 CLUBS.push(cl);regInterior({name:'club',x0:cx-W/2,x1:cx+W/2,z0:cz-D/2,z1:cz+D/2,ceil:y0+H-.3,fy:y0+.06});return cl;}
function buildSpecial(sp,info){sp.info=info;BUILD[sp.type](info,sp);}
function dashLine(ax,az,bx,bz,step=9){const l=Math.hypot(bx-ax,bz-az);const n=Math.floor(l/step);const vert=Math.abs(bz-az)>Math.abs(bx-ax);for(let k=0;k<n;k++){const t=(k+.5)/n;roadDashPts.push([ax+(bx-ax)*t,az+(bz-az)*t,vert?0:1]);}}
function buildRing(){const {x0,x1,z0,zs}=RING,H=11;
 groundRect(x0-H,x1+H,z0-H,z0+H,ringMat);groundRect(x0-H,x0+H,z0+H,zs-7,ringMat);groundRect(x1-H,x1+H,z0+H,zs-7,ringMat);
 groundRect(x0-H,-HALF-ROAD/2,zs-7,zs+7,ringMat);groundRect(HALF+ROAD/2,x1+H,zs-7,zs+7,ringMat);
 for(const i of [2,7,12]){const x=nodeX(i);groundRect(x-7,x+7,z0+H,-HALF-ROAD/2,ringMat);dashLine(x,z0+H,x,-HALF-ROAD/2);}
 for(const j of [1,10]){const z=nodeX(j);groundRect(x0+H,-HALF-ROAD/2,z-7,z+7,ringMat);dashLine(x0+H,z,-HALF-ROAD/2,z);}
 for(const j of [2,11]){const z=nodeX(j);groundRect(HALF+ROAD/2,x1-H,z-7,z+7,ringMat);dashLine(HALF+ROAD/2,z,x1-H,z);}
 dashLine(x0,z0,x1,z0);dashLine(x0,z0,x0,zs);dashLine(x1,z0,x1,zs);dashLine(x0,zs,-HALF-ROAD/2,zs);dashLine(HALF+ROAD/2,zs,x1,zs);
 for(const s of [-1,1]){dashLine(x0,z0+s*5.5,x1,z0+s*5.5,6);dashLine(x0+s*5.5,z0,x0+s*5.5,zs,6);dashLine(x1+s*5.5,z0,x1+s*5.5,zs,6);}
 const im=new THREE.InstancedMesh(new THREE.BoxGeometry(.22,.02,3),decal(cm(0xf2f2f2,.7)),roadDashPts.length);const o=new THREE.Object3D();
 roadDashPts.forEach((p,i)=>{o.position.set(p[0],.05,p[1]);o.rotation.y=p[2]?Math.PI/2:0;o.updateMatrix();im.setMatrixAt(i,o.matrix);});scene.add(im);
 for(let x=x0;x<=x1;x+=55)roadLampPts.push([x,z0-H-1.2],[x,z0+H+1.2]);
 for(let z=z0+55;z<zs;z+=55){roadLampPts.push([x0-H-1.2,z],[x0+H+1.2,z],[x1-H-1.2,z],[x1+H+1.2,z]);}
 const poles=new THREE.InstancedMesh(new THREE.CylinderGeometry(.12,.16,9,6),cm(0x2b2f33,.45,.7),roadLampPts.length),bulbs=new THREE.InstancedMesh(new THREE.BoxGeometry(.5,.12,1),bulbMat,roadLampPts.length);
 roadLampPts.forEach((p,i)=>{o.position.set(p[0],4.5,p[1]);o.rotation.set(0,0,0);o.updateMatrix();poles.setMatrixAt(i,o.matrix);o.position.y=9;o.updateMatrix();bulbs.setMatrixAt(i,o.matrix);const s=addSolid(p[0]-.25,p[0]+.25,p[1]-.25,p[1]+.25,9);s.breakable=true;s.bg=RLAMP_G;s.bi=i;s.box={x0:s.x0,x1:s.x1,z0:s.z0,z1:s.z1};});
 poles.castShadow=true;scene.add(poles,bulbs);RLAMP_G.pts=roadLampPts;RLAMP_G.parts=[{im:poles,off:4.5,ix:[0]},{im:bulbs,off:9,ix:[0]}];
 ZONES.push({name:'Ringautobahn',ring:true});}

// ---------- Westzone: Funland, Schrottplatz, Gefängnis ----------
function buildFunland(){const X0=-750,X1=-520,Z0=-395,Z1=-60;
 const pav=canvasTex(128,128,(g)=>{for(let y=0;y<8;y++)for(let x=0;x<8;x++){g.fillStyle=(x+y)%2?'#bda98e':'#d6c6ae';g.fillRect(x*16,y*16,16,16);}});pav.wrapS=pav.wrapT=THREE.RepeatWrapping;
 groundRect(X0,X1,Z0,Z1,decal(M({map:pav,roughness:.8})),.025);
 ZONES.push({name:'Funland',x0:X0,x1:X1,z0:Z0,z1:Z1});
 const WX=-705,WY=27,WZ=-300;
 for(const sx of [-1,1])for(const sz of [-1,1])addStatic(GEO.box,cm(0xdddddd,.4,.6),WX+sx*2.2,13.5,WZ+sz*4.6,0,.8,29,.8,{rx:-sz*.32});
 addSolid(WX-3,WX+3,WZ-6,WZ+6,28);
 const wheel=new THREE.Group();wheel.position.set(WX,WY,WZ);scene.add(wheel);const rimM=cm(0xc0392b,.4,.5);
 for(const [r,t] of [[22,.4],[20,.25]]){const rim=new THREE.Mesh(new THREE.TorusGeometry(r,t,8,72),rimM);rim.rotation.y=Math.PI/2;wheel.add(rim);}
 const lr=new THREE.Mesh(new THREE.TorusGeometry(22.7,.18,6,96),neon(0xff5ad6));lr.rotation.y=Math.PI/2;wheel.add(lr);
 for(let k=0;k<16;k++){const a=k/16*Math.PI*2;const sp=new THREE.Mesh(new THREE.BoxGeometry(.25,22,.25),cm(0xeeeeee,.4,.6));sp.position.set(0,Math.cos(a)*11,Math.sin(a)*11);sp.rotation.x=a;wheel.add(sp);}
 const gond=[];for(let k=0;k<16;k++){const a=k/16*Math.PI*2;const g=new THREE.Group();g.position.set(0,Math.cos(a)*22,Math.sin(a)*22);g.add(mesh(new THREE.BoxGeometry(1.8,1.8,2.2),cm([0xf1c40f,0x2e86de,0x27ae60,0xe67e22][k%4],.6),0,-1.6,0));wheel.add(g);gond.push(g);}
 funObjs.wheel={g:wheel,gond};
 const CX=-600,CZ=-215;addStatic(GEO.cyl,cm(0xe8d8b0,.6),CX,.55,CZ,0,8.5,.5,8.5);addSolid(CX-8.5,CX+8.5,CZ-8.5,CZ+8.5,6);
 const car=new THREE.Group();car.position.set(CX,.8,CZ);scene.add(car);
 const stripe=canvasTex(256,64,(g,w,h)=>{for(let x=0;x<16;x++){g.fillStyle=x%2?'#e74c3c':'#ffffff';g.fillRect(x*16,0,16,h);}});
 const roofC=new THREE.Mesh(new THREE.ConeGeometry(9,3.5,24),M({map:stripe,roughness:.6}));roofC.position.y=5.5;roofC.castShadow=true;car.add(roofC);
 car.add(mesh(new THREE.CylinderGeometry(.6,.6,5,12),cm(0xc9a227,.3,.8),0,2.4,0));
 const horses=[];for(let k=0;k<8;k++){const a=k/8*Math.PI*2;const hg=new THREE.Group();hg.position.set(Math.cos(a)*6,0,Math.sin(a)*6);hg.add(mesh(new THREE.CylinderGeometry(.06,.06,4.2,6),cm(0xc9a227,.3,.8),0,2.1,0,false));const hb=mesh(new THREE.BoxGeometry(.5,.9,1.6),cm([0xffffff,0x8b5a2b,0x222222][k%3],.5),0,1.6,0);hb.rotation.y=-a;hg.add(hb);car.add(hg);horses.push({hb,ph:k});}
 funObjs.carousel={g:car,horses};
 const cpts=[[-735,5,-140],[-712,16,-168],[-675,24,-176],[-640,8,-170],[-600,20,-162],[-560,12,-140],[-540,26,-110],[-560,10,-80],[-610,18,-70],[-660,6,-74],[-700,22,-82],[-735,12,-105]].map(p=>new THREE.Vector3(...p));
 const curve=new THREE.CatmullRomCurve3(cpts,true,'catmullrom',.5);
 addStatic(new THREE.TubeGeometry(curve,360,.45,8,true).translate(640,0,120),cm(0xd35400,.4,.6),-640,0,-120);
 for(let k=0;k<48;k++){const p=curve.getPointAt(k/48);addStatic(GEO.cyl,cm(0x8a8f96,.5,.6),p.x,p.y/2,p.z,0,.22,p.y,.22);}
 const train=[];for(let k=0;k<4;k++){const tc=new THREE.Group();tc.add(mesh(new THREE.BoxGeometry(1.4,.9,2.2),cm(0xf1c40f,.4,.3),0,.75,0));scene.add(tc);train.push(tc);}
 funObjs.coaster={curve,train,u:0};
 for(let k=0;k<6;k++){const sx=-735+k*30,sz=-360;addStatic(boxG(5,2.6,4),cm(0xf2f2f2,.6),sx,0,sz);addStatic(boxG(5.6,.4,4.6),cm([0xe74c3c,0x2e86de,0xf1c40f][k%3],.6),sx,2.8,sz);addSolid(sx-2.5,sx+2.5,sz-2,sz+2,3);}
 for(const sx of [-1,1]){addStatic(GEO.box,cm(0x8e44ad,.5),-635+sx*9,4,-392,0,1.2,8,1.2);addSolid(-635+sx*9-.7,-635+sx*9+.7,-392.7,-391.3,8);}
 const at=canvasTex(512,128,(g,w,h)=>{g.fillStyle='#2a0f3a';g.fillRect(0,0,w,h);g.font='900 96px Arial';g.textAlign='center';g.textBaseline='middle';const cs=['#ff5ad6','#ffd23a','#3ee6ff','#7dff8a','#ff7b1a','#ff5ad6','#ffd23a'];'FUNLAND'.split('').forEach((c,i)=>{g.fillStyle=cs[i];g.fillText(c,70+i*62,h/2+6);});});
 const am=new THREE.MeshStandardMaterial({map:at,emissive:0xffffff,emissiveMap:at,emissiveIntensity:1.4});am.userData.k=.5;neonMats.push(am);const arch=new THREE.Mesh(new THREE.BoxGeometry(19,3,1),am);arch.position.set(-635,9,-392);scene.add(arch);}
function fenceBox(xa,za,xb,zb,h,mat){const horiz=Math.abs(zb-za)<.1;const l=horiz?Math.abs(xb-xa):Math.abs(zb-za);addStatic(boxG(horiz?l:.35,h,horiz?.35:l,[30,12]),mat,(xa+xb)/2,0,(za+zb)/2);addSolid(Math.min(xa,xb)-.25,Math.max(xa,xb)+.25,Math.min(za,zb)-.25,Math.max(za,zb)+.25,h);}
function buildJunkyard(){const X0=-750,X1=-522,Z0=-10,Z1=185;
 groundRect(X0,X1,Z0,Z1,dirtMat,.025);const fm=MATS.warehouse[0];
 fenceBox(X0,Z0,X1,Z0,3.2,fm);fenceBox(X0,Z1,X1,Z1,3.2,fm);fenceBox(X0,Z0,X0,Z1,3.2,fm);fenceBox(X1,Z0,X1,70,3.2,fm);fenceBox(X1,110,X1,Z1,3.2,fm);
 const rust=[0x6b3a24,0x4a4038,0x2e2a26,0x7a5a3a,0x3a4a5a].map(c=>cm(c,.95,.2));
 for(const [px,pz] of [[-735,10],[-735,35],[-735,160],[-712,172],[-690,172],[-610,172],[-580,10],[-540,10],[-720,10]]){for(let k=0;k<4;k++)addStatic(boxG(R(3.6,4.4),1.3,R(1.8,2.1)),pickR(rust),px+R(-1,1),k*1.25,pz+R(-1,1),R(-.4,.4));addSolid(px-3,px+3,pz-2.5,pz+2.5,5);}
 addStatic(boxG(6,4,8),cm(0x3a3f45,.6,.6),-560,0,165);addSolid(-563,-557,161,169,4);
 crane(-700,40);
 addStatic(boxG(6.1,2.6,2.5,[2.5,2.6]),containerCols[0],-545,0,40);addSolid(-548,-542,38.7,41.3,3);signMesh('SCHROTT MÜLLER',6,1,-545,3.2,41.3,0,'#222','#ffb347',1,48);
 ZONES.push({name:'Schrottplatz Müller',x0:X0,x1:X1,z0:Z0,z1:Z1});}
function buildPrison(){const X0=-748,X1=-528,Z0=258,Z1=470;const wm=cm(0x9a9690,.9);
 for(const [a,b,c,d] of [[X0,Z0,X1,Z0],[X0,Z1,X1,Z1],[X0,Z0,X0,Z1],[X1,Z0,X1,Z1]]){const horiz=Math.abs(d-b)<.1;const l=horiz?Math.abs(c-a):Math.abs(d-b);addStatic(boxG(horiz?l:1.2,9,horiz?1.2:l),wm,(a+c)/2,0,(b+d)/2);addSolid(Math.min(a,c)-.6,Math.max(a,c)+.6,Math.min(b,d)-.6,Math.max(b,d)+.6,9);}
 for(const [tx,tz] of [[X0,Z0],[X1,Z0],[X0,Z1],[X1,Z1]]){addStatic(GEO.cyl,wm,tx,7,tz,0,2.2,14,2.2);addStatic(boxG(5.4,3,5.4),cm(0x55595f,.6),tx,14,tz);addStatic(GEO.cone,cm(0x3a3f45,.7),tx,18,tz,0,4,2,4);}
 building(-640,330,60,30,14,'office');building(-640,410,50,24,10,'office');
 addStatic(GEO.box,cm(0x3a3f45,.5,.7),X1+.7,3.2,364,0,.3,6,12);signMesh('JVA STEINFELD',10,1.4,X1+.75,7.8,364,Math.PI/2,'#2a2f36','#ffffff',.8,52);
 ZONES.push({name:'JVA Steinfeld',x0:X0,x1:X1,z0:Z0,z1:Z1});}
function relocated(fn,ox,oz,oy){const n0=ZONES.length;SX=ox;SZ=oz;SY=oy;try{fn();}finally{SX=SZ=SY=0;}for(let i=n0;i<ZONES.length;i++){const q=ZONES[i];if(q.x0!=null){q.x0+=ox;q.x1+=ox;q.z0+=oz;q.z1+=oz;}if(q.cx!=null){q.cx+=ox;q.cz+=oz;}}}
function buildMilitary(){const X0=-765,X1=-430,Z0=-765,Z1=-525;
 const camo=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#5b6b3a';g.fillRect(0,0,w,h);for(let i=0;i<40;i++){g.fillStyle=['#3f4a28','#7a8450','#2f3620'][i%3];g.beginPath();g.ellipse(Math.random()*w,Math.random()*h,8+Math.random()*16,5+Math.random()*10,Math.random()*3,0,7);g.fill();}});
 const camoMat=M({map:camo,roughness:.9});
 {const conc=canvasTex(256,256,(g,w,h)=>{noiseFill(g,w,h,'#a7a397',.1,9000,2);for(let i=0;i<10;i++){g.fillStyle=`rgba(${Math.random()<.5?'40,38,34':'190,160,110'},${.04+Math.random()*.07})`;g.beginPath();g.ellipse(Math.random()*w,Math.random()*h,12+Math.random()*40,8+Math.random()*24,Math.random()*3,0,7);g.fill();}
   g.strokeStyle='rgba(55,52,46,.55)';g.lineWidth=2;for(const q of [1,128]){g.beginPath();g.moveTo(q,0);g.lineTo(q,h);g.moveTo(0,q);g.lineTo(w,q);g.stroke();}});conc.wrapS=conc.wrapT=THREE.RepeatWrapping;
  const concMat=decal(M({map:conc,roughness:.92})),asph=decal(M({map:asphaltTex,roughness:.85}));
  groundRect(-732,-588,-748,-694,concMat,.025);groundRect(-524,-476,-576,-544,concMat,.025);groundRect(-676,-584,-668,-586,concMat,.022);
  groundRect(-600,-430,-651,-639,asph,.03);groundRect(-660,-648,-694,-556,asph,.03);groundRect(-648,-600,-651,-639,asph,.03);}
 const fm=MATS.warehouse[3];fenceBox(X0,Z0,X1,Z0,4,fm);fenceBox(X0,Z1,X1,Z1,4,fm);fenceBox(X0,Z0,X0,Z1,4,fm);fenceBox(X1,Z0,X1,-651,4,fm);fenceBox(X1,-639,X1,Z1,4,fm);
 addStatic(boxG(3.4,2.8,3.4),camoMat,X1+9,0,-660);addStatic(boxG(3.8,.3,3.8),cm(0x2f3620,.8),X1+9,2.8,-660);addSolid(X1+7.3,X1+10.7,-661.7,-658.3,3);
 groundRect(X0+8,X1-8,-556,-540,decal(M({map:asphaltTex,roughness:.85})),.04);for(let x=X0+20;x<X1-20;x+=14)addStatic(GEO.box,decal(cm(0xf2f2f2,.7)),x,.07,-548,0,7,.03,.5,{noShadow:true});
 for(const [sx,sz,ry] of [[X1+.3,-700,Math.PI/2],[X1+.3,-580,Math.PI/2],[-600,Z1+.3,0],[-700,Z1+.3,0]])signMesh('SPERRGEBIET – BETRETEN VERBOTEN',9,1.1,sx,2.6,sz,ry,'#b8860b','#111111',.6,40);
 building(-700,-720,40,26,12,'warehouse');building(-620,-720,40,26,12,'warehouse');building(-500,-560,30,14,8,'office');
 for(const [tx,tz] of [[X0+6,Z0+6],[X1-6,Z0+6],[X0+6,Z1-6],[X1-6,Z1-6]]){for(const [lx,lz] of [[-1.5,-1.5],[1.5,-1.5],[-1.5,1.5],[1.5,1.5]])addStatic(GEO.box,cm(0x4a4f3a,.8),tx+lx,5,tz+lz,0,.3,10,.3);addStatic(boxG(4.4,2.6,4.4),camoMat,tx,10,tz);addStatic(GEO.cone,cm(0x3a3f2a,.8),tx,13.4,tz,0,3.4,1.6,3.4);addSolid(tx-2.2,tx+2.2,tz-2.2,tz+2.2,13);}
 addStatic(GEO.cyl,cm(0x8a8f96,.5,.6),-700,6,-600,0,.6,12,.6);addStatic(GEO.blob,cm(0xdddddd,.5,.4),-700,12.5,-600,0,4,1.2,4);addSolid(-701,-699,-601,-599,12);
 for(const p of MIL.pads)helipad(p.x-MO.x,p.z-MO.z);
 signMesh('FORT ADLER – SPERRGEBIET',16,1.6,X1+.3,6,-680,Math.PI/2,'#3a4228','#ffd23a',.8,40);
 ZONES.push({name:'Fort Adler – Sperrgebiet',x0:X0,x1:X1,z0:Z0,z1:Z1,military:true});}
function buildStadium(){const SX=-175,SZ=-640,RX=98,RZ=80;
 const pitch=canvasTex(512,320,(g,w,h)=>{for(let i=0;i<10;i++){g.fillStyle=i%2?'#3f8f3a':'#4a9c42';g.fillRect(i*w/10,0,w/10,h);}g.strokeStyle='#f2f2f2';g.lineWidth=4;g.strokeRect(20,20,w-40,h-40);g.beginPath();g.moveTo(w/2,20);g.lineTo(w/2,h-20);g.stroke();g.beginPath();g.arc(w/2,h/2,40,0,7);g.stroke();g.strokeRect(20,h/2-60,60,120);g.strokeRect(w-80,h/2-60,60,120);});
 const pm=new THREE.Mesh(new THREE.PlaneGeometry(120,76),decal(M({map:pitch,roughness:.95})));pm.rotation.x=-Math.PI/2;pm.position.set(SX,.03,SZ);pm.receiveShadow=true;scene.add(pm);
 const seatM=[cm(0x2e86de,.7),cm(0xdddddd,.7),cm(0xc0392b,.7)];
 for(let k=0;k<44;k++){const a=k/44*Math.PI*2;if(Math.abs(Math.cos(a))>.985)continue;const px=SX+Math.cos(a)*(RX+8),pz=SZ+Math.sin(a)*(RZ+8);const ry=Math.atan2(SX-px,SZ-pz),fx=Math.sin(ry),fz=Math.cos(ry);
  addStatic(boxG(14.5,6,9),pickR(seatM),px+fx*4,0,pz+fz*4,ry);addStatic(boxG(14.5,12,7),seatM[1],px-fx*4,0,pz-fz*4,ry);addStatic(boxG(15,.6,12),roofMat,px-fx*3,14.5,pz-fz*3,ry);addSolid(px-8,px+8,pz-8,pz+8,15);}
 const flm=new THREE.MeshStandardMaterial({color:0x222222,emissive:0xfff4d6,emissiveIntensity:0});glowMats.push(flm);
 for(const a of [.6,2.5,3.8,5.7]){const px=SX+Math.cos(a)*(RX+24),pz=SZ+Math.sin(a)*(RZ+24);addStatic(GEO.cyl,cm(0x8a8f96,.5,.6),px,17,pz,0,.5,34,.5);const lp=mesh(new THREE.BoxGeometry(6,3,.6),flm,px,35,pz,false);lp.lookAt(SX,0,SZ);scene.add(lp);addSolid(px-.6,px+.6,pz-.6,pz+.6,34);}
 signMesh('SOLARA-ARENA',16,2.4,SX+RX+15,13,SZ,Math.PI/2,'#0d2a4a','#ffffff',1,60);
 ZONES.push({name:'Solara-Arena',x0:SX-RX-20,x1:SX+RX+20,z0:SZ-RZ-20,z1:SZ+RZ+20});}
