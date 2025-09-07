import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import { Message as MessageType } from '../types';

export class DatabaseService {
  async saveMessage(message: MessageType): Promise<void> {
    try {
      await Message.create(message);
      
      await Conversation.findOneAndUpdate(
        { id: message.conversationId },
        {
          $inc: { messageCount: 1 },
          $set: { updatedAt: new Date() }
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Error saving message:', error);
      throw new Error('Failed to save message to database');
    }
  }

  async getConversationMessages(conversationId: string): Promise<MessageType[]> {
    try {
      const messages = await Message.find({ conversationId })
        .sort({ timestamp: 1 })
        .lean();

      return messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        conversationId: msg.conversationId,
      }));
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      throw new Error('Failed to fetch conversation messages');
    }
  }

  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const messageResult = await Message.deleteMany({ conversationId });
      const conversationResult = await Conversation.deleteOne({ id: conversationId });
      
      return messageResult.deletedCount > 0 || conversationResult.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw new Error('Failed to delete conversation');
    }
  }

  async createConversation(conversationId: string, title?: string): Promise<void> {
    try {
      await Conversation.create({
        id: conversationId,
        title,
        createdAt: new Date(),
        updatedAt: new Date(),
        messageCount: 0,
      });
    } catch (error) {
      if ((error as any).code !== 11000) {
        console.error('Error creating conversation:', error);
        throw new Error('Failed to create conversation');
      }
    }
  }

  async getRecentConversations(limit: number = 10): Promise<any[]> {
    try {
      return await Conversation.find()
        .sort({ updatedAt: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('Error fetching recent conversations:', error);
      throw new Error('Failed to fetch recent conversations');
    }
  }
}

export const databaseService = new DatabaseService();