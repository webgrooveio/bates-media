#!/usr/bin/env node
// SEMrush research — pulls keywords via the Analytics API and writes the two
// filtered lists from the SOP (blog vs service). Zero dependencies (Node 18+).
//
//   SEMRUSH_API_KEY=xxx node semrush.mjs --root "pest control" --db us \
//       --out seo-engine/clients/<slug> [--limit 200]
//
// NOTE: api.semrush.com must be reachable. It is BLOCKED in the Claude cloud
// sandbox by egress policy — run this in GitHub Actions or locally, where it
// works. The key belongs in a GitHub Actions secret / local .env, never in git.
//
// Two passes (see references/research-sop.md):
//   blog    : volume>=100, intent=Informational, KD<=30  (+ questions report)
//   service : volume>=30,  intent=Transactional, CPC>0, strip "near me"

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) args[a.slice(2)] = process.argv[++i];
}
const KEY = process.env.SEMRUSH_API_KEY;
if (!KEY) { console.error('Set SEMRUSH_API_KEY in the environment.'); process.exit(1); }
if (!args.root) { console.error('Usage: --root "<seed keyword>" [--db us] [--out DIR] [--limit 200]'); process.exit(1); }

const db = args.db || 'us';
const root = args.root;
const limit = Number(args.limit || 200);
const outDir = resolve(args.out || '.');

// Column order we request; SEMrush returns rows in this order.
const COLS = ['Ph', 'Nq', 'Cp', 'Co', 'Kd', 'Nr', 'In', 'Td'];
const INTENT = { '0': 'commercial', '1': 'informational', '2': 'navigational', '3': 'transactional' };

async function fetchReport({ type, displayFilter }) {
  const u = new URL('https://api.semrush.com/');
  u.searchParams.set('type', type);
  u.searchParams.set('key', KEY);
  u.searchParams.set('phrase', root);
  u.searchParams.set('database', db);
  u.searchParams.set('export_columns', COLS.join(','));
  u.searchParams.set('display_limit', String(limit));
  if (displayFilter) u.searchParams.set('display_filter', displayFilter);

  const res = await fetch(u);
  const text = await res.text();
  if (!res.ok || text.startsWith('ERROR')) {
    throw new Error(`SEMrush ${type}: ${res.status} ${text.slice(0, 200)}`);
  }
  return parse(text);
}

function parse(text) {
  const lines = text.trim().split(/\r?\n/);
  lines.shift(); // header row
  return lines.filter(Boolean).map(line => {
    const cells = line.split(';');
    const row = {};
    COLS.forEach((c, i) => { row[c] = cells[i] ?? ''; });
    return {
      keyword: row.Ph,
      volume: Number(row.Nq) || 0,
      cpc: Number(row.Cp) || 0,
      competition: Number(row.Co) || 0,
      kd: Number(row.Kd) || 0,
      results: Number(row.Nr) || 0,
      intent: String(row.In).split(',').map(x => INTENT[x.trim()] || x.trim()),
    };
  });
}

const hasIntent = (r, name) => r.intent.includes(name);
const isNearMe = (k) => /\bnear\s*me\b/i.test(k);

function toCSV(rows) {
  const head = 'keyword,volume,cpc,kd,competition,intent';
  const body = rows.map(r =>
    [`"${r.keyword.replace(/"/g, '""')}"`, r.volume, r.cpc, r.kd, r.competition, r.intent.join('|')].join(',')
  );
  return [head, ...body].join('\n') + '\n';
}

(async () => {
  mkdirSync(outDir, { recursive: true });

  // --- Blog pass: volume>=100, KD<=30, informational; questions + broad ---
  const blogFilter = '+|Nq|Gt|99|+|Kd|Lt|31';
  const [bq, bf] = await Promise.all([
    fetchReport({ type: 'phrase_questions', displayFilter: blogFilter }),
    fetchReport({ type: 'phrase_fullsearch', displayFilter: blogFilter }),
  ]);
  const blogSeen = new Set();
  const blog = [...bq, ...bf]
    .filter(r => hasIntent(r, 'informational'))
    .filter(r => (blogSeen.has(r.keyword) ? false : blogSeen.add(r.keyword)))
    .sort((a, b) => b.volume - a.volume);

  // --- Service pass: volume>=30, CPC>0, transactional, strip near-me ---
  const svcFilter = '+|Nq|Gt|29|+|Cp|Gt|0';
  const sf = await fetchReport({ type: 'phrase_fullsearch', displayFilter: svcFilter });
  const service = sf
    .filter(r => hasIntent(r, 'transactional'))
    .filter(r => !isNearMe(r.keyword))
    .sort((a, b) => b.volume - a.volume);

  writeFileSync(join(outDir, 'blog-keywords.csv'), toCSV(blog));
  writeFileSync(join(outDir, 'service-keywords.csv'), toCSV(service));
  console.log(`Blog keywords:    ${blog.length} -> ${join(outDir, 'blog-keywords.csv')}`);
  console.log(`Service keywords: ${service.length} -> ${join(outDir, 'service-keywords.csv')}`);
})().catch(e => { console.error(e.message); process.exit(1); });
