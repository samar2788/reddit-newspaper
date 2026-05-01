/**
 * Optional Express proxy server to avoid Reddit CORS issues.
 * Only needed if the browser blocks direct Reddit API calls.
 *
 * Usage:
 *   cd proxy && npm install && npm start
 *   Then set USE_PROXY=true in src/constants/config.js
 */

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;
const REDDIT_BASE = 'https://www.reddit.com';

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Proxy any /r/* or /search* path to Reddit
app.get('/r/*', proxyToReddit);
app.get('/search*', proxyToReddit);

async function proxyToReddit(req, res) {
  const redditUrl = `${REDDIT_BASE}${req.path}${req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''}`;

  try {
    const response = await fetch(redditUrl, {
      headers: {
        'User-Agent': 'RedditNewspaper/1.0 (educational project)',
        Accept: 'application/json',
      },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

app.listen(PORT, () => {
  console.log(`Reddit proxy running at http://localhost:${PORT}`);
});
