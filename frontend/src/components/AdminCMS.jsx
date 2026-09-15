import React, { useState, useEffect } from 'react';
import { 
  Lock, User, LogOut, PlusCircle, Newspaper, Radio, Send, 
  Trash2, Eye, ShieldAlert, Sparkles, CheckCircle2, RefreshCw, Users 
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function AdminCMS({ isOpen, onClose, onRefreshData, standalone = false }) {
  const [token, setToken] = useState(() => localStorage.getItem('yugantar_admin_token') || '');
  const [user, setUser] = useState(null);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Active Tab: 'dashboard' | 'articles' | 'ticker' | 'livetv' | 'subscribers'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [statusMsg, setStatusMsg] = useState('');

  // Articles State
  const [articlesList, setArticlesList] = useState([]);
  const [newArtLang, setNewArtLang] = useState('EN'); // Active tab for multi-lingual input
  const [artTitle, setArtTitle] = useState({ EN: '', BN: '', HI: '' });
  const [artSummary, setArtSummary] = useState({ EN: '', BN: '', HI: '' });
  const [artCategory, setArtCategory] = useState('world');
  const [artAuthor, setArtAuthor] = useState('YUGANTAR Editorial');
  const [artImage, setArtImage] = useState('https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80');
  const [artIsHero, setArtIsHero] = useState(false);
  const [artIsTrending, setArtIsTrending] = useState(false);

  // Ticker State
  const [tickerList, setTickerList] = useState([]);
  const [tickerTitle, setTickerTitle] = useState({ EN: '', BN: '', HI: '' });
  const [tickerCategory, setTickerCategory] = useState('BREAKING');

  // Live TV State
  const [liveStreamUrl, setLiveStreamUrl] = useState('https://cdn.abplive.com/LiveStreams/260118/abpananda/streaming_bengali_vidgyor-new-nov2022.html');
  const [liveStreamTitle, setLiveStreamTitle] = useState({ EN: 'Live Bengali News Stream', BN: 'বাংলা লাইভ সংবাদ সম্প্রচার', HI: 'लाइव बंगाली समाचार प्रसारण' });

  // Subscribers State
  const [subscribers, setSubscribers] = useState([]);

  // Reels State
  const [reelsList, setReelsList] = useState([]);
  const [reelTitle, setReelTitle] = useState({ EN: '', BN: '', HI: '' });
  const [reelUrl, setReelUrl] = useState('');
  const [reelThumbnail, setReelThumbnail] = useState('');
  const [reelCategory, setReelCategory] = useState('NEWS');
  const [reelDuration, setReelDuration] = useState('');
  const [reelAgency, setReelAgency] = useState('');

  // Check auth on mount
  useEffect(() => {
    if (token) {
      fetchAdminProfile();
    }
  }, [token]);

  // Load Admin Data when authenticated
  useEffect(() => {
    if (user && token) {
      loadAdminArticles();
      loadAdminTickers();
      loadSubscribers();
      loadAdminReels();
    }
  }, [user, token]);

  const fetchAdminProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        handleLogout();
      }
    } catch (e) {
      // Offline or error
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('yugantar_admin_token', data.token);
        setToken(data.token);
        setUser(data.user);
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch (err) {
      setLoginError('Cannot connect to backend server at http://localhost:5000');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('yugantar_admin_token');
    setToken('');
    setUser(null);
  };

  // Loaders
  const loadAdminArticles = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/articles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setArticlesList(data.data);
    } catch (e) {}
  };

  const loadAdminTickers = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/ticker`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setTickerList(data.data);
    } catch (e) {}
  };

  const loadSubscribers = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/subscribers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setSubscribers(data.data);
    } catch (e) {}
  };

  const loadAdminReels = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/reels`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setReelsList(data.data);
    } catch (e) {}
  };

  // Submit New Article
  const handlePublishArticle = async (e) => {
    e.preventDefault();
    if (!artTitle.EN && !artTitle.BN && !artTitle.HI) {
      alert('Please enter a headline in at least one language!');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: artTitle,
          summary: artSummary,
          content: artSummary,
          category: artCategory,
          author: artAuthor,
          image: artImage,
          hero: artIsHero,
          trending: artIsTrending
        })
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg('✅ Article published successfully and broadcast live!');
        setArtTitle({ EN: '', BN: '', HI: '' });
        setArtSummary({ EN: '', BN: '', HI: '' });
        loadAdminArticles();
        if (onRefreshData) onRefreshData();
      }
    } catch (e) {
      alert('Error publishing article');
    }
  };

  // Submit New Breaking Ticker
  const handlePushTicker = async (e) => {
    e.preventDefault();
    if (!tickerTitle.EN && !tickerTitle.BN && !tickerTitle.HI) {
      alert('Please enter ticker text!');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/ticker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: tickerTitle,
          category: tickerCategory,
          urgent: true
        })
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg('⚡ Breaking News pushed live to all visitors!');
        setTickerTitle({ EN: '', BN: '', HI: '' });
        loadAdminTickers();
        if (onRefreshData) onRefreshData();
      }
    } catch (e) {
      alert('Error pushing ticker');
    }
  };

  // Update Live Stream
  const handleUpdateLiveStream = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/livestream`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          videoUrl: liveStreamUrl,
          title: liveStreamTitle,
          isLive: true
        })
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg('📺 Live Broadcast Stream updated!');
        if (onRefreshData) onRefreshData();
      }
    } catch (e) {
      alert('Error updating live stream');
    }
  };

  const handlePublishReel = async (e) => {
    e.preventDefault();
    if (!reelTitle.EN && !reelTitle.BN && !reelTitle.HI) {
      alert('Please enter a reel title in at least one language!');
      return;
    }
    if (!reelUrl.trim()) {
      alert('Please enter a real video URL!');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/reels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: reelTitle,
          videoUrl: reelUrl.trim(),
          thumbnail: reelThumbnail.trim(),
          category: reelCategory,
          duration: reelDuration || 'LIVE',
          agency: reelAgency || 'Editorial Desk'
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('🎥 Reel published and available on the public site!');
        setReelTitle({ EN: '', BN: '', HI: '' });
        setReelUrl('');
        setReelThumbnail('');
        setReelDuration('');
        setReelAgency('');
        loadAdminReels();
        if (onRefreshData) onRefreshData();
      } else {
        alert(data.message || 'Error publishing reel');
      }
    } catch (e) {
      alert('Error publishing reel');
    }
  };

  const handleDeleteReel = async (id) => {
    if (!confirm('Are you sure you want to delete this reel?')) return;
    try {
      await fetch(`${API_BASE}/admin/reels/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadAdminReels();
      if (onRefreshData) onRefreshData();
    } catch (e) {}
  };

  // Delete Article
  const handleDeleteArticle = async (id) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await fetch(`${API_BASE}/admin/articles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadAdminArticles();
      if (onRefreshData) onRefreshData();
    } catch (e) {}
  };

  if (!isOpen && !standalone) return null;

  return (
    <div style={{
      ...(standalone ? {
        minHeight: '100vh',
        backgroundColor: '#05070f',
        padding: '1.5rem'
      } : {
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(5, 7, 15, 0.85)',
        backdropFilter: 'blur(16px)',
        padding: '1.5rem'
      }),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: standalone ? '1440px' : '1100px',
        maxHeight: standalone ? 'none' : '90vh',
        minHeight: standalone ? 'calc(100vh - 3rem)' : undefined,
        backgroundColor: '#0b0f19',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: standalone ? '16px' : '20px',
        boxShadow: standalone ? '0 20px 50px rgba(0, 0, 0, 0.35)' : '0 25px 60px rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#f1f5f9'
      }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.1), rgba(59, 130, 246, 0.1))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '10px' }}>
              <ShieldAlert style={{ color: '#ef4444', width: '24px', height: '24px' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>YUGANTAR Editorial Desk & Admin CMS</h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Real-time news broadcasting & content manager</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '4px 12px',
              borderRadius: '8px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '2rem' }}>
          
          {!user ? (
            /* Login Screen */
            <div style={{ maxWidth: '400px', margin: '2rem auto', textAlign: 'center' }}>
              <div style={{
                padding: '2.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ marginBottom: '1.5rem', display: 'inline-block', padding: '12px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '50%' }}>
                  <Lock style={{ color: '#3b82f6', width: '32px', height: '32px' }} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem' }}>Editorial Sign In</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
                  Authorized newsroom staff only. Use the credentials issued by your administrator.
                </p>

                {loginError && (
                  <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Email Address</label>
                    <input 
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#fff'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Password</label>
                    <input 
                      type="password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#fff'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                      color: '#fff',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {isLoggingIn ? 'Authenticating...' : 'Sign In to Editorial Desk'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Authenticated Admin Dashboard */
            <div>
              {/* Top User Bar & Tab Switcher */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeTab === 'dashboard' ? '#ef4444' : 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    📊 Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('articles')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeTab === 'articles' ? '#ef4444' : 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    📰 Articles ({articlesList.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('ticker')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeTab === 'ticker' ? '#ef4444' : 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ Live Ticker
                  </button>
                  <button
                    onClick={() => setActiveTab('livetv')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeTab === 'livetv' ? '#ef4444' : 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    📺 Live TV Broadcast
                  </button>
                  <button
                    onClick={() => setActiveTab('reels')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeTab === 'reels' ? '#ef4444' : 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    🎥 Reels ({reelsList.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('subscribers')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeTab === 'subscribers' ? '#ef4444' : 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    📬 Subscribers ({subscribers.length})
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Signed in as <strong style={{ color: '#fff' }}>{user.name}</strong> ({user.role})
                  </span>
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid #ef4444',
                      color: '#fca5a5',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <LogOut style={{ width: '14px', height: '14px' }} /> Logout
                  </button>
                </div>
              </div>

              {statusMsg && (
                <div style={{ padding: '10px 16px', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', borderRadius: '8px', color: '#86efac', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  {statusMsg}
                </div>
              )}

              {/* Tab 1: Dashboard Overview */}
              {activeTab === 'dashboard' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Total Database Articles</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#3b82f6', marginTop: '0.5rem' }}>{articlesList.length || '30+'}</div>
                  </div>
                  <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Active Marquee Tickers</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444', marginTop: '0.5rem' }}>{tickerList.length || '5'}</div>
                  </div>
                  <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Newsletter Subscribers</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#22c55e', marginTop: '0.5rem' }}>{subscribers.length}</div>
                  </div>
                  <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Real-Time Push Engine</div>
                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#a855f7', marginTop: '0.75rem' }}>⚡ Socket.io Active</div>
                  </div>
                </div>
              )}

              {/* Tab 2: Articles Manager */}
              {activeTab === 'articles' && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Publish New Multi-Lingual Story</h3>

                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    {['EN', 'BN', 'HI'].map(lang => (
                      <button
                        key={lang}
                        onClick={() => setNewArtLang(lang)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          background: newArtLang === lang ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)',
                          color: '#fff',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {lang === 'EN' ? 'English (EN)' : lang === 'BN' ? 'Bengali (BN)' : 'Hindi (HI)'}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handlePublishArticle} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '2rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Headline ({newArtLang})</label>
                      <input 
                        type="text"
                        value={artTitle[newArtLang]}
                        onChange={e => setArtTitle({ ...artTitle, [newArtLang]: e.target.value })}
                        placeholder={`Enter article headline in ${newArtLang}`}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Summary & Content ({newArtLang})</label>
                      <textarea 
                        rows={3}
                        value={artSummary[newArtLang]}
                        onChange={e => setArtSummary({ ...artSummary, [newArtLang]: e.target.value })}
                        placeholder={`Enter summary/content snippet in ${newArtLang}`}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Category</label>
                        <select 
                          value={artCategory} 
                          onChange={e => setArtCategory(e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', color: '#fff' }}
                        >
                          <option value="world">World</option>
                          <option value="tech">Tech</option>
                          <option value="business">Business</option>
                          <option value="sports">Sports</option>
                          <option value="entertainment">Entertainment</option>
                          <option value="science">Science</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Author / Source</label>
                        <input 
                          type="text" 
                          value={artAuthor} 
                          onChange={e => setArtAuthor(e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Cover Image URL</label>
                        <input 
                          type="text" 
                          value={artImage} 
                          onChange={e => setArtImage(e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={artIsHero} onChange={e => setArtIsHero(e.target.checked)} />
                        Set as Featured Hero Headline
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={artIsTrending} onChange={e => setArtIsTrending(e.target.checked)} />
                        Set as Trending Top 5 Sidebar
                      </label>
                    </div>

                    <button 
                      type="submit"
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                        color: '#fff',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      🚀 Publish Story Now
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 3: Live Ticker */}
              {activeTab === 'ticker' && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Push Live Breaking Marquee Ticker Alert</h3>

                  <form onSubmit={handlePushTicker} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Headline (EN)</label>
                        <input 
                          type="text" 
                          value={tickerTitle.EN} 
                          onChange={e => setTickerTitle({ ...tickerTitle, EN: e.target.value })}
                          placeholder="English Ticker"
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Headline (BN)</label>
                        <input 
                          type="text" 
                          value={tickerTitle.BN} 
                          onChange={e => setTickerTitle({ ...tickerTitle, BN: e.target.value })}
                          placeholder="Bengali Ticker"
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Headline (HI)</label>
                        <input 
                          type="text" 
                          value={tickerTitle.HI} 
                          onChange={e => setTickerTitle({ ...tickerTitle, HI: e.target.value })}
                          placeholder="Hindi Ticker"
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                        color: '#fff',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      ⚡ Push Instant WebSocket Breaking Alert
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 4: Live TV */}
              {activeTab === 'livetv' && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Configure Live Stream Broadcast Feed</h3>
                  <form onSubmit={handleUpdateLiveStream} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Live Video Stream URL (YouTube Embed or HLS .m3u8)</label>
                      <input 
                        type="text" 
                        value={liveStreamUrl} 
                        onChange={e => setLiveStreamUrl(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                      />
                    </div>
                    <button 
                      type="submit"
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        background: '#3b82f6',
                        color: '#fff',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      📺 Save & Update Broadcast URL
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 5: Reels */}
              {activeTab === 'reels' && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Publish a Real Video Reel</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    Use an owned/licensed MP4, HLS, or embeddable YouTube URL. Demo Bunny/flower clips are not accepted.
                  </p>
                  <form onSubmit={handlePublishReel} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      {['EN', 'BN', 'HI'].map(lang => (
                        <div key={lang}>
                          <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Title ({lang})</label>
                          <input
                            type="text"
                            value={reelTitle[lang]}
                            onChange={e => setReelTitle({ ...reelTitle, [lang]: e.target.value })}
                            placeholder={`Reel title (${lang})`}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                          />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Video URL</label>
                        <input type="url" required value={reelUrl} onChange={e => setReelUrl(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Thumbnail URL</label>
                        <input type="url" value={reelThumbnail} onChange={e => setReelThumbnail(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <input value={reelCategory} onChange={e => setReelCategory(e.target.value)} placeholder="Category" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', color: '#fff' }} />
                      <input value={reelDuration} onChange={e => setReelDuration(e.target.value)} placeholder="Duration (optional)" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }} />
                      <input value={reelAgency} onChange={e => setReelAgency(e.target.value)} placeholder="Source / agency" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }} />
                    </div>
                    <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
                      🎥 Publish Reel
                    </button>
                  </form>

                  <h4 style={{ marginBottom: '0.75rem' }}>Published Reels ({reelsList.length})</h4>
                  {reelsList.map(reel => (
                    <div key={reel._id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.85rem' }}>{reel.title?.EN || reel.title?.BN || reel.title?.HI || 'Untitled reel'}</span>
                      <button onClick={() => handleDeleteReel(reel._id)} style={{ padding: '5px 9px', borderRadius: '6px', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', cursor: 'pointer' }}>Delete</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 6: Subscribers */}
              {activeTab === 'subscribers' && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Subscribed Emails ({subscribers.length})</h3>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {subscribers.map((sub, idx) => (
                      <li key={idx} style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                        📧 {sub.email}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
