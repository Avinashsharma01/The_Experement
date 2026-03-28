# Module 03 — Understanding the Architecture

This is the **most important module**. Understanding Electron's architecture will save you hours of confusion later.

---

## Two Worlds, One App

Electron runs **two types of processes**:

```
┌──────────────────────────────────────────────┐
│                 ELECTRON APP                 │
│                                              │
│  ┌──────────────────┐                        │
│  │   MAIN PROCESS   │ ← One per app          │
│  │   (Node.js)      │                        │
│  └──────┬───────────┘                        │
│         │ creates                            │
│         ▼                                    │
│  ┌──────────────────┐  ┌──────────────────┐  │
│  │ RENDERER PROCESS  │  │ RENDERER PROCESS  │ │
│  │ (Chromium - Tab 1)│  │ (Chromium - Tab 2)│ │
│  └──────────────────┘  └──────────────────┘  │
└──────────────────────────────────────────────┘
```

### Think of It Like This (MERN Analogy)

| MERN Stack | Electron |
|------------|----------|
| **Express server** (Node.js backend) | **Main process** |
| **React app** (browser frontend) | **Renderer process** |
| **HTTP/API calls** between them | **IPC** (Inter-Process Communication) |

---

## Main Process — The Backend

File: `main.js` (or whatever you set in `package.json → "main"`)

**Has access to:**
- Full **Node.js** APIs (`fs`, `path`, `child_process`, etc.)
- Electron's **native APIs** (windows, menus, dialogs, tray, notifications)
- **npm packages** (anything you'd use in Express)

**Responsibilities:**
- Create and manage `BrowserWindow` instances
- Handle app lifecycle (start, quit, activate)
- System tray, menus, global shortcuts
- File system operations
- Talking to databases, external APIs

**Does NOT have:**
- DOM access (no `document`, no `window` object like in browsers)

```js
// main.js — This is Node.js land
const { app, BrowserWindow } = require("electron");
const fs = require("fs");  // ✅ Works! Full Node.js access

// document.getElementById("foo")  ❌ No DOM here!
```

---

## Renderer Process — The Frontend

File: Your HTML file loaded by `BrowserWindow`

**Has access to:**
- Full **DOM** APIs (`document`, `window`, CSS, etc.)
- Standard **Web APIs** (fetch, localStorage, Canvas, WebGL, etc.)
- Whatever JS you write or frameworks you load (React, Vue, etc.)

**Does NOT have (by default):**
- Node.js APIs (no `require`, no `fs`, no `path`)
- Direct access to Electron's native APIs

```js
// renderer.js — This is browser land
document.getElementById("foo").textContent = "Hello!";  // ✅ Works!

// const fs = require("fs");  ❌ Not available here (by design)
```

### Why Can't Renderer Access Node.js?

**Security.** If your app loads any external content (even a single image from the web), malicious code could access your entire file system. Electron locks this down by default.

---

## The Bridge — Preload Scripts

The **preload script** is the safe bridge between Main and Renderer:

```
Main Process  ←──IPC──→  Preload Script  ←──contextBridge──→  Renderer
(Node.js)                (Both worlds)                        (Browser)
```

```js
// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("myAPI", {
  readFile: (path) => ipcRenderer.invoke("read-file", path),
});
```

```js
// renderer.js — can now use the exposed API
const content = await window.myAPI.readFile("/some/path.txt");
```

This is like creating a **controlled API endpoint** — you expose only what you want, nothing more.

---

## IPC — How They Talk

**IPC** = Inter-Process Communication

### Pattern 1: Renderer → Main (Request/Response)

```js
// main.js
ipcMain.handle("get-data", async (event, query) => {
  const data = await fetchFromDB(query);
  return data;
});

// preload.js
contextBridge.exposeInMainWorld("api", {
  getData: (query) => ipcRenderer.invoke("get-data", query),
});

// renderer.js
const data = await window.api.getData("users");
```

This is exactly like calling an API endpoint from React!

### Pattern 2: Main → Renderer (Push)

```js
// main.js
mainWindow.webContents.send("update-available", version);

// preload.js
contextBridge.exposeInMainWorld("api", {
  onUpdate: (callback) => ipcRenderer.on("update-available", (e, ver) => callback(ver)),
});

// renderer.js
window.api.onUpdate((version) => {
  showNotification(`Update ${version} available!`);
});
```

---

## Security Rules (Important!)

| Setting | Recommended | Why |
|---------|-------------|-----|
| `contextIsolation` | `true` (default) | Prevents renderer from accessing Electron internals |
| `nodeIntegration` | `false` (default) | Prevents renderer from using `require()` |
| `sandbox` | `true` (default) | Extra layer of protection |

**Never** set `nodeIntegration: true` unless you fully understand the security implications. The preload + contextBridge pattern is the correct approach.

---

## Visual Summary

```
┌─────────────────────────────────────────────────┐
│                    main.js                      │
│  • app lifecycle      • Node.js APIs            │
│  • create windows     • npm packages            │
│  • menus & dialogs    • ipcMain.handle()        │
└─────────┬───────────────────────────────────────┘
          │
          │  IPC (Inter-Process Communication)
          │
┌─────────▼───────────────────────────────────────┐
│                  preload.js                     │
│  • contextBridge.exposeInMainWorld()            │
│  • Only expose what renderer needs             │
│  • Runs before renderer page loads             │
└─────────┬───────────────────────────────────────┘
          │
          │  window.electronAPI.xxx()
          │
┌─────────▼───────────────────────────────────────┐
│              renderer (index.html)              │
│  • DOM manipulation    • CSS / animations       │
│  • Web APIs            • React / Vue / Vanilla  │
│  • window.electronAPI  • User interactions      │
└─────────────────────────────────────────────────┘
```

---

## Next Up

[Module 04 — Deep Dive: Main Process →](./04-main-process.md)
