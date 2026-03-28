import PostgresEditor from "./pages/PostgresEditor"
import SqlEditor from "./components/SqlEditor"
import JsEditor from "./pages/JsEditor"


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
      <h1>PostgresSQL Editor</h1>
      {/* <SqlEditor onExecute={runQuery} /> */}
      {/* <PostgresEditor/> */}
      {/* <PostgresEditor /> */}
      <JsEditor />
    </div>
  )
}

export default App