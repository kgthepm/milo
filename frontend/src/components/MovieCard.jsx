import { motion } from 'framer-motion';
import { Star, Calendar, Trash2, Edit } from 'lucide-react';
import { useMovies } from '../utils/MovieContext';
import { useState, useEffect } from 'react';
import { getEffectiveGenreColors, subscribeUserPrefs } from '../utils/userPrefs';
import { getGenreGlowStyle } from '../utils/genreColors';

const getRatingColor = (rating) => {
  if (rating >= 8) return 'text-green-400';
  if (rating >= 6) return 'text-yellow-400';
  return 'text-red-400';
};

export default function MovieCard({ movie, onDelete, onEdit }) {
  const { deleteMovie } = useMovies();
  const [isDeleting, setIsDeleting] = useState(false);
  const [genreColors, setGenreColors] = useState(getEffectiveGenreColors);
  useEffect(() => subscribeUserPrefs(() => setGenreColors(getEffectiveGenreColors())), []);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${movie.title}"?`)) {
      setIsDeleting(true);
      try {
        await deleteMovie(movie.id);
      } catch (err) {
        alert('Failed to delete movie');
        setIsDeleting(false);
      }
    }
  };

  const glowStyle = getGenreGlowStyle(movie.genre, genreColors);
  const ratingClass = getRatingColor(movie.rating);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      style={glowStyle}
      className="glass rounded-xl p-5 border transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-white pr-2 line-clamp-2">{movie.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(movie)}
            className="text-white/60 hover:text-neon-cyan transition-colors"
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

      {movie.director && (
        <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
          <span className="font-medium">Director:</span>
          <span>{movie.director}</span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <div className={`flex items-center gap-1 ${ratingClass}`}>
          <Star size={16} fill="currentColor" />
          <span className="font-bold">{movie.rating}</span>
          <span className="text-white/60 text-sm">/10</span>
        </div>
        {movie.genre && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80">
            {movie.genre}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
        <Calendar size={14} />
        {movie.date_watched ? (
          <span>{(() => {
            const [year, month, day] = movie.date_watched.split('-');
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

      {movie.notes && (
        <p className="text-white/70 text-sm line-clamp-2 mt-3 pt-3 border-t border-white/10">
          {movie.notes}
        </p>
      )}
    </motion.div>
  );
}