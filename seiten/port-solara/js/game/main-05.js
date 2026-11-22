'use strict';
const missions=[
 {name:'Prolog: Neuanfang',contact:'mila',reward:250,resume:true,steps:[
  {type:'goto',pos:{x:JX,z:COAST+3},text:'Lauf zum gelben Marker',say:['Mila (Telefon)','{n}? Hier ist Mila – ich war die Mechanikerin deines Vaters. Du bist kaum angekommen und hast schon Ärger am Hals. Hör zu, ich lotse dich raus.'],tut:'<k>W</k><k>A</k><k>S</k><k>D</k> laufen<br><b>Maus</b> umsehen – vorher einmal ins Bild klicken<br><k>P</k> oder <k>Esc</k> öffnet das Pausemenü mit großer Karte'},
  {type:'goto',pos:{x:nodeX(1),z:nodeX(N-1)+42},text:'Sprinte zum nächsten Marker',say:['Mila (Telefon)','Gut so. Jetzt schneller – halt Shift gedrückt!'],tut:'<k>Shift</k> gedrückt halten = sprinten<br><k>Leertaste</k> springen'},
  {type:'goto',pos:{x:nodeX(1)+2,z:nodeX(N-1)+30},r:2.2,text:'Hol dir die Sporttasche',say:['Mila (Telefon)','Siehst du die blaue Sporttasche direkt vor dir? Da hab ich dir was reingepackt. Schnapp sie dir!'],tut:'Lauf in den Marker, um Gegenstände aufzuheben',onStart:()=>showBag(true,nodeX(1)+2,nodeX(N-1)+30),onDone:()=>{showBag(false);giveWeapon('bat',0);giveWeapon('pistol',60);toast('Baseballschläger + Pistole erhalten!');}},
  {type:'check',pos:{x:nodeX(1)+9.5,z:nodeX(N-1)+24},noHeat:true,text:'Schlag den Sandsack K.O.',say:['Mila (Telefon)','Erst mal aufwärmen. Zeig dem Sandsack, wer der Boss ist!'],tut:'<k>1</k> Faust · <k>3</k> Baseballschläger · <b>Mausrad</b> wechselt die Waffe<br><b>Linksklick</b> = zuschlagen',onStart:()=>{clearDummies();tutBag=makeDummy(nodeX(1)+9.5,nodeX(N-1)+24,'bag');},check:()=>tutBag&&tutBag.state==='ko'},
  {type:'check',noHeat:true,text:'Triff die drei Zielscheiben auf der anderen Straßenseite',say:['Mila (Telefon)','Nicht schlecht. Jetzt zeig mir, ob du auch zielen kannst!'],tut:'<k>4</k> Pistole wählen<br><b>Rechtsklick</b> halten = zielen · <b>Linksklick</b> = schießen<br><k>R</k> = nachladen · Kopftreffer machen doppelten Schaden<br>Mehr Waffen gibt es bei <b>Waffen Kowalski</b> (W auf der Karte)',onStart:()=>{clearDummies();tutTargets=[16,24,32].map(dz=>{const d=makeDummy(nodeX(1)-9.5,nodeX(N-1)+dz,'target');d.c.g.rotation.y=Math.PI/2;return d;});},check:()=>tutTargets.every(d=>d.state==='ko'),onDone:()=>setTimeout(clearDummies,1500)},
  {type:'check',noHeat:true,text:'Wehr dich gegen die zwei Schläger!',say:['Mila (Telefon)','Pass auf! Zwei Typen von der Hafengang kommen auf dich zu – wehr dich!'],tut:'Manche Leute in der Stadt sind <b>aggressiv</b> und greifen dich an, wenn du ihnen zu nahe kommst.<br>Der grüne Balken unten links ist deine <b>Gesundheit</b>, der blaue deine <b>Schutzweste</b>.<br>Bei 0 wachst du im Krankenhaus auf.',onStart:()=>{tutThugs=[spawnGang(nodeX(1)+3,nodeX(N-1)-8,false,false),spawnGang(nodeX(1)-3,nodeX(N-1)-12,false,false)];},check:()=>allDown(tutThugs)},
  {type:'car',text:'Steig in den orangen Sportwagen',say:['Mila (Telefon)','Siehst du den orangen Flitzer? Der gehört ab jetzt dir. Steig ein!'],tut:'Geh nah ans Auto und drück <k>E</k>'},
  {type:'goto',pos:nd(4,9),car:true,text:'Fahr zum Marker',say:['Mila (Telefon)','Fahr los! Der gelbe Punkt auf der Minikarte zeigt dir, wohin.'],tut:'<k>W</k> Gas · <k>S</k> Bremse / rückwärts<br><k>A</k><k>D</k> lenken · <k>Leertaste</k> Handbremse<br><k>Q</k> wechselt den Radiosender<br>Die <b>Minikarte</b> unten links zeigt den gelben Zielpunkt'},
  {type:'lose',text:'Häng die Polizei ab',say:['Mila (Telefon)','Mist – eine Streife hat dich gesehen! Siehst du den Stern oben rechts? Fahr weit weg, bis er verschwindet.'],onStart:()=>setWanted(1),tut:'<b>★</b> = Fahndungslevel. Mehr Sterne = mehr Polizei.<br>1 Stern: Sie wollen dich <b>verhaften</b>. Ab 2 Sternen <b>schießen</b> sie zurück,<br>ab 3 Sternen kommt ein Polizeihubschrauber.<br>Hier im Prolog bleibt es bei <b>1 Stern</b> – üb erst mal in Ruhe.<br>Tipp: Im <b>Sprühwerk</b> (L) wird die Fahndung gelöscht.'},
  {type:'goto',pos:GARAGE,car:true,text:'Fahr zu Milas Werkstatt',say:['Mila (Telefon)','Sauber! Jetzt komm zu meiner Werkstatt. Ich muss dir etwas über deinen Vater erzählen.'],tut:'<k>H</k> hupen · <k>E</k> aussteigen<br>Neue Aufträge erkennst du an den <b>Buchstaben</b> auf der Karte (M, J, R, P).<br>Nebenmissionen, Läden und mehr findest du im Pausemenü (<k>P</k>).',end:['Mila','Da bist du ja, {n}! Willkommen in Port Solara. Komm in die Werkstatt, wenn du bereit bist – es geht um deinen Vater. Und schau dich ruhig um, die Stadt hat viel zu bieten.']}]},
 {name:'Ärger in der Werkstatt',contact:'mila',reward:800,intro:[["Mila","Da bist du ja, {n}. Du hast seine Augen, weißt du das?"],["P","Am Telefon hast du gesagt, du weißt etwas über meinen Vater."],["Mila","Teo hat vor zehn Jahren den Hafen geführt. Dann kam Krake – und Teo war über Nacht verschwunden."],["P","Und Krake?"],["Mila","Kassiert heute die ganze Stadt ab. Auch mich. Seine Leute sind schon auf dem Weg hierher!"]],steps:[
  {type:'check',noHeat:true,text:'Verteidige die Werkstatt: Schalte die ersten zwei Schläger aus',say:['Mila','Da kommen sie schon – durchs Tor! Hier, nimm meine Maschinenpistole – und zieh die Schutzweste an!'],tut:'<k>5</k> Maschinenpistole wählen<br><b>Linksklick gedrückt halten</b> = Dauerfeuer<br>Gegner haben einen <b>roten Pfeil</b> über dem Kopf und sind rot auf der Minikarte<br>Die <b>blaue Weste</b> (Balken unten links) schützt dich vor Treffern',
   onStart:()=>{giveWeapon('smg',150);selectWeapon(WI.smg);P.armor=100;P.hp=100;toast('Maschinenpistole & Schutzweste erhalten!');mGroup=[weakThug(GARAGE.x+16,GARAGE.z-12),weakThug(GARAGE.x+20,GARAGE.z-16)];},
   check:()=>allDown(mGroup)},
  {type:'check',noHeat:true,text:'Da kommen noch zwei – schalte sie aus!',say:['Mila','Gut gemacht! Achtung, von der anderen Seite kommen noch zwei – einer hat eine Pistole!'],tut:'Geh hinter einem Auto oder einer Wand in Deckung.<br>Wenn du verletzt bist: Kurz warten, deine Gesundheit lädt sich wieder auf.',
   onStart:()=>{mGroup=[weakThug(GARAGE.x-16,GARAGE.z-12,true),weakThug(GARAGE.x-20,GARAGE.z-9)];},
   check:()=>allDown(mGroup),end:['Mila','Danke, {n}. Die kommen so schnell nicht wieder. Geh mal zu Jax beim Tuning-Treff im Osten – der sucht schnelle Fahrer.']}]},
 {name:'Straßenrennen',contact:'jax',reward:1500,intro:[["Jax","Na sieh mal an – Milas neue Verstärkung."],["P","Mila sagt, du kennst jeden in Port Solara."],["Jax","Jeden, der schnell ist. Und jeden, der Krake hasst."],["P","Dann sind wir uns ja einig."],["Jax","Noch nicht. Erst schlägst du mich auf der Straße. Wer mit mir fährt, fährt vorne."]],steps:[
  {type:'car',text:'Steig in den Rennwagen, den Jax dir hingestellt hat',say:['Jax','Du bist also die Person, von der alle reden? Zeig mir, was du drauf hast. Da steht dein Wagen!'],onStart:()=>{const sp=SPECIAL['12,8'];const c=parkedCar(sp.cars[0].x,sp.cars[0].z,Math.PI,0xff8c1a,'sport');c.keep=true;mTrack({car:c});}},
  {type:'race',race:0,noHeat:true,text:'Gewinne das Rennen gegen Jax und seine Crew',tut:'Fahr durch alle Checkpoints. Nur Platz 1 zählt!',end:['Jax','Ha! Nicht schlecht, {n}. Wenn du Geld brauchst – ich hab bald einen richtig großen Job.']}]},
 {name:'Der Scharfschütze',contact:'mila',reward:2000,intro:[["Mila","Seit dem Angriff auf die Werkstatt beobachten sie uns – vom Pier aus."],["P","Dann sorgen wir dafür, dass sie nichts mehr sehen."],["Mila","Dein Vater hat immer gesagt: Wer dich beobachtet, hat schon angefangen."],["Mila","Ich hab dir etwas mit Zielfernrohr besorgt. Ruhig atmen, dann abdrücken."]],steps:[
  {type:'goto',pos:{x:PIERX-110,z:COAST+10},text:'Geh zum Aussichtspunkt am Strand',say:['Mila','Die Hafengang hat Späher auf dem Pier. Ich hab dir ein Scharfschützengewehr besorgt – geh zum Strand.'],onStart:()=>{giveWeapon('sniper',15);toast('Scharfschützengewehr erhalten!');}},
  {type:'check',noHeat:true,text:'Schalte die drei Späher auf dem Pier aus',say:['Mila (Telefon)','Siehst du sie? Ganz hinten auf dem Pier. Ruhig atmen …'],tut:'<k>8</k> Scharfschützengewehr wählen<br><b>Rechtsklick</b> halten = Zielfernrohr · <b>Linksklick</b> = Schuss<br>Wenn du triffst, werden die anderen Späher aufmerksam!',
   onStart:()=>{mGroup=[spawnGang(PIERX,WATER_Z+56,true,true),spawnGang(PIERX-2.5,WATER_Z+42,true,true),spawnGang(PIERX+2.5,WATER_Z+26,true,true)];},check:()=>allDown(mGroup),end:['Mila (Telefon)','Sauberer Job. Rocco vom Auto-Export im Hafen sucht jemanden mit Talent fürs … Autofahren. Er kannte deinen Vater – aber er steckt bis zum Hals in Schulden.']}]},
 {name:'Der Sammler',contact:'rocco',reward:4500,intro:[["Rocco","Ah, {n}. Mila hat nicht übertrieben – du bist wirklich Teos Kind."],["P","Du kanntest meinen Vater?"],["Rocco","Jeder kannte ihn. Und jeder schuldet in dieser Stadt irgendwem etwas. Ich schulde zu vielen zu viel."],["P","Was springt für mich dabei raus?"],["Rocco","Geld. Ein Sammler aus Übersee zahlt gut – für Autos, die eigentlich niemand verkauft."]],steps:[
  {type:'check',text:'Klau den Phantom X im Villenviertel',say:['Rocco','Ein Sammler aus Übersee will drei besondere Wagen: einen Phantom X, eine Royal Limousine und einen Thunder 70. Bring sie mir – möglichst ohne Kratzer!'],tut:'Teure Autos haben eine <b>Alarmanlage</b> – rechne mit der Polizei.<br>Abliefern geht nur ohne Fahndungssterne.',
   onStart:()=>{mCarsS=[parkedCar(nodeX(11)+20,nodeX(2)-12,0,0x111111,'super'),parkedCar(113,nodeX(7)-6.4,Math.PI/2,0x1a1a1a,'limo'),parkedCar(35,nodeX(14)-6.4,Math.PI/2,0x8b1e1e,'muscle')];mCarsS.forEach(c=>{c.keep=true;mTrack({car:c});});mCarsS[0].alarm=true;mCarsS[2].alarm=true;mGroup=[spawnGang(100,-9.5,false,true,{topC:0x111111}),spawnGang(120,-9.5,false,true,{topC:0x111111})];},
   track:()=>mCarsS[0].pos,check:()=>P.inCar===mCarsS[0]},
  {type:'check',text:'Bring den Phantom X zu Roccos Auto-Export',pos:EXPORTPOS,tick:()=>{if(mCarsS[0].mode==='wreck')failMission('Der Phantom X ist Schrott!');else if(wanted>0&&near(EXPORTPOS(),30))hintMsg='Häng erst die Polizei ab!';},check:()=>P.inCar===mCarsS[0]&&near(EXPORTPOS(),8)&&wanted===0,onDone:()=>{exportCar(mCarsS[0]);toast('Wagen 1/3 abgeliefert');}},
  {type:'check',text:'Hol dir die Royal Limousine vor dem Club NEON',track:()=>mCarsS[1].pos,tick:()=>{if(mCarsS[1].mode==='wreck')failMission('Die Limousine ist Schrott!');},check:()=>P.inCar===mCarsS[1]},
  {type:'check',text:'Bring die Limousine zu Rocco',pos:EXPORTPOS,tick:()=>{if(mCarsS[1].mode==='wreck')failMission('Die Limousine ist Schrott!');else if(wanted>0&&near(EXPORTPOS(),30))hintMsg='Häng erst die Polizei ab!';},check:()=>P.inCar===mCarsS[1]&&near(EXPORTPOS(),8)&&wanted===0,onDone:()=>{exportCar(mCarsS[1]);toast('Wagen 2/3 abgeliefert');}},
  {type:'check',text:'Schnapp dir den Thunder 70 an der Strandstraße',track:()=>mCarsS[2].pos,tick:()=>{if(mCarsS[2].mode==='wreck')failMission('Der Thunder 70 ist Schrott!');},check:()=>P.inCar===mCarsS[2]},
  {type:'check',text:'Bring den Thunder 70 zu Rocco',pos:EXPORTPOS,tick:()=>{if(mCarsS[2].mode==='wreck')failMission('Der Thunder 70 ist Schrott!');else if(wanted>0&&near(EXPORTPOS(),30))hintMsg='Häng erst die Polizei ab!';},check:()=>P.inCar===mCarsS[2]&&near(EXPORTPOS(),8)&&wanted===0,onDone:()=>{exportCar(mCarsS[2]);},end:['Rocco','Wunderschön. Der Sammler wird begeistert sein. Du hast Talent, {n}. Wir sehen uns.']}]},
 {name:'Heiße Ware',contact:'mila',reward:3000,intro:[["Mila","Sie haben meine Lieferung gestohlen. Ersatzteile für drei Monate!"],["P","Die Hafengang?"],["Mila","Wer sonst. Krake will, dass ich aufgebe – wie alle, die sich ihm in den Weg gestellt haben."],["Mila","Das Lager liegt im Industriegebiet. Hol sie zurück – egal wie."]],steps:[
  {type:'goto',pos:nd(1,4),text:'Fahr zum Lager im Industriegebiet',say:['Mila','Die Hafengang hat eine Lieferung von mir geklaut. Sie liegt in ihrem Lager im Industriegebiet. Hol sie zurück!'],onStart:()=>{mGroup=[spawnGang(nodeX(1)+9.5,nodeX(4)+14,true,true),spawnGang(nodeX(1)+9.5,nodeX(4)+32,false,true),spawnGang(nodeX(1)+22,nodeX(4)+9.5,true,true),spawnGang(nodeX(1)+40,nodeX(4)+9.5,false,true),spawnGang(nodeX(2)-9.5,nodeX(4)+26,true,true)];}},
  {type:'check',noHeat:true,text:'Schalte die Wachen am Lager aus',say:['Mila (Telefon)','Fünf Wachen. Such dir Deckung hinter Containern!'],tut:'Die <b>Schrotflinte</b> (<k>7</k>) ist auf kurze Distanz besonders stark.<br>Granaten (<k>0</k>) wirfst du mit Linksklick.',check:()=>allDown(mGroup)},
  {type:'goto',pos:{x:nodeX(1)+9.5,z:nodeX(4)+46},r:2.4,text:'Schnapp dir die Lieferung',onStart:()=>showBag(true,nodeX(1)+9.5,nodeX(4)+46),onDone:()=>{showBag(false);toast('Lieferung eingesammelt!');}},
  {type:'car',text:'Besorg dir ein Auto'},
  {type:'goto',pos:nd(N,10),car:true,text:'Bring die Lieferung ins Ostviertel',say:['Mila (Telefon)','Mist – die Polizei hat die Schüsse gehört! Bring die Ware trotzdem ins Ostviertel!'],onStart:()=>setWanted(Math.max(wanted,2)),tut:'Bei 2 Sternen <b>schießt die Polizei</b>. Fahr schnell und halt nicht an!',end:['Mila','Gute Arbeit. Ein Freund von mir, der Professor, will dich kennenlernen. Du findest ihn im Club NEON.']}]},
 {name:'Spion im Hafen',contact:'prof',reward:4000,intro:[["Der Professor","Setz dich, {n}. Ich habe dich eine Weile beobachtet."],["P","Und wer sind Sie?"],["Der Professor","Man nennt mich den Professor. Ich habe die Tresore der Nationalbank geplant – bis Krake sein Geld durch meine Bank gewaschen hat und ich dafür gefeuert wurde."],["Der Professor","Ich will zurück, was er mir genommen hat. Du willst wissen, was mit deinem Vater geschah. Wir haben denselben Feind."],["Der Professor","Heute brauche ich Geduld statt Gewalt. Ein Kurier der Hafengang holt etwas am Strand ab."]],steps:[
  {type:'goto',pos:{x:nodeX(11)+2,z:nodeX(13)-9},text:'Fahr zum Strandparkplatz und warte auf den Kurier',say:['Der Professor','Man sagt, du bist zuverlässig. Ein Kurier der Hafengang holt heute etwas am Strand ab. Folge ihm – aber unauffällig.']},
  {type:'check',text:'Folge dem Kurier unauffällig',tut:'Halte Abstand: nicht näher als 15 m, nicht weiter als 100 m.<br>Der Balken unten zeigt, ob der Abstand passt.',
   onStart:()=>{mCourier=routeCarSpawn('van',0x151515,[nd(10,13),nd(10,11),nd(6,11),nd(6,13),nd(3,13),nd(3,12),nd(1,12)],13);mCourier.keep=true;mTrack({car:mCourier});mTail={close:0,far:0};},
   track:()=>mCourier.pos,
   tick:(dt)=>{const d=Math.hypot(P.pos.x-mCourier.pos.x,P.pos.z-mCourier.pos.z);if(d<15)mTail.close+=dt;else mTail.close=Math.max(0,mTail.close-dt);if(d>100)mTail.far+=dt;else mTail.far=0;
    setProg(d<15?'Zu nah dran!':d>100?'Zu weit weg!':'Abstand gut',d<15?1-mTail.close/3:d>100?1-mTail.far/6:1,d<15||d>100?'#ff5050':'#5fd38a');
    if(mCourier.mode==='wreck')failMission('Der Kurier ist ausgeschaltet – das war nicht der Plan!');else if(mTail.close>3)failMission('Der Kurier hat dich bemerkt!');else if(mTail.far>6)failMission('Du hast den Kurier verloren!');},
   check:()=>mCourier.route.done},
  {type:'hold',pos:{x:nodeX(1)+9.5,z:nodeX(N-2)+16},r:3.5,time:15,label:'Gespräch belauschen',text:'Schleich dich zum Lauschposten und belausche das Gespräch',tut:'Bleib außerhalb der Sichtweite der Wachen.<br>Ein <b>!</b> über einem Kopf heißt: Du wirst gleich entdeckt!',
   onStart:()=>{const x=nodeX(1),z=nodeX(N-2);mGuards=[spawnPatrol(x-6,z-4,x+6,z-4),spawnPatrol(x-4,z+5,x-4,z-8),spawnPatrol(x+2,z-2,x+2,z-2,{boss:true,name:'Krake',hp:320,face:Math.PI})];mTalk=0;},
   tick:(dt,st)=>{if(stealthTick(mGuards,dt)){failMission('Du wurdest entdeckt!');return;}if(st.prog>2&&mTalk===0){mTalk=1;say('Krake','Die Lieferung kommt Donnerstag. Containerschiff, Pier drei.');}if(st.prog>7&&mTalk===1){mTalk=2;say('Kurier','Und die Polizei?');}if(st.prog>10&&mTalk===2){mTalk=3;say('Krake','Die Polizei ist bezahlt. Niemand stört uns.');}}},
  {type:'goto',pos:()=>CONTACTS.prof.pos(),text:'Bring die Infos zum Professor',tick:(dt)=>{if(mGuards.length&&near({x:nodeX(1),z:nodeX(N-2)},60)&&stealthTick(mGuards,dt))failMission('Du wurdest entdeckt!');},onDone:()=>{clearMission();},end:['Der Professor','Donnerstag, Pier drei … Interessant. Das wird Krake teuer zu stehen kommen.']}]},
 {name:'Juwelier-Überfall',contact:'prof',reward:8000,zones:['jewel'],intro:[["Der Professor","Der Kurier hat uns verraten, wohin Krakes Schwarzgeld fließt: zum Juwelier Brillant."],["P","Ein Überfall? Mitten in der Stadt?"],["Der Professor","Krakes Geld in Diamanten – leicht zu verstecken, leicht zu stehlen."],["Der Professor","Schnell rein, schnell raus. Und niemand wird verletzt, der es nicht verdient."]],steps:[
  {type:'check',text:'Steig in den Fluchtwagen hinter dem Club',say:['Der Professor','Krake wäscht sein Geld beim Juwelier Brillant. Wir holen es uns. Nimm den Fluchtwagen hinter dem Club.'],pos:()=>({x:105,z:nodeX(6)-6.4}),onStart:()=>{mGetaway=parkedCar(105,nodeX(6)-6.4,Math.PI/2,0x222222,'sport');mGetaway.keep=true;mTrack({car:mGetaway});},check:()=>P.inCar===mGetaway},
  {type:'goto',car:true,pos:()=>JEWEL.carStop,text:'Fahr zum Juwelier Brillant'},
  {type:'goto',pos:()=>JEWEL.inside,r:3,text:'Geh in den Laden',tut:'Steig aus (<k>E</k>) und geh hinein'},
  {type:'check',time:45,text:'Zerschlage alle Vitrinen und schnapp dir den Schmuck',say:['Verkäufer','Bitte nicht schießen! Nehmen Sie alles!'],tut:'Stell dich an eine Vitrine und drück <k>E</k>',
   onStart:()=>{alarmAt(new THREE.Vector3(JEWEL.inside.x,1,JEWEL.inside.z),40);for(const cs of jewelCases){cs.smashed=false;cs.glass.visible=true;cs.gem.visible=true;addInteract({x:cs.x,z:cs.z,r:1.9,label:'Vitrine zerschlagen',mission:true,use(){if(cs.smashed)return true;cs.smashed=true;cs.glass.visible=false;cs.gem.visible=false;glassSound(new THREE.Vector3(cs.x,1.5,cs.z));P.money+=500;cashSound();toast('+$500 Schmuck');return true;}});}setWanted(1);},
   check:()=>jewelCases.every(c=>c.smashed)},
  {type:'lose',text:'Flieh und häng die Polizei ab',onStart:()=>setWanted(3),tut:'Tipp: Im <b>Sprühwerk</b> (L auf der Karte) wird dein Auto neu lackiert und die Fahndung gelöscht.'},
  {type:'goto',pos:()=>CONTACTS.prof.pos(),text:'Bring die Beute zum Professor',end:['Der Professor','Hervorragend. Krake wird toben. Das ist erst der Anfang.']}]},
 {name:'Der Geldtransporter',contact:'jax',reward:10000,intro:[["Jax","Freitag, halb elf. Ein Geldtransporter – randvoll mit Krakes Wochenkasse."],["P","Und die Wachleute?"],["Jax","Private Sicherheitsfirma. Gehört Krake. Die sind dein Problem."],["Jax","Mit dem Geld bauen wir uns eine eigene Crew auf, {n}. Dann holen wir uns die Straße zurück."]],steps:[
  {type:'goto',pos:{x:nodeX(9)+10.5,z:nodeX(11)+4},text:'Geh zum Hinterhalt an der Route des Geldtransporters',say:['Jax','Jeden Freitag fährt ein Geldtransporter durch das Ostviertel. Wir halten ihn auf. Du übernimmst den Transporter!']},
  {type:'check',text:'Stoppe den Geldtransporter',tut:'Schieß auf den Transporter oder ramm ihn.<br>Aber jag ihn nicht in die Luft – sonst verbrennt das Geld!',
   onStart:()=>{mTruck=routeCarSpawn('armored',0x3d4249,[nd(13,12),nd(9,12),nd(9,8),nd(5,8),nd(5,4)],12);mTruck.heavy=true;mTruck.keep=true;mTrack({car:mTruck});},
   track:()=>mTruck.pos,tick:()=>{setProg('Geldtransporter',mTruck.hp/mTruck.maxHp,'#ff9a3c');if(mTruck.mode==='wreck')failMission('Der Transporter ist explodiert – das Geld ist verbrannt!');else if(mTruck.route.done&&mTruck.hp>1000)failMission('Der Transporter ist entkommen!');},
   check:()=>mTruck.hp<1000,onDone:()=>{mTruck.route.stop=true;}},
  {type:'check',text:'Schalte die Wachleute aus',say:['Wachmann','Überfall! Alle Einheiten, Überfall auf Transport sieben!'],onStart:()=>{setWanted(Math.max(wanted,2));const p=mTruck.pos,h=mTruck.h;mGroup=[spawnGang(p.x+Math.cos(h)*3,p.z-Math.sin(h)*3,true,false,{topC:0x3a3f47,pantsC:0x2a2d33,extra:3,weapon:'smg'}),spawnGang(p.x-Math.cos(h)*3,p.z+Math.sin(h)*3,true,false,{topC:0x3a3f47,pantsC:0x2a2d33,extra:3})];},check:()=>allDown(mGroup)},
  {type:'goto',r:3,pos:()=>({x:mTruck.pos.x-Math.sin(mTruck.h)*3.8,z:mTruck.pos.z-Math.cos(mTruck.h)*3.8}),text:'Schnapp dir die Geldsäcke hinten am Transporter',onDone:()=>{P.money+=3000;cashSound();toast('+$3.000 Bargeld');}},
  {type:'lose',text:'Häng die Polizei ab',onStart:()=>setWanted(3)},
  {type:'goto',pos:()=>CONTACTS.jax.pos(),text:'Bring das Geld zu Jax',end:['Jax','Das war ein Ding, {n}! Deinen Anteil hast du dir verdient.']}]},
 {name:'Lauschangriff',contact:'jax',reward:5000,zones:['burger'],intro:[["Jax","Kennst du Kommissar Brandt? Der schützt Krake seit Jahren."],["P","Ein Bulle auf Krakes Gehaltsliste."],["Jax","Er war damals auch für den Fall deines Vaters zuständig. Akte geschlossen nach drei Tagen."],["P","Drei Tage? Für einen Vermissten?"],["Jax","Eben. Gleich trifft er sich mit Krakes Buchhalter. Ich will wissen, worüber sie reden."]],steps:[
  {type:'goto',pos:()=>SPECIAL['8,10'].door,r:4,text:'Geh zur Burger Bude im Süden',say:['Jax','Brandt sitzt mit Krakes Buchhalter in der Burger Bude. Setz dich in ihre Nähe, hör zu – und lass die Waffe stecken.'],tut:'Läden, Restaurants und Werkstätten sind jetzt <b>begehbar</b> – die Türen öffnen sich, wenn du davor stehst.',
   onStart:()=>{const B=SPECIAL['8,10'];if(INV.cur!==0)selectWeapon(0);mPups=[puppet(B.seatA.x,B.seatA.z,Math.PI/2,'sit',{group:'mission',skin:{statur:2,haut:1,frisur:0,haarfarbe:5,oberteil:3,oberteilfarbe:0,hose:0,hosenfarbe:0,extra:0}}),puppet(B.seatB.x,B.seatB.z,-Math.PI/2,'sit',{group:'mission',skin:{statur:1,haut:0,frisur:1,haarfarbe:1,oberteil:3,oberteilfarbe:3,hose:4,hosenfarbe:1,extra:2}})];
    mCop=parkedPolice(B.carSpot.x,B.carSpot.z,Math.PI/2);mCop.keep=true;mCop.locked=true;mTrack({car:mCop});},tick:()=>calmTick(()=>!!interiorAt(P.pos.x,P.pos.z))},
  {type:'goto',pos:()=>SPECIAL['8,10'].listen,r:1.3,text:'Stell dich unauffällig an die Nische neben Brandt',tut:'Nicht zielen und nicht schießen – sonst fliegst du auf!',tick:()=>calmTick(()=>!!interiorAt(P.pos.x,P.pos.z))},
  {type:'hold',pos:()=>SPECIAL['8,10'].listen,r:1.9,time:22,label:'Gespräch belauschen',text:'Belausche das Gespräch – bleib in der Nähe',
   onStart:()=>{mTalk=0;},tick:(dt,st)=>{if(calmTick(()=>!!interiorAt(P.pos.x,P.pos.z)))return;
    if(st.prog>2&&mTalk===0){mTalk=1;say('Brandt','Krake zahlt diesmal doppelt? Wofür?');}
    if(st.prog>8&&mTalk===1){mTalk=2;say('Buchhalter','Für Ruhe. Nächste Woche läuft das große Ding im Hafen – keine Streifen an Pier drei.');}
    if(st.prog>14&&mTalk===2){mTalk=3;say('Brandt','Und Krakes Bargeld?');}
    if(st.prog>18&&mTalk===3){mTalk=4;say('Buchhalter','Liegt im Tresor der Nationalbank. Sicherer geht es nicht.');}}},
  {type:'hold',pos:()=>mCop?{x:mCop.pos.x-Math.sin(mCop.h)*2.9,z:mCop.pos.z-Math.cos(mCop.h)*2.9}:SPECIAL['8,10'].door,r:1.6,time:3,label:'Peilsender anbringen',text:'Bring hinten an Brandts Dienstwagen einen Peilsender an',say:['Jax (Telefon)','Gut gemacht! Jetzt noch der Peilsender – hinten an seinen Dienstwagen. Beeil dich!'],tut:'Stell dich ans Heck des Streifenwagens und bleib kurz stehen.'},
  {type:'goto',pos:()=>nd(7,10),r:10,time:30,text:'Verschwinde, bevor Brandt rauskommt',onDone:()=>{removePuppets('mission');mPups=[];}},
  {type:'goto',pos:()=>CONTACTS.jax.pos(),text:'Fahr zurück zu Jax',end:['Jax','Pier drei, nächste Woche … und Krakes Geld liegt in der Nationalbank. Das ist Gold wert, {n}. Der Professor wird das lieben.']}]},
 {name:'Luftschlag',contact:'mila',reward:4000,intro:[["Mila","Der Peilsender an Brandts Wagen hat geredet: Er hat drei Waffentransporter zur Hafengang eskortiert."],["P","Die Polizei liefert Krake Waffen?"],["Mila","Die Waffen kommen aus der Wüste. Wer auch immer sie liefert – er ist größer als Krake."],["P","Wie komme ich an die Transporter ran?"],["Mila","Von oben. Am Flughafen steht ein Kampfhubschrauber. Du musst nur irgendwie reinkommen …"]],steps:[
  {type:'goto',pos:()=>({x:APT.x0-20,z:-2}),text:'Fahr zum Flughafen Solara',say:['Mila (Telefon)','Der Kampfhubschrauber steht hinter dem Zaun am Flughafen. Der Sicherheitsdienst lässt niemanden rein – also brich ein!']},
  {type:'check',pos:HELIPOS,text:'Brich in den Flughafen ein und steig in den Kampfhubschrauber',tut:'Durchbrich die <b>Schranke</b> mit einem Auto (laut!) oder knack das <b>Schloss am Lieferanteneingang</b> (leise, Westseite im Norden).<br>Wenn der Sicherheitsdienst dich sieht, gibt es <b>Alarm</b>.',
   onStart:()=>{const a=ensureArmedHeli();HELIPOS.x=a.g.position.x;HELIPOS.z=a.g.position.z;},check:()=>P.inAir&&P.inAir.armed&&P.inAir.type==='heli'},
  {type:'check',noHeat:true,text:'Zerstöre die drei Waffen-Transporter der Hafengang',say:['Mila (Telefon)','Du bist drin! Flieg nach Westen ins Industriegebiet. Die Transporter sind rot auf der Minikarte.'],tut:'<b>Linksklick</b> = MG · <b>Rechtsklick</b> = Raketen<br>Mit der Maus zielst du, das Fadenkreuz zeigt wohin',
   onStart:()=>{mCars=[gangCar(nodeX(1)+3.5,nodeX(11)+22,0),gangCar(nodeX(2)-3.5,nodeX(12)+18,Math.PI),gangCar(nodeX(0)+4,nodeX(11)+40,0)];mGroup=[spawnGang(nodeX(1)+9.5,nodeX(11)+28,true,true),spawnGang(nodeX(2)-9.5,nodeX(12)+24,true,true)];},check:()=>mCars.length>0&&mCars.every(c=>c.mode==='wreck')},
  {type:'lose',text:'Häng die Polizei ab',say:['Mila (Telefon)','Bumm! Das hat die ganze Stadt gehört – jetzt ist die Polizei hinter dir her. Verschwinde!'],onStart:()=>setWanted(3),tut:'Bei 3 Sternen jagt dich ein <b>Polizeihubschrauber</b>.<br>Du kannst ihn abschießen – oder weit wegfliegen.'}]},
 {name:'Luftfracht',contact:'prof',reward:6000,intro:[["Der Professor","Ich brauche einen Piloten. Und jemanden, der Schlösser mag."],["P","Klingt ganz nach mir."],["Der Professor","Krake fliegt sein Bargeld auf die Insel. Ich will die Route kennen – jeden Kurs, jede Höhe."],["Der Professor","Der Lieferanteneingang am Flughafen ist schlecht bewacht. Flieg die Strecke ab und bring die Maschine zurück, bevor sie jemand vermisst."]],steps:[
  {type:'goto',pos:()=>({x:APT.x0-6,z:250}),r:4,text:'Fahr zum Lieferanteneingang des Flughafens',say:['Der Professor','Der Lieferanteneingang liegt an der Westseite im Norden. Knack das Schloss – und lass dich nicht vom Sicherheitsdienst erwischen.']},
  {type:'check',text:'Knack das Schloss am Lieferanteneingang',tut:'Stell dich vor das Tor und drück <k>E</k>. Bleib stehen, bis der Balken voll ist.',check:()=>APT.side.open},
  {type:'check',text:'Schleich dich zur Frachtmaschine und steig ein',tut:'Die Wachen sehen nur nach vorne. Ein <b>!</b> über dem Kopf heißt: Gleich wirst du entdeckt!<br>Die Frachtmaschine ist der große Flieger mit dem orangen Streifen.',
   onStart:()=>{mPlane=aircraft.find(a=>a.kind==='cargo'&&!a.dead&&a.mode==='parked');if(!mPlane)mPlane=placeAir(makePlane(0xdedede,false,'cargo'),730,-60,0);},track:()=>mPlane.g.position,check:()=>P.inAir===mPlane,onDone:()=>{if(APT.alarm)say('Der Professor (Funk)','Sie haben dich gesehen? Egal – heb ab, schnell!');}},
  {type:'check',time:240,text:'Flieg durch alle Ringe bis zur Insel',tut:'<k>W</k> Gas · <k>Leertaste</k> Nase hoch · <k>Shift</k> Nase runter · <k>A</k><k>D</k> Kurven<br>Die Frachtmaschine ist schwer – nimm Anlauf auf der Startbahn!',
   onStart:()=>{mRings=makeRings(AIR_COURSE1);},tick:()=>{ringTick(mRings);if(mPlane.dead)failMission('Das Flugzeug wurde zerstört!');else if(P.inAir!==mPlane&&!P.dead)failMission('Du hast das Flugzeug verlassen!');},check:()=>mRings.done,onDone:()=>{dropCrate(mPlane.g.position.clone());clearRings(mRings);mRings=null;toast('Fracht abgeworfen!');}},
  {type:'check',text:'Flieg zurück und lande auf dem Flughafen',airport:true,pos:{x:RWX,z:0},tick:()=>{if(mPlane.dead)failMission('Das Flugzeug wurde zerstört!');},check:()=>P.inAir===mPlane&&!mPlane.airborne&&mPlane.speed<8&&Math.abs(mPlane.g.position.x-RWX)<45&&Math.abs(mPlane.g.position.z)<380,end:['Der Professor','Saubere Landung. Und niemand weiß, wer du bist. Meine Freunde auf der Insel sind sehr zufrieden.']}]},
 {name:'Die Wanze',contact:'rocco',reward:5000,intro:[["Rocco","Krake trifft sich heute auf dem Schrottplatz. Ich will wissen, was er plant."],["P","Warum hilfst du uns eigentlich, Rocco?"],["Rocco","Weil Krake mir die Luft abdrückt. Jeden Monat ein bisschen mehr."],["Rocco","Unsichtbar wie ein Schatten, {n}. Hier ist die Wanze."]],steps:[
  {type:'goto',pos:{x:-500,z:90},text:'Geh zum Schrottplatz Müller',say:['Rocco','Krake trifft sich heute auf dem Schrottplatz. Seine Limousine steht dort. Kleb ihr diese Wanze unter – und lass dich nicht erwischen.']},
  {type:'check',text:'Platziere die Wanze an Krakes Limousine – unbemerkt!',tut:'Wachen sehen nur nach vorne. Schleich dich von hinten an.<br>Ein <b>!</b> über einem Kopf heißt: Du wirst gleich entdeckt!<br>An der Limousine <k>E</k> drücken.',
   onStart:()=>{mLimo=parkedCar(-640,100,Math.PI/2,0x111111,'limo');mLimo.locked=true;mLimo.lockMsg='Du sollst die Wanze anbringen, nicht das Auto klauen!';mLimo.keep=true;mTrack({car:mLimo});mGuards=[spawnPatrol(-690,60,-600,60),spawnPatrol(-600,140,-690,140),spawnPatrol(-660,72,-660,132),spawnPatrol(-565,80,-565,130)];mBug=false;
    addInteract({x:-640,z:100,r:3.4,label:'Wanze platzieren',mission:true,use(){mBug=true;tone(1200,.08,'sine',.05);toast('Wanze platziert!');return true;}});},
   track:()=>mLimo.pos,tick:(dt)=>{if(stealthTick(mGuards,dt))failMission('Du wurdest entdeckt!');},check:()=>mBug},
  {type:'check',text:'Verschwinde unbemerkt vom Schrottplatz',tick:(dt)=>{if(stealthTick(mGuards,dt))failMission('Du wurdest entdeckt!');},check:()=>Math.hypot(P.pos.x+640,P.pos.z-100)>110,onDone:()=>{clearMission();},end:['Rocco','Gut gemacht … sehr gut. Wir hören uns, {n}.']}]},
 {name:'Ungebetene Gäste',contact:'mila',reward:3500,zones:['home'],intro:[["Mila","{n}, mein Nachbar hat Licht in deiner Wohnung gesehen. Mitten am Tag."],["P","Ich war seit gestern nicht zu Hause."],["Mila","Dann sucht dort jemand etwas. Hast du irgendetwas von deinem Vater in der Wohnung?"],["P","Nur eine alte Geldkassette. Mit seinen Briefen."],["Mila","Dann fahr hin. Schnell – und sei vorsichtig."]],steps:[
  {type:'goto',pos:()=>SPECIAL['3,5'].door,r:3,text:'Fahr zu deiner Wohnung',say:['Mila','Jemand ist in deine Wohnung eingebrochen. Sieh nach – aber vorsichtig!']},
  {type:'check',noHeat:true,text:'Schalte die Einbrecher in deiner Wohnung aus',say:['Einbrecher','Da ist er! Schnappt ihn euch!'],tut:'In Räumen ist die <b>Schrotflinte</b> oder der <b>Baseballschläger</b> stark.<br>Gegner laufen dir durch Türen hinterher.',
   onStart:()=>{const h=SPECIAL['3,5'],hx=h.door.x-6,hz=h.door.z-8.9;mGroup=[spawnGang(hx-5.5,hz+2.2,true,false,{weapon:'pistol'}),spawnGang(hx-5,hz-5.2,false,false),spawnGang(hx+5.4,hz-3.6,true,false,{weapon:'smg'})];},check:()=>allDown(mGroup)},
  {type:'goto',pos:()=>{const h=SPECIAL['3,5'];return {x:h.door.x+3.2,z:h.door.z-12.5};},r:1.2,text:'Sieh im Schlafzimmer nach, was sie gesucht haben',onDone:()=>{toast('Deine Geldkassette ist weg!');}},
  {type:'check',text:'Ein Komplize flieht mit deiner Geldkassette – halte seinen Wagen auf!',say:['Mila (Telefon)','Ich seh ihn! Ein grauer Wagen rast vom Haus weg – lass ihn nicht entkommen!'],tut:'Ramm ihn oder schieß auf den Wagen, bis er liegen bleibt.',
   onStart:()=>{const c=routeCarSpawn('sedan',0x8a8f96,[nd(3,6),nd(5,6),nd(5,9),nd(8,9),nd(8,12),nd(11,12)],15);c.keep=true;mTrack({car:c});mCars=[c];mGetaway=null;mTruck=c;},
   track:()=>mTruck.pos,tick:()=>{setProg('Fluchtwagen',mTruck.mode==='wreck'?0:mTruck.hp/mTruck.maxHp,'#ff9a3c');if(mTruck.route&&mTruck.route.done&&mTruck.hp>mTruck.maxHp*.35&&mTruck.mode!=='wreck')failMission('Der Wagen ist entkommen!');},
   check:()=>mTruck.mode==='wreck'||mTruck.hp<mTruck.maxHp*.35,onDone:()=>{if(mTruck.route)mTruck.route.stop=true;}},
  {type:'goto',r:3,pos:()=>mTruck?{x:mTruck.pos.x,z:mTruck.pos.z}:SPECIAL['3,5'].door,text:'Hol dir deine Geldkassette zurück',onDone:()=>{P.money+=1500;cashSound();toast('+$1.500 – und ein Zettel im Handschuhfach');say('Zettel','„Adresse von Rocco. Kassette holen, Hälfte für Krake."');}},
  {type:'goto',pos:()=>CONTACTS.mila.pos(),text:'Fahr zu Mila in die Werkstatt',end:['Mila','Sie wollten die Briefe deines Vaters. Und deine Adresse hatten sie von Rocco … Wer mit Krake Geschäfte macht, verkauft auch Freunde, {n}.']}]},
 {name:'Verrat',contact:'rocco',reward:3000,intro:[["Rocco","Komm rein, {n}. Ich muss etwas Wichtiges mit dir besprechen."],["P","Warum ist es hier so still?"],["Rocco","Krake hat mir meine Schulden erlassen. Alle. Für einen einzigen Namen."],["P","Meinen."],["Rocco","Es tut mir leid. Wirklich."]],steps:[
  {type:'check',text:'Überlebe den Hinterhalt!',say:['Rocco','Es tut mir leid, {n}. Krake hat mir ein Angebot gemacht, das ich nicht ablehnen konnte … Brandt und seine Leute warten schon.'],
   onStart:()=>{setWanted(3);const ex=EXPORTPOS();mGroup=[];for(let k=0;k<5;k++){const a=k/5*Math.PI*2;mGroup.push(spawnCop(ex.x+Math.cos(a)*24,ex.z+Math.sin(a)*24));}mTimerS=25;},
   tick:(dt)=>{mTimerS-=dt;setProg('Überleben',1-Math.max(0,mTimerS)/25,'#ff5050');},check:()=>mTimerS<=0||allCopsDown(mGroup)},
  {type:'lose',text:'Entkomme und häng die Polizei ab'},
  {type:'goto',pos:()=>CONTACTS.mila.pos(),text:'Fahr zu Mila',end:['Mila','Rocco hat dich verkauft? Dann wird es Zeit, dass wir Krake das Handwerk legen. Aber zuerst brauchen wir Geld – sprich mit dem Professor.']}]},
 {name:'Der Insider',contact:'prof',reward:6000,zones:['bank'],intro:[["Der Professor","Rocco hat uns verkauft. Dann holen wir uns jetzt alles auf einmal."],["Der Professor","Die Nationalbank. Im Tresor liegt nicht nur Krakes Schwarzgeld – sondern sein Buch."],["P","Was für ein Buch?"],["Der Professor","Jede Zahlung, jeder Name. Brandt, der Hafenmeister – und der Mann, der Krake damals groß gemacht hat."],["Der Professor","Aber erst brauchen wir Augen und Ohren in der Bank. Heute wird spioniert."]],steps:[
  {type:'goto',pos:()=>BANK.lobby,r:3,text:'Geh als Kunde in die Nationalbank',say:['Der Professor','Du gehst als ganz normaler Kunde hinein. Keine Waffe in der Hand, kein Aufsehen.'],tut:'Die Bank ist begehbar – die Schiebetüren öffnen sich automatisch.<br>Wer in der Bank <b>zielt</b>, löst Alarm aus.',
   onStart:()=>{if(INV.cur!==0)selectWeapon(0);hideStaffIn(p=>Math.hypot(p.x-BANK.director.x,p.z-BANK.director.z)<.6);},tick:()=>calmTick(inBank)},
  {type:'hold',pos:()=>BANK.photo,r:2.2,time:5,label:'Tresortür fotografieren',text:'Fotografiere unauffällig die Tresortür hinter dem Schalter',tick:()=>calmTick(inBank),onDone:()=>{tone(1800,.05,'square',.03);flash(new THREE.Vector3(P.pos.x,P.pos.y+1.6,P.pos.z),.3);toast('Fotos gespeichert');}},
  {type:'goto',pos:()=>BANK.gateIn,r:1.4,text:'Schleich dich durch die Personaltür hinter den Schalter',say:['Der Professor (Funk)','Ein Wachmann patrouilliert hinter dem Schalter, ein zweiter steht vor dem Tresor. Warte, bis sie wegschauen.'],tut:'Bleib außerhalb des Blickfelds der Wachen.<br>Ein <b>!</b> über einem Kopf heißt: Du wirst gleich entdeckt!',
   onStart:()=>{const c=BANK.cx,b=BANK.bz;mGuards=[spawnPatrol(c-11,b-4.4,c+6,b-4.4,{topC:0x3a3f47,pantsC:0x2a2d33,extra:3}),spawnPatrol(c+1.2,BANK.ZB+1.5,c+1.2,BANK.ZB+1.5,{topC:0x3a3f47,pantsC:0x2a2d33,extra:3,face:0})];},
   tick:(dt)=>{if(calmTick(inBank))return;if(stealthTick(mGuards,dt))failMission('Ein Wachmann hat dich entdeckt!');}},
  {type:'hold',pos:()=>BANK.server,r:1.4,time:8,label:'Wachpläne kopieren',text:'Kopiere im Sicherheitsraum die Wachpläne vom Server',tut:'Der Wachmann im Sicherheitsraum starrt auf die Monitore – bleib hinter ihm.',tick:(dt)=>{if(calmTick(inBank))return;if(stealthTick(mGuards,dt))failMission('Ein Wachmann hat dich entdeckt!');}},
  {type:'hold',pos:()=>BANK.bugSpot,r:1.5,time:4,label:'Wanze anbringen',text:'Bring im Büro des Direktors eine Wanze an – er ist gerade zu Tisch',tick:(dt)=>{if(calmTick(inBank))return;if(stealthTick(mGuards,dt))failMission('Ein Wachmann hat dich entdeckt!');}},
  {type:'goto',pos:()=>BANK.backdoor,r:3,text:'Verlass die Bank durch den Notausgang im Büro',tick:(dt)=>{if(calmTick(inBank))return;if(stealthTick(mGuards,dt))failMission('Ein Wachmann hat dich entdeckt!');},onDone:()=>{clearMission();}},
  {type:'goto',pos:()=>CONTACTS.prof.pos(),text:'Bring die Pläne zum Professor',end:['Der Professor','Wachwechsel um zwölf, Bohrzeit dreißig Sekunden, Notausgang im Büro. Perfekt. Jetzt holen wir uns die Nationalbank.']}]},
 {name:'Der große Coup',contact:'prof',reward:25000,zones:['bank'],intro:[["Der Professor","Dank deiner Pläne kennen wir die Nationalbank besser als ihr Direktor."],["P","Und wie kommen wir an den Tresor?"],["Der Professor","Mit einem Bohrer, viel Mut und dreißig Sekunden. Jax wartet mit dem Hubschrauber am Strand."],["Der Professor","Das Geld teilen wir. Das Buch gehört dir, {n}. Du hast ein Recht auf die Wahrheit."]],steps:[
  {type:'goto',pos:()=>BANK.front,r:3.5,text:'Stürm die Nationalbank durch den Haupteingang',say:['Der Professor','Rein durch den Haupteingang, Wachen ausschalten, Tresortür aufbohren, Geld holen – und raus durch den Notausgang. Jax wartet mit dem Fluchthubschrauber am Strand.'],
   onStart:()=>{giveWeapon('smg',120);giveWeapon('shotgun',16);P.armor=100;toast('Munition & Schutzweste aufgefüllt!');}},
  {type:'check',text:'Schalte die Wachen in der Schalterhalle aus',say:['Wachmann','Überfall! Alle auf den Boden!'],tut:'Die Angestellten sind geflohen. Wachen kommen auch hinter dem Schalter hervor.',
   onStart:()=>{const c=BANK.cx,b=BANK.bz,G={topC:0x3a3f47,pantsC:0x2a2d33,extra:3};alarmAt(new THREE.Vector3(c,2,b),40);setWanted(Math.max(wanted,2));hideStaffIn(p=>{const I=interiorAt(p.x,p.z);return !!I&&/^bank/.test(I.name);});
    mGroup=[spawnGang(c-9,b+6,true,false,Object.assign({weapon:'smg'},G)),spawnGang(c+9,b+4,true,false,G),spawnGang(c+4,BANK.z1-4,true,false,G),spawnGang(c-6,b-5,true,false,G),spawnGang(c+8,b-5,true,false,Object.assign({weapon:'shotgun'},G))];},check:()=>allDown(mGroup)},
  {type:'goto',pos:()=>BANK.vaultApproach,r:2.5,text:'Geh durch die Personaltür hinter den Schalter zur Tresortür',tut:'Die <b>Personaltür</b> rechts neben dem Schalter führt hinter den Tresen.'},
  {type:'hold',pos:()=>BANK.vaultApproach,r:3.6,time:32,label:'Tresortür wird aufgebohrt',text:'Verteidige den Bohrer, bis die Tresortür offen ist – die Polizei stürmt herein!',tut:'Bleib im Kreis! Polizisten kommen durch die Schalterhalle.',
   onStart:()=>{setWanted(Math.max(wanted,3));mWave=5;mDrill=makeDrill(BANK.cx,BANK.ZB+.95);},
   tick:(dt)=>{drillTick(dt);mWave-=dt;if(mWave<=0){mWave=8;for(const dx of [-2.5,2.5]){const n=spawnCop(BANK.cx+dx,BANK.z1-2.2);mGroup.push(n);}}},
   onDone:()=>{removeDrill();BANK.vaultDoor.force=1;say('Der Professor (Funk)','Die Tür ist offen! Schnapp dir das Geld!');}},
  {type:'goto',pos:()=>BANK.vault,r:2.2,text:'Schnapp dir das Geld im Tresor',onDone:()=>{P.money+=10000;cashSound();toast('+$10.000 Bargeld & Gold!');setWanted(4);}},
  {type:'goto',pos:()=>BANK.backdoor,r:3,text:'Flieh durch den Notausgang im Büro des Direktors',say:['Der Professor (Funk)','Die Spezialeinheit kommt durch den Haupteingang – nimm den Notausgang hinten rechts!'],
   onStart:()=>{for(const dx of [-3,0,3])spawnCop(BANK.cx+dx,BANK.z1-2.5,{swat:true});}},
  {type:'check',text:'Flieh zum Fluchthubschrauber am Strand',pos:{x:PIERX-40,z:COAST+18},onStart:()=>{mHeli=ensureBeachHeli();},check:()=>P.inAir===mHeli,tut:'Mit 4 Sternen ist die halbe Stadt hinter dir her. Hauptsache weg!'},
  {type:'check',text:'Flieg zur Insel Solara Isla und lande dort',pos:{x:IX,z:IZ},check:()=>P.inAir&&Math.hypot(P.pos.x-IX,P.pos.z-IZ)<95&&P.pos.y<12,onDone:()=>{setWanted(0);},end:['Der Professor','Willkommen auf der Insel, {n}. Das Geld ist sicher – und das hier ist Krakes Buch. Lies die letzte Seite.']}]},
 {name:'Operation Adler',contact:'jax',reward:12000,intro:[["Jax","Ich hab in Krakes Buch geblättert. Die letzte Seite: Waffenlieferungen aus der Wüste. Unterschrift – Vulkan."],["P","Wer ist Vulkan?"],["Jax","Keine Ahnung. Aber die Waffen kommen über Fort Adler, und Krake will heute Abend verhandeln."],["Jax","Wenn das eine Falle ist, will ich etwas Großes im Rücken haben. Wir klauen ihren besten Kampfjet."]],steps:[
  {type:'goto',pos:{x:MIL.gate.x+40,z:MIL.gate.z},text:'Fahr zum Tor von Fort Adler',say:['Jax','Wenn du das Gelände betrittst, schießt das Militär sofort. Schnapp dir den Jet auf der Startbahn und flieg los!'],tut:'Im Sperrgebiet bekommst du sofort <b>4 Sterne</b> – genau wie in den großen Vorbildern.<br>Tipp: Mit einem <b>Panzer</b> aus dem Fort bist du fast unverwundbar (Linksklick = Kanone).'},
  {type:'check',text:'Brich in Fort Adler ein und steig in den Militärjet',onStart:()=>{let j=aircraft.find(a=>a.mil&&a.jet&&!a.dead);if(!j){j=placeAir(makePlane(0x4a5560,true),MIL.jet.x,MIL.jet.z,Math.PI/2);j.mil=true;j.name='Militärjet';}mJet=j;},track:()=>mJet.g.position,check:()=>P.inAir===mJet,tick:()=>{if(mJet.dead)failMission('Der Jet wurde zerstört!');}},
  {type:'lose',text:'Entkomme mit dem Jet und häng alle Verfolger ab',say:['Jax (Funk)','Du hast ihn! Jetzt nichts wie weg – die schicken Abfangjäger hinter dir her!'],tut:'Abfangjäger verfolgen dich. Schieß sie ab (<b>Linksklick</b> MG, <b>Rechtsklick</b> Raketen) oder flieg weit weg.',tick:()=>{if(mJet.dead)failMission('Der Jet wurde zerstört!');}},
  {type:'check',airport:true,text:'Lande den Jet auf dem Flughafen Solara',pos:{x:RWX,z:0},tick:()=>{if(mJet.dead)failMission('Der Jet wurde zerstört!');},check:()=>P.inAir===mJet&&!mJet.airborne&&mJet.speed<8&&Math.abs(mJet.g.position.x-RWX)<45&&Math.abs(mJet.g.position.z)<380,end:['Jax','Ein echter Militärjet! Krake wird sich noch wundern. Jetzt bist du bereit für den Showdown.']}]},
 {name:'Showdown am Pier',contact:'mila',reward:15000,intro:[["Mila","Krake will reden. Heute Abend, am Pier."],["P","Das ist eine Falle."],["Mila","Ich weiß. Das Buch liegt bei der Zeitung – wenn uns etwas passiert, erfährt die ganze Stadt, wen Krake bezahlt hat."],["Mila","Und {n} … frag ihn nach Teo. Er ist der Einzige, der es weiß."]],steps:[
  {type:'goto',pos:{x:PIERX,z:COAST+6},text:'Triff Krake am Strand',say:['Mila','Krake will verhandeln – am Pier. Das ist eine Falle, aber wir gehen trotzdem hin. Nimm alles mit, was du hast!'],onStart:()=>{giveWeapon('smg',90);giveWeapon('shotgun',24);giveWeapon('grenade',3);P.armor=100;toast('Munition & Schutzweste aufgefüllt!');
    mGroup=[spawnGang(PIERX-14,COAST+20,true,true),spawnGang(PIERX+15,COAST+22,false,true),spawnGang(PIERX-24,COAST+14,true,true),spawnGang(PIERX+26,COAST+16,true,true),spawnGang(PIERX-2,WATER_Z+18,true,true),spawnGang(PIERX+2,WATER_Z+34,true,true,{weapon:'smg'}),spawnGang(PIERX-2,WATER_Z+48,false,true),spawnGang(PIERX,WATER_Z+60,true,true,{boss:true,name:'Krake'})];}},
  {type:'check',noHeat:true,text:'Besiege die Hafengang und ihren Boss Krake',say:['Krake','Du hättest nicht kommen sollen, {n}. Der Hafen gehört mir!'],tut:'Krake hält viel mehr aus als normale Gegner.<br>Gesundheit findest du an den grünen Kreuzen.',check:()=>allDown(mGroup)},
  {type:'goto',pos:{x:PIERX,z:WATER_Z+58},text:'Triff Mila am Ende vom Pier',end:['Mila','Krake ist erledigt. Er hat geredet, {n} … über deinen Vater. Komm in die Werkstatt, wir müssen reden.']}]},
];
let resumeSi=0,mi=0,si=0,mission=null,mTimer=null,missionWait=1.2,storyDone=false,mCool=0;
// ---------- Helfer für Missionen in begehbaren Gebäuden ----------
let mDrill=null,mHidden=[],mPups=[],mCop=null,mSpark=0;
const inBank=()=>{const I=interiorAt(P.pos.x,P.pos.z);return !!I&&/^bank/.test(I.name);};
const marker=new THREE.Group();
{const beam=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.6,80,24,1,true),new THREE.MeshBasicMaterial({color:new THREE.Color(1.6,1.2,.2),transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));beam.position.y=40;marker.add(beam);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(3,.18,8,40),new THREE.MeshBasicMaterial({color:new THREE.Color(3,2.2,.4)}));ring.rotation.x=Math.PI/2;ring.position.y=.5;marker.add(ring);}
marker.visible=false;scene.add(marker);
// ---------- Pfeile in der Säule: zeigen, wohin es weitergeht ----------
const markerArrow=new THREE.Group(),markerFlag=new THREE.Group();let markerNext=null;
{const chev=(()=>{const s=new THREE.Shape();s.moveTo(-1,-.25);s.lineTo(0,.75);s.lineTo(1,-.25);s.lineTo(1,-.82);s.lineTo(0,.18);s.lineTo(-1,-.82);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:.16,bevelEnabled:true,bevelSize:.05,bevelThickness:.05,bevelSegments:2});g.translate(0,0,-.08);return g;})();
 const glowM=new THREE.MeshBasicMaterial({color:new THREE.Color(1.9,1.35,.18),fog:false,toneMapped:true}),edgeM=new THREE.MeshBasicMaterial({color:0x1a1205,fog:false,side:THREE.BackSide});
 for(let k=0;k<2;k++){const c=new THREE.Group();const a=new THREE.Mesh(chev,glowM),o=new THREE.Mesh(chev,edgeM);o.scale.set(1.13,1.16,1.6);c.add(o,a);c.position.y=k*1.05;c.name='chev'+k;markerArrow.add(c);}
 markerArrow.scale.setScalar(2.1);marker.add(markerArrow);
 const pole=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,5,8),new THREE.MeshBasicMaterial({color:0xdddddd,fog:false}));pole.position.y=2.5;markerFlag.add(pole);
 const fl=new THREE.Mesh(new THREE.PlaneGeometry(3.6,2.3,8,1),new THREE.MeshBasicMaterial({map:canvasTex(128,80,(g)=>{for(let x=0;x<8;x++)for(let y=0;y<5;y++){g.fillStyle=(x+y)%2?'#111':'#f4f4f4';g.fillRect(x*16,y*16,16,16);}}),side:THREE.DoubleSide,fog:false}));
 fl.position.set(1.85,4.4,0);markerFlag.add(fl);markerFlag.userData.cloth=fl;markerFlag.visible=false;marker.add(markerFlag);}
const cMarker=new THREE.Group();const cLabel=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthWrite:false,fog:false}));
{const beam=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,30,20,1,true),new THREE.MeshBasicMaterial({color:new THREE.Color(1.8,1.4,.3),transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));beam.position.y=15;cMarker.add(beam);cLabel.position.y=3.2;cLabel.scale.setScalar(1.6);cMarker.add(cLabel);}
cMarker.visible=false;scene.add(cMarker);
const labelTexCache={};
const resolvePos=p=>typeof p==='function'?p():p;

// ================= STORY AKT 2: DIE WÜSTE (Missionen 17–32) =================
CONTACTS.dusty={name:'Dusty',label:'D',col:'#e0a050',pos:()=>({x:1188,z:-2252})};
CONTACTS.nova={name:'Nova',label:'N',col:'#ff5ad6',pos:()=>({x:-584,z:352})};
const RD=n=>ROADS.find(r=>r.name===n);
const bikeDown=c=>c.mode==='wreck'||c.mode==='tumble'||!c.rider&&c.bike||c.hp<c.maxHp*.5;
const GEIER={topC:0x3a2a1a,pantsC:0x1b1b1b,extra:7};
const HANGAR=()=>({x:1185,z:-2246});
const DUSTC=()=>({x:(SITES.dust.x0+SITES.dust.x1)/2,z:(SITES.dust.z0+SITES.dust.z1)/2});
const TRAILER_GATE=()=>({x:245,z:SITES.trailer.z0-6});
const OBS=()=>({x:(SITES.observ.x0+SITES.observ.x1)/2,z:(SITES.observ.z0+SITES.observ.z1)/2});
const PEAK=()=>({x:(SITES.peak.x0+SITES.peak.x1)/2,z:(SITES.peak.z0+SITES.peak.z1)/2});
const AIR_COURSE2=()=>[[1060,30,-2318],[800,70,-2250],[520,85,-2290],[160,80,-2520],[-120,75,-2950],[300,90,-3120],[780,95,-2900],[1060,80,-2620],[1180,45,-2400]].map(p=>new THREE.Vector3(p[0],terrainH(p[0],p[2])+p[1],p[2]));
let mBoat=null,mBus=null,mSheriff=null,mBomb=0,mPumps=[],mVul=null;
missions.push(
 {name:'Neue Horizonte',contact:'mila',reward:3000,intro:[["Mila","Krake hat geredet, bevor sie ihn abgeführt haben. Brandt sitzt auch."],["P","Was hat er über meinen Vater gesagt?"],["Mila","Nur einen Satz: Teo lebt. Und Vulkan weiß, wo er ist."],["P","Dann fahre ich in die Wüste."],["Mila","Fahr nach Dustwater zu Dusty. Er ist früher Fracht für deinen Vater geflogen."]],steps:[
  {type:'car',text:'Besorg dir ein Auto',say:['Mila','Dusty betreibt das Flugfeld bei Dustwater. Er weiß alles, was in der Wüste passiert.']},
  {type:'goto',car:true,r:30,pos:DUSTC,text:'Fahr über die Nordautobahn nach Dustwater',say:['Mila (Telefon)','Folge der Nordautobahn über die Hügel und den Pass. Dahinter beginnt die Calvera-Wüste.'],tut:'Die Insel ist jetzt viel größer: <b>Landstraßen</b> verbinden die Stadt mit Hügeln, Bergen und Wüste.<br>In der <b>großen Karte</b> kannst du mit dem Mausrad zoomen und mit der Maus verschieben.'},
  {type:'goto',r:4,pos:HANGAR,text:'Triff Dusty am Hangar des Flugfelds',end:['Dusty','Teos Kind … ich hätte nicht gedacht, dass ich das noch erlebe. Willkommen am Ende der Welt, {n}. Komm rein – wir haben ein Geier-Problem.']}]},
 {name:'Staubwolke',contact:'dusty',reward:3500,intro:[["Dusty","Ich weiß, du hast Fragen über Teo. Erst die Arbeit, dann die alten Geschichten."],["P","Was ist passiert?"],["Dusty","Die Geier haben meinen Tankwagen ausgeräumt. Werkzeug, Ersatzteile, alles."],["Dusty","Eine Bikergang – sie arbeiten für Vulkan. Drei von ihnen fahren gerade mit meinem Zeug Richtung Westen!"]],steps:[
  {type:'check',text:'Steig in Dustys Pickup',onStart:()=>{const c=parkedCar(1160,-2262,-Math.PI/2,0x8a5a2b,'pickup');c.keep=true;mTrack({car:c});mGetaway=c;},track:()=>mGetaway.pos,check:()=>P.inCar===mGetaway},
  {type:'check',text:'Stoppe die drei Geier-Biker',say:['Dusty (Funk)','Sie fahren die Wüstenstraße Richtung Fort Adler. Ramm sie von den Maschinen!'],tut:'Motorradfahrer fliegen runter, wenn du sie <b>rammst</b> oder anschießt.',
   onStart:()=>{mCars=[0,1,2].map(k=>{const c=routeOnRoad('bike',0x1a1a1a,'Wüstenstraße',60+k*26,-20,21+k,2);c.keep=true;c.gang=true;return c;});},
   track:()=>{const c=mCars.find(q=>!bikeDown(q))||mCars[0];return c.pos;},
   tick:()=>{const left=mCars.filter(q=>!bikeDown(q));setProg(`Biker übrig: ${left.length}`,1-left.length/3,'#ff9a3c');if(left.some(q=>q.route.done))failMission('Die Biker sind entkommen!');},
   check:()=>mCars.every(bikeDown),onDone:()=>{const c=mCars[mCars.length-1];showBag(true,c.pos.x+2,c.pos.z+2);mWave=0;}},
  {type:'goto',r:3,pos:()=>({x:bagMesh.position.x,z:bagMesh.position.z}),text:'Sammle die Kiste mit den Teilen ein',onDone:()=>{showBag(false);toast('Ersatzteile eingesammelt!');}},
  {type:'goto',r:6,pos:HANGAR,text:'Bring die Teile zurück zum Flugfeld',end:['Dusty','Nicht schlecht für ein Stadtkind! Jetzt kann ich die alte Bessy wieder flottmachen.']}]},
 {name:'Erster Flug',contact:'dusty',reward:4000,intro:[["Dusty","Die alte Bessy fliegt wieder. Dein Vater hat sie mir geschenkt, wusstest du das?"],["P","Er war Pilot?"],["Dusty","Der beste. Wir haben zusammen Ware durch die Wüste geflogen. Nicht immer legale."],["Dusty","Die Geier fliegen heute dieselbe Route. Flieg sie ab und sag mir, was du siehst."]],steps:[
  {type:'check',text:'Steig in die Propellermaschine auf dem Flugfeld',onStart:()=>{mPlane=aircraft.find(a=>a.name==='Propellermaschine'&&!a.dead);if(!mPlane){mPlane=placeAir(makePlane(0xe8d9b0,false),1236,-2318,-Math.PI/2);mPlane.name='Propellermaschine';}mTrack({air:mPlane});},track:()=>mPlane.g.position,check:()=>P.inAir===mPlane,
   tut:'<k>W</k> Gas · <k>Leertaste</k> Nase hoch · <k>Shift</k> Nase runter · <k>A</k><k>D</k> Kurven<br>Starte nach Westen über die Sandpiste!'},
  {type:'check',time:260,text:'Flieg durch alle Ringe der Schmuggelroute',onStart:()=>{mRings=makeRings(AIR_COURSE2());},tick:()=>{ringTick(mRings);if(mPlane.dead)failMission('Das Flugzeug wurde zerstört!');else if(P.inAir!==mPlane&&!P.dead)failMission('Du hast das Flugzeug verlassen!');},check:()=>mRings.done,onDone:()=>{clearRings(mRings);mRings=null;say('Dusty (Funk)','Ein Konvoi am Ölfeld … und Lagerzelte beim Salzsee. Komm zurück!');}},
  {type:'check',text:'Lande wieder auf dem Flugfeld Dustwater',pos:{x:1000,z:-2318},tick:()=>{if(mPlane.dead)failMission('Das Flugzeug wurde zerstört!');},check:()=>P.inAir===mPlane&&!mPlane.airborne&&mPlane.speed<8&&mPlane.g.position.x>860&&mPlane.g.position.x<1260&&Math.abs(mPlane.g.position.z+2318)<26,
   end:['Dusty','Sauber gelandet! Die Geier planen etwas Großes – und sie haben es auf den Trailerpark abgesehen.']}]},
 {name:'Trailerpark-Krieg',contact:'dusty',reward:5000,intro:[["Dusty","Die Geier wollen den Trailerpark Rostbach. Vulkan braucht das Land für eine neue Landebahn."],["P","Und die Leute, die dort wohnen?"],["Dusty","Die haben nichts außer ihren Wohnwagen. Und jetzt dich. Nimm das Sturmgewehr."]],steps:[
  {type:'goto',r:10,pos:TRAILER_GATE,text:'Fahr zum Trailerpark Rostbach',onStart:()=>{giveWeapon('rifle',150);P.armor=100;toast('Sturmgewehr & Schutzweste erhalten!');}},
  {type:'check',noHeat:true,text:'Welle 1: Schalte die Geier aus',say:['Bewohnerin','Da kommen sie! Bitte helft uns!'],onStart:()=>{const g=TRAILER_GATE();mGroup=ring(g.x,g.z-40,{n:5,d:16}).map(([x,z])=>geier(x,z));},check:()=>allDown(mGroup)},
  {type:'check',noHeat:true,text:'Welle 2: Die Biker kommen!',onStart:()=>{const g=TRAILER_GATE();mGroup=ring(g.x+40,g.z-60,{n:4,d:12}).map(([x,z])=>geier(x,z,true,{weapon:'smg'}));mCars=[0,1].map(k=>{const c=routeOnRoad('bike',0x111111,'Wüstenstraße',260+k*30,140,15,2);c.gang=true;c.keep=true;return c;});},check:()=>allDown(mGroup)},
  {type:'check',noHeat:true,text:'Schalte den Anführer „Schakal" aus',say:['Schakal','Ihr wollt Krieg? Den könnt ihr haben!'],onStart:()=>{const g=TRAILER_GATE();mGroup=[geier(g.x-20,g.z-55,true,{boss:true,name:'Schakal',hp:340,weapon:'shotgun'}),geier(g.x-26,g.z-50),geier(g.x-14,g.z-50)];},check:()=>allDown(mGroup),
   end:['Bewohnerin','Danke! Ohne dich hätten wir alles verloren. Die Geier werden sich das merken …']}]},
 {name:'Graffiti-Sprint',contact:'nova',reward:3500,intro:[["Nova","Hey, du bist {n}, oder? Die Person, die den Trailerpark verteidigt hat. Ich bin Nova."],["P","Und was willst du von mir?"],["Nova","Die Geier bedrohen meinen kleinen Bruder Kai. Ich bau Sachen, ich hack Sachen – aber ich brauch jemanden, der nicht wegläuft."],["Nova","Erst zeig mir, dass du mithalten kannst."]],steps:[
  {type:'check',text:'Steig in Novas Sportwagen',onStart:()=>{const c=parkedCar(-578,365,0,0xff5ad6,'sport');c.keep=true;mTrack({car:c});mGetaway=c;},track:()=>mGetaway.pos,check:()=>P.inCar===mGetaway},
  {type:'race',race:4,noHeat:true,text:'Gewinne den Küstensprint gegen Novas Crew',tut:'Die Pfeile in den Säulen zeigen dir, wo es weitergeht.',end:['Nova','Okay, du bist gut. Richtig gut. Ich melde mich, wenn ich was über die Geier weiß.']}]},
 {name:'Sternenhimmel',contact:'nova',reward:5500,intro:[["Nova","Die Geier benutzen die alte Sternwarte als Funkstation. Vulkan gibt von dort seine Befehle."],["P","Und du willst mithören."],["Nova","Ich will seine Stimme hören. Steck diesen Stick in ihren Rechner – aber sie haben Wachen."]],steps:[
  {type:'goto',r:30,pos:()=>({x:OBS().x,z:OBS().z+24}),text:'Fahr zur Sternwarte in den Solara Hills'},
  {type:'check',text:'Schalte die Wachen an der Sternwarte aus',onStart:()=>{const o=OBS();mGroup=ring(o.x,o.z,{n:5,d:20,a:.3}).map(([x,z])=>geier(x,z,true,{weapon:Math.random()<.4?'smg':'pistol'}));},check:()=>allDown(mGroup)},
  {type:'hold',pos:()=>({x:OBS().x,z:OBS().z+16}),r:4,time:25,label:'Download läuft',text:'Bleib am Rechner, bis der Download fertig ist',tut:'Bleib im Kreis – die Geier schicken Verstärkung!',
   onStart:()=>{mWave=6;},tick:(dt)=>{mWave-=dt;if(mWave<=0){mWave=8;const o=OBS();for(let k=0;k<2;k++){const a=Math.random()*6.28;geier(o.x+Math.cos(a)*45,o.z+Math.sin(a)*45);}}}},
  {type:'lose',text:'Verschwinde – die Polizei ist unterwegs!',onStart:()=>setWanted(2),end:['Nova','Jackpot! Die Geier wollen am Freitag etwas aus Fort Adler holen. Und sie haben ein Relais auf dem Mount Solara.']}]},
 {name:'Gipfelsturm',contact:'nova',reward:4500,intro:[["Nova","Der Download hat geklappt. Vulkans Funkrelais steht auf dem Mount Solara – mit der Antenne kann ich ihn orten."],["P","Da oben? Mit dem Auto?"],["Nova","Mit allem, was Räder hat. Du hast drei Minuten, bevor sie merken, dass wir mithören."]],steps:[
  {type:'check',text:'Steig in den Geländewagen an der Bergstraße',onStart:()=>{const q=RP('Bergstraße Mount Solara',8);const c=parkedCar(q.x+6,q.z+3,-Math.PI/2,0x3b5323,'suv');c.keep=true;mTrack({car:c});mGetaway=c;},track:()=>mGetaway.pos,check:()=>P.inCar===mGetaway},
  {type:'goto',time:180,car:true,r:16,pos:()=>RP('Bergstraße Mount Solara',-6),text:'Fahr die Bergstraße hoch bis zum Gipfel',tut:'Steile Straßen bremsen dich. Halte Schwung in den Kurven!'},
  {type:'goto',r:3.2,pos:()=>({x:PEAK().x+2.2,z:PEAK().z}),text:'Hol dir die Antenne vom Funkmast',onDone:()=>{tone(1200,.1,'sine',.06);toast('Antenne gesichert!');}},
  {type:'goto',r:22,pos:()=>({x:290,z:-2060}),text:'Bring die Antenne zur Kaktus-Tankstelle',end:['Nova','Die Antenne ist Gold wert. Jetzt hören wir jedes Wort der Geier mit.']}]},
 {name:'Salzfieber',contact:'dusty',reward:4000,intro:[["Dusty","Ich hab mir Novas Aufnahmen angehört, {n}."],["P","Und?"],["Dusty","Vulkans Stimme … ich kenne sie irgendwoher. Ich bin mir nur noch nicht sicher."],["Dusty","Er fährt jeden Abend Rennen auf dem Salzsee. Schlag seine Crew – dann fangen seine Leute an zu zweifeln."]],steps:[
  {type:'car',text:'Besorg dir ein schnelles Auto'},
  {type:'goto',car:true,r:20,pos:()=>({x:-300,z:-2470}),text:'Fahr zum Salzsee'},
  {type:'race',race:3,noHeat:true,text:'Schlag Vulkans Crew auf dem Salzsee',end:['Dusty','Ha! Vulkan hat getobt. Das vergisst er dir nie – sei vorsichtig, {n}.']}]},
 {name:'Ölpest',contact:'dusty',reward:6000,intro:[["Dusty","Die Geier finanzieren sich mit dem Öl aus dem Ölfeld Calvera."],["P","Dann drehen wir ihnen den Hahn zu."],["Dusty","Drei Sprengladungen. Drei Pumpen. Und dann rennst du, so schnell du kannst."],["Dusty","Komisch … dein Vater hat immer gesagt: Man verbrennt kein Geld. Man nimmt es."]],steps:[
  {type:'goto',r:40,pos:()=>({x:(SITES.oil.x0+SITES.oil.x1)/2,z:SITES.oil.z0+20}),text:'Fahr zum Ölfeld Calvera'},
  {type:'check',text:'Bring an drei Ölpumpen Sprengladungen an',tut:'Stell dich an eine Ölpumpe und drück <k>E</k>. Pass auf die Wachen auf!',
   onStart:()=>{mBomb=0;mPumps=AREA.pumps.slice(0,3);const O=SITES.oil;mGroup=[0,1,2,3].map(k=>geier(RN(O.x0+30,O.x1-30),RN(O.z0+30,O.z1-30)));for(const p of mPumps){const x=p.beam.position.x,z=p.beam.position.z;addInteract({x,z,r:4.2,label:'Sprengladung anbringen',mission:true,use(){mBomb++;tone(900,.1,'square',.05);toast(`Ladung ${mBomb}/3 angebracht`);return true;}});}},
   track:()=>{const p=mPumps[Math.min(mBomb,mPumps.length-1)];return {x:p.beam.position.x,z:p.beam.position.z};},check:()=>mBomb>=3},
  {type:'check',time:25,text:'Bring dich in Sicherheit – mindestens 150 m Abstand!',check:()=>{const p=mPumps[0];return Math.hypot(P.pos.x-p.beam.position.x,P.pos.z-p.beam.position.z)>150;},
   onDone:()=>{for(const p of mPumps){const v=p.beam.position.clone();explode(v,2.2,'player');p.beam.visible=false;}setWanted(2);}},
  {type:'lose',text:'Häng die Polizei ab',end:['Dusty','Was für ein Feuerwerk! Ohne Öl kein Geld. Die Geier werden nervös.']}]},
 {name:'Gefängnisbus',contact:'nova',reward:7000,intro:[["Nova","Sie haben Kai verhaftet! Sheriff Boones Leute – angeblich wegen Diebstahls."],["P","Boone arbeitet für die Geier?"],["Nova","Boone arbeitet für jeden, der zahlt. Sie bringen Kai in die JVA Steinfeld."],["Nova","Da kommen wir nicht rein. Aber an den Bus – auf der Nordautobahn."]],steps:[
  {type:'goto',r:12,pos:()=>RP('Nordautobahn',2080),text:'Fahr zum Hinterhalt an der Nordautobahn'},
  {type:'check',text:'Stoppe den Gefangenenbus',tut:'Schieß auf den Bus oder ramm ihn, bis er stehen bleibt.<br>Aber jag ihn nicht in die Luft – Kai sitzt drin!',
   onStart:()=>{mBus=routeOnRoad('bus',0x2a3d5a,'Nordautobahn',1700,-30,17,5.6);mBus.heavy=true;mBus.keep=true;mTrack({car:mBus});mBus.maxHp=mBus.hp=Math.max(mBus.hp,1600);},
   track:()=>mBus.pos,tick:()=>{setProg('Gefangenenbus',mBus.hp/mBus.maxHp,'#ff9a3c');if(mBus.mode==='wreck')failMission('Der Bus ist explodiert!');else if(mBus.route.done&&mBus.hp>mBus.maxHp*.6)failMission('Der Bus hat das Gefängnis erreicht!');},
   check:()=>mBus.hp<mBus.maxHp*.6,onDone:()=>{mBus.route.stop=true;setWanted(Math.max(wanted,2));}},
  {type:'check',text:'Schalte die Wachen aus',onStart:()=>{const p=mBus.pos;mGroup=[0,1,2].map(k=>spawnCop(p.x+Math.cos(k*2.1)*7,p.z+Math.sin(k*2.1)*7));},check:()=>allCopsDown(mGroup)},
  {type:'goto',r:3.2,pos:()=>({x:mBus.pos.x-Math.sin(mBus.h)*6.5,z:mBus.pos.z-Math.cos(mBus.h)*6.5}),text:'Befrei Kai hinten aus dem Bus',onDone:()=>{say('Kai','Endlich! Ich dachte, ich sehe nie wieder die Sonne.');}},
  {type:'lose',text:'Häng die Polizei ab',onStart:()=>setWanted(3)},
  {type:'goto',r:8,pos:TRAILER_GATE,text:'Bring Kai in den Trailerpark Rostbach',end:['Nova','Kai ist in Sicherheit. Jetzt ist es persönlich, Vulkan.']}]},
 {name:'Windstille',contact:'dusty',reward:5000,intro:[["Dusty","Die Geier haben Späher am Windpark. Von dort sehen sie die halbe Wüste."],["P","Lass mich raten: Scharfschützengewehr?"],["Dusty","Du lernst schnell. Genau wie dein Vater."],["Dusty","Der Hügel südlich vom Windpark ist perfekt."]],steps:[
  {type:'goto',r:8,pos:()=>({x:1070,z:-2440}),text:'Geh auf den Hügel südlich des Windparks',onStart:()=>{giveWeapon('sniper',20);toast('Scharfschützengewehr erhalten!');}},
  {type:'check',noHeat:true,text:'Schalte die vier Späher am Windpark aus',tut:'<b>Rechtsklick</b> halten = Zielfernrohr. Die Späher stehen an den Windrädern.',
   onStart:()=>{const W=SITES.wind;mGroup=[[W.x0+20,W.z0+46],[W.x0+92,W.z0+40],[W.x0+160,W.z0+44],[W.x0+232,W.z0+38]].map(([x,z])=>spawnGang(x,z,true,true,GEIER));},check:()=>allDown(mGroup)},
  {type:'check',text:'Zerstöre den Funkwagen der Geier',onStart:()=>{const W=SITES.wind;mCars=[gangCar(W.x0+120,W.z0+90,0)];},track:()=>mCars[0].pos,check:()=>mCars.every(c=>c.mode==='wreck'),end:['Dusty','Jetzt sind sie blind. Zeit für den großen Schlag – aber erst brauchen wir schweres Gerät.']}]},
 {name:'Panzerknacker',contact:'jax',reward:10000,intro:[["Jax","Hab gehört, du mischst die Wüste auf, {n}. Port Solara vermisst dich."],["P","Die Geier wollen einen Panzer aus Fort Adler."],["Jax","Dann holen wir ihn uns zuerst. Sicher ist sicher."],["Jax","Und danach erzählst du mir, wer dieser Vulkan ist."]],steps:[
  {type:'goto',r:12,pos:()=>({x:MIL.gate.x+40,z:MIL.gate.z}),text:'Fahr zum Tor von Fort Adler in der Wüste',tut:'Im Sperrgebiet bekommst du sofort <b>4 Sterne</b>.'},
  {type:'check',text:'Brich in Fort Adler ein und steig in einen Panzer',track:()=>{const t=cars.find(c=>c.vt==='tank'&&c.mode!=='wreck');return t?t.pos:MIL.tanks[0];},check:()=>P.inCar&&P.inCar.vt==='tank'},
  {type:'lose',text:'Entkomme mit dem Panzer',tut:'Mit dem Panzer bist du fast unverwundbar. <b>Linksklick</b> = Kanone.'},
  {type:'goto',car:true,r:12,pos:HANGAR,text:'Bring den Panzer zum Flugfeld Dustwater',end:['Jax','Ein echter Panzer vor Dustys Hangar! Vulkan wird Augen machen.']}]},
 {name:'Strandparty',contact:'nova',reward:6000,intro:[["Nova","Strandparty in Vista Mar – und die Geier wollen sie crashen."],["P","Dann crashen wir die Geier."],["Nova","Und ihr Boot gleich mit. Kai sagt, sie schmuggeln übers Meer – direkt in Krakes alten Hafen."],["Nova","Vulkan baut gerade alles wieder auf, was du in der Stadt zerschlagen hast."]],steps:[
  {type:'goto',r:20,pos:()=>({x:-990,z:470}),text:'Fahr zur Strandparty in Vista Mar'},
  {type:'check',noHeat:true,text:'Verteidige die Party: Schalte die Geier aus',onStart:()=>{mGroup=ring(-1000,460,{n:6,d:22}).map(([x,z])=>geier(x,z,true,{weapon:Math.random()<.5?'smg':'pistol'}));},check:()=>allDown(mGroup)},
  {type:'check',text:'Schnapp dir das Boot am Strand',onStart:()=>{let s=null;for(let k=0;k<40&&!s;k++){const x=-1000+RN(-60,60),z=500+RN(0,70);if(isWater(x,z))s={x,z};}s=s||{x:-1000,z:560};const b=makeBoat(0x1f5fbf);b.mode='parked';b.pos.set(s.x,0,s.z);b.h=Math.PI;b.g.position.copy(b.pos);cars.push(b);b.keep=true;mTrack({car:b});mGetaway=b;},track:()=>mGetaway.pos,check:()=>P.inCar===mGetaway},
  {type:'check',text:'Zerstöre das Schmuggelboot der Geier',say:['Nova (Funk)','Da vorne – das rote Boot! Lass es nicht entkommen!'],
   onStart:()=>{const b=makeBoat(0x8b1a1a);b.mode='parked';b.pos.set(-1060,0,640);b.h=Math.PI;b.g.position.copy(b.pos);b.keep=true;cars.push(b);mBoat=b;mCars=[b];b.escPts=[{x:-1250,z:600},{x:-1500,z:300},{x:-1650,z:-200},{x:-1700,z:-700}];},
   track:()=>mBoat.pos,tick:(dt)=>{if(mBoat.mode!=='wreck'&&moveBoatOnPath(mBoat,mBoat.escPts,13,dt))failMission('Das Boot ist entkommen!');},check:()=>mBoat.mode==='wreck',end:['Nova','Die Ware liegt auf dem Meeresgrund. Vulkan hat kaum noch Geld.']}]},
 {name:'Der Sheriff',contact:'dusty',reward:6000,intro:[["Dusty","Sheriff Boone trifft sich heute mit Vulkans Leuten. Wenn wir Boone haben, haben wir Vulkan."],["P","Und dann erzählst du mir, was du weißt."],["Dusty","… Ja. Dann erzähl ich es dir."],["Dusty","Folg ihm. Unauffällig."]],steps:[
  {type:'goto',r:14,pos:()=>RP('Wüstenstraße',40),text:'Warte am Ortsausgang von Dustwater auf den Sheriff'},
  {type:'check',text:'Folge dem Sheriff unauffällig',tut:'Halte Abstand: nicht näher als 15 m, nicht weiter als 120 m.',
   onStart:()=>{mSheriff=routeOnRoad('sedan',0,'Wüstenstraße',10,880,15,2.5);mSheriff.keep=true;mTrack({car:mSheriff});mTail={close:0,far:0};},track:()=>mSheriff.pos,
   tick:(dt)=>{const d=Math.hypot(P.pos.x-mSheriff.pos.x,P.pos.z-mSheriff.pos.z);if(d<15)mTail.close+=dt;else mTail.close=Math.max(0,mTail.close-dt);if(d>120)mTail.far+=dt;else mTail.far=0;
    setProg(d<15?'Zu nah dran!':d>120?'Zu weit weg!':'Abstand gut',d<15?1-mTail.close/3:d>120?1-mTail.far/7:1,d<15||d>120?'#ff5050':'#5fd38a');
    if(mSheriff.mode==='wreck')failMission('Der Sheriff ist ausgeschaltet – das war nicht der Plan!');else if(mTail.close>3)failMission('Der Sheriff hat dich bemerkt!');else if(mTail.far>7)failMission('Du hast den Sheriff verloren!');},check:()=>mSheriff.route.done},
  {type:'check',noHeat:true,text:'Der Sheriff hat dich entdeckt! Schalte ihn und die Geier aus',say:['Sheriff Boone','Du bist mir also gefolgt? Ganz schlechte Idee, Freundchen!'],onStart:()=>{const p=mSheriff.pos;mGroup=[spawnGang(p.x+4,p.z+3,true,false,{boss:true,name:'Sheriff Boone',hp:300,weapon:'shotgun',topC:0x5a4a2a}),geier(p.x-6,p.z+8),geier(p.x+8,p.z-6),geier(p.x-10,p.z-4)];},check:()=>allDown(mGroup),
   end:['Dusty','Boone ist erledigt. In seinem Auto lagen Briefe von Vulkan – in einer Handschrift, die ich kenne. {n} … es ist Teo. Vulkan ist dein Vater.']}]},
 {name:'Luftbrücke',contact:'prof',reward:9000,intro:[["Der Professor","{n}. Dusty hat mich angerufen. Er hat es dir gesagt, oder?"],["P","Vulkan ist mein Vater."],["Der Professor","Teo hat sich damals mit Krake überworfen und ist in die Wüste gegangen. Statt auszusteigen, hat er ein noch größeres Netz gebaut."],["P","Und Krake hat für ihn den Hafen verwaltet."],["Der Professor","Dustwater hungert, weil Vulkan die Straßen kontrolliert. Fliegen wir Medizin und Vorräte rein – das ist das Mindeste."]],steps:[
  {type:'goto',r:10,pos:()=>({x:RWX-10,z:-288}),text:'Fahr zum Flughafen Solara zur Propellermaschine'},
  {type:'check',text:'Steig in die Propellermaschine am Flughafen',onStart:()=>{mPlane=aircraft.find(a=>a.type==='plane'&&!a.jet&&!a.kind&&!a.dead&&a.mode==='parked'&&Math.hypot(a.g.position.x-RWX,a.g.position.z+300)<60);if(!mPlane)mPlane=placeAir(makePlane(0xf2f2f2,false),RWX-10,-300,0);mPlane.name='Propellermaschine';},track:()=>mPlane.g.position,check:()=>P.inAir===mPlane},
  {type:'check',text:'Lande auf dem Flugfeld Dustwater – trotz Polizei',onStart:()=>setWanted(3),pos:{x:1000,z:-2318},tut:'Mit 3 Sternen jagt dich der Polizeihubschrauber. Flieg tief über die Berge!',tick:()=>{if(mPlane.dead)failMission('Das Flugzeug wurde zerstört!');},
   check:()=>P.inAir===mPlane&&!mPlane.airborne&&mPlane.speed<8&&mPlane.g.position.x>860&&mPlane.g.position.x<1260&&Math.abs(mPlane.g.position.z+2318)<26,onDone:()=>{setWanted(0);},end:['Der Professor','Die Vorräte sind angekommen. Ganz Dustwater steht hinter dir, {n}. Mila wartet – sie will dich sehen, bevor es zu Ende geht.']}]},
 {name:'Finale: Geierflug',contact:'mila',reward:30000,intro:[["Mila","Alle sind hier, {n}. Dusty, Nova, Jax – sogar der Professor."],["P","Er ist mein Vater, Mila. Hast du es gewusst?"],["Mila","Befürchtet. Seit zehn Jahren."],["Mila","Er sitzt im Ölfeld in seinem Panzerwagen. Was auch immer heute passiert – wir stehen hinter dir."],["P","Dann bringen wir es zu Ende."]],steps:[
  {type:'goto',r:30,pos:()=>({x:(SITES.oil.x0+SITES.oil.x1)/2,z:SITES.oil.z0+10}),text:'Fahr zum Versteck der Geier im Ölfeld',onStart:()=>{giveWeapon('rifle',200);giveWeapon('rpg',6);giveWeapon('grenade',4);P.armor=100;P.hp=100;toast('Waffen aufgefüllt – inklusive Raketenwerfer!');}},
  {type:'check',noHeat:true,text:'Kämpf dich durch die Geier',onStart:()=>{const O=SITES.oil,cx=(O.x0+O.x1)/2,cz=(O.z0+O.z1)/2;mGroup=ring(cx,cz,{n:8,d:40}).map(([x,z])=>geier(x,z,true,{weapon:Math.random()<.5?'smg':'rifle'}));},check:()=>allDown(mGroup)},
  {type:'check',text:'Zerstöre Vulkans Panzerwagen, bevor er entkommt!',say:['Vulkan','{n}? Du bist es wirklich … Dreh um, solange du noch kannst! Die Wüste gehört den Geiern!'],
   onStart:()=>{const pts=roadPts('Ölfeldweg',-10,0,14).concat(roadPts('Wüstenstraße',nearestS('Wüstenstraße',-40,-2385),0,14));mVul=routeCarSpawn('armored',0x2b1a10,pts,16,2);mVul.h=Math.atan2(pts[1].x-pts[0].x,pts[1].z-pts[0].z);mVul.g.position.y=groundY(mVul.pos.x,mVul.pos.z);mVul.keep=true;mVul.maxHp=mVul.hp=Math.max(mVul.hp,2600);mCars=[mVul];},track:()=>mVul.pos,
   tick:()=>{setProg('Vulkans Panzerwagen',mVul.hp/mVul.maxHp,'#ff5050');if(mVul.route.done&&mVul.mode!=='wreck')failMission('Vulkan ist entkommen!');},check:()=>mVul.mode==='wreck'},
  {type:'check',noHeat:true,text:'Besiege Vulkan',say:['Vulkan','Du hast meinen Wagen zerstört … aber mich kriegst du nicht!'],onStart:()=>{const p=mVul.pos;mGroup=[geier(p.x+5,p.z+3,true,{boss:true,name:'Vulkan',hp:480,weapon:'shotgun'}),geier(p.x-6,p.z+6,true,{weapon:'smg'})];},check:()=>allDown(mGroup)},
  {type:'goto',r:8,pos:HANGAR,text:'Triff deine Crew am Flugfeld Dustwater',onStart:()=>setWanted(0),end:['Mila','Er lebt, {n}. Sie bringen ihn nach Steinfeld – vielleicht redet er eines Tages mit dir. Teo hat dieses Netz gebaut, du hast es zerrissen. Was jetzt aus Port Solara wird, entscheidest du.']}]}
);

// ================= TAG & NACHT =================
let tod=.36,night=0,envT=0,lastEnvTod=-1;const sunDir=new THREE.Vector3();
const fogDay=new THREE.Color(0x98b6d6),fogDusk=new THREE.Color(0xe7a47c),fogNight=new THREE.Color(0x1e2c4c);
const SH_R=new THREE.Vector3(),SH_U=new THREE.Vector3(),SH_C=new THREE.Vector3();

// ================= KARTEN (Minikarte & große Karte) =================
const mini=$('mini').getContext('2d');
const MCOL={downtown:'#3b3c45',mixed:'#36353a',residential:'#3d5a35',industrial:'#4a4740',park:'#3f7d34',beach:'#c9b886',garage:'#c87a2a',police:'#2c4a86',hospital:'#e8e8e8'};
const MX0=TX0,MX1=TX1,MZ0=TZ0,MZ1=1400,BS=.42;
const baseMap=document.createElement('canvas');baseMap.width=Math.ceil((MX1-MX0)*BS);baseMap.height=Math.ceil((MZ1-MZ0)*BS);
let waypoint=null;
const DIST_NAME={downtown:'Downtown',mixed:'Altstadt',residential:'Wohnviertel',industrial:'Industriegebiet',park:'Stadtpark',beach:'Sonnenstrand',garage:'Milas Werkstatt',police:'Polizeirevier',hospital:'Krankenhaus'};
const BMV={z:1,cx:null,cz:null,drag:null};

// ================= NAVI: schnellste Route über die Straßen (mit Kurven, Bremsen & Beschleunigen) =================
// Straßengraph: Stadtraster, Ringautobahn + Zubringer, Flughafenstraße und alle Landstraßen (ROADS).
// Kosten = Fahrzeit: Geschwindigkeitsprofil je Straßentyp, Kurvenradien (Querbeschleunigung),
// Abbremsen/Beschleunigen an Abzweigungen (Abbiege-Strafe) und kleine Wartezeit an Stadtkreuzungen.
const NAV={nodes:[],edges:[],out:[],built:false,city:new Set()};
const NAV_A=4.5,NAV_B=8,NAV_LAT=7.5;
NavHeap.prototype.push=function(c,k){const C=this.c,K=this.k;let i=C.length;C.push(c);K.push(k);while(i>0){const p=(i-1)>>1;if(C[p]<=C[i])break;[C[p],C[i]]=[C[i],C[p]];[K[p],K[i]]=[K[i],K[p]];i=p;}};
NavHeap.prototype.pop=function(){const C=this.c,K=this.k;const top=[C[0],K[0]];const lc=C.pop(),lk=K.pop();if(C.length){C[0]=lc;K[0]=lk;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<C.length&&C[l]<C[m])m=l;if(r<C.length&&C[r]<C[m])m=r;if(m===i)break;[C[m],C[i]]=[C[i],C[m]];[K[m],K[i]]=[K[i],K[m]];i=m;}}return top;};
// ---------- Routen verfolgen (Mission = gelb, Wegpunkt = lila), bei falschem Abbiegen neu berechnen ----------
const NAVR={mission:null,wp:null,t:0};

// ================= CHARAKTER-EDITOR (auch Kleiderladen) =================
let shopMode=false,shopBackup=null;
$('rnd').onclick=()=>{skin=randomSkin();rebuildPlayer();renderOpts();uiClick();};
$('play').onclick=()=>{if(shopMode)closeShopCreator(true);else startGame();};
$('ccancel').onclick=()=>closeShopCreator(false);
$('name').addEventListener('keydown',e=>{if(e.key==='Enter')startGame();});

// ================= WAFFEN & KAMPF =================
const WEAPONS=[
 {id:'fist',name:'Faust',melee:true,dmg:26,range:1.9,rate:.42},
 {id:'knife',name:'Messer',melee:true,dmg:48,range:2.1,rate:.36},
 {id:'bat',name:'Baseballschläger',melee:true,dmg:55,range:2.6,rate:.7},
 {id:'pistol',name:'Pistole',dmg:34,rate:.25,mag:12,spread:.008,range:160,vol:.16},
 {id:'smg',name:'Maschinenpistole',dmg:17,rate:.075,mag:30,spread:.028,range:110,auto:true,vol:.11},
 {id:'rifle',name:'Sturmgewehr',dmg:27,rate:.105,mag:30,spread:.014,range:240,auto:true,vol:.16},
 {id:'shotgun',name:'Schrotflinte',dmg:15,pellets:8,rate:.85,mag:6,spread:.075,range:45,vol:.28},
 {id:'sniper',name:'Scharfschützengewehr',dmg:220,rate:1.25,mag:5,spread:0,range:800,scope:true,vol:.28},
 {id:'rpg',name:'Raketenwerfer',rocket:true,rate:1.4,mag:1,range:600,vol:.2},
 {id:'grenade',name:'Granaten',thrown:true,rate:.9},
];
const WI={};WEAPONS.forEach((w,i)=>WI[w.id]=i);
const INV={owned:{fist:true},clip:{},ammo:{},cur:0};
let fireCD=0,reloadT=0,aimHeld=false,fireHeld=false,shootPoseT=0,meleeT=0,airCD=0,rocketCD=0,hitT=0,hurtFade=0,lastHurtT=-99,toastT=0,flyTutT=0,cashPopT=0;
const gunMetal=cm(0x1e1f22,.35,.8),gunWood=cm(0x6b4a2b,.7),batMat=cm(0xc8a26b,.6),bladeMat=cm(0xd8dde2,.15,1);
const burntMat=cm(0x141210,.95);
const healthMat=new THREE.MeshStandardMaterial({color:0x22cc55,emissive:0x22cc55,emissiveIntensity:.7});
const armorMat=new THREE.MeshStandardMaterial({color:0x2a5dbf,emissive:0x2a5dbf,emissiveIntensity:.6,roughness:.5});
const grenadeMat=cm(0x3b4a2a,.6,.3);
// ---------- Waffenmodelle (detailliert, pro Typ einmal zusammengefügt, mehrere Materialien) ----------
const WMAT={metal:gunMetal,steel:cm(0x5a5e63,.3,.9),poly:cm(0x16171a,.62,.15),wood:gunWood,woodD:cm(0x4a2e18,.6),olive:cm(0x4b5320,.7,.1),tan:cm(0xb39a6a,.65,.1),blade:bladeMat,bat:batMat,tape:cm(0x111111,.9),gren:grenadeMat,brass:cm(0xc9a04a,.35,.85),lens:new THREE.MeshStandardMaterial({color:0x223a66,roughness:.05,metalness:.6,emissive:0x0a1a33}),red:cm(0xb02020,.5)};
const WGEO=new Map();
const curW=()=>WEAPONS[INV.cur];
const aiming=()=>mode==='play'&&aimHeld&&!P.inCar&&!P.inAir&&!P.dead&&!curW().melee;
const scoped=()=>aiming()&&!!curW().scope;
addEventListener('mousedown',e=>{if(kbCaptureMouse(e))return;if(SET.input==='touch'||isOpen('tedit')||isOpen('ctrl'))return;
 if(mode==='cine'&&cineCombat&&cineCombat.active&&cineCombat.ready){if(e.button===0){fireHeld=true;tryFire();}else if(e.button===2)aimHeld=true;return;}
 if(mode==='play'&&SET.input==='kb'&&!plEl()&&!PL.off)return;if(SET.input==='pad'&&mode==='play')setInput('kb',true);const a=kbAct('Mouse'+e.button);if(a)actDown(a,'mouse:'+e.button,false);});
addEventListener('mouseup',e=>{if(mode==='cine'&&cineCombat&&cineCombat.active){if(e.button===0)fireHeld=false;if(e.button===2)aimHeld=false;}const a=kbAct('Mouse'+e.button);if(a)actUp(a,'mouse:'+e.button);});
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('wheel',e=>{if(mode==='play'&&!P.inCar&&!P.inAir)cycleWeapon(e.deltaY>0?1:-1);},{passive:true});

// ---------- Effekte ----------
const flashTex=canvasTex(64,64,(g)=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,230,1)');gr.addColorStop(.3,'rgba(255,190,80,.9)');gr.addColorStop(1,'rgba(255,110,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);});
const smokeTex=canvasTex(64,64,(g)=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(210,210,210,.85)');gr.addColorStop(1,'rgba(120,120,120,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);});
const fx=[],tracers=[];
const tracerMat=new THREE.LineBasicMaterial({color:new THREE.Color(3,2.6,1.6),transparent:true,opacity:.9});
const loot=[];const cashGeo=new THREE.BoxGeometry(.34,.1,.18);const cashMat=new THREE.MeshStandardMaterial({color:0x3a9a48,emissive:0x1f6a2a,emissiveIntensity:.7,roughness:.7});
// Zapfsäulen & Requisiten
const pendingBooms=[];
// ---------- Granaten ----------
const grenades=[];const grenadeGeo=new THREE.SphereGeometry(.12,10,8);

// ---------- Raketen ----------
const rockets=[];const rocketMat=cm(0x8a8a8a,.4,.6);

// ---------- Aufsammeln ----------
const pickups=[];
addPickup(GARAGE.x+6,GARAGE.z-10,'weapon','smg',90);
addPickup(GARAGE.x-6,GARAGE.z-10,'health');
addPickup(nodeX(2)+9.5,nodeX(5)+9.5,'weapon','shotgun',24);
addPickup(PIERX-20,COAST+12,'weapon','sniper',15);
addPickup(AIRX0+70,140,'weapon','rpg',6);
