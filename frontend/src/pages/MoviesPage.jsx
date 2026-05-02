import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Film, RefreshCw, Upload } from 'lucide-react';
import { MovieProvider, useMovies } from '../utils/MovieContext';
import MovieCard from '../components/movies/MovieCard';
import AddMovieModal from '../components/movies/AddMovieModal';
import EditMovieModal from '../components/movies/EditMovieModal';
import ImportLetterboxdModal from '../components/movies/ImportLetterboxdModal';
import SearchFilter from '../components/shared/SearchFilter';
import GenreFilter from '../components/shared/GenreFilter';
import Timeline from '../components/movies/Timeline';
import Recommendations from '../components/movies/Recommendations';
import Stats from '../components/shared/Stats';
import TopNav from '../components/shared/TopNav';

function MoviesPageContent() {
  const { movies, analytics, loading, error, fetchMovies } = useMovies();
  const [activeTab, setActiveTab] = useState('movies');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [filterParams, setFilterParams] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [importSummary, setImportSummary] = useState(null);

  const handleSearch = (value) => {
    setSearchTerm(value);
    const newParams = { ...filterParams, search: value || undefined };
    setFilterParams(newParams);
    fetchMovies(newParams);
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    const newParams = { ...filterParams, genre: genre === 'All' ? undefined : genre };
    setFilterParams(newParams);
    fetchMovies(newParams);
  };

  const handleFilter = (type, value) => {
    const newParams = { ...filterParams };
    if (type === 'rating') {
      newParams.minRating = value.min || undefined;
      newParams.maxRating = value.max || undefined;
    }
    setFilterParams(newParams);
    fetchMovies(newParams);
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setShowEditModal(true);
  };

  const handleImportComplete = (summary) => {
    setImportSummary(summary);
    setShowImportModal(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'movies':
        return (
          <div className="space-y-6">
            <SearchFilter onSearch={handleSearch} onFilter={handleFilter} searchTerm={searchTerm} placeholder="Search movies..." />
            <GenreFilter selectedGenre={selectedGenre} onGenreChange={handleGenreChange} />
            {loading ? (
              <div className="text-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full mx-auto"
                />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-400">
                <p>{error}</p>
              </div>
            ) : movies.length === 0 ? (
              <div className="text-center py-12 text-white/50">
                <Film size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No movies found</p>
                <p className="text-sm">Add your first movie to get started!</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {movies.map((movie, index) => (
                    <MovieCard key={movie.id} movie={movie} onEdit={handleEdit} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        );

      case 'timeline':
        return <Timeline movies={movies} />;

      case 'recommendations':
        return (
          <div className="space-y-6">
            <Recommendations analytics={analytics} />
            {analytics?.topGenres && analytics.topGenres.length > 1 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Genre Distribution</h3>
                <div className="space-y-3">
                  {analytics.topGenres.map((genre, index) => (
                    <div key={genre.genre} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/80">{genre.genre}</span>
                        <span className="text-neon-cyan">{genre.count} movies</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(genre.count / analytics.total) * 100}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                <span className="neon-text-cyan">Cine</span>
                <span className="gradient-hyphen mx-1">-</span>
                <span className="neon-text-magenta">Metric</span>
              </h1>
              <p className="text-white/60">Track, discover, and analyze your movie journey</p>
            </div>
            <div className="flex gap-3">
              <motion.button
                onClick={() => fetchMovies(filterParams)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl glass text-white/70 hover:text-white hover:bg-white/10 font-medium transition-all"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                title="Refresh movies"
              >
                <RefreshCw size={20} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl glass text-white/70 hover:text-neon-cyan hover:bg-white/10 font-medium transition-all"
              >
                <Upload size={20} />
                <span className="hidden sm:inline">Import</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan font-semibold hover:bg-neon-cyan/30 transition-all neon-text-cyan"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Add Movie</span>
              </button>
            </div>
          </div>
        </motion.header>

        <TopNav />

        {importSummary && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 p-4 text-white/80"
          >
            <p className="font-semibold neon-text-cyan">Letterboxd import complete</p>
            <p className="mt-1 text-sm">
              Imported {importSummary.inserted} new movies and updated {importSummary.updated || 0} existing movies from {importSummary.totalCandidates} matched Letterboxd entries.
            </p>
            <p className="mt-1 text-xs text-white/60">
              Skipped {importSummary.skippedUnrated} unrated, {importSummary.skippedDuplicates} already up-to-date duplicates, and {importSummary.skippedInvalid} invalid rows.
            </p>
          </motion.div>
        )}

        <Stats analytics={analytics} type="movie" />

        <motion.div className="mb-8 p-1 glass rounded-xl">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('movies')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'movies'
                  ? 'bg-neon-cyan/20 text-neon-cyan neon-border-cyan'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'timeline'
                  ? 'bg-neon-cyan/20 text-neon-cyan neon-border-cyan'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'recommendations'
                  ? 'bg-neon-cyan/20 text-neon-cyan neon-border-cyan'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Recommendations
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <AddMovieModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <EditMovieModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} movie={editingMovie} />
      <ImportLetterboxdModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImported={handleImportComplete}
      />
    </div>
  );
}

export default function MoviesPage() {
  return (
    <MovieProvider>
      <MoviesPageContent />
    </MovieProvider>
  );
}
