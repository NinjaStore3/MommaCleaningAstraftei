/**
 * Lists every value in src/data/site.json that is still a [placeholder].
 * Run: npm run check:todo
 */
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../src/data/site.json', import.meta.url), 'utf8'));
const found = [];
const walk = (v, path) => {
  if (typeof v === 'string' && /^\[.*\]$/.test(v.trim())) found.push(`  ${path.padEnd(28)} ${v}`);
  else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!k.startsWith('_')) walk(x, path ? `${path}.${k}` : k);
};
walk(site, '');

const extra = [];
if (site.contact.phone === '+306900000000') extra.push('  contact.phone                τηλέφωνο-placeholder (+306900000000)');
if (!site.socials.instagram && !site.socials.facebook) extra.push('  socials                      κανένα social ακόμα (προαιρετικό)');

if (!found.length && !extra.length) {
  console.log('✓ Δεν έμεινε κανένα placeholder στο src/data/site.json.');
} else {
  console.log('Συμπλήρωσε στο src/data/site.json:\n');
  console.log([...found, ...extra].join('\n'));
  console.log('\nΚαι ακόμα: φωτογραφίες (src/assets/photos/), κείμενο «Λίγα λόγια για μένα» (src/components/sections/About.astro). Δες OWNER-TODO.md.');
}
