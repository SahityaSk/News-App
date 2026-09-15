import React, { useState, useEffect } from 'react';
import { Vote, CheckCircle2, TrendingUp, Sparkles, Hash, BarChart2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function PollAndTopicRadar({ language = 'EN', onSelectTag, activeSearchQuery = '' }) {
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPoll = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/polls/active?lang=${language}`);
        const data = await res.json();
        if (isMounted && data.success && data.data) {
          setPoll(data.data);
        }
      } catch (err) {
        console.warn('⚠️ Could not fetch active poll:', err.message);
      }
    };
    fetchPoll();
    return () => { isMounted = false; };
  }, [language]);

  const defaultPollData = {
    question: language === 'BN' ? 'দিনের ওপিনিয়ন পোল: ২০৩০ সালের মধ্যে এআই কি আন্তর্জাতিক অনুসন্ধানী সাংবাদিকতা সম্পূর্ণ বদলে দেবে?' : (language === 'HI' ? 'आज का पोल: क्या 2030 तक आर्टिफिशियल इंटेलिजेंस खोजी पत्रकारिता का स्वरूप पूरी तरह बदल देगा?' : 'Poll of the Day: Will AI Agents completely reshape global investigative journalism by 2030?'),
    totalVotes: 2290,
    options: [
      { optionId: 'opt-1', text: language === 'BN' ? 'হ্যাঁ, গবেষণায় এআই প্রাধান্য পাবে' : (language === 'HI' ? 'हाँ, शोध में एआई का दबदबा होगा' : 'Yes, mandatory global framework'), votes: 1420 },
      { optionId: 'opt-2', text: language === 'BN' ? 'না, মানুষের দৃষ্টিভঙ্গি অপরিহার্য' : (language === 'HI' ? 'नहीं, मानवीय संपादन जरूरी है' : 'No, national sovereignty first'), votes: 680 },
      { optionId: 'opt-3', text: language === 'BN' ? 'অনিশ্চিত / যৌথ মডেল' : (language === 'HI' ? 'अनिश्चित / हाइब्रिड मॉडल' : 'Undecided / Needs further research'), votes: 190 }
    ]
  };

  const trendingTags = language === 'BN' 
    ? ["#কৃত্রিমবুদ্ধিমত্তা", "#গ্লোবালঅর্থনীতি", "#শেয়ারবাজার", "#কোয়ান্টামটেক", "#টি২০ক্রিকেট", "#সবুজশক্তি"]
    : (language === 'HI' 
      ? ["#आर्टिफिशियलइंटेलिजेंस", "#ग्लोबलइकोनॉमी", "#शेयरबाज़ार", "#क्वांटमटेक", "#क्रिकेट2026", "#ग्रीनएनर्जी"]
      : ["#AIRevolution", "#GlobalEconomy", "#Nifty50", "#QuantumLeap", "#Cricket2026", "#SpaceXMars", "#GreenTech"]);

  const activePoll = poll || defaultPollData;
  const totalVotesCount = activePoll.totalVotes || 1;

  const handleVote = async (optId) => {
    if (hasVoted || submitting) return;
    setSelectedOption(optId);
    setHasVoted(true);
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/polls/vote?lang=${language}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId: activePoll.pollId || 'daily-poll-1', optionId: optId })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPoll(data.data);
      }
    } catch (err) {
      console.warn('⚠️ Poll vote submission failed:', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container" style={{ margin: '1.5rem auto 1rem auto' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        
        {/* Left Side: Interactive Poll of the Day */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{
                background: 'var(--accent-red)',
                color: '#fff',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: '900',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Vote size={12} />
                LIVE OPINION POLL
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                🗳️ {totalVotesCount.toLocaleString()} {language === 'BN' ? 'জন ভোট দিয়েছেন' : (language === 'HI' ? 'वोट दर्ज' : 'Votes Recorded')}
              </span>
            </div>

            <h3 style={{
              fontSize: '1rem',
              fontWeight: '800',
              color: 'var(--text-primary)',
              margin: '0 0 1rem 0',
              lineHeight: '1.4'
            }}>
              {activePoll.question}
            </h3>

            {/* Poll Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activePoll.options.map((opt) => {
                const optId = opt.optionId || opt.id;
                const isSelected = selectedOption === optId;
                const percent = Math.round((opt.votes / totalVotesCount) * 100) || 0;
                return (
                  <button
                    key={optId}
                    onClick={() => handleVote(optId)}
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--accent-red)' : '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s'
                    }}
                  >
                    {/* Animated Fill Bar if voted */}
                    {hasVoted && (
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${percent}%`,
                        background: isSelected ? 'rgba(220, 38, 38, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        zIndex: 1
                      }} />
                    )}

                    <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isSelected && <CheckCircle2 size={16} style={{ color: 'var(--accent-red)' }} />}
                      {opt.text}
                    </span>

                    {hasVoted && (
                      <span style={{ position: 'relative', zIndex: 2, fontWeight: '900', color: isSelected ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                        {percent}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {hasVoted && (
            <p style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '700', margin: '10px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ✓ Thank you for voting! Results updated live.
            </p>
          )}
        </div>

        {/* Right Side: Trending Topic Radar Tags */}
        <div style={{
          borderLeft: '1px solid var(--border-color)',
          paddingLeft: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Sparkles size={16} style={{ color: 'var(--accent-gold)' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                {language === 'BN' ? 'ট্রেন্ডিং টপিক রাডার' : (language === 'HI' ? 'ट्रेंडिंग टॉपिक रडार' : 'TRENDING TOPIC RADAR')}
              </h4>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
              {language === 'BN' ? 'সরাসরি খবর খুঁজতে যেকোনো টপিকে ক্লিক করুন:' : (language === 'HI' ? 'समाचार फ़िल्टर करने के लिए किसी टॉपिक पर क्लिक करें:' : 'Click any topic to filter real-time articles:')}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {trendingTags.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectTag && onSelectTag(tag.replace('#', ''))}
                  style={{
                    background: activeSearchQuery.toLowerCase() === tag.replace('#', '').toLowerCase() ? 'var(--accent-red)' : 'var(--bg-card)',
                    color: activeSearchQuery.toLowerCase() === tag.replace('#', '').toLowerCase() ? '#fff' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-full)',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <Hash size={12} style={{ opacity: 0.7 }} />
                  {tag.replace('#', '')}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            marginTop: '1rem',
            background: 'var(--bg-card)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <BarChart2 size={20} style={{ color: '#3b82f6', flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
              ⚡ <strong>Topic Insights:</strong> AI and Market trends have gained 140% reader engagement in the last 2 hours.
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
