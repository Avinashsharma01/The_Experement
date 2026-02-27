import React, { useState } from "react"
import Editor from "@monaco-editor/react"

function SqlEditor({ onExecute }) {
  const [sql, setSql] = useState("")

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <Editor
        height="100%"
        defaultLanguage="sql"
        defaultValue=""
        value={sql}
        onChange={(value) => setSql(value)}
        theme="vs-dark"
      />

      <button
        onClick={() => onExecute(sql)}
        style={{
          marginTop: "10px",
          padding: "8px 12px",
          backgroundColor: "#0D6EFD",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Run Query
      </button>
    </div>
  )
}

export default SqlEditor