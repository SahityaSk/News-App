# 📌 YUGANTAR News Live Portal — Progress & Development Context Log

> **Note for AI Agents**: This file serves as the single source of truth for ongoing development, architecture context, completed work, git state, and future scope. Update this file whenever meaningful progress is made or new requirements are introduced.

---

## 📅 Current Session Metadata
- **Last Updated**: 2026-09-14
- **Active Git Branch**: `arnab`
- **Remote Branch Tracking**: `origin/arnab`
- **Connected MongoDB Cluster**: MongoDB Atlas Cloud (`yugantar_news`)

---

## 🏗️ Project Overview

**YUGANTAR News** is an enterprise multi-lingual (English, Bengali, Hindi) real-time live news portal built with **React 19 + Vite 8** on the frontend, **Express.js + Socket.io** on the backend, and **MongoDB Mongoose ORM** for persistent cloud data storage.

### Key Capabilities & Security Architecture
- **Clean Enterprise Public UI**: Zero visible admin buttons or editorial controls in the public layout for standard visitors.
- **Secure Route & Hotkey Admin Portal**: Editorial CMS accessible via dedicated URL path (`/admin` or `#admin`) or staff key combination (`Ctrl + Shift + A` / `Cmd + Shift + A`).
- **Multi-lingual Support**: EN, BN, HI dynamic switching across all feeds and UI components.
- **Unlimited Free Live News Ingestion (RSS Engine)**: Automated background cron worker (`backend/workers/newsIngestor.js`) periodically ingests feeds from top wire services (PTI, ANI, NDTV, Jugantor, ABP Bengali) directly into MongoDB.
- **Real-Time WebSocket Push Engine**: Bi-directional Socket.io connection (`http://localhost:5000`) for instant breaking news marquee updates and live stream URL switches without browser refresh.
- **Editorial CMS & Admin Desk (`/admin`)**: Authentication, JWT security, article editor with multi-lingual tabs, live marquee ticker controller, live TV broadcast manager, and newsletter subscribers log.

---

## 📁 Repository Structure & Key Components

```
News-App/
├── backend/                        # Express API + Socket.io Server (Port 5000)
│   ├── config/
│   │   └── db.js                   # Mongoose MongoDB Atlas connection setup
│   ├── data/
│   │   └── newsData.js             # Local multi-lingual dataset fallbacks
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
│   │   │   ├── AdminCMS.jsx           # Editorial CMS & Admin Desk Modal
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

1. **MongoDB Atlas Live Connection & Cloud Seeding**: Connected Mongoose to `cluster0.fzumrfy.mongodb.net/yugantar_news` and seeded all initial collections (`admin@yugantar.com` / `admin123`).
2. **Enterprise Admin Security Refactoring**: Completely removed the public `Admin CMS` button from [`Header.jsx`](file:///d:/Work/News-App/frontend/src/components/Header.jsx) to ensure 100% professional public reader privacy.
3. **Secure Admin Route & Shortcut Engine**: Configured [`App.jsx`](file:///d:/Work/News-App/frontend/src/App.jsx) to listen for `/admin` or `#admin` URL paths, or editorial staff hotkey `Ctrl + Shift + A`.
4. **Automated Free RSS Wire Worker**: Running live ingestion every 15 minutes from PTI Wire, ANI Video, NDTV, and ABP Live Bengali.
5. **Socket.io WebSockets Engine**: Bi-directional real-time alert engine active.

---

## 🔑 Admin Access Methods (For Internal Staff Only)

- **Method 1 (URL Path)**: Navigate to `http://localhost:5173/admin` or `http://localhost:5173/#admin`.
- **Method 2 (Keyboard Shortcut)**: Press `Ctrl + Shift + A` (or `Cmd + Shift + A` on Mac) anywhere on the page.
- **Login Credentials**: `admin@yugantar.com` / `admin123`
