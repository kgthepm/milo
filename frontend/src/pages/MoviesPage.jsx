import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film } from 'lucide-react';
import { MovieProvider, useMovies } from '../utils/MovieContext';
import MovieCard from '../components/movies/MovieCard';
import AddMovieModal from '../components/movies/AddMovieModal';
import EditMovieModal from '../components/movies/EditMovieModal';
import LetterboxdImportModal from '../components/LetterboxdImportModal';
import SearchFilter from '../components/shared/SearchFilter';
import GenreFilter from '../components/shared/GenreFilter';
import Timeline from '../components/movies/Timeline';
import Recommendations from '../components/movies/Recommendations';
import Stats from '../components/shared/Stats';
import FloatingCommandBar from '../components/shared/FloatingCommandBar';

function MoviesPageContent() {
  const { movies, analytics, loading, error, fetchMovies, fetchAnalytics } = useMovies();
  const [activeTab, setActiveTab] = useState('movies');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [filterParams, setFilterParams] = useState({ sortBy: 'most_recent' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('All time');
  const [sortBy, setSortBy] = useState('most_recent');

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

  const handleDateRangeChange = (range) => {
    setSelectedDateRange(range);
    
    const dateRangeStart = (range) => {
      if (range === 'All time') return undefined;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const daysMap = {
        'Last 7 days': 7,
        'Last 30 days': 30,
        'Last 90 days': 90
      };
      
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - daysMap[range]);
      return startDate.toISOString().split('T')[0];
    };
    
    const newParams = { 
      ...filterParams, 
      startDate: dateRangeStart(range),
      sortBy 
    };
    setFilterParams(newParams);
    fetchMovies(newParams);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    const newParams = { ...filterParams, sortBy: newSortBy };
    setFilterParams(newParams);
    fetchMovies(newParams);
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setShowEditModal(true);
  };

  const handleImportSuccess = (result) => {
    fetchMovies();
    fetchAnalytics();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'movies':
        return (
          <div className="space-y-6">
            <SearchFilter 
              onSearch={handleSearch} 
              searchTerm={searchTerm} 
              placeholder="Search movies..."
              selectedDateRange={selectedDateRange}
              onDateRangeChange={handleDateRangeChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />
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
      <div className="container mx-auto px-4 py-8 pb-40 sm:pb-32 max-w-7xl">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 flex items-center flex-wrap">
              <span className="neon-text-cyan">MI</span>
              <span className="neon-text-magenta">LO</span>
              <span className="text-sm md:text-base text-white/40 font-light ml-4">Movie Intelligence & Learning Overseer</span>
            </h1>
            <p className="text-white/60">Track, discover, and analyze your movie journey</p>
          </div>
        </motion.header>

        <Stats analytics={analytics} type="movie" />

        <motion.div className="mb-6 sm:mb-8 p-1 glass rounded-xl">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('movies')}
              className={`flex-1 px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-all ${
                activeTab === 'movies'
                  ? 'bg-neon-cyan/20 text-neon-cyan neon-border-cyan'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-all ${
                activeTab === 'timeline'
                  ? 'bg-neon-cyan/20 text-neon-cyan neon-border-cyan'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex-1 px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-all ${
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
      <LetterboxdImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleImportSuccess}
      />

      <FloatingCommandBar
        page="movies"
        onAdd={() => setShowAddModal(true)}
        onImport={() => setShowImportModal(true)}
        onRefresh={() => fetchMovies({ ...filterParams, sortBy })}
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
