# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Reddit Newspaper** — A React SPA that fetches Reddit posts and displays them in a premium broadsheet newspaper UI. React 18 + Vite 5, plain JavaScript (no TypeScript), component-scoped CSS files.

## Commands

```bash
# Install
npm install

# Run dev server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Optional CORS proxy (only if needed, see proxy/)
cd proxy && npm install && npm start
```

## Architecture

```
src/
  constants/config.js   — All tunable values (subreddits, intervals, limits, proxy toggle)
  api/reddit.js         — fetchPosts, fetchUserPosts, fetchUserAbout, searchPosts
  utils/helpers.js      — sanitizePost, sanitizeUser, extractImage, formatRelativeTime,
                          formatScore, formatKarma, formatUpvoteRatio, mergePosts, etc.
  hooks/useDebounce.js  — Debounce hook used by search

  App.jsx               — Root: all state lives here (posts, search, sort, subreddit,
                          selectedArticle, autoRefresh, pendingPosts, refreshStatus,
                          userAbout, searchMode/searchValue derived via parseSearch())
  components/
    Header/             — Newspaper masthead; sticky; date, live/paused status,
                          refresh button, auto-refresh toggle
    SearchBar/          — Smart search: detects u/username (user mode), r/subreddit
                          (subreddit mode), or free text (search mode); mode badge shown
    FeedControls/       — Sort chips + subreddit chips + custom r/ input form;
                          hidden during search/user/subreddit modes
    NewsBanner/         — "N new stories" banner shown when background refresh finds new posts
    NewspaperGrid/      — Layout: FeaturedArticle (feed only) + large-row (feed only)
                          + 3-col grid; shows section label for non-feed modes
    FeaturedArticle/    — Hero card; large image with ink overlay, typographic fallback;
                          shows score, ratio, comments, awards
    ArticleCard/        — Standard card; accent colour bar; post type badge (VIDEO/IMAGE/
                          GALLERY/LINK/SELF); award star; upvote ratio bar; stagger animation
    ArticleModal/       — Focused detail view; stats grid (score, comments, ratio, awards,
                          crossposts, domain); ratio bar; clickable author (→ user search)
                          and subreddit (→ subreddit browse); comments link
    UserProfile/        — Shown above grid when browsing u/username; avatar, karma stats,
                          account age, bio, Reddit profile link
    LoadingSkeleton/    — Newspaper-shaped shimmer skeleton
    ErrorState/         — Typographic error display with retry
    EmptyState/         — Empty results message
```

## Search Modes

`parseSearch(query)` in `App.jsx` converts the search input to one of four modes:

| Input pattern   | Mode        | API called                        |
|-----------------|-------------|-----------------------------------|
| `u/someuser`    | `user`      | `fetchUserPosts` + `fetchUserAbout` |
| `r/subreddit`   | `subreddit` | `fetchPosts([name], sort)`        |
| any other text  | `search`    | `searchPosts(query)`              |
| empty           | `feed`      | `fetchPosts(DEFAULT_SUBREDDITS)` or single subreddit |

- FeedControls (sort chips + subreddit chips + custom r/ input) only visible in `feed` mode.
- `UserProfile` shown above grid only in `user` mode when `userAbout` is loaded.
- Auto-refresh only runs in `feed` mode.

## Key Data Flow

1. `App.jsx` derives `{ mode, value }` via `useMemo(parseSearch, [debouncedSearch])`.
2. `doFetch(false)` runs on every `[searchMode, searchValue, activeSort, activeSubreddit]` change.
3. Background refresh runs via `setInterval` calling `doFetch(true)` (feed mode only), populating `pendingPosts`.
4. `NewsBanner` appears when `pendingPosts.length > 0`; clicking merges and clears pending.
5. `selectedArticle` triggers `ArticleModal`. Escape key and backdrop click close it.
6. Clicking author in modal sets `searchQuery = "u/${author}"` → user mode.
7. Clicking subreddit in modal sets `searchQuery = "r/${subreddit}"` → subreddit mode.

## Post Data Shape (`sanitizePost`)

All posts include these fields after sanitization:

```js
{
  id, title, subreddit, subredditPrefixed, author,
  score, upvoteRatio, numComments,
  createdUtc, flair,
  selftext, url, permalink, domain,
  thumbnail, preview,
  isVideo, isSelf, isNsfw, isSpoiler, isLocked, isStickied,
  isOriginalContent, distinguished,   // null | 'moderator' | 'admin'
  gilded, totalAwardsReceived, crosspostCount,
  postType,    // 'video' | 'image' | 'gallery' | 'self' | 'link'
}
```

## User Profile Shape (`sanitizeUser`)

```js
{
  id, name, linkKarma, commentKarma, totalKarma,
  createdUtc, iconImg, snoovatarImg,
  isGold, isMod, hasVerifiedEmail, publicDescription, displayName
}
```

## Configuration

Edit `src/constants/config.js` to change:
- `AUTO_REFRESH_INTERVAL` (default 60 000 ms)
- `POSTS_LIMIT` (default 30)
- `DEFAULT_SUBREDDITS` (multi-feed when activeSubreddit is 'all')
- `SUBREDDIT_LIST` (chips shown in FeedControls)
- `SORT_OPTIONS` (includes hot/new/top/rising/controversial)
- `USE_PROXY` / `PROXY_BASE_URL` (if Reddit CORS blocks)

## CORS Notes

Reddit's JSON API works from browsers in most cases. If you hit CORS errors:
1. Set `USE_PROXY = true` in `src/constants/config.js`
2. `cd proxy && npm install && npm start` (runs on port 3001)

## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.
