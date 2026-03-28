const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");
const path = require("path");

// Keep a global reference to prevent garbage collection
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 600,
    minHeight: 400,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, "renderer", "icon.png"),
  });

  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));

  // Open DevTools in dev mode
  if (process.argv.includes("--dev")) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ── Application Menu ──────────────────────────────────────────────
const menuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "About",
        click: () => {
          dialog.showMessageBox(mainWindow, {
            type: "info",
            title: "About",
            message: "Electron Starter App",
            detail: "Built with Electron JS\nVersion 1.0.0",
          });
        },
      },
      { type: "separator" },
      { label: "Quit", accelerator: "CmdOrCtrl+Q", role: "quit" },
    ],
  },
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { role: "resetZoom" },
    ],
  },
];

// ── IPC Handlers ──────────────────────────────────────────────────
ipcMain.handle("get-app-info", () => {
  return {
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    chromeVersion: process.versions.chrome,
    platform: process.platform,
    arch: process.arch,
  };
});

ipcMain.handle("show-message", async (_event, message) => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: "info",
    title: "Message from Renderer",
    message: message,
    buttons: ["OK", "Cancel"],
  });
  return result.response === 0 ? "confirmed" : "cancelled";
});

// ── App Lifecycle ─────────────────────────────────────────────────
app.whenReady().then(() => {
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
