/* ===================================================
   Year Progress Dashboard — Main Script
   ===================================================
   Calculates live year-progress metrics every second
   and drives the particle background animation.
   =================================================== */

(function () {
  'use strict';

  // ─── DOM References ───────────────────────────────
  const dom = {
    currentDate:   document.getElementById('currentDate'),
    yearPercent:   document.getElementById('yearPercent'),
    ringProgress:  document.getElementById('ringProgress'),
    monthsPassed:  document.getElementById('monthsPassed'),
    weeksPassed:   document.getElementById('weeksPassed'),
    daysPassed:    document.getElementById('daysPassed'),
    hoursPassed:   document.getElementById('hoursPassed'),
    minutesPassed: document.getElementById('minutesPassed'),
    secondsPassed: document.getElementById('secondsPassed'),
    monthsBar:     document.getElementById('monthsBar'),
    weeksBar:      document.getElementById('weeksBar'),
    daysBar:       document.getElementById('daysBar'),
    hoursBar:      document.getElementById('hoursBar'),
    minutesBar:    document.getElementById('minutesBar'),
    secondsBar:    document.getElementById('secondsBar'),
    cdDays:        document.getElementById('cdDays'),
    cdHours:       document.getElementById('cdHours'),
    cdMinutes:     document.getElementById('cdMinutes'),
    cdSeconds:     document.getElementById('cdSeconds'),
    countdownYear: document.getElementById('countdownYear'),
  };

  // Circumference of the SVG ring (2 * π * r, r = 115)
  const CIRCUMFERENCE = 2 * Math.PI * 115;

  // ─── Helpers ──────────────────────────────────────

  /** Returns true if `y` is a leap year */
  function isLeapYear(y) {
    return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  }

  /** Total days in a given year */
  function daysInYear(y) {
    return isLeapYear(y) ? 366 : 365;
  }

  /** Format a number with locale-aware commas */
  function fmt(n) {
    return n.toLocaleString('en-US');
  }

  /** Pad a number with leading zeros */
  function pad(n, len) {
    return String(n).padStart(len, '0');
  }

  // ─── Core Calculation ─────────────────────────────
  /**
   * All progress values are derived from a single reference:
   *   elapsed = (now − yearStart) in milliseconds
   *   total   = (yearEnd − yearStart) in milliseconds
   *
   * yearStart = Jan 1 00:00:00.000 of the current year
   * yearEnd   = Jan 1 00:00:00.000 of the *next* year
   *
   * This guarantees perfect alignment —
   * percentage, seconds, minutes, hours, days, weeks
   * all come from the same snapshot of Date.now().
   */
  function computeMetrics() {
    const now = new Date();
    const year = now.getFullYear();

    const yearStart = new Date(year, 0, 1);           // Jan 1 00:00:00
    const yearEnd   = new Date(year + 1, 0, 1);       // Next Jan 1 00:00:00

    const elapsedMs = now - yearStart;
    const totalMs   = yearEnd - yearStart;

    // Fractional progress 0→1
    const progress = elapsedMs / totalMs;

    // Elapsed units (floored for display)
    const totalSec = elapsedMs / 1000;
    const seconds  = Math.floor(totalSec);
    const minutes  = Math.floor(totalSec / 60);
    const hours    = Math.floor(totalSec / 3600);
    const days     = Math.floor(totalSec / 86400);
    const weeks    = Math.floor(days / 7);
    const months   = now.getMonth(); // 0-based → completed months

    // Remaining time for the countdown
    const remainMs  = yearEnd - now;
    const remSec    = Math.floor(remainMs / 1000);
    const cdDays    = Math.floor(remSec / 86400);
    const cdHours   = Math.floor((remSec % 86400) / 3600);
    const cdMinutes = Math.floor((remSec % 3600) / 60);
    const cdSeconds = remSec % 60;

    const totalDays  = daysInYear(year);
    const totalWeeks = 52;

    return {
      year, now, progress,
      seconds, minutes, hours, days, weeks, months,
      cdDays, cdHours, cdMinutes, cdSeconds,
      totalDays, totalWeeks,
    };
  }

  // ─── Render ───────────────────────────────────────
  function render() {
    const m = computeMetrics();

    // Header date
    dom.currentDate.textContent = m.now.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    // Circular progress ring
    const pct = m.progress * 100;
    dom.yearPercent.textContent = pct.toFixed(3);
    dom.ringProgress.style.strokeDashoffset =
      CIRCUMFERENCE - (m.progress * CIRCUMFERENCE);

    // Metric values
    dom.monthsPassed.textContent  = m.months;
    dom.weeksPassed.textContent   = m.weeks;
    dom.daysPassed.textContent    = fmt(m.days);
    dom.hoursPassed.textContent   = fmt(m.hours);
    dom.minutesPassed.textContent = fmt(m.minutes);
    dom.secondsPassed.textContent = fmt(m.seconds);

    // Mini bars (fractional fill)
    dom.monthsBar.style.width  = ((m.months / 12) * 100) + '%';
    dom.weeksBar.style.width   = ((m.weeks / m.totalWeeks) * 100) + '%';
    dom.daysBar.style.width    = ((m.days / m.totalDays) * 100) + '%';
    dom.hoursBar.style.width   = (m.progress * 100) + '%';
    dom.minutesBar.style.width = (m.progress * 100) + '%';
    dom.secondsBar.style.width = (m.progress * 100) + '%';

    // Countdown
    dom.countdownYear.textContent = m.year;
    dom.cdDays.textContent    = pad(m.cdDays, 3);
    dom.cdHours.textContent   = pad(m.cdHours, 2);
    dom.cdMinutes.textContent = pad(m.cdMinutes, 2);
    dom.cdSeconds.textContent = pad(m.cdSeconds, 2);
  }

  // Initial render + 1-second interval
  render();
  setInterval(render, 1000);

  // ─── Particle Background ─────────────────────────
  // Lightweight canvas particle field for the ambient backdrop.
  // Uses requestAnimationFrame but throttles to ~30 fps
  // and limits particle count for low CPU usage.

  (function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height, particles;
    const PARTICLE_COUNT = 60;     // keep count low
    const MAX_SPEED = 0.25;        // very slow drift
    const CONNECT_DIST = 140;      // line connection range (px)
    const FRAME_INTERVAL = 33;     // ~30 fps

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * MAX_SPEED,
          vy: (Math.random() - 0.5) * MAX_SPEED,
          r: Math.random() * 1.5 + 0.5,
        });
      }
    }

    let lastFrame = 0;
    function loop(timestamp) {
      requestAnimationFrame(loop);
      if (timestamp - lastFrame < FRAME_INTERVAL) return;
      lastFrame = timestamp;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.fill();

        // Draw connection lines to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle =
              'rgba(0, 240, 255,' + (0.08 * (1 - dist / CONNECT_DIST)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    resize();
    createParticles();
    requestAnimationFrame(loop);

    // Debounced resize handler
    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        createParticles();
      }, 200);
    });
  })();
})();
