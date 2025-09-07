import { Message } from '@/types';

export interface ExportOptions {
  format: 'text' | 'json' | 'markdown' | 'csv';
  includeTimestamps: boolean;
  includeSystemMessages: boolean;
}

export class ConversationExporter {
  /**
   * Export conversation to specified format
   */
  static export(messages: Message[], options: ExportOptions): string {
    const filteredMessages = options.includeSystemMessages 
      ? messages 
      : messages.filter(msg => msg.role !== 'system');

    switch (options.format) {
      case 'text':
        return this.exportAsText(filteredMessages, options.includeTimestamps);
      case 'json':
        return this.exportAsJSON(filteredMessages, options.includeTimestamps);
      case 'markdown':
        return this.exportAsMarkdown(filteredMessages, options.includeTimestamps);
      case 'csv':
        return this.exportAsCSV(filteredMessages, options.includeTimestamps);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export as plain text
   */
  private static exportAsText(messages: Message[], includeTimestamps: boolean): string {
    return messages.map(msg => {
      const timestamp = includeTimestamps 
        ? `[${msg.timestamp.toLocaleString()}] `
        : '';
      const role = msg.role === 'user' ? 'You' : 'AI';
      return `${timestamp}${role}: ${msg.content}`;
    }).join('\n\n');
  }

  /**
   * Export as JSON
   */
  private static exportAsJSON(messages: Message[], includeTimestamps: boolean): string {
    const exportData = {
      exportedAt: new Date().toISOString(),
      messageCount: messages.length,
      messages: messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        ...(includeTimestamps && { timestamp: msg.timestamp.toISOString() }),
      })),
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export as Markdown
   */
  private static exportAsMarkdown(messages: Message[], includeTimestamps: boolean): string {
    const header = `# Chat Conversation\n\nExported on ${new Date().toLocaleString()}\n\n---\n\n`;
    
    const content = messages.map(msg => {
      const timestamp = includeTimestamps 
        ? `\n*${msg.timestamp.toLocaleString()}*\n\n`
        : '\n\n';
      
      const role = msg.role === 'user' ? '👤 **You**' : '🤖 **AI Assistant**';
      const messageContent = msg.content.replace(/\n/g, '\n\n'); // Ensure proper line breaks
      
      return `${role}${timestamp}${messageContent}`;
    }).join('\n\n---\n\n');

    return header + content;
  }

  /**
   * Export as CSV
   */
  private static exportAsCSV(messages: Message[], includeTimestamps: boolean): string {
    const headers = includeTimestamps 
      ? ['Timestamp', 'Role', 'Content']
      : ['Role', 'Content'];

    const csvContent = [
      headers.join(','),
      ...messages.map(msg => {
        const escapedContent = `"${msg.content.replace(/"/g, '""')}"`;
        const row = includeTimestamps
          ? [`"${msg.timestamp.toISOString()}"`, `"${msg.role}"`, escapedContent]
          : [`"${msg.role}"`, escapedContent];
        return row.join(',');
      })
    ];

    return csvContent.join('\n');
  }

  /**
   * Download conversation as file
   */
  static downloadAsFile(
    messages: Message[], 
    options: ExportOptions, 
    filename?: string
  ): void {
    const content = this.export(messages, options);
    const timestamp = new Date().toISOString().slice(0, 10);
    const defaultFilename = `chat-conversation-${timestamp}`;
    
    const fileExtensions = {
      text: 'txt',
      json: 'json',
      markdown: 'md',
      csv: 'csv',
    };

    const finalFilename = `${filename || defaultFilename}.${fileExtensions[options.format]}`;
    
    const blob = new Blob([content], { 
      type: this.getMimeType(options.format) 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Copy conversation to clipboard
   */
  static async copyToClipboard(messages: Message[], options: ExportOptions): Promise<void> {
    const content = this.export(messages, options);
    
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(content);
    } else {
      // Fallback for older browsers or non-HTTPS contexts
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  /**
   * Get MIME type for export format
   */
  private static getMimeType(format: ExportOptions['format']): string {
    const mimeTypes = {
      text: 'text/plain',
      json: 'application/json',
      markdown: 'text/markdown',
      csv: 'text/csv',
    };

    return mimeTypes[format];
  }

  /**
   * Generate conversation summary for export
   */
  static generateSummary(messages: Message[]): string {
    const userMessages = messages.filter(msg => msg.role === 'user');
    const assistantMessages = messages.filter(msg => msg.role === 'assistant');
    
    const firstMessage = messages.find(msg => msg.role === 'user');
    const lastMessage = messages[messages.length - 1];
    
    const duration = firstMessage && lastMessage 
      ? new Date(lastMessage.timestamp).getTime() - new Date(firstMessage.timestamp).getTime()
      : 0;

    const durationString = duration > 0 
      ? `${Math.round(duration / 1000 / 60)} minutes`
      : 'Less than a minute';

    return `Conversation Summary:
- Total messages: ${messages.length}
- User messages: ${userMessages.length}
- AI responses: ${assistantMessages.length}
- Duration: ${durationString}
- Started: ${firstMessage?.timestamp.toLocaleString() || 'Unknown'}
- Ended: ${lastMessage?.timestamp.toLocaleString() || 'Unknown'}`;
  }

  /**
   * Validate messages before export
   */
  static validateForExport(messages: Message[]): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (messages.length === 0) {
      issues.push('No messages to export');
    }

    const invalidMessages = messages.filter(msg => 
      !msg.id || !msg.role || typeof msg.content !== 'string' || !msg.timestamp
    );

    if (invalidMessages.length > 0) {
      issues.push(`${invalidMessages.length} messages have invalid data`);
    }

    const messagesWithLongContent = messages.filter(msg => msg.content.length > 50000);
    if (messagesWithLongContent.length > 0) {
      issues.push(`${messagesWithLongContent.length} messages are very long and may cause issues`);
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}