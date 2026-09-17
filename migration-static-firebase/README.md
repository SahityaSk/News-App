# YUGANTAR static + Firebase migration

This is an isolated migration prototype. The existing `frontend/` and `backend/` folders are not modified.

## Target deployment

```text
Hostinger Single
└── public_html/
    ├── index.html
    ├── admin.html
    ├── app.js
    ├── admin.js
    ├── styles.css
    └── firebase-config.js

Hostinger PHP cron (server-side, outside public_html when possible)
└── hostinger-worker/sync.php

Firebase
├── Authentication: admin email/password and anonymous poll/chat identity
├── Firestore: articles, tickers, streams, reels, sources, subscribers
└── Realtime Database: optional live chat
```

The static site is the browser frontend. Firebase is the managed data/auth layer. The PHP worker is optional but required for automatic external-feed synchronization without running Node.js on Hostinger Single.

## What is covered

- Static public news portal with category filtering and client-side search.
- Branded public shell with dark mode, saved reading list, responsive cards, headline strip, and accessible fallback states.
- English, Bengali, and Hindi fields.
- Official YUGANTAR logo, contact desk, website, and social links mirrored from the main project.
- Firestore-powered articles, breaking tickers, live streams, reels, and polls.
- Firestore real-time listener for breaking tickers and live-stream metadata.
- Firebase Authentication-powered admin page.
- Role-aware admin publishing for articles, tickers, live stream metadata, channel videos, and external source records.
- Admin overview counts, recent-item lists, article edit/delete controls, image preview, draft workflow, and direct-page `noindex` protection.
- Newsletter subscription write path with write-only public rules.
- Optional Realtime Database chat rules and client identity support.
- Hostinger-compatible PHP worker for:
  - YouTube channel RSS latest-video synchronization.
  - YouTube live discovery when a private YouTube Data API key is configured.
  - Facebook Page post synchronization when a private Graph API Page token is configured.
  - Firestore REST writes using a private service-account key.
- Firestore and Realtime Database security rules.
- SPA rewrite rules for direct `/admin.html` and future client-side routes.

### Images

The PHP worker keeps media external; it never uploads RSS images or videos to Firebase Storage. RSS image extraction supports `media:thumbnail`, `media:content`, enclosure URLs, and image URLs embedded in feed HTML. The browser validates external HTTP(S) URLs and shows a branded fallback when a publisher blocks hotlinking or removes an image.

To refresh existing article thumbnails locally:

```powershell
$env:YUGANTAR_WORKER_CONFIG="D:\Work\News-App\local-secrets\yugantar-worker\worker-config.php"
C:\xampp\php\php.exe D:\Work\News-App\migration-static-firebase\hostinger-worker\sync.php
```

The local worker requires PHP cURL, OpenSSL, SimpleXML, and the private Firebase service-account JSON. Keep the `local-secrets` directory and all worker credentials outside version control.

## Important automatic-fetching limitations

### YouTube

The worker can read a public YouTube channel Atom feed without an API key. It can derive a thumbnail from the video ID. The feed is suitable for recent uploads, including completed live streams.

Finding the current live broadcast reliably requires the YouTube Data API. Put the API key only in the private PHP worker configuration. Never put it in `app.js`, `firebase-config.js`, or HTML.

### Facebook

The worker supports Facebook Pages through the Graph API. A Page ID, valid Page access token, app permissions, and current Meta API approval are required. Public personal profiles, private groups, and arbitrary post URLs cannot be reliably scraped from a static browser app and should not be treated as supported.

The worker stores links, text, timestamps, and thumbnail URLs. It does not download or copy media files. Confirm the client's rights to republish each source's text, image, thumbnail, video, and embed.

## Firebase setup

1. Create a Firebase project.
2. Enable Authentication → Email/Password. Enable Anonymous Auth only if anonymous poll/chat identity is required.
3. Create one Firestore database in production mode.
4. Create a Realtime Database only if chat is needed.
5. Copy the Firebase web configuration into `firebase-config.js`.
6. Publish `firestore.rules`, `database.rules.json`, and `firestore.indexes.json`.
7. Create admin users in Firebase Authentication.
8. For each admin, create `users/{uid}` in Firestore with one of:
   - `superadmin`
   - `editor`
   - `reporter`
9. Deploy the folder contents to Hostinger `public_html`.

Firebase web configuration is identifiable application configuration, not a service-account secret. Security comes from Authentication, Firestore Rules, Realtime Database Rules, App Check, and careful data modelling.

## Firestore collections

### `articles`

```js
{
  title: { EN: "", BN: "", HI: "" },
  summary: { EN: "", BN: "", HI: "" },
  content: { EN: "", BN: "", HI: "" },
  category: "national",
  author: "YUGANTAR Editorial",
  sourceAgency: "YUGANTAR",
  sourceUrl: "https://...",
  sourceLanguage: "EN",
  image: "https://...",
  status: "published",
  hero: false,
  trending: false,
  publishedAt: Timestamp,
  updatedAt: Timestamp
}
```

### `videoItems`

```js
{
  provider: "youtube" | "facebook",
  title: "...",
  description: "...",
  videoUrl: "https://...",
  thumbnail: "https://...",
  sourceUrl: "https://...",
  publishedAt: Timestamp,
  active: true
}
```

### Other collections

- `tickers`: `title`, `category`, `priority`, `active`, `publishedAt`
- `liveStreams`: `title`, `videoUrl`, `provider`, `isLive`, `active`, `updatedAt`
- `reels`: same media fields as `videoItems`
- `polls`: `question`, `options`, `active`, `totalVotes`
- `polls/{pollId}/votes/{uid}`: one vote per authenticated UID
- `subscribers`: `email`, `createdAt`, `active`; public users may create but may not read
- `externalSources`: worker source definitions; admin-only from the browser
- `users`: `{ role: "superadmin" | "editor" | "reporter" }`

## Hostinger deployment

The supplied screenshot is consistent with the current Single-plan constraints: one website, 10 GB storage, and no Node.js application runtime. Current Hostinger documentation lists Web Single as having no Node.js websites, 10 GB disk, 100 GB bandwidth, and two databases. The compiled/static approach therefore fits this plan.

Upload files, not the repository and not `node_modules`:

```text
index.html
admin.html
app.js
admin.js
styles.css
firebase-config.js
```

Create one Hostinger cron job for the PHP worker. Single currently supports two cron jobs. Store `worker-config.php` and the Google service-account JSON outside `public_html` if the account layout permits it.

Example cron command:

```text
/usr/bin/php /home/USERNAME/private/yugantar-worker/sync.php
```

Run it every 10–15 minutes. Use the second cron slot for health logging or a future cleanup task.

## Production items still requiring client decisions

- Feed and media licensing, attribution, takedown, and retention policy.
- YouTube API quota monitoring and Facebook/Meta token renewal.
- App Check and CAPTCHA/abuse protection for public newsletter, poll, and chat writes.
- Trusted server-side poll aggregation for high-integrity voting.
- Newsletter double opt-in, unsubscribe, consent records, and an email delivery provider.
- Static article page generation/prerendering for per-story NewsArticle SEO, canonical URLs, and social cards. The migration includes a homepage sitemap and admin noindex protection; per-article SEO needs a chosen generator or hosting workflow.
- Full automated accessibility audit, reduced-motion tuning, and cross-browser QA before launch.
- Backups/export of Firestore data and a documented recovery test.
- Monitoring for worker failures, stale feeds, Firebase quota usage, media failures, and broken embeds.

This folder is a migration foundation, not a declaration that the current product is production-secure.
