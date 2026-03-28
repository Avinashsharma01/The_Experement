# Self-Learning Course: Build a Python Compiler in the Browser

> **Course Goal**: By the end of this course, you will understand how Python executes code differently from C/C++/Java, and you'll build a browser-based Python editor + compiler using Monaco Editor.
>
> **Prerequisites**: Completed at least the C Compiler course. Basic React knowledge.
>
> **Time**: ~40 minutes, 7 lessons

---

## Lesson 1: How Python Runs Your Code — It's Not What You Think

Python is often called an "interpreted" language, but the truth is more nuanced. Let's see what really happens.

### The Python Execution Pipeline

```
You write this:          Step 1              Step 2              Step 3
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  hello.py    │ ─► │  Lexer +     │ ─► │  Compiler    │ ─► │  Python VM   │
│              │    │  Parser      │    │  (to bytecode│    │  (PVM)       │
│ print("Hi")  │    │              │    │   NOT machine│    │              │
│              │    │ Reads tokens │    │   code!)     │    │ Executes     │
│              │    │ Builds AST   │    │ Creates .pyc │    │ bytecode     │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

### Wait — Python has a compiler?

Yes! But it compiles to **bytecode** (like Java), not machine code (like C). Here's the difference:

| Language | Compiles To | Runs On | Speed |
|----------|------------|---------|-------|
| C/C++ | Machine code (.exe) | CPU directly | Fastest |
| Java | Bytecode (.class) | JVM | Fast |
| **Python** | **Bytecode (.pyc)** | **Python VM (PVM)** | **Slower** |
| JavaScript | JIT-compiled at runtime | V8/SpiderMonkey | Fast |

### Why is Python slower but more popular?

```
C:      10 lines to read a file
Python: 1 line to read a file  →  open("file.txt").read()

C:      Manual memory management (malloc, free)
Python: Automatic garbage collection

C:      Compile → Run → Debug → Recompile → Run again
Python: Just run it! Instant feedback.
```

Python trades **speed** for **developer productivity**. That's why it dominates in AI, data science, web scraping, and rapid prototyping.

### Quick Check

> **Question**: Is Python compiled or interpreted?
>
> **Answer**: **Both!** Python first compiles your code to bytecode (.pyc), then the Python Virtual Machine (PVM) interprets that bytecode. You just don't see the compilation step because it happens automatically.

> **Question**: Why do you sometimes see `__pycache__` folders in Python projects?
>
> **Answer**: That's where Python stores the compiled bytecode (.pyc files). It caches them so it doesn't have to recompile unchanged files every time you run the program.

---

## Lesson 2: Set Up Your Python Editor in Monaco

### Create `src/components/PythonEditor.jsx`:

```jsx
import React, { useState } from "react"
import Editor from "@monaco-editor/react"

function PythonEditor() {
  const [code, setCode] = useState(`# Welcome to the Python Playground!
# Write Python code and click Run.

name = "World"
print(f"Hello, {name}!")

# Try some Python magic
numbers = [1, 2, 3, 4, 5]
squared = [n ** 2 for n in numbers]
print("Squared:", squared)

# Dictionary
student = {"name": "Alice", "grade": 92}
print(f"{student['name']} scored {student['grade']}")
`)
  const [output, setOutput] = useState("")

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Editor Area */}
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="python"
          value={code}
          onChange={(value) => setCode(value ?? "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            wordWrap: "on",
            automaticLayout: true,
            suggestOnTriggerCharacters: true,
            bracketPairColorization: { enabled: true },
            lineNumbers: "on",
            tabSize: 4,
            insertSpaces: true,
          }}
        />
      </div>

      {/* Run Button */}
      <button
        onClick={() => setOutput("Compilation will work after Lesson 5!")}
        style={{
          padding: "12px 24px",
          margin: "10px",
          backgroundColor: "#3776ab",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          alignSelf: "flex-start",
        }}
      >
        ▶ Run Python
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
        {output || "Click 'Run Python' to see output here..."}
      </pre>
    </div>
  )
}

export default PythonEditor
```

### Python-Specific Monaco Settings

| Setting | Value | Why |
|---------|-------|-----|
| `defaultLanguage` | `"python"` | Python syntax highlighting — `def`, `class`, `import`, `for`, `if`, etc. |
| `tabSize` | `4` | PEP 8 standard: 4 spaces per indent |
| `insertSpaces` | `true` | Python is indent-sensitive — tabs vs spaces matters! |

### What Monaco highlights for Python

With `defaultLanguage="python"`, Monaco understands:
- Keywords: `def`, `class`, `import`, `from`, `if`, `elif`, `else`, `for`, `while`, `try`, `except`, `with`, `return`, `yield`, `lambda`
- Built-ins: `print`, `len`, `range`, `type`, `int`, `str`, `list`, `dict`
- Decorators: `@staticmethod`, `@property`, `@classmethod`
- Strings: `"double"`, `'single'`, `"""triple"""`, `f"f-strings"`

### Try It Yourself

1. Add the component to your app
2. Type `def ` — see the keyword colored
3. Try `print(` — notice the bracket auto-complete
4. Write an f-string `f"hello {name}"` — see the syntax coloring

> **Checkpoint**: Python keywords like `def`, `class`, `import` should be colored. If yes, move on!

---

## Lesson 3: Python vs Others — Why Python Feels Different

### Indentation IS Syntax

In C, Java, and C++ — curly braces `{}` define code blocks. In Python, **indentation** does it:

```
C/C++/Java:                    Python:
if (x > 5) {                  if x > 5:
    printf("yes");                 print("yes")
    printf("big");                 print("big")
}                              # ← indentation ending = block ending
```

This is why `tabSize` and `insertSpaces` matter in your Monaco settings. Mixing tabs and spaces in Python causes `IndentationError`!

### No Semicolons, No Braces

```
C:      int x = 5;            Python:  x = 5
C:      if (x > 3) {          Python:  if x > 3:
Java:   String s = "hi";      Python:  s = "hi"
```

### Dynamic Typing

```python
# Python doesn't need type declarations
x = 5          # x is an int
x = "hello"    # now x is a string — totally fine!
x = [1, 2, 3]  # now x is a list — still fine!
```

In C, `int x = 5; x = "hello";` would crash the compiler.

### Compare the same program in all 5 languages:

**Task: Print numbers 1 to 5**

| Language | Code | Lines |
|----------|------|-------|
| C | `for (int i = 1; i <= 5; i++) { printf("%d\n", i); }` | 3+ |
| C++ | `for (int i = 1; i <= 5; i++) { cout << i << endl; }` | 3+ |
| Java | `for (int i = 1; i <= 5; i++) { System.out.println(i); }` | 5+ (needs class!) |
| JavaScript | `for (let i = 1; i <= 5; i++) console.log(i);` | 1 |
| **Python** | `for i in range(1, 6): print(i)` | **1** |

Python wins on conciseness every time.

### Try It Yourself

Type a program that creates a list and prints each element. Notice: no curly braces, no semicolons!

> **Checkpoint**: You understand why Python looks so different from C/C++. Let's connect a compiler!

---

## Lesson 4: Understanding the Python Execution Flow

Here's the full flow your Python editor will follow:

```
Step 1: User writes Python code in Monaco Editor
    ↓
Step 2: User clicks "Run"
    ↓
Step 3: Your React app sends the code to Judge0 API (or backend)
    ↓
Step 4: The server runs:  python3 script.py
    ↓
Step 5: If no errors → capture stdout
        If errors → capture stderr (traceback)
    ↓
Step 6: Send output back as JSON
    ↓
Step 7: Your React app displays it in the output panel
```

### Can we run Python in the browser like JavaScript?

**Not natively**, but there ARE options:

| Method | What It Is | Pros | Cons |
|--------|-----------|------|------|
| **Judge0 API** | Cloud compilation service | Easy, no setup | API limits, needs internet |
| **Your own backend** | Node.js server + Python installed | Full control | Need Python installed |
| **Pyodide** | Python compiled to WebAssembly | Runs in browser! | Large download (~10MB), not all libraries work |
| **Brython** | Python-to-JS transpiler | Fast startup | Limited Python support |

We'll use Judge0 (easiest) and then show the backend option.

---

## Lesson 5: Connect to a Real Python Compiler (Judge0 API)

### Replace the button handler:

```jsx
const handleRun = async () => {
  setOutput("⏳ Running your Python code...")

  try {
    const response = await fetch(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": "YOUR_API_KEY_HERE",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        body: JSON.stringify({
          source_code: code,
          language_id: 71,    // Python 3.8.1
          stdin: "",
        }),
      }
    )

    const result = await response.json()

    if (result.stderr) {
      setOutput("❌ Error:\n" + result.stderr)
    } else if (result.compile_output) {
      setOutput("⚠️ Compile Error:\n" + result.compile_output)
    } else {
      setOutput(result.stdout || "✅ Program ran with no output.")
    }
  } catch (err) {
    setOutput("❌ Network Error: " + err.message)
  }
}
```

### Language IDs — Updated for Python

| Language | Judge0 ID | Version |
|----------|-----------|---------|
| C | 50 | GCC 9.2.0 |
| C++ | 54 | GCC 9.2.0 |
| Java | 62 | OpenJDK 13.0.1 |
| JavaScript | 63 | Node.js 12 |
| **Python 3** | **71** | **Python 3.8.1** |
| Python 2 | 70 | Python 2.7.17 |

### Try It Yourself

1. Replace `YOUR_API_KEY_HERE` with your actual RapidAPI key
2. Run this program:

```python
# List comprehension
squares = [x**2 for x in range(1, 11)]
print("Squares:", squares)

# Dictionary comprehension
word = "hello"
char_count = {c: word.count(c) for c in set(word)}
print("Character count:", char_count)
```

3. **Expected output**:
```
Squares: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
Character count: {'h': 1, 'e': 1, 'l': 2, 'o': 1}
```

> **Checkpoint**: Can you run Python code and see output? If yes, your Python compiler is working!

---

## Lesson 6: Build Your Own Backend (Optional)

If you want to avoid API limits, here's the backend approach.

### Step 1: Create the server

```js
// server/server.js — add this route
const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

app.post("/api/compile/python", (req, res) => {
  const { code } = req.body
  const filename = `python_${crypto.randomBytes(8).toString("hex")}.py`
  const filePath = path.join(__dirname, "temp", filename)

  try {
    // Ensure temp directory exists
    fs.mkdirSync(path.join(__dirname, "temp"), { recursive: true })

    // Write the Python file
    fs.writeFileSync(filePath, code)

    // Run it with a timeout
    const output = execSync(`python3 "${filePath}"`, {
      timeout: 10000,   // 10 second timeout
      encoding: "utf-8",
    })

    res.json({ output })
  } catch (err) {
    res.json({
      error: err.stderr || err.message || "Unknown error",
    })
  } finally {
    // Clean up the temp file
    try { fs.unlinkSync(filePath) } catch {}
  }
})
```

### Step 2: Update the frontend

```jsx
const handleRun = async () => {
  setOutput("⏳ Running...")

  try {
    const res = await fetch("http://localhost:3001/api/compile/python", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
    const data = await res.json()

    if (data.error) {
      setOutput("❌ Error:\n" + data.error)
    } else {
      setOutput(data.output || "✅ No output.")
    }
  } catch (err) {
    setOutput("❌ Connection Error: " + err.message)
  }
}
```

### Security Warning

> **Never run untrusted Python code on a production server!**
> Python has `os.system()`, `subprocess`, `shutil.rmtree()` — a malicious user could destroy your system.
> For production, use Docker containers with resource limits.

---

## Lesson 7: Python Features — Practice Programs

### Program 1: Lists and List Comprehensions

```python
# Basic list operations
fruits = ["apple", "banana", "cherry", "date", "elderberry"]
print("Original:", fruits)
print("First three:", fruits[:3])
print("Reversed:", fruits[::-1])

# List comprehension — Python's superpower
lengths = [len(f) for f in fruits]
print("Lengths:", lengths)

# Filtered comprehension
long_fruits = [f for f in fruits if len(f) > 5]
print("Long names:", long_fruits)
```

### Program 2: Dictionaries and JSON-like Data

```python
students = [
    {"name": "Alice", "grade": 92, "subject": "Math"},
    {"name": "Bob", "grade": 78, "subject": "Science"},
    {"name": "Charlie", "grade": 95, "subject": "Math"},
    {"name": "Diana", "grade": 88, "subject": "Science"},
]

# Filter honor students
honors = [s for s in students if s["grade"] >= 90]
print("Honor roll:")
for s in honors:
    print(f"  {s['name']}: {s['grade']}")

# Group by subject
from collections import defaultdict
by_subject = defaultdict(list)
for s in students:
    by_subject[s["subject"]].append(s["name"])
print("\nBy subject:", dict(by_subject))
```

### Program 3: Classes and OOP

```python
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance  # _ means "private by convention"

    def deposit(self, amount):
        if amount > 0:
            self._balance += amount
            print(f"Deposited ${amount}. New balance: ${self._balance}")

    def withdraw(self, amount):
        if amount > self._balance:
            print(f"Insufficient funds! Balance: ${self._balance}")
        else:
            self._balance -= amount
            print(f"Withdrew ${amount}. New balance: ${self._balance}")

    def __str__(self):
        return f"Account({self.owner}, ${self._balance})"

# Use it
acc = BankAccount("Alice", 1000)
acc.deposit(500)
acc.withdraw(200)
acc.withdraw(2000)
print(acc)
```

**Expected output**:
```
Deposited $500. New balance: $1500
Withdrew $200. New balance: $1300
Insufficient funds! Balance: $1300
Account(Alice, $1300)
```

### Program 4: Error Handling

```python
def safe_divide(a, b):
    try:
        result = a / b
        return result
    except ZeroDivisionError:
        return "Cannot divide by zero!"
    except TypeError:
        return "Invalid types for division!"

print(safe_divide(10, 3))       # 3.333...
print(safe_divide(10, 0))       # Cannot divide by zero!
print(safe_divide("10", 3))     # Invalid types!
```

### Program 5: Decorators (Advanced Python Magic)

```python
import time

def timer(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.4f} seconds")
        return result
    return wrapper

@timer
def slow_sum(n):
    return sum(range(n))

result = slow_sum(1000000)
print(f"Sum: {result}")
```

### Debug Common Python Errors

**Bug 1: IndentationError**
```python
def greet(name):
print("Hello", name)    # ← Not indented!
```
**Fix**: Indent the body with 4 spaces.

**Bug 2: NameError**
```python
print(message)    # ← Variable doesn't exist yet!
message = "Hello"
```
**Fix**: Define variables before using them.

**Bug 3: TypeError**
```python
age = 25
print("I am " + age + " years old")    # ← Can't add string + int!
```
**Fix**: Use `str(age)` or f-strings: `f"I am {age} years old"`

---

## Course Summary

### What You Learned

| Lesson | Topic | Key Takeaway |
|--------|-------|-------------|
| 1 | How Python executes | Compiles to bytecode → PVM interprets it (not truly "interpreted") |
| 2 | Monaco Python editor | `defaultLanguage="python"`, `tabSize: 4`, `insertSpaces: true` |
| 3 | Python vs others | No braces, no semicolons, dynamic typing, indentation = syntax |
| 4 | Execution flow | Code → Judge0/Backend → Python3 → stdout/stderr → display |
| 5 | Judge0 connection | `language_id: 71` for Python 3 |
| 6 | Own backend | Node.js + `python3` command, sandbox with Docker |
| 7 | Python features | List comprehensions, OOP, decorators, error handling |

### What to Build Next

- [ ] Add an `input()` support — add a stdin textbox for user input
- [ ] Show execution time from Judge0 response
- [ ] Add a dropdown with preloaded Python examples
- [ ] Support `pip install` for libraries like `numpy`, `pandas`
- [ ] Add Python-specific IntelliSense with common built-in functions
