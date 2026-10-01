# YUGANTAR News — Static/Firebase Migration

This directory contains the Hostinger-compatible version of YUGANTAR News. It uses HTML, CSS, browser JavaScript, Firebase, and a private PHP worker. The React/Node application in `frontend/` and `backend/` is separate and is not required for this deployment.

## Architecture

- Static frontend: HTML, CSS, and browser JavaScript.
- Firebase Authentication for staff and reporter login.
- Cloud Firestore for articles, videos, polls, tickers, sponsors, podcasts, users, and moderation data.
- Optional Realtime Database for chat only.
- PHP worker for RSS and YouTube synchronization.
- Hostinger cron job for automatic feed refresh.
- Local GeoJSON/Leaflet map for all 23 West Bengal districts.
- Bengali, English, and Hindi support, with Bengali as the default language.

Hostinger Single can serve many pages from one `public_html` directory. The public homepage, admin desk, reporter workspace, district page, and video page do not require separate websites or Node.js hosting.

## URLs after deployment

```text
https://YOUR-DOMAIN.com/
https://YOUR-DOMAIN.com/district.html
https://YOUR-DOMAIN.com/videos.html
https://YOUR-DOMAIN.com/admin.html
https://YOUR-DOMAIN.com/reporter.html
```

The admin and reporter URLs may not be prominent public links, but URL hiding is not security. Firebase Authentication and Firestore Rules provide the actual protection.

## Main files

```text
index.html                  Public homepage
district.html               District news and interactive map
videos.html                 YouTube/video archive
admin.html                  Admin/editor desk
reporter.html               Reporter draft workspace
app.js                      Public UI, Firebase reads, forms, polls
district.js                 District filtering and page rendering
videos.js                   Video archive rendering
admin.js                    Admin authentication and publishing
reporter.js                 Reporter role checks and submissions
styles.css                  Public, staff, mobile, and dark-mode styling
firebase-config.js          Public Firebase web configuration
firestore.rules             Firestore authorization rules
firestore.indexes.json      Firestore composite indexes
database.rules.json         Optional Realtime Database rules
firebase.json               Firebase CLI configuration
hostinger-worker/            Private PHP worker and worker notes
assets/                     Local map data and public assets
```

Never upload `.git`, service-account JSON, private worker configuration, local secrets, or private resumes to `public_html`.

## Content workflow

```text
RSS feeds / YouTube API
          ↓
Private PHP worker on a schedule
          ↓
Cloud Firestore
          ↓
Static pages read approved/public records
```

The worker normalizes titles, summaries, source links, thumbnails, provider IDs, categories, and timestamps. Stable IDs make repeated runs idempotent. The site does not crawl the entire internet; only configured feeds and APIs are processed.

External article content should be limited to permitted metadata, short summaries, attribution, and links to the original source. The client remains responsible for rights, attribution, corrections, and takedowns.

### YouTube

The private worker uses the configured channel ID and YouTube Data API key. Recent uploads and live information are stored in Firestore. Video records use soft hide/restore controls so a hidden video does not return on the next worker run.

The YouTube API key belongs only in the private worker configuration. It must not be placed in browser JavaScript, HTML, or `firebase-config.js`.

### Facebook and podcasts

The podcast section is currently manually managed by an admin. The admin enters the podcast title, description, thumbnail URL, and Facebook link. Automatic Facebook Page data requires client-owned Page access, valid Meta permissions, and a renewable Page token. Arbitrary profile/group scraping is not supported.

### Images and storage

RSS, YouTube, and manually entered media normally remain at their external URLs. The frontend shows a branded fallback when an image is broken or blocked. This avoids filling Firebase Storage, but external images are not permanent. Re-hosting media requires rights approval, storage limits, cleanup, and a CDN/storage decision.

## Admin, reporter, and public workflows

### Admin/editor

Authorized staff can manage articles, drafts, tickers, polls, videos, live streams, sponsors, podcasts, sources, and moderation status. Publishing and destructive actions should be confirmed and audited.

### Reporter

Reporters sign in at `/reporter.html`. They can create article and poll drafts, submit work for review, and see approval or rejection feedback. Reporter content must never become public directly from the reporter workspace.

Recommended lifecycle:

```text
draft → submitted → under_review → approved/published
                              ↘ rejected with feedback
```

### Public visitor

Visitors can read published articles, browse district news, watch videos, view podcasts, vote in active polls, use the map, and view active tickers. They do not receive staff permissions by opening a staff URL.

## Firebase setup

1. Open the client’s Firebase project.
2. Add or select the Web App in **Project settings → Your apps**.
3. Put the client web configuration in `firebase-config.js`.
4. Enable Cloud Firestore using Standard edition unless Enterprise is specifically required.
5. Enable Authentication → Email/Password.
6. Enable Anonymous Authentication only if the poll/chat design requires it.
7. Enable Realtime Database only if chat is used.
8. Deploy rules and indexes:

```powershell
firebase use yugantar-news
firebase deploy --only firestore:rules,firestore:indexes
```

The Firebase web API key is public client configuration, not a service-account secret. Security comes from rules, authentication, App Check, validation, and keeping private worker credentials outside the website.

## Creating staff access

1. In Firebase Authentication → Users, create an email/password user.
2. Copy the user’s UID.
3. In Firestore, create `users/{UID}` where `{UID}` exactly matches the Authentication UID.
4. Add a string field named `role`.

| Role | Main access |
|---|---|
| `superadmin` | All editorial data, users, settings-sensitive records, and audit functions |
| `editor` | Review, publish, edit, hide, and restore editorial content |
| `reporter` | Own drafts and submissions only; cannot publish directly |

Create individual staff accounts rather than sharing the Firebase project owner account.

## Local testing

Do not double-click `index.html` as a `file://` URL. Use HTTP/HTTPS so modules and Firebase requests work correctly.

From the migration directory:

```powershell
php -S 127.0.0.1:5500 -t D:\Work\News-App\migration-static-firebase
```

Open:

```text
http://127.0.0.1:5500/index.html
http://127.0.0.1:5500/admin.html
http://127.0.0.1:5500/reporter.html
```

Test Bengali default language, language switching, published articles, image fallbacks, district map clicks, polls, YouTube videos, subscriber count, sponsors, podcasts, admin/editor/reporter permissions, reporter review flow, job applications, tickers, live streams, and browser Console/Network errors.

## Running the worker locally

Keep the service account and worker configuration outside Git and outside this directory. Example private location:

```text
D:\Work\News-App\local-secrets\yugantar-worker\worker-config.php
```

Run:

```powershell
$env:YUGANTAR_WORKER_CONFIG="D:\Work\News-App\local-secrets\yugantar-worker\worker-config.php"
C:\xampp\php\php.exe D:\Work\News-App\migration-static-firebase\hostinger-worker\sync.php
```

Check source diagnostics, processed counts, duplicate handling, Firestore errors, and the resulting documents.

## Hostinger deployment

### Prepare Firebase

1. Use the client’s Firebase project.
2. Update `firebase-config.js` with the client Web App configuration.
3. Deploy the final rules and indexes.
4. Create staff accounts and matching role documents.
5. Add the final domain to Authentication authorized domains.
6. Test locally against the client project.

### Upload the public site

In Hostinger hPanel → File Manager:

1. Open the domain’s `public_html` directory.
2. Upload the contents of this folder directly into `public_html`.
3. Ensure `public_html/index.html` exists at the document root.
4. Exclude `.git`, service accounts, private configuration, archives, and private files.
5. Enable HTTPS and test the domain.

### Configure the private PHP worker

Place the worker and service-account JSON outside `public_html` if the account permits it. Configure the client project ID, service-account path, RSS sources, YouTube channel ID, and private credentials.

Create a Hostinger cron command similar to:

```text
/usr/bin/php /home/USERNAME/private/yugantar-worker/sync.php
```

The PHP binary path varies by account. Use the path shown by Hostinger, run it manually once if possible, and inspect cron logs.

### Post-deployment smoke test

Verify HTTPS, all pages, client Firebase requests, admin login, staff-only collection protection, worker-created documents, polls, sponsors, podcasts, careers, image fallback, `robots.txt`, and `sitemap.xml`.

## Important collections

```text
articles
videoItems
videoControls
podcasts
sponsors
tickers
polls
polls/{pollId}/votes
liveStreams
subscribers
jobApplications
reporterSubmissions
externalSources
users
publicStats/subscribers
```

Public pages should read only records intended for public display. Private collections such as job applications must never be publicly readable.

## Forms and abuse protection

The bottom newsletter form currently stores an email in `subscribers`. It does not send email by itself. A real newsletter later needs an email provider, verification, duplicate detection, unsubscribe, and privacy handling.

The job form currently has required identity/contact fields, a hidden honeypot field, and a ten-minute client-side cooldown after successful submission. These reduce simple abuse but can be bypassed by a determined attacker. Server-side validation, App Check, and/or a server-verified CAPTCHA are stronger additions.

## Security rules for operation

- Keep service-account JSON, worker API keys, Meta tokens, worker config, resumes, and logs private.
- Never trust client-supplied role, status, reviewer, or publication timestamp.
- Treat Firestore Rules as the authorization boundary.
- Use separate accounts for superadmins, editors, and reporters.
- Review unauthenticated creates such as subscribers and job applications.
- Keep resumes outside public web paths or use a protected download endpoint.
- Back up Firestore before major schema or rules changes.
- Monitor worker failures, stale feeds, quotas, broken images, and suspicious request patterns.

## After-deployment hardening plan

Complete these tasks after the first production deployment has been smoke-tested. Doing them after launch allows App Check and anti-abuse changes to be monitored separately from basic deployment issues.

### Firebase App Check with reCAPTCHA Enterprise

Firebase App Check helps reject requests that do not originate from the registered web application. For new web integrations, use reCAPTCHA Enterprise. It is score-based and normally invisible to visitors; it is not a visible checkbox CAPTCHA.

Planned setup:

1. In Google Cloud Console, enable the reCAPTCHA Enterprise API for the client project.
2. Create a score-based Web key for the production domain. Do not use a checkbox challenge.
3. In Firebase Console → Security → App Check, register the YUGANTAR Web App with that key.
4. Add the Firebase App Check SDK and initialize it before Firestore/Auth access:

```js
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app-check.js';

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider('RECAPTCHA_SITE_KEY'),
  isTokenAutoRefreshEnabled: true
});
```

5. Test locally and on the production domain without enforcement.
6. Monitor verified and unverified request metrics.
7. Enable enforcement for Cloud Firestore only after the deployed site sends valid App Check tokens.
8. Repeat for other Firebase products only when they are used.

Use a separate development key or Firebase App Check debug provider for local testing. Do not enforce App Check before the website contains the initialization code, or legitimate Firebase requests may fail. App Check complements Firestore Rules, validation, honeypots, and cooldowns; it does not replace them.

### Other deferred hardening

- Add duplicate subscriber detection and unsubscribe/deactivation support.
- Decide whether newsletter email verification and an email delivery provider are required.
- Add server-side validation and rate limiting for public job submissions.
- Consider Cloudflare Turnstile or another server-verified CAPTCHA if job spam continues.
- Add stronger audit history for moderation and role changes.
- Review Firebase quotas, App Check/reCAPTCHA usage, and worker frequency after real traffic begins.
- Complete real-device tests at 320px, 390px, 768px, and 1024px widths, including long Bengali headlines, mobile map interaction, carousel touch scrolling, and admin action buttons.
- Finalize feed licenses, attribution, takedown, privacy, cookie, newsletter, and resume-retention policies.

## Troubleshooting

### Blank homepage

Verify the Firebase project, published article documents, public-read rules, required indexes, and HTTP/HTTPS serving rather than `file://`.

### No automatic news

The browser does not fetch arbitrary news. Run the PHP worker, inspect diagnostics, verify active RSS sources and network access, and confirm Firestore documents are changing.

### Admin login or permissions fail

Confirm Email/Password is enabled, the domain is authorized, `users/{uid}` matches the Authentication UID exactly, the role is a string, and the latest rules are deployed.

### Images do not load

Open the stored image URL directly and inspect Network errors. External publishers may block hotlinking or remove media; the branded fallback is intentional.

### Facebook data is missing

Confirm the Page ID, Page token, Meta permissions, token expiry, and client ownership. Personal profiles, private groups, and arbitrary scraping are not supported.

### Worker reports zero items

Check feed URLs, redirects, TLS, PHP cURL/SimpleXML, source activation flags, duplicate keys, and worker error output.

## Operational ownership

The client should own the production Firebase project, domain, Hostinger account, YouTube channel, and any Meta Page. Developers should receive individual minimum-required access. Keep deployment credentials, service-account rotation, cron configuration, backup location, and rollback steps in a private password manager or operations record, never in this repository.
