const {
  app,
  BrowserWindow,
  ipcMain,
  desktopCapturer,
  dialog,
} = require("electron");
const path = require("path");
const fs = require("fs");
const { autoUpdater } = require("electron-updater");

autoUpdater.autoDownload = false; // we’ll manually control download
autoUpdater.autoInstallOnAppQuit = true;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 500,
    minWidth: 400,
    minHeight: 480,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    alwaysOnTop: true,
    frame: false,
    transparent: true,
  });

  mainWindow.loadFile("index.html");

  // 🔹 Start update check when app is ready
  mainWindow.once("ready-to-show", () => {
    autoUpdater.checkForUpdates();
  });
}

app.on("ready", createWindow);

// --- AutoUpdater Events ---
autoUpdater.on("update-available", () => {
  dialog
    .showMessageBox(mainWindow, {
      type: "info",
      title: "Update Available",
      message: "A new version is available. Do you want to download it?",
      buttons: ["Yes", "No"],
    })
    .then((result) => {
      if (result.response === 0) {
        // Yes
        autoUpdater.downloadUpdate();
      }
    });
});

autoUpdater.on("update-not-available", () => {
  console.log("No update available.");
});

autoUpdater.on("error", (err) => {
  console.error("Update error:", err);
});

autoUpdater.on("download-progress", (progressObj) => {
  let log_message = `Download speed: ${progressObj.bytesPerSecond}`;
  log_message += ` - Downloaded ${Math.round(progressObj.percent)}%`;
  log_message += ` (${progressObj.transferred}/${progressObj.total})`;
  console.log(log_message);
});

autoUpdater.on("update-downloaded", () => {
  dialog
    .showMessageBox(mainWindow, {
      type: "info",
      title: "Update Ready",
      message: "Update downloaded. Do you want to restart now?",
      buttons: ["Yes", "Later"],
    })
    .then((result) => {
      if (result.response === 0) {
        // Yes
        autoUpdater.quitAndInstall();
      }
    });
});

// --- Your existing IPC handlers ---
ipcMain.handle("capture-screen", async () => {
  mainWindow.hide();
  const sources = await desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize: { width: 1280, height: 720 },
  });
  const screenSource = sources[0];
  mainWindow.show();
  return screenSource.thumbnail.toDataURL();
});

ipcMain.handle("save-image", async (_, dataURL) => {
  const base64Data = dataURL.replace(/^data:image\/png;base64,/, "");
  const { filePath } = await dialog.showSaveDialog({
    filters: [{ name: "Images", extensions: ["png", "jpg", "bmp"] }],
  });

  if (filePath) {
    fs.writeFileSync(filePath, base64Data, "base64");
  }
});

ipcMain.on("close-app", () => {
  mainWindow.close();
});

ipcMain.on("minimize-app", () => {
  mainWindow.minimize();
});
