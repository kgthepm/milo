import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, LogOut, LogIn } from 'lucide-react';
import SettingsModal from '../SettingsModal';
import { IS_CLOUD } from '../../utils/mode';
import { getSupabase } from '../../utils/supabase';

export default function HeaderActions() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!IS_CLOUD) return;

    let mounted = true;
    const checkSession = async () => {
      try {
        const { data: { session } } = await getSupabase().auth.getSession();
        if (mounted) setSession(session);
      } catch (e) {
        console.error('Session check failed:', e);
      }
    };

    checkSession();

    const { data: sub } = getSupabase().auth.onAuthStateChange((_event, s) => {
      if (mounted) setSession(s);
    });

    return () => {
      mounted = false;
      sub.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (IS_CLOUD) {
      await getSupabase().auth.signOut();
    }
  };

  return (
    <>
      {IS_CLOUD && (
        session ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 rounded-xl glass text-white/70 hover:text-white hover:bg-white/10 font-medium transition-all"
            title="Sign out"
          >
            <LogOut size={20} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        ) : (
          <Link
            to="/landing"
            className="flex items-center gap-2 px-6 py-3 rounded-xl glass text-neon-cyan hover:text-cyan-300 hover:bg-white/10 font-medium transition-all"
            title="Sign in"
          >
            <LogIn size={20} />
            <span className="hidden sm:inline">Sign in</span>
          </Link>
        )
      )}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 rounded-xl glass text-white/70 hover:text-white hover:bg-white/10 font-medium transition-all"
        title="AI settings (BYOK)"
      >
        <SettingsIcon size={20} />
      </button>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
