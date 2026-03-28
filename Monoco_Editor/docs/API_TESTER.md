# Self-Learning Course: Build an API Tester in the Browser

> **Course Goal**: By the end of this course, you will build a Postman-like API testing tool where users can send GET, POST, PUT, and DELETE requests with custom headers and payloads — right from the browser.
>
> **Prerequisites**: Basic React knowledge. Understanding of HTTP basics is helpful.
>
> **Time**: ~45 minutes, 7 lessons

---

## Lesson 1: What Are APIs and How Do HTTP Requests Work?

### What is an API?

API = **Application Programming Interface**. It's how two programs talk to each other — like a waiter between you (the client) and the kitchen (the server).

```
You (Browser/App)               API                    Server (Database)
┌──────────────┐           ┌──────────┐           ┌──────────────┐
│ "I want all  │  REQUEST  │          │  QUERY    │              │
│  users"      │ ────────► │  Waiter  │ ────────► │  Kitchen     │
│              │           │          │           │  (Database)  │
│              │  RESPONSE │          │  RESULT   │              │
│ [{users...}] │ ◄──────── │          │ ◄──────── │              │
└──────────────┘           └──────────┘           └──────────────┘
```

### HTTP Methods — The 4 Main Actions

| Method | What It Does | Real-World Analogy | Example |
|--------|-------------|-------------------|---------|
| **GET** | Read data | "Show me the menu" | `GET /api/users` |
| **POST** | Create data | "I'd like to place an order" | `POST /api/users` + body |
| **PUT** | Update data | "Change my order to..." | `PUT /api/users/1` + body |
| **DELETE** | Remove data | "Cancel my order" | `DELETE /api/users/1` |

### Anatomy of an HTTP Request

```
POST https://api.example.com/users
                │
                └── URL (where to send the request)

Headers:
  Content-Type: application/json     ← "I'm sending JSON data"
  Authorization: Bearer abc123       ← "Here's my ID card"

Body (for POST/PUT):
  {
    "name": "Alice",
    "email": "alice@example.com"
  }
```

### Anatomy of an HTTP Response

```
Status: 200 OK                      ← Success!
        201 Created                  ← Resource was created
        400 Bad Request              ← You sent something wrong
        401 Unauthorized             ← You're not logged in
        404 Not Found                ← That resource doesn't exist
        500 Internal Server Error    ← Server broke

Headers:
  Content-Type: application/json
  X-Request-Id: abc123

Body:
  {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com"
  }
```

### Quick Check

> **Question**: You want to create a new blog post. Which HTTP method do you use?
>
> **Answer**: **POST**. POST creates new resources. You'd send `POST /api/posts` with the blog post data in the body.

---

## Lesson 2: Build the API Tester Interface

### Create `src/components/ApiTester.jsx`:

```jsx
import React, { useState } from "react"
import Editor from "@monaco-editor/react"

function ApiTester() {
  const [method, setMethod] = useState("GET")
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1")
  const [headers, setHeaders] = useState(`{
  "Content-Type": "application/json"
}`)
  const [body, setBody] = useState(`{
  "title": "Hello API",
  "body": "This is a test post",
  "userId": 1
}`)
  const [response, setResponse] = useState("")
  const [responseHeaders, setResponseHeaders] = useState("")
  const [statusCode, setStatusCode] = useState(null)
  const [responseTime, setResponseTime] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("body")
  const [responseTab, setResponseTab] = useState("body")

  const sendRequest = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResponse("")
    setStatusCode(null)
    setResponseTime(null)

    const startTime = performance.now()

    try {
      let parsedHeaders = {}
      try {
        parsedHeaders = JSON.parse(headers)
      } catch {
        // Use default headers
      }

      const options = {
        method,
        headers: parsedHeaders,
      }

      if (method !== "GET" && method !== "HEAD") {
        options.body = body
      }

      const res = await fetch(url, options)
      const endTime = performance.now()

      setStatusCode(res.status)
      setResponseTime(Math.round(endTime - startTime))

      // Capture response headers
      const resHeaders = {}
      res.headers.forEach((value, key) => {
        resHeaders[key] = value
      })
      setResponseHeaders(JSON.stringify(resHeaders, null, 2))

      // Parse response body
      const contentType = res.headers.get("content-type") || ""
      let responseBody
      if (contentType.includes("application/json")) {
        const data = await res.json()
        responseBody = JSON.stringify(data, null, 2)
      } else {
        responseBody = await res.text()
      }

      setResponse(responseBody)
    } catch (err) {
      setResponse(`❌ Request Failed: ${err.message}`)
      setStatusCode("Error")
      setResponseTime(Math.round(performance.now() - startTime))
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = () => {
    if (!statusCode) return "#888"
    if (statusCode < 300) return "#4CAF50"   // 2xx = green
    if (statusCode < 400) return "#ffd700"   // 3xx = yellow
    if (statusCode < 500) return "#ff9800"   // 4xx = orange
    return "#f44336"                          // 5xx = red
  }

  const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"]
  const methodColors = {
    GET: "#4CAF50",
    POST: "#ffd700",
    PUT: "#2196F3",
    PATCH: "#9c27b0",
    DELETE: "#f44336",
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
        backgroundColor: "#ff6600",
        color: "white",
        fontWeight: "bold",
        fontSize: "16px",
      }}>
        API Tester — Send HTTP Requests
      </div>

      {/* URL Bar */}
      <div style={{
        display: "flex",
        gap: "8px",
        padding: "12px 20px",
        backgroundColor: "#2d2d2d",
        alignItems: "center",
      }}>
        {/* Method Selector */}
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          style={{
            padding: "10px 16px",
            backgroundColor: methodColors[method],
            color: method === "POST" ? "#000" : "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {methods.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* URL Input */}
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter request URL..."
          style={{
            flex: 1,
            padding: "10px 14px",
            backgroundColor: "#1e1e1e",
            color: "#d4d4d4",
            border: "1px solid #555",
            borderRadius: "4px",
            fontSize: "14px",
            fontFamily: "Consolas, monospace",
            outline: "none",
          }}
        />

        {/* Send Button */}
        <button
          onClick={sendRequest}
          disabled={loading}
          style={{
            padding: "10px 24px",
            backgroundColor: loading ? "#555" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Sending..." : "Send ▶"}
        </button>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Request Panel */}
        <div style={{ flex: 1, borderRight: "2px solid #333", display: "flex", flexDirection: "column" }}>
          {/* Request Tabs */}
          <div style={{ display: "flex", backgroundColor: "#2d2d2d" }}>
            {["body", "headers"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: activeTab === tab ? "#1e1e1e" : "#2d2d2d",
                  color: activeTab === tab ? "#fff" : "#888",
                  border: "none",
                  borderBottom: activeTab === tab ? "2px solid #ff6600" : "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Request Content */}
          <Editor
            height="100%"
            defaultLanguage="json"
            value={activeTab === "body" ? body : headers}
            onChange={(value) => {
              if (activeTab === "body") setBody(value ?? "")
              else setHeaders(value ?? "")
            }}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              automaticLayout: true,
              tabSize: 2,
              readOnly: activeTab === "body" && (method === "GET" || method === "DELETE"),
            }}
          />
          {activeTab === "body" && (method === "GET" || method === "DELETE") && (
            <div style={{
              padding: "8px 16px",
              backgroundColor: "#2d2d2d",
              color: "#888",
              fontSize: "12px",
              textAlign: "center",
            }}>
              {method} requests typically don't have a body
            </div>
          )}
        </div>

        {/* Response Panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Response Status Bar */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 16px",
            backgroundColor: "#2d2d2d",
            alignItems: "center",
          }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              {statusCode && (
                <span style={{
                  padding: "4px 12px",
                  backgroundColor: getStatusColor(),
                  color: "#fff",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontWeight: "bold",
                }}>
                  {statusCode}
                </span>
              )}
              {responseTime && (
                <span style={{ color: "#888", fontSize: "12px" }}>
                  {responseTime}ms
                </span>
              )}
            </div>

            {/* Response Tabs */}
            <div style={{ display: "flex", gap: "4px" }}>
              {["body", "headers"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setResponseTab(tab)}
                  style={{
                    padding: "4px 12px",
                    backgroundColor: responseTab === tab ? "#444" : "transparent",
                    color: responseTab === tab ? "#fff" : "#888",
                    border: "1px solid #555",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                    textTransform: "uppercase",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Response Body */}
          <Editor
            height="100%"
            defaultLanguage="json"
            value={responseTab === "body" ? response : responseHeaders}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              automaticLayout: true,
              readOnly: true,
              tabSize: 2,
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default ApiTester
```

### What we built:

```
┌──────────────────────────────────────────────────────────────┐
│ API Tester — Send HTTP Requests                              │
├──────────────────────────────────────────────────────────────┤
│ [GET ▼]  https://jsonplaceholder.typicode.com/posts/1 [Send] │
├─────────────────────────┬────────────────────────────────────┤
│  REQUEST                │  RESPONSE          200  120ms     │
│  [Body] [Headers]       │  [Body] [Headers]                 │
│                         │                                    │
│  {                      │  {                                 │
│    "title": "Hello",    │    "userId": 1,                   │
│    "body": "Test"       │    "id": 1,                       │
│  }                      │    "title": "sunt aut..."         │
│                         │  }                                 │
└─────────────────────────┴────────────────────────────────────┘
```

### Try It Yourself

1. Add the component — the default URL is a free test API
2. Click "Send" — you should see a JSON response with status `200`
3. Change method to POST — see the body editor activate
4. Try a wrong URL — see the error handling

> **Checkpoint**: GET request works and shows response? Move on!

---

## Lesson 3: Understanding HTTP Status Codes

### Status Code Families

```
1xx — Informational     (rarely seen)
2xx — Success           ✅ Everything worked!
3xx — Redirection       ↪️  Go somewhere else
4xx — Client Error      ❌ YOU did something wrong
5xx — Server Error      💥 THEY did something wrong
```

### The Most Important Status Codes

| Code | Meaning | When You See It |
|------|---------|----------------|
| **200** | OK | Successful GET, PUT, DELETE |
| **201** | Created | Successful POST (new resource created) |
| **204** | No Content | Successful request with no body to return |
| **301** | Moved Permanently | URL has changed forever |
| **400** | Bad Request | Your request has invalid data |
| **401** | Unauthorized | You need to log in |
| **403** | Forbidden | You're logged in but don't have permission |
| **404** | Not Found | The resource doesn't exist |
| **405** | Method Not Allowed | You used GET but it only accepts POST |
| **422** | Unprocessable Entity | Data format is right but values are wrong |
| **429** | Too Many Requests | Rate limiting — slow down! |
| **500** | Internal Server Error | The server crashed |
| **502** | Bad Gateway | A server in the chain is down |
| **503** | Service Unavailable | Server is overloaded or in maintenance |

### Try These Requests

Use `https://jsonplaceholder.typicode.com` — a free fake API:

| Action | Method | URL | Expected Status |
|--------|--------|-----|-----------------|
| Get all posts | GET | /posts | 200 |
| Get one post | GET | /posts/1 | 200 |
| Get nonexistent | GET | /posts/999 | 404 |
| Create a post | POST | /posts | 201 |
| Update a post | PUT | /posts/1 | 200 |
| Delete a post | DELETE | /posts/1 | 200 |

---

## Lesson 4: Request Headers — What They Mean

### Common Request Headers

| Header | What It Does | Example |
|--------|-------------|---------|
| `Content-Type` | Tells server what format your data is in | `application/json` |
| `Authorization` | Sends your login token | `Bearer eyJhbGci...` |
| `Accept` | Tells server what format you want back | `application/json` |
| `User-Agent` | Identifies your client | `MyApp/1.0` |
| `X-Request-ID` | Unique ID for tracking this request | `uuid-here` |

### Common Response Headers

| Header | What It Does | Why It Matters |
|--------|-------------|----------------|
| `Content-Type` | Format of the response | Know how to parse it |
| `Content-Length` | Size of response body | Know how much data is coming |
| `Cache-Control` | Caching rules | Performance optimization |
| `Rate-Limit-Remaining` | API calls left | Don't exceed your quota |
| `X-Response-Time` | How long the server took | Performance monitoring |

### Try It

1. Send a GET request
2. Click the "Headers" tab in the response panel
3. Look at `content-type`, `cache-control`, and other headers
4. Try adding a custom header like `X-Custom: hello` — see it in the request

---

## Lesson 5: Test Different APIs

### Free Public APIs to Practice With

| API | Base URL | What It Returns |
|-----|----------|----------------|
| JSONPlaceholder | `https://jsonplaceholder.typicode.com` | Fake blog data |
| Dog API | `https://dog.ceo/api/breeds/image/random` | Random dog images |
| JokeAPI | `https://v2.jokeapi.dev/joke/Any` | Random jokes |
| IP Info | `https://ipapi.co/json/` | Your IP information |
| Cat Facts | `https://catfact.ninja/fact` | Random cat facts |

### Practice Requests

**1. Get a random dog image:**
```
GET https://dog.ceo/api/breeds/image/random
```

**2. Get a joke:**
```
GET https://v2.jokeapi.dev/joke/Programming?type=single
```

**3. Create a fake post (POST):**
```
POST https://jsonplaceholder.typicode.com/posts
Headers: { "Content-Type": "application/json" }
Body: {
  "title": "My Test Post",
  "body": "Testing API from my own tool!",
  "userId": 1
}
```

**4. Update a post (PUT):**
```
PUT https://jsonplaceholder.typicode.com/posts/1
Headers: { "Content-Type": "application/json" }
Body: {
  "id": 1,
  "title": "Updated Title",
  "body": "Updated body content",
  "userId": 1
}
```

---

## Lesson 6: Add Request History

Keep track of all requests sent:

```jsx
const [requestHistory, setRequestHistory] = useState([])

// Inside sendRequest, after getting response:
setRequestHistory((prev) => [
  {
    method,
    url,
    status: res.status,
    time: Math.round(endTime - startTime),
    timestamp: new Date().toLocaleTimeString(),
  },
  ...prev,
].slice(0, 50))  // Keep last 50 requests

// Render history sidebar:
<div style={{
  width: "250px",
  borderRight: "1px solid #333",
  overflow: "auto",
  backgroundColor: "#1a1a1a",
}}>
  <div style={{ padding: "8px 12px", fontWeight: "bold", color: "#888", fontSize: "13px" }}>
    HISTORY
  </div>
  {requestHistory.map((req, i) => (
    <div
      key={i}
      onClick={() => { setMethod(req.method); setUrl(req.url) }}
      style={{
        padding: "8px 12px",
        borderBottom: "1px solid #2d2d2d",
        cursor: "pointer",
        fontSize: "12px",
      }}
    >
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={{
          color: methodColors[req.method],
          fontWeight: "bold",
          fontSize: "11px",
        }}>
          {req.method}
        </span>
        <span style={{ color: req.status < 400 ? "#4CAF50" : "#f44336" }}>
          {req.status}
        </span>
        <span style={{ color: "#555" }}>{req.time}ms</span>
      </div>
      <div style={{
        color: "#888",
        fontSize: "11px",
        marginTop: "2px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}>
        {req.url}
      </div>
    </div>
  ))}
</div>
```

---

## Lesson 7: Common API Mistakes — Debug Practice

### Mistake 1: Wrong Content-Type

```
POST /api/users
Content-Type: text/plain     ← WRONG!
Body: {"name": "Alice"}

Server says: 400 Bad Request — "Cannot parse body"
```

**Fix**: Use `Content-Type: application/json`

### Mistake 2: Sending body with GET

```
GET /api/users
Body: {"filter": "active"}   ← GET requests shouldn't have a body!
```

**Fix**: Use query parameters: `GET /api/users?filter=active`

### Mistake 3: Missing Authorization

```
GET /api/private/data
(no Authorization header)

Server says: 401 Unauthorized
```

**Fix**: Add `Authorization: Bearer your_token_here`

### Mistake 4: Not handling CORS

```
Browser console: "Access to fetch at 'http://api.com' has been blocked by CORS policy"
```

**Why**: The API server doesn't allow requests from your domain.

**Fix**: This is a **server-side** issue. The API needs to set `Access-Control-Allow-Origin` headers.

---

## Course Summary

### What You Learned

| Lesson | Topic | Key Takeaway |
|--------|-------|-------------|
| 1 | What are APIs? | HTTP methods: GET (read), POST (create), PUT (update), DELETE (remove) |
| 2 | Building the API tester | Method selector, URL input, body/headers editors, response viewer |
| 3 | Status codes | 2xx=success, 4xx=your error, 5xx=server error |
| 4 | Headers | Content-Type, Authorization, Accept, and their purposes |
| 5 | Public APIs | JSONPlaceholder, Dog API, JokeAPI for practice |
| 6 | Request history | Track and replay previous requests |
| 7 | Common mistakes | Wrong Content-Type, body with GET, missing auth, CORS |

### What to Build Next

- [ ] Add environment variables (base_url, api_key) with presets
- [ ] Save collections of related requests (like Postman collections)
- [ ] Add query parameter builder with key-value pairs
- [ ] Support form-data and file uploads
- [ ] Add response time chart for load testing
- [ ] Export requests as cURL commands
