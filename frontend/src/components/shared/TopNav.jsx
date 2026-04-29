import { Link, useLocation } from 'react-router-dom';
import { Film, Tv } from 'lucide-react';

export default function TopNav() {
  const location = useLocation();
  const isMovies = location.pathname === '/' || location.pathname === '/movies';

  return (
    <nav className="glass rounded-xl p-2 mb-8 flex gap-2">
      <Link
        to="/movies"
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
          isMovies
            ? 'bg-neon-cyan/20 text-neon-cyan neon-border-cyan'
            : 'text-white/70 hover:text-white hover:bg-white/5'
        }`}
      >
        <Film size={18} />
        Movies
      </Link>
      <Link
        to="/tv"
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
          !isMovies
            ? 'bg-neon-magenta/20 text-neon-magenta neon-border-magenta'
            : 'text-white/70 hover:text-white hover:bg-white/5'
        }`}
      >
        <Tv size={18} />
        TV Series
      </Link>
    </nav>
  );
}
