# Self-Learning Course: Build an ER Diagram Builder

> **Course Goal**: By the end of this course, you will build a visual ER (Entity-Relationship) Diagram builder where users can create database tables, define columns, set primary/foreign keys, and draw relationships — all in the browser.
>
> **Prerequisites**: Basic React knowledge. Database concepts helpful but taught here.
>
> **Time**: ~50 minutes, 7 lessons

---

## Lesson 1: What Are ER Diagrams and Why Do They Matter?

### What is an ER Diagram?

ER = **Entity-Relationship** Diagram. It's a visual map of your database showing:
- **Entities** (tables) — real-world things you store data about
- **Attributes** (columns) — details about each entity
- **Relationships** — how entities connect to each other

```
┌────────────────┐                    ┌────────────────┐
│   STUDENTS     │                    │   COURSES      │
├────────────────┤                    ├────────────────┤
│ 🔑 student_id  │    enrolls_in     │ 🔑 course_id   │
│    name        │ ──────────────►   │    title        │
│    email       │   many-to-many    │    credits      │
│    grade       │                    │    department   │
└────────────────┘                    └────────────────┘
```

### Why Learn ER Diagrams?

| Who | Why |
|-----|-----|
| **Students** | Required for DBMS courses and exams |
| **Developers** | Design databases before writing SQL |
| **Teams** | Communicate database structure visually |
| **Interviews** | System design questions use ER diagrams |

### Database Terminology Quick Reference

| Term | Meaning | Example |
|------|---------|---------|
| **Entity** | A table / real-world object | `Students`, `Courses` |
| **Attribute** | A column / property | `name`, `email`, `grade` |
| **Primary Key (PK)** | Unique identifier for each row | `student_id` |
| **Foreign Key (FK)** | Reference to another table's PK | `course_id` in Enrollments |
| **Relationship** | How two entities connect | "Student enrolls in Course" |
| **Cardinality** | How many of each side | 1:1, 1:N, M:N |

---

## Lesson 2: Understanding Relationships and Cardinality

### Three Types of Relationships

**1. One-to-One (1:1)**

```
┌──────────┐    1         1    ┌──────────┐
│  Person  │ ────────────────  │ Passport │
└──────────┘                   └──────────┘
Each person has exactly one passport.
Each passport belongs to exactly one person.
```

**2. One-to-Many (1:N)**

```
┌──────────┐    1         N    ┌──────────┐
│ Teacher  │ ────────────────  │  Course  │
└──────────┘                   └──────────┘
One teacher teaches many courses.
Each course has only one teacher.
```

**3. Many-to-Many (M:N)**

```
┌──────────┐    M         N    ┌──────────┐
│ Student  │ ────────────────  │  Course  │
└──────────┘                   └──────────┘
One student takes many courses.
One course has many students.

💡 In actual databases, M:N becomes two 1:N relationships
   with a junction table (like "Enrollments") in between.
```

### Cardinality Notation

```
──────────    One (exactly one)
────────<     Many (one or more)
───────O──    Zero or one (optional)
───────O──<   Zero or many (optional many)
```

### Quick Check

> **Question**: A library has books, and each book has one author. One author can write many books. What's the relationship?
>
> **Answer**: **One-to-Many (1:N)**. One Author → Many Books.

---

## Lesson 3: Build the ER Diagram Builder Component

### Create `src/components/ERDiagramBuilder.jsx`:

```jsx
import React, { useState, useRef, useCallback } from "react"

const DATA_TYPES = [
  "INT", "BIGINT", "SERIAL",
  "VARCHAR(255)", "TEXT", "CHAR(10)",
  "BOOLEAN",
  "DATE", "TIMESTAMP",
  "DECIMAL(10,2)", "FLOAT",
  "JSON", "UUID",
]

function ERDiagramBuilder() {
  const [tables, setTables] = useState([
    {
      id: "t1",
      name: "students",
      x: 80,
      y: 80,
      columns: [
        { name: "student_id", type: "SERIAL", pk: true, fk: false, notNull: true },
        { name: "name", type: "VARCHAR(255)", pk: false, fk: false, notNull: true },
        { name: "email", type: "VARCHAR(255)", pk: false, fk: false, notNull: true },
        { name: "grade", type: "INT", pk: false, fk: false, notNull: false },
      ],
    },
    {
      id: "t2",
      name: "courses",
      x: 500,
      y: 80,
      columns: [
        { name: "course_id", type: "SERIAL", pk: true, fk: false, notNull: true },
        { name: "title", type: "VARCHAR(255)", pk: false, fk: false, notNull: true },
        { name: "credits", type: "INT", pk: false, fk: false, notNull: true },
      ],
    },
  ])

  const [relationships, setRelationships] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [dragging, setDragging] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showAddTable, setShowAddTable] = useState(false)
  const [newTableName, setNewTableName] = useState("")
  const [connectMode, setConnectMode] = useState(null) // { fromTable, type }
  const [showSql, setShowSql] = useState(false)
  const canvasRef = useRef(null)

  // ── Table dragging ──
  const handleMouseDown = (e, tableId) => {
    if (connectMode) {
      // In connect mode, clicking a table creates a relationship
      if (connectMode.fromTable !== tableId) {
        setRelationships((prev) => [
          ...prev,
          {
            id: `r${Date.now()}`,
            from: connectMode.fromTable,
            to: tableId,
            type: connectMode.type,
            label: "",
          },
        ])
      }
      setConnectMode(null)
      return
    }

    const table = tables.find((t) => t.id === tableId)
    setDragging(tableId)
    setSelectedTable(tableId)
    setDragOffset({
      x: e.clientX - table.x,
      y: e.clientY - table.y,
    })
  }

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return
    setTables((prev) =>
      prev.map((t) =>
        t.id === dragging
          ? { ...t, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }
          : t
      )
    )
  }, [dragging, dragOffset])

  const handleMouseUp = useCallback(() => {
    setDragging(null)
  }, [])

  // ── Table operations ──
  const addTable = () => {
    if (!newTableName.trim()) return
    const sanitized = newTableName.trim().toLowerCase().replace(/\s+/g, "_")
    setTables((prev) => [
      ...prev,
      {
        id: `t${Date.now()}`,
        name: sanitized,
        x: 80 + Math.random() * 300,
        y: 80 + Math.random() * 200,
        columns: [
          { name: "id", type: "SERIAL", pk: true, fk: false, notNull: true },
        ],
      },
    ])
    setNewTableName("")
    setShowAddTable(false)
  }

  const deleteTable = (tableId) => {
    setTables((prev) => prev.filter((t) => t.id !== tableId))
    setRelationships((prev) =>
      prev.filter((r) => r.from !== tableId && r.to !== tableId)
    )
    if (selectedTable === tableId) setSelectedTable(null)
  }

  const addColumn = (tableId) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              columns: [
                ...t.columns,
                { name: "new_column", type: "VARCHAR(255)", pk: false, fk: false, notNull: false },
              ],
            }
          : t
      )
    )
  }

  const updateColumn = (tableId, colIndex, field, value) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              columns: t.columns.map((c, i) =>
                i === colIndex ? { ...c, [field]: value } : c
              ),
            }
          : t
      )
    )
  }

  const deleteColumn = (tableId, colIndex) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, columns: t.columns.filter((_, i) => i !== colIndex) }
          : t
      )
    )
  }

  // ── Generate SQL ──
  const generateSQL = () => {
    let sql = "-- Generated SQL from ER Diagram\n\n"

    for (const table of tables) {
      sql += `CREATE TABLE ${table.name} (\n`

      const colDefs = table.columns.map((col) => {
        let def = `  ${col.name} ${col.type}`
        if (col.pk) def += " PRIMARY KEY"
        if (col.notNull && !col.pk) def += " NOT NULL"
        return def
      })

      sql += colDefs.join(",\n")
      sql += "\n);\n\n"
    }

    for (const rel of relationships) {
      const fromTable = tables.find((t) => t.id === rel.from)
      const toTable = tables.find((t) => t.id === rel.to)
      if (fromTable && toTable) {
        const fromPk = fromTable.columns.find((c) => c.pk)
        if (fromPk) {
          sql += `-- Relationship: ${fromTable.name} → ${toTable.name} (${rel.type})\n`
          sql += `ALTER TABLE ${toTable.name} ADD COLUMN ${fromTable.name}_${fromPk.name} INT REFERENCES ${fromTable.name}(${fromPk.name});\n\n`
        }
      }
    }

    return sql
  }

  // ── Draw relationship lines ──
  const getTableCenter = (tableId) => {
    const table = tables.find((t) => t.id === tableId)
    if (!table) return { x: 0, y: 0 }
    return {
      x: table.x + 120,
      y: table.y + 20 + table.columns.length * 14,
    }
  }

  const selectedTableData = tables.find((t) => t.id === selectedTable)

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#1e1e1e",
        color: "#d4d4d4",
        fontFamily: "'Segoe UI', sans-serif",
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Left Toolbar */}
      <div style={{
        width: "280px",
        backgroundColor: "#252526",
        borderRight: "2px solid #333",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "12px 16px",
          backgroundColor: "#007acc",
          color: "white",
          fontWeight: "bold",
          fontSize: "14px",
        }}>
          ER Diagram Builder
        </div>

        {/* Action Buttons */}
        <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            onClick={() => setShowAddTable(true)}
            style={{
              padding: "8px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            + Add Table
          </button>

          <button
            onClick={() => setShowSql(!showSql)}
            style={{
              padding: "8px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {showSql ? "Hide SQL" : "Generate SQL"}
          </button>
        </div>

        {/* Add Table Form */}
        {showAddTable && (
          <div style={{ padding: "0 12px 12px", display: "flex", gap: "4px" }}>
            <input
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTable()}
              placeholder="Table name..."
              autoFocus
              style={{
                flex: 1,
                padding: "6px 8px",
                backgroundColor: "#1e1e1e",
                color: "#d4d4d4",
                border: "1px solid #555",
                borderRadius: "4px",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <button
              onClick={addTable}
              style={{
                padding: "6px 12px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              ✓
            </button>
          </div>
        )}

        {/* Table List */}
        <div style={{ padding: "0 12px" }}>
          <div style={{ color: "#888", fontSize: "12px", fontWeight: "bold", marginBottom: "8px" }}>
            TABLES ({tables.length})
          </div>
          {tables.map((table) => (
            <div
              key={table.id}
              onClick={() => setSelectedTable(table.id)}
              style={{
                padding: "8px 10px",
                marginBottom: "4px",
                backgroundColor: selectedTable === table.id ? "#37373d" : "transparent",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderLeft: selectedTable === table.id ? "3px solid #007acc" : "3px solid transparent",
              }}
            >
              <span style={{ fontSize: "13px" }}>📋 {table.name}</span>
              <span style={{ color: "#888", fontSize: "11px" }}>{table.columns.length} cols</span>
            </div>
          ))}
        </div>

        {/* Selected Table Editor */}
        {selectedTableData && (
          <div style={{
            flex: 1,
            borderTop: "1px solid #333",
            marginTop: "12px",
            padding: "12px",
            overflow: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontWeight: "bold", fontSize: "13px" }}>
                Editing: {selectedTableData.name}
              </span>
              <button
                onClick={() => deleteTable(selectedTable)}
                style={{
                  padding: "2px 8px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "11px",
                }}
              >
                Delete
              </button>
            </div>

            {/* Connect buttons */}
            <div style={{ display: "flex", gap: "4px", marginBottom: "10px" }}>
              {["1:1", "1:N", "M:N"].map((type) => (
                <button
                  key={type}
                  onClick={() => setConnectMode({ fromTable: selectedTable, type })}
                  style={{
                    flex: 1,
                    padding: "4px",
                    backgroundColor: connectMode?.fromTable === selectedTable && connectMode?.type === type
                      ? "#ff6600"
                      : "#333",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
            {connectMode && (
              <div style={{ color: "#ffd700", fontSize: "11px", marginBottom: "8px", textAlign: "center" }}>
                Click another table to connect ({connectMode.type})
              </div>
            )}

            {/* Column Editor */}
            {selectedTableData.columns.map((col, i) => (
              <div key={i} style={{
                marginBottom: "8px",
                padding: "8px",
                backgroundColor: "#1e1e1e",
                borderRadius: "4px",
                fontSize: "12px",
              }}>
                <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                  <input
                    value={col.name}
                    onChange={(e) => updateColumn(selectedTable, i, "name", e.target.value)}
                    style={{
                      flex: 1,
                      padding: "4px 6px",
                      backgroundColor: "#2d2d2d",
                      color: "#d4d4d4",
                      border: "1px solid #444",
                      borderRadius: "3px",
                      fontSize: "12px",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={() => deleteColumn(selectedTable, i)}
                    style={{
                      padding: "2px 6px",
                      backgroundColor: "transparent",
                      color: "#f44336",
                      border: "1px solid #f44336",
                      borderRadius: "3px",
                      cursor: "pointer",
                      fontSize: "11px",
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <select
                    value={col.type}
                    onChange={(e) => updateColumn(selectedTable, i, "type", e.target.value)}
                    style={{
                      flex: 1,
                      padding: "3px 4px",
                      backgroundColor: "#2d2d2d",
                      color: "#d4d4d4",
                      border: "1px solid #444",
                      borderRadius: "3px",
                      fontSize: "11px",
                    }}
                  >
                    {DATA_TYPES.map((dt) => (
                      <option key={dt} value={dt}>{dt}</option>
                    ))}
                  </select>
                  <label style={{ display: "flex", gap: "2px", alignItems: "center", fontSize: "11px" }}>
                    <input
                      type="checkbox"
                      checked={col.pk}
                      onChange={(e) => updateColumn(selectedTable, i, "pk", e.target.checked)}
                    />
                    PK
                  </label>
                  <label style={{ display: "flex", gap: "2px", alignItems: "center", fontSize: "11px" }}>
                    <input
                      type="checkbox"
                      checked={col.notNull}
                      onChange={(e) => updateColumn(selectedTable, i, "notNull", e.target.checked)}
                    />
                    NN
                  </label>
                </div>
              </div>
            ))}

            <button
              onClick={() => addColumn(selectedTable)}
              style={{
                width: "100%",
                padding: "6px",
                backgroundColor: "#333",
                color: "#888",
                border: "1px dashed #555",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              + Add Column
            </button>
          </div>
        )}
      </div>

      {/* Canvas Area */}
      <div
        ref={canvasRef}
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          backgroundImage: "radial-gradient(circle, #333 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
        onClick={() => { if (!connectMode) setSelectedTable(null) }}
      >
        {/* Relationship Lines (SVG overlay) */}
        <svg style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}>
          {relationships.map((rel) => {
            const from = getTableCenter(rel.from)
            const to = getTableCenter(rel.to)
            return (
              <g key={rel.id}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#888"
                  strokeWidth="2"
                  strokeDasharray={rel.type === "M:N" ? "6,4" : "none"}
                />
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 - 8}
                  fill="#ffd700"
                  fontSize="12"
                  textAnchor="middle"
                >
                  {rel.type}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Table Cards */}
        {tables.map((table) => (
          <div
            key={table.id}
            onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, table.id) }}
            style={{
              position: "absolute",
              left: table.x,
              top: table.y,
              minWidth: "220px",
              backgroundColor: "#252526",
              border: selectedTable === table.id ? "2px solid #007acc" : "2px solid #444",
              borderRadius: "6px",
              overflow: "hidden",
              cursor: connectMode ? "crosshair" : "move",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
              userSelect: "none",
            }}
          >
            {/* Table Header */}
            <div style={{
              padding: "8px 12px",
              backgroundColor: table.id === selectedTable ? "#007acc" : "#333",
              fontWeight: "bold",
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              {table.name}
            </div>

            {/* Columns */}
            {table.columns.map((col, i) => (
              <div
                key={i}
                style={{
                  padding: "4px 12px",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  borderBottom: "1px solid #2d2d2d",
                  backgroundColor: col.pk ? "#1a3a1a" : "transparent",
                }}
              >
                <span>
                  {col.pk ? "🔑 " : col.fk ? "🔗 " : "   "}
                  {col.name}
                </span>
                <span style={{ color: "#888", fontSize: "11px" }}>
                  {col.type}
                </span>
              </div>
            ))}
          </div>
        ))}

        {/* SQL Modal */}
        {showSql && (
          <div style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            width: "400px",
            maxHeight: "400px",
            backgroundColor: "#1e1e1e",
            border: "1px solid #555",
            borderRadius: "8px",
            overflow: "auto",
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
          }}>
            <div style={{
              padding: "8px 12px",
              backgroundColor: "#333",
              fontWeight: "bold",
              fontSize: "13px",
              display: "flex",
              justifyContent: "space-between",
            }}>
              <span>Generated SQL</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(generateSQL())
                }}
                style={{
                  padding: "2px 8px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                  fontSize: "11px",
                }}
              >
                Copy
              </button>
            </div>
            <pre style={{
              padding: "12px",
              margin: 0,
              fontSize: "12px",
              fontFamily: "Consolas, monospace",
              color: "#4CAF50",
              whiteSpace: "pre-wrap",
            }}>
              {generateSQL()}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default ERDiagramBuilder
```

### What we built:

```
┌─────────────────────┬─────────────────────────────────────────┐
│ ER Diagram Builder  │                                         │
├─────────────────────┤    ┌──────────────┐                     │
│ [+ Add Table]       │    │  STUDENTS    │                     │
│ [Generate SQL]      │    ├──────────────┤      ┌────────────┐ │
│                     │    │ 🔑 student_id│      │  COURSES   │ │
│ TABLES (2)          │    │    name      │ 1:N  ├────────────┤ │
│ ▪ students  4 cols  │    │    email     │──────│ 🔑 course_id││
│ ▪ courses   3 cols  │    │    grade     │      │    title   │ │
│                     │    └──────────────┘      │    credits │ │
│ Editing: students   │                          └────────────┘ │
│ [1:1] [1:N] [M:N]   │                                         │
│                     │                                         │
│ student_id          │                                         │
│ [SERIAL  ▼] ☑PK ☑NN│                                         │
│                     │                                         │
│ name                │          Generated SQL                  │
│ [VARCHAR ▼] ☐PK ☑NN│      ┌──────────────────────────┐       │
│                     │      │ CREATE TABLE students (  │       │
│ [+ Add Column]      │      │   student_id SERIAL PK,  │       │
│                     │      │   name VARCHAR(255)...   │       │
└─────────────────────┴──────┴──────────────────────────┴───────┘
```

> **Checkpoint**: Can you add tables, add columns, and drag tables around? Move on!

---

## Lesson 4: Database Design Best Practices

### Naming Conventions

| Rule | Good | Bad |
|------|------|-----|
| Use lowercase | `students` | `Students`, `STUDENTS` |
| Use underscores | `student_name` | `studentName`, `student-name` |
| Table names are plural | `orders` | `order` |
| Column names are singular | `order_id` | `orders_id` |
| Foreign keys include table | `student_id` | `sid`, `ref_id` |

### Common Column Patterns

```
Every table should have:
  ├── id (SERIAL PRIMARY KEY)     ← auto-incrementing unique ID
  ├── created_at (TIMESTAMP)      ← when the row was created
  └── updated_at (TIMESTAMP)      ← when last modified

User-related tables:
  ├── email (VARCHAR UNIQUE)      ← no duplicate emails
  ├── password_hash (VARCHAR)     ← NEVER store plain passwords
  └── is_active (BOOLEAN)         ← soft delete pattern
```

### Normalization Rules (Simplified)

| Normal Form | Rule | Example |
|-------------|------|---------|
| **1NF** | No repeating groups | Don't put `phone1, phone2, phone3` — use a phones table |
| **2NF** | No partial dependencies | Every non-key column depends on the WHOLE primary key |
| **3NF** | No transitive dependencies | No column depends on another non-key column |

**Simple test**: "Can I determine this column's value from ONLY the primary key?"
- If YES → it belongs in this table
- If NO → it belongs in another table

---

## Lesson 5: Practice — Design These Databases

### Exercise 1: Library Management

Design tables for a library:

```
Required Entities:
  - Books (title, isbn, year, genre)
  - Authors (name, bio)
  - Members (name, email, membership_date)
  - Loans (borrow_date, return_date, status)

Relationships:
  - One Author writes Many Books (1:N)
  - One Member borrows Many Books (via Loans) (M:N)
```

**Expected Solution:**

```
┌────────────┐         ┌────────────┐
│  AUTHORS   │ 1     N │   BOOKS    │
│────────────│─────────│────────────│
│ author_id  │         │ book_id    │
│ name       │         │ title      │
│ bio        │         │ isbn       │
│            │         │ author_id  │◄── FK
└────────────┘         └─────┬──────┘
                             │ 1
                             │
                             │ N
                       ┌─────┴──────┐         ┌────────────┐
                       │   LOANS    │ N     1 │  MEMBERS   │
                       │────────────│─────────│────────────│
                       │ loan_id    │         │ member_id  │
                       │ book_id    │◄── FK   │ name       │
                       │ member_id  │◄── FK   │ email      │
                       │ borrow_date│         │ join_date  │
                       │ return_date│         └────────────┘
                       └────────────┘
```

### Exercise 2: E-Commerce

```
Required Entities:
  - Users, Products, Categories, Orders, Order_Items

Design the tables and relationships yourself!
Hint: Order_Items is a junction table between Orders and Products.
```

### Exercise 3: University System

```
Required Entities:
  - Students, Professors, Departments, Courses, Enrollments, Grades

Think about:
  - Which department does a professor belong to?
  - How do students enroll in courses?
  - Where are grades stored?
```

---

## Lesson 6: From ER Diagram to SQL

### The SQL the builder generates:

```sql
-- For each table, we create a CREATE TABLE statement
CREATE TABLE students (
  student_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  grade INT
);

CREATE TABLE courses (
  course_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  credits INT NOT NULL
);

-- For each relationship, we add foreign key columns
ALTER TABLE courses
  ADD COLUMN students_student_id INT
  REFERENCES students(student_id);
```

### Understanding Foreign Keys

```sql
-- Foreign Key = "This column points to another table's primary key"

CREATE TABLE enrollments (
  enrollment_id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(student_id),    ← FK to students
  course_id INT REFERENCES courses(course_id),       ← FK to courses
  grade CHAR(2),
  enrolled_date DATE DEFAULT CURRENT_DATE
);

-- This means:
-- ✅ Can only insert student_ids that exist in students table
-- ✅ Can only insert course_ids that exist in courses table
-- ❌ Inserting a non-existent ID will fail (referential integrity)
```

### Common Constraints

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,                    -- Auto-increment unique ID
  email VARCHAR(255) UNIQUE NOT NULL,       -- No duplicates, required
  age INT CHECK (age >= 0 AND age <= 150),  -- Value must be in range
  role VARCHAR(20) DEFAULT 'student',       -- Default value if not provided
  created_at TIMESTAMP DEFAULT NOW()        -- Auto-set creation time
);
```

---

## Lesson 7: Common ER Diagram Mistakes

### Mistake 1: Missing Primary Key

```
❌ Bad:                          ✅ Good:
┌──────────────┐                ┌──────────────┐
│   STUDENTS   │                │   STUDENTS   │
├──────────────┤                ├──────────────┤
│ name         │                │ 🔑 student_id │
│ email        │                │ name          │
│ grade        │                │ email         │
└──────────────┘                │ grade         │
                                └──────────────┘
Every table MUST have a primary key
```

### Mistake 2: Many-to-Many without Junction Table

```
❌ Bad (in actual database):
Students ←──M:N──→ Courses

✅ Good:
Students ←──1:N──→ Enrollments ←──N:1──→ Courses
```

### Mistake 3: Storing calculated values

```
❌ Bad:                          ✅ Good:
┌──────────────┐                ┌──────────────┐
│   ORDERS     │                │   ORDERS     │
├──────────────┤                ├──────────────┤
│ item_price   │                │ item_price   │
│ quantity     │                │ quantity     │
│ total_price  │ ← calculated! └──────────────┘
└──────────────┘
  Calculate total_price in query: SELECT item_price * quantity AS total_price
```

### Mistake 4: Too few or too many tables

```
❌ Too few (cramming everything in one table):
Users table with: name, email, order1, order2, order3...

❌ Too many (splitting unnecessarily):
UserNames table, UserEmails table, UserAges table

✅ Just right:
Users table + Orders table (with user_id foreign key)
```

---

## Course Summary

### What You Learned

| Lesson | Topic | Key Takeaway |
|--------|-------|-------------|
| 1 | What are ER diagrams? | Visual maps of database structure: entities, attributes, relationships |
| 2 | Relationships & cardinality | 1:1, 1:N, M:N — how entities connect |
| 3 | Building the component | Draggable tables, column editor, relationship lines, SQL generation |
| 4 | Design best practices | Naming conventions, normalization, common patterns |
| 5 | Practice exercises | Library, E-Commerce, University database designs |
| 6 | ER to SQL | CREATE TABLE, FOREIGN KEY, constraints |
| 7 | Common mistakes | Missing PKs, no junction tables, storing calculations |

### What to Build Next

- [ ] Add relationship labels (e.g., "enrolls_in", "teaches")
- [ ] Export diagram as PNG image
- [ ] Import existing SQL to generate ER diagram
- [ ] Add comment/note annotations on the canvas
- [ ] Support compound primary keys
- [ ] Add color themes for different entity groups
- [ ] Undo/redo support for diagram changes
