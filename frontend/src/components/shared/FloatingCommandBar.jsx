import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, Tv, Plus, Upload, RefreshCw, Settings as SettingsIcon, LogIn, LogOut } from 'lucide-react';
import { IS_CLOUD } from '../../utils/mode';
import { getSupabase } from '../../utils/supabase';

function Divider() {
  return <div className="w-px h-8 bg-white/10 mx-1" />;
}

function IconBtn({ onClick, title, children, accent = 'white', as = 'button', to, motionProps }) {
  const accentClass =
    accent === 'cyan'
      ? 'text-neon-cyan hover:text-white hover:bg-neon-cyan/20'
      : accent === 'magenta'
      ? 'text-neon-magenta hover:text-white hover:bg-neon-magenta/20'
      : 'text-white/70 hover:text-white hover:bg-white/10';

  const base = `flex items-center justify-center w-11 h-11 rounded-xl transition-all ${accentClass}`;

  if (as === 'link') {
    return (
      <Link to={to} title={title} className={base}>
        {children}
      </Link>
    );
  }

  return (
    <motion.button onClick={onClick} title={title} className={base} {...motionProps}>
      {children}
    </motion.button>
  );
}

export default function FloatingCommandBar({ page, onAdd, onImport, onRefresh }) {
  const location = useLocation();
  const isMovies = page === 'movies';
  const accent = isMovies ? 'cyan' : 'magenta';
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!IS_CLOUD) return;
    let mounted = true;
    const check = async () => {
      try {
        const { data: { session } } = await getSupabase().auth.getSession();
        if (mounted) setSession(session);
      } catch (e) {
        console.error('Session check failed:', e);
      }
    };
    check();
    const { data: sub } = getSupabase().auth.onAuthStateChange((_e, s) => {
      if (mounted) setSession(s);
    });
    return () => {
      mounted = false;
      sub.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (IS_CLOUD) await getSupabase().auth.signOut();
  };

  const onMoviesPath = location.pathname === '/' || location.pathname === '/movies';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
    >
      <div
        className={`glass rounded-2xl px-2 py-2 flex items-center gap-1 shadow-2xl ${
          isMovies ? 'neon-border-cyan' : 'neon-border-magenta'
        }`}
      >
        {/* Page toggle */}
        <Link
          to="/movies"
          title="Movies"
          className={`flex items-center gap-2 px-3 sm:px-4 h-11 rounded-xl font-medium text-sm transition-all ${
            onMoviesPath
              ? 'bg-neon-cyan/20 text-neon-cyan neon-border-cyan'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Film size={18} />
          <span className="hidden sm:inline">Movies</span>
        </Link>
        <Link
          to="/tv"
          title="TV Series"
          className={`flex items-center gap-2 px-3 sm:px-4 h-11 rounded-xl font-medium text-sm transition-all ${
            !onMoviesPath
              ? 'bg-neon-magenta/20 text-neon-magenta neon-border-magenta'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Tv size={18} />
          <span className="hidden sm:inline">TV</span>
        </Link>

        <Divider />

        {/* Primary action: Add */}
        <motion.button
          onClick={onAdd}
          title={isMovies ? 'Add Movie' : 'Add TV Series'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 h-11 px-4 rounded-xl font-semibold text-sm transition-all pulse-glow ${
            isMovies
              ? 'bg-neon-cyan/20 border border-neon-cyan/60 text-neon-cyan neon-text-cyan hover:bg-neon-cyan/30'
              : 'bg-neon-magenta/20 border border-neon-magenta/60 text-neon-magenta neon-text-magenta hover:bg-neon-magenta/30'
          }`}
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Add</span>
        </motion.button>

        {/* Optional import */}
        {onImport && (
          <IconBtn onClick={onImport} title="Import from Letterboxd CSV or MILO .db">
            <Upload size={20} />
          </IconBtn>
        )}

        {/* Refresh */}
        {onRefresh && (
          <IconBtn
            onClick={onRefresh}
            title="Refresh"
            motionProps={{ whileHover: { rotate: 180 }, transition: { duration: 0.3 } }}
          >
            <RefreshCw size={20} />
          </IconBtn>
        )}

        <Divider />

        {/* Auth (cloud only) */}
        {IS_CLOUD && (
          session ? (
            <IconBtn onClick={handleLogout} title="Sign out">
              <LogOut size={20} />
            </IconBtn>
          ) : (
            <IconBtn as="link" to="/landing" title="Sign in" accent="cyan">
              <LogIn size={20} />
            </IconBtn>
          )
        )}

        {/* Settings */}
        <IconBtn as="link" to="/settings" title="Settings">
          <SettingsIcon size={20} />
        </IconBtn>
      </div>
    </motion.div>
  );
}
