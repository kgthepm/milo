import React from 'react';
import { motion } from 'framer-motion';
import { Film, Star, TrendingUp, Tv } from 'lucide-react';

export default function Stats({ analytics, type = 'movie' }) {
  if (!analytics) return null;

  const isMovie = type === 'movie';
  const colorClass = isMovie ? 'cyan' : 'magenta';
  const icon = isMovie ? Film : Tv;
  const label = isMovie ? 'Movies' : 'TV Series';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`glass rounded-xl p-5 neon-border-${colorClass}`}
      >
        <div className="flex items-center gap-3 mb-3">
          {React.createElement(icon, { className: `text-neon-${colorClass}`, size: 24 })}
          <h3 className="text-white/80 text-sm font-medium">Total {label}</h3>
        </div>
        <p className={`text-4xl font-bold neon-text-${colorClass}`}>{analytics.total}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-5 neon-border-purple"
      >
        <div className="flex items-center gap-3 mb-3">
          <Star className="text-neon-purple" size={24} />
          <h3 className="text-white/80 text-sm font-medium">Average Rating</h3>
        </div>
        <p className="text-4xl font-bold neon-text-purple">{analytics.avgRating || 0}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl p-5 neon-border-yellow"
      >
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="text-neon-yellow" size={24} />
          <h3 className="text-white/80 text-sm font-medium">Top Genre</h3>
        </div>
        <p className="text-2xl font-bold neon-text-yellow truncate">
          {analytics.topGenres && analytics.topGenres.length > 0 ? analytics.topGenres[0].genre : 'N/A'}
        </p>
      </motion.div>
    </div>
  );
}
