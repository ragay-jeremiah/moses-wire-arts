import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
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
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
           <h1 className="font-serif text-3xl mb-4 text-red-500">Something went wrong.</h1>
           <p className="text-white/60 mb-8 max-w-md text-sm">
             We encountered an unexpected error rendering this view. Please try refreshing the page.
           </p>
           <button
             onClick={() => window.location.reload()}
             className="px-8 py-3 bg-white text-black text-xs uppercase tracking-[0.2em] font-medium hover:bg-white/90 rounded-full"
           >
             Refresh Page
           </button>
           
           {/* In development, show error details */}
           {process.env.NODE_ENV === 'development' && this.state.error && (
             <div className="mt-12 p-4 bg-white/5 border border-white/10 rounded-lg text-left overflow-auto max-w-2xl max-h-64">
               <pre className="text-xs text-white/50">{this.state.error.toString()}</pre>
             </div>
           )}
        </div>
      );
    }

    return this.props.children;
  }
}
