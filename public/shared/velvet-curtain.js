/* ============================================================
   THE VELVET — shared curtain engine
   Mind Coding · mind-draw-theatre
   Canvas 2D port of a WebGL curtain (three.js is banned by
   house rule; the MATH survives, the renderer does not):
     gather   : inner edge pulled outward, 1-(1-u)(1-0.90*open)
     folds    : sin(u*22+1.6) + 0.34*sin(u*47+2.4), damped near
                the top rail (free-fabric falloff)
     hem trail: the heavy bottom lags 0.34*(1-u)*open behind
     sway     : quiet idle motion while closed, reduced-motion off
     braid    : gold along the opening edge
   Fold depth becomes BRIGHTNESS, not geometry — two inks on
   midnight: the fabric is midnight, the light is bone at low
   alpha, the braid and footlight are gold. Nothing else.
   Exposes window.Velvet.mount(canvas, opts) ->
     { open, close, setProgress, getProgress, destroy }
   ============================================================ */
(function (global) {
  'use strict';

  var STRIPS = 110, EASE = 0.07;

  function mount(canvas, opts){
    opts = opts || {};
    if (!canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext('2d');
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    var W = 0, H = 0, DPR = 1;
    var open = 0, target = 0, openFired = false, closeFired = false;
    var running = false, raf = 0, t0 = 0;

    function size(){
      var r = canvas.getBoundingClientRect();
      DPR = Math.min(devicePixelRatio || 1, 2);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    /* one curtain half. side: -1 left, +1 right */
    function half(side, time){
      var cx = W / 2;
      var halfW = (W / 2) * 1.03;           /* slight center overlap when closed */
      var railH = Math.max(10, H * 0.055);  /* fixed pelmet at the top */
      var prevX = null;
      for (var i = 0; i <= STRIPS; i++){
        var u = i / STRIPS;                  /* 0 = opening edge, 1 = outer edge */
        var gathered = 1 - (1 - u) * (1 - 0.90 * open);
        var x = cx + side * gathered * halfW;

        /* fold field — depth mapped to light */
        var amp = 0.13 + 0.34 * open;
        var sway = (!reduce && open < 0.97)
          ? Math.sin(time * 0.00065 + u * 5.0 + side) * 0.05 * (1 - open) : 0;
        var fold = Math.sin(u * 22.0 + 1.6 + sway) * amp
                 + Math.sin(u * 47.0 + 2.4) * amp * 0.34;
        var vFold = fold / (amp * 1.34);              /* -1 .. 1 */
        var shade = 0.77 + 0.23 * (vFold * 0.5 + 0.5);/* valleys darken */
        /* velvet sheen: grazing light on steep fold walls */
        var slope = Math.abs(Math.cos(u * 22.0 + 1.6));
        var sheen = Math.pow(slope, 2.7) * 0.5;

        /* hem trails behind while opening */
        var hem = side * (1 - u) * 0.34 * open * halfW * 0.28;

        if (prevX !== null){
          var w = x - prevX;
          if (Math.abs(w) > 0.01){
            /* fabric strip below the rail: quad with lagging hem */
            var lum = (0.06 + 0.16 * shade + 0.10 * sheen);   /* bone alpha */
            ctx.fillStyle = 'rgba(239,231,214,' + lum.toFixed(3) + ')';
            var ov = Math.sign(w) * 0.7;   /* overlap strips: no AA hairline seams */
            ctx.beginPath();
            ctx.moveTo(prevX, railH);
            ctx.lineTo(x + ov, railH);
            ctx.lineTo(x + ov - hem, H);
            ctx.lineTo(prevX - hem, H);
            ctx.closePath();
            /* fabric base first (midnight), then the light */
            ctx.save();
            ctx.fillStyle = '#070B1A';
            ctx.fill();
            ctx.restore();
            ctx.fill();

            /* braid: gold along the opening edge — slim, like the source
               (smoothstep 0.002..0.012 of u) */
            if (u < 0.03){
              var braid = 1 - Math.min(1, Math.max(0, (u - 0.004) / 0.026));
              ctx.fillStyle = 'rgba(215,154,74,' + (0.25 + braid * 0.6).toFixed(3) + ')';
              ctx.fill();
            }
          }
        }
        prevX = x;
      }
      /* footlight against the hem */
      var fl = ctx.createLinearGradient(0, H, 0, H * 0.72);
      fl.addColorStop(0, 'rgba(215,154,74,' + (0.14 * (1 - open * 0.6)).toFixed(3) + ')');
      fl.addColorStop(1, 'rgba(215,154,74,0)');
      ctx.fillStyle = fl;
      var innerX = cx + side * (1 - (1 - 0.90 * open)) * halfW; /* inner edge x */
      ctx.fillRect(side < 0 ? innerX - halfW : innerX, H * 0.72, halfW, H * 0.28);
    }

    function pelmet(){
      var railH = Math.max(10, H * 0.055);
      ctx.fillStyle = '#070B1A';
      ctx.fillRect(0, 0, W, railH);
      ctx.fillStyle = 'rgba(239,231,214,0.18)';
      ctx.fillRect(0, 0, W, 2);
      ctx.fillStyle = 'rgba(215,154,74,0.85)';
      ctx.fillRect(0, railH - 2, W, 2);
      /* fringe dashes */
      ctx.fillStyle = 'rgba(215,154,74,0.55)';
      for (var x = 4; x < W; x += 12) ctx.fillRect(x, railH, 2, 5);
    }

    function draw(time){
      ctx.clearRect(0, 0, W, H);
      half(-1, time);
      half(1, time);
      pelmet();
    }

    function step(now){
      raf = requestAnimationFrame(step);
      if (!t0) t0 = now;
      open += (target - open) * (reduce ? 1 : EASE);
      if (Math.abs(target - open) < 0.002) open = target;
      draw(now);
      if (open > 0.995 && !openFired){
        openFired = true; closeFired = false;
        canvas.style.pointerEvents = 'none';
        if (opts.onOpen) opts.onOpen();
      }
      if (open < 0.005 && !closeFired && openFired){
        closeFired = true; openFired = false;
        if (opts.onClose) opts.onClose();
      }
      /* nothing left to animate? sleep. sway keeps it alive while closed */
      if (open === target && (reduce || open >= 0.97)){
        running = false; cancelAnimationFrame(raf);
      }
    }
    function wake(){
      if (!running){ running = true; raf = requestAnimationFrame(step); }
    }

    var io = new IntersectionObserver(function(es){
      es.forEach(function(en){
        if (en.isIntersecting) wake();
        else if (running && open === target){ running = false; cancelAnimationFrame(raf); }
      });
    }, { threshold: 0.05 });
    io.observe(canvas);
    addEventListener('resize', function(){ size(); wake(); });

    size();
    draw(0);
    wake();

    return {
      open: function(){ target = 1; openFired = false; wake(); },
      close: function(){ target = 0; canvas.style.pointerEvents = ''; wake(); },
      setProgress: function(v){ open = target = Math.max(0, Math.min(1, v)); wake(); },
      getProgress: function(){ return open; },
      destroy: function(){ running = false; cancelAnimationFrame(raf); io.disconnect(); }
    };
  }

  global.Velvet = { mount: mount };
})(window);
