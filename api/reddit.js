/**
 * Vercel serverless function — proxies Reddit API requests server-side,
 * bypassing browser CORS restrictions on production deployments.
 *
 * Handles: /api/reddit?path=/r/news/hot.json&limit=30&...
 */

const REDDIT_BASE = 'https://www.reddit.com';

export default async function handler(req, res) {
  const { path, ...params } = req.query;

  if (!path) {
    return res.status(400).json({ error: 'Missing required query param: path' });
  }

  // Build Reddit URL preserving all query params
  const url = new URL(`${REDDIT_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'RedditNewspaper/1.0 (educational project; vercel deployment)',
        Accept: 'application/json',
      },
    });

    const data = await response.json();

    // Pass Reddit's status through
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
