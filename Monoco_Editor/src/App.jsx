import SqlEditor from "./components/SqlEditor"

function App() {
  const runQuery = async (query) => {
    console.log("SQL to run:", query)

    // Example: call your backend API
    const res = await fetch("/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })

    const data = await res.json()
    console.table(data)
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>SQL Editor</h1>
      <SqlEditor onExecute={runQuery} />
    </div>
  )
}

export default App