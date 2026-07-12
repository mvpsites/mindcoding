/* ============================================================
   MIND DRAW — the shared draw experience (theatre + reading)
   Extracted verbatim from /preview-zine-v2/draw on 2026-07-12 so
   the landing and /draw/ run the SAME code. Wheel physics remain
   session-locked; only paths and the kick label are configurable.
   Requires /shared/keyhole-iris.js loaded first.
   MindDraw.mount(rootEl, { deckUrl, artBase, cardback, kickB, kickS,
     debugExpose (optional, test hook) })
   ============================================================ */
(function (global) {
  'use strict';
  var TEMPLATE = `<div class="theatre" id="theatre">
<section class="sec sheet on" id="sheet">
  <div class="kick"><b>__KICK_B__</b><span>__KICK_S__</span></div>
  <p class="wheelhow" id="washHow" hidden>THE FIELD WASHES ITSELF. TOUCH IT TO WASH DEEPER.</p>
  <p class="wheelhow" id="wheelHow" hidden>
    <span class="how-touch">MOVE THROUGH THE FIELD · TAP THE GOLD-EDGED CARD WHEN ONE HOLDS YOUR ATTENTION</span>
    <span class="how-mouse">MOVE THROUGH THE FIELD · CLICK THE GOLD-EDGED CARD WHEN ONE HOLDS YOUR ATTENTION</span>
  </p>
  <div class="prosc" id="prosc">
    <div class="wheelstage" id="stage" role="application"
      aria-label="Card spread. The cards shuffle themselves; slide to browse, tap the centered card to draw.">
      <p class="wheelctr" id="wheelCtr" aria-hidden="true"></p>
    </div>
    <canvas id="curtainCv" aria-hidden="true"></canvas>
    <div class="veil" id="veil">
      <p class="veil__t">ASK A QUESTION<br />YOUR AUTOPILOT CANNOT ANSWER.<br /><span class="g">HOLD IT SILENTLY.</span></p>
      <div class="veil__b">
        <button id="veilBtn" class="btn" type="button">LOOK BEYOND THE VEIL</button>
      </div>
    </div>
    <div class="controls" id="controls" hidden>
      <button id="reshuffle" class="btn btn--ghost" type="button">SHUFFLE AGAIN</button>
      <span class="controls__n">THE ORDER IS NEVER THE SAME TWICE.</span>
    </div>
  </div>
</section>

<section class="sec reading" id="reading" aria-live="polite">
  <div class="surfaced">
    <p class="surfaced__t">THIS IS WHAT SURFACED.</p>
    <p class="surfaced__s">NOT A VERDICT. NOT A PROPHECY.<br />A PERSPECTIVE YOU DID NOT REHEARSE.</p>
  </div>
  <div class="plateCol">
    <figure class="plate">
      <img id="cardImg" src="" alt="" />
      <figcaption id="plateCap">PLATE —</figcaption>
    </figure>
    <span class="revtag" id="revTag" hidden>REVERSED</span>
  </div>
  <div class="meaningCol">
    <h2 class="cardname" id="cardName"></h2>
    <p class="cardmeta"><span class="mfield" id="metaField" hidden>UPRIGHT FIELD — </span><span id="cardMeta"></span></p>
    <div class="part"><h3>01 · THE SYMBOL <small>What the image contains</small></h3><p id="pSym"></p></div>
    <div class="part"><h3>02 · THE PATTERN <small>What it may be reflecting</small></h3><p id="pPat"></p></div>
    <div class="part part--rev" id="revPart" hidden><h3>⟲ THE REVERSAL <small>How this pattern arrives inverted</small></h3>
      <p id="pRev"></p>
      <p class="revNote">The energy is present — but turned inward, delayed, or resisted. Read the pattern above through this inversion.</p></div>
    <div class="part"><h3>03 · THE QUESTION <small>What it asks you to examine</small></h3><p id="pQ"></p></div>
    <div class="part"><h3>04 · THE RECODE <small>What you may choose to practice</small></h3>
      <p id="pRec"></p><p id="pPath"></p><p class="aff" id="pAff"></p></div>
    <div class="part part--ponder"><h3>05 · THE LIFE PATTERN <small>Where this lives in your life</small></h3>
      <p id="ponderLead"></p>
      <ul class="ponder">
        <li>WHERE HAS THIS PATTERN ALREADY BEEN RUNNING — THIS WEEK, THIS YEAR, THIS DECADE?</li>
        <li>WHO INSTALLED IT — AND WHAT WAS IT PROTECTING THEM FROM?</li>
        <li>WHAT DOES KEEPING IT COST YOU? WHAT WOULD CHANGING IT COST YOU?</li>
      </ul></div>
    <div class="actions" style="margin-top:1.6rem">
      <button class="btn btn--ghost" id="again" type="button">ASK DEEPER</button>
    </div>
  </div>
</section>
</div><!-- /theatre -->`;

  function mount(root, cfg){
    root.innerHTML = TEMPLATE
      .replace('__KICK_B__', cfg.kickB || 'PLATE 02')
      .replace('__KICK_S__', cfg.kickS || '\u2014 THE THEATRE');

  var DECK = null, current = null;
  var $ = function(id){ return document.getElementById(id); };

  fetch(cfg.deckUrl).then(function(r){ return r.json(); }).then(function(d){ DECK = d; });

  function motionPref(){
    return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  }

  /* reveal — authentic draw semantics: the CHOSEN card, 30% reversal at pick */
  function reveal(id){
    var card = null;
    for (var i = 0; i < DECK.length; i++) if (DECK[i].id === id){ card = DECK[i]; break; }
    if (!card) return;
    var rev = Math.random() < 0.3;
    current = { card: card, reversed: rev, intention: '' };
    $('cardImg').src = cfg.artBase + card.art;
    $('cardImg').alt = card.name + (rev ? ' (reversed)' : '');
    $('cardImg').className = rev ? 'rev' : '';
    var num = card.numeral ? (card.numeral + ' \u00b7 ') : '';
    $('plateCap').textContent = 'PLATE ' + num + card.suit.toUpperCase();
    $('revTag').hidden = !rev;
    $('cardName').textContent = card.name;
    /* the plate's face value always shows; a reversal is read THROUGH it */
    $('cardMeta').textContent = card.upright;
    $('metaField').hidden = !rev;
    $('revPart').hidden = !rev;
    if (rev) $('pRev').textContent = card.reversed;
    $('pSym').textContent = card.symbolism;
    $('pPat').textContent = card.pattern;
    $('pQ').textContent = card.question;
    $('pRec').textContent = card.recode;
    $('pPath').textContent = card.recodePath || '';
    $('pAff').textContent = card.affirmation;
    var lead = 'Do not scroll past this. Sit with ' + card.name +
      ' for one minute and hold it against your actual life — not the life you describe, the one you live.';
    if (rev) lead += ' It arrived inverted: ask where you are resisting this energy, or turning it on yourself, rather than living it.';
    lead += ' Hold it against the question you carried in — the one you never typed.';
    $('ponderLead').textContent = lead;
    $('reading').classList.add('on');
    $('reading').scrollIntoView({ behavior: motionPref(), block: 'start' });
  }

  /* ═══ THE WHEEL — ported verbatim from the app's Wheel.jsx ═══
     · drag/flick momentum (DECAY .955) + magnetic snap (.16)
     · desktop hover-steer, deadzone 26%, quadratic, max .13 rad/frame
     · press-and-hold 900ms charge ring; >9px converts hold to drag
     · wash intro: the swirl gesture's entropy seeds the shuffle */
  var STEP = 0.24, DECAY = 0.965, SNAP = 0.16,
      DEADZONE = 0.26, MAXSTEER = 0.20, SEEK = 0.14, TAP_MS = 350,
      WASH_VISIBLE = 14, WASH_DECAY = 0.96, FAN_MS = 750;

  function mulberry32(seed){
    var t = seed >>> 0;
    return function(){
      t += 0x6d2b79f5;
      var r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }
  function seededShuffle(a, seed){
    var rnd = mulberry32(seed);
    for (var i = a.length - 1; i > 0; i--){
      var j = Math.floor(rnd() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }
  function plainShuffle(a){
    for (var i = a.length - 1; i > 0; i--){
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  var st = null, stage = null, cardEls = {};

  function buildWheel(){
    stage = $('stage');
    stage.innerHTML = '<p class="wheelctr" id="wheelCtr" aria-hidden="true"></p>';
    cardEls = {};
    var order = plainShuffle(DECK.map(function(c){ return c.id; }));
    st = {
      order: order, rot: Math.floor(order.length / 2) * STEP, vel: 0,
      dragging: false, holding: false, downAt: 0, tapId: null, seek: null,
      lastX: 0, moved: 0, hoverX: null, raf: null,
      cx: 190, R: 235, W: 96, H: 134, top: 34, done: false,
      phase: 'wash', washing: false,
      entropy: (Date.now() & 0xffffffff) >>> 0,
      pileAngle: 0, pileVel: 0, lastAng: null, lastY: 0, fanUntil: 0,
      washSet: order.slice(0, WASH_VISIBLE).map(function(id, i){
        return { id: id, orbitR: 8 + (i * 37) % 40,
          ph: (i * 2.399) % (Math.PI * 2),
          spin: 0.6 + ((i * 53) % 80) / 100,
          tilt: -24 + (i * 29) % 49 };
      })
    };
    for (var i = 0; i < order.length; i++){
      var d = document.createElement('div');
      d.className = 'wheelcard';
      d.style.opacity = 0;
      d.innerHTML = '<img src="' + cfg.cardback + '" alt="" draggable="false" loading="lazy" />';
      stage.appendChild(d);
      cardEls[order[i]] = d;
    }
    $('washHow').hidden = false;
    $('wheelHow').hidden = true;
    stage.classList.remove('pan'); /* wash needs circular gestures — stage owns touch */
    measure();
    if (st.raf) cancelAnimationFrame(st.raf);
    st.running = true;
    st.raf = requestAnimationFrame(tick);
    if (!window.__wheelIO){
      window.__wheelIO = new IntersectionObserver(function(es){
        es.forEach(function(en){
          if (!st) return;
          if (en.isIntersecting && !st.running){ st.running = true; st.raf = requestAnimationFrame(tick); }
          else if (!en.isIntersecting && st.running){ st.running = false; cancelAnimationFrame(st.raf); }
        });
      }, { threshold: 0.05 });
      window.__wheelIO.observe(stage);
    }
  }

  function measure(){
    var w = stage.clientWidth || 380;
    st.cx = w / 2;
    var compact = w < 560;
    st.W = compact ? 96 : 118;
    st.H = compact ? 134 : 165;
    st.R = compact ? 235 : 300;
    st.top = compact ? 34 : 30;
    for (var id in cardEls){
      cardEls[id].style.width = st.W + 'px';
      cardEls[id].style.height = st.H + 'px';
    }
  }

  function layout(){
    var n = st.order.length;
    var ctr = $('wheelCtr');
    var cpos = Math.min(Math.max(Math.round(st.rot / STEP), 0), Math.max(n - 1, 0));
    ctr.textContent = n ? (cpos + 1) + ' / ' + n + ' IN THE SPREAD' : '';
    for (var pos = 0; pos < n; pos++){
      var el = cardEls[st.order[pos]];
      if (!el) continue;
      var a = pos * STEP - st.rot;
      var abs = Math.abs(a);
      if (abs > 1.25){ if (el.style.opacity !== '0'){ el.style.opacity = 0; el.style.pointerEvents = 'none'; } continue; }
      el.style.opacity = Math.min(1, 1.4 - abs);
      el.style.pointerEvents = '';
      var near = Math.max(0, 1 - abs / STEP);
      var x = st.cx + st.R * Math.sin(a) - st.W / 2;
      var y = st.top + st.R * (1 - Math.cos(a)) - 16 * near;
      el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' +
        (a * 43).toFixed(1) + 'deg) scale(' + (1 + 0.12 * near).toFixed(3) + ')';
      el.style.borderColor = near > 0.6 ? 'var(--gold)' : 'var(--ink)';
      el.style.zIndex = Math.round(100 - abs * 40);
    }
  }

  function pileCy(){ return st.top + st.H / 2 + 18; }
  function layoutWash(){
    $('wheelCtr').textContent = '78 IN THE PILE';
    var cy = pileCy();
    for (var i = 0; i < st.washSet.length; i++){
      var w = st.washSet[i];
      var el = cardEls[w.id];
      if (!el) continue;
      var a = st.pileAngle * w.spin + w.ph;
      var x = st.cx + Math.cos(a) * w.orbitR - st.W / 2;
      var y = cy + Math.sin(a) * w.orbitR * 0.62 - st.H / 2;
      el.style.opacity = 0.92;
      el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' +
        (w.tilt + a * 18).toFixed(1) + 'deg)';
      el.style.zIndex = 50 + Math.round(Math.sin(a) * 20);
    }
  }

  function fanOut(){
    if (st.phase !== 'wash') return;
    st.phase = 'wheel';
    st.washing = false;
    st.entropy = (st.entropy ^ (performance.now() * 1000)) >>> 0;
    seededShuffle(st.order, st.entropy);   /* the swirl IS the shuffle */
    st.rot = Math.floor(st.order.length / 2) * STEP;
    st.vel = 0;
    $('washHow').hidden = true;
    $('wheelHow').hidden = false;
    $('controls').hidden = false;   /* SHUFFLE AGAIN only once you are in */
    stage.classList.add('pan');   /* wheel phase: vertical swipes scroll the page */
    var inPile = {};
    for (var i = 0; i < st.washSet.length; i++) inPile[st.washSet[i].id] = 1;
    var cy = pileCy();
    for (var j = 0; j < st.order.length; j++){
      var el = cardEls[st.order[j]];
      if (el && !inPile[st.order[j]]){
        el.style.transition = '';
        el.style.transform = 'translate(' + (st.cx - st.W / 2).toFixed(1) + 'px,' + (cy - st.H / 2).toFixed(1) + 'px)';
      }
    }
    void stage.offsetWidth;
    for (var k = 0; k < st.order.length; k++){
      var el2 = cardEls[st.order[k]];
      if (el2) el2.style.transition = 'transform ' + FAN_MS + 'ms cubic-bezier(.22,.9,.3,1), opacity ' + FAN_MS + 'ms ease';
    }
    layout();
    st.fanUntil = performance.now() + FAN_MS;
    setTimeout(function(){
      for (var m = 0; m < st.order.length; m++){
        var el3 = cardEls[st.order[m]];
        if (el3) el3.style.transition = '';
      }
    }, FAN_MS + 40);
  }

  function drawCentered(){
    var n = st.order.length;
    if (!n || st.done) return;
    var pos = Math.min(Math.max(Math.round(st.rot / STEP), 0), n - 1);
    var id = st.order[pos];
    var el = cardEls[id];
    st.order.splice(pos, 1);
    st.rot = Math.min(st.rot, Math.max(st.order.length - 1, 0) * STEP);
    st.done = true;
    var hintEl = $('wheelHint');
    if (hintEl) hintEl.textContent = 'LET THE SYMBOL SETTLE';
    try { if (navigator.vibrate) navigator.vibrate(12); } catch(err){}
    if (el){
      el.style.transition = 'transform .55s cubic-bezier(.22,.9,.3,1), opacity .45s ease';
      el.style.transform = 'translate(' + (st.cx - st.W / 2) + 'px,-30px) scale(1.12)';
      el.style.opacity = 0;
      el.style.pointerEvents = 'none';
    }
    setTimeout(function(){ reveal(id); }, 560);
  }

  function tick(){
    if (!st.running) return;
    st.raf = requestAnimationFrame(tick);
    try {
      if (st.phase === 'wash'){
        st.pileAngle += st.pileVel + 0.0022;
        st.pileVel *= WASH_DECAY;
        layoutWash();
        return;
      }
      if (performance.now() < st.fanUntil) return;
      if (st.done){ layout(); return; }
      if (st.seek !== null && !st.dragging){
        st.rot += (st.seek - st.rot) * SEEK;
        if (Math.abs(st.seek - st.rot) < 0.006){ st.rot = st.seek; st.seek = null; }
        layout(); return;
      }
      if (!st.dragging && !st.holding){
        var steered = false;
        if (st.hoverX !== null){
          var nn = (st.hoverX - st.cx) / st.cx;
          if (Math.abs(nn) > DEADZONE){
            st.seek = null;
            st.rot += Math.sign(nn) * Math.pow((Math.abs(nn) - DEADZONE) / (1 - DEADZONE), 2) * MAXSTEER;
            st.vel = 0; steered = true;
          }
        }
        if (!steered){
          if (Math.abs(st.vel) > 0.0012){ st.rot += st.vel; st.vel *= DECAY; }
          else {
            var t = Math.min(Math.max(Math.round(st.rot / STEP), 0), Math.max(st.order.length - 1, 0)) * STEP;
            st.rot += (t - st.rot) * SNAP; st.vel = 0;
          }
        }
      }
      var max = Math.max(st.order.length - 1, 0) * STEP;
      if (st.rot < 0) st.rot *= 0.85;
      if (st.rot > max) st.rot = max + (st.rot - max) * 0.85;
      layout();
    } catch(e){ /* never let one bad frame kill the wheel */ }
  }

  function pt(e){
    var r = stage.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function onDown(e){
    if (!st || st.done) return;
    if (st.phase === 'wash' || e.pointerType === 'mouse') e.preventDefault();
    try { stage.setPointerCapture(e.pointerId); } catch(err){}
    var p = pt(e);
    if (st.phase === 'wash'){
      st.washing = true;
      st.lastAng = Math.atan2(p.y - pileCy(), p.x - st.cx);
      st.lastX = p.x; st.lastY = p.y;
      return;
    }
    st.lastX = p.x; st.moved = 0; st.vel = 0;
    st.dragging = false; st.holding = true; st.downAt = performance.now();
    var t = e.target && e.target.closest ? e.target.closest('.wheelcard') : null;
    st.tapId = null;
    if (t){ for (var id in cardEls){ if (cardEls[id] === t){ st.tapId = id; break; } } }
  }
  function onMove(e){
    if (!st || st.done) return;
    var p = pt(e);
    if (st.phase === 'wash'){
      if (!st.washing) return;
      var ang = Math.atan2(p.y - pileCy(), p.x - st.cx);
      var dA = ang - st.lastAng;
      if (dA > Math.PI) dA -= Math.PI * 2;
      if (dA < -Math.PI) dA += Math.PI * 2;
      st.pileVel += dA * 0.30;
      var dx0 = Math.round(p.x - st.lastX), dy0 = Math.round(p.y - st.lastY);
      st.entropy = (st.entropy ^ (dx0 * 374761393 + dy0 * 668265263 + (performance.now() & 0xffff))) >>> 0;
      st.entropy = Math.imul(st.entropy ^ (st.entropy >>> 13), 1274126177) >>> 0;
      st.lastAng = ang; st.lastX = p.x; st.lastY = p.y;
      return;
    }
    if (e.pointerType === 'mouse' && !(e.buttons & 1)){ st.hoverX = p.x; st.holding = false; st.dragging = false; return; }
    if (!st.holding && !st.dragging && (e.buttons & 1)){ st.dragging = true; st.lastX = p.x; st.moved = 10; }
    if (st.holding || st.dragging){
      var dx = p.x - st.lastX;
      st.moved += Math.abs(dx);
      if (st.moved > 9 && st.holding){ st.dragging = true; st.holding = false; }
      if (st.dragging){ st.seek = null; st.rot -= dx / st.R; st.vel = st.vel * 0.6 + (-dx / st.R) * 0.4; st.hoverX = null; }
      st.lastX = p.x;
    }
  }
  function onUp(e){
    if (!st) return;
    if (st.phase === 'wash'){ if (st.washing) fanOut(); return; }
    var wasTap = st.holding && !st.dragging && st.moved <= 9 &&
      (performance.now() - st.downAt) < TAP_MS && st.tapId && !st.done;
    st.holding = false; st.dragging = false;
    if (e && e.pointerType !== 'mouse') st.hoverX = null;
    if (wasTap){
      var pos = st.order.indexOf(st.tapId);
      if (pos < 0) return;
      var centered = Math.min(Math.max(Math.round(st.rot / STEP), 0), st.order.length - 1);
      if (pos === centered) drawCentered();        /* tap the centered card: draw it */
      else { st.seek = pos * STEP; st.vel = 0; }   /* tap a side card: glide it to center */
    }
    st.tapId = null;
  }
  function onLeave(e){ if (st && e.pointerType === 'mouse') st.hoverX = null; }
  function onBlur(){ if (st){ st.holding = false; st.dragging = false; st.washing = false; st.hoverX = null; } }

  /* ---- THE THEATRE ---- */
  var velvet = null, houseOpen = false;
  function cryptoSeed(){
    try {
      var a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] >>> 0;
    } catch(e){ return (Math.random() * 0xffffffff) >>> 0; }
  }
  function autoWash(){
    if (!DECK){ setTimeout(autoWash, 120); return; }
    buildWheel();
    $('washHow').hidden = false;
    st.entropy = (st.entropy ^ cryptoSeed()) >>> 0;
    st.pileVel += 0.30;                        /* the house shuffles itself */
    if (matchMedia('(prefers-reduced-motion: reduce)').matches){ fanOut(); return; }
    setTimeout(function(){ fanOut(); }, 1400); /* fanOut self-guards on phase */
  }
  function openTheatre(){
    if (houseOpen) return;
    houseOpen = true;
    $('veil').classList.add('off');
    autoWash();
    if (velvet){
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) velvet.setProgress(1);
      else velvet.open();
    }
  }
  function shuffle(){
    if (!DECK){ setTimeout(shuffle, 120); return; }
    if (!houseOpen){ openTheatre(); return; }
    if (st && st.phase === 'wash') return;     /* already washing */
    $('reading').classList.remove('on');
    autoWash();
    $('sheet').scrollIntoView({ behavior: motionPref(), block: 'start' });
  }

  var stageEl = $('stage');
  stageEl.addEventListener('pointerdown', onDown);
  stageEl.addEventListener('pointermove', onMove);
  stageEl.addEventListener('pointerup', onUp);
  stageEl.addEventListener('pointercancel', onUp);
  stageEl.addEventListener('pointerleave', onLeave);
  addEventListener('pointerup', onUp);
  addEventListener('blur', onBlur);
  addEventListener('resize', function(){ if (st && stage) measure(); });

  velvet = window.Iris ? Iris.mount($('curtainCv'), {}) : null;
  $('veilBtn').addEventListener('click', openTheatre);
  $('reshuffle').addEventListener('click', shuffle);
  $('again').addEventListener('click', shuffle);

    if (cfg.debugExpose) cfg.debugExpose({ reveal: reveal,
      getSt: function(){ return st; }, isOpen: function(){ return houseOpen; } });
  }
  global.MindDraw = { mount: mount };
})(window);
