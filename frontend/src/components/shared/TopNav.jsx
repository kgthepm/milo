import { Link, useLocation } from 'react-router-dom';
import { Film, Tv } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AssistantModal from './AssistantModal';
import miloIcon from '/milo-ai-icon.jpeg';

export default function TopNav() {
  const location = useLocation();
  const isMovies = location.pathname === '/' || location.pathname === '/movies';
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const messages = [
    "Chat with MILO",
    "Need movie recs?",
    "Ask me anything!",
    "What should I watch?",
    "MILO's got you covered",
    "Let's find something good"
  ];

  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');

  const handleMouseEnter = () => {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setTooltipMessage(randomMessage);
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <>
      <nav className="glass rounded-xl p-2 mb-6 sm:mb-8 flex gap-2">
        <Link
          to="/movies"
          className={`flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-all ${
            isMovies
              ? 'bg-neon-cyan/20 text-neon-cyan neon-border-cyan'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Film size={18} />
          <span className="text-sm sm:text-base">Movies</span>
        </Link>
        <Link
          to="/tv"
          className={`flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-all ${
            !isMovies
              ? 'bg-neon-magenta/20 text-neon-magenta neon-border-magenta'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Tv size={18} />
          <span className="text-sm sm:text-base">TV Series</span>
        </Link>
      </nav>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-28 right-4 glass rounded-lg px-3 py-1.5 text-xs text-white shadow-lg pointer-events-none z-50 whitespace-nowrap"
          >
            {tooltipMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsAssistantOpen(true)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed bottom-4 right-4 w-16 h-16 sm:w-24 sm:h-24 border-2 border-white/20 flex items-center justify-center transition-all z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img src={miloIcon} alt="MILO AI" className="w-12 h-12 sm:w-20 sm:h-20 object-contain" />
      </motion.button>

      <AssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </>
  );
}
