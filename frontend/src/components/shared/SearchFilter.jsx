import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';

export const genres = ['All', 'Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Thriller', 'Romance', 'Animation', 'Documentary', 'Fantasy'];

export default function SearchFilter({ onSearch, onFilter, searchTerm, onClearSearch, placeholder = 'Search movies...' }) {
  const [minRating, setMinRating] = useState('');
  const [maxRating, setMaxRating] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value) => {
    onSearch(value);
  };

  const handleRatingFilter = () => {
    onFilter('rating', { min: minRating, max: maxRating });
  };

  const clearRatingFilters = () => {
    setMinRating('');
    setMaxRating('');
    onFilter('rating', { min: '', max: '' });
  };

  const hasActiveRatingFilters = minRating || maxRating;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-3 rounded-xl glass"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-xl glass transition-all ${showFilters ? 'neon-border-cyan' : ''}`}
          title="Rating Filters"
        >
          <Filter size={20} />
        </button>
        {hasActiveRatingFilters && (
          <button
            onClick={clearRatingFilters}
            className="px-4 py-3 rounded-xl glass text-red-400 hover:text-red-300 transition-colors"
            title="Clear rating filters"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-white/80">Min Rating</label>
              <input
                type="number"
                min="1"
                max="10"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                onBlur={handleRatingFilter}
                className="w-full px-3 py-2 rounded-lg glass"
                placeholder="1"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-white/80">Max Rating</label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxRating}
                onChange={(e) => setMaxRating(e.target.value)}
                onBlur={handleRatingFilter}
                className="w-full px-3 py-2 rounded-lg glass"
                placeholder="10"
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
