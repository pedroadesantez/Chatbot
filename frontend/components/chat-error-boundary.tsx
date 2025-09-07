'use client';

import { ErrorBoundary } from './error-boundary';
import { MessageSquare, RefreshCw } from 'lucide-react';

interface ChatErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

export function ChatErrorBoundary({ children, onReset }: ChatErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log chat-specific error context
    console.error('Chat component error:', {
      error: error.message,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  };

  const ChatErrorFallback = (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <MessageSquare className="h-8 w-8 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">Chat temporarily unavailable</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        The chat interface encountered an error. Your messages are safe, but the interface needs to be reset.
      </p>

      <button
        onClick={() => {
          if (onReset) {
            onReset();
          }
          window.location.reload();
        }}
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Reset chat
      </button>

      <p className="text-xs text-muted-foreground mt-4">
        If this keeps happening, try refreshing the page or clearing your browser cache.
      </p>
    </div>
  );

  return (
    <ErrorBoundary fallback={ChatErrorFallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}