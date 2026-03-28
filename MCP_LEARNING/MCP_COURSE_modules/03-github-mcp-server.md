# Module 3: GitHub MCP Server (Deep Dive)

---

## 🎯 Goal

Set up the GitHub MCP Server and learn to manage repos, issues, PRs, and more — all through natural language in VS Code.

---

## 🌟 What Can It Do?

The GitHub MCP Server gives AI access to:

| Category | Examples |
|----------|---------|
| **Repositories** | Browse code, search files, read file contents |
| **Issues** | Create, update, list, comment on issues |
| **Pull Requests** | Create PRs, review code, merge |
| **Actions** | Monitor CI/CD workflows, check build status |
| **Code Security** | Check Dependabot alerts, code scanning results |
| **Users & Orgs** | Look up users, list org members |
| **Notifications** | Check and manage your GitHub notifications |

---

## 🚀 Setup Option 1: Remote Server (Easiest!)

This is the **recommended** way. No Docker needed. GitHub hosts the server for you.

### Step 1: Create `.vscode/mcp.json`

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

### Step 2: Open Agent Mode & Authenticate

1. Open Copilot Chat (`Ctrl+Shift+I`)
2. Switch to **Agent** mode
3. Ask anything about GitHub (e.g., "List my repos")
4. VS Code will prompt you to **sign in with GitHub** via OAuth — just click Allow!

**That's it!** No tokens, no Docker, no hassle.

---

### Using a Personal Access Token (PAT) Instead

If you prefer using a PAT instead of OAuth:

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "github_mcp_pat",
      "description": "GitHub Personal Access Token",
      "password": true
    }
  ],
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${input:github_mcp_pat}"
      }
    }
  }
}
```

> **How to create a PAT:** Go to https://github.com/settings/personal-access-tokens/new

---

## 🐳 Setup Option 2: Local Server (Docker)

Use this if you want the server running **on your machine** (more control, works offline for cached data).

### Step 1: Make sure Docker is installed and running

### Step 2: Create `.vscode/mcp.json`

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "github_token",
      "description": "GitHub Personal Access Token",
      "password": true
    }
  ],
  "servers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${input:github_token}"
      }
    }
  }
}
```

---

## 🛠️ Available Toolsets

The GitHub MCP Server groups its tools into **toolsets**. By default, these are enabled:

| Toolset | What It Includes |
|---------|-----------------|
| `context` | Info about the current user and GitHub context |
| `repos` | Repository browsing, file reading, commits |
| `issues` | Issue CRUD, comments, labels |
| `pull_requests` | PR creation, review, merging |
| `users` | User profile lookups |

### Additional Toolsets (opt-in):

| Toolset | What It Includes |
|---------|-----------------|
| `actions` | GitHub Actions workflows, CI/CD |
| `code_security` | Code scanning alerts |
| `dependabot` | Dependabot alerts and updates |
| `discussions` | GitHub Discussions |
| `gists` | Create and manage Gists |
| `git` | Low-level Git operations |
| `labels` | Label management |
| `notifications` | GitHub notifications |
| `orgs` | Organization management |
| `projects` | GitHub Projects boards |
| `secret_protection` | Secret scanning alerts |
| `security_advisories` | Security advisory tools |
| `stargazers` | Star/unstar repos |

---

## 💬 Try These Prompts!

Once your GitHub MCP Server is set up, try these in Agent mode:

### Beginner Prompts:
```
"What repos do I own?"

"Show me the README of github/github-mcp-server"

"List open issues in my repo [your-repo-name]"

"Who am I on GitHub?" (tests the context toolset)
```

### Intermediate Prompts:
```
"Create an issue titled 'Add dark mode support' in my repo [your-repo]"

"Show me the last 5 commits on the main branch of [your-repo]"

"What pull requests are open in [your-repo]?"

"Search for repos about 'machine learning' with more than 1000 stars"
```

### Advanced Prompts:
```
"Create a pull request from my 'feature-branch' to 'main' in [your-repo] 
 with title 'Add new feature' and description 'This PR adds...'"

"Check if there are any Dependabot alerts on [your-repo]"

"List all workflow runs that failed in the last week on [your-repo]"
```

---

## ⚙️ Advanced Configuration

### Enable ALL Toolsets

In Docker mode, add this environment variable:

```json
"env": {
  "GITHUB_PERSONAL_ACCESS_TOKEN": "${input:github_token}",
  "GITHUB_TOOLSETS": "all"
}
```

### Read-Only Mode (Safe for experimentation)

```json
"env": {
  "GITHUB_PERSONAL_ACCESS_TOKEN": "${input:github_token}",
  "GITHUB_READ_ONLY": "1"
}
```

This prevents the AI from creating/modifying anything — great for learning!

### Enable Only Specific Toolsets

```json
"env": {
  "GITHUB_PERSONAL_ACCESS_TOKEN": "${input:github_token}",
  "GITHUB_TOOLSETS": "repos,issues"
}
```

---

## 🔥 Insiders Mode (Early Access Features)

Want to try new experimental tools? Use the insiders URL:

```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/insiders"
    }
  }
}
```

---

## ❌ Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Authentication failed" | Bad PAT or expired token | Generate a new PAT with correct permissions |
| "Docker not found" | Docker isn't installed/running | Install Docker Desktop and start it |
| "Permission denied" | PAT doesn't have required scopes | Create a new PAT with wider permissions |
| Server not showing up | Config file syntax error | Check JSON validity (no trailing commas!) |
| "Rate limit exceeded" | Too many API calls | Wait a few minutes and try again |

---

## ✅ Module 3 Checklist

- [ ] I set up the GitHub MCP Server (remote or local)
- [ ] I successfully asked AI a GitHub-related question
- [ ] I understand the difference between toolsets
- [ ] I know how to enable read-only mode

---

**⬅️ Previous: [Module 2 — VS Code Setup](02-vscode-setup.md)**
**➡️ Next: [Module 4 — Filesystem MCP Server](04-filesystem-mcp-server.md)**
