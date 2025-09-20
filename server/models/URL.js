const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  referrer: {
    type: String,
    default: 'Direct'
  },
  userAgent: {
    type: String,
    default: ''
  },
  browser: String,
  os: String,
  device: String
});

const urlSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  longUrl: {
    type: String,
    required: true,
    trim: true
  },
  shortId: {
    type: String,
    required: true,
    unique: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  analytics: [analyticsSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('URL', urlSchema);