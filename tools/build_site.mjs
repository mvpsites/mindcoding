// Static build: copy public/ verbatim to dist/. The zine is no-build by design
// (house rule: no frameworks, no build step); the SEO generator (build_rolls.mjs)
// then post-processes dist in both deploy workflows.
import { rmSync, cpSync } from 'node:fs';
rmSync('dist', { recursive: true, force: true });
cpSync('public', 'dist', { recursive: true });
console.log('dist/ built (verbatim copy of public/)');
