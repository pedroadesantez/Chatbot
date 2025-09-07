'use client';

import { useState, KeyboardEvent, useMemo } from 'react';
import { Send, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { validateMessage, ClientRateLimit } from '@/lib/validation';
import { motion, AnimatePresence } from 'framer-motion';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function InputArea({ onSendMessage, disabled = false }: InputAreaProps) {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Initialize rate limiter (10 messages per minute)
  const rateLimiter = useMemo(() => new ClientRateLimit(10, 60000), []);

  const handleSend = () => {
    // Clear previous errors
    setValidationError('');
    setIsRateLimited(false);

    // Check rate limiting
    if (!rateLimiter.canMakeRequest()) {
      setIsRateLimited(true);
      const waitTime = Math.ceil(rateLimiter.getTimeUntilReset() / 1000);
      setValidationError(`Too many messages. Please wait ${waitTime} seconds.`);
      return;
    }

    // Validate message
    const validation = validateMessage(message);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid message');
      return;
    }

    if (validation.sanitizedContent && !disabled) {
      onSendMessage(validation.sanitizedContent);
      setMessage('');
      setValidationError('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleMessageChange = (value: string) => {
    setMessage(value);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }

    // Real-time validation for length
    if (value.length > 10000) {
      setValidationError('Message is too long (maximum 10,000 characters)');
    }
  };

  const characterCount = message.length;
  const isNearLimit = characterCount > 9000;
  const isOverLimit = characterCount > 10000;

  return (
    <motion.div 
      className="w-full space-y-3"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Validation Error Display */}
      <AnimatePresence>
        {validationError && (
          <motion.div 
            className="flex items-center gap-3 text-sm text-red-400 ps-glass border border-red-400/30 rounded-xl p-3 shadow-lg"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            </motion.div>
            <span className="font-medium">{validationError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end space-x-4 w-full">
        <motion.div 
          className="flex-1 relative"
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {/* Glass container for input */}
          <div className="relative ps-glass rounded-2xl border border-border/30 shadow-xl overflow-hidden">
            {/* Subtle professional background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-teal-500/3 to-cyan-500/3 opacity-30"></div>
            
            <div className="relative flex items-center p-2">
              <textarea
                value={message}
                onChange={(e) => handleMessageChange(e.target.value)}
                onKeyDown={handleKeyPress}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                placeholder="💬 Type your message..."
                disabled={disabled || isRateLimited}
                className={`w-full resize-none bg-transparent px-4 py-3 text-sm ring-offset-0 placeholder:text-muted-foreground/70 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 pr-16 min-h-[48px] max-h-32 ${
                  validationError ? 'text-red-400' : 'text-foreground'
                } ${isOverLimit ? 'text-red-400' : ''}`}
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '48px',
                  maxHeight: '128px',
                  overflowY: message.split('\n').length > 3 ? 'auto' : 'hidden',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                }}
                aria-describedby={validationError ? 'input-error' : undefined}
                maxLength={10100}
              />
              
              {/* Character counter */}
              <AnimatePresence>
                {(isNearLimit || isOverLimit) && (
                  <motion.div 
                    className={`absolute bottom-3 right-20 text-xs font-medium px-2 py-1 rounded-full ${
                      isOverLimit 
                        ? 'text-red-400 bg-red-500/10' 
                        : 'text-yellow-500 bg-yellow-500/10'
                    }`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    {characterCount}/10,000
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Floating indicator */}
              {message.trim() && !disabled && (
                <motion.div
                  className="absolute top-2 right-4 w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                />
              )}
            </div>
          </div>
        </motion.div>
        
        <motion.button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isRateLimited || isOverLimit || !!validationError}
          className="ps-send-button group relative overflow-hidden min-w-[56px] h-14 shadow-2xl"
          aria-label="Send message"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {/* Professional button background */}
          <motion.div
            className="absolute inset-0 ps-gradient-primary"
          />
          
          {/* Button content */}
          <div className="relative flex items-center justify-center w-full h-full">
            <AnimatePresence mode="wait">
              {disabled ? (
                <motion.div
                  key="loading"
                  initial={{ rotate: 0, scale: 0 }}
                  animate={{ rotate: 360, scale: 1 }}
                  exit={{ rotate: 360, scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="send"
                  initial={{ rotate: -45, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  exit={{ rotate: 45, scale: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center space-x-1"
                >
                  <Send className="h-5 w-5 text-white" />
                  {message.trim() && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="ml-1"
                    >
                      <Sparkles className="h-3 w-3 text-white" />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subtle glow effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-20 blur-md -z-10"
            whileHover={{ scale: 1.1, opacity: 0.25 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>
      </div>
    </motion.div>
  );
}