import './ErrorState.css';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <div className="error-state__inner">
        <p className="error-state__edition">Press Dispatch</p>
        <h2 className="error-state__headline">The Presses Have Stopped</h2>
        <div className="error-state__rule" />
        <p className="error-state__message">{message}</p>
        <button className="error-state__retry" onClick={onRetry}>
          Restart the Presses
        </button>
      </div>
    </div>
  );
}
