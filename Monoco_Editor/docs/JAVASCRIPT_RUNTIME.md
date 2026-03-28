# Self-Learning Course: Build a JavaScript Runtime in the Browser

> **Course Goal**: By the end of this course, you will build a JavaScript playground that runs code **directly in the browser** — no backend, no API key, no setup. You'll also understand how JS execution differs from compiled languages.
>
> **Prerequisites**: Completed at least the C Compiler course. Basic React knowledge.
>
> **Time**: ~35 minutes, 6 lessons

---

## Lesson 1: JavaScript is NOT Compiled (Well, Sort Of...)

Here's what makes JavaScript completely different from C, C++, and Java:

### The Big Difference

```
C/C++:  Source Code → Compiler → Machine Code (slow to compile, fast to run)
Java:   Source Code → Compiler → Bytecode → JVM (compile step needed)
JS:     Source Code → Engine runs it directly! (no compile step for you)
```

But wait — inside the browser, there IS compilation happening. You just don't see it:

```
Your JavaScript Code
      │
      ▼
  Parser (reads your code, builds a tree structure called AST)
      │
      ▼
  Interpreter (Ignition in V8)  ← Starts running immediately
      │
      ▼
  Profiler watches... "this function runs 1000 times"
      │
      ▼
  JIT Compiler (TurboFan in V8) ← Compiles HOT code to native machine code
      │
      ▼
  Super fast execution for frequently-used code
```

### Why this matters for your editor

You DON'T need a backend. The browser itself is the runtime! This makes JavaScript the easiest language to build an editor for.

| Language | Needs Backend? | Why |
|----------|---------------|-----|
| C | Yes | Needs `gcc` to compile |
| C++ | Yes | Needs `g++` to compile |
| Java | Yes | Needs `javac` + `java` |
| **JavaScript** | **No!** | **Browser runs it directly** |

### Quick Check

> **Question**: When you write `const x = 5;` in JavaScript, is it compiled?
>
> **Answer**: Yes, internally! The V8 engine first interprets it, and if it runs many times (like inside a loop), the JIT compiler converts it to optimized machine code. But unlike C, YOU never have to trigger compilation — it happens automatically.

---

## Lesson 2: Build the JavaScript Editor

This is the simplest editor because we don't need any API or backend!

### Create `src/components/JsEditor.jsx`:

```jsx
import React, { useState } from "react"
import Editor from "@monaco-editor/react"

function JsEditor() {
  const [code, setCode] = useState(`// Welcome to the JavaScript Playground!
// Write any JS code and click Run.

console.log("Hello, JavaScript!");

const name = "World";
console.log("Welcome, " + name + "!");
`)
  const [output, setOutput] = useState("")

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <h2 style={{ color: "#fff", padding: "10px" }}>JavaScript Playground</h2>

      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="javascript"    // ← JS mode with built-in IntelliSense!
          value={code}
          onChange={(value) => setCode(value ?? "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            wordWrap: "on",
            automaticLayout: true,
            bracketPairColorization: { enabled: true },
            quickSuggestions: true,       // ← IntelliSense suggestions
          }}
        />
      </div>

      <button
        onClick={() => setOutput("We'll add execution in Lesson 3!")}
        style={{
          padding: "12px 24px",
          margin: "10px",
          backgroundColor: "#f7df1e",
          color: "#000",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          alignSelf: "flex-start",
        }}
      >
        ▶ Run
      </button>

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
        {output || "Output will appear here..."}
      </pre>
    </div>
  )
}

export default JsEditor
```

### A Bonus: Monaco has Built-In JavaScript IntelliSense!

For C, C++, and Java, Monaco only gives you syntax coloring. But for **JavaScript** (and TypeScript), Monaco includes **full IntelliSense**:

- Autocompletes `Array.`, `Math.`, `console.`, `Promise.` etc.
- Shows function signatures and parameter info
- Catches basic errors in real-time
- Understands JSDoc comments

### Try It Yourself

1. Type `Math.` in the editor — you should see autocomplete options like `Math.random()`, `Math.floor()`, etc.
2. Type `console.` — you should see `log`, `error`, `warn`, etc.
3. Try typing `const x: number = 5;` — Monaco will warn you that TypeScript syntax doesn't belong in JS mode!

> **Checkpoint**: Does IntelliSense work? Can you see `Math.` suggestions? If yes, move on!

---

## Lesson 3: Execute JavaScript — The Magic Part

Here's where JS is special. We can run code directly in the browser. No API call needed!

### How it works:

```
Step 1: User writes code in Monaco Editor
    ↓
Step 2: User clicks "Run"
    ↓
Step 3: We wrap the code in:  new Function(code)
    ↓
Step 4: We intercept console.log to capture output
    ↓
Step 5: We call fn()  ← The browser RUNS IT!
    ↓
Step 6: We display captured output
```

### Replace the button handler with this:

```jsx
const handleRun = () => {
  // Step 1: Prepare to capture console output
  const logs = []
  const originalLog = console.log
  const originalError = console.error

  // Step 2: Override console.log to capture output
  console.log = (...args) => {
    logs.push(
      args.map(a =>
        typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)
      ).join(" ")
    )
  }
  console.error = (...args) => {
    logs.push("❌ " + args.map(String).join(" "))
  }

  try {
    // Step 3: Create and run the user's code
    const fn = new Function(code)
    fn()
  } catch (err) {
    // Step 4: Catch any runtime errors
    logs.push(`❌ Error: ${err.message}`)
  } finally {
    // Step 5: Restore original console (important!)
    console.log = originalLog
    console.error = originalError
  }

  // Step 6: Display output
  setOutput(logs.join("\n") || "No output. Use console.log() to see results.")
}
```

### Why `new Function()` instead of `eval()`?

| Method | Safety | How It Works |
|--------|--------|-------------|
| `eval(code)` | Dangerous | Runs in the current scope — can access/modify YOUR variables |
| `new Function(code)` | Safer | Runs in its own scope — can't see your React state or variables |
| `iframe` sandbox | Safest | Runs in a completely separate environment |

We use `new Function()` because it's a good balance of simplicity and safety.

### Try It Yourself

1. Write this code in the editor:

```js
console.log("Hello!");

const nums = [1, 2, 3, 4, 5];
const doubled = nums.map(n => n * 2);
console.log("Doubled:", doubled);

const sum = nums.reduce((a, b) => a + b, 0);
console.log("Sum:", sum);
```

2. Click "Run"
3. **Expected output**:
```
Hello!
Doubled: [2, 4, 6, 8, 10]
Sum: 15
```

### Now try an error:

```js
const x = 10;
console.log(y);   // y is not defined!
```

You should see: `❌ Error: y is not defined`

> **Checkpoint**: Can you run JS code and see output? If yes, amazing — you just built a working JS playground without any backend!

---

## Lesson 4: Add a Clear Button and Improve UX

Let's make the playground feel more professional.

### Updated component with better UX:

```jsx
const handleClear = () => {
  setOutput("")
}

// In your JSX, replace the single button with:
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
      fontSize: "16px",
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
      fontSize: "16px",
    }}
  >
    Clear Output
  </button>
</div>
```

### Try It Yourself

1. Run some code — see output
2. Click "Clear Output" — output disappears
3. Run again — fresh output

---

## Lesson 5: JavaScript Concepts — Practice Programs

The best way to learn JS is to experiment. **Run each program and predict the output BEFORE looking at the answer.**

### Program 1: Closures (Tricky!)

```js
function createCounter() {
  let count = 0;  // This variable is "closed over"

  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
  };
}

const counter = createCounter();
counter.increment();
counter.increment();
counter.increment();
counter.decrement();

console.log("Count:", counter.getCount());
```

**Predict the output before running!**

<details>
<summary>Click to see answer</summary>

```
Count: 2
```
The `count` variable lives inside `createCounter` but is accessible through the returned functions. This is a **closure** — the inner functions "remember" the outer variable.
</details>

### Program 2: Promises (Async Basics)

```js
console.log("1. Start");

const promise = new Promise((resolve) => {
  console.log("2. Inside promise constructor");
  resolve("done");
});

promise.then((value) => {
  console.log("4. Promise resolved with:", value);
});

console.log("3. End");
```

**Predict the order!**

<details>
<summary>Click to see answer</summary>

```
1. Start
2. Inside promise constructor
3. End
4. Promise resolved with: done
```
The `.then()` callback runs AFTER all synchronous code finishes. This is called the **event loop**.

Note: In our playground, the order of step 4 might differ slightly since `new Function()` runs synchronously, but the concept is the same.
</details>

### Program 3: Destructuring and Spread

```js
// Object destructuring
const user = { name: "Alice", age: 25, city: "NYC" };
const { name, ...rest } = user;

console.log("Name:", name);
console.log("Rest:", rest);

// Array spread
const arr1 = [1, 2, 3];
const arr2 = [0, ...arr1, 4, 5];
console.log("Combined:", arr2);

// Swap variables without temp!
let a = "hello", b = "world";
[a, b] = [b, a];
console.log("Swapped:", a, b);
```

**Expected output**:
```
Name: Alice
Rest: { age: 25, city: "NYC" }
Combined: [0, 1, 2, 3, 4, 5]
Swapped: world hello
```

### Program 4: Map, Filter, Reduce Chain

```js
const students = [
  { name: "Alice", grade: 92 },
  { name: "Bob", grade: 78 },
  { name: "Charlie", grade: 95 },
  { name: "Diana", grade: 63 },
  { name: "Eve", grade: 88 },
];

// Chain: Filter passing students → get their names → join with comma
const honors = students
  .filter(s => s.grade >= 80)        // Keep grade >= 80
  .map(s => s.name)                  // Extract just names
  .join(", ");                       // Join into string

console.log("Honor roll:", honors);

// Calculate class average
const avg = students
  .map(s => s.grade)
  .reduce((sum, g) => sum + g, 0) / students.length;

console.log("Class average:", avg.toFixed(1));
```

**Expected output**:
```
Honor roll: Alice, Charlie, Eve
Class average: 83.2
```

### Program 5: Classes (ES6+)

```js
class Animal {
  constructor(name, sound) {
    this.name = name;
    this.sound = sound;
  }

  speak() {
    console.log(`${this.name} says ${this.sound}!`);
  }
}

class Dog extends Animal {
  constructor(name) {
    super(name, "Woof");
  }

  fetch(item) {
    console.log(`${this.name} fetches the ${item}!`);
  }
}

const rex = new Dog("Rex");
rex.speak();        // Rex says Woof!
rex.fetch("ball");  // Rex fetches the ball!
```

Run each one. Modify them. Break them on purpose. See what errors look like!

---

## Lesson 6: Level Up — Advanced Monaco Features for JavaScript

### Add Custom IntelliSense

Monaco lets you add your own autocomplete suggestions:

```jsx
const handleEditorMount = (editor, monaco) => {
  // Tell Monaco about your custom globals
  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    `
    /** Greets a person by name */
    declare function greet(name: string): string;

    /** The base URL for API calls */
    declare const API_URL: string;

    /** Adds two numbers */
    declare function add(a: number, b: number): number;
    `,
    "custom-globals.d.ts"
  )
}
```

Then add `onMount={handleEditorMount}` to your `<Editor>`.

Now when you type `gre` in the editor, Monaco will suggest `greet(name: string)` with the description you wrote!

### Add Keyboard Shortcut (Ctrl+Enter to Run)

```jsx
const handleEditorMount = (editor, monaco) => {
  // Ctrl+Enter or Cmd+Enter to run
  editor.addAction({
    id: "run-code",
    label: "Run Code",
    keybindings: [
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
    ],
    run: () => {
      handleRun()
    },
  })
}
```

Now you can press Ctrl+Enter to run code without clicking the button!

### Try It Yourself

1. Add `onMount={handleEditorMount}` to your Editor
2. Write some code and press Ctrl+Enter — it should run!
3. Type a custom function name you declared — see the IntelliSense suggestion?

---

## Course Summary

### What You Learned

| Lesson | Topic | Key Takeaway |
|--------|-------|-------------|
| 1 | How JS execution works | JIT-compiled by the browser engine, no explicit compilation step |
| 2 | Monaco JS editor | `defaultLanguage="javascript"`, built-in IntelliSense! |
| 3 | In-browser execution | `new Function(code)` runs code directly, no backend needed |
| 4 | Better UX | Clear button, multiple actions |
| 5 | JS concepts practice | Closures, promises, destructuring, classes |
| 6 | Advanced Monaco features | Custom IntelliSense, keyboard shortcuts |

### JS vs Other Languages — Final Comparison

| Feature | C | C++ | Java | **JavaScript** |
|---------|---|-----|------|-------------|
| Backend needed? | Yes | Yes | Yes | **No!** |
| IntelliSense in Monaco? | Basic | Basic | Basic | **Full** |
| Compilation step? | gcc | g++ | javac | **None** |
| Runs in browser? | No | No | No | **Yes** |
| Learning curve for editor? | Medium | Medium | Medium | **Easy** |

### What to Build Next

- [ ] Auto-run code as you type (with a debounce delay)
- [ ] Support `console.table()` with an HTML table renderer
- [ ] Highlight the error line when code throws an exception
- [ ] Add tabs for multiple files
- [ ] Save code to `localStorage` so it survives page refresh
- [ ] Add a "Share" button that encodes code in the URL
