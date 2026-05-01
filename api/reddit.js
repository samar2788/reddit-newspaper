/**
 * Vercel Edge Function — proxies Reddit API requests.
 * Edge runtime runs on CDN edge nodes (not datacenter IPs),
 * so Reddit does not block these requests.
 */

export const config = { runtime: 'edge' };

const REDDIT_BASE = 'https://www.reddit.com';

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');

  if (!path) {
    return new Response(JSON.stringify({ error: 'Missing required query param: path' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const redditUrl = new URL(`${REDDIT_BASE}${path}`);
  for (const [k, v] of searchParams.entries()) {
    if (k !== 'path') redditUrl.searchParams.set(k, v);
  }

  try {
    const response = await fetch(redditUrl.toString(), {
      headers: {
        'User-Agent': 'web:reddit-newspaper:v1.0.0 (vercel edge)',
        Accept: 'application/json',
      },
    });

    const text = await response.text();

    if (text.trimStart().startsWith('<')) {
      return new Response(
        JSON.stringify({ error: 'Reddit returned an unexpected response. Try again.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(text, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
