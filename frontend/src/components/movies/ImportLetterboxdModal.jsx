import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import { useMovies } from '../../utils/MovieContext';

export default function ImportLetterboxdModal({ isOpen, onClose, onImported }) {
  const { importMovies } = useMovies();
  const [watchedFile, setWatchedFile] = useState(null);
  const [ratingsFile, setRatingsFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragTarget, setDragTarget] = useState(null);
  const [error, setError] = useState('');
  const watchedInputRef = useRef(null);
  const ratingsInputRef = useRef(null);

  if (!isOpen) return null;

  const getInputRef = (fileType) => (fileType === 'watched' ? watchedInputRef : ratingsInputRef);

  const resetState = () => {
    setWatchedFile(null);
    setRatingsFile(null);
    setIsSubmitting(false);
    setDragTarget(null);
    setError('');

    if (watchedInputRef.current) {
      watchedInputRef.current.value = '';
    }

    if (ratingsInputRef.current) {
      ratingsInputRef.current.value = '';
    }
  };

  const setSelectedFile = (fileType, file) => {
    if (fileType === 'watched') {
      setWatchedFile(file);
    } else {
      setRatingsFile(file);
    }

    setDragTarget(null);
    setError('');
  };

  const clearSelectedFile = (fileType) => {
    if (fileType === 'watched') {
      setWatchedFile(null);
    } else {
      setRatingsFile(null);
    }

    const inputRef = getInputRef(fileType);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    resetState();
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!watchedFile && !ratingsFile) {
      setError('Select Letterboxd watched.csv, ratings.csv, or both.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const files = {};

      if (watchedFile) {
        files.watchedCsv = await watchedFile.text();
      }

      if (ratingsFile) {
        files.ratingsCsv = await ratingsFile.text();
      }

      const summary = await importMovies(files);
      resetState();
      onImported(summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openFilePicker = (fileType) => {
    if (!isSubmitting) {
      getInputRef(fileType).current?.click();
    }
  };

  const handleFileInputChange = (fileType, event) => {
    const file = event.target.files?.[0] || null;

    if (file) {
      setSelectedFile(fileType, file);
    }
  };

  const handleDragOver = (event, fileType) => {
    event.preventDefault();

    if (!isSubmitting) {
      setDragTarget(fileType);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();

    const nextTarget = event.relatedTarget;

    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
      setDragTarget(null);
    }
  };

  const handleDrop = (event, fileType) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const file = event.dataTransfer?.files?.[0] || null;

    if (file) {
      setSelectedFile(fileType, file);
      return;
    }

    setDragTarget(null);
  };

  const renderFilePicker = (fileType, label, description, file) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <label className="block text-sm font-medium text-white/80">{label}</label>
        {file && (
          <button
            type="button"
            onClick={() => clearSelectedFile(fileType)}
            disabled={isSubmitting}
            className="text-xs text-white/50 hover:text-white transition-colors disabled:opacity-50"
          >
            Clear
          </button>
        )}
      </div>
      <input
        ref={getInputRef(fileType)}
        type="file"
        accept=".csv,text/csv"
        onChange={(event) => handleFileInputChange(fileType, event)}
        className="hidden"
      />
      <div
        role="button"
        tabIndex={0}
        onClick={() => openFilePicker(fileType)}
        onKeyDown={(event) => {
          if ((event.key === 'Enter' || event.key === ' ') && !isSubmitting) {
            event.preventDefault();
            openFilePicker(fileType);
          }
        }}
        onDragEnter={(event) => handleDragOver(event, fileType)}
        onDragOver={(event) => handleDragOver(event, fileType)}
        onDragLeave={handleDragLeave}
        onDrop={(event) => handleDrop(event, fileType)}
        className={`flex min-h-[220px] items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center transition-all ${
          dragTarget === fileType
            ? 'border-neon-cyan bg-neon-cyan/15 neon-border-cyan'
            : 'border-white/15 bg-white/5 hover:border-neon-cyan/40 hover:bg-white/10'
        } ${isSubmitting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        aria-label={`Select Letterboxd ${label} file`}
      >
        <div className="pointer-events-none flex flex-col items-center gap-4">
          <div className={`rounded-full border p-4 ${dragTarget === fileType ? 'border-neon-cyan/60 bg-neon-cyan/20' : 'border-white/10 bg-white/5'}`}>
            <Upload size={36} className={dragTarget === fileType ? 'text-neon-cyan' : 'text-white/70'} />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-white">
              {file ? file.name : `Drop ${label} here`}
            </p>
            <p className="text-sm text-white/60">
              {file
                ? `${(file.size / 1024).toFixed(1)} KB selected`
                : description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => openFilePicker(fileType)}
          disabled={isSubmitting}
          className="px-5 py-3 rounded-lg glass text-white/80 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Select {label}
        </button>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass rounded-2xl p-6 w-full max-w-4xl neon-border-cyan"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold neon-text-cyan">Import Letterboxd CSVs</h2>
            <p className="text-sm text-white/60 mt-1">Import watched dates, ratings, or both from Letterboxd.</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-white/70 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 space-y-2">
            <p>Upload either <code>watched.csv</code> or <code>ratings.csv</code>, or both together in one import.</p>
            <p>When both files are present, cine-metric merges them into the same movie entries when it can match them.</p>
            <p>Watched-only imports can create unrated movies and will not overwrite an existing rating on a matched movie.</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {renderFilePicker('watched', 'watched.csv', 'Diary dates only. Great for backfilling what you watched.', watchedFile)}
            {renderFilePicker('ratings', 'ratings.csv', 'Ratings, release year, and Letterboxd export date when available.', ratingsFile)}
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-5 py-3 rounded-lg glass text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan font-semibold hover:bg-neon-cyan/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed neon-text-cyan"
            >
              <Upload size={18} />
              <span>{isSubmitting ? 'Importing...' : 'Import Movies'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
