# Module 01 — What is Electron JS?

## The Big Picture

You already build web apps with **React + Node.js** (MERN stack). Electron lets you take that same skillset and ship **native desktop apps** for Windows, macOS, and Linux.

> **Electron = Chromium (browser) + Node.js (backend) + Native OS APIs**

That's it. Your HTML/CSS/JS runs inside a bundled Chromium browser, and you get full Node.js access for file system, OS features, etc.

---

## Apps Built with Electron

You probably already use some of these daily:

| App | What it does |
|-----|-------------|
| **VS Code** | Code editor (yes, the one you're using right now) |
| **Discord** | Chat / voice app |
| **Slack** | Team communication |
| **Figma Desktop** | Design tool |
| **Postman** | API testing |
| **MongoDB Compass** | MongoDB GUI |

---

## Electron vs Web App — What's Different?

| Feature | Web App (React) | Electron App |
|---------|----------------|--------------|
| Runs in | User's browser | Its own bundled Chromium |
| File system access | No (sandboxed) | Yes (full Node.js) |
| OS notifications | Limited | Full native |
| System tray | No | Yes |
| Offline support | Requires service workers | Works by default |
| Auto-updates | Just deploy | Built-in updater module |
| Installation | None | .exe / .dmg / .AppImage |

---

## Why Should a MERN Dev Care?

1. **Zero new language** — It's just JavaScript + HTML + CSS
2. **Use npm packages** — All your favorite Node.js packages work
3. **Same React skills** — You can use React, Vue, or plain vanilla JS for the UI
4. **Ship fast** — No need to learn C++, Rust, or Swift to build desktop apps
5. **Cross-platform** — One codebase → Windows + macOS + Linux

---

## Trade-offs (Be Honest)

| Downside | Reality |
|----------|---------|
| **App size** | ~80-150 MB minimum (ships entire Chromium) |
| **Memory usage** | Higher than native apps |
| **Performance** | Fine for most apps, not ideal for AAA games or heavy computation |
| **Startup time** | Slightly slower than native |

For most business/productivity/utility apps, these trade-offs are perfectly acceptable.

---

## How Does It Work? (30-Second Version)

```
┌─────────────────────────────────────────┐
│              Your Electron App          │
│                                         │
│  ┌──────────────┐  ┌────────────────┐   │
│  │ Main Process │  │Renderer Process│   │
│  │  (Node.js)   │◄─►│  (Chromium)    │   │
│  │              │  │                │   │
│  │ • File I/O   │  │ • HTML/CSS/JS  │   │
│  │ • OS APIs    │  │ • Your UI      │   │
│  │ • Menus      │  │ • React/Vue    │   │
│  │ • Dialogs    │  │ • DOM          │   │
│  └──────────────┘  └────────────────┘   │
│         ▲                ▲              │
│         └──── IPC ──────┘              │
└─────────────────────────────────────────┘
```

- **Main Process** = The backend. Manages windows, system tray, menus. Has full Node.js access.
- **Renderer Process** = The frontend. Your web page running inside Chromium.
- **IPC** = Inter-Process Communication. How the two talk to each other.

---

## Next Up

[Module 02 — Project Setup & First Launch →](./02-project-setup.md)
