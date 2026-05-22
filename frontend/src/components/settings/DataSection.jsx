import { useState } from 'react';
import { Upload, Database, LogOut, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import LetterboxdImportModal from '../LetterboxdImportModal';
import { useMovies } from '../../utils/MovieContext';
import { IS_CLOUD } from '../../utils/mode';

export default function DataSection({ session, onSignOut }) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { fetchMovies } = useMovies();

  return (
    <div className="space-y-8 max-w-2xl">
      <section>
        <h3 className="text-white font-semibold mb-2">Import</h3>
        <p className="text-white/60 text-sm mb-4">
          Bring in ratings from Letterboxd or restore from a MILO database file.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-3 p-4 rounded-lg glass border border-white/10 hover:border-neon-cyan/50 transition-all text-left"
          >
            <Upload size={22} className="text-neon-cyan shrink-0" />
            <div>
              <div className="text-white font-medium">Letterboxd CSV</div>
              <div className="text-white/50 text-xs">Import ratings.csv export</div>
            </div>
          </button>
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-3 p-4 rounded-lg glass border border-white/10 hover:border-neon-cyan/50 transition-all text-left"
          >
            <Database size={22} className="text-neon-cyan shrink-0" />
            <div>
              <div className="text-white font-medium">MILO database</div>
              <div className="text-white/50 text-xs">Import .db / .sqlite file</div>
            </div>
          </button>
        </div>
      </section>

      {IS_CLOUD && (
        <section>
          <h3 className="text-white font-semibold mb-2">Account</h3>
          {session ? (
            <div className="flex items-center justify-between p-4 rounded-lg glass border border-white/10">
              <div>
                <div className="text-white/50 text-xs">Signed in as</div>
                <div className="text-white font-medium">{session.user?.email}</div>
              </div>
              <button
                onClick={onSignOut}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white/70 hover:text-white hover:bg-white/10"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/landing"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-white hover:bg-cyan-500/30"
            >
              <LogIn size={16} /> Sign in
            </Link>
          )}
        </section>
      )}

      <LetterboxdImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={() => fetchMovies()}
      />
    </div>
  );
}
