export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  conversationId?: string;
}

export interface Conversation {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  title?: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  stream?: boolean;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  messageId: string;
  timestamp: Date;
}