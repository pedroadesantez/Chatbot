export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  messages: Message[];
  title?: string;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  messageId: string;
  timestamp: string;
}

export interface StreamChunk {
  chunk: string;
  messageId: string;
  conversationId: string;
  done: boolean;
  fullMessage?: string;
  error?: string;
}