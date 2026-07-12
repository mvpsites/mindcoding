/* ============================================================
   NAV IRIS — Mind Coding · ruled 2026-07-12
   The keyhole is the connective tissue of the site: every
   internal navigation SEALS the current page through the iris
   and BLOOMS the next one open from it. Requires
   /shared/keyhole-iris.js loaded first on every page.
   - Exit: intercept plain left-clicks on same-origin links
     (never hash-only, modifier, _blank, or download links),
     drive the aperture closed in ~420ms, then navigate.
   - Arrival: a pre-paint <html>.mc-nav class (set by the tiny
     head snippet from sessionStorage) blanks the page with a
     paper overlay; this script mounts the iris sealed, drops
     the overlay, blooms open, then fires mc:enter so
     scroll-life prints the page on cue.
   - Reduced motion: everything here exits; plain navigation.
   ============================================================ */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  function fullCanvas(){
    var cv = document.createElement('canvas');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:300;pointer-events:none';
    document.body.appendChild(cv);
    return cv;
  }

  /* ---------- ARRIVAL: bloom from the keyhole ---------- */
  function arrive(){
    if (!root.classList.contains('mc-nav')) return;
    try { sessionStorage.removeItem('mc-nav'); } catch (e) {}
    /* the landing's first-visit gate owns its own reveal */
    if (document.body.dataset.mcGate === 'pending'){ root.classList.remove('mc-nav'); return; }
    if (!window.Iris || reduce){
      root.classList.remove('mc-nav');
      dispatchEvent(new Event('mc:enter'));
      return;
    }
    document.body.dataset.mcGate = 'pending';   /* scroll-life waits for mc:enter */
    var cv = fullCanvas();
    var iris = window.Iris.mount(cv, {});       /* mounts sealed */
    root.classList.remove('mc-nav');            /* drop the paint-block; the iris now seals */
    /* let the new page finish its first layout before animating — the bloom
       competing with initial paint was the visible jank */
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      var t0 = performance.now(), DUR = 640;
      (function bloom(t){
        var p = Math.min(1, (t - t0) / DUR);
        var ez = p < 0.5 ? 4*p*p*p : 1 - Math.pow(-2*p + 2, 3) / 2;   /* easeInOutCubic */
        iris.setProgress(ez);
        if (p < 1) requestAnimationFrame(bloom);
        else {
          iris.destroy(); cv.remove();
          document.body.dataset.mcGate = 'done';
          dispatchEvent(new Event('mc:enter'));
        }
      })(t0);
    }); });
  }
  arrive();

  /* ---------- EXIT: seal, then go ---------- */
  var leaving = false;
  document.addEventListener('click', function (e) {
    if (leaving || reduce || e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname) return;   /* same page (anchor or self): no transition */
    if (!window.Iris) return;                                     /* engine missing: plain nav */
    e.preventDefault();
    leaving = true;
    try { sessionStorage.setItem('mc-nav', '1'); } catch (err) {}
    var cv = fullCanvas();
    cv.style.opacity = '0';
    cv.style.transition = 'opacity 110ms ease';
    var iris = window.Iris.mount(cv, {});
    iris.setProgress(0.97);                     /* same task as mount: no sealed flash */
    requestAnimationFrame(function(){ cv.style.opacity = '1'; });   /* fade the rim in — kills the pop */
    var t0 = performance.now(), DUR = 480;
    (function seal(t){
      var p = Math.min(1, (t - t0) / DUR);
      var ez = p < 0.5 ? 4*p*p*p : 1 - Math.pow(-2*p + 2, 3) / 2;   /* easeInOutCubic */
      iris.setProgress(0.97 * (1 - ez));
      if (p < 1) requestAnimationFrame(seal);
      else location.href = url.href;
    })(t0);
  }, true);
})();
