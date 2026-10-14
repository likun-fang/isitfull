/**
 * Build-time script: generates static HTML pages for Privacy, Terms, Support, Downloads.
 * Run after `expo export --platform web` and `inject-seo.mjs`.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');
const SITE = 'https://isitfull.ie';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ── Shared CSS ───────────────────────────────────────────────────────────────

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

  .wrap{max-width:800px;margin:0 auto;padding:0 24px}

  .content{padding:32px 0 64px}
  .title{font-size:32px;font-weight:700;color:#0F1614;margin-bottom:8px}
  .subtitle{font-size:18px;color:#6B7A73;margin-bottom:32px}
  .last-updated{font-size:14px;color:#9CA8A2;margin-bottom:32px}

  .section{margin-bottom:32px}
  .section-title{font-size:20px;font-weight:600;color:#0F1614;margin-bottom:12px}
  .section-subtitle{font-size:12px;font-weight:600;color:#9CA8A2;text-transform:uppercase;
    letter-spacing:0.5px;margin-bottom:12px}
  .paragraph{font-size:16px;color:#6B7A73;line-height:26px;margin-bottom:12px}

  .bullet-list{padding-left:24px;margin-bottom:12px}
  .bullet-list li{font-size:16px;color:#6B7A73;line-height:26px;margin-bottom:8px}

  .card{background:#F8FAF9;border-radius:16px;padding:24px;margin-bottom:20px}
  .card-header{display:flex;align-items:center;margin-bottom:12px}
  .card-header img{width:40px;height:40px;margin-right:12px;border-radius:8px}
  .card-title{font-size:20px;font-weight:700;color:#0F1614}
  .card-subtitle{font-size:13px;color:#9CA8A2;margin-top:2px}
  .card-button{display:inline-block;background:#059669;color:#fff;font-size:15px;
    font-weight:600;padding:12px 24px;border-radius:10px;margin-top:12px}
  .card-button:hover{background:#047857;text-decoration:none}

  .support-item{display:flex;align-items:center;padding:16px;background:#F8FAF9;
    border-radius:12px;margin-bottom:12px;transition:box-shadow .15s}
  .support-item:hover{box-shadow:0 2px 8px rgba(15,22,20,.08)}
  .support-icon{width:48px;height:48px;border-radius:12px;background:#ECFDF5;
    display:flex;align-items:center;justify-content:center;font-size:24px;margin-right:16px}
  .support-content{flex:1}
  .support-title{font-size:16px;font-weight:600;color:#0F1614;margin-bottom:2px}
  .support-desc{font-size:14px;color:#9CA8A2}

  .faq-item{background:#F8FAF9;border-radius:12px;padding:20px;margin-bottom:12px}
  .faq-question{font-size:16px;font-weight:600;color:#0F1614;margin-bottom:8px}
  .faq-answer{font-size:14px;color:#6B7A73;line-height:22px}

  .help-box{background:#ECFDF5;border-radius:12px;padding:20px;margin:32px 0}
  .help-title{font-size:15px;font-weight:600;color:#0F1614;margin-bottom:6px}
  .help-text{font-size:14px;color:#6B7A73}

  .footer{border-top:1px solid #E2E8E5;padding:24px 0;text-align:center;margin-top:48px}
  .footer p{font-size:14px;color:#9CA8A2;margin-bottom:8px}
  .footer-links{display:flex;justify-content:center;gap:24px;margin-top:12px}
  .footer-links a{font-size:14px;color:#059669}
  .disclaimer{font-size:12px;color:#9CA8A2;margin-bottom:12px;line-height:1.6}

  @media(max-width:600px){
    .title{font-size:26px}
    .subtitle{font-size:16px}
    .card-header{flex-wrap:wrap}
  }
</style>`;

// ── Shared Components ────────────────────────────────────────────────────────

function header() {
  return `<header class="header">
    <a href="/" style="display:flex;align-items:center;gap:12px;text-decoration:none">
      <img src="/assets/icon.png" alt="Is It Full?" width="32" height="32">
      <span class="header-title">Is It Full?</span>
    </a>
  </header>`;
}

function footer() {
  return `<footer class="footer"><div class="wrap">
    <p class="disclaimer">This is an independent community project and is not affiliated with, endorsed by, or connected to <a href="https://re-turn.ie/" rel="nofollow">Re-turn</a> or the Deposit Return Scheme operator.</p>
    <p>&copy; 2026 Is It Full? All rights reserved.</p>
    <div class="footer-links">
      <a href="/downloads/">Downloads</a>
      <a href="/privacy/">Privacy</a>
      <a href="/terms/">Terms</a>
      <a href="/support/">Support</a>
    </div>
  </div></footer>`;
}

// ── Page Templates ───────────────────────────────────────────────────────────

function privacyPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Privacy Policy — Is It Full?</title>
  <meta name="description" content="Privacy Policy for Is It Full? app. Learn how we collect, use, and protect your data in compliance with GDPR.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${SITE}/privacy/">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE}/privacy/">
  <meta property="og:title" content="Privacy Policy — Is It Full?">
  <meta property="og:description" content="Privacy Policy for Is It Full? app. GDPR compliant.">
  <meta property="og:image" content="${SITE}/og-image.png">
  <meta property="og:locale" content="en_IE">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.ico">
  ${CSS}
</head>
<body>
  ${header()}
  <main class="wrap content">
    <h1 class="title">Privacy Policy</h1>
    <p class="last-updated">Last updated: February 11, 2026</p>

    <section class="section">
      <h2 class="section-title">Introduction</h2>
      <p class="paragraph">
        Welcome to Is It Full? ("we," "our," or "us"). We are committed to protecting
        your privacy and ensuring you have a positive experience when using our app.
        This Privacy Policy explains how we collect, use, disclose, and safeguard your
        information when you use our mobile application.
      </p>
      <p class="paragraph">
        By using Is It Full?, you agree to the collection and use of information in
        accordance with this policy. If you do not agree with the terms of this privacy
        policy, please do not access the application.
      </p>
    </section>

    <section class="section">
      <h2 class="section-title">Information We Collect</h2>
      <p class="paragraph">
        We collect information that you provide directly to us and information that is
        automatically collected when you use our app:
      </p>
      <ul class="bullet-list">
        <li>Location Data: We collect your device's location to show nearby Reverse Vending
        Machines (RVMs) and to verify your proximity when submitting status reports.
        Location is only collected when you grant permission and is not stored beyond
        what is necessary to provide the service.</li>
        <li>Account Information: If you sign in with Google or Apple, we receive your email
        address, display name, and profile picture from these services. This information
        is used to identify your account and sync your data across devices.</li>
        <li>Device Information: We collect anonymous device identifiers to enable guest mode
        functionality and to improve app performance.</li>
        <li>User Reports: When you report an RVM status, we collect the report data along
        with your approximate location to verify the report's authenticity.</li>
        <li>Karma Points: We track your contribution history (reports submitted, corrections
        made) to calculate your karma score and user rank.</li>
        <li>Feedback and Screenshots: When you submit feedback, we collect the text you
        provide and any screenshots you attach. Screenshots are stored securely in our
        cloud storage and are only used to investigate and resolve the issues you report.</li>
        <li>Crash and Error Data: We automatically collect anonymous crash reports and
        performance data to identify and fix technical issues. This data does not
        include personally identifiable information.</li>
      </ul>
    </section>

    <section class="section">
      <h2 class="section-title">How We Use Your Information</h2>
      <ul class="bullet-list">
        <li>To provide and maintain our service, including showing you nearby RVMs and
        their current status.</li>
        <li>To improve and personalize your experience with the app.</li>
        <li>To analyze usage patterns and optimize app performance.</li>
        <li>To communicate with you about updates, security alerts, and support messages.</li>
        <li>To detect, prevent, and address technical issues or fraudulent activity.</li>
      </ul>
    </section>

    <section class="section">
      <h2 class="section-title">Third-Party Services</h2>
      <p class="paragraph">We use the following third-party services that may collect information about you:</p>
      <ul class="bullet-list">
        <li>Google Maps API: Used to display maps and provide location-based services.</li>
        <li>Firebase Authentication: Used to enable sign-in with Google and Apple.</li>
        <li>LocationIQ: Used for geocoding and address search functionality.</li>
        <li>Sentry: Used for crash reporting and performance monitoring. IP addresses
        are automatically removed before storage.</li>
        <li>Oracle Cloud Infrastructure: Used to securely store feedback screenshots.</li>
      </ul>
    </section>

    <section class="section">
      <h2 class="section-title">Data Retention and Deletion</h2>
      <p class="paragraph">
        We retain your personal data only for as long as necessary to fulfill the
        purposes outlined in this privacy policy. You can delete your account and all
        associated data at any time through the app's Settings menu. Upon account deletion,
        we will permanently remove your personal information within 30 days.
      </p>
      <p class="paragraph">
        You may also request data deletion by contacting us at privacy@isitfull.ie.
        We will respond to your request within 30 days as required by GDPR.
      </p>
    </section>

    <section class="section">
      <h2 class="section-title">Your Rights (GDPR)</h2>
      <p class="paragraph">Under GDPR, you have the following rights:</p>
      <ul class="bullet-list">
        <li>Right to Access: Request a copy of your personal data.</li>
        <li>Right to Rectification: Request correction of inaccurate data.</li>
        <li>Right to Erasure: Request deletion of your personal data.</li>
        <li>Right to Restrict Processing: Request limitation of data use.</li>
        <li>Right to Data Portability: Request your data in machine-readable format.</li>
        <li>Right to Object: Object to processing for certain purposes.</li>
        <li>Right to Withdraw Consent: Withdraw consent at any time.</li>
      </ul>
    </section>

    <section class="section">
      <h2 class="section-title">Contact Us</h2>
      <p class="paragraph">
        If you have any questions about this Privacy Policy or would like to exercise
        your rights under GDPR, please contact us at:
      </p>
      <p class="paragraph">
        Email: <a href="mailto:privacy@isitfull.ie">privacy@isitfull.ie</a>
      </p>
      <p class="paragraph">
        We will respond to your request within 30 days as required by GDPR.
      </p>
    </section>
  </main>
  ${footer()}
</body>
</html>`;
}

function termsPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Terms of Service — Is It Full?</title>
  <meta name="description" content="Terms of Service for Is It Full? app. Read our terms and conditions for using the app.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${SITE}/terms/">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE}/terms/">
  <meta property="og:title" content="Terms of Service — Is It Full?">
  <meta property="og:description" content="Terms of Service for Is It Full? app.">
  <meta property="og:image" content="${SITE}/og-image.png">
  <meta property="og:locale" content="en_IE">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.ico">
  ${CSS}
</head>
<body>
  ${header()}
  <main class="wrap content">
    <h1 class="title">Terms of Service</h1>
    <p class="last-updated">Last updated: February 5, 2026</p>

    <section class="section">
      <h2 class="section-title">Agreement to Terms</h2>
      <p class="paragraph">
        By downloading, installing, or using Is It Full? ("the App"), you agree to be
        bound by these Terms of Service ("Terms"). If you do not agree to these Terms,
        do not use the App.
      </p>
    </section>

    <section class="section">
      <h2 class="section-title">Description of Service</h2>
      <p class="paragraph">
        Is It Full? is a community-driven application that helps users locate Reverse
        Vending Machines (RVMs) in Ireland and view their current availability status.
        Users can contribute by reporting the status of RVMs they visit.
      </p>
    </section>

    <section class="section">
      <h2 class="section-title">User Accounts</h2>
      <p class="paragraph">
        You may use the App as a guest or create an account using Google or Apple
        sign-in. You are responsible for maintaining the confidentiality of your
        account and for all activities that occur under your account.
      </p>
      <p class="paragraph">
        You agree to provide accurate information and to update your information as
        necessary. We reserve the right to suspend or terminate accounts that violate
        these Terms.
      </p>
    </section>

    <section class="section">
      <h2 class="section-title">User-Generated Content</h2>
      <p class="paragraph">
        When you submit status reports ("User Content"), you grant us a non-exclusive,
        worldwide, royalty-free license to use, display, and distribute this content
        within the App.
      </p>
      <p class="paragraph">
        You agree that your User Content will be accurate and submitted in good faith.
        You must not submit false, misleading, or malicious reports.
      </p>
    </section>

    <section class="section">
      <h2 class="section-title">Prohibited Conduct</h2>
      <p class="paragraph">You agree not to:</p>
      <ul class="bullet-list">
        <li>Submit false or intentionally misleading status reports</li>
        <li>Attempt to manipulate the karma system or game the reporting mechanism</li>
        <li>Use automated systems or bots to submit reports</li>
        <li>Interfere with or disrupt the App's functionality</li>
        <li>Attempt to access other users' accounts or data</li>
        <li>Use the App for any illegal purpose</li>
      </ul>
      <p class="paragraph">
        We have zero tolerance for malicious reporting. Accounts found to be
        submitting false reports may be permanently banned without warning.
      </p>
    </section>

    <section class="section">
      <h2 class="section-title">Karma Points</h2>
      <p class="paragraph">
        Karma points are earned by contributing accurate status reports. Karma points
        have no monetary value and cannot be exchanged, transferred, or redeemed for
        cash or goods. We reserve the right to adjust karma balances if we detect
        abuse or manipulation.
      </p>
    </section>

    <section class="section">
      <h2 class="section-title">Disclaimer of Warranties</h2>
      <p class="paragraph">
        The App is provided "as is" without warranties of any kind. We do not guarantee
        the accuracy of RVM status information, as it is based on user reports. Always
        verify RVM availability in person before making a trip.
      </p>
      <p class="paragraph">
        We are not affiliated with any RVM operators or retailers. RVM locations and
        availability may change without notice.
      </p>
    </section>

    <section class="section">
      <h2 class="section-title">Limitation of Liability</h2>
      <p class="paragraph">
        To the maximum extent permitted by law, we shall not be liable for any indirect,
        incidental, special, consequential, or punitive damages arising from your use
        of the App, including but not limited to wasted trips to unavailable RVMs.
      </p>
    </section>

    <section class="section">
      <h2 class="section-title">Changes to Terms</h2>
      <p class="paragraph">
        We may update these Terms from time to time. We will notify you of any material
        changes by posting the new Terms in the App. Your continued use of the App
        after such changes constitutes acceptance of the new Terms.
      </p>
    </section>

    <section class="section">
      <h2 class="section-title">Governing Law</h2>
      <p class="paragraph">
        These Terms shall be governed by and construed in accordance with the laws of
        Ireland, without regard to its conflict of law provisions.
      </p>
    </section>

    <section class="section">
      <h2 class="section-title">Contact Us</h2>
      <p class="paragraph">
        If you have any questions about these Terms, please contact us at:
      </p>
      <p class="paragraph">
        Email: <a href="mailto:support@isitfull.ie">support@isitfull.ie</a>
      </p>
    </section>
  </main>
  ${footer()}
</body>
</html>`;
}

function supportPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Support — Is It Full?</title>
  <meta name="description" content="Get help with Is It Full? app. Contact support, report bugs, request features, and find answers to frequently asked questions.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${SITE}/support/">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE}/support/">
  <meta property="og:title" content="Support — Is It Full?">
  <meta property="og:description" content="Get help with Is It Full? app. Contact support and find FAQs.">
  <meta property="og:image" content="${SITE}/og-image.png">
  <meta property="og:locale" content="en_IE">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.ico">
  ${CSS}
</head>
<body>
  ${header()}
  <main class="wrap content">
    <h1 class="title">Support</h1>
    <p class="subtitle">We're here to help you get the most out of Is It Full?</p>

    <section class="section">
      <h2 class="section-subtitle">Contact Us</h2>
      <a href="mailto:support@isitfull.ie?subject=App Support Request" class="support-item">
        <div class="support-icon">✉️</div>
        <div class="support-content">
          <div class="support-title">Email Support</div>
          <div class="support-desc">Get help with any issue</div>
        </div>
      </a>
      <a href="mailto:support@isitfull.ie?subject=Bug Report" class="support-item">
        <div class="support-icon">🐛</div>
        <div class="support-content">
          <div class="support-title">Report a Bug</div>
          <div class="support-desc">Let us know if something isn't working</div>
        </div>
      </a>
      <a href="mailto:support@isitfull.ie?subject=Feature Request" class="support-item">
        <div class="support-icon">⭐</div>
        <div class="support-content">
          <div class="support-title">Request a Feature</div>
          <div class="support-desc">Tell us what you'd like to see</div>
        </div>
      </a>
    </section>

    <section class="section">
      <h2 class="section-subtitle">Frequently Asked Questions</h2>
      <div class="faq-item">
        <div class="faq-question">How do I report an RVM status?</div>
        <div class="faq-answer">
          Tap on any RVM marker on the map, then tap "Update Status". You must be
          within 50 meters of the RVM to submit a report.
        </div>
      </div>
      <div class="faq-item">
        <div class="faq-question">What are karma points?</div>
        <div class="faq-answer">
          Karma points are earned by submitting accurate status reports. They reflect
          your contribution to the community and unlock higher user ranks.
        </div>
      </div>
      <div class="faq-item">
        <div class="faq-question">Why can't I submit a report?</div>
        <div class="faq-answer">
          You must be within 50 meters of the RVM and wait 15 minutes between reports
          for the same machine. Make sure location services are enabled.
        </div>
      </div>
      <div class="faq-item">
        <div class="faq-question">How do I delete my account?</div>
        <div class="faq-answer">
          Go to Settings → Account → Delete Account. This will permanently remove all
          your data including karma points and report history.
        </div>
      </div>
    </section>

    <div class="help-box">
      <div class="help-title">Response time</div>
      <div class="help-text">
        We typically respond within 24-48 hours at <a href="mailto:support@isitfull.ie">support@isitfull.ie</a>
      </div>
    </div>
  </main>
  ${footer()}
</body>
</html>`;
}

function downloadsPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Download Is It Full? — iOS & Android App</title>
  <meta name="description" content="Download Is It Full? app for iPhone, iPad, and Android. Find Re-Turn machines near you and check real-time availability. Free on App Store and Google Play.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${SITE}/downloads/">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE}/downloads/">
  <meta property="og:title" content="Download Is It Full? — iOS & Android App">
  <meta property="og:description" content="Download Is It Full? for free on App Store and Google Play.">
  <meta property="og:image" content="${SITE}/og-image.png">
  <meta property="og:locale" content="en_IE">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.ico">
  ${CSS}
</head>
<body>
  ${header()}
  <main class="wrap content">
    <h1 class="title">Get the App</h1>
    <p class="subtitle">
      Available now on the App Store and Google Play. Find Re-Turn machines
      and check real-time availability before you go.
    </p>

    <div class="card">
      <div class="card-header">
        <img src="https://developer.apple.com/assets/elements/icons/app-store/app-store-64x64_2x.png" alt="App Store">
        <div>
          <div class="card-title">iPhone & iPad</div>
          <div class="card-subtitle">App Store</div>
        </div>
      </div>
      <a href="https://apps.apple.com/app/is-it-full/id6759020531" target="_blank" rel="noopener noreferrer" class="card-button">
        Download on the App Store
      </a>
    </div>

    <div class="card">
      <div class="card-header">
        <img src="https://www.gstatic.com/android/market_images/web/favicon_v3.ico" alt="Google Play">
        <div>
          <div class="card-title">Android</div>
          <div class="card-subtitle">Google Play</div>
        </div>
      </div>
      <a href="https://play.google.com/store/apps/details?id=ie.isitfull.mobile" target="_blank" rel="noopener noreferrer" class="card-button">
        Get it on Google Play
      </a>
    </div>

    <div class="help-box">
      <div class="help-title">Having trouble?</div>
      <div class="help-text">
        Need help? Email us at <a href="mailto:support@isitfull.ie">support@isitfull.ie</a>
      </div>
    </div>
  </main>
  ${footer()}
</body>
</html>`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Generating static pages...');

  // Create directories
  ['privacy', 'terms', 'support', 'downloads'].forEach((page) => {
    const dir = resolve(DIST, page);
    mkdirSync(dir, { recursive: true });
  });

  // Generate pages
  writeFileSync(resolve(DIST, 'privacy', 'index.html'), privacyPage());
  writeFileSync(resolve(DIST, 'terms', 'index.html'), termsPage());
  writeFileSync(resolve(DIST, 'support', 'index.html'), supportPage());
  writeFileSync(resolve(DIST, 'downloads', 'index.html'), downloadsPage());

  console.log('Generated 4 static pages: privacy, terms, support, downloads');
}

main().catch((err) => {
  console.error('Failed to generate static pages:', err);
  process.exit(1);
});
