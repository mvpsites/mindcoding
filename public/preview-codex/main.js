// ============================================================================
// MIND CODING — one continuous point field
//
// Each exhibit is ~60k points whose HOME positions are sampled parametrically
// Every form is generated from parametric equations. Points live in one shared
// BufferGeometry; a per-vertex "assembly" uniform
// (0 = scattered dust, 1 = fully assembled) lerps each grain between a drifting
// dust cloud and its home. Scroll drives assembly per exhibit; a curl-noise field
// (evaluated in the vertex shader) makes the dust breathe and lets the cursor
// stir it. Hold-to-focus tightens + brightens the whole cloud.
//
// No external models. Everything is math.
// ============================================================================

import * as THREE from 'three';

const canvas   = document.getElementById('scene');
const fallback = document.getElementById('fallback');
const focusRing= document.getElementById('focusRing');
const hallIdx  = document.getElementById('hallIdx');
const scrollCue= document.getElementById('scrollCue');
const live     = document.getElementById('live');
const reduce   = matchMedia('(prefers-reduced-motion: reduce)').matches;

const PER = 60000;              // points per exhibit (approx; each generator returns its own count)

// ---- WebGL capability check -> graceful fallback -------------------------
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  const gl = renderer.getContext();
  if (!gl) throw new Error('no gl');
} catch (e) {
  canvas.hidden = true;
  fallback.hidden = false;
  document.body.classList.add('no-webgl');
  console.warn('EIDOLON: WebGL unavailable, showing fallback.');
}

function openExperience(destination) {
  localStorage.setItem('mindcoding-entry', destination);
  if (destination === 'reflect') location.href = '../../?view=reflect';
  else location.href = `../../?collection=${encodeURIComponent(destination.split(':')[1])}`;
}
document.getElementById('drawIntent')?.addEventListener('click', () => openExperience('reflect'));
document.querySelectorAll('.collection-cta').forEach(btn => btn.addEventListener('click', () => {
  openExperience(`collection:${btn.dataset.collection}`);
}));

if (renderer) boot();

function boot() {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  // Opaque clear (hall dark) so the WebGL layer composites reliably in headless
  // capture AND matches the CSS background seamlessly.
  renderer.setClearColor(0x0b0a0c, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0a0c, 0.045);

  const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 7.4);

  // =========================================================================
  //  PARAMETRIC ARTIFACT GENERATORS
  //  Each returns { pos: Float32Array(n*3), n } centred near origin, roughly
  //  fitting a 3.2-unit-tall bounding box.
  // =========================================================================

  // Revolve a 2D profile (array of [radius, y]) around Y, jittered onto a surface.
  function lathe(profile, count, jitter = 0.012) {
    const pos = new Float32Array(count * 3);
    // arc-length table for even distribution along the profile
    const seg = [];
    let total = 0;
    for (let i = 0; i < profile.length - 1; i++) {
      const dx = profile[i+1][0]-profile[i][0], dy = profile[i+1][1]-profile[i][1];
      const l = Math.hypot(dx, dy); seg.push(total); total += l;
    }
    seg.push(total);
    for (let i = 0; i < count; i++) {
      const t = Math.random() * total;
      let k = 0; while (k < seg.length-1 && seg[k+1] < t) k++;
      const f = (t - seg[k]) / (seg[k+1] - seg[k] || 1);
      const r = profile[k][0] + (profile[k+1][0]-profile[k][0]) * f;
      const y = profile[k][1] + (profile[k+1][1]-profile[k][1]) * f;
      const a = Math.random() * Math.PI * 2;
      const jx = (Math.random()-0.5)*jitter, jy=(Math.random()-0.5)*jitter, jz=(Math.random()-0.5)*jitter;
      pos[i*3]   = Math.cos(a) * r + jx;
      pos[i*3+1] = y + jy;
      pos[i*3+2] = Math.sin(a) * r + jz;
    }
    return { pos, n: count };
  }

  // ---- I. Mountain: three-dimensional parametric massif ----
  //  A heightfield surface over an elliptical footprint — NOT a flat stencil.
  //  Height = three blended summits + folded-sine ridge noise (sharp arêtes).
  //  Layering: elevation density bands (strata) + explicitly sampled crest
  //  polylines give the ridges visible depth as the massif rotates.
  //  A small extra concentration of points at the main summit reads as a
  //  subtle pool of light under additive blending — no shader change needed.
  function mountain() {
    const count = 58000;
    const pos = new Float32Array(count*3);

    // three summits: [cx, cz, height, spread]
    const PK = [
      [ 0.18, -0.05, 1.62, 0.34 ],   // main
      [ -0.70, 0.12, 0.90, 0.24 ],   // shoulder
      [ 0.78,  0.25, 0.50, 0.17 ],   // outrider
    ];
    // folded-sine ridge field: products of (1-|sin|) make sharp crest lines
    function ridge(x, z) {
      const a = 1 - Math.abs(Math.sin(x*2.3 + z*1.7));
      const b = 1 - Math.abs(Math.sin(x*1.1 - z*2.9 + 1.3));
      const c = 1 - Math.abs(Math.sin(x*3.7 + z*0.6 - 0.7));
      return a*0.5 + a*b*0.3 + b*c*0.2;
    }
    function height(x, z) {
      let h = 0;
      for (const [cx, cz, ph, s] of PK) {
        const d2 = (x-cx)*(x-cx) + (z-cz)*(z-cz);
        h += ph * Math.exp(-d2 / s);
      }
      // ridged relief, strongest at mid-elevation, fades at the skirt
      const env = Math.min(1, h / 0.9);
      h += 0.22 * ridge(x, z) * env;
      return h;
    }
    // elliptical footprint mask
    const RX = 1.15, RZ = 0.78;
    const inside = (x, z) => (x*x)/(RX*RX) + (z*z)/(RZ*RZ) <= 1;

    let w = 0;
    // (a) the surface itself, with elevation strata (denser bands = layers)
    const surfCount = 47000;
    while (w < surfCount) {
      const x = (Math.random()*2 - 1) * RX;
      const z = (Math.random()*2 - 1) * RZ;
      if (!inside(x, z)) continue;
      const h = height(x, z);
      // skirt falloff: fade the base into the floor toward the footprint edge
      const e = (x*x)/(RX*RX) + (z*z)/(RZ*RZ);
      const y = h * (1 - Math.pow(e, 3)*0.85);
      // strata: keep points near elevation bands slightly more often
      const band = Math.abs(Math.sin(y * 9.0));
      if (band > 0.65 && Math.random() < 0.35) continue;
      pos[w*3]   = x + (Math.random()-0.5)*0.012;
      pos[w*3+1] = y + (Math.random()-0.5)*0.012;
      pos[w*3+2] = z + (Math.random()-0.5)*0.012;
      w++;
    }
    // (b) crest polylines: arêtes descending from each summit — sampled
    //  densely so the ridge lines read as drawn edges in the cloud
    const crests = [
      [[0.18,-0.05],[ -0.26, 0.04],[-0.70, 0.12]],          // main -> shoulder
      [[0.18,-0.05],[ 0.48, 0.10],[ 0.78, 0.25]],           // main -> outrider
      [[0.18,-0.05],[ 0.02,-0.42],[-0.18,-0.66]],           // main -> front skirt
      [[-0.70,0.12],[-0.90, 0.04],[-1.08,-0.08]],           // shoulder -> west skirt
      [[0.78, 0.25],[ 0.95, 0.28],[ 1.10, 0.20]],           // outrider -> east skirt
    ];
    const crestCount = 7500;
    for (let i = 0; i < crestCount && w < count; i++, w++) {
      const line = crests[i % crests.length];
      const t = Math.random(), seg = t < 0.5 ? 0 : 1, f = (t*2) % 1;
      const x = line[seg][0] + (line[seg+1][0]-line[seg][0]) * f;
      const z = line[seg][1] + (line[seg+1][1]-line[seg][1]) * f;
      const y = height(x, z) * (1 - Math.pow((x*x)/(RX*RX)+(z*z)/(RZ*RZ), 3)*0.85);
      pos[w*3]   = x + (Math.random()-0.5)*0.03;
      pos[w*3+1] = y + Math.random()*0.03;                  // sit ON the crest
      pos[w*3+2] = z + (Math.random()-0.5)*0.03;
    }
    // (c) summit light: a small, subtle concentration of grains near the apex
    //  (density reads as glow under additive blending)
    const apexY = height(PK[0][0], PK[0][1]);
    for (; w < count; w++) {
      const r = Math.pow(Math.random(), 1.6) * 0.16;
      const th = Math.random()*Math.PI*2, ph = Math.acos(2*Math.random()-1);
      pos[w*3]   = PK[0][0] + r*Math.sin(ph)*Math.cos(th);
      pos[w*3+1] = apexY   + r*Math.cos(ph)*0.7 + 0.02;
      pos[w*3+2] = PK[0][1] + r*Math.sin(ph)*Math.sin(th);
    }
    return { pos, n: count };
  }

  // ---- II. Heart: a dimensional universal archetype ----
  function heart(count = 58000) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const contour = Math.random() < 0.30;
      const t = Math.random() * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3) / 16;
      const hy = (13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t)) / 17;
      const r = contour ? 0.94 + Math.random()*0.06 : Math.sqrt(Math.random()) * 0.94;
      const thickness = 0.42 * Math.pow(Math.max(0, 1-r*r), 0.55);
      const side = Math.random() < 0.5 ? -1 : 1;
      pos[i*3] = hx * r * 1.28 + (Math.random()-0.5)*0.014;
      pos[i*3+1] = hy * r * 1.38 - 0.10 + (Math.random()-0.5)*0.014;
      pos[i*3+2] = side * thickness + (Math.random()-0.5)*0.025;
    }
    return { pos, n: count };
  }

  // ---- III. Flame: three nested, gently twisting surfaces ----
  function flame() {
    const count = 58000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const shell = i % 5 === 0 ? 1 : (i % 3 === 0 ? 0.68 : 0.42);
      const t = Math.pow(Math.random(), 0.92);
      const a = Math.random() * Math.PI * 2;
      const taper = Math.pow(1-t, 0.72);
      const pulse = 0.80 + 0.20*Math.sin(a*2 + t*9.5);
      const radius = shell * taper * pulse;
      const twist = a + t*3.2 + shell*0.7;
      const lean = 0.34*Math.pow(t,1.7) - 0.10*Math.sin(t*Math.PI*2);
      pos[i*3] = Math.sin(twist)*radius*0.94 + lean;
      pos[i*3+1] = -1.48 + t*3.10 + 0.10*Math.sin(a*3)*(1-t);
      pos[i*3+2] = Math.cos(twist)*radius*0.62 + (Math.random()-0.5)*0.02;
    }
    return { pos, n: count };
  }

  // ---- IV. The hidden pattern: a thick asymmetric torus knot ----
  function hiddenPattern() {
    const count = 60000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = Math.random()*Math.PI*2;
      const p = 2, q = 3, R = 0.88, rr = 0.38;
      let x = (R + rr*Math.cos(q*t))*Math.cos(p*t);
      let y = (R + rr*Math.cos(q*t))*Math.sin(p*t);
      let z = rr*Math.sin(q*t);
      const bent = t > Math.PI*1.14 && t < Math.PI*1.62;
      if (bent) { x += 0.22; y -= 0.11; z += 0.16*Math.sin((t-Math.PI*1.14)*3.7); }
      const tube = Math.sqrt(Math.random())*0.105;
      const a = Math.random()*Math.PI*2;
      x += Math.cos(a)*tube;
      y += Math.sin(a)*tube;
      z += Math.sin(a*1.7)*tube;
      pos[i*3] = x;
      pos[i*3+1] = y;
      pos[i*3+2] = z;
    }
    return { pos, n: count };
  }

  // ---- V. The Mirror: a reversible card back, drawn entirely in points ----
  function cardBack() {
    const count = 60000;
    const pos = new Float32Array(count*3);
    const W = 1.08, H = 1.62;
    for (let i=0;i<count;i++) {
      const u = Math.random();
      let x, y;
      if (u < 0.27) {
        const side = Math.floor(Math.random()*4);
        if (side===0) { x=(Math.random()*2-1)*W; y=H; }
        else if (side===1) { x=(Math.random()*2-1)*W; y=-H; }
        else if (side===2) { x=-W; y=(Math.random()*2-1)*H; }
        else { x=W; y=(Math.random()*2-1)*H; }
      } else if (u < 0.50) {
        const a = Math.random()*Math.PI*2;
        const r = 0.52 + (Math.random()-0.5)*0.035;
        x=Math.cos(a)*r; y=Math.sin(a)*r*1.08;
      } else if (u < 0.68) {
        const a = Math.random()*Math.PI*2;
        const r = Math.random()*0.96;
        x=Math.cos(a)*r; y=Math.sin(a)*r*1.25;
      } else if (u < 0.84) {
        const side = Math.random()<0.5?-1:1;
        const t = Math.random();
        x=side*(0.18+0.42*Math.sin(t*Math.PI));
        y=-0.62+t*1.28;
      } else {
        const a=Math.random()*Math.PI*2;
        const r=0.18+(Math.random()-0.5)*0.025;
        x=Math.cos(a)*r;
        y=0.02+Math.sin(a)*r;
        if (Math.random()<0.42) { x=(Math.random()-0.5)*0.15; y=-0.55+Math.random()*0.55; }
      }
      pos[i*3]=x+(Math.random()-0.5)*0.008;
      pos[i*3+1]=y+(Math.random()-0.5)*0.008;
      pos[i*3+2]=(Math.random()-0.5)*0.07;
    }
    return {pos,n:count};
  }

  function abundance() {
    const count=60000, pos=new Float32Array(count*3), golden=2.399963229728653;
    for(let i=0;i<count;i++){
      const hash=Math.sin((i+1)*12.9898)*43758.5453;
      const r=1.48*Math.sqrt(hash-Math.floor(hash)), a=i*golden;
      pos[i*3]=Math.cos(a)*r;
      pos[i*3+1]=Math.sin(a)*r;
      pos[i*3+2]=0.28*(1-r/1.48)+0.06*Math.sin(a*5);
    }
    return {pos,n:count};
  }

  function spirit() {
    const count=60000, pos=new Float32Array(count*3);
    for(let i=0;i<count;i++){
      const a=Math.random()*Math.PI*2, b=Math.random()*Math.PI*2;
      const petal=1+0.18*Math.cos(a*12), R=0.90*petal, r=0.30;
      pos[i*3]=(R+r*Math.cos(b))*Math.cos(a);
      pos[i*3+1]=(R+r*Math.cos(b))*Math.sin(a);
      pos[i*3+2]=r*Math.sin(b)*0.72;
    }
    return {pos,n:count};
  }

  function merge(parts) {
    const total = parts.reduce((s,p)=>s+p.n,0);
    const pos = new Float32Array(total*3);
    let o=0; for (const p of parts){ pos.set(p.pos.subarray(0,p.n*3), o); o+=p.n*3; }
    return { pos, n: total };
  }

  // normalise a cloud to sit centred, scaled to target height, return centred array
  function normalize(cloud, targetH = 3.0) {
    const { pos, n } = cloud;
    let minY=Infinity,maxY=-Infinity,cx=0,cz=0;
    for (let i=0;i<n;i++){ const y=pos[i*3+1]; if(y<minY)minY=y; if(y>maxY)maxY=y; cx+=pos[i*3]; cz+=pos[i*3+2]; }
    cx/=n; cz/=n;
    const h = maxY-minY || 1; const s = targetH/h; const midY=(minY+maxY)/2;
    for (let i=0;i<n;i++){
      pos[i*3]   = (pos[i*3]-cx)*s;
      pos[i*3+1] = (pos[i*3+1]-midY)*s;
      pos[i*3+2] = (pos[i*3+2]-cz)*s;
    }
    return cloud;
  }

  // =========================================================================
  //  BUILD EXHIBITS — all share ONE points object; we swap the active home set.
  // =========================================================================
  const exhibits = [
    { key:'mountain', gen:mountain,      tint:[0.95,0.90,0.80] },
    { key:'heart',    gen:heart,         tint:[0.96,0.82,0.70] },
    { key:'flame',    gen:flame,         tint:[0.98,0.75,0.40] },
    { key:'hidden',   gen:hiddenPattern, tint:[0.88,0.85,0.79] },
    { key:'mirror',   gen:cardBack,      tint:[0.95,0.82,0.56] },
    { key:'choice',   gen:abundance,     tint:[0.98,0.77,0.37] },
    { key:'practice', gen:abundance,     tint:[0.98,0.77,0.37] },
  ];

  const choiceGenerators = { abundance, love: heart, spirit };
  const choiceTints = {
    abundance:[0.98,0.77,0.37],
    love:[0.98,0.70,0.60],
    spirit:[0.85,0.82,1.00],
  };

  // find max n so we can allocate one geometry big enough for the biggest cloud
  const clouds = exhibits.map(e => normalize(e.gen()));
  const MAXN = Math.max(...clouds.map(c=>c.n));
  const visiblePointCount = () => innerWidth <= 480 ? 22000 : innerWidth <= 900 ? 38000 : MAXN;

  // per-vertex attributes:
  //  aHome  — target home position of the CURRENTLY active exhibit
  //  aDust  — a stable random dust position (where the grain rests when scattered)
  //  aSeed  — random 0..1 for phase / size variation
  const geo = new THREE.BufferGeometry();
  const aHome = new Float32Array(MAXN*3);
  const aDust = new Float32Array(MAXN*3);
  const aSeed = new Float32Array(MAXN);
  for (let i=0;i<MAXN;i++){
    // dust: large soft sphere shell around the artifact
    const r = 3.4 + Math.random()*3.2;
    const th = Math.random()*Math.PI*2, ph = Math.acos(2*Math.random()-1);
    aDust[i*3]   = r*Math.sin(ph)*Math.cos(th);
    aDust[i*3+1] = r*Math.cos(ph)*0.7;
    aDust[i*3+2] = r*Math.sin(ph)*Math.sin(th);
    aSeed[i] = Math.random();
  }
  geo.setAttribute('aHome', new THREE.BufferAttribute(aHome, 3));
  geo.setAttribute('aDust', new THREE.BufferAttribute(aDust, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAXN*3), 3)); // unused but required
  geo.setDrawRange(0, clouds[0].n);

  // load a cloud's home positions into aHome (fill unused with dust so they vanish)
  function loadHome(idx) {
    const c = clouds[idx];
    aHome.set(c.pos.subarray(0, c.n*3));
    for (let i=c.n;i<MAXN;i++){ aHome[i*3]=aDust[i*3]; aHome[i*3+1]=aDust[i*3+1]; aHome[i*3+2]=aDust[i*3+2]; }
    geo.attributes.aHome.needsUpdate = true;
    geo.setDrawRange(0, Math.min(c.n, visiblePointCount()));
    activeCount = c.n;
  }
  let activeCount = clouds[0].n;

  // ---- shader material -----------------------------------------------------
  const uniforms = {
    uTime:     { value: 0 },
    uAssembly: { value: 0 },        // 0 dust .. 1 assembled
    uFocus:    { value: 0 },        // 0 .. 1 hold-to-focus
    uMouse:    { value: new THREE.Vector3(999,999,0) }, // world-ish stir point
    uSwirl:    { value: 0 },        // stir strength (mouse velocity)
    uTint:     { value: new THREE.Color(0xefe7d6) },
    uPixelRatio:{ value: Math.min(devicePixelRatio,2) },
    uSize:     { value: 2.2 },
    uRotY:     { value: 0 },
  };

  const vert = /* glsl */`
    uniform float uTime, uAssembly, uFocus, uSwirl, uPixelRatio, uSize, uRotY;
    uniform vec3  uMouse;
    attribute vec3 aHome;
    attribute vec3 aDust;
    attribute float aSeed;
    varying float vBright;
    varying float vSeed;

    // cheap curl-ish noise from layered sines (no texture needed)
    vec3 curl(vec3 p, float t){
      float x = sin(p.y*1.3 + t*0.5) + cos(p.z*1.1 - t*0.4);
      float y = sin(p.z*1.2 - t*0.45) + cos(p.x*1.4 + t*0.5);
      float z = sin(p.x*1.1 + t*0.4) + cos(p.y*1.3 - t*0.5);
      return vec3(x,y,z);
    }

    mat3 rotY(float a){ float c=cos(a),s=sin(a); return mat3(c,0,s, 0,1,0, -s,0,c); }

    void main(){
      vSeed = aSeed;
      float t = uTime;

      // base blended position between dust and home
      float assembled = clamp(uAssembly, 0.0, 1.0);
      // ease per-point with a seed-based stagger so it "breathes" together but not lockstep
      float stagger = smoothstep(0.0, 1.0, (assembled - aSeed*0.35) / 0.65);
      vec3 home = aHome;
      vec3 dust = aDust;

      // dust drifts on the curl field continuously
      vec3 drift = curl(dust*0.35 + vec3(0.0, t*0.05, 0.0), t) * 0.22;
      dust += drift * (1.0 - stagger);

      vec3 pos = mix(dust, home, stagger);

      // rotate the assembled artifact slowly on its plinth
      pos = rotY(uRotY) * pos;

      // ---- mouse stir: swirl points near the cursor's projected point ----
      vec3 toM = pos - uMouse;
      float d = length(toM.xy);
      float infl = exp(-d*d*0.35) * uSwirl;
      // tangential swirl in screen plane + slight lift
      vec3 swirlDir = normalize(vec3(-toM.y, toM.x, 0.0) + 1e-4);
      pos += swirlDir * infl * 0.9;
      pos += curl(pos*0.5, t*1.3) * infl * 0.4;

      // ---- focus: pull toward home + tighten jitter ----
      pos = mix(pos, rotY(uRotY)*home, uFocus * stagger * 0.5);

      // subtle living shimmer even when assembled
      pos += curl(home*0.8 + aSeed*10.0, t*0.6) * 0.012 * stagger;

      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mv;

      // size: nearer + focus + assembled => bigger/brighter
      float size = uSize * (0.6 + aSeed*0.8);
      size *= (1.0 + uFocus*0.8) * (0.5 + stagger*0.7) * (1.0 + infl*0.6);
      float depth = max(-mv.z, 0.1);
      gl_PointSize = clamp(size * uPixelRatio * (14.0 / depth), 1.0, 64.0);

      vBright = (0.35 + stagger*0.65) * (0.8 + uFocus*0.9) * (1.0 + infl*1.2);
    }
  `;

  const frag = /* glsl */`
    precision highp float;
    uniform vec3 uTint;
    uniform float uFocus;
    varying float vBright;
    varying float vSeed;
    void main(){
      // soft round grain
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      if (d > 0.5) discard;
      float alpha = smoothstep(0.5, 0.0, d);
      alpha *= alpha;

      vec3 col = uTint * vBright;
      // amber warmth in the core when focused
      col = mix(col, vec3(0.95,0.72,0.38), uFocus*0.25*(1.0-vSeed*0.5));
      float a = alpha * clamp(vBright*0.55, 0.0, 1.0);
      gl_FragColor = vec4(col, a);
    }
  `;

  const mat = new THREE.ShaderMaterial({
    uniforms, vertexShader: vert, fragmentShader: frag,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, mat);
  // Real positions live in aHome/aDust (computed in the shader), so Three.js's
  // auto-computed bounding sphere (from the zeroed `position` attribute) is wrong
  // and can frustum-cull the whole cloud. Disable culling — we always want it drawn.
  points.frustumCulled = false;
  scene.add(points);

  // On narrow viewports the plaque fills the lower screen; lift the artifact so it
  // sits in the clear upper band above the card instead of behind it.
  const isNarrow = () => innerWidth <= 720;
  function layoutOffset() {
    if (isNarrow()) { points.position.set(0, 1.35, 0); plinth.position.set(0, 1.35, 0); }
    else { points.position.set(0, 0, 0); plinth.position.set(0, 0, 0); }
  }

  // faint amber floor glow disc (plinth light) — a second, tiny points ring
  const plinthGeo = new THREE.BufferGeometry();
  const PL = 2400; const plp = new Float32Array(PL*3);
  for (let i=0;i<PL;i++){ const a=Math.random()*Math.PI*2, r=1.6+Math.random()*1.4;
    plp[i*3]=Math.cos(a)*r; plp[i*3+1]=-2.0-Math.random()*0.1; plp[i*3+2]=Math.sin(a)*r; }
  plinthGeo.setAttribute('position', new THREE.BufferAttribute(plp,3));
  const plinth = new THREE.Points(plinthGeo, new THREE.PointsMaterial({
    color: 0xd79a4a, size: 0.03, transparent:true, opacity:0.28,
    blending: THREE.AdditiveBlending, depthWrite:false }));
  scene.add(plinth);

  loadHome(0);
  layoutOffset();

  // =========================================================================
  //  SCROLL → which exhibit, and its assembly amount
  // =========================================================================
  const panels = [...document.querySelectorAll('.panel')];
  const exhibitPanels = [...document.querySelectorAll('.panel-exhibit')];
  const displacementValue = document.getElementById('displacementValue');
  const hiddenReveal = document.getElementById('hiddenReveal');
  const focusValue = document.getElementById('focusValue');
  const focusFill = document.getElementById('focusFill');
  const choiceInstruction = document.getElementById('choiceInstruction');
  const choiceReveal = document.getElementById('choiceReveal');

  const HIDDEN_INDEX = 3;
  const CHOICE_INDEX = 5;
  const PRACTICE_INDEX = 6;

  let currentExhibit = 0;
  let targetAssembly = 0;
  let targetTint = new THREE.Color(0xefe7d6);
  let selectedChoice = '';
  let choiceProgress = 0;
  let choiceLocked = false;
  let proofTriggered = false;

  // IntersectionObserver reveals plaques + tracks the dominant exhibit
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) en.target.classList.add('in-view');
    });
  }, { threshold: 0.28 });
  panels.forEach(p => io.observe(p));

  // scroll cue hides after first scroll
  let scrolled = false;
  addEventListener('scroll', () => {
    if (!scrolled && scrollY > 40) { scrolled = true; scrollCue.classList.add('hidden'); }
    cancelHold();
    updateScrollState();
  }, { passive: true });

  function updateScrollState() {
    // Which exhibit section is most centred?
    const mid = scrollY + innerHeight/2;
    let best = -1, bestAssembly = 0, bestIdx = currentExhibit;
    exhibitPanels.forEach((p, i) => {
      const top = p.offsetTop, h = p.offsetHeight;
      const center = top + h/2;
      const dist = Math.abs(center - mid);
      // assembly peaks when centred, falls off toward edges of the section
      const norm = 1 - Math.min(dist / (h*0.62), 1);
      if (norm > best) { best = norm; bestAssembly = norm; bestIdx = i; }
    });
    if (bestIdx !== currentExhibit && best > 0.02) {
      currentExhibit = bestIdx;
      loadHome(bestIdx);
      const ex = exhibits[bestIdx];
      targetTint = new THREE.Color().setRGB(...ex.tint);
      const movement = exhibitPanels[bestIdx].dataset.movement;
      hallIdx.textContent = `0${movement} / 05`;
      live.textContent = `Movement ${movement}: ${ex.key}`;
    }
    // smooth curve so it's assembled through the middle of the section
    const sectionAssembly = Math.pow(Math.max(best,0), 0.7);
    if (bestIdx === CHOICE_INDEX) targetAssembly = selectedChoice ? choiceProgress : 0;
    else if (bestIdx === PRACTICE_INDEX) targetAssembly = choiceLocked ? sectionAssembly : 0;
    else targetAssembly = sectionAssembly;

    if (scrollY < innerHeight*0.55) hallIdx.textContent = '00 / 05';
  }

  function setChoice(id) {
    if (!choiceGenerators[id]) return;
    selectedChoice = id;
    choiceProgress = 0;
    choiceLocked = false;
    const chosen = normalize(choiceGenerators[id]());
    clouds[CHOICE_INDEX] = chosen;
    clouds[PRACTICE_INDEX] = chosen;
    exhibits[CHOICE_INDEX].key = id;
    exhibits[PRACTICE_INDEX].key = id;
    exhibits[CHOICE_INDEX].tint = choiceTints[id];
    exhibits[PRACTICE_INDEX].tint = choiceTints[id];
    targetTint = new THREE.Color().setRGB(...choiceTints[id]);
    loadHome(currentExhibit === PRACTICE_INDEX ? PRACTICE_INDEX : CHOICE_INDEX);
    document.querySelectorAll('.choice-btn').forEach(btn => {
      const active = btn.dataset.choice === id;
      btn.classList.toggle('selected', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    choiceInstruction.textContent = 'Now press and hold anywhere.';
    choiceReveal.classList.remove('shown');
    document.body.classList.remove('choice-locked');
    updateFocusUI();
    live.textContent = `${id} chosen. Press and hold to focus the field.`;
  }

  function updateFocusUI() {
    const raw = Math.round(choiceProgress*100);
    const shown = raw >= 100 ? 100 : raw >= 81 ? 81 : raw >= 47 ? 47 : raw >= 12 ? 12 : 0;
    focusValue.textContent = String(shown).padStart(3,'0');
    focusFill.style.width = `${Math.min(100, raw)}%`;
  }

  document.querySelectorAll('.choice-btn').forEach(btn => {
    btn.setAttribute('aria-pressed','false');
    btn.addEventListener('click', () => setChoice(btn.dataset.choice));
  });

  // =========================================================================
  //  MOUSE — stir the dust; project cursor to a plane at z=0
  // =========================================================================
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2(0, 0);   // parallax target — starts centred (0,0), NOT a sentinel
  const stirPlane = new THREE.Plane(new THREE.Vector3(0,0,1), 0);
  const stirPoint = new THREE.Vector3(999,999,0);
  let mvel = 0, lastMx = 0, lastMy = 0;
  let pointerDown = false, downX = 0, downY = 0, holdTimer = 0;

  function onMove(cx, cy) {
    const nx = (cx/innerWidth)*2 - 1, ny = -(cy/innerHeight)*2 + 1;
    ndc.set(nx, ny);
    raycaster.setFromCamera(ndc, camera);
    raycaster.ray.intersectPlane(stirPlane, stirPoint);
    // velocity for swirl strength
    const dx = cx-lastMx, dy = cy-lastMy;
    mvel = Math.min(Math.hypot(dx,dy)*0.02, 2.2);
    lastMx = cx; lastMy = cy;
    focusRing.style.setProperty('--fx', `${(cx/innerWidth)*100}%`);
    focusRing.style.setProperty('--fy', `${(cy/innerHeight)*100}%`);

    if (pointerDown && currentExhibit === HIDDEN_INDEX) {
      const travelX = Math.abs(cx-downX), travelY = Math.abs(cy-downY);
      if (travelX > 24 && travelX > travelY*1.35) {
        const displaced = Math.min(100, Math.round((travelX/Math.max(innerWidth*0.42,120))*100));
        displacementValue.textContent = `${displaced}%`;
        if (displaced > 24 && !proofTriggered) {
          proofTriggered = true;
          setTimeout(() => hiddenReveal.classList.add('shown'), 520);
        }
      }
    }

    if (pointerDown && Math.hypot(cx-downX,cy-downY) > 12) cancelHold();
  }
  addEventListener('pointermove', e => onMove(e.clientX, e.clientY), { passive: true });
  addEventListener('pointerleave', () => { stirPoint.set(999,999,0); mvel = 0; });

  // hold-to-focus
  let focusHeld = false;
  const setFocus = (v) => { focusHeld = v; document.body.classList.toggle('focusing', v); };
  function cancelHold() {
    clearTimeout(holdTimer);
    holdTimer = 0;
    pointerDown = false;
    setFocus(false);
  }
  addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    pointerDown = true;
    downX = e.clientX; downY = e.clientY;
    if (currentExhibit === CHOICE_INDEX) {
      if (!selectedChoice || choiceLocked) return;
      holdTimer = setTimeout(() => { if (pointerDown) setFocus(true); }, 250);
    } else setFocus(true);
  });
  addEventListener('pointerup', cancelHold);
  addEventListener('pointercancel', cancelHold);
  // keyboard focus (space) for accessibility / no-mouse
  addEventListener('keydown', e => {
    if (e.code==='Space' && !e.repeat) {
      e.preventDefault();
      if (currentExhibit !== CHOICE_INDEX || selectedChoice) setFocus(true);
    }
  });
  addEventListener('keyup',   e => { if (e.code==='Space') setFocus(false); });

  // =========================================================================
  //  RENDER LOOP
  // =========================================================================
  let asm = 0, foc = 0, swirl = 0, rotY = 0;
  const clock = new THREE.Clock();
  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { clock.getDelta(); tick(); }
  });

  updateScrollState();

  function tick() {
    if (!running) return;
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (currentExhibit === CHOICE_INDEX && selectedChoice && !choiceLocked) {
      if (focusHeld) choiceProgress = Math.min(1, choiceProgress + dt/3.8);
      else choiceProgress = Math.max(0, choiceProgress - dt*0.07);
      targetAssembly = choiceProgress;
      updateFocusUI();
      if (choiceProgress >= 1) {
        choiceLocked = true;
        setFocus(false);
        choiceInstruction.textContent = 'Pattern established.';
        choiceReveal.classList.add('shown');
        document.body.classList.add('choice-locked');
        live.textContent = 'Focus complete. The chosen pattern is stable.';
      }
    }

    // ease uniforms toward targets
    asm += (targetAssembly - asm) * Math.min(dt*3.2, 1);
    foc += ((focusHeld ? 1 : 0) - foc) * Math.min(dt*4.5, 1);
    swirl += (mvel - swirl) * Math.min(dt*4, 1);
    mvel *= 0.9;  // decay velocity so swirl calms when the mouse stops

    rotY += dt * (reduce ? 0 : (0.10 + foc*0.05));

    uniforms.uTime.value = t;
    uniforms.uAssembly.value = reduce ? Math.max(asm, targetAssembly) : asm;
    uniforms.uFocus.value = foc;
    uniforms.uSwirl.value = swirl;
    uniforms.uMouse.value.copy(stirPoint);
    uniforms.uRotY.value = rotY;
    uniforms.uTint.value.lerp(targetTint, Math.min(dt*2.5,1));
    uniforms.uSize.value = 2.2;

    // gentle camera breathing + parallax toward cursor
    const px = (ndc.x||0), py = (ndc.y||0);
    camera.position.x += (px*0.5 - camera.position.x) * Math.min(dt*1.6,1);
    camera.position.y += (py*0.35 - camera.position.y) * Math.min(dt*1.6,1);
    camera.lookAt(0,0,0);

    plinth.material.opacity = 0.18 + foc*0.22 + asm*0.1;

    renderer.render(scene, camera);
  }
  tick();

  // =========================================================================
  //  RESIZE
  // =========================================================================
  addEventListener('resize', () => {
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    uniforms.uPixelRatio.value = Math.min(devicePixelRatio,2);
    geo.setDrawRange(0, Math.min(activeCount, visiblePointCount()));
    layoutOffset();
  });

  // headless / WebGL sanity: log once so the shot harness can confirm
  console.log('EIDOLON hall online —', MAXN, 'points/frame; exhibit', exhibits[0].key);

}
