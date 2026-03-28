# Module 5: Fetch (Web) MCP Server

---

## 🎯 Goal

Give AI the ability to **fetch web pages and APIs** — so it can look things up, read documentation, or pull data from the internet.

---

## 🤔 Why Would You Want This?

The AI's training data has a cutoff date. It doesn't know about:
- Today's documentation changes
- New API releases
- Current content on any website
- Live data from REST APIs

The **Fetch MCP Server** lets AI **browse the web** in real-time, right from your VS Code chat.

---

## 📦 About This Server

| Detail | Info |
|--------|------|
| **Source** | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/fetch) |
| **Runs via** | `npx` (Node.js) or `uvx` (Python) |
| **Requires** | Node.js 18+ OR Python 3.10+ |
| **Docker needed?** | No |

---

## 🚀 Setup (Node.js Version)

### Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "fetch": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-fetch"
      ]
    }
  }
}
```

That's it! No tokens, no API keys, no allowed directories. It just works.

---

## 🚀 Setup (Python Version)

If you prefer Python:

```json
{
  "servers": {
    "fetch": {
      "command": "uvx",
      "args": [
        "mcp-server-fetch"
      ]
    }
  }
}
```

> 💡 `uvx` is the Python package runner (like `npx` for Node). Install via: `pip install uv`

---

## 🛠️ Available Tools

| Tool | What It Does |
|------|-------------|
| `fetch` | Fetches a URL and returns the content (converts HTML to readable markdown) |

Simple but powerful! The server:
1. Downloads the web page
2. Strips out ads, navigation, scripts
3. Converts the useful content to clean markdown
4. Returns it to the AI

---

## 💬 Try These Prompts!

### Reading Documentation:
```
"Fetch the docs at https://docs.python.org/3/library/json.html 
 and explain the main functions"

"Read https://developer.mozilla.org/en-US/docs/Web/CSS/Grid 
 and give me a quick summary of CSS Grid"
```

### Research & Learning:
```
"Fetch https://en.wikipedia.org/wiki/Rust_(programming_language) 
 and tell me the key features of Rust"

"Read the Express.js getting started page and show me a basic setup"
```

### API Exploration:
```
"Fetch https://api.github.com/repos/microsoft/vscode 
 and tell me how many stars VS Code has"

"Fetch https://jsonplaceholder.typicode.com/posts/1 
 and show me the response format"
```

### Comparing Information:
```
"Fetch the README pages of these two npm packages and compare them:
 - https://www.npmjs.com/package/express
 - https://www.npmjs.com/package/fastify"
```

---

## ⚙️ Configuration Options

### Custom User-Agent

Some websites block automated requests. You can set a custom user-agent:

```json
{
  "servers": {
    "fetch": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-fetch"
      ],
      "env": {
        "USER_AGENT": "MCP-Fetch-Server/1.0"
      }
    }
  }
}
```

---

## 🔥 Power Combo: Fetch + Filesystem

Combine with the Filesystem server for powerful workflows:

```json
{
  "servers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:/Users/You/Documents"
      ]
    }
  }
}
```

Now you can ask:
```
"Fetch the API documentation from https://some-api.com/docs 
 and save a summary to my Documents folder as api-notes.md"
```

---

## ⚠️ Limitations

| Limitation | Why |
|-----------|-----|
| Can't handle JavaScript-rendered pages (SPAs) | It fetches raw HTML, doesn't run a browser |
| Some sites block automated access | Rate limiting, CAPTCHAs, bot detection |
| Large pages may be truncated | There's a content size limit |
| No authentication support built-in | Can't log into websites |

---

## ❌ Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "Failed to fetch" | Check if the URL is correct and accessible |
| Empty response | The site may block automated access |
| Garbled content | The page may be JavaScript-rendered (SPA) |
| `npx` not found | Install Node.js from https://nodejs.org |

---

## ✅ Module 5 Checklist

- [ ] I configured the Fetch MCP Server
- [ ] I successfully asked AI to fetch a webpage
- [ ] I understand the limitations (no JS rendering, no auth)
- [ ] I tried combining Fetch with another MCP server

---

**⬅️ Previous: [Module 4 — Filesystem MCP Server](04-filesystem-mcp-server.md)**
**➡️ Next: [Module 6 — Database MCP Servers](06-database-mcp-servers.md)**
