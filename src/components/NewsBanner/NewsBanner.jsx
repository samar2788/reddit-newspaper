import './NewsBanner.css';

export default function NewsBanner({ count, onApply }) {
  return (
    <div className="news-banner" role="status" aria-live="polite">
      <div className="news-banner__inner">
        <span className="news-banner__pulse" aria-hidden="true" />
        <span className="news-banner__text">
          <strong>{count} new {count === 1 ? 'story' : 'stories'}</strong> available
        </span>
        <button className="news-banner__btn" onClick={onApply}>
          Update newspaper
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <polyline points="19 12 12 19 5 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
