import React from "react";
import "./ErrorBoundary.css";

/**
 * Catches render-time errors so one broken section cannot take the whole
 * page down.
 *
 * This exists because of a real production failure: with VITE_FIREBASE_*
 * unset, src/firebase.js throws at module scope, the lazy Registration
 * chunk rejects on import, and with no boundary React unmounts the entire
 * app — the site renders as a black screen. Registration is the only part
 * that needs Firebase, so it is the only part that should ever fail.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("[BIOBYTE] render error:", error, info?.componentStack);
  }

  handleRetry = () => {
    this.setState({ error: null });
    if (this.props.onRetry) this.props.onRetry();
  };

  render() {
    const { error } = this.state;
    const { children, label = "This section" } = this.props;

    if (!error) return children;

    return (
      <section className="section bb-boundary">
        <div className="bb-boundary-panel">
          <div className="bb-boundary-bar">
            <span className="bb-boundary-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="bb-boundary-title">BIOBYTE_OFFLINE</span>
            <span className="bb-boundary-status">
              <span className="bb-boundary-dot" aria-hidden="true" />
              DEGRADED
            </span>
          </div>

          <div className="bb-boundary-body">
            <p className="bb-boundary-log">
              <span aria-hidden="true">&gt;</span> {label} could not start.
            </p>
            <p className="bb-boundary-detail">{String(error?.message || error)}</p>
            <p className="bb-boundary-hint">
              The rest of the site is unaffected. If this is the registration
              form, the server is missing its Firebase environment variables.
            </p>
            <button type="button" className="bb-boundary-retry" onClick={this.handleRetry}>
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }
}

export default ErrorBoundary;