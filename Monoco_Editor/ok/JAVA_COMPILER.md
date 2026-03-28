# Building a Java Compiler with Monaco Editor

## What You'll Learn

How to create a browser-based Java code editor using Monaco Editor in React, compile and run Java code, and display output.

---

## 1. How Java Compilation Works

```
Source Code (.java)  →  javac (Compiler)  →  Bytecode (.class)  →  JVM (Runtime)  →  Output
```

### Key Difference from C/C++

| Aspect       | C/C++                     | Java                          |
|-------------|---------------------------|-------------------------------|
| Compiles to | Machine code (native)     | Bytecode (.class files)       |
| Runs on     | OS directly               | JVM (Java Virtual Machine)    |
| Portable?   | Recompile per platform    | "Write once, run anywhere"    |
| Entry point | `int main()`              | `public static void main(String[] args)` |

### The JVM Architecture

```
Your Java Code
      │
      ▼
  javac compiler
      │
      ▼
  Bytecode (.class)
      │
      ▼
  ┌─────────────────────────┐
  │         JVM              │
  │  ┌───────────────────┐  │
  │  │  Class Loader      │  │
  │  ├───────────────────┤  │
  │  │  Bytecode Verifier │  │
  │  ├───────────────────┤  │
  │  │  JIT Compiler      │  │ ← Converts bytecode to native at runtime
  │  ├───────────────────┤  │
  │  │  Garbage Collector │  │
  │  └───────────────────┘  │
  └─────────────────────────┘
      │
      ▼
   Output
```

---

## 2. Create the Monaco Java Editor Component

Create `src/components/JavaEditor.jsx`:

```jsx
import React, { useState } from "react"
import Editor from "@monaco-editor/react"

const DEFAULT_JAVA_CODE = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");

        // Array example
        int[] numbers = {10, 20, 30, 40, 50};

        System.out.print("Numbers: ");
        for (int n : numbers) {
            System.out.print(n + " ");
        }
        System.out.println();

        // String methods
        String text = "Monaco Editor";
        System.out.println("Upper: " + text.toUpperCase());
        System.out.println("Length: " + text.length());
    }
}`

function JavaEditor() {
  const [code, setCode] = useState(DEFAULT_JAVA_CODE)
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)

  const handleCompile = async () => {
    setIsRunning(true)
    setOutput("Compiling Java code...")

    // Connect to backend or Judge0
    // language_id for Java (OpenJDK 13) = 62
    setOutput("⚠️ Connect a backend compiler to see real output.")
    setIsRunning(false)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <h2 style={{ color: "#fff", padding: "10px" }}>Java Compiler</h2>

      <Editor
        height="60%"
        defaultLanguage="java"
        value={code}
        onChange={(value) => setCode(value ?? "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          automaticLayout: true,
          bracketPairColorization: { enabled: true },
          tabSize: 4,
        }}
      />

      <button
        onClick={handleCompile}
        disabled={isRunning}
        style={{
          margin: "10px",
          padding: "10px 20px",
          backgroundColor: isRunning ? "#6c757d" : "#f89820",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: isRunning ? "not-allowed" : "pointer",
          alignSelf: "flex-start",
          fontWeight: "bold",
        }}
      >
        {isRunning ? "⏳ Compiling..." : "▶ Compile & Run"}
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
          fontFamily: "Consolas, monospace",
        }}
      >
        {output || "Output will appear here..."}
      </pre>
    </div>
  )
}

export default JavaEditor
```

---

## 3. Monaco Settings for Java

```jsx
defaultLanguage="java"    // Java syntax highlighting
```

Java-specific considerations:

| Feature               | Monaco Support                              |
|-----------------------|---------------------------------------------|
| Syntax highlighting   | Full (keywords, types, annotations)         |
| Auto-indent           | Yes (4-space convention)                    |
| Bracket matching      | Yes                                         |
| Code folding          | Yes (classes, methods, imports)             |
| IntelliSense          | Basic (no type inference without LSP)       |

---

## 4. Backend Compilation (Node.js Example)

```js
// server.js
const express = require("express")
const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

const app = express()
app.use(express.json())

app.post("/api/compile/java", (req, res) => {
  const { code } = req.body
  const id = crypto.randomUUID()
  const dir = path.join("/tmp", id)

  try {
    fs.mkdirSync(dir)

    // Java requires filename = class name
    // Extract public class name from code
    const classMatch = code.match(/public\s+class\s+(\w+)/)
    const className = classMatch ? classMatch[1] : "Main"
    const filePath = path.join(dir, `${className}.java`)

    fs.writeFileSync(filePath, code)

    // Compile
    execSync(`javac "${filePath}"`, { timeout: 15000, cwd: dir })

    // Run
    const output = execSync(`java ${className}`, {
      timeout: 5000,
      cwd: dir,
    }).toString()

    res.json({ output })
  } catch (err) {
    res.json({ output: err.stderr?.toString() || err.message })
  } finally {
    // Clean up
    try { fs.rmSync(dir, { recursive: true }) } catch {}
  }
})

app.listen(3003, () => console.log("Java compiler server on :3003"))
```

### Java Gotcha: Filename Must Match Class Name

```
public class HelloWorld { ... }
→ Must be saved as HelloWorld.java
→ Compiles to HelloWorld.class
→ Run with: java HelloWorld
```

---

## 5. Judge0 API for Java

```js
const handleCompile = async () => {
  setIsRunning(true)
  setOutput("Compiling...")

  const response = await fetch(
    "https://judge0-ce.p.rapidapi.com/submissions?wait=true",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": "YOUR_API_KEY",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: JSON.stringify({
        source_code: code,
        language_id: 62,   // Java (OpenJDK 13.0.1)
        stdin: "",
      }),
    }
  )

  const data = await response.json()
  setOutput(data.stdout || data.stderr || data.compile_output || "No output")
  setIsRunning(false)
}
```

---

## 6. Java Concepts to Test in Your Editor

```java
// Collections
import java.util.*;

List<String> names = new ArrayList<>(Arrays.asList("Alice", "Bob", "Charlie"));
names.forEach(System.out::println);

// HashMap
Map<String, Integer> scores = new HashMap<>();
scores.put("Math", 95);
scores.put("Science", 88);
scores.forEach((k, v) -> System.out.println(k + ": " + v));

// OOP
class Animal {
    String name;
    Animal(String name) { this.name = name; }
    void speak() { System.out.println(name + " makes a sound"); }
}

class Dog extends Animal {
    Dog(String name) { super(name); }
    @Override
    void speak() { System.out.println(name + " barks!"); }
}

// Streams
List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5);
int sum = nums.stream().filter(n -> n % 2 == 0).mapToInt(Integer::intValue).sum();
System.out.println("Even sum: " + sum);  // 6

// Try-catch
try {
    int result = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("Error: " + e.getMessage());
}
```

---

## 7. Practice Exercises

1. **Hello World**: Modify the default code to accept user input via `Scanner`
2. **OOP Design**: Build a Student class with name, grade, and a method to check pass/fail
3. **Collections**: Create a program that sorts a list of names alphabetically
4. **Error Handling**: Add try-catch for compilation errors and display them nicely
5. **Package Support**: Let users define package names and handle the directory structure

---

## Summary

| What              | How                                           |
|-------------------|-----------------------------------------------|
| Editor            | Monaco with `defaultLanguage="java"`          |
| Compilation       | Backend with `javac` + `java` or Judge0 API   |
| Language ID       | 62 (Judge0)                                   |
| Key gotcha        | Filename must match public class name         |
| Two-step process  | Compile (javac) → Run (java)                  |
