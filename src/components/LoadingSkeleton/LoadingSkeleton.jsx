import './LoadingSkeleton.css';

function SkeletonCard({ size = 'normal' }) {
  const showImage = size !== 'small';
  return (
    <div className={`sk-card sk-card--${size}`} aria-hidden="true">
      <div className="sk-card__accent" />
      {showImage && <div className="sk-card__image sk-shimmer" />}
      <div className="sk-card__body">
        <div className="sk-card__tag sk-shimmer" />
        <div className="sk-card__line sk-shimmer sk-card__line--wide" />
        <div className="sk-card__line sk-shimmer sk-card__line--medium" />
        {size !== 'small' && (
          <div className="sk-card__line sk-shimmer sk-card__line--narrow" />
        )}
      </div>
      <div className="sk-card__footer">
        <div className="sk-card__meta sk-shimmer" />
      </div>
    </div>
  );
}

function SkeletonFeatured() {
  return (
    <div className="sk-featured sk-shimmer" aria-hidden="true">
      <div className="sk-featured__content">
        <div className="sk-featured__tag sk-shimmer-inv" />
        <div className="sk-featured__title sk-shimmer-inv" />
        <div className="sk-featured__title sk-shimmer-inv sk-featured__title--short" />
        <div className="sk-featured__meta sk-shimmer-inv" />
      </div>
    </div>
  );
}

export default function LoadingSkeleton() {
  return (
    <div className="skeleton" aria-label="Loading stories…" aria-busy="true">
      <SkeletonFeatured />
      <div className="skeleton__grid">
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonCard key={i} size={i < 3 ? 'normal' : 'small'} />
        ))}
      </div>
    </div>
  );
}
