import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export const genres = ['All', 'Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Thriller', 'Romance', 'Animation', 'Documentary', 'Fantasy'];

export const ratingOptions = ['All Rated', '8+', '7+', '6+'];

export const dateRangeOptions = ['All time', 'Last 7 days', 'Last 30 days', 'Last 90 days'];

export const sortOptions = [
  { value: 'most_recent', label: 'Most Recent' },
  { value: 'highest_rated', label: 'Highest Rated' },
  { value: 'lowest_rated', label: 'Lowest Rated' },
  { value: 'title_asc', label: 'Title (A-Z)' },
  { value: 'title_desc', label: 'Title (Z-A)' }
];

const getDateRangeStart = (range) => {
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

function RatingFilterButtons({ selectedRating, onRatingChange }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {ratingOptions.map((option) => (
          <button
            key={option}
            onClick={() => onRatingChange(option)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
              selectedRating === option
                ? 'bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan neon-text-cyan'
                : 'glass text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function DateFilterButtons({ selectedDateRange, onDateRangeChange }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {dateRangeOptions.map((option) => (
          <button
            key={option}
            onClick={() => onDateRangeChange(option)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
              selectedDateRange === option
                ? 'bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan neon-text-cyan'
                : 'glass text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function SortDropdown({ sortBy, onSortChange }) {
  return (
    <div className="glass rounded-xl px-4 py-2">
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="bg-transparent text-white/70 cursor-pointer focus:outline-none"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value} className="bg-gray-900">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function SearchFilter({ 
  onSearch, 
  searchTerm, 
  placeholder = 'Search movies...',
  selectedRating,
  onRatingChange,
  selectedDateRange,
  onDateRangeChange,
  sortBy,
  onSortChange
}) {
  const handleSearch = (value) => {
    onSearch(value);
  };

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
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <RatingFilterButtons selectedRating={selectedRating} onRatingChange={onRatingChange} />
        </div>
        <div className="flex-1">
          <DateFilterButtons selectedDateRange={selectedDateRange} onDateRangeChange={onDateRangeChange} />
        </div>
      </div>

      <div className="flex justify-end">
        <SortDropdown sortBy={sortBy} onSortChange={onSortChange} />
      </div>
    </div>
  );
}
