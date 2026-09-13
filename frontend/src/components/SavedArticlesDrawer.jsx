import React from 'react';
import { Bookmark, X, Trash2, ExternalLink, Clock, BookOpen, Volume2 } from 'lucide-react';
import { translations } from '../utils/translations';

export default function SavedArticlesDrawer({ isOpen, onClose, savedArticles = [], onRemoveArticle, onSelectArticle, language = 'EN' }) {
  const t = translations[language] || translations.EN;

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9998,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'flex-end',
      transition: 'all 0.3s ease'
    }} onClick={onClose}>
      
      <div 
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          animation: 'slideInRight 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'var(--accent-red)',
              color: '#fff',
              padding: '6px',
              borderRadius: '8px'
            }}>
              <Bookmark size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                {language === 'BN' ? 'সংরক্ষিত তালিকা' : (language === 'HI' ? 'सेव की गई खबरें' : 'Saved Reading Queue')}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                {savedArticles.length} {language === 'BN' ? 'টি খবর সংরক্ষিত আছে' : (language === 'HI' ? 'समाचार सेव किए गए हैं' : 'Articles ready to read')}
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
            <X size={20} />
          </button>
        </div>

        {/* Saved List Body */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {savedArticles.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <BookOpen size={48} style={{ opacity: 0.3, color: 'var(--accent-red)' }} />
              <h4 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: '700' }}>
                {language === 'BN' ? 'কোনো খবর বুকমার্ক করা হয়নি' : (language === 'HI' ? 'कोई समाचार सेव नहीं है' : 'Your Queue is Empty')}
              </h4>
              <p style={{ fontSize: '0.82rem', margin: 0, maxWidth: '280px' }}>
                {language === 'BN' ? 'যেকোনো সংবাদের বুকমার্ক আইকনটিতে ক্লিক করে তা পরবর্তীতে পড়ার জন্য জমা রাখুন।' : (language === 'HI' ? 'बाद में पढ़ने के लिए किसी भी समाचार पर बुकमार्क आइकन पर क्लिक करें।' : 'Click the bookmark icon on any news card to save it for reading later.')}
              </p>
            </div>
          ) : (
            savedArticles.map((article) => (
              <div 
                key={article.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  gap: '12px',
                  position: 'relative',
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  onSelectArticle(article);
                  onClose();
                }}
              >
                {/* Article Image Thumbnail */}
                <img 
                  src={article.image} 
                  alt={article.title}
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    flexShrink: 0
                  }}
                />

                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <h4 style={{
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    margin: 0,
                    lineHeight: '1.3',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {article.title}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-red)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {article.category}
                    </span>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveArticle(article.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem'
                      }}
                      title="Remove from saved"
                    >
                      <Trash2 size={13} style={{ color: '#ef4444' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

        </div>

        {/* Footer info */}
        {savedArticles.length > 0 && (
          <div style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Saved locally on this device
            </span>

            <button 
              onClick={() => {
                savedArticles.forEach(art => onRemoveArticle(art.id));
              }}
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#ef4444',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {language === 'BN' ? 'সব মুছুন' : (language === 'HI' ? 'सभी हटाएं' : 'Clear Queue')}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
