# MCP Cheat Sheet — Quick Reference

---

## Config File Locations

| Scope | File | Notes |
|-------|------|-------|
| **Workspace** | `.vscode/mcp.json` | Per-project, shareable with team |
| **Global** | User `settings.json` → under `"mcp"` key | All projects |

---

## The 3 Server Types

### Remote (HTTP)
```json
"server-name": {
  "type": "http",
  "url": "https://api.example.com/mcp/"
}
```

### Local (Docker)
```json
"server-name": {
  "command": "docker",
  "args": ["run", "-i", "--rm", "-e", "ENV_VAR", "image:tag"],
  "env": { "ENV_VAR": "value" }
}
```

### Local (npx / uvx / binary)
```json
"server-name": {
  "command": "npx",
  "args": ["-y", "@org/package-name"],
  "env": { "API_KEY": "${input:my_key}" }
}
```

---

## Secret Handling (Inputs)

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
    "my-server": {
      "env": { "TOKEN": "${input:my_token}" }
    }
  }
}
```

---

## Copy-Paste Configs

### GitHub MCP Server (Remote — Easiest)
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

### Filesystem
```json
{
  "servers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:/Users/YOU/Documents"
      ]
    }
  }
}
```

### Fetch (Web)
```json
{
  "servers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
```

### SQLite
```json
{
  "servers": {
    "sqlite": {
      "command": "uvx",
      "args": [
        "mcp-server-sqlite",
        "--db-path",
        "C:/path/to/database.db"
      ]
    }
  }
}
```

### PostgreSQL
```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "pg_url",
      "description": "PostgreSQL connection string",
      "password": true
    }
  ],
  "servers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "${input:pg_url}"]
    }
  }
}
```

### Brave Search
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
      "env": { "BRAVE_API_KEY": "${input:brave_key}" }
    }
  }
}
```

### Memory
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

---

## VS Code Shortcuts

| Action | How |
|--------|-----|
| Open Copilot Chat | `Ctrl+Shift+I` |
| Switch to Agent Mode | Click mode selector below chat input → "Agent" |
| Check MCP Servers | `Ctrl+Shift+P` → "MCP: List Servers" |
| View MCP Logs | `Ctrl+Shift+U` → select "MCP" from dropdown |
| Open Settings JSON | `Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)" |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Server not starting | Check Output panel → MCP for errors |
| "Command not found" | Install Node.js / Python / Docker |
| Auth failed | Regenerate token/key, check permissions |
| Tools not appearing | Make sure you're in **Agent** mode |
| JSON syntax error | Validate JSON (no trailing commas!) |
| Docker errors | Make sure Docker Desktop is running |

---

## Key Rules

1. MCP tools only work in **Agent mode**
2. **Never hardcode secrets** — use `inputs` with `password: true`
3. In `settings.json` wrap config in `"mcp": { }` — in `.vscode/mcp.json` don't
4. Use **forward slashes** `/` in file paths (even on Windows)
5. Each server runs independently — you can mix and match freely
