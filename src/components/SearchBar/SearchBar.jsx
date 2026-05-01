import './SearchBar.css';

const MODE_CONFIG = {
  user:      { label: 'User profile',    icon: 'user',      hint: 'Viewing posts by' },
  subreddit: { label: 'Subreddit',       icon: 'subreddit', hint: 'Browsing' },
  search:    { label: 'Search results',  icon: 'search',    hint: 'Searching for' },
  feed:      { label: 'Feed',            icon: 'search',    hint: null },
};

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function SubredditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/>
    </svg>
  );
}

export default function SearchBar({ value, onChange, onClear, searchMode, searchValue }) {
  const modeConf = MODE_CONFIG[searchMode] || MODE_CONFIG.feed;
  const isActive = searchMode !== 'feed' && value;

  return (
    <div className={`search-bar search-bar--mode-${searchMode}`} role="search">
      <div className="search-bar__inner">
        <span className="search-bar__icon" aria-hidden="true">
          {searchMode === 'user' ? <UserIcon /> :
           searchMode === 'subreddit' ? <SubredditIcon /> :
           <SearchIcon />}
        </span>

        <input
          className="search-bar__input"
          type="search"
          placeholder="Search posts, u/username, r/subreddit…"
          value={value}
          onChange={e => onChange(e.target.value)}
          aria-label="Search Reddit"
          autoComplete="off"
          spellCheck={false}
        />

        {isActive && (
          <span className={`search-bar__mode-badge search-bar__mode-badge--${searchMode}`}>
            {modeConf.label}
          </span>
        )}

        {value && (
          <button
            className="search-bar__clear"
            onClick={onClear}
            aria-label="Clear search"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {isActive && modeConf.hint && (
        <p className="search-bar__label" aria-live="polite">
          {modeConf.hint}: <strong>
            {searchMode === 'user' ? `u/${searchValue}` :
             searchMode === 'subreddit' ? `r/${searchValue}` :
             `"${searchValue}"`}
          </strong>
        </p>
      )}
    </div>
  );
}
