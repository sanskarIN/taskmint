import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logError } from '../utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    logError(
      'render_failure',
      new Error(`${error.message}; component=${info.componentStack ?? 'unknown'}`)
    );
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="fatal-state">
          <img src="/taskmint-icon.svg" width="64" height="64" alt="" />
          <h1>TaskMint hit an unexpected error.</h1>
          <p>Your locally stored task data has not been intentionally changed.</p>
          <button className="primary" type="button" onClick={() => window.location.reload()}>
            Reload TaskMint
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
