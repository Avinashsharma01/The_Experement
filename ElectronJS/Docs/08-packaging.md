# Module 08 — Packaging & Distribution

You've built your app. Now let's turn it into an installable `.exe` (Windows), `.dmg` (macOS), or `.AppImage` (Linux).

---

## Tool Options

| Tool | Stars | Best For |
|------|-------|----------|
| **electron-builder** | 13k+ | Most popular, lots of targets |
| **electron-forge** | 6k+ | Official Electron tooling |
| **electron-packager** | 9k+ | Simple, no installer |

We'll use **electron-builder** — it's the most widely used.

---

## Setup electron-builder

### Step 1: Install

```bash
npm install --save-dev electron-builder
```

### Step 2: Add build scripts to package.json

```json
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "dev": "electron . --dev",
    "build": "electron-builder",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux"
  },
  "build": {
    "appId": "com.yourname.myapp",
    "productName": "My Electron App",
    "directories": {
      "output": "dist"
    },
    "files": [
      "main.js",
      "preload.js",
      "renderer/**/*",
      "package.json"
    ],
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "assets/icon.icns"
    },
    "linux": {
      "target": "AppImage",
      "icon": "assets/icon.png"
    }
  },
  "devDependencies": {
    "electron": "^33.0.0",
    "electron-builder": "^25.0.0"
  }
}
```

### Step 3: Build!

```bash
# Build for your current platform
npm run build

# Build for Windows specifically
npm run build:win
```

Output goes to the `dist/` folder:
```
dist/
├── My Electron App Setup 1.0.0.exe    ← Windows installer
├── My Electron App-1.0.0.dmg          ← macOS installer
└── My Electron App-1.0.0.AppImage     ← Linux portable
```

---

## App Icons

You need icons in specific formats:

| Platform | Format | Size |
|----------|--------|------|
| Windows | `.ico` | 256x256 |
| macOS | `.icns` | 512x512+ |
| Linux | `.png` | 512x512 |

### Quick icon setup:

```
assets/
├── icon.ico      ← Windows
├── icon.icns     ← macOS
└── icon.png      ← Linux (also used as fallback)
```

> **Tip:** Use [electron-icon-builder](https://www.npmjs.com/package/electron-icon-builder) or online converters to generate all formats from a single PNG.

---

## The `files` Array — What Gets Packaged

Only include what you need:

```json
"files": [
  "main.js",
  "preload.js",
  "renderer/**/*",
  "!renderer/**/*.map",
  "package.json"
]
```

Exclude patterns with `!`:
- `!**/*.map` — source maps
- `!**/node_modules/.cache` — build cache
- `!**/*.md` — markdown files

---

## Auto-Updates

Electron has a built-in auto-updater:

```bash
npm install electron-updater
```

```js
// main.js
const { autoUpdater } = require("electron-updater");

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on("update-available", () => {
  mainWindow.webContents.send("update-available");
});

autoUpdater.on("update-downloaded", () => {
  autoUpdater.quitAndInstall();
});
```

You'll need to host your releases on **GitHub Releases**, **S3**, or a similar service.

---

## Common Build Issues

### "Build fails on Windows"
- Install Windows Build Tools: `npm install --global windows-build-tools`
- Make sure Python 2.7 or 3.x is available

### "App is too large"
- Check your `files` array — you might be including `node_modules` that aren't needed
- Use `asar: true` (default) — it packs files into an archive

### "Icon not showing"
- Windows needs `.ico` format (not `.png`)
- Make sure icon path in `build` config is correct

---

## electron-forge (Alternative)

If you prefer the official tooling:

```bash
# Create new project with Forge
npm init electron-app@latest my-app

# Or add Forge to existing project
npx electron-forge import
```

```bash
# Build with Forge
npm run make
```

---

## Distribution Checklist

- [ ] App icon in correct format for each platform
- [ ] `productName` set in build config
- [ ] `appId` is unique (reverse domain: `com.yourname.appname`)
- [ ] Version number updated
- [ ] DevTools disabled in production
- [ ] Only necessary files included in build
- [ ] Tested on target platform
- [ ] Code signed (for macOS/Windows distribution)

### Disable DevTools in Production

```js
// main.js
if (process.argv.includes("--dev")) {
  win.webContents.openDevTools();
}
// Don't open DevTools otherwise!
```

---

## Build Size Optimization

| Technique | Impact |
|-----------|--------|
| Use `asar` packaging (default) | Reduces file count |
| Exclude dev files (`*.map`, `*.md`) | -10-50MB |
| Use `--ignore` patterns | Skip test files |
| Use `electron-builder` minification | Smaller output |
| Consider `electron-vite` for tree-shaking | Best for React/Vue apps |

---

## Summary — What You Learned

| Module | Topic |
|--------|-------|
| 01 | What Electron is and why it matters |
| 02 | Project setup and first launch |
| 03 | Main vs Renderer architecture |
| 04 | Main process APIs (windows, dialogs, IPC) |
| 05 | Renderer process (UI, styling, DevTools) |
| 06 | Preload scripts & IPC patterns |
| 07 | Menus, tray, notifications, native features |
| 08 | Packaging and distribution |

**You now have everything you need to build real Electron apps.** Start with the starter project, add features, and ship it!

---

## What's Next?

- Add **React** for a more complex UI
- Add **SQLite** or **better-sqlite3** for local database
- Add **electron-store** for persistent settings
- Build a **real project** (note app, file manager, dashboard, dev tool)
- Explore **electron-vite** for a modern dev experience
