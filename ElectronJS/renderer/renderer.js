// ── Load system info via IPC ──────────────────────────────────
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const info = await window.electronAPI.getAppInfo();

    document.getElementById("electron-ver").textContent = `v${info.electronVersion}`;
    document.getElementById("node-ver").textContent = `v${info.nodeVersion}`;
    document.getElementById("chrome-ver").textContent = `v${info.chromeVersion}`;
    document.getElementById("platform-info").textContent = `${info.platform} (${info.arch})`;
  } catch (err) {
    console.error("Failed to load app info:", err);
  }
});

// ── IPC Message Demo ─────────────────────────────────────────
const sendBtn = document.getElementById("send-btn");
const msgInput = document.getElementById("msg-input");
const responseBox = document.getElementById("response-box");

sendBtn.addEventListener("click", async () => {
  const message = msgInput.value.trim();
  if (!message) return;

  const result = await window.electronAPI.showMessage(message);
  responseBox.textContent = `Main process responded: "${result}"`;
  responseBox.classList.add("visible");
});

msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

// ── Counter Demo ─────────────────────────────────────────────
let count = 0;
const counterDisplay = document.getElementById("counter");
const incBtn = document.getElementById("inc-btn");
const decBtn = document.getElementById("dec-btn");

incBtn.addEventListener("click", () => {
  count++;
  counterDisplay.textContent = count;
});

decBtn.addEventListener("click", () => {
  count--;
  counterDisplay.textContent = count;
});
