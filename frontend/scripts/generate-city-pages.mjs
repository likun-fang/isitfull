/**
 * Build-time script: fetches all RVMs, groups by city, generates static SEO pages.
 * Run after `expo export --platform web` and `inject-seo.mjs`.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');
const API = process.env.API_URL || 'https://api.isitfull.ie/api/v1';
const SITE = 'https://isitfull.ie';

// ── Helpers ──────────────────────────────────────────────────────────────────

const slug = (city) =>
  city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const today = new Date().toISOString().split('T')[0];

// ── Fetch ────────────────────────────────────────────────────────────────────

async function fetchRvms() {
  const res = await fetch(`${API}/rvms/all`);
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  const json = await res.json();
  return json.data || json;
}

function groupByCity(rvms) {
  const map = new Map();
  for (const rvm of rvms) {
    const city = (rvm.city || 'Unknown').trim();
    if (!map.has(city)) map.set(city, []);
    map.get(city).push(rvm);
  }
  // Sort cities alphabetically, sort RVMs within each city by name
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([city, list]) => ({
      city,
      slug: slug(city),
      rvms: list.sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    }));
}

// ── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
    color:#374240;background:#FFFFFF;line-height:1.5;-webkit-font-smoothing:antialiased}
  a{color:#059669;text-decoration:none}
  a:hover{text-decoration:underline}

  .header{border-bottom:1px solid #E2E8E5;padding:16px 24px;display:flex;align-items:center;gap:12px}
  .header img{width:32px;height:32px;border-radius:8px}
  .header-title{font-size:20px;font-weight:700;color:#059669}

  .wrap{max-width:720px;margin:0 auto;padding:0 24px}

  .hero{padding:48px 0 32px}
  .hero h1{font-size:32px;font-weight:700;color:#0F1614;margin-bottom:8px}
  .hero p{font-size:17px;color:#6B7A73;max-width:560px}
  .hero .count{display:inline-block;background:#ECFDF5;color:#059669;
    font-size:13px;font-weight:600;padding:4px 12px;border-radius:20px;margin-bottom:16px}

  .rvm-list{display:flex;flex-direction:column;gap:12px;padding-bottom:40px}
  .rvm-card{background:#F8FAF9;border-radius:12px;padding:16px 20px;
    display:flex;align-items:center;gap:16px;transition:box-shadow .15s}
  .rvm-card:hover{box-shadow:0 2px 8px rgba(15,22,20,.08)}
  .rvm-icon{width:40px;height:40px;border-radius:10px;background:#ECFDF5;
    display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .rvm-icon svg{width:20px;height:20px;color:#059669}
  .rvm-info{flex:1;min-width:0}
  .rvm-name{font-size:15px;font-weight:600;color:#1F2A27}
  .rvm-addr{font-size:13px;color:#6B7A73;margin-top:2px;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .rvm-eircode{font-size:12px;color:#9CA8A2;background:#F1F5F3;
    padding:2px 8px;border-radius:6px;flex-shrink:0}

  .cta{background:#ECFDF5;border-radius:16px;padding:32px;text-align:center;margin-bottom:40px}
  .cta h2{font-size:20px;font-weight:700;color:#0F1614;margin-bottom:8px}
  .cta p{font-size:15px;color:#6B7A73;margin-bottom:20px}
  .cta-btn{display:inline-block;background:#059669;color:#fff;font-size:15px;
    font-weight:600;padding:12px 28px;border-radius:10px}
  .cta-btn:hover{background:#047857;text-decoration:none}
  .cta-dl{display:inline-block;color:#059669;font-size:14px;font-weight:600;margin-top:12px}

  .about{padding-bottom:40px}
  .about h2{font-size:20px;font-weight:700;color:#0F1614;margin-bottom:12px}
  .about p{font-size:15px;color:#6B7A73;line-height:1.7;margin-bottom:12px}

  .cities{padding-bottom:40px}
  .cities h2{font-size:18px;font-weight:700;color:#0F1614;margin-bottom:16px}
  .city-grid{display:flex;flex-wrap:wrap;gap:8px}
  .city-tag{font-size:13px;color:#059669;background:#ECFDF5;padding:6px 14px;
    border-radius:8px;white-space:nowrap}
  .city-tag:hover{background:#D1FAE5;text-decoration:none}

  .footer{border-top:1px solid #E2E8E5;padding:24px 0;text-align:center}
  .footer p{font-size:14px;color:#9CA8A2;margin-bottom:8px}
  .footer-links{display:flex;justify-content:center;gap:24px}
  .footer-links a{font-size:14px;color:#059669}

  /* Index page grid */
  .index-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;padding-bottom:40px}
  .index-card{background:#F8FAF9;border-radius:12px;padding:20px;text-align:center;transition:box-shadow .15s}
  .index-card:hover{box-shadow:0 2px 8px rgba(15,22,20,.08);text-decoration:none}
  .index-city{font-size:16px;font-weight:600;color:#1F2A27}
  .index-count{font-size:13px;color:#6B7A73;margin-top:4px}

  .rvm-hidden{display:none}
  .show-all-btn{display:block;width:100%;padding:14px;border:1px solid #E2E8E5;
    border-radius:12px;background:#fff;color:#059669;font-size:15px;font-weight:600;
    cursor:pointer;margin-bottom:12px;transition:background .15s}
  .show-all-btn:hover{background:#ECFDF5}

  @media(max-width:600px){
    .hero h1{font-size:26px}
    .hero p{font-size:15px}
    .rvm-card{flex-wrap:wrap;gap:10px}
    .rvm-eircode{margin-top:4px}
    .index-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
  }
</style>`;

// ── SVG icon (map pin) ───────────────────────────────────────────────────────

const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;

// ── Templates ────────────────────────────────────────────────────────────────

function header() {
  return `<header class="header">
    <a href="/" style="display:flex;align-items:center;gap:12px;text-decoration:none">
      <img src="/assets/icon.png" alt="Is It Full?" width="32" height="32">
      <span class="header-title">Is It Full?</span>
    </a>
  </header>`;
}

function footer(cities) {
  return `<footer class="footer"><div class="wrap">
    <p style="font-size:12px;color:#9CA8A2;margin-bottom:12px">This is an independent community project and is not affiliated with, endorsed by, or connected to <a href="https://re-turn.ie/" rel="nofollow">Re-turn</a> or the Deposit Return Scheme operator.</p>
    <p>&copy; 2026 Is It Full? All rights reserved.</p>
    <div class="footer-links">
      <a href="/find/">All Locations</a>
      <a href="/privacy/">Privacy</a>
      <a href="/terms/">Terms</a>
      <a href="/support/">Support</a>
    </div>
  </div></footer>`;
}

function cityPage({ city, slug: s, rvms }, allCities) {
  const count = rvms.length;
  const otherCities = allCities
    .filter((c) => c.slug !== s)
    .slice(0, 20);

  const VISIBLE = 20;
  const rvmCards = rvms.map((r, i) => `
    <div class="rvm-card${i >= VISIBLE ? ' rvm-hidden' : ''}">
      <div class="rvm-icon">${PIN_SVG}</div>
      <div class="rvm-info">
        <div class="rvm-name">${esc(r.name || 'Reverse Vending Machine')}</div>
        <div class="rvm-addr">${esc(r.address || '')}</div>
      </div>
      ${r.postalCode ? `<span class="rvm-eircode">${esc(r.postalCode)}</span>` : ''}
    </div>`).join('');

  const showAllBtn = count > VISIBLE
    ? `<button class="show-all-btn" onclick="this.parentElement.querySelectorAll('.rvm-hidden').forEach(e=>e.classList.remove('rvm-hidden'));this.remove()">Show all ${count} machines</button>`
    : '';

  const cityLinks = otherCities.map((c) =>
    `<a href="/find/${c.slug}/" class="city-tag">${esc(c.city)} (${c.rvms.length})</a>`
  ).join('');

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Re-Turn Machines in ${city}`,
    description: `${count} Re-Turn machines (RVMs) in ${city}, Ireland`,
    numberOfItems: count,
    itemListElement: rvms.slice(0, 50).map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Place',
        name: r.name || 'Reverse Vending Machine',
        address: { '@type': 'PostalAddress', addressLocality: city, addressCountry: 'IE', postalCode: r.postalCode || '' },
        ...(r.latitude && r.longitude ? { geo: { '@type': 'GeoCoordinates', latitude: r.latitude, longitude: r.longitude } } : {}),
      },
    })),
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Re-Turn Machines in ${esc(city)} — Reverse Vending Machines (RVMs) | Is It Full?</title>
  <meta name="description" content="Find ${count} Re-Turn machines (RVMs) in ${esc(city)}, Ireland. Check real-time Reverse Vending Machine status before you go. Free app for Ireland's Deposit Return Scheme.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${SITE}/find/${s}/">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE}/find/${s}/">
  <meta property="og:title" content="Re-Turn Machines in ${esc(city)} | Is It Full?">
  <meta property="og:description" content="${count} Re-Turn machines (RVMs) in ${esc(city)}. Check real-time status.">
  <meta property="og:image" content="${SITE}/og-image.png">
  <meta property="og:locale" content="en_IE">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${SITE}/og-image.png">
  <link rel="icon" href="/favicon.ico">
  ${CSS}
  <script type="application/ld+json">${jsonLd}</script>
</head>
<body>
  ${header()}
  <main class="wrap">
    <section class="hero">
      <span class="count">${count} machine${count !== 1 ? 's' : ''}</span>
      <h1>Re-Turn Machines in ${esc(city)}</h1>
      <p>All Reverse Vending Machine (RVM) locations in ${esc(city)}, Ireland. Check real-time availability in the app before you visit.</p>
    </section>
    <section class="rvm-list">${rvmCards}${showAllBtn}</section>
    <section class="cta">
      <h2>Want live status?</h2>
      <p>See which machines are available, full, or out of order right now.</p>
      <a href="/" class="cta-btn">Check Real-Time Status</a><br>
      <a href="/downloads/" class="cta-dl">Download the App</a>
    </section>
    <section class="about">
      <h2>About Ireland's Deposit Return Scheme</h2>
      <p>Since February 2024, Ireland's Deposit Return Scheme (DRS) lets you return plastic bottles and aluminium cans to Reverse Vending Machines (RVMs) and get your deposit back. Each eligible container has a 15c or 25c deposit depending on size.</p>
      <p>Is It Full? helps you find working RVMs near you and check their real-time status before you make the trip, so you never arrive at a full or broken machine.</p>
    </section>
    ${otherCities.length > 0 ? `<section class="cities">
      <h2>Other locations</h2>
      <div class="city-grid">${cityLinks}</div>
    </section>` : ''}
  </main>
  ${footer()}
</body>
</html>`;
}

function indexPage(allCities, totalRvms) {
  const cityCards = allCities.map((c) => `
    <a href="/find/${c.slug}/" class="index-card">
      <div class="index-city">${esc(c.city)}</div>
      <div class="index-count">${c.rvms.length} machine${c.rvms.length !== 1 ? 's' : ''}</div>
    </a>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Find Reverse Vending Machines in Ireland | Is It Full?</title>
  <meta name="description" content="Browse ${totalRvms} Re-Turn machines across ${allCities.length} locations in Ireland. Find your nearest RVM and check real-time status.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${SITE}/find/">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE}/find/">
  <meta property="og:title" content="Find Reverse Vending Machines in Ireland | Is It Full?">
  <meta property="og:description" content="${totalRvms} RVMs across ${allCities.length} locations. Find yours.">
  <meta property="og:image" content="${SITE}/og-image.png">
  <meta property="og:locale" content="en_IE">
  <link rel="icon" href="/favicon.ico">
  ${CSS}
</head>
<body>
  ${header()}
  <main class="wrap">
    <section class="hero">
      <span class="count">${totalRvms} machines across Ireland</span>
      <h1>Find Reverse Vending Machines in Ireland</h1>
      <p>Browse all Re-Turn machine locations by city. Select a location to see the full list of RVMs.</p>
    </section>
    <div class="index-grid">${cityCards}</div>
    <section class="cta">
      <h2>Check live status</h2>
      <p>See which machines are available, full, or out of order right now.</p>
      <a href="/" class="cta-btn">Open Is It Full?</a><br>
      <a href="/downloads/" class="cta-dl">Download the App</a>
    </section>
  </main>
  ${footer()}
</body>
</html>`;
}

// ── Sitemap ──────────────────────────────────────────────────────────────────

function generateSitemap(allCities) {
  const urls = [
    { loc: '/', priority: '1.0' },
    { loc: '/find/', priority: '0.9' },
    { loc: '/downloads/', priority: '0.7' },
    { loc: '/privacy/', priority: '0.3' },
    { loc: '/terms/', priority: '0.3' },
    { loc: '/support/', priority: '0.3' },
    ...allCities.map((c) => ({ loc: `/find/${c.slug}/`, priority: '0.8' })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${SITE}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching RVMs from API...');
  const rvms = await fetchRvms();
  console.log(`Got ${rvms.length} RVMs`);

  const cities = groupByCity(rvms);
  console.log(`Grouped into ${cities.length} cities`);

  // Generate city pages
  for (const city of cities) {
    const dir = resolve(DIST, 'find', city.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'index.html'), cityPage(city, cities));
  }

  // Generate index page
  mkdirSync(resolve(DIST, 'find'), { recursive: true });
  writeFileSync(resolve(DIST, 'find', 'index.html'), indexPage(cities, rvms.length));

  // Generate sitemap
  writeFileSync(resolve(DIST, 'sitemap.xml'), generateSitemap(cities));

  // Copy icon to dist for header logo
  const iconSrc = resolve(__dirname, '../assets/icon.png');
  const iconDst = resolve(DIST, 'assets', 'icon.png');
  mkdirSync(resolve(DIST, 'assets'), { recursive: true });
  const { copyFileSync } = await import('fs');
  copyFileSync(iconSrc, iconDst);

  console.log(`Generated ${cities.length} city pages + index + sitemap`);
  console.log('Top 10 cities:', cities.slice(0, 10).map((c) => `${c.city} (${c.rvms.length})`).join(', '));
}

main().catch((err) => {
  console.error('Failed to generate city pages:', err);
  process.exit(1);
});
