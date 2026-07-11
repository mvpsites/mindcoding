/* THE FIELD engine — EXPERIENCE-SPEC §3. Canvas 2D, one grain buffer, morphing
   attractor homes. No WebGL, no deps. States: 0 hero drift · 1 installed
   desires · 2 program beneath · 3 the return (tear/recapture, symbol cycling)
   · 3.5 hinge · 4 entrainment (heal/rise/bloom) · 5 chosen signal (authored
   symbols → card condensation). Telemetry is computed, never faked. */
import STENCILS from "../data/stencils.json";

const TAU = Math.PI * 2;
const GOLDEN = 2.399963229728653; // 137.507°

export function createField(canvas, opts = {}) {
  const ctx = canvas.getContext("2d");
  const reduced = typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0, H = 0, DPR = 1, CX = 0, CY = 0, FR = 0; // field radius
  let N = 0;
  let px, py, hx, hy, seed, flare, dx, dy; // pos, home, meta, dust
  let running = false, raf = 0, lastT = 0, slowFrames = 0, degraded = false;

  // ——— state
  const S = {
    mv: 0, p: 0,            // movement index + local progress (0..1)
    hinge: false,
    pointer: { x: -9999, y: -9999, vx: 0, vy: 0, down: false },
    tearImpulse: 0,
    recapture: null,        // {r, t0} wave
    cycleIdx: 0,            // S3 reform cycle: mandala,heart,coin,crown
    coherence: 0, holding: false, lockFlare: 0, locked: false,
    displacement: 0,
    breathT: 0,
    onTelemetry: opts.onTelemetry || (() => {}),
    onState: opts.onState || (() => {}),
  };

  // ——— targets (computed once per resize)
  let mandala = null, mandalaFrac = null, helix = null, bloom = null;
  const stencilPts = {}; // name -> scaled [x,y] arrays

  function alloc(n) {
    N = n;
    px = new Float32Array(N); py = new Float32Array(N);
    hx = new Float32Array(N); hy = new Float32Array(N);
    dx = new Float32Array(N); dy = new Float32Array(N);
    seed = new Float32Array(N); flare = new Float32Array(N);
    let s = 1234567;
    const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < N; i++) {
      seed[i] = rnd();
      dx[i] = rnd() * W; dy[i] = rnd() * H;
      px[i] = dx[i]; py[i] = dy[i];
      hx[i] = dx[i]; hy[i] = dy[i];
    }
  }

  function buildTargets() {
    CX = W / 2;
    CY = Math.min(H * 0.44, H - 260);
    FR = Math.min(W, H) * (W < 700 ? 0.34 : 0.30);

    // fractured mandala: 6-fold rings + spokes, sextant 4 bent
    const M = [], MF = [];
    for (let i = 0; i < N; i++) {
      const u = seed[i], v = (i * 0.6180339887) % 1;
      let a, r;
      if (u < 0.62) { // polygonal rings (straight segments = imposed order)
        const ring = 1 + Math.floor(v * 3);
        const side = Math.floor(u * 6 * 97) % 6;
        const t = (u * 991) % 1;
        const a0 = side * TAU / 6, a1 = (side + 1) * TAU / 6;
        const R = FR * (0.32 + ring * 0.21);
        const x0 = Math.cos(a0) * R, y0 = Math.sin(a0) * R;
        const x1 = Math.cos(a1) * R, y1 = Math.sin(a1) * R;
        M.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]); a = a0 + (a1 - a0) * t;
      } else { // spokes
        const k = Math.floor(v * 6);
        a = k * TAU / 6 + TAU / 12;
        r = FR * (0.14 + ((u * 613) % 1) * 0.82);
        M.push([Math.cos(a) * r, Math.sin(a) * r]);
      }
    }
    // fractured copy: rotate sextant 4 by +4°, decay + jitter
    for (let i = 0; i < N; i++) {
      let [x, y] = M[i];
      const ang = Math.atan2(y, x);
      const sext = Math.floor(((ang + TAU) % TAU) / (TAU / 6));
      if (sext === 4) {
        const rot = 4 * Math.PI / 180, c = Math.cos(rot), s2 = Math.sin(rot);
        const r = Math.hypot(x, y) * 0.94;
        const a2 = Math.atan2(y, x) + rot;
        x = Math.cos(a2) * r + (seed[i] - 0.5) * 7;
        y = Math.sin(a2) * r + (((seed[i] * 7) % 1) - 0.5) * 7;
      }
      MF.push([x, y]);
    }
    mandala = M; mandalaFrac = MF;

    // helix: conical spiral, seed-ordered
    helix = [];
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const a = t * 9 * Math.PI;
      const r = (1 - t) * FR * 0.42 + 4;
      helix.push([Math.cos(a) * r, (0.55 - t * 1.05) * FR * 1.7, Math.sin(a) * r * 0.35]);
    }
    // phyllotaxis bloom (index order = growth order)
    bloom = [];
    const c = (FR * 0.95) / Math.sqrt(N);
    for (let n = 0; n < N; n++) {
      const a = n * GOLDEN, r = c * Math.sqrt(n);
      bloom.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    // stencils scaled to field
    for (const k of Object.keys(STENCILS)) {
      const s2 = k === "card" ? FR * 1.15 : FR * 0.92;
      stencilPts[k] = STENCILS[k].map(([x, y]) => [x * s2, y * s2]);
    }
  }

  function setHomesFrom(list, jitter = 0, rot = 0) {
    const L = list.length, cr = Math.cos(rot), sr = Math.sin(rot);
    for (let i = 0; i < N; i++) {
      const p = list[i % L];
      let x = p[0], y = p[1];
      if (rot) { const t = x; x = x * cr - y * sr; y = t * sr + y * cr; }
      hx[i] = CX + x + (jitter ? (seed[i] - 0.5) * jitter : 0);
      hy[i] = CY + y + (jitter ? (((seed[i] * 13) % 1) - 0.5) * jitter : 0);
    }
  }

  function lerpHomes(a, b, t, rot = 0) {
    const La = a.length, Lb = b.length, cr = Math.cos(rot), sr = Math.sin(rot);
    for (let i = 0; i < N; i++) {
      const pa = a[i % La], pb = b[i % Lb];
      let x = pa[0] + (pb[0] - pa[0]) * t, y = pa[1] + (pb[1] - pa[1]) * t;
      if (rot) { const q = x; x = x * cr - y * sr; y = q * sr + y * cr; }
      hx[i] = CX + x; hy[i] = CY + y;
    }
  }

  // roaming attractors for the hero
  const ATT = Array.from({ length: 6 }, (_, k) => ({ ph: k * 1.7, sp: 0.11 + k * 0.023 }));

  function heroHomes(t) {
    const pts = ATT.map((a) => [
      CX + Math.cos(t * a.sp + a.ph) * W * 0.31 + Math.sin(t * a.sp * 1.7 + a.ph * 2) * 40,
      CY + Math.sin(t * a.sp * 0.8 + a.ph) * H * 0.24,
    ]);
    // one cluster "almost coalesces" on a 6s cycle
    const ghost = Math.floor(t / 6) % 6;
    const gp = (t % 6) / 6;
    const tighten = gp < 0.5 ? gp * 2 : (1 - gp) * 2; // rise & dissolve
    for (let i = 0; i < N; i++) {
      const k = Math.floor(seed[i] * 6);
      const spread = (k === ghost ? 1 - tighten * 0.8 : 1) * (90 + seed[i] * 240);
      const a = seed[i] * TAU + t * 0.05 * (seed[i] - 0.5);
      hx[i] = pts[k][0] + Math.cos(a) * spread;
      hy[i] = pts[k][1] + Math.sin(a) * spread * 0.7;
    }
  }

  const SYMS = ["crown", "coin", "heart", "flame"];
  const CYCLE = ["heart", "coin", "crown"]; // S3 reform cycle after mandala

  function updateHomes(t) {
    const { mv, p } = S;
    if (mv === 0) { heroHomes(t); return; }
    if (mv === 1) {
      const seg = p * 5; // 4 symbols + mandala
      if (seg < 4) {
        const i0 = Math.min(3, Math.floor(seg));
        const f = seg - i0;
        if (f < 0.72 || i0 === 3) setHomesFrom(stencilPts[SYMS[i0]], 26);
        else lerpHomes(stencilPts[SYMS[i0]], stencilPts[SYMS[Math.min(3, i0 + 1)]], (f - 0.72) / 0.28);
        if (seg >= 3.7) lerpHomes(stencilPts.flame, mandalaFrac, Math.min(1, (seg - 3.7) / 1.3));
      } else setHomesFrom(mandalaFrac, 0, 0);
      return;
    }
    if (mv === 2) { setHomesFrom(mandalaFrac, 0, t * 0.03); return; }
    if (mv === 3) {
      if (S.hinge) { setHomesFrom(mandalaFrac, 0, t * 0.008); return; }
      const target = S.cycleIdx === 0 ? mandalaFrac : stencilPts[CYCLE[(S.cycleIdx - 1) % 3]];
      setHomesFrom(target, S.cycleIdx === 0 ? 0 : 20, S.cycleIdx === 0 ? t * 0.02 : 0);
      return;
    }
    if (mv === 4) {
      const c = S.coherence;
      if (c <= 0.3) {
        // healing: fracture angle 4°→0 — blend fractured→true mandala
        lerpHomes(mandalaFrac, mandala, c / 0.3, t * 0.015);
      } else if (c <= 0.65) {
        lerpHomes(mandala, helix, (c - 0.3) / 0.35, 0);
      } else {
        const f = (c - 0.65) / 0.35;
        // growth order: grains beyond frontier hold helix
        const frontier = f * N;
        const Lh = helix.length, Lb = bloom.length;
        const br = 1 + (S.locked ? Math.sin(S.breathT * TAU / 10) * 0.025 : 0); // 6/min
        for (let i = 0; i < N; i++) {
          const ph = helix[i % Lh], pb = bloom[i % Lb];
          const k = i < frontier ? Math.min(1, (frontier - i) / (N * 0.08)) : 0;
          hx[i] = CX + (ph[0] + (pb[0] * br - ph[0]) * k);
          hy[i] = CY + (ph[1] + (pb[1] * br - ph[1]) * k);
        }
      }
      return;
    }
    if (mv === 5) {
      const seg = p * 6; // 4 authored symbols + card + hold
      if (seg < 4) {
        const i0 = Math.min(3, Math.floor(seg)), f = seg - i0;
        if (f < 0.7) setHomesFrom(stencilPts[SYMS[i0]], 2); // crisp: jitter 2
        else lerpHomes(stencilPts[SYMS[i0]], i0 < 3 ? stencilPts[SYMS[i0 + 1]] : stencilPts.card, (f - 0.7) / 0.3);
      } else setHomesFrom(stencilPts.card, 0);
    }
  }

  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - lastT) / 1000 || 0.016);
    lastT = now;
    if (dt > 0.028 && !degraded && ++slowFrames > 60) degrade();
    else if (dt <= 0.028) slowFrames = 0;

    const t = now / 1000;
    S.breathT = t;

    // coherence dynamics (S4)
    if (S.mv === 4 && !S.locked) {
      if (S.holding) S.coherence = Math.min(1, S.coherence + dt / 6);
      else S.coherence = Math.max(0, S.coherence - dt / 3);
      if (S.coherence >= 1) { S.locked = true; S.lockFlare = 1; for (let i = 0; i < N; i++) flare[i] = 1; S.onState("locked"); }
    }

    updateHomes(t);

    // recapture wave radius
    let waveR = Infinity, waveOn = false;
    if (S.recapture) {
      waveR = (t - S.recapture.t0) * 480;
      waveOn = true;
      if (waveR > Math.max(W, H)) { S.recapture = null; S.onState("reformed"); }
    }

    const P = S.pointer;
    const stirR2 = 120 * 120;
    let displaced = 0;
    const hingeDim = S.hinge ? 0.35 : 1;

    for (let i = 0; i < N; i++) {
      // spring toward home (gated by recapture wave, center-out)
      let k = (0.035 + seed[i] * 0.045) * hingeDim;
      if (waveOn) {
        const dcx = px[i] - CX, dcy = py[i] - CY;
        if (dcx * dcx + dcy * dcy > waveR * waveR) k = 0.004;
        else if (flare[i] < 0.05 && Math.hypot(px[i] - hx[i], py[i] - hy[i]) > 14) flare[i] = 1;
      }
      let vx = (hx[i] - px[i]) * k;
      let vy = (hy[i] - py[i]) * k;
      // curl drift
      const cx3 = px[i] * 0.011, cy3 = py[i] * 0.011;
      vx += (Math.sin(cy3 * 1.3 + t * 0.5) + Math.cos(cy3 * 0.7 - t * 0.3)) * 0.22 * hingeDim;
      vy += (Math.sin(cx3 * 1.1 - t * 0.4) + Math.cos(cx3 * 1.4 + t * 0.45)) * 0.22 * hingeDim;
      // pointer stir / tear
      const pdx = px[i] - P.x, pdy = py[i] - P.y;
      const d2 = pdx * pdx + pdy * pdy;
      if (d2 < stirR2) {
        const d = Math.sqrt(d2) || 1;
        const g = Math.exp(-d2 * 0.00012);
        const tear = S.mv === 3 && !S.hinge ? 5.2 : 1.4;
        vx += (pdx / d) * g * tear * (1 + Math.abs(P.vx) * 0.03);
        vy += (pdy / d) * g * tear * (1 + Math.abs(P.vy) * 0.03);
        vx += (-pdy / d) * g * 0.8; vy += (pdx / d) * g * 0.8;
      }
      px[i] += vx; py[i] += vy;
      if (flare[i] > 0.01) flare[i] -= dt * 3.3; else flare[i] = 0;
      const hd = Math.abs(px[i] - hx[i]) + Math.abs(py[i] - hy[i]);
      if (hd > 14) displaced++;
    }
    S.displacement = displaced / N;

    // S3: if user tore (impulse) and no wave running, start recapture on settle
    if (S.mv === 3 && !S.hinge && S.tearImpulse > 0 && !S.recapture && !P.down) {
      S.recapture = { t0: t };
      S.tearImpulse = 0;
      S.cycleIdx = (S.cycleIdx + 1) % 4; // next reform is the next program
      S.onState("recapture");
    }

    draw();
    S.onTelemetry(S);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const base = "201,169,106";
    for (let i = 0; i < N; i++) {
      const f = flare[i];
      const a = 0.28 + seed[i] * 0.5 + f * 0.4;
      const r = 0.6 + seed[i] * 0.6 + f * 0.8;
      ctx.fillStyle = f > 0.05
        ? `rgba(232,203,143,${Math.min(1, a)})`
        : `rgba(${base},${Math.min(0.85, a) * (S.hinge ? 0.45 : 1)})`;
      ctx.fillRect(px[i] - r, py[i] - r, r * 2, r * 2);
    }
    if (S.lockFlare > 0.01) {
      ctx.fillStyle = `rgba(232,203,143,${S.lockFlare * 0.12})`;
      ctx.fillRect(0, 0, W, H);
      S.lockFlare *= 0.92;
    }
  }

  function degrade() {
    degraded = true;
    const keep = 1800;
    if (N > keep) { alloc(keep); buildTargets(); }
  }

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const n = degraded ? 1800 : (W < 700 ? 2600 : 4096);
    if (n !== N) alloc(n);
    buildTargets();
  }

  // ——— public API
  const api = {
    setMovement(mv, p) {
      if (mv !== S.mv) {
        S.mv = mv;
        if (mv === 4) { S.coherence = 0; S.locked = false; }
        if (mv === 3) { S.cycleIdx = 0; }
        S.onState("movement");
      }
      S.p = p;
    },
    setHinge(on) { S.hinge = on; },
    pointerMove(x, y, vx, vy) { S.pointer.x = x; S.pointer.y = y; S.pointer.vx = vx; S.pointer.vy = vy; if (S.mv === 3 && !S.hinge && S.pointer.down) S.tearImpulse = 1; },
    pointerDown(x, y) { S.pointer.down = true; S.pointer.x = x; S.pointer.y = y; if (S.mv === 3 && !S.hinge) S.tearImpulse = 1; },
    pointerUp() { S.pointer.down = false; S.pointer.x = -9999; S.pointer.y = -9999; },
    holdStart() { if (S.mv === 4) { S.holding = true; S.onState("holding"); } },
    holdEnd() { S.holding = false; },
    get state() { return S; },
    start() { if (!running) { running = true; lastT = performance.now(); raf = requestAnimationFrame(tick); } },
    stop() { running = false; cancelAnimationFrame(raf); },
    resize,
    reduced,
  };

  resize();
  if (reduced) {
    // static: draw final form of current movement on setMovement
    api.start = () => {};
    api.setMovement = (mv, p) => {
      S.mv = mv; S.p = mv === 1 || mv === 5 ? 1 : p;
      if (mv === 4) S.coherence = 1;
      updateHomes(0);
      for (let i = 0; i < N; i++) { px[i] = hx[i]; py[i] = hy[i]; }
      draw();
    };
  }
  return api;
}
