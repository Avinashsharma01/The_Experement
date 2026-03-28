# Module 02 — Project Setup & First Launch

## Prerequisites

You already have these as a MERN dev:

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **VS Code**

That's all you need. No extra SDKs, no platform-specific tools.

---

## Step 1 — Initialize the Project

```bash
mkdir my-electron-app
cd my-electron-app
npm init -y
```

## Step 2 — Install Electron

```bash
npm install --save-dev electron
```

> Electron is a **dev dependency** because it's a build tool — your users won't install it via npm.

## Step 3 — Update package.json

```json
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "dev": "electron . --dev"
  },
  "devDependencies": {
    "electron": "^33.0.0"
  }
}
```

Key things:
- `"main": "main.js"` — Tells Electron which file to run first
- `"start": "electron ."` — Launches your app
- `"dev": "electron . --dev"` — Launches with DevTools open

---

## Step 4 — Create the Main Process File

Create `main.js` in the root:

```js
const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
```

### What's happening here?

| Code | Purpose |
|------|---------|
| `app` | Controls the app lifecycle (start, quit, etc.) |
| `BrowserWindow` | Creates a native OS window |
| `app.whenReady()` | Fires when Electron is initialized |
| `win.loadFile()` | Loads your HTML into the window |
| `window-all-closed` | On Windows/Linux, quit when all windows close |

---

## Step 5 — Create the HTML File

Create `index.html` in the root:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>My First Electron App</title>
  </head>
  <body>
    <h1>Hello from Electron! 🚀</h1>
    <p>If you can see this, Electron is working.</p>
  </body>
</html>
```

---

## Step 6 — Run It!

```bash
npm start
```

A native window opens with your HTML page. **That's your first desktop app.**

Use `npm run dev` to open with DevTools (same Chrome DevTools you already know).

---

## Project Structure So Far

```
my-electron-app/
├── main.js          ← Main process (Node.js)
├── index.html       ← Your UI
├── package.json
└── node_modules/
```

Compare this to Express:

| Express Server | Electron App |
|---------------|--------------|
| `server.js` creates HTTP server | `main.js` creates BrowserWindow |
| Browser fetches pages via URL | Window loads local HTML files |
| Routes handle requests | IPC handles messages |

---

## Common Gotchas for New Devs

### 1. "Nothing happens when I run `npm start`"
- Check `"main"` field in package.json points to the right file
- Check your `main.js` file name matches exactly

### 2. "White screen"
- Check `win.loadFile()` path is correct
- Open DevTools (`Ctrl+Shift+I`) to see console errors

### 3. "App doesn't close on Windows"
- Add the `window-all-closed` handler (see code above)

---

## Next Up

[Module 03 — Understanding the Architecture →](./03-architecture.md)
