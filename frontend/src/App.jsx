import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

import Header from './components/Header';
import Navbar from './components/Navbar';
import BreakingTicker from './components/BreakingTicker';
import HeroLiveNews from './components/HeroLiveNews';
import PopularRecentRotator from './components/PopularRecentRotator';
import PollAndTopicRadar from './components/PollAndTopicRadar';
import NewsGrid from './components/NewsGrid';
import VideoReels from './components/VideoReels';
import ArticleModal from './components/ArticleModal';
import LiveStreamModal from './components/LiveStreamModal';
import AiDigestModal from './components/AiDigestModal';
import SavedArticlesDrawer from './components/SavedArticlesDrawer';
import FloatingAudioPlayer from './components/FloatingAudioPlayer';
import FactCheckModal from './components/FactCheckModal';
import Footer from './components/Footer';

import {
  fetchBreakingNews,
  fetchHeroNews,
  fetchNewsArticles,
  fetchWeatherStocks,
  fetchVideoReels
} from './services/api';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('EN'); // 'EN', 'BN', 'HI'
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data States
  const [breakingNews, setBreakingNews] = useState([]);
  const [heroNews, setHeroNews] = useState(null);
  const [articles, setArticles] = useState([]);
  const [weatherStocks, setWeatherStocks] = useState(null);
  const [reels, setReels] = useState([]);

  // Bookmarking State (Persisted in localStorage)
  const [savedArticles, setSavedArticles] = useState(() => {
    try {
      const stored = localStorage.getItem('saved_news_articles');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // Modal & Drawer States
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [activeReelStream, setActiveReelStream] = useState(null);
  const [isAiDigestOpen, setIsAiDigestOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [factCheckArticle, setFactCheckArticle] = useState(null);

  // Apply dark/light theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load Data whenever language changes
  const loadAllData = async () => {
    const [breakingRes, heroRes, wsRes, reelsRes] = await Promise.all([
      fetchBreakingNews(language),
      fetchHeroNews(language),
      fetchWeatherStocks(),
      fetchVideoReels(language)
    ]);

    setBreakingNews(breakingRes);
    setHeroNews(heroRes);
    setWeatherStocks(wsRes);
    setReels(reelsRes);
  };

  useEffect(() => {
    loadAllData();
  }, [language]);

  // Fetch articles whenever activeCategory, searchQuery, or language changes
  const loadArticles = async () => {
    const newsRes = await fetchNewsArticles(activeCategory, searchQuery, language);
    setArticles(newsRes);
  };

  useEffect(() => {
    loadArticles();
  }, [activeCategory, searchQuery, language]);

  // 🔌 Setup Socket.io WebSockets Client for Real-Time Push Alerts
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      reconnectionAttempts: 5,
      timeout: 5000
    });

    socket.on('connect', () => {
      console.log('⚡ [Socket.io Client] Connected to YUGANTAR Real-Time Server');
    });

    socket.on('breaking_ticker_push', (newTicker) => {
      console.log('⚡ [Socket.io Client] Breaking news push alert received:', newTicker);
      loadAllData();
    });

    socket.on('article_published', (newArticle) => {
      console.log('⚡ [Socket.io Client] New article broadcast received:', newArticle);
      loadArticles();
    });

    socket.on('live_stream_updated', (streamData) => {
      console.log('⚡ [Socket.io Client] Live TV stream update received:', streamData);
      loadAllData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleToggleSave = (article) => {
    setSavedArticles(prev => {
      const exists = prev.some(a => a.id === article.id);
      let updated;
      if (exists) {
        updated = prev.filter(a => a.id !== article.id);
      } else {
        updated = [...prev, article];
      }
      try {
        localStorage.setItem('saved_news_articles', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleSelectBreakingNews = (item) => {
    setIsLiveModalOpen(true);
  };

  const handlePlayReel = (reel) => {
    setActiveReelStream({
      title: reel.title,
      videoUrl: reel.videoUrl
    });
    setIsLiveModalOpen(true);
  };

  return (
    <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. Header with Clock, Weather/Stocks, Language Switcher, AI Digest, Bookmarks & Admin CMS Launcher */}
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        weatherStocks={weatherStocks}
        language={language}
        onLanguageChange={setLanguage}
        savedCount={savedArticles.length}
        onOpenAiDigest={() => setIsAiDigestOpen(true)}
        onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
      />

      {/* 2. Glassmorphic Category Navbar with Live TV Action */}
      <Navbar 
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        language={language}
        onOpenLiveStream={() => {
          setActiveReelStream(null);
          setIsLiveModalOpen(true);
        }}
      />

      {/* 3. Breaking News Marquee Ticker */}
      <BreakingTicker 
        items={breakingNews} 
        language={language}
        onSelectNews={handleSelectBreakingNews}
      />

      {/* Main Content Area */}
      <main style={{ flexGrow: 1 }}>
        
        {/* 4. Hero Featured Live Coverage (Only shown when not searching) */}
        {!searchQuery && activeCategory === 'all' && (
          <HeroLiveNews 
            heroData={heroNews}
            language={language}
            onOpenLiveStream={() => {
              setActiveReelStream(null);
              setIsLiveModalOpen(true);
            }}
            onReadFullStory={(story) => setSelectedArticle(story)}
          />
        )}

        {/* 5. 🔥 Auto-Rotating Small Article Cards Banner (Most Popular & Recent News) */}
        {!searchQuery && (
          <PopularRecentRotator 
            articles={articles}
            onSelectArticle={(art) => setSelectedArticle(art)}
            language={language}
          />
        )}

        {/* 6. Interactive Opinion Poll & Trending Topic Radar */}
        <PollAndTopicRadar 
          language={language}
          onSelectTag={(tag) => setSearchQuery(tag)}
          activeSearchQuery={searchQuery}
        />

        {/* 7. Categorized News Grid & Trending Top 5 Sidebar */}
        <NewsGrid 
          articles={articles}
          activeCategory={activeCategory}
          searchQuery={searchQuery}
          language={language}
          onSelectArticle={(art) => setSelectedArticle(art)}
          savedArticles={savedArticles}
          onToggleSave={handleToggleSave}
          onOpenFactCheck={(art) => setFactCheckArticle(art)}
        />

        {/* 8. Video Shorts & Reels Carousel */}
        {!searchQuery && (
          <VideoReels 
            reels={reels}
            language={language}
            onPlayReel={handlePlayReel}
          />
        )}

      </main>

      {/* 9. Footer */}
      <Footer 
        language={language}
        onOpenLiveStream={() => {
          setActiveReelStream(null);
          setIsLiveModalOpen(true);
        }}
      />

      {/* 10. Interactive Article Reader Modal */}
      <ArticleModal 
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        language={language}
      />

      {/* 11. Interactive Live Stream TV Modal */}
      <LiveStreamModal 
        isOpen={isLiveModalOpen}
        onClose={() => {
          setIsLiveModalOpen(false);
          setActiveReelStream(null);
        }}
        streamData={activeReelStream || heroNews}
      />

      {/* 12. ⚡ AI Quick Digest Executive Briefing Modal */}
      <AiDigestModal 
        isOpen={isAiDigestOpen}
        onClose={() => setIsAiDigestOpen(false)}
        language={language}
        articles={articles}
      />

      {/* 13. 🔖 Saved Reading Queue Drawer */}
      <SavedArticlesDrawer 
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedArticles={savedArticles}
        onRemoveArticle={(id) => handleToggleSave({ id })}
        onSelectArticle={(art) => setSelectedArticle(art)}
        language={language}
      />

      {/* 14. 📻 Persistent Bottom Floating Audio Radio Player */}
      <FloatingAudioPlayer 
        language={language}
        onOpenLiveStream={() => setIsLiveModalOpen(true)}
      />

      {/* 15. 🛡️ Fact-Check & Source Verification Modal */}
      <FactCheckModal 
        isOpen={!!factCheckArticle}
        onClose={() => setFactCheckArticle(null)}
        article={factCheckArticle}
        language={language}
      />

    </div>
  );
}
