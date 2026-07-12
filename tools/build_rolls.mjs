#!/usr/bin/env node
/* ============================================================
   build_rolls.mjs — static SEO generator for the channel rolls
   Mind Coding · ruled 2026-07-12 (mvpsites playbook)

   Runs AFTER `vite build`, against dist/:
     node tools/build_rolls.mjs dist

   1. Renders each roll page's entries STATICALLY into the HTML
      (crawler-visible — no client fetch needed; the fetch script
      is removed from dist) and links every entry to its own page.
   2. Emits one standalone page per entry at
      /channels/<channel>/<slug>/index.html with
      unique <title>, meta description, canonical, and — for live
      entries — VideoObject JSON-LD.

   Env:
     BASE_URL   absolute site origin+path for canonicals/og
                (e.g. https://mindcoding.pages.dev). Optional.
     INDEXABLE  "1" flips robots noindex -> index,follow
                (production only; previews stay noindex).
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = process.argv[2] || 'dist';
const BASE = (process.env.BASE_URL || '').replace(/\/$/, '');
const INDEXABLE = process.env.INDEXABLE === '1';

const zine = dist; // zine promoted to site root 2026-07-12
const chans = JSON.parse(readFileSync(join(zine, 'channels.json'), 'utf8'));

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function entryMedia(it){
  return (it.status === 'live' && it.ytId)
    ? `<iframe class="vid" src="https://www.youtube.com/embed/${it.ytId}" title="${esc(it.title)}" loading="lazy" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`
    : `<div class="press"><b>IN PREPARATION</b><span>INKED \u00b7 AWAITING PRINT</span></div>`;
}
function entryHow(it){
  return it.line
    ? `<b>WHAT TO DO \u2014 </b>${esc(it.line)}`
    : `<b>WHAT TO DO \u2014 </b>INSTRUCTIONS ARRIVE WITH THE RECORDING.`;
}
function entryArticle(it, i, titleLink){
  const live = it.status === 'live' && it.ytId;
  const t = titleLink
    ? `<a href="./${slug(it.title)}/">${esc(it.title)}</a>`
    : esc(it.title);
  return `<article class="entry">
<div class="entry__kick"><b>${String(i + 1).padStart(2, '0')}</b><span>${esc((it.type || '').toUpperCase())}</span><span class="st${live ? ' live' : ''}">${live ? 'LIVE' : 'IN PREPARATION'}</span></div>
<div class="entry__body"><div class="entry__text"><h2 class="entry__t">${t}</h2>
<p class="entry__how">${entryHow(it)}</p></div>
<div class="entry__media">${entryMedia(it)}</div></div></article>`;
}
function setRobots(html){
  return INDEXABLE
    ? html.replace('<meta name="robots" content="noindex" />', '<meta name="robots" content="index,follow" />')
    : html;
}
function setCanonical(html, path){
  if (!BASE) return html;
  const tag = `<link rel="canonical" href="${BASE}${path}" />\n`;
  return html.replace('</head>', tag + '</head>')
             .replace(/(<meta property="og:image" content=")[^"]*(")/,
                      `$1${BASE}/cardback.webp$2`);
}
const NUM = { abundance: '01', love: '02', spirit: '03', wellness: '04', books: '05' };
const LEDE = {
  abundance: 'NOT MORE TO CHASE.<br /><span class="g">A DIFFERENT RELATIONSHIP TO ENOUGH.</span>',
  love: 'NOT ANOTHER PERSON TO PURSUE.<br /><span class="g">A NEW DEFINITION OF WHAT FEELS LIKE HOME.</span>',
  spirit: 'NOT ANOTHER BELIEF TO INSTALL.<br /><span class="g">A RETURN TO WHAT EXISTS BENEATH THE SCRIPT.</span>',
  wellness: 'NOT ANOTHER REGIMEN TO SURVIVE.<br /><span class="g">A BODY THAT STOPS ARGUING WITH THE RECODE.</span>',
  books: 'NOT ANOTHER READING LIST.<br /><span class="g">THE INSTRUCTIONS, EXTRACTED.</span>'
};

let entryPages = 0;
for (const c of chans){
  const rollPath = join(zine, 'channels', c.id, 'index.html');
  let roll = readFileSync(rollPath, 'utf8');
  const shell = roll; // pristine copy for entry pages

  /* ---- 1. static roll page ---- */
  roll = roll.replace(/<title>[^<]*<\/title>/, `<title>MIND CODING \u2014 ${esc(c.name)}</title>`);
  roll = roll.replace('<b id="chNum">\u2014</b>', `<b id="chNum">${NUM[c.id] || '\u2014'}</b>`);
  roll = roll.replace(/<h1 class="big" id="chName">[^<]*<span class="g">\.<\/span><\/h1>/,
    `<h1 class="big" id="chName">${esc(c.name.toUpperCase())}<span class="g">.</span></h1>`);
  roll = roll.replace('<p class="chanlede" id="chLede"></p>',
    `<p class="chanlede" id="chLede">${LEDE[c.id] || ''}</p>`);
  roll = roll.replace('<p class="line" id="chLine"></p>',
    `<p class="line" id="chLine">${esc(c.line || '')}</p>`);
  roll = roll.replace('<main id="roll"></main>',
    `<main id="roll">${c.items.map((it, i) => entryArticle(it, i, true)).join('\n')}</main>`);
  roll = roll.replace(/<script>\s*\(function\(\)\{\s*var CH = '[\s\S]*?<\/script>/, '');
  roll = setCanonical(setRobots(roll), `/channels/${c.id}/`);
  writeFileSync(rollPath, roll);

  /* ---- 2. one page per entry ---- */
  for (let i = 0; i < c.items.length; i++){
    const it = c.items[i];
    const sl = slug(it.title);
    const dir = join(zine, 'channels', c.id, sl);
    mkdirSync(dir, { recursive: true });
    const live = it.status === 'live' && it.ytId;
    const desc = it.line || `${it.title} \u2014 from the ${c.name} channel. ${c.line || ''}`.trim();
    let page = shell;
    /* entry pages live one directory deeper than the roll shell they are
       templated from — every relative ref gains one ../ (latent bug fixed
       2026-07-12; applied BEFORE injections so generator-added links like
       the ../ back-to-roll link keep their intended depth) */
    page = page.replace(/(href|src)="(\.\.\/[^"]*)"/g, (m, a, u) => `${a}="../${u}"`);
    page = page.replace(/<title>[^<]*<\/title>/,
      `<title>${esc(it.title)} \u2014 MIND CODING ${esc(c.name)}</title>`);
    page = page.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(it.title)}$2`);
    page = page.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(desc)}$2`);
    page = page.replace('<b id="chNum">\u2014</b>', `<b id="chNum">${NUM[c.id] || ''} \u00b7 ${String(i + 1).padStart(2, '0')}</b>`);
    page = page.replace(/<h1 class="big" id="chName">[^<]*<span class="g">\.<\/span><\/h1>/,
      `<h1 class="big" id="chName">${esc(it.title.toUpperCase())}<span class="g">.</span></h1>`);
    page = page.replace('<p class="chanlede" id="chLede"></p>',
      `<p class="chanlede" id="chLede">${esc(c.name.toUpperCase())} \u2014 ${live ? 'LIVE' : 'IN PREPARATION'}</p>`);
    page = page.replace('<p class="line" id="chLine"></p>',
      `<p class="line" id="chLine">${esc(desc)}</p>`);
    page = page.replace('<main id="roll"></main>',
      `<main id="roll">${entryArticle(it, i, false)}
<div class="share" style="border-top:0"><a href="../">\u2190 BACK TO THE ${esc(c.name.toUpperCase())} ROLL</a></div></main>`);
    page = page.replace(/<script>\s*\(function\(\)\{\s*var CH = '[\s\S]*?<\/script>/, '');
    if (live){
      const ld = {
        '@context': 'https://schema.org', '@type': 'VideoObject',
        name: it.title, description: desc,
        thumbnailUrl: `https://i.ytimg.com/vi/${it.ytId}/hqdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${it.ytId}`,
        uploadDate: it.date || new Date().toISOString().slice(0, 10),
        publisher: { '@type': 'Organization', name: 'Mind Coding' }
      };
      page = page.replace('</head>', `<script type="application/ld+json">${JSON.stringify(ld)}</script>\n</head>`);
    }
    page = setCanonical(setRobots(page), `/channels/${c.id}/${sl}/`);
    writeFileSync(join(dir, 'index.html'), page);
    entryPages++;
  }
}
console.log(`build_rolls: ${chans.length} roll pages rendered statically, ${entryPages} entry pages generated` +
  (INDEXABLE ? ' [INDEXABLE]' : ' [noindex kept]') + (BASE ? ` [canonical base ${BASE}]` : ''));
