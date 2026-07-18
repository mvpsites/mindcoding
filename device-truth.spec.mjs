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

  await page.close();
}
