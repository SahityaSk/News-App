import React, { useState, useEffect } from 'react';
import { Sun, Moon, Search, Globe, TrendingUp, TrendingDown, CloudSun, Clock } from 'lucide-react';
import { translations } from '../utils/translations';

export default function Header({ theme, toggleTheme, searchQuery, setSearchQuery, weatherStocks, language, onLanguageChange }) {
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
      {/* Top Utility Bar - STRICT SINGLE LINE ON FULLSCREEN */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', padding: '0.4rem 0', fontSize: '0.78rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          
          {/* Date & Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <Clock size={13} style={{ color: 'var(--accent-red)' }} />
            <span>{currentDateTime || 'Sat, Sep 12, 2026 | 03:45 PM IST'}</span>
          </div>

          {/* Market & Weather Ticker Bar */}
          {weatherStocks && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'nowrap', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {weatherStocks.stocks?.slice(0, 3).map((stock, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{stock.symbol}:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{stock.value}</span>
                  <span style={{ 
                    color: stock.positive ? '#16a34a' : '#dc2626', 
                    display: 'flex', 
                    alignItems: 'center',
                    fontSize: '0.72rem' 
                  }}>
                    {stock.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {stock.change}
                  </span>
                </div>
              ))}
              
              {weatherStocks.weather && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderLeft: '1px solid var(--border-color)', paddingLeft: '10px', color: 'var(--text-secondary)' }}>
                  <CloudSun size={14} style={{ color: 'var(--accent-gold)' }} />
                  <span>{weatherStocks.weather.temp}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({weatherStocks.weather.city})</span>
                </div>
              )}
            </div>
          )}

          {/* Language Selector & Theme Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, whiteSpace: 'nowrap' }}>
            
            {/* High Contrast Language Select Box */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 6px'
            }}>
              <Globe size={13} style={{ color: 'var(--accent-red)' }} />
              <select 
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                aria-label="Select Language"
                style={{ 
                  background: 'var(--bg-card)', 
                  color: 'var(--text-primary)', 
                  border: 'none', 
                  fontSize: '0.78rem', 
                  outline: 'none', 
                  cursor: 'pointer', 
                  fontWeight: '700',
                  padding: '2px 0'
                }}
              >
                <option value="EN" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>English</option>
                <option value="BN" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>বাংলা (Bengali)</option>
                <option value="HI" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>हिंदी (Hindi)</option>
              </select>
            </div>

            <button 
              onClick={toggleTheme} 
              aria-label="Toggle Theme"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: '700'
              }}
            >
              {theme === 'dark' ? <Sun size={13} style={{ color: '#f59e0b' }} /> : <Moon size={13} style={{ color: '#4f46e5' }} />}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Brand & Search Bar Header */}
      <div className="container" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--accent-red)',
            color: 'white',
            fontWeight: '900',
            fontFamily: 'var(--font-heading)',
            fontSize: '1.7rem',
            padding: '5px 12px',
            borderRadius: 'var(--radius-sm)',
            letterSpacing: '1.5px',
            boxShadow: 'var(--shadow-red)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>PULSE</span>
            <span style={{ fontSize: '0.75rem', background: '#ffffff', color: 'var(--accent-red)', padding: '2px 5px', borderRadius: '4px', fontWeight: '900' }}>LIVE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '1.05rem', letterSpacing: '0.5px', lineHeight: '1.1' }}>
              {t.brandTagline}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
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
