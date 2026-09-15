import React, { useState } from 'react';
import { Send, Tv, Shield, Mail, Phone, Globe, MessageCircle } from 'lucide-react';
import { subscribeNewsletter } from '../services/api';
import { translations } from '../utils/translations';

// Custom SVG Icons for Instagram, Facebook, and X (Twitter)
const InstagramIcon = ({ size = 16, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ size = 16, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const XIcon = ({ size = 14, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

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

        {/* 5-Column Footer Sitemap Links & Contact Details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '2rem',
          marginBottom: '2.5rem'
        }}>
          
          {/* Col 1: About & Motto Tagline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--accent-red)', color: '#fff', fontWeight: '900', padding: '4px 10px', borderRadius: '4px' }}>
                YUGANTAR
              </div>
              <span style={{ fontWeight: '800', fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>
                LIVE NEWS
              </span>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '0.75rem' }}>
              {t.footer.aboutText}
            </p>

            <p style={{ fontSize: '0.82rem', color: 'var(--accent-gold)', fontWeight: '700', lineHeight: '1.5', fontStyle: 'italic' }}>
              "নিরপেক্ষ খবর, নির্ভীক সাংবাদিকতা। বাংলার খবর, দেশের খবর, বিশ্বের খবর। সত্যের সঙ্গে, মানুষের পাশে।"
            </p>

            <button onClick={onOpenLiveStream} className="btn-outline" style={{ marginTop: '1rem', fontSize: '0.8rem', padding: '6px 12px' }}>
              <Tv size={14} style={{ color: 'var(--accent-red)' }} />
              {t.liveTvBtn}
            </button>
          </div>

          {/* Col 2: Official Contact Details */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: '800', marginBottom: '1rem' }}>
              OFFICIAL DESK
            </h4>
            
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)', padding: 0, margin: 0 }}>
              <li>
                <a href="https://wa.me/918479084770" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                  <Phone size={15} style={{ color: '#25d366', flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap' }}>+91 84790 84770</span>
                </a>
              </li>

              <li>
                <a 
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=office.yugantarnews@gmail.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open Gmail compose for office.yugantarnews@gmail.com"
                  style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', wordBreak: 'break-all', transition: 'color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#ea4335'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                >
                  <Mail size={15} style={{ color: '#ea4335', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem' }}>office.yugantarnews@gmail.com</span>
                </a>
              </li>

              <li>
                <a href="https://yugantar.news" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                  <Globe size={15} style={{ color: '#3b82f6', flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap' }}>https://yugantar.news</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: News Sections */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: '800', marginBottom: '1rem' }}>
              NEWS SECTIONS
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)', padding: 0, margin: 0 }}>
              <li>{t.categories.all}</li>
              <li>{t.categories.national}</li>
              <li>{t.categories.world}</li>
              <li>{t.categories.business}</li>
              <li>{t.categories.tech}</li>
              <li>{t.categories.sports}</li>
            </ul>
          </div>

          {/* Col 4: Network & Global References */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: '800', marginBottom: '1rem' }}>
              NETWORK & REFERENCES
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)', padding: 0, margin: 0 }}>
              <li>Global Wire & International Desks</li>
              <li>Independent News Syndicates</li>
              <li>Yugantar Multilingual Edition (EN/BN/HI)</li>
              <li>Editorial Code of Ethics</li>
              <li>Fact-Checking & Integrity Policy</li>
              <li>Verification Protocol 2026</li>
            </ul>
          </div>

          {/* Col 5: Connect & Social Media Handles (STRICT SINGLE LINE BUTTONS) */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: '800', marginBottom: '1rem' }}>
              CONNECT WITH US
            </h4>
            
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Follow Yugantar News across official channels for 24/7 breaking updates.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Instagram Button */}
              <a 
                href="https://instagram.com/yugantar.news" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Instagram: @yugantar.news"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#e1306c'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <InstagramIcon size={15} style={{ color: '#e1306c', flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Instagram: @yugantar.news</span>
              </a>

              {/* Facebook Button */}
              <a 
                href="https://www.facebook.com/YugantarNewsLive" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Facebook: @YugantarNewsLive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#1877f2'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <FacebookIcon size={15} style={{ color: '#1877f2', flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Facebook: @YugantarNewsLive</span>
              </a>

              {/* X (Twitter) Button */}
              <a 
                href="https://x.com/yugantarnews" 
                target="_blank" 
                rel="noopener noreferrer"
                title="X / Twitter: @yugantarnews"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#000000'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <XIcon size={14} style={{ color: 'var(--text-primary)', flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>X: @yugantarnews</span>
              </a>

              {/* Email Button */}
              <a 
                href="https://mail.google.com/mail/?view=cm&fs=1&to=office.yugantarnews@gmail.com" 
                target="_blank"
                rel="noopener noreferrer"
                title="Email: office.yugantarnews@gmail.com"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#ea4335'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <Mail size={15} style={{ color: '#ea4335', flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>office.yugantarnews@gmail.com</span>
              </a>
            </div>
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
