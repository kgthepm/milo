import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import { useMovies } from '../../utils/MovieContext';

export default function ImportLetterboxdModal({ isOpen, onClose, onImported }) {
  const { importMovies } = useMovies();
  const [ratingsFile, setRatingsFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const resetState = () => {
    setRatingsFile(null);
    setIsSubmitting(false);
    setIsDragActive(false);
    setError('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const setSelectedFile = (file) => {
    setRatingsFile(file);
    setIsDragActive(false);
    setError('');
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

    if (!ratingsFile) {
      setError('Select Letterboxd ratings.csv to import rated movies.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const ratingsCsv = await ratingsFile.text();

      const summary = await importMovies({ ratingsCsv });
      resetState();
      onImported(summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openFilePicker = () => {
    if (!isSubmitting) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();

    if (!isSubmitting) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();

    const nextTarget = event.relatedTarget;

    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
      setIsDragActive(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const file = event.dataTransfer?.files?.[0] || null;

    if (file) {
      setSelectedFile(file);
      return;
    }

    setIsDragActive(false);
  };

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
        className="glass rounded-2xl p-6 w-full max-w-2xl neon-border-cyan"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold neon-text-cyan">Import Letterboxd Export</h2>
            <p className="text-sm text-white/60 mt-1">Import rated movies from Letterboxd with just <code>ratings.csv</code>.</p>
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
            <p><span className="text-white font-medium">Required:</span> <code>ratings.csv</code></p>
            <p>Imports title, rating, and release year, plus the ratings export date when available.</p>
            <p>Matching existing movies are updated from the imported Letterboxd data instead of being skipped.</p>
            <p>This streamlined import does not pull watched dates or review notes from other Letterboxd exports.</p>
            <p>Unrated Letterboxd entries are skipped because cine-metric stores ratings on a 1-10 scale.</p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium mb-2 text-white/80">ratings.csv *</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div
              role="button"
              tabIndex={0}
              onClick={openFilePicker}
              onKeyDown={(event) => {
                if ((event.key === 'Enter' || event.key === ' ') && !isSubmitting) {
                  event.preventDefault();
                  openFilePicker();
                }
              }}
              onDragEnter={handleDragOver}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mx-auto flex w-full max-w-sm aspect-square items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center transition-all ${
                isDragActive
                  ? 'border-neon-cyan bg-neon-cyan/15 neon-border-cyan'
                  : 'border-white/15 bg-white/5 hover:border-neon-cyan/40 hover:bg-white/10'
              } ${isSubmitting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              aria-label="Select Letterboxd ratings.csv file"
            >
              <div className="pointer-events-none flex flex-col items-center gap-4">
                <div className={`rounded-full border p-4 ${isDragActive ? 'border-neon-cyan/60 bg-neon-cyan/20' : 'border-white/10 bg-white/5'}`}>
                  <Upload size={36} className={isDragActive ? 'text-neon-cyan' : 'text-white/70'} />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-white">
                    {ratingsFile ? ratingsFile.name : 'Drop ratings.csv here'}
                  </p>
                  <p className="text-sm text-white/60">
                    {ratingsFile
                      ? `${(ratingsFile.size / 1024).toFixed(1)} KB selected`
                      : 'Drag and drop your Letterboxd ratings export onto this square.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={openFilePicker}
                disabled={isSubmitting}
                className="px-5 py-3 rounded-lg glass text-white/80 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select file
              </button>
            </div>
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
