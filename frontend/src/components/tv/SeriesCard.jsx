import { motion } from 'framer-motion';
import { Star, Calendar, Trash2, Edit, Tv, Layers, List } from 'lucide-react';
import { useTVSeries } from '../../utils/TVSeriesContext';
import { useState } from 'react';

const genreColors = {
  'Action': 'border-neon-magenta shadow-neon-magenta',
  'Comedy': 'border-neon-yellow shadow-neon-yellow',
  'Drama': 'border-neon-purple shadow-neon-purple',
  'Sci-Fi': 'border-neon-cyan shadow-neon-cyan',
  'Horror': 'border-red-500 shadow-red-500',
  'Thriller': 'border-orange-500 shadow-orange-500',
  'Romance': 'border-pink-500 shadow-pink-500',
  'Animation': 'border-green-500 shadow-green-500',
  'Documentary': 'border-blue-500 shadow-blue-500',
  'Fantasy': 'border-purple-500 shadow-purple-500',
};

const getRatingColor = (rating) => {
  if (rating >= 8) return 'text-green-400';
  if (rating >= 6) return 'text-yellow-400';
  return 'text-red-400';
};

export default function SeriesCard({ series, onEdit }) {
  const { deleteSeries } = useTVSeries();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${series.title}"?`)) {
      setIsDeleting(true);
      try {
        await deleteSeries(series.id);
      } catch (err) {
        alert('Failed to delete TV series');
        setIsDeleting(false);
      }
    }
  };

  const genreClass = series.genre ? genreColors[series.genre] || 'border-white/20' : 'border-white/20';
  const ratingClass = getRatingColor(series.rating);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`glass rounded-xl p-5 border ${genreClass} transition-all duration-300`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-1">
          <Tv size={18} className="text-neon-magenta flex-shrink-0" />
          <h3 className="text-xl font-bold text-white line-clamp-2">{series.title}</h3>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(series)}
            className="text-white/60 hover:text-neon-magenta transition-colors"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-white/60 hover:text-red-400 transition-colors disabled:opacity-50"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className={`flex items-center gap-1 ${ratingClass}`}>
          <Star size={16} fill="currentColor" />
          <span className="font-bold">{series.rating}</span>
          <span className="text-white/60 text-sm">/10</span>
        </div>
        {series.genre && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80">
            {series.genre}
          </span>
        )}
      </div>

      {(series.num_seasons || series.total_episodes) && (
        <div className="flex gap-4 mb-2 text-white/70 text-sm">
          {series.num_seasons && (
            <div className="flex items-center gap-1">
              <Layers size={14} />
              <span>{series.num_seasons} Season{series.num_seasons !== 1 ? 's' : ''}</span>
            </div>
          )}
          {series.total_episodes && (
            <div className="flex items-center gap-1">
              <List size={14} />
              <span>{series.total_episodes} Episode{series.total_episodes !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
        <Calendar size={14} />
        {series.date_watched ? (
          <span>{(() => {
            const [year, month, day] = series.date_watched.split('-');
            return new Date(year, month - 1, day).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            });
          })()}</span>
        ) : (
          <span>No date</span>
        )}
      </div>

      {series.notes && (
        <p className="text-white/70 text-sm line-clamp-2 mt-3 pt-3 border-t border-white/10">
          {series.notes}
        </p>
      )}
    </motion.div>
  );
}
