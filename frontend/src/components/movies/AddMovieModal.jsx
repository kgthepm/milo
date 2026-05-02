import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useMovies } from '../../utils/MovieContext';

const genres = ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Thriller', 'Romance', 'Animation', 'Documentary', 'Fantasy'];

export default function AddMovieModal({ isOpen, onClose }) {
  const { addMovie } = useMovies();
  const [formData, setFormData] = useState({
    title: '',
    rating: '',
    genre: '',
    date_watched: '',
    notes: '',
    director: '',
    release_year: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addMovie({
        ...formData,
        rating: parseFloat(formData.rating),
        release_year: formData.release_year ? parseInt(formData.release_year) : null,
      });
      setFormData({
        title: '',
        rating: '',
        genre: '',
        date_watched: '',
        notes: '',
        director: '',
        release_year: '',
      });
      onClose();
    } catch (err) {
      alert('Failed to add movie: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass rounded-2xl p-6 w-full max-w-md neon-border-cyan"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold neon-text-cyan">Add New Movie</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-lg glass"
              placeholder="Enter movie title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">Director</label>
            <input
              type="text"
              value={formData.director}
              onChange={(e) => setFormData({ ...formData, director: e.target.value })}
              className="w-full px-4 py-3 rounded-lg glass"
              placeholder="Enter director name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">Release Year</label>
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              step="1"
              value={formData.release_year}
              onChange={(e) => setFormData({ ...formData, release_year: e.target.value })}
              className="w-full px-4 py-3 rounded-lg glass"
              placeholder="e.g., 1978"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">Rating (1-10) *</label>
            <input
              type="number"
              min="1"
              max="10"
              step="0.01"
              required
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              className="w-full px-4 py-3 rounded-lg glass"
              placeholder="Enter rating"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">Genre</label>
            <select
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              className="w-full px-4 py-3 rounded-lg glass"
            >
              <option value="">Select genre</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">Date Watched</label>
            <input
              type="date"
              value={formData.date_watched}
              onChange={(e) => setFormData({ ...formData, date_watched: e.target.value })}
              className="w-full px-4 py-3 rounded-lg glass"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 rounded-lg glass min-h-[100px]"
              placeholder="Add your thoughts..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 rounded-lg bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan font-semibold hover:bg-neon-cyan/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed neon-text-cyan"
          >
            {isSubmitting ? 'Adding...' : 'Add Movie'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
