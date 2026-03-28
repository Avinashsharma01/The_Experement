import React, { useState } from "react"
import Editor from "@monaco-editor/react"

function JsEditor() {
  const [code, setCode] = useState(`// Welcome to the JavaScript Playground!
// Write any JS code and click Run.

console.log("Hello, JavaScript! This is a simple editor built with React and Monaco Editor.");
`)
  const [output, setOutput] = useState("")


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
        onClick={() => handleRun()}
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