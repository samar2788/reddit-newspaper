// Default subreddits shown when viewing the combined feed
export const DEFAULT_SUBREDDITS = ['news', 'worldnews', 'technology', 'science', 'popular'];

// All browsable subreddits in the filter bar
export const SUBREDDIT_LIST = [
  { value: 'all',          label: 'All' },
  { value: 'news',         label: 'News' },
  { value: 'worldnews',    label: 'World' },
  { value: 'technology',   label: 'Tech' },
  { value: 'science',      label: 'Science' },
  { value: 'popular',      label: 'Popular' },
  { value: 'programming',  label: 'Programming' },
  { value: 'gaming',       label: 'Gaming' },
  { value: 'todayilearned',label: 'TIL' },
  { value: 'askreddit',    label: 'AskReddit' },
  { value: 'space',        label: 'Space' },
];

// Sort options
export const SORT_OPTIONS = [
  { value: 'hot',           label: 'Hot' },
  { value: 'new',           label: 'Latest' },
  { value: 'top',           label: 'Top' },
  { value: 'rising',        label: 'Rising' },
  { value: 'controversial', label: 'Controversial' },
];

export const DEFAULT_SORT = 'hot';

// Number of posts to request per fetch
export const POSTS_LIMIT = 30;

// Auto-refresh interval in ms (60 seconds)
export const AUTO_REFRESH_INTERVAL = 60_000;

// Debounce delay for search input in ms
export const SEARCH_DEBOUNCE_MS = 500;

// Set to true to route API calls through local Express proxy (see /proxy)
export const USE_PROXY = false;
export const PROXY_BASE_URL = 'http://localhost:3001';

export const REDDIT_BASE_URL = 'https://www.reddit.com';

// On Vercel (or any non-localhost deployment) use the serverless proxy function
// so Reddit API calls go server-to-server and avoid CORS blocks.
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

export const USE_VERCEL_PROXY = !isLocalhost;
// Base URL for the Vercel proxy — empty string means same origin
export const VERCEL_PROXY_BASE = '';
