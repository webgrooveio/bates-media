#!/usr/bin/env node
// Static/Netlify publishing adapter for the Local SEO Engine.
// Turns optimized page sources (JSON) into SEO-complete static HTML, plus
// sitemap.xml, robots.txt, and llms.txt. Zero dependencies (Node 18+ builtins).
//
// Usage:
//   node build.mjs --client <clientDir> --out <outDir> [--base https://override]
//
// clientDir must contain:
//   site.json            site-level config (business, domain, NAP, nav)
//   content/*.json       one file per page (service | blog)
//
// Output (clean URLs):
//   <out>/<slug>/index.html
//   <out>/sitemap.xml  <out>/robots.txt  <out>/llms.txt

import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

// ---------- args ----------
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) args[a.slice(2)] = process.argv[++i];
}
if (!args.client || !args.out) {
  console.error('Usage: node build.mjs --client <clientDir> --out <outDir> [--base https://...]');
  process.exit(1);
}
const clientDir = resolve(args.client);
const outDir = resolve(args.out);

// ---------- helpers ----------
const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
// JSON-LD: only need to neutralize the closing tag sequence.
const jsonld = (obj) => JSON.stringify(obj, null, 2).replace(/</g, '\\u003c');
const trimSlash = (s) => s.replace(/\/+$/, '');

function readJSON(p) {
  try { return JSON.parse(readFileSync(p, 'utf8')); }
  catch (e) { throw new Error(`Failed to parse ${p}: ${e.message}`); }
}

// ---------- load config + content ----------
const site = readJSON(join(clientDir, 'site.json'));
const base = trimSlash(args.base || site.domain || '');
if (!base) { console.error('site.domain (or --base) is required'); process.exit(1); }

// ---------- theme (site.json "theme" block; defaults = light) ----------
const T = (() => {
  const t = site.theme || {};
  const dark = t.mode === 'dark';
  const accent = t.accent || site.brand_color || (dark ? '#4dd9e8' : '#0a7d3b');
  return {
    dark,
    bg: t.bg || (dark ? '#0a0a0a' : '#ffffff'),
    surface: t.surface || (dark ? '#111111' : '#f7f7f7'),
    border: t.border || (dark ? '#1f1f1f' : '#eeeeee'),
    text: t.text || (dark ? '#f0f0f0' : '#1a1a1a'),
    muted: t.muted || (dark ? '#8a8a8a' : '#666666'),
    accent,
    accentText: t.accent_text || (dark ? '#0a0a0a' : '#ffffff'),
    headingFont: t.heading_font ? `'${t.heading_font}',` : '',
    bodyFont: t.body_font ? `'${t.body_font}',` : '',
    googleFonts: t.google_fonts || '',
    radius: t.radius || '8px',
  };
})();

const contentDir = join(clientDir, 'content');
const pageFiles = existsSync(contentDir)
  ? readdirSync(contentDir).filter(f => f.endsWith('.json')).sort()
  : [];
if (!pageFiles.length) { console.error(`No page JSON files in ${contentDir}`); process.exit(1); }

const pages = pageFiles.map(f => {
  const p = readJSON(join(contentDir, f));
  if (!p.slug) throw new Error(`${f}: missing "slug"`);
  if (!p.title) throw new Error(`${f}: missing "title"`);
  p.url = `${base}/${trimSlash(p.slug)}/`;
  return p;
});

// ---------- schema (JSON-LD) ----------
function localBusiness() {
  const a = site.address || {};
  const lb = {
    '@type': site.business_type || 'LocalBusiness',
    name: site.business_name,
    url: base,
    ...(site.phone && { telephone: site.phone }),
    ...(site.email && { email: site.email }),
    ...(site.logo && { logo: base + site.logo }),
  };
  if (a.street || a.city) {
    lb.address = {
      '@type': 'PostalAddress',
      ...(a.street && { streetAddress: a.street }),
      ...(a.city && { addressLocality: a.city }),
      ...(a.region && { addressRegion: a.region }),
      ...(a.postal && { postalCode: a.postal }),
      ...(a.country && { addressCountry: a.country }),
    };
  }
  return lb;
}

function pageSchema(page) {
  const graph = [];
  const business = localBusiness();
  graph.push(business);

  graph.push({
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: base + '/' },
      { '@type': 'ListItem', position: 2, name: page.title, item: page.url },
    ],
  });

  if (page.type === 'service') {
    graph.push({
      '@type': 'Service',
      name: page.service || page.title,
      ...(page.description && { description: page.description }),
      provider: { '@type': business['@type'], name: site.business_name, url: base },
      ...(page.city && { areaServed: { '@type': 'City', name: page.city } }),
      url: page.url,
    });
  } else {
    graph.push({
      '@type': 'Article',
      headline: page.title,
      ...(page.description && { description: page.description }),
      ...(page.date && { datePublished: page.date, dateModified: page.date }),
      author: { '@type': 'Person', name: page.author || site.author_default || site.business_name },
      publisher: { '@type': 'Organization', name: site.business_name, ...(site.logo && { logo: { '@type': 'ImageObject', url: base + site.logo } }) },
      mainEntityOfPage: page.url,
    });
  }

  if (Array.isArray(page.faq) && page.faq.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: page.faq.map(({ q, a }) => ({
        '@type': 'Question', name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

// ---------- HTML render ----------
function renderFaq(faq) {
  if (!Array.isArray(faq) || !faq.length) return '';
  const items = faq.map(({ q, a }) => `
      <details class="faq">
        <summary>${esc(q)}</summary>
        <div>${a}</div>
      </details>`).join('');
  return `\n    <section class="faq-section" aria-label="Frequently asked questions">
      <h2>Frequently Asked Questions</h2>${items}
    </section>`;
}

function renderNav() {
  const links = (site.nav || [{ label: 'Home', href: '/' }])
    .map(n => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join('');
  return `<nav class="site-nav"><a class="brand" href="/">${esc(site.business_name)}</a><div>${links}</div></nav>`;
}

function renderPage(page) {
  const author = page.author || site.author_default || site.business_name;
  const dateStr = page.date ? new Date(page.date + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : '';
  const cta = page.cta
    ? `<p class="cta"><a class="btn" href="${esc(page.cta.href || '/contact')}">${esc(page.cta.text || 'Get a Free Quote')}</a></p>`
    : '';
  // Answer-first block (GEO): direct answer in line 1, extractable.
  const answer = page.answer ? `<p class="answer"><strong>${esc(page.answer)}</strong></p>` : '';

  return `<!doctype html>
<html lang="${esc(site.lang || 'en')}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description || '')}">
<link rel="canonical" href="${esc(page.url)}">
<meta property="og:type" content="${page.type === 'service' ? 'website' : 'article'}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description || '')}">
<meta property="og:url" content="${esc(page.url)}">
${site.og_image ? `<meta property="og:image" content="${esc(base + site.og_image)}">` : ''}
<meta name="robots" content="index,follow">
${T.googleFonts ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${esc(T.googleFonts)}">` : ''}
<script type="application/ld+json">
${jsonld(pageSchema(page))}
</script>
<style>
:root{--bg:${T.bg};--surface:${T.surface};--border:${T.border};--text:${T.text};--muted:${T.muted};--accent:${T.accent};--accent-text:${T.accentText};--radius:${T.radius}}
*{box-sizing:border-box}body{margin:0;font:17px/1.7 ${T.bodyFont}system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--text);background:var(--bg)}
h1,h2,h3{font-family:${T.headingFont}${T.bodyFont}system-ui,sans-serif;${T.dark ? 'letter-spacing:.2px;' : ''}line-height:1.15}
.site-nav{display:flex;justify-content:space-between;align-items:center;padding:1rem 5vw;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:.5rem}
.site-nav .brand{font-weight:700;text-decoration:none;color:var(--accent);font-family:${T.headingFont}${T.bodyFont}system-ui,sans-serif;text-transform:uppercase;letter-spacing:1px}
.site-nav a{margin-left:1rem;text-decoration:none;color:var(--muted)}
main{max-width:760px;margin:0 auto;padding:2.5rem 5vw 4rem}
h1{font-size:2.3rem;margin:0 0 1rem}
h2{font-size:1.5rem;margin:2.2rem 0 .8rem}
table{width:100%;border-collapse:collapse;margin:1rem 0}
th,td{text-align:left;padding:.55rem .6rem;border-bottom:1px solid var(--border)}
th{color:var(--accent)}
.answer{background:var(--surface);border-left:4px solid var(--accent);padding:1rem 1.2rem;border-radius:var(--radius)}
.meta{color:var(--muted);font-size:.9rem;margin:0 0 2rem}
.btn{display:inline-block;background:var(--accent);color:var(--accent-text);padding:.85rem 1.5rem;border-radius:var(--radius);text-decoration:none;font-weight:600}
.cta{margin:2.5rem 0}
.faq-section{margin-top:3rem;border-top:1px solid var(--border);padding-top:1.5rem}
.faq{border-bottom:1px solid var(--border);padding:.6rem 0}
.faq summary{cursor:pointer;font-weight:600}
.faq div{padding:.6rem 0 .2rem;color:var(--text)}
footer{max-width:760px;margin:0 auto;padding:2rem 5vw;color:var(--muted);font-size:.85rem;border-top:1px solid var(--border)}
a{color:var(--accent)}
</style>
</head>
<body>
${renderNav()}
<main>
<article>
<h1>${esc(page.title)}</h1>
${dateStr ? `<p class="meta">By ${esc(author)} · ${esc(dateStr)}</p>` : ''}
${answer}
${page.body_html || ''}
${cta}
${renderFaq(page.faq)}
</article>
</main>
<footer>
<p>${esc(site.business_name)}${site.phone ? ` · <a href="tel:${esc(site.phone)}">${esc(site.phone)}</a>` : ''}${site.address?.city ? ` · ${esc(site.address.city)}${site.address.region ? ', ' + esc(site.address.region) : ''}` : ''}</p>
</footer>
</body>
</html>
`;
}

// ---------- site files ----------
function sitemap(pages) {
  const urls = [`  <url><loc>${base}/</loc></url>`]
    .concat(pages.map(p => `  <url><loc>${p.url}</loc>${p.date ? `<lastmod>${p.date}</lastmod>` : ''}</url>`));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

function robots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
}

function llms() {
  const lines = [
    `# ${site.business_name}`,
    site.niche ? `> ${site.business_name} — ${site.niche}${site.address?.city ? ` serving ${site.address.city}${site.address.region ? ', ' + site.address.region : ''}` : ''}.` : '',
    '',
    '## Pages',
    ...pages.map(p => `- [${p.title}](${p.url})${p.description ? `: ${p.description}` : ''}`),
    '',
  ];
  return lines.filter(l => l !== undefined).join('\n');
}

// ---------- write ----------
mkdirSync(outDir, { recursive: true });
for (const page of pages) {
  const dir = join(outDir, trimSlash(page.slug));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), renderPage(page));
}
writeFileSync(join(outDir, 'sitemap.xml'), sitemap(pages));
writeFileSync(join(outDir, 'robots.txt'), robots());
writeFileSync(join(outDir, 'llms.txt'), llms());

console.log(`Built ${pages.length} page(s) → ${outDir}`);
for (const p of pages) console.log(`  /${trimSlash(p.slug)}/  [${p.type || 'page'}]  ${p.title}`);
console.log('  + sitemap.xml, robots.txt, llms.txt');
