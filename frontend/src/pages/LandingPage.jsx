import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { IS_CLOUD } from '../utils/mode';
import { getSupabase } from '../utils/supabase';
import { useEffect, useState } from 'react';
import { Film, Sparkles, Zap } from 'lucide-react';

export default function LandingPage() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (IS_CLOUD) {
      const checkSession = async () => {
        try {
          const { data: { session } } = await getSupabase().auth.getSession();
          if (session) {
            navigate('/');
          }
        } catch (e) {
          console.error('Session check failed:', e);
        }
      };
      checkSession();
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-4xl w-full text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <Sparkles className="text-neon-cyan" size={48} />
            <h1 className="text-6xl md:text-7xl font-bold">
              <span className="neon-text-cyan">MI</span>
              <span className="neon-text-magenta">LO</span>
            </h1>
          </div>
          <p className="text-2xl md:text-3xl text-white/80 mb-2 font-light">
            Movie Intelligence & Learning Overseer
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass rounded-3xl p-8 md:p-12 mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Film className="text-neon-magenta" size={32} />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Track Your Entertainment Journey
            </h2>
          </div>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover, organize, and analyze your movie and TV series collection with AI-powered recommendations and beautiful visualizations.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="glass rounded-xl p-6 border border-white/5"
            >
              <Film className="text-neon-cyan mx-auto mb-3" size={32} />
              <h3 className="text-lg font-semibold text-white mb-2">Track Movies & TV</h3>
              <p className="text-white/60 text-sm">Log everything you watch with ratings, genres, and personal notes</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="glass rounded-xl p-6 border border-white/5"
            >
              <Zap className="text-neon-magenta mx-auto mb-3" size={32} />
              <h3 className="text-lg font-semibold text-white mb-2">AI Recommendations</h3>
              <p className="text-white/60 text-sm">Get personalized suggestions based on your viewing history</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="glass rounded-xl p-6 border border-white/5"
            >
              <Sparkles className="text-neon-purple mx-auto mb-3" size={32} />
              <h3 className="text-lg font-semibold text-white mb-2">Beautiful Analytics</h3>
              <p className="text-white/60 text-sm">Visualize your habits with timelines, stats, and insights</p>
            </motion.div>
          </div>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-gradient-to-r from-cyan-500/20 to-magenta-500/20 border border-cyan-500/50 rounded-xl text-white font-semibold text-lg hover:from-cyan-500/30 hover:to-magenta-500/30 transition-all neon-border-cyan"
            onClick={() => {
              if (IS_CLOUD) {
                window.location.reload();
              } else {
                navigate('/');
              }
            }}
          >
            {IS_CLOUD ? 'Sign In to Get Started' : 'Start Tracking'}
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-white/40 text-sm"
        >
          {IS_CLOUD ? 'Secure cloud storage with Supabase authentication' : 'Local mode - your data stays on your device'}
        </motion.p>
      </motion.div>
    </div>
  );
}
