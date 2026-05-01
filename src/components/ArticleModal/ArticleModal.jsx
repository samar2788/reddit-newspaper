import { useEffect, useRef } from 'react';
import {
  extractImage,
  formatRelativeTime,
  formatFullDate,
  formatScore,
  formatUpvoteRatio,
  truncate,
} from '../../utils/helpers.js';
import './ArticleModal.css';

const POST_TYPE_LABELS = {
  video:   'Video',
  image:   'Image',
  gallery: 'Gallery',
  self:    'Text Post',
  link:    'Link',
};

export default function ArticleModal({ article, onClose, onAuthorClick, onSubredditClick }) {
  const modalRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const prev = document.activeElement;
    closeRef.current?.focus();
    return () => prev?.focus();
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const image       = extractImage(article);
  const timeAgo     = formatRelativeTime(article.createdUtc);
  const fullDate    = formatFullDate(article.createdUtc);
  const score       = formatScore(article.score);
  const ratio       = formatUpvoteRatio(article.upvoteRatio);
  const ratioNum    = Math.round((article.upvoteRatio ?? 1) * 100);
  const selftext    = article.selftext && article.selftext.length > 0
    ? truncate(article.selftext, 1200)
    : null;
  const postTypeLabel = POST_TYPE_LABELS[article.postType] || 'Post';
  const hasAwards   = article.totalAwardsReceived > 0;
  const isDistinguished = article.distinguished === 'moderator' || article.distinguished === 'admin';
  const ratioColor  = ratioNum >= 85 ? '#16a34a' : ratioNum >= 70 ? '#d97706' : '#dc2626';

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={article.title}
    >
      <div className="modal" ref={modalRef}>
        {/* Header bar */}
        <div className="modal__bar">
          <div className="modal__bar-left">
            <button
              className="modal__subreddit-btn"
              onClick={() => { onSubredditClick?.(article.subreddit); }}
              title={`Browse r/${article.subreddit}`}
            >
              r/{article.subreddit}
            </button>
            {article.flair && <span className="modal__flair">{article.flair}</span>}
            {article.isNsfw && <span className="modal__nsfw">18+</span>}
            {article.isLocked && (
              <span className="modal__locked" title="Locked">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Locked
              </span>
            )}
          </div>
          <button
            className="modal__close"
            onClick={onClose}
            ref={closeRef}
            aria-label="Close article"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Image */}
        {image && (
          <div className="modal__image-wrap">
            <img
              className="modal__image"
              src={image}
              alt=""
              onError={e => { e.currentTarget.closest('.modal__image-wrap').style.display = 'none'; }}
            />
          </div>
        )}

        {/* Content */}
        <div className="modal__content">
          {/* Eyebrow */}
          <div className="modal__eyebrow">
            <span className="modal__post-type">{postTypeLabel}</span>
            {isDistinguished && (
              <span className={`modal__distinguished modal__distinguished--${article.distinguished}`}>
                {article.distinguished === 'moderator' ? 'Moderator Post' : 'Admin Post'}
              </span>
            )}
            {article.isOriginalContent && (
              <span className="modal__oc">OC</span>
            )}
          </div>

          {/* Title */}
          <h2 className="modal__title">{article.title}</h2>

          {/* Byline */}
          <div className="modal__byline">
            <span>By{' '}
              <button className="modal__author-btn" onClick={() => onAuthorClick?.(article.author)}>
                u/{article.author}
              </button>
            </span>
            <span className="modal__sep">·</span>
            <time title={fullDate}>{timeAgo}</time>
            <span className="modal__sep">·</span>
            <span>{fullDate}</span>
          </div>

          {/* Rule */}
          <div className="modal__rule" />

          {/* Stats grid */}
          <div className="modal__stats-grid">
            <div className="modal__stat-block">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="modal__stat-icon modal__stat-icon--up"><path d="M12 2L2 22h20L12 2z"/></svg>
              <span className="modal__stat-value">{score}</span>
              <span className="modal__stat-label">upvotes</span>
            </div>

            <div className="modal__stat-block">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="modal__stat-icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span className="modal__stat-value">{article.numComments.toLocaleString()}</span>
              <span className="modal__stat-label">comments</span>
            </div>

            <div className="modal__stat-block">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ratioColor} strokeWidth="2" aria-hidden="true" className="modal__stat-icon">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
              <span className="modal__stat-value" style={{ color: ratioColor }}>{ratio}</span>
              <span className="modal__stat-label">upvoted</span>
            </div>

            {hasAwards && (
              <div className="modal__stat-block">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#d97706" aria-hidden="true" className="modal__stat-icon">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span className="modal__stat-value">{article.totalAwardsReceived}</span>
                <span className="modal__stat-label">awards</span>
              </div>
            )}

            {article.crosspostCount > 0 && (
              <div className="modal__stat-block">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="modal__stat-icon">
                  <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                  <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                </svg>
                <span className="modal__stat-value">{article.crosspostCount}</span>
                <span className="modal__stat-label">crossposts</span>
              </div>
            )}

            {article.domain && !article.isSelf && (
              <div className="modal__stat-block">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="modal__stat-icon"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <span className="modal__stat-value modal__stat-value--sm">{article.domain}</span>
                <span className="modal__stat-label">source</span>
              </div>
            )}
          </div>

          {/* Upvote ratio bar */}
          <div className="modal__ratio-wrap" title={`${ratio} upvoted`}>
            <div className="modal__ratio-bar">
              <div className="modal__ratio-fill" style={{ width: `${ratioNum}%`, background: ratioColor }} />
            </div>
            <span className="modal__ratio-label" style={{ color: ratioColor }}>{ratio} upvoted</span>
          </div>

          {/* Self text */}
          {selftext && (
            <>
              <div className="modal__rule" />
              <div className="modal__body">
                <p>{selftext}</p>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="modal__rule" />
          <div className="modal__actions">
            <a
              className="modal__action-btn modal__action-btn--primary"
              href={article.permalink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Open on Reddit
            </a>

            <a
              className="modal__action-btn modal__action-btn--comments"
              href={`${article.permalink}#comments`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {article.numComments.toLocaleString()} Comments
            </a>

            {!article.isSelf && article.url && (
              <a
                className="modal__action-btn"
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                Source article
              </a>
            )}

            <button
              className="modal__action-btn modal__action-btn--author"
              onClick={() => onAuthorClick?.(article.author)}
              title={`See all posts by u/${article.author}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              u/{article.author}
            </button>

            <button className="modal__action-btn modal__action-btn--close" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
