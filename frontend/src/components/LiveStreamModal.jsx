import React, { useState, useEffect, useRef } from 'react';
import { X, Users, MessageSquare, Radio, Volume2, VolumeX, Play, Pause, Tv, Send } from 'lucide-react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const liveChannels = [
  { id: 'abp-ananda', name: 'ABP Ananda Official Live', videoUrl: 'https://cdn.abplive.com/LiveStreams/260118/abpananda/streaming_bengali_vidgyor-new-nov2022.html', badge: 'BENGALI NEWS' }
];

const isDemoMediaUrl = (url = '') => {
  const value = String(url).toLowerCase();
  return value.includes('w3schools.com/html/mov_bbb.mp4')
    || value.includes('interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4')
    || value.includes('youtube.com/embed/live_stream?channel=ucq-fj5jknlsuf-mwsy4_br')
    || value.includes('youtube.com/embed/live_stream?channel=ucv3rfzn-ghgtqzxiaq3swng');
};

const isYouTubeUrl = (url = '') => /(?:youtube\.com|youtu\.be)/i.test(String(url));
const isEmbeddedPageUrl = (url = '') => /cdn\.abplive\.com\/LiveStreams\//i.test(String(url));

const toYouTubeEmbedUrl = (url = '') => {
  if (/youtube\.com\/embed\//i.test(url) || /youtube\.com\/embed\?/i.test(url)) return url;
  const videoMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^?&/]+)/i);
  return videoMatch ? `https://www.youtube.com/embed/${videoMatch[1]}` : url;
};

export default function LiveStreamModal({ isOpen, onClose, streamData }) {
  const [messages, setMessages] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [viewerCount, setViewerCount] = useState(142850);
  const [selectedChannel, setSelectedChannel] = useState(liveChannels[0]);
  const [chatInput, setChatInput] = useState('');
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const [mediaError, setMediaError] = useState(false);

  const activeVideoUrl = streamData?.videoUrl || selectedChannel.videoUrl;
  const safeVideoUrl = isDemoMediaUrl(activeVideoUrl) ? '' : activeVideoUrl;
  const isIframeStream = isYouTubeUrl(safeVideoUrl) || isEmbeddedPageUrl(safeVideoUrl);

  useEffect(() => {
    if (!isOpen) return;

    setIsPlaying(true);
    setMediaError(false);
    if (videoRef.current) {
      videoRef.current.play().catch(() => setIsPlaying(false));
    }

    // Connect to Socket.io for live chat
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('receive_chat_message', (msg) => {
      setMessages(prev => [msg, ...prev.slice(0, 24)]);
    });

    const viewerInterval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 15) - 7);
    }, 2500);

    return () => {
      clearInterval(viewerInterval);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePlay = () => {
    if (isIframeStream) return;
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (isIframeStream) return;
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    const newMessage = {
      user: 'You',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [newMessage, ...prev]);

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('send_chat_message', { user: 'Viewer', text });
    }
    setChatInput('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1150px',
          background: '#0a0e17',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0,0,0,0.8)'
        }}
      >
        {/* Modal Header Bar */}
        <div style={{
          padding: '1rem 1.25rem',
          background: '#111827',
          borderBottom: '1px solid #1f2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="live-badge" style={{ background: '#dc2626' }}>
              <span className="live-dot" style={{ width: '8px', height: '8px', background: '#fff' }}></span>
              <span>LIVE TV BROADCAST</span>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: '600' }}>
              {streamData?.title || selectedChannel.name}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#ef4444', fontWeight: '700' }}>
              <Users size={15} />
              <span>{viewerCount.toLocaleString()} Watching Live</span>
            </div>

            {/* PURE GRID CENTERED CLOSE BUTTON */}
            <button
              onClick={onClose}
              aria-label="Close Live Stream Modal"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#ffffff',
                width: '36px',
                height: '36px',
                minWidth: '36px',
                minHeight: '36px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                padding: 0,
                margin: 0,
                flexShrink: 0,
                outline: 'none',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.9)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
            >
              <X size={18} style={{ display: 'block' }} />
            </button>
          </div>
        </div>

        {/* Live Channel Quick Switcher Bar */}
        <div style={{
          background: '#161e2e',
          borderBottom: '1px solid #1f2937',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#9ca3af', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Tv size={14} style={{ color: '#dc2626' }} />
            CHANNELS:
          </span>

          {liveChannels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannel(ch)}
              style={{
                background: selectedChannel.id === ch.id ? '#dc2626' : 'rgba(255,255,255,0.08)',
                color: '#ffffff',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {ch.badge}
            </button>
          ))}
        </div>

        {/* Modal Main Video & Chat Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', background: '#000000' }}>
          
          {/* Video Player Column (8 cols) */}
          <div style={{ gridColumn: 'span 8', position: 'relative', background: '#000' }} className="video-player-col">
            {safeVideoUrl && isIframeStream && !mediaError && (
              <iframe
                src={toYouTubeEmbedUrl(safeVideoUrl)}
                title={streamData?.title || selectedChannel.name}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: '480px', border: 0, display: 'block' }}
              />
            )}
            {safeVideoUrl && !isIframeStream && !mediaError && (
              <video
                ref={videoRef}
                src={safeVideoUrl}
                autoPlay
                loop
                muted={isMuted}
                onError={() => setMediaError(true)}
                style={{ width: '100%', height: '100%', maxHeight: '480px', objectFit: 'contain', display: 'block' }}
              />
            )}
            {(!safeVideoUrl || mediaError) && !isIframeStream && (
              <div style={{ minHeight: '320px', height: '480px', display: 'grid', placeItems: 'center', padding: '2rem', textAlign: 'center', color: '#cbd5e1' }}>
                <div>
                  <Radio size={34} style={{ color: '#ef4444', marginBottom: '0.75rem' }} />
                  <p style={{ margin: 0, fontWeight: 700 }}>Live stream unavailable</p>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>Ask an administrator to add a valid YouTube, HLS, or MP4 stream URL.</p>
                </div>
              </div>
            )}

            {/* Live Broadcast Overlay Controls Banner */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                
                {/* PURE GRID CENTERED PLAY/PAUSE BUTTON */}
                <button
                  onClick={togglePlay}
                  disabled={isIframeStream || !safeVideoUrl}
                  aria-label={isPlaying ? "Pause Stream" : "Play Stream"}
                  style={{
                    background: 'rgba(255, 255, 255, 0.22)',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                    width: '36px',
                    height: '36px',
                    minWidth: '36px',
                    minHeight: '36px',
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    padding: 0,
                    margin: 0,
                    flexShrink: 0,
                    outline: 'none',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = isIframeStream ? 'rgba(255,255,255,0.22)' : 'var(--accent-red)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)'}
                  title={isPlaying ? "Pause Video" : "Play Video"}
                >
                  {isPlaying ? <Pause size={16} fill="#ffffff" style={{ display: 'block' }} /> : <Play size={16} fill="#ffffff" style={{ display: 'block', marginLeft: '2px' }} />}
                </button>

                {/* PURE GRID CENTERED MUTE/UNMUTE BUTTON */}
                <button
                  onClick={toggleMute}
                  disabled={isIframeStream || !safeVideoUrl}
                  aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
                  style={{
                    background: 'rgba(255, 255, 255, 0.22)',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                    width: '36px',
                    height: '36px',
                    minWidth: '36px',
                    minHeight: '36px',
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    padding: 0,
                    margin: 0,
                    flexShrink: 0,
                    outline: 'none',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = isIframeStream ? 'rgba(255,255,255,0.22)' : 'rgba(255, 255, 255, 0.38)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)'}
                  title={isMuted ? "Unmute Audio" : "Mute Audio"}
                >
                  {isMuted ? <VolumeX size={16} style={{ display: 'block' }} /> : <Volume2 size={16} style={{ display: 'block' }} />}
                </button>

                <span style={{ fontSize: '0.8rem', color: '#e5e7eb', fontWeight: '600' }}>
                  🔴 YUGANTAR LIVE HD • {selectedChannel.badge}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', background: 'rgba(220,38,38,0.85)', padding: '3px 10px', borderRadius: '4px', fontWeight: '700' }}>
                <Radio size={12} />
                <span>1080p HD LIVE</span>
              </div>
            </div>
          </div>

          {/* Live Chat Stream Column (4 cols) */}
          <div style={{
            gridColumn: 'span 4',
            background: '#111827',
            borderLeft: '1px solid #1f2937',
            display: 'flex',
            flexDirection: 'column',
            height: '480px'
          }} className="chat-stream-col">
            
            <div style={{
              padding: '0.85rem 1rem',
              borderBottom: '1px solid #1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '700',
              fontSize: '0.9rem',
              color: '#f3f4f6'
            }}>
              <MessageSquare size={16} style={{ color: '#ef4444' }} />
              <span>LIVE VIEWER FEED</span>
            </div>

            {/* Chat List */}
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center', margin: 'auto' }}>
                  No messages yet. Be the first to join the conversation!
                </p>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} style={{ background: '#1f2937', padding: '8px 10px', borderRadius: '6px', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontWeight: '700', color: msg.user === 'You' ? '#34d399' : '#60a5fa' }}>{msg.user}</span>
                      <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{msg.time}</span>
                    </div>
                    <div style={{ color: '#e5e7eb', lineHeight: '1.3' }}>{msg.text}</div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendChat} style={{ padding: '0.75rem', borderTop: '1px solid #1f2937', display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Join live discussion..."
                style={{
                  flexGrow: 1,
                  background: '#1f2937',
                  border: '1px solid #374151',
                  color: '#fff',
                  borderRadius: '4px',
                  padding: '8px 10px',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Send size={14} />
              </button>
            </form>

          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 850px) {
          .video-player-col { grid-column: span 12 !important; }
          .chat-stream-col { grid-column: span 12 !important; height: 220px !important; }
        }
      `}</style>
    </div>
  );
}
