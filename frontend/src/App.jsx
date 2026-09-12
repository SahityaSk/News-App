import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import BreakingTicker from './components/BreakingTicker';
import HeroLiveNews from './components/HeroLiveNews';
import NewsGrid from './components/NewsGrid';
import VideoReels from './components/VideoReels';
import ArticleModal from './components/ArticleModal';
import LiveStreamModal from './components/LiveStreamModal';
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

  // Modal States
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [activeReelStream, setActiveReelStream] = useState(null);

  // Apply dark/light theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load Data whenever language changes
  useEffect(() => {
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

    loadAllData();
  }, [language]);

  // Fetch articles whenever activeCategory, searchQuery, or language changes
  useEffect(() => {
    const loadArticles = async () => {
      const newsRes = await fetchNewsArticles(activeCategory, searchQuery, language);
      setArticles(newsRes);
    };

    loadArticles();
  }, [activeCategory, searchQuery, language]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
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
      
      {/* 1. Header with Clock, Weather/Stocks, Language Switcher (Single Line), Theme Toggle & Search */}
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        weatherStocks={weatherStocks}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* 2. Glassmorphic Category Navbar with Live TV Action (Single Line) */}
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

        {/* 5. Categorized News Grid & Trending Top 5 Sidebar */}
        <NewsGrid 
          articles={articles}
          activeCategory={activeCategory}
          searchQuery={searchQuery}
          language={language}
          onSelectArticle={(art) => setSelectedArticle(art)}
        />

        {/* 6. Video Shorts & Reels Carousel */}
        {!searchQuery && (
          <VideoReels 
            reels={reels}
            language={language}
            onPlayReel={handlePlayReel}
          />
        )}

      </main>

      {/* 7. Footer */}
      <Footer 
        language={language}
        onOpenLiveStream={() => {
          setActiveReelStream(null);
          setIsLiveModalOpen(true);
        }}
      />

      {/* Interactive Article Reader Modal */}
      <ArticleModal 
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        language={language}
      />

      {/* Interactive Live Stream TV Modal */}
      <LiveStreamModal 
        isOpen={isLiveModalOpen}
        onClose={() => {
          setIsLiveModalOpen(false);
          setActiveReelStream(null);
        }}
        streamData={activeReelStream || heroNews}
      />

    </div>
  );
}
