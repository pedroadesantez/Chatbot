import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  id: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

const ConversationSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    maxlength: 200,
  },
  messageCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

ConversationSchema.index({ createdAt: -1 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);