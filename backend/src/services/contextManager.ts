import { Message } from '../types';

export class ContextManager {
  private readonly MAX_TOKENS = 4000; // Conservative limit for GPT-3.5
  private readonly TOKENS_PER_MESSAGE = 100; // Average tokens per message
  private readonly MAX_MESSAGES = 30; // Hard limit on message count
  private readonly KEEP_RECENT_MESSAGES = 10; // Always keep recent messages

  /**
   * Estimate token count for a message
   */
  private estimateTokens(message: Message): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(message.content.length / 4) + 10; // +10 for role and metadata
  }

  /**
   * Calculate total tokens in conversation
   */
  private calculateTotalTokens(messages: Message[]): number {
    return messages.reduce((total, msg) => total + this.estimateTokens(msg), 0);
  }

  /**
   * Trim conversation to fit within token limits
   */
  public trimConversation(messages: Message[]): Message[] {
    // Always keep system message if it exists
    const systemMessage = messages.find(msg => msg.role === 'system');
    const nonSystemMessages = messages.filter(msg => msg.role !== 'system');

    // If within limits, return as is
    if (nonSystemMessages.length <= this.MAX_MESSAGES && 
        this.calculateTotalTokens(messages) <= this.MAX_TOKENS) {
      return messages;
    }

    // Keep recent messages and system message
    let trimmedMessages: Message[] = [];
    
    if (systemMessage) {
      trimmedMessages.push(systemMessage);
    }

    // Keep the most recent messages
    const recentMessages = nonSystemMessages.slice(-this.KEEP_RECENT_MESSAGES);
    trimmedMessages.push(...recentMessages);

    // If still over token limit, remove older messages one by one
    while (trimmedMessages.length > 2 && 
           this.calculateTotalTokens(trimmedMessages) > this.MAX_TOKENS) {
      // Remove the second message (keep system + most recent)
      if (trimmedMessages.length > 2) {
        trimmedMessages.splice(1, 1);
      }
    }

    return trimmedMessages;
  }

  /**
   * Check if conversation needs summarization
   */
  public needsSummarization(messages: Message[]): boolean {
    const nonSystemMessages = messages.filter(msg => msg.role !== 'system');
    return nonSystemMessages.length > this.MAX_MESSAGES * 0.8;
  }

  /**
   * Create a summary of older messages
   */
  public createConversationSummary(messages: Message[]): Message | null {
    const nonSystemMessages = messages.filter(msg => msg.role !== 'system');
    
    if (nonSystemMessages.length <= this.KEEP_RECENT_MESSAGES) {
      return null;
    }

    const messagesToSummarize = nonSystemMessages.slice(0, -this.KEEP_RECENT_MESSAGES);
    
    if (messagesToSummarize.length === 0) {
      return null;
    }

    const summaryContent = `Previous conversation summary: The user and assistant discussed ${messagesToSummarize.length} messages covering various topics. Key context has been preserved for continuity.`;

    return {
      id: `summary-${Date.now()}`,
      role: 'system' as const,
      content: summaryContent,
      timestamp: new Date(),
    };
  }

  /**
   * Clean up old conversations from memory
   */
  public shouldCleanupConversation(lastActivity: Date): boolean {
    const now = new Date();
    const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    return hoursSinceActivity > 24; // Clean up after 24 hours of inactivity
  }

  /**
   * Validate message content
   */
  public validateMessage(content: string): { valid: boolean; error?: string } {
    if (!content || typeof content !== 'string') {
      return { valid: false, error: 'Message content must be a non-empty string' };
    }

    if (content.trim().length === 0) {
      return { valid: false, error: 'Message cannot be empty' };
    }

    if (content.length > 10000) {
      return { valid: false, error: 'Message is too long (maximum 10,000 characters)' };
    }

    // Check for potentially malicious content patterns
    const maliciousPatterns = [
      /javascript:/i,
      /<script\b/i,
      /on\w+\s*=/i, // onclick, onload, etc.
      /eval\s*\(/i,
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(content)) {
        return { valid: false, error: 'Message contains potentially unsafe content' };
      }
    }

    return { valid: true };
  }
}

export const contextManager = new ContextManager();