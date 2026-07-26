import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Centralized log point — swap for a real error-reporting service later.
    console.error('DataLens dashboard crashed:', error, info.componentStack);
  }

  private handleReset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
          <div className="max-w-md text-center bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
            <h1 className="text-lg font-bold text-slate-800 mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-500 mb-6">
              The dashboard ran into an unexpected error. Try reloading — if it keeps happening,
              the console has the underlying error.
            </p>
            <button
              onClick={this.handleReset}
              className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
