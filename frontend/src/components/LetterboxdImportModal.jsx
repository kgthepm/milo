import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileDown, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../api/movieApi';

export default function LetterboxdImportModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setIsPreviewing(true);
    setPreview(null);

    try {
      const result = await api.previewLetterboxd(selectedFile);
      setPreview(result);
    } catch (err) {
      setError('Failed to parse CSV file. Please make sure it\'s a valid Letterboxd export.');
      console.error('Preview error:', err);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!file || !preview) return;

    setIsImporting(true);
    setError(null);

    try {
      const result = await api.importLetterboxd(file);
      
      if (onImportSuccess) {
        onImportSuccess(result);
      }
      
      onClose();
    } catch (err) {
      setError('Failed to import movies. Please try again.');
      console.error('Import error:', err);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

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
        className="glass rounded-2xl p-6 w-full max-w-2xl neon-border-cyan max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neon-cyan/20 rounded-lg">
              <Upload size={24} className="text-neon-cyan" />
            </div>
            <h2 className="text-2xl font-bold neon-text-cyan">Import from Letterboxd</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {!file ? (
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-neon-cyan/50 transition-colors">
              <input
                type="file"
                id="letterboxd-file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="letterboxd-file"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <FileDown size={48} className="text-neon-cyan" />
                <div>
                  <p className="text-white font-semibold text-lg">
                    Click to select CSV file
                  </p>
                  <p className="text-white/50 text-sm mt-1">
                    Select your Letterboxd ratings.csv file
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileDown size={20} className="text-neon-cyan" />
                  <span className="text-white font-medium">{file.name}</span>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setError(null);
                  }}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={20} />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {isPreviewing && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-neon-cyan" size={32} />
              <span className="ml-3 text-white/70">Parsing CSV file...</span>
            </div>
          )}

          {preview && !isPreviewing && (
            <div className="space-y-4">
              <div className="glass rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Total movies in CSV</span>
                  <span className="text-white font-semibold">{preview.totalInCSV}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-400">Movies to import</span>
                  <span className="text-green-400 font-semibold">{preview.toImport}</span>
                </div>
                {preview.skippedNoRating > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400">Skipped (no rating)</span>
                    <span className="text-yellow-400 font-semibold">{preview.skippedNoRating}</span>
                  </div>
                )}
                {preview.duplicates > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400">Skipped (duplicates)</span>
                    <span className="text-blue-400 font-semibold">{preview.duplicates}</span>
                  </div>
                )}
              </div>

              {preview.preview.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">Preview (first {preview.preview.length} movies)</h3>
                  <div className="glass rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="text-left p-3 text-white/70 text-sm font-medium">Title</th>
                          <th className="text-right p-3 text-white/70 text-sm font-medium">Rating</th>
                          <th className="text-right p-3 text-white/70 text-sm font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.preview.map((movie, index) => (
                          <tr key={index} className="border-t border-white/10">
                            <td className="p-3 text-white">{movie.title}</td>
                            <td className="p-3 text-right text-neon-cyan font-semibold">{movie.rating}/10</td>
                            <td className="p-3 text-right text-white/70">
                              {movie.date_watched || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {preview.toImport === 0 && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="text-yellow-400 mt-0.5 flex-shrink-0" size={20} />
                  <p className="text-yellow-200 text-sm">
                    No movies can be imported. All movies were skipped due to missing ratings or duplicates.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleClose}
              disabled={isImporting}
              className="flex-1 px-6 py-3 rounded-lg glass text-white/70 hover:text-white hover:bg-white/10 font-medium transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!preview || preview.toImport === 0 || isImporting || isPreviewing}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan font-semibold hover:bg-neon-cyan/30 transition-all neon-text-cyan disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Check size={20} />
                  <span>Import {preview?.toImport || 0} Movies</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
