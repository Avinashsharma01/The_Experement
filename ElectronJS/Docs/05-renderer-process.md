# Module 05 — Deep Dive: Renderer Process

The renderer is where your UI lives. If you're a MERN dev, this is your **React side** — except it runs inside Electron's Chromium, not the user's browser.

---

## What You Already Know

As a frontend dev, you're already 90% there. The renderer process is just a web page:

```
✅ HTML, CSS, JavaScript
✅ DOM APIs (document, window, etc.)
✅ Fetch API
✅ localStorage / sessionStorage
✅ Canvas, WebGL, Web Audio
✅ CSS Grid, Flexbox, animations
✅ Any CSS framework (Tailwind, Bootstrap, etc.)
✅ Any JS framework (React, Vue, Svelte, etc.)
```

The key difference: **you're loading local files, not serving from a web server.**

---

## Loading Your UI

### Option 1: Plain HTML (Our Starter Project)

```
renderer/
├── index.html
├── styles.css
└── renderer.js
```

```js
// main.js
win.loadFile(path.join(__dirname, "renderer", "index.html"));
```

### Option 2: React / Vite (For Real Apps)

```bash
# Inside your Electron project
npm create vite@latest renderer -- --template react
cd renderer
npm install
npm run build
```

```js
// main.js — load the built files
win.loadFile(path.join(__dirname, "renderer", "dist", "index.html"));

// In dev mode, load from Vite dev server
win.loadURL("http://localhost:5173");
```

---

## Talking to Main Process via Preload

You cannot use `require()` or Node.js APIs in the renderer. Instead, use the APIs exposed by your preload script:

```js
// ✅ Correct — use exposed API
const info = await window.electronAPI.getAppInfo();

// ❌ Wrong — this won't work
const fs = require("fs");
```

### The Pattern

```
User clicks button
    ↓
renderer.js calls window.electronAPI.doSomething()
    ↓
preload.js forwards via ipcRenderer.invoke("do-something")
    ↓
main.js handles via ipcMain.handle("do-something")
    ↓
Result flows back to renderer.js
```

---

## Common UI Patterns in Electron

### Pattern 1: Display System Info

```js
// renderer.js
async function loadInfo() {
  const info = await window.electronAPI.getAppInfo();
  document.getElementById("version").textContent = info.version;
}
loadInfo();
```

### Pattern 2: File Open Flow

```js
// renderer.js
document.getElementById("open-btn").addEventListener("click", async () => {
  const file = await window.electronAPI.openFile();
  if (file) {
    document.getElementById("editor").value = file.content;
    document.getElementById("filename").textContent = file.path;
  }
});
```

### Pattern 3: Listen for Main Process Events

```js
// renderer.js
window.electronAPI.onMenuAction((action) => {
  switch (action) {
    case "new":     clearEditor(); break;
    case "save":    saveFile();    break;
    case "zoom-in": zoomIn();     break;
  }
});
```

### Pattern 4: Drag & Drop Files

```js
// renderer.js
document.addEventListener("drop", async (e) => {
  e.preventDefault();
  for (const file of e.dataTransfer.files) {
    const content = await file.text();
    console.log(file.name, content);
  }
});

document.addEventListener("dragover", (e) => {
  e.preventDefault();
});
```

---

## Styling Tips for Desktop Apps

### Make It Feel Native

```css
/* Prevent text selection on buttons and labels */
button, label, header, nav {
  user-select: none;
  -webkit-user-select: none;
}

/* Allow text selection only where needed */
.editable, input, textarea, code, pre {
  user-select: text;
  -webkit-user-select: text;
}

/* Disable image dragging */
img {
  -webkit-user-drag: none;
}
```

### Custom Title Bar (frameless window)

```css
.titlebar {
  height: 32px;
  background: #1e1e1e;
  display: flex;
  align-items: center;
  padding: 0 12px;
  -webkit-app-region: drag;     /* Makes it draggable */
}

.titlebar button {
  -webkit-app-region: no-drag;  /* Buttons stay clickable */
}
```

### Dark Mode Detection

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1a1a2e;
    --text: #e0e0e0;
  }
}

@media (prefers-color-scheme: light) {
  :root {
    --bg: #ffffff;
    --text: #222222;
  }
}
```

---

## DevTools — Your Best Friend

Since Electron uses Chromium, you get the full Chrome DevTools:

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+I` | Open DevTools |
| `Ctrl+Shift+J` | Open Console |
| `Ctrl+R` | Reload page |
| `F11` | Toggle fullscreen |

Or open programmatically:

```js
// main.js
win.webContents.openDevTools();
```

---

## Differences from Regular Web Dev

| Web App | Electron App |
|---------|--------------|
| `fetch("/api/data")` to your server | `window.electronAPI.getData()` via IPC |
| CORS issues with external APIs | No CORS — you're not in a browser sandbox |
| URLs (`/about`, `/settings`) | Load different HTML files or swap sections |
| `window.open()` opens browser tab | Opens a new Electron window |
| No file access | Full file access via Main process |
| `localStorage` persists per domain | `localStorage` persists per app |

---

## Using React in Electron

If you want to use React (since you know it from MERN):

```bash
# Option A: Vite + React (recommended)
npm create vite@latest renderer -- --template react

# Option B: Use electron-vite (all-in-one)
npm create @electron-vite
```

The principles stay the same — React runs in the renderer, communicates with Main via IPC through the preload bridge.

---

## Next Up

[Module 06 — Preload Scripts & IPC Deep Dive →](./06-preload-and-ipc.md)
