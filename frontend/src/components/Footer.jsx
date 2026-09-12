import React, { useState } from 'react';
import { Send, Tv, Shield } from 'lucide-react';
import { subscribeNewsletter } from '../services/api';
import { translations } from '../utils/translations';

export default function Footer({ onOpenLiveStream, language }) {
  const [email, setEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const t = translations[language] || translations.EN;

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatusMsg('Please enter a valid email address.');
      return;
    }
    const res = await subscribeNewsletter(email);
    setStatusMsg(res.message);
    setEmail('');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  return (
    <footer style={{ background: 'var(--bg-header)', borderTop: '1px solid var(--border-color)', color: 'var(--text-primary)', paddingTop: '3rem', paddingBottom: '2rem' }}>
      <div className="container">
        
        {/* Top Newsletter & Brand Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '3rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div>
            <span className="live-badge" style={{ marginBottom: '8px' }}>
              INSTANT ALERTS
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '800', marginTop: '6px' }}>
              {t.footer.subscribeTitle}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {t.footer.subscribeDesc}
            </p>
          </div>

          <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px', maxWidth: '420px', width: '100%' }}>
            <input
              type="email"
              placeholder={t.footer.enterEmail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flexGrow: 1,
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-main)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
            <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
              <Send size={15} />
              <span>{t.footer.subscribeBtn}</span>
            </button>
          </form>
          {statusMsg && (
            <div style={{ width: '100%', fontSize: '0.85rem', color: 'var(--accent-red)', fontWeight: '600' }}>
              {statusMsg}
            </div>
          )}
        </div>

        {/* 4-Column Footer Sitemap Links */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2.5rem'
        }}>
          
          {/* Col 1: About */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--accent-red)', color: '#fff', fontWeight: '900', padding: '4px 10px', borderRadius: '4px' }}>
                PULSE
              </div>
              <span style={{ fontWeight: '800', fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>
                LIVE NEWS
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {t.footer.aboutText}
            </p>
            <button onClick={onOpenLiveStream} className="btn-outline" style={{ marginTop: '1rem', fontSize: '0.8rem', padding: '6px 12px' }}>
              <Tv size={14} style={{ color: 'var(--accent-red)' }} />
              {t.liveTvBtn}
            </button>
          </div>

          {/* Col 2: News Sections */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: '800', marginBottom: '1rem' }}>
              NEWS SECTIONS
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li>{t.categories.all}</li>
              <li>{t.categories.national}</li>
              <li>{t.categories.world}</li>
              <li>{t.categories.business}</li>
              <li>{t.categories.tech}</li>
            </ul>
          </div>

          {/* Col 3: Entertainment & Sports */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: '800', marginBottom: '1rem' }}>
              MORE COVERAGE
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li>{t.categories.sports}</li>
              <li>{t.categories.entertainment}</li>
              <li>{t.categories.opinion}</li>
              <li>{t.videoShorts}</li>
              <li>Weather & Market Indices</li>
            </ul>
          </div>

          {/* Col 4: Trust & Network */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: '800', marginBottom: '1rem' }}>
              OUR NETWORK
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li>ABP Ananda & NDTV Inspired UI</li>
              <li>PULSE Bangla & Hindi Edition</li>
              <li>Editorial Code of Ethics</li>
              <li>Fact-Checking Policy</li>
              <li>Contact Editorial Board</li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            {t.footer.copyright}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-red)' }}>
              <Shield size={14} /> Fact-Checked
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
