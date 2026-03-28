# Self-Learning Course: Build a Linux Terminal Simulator

> **Course Goal**: By the end of this course, you will build a fully interactive Linux terminal simulator where users can practice shell commands, file operations, and basic scripting — safely in the browser.
>
> **Prerequisites**: Basic React knowledge. No Linux experience needed — you'll learn it here!
>
> **Time**: ~50 minutes, 7 lessons

---

## Lesson 1: Why Learn the Linux Terminal?

### Why It Matters

Every developer eventually needs the terminal:
- **Servers** run Linux (90%+ of web servers)
- **DevOps** and deployment rely on shell commands
- **Git** is used from the terminal
- **Package managers** (npm, pip) run in the terminal
- **Job interviews** test command-line skills

### How a Terminal Works

```
You Type a Command
       │
       ▼
┌──────────────┐
│    Shell      │    ← Interprets your command
│   (bash)      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Kernel      │    ← Executes the operation
│  (Linux OS)   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Hardware     │    ← Reads/writes files, memory, etc.
│  (Disk, RAM)  │
└──────────────┘
       │
       ▼
  Output printed
  back to you
```

### Our Simulator

We won't run a real Linux kernel — we'll **simulate** a filesystem and commands in JavaScript. This is safe for learning because:
- No risk of breaking anything
- Works on any browser
- Instant feedback
- Reset anytime

---

## Lesson 2: Set Up the Virtual File System

### Design the File System as a JavaScript Object

```jsx
const createDefaultFileSystem = () => ({
  "/": {
    type: "dir",
    children: {
      home: {
        type: "dir",
        children: {
          student: {
            type: "dir",
            children: {
              "readme.txt": {
                type: "file",
                content: "Welcome to Linux Terminal Simulator!\nPractice commands safely here.",
              },
              projects: {
                type: "dir",
                children: {
                  "hello.py": {
                    type: "file",
                    content: 'print("Hello, World!")',
                  },
                  "notes.txt": {
                    type: "file",
                    content: "My project notes\n- Learn Linux\n- Practice commands",
                  },
                },
              },
              documents: {
                type: "dir",
                children: {},
              },
            },
          },
        },
      },
      etc: {
        type: "dir",
        children: {
          "hostname": {
            type: "file",
            content: "linux-simulator",
          },
        },
      },
      tmp: {
        type: "dir",
        children: {},
      },
    },
  },
})
```

### File System Tree Visualization

```
/
├── home/
│   └── student/         ← You start here (home directory)
│       ├── readme.txt
│       ├── projects/
│       │   ├── hello.py
│       │   └── notes.txt
│       └── documents/
├── etc/
│   └── hostname
└── tmp/
```

### Key Concept: Paths

```
Absolute Path:   /home/student/projects/hello.py
                 │
                 └── Starts from root (/)

Relative Path:   projects/hello.py
                 │
                 └── Starts from current directory

Special Paths:
  .    = current directory
  ..   = parent directory
  ~    = home directory (/home/student)
```

---

## Lesson 3: Build the Terminal Component

### Create `src/components/LinuxTerminal.jsx`:

```jsx
import React, { useState, useRef, useEffect } from "react"

function LinuxTerminal() {
  const [fileSystem, setFileSystem] = useState(createDefaultFileSystem())
  const [cwd, setCwd] = useState("/home/student")
  const [history, setHistory] = useState([
    { type: "system", text: "Linux Terminal Simulator v1.0" },
    { type: "system", text: 'Type "help" for available commands.\n' },
  ])
  const [input, setInput] = useState("")
  const [commandHistory, setCommandHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const terminalRef = useRef(null)
  const inputRef = useRef(null)
  const username = "student"
  const hostname = "linux-sim"

  useEffect(() => {
    terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight)
  }, [history])

  // Resolve a path to an absolute path
  const resolvePath = (path) => {
    if (path === "~") return "/home/student"
    if (path.startsWith("~/")) return "/home/student/" + path.slice(2)
    if (!path.startsWith("/")) {
      path = cwd === "/" ? "/" + path : cwd + "/" + path
    }

    const parts = path.split("/").filter(Boolean)
    const resolved = []
    for (const part of parts) {
      if (part === ".") continue
      if (part === "..") { resolved.pop(); continue }
      resolved.push(part)
    }
    return "/" + resolved.join("/")
  }

  // Navigate the file system tree to find a node
  const getNode = (path) => {
    if (path === "/") return fileSystem["/"]
    const parts = path.split("/").filter(Boolean)
    let node = fileSystem["/"]
    for (const part of parts) {
      if (!node || node.type !== "dir" || !node.children[part]) return null
      node = node.children[part]
    }
    return node
  }

  // Set a node at a path
  const setNode = (path, value) => {
    const newFs = JSON.parse(JSON.stringify(fileSystem))
    const parts = path.split("/").filter(Boolean)
    const name = parts.pop()
    let node = newFs["/"]
    for (const part of parts) {
      node = node.children[part]
    }
    if (value === null) {
      delete node.children[name]
    } else {
      node.children[name] = value
    }
    setFileSystem(newFs)
  }

  const addOutput = (text, type = "output") => {
    setHistory((prev) => [...prev, { type, text }])
  }

  // ── COMMAND IMPLEMENTATIONS ──

  const commands = {
    help: () => {
      addOutput(`Available Commands:
  pwd          Print working directory
  ls [path]    List directory contents
  cd [path]    Change directory
  cat <file>   Display file contents
  mkdir <dir>  Create a directory
  touch <file> Create an empty file
  echo <text>  Print text (use > to write to file)
  rm <file>    Remove a file
  rmdir <dir>  Remove an empty directory
  cp <s> <d>   Copy a file
  mv <s> <d>   Move/rename a file
  find <name>  Search for files by name
  wc <file>    Count lines, words, chars
  head <file>  Show first 5 lines
  tail <file>  Show last 5 lines
  clear        Clear the terminal
  whoami       Print current user
  date         Print current date/time
  history      Show command history
  reset        Reset file system to default
  help         Show this help message`)
    },

    pwd: () => addOutput(cwd),

    ls: (args) => {
      const flags = args.filter((a) => a.startsWith("-"))
      const target = args.find((a) => !a.startsWith("-")) || cwd
      const path = resolvePath(target)
      const node = getNode(path)

      if (!node) return addOutput(`ls: cannot access '${target}': No such file or directory`, "error")
      if (node.type !== "dir") return addOutput(target)

      const entries = Object.keys(node.children).sort()
      if (entries.length === 0) return addOutput("")

      if (flags.includes("-l") || flags.includes("-la")) {
        const lines = entries.map((name) => {
          const child = node.children[name]
          const isDir = child.type === "dir"
          const perms = isDir ? "drwxr-xr-x" : "-rw-r--r--"
          const size = isDir ? 4096 : (child.content?.length || 0)
          return `${perms}  ${username}  ${size.toString().padStart(6)}  ${name}${isDir ? "/" : ""}`
        })
        addOutput(lines.join("\n"))
      } else {
        addOutput(entries.map((n) =>
          node.children[n].type === "dir" ? n + "/" : n
        ).join("  "))
      }
    },

    cd: (args) => {
      const target = args[0] || "~"
      const path = resolvePath(target)
      const node = getNode(path)
      if (!node) return addOutput(`cd: no such directory: ${target}`, "error")
      if (node.type !== "dir") return addOutput(`cd: not a directory: ${target}`, "error")
      setCwd(path)
    },

    cat: (args) => {
      if (!args[0]) return addOutput("cat: missing file operand", "error")
      const path = resolvePath(args[0])
      const node = getNode(path)
      if (!node) return addOutput(`cat: ${args[0]}: No such file or directory`, "error")
      if (node.type === "dir") return addOutput(`cat: ${args[0]}: Is a directory`, "error")
      addOutput(node.content || "")
    },

    mkdir: (args) => {
      if (!args[0]) return addOutput("mkdir: missing operand", "error")
      const path = resolvePath(args[0])
      const parent = path.substring(0, path.lastIndexOf("/")) || "/"
      const parentNode = getNode(parent)
      if (!parentNode) return addOutput(`mkdir: cannot create '${args[0]}': No such file or directory`, "error")
      const name = path.split("/").pop()
      if (parentNode.children[name]) return addOutput(`mkdir: cannot create '${name}': File exists`, "error")
      setNode(path, { type: "dir", children: {} })
    },

    touch: (args) => {
      if (!args[0]) return addOutput("touch: missing file operand", "error")
      const path = resolvePath(args[0])
      const existing = getNode(path)
      if (existing) return // touch on existing file just updates timestamp
      setNode(path, { type: "file", content: "" })
    },

    echo: (args) => {
      const text = args.join(" ")
      const redirectIndex = text.indexOf(">")
      if (redirectIndex === -1) return addOutput(text)

      const append = text[redirectIndex + 1] === ">"
      const content = text.substring(0, redirectIndex).trim()
      const file = text.substring(redirectIndex + (append ? 2 : 1)).trim()
      if (!file) return addOutput("echo: missing file for redirect", "error")

      const path = resolvePath(file)
      const existing = getNode(path)

      if (append && existing) {
        setNode(path, { type: "file", content: existing.content + "\n" + content })
      } else {
        setNode(path, { type: "file", content })
      }
    },

    rm: (args) => {
      if (!args[0]) return addOutput("rm: missing operand", "error")
      const path = resolvePath(args[0])
      const node = getNode(path)
      if (!node) return addOutput(`rm: cannot remove '${args[0]}': No such file or directory`, "error")
      if (node.type === "dir" && !args.includes("-r") && !args.includes("-rf")) {
        return addOutput(`rm: cannot remove '${args[0]}': Is a directory (use rm -r)`, "error")
      }
      setNode(path, null)
    },

    rmdir: (args) => {
      if (!args[0]) return addOutput("rmdir: missing operand", "error")
      const path = resolvePath(args[0])
      const node = getNode(path)
      if (!node) return addOutput(`rmdir: '${args[0]}': No such file or directory`, "error")
      if (node.type !== "dir") return addOutput(`rmdir: '${args[0]}': Not a directory`, "error")
      if (Object.keys(node.children).length > 0) return addOutput(`rmdir: '${args[0]}': Directory not empty`, "error")
      setNode(path, null)
    },

    cp: (args) => {
      if (args.length < 2) return addOutput("cp: missing operand", "error")
      const srcPath = resolvePath(args[0])
      const srcNode = getNode(srcPath)
      if (!srcNode) return addOutput(`cp: '${args[0]}': No such file or directory`, "error")
      if (srcNode.type === "dir") return addOutput(`cp: '${args[0]}': Is a directory (not supported)`, "error")
      setNode(resolvePath(args[1]), { type: "file", content: srcNode.content })
    },

    mv: (args) => {
      if (args.length < 2) return addOutput("mv: missing operand", "error")
      const srcPath = resolvePath(args[0])
      const srcNode = getNode(srcPath)
      if (!srcNode) return addOutput(`mv: '${args[0]}': No such file or directory`, "error")
      setNode(resolvePath(args[1]), JSON.parse(JSON.stringify(srcNode)))
      setNode(srcPath, null)
    },

    find: (args) => {
      if (!args[0]) return addOutput("find: missing name", "error")
      const searchName = args[0]
      const results = []
      const search = (node, path) => {
        if (node.type === "dir" && node.children) {
          for (const [name, child] of Object.entries(node.children)) {
            const childPath = path === "/" ? "/" + name : path + "/" + name
            if (name.includes(searchName)) results.push(childPath)
            search(child, childPath)
          }
        }
      }
      search(fileSystem["/"], "")
      addOutput(results.length ? results.join("\n") : `No files matching '${searchName}' found`)
    },

    wc: (args) => {
      if (!args[0]) return addOutput("wc: missing operand", "error")
      const path = resolvePath(args[0])
      const node = getNode(path)
      if (!node || node.type === "dir") return addOutput(`wc: ${args[0]}: No such file`, "error")
      const lines = (node.content.match(/\n/g) || []).length + 1
      const words = node.content.split(/\s+/).filter(Boolean).length
      const chars = node.content.length
      addOutput(`  ${lines}  ${words}  ${chars}  ${args[0]}`)
    },

    head: (args) => {
      if (!args[0]) return addOutput("head: missing operand", "error")
      const path = resolvePath(args[0])
      const node = getNode(path)
      if (!node || node.type === "dir") return addOutput(`head: ${args[0]}: No such file`, "error")
      addOutput(node.content.split("\n").slice(0, 5).join("\n"))
    },

    tail: (args) => {
      if (!args[0]) return addOutput("tail: missing operand", "error")
      const path = resolvePath(args[0])
      const node = getNode(path)
      if (!node || node.type === "dir") return addOutput(`tail: ${args[0]}: No such file`, "error")
      addOutput(node.content.split("\n").slice(-5).join("\n"))
    },

    clear: () => setHistory([]),
    whoami: () => addOutput(username),
    date: () => addOutput(new Date().toString()),

    history: () => {
      addOutput(commandHistory.map((cmd, i) => `  ${i + 1}  ${cmd}`).join("\n"))
    },

    reset: () => {
      setFileSystem(createDefaultFileSystem())
      setCwd("/home/student")
      setHistory([{ type: "system", text: "File system reset to default.\n" }])
    },
  }

  const handleCommand = (cmdLine) => {
    const trimmed = cmdLine.trim()
    if (!trimmed) return

    // Add prompt line to history
    addOutput(`${username}@${hostname}:${cwd}$ ${trimmed}`, "prompt")

    // Save to command history
    setCommandHistory((prev) => [...prev, trimmed])
    setHistoryIndex(-1)

    // Parse command and arguments
    const parts = trimmed.split(/\s+/)
    const cmd = parts[0]
    const args = parts.slice(1)

    if (commands[cmd]) {
      commands[cmd](args)
    } else {
      addOutput(`${cmd}: command not found. Type "help" for commands.`, "error")
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCommand(input)
      setInput("")
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex === -1) return
      const newIndex = historyIndex + 1
      if (newIndex >= commandHistory.length) {
        setHistoryIndex(-1)
        setInput("")
      } else {
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
      // Simple tab completion for files/dirs in current directory
      const parts = input.split(/\s+/)
      const partial = parts[parts.length - 1]
      if (partial) {
        const node = getNode(cwd)
        if (node && node.children) {
          const matches = Object.keys(node.children).filter((n) => n.startsWith(partial))
          if (matches.length === 1) {
            parts[parts.length - 1] = matches[0]
            setInput(parts.join(" "))
          } else if (matches.length > 1) {
            addOutput(`${username}@${hostname}:${cwd}$ ${input}`, "prompt")
            addOutput(matches.join("  "))
          }
        }
      }
    }
  }

  const getLineColor = (type) => {
    switch (type) {
      case "prompt": return "#4CAF50"
      case "error": return "#f44336"
      case "system": return "#ffd700"
      default: return "#d4d4d4"
    }
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      backgroundColor: "#0d0d0d",
      fontFamily: "'Courier New', Consolas, monospace",
    }}>
      {/* Header */}
      <div style={{
        padding: "8px 16px",
        backgroundColor: "#1a1a2e",
        color: "#4CAF50",
        fontWeight: "bold",
        fontSize: "14px",
        display: "flex",
        justifyContent: "space-between",
      }}>
        <span>🐧 Linux Terminal Simulator</span>
        <span style={{ color: "#888", fontSize: "12px" }}>
          student@linux-sim: {cwd}
        </span>
      </div>

      {/* Terminal Output */}
      <div
        ref={terminalRef}
        onClick={() => inputRef.current?.focus()}
        style={{
          flex: 1,
          overflow: "auto",
          padding: "12px 16px",
          cursor: "text",
        }}
      >
        {history.map((line, i) => (
          <div key={i} style={{
            color: getLineColor(line.type),
            fontSize: "14px",
            lineHeight: "1.6",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}>
            {line.text}
          </div>
        ))}

        {/* Input Line */}
        <div style={{ display: "flex", color: "#4CAF50", fontSize: "14px" }}>
          <span>{username}@{hostname}:{cwd}$ </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              color: "#d4d4d4",
              fontSize: "14px",
              fontFamily: "inherit",
              caretColor: "#4CAF50",
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default LinuxTerminal
```

> **Checkpoint**: Type `help` and see all available commands? Type `ls` and see file listing? Move on!

---

## Lesson 4: Essential Linux Commands — Practice Guide

### Navigation Commands

| Command | What It Does | Example |
|---------|-------------|---------|
| `pwd` | Print where you are | `pwd` → `/home/student` |
| `ls` | List files here | `ls` → `readme.txt  projects/` |
| `ls -l` | Detailed file list | Shows permissions, size |
| `cd <dir>` | Go into a folder | `cd projects` |
| `cd ..` | Go up one level | Back to parent folder |
| `cd ~` | Go to home directory | `/home/student` |
| `cd /` | Go to root | Top of the file system |

### Practice Exercise 1: Navigate the File System

```bash
# 1. Check where you are
pwd

# 2. List what's here
ls

# 3. Go into the projects folder
cd projects

# 4. List files
ls

# 5. Read a file
cat hello.py

# 6. Go back home
cd ~

# 7. Check where you are again
pwd
```

---

## Lesson 5: File Operations — Create, Edit, Delete

### File Commands

| Command | What It Does | Example |
|---------|-------------|---------|
| `touch <file>` | Create empty file | `touch notes.txt` |
| `echo "text"` | Print text | `echo Hello World` |
| `echo "text" > file` | Write text to file | `echo "Hello" > hi.txt` |
| `echo "text" >> file` | Append text to file | `echo "More" >> hi.txt` |
| `cat <file>` | Read a file | `cat hi.txt` |
| `cp <src> <dest>` | Copy a file | `cp hi.txt backup.txt` |
| `mv <src> <dest>` | Move or rename | `mv hi.txt hello.txt` |
| `rm <file>` | Delete a file | `rm hello.txt` |
| `mkdir <dir>` | Create a folder | `mkdir newdir` |
| `rmdir <dir>` | Delete empty folder | `rmdir newdir` |

### Practice Exercise 2: File Operations

```bash
# 1. Create a new directory
mkdir myproject

# 2. Go into it
cd myproject

# 3. Create a file with content
echo "My first Linux file" > hello.txt

# 4. Read it
cat hello.txt

# 5. Append more content
echo "This is line 2" >> hello.txt

# 6. Read again
cat hello.txt

# 7. Copy the file
cp hello.txt backup.txt

# 8. List to verify
ls

# 9. Rename the copy
mv backup.txt copy.txt

# 10. Delete the original
rm hello.txt

# 11. Verify
ls
```

---

## Lesson 6: Search and Analysis Commands

| Command | What It Does | Example |
|---------|-------------|---------|
| `find <name>` | Search for files | `find .py` → finds all Python files |
| `wc <file>` | Count lines, words, chars | `wc readme.txt` |
| `head <file>` | Show first 5 lines | `head readme.txt` |
| `tail <file>` | Show last 5 lines | `tail readme.txt` |
| `history` | Show command history | All previous commands |

### Practice Exercise 3: Search & Analyze

```bash
# 1. Find all text files
find .txt

# 2. Count words in readme
wc readme.txt

# 3. Show first lines
head readme.txt

# 4. Create a multi-line file
echo "Line 1" > multiline.txt
echo "Line 2" >> multiline.txt
echo "Line 3" >> multiline.txt
echo "Line 4" >> multiline.txt
echo "Line 5" >> multiline.txt
echo "Line 6" >> multiline.txt
echo "Line 7" >> multiline.txt

# 5. Head shows first lines
head multiline.txt

# 6. Tail shows last lines
tail multiline.txt

# 7. Check your command history
history
```

---

## Lesson 7: Common Mistakes When Learning Linux

### Mistake 1: Spaces in file names

```bash
touch my file.txt      ← Creates TWO files: "my" and "file.txt"
touch "my file.txt"    ← Creates ONE file: "my file.txt"
```

### Mistake 2: Forgetting the path

```bash
cd projcts             ← Typo! Directory doesn't exist
cd projects            ← Correct spelling
```

### Mistake 3: Using rm on directories

```bash
rm mydir               ← Error: Is a directory
rm -r mydir            ← Correct: recursive delete
rmdir mydir            ← Only works if directory is EMPTY
```

### Mistake 4: Overwriting files with >

```bash
echo "New content" > important.txt   ← OVERWRITES everything!
echo "New content" >> important.txt  ← APPENDS safely
```

### Mistake 5: Not checking where you are

```bash
# Always check your location before operating on files
pwd
ls
# Then do your operations
```

---

## Course Summary

### What You Learned

| Lesson | Topic | Key Takeaway |
|--------|-------|-------------|
| 1 | Why terminals matter | 90%+ of servers run Linux; essential dev skill |
| 2 | Virtual file system | Simulate a filesystem as nested JS objects |
| 3 | Terminal component | Input handling, command history, tab completion |
| 4 | Navigation commands | `pwd`, `ls`, `cd` — move around the filesystem |
| 5 | File operations | `touch`, `echo >`, `cat`, `cp`, `mv`, `rm`, `mkdir` |
| 6 | Search & analysis | `find`, `wc`, `head`, `tail`, `history` |
| 7 | Common mistakes | Spaces, typos, `>` vs `>>`, `rm` vs `rmdir` |

### What to Build Next

- [ ] Add `grep` command to search inside files
- [ ] Add pipe support: `cat file.txt | wc`
- [ ] Add `chmod` and permission simulation
- [ ] Add `man <cmd>` for manual pages
- [ ] Add shell scripting: `#!/bin/bash` scripts
- [ ] Add environment variables: `export`, `$HOME`, `$PATH`
- [ ] Add guided tutorials: step-by-step challenges
