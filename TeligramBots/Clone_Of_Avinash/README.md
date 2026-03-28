# Clone Of Avinash - Away Assistant Bot

This is a separate Telegram bot server that auto-replies when you are unavailable.

Important: it is designed as a transparent assistant, not as hidden impersonation.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and fill values:

- `TELEGRAM_BOT_TOKEN`: token for the second Telegram bot
- `OWNER_TELEGRAM_ID`: your Telegram numeric user id
- `GIRLFRIEND_TELEGRAM_ID`: optional fixed chat id (or set at runtime)
- `PORT`: optional, default `3001`

3. Run server:

```bash
npm start
```

## Commands

- `/start`
- `/help`
- `/status` (owner only)
- `/away_on` (owner only)
- `/away_off` (owner only)
- `/set_gf` (owner only) - sets current chat as girlfriend chat
- `/set_custom <text>` (owner only)
- `/clear_custom` (owner only)

## Behavior

- Replies only when away mode is ON.
- Replies only in configured girlfriend chat id.
- Uses transparent wording that says it is an assistant reply.

## Render Deployment

This project is ready for Render web service deployment.

1. Push this folder to GitHub.
2. Create a new Web Service in Render from that repo.
3. Render can auto-detect `render.yaml`, or you can set commands manually:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables in Render:
   - `TELEGRAM_BOT_TOKEN`
   - `OWNER_TELEGRAM_ID`
   - `GIRLFRIEND_TELEGRAM_ID` (optional)
   - `USE_WEBHOOK=true`
   - `TELEGRAM_WEBHOOK_PATH=/telegram/webhook`
   - `TELEGRAM_SECRET_TOKEN` (recommended)
5. Set `TELEGRAM_WEBHOOK_URL` to your Render service URL (for example `https://your-app.onrender.com`).

Notes:

- If `TELEGRAM_WEBHOOK_URL` is not set, the app tries `RENDER_EXTERNAL_URL` automatically.
- Local data in `data/state.json` is ephemeral on Render, so keep important defaults in env vars.
