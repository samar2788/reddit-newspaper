import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Header from './components/Header/Header.jsx';
import SearchBar from './components/SearchBar/SearchBar.jsx';
import FeedControls from './components/FeedControls/FeedControls.jsx';
import NewsBanner from './components/NewsBanner/NewsBanner.jsx';
import NewspaperGrid from './components/NewspaperGrid/NewspaperGrid.jsx';
import ArticleModal from './components/ArticleModal/ArticleModal.jsx';
import UserProfile from './components/UserProfile/UserProfile.jsx';
import ErrorState from './components/ErrorState/ErrorState.jsx';
import { fetchPosts, searchPosts, fetchUserPosts, fetchUserAbout } from './api/reddit.js';
import { mergePosts } from './utils/helpers.js';
import { DEFAULT_SUBREDDITS, DEFAULT_SORT, AUTO_REFRESH_INTERVAL } from './constants/config.js';
import { useDebounce } from './hooks/useDebounce.js';
import './App.css';

/**
 * Parse a search query into a mode and canonical value.
 * u/someuser  → { mode: 'user',      value: 'someuser' }
 * r/subreddit → { mode: 'subreddit', value: 'subreddit' }
 * anything    → { mode: 'search',    value: query }
 * empty       → { mode: 'feed',      value: '' }
 */
function parseSearch(query) {
  const q = query.trim();
  if (!q) return { mode: 'feed', value: '' };
  const userMatch = q.match(/^u\/(\w+)$/i);
  if (userMatch) return { mode: 'user', value: userMatch[1] };
  const subMatch = q.match(/^r\/([\w+]+)$/i);
  if (subMatch) return { mode: 'subreddit', value: subMatch[1] };
  return { mode: 'search', value: q };
}

export default function App() {
  const [posts, setPosts]                     = useState([]);
  const [pendingPosts, setPendingPosts]       = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [searchQuery, setSearchQuery]         = useState('');
  const [activeSort, setActiveSort]           = useState(DEFAULT_SORT);
  const [activeSubreddit, setActiveSubreddit] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastUpdated, setLastUpdated]         = useState(null);
  const [refreshStatus, setRefreshStatus]     = useState('live');
  const [userAbout, setUserAbout]             = useState(null);

  const debouncedSearch = useDebounce(searchQuery, 500);
  const mainAbortRef    = useRef(null);
  const bgAbortRef      = useRef(null);
  const intervalRef     = useRef(null);

  // Derive search mode from debounced query
  const { mode: searchMode, value: searchValue } = useMemo(
    () => parseSearch(debouncedSearch),
    [debouncedSearch]
  );

  // ── Core fetch ─────────────────────────────────────────────────────────────
  const doFetch = useCallback(async (isBackground = false) => {
    if (isBackground) {
      if (bgAbortRef.current) bgAbortRef.current.abort();
    } else {
      if (mainAbortRef.current) mainAbortRef.current.abort();
    }

    const controller = new AbortController();
    if (isBackground) {
      bgAbortRef.current = controller;
      setRefreshStatus('refreshing');
    } else {
      mainAbortRef.current = controller;
      setLoading(true);
      setError(null);
      setPendingPosts([]);
      setUserAbout(null);
    }

    try {
      let fetched;

      if (searchMode === 'user') {
        fetched = await fetchUserPosts(searchValue, activeSort, controller.signal);
        // Fetch user profile in parallel (non-blocking for grid)
        if (!isBackground) {
          fetchUserAbout(searchValue, controller.signal)
            .then(about => setUserAbout(about))
            .catch(() => {}); // profile fetch failure is non-fatal
        }
      } else if (searchMode === 'subreddit') {
        fetched = await fetchPosts([searchValue], activeSort, controller.signal);
      } else if (searchMode === 'search') {
        fetched = await searchPosts(searchValue, null, controller.signal);
      } else {
        // feed mode
        if (activeSubreddit === 'all') {
          fetched = await fetchPosts(DEFAULT_SUBREDDITS, activeSort, controller.signal);
        } else {
          fetched = await fetchPosts([activeSubreddit], activeSort, controller.signal);
        }
      }

      if (isBackground) {
        setPosts(current => {
          const currentIds = new Set(current.map(p => p.id));
          const newOnes = fetched.filter(p => !currentIds.has(p.id));
          if (newOnes.length > 0) setPendingPosts(newOnes);
          return current;
        });
        setRefreshStatus('live');
      } else {
        setPosts(fetched);
        setRefreshStatus(autoRefreshEnabled ? 'live' : 'paused');
      }
      setLastUpdated(new Date());
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (!isBackground) {
        setError(err.message);
      }
      setRefreshStatus('error');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [searchMode, searchValue, activeSort, activeSubreddit, autoRefreshEnabled]);

  // ── Foreground fetch on param change ──────────────────────────────────────
  useEffect(() => {
    doFetch(false);
    return () => {
      if (mainAbortRef.current) mainAbortRef.current.abort();
    };
  }, [doFetch]);

  // ── Auto-refresh (only in feed mode) ──────────────────────────────────────
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (autoRefreshEnabled && searchMode === 'feed') {
      intervalRef.current = setInterval(() => doFetch(true), AUTO_REFRESH_INTERVAL);
      setRefreshStatus('live');
    } else if (!autoRefreshEnabled) {
      setRefreshStatus('paused');
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (bgAbortRef.current) bgAbortRef.current.abort();
    };
  }, [autoRefreshEnabled, doFetch, searchMode]);

  // ── Keyboard: Escape closes modal ─────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && selectedArticle) setSelectedArticle(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedArticle]);

  // ── Body scroll lock when modal is open ───────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = selectedArticle ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedArticle]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleApplyPending = useCallback(() => {
    setPosts(cur => mergePosts(cur, pendingPosts));
    setPendingPosts([]);
  }, [pendingPosts]);

  const handleRefresh = useCallback(() => {
    setPendingPosts([]);
    doFetch(false);
  }, [doFetch]);

  const handleSortChange = useCallback((sort) => {
    setActiveSort(sort);
    setSearchQuery('');
  }, []);

  const handleSubredditChange = useCallback((sub) => {
    setActiveSubreddit(sub);
    setSearchQuery('');
  }, []);

  // Click on author name in modal → search that user
  const handleAuthorClick = useCallback((username) => {
    setSelectedArticle(null);
    setSearchQuery(`u/${username}`);
  }, []);

  // Click on subreddit → switch to that subreddit
  const handleSubredditClick = useCallback((subreddit) => {
    setSelectedArticle(null);
    setSearchQuery(`r/${subreddit}`);
  }, []);

  const showFeedControls = searchMode === 'feed';

  return (
    <div className="app">
      <Header
        lastUpdated={lastUpdated}
        refreshStatus={refreshStatus}
        autoRefreshEnabled={autoRefreshEnabled}
        onToggleAutoRefresh={() => setAutoRefreshEnabled(p => !p)}
        onRefresh={handleRefresh}
        loading={loading}
      />

      <div className="app__search-row">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          searchMode={searchMode}
          searchValue={searchValue}
        />
      </div>

      {showFeedControls && (
        <FeedControls
          activeSort={activeSort}
          activeSubreddit={activeSubreddit}
          onSortChange={handleSortChange}
          onSubredditChange={handleSubredditChange}
        />
      )}

      {pendingPosts.length > 0 && (
        <NewsBanner count={pendingPosts.length} onApply={handleApplyPending} />
      )}

      <main className="app__main">
        {error && !loading ? (
          <ErrorState message={error} onRetry={handleRefresh} />
        ) : (
          <>
            {searchMode === 'user' && userAbout && (
              <UserProfile user={userAbout} onSubredditClick={handleSubredditClick} />
            )}
            <NewspaperGrid
              posts={posts}
              loading={loading}
              searchMode={searchMode}
              searchValue={searchValue}
              onArticleClick={setSelectedArticle}
            />
          </>
        )}
      </main>

      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onAuthorClick={handleAuthorClick}
          onSubredditClick={handleSubredditClick}
        />
      )}
    </div>
  );
}
