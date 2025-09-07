'use client';

import { Message } from '@/types';
import { MessageBubble } from './message-bubble';
import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export type MessageStatus = 'sending' | 'streaming' | 'sent' | 'error' | 'retry';

export interface OptimisticMessage extends Message {
  status?: MessageStatus;
  error?: string;
}

interface OptimisticMessageProps {
  message: OptimisticMessage;
  index?: number;
  totalMessages?: number;
  onRetry?: () => void;
}

export function OptimisticMessageBubble({ 
  message, 
  index = 0, 
  totalMessages = 1,
  onRetry 
}: OptimisticMessageProps) {
  const isUser = message.role === 'user';
  const status = message.status || 'sent';

  // Show different states based on message status
  const getStatusIndicator = () => {
    switch (status) {
      case 'sending':
        return (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
            <span>Sending...</span>
          </div>
        );
      case 'streaming':
        return (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>AI is responding...</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-xs text-destructive mt-1">
            <AlertCircle className="w-3 h-3" aria-hidden="true" />
            <span>{message.error || 'Failed to send message'}</span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1 text-xs underline hover:no-underline focus:outline-none focus:ring-1 focus:ring-ring rounded"
                aria-label="Retry sending message"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                Retry
              </button>
            )}
          </div>
        );
      case 'retry':
        return (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
            <span>Retrying...</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`relative ${status === 'error' ? 'opacity-70' : ''}`}
    >
      <MessageBubble 
        message={message} 
        index={index} 
        totalMessages={totalMessages}
      />
      
      {/* Status indicator positioned below the message */}
      {status !== 'sent' && (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mt-1`}>
          <div className={`ml-11 ${isUser ? 'mr-2' : ''}`}>
            {getStatusIndicator()}
          </div>
        </div>
      )}
      
      {/* Loading overlay for streaming messages */}
      {status === 'streaming' && !isUser && (
        <div className="absolute inset-0 bg-background/50 rounded-lg pointer-events-none" />
      )}
    </motion.div>
  );
}