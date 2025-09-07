import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { openaiService } from '../services/openai';
import { ChatRequest, Message } from '../types';
import { AppError } from '../middleware/errorHandler';
import { contextManager } from '../services/contextManager';

const router = express.Router();

const conversations = new Map<string, { messages: Message[]; lastActivity: Date }>();

const addSystemMessage = (): Message => ({
  id: uuidv4(),
  role: 'system',
  content: 'You are a helpful AI assistant. Be concise, friendly, and informative in your responses. Keep your answers clear and well-structured.',
  timestamp: new Date(),
});

// Cleanup old conversations periodically
setInterval(() => {
  for (const [conversationId, conversation] of conversations.entries()) {
    if (contextManager.shouldCleanupConversation(conversation.lastActivity)) {
      conversations.delete(conversationId);
      console.log(`Cleaned up inactive conversation: ${conversationId}`);
    }
  }
}, 60 * 60 * 1000); // Check every hour

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, conversationId, stream = false }: ChatRequest = req.body;

    // Validate message content
    const validation = contextManager.validateMessage(message);
    if (!validation.valid) {
      const error: AppError = new Error(validation.error || 'Invalid message');
      error.statusCode = 400;
      throw error;
    }

    const currentConversationId = conversationId || uuidv4();
    
    if (!conversations.has(currentConversationId)) {
      conversations.set(currentConversationId, {
        messages: [addSystemMessage()],
        lastActivity: new Date(),
      });
    }

    const conversationData = conversations.get(currentConversationId)!;
    let conversationMessages = conversationData.messages;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
      conversationId: currentConversationId,
    };

    conversationMessages.push(userMessage);

    // Trim conversation to manage context and token limits
    conversationMessages = contextManager.trimConversation(conversationMessages);
    
    // Update conversation data
    conversationData.messages = conversationMessages;
    conversationData.lastActivity = new Date();
    conversations.set(currentConversationId, conversationData);

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

      const assistantMessageId = uuidv4();
      let fullResponse = '';

      try {
        for await (const chunk of openaiService.chatCompletionStream(conversationMessages)) {
          fullResponse += chunk;
          res.write(`data: ${JSON.stringify({
            chunk,
            messageId: assistantMessageId,
            conversationId: currentConversationId,
            done: false,
          })}\n\n`);
        }

        const assistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date(),
          conversationId: currentConversationId,
        };

        conversationMessages.push(assistantMessage);
        conversationData.messages = conversationMessages;
        conversationData.lastActivity = new Date();
        conversations.set(currentConversationId, conversationData);

        res.write(`data: ${JSON.stringify({
          chunk: '',
          messageId: assistantMessageId,
          conversationId: currentConversationId,
          done: true,
          fullMessage: fullResponse,
        })}\n\n`);
        
        res.end();
      } catch (error) {
        res.write(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`);
        res.end();
      }
    } else {
      const response = await openaiService.chatCompletion(conversationMessages);
      
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        conversationId: currentConversationId,
      };

      conversationMessages.push(assistantMessage);
      conversationData.messages = conversationMessages;
      conversationData.lastActivity = new Date();
      conversations.set(currentConversationId, conversationData);

      res.json({
        message: response,
        conversationId: currentConversationId,
        messageId: assistantMessage.id,
        timestamp: assistantMessage.timestamp,
      });
    }
  } catch (error) {
    next(error);
  }
});

router.get('/conversation/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const conversationData = conversations.get(id);
    
    if (!conversationData) {
      const error: AppError = new Error('Conversation not found');
      error.statusCode = 404;
      throw error;
    }

    const messagesWithoutSystem = conversationData.messages.filter(msg => msg.role !== 'system');
    res.json({
      conversationId: id,
      messages: messagesWithoutSystem,
      lastActivity: conversationData.lastActivity,
      messageCount: messagesWithoutSystem.length,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/conversation/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleted = conversations.delete(id);
    
    if (!deleted) {
      const error: AppError = new Error('Conversation not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({ message: 'Conversation cleared successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;