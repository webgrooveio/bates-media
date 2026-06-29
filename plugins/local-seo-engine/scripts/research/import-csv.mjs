#!/usr/bin/env node
// SEMrush CSV importer — parses a Keyword Magic Tool export (the manual path the
// video shows) and produces the same normalized keyword lists as semrush.mjs.
// Needs no network, so it works anywhere — including the Claude cloud sandbox.
//
//   node import-csv.mjs --in export.csv --preset both --out seo-engine/clients/<slug>
//
// --preset: blog | service | both (default both)
//   blog    : volume>=100, KD<=30, intent includes Informational
//   service : volume>=30,  CPC>0,  intent includes Transactional, strip "near me"
//
// Tolerant of SEMrush's column naming and comma/semicolon/tab delimiters.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) args[a.slice(2)] = process.argv[++i];
}
if (!args.in) { console.error('Usage: --in <export.csv> [--preset blog|service|both] [--out DIR]'); process.exit(1); }
const preset = args.preset || 'both';
const outDir = resolve(args.out || '.');

// ---- delimiter-aware CSV parse (handles quoted fields) ----
function detectDelim(headerLine) {
  const counts = { ',': 0, ';': 0, '\t': 0 };
  let q = false;
  for (const ch of headerLine) {
    if (ch === '"') q = !q;
    else if (!q && ch in counts) counts[ch]++;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}
function splitLine(line, d) {
  const out = []; let cur = ''; let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
    else if (ch === d && !q) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out.map(s => s.trim());
}

const raw = readFileSync(resolve(args.in), 'utf8').replace(/^﻿/, '');
const lines = raw.split(/\r?\n/).filter(l => l.length);
if (!lines.length) { console.error('Empty CSV.'); process.exit(1); }
const delim = detectDelim(lines[0]);
const header = splitLine(lines[0], delim).map(h => h.toLowerCase());

// fuzzy column locator
const col = (...names) => {
  for (const n of names) {
    const i = header.findIndex(h => h === n || h.includes(n));
    if (i !== -1) return i;
  }
  return -1;
};
const iKw = col('keyword');
const iVol = col('volume', 'search volume');
const iKd = col('keyword difficulty', 'difficulty', 'kd');
const iCpc = col('cpc');
const iIntent = col('intent');
if (iKw === -1) { console.error('Could not find a "Keyword" column. Headers: ' + header.join(' | ')); process.exit(1); }

const num = (s) => { const n = parseFloat(String(s).replace(/[^0-9.\-]/g, '')); return isNaN(n) ? 0 : n; };
const rows = lines.slice(1).map(l => splitLine(l, delim)).map(c => ({
  keyword: c[iKw] || '',
  volume: iVol >= 0 ? num(c[iVol]) : 0,
  kd: iKd >= 0 ? num(c[iKd]) : 0,
  cpc: iCpc >= 0 ? num(c[iCpc]) : 0,
  intent: (iIntent >= 0 ? c[iIntent] : '').toLowerCase(),
})).filter(r => r.keyword);

const hasIntent = (r, name) => r.intent.includes(name);
const isNearMe = (k) => /\bnear\s*me\b/i.test(k);
const dedupeSort = (arr) => {
  const seen = new Set();
  return arr.filter(r => (seen.has(r.keyword) ? false : seen.add(r.keyword)))
            .sort((a, b) => b.volume - a.volume);
};

function blogList() {
  return dedupeSort(rows.filter(r =>
    r.volume >= 100 && r.kd <= 30 && (iIntent < 0 || hasIntent(r, 'informational'))));
}
function serviceList() {
  return dedupeSort(rows.filter(r =>
    r.volume >= 30 && r.cpc > 0 && !isNearMe(r.keyword) &&
    (iIntent < 0 || hasIntent(r, 'transactional'))));
}

function toCSV(rows) {
  const head = 'keyword,volume,cpc,kd,intent';
  const body = rows.map(r =>
    [`"${r.keyword.replace(/"/g, '""')}"`, r.volume, r.cpc, r.kd, r.intent].join(','));
  return [head, ...body].join('\n') + '\n';
}

mkdirSync(outDir, { recursive: true });
console.log(`Parsed ${rows.length} rows (delimiter '${delim === '\t' ? 'TAB' : delim}').`);
if (preset === 'blog' || preset === 'both') {
  const b = blogList();
  writeFileSync(join(outDir, 'blog-keywords.csv'), toCSV(b));
  console.log(`Blog keywords:    ${b.length} -> ${join(outDir, 'blog-keywords.csv')}`);
}
if (preset === 'service' || preset === 'both') {
  const s = serviceList();
  writeFileSync(join(outDir, 'service-keywords.csv'), toCSV(s));
  console.log(`Service keywords: ${s.length} -> ${join(outDir, 'service-keywords.csv')}`);
}
if (iIntent < 0) console.log('Note: no Intent column found — intent filter skipped (include it in your export for best results).');
