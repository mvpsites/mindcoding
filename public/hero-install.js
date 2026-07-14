/* ============================================================
   HERO INSTALL — Mind Coding · ruled 2026-07-13
   Section 01 (THE INSTALLATION) does not display the installed
   patterns — it INSTALLS them: boot line, six beliefs typed in
   with human jitter, a forensic stamp per line, the status
   flag, then the turn. The static markup is the final frame;
   this file only conceals and reveals what already exists in
   the HTML — it NEVER injects copy (SEO pipeline untouched).
   - Gate: the <head> snippet sets html.mc-hi PRE-PAINT, skipped
     when sessionStorage.mc_hero_played or reduced motion. No JS
     = no concealment = plain static hero. A 4s no-load hatch in
     the snippet un-conceals if this file never arrives.
   - Starts when the beliefs enter the viewport, after mc:enter
     on the gated landing (same wait as scroll-life).
   - ACCELERATING INSTALLER (ruled 07-13): lines 1–2 at 34ms/char
     ±40% jitter, cadence −15% per line after, floor 20ms;
     90–110ms word-boundary pauses (the space char IS the pause —
     revealing a space paints nothing); inter-line gaps shrink
     200→100; a budget governor squeezes only the scalable deltas
     (never boot, the 420ms BE REAL hesitation, stamps, blink or
     fade) to pin the total at ≤6.45s.
   - Skip is sacred: pointerdown/wheel/touchmove/keydown SNAP to
     final state — armed only once typing starts, so the scroll
     that brings the section into view cannot kill it.
   - One rAF, flat time-sorted schedule, drains everything due
     (catches up cleanly after tab throttling). ONE travelling
     gold ▌ cursor: solid typing, 530ms blink on holds.
   - ?hi-debug logs the planned total, the governor scale, beat
     marks and the measured settle time.
   ============================================================ */
(function (global) {
  'use strict';

  /* ---- timing knobs (ruled 07-13; '~' values tuned to the ≤6.5s target) ---- */
  var BOOT_START = 70, BOOT_MS = 13;      /* boot line 2 types fast, no jitter */
  var CAD_BASE = 34, CAD_FACTOR = 0.85, CAD_FLOOR = 20;
  var PAUSE_MIN = 90, PAUSE_MAX = 110;    /* word-boundary micro-pause */
  var HESITATE = 420;                     /* BE REAL … ISTIC. — never squeezed */
  var GAPS = [200, 170, 145, 120, 100];   /* inter-line, accelerating */
  var ANN = 150;                          /* stamp lands after its line */
  var STATUS = 80, BLINK = 80, FADE = 600;
  var BUDGET = 6450;                      /* hard ceiling, governor-enforced */

  /* Pure schedule builder (node-harnessed — no DOM):
       plan(boot2Text, [{text, hesitate}]) -> {events, total, scale}
     events = [{t, k, li, ci}] sorted by t. Scalable deltas (cadence,
     pauses, gaps) shrink together when the raw plan overruns BUDGET;
     fixed beats keep their ruled durations. */
  function plan(boot2, lines) {
    /* Beat 0 — boot: line 1 instant, line 2 fast, the ellipsis blinks once */
    var events = [{ t: 0, k: 'boot1' }];
    for (var b = 0; b < boot2.length; b++)
      events.push({ t: BOOT_START + b * BOOT_MS, k: 'bchar', ci: b });
    var b2end = BOOT_START + (boot2.length - 1) * BOOT_MS;
    events.push({ t: b2end + 40, k: 'bhide' });
    events.push({ t: b2end + 120, k: 'bshow' });
    var bootDone = Math.max(550, b2end + 130);

    /* Beats 1–3 as deltas: {d, sc(alable), ev:[{k, li, ci, at}]} */
    var steps = [];
    function step(d, sc, evs) { steps.push({ d: d, sc: sc, ev: evs || [] }); }

    for (var li = 0; li < lines.length; li++) {
      var text = lines[li].text;
      var cad = li < 2 ? CAD_BASE
        : Math.max(CAD_FLOOR, CAD_BASE * Math.pow(CAD_FACTOR, li - 1));
      for (var ci = 0; ci < text.length; ci++) {
        var d = text.charAt(ci) === ' '
          ? PAUSE_MIN + Math.random() * (PAUSE_MAX - PAUSE_MIN)
          : cad * (0.6 + 0.8 * Math.random());
        step(d, true, [{ k: 'char', li: li, ci: ci }]);
        if (lines[li].hesitate === ci + 1) {
          step(0, false, [{ k: 'blinkon' }]);
          step(HESITATE, false, [{ k: 'blinkoff' }]);
        }
      }
      if (li < lines.length - 1) {
        step(0, false, [{ k: 'ann', li: li, at: ANN }]);  /* stamps mid-gap */
        step(GAPS[li], true, []);
      } else {
        step(ANN, false, [{ k: 'ann', li: li }]);  /* last stamp gates the flag */
      }
    }
    /* Beat 2 — status flag: one HARD blink (visible 80, gone 80, visible) */
    step(STATUS, false, [{ k: 'status1' }]);
    step(BLINK, false, [{ k: 'status0' }]);
    step(BLINK, false, [{ k: 'status2' }]);
    /* Beat 3 — the turn fades in, then we settle */
    step(60, false, [{ k: 'fade' }]);
    step(FADE, false, [{ k: 'done' }]);

    /* budget governor */
    var fixed = bootDone, scal = 0;
    steps.forEach(function (s) { if (s.sc) scal += s.d; else fixed += s.d; });
    var scale = (fixed + scal > BUDGET && scal > 0)
      ? Math.max(0.5, (BUDGET - fixed) / scal) : 1;

    var t = bootDone;
    steps.forEach(function (s) {
      t += s.sc ? s.d * scale : s.d;
      s.ev.forEach(function (e) {
        events.push({ t: t + (e.at || 0), k: e.k, li: e.li, ci: e.ci });
      });
    });
    events.sort(function (a, b) { return a.t - b.t; });
    return { events: events, total: t, scale: scale };
  }

  global.HeroInstall = { plan: plan };   /* the head hatch + the harness check this */

  /* ================= DOM layer ================= */
  var doc = typeof document !== 'undefined' ? document : null;
  if (!doc) return;                                  /* node harness stops here */
  var root = doc.documentElement;
  if (!root.classList.contains('mc-hi')) return;     /* played / reduced motion */

  var DBG = /hi-debug/.test((global.location && global.location.search) || '');
  var sec = doc.querySelector('[data-install]');
  var bootEl = sec && sec.querySelector('[data-boot]');
  var beliefs = sec ? [].slice.call(sec.querySelectorAll('[data-type]')) : [];
  var beliefsWrap = sec && sec.querySelector('.beliefs');
  var statusEl = sec && sec.querySelector('[data-status]');
  var afterEl = sec && sec.querySelector('[data-fade]');
  var box = sec && sec.querySelector('.install');
  if (!bootEl || !beliefs.length || !beliefsWrap || !statusEl || !afterEl || !box) {
    root.classList.remove('mc-hi');                  /* never strand hidden copy */
    return;
  }

  /* ---- wrap existing text nodes into per-character spans (layout is
     already reserved; visibility does the typing). Originals are kept
     verbatim so the settled DOM is byte-identical to the source. ---- */
  var originals = [];
  function keep(el) { originals.push([el, el.innerHTML]); }
  function wrapChars(el) {
    var chars = [];
    [].slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType !== 3 || !n.textContent) return;
      var frag = doc.createDocumentFragment();
      n.textContent.split('').forEach(function (ch) {
        var s = doc.createElement('span');
        s.textContent = ch;
        frag.appendChild(s);
        chars.push(s);
      });
      el.replaceChild(frag, n);
    });
    return chars;
  }

  keep(bootEl);
  var n1 = bootEl.firstChild;                        /* MIND CODING — v1.0 */
  var bootL1 = doc.createElement('span');
  bootL1.textContent = n1.textContent;
  bootEl.replaceChild(bootL1, n1);
  var boot2Text = bootEl.lastChild.textContent;      /* LOADING INSTALLED PATTERNS… */
  var bootChars = wrapChars(bootEl);                 /* only line 2 remains a text node */

  var lineChars = [], notes = [], lineData = [];
  beliefs.forEach(function (el) {
    keep(el);
    notes.push(el.querySelector('.belief-note'));
    var chars = wrapChars(el);                       /* skips the <i> stamp */
    lineChars.push(chars);
    lineData.push({
      text: chars.map(function (s) { return s.textContent; }).join(''),
      hesitate: parseInt(el.getAttribute('data-hesitate'), 10) || 0
    });
  });

  /* ---- accessibility: hide the animation from AT, give it the full text ---- */
  var vh = doc.createElement('p');
  vh.className = 'hi-vh';
  vh.textContent = [bootEl.textContent]
    .concat(beliefs.map(function (b) { return b.textContent; }))
    .concat([statusEl.textContent, afterEl.textContent]).join(' ');
  box.insertBefore(vh, bootEl);
  var hidden = [bootEl, beliefsWrap, statusEl, afterEl];
  hidden.forEach(function (el) { el.setAttribute('aria-hidden', 'true'); });

  /* ---- ONE travelling cursor: the gold block ---- */
  var cursor = doc.createElement('span');
  cursor.id = 'hi-cursor';
  cursor.textContent = '▌';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.style.visibility = 'hidden';
  box.appendChild(cursor);
  var curSrc = null;
  function moveCursor(span, src) {
    if (src !== curSrc) {
      curSrc = src;
      var cs = getComputedStyle(src);
      cursor.style.fontFamily = cs.fontFamily;
      cursor.style.fontSize = cs.fontSize;
      cursor.style.lineHeight = cs.lineHeight;
    }
    var r = span.getBoundingClientRect(), c = box.getBoundingClientRect();
    cursor.style.left = (r.right - c.left) + 'px';
    cursor.style.top = (r.top - c.top) + 'px';
    cursor.style.visibility = 'visible';
  }
  function show(span, src) { span.style.visibility = 'visible'; moveCursor(span, src); }

  /* ---- the schedule ---- */
  var plane = plan(boot2Text, lineData);
  var events = plane.events, idx = 0, raf = 0, t0 = 0;
  var started = false, finished = false;
  if (DBG) console.log('[hero-install] planned', Math.round(plane.total) + 'ms',
    'governor ×' + plane.scale.toFixed(3));

  function run(e) {
    switch (e.k) {
      case 'boot1': bootL1.style.visibility = 'visible'; break;
      case 'bchar': show(bootChars[e.ci], bootEl); break;
      case 'bhide': bootChars[bootChars.length - 1].style.visibility = 'hidden'; break;
      case 'bshow': bootChars[bootChars.length - 1].style.visibility = 'visible'; break;
      case 'char': show(lineChars[e.li][e.ci], beliefs[e.li]); break;
      case 'ann': notes[e.li].style.visibility = 'visible'; break;
      case 'blinkon': cursor.classList.add('hi-blink'); break;
      case 'blinkoff': cursor.classList.remove('hi-blink'); break;
      case 'status1': case 'status2': statusEl.style.visibility = 'visible'; break;
      case 'status0': statusEl.style.visibility = 'hidden'; break;
      case 'fade':
        cursor.style.visibility = 'hidden';
        afterEl.style.visibility = 'visible';
        afterEl.style.opacity = '1';
        break;
      case 'done': finish(); break;
    }
    if (DBG && /^(boot1|ann|status1|fade)$/.test(e.k))
      console.log('[hero-install]', e.k, e.li != null ? 'line ' + (e.li + 1) : '',
        Math.round(performance.now() - t0) + 'ms');
  }

  /* settle: restore the source DOM verbatim, drop every prop we own */
  function finish() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    unbind();
    originals.forEach(function (o) { o[0].innerHTML = o[1]; });
    hidden.forEach(function (el) {
      el.removeAttribute('aria-hidden');
      el.removeAttribute('style');
    });
    if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
    if (vh.parentNode) vh.parentNode.removeChild(vh);
    root.classList.remove('mc-hi');
    try { sessionStorage.setItem('mc_hero_played', '1'); } catch (err) {}
    if (DBG) console.log('[hero-install] settled',
      Math.round(performance.now() - t0) + 'ms');
  }

  /* ---- skip is sacred: any input SNAPS to the final frame. Scroll inputs
     get a short grace window — trackpad momentum from the very scroll that
     brought the section on stage keeps emitting wheel events after start,
     and must not kill the sequence it just triggered. A fresh gesture after
     the grace (or any tap/key immediately) skips. ---- */
  var GRACE = 700;
  function snap() { finish(); }
  function snapScroll() { if (performance.now() - t0 > GRACE) finish(); }
  var bound = false;
  function bind() {
    if (bound) return;
    bound = true;
    addEventListener('pointerdown', snap, { passive: true });
    addEventListener('wheel', snapScroll, { passive: true });
    addEventListener('touchmove', snapScroll, { passive: true });
    addEventListener('keydown', snap);
  }
  function unbind() {
    if (!bound) return;
    bound = false;
    removeEventListener('pointerdown', snap);
    removeEventListener('wheel', snapScroll);
    removeEventListener('touchmove', snapScroll);
    removeEventListener('keydown', snap);
  }

  /* ---- engine: one rAF, drain everything due ---- */
  function tick(now) {
    var el = now - t0;
    while (idx < events.length && events[idx].t <= el) {
      run(events[idx++]);
      if (finished) return;
    }
    if (idx < events.length) raf = requestAnimationFrame(tick);
  }
  function start() {
    if (started || finished) return;
    started = true;
    bind();
    t0 = performance.now();
    raf = requestAnimationFrame(tick);
  }

  /* ---- trigger: after the entrance, when the beliefs are on stage ---- */
  function arm() {
    if (!global.IntersectionObserver) return start();
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) {
        io.disconnect();
        start();
      }
    }, { threshold: 0.3 });
    io.observe(beliefsWrap);
  }
  if ((doc.body.dataset.mcGate === 'pending') || root.classList.contains('mc-nav'))
    addEventListener('mc:enter', arm, { once: true });
  else arm();

  /* ?hi-debug test hook (the draw's debugExpose pattern): lets a harness
     start the sequence and pump the schedule without rAF — headless panes
     report visibilityState hidden and never tick. Absent in normal runs. */
  if (DBG) global.HeroInstall._test = {
    start: start,
    finish: finish,
    advance: function (ms) {
      if (!started) start();
      while (idx < events.length && events[idx].t <= ms && !finished) run(events[idx++]);
      return { idx: idx, of: events.length, finished: finished };
    },
    state: function () {
      return { started: started, finished: finished, idx: idx, total: plane.total };
    }
  };
})(typeof window !== 'undefined' ? window : this);
