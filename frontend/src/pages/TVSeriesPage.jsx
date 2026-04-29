import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Tv, RefreshCw } from 'lucide-react';
import { TVSeriesProvider, useTVSeries } from '../utils/TVSeriesContext';
import SeriesCard from '../components/tv/SeriesCard';
import AddTVSeriesModal from '../components/tv/AddTVSeriesModal';
import EditTVSeriesModal from '../components/tv/EditTVSeriesModal';
import SearchFilter from '../components/shared/SearchFilter';
import GenreFilter from '../components/shared/GenreFilter';
import TVRecommendations from '../components/tv/TVRecommendations';
import Stats from '../components/shared/Stats';
import TopNav from '../components/shared/TopNav';

function TVSeriesPageContent() {
  const { series, analytics, loading, error, fetchSeries } = useTVSeries();
  const [activeTab, setActiveTab] = useState('series');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSeries, setEditingSeries] = useState(null);
  const [filterParams, setFilterParams] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const handleSearch = (value) => {
    setSearchTerm(value);
    const newParams = { ...filterParams, search: value || undefined };
    setFilterParams(newParams);
    fetchSeries(newParams);
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    const newParams = { ...filterParams, genre: genre === 'All' ? undefined : genre };
    setFilterParams(newParams);
    fetchSeries(newParams);
  };

  const handleFilter = (type, value) => {
    const newParams = { ...filterParams };
    if (type === 'rating') {
      newParams.minRating = value.min || undefined;
      newParams.maxRating = value.max || undefined;
    }
    setFilterParams(newParams);
    fetchSeries(newParams);
  };

  const handleEdit = (tvSeries) => {
    setEditingSeries(tvSeries);
    setShowEditModal(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'series':
        return (
          <div className="space-y-6">
            <SearchFilter onSearch={handleSearch} onFilter={handleFilter} searchTerm={searchTerm} placeholder="Search TV series..." />
            <GenreFilter selectedGenre={selectedGenre} onGenreChange={handleGenreChange} />
            {loading ? (
              <div className="text-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-neon-magenta border-t-transparent rounded-full mx-auto"
                />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-400">
                <p>{error}</p>
              </div>
            ) : series.length === 0 ? (
              <div className="text-center py-12 text-white/50">
                <Tv size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No TV series found</p>
                <p className="text-sm">Add your first TV series to get started!</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {series.map((tvSeries, index) => (
                    <SeriesCard key={tvSeries.id} series={tvSeries} onEdit={handleEdit} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-6">
            <TVRecommendations analytics={analytics} />
            {analytics?.topGenres && analytics.topGenres.length > 1 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Genre Distribution</h3>
                <div className="space-y-3">
                  {analytics.topGenres.map((genre, index) => (
                    <div key={genre.genre} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/80">{genre.genre}</span>
                        <span className="text-neon-magenta">{genre.count} series</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(genre.count / analytics.total) * 100}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-neon-magenta to-neon-purple rounded-full"
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
                <span className="neon-text-magenta">TV Series</span>{' '}
                <span className="neon-text-cyan">Dashboard</span>
              </h1>
              <p className="text-white/60">Track, discover, and analyze your TV series journey</p>
            </div>
            <div className="flex gap-3">
              <motion.button
                onClick={() => fetchSeries(filterParams)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl glass text-white/70 hover:text-white hover:bg-white/10 font-medium transition-all"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                title="Refresh TV series"
              >
                <RefreshCw size={20} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-neon-magenta/20 border border-neon-magenta/50 text-neon-magenta font-semibold hover:bg-neon-magenta/30 transition-all neon-text-magenta"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Add TV Series</span>
              </button>
            </div>
          </div>
        </motion.header>

        <TopNav />

        <Stats analytics={analytics} type="tv" />

        <motion.div className="mb-8 p-1 glass rounded-xl">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('series')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'series'
                  ? 'bg-neon-magenta/20 text-neon-magenta neon-border-magenta'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              TV Series
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'recommendations'
                  ? 'bg-neon-magenta/20 text-neon-magenta neon-border-magenta'
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

      <AddTVSeriesModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <EditTVSeriesModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} series={editingSeries} />
    </div>
  );
}

export default function TVSeriesPage() {
  return (
    <TVSeriesProvider>
      <TVSeriesPageContent />
    </TVSeriesProvider>
  );
}
