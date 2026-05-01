/**
 * Vercel serverless function — proxies Reddit API requests server-side,
 * bypassing browser CORS restrictions on production deployments.
 *
 * Handles: /api/reddit?path=/r/news/hot.json&limit=30&...
 */

// api.reddit.com is the dedicated API endpoint — less likely to be blocked from datacenters
const REDDIT_BASE = 'https://api.reddit.com';

export default async function handler(req, res) {
  // Use WHATWG URL API to parse query — avoids deprecated url.parse() (DEP0169)
  const { searchParams } = new URL(req.url, 'http://localhost');
  const path = searchParams.get('path');

  if (!path) {
    return res.status(400).json({ error: 'Missing required query param: path' });
  }

  const redditUrl = new URL(`${REDDIT_BASE}${path}`);
  for (const [k, v] of searchParams.entries()) {
    if (k !== 'path') redditUrl.searchParams.set(k, v);
  }

  try {
    const response = await fetch(redditUrl.toString(), {
      headers: {
        // Reddit requires a descriptive User-Agent for API access
        'User-Agent': 'web:reddit-newspaper:v1.0.0 (vercel serverless)',
        Accept: 'application/json',
      },
    });

    const text = await response.text();

    // Detect HTML block/captcha page from Reddit
    if (text.trimStart().startsWith('<')) {
      return res.status(503).json({
        error: 'Reddit blocked the request from this server. Try again shortly.',
      });
    }

    const data = JSON.parse(text);
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
