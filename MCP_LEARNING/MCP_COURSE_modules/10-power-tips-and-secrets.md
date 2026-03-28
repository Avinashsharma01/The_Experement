# Module 10: MCP Power Tips & Secret Tricks 🔮

> **The stuff nobody tells you. Advanced patterns, hidden features, and pro-level techniques to get 10x more out of MCP.**

---

## 🎁 This One's From Me to You

This module isn't in any official docs. It's a collection of patterns, tricks, and hard-won insights I've put together to take your MCP game to the next level.

---

## 🧠 Trick #1: Chain Multiple Servers in a Single Prompt

Most people use one server at a time. Pros chain them:

```
💬 "Fetch the README from https://github.com/expressjs/express,
    then save a summary to ~/notes/express-summary.md,
    then create a GitHub issue on my repo 'learning-notes'
    with a link to the summary"
```

This single prompt chains **3 MCP servers**:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Fetch Server │────►│ Filesystem   │────►│ GitHub       │
│              │     │ Server       │     │ Server       │
│ GET readme   │     │ WRITE file   │     │ CREATE issue │
└──────────────┘     └──────────────┘     └──────────────┘
```

> 💡 **The AI is the orchestrator.** You just need all servers configured — Copilot figures out the execution order.

---

## ⚡ Trick #2: The "Explain Yourself" Pattern

After any MCP tool call, add: **"...and explain what you just did step by step"**

```
💬 "Query my database for all users created in the last 7 days,
    format it as a markdown table,
    and explain what SQL you used and why"
```

This turns every tool call into a **learning opportunity**. The AI will show you:
- The exact tool it called
- The parameters it used
- Why it chose that approach
- The raw results vs. the formatted output

---

## 🔄 Trick #3: Dynamic Server Configs with Variables

You can use VS Code variables in your `mcp.json`:

```json
{
  "servers": {
    "project-fs": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@anthropic-ai/mcp-filesystem",
        "${workspaceFolder}"
      ]
    }
  }
}
```

### Available Variables:

| Variable | Expands To |
|----------|-----------|
| `${workspaceFolder}` | Root of your current workspace |
| `${workspaceFolderBasename}` | Just the folder name |
| `${userHome}` | Your home directory |

This way the **same config works across different machines and projects**.

---

## 🕵️ Trick #4: Inspect What Servers Actually Send

Want to see the raw JSON-RPC traffic? Add this wrapper script:

Create a file called `debug-wrapper.sh` (or `.ps1` for Windows):

**PowerShell (`debug-wrapper.ps1`):**

```powershell
# Logs all MCP traffic to a file for inspection
$logFile = "$env:USERPROFILE\mcp-debug.log"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content $logFile "`n=== Session started at $timestamp ==="

# Start the actual server and tee output
& node C:\path\to\your\server\dist\index.js 2>&1 | Tee-Object -FilePath $logFile -Append
```

Then point your config at the wrapper instead:

```json
{
  "servers": {
    "debug-toolkit": {
      "type": "stdio",
      "command": "powershell",
      "args": ["-File", "C:/path/to/debug-wrapper.ps1"]
    }
  }
}
```

> ⚠️ Use this only for debugging — remove it when done.

---

## 🎨 Trick #5: The "Swiss Army Prompt" — One Prompt, Full Analysis

Try this super-prompt with the GitHub MCP server:

```
💬 "Analyze my repository [owner/repo]:
    1. List all open issues and categorize them by label
    2. Find PRs that have been open for more than 7 days
    3. Check if the README mentions a contributing guide
    4. Give me a project health score out of 10 with reasoning"
```

The AI will make **multiple tool calls** automatically, combining:
- `list_issues` → categorize
- `list_pull_requests` → filter by date
- `get_file_contents` → read README
- Its own reasoning → health score

All from one prompt.

---

## 📐 Trick #6: Build Servers That Return Structured Data

When building your own servers, return structured formats the AI can parse easily:

```typescript
// ❌ BAD — Hard for AI to parse
return {
  content: [{ type: "text", text: "Users: John (active), Jane (inactive), Bob (active)" }],
};

// ✅ GOOD — AI can parse, filter, and transform this
return {
  content: [{
    type: "text",
    text: JSON.stringify({
      users: [
        { name: "John",  status: "active" },
        { name: "Jane",  status: "inactive" },
        { name: "Bob",   status: "active" }
      ],
      total: 3,
      activeCount: 2
    }, null, 2)
  }],
};
```

> 💡 JSON in the response lets the AI do follow-up analysis, filtering, and formatting without another tool call.

---

## 🛡️ Trick #7: Security-First Server Design

When building servers that handle sensitive data, follow these patterns:

```typescript
// ✅ Pattern 1: Validate and sanitize all inputs
server.tool(
  "query_data",
  "Query the data store",
  {
    table: z.string().regex(/^[a-zA-Z_]+$/).describe("Table name (alphanumeric + underscore only)"),
    limit: z.number().min(1).max(100).default(10).describe("Max rows"),
  },
  async ({ table, limit }) => {
    // The Zod schema already prevents SQL injection via regex validation
    // ...
  }
);

// ✅ Pattern 2: Allowlist, don't blocklist
const ALLOWED_TABLES = ["users", "products", "orders"] as const;

server.tool(
  "safe_query",
  "Query allowed tables only",
  {
    table: z.enum(ALLOWED_TABLES).describe("Table to query"),
  },
  async ({ table }) => {
    // Can only ever query these 3 tables — no injection possible
    // ...
  }
);

// ✅ Pattern 3: Read-only by default
// Only add write tools if absolutely necessary
// Always prefer "read_X" tools over "write_X" tools
```

---

## 🧪 Trick #8: Test Your Server Without VS Code

You don't need VS Code open to test your MCP server. Use the MCP Inspector:

```bash
# Install the MCP Inspector globally
npx @modelcontextprotocol/inspector node dist/index.js
```

This opens a **web-based UI** where you can:
- See all registered tools
- Call tools manually with custom inputs
- Inspect the JSON-RPC messages
- Test without waiting for Copilot

```
┌─────────────────────────────────────────────┐
│           MCP INSPECTOR (Browser)            │
│                                              │
│  Server: dev-toolkit v1.0.0                  │
│  Status: ✅ Connected                        │
│                                              │
│  Tools:                                      │
│  ┌────────────────────────────────────────┐  │
│  │ ▶ generate_uuid        [Call]          │  │
│  │ ▶ timestamp_convert    [Call]          │  │
│  │ ▶ json_format          [Call]          │  │
│  │ ▶ hash_text            [Call]          │  │
│  │ ▶ base64_encode        [Call]          │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Response:                                   │
│  { "content": [{ "text": "a1b2c3..." }] }  │
│                                              │
└─────────────────────────────────────────────┘
```

---

## 🔥 Trick #9: The "Before & After" Workflow

Use MCP servers to create powerful before-and-after workflows:

```
💬 "Read my current database schema,
    compare it with the schema defined in /docs/schema.md,
    list any differences,
    and create a migration SQL file to fix them"
```

This uses:
- **Database MCP** → read current schema
- **Filesystem MCP** → read schema doc
- **AI analysis** → find differences
- **Filesystem MCP** → write migration file

One prompt. Four operations. Zero manual work.

---

## 📊 Trick #10: MCP Server Comparison Matrix

Choosing the right server for a task? Use this decision matrix:

```
                 ┌──────────────────────────────────────────────────┐
                 │         WHAT DO YOU NEED THE AI TO DO?           │
                 └──────────┬───────────────────────┬───────────────┘
                            │                       │
                 ┌──────────▼──────────┐  ┌────────▼────────────┐
                 │ Work with EXTERNAL  │  │ Work with LOCAL     │
                 │ services?           │  │ files/data?         │
                 └──────────┬──────────┘  └────────┬────────────┘
                            │                      │
              ┌─────────────┼──────────┐    ┌──────┼──────────┐
              │             │          │    │      │          │
        ┌─────▼────┐  ┌────▼───┐ ┌────▼─┐ ┌▼──────▼┐  ┌─────▼────┐
        │ GitHub   │  │ Fetch  │ │Slack │ │Filesystem│  │Database │
        │ Server   │  │ Server │ │Server│ │ Server  │  │Server   │
        │          │  │        │ │      │ │         │  │         │
        │ repos,   │  │ web    │ │msgs, │ │ read/   │  │ query,  │
        │ issues,  │  │ pages, │ │chans │ │ write   │  │ schema, │
        │ PRs,code │  │ APIs   │ │      │ │ files   │  │ tables  │
        └──────────┘  └────────┘ └──────┘ └─────────┘  └─────────┘
```

---

## 🎓 Trick #11: The MCP Project Starter Kit

Here's a checklist when starting ANY new MCP server project:

```
□  1. Define your tools (what should the AI be able to do?)
□  2. Pick your transport (stdio for local, HTTP for remote)
□  3. Scaffold with the SDK (npm install @modelcontextprotocol/sdk)
□  4. Write input schemas with Zod (be specific with descriptions!)
□  5. Implement handlers (keep them focused — one action per tool)
□  6. Test with MCP Inspector (npx @modelcontextprotocol/inspector)
□  7. Connect to VS Code (mcp.json or settings.json)
□  8. Test with real prompts in Copilot
□  9. Add error handling (return errors as text content)
□ 10. Document your tools in a README
```

---

## 💎 Trick #12: The "Living Documentation" Pattern

This is my favorite pattern — use MCP to keep docs always up to date:

```
💬 "Read all the API route files in src/routes/,
    then read the current API.md documentation,
    find any routes that are missing from the docs,
    and update API.md with the missing ones"
```

```
  ┌───────────────┐         ┌────────────────┐
  │ Filesystem    │         │ Filesystem     │
  │ READ routes/* │────────►│ READ API.md    │
  └───────────────┘         └───────┬────────┘
                                    │
                            ┌───────▼────────┐
                            │ AI COMPARES    │
                            │ & FINDS GAPS   │
                            └───────┬────────┘
                                    │
                            ┌───────▼────────┐
                            │ Filesystem     │
                            │ WRITE API.md   │
                            │ (updated)      │
                            └────────────────┘
```

Set this up as a habit and your docs will never be stale again.

---

## 🏆 Your MCP Mastery Roadmap

```
╔══════════════════════════════════════════════════════════════════╗
║                     YOUR MCP JOURNEY                             ║
║                                                                  ║
║  🟢 BEGINNER (Modules 1-5)                                      ║
║  ├── Understand what MCP is                                      ║
║  ├── Configure servers in VS Code                                ║
║  ├── Use GitHub, Filesystem, Fetch servers                       ║
║  └── Write basic prompts                                         ║
║                                                                  ║
║  🟡 INTERMEDIATE (Modules 6-8)                                   ║
║  ├── Use Database servers                                        ║
║  ├── Install community servers                                   ║
║  ├── Understand the protocol visually                            ║
║  └── Chain multiple servers                                      ║
║                                                                  ║
║  🔴 ADVANCED (Modules 9-10)                                      ║
║  ├── Build your own servers                                      ║
║  ├── Publish to npm/GitHub                                       ║
║  ├── Use power patterns & tricks                                 ║
║  └── Design secure, production-ready servers                     ║
║                                                                  ║
║  ⭐ NEXT: Contribute to the MCP ecosystem!                       ║
║     • Build servers for services you use daily                   ║
║     • Share them on GitHub / npm                                 ║
║     • Help others on the community forums                        ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## ✅ What You Now Know

After this module, you can:

- [x] Chain multiple MCP servers in creative workflows
- [x] Debug MCP traffic with logging and the Inspector
- [x] Build security-first server designs
- [x] Use power prompts for complex multi-step tasks
- [x] Test servers without VS Code
- [x] Follow the MCP project starter checklist
- [x] Keep documentation alive with MCP automation

---

> 🎉 **You've completed the full MCP course!** You went from "What is MCP?" to building your own servers and mastering pro-level patterns. Go build something awesome.

---

[⬅️ Previous: Build Your Own MCP Server](09-build-your-own-mcp-server.md) | [🏠 Back to Course Home](README.md)
