import { useState, useRef } from 'react';
import { SORT_OPTIONS, SUBREDDIT_LIST } from '../../constants/config.js';
import './FeedControls.css';

export default function FeedControls({
  activeSort,
  activeSubreddit,
  onSortChange,
  onSubredditChange,
}) {
  const [customInput, setCustomInput] = useState('');
  const inputRef = useRef(null);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const val = customInput.trim().replace(/^r\//i, '');
    if (val) {
      onSubredditChange(val);
      setCustomInput('');
    }
  };

  return (
    <nav className="feed-controls" aria-label="Feed controls">
      <div className="feed-controls__inner">
        {/* Subreddit selector */}
        <div className="feed-controls__group">
          <span className="feed-controls__label">Edition</span>
          <div className="feed-controls__chips" role="group" aria-label="Select subreddit">
            {SUBREDDIT_LIST.map(sub => (
              <button
                key={sub.value}
                className={`chip ${activeSubreddit === sub.value ? 'chip--active' : ''}`}
                onClick={() => onSubredditChange(sub.value)}
                aria-pressed={activeSubreddit === sub.value}
              >
                {sub.value !== 'all' && <span className="chip__prefix">r/</span>}
                {sub.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom subreddit input */}
        <form className="feed-controls__custom" onSubmit={handleCustomSubmit} aria-label="Browse custom subreddit">
          <span className="feed-controls__custom-prefix" aria-hidden="true">r/</span>
          <input
            ref={inputRef}
            className="feed-controls__custom-input"
            type="text"
            placeholder="any subreddit…"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            aria-label="Enter subreddit name"
            spellCheck={false}
            autoComplete="off"
          />
          <button className="feed-controls__custom-btn" type="submit" aria-label="Go to subreddit">
            Go
          </button>
        </form>

        <div className="feed-controls__divider" aria-hidden="true" />

        {/* Sort selector */}
        <div className="feed-controls__group">
          <span className="feed-controls__label">Sort</span>
          <div className="feed-controls__chips" role="group" aria-label="Select sort order">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`chip ${activeSort === opt.value ? 'chip--active' : ''}`}
                onClick={() => onSortChange(opt.value)}
                aria-pressed={activeSort === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
