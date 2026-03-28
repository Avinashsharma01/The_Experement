# Module 04 — Deep Dive: Main Process

The main process is the **heart** of your Electron app. Think of it as your Express server — except instead of serving HTTP responses, it manages windows and OS features.

---

## The `app` Module

Controls your app's lifecycle:

```js
const { app } = require("electron");

// App is ready to create windows
app.whenReady().then(() => {
  createWindow();
});

// All windows closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// macOS: clicked dock icon with no windows open
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
```

### Key Lifecycle Events

| Event | When | Use Case |
|-------|------|----------|
| `ready` | Electron initialized | Create your first window |
| `window-all-closed` | Last window closed | Quit app (Windows/Linux) |
| `activate` | macOS dock click | Re-create window if needed |
| `before-quit` | App about to quit | Save data, clean up |
| `will-quit` | All windows closed, app quitting | Final cleanup |

---

## BrowserWindow — Creating Windows

```js
const { BrowserWindow } = require("electron");

const win = new BrowserWindow({
  width: 1000,
  height: 700,
  minWidth: 600,
  minHeight: 400,
  title: "My App",
  
  // Window style
  frame: true,           // Set false for frameless window
  transparent: false,    // Transparent background
  resizable: true,
  fullscreenable: true,
  
  // Security settings
  webPreferences: {
    preload: path.join(__dirname, "preload.js"),
    contextIsolation: true,
    nodeIntegration: false,
  },
});
```

### Common Window Operations

```js
// Loading content
win.loadFile("index.html");                          // Local file
win.loadURL("https://example.com");                  // Remote URL (use with caution)

// Window management
win.show();
win.hide();
win.close();
win.minimize();
win.maximize();
win.setFullScreen(true);

// Position & size
win.setBounds({ x: 100, y: 100, width: 800, height: 600 });
win.center();

// DevTools
win.webContents.openDevTools();
win.webContents.closeDevTools();

// Send message to renderer
win.webContents.send("channel-name", data);
```

### Multiple Windows

```js
let mainWindow, settingsWindow;

function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    width: 500,
    height: 400,
    parent: mainWindow,  // Makes it a child window
    modal: true,         // Blocks parent until closed
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });
  
  settingsWindow.loadFile("settings.html");
}
```

---

## Dialogs — Native OS Popups

```js
const { dialog } = require("electron");

// Message box
async function showAlert() {
  const result = await dialog.showMessageBox(mainWindow, {
    type: "warning",      // "info", "warning", "error", "question"
    title: "Confirm",
    message: "Are you sure?",
    detail: "This action cannot be undone.",
    buttons: ["Delete", "Cancel"],
    defaultId: 1,
    cancelId: 1,
  });
  
  if (result.response === 0) {
    // User clicked "Delete"
  }
}

// Open file picker
async function openFile() {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Select a file",
    filters: [
      { name: "JSON Files", extensions: ["json"] },
      { name: "All Files", extensions: ["*"] },
    ],
    properties: ["openFile", "multiSelections"],
  });
  
  if (!result.canceled) {
    console.log(result.filePaths);  // Array of selected file paths
  }
}

// Save file picker
async function saveFile() {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: "Save file",
    defaultPath: "untitled.json",
    filters: [
      { name: "JSON", extensions: ["json"] },
    ],
  });
  
  if (!result.canceled) {
    console.log(result.filePath);   // Where user wants to save
  }
}
```

---

## IPC Handlers — Responding to Renderer

This is like defining API routes in Express:

```js
const { ipcMain } = require("electron");
const fs = require("fs").promises;

// Express: app.get("/api/files", handler)
// Electron: ipcMain.handle("get-files", handler)

ipcMain.handle("read-file", async (_event, filePath) => {
  // Validate the path before reading (security!)
  const content = await fs.readFile(filePath, "utf-8");
  return content;
});

ipcMain.handle("save-file", async (_event, { path: filePath, content }) => {
  await fs.writeFile(filePath, content, "utf-8");
  return { success: true };
});

ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});
```

### Express vs Electron Side-by-Side

```js
// Express
app.get("/api/data", async (req, res) => {
  const data = await db.find(req.query);
  res.json(data);
});

// Electron
ipcMain.handle("get-data", async (event, query) => {
  const data = await db.find(query);
  return data;  // Automatically sent back to renderer
});
```

---

## Useful Main Process APIs

| Module | Purpose | Example |
|--------|---------|---------|
| `shell` | Open URLs, files with default app | `shell.openExternal("https://...")` |
| `clipboard` | Read/write system clipboard | `clipboard.writeText("copied!")` |
| `nativeTheme` | Detect dark/light mode | `nativeTheme.shouldUseDarkColors` |
| `screen` | Monitor info, cursor position | `screen.getPrimaryDisplay()` |
| `powerMonitor` | Battery, sleep/wake events | `powerMonitor.on("suspend", ...)` |
| `globalShortcut` | System-wide keyboard shortcuts | `globalShortcut.register("CmdOrCtrl+X", ...)` |
| `Notification` | Native OS notifications | `new Notification({ title, body }).show()` |

---

## Putting It Together — Practical Example

```js
const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const fs = require("fs").promises;
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });
  mainWindow.loadFile("index.html");
}

// IPC: Open a file
ipcMain.handle("open-file", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [{ name: "Text", extensions: ["txt", "md", "json"] }],
  });
  if (result.canceled) return null;
  const content = await fs.readFile(result.filePaths[0], "utf-8");
  return { path: result.filePaths[0], content };
});

// IPC: Save a file
ipcMain.handle("save-file", async (_e, { filePath, content }) => {
  await fs.writeFile(filePath, content, "utf-8");
  return true;
});

// IPC: Open link in default browser
ipcMain.handle("open-external", (_e, url) => {
  shell.openExternal(url);
});

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
```

---

## Next Up

[Module 05 — Deep Dive: Renderer Process →](./05-renderer-process.md)
