import { genres } from './SearchFilter';

export default function GenreFilter({ selectedGenre, onGenreChange }) {
  return (
    <div className="glass rounded-xl p-3 mb-4">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => onGenreChange(genre)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
              selectedGenre === genre
                ? 'bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan neon-text-cyan'
                : 'glass text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
}
