'use client';

import { Moon, Sun, Sparkles, Zap } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const PSChatLogo = () => (
    <div className="relative flex items-center space-x-3">
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-teal-500/20 blur-sm"></div>
        <div className="relative ps-gradient-primary p-2 rounded-xl border border-white/10">
          <Zap className="h-5 w-5 text-white" />
        </div>
      </motion.div>
      
      <div className="flex items-center space-x-2">
        <motion.h1 
          className="text-xl font-bold ps-gradient-text"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          PS-Chat
        </motion.h1>
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatDelay: 5,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="h-4 w-4 text-teal-500" />
        </motion.div>
      </div>
    </div>
  );

  if (!mounted) {
    return (
      <header className="ps-header">
        <div className="container flex h-16 items-center justify-between px-6">
          <PSChatLogo />
          <div className="w-12 h-12" />
        </div>
      </header>
    );
  }

  return (
    <motion.header 
      className="ps-header sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container flex h-16 items-center justify-between px-6">
        <PSChatLogo />
        
        <div className="flex items-center space-x-3">
          <motion.div
            className="text-sm font-medium text-muted-foreground hidden sm:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Premium AI Assistant
          </motion.div>
          
          <motion.button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="ps-icon-button ps-glow group relative"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              initial={false}
              animate={{ rotate: theme === 'dark' ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600 group-hover:text-teal-600 transition-colors" />
              )}
            </motion.div>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}