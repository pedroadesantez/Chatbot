'use client';

import { ChatWindow } from '@/components/chat-window';
import { Header } from '@/components/header';
import { ChatErrorBoundary } from '@/components/chat-error-boundary';
import { ErrorBoundary } from '@/components/error-boundary';

export default function HomePage() {
  return (
    <ErrorBoundary>
      <main className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 flex">
          <ChatErrorBoundary>
            <ChatWindow />
          </ChatErrorBoundary>
        </div>
      </main>
    </ErrorBoundary>
  );
}