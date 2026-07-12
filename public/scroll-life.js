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
      if (en.isIntersecting) en.target.classList.add('sl-on');
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
  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }, { passive: true });
  frame();
})();
