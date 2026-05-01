/**
 * Format a Unix timestamp as a relative time string (e.g. "3 hours ago")
 */
export function formatRelativeTime(utcSeconds) {
  const diff = Math.floor(Date.now() / 1000) - utcSeconds;
  if (diff < 60) return 'just now';
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return `${m}m ago`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `${h}h ago`;
  }
  if (diff < 604800) {
    const d = Math.floor(diff / 86400);
    return `${d}d ago`;
  }
  return formatFullDate(utcSeconds);
}

/**
 * Format a Unix timestamp as a long date string (e.g. "May 1, 2026")
 */
export function formatFullDate(utcSeconds) {
  return new Date(utcSeconds * 1000).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a Date object as HH:MM AM/PM
 */
export function formatTime(date) {
  if (!date) return null;
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Get today as a newspaper-style dateline: "Friday, May 1, 2026"
 */
export function getTodayFormatted() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Extract the best available image URL from a Reddit post object.
 */
export function extractImage(post) {
  if (post.preview?.images?.[0]) {
    const img = post.preview.images[0];
    const resolutions = img.resolutions || [];
    const mid = resolutions.find(r => r.width >= 400 && r.width <= 800);
    const source = mid || resolutions[resolutions.length - 1] || img.source;
    if (source?.url) {
      return source.url.replace(/&amp;/g, '&');
    }
  }

  if (
    post.thumbnail &&
    !['self', 'default', 'nsfw', 'spoiler', 'image', ''].includes(post.thumbnail) &&
    post.thumbnail.startsWith('http')
  ) {
    return post.thumbnail;
  }

  if (post.url && /\.(jpe?g|png|gif|webp)(\?.*)?$/i.test(post.url)) {
    return post.url;
  }

  return null;
}

/**
 * Extract the display domain from a URL (strips www.)
 */
export function extractDomain(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * Truncate text to maxLen chars, breaking at a word boundary.
 */
export function truncate(text, maxLen = 220) {
  if (!text || text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…';
}

/**
 * Format a score number (e.g. 12345 → "12.3k")
 */
export function formatScore(score) {
  if (score >= 1_000_000) return `${(score / 1_000_000).toFixed(1)}m`;
  if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
  return String(score);
}

/**
 * Format karma / large numbers (same as score but named for clarity)
 */
export function formatKarma(karma) {
  return formatScore(karma);
}

/**
 * Format upvote ratio as a percentage string (e.g. 0.95 → "95%")
 */
export function formatUpvoteRatio(ratio) {
  return `${Math.round((ratio ?? 1) * 100)}%`;
}

/**
 * Derive a post type hint from raw post data.
 * Returns: 'video' | 'image' | 'self' | 'link' | 'gallery'
 */
export function derivePostType(raw) {
  if (raw.is_video || raw.media?.reddit_video) return 'video';
  if (raw.is_gallery || raw.gallery_data) return 'gallery';
  if (raw.post_hint === 'image' || /\.(jpe?g|png|gif|webp)(\?.*)?$/i.test(raw.url || '')) return 'image';
  if (raw.is_self) return 'self';
  return 'link';
}

/**
 * Normalize a raw Reddit post from the API into our app's shape.
 */
export function sanitizePost(raw) {
  const selftext = raw.selftext === '[removed]' || raw.selftext === '[deleted]'
    ? ''
    : (raw.selftext || '');

  return {
    id: raw.id,
    title: raw.title || 'Untitled',
    subreddit: raw.subreddit || '',
    subredditPrefixed: raw.subreddit_name_prefixed || `r/${raw.subreddit}`,
    author: raw.author === '[deleted]' ? '[deleted]' : (raw.author || '[unknown]'),
    score: raw.score ?? 0,
    upvoteRatio: raw.upvote_ratio ?? 1,
    numComments: raw.num_comments ?? 0,
    createdUtc: raw.created_utc,
    flair: raw.link_flair_text || null,
    selftext,
    url: raw.url || '',
    permalink: `https://www.reddit.com${raw.permalink || ''}`,
    domain: raw.domain || extractDomain(raw.url),
    thumbnail: raw.thumbnail || null,
    preview: raw.preview || null,
    isVideo: raw.is_video || false,
    isSelf: raw.is_self || false,
    isNsfw: raw.over_18 || false,
    isSpoiler: raw.spoiler || false,
    isLocked: raw.locked || false,
    isStickied: raw.stickied || false,
    isOriginalContent: raw.is_original_content || false,
    distinguished: raw.distinguished || null,     // null | 'moderator' | 'admin'
    gilded: raw.gilded || 0,
    totalAwardsReceived: raw.total_awards_received || 0,
    crosspostCount: raw.num_crossposts || 0,
    postType: derivePostType(raw),
    authorFullname: raw.author_fullname || null,
    subredditId: raw.subreddit_id || null,
  };
}

/**
 * Normalize a raw Reddit user profile from /about.json
 */
export function sanitizeUser(raw) {
  return {
    id: raw.id,
    name: raw.name,
    linkKarma: raw.link_karma ?? 0,
    commentKarma: raw.comment_karma ?? 0,
    totalKarma: (raw.link_karma ?? 0) + (raw.comment_karma ?? 0),
    createdUtc: raw.created_utc,
    iconImg: raw.icon_img ? raw.icon_img.replace(/&amp;/g, '&') : null,
    snoovatarImg: raw.snoovatar_img ? raw.snoovatar_img.replace(/&amp;/g, '&') : null,
    isGold: raw.is_gold || false,
    isMod: raw.is_mod || false,
    hasVerifiedEmail: raw.has_verified_email || false,
    publicDescription: raw.subreddit?.public_description || '',
    displayName: raw.subreddit?.display_name_prefixed || `u/${raw.name}`,
  };
}

/**
 * Remove duplicate posts by their ID.
 */
export function removeDuplicates(posts) {
  const seen = new Set();
  return posts.filter(p => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

/**
 * Merge incoming posts into the existing list, deduplicating and sorting newest-first.
 */
export function mergePosts(existing, incoming) {
  return removeDuplicates([...incoming, ...existing]).sort(
    (a, b) => b.createdUtc - a.createdUtc
  );
}
