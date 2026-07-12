/* ============================================================
   THE KEYHOLE IRIS — shared reveal engine
   Mind Coding · mind-draw-theatre
   Not a curtain. The stage is sealed under midnight; one gold
   keyhole burns at the center — the emblem's own way in. On
   open, the keyhole FLARES, then the aperture blooms in the
   keyhole's own shape until it swallows the frame. The opening
   edge wears a halftone-dot fringe (print's atoms) and a gold
   rim. Behind it, the cards are already moving.
   Canvas 2D only. Two inks on midnight + gold; red unused.
   Sequence (open 0 -> 1):
     0.00-0.14  flare  — the keyhole ignites, light leaks
     0.14-1.00  bloom  — aperture scales pow(,1.7), rim + fringe
   Reduced motion: instant open. rAF sleeps when idle offscreen.
   Exposes window.Iris.mount(canvas, opts) ->
     { open, close, setProgress, getProgress, destroy }
   ============================================================ */
(function (global) {
  'use strict';

  var GOLD = '215,154,74', BONE = '239,231,214', PAPER = '#070B1A';
  var EASE = 0.055, FLARE_END = 0.14;

  /* unit keyhole: ring center (0,-0.20) r .29; stem flares from
     half-width .12 to .30 at the foot (y .62). scaled by s. */
  function keyholePath(ctx, cx, cy, s){
    var rx = 0, ry = -0.20, r = 0.29;
    /* stem tangent angle onto the ring */
    var aL = Math.PI * 0.5 + 0.46, aR = Math.PI * 0.5 - 0.46;
    ctx.beginPath();
    ctx.arc(cx + rx * s, cy + ry * s, r * s, aR, aL, true); /* anticlockwise: over the top, tangents meet the stem */
    ctx.lineTo(cx - 0.12 * s, cy + 0.06 * s);
    ctx.lineTo(cx - 0.30 * s, cy + 0.62 * s);
    ctx.lineTo(cx + 0.30 * s, cy + 0.62 * s);
    ctx.lineTo(cx + 0.12 * s, cy + 0.06 * s);
    ctx.closePath();
  }

  /* outline sample points (unit space) for the fringe dots */
  function outlinePoints(){
    var pts = [], i;
    var aL = Math.PI * 0.5 + 0.46, aR = Math.PI * 0.5 - 0.46;
    var sweep = Math.PI * 2 - (aL - aR);
    for (i = 0; i <= 46; i++){
      var a = aL + (i / 46) * sweep;
      pts.push([Math.cos(a) * 0.29, -0.20 + Math.sin(a) * 0.29]);
    }
    for (i = 1; i <= 10; i++){ var t = i / 10;
      pts.push([-0.12 - 0.18 * t, 0.06 + 0.56 * t]); }
    for (i = 1; i <= 12; i++) pts.push([-0.30 + 0.60 * (i / 12), 0.62]);
    for (i = 1; i <= 10; i++){ var t2 = i / 10;
      pts.push([ 0.30 - 0.18 * t2, 0.62 - 0.56 * t2]); }
    return pts;
  }
  var OUTLINE = outlinePoints();

  function mount(canvas, opts){
    opts = opts || {};
    if (!canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext('2d');
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    var W = 0, H = 0, DPR = 1, grain = [];
    var open = 0, target = 0, openFired = false;
    var running = false, raf = 0;

    function size(){
      var r = canvas.getBoundingClientRect();
      DPR = Math.min(devicePixelRatio || 1, 2);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      /* halftone paper grain on the veil — fixed, precomputed */
      grain.length = 0;
      var gap = 14;
      for (var y = gap / 2; y < H; y += gap)
        for (var x = gap / 2 + ((y / gap) % 2) * gap / 2; x < W; x += gap){
          var h = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
          if (h > 0.42) grain.push([x + (h - 0.5) * 5, y + (h * 7 % 1 - 0.5) * 5, 0.4 + h * 0.9, 0.03 + h * 0.05]);
        }
    }

    function markScale(){ return Math.min(W, H) * 0.21; }         /* the resting keyhole — centerpiece scale */
    function maxScale(){ return Math.hypot(W, H) * 1.9; }          /* swallows the frame */
    function scaleAt(o){
      var bloom = Math.max(0, (o - FLARE_END) / (1 - FLARE_END));
      return markScale() + (maxScale() - markScale()) * Math.pow(bloom, 1.7);
    }

    function draw(now){
      var cx = W / 2, cy = H / 2;
      var s = scaleAt(open);
      var flare = open < FLARE_END ? open / FLARE_END : 1;
      var doneness = Math.min(1, Math.max(0, (open - FLARE_END) / (1 - FLARE_END)));

      ctx.clearRect(0, 0, W, H);

      /* THE VEIL — midnight with halftone grain */
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, W, H);
      for (var g = 0; g < grain.length; g++){
        var d = grain[g];
        ctx.fillStyle = 'rgba(' + BONE + ',' + d[3] + ')';
        ctx.fillRect(d[0], d[1], d[2], d[2]);
      }

      /* light leaking from behind the keyhole (pre-bloom) */
      if (doneness < 0.6){
        var pulse = reduce ? 1 : 0.86 + 0.14 * Math.sin(now * 0.0016);
        var leak = ctx.createRadialGradient(cx, cy, 0, cx, cy, markScale() * (2.6 + flare * 1.6));
        leak.addColorStop(0, 'rgba(' + GOLD + ',' + (0.34 * pulse * (1 + flare * 1.4) * (1 - doneness)).toFixed(3) + ')');
        leak.addColorStop(1, 'rgba(' + GOLD + ',0)');
        ctx.fillStyle = leak;
        ctx.fillRect(0, 0, W, H);
      }

      /* THE APERTURE — punch the keyhole out of the veil */
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = '#000';               /* punch must be FULLY opaque */
      keyholePath(ctx, cx, cy, s);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      /* gold rim on the opening edge, brightest at the flare */
      var rimA = open < 0.02 ? 0.9 : (0.9 + flare * 0.6) * (1 - doneness * 0.85);
      if (rimA > 0.02){
        ctx.strokeStyle = 'rgba(' + GOLD + ',' + rimA.toFixed(3) + ')';
        ctx.lineWidth = 2 + flare * 1.5;
        keyholePath(ctx, cx, cy, s);
        ctx.stroke();
      }

      /* halftone fringe: dots scattering off the opening edge */
      if (doneness > 0.005 && doneness < 0.985){
        for (var i = 0; i < OUTLINE.length; i++){
          var p = OUTLINE[i];
          var h2 = Math.abs(Math.sin((i + 1) * 12.9898) * 43758.5453) % 1;
          var jitter = 1 + 0.05 * Math.sin(i * 2.4 + (reduce ? 0 : now * 0.004));
          var px = cx + p[0] * s * jitter, py = cy + p[1] * s * jitter;
          var dotR = (1.6 + h2 * 2.2) * (1 - doneness * 0.7);
          ctx.fillStyle = h2 > 0.6
            ? 'rgba(' + GOLD + ',' + (0.75 * (1 - doneness)).toFixed(3) + ')'
            : 'rgba(' + BONE + ',' + (0.5 * (1 - doneness)).toFixed(3) + ')';
          ctx.fillRect(px - dotR / 2, py - dotR / 2, dotR, dotR);
        }
      }
    }

    function step(now){
      raf = requestAnimationFrame(step);
      open += (target - open) * (reduce ? 1 : EASE);
      if (Math.abs(target - open) < 0.0015) open = target;
      draw(now);
      if (open > 0.997 && !openFired){
        openFired = true;
        canvas.style.pointerEvents = 'none';
        canvas.style.display = 'none';          /* fully through — the iris is gone */
        if (opts.onOpen) opts.onOpen();
      }
      /* idle: keep the leak pulsing while closed, sleep when open */
      if (open === target && open >= 1){ running = false; cancelAnimationFrame(raf); }
      if (reduce && open === target){ running = false; cancelAnimationFrame(raf); }
    }
    function wake(){ if (!running){ running = true; raf = requestAnimationFrame(step); } }

    var io = new IntersectionObserver(function(es){
      es.forEach(function(en){
        if (en.isIntersecting && open < 1) wake();
        else if (!en.isIntersecting && running && open === target){ running = false; cancelAnimationFrame(raf); }
      });
    }, { threshold: 0.05 });
    io.observe(canvas);
    addEventListener('resize', function(){ if (open < 1){ size(); wake(); } });

    size();
    draw(0);
    wake();

    return {
      open: function(){ target = 1; wake(); },
      close: function(){
        target = 0; openFired = false;
        canvas.style.pointerEvents = ''; canvas.style.display = '';
        wake();
      },
      setProgress: function(v){
        open = target = Math.max(0, Math.min(1, v));
        if (open >= 1){ canvas.style.pointerEvents = 'none'; canvas.style.display = 'none';
          if (!openFired){ openFired = true; if (opts.onOpen) opts.onOpen(); } }
        wake();
      },
      getProgress: function(){ return open; },
      destroy: function(){ running = false; cancelAnimationFrame(raf); io.disconnect(); }
    };
  }

  global.Iris = { mount: mount };
})(window);
