const express = require('express');
const { nanoid } = require('nanoid');
const URL = require('../models/URL');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper function to parse user agent
const parseUserAgent = (userAgent) => {
  const browser = userAgent.includes('Chrome') ? 'Chrome' : 
                  userAgent.includes('Firefox') ? 'Firefox' : 
                  userAgent.includes('Safari') ? 'Safari' : 'Other';
  
  const os = userAgent.includes('Windows') ? 'Windows' : 
             userAgent.includes('Mac') ? 'MacOS' : 
             userAgent.includes('Linux') ? 'Linux' : 
             userAgent.includes('Android') ? 'Android' : 
             userAgent.includes('iOS') ? 'iOS' : 'Other';
  
  const device = userAgent.includes('Mobile') ? 'Mobile' : 'Desktop';
  
  return { browser, os, device };
};

// Shorten URL
router.post('/shorten', auth, async (req, res) => {
  try {
    const { longUrl } = req.body;

    if (!longUrl) {
      return res.status(400).json({ message: 'Please provide a URL to shorten' });
    }

    // Validate URL format
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(longUrl)) {
      return res.status(400).json({ message: 'Please provide a valid URL starting with http:// or https://' });
    }

    // Generate unique short ID
    let shortId;
    let isUnique = false;
    
    while (!isUnique) {
      shortId = nanoid(8);
      const existingUrl = await URL.findOne({ shortId });
      if (!existingUrl) {
        isUnique = true;
      }
    }

    // Create new URL
    const newUrl = new URL({
      userId: req.user._id,
      longUrl,
      shortId,
      clicks: 0,
      analytics: []
    });

    await newUrl.save();

    res.status(201).json({
      message: 'URL shortened successfully',
      shortUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/${shortId}`,
      shortId,
      longUrl,
      clicks: 0
    });
  } catch (error) {
    console.error('Shorten URL error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user URLs
router.get('/user/urls', auth, async (req, res) => {
  try {
    const urls = await URL.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-analytics.userAgent');

    const formattedUrls = urls.map(url => ({
      id: url._id,
      longUrl: url.longUrl,
      shortId: url.shortId,
      shortUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/${url.shortId}`,
      clicks: url.clicks,
      createdAt: url.createdAt,
      analytics: url.analytics.map(click => ({
        timestamp: click.timestamp,
        referrer: click.referrer,
        browser: click.browser,
        os: click.os,
        device: click.device
      }))
    }));

    res.json({ urls: formattedUrls });
  } catch (error) {
    console.error('Get user URLs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete URL
router.delete('/:shortId', auth, async (req, res) => {
  try {
    const { shortId } = req.params;

    const url = await URL.findOne({ shortId, userId: req.user._id });
    
    if (!url) {
      return res.status(404).json({ message: 'URL not found or unauthorized' });
    }

    await URL.deleteOne({ _id: url._id });
    
    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Delete URL error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Redirect route (this will be used directly in server.js)
router.get('/:shortId', async (req, res) => {
  try {
    const { shortId } = req.params;
    
    const url = await URL.findOne({ shortId });
    
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Parse user agent
    const userAgent = req.headers['user-agent'] || '';
    const { browser, os, device } = parseUserAgent(userAgent);
    
    // Add analytics
    const analyticsData = {
      timestamp: new Date(),
      referrer: req.headers.referer || 'Direct',
      userAgent,
      browser,
      os,
      device
    };

    // Update clicks and analytics
    await URL.updateOne(
      { _id: url._id },
      { 
        $inc: { clicks: 1 },
        $push: { analytics: analyticsData }
      }
    );

    // Redirect to long URL
    res.redirect(url.longUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;