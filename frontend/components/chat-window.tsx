'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageList } from './message-list';
import { InputArea } from './input-area';
import { Message } from '@/types';
import { chatService } from '@/lib/chat-service';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, Download } from 'lucide-react';
import { useOptimisticMessages } from '@/hooks/useOptimisticMessages';
import { MessageStatus } from '@/components/optimistic-message';
import { ExportDialog } from '@/components/export-dialog';
import { analytics, trackMessageSent, trackMessageReceived, trackUserAction, trackError } from '@/lib/analytics';

export function ChatWindow() {
  const [conversationId, setConversationId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    addOptimisticMessage,
    updateMessageStatus,
    updateMessageContent,
    clearMessages,
    setMessagesFromStorage,
    getRegularMessages,
  } = useOptimisticMessages();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    const savedConversationId = localStorage.getItem('conversationId');
    
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        const messagesWithTimestamps = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessagesFromStorage(messagesWithTimestamps);
      } catch (error) {
        console.error('Error loading saved messages:', error);
      }
    }
    
    if (savedConversationId) {
      setConversationId(savedConversationId);
    } else {
      const newConversationId = uuidv4();
      setConversationId(newConversationId);
      localStorage.setItem('conversationId', newConversationId);
    }
  }, [setMessagesFromStorage]);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(getRegularMessages()));
  }, [messages, getRegularMessages]);

  const handleSendMessage = async (content: string) => {
    if (isLoading) return;

    const startTime = Date.now();
    
    // Track message sent
    trackMessageSent(content.length, conversationId);

    // Add user message with optimistic update
    const userMessageId = addOptimisticMessage(content, 'user', 'sending');
    
    // Update user message to sent immediately (user messages don't need server confirmation)
    updateMessageStatus(userMessageId, 'sent');
    
    // Add assistant message placeholder
    const assistantMessageId = addOptimisticMessage('', 'assistant', 'streaming');
    
    setIsLoading(true);

    try {
      let assistantContent = '';

      await chatService.sendMessageStream(
        content,
        conversationId,
        (chunk) => {
          assistantContent += chunk;
          updateMessageContent(assistantMessageId, assistantContent, 'streaming');
        },
        (error) => {
          console.error('Streaming error:', error);
          trackError(new Error(error), { 
            context: 'message_streaming',
            conversationId,
            messageLength: content.length
          });
          
          updateMessageContent(
            assistantMessageId, 
            'Sorry, I encountered an error. Please try again.',
            'error'
          );
        }
      );

      // Mark assistant message as complete
      updateMessageStatus(assistantMessageId, 'sent');
      
      // Track successful response
      const responseTime = Date.now() - startTime;
      trackMessageReceived(responseTime, assistantContent.length, conversationId);
      
    } catch (error) {
      console.error('Error sending message:', error);
      trackError(error instanceof Error ? error : new Error(String(error)), {
        context: 'message_sending',
        conversationId,
        messageLength: content.length
      });
      
      updateMessageContent(
        assistantMessageId,
        'Sorry, I encountered an error. Please try again.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryMessage = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || message.role !== 'assistant') return;

    updateMessageStatus(messageId, 'retry');
    setIsLoading(true);

    try {
      let assistantContent = '';

      // Find the previous user message to retry
      const messageIndex = messages.findIndex(m => m.id === messageId);
      const previousUserMessage = messages.slice(0, messageIndex).reverse().find(m => m.role === 'user');
      
      if (previousUserMessage) {
        await chatService.sendMessageStream(
          previousUserMessage.content,
          conversationId,
          (chunk) => {
            assistantContent += chunk;
            updateMessageContent(messageId, assistantContent, 'streaming');
          },
          (error) => {
            console.error('Retry streaming error:', error);
            updateMessageContent(
              messageId, 
              'Sorry, I encountered an error. Please try again.',
              'error'
            );
          }
        );

        updateMessageStatus(messageId, 'sent');
      }
    } catch (error) {
      console.error('Error retrying message:', error);
      updateMessageContent(
        messageId,
        'Sorry, I encountered an error. Please try again.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    trackUserAction('clear_chat', { 
      messageCount: messages.length,
      conversationId 
    });
    
    clearMessages();
    const newConversationId = uuidv4();
    setConversationId(newConversationId);
    localStorage.setItem('conversationId', newConversationId);
    localStorage.removeItem('chatMessages');
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto relative" role="main">
      {/* Glass container for the entire chat */}
      <div className="flex flex-col h-full ps-glass rounded-3xl shadow-2xl border border-border/30 overflow-hidden relative">
        {/* Chat header with new styling */}
        <div className="flex items-center justify-between p-6 ps-glass border-b border-border/30 relative">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full ps-gradient-primary flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              </div>
            </div>
            <div>
              <h2 id="chat-title" className="text-lg font-bold ps-gradient-text">
                Chat Session
              </h2>
              <p className="text-xs text-muted-foreground">
                Powered by PS-Chat AI
              </p>
            </div>
          </div>
          
          {messages.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  trackUserAction('open_export_dialog', { messageCount: messages.length });
                  setShowExportDialog(true);
                }}
                className="ps-button group relative"
                aria-label="Export conversation"
                title="Export conversation"
              >
                <Download className="h-4 w-4 mr-2 group-hover:text-purple-500 transition-colors" aria-hidden="true" />
                Export
              </button>
              
              <button
                onClick={handleClearChat}
                className="ps-button group relative hover:border-red-300 dark:hover:border-red-700"
                aria-label="Clear all messages in chat"
                title="Clear all messages"
              >
                <Trash2 className="h-4 w-4 mr-2 group-hover:text-red-500 transition-colors" aria-hidden="true" />
                Clear
              </button>
            </div>
          )}
        </div>
        
        {/* Messages area with enhanced styling */}
        <div 
          className="flex-1 overflow-hidden relative" 
          role="log" 
          aria-live="polite" 
          aria-label="Chat messages"
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/10 pointer-events-none z-10"></div>
          
          <div className="h-full p-6 overflow-y-auto scrollbar-hide">
            <MessageList messages={messages} isLoading={isLoading} onRetryMessage={handleRetryMessage} />
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input area with enhanced styling */}
        <div className="ps-input-area p-6" role="region" aria-label="Message input">
          <InputArea onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>

        {/* Subtle decorative elements */}
        <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-r from-teal-500/8 to-cyan-500/8 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-10 h-10 bg-gradient-to-r from-blue-500/6 to-teal-500/6 rounded-full blur-lg animate-pulse delay-2000"></div>
      </div>

      <ExportDialog 
        messages={getRegularMessages()}
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />
    </div>
  );
}