import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  conversationId: string;
}

const MessageSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant', 'system'],
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  conversationId: {
    type: String,
    required: true,
    index: true,
  },
});

MessageSchema.index({ conversationId: 1, timestamp: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);