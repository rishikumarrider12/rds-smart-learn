/// <reference types="vite/client" />
import * as React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Application-level safety net.
 *
 * A crashing widget must NEVER produce a blank page. This boundary renders a
 * professional, theme-consistent error screen with recovery actions and always
 * logs the real error to the console in development.
 *
 * NOTE: This is defense-in-depth only — runtime bugs are fixed at their source.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleRetry = this.handleRetry.bind(this);
    this.handleGoHome = this.handleGoHome.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Never swallow the real error silently.
    console.error('[ErrorBoundary] Uncaught UI error:', error);
    if (info?.componentStack) {
      console.error('[ErrorBoundary] Component stack:', info.componentStack);
    }
  }

  handleRetry() {
    this.setState({ hasError: false, error: null });
  }

  handleGoHome() {
    window.location.assign('/');
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isDev = Boolean((import.meta as any).env?.DEV);

    return (
      <div className="min-h-screen bg-[#070b19] text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-lg w-full bg-[#0d152a] border border-rose-500/30 rounded-2xl p-8 text-center shadow-2xl shadow-rose-950/40">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-5 text-rose-400">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            An unexpected error occurred while displaying this page. Your learning data is safe.
            Please try again, or return to the home page.
          </p>

          {isDev && this.state.error && (
            <pre className="text-left text-[11px] leading-relaxed bg-[#060c1c] border border-slate-800 rounded-xl p-3 mb-6 max-h-40 overflow-auto text-rose-300 whitespace-pre-wrap break-words">
              {this.state.error.message}
              {'\n'}
              {this.state.error.stack?.split('\n').slice(1, 5).join('\n')}
            </pre>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              id="error-boundary-retry-btn"
              onClick={this.handleRetry}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            <button
              id="error-boundary-home-btn"
              onClick={this.handleGoHome}
              className="flex-1 py-3 bg-[#131d36] hover:bg-[#1a284c] text-cyan-300 border border-cyan-500/30 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Go to Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}