import React, { useState, useEffect } from 'react';
import { Radio, Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, RadioTower, Sparkles } from 'lucide-react';
import { translations } from '../utils/translations';

export default function FloatingAudioPlayer({ language = 'EN', onOpenLiveStream }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const t = translations[language] || translations.EN;

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9000,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {isMinimized ? (
        // Minimized Floating Pill Button
        <button
          onClick={() => setIsMinimized(false)}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '800',
            fontSize: '0.8rem'
          }}
        >
          <RadioTower size={16} style={{ color: 'var(--accent-red)', animation: isPlaying ? 'pulseGlow 1.5s infinite' : 'none' }} />
          <span>{isPlaying ? '🔴 LIVE Radio' : '📻 YUGANTAR Audio'}</span>
        </button>
      ) : (
        // Expanded Player Box
        <div style={{
          width: '320px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(90deg, #dc2626, #b91c1c)',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#ffffff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: '900' }}>
              <Radio size={14} />
              YUGANTAR LIVE RADIO 24/7
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button 
                onClick={() => setIsMinimized(true)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8 }}
                title="Minimize Player"
              >
                <Minimize2 size={13} />
              </button>
            </div>
          </div>

          {/* Body Controls */}
          <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            
            {/* Animated Equalizer or Station Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={togglePlay}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'var(--accent-red)',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-red)',
                  flexShrink: 0
                }}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
              </button>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.2' }}>
                  {language === 'BN' ? 'যুগান্তর আন্তর্জাতিক নিউজ রেডিও' : (language === 'HI' ? 'युगांतर इंटरनेशनल रेडियो' : 'YUGANTAR Global News Radio')}
                </span>
                <span style={{ fontSize: '0.72rem', color: isPlaying ? '#16a34a' : 'var(--text-muted)', fontWeight: '700', marginTop: '2px' }}>
                  {isPlaying ? '🔴 Broadcasting Live Audio' : 'Paused • Tap play to listen'}
                </span>
              </div>
            </div>

            {/* Audio Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={toggleMute}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>
            </div>

          </div>

          {/* Bottom Broadcast Quick Launcher */}
          <div 
            onClick={onOpenLiveStream}
            style={{
              background: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-color)',
              padding: '6px 12px',
              textAlign: 'center',
              fontSize: '0.72rem',
              fontWeight: '800',
              color: 'var(--accent-red)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <span>📺 Switch to HD Video Stream →</span>
          </div>

        </div>
      )}
    </div>
  );
}
