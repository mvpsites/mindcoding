/* Acceptance measurement: drive the REAL module with a synthetic pointer swipe.
   Reports: peak displacement, time to return below 3%, final avg home error. */
'use strict';
const fs = require('fs');

let fillStyle = '#000';
const ctx = {
  setTransform(){}, clearRect(){}, beginPath(){}, arc(){}, stroke(){},
  moveTo(){}, lineTo(){}, fillRect(){}, globalAlpha: 1, lineWidth: 1,
  set fillStyle(v){ fillStyle = v; }, get fillStyle(){ return fillStyle; },
  set strokeStyle(v){}, get strokeStyle(){ return '#000'; }
};

const rafQ = [];
let ioCallback = null;
const canvasListeners = {}, globalListeners = {};

const W = parseInt(process.argv[2] || '820', 10);
const H = parseInt(process.argv[3] || '900', 10);
const forcePhone = process.argv[4] === 'phone';

const canvas = {
  style: {},
  getContext(){ return ctx; },
  getBoundingClientRect(){ return { width: W, height: H, left: 0, top: 0, bottom: H }; },
  addEventListener(type, fn){ (canvasListeners[type] = canvasListeners[type] || []).push(fn); },
  width: 0, height: 0
};

global.window = global;
global.devicePixelRatio = 1;
global.innerWidth = W; global.innerHeight = H;
global.matchMedia = q => ({ matches: (forcePhone && q.indexOf('max-width') >= 0) });
global.addEventListener = (type, fn) => { (globalListeners[type] = globalListeners[type] || []).push(fn); };
global.requestAnimationFrame = fn => { rafQ.push(fn); return rafQ.length; };
global.cancelAnimationFrame = () => {};
global.IntersectionObserver = class { constructor(cb){ ioCallback = cb; } observe(){} disconnect(){} };
global.document = { addEventListener(){}, hidden: false };

let simNow = 0;
const _now = performance.now.bind(performance);
performance.now = () => simNow;

eval(fs.readFileSync(__dirname + '/../public/shared/programmed-self.js', 'utf8'));

let latest = null;
const ctl = global.ProgrammedSelf.mount(canvas, { onFrame: s => { latest = s; } });
ioCallback([{ isIntersecting: true }]);

function frame(){
  simNow += 16.67;
  const q = rafQ.splice(0);
  q.forEach(fn => fn(simNow));
}
function fire(map, type, ev){ (map[type] || []).forEach(fn => fn(ev)); }

/* settle */
for (let i = 0; i < 10; i++) frame();

/* --- one deliberate swipe across the fingerprint region --- */
const startX = W * 0.30, y = H * 0.42, endX = W * 0.68;
const swipeFrames = 22;                      /* ~370ms — a normal deliberate swipe */
fire(canvasListeners, 'mousedown', { clientX: startX, clientY: y, preventDefault(){} });
let peakSeen = 0;
for (let i = 1; i <= swipeFrames; i++){
  const x = startX + (endX - startX) * (i / swipeFrames);
  fire(globalListeners, 'mousemove', { clientX: x, clientY: y + Math.sin(i * 0.5) * 8 });
  frame();
  if (latest && latest.displacement > peakSeen) peakSeen = latest.displacement;
}
fire(globalListeners, 'mouseup', {});
const releaseAt = simNow;

/* run until displacement < 3% (or 6s cap) */
let reformMs = -1;
for (let i = 0; i < 360; i++){
  frame();
  if (latest && latest.displacement > peakSeen) peakSeen = latest.displacement;
  if (reformMs < 0 && latest && latest.displacement < 3){
    reformMs = Math.round(simNow - releaseAt);
    break;
  }
}
/* settle further to measure final home error */
for (let i = 0; i < 90; i++) frame();

console.log(JSON.stringify({
  viewport: W + 'x' + H + (forcePhone ? ' (phone)' : ' (desktop)'),
  particles: latest.particles,
  normalSwipePeakDisplacement: peakSeen + '%',
  timeToBelow3pct: reformMs + 'ms',
  finalAvgHomeErrorPx: latest.avgHomeError,
  finalDisplacement: latest.displacement + '%'
}, null, 2));
