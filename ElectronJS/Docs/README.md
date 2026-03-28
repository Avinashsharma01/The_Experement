# Electron JS — Complete Course for MERN Developers

> Go from web dev to desktop app dev using what you already know.

---

## Course Modules

| # | Module | What You'll Learn |
|---|--------|------------------|
| 01 | [What is Electron?](./01-what-is-electron.md) | Big picture, how it works, MERN comparison |
| 02 | [Project Setup](./02-project-setup.md) | Installation, first launch, project structure |
| 03 | [Architecture](./03-architecture.md) | Main vs Renderer, IPC basics, security model |
| 04 | [Main Process](./04-main-process.md) | Windows, dialogs, IPC handlers, lifecycle |
| 05 | [Renderer Process](./05-renderer-process.md) | UI, styling for desktop, DevTools, React tips |
| 06 | [Preload & IPC](./06-preload-and-ipc.md) | contextBridge, all IPC patterns, security |
| 07 | [Menus & Native](./07-menus-and-native.md) | Menus, tray, notifications, shortcuts, shell |
| 08 | [Packaging](./08-packaging.md) | Build installers, icons, auto-updates, dist |

---

## Starter Project

The `ElectronJS/` folder contains a working starter app that demonstrates:

- **Main process** — Window creation, menus, dialogs, IPC handlers
- **Preload script** — Secure bridge using `contextBridge`
- **Renderer** — Polished UI with system info cards, IPC demo, counter

### Run It

```bash
cd ElectronJS
npm install
npm start        # Launch the app
npm run dev      # Launch with DevTools open
```

### Project Structure

```
ElectronJS/
├── main.js              ← Main process
├── preload.js           ← Preload bridge
├── package.json
├── renderer/
│   ├── index.html       ← App UI
│   ├── styles.css       ← Dark theme styling
│   └── renderer.js      ← Frontend logic + IPC calls
└── Docs/                ← This course
```

---

## Prerequisites

- Node.js v18+
- npm
- VS Code
- Existing JavaScript / MERN knowledge

---

## Time Estimate

| Speed | Duration |
|-------|----------|
| Skim through | ~1 hour |
| Read + follow along | ~3 hours |
| Read + build projects | ~1-2 days |

Start with **Module 01** → [What is Electron?](./01-what-is-electron.md)
