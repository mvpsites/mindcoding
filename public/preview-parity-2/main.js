// ============================================================================
// EIDOLON — point-cloud museum of lost things
//
// Each exhibit is ~60k points whose HOME positions are sampled parametrically
// (lathe-revolved profile, fluted+fractured column, parametric moth, anatomical
// hand). Points live in one big BufferGeometry; a per-vertex "assembly" uniform
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
  console.warn('EIDOLON: WebGL unavailable, showing fallback.');
}

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

  // ---- II. Fallen column: fluted shaft with a diagonal fracture ----
  function column() {
    const count = 60000;
    const pos = new Float32Array(count*3);
    const flutes = 20, R = 0.62, height = 3.4;
    let w = 0;
    while (w < count) {
      const yv = Math.random();                 // 0..1 up shaft
      const y = -1.7 + yv*height;
      const a = Math.random()*Math.PI*2;
      // fluting: sinusoidal radius modulation
      const flute = 1 - 0.10*Math.abs(Math.sin(a*flutes/2));
      // slight entasis (bulge)
      const entasis = 1 - 0.06*Math.sin(yv*Math.PI);
      const r = R*flute*entasis;
      const px = Math.cos(a)*r, pz = Math.sin(a)*r, py = y;
      // diagonal fracture near the top-third: cut away points above the plane
      const fracH = 0.55 + px*0.28 + pz*0.14;   // tilted plane
      if (py > fracH) {
        // rubble/broken lip: keep a jagged rim, discard the rest
        if (Math.random() > 0.10) continue;
        pos[w*3] = px + (Math.random()-0.5)*0.06;
        pos[w*3+1] = fracH + (Math.random())*0.05;
        pos[w*3+2] = pz + (Math.random()-0.5)*0.06;
      } else {
        pos[w*3] = px; pos[w*3+1] = py; pos[w*3+2] = pz;
      }
      w++;
    }
    // base drum ring
    for (let i=0;i<3500 && i<count;i++){
      const a=Math.random()*Math.PI*2, rr=R*(0.9+Math.random()*0.25);
      const j = Math.floor(Math.random()*count);
      pos[j*3]=Math.cos(a)*rr; pos[j*3+1]=-1.72-Math.random()*0.12; pos[j*3+2]=Math.sin(a)*rr;
    }
    return { pos, n: count };
  }

  // ---- III. Moth: parametric wings + furry body + proboscis ----
  function moth() {
    const count = 58000;
    const pos = new Float32Array(count*3);
    let w = 0;
    // wing shape function: returns true-ish density mask for (u,v) in wing space
    // Wings sampled in a normalized wing space then mapped to a scalloped,
    // swept-back hawk-moth silhouette. Forewing = long, pointed, swept back;
    // hindwing = shorter, rounded, tucked below. Leading edge is a smooth curve,
    // trailing edge is scalloped (a few shallow lobes) — that read is what makes
    // it a moth and not a paper dart.
    const wingCount = 44000;
    for (let i=0; i<wingCount; i++, w++){
      const side = i < wingCount/2 ? 1 : -1;
      const fore = Math.random() < 0.60;
      const u = Math.random();                     // 0 root .. 1 tip
      const v = Math.random();                     // 0..1 across chord
      let x, y;
      if (fore) {
        // outline: chord width tapers to a point; swept back (+ up toward root, sweeps down at tip)
        const chord = (0.62 - 0.5*u) * (0.85 + 0.15*Math.sin(u*3.14));
        // leading edge line rises then the wing sweeps; trailing edge scalloped
        const lead = 0.55 - u*0.15;
        const scallop = 0.05*Math.sin(v*Math.PI*3.0)*(1-u);   // shallow lobes on trailing edge
        const across = (v - 0.5);
        x = 0.14 + u*1.45;
        y = 0.20 + lead*0.0 + across*chord*2.0 + u*0.30 + scallop;
        // clip to a pointed tip
        if (u > 0.82 && Math.abs(across) > (1-u)/0.18*0.5) { w--; continue; }
      } else {
        // hindwing: rounded fan, widest at mid-span, tucked below the forewing
        const round = Math.sin(u*Math.PI*0.85);          // 0 at root, peaks mid, tapers at tip
        const chord = (0.30 + 0.34*round);
        const scallop = 0.055*Math.sin(v*Math.PI*2.6)*round;
        const across = (v - 0.5);
        x = 0.08 + u*0.92;
        y = -0.16 - across*chord*2.0 - u*0.30 - scallop;
        // clip the outer corner to a soft round instead of a rectangle
        if (u > 0.6 && Math.abs(across) > 0.5 - (u-0.6)*0.9) { w--; continue; }
      }
      // gentle 3D dihedral curl + membrane jitter (thicker near the body vein)
      const vein = 1 - Math.abs(v-0.5)*0.4;
      const z = Math.sin(x*1.4)*0.09*side + (Math.random()-0.5)*0.02*vein;
      pos[w*3]   = side * x;
      pos[w*3+1] = y;
      pos[w*3+2] = z;
    }
    // body: furry cylinder tapering to head + abdomen
    const bodyCount = 11000;
    for (let i=0;i<bodyCount;i++,w++){
      const t = Math.random();                    // head(0) -> abdomen(1)
      const y = 0.55 - t*1.5;
      const rad = 0.11*(1 - 0.6*Math.abs(t-0.35)) + (t>0.5? (t-0.5)*0.05:0);
      const a = Math.random()*Math.PI*2, r = Math.sqrt(Math.random())*rad;
      pos[w*3]=Math.cos(a)*r*0.7; pos[w*3+1]=y; pos[w*3+2]=Math.sin(a)*r;
    }
    // proboscis: long coiled tongue (the whole point of this moth)
    const pb = count - w;
    for (let i=0;i<pb;i++,w++){
      const t = i/pb;
      const coil = t*Math.PI*5.5;
      const cr = 0.16*(1-t);
      pos[w*3]   = Math.cos(coil)*cr;
      pos[w*3+1] = 0.55 - 0.05 - t*0.1 + Math.sin(coil)*cr*0.6;
      pos[w*3+2] = 0.18 + Math.sin(coil)*cr;
    }
    return { pos, n: count };
  }

  // ---- IV. Hand: palm + four fingers + thumb, open, sampled as filled volume.
  //  Built in a natural hand space (palm centred, fingers rising in +Y) then the
  //  whole thing tilts back slightly. Fingers are SHORT and THICK relative to the
  //  broad palm so it reads as a hand, not a rake — proportions matter more than
  //  point count here.
  function hand() {
    const pts = [];
    // solid filled capsule-ish segment helper (dense volume, tapered)
    function bone(x0,y0,z0, x1,y1,z1, r0, r1, n) {
      for (let i=0;i<n;i++){
        const t = Math.random();
        const cx = x0+(x1-x0)*t, cy = y0+(y1-y0)*t, cz = z0+(z1-z0)*t;
        const rr = (r0+(r1-r0)*t);
        // fill the disc cross-section (sqrt for uniform area), flatten in Z (hand is flat)
        const a = Math.random()*Math.PI*2, rad = Math.sqrt(Math.random())*rr;
        pts.push(cx+Math.cos(a)*rad, cy+Math.sin(a)*rad, cz+Math.sin(a*1.7)*rad*0.55);
      }
    }
    // PALM — a broad rounded slab (filled). Wider than tall, thin in Z.
    const palmCount = 22000;
    for (let i=0;i<palmCount;i++){
      const x = (Math.random()-0.5)*0.98;          // width
      const y = -0.05 + (Math.random()-0.5)*0.9;   // wrist(-0.5) to knuckles(+0.4)
      // rounded rectangle mask (superellipse), narrower toward wrist
      const wristNarrow = 1 - Math.max(0, (-0.05 - y)) * 0.55;
      const nx = x / (0.5*wristNarrow), ny = (y+0.05)/0.5;
      if (Math.pow(Math.abs(nx),2.6) + Math.pow(Math.abs(ny),3.2) > 1) { i--; continue; }
      const z = (Math.random()-0.5)*0.22;
      pts.push(x, y, z);
    }
    // heel/wrist rounding
    for (let i=0;i<3000;i++){
      const a=Math.random()*Math.PI, r=Math.sqrt(Math.random())*0.34;
      pts.push(Math.cos(a)*r*1.1, -0.5 - Math.sin(a)*r*0.5, (Math.random()-0.5)*0.2);
    }
    // FOUR FINGERS — each: knuckle -> two short segments with a gentle forward curl.
    //  [baseX, tipSpreadX, length, thick]
    const fingers = [
      [-0.34, -0.44, 0.62, 0.115],  // index
      [-0.11, -0.13, 0.72, 0.120],  // middle (longest)
      [ 0.13,  0.16, 0.66, 0.113],  // ring
      [ 0.34,  0.44, 0.52, 0.100],  // pinky (shortest)
    ];
    for (const [bx, tipX, len, thick] of fingers){
      const baseY = 0.40, midY = baseY + len*0.55, tipY = baseY + len;
      const midX = bx + (tipX-bx)*0.5;
      // slight forward (−Z→+Z) curl as fingers rise
      bone(bx, baseY, 0.0,  midX, midY, 0.06, thick, thick*0.82, 4500);
      bone(midX, midY, 0.06, tipX, tipY, 0.14, thick*0.82, thick*0.55, 4000);
      // rounded fingertip
      for (let i=0;i<700;i++){ const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*thick*0.55;
        pts.push(tipX+Math.cos(a)*r, tipY+Math.abs(Math.sin(a))*r, 0.14+Math.sin(a)*r*0.5); }
    }
    // THUMB — thicker, springs from the lower-left of the palm, angled out and down-forward.
    bone(-0.42, -0.02, 0.10,  -0.66, 0.16, 0.20, 0.14, 0.12, 4200);
    bone(-0.66, 0.16, 0.20,  -0.80, 0.36, 0.28, 0.12, 0.075, 3600);
    for (let i=0;i<700;i++){ const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*0.08;
      pts.push(-0.80+Math.cos(a)*r, 0.36+Math.abs(Math.sin(a))*r, 0.28+Math.sin(a)*r*0.5); }

    // tilt the whole hand back ~18° around X so the palm faces the viewer/up
    const pos = new Float32Array(pts.length);
    const ca = Math.cos(-0.32), sa = Math.sin(-0.32);
    for (let i=0;i<pts.length;i+=3){
      const y = pts[i+1], z = pts[i+2];
      pos[i]   = pts[i];
      pos[i+1] = y*ca - z*sa;
      pos[i+2] = y*sa + z*ca;
    }
    return { pos, n: pos.length/3 };
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
    { key:'mountain', gen: mountain, hue: 0.09, tint:[0.95,0.90,0.80] },
    { key:'column',  gen: column,  hue: 0.08, tint:[0.90,0.88,0.84] },
    { key:'moth',    gen: moth,    hue: 0.07, tint:[0.96,0.86,0.72] },
    { key:'hand',    gen: hand,    hue: 0.06, tint:[0.94,0.90,0.85] },
  ];

  // find max n so we can allocate one geometry big enough for the biggest cloud
  const clouds = exhibits.map(e => normalize(e.gen()));
  const MAXN = Math.max(...clouds.map(c=>c.n));

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
    geo.setDrawRange(0, MAXN);
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

  let currentExhibit = 0;
  let targetAssembly = 0;
  let targetTint = new THREE.Color(0xefe7d6);

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
      hallIdx.textContent = `0${bestIdx+1} / 04`;
      live.textContent = `Now viewing Exhibit ${bestIdx+1}: ${ex.key}`;
    }
    // smooth curve so it's assembled through the middle of the section
    targetAssembly = Math.pow(Math.max(best,0), 0.7);
  }

  // =========================================================================
  //  MOUSE — stir the dust; project cursor to a plane at z=0
  // =========================================================================
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2(0, 0);   // parallax target — starts centred (0,0), NOT a sentinel
  const stirPlane = new THREE.Plane(new THREE.Vector3(0,0,1), 0);
  const stirPoint = new THREE.Vector3(999,999,0);
  let mvel = 0, lastMx = 0, lastMy = 0;

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
  }
  addEventListener('pointermove', e => onMove(e.clientX, e.clientY), { passive: true });
  addEventListener('pointerleave', () => { stirPoint.set(999,999,0); mvel = 0; });

  // hold-to-focus
  let focusHeld = false;
  const setFocus = (v) => { focusHeld = v; document.body.classList.toggle('focusing', v); };
  addEventListener('pointerdown', e => { if (e.button===0) setFocus(true); });
  addEventListener('pointerup',   () => setFocus(false));
  addEventListener('pointercancel', () => setFocus(false));
  // keyboard focus (space) for accessibility / no-mouse
  addEventListener('keydown', e => { if (e.code==='Space' && !e.repeat) { e.preventDefault(); setFocus(true); }});
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
    layoutOffset();
  });

  // headless / WebGL sanity: log once so the shot harness can confirm
  console.log('EIDOLON hall online —', MAXN, 'points/frame; exhibit', exhibits[0].key);

}
