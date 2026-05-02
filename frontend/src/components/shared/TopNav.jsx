import { Link, useLocation } from 'react-router-dom';
import { Film, Tv, Brain } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import AssistantModal from './AssistantModal';

export default function TopNav() {
  const location = useLocation();
  const isMovies = location.pathname === '/' || location.pathname === '/movies';
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

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
      </nav>

      <motion.button
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Brain className="text-white" size={24} />
      </motion.button>

      <AssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </>
  );
}
