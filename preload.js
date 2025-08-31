const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  captureScreen: () => ipcRenderer.invoke('capture-screen'),
  saveImage: (dataURL) => ipcRenderer.invoke('save-image', dataURL),
  closeApp: () => ipcRenderer.send('close-app'),
  minimizeApp: () => ipcRenderer.send('minimize-app'),
});

