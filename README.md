# 📰 YUGANTAR News Live Portal

> **YUGANTAR News** is a modern, high-performance, multi-lingual live news portal featuring real-time breaking news tickers, video reels, interactive article reading, live stream broadcasting, weather & financial market widgets, and instant topic filtering.

---

## ✨ Features

- **🌐 Multi-Lingual Support**: Seamless context-based language switching across **English (EN)**, **Bengali (BN)**, and **Hindi (HI)**.
- **⚡ Real-Time Ticker & Market Data**: Dynamic breaking news ticker and live weather & stock market indicators (NIFTY 50, SENSEX, NASDAQ, BTC/USD, etc.).
- **🔥 Live Hero Feature**: Featured headline coverage with live audio/video player toggle, updates feed, and engagement metrics.
- **📺 Interactive Live Stream Modal**: Ultra-responsive live news broadcast player modal with resolution switching, live user chat feed, and volume/mute controls.
- **🎥 Shorts / Video Reels**: Vertical news video reel feed with play/pause, volume control, like/share toggles, and metadata.
- **📰 Categorized News Feed**: Filter by categories (**World**, **Tech**, **Business**, **Sports**, **Entertainment**, **Science**) with live search functionality.
- **📖 Rich Article Reader Modal**: Deep-dive article view with font scaling, text-to-speech narration preview, estimated read time, bookmarking, and social share actions.
- **📬 Newsletter Subscription**: Integrated subscription endpoint with validation and status alerts.
- **🎨 Modern Dark Design System**: Glassmorphic UI elements, vibrant accent glows, sleek typography, and responsive CSS layouts.

---

## 🛠️ Tech Stack & Tooling

### Frontend Architecture & Tooling
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/) with `@vitejs/plugin-react` (powered by [Oxc](https://oxc.rs))
- **Linter & Code Quality**: [Oxlint](https://oxc-project.github.io/) (`.oxlintrc.json`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Modern Vanilla CSS Design System (Custom properties, CSS Grid/Flexbox, Glassmorphism)
- **React Compiler Note**: Optional integration supported; not enabled by default to optimize dev HMR performance.

### Backend Architecture
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express 4](https://expressjs.com/)
- **Middleware**: `cors`, `express.json()`
- **Architecture**: Modular REST API with parameterized language & filtering middleware

---

## 📁 Project Architecture

```
News/
├── backend/                  # Node.js Express REST API
│   ├── data/                 # Mock database & news datasets (EN, BN, HI)
│   │   └── newsData.js
│   ├── routes/               # API route definitions
│   │   └── api.js
│   ├── package.json
│   └── server.js             # Express server entry point (Port 5000)
│
├── frontend/                 # Vite + React 19 Client Application
│   ├── src/
│   │   ├── components/       # UI Components
│   │   │   ├── ArticleModal.jsx     # Full-screen article modal
│   │   │   ├── BreakingTicker.jsx   # Top breaking news ticker
│   │   │   ├── Footer.jsx           # Global footer & newsletter box
│   │   │   ├── Header.jsx           # Utility bar, language picker & weather/stocks
│   │   │   ├── HeroLiveNews.jsx     # Main featured headline & stream launcher
│   │   │   ├── LiveStreamModal.jsx  # Live TV broadcast modal
│   │   │   ├── Navbar.jsx           # Category navigation bar & live search
│   │   │   ├── NewsGrid.jsx         # Main news grid & category views
│   │   │   └── VideoReels.jsx       # Short video reels feed
│   │   ├── services/
│   │   │   └── api.js        # Axios/Fetch integration service layer
│   │   ├── App.jsx           # Main React component & state management
│   │   ├── App.css           # App-specific layout styles
│   │   └── index.css         # Global design system & theme variables
│   ├── package.json
│   ├── vite.config.js
│   └── .oxlintrc.json        # Oxlint configuration
│
└── README.md                 # Single unified project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (v9+ recommended)

---

### 1. Start the Backend Server

Navigate to the `backend` directory, install dependencies, and launch the API server:

```bash
cd backend
npm install
npm run dev
```

The Express server will start at: **`http://localhost:5000`**

---

### 2. Start the Frontend Application

Open a new terminal window, navigate to the `frontend` directory, install dependencies, and start Vite dev server:

```bash
cd frontend
npm install
npm run dev
```

The React frontend will be available at: **`http://localhost:5173`** (or the port shown in your terminal).

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

| Endpoint | Method | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `/` | `GET` | None | Returns backend status & service endpoint directory. |
| `/api/breaking` | `GET` | `lang=EN\|BN\|HI` | Fetches active breaking news ticker items. |
| `/api/hero` | `GET` | `lang=EN\|BN\|HI` | Fetches main featured live news story details. |
| `/api/news` | `GET` | `lang=EN\|BN\|HI`, `category`, `search` | Returns articles list with optional category & keyword filtering. |
| `/api/reels` | `GET` | `lang=EN\|BN\|HI` | Fetches video short reels list. |
| `/api/weather-stocks` | `GET` | None | Returns live weather data and stock market indices. |
| `/api/subscribe` | `POST` | Body: `{ "email": "user@example.com" }` | Subscribes an email to breaking news alerts. |

---

## 📜 Available Scripts & Tooling

### Backend (`/backend`)
- `npm run dev` / `npm start`: Runs `server.js` using Node.js on port 5000.

### Frontend (`/frontend`)
- `npm run dev`: Starts Vite local development server with Fast Refresh (HMR).
- `npm run build`: Bundles the application for production deployment into `/dist`.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs [Oxlint](https://oxc-project.github.io/) code analysis based on `.oxlintrc.json`.

---

## 📄 License

This project is open-source under the MIT License.
