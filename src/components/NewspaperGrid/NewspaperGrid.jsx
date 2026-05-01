import FeaturedArticle from '../FeaturedArticle/FeaturedArticle.jsx';
import ArticleCard from '../ArticleCard/ArticleCard.jsx';
import LoadingSkeleton from '../LoadingSkeleton/LoadingSkeleton.jsx';
import EmptyState from '../EmptyState/EmptyState.jsx';
import './NewspaperGrid.css';

const MODE_LABELS = {
  user:      (val) => `Posts by u/${val}`,
  subreddit: (val) => `r/${val}`,
  search:    (val) => `Search: "${val}"`,
};

export default function NewspaperGrid({ posts, loading, searchMode, searchValue, onArticleClick }) {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!posts || posts.length === 0) {
    return <EmptyState searchQuery={searchMode !== 'feed' ? searchValue : ''} />;
  }

  const isFeed = searchMode === 'feed';
  const sectionLabel = MODE_LABELS[searchMode]?.(searchValue);

  const [featured, ...rest] = posts;
  const large  = rest.slice(0, 2);
  const normal = rest.slice(2);

  return (
    <div className="newspaper-grid">
      {/* Section header when not in feed mode */}
      {!isFeed && sectionLabel && (
        <div className="newspaper-grid__section-header">
          <span className="newspaper-grid__section-rule" />
          <h2 className="newspaper-grid__section-title">{sectionLabel}</h2>
          <span className="newspaper-grid__section-rule" />
        </div>
      )}

      {/* Lead story (feed mode only) */}
      {isFeed && (
        <FeaturedArticle article={featured} onClick={onArticleClick} />
      )}

      {/* Large cards row (feed mode only) */}
      {isFeed && large.length > 0 && (
        <div className="newspaper-grid__large-row">
          {large.map(post => (
            <ArticleCard
              key={post.id}
              article={post}
              onClick={onArticleClick}
              size="large"
            />
          ))}
        </div>
      )}

      {/* Section divider */}
      {isFeed && (
        <div className="newspaper-grid__divider">
          <span className="newspaper-grid__divider-label">Latest Reports</span>
        </div>
      )}

      {/* Main grid */}
      <div className="newspaper-grid__main">
        {(isFeed ? normal : posts).map(post => (
          <ArticleCard
            key={post.id}
            article={post}
            onClick={onArticleClick}
            size="normal"
          />
        ))}
      </div>
    </div>
  );
}
