# Building a C Code Compiler with Monaco Editor

## What You'll Learn

How to create a browser-based C code editor using Monaco Editor in React, compile the code, and display output.

---

## 1. How C Compilation Works

```
Source Code (.c)  →  Preprocessor  →  Compiler  →  Assembler  →  Linker  →  Executable
     ↓                  ↓               ↓             ↓             ↓
  #include etc.     expanded code    assembly       .o file      a.out / .exe
```

### Key Stages

| Stage        | Tool       | What It Does                                |
|-------------|------------|---------------------------------------------|
| Preprocessor | `cpp`      | Expands `#include`, `#define`, macros       |
| Compiler     | `cc1`      | Converts C → Assembly (.s)                  |
| Assembler    | `as`       | Converts Assembly → Object code (.o)        |
| Linker       | `ld`       | Combines .o files + libraries → executable  |

All of these are bundled in `gcc` (GNU Compiler Collection).

---

## 2. Create the Monaco C Editor Component

Create a new file `src/components/CEditor.jsx`:

```jsx
import React, { useState } from "react"
import Editor from "@monaco-editor/react"

const DEFAULT_C_CODE = `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");

    int a = 10, b = 20;
    printf("Sum: %d\\n", a + b);

    return 0;
}`

function CEditor() {
  const [code, setCode] = useState(DEFAULT_C_CODE)
  const [output, setOutput] = useState("")

  const handleCompile = async () => {
    setOutput("Compiling...")

    // Option A: Send to your own backend
    // const res = await fetch("/api/compile/c", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ code }),
    // })
    // const data = await res.json()
    // setOutput(data.output)

    // Option B: Use a free API like Judge0
    // See Section 5 below

    setOutput("⚠️ Connect a backend compiler to see real output.")
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <h2 style={{ color: "#fff", padding: "10px" }}>C Compiler</h2>

      <Editor
        height="60%"
        defaultLanguage="c"
        value={code}
        onChange={(value) => setCode(value ?? "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          automaticLayout: true,
          suggestOnTriggerCharacters: true,
        }}
      />

      <button
        onClick={handleCompile}
        style={{
          margin: "10px",
          padding: "10px 20px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          alignSelf: "flex-start",
        }}
      >
        ▶ Compile & Run
      </button>

      <pre
        style={{
          flex: 1,
          backgroundColor: "#1e1e1e",
          color: "#d4d4d4",
          padding: "15px",
          margin: "0 10px 10px",
          borderRadius: "5px",
          overflow: "auto",
        }}
      >
        {output || "Output will appear here..."}
      </pre>
    </div>
  )
}

export default CEditor
```

---

## 3. Key Monaco Settings for C

```jsx
defaultLanguage="c"    // Enables C syntax highlighting
```

Useful `options`:

| Option                        | Value   | Why                                     |
|-------------------------------|---------|-----------------------------------------|
| `minimap.enabled`             | `false` | Cleaner look for learning               |
| `fontSize`                    | `14`    | Comfortable reading size                 |
| `automaticLayout`             | `true`  | Auto-resize when window changes          |
| `suggestOnTriggerCharacters`  | `true`  | Show autocomplete on typing              |
| `bracketPairColorization`     | `true`  | Color-coded bracket pairs                |

---

## 4. Backend Compilation (Node.js + Express Example)

To actually compile C code, you need a backend with `gcc` installed:

```js
// server.js (Node.js backend)
const express = require("express")
const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

const app = express()
app.use(express.json())

app.post("/api/compile/c", (req, res) => {
  const { code } = req.body
  // Use a unique filename to avoid collisions
  const id = crypto.randomUUID()
  const filePath = path.join("/tmp", `${id}.c`)
  const outPath = path.join("/tmp", id)

  try {
    fs.writeFileSync(filePath, code)
    // Compile
    execSync(`gcc "${filePath}" -o "${outPath}"`, { timeout: 10000 })
    // Run with timeout
    const output = execSync(`"${outPath}"`, { timeout: 5000 }).toString()
    res.json({ output })
  } catch (err) {
    res.json({ output: err.stderr?.toString() || err.message })
  } finally {
    // Clean up temp files
    try { fs.unlinkSync(filePath) } catch {}
    try { fs.unlinkSync(outPath) } catch {}
  }
})

app.listen(3001, () => console.log("C compiler server on :3001"))
```

> **Security Note**: Never run user code directly on a production server.
> Use Docker containers or sandboxed environments for safety.

---

## 5. Alternative: Use Judge0 API (No Backend Needed)

Judge0 is a free online code execution API:

```js
const handleCompile = async () => {
  setOutput("Compiling...")

  const response = await fetch(
    "https://judge0-ce.p.rapidapi.com/submissions?wait=true",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": "YOUR_API_KEY",   // Get from RapidAPI
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: JSON.stringify({
        source_code: code,
        language_id: 50,   // 50 = C (GCC 9.2.0)
        stdin: "",
      }),
    }
  )

  const data = await response.json()
  setOutput(data.stdout || data.stderr || data.compile_output || "No output")
}
```

### Judge0 Language IDs (Quick Reference)

| Language   | ID  |
|-----------|-----|
| C          | 50  |
| C++        | 54  |
| Java       | 62  |
| JavaScript | 63  |
| SQL        | 82  |

---

## 6. C Compilation Flow Diagram

```
Your React App (Monaco Editor)
        │
        ▼
   User writes C code
        │
        ▼
   Click "Compile & Run"
        │
        ▼
   POST code to backend ──────► Backend receives code
                                      │
                                      ▼
                                 Save as .c file
                                      │
                                      ▼
                              gcc compiles → executable
                                      │
                                      ▼
                               Run executable
                                      │
                                      ▼
                              Capture stdout/stderr
                                      │
                                      ▼
                              Send JSON response
        │
        ▼
   Display output in <pre> panel
```

---

## 7. Practice Exercises

1. **Hello World**: Change the default code to print your name
2. **User Input**: Add an input text box for `stdin` and pass it to the compiler
3. **Error Display**: Show compiler errors in red text
4. **Multiple Files**: Support header files (.h) alongside .c files
5. **Syntax Errors**: Try writing broken C code and see how the error output looks

---

## 8. Key C Concepts to Test in Your Editor

```c
// Variables and types
int x = 42;
float pi = 3.14;
char letter = 'A';

// Arrays
int nums[] = {1, 2, 3, 4, 5};

// Loops
for (int i = 0; i < 5; i++) {
    printf("%d ", nums[i]);
}

// Functions
int add(int a, int b) {
    return a + b;
}

// Pointers
int *ptr = &x;
printf("Value: %d, Address: %p\n", *ptr, ptr);
```

---

## Summary

| What              | How                                      |
|-------------------|------------------------------------------|
| Editor            | Monaco with `defaultLanguage="c"`        |
| Compilation       | Backend with `gcc` or Judge0 API         |
| Output display    | `<pre>` block below editor               |
| Key concern       | Security — sandbox user code execution   |
