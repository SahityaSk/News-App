# YUGANTAR News

YUGANTAR News is a multilingual digital newsroom platform for English, Bengali, and Hindi publishing. It combines a public news portal, RSS-based wire ingestion, live-TV and short-video publishing, breaking-news delivery, search, newsletters, polls, fact-checking surfaces, and an editorial administration layer.

This repository is currently a working prototype moving toward production readiness. It should not be described as production-secure until the security, editorial workflow, testing, observability, deployment, and compliance items in [`progress.md`](progress.md) are completed.

## Product direction

The target product is a professional newsroom rather than a college-style content demo. The public experience should feel like a credible publisher: fast category navigation, clear source attribution, strong local and regional coverage, reliable live/video surfaces, accessible article reading, transparent corrections, and disciplined editorial control.

The reference publishers were reviewed for product patterns, not for copying their design or content:

| Benchmark | Patterns worth adopting |
| --- | --- |
| [Jugantor](https://www.jugantor.com/) | Category-first Bengali navigation, latest/most-read content, regional coverage, polls, and service-led sections. |
| [PTI](https://www.ptinews.com/) | Wire-service source authority, clear newsroom provenance, and professional information hierarchy. |
| [ANI Videos](https://www.aninews.in/videos/national/) | Dedicated video taxonomy and a newsroom-oriented video archive. |
| [ABP Bengali](https://bengali.abplive.com/) | Live TV, shorts, video, photo gallery, web stories, podcasts, shows, and utility content grouped under an exploration layer. |
| [NDTV Live TV](https://www.ndtv.com/livetv-ndtv24x7) | A dedicated live-TV destination with continuous coverage, programme/video discovery, and shareable playback. |
| [NDTV](https://www.ndtv.com/) | Strong latest-news hierarchy, section navigation, video/live integration, and broad editorial verticals. |
| [Bartaman Patrika](https://bartamanpatrika.com/) | West Bengal regional depth, district navigation, editorial sections, current-news strips, video, gallery, and specialised verticals. |

## Current capabilities

- English, Bengali, and Hindi UI/data fields.
- React public portal with responsive dark/light presentation.
- Breaking-news ticker and Socket.io push events.
- MongoDB/Mongoose persistence with RSS ingestion from configured feeds.
- Hero story, categorized article grid, search, popular/recent rotation, saved reading queue, newsletter signup, poll surface, fact-check surface, live-TV player, radio player, and video reels surface.
- Temporary official ABP Bengali live-player integration; client-owned/licensed streams can be entered from the current editorial screen.
- JWT-protected administrative APIs for articles, tickers, live stream configuration, reels, and subscriber viewing.
- A cleanup command for removing the known legacy demo records without clearing real editorial/RSS data.

## Current production-readiness position

| Area | Current state | Required before client launch |
| --- | --- | --- |
| Public UI | Strong prototype with many newsroom surfaces | Final information architecture, mobile QA, accessibility, SEO, performance, and real content validation. |
| Content | RSS ingestion plus basic manual publishing | Source licensing/provenance, deduplication, correction/version history, scheduling, moderation, and editorial approvals. |
| Video/live | URL-based embeds and direct media support | Licensed media policy, allowlisted providers, robust HLS playback, monitoring, fallback states, and per-channel management. |
| Administration | Separate `/admin` page with a current CMS component and basic server role checks | MFA, secure sessions, audit logs, complete newsroom workflow, media library, and operational controls. |
| Security | Basic JWT authentication and bcrypt password hashing | Production secret management, secure cookies/CSRF strategy, rate limits, headers/CSP, validation, logging, dependency scanning, and incident response. |
| Operations | Local Node processes and MongoDB Atlas | Staging/production environments, CI/CD, health checks, backups, observability, alerts, and a repeatable deployment process. |

## Architecture

```text
News-App/
├── backend/
│   ├── config/                 # MongoDB and media configuration
│   ├── models/                 # Admin, article, ticker, stream, poll, reel, subscriber schemas
│   ├── routes/                 # Public API, authentication, and current admin API routes
│   ├── workers/                # RSS ingestion worker
│   ├── cleanupDemoContent.js   # Safe cleanup of known legacy demo IDs
│   ├── seed.js                 # Development database setup; never use default credentials in production
│   └── server.js               # Express + Socket.io entry point
├── frontend/
│   ├── src/components/         # Public portal and current AdminCMS page component
│   ├── src/services/api.js     # Frontend API calls
│   ├── src/App.jsx             # Public app state and current admin launcher
│   └── vite.config.js
├── progress.md                 # Dated handoff log and production-readiness backlog
└── README.md
```

### Backend

- Node.js and Express REST API.
- Mongoose models backed by MongoDB Atlas.
- Socket.io for breaking-news, article, and live-stream update events.
- `rss-parser` and `node-cron` for periodic feed ingestion.
- `bcryptjs` for password hashing and `jsonwebtoken` for the current authentication mechanism.

### Frontend

- React 19 with Vite 8.
- Vanilla CSS/custom properties and responsive grid/flex layouts.
- Lucide icons.
- Public modules for articles, live TV, reels, saved articles, newsletters, polls, fact-checking, search, language switching, and theme switching.

## Important architecture limitations today

These are documented explicitly so no one mistakes the current prototype for a finished newsroom platform:

- The current `/admin` page is separated from the public page, but it still needs a production-grade admin shell, code splitting, workflow modules, auditability, and operational controls.
- The public keyboard shortcut/admin toggle has been removed; access still requires a stronger production session and account-security design.
- The fallback JWT secret and UI default credentials have been removed, but any existing development database account must be rotated before staging or production.
- Admin authorization authenticates users but does not yet enforce the `superadmin`, `editor`, and `reporter` roles on individual mutations.
- The current token is stored in `localStorage`; production should use a carefully designed secure session strategy.
- Login, newsletter subscription, poll voting, search, media actions, and many admin mutations still need endpoint-specific abuse controls.
- Frontend API and Socket.io URLs now use Vite environment variables; localhost remains only as a development default.
- CORS is now allowlisted and baseline Helmet/CSP protections are active, but CSRF, secure cookie sessions, MFA, and full request validation remain open.
- RSS data is copied into all three language fields rather than translated or clearly labelled as source-language content.
- The RSS worker uses source labels that need editorial verification, uses a random fallback image, and generates random view counts; these must never be presented as verified audience analytics.
- Search is performed after a limited MongoDB result set, so older matching stories can be missed.
- Poll data and live chat are not fully backed by public APIs; the current UI includes seeded/mock behaviour.
- Market and weather values are currently static presentation data, not a verified market/weather provider integration.
- Reels and live streams accept URLs but need stronger provider allowlists, copyright/licensing fields, metadata validation, and HLS support.
- The SPA needs a formal SEO strategy: canonical URLs, article routes, Open Graph/Twitter metadata, structured data, sitemap, robots policy, and ideally SSR/SSG or prerendering.

## Development setup

### Prerequisites

- Node.js 18+; use the version pinned by the deployment environment once one is selected.
- npm 9+.
- MongoDB Atlas or a local MongoDB instance.
- A backend `.env` file containing development-only values. Never commit `.env` or use development credentials in a deployed environment.

If you run the development seed script, provide `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in the backend environment first. The repository no longer contains a default administrator password.

### Backend

```bash
cd backend
npm install
npm run dev
```

The API runs on `http://localhost:5000` by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite development server runs on `http://localhost:5173` by default.

### Development data cleanup

From `backend/`, after verifying the configured MongoDB connection:

```bash
npm run cleanup-demo
```

This deletes only the known legacy demo article, ticker, and reel IDs. It does not clear the database and must not be treated as a production migration.

## Public API currently available

Base URL: `http://localhost:5000/api` in development. The production base URL must come from environment configuration.

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/breaking` | GET | Active breaking-news ticker items; supports `lang=EN\|BN\|HI`. |
| `/hero` | GET | Featured published story and active live-stream metadata. |
| `/news` | GET | Published stories with category/search/language filters. |
| `/reels` | GET | Public reel feed. |
| `/weather-stocks` | GET | Current placeholder market/weather payload; replace with verified providers. |
| `/subscribe` | POST | Newsletter subscription endpoint; needs double opt-in, abuse controls, unsubscribe, and consent records. |

Authentication and administrative endpoints currently live under `/api/auth/*` and `/api/admin/*`. They are implementation endpoints, not a final public contract; they need versioning, validation, RBAC, auditability, and production security before external use.

## Scripts

### Backend (`/backend`)

- `npm run dev` / `npm start` — start the Express server.
- `npm run cleanup-demo` — remove only the known legacy demo records.

### Frontend (`/frontend`)

- `npm run dev` — start Vite with HMR.
- `npm run build` — create a production bundle.
- `npm run preview` — preview the production bundle.
- `npm run lint` — run Oxlint.

## Editorial and security principles for launch

1. Every published story, image, video, and live stream must have a source, usage-rights status, attribution, and publication owner.
2. No user-controlled HTML should be rendered without sanitisation and a tested content policy.
3. Editorial mutations must be validated on the server and authorised by role; hiding a button is not authorisation.
4. A breaking-news action must be auditable, reversible, and attributable to a staff account.
5. A failed feed, video, market provider, or database connection must produce an honest user-facing state—not fabricated facts, random metrics, or demo footage.
6. Production credentials, JWT secrets, database URLs, API keys, and default passwords must never appear in source, documentation, browser storage, or client bundles.

## Delivery roadmap

The detailed, dated backlog is maintained in [`progress.md`](progress.md). The highest-value sequence is:

1. Repair/install tooling and establish repeatable tests.
2. Harden authentication, sessions, validation, headers, CORS, rate limits, logging, and secrets.
3. Build the separate secure admin console with newsroom workflow and audit history.
4. Formalise content provenance, rights, RSS ingestion, search, media, translations, and corrections.
5. Add SEO, accessibility, mobile QA, performance, analytics, monitoring, backups, and deployment automation.
6. Only then present the platform as production-ready to the client.

## License

The repository currently declares MIT licensing for the software. Before launch, confirm that the client owns or has licensed all editorial text, images, video, logos, fonts, feeds, and third-party embeds. A software license does not grant rights to republish publisher content.
