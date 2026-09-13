import React from 'react';
import { Eye, Clock, TrendingUp, Bookmark, ShieldCheck } from 'lucide-react';
import { translations } from '../utils/translations';

export default function NewsGrid({ 
  articles = [], 
  activeCategory, 
  searchQuery, 
  onSelectArticle, 
  language,
  savedArticles = [],
  onToggleSave,
  onOpenFactCheck
}) {
  const t = translations[language] || translations.EN;
  const trendingArticles = articles.filter(a => a.trending).slice(0, 5);

  const getSectionTitle = () => {
    if (searchQuery) {
      return `${t.searchResultsFor} "${searchQuery}"`;
    }
    if (activeCategory === 'all') {
      return t.topHeadlines;
    }
    return (t.categories[activeCategory] || activeCategory).toUpperCase();
  };

  const isArticleSaved = (id) => savedArticles.some(art => art.id === id);

  return (
    <section style={{ padding: '2rem 0', background: 'var(--bg-main)' }}>
      <div className="container">
        
        {/* Section Title Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '4px', height: '24px', background: 'var(--accent-red)', borderRadius: '2px' }}></div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {getSectionTitle()}
            </h2>
          </div>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {t.showingStories}: {articles.length}
          </span>
        </div>

        {/* 2-Column Grid Layout: Articles Feed + Trending Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.75rem' }}>
          
          {/* Main Feed Column (8 cols on desktop) */}
          <div style={{ gridColumn: 'span 8', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }} className="news-feed-col">
            {articles.length === 0 ? (
              <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{t.noArticlesFound}</p>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t.tryDifferent}</span>
              </div>
            ) : (
              articles.map((item) => {
                const saved = isArticleSaved(item.id);
                return (
                  <div 
                    key={item.id}
                    className="news-card"
                    onClick={() => onSelectArticle(item)}
                    style={{ position: 'relative' }}
                  >
                    <div className="news-card-img-wrap">
                      <img src={item.image} alt={item.title} />
                      
                      {/* Top-Left Category Badge */}
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'rgba(0,0,0,0.75)',
                        color: '#ffffff',
                        backdropFilter: 'blur(4px)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        letterSpacing: '0.5px'
                      }}>
                        {item.categoryLabel || item.category?.toUpperCase()}
                      </span>

                      {/* Top-Right Save Bookmark Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSave(item);
                        }}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: saved ? 'var(--accent-red)' : 'rgba(0,0,0,0.65)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          backdropFilter: 'blur(4px)',
                          transition: 'all 0.2s',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                        }}
                        title={saved ? 'Remove from saved' : 'Save for later'}
                      >
                        <Bookmark size={15} fill={saved ? '#ffffff' : 'none'} />
                      </button>
                    </div>

                    <div className="news-card-body">
                      <div className="news-card-meta">
                        <span>{item.author}</span>
                        <span>{item.time}</span>
                      </div>

                      <h3 className="news-card-title">
                        {item.title}
                      </h3>

                      <p className="news-card-summary">
                        {item.summary}
                      </p>

                      <div className="news-card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} />
                          {item.readTime || '4 min read'}
                        </span>

                        {/* Interactive Verification Badge */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenFactCheck(item);
                          }}
                          style={{
                            background: 'rgba(22, 163, 74, 0.1)',
                            border: '1px solid rgba(22, 163, 74, 0.3)',
                            color: '#16a34a',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}
                          title="Click to view fact-check verification"
                        >
                          <ShieldCheck size={12} />
                          Verified
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Trending Top 5 Sidebar Column (4 cols on desktop) */}
          <div style={{ gridColumn: 'span 4' }} className="trending-sidebar-col">
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <TrendingUp size={20} style={{ color: 'var(--accent-red)' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: '800' }}>
                  {t.trendingTop5}
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {trendingArticles.map((tItem, index) => (
                  <div 
                    key={tItem.id}
                    onClick={() => onSelectArticle(tItem)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      position: 'relative'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    {/* BULLETPROOF ABSOLUTE-CENTERED CIRCLE BADGE */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      minWidth: '36px',
                      minHeight: '36px',
                      borderRadius: '50%',
                      background: index === 0 ? 'var(--accent-red)' : 'var(--bg-secondary)',
                      color: index === 0 ? '#ffffff' : 'var(--text-primary)',
                      position: 'relative',
                      flexShrink: 0,
                      marginTop: '2px',
                      boxShadow: index === 0 ? '0 3px 10px rgba(220,38,38,0.4)' : 'none',
                      border: index === 0 ? 'none' : '1px solid var(--border-color)',
                      overflow: 'hidden'
                    }}>
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        fontWeight: '900',
                        fontSize: '1rem',
                        lineHeight: '1',
                        textAlign: 'center',
                        color: index === 0 ? '#ffffff' : 'var(--text-primary)',
                        margin: 0,
                        padding: 0,
                        width: '100%',
                        pointerEvents: 'none'
                      }}>
                        {index + 1}
                      </span>
                    </div>

                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-red)', fontWeight: '800', letterSpacing: '0.5px' }}>
                        {tItem.categoryLabel || tItem.category?.toUpperCase()}
                      </span>
                      <h4 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.92rem',
                        fontWeight: '700',
                        lineHeight: '1.35',
                        color: 'var(--text-primary)',
                        marginTop: '2px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {tItem.title}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
                        {tItem.views} views • {tItem.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 992px) {
          .news-feed-col { grid-column: span 12 !important; grid-template-columns: 1fr !important; }
          .trending-sidebar-col { grid-column: span 12 !important; marginTop: 1.5rem; }
        }
      `}</style>
    </section>
  );
}
