import React, { useState, useEffect, useRef } from 'react';
import { X, Users, MessageSquare, Radio, Volume2, VolumeX, Play, Pause } from 'lucide-react';

const mockChatMessages = [
  { user: "Arjun M.", text: "Significant breakthrough for clean energy transition!", time: "Just now" },
  { user: "Sarah Jenkins", text: "Watching live from London, great coverage as always.", time: "Just now" },
  { user: "TechEnthusiast", text: "The quantum computing news is mind blowing 🚀", time: "1s ago" },
  { user: "Rajesh K.", text: "Kudos to PULSE LIVE team for 24x7 updates!", time: "2s ago" },
  { user: "Elena V.", text: "When will the official whitepaper be released?", time: "4s ago" }
];

export default function LiveStreamModal({ isOpen, onClose, streamData }) {
  const [messages, setMessages] = useState(mockChatMessages);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [viewerCount, setViewerCount] = useState(142850);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => setIsPlaying(false));
    }

    const viewerInterval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 15) - 7);
    }, 2000);

    const chatInterval = setInterval(() => {
      const users = ["David B.", "Neha Sharma", "GlobalWatch", "CryptoPioneer", "Pooja V."];
      const comments = [
        "Incredible live broadcast quality!",
        "Important updates happening right now.",
        "Check out the key developments tab as well.",
        "Great analysis from the ground reporting team!"
      ];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomComment = comments[Math.floor(Math.random() * comments.length)];

      setMessages(prev => [
        { user: randomUser, text: randomComment, time: "Just now" },
        ...prev.slice(0, 15)
      ]);
    }, 3500);

    return () => {
      clearInterval(viewerInterval);
      clearInterval(chatInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePlay = () => {
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
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1100px',
          background: '#0a0e17',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header Bar */}
        <div style={{
          padding: '1rem 1.25rem',
          background: '#111827',
          borderBottom: '1px solid #1f2937',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="live-badge" style={{ background: '#dc2626' }}>
              <span className="live-dot" style={{ width: '8px', height: '8px', background: '#fff' }}></span>
              <span>LIVE TV BROADCAST</span>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: '500' }}>
              {streamData?.title || 'Global News Network 24x7 Stream'}
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

        {/* Modal Main Video & Chat Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', background: '#000000' }}>
          
          {/* Video Player Column (8 cols) */}
          <div style={{ gridColumn: 'span 8', position: 'relative', background: '#000' }} className="video-player-col">
            <video
              ref={videoRef}
              src={streamData?.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
              autoPlay
              loop
              muted={isMuted}
              style={{ width: '100%', height: '100%', maxHeight: '480px', objectFit: 'contain', display: 'block' }}
            />

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
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-red)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)'}
                  title={isPlaying ? "Pause Video" : "Play Video"}
                >
                  {isPlaying ? <Pause size={16} fill="#ffffff" style={{ display: 'block' }} /> : <Play size={16} fill="#ffffff" style={{ display: 'block', marginLeft: '2px' }} />}
                </button>

                {/* PURE GRID CENTERED MUTE/UNMUTE BUTTON */}
                <button
                  onClick={toggleMute}
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
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.38)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)'}
                  title={isMuted ? "Unmute Audio" : "Mute Audio"}
                >
                  {isMuted ? <VolumeX size={16} style={{ display: 'block' }} /> : <Volume2 size={16} style={{ display: 'block' }} />}
                </button>

                <span style={{ fontSize: '0.8rem', color: '#e5e7eb', fontWeight: '600' }}>
                  🔴 PULSE LIVE HD BROADCAST • CHANNEL 1
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', background: 'rgba(220,38,38,0.85)', padding: '3px 10px', borderRadius: '4px', fontWeight: '700' }}>
                <Radio size={12} />
                <span>REAL-TIME STREAM</span>
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
              {messages.map((msg, i) => (
                <div key={i} style={{ background: '#1f2937', padding: '8px 10px', borderRadius: '6px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontWeight: '700', color: '#60a5fa' }}>{msg.user}</span>
                    <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{msg.time}</span>
                  </div>
                  <div style={{ color: '#e5e7eb', lineHeight: '1.3' }}>{msg.text}</div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div style={{ padding: '0.75rem', borderTop: '1px solid #1f2937' }}>
              <input
                type="text"
                placeholder="Join the live discussion..."
                style={{
                  width: '100%',
                  background: '#1f2937',
                  border: '1px solid #374151',
                  color: '#fff',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
            </div>

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
