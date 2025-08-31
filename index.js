const { app, BrowserWindow, ipcMain, desktopCapturer, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 500,
    minWidth: 400,  // Set the minimum width
    minHeight: 480, // Set the minimum height
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    alwaysOnTop: true,
    frame: false, // No frame, we will create a custom title bar
    transparent: true // Not transparent to allow dragging the title bar
  });

  mainWindow.loadFile('index.html');
}

app.on('ready', createWindow);

ipcMain.handle('capture-screen', async () => {
  mainWindow.hide();
  const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1280, height: 720 } });
  const screenSource = sources[0];
  mainWindow.show();
  return screenSource.thumbnail.toDataURL();
});
ipcMain.handle('save-image', async (_, dataURL) => {
  const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
  const { filePath } = await dialog.showSaveDialog({
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'bmp'] }],
  });

  if (filePath) {
    fs.writeFileSync(filePath, base64Data, 'base64');
  }
});

ipcMain.on('close-app', () => {
  mainWindow.close();
});

ipcMain.on('minimize-app', () => {
  mainWindow.minimize();
});