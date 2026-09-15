require('dotenv').config();
const crypto = require('crypto');
const Parser = require('rss-parser');
const cron = require('node-cron');
const connectDB = require('../config/db');
const Article = require('../models/Article');
const BreakingTicker = require('../models/BreakingTicker');
const { isSafeHttpUrl } = require('../config/validation');

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail', 'content:encoded']
  }
});

// Comprehensive Real-Time Wire Feed Sources
const RSS_SOURCES = [
  { name: 'NDTV National Feed', url: 'https://feeds.feedburner.com/ndtvnews-top-stories', category: 'national', lang: 'EN' },
  { name: 'ABP Ananda Bengali Feed', url: 'https://bengali.abplive.com/home/feed', category: 'world', lang: 'BN' },
  { name: 'BBC Hindi Wire', url: 'https://feeds.bbci.co.uk/hindi/rss.xml', category: 'world', lang: 'HI' },
  { name: 'Global News Wire (NYT World)', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'world', lang: 'EN' },
  { name: 'Tech & Innovation Wire', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', category: 'tech', lang: 'EN' },
  { name: 'Business & Markets Wire', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', category: 'business', lang: 'EN' },
  { name: 'Sports Wire', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml', category: 'sports', lang: 'EN' }
];

const fetchAndIngestFeeds = async () => {
  await connectDB();
  console.log('🔄 [RSS Worker] Ingesting real-time wire news feeds...');
  let totalIngested = 0;

  for (const [sourceIdx, source] of RSS_SOURCES.entries()) {
    try {
      const feed = await parser.parseURL(source.url);
      if (!feed || !feed.items) continue;

      for (const [index, item] of feed.items.slice(0, 6).entries()) {
        const cleanTitle = (item.title || '').trim();
        const cleanSummary = (item.contentSnippet || item.title || '').trim();
        const sourceKey = item.guid || item.id || item.link || `${cleanTitle}|${item.pubDate || ''}`;
        if (!cleanTitle || !sourceKey) continue;

        const articleId = `rss-${crypto.createHash('sha256').update(`${source.name}|${sourceKey}`).digest('hex').slice(0, 32)}`;
        const candidateImage = item['media:content']?.$.url || item['media:thumbnail']?.$.url || '';
        const imageUrl = isSafeHttpUrl(candidateImage) ? candidateImage : 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
        const titleByLanguage = { EN: '', BN: '', HI: '' };
        const summaryByLanguage = { EN: '', BN: '', HI: '' };
        titleByLanguage[source.lang] = cleanTitle;
        summaryByLanguage[source.lang] = cleanSummary;

        // Preserve the feed's actual source language. Translation is an editorial workflow concern.
        const articleData = {
          articleId,
          title: titleByLanguage,
          summary: summaryByLanguage,
          content: summaryByLanguage,
          sourceLanguage: source.lang,
          category: source.category,
          author: source.name,
          sourceAgency: source.name,
          sourceUrl: item.link || '',
          readTime: '3 min read',
          image: imageUrl,
          views: 0,
          viewsFormatted: '—',
          trending: index < 3,
          hero: sourceIdx === 0 && index === 0, // Top National story becomes Hero Feature
          breaking: index === 0,
          status: 'published',
          publishedAt: item.pubDate && !Number.isNaN(new Date(item.pubDate).getTime()) ? new Date(item.pubDate) : new Date()
        };

        try {
          await Article.findOneAndUpdate(
            { articleId },
            { $set: articleData },
            { upsert: true, returnDocument: 'after' }
          );

          // If item is top story, also seed Breaking Ticker Marquee item
          if (index < 2) {
            const tickerId = `ticker-rss-${sourceIdx}-${index}`;
            await BreakingTicker.findOneAndUpdate(
              { tickerId },
              {
                $set: {
                  tickerId,
                  title: { EN: cleanTitle, BN: cleanTitle, HI: cleanTitle },
                  category: source.category.toUpperCase(),
                  time: item.pubDate ? new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'LIVE',
                  urgent: true,
                  active: true,
                  priority: sourceIdx * 2 + index
                }
              },
              { upsert: true, returnDocument: 'after' }
            );
          }

          totalIngested++;
        } catch (dbErr) {
          // If DB is offline, worker handles gracefully
        }
      }
    } catch (err) {
      console.warn(`⚠️ [RSS Worker] Skip feed ${source.name}: ${err.message}`);
    }
  }

  console.log(`✅ [RSS Worker] Real-time live news ingestion complete (${totalIngested} items synced).`);
};

// Start periodic cron schedule (Every 10 minutes)
const initNewsIngestor = () => {
  fetchAndIngestFeeds();

  cron.schedule('*/10 * * * *', () => {
    fetchAndIngestFeeds();
  });
};

module.exports = { initNewsIngestor, fetchAndIngestFeeds };
