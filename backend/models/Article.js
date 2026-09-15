const mongoose = require('mongoose');

const MultiLangStringSchema = new mongoose.Schema({
  EN: { type: String, default: '' },
  BN: { type: String, default: '' },
  HI: { type: String, default: '' }
}, { _id: false });

const RevisionSchema = new mongoose.Schema({
  updatedBy: { type: String, default: 'Editorial Desk' },
  updatedAt: { type: Date, default: Date.now },
  note: { type: String, default: 'Content update' }
}, { _id: false });

const ArticleSchema = new mongoose.Schema({
  articleId: { type: String, required: true, unique: true, index: true },
  slug: { type: String, index: true },
  title: MultiLangStringSchema,
  deck: MultiLangStringSchema,
  summary: MultiLangStringSchema,
  content: MultiLangStringSchema,
  category: { 
    type: String, 
    enum: ['world', 'tech', 'business', 'sports', 'entertainment', 'science', 'national', 'opinion', 'general'],
    default: 'world',
    index: true
  },
  author: { type: String, default: 'YUGANTAR Bureau' },
  byline: { type: String, default: 'YUGANTAR Editorial' },
  desk: { type: String, default: 'Main Desk' },
  location: { type: String, default: 'Kolkata, IN' },
  tags: [{ type: String }],
  sourceAgency: { type: String, default: 'YUGANTAR' },
  sourceLanguage: { type: String, enum: ['EN', 'BN', 'HI', 'UNKNOWN'], default: 'UNKNOWN' },
  sourceUrl: { type: String, default: '' },
  readTime: { type: String, default: '3 min read' },
  image: { type: String, default: '' },
  views: { type: Number, default: 0 },
  viewsFormatted: { type: String, default: '—' },
  trending: { type: Boolean, default: false },
  hero: { type: Boolean, default: false },
  breaking: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'published',
    index: true
  },
  revisionHistory: [RevisionSchema],
  scheduledAt: { type: Date },
  publishedAt: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Article', ArticleSchema);
