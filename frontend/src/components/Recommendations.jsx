import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';

export default function Recommendations({ analytics }) {
  if (!analytics || !analytics.recommendations) return null;

  const { favoriteGenre, suggestions, message } = analytics.recommendations;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 neon-border-cyan"
    >
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="text-neon-cyan" size={24} />
        <h2 className="text-xl font-bold neon-text-cyan">Recommendations</h2>
      </div>

      {favoriteGenre ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white/80">
            <TrendingUp size={18} className="text-neon-magenta" />
            <span className="text-sm">Favorite Genre: </span>
            <span className="font-semibold text-neon-cyan">{favoriteGenre}</span>
          </div>
          
          <div>
            <p className="text-white/70 mb-3">{message}</p>
            <div className="bg-black/30 rounded-lg p-4">
              <p className="text-white/90 text-sm leading-relaxed">{suggestions}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-white/70">{message}</p>
      )}
    </motion.div>
  );
}