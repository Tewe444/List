"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("offlineGamesDesktop", {
  getInstalledFolders: () => ipcRenderer.invoke("games:installed-folders")
});
