# Self-Learning Course: Build a Regex Tester in the Browser

> **Course Goal**: By the end of this course, you will build an interactive regex testing tool where users can write regular expressions, test them against input text, and see matches highlighted in real-time — using Monaco Editor and React.
>
> **Prerequisites**: Basic React knowledge. No regex experience required — this course teaches it!
>
> **Time**: ~40 minutes, 7 lessons

---

## Lesson 1: What Are Regular Expressions (Regex)?

Regular expressions are **pattern-matching formulas** for text. They're used everywhere — form validation, search-and-replace, data extraction, log parsing.

### Think of regex like a search filter:

```
Normal search:  "cat"     → finds the exact word "cat"
Regex search:   "c.t"     → finds "cat", "cot", "cut", "c9t", "c!t" ...
                            (the . means "any single character")
```

### Where is regex used?

```
┌────────────────────────────────────────────────────┐
│                    REGEX IS EVERYWHERE             │
├────────────────────────────────────────────────────┤
│  Form Validation     │  Is this a valid email?     │
│  Search & Replace    │  Find all phone numbers     │
│  Log Analysis        │  Extract error messages     │
│  Web Scraping        │  Pull data from HTML        │
│  URL Routing         │  Match /users/:id patterns  │
│  Syntax Highlighting │  Monaco Editor uses it!     │
│  Data Cleaning       │  Remove unwanted characters │
└────────────────────────────────────────────────────┘
```

### The anatomy of a regex:

```
    /pattern/flags
     │       │
     │       └── g = global (find all matches)
     │           i = case-insensitive
     │           m = multiline
     │
     └── The pattern to search for
```

### Quick Check

> **Question**: What does the regex `/h.t/g` match in the text "hat, hot, hit, hut, heart"?
>
> **Answer**: `hat`, `hot`, `hit`, `hut` — the `.` matches ANY single character between `h` and `t`. "heart" doesn't match because there are too many characters between `h` and `t`.

---

## Lesson 2: Build the Regex Tester Interface

Our tool needs three parts: a regex input, a test string input, and a results panel showing matches highlighted.

### Create `src/components/RegexTester.jsx`:

```jsx
import React, { useState, useMemo } from "react"

function RegexTester() {
  const [pattern, setPattern] = useState("\\b\\w+@\\w+\\.\\w+\\b")
  const [flags, setFlags] = useState("gi")
  const [testText, setTestText] = useState(
    `Contact us at hello@example.com or support@company.org.
Visit our website or email admin@test.net for more info.
Invalid emails: @missing.com, noat.com, incomplete@`
  )

  // Compute matches whenever pattern, flags, or text changes
  const results = useMemo(() => {
    try {
      if (!pattern) return { matches: [], error: null, highlighted: testText }

      const regex = new RegExp(pattern, flags)
      const matches = []
      let match

      if (flags.includes("g")) {
        while ((match = regex.exec(testText)) !== null) {
          matches.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1),
          })
          if (match.index === regex.lastIndex) regex.lastIndex++
        }
      } else {
        match = regex.exec(testText)
        if (match) {
          matches.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1),
          })
        }
      }

      // Build highlighted text
      let highlighted = ""
      let lastIndex = 0
      const globalRegex = new RegExp(pattern, flags.includes("g") ? flags : flags + "g")
      let m
      while ((m = globalRegex.exec(testText)) !== null) {
        highlighted += testText.slice(lastIndex, m.index)
        highlighted += `|||MATCH_START|||${m[0]}|||MATCH_END|||`
        lastIndex = m.index + m[0].length
        if (m.index === globalRegex.lastIndex) globalRegex.lastIndex++
      }
      highlighted += testText.slice(lastIndex)

      return { matches, error: null, highlighted }
    } catch (err) {
      return { matches: [], error: err.message, highlighted: testText }
    }
  }, [pattern, flags, testText])

  const renderHighlightedText = () => {
    const parts = results.highlighted.split(/\|\|\|MATCH_START\|\|\||\|\|\|MATCH_END\|\|\|/)
    let isMatch = false

    return parts.map((part, i) => {
      if (i > 0) isMatch = !isMatch
      if (isMatch) {
        return (
          <span
            key={i}
            style={{
              backgroundColor: "#ffd700",
              color: "#000",
              padding: "1px 2px",
              borderRadius: "3px",
              fontWeight: "bold",
            }}
          >
            {part}
          </span>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      backgroundColor: "#1e1e1e",
      color: "#d4d4d4",
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 20px",
        backgroundColor: "#6c5ce7",
        color: "white",
        fontWeight: "bold",
        fontSize: "16px",
      }}>
        Regex Tester — Test & Debug Regular Expressions
      </div>

      {/* Regex Input Row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "16px 20px",
        borderBottom: "1px solid #333",
      }}>
        <span style={{ color: "#888", fontSize: "20px" }}>/</span>
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="Enter regex pattern..."
          style={{
            flex: 1,
            padding: "10px 14px",
            backgroundColor: "#2d2d2d",
            color: "#ce9178",
            border: "1px solid #555",
            borderRadius: "4px",
            fontSize: "16px",
            fontFamily: "Consolas, monospace",
            outline: "none",
          }}
        />
        <span style={{ color: "#888", fontSize: "20px" }}>/</span>
        <input
          value={flags}
          onChange={(e) => setFlags(e.target.value)}
          placeholder="gi"
          style={{
            width: "50px",
            padding: "10px",
            backgroundColor: "#2d2d2d",
            color: "#569cd6",
            border: "1px solid #555",
            borderRadius: "4px",
            fontSize: "16px",
            fontFamily: "Consolas, monospace",
            textAlign: "center",
            outline: "none",
          }}
        />
      </div>

      {/* Error display */}
      {results.error && (
        <div style={{
          padding: "10px 20px",
          backgroundColor: "#5c1a1a",
          color: "#ff6b6b",
          fontSize: "14px",
        }}>
          ❌ Invalid Regex: {results.error}
        </div>
      )}

      {/* Main Content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Test Text Input */}
        <div style={{ flex: 1, borderRight: "2px solid #333", display: "flex", flexDirection: "column" }}>
          <div style={{
            padding: "8px 16px",
            backgroundColor: "#2d2d2d",
            fontSize: "13px",
            fontWeight: "bold",
            color: "#888",
          }}>
            TEST STRING
          </div>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            style={{
              flex: 1,
              padding: "16px",
              backgroundColor: "#1e1e1e",
              color: "#d4d4d4",
              border: "none",
              resize: "none",
              fontSize: "14px",
              fontFamily: "Consolas, monospace",
              lineHeight: "1.6",
              outline: "none",
            }}
            placeholder="Enter text to test against..."
          />
        </div>

        {/* Results Panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Highlighted Preview */}
          <div style={{ flex: 1, overflow: "auto" }}>
            <div style={{
              padding: "8px 16px",
              backgroundColor: "#2d2d2d",
              fontSize: "13px",
              fontWeight: "bold",
              color: "#888",
            }}>
              HIGHLIGHTED MATCHES ({results.matches.length} found)
            </div>
            <pre style={{
              padding: "16px",
              margin: 0,
              fontSize: "14px",
              fontFamily: "Consolas, monospace",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
            }}>
              {renderHighlightedText()}
            </pre>
          </div>

          {/* Match Details */}
          <div style={{
            borderTop: "1px solid #333",
            maxHeight: "200px",
            overflow: "auto",
          }}>
            <div style={{
              padding: "8px 16px",
              backgroundColor: "#2d2d2d",
              fontSize: "13px",
              fontWeight: "bold",
              color: "#888",
            }}>
              MATCH DETAILS
            </div>
            <div style={{ padding: "8px 16px" }}>
              {results.matches.length === 0 ? (
                <div style={{ color: "#888", padding: "8px 0" }}>
                  {results.error ? "Fix the regex error above" : "No matches found. Try a different pattern."}
                </div>
              ) : (
                results.matches.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "16px",
                      padding: "6px 0",
                      borderBottom: "1px solid #2d2d2d",
                      fontSize: "13px",
                    }}
                  >
                    <span style={{ color: "#888" }}>#{i + 1}</span>
                    <span style={{ color: "#ffd700", fontFamily: "Consolas, monospace" }}>
                      "{m.value}"
                    </span>
                    <span style={{ color: "#888" }}>index: {m.index}</span>
                    {m.groups.length > 0 && (
                      <span style={{ color: "#569cd6" }}>
                        groups: [{m.groups.map((g) => `"${g}"`).join(", ")}]
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegexTester
```

### What we built:

```
┌─────────────────────────────────────────────────┐
│ Regex Tester — Test & Debug Regular Expressions  │
├─────────────────────────────────────────────────┤
│ / \b\w+@\w+\.\w+\b / gi                        │ ← Pattern + Flags
├──────────────────────┬──────────────────────────┤
│                      │  HIGHLIGHTED MATCHES (3) │
│  TEST STRING         │  hello@example.com       │ ← Yellow highlights
│                      │  support@company.org     │
│  Contact us at       │  admin@test.net          │
│  hello@example.com   │                          │
│  or support@...      ├──────────────────────────┤
│                      │  MATCH DETAILS           │
│                      │  #1 "hello@example.com"  │
│                      │  #2 "support@company.org"│
│                      │  #3 "admin@test.net"     │
└──────────────────────┴──────────────────────────┘
```

### Try It Yourself

1. Add the component to your app
2. The default pattern matches email addresses — see 3 yellow highlights?
3. Change the pattern to `\d+` — it will highlight all numbers instead
4. Try an invalid regex like `[` — you should see an error message

> **Checkpoint**: Matches are highlighted in yellow and listed with details? Move on!

---

## Lesson 3: The Regex Cheat Sheet — Essential Patterns

### Character Classes

| Pattern | Meaning | Example Match |
|---------|---------|---------------|
| `.` | Any single character | `c.t` → cat, cot, cut |
| `\d` | Any digit (0-9) | `\d\d` → 42, 99 |
| `\D` | Any NON-digit | `\D+` → "hello" |
| `\w` | Word character (a-z, A-Z, 0-9, _) | `\w+` → "hello_world" |
| `\W` | Non-word character | `\W` → @, #, ! |
| `\s` | Whitespace (space, tab, newline) | `\s+` → "   " |
| `\S` | Non-whitespace | `\S+` → "hello" |
| `[abc]` | Any of a, b, or c | `[aeiou]` → vowels |
| `[^abc]` | NOT a, b, or c | `[^0-9]` → non-digits |
| `[a-z]` | Range: a through z | `[A-Z]` → uppercase |

### Quantifiers

| Pattern | Meaning | Example |
|---------|---------|---------|
| `*` | 0 or more | `go*d` → gd, god, good, goood |
| `+` | 1 or more | `go+d` → god, good (NOT gd) |
| `?` | 0 or 1 (optional) | `colou?r` → color, colour |
| `{3}` | Exactly 3 | `\d{3}` → 123 |
| `{2,4}` | Between 2 and 4 | `\d{2,4}` → 12, 123, 1234 |
| `{2,}` | 2 or more | `\d{2,}` → 12, 12345 |

### Anchors

| Pattern | Meaning | Example |
|---------|---------|---------|
| `^` | Start of string | `^Hello` → "Hello world" (match) |
| `$` | End of string | `world$` → "Hello world" (match) |
| `\b` | Word boundary | `\bcat\b` → "the cat sat" (matches "cat", not "category") |

### Groups and Alternation

| Pattern | Meaning | Example |
|---------|---------|---------|
| `(abc)` | Capture group | `(ha)+` → "hahaha" |
| `(?:abc)` | Non-capture group | Groups but doesn't capture |
| `a\|b` | OR | `cat\|dog` → "cat" or "dog" |

### Try Each Pattern

Test these in your regex tester with this text:
```
John is 25 years old. His email is john@email.com.
Jane is 30. Her phone is 555-123-4567.
Order #12345 was placed on 2024-01-15.
```

1. `\d+` → Find all numbers
2. `\b\w+@\w+\.\w+\b` → Find emails
3. `\d{3}-\d{3}-\d{4}` → Find phone numbers
4. `\d{4}-\d{2}-\d{2}` → Find dates
5. `#\d+` → Find order numbers

---

## Lesson 4: Real-World Regex Patterns

### Pattern 1: Email Validation

```regex
^[\w.-]+@[\w.-]+\.\w{2,}$
```

**Breakdown**:
- `^` — Start of string
- `[\w.-]+` — Username: word chars, dots, hyphens (1 or more)
- `@` — Literal @ symbol
- `[\w.-]+` — Domain name
- `\.` — Literal dot (escaped)
- `\w{2,}` — TLD: at least 2 word characters (com, org, io)
- `$` — End of string

**Test text**:
```
valid@email.com
user.name@domain.org
bad@.com
@missing.com
good+tag@mail.co.uk
```

### Pattern 2: Phone Numbers

```regex
\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}
```

**Matches**: `(555) 123-4567`, `555-123-4567`, `555.123.4567`, `5551234567`

### Pattern 3: URL Matching

```regex
https?:\/\/[\w.-]+(?:\/[\w./?%&=-]*)?
```

**Matches**: `http://example.com`, `https://api.site.com/path?q=1`

### Pattern 4: Date Formats

```regex
\d{1,2}[/-]\d{1,2}[/-]\d{2,4}
```

**Matches**: `01/15/2024`, `1-5-24`, `12/31/2023`

### Pattern 5: HTML Tags

```regex
<(\w+)[^>]*>.*?<\/\1>
```

**Matches**: `<div>content</div>`, `<p class="x">text</p>`

**The `\1`** is a **backreference** — it matches whatever the first group `(\w+)` captured. So if the opening tag is `<div>`, it matches `</div>`.

### Try Each Pattern

Copy each pattern into your regex tester and test with sample text. Modify them — see what breaks!

---

## Lesson 5: Add a Quick Reference Panel

Let's add a collapsible cheat sheet to the regex tester so users can look up patterns without leaving the tool.

```jsx
const [showCheatSheet, setShowCheatSheet] = useState(false)

const cheatSheet = [
  { category: "Basics", items: [
    { pattern: ".", desc: "Any character except newline" },
    { pattern: "\\d", desc: "Digit (0-9)" },
    { pattern: "\\w", desc: "Word character (a-z, 0-9, _)" },
    { pattern: "\\s", desc: "Whitespace" },
    { pattern: "\\b", desc: "Word boundary" },
  ]},
  { category: "Quantifiers", items: [
    { pattern: "*", desc: "0 or more" },
    { pattern: "+", desc: "1 or more" },
    { pattern: "?", desc: "0 or 1 (optional)" },
    { pattern: "{n}", desc: "Exactly n times" },
    { pattern: "{n,m}", desc: "Between n and m times" },
  ]},
  { category: "Anchors", items: [
    { pattern: "^", desc: "Start of string" },
    { pattern: "$", desc: "End of string" },
    { pattern: "\\b", desc: "Word boundary" },
  ]},
  { category: "Groups", items: [
    { pattern: "(abc)", desc: "Capture group" },
    { pattern: "a|b", desc: "Alternation (OR)" },
    { pattern: "[abc]", desc: "Character class" },
    { pattern: "[^abc]", desc: "Negated class" },
  ]},
]

// Add a toggle button in the header:
<button
  onClick={() => setShowCheatSheet(!showCheatSheet)}
  style={{
    padding: "6px 12px",
    background: showCheatSheet ? "#ffd700" : "transparent",
    color: showCheatSheet ? "#000" : "#fff",
    border: "1px solid #fff",
    borderRadius: "4px",
    cursor: "pointer",
  }}
>
  {showCheatSheet ? "Hide" : "Show"} Cheat Sheet
</button>

// Render the cheat sheet when visible:
{showCheatSheet && (
  <div style={{
    padding: "12px 20px",
    backgroundColor: "#2d2d2d",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    borderBottom: "1px solid #444",
  }}>
    {cheatSheet.map((section) => (
      <div key={section.category}>
        <h4 style={{ color: "#ffd700", margin: "0 0 8px 0" }}>{section.category}</h4>
        {section.items.map((item) => (
          <div key={item.pattern} style={{ fontSize: "12px", marginBottom: "4px" }}>
            <code style={{ color: "#ce9178" }}>{item.pattern}</code>
            <span style={{ color: "#888", marginLeft: "8px" }}>{item.desc}</span>
          </div>
        ))}
      </div>
    ))}
  </div>
)}
```

---

## Lesson 6: Regex Flags — What They Mean

### All JavaScript Regex Flags

| Flag | Name | What It Does |
|------|------|-------------|
| `g` | Global | Find ALL matches, not just the first one |
| `i` | Case-insensitive | `abc` matches `ABC`, `aBc`, etc. |
| `m` | Multiline | `^` and `$` match start/end of EACH LINE, not just the string |
| `s` | Dotall | `.` matches newlines too (normally it doesn't) |
| `u` | Unicode | Enables full Unicode support |

### Try These Flag Experiments

**Text**: `"Hello hello HELLO"`

| Pattern | Flags | Result |
|---------|-------|--------|
| `hello` | (none) | No match (case-sensitive, "Hello≠hello") |
| `hello` | `i` | 1 match: "Hello" |
| `hello` | `gi` | 3 matches: "Hello", "hello", "HELLO" |

**Text** (multiline):
```
First line
Second line
Third line
```

| Pattern | Flags | Result |
|---------|-------|--------|
| `^\w+` | `g` | 1 match: "First" (only start of string) |
| `^\w+` | `gm` | 3 matches: "First", "Second", "Third" (start of each line) |

---

## Lesson 7: Practice Challenges

Test your regex skills! Write patterns that match the specified text.

### Challenge 1: Extract all prices

**Text**: `The shirt costs $29.99, the pants are $49.50, and shoes are $89.`

**Goal**: Match `$29.99`, `$49.50`, `$89`

<details>
<summary>Solution</summary>

```regex
\$\d+(?:\.\d{2})?
```

- `\$` — literal dollar sign (escaped)
- `\d+` — one or more digits
- `(?:\.\d{2})?` — optionally match `.XX` cents

</details>

### Challenge 2: Validate passwords

**Rule**: 8+ characters, at least 1 uppercase, 1 lowercase, 1 digit.

<details>
<summary>Solution</summary>

```regex
^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$
```

- `(?=.*[A-Z])` — lookahead: must contain uppercase
- `(?=.*[a-z])` — lookahead: must contain lowercase
- `(?=.*\d)` — lookahead: must contain digit
- `.{8,}` — at least 8 characters

</details>

### Challenge 3: Extract dates from text

**Text**: `Meeting on 2024-01-15, deadline 2024-03-01, launched 2023-12-25`

**Goal**: Match all dates in YYYY-MM-DD format

<details>
<summary>Solution</summary>

```regex
\d{4}-\d{2}-\d{2}
```

</details>

### Challenge 4: Match IPv4 addresses

**Text**: `Server at 192.168.1.1, backup at 10.0.0.255, invalid 999.999.999.999`

<details>
<summary>Solution</summary>

```regex
\b(?:\d{1,3}\.){3}\d{1,3}\b
```

Note: This matches the structure but doesn't validate range (0-255). A full validator would be much longer!

</details>

### Challenge 5: Remove HTML tags

**Text**: `<p>Hello <b>World</b></p>`

**Goal**: Match all HTML tags

<details>
<summary>Solution</summary>

```regex
<\/?[\w]+[^>]*>
```

- `<` — opening bracket
- `\/?` — optional closing slash
- `[\w]+` — tag name
- `[^>]*` — any attributes
- `>` — closing bracket

</details>

---

## Course Summary

### What You Learned

| Lesson | Topic | Key Takeaway |
|--------|-------|-------------|
| 1 | What is regex? | Pattern-matching formulas for text processing |
| 2 | Building the tester | Real-time match highlighting with regex groups |
| 3 | Cheat sheet | Character classes, quantifiers, anchors, groups |
| 4 | Real-world patterns | Email, phone, URL, date, HTML tag matching |
| 5 | Quick reference panel | Built-in cheat sheet for the tool |
| 6 | Flags | `g`, `i`, `m`, `s`, `u` and their effects |
| 7 | Practice challenges | Hands-on exercises with solutions |

### What to Build Next

- [ ] Add regex replace mode (find + replace with capture group references)
- [ ] Add a "common patterns" dropdown with presets
- [ ] Show a visual regex breakdown (parse tree)
- [ ] Add different regex flavors (JavaScript, Python, PCRE)
- [ ] Save regex patterns to a library for reuse
