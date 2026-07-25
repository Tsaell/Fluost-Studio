import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-2" />
          <h2 className="text-xl font-bold text-[var(--text-main)]">Terjadi Kesalahan (App Crashed)</h2>
          <p className="text-sm opacity-70 max-w-md text-[var(--text-main)]">
            Aplikasi mengalami kendala teknis pada perangkat Anda. Pesan error: {this.state.error?.message || 'Unknown Error'}.
          </p>
          <button
            onClick={() => (this as any).setState({ hasError: false, error: null })}
            className="mt-4 px-6 py-2.5 rounded-xl bg-[var(--fluid-1)] hover:opacity-90 text-white font-bold flex items-center gap-2 transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" /> Coba Lagi
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
