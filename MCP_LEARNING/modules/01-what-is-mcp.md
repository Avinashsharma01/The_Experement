# Module 1: What is MCP? (The Big Picture)

---

## 🧠 The Problem MCP Solves

Imagine you're chatting with an AI assistant in VS Code. It can write code, explain bugs, suggest fixes — but it **can't**:

- Check your GitHub issues
- Read a webpage for you
- Query your database
- Look at files outside your workspace

**Why?** Because the AI is stuck inside a chat box. It has no hands, no eyes, no way to reach the outside world.

**MCP fixes this.** It gives the AI **tools** to interact with external services.

---

## 🔌 What is MCP?

**MCP = Model Context Protocol**

Think of it like a **universal plug** between AI assistants and external tools/services.

```
┌─────────────┐       MCP Protocol       ┌─────────────────┐
│             │ ◄──────────────────────► │                 │
│  AI in      │    "Hey, list my open    │   GitHub        │
│  VS Code    │     issues on repo X"    │   MCP Server    │
│  (Client)   │ ◄──────────────────────► │   (Server)      │
│             │    [returns 5 issues]     │                 │
└─────────────┘                           └─────────────────┘
```

### In Simple Words:
- **MCP Client** = The AI assistant (GitHub Copilot in VS Code)
- **MCP Server** = A small program that connects to a specific service (GitHub, a database, the filesystem, etc.)
- **MCP Protocol** = The language they speak to each other

---

## 🏗️ How Does It Work? (Step by Step)

```
Step 1: You ask AI a question
         "What are my open PRs on github.com/myorg/myrepo?"

Step 2: AI recognizes it needs the GitHub MCP Server tool

Step 3: AI calls the MCP Server:
         → Tool: "list_pull_requests"
         → Input: { owner: "myorg", repo: "myrepo", state: "open" }

Step 4: MCP Server talks to GitHub API and gets the data

Step 5: MCP Server returns the results to the AI

Step 6: AI reads the results and gives you a nice answer:
         "You have 3 open PRs: #42, #58, #71..."
```

---

## 🧩 Types of MCP Servers

| Type | What It Does | Example |
|------|-------------|---------|
| **Remote Server** | Runs on someone else's infrastructure, you just connect via URL | GitHub MCP Server (remote) |
| **Local Server (Docker)** | Runs in a Docker container on YOUR machine | GitHub MCP Server (local via Docker) |
| **Local Server (Binary)** | Runs as a program directly on your machine | Filesystem, SQLite servers |
| **Local Server (Node.js)** | Runs via `npx` or `node` on your machine | Many community servers |

---

## 🎯 Real-World Analogy

Think of MCP like **apps on your phone**:

| Phone World | MCP World |
|-------------|-----------|
| Your phone | VS Code + AI |
| App Store | MCP Server Registry / GitHub |
| WhatsApp app | GitHub MCP Server |
| Google Maps app | Fetch MCP Server |
| Notes app | Filesystem MCP Server |
| Each app needs permissions | Each MCP server needs tokens/config |

You install an app, give it permissions, and now your phone can do more. Same idea — you configure an MCP server, give it credentials, and now your AI can do more.

---

## 📝 Key Terms to Remember

| Term | Meaning |
|------|---------|
| **MCP** | Model Context Protocol — the standard for AI ↔ Tool communication |
| **MCP Server** | A program that provides tools to the AI |
| **MCP Client** | The AI host (VS Code with Copilot) |
| **Tool** | A specific action the server offers (e.g., "create_issue", "read_file") |
| **Toolset** | A group of related tools (e.g., "issues", "pull_requests") |
| **Agent Mode** | The VS Code Copilot mode where MCP tools are available |
| **PAT** | Personal Access Token — a password-like key for API access |

---

## ✅ Module 1 Checklist

- [ ] I understand what MCP stands for
- [ ] I understand the Client ↔ Server relationship
- [ ] I know the difference between Remote and Local MCP servers
- [ ] I know what "tools" and "toolsets" mean

---

**➡️ Next: [Module 2 — Setting Up MCP in VS Code](02-vscode-setup.md)**
