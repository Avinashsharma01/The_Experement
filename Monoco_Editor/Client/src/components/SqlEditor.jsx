import React, { useState } from "react"
import Editor from "@monaco-editor/react"
import PostgresEditor from "./PostgresEditor"

function SqlEditor({ onExecute }) {
  const [sql, setSql] = useState("SELECT * FROM users LIMIT 10;")

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <Editor
        height="100%"
        defaultLanguage="sql"
        defaultValue=""
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
      <div className="postgres-editor">
          <PostgresEditor/>
      </div>
    </div>
  )
}

export default SqlEditor