import React, { useState, useEffect } from 'react';
import { Sun, Moon, Search, Globe, TrendingUp, TrendingDown, CloudSun, Clock, Sparkles, Bookmark } from 'lucide-react';
import { translations } from '../utils/translations';

const compactButtonStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-primary)',
  padding: '3px 7px',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '0.72rem',
  fontWeight: '700',
  whiteSpace: 'nowrap'
};

const selectStyle = {
  background: 'var(--bg-card)',
  color: 'var(--text-primary)',
  border: 'none',
  fontSize: '0.72rem',
  outline: 'none',
  cursor: 'pointer',
  fontWeight: '700'
};

export default function Header({ 
  theme, 
  toggleTheme, 
  searchQuery, 
  setSearchQuery, 
  weatherStocks, 
  language, 
  onLanguageChange,
  savedCount = 0,
  onOpenAiDigest,
  onOpenSavedDrawer,
  onOpenAdminCMS
}) {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const t = translations[language] || translations.EN;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      setCurrentDateTime(now.toLocaleDateString(language === 'BN' ? 'bn-IN' : (language === 'HI' ? 'hi-IN' : 'en-US'), options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  return (
    <header className="site-header" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-header)' }}>
      {/* Utility controls stay compact; only the market strip may scroll on small screens. */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
        <div className="container" style={{ minWidth: 0, paddingTop: '0.4rem', paddingBottom: '0.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontWeight: '600', minWidth: 0 }}>
              <Clock size={13} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentDateTime || 'Live clock'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
              <button onClick={onOpenAiDigest} aria-label="Open AI briefing" title="60-Second AI News Briefing" style={{ ...compactButtonStyle, borderColor: 'rgba(220,38,38,0.5)' }}>
                <Sparkles size={13} style={{ color: 'var(--accent-red)' }} /> <span>AI Briefing</span>
              </button>
              <button onClick={onOpenSavedDrawer} aria-label="Open saved articles" title="View saved articles" style={compactButtonStyle}>
                <Bookmark size={13} style={{ color: 'var(--accent-red)' }} /> <span>{savedCount > 0 ? `Saved (${savedCount})` : 'Saved'}</span>
              </button>
              <label style={compactButtonStyle}>
                <Globe size={13} style={{ color: 'var(--accent-red)' }} />
                <select value={language} onChange={(e) => onLanguageChange(e.target.value)} aria-label="Select Language" style={selectStyle}>
                  <option value="EN">EN</option><option value="BN">BN</option><option value="HI">HI</option>
                </select>
              </label>
              <button onClick={toggleTheme} aria-label="Toggle Theme" style={compactButtonStyle}>
                {theme === 'dark' ? <Sun size={13} style={{ color: '#f59e0b' }} /> : <Moon size={13} style={{ color: '#4f46e5' }} />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {weatherStocks && (
        <div style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
          <div className="container" style={{ minWidth: 0, paddingTop: '0.35rem', paddingBottom: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flexWrap: 'wrap', overflow: 'hidden', whiteSpace: 'normal', rowGap: '5px' }}>
              {weatherStocks.stocks?.map((stock, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', flex: '0 0 auto' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{stock.symbol}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{stock.value}</span>
                  <span style={{ color: stock.positive ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', fontSize: '0.72rem' }}>
                    {stock.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{stock.change}
                  </span>
                </div>
              ))}
              {weatherStocks.weather && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderLeft: '1px solid var(--border-color)', paddingLeft: '10px', color: 'var(--text-secondary)', flex: '0 0 auto' }}>
                  <CloudSun size={14} style={{ color: 'var(--accent-gold)' }} /><span>{weatherStocks.weather.temp}</span><span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({weatherStocks.weather.city})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Brand Header with Official YUGANTAR Logo */}
      <div className="container" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
        
        {/* Yugantar Official Logo Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => window.location.reload()}>
          
          {/* Official Yugantar Red Square Logo Image */}
          <div style={{
            width: '58px',
            height: '58px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 0 20px rgba(220, 38, 38, 0.45)',
            flexShrink: 0,
            background: '#dc2626',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="/yugantar-logo.jpg" 
              alt="YUGANTAR NEWS" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                fontFamily: 'var(--font-heading)', 
                fontWeight: '900', 
                fontSize: '1.65rem', 
                letterSpacing: '1px', 
                lineHeight: '1',
                color: 'var(--text-primary)' 
              }}>
                {t.brandName || "YUGANTAR NEWS"}
              </span>
              <span style={{ 
                fontSize: '0.72rem', 
                background: 'var(--accent-red)', 
                color: '#ffffff', 
                padding: '2px 7px', 
                borderRadius: '4px', 
                fontWeight: '900',
                letterSpacing: '0.5px' 
              }}>
                LIVE
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '3px' }}>
              {t.brandSubtitle}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.6rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
              transition: 'all 0.2s'
            }}
          />
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
