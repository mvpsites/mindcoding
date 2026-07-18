/* ============================================================
   SCROLL LIFE — Mind Coding · ruled 2026-07-12
   The page prints itself as you read it: elements rise in with
   a stagger as they enter the viewport, and display headlines
   carry a slow counter-drift so the scroll feels dimensional.
   Rules: transform/opacity ONLY (GPU, 60fps), IO unobserves
   after reveal, one rAF loop for drift (paused when idle),
   NOTHING inside .prosc or .wheelstage is touched (their
   transforms belong to the wheel/iris), reduced motion = off.
   ============================================================ */
(function () {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  /* THE ENTRANCE: on the gated landing the page prints itself only after
     the visitor comes through the keyhole */
  if ((document.body && document.body.dataset.mcGate === 'pending') ||
      document.documentElement.classList.contains('mc-nav')){
    addEventListener('mc:enter', init, { once: true });
  } else init();
  function init(){

  var RISE_SEL = ['.kick', '.sec__kick', '.q', '.line', '.chanlede', '.goldline',
    '.instruct', '.telemetry', '.brandline', '.support', '.turn', '.choice__intro',
    '.row', '.entry', '.part', '.surfaced', '.plateCol', '.cardname', '.cardmeta',
    '.tbl__head', '.choice__note', '.colophon', '.share', '.mast__grid p'].join(',');
  var DRIFT_SEL = 'h1.big, h2.big, h1.masthead, .surfaced__t, .entry__t';

  function safe(el){
    return !el.closest('.prosc') && !el.closest('.wheelstage') && !el.closest('.veil');
  }

  /* ---- rise: staggered reveal ---- */
  var toRise = [].filter.call(document.querySelectorAll(RISE_SEL), safe);
  toRise.forEach(function (el) { el.classList.add('sl-rise'); });
  /* registration sweep: a gold light crosses each section kick as it lands */
  [].forEach.call(document.querySelectorAll('.sec__kick'), function (el) {
    if (safe(el)) el.classList.add('sl-sweep');
  });

  /* stagger siblings that arrive together */
  var groups = {};
  toRise.forEach(function (el) {
    var k = el.parentNode ? el.parentNode : document.body;
    var id = k.__slg || (k.__slg = Object.keys(groups).length + 1);
    (groups[id] = groups[id] || []).push(el);
  });
  Object.keys(groups).forEach(function (id) {
    groups[id].forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i * 70, 350) + 'ms';
    });
  });

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('sl-on');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  toRise.forEach(function (el) { io.observe(el); });

  /* ---- LETTERPRESS STRIKES (ruled 07-12): display type doesn't fade,
     it PRINTS — one hard impression, the red line slamming last. The strike
     animates an inner wrapper because the drift rAF owns the heading's own
     transform. ---- */
  var toStrike = [].filter.call(
    document.querySelectorAll('h1.big, h2.big, h1.masthead'), safe);
  toStrike.forEach(function (el) {
    var w = document.createElement('span');
    w.className = 'sl-inner';
    while (el.firstChild) w.appendChild(el.firstChild);
    el.appendChild(w);
    el.classList.add('sl-strike');
  });

  /* ---- MOTION-SPEC Phase 3: a gold rule draws itself under each struck
     section heading (never the masthead) — Motion spring scaleX 0->1,
     origin left, 120ms after the strike lands. RM never reaches this
     code, so the static site carries no rule at all. ---- */
  var M = window.Motion || null;
  toStrike.forEach(function (el) {
    if (el.classList.contains('masthead')) return;
    var rule = document.createElement('i');
    rule.className = 'sl-rule';
    el.appendChild(rule);
    el.__slRule = rule;
  });
  function drawRule(el){
    var r = el.__slRule;
    if (!r) return;
    el.__slRule = null;
    setTimeout(function () {   /* the ~220ms strike + the ruled 120ms beat */
      if (M) M.animate(r, { transform: 'scaleX(1)' }, { type: 'spring', visualDuration: 0.6, bounce: 0 });
      else r.style.transform = 'scaleX(1)';
    }, 340);
  }

  /* ---- drift: display type counter-scrolls, faintly ---- */
  var drifters = [].filter.call(document.querySelectorAll(DRIFT_SEL), safe)
    .map(function (el) {
      el.classList.add('sl-drift');
      return { el: el, f: el.classList.contains('masthead') ? 0.05 : 0.035 };
    });
  var dio = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      var d = drifters.find(function (x) { return x.el === en.target; });
      if (d) d.vis = en.isIntersecting;
      if (en.isIntersecting) { en.target.classList.add('sl-on'); drawRule(en.target); }
    });
  }, { threshold: 0 });
  drifters.forEach(function (d) { dio.observe(d.el); });

  var ticking = false;
  function frame() {
    ticking = false;
    var vh = innerHeight;
    for (var i = 0; i < drifters.length; i++) {
      var d = drifters[i];
      if (!d.vis) continue;
      var r = d.el.getBoundingClientRect();
      var off = (r.top + r.height / 2 - vh / 2) * -d.f;
      d.el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
    }
  }
  /* ink progress: --scp drives the inkbar + the halftone moire */
  var docEl = document.documentElement;
  function progress() {
    var max = docEl.scrollHeight - innerHeight;
    docEl.style.setProperty('--scp', max > 0 ? (scrollY / max).toFixed(4) : 0);
  }

  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function(){ frame(); progress(); }); }
  }, { passive: true });
  frame(); progress();

  /* ---- TICKER CORRUPTION (landing): every so often one phrase runs red
     for a blink, then the program corrects itself ---- */
  var track = document.querySelector('.ticker__track');
  if (track) {
    [].forEach.call(track.children, function (span) {
      [].slice.call(span.childNodes).forEach(function (n) {
        if (n.nodeType === 3 && n.textContent.trim()) {
          var i = document.createElement('i');
          i.className = 'tk'; i.textContent = n.textContent;
          span.replaceChild(i, n);
        }
      });
    });
    var tks = track.querySelectorAll('.tk');
    if (tks.length) setInterval(function () {
      var t = tks[Math.floor(Math.random() * tks.length)];
      t.classList.add('tk-hit');
      setTimeout(function () { t.classList.remove('tk-hit'); }, 160);
    }, 9000 + Math.random() * 6000);
  }

  /* ---- MOTION-SPEC Phase 3: the six gold stamps become scroll-triggered
     when the install has ALREADY played (or been skipped) this session —
     while hero-install owns the section this pass stands down. ---- */
  var notes = [].slice.call(document.querySelectorAll('.beliefs .belief-note'));
  var heroDone = false;
  try { heroDone = sessionStorage.getItem('mc_hero_played') === '1'; } catch (e) {}
  if (notes.length && heroDone){
    notes.forEach(function (n) { n.style.opacity = '0'; n.style.transform = 'translateX(18px)'; });
    var nio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      nio.disconnect();
      notes.forEach(function (n, i) {
        setTimeout(function () {
          if (M) M.animate(n, { opacity: 1, transform: 'translateX(0px)' },
            { type: 'spring', visualDuration: 0.5, bounce: 0.15 });
          else { n.style.opacity = ''; n.style.transform = ''; }
        }, i * 90);
      });
    }, { threshold: 0.3 });
    nio.observe(document.querySelector('.beliefs'));
  }

  /* ---- the whisper types itself, once (landing footer) ---- */
  var wh = document.querySelector('.whisper');
  if (wh) {
    var full = wh.textContent;
    wh.textContent = '';
    wh.style.minHeight = '1em';
    var wio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      wio.disconnect();
      var i = 0;
      var tid = setInterval(function () {
        wh.textContent = full.slice(0, ++i);
        if (i >= full.length) clearInterval(tid);
      }, 26);
    }, { threshold: 0.6 });
    wio.observe(wh);
  }
  }
})();
