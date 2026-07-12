/* Render check: run the REAL /public/shared/programmed-self.js (byte-for-byte)
   against stubbed DOM, advance one frame, capture every fillRect = the home
   pattern at rest. Output: JSON point cloud for rasterization. */
'use strict';
const fs = require('fs');

const rects = [];
let fillStyle = '#000';
const ctx = {
  setTransform(){}, clearRect(){}, beginPath(){}, arc(){}, stroke(){},
  moveTo(){}, lineTo(){}, fillRect(x, y, w, h){ rects.push({ x, y, w, h, c: fillStyle, a: ctx.globalAlpha }); },
  globalAlpha: 1, lineWidth: 1,
  set fillStyle(v){ fillStyle = v; }, get fillStyle(){ return fillStyle; },
  set strokeStyle(v){}, get strokeStyle(){ return '#000'; }
};

const rafQ = [];
let ioCallback = null;

const W = process.argv[2] ? parseInt(process.argv[2], 10) : 820;
const H = process.argv[3] ? parseInt(process.argv[3], 10) : 900;
const forcePhone = process.argv[4] === 'phone';

const canvas = {
  style: {},
  getContext(){ return ctx; },
  getBoundingClientRect(){ return { width: W, height: H, left: 0, top: 0, bottom: H, top2: 0 }; },
  addEventListener(){},
  width: 0, height: 0
};

global.window = global;
global.devicePixelRatio = 1;
global.innerWidth = W; global.innerHeight = H;
global.matchMedia = q => ({ matches: forcePhone && q.indexOf('max-width') >= 0 });
global.addEventListener = () => {};
global.requestAnimationFrame = fn => { rafQ.push(fn); return rafQ.length; };
global.cancelAnimationFrame = () => {};
global.IntersectionObserver = class { constructor(cb){ ioCallback = cb; } observe(){} disconnect(){} };
global.document = { addEventListener(){}, hidden: false };


eval(fs.readFileSync(__dirname + '/../public/shared/emblem-points.js', 'utf8'));
eval(fs.readFileSync(__dirname + '/../public/shared/programmed-self.js', 'utf8'));

const ctl = global.ProgrammedSelf.mount(canvas, { entrance: false });
ioCallback([{ isIntersecting: true }]);              /* start the loop */
let t = 16;
for (let f = 0; f < 3; f++){                          /* settle a few frames */
  rects.length = 0;
  const q = rafQ.splice(0);
  q.forEach(fn => fn(t)); t += 16;
}
const stats = ctl.getStats();
fs.writeFileSync('/tmp/symbol_points.json', JSON.stringify({ W, H, stats, rects }));
console.log('particles drawn:', rects.length, '| stats:', JSON.stringify(stats));

/* --- emblem checks: particle counts + home bounds inside the canvas --- */
const EXPECT = forcePhone ? 982 : 1767;
if (stats.particles !== EXPECT){
  console.error('FAIL: particle count', stats.particles, 'expected', EXPECT); process.exit(1);
}
let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
for (const r of rects){
  if (r.w > 4) continue;                     /* skip debug/overlay rects */
  minX = Math.min(minX, r.x); maxX = Math.max(maxX, r.x + r.w);
  minY = Math.min(minY, r.y); maxY = Math.max(maxY, r.y + r.h);
}
const pad = 2;
if (minX < -pad || minY < -pad || maxX > W + pad || maxY > H + pad){
  console.error('FAIL: emblem bounds exceed canvas', { minX, minY, maxX, maxY, W, H }); process.exit(1);
}
const fitExpect = Math.min(W, H) * 0.82;
const spanY = maxY - minY;
if (spanY < fitExpect * 0.75 || spanY > fitExpect * 0.95){
  console.error('FAIL: emblem vertical span off-spec', { spanY, fitExpect }); process.exit(1);
}
console.log('OK: count', EXPECT, '| bounds', Math.round(minX)+','+Math.round(minY), '->', Math.round(maxX)+','+Math.round(maxY), '| spanY', Math.round(spanY), '('+Math.round(spanY/fitExpect*100)+'% of fit)');
