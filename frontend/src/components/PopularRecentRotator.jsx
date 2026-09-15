import React, { useState, useEffect } from 'react';
import { Flame, Clock, Eye, ChevronLeft, ChevronRight, Pause, Play, Sparkles, TrendingUp } from 'lucide-react';
import { translations } from '../utils/translations';

export default function PopularRecentRotator({ articles = [], onSelectArticle, language = 'EN' }) {
  const [startIndex, setStartIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const t = translations[language] || translations.EN;

  // Filter top popular & recent articles
  const popularArticles = articles && articles.length > 0 
    ? articles.slice(0, 8) 
    : [];

  const visibleCount = 3; // Show 3 cards at once on desktop

  useEffect(() => {
    if (!popularArticles.length || isPaused) return;

    const interval = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % popularArticles.length);
    }, 3800);

    return () => clearInterval(interval);
  }, [popularArticles.length, isPaused]);

  if (!popularArticles.length) return null;

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % popularArticles.length);
  };

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + popularArticles.length) % popularArticles.length);
  };

  // Get currently visible items (wrapping around circular array)
  const getVisibleItems = () => {
    const items = [];
    for (let i = 0; i < visibleCount; i++) {
      const idx = (startIndex + i) % popularArticles.length;
      items.push({ ...popularArticles[idx], originalIndex: idx });
    }
    return items;
  };

  const headingText = {
    EN: "POPULAR & RECENT BREAKING NEWS",
    BN: "জনপ্রিয় ও সাম্প্রতিক ব্রেকিং খবর",
    HI: "लोकप्रिय व ताज़ा ब्रेकिंग न्यूज़"
  };

  const subText = {
    EN: "Auto-rotating top stories & live trending headlines",
    BN: "স্বয়ংক্রিয়ভাবে ঘূর্ণায়মান দিনের শীর্ষ ও ট্রেন্ডিং খবর",
    HI: "स्वचालित रूप से प्रसारित मुख्य व ट्रेंडिंग समाचार"
  };

  return (
    <section className="container" style={{ margin: '1.25rem auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Top Header Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'var(--accent-red)',
              color: '#ffffff',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-red)'
            }}>
              <Flame size={18} />
            </div>

            <div>
              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: '800',
                margin: 0,
                color: 'var(--text-primary)',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {headingText[language] || headingText.EN}
                <span style={{
                  fontSize: '0.68rem',
                  background: '#16a34a',
                  color: '#fff',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  fontWeight: '800'
                }}>
                  LIVE ROTATOR
                </span>
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {subText[language] || subText.EN}
              </p>
            </div>
          </div>

          {/* Navigation Arrows & Play/Pause Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsPaused(!isPaused)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '5px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title={isPaused ? "Resume Auto-Rotation" : "Pause Auto-Rotation"}
            >
              {isPaused ? <Play size={13} fill="currentColor" /> : <Pause size={13} />}
              <span>{isPaused ? 'Play' : 'Pause'}</span>
            </button>

            <button
              onClick={handlePrev}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title="Previous Article Set"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={handleNext}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title="Next Article Set"
            >
              <ChevronRight size={16} />
            </button>
          </div>

        </div>

        {/* 3-Card Carousel Grid Container */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.25rem'
          }}
          className="popular-rotator-grid"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {getVisibleItems().map((article, i) => (
            <div
              key={`${article.id}-${i}`}
              onClick={() => onSelectArticle(article)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s',
                boxShadow: 'var(--shadow-sm)',
                animation: 'slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              {/* Card Image Banner */}
              <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                <img 
                  src={article.image} 
                  alt={article.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s'
                  }}
                />
                
                <span style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: 'var(--accent-red)',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontWeight: '900',
                  letterSpacing: '0.5px'
                }}>
                  {article.categoryLabel || article.category?.toUpperCase()}
                </span>

                <span style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  background: 'rgba(0,0,0,0.75)',
                  color: '#ffffff',
                  backdropFilter: 'blur(4px)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Eye size={11} style={{ color: 'var(--accent-gold)' }} />
                  {article.views || '45K'}
                </span>
              </div>

              {/* Card Body */}
              <div style={{ padding: '1rem', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    <span>{article.time}</span>
                    <span>• {article.author}</span>
                  </div>

                  <h4 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.92rem',
                    fontWeight: '700',
                    lineHeight: '1.4',
                    color: 'var(--text-primary)',
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {article.title}
                  </h4>
                </div>

                <div style={{
                  marginTop: '12px',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  fontSize: '0.78rem',
                  color: 'var(--accent-red)',
                  fontWeight: '800'
                }}>
                  <span>Read Full Story</span>
                  <ChevronRight size={14} />
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Carousel Pagination Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '1rem' }}>
          {popularArticles.map((_, dotIdx) => (
            <div
              key={dotIdx}
              onClick={() => setStartIndex(dotIdx)}
              style={{
                width: dotIdx === startIndex ? '20px' : '7px',
                height: '7px',
                borderRadius: '4px',
                background: dotIdx === startIndex ? 'var(--accent-red)' : 'var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .popular-rotator-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
