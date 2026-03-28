# Self-Learning Course: Build a Java Compiler in the Browser

> **Course Goal**: By the end of this course, you will understand how Java's compilation is fundamentally different from C/C++ (hint: it doesn't produce machine code!), and you'll build a browser-based Java editor + compiler using Monaco Editor.
>
> **Prerequisites**: Completed the C Compiler course. Basic React knowledge.
>
> **Time**: ~40 minutes, 6 lessons

---

## Lesson 1: Java Compiles Differently — And That's the Point

Here's the big surprise: **Java doesn't compile to machine code**. It compiles to something called **bytecode**, which runs on a virtual machine.

### C/C++ vs Java — The Key Difference

```
C/C++ compilation:
  Source Code  →  Machine Code (runs directly on YOUR computer's CPU)
  hello.c      →  hello.exe (Windows) or hello (Linux)
  ⚠️ Problem: You need to recompile for each operating system!

Java compilation:
  Source Code  →  Bytecode (runs on the JVM, which exists on EVERY OS)
  Main.java    →  Main.class (runs anywhere with Java installed)
  ✅ "Write once, run anywhere"
```

### Why did Java do this?

Imagine you write a program and want it to work on Windows, Mac, AND Linux. With C, you'd need to compile it THREE times. With Java, you compile ONCE, and the JVM on each platform handles the rest.

### The JVM — Your Program's Translator

```
Your Java Code
      │
      ▼
  javac (compiler)         ← Step 1: Compile .java → .class
      │
      ▼
  Bytecode (.class file)   ← This is NOT machine code
      │
      ▼
  JVM reads the bytecode   ← Step 2: JVM runs on any OS
      │
      ├── Class Loader      (loads your .class files)
      ├── Bytecode Verifier (checks for security issues)
      ├── JIT Compiler      (converts hot bytecode to native code for speed)
      └── Garbage Collector (automatically frees unused memory)
      │
      ▼
  Output on screen
```

### Quick Check

> **Question**: If you compile a Java program on Windows, can you run the `.class` file on a Mac?
>
> **Answer**: **Yes!** That's the whole point. The `.class` file contains bytecode, which any JVM can run — regardless of operating system.

> **Question**: What's the JIT compiler inside the JVM?
>
> **Answer**: JIT = Just-In-Time. It watches which parts of your bytecode run frequently ("hot spots") and compiles just those parts to native machine code for maximum speed. So Java starts slow but gets faster as it runs!

---

## Lesson 2: Java's Unique Rule — Filename = Class Name

Before we build the editor, there's a Java rule that surprises everyone:

### The Rule

```
If your class is:     public class HelloWorld { ... }
Your filename MUST be: HelloWorld.java (capital H, capital W — exact match!)
```

This isn't optional. If they don't match, `javac` refuses to compile.

### The Full Process

```bash
# Step 1: You write Main.java (filename MUST match class name)
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello!");
    }
}

# Step 2: Compile
javac Main.java     →  creates Main.class

# Step 3: Run (note: no .class extension!)
java Main           →  prints "Hello!"
```

### Compare entry points:

| Language | Entry Point | Notes |
|----------|------------|-------|
| C | `int main()` | Simple |
| C++ | `int main()` | Same as C |
| Java | `public static void main(String[] args)` | Must be inside a class, must be `public static` |

Every word in Java's entry point matters:
- `public` — accessible from outside
- `static` — can run without creating an object
- `void` — returns nothing
- `String[] args` — accepts command-line arguments

### Quick Check

> **Question**: You write `public class Calculator { ... }`. What MUST the filename be?
>
> **Answer**: `Calculator.java` — exact match, case-sensitive.

---

## Lesson 3: Build Your Java Editor in Monaco

### Create `src/components/JavaEditor.jsx`:

```jsx
import React, { useState } from "react"
import Editor from "@monaco-editor/react"

function JavaEditor() {
  const [code, setCode] = useState(`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");

        // Try changing this code!
        String name = "World";
        System.out.println("Welcome, " + name + "!");

        // Math
        int a = 10, b = 20;
        System.out.println(a + " + " + b + " = " + (a + b));
    }
}`)
  const [output, setOutput] = useState("")

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <h2 style={{ color: "#fff", padding: "10px" }}>Java Compiler</h2>

      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="java"        // ← Java mode
          value={code}
          onChange={(value) => setCode(value ?? "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            wordWrap: "on",
            automaticLayout: true,
            bracketPairColorization: { enabled: true },
            tabSize: 4,                   // Java convention: 4-space tabs
          }}
        />
      </div>

      <button
        onClick={() => setOutput("Connect a compiler (see Lesson 4)")}
        style={{
          padding: "12px 24px",
          margin: "10px",
          backgroundColor: "#f89820",     // Java orange!
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

export default JavaEditor
```

### What Monaco highlights for Java

With `defaultLanguage="java"`, Monaco understands:
- Keywords: `public`, `class`, `static`, `void`, `int`, `String`, `if`, `for`, `while`
- Annotations: `@Override`, `@Deprecated`
- Types: `int`, `double`, `boolean`, `String`, `List`, `Map`
- Comments: `//`, `/* */`, `/** */` (JavaDoc)

### Try It Yourself

1. Add the component, run your app
2. Type `System.out.` — notice the syntax coloring
3. Add a `for` loop and watch bracket colorization work

> **Checkpoint**: Java keywords like `public`, `class`, `static` should be colored. If yes, move on!

---

## Lesson 4: Connect the Java Compiler

### Using Judge0 API

```jsx
const handleCompile = async () => {
  setOutput("⏳ Compiling Java code...")

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
          language_id: 62,     // ← 62 = Java (OpenJDK 13.0.1)
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

### Language IDs — Updated for Java

| Language | Judge0 ID | Compiler |
|----------|-----------|----------|
| C | 50 | GCC 9.2.0 |
| C++ | 54 | GCC 9.2.0 |
| **Java** | **62** | **OpenJDK 13.0.1** |
| JavaScript | 63 | Node.js 12 |

### Try It Yourself

1. Replace the placeholder handler with the code above
2. Compile the default Java program
3. **Expected output**:
```
Hello, Java!
Welcome, World!
10 + 20 = 30
```

> **Checkpoint**: Can you see Java output? If yes, your Java compiler is working!

### Now try this — break it on purpose:

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello")    // Missing semicolon!
    }
}
```

Read the error message. It'll say something like:
```
Main.java:3: error: ';' expected
```

This tells you: **file**, **line number**, and **what's wrong**. Learn to read these!

---

## Lesson 5: What Makes Java Special — Practice Programs

Java's power comes from OOP, Collections, and built-in safety. Let's explore each with **hands-on programs you should run**.

### Program 1: Classes and Objects

Java is fully object-oriented. Everything lives inside a class.

```java
public class Main {
    // Inner class
    static class Animal {
        String name;
        int age;

        Animal(String name, int age) {
            this.name = name;
            this.age = age;
        }

        void speak() {
            System.out.println(name + " (age " + age + ") makes a sound");
        }
    }

    // Inheritance
    static class Dog extends Animal {
        Dog(String name, int age) {
            super(name, age);
        }

        @Override
        void speak() {
            System.out.println(name + " (age " + age + ") barks: Woof!");
        }
    }

    public static void main(String[] args) {
        Animal cat = new Animal("Whiskers", 3);
        Dog rex = new Dog("Rex", 5);

        cat.speak();  // Whiskers (age 3) makes a sound
        rex.speak();  // Rex (age 5) barks: Woof!
    }
}
```

**What you should understand**:
- `extends` = inheritance (Dog IS an Animal)
- `@Override` = this method replaces the parent's version
- `super(name, age)` = call the parent's constructor

### Program 2: Collections (ArrayList, HashMap)

Java has powerful built-in data structures:

```java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ArrayList = resizable array (like C++ vector)
        List<String> fruits = new ArrayList<>();
        fruits.add("Apple");
        fruits.add("Banana");
        fruits.add("Cherry");

        System.out.println("All fruits: " + fruits);    // [Apple, Banana, Cherry]
        System.out.println("First: " + fruits.get(0));   // Apple
        System.out.println("Count: " + fruits.size());   // 3

        // HashMap = key-value store (like C++ map)
        Map<String, Integer> scores = new HashMap<>();
        scores.put("Math", 95);
        scores.put("Science", 88);
        scores.put("English", 92);

        for (Map.Entry<String, Integer> entry : scores.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
    }
}
```

**What you should understand**:
- `List<String>` = a list that only holds strings (type safety!)
- `Map<String, Integer>` = maps strings to numbers
- Java enforces types — you can't accidentally add a number to a `List<String>`

### Program 3: Exception Handling (Crash-Proof Code)

```java
public class Main {
    public static void main(String[] args) {
        try {
            int result = 10 / 0;  // This will crash!
            System.out.println("Result: " + result);
        } catch (ArithmeticException e) {
            System.out.println("Caught error: " + e.getMessage());
        } finally {
            System.out.println("This ALWAYS runs, error or not.");
        }

        System.out.println("Program continues normally!");
    }
}
```

**Expected output**:
```
Caught error: / by zero
This ALWAYS runs, error or not.
Program continues normally!
```

**What you should understand**: Without `try/catch`, dividing by zero crashes your program. With it, you **handle** the error gracefully.

### Program 4: Streams (Modern Java Magic)

Java 8+ introduced streams — a functional way to process data:

```java
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

        // Filter even numbers, double them, sum the result
        int result = numbers.stream()
            .filter(n -> n % 2 == 0)       // Keep even: 2, 4, 6, 8, 10
            .map(n -> n * 2)               // Double:    4, 8, 12, 16, 20
            .reduce(0, Integer::sum);      // Sum:       60

        System.out.println("Result: " + result);  // 60

        // Print each step to see what's happening
        System.out.println("\nStep by step:");
        numbers.stream()
            .filter(n -> n % 2 == 0)
            .map(n -> n * 2)
            .forEach(n -> System.out.println("  " + n));
    }
}
```

**What you should understand**: Streams let you **chain** operations on data, like an assembly line. Each step passes its result to the next.

---

## Lesson 6: Common Java Mistakes — Debug Practice

### Bug 1: Class name doesn't match

```java
public class MyProgram {        // ← Class name is "MyProgram"
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}
// But saved as Main.java       ← Filename is "Main"
```

**Error**: `class MyProgram is public, should be declared in a file named MyProgram.java`

**Fix**: Either rename the file to `MyProgram.java` or rename the class to `Main`.

> In Judge0, the class MUST be named `Main` because they save it as `Main.java`.

### Bug 2: Forgetting `static` in main

```java
public class Main {
    public void main(String[] args) {   // ← Missing 'static'!
        System.out.println("Hello");
    }
}
```

**Error**: `Main method not found in class Main`

**Fix**: Add `static` → `public static void main(String[] args)`

**Why**: Without `static`, Java would need to create an object of `Main` before it can call `main()`. But who creates that first object? It's a chicken-and-egg problem. `static` means "you can call this without an object."

### Bug 3: Using `==` to compare strings

```java
public class Main {
    public static void main(String[] args) {
        String a = new String("hello");
        String b = new String("hello");

        if (a == b) {
            System.out.println("Equal!");     // This WON'T print!
        } else {
            System.out.println("Not equal!"); // This WILL print!
        }

        // Correct way:
        if (a.equals(b)) {
            System.out.println("Actually equal!");  // This prints!
        }
    }
}
```

**Why**: In Java, `==` compares **memory addresses** (are these the same object?), not values. `.equals()` compares the actual content.

This is one of the most common Java bugs. Always use `.equals()` for strings!

### Try It Yourself

Run each buggy program. Read the error. Fix it. Run again. This is how real developers learn!

---

## Course Summary

### What You Learned

| Lesson | Topic | Key Takeaway |
|--------|-------|-------------|
| 1 | Java vs C/C++ compilation | Java compiles to bytecode → JVM, not machine code |
| 2 | The filename rule | Filename MUST match public class name |
| 3 | Monaco Java editor | `defaultLanguage="java"`, `tabSize: 4` |
| 4 | Connecting compiler | Judge0 `language_id: 62` |
| 5 | Java's special features | OOP, Collections, Exceptions, Streams |
| 6 | Debugging Java | String comparison, `static main`, class naming |

### What to Build Next

- [ ] Add a "Java version" dropdown (Java 8 vs 11 vs 17)
- [ ] Support `Scanner` for user input (add a stdin text box)
- [ ] Highlight the error line in the editor when compilation fails
- [ ] Add preloaded Java example programs as a dropdown
- [ ] Show compilation time and memory usage from Judge0 response
