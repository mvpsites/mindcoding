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


eval(fs.readFileSync(__dirname + '/../public/shared/programmed-self.js', 'utf8'));

const ctl = global.ProgrammedSelf.mount(canvas, {});
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
