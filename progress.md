# 📌 YUGANTAR News Live Portal — Progress & Development Context Log

> **Note for AI Agents**: This file serves as the single source of truth for ongoing development, architecture context, completed work, git state, and future scope. Update this file whenever meaningful progress is made or new requirements are introduced.

---

## 📅 Current Session Metadata
- **Last Updated**: 2026-09-15
- **Active Git Branch**: `arnab`
- **Remote Branch Tracking**: `origin/arnab`
- **Connected MongoDB Cluster**: MongoDB Atlas Cloud (`yugantar_news`)

---

## 🏗️ Project Overview

**YUGANTAR News** is a production-targeted multilingual (English, Bengali, Hindi) real-time news portal prototype built with **React 19 + Vite 8** on the frontend, **Express.js + Socket.io** on the backend, and **MongoDB/Mongoose** for persistent cloud data storage.

### Key Capabilities & Security Architecture
- **Clean Enterprise Public UI**: Zero visible admin buttons or editorial controls in the public layout for standard visitors.
- **Development Admin Access**: Current editorial CMS is now served on a separate `/admin` page; the public keyboard shortcut/toggle has been removed. Secure production sessions and the full newsroom console remain pending.
- **Multi-lingual Support**: EN, BN, HI dynamic switching across all feeds and UI components.
- **Configured RSS Ingestion (development stage)**: Automated background cron worker (`backend/workers/newsIngestor.js`) ingests configured feeds into MongoDB; source rights, provenance, health monitoring, and editorial moderation remain to be completed.
- **Real-Time WebSocket Push Engine**: Bi-directional Socket.io connection (`http://localhost:5000`) for instant breaking news marquee updates and live stream URL switches without browser refresh.
- **Embedded Editorial CMS (`/admin`)**: Current development surface for authentication, basic article/ticker/live/reel management, and subscriber viewing; a separate secure newsroom console is still pending.

---

## 📁 Repository Structure & Key Components

```
News-App/
├── backend/                        # Express API + Socket.io Server (Port 5000)
│   ├── config/
│   │   └── db.js                   # Mongoose MongoDB Atlas connection setup
│   ├── data/                       # Reserved for future import/seed data
│   ├── models/                     # Mongoose Schemas
│   │   ├── Admin.js                # Editorial user schema (bcrypt hash)
│   │   ├── Article.js              # Multi-lingual article schema
│   │   ├── BreakingTicker.js       # Live marquee ticker schema
│   │   ├── LiveStream.js           # Live TV broadcast stream schema
│   │   ├── Poll.js                 # Opinion poll schema
│   │   ├── Reel.js                 # Video shorts & reels schema
│   │   └── Subscriber.js           # Newsletter subscribers schema
│   ├── routes/
│   │   ├── admin.js                # Editorial Desk CRUD API routes
│   │   ├── api.js                  # Public REST API endpoints
│   │   └── auth.js                 # JWT Authentication routes
│   ├── workers/
│   │   └── newsIngestor.js         # RSS Ingestion Cron Worker (PTI/ANI/NDTV/ABP)
│   ├── .env                        # Live MongoDB Atlas credentials
│   ├── package.json
│   ├── seed.js                     # Database Seeder script
│   └── server.js                   # Express + Socket.io server entry point
│
├── frontend/                       # Vite 8 + React 19 Client Application (Port 5173)
│   ├── src/
│   │   ├── components/             # Specialized UI Components
│   │   │   ├── AdminCMS.jsx           # Current `/admin` Editorial Desk page component
│   │   │   ├── AiDigestModal.jsx      # Executive AI summary modal
│   │   │   ├── ArticleModal.jsx       # Deep-dive article view & TTS preview
│   │   │   ├── BreakingTicker.jsx     # Top breaking news marquee
│   │   │   ├── FactCheckModal.jsx     # Verification & rating modal
│   │   │   ├── FloatingAudioPlayer.jsx# Persistent bottom radio stream bar
│   │   │   ├── Footer.jsx             # Footer & newsletter form
│   │   │   ├── Header.jsx             # Market ticker, clock, search & clean layout
│   │   │   ├── HeroLiveNews.jsx       # Main headline feature component
│   │   │   ├── LiveStreamModal.jsx    # Live TV broadcast modal & chat
│   │   │   ├── Navbar.jsx             # Category navbar & Live TV trigger
│   │   │   ├── NewsGrid.jsx           # Categorized articles & trending sidebar
│   │   │   ├── PollAndTopicRadar.jsx  # Opinion poll & hashtag cloud
│   │   │   ├── PopularRecentRotator.jsx# Auto-rotating article card carousel
│   │   │   ├── SavedArticlesDrawer.jsx# Bookmarking drawer (localStorage)
│   │   │   └── VideoReels.jsx         # Short vertical news video reels
│   │   ├── services/
│   │   │   └── api.js              # Fetch service layer calling backend endpoints
│   │   ├── utils/
│   │   │   └── translations.js     # Dictionary mapping for EN, BN, HI
│   │   ├── App.jsx                 # Root component, Socket.io client & secure route manager
│   │   ├── App.css                 # Layout styles
│   │   └── index.css               # Design system & dark/light theme tokens
│   ├── package.json
│   └── vite.config.js
│
├── README.md                       # Main project documentation
└── progress.md                     # AI Agent handover & progress log (THIS FILE)
```

---

## ⚡ Work Completed So Far

1. **MongoDB Atlas Live Connection & Cloud Seeding**: Connected Mongoose to the configured Atlas `yugantar_news` database and seeded the initial development collections. Default credentials must be rotated before staging or production.
2. **Enterprise Admin Security Refactoring**: Completely removed the public `Admin CMS` button from [`Header.jsx`](file:///d:/Work/News-App/frontend/src/components/Header.jsx) to ensure 100% professional public reader privacy.
3. **Separate Development Admin Page**: Configured [`main.jsx`](file:///d:/Work/News-App/frontend/src/main.jsx) to render the editorial surface only at `/admin`; removed the public hash/keyboard shortcut toggle. A fuller protected newsroom console remains in the backlog.
4. **Automated Free RSS Wire Worker**: Running live ingestion every 15 minutes from PTI Wire, ANI Video, NDTV, and ABP Live Bengali.
5. **Socket.io WebSockets Engine**: Bi-directional real-time alert engine active.

---

## 🔑 Admin Access (Development Only)

- Navigate directly to `http://localhost:5173/admin`.
- A development seed account currently exists, but its password must be rotated and removed from documentation before any staging or production deployment.

---

## 🧭 Pending Work Backlog

This backlog records the remaining work identified during the project handoff review. Items are grouped by priority; completed work should be checked off here as development continues.

### P0 — Production security boundary and separate admin console

- [x] Replace the embedded `AdminCMS` modal entry point with a separately routed `/admin` application shell that has its own page layout and deep link.
- [x] Remove the public keyboard shortcut and public-page toggle that revealed or toggled administration; use the explicit `/admin` entry point only.
- [ ] Code-split the admin bundle and add a dedicated production admin host/route boundary if the deployment architecture requires it.
- [ ] Design the admin information architecture around separate modules: newsroom dashboard, articles, drafts/review queue, scheduled publishing, breaking ticker, live channels, video/reels, media library, polls, newsletter/subscribers, users/roles, audit log, site settings, SEO, and system health.
- [x] Add server-enforced role checks for the current article, ticker, live-stream, reel, and subscriber mutations; reporter accounts can no longer perform editor/superadmin actions.
- [ ] Complete and test the full newsroom RBAC matrix, including user management, approvals, settings, audit access, and reporter draft-only permissions.
- [ ] Replace the current `localStorage` JWT approach with a documented secure session design: short-lived access sessions, rotated/revocable refresh sessions, `HttpOnly`/`Secure`/appropriate `SameSite` cookies, idle timeout, logout-all-sessions, and session/device visibility.
- [ ] Add MFA for privileged accounts, password reset and recovery, email verification, password policy, login throttling/lockout, suspicious-login alerts, and optional SSO for the client newsroom.
- [x] Remove the fallback JWT secret and default credential values from runtime/UI code paths; the API now fails to start without `JWT_SECRET`, and seed credentials come from environment variables.
- [x] Add strict CORS origin allowlists, security headers/Helmet, a Content Security Policy, JSON body-size limits, and safe generic error responses.
- [ ] Add CSRF protection for the future cookie-authenticated session design, request timeouts, and complete content-type/request validation.
- [x] Add baseline rate limits to the API, login endpoint, and Socket.io chat messages.
- [ ] Extend abuse controls to newsletter signup, poll voting, search, media actions, and every admin mutation with endpoint-specific policies.
- [ ] Create an immutable audit log for login, failed login, publish, edit, schedule, archive, delete, ticker push, stream changes, reel changes, user/role changes, and settings changes, including actor, timestamp, IP/device metadata, before/after summary, and correlation ID.
- [ ] Add admin confirmation/undo safeguards, optimistic concurrency/version checks, soft-delete/recycle-bin support, and approval requirements for high-risk operations.
- [ ] Add an admin preview mode that renders draft stories exactly as the public site will show them without publishing them.

### P0 — Newsroom workflow and content trust

- [ ] Expand the article model for production publishing: slug, canonical URL, deck, body blocks, byline(s), desk, location, tags, language completeness, source/provenance, rights status, scheduled time, embargo, correction note, revision history, and publication events.
- [ ] Implement a real draft → edit → fact-check → copy-edit → approve → schedule/publish → update/correct/archive workflow with ownership and handoff states.
- [ ] Add article revision history, comparison, rollback, correction notices, takedown records, and a public corrections page.
- [ ] Enforce one deterministic active hero per edition/language and make featured, breaking, trending, and scheduled selections explicit rather than relying on an arbitrary `findOne` result.
- [ ] Build a source registry for RSS/API feeds with license/terms, attribution text, language, category mapping, polling interval, health status, last successful fetch, failure count, and kill switch.
- [ ] Fix ingestion provenance: do not label an NDTV feed as PTI, do not label an ABP feed as Jugantor, and do not copy source-language text into all language fields while implying translation.
- [ ] Replace random fallback images and random view counts with verified media fallbacks and real analytics. Label unavailable metrics as unavailable.
- [ ] Add deterministic feed deduplication using canonical URL/guid/content fingerprint, stale-item expiry, retries with backoff, dead-letter/error reporting, and protection against repeated ticker creation.
- [ ] Add moderation queues for imported stories, unsafe/malformed media, copyright complaints, takedown requests, and suspected duplicate/misleading content.
- [ ] Define the editorial rights policy for article text, images, video, live embeds, thumbnails, fonts, logos, RSS feeds, and third-party APIs; store rights/attribution metadata with each asset.

### P1 — Public product depth inspired by the reference publishers

- [ ] Refine information architecture into Latest, National, State/Regional, District/Local, World, Business, Markets, Sports, Entertainment, Tech, Science, Opinion, Explainers, Video, Live TV, Photos/Gallery, Web Stories, Podcasts, and Jobs/Services where the client wants those verticals.
- [ ] Add dedicated section landing pages with lead story, latest stream, most-read/trending, related coverage, live updates, author/source information, and pagination.
- [ ] Add dedicated video taxonomy and archive: national/state/topic filters, video source, duration, transcript/captions, rights, related stories, playlists/shows, and a reliable player state.
- [ ] Add a first-class Live TV page with multiple configured channels, channel schedules, stream health, provider attribution, fallback behaviour, and per-channel admin controls instead of one hardcoded channel.
- [ ] Add photo galleries, web stories, podcasts/audio episodes, explainers, and service utilities only when the client has a content/operations plan for them.
- [ ] Add localisation features beyond a language switch: language completeness indicators, editorial translation workflow, region/district selection, location-aware sections, and correct Bengali/Hindi typography and date/time formatting.
- [ ] Add transparent source cards, reporter/byline pages, fact-check methodology, correction history, “why this matters” explainers, and related coverage to build reader trust.
- [ ] Add authenticated reader accounts only if needed: synced bookmarks, reading history, newsletter preferences, notification topics, saved searches, and privacy controls. Keep anonymous reading functional.
- [ ] Replace the fake chat/viewer activity with real moderated chat or remove the feature. Viewer counts must come from a real measurement source or be omitted.
- [ ] Wire polls to public APIs with one-vote policy, abuse protection, atomic counters, result disclosure, expiry, moderation, and audit history.

### P1 — SEO, discoverability, accessibility, and performance

- [ ] Introduce stable public article/category/video URLs and a formal SEO layer: canonical URLs, metadata per language, Open Graph, Twitter cards, JSON-LD NewsArticle/Breadcrumb/VideoObject, sitemap index, robots policy, RSS/Atom feeds, and 404/410 handling.
- [ ] Decide whether the public site should use SSR/SSG/prerendering or a Vite-compatible rendering layer so crawlers and social previews receive article content without depending on client JavaScript.
- [ ] Add Core Web Vitals budgets, CDN caching, compression, cache-control/ETag, API response caching, image resizing/format negotiation, lazy loading, preconnect, code splitting, and route-level bundles.
- [ ] Add keyboard navigation, focus trapping, Escape-to-close, reduced-motion support, screen-reader semantics, visible focus states, captions/transcripts, contrast checks, language metadata, and automated accessibility testing.
- [ ] Test mobile/tablet/desktop layouts for every public and admin surface, including slow networks, offline/error states, long Bengali/Hindi headlines, and narrow screens.
- [ ] Add reliable loading, empty, stale, retry, and degraded-mode states for every feed, live stream, market/weather provider, search, newsletter, poll, and admin request.
- [ ] Add stale-response cancellation and request identity checks so rapid search/language/category changes cannot render old results over new ones.

### P1 — Data, API, and media engineering

- [ ] Move search filtering into MongoDB or a dedicated search index, add pagination/cursors, stable sort order, faceting, typo tolerance, and indexed category/status/published/source fields.
- [ ] Version the API (`/api/v1`), define OpenAPI/JSON schemas, standardize error envelopes, validate all request bodies/query/path values, and add request IDs.
- [ ] Replace hardcoded localhost URLs with environment configuration and a single typed API client with timeouts, cancellation, retries only where safe, and response validation.
- [ ] Add real HLS playback with `hls.js` where required, media-type detection, provider allowlists, embed restrictions, stream health checks, reconnect/backoff, captions, poster images, and a clearly labelled unavailable state.
- [ ] Add a managed media library backed by object storage/CDN with upload quotas, MIME/signature validation, virus scanning, image/video transformations, signed URLs where appropriate, replacement/deletion rules, and rights metadata.
- [ ] Add data retention, export, deletion, and backup policies for subscribers, staff accounts, audit logs, analytics, chat, and imported content.
- [ ] Replace static market/weather values with server-side provider adapters, freshness timestamps, attribution, fallback states, and provider health monitoring.

### P1 — Security, privacy, and compliance hardening

- [ ] Add centralized input validation/sanitization for article text, source URLs, media URLs, embeds, search, email, ticker content, chat, and all admin payloads.
- [ ] Add XSS/HTML sanitization policy for rich article content, safe link handling, iframe allowlists, SSRF protections for server-side URL fetching, and upload/content scanning.
- [ ] Add dependency audit/update policy, lockfile review, secret scanning, static analysis, container/image scanning if containerized, and a documented vulnerability response process.
- [ ] Add privacy policy, cookie/consent policy, newsletter double opt-in, unsubscribe/preferences, data export/deletion, retention limits, and regional legal review before launch.
- [ ] Add staff security policy: least privilege, account ownership, offboarding, credential rotation, device/session review, incident response, backups, and recovery drills.

### P2 — Testing, observability, and operations

- [ ] Add unit, integration, API contract, authentication/RBAC, RSS normalization, deduplication, media validation, poll, search, and React interaction tests.
- [ ] Add browser end-to-end tests for public reading, language switching, search, save/share, live TV, reels, newsletter, poll, login, editorial publish/review/schedule, and permission boundaries.
- [ ] Add CI for clean install, lint, type/schema checks, tests, build, dependency audit, migration checks, and environment validation.
- [ ] Add structured JSON logs, request correlation IDs, error tracking, metrics, feed/provider dashboards, Socket.io connection metrics, uptime monitoring, alerting, and redacted diagnostics.
- [x] Add `/health` and `/ready` endpoints covering process and MongoDB readiness without exposing secrets.
- [ ] Extend readiness checks to RSS worker state, media providers, and required production configuration.
- [ ] Define staging and production environments, deployment manifests, migrations, rollback strategy, CDN/DNS/TLS configuration, backups, restore testing, and disaster-recovery objectives.
- [ ] Add a root-level development command/process manager configuration for frontend and backend, plus documented Node/npm versions and reproducible installation steps.

### P0 — Make the current system reliable

- [x] Install backend/frontend dependencies and run the frontend production build and Oxlint; lint completes with existing warnings that still need cleanup.
- [ ] Start both services and perform an end-to-end smoke test for public pages, API fallback mode, MongoDB mode, admin login, article publishing, ticker publishing, live-stream updates, and newsletter subscription.
- [ ] Add proper frontend loading, empty, and error states when the backend or MongoDB is unavailable.
- [ ] Add request cancellation or stale-response protection to the React data-loading effects.
- [x] Replace frontend hardcoded service URLs with `VITE_API_BASE_URL` and `VITE_SOCKET_URL` configuration, retaining localhost only as a development default.
- [x] Configure allowlisted CORS origins instead of allowing `origin: '*'`; production now requires `CORS_ORIGINS`.

### P1 — Fix functional inconsistencies

- [ ] Decide whether `opinion` is a supported category. If yes, add it to the Article schema, fallback data, admin category input, API filtering, and translations. If no, remove it from the navbar and translations.
- [ ] Wire the public poll component to the `Poll` model with APIs for fetching the active poll and submitting a vote.
- [ ] Add server-side vote validation, duplicate-vote protection/rate limiting, atomic vote increments, and real result counts.
- [ ] Connect `LiveStreamModal` to Socket.io for real chat messages instead of only local mock messages.
- [ ] Add chat validation, message length limits, rate limiting, and a clear anonymous-user policy on the backend.
- [ ] Make the selected live channel and stream metadata come from the backend instead of mixing database data with hardcoded demo channels.
- [ ] Make admin article editing complete: load an article into the form, update it, support full article content, and expose draft/published/archived status.
- [ ] Add admin controls for editing/deactivating ticker items and managing live-stream status instead of only creating/deleting some records.
- [ ] Add admin role/permission checks so reporter/editor/superadmin roles are enforced rather than only authenticated.
- [ ] Add a proper logout/session-expiry path when JWT validation fails.

### P1 — Correct data and API behavior

- [ ] Move search filtering into the MongoDB query instead of limiting to 30 records before filtering, so matching older articles are not hidden.
- [ ] Add pagination or cursor-based loading for articles, tickers, and admin lists.
- [ ] Add stable indexes for article status/category/published date, ticker active/priority, and subscriber email.
- [ ] Normalize and validate RSS article IDs, URLs, dates, images, categories, and feed content before upserting.
- [ ] Prevent RSS ingestion from creating duplicate or misleading breaking tickers on every feed cycle.
- [ ] Review multilingual RSS behavior: currently the same source-language text is copied into EN, BN, and HI fields rather than translated.
- [ ] Replace static weather/market values with a clearly configured provider or label them explicitly as demo data.
- [ ] Add missing public endpoints for polls and, if required, live-stream metadata/chat history.
- [ ] Return consistent API error shapes and log backend failures with enough context for debugging.

### P1 — Security and production hardening

- [ ] Move all secrets and default credentials out of source/UI documentation and rotate the current JWT/database credentials before deployment.
- [ ] Require a production `JWT_SECRET`; do not use the fallback secret in deployed environments.
- [ ] Add rate limiting and brute-force protection to admin login, newsletter subscription, poll voting, and chat.
- [ ] Validate and sanitize admin article/ticker/live-stream payloads on the server; do not trust client-provided fields.
- [ ] Restrict admin mutations by role and audit who published, edited, or deleted content.
- [ ] Configure secure headers, request size limits, HTTPS deployment, and production logging.
- [ ] Validate/allowlist external media URLs and RSS sources to reduce unsafe embeds and malformed content.
- [ ] Add a privacy/consent policy for newsletter subscribers and define unsubscribe functionality.

### P2 — UX, accessibility, and maintainability

- [ ] Add keyboard focus management, Escape-to-close behavior, focus trapping, and accessible labels to all modals/drawers.
- [ ] Verify mobile layouts for the header, navbar, news grid, live stream modal, admin CMS, reels, and footer.
- [ ] Replace repeated inline styles with reusable CSS classes/design tokens where practical.
- [ ] Complete translation coverage for remaining hardcoded English UI strings, including admin, poll, live chat, and status messages.
- [ ] Add reliable bookmark synchronization and handle article ID changes from database/RSS records.
- [ ] Improve video error handling, autoplay/mute behavior, and support for actual HLS streams if required.
- [ ] Add image lazy loading, responsive image sizes, fallback images, and alt-text rules.
- [ ] Remove unused imports and run Oxlint cleanly.
- [ ] Add automated tests for API routes, authentication, RSS normalization, article filtering, and key React interactions.
- [ ] Add CI checks for install, lint, build, tests, and environment validation.

### P2 — Deployment and operations

- [ ] Add separate development/staging/production environment examples and document required variables.
- [ ] Add a root-level development command or documented process manager configuration to run frontend and backend together.
- [ ] Add health/readiness endpoints for the API, database, RSS worker, and Socket.io service.
- [ ] Make RSS ingestion observable with feed-level success/failure metrics and retry/backoff behavior.
- [ ] Decide on deployment targets for frontend, backend, MongoDB, scheduled ingestion, and media hosting.
- [ ] Add backup/restore and database migration/seed guidance before production use.

### Product decisions to confirm later

- [ ] Decide whether this remains a demo/news prototype or becomes a production newsroom platform.
- [ ] Choose the authoritative source for articles: MongoDB editorial content, RSS ingestion, or a hybrid workflow.
- [ ] Decide which live video provider and licensing model will be used; current public videos are demo assets.
- [ ] Decide whether AI Digest and fact-checking remain UI demonstrations or should use real services and source citations.
- [ ] Define editorial workflow requirements: approvals, revisions, scheduled publishing, breaking-news escalation, and audit history.
- [ ] Define analytics requirements for views, saves, poll votes, newsletter conversions, and live viewers.

---

## 📅 2026-09-15 — Codex Handoff

### Completed in this Codex session

- Added `backend/config/media.js` with temporary live-stream configuration, demo-media detection, YouTube detection, and stream-type inference.
- Added admin-protected Reel APIs: `GET/POST/DELETE /api/admin/reels`.
- Added an Editorial Desk Reels tab so an administrator can manually publish a reel title, video URL, thumbnail, category, duration, and source agency.
- Updated Live TV admin saving so manually entered URLs are stored in MongoDB and broadcast to public clients through the existing Socket.io refresh path.
- Updated the live player to render YouTube URLs in an iframe and direct MP4/HLS URLs in a video element. Invalid/demo media now shows an unavailable state instead of playing a fallback clip.
- Removed Bunny/flower demo channels from `LiveStreamModal.jsx`.
- Added YouTube thumbnail derivation for reel URLs when no thumbnail is entered.
- Updated `seed.js` so it no longer recreates the demo article, ticker, or reel collections. It now removes only known legacy demo IDs and configures a temporary ABP Ananda live stream.
- Added `backend/cleanupDemoContent.js` and the `npm run cleanup-demo` command for a safe one-time MongoDB cleanup of known demo IDs.
- Changed public API fallback behavior so it returns no fabricated articles, tickers, or reels when the database has no real content. A temporary live hero stream remains available.
- Deleted the unused `backend/data/newsData.js` legacy fallback dataset so fabricated articles and demo Bunny media are no longer kept in the repository.

### Temporary live stream

- Current temporary source: official ABP Ananda Bengali live-player embed:
  `https://cdn.abplive.com/LiveStreams/260118/abpananda/streaming_bengali_vidgyor-new-nov2022.html`
- This is temporary only. The admin can replace it from `/admin` → `Live TV Broadcast` as soon as the client provides an authorized stream URL.
- External live streams can stop, become unavailable, or disallow embedding. The player now shows an unavailable message instead of falling back to demo footage.

### Free API findings

- The empty `NEWS_API_KEY` and `GNEWS_API_KEY` variables are not live-video keys.
- NewsAPI has a free developer plan for development/testing, limited to 100 requests/day and delayed articles; it is not suitable as a production real-time live-news feed.
- GNews has a free development/testing tier with 100 requests/day and a 12-hour delay; it also does not provide live video streams.
- YouTube Data API has a default daily quota and can discover video/live metadata, but it does not provide a free licensed live-news video feed. A channel’s official embeddable stream or the client’s own stream is still required.
- The current RSS worker remains the best no-key option for article ingestion, subject to each source’s terms and attribution requirements.

### Remaining work for the next agent

- Install dependencies and run frontend build/lint; the current local npm command is misconfigured and `node_modules` are absent.
- Confirm the deleted legacy fallback dataset is not restored by future merges or seed scripts.
- Add HLS playback support with `hls.js` if the client later supplies `.m3u8` streams and Chrome playback is required.
- Add admin editing/update support for existing reels and stronger URL/licensing validation before production deployment.

---

## 📅 2026-09-15 — Codex Follow-up

### Completed in this follow-up

- Fixed the top utility/market panel so the date, actions, theme switch, NIFTY, SENSEX, NASDAQ, BTC, and weather values wrap inside the viewport instead of creating a horizontal scrollbar.
- Restarted the backend with the updated media configuration and verified the live API response.
- Replaced the unavailable legacy YouTube live URL with the official ABP Ananda player URL:
  `https://cdn.abplive.com/LiveStreams/260118/abpananda/streaming_bengali_vidgyor-new-nov2022.html`
- Verified the browser player loads the ABP live-player iframe and no longer shows YouTube's “This video is unavailable” error or Bunny/flower fallback footage.
- Ran the authorized MongoDB cleanup from the `backend` directory: removed 6 known dummy articles, 5 dummy tickers, and 2 dummy reels. RSS articles/tickers were preserved.
- Rechecked the public APIs: the hero is now an RSS article with the temporary ABP stream, breaking news contains RSS items only, and `/api/reels` is empty until real reels are added by an administrator.

### Current handoff for Antigravity

- The top-panel and live-video fixes are implemented and browser-verified.
- Admin can enter a client-owned YouTube, HLS, MP4, or supported embed URL through the Live TV Broadcast form; admin can also create/delete reels through the Reels tab.
- Do not reintroduce `backend/data/newsData.js`, Bunny/flower media URLs, or the removed demo IDs.
- The local frontend build/lint still needs to be run after repairing the npm installation; this environment currently has a broken npm launcher and missing dependencies.
- MongoDB cleanup is complete for the known legacy IDs. If new dummy content appears later, inspect the record IDs/source before deleting anything.

---

## 📅 2026-09-15 — Codex Professional Readiness Audit

### Review scope

- Studied the complete current repository: backend models, authentication, public/admin routes, RSS worker, seed/cleanup scripts, frontend state/loading, public components, media handling, styling, package scripts, and environment boundaries.
- Compared the product direction against [Jugantor](https://www.jugantor.com/), [PTI](https://www.ptinews.com/), [ANI Videos](https://www.aninews.in/videos/national/), [ABP Bengali](https://bengali.abplive.com/), [NDTV Live TV](https://www.ndtv.com/livetv-ndtv24x7), [NDTV](https://www.ndtv.com/), and [Bartaman Patrika](https://bartamanpatrika.com/).

### Main findings added to the backlog

- The initial AdminCMS was a modal inside the public React app; the P0 tranche has moved it to `/admin`. It still needs a dedicated production shell with MFA, secure sessions, audit history, approvals, preview, scheduling, media management, user management, settings, and system health.
- The P0 tranche removed the public shortcut, fallback JWT secret, UI default credentials, wildcard CORS, and missing baseline headers/rate limits. Existing database credentials still require rotation, and `localStorage` sessions/CSRF/MFA remain open risks.
- The current content model is too small for a real newsroom: it lacks slugs, revisions, corrections, source/rights metadata, workflow states, schedules, deterministic hero selection, and proper byline/desk/location/tag data.
- RSS ingestion needs source-label verification, licensing/provenance records, deduplication, feed health, retry/backoff, moderation, language policy, and removal of random images/view counts.
- The public product needs stronger section architecture and discoverability: regional/district pages, latest/most-read/trending, dedicated video/live pages, galleries, web stories, podcasts, explainers, source cards, correction history, and credible fact-check presentation where operationally supported.
- SEO, SSR/prerendering, structured metadata, accessibility, mobile QA, Core Web Vitals, caching/CDN, API versioning, validation, typed contracts, tests, observability, backups, and deployment automation are still required.

### Decision recorded

The project should be presented to the client as a professional newsroom platform in development, not as production-secure software yet. Future implementation should follow the new P0 sequence in this file: security boundary and admin console first, then newsroom trust/workflow, then public product depth, SEO/accessibility/performance, and finally testing/operations hardening.

---

## 📅 2026-09-15 — Codex P0 Security/Admin Tranche

### Completed

- Added Helmet security headers and a Content Security Policy with explicit live-media frame/connect allowlists.
- Replaced wildcard CORS with `CORS_ORIGINS`; production startup now requires an explicit origin configuration.
- Added global API rate limiting, login rate limiting, JSON body-size limits, generic API error responses, and basic Socket.io chat throttling/length limits.
- Added `/health` and database-aware `/ready` endpoints.
- Added `requireRole()` and enforced editor/superadmin permissions on current article, ticker, live-stream, and reel mutations; subscriber access is superadmin-only.
- Removed the fallback JWT secret. The API now fails fast when `JWT_SECRET` is missing.
- Removed default login values from the UI and changed seeding to require `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` environment variables.
- Added `backend/.env.example` and `frontend/.env.example` so deployment configuration is explicit and secrets are not copied into source.
- Moved administration to a separate `/admin` page entry point and removed the public keyboard shortcut/admin toggle from the public app.
- Moved frontend API and Socket.io URLs to Vite environment variables with localhost-only development defaults.
- Installed the new backend dependencies and verified backend syntax, frontend production build, and Oxlint execution. Oxlint still reports existing warnings but no blocking errors.

### Still open from this tranche

- Secure cookie/refresh-session migration, CSRF, MFA, password reset, account lockout, full endpoint-specific abuse controls, audit logs, code splitting, and the full newsroom RBAC matrix remain pending.
- The existing development database account must be rotated before staging/production; no credential rotation was performed automatically.
