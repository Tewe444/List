"use strict";

const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL, fileURLToPath } = require("node:url");

const appRoot = path.resolve(app.getAppPath());

function isInsideApp(filePath) {
  const relative = path.relative(appRoot, filePath);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function createWindow() {
  const window = new BrowserWindow({
    width: 520,
    height: 720,
    minWidth: 320,
    minHeight: 420,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(appRoot, "preload.cjs")
    }
  });

  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  window.webContents.on("will-navigate", (event, url) => {
    let targetPath;
    try {
      targetPath = fileURLToPath(url);
    } catch {
      event.preventDefault();
      return;
    }
    if (!isInsideApp(targetPath)) event.preventDefault();
  });

  window.loadURL(pathToFileURL(path.join(appRoot, "index.html")).href);
}

app.whenReady().then(() => {
  ipcMain.handle("games:installed-folders", () => {
    const gamesPath = path.join(appRoot, "seiten");
    return fs.readdirSync(gamesPath, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  });
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
