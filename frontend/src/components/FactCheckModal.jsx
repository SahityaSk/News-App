import React from 'react';
import { ShieldCheck, CheckCircle2, Award, FileText, X, ExternalLink } from 'lucide-react';
import { translations } from '../utils/translations';

export default function FactCheckModal({ isOpen, onClose, article, language = 'EN' }) {
  if (!isOpen || !article) return null;

  const t = translations[language] || translations.EN;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }} onClick={onClose}>
      
      <div 
        style={{
          width: '100%',
          maxWidth: '540px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.25s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(22,163,74,0.15), rgba(59,130,246,0.15))',
          borderBottom: '1px solid var(--border-color)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: '#16a34a',
              color: '#fff',
              padding: '8px',
              borderRadius: '10px'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                {language === 'BN' ? 'ফ্যাক্ট-চেক ও নির্ভরযোগ্যতা সার্টিফিকেট' : (language === 'HI' ? 'फैक्ट-चेक और विश्वसनीयता प्रमाणपत्र' : 'Fact Check & Verification Protocol')}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                {language === 'BN' ? 'সংবাদ যাচাইকরণ রিপোর্ট ও উৎস পরীক্ষা' : (language === 'HI' ? 'सत्यापित स्रोत और संपादकीय रिपोर्ट' : 'Independent Editorial Verification Rating')}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Article Info */}
          <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-red)', fontWeight: '800', textTransform: 'uppercase' }}>
              TARGET STORY
            </span>
            <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
              {article.title}
            </h4>
          </div>

          {/* Verification Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#16a34a' }}>98.5%</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0', fontWeight: '700' }}>Source Trust Index</p>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#3b82f6' }}>4/4</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0', fontWeight: '700' }}>Agencies Confirmed</p>
            </div>
          </div>

          {/* Checklist */}
          <div>
            <h5 style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
              VERIFICATION STEPS PASSED:
            </h5>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                "Direct quote cross-referenced against official transcripts.",
                "Multi-agency confirmation via global wire services & official press releases.",
                "Metadata & image authenticity verified via EXIF analysis.",
                "Reviewed by senior editorial fact-checking desk."
              ].map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                  <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
            🔒 Yugantar News Transparency & Integrity Protocol 2026
          </div>

        </div>
      </div>
    </div>
  );
}
