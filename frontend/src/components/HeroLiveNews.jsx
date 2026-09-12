import React from 'react';
import { Play, Radio, Clock, User, ArrowRight, Sparkles } from 'lucide-react';
import { translations } from '../utils/translations';

export default function HeroLiveNews({ heroData, onOpenLiveStream, onReadFullStory, language }) {
  const t = translations[language] || translations.EN;

  if (!heroData) return null;

  return (
    <section style={{ padding: '1.75rem 0', background: 'var(--bg-main)' }}>
      <div className="container">
        
        {/* Main 2-Column Hero Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '1.5rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)'
        }}>
          
          {/* Main Feature Coverage Column */}
          <div style={{ gridColumn: 'span 8', padding: '1.5rem', display: 'flex', flexDirection: 'column' }} className="hero-main-col">
            
            {/* Live Header Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
              <div className="live-badge" style={{ background: 'var(--accent-red)' }}>
                <span className="live-dot" style={{ background: '#fff' }}></span>
                <span>{heroData.badge || t.liveCoverageBadge}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} />
                  {heroData.timestamp}
                </span>
                <span>•</span>
                <span>{heroData.readTime}</span>
              </div>
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.85rem',
              fontWeight: '800',
              lineHeight: '1.25',
              color: 'var(--text-primary)',
              marginBottom: '1rem'
            }}>
              {heroData.title}
            </h1>

            {/* Video Poster Preview Banner */}
            <div 
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                marginBottom: '1.25rem',
                aspectRatio: '16/9',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)'
              }}
              onClick={onOpenLiveStream}
            >
              <img 
                src={heroData.image} 
                alt={heroData.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.03)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              />

              {/* Gradient Overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center'
              }}>
                {/* Glowing Play Broadcast Button */}
                <div style={{
                  background: 'rgba(220, 38, 38, 0.95)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  padding: '0.85rem 1.6rem',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 0 25px rgba(220,38,38,0.7)',
                  transform: 'scale(1)',
                  transition: 'transform 0.2s',
                  border: '2px solid rgba(255,255,255,0.4)'
                }}>
                  <Play size={20} fill="#ffffff" style={{ display: 'block', color: '#ffffff' }} />
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                    {t.watchLiveCoverage}
                  </span>
                </div>
              </div>

              {/* Corner Live TV tag */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0, 0, 0, 0.75)',
                color: '#fff',
                backdropFilter: 'blur(4px)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Radio size={14} style={{ color: '#ef4444' }} />
                <span>HD STREAM 1080P</span>
              </div>
            </div>

            {/* Summary & Author */}
            <p style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              marginBottom: '1.25rem'
            }}>
              {heroData.summary}
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              marginTop: 'auto',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                <User size={16} style={{ color: 'var(--accent-red)' }} />
                <span>{heroData.author}</span>
              </div>

              <button 
                onClick={() => onReadFullStory && onReadFullStory(heroData)}
                className="btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                <span>{t.readFullStory}</span>
                <ArrowRight size={15} />
              </button>
            </div>

          </div>

          {/* Key Developments Sidebar Column */}
          <div style={{
            gridColumn: 'span 4',
            background: 'var(--bg-secondary)',
            padding: '1.5rem',
            borderLeft: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column'
          }} className="hero-side-col">
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <Sparkles size={18} style={{ color: 'var(--accent-red)' }} />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                {t.keyDevelopments}
              </h3>
            </div>

            {/* Timeline Bullet Stream */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexGrow: 1 }}>
              {heroData.keyDevelopments?.map((item, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    position: 'relative',
                    paddingBottom: idx === heroData.keyDevelopments.length - 1 ? 0 : '0.85rem',
                    borderBottom: idx === heroData.keyDevelopments.length - 1 ? 'none' : '1px dashed var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4px' }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: idx === 0 ? 'var(--accent-red)' : 'var(--text-muted)',
                      boxShadow: idx === 0 ? '0 0 8px rgba(220,38,38,0.6)' : 'none'
                    }}></div>
                  </div>

                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--accent-red)', marginBottom: '2px', letterSpacing: '0.5px' }}>
                      {item.time}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: '1.4', fontWeight: '500' }}>
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Alert Subscribe Box */}
            <div style={{
              marginTop: '1.5rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {t.wantNotifications}
              </div>
              <button 
                onClick={onOpenLiveStream}
                className="btn-outline" 
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '6px 12px', marginTop: '6px' }}
              >
                {t.joinLiveChannel}
              </button>
            </div>

          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 992px) {
          .hero-main-col { grid-column: span 12 !important; }
          .hero-side-col { grid-column: span 12 !important; border-left: none !important; border-top: 1px solid var(--border-color) !important; }
        }
      `}</style>
    </section>
  );
}
