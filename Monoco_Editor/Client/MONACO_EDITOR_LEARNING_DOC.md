# Monaco Editor Learning Doc (React + Vite)

This guide teaches you how Monaco Editor works in your project and gives you small exercises to practice.

## 1. What You Already Have

Your project already uses:

- `@monaco-editor/react`
- React + Vite
- A SQL editor component at `src/components/SqlEditor.jsx`

Current flow in `SqlEditor.jsx`:

1. `useState("")` stores query text in `sql`.
2. `Editor` renders Monaco with SQL language mode.
3. `onChange` updates React state whenever code changes.
4. `Run Query` button sends the SQL string via `onExecute(sql)`.

## 2. Monaco Basics in Your Component

From your current code:

```jsx
<Editor
  height="100%"
  defaultLanguage="sql"
  value={sql}
  onChange={(value) => setSql(value)}
  theme="vs-dark"
/>
```

What each prop means:

- `height`: editor display height
- `defaultLanguage`: syntax mode (`sql` here)
- `value`: controlled value from React state
- `onChange`: callback for user edits
- `theme`: Monaco color theme

## 3. Run the Project

Use these commands from project root:

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in terminal.

## 4. Practice Tasks (Beginner to Intermediate)

### Task 1: Add Starter SQL

In `src/components/SqlEditor.jsx`, change:

```jsx
const [sql, setSql] = useState("")
```

To:

```jsx
const [sql, setSql] = useState("SELECT * FROM users LIMIT 10;")
```

Goal: understand controlled editor values.

### Task 2: Add Editor Options

Monaco supports an `options` prop. Try:

```jsx
options={{
  minimap: { enabled: false },
  fontSize: 14,
  wordWrap: "on",
  automaticLayout: true,
}}
```

Goal: learn editor customization.

### Task 3: Add Keyboard Shortcut Hint

Add text above the button:

- "Tip: Press Ctrl+Enter to run query"
wind
Then later implement real shortcut handling.

Goal: connect editor UX with actions.

### Task 4: Validate Empty Query

Before calling `onExecute(sql)`, check:

- if query is empty/whitespace, show alert and return.

Goal: improve robustness.

### Task 5: Theme Toggle

Create a `theme` state (`vs-dark` / `light`) and a button to toggle.

Goal: practice React state + Monaco props together.

## 5. Next-Level Concepts to Learn

Once basics are clear, move to:

- SQL autocompletion suggestions
- Custom SQL snippets
- Handling Ctrl+Enter keybinding
- Displaying execution output panel
- Saving editor content to `localStorage`

## 6. Common Pitfalls

- `onChange` value can be `undefined` in some cases. Use safe fallback:

```jsx
onChange={(value) => setSql(value ?? "")}
```

- Avoid mixing `defaultValue` with a fully controlled `value` unless needed.
- Ensure parent component actually passes `onExecute`.

## 7. Quick Reference

Useful scripts:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

Main file to explore:

- `src/components/SqlEditor.jsx`

---

If you want, the next step is to turn this guide into a mini lesson plan where each task includes the exact code diff and expected result.
