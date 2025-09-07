'use client';

import { Message } from '@/types';
import { User, Bot, Copy, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  message: Message;
  index?: number;
  totalMessages?: number;
}

export function MessageBubble({ message, index = 0, totalMessages = 1 }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const messageNumber = index + 1;
  const roleLabel = isUser ? 'user' : 'AI assistant';

  const UserAvatar = () => (
    <motion.div 
      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center relative overflow-hidden ps-gradient-primary shadow-lg"
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 300 }}
      role="img"
      aria-label={roleLabel}
    >
      <User className="w-5 h-5 text-white" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
    </motion.div>
  );

  const BotAvatar = () => (
    <motion.div 
      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center relative ps-glass border-2 border-teal-200 dark:border-teal-700"
      whileHover={{ scale: 1.05, rotate: 3 }}
      transition={{ type: "spring", stiffness: 300 }}
      role="img"
      aria-label={roleLabel}
    >
      <Bot className="w-5 h-5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ 
          background: [
            'radial-gradient(circle at 30% 30%, rgba(20, 184, 166, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 70%, rgba(20, 184, 166, 0.2) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 30%, rgba(20, 184, 166, 0.15) 0%, transparent 50%)'
          ]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4,
        delay: index * 0.05,
        type: "spring",
        stiffness: 300 
      }}
      className={`flex items-start space-x-4 ${isUser ? 'flex-row-reverse space-x-reverse' : ''} mb-6`}
      role="article"
      aria-label={`Message ${messageNumber} from ${roleLabel}`}
    >
      {isUser ? <UserAvatar /> : <BotAvatar />}
      
      <div className={`flex flex-col space-y-2 max-w-[75%] min-w-[100px] ${isUser ? 'items-end' : 'items-start'}`}>
        <motion.div 
          className={`group relative ${isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
          style={{ minWidth: '80px', maxWidth: '100%' }}
        >
          {!isUser && (
            <motion.div
              className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 flex items-center justify-center shadow-lg"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
            >
              <Sparkles className="w-3 h-3 text-white" />
            </motion.div>
          )}
          
          <div 
            className="whitespace-pre-wrap break-words leading-relaxed block w-full"
            style={{
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              display: 'block',
              width: '100%',
              minWidth: '0'
            }}
            role="text"
            aria-label={`Message content: ${message.content}`}
          >
            {message.content}
          </div>
          
          {message.content && (
            <motion.button
              onClick={handleCopy}
              className={`absolute top-3 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 p-2 rounded-lg hover:bg-white/20 dark:hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-purple-400 backdrop-blur-sm ${
                isUser ? 'left-3 text-white/80 hover:text-white' : 'right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              aria-label={`Copy message content${copied ? ' (copied!)' : ''}`}
              title={copied ? 'Copied!' : 'Copy message'}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                initial={false}
                animate={{ rotate: copied ? 360 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" aria-hidden="true" />
                ) : (
                  <Copy className="w-4 h-4" aria-hidden="true" />
                )}
              </motion.div>
            </motion.button>
          )}
          
          {/* Enhanced glow effect for user messages */}
          {isUser && (
            <div className="absolute inset-0 rounded-2xl rounded-tr-md bg-gradient-to-r from-blue-500/15 via-teal-500/15 to-cyan-500/15 blur-xl -z-10 group-hover:opacity-100 opacity-40 transition-opacity duration-300"></div>
          )}
        </motion.div>
        
        <motion.time 
          className={`text-xs font-medium ${
            isUser 
              ? 'text-teal-200 dark:text-teal-300' 
              : 'text-slate-500 dark:text-slate-400'
          }`}
          dateTime={message.timestamp.toISOString()}
          aria-label={`Sent at ${message.timestamp.toLocaleString()}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </motion.time>
      </div>
    </motion.div>
  );
}