# PORT SOLARA – Story

## Grundidee
Die Spielfigur ({n}) kommt nach Port Solara, weil **Mila**, die frühere Mechanikerin ihres Vaters **Teo**, sie anruft.
Teo hat vor zehn Jahren den Hafen geführt und ist über Nacht verschwunden. Die Suche nach ihm zieht sich durch das ganze Spiel.

## Figuren
| Figur | Rolle | Motiv |
|---|---|---|
| Mila | Mentorin, Werkstatt | War Teos Mechanikerin, befürchtet seit Jahren die Wahrheit |
| Jax | Straßenrennfahrer | Will eine eigene Crew, hasst Krake |
| Rocco | Auto-Export | Kannte Teo, hat Schulden bei Krake – **verrät die Spielfigur** (Mission 14) |
| Der Professor | Planer | Hat die Tresore der Nationalbank gebaut, wurde wegen Krakes Geldwäsche gefeuert – will Rache |
| Kommissar Brandt | Korrupter Polizist | Hat Teos Vermisstenfall nach drei Tagen geschlossen, schützt Krake |
| Krake | Boss der Hafengang (Akt 1) | Verwaltet den Hafen – aber nur für jemand Größeren |
| Dusty | Pilot in Dustwater | Ist früher mit Teo Fracht geflogen, erkennt Vulkans Stimme |
| Nova & Kai | Tüftlerin & ihr Bruder | Die Geier bedrohen Kai |
| Sheriff Boone | Korrupter Sheriff | Kassiert von den Geiern |
| Vulkan | Boss der Geier (Akt 2) | **Ist Teo**, der Vater |

## Akt 1 – Die Stadt (Mission 0–18)
- Krake kassiert Schutzgeld; Mila erzählt von Teo (1).
- Der Professor schließt sich an (6), Jax deckt auf, dass Brandt Teos Fall vertuscht hat (9).
- Brandts Waffentransporter kommen aus der Wüste – jemand ist größer als Krake (10).
- Rocco verkauft die Spielfigur an Krake und Brandt (13–14).
- In der Nationalbank liegt Krakes **Buch** mit allen Zahlungen (15–16); auf der letzten Seite: Lieferungen von **Vulkan** (17).
- Showdown am Pier (18): Krake fällt und verrät: „Teo lebt – und Vulkan weiß, wo.“

## Akt 2 – Die Wüste (Mission 19–34)
- Dusty erzählt von Teo als Pilot (21); die Geier arbeiten für Vulkan.
- Nova nimmt Vulkans Stimme auf (24–25); Dusty kommt sie bekannt vor (26).
- Kai wird von Boones Leuten verhaftet und befreit (28).
- Boone fällt; in seinem Auto liegen Briefe in Teos Handschrift: **Vulkan ist Teo** (32).
- Der Professor erklärt: Teo hat Krake groß gemacht und in der Wüste ein noch größeres Netz gebaut (33).
- Finale (34): Alle stehen hinter der Spielfigur. Vulkan wird gestoppt und lebt – was aus Port Solara wird, entscheidet die Spielfigur.

## Epilog (Mission 35–37, `js/game/epilogue.js`) – mit Entscheidungen
| Mission | Ort (Blender-Modell) | Entscheidung | Gespeichert als |
|---|---|---|---|
| Alte Schulden | Altes Bootshaus am Weststrand | Rocco laufen lassen (+$3000) oder der Polizei übergeben | `PROG.ep.rocco` = frei / polizei |
| Das Buch | Justizpalast nördlich der Innenstadt | Vor Gericht aussagen oder anonym bleiben | `PROG.ep.buch` = aussage / anonym |
| Besuch in Steinfeld | Besucherhof vor der JVA Steinfeld | Erst eine Frage an Teo, dann: verzeihen oder Abschied | `PROG.ep.teo` = verziehen / abschied |

Am Ende fasst Mila am Telefon zusammen, was aus Rocco und Brandt geworden ist – abhängig von deinen Entscheidungen. Danach laufen die Credits.

Interaktive Szenen: `SCENE.play([...])` in `epilogue.js` – Einträge sind `["Wer","Text"]` oder `{choice:[{label, set(), then:[...]}]}`.
Modelle: `tools/blender/build_mission_models.py`.
