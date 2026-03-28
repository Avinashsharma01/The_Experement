# Building a PostgreSQL Query Editor with Monaco Editor

## What You'll Learn

How to create a browser-based PostgreSQL query editor using Monaco Editor in React, execute queries against a real database, and display results in a table.

---

## 1. How PostgreSQL Query Execution Works

```
SQL Query  →  Parser  →  Analyzer  →  Rewriter  →  Planner  →  Executor  →  Results
```

### PostgreSQL Query Pipeline

| Stage      | What It Does                                              |
|-----------|-----------------------------------------------------------|
| Parser     | Converts SQL text into a parse tree                       |
| Analyzer   | Resolves table/column names, checks types                 |
| Rewriter   | Applies rules and views                                   |
| Planner    | Creates the most efficient execution plan (cost-based)    |
| Executor   | Runs the plan and returns rows                            |

### PostgreSQL vs Other Databases

| Feature           | PostgreSQL          | MySQL              | SQLite            |
|------------------|---------------------|--------------------|--------------------|
| Type system       | Very strict         | Lenient            | Dynamic           |
| JSON support      | JSONB (binary)      | JSON               | JSON extension    |
| Full-text search  | Built-in (tsvector) | MATCH AGAINST      | FTS5 extension    |
| Concurrency       | MVCC               | InnoDB MVCC        | File-level lock   |
| Extensions        | Rich ecosystem      | Limited            | Loadable          |

---

## 2. Your Existing SQL Editor

You already have `src/components/SqlEditor.jsx` which uses Monaco with SQL. Here's how to extend it for PostgreSQL:

### Current State

```jsx
<Editor
  height="100%"
  defaultLanguage="sql"
  value={sql}
  onChange={(value) => setSql(value)}
  theme="vs-dark"
  options={{
    minimap: { enabled: false },
    fontSize: 14,
    wordWrap: "on",
    automaticLayout: true,
  }}
/>
```

This already supports SQL syntax highlighting, which covers PostgreSQL syntax too.

---

## 3. Enhanced PostgreSQL Editor Component

Create `src/components/PostgresEditor.jsx`:

```jsx
import React, { useState, useRef } from "react"
import Editor from "@monaco-editor/react"

const DEFAULT_SQL = `-- PostgreSQL Query Editor
-- Try these example queries:

-- Create a table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50),
    salary NUMERIC(10, 2),
    hired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert data
INSERT INTO employees (name, department, salary) VALUES
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
FROM employees
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
          "DO NOTHING", "DO UPDATE SET",
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
      // Send to backend
      // const res = await fetch("/api/query", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ query: sql }),
      // })
      // const data = await res.json()
      // if (data.error) setError(data.error)
      // else setResults(data.rows)

      setError("⚠️ Connect a PostgreSQL backend to execute queries.")
    } catch (err) {
      setError(err.message)
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
```

---

## 4. Backend: Node.js + pg (PostgreSQL Driver)

### Install Dependencies

```bash
npm install express pg
```

### Server Code

```js
// server.js
const express = require("express")
const { Pool } = require("pg")

const app = express()
app.use(express.json())

// PostgreSQL connection pool
const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "mydb",
  user: "postgres",
  password: "your_password",
})

app.post("/api/query", async (req, res) => {
  const { query } = req.body

  if (!query || !query.trim()) {
    return res.status(400).json({ error: "Empty query" })
  }

  try {
    const result = await pool.query(query)
    res.json({
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields.map((f) => f.name),
    })
  } catch (err) {
    res.json({ error: err.message })
  }
})

app.listen(3005, () => console.log("PostgreSQL API on :3005"))
```

> **Security Warning**: Never pass raw user SQL to a production database.
> Use read-only database users, query timeouts, and row limits.

### Safer Backend with Limits

```js
app.post("/api/query", async (req, res) => {
  const { query } = req.body

  // Basic safety checks
  const forbidden = ["DROP DATABASE", "DROP SCHEMA", "TRUNCATE"]
  const upper = query.toUpperCase()
  for (const word of forbidden) {
    if (upper.includes(word)) {
      return res.json({ error: `"${word}" is not allowed` })
    }
  }

  try {
    // Set statement timeout (5 seconds)
    await pool.query("SET statement_timeout = '5s'")
    const result = await pool.query(query)
    res.json({
      rows: result.rows.slice(0, 1000), // Limit to 1000 rows
      rowCount: result.rowCount,
    })
  } catch (err) {
    res.json({ error: err.message })
  }
})
```

---

## 5. PostgreSQL Concepts to Test in Your Editor

```sql
-- Window Functions
SELECT
    name,
    department,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dept_rank,
    salary - AVG(salary) OVER (PARTITION BY department) as diff_from_avg
FROM employees;

-- CTEs (Common Table Expressions)
WITH dept_stats AS (
    SELECT department, AVG(salary) as avg_sal
    FROM employees
    GROUP BY department
)
SELECT e.name, e.salary, d.avg_sal
FROM employees e
JOIN dept_stats d ON e.department = d.department
WHERE e.salary > d.avg_sal;

-- JSONB Operations
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    data JSONB
);

INSERT INTO events (data) VALUES
    ('{"type": "click", "page": "/home", "user_id": 1}'),
    ('{"type": "view", "page": "/about", "user_id": 2}');

SELECT data->>'type' as event_type,
       data->>'page' as page
FROM events
WHERE data @> '{"type": "click"}';

-- Array Operations
SELECT ARRAY[1, 2, 3] || ARRAY[4, 5] as combined;
SELECT unnest(ARRAY['a', 'b', 'c']) as letter;

-- Generate Series
SELECT generate_series(1, 10) as num;
SELECT generate_series(
    '2024-01-01'::date,
    '2024-01-07'::date,
    '1 day'::interval
) as day;

-- Upsert (INSERT ON CONFLICT)
INSERT INTO employees (id, name, department, salary)
VALUES (1, 'Alice Updated', 'Engineering', 100000)
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    salary = EXCLUDED.salary;

-- Lateral Join
SELECT d.department, top_earner.*
FROM (SELECT DISTINCT department FROM employees) d
CROSS JOIN LATERAL (
    SELECT name, salary
    FROM employees
    WHERE department = d.department
    ORDER BY salary DESC
    LIMIT 1
) top_earner;
```

---

## 6. Adding Custom SQL Snippets

```jsx
const handleEditorMount = (editor, monaco) => {
  // Register SQL snippets
  monaco.languages.registerCompletionItemProvider("sql", {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }

      return {
        suggestions: [
          {
            label: "sel",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "SELECT ${1:columns}\nFROM ${2:table}\nWHERE ${3:condition};",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Basic SELECT query",
            range,
          },
          {
            label: "cte",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              "WITH ${1:name} AS (\n    SELECT ${2:columns}\n    FROM ${3:table}\n)\nSELECT * FROM ${1:name};",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Common Table Expression",
            range,
          },
          {
            label: "winfn",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              "${1:ROW_NUMBER}() OVER (PARTITION BY ${2:column} ORDER BY ${3:column})",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Window function",
            range,
          },
        ],
      }
    },
  })
}
```

---

## 7. Practice Exercises

1. **Schema Explorer**: Add a sidebar that shows tables and columns from your database
2. **Query History**: Save executed queries and allow re-running them
3. **Export Results**: Add a "Download CSV" button for query results
4. **EXPLAIN Viewer**: Run `EXPLAIN ANALYZE` and format the output as a tree
5. **Multiple Queries**: Split editor content by `;` and run queries sequentially
6. **Table Autocomplete**: Fetch real table/column names and add them to Monaco suggestions

---

## 8. Connection Setup Reference

### Docker (Quickest Way to Get PostgreSQL)

```bash
docker run --name my-postgres \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -p 5432:5432 \
  -d postgres:16
```

### Connect with psql

```bash
psql -h localhost -U postgres -d mydb
```

### Connection String Format

```
postgresql://user:password@host:port/database
```

---

## Summary

| What              | How                                            |
|-------------------|------------------------------------------------|
| Editor            | Monaco with `defaultLanguage="sql"`            |
| Execution         | Backend with `pg` (node-postgres) library      |
| Autocomplete      | Custom `CompletionItemProvider` for PG keywords |
| Results display   | HTML `<table>` with dynamic columns            |
| Key feature       | JSONB, window functions, CTEs highlighted      |
| Security          | Read-only user, timeouts, row limits           |
