const { contextBridge, ipcRenderer } = require('electron')

// Expose a minimal API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any required IPC methods here
  platform: process.platform
})
