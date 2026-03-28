# Self-Learning Course: Build a Markdown Notes Pad in the Browser

> **Course Goal**: By the end of this course, you will build a live Markdown editor with split-pane preview — perfect for structured class notes, documentation, and checklists — using Monaco Editor and React.
>
> **Prerequisites**: Basic React knowledge. No Markdown experience required.
>
> **Time**: ~35 minutes, 6 lessons

---

## Lesson 1: What Is Markdown and Why Use It?

Markdown is a **lightweight markup language** — you write plain text with simple symbols, and it renders as formatted content. It's used by GitHub, Notion, Discord, Reddit, Obsidian, and thousands of other tools.

### Markdown vs HTML — Same Result, Less Effort

```
Markdown:                          HTML:
# Hello                           <h1>Hello</h1>
**bold text**                      <strong>bold text</strong>
- item 1                           <ul><li>item 1</li>
- item 2                           <li>item 2</li></ul>
[link](url)                        <a href="url">link</a>
```

Markdown is **10x faster to write** than HTML. That's why developers love it.

### Where Markdown is used:

```
┌────────────────────────────────────────────────┐
│                 MARKDOWN IS EVERYWHERE          │
├────────────────────────────────────────────────┤
│  README.md         │  Every GitHub project      │
│  Documentation     │  API docs, wikis           │
│  Blog posts        │  Dev.to, Hashnode          │
│  Chat/Forums       │  Discord, Reddit, Slack    │
│  Note-taking       │  Obsidian, Notion          │
│  Presentations     │  Marp, Reveal.js           │
│  This course!      │  Written in Markdown       │
└────────────────────────────────────────────────┘
```

### The Complete Markdown Syntax

| What You Write | What You Get | Use Case |
|----------------|-------------|----------|
| `# Heading 1` | Big heading | Main title |
| `## Heading 2` | Medium heading | Section title |
| `### Heading 3` | Small heading | Subsection |
| `**bold**` | **bold** | Emphasis |
| `*italic*` | *italic* | Slight emphasis |
| `~~strikethrough~~` | ~~strikethrough~~ | Deleted text |
| `[text](url)` | Hyperlink | Links |
| `![alt](url)` | Image | Images |
| `` `code` `` | Inline code | Code mentions |
| ```` ``` ```` | Code block | Multi-line code |
| `- item` | Bullet list | Unordered lists |
| `1. item` | Numbered list | Ordered lists |
| `- [ ] task` | Checkbox | Todo lists |
| `> quote` | Blockquote | Citations |
| `---` | Horizontal rule | Section dividers |
| `| col | col |` | Table | Data tables |

### Quick Check

> **Question**: How do you make text **bold AND italic** in Markdown?
>
> **Answer**: `***bold and italic***` — three asterisks. Or `**_bold and italic_**`.

---

## Lesson 2: Build the Markdown Notes Pad

Our tool needs two panels: a Monaco editor for writing Markdown and a live HTML preview.

### Step 1: Install a Markdown parser

```bash
cd Client
npm install marked
```

`marked` is a fast Markdown-to-HTML converter. It takes Markdown text and returns HTML.

### Step 2: Create `src/components/MarkdownNotesPad.jsx`:

```jsx
import React, { useState, useMemo } from "react"
import Editor from "@monaco-editor/react"
import { marked } from "marked"

function MarkdownNotesPad() {
  const [markdown, setMarkdown] = useState(`# 📝 My Study Notes

## Chapter 1: Introduction

This is a **Markdown** notes pad. Write notes on the left, see them rendered on the right!

### Key Concepts
- Markdown is a *lightweight* markup language
- It converts plain text to **formatted HTML**
- Used everywhere: GitHub, Notion, Discord

### Code Example
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`
}
console.log(greet("World"))
\`\`\`

### Todo List
- [x] Learn Markdown basics
- [x] Build the editor
- [ ] Add more features
- [ ] Share with friends

### Quick Reference Table

| Symbol | Result | Example |
|--------|--------|---------|
| # | Heading | # Title |
| ** | Bold | **bold** |
| * | Italic | *italic* |
| - | List | - item |

> 💡 **Tip**: You can write notes much faster with Markdown than with a word processor!

---

## Chapter 2: Advanced Topics

1. First ordered item
2. Second ordered item
3. Third ordered item

### Links and Images
- [Visit Google](https://google.com)
- ![Placeholder Image](https://via.placeholder.com/150)

### Blockquote
> "The best way to learn is by doing."
> — Every developer ever
`)

  // Convert Markdown to HTML (memoized for performance)
  const htmlContent = useMemo(() => {
    return marked(markdown, { breaks: true })
  }, [markdown])

  const handleExport = () => {
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "notes.md"
    a.click()
    URL.revokeObjectURL(url)
  }

  const wordCount = markdown.split(/\s+/).filter(Boolean).length
  const charCount = markdown.length
  const lineCount = markdown.split("\n").length

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      backgroundColor: "#1e1e1e",
      color: "#d4d4d4",
    }}>
      {/* Header */}
      <div style={{
        padding: "10px 20px",
        backgroundColor: "#00b894",
        color: "white",
        fontWeight: "bold",
        fontSize: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span>Markdown Notes Pad</span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", opacity: 0.8 }}>
            {wordCount} words | {charCount} chars | {lineCount} lines
          </span>
          <button
            onClick={handleExport}
            style={{
              padding: "6px 14px",
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.4)",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            📥 Export .md
          </button>
        </div>
      </div>

      {/* Split Panels */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Editor */}
        <div style={{ flex: 1, borderRight: "2px solid #333" }}>
          <div style={{
            padding: "8px 16px",
            backgroundColor: "#2d2d2d",
            fontSize: "13px",
            fontWeight: "bold",
            color: "#888",
          }}>
            EDITOR — Write Markdown
          </div>
          <Editor
            height="100%"
            defaultLanguage="markdown"
            value={markdown}
            onChange={(value) => setMarkdown(value ?? "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 15,
              wordWrap: "on",
              automaticLayout: true,
              lineNumbers: "on",
              tabSize: 2,
              padding: { top: 10 },
            }}
          />
        </div>

        {/* Preview */}
        <div style={{ flex: 1, overflow: "auto" }}>
          <div style={{
            padding: "8px 16px",
            backgroundColor: "#2d2d2d",
            fontSize: "13px",
            fontWeight: "bold",
            color: "#888",
          }}>
            PREVIEW — Rendered Output
          </div>
          <div
            className="markdown-preview"
            style={{
              padding: "20px 30px",
              backgroundColor: "#fff",
              color: "#333",
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: "15px",
              lineHeight: "1.8",
              minHeight: "100%",
            }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    </div>
  )
}

export default MarkdownNotesPad
```

### What we built:

```
┌─────────────────────────────────────────────────────┐
│ Markdown Notes Pad              150 words | Export   │
├──────────────────────┬──────────────────────────────┤
│                      │                              │
│   EDITOR             │   PREVIEW                    │
│   # My Notes         │   My Notes (big heading)     │
│                      │                              │
│   ## Section 1       │   Section 1 (medium)         │
│   **bold** text      │   bold text (rendered)       │
│   - item 1           │   • item 1                   │
│   - item 2           │   • item 2                   │
│                      │                              │
└──────────────────────┴──────────────────────────────┘
```

### Try It Yourself

1. Install `marked`: `npm install marked`
2. Add the component to your app
3. Type `# Hello` — see it rendered as a big heading on the right?
4. Try **bold**, *italic*, and `code`

> **Checkpoint**: Live preview works? Export button downloads a .md file? Move on!

---

## Lesson 3: Add Preview Styling

The preview needs CSS to look good. Add this to your `App.css` or a separate styles:

```css
/* Markdown Preview Styles */
.markdown-preview h1 {
  font-size: 2em;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.3em;
  margin-top: 1em;
}

.markdown-preview h2 {
  font-size: 1.5em;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3em;
  margin-top: 1.2em;
}

.markdown-preview h3 {
  font-size: 1.25em;
  margin-top: 1em;
}

.markdown-preview code {
  background: #f4f4f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Consolas', monospace;
  font-size: 0.9em;
}

.markdown-preview pre {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
}

.markdown-preview pre code {
  background: none;
  padding: 0;
  color: inherit;
}

.markdown-preview blockquote {
  border-left: 4px solid #4CAF50;
  margin: 1em 0;
  padding: 0.5em 1em;
  background: #f8f8f8;
  color: #555;
}

.markdown-preview table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-preview th,
.markdown-preview td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.markdown-preview th {
  background: #f5f5f5;
  font-weight: bold;
}

.markdown-preview tr:nth-child(even) {
  background: #fafafa;
}

.markdown-preview img {
  max-width: 100%;
  border-radius: 8px;
}

.markdown-preview ul {
  padding-left: 2em;
}

.markdown-preview li {
  margin: 0.3em 0;
}

.markdown-preview hr {
  border: none;
  border-top: 2px solid #eee;
  margin: 2em 0;
}

/* Checkbox styling for task lists */
.markdown-preview input[type="checkbox"] {
  margin-right: 8px;
}
```

---

## Lesson 4: Markdown Mastery — All Syntax Patterns

### Headings

```markdown
# Heading 1 (use for main title)
## Heading 2 (use for chapters/sections)
### Heading 3 (use for subtopics)
#### Heading 4 (rarely needed)
```

### Text Formatting

```markdown
**bold text** or __bold text__
*italic text* or _italic text_
***bold and italic***
~~strikethrough~~
`inline code`
```

### Lists

```markdown
Unordered:
- Item 1
- Item 2
  - Nested item (indent with 2 spaces)
  - Another nested

Ordered:
1. First step
2. Second step
3. Third step

Task List:
- [x] Completed task
- [ ] Incomplete task
- [ ] Another todo
```

### Links and Images

```markdown
[Link text](https://example.com)
[Link with title](https://example.com "Hover text")

![Image alt text](https://via.placeholder.com/300x200)
```

### Code Blocks

````markdown
Inline: `const x = 5`

Block with syntax highlighting:
```javascript
function hello() {
  console.log("Hello!")
}
```

```python
def hello():
    print("Hello!")
```
````

### Tables

```markdown
| Name    | Grade | Status  |
|---------|-------|---------|
| Alice   | 92    | Pass    |
| Bob     | 78    | Pass    |
| Charlie | 45    | Fail    |
```

### Blockquotes

```markdown
> This is a blockquote
> It can span multiple lines

> You can also nest them:
>> Like this nested quote
```

### Horizontal Rule

```markdown
---
or
***
or
___
```

### Try It Yourself

Type each of these patterns in your editor. Watch the preview render them in real-time!

---

## Lesson 5: Add Toolbar Buttons

Let's add a formatting toolbar so users can insert Markdown syntax with clicks.

```jsx
const toolbarButtons = [
  { label: "H1", insert: "# ", tooltip: "Heading 1" },
  { label: "H2", insert: "## ", tooltip: "Heading 2" },
  { label: "H3", insert: "### ", tooltip: "Heading 3" },
  { label: "B", insert: "****", cursor: -2, tooltip: "Bold", style: { fontWeight: "bold" } },
  { label: "I", insert: "**", cursor: -1, tooltip: "Italic", style: { fontStyle: "italic" } },
  { label: "~", insert: "~~~~", cursor: -2, tooltip: "Strikethrough" },
  { label: "<>", insert: "``", cursor: -1, tooltip: "Inline Code" },
  { label: "🔗", insert: "[text](url)", tooltip: "Link" },
  { label: "📷", insert: "![alt](url)", tooltip: "Image" },
  { label: "•", insert: "- ", tooltip: "Bullet List" },
  { label: "1.", insert: "1. ", tooltip: "Numbered List" },
  { label: "☑", insert: "- [ ] ", tooltip: "Checkbox" },
  { label: ">", insert: "> ", tooltip: "Blockquote" },
  { label: "—", insert: "\n---\n", tooltip: "Horizontal Rule" },
  { label: "📋", insert: "| Col 1 | Col 2 |\n|--------|--------|\n| Data   | Data   |", tooltip: "Table" },
]

// Add toolbar between header and editor panels:
<div style={{
  display: "flex",
  gap: "4px",
  padding: "6px 16px",
  backgroundColor: "#2a2a2a",
  borderBottom: "1px solid #444",
  flexWrap: "wrap",
}}>
  {toolbarButtons.map((btn) => (
    <button
      key={btn.label}
      title={btn.tooltip}
      onClick={() => {
        setMarkdown((prev) => prev + btn.insert)
      }}
      style={{
        padding: "4px 10px",
        backgroundColor: "#3d3d3d",
        color: "#d4d4d4",
        border: "1px solid #555",
        borderRadius: "3px",
        cursor: "pointer",
        fontSize: "13px",
        ...btn.style,
      }}
    >
      {btn.label}
    </button>
  ))}
</div>
```

---

## Lesson 6: Note-Taking Templates

### Template 1: Class Notes

```markdown
# 📚 Course: [Subject Name]
## Date: [YYYY-MM-DD]
## Topic: [Today's Topic]

---

### Key Concepts
1. **Concept 1**: Explanation here
2. **Concept 2**: Explanation here
3. **Concept 3**: Explanation here

### Important Formulas
- Formula 1: `E = mc²`
- Formula 2: `a² + b² = c²`

### Code Examples
\`\`\`python
# Example from class
print("Hello")
\`\`\`

### Questions to Review
- [ ] What is...?
- [ ] How does...?
- [ ] Why is...?

### Summary
> Write a 2-3 sentence summary of today's lecture.
```

### Template 2: Project Documentation

```markdown
# Project Name

## Overview
Brief description of the project.

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL

## Setup
\`\`\`bash
git clone <repo-url>
npm install
npm run dev
\`\`\`

## API Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/users | List all users |
| POST | /api/users | Create a user |

## Todo
- [x] Setup project
- [ ] Build frontend
- [ ] Connect database
```

### Template 3: Weekly Review

```markdown
# 📅 Week of [Date]

## ✅ Completed
- Task 1
- Task 2

## 🔄 In Progress
- Task 3 (70% done)
- Task 4 (just started)

## 📋 Planned for Next Week
- [ ] Task 5
- [ ] Task 6

## 💡 Lessons Learned
> What went well? What could improve?

## 📊 Stats
| Metric | This Week | Last Week |
|--------|-----------|-----------|
| Tasks Done | 5 | 3 |
| Hours Studied | 12 | 8 |
```

---

## Course Summary

### What You Learned

| Lesson | Topic | Key Takeaway |
|--------|-------|-------------|
| 1 | What is Markdown? | Plain text → formatted content, used everywhere |
| 2 | Building the notes pad | Monaco editor + `marked` library + live preview |
| 3 | Preview styling | CSS for headings, code blocks, tables, blockquotes |
| 4 | All Markdown syntax | Headings, formatting, lists, tables, code, links |
| 5 | Toolbar buttons | Quick-insert formatting with button clicks |
| 6 | Templates | Class notes, project docs, weekly review |

### What to Build Next

- [ ] Add local storage to save notes between sessions
- [ ] Support multiple notes with a sidebar file list
- [ ] Add dark/light theme toggle for the preview
- [ ] Export to HTML or PDF
- [ ] Add a word search/replace feature
- [ ] Support Mermaid diagrams in Markdown
