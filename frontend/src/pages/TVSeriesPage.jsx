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
  const [filterParams, setFilterParams] = useState({ sortBy: 'most_recent' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('All time');
  const [sortBy, setSortBy] = useState('most_recent');

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
    fetchSeries(newParams);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    const newParams = { ...filterParams, sortBy: newSortBy };
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
            <SearchFilter 
              onSearch={handleSearch} 
              searchTerm={searchTerm} 
              placeholder="Search TV series..."
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
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  key={tvSeries.id}
                >
                  <SeriesCard series={tvSeries} onEdit={handleEdit} />
                </motion.div>
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
                          className="h-full bg-gradient-to-r from-neon-magenta via-neon-purple to-neon-magenta rounded-full"
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
              <h1 className="text-4xl md:text-5xl font-bold mb-1 flex items-center flex-wrap">
                <span className="neon-text-magenta">MI</span>
                <span className="neon-text-cyan">LO</span>
                <span className="text-sm md:text-base text-white/40 font-light ml-4">Movie Intelligence & Learning Overseer</span>
              </h1>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-neon-magenta/50 to-transparent"></div>
                <span className="text-xl md:text-2xl font-medium text-white/80 tracking-wide">TV Series</span>
                <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-neon-magenta/50 to-transparent"></div>
              </div>
              <p className="text-white/60">Track, discover, and analyze your TV series journey</p>
            </div>
            <div className="flex gap-3">
              <motion.button
                onClick={() => fetchSeries({ ...filterParams, sortBy })}
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
                  ? 'bg-gradient-to-r from-neon-magenta/20 to-neon-purple/20 text-neon-magenta neon-border-magenta'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              TV Series
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'recommendations'
                  ? 'bg-gradient-to-r from-neon-magenta/20 to-neon-purple/20 text-neon-magenta neon-border-magenta'
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
