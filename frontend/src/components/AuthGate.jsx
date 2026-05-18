import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Sparkles, LogOut } from 'lucide-react';
import { IS_CLOUD } from '../utils/mode';
import { getSupabase } from '../utils/supabase';

export default function AuthGate({ children }) {
  if (!IS_CLOUD) return children;
  return <CloudAuthGate>{children}</CloudAuthGate>;
}

function CloudAuthGate({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    let mounted = true;
    let sb;
    try { sb = getSupabase(); } catch (e) { setError(e.message); setLoading(false); return; }
    sb.auth.getSession().then(({ data }) => {
      if (mounted) { setSession(data.session); setLoading(false); }
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => { mounted = false; sub.subscription?.unsubscribe(); };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(null); setInfo(null); setSubmitting(true);
    try {
      const sb = getSupabase();
      if (mode === 'signin') {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await sb.auth.signUp({ email, password });
        if (error) throw error;
        setInfo('Check your inbox to confirm your email.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white/60">
        Loading…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md glass rounded-2xl p-8 neon-border-cyan"
        >
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="text-neon-cyan" size={28} />
            <h1 className="text-2xl font-bold neon-text-cyan">MILO Cloud</h1>
          </div>
          <p className="text-white/70 mb-6 text-sm">
            {mode === 'signin' ? 'Sign in to your movie & TV tracker.' : 'Create your account.'}
          </p>
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-white/70 text-sm flex items-center gap-2 mb-1"><Mail size={14}/> Email</span>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 text-white rounded-lg px-3 py-2 border border-white/10 focus:border-cyan-500 outline-none"
              />
            </label>
            <label className="block">
              <span className="text-white/70 text-sm flex items-center gap-2 mb-1"><Lock size={14}/> Password</span>
              <input
                type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 text-white rounded-lg px-3 py-2 border border-white/10 focus:border-cyan-500 outline-none"
              />
            </label>
            {error && <div className="text-red-400 text-sm">{error}</div>}
            {info && <div className="text-green-400 text-sm">{info}</div>}
            <button
              type="submit" disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all text-white font-semibold disabled:opacity-50"
            >
              <LogIn size={16} />
              {submitting ? '…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          </form>
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setInfo(null); }}
            className="mt-4 text-white/50 text-sm hover:text-white/80 w-full text-center"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {children}
      <button
        onClick={async () => { await getSupabase().auth.signOut(); }}
        title="Sign out"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/60 border border-white/10 hover:bg-black/80 text-white/70 text-xs"
      >
        <LogOut size={14}/> Sign out
      </button>
    </>
  );
}
