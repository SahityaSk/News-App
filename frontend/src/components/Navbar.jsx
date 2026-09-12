import React, { useState } from 'react';
import { Tv, Menu, X, Flame } from 'lucide-react';
import { translations } from '../utils/translations';

const categoryKeys = ['all', 'national', 'world', 'business', 'tech', 'sports', 'entertainment', 'opinion'];

export default function Navbar({ activeCategory, setActiveCategory, onOpenLiveStream, language }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[language] || translations.EN;

  return (
    <nav className="sticky-nav">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.25rem' }}>
        
        {/* Desktop Category Navigation - SINGLE LINE NON-WRAPPING */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', overflowX: 'auto', padding: '0.5rem 0', scrollbarWidth: 'none', flexGrow: 1 }}>
          {categoryKeys.map((catKey) => {
            const isActive = activeCategory === catKey;
            const label = t.categories[catKey] || catKey;

            return (
              <button
                key={catKey}
                onClick={() => setActiveCategory(catKey)}
                style={{
                  background: isActive ? 'var(--accent-red)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-primary)',
                  border: 'none',
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: isActive ? '700' : '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  flexShrink: 0
                }}
              >
                {catKey === 'all' && <Flame size={14} style={{ color: isActive ? '#ffffff' : 'var(--accent-red)' }} />}
                {label}
              </button>
            );
          })}
        </div>

        {/* Action Controls: Live TV Stream Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: '10px' }}>
          <button
            onClick={onOpenLiveStream}
            className="btn-primary"
            style={{
              padding: '0.4rem 0.9rem',
              fontSize: '0.82rem',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
              boxShadow: '0 0 12px rgba(220,38,38,0.4)',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <span className="live-dot" style={{ width: '7px', height: '7px', background: '#fff' }}></span>
            <Tv size={14} />
            <span>{t.liveTvBtn}</span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '4px'
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-color)',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {categoryKeys.map((catKey) => (
            <button
              key={catKey}
              onClick={() => {
                setActiveCategory(catKey);
                setMobileMenuOpen(false);
              }}
              style={{
                background: activeCategory === catKey ? 'var(--accent-red-light)' : 'transparent',
                color: activeCategory === catKey ? 'var(--accent-red)' : 'var(--text-primary)',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'left',
                fontFamily: 'var(--font-heading)',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              {t.categories[catKey] || catKey}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}
