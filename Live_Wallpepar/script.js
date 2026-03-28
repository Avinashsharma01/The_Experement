// =============================================
//  YEAR PROGRESS LIVE WALLPAPER — Avinash
//  Optimized for continuous background usage
// =============================================

(function () {
    'use strict';

    // ---- DOM references (cached once) ----
    const $ = (id) => document.getElementById(id);
    const els = {
        yearLabel:     $('yearLabel'),
        currentDate:   $('currentDate'),
        ringPercent:   $('ringPercent'),
        ringProgress:  $('ringProgress'),
        ringGlow:      $('ringGlow'),
        secondsPassed: $('secondsPassed'),
        minutesPassed: $('minutesPassed'),
        hoursPassed:   $('hoursPassed'),
        daysPassed:    $('daysPassed'),
        weeksPassed:   $('weeksPassed'),
        monthsPassed:  $('monthsPassed'),
        countdownYear: $('countdownYear'),
        cdDays:        $('cdDays'),
        cdHours:       $('cdHours'),
        cdMinutes:     $('cdMinutes'),
        cdSeconds:     $('cdSeconds')
    };

    // Circumference of progress ring (2 * π * r, r = 115)
    const CIRCUMFERENCE = 2 * Math.PI * 115; // ≈ 722.57

    // ---- Utility: is the given year a leap year? ----
    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // ---- Utility: total seconds in a year ----
    function totalSecondsInYear(year) {
        return (isLeapYear(year) ? 366 : 365) * 86400;
    }

    // ---- Number formatting with commas ----
    function formatNum(n) {
        return n.toLocaleString('en-US');
    }

    // Pad a number with leading zeros
    function pad(n, len) {
        return String(n).padStart(len, '0');
    }

    // ---- Format the current date string ----
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    // ---- Core update function — runs every second ----
    function update() {
        const now = new Date();
        const year = now.getFullYear();

        // Start & end of year
        const yearStart = new Date(year, 0, 1, 0, 0, 0);             // Jan 1 00:00:00
        const yearEnd   = new Date(year, 11, 31, 23, 59, 59);        // Dec 31 23:59:59

        const totalSecs = totalSecondsInYear(year);

        // Elapsed seconds (fractional for smooth percentage)
        const elapsedMs  = now - yearStart;
        const elapsedSec = Math.floor(elapsedMs / 1000);

        // ---- Compute all metrics ----
        const secondsPassed = elapsedSec;
        const minutesPassed = Math.floor(elapsedSec / 60);
        const hoursPassed   = Math.floor(elapsedSec / 3600);
        const daysPassed    = Math.floor(elapsedSec / 86400);
        const weeksPassed   = Math.floor(daysPassed / 7);

        // Months passed = number of fully completed months
        const monthsPassed  = now.getMonth(); // 0-indexed = completed months

        // Percentage of year completed (3-decimal precision)
        const percent = Math.min((elapsedSec / totalSecs) * 100, 100);

        // ---- Countdown remaining ----
        const remainingMs  = Math.max(yearEnd - now, 0);
        const remTotalSec  = Math.floor(remainingMs / 1000);
        const cdDays       = Math.floor(remTotalSec / 86400);
        const cdHours      = Math.floor((remTotalSec % 86400) / 3600);
        const cdMinutes    = Math.floor((remTotalSec % 3600) / 60);
        const cdSeconds    = remTotalSec % 60;

        // ---- Update DOM ----
        els.yearLabel.textContent     = year;
        els.currentDate.textContent   = dateFormatter.format(now);
        els.countdownYear.textContent = year;

        // Progress ring
        const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
        els.ringProgress.style.strokeDashoffset = offset;
        els.ringGlow.style.strokeDashoffset     = offset;
        els.ringPercent.textContent = percent.toFixed(3);

        // Stat cards
        els.secondsPassed.textContent = formatNum(secondsPassed);
        els.minutesPassed.textContent = formatNum(minutesPassed);
        els.hoursPassed.textContent   = formatNum(hoursPassed);
        els.daysPassed.textContent    = formatNum(daysPassed);
        els.weeksPassed.textContent   = formatNum(weeksPassed);
        els.monthsPassed.textContent  = formatNum(monthsPassed);

        // Countdown
        els.cdDays.textContent    = pad(cdDays, 3);
        els.cdHours.textContent   = pad(cdHours, 2);
        els.cdMinutes.textContent = pad(cdMinutes, 2);
        els.cdSeconds.textContent = pad(cdSeconds, 2);
    }

    // ---- Unified loop — pauses automatically when page is hidden ----
    // (Lively hides the WebView on lock screen / fullscreen apps)
    let lastTickTime  = 0;
    let lastFrameTime = 0;
    const TICK_INTERVAL  = 1000;        // DOM update: once per second
    const FRAME_INTERVAL = 1000 / 12;  // particles: 12 fps — imperceptible at wallpaper speed
    let rafId = null;

    function loop(timestamp) {
        if (document.hidden) { rafId = null; return; }  // stop loop when hidden
        rafId = requestAnimationFrame(loop);

        // time update
        if (timestamp - lastTickTime >= TICK_INTERVAL) {
            update();
            lastTickTime = timestamp;
        }

        // particle draw
        if (timestamp - lastFrameTime >= FRAME_INTERVAL) {
            drawParticles();
            lastFrameTime = timestamp;
        }
    }

    function startLoop() {
        if (!rafId && !document.hidden) {
            update(); // sync immediately on resume
            rafId = requestAnimationFrame(loop);
        }
    }

    document.addEventListener('visibilitychange', () => {
        document.hidden ? (rafId = null) : startLoop();
    });

    startLoop();

    // =============================================
    //  PARTICLE BACKGROUND (low-CPU canvas)
    // =============================================
    const canvas = document.getElementById('particles');
    const ctx    = canvas.getContext('2d');

    let W, H;
    const PARTICLE_COUNT = 30;  // 30 is plenty at wallpaper scale
    const particles = [];

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Create particle pool
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.5 + 0.5,          // radius
            dx: (Math.random() - 0.5) * 0.3,        // velocity x
            dy: (Math.random() - 0.5) * 0.3,        // velocity y
            alpha: Math.random() * 0.4 + 0.1
        });
    }

    // Standalone draw — called by the unified loop at 12 fps
    function drawParticles() {
        ctx.clearRect(0, 0, W, H);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const p = particles[i];

            p.x += p.dx;
            p.y += p.dy;

            // wrap edges
            if (p.x < 0) p.x = W;
            if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H;
            if (p.y > H) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,240,255,' + p.alpha + ')';
            ctx.fill();
        }
        // Connection lines removed — O(n²) at 30fps was the top CPU consumer
    }

})();
