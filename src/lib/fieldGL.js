/* THE FIELD — WebGL engine on EIDOLON's architecture (Jad supplied the source).
   One BufferGeometry; per-grain aHomeA/aHomeB/aDust/aSeed; the vertex shader
   lerps dust↔home with seed stagger, blends home sets via uMorph (uGrowMode
   turns uMorph into a growth frontier for the bloom), curls the dust, and lets
   the cursor stir it. CPU runs the story state machine + honest telemetry
   (displacement mirrors the shader's own stir formula over a sample).
   Falls back to the canvas-2D engine when WebGL is unavailable. */
import * as THREE from "three";
import STENCILS from "../data/stencils.json";

const GOLDEN = 2.399963229728653;

// ——— home-set generators (pure math, world units: shapes fit ~3 tall) ———
export function buildHomes(N) {
  const sets = {};
  const mk = () => new Float32Array(N * 3);

  const fromStencil = (name, scale = 1.6, slab = 0.14) => {
    const pts = STENCILS[name];
    const L = pts.length;
    const a = mk();
    for (let i = 0; i < N; i++) {
      const p = pts[i % L];
      a[i * 3] = p[0] * scale + (Math.random() - 0.5) * 0.02;
      a[i * 3 + 1] = -p[1] * scale + (Math.random() - 0.5) * 0.02; // stencil y is down
      a[i * 3 + 2] = (Math.random() - 0.5) * slab;
    }
    return a;
  };
  sets.crown = fromStencil("crown");
  sets.dollar = fromStencil("dollar");
  sets.heart = fromStencil("heart");
  sets.meditator = fromStencil("meditator", 1.7);
  sets.card = fromStencil("card", 1.75, 0.1);

  // fractured mandala — 6-fold rings + spokes, sextant 4 bent 4°, tilted to camera
  const tiltX = -0.16;
  const tilt = (x, y, z) => [x, y * Math.cos(tiltX) - z * Math.sin(tiltX), y * Math.sin(tiltX) + z * Math.cos(tiltX)];
  const mandala = mk(), mandalaFrac = mk();
  const R6 = 1.55;
  for (let i = 0; i < N; i++) {
    const u = Math.random(), v = (i * 0.618034) % 1;
    let x, y;
    if (u < 0.62) {
      const ring = 1 + Math.floor(v * 3);
      const side = Math.floor(u * 6 * 97) % 6;
      const t = (u * 991) % 1;
      const a0 = (side * Math.PI * 2) / 6, a1 = ((side + 1) * Math.PI * 2) / 6;
      const R = R6 * (0.32 + ring * 0.21);
      x = Math.cos(a0) * R + (Math.cos(a1) * R - Math.cos(a0) * R) * t;
      y = Math.sin(a0) * R + (Math.sin(a1) * R - Math.sin(a0) * R) * t;
    } else {
      const k = Math.floor(v * 6);
      const a = (k * Math.PI * 2) / 6 + Math.PI / 6;
      const r = R6 * (0.14 + ((u * 613) % 1) * 0.82);
      x = Math.cos(a) * r; y = Math.sin(a) * r;
    }
    const z = (Math.random() - 0.5) * 0.05;
    let [tx, ty, tz] = tilt(x, y, z);
    mandala[i * 3] = tx; mandala[i * 3 + 1] = ty; mandala[i * 3 + 2] = tz;
    // fractured copy
    const ang = Math.atan2(y, x);
    const sext = Math.floor(((ang + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 3));
    if (sext === 4) {
      const rot = (4 * Math.PI) / 180;
      const r2 = Math.hypot(x, y) * 0.94;
      const a2 = ang + rot;
      x = Math.cos(a2) * r2 + (Math.random() - 0.5) * 0.05;
      y = Math.sin(a2) * r2 + (Math.random() - 0.5) * 0.05;
    }
    [tx, ty, tz] = tilt(x, y, z);
    mandalaFrac[i * 3] = tx; mandalaFrac[i * 3 + 1] = ty; mandalaFrac[i * 3 + 2] = tz;
  }
  sets.mandala = mandala; sets.mandalaFrac = mandalaFrac;

  // helix — conical golden column, seed-rank ordered bottom→top
  const helix = mk();
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const a = t * 9 * Math.PI;
    const r = (1 - t) * 0.85 + 0.03;
    helix[i * 3] = Math.cos(a) * r;
    helix[i * 3 + 1] = -1.5 + t * 3.1;
    helix[i * 3 + 2] = Math.sin(a) * r;
  }
  sets.helix = helix;

  // phyllotaxis bloom — radius by seed-rank so a seed-frontier grows it center-out
  const bloom = mk();
  const c = 1.85 / Math.sqrt(N);
  return { sets, finishBloom: (seedArr) => {
    // rank seeds so bloom radius = c·sqrt(rank(seed)) — growth order == seed order
    const idx = Array.from({ length: N }, (_, i) => i).sort((a, b) => seedArr[a] - seedArr[b]);
    for (let r = 0; r < N; r++) {
      const i = idx[r];
      const a = r * GOLDEN, rad = c * Math.sqrt(r);
      const x = Math.cos(a) * rad, y = Math.sin(a) * rad, z = (Math.random() - 0.5) * 0.06;
      const [tx, ty, tz] = tilt(x, y, z);
      bloom[i * 3] = tx; bloom[i * 3 + 1] = ty + 0.25; bloom[i * 3 + 2] = tz;
    }
    sets.bloom = bloom;
    return sets;
  } };
}

export function createFieldGL(canvas, opts = {}) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    if (!renderer.getContext()) throw new Error("no gl");
  } catch (e) {
    return null; // caller falls back to the 2D engine
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x04060f, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x04060f, 0.05);
  const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 7.2);

  const N = innerWidth < 700 ? 12000 : 20000;
  const aHomeA = new Float32Array(N * 3);
  const aHomeB = new Float32Array(N * 3);
  const aDust = new Float32Array(N * 3);
  const aSeed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const r = 3.2 + Math.random() * 3.2;
    const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    aDust[i * 3] = r * Math.sin(ph) * Math.cos(th);
    aDust[i * 3 + 1] = r * Math.cos(ph) * 0.7;
    aDust[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    aSeed[i] = Math.random();
  }
  const HOMES = buildHomes(N).finishBloom(aSeed);

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
    uCalm: { value: 0 },     // 1 = crisp (authored symbols): kills shimmer/jitter
    uDim: { value: 1 },      // hinge dims the field
    uBreath: { value: 0 },   // 6/min scale pulse after lock
    uSwirl: { value: 0 },
    uTear: { value: 0 },     // amplifies stir into a tear (Movement III)
    uMouse: { value: new THREE.Vector3(999, 999, 0) },
    uTint: { value: new THREE.Color(0xc9a96a) },
    uPixelRatio: { value: Math.min(devicePixelRatio, 2) },
    uSize: { value: 2.3 },
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
      home *= 1.0 + uBreath * 0.025 * sin(t * 0.6283); // 6 cycles/min
      float assembled = clamp(uAssembly, 0., 1.);
      float stagger = smoothstep(0., 1., (assembled - aSeed*0.35) / 0.65);
      vec3 dust = aDust + curl(aDust*0.35 + vec3(0., t*0.05, 0.), t) * 0.22 * (1.0 - stagger);
      vec3 pos = mix(dust, home, stagger);
      pos = rotY(uRotY) * pos;
      // stir / tear
      vec3 toM = pos - uMouse;
      float d = length(toM.xy);
      float infl = exp(-d*d*0.6) * (uSwirl + uTear*2.6);
      vec3 swirlDir = normalize(vec3(-toM.y, toM.x, 0.) + 1e-4);
      pos += swirlDir * infl * 0.9;
      pos += normalize(toM + 1e-4) * infl * uTear * 0.8; // tear pushes outward too
      pos += curl(pos*0.5, t*1.3) * infl * 0.4;
      // focus tightens toward home
      pos = mix(pos, rotY(uRotY)*home, uFocus * stagger * 0.5);
      // living shimmer (killed by uCalm)
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

  // narrow: lift the sculpture into the clear upper band; wide: shift left for the card
  const layoutOffset = () => {
    if (innerWidth <= 899) points.position.set(0, 1.15, 0);
    else points.position.set(-1.55, 0, 0);
  };
  layoutOffset();

  // ——— story state machine ———
  const S = {
    mv: 0, p: 0, hinge: false,
    coherence: 0, holding: false, locked: false,
    displacement: 0, cycleIdx: 0,
    onTelemetry: opts.onTelemetry || (() => {}),
    onState: opts.onState || (() => {}),
  };
  let targetAssembly = 0, asm = 0, foc = 0, swirl = 0, mvel = 0, rotY = 0, tearAcc = 0;
  let curA = "crown", curB = "crown", morphT = 0, morphFrom = 0, morphTo = 0, morphDur = 1;
  const CYCLE = ["mandalaFrac", "heart", "dollar", "crown"];
  const SYMS = ["crown", "dollar", "heart", "meditator"];

  loadA("crown"); loadB("crown");
  const setPair = (a, b, dur = 1.1) => {
    if (a !== curA) { loadA(a); curA = a; }
    if (b !== curB) { loadB(b); curB = b; }
    morphFrom = uniforms.uMorph.value = 0; morphTo = 1; morphT = 0; morphDur = dur;
  };
  const holdShape = (name) => { if (curA !== name || curB !== name) { loadA(name); loadB(name); curA = curB = name; uniforms.uMorph.value = 0; morphTo = 0; } };

  let beatKey = "";
  function applyStory(dt, t) {
    const { mv, p } = S;
    uniforms.uGrowMode.value = 0;
    uniforms.uCalm.value = 0;
    let rotSpeed = 0.1;
    if (mv === 0) { targetAssembly = 0.0; }
    else if (mv === 1) {
      const seg = p * 5;
      targetAssembly = 1;
      const beat = Math.min(4, Math.floor(seg));
      const key = "m1-" + beat;
      if (key !== beatKey) {
        beatKey = key;
        if (beat < 4) setPair(curB, SYMS[beat], 1.2);
        else setPair(curB, "mandalaFrac", 1.6);
      }
    }
    else if (mv === 2) { targetAssembly = 1; holdShape("mandalaFrac"); rotSpeed = 0.06; }
    else if (mv === 3) {
      targetAssembly = 1; rotSpeed = 0.05;
      if (S.hinge) { uniforms.uDim.value += (0.4 - uniforms.uDim.value) * Math.min(dt * 3, 1); }
      else uniforms.uDim.value += (1 - uniforms.uDim.value) * Math.min(dt * 3, 1);
      // tear accumulates from stir; on decay, the program prints the next thought
      if (!S.hinge) {
        uniforms.uTear.value = 1;
        if (swirl > 0.7) tearAcc += dt;
        if (tearAcc > 0.5 && swirl < 0.12) {
          tearAcc = 0;
          S.cycleIdx = (S.cycleIdx + 1) % CYCLE.length;
          setPair(curB, CYCLE[S.cycleIdx], 1.0);
          S.onState("recapture");
          setTimeout(() => S.onState("reformed"), 1100);
        }
      } else uniforms.uTear.value = 0;
    }
    else if (mv === 4) {
      uniforms.uTear.value = 0; rotSpeed = 0.05 + S.coherence * 0.06;
      targetAssembly = 1;
      if (!S.locked) {
        S.coherence = S.holding
          ? Math.min(1, S.coherence + dt / 6)
          : Math.max(0, S.coherence - dt / 3);
        if (S.coherence >= 1) { S.locked = true; S.onState("locked"); }
      }
      const c = S.coherence;
      if (c <= 0.3) { holdOr("mandalaFrac", "mandala"); uniforms.uMorph.value = c / 0.3; }
      else if (c <= 0.65) { holdOr("mandala", "helix"); uniforms.uMorph.value = (c - 0.3) / 0.35; }
      else { holdOr("helix", "bloom"); uniforms.uGrowMode.value = 1; uniforms.uMorph.value = (c - 0.65) / 0.35 + 0.08; }
      uniforms.uBreath.value += ((S.locked ? 1 : 0) - uniforms.uBreath.value) * Math.min(dt * 2, 1);
    }
    else if (mv === 5) {
      uniforms.uCalm.value = 1; targetAssembly = 1; rotSpeed = 0.04;
      const seg = p * 6;
      const beat = Math.min(4, Math.floor(seg));
      const key = "m5-" + beat;
      if (key !== beatKey) {
        beatKey = key;
        if (beat < 4) setPair(curB, SYMS[beat], 1.0);
        else setPair(curB, "card", 1.4);
      }
    }
    rotY += dt * (reduce ? 0 : rotSpeed);
    uniforms.uRotY.value = rotY;
  }
  // pin A/B for the hold phases without restarting morphs every frame
  function holdOr(a, b) {
    if (curA !== a) { loadA(a); curA = a; }
    if (curB !== b) { loadB(b); curB = b; }
    morphTo = -1; // manual uMorph control
  }

  // ——— stir projection (EIDOLON) ———
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2(0, 0);
  const stirPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const stirPoint = new THREE.Vector3(999, 999, 0);
  let lastMx = 0, lastMy = 0;

  // honest displacement telemetry: mirror the shader's stir formula over a sample
  const SAMPLE = 3000;
  function computeDisplacement() {
    if (asm < 0.5) { S.displacement = 0; return; }
    const m = uniforms.uGrowMode.value > 0.5 ? 1 : uniforms.uMorph.value;
    const A = HOMES[curA], B = HOMES[curB];
    const px = points.position.x, py = points.position.y;
    const strength = swirl + uniforms.uTear.value * 2.6;
    let hit = 0;
    const step = Math.max(1, Math.floor(N / SAMPLE));
    let cnt = 0;
    for (let i = 0; i < N; i += step) {
      cnt++;
      const hx = (A[i * 3] + (B[i * 3] - A[i * 3]) * m) + px;
      const hy = (A[i * 3 + 1] + (B[i * 3 + 1] - A[i * 3 + 1]) * m) + py;
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
    applyStory(dt, t);
    if (morphTo >= 0 && uniforms.uMorph.value < morphTo) {
      morphT += dt / morphDur;
      uniforms.uMorph.value = Math.min(1, morphT);
    }
    asm += (targetAssembly - asm) * Math.min(dt * 3.2, 1);
    foc += ((S.holding && S.mv === 4 ? 1 : 0) - foc) * Math.min(dt * 4.5, 1);
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
    setMovement(mv, p) {
      if (mv !== S.mv) {
        S.mv = mv; beatKey = "";
        if (mv === 4) { S.coherence = 0; S.locked = false; }
        if (mv === 3) { S.cycleIdx = 0; holdShape("mandalaFrac"); }
        if (mv === 0) targetAssembly = 0;
        S.onState("movement");
      }
      S.p = p;
    },
    setHinge(on) { S.hinge = on; },
    pointerMove(x, y, vx, vy) {
      const nx = (x / innerWidth) * 2 - 1, ny = -(y / innerHeight) * 2 + 1;
      ndc.set(nx, ny);
      raycaster.setFromCamera(ndc, camera);
      raycaster.ray.intersectPlane(stirPlane, stirPoint);
      mvel = Math.min(Math.hypot(x - lastMx, y - lastMy) * 0.02, 2.2);
      lastMx = x; lastMy = y;
    },
    pointerDown(x, y) { this.pointerMove(x, y, 0, 0); },
    pointerUp() { stirPoint.set(999, 999, 0); mvel = 0; },
    holdStart() { if (S.mv === 4) { S.holding = true; S.onState("holding"); } },
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
    reduced: reduce,
  };
  return api;
}
