# Module 9: Build Your Own MCP Server — Step by Step 🛠️

> **Go from zero to a working custom MCP server. By the end, you'll have built a real server that Copilot can use inside VS Code.**

---

## 🎯 What We're Building

We'll build a **"Dev Toolkit" MCP Server** in TypeScript — a practical server that gives Copilot these tools:

| Tool | What It Does |
|------|-------------|
| `generate_uuid` | Generates a random UUID |
| `timestamp_convert` | Converts between Unix timestamps and human dates |
| `json_format` | Pretty-prints / minifies JSON |
| `hash_text` | Hashes text with MD5, SHA-1, or SHA-256 |
| `base64_encode` | Encodes/decodes Base64 strings |

These are tools you'd actually use day-to-day as a developer!

---

## 📋 Prerequisites

Before you start, make sure you have:

- [x] **Node.js 18+** installed (`node --version` to check)
- [x] **npm** installed (comes with Node.js)
- [x] **VS Code** with Copilot
- [x] Basic TypeScript knowledge (or JavaScript — they're close enough)

---

## 🚀 Step 1: Scaffold the Project

Open a terminal and run:

```bash
# Create a new directory for your server
mkdir my-mcp-server
cd my-mcp-server

# Initialize the project
npm init -y

# Install the MCP SDK and TypeScript dependencies
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node tsx

# Initialize TypeScript
npx tsc --init
```

Your folder structure should now look like this:

```
my-mcp-server/
├── node_modules/
├── package.json
├── tsconfig.json
└── (we'll add src/ next)
```

---

## 📝 Step 2: Configure the Project

### Update `tsconfig.json`:

Replace the contents with:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

### Update `package.json`:

Add these fields:

```json
{
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts"
  }
}
```

---

## 🧠 Step 3: Understand the Server Structure

Before writing code, here's the blueprint of what we're building:

```
┌─────────────────────────────────────────────────────────┐
│                  YOUR MCP SERVER                         │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  1. IMPORTS & SETUP                                │  │
│  │     Import SDK, create server instance             │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│                          ▼                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │  2. REGISTER TOOLS                                 │  │
│  │     Tell the server what tools you offer            │  │
│  │     (name, description, input schema)              │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│                          ▼                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │  3. HANDLE TOOL CALLS                              │  │
│  │     Write the logic that runs when AI calls a tool │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│                          ▼                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │  4. START THE SERVER                               │  │
│  │     Connect transport (stdio) and begin listening  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

> 💡 Every MCP server follows this exact same pattern — no matter how simple or complex.

---

## 💻 Step 4: Write the Server Code

Create the source directory and file:

```bash
mkdir src
```

Now create `src/index.ts` with this code:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { randomUUID, createHash } from "node:crypto";

// ═══════════════════════════════════════════════════════════
// 1. CREATE THE SERVER
// ═══════════════════════════════════════════════════════════

const server = new McpServer({
  name: "dev-toolkit",
  version: "1.0.0",
});

// ═══════════════════════════════════════════════════════════
// 2. REGISTER TOOLS — Each tool needs a name, description,
//    input schema (using Zod), and a handler function.
// ═══════════════════════════════════════════════════════════

// ── Tool 1: Generate UUID ──────────────────────────────────
server.tool(
  "generate_uuid",
  "Generate a random UUID (v4)",
  {},  // no inputs needed
  async () => {
    const uuid = randomUUID();
    return {
      content: [{ type: "text", text: uuid }],
    };
  }
);

// ── Tool 2: Timestamp Converter ────────────────────────────
server.tool(
  "timestamp_convert",
  "Convert between Unix timestamps and human-readable dates",
  {
    value: z.string().describe("A Unix timestamp (seconds) OR a date string like '2025-03-08T10:30:00Z'"),
    direction: z.enum(["to_human", "to_unix"]).describe("Conversion direction"),
  },
  async ({ value, direction }) => {
    let result: string;

    if (direction === "to_human") {
      const ms = Number(value) * 1000;
      if (isNaN(ms)) {
        return { content: [{ type: "text", text: "Error: Invalid Unix timestamp" }] };
      }
      result = new Date(ms).toISOString();
    } else {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return { content: [{ type: "text", text: "Error: Invalid date string" }] };
      }
      result = Math.floor(date.getTime() / 1000).toString();
    }

    return {
      content: [{ type: "text", text: result }],
    };
  }
);

// ── Tool 3: JSON Formatter ─────────────────────────────────
server.tool(
  "json_format",
  "Pretty-print or minify a JSON string",
  {
    json: z.string().describe("The JSON string to format"),
    mode: z.enum(["pretty", "minify"]).default("pretty").describe("Output mode"),
  },
  async ({ json, mode }) => {
    try {
      const parsed = JSON.parse(json);
      const result = mode === "pretty"
        ? JSON.stringify(parsed, null, 2)
        : JSON.stringify(parsed);

      return {
        content: [{ type: "text", text: result }],
      };
    } catch {
      return {
        content: [{ type: "text", text: "Error: Invalid JSON input" }],
      };
    }
  }
);

// ── Tool 4: Hash Text ──────────────────────────────────────
server.tool(
  "hash_text",
  "Hash text using MD5, SHA-1, or SHA-256",
  {
    text: z.string().describe("The text to hash"),
    algorithm: z.enum(["md5", "sha1", "sha256"]).default("sha256").describe("Hash algorithm"),
  },
  async ({ text, algorithm }) => {
    const hash = createHash(algorithm).update(text).digest("hex");
    return {
      content: [{ type: "text", text: `${algorithm.toUpperCase()}: ${hash}` }],
    };
  }
);

// ── Tool 5: Base64 Encode/Decode ───────────────────────────
server.tool(
  "base64_encode",
  "Encode or decode a Base64 string",
  {
    text: z.string().describe("The text to encode or decode"),
    direction: z.enum(["encode", "decode"]).default("encode").describe("Direction"),
  },
  async ({ text, direction }) => {
    let result: string;

    if (direction === "encode") {
      result = Buffer.from(text, "utf-8").toString("base64");
    } else {
      result = Buffer.from(text, "base64").toString("utf-8");
    }

    return {
      content: [{ type: "text", text: result }],
    };
  }
);

// ═══════════════════════════════════════════════════════════
// 3. START THE SERVER — Connect stdio transport and listen
// ═══════════════════════════════════════════════════════════

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Dev Toolkit MCP Server running on stdio");
}

main().catch(console.error);
```

---

## 🔍 Step 5: Understand What Just Happened

Let's break down the code pattern:

```
server.tool(
  "tool_name",            ← Name the AI sees and calls
  "Description...",       ← The AI reads this to decide when to use it
  {                       ← Input schema using Zod
    param: z.string()...  ← Defines what parameters the tool accepts
  },
  async (args) => {       ← Handler function — your actual logic
    // Do the work...
    return {
      content: [{         ← Return result as content array
        type: "text",
        text: "result"
      }]
    };
  }
);
```

> 🔑 **The description is critical!** The AI uses it to decide WHEN to call your tool. Write clear, specific descriptions.

---

## ⚡ Step 6: Build & Test Locally

```bash
# Build the TypeScript
npm run build

# Quick test — run the server and send it a JSON-RPC request
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/index.js
```

You should see a JSON response listing all 5 tools. If you see tool definitions come back — it works! 🎉

---

## 🔌 Step 7: Connect to VS Code

Now the magic moment — let's make Copilot use your server!

### Option A: Workspace Config (recommended for project-specific servers)

Create `.vscode/mcp.json` in any project where you want to use this server:

```json
{
  "servers": {
    "dev-toolkit": {
      "type": "stdio",
      "command": "node",
      "args": [
        "C:/FULL/PATH/TO/my-mcp-server/dist/index.js"
      ]
    }
  }
}
```

> ⚠️ Replace `C:/FULL/PATH/TO/` with the actual absolute path to your built server.

### Option B: Global Config (available in ALL projects)

Open VS Code Settings JSON (`Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)") and add:

```json
{
  "mcp": {
    "servers": {
      "dev-toolkit": {
        "type": "stdio",
        "command": "node",
        "args": [
          "C:/FULL/PATH/TO/my-mcp-server/dist/index.js"
        ]
      }
    }
  }
}
```

### Option C: Use `tsx` for Development (no build step)

```json
{
  "servers": {
    "dev-toolkit": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "tsx",
        "C:/FULL/PATH/TO/my-mcp-server/src/index.ts"
      ]
    }
  }
}
```

---

## ✅ Step 8: Verify It Works

1. **Open Copilot Chat** in VS Code
2. Look for the **wrench/tools icon** in chat — your "dev-toolkit" should appear
3. Try these prompts:

```
💬 "Generate a UUID for me"

💬 "What's the Unix timestamp for March 8, 2026?"

💬 "Pretty-print this JSON: {"name":"Avinash","skills":["MCP","TypeScript"]}"

💬 "Hash the text 'hello world' using SHA-256"

💬 "Encode 'Hello MCP!' to Base64"
```

If Copilot responds using your tools — **congratulations, you just built an MCP server!** 🎉

---

## 🏗️ Step 9: Add More Tools (The Pattern)

Now that you know the pattern, adding new tools is easy. Here's the template:

```typescript
server.tool(
  "my_new_tool",                          // unique tool name
  "What this tool does in plain English", // clear description
  {
    // Input parameters with Zod validation
    input1: z.string().describe("What this parameter is"),
    input2: z.number().optional().describe("Optional number"),
  },
  async ({ input1, input2 }) => {
    // Your logic here
    const result = doSomethingWith(input1, input2);

    return {
      content: [{ type: "text", text: String(result) }],
    };
  }
);
```

### Tool Ideas to Try Next:

| Tool Idea | What It Does | Difficulty |
|-----------|-------------|------------|
| `regex_test` | Test a regex against a string | 🟢 Easy |
| `color_convert` | Convert between HEX, RGB, HSL | 🟢 Easy |
| `lorem_ipsum` | Generate placeholder text | 🟢 Easy |
| `jwt_decode` | Decode a JWT token (without verification) | 🟡 Medium |
| `cron_explain` | Explain a cron expression in English | 🟡 Medium |
| `api_health_check` | Ping a URL and return status code | 🟡 Medium |
| `markdown_to_html` | Convert markdown to HTML | 🟡 Medium |
| `csv_to_json` | Convert CSV data to JSON | 🟡 Medium |

---

## 🐛 Step 10: Debugging Your Server

### Common Issues & Fixes:

| Problem | Cause | Fix |
|---------|-------|-----|
| Server not showing up | Config path wrong | Double-check the absolute path in `mcp.json` |
| Server shows "disconnected" | Crash on startup | Run `node dist/index.js` manually and check for errors |
| Tool calls fail | Schema mismatch | Make sure Zod schema matches what you expect |
| No output from tool | Handler error | Add `try/catch` in your handler, return error as text |
| `Cannot find module` | Not built | Run `npm run build` first |

### Debug Tip — Add Logging:

```typescript
// Log to stderr (stdout is reserved for MCP protocol!)
console.error("Tool called:", toolName, "with args:", args);
```

> 🔴 **NEVER use `console.log()`** in an MCP server! stdout is the MCP communication channel. Always use `console.error()` for debugging output.

---

## 📦 Step 11: Publish & Share (Optional)

Want others to use your server? Here's how:

### Option A: Share on GitHub

```bash
# Add a .gitignore
echo "node_modules/\ndist/" > .gitignore

# Push to GitHub
git init
git add .
git commit -m "My first MCP server!"
git remote add origin https://github.com/yourusername/my-mcp-server.git
git push -u origin main
```

Others can use it by cloning, building, and pointing their config at the built file.

### Option B: Publish to npm

Add a `bin` field to `package.json`:

```json
{
  "name": "my-mcp-server",
  "bin": {
    "my-mcp-server": "dist/index.js"
  }
}
```

Add this as the first line of `src/index.ts`:

```typescript
#!/usr/bin/env node
```

Then:

```bash
npm run build
npm publish
```

Now anyone can use it with:

```json
{
  "servers": {
    "dev-toolkit": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "my-mcp-server"]
    }
  }
}
```

---

## 🗺️ The Complete Build Roadmap

```
  START HERE
      │
      ▼
  ┌────────────┐     ┌────────────┐     ┌────────────┐
  │ Step 1-2   │────►│ Step 3-4   │────►│ Step 5-6   │
  │ Scaffold   │     │ Understand │     │ Build &    │
  │ & Config   │     │ & Write    │     │ Test       │
  └────────────┘     └────────────┘     └────────────┘
                                              │
                                              ▼
  ┌────────────┐     ┌────────────┐     ┌────────────┐
  │ Step 11    │◄────│ Step 9-10  │◄────│ Step 7-8   │
  │ Publish    │     │ Expand &   │     │ Connect &  │
  │ & Share    │     │ Debug      │     │ Verify     │
  └────────────┘     └────────────┘     └────────────┘
                                              │
                                              ▼
                                        🎉 YOU DID IT!
```

---

## ✅ What You Can Now Do

After this module, you can:

- [x] Scaffold an MCP server project from scratch
- [x] Write tools with proper Zod schemas
- [x] Handle tool calls and return results
- [x] Connect your server to VS Code
- [x] Debug common issues
- [x] Add new tools using the pattern
- [x] Share your server with the world

---

[⬅️ Previous: How MCP Works (Visuals)](08-how-mcp-works-visuals.md) | [➡️ Next: MCP Power Tips & Secret Tricks](10-power-tips-and-secrets.md)
