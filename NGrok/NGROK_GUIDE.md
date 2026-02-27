# Complete NGrok Guide

## Table of Contents
1. [What is NGrok?](#what-is-ngrok)
2. [How NGrok Works](#how-ngrok-works)
3. [Use Cases](#use-cases)
4. [Installation](#installation)
5. [Authentication](#authentication)
6. [Basic Usage](#basic-usage)
7. [Tunneling Protocols](#tunneling-protocols)
8. [NGrok Inspect Dashboard](#ngrok-inspect-dashboard)
9. [Configuration File](#configuration-file)
10. [Custom Domains](#custom-domains)
11. [Security Features](#security-features)
12. [NGrok with Node.js / Express](#ngrok-with-nodejs--express)
13. [NGrok with Common Tools](#ngrok-with-common-tools)
14. [Free vs Paid Plans](#free-vs-paid-plans)
15. [Common Errors & Fixes](#common-errors--fixes)
16. [Tips & Best Practices](#tips--best-practices)

---

## What is NGrok?

**NGrok** is a tool that creates a **secure tunnel** from a public URL on the internet to a port running on your **local machine**.

In plain English:
> You run a server on your laptop at `localhost:3000`. NGrok gives you a public URL like `https://abc123.ngrok.io` that anyone in the world can visit — and it forwards directly to your laptop.

No deployment. No cloud server. No port forwarding on your router. Just one command.

---

## How NGrok Works

```
[ Browser / Client ]
        |
        | HTTPS request to https://abc123.ngrok.io
        v
[ NGrok Cloud Servers ]
        |
        | Encrypted tunnel (outbound connection YOU initiated)
        v
[ NGrok Agent on YOUR machine ]
        |
        | Forwards to localhost:3000
        v
[ Your Local Server ]
```

- Your machine makes an **outbound** connection to NGrok's servers.
- NGrok's servers receive public traffic and forward it through that tunnel.
- Your firewall doesn't block this because YOU opened the connection.
- All traffic is encrypted via TLS.

---

## Use Cases

### 1. Webhook Development
Services like Stripe, GitHub, Twilio, and Slack send webhooks to a public URL.  
NGrok lets you receive those webhooks directly on `localhost` while developing.

```
Stripe → https://abc123.ngrok.io/webhook → your localhost:3000/webhook
```

### 2. Sharing Work in Progress
Show a client or teammate your local site without deploying it.  
Send them the NGrok URL and they can see it live.

### 3. Testing Mobile Apps Against a Local API
Your phone can't reach `localhost` on your dev machine.  
Use an NGrok URL as the API base URL in your mobile app.

### 4. OAuth Callback URLs
OAuth providers (Google, GitHub) require a public redirect URI.  
Use your NGrok URL as the callback while testing locally.

### 5. Demoing Locally Hosted APIs
Run a demo of your REST or GraphQL API without spinning up cloud infrastructure.

### 6. IoT & Remote Device Access
Expose a service running on a Raspberry Pi or embedded device to the internet securely.

### 7. Testing HTTPS Locally
NGrok provides a free HTTPS URL, so you can test SSL-required features (like service workers, camera APIs) without a real certificate.

### 8. Bypassing Corporate Firewall / NAT
When you're behind a strict network that blocks inbound connections, NGrok still works because only outbound connections are needed.

---

## Installation

### Option A — Download Binary (Recommended)
1. Go to [https://ngrok.com/download](https://ngrok.com/download)
2. Download the binary for your OS (Windows, Mac, Linux)
3. Extract the zip file
4. Move `ngrok.exe` (Windows) or `ngrok` (Mac/Linux) to a directory in your PATH

### Option B — Windows (Chocolatey)
```powershell
choco install ngrok
```

### Option C — Mac (Homebrew)
```bash
brew install ngrok/ngrok/ngrok
```

### Option D — Linux (Snap)
```bash
snap install ngrok
```

### Option E — npm (Node.js projects)
```bash
npm install ngrok
# or globally
npm install -g ngrok
```

### Verify Installation
```bash
ngrok version
# Output: ngrok version 3.x.x
```

---

## Authentication

NGrok requires a free account to use most features.

### Step 1 — Create a free account
Go to [https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup)

### Step 2 — Get your Authtoken
After signing in, go to:  
**Dashboard → Your Authtoken** (left sidebar)

Copy the token. It looks like:
```
2abc123XYZ_someRandomStringHere
```

### Step 3 — Add the token to NGrok
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

This saves the token to your NGrok config file so you never have to enter it again.

---

## Basic Usage

### Expose an HTTP server
```bash
ngrok http 3000
```
Replace `3000` with whatever port your server is running on.

### Output you'll see:
```
Session Status      online
Account             your@email.com (Plan: Free)
Version             3.x.x
Region              United States (us)
Latency             45ms
Web Interface       http://127.0.0.1:4040
Forwarding          https://abc123.ngrok-free.app -> http://localhost:3000

Connections         ttl     opn     rt1     rt5     p50     p90
                    0       0       0.00    0.00    0.00    0.00
```

Your public URL is the `Forwarding` line — in this example:  
`https://abc123.ngrok-free.app`

### Stop NGrok
Press `Ctrl + C` in the terminal.

---

## Tunneling Protocols

NGrok supports multiple protocols beyond plain HTTP.

### HTTP / HTTPS
```bash
ngrok http 3000
```

### TCP (for databases, SSH, game servers, etc.)
```bash
ngrok tcp 22          # Expose SSH
ngrok tcp 5432        # Expose PostgreSQL
ngrok tcp 25565       # Expose Minecraft server
```

### TLS (raw TLS termination)
```bash
ngrok tls 443
```

### HTTP with a specific hostname path prefix
```bash
ngrok http --host-header=rewrite 3000
```

### Specify a region
```bash
ngrok http 3000 --region=eu    # Europe
ngrok http 3000 --region=ap    # Asia Pacific
ngrok http 3000 --region=au    # Australia
ngrok http 3000 --region=sa    # South America
ngrok http 3000 --region=jp    # Japan
ngrok http 3000 --region=in    # India
```

---

## NGrok Inspect Dashboard

When NGrok is running, it starts a **local web dashboard** at:  
`http://localhost:4040`

This dashboard lets you:
- See every HTTP request that came through the tunnel in real time
- Inspect request headers, body, query params
- See response status codes and response bodies
- **Replay** any request with one click (incredibly useful for webhooks)

### Replay a request
1. Open `http://localhost:4040`
2. Click any request in the list
3. Click **Replay** button
4. NGrok resends that exact request to your server

This is a game-changer for webhook development — no need to trigger the event again from Stripe/GitHub/etc.

---

## Configuration File

For more complex setups, use a YAML config file instead of CLI flags.

### Default config file location:
- **Windows:** `C:\Users\<you>\AppData\Local\ngrok\ngrok.yml`
- **Mac/Linux:** `~/.config/ngrok/ngrok.yml`

### Example config file:
```yaml
version: "2"
authtoken: YOUR_AUTHTOKEN_HERE

tunnels:
  frontend:
    proto: http
    addr: 3000

  backend:
    proto: http
    addr: 5000

  database:
    proto: tcp
    addr: 5432
```

### Start all tunnels from config:
```bash
ngrok start --all
```

### Start specific tunnels from config:
```bash
ngrok start frontend backend
```

---

## Custom Domains

> Available on **paid plans** only.

With a paid plan, you can use your own domain instead of a random subdomain.

### Step 1 — Add your domain in the NGrok Dashboard
Go to **Dashboard → Domains → New Domain**

### Step 2 — Add a CNAME DNS record
Point your domain (e.g. `dev.yourdomain.com`) to `tunnel.ngrok.com` via CNAME in your DNS provider.

### Step 3 — Use it with the `--domain` flag
```bash
ngrok http --domain=dev.yourdomain.com 3000
```

Now your tunnel is always at `https://dev.yourdomain.com` regardless of restarts.

---

## Security Features

### Basic Auth
Protect your tunnel with a username and password:
```bash
ngrok http 3000 --basic-auth="user:password123"
```

Anyone visiting your NGrok URL will see a browser login prompt.

### IP Allowlist / Denylist (paid)
Allow only specific IPs to access your tunnel:
```yaml
# ngrok.yml
tunnels:
  myapp:
    proto: http
    addr: 3000
    ip_restriction:
      allow_cidrs:
        - 192.168.1.0/24
        - 203.0.113.5/32
```

### Request Headers
Inject or remove headers:
```bash
ngrok http 3000 --request-header-add="X-Custom-Header:myvalue"
ngrok http 3000 --request-header-remove="X-Forwarded-For"
```

### Response Headers
```bash
ngrok http 3000 --response-header-add="Access-Control-Allow-Origin:*"
```

### OAuth Protection (paid)
Lock your tunnel behind Google/GitHub/etc. OAuth:
```yaml
tunnels:
  myapp:
    proto: http
    addr: 3000
    oauth:
      provider: google
      allow_emails:
        - yourteam@company.com
```

---

## NGrok with Node.js / Express

### Option 1 — Run NGrok separately (most common)
Just run your Express server normally, then in a second terminal:
```bash
node server.js          # Terminal 1
ngrok http 3000         # Terminal 2
```

### Option 2 — NGrok npm package (programmatic)
Install:
```bash
npm install ngrok
```

Use in code:
```javascript
const ngrok = require('ngrok');
const express = require('express');
const app = express();

const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello from NGrok tunnel!');
});

app.listen(PORT, async () => {
  const url = await ngrok.connect(PORT);
  console.log(`Server running locally on port ${PORT}`);
  console.log(`Public NGrok URL: ${url}`);
});
```

### Option 3 — @ngrok/ngrok npm package (official, newer)
```bash
npm install @ngrok/ngrok
```

```javascript
const ngrok = require('@ngrok/ngrok');
const http = require('http');

const server = http.createServer((req, res) => {
  res.end('Hello World!');
});

server.listen(3000, async () => {
  const listener = await ngrok.forward({
    addr: 3000,
    authtoken_from_env: true,  // reads NGROK_AUTHTOKEN env variable
  });
  console.log(`Tunnel at: ${listener.url()}`);
});
```

Set your authtoken as an environment variable:
```bash
# Windows PowerShell
$env:NGROK_AUTHTOKEN = "your_token_here"

# Mac/Linux
export NGROK_AUTHTOKEN="your_token_here"
```

---

## NGrok with Common Tools

### With Stripe Webhooks
1. Start NGrok: `ngrok http 3000`
2. Copy the HTTPS URL, e.g. `https://abc123.ngrok-free.app`
3. In Stripe Dashboard → Developers → Webhooks → Add endpoint
4. Set URL to: `https://abc123.ngrok-free.app/webhook`
5. Your local `/webhook` route now receives Stripe events

### With GitHub Webhooks
1. Start NGrok: `ngrok http 3000`
2. Go to your GitHub repo → Settings → Webhooks → Add webhook
3. Payload URL: `https://abc123.ngrok-free.app/github-webhook`
4. Content type: `application/json`
5. Save — GitHub will now push events to your local server

### With Twilio
1. Start NGrok: `ngrok http 3000`
2. In Twilio Console → Phone Numbers → Your number
3. Set SMS webhook to: `https://abc123.ngrok-free.app/sms`
4. Incoming SMS messages now hit your local server

### With VS Code (port forwarding alternative)
VS Code has built-in port forwarding but NGrok gives you more control for webhook testing.

---

## Free vs Paid Plans

| Feature | Free | Pay-as-you-go / Pro |
|---|---|---|
| HTTP/TCP tunnels | Yes | Yes |
| Random subdomains | Yes | Yes |
| Custom domains | No | Yes |
| Persistent subdomain | No | Yes |
| Multiple tunnels | 1 at a time | Multiple |
| IP restrictions | No | Yes |
| OAuth protection | No | Yes |
| Bandwidth | Limited | More |
| Support | Community | Priority |

**Free plan** is great for:
- Local webhook testing
- Sharing work-in-progress
- Quick demos

---

## Common Errors & Fixes

### Error: `Your account is limited to 1 simultaneous ngrok agent session`
**Cause:** You have another NGrok process running somewhere.  
**Fix:** Kill all NGrok processes and restart.
```powershell
# Windows
taskkill /F /IM ngrok.exe

# Mac/Linux
pkill ngrok
```

### Error: `failed to start tunnel: The tunnel ... is already online`
**Cause:** You're trying to use a custom domain that's already claimed.  
**Fix:** Stop the other session first, or change the domain/subdomain.

### Error: `authentication failed: Your account may not run more tunnels`
**Cause:** Free plan limit reached.  
**Fix:** Upgrade your plan or wait for the session to expire.

### Error: `ERR_NGROK_108` — Tunnel not found
**Cause:** The tunnel has stopped (NGrok was closed or crashed).  
**Fix:** Restart NGrok and update the URL.

### Webhook returning 502 Bad Gateway
**Cause:** Your local server isn't running when NGrok forwards the request.  
**Fix:** Make sure your local server is running on the correct port before starting NGrok.

### Getting the visitor browser warning page ("You are about to visit...")
**Cause:** NGrok shows a warning page for free tunnels to prevent phishing.  
**Fix #1 (API calls):** Add the header `ngrok-skip-browser-warning: true` to your requests.  
**Fix #2 (browsers):** Click through the warning, or upgrade to a paid plan.

---

## Tips & Best Practices

1. **Always start your local server before NGrok** — NGrok just tunnels, it doesn't start your app.

2. **Use the inspect dashboard** at `http://localhost:4040` — it's incredibly useful for debugging requests.

3. **Use environment variables for your authtoken** — don't hardcode it in source code.
   ```bash
   ngrok config add-authtoken YOUR_TOKEN
   ```

4. **The public URL changes on every restart** (free plan) — update any webhooks or OAuth callbacks each time you restart NGrok.

5. **Use a config file** when you need to tunnel multiple services simultaneously.

6. **For webhook development**, use the replay feature in the dashboard instead of re-triggering the event from the third-party service every time.

7. **Use `--log=stdout`** to pipe logs to a file for debugging:
   ```bash
   ngrok http 3000 --log=ngrok.log
   ```

8. **For CI/CD or automated environments**, use the `NGROK_AUTHTOKEN` environment variable instead of the config file.

9. **Don't expose sensitive services** (like databases) on free plans without adding `--basic-auth` protection.

10. **Combine with `.env` files** in Node.js to keep your NGrok token out of source control:
    ```
    # .env
    NGROK_AUTHTOKEN=your_token_here
    PORT=3000
    ```

---

## Quick Reference Cheat Sheet

```bash
# Install authtoken
ngrok config add-authtoken TOKEN

# Expose HTTP server on port 3000
ngrok http 3000

# Expose HTTP with basic auth
ngrok http 3000 --basic-auth="admin:secret"

# Expose TCP port
ngrok tcp 22

# Use a specific region
ngrok http 3000 --region=eu

# Use custom domain (paid)
ngrok http --domain=dev.example.com 3000

# Start all tunnels from config file
ngrok start --all

# View live request inspector
open http://localhost:4040

# Check version
ngrok version

# Get help
ngrok help
ngrok http --help
```

---

*NGrok Official Docs: [https://ngrok.com/docs](https://ngrok.com/docs)*  
*NGrok Dashboard: [https://dashboard.ngrok.com](https://dashboard.ngrok.com)*
