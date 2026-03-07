# Module 4: Filesystem MCP Server

---

## 🎯 Goal

Give AI the ability to **read and write files** on your computer — safely, with controlled access.

---

## 🤔 Why Would You Want This?

By default, Copilot in VS Code can only see files **in your open workspace**. But sometimes you need the AI to:

- Read config files from another folder
- Analyze log files stored elsewhere
- Create files in a specific output directory
- Work with files across multiple projects

The **Filesystem MCP Server** lets AI access files **outside** the current workspace — but only in folders **you explicitly allow**.

---

## 📦 About This Server

| Detail | Info |
|--------|------|
| **Source** | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem) |
| **Runs via** | `npx` (Node.js) |
| **Requires** | Node.js 18+ installed |
| **Docker needed?** | No |

---

## 🚀 Setup

### Step 1: Make sure Node.js is installed

Open terminal and run:
```
node --version
```
You should see `v18.x.x` or higher. If not, install from https://nodejs.org

### Step 2: Add to `.vscode/mcp.json`

```json
{
  "servers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:/Users/YOUR_USERNAME/Documents",
        "C:/Users/YOUR_USERNAME/Desktop"
      ]
    }
  }
}
```

> ⚠️ **Replace `YOUR_USERNAME`** with your actual Windows username!

### What's happening here?

- `npx -y` = Download and run the package automatically
- `@modelcontextprotocol/server-filesystem` = The filesystem server package
- The paths at the end = **Allowed directories** (the AI can ONLY access these)

---

## 🔒 Security: The Allowed Directories System

The filesystem server uses a **whitelist approach**:

```
✅ Paths listed in args     → AI can read/write here
❌ Paths NOT listed in args → AI CANNOT access (blocked!)
```

**Example:** If you only allow `C:/Users/You/Documents`:
- AI CAN read `C:/Users/You/Documents/notes.txt` ✅
- AI CAN read `C:/Users/You/Documents/subfolder/file.md` ✅
- AI CANNOT read `C:/Users/You/Desktop/secret.txt` ❌
- AI CANNOT read `C:/Windows/system32/...` ❌

> 💡 **Best practice:** Only allow the specific folders you need. Don't allow your entire `C:/` drive!

---

## 🛠️ Available Tools

Once set up, the AI gets these tools:

| Tool | What It Does |
|------|-------------|
| `read_file` | Read contents of a single file |
| `read_multiple_files` | Read multiple files at once |
| `write_file` | Create or overwrite a file |
| `edit_file` | Make targeted edits to a file |
| `create_directory` | Create a new folder |
| `list_directory` | List files and folders in a directory |
| `move_file` | Move or rename a file |
| `search_files` | Search for files by name pattern |
| `get_file_info` | Get file metadata (size, dates, etc.) |
| `list_allowed_directories` | Show which directories the AI can access |

---

## 💬 Try These Prompts!

### Basic File Operations:
```
"List all files in my Documents folder"

"Read the contents of C:/Users/Me/Documents/todo.txt"

"Create a file called 'notes.md' in my Documents with a shopping list"
```

### Searching & Analyzing:
```
"Find all .json files in my Documents folder"

"Read all .txt files in my Desktop and summarize them"

"What's the largest file in my Documents folder?"
```

### File Organization:
```
"Create a folder structure for a new project in my Documents:
 project-name/src, project-name/tests, project-name/docs"

"Move all .log files from my Desktop to a new 'logs' folder in Documents"
```

---

## 📝 Multiple Allowed Directories Example

You can allow as many directories as you need:

```json
{
  "servers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:/Users/You/Documents",
        "C:/Users/You/Desktop",
        "C:/Projects",
        "D:/Data/exports"
      ]
    }
  }
}
```

---

## ⚠️ Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using backslashes `\` in paths | Use forward slashes `/` or escaped backslashes `\\` |
| Allowing too broad a directory (`C:/`) | Be specific — only allow what you need |
| Forgetting to install Node.js | Run `node --version` to verify |
| Path doesn't exist | Create the folder first, then configure |

---

## 🔥 Pro Tip: Combine with Other Servers

You can have the Filesystem server AND the GitHub server running together:

```json
{
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
        "C:/Users/You/Documents"
      ]
    }
  }
}
```

Now the AI can do things like: *"Download the README from repo X and save it to my Documents folder"*

---

## ✅ Module 4 Checklist

- [ ] I have Node.js 18+ installed
- [ ] I configured the filesystem server with specific allowed directories
- [ ] I successfully asked AI to read or list files
- [ ] I understand the security model (whitelist approach)

---

**⬅️ Previous: [Module 3 — GitHub MCP Server](03-github-mcp-server.md)**
**➡️ Next: [Module 5 — Fetch (Web) MCP Server](05-fetch-mcp-server.md)**
