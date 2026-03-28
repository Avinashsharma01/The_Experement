# Module 06 — Preload Scripts & IPC Deep Dive

The preload script + IPC system is **the most critical pattern** in Electron. Master this and you can build anything.

---

## Why Preload Exists

```
PROBLEM:
  Renderer needs to read files, but giving it Node.js access = security risk

SOLUTION:
  Preload runs BEFORE the page loads, with access to BOTH worlds.
  It exposes only the specific functions you whitelist.
```

Think of it as a **middleware** — like Express middleware sits between the request and your route handler:

```
Express:   Request → Middleware → Route Handler
Electron:  Renderer → Preload → Main Process
```

---

## The contextBridge Pattern

### Step 1: Define handlers in Main

```js
// main.js
const { ipcMain } = require("electron");
const fs = require("fs").promises;

ipcMain.handle("read-file", async (_event, filePath) => {
  return await fs.readFile(filePath, "utf-8");
});

ipcMain.handle("write-file", async (_event, filePath, content) => {
  await fs.writeFile(filePath, content, "utf-8");
  return { success: true };
});

ipcMain.handle("get-platform", () => {
  return process.platform;
});
```

### Step 2: Expose safe APIs in Preload

```js
// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Each function maps to an IPC channel
  readFile:    (path)          => ipcRenderer.invoke("read-file", path),
  writeFile:   (path, content) => ipcRenderer.invoke("write-file", path, content),
  getPlatform: ()              => ipcRenderer.invoke("get-platform"),
});
```

### Step 3: Use in Renderer

```js
// renderer.js
const content = await window.electronAPI.readFile("/path/to/file.txt");
const platform = await window.electronAPI.getPlatform();
```

---

## IPC Communication Patterns

### Pattern 1: invoke / handle (Most Common)

**Renderer asks, Main responds.** Like `fetch()` — returns a Promise.

```js
// Main
ipcMain.handle("channel-name", async (event, ...args) => {
  return result;  // Sent back to renderer
});

// Preload
contextBridge.exposeInMainWorld("api", {
  doThing: (...args) => ipcRenderer.invoke("channel-name", ...args),
});

// Renderer
const result = await window.api.doThing(arg1, arg2);
```

**Use for:** Getting data, performing actions, any request/response flow.

---

### Pattern 2: send / on (One-Way, Main → Renderer)

**Main pushes data to Renderer.** Like WebSocket events.

```js
// Main — sends to renderer
mainWindow.webContents.send("update-progress", 75);

// Preload — forwards to renderer
contextBridge.exposeInMainWorld("api", {
  onProgress: (callback) => {
    ipcRenderer.on("update-progress", (_event, value) => callback(value));
  },
});

// Renderer — listens
window.api.onProgress((percent) => {
  progressBar.style.width = `${percent}%`;
});
```

**Use for:** Progress updates, menu clicks, system events, real-time notifications.

---

### Pattern 3: send / on (One-Way, Renderer → Main)

**Renderer fires and forgets.** No response needed.

```js
// Preload
contextBridge.exposeInMainWorld("api", {
  logEvent: (name) => ipcRenderer.send("log-event", name),
});

// Main
ipcMain.on("log-event", (_event, name) => {
  console.log(`Event: ${name}`);
  // No response sent back
});

// Renderer
window.api.logEvent("button-clicked");
```

**Use for:** Analytics, logging, fire-and-forget operations.

---

## Full Working Example

Here's a complete preload setup for a note-taking app:

```js
// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("noteAPI", {
  // CRUD operations (invoke/handle)
  getNotes:    ()           => ipcRenderer.invoke("notes:getAll"),
  getNote:     (id)         => ipcRenderer.invoke("notes:getOne", id),
  createNote:  (note)       => ipcRenderer.invoke("notes:create", note),
  updateNote:  (id, data)   => ipcRenderer.invoke("notes:update", id, data),
  deleteNote:  (id)         => ipcRenderer.invoke("notes:delete", id),
  
  // File operations
  exportNote:  (id, format) => ipcRenderer.invoke("notes:export", id, format),
  importNotes: ()           => ipcRenderer.invoke("notes:import"),
  
  // Events from Main (menu clicks, etc.)
  onMenuAction: (callback) => {
    ipcRenderer.on("menu-action", (_e, action) => callback(action));
  },
});
```

```js
// main.js — handlers
const notes = new Map();

ipcMain.handle("notes:getAll", () => {
  return Array.from(notes.values());
});

ipcMain.handle("notes:create", (_e, note) => {
  const id = Date.now().toString();
  const newNote = { id, ...note, createdAt: new Date().toISOString() };
  notes.set(id, newNote);
  return newNote;
});

ipcMain.handle("notes:delete", (_e, id) => {
  return notes.delete(id);
});
```

```js
// renderer.js — usage
const allNotes = await window.noteAPI.getNotes();
const newNote = await window.noteAPI.createNote({
  title: "My first note",
  content: "Hello from Electron!",
});
```

---

## Security Best Practices

### DO ✅

```js
// Expose specific functions
contextBridge.exposeInMainWorld("api", {
  getUser: (id) => ipcRenderer.invoke("get-user", id),
});
```

### DON'T ❌

```js
// NEVER expose the entire ipcRenderer
contextBridge.exposeInMainWorld("api", {
  invoke: (...args) => ipcRenderer.invoke(...args),  // ❌ Too broad!
  send: (...args) => ipcRenderer.send(...args),      // ❌ No control!
});
```

### DON'T ❌

```js
// NEVER set nodeIntegration: true
new BrowserWindow({
  webPreferences: {
    nodeIntegration: true,  // ❌ Huge security risk
  },
});
```

### Validate in Main Process

```js
// Always validate IPC inputs in main process
ipcMain.handle("read-file", async (_event, filePath) => {
  // Validate the path is within allowed directory
  const resolved = path.resolve(filePath);
  const allowedDir = path.resolve(app.getPath("userData"));
  
  if (!resolved.startsWith(allowedDir)) {
    throw new Error("Access denied: path outside allowed directory");
  }
  
  return await fs.readFile(resolved, "utf-8");
});
```

---

## Quick Reference

| What | How |
|------|-----|
| Renderer → Main (with response) | `ipcRenderer.invoke()` + `ipcMain.handle()` |
| Renderer → Main (fire & forget) | `ipcRenderer.send()` + `ipcMain.on()` |
| Main → Renderer (push) | `win.webContents.send()` + `ipcRenderer.on()` |
| Expose API to renderer | `contextBridge.exposeInMainWorld()` |

---

## Next Up

[Module 07 — Menus, Tray & Native Features →](./07-menus-and-native.md)
