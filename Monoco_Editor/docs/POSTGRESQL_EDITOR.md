# Self-Learning Course: Build a PostgreSQL Query Editor in the Browser

> **Course Goal**: By the end of this course, you will understand how PostgreSQL processes queries, and you'll build a browser-based SQL editor with autocomplete, query execution, and tabular results — using Monaco Editor.
>
> **Prerequisites**: Completed at least one of the previous courses. Basic SQL knowledge is helpful but not required.
>
> **Time**: ~40 minutes, 7 lessons

---

## Lesson 1: How Does a SQL Query Actually Work?

When you write `SELECT * FROM users`, what actually happens? Let's trace the journey.

### The 5 Stages Inside PostgreSQL

```
You type:  SELECT name, age FROM users WHERE age > 21 ORDER BY name;

Stage 1: PARSER
  │  "Is this valid SQL syntax?"
  │  Converts text → parse tree (like a sentence diagram)
  ▼
Stage 2: ANALYZER
  │  "Does the 'users' table exist? Does it have 'name' and 'age' columns?"
  │  Resolves names, checks types
  ▼
Stage 3: REWRITER
  │  "Are there any views or rules to apply?"
  │  Expands views into their underlying queries
  ▼
Stage 4: PLANNER
  │  "What's the fastest way to get this data?"
  │  Decides: full table scan? use an index? sort first?
  │  Creates an execution plan
  ▼
Stage 5: EXECUTOR
  │  "Let's go get the data!"
  │  Runs the plan, returns rows
  ▼
  RESULTS → sent back to you
```

### Why Stages 4 and 5 matter for you

The **planner** is what makes PostgreSQL smart. It looks at:
- How many rows are in the table
- Are there indexes?
- What order should JOINs happen in?

This is why the same query can be fast or slow depending on table size and indexes!

### Quick Check

> **Question**: You write `SELECT * FROM orders WHERE total > 100`. The `orders` table doesn't exist. Which stage catches this error?
>
> **Answer**: Stage 2, the **Analyzer**. It's the one that checks if tables and columns actually exist.

> **Question**: What does the Planner do?
>
> **Answer**: It figures out the **fastest way** to execute your query. For example, it decides whether to scan the entire table or use an index.

---

## Lesson 2: SQL is Different — It's Not a Programming Language

SQL isn't like C, C++, Java, or JavaScript. It's a **declarative** language:

### Declarative vs Imperative

```
Imperative (C, Java, JS):
  "Here are the STEPS to follow"
  → Loop through each row
  → Check if age > 21
  → If yes, add to results
  → Sort results by name
  → Return results

Declarative (SQL):
  "Here's WHAT I want"
  → SELECT name FROM users WHERE age > 21 ORDER BY name
  → The database figures out HOW to do it
```

You tell SQL **what** you want, not **how** to get it. The database engine decides the most efficient method.

### SQL doesn't compile to an executable!

| Language | You write | You get | Runs on |
|----------|----------|---------|---------|
| C | `hello.c` | `hello.exe` | Operating system |
| Java | `Main.java` | `Main.class` | JVM |
| JavaScript | `app.js` | (nothing) | Browser/Node.js |
| **SQL** | `SELECT ...` | **Query plan** | **Database engine** |

There's no "compiled file." The database reads your query, plans it, executes it, and returns results — all in one step.

---

## Lesson 3: Build Your SQL Editor with Monaco

You already have a basic `SqlEditor.jsx`. Let's build an enhanced PostgreSQL-focused version.

### Create `src/components/PostgresEditor.jsx`:

```jsx
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
        onClick={() => setOutput("Connect a database (see Lesson 5)")}
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
```

### Monaco SQL Mode

With `defaultLanguage="sql"`, Monaco highlights:
- Keywords: `SELECT`, `FROM`, `WHERE`, `INSERT`, `CREATE`, `JOIN`, etc.
- Strings: `'single quotes'` (SQL standard)
- Comments: `-- single line` and `/* multi-line */`
- Numbers and operators

### Try It Yourself

1. Add the component and see SQL syntax highlighting
2. Type `SELECT` → it should be highlighted as a keyword
3. Type `-- this is a comment` → it should appear in green/gray

> **Checkpoint**: SQL keywords are colored, comments are dimmed. Move on!

---

## Lesson 4: Add PostgreSQL Autocomplete

Monaco doesn't know PostgreSQL-specific keywords by default. Let's teach it!

### Add this `onMount` handler:

```jsx
const handleEditorMount = (editor, monaco) => {
  monaco.languages.registerCompletionItemProvider("sql", {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }

      // PostgreSQL keywords organized by category
      const keywords = {
        // Data Manipulation
        queries: ["SELECT", "FROM", "WHERE", "INSERT INTO", "UPDATE", "DELETE FROM",
                  "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "CROSS JOIN",
                  "ON", "AND", "OR", "NOT", "IN", "EXISTS", "BETWEEN", "LIKE",
                  "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "OFFSET",
                  "AS", "DISTINCT", "UNION", "INTERSECT", "EXCEPT"],

        // Data Definition
        structure: ["CREATE TABLE", "ALTER TABLE", "DROP TABLE",
                    "CREATE INDEX", "DROP INDEX", "CREATE VIEW"],

        // Data Types (PostgreSQL-specific!)
        types: ["SERIAL", "BIGSERIAL", "INTEGER", "BIGINT", "SMALLINT",
                "VARCHAR", "TEXT", "CHAR", "BOOLEAN", "NUMERIC", "DECIMAL",
                "TIMESTAMP", "DATE", "TIME", "INTERVAL",
                "JSONB", "JSON", "UUID", "BYTEA", "ARRAY"],

        // Functions
        functions: ["COUNT", "SUM", "AVG", "MIN", "MAX",
                    "COALESCE", "NULLIF", "CAST", "NOW()",
                    "CURRENT_TIMESTAMP", "CURRENT_DATE",
                    "EXTRACT", "DATE_TRUNC", "AGE",
                    "STRING_AGG", "ARRAY_AGG", "JSON_AGG",
                    "ROW_NUMBER()", "RANK()", "DENSE_RANK()",
                    "LAG()", "LEAD()", "FIRST_VALUE()", "LAST_VALUE()"],

        // Clauses
        clauses: ["PRIMARY KEY", "FOREIGN KEY", "REFERENCES",
                  "NOT NULL", "DEFAULT", "UNIQUE", "CHECK",
                  "ON CONFLICT", "DO NOTHING", "DO UPDATE SET",
                  "RETURNING", "WITH", "RECURSIVE",
                  "PARTITION BY", "OVER", "WINDOW",
                  "CASCADE", "RESTRICT", "SET NULL"],
      }

      // Flatten all keywords into suggestions
      const allKeywords = Object.values(keywords).flat()

      return {
        suggestions: allKeywords.map(kw => ({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
          range,
        })),
      }
    },
  })
}
```

Then add `onMount={handleEditorMount}` to your `<Editor>`.

### Try It Yourself

1. Start typing `SEL` → you should see `SELECT` suggested
2. Type `JSO` → you should see `JSONB` and `JSON` (PostgreSQL-specific types!)
3. Type `ROW` → you should see `ROW_NUMBER()` (a window function)

> **Checkpoint**: Does PostgreSQL-specific autocomplete work? You're getting closer to a real IDE!

---

## Lesson 5: Connect to a Real PostgreSQL Database

Unlike JavaScript, SQL needs a database to run against. Here's how to set it up.

### Option 1: Quick Setup with Docker

If you have Docker installed, run this ONE command to get PostgreSQL:

```bash
docker run --name my-postgres -e POSTGRES_PASSWORD=mypassword -p 5432:5432 -d postgres:16
```

This gives you a PostgreSQL server running on port 5432.

### Option 2: Install PostgreSQL Locally

Download from the official PostgreSQL website and install it.

### Step 2: Create the Backend

```bash
# In your project root
mkdir server
cd server
npm init -y
npm install express cors pg
```

### Step 3: Write the Query Server

```js
// server/server.js
const express = require("express")
const cors = require("cors")
const { Pool } = require("pg")

const app = express()
app.use(cors())
app.use(express.json())

// Connect to PostgreSQL
const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "postgres",          // Default database
  user: "postgres",
  password: "mypassword",        // Your password
})

app.post("/api/query", async (req, res) => {
  const { query } = req.body

  // Safety: don't run empty queries
  if (!query || !query.trim()) {
    return res.json({ error: "Query is empty" })
  }

  try {
    // Set a timeout so bad queries don't hang forever
    await pool.query("SET statement_timeout = '5s'")

    // Run the query
    const result = await pool.query(query)

    res.json({
      rows: result.rows,
      rowCount: result.rowCount,
      columns: result.fields.map(f => f.name),
      message: `Query OK. ${result.rowCount} row(s) affected.`,
    })
  } catch (err) {
    res.json({ error: err.message })
  }
})

app.listen(3005, () => console.log("PostgreSQL API server on port 3005"))
```

### Step 4: Update the Frontend

```jsx
const handleExecute = async () => {
  if (!sql.trim()) {
    setOutput("⚠️ Write a query first!")
    return
  }

  setOutput("⏳ Running query...")

  try {
    const res = await fetch("http://localhost:3005/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: sql }),
    })

    const data = await res.json()

    if (data.error) {
      setOutput("❌ Error: " + data.error)
    } else if (data.rows && data.rows.length > 0) {
      // Format results as a table
      const header = data.columns.join(" | ")
      const separator = data.columns.map(c => "-".repeat(c.length)).join("-+-")
      const rows = data.rows.map(row =>
        data.columns.map(col => String(row[col] ?? "NULL")).join(" | ")
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
```

### Try It Yourself

1. Start your backend: `cd server && node server.js`
2. Start your frontend: `npm run dev`
3. Type and run:

```sql
SELECT 1 + 1 AS result;
```

4. **Expected output**:
```
result
------
2
```

> **Checkpoint**: Can you run a query and see results? If yes, your PostgreSQL editor is connected!

---

## Lesson 6: PostgreSQL Features — Practice Queries

Now let's learn PostgreSQL by writing real queries. **Run each one in your editor.**

### Query 1: Create a Table and Insert Data

Run this first to set up sample data:

```sql
-- Create a table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50),
    salary NUMERIC(10, 2),
    hired_at DATE DEFAULT CURRENT_DATE
);

-- Insert sample data
INSERT INTO employees (name, department, salary, hired_at) VALUES
    ('Alice Johnson', 'Engineering', 95000, '2020-03-15'),
    ('Bob Smith', 'Marketing', 72000, '2019-07-22'),
    ('Charlie Brown', 'Engineering', 88000, '2021-01-10'),
    ('Diana Prince', 'HR', 68000, '2018-11-05'),
    ('Eve Williams', 'Engineering', 110000, '2017-06-30'),
    ('Frank Miller', 'Marketing', 65000, '2022-02-14'),
    ('Grace Lee', 'HR', 75000, '2020-09-01');
```

**What you should understand**:
- `SERIAL` = auto-incrementing integer (PostgreSQL-specific, replaces `AUTO_INCREMENT`)
- `NUMERIC(10, 2)` = number with 10 digits, 2 after decimal point
- `DEFAULT CURRENT_DATE` = automatically set today's date

### Query 2: Basic SELECT with Filtering

```sql
SELECT name, salary, department
FROM employees
WHERE salary > 75000
ORDER BY salary DESC;
```

**Expected result**: Employees earning more than 75K, highest salary first.

### Query 3: Aggregation (GROUP BY)

```sql
SELECT
    department,
    COUNT(*) AS team_size,
    ROUND(AVG(salary), 2) AS avg_salary,
    MAX(salary) AS top_salary,
    MIN(salary) AS lowest_salary
FROM employees
GROUP BY department
ORDER BY avg_salary DESC;
```

**What you should understand**:
- `GROUP BY` collects rows into groups
- `COUNT(*)`, `AVG()`, `MAX()`, `MIN()` calculate stats per group
- `ROUND(..., 2)` rounds to 2 decimal places

### Query 4: Window Functions (Advanced, but Powerful!)

Window functions give you stats WITHOUT collapsing rows:

```sql
SELECT
    name,
    department,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank,
    salary - AVG(salary) OVER (PARTITION BY department) AS diff_from_avg
FROM employees
ORDER BY department, dept_rank;
```

**What you should understand**:
- `PARTITION BY department` = "group by department, but keep all rows"
- `RANK()` = ranking within each department
- `AVG() OVER (...)` = average within the partition, shown on each row
- This is like `GROUP BY`, but you keep all the individual rows!

### Query 5: CTE (Common Table Expression — "WITH" clause)

CTEs let you write queries in steps:

```sql
-- Step 1: Find department averages
WITH dept_averages AS (
    SELECT department, AVG(salary) AS avg_sal
    FROM employees
    GROUP BY department
)

-- Step 2: Find employees earning above their department average
SELECT e.name, e.department, e.salary,
       ROUND(d.avg_sal, 2) AS dept_avg,
       ROUND(e.salary - d.avg_sal, 2) AS above_avg_by
FROM employees e
JOIN dept_averages d ON e.department = d.department
WHERE e.salary > d.avg_sal
ORDER BY above_avg_by DESC;
```

**What you should understand**: CTEs make complex queries readable by breaking them into named steps. Think of them as "variables" for queries.

### Query 6: JSONB (PostgreSQL's Superpower)

PostgreSQL can store and query JSON data:

```sql
-- Create a table with JSONB
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert JSON data
INSERT INTO events (data) VALUES
    ('{"type": "click", "page": "/home", "user_id": 1}'),
    ('{"type": "view", "page": "/about", "user_id": 2}'),
    ('{"type": "click", "page": "/pricing", "user_id": 1}'),
    ('{"type": "signup", "page": "/register", "user_id": 3}');

-- Query JSON fields!
SELECT
    data->>'type' AS event_type,
    data->>'page' AS page,
    data->>'user_id' AS user_id
FROM events
WHERE data->>'type' = 'click';
```

**What you should understand**:
- `JSONB` = binary JSON (fast to query)
- `->` returns JSON, `->>` returns text
- You can query specific fields inside JSON like columns!

---

## Lesson 7: Add SQL Snippets (Speed Up Your Writing)

As a final enhancement, let's add SQL snippets — type a short word, press Tab, and get a full query template.

### Add snippets to your `onMount` handler:

```jsx
// Inside handleEditorMount, add another completion provider:
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
          label: "sel → SELECT query",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            "SELECT ${1:columns}",
            "FROM ${2:table}",
            "WHERE ${3:condition}",
            "ORDER BY ${4:column};",
          ].join("\n"),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Basic SELECT query template",
          range,
        },
        {
          label: "cte → WITH (CTE) query",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            "WITH ${1:name} AS (",
            "    SELECT ${2:columns}",
            "    FROM ${3:table}",
            ")",
            "SELECT * FROM ${1:name};",
          ].join("\n"),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Common Table Expression template",
          range,
        },
        {
          label: "wfn → Window Function",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "${1:ROW_NUMBER}() OVER (PARTITION BY ${2:column} ORDER BY ${3:column})",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Window function template",
          range,
        },
        {
          label: "ct → CREATE TABLE",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            "CREATE TABLE ${1:table_name} (",
            "    id SERIAL PRIMARY KEY,",
            "    ${2:column_name} ${3:VARCHAR(100)} ${4:NOT NULL},",
            "    created_at TIMESTAMP DEFAULT NOW()",
            ");",
          ].join("\n"),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "CREATE TABLE template",
          range,
        },
      ],
    }
  },
})
```

### Try It Yourself

1. Type `sel` → select the snippet → Tab through placeholders
2. Type `cte` → get a full CTE template
3. Type `ct` → get a CREATE TABLE template

Each snippet uses `${1:placeholder}` syntax. After inserting, press Tab to jump between placeholders and fill in your values.

---

## Course Summary

### What You Learned

| Lesson | Topic | Key Takeaway |
|--------|-------|-------------|
| 1 | How PostgreSQL processes queries | 5 stages: Parser → Analyzer → Rewriter → Planner → Executor |
| 2 | SQL is declarative | Tell it WHAT you want, not HOW to do it |
| 3 | Monaco SQL editor | `defaultLanguage="sql"` for SQL highlighting |
| 4 | PostgreSQL autocomplete | Custom `CompletionItemProvider` with PG keywords |
| 5 | Connecting to PostgreSQL | Node.js + `pg` library as backend |
| 6 | PostgreSQL practice | Aggregation, window functions, CTEs, JSONB |
| 7 | SQL snippets | Tab-expandable query templates |

### SQL vs Programming Languages — The Big Picture

| Aspect | C/C++/Java/JS | SQL |
|--------|--------------|-----|
| Type | Imperative (step-by-step) | Declarative (describe what you want) |
| Runs where? | OS, JVM, or browser | Database engine |
| Output | Text, files, UI | Tables of data (rows and columns) |
| Compilation | Source → executable | Query → execution plan |
| Memory management | Manual or GC | Database handles it |

### What to Build Next

- [ ] Show results as an HTML table (not just text)
- [ ] Add a database schema sidebar (list tables and columns)
- [ ] Support running multiple queries separated by `;`
- [ ] Add query history with re-run capability
- [ ] Add an `EXPLAIN ANALYZE` button that shows the query plan
- [ ] Export results as CSV with a download button
