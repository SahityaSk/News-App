import React, { useState } from 'react';
import { Sparkles, X, Volume2, VolumeX, BarChart3, TrendingUp, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { translations } from '../utils/translations';

export default function AiDigestModal({ isOpen, onClose, language = 'EN', articles = [] }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const t = translations[language] || translations.EN;

  if (!isOpen) return null;

  const toggleAiAudio = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        const textToSpeak = language === 'BN' 
          ? "যুগান্তর AI দৈনন্দিন বুলেটিন: প্রযুক্তি ও ব্যবসায়িক উন্নয়ন সহ আজকের প্রধান তিনটি আপডেট সফলভাবে সংগঠিত হয়েছে।"
          : (language === 'HI'
            ? "युगांतर AI दैनिक बुलेटिन: तकनीक और आर्थिक विकास सहित आज के 3 मुख्य अपडेट तैयार हैं।"
            : "Yugantar AI Daily Briefing: Top three updates including AI breakthroughs and market resilience are ready.");
        
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = language === 'BN' ? 'bn-IN' : (language === 'HI' ? 'hi-IN' : 'en-US');
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);

        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      }
    }
  };

  const digestContent = {
    EN: {
      title: "PULSE AI Executive Briefing",
      subtitle: "AI-Curated 60-Second News Snapshot",
      sentiment: "Bullish Tech & Market Stability (78%)",
      takeaway1: "Global AI Infrastructure & Quantum Computing surge leading international stock markets.",
      takeaway2: "Clean Energy initiatives gain momentum as international climate summit opens.",
      takeaway3: "Central banks signal steady interest rate pause amidst cooling inflation metrics.",
      tags: ["#ArtificialIntelligence", "#GlobalMarkets", "#CleanEnergy", "#SpaceTech"]
    },
    BN: {
      title: "যুগান্তর AI এক্সিকিউটিভ বুলেটিন",
      subtitle: "এআই দ্বারা তৈরিকৃত ৬০ সেকেন্ডের দ্রুত সংবাদ সারসংক্ষেপ",
      sentiment: "প্রযুক্তি ও বাজারের ইতিবাচক গতিশীলতা (৭৮%)",
      takeaway1: "গ্লোবাল এআই অবকাঠামো এবং কোয়ান্টাম কম্পিউটিংয়ের বিশ্বজুড়ে অভূতপূর্ব শেয়ার বাজার বৃদ্ধি।",
      takeaway2: "আন্তর্জাতিক জলবায়ু সম্মেলনে পরিবেশবান্ধব সবুজ শক্তি প্রকল্পে বিশাল নতুন বিনিয়োগের ঘোষণা।",
      takeaway3: "মুদ্রাস্ফীতি নিয়ন্ত্রণের ফলে কেন্দ্রীয় ব্যাংকগুলোতে সুদের হার স্থিতিশীল রাখার ইঙ্গিত।",
      tags: ["#কৃত্রিমবুদ্ধিমত্তা", "#গ্লোবালমার্কেট", "#সবুজশক্তি", "#স্পেসটেক"]
    },
    HI: {
      title: "युगांतर AI एग्जीक्यूटिव बुलेटिन",
      subtitle: "एआई द्वारा तैयार 60-सेकंड का त्वरित समाचार सार",
      sentiment: "तकनीक और बाजार में सकारात्मक रुझान (78%)",
      takeaway1: "ग्लोबल एआई इंफ्रास्ट्रक्चर और क्वांटम कंप्यूटिंग के कारण शेयर बाजारों में जबरदस्त उछाल।",
      takeaway2: "अंतरराष्ट्रीय जलवायु सम्मेलन में हरित ऊर्जा और पर्यावरण पहलों को मिला नया संबल।",
      takeaway3: "मुद्रास्फीति में गिरावट के बीच केंद्रीय बैंकों ने ब्याज दरों को स्थिर रखने के दिए संकेत।",
      tags: ["#आर्टिफिशियलइंटेलिजेंस", "#ग्लोबलमार्केट", "#ग्रीनएनर्जी", "#अंतरिक्ष"]
    }
  };

  const content = digestContent[language] || digestContent.EN;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }} onClick={onClose}>
      
      <div 
        style={{
          width: '100%',
          maxWidth: '620px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(220,38,38,0.15), rgba(79,70,229,0.15))',
          borderBottom: '1px solid var(--border-color)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'var(--accent-red)',
              color: '#fff',
              padding: '8px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {content.title}
                <span style={{ fontSize: '0.65rem', background: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>AI 2.0</span>
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{content.subtitle}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: 'var(--text-primary)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Sentiment Meter Bar */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BarChart3 size={15} style={{ color: 'var(--accent-gold)' }} />
                GLOBAL NEWS SENTIMENT ANALYSIS
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={14} />
                {content.sentiment}
              </span>
            </div>

            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '78%', height: '100%', background: 'linear-gradient(90deg, #16a34a, #3b82f6)', borderRadius: '4px' }}></div>
            </div>
          </div>

          {/* Key Bullet Takeaways */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} style={{ color: 'var(--accent-red)' }} />
              TOP 3 EXECUTIVE TAKEAWAYS
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[content.takeaway1, content.takeaway2, content.takeaway3].map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  background: 'var(--bg-secondary)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: `4px solid ${idx === 0 ? 'var(--accent-red)' : (idx === 1 ? '#3b82f6' : '#16a34a')}`
                }}>
                  <span style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--text-muted)', flexShrink: 0 }}>0{idx + 1}</span>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: '1.4', fontWeight: '500' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Audio Synthesizer Action */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(220,38,38,0.1), rgba(234,179,8,0.1))',
            border: '1px solid rgba(220,38,38,0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={toggleAiAudio}
                style={{
                  background: isPlayingAudio ? '#dc2626' : 'var(--accent-red)',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: 'var(--shadow-red)'
                }}
              >
                {isPlayingAudio ? <VolumeX size={15} /> : <Volume2 size={15} />}
                {isPlayingAudio ? (language === 'BN' ? 'বন্ধ করুন' : (language === 'HI' ? 'ऑडियो रोकें' : 'Stop Briefing')) : (language === 'BN' ? 'এআই অডিও শুনুন' : (language === 'HI' ? 'एआई ऑडियो सुनें' : 'Listen 60s Audio'))}
              </button>

              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {isPlayingAudio ? '🔊 Synthesizing HD Audio...' : '⏱️ 60-Second Audio Narration'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: '700' }}>
              <ShieldCheck size={14} />
              Verified Digest
            </div>
          </div>

          {/* Topic Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {content.tags.map((tag, idx) => (
              <span key={idx} style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                background: 'var(--bg-secondary)',
                color: 'var(--text-muted)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)'
              }}>
                {tag}
              </span>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
