# MMM-ImageReload (NodeHelper-Version)

Dieses MagicMirror²-Modul lädt ein Bild regelmäßig neu und zeigt es im Dashboard an.

Das Bild kann entweder:
- von einer **Remote-URL** (http/https) geladen werden oder
- aus einer **lokalen Datei** (Pfad relativ zum MagicMirror-Root)

Das Bild wird immer **cachefrei** geladen (Cachebuster + No-Cache-Header).

Das Modul liefert das Bild anschließend zuverlässig über:
    /modules/MMM-ImageReload/cache/image.png

Dadurch ist es unabhängig davon, ob MagicMirror eigene `public/`-Ordner
als Webpfad ausliefert oder nicht.

---

## Installation

### 1. Modul anlegen

MagicMirror/modules/MMM-ImageReload/
├─ MMM-ImageReload.js
├─ node_helper.js
├─ MMM-ImageReload.css
└─ README.md

### 2. Abhängigkeit installieren (axios)

cd ~/MagicMirror/modules/MMM-ImageReload
npm init -y
npm install axios

### 3. MagicMirror neu starten

pm2 restart MagicMirror

---

## Konfiguration (config/config.js)

### Beispiel: Lokale Datei

Wenn die Datei z. B. hier liegt:

/home/user/MagicMirror/public/example.png

Dann:

{
  module: "MMM-ImageReload",
  position: "middle_center",
  config: {
    source: "public/example.png",
    updateInterval: 60 * 1000,
    width: "800px",
    height: "auto"
  }
}

### Beispiel: Remote-URL

{
  module: "MMM-ImageReload",
  position: "top_left",
  config: {
    source: "https://example.com/example.png",
    updateInterval: 60 * 1000,
    width: "500px",
    height: "auto"
  }
}

---

## Konfigurationsoptionen

Option            Typ     Standard  Beschreibung
source            string  –         Lokaler Pfad (relativ zum MagicMirror-Root) oder Remote-URL
updateInterval    number  60000     Aktualisierungsintervall in Millisekunden
width             string  "100%"    CSS-Breite des Bildes
height            string  "auto"    CSS-Höhe des Bildes

---

## Technische Funktionsweise

- Der NodeHelper lädt das Bild:
  - bei Remote-URLs mit axios (arraybuffer, No-Cache-Header)
  - bei lokalen Dateien direkt vom Dateisystem
- Das Bild wird gespeichert unter:

modules/MMM-ImageReload/cache/image.png

- Das Frontend zeigt das Bild über:

/modules/MMM-ImageReload/cache/image.png?_cb=TIMESTAMP

Der Cachebuster sorgt dafür, dass der Browser das Bild immer neu lädt.

---

## Test / Debug

### Prüfen, ob das Bild ausgeliefert wird

curl -I http://localhost:8080/modules/MMM-ImageReload/cache/image.png

Erwartet:
HTTP/1.1 200 OK

### Logs ansehen

pm2 logs MagicMirror --lines 200

Typische Fehler:
- Lokale Datei nicht gefunden → Pfad in source falsch
- Netzwerkfehler → Remote-URL nicht erreichbar
- EACCES → Dateirechte / Mount-Rechte

---

## Hinweise zu lokalen Dateien und Mounts

Das Modul liest lokale Dateien direkt vom Dateisystem.
Auch FUSE-, CIFS- oder andere Mounts funktionieren, solange der
MagicMirror-User Leserechte hat.

Beispiel (vorsichtig verwenden):

chmod -R a+rX /home/user/MagicMirror/public/lernsax

---

## Deinstallation

rm -rf ~/MagicMirror/modules/MMM-ImageReload
pm2 restart MagicMirror

---

## Lizenz

Freie Nutzung und Anpassung für private Zwecke.
