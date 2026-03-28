# Debouncing and Throttling

## Why These Concepts Matter
When users type, scroll, or click quickly, events can fire dozens or hundreds of times per second.

If every event triggers expensive work (API calls, DOM updates, calculations), your app can become slow and wasteful.

Debouncing and throttling are two strategies to control how often a function runs.

---

## 1) Debouncing

### Definition
**Debouncing** means:

> Wait until events stop for a short delay, then run the function once.

### Mental Model
- Every new event resets a timer.
- The function runs only after no new event happens during the delay.

### Best For
- Search/autocomplete API calls
- Form field validation while typing
- Save-draft after user pauses typing

### Timeline Example (500ms debounce)
Typing events at: `0ms, 120ms, 240ms, 410ms`

- Timer keeps getting reset.
- Function runs once at about `910ms` (410 + 500), after typing stops.

### Practical Benefit
If a user presses 12 keys quickly:
- Without debounce: up to 12 API calls
- With debounce: usually 1 API call

---

## 2) Throttling

### Definition
**Throttling** means:

> Run at most once every fixed interval, even if events keep firing.

### Mental Model
- First allowed event runs immediately (common style).
- Additional events during cooldown are ignored (or delayed, depending on implementation).
- After interval ends, one more event can run.

### Best For
- Scroll/resize handlers
- Preventing spam button clicks
- Mouse move or drag updates

### Timeline Example (2000ms throttle)
Clicks at: `0ms, 300ms, 900ms, 1500ms, 2300ms`

- Runs at `0ms`
- Blocks clicks until `2000ms`
- Next run at `2300ms`

### Practical Benefit
If user clicks 10 times in 2 seconds:
- Without throttle: 10 sends
- With 2s throttle: 1 send

---

## Debounce vs Throttle (Quick Comparison)

| Aspect | Debounce | Throttle |
|---|---|---|
| Main idea | Wait for silence | Limit frequency |
| When it runs | After events stop | At fixed intervals |
| Good for | Typing/search/validation | Scroll/resize/button spam |
| User feel | “Only final intent matters” | “Steady controlled updates” |

---

## Simple JavaScript Implementations

### Debounce Utility
```js
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
```

### Throttle Utility (leading style)
```js
function throttle(fn, limit) {
  let inCooldown = false;
  return function (...args) {
    if (inCooldown) return;
    fn.apply(this, args);
    inCooldown = true;
    setTimeout(() => {
      inCooldown = false;
    }, limit);
  };
}
```

---

## How This Matches Your Demo

From your page:
- **Debounce example**: search input waits before sending simulated API call.
- **Throttle example**: notification button allows send, then blocks repeated clicks for cooldown.

That is exactly the core difference:
- Debounce = “run once after pause”
- Throttle = “run at most once per time window”

---

## Common Mistakes to Avoid

1. Using debounce for scroll progress indicators (can feel laggy).
2. Using throttle for search input (can send stale partial queries repeatedly).
3. Forgetting to clear timers when resetting component state.
4. Choosing intervals that are too long, making UI feel unresponsive.

---

## Rule of Thumb

- If you care about the **final action after user stops**: use **debounce**.
- If you need **continuous but limited updates**: use **throttle**.
