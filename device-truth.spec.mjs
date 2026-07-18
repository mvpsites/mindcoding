/* ============================================================
   DEVICE TRUTH SPEC — Mind Coding · ruled 2026-07-15
   Project-specific interaction checks, run by the Device Truth
   workflow in a real headless browser, per viewport (iPhone /
   desktop) and per motion mode (reduce / no-preference).
   Generic checks (console errors, overflow, tap targets,
   screenshots) live in the workflow; this file tests what only
   THIS product does: the key-drag gate, the emblem touch, the
   theatre. Every check reports instead of throwing — one broken
   thing must not hide the others.
   ============================================================ */
export default async function spec({ newPage, base, viewport, rm, report, shot }) {
  const page = await newPage();

  /* ---------- THE GATE: key exists, doesn't collide, drag unlocks ---------- */
  try {
    await page.goto(base + '/', { waitUntil: 'load' });
    await page.waitForTimeout(900);   /* iris mount + first paint settle */

    const gate = page.locator('#veilgate');
    if (!(await gate.count())) {
      report('error', `[${viewport}/${rm}] gate missing on fresh visit`);
    } else {
      const key = page.locator('.gate__key');
      const kb = await key.boundingBox();
      const gb = await gate.boundingBox();
      if (!kb) report('error', `[${viewport}/${rm}] gate key not visible`);
      else {
        const kc = { x: kb.x + kb.width / 2, y: kb.y + kb.height / 2 };
        const gc = { x: gb.x + gb.width / 2, y: gb.y + gb.height / 2 };
        const dist = Math.hypot(kc.x - gc.x, kc.y - gc.y);
        const lockR = 0.13 * Math.min(gb.width, gb.height);
        if (dist < lockR)
          report('error', `[${viewport}/${rm}] key spawns INSIDE the keyhole (dist ${dist | 0}px < r ${lockR | 0}px) — collision`);
        else
          report('notice', `[${viewport}/${rm}] gate composition ok (key ${dist | 0}px from lock, r ${lockR | 0}px)`);
        if (viewport === 'iphone' && (kb.width < 40 || kb.height < 40))
          report('error', `[${viewport}/${rm}] key tap target ${kb.width | 0}x${kb.height | 0} < 40px`);

        await shot(page, `gate-${viewport}-${rm}`);

        /* drag the key into the keyhole with pointer steps */
        await page.mouse.move(kc.x, kc.y);
        await page.mouse.down();
        const steps = 14;
        for (let i = 1; i <= steps; i++) {
          await page.mouse.move(kc.x + (gc.x - kc.x) * (i / steps), kc.y + (gc.y - kc.y) * (i / steps));
          await page.waitForTimeout(28);
        }
        await page.mouse.up();
        try {
          await page.waitForSelector('#veilgate', { state: 'detached', timeout: 4000 });
          report('notice', `[${viewport}/${rm}] KEY DRAG UNLOCKS ✓`);
        } catch {
          report('error', `[${viewport}/${rm}] key drag did NOT unlock the gate`);
          await shot(page, `gate-STUCK-${viewport}-${rm}`);
        }
      }
    }
  } catch (e) {
    report('error', `[${viewport}/${rm}] gate check crashed: ${String(e).slice(0, 140)}`);
  }

  /* ---------- THE EMBLEM: touch deforms the pattern (interaction ruling) ---------- */
  try {
    const field = page.locator('#field');
    if (await field.count()) {
      await field.scrollIntoViewIfNeeded();
      await page.waitForTimeout(rm === 'reduce' ? 400 : 2600);   /* let any entrance finish */
      const fb = await field.boundingBox();
      const before = await page.locator('#tDisp').textContent().catch(() => '');
      const cx = fb.x + fb.width / 2, cy = fb.y + fb.height / 2;
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      await page.waitForTimeout(260);                 /* hold-to-engage window */
      for (let i = 1; i <= 8; i++) { await page.mouse.move(cx + i * 9, cy + i * 4); await page.waitForTimeout(24); }
      await page.waitForTimeout(120);
      const during = await page.locator('#tDisp').textContent().catch(() => '');
      await page.mouse.up();
      if (during && during !== before && !/DISPLACEMENT 0%/.test(during))
        report('notice', `[${viewport}/${rm}] EMBLEM RESPONDS ✓ (${during.trim()})`);
      else
        report('error', `[${viewport}/${rm}] emblem did not respond to touch (telemetry: "${(during || '').trim()}")`);
      await shot(page, `emblem-${viewport}-${rm}`);
    } else report('error', `[${viewport}/${rm}] emblem canvas #field missing`);
  } catch (e) {
    report('error', `[${viewport}/${rm}] emblem check crashed: ${String(e).slice(0, 140)}`);
  }

  /* ---------- THE INSTALL (MOTION-SPEC Phase 2): section 01 must never
     strand — start it, skip it, and the full static frame must be there.
     Under RM the module exits, so the statics must simply be visible. ---------- */
  try {
    const install = page.locator('.install');
    if (await install.count()) {
      await install.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      if (rm !== 'reduce') {
        const ib = await install.boundingBox();
        if (ib) {
          /* the section is taller than the viewport — click a point of it
             that is actually on screen (box top can be negative) */
          const vp = page.viewportSize();
          const px = Math.min(Math.max(ib.x + ib.width / 2, 10), vp.width - 10);
          const py = Math.min(Math.max(ib.y + 40, 80), vp.height - 80);
          await page.mouse.move(px, py);
          await page.mouse.down(); await page.mouse.up();   /* arm -> start */
          await page.waitForTimeout(500);                    /* let typing begin */
          await page.keyboard.press('Escape');               /* skip is sacred: snap */
          await page.waitForTimeout(400);
        }
      }
      const state = await page.evaluate(() => {
        const beliefs = [...document.querySelectorAll('.beliefs .belief')];
        const notes = [...document.querySelectorAll('.belief-note')];
        const status = document.querySelector('.install-status');
        return {
          beliefTexts: beliefs.filter(b => (b.childNodes[0].textContent || '').trim().length > 5).length,
          notesVisible: notes.filter(n => parseFloat(getComputedStyle(n).opacity) > 0.9).length,
          statusOpacity: status ? parseFloat(getComputedStyle(status).opacity) : 0,
        };
      });
      if (state.beliefTexts === 6 && state.notesVisible === 6 && state.statusOpacity > 0.7)
        report('notice', `[${viewport}/${rm}] INSTALL COMPLETES ✓ (6 beliefs, 6 stamps, status ${state.statusOpacity})`);
      else
        report('error', `[${viewport}/${rm}] install stranded: beliefs ${state.beliefTexts}/6, stamps ${state.notesVisible}/6, status opacity ${state.statusOpacity}`);
      await shot(page, `install-${viewport}-${rm}`);
    } else report('error', `[${viewport}/${rm}] install section missing`);
  } catch (e) {
    report('error', `[${viewport}/${rm}] install check crashed: ${String(e).slice(0, 140)}`);
  }

  /* ---------- THE THEATRE: veil is present and actionable ---------- */
  try {
    const veil = page.locator('#veilBtn');
    if (await veil.count()) {
      await veil.scrollIntoViewIfNeeded();
      const vb = await veil.boundingBox();
      if (!vb) report('error', `[${viewport}/${rm}] veil button not visible`);
      else if (viewport === 'iphone' && vb.height < 40)
        report('error', `[${viewport}/${rm}] veil button height ${vb.height | 0}px < 40px tap target`);
      else report('notice', `[${viewport}/${rm}] theatre veil ok`);
      await shot(page, `theatre-${viewport}-${rm}`);
    } else report('error', `[${viewport}/${rm}] veil button #veilBtn missing`);
  } catch (e) {
    report('error', `[${viewport}/${rm}] theatre check crashed: ${String(e).slice(0, 140)}`);
  }

  /* ---------- PILLAR NAV (MOTION-SPEC Phase 4): the page-flip between
     sibling rolls must LAND — body at full opacity, identity transform,
     scroll-life woken. RM = plain instant navigation, same assertions. ---------- */
  try {
    await page.goto(base + '/channels/abundance/', { waitUntil: 'load' });
    await page.waitForTimeout(600);
    /* LOVE, not WISDOM: the tail of the subnav row is clipped off-screen at
       390px (pre-existing, flagged 07-17 for its own ruling) — this check
       tests the FLIP, so it uses a sibling link that is on-screen everywhere */
    const loveLink = page.locator('nav.subnav a[href*="love"]');
    if (await loveLink.count()) {
      await loveLink.click();
      await page.waitForURL('**/channels/love/**', { timeout: 5000 });
      await page.waitForTimeout(900);
      const st = await page.evaluate(() => ({
        op: parseFloat(getComputedStyle(document.body).opacity),
        tf: getComputedStyle(document.body).transform,
        gate: document.body.dataset.mcGate || 'none',
      }));
      if (st.op > 0.99 && (st.tf === 'none' || st.tf === 'matrix(1, 0, 0, 1, 0, 0)'))
        report('notice', `[${viewport}/${rm}] PILLAR NAV LANDS ✓ (opacity ${st.op}, gate ${st.gate})`);
      else
        report('error', `[${viewport}/${rm}] pillar nav stranded: opacity ${st.op}, transform ${st.tf}, gate ${st.gate}`);
      await shot(page, `pillar-nav-${viewport}-${rm}`);
    } else report('error', `[${viewport}/${rm}] love link missing in abundance subnav`);
  } catch (e) {
    report('error', `[${viewport}/${rm}] pillar nav check crashed: ${String(e).slice(0, 140)}`);
  }

  /* ---------- SPREAD COUNTER (mobile fix 07-18): the counter lives in the
     kick bar now — it must read "N / 78 IN THE SPREAD" and sit fully clear
     of the card fan (above the stage), at more than one wheel position. ---------- */
  try {
    await page.goto(base + '/draw/', { waitUntil: 'load' });
    await page.waitForTimeout(700);
    const veil = page.locator('#veilBtn');
    if (await veil.count()) {
      await veil.scrollIntoViewIfNeeded();
      await veil.click();
      await page.waitForTimeout(rm === 'reduce' ? 700 : 1600);   /* velvet opens */
      const sb = await page.locator('#stage').boundingBox();
      if (sb) {
        /* swirl the pile, release: the wash IS the shuffle, the release fans */
        const cx = sb.x + sb.width / 2, cy = sb.y + sb.height * 0.35;
        await page.mouse.move(cx, cy); await page.mouse.down();
        for (let i = 1; i <= 8; i++) {
          await page.mouse.move(cx + 60 * Math.cos(i * 0.8), cy + 40 * Math.sin(i * 0.8));
          await page.waitForTimeout(30);
        }
        await page.mouse.up();
        await page.waitForTimeout(1100);   /* FAN_MS + settle */
        const check = async (label) => {
          const st = await page.evaluate(() => {
            const c = document.getElementById('wheelCtr');
            const s = document.getElementById('stage');
            if (!c || !s) return null;
            const cr = c.getBoundingClientRect(), sr = s.getBoundingClientRect();
            return { text: c.textContent, cBottom: cr.bottom, sTop: sr.top,
                     onScreen: cr.left >= 0 && cr.right <= innerWidth && cr.width > 0 };
          });
          if (!st) { report('error', `[${viewport}/${rm}] spread counter/stage missing (${label})`); return false; }
          if (!/\d+ \/ \d+ IN THE SPREAD/.test(st.text)) {
            report('error', `[${viewport}/${rm}] counter text wrong at ${label}: "${st.text}"`); return false;
          }
          if (st.cBottom > st.sTop + 1 || !st.onScreen) {
            report('error', `[${viewport}/${rm}] counter not clear of the fan at ${label} (bottom ${st.cBottom | 0} vs stage top ${st.sTop | 0}, onScreen ${st.onScreen})`);
            return false;
          }
          return true;
        };
        let ok = await check('fan');
        /* drag the wheel to another position and re-assert */
        const dy = sb.y + sb.height * 0.55;
        await page.mouse.move(cx + 80, dy); await page.mouse.down();
        for (let i = 1; i <= 6; i++) { await page.mouse.move(cx + 80 - i * 30, dy); await page.waitForTimeout(24); }
        await page.mouse.up();
        await page.waitForTimeout(700);
        ok = (await check('after-drag')) && ok;
        if (ok) report('notice', `[${viewport}/${rm}] SPREAD COUNTER CLEAR ✓ (kick bar, both positions)`);
        await shot(page, `spread-counter-${viewport}-${rm}`);
      } else report('error', `[${viewport}/${rm}] wheel stage missing after veil`);
    } else report('error', `[${viewport}/${rm}] veil button missing on /draw/`);
  } catch (e) {
    report('error', `[${viewport}/${rm}] spread counter check crashed: ${String(e).slice(0, 140)}`);
  }

  /* ---------- SUBNAV REACH (mobile fix 07-18): every pillar link must be
     inside the viewport with a 32px+ tap target at every width. ---------- */
  try {
    await page.goto(base + '/channels/abundance/', { waitUntil: 'load' });
    await page.waitForTimeout(500);
    const bad = await page.evaluate((needTap) => {
      const out = [];
      document.querySelectorAll('nav.subnav a').forEach(a => {
        const r = a.getBoundingClientRect();
        if (r.right > innerWidth + 1 || r.left < -1) out.push(`${a.textContent} off-screen (x ${Math.round(r.x)}..${Math.round(r.right)}, vw ${innerWidth})`);
        else if (needTap && r.height < 32) out.push(`${a.textContent} tap height ${Math.round(r.height)}px < 32`);
      });
      return out;
    }, viewport === 'iphone');
    if (bad.length) bad.forEach(b => report('error', `[${viewport}/${rm}] subnav: ${b}`));
    else report('notice', `[${viewport}/${rm}] SUBNAV REACHABLE ✓ (all links on-screen, 32px+ targets)`);
  } catch (e) {
    report('error', `[${viewport}/${rm}] subnav check crashed: ${String(e).slice(0, 140)}`);
  }

  await page.close();
}
