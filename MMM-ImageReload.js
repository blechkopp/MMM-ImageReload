/* global Module */

Module.register("MMM-ImageReload", {
  defaults: {
    // Kann http(s)://... sein oder lokaler Pfad ab MagicMirror-Root, z.B. "public/lernsax/vertretungsplan.png"
    source: "public/lernsax/vertretungsplan.png",
    updateInterval: 60 * 1000, // ms
    width: "100%",
    height: "auto"
  },

  start() {
    this.imagePath = null;

    this.sendSocketNotification("CONFIG", this.config);
    this.getImage();

    setInterval(() => this.getImage(), Math.max(1000, Number(this.config.updateInterval) || 60000));
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "IMAGE_UPDATED") {
      this.imagePath = payload.imageUrl; // URL zum abgerufenen Bild (mit Cachebuster)
      this.updateDom();
    }
    if (notification === "IMAGE_ERROR") {
      this.imagePath = null;
      this.errorMsg = payload.error || "Unknown error";
      this.updateDom();
    }
  },

  getImage() {
    this.sendSocketNotification("GET_IMAGE", {});
  },

  getStyles() {
    return ["MMM-ImageReload.css"];
  },

  getDom() {
    const wrapper = document.createElement("div");
    wrapper.className = "mir-image-reload";

    if (!this.imagePath) {
      const t = document.createElement("div");
      t.className = "dimmed small";
      t.innerText = this.errorMsg ? `Bild konnte nicht geladen werden: ${this.errorMsg}` : "Bild wird geladen…";
      wrapper.appendChild(t);
      return wrapper;
    }

    const img = document.createElement("img");
    img.className = "mir-image";
    img.src = this.imagePath;
    img.style.width = this.config.width;
    img.style.height = this.config.height;

    wrapper.appendChild(img);
    return wrapper;
  }
});
