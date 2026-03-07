# Module 7: Community & Custom MCP Servers

---

## 🎯 Goal

Discover the wider world of MCP servers — dozens of community-built servers for Slack, Google Drive, Docker, Notion, and more. Learn how to find, evaluate, and install any MCP server.

---

## 🌐 Where to Find MCP Servers

### Official Registry
The best starting point:

| Source | URL |
|--------|-----|
| **Official MCP Servers repo** | https://github.com/modelcontextprotocol/servers |
| **MCP Server Directory** | https://github.com/punkpeye/awesome-mcp-servers |
| **VS Code MCP Docs** | https://code.visualstudio.com/docs/copilot/chat/mcp-servers |

---

## 🏆 Popular Community MCP Servers

Here's a curated list of useful servers you can install today:

---

### 1. 🔍 Brave Search Server

**What:** Search the web using Brave Search API
**Use case:** Let AI search the internet for current information

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "brave_key",
      "description": "Brave Search API Key",
      "password": true
    }
  ],
  "servers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "${input:brave_key}"
      }
    }
  }
}
```

> Get a free API key at: https://brave.com/search/api/

**Try:** *"Search for the latest Node.js LTS version"*

---

### 2. 🧠 Memory Server

**What:** Gives AI persistent memory using a knowledge graph
**Use case:** AI remembers things across conversations

```json
{
  "servers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

**Try:** *"Remember that my preferred stack is React + TypeScript + Tailwind"*

---

### 3. 🐳 Docker MCP Server

**What:** Manage Docker containers, images, and networks
**Use case:** DevOps tasks, container management via AI

```json
{
  "servers": {
    "docker": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-docker"]
    }
  }
}
```

**Try:** *"List all running Docker containers"*

---

### 4. 📋 Notion MCP Server (Community)

**What:** Read and write Notion pages and databases
**Use case:** Manage notes, docs, and project boards

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "notion_token",
      "description": "Notion Integration Token",
      "password": true
    }
  ],
  "servers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "OPENAPI_MCP_HEADERS": "{\"Authorization\": \"Bearer ${input:notion_token}\", \"Notion-Version\": \"2022-06-28\"}"
      }
    }
  }
}
```

---

### 5. 📁 Google Drive Server

**What:** Search and read files from Google Drive
**Use case:** Access documents, spreadsheets, presentations

```json
{
  "servers": {
    "gdrive": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-gdrive"]
    }
  }
}
```

---

### 6. 💬 Slack MCP Server

**What:** Read and send Slack messages
**Use case:** Check channels, send updates, search messages

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "slack_token",
      "description": "Slack Bot Token",
      "password": true
    }
  ],
  "servers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "${input:slack_token}"
      }
    }
  }
}
```

---

### 7. 🗺️ Google Maps Server

**What:** Geocoding, directions, place search
**Use case:** Location-based queries and mapping

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "maps_key",
      "description": "Google Maps API Key",
      "password": true
    }
  ],
  "servers": {
    "google-maps": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-google-maps"],
      "env": {
        "GOOGLE_MAPS_API_KEY": "${input:maps_key}"
      }
    }
  }
}
```

---

## 🧭 How to Evaluate an MCP Server Before Installing

When you find a new MCP server, check these things:

| Check | Why |
|-------|-----|
| **GitHub stars & activity** | Popular = more likely maintained |
| **Last commit date** | Avoid abandoned projects |
| **README quality** | Good docs = easier setup |
| **Source code** | Is it open source? Can you audit it? |
| **What permissions it needs** | Don't give unnecessary access |
| **Who built it** | Official (`modelcontextprotocol/`) vs community |

### Trust Levels:

```
🟢 Official (modelcontextprotocol/servers)  → Highest trust
🟡 Major Companies (Notion, Stripe, etc.)   → High trust
🟠 Popular Community (1000+ stars)          → Medium trust
🔴 Unknown/New (few stars, no audits)       → Use with caution
```

---

## 🔧 The Universal Installation Pattern

Every MCP server follows the same pattern. Here's your template:

### For any npx-based server:

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "API_TOKEN_ID",
      "description": "Description of what token to enter",
      "password": true
    }
  ],
  "servers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "PACKAGE_NAME"],
      "env": {
        "ENV_VAR_NAME": "${input:API_TOKEN_ID}"
      }
    }
  }
}
```

### For any Python (uvx) based server:

```json
{
  "servers": {
    "server-name": {
      "command": "uvx",
      "args": ["PACKAGE_NAME", "--flag", "value"],
      "env": {
        "ENV_VAR": "value"
      }
    }
  }
}
```

### For any Docker-based server:

```json
{
  "servers": {
    "server-name": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "ENV_VAR",
        "DOCKER_IMAGE:TAG"
      ],
      "env": {
        "ENV_VAR": "value"
      }
    }
  }
}
```

---

## 🏗️ Building Your Multi-Server Setup

Here's an example of a **power user config** with multiple servers:

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "brave_key",
      "description": "Brave Search API Key",
      "password": true
    }
  ],
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:/Users/You/Projects",
        "C:/Users/You/Documents"
      ]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "${input:brave_key}"
      }
    }
  }
}
```

With this setup, your AI can:
- Manage GitHub repos and issues
- Read/write files on your machine
- Browse the web
- Remember things across sessions
- Search the internet

---

## 💡 Tips for Success

1. **Start small** — add one server at a time, make sure it works before adding more
2. **Read the README** — every server has different tools and requirements
3. **Use inputs for secrets** — never hardcode API keys
4. **Check the Output panel** — when things go wrong, look at `Ctrl+Shift+U` → "MCP"
5. **Agent mode only** — MCP tools only work in Agent mode, not regular Chat

---

## ✅ Module 7 Checklist

- [ ] I know where to find MCP servers (official repo, awesome list)
- [ ] I understand the universal installation pattern
- [ ] I can evaluate whether an MCP server is trustworthy
- [ ] I've configured at least one community server
- [ ] I know how to combine multiple servers

---

## 🎓 Course Complete!

Congratulations! You now have the knowledge to:

- ✅ Understand what MCP is and how it works
- ✅ Configure any MCP server in VS Code
- ✅ Use GitHub, Filesystem, Fetch, and Database servers
- ✅ Find and evaluate community servers
- ✅ Build powerful multi-server setups

**Keep the [Cheat Sheet](../cheatsheet.md) handy for quick reference!**

---

**⬅️ Previous: [Module 6 — Database MCP Servers](06-database-mcp-servers.md)**
**📋 Reference: [MCP Cheat Sheet](../cheatsheet.md)**
