import { getTodayFormatted, formatTime } from '../../utils/helpers.js';
import './Header.css';

const STATUS_LABELS = {
  live:       { text: 'Live',       dot: 'live' },
  paused:     { text: 'Paused',     dot: 'paused' },
  error:      { text: 'Error',      dot: 'error' },
  refreshing: { text: 'Refreshing', dot: 'refreshing' },
};

export default function Header({
  lastUpdated,
  refreshStatus,
  autoRefreshEnabled,
  onToggleAutoRefresh,
  onRefresh,
  loading,
}) {
  const status = STATUS_LABELS[refreshStatus] || STATUS_LABELS.live;
  const today  = getTodayFormatted();
  const updatedTime = formatTime(lastUpdated);

  return (
    <header className="masthead">
      {/* Triple rule top */}
      <div className="masthead__rules-top">
        <div className="rule rule--thin" />
        <div className="rule rule--thick" />
        <div className="rule rule--thin" />
      </div>

      {/* Masthead body */}
      <div className="masthead__body">
        {/* Left column: date + edition */}
        <div className="masthead__meta-left">
          <span className="masthead__date">{today}</span>
          <span className="masthead__edition">Est. 2024 · Vol. I</span>
        </div>

        {/* Centre: nameplate */}
        <div className="masthead__centre">
          <h1 className="masthead__title">The Reddit<br/>Newspaper</h1>
          <p className="masthead__tagline">"All the News That's Fit to Post"</p>
        </div>

        {/* Right column: controls + status */}
        <div className="masthead__meta-right">
          <div className="masthead__status">
            <span className={`status-dot status-dot--${status.dot}`} aria-hidden="true" />
            <span className="status-label">{status.text}</span>
            {updatedTime && (
              <span className="status-time">· {updatedTime}</span>
            )}
          </div>

          <div className="masthead__actions">
            <button
              className="masthead-btn masthead-btn--refresh"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh newspaper"
              aria-label="Refresh newspaper"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Refresh
            </button>

            <button
              className={`masthead-btn masthead-btn--toggle ${autoRefreshEnabled ? 'is-active' : ''}`}
              onClick={onToggleAutoRefresh}
              title={autoRefreshEnabled ? 'Disable auto-refresh' : 'Enable auto-refresh'}
              aria-pressed={autoRefreshEnabled}
            >
              {autoRefreshEnabled ? 'Auto: On' : 'Auto: Off'}
            </button>
          </div>
        </div>
      </div>

      {/* Rule below nameplate */}
      <div className="masthead__rules-bottom">
        <div className="rule rule--thick" />
        <div className="rule rule--thin" />
      </div>

      {/* Section label band */}
      <div className="masthead__section-band">
        <span>Reddit Newspaper</span>
        <span className="section-band__divider">·</span>
        <span>Global Edition</span>
        <span className="section-band__divider">·</span>
        <span>Digital Issue</span>
      </div>
    </header>
  );
}
