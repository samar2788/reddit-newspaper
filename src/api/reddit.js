import {
  REDDIT_BASE_URL,
  PROXY_BASE_URL,
  USE_PROXY,
  USE_VERCEL_PROXY,
  VERCEL_PROXY_BASE,
  POSTS_LIMIT,
} from '../constants/config.js';
import { sanitizePost, sanitizeUser, removeDuplicates } from '../utils/helpers.js';

function buildUrl(path, params = {}) {
  // Priority: local Express proxy > Vercel serverless proxy > direct Reddit
  if (USE_PROXY) {
    const url = new URL(`${PROXY_BASE_URL}${path}`);
    url.searchParams.set('raw_json', '1');
    url.searchParams.set('limit', String(POSTS_LIMIT));
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    return url.toString();
  }

  if (USE_VERCEL_PROXY) {
    // Route through /api/reddit?path=<reddit-path>&<params>
    const url = new URL(`${VERCEL_PROXY_BASE}/api/reddit`, window.location.origin);
    url.searchParams.set('path', path);
    url.searchParams.set('raw_json', '1');
    url.searchParams.set('limit', String(POSTS_LIMIT));
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    return url.toString();
  }

  const url = new URL(`${REDDIT_BASE_URL}${path}`);
  url.searchParams.set('raw_json', '1');
  url.searchParams.set('limit', String(POSTS_LIMIT));
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}

async function redditFetch(url, signal) {
  const response = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' },
  });

  if (response.status === 429) {
    throw new Error(
      'Reddit is rate-limiting requests. Please wait a moment before refreshing.'
    );
  }
  if (response.status === 403) {
    throw new Error('Access to this content is restricted.');
  }
  if (response.status === 404) {
    throw new Error('Not found. Check the subreddit or username.');
  }
  if (!response.ok) {
    throw new Error(`Reddit API returned ${response.status}. Please try again.`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.message || 'Reddit API error');
  }

  return data;
}

/**
 * Fetch posts from one or more subreddits.
 */
export async function fetchPosts(subreddits, sort = 'hot', signal) {
  const sub = Array.isArray(subreddits) ? subreddits.join('+') : subreddits;
  const url = buildUrl(`/r/${sub}/${sort}.json`);
  const data = await redditFetch(url, signal);
  const posts = data.data.children.map(c => sanitizePost(c.data));
  return removeDuplicates(posts);
}

/**
 * Fetch posts submitted by a specific Reddit user.
 * @param {string} username — without u/ prefix
 * @param {'hot'|'new'|'top'|'controversial'} sort
 * @param {AbortSignal} signal
 */
export async function fetchUserPosts(username, sort = 'new', signal) {
  const url = buildUrl(`/user/${username}/submitted.json`, { sort });
  const data = await redditFetch(url, signal);
  const posts = data.data.children.map(c => sanitizePost(c.data));
  return removeDuplicates(posts);
}

/**
 * Fetch public profile info for a Reddit user.
 * @param {string} username — without u/ prefix
 * @param {AbortSignal} signal
 * @returns {Promise<object>} sanitized user profile
 */
export async function fetchUserAbout(username, signal) {
  const url = buildUrl(`/user/${username}/about.json`);
  const data = await redditFetch(url, signal);
  return sanitizeUser(data.data);
}

/**
 * Search Reddit for posts matching a keyword.
 * @param {string} query
 * @param {string|null} subreddit — restrict search to this subreddit (optional)
 * @param {AbortSignal} signal
 */
export async function searchPosts(query, subreddit = null, signal) {
  const params = { q: query, sort: 'relevance', type: 'link' };
  const path = subreddit ? `/r/${subreddit}/search.json` : '/search.json';
  if (subreddit) params.restrict_sr = '1';
  const url = buildUrl(path, params);
  const data = await redditFetch(url, signal);
  const posts = data.data.children.map(c => sanitizePost(c.data));
  return removeDuplicates(posts);
}
