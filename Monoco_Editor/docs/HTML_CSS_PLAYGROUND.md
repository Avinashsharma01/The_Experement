# Self-Learning Course: Build an HTML/CSS Playground in the Browser

> **Course Goal**: By the end of this course, you will build a live HTML/CSS playground where users can write markup and styles and see the result rendered in real-time — like CodePen, but yours.
>
> **Prerequisites**: Basic React knowledge. Familiarity with HTML/CSS basics is helpful.
>
> **Time**: ~40 minutes, 7 lessons

---

## Lesson 1: How Browsers Turn HTML/CSS into What You See

Before building, let's understand what happens when a browser loads HTML/CSS. It's a pipeline — just like compilation, but visual.

### The Browser Rendering Pipeline

```
You write:              Step 1            Step 2            Step 3            Step 4
┌──────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│ index.html   │ ─► │  HTML      │ ─► │   CSSOM    │ ─► │  Layout    │ ─► │  Paint     │
│ style.css    │    │  Parser    │    │  Builder   │    │  Engine    │    │  Engine    │
│              │    │            │    │            │    │            │    │            │
│ <div>Hello   │    │ Builds DOM │    │ Builds CSS │    │ Calculates │    │ Draws      │
│ </div>       │    │ Tree       │    │ Object     │    │ positions  │    │ pixels on  │
│              │    │            │    │ Model      │    │ & sizes    │    │ screen     │
└──────────────┘    └────────────┘    └────────────┘    └────────────┘    └────────────┘
```

### Think of it like building a house:

1. **HTML Parser** = Drawing the blueprint (structure: rooms, walls, doors)
2. **CSSOM Builder** = Choosing paint colors and furniture (styles)
3. **Layout Engine** = Measuring and positioning everything on the lot
4. **Paint Engine** = Actually painting and placing everything

### HTML vs CSS — Different Jobs

```
HTML = STRUCTURE              CSS = STYLE
┌─────────────────┐          ┌─────────────────┐
│ <h1>Title</h1>  │          │ h1 {             │
│ <p>Text</p>     │          │   color: blue;   │
│ <button>Go</btn>│          │   font-size: 24; │
│ <img src="..."> │          │ }                │
└─────────────────┘          └─────────────────┘
"WHAT is on the page"        "HOW it looks"
```

### Why is this different from compilation?

| Language | Process | Output |
|----------|---------|--------|
| C | Source → Machine code | .exe file |
| Java | Source → Bytecode | .class file |
| Python | Source → Bytecode | Runs on PVM |
| **HTML/CSS** | **Source → DOM + CSSOM** | **Visual pixels on screen** |

HTML/CSS doesn't "compile" — it gets **parsed** and **rendered**. There's no executable file. The browser IS the runtime.

### Quick Check

> **Question**: What builds first — the DOM tree or the CSSOM?
>
> **Answer**: They build **simultaneously**! The HTML parser builds the DOM while the CSS parser builds the CSSOM. Both need to be ready before layout and painting can start.

---

## Lesson 2: Set Up Split Editors — HTML and CSS Side by Side

Unlike other tools, our playground needs **two editors** (HTML + CSS) and a **live preview**. Let's build this layout.

### Create `src/components/HtmlCssPlayground.jsx`:

```jsx
import React, { useState, useEffect, useRef } from "react"
import Editor from "@monaco-editor/react"

function HtmlCssPlayground() {
  const [html, setHtml] = useState(`<div class="container">
  <h1>Hello, Playground!</h1>
  <p>Edit this HTML and see it render live.</p>
  <button class="btn">Click Me</button>
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </ul>
</div>`)

  const [css, setCss] = useState(`.container {
  font-family: 'Segoe UI', sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2196F3;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.btn {
  background: #4CAF50;
  color: white;
  padding: 10px 24px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.btn:hover {
  background: #45a049;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 8px;
  margin: 4px 0;
  background: #f5f5f5;
  border-radius: 4px;
}`)

  const iframeRef = useRef(null)

  // Update preview whenever HTML or CSS changes
  useEffect(() => {
    const document = iframeRef.current?.contentDocument
    if (document) {
      document.open()
      document.write(`
        <!DOCTYPE html>
        <html>
          <head><style>${css}</style></head>
          <body>${html}</body>
        </html>
      `)
      document.close()
    }
  }, [html, css])

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Editors Row */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* HTML Editor */}
        <div style={{ flex: 1, borderRight: "2px solid #333" }}>
          <div style={{
            padding: "8px 16px",
            backgroundColor: "#e44d26",
            color: "white",
            fontWeight: "bold",
            fontSize: "14px",
          }}>
            HTML
          </div>
          <Editor
            height="100%"
            defaultLanguage="html"
            value={html}
            onChange={(value) => setHtml(value ?? "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              automaticLayout: true,
              bracketPairColorization: { enabled: true },
              tabSize: 2,
            }}
          />
        </div>

        {/* CSS Editor */}
        <div style={{ flex: 1 }}>
          <div style={{
            padding: "8px 16px",
            backgroundColor: "#264de4",
            color: "white",
            fontWeight: "bold",
            fontSize: "14px",
          }}>
            CSS
          </div>
          <Editor
            height="100%"
            defaultLanguage="css"
            value={css}
            onChange={(value) => setCss(value ?? "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              automaticLayout: true,
              bracketPairColorization: { enabled: true },
              tabSize: 2,
            }}
          />
        </div>
      </div>

      {/* Live Preview */}
      <div style={{ flex: 1, borderTop: "2px solid #333" }}>
        <div style={{
          padding: "8px 16px",
          backgroundColor: "#333",
          color: "#4CAF50",
          fontWeight: "bold",
          fontSize: "14px",
        }}>
          Live Preview
        </div>
        <iframe
          ref={iframeRef}
          title="preview"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            backgroundColor: "white",
          }}
          sandbox="allow-scripts"
        />
      </div>
    </div>
  )
}

export default HtmlCssPlayground
```

### What we built:

```
┌──────────────────┬──────────────────┐
│                  │                  │
│   HTML Editor    │   CSS Editor     │
│                  │                  │
│                  │                  │
├──────────────────┴──────────────────┤
│                                     │
│          Live Preview               │
│     (renders your HTML + CSS)       │
│                                     │
└─────────────────────────────────────┘
```

### Key Concepts Explained

| Code | What It Does |
|------|-------------|
| `useRef(null)` | Creates a reference to the iframe element |
| `useEffect([html, css])` | Runs every time HTML or CSS changes — updates the preview |
| `contentDocument.write()` | Writes directly into the iframe's document |
| `sandbox="allow-scripts"` | Iframe security — allows JS but restricts rest |
| `defaultLanguage="html"` | HTML syntax highlighting with auto-close tags |
| `defaultLanguage="css"` | CSS syntax highlighting with property suggestions |

### Try It Yourself

1. Add the component to your app
2. Edit the HTML — the preview should update **instantly**
3. Change `color: #2196F3` in CSS to `color: red` — see the live result
4. Try adding a new `<div>` element

> **Checkpoint**: Can you see live preview updating as you type? If yes, move on!

---

## Lesson 3: Understanding the Live Preview Magic

### How the iframe preview works:

```
User types in HTML editor
        │
        ▼
React state updates (setHtml)
        │
        ▼
useEffect detects [html, css] changed
        │
        ▼
Build a full HTML document string:
  "<!DOCTYPE html><html><head><style>CSS_HERE</style></head><body>HTML_HERE</body></html>"
        │
        ▼
Write it into the iframe's contentDocument
        │
        ▼
Browser renders it instantly!
```

### Why use an iframe instead of `dangerouslySetInnerHTML`?

| Method | Safety | Isolation |
|--------|--------|-----------|
| `dangerouslySetInnerHTML` | Dangerous | User CSS affects YOUR app |
| **iframe** | **Safe** | **Complete isolation — user code can't break your app** |

The iframe is like a sandbox: the user's HTML/CSS lives in its own world and can't affect your React application.

### Try It Yourself

Try typing this in the HTML editor to see how the iframe keeps things safe:

```html
<style>body { background: black; color: white; }</style>
<h1>This only affects the preview!</h1>
<p>Your React app stays unchanged.</p>
```

The preview turns dark, but your editor stays the same!

---

## Lesson 4: Add Monaco IntelliSense for HTML and CSS

Monaco already has excellent HTML and CSS support built in, but let's make it even better.

### HTML Auto-Complete Features (Built-in)

Monaco's HTML mode gives you:
- **Tag auto-closing**: Type `<div>` → automatically adds `</div>`
- **Attribute suggestions**: Type `<input` → suggests `type`, `value`, `placeholder`
- **Emmet abbreviation** (if enabled): Type `div.card>h2+p` → expands to a full structure

### CSS Auto-Complete Features (Built-in)

Monaco's CSS mode gives you:
- **Property suggestions**: Type `bor` → suggests `border`, `border-radius`, etc.
- **Value suggestions**: Type `display:` → suggests `flex`, `grid`, `block`, etc.
- **Color picker**: Click on any color value to see a visual picker
- **Unit suggestions**: `px`, `em`, `rem`, `%`, `vh`, `vw`

### Add Custom CSS Snippets

```jsx
const handleEditorMount = (editor, monaco) => {
  monaco.languages.registerCompletionItemProvider("css", {
    provideCompletionItems: () => ({
      suggestions: [
        {
          label: "flexbox-center",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: `display: flex;\njustify-content: center;\nalign-items: center;`,
          documentation: "Center content with Flexbox",
        },
        {
          label: "grid-2col",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: `display: grid;\ngrid-template-columns: 1fr 1fr;\ngap: 16px;`,
          documentation: "2-column CSS Grid layout",
        },
        {
          label: "card-shadow",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: `border-radius: 8px;\nbox-shadow: 0 2px 8px rgba(0,0,0,0.1);\npadding: 16px;`,
          documentation: "Card with shadow effect",
        },
        {
          label: "smooth-transition",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: `transition: all 0.3s ease;`,
          documentation: "Smooth CSS transition",
        },
        {
          label: "responsive-image",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: `max-width: 100%;\nheight: auto;\ndisplay: block;`,
          documentation: "Make image responsive",
        },
      ],
    }),
  })
}
```

Add `onMount={handleEditorMount}` to your CSS Editor.

### Try It Yourself

1. In the CSS editor, type `flex` — see the custom `flexbox-center` snippet?
2. In the HTML editor, type `<inp` — see the auto-complete for `<input>`?
3. Type `color:` in CSS — see color value suggestions?

> **Checkpoint**: Custom snippets and built-in IntelliSense are working!

---

## Lesson 5: Add a Responsive Preview Toggle

Real-world web development requires testing on different screen sizes. Let's add device preview buttons.

### Add device preview controls:

```jsx
const [previewWidth, setPreviewWidth] = useState("100%")

const devices = [
  { name: "Desktop", width: "100%", icon: "🖥️" },
  { name: "Tablet", width: "768px", icon: "📱" },
  { name: "Mobile", width: "375px", icon: "📱" },
]

// In your JSX, before the iframe:
<div style={{
  padding: "8px 16px",
  backgroundColor: "#333",
  color: "#4CAF50",
  fontWeight: "bold",
  fontSize: "14px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}}>
  <span>Live Preview</span>
  <div style={{ display: "flex", gap: "8px" }}>
    {devices.map((device) => (
      <button
        key={device.name}
        onClick={() => setPreviewWidth(device.width)}
        style={{
          padding: "4px 12px",
          border: previewWidth === device.width ? "2px solid #4CAF50" : "1px solid #666",
          borderRadius: "4px",
          background: previewWidth === device.width ? "#4CAF50" : "transparent",
          color: previewWidth === device.width ? "#000" : "#ccc",
          cursor: "pointer",
          fontSize: "12px",
        }}
      >
        {device.icon} {device.name}
      </button>
    ))}
  </div>
</div>

// Update the iframe:
<div style={{ display: "flex", justifyContent: "center", height: "100%", background: "#1e1e1e" }}>
  <iframe
    ref={iframeRef}
    title="preview"
    style={{
      width: previewWidth,
      height: "100%",
      border: previewWidth !== "100%" ? "1px solid #666" : "none",
      backgroundColor: "white",
      transition: "width 0.3s ease",
    }}
    sandbox="allow-scripts"
  />
</div>
```

### Try It Yourself

1. Click "Mobile" — the preview narrows to 375px
2. Click "Tablet" — 768px
3. Click "Desktop" — full width
4. Try writing a responsive CSS rule:

```css
@media (max-width: 768px) {
  h1 { font-size: 18px; }
  .container { padding: 10px; }
}
```

Toggle between devices to see the media query kick in!

---

## Lesson 6: HTML/CSS Practice — Build These Layouts

### Layout 1: Card Component

**HTML:**
```html
<div class="card">
  <div class="card-header">
    <h2>CSS Card</h2>
  </div>
  <div class="card-body">
    <p>This is a reusable card component built with pure CSS.</p>
    <button class="card-btn">Learn More</button>
  </div>
</div>
```

**CSS:**
```css
.card {
  max-width: 350px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-family: sans-serif;
}

.card-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 20px;
}

.card-body {
  padding: 20px;
  background: white;
}

.card-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
}

.card-btn:hover {
  background: #5a6fd6;
}
```

### Layout 2: Flexbox Navigation

**HTML:**
```html
<nav class="navbar">
  <div class="logo">MyBrand</div>
  <ul class="nav-links">
    <li><a href="#">Home</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">Services</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>
```

**CSS:**
```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: #1a1a2e;
  color: white;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #e94560;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 24px;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: #eee;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #e94560;
}
```

### Layout 3: CSS Grid Gallery

**HTML:**
```html
<div class="gallery">
  <div class="item item-1">1</div>
  <div class="item item-2">2</div>
  <div class="item item-3">3</div>
  <div class="item item-4">4</div>
  <div class="item item-5">5</div>
  <div class="item item-6">6</div>
</div>
```

**CSS:**
```css
.gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 200px);
  gap: 12px;
  padding: 20px;
}

.item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
  border-radius: 8px;
}

.item-1 { background: #e74c3c; grid-column: span 2; }
.item-2 { background: #3498db; }
.item-3 { background: #2ecc71; }
.item-4 { background: #f39c12; }
.item-5 { background: #9b59b6; grid-column: span 2; }
.item-6 { background: #1abc9c; }
```

---

## Lesson 7: Common CSS Bugs — Debug Practice

### Bug 1: Flexbox not centering

```css
.container {
  display: flex;
  justify-content: center;
  /* Items are horizontally centered but NOT vertically! */
}
```

**Fix**: Add `align-items: center` AND `height: 100vh` (the container needs a height to center vertically).

### Bug 2: Margin collapse

```html
<div style="margin-bottom: 20px;">Box 1</div>
<div style="margin-top: 30px;">Box 2</div>
```

**Expected gap**: 50px (20 + 30). **Actual gap**: 30px!

**Why**: Adjacent vertical margins **collapse** — the larger one wins. This is a CSS spec behavior, not a bug.

**Fix**: Use padding instead, or add `display: flex; flex-direction: column; gap: 20px;` on the parent.

### Bug 3: Overflow hidden cutting off shadows

```css
.card {
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
```

The shadow gets clipped! **Fix**: Apply `overflow: hidden` to an inner element, or use `outline` instead of `box-shadow`.

### Bug 4: Z-index not working

```css
.element {
  z-index: 999;
  /* But it's still behind other elements! */
}
```

**Fix**: `z-index` only works on **positioned** elements. Add `position: relative` (or `absolute`/`fixed`).

---

## Course Summary

### What You Learned

| Lesson | Topic | Key Takeaway |
|--------|-------|-------------|
| 1 | Browser rendering pipeline | HTML → DOM, CSS → CSSOM → Layout → Paint |
| 2 | Split editor setup | Two Monaco editors + iframe preview |
| 3 | Live preview with iframe | `contentDocument.write()` updates safely in isolation |
| 4 | IntelliSense & snippets | Custom CSS snippets, built-in HTML/CSS autocomplete |
| 5 | Responsive preview | Device toggle buttons for mobile/tablet/desktop |
| 6 | Practice layouts | Cards, navigation, CSS Grid gallery |
| 7 | CSS debugging | Margin collapse, z-index, overflow, flexbox centering |

### What to Build Next

- [ ] Add a third panel for JavaScript (HTML + CSS + JS playground)
- [ ] Export/download the HTML file as a complete `.html` document
- [ ] Add preset templates (Portfolio, Landing Page, Form, etc.)
- [ ] Show a console panel for JavaScript errors in the iframe
- [ ] Add Emmet support for faster HTML writing
