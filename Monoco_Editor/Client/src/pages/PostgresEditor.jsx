import React, { useState } from "react"
import Editor from "@monaco-editor/react"

function PostgresEditor() {
  const [sql, setSql] = useState(`-- Welcome to the PostgreSQL Editor!
-- Write your queries below.

-- Example: Create a table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    grade INTEGER CHECK (grade >= 0 AND grade <= 100),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example: Insert data
INSERT INTO students (name, grade) VALUES
    ('Alice', 92),
    ('Bob', 78),
    ('Charlie', 95),
    ('Diana', 63);

-- Example: Query with conditions
SELECT name, grade
FROM students
WHERE grade >= 80
ORDER BY grade DESC;
`)
  const [output, setOutput] = useState("")

  const handleExecute = async () => {
  if (!sql.trim()) {
    setOutput("⚠️ Write a query first!")
    return
  }

  setOutput("⏳ Running query...")

  try {
    const res = await fetch("http://localhost:3000/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: sql }),
    })

    const data = await res.json()

    if (data.error) {
      setOutput("❌ Error: " + data.error)
    } else if (data.rows && data.rows.length > 0) {
      // Format results as a table
      const header = data.fields.join(" | ")
      const separator = data.fields.map(c => "-".repeat(c.length)).join("-+-")
      const rows = data.rows.map(row =>
        data.fields.map(col => String(row[col] ?? "NULL")).join(" | ")
      )
      setOutput([header, separator, ...rows].join("\n"))
    } else {
      setOutput("✅ " + (data.message || "Query executed successfully."))
    }
  } catch (err) {
    setOutput("❌ Connection error: " + err.message +
      "\n\nMake sure your backend server is running on port 3005.")
  }
}

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <h2 style={{ color: "#fff", padding: "10px" }}>PostgreSQL Editor</h2>

      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="sql"          // ← SQL mode
          value={sql}
          onChange={(value) => setSql(value ?? "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            wordWrap: "on",
            automaticLayout: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
          }}
        />
      </div>

      <button
        onClick={() => handleExecute()}
        style={{
          padding: "12px 24px",
          margin: "10px",
          backgroundColor: "#336791",     // PostgreSQL blue!
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          alignSelf: "flex-start",
        }}
      >
        ▶ Run Query
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
        {output || "Query results will appear here..."}
      </pre>
    </div>
  )
}

export default PostgresEditor