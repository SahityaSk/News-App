import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Bookmark, Share2, Clock, User, Eye, Check } from 'lucide-react';
import { translations } from '../utils/translations';

export default function ArticleModal({ article, isOpen, onClose, language }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const t = translations[language] || translations.EN;

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  if (!isOpen || !article) return null;

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech audio reader is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = `${article.title}. ${article.summary}. ${article.content}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = language === 'BN' ? 'bn-IN' : (language === 'HI' ? 'hi-IN' : 'en-US');
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '2rem', maxWidth: '850px' }}
      >
        {/* Top Action Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1rem'
        }}>
          <span style={{
            background: 'var(--accent-red)',
            color: '#ffffff',
            fontFamily: 'var(--font-heading)',
            fontWeight: '800',
            fontSize: '0.75rem',
            padding: '3px 10px',
            borderRadius: 'var(--radius-sm)',
            textTransform: 'uppercase'
          }}>
            {article.categoryLabel || article.category?.toUpperCase()}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Speech Reader Toggle */}
            <button
              onClick={toggleSpeech}
              className="btn-outline"
              style={{
                fontSize: '0.8rem',
                padding: '4px 10px',
                borderColor: isSpeaking ? 'var(--accent-red)' : 'var(--border-color)',
                color: isSpeaking ? 'var(--accent-red)' : 'var(--text-primary)'
              }}
            >
              {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
              <span>{isSpeaking ? t.stopAudio : t.listenToArticle}</span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className="btn-outline"
              style={{
                fontSize: '0.8rem',
                padding: '4px 10px',
                color: bookmarked ? 'var(--accent-gold)' : 'var(--text-primary)'
              }}
            >
              <Bookmark size={15} fill={bookmarked ? 'var(--accent-gold)' : 'none'} />
              <span>{bookmarked ? t.saved : t.save}</span>
            </button>

            {/* Copy Link Share */}
            <button
              onClick={handleCopyLink}
              className="btn-outline"
              style={{ fontSize: '0.8rem', padding: '4px 10px' }}
            >
              {copied ? <Check size={15} style={{ color: '#16a34a' }} /> : <Share2 size={15} />}
              <span>{copied ? t.copiedLink : t.share}</span>
            </button>

            {/* ABSOLUTE GEOMETRIC CENTERED CLOSE BUTTON */}
            <button
              onClick={onClose}
              aria-label="Close Article Modal"
              style={{
                background: 'var(--bg-secondary)',
                border: 'none',
                color: 'var(--text-primary)',
                width: '34px',
                height: '34px',
                minWidth: '34px',
                minHeight: '34px',
                borderRadius: '50%',
                cursor: 'pointer',
                position: 'relative',
                padding: 0,
                margin: 0,
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
              }}>
                <X size={18} />
              </span>
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2rem',
          fontWeight: '800',
          lineHeight: '1.25',
          color: 'var(--text-primary)',
          marginBottom: '1rem'
        }}>
          {article.title}
        </h1>

        {/* Author & Meta */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginBottom: '1.5rem',
          fontWeight: '500'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-primary)', fontWeight: '700' }}>
            <User size={15} style={{ color: 'var(--accent-red)' }} />
            {article.author}
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={15} />
            {article.time} ({article.readTime || '4 min read'})
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-red)' }}>
            <Eye size={15} />
            {article.views || '45K'} views
          </span>
        </div>

        {/* Feature Image */}
        <div style={{
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          marginBottom: '1.75rem',
          aspectRatio: '16/9',
          maxHeight: '400px'
        }}>
          <img src={article.image} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Summary Lead Paragraph */}
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.15rem',
          fontStyle: 'italic',
          color: 'var(--text-primary)',
          borderLeft: '4px solid var(--accent-red)',
          paddingLeft: '1rem',
          marginBottom: '1.5rem',
          lineHeight: '1.6'
        }}>
          "{article.summary}"
        </p>

        {/* Body Text */}
        <div style={{
          fontSize: '1.05rem',
          lineHeight: '1.8',
          color: 'var(--text-secondary)',
          whiteSpace: 'pre-line',
          marginBottom: '2rem'
        }}>
          {article.content || article.summary}
        </div>

        {/* Footer info box */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          marginTop: '2rem'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-red)', letterSpacing: '0.5px' }}>
              YUGANTAR VERIFIED NEWS
            </span>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '600' }}>
              Reported & Fact-checked by YUGANTAR Editorial Board
            </div>
          </div>
          <button onClick={onClose} className="btn-primary" style={{ fontSize: '0.85rem' }}>
            Close Article
          </button>
        </div>

      </div>
    </div>
  );
}
