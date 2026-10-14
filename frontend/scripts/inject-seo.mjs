/**
 * Post-build script: injects SEO meta tags and JSON-LD into dist/index.html.
 * Run after `expo export --platform web`.
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const indexPath = resolve(__dirname, '../dist/index.html');

const SEO_HEAD = `
    <!-- SEO Meta Tags -->
    <meta name="description" content="Find Re-Turn machines near you in Ireland. Real-time status tracker for Reverse Vending Machines (RVMs) — check if the machine is full before you go. Free app for Ireland's Deposit Return Scheme." />
    <meta name="keywords" content="re-turn machine near me, bottle return machine near me, where to return bottles ireland, return cans for money, deposit return machine near me, reverse vending machine near me, deposit return scheme ireland, is it full, return bottles for money ireland, re-turn ireland, re-turn deposit return, bottle return tracker" />
    <meta name="author" content="Is It Full?" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://isitfull.ie/" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://isitfull.ie/" />
    <meta property="og:title" content="Is It Full? — Find Re-Turn Machines Near You in Ireland" />
    <meta property="og:description" content="Track Re-Turn machine status in real-time. Free app for Ireland's Deposit Return Scheme." />
    <meta property="og:site_name" content="Is It Full?" />
    <meta property="og:locale" content="en_IE" />
    <meta property="og:image" content="https://isitfull.ie/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Is It Full? — Find Re-Turn machines near you in Ireland" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Is It Full? — Find Re-Turn Machines Near You" />
    <meta name="twitter:description" content="Track Re-Turn machine status in real-time. Free app for Ireland's Deposit Return Scheme." />
    <meta name="twitter:image" content="https://isitfull.ie/og-image.png" />

    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Is It Full?",
      "url": "https://isitfull.ie",
      "description": "Real-time Re-Turn machine status tracker for Ireland's Deposit Return Scheme",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "iOS, Android, Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR"
      },
      "author": {
        "@type": "Organization",
        "name": "Is It Full?",
        "url": "https://isitfull.ie"
      },
      "areaServed": {
        "@type": "Country",
        "name": "Ireland"
      }
    }
    </script>`;

let html = readFileSync(indexPath, 'utf-8');

// Replace generic title
html = html.replace(
  '<title>Is It Full?</title>',
  '<title>Is It Full? — Find Re-Turn Machines (RVMs) Near You in Ireland</title>'
);

// Inject SEO block before </head>
html = html.replace('</head>', `${SEO_HEAD}\n  </head>`);

// Add lang attribute if missing
html = html.replace('<html>', '<html lang="en">');

// Add noscript SEO fallback content
const noscriptSeo = `<noscript>
      <h1>Is It Full? — Find Re-Turn Machines Near You in Ireland</h1>
      <p>Find Re-Turn machines near you in Ireland. Check real-time status before you go. Part of Ireland's Deposit Return Scheme (DRS) by Re-turn.</p>
      <p>Search by Eircode or address to find your nearest Re-Turn machine.</p>
      <nav><a href="/downloads/">Download the App</a> | <a href="/support/">Support</a> | <a href="/privacy/">Privacy</a> | <a href="/terms/">Terms</a></nav>
      <p style="font-size:12px;color:#999;margin-top:16px">This is an independent community project and is not affiliated with, endorsed by, or connected to <a href="https://re-turn.ie/">Re-turn</a> or the Deposit Return Scheme operator.</p>
    </noscript>`;

html = html.replace(
  '<noscript>\n      You need to enable JavaScript to run this app.\n    </noscript>',
  noscriptSeo
);

writeFileSync(indexPath, html, 'utf-8');
console.log('SEO tags injected into dist/index.html');
