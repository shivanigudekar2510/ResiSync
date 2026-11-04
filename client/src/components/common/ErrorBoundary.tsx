import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 [ErrorBoundary Caught Exception]:', {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
    });
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[360px] p-6 flex items-center justify-center">
          <div className="w-full max-w-lg bg-card rounded-panel border border-border p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-status-danger/15 text-status-danger border border-status-danger/30 w-fit text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>MODULE RENDER FAILURE DETECTED</span>
            </div>

            <h3 className="text-lg font-bold text-text-primary">
              {this.props.fallbackTitle || 'Unable to render module display'}
            </h3>

            <p className="text-xs text-text-secondary leading-relaxed">
              A runtime rendering error occurred in this module. The error was caught and isolated to prevent application downtime.
            </p>

            <div className="p-3 bg-surface rounded-xl border border-border font-mono text-[11px] text-primary break-all">
              {this.state.error?.message || 'Unknown runtime error'}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Module</span>
              </button>
              <button
                type="button"
                onClick={() => window.location.href = '/resident/dashboard'}
                className="px-4 py-2 rounded-xl bg-surface border border-border text-xs text-text-secondary hover:text-white font-medium flex items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
