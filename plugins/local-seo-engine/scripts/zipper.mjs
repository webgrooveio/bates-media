#!/usr/bin/env node
// Zipper — expands a client's services × locations into the service-page matrix
// and writes content-plan.md (the ordered build queue). Deterministic; the
// content for each page is written in the generate step (Claude). Node 18+.
//
//   node zipper.mjs --client seo-engine/clients/<slug> [--max 400]
//
// Reads services[] and locations[] from the client's site.json.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) args[a.slice(2)] = process.argv[++i];
}
if (!args.client) { console.error('Usage: --client <clientDir> [--max 400]'); process.exit(1); }
const dir = resolve(args.client);
const max = Number(args.max || 400);
const site = JSON.parse(readFileSync(join(dir, 'site.json'), 'utf8'));

const services = site.services || [];
const locations = site.locations || [];
if (!services.length || !locations.length) {
  console.error('site.json needs non-empty services[] and locations[].'); process.exit(1);
}

const slugify = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const combos = [];
for (const svc of services) {
  for (const city of locations) {
    if (combos.length >= max) break;
    combos.push({
      service: svc,
      city,
      slug: `${slugify(svc)}-${slugify(city)}`,
      primary_keyword: `${svc.toLowerCase()} ${city.toLowerCase()}`,
    });
  }
}

const total = services.length * locations.length;
const capped = total > max;

let md = `# Content plan — ${site.business_name}\n\n`;
md += `Service × city zipper: **${services.length} services × ${locations.length} cities = ${total} pages**`;
md += capped ? ` (capped at ${max}).\n\n` : `.\n\n`;
md += `> Status legend: \`todo\` = not generated · \`draft\` = JSON written · \`live\` = deployed\n\n`;
md += `## Service pages (money pages)\n\n`;
md += `| # | Service | City | Slug | Primary keyword | Status |\n|---|---|---|---|---|---|\n`;
combos.forEach((c, i) => {
  md += `| ${i + 1} | ${c.service} | ${c.city} | \`${c.slug}\` | ${c.primary_keyword} | todo |\n`;
});
md += `\n## Notes\n- Each page needs UNIQUE local content (neighborhoods, local proof), not a template.\n`;
md += `- Pull real volume/KD/CPC per keyword from SEMrush before prioritizing (see scripts/research).\n`;
md += `- Expansion cities: ${site.locations_expansion || 'add more locations[] to site.json and re-run.'}\n`;

writeFileSync(join(dir, 'content-plan.md'), md);
console.log(`Zipper: ${combos.length} service pages -> ${join(dir, 'content-plan.md')}`);
combos.slice(0, 8).forEach(c => console.log(`  ${c.slug}`));
if (combos.length > 8) console.log(`  … and ${combos.length - 8} more`);
