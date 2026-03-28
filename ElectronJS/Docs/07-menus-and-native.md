# Module 07 — Menus, Tray & Native Features

This is where Electron shines — native OS features that web apps can't touch.

---

## Application Menu

The menu bar at the top of your app (File, Edit, View, Help):

```js
const { Menu } = require("electron");

const template = [
  {
    label: "File",
    submenu: [
      {
        label: "New",
        accelerator: "CmdOrCtrl+N",
        click: () => {
          mainWindow.webContents.send("menu-action", "new");
        },
      },
      {
        label: "Open",
        accelerator: "CmdOrCtrl+O",
        click: async () => {
          const result = await dialog.showOpenDialog(mainWindow, {
            filters: [{ name: "Text", extensions: ["txt", "md"] }],
          });
          if (!result.canceled) {
            mainWindow.webContents.send("file-opened", result.filePaths[0]);
          }
        },
      },
      { type: "separator" },
      { label: "Quit", accelerator: "CmdOrCtrl+Q", role: "quit" },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "selectAll" },
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
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  },
];

app.whenReady().then(() => {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  createWindow();
});
```

### Menu Roles (Built-in Behaviors)

Instead of writing handlers, use roles for standard actions:

| Role | What it does |
|------|-------------|
| `undo`, `redo` | Standard undo/redo |
| `cut`, `copy`, `paste` | Clipboard operations |
| `selectAll` | Select all text |
| `reload` | Reload the window |
| `toggleDevTools` | Open/close DevTools |
| `zoomIn`, `zoomOut`, `resetZoom` | Zoom controls |
| `quit` | Quit the app |
| `minimize`, `close` | Window controls |

---

## Context Menu (Right-Click)

```js
const { Menu } = require("electron");

// In main.js — listen for context menu request from renderer
ipcMain.handle("show-context-menu", (_event) => {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Cut",
      role: "cut",
    },
    {
      label: "Copy",
      role: "copy",
    },
    {
      label: "Paste",
      role: "paste",
    },
    { type: "separator" },
    {
      label: "Inspect Element",
      click: () => mainWindow.webContents.openDevTools(),
    },
  ]);

  contextMenu.popup(mainWindow);
});
```

---

## System Tray

Put your app in the system tray (bottom-right on Windows):

```js
const { Tray, Menu, nativeImage } = require("electron");

let tray;

app.whenReady().then(() => {
  // Create tray icon (16x16 or 32x32 PNG recommended)
  const icon = nativeImage.createFromPath(
    path.join(__dirname, "assets", "tray-icon.png")
  );
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: "Show App", click: () => mainWindow.show() },
    { label: "Hide App", click: () => mainWindow.hide() },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);

  tray.setToolTip("My Electron App");
  tray.setContextMenu(contextMenu);

  // Click tray icon to show/hide
  tray.on("click", () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
});
```

---

## Native Notifications

```js
const { Notification } = require("electron");

function showNotification(title, body) {
  const notification = new Notification({
    title: title,
    body: body,
    icon: path.join(__dirname, "assets", "icon.png"),
    silent: false,
  });

  notification.on("click", () => {
    mainWindow.show();
    mainWindow.focus();
  });

  notification.show();
}

// Usage
showNotification("Download Complete", "Your file has been saved.");
```

---

## Global Shortcuts

System-wide keyboard shortcuts that work even when your app is in the background:

```js
const { globalShortcut } = require("electron");

app.whenReady().then(() => {
  // Register a global shortcut
  globalShortcut.register("CmdOrCtrl+Shift+X", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

// Unregister when app quits
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
```

---

## Shell Module — Open External Links & Files

```js
const { shell } = require("electron");

// Open URL in default browser
shell.openExternal("https://github.com");

// Open file with default application
shell.openPath("/path/to/document.pdf");

// Show file in file explorer
shell.showItemInFolder("/path/to/file.txt");

// Move to trash
shell.trashItem("/path/to/file.txt");
```

---

## Clipboard

```js
const { clipboard } = require("electron");

// Write to clipboard
clipboard.writeText("Hello from Electron!");

// Read from clipboard
const text = clipboard.readText();
console.log(text);

// Check available formats
const formats = clipboard.availableFormats();
```

---

## Power Monitor

React to system power events:

```js
const { powerMonitor } = require("electron");

powerMonitor.on("suspend", () => {
  console.log("System going to sleep — save state!");
});

powerMonitor.on("resume", () => {
  console.log("System woke up — refresh data!");
});

powerMonitor.on("on-ac", () => {
  console.log("Plugged in");
});

powerMonitor.on("on-battery", () => {
  console.log("Running on battery");
});
```

---

## Quick Reference Table

| Feature | Module | One-line Example |
|---------|--------|-----------------|
| App menu | `Menu` | `Menu.setApplicationMenu(menu)` |
| Context menu | `Menu` | `menu.popup(win)` |
| System tray | `Tray` | `new Tray(iconPath)` |
| Notifications | `Notification` | `new Notification({title, body}).show()` |
| Global shortcuts | `globalShortcut` | `globalShortcut.register("...", fn)` |
| Open URLs | `shell` | `shell.openExternal(url)` |
| Clipboard | `clipboard` | `clipboard.writeText(text)` |
| Power events | `powerMonitor` | `powerMonitor.on("suspend", fn)` |

---

## Next Up

[Module 08 — Packaging & Distribution →](./08-packaging.md)
