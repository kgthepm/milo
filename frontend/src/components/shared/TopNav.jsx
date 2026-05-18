import { Link, useLocation } from 'react-router-dom';
import { Film, Tv, Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AssistantModal from './AssistantModal';
import SettingsModal from '../SettingsModal';
import miloIcon from '/milo-ai-icon.jpeg';

export default function TopNav() {
  const location = useLocation();
  const isMovies = location.pathname === '/' || location.pathname === '/movies';
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
      <nav className="glass rounded-xl p-2 mb-8 flex gap-2">
        <Link
          to="/movies"
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            isMovies
              ? 'bg-neon-cyan/20 text-neon-cyan neon-border-cyan'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Film size={18} />
          Movies
        </Link>
        <Link
          to="/tv"
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            !isMovies
              ? 'bg-neon-magenta/20 text-neon-magenta neon-border-magenta'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Tv size={18} />
          TV Series
        </Link>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="ml-auto flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all"
          title="AI settings (BYOK)"
        >
          <SettingsIcon size={18} />
        </button>
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
        className="fixed bottom-4 right-4 w-24 h-24 border-2 border-white/20 flex items-center justify-center transition-all z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img src={miloIcon} alt="MILO AI" className="w-20 h-20 object-contain" />
      </motion.button>

      <AssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
