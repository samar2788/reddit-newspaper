import { extractImage, formatRelativeTime, formatScore, formatUpvoteRatio, truncate } from '../../utils/helpers.js';
import './ArticleCard.css';

const SUBREDDIT_COLORS = {
  news:         '#c41230',
  worldnews:    '#1a56b0',
  technology:   '#0f766e',
  science:      '#7c3aed',
  popular:      '#c2410c',
  programming:  '#2563eb',
  gaming:       '#16a34a',
  todayilearned:'#d97706',
  askreddit:    '#dc2626',
  space:        '#0891b2',
};

const POST_TYPE_LABELS = {
  video:   { label: 'VIDEO',   cls: 'video' },
  image:   { label: 'IMAGE',   cls: 'image' },
  gallery: { label: 'GALLERY', cls: 'gallery' },
  self:    { label: 'SELF',    cls: 'self' },
  link:    { label: 'LINK',    cls: 'link' },
};

export default function ArticleCard({ article, onClick, size = 'normal' }) {
  if (!article) return null;

  const image     = extractImage(article);
  const timeAgo   = formatRelativeTime(article.createdUtc);
  const score     = formatScore(article.score);
  const ratio     = formatUpvoteRatio(article.upvoteRatio);
  const ratioNum  = Math.round((article.upvoteRatio ?? 1) * 100);
  const preview   = truncate(article.selftext, size === 'large' ? 180 : 120);
  const accent    = SUBREDDIT_COLORS[article.subreddit] || '#1c1812';
  const typeInfo  = POST_TYPE_LABELS[article.postType] || POST_TYPE_LABELS.link;

  const hasAwards = article.totalAwardsReceived > 0;
  const isDistinguished = article.distinguished === 'moderator' || article.distinguished === 'admin';

  // Ratio color: green ≥ 85%, yellow 70–84%, red < 70%
  const ratioColor = ratioNum >= 85 ? '#16a34a' : ratioNum >= 70 ? '#d97706' : '#dc2626';

  return (
    <article
      className={`article-card article-card--${size} ${image ? 'article-card--has-image' : ''} ${article.isLocked ? 'article-card--locked' : ''}`}
      style={{ '--accent-color': accent }}
      onClick={() => onClick(article)}
      tabIndex={0}
      role="button"
      aria-label={`Read: ${article.title}`}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick(article)}
    >
      <div className="article-card__accent-bar" aria-hidden="true" />

      {image && (
        <div className="article-card__image-wrap">
          <img
            className="article-card__image"
            src={image}
            alt=""
            loading="lazy"
            onError={e => {
              e.currentTarget.closest('.article-card__image-wrap').style.display = 'none';
            }}
          />
          {/* Post type badge overlaid on image */}
          <span className={`article-card__type-badge article-card__type-badge--${typeInfo.cls}`} aria-hidden="true">
            {typeInfo.label}
          </span>
        </div>
      )}

      <div className="article-card__body">
        <header className="article-card__header">
          <div className="article-card__header-left">
            <span className="article-card__subreddit">r/{article.subreddit}</span>
            {article.flair && (
              <span className="article-card__flair">{article.flair}</span>
            )}
          </div>
          <div className="article-card__header-right">
            {!image && (
              <span className={`article-card__type-pill article-card__type-pill--${typeInfo.cls}`} aria-hidden="true">
                {typeInfo.label}
              </span>
            )}
            {article.isNsfw && (
              <span className="article-card__nsfw-badge" aria-label="NSFW">18+</span>
            )}
          </div>
        </header>

        <h3 className="article-card__headline ink-hover">
          {article.isLocked && (
            <svg className="article-card__lock-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-label="Locked" title="Locked">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          )}
          {article.title}
        </h3>

        {preview && (
          <p className="article-card__preview">{preview}</p>
        )}
      </div>

      <footer className="article-card__footer">
        <div className="article-card__byline-row">
          <span className="article-card__byline">
            {isDistinguished && (
              <span className={`article-card__distinguished article-card__distinguished--${article.distinguished}`} aria-hidden="true">
                {article.distinguished === 'moderator' ? 'MOD' : 'ADMIN'}
              </span>
            )}
            u/{article.author}
          </span>
          <span className="article-card__dot" aria-hidden="true">·</span>
          <time className="article-card__time">{timeAgo}</time>
        </div>

        <div className="article-card__stats">
          <span className="article-card__score" aria-label={`${score} upvotes`}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2L2 22h20L12 2z"/></svg>
            {score}
          </span>

          <span className="article-card__comments" aria-label={`${article.numComments} comments`}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {article.numComments.toLocaleString()}
          </span>

          {hasAwards && (
            <span className="article-card__awards" aria-label={`${article.totalAwardsReceived} awards`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#d97706" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {article.totalAwardsReceived}
            </span>
          )}

          {article.domain && !article.isSelf && (
            <span className="article-card__domain">{article.domain}</span>
          )}
        </div>

        {/* Upvote ratio bar */}
        <div className="article-card__ratio-bar" title={`${ratio} upvoted`} aria-label={`${ratio} upvote ratio`}>
          <div
            className="article-card__ratio-fill"
            style={{ width: `${ratioNum}%`, background: ratioColor }}
          />
        </div>
      </footer>
    </article>
  );
}
