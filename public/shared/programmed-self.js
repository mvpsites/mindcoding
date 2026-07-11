/* ============================================================
   THE PROGRAMMED SELF — shared symbol engine
   Mind Coding · mind-symbol-v2
   One androgynous profile · fingerprint mind · keyhole.
   MAGNETIC PULL -> ELASTIC RESISTANCE -> PRECISE REFORMATION.
   Canvas 2D only. Home coordinates never change after build.
   PROGRAM CHANGE is 0% forever, honestly.
   Loaded identically by /preview-symbol-lab/ and /preview-zine-v2/.
   ============================================================ */
(function (global) {
  'use strict';

  var GOLD = '#D79A4A', BONE = '#EFE7D6', RED = '#FF2B06';

  /* ---------- geometry sources ---------- */
  var HEAD_POINTS = [
    [-0.55, -0.74], [-0.10, -0.92], [ 0.28, -0.78], [ 0.46, -0.50],
    [ 0.50, -0.28], [ 0.74, -0.10], [ 0.50,  0.00], [ 0.59,  0.14],
    [ 0.47,  0.22], [ 0.39,  0.48], [ 0.23,  0.78], [-0.30,  0.82],
    [-0.62,  0.38], [-0.70, -0.18], [-0.55, -0.74]
  ];
  var FP_CX = -0.08, FP_CY = -0.18;
  var KEY_CX = -0.02, KEY_CY = -0.20;
  var KEY_R = 0.065, KEY_STEM_LEN = 0.18, KEY_STEM_W = 0.038;

  function h1(i){ return Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1; }

  /* Closed Catmull-Rom through pts (first==last), sampled then
     resampled at equal arc length. Returns array of [x,y]. */
  function catmullClosed(pts, samples){
    var core = pts.slice(0, pts.length - 1);        /* drop duplicate close */
    var n = core.length, raw = [], SUB = 24;
    for (var i = 0; i < n; i++){
      var p0 = core[(i - 1 + n) % n], p1 = core[i],
          p2 = core[(i + 1) % n],     p3 = core[(i + 2) % n];
      for (var j = 0; j < SUB; j++){
        var t = j / SUB, t2 = t * t, t3 = t2 * t;
        raw.push([
          0.5 * ((2*p1[0]) + (-p0[0]+p2[0])*t + (2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2 + (-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
          0.5 * ((2*p1[1]) + (-p0[1]+p2[1])*t + (2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2 + (-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)
        ]);
      }
    }
    /* equal arc-length resample */
    var lens = [0], total = 0, k;
    for (k = 1; k <= raw.length; k++){
      var a = raw[k - 1], b = raw[k % raw.length];
      total += Math.hypot(b[0]-a[0], b[1]-a[1]); lens.push(total);
    }
    var out = [], step = total / samples, target = 0, seg = 0;
    for (k = 0; k < samples; k++){
      while (seg < lens.length - 1 && lens[seg + 1] < target) seg++;
      var a2 = raw[seg % raw.length], b2 = raw[(seg + 1) % raw.length];
      var span = lens[seg + 1] - lens[seg] || 1;
      var f = (target - lens[seg]) / span;
      out.push([a2[0] + (b2[0]-a2[0])*f, a2[1] + (b2[1]-a2[1])*f]);
      target += step;
    }
    return out;
  }

  function pointInPoly(x, y, poly){
    var inside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++){
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if (((yi > y) !== (yj > y)) &&
          (x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-9) + xi)) inside = !inside;
    }
    return inside;
  }

  /* ---------- controller ---------- */
  function mount(canvas, opts){
    opts = opts || {};
    if (!canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext('2d');
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isPhone = matchMedia('(max-width: 700px)').matches;

    var dbg = { showHomes:false, showRadius:false, freeze:false, forcePhone:false };

    /* interaction constants (contract Part 7/8) */
    var TYPE_MULT = { head:0.25, print:1.00, key:0.45, accent:0.75 };
    var SPRING    = { head:0.075, print:0.055, key:0.09, accent:0.06 };
    var DAMP = 0.84;
    var RELEASE_PAUSE = 90, MAX_WAVE_DELAY = 140;
    var H_INTENT_PX = 20, H_INTENT_RATIO = 1.4, V_CANCEL = 26;

    function phone(){ return dbg.forcePhone || isPhone; }
    function counts(){ return phone() ? 500 : 900; }
    /* radii scale with the symbol so the magnet feels equivalent at any
       canvas size; the contract's suggested values are the floor */
    function hoverRadius(){ return phone() ? Math.max(75, symbolR * 0.30) : Math.max(110, symbolR * 0.44); }
    function dragRadius(){ return phone() ? Math.max(85, symbolR * 0.35) : Math.max(125, symbolR * 0.55); }
    function velCap(){ return phone() ? 9 : 12; }
    var HOVER_STRENGTH = 0.08, ATTR = 1.15, TANG = 0.32;

    var pts = [], headPoly = [];
    var W = 0, H = 0, DPR = 1, scale = 1, cx = 0, cy = 0, symbolR = 1;
    var maxDist = 1;

    function nx(v){ return cx + v * scale; }
    function ny(v){ return cy + v * scale; }

    function build(){
      var rect = canvas.getBoundingClientRect();
      DPR = Math.min(devicePixelRatio || 1, 2);
      W = Math.max(1, rect.width); H = Math.max(1, rect.height);
      canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cx = W / 2; cy = H / 2;
      scale = Math.min(W / 1.9, H / 2.1);
      symbolR = scale * 0.92;
      maxDist = Math.hypot(W, H);

      var N = counts();
      var nHead = Math.round(N * 0.25),
          nKeyAcc = Math.round(N * 0.10),
          nKey = Math.round(nKeyAcc * 0.62),
          nAcc = nKeyAcc - nKey,
          nPrint = N - nHead - nKeyAcc;

      pts.length = 0;
      var i, hx, hy, u;

      /* --- head-and-neck contour (25%): equal arc-length Catmull-Rom --- */
      var contour = catmullClosed(HEAD_POINTS, nHead);
      headPoly = catmullClosed(HEAD_POINTS, 96);      /* for clipping tests */
      for (i = 0; i < contour.length; i++){
        hx = nx(contour[i][0]) + (h1(i) - 0.5) * 2.0;
        hy = ny(contour[i][1]) + (h1(i + 999) - 0.5) * 2.0;
        pts.push({ type:'head', homeX:hx, homeY:hy, x:hx, y:hy, vx:0, vy:0,
                   seed:h1(i * 7), brightness: h1(i * 3) < 0.16 ? 1 : 0,
                   bone: h1(i * 3) >= 0.16 });          /* mostly bone, restrained gold */
      }

      /* --- fingerprint mind (65%): six broken vertical whorls --- */
      var RIDGES = 6, perR = Math.floor(nPrint / RIDGES), placed = 0;
      for (var k2 = 0; k2 < RIDGES; k2++){
        var nThis = (k2 === RIDGES - 1) ? (nPrint - placed) : perR;
        var base = 0.16 + k2 * 0.075;
        /* alternate ridge openings left/right; not every ridge closed */
        var gapCenter = (k2 % 2 === 0) ? Math.PI : 0;   /* left vs right side */
        var gapHalf = 0.34 + 0.10 * h1(k2 * 31);        /* deterministic imperfection */
        for (var j2 = 0; j2 < nThis; j2++){
          var frac = j2 / nThis;
          /* the ridge is BROKEN: points occupy only the non-gap arc, so the
             opening is a true void (a ridge ending, not a topographic ring) */
          var t = gapCenter + gapHalf * 0.5 +
                  frac * (Math.PI * 2 - gapHalf) + k2 * 0.05;
          var fx, fy;
          if (k2 === 0 && frac > 0.62){
            /* curved hook in the innermost ridge */
            var ht = (frac - 0.62) / 0.38;
            var hr = base * (1 - 0.55 * ht);
            var ha = t + ht * 1.9;
            fx = FP_CX + hr * 0.78 * Math.cos(ha);
            fy = FP_CY + hr * 1.08 * Math.sin(ha) + 0.02 * ht;
          } else {
            var distortion = 1 + 0.06 * Math.sin(3 * t + k2 * 0.7);
            fx = FP_CX + base * 0.78 * distortion * Math.cos(t);
            fy = FP_CY + base * 1.08 * distortion * Math.sin(t)
                       + 0.025 * Math.sin(2 * t + k2);
          }
          /* deterministic imperfections */
          fx += (h1(placed * 13) - 0.5) * 0.012;
          fy += (h1(placed * 17) - 0.5) * 0.012;
          /* clip inside the head contour: walk toward fingerprint center */
          var guard = 0;
          while (!pointInPoly(fx, fy, headPoly) && guard++ < 24){
            fx += (FP_CX - fx) * 0.18; fy += (FP_CY - fy) * 0.18;
          }
          /* keyhole clearance — ridges flow around it, never through it */
          var kdx = fx - KEY_CX, kdy = fy - KEY_CY;
          var inRing = Math.hypot(kdx, kdy) < KEY_R + 0.032;
          var inStem = Math.abs(kdx) < KEY_STEM_W * 0.5 + 0.026 &&
                       kdy > 0 && kdy < KEY_R * 0.7 + KEY_STEM_LEN + 0.026;
          if (inRing || inStem){
            var kd = Math.hypot(kdx, kdy) || 0.001;
            var want = KEY_R + 0.05;
            fx = KEY_CX + kdx / kd * want;
            fy = KEY_CY + kdy / kd * (want + (inStem ? KEY_STEM_LEN * 0.7 : 0));
          }
          hx = nx(fx); hy = ny(fy);
          pts.push({ type:'print', homeX:hx, homeY:hy, x:hx, y:hy, vx:0, vy:0,
                     seed:h1(placed * 5), brightness:0,
                     bone: h1(placed * 11) < 0.12 });   /* mostly gold, occasional bone */
          placed++;
        }
      }

      /* --- keyhole (bone, stable) --- */
      for (i = 0; i < nKey; i++){
        u = i / nKey;
        var fxk, fyk;
        if (u < 0.5){                                    /* ring */
          var a = (u / 0.5) * Math.PI * 2;
          fxk = KEY_CX + KEY_R * Math.cos(a);
          fyk = KEY_CY + KEY_R * Math.sin(a);
        } else if (u < 0.9){                             /* stem walls */
          var s = (u - 0.5) / 0.4;
          var side = (i % 2 === 0) ? -1 : 1;
          var wdn = KEY_STEM_W * (0.5 + 0.5 * s);        /* slightly widened base */
          fxk = KEY_CX + side * wdn * 0.5;
          fyk = KEY_CY + KEY_R * 0.7 + s * KEY_STEM_LEN;
        } else {                                          /* base cap */
          var b = (u - 0.9) / 0.1;
          fxk = KEY_CX + (b - 0.5) * KEY_STEM_W * 1.15;
          fyk = KEY_CY + KEY_R * 0.7 + KEY_STEM_LEN;
        }
        hx = nx(fxk); hy = ny(fyk);
        pts.push({ type:'key', homeX:hx, homeY:hy, x:hx, y:hy, vx:0, vy:0,
                   seed:h1(i * 23), brightness:0.2, bone:true });
      }

      /* --- internal accents (ridges flowing toward the keyhole) --- */
      for (i = 0; i < nAcc; i++){
        u = i / nAcc;
        var aa = u * Math.PI * 2;
        var ar = KEY_R + 0.02 + h1(i * 41) * 0.05;
        var axp = KEY_CX + ar * Math.cos(aa), ayp = KEY_CY + ar * 1.15 * Math.sin(aa);
        hx = nx(axp); hy = ny(ayp);
        pts.push({ type:'accent', homeX:hx, homeY:hy, x:hx, y:hy, vx:0, vy:0,
                   seed:h1(i * 29), brightness:0, bone: h1(i * 37) < 0.5 });
      }
      /* home coordinates are final. PROGRAM CHANGE stays 0%. */
    }

    /* ---------- state ---------- */
    var state = 'idle';                 /* idle | hover | press | drag | release */
    var ptr = { x:-9999, y:-9999, on:false, hover:false, px:-9999, py:-9999, speed:0 };
    var releaseAt = -1, releaseX = 0, releaseY = 0, releasedOnce = false;
    var peak = 0, disp = 0, avgErr = 0;
    var pulseT = -1, hapticDone = false, reformFired = false;
    var trail = [];
    var running = false, raf = 0, frozen = false;
    var fps = 0, fpsAcc = 0, fpsN = 0, lastT = 0;
    var time = 0;

    function setState(s){ state = s; }

    function step(now){
      raf = requestAnimationFrame(step);
      if (lastT){ var dt = now - lastT; fpsAcc += dt; fpsN++;
        if (fpsAcc >= 500){ fps = Math.round(1000 / (fpsAcc / fpsN)); fpsAcc = 0; fpsN = 0; } }
      lastT = now;
      if (dbg.freeze && frozen) { draw(); return; }
      time += 1 / 60;

      var inRelease = releaseAt > 0;
      var sinceRel = inRelease ? (now - releaseAt) : -1;

      var sum = 0, i, p;
      for (i = 0; i < pts.length; i++){
        p = pts[i];
        var mult = TYPE_MULT[p.type], K = SPRING[p.type];

        /* spring toward home — paused 90ms after release, then a wave */
        var springOn = true;
        if (inRelease){
          var delay = Math.min(MAX_WAVE_DELAY,
            Math.hypot(p.homeX - releaseX, p.homeY - releaseY) / maxDist * MAX_WAVE_DELAY);
          springOn = sinceRel > RELEASE_PAUSE + delay;
        }
        if (springOn){
          /* while the magnet holds, the spring resists but does not win —
             ELASTIC RESISTANCE. Full spring authority returns on release. */
          var kEff = ptr.on ? K * 0.22 : K;
          p.vx += (p.homeX - p.x) * kEff;
          p.vy += (p.homeY - p.y) * kEff;
        }

        /* pointer forces */
        if (ptr.on || ptr.hover){
          var radius = ptr.on ? dragRadius() : hoverRadius();
          var dx = ptr.x - p.x, dy = ptr.y - p.y;
          var d = Math.hypot(dx, dy);
          if (d < radius && d > 0.01){
            var falloff = Math.pow(1 - d / radius, 2);
            var towardX = dx / d, towardY = dy / d;
            if (ptr.on){
              p.vx += towardX * ATTR * falloff * mult;
              p.vy += towardY * ATTR * falloff * mult;
              p.vx += -towardY * TANG * falloff * ptr.speed;
              p.vy +=  towardX * TANG * falloff * ptr.speed;
            } else {
              /* hover lean, 8–14px order — gentle, brightening */
              p.vx += towardX * HOVER_STRENGTH * falloff * mult * 6;
              p.vy += towardY * HOVER_STRENGTH * falloff * mult * 6;
            }
            p.brightness = Math.min(1, p.brightness + falloff * 0.15);
          }
        }
        p.brightness *= 0.94;

        p.vx *= DAMP; p.vy *= DAMP;
        var cap = velCap();
        var sp = Math.hypot(p.vx, p.vy);
        if (sp > cap){ p.vx = p.vx / sp * cap; p.vy = p.vy / sp * cap; }
        p.x += p.vx; p.y += p.vy;

        sum += Math.hypot(p.x - p.homeX, p.y - p.homeY);
      }

      avgErr = sum / pts.length;
      disp = Math.min(100, Math.round(avgErr / (symbolR * 0.12) * 100));
      if (disp > peak) peak = disp;

      /* reformation lock: pulse + haptic + reform callback, once per interaction */
      if (inRelease && sinceRel > RELEASE_PAUSE && disp < 3 && !reformFired && peak >= 8){
        reformFired = true;
        pulseT = now;
        if (!hapticDone && phone()){
          try { navigator.vibrate && navigator.vibrate(8); } catch (e) {}
          hapticDone = true;
        }
        if (opts.onReform) opts.onReform({ peak: peak, disp: disp });
      }

      if (opts.onFrame) opts.onFrame(getStats());
      if (dbg.freeze && disp >= peak && peak > 4) frozen = true;
      draw(now);
    }

    function draw(now){
      ctx.clearRect(0, 0, W, H);
      var shimmer = (!reduce && state === 'idle') ? 0.5 : 0;
      for (var i = 0; i < pts.length; i++){
        var p = pts[i];
        var ax = 0, ay = 0;
        if (shimmer){
          ax = Math.sin(time * 0.8 + p.seed * 6.28) * shimmer;
          ay = Math.cos(time * 0.6 + p.seed * 6.28) * shimmer;
        }
        var base = p.bone ? BONE : GOLD;
        ctx.fillStyle = base;
        ctx.globalAlpha = 0.72 + 0.28 * Math.min(1, p.brightness + (p.type === 'key' ? 0.25 : 0));
        var s2 = p.type === 'key' ? 2.8 : 2.2;
        ctx.fillRect(p.x + ax - s2 / 2, p.y + ay - s2 / 2, s2, s2);
      }
      ctx.globalAlpha = 1;

      /* short-lived magnetic trail */
      if (!reduce && trail.length > 1){
        ctx.strokeStyle = GOLD;
        for (var t2 = 1; t2 < trail.length; t2++){
          var a = trail[t2 - 1], b = trail[t2];
          var age = (performance.now() - b.t) / 220;
          if (age >= 1) continue;
          ctx.globalAlpha = 0.18 * (1 - age);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        while (trail.length && performance.now() - trail[0].t > 220) trail.shift();
      }

      /* keyhole pulse — one restrained gold ring on reformation lock */
      if (pulseT > 0 && now){
        var pu = (now - pulseT) / 620;
        if (pu < 1){
          ctx.strokeStyle = GOLD;
          ctx.globalAlpha = 0.55 * (1 - pu);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(nx(KEY_CX), ny(KEY_CY), KEY_R * scale + pu * scale * 0.32, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1; ctx.lineWidth = 1;
        } else pulseT = -1;
      }

      if (dbg.showHomes){
        ctx.fillStyle = RED; ctx.globalAlpha = 0.5;
        for (var i3 = 0; i3 < pts.length; i3 += 4) ctx.fillRect(pts[i3].homeX - 0.5, pts[i3].homeY - 0.5, 1, 1);
        ctx.globalAlpha = 1;
      }
      if (dbg.showRadius && (ptr.on || ptr.hover)){
        ctx.strokeStyle = RED; ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(ptr.x, ptr.y, ptr.on ? dragRadius() : hoverRadius(), 0, Math.PI * 2);
        ctx.stroke(); ctx.globalAlpha = 1;
      }
    }

    /* ---------- pointer handling ---------- */
    function local(e){
      var r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    function beginInteraction(p){
      ptr.on = true; ptr.x = p.x; ptr.y = p.y; ptr.px = p.x; ptr.py = p.y; ptr.speed = 0;
      releaseAt = -1; reformFired = false; hapticDone = false; frozen = false;
      setState('press');
    }
    function moveInteraction(p){
      var dxm = p.x - ptr.px, dym = p.y - ptr.py;
      var raw = Math.hypot(dxm, dym) / 16;             /* normalized, capped */
      ptr.speed = Math.min(1, ptr.speed * 0.7 + raw * 0.3);
      ptr.px = ptr.x; ptr.py = ptr.y; ptr.x = p.x; ptr.y = p.y;
      if (ptr.speed > 0.06) setState('drag');
      if (!reduce) trail.push({ x: p.x, y: p.y, t: performance.now() });
    }
    function endInteraction(){
      if (!ptr.on) return;
      ptr.on = false; ptr.speed = 0; ptr.x = ptr.y = -9999;
      releaseAt = performance.now();
      releaseX = ptr.px; releaseY = ptr.py;
      releasedOnce = true;
      setState('release');
      setTimeout(function(){ if (!ptr.on) setState('idle'); }, 2600);
    }

    /* mouse */
    var mouseDown = false, hoverable = matchMedia('(hover:hover)').matches;
    canvas.addEventListener('mousedown', function(e){
      mouseDown = true; beginInteraction(local(e)); e.preventDefault();
    });
    addEventListener('mousemove', function(e){
      var p = local(e);
      if (mouseDown){ moveInteraction(p); return; }
      if (hoverable){
        var inside = p.x >= 0 && p.y >= 0 && p.x <= W && p.y <= H;
        ptr.hover = inside; if (inside){ ptr.x = p.x; ptr.y = p.y; if (state === 'idle') setState('hover'); }
        else if (state === 'hover') setState('idle');
      }
    }, { passive:true });
    addEventListener('mouseup', function(){ if (mouseDown){ mouseDown = false; endInteraction(); } });

    /* touch — pan-y preserved; horizontal intent gate (Part 8) */
    var tStart = null, tLock = false;
    canvas.style.touchAction = 'pan-y';
    canvas.addEventListener('touchstart', function(e){
      if (e.touches.length !== 1){ tStart = null; tLock = false; if (ptr.on) endInteraction(); return; }
      tStart = local(e.touches[0]); tLock = false;
    }, { passive:true });
    canvas.addEventListener('touchmove', function(e){
      if (!tStart || e.touches.length !== 1) return;
      var p = local(e.touches[0]);
      if (!tLock){
        var dx = Math.abs(p.x - tStart.x), dy = Math.abs(p.y - tStart.y);
        if (dx >= H_INTENT_PX && dx >= dy * H_INTENT_RATIO){
          tLock = true; beginInteraction(tStart);
        } else if (dy > V_CANCEL){ tStart = null; return; }   /* native scroll wins */
      }
      if (tLock){
        if (e.cancelable) e.preventDefault();
        moveInteraction(p);
      }
    }, { passive:false });
    function tEnd(){ tStart = null; if (tLock){ tLock = false; endInteraction(); } }
    canvas.addEventListener('touchend', tEnd);
    canvas.addEventListener('touchcancel', tEnd);
    canvas.addEventListener('pointercancel', tEnd);
    addEventListener('scroll', function(){ if (tLock) tEnd(); }, { passive:true });
    addEventListener('blur', function(){ mouseDown = false; tEnd(); if (ptr.on) endInteraction(); ptr.hover = false; });

    /* rAF lifecycle: pause offscreen + hidden tab */
    var io = new IntersectionObserver(function(es){
      es.forEach(function(en){
        if (en.isIntersecting && !running && !document.hidden){
          running = true; lastT = 0; raf = requestAnimationFrame(step);
        } else if (!en.isIntersecting && running){
          running = false; cancelAnimationFrame(raf);
        }
      });
    }, { threshold: 0.05 });
    io.observe(canvas);
    document.addEventListener('visibilitychange', function(){
      if (document.hidden && running){ running = false; cancelAnimationFrame(raf); }
      else if (!document.hidden && !running){
        var r = canvas.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight){ running = true; lastT = 0; raf = requestAnimationFrame(step); }
      }
    });

    var rT = null;
    addEventListener('resize', function(){ clearTimeout(rT); rT = setTimeout(build, 150); });

    function getStats(){
      return {
        fps: fps, particles: pts.length, state: state,
        displacement: disp, peak: peak,
        avgHomeError: Math.round(avgErr * 100) / 100,
        pointerRadius: ptr.on ? dragRadius() : hoverRadius(),
        pointerSpeed: Math.round(ptr.speed * 100) / 100,
        timeSinceRelease: releaseAt > 0 ? Math.round(performance.now() - releaseAt) : -1,
        reducedMotion: reduce, viewportWidth: innerWidth, dpr: DPR,
        released: releasedOnce
      };
    }
    function reset(){
      peak = 0; disp = 0; releaseAt = -1; reformFired = false;
      hapticDone = false; pulseT = -1; frozen = false; releasedOnce = false;
      for (var i = 0; i < pts.length; i++){
        var p = pts[i]; p.x = p.homeX; p.y = p.homeY; p.vx = 0; p.vy = 0; p.brightness = 0;
      }
      setState('idle');
    }

    build();
    return {
      reset: reset,
      getStats: getStats,
      setDebug: function(d){
        var reB = ('forcePhone' in d) && d.forcePhone !== dbg.forcePhone;
        for (var k in d) if (k in dbg) dbg[k] = d[k];
        if (!dbg.freeze) frozen = false;
        if (reB) build();
      },
      rebuild: build,
      destroy: function(){ running = false; cancelAnimationFrame(raf); io.disconnect(); }
    };
  }

  global.ProgrammedSelf = { mount: mount };
})(window);
