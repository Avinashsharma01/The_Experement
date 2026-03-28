# Building a C++ Code Compiler with Monaco Editor

## What You'll Learn

How to create a browser-based C++ code editor using Monaco Editor in React, compile the code, and display output.

---

## 1. How C++ Compilation Works

```
Source Code (.cpp)  →  Preprocessor  →  Compiler  →  Assembler  →  Linker  →  Executable
```

C++ adds these on top of C:

| Feature          | What It Means                                   |
|-----------------|--------------------------------------------------|
| Name Mangling    | Compiler encodes function names for overloading  |
| Templates        | Compiled at instantiation time (not runtime)     |
| STL              | Standard Template Library linked automatically   |
| Exception Tables | Extra data generated for try/catch               |

### Compiler Options

| Compiler | Command            | Platform        |
|----------|--------------------|-----------------|
| GCC      | `g++ file.cpp`     | Linux, macOS    |
| Clang    | `clang++ file.cpp` | Linux, macOS    |
| MSVC     | `cl file.cpp`      | Windows         |

---

## 2. Create the Monaco C++ Editor Component

Create `src/components/CppEditor.jsx`:

```jsx
import React, { useState } from "react"
import Editor from "@monaco-editor/react"

const DEFAULT_CPP_CODE = `#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    cout << "Hello, C++!" << endl;

    // Vector example
    vector<int> numbers = {1, 2, 3, 4, 5};

    cout << "Numbers: ";
    for (int n : numbers) {
        cout << n << " ";
    }
    cout << endl;

    // String example
    string name = "Monaco";
    cout << "Editor: " << name << endl;

    return 0;
}`

function CppEditor() {
  const [code, setCode] = useState(DEFAULT_CPP_CODE)
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)

  const handleCompile = async () => {
    setIsRunning(true)
    setOutput("Compiling C++ code...")

    // Connect to backend or Judge0
    // language_id for C++ (GCC 9.2.0) = 54
    setOutput("⚠️ Connect a backend compiler to see real output.")
    setIsRunning(false)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <h2 style={{ color: "#fff", padding: "10px" }}>C++ Compiler</h2>

      <Editor
        height="60%"
        defaultLanguage="cpp"
        value={code}
        onChange={(value) => setCode(value ?? "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          automaticLayout: true,
          bracketPairColorization: { enabled: true },
        }}
      />

      <button
        onClick={handleCompile}
        disabled={isRunning}
        style={{
          margin: "10px",
          padding: "10px 20px",
          backgroundColor: isRunning ? "#6c757d" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: isRunning ? "not-allowed" : "pointer",
          alignSelf: "flex-start",
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

export default CppEditor
```

---

## 3. C++ vs C in Monaco

| Setting            | C            | C++          |
|-------------------|--------------|--------------|
| `defaultLanguage` | `"c"`        | `"cpp"`      |
| Syntax highlight  | C keywords   | C + classes, templates, namespaces |
| File extension    | `.c`         | `.cpp`       |

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

app.post("/api/compile/cpp", (req, res) => {
  const { code } = req.body
  const id = crypto.randomUUID()
  const filePath = path.join("/tmp", `${id}.cpp`)
  const outPath = path.join("/tmp", id)

  try {
    fs.writeFileSync(filePath, code)
    execSync(`g++ "${filePath}" -o "${outPath}" -std=c++17`, { timeout: 10000 })
    const output = execSync(`"${outPath}"`, { timeout: 5000 }).toString()
    res.json({ output })
  } catch (err) {
    res.json({ output: err.stderr?.toString() || err.message })
  } finally {
    try { fs.unlinkSync(filePath) } catch {}
    try { fs.unlinkSync(outPath) } catch {}
  }
})

app.listen(3002, () => console.log("C++ compiler server on :3002"))
```

### Important C++ Compiler Flags

| Flag          | Purpose                           |
|---------------|-----------------------------------|
| `-std=c++17`  | Use C++17 standard                |
| `-O2`         | Optimization level 2              |
| `-Wall`       | Enable all warnings               |
| `-Wextra`     | Extra warnings                    |
| `-g`          | Include debug info                |
| `-fsanitize=address` | Memory error detection      |

---

## 5. Judge0 API for C++

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
        language_id: 54,    // C++ (GCC 9.2.0)
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

## 6. C++ Concepts to Test in Your Editor

```cpp
// Classes
class Animal {
public:
    string name;
    Animal(string n) : name(n) {}
    virtual void speak() { cout << name << " makes a sound" << endl; }
};

// Inheritance
class Dog : public Animal {
public:
    Dog(string n) : Animal(n) {}
    void speak() override { cout << name << " barks!" << endl; }
};

// Templates
template <typename T>
T getMax(T a, T b) {
    return (a > b) ? a : b;
}

// Smart Pointers
#include <memory>
auto ptr = make_unique<Dog>("Rex");
ptr->speak();

// Lambda
auto square = [](int x) { return x * x; };
cout << square(5) << endl;  // 25

// STL Algorithms
#include <algorithm>
vector<int> v = {5, 2, 8, 1, 9};
sort(v.begin(), v.end());
```

---

## 7. Practice Exercises

1. **OOP**: Create a class hierarchy (Shape → Circle, Rectangle) with area calculation
2. **Templates**: Write a generic `swap` function and test with int, string, double
3. **STL**: Use `map`, `set`, and `vector` together to count word frequency
4. **Error Panel**: Show compilation errors in a separate red-themed panel
5. **C++ Standard Selector**: Add a dropdown to choose between C++11, C++14, C++17, C++20

---

## Summary

| What              | How                                         |
|-------------------|---------------------------------------------|
| Editor            | Monaco with `defaultLanguage="cpp"`         |
| Compilation       | Backend with `g++ -std=c++17` or Judge0 API |
| Language ID       | 54 (Judge0)                                 |
| Key difference    | `"cpp"` language mode, not `"c"`            |
