# YUGANTAR static + Firebase migration

This folder is a separate migration site. The original React/Node project in `frontend/` and `backend/` is not changed by this migration.

The target is a Hostinger Single-compatible news website:

- Frontend: plain HTML, CSS, and browser JavaScript.
- Database and authentication: Firebase Firestore and Firebase Authentication.
- Automatic feed worker: PHP, executed by a Hostinger cron job.
- Media: external image/video URLs; this migration does not upload feed media to Firebase Storage.

## The most important answer: how do I access the admin page?

Hostinger Single allowing one website does **not** mean it allows only one HTML page. It means one website/domain and one `public_html` directory. A website can contain many files and URLs.

After deployment, access the desk at:

```text
https://YOUR-DOMAIN.com/admin.html
```

The public homepage is:

```text
https://YOUR-DOMAIN.com/
```

Both pages are inside the same website and use the same Firebase project. No second Hostinger website, second domain, Node.js server, or separate hosting plan is required.

The public page intentionally has no Editorial Desk button. Staff use the direct `/admin.html` address. The page is also marked `noindex`, but hiding the link is not security. Real protection comes from Firebase Authentication and Firestore Rules: an unauthenticated visitor cannot publish, edit, or read staff-only data.

## Files and responsibilities

```text
migration-static-firebase/
├── index.html                         Public homepage
├── admin.html                         Staff login and editorial desk
├── app.js                             Public Firebase reads and UI
├── admin.js                           Staff authentication and writes
├── styles.css                         Public/admin styling and dark mode
├── yugantar-logo.jpg                  Branded logo copied from the main project
├── firebase-config.js                 Public Firebase web configuration
├── firebase-config.example.js         Safe configuration template
├── firestore.rules                    Firestore security rules
├── firestore.indexes.json             Required Firestore query indexes
├── database.rules.json                Optional Realtime Database rules
├── firebase.json                      Firebase CLI deployment mapping
├── .firebaserc                        Firebase project alias
├── .htaccess                          Apache caching/security/rewrite rules
├── robots.txt                         Crawler rules; excludes admin.html
├── sitemap.xml                        Homepage sitemap
├── hostinger-worker/
│   ├── sync.php                        Private PHP feed synchronizer
│   ├── worker-config.example.php       Safe worker configuration template
│   └── README.md                       Worker-specific notes
└── README.md                           This handoff guide
```

Do not upload the repository, `node_modules`, `.git`, service-account JSON, `.env` files, or `worker-config.php` into `public_html`.

## How the complete workflow works

```text
RSS / YouTube / Facebook Page
          │
          ▼
PHP worker on a scheduled cron job
          │  normalizes title, text, URL, image, source, timestamp
          ▼
Firebase Firestore
          │
          ▼
index.html + app.js in the visitor's browser

Staff browser ── Firebase Authentication ── admin.html/admin.js ── Firestore
```

### Automatic news workflow

1. The PHP worker runs every 10–15 minutes.
2. It reads the configured RSS feeds and optional YouTube/Facebook sources.
3. It converts each item into the common `articles`, `videoItems`, or `liveStreams` format.
4. It uses a stable provider/source key to avoid repeatedly creating duplicates.
5. It writes metadata and external URLs to Firestore using the private service account.
6. The public browser queries published articles and listens for live ticker/stream changes.
7. Visitors see the new content after the next successful worker run or page refresh.

Automatic news is feed-based. It does not magically crawl every article on the internet. Add only sources that permit the intended use, and confirm attribution and republication rights with the client. The worker stores short metadata/summary fields and links to the original source; it does not copy entire publisher websites.

### Manual link workflow

The client can give staff a YouTube or Facebook link. An editor can then add the video, live link, thumbnail URL, or source record from the admin desk. These are additional manual records; they do not replace the PHP worker's automatic feed process.

### Image workflow

Images remain at their original public URL. The worker extracts image URLs from RSS `media:thumbnail`, `media:content`, enclosure fields, and embedded feed HTML where available. The browser lazy-loads the URL and shows a branded YUGANTAR fallback if the publisher blocks hotlinking, removes the image, or returns an invalid URL.

This design avoids filling Firebase Storage. It also means an image can disappear if the original publisher changes or blocks its URL. Downloading/re-hosting images requires a separate rights, storage, and cleanup decision.

## What the admin panel does

The admin panel is the content control room. It avoids editing Firestore documents manually for routine work and gives the team a safer, repeatable workflow.

### Admin capabilities

- Secure email/password login through Firebase Authentication.
- Role verification through `users/{uid}` in Firestore.
- Dashboard counts for published articles, drafts, channel videos, and active tickers.
- Article publishing in English, Bengali, and Hindi fields.
- Draft and published status.
- Homepage feature/hero selection.
- Article editing and deletion for editors/superadmins.
- Image URL preview before publishing.
- Breaking ticker management.
- Live stream URL and provider management.
- Manual YouTube/Facebook video entries.
- External source definitions for the worker.
- Dark mode for the desk.

### Why use an admin panel?

Without an admin panel, every title, link, ticker, and image change would require editing code and uploading files. With the desk, approved staff can update Firestore data while the static frontend stays unchanged. This reduces deployment frequency, keeps the public site simple, and lets the client manage content without Node.js or database credentials.

The admin panel is not a replacement for editorial review. The client remains responsible for fact checking, copyright/republishing permission, source attribution, takedowns, and correcting inaccurate material.

## Roles and admin access setup

### 1. Enable authentication

In Firebase Console:

1. Open the correct Firebase project.
2. Open **Authentication → Sign-in method**.
3. Enable **Email/Password**.
4. Enable Anonymous Authentication only if anonymous poll/chat identity is actually required.

### 2. Create a staff account

In **Authentication → Users**:

1. Click **Add user**.
2. Enter the staff email and a strong temporary password.
3. Create the user.
4. Copy the generated **User UID**.

### 3. Give the account a Firestore role

In **Firestore Database → Data**:

1. Open or create the `users` collection.
2. Click **Add document**.
3. Set the document ID to the exact Authentication UID, for example:

```text
8yoMggQD0GhJH7jUe834UwjI7Zo2
```

4. Add a field:

```text
Field name: role
Type: string
Value: superadmin
```

5. Save the document.

The Authentication UID and Firestore document ID must match exactly. The role must be one of:

| Role | Permissions |
|---|---|
| `superadmin` | Full staff access, including source records and user role administration through rules |
| `editor` | Publish/edit/delete articles, tickers, videos, and live streams |
| `reporter` | Create and edit their own drafts; cannot publish or manage configuration |

### 4. Log in

Open:

```text
https://YOUR-DOMAIN.com/admin.html
```

Use the Firebase Authentication email/password. If login succeeds but the page says the account has no editorial role, check that the Firestore path is exactly `users/{Authentication UID}` and that `role` is a string, not a map or number.

For security, change or remove temporary passwords and do not share the Firebase project owner account with the client. Create individual staff accounts so access can be revoked separately.

## Firebase setup for the developer

1. Create or select the client's Firebase project.
2. Add a Web App in **Project settings → Your apps**.
3. Copy the web configuration into `firebase-config.js`.
4. Enable Firestore Database. The Standard edition is the normal choice for this project; Enterprise is unnecessary unless the client has a specific enterprise requirement.
5. Start Firestore in production/locked mode, then deploy the supplied rules.
6. Create the required composite indexes by deploying `firestore.indexes.json` or by following Firebase's index link when a query reports a missing index.
7. Enable Email/Password Authentication.
8. Create the staff accounts and matching role documents.
9. Enable Realtime Database only if chat is actually implemented and required. It is not needed for normal articles, videos, tickers, or admin login.
10. Deploy rules and indexes from the migration folder:

```powershell
firebase deploy --only firestore:rules,firestore:indexes
```

The Firebase web configuration is expected to be visible in browser code. The API key there is not a service-account secret. Security comes from Authentication, Firestore Rules, Realtime Database Rules, App Check/abuse controls, and least-privilege data access.

### About Firebase's free tier

Firebase can be used without a paid plan for a small site while usage remains within the current no-cost quotas. It is not safe to promise “lifetime unlimited free” service: quotas, eligible products, billing requirements, and Firebase terms can change. Monitor Firestore reads/writes, bandwidth, authentication usage, and worker frequency.

This migration deliberately avoids Firebase Storage for RSS images and videos. That prevents the worker from accumulating media files, but external image URLs are less durable. If the client later wants permanent media storage, add a retention policy, size limits, cleanup job, and a billing/quota review first.

## Local development and testing

### Requirements

- A modern browser.
- PHP with cURL, OpenSSL, and SimpleXML for the worker.
- Firebase project credentials/configuration.
- The private service-account JSON only for the worker.

### Run the static site locally

From the migration directory, use any local static server. Examples:

```powershell
php -S 127.0.0.1:5500 -t D:\Work\News-App\migration-static-firebase
```

Then open:

```text
http://127.0.0.1:5500/index.html
http://127.0.0.1:5500/admin.html
```

Do not test by double-clicking `index.html` as a `file://` URL. ES modules and Firebase browser requests may be blocked or behave differently without HTTP.

### Test sequence

1. Confirm `firebase-config.js` contains the intended project.
2. Open the public page and confirm the YUGANTAR logo, contact links, categories, dark mode, and footer.
3. Confirm published Firestore articles appear.
4. Confirm an article image loads; test an invalid image URL to verify the fallback.
5. Confirm ticker and live-stream records appear when active.
6. Open `/admin.html` and test an approved staff account.
7. Create a draft as a reporter and confirm it is not public.
8. Publish an article as an editor/superadmin and confirm it appears on the homepage.
9. Edit an article, change its hero status, then verify the public page.
10. Test the source, video, ticker, and live-stream forms.
11. Check browser DevTools Console and Network for blocked Firebase requests, missing indexes, CORS errors, or image failures.
12. Run the worker locally and verify its output says how many feeds/items were processed.
13. Confirm new documents exist in Firestore under the expected collections.
14. Repeat the public test in a private/incognito window to ensure the page does not depend on an admin login.

### Run the worker locally

Copy `hostinger-worker/worker-config.example.php` to a private, ignored location such as:

```text
D:\Work\News-App\local-secrets\yugantar-worker\worker-config.php
```

Set the service-account path in that private config, then run:

```powershell
$env:YUGANTAR_WORKER_CONFIG="D:\Work\News-App\local-secrets\yugantar-worker\worker-config.php"
C:\xampp\php\php.exe D:\Work\News-App\migration-static-firebase\hostinger-worker\sync.php
```

Expected output includes feed/source diagnostics and processed item counts. If it says zero items, check the feed URL, PHP extensions, network access, source `active` flags, and the worker's error output before checking the browser.

## Hostinger deployment: complete procedure

### A. Prepare Firebase first

1. Use the client's Firebase project, not the developer's test project.
2. Update `migration-static-firebase/firebase-config.js` with the client's web app config.
3. Deploy Firestore rules and indexes to the client's project.
4. Create staff Authentication users and role documents.
5. Test the client project locally with the new config.

Do not copy the developer's service account into the public website. Create a separate private worker credential for the client's Firebase project.

### B. Upload the website to Hostinger

1. Open Hostinger hPanel → **Websites** → the client's website → **File Manager**.
2. Open the domain's `public_html` directory.
3. Upload the contents of `migration-static-firebase/` directly into `public_html`.
4. The final public path should be:

```text
public_html/index.html
public_html/admin.html
public_html/app.js
public_html/admin.js
public_html/styles.css
public_html/firebase-config.js
public_html/yugantar-logo.jpg
```

5. Do not upload the `.git` folder, local secrets, service-account JSON, `worker-config.php`, or development dependencies.
6. Ensure the domain's document root is the same `public_html` directory.
7. Enable/confirm the domain's SSL certificate, then test with HTTPS.

### C. Configure the private PHP worker

The worker is not a second website. It is a scheduled PHP command that writes to Firebase.

1. Create a private directory outside `public_html` if Hostinger permits it, for example:

```text
/home/USERNAME/private/yugantar-worker/
```

2. Upload `sync.php` and a private copy of `worker-config.php` there.
3. Upload the Firebase service-account JSON outside `public_html`.
4. Set `serviceAccountPath` to the server path.
5. Set the client's `projectId`.
6. Add permitted RSS sources.
7. Add the client's YouTube channel ID.
8. Add the Facebook Page ID and private Page token only if Meta permissions and client ownership are confirmed.
9. Never put tokens in `firebase-config.js`, `app.js`, `admin.js`, HTML, Firestore, or a public directory.

### D. Create the Hostinger cron job

In hPanel, open the website's **Cron Jobs** tool and create a PHP command that runs approximately every 10–15 minutes. The exact PHP binary path varies by Hostinger server. A typical command is:

```text
/usr/bin/php /home/USERNAME/private/yugantar-worker/sync.php
```

If Hostinger displays a different PHP binary path, use the path shown by that account. Run the command once manually if the panel supports it, or inspect the cron log after the first scheduled run.

If the Single plan/account does not expose the required cron frequency or private filesystem path, alternatives are:

- Run the same PHP worker on the developer's or client's computer using Windows Task Scheduler.
- Use an external scheduled job that calls a secured worker endpoint, after adding authentication and rate limiting.
- Upgrade hosting only if the client later needs a server runtime, higher cron control, or more resources.

The public website remains static in all three cases.

### E. Verify after deployment

Open:

```text
https://YOUR-DOMAIN.com/
https://YOUR-DOMAIN.com/admin.html
```

Then verify:

- HTTPS works without mixed-content warnings.
- Firebase requests point to the client's project.
- Published articles render.
- The admin login works.
- A staff-only Firestore collection is not readable when logged out.
- The worker creates/updates documents.
- `https://YOUR-DOMAIN.com/robots.txt` loads.
- `https://YOUR-DOMAIN.com/sitemap.xml` loads.

## Firestore collections and important fields

### `articles`

```js
{
  title: { EN: "", BN: "", HI: "" },
  summary: { EN: "", BN: "", HI: "" },
  content: { EN: "", BN: "", HI: "" },
  category: "national",
  author: "YUGANTAR Editorial",
  sourceAgency: "YUGANTAR",
  sourceUrl: "https://original-source.example/story",
  sourceLanguage: "EN",
  image: "https://cdn.example/image.jpg",
  status: "published",
  hero: false,
  trending: false,
  publishedAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "firebase-auth-uid"
}
```

Public pages read only `status == "published"`. Drafts remain staff-only through Firestore Rules.

### `videoItems`

```js
{
  provider: "youtube" | "facebook",
  title: "Channel video title",
  videoUrl: "https://www.youtube.com/watch?v=...",
  thumbnail: "https://i.ytimg.com/vi/.../hqdefault.jpg",
  sourceUrl: "https://...",
  publishedAt: Timestamp,
  active: true
}
```

### Other collections

- `tickers`: multilingual `title`, `category`, `priority`, `active`, `publishedAt`.
- `liveStreams`: `title`, `videoUrl`, `provider`, `isLive`, `active`, `updatedAt`.
- `polls`: `question`, `options`, `active`, and optional vote totals.
- `polls/{pollId}/votes/{uid}`: one vote document per authenticated identity.
- `subscribers`: `email`, `createdAt`, `active`; public users can create but cannot read.
- `externalSources`: source definitions for the worker; superadmin-only browser access.
- `users`: one document per Firebase Authentication UID with a `role` string.

`reels` is reserved for future media support. The current public page focuses on articles, tickers, live streams, videos, and polls.

## Security rules and operational safety

- Firestore Rules are the actual authorization boundary; the hidden admin URL is not.
- Keep service-account JSON and API tokens outside `public_html`.
- Keep each worker credential limited to the client's project and rotate it if exposed.
- Use separate Firebase accounts for each staff member.
- Remove a staff user's role document and disable the Authentication user when access must be revoked.
- Do not give ordinary editors Firebase project-owner access.
- Add Firebase App Check and abuse controls before promoting public newsletter, poll, or chat features.
- Do not expose Facebook Page access tokens or YouTube API keys in browser code.
- Confirm rights to every feed, article summary, image, thumbnail, video, and embed.
- Export/back up Firestore data before major rules or schema changes.
- Monitor worker logs, stale feed timestamps, Firebase quotas, and broken external images.

## Troubleshooting

### Homepage is blank

Check the browser Console and Network tab, then verify:

1. `firebase-config.js` has the correct project.
2. Firestore exists and contains `articles` documents.
3. Articles have `status: "published"`.
4. Firestore Rules allow public reads for published articles.
5. The required `where(status) + orderBy(publishedAt)` index exists.
6. The page is opened over HTTP/HTTPS, not `file://`.

### News is not automatically updating

The browser does not fetch and publish arbitrary news by itself. Confirm the PHP worker ran successfully. Check the cron log, run `sync.php` manually, confirm the worker config has active RSS sources, and inspect Firestore for changed `updatedAt` values.

### Worker says zero items

Check the feed URL, network access, PHP cURL/SimpleXML extensions, source `active` values, XML validity, duplicate source keys, and worker diagnostics. A feed can be online in a browser while still being rejected by the server because of TLS, redirects, rate limits, or a malformed response.

### Images are missing

Check the stored `image` field, open the image URL directly, inspect browser Network errors, and remember that some publishers block hotlinking. The fallback is intentional. For permanent images, obtain rights and design a separate Firebase Storage/CDN retention workflow.

### Admin login fails

Check Email/Password is enabled, the email/password is correct, the deployed domain is in Firebase Authentication's authorized domains, and the account is not disabled. If login succeeds but access is denied, verify the exact UID-matching `users/{uid}` document and role string.

### Admin list cannot load

Check that the user has a valid role and that the latest Firestore Rules are deployed. The admin list reads staff-visible collections; it does not require Firebase Console access.

### Facebook data does not appear

Facebook Page API access requires a valid Page ID, Page access token, current Graph API permissions, and a client-owned/authorized Page. Personal profiles, private groups, and arbitrary post scraping are not supported by this architecture.

### YouTube live status is missing

Public channel RSS can provide recent uploads. Reliable current-live discovery requires the private YouTube Data API key and a configured channel ID. The key belongs only in the worker config.

## What remains a deliberate external/configuration decision

- Feed licensing, attribution, takedown, and retention policy.
- YouTube API quota and Facebook/Meta token renewal.
- Newsletter double opt-in, unsubscribe handling, consent records, and email delivery provider.
- High-integrity server-side poll aggregation for large audiences.
- Realtime Database chat implementation, moderation, and abuse controls.
- Per-article SEO pages/social cards; the migration currently provides homepage SEO metadata, sitemap, and admin noindex protection.
- Full accessibility, device, browser, load, backup, and disaster-recovery testing.

This folder is a deployable migration foundation, but production operation still needs the client's credentials, rights decisions, monitoring, and editorial process.
