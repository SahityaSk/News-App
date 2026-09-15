import React from 'react';
import { Film, Play, Eye, Clock } from 'lucide-react';
import { translations } from '../utils/translations';

const getThumbnail = (reel) => {
  if (reel.thumbnail) return reel.thumbnail;
  const match = String(reel.videoUrl || '').match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^?&/]+)/i);
  return match ? `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg` : '';
};

export default function VideoReels({ reels = [], onPlayReel, language }) {
  const t = translations[language] || translations.EN;

  if (!reels || reels.length === 0) return null;

  return (
    <section style={{ padding: '2rem 0', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Film size={20} style={{ color: 'var(--accent-red)' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: '800', textTransform: 'uppercase' }}>
              {t.videoShorts}
            </h3>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {t.swipeForMore}
          </span>
        </div>

        {/* Video Reel Cards Slider Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.25rem'
        }}>
          {reels.map((reel) => (
            <div 
              key={reel.id}
              onClick={() => onPlayReel(reel)}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                aspectRatio: '16/10',
                background: '#000',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)',
                transition: 'transform 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <img 
                src={getThumbnail(reel)}
                alt={reel.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
              />

              {/* Play Overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                padding: '0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    background: 'var(--accent-red)',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {reel.category}
                  </span>

                  <span style={{
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={11} />
                    {reel.duration}
                  </span>
                </div>

                {/* PERFECTLY CENTERED PLAY CIRCLE ICON */}
                <div style={{
                  alignSelf: 'center',
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  minHeight: '44px',
                  borderRadius: '50%',
                  background: 'rgba(220, 38, 38, 0.95)',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 0 20px rgba(220, 38, 38, 0.7)',
                  margin: 'auto 0'
                }}>
                  <Play size={20} fill="#ffffff" style={{ display: 'block', color: '#ffffff' }} />
                </div>

                <div>
                  <h4 style={{ color: '#ffffff', fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: '700', lineHeight: '1.25' }}>
                    {reel.title}
                  </h4>
                  <span style={{ color: '#9ca3af', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Eye size={12} />
                    {reel.views} views
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
