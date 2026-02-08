const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = NodeHelper.create({
  start() {
    this.config = null;
    this.lastWrittenFile = null;
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "CONFIG") {
      this.config = payload;
      return;
    }

    if (notification === "GET_IMAGE") {
      this.fetchAndStore();
    }
  },

  async fetchAndStore() {
    if (!this.config || !this.config.source) {
      this.sendSocketNotification("IMAGE_ERROR", { error: "Keine source konfiguriert" });
      return;
    }

    try {
      const moduleDir = this.path;
      const outDir = path.join(moduleDir, "cache");
      const outFile = path.join(outDir, "image.png");

      // Cache-Ordner sicherstellen
      fs.mkdirSync(outDir, { recursive: true });

      const src = String(this.config.source);

      if (src.startsWith("http://") || src.startsWith("https://")) {
        // Remote laden - Cache umgehen via Header + Cachebuster-URL
        const cacheBuster = Date.now();
        const sep = src.includes("?") ? "&" : "?";
        const url = `${src}${sep}_cb=${cacheBuster}`;

        const resp = await axios.get(url, {
          responseType: "arraybuffer",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0"
          },
          timeout: 20000
        });

        fs.writeFileSync(outFile, Buffer.from(resp.data));
      } else {
        // Lokale Datei lesen (relativ zum MagicMirror Root)
        const mmRoot = path.resolve(this.path, "..", ".."); // modules/MMM-ImageReload -> MagicMirror
        const localPath = path.join(mmRoot, src);

        if (!fs.existsSync(localPath)) {
          throw new Error(`Lokale Datei nicht gefunden: ${localPath}`);
        }

        fs.copyFileSync(localPath, outFile);
      }

      // Als Modul-Asset ausliefern:
      // modules/MMM-ImageReload/cache/image.png
      // wird erreichbar als /modules/MMM-ImageReload/cache/image.png
      const bust = Date.now();
      const publicUrl = `/modules/${path.basename(moduleDir)}/cache/image.png?_cb=${bust}`;

      this.sendSocketNotification("IMAGE_UPDATED", { imageUrl: publicUrl });
    } catch (e) {
      this.sendSocketNotification("IMAGE_ERROR", { error: e.message || String(e) });
    }
  }
});
