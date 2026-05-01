import { formatKarma, formatFullDate } from '../../utils/helpers.js';
import './UserProfile.css';

export default function UserProfile({ user, onSubredditClick }) {
  if (!user) return null;

  const avatar = user.snoovatarImg || user.iconImg;
  const memberSince = formatFullDate(user.createdUtc);
  const totalKarma = formatKarma(user.totalKarma);
  const linkKarma = formatKarma(user.linkKarma);
  const commentKarma = formatKarma(user.commentKarma);

  return (
    <div className="user-profile">
      <div className="user-profile__inner">
        <div className="user-profile__avatar-wrap">
          {avatar ? (
            <img
              className="user-profile__avatar"
              src={avatar}
              alt={`u/${user.name} avatar`}
              onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling?.classList?.remove('user-profile__avatar-fallback--hidden'); }}
            />
          ) : null}
          <div className={`user-profile__avatar-fallback ${avatar ? 'user-profile__avatar-fallback--hidden' : ''}`} aria-hidden="true">
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>

        <div className="user-profile__info">
          <div className="user-profile__heading">
            <h2 className="user-profile__name">u/{user.name}</h2>
            <div className="user-profile__badges">
              {user.isGold && <span className="user-profile__badge user-profile__badge--gold">Gold</span>}
              {user.isMod  && <span className="user-profile__badge user-profile__badge--mod">Mod</span>}
            </div>
          </div>

          {user.publicDescription && (
            <p className="user-profile__bio">{user.publicDescription}</p>
          )}

          <div className="user-profile__stats">
            <div className="user-profile__stat">
              <span className="user-profile__stat-value">{totalKarma}</span>
              <span className="user-profile__stat-label">Total Karma</span>
            </div>
            <div className="user-profile__stat-divider" aria-hidden="true" />
            <div className="user-profile__stat">
              <span className="user-profile__stat-value">{linkKarma}</span>
              <span className="user-profile__stat-label">Post Karma</span>
            </div>
            <div className="user-profile__stat-divider" aria-hidden="true" />
            <div className="user-profile__stat">
              <span className="user-profile__stat-value">{commentKarma}</span>
              <span className="user-profile__stat-label">Comment Karma</span>
            </div>
            <div className="user-profile__stat-divider" aria-hidden="true" />
            <div className="user-profile__stat">
              <span className="user-profile__stat-value">{memberSince}</span>
              <span className="user-profile__stat-label">Member Since</span>
            </div>
          </div>
        </div>

        <a
          className="user-profile__reddit-link"
          href={`https://www.reddit.com/user/${user.name}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View u/${user.name} on Reddit`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Reddit profile
        </a>
      </div>
    </div>
  );
}
