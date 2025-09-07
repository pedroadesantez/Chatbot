import OpenAI from 'openai';
import { Message } from '../types';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file.');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export class OpenAIService {
  private model: string;

  constructor() {
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  }

  async chatCompletion(messages: Message[]): Promise<string> {
    try {
      const formattedMessages = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }));

      const completion = await getOpenAIClient().chat.completions.create({
        model: this.model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      return completion.choices[0]?.message?.content || 'No response generated.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate response from AI');
    }
  }

  async *chatCompletionStream(messages: Message[]): AsyncGenerator<string, void, unknown> {
    try {
      const formattedMessages = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }));

      const stream = await getOpenAIClient().chat.completions.create({
        model: this.model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('OpenAI API streaming error:', error);
      throw new Error('Failed to generate streaming response from AI');
    }
  }
}

export const openaiService = new OpenAIService();