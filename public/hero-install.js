/* ============================================================
   HERO INSTALL — resurrected per MOTION-SPEC Phase 2 (ruled 07-17)
   Section 01 (THE INSTALLATION) does not display the installed
   patterns — it INSTALLS them, ON TOP of the static hero: the
   markup is the final frame; this module only conceals and
   reveals what already exists. It NEVER injects copy.
   Retired via PR #3 only because RM froze it — the fix is that
   concealment now happens strictly inside the motion branch:
   this module's first line under reduced motion is `return`,
   so the RM twin is the shipped static hero, byte for byte.
   - Pacing: the device-ruled 07-14 numbers verbatim — flat
     40ms/char ±40% jitter, 140–180ms word pauses (the space IS
     the pause), the 420ms BE REAL hesitation, 350ms inter-line
     gap, boot beat 0.8s, stamps land 150ms after their line.
   - Gold annotations slide in from the margin on a Motion
     spring (visualDuration .5, bounce .15); the status flag
     blink-resolves LAST. Motion missing = cues still fire,
     reveals land instantly — never a stuck element.
   - TRIGGER: viewport entry (after mc:enter on the gated
     landing) only ARMS — boot line 1 + blinking gold cursor.
     First pointer interaction starts; 4s armed with no
     interaction = autoplay. Plays once per session.
   - SKIP IS SACRED: pointerdown/wheel/touchmove/keydown after
     typing starts SNAP to the final static state. Armed only
     once typing starts, so the arriving scroll can't kill it.
   - NEVER BLANK: one rAF schedule that drains everything due
     (clean catch-up after tab throttling); any error → snap();
     a watchdog snaps if the schedule stalls 6s.
   ============================================================ */
(function () {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;   /* RM twin: static hero */
  try { if (sessionStorage.getItem('mc_hero_played')) return; } catch (e) {}

  var CAD = 40, PAUSE_MIN = 140, PAUSE_MAX = 180, HESITATE = 420,
      GAP = 350, ANN = 150, BOOT_MS = 20, BOOT_BEAT = 800, AUTOPLAY = 4000;

  var sec = document.querySelector('.install');
  var boot = document.querySelector('.install-boot');
  var beliefs = [].slice.call(document.querySelectorAll('.beliefs .belief'));
  var status = document.querySelector('.install-status');
  if (!sec || !boot || beliefs.length !== 6 || !status) return;   /* unexpected DOM: stay static */

  var M = window.Motion || null;
  var controls = [];   /* live Motion animations, stopped on snap */

  /* ---- conceal (final frame -> first frame); everything restorable ---- */
  var lines = [];      /* { span, full, note } per belief */
  var boot2 = null, boot2Full = '';
  var cursor = document.createElement('b');
  cursor.className = 'hi-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.textContent = '▌';

  function conceal(){
    var bn = boot.childNodes;   /* [text "MIND CODING — v1.0", <br>, text "LOADING…"] */
    for (var i = 0; i < bn.length; i++){
      if (bn[i].nodeType === 3 && bn[i].textContent.trim() && i > 0){
        boot2 = document.createElement('span');
        boot2Full = bn[i].textContent;
        boot2.textContent = '';
        boot.replaceChild(boot2, bn[i]);
        break;
      }
    }
    beliefs.forEach(function (b) {
      var note = b.querySelector('.belief-note');
      var t = b.firstChild;
      if (!note || !t || t.nodeType !== 3){ lines.push(null); return; }
      var span = document.createElement('span');
      var full = t.textContent;
      span.textContent = '';
      b.replaceChild(span, t);
      note.style.opacity = '0';
      note.style.transform = 'translateX(18px)';
      lines.push({ span: span, full: full, note: note });
    });
    status.style.opacity = '0';
    sec.setAttribute('aria-busy', 'true');
  }

  /* ---- the flat schedule (built at start) ---- */
  var events = [], done = false, started = false, raf = 0, t0 = 0, lastDrain = 0;

  function plan(){
    var t = 0, i, c;
    for (c = 0; c < boot2Full.length; c++)
      events.push({ t: t += BOOT_MS, k: 'b', ci: c });
    t = Math.max(BOOT_BEAT, t + 210);
    for (i = 0; i < lines.length; i++){
      var L = lines[i];
      if (!L) continue;
      for (c = 0; c < L.full.length; c++){
        var ch = L.full.charAt(c);
        t += ch === ' '
          ? PAUSE_MIN + Math.random() * (PAUSE_MAX - PAUSE_MIN)
          : CAD * (0.6 + 0.8 * Math.random());
        /* the ruled hesitation: BE REAL … ISTIC. */
        if (i === lines.length - 1 && c === 7) t += HESITATE;
        events.push({ t: t, k: 'c', li: i, ci: c });
      }
      events.push({ t: t + ANN, k: 'n', li: i });
      t += GAP;
    }
    events.push({ t: t += 220, k: 's' });
    events.push({ t: t + 500, k: 'end' });
  }

  function fire(e){
    if (e.k === 'b'){
      boot2.textContent = boot2Full.slice(0, e.ci + 1);
      if (cursor.parentNode !== boot2.parentNode) boot.appendChild(cursor);
    } else if (e.k === 'c'){
      var L = lines[e.li];
      L.span.textContent = L.full.slice(0, e.ci + 1);
      L.span.appendChild(cursor);   /* the one travelling cursor */
    } else if (e.k === 'n'){
      var N = lines[e.li].note;
      if (M) controls.push(M.animate(N, { opacity: 1, transform: 'translateX(0px)' },
        { type: 'spring', visualDuration: 0.5, bounce: 0.15 }));
      else { N.style.opacity = ''; N.style.transform = ''; }
    } else if (e.k === 's'){
      /* the status flag blink-resolves last (final opacity is the CSS .75) */
      if (M) controls.push(M.animate(status, { opacity: [0, 0.75, 0.2, 0.75] },
        { duration: 0.4, ease: 'linear' }));
      else status.style.opacity = '';
    } else if (e.k === 'end'){ complete(); }
  }

  function tick(now){
    if (done) return;
    raf = requestAnimationFrame(tick);
    if (!t0) t0 = now;
    var el = now - t0;
    try {
      var fired = false;
      while (events.length && events[0].t <= el){ fire(events.shift()); fired = true; }
      if (fired) lastDrain = now;
      /* blink on holds: cursor solid while typing, blinking when waiting */
      cursor.classList.toggle('hi-blink', !events.length || events[0].t - el > 300);
      if (now - lastDrain > 6000) snap();          /* watchdog: never strand */
    } catch (err) { snap(); }
  }

  /* ---- final state, instantly — the skip and every failsafe land here ---- */
  function snap(){
    if (done) return; done = true;
    cancelAnimationFrame(raf);
    for (var i = 0; i < controls.length; i++){ try { controls[i].stop(); } catch (e) {} }
    if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
    if (boot2) boot2.textContent = boot2Full;
    lines.forEach(function (L) {
      if (!L) return;
      L.span.textContent = L.full;
      L.note.style.opacity = ''; L.note.style.transform = '';
    });
    status.style.opacity = '';
    sec.removeAttribute('aria-busy');
    unbindSkip();
    try { sessionStorage.setItem('mc_hero_played', '1'); } catch (e) {}
  }
  function complete(){
    /* the run finished on its own — same terminal state, Motion owns the
       last two reveals so no style reset needed beyond the cursor */
    if (done) return; done = true;
    cancelAnimationFrame(raf);
    if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
    sec.removeAttribute('aria-busy');
    unbindSkip();
    try { sessionStorage.setItem('mc_hero_played', '1'); } catch (e) {}
  }

  var skipOpts = { capture: true, passive: true };
  function onSkip(){ snap(); }
  function bindSkip(){
    addEventListener('pointerdown', onSkip, skipOpts);
    addEventListener('wheel', onSkip, skipOpts);
    addEventListener('touchmove', onSkip, skipOpts);
    addEventListener('keydown', onSkip, skipOpts);
  }
  function unbindSkip(){
    removeEventListener('pointerdown', onSkip, skipOpts);
    removeEventListener('wheel', onSkip, skipOpts);
    removeEventListener('touchmove', onSkip, skipOpts);
    removeEventListener('keydown', onSkip, skipOpts);
  }

  function start(){
    if (started || done) return; started = true;
    clearTimeout(autoT);
    sec.removeEventListener('pointerenter', start);
    sec.removeEventListener('pointerdown', start);
    plan();
    bindSkip();          /* armed only now — the arriving scroll can't kill it */
    raf = requestAnimationFrame(tick);
  }

  /* ---- ARM on viewport entry, after the gate ---- */
  var autoT = 0;
  function arm(){
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      boot.appendChild(cursor);
      cursor.classList.add('hi-blink');
      sec.addEventListener('pointerenter', start);
      sec.addEventListener('pointerdown', start);
      autoT = setTimeout(start, AUTOPLAY);   /* no reader sees an inert section */
    }, { threshold: 0.25 });
    io.observe(sec);
  }

  conceal();
  if (document.body.dataset.mcGate === 'pending' ||
      document.documentElement.classList.contains('mc-nav')){
    addEventListener('mc:enter', arm, { once: true });
    /* hatch: if the gate never hands off, reveal the static hero anyway */
    setTimeout(function(){ if (!started && !done && document.body.dataset.mcGate === 'pending') snap(); }, 8000);
  } else arm();
})();
