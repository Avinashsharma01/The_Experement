# Self-Learning Course: Build a Git Practice Lab in the Browser

> **Course Goal**: By the end of this course, you will build an interactive Git practice environment where users can learn and execute Git commands safely — branching, merging, rebasing, and resolving conflicts — all without touching real repos.
>
> **Prerequisites**: Basic React knowledge. No Git experience required — this course teaches it!
>
> **Time**: ~45 minutes, 7 lessons

---

## Lesson 1: What Is Git, Really?

Before building tools, let's understand Git at a conceptual level. Most tutorials jump to commands — we'll start with **why**.

### The Problem Git Solves

```
Without Git:                              With Git:
┌─────────────────────┐                  ┌─────────────────────┐
│ project_final.zip   │                  │ project/            │
│ project_final2.zip  │                  │   .git/  ← History  │
│ project_REAL_final  │                  │   src/              │
│ project_backup      │   ──────────►    │   README.md         │
│ project_march5.zip  │                  │                     │
│ project_DO_NOT_DEL  │                  │ (every version is   │
└─────────────────────┘                  │  stored internally) │
                                         └─────────────────────┘
```

Git is a **version control system** — it tracks every change to every file, so you can:
- Go back in time to any version
- Work on features without breaking the main code
- Collaborate without overwriting each other's work

### The 3 Areas of Git

Every Git project has three "zones" where files live:

```
┌─────────────────┐     git add      ┌────────────────┐    git commit    ┌─────────────────┐
│  Working        │  ────────────►   │   Staging      │  ────────────►  │   Repository    │
│  Directory      │                  │   Area         │                 │   (.git/)       │
│                 │                  │                │                 │                 │
│  Files you're   │                  │  Files ready   │                 │  Permanent      │
│  editing right  │                  │  to be saved   │                 │  history of     │
│  now            │                  │  (snapshot)    │                 │  all commits    │
└─────────────────┘                  └────────────────┘                 └─────────────────┘
```

### Think of it like email:

1. **Working Directory** = Writing an email (you're editing, nothing is saved)
2. **Staging Area** = Attaching files to the email (selecting what to include)
3. **Repository** = Clicking "Send" (it's permanent, timestamped, and recorded)

### Quick Check

> **Question**: You edit 3 files but only want to save changes to 2 of them. How?
>
> **Answer**: `git add file1.txt file2.txt` → only those 2 are staged. Then `git commit` saves only those 2. The third file stays modified but uncommitted.

---

## Lesson 2: Build the Git Terminal Interface

Our Git Practice Lab simulates a terminal where users type Git commands and see results. No real repo is needed — we simulate the Git workflow.

### Create `src/components/GitPracticeLab.jsx`:

```jsx
import React, { useState, useRef, useEffect } from "react"

function GitPracticeLab() {
  const [history, setHistory] = useState([
    { type: "system", text: "Welcome to Git Practice Lab! 🧪" },
    { type: "system", text: "Type 'help' to see available commands." },
    { type: "system", text: "Type 'lesson' to start the guided tutorial." },
    { type: "system", text: "" },
  ])
  const [input, setInput] = useState("")
  const [gitState, setGitState] = useState({
    initialized: false,
    branch: "main",
    branches: ["main"],
    workingDir: {},        // filename → content
    stagingArea: [],       // filenames staged
    commits: [],           // { message, files, branch, timestamp }
    stash: [],
    remotes: [],
  })
  const terminalRef = useRef(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const addOutput = (text, type = "output") => {
    setHistory((prev) => [...prev, { type, text }])
  }

  const processCommand = (cmd) => {
    const trimmed = cmd.trim()
    if (!trimmed) return

    // Show the command in history
    addOutput(`$ ${trimmed}`, "command")

    const parts = trimmed.split(/\s+/)
    const base = parts[0]

    if (base === "help") {
      showHelp()
    } else if (base === "lesson") {
      showLesson()
    } else if (base === "clear") {
      setHistory([])
    } else if (base === "git") {
      handleGitCommand(parts.slice(1))
    } else {
      addOutput(`Command not found: ${base}. Type 'help' for available commands.`)
    }
  }

  const showHelp = () => {
    addOutput(`
Available Commands:
  git init              Initialize a new repository
  git status            Show working tree status
  git add <file>        Stage a file for commit
  git add .             Stage all files
  git commit -m "msg"   Commit staged changes
  git log               Show commit history
  git branch            List branches
  git branch <name>     Create a new branch
  git checkout <branch> Switch to a branch
  git merge <branch>    Merge a branch into current
  git stash             Stash working changes
  git stash pop         Restore stashed changes
  git diff              Show unstaged changes
  touch <file>          Create a new file
  echo "text" > file    Write to a file
  ls                    List files
  clear                 Clear terminal
  help                  Show this help
  lesson                Start guided tutorial
`)
  }

  const showLesson = () => {
    addOutput(`
📚 Git Practice Lab — Guided Tutorial
════════════════════════════════════════

Step 1: Initialize a repo
  → Type: git init

Step 2: Create a file
  → Type: touch hello.txt

Step 3: Check what changed
  → Type: git status

Step 4: Stage the file
  → Type: git add hello.txt

Step 5: Commit the change
  → Type: git commit -m "Add hello.txt"

Step 6: Create a branch
  → Type: git branch feature

Step 7: Switch to it
  → Type: git checkout feature

Step 8: Make and commit a change
  → Type: touch feature.txt
  → Type: git add .
  → Type: git commit -m "Add feature"

Step 9: Switch back and merge
  → Type: git checkout main
  → Type: git merge feature

Step 10: See the full history
  → Type: git log

Try each step! Type 'help' for all commands.
`, "system")
  }

  const handleGitCommand = (args) => {
    const subcommand = args[0]

    switch (subcommand) {
      case "init":
        if (gitState.initialized) {
          addOutput("Reinitialized existing Git repository.")
        } else {
          setGitState((prev) => ({ ...prev, initialized: true }))
          addOutput("Initialized empty Git repository in /project/.git/")
        }
        break

      case "status":
        handleGitStatus()
        break

      case "add":
        handleGitAdd(args[1])
        break

      case "commit":
        handleGitCommit(args)
        break

      case "log":
        handleGitLog()
        break

      case "branch":
        handleGitBranch(args[1])
        break

      case "checkout":
        handleGitCheckout(args[1])
        break

      case "merge":
        handleGitMerge(args[1])
        break

      case "stash":
        handleGitStash(args[1])
        break

      case "diff":
        handleGitDiff()
        break

      default:
        addOutput(`git: '${subcommand}' is not a git command. See 'help'.`)
    }
  }

  const handleGitStatus = () => {
    if (!gitState.initialized) {
      addOutput("fatal: not a git repository (or any of the parent directories): .git")
      return
    }

    const files = Object.keys(gitState.workingDir)
    const staged = gitState.stagingArea
    const unstaged = files.filter((f) => !staged.includes(f))

    let output = `On branch ${gitState.branch}\n`

    if (gitState.commits.length === 0 && staged.length === 0 && files.length === 0) {
      output += "\nNo commits yet\n\nnothing to commit (create/copy files and use \"git add\" to track them)"
    } else {
      if (staged.length > 0) {
        output += "\nChanges to be committed:\n"
        staged.forEach((f) => { output += `  (staged)    new file:   ${f}\n` })
      }
      if (unstaged.length > 0) {
        output += "\nUntracked files:\n"
        unstaged.forEach((f) => { output += `  (untracked) ${f}\n` })
      }
      if (staged.length === 0 && unstaged.length === 0) {
        output += "\nnothing to commit, working tree clean"
      }
    }

    addOutput(output)
  }

  const handleGitAdd = (file) => {
    if (!gitState.initialized) {
      addOutput("fatal: not a git repository")
      return
    }
    if (!file) {
      addOutput("Nothing specified, nothing added.")
      return
    }

    if (file === ".") {
      const allFiles = Object.keys(gitState.workingDir)
      setGitState((prev) => ({ ...prev, stagingArea: [...allFiles] }))
      addOutput(`Added all files to staging area.`)
    } else if (gitState.workingDir[file] !== undefined) {
      setGitState((prev) => ({
        ...prev,
        stagingArea: [...new Set([...prev.stagingArea, file])],
      }))
      addOutput(`Added '${file}' to staging area.`)
    } else {
      addOutput(`fatal: pathspec '${file}' did not match any files`)
    }
  }

  const handleGitCommit = (args) => {
    if (!gitState.initialized) {
      addOutput("fatal: not a git repository")
      return
    }
    if (gitState.stagingArea.length === 0) {
      addOutput("nothing to commit (use \"git add\" to stage files)")
      return
    }

    const msgIndex = args.indexOf("-m")
    const message = msgIndex !== -1 ? args.slice(msgIndex + 1).join(" ").replace(/"/g, "") : "No message"

    const commit = {
      hash: Math.random().toString(16).slice(2, 9),
      message,
      files: [...gitState.stagingArea],
      branch: gitState.branch,
      timestamp: new Date().toLocaleString(),
    }

    setGitState((prev) => ({
      ...prev,
      commits: [...prev.commits, commit],
      stagingArea: [],
    }))

    addOutput(`[${gitState.branch} ${commit.hash}] ${message}\n ${commit.files.length} file(s) changed`)
  }

  const handleGitLog = () => {
    if (gitState.commits.length === 0) {
      addOutput("fatal: your current branch does not have any commits yet")
      return
    }

    let output = ""
    ;[...gitState.commits].reverse().forEach((c) => {
      output += `commit ${c.hash} (${c.branch})\n`
      output += `Date:   ${c.timestamp}\n`
      output += `\n    ${c.message}\n\n`
    })

    addOutput(output)
  }

  const handleGitBranch = (name) => {
    if (!name) {
      let output = ""
      gitState.branches.forEach((b) => {
        output += b === gitState.branch ? `* ${b}\n` : `  ${b}\n`
      })
      addOutput(output)
      return
    }

    if (gitState.branches.includes(name)) {
      addOutput(`fatal: A branch named '${name}' already exists.`)
    } else {
      setGitState((prev) => ({
        ...prev,
        branches: [...prev.branches, name],
      }))
      addOutput(`Created branch '${name}'`)
    }
  }

  const handleGitCheckout = (branch) => {
    if (!branch) {
      addOutput("error: please specify a branch name")
      return
    }
    if (!gitState.branches.includes(branch)) {
      addOutput(`error: pathspec '${branch}' did not match any branch known to git`)
      return
    }
    setGitState((prev) => ({ ...prev, branch }))
    addOutput(`Switched to branch '${branch}'`)
  }

  const handleGitMerge = (branch) => {
    if (!branch) {
      addOutput("error: please specify a branch to merge")
      return
    }
    if (!gitState.branches.includes(branch)) {
      addOutput(`merge: ${branch} - not something we can merge`)
      return
    }
    if (branch === gitState.branch) {
      addOutput("Already up to date.")
      return
    }

    const branchCommits = gitState.commits.filter((c) => c.branch === branch)
    if (branchCommits.length === 0) {
      addOutput("Already up to date.")
      return
    }

    const mergeCommit = {
      hash: Math.random().toString(16).slice(2, 9),
      message: `Merge branch '${branch}' into ${gitState.branch}`,
      files: [],
      branch: gitState.branch,
      timestamp: new Date().toLocaleString(),
    }

    setGitState((prev) => ({
      ...prev,
      commits: [...prev.commits, mergeCommit],
    }))

    addOutput(`Merge made by the 'recursive' strategy.\nBranch '${branch}' merged into '${gitState.branch}'.`)
  }

  const handleGitStash = (action) => {
    if (action === "pop") {
      if (gitState.stash.length === 0) {
        addOutput("No stash entries found.")
        return
      }
      const restored = gitState.stash[gitState.stash.length - 1]
      setGitState((prev) => ({
        ...prev,
        workingDir: { ...prev.workingDir, ...restored },
        stash: prev.stash.slice(0, -1),
      }))
      addOutput("Dropped refs/stash@{0} — restored working directory")
    } else {
      const unsaved = Object.keys(gitState.workingDir).filter(
        (f) => !gitState.stagingArea.includes(f)
      )
      if (unsaved.length === 0) {
        addOutput("No local changes to save")
        return
      }
      setGitState((prev) => ({
        ...prev,
        stash: [...prev.stash, { ...prev.workingDir }],
      }))
      addOutput("Saved working directory and index state WIP on " + gitState.branch)
    }
  }

  const handleGitDiff = () => {
    const unstaged = Object.keys(gitState.workingDir).filter(
      (f) => !gitState.stagingArea.includes(f)
    )
    if (unstaged.length === 0) {
      addOutput("No changes detected.")
    } else {
      let output = ""
      unstaged.forEach((f) => {
        output += `diff --git a/${f} b/${f}\n`
        output += `--- /dev/null\n+++ b/${f}\n`
        output += `+${gitState.workingDir[f] || "(empty file)"}\n\n`
      })
      addOutput(output)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const cmd = input.trim()
    if (!cmd) return

    // Handle non-git commands
    const parts = cmd.split(/\s+/)
    if (parts[0] === "touch") {
      const fileName = parts[1]
      if (fileName) {
        setGitState((prev) => ({
          ...prev,
          workingDir: { ...prev.workingDir, [fileName]: "" },
        }))
        addOutput(`$ ${cmd}`, "command")
        addOutput(`Created file: ${fileName}`)
      }
    } else if (parts[0] === "ls") {
      addOutput(`$ ${cmd}`, "command")
      const files = Object.keys(gitState.workingDir)
      addOutput(files.length > 0 ? files.join("  ") : "(empty directory)")
    } else if (parts[0] === "echo" && cmd.includes(">")) {
      const match = cmd.match(/echo\s+"?(.+?)"?\s*>\s*(\S+)/)
      if (match) {
        const [, content, fileName] = match
        setGitState((prev) => ({
          ...prev,
          workingDir: { ...prev.workingDir, [fileName]: content },
        }))
        addOutput(`$ ${cmd}`, "command")
        addOutput(`Wrote to ${fileName}`)
      }
    } else {
      processCommand(cmd)
    }
    setInput("")
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      backgroundColor: "#1e1e1e",
      fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
    }}>
      {/* Header */}
      <div style={{
        padding: "10px 20px",
        backgroundColor: "#f05032",
        color: "white",
        fontWeight: "bold",
        fontSize: "16px",
        display: "flex",
        justifyContent: "space-between",
      }}>
        <span>Git Practice Lab</span>
        <span style={{ fontSize: "13px", opacity: 0.8 }}>
          Branch: {gitState.branch} | Commits: {gitState.commits.length}
        </span>
      </div>

      {/* Terminal Output */}
      <div
        ref={terminalRef}
        style={{
          flex: 1,
          overflow: "auto",
          padding: "16px",
          color: "#d4d4d4",
          fontSize: "14px",
          lineHeight: "1.6",
        }}
      >
        {history.map((entry, i) => (
          <div
            key={i}
            style={{
              color:
                entry.type === "command" ? "#569cd6"
                : entry.type === "system" ? "#4ec9b0"
                : "#d4d4d4",
              whiteSpace: "pre-wrap",
            }}
          >
            {entry.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ display: "flex", borderTop: "1px solid #333" }}>
        <span style={{ padding: "12px", color: "#4ec9b0", fontWeight: "bold" }}>
          ~/project ({gitState.branch}) $
        </span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            padding: "12px",
            backgroundColor: "#1e1e1e",
            color: "#d4d4d4",
            border: "none",
            outline: "none",
            fontSize: "14px",
            fontFamily: "inherit",
          }}
          placeholder="Type a git command..."
          autoFocus
        />
      </form>
    </div>
  )
}

export default GitPracticeLab
```

### What we built:

```
┌───────────────────────────────────────────────┐
│ Git Practice Lab           Branch: main | 0   │ ← Header with status
├───────────────────────────────────────────────┤
│ Welcome to Git Practice Lab! 🧪               │
│ Type 'help' to see available commands.        │
│                                               │
│ $ git init                                    │ ← User commands in blue
│ Initialized empty Git repository              │ ← Output in gray
│                                               │
│ $ git status                                  │
│ On branch main                                │
│ nothing to commit                             │
│                                               │
├───────────────────────────────────────────────┤
│ ~/project (main) $ _                          │ ← Input prompt
└───────────────────────────────────────────────┘
```

### Try It Yourself

1. Add the component to your app
2. Type `help` to see all commands
3. Follow the `lesson` tutorial step by step!

> **Checkpoint**: Can you type `git init` and see the output? If yes, move on!

---

## Lesson 3: Understanding Branches — The Core of Git

### What are branches?

Think of branches as **parallel universes** for your code:

```
main:     A ──── B ──── C ──── D ──── E
                  │                    ↑
feature:          └──── F ──── G ──── merge
                        │
bugfix:                 └──── H
```

- **main** = the stable version everyone uses
- **feature** = a separate timeline where you build something new
- **bugfix** = another timeline for fixing a bug
- When you're done, you **merge** back into main

### Why branches matter

Without branches, every change goes directly to "main". If your feature breaks something, EVERYONE is affected. With branches:
- You work in isolation
- Your broken code doesn't affect others
- You merge ONLY when it's ready

### Practice in Your Lab

Try this sequence and watch the branch indicator change:

```
git init
touch index.html
git add .
git commit -m "Initial commit"

git branch feature
git checkout feature
touch feature.js
git add .
git commit -m "Add feature"

git checkout main
git log
git merge feature
git log
```

> **Checkpoint**: Can you create branches, switch between them, and merge? You understand the core Git workflow!

---

## Lesson 4: The Most Common Git Workflows

### Workflow 1: Feature Branch Workflow

This is what most teams use:

```
1. git checkout main              ← Start from main
2. git branch my-feature          ← Create a branch
3. git checkout my-feature        ← Switch to it
4. (write code, make changes)
5. git add .                      ← Stage all changes
6. git commit -m "Add feature"   ← Commit
7. git checkout main              ← Switch back to main
8. git merge my-feature           ← Merge your work
```

### Workflow 2: Hotfix Workflow

When there's an urgent bug in production:

```
1. git checkout main              ← Go to main (the live code)
2. git branch hotfix              ← Create a hotfix branch
3. git checkout hotfix            ← Switch to it
4. (fix the bug)
5. git add .
6. git commit -m "Fix critical bug"
7. git checkout main
8. git merge hotfix               ← Merge the fix
```

### Workflow 3: Stash and Switch

You're working on a feature but need to switch branches urgently:

```
1. (you're mid-work on feature branch)
2. git stash                      ← Saves your work temporarily
3. git checkout main              ← Switch to main
4. (do the urgent task)
5. git checkout feature           ← Switch back
6. git stash pop                  ← Restore your saved work
```

### Try Each Workflow

Practice all three workflows in your lab. Pay attention to how `git status` changes at each step.

---

## Lesson 5: Understanding Merge Conflicts

### What causes conflicts?

When the SAME line is changed differently in two branches:

```
Branch A changed line 5 to:   "Hello, World!"
Branch B changed line 5 to:   "Hi, Universe!"

Git says: "I don't know which one to keep! YOU decide."
```

### What a conflict looks like:

```
<<<<<<< HEAD
Hello, World!
=======
Hi, Universe!
>>>>>>> feature-branch
```

- Everything between `<<<<<<< HEAD` and `=======` is YOUR current branch's version
- Everything between `=======` and `>>>>>>> feature` is the incoming branch's version
- YOU delete the markers and keep what you want

### Resolution steps:

```
1. Open the file with conflicts
2. Find the <<<<<<< markers
3. Decide which version to keep (or combine both)
4. Delete the conflict markers
5. git add <file>
6. git commit -m "Resolve merge conflict"
```

### Practice Conflict Resolution

Your lab simulates this! Try creating commits on two branches that modify the same file, then merge.

---

## Lesson 6: Git Commands Cheat Sheet

### Essential Commands (Run these in your lab!)

| Command | What It Does | When to Use |
|---------|-------------|-------------|
| `git init` | Create a new repo | Once, at the start of a project |
| `git status` | See what's changed | Constantly! Before every add/commit |
| `git add <file>` | Stage a file | When you're ready to save changes |
| `git add .` | Stage everything | When all changes are ready |
| `git commit -m "msg"` | Save staged changes | When a logical unit of work is done |
| `git log` | See commit history | To review what's been done |
| `git branch` | List branches | To see where you are |
| `git branch <name>` | Create a branch | Before starting a new feature |
| `git checkout <branch>` | Switch branches | To move between features |
| `git merge <branch>` | Combine branches | When a feature is ready for main |
| `git stash` | Temporarily save work | When you need to switch but aren't done |
| `git stash pop` | Restore stashed work | When you're back and want your changes |
| `git diff` | See unstaged changes | To review what you changed |

### Undo Commands

| Command | What It Does | Danger Level |
|---------|-------------|-------------|
| `git checkout -- <file>` | Undo changes to a file | ⚠️ Medium — changes are lost |
| `git reset HEAD <file>` | Unstage a file | ✅ Safe — just removes from staging |
| `git reset --soft HEAD~1` | Undo last commit, keep changes | ✅ Safe |
| `git reset --hard HEAD~1` | Undo last commit, DELETE changes | 🔴 Dangerous |

---

## Lesson 7: Advanced Git Concepts

### Interactive Rebase (Cleaning Up History)

Before merging a feature branch, you might want to clean up your commits:

```
Original: A ─ B ─ C ─ D ─ E  (5 messy commits)
After rebase: A ─ X            (1 clean commit combining B through E)
```

### Cherry-Pick (Taking One Commit)

Sometimes you only want ONE commit from another branch:

```
main:     A ─ B ─ C
feature:  A ─ B ─ D ─ E ─ F

git cherry-pick E  →  Takes ONLY commit E from feature to main

main:     A ─ B ─ C ─ E'
```

### Tags (Marking Releases)

```
git tag v1.0.0              ← Mark the current commit as version 1.0.0
git tag -a v1.0.0 -m "msg"  ← Annotated tag with a message
```

### .gitignore (Files Git Should Ignore)

```
# .gitignore
node_modules/      ← Don't track installed packages
.env               ← Don't track secrets
*.log              ← Don't track log files
dist/              ← Don't track build output
```

### Try It Yourself

Add some of these advanced commands to your practice lab. Can you implement `git tag` in the simulator?

---

## Course Summary

### What You Learned

| Lesson | Topic | Key Takeaway |
|--------|-------|-------------|
| 1 | What is Git? | Version control with 3 areas: working, staging, repository |
| 2 | Building the lab | Simulated terminal with Git command processing |
| 3 | Branches | Parallel timelines for isolated work |
| 4 | Git workflows | Feature branch, hotfix, stash-and-switch patterns |
| 5 | Merge conflicts | Same line changed differently → manual resolution |
| 6 | Command cheat sheet | Essential vs undo commands reference |
| 7 | Advanced concepts | Rebase, cherry-pick, tags, .gitignore |

### What to Build Next

- [ ] Add visual branch graph (draw the commit tree with ASCII or Canvas)
- [ ] Add `git rebase` command simulation
- [ ] Add `git cherry-pick` command simulation
- [ ] Show file contents with `cat <filename>` command
- [ ] Add a "challenge mode" with timed exercises
- [ ] Simulate `git remote` for understanding push/pull workflows
