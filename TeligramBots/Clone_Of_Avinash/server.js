const fs = require('fs');
const path = require('path');
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const ownerTelegramId = Number(process.env.OWNER_TELEGRAM_ID || 0);
const defaultGirlfriendId = Number(process.env.GIRLFRIEND_TELEGRAM_ID || 0);
const ownerName = process.env.OWNER_NAME || 'Avinash';
const assistantName = process.env.ASSISTANT_NAME || 'Avinash Away Assistant';
const port = Number(process.env.PORT || 3001);
const useWebhook = process.env.USE_WEBHOOK === 'true' || !!process.env.RENDER;
const webhookPath = process.env.TELEGRAM_WEBHOOK_PATH || '/telegram/webhook';
const telegramSecretToken = process.env.TELEGRAM_SECRET_TOKEN;
const configuredWebhookUrl = process.env.TELEGRAM_WEBHOOK_URL;

if (!token) {
  throw new Error('Missing TELEGRAM_BOT_TOKEN in environment variables.');
}

if (!ownerTelegramId) {
  throw new Error('Missing OWNER_TELEGRAM_ID in environment variables.');
}

const dataDir = path.join(__dirname, 'data');
const stateFile = path.join(dataDir, 'state.json');

function ensureStateFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(stateFile)) {
    const initialState = {
      awayMode: true,
      girlfriendChatId: defaultGirlfriendId || null,
      ownerName,
      assistantName,
      customAwayLine: ''
    };
    fs.writeFileSync(stateFile, JSON.stringify(initialState, null, 2), 'utf8');
  }
}

function readState() {
  ensureStateFile();
  try {
    const raw = fs.readFileSync(stateFile, 'utf8');
    return JSON.parse(raw);
  } catch (_err) {
    return {
      awayMode: true,
      girlfriendChatId: defaultGirlfriendId || null,
      ownerName,
      assistantName,
      customAwayLine: ''
    };
  }
}

function writeState(next) {
  fs.writeFileSync(stateFile, JSON.stringify(next, null, 2), 'utf8');
}

function isOwner(msg) {
  return Number(msg.from?.id) === ownerTelegramId;
}

function buildAutoReply(text, state) {
  const normalized = String(text || '').toLowerCase();

  if (state.customAwayLine && state.customAwayLine.trim()) {
    return state.customAwayLine.trim();
  }

  if (/miss|love|yaad/.test(normalized)) {
    return `${state.ownerName} is away right now, but wanted me to say: you are important to him and he will text you as soon as he is free.`;
  }

  if (/call|phone|video/.test(normalized)) {
    return `${state.ownerName} is currently unavailable. I will make sure he sees this and connects with you when he gets back.`;
  }

  if (/where|kab|when/.test(normalized)) {
    return `${state.ownerName} is busy at the moment. He will reply as soon as possible.`;
  }

  return `${state.ownerName} is away right now, so this is his assistant replying. I will pass your message to him and he will respond when free.`;
}

const app = express();
app.use(express.json());

const bot = new TelegramBot(token, useWebhook ? {} : { polling: true });

app.get('/', (_req, res) => {
  const state = readState();
  res.status(200).json({
    ok: true,
    service: 'clone-of-avinash-away-assistant',
    mode: useWebhook ? 'webhook' : 'polling',
    awayMode: state.awayMode,
    girlfriendChatIdConfigured: !!state.girlfriendChatId
  });
});

app.post(webhookPath, (req, res) => {
  if (telegramSecretToken) {
    const incomingToken = req.get('x-telegram-bot-api-secret-token');
    if (incomingToken !== telegramSecretToken) {
      res.status(403).json({ ok: false, message: 'Invalid telegram secret token.' });
      return;
    }
  }

  bot.processUpdate(req.body);
  res.sendStatus(200);
});

const helpText = [
  `${assistantName}`,
  '',
  'Owner commands:',
  '/status - show current config',
  '/away_on - enable auto replies',
  '/away_off - disable auto replies',
  '/set_gf - set current chat as girlfriend chat',
  '/set_custom <text> - set custom away reply line',
  '/clear_custom - remove custom away reply line',
  '',
  'This bot replies only in away mode and only to configured girlfriend chat.'
].join('\n');

bot.onText(/^\/start$/, (msg) => {
  bot.sendMessage(msg.chat.id, helpText);
});

bot.onText(/^\/help$/, (msg) => {
  bot.sendMessage(msg.chat.id, helpText);
});

bot.onText(/^\/status$/, (msg) => {
  if (!isOwner(msg)) {
    bot.sendMessage(msg.chat.id, 'Only owner can use this command.');
    return;
  }

  const state = readState();
  bot.sendMessage(
    msg.chat.id,
    [
      `Away mode: ${state.awayMode ? 'ON' : 'OFF'}`,
      `Girlfriend chat id: ${state.girlfriendChatId || 'Not set'}`,
      `Custom away line: ${state.customAwayLine ? 'Set' : 'Not set'}`
    ].join('\n')
  );
});

bot.onText(/^\/away_on$/, (msg) => {
  if (!isOwner(msg)) {
    bot.sendMessage(msg.chat.id, 'Only owner can use this command.');
    return;
  }

  const state = readState();
  state.awayMode = true;
  writeState(state);
  bot.sendMessage(msg.chat.id, 'Away mode enabled.');
});

bot.onText(/^\/away_off$/, (msg) => {
  if (!isOwner(msg)) {
    bot.sendMessage(msg.chat.id, 'Only owner can use this command.');
    return;
  }

  const state = readState();
  state.awayMode = false;
  writeState(state);
  bot.sendMessage(msg.chat.id, 'Away mode disabled.');
});

bot.onText(/^\/set_gf$/, (msg) => {
  if (!isOwner(msg)) {
    bot.sendMessage(msg.chat.id, 'Only owner can use this command.');
    return;
  }

  const state = readState();
  state.girlfriendChatId = Number(msg.chat.id);
  writeState(state);
  bot.sendMessage(msg.chat.id, `Configured girlfriend chat id to ${state.girlfriendChatId}.`);
});

bot.onText(/^\/set_custom\s+([\s\S]+)$/i, (msg, match) => {
  if (!isOwner(msg)) {
    bot.sendMessage(msg.chat.id, 'Only owner can use this command.');
    return;
  }

  const customText = String(match?.[1] || '').trim();
  if (!customText) {
    bot.sendMessage(msg.chat.id, 'Please provide a custom message. Example: /set_custom I am in class, will call at 8 PM.');
    return;
  }

  const state = readState();
  state.customAwayLine = customText;
  writeState(state);
  bot.sendMessage(msg.chat.id, 'Custom away line saved.');
});

bot.onText(/^\/clear_custom$/, (msg) => {
  if (!isOwner(msg)) {
    bot.sendMessage(msg.chat.id, 'Only owner can use this command.');
    return;
  }

  const state = readState();
  state.customAwayLine = '';
  writeState(state);
  bot.sendMessage(msg.chat.id, 'Custom away line cleared.');
});

bot.on('message', (msg) => {
  const text = String(msg.text || '');
  if (!text || text.startsWith('/')) {
    return;
  }

  const state = readState();
  if (!state.awayMode || !state.girlfriendChatId) {
    return;
  }

  const isConfiguredGirlfriendChat = Number(msg.chat.id) === Number(state.girlfriendChatId);
  if (!isConfiguredGirlfriendChat) {
    return;
  }

  const autoReply = buildAutoReply(text, state);
  bot.sendMessage(msg.chat.id, autoReply);
});

if (!useWebhook) {
  bot.on('polling_error', (error) => {
    console.error('Telegram polling error:', error.message);
  });
}

app.listen(port, async () => {
  console.log(`Clone_of_Avinash server running at http://localhost:${port}`);

  if (!useWebhook) {
    return;
  }

  const baseUrl = configuredWebhookUrl || process.env.RENDER_EXTERNAL_URL;
  if (!baseUrl) {
    console.warn('Webhook mode enabled, but TELEGRAM_WEBHOOK_URL/RENDER_EXTERNAL_URL is missing.');
    return;
  }

  const finalWebhookUrl = `${baseUrl.replace(/\/$/, '')}${webhookPath}`;
  try {
    await bot.setWebHook(finalWebhookUrl, telegramSecretToken ? { secret_token: telegramSecretToken } : {});
    console.log(`Telegram webhook set to ${finalWebhookUrl}`);
  } catch (error) {
    console.error('Failed to set Telegram webhook:', error.message);
  }
});
