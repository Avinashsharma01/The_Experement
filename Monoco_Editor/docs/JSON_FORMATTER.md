# Self-Learning Course: Build a JSON Formatter in the Browser

> **Course Goal**: By the end of this course, you will build an interactive JSON formatter that validates, beautifies, minifies, and analyzes JSON data — essential for API development and debugging.
>
> **Prerequisites**: Basic React knowledge. Basic understanding of JSON.
>
> **Time**: ~35 minutes, 6 lessons

---

## Lesson 1: What Is JSON and Why Does Everyone Use It?

JSON (JavaScript Object Notation) is the **universal language of data exchange** on the web. Every time you use an API, you're sending or receiving JSON.

### JSON is everywhere:

```
┌──────────────┐     JSON      ┌──────────────┐
│   Frontend   │ ◄──────────►  │   Backend    │
│   (React)    │               │   (Node.js)  │
└──────────────┘               └──────────────┘
       │                              │
       │          JSON                │         JSON
       ▼                              ▼
┌──────────────┐               ┌──────────────┐
│   APIs       │               │   Database   │
│   (REST)     │               │   (MongoDB)  │
└──────────────┘               └──────────────┘
```

### JSON Structure — Only 6 Data Types

```json
{
  "string": "Hello",          // Text in double quotes
  "number": 42,               // Integer or decimal
  "boolean": true,            // true or false
  "null": null,               // Empty/no value
  "array": [1, 2, 3],         // Ordered list
  "object": { "key": "val" }  // Key-value pairs
}
```

That's it. No functions, no dates, no comments. JSON is **simple by design**.

### JSON vs JavaScript Objects

```
JavaScript Object:                    JSON:
{                                     {
  name: "Alice",     ← no quotes      "name": "Alice",    ← double quotes required!
  age: 25,                             "age": 25,
  greet() { ... }    ← functions OK    // NO functions allowed
  // comments OK                       // NO comments allowed
}                                     }
```

### Common JSON Mistakes

| Mistake | Example | Why It's Wrong |
|---------|---------|----------------|
| Single quotes | `{'name': 'Alice'}` | JSON requires **double quotes** only |
| Trailing comma | `{"a": 1, "b": 2,}` | Last item can't have a comma |
| Unquoted keys | `{name: "Alice"}` | Keys MUST be in double quotes |
| Comments | `// this is data` | JSON doesn't support comments |
| Functions | `"fn": function(){}` | Only data, no code |

### Quick Check

> **Question**: Is this valid JSON? `{"items": [1, 2, 3,]}`
>
> **Answer**: **No!** The trailing comma after `3` is invalid. Remove it: `{"items": [1, 2, 3]}`

---

## Lesson 2: Build the JSON Formatter Tool

Our tool will have an input editor, action buttons, and a formatted output panel.

### Create `src/components/JsonFormatter.jsx`:

```jsx
import React, { useState } from "react"
import Editor from "@monaco-editor/react"

function JsonFormatter() {
  const [input, setInput] = useState(`{"name":"Alice","age":25,"skills":["JavaScript","React","Node.js"],"address":{"city":"New York","zip":"10001"},"projects":[{"name":"Portfolio","status":"complete"},{"name":"API Server","status":"in-progress"}]}`)
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [stats, setStats] = useState(null)

  const formatJSON = (indent = 2) => {
    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, indent)
      setOutput(formatted)
      setError("")
      analyzeJSON(parsed)
    } catch (err) {
      setError(`❌ Invalid JSON: ${err.message}`)
      setOutput("")
      setStats(null)
    }
  }

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      setError("")
      analyzeJSON(parsed)
    } catch (err) {
      setError(`❌ Invalid JSON: ${err.message}`)
      setOutput("")
      setStats(null)
    }
  }

  const analyzeJSON = (parsed) => {
    const countTypes = (obj) => {
      const counts = { strings: 0, numbers: 0, booleans: 0, nulls: 0, arrays: 0, objects: 0 }

      const traverse = (val) => {
        if (val === null) { counts.nulls++; return }
        if (Array.isArray(val)) {
          counts.arrays++
          val.forEach(traverse)
          return
        }
        switch (typeof val) {
          case "string": counts.strings++; break
          case "number": counts.numbers++; break
          case "boolean": counts.booleans++; break
          case "object":
            counts.objects++
            Object.values(val).forEach(traverse)
            break
        }
      }

      traverse(obj)
      return counts
    }

    const depth = (obj) => {
      if (obj === null || typeof obj !== "object") return 0
      if (Array.isArray(obj)) return 1 + Math.max(0, ...obj.map(depth))
      return 1 + Math.max(0, ...Object.values(obj).map(depth))
    }

    setStats({
      ...countTypes(parsed),
      depth: depth(parsed),
      sizeOriginal: new Blob([input]).size,
      sizeFormatted: new Blob([JSON.stringify(parsed, null, 2)]).size,
      sizeMinified: new Blob([JSON.stringify(parsed)]).size,
    })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      backgroundColor: "#1e1e1e",
      color: "#d4d4d4",
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 20px",
        backgroundColor: "#f7b731",
        color: "#333",
        fontWeight: "bold",
        fontSize: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span>JSON Formatter & Validator</span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => formatJSON(2)} style={btnStyle("#4CAF50")}>
            Beautify (2-space)
          </button>
          <button onClick={() => formatJSON(4)} style={btnStyle("#2196F3")}>
            Beautify (4-space)
          </button>
          <button onClick={minifyJSON} style={btnStyle("#ff6348")}>
            Minify
          </button>
          <button onClick={copyToClipboard} style={btnStyle("#a55eea")}>
            Copy Output
          </button>
        </div>
      </div>

      {/* Error Bar */}
      {error && (
        <div style={{
          padding: "10px 20px",
          backgroundColor: "#5c1a1a",
          color: "#ff6b6b",
          fontSize: "14px",
          fontFamily: "Consolas, monospace",
        }}>
          {error}
        </div>
      )}

      {/* Editor Panels */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Input */}
        <div style={{ flex: 1, borderRight: "2px solid #333" }}>
          <div style={labelStyle}>INPUT — Paste your JSON here</div>
          <Editor
            height="100%"
            defaultLanguage="json"
            value={input}
            onChange={(value) => setInput(value ?? "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              automaticLayout: true,
              bracketPairColorization: { enabled: true },
              tabSize: 2,
              formatOnPaste: true,
            }}
          />
        </div>

        {/* Output */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={labelStyle}>OUTPUT — Formatted result</div>
          <Editor
            height="100%"
            defaultLanguage="json"
            value={output}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              automaticLayout: true,
              readOnly: true,
              tabSize: 2,
            }}
          />
        </div>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div style={{
          padding: "8px 20px",
          backgroundColor: "#2d2d2d",
          display: "flex",
          gap: "24px",
          fontSize: "12px",
          color: "#888",
          borderTop: "1px solid #444",
        }}>
          <span>Depth: <b style={{ color: "#4ec9b0" }}>{stats.depth}</b></span>
          <span>Strings: <b style={{ color: "#ce9178" }}>{stats.strings}</b></span>
          <span>Numbers: <b style={{ color: "#b5cea8" }}>{stats.numbers}</b></span>
          <span>Booleans: <b style={{ color: "#569cd6" }}>{stats.booleans}</b></span>
          <span>Nulls: <b style={{ color: "#808080" }}>{stats.nulls}</b></span>
          <span>Arrays: <b style={{ color: "#ffd700" }}>{stats.arrays}</b></span>
          <span>Objects: <b style={{ color: "#c586c0" }}>{stats.objects}</b></span>
          <span>|</span>
          <span>Original: {stats.sizeOriginal}B</span>
          <span>Formatted: {stats.sizeFormatted}B</span>
          <span>Minified: {stats.sizeMinified}B</span>
        </div>
      )}
    </div>
  )
}

// Helper styles
const btnStyle = (bg) => ({
  padding: "6px 14px",
  backgroundColor: bg,
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "bold",
})

const labelStyle = {
  padding: "8px 16px",
  backgroundColor: "#2d2d2d",
  fontSize: "13px",
  fontWeight: "bold",
  color: "#888",
}

export default JsonFormatter
```

### What we built:

```
┌─────────────────────────────────────────────────────────┐
│ JSON Formatter   [Beautify 2] [Beautify 4] [Minify] [Copy] │
├────────────────────────┬────────────────────────────────┤
│                        │                                │
│   INPUT                │   OUTPUT                       │
│   (paste raw JSON)     │   (formatted/minified result)  │
│                        │                                │
├────────────────────────┴────────────────────────────────┤
│ Depth: 3 | Strings: 7 | Numbers: 2 | Size: 150B → 89B  │ ← Stats bar
└─────────────────────────────────────────────────────────┘
```

### Try It Yourself

1. Add the component to your app
2. Click "Beautify (2-space)" — the minified JSON becomes readable!
3. Click "Minify" — it compresses back
4. Check the stats bar — see the size difference?
5. Try pasting invalid JSON — you'll see the error message

> **Checkpoint**: Beautify and Minify work? Stats appear? Move on!

---

## Lesson 3: Understanding JSON.stringify and JSON.parse

These two functions are the backbone of our formatter.

### JSON.parse() — String to Object

```javascript
const text = '{"name": "Alice", "age": 25}'
const obj = JSON.parse(text)

console.log(obj.name)   // "Alice"
console.log(obj.age)    // 25
```

If the JSON is invalid, it throws a `SyntaxError` with a helpful message like:
```
SyntaxError: Unexpected token } in JSON at position 42
```

### JSON.stringify() — Object to String

```javascript
const obj = { name: "Alice", age: 25 }

// Minified (no spaces)
JSON.stringify(obj)
// '{"name":"Alice","age":25}'

// Beautified (2-space indent)
JSON.stringify(obj, null, 2)
// {
//   "name": "Alice",
//   "age": 25
// }

// With 4-space indent
JSON.stringify(obj, null, 4)
// {
//     "name": "Alice",
//     "age": 25
// }
```

### The 3 parameters of JSON.stringify:

| Parameter | What It Does |
|-----------|-------------|
| `value` | The object to convert |
| `replacer` | Filter which keys to include (usually `null` for all) |
| `space` | Indentation: `2` for 2-space, `4` for 4-space, `\t` for tabs |

### The Replacer Function (Advanced)

```javascript
const user = { name: "Alice", password: "secret123", age: 25 }

// Remove sensitive fields
const safe = JSON.stringify(user, (key, value) => {
  if (key === "password") return undefined  // exclude this key
  return value
}, 2)

// Result: { "name": "Alice", "age": 25 }
```

---

## Lesson 4: Add JSON Path Navigator

When dealing with deeply nested JSON, finding a specific value is hard. Let's add a path navigator that shows the JSON path when you click on a key.

### How JSON paths work:

```json
{
  "users": [
    {
      "name": "Alice",
      "address": {
        "city": "New York"
      }
    }
  ]
}
```

| Value | JSON Path |
|-------|-----------|
| "Alice" | `$.users[0].name` |
| "New York" | `$.users[0].address.city` |
| First user object | `$.users[0]` |

### Add a tree view panel:

```jsx
const [tree, setTree] = useState(null)

const buildTree = () => {
  try {
    const parsed = JSON.parse(input)
    setTree(parsed)
  } catch {
    setTree(null)
  }
}

const TreeNode = ({ data, path = "$" }) => {
  const [expanded, setExpanded] = useState(true)

  if (data === null) return <span style={{ color: "#808080" }}>null</span>
  if (typeof data !== "object") {
    const color = typeof data === "string" ? "#ce9178"
                : typeof data === "number" ? "#b5cea8"
                : typeof data === "boolean" ? "#569cd6"
                : "#d4d4d4"
    return <span style={{ color }}>{JSON.stringify(data)}</span>
  }

  const isArray = Array.isArray(data)
  const entries = isArray
    ? data.map((val, i) => [i, val])
    : Object.entries(data)

  return (
    <div style={{ marginLeft: "16px" }}>
      <span
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: "pointer", color: "#569cd6" }}
      >
        {expanded ? "▼" : "▶"} {isArray ? `Array(${data.length})` : `Object{${Object.keys(data).length}}`}
      </span>
      {expanded && entries.map(([key, val]) => {
        const childPath = isArray ? `${path}[${key}]` : `${path}.${key}`
        return (
          <div key={key} style={{ marginLeft: "16px", fontSize: "13px" }}>
            <span style={{ color: "#9cdcfe" }}>{isArray ? `[${key}]` : `"${key}"`}</span>
            <span style={{ color: "#888" }}>: </span>
            {typeof val === "object" && val !== null ? (
              <TreeNode data={val} path={childPath} />
            ) : (
              <>
                <TreeNode data={val} path={childPath} />
                <span style={{ color: "#555", fontSize: "11px", marginLeft: "8px" }}>
                  {childPath}
                </span>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

---

## Lesson 5: JSON Validation Patterns

### Common API Response Formats

**Success Response:**
```json
{
  "status": "success",
  "data": {
    "users": [
      { "id": 1, "name": "Alice" },
      { "id": 2, "name": "Bob" }
    ],
    "total": 2,
    "page": 1
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "error": {
    "code": 404,
    "message": "Resource not found",
    "details": "User with ID 999 does not exist"
  }
}
```

**Paginated Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

### Test Your Formatter

Paste each of these JSON examples into your formatter. Practice:
1. Beautify them with 2-space indent
2. Minify them — check the size difference
3. Look at the stats — how deep is the nesting?

---

## Lesson 6: Practice Challenges

### Challenge 1: Fix this broken JSON

```
{
  "name": "Alice",
  "hobbies": ['reading', 'coding'],
  "active": True,
  age: 25,
  "bio": "She said "hello"",
}
```

**Find ALL 5 errors!**

<details>
<summary>Solution</summary>

1. `'reading'` → `"reading"` (single quotes → double quotes)
2. `'coding'` → `"coding"`
3. `True` → `true` (lowercase in JSON)
4. `age:` → `"age":` (unquoted key)
5. `"She said "hello""` → `"She said \"hello\""` (unescaped inner quotes)
6. Trailing comma after the last item

**Fixed:**
```json
{
  "name": "Alice",
  "hobbies": ["reading", "coding"],
  "active": true,
  "age": 25,
  "bio": "She said \"hello\""
}
```
</details>

### Challenge 2: Deeply nested data

Paste this and analyze the structure:
```json
{
  "company": {
    "departments": [
      {
        "name": "Engineering",
        "teams": [
          {
            "name": "Frontend",
            "members": [
              { "name": "Alice", "skills": ["React", "CSS"] },
              { "name": "Bob", "skills": ["Vue", "TypeScript"] }
            ]
          },
          {
            "name": "Backend",
            "members": [
              { "name": "Charlie", "skills": ["Node.js", "PostgreSQL"] }
            ]
          }
        ]
      }
    ]
  }
}
```

**Questions:**
1. What's the nesting depth? (Answer: 7)
2. How many strings are there? (Count them!)
3. What's the JSON path to "PostgreSQL"?

<details>
<summary>Answer to #3</summary>

`$.company.departments[0].teams[1].members[0].skills[1]`
</details>

---

## Course Summary

### What You Learned

| Lesson | Topic | Key Takeaway |
|--------|-------|-------------|
| 1 | What is JSON? | 6 data types, strict syntax, universal data exchange |
| 2 | Building the formatter | Monaco editor + JSON.parse/stringify + stats |
| 3 | Parse & Stringify | The two core JSON functions with replacer and indent |
| 4 | JSON path navigator | Tree view with clickable paths |
| 5 | API response patterns | Success, error, and paginated JSON structures |
| 6 | Practice challenges | Finding JSON errors, analyzing nested data |

### What to Build Next

- [ ] Add JSON comparison tool (diff two JSON objects)
- [ ] Add JSON-to-CSV converter
- [ ] Add JSON Schema validation
- [ ] Support JSON5 (comments and trailing commas allowed)
- [ ] Add search/filter within the JSON tree
