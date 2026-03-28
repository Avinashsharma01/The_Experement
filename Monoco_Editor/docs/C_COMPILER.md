# Self-Learning Course: Build a C Code Compiler in the Browser

> **Course Goal**: By the end of this course, you will understand how C compilation works under the hood, and you'll build a working browser-based C editor + compiler using Monaco Editor and React.
>
> **Prerequisites**: Basic React knowledge (useState, components). You already have the Monaco Editor project set up.
>
> **Time**: ~45 minutes, 7 lessons

---

## Lesson 1: What Actually Happens When You Compile C Code?

Before we write any code, let's understand what a "compiler" really does. Most beginners think it's one step — but it's actually **four stages** working together like an assembly line.

### The 4 Stages of C Compilation

```
  You write this:           Stage 1            Stage 2           Stage 3          Stage 4
┌──────────────┐      ┌──────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│  hello.c     │ ───► │ Preprocessor │ ─► │  Compiler  │ ─► │ Assembler  │ ─► │  Linker    │
│              │      │              │    │            │    │            │    │            │
│ #include ... │      │ Expands all  │    │ Turns C    │    │ Turns ASM  │    │ Combines   │
│ int main()   │      │ #includes    │    │ into       │    │ into       │    │ everything │
│ { ... }      │      │ and macros   │    │ Assembly   │    │ machine    │    │ into one   │
│              │      │              │    │ code (.s)  │    │ code (.o)  │    │ executable │
└──────────────┘      └──────────────┘    └────────────┘    └────────────┘    └────────────┘
```

### Think of it like cooking:

1. **Preprocessor** = Gathering all ingredients (expanding `#include`, `#define`)
2. **Compiler** = Writing the recipe in a different language (C → Assembly)
3. **Assembler** = Translating recipe into machine steps (Assembly → Binary)
4. **Linker** = Putting the full meal together (combining all parts + libraries)

When you run `gcc hello.c`, it does ALL four steps automatically. That's why `gcc` is called a "compiler collection" — it's a toolchain, not just one tool.

### Quick Check — Did You Get It?

> **Question**: If you write `#include <stdio.h>` in your C code, which stage handles it?
>
> **Answer**: The **Preprocessor** (Stage 1). It literally copy-pastes the contents of `stdio.h` into your file before compilation even begins.

---

## Lesson 2: Set Up Your First C Editor in Monaco

Now let's build! We'll start with the simplest possible C code editor.

### Step 1: Create the file

Create a new file at `src/components/CEditor.jsx`:

```jsx
import React, { useState } from "react"
import Editor from "@monaco-editor/react"

function CEditor() {
  const [code, setCode] = useState(`#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`)

  return (
    <div style={{ height: "400px", border: "1px solid #333" }}>
      <Editor
        height="100%"
        defaultLanguage="c"
        value={code}
        onChange={(value) => setCode(value ?? "")}
        theme="vs-dark"
      />
    </div>
  )
}

export default CEditor
```

### Step 2: Understand every line

Let's break this down — no skipping:

| Code | What It Does | Why It Matters |
|------|-------------|----------------|
| `defaultLanguage="c"` | Tells Monaco to use C syntax rules | This gives you C keywords in color, bracket matching, etc. |
| `value={code}` | Connects editor content to React state | So you can read what the user typed |
| `onChange={(value) => setCode(value ?? "")}` | Updates state on every keystroke | The `?? ""` prevents crashes if Monaco returns `undefined` |
| `theme="vs-dark"` | Dark color theme | You can also try `"light"` or `"vs"` |

### Try It Yourself

1. Import this component in your `App.jsx` and render it
2. You should see a dark editor with C syntax highlighting
3. Try typing `printf(` — notice the bracket auto-closes!

> **Checkpoint**: Can you see colored C keywords like `int`, `return`, `#include`? If yes, move to Lesson 3!

---

## Lesson 3: Add Editor Options (Make It Comfortable)

The bare editor works, but it's not great for learning. Let's add options that make coding easier.

### Add this `options` prop to your `<Editor>`:

```jsx
<Editor
  height="100%"
  defaultLanguage="c"
  value={code}
  onChange={(value) => setCode(value ?? "")}
  theme="vs-dark"
  options={{
    minimap: { enabled: false },     // Hide the small code preview on the right
    fontSize: 16,                     // Bigger text = easier to read
    wordWrap: "on",                   // Wrap long lines instead of scrolling
    automaticLayout: true,            // Auto-resize when window changes
    suggestOnTriggerCharacters: true,  // Show autocomplete suggestions
    bracketPairColorization: { enabled: true },  // Color-code matching brackets
    lineNumbers: "on",                // Show line numbers
    tabSize: 4,                       // 4-space tabs (C convention)
  }}
/>
```

### What each option does (and why you'd want it):

- **`minimap: false`** — The minimap is useful in large projects, but distracting when learning. Turn it off.
- **`fontSize: 16`** — Default 14px is small. 16px is more comfortable.
- **`bracketPairColorization`** — In C, mismatched `{}` causes hard-to-find bugs. Colored brackets help you spot them.
- **`automaticLayout`** — Without this, resizing your browser can break the editor layout.

### Try It Yourself

1. Add the options above to your editor
2. Type a function with nested `if` statements — see the colored brackets?
3. Try changing `fontSize` to `20` — see the difference?

> **Checkpoint**: Your editor should now feel more like VS Code. If brackets are colored and text is bigger, move on!

---

## Lesson 4: Add an Output Panel

An editor without output is like a car without wheels. Let's add a panel to show compilation results.

### Update your component:

```jsx
import React, { useState } from "react"
import Editor from "@monaco-editor/react"

function CEditor() {
  const [code, setCode] = useState(`#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`)
  const [output, setOutput] = useState("")

  const handleCompile = () => {
    // We'll connect this to a real compiler in Lesson 6
    setOutput("Compilation will work after Lesson 6!")
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Editor Area */}
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="c"
          value={code}
          onChange={(value) => setCode(value ?? "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            wordWrap: "on",
            automaticLayout: true,
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>

      {/* Compile Button */}
      <button
        onClick={handleCompile}
        style={{
          padding: "12px 24px",
          margin: "10px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          alignSelf: "flex-start",
        }}
      >
        ▶ Compile & Run
      </button>

      {/* Output Panel */}
      <pre
        style={{
          height: "200px",
          backgroundColor: "#1e1e1e",
          color: "#d4d4d4",
          padding: "15px",
          margin: "0 10px 10px",
          borderRadius: "5px",
          overflow: "auto",
          fontFamily: "Consolas, monospace",
          fontSize: "14px",
        }}
      >
        {output || "Click 'Compile & Run' to see output here..."}
      </pre>
    </div>
  )
}

export default CEditor
```

### What we built:

```
┌─────────────────────────────┐
│                             │
│     Monaco Editor           │
│     (write C code here)     │
│                             │
├─────────────────────────────┤
│ [▶ Compile & Run]           │
├─────────────────────────────┤
│                             │
│     Output Panel            │
│     (results show here)     │
│                             │
└─────────────────────────────┘
```

### Try It Yourself

1. Click the "Compile & Run" button — you should see "Compilation will work after Lesson 6!"
2. Try changing the button color by modifying `backgroundColor`
3. Try changing the button text

> **Checkpoint**: You have a 3-panel layout (editor + button + output). Time for the interesting part!

---

## Lesson 5: Understanding the Compilation Flow

Before connecting a real compiler, let's understand the full flow your app will follow:

```
Step 1: User writes C code in Monaco Editor
    ↓
Step 2: User clicks "Compile & Run"
    ↓
Step 3: Your React app sends the code to a backend server
    ↓
Step 4: The backend saves code as a .c file
    ↓
Step 5: The backend runs:  gcc file.c -o output
    ↓
Step 6: If compilation succeeds → run the executable → capture output
        If compilation fails → capture error messages
    ↓
Step 7: Backend sends output/errors back as JSON
    ↓
Step 8: Your React app displays it in the output panel
```

### Why can't we compile C in the browser?

Unlike JavaScript, C needs to be compiled into **machine code** specific to an operating system. Browsers can't do this — they only run JavaScript. So we need a backend server that has `gcc` installed.

**Two options:**

| Option | What It Is | Pros | Cons |
|--------|-----------|------|------|
| **Your own backend** | Node.js + Express + gcc | Full control, no limits | Need gcc installed, security concerns |
| **Judge0 API** | Free cloud compilation service | No server setup needed | API key required, rate limits |

We'll learn both. Let's start with Judge0 (easier).

---

## Lesson 6: Connect to a Real Compiler (Judge0 API)

Judge0 is a free service that compiles and runs code in 60+ languages. No backend setup needed!

### Step 1: Get a free API key

1. Go to RapidAPI and search for "Judge0 CE"
2. Sign up and get your free API key
3. You get ~100 free requests per day

### Step 2: Update your `handleCompile` function

Replace the placeholder with this:

```jsx
const handleCompile = async () => {
  setOutput("⏳ Compiling your C code...")

  try {
    const response = await fetch(
      "https://judge0-ce.p.rapidapi.com/submissions?wait=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": "YOUR_API_KEY_HERE",  // ← Replace this!
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        body: JSON.stringify({
          source_code: code,
          language_id: 50,    // 50 = C language (GCC 9.2.0)
          stdin: "",          // No user input for now
        }),
      }
    )

    const data = await response.json()

    if (data.stdout) {
      setOutput(data.stdout)
    } else if (data.compile_output) {
      setOutput("❌ Compilation Error:\n" + data.compile_output)
    } else if (data.stderr) {
      setOutput("❌ Runtime Error:\n" + data.stderr)
    } else {
      setOutput("Program ran with no output.")
    }
  } catch (err) {
    setOutput("❌ Network Error: " + err.message)
  }
}
```

### Step 3: Understand the language ID

Each language has a number in Judge0:

| Language | ID | Notes |
|----------|----|-------|
| **C** | **50** | GCC 9.2.0 |
| C++ | 54 | GCC 9.2.0 |
| Java | 62 | OpenJDK 13 |
| JavaScript | 63 | Node.js 12 |
| SQL | 82 | SQLite |

### Try It Yourself

1. Replace `YOUR_API_KEY_HERE` with your actual key
2. Write this C code in the editor:

```c
#include <stdio.h>

int main() {
    for (int i = 1; i <= 5; i++) {
        printf("Count: %d\n", i);
    }
    return 0;
}
```

3. Click "Compile & Run"
4. You should see:
```
Count: 1
Count: 2
Count: 3
Count: 4
Count: 5
```

### Now try breaking the code on purpose:

```c
#include <stdio.h>

int main() {
    printf("Hello"    // Missing semicolon and closing paren!
    return 0;
}
```

> You should see a compilation error message. This is how real compilers talk to you!

> **Checkpoint**: Can you compile and run C code from your browser? If yes — congratulations, you've built a working C compiler interface!

---

## Lesson 7: Build Your Own Backend (Advanced)

If you want full control (no API limits, custom features), here's how to build your own compilation server.

### Step 1: Create a new folder

```
Monoco_Editor/
├── src/            ← Your React app
└── server/         ← New! Your backend
    └── server.js
```

### Step 2: Set up the server

```bash
cd server
npm init -y
npm install express cors
```

### Step 3: Write the server

```js
// server/server.js
const express = require("express")
const cors = require("cors")
const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

const app = express()
app.use(cors())
app.use(express.json())

app.post("/api/compile/c", (req, res) => {
  const { code } = req.body

  // Create unique filenames so multiple users don't collide
  const id = crypto.randomUUID()
  const filePath = path.join("/tmp", `${id}.c`)
  const outPath = path.join("/tmp", id)

  try {
    // Step 1: Save the code as a .c file
    fs.writeFileSync(filePath, code)

    // Step 2: Compile it with gcc (10 second timeout)
    execSync(`gcc "${filePath}" -o "${outPath}"`, { timeout: 10000 })

    // Step 3: Run the compiled program (5 second timeout)
    const output = execSync(`"${outPath}"`, { timeout: 5000 }).toString()

    // Step 4: Send output back
    res.json({ output })
  } catch (err) {
    // Send compilation/runtime errors back
    res.json({ output: err.stderr?.toString() || err.message })
  } finally {
    // Step 5: Clean up temporary files (always!)
    try { fs.unlinkSync(filePath) } catch {}
    try { fs.unlinkSync(outPath) } catch {}
  }
})

app.listen(3001, () => console.log("C compiler server running on port 3001"))
```

### Step 4: Update your frontend to use the backend

```jsx
const handleCompile = async () => {
  setOutput("⏳ Compiling...")

  try {
    const res = await fetch("http://localhost:3001/api/compile/c", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })

    const data = await res.json()
    setOutput(data.output)
  } catch (err) {
    setOutput("❌ Could not connect to server: " + err.message)
  }
}
```

### Important Security Warning

> **Never run user code directly on a production server!**
> A user could write `system("rm -rf /")` inside their C code.
> For production, use Docker containers to sandbox code execution.

---

## Practice Lab: Test These Programs

Now that your compiler is working, try these programs to practice C:

### Program 1: Variables and Math
```c
#include <stdio.h>

int main() {
    int age = 25;
    float height = 5.9;
    char grade = 'A';

    printf("Age: %d\n", age);
    printf("Height: %.1f\n", height);
    printf("Grade: %c\n", grade);
    return 0;
}
```
**Expected output**: Age: 25, Height: 5.9, Grade: A

### Program 2: User-defined Function
```c
#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int main() {
    int result = add(10, 20);
    printf("10 + 20 = %d\n", result);
    return 0;
}
```
**Expected output**: 10 + 20 = 30

### Program 3: Arrays and Loops
```c
#include <stdio.h>

int main() {
    int scores[] = {85, 92, 78, 95, 88};
    int sum = 0;

    for (int i = 0; i < 5; i++) {
        sum += scores[i];
    }

    printf("Average: %d\n", sum / 5);
    return 0;
}
```
**Expected output**: Average: 87

### Program 4: Pointers (The Hard Part!)
```c
#include <stdio.h>

int main() {
    int x = 42;
    int *ptr = &x;   // ptr stores the ADDRESS of x

    printf("Value of x: %d\n", x);        // 42
    printf("Address of x: %p\n", &x);     // memory address
    printf("ptr points to: %d\n", *ptr);   // 42 (dereference)

    *ptr = 100;  // Change x through the pointer!
    printf("x is now: %d\n", x);           // 100

    return 0;
}
```
**Why this matters**: Pointers are the hardest C concept. Being able to test them instantly in your editor makes learning much easier!

---

## Course Summary

### What You Learned

| Lesson | Topic | Key Takeaway |
|--------|-------|-------------|
| 1 | How C compilation works | 4 stages: Preprocessor → Compiler → Assembler → Linker |
| 2 | Basic Monaco C editor | `defaultLanguage="c"` enables C mode |
| 3 | Editor options | Options like `minimap`, `fontSize`, `bracketPairColorization` |
| 4 | Output panel | Layout: Editor → Button → Output |
| 5 | Compilation flow | Code → Backend → gcc → Output → Display |
| 6 | Judge0 API integration | `language_id: 50` for C, free cloud compilation |
| 7 | Own backend server | Node.js + Express + gcc |

### What to Build Next

- [ ] Add a stdin input box for programs that need user input
- [ ] Show errors in red and success in green
- [ ] Add a "Reset Code" button
- [ ] Support multiple C files (main.c + helper.h)
- [ ] Add a timer showing compilation time
