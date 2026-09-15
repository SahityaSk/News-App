const mongoose = require('mongoose');

const MultiLangStringSchema = new mongoose.Schema({
  EN: { type: String, default: '' },
  BN: { type: String, default: '' },
  HI: { type: String, default: '' }
}, { _id: false });

const ArticleSchema = new mongoose.Schema({
  articleId: { type: String, required: true, unique: true },
  title: MultiLangStringSchema,
  summary: MultiLangStringSchema,
  content: MultiLangStringSchema,
  category: { 
    type: String, 
    enum: ['world', 'tech', 'business', 'sports', 'entertainment', 'science', 'national', 'general'],
    default: 'world'
  },
  author: { type: String, default: 'YUGANTAR Bureau' },
  sourceAgency: { type: String, default: 'YUGANTAR' }, // 'PTI', 'ANI', 'NDTV', 'EDITORIAL'
  sourceUrl: { type: String, default: '' },
  readTime: { type: String, default: '3 min read' },
  image: { type: String, default: '' },
  views: { type: Number, default: 0 },
  viewsFormatted: { type: String, default: '10K' },
  trending: { type: Boolean, default: false },
  hero: { type: Boolean, default: false },
  breaking: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  publishedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Article', ArticleSchema);
