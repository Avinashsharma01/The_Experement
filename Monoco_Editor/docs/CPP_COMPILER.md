# Self-Learning Course: Build a C++ Compiler in the Browser

> **Course Goal**: By the end of this course, you will understand how C++ builds on C, what makes it different, and you'll build a browser-based C++ code editor + compiler using Monaco Editor.
>
> **Prerequisites**: Complete the C Compiler course first (or understand the basics of Monaco Editor + React).
>
> **Time**: ~40 minutes, 6 lessons

---

## Lesson 1: What Makes C++ Different from C?

You already know how C compilation works (4 stages). C++ uses the **same pipeline** but adds extra complexity at each stage.

### C++ = C + These Features

```
C Language
│
├── + Classes and Objects          (OOP)
├── + Templates                    (Generic Programming)
├── + Standard Template Library    (STL: vector, map, string, etc.)
├── + Exception Handling           (try/catch)
├── + Namespaces                   (std::, custom::)
├── + Operator Overloading         (+, -, << can work on your types)
├── + Smart Pointers               (auto memory management)
└── + Lambda Functions             (inline anonymous functions)
```

### What happens differently during compilation?

| Stage | C | C++ Extra Work |
|-------|---|---------------|
| Preprocessor | `#include <stdio.h>` | `#include <iostream>` (much bigger headers!) |
| Compiler | Translate C to assembly | **Name mangling**: encodes function names to support overloading |
| Assembler | Same | Same |
| Linker | Link C library | Link C++ standard library (libstdc++) |

### What is "Name Mangling"?

In C, you can only have ONE function named `add`. In C++, you can have many:

```cpp
int add(int a, int b);         // internally becomes: _Z3addii
double add(double a, double b); // internally becomes: _Z3adddd
int add(int a, int b, int c);   // internally becomes: _Z3addiii
```

The compiler **mangles** (renames) each one internally so the linker can tell them apart. This is called **function overloading** — a C++ superpower that C doesn't have.

### Quick Check

> **Question**: Why can't you have two functions with the same name in C?
>
> **Answer**: Because C doesn't do name mangling. The linker would see two functions with the same name and not know which one to use.

---

## Lesson 2: Set Up Your C++ Editor

Let's build it. Pay attention to the differences from the C editor — they're small but important.

### Create `src/components/CppEditor.jsx`:

```jsx
import React, { useState } from "react"
import Editor from "@monaco-editor/react"

function CppEditor() {
  // Notice: C++ uses iostream, not stdio.h
  const [code, setCode] = useState(`#include <iostream>
using namespace std;

int main() {
    cout << "Hello, C++!" << endl;
    return 0;
}`)
  const [output, setOutput] = useState("")

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <h2 style={{ color: "#fff", padding: "10px" }}>C++ Compiler</h2>

      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="cpp"       // ← "cpp" not "c" !
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

      <button
        onClick={() => setOutput("Connect compiler in Lesson 4!")}
        style={{
          padding: "12px 24px",
          margin: "10px",
          backgroundColor: "#007bff",
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

export default CppEditor
```

### The Key Difference from the C Editor

| Setting | C Editor | C++ Editor |
|---------|----------|-----------|
| `defaultLanguage` | `"c"` | `"cpp"` |
| What changes? | C keywords highlighted | C++ keywords added: `class`, `namespace`, `template`, `cout`, `endl`, etc. |

### Try It Yourself

1. Add this component to your app
2. Notice that `cout`, `endl`, `namespace` are highlighted — those wouldn't be highlighted in `"c"` mode
3. Try typing `std::` and see if autocomplete triggers

> **Checkpoint**: Is `cout` highlighted as a keyword? If yes, your C++ editor is working!

---

## Lesson 3: C vs C++ — See the Same Program in Both Languages

The best way to understand C++ is to compare the SAME program written in both languages side by side.

### Example 1: Hello World

**C version:**
```c
#include <stdio.h>

int main() {
    printf("Hello!\n");
    return 0;
}
```

**C++ version:**
```cpp
#include <iostream>

int main() {
    std::cout << "Hello!" << std::endl;
    return 0;
}
```

What changed?
- `stdio.h` → `iostream`
- `printf()` → `std::cout <<`
- `\n` → `std::endl`

### Example 2: Working with strings

**C version:**
```c
#include <stdio.h>
#include <string.h>

int main() {
    char name[50] = "Alice";
    int len = strlen(name);
    printf("Name: %s, Length: %d\n", name, len);
    return 0;
}
```

**C++ version:**
```cpp
#include <iostream>
#include <string>

int main() {
    std::string name = "Alice";
    std::cout << "Name: " << name << ", Length: " << name.length() << std::endl;
    return 0;
}
```

What changed?
- `char[]` → `std::string` (way safer, auto-resizes)
- `strlen()` → `.length()` (object method)
- No buffer overflow risks!

### Try It Yourself

Type both versions in your editor (switch `defaultLanguage` between `"c"` and `"cpp"`). Notice:
- C mode doesn't highlight `cout`, `string`, or `namespace`
- C++ mode highlights everything

> **Checkpoint**: You understand the surface-level syntax differences. Now let's connect a compiler.

---

## Lesson 4: Connect the C++ Compiler

Same approach as the C course, but with `language_id: 54` for C++.

### Using Judge0 API

Replace the button handler with:

```jsx
const handleCompile = async () => {
  setOutput("⏳ Compiling C++ code...")

  try {
    const response = await fetch(
      "https://judge0-ce.p.rapidapi.com/submissions?wait=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": "YOUR_API_KEY_HERE",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        body: JSON.stringify({
          source_code: code,
          language_id: 54,     // ← 54 = C++ (GCC 9.2.0)
          stdin: "",
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

### If you're using your own backend

Change one command if you built the C backend from the previous course:

```js
// C compilation:
execSync(`gcc "${filePath}" -o "${outPath}"`)

// C++ compilation (just change gcc → g++ and add the standard flag):
execSync(`g++ "${filePath}" -o "${outPath}" -std=c++17`)
```

### What is `-std=c++17`?

| Standard | Year | Key Features Added |
|----------|------|--------------------|
| C++11 | 2011 | `auto`, lambda, `nullptr`, range-for, smart pointers |
| C++14 | 2014 | Generic lambdas, `make_unique` |
| C++17 | 2017 | `std::optional`, structured bindings, `if constexpr` |
| C++20 | 2020 | Concepts, ranges, coroutines, `<=>` operator |

### Try It Yourself

1. Connect the Judge0 API (or backend) to your CppEditor
2. Compile this program:

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> nums = {5, 3, 8, 1, 9};

    for (int n : nums) {
        std::cout << n << " ";
    }
    std::cout << std::endl;

    return 0;
}
```

3. **Expected output**: `5 3 8 1 9`

> **Checkpoint**: Does your C++ code compile and show output? If yes, you have a working C++ compiler!

---

## Lesson 5: C++ Unique Features — Practice Programs

Now let's explore what makes C++ special. **Try each program in your editor** — don't just read, actually run them!

### Program 1: Classes (OOP)

This is the biggest difference from C. C++ lets you bundle data + functions together.

```cpp
#include <iostream>
#include <string>

class Dog {
private:
    std::string name;
    int age;

public:
    // Constructor — runs when you create a Dog
    Dog(std::string n, int a) : name(n), age(a) {}

    // Method
    void bark() {
        std::cout << name << " says: Woof! (age " << age << ")" << std::endl;
    }
};

int main() {
    Dog rex("Rex", 3);
    Dog luna("Luna", 5);

    rex.bark();    // Rex says: Woof! (age 3)
    luna.bark();   // Luna says: Woof! (age 5)

    return 0;
}
```

**What you should understand**: `class` groups data (`name`, `age`) with behavior (`bark()`). That's **Object-Oriented Programming**. C can't do this.

### Program 2: Templates (Write Once, Works with Any Type)

```cpp
#include <iostream>
#include <string>

template <typename T>
T getMax(T a, T b) {
    return (a > b) ? a : b;
}

int main() {
    std::cout << "Max int: " << getMax(10, 20) << std::endl;        // 20
    std::cout << "Max double: " << getMax(3.14, 2.71) << std::endl; // 3.14
    std::cout << "Max char: " << getMax('a', 'z') << std::endl;     // z

    return 0;
}
```

**What you should understand**: `template <typename T>` means "this function works with any type." The compiler generates separate versions for `int`, `double`, `char` automatically.

### Program 3: STL Containers (Built-in Data Structures)

```cpp
#include <iostream>
#include <vector>
#include <map>
#include <algorithm>

int main() {
    // Vector = resizable array (way better than C arrays)
    std::vector<int> nums = {5, 2, 8, 1, 9, 3};
    std::sort(nums.begin(), nums.end());

    std::cout << "Sorted: ";
    for (int n : nums) std::cout << n << " ";
    std::cout << std::endl;
    // Output: 1 2 3 5 8 9

    // Map = key-value pairs (like a dictionary)
    std::map<std::string, int> ages;
    ages["Alice"] = 25;
    ages["Bob"] = 30;
    ages["Charlie"] = 22;

    for (auto& [name, age] : ages) {
        std::cout << name << " is " << age << std::endl;
    }

    return 0;
}
```

**What you should understand**: STL saves you from building your own data structures. `vector` replaces C arrays, `map` replaces manual hash tables.

### Program 4: Smart Pointers (Automatic Memory Management)

```cpp
#include <iostream>
#include <memory>

class Resource {
public:
    Resource() { std::cout << "Resource created!" << std::endl; }
    ~Resource() { std::cout << "Resource destroyed!" << std::endl; }
    void use() { std::cout << "Resource in use..." << std::endl; }
};

int main() {
    // unique_ptr: automatically deletes when it goes out of scope
    {
        auto ptr = std::make_unique<Resource>();
        ptr->use();
    }
    // ← Resource is automatically destroyed here! No memory leak!

    std::cout << "After the block" << std::endl;

    return 0;
}
```

**Expected output**:
```
Resource created!
Resource in use...
Resource destroyed!
After the block
```

**Key insight**: In C, you must manually `free()` memory. In C++, `unique_ptr` does it for you. No memory leaks!

---

## Lesson 6: Debug Common C++ Errors

Learning to **read compiler errors** is one of the most important programming skills. Try these broken programs, read the error, then fix them.

### Bug 1: Forgetting `std::`

```cpp
#include <iostream>

int main() {
    cout << "Hello" << endl;   // ← Error!
    return 0;
}
```

**Error you'll see**: `'cout' was not declared in this scope`

**Fix**: Add `std::` → `std::cout` and `std::endl`, OR add `using namespace std;` after the include.

**Why this happens**: `cout` lives inside the `std` namespace. Without telling C++ where to find it, it doesn't know what `cout` means.

### Bug 2: Wrong header included

```cpp
#include <stdio.h>   // ← C header, not C++!

int main() {
    std::cout << "Hello" << std::endl;
    return 0;
}
```

**Error**: `'cout' is not a member of 'std'`

**Fix**: Use `#include <iostream>` (the C++ way).

### Bug 3: Type mismatch with templates

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> nums = {1, 2, 3};
    nums.push_back("hello");  // ← Error! Can't add string to int vector
    return 0;
}
```

**Error**: `no matching function for call to 'push_back(const char*)'`

**Fix**: Either change the vector type to `vector<string>`, or push an `int` value.

### Try It Yourself

1. Type each broken program into your editor
2. Compile it — read the error message carefully
3. Fix the bug
4. Compile again to verify your fix works

> Don't be afraid of errors — they're the compiler **teaching you** what went wrong!

---

## Course Summary

### What You Learned

| Lesson | Topic | Key Takeaway |
|--------|-------|-------------|
| 1 | C++ vs C differences | C++ adds classes, templates, STL, smart pointers, name mangling |
| 2 | C++ Monaco editor setup | Use `defaultLanguage="cpp"` (not `"c"`) |
| 3 | Side-by-side comparison | Same program in C and C++ — syntax differences |
| 4 | Connecting the compiler | Judge0 `language_id: 54`, or backend `g++ -std=c++17` |
| 5 | C++ unique features | Classes, templates, STL containers, smart pointers |
| 6 | Debugging C++ errors | Reading and understanding compiler error messages |

### What to Build Next

- [ ] Add a dropdown to choose C++ standard (C++11, C++14, C++17, C++20)
- [ ] Show compilation warnings in yellow (not just errors)
- [ ] Add a preloaded examples dropdown selector
- [ ] Support compilation flags like `-O2`, `-Wall`
- [ ] Build a "Compare C vs C++" split-screen editor
