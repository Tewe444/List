# Sky FPV

Realistischer FPV-Drohnen-Simulator (Browser/WebGL, Three.js). Alle 3D-Modelle, PBR-Texturen und Terrains werden per Python-Skript in **Blender** erzeugt.

## Starten
1. `start.bat` doppelklicken (startet `server.py` – lokaler Server ohne Browser-Cache – und öffnet http://localhost:8080).
2. Für Three.js wird beim ersten Start Internet benötigt (CDN).

## Funke verbinden
- Beim ersten Start führt ein **Einrichtungs-Assistent** durch die Zuordnung: Stick auslenken und 1 s halten, dann wird er automatisch erkannt. Mit „Überspringen“ spielst du mit Standard-Einstellungen. Alles wird im Browser gespeichert, und der Assistent lässt sich unter Einstellungen → Steuerung erneut starten.
- Schalter, die die Funke als **Tasten** meldet (z. B. Kanal 8 der BETAFPV), sind ebenfalls zuordenbar.
- Funke per USB anschließen und im Funken-Menü **USB-Joystick (HID)** wählen (EdgeTX/OpenTX: „Joystick“).
- Einen Stick bewegen, damit der Browser sie erkennt.
- Unter **Einstellungen → Steuerung** die Achsen zuordnen, gegebenenfalls invertieren und auf **Kalibrieren** klicken.
- Alle Achsen der Funke (bis 16, z. B. Achse 8 der BETAFPV) sind wählbar. Arm, Angle, Reset und Kamera-Wechsel lassen sich auf Schalter-Achsen legen. Ohne Schalter: Leertaste = scharf schalten, M = Acro/Angle.
- Tastatur als Ersatz: W/S Gas, A/D Yaw, Pfeiltasten Pitch/Roll, R Reset, C Kamera (FPV/Verfolger/Sichtflug), Esc Pause.

## Inhalt
- **Physik**: Motormodell (KV, Wicklungswiderstand, Rotorträgheit), Propeller-Schub und -Drehmoment (Ct/Cp, Einstrom-Verlust), Akku mit Spannungseinbruch und mAh-Verbrauch, Betaflight-„Actual“-Rates, PID-Ratenregler mit Airmode, Luftwiderstand, Propwash, Bodeneffekt, Kollisionen und Abstürze.
- **Werkstatt**: Frame, Motoren, Stack, FPV-System, Propeller, Akku und Actioncam aus Einzelteilen zusammenbauen. Gewicht, Schub-zu-Gewicht, Flugzeit, Top-Speed und Kompatibilitätswarnungen werden live berechnet.
- **Clips (wie Medal)**: F8 oder ein zugeordneter Clip-Schalter speichert die letzte Minute als .webm, mit Bild, OSD und Spielton. Abschaltbar unter Grafik & Ton.
- **Turtle-Mode**: Liegt die Drohne nach einem Crash auf dem Rücken, T drücken (oder den Turtle-Schalter) und den Stick in Kipprichtung halten. Die Motoren laufen rückwärts und stellen sie wieder auf.
- **Performance-Modus**: dynamische Auflösung (Ziel-FPS), Detailstufen und Ausblenden für Vegetation, nur nahe Bäume werfen Schatten, MSAA und Tiefenschärfe aus.
- **Multiplayer**: In „Fliegen“ den Haken „Online mit Freunden fliegen“ setzen und einen Raum wählen. Freunde im selben Netz öffnen die Adresse, die `start.bat` anzeigt (z. B. http://192.168.x.x:8080). Übers Internet geht es per Router-Portweiterleitung (Port 8080) oder VPN (z. B. Tailscale).
- **Mehr Teile**: Frames Kranich 4" und Adler 6", Motoren 1804/2208/2507, Props 4024/5145/6030, Akkus 4S 850/6S 850/6S 1800, Nano-Kamera und AIO 35A.
- **Neue Karten (v3)**: „Dschungel-Tempel“ (Stufenpyramide mit Tunnel und Schacht, Kragbogen-Ruinen, Urwaldriesen mit Lianen, Fluss mit Hängebrücke), „Wüsten-Canyon“ (terrassierte Schlucht, Felsbögen, Hoodoos, Flugzeugwrack, Holz-Eisenbahnbrücke, Mine) und „Winter-Bergstation“ (Seilbahn mit Gondeln, Skisprungschanze, Funkmast, Almhütten). Alle haben eigene Blender-Modelle, Terrains, Bodentexturen und eigenes Licht.
- **Physik v3**: Dynamic Idle, TPA, Anti-Gravity, I-Term-Relax, Blattschlagen im Vorwärtsflug, Rotor-Kreiselmoment, Wirbelring-Zustand und eine feste 1-kHz-Schleife.
- **Sound v3**: Motor-Synthese im AudioWorklet (`js/motor-worklet.js`) pro Motor mit Obertönen, Motorpfeifen, Luftrauschen, Unwucht und Doppler.
- **Musik**: SoundCloud unter Einstellungen → Musik, erst nach Zustimmung zum Datenschutz-Hinweis. Ohne Zustimmung wird keine Verbindung aufgebaut, die Zustimmung lässt sich jederzeit widerrufen.
- **Werkstatt v2**: 3D-Vorschau mit Datenblatt beim Darüberfahren, Vergleichswerte (Gewicht, Schub/Gewicht, Flugzeit, Top-Speed), Explosionsansicht, Farben, Kamerafokus und Motortest.
- **Karten**: „Hüttenwerk“ (dichte Fabrikstadt: riesige Werkshalle mit offenen Fensterbändern und Sheddach, Ziegel-Häuserzeilen Wand an Wand, begehbarer Kühlturm, Hochöfen, Schornsteine, Verbindungsbrücken, Industriedunst), „Altes Stahlwerk“ (Hallen, Bando-Ruinen, Container, Schornstein, Strommasten mit Kabeln, Steinbruch) und „Bergsee & Staudamm“. Jeweils freies Fliegen oder Rennen über 3 Runden.
- **Videoverbindung**: Analog ~850 m, Digital ~1500 m Reichweite. Terrain, Gebäude, Container und Wald dämpfen das Signal (OSD „VID/HD xx %“). Analog zeigt dann Schnee, Streifen und rollendes Bild, digital Makroblöcke.
- **Prop-Schaden**: Seitliche Treffer verbiegen oder brechen einzelne Props. Folgen sind Schubverlust, Unwucht-Vibration im Bild, Rattern im Ton und eine OSD-Warnung. Lässt sich unter Physik abschalten.
- **Ton**: synthetischer Motor-Sound pro Motor (Blattfrequenz und Motorpfeifen) plus CC0-Sounds (siehe `assets/sounds/CREDITS.txt`), per Motordrehzahl, Schub und Geschwindigkeit gepitcht.
- **Bild**: Blender-gebackene 2K-PBR-Texturen, Terrain mit 6 Layern und Triplanar-Fels, Schatten, Tiefenschärfe (DOF), FPV-Weitwinkel, analoges Bildrauschen mit Reichweite und Abschattung, ACES-Tonemapping.

## Ordner
| Ordner | Inhalt |
|---|---|
| `blender/` | Python-Skripte für Blender (Modelle, Texturen, Terrain) |
| `assets/` | erzeugte GLB-Modelle, Texturen, Höhenkarten |
| `js/` | Spiellogik (JavaScript-Module) |
| `shaders/` | GLSL-Shader |
| `css/` | Stylesheets |

## Assets neu erzeugen
```bat
set B="C:\Program Files (x86)\Steam\steamapps\common\Blender\blender.exe"
%B% -b --factory-startup -P blender\make_textures.py
%B% -b --factory-startup -P blender\make_drone_parts.py
%B% -b --factory-startup -P blender\make_env_props.py
%B% -b --factory-startup -P blender\make_terrain.py
```
Mit `set SKYFPV_TEX=4096` vorab werden die Texturen in 4K gebacken.
