'use client';

import { useState, useCallback } from 'react';
import { Message } from '@/types';
import { OptimisticMessage, MessageStatus } from '@/components/optimistic-message';
import { v4 as uuidv4 } from 'uuid';

export function useOptimisticMessages() {
  const [messages, setMessages] = useState<OptimisticMessage[]>([]);

  // Add a new message with optimistic state
  const addOptimisticMessage = useCallback((content: string, role: 'user' | 'assistant', status: MessageStatus = 'sent') => {
    const optimisticMessage: OptimisticMessage = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date(),
      status,
    };

    setMessages(prev => [...prev, optimisticMessage]);
    return optimisticMessage.id;
  }, []);

  // Update message status
  const updateMessageStatus = useCallback((messageId: string, status: MessageStatus, error?: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status, error }
          : msg
      )
    );
  }, []);

  // Update message content (for streaming)
  const updateMessageContent = useCallback((messageId: string, content: string, status?: MessageStatus) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content, ...(status && { status }) }
          : msg
      )
    );
  }, []);

  // Remove a message
  const removeMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  // Replace optimistic message with real message
  const replaceMessage = useCallback((messageId: string, newMessage: Message) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...newMessage, status: 'sent' }
          : msg
      )
    );
  }, []);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Set messages from storage
  const setMessagesFromStorage = useCallback((storedMessages: Message[]) => {
    const optimisticMessages: OptimisticMessage[] = storedMessages.map(msg => ({
      ...msg,
      status: 'sent' as MessageStatus
    }));
    setMessages(optimisticMessages);
  }, []);

  // Get regular messages (without optimistic status)
  const getRegularMessages = useCallback((): Message[] => {
    return messages.map(({ status, error, ...message }) => message);
  }, [messages]);

  return {
    messages,
    addOptimisticMessage,
    updateMessageStatus,
    updateMessageContent,
    removeMessage,
    replaceMessage,
    clearMessages,
    setMessagesFromStorage,
    getRegularMessages,
  };
}