import './EmptyState.css';

export default function EmptyState({ searchQuery }) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state__inner">
        <p className="empty-state__edition">Late Edition</p>
        <h2 className="empty-state__headline">
          {searchQuery ? `No Results for "${searchQuery}"` : 'No Stories Found'}
        </h2>
        <div className="empty-state__rule" />
        <p className="empty-state__body">
          {searchQuery
            ? 'Our correspondents searched every wire service and came up empty. Try different keywords.'
            : 'Our news desks are quiet right now. Try a different feed or check back soon.'}
        </p>
      </div>
    </div>
  );
}
