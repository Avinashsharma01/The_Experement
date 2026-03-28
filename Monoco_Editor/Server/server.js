const express = require('express');
const {Pool} = require('pg');
const cors = require('cors');

const app = express();
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'root',
    port: 5432,
});

app.use(cors());
app.use(express.json());


app.post("/api/query", async (req, res) => {
  const { query } = req.body

  if (!query || !query.trim()) {
    return res.status(400).json({ error: "Empty query" })
  }

  try {
    const rawResult = await pool.query(query)

    // pg can return an array for multi-statement queries; use the last statement result.
    const result = Array.isArray(rawResult)
      ? rawResult[rawResult.length - 1]
      : rawResult

    const rows = Array.isArray(result?.rows) ? result.rows : []
    const fields = Array.isArray(result?.fields)
      ? result.fields.map((f) => f.name)
      : []

    res.json({
      rows,
      rowCount: typeof result?.rowCount === "number" ? result.rowCount : rows.length,
      fields,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


app.get('/api/data', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM employees');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});