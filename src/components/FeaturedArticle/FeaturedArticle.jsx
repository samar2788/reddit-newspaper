import { extractImage, formatRelativeTime, formatScore, formatUpvoteRatio } from '../../utils/helpers.js';
import './FeaturedArticle.css';

export default function FeaturedArticle({ article, onClick }) {
  if (!article) return null;

  const image    = extractImage(article);
  const timeAgo  = formatRelativeTime(article.createdUtc);
  const score    = formatScore(article.score);
  const ratio    = formatUpvoteRatio(article.upvoteRatio);
  const hasAwards = article.totalAwardsReceived > 0;

  return (
    <article
      className={`featured ${image ? 'featured--has-image' : 'featured--text-only'}`}
      onClick={() => onClick(article)}
      tabIndex={0}
      role="button"
      aria-label={`Read: ${article.title}`}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick(article)}
    >
      {image && (
        <div className="featured__image-wrap">
          <img
            className="featured__image"
            src={image}
            alt=""
            loading="eager"
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="featured__image-overlay" />
        </div>
      )}

      <div className={`featured__content ${image ? 'featured__content--over-image' : ''}`}>
        <div className="featured__eyebrow">
          <span className="featured__subreddit">r/{article.subreddit}</span>
          {article.flair && <span className="featured__flair">{article.flair}</span>}
          {article.isOriginalContent && <span className="featured__oc">OC</span>}
          <span className="featured__flag">Lead Story</span>
        </div>

        <h2 className="featured__headline">{article.title}</h2>

        <footer className="featured__meta">
          <span className="featured__byline">
            By <strong>u/{article.author}</strong>
          </span>
          <span className="featured__separator" aria-hidden="true">·</span>
          <time className="featured__time">{timeAgo}</time>
          <span className="featured__separator" aria-hidden="true">·</span>
          <span className="featured__score" aria-label={`${score} upvotes`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2L2 22h20L12 2z"/></svg>
            {score}
          </span>
          <span className="featured__separator" aria-hidden="true">·</span>
          <span className="featured__ratio">{ratio}</span>
          <span className="featured__separator" aria-hidden="true">·</span>
          <span className="featured__comments">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {article.numComments.toLocaleString()}
          </span>
          {hasAwards && (
            <>
              <span className="featured__separator" aria-hidden="true">·</span>
              <span className="featured__awards">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#d97706" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                {article.totalAwardsReceived}
              </span>
            </>
          )}
          {article.domain && !article.isSelf && (
            <>
              <span className="featured__separator" aria-hidden="true">·</span>
              <span className="featured__domain">{article.domain}</span>
            </>
          )}
        </footer>
      </div>
    </article>
  );
}
