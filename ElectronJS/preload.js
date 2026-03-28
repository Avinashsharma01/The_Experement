const { contextBridge, ipcRenderer } = require("electron");

// Expose safe APIs to the renderer process via window.electronAPI
contextBridge.exposeInMainWorld("electronAPI", {
  getAppInfo: () => ipcRenderer.invoke("get-app-info"),
  showMessage: (msg) => ipcRenderer.invoke("show-message", msg),
});
