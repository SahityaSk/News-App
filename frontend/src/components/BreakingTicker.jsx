import React, { useState, useEffect } from 'react';
import { AlertCircle, Pause, Play, ChevronRight, ChevronLeft, RefreshCw, Repeat } from 'lucide-react';
import { translations } from '../utils/translations';

export default function BreakingTicker({ items = [], onSelectNews, language }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [viewMode, setViewMode] = useState('rotate'); // 'rotate' (item-by-item slide) or 'marquee' (continuous ticker)
  const t = translations[language] || translations.EN;

  // Auto-rotate every 4 seconds when in 'rotate' mode and not paused
  useEffect(() => {
    if (!items || items.length === 0 || isPaused || viewMode !== 'rotate') return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [items, isPaused, viewMode]);

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex] || items[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.45rem 0',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        {/* Animated Glowing Red Breaking Badge */}
        <div style={{
          background: 'var(--accent-red)',
          color: '#ffffff',
          fontFamily: 'var(--font-heading)',
          fontWeight: '800',
          fontSize: '0.75rem',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          letterSpacing: '0.5px',
          whiteSpace: 'nowrap',
          boxShadow: 'var(--shadow-red)',
          flexShrink: 0
        }}>
          <span className="live-dot" style={{ width: '7px', height: '7px', background: '#fff' }}></span>
          <AlertCircle size={14} />
          <span>{t.breakingBadge}</span>
          <span style={{ fontSize: '0.65rem', background: 'rgba(0,0,0,0.25)', padding: '1px 5px', borderRadius: '3px', fontWeight: '900' }}>
            {currentIndex + 1}/{items.length}
          </span>
        </div>

        {/* Rotator Content Area */}
        <div 
          style={{ flexGrow: 1, overflow: 'hidden', position: 'relative' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {viewMode === 'rotate' ? (
            /* Item-by-Item Slide Rotator */
            <div 
              key={currentItem.id || currentIndex}
              onClick={() => onSelectNews && onSelectNews(currentItem)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                fontSize: '0.88rem',
                color: 'var(--text-primary)',
                fontWeight: '600',
                animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
              }}
            >
              <span style={{ 
                background: 'var(--accent-red-light)', 
                color: 'var(--accent-red)', 
                fontSize: '0.68rem', 
                fontWeight: '900', 
                padding: '2px 7px', 
                borderRadius: '4px',
                textTransform: 'uppercase',
                flexShrink: 0
              }}>
                {currentItem.category || 'LIVE'}
              </span>

              <span style={{ fontFamily: 'var(--font-body)', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentItem.text}
              </span>

              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', flexShrink: 0 }}>
                • {currentItem.time}
              </span>

              <ChevronRight size={14} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
            </div>
          ) : (
            /* Continuous Marquee Ticker */
            <div 
              className="animate-marquee"
              style={{
                animationPlayState: isPaused ? 'paused' : 'running',
                gap: '2.5rem',
                alignItems: 'center'
              }}
            >
              {[...items, ...items].map((item, idx) => (
                <div 
                  key={`${item.id}-${idx}`}
                  onClick={() => onSelectNews && onSelectNews(item)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)',
                    fontWeight: '500'
                  }}
                >
                  <span style={{ 
                    background: 'var(--accent-red-light)', 
                    color: 'var(--accent-red)', 
                    fontSize: '0.68rem', 
                    fontWeight: '800', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {item.category || 'LIVE'}
                  </span>

                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: '600' }}>
                    {item.text}
                  </span>

                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    • {item.time}
                  </span>
                  
                  <ChevronRight size={13} style={{ color: 'var(--accent-red)', opacity: 0.7 }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticker Controls: Prev, Play/Pause, Next, Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          
          {viewMode === 'rotate' && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Previous News"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '3px 5px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Previous Breaking Item"
              >
                <ChevronLeft size={14} />
              </button>

              <button
                onClick={handleNext}
                aria-label="Next News"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '3px 5px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Next Breaking Item"
              >
                <ChevronRight size={14} />
              </button>
            </>
          )}

          <button
            onClick={() => setIsPaused(!isPaused)}
            aria-label={isPaused ? "Play Ticker" : "Pause Ticker"}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '3px 6px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title={isPaused ? "Resume Rotation" : "Pause Rotation"}
          >
            {isPaused ? <Play size={13} /> : <Pause size={13} />}
          </button>

          <button
            onClick={() => setViewMode(prev => prev === 'rotate' ? 'marquee' : 'rotate')}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: viewMode === 'marquee' ? 'var(--accent-red)' : 'var(--text-secondary)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
              fontWeight: '700'
            }}
            title={viewMode === 'rotate' ? "Switch to Continuous Marquee" : "Switch to Slide Rotator"}
          >
            <Repeat size={12} />
            <span>{viewMode === 'rotate' ? 'Carousel' : 'Marquee'}</span>
          </button>

        </div>

      </div>
    </div>
  );
}
