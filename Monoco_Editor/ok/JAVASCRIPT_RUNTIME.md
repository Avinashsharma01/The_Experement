# Building a JavaScript Runtime with Monaco Editor

## What You'll Learn

How to create a browser-based JavaScript code editor using Monaco Editor in React that can execute JS code directly in the browser — no backend needed!

---

## 1. How JavaScript Execution Works

Unlike C/C++/Java, JavaScript doesn't need a traditional compiler. It uses a **JIT (Just-In-Time) compiler** inside the JS engine.

```
Source Code (.js)  →  Parser  →  AST  →  Bytecode  →  JIT Compiler  →  Machine Code
```

### JS Engines

| Engine       | Used In            |
|-------------|---------------------|
| V8          | Chrome, Node.js     |
| SpiderMonkey| Firefox             |
| JavaScriptCore | Safari           |
| Hermes      | React Native        |

### Key Advantage: Runs in the Browser!

You don't need a backend. JavaScript can execute right in the browser using:
- `eval()` (simple but limited)
- `new Function()` (safer than eval)
- `iframe` sandbox (safest for untrusted code)

---

## 2. Create the Monaco JavaScript Editor Component

Create `src/components/JsEditor.jsx`:

```jsx
import React, { useState, useRef } from "react"
import Editor from "@monaco-editor/react"

const DEFAULT_JS_CODE = `// JavaScript Playground
console.log("Hello, JavaScript!");

// Variables
const name = "Monaco";
let count = 0;

// Array methods
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);

// Object
const user = {
  name: "Alice",
  age: 25,
  greet() {
    return \`Hi, I'm \${this.name}!\`;
  }
};
console.log(user.greet());

// Async example
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
console.log("Start");
// await delay(100);  // Works in async context
console.log("End");`

function JsEditor() {
  const [code, setCode] = useState(DEFAULT_JS_CODE)
  const [output, setOutput] = useState("")
  const editorRef = useRef(null)

  const handleEditorMount = (editor) => {
    editorRef.current = editor
  }

  const handleRun = () => {
    // Capture console.log output
    const logs = []
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn

    console.log = (...args) => {
      logs.push(args.map(a =>
        typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)
      ).join(" "))
    }
    console.error = (...args) => {
      logs.push("❌ " + args.join(" "))
    }
    console.warn = (...args) => {
      logs.push("⚠️ " + args.join(" "))
    }

    try {
      // Execute the code
      const fn = new Function(code)
      fn()
    } catch (err) {
      logs.push(`❌ Error: ${err.message}`)
    } finally {
      // Restore original console
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
    }

    setOutput(logs.join("\n") || "No output (use console.log to see results)")
  }

  const handleClear = () => {
    setOutput("")
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <h2 style={{ color: "#fff", padding: "10px" }}>JavaScript Playground</h2>

      <Editor
        height="55%"
        defaultLanguage="javascript"
        value={code}
        onChange={(value) => setCode(value ?? "")}
        theme="vs-dark"
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          automaticLayout: true,
          bracketPairColorization: { enabled: true },
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
          quickSuggestions: true,
        }}
      />

      <div style={{ display: "flex", gap: "10px", padding: "10px" }}>
        <button
          onClick={handleRun}
          style={{
            padding: "10px 20px",
            backgroundColor: "#f7df1e",
            color: "#000",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ▶ Run
        </button>
        <button
          onClick={handleClear}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Clear Output
        </button>
      </div>

      <pre
        style={{
          flex: 1,
          backgroundColor: "#1e1e1e",
          color: "#d4d4d4",
          padding: "15px",
          margin: "0 10px 10px",
          borderRadius: "5px",
          overflow: "auto",
          fontFamily: "Consolas, monospace",
        }}
      >
        {output || "Output will appear here... (click Run)"}
      </pre>
    </div>
  )
}

export default JsEditor
```

---

## 3. The Big Advantage: No Backend!

JavaScript runs directly in the browser. Here's how the execution works:

```
Monaco Editor (user types JS)
       │
       ▼
  Click "Run"
       │
       ▼
  new Function(code)   ← Creates a function from the string
       │
       ▼
  fn()                  ← Executes it in-browser
       │
       ▼
  console.log captured  ← We intercept console output
       │
       ▼
  Display in output panel
```

### Three Ways to Execute JS in Browser

| Method           | Safety  | Use Case                  |
|-----------------|---------|---------------------------|
| `eval(code)`     | Low     | Quick testing only        |
| `new Function()` | Medium  | Better isolation          |
| `<iframe>` sandbox | High | Untrusted code execution  |

---

## 4. Safe Execution with iframe (Advanced)

For production apps, use an iframe sandbox:

```jsx
const runInSandbox = (code) => {
  const iframe = document.createElement("iframe")
  iframe.style.display = "none"
  iframe.sandbox = "allow-scripts"
  document.body.appendChild(iframe)

  const logs = []

  // Inject code into iframe
  iframe.contentWindow.console.log = (...args) => {
    logs.push(args.map(String).join(" "))
  }

  try {
    iframe.contentWindow.eval(code)
  } catch (err) {
    logs.push(`Error: ${err.message}`)
  } finally {
    document.body.removeChild(iframe)
  }

  return logs.join("\n")
}
```

---

## 5. Monaco IntelliSense for JavaScript

Monaco has **built-in** JavaScript/TypeScript IntelliSense! It:

- Autocompletes standard APIs (`Array`, `Math`, `Promise`, etc.)
- Shows function signatures
- Detects basic errors
- Supports JSDoc comments

### Add Custom Type Definitions

```jsx
const handleEditorMount = (editor, monaco) => {
  // Add custom global type for IntelliSense
  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    `
    declare function greet(name: string): string;
    declare const API_URL: string;
    `,
    "globals.d.ts"
  )
}
```

Then in the `<Editor>`:

```jsx
<Editor
  onMount={handleEditorMount}
  ...
/>
```

---

## 6. JavaScript Concepts to Test in Your Editor

```js
// Closures
function counter() {
  let count = 0;
  return {
    increment: () => ++count,
    getCount: () => count,
  };
}
const c = counter();
c.increment();
c.increment();
console.log(c.getCount()); // 2

// Promises
const fetchData = () =>
  new Promise((resolve) => {
    resolve({ id: 1, name: "Test" });
  });

fetchData().then((data) => console.log(data));

// Destructuring
const { name: userName, age = 30 } = { name: "Bob" };
console.log(userName, age); // "Bob" 30

// Spread / Rest
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];
console.log(arr2); // [1, 2, 3, 4, 5]

// Map, Filter, Reduce
const nums = [1, 2, 3, 4, 5, 6];
const result = nums
  .filter((n) => n % 2 === 0)
  .map((n) => n * 10)
  .reduce((sum, n) => sum + n, 0);
console.log("Result:", result); // 120

// Classes
class Person {
  #age; // private field
  constructor(name, age) {
    this.name = name;
    this.#age = age;
  }
  getInfo() {
    return `${this.name}, age ${this.#age}`;
  }
}
const p = new Person("Alice", 25);
console.log(p.getInfo());

// Generators
function* fibonacci() {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}
const fib = fibonacci();
for (let i = 0; i < 10; i++) {
  console.log(fib.next().value);
}
```

---

## 7. Practice Exercises

1. **Live Output**: Make the editor run code automatically as you type (debounced)
2. **Console Methods**: Support `console.table()` by rendering output as an HTML table
3. **Error Highlighting**: When code throws an error, highlight the error line in the editor
4. **Multi-File**: Add tabs to switch between multiple JS files
5. **Save/Load**: Save code to `localStorage` and reload on page refresh

### Exercise: Debounced Auto-Run

```jsx
import { useEffect } from "react"

// Inside component:
useEffect(() => {
  const timer = setTimeout(() => {
    handleRun()
  }, 500) // Run 500ms after user stops typing

  return () => clearTimeout(timer)
}, [code])
```

---

## 8. Node.js Execution (Backend Option)

If you want Node.js features (`fs`, `http`, etc.), you need a backend:

```js
// server.js
const express = require("express")
const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

const app = express()
app.use(express.json())

app.post("/api/run/js", (req, res) => {
  const { code } = req.body
  const id = crypto.randomUUID()
  const filePath = path.join("/tmp", `${id}.js`)

  try {
    fs.writeFileSync(filePath, code)
    const output = execSync(`node "${filePath}"`, { timeout: 5000 }).toString()
    res.json({ output })
  } catch (err) {
    res.json({ output: err.stderr?.toString() || err.message })
  } finally {
    try { fs.unlinkSync(filePath) } catch {}
  }
})

app.listen(3004, () => console.log("JS runner on :3004"))
```

---

## Summary

| What              | How                                           |
|-------------------|-----------------------------------------------|
| Editor            | Monaco with `defaultLanguage="javascript"`    |
| Execution         | In-browser with `new Function()` — no backend!|
| IntelliSense      | Built-in for JS/TS                            |
| Backend option    | Node.js for full API access                   |
| Judge0 ID         | 63                                            |
| Key advantage     | No compilation step needed                    |
