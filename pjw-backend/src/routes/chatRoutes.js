const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { askQuestion } = require('../controllers/chatController');

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
    res.status(429).json({ error: `Rate limit exceeded. Retry after ${retryAfter} seconds.` });
  }
});

router.post('/', chatLimiter, askQuestion);

module.exports = router;
