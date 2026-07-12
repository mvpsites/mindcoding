/* ============================================================
   THE PROGRAMMED SELF — shared symbol engine
   Mind Coding · mind-emblem-v3
   The Mind Coding emblem: two mirrored profiles, circuit-brain
   paths, central keyhole, star, circular seal.
   Geometry: /shared/emblem-points.js (traced from the actual
   logo — the generated map is the source of truth; load it
   BEFORE this file). Desktop map above 700px, mobile map at
   or below 700px — never a shrunken desktop field.
   MAGNETIC PULL -> REGION RESISTANCE -> CENTER-OUT REFORMATION.
   Circuits yield first; profiles and seal resist; star and
   keyhole are the stable core.
   Canvas 2D only. Home coordinates never change after build.
   PROGRAM CHANGE is 0% forever, honestly.
   Loaded identically by /preview-symbol-lab/ and /preview-zine-v2/.
   ============================================================ */
(function (global) {
  'use strict';

  var GOLD = '#D79A4A', GOLD_BRIGHT = '#F4C85C', BONE = '#EFE7D6', RED = '#FF2B06';

  /* region behavior — from the approved prototype, verbatim.
     circuits move most; seal + profiles restrained; star and
     keyhole strongest spring, least displacement. */
  /* FLUID retune (ruled 07-12): hover stirs the field easily, the emblem
     drifts home slowly. Springs ~x0.33 (lazy return), damping raised
     (floaty glide), hierarchy preserved: circuits still yield first. */
  /* ELASTIC retune (ruled 07-12): while HELD the springs barely fight
     (x0.15 authority — the field follows you, you believe you changed it);
     on RELEASE the full springs whip it home, keyhole outward. Hover keeps
     the fluid stir; only the drag is given rope. */
  var BEHAVIOR = {
    circuit: { force: 1.00, spring: 0.030, damping: 0.90  },
    seal:    { force: 0.28, spring: 0.048, damping: 0.885 },
    star:    { force: 0.16, spring: 0.060, damping: 0.87  },
    key:     { force: 0.20, spring: 0.054, damping: 0.87  }
  };
  var DRAG_AUTHORITY = 0.15;

  function h1(i){ return Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1; }

  /* ---------- controller ---------- */
  function mount(canvas, opts){
    opts = opts || {};
    if (!canvas || !canvas.getContext) return null;
    var MAP = global.MIND_EMBLEM_POINTS;
    if (!MAP || !MAP.desktop || !MAP.mobile){
      /* the map is required — fail loudly, never draw an approximation */
      if (global.console) console.error('ProgrammedSelf: MIND_EMBLEM_POINTS missing — load /shared/emblem-points.js first.');
      return null;
    }
    var ctx = canvas.getContext('2d');
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isPhone = matchMedia('(max-width: 700px)').matches;

    var dbg = { showHomes:false, showRadius:false, freeze:false, forcePhone:false };

    /* interaction constants — prototype values + kept touch contract */
    var PULL = 1.2, TANG = 0.24, HOVER_PRESS = 0.6;   /* fluid: hover ~3x stronger net */
    var WAVE_BASE = 70, WAVE_SPAN = 150, WAVE_WINDOW = 900, SPRING_LOCK = 1.12;
    var H_INTENT_PX = 20, H_INTENT_RATIO = 1.4, V_CANCEL = 26;

    function phone(){ return dbg.forcePhone || isPhone; }
    /* prototype radius — scales with the emblem, floored for small canvases */
    function radius(){ return phone() ? Math.max(100, fit * 0.24) : Math.max(140, fit * 0.26); }
    function velCap(){ return phone() ? 9 : 12; }

    var pts = [];
    var W = 0, H = 0, DPR = 1, fit = 1, cx = 0, cy = 0;
    var keyCX = 0, keyCY = 0, keyR = 1;

    function build(){
      var rect = canvas.getBoundingClientRect();
      DPR = Math.min(devicePixelRatio || 1, 2);
      W = Math.max(1, rect.width); H = Math.max(1, rect.height);
      canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cx = W / 2; cy = H / 2 + Math.min(24, H * 0.025);
      fit = Math.min(W, H) * 0.82;

      /* map the supplied normalized coordinates exactly as the prototype does */
      var source = phone() ? MAP.mobile : MAP.desktop;
      pts.length = 0;
      var kx = 0, ky = 0, kn = 0, kMinX = 1e9, kMaxX = -1e9;
      for (var i = 0; i < source.length; i++){
        var q = source[i];
        var hx = cx + q[0] * fit, hy = cy + q[1] * fit;
        var sd = h1(i + 1), sd2 = h1(i * 7 + 3);
        /* ASSEMBLY (07-12): every particle owns a scatter origin — a point
           flung outward from home — used once by the entrance choreography */
        var sa = sd2 * Math.PI * 2, sr = fit * (0.55 + sd * 0.85);
        pts.push({ region: q[2], alpha: q[3],
                   homeX: hx, homeY: hy, x: hx, y: hy, vx: 0, vy: 0,
                   sx: hx + Math.cos(sa) * sr, sy: hy + Math.sin(sa) * sr,
                   ci: -1, seed: sd, brightness: 0 });
        if (q[2] === 'key'){ kx += hx; ky += hy; kn++;
          if (hx < kMinX) kMinX = hx; if (hx > kMaxX) kMaxX = hx; }
      }
      /* circuit order index — map order traces the paths, so an index walk
         IS a walk along the circuitry (used by the signal packets) */
      var ci = 0;
      for (var c1 = 0; c1 < pts.length; c1++) if (pts[c1].region === 'circuit') pts[c1].ci = ci++;
      circuitN = ci;
      /* keyhole pulse anchor, derived from the key region itself */
      keyCX = kn ? kx / kn : cx;
      keyCY = kn ? ky / kn : cy;
      keyR = kn ? Math.max(8, (kMaxX - kMinX) * 0.5) : fit * 0.1;
      /* home coordinates are final. PROGRAM CHANGE stays 0%. */
    }

    /* ---------- state ---------- */
    var state = 'idle';                 /* idle | hover | press | drag | release */
    /* STILL RUNNING (ruled 07-12): the emblem is never dead.
       ASSEMBLY — group-staggered entrance on first sight (circuit->seal->star->key).
       SIGNALS — gold packets travel the circuit paths while idle.
       GLITCH — a rare one-blink red band that self-corrects.
       All of it exits under prefers-reduced-motion; opts.entrance:false skips
       the assembly (harnesses render the resting state). */
    var ENT_DUR = 650, ENT_GROUP = { circuit: 0, seal: 320, star: 560, key: 720 };
    var entWanted = opts.entrance !== false && !reduce;
    var entT = -1, entDone = !entWanted, entMax = ENT_DUR + 720 + 260;
    var circuitN = 0, packets = [], nextPacket = 0;
    var glitchT = -1, glitchY = 0, nextGlitch = 0;
    var ptr = { x:-9999, y:-9999, on:false, hover:false, px:-9999, py:-9999, speed:0 };
    var releaseAt = -1, releasedOnce = false;
    var peak = 0, disp = 0, avgErr = 0;
    var pulseT = -1, hapticDone = false, reformFired = false;
    var trail = [];
    var running = false, raf = 0, frozen = false;
    var fps = 0, fpsAcc = 0, fpsN = 0, lastT = 0;

    function setState(s){ state = s; }

    function step(now){
      raf = requestAnimationFrame(step);
      if (lastT){ var dt = now - lastT; fpsAcc += dt; fpsN++;
        if (fpsAcc >= 500){ fps = Math.round(1000 / (fpsAcc / fpsN)); fpsAcc = 0; fpsN = 0; } }
      lastT = now;
      if (dbg.freeze && frozen) { draw(now); return; }

      /* ---------- ASSEMBLY entrance ---------- */
      if (!entDone){
        if (entT < 0) entT = now || 1;
        var entElapsed = now - entT;
        if (entElapsed >= entMax){
          entDone = true;
          for (var e1 = 0; e1 < pts.length; e1++){ pts[e1].x = pts[e1].homeX; pts[e1].y = pts[e1].homeY; pts[e1].vx = 0; pts[e1].vy = 0; }
          pulseT = now;   /* the seal completes: one gold ring */
        } else {
          for (var e2 = 0; e2 < pts.length; e2++){
            var ep = pts[e2];
            var et = entElapsed - (ENT_GROUP[ep.region] + ep.seed * 260);
            if (et <= 0){ ep.x = ep.sx; ep.y = ep.sy; ep.entA = 0; continue; }
            var pr = Math.min(1, et / ENT_DUR);
            var ez = 1 - Math.pow(1 - pr, 3);   /* easeOutCubic */
            ep.x = ep.sx + (ep.homeX - ep.sx) * ez;
            ep.y = ep.sy + (ep.homeY - ep.sy) * ez;
            ep.entA = Math.min(1, pr * 2.2);
          }
          if (opts.onFrame) opts.onFrame(getStats());
          draw(now);
          return;
        }
      }

      /* ---------- SIGNAL + GLITCH schedulers (idle life) ---------- */
      if (!reduce && now){
        if (!nextPacket) nextPacket = now + 1400;
        if (now >= nextPacket && packets.length < 2 && circuitN > 40){
          packets.push({ t0: now, i0: Math.floor(h1(now) * circuitN), len: 90 + h1(now * 3) * 90, sp: 0.11 + h1(now * 7) * 0.05 });
          nextPacket = now + 2600 + h1(now * 13) * 3200;
        }
        for (var pk = packets.length - 1; pk >= 0; pk--)
          if ((now - packets[pk].t0) * packets[pk].sp > packets[pk].len + 12) packets.splice(pk, 1);
        if (!nextGlitch) nextGlitch = now + 9000 + h1(now) * 9000;
        if (now >= nextGlitch && !ptr.on){
          glitchT = now; glitchY = cy + (h1(now * 5) - 0.5) * fit * 0.7;
          nextGlitch = now + 16000 + h1(now * 11) * 10000;
        }
      }

      var inRelease = releaseAt > 0;
      var sinceRel = inRelease ? (now - releaseAt) : -1;
      var active = (ptr.on || ptr.hover) && !reduce;   /* reduced motion: static emblem */
      var R = radius();

      var sum = 0, i, p;
      for (i = 0; i < pts.length; i++){
        p = pts[i];
        var b = BEHAVIOR[p.region];

        /* pointer force — prototype model */
        if (active){
          var dx = ptr.x - p.x, dy = ptr.y - p.y;
          var d = Math.hypot(dx, dy) || 1;
          if (d < R){
            var falloff = Math.pow(1 - d / R, 1.35);   /* softer gradient, watery */
            var press = ptr.on ? 1 : HOVER_PRESS;
            var force = b.force * falloff * press;
            p.vx += (dx / d) * force * PULL;
            p.vy += (dy / d) * force * PULL;
            if (ptr.on){
              p.vx += (-dy / d) * force * TANG;
              p.vy += ( dx / d) * force * TANG;
            }
            p.brightness = Math.min(1, p.brightness + falloff * 0.15);
          }
        }
        p.brightness *= 0.94;

        /* spring toward home — on release, the reformation travels
           from the keyhole outward (center-out wave) */
        var spring = b.spring;
        if (ptr.on && active) spring *= DRAG_AUTHORITY;   /* give the hand rope */
        if (inRelease && sinceRel < WAVE_WINDOW){
          var coreDistance = Math.hypot(p.homeX - cx, p.homeY - cy) / (fit * 0.5);
          if (sinceRel < WAVE_BASE + coreDistance * WAVE_SPAN) spring = 0;
          else spring *= SPRING_LOCK;
        }
        p.vx += (p.homeX - p.x) * spring;
        p.vy += (p.homeY - p.y) * spring;

        p.vx *= b.damping; p.vy *= b.damping;
        var cap = velCap();
        var sp = Math.hypot(p.vx, p.vy);
        if (sp > cap){ p.vx = p.vx / sp * cap; p.vy = p.vy / sp * cap; }
        p.x += p.vx; p.y += p.vy;

        sum += Math.hypot(p.x - p.homeX, p.y - p.homeY);
      }

      avgErr = sum / pts.length;
      disp = Math.min(100, Math.round(avgErr / (fit * 0.12) * 100));
      if (disp > peak) peak = disp;

      /* reformation lock: pulse + haptic + reform callback, once per interaction */
      /* lock threshold retuned for the region-weighted emblem: seal/star/key
         barely move by design, so average displacement runs lower than the
         old single-profile field (which used peak >= 8). A deliberate swipe
         measures 4-7% here; trivial taps stay below. */
      if (inRelease && sinceRel > WAVE_BASE && disp < 3 && !reformFired && peak >= 4){
        reformFired = true;
        pulseT = now;
        if (!hapticDone && phone()){
          try { navigator.vibrate && navigator.vibrate(8); } catch (e) {}
          hapticDone = true;
        }
        if (opts.onReform) opts.onReform({ peak: peak, disp: disp, ms: Math.max(0, Math.round(now - releaseAt)) });
      }

      if (opts.onFrame) opts.onFrame(getStats());
      if (dbg.freeze && disp >= peak && peak > 2) frozen = true;
      draw(now);
    }

    function draw(now){
      ctx.clearRect(0, 0, W, H);
      var base = phone() ? 2.15 : 2.05;
      var gOn = glitchT > 0 && now && (now - glitchT) < 90;
      if (glitchT > 0 && now && (now - glitchT) >= 90) glitchT = -1;
      for (var i = 0; i < pts.length; i++){
        var p = pts[i];
        var core = p.region === 'key' || p.region === 'star';
        var pulse = (core && !reduce && now) ? 0.78 + 0.22 * Math.sin(now * 0.0025 + p.seed * 4) : 1;
        var alpha = Math.min(1, 0.5 + p.alpha * 0.55) * pulse;
        var boost = 0;
        /* SIGNALS: a bright packet travelling the circuit order */
        if (p.ci >= 0 && packets.length && now){
          for (var pk2 = 0; pk2 < packets.length; pk2++){
            var pkt = packets[pk2];
            var head = pkt.i0 + (now - pkt.t0) * pkt.sp;
            var dci = head - p.ci;
            if (dci > 0 && dci < 11) boost = Math.max(boost, 1 - dci / 11);
          }
        }
        ctx.globalAlpha = Math.min(1, (alpha + p.brightness * 0.25 + boost * 0.5) * (entDone ? 1 : (p.entA || 0)));
        ctx.fillStyle = boost > 0.25 ? GOLD_BRIGHT : (core ? BONE : (p.seed > 0.88 ? GOLD_BRIGHT : GOLD));
        var s2 = base + (p.seed > 0.92 ? 0.7 : 0) + (core ? 0.35 : 0) + boost * 0.9;
        /* GLITCH: one-blink red offset band, then the program corrects itself */
        if (gOn && Math.abs(p.y - glitchY) < 15){
          ctx.fillStyle = RED;
          ctx.fillRect(p.x - s2 / 2 + 3, p.y - s2 / 2, s2, s2);
        } else {
          ctx.fillRect(p.x - s2 / 2, p.y - s2 / 2, s2, s2);
        }
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
          ctx.arc(keyCX, keyCY, keyR + pu * fit * 0.16, 0, Math.PI * 2);
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
        ctx.arc(ptr.x, ptr.y, radius(), 0, Math.PI * 2);
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
    var tStart = null, tLock = false, tHold = null;
    var HOLD_MS = 180;   /* press-and-hold engages without horizontal intent (mobile fix 07-12) */
    canvas.style.touchAction = 'pan-y';
    canvas.addEventListener('touchstart', function(e){
      if (e.touches.length !== 1){ tStart = null; tLock = false; clearTimeout(tHold); if (ptr.on) endInteraction(); return; }
      tStart = local(e.touches[0]); tLock = false;
      clearTimeout(tHold);
      tHold = setTimeout(function(){
        if (tStart && !tLock){ tLock = true; beginInteraction(tStart); }
      }, HOLD_MS);
    }, { passive:true });
    canvas.addEventListener('touchmove', function(e){
      if (!tStart || e.touches.length !== 1) return;
      var p = local(e.touches[0]);
      if (!tLock){
        var dx = Math.abs(p.x - tStart.x), dy = Math.abs(p.y - tStart.y);
        if (dx >= H_INTENT_PX && dx >= dy * H_INTENT_RATIO){
          tLock = true; beginInteraction(tStart);
        } else if (dy > V_CANCEL){ tStart = null; clearTimeout(tHold); return; }   /* native scroll wins */
      }
      if (tLock){
        if (e.cancelable) e.preventDefault();
        moveInteraction(p);
      }
    }, { passive:false });
    function tEnd(){ tStart = null; clearTimeout(tHold); if (tLock){ tLock = false; endInteraction(); } }
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
        pointerRadius: radius(),
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
