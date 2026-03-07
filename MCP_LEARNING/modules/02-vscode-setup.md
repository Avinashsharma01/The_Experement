# Module 2: Setting Up MCP in VS Code

---

## 🎯 Goal

By the end of this module, you'll know **exactly where and how** to configure ANY MCP server in VS Code.

---

## 📋 Prerequisites

- VS Code **version 1.101+** (check: `Help → About`)
- GitHub Copilot extension installed
- GitHub Copilot Chat extension installed

> 💡 **How to check your VS Code version:**
> Press `Ctrl+Shift+P` → type "About" → click "About"

---

## 🗂️ Where Do MCP Configs Live?

There are **two places** you can configure MCP servers:

### Option A: Workspace-Level (Recommended for teams)

File: `.vscode/mcp.json` in your project folder

```
my-project/
├── .vscode/
│   └── mcp.json     ← MCP config for THIS project
├── src/
└── package.json
```

**When to use:** When you want MCP servers available only for a specific project, or want to share config with teammates.

### Option B: User-Level (Global)

Location: VS Code User Settings (`settings.json`)

**When to use:** When you want an MCP server available in ALL your projects.

> **How to open User Settings JSON:**
> Press `Ctrl+Shift+P` → type "settings json" → click "Preferences: Open User Settings (JSON)"

---

## 📝 The MCP Config Format

Every MCP server config follows the same pattern. Here's the skeleton:

### In `.vscode/mcp.json` (workspace):

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "my_token",
      "description": "Enter your API token",
      "password": true
    }
  ],
  "servers": {
    "server-name": {
      // Server configuration goes here
    }
  }
}
```

### In User `settings.json` (global):

```json
{
  "mcp": {
    "inputs": [
      // same as above
    ],
    "servers": {
      "server-name": {
        // same as above
      }
    }
  }
}
```

> ⚠️ **Key difference:** In `settings.json`, everything is wrapped inside an `"mcp"` key. In `.vscode/mcp.json`, it's at the top level.

---

## 🔧 Three Types of Server Configs

### Type 1: Remote Server (HTTP)

The server runs on someone else's infrastructure. You just point to a URL.

```json
{
  "servers": {
    "my-remote-server": {
      "type": "http",
      "url": "https://some-api.example.com/mcp/"
    }
  }
}
```

**Pros:** No Docker, no installs, just a URL
**Cons:** Requires internet, depends on the provider

---

### Type 2: Local Server via Docker

The server runs in a Docker container on your machine.

```json
{
  "servers": {
    "my-docker-server": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "SOME_ENV_VAR",
        "docker-image-name:latest"
      ],
      "env": {
        "SOME_ENV_VAR": "some-value"
      }
    }
  }
}
```

**Pros:** Isolated, reproducible
**Cons:** Requires Docker installed and running

---

### Type 3: Local Server via Command (npx, node, python, binary)

The server runs as a local process on your machine.

```json
{
  "servers": {
    "my-local-server": {
      "command": "npx",
      "args": [
        "-y",
        "@some-org/some-mcp-server"
      ],
      "env": {
        "API_KEY": "your-key-here"
      }
    }
  }
}
```

**Pros:** Lightweight, no Docker needed
**Cons:** Requires Node.js/Python/etc. installed

---

## 🔐 Handling Secrets (Tokens, API Keys)

**NEVER hardcode secrets directly in config files!** Use the `inputs` system:

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "my_api_key",
      "description": "Enter your API key",
      "password": true
    }
  ],
  "servers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "some-server"],
      "env": {
        "API_KEY": "${input:my_api_key}"
      }
    }
  }
}
```

When the server starts, VS Code will **prompt you** to enter the key. It won't be saved in plain text.

---

## ▶️ How to Start/Use MCP Servers

### Step 1: Open Copilot Chat
Press `Ctrl+Shift+I` (or click the Copilot icon in the sidebar)

### Step 2: Switch to Agent Mode
At the bottom of the chat input, you'll see a mode selector.
Click it and select **"Agent"** mode.

> MCP tools ONLY work in Agent mode, not in regular Chat or Edit mode!

### Step 3: Ask a question that needs the MCP tool
Just ask naturally! For example:
- "What are my open issues on repo X?" (uses GitHub MCP)
- "Read the file at /path/to/file.txt" (uses Filesystem MCP)

### Step 4: Approve the tool call
VS Code will show you what tool the AI wants to use and what data it will send.
Click **"Allow"** to proceed.

---

## 🔍 How to Check If Your MCP Server Is Working

1. Press `Ctrl+Shift+P`
2. Type: **"MCP: List Servers"**
3. You should see your configured servers listed
4. Check their status (running, stopped, error)

If a server shows an error:
- Check the **Output panel** (`Ctrl+Shift+U`) → select "MCP" from the dropdown
- Look for error messages (wrong token, Docker not running, etc.)

---

## 📁 Exercise: Create Your First MCP Config

Create a file `.vscode/mcp.json` in any project with this content:

```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

Then:
1. Open Copilot Chat → Agent mode
2. Ask: "What MCP tools do you have available?"
3. You should see GitHub-related tools listed!

---

## ✅ Module 2 Checklist

- [ ] I know the two places MCP config can live (`.vscode/mcp.json` vs `settings.json`)
- [ ] I understand the three server types (Remote, Docker, Command)
- [ ] I know how to use `inputs` for secrets
- [ ] I know how to switch to Agent mode
- [ ] I can check if my MCP servers are running

---

**⬅️ Previous: [Module 1 — What is MCP?](01-what-is-mcp.md)**
**➡️ Next: [Module 3 — GitHub MCP Server](03-github-mcp-server.md)**
