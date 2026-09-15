import React, { useState } from 'react';
import { Tv, Menu, X as CloseIcon, Flame, Mail, Phone, MessageCircle } from 'lucide-react';
import { translations } from '../utils/translations';

const categoryKeys = ['all', 'national', 'world', 'business', 'tech', 'sports', 'entertainment', 'opinion'];

// Custom SVG Icons for Instagram, Facebook, and X (Twitter)
const InstagramIcon = ({ size = 15, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ size = 15, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const XIcon = ({ size = 13, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function Navbar({ activeCategory, setActiveCategory, onOpenLiveStream, language }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[language] || translations.EN;

  return (
    <nav className="sticky-nav">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.25rem', gap: '12px' }}>
        
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

        {/* Action Controls: Clickable Social Media Links & Live TV Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          
          {/* Clickable Social Media Icon Group */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            borderRight: '1px solid var(--border-color)', 
            paddingRight: '10px',
            marginRight: '2px'
          }} className="nav-social-group">
            
            {/* Instagram */}
            <a 
              href="https://instagram.com/yugantar.news" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Yugantar News Instagram"
              title="Instagram: @yugantar.news"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#e1306c';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#e1306c';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <InstagramIcon size={14} />
            </a>

            {/* Facebook */}
            <a 
              href="https://www.facebook.com/YugantarNewsLive" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Yugantar News Facebook"
              title="Facebook: YugantarNewsLive"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#1877f2';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#1877f2';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <FacebookIcon size={14} />
            </a>

            {/* X (Twitter) */}
            <a 
              href="https://x.com/yugantarnews" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Yugantar News X"
              title="X (Twitter): @yugantarnews"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#000000';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#000000';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <XIcon size={13} />
            </a>

            {/* Email */}
            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=office.yugantarnews@gmail.com" 
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Email Yugantar News"
              title="Email: office.yugantarnews@gmail.com"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#ea4335';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#ea4335';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <Mail size={14} />
            </a>

            {/* WhatsApp / Call */}
            <a 
              href="https://wa.me/918479084770" 
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Yugantar News"
              title="WhatsApp: +91 84790 84770"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#25d366';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#25d366';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <MessageCircle size={14} />
            </a>

          </div>

          {/* Live TV Action Button */}
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
            {mobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
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

          {/* Mobile Social Media Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
            <a href="https://instagram.com/yugantar.news" target="_blank" rel="noopener noreferrer" style={{ color: '#e1306c' }}><InstagramIcon size={20} /></a>
            <a href="https://www.facebook.com/YugantarNewsLive" target="_blank" rel="noopener noreferrer" style={{ color: '#1877f2' }}><FacebookIcon size={20} /></a>
            <a href="https://x.com/yugantarnews" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)' }}><XIcon size={18} /></a>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=office.yugantarnews@gmail.com" target="_blank" rel="noopener noreferrer" style={{ color: '#ea4335' }}><Mail size={20} /></a>
            <a href="https://wa.me/918479084770" target="_blank" rel="noopener noreferrer" style={{ color: '#25d366' }}><MessageCircle size={20} /></a>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .nav-social-group {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}
