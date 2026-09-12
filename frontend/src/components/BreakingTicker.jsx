import React, { useState } from 'react';
import { AlertCircle, Pause, Play, ChevronRight } from 'lucide-react';
import { translations } from '../utils/translations';

export default function BreakingTicker({ items = [], onSelectNews, language }) {
  const [isPaused, setIsPaused] = useState(false);
  const t = translations[language] || translations.EN;

  if (!items || items.length === 0) return null;

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.5rem 0',
      overflow: 'hidden'
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
        </div>

        {/* Ticker Content Marquee */}
        <div 
          style={{ flexGrow: 1, overflow: 'hidden', position: 'relative' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
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
                  fontWeight: '500',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-red)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
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
        </div>

        {/* Play/Pause Control Toggle */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          aria-label={isPaused ? "Play Ticker" : "Pause Ticker"}
          style={{
            background: 'var(--bg-secondary)',
            border: 'none',
            color: 'var(--text-secondary)',
            padding: '4px 6px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0
          }}
        >
          {isPaused ? <Play size={13} /> : <Pause size={13} />}
        </button>

      </div>
    </div>
  );
}
