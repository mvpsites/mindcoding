/* THE FIELD v5 — Mind Coding on EIDOLON's engine (Jad-supplied source).
   One continuous BufferGeometry. Per-grain aHomeA/aHomeB/aDust/aSeed; the
   vertex shader lerps dust↔home with seed stagger, blends home sets via
   uMorph (uGrowMode turns uMorph into a seed-frontier so held shapes grow
   center-out), curls the dust, and lets the cursor/finger stir it.
   ~56k grains desktop / adaptive mobile. 70% of form grains on contour,
   30% inside. Honest telemetry (displacement mirrors the shader's stir
   formula over a sample; pattern change is, truthfully, always 0).
   Falls back to the canvas-2D engine only when WebGL is unavailable. */
import * as THREE from "three";
import STENCILS from "../data/stencils.json";

// ——— shape generators: pure math, ~3 units tall, 70/30 contour/fill ———
// Each fills a Float32Array(N*3). Planar silhouettes get a slab of depth and
// the same slight camera tilt EIDOLON gives its planar artifacts.
const TILT_X = -0.16;
function tilt(x, y, z) {
  return [x, y * Math.cos(TILT_X) - z * Math.sin(TILT_X), y * Math.sin(TILT_X) + z * Math.cos(TILT_X)];
}

export function buildHomes(N) {
  const sets = {};
  const mk = () => new Float32Array(N * 3);
  const CONTOUR = 0.7; // share of grains on the outline

  const write = (arr, i, x, y, z, jit) => {
    const [tx, ty, tz] = tilt(
      x + (Math.random() - 0.5) * jit,
      y + (Math.random() - 0.5) * jit,
      z
    );
    arr[i * 3] = tx; arr[i * 3 + 1] = ty; arr[i * 3 + 2] = tz;
  };

  // — MOUNTAIN: one main peak + a lower shoulder ridge; base line closes it.
  // Silhouette polyline in [-1.5,1.5]x[-1.1,1.4]; fill = points under the ridge.
  const RIDGE = [
    [-1.5, -1.0], [-1.05, -0.28], [-0.78, -0.5], [-0.42, 0.42],
    [-0.18, 0.16], [0.14, 1.32], [0.4, 0.72], [0.62, 0.94],
    [1.02, -0.12], [1.24, -0.44], [1.5, -1.0],
  ];
  function ridgeY(x) {
    for (let k = 0; k < RIDGE.length - 1; k++) {
      const [x0, y0] = RIDGE[k], [x1, y1] = RIDGE[k + 1];
      if (x >= x0 && x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
    }
    return -1.0;
  }
  function genMountain(arr, harmonious) {
    const jit = harmonious ? 0.008 : 0.028;
    // arc-length table over ridge for even contour sampling
    const seg = [0];
    for (let k = 0; k < RIDGE.length - 1; k++)
      seg.push(seg[k] + Math.hypot(RIDGE[k + 1][0] - RIDGE[k][0], RIDGE[k + 1][1] - RIDGE[k][1]));
    const total = seg[seg.length - 1];
    const baseLen = 3.0;
    for (let i = 0; i < N; i++) {
      const u = Math.random();
      let x, y;
      if (u < CONTOUR) {
        // outline: ridge (weighted by length) or base line
        if (Math.random() < total / (total + baseLen)) {
          const t = Math.random() * total;
          let k = 0; while (k < seg.length - 2 && seg[k + 1] < t) k++;
          const f = (t - seg[k]) / (seg[k + 1] - seg[k] || 1);
          x = RIDGE[k][0] + (RIDGE[k + 1][0] - RIDGE[k][0]) * f;
          y = RIDGE[k][1] + (RIDGE[k + 1][1] - RIDGE[k][1]) * f;
        } else { x = -1.5 + Math.random() * 3.0; y = -1.0; }
      } else {
        // fill: rejection-sample under the ridge
        do { x = -1.5 + Math.random() * 3.0; y = -1.0 + Math.random() * 2.4; } while (y > ridgeY(x));
      }
      write(arr, i, x, y - 0.15, (Math.random() - 0.5) * 0.16, jit);
    }
  }

  // — HEART: classic parametric curve, uniform-ish along the contour.
  function heartXY(t) {
    const s = Math.sin(t), c = Math.cos(t);
    return [
      (16 * s * s * s) / 13,
      (13 * c - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 13,
    ];
  }
  function genHeart(arr, harmonious) {
    const jit = harmonious ? 0.008 : 0.026;
    const S = 1.15;
    for (let i = 0; i < N; i++) {
      const u = Math.random();
      let x, y;
      if (u < CONTOUR) {
        const [hx, hy] = heartXY(Math.random() * Math.PI * 2);
        x = hx * S; y = hy * S;
      } else {
        // fill: scale a contour point inward (sqrt keeps density even-ish)
        const [hx, hy] = heartXY(Math.random() * Math.PI * 2);
        const f = Math.sqrt(Math.random()) * 0.94;
        x = hx * S * f; y = (hy - 0.12) * S * f + 0.12 * S;
      }
      write(arr, i, x, y, (Math.random() - 0.5) * 0.16, jit);
    }
  }

  // — FLAME: leaning teardrop; two mirrored curves meet at a licked tip.
  // Width profile w(v) with an S-curve lean; inner core fill is brighter-dense.
  function genFlame(arr, harmonious) {
    const jit = harmonious ? 0.008 : 0.03;
    const lean = harmonious ? 0.12 : 0.3; // wild flame leans + flickers more
    for (let i = 0; i < N; i++) {
      const u = Math.random();
      const v = Math.pow(Math.random(), 0.85);           // 0 base .. 1 tip (denser low)
      const w = 0.72 * Math.sin(Math.PI * Math.min(v * 1.12, 1)) * (1 - v * 0.35);
      const cx = lean * Math.sin(v * Math.PI * 1.35) * v; // S lean of the spine
      let x, y;
      if (u < CONTOUR) {
        const side = Math.random() < 0.5 ? 1 : -1;
        const rag = harmonious ? 0 : 0.05 * Math.sin(v * 23 + side * 7) * v;
        x = cx + side * (w + rag);
        y = -1.35 + v * 2.85;
      } else {
        x = cx + (Math.random() * 2 - 1) * w * 0.82;
        y = -1.35 + v * 2.85;
      }
      write(arr, i, x, y, (Math.random() - 0.5) * 0.15, jit);
    }
  }

  // — PATTERN: the three longings collapsed into one distorted subconscious
  // figure. Each grain keeps its archetype ancestry (by seed third) but is
  // shrunk, rotated off-true, knotted by a radial warp — recognizably wrong,
  // and perfectly deterministic so it always reforms the SAME way.
  function genPattern(arr) {
    const tmp = new Float32Array(N * 3);
    const third = Math.floor(N / 3);
    // reuse generators into a scratch then distort
    genMountain(tmp, false); copyRange(arr, tmp, 0, third);
    genHeart(tmp, false); copyRange(arr, tmp, third, third * 2);
    genFlame(tmp, false); copyRange(arr, tmp, third * 2, N);
    const ROT = [-0.42, 0.6, 2.6], SC = [0.62, 0.58, 0.66];
    const OFF = [[-0.32, -0.3], [0.34, 0.14], [-0.05, 0.42]];
    for (let i = 0; i < N; i++) {
      const g = i < third ? 0 : i < third * 2 ? 1 : 2;
      let x = arr[i * 3] * SC[g], y = arr[i * 3 + 1] * SC[g];
      const c = Math.cos(ROT[g]), s = Math.sin(ROT[g]);
      const rx = x * c - y * s + OFF[g][0], ry = x * s + y * c + OFF[g][1];
      // knot warp: radial pinch + angular shear, seeded by position (stable)
      const r = Math.hypot(rx, ry), a = Math.atan2(ry, rx);
      const warp = 0.16 * Math.sin(a * 3 + r * 4.2);
      const r2 = r * (0.92 + warp * 0.4);
      const a2 = a + warp;
      write(arr, i, Math.cos(a2) * r2, Math.sin(a2) * r2, arr[i * 3 + 2] * 0.8, 0.012);
    }
  }
  function copyRange(dst, src, from, to) {
    for (let i = from; i < to; i++) {
      dst[i * 3] = src[i * 3]; dst[i * 3 + 1] = src[i * 3 + 1]; dst[i * 3 + 2] = src[i * 3 + 2];
    }
  }

  // — CARD: the existing Mind Coding card-back stencil (kept from v4).
  function genCard(arr) {
    const pts = STENCILS.card, L = pts.length, scale = 1.75;
    for (let i = 0; i < N; i++) {
      const p = pts[i % L];
      write(arr, i, p[0] * scale, -p[1] * scale, (Math.random() - 0.5) * 0.1, 0.014);
    }
  }

  sets.mountain = mk(); genMountain(sets.mountain, false);
  sets.heart = mk(); genHeart(sets.heart, false);
  sets.flame = mk(); genFlame(sets.flame, false);
  sets.pattern = mk(); genPattern(sets.pattern);
  sets.card = mk(); genCard(sets.card);
  sets.mountainH = mk(); genMountain(sets.mountainH, true);
  sets.heartH = mk(); genHeart(sets.heartH, true);
  sets.flameH = mk(); genFlame(sets.flameH, true);

  // Rank harmonious shapes by radius against seed order so the uGrowMode
  // frontier grows them center-out during the hold (EIDOLON bloom trick).
  return {
    sets,
    finishGrowth(seedArr) {
      const idx = Array.from({ length: N }, (_, i) => i).sort((a, b) => seedArr[a] - seedArr[b]);
      for (const name of ["mountainH", "heartH", "flameH"]) {
        const src = sets[name];
        const order = Array.from({ length: N }, (_, i) => i).sort((a, b) => {
          const ra = src[a * 3] ** 2 + src[a * 3 + 1] ** 2;
          const rb = src[b * 3] ** 2 + src[b * 3 + 1] ** 2;
          return ra - rb;
        });
        const out = new Float32Array(N * 3);
        for (let r = 0; r < N; r++) {
          const grain = idx[r], p = order[r];
          out[grain * 3] = src[p * 3]; out[grain * 3 + 1] = src[p * 3 + 1]; out[grain * 3 + 2] = src[p * 3 + 2];
        }
        sets[name] = out;
      }
      return sets;
    },
  };
}

export function createFieldV5(canvas, opts = {}) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    if (!renderer.getContext()) throw new Error("no gl");
  } catch (e) {
    return null; // caller falls back
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x070b1a, 1);           // midnight
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070b1a, 0.048);
  const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 7.4);

  // EIDOLON density: ~56k desktop; adaptive down for mobile GPUs
  const N = innerWidth < 700 ? 18000 : innerWidth < 1100 ? 34000 : 56000;
  const aHomeA = new Float32Array(N * 3);
  const aHomeB = new Float32Array(N * 3);
  const aDust = new Float32Array(N * 3);
  const aSeed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const r = 3.4 + Math.random() * 3.2;
    const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    aDust[i * 3] = r * Math.sin(ph) * Math.cos(th);
    aDust[i * 3 + 1] = r * Math.cos(ph) * 0.7;
    aDust[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    aSeed[i] = Math.random();
  }
  const HOMES = buildHomes(N).finishGrowth(aSeed);
  HOMES.dusthome = aDust.slice(); // "home" = the grain's own dust seat (movement 4 growth base)

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("aHomeA", new THREE.BufferAttribute(aHomeA, 3));
  geo.setAttribute("aHomeB", new THREE.BufferAttribute(aHomeB, 3));
  geo.setAttribute("aDust", new THREE.BufferAttribute(aDust, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(aSeed, 1));
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  const loadA = (name) => { aHomeA.set(HOMES[name]); geo.attributes.aHomeA.needsUpdate = true; };
  const loadB = (name) => { aHomeB.set(HOMES[name]); geo.attributes.aHomeB.needsUpdate = true; };

  const uniforms = {
    uTime: { value: 0 },
    uAssembly: { value: 0 },
    uMorph: { value: 0 },
    uGrowMode: { value: 0 },
    uFocus: { value: 0 },
    uCalm: { value: 0 },
    uDim: { value: 1 },
    uBreath: { value: 0 },
    uSwirl: { value: 0 },
    uTear: { value: 0 },
    uMouse: { value: new THREE.Vector3(999, 999, 0) },
    uTint: { value: new THREE.Color(0xc9a96a) },   // warm gold
    uPixelRatio: { value: Math.min(devicePixelRatio, 2) },
    uSize: { value: innerWidth < 700 ? 2.5 : 2.1 },
    uRotY: { value: 0 },
  };

  const vert = /* glsl */ `
    uniform float uTime,uAssembly,uMorph,uGrowMode,uFocus,uCalm,uDim,uBreath,uSwirl,uTear,uPixelRatio,uSize,uRotY;
    uniform vec3 uMouse;
    attribute vec3 aHomeA; attribute vec3 aHomeB; attribute vec3 aDust; attribute float aSeed;
    varying float vBright;
    vec3 curl(vec3 p, float t){
      float x = sin(p.y*1.3 + t*0.5) + cos(p.z*1.1 - t*0.4);
      float y = sin(p.z*1.2 - t*0.45) + cos(p.x*1.4 + t*0.5);
      float z = sin(p.x*1.1 + t*0.4) + cos(p.y*1.3 - t*0.5);
      return vec3(x,y,z);
    }
    mat3 rotY(float a){ float c=cos(a),s=sin(a); return mat3(c,0.,s, 0.,1.,0., -s,0.,c); }
    void main(){
      float t = uTime;
      float m = uGrowMode > 0.5 ? clamp((uMorph - aSeed)/0.08, 0., 1.) : uMorph;
      vec3 home = mix(aHomeA, aHomeB, m);
      home *= 1.0 + uBreath * 0.025 * sin(t * 0.6283);  // 6 breaths / minute
      float assembled = clamp(uAssembly, 0., 1.);
      float stagger = smoothstep(0., 1., (assembled - aSeed*0.35) / 0.65);
      vec3 dust = aDust + curl(aDust*0.35 + vec3(0., t*0.05, 0.), t) * 0.22 * (1.0 - stagger);
      vec3 pos = mix(dust, home, stagger);
      pos = rotY(uRotY) * pos;
      vec3 toM = pos - uMouse;
      float d = length(toM.xy);
      float infl = exp(-d*d*0.6) * (uSwirl + uTear*2.6);
      vec3 swirlDir = normalize(vec3(-toM.y, toM.x, 0.) + 1e-4);
      pos += swirlDir * infl * 0.9;
      pos += normalize(toM + 1e-4) * infl * uTear * 0.8;
      pos += curl(pos*0.5, t*1.3) * infl * 0.4;
      pos = mix(pos, rotY(uRotY)*home, uFocus * stagger * 0.5);
      pos += curl(home*0.8 + aSeed*10., t*0.6) * 0.012 * stagger * (1.0 - uCalm);
      vec4 mv = modelViewMatrix * vec4(pos, 1.);
      gl_Position = projectionMatrix * mv;
      float size = uSize * (0.6 + aSeed*0.8);
      size *= (1.0 + uFocus*0.8) * (0.5 + stagger*0.7) * (1.0 + infl*0.6);
      float depth = max(-mv.z, 0.1);
      gl_PointSize = clamp(size * uPixelRatio * (14.0 / depth), 1.0, 64.0);
      vBright = (0.35 + stagger*0.65) * (0.8 + uFocus*0.9) * (1.0 + infl*1.2) * uDim;
    }
  `;
  const frag = /* glsl */ `
    precision highp float;
    uniform vec3 uTint; uniform float uFocus;
    varying float vBright;
    void main(){
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      if (d > 0.5) discard;
      float alpha = smoothstep(0.5, 0., d); alpha *= alpha;
      vec3 col = uTint * vBright;
      col = mix(col, vec3(0.98,0.88,0.66), uFocus*0.3);
      gl_FragColor = vec4(col, alpha * clamp(vBright*0.55, 0., 1.));
    }
  `;
  const points = new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms, vertexShader: vert, fragmentShader: frag,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  points.frustumCulled = false;
  scene.add(points);

  // narrow: lift the form into the clear band above the plaque; wide: centre.
  const layoutOffset = () => {
    if (innerWidth <= 899) points.position.set(0, 1.2, 0);
    else points.position.set(0, 0, 0);
  };
  layoutOffset();

  // ——— five-movement story machine ———
  // 0 field · 1 longings (mountain→heart→flame by sub-progress) · 2 pattern
  // (tear; always reforms the SAME pattern) · 3 mirror (card) · 4 choice
  // (pick, then hold-to-entrain) · 5 practice (chosen form, stable, luminous)
  const S = {
    mv: 0, centered: 0, sub: 0,
    coherence: 0, holding: false, locked: false,
    choice: null,                       // "mountain" | "heart" | "flame"
    displacement: 0, torn: false,
    onTelemetry: opts.onTelemetry || (() => {}),
    onState: opts.onState || (() => {}),
  };
  let targetAssembly = 0, asm = 0, foc = 0, swirl = 0, mvel = 0, rotY = 0, tearAcc = 0;
  let curA = "mountain", curB = "mountain", morphT = 0, morphTo = -1, morphDur = 1;
  loadA("mountain"); loadB("mountain");

  const setPair = (a, b, dur = 1.1) => {
    if (a !== curA) { loadA(a); curA = a; }
    if (b !== curB) { loadB(b); curB = b; }
    uniforms.uMorph.value = 0; morphTo = 1; morphT = 0; morphDur = dur;
  };
  const holdShape = (name) => {
    if (curA !== name || curB !== name) { loadA(name); loadB(name); curA = curB = name; uniforms.uMorph.value = 0; }
    morphTo = -1;
  };
  const holdOr = (a, b) => {
    if (curA !== a) { loadA(a); curA = a; }
    if (curB !== b) { loadB(b); curB = b; }
    morphTo = -1;
  };
  const LONGING = ["mountain", "heart", "flame"];

  function applyStory(dt) {
    uniforms.uGrowMode.value = 0;
    uniforms.uCalm.value = 0;
    uniforms.uTear.value = 0;
    let rotSpeed = 0.08;

    switch (S.mv) {
      case 0: // THE FIELD — conflicting dust, no form
        targetAssembly = 0;
        break;
      case 1: { // THE LONGINGS — three archetypes in ONE movement
        const want = LONGING[S.sub < 0.34 ? 0 : S.sub < 0.67 ? 1 : 2];
        const idle = morphTo < 0 || uniforms.uMorph.value >= 1;
        if (idle && uniforms.uMorph.value >= 1 && curA !== curB) {
          loadA(curB); curA = curB; uniforms.uMorph.value = 0; morphTo = -1;
        }
        if (curB !== want && (morphTo < 0 || uniforms.uMorph.value >= 1)) setPair(curA, want, 1.15);
        targetAssembly = S.centered;
        break;
      }
      case 2: { // THE HIDDEN PATTERN — tear; the SAME pattern reforms
        holdOrPattern();
        uniforms.uTear.value = 1;
        rotSpeed = 0.05;
        targetAssembly = S.centered;
        if (swirl > 0.7) tearAcc += dt;
        if (tearAcc > 0.5 && swirl < 0.12) {
          tearAcc = 0;
          setPair(curB, "pattern", 1.0);  // reform: identical figure, honestly
          S.torn = true;
          S.onState("recapture");
          setTimeout(() => S.onState("reformed"), 1100);
        }
        break;
      }
      case 3: // THE MIRROR — the card, crisp and still
        holdShape("card");
        uniforms.uCalm.value = 1;
        rotSpeed = 0.04;
        targetAssembly = S.centered;
        break;
      case 4: { // THE CHOICE — drift until chosen; hold grows the harmonious form
        rotSpeed = 0.05 + S.coherence * 0.06;
        if (!S.choice) { targetAssembly = 0.12; break; }  // released field, waiting
        const H = S.choice + "H";
        if (!S.locked) {
          S.coherence = S.holding ? Math.min(1, S.coherence + dt / 6)
                                  : Math.max(0, S.coherence - dt / 3);
          if (S.coherence >= 1) { S.locked = true; S.onState("locked"); }
        }
        holdOr("dusthome", H);
        uniforms.uGrowMode.value = 1;
        uniforms.uMorph.value = S.coherence;
        uniforms.uBreath.value += ((S.locked ? 1 : 0) - uniforms.uBreath.value) * Math.min(dt * 2, 1);
        targetAssembly = S.coherence > 0.02 ? Math.max(S.centered, 0.85) : 0.12;
        break;
      }
      case 5: // THE PRACTICE — chosen form stable and luminous
        if (S.choice) { holdShape(S.choice + "H"); targetAssembly = S.centered; }
        else targetAssembly = 0.3;      // field at rest if nothing was chosen
        uniforms.uCalm.value = 1;
        rotSpeed = 0.04;
        uniforms.uBreath.value += (1 - uniforms.uBreath.value) * Math.min(dt * 2, 1);
        break;
      default:
        targetAssembly = 0;
    }
    if (S.mv !== 4 && S.mv !== 5) uniforms.uBreath.value += (0 - uniforms.uBreath.value) * Math.min(dt * 2, 1);
    // luminous lift once locked / practicing
    const lum = (S.mv >= 4 && S.locked) || S.mv === 5 ? 1.18 : 1;
    uniforms.uDim.value += (lum - uniforms.uDim.value) * Math.min(dt * 3, 1);
    rotY += dt * (reduce ? 0 : rotSpeed);
    uniforms.uRotY.value = rotY;
  }
  function holdOrPattern() {
    // entering movement 2 mid-morph: settle onto the pattern once idle
    const idle = morphTo < 0 || uniforms.uMorph.value >= 1;
    if (idle && curB === "pattern" && curA !== "pattern") holdShape("pattern");
    else if (idle && curB !== "pattern") setPair(curB, "pattern", 0.9);
  }

  // ——— stir projection (EIDOLON) ———
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2(0, 0);
  const stirPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const stirPoint = new THREE.Vector3(999, 999, 0);
  let lastMx = 0, lastMy = 0;

  // honest displacement: mirror the shader's stir formula over a sample
  const SAMPLE = 3000;
  function computeDisplacement() {
    if (asm < 0.5 || S.mv !== 2) { S.displacement = 0; return; }
    const m = uniforms.uMorph.value;
    const A = HOMES[curA], B = HOMES[curB];
    const px = points.position.x, py = points.position.y;
    const strength = swirl + uniforms.uTear.value * 2.6;
    let hit = 0, cnt = 0;
    const step = Math.max(1, Math.floor(N / SAMPLE));
    for (let i = 0; i < N; i += step) {
      cnt++;
      const hx = A[i * 3] + (B[i * 3] - A[i * 3]) * m + px;
      const hy = A[i * 3 + 1] + (B[i * 3 + 1] - A[i * 3 + 1]) * m + py;
      const dx = hx - stirPoint.x, dy = hy - stirPoint.y;
      const infl = Math.exp(-(dx * dx + dy * dy) * 0.6) * strength;
      if (infl * 0.9 > 0.06) hit++;
    }
    S.displacement = hit / cnt;
  }

  // ——— loop ———
  const clock = new THREE.Clock();
  let running = false, raf = 0;
  function tick() {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    applyStory(dt);
    if (morphTo >= 0 && uniforms.uMorph.value < morphTo) {
      morphT += dt / morphDur;
      uniforms.uMorph.value = Math.min(1, morphT);
    }
    asm += (targetAssembly - asm) * Math.min(dt * 3.2, 1);
    foc += ((S.holding && S.mv === 4 && S.choice ? 1 : 0) - foc) * Math.min(dt * 4.5, 1);
    swirl += (mvel - swirl) * Math.min(dt * 4, 1);
    mvel *= 0.9;
    uniforms.uTime.value = t;
    uniforms.uAssembly.value = reduce ? targetAssembly : asm;
    uniforms.uFocus.value = foc;
    uniforms.uSwirl.value = swirl;
    uniforms.uMouse.value.copy(stirPoint);
    camera.position.x += ((ndc.x || 0) * 0.5 - camera.position.x) * Math.min(dt * 1.6, 1);
    camera.position.y += ((ndc.y || 0) * 0.35 - camera.position.y) * Math.min(dt * 1.6, 1);
    camera.lookAt(0, 0, 0);
    computeDisplacement();
    renderer.render(scene, camera);
    S.onTelemetry(S);
  }

  const api = {
    setMovement(mv, centered, sub = 0) {
      if (mv !== S.mv) {
        S.mv = mv;
        if (mv === 4) { S.coherence = 0; S.locked = false; }
        if (mv === 2) { tearAcc = 0; }
        S.onState("movement");
      }
      S.centered = centered;
      S.sub = sub;
    },
    setChoice(name) {                // "mountain" | "heart" | "flame"
      S.choice = name; S.coherence = 0; S.locked = false;
      S.onState("chosen");
    },
    pointerMove(x, y) {
      const nx = (x / innerWidth) * 2 - 1, ny = -(y / innerHeight) * 2 + 1;
      ndc.set(nx, ny);
      raycaster.setFromCamera(ndc, camera);
      raycaster.ray.intersectPlane(stirPlane, stirPoint);
      mvel = Math.min(Math.hypot(x - lastMx, y - lastMy) * 0.02, 2.2);
      lastMx = x; lastMy = y;
    },
    pointerDown(x, y) { this.pointerMove(x, y); },
    pointerUp() { stirPoint.set(999, 999, 0); mvel = 0; },
    holdStart() { if (S.mv === 4 && S.choice) { S.holding = true; S.onState("holding"); } },
    holdEnd() { S.holding = false; },
    get state() { return S; },
    start() { if (!running) { running = true; clock.getDelta(); raf = requestAnimationFrame(tick); } },
    stop() { running = false; cancelAnimationFrame(raf); },
    resize() {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      uniforms.uPixelRatio.value = Math.min(devicePixelRatio, 2);
      layoutOffset();
    },
    grains: N,
    reduced: reduce,
  };
  return api;
}
