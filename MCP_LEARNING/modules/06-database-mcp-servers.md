# Module 6: Database MCP Servers

---

## 🎯 Goal

Let AI **query and manage databases** directly — ask questions about your data in plain English.

---

## 🤔 Why Would You Want This?

Instead of writing SQL manually, you can say:

> *"Show me all users who signed up in the last 7 days"*

And the AI writes the SQL, runs it against your database, and shows you the results. Powerful for:

- Exploring unfamiliar databases
- Quick data analysis
- Debugging data issues
- Learning SQL (watch what queries the AI writes!)

---

## 📦 Server 1: SQLite MCP Server

**Best for:** Local databases, learning, prototyping

| Detail | Info |
|--------|------|
| **Source** | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite) |
| **Runs via** | `uvx` (Python) |
| **Requires** | Python 3.10+, `uv` package manager |

### Setup

```json
{
  "servers": {
    "sqlite": {
      "command": "uvx",
      "args": [
        "mcp-server-sqlite",
        "--db-path",
        "C:/path/to/your/database.db"
      ]
    }
  }
}
```

> **Don't have a SQLite database?** The server can create one! Just point to a path where you want the `.db` file.

### Available Tools

| Tool | What It Does |
|------|-------------|
| `read_query` | Run a SELECT query (read-only) |
| `write_query` | Run INSERT/UPDATE/DELETE queries |
| `create_table` | Create a new table |
| `list_tables` | Show all tables in the database |
| `describe_table` | Show columns and types for a table |
| `append_insight` | Save analysis insights as memos |

### Try These Prompts

```
"What tables are in my database?"

"Show me the schema of the 'users' table"

"How many records are in each table?"

"Find all orders placed in the last month"

"Create a table called 'bookmarks' with columns: id, url, title, created_at"

"What are the top 5 most expensive products?"
```

---

## 📦 Server 2: PostgreSQL MCP Server

**Best for:** Production databases, real-world projects

| Detail | Info |
|--------|------|
| **Source** | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres) |
| **Runs via** | `npx` (Node.js) |
| **Requires** | Node.js 18+, a running PostgreSQL server |

### Setup

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "pg_connection",
      "description": "PostgreSQL connection string (e.g., postgresql://user:pass@localhost:5432/dbname)",
      "password": true
    }
  ],
  "servers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "${input:pg_connection}"
      ]
    }
  }
}
```

### Connection String Format

```
postgresql://username:password@hostname:port/database_name
```

**Examples:**
```
postgresql://postgres:mypassword@localhost:5432/myapp
postgresql://admin:secret@db.example.com:5432/production
```

### Available Tools

| Tool | What It Does |
|------|-------------|
| `query` | Run any SQL query against your PostgreSQL database |

### Try These Prompts

```
"List all tables in my PostgreSQL database"

"Show me the schema of the 'customers' table"

"What's the average order value grouped by month?"

"Find duplicate email addresses in the users table"
```

---

## ⚠️ Security Warnings for Database Servers

### 🔴 IMPORTANT: Be Careful!

Database MCP servers give AI **direct access** to your database. Follow these rules:

1. **NEVER connect to a production database** unless you know what you're doing
2. **Use read-only credentials** when possible
3. **Back up your database** before letting AI write to it
4. **Always review** the SQL before approving the tool call
5. **Use a test/development database** for learning

### Creating a Read-Only PostgreSQL User

```sql
-- Run this in your PostgreSQL database
CREATE USER mcp_readonly WITH PASSWORD 'safe_password';
GRANT CONNECT ON DATABASE mydb TO mcp_readonly;
GRANT USAGE ON SCHEMA public TO mcp_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO mcp_readonly;
```

Then use this connection string:
```
postgresql://mcp_readonly:safe_password@localhost:5432/mydb
```

---

## 🧪 Exercise: Create a Practice Database

### Step 1: Install Python and uv

```bash
pip install uv
```

### Step 2: Configure SQLite server pointing to a new file

```json
{
  "servers": {
    "sqlite": {
      "command": "uvx",
      "args": [
        "mcp-server-sqlite",
        "--db-path",
        "C:/Users/You/Documents/practice.db"
      ]
    }
  }
}
```

### Step 3: Ask AI to set up sample data

In Agent mode, say:
```
"Create a sample bookstore database with:
 - A 'books' table (id, title, author, price, published_year)
 - An 'authors' table (id, name, country)
 - Insert 10 sample books and 5 sample authors
 Then show me the most expensive book by each author"
```

Watch the AI create tables, insert data, and query it — all in natural language!

---

## 🔥 Pro Tip: Combine Database + Fetch

```json
{
  "servers": {
    "sqlite": {
      "command": "uvx",
      "args": ["mcp-server-sqlite", "--db-path", "C:/Users/You/data.db"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
```

Now you can say:
```
"Fetch the JSON data from https://jsonplaceholder.typicode.com/users 
 and store it in a 'users' table in my database"
```

---

## ✅ Module 6 Checklist

- [ ] I understand the two database servers (SQLite and PostgreSQL)
- [ ] I configured at least one database server
- [ ] I successfully queried a database through AI
- [ ] I understand the security implications

---

**⬅️ Previous: [Module 5 — Fetch MCP Server](05-fetch-mcp-server.md)**
**➡️ Next: [Module 7 — Community & Custom Servers](07-community-and-custom.md)**
