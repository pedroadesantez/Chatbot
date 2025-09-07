'use client';

import { Message } from '@/types';
import { MessageBubble } from './message-bubble';
import { TypingIndicator } from './typing-indicator';
import { OptimisticMessage } from '@/components/optimistic-message';
import { OptimisticMessageBubble } from '@/components/optimistic-message';

interface MessageListProps {
  messages: OptimisticMessage[];
  isLoading: boolean;
  onRetryMessage?: (messageId: string) => void;
}

export function MessageList({ messages, isLoading, onRetryMessage }: MessageListProps) {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground" role="status">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Welcome to AI Chatbot</h3>
          <p className="text-sm">Start a conversation by typing a message below.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 p-4 h-full overflow-y-auto">
      {messages.map((message, index) => (
        <OptimisticMessageBubble 
          key={message.id} 
          message={message} 
          index={index}
          totalMessages={messages.length}
          onRetry={onRetryMessage ? () => onRetryMessage(message.id) : undefined}
        />
      ))}
      {isLoading && (
        <div role="status" aria-label="AI is typing">
          <TypingIndicator />
        </div>
      )}
    </div>
  );
}