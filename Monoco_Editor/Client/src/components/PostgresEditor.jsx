import React, { useState, useRef } from "react"
import Editor from "@monaco-editor/react"

const DEFAULT_SQL = `-- PostgreSQL Query Editor
-- Try these example queries:

-- Create a table
CREATE TABLE IF NOT EXISTS employeesMM (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50),
    salary NUMERIC(10, 2),
    hired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert data
INSERT INTO employeesMM (name, department, salary) VALUES
    ('Alice Johnson', 'Engineering', 95000.00),
    ('Bob Smith', 'Marketing', 72000.00),
    ('Charlie Brown', 'Engineering', 88000.00),
    ('Diana Prince', 'HR', 68000.00);

-- Query with aggregation
SELECT
    department,
    COUNT(*) as employee_count,
    AVG(salary)::NUMERIC(10,2) as avg_salary,
    MAX(salary) as max_salary
FROM employeesMM
GROUP BY department
ORDER BY avg_salary DESC;`

function PostgresEditor() {
  const [sql, setSql] = useState(DEFAULT_SQL)
  const [results, setResults] = useState(null)
  const [error, setError] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const editorRef = useRef(null)

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor

    // Register PostgreSQL keywords for autocomplete
    monaco.languages.registerCompletionItemProvider("sql", {
      provideCompletionItems: (model, position) => {
        const pgKeywords = [
          "SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE",
          "CREATE", "ALTER", "DROP", "TABLE", "INDEX", "VIEW",
          "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "CROSS",
          "ON", "AND", "OR", "NOT", "IN", "EXISTS", "BETWEEN",
          "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "OFFSET",
          "AS", "DISTINCT", "UNION", "INTERSECT", "EXCEPT",
          "SERIAL", "BIGSERIAL", "VARCHAR", "TEXT", "INTEGER",
          "NUMERIC", "BOOLEAN", "TIMESTAMP", "DATE", "JSONB",
          "PRIMARY KEY", "FOREIGN KEY", "REFERENCES", "UNIQUE",
          "NOT NULL", "DEFAULT", "CHECK", "CASCADE",
          "BEGIN", "COMMIT", "ROLLBACK", "SAVEPOINT",
          "EXPLAIN", "ANALYZE", "VACUUM", "REINDEX",
          "COALESCE", "NULLIF", "CAST", "CASE", "WHEN", "THEN",
          "CURRENT_TIMESTAMP", "NOW()", "EXTRACT", "DATE_TRUNC",
          "STRING_AGG", "ARRAY_AGG", "JSON_AGG", "JSONB_AGG",
          "ROW_NUMBER()", "RANK()", "DENSE_RANK()", "LAG()", "LEAD()",
          "PARTITION BY", "OVER", "WINDOW",
          "WITH", "RECURSIVE", "RETURNING", "ON CONFLICT",
          "DO NOTHING", "DO UPDATE SET", "employeesMM",
        ]

        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        return {
          suggestions: pgKeywords.map((kw) => ({
            label: kw,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: kw,
            range,
          })),
        }
      },
    })
  }

  const handleExecute = async () => {
    if (!sql.trim()) {
      setError("Query cannot be empty")
      return
    }

    setIsRunning(true)
    setError("")
    setResults(null)

    try {
      // Send to backend for execution
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: sql }),
      })
      const contentType = res.headers.get("content-type") || ""

      if (!contentType.includes("application/json")) {
        const text = await res.text()
        throw new Error(text || `Request failed with status ${res.status}`)
      }

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || `Request failed with status ${res.status}`)
      }

      setResults(Array.isArray(data.rows) ? data.rows : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error executing query")
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <h2 style={{ color: "#fff", padding: "10px" }}>
        PostgreSQL Query Editor
      </h2>

      <Editor
        height="50%"
        defaultLanguage="sql"
        value={sql}
        onChange={(value) => setSql(value ?? "")}
        theme="vs-dark"
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          automaticLayout: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
        }}
      />

      <div style={{ display: "flex", gap: "10px", padding: "10px" }}>
        <button
          onClick={handleExecute}
          disabled={isRunning}
          style={{
            padding: "10px 20px",
            backgroundColor: isRunning ? "#6c757d" : "#336791",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isRunning ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          {isRunning ? "⏳ Executing..." : "▶ Run Query (Ctrl+Enter)"}
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div
          style={{
            backgroundColor: "#2d1b1b",
            color: "#ff6b6b",
            padding: "10px 15px",
            margin: "0 10px",
            borderRadius: "5px",
            fontFamily: "Consolas, monospace",
          }}
        >
          {error}
        </div>
      )}

      {/* Results table */}
      {results && results.length > 0 && (
        <div
          style={{
            flex: 1,
            overflow: "auto",
            margin: "10px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#1e1e1e",
              color: "#d4d4d4",
              fontFamily: "Consolas, monospace",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr>
                {Object.keys(results[0]).map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: "8px 12px",
                      borderBottom: "2px solid #336791",
                      textAlign: "left",
                      backgroundColor: "#252526",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, j) => (
                    <td
                      key={j}
                      style={{
                        padding: "6px 12px",
                        borderBottom: "1px solid #333",
                      }}
                    >
                      {val === null ? "NULL" : String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty results */}
      {results && results.length === 0 && (
        <p style={{ color: "#888", padding: "15px" }}>
          Query executed successfully. No rows returned.
        </p>
      )}
    
    </div>
  )
}

export default PostgresEditor