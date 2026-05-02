import { useState, useEffect, createContext, useContext } from 'react';
import { api } from '../api/movieApi';

export const MovieContext = createContext();

export const MovieProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovies = async (params = {}) => {
    try {
      setLoading(true);

      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined)
      );

      const data = await api.getMovies({ ...cleanParams, type: 'movie' });
      setMovies(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await api.getAnalytics({ type: 'movie' });
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const addMovie = async (movie) => {
    try {
      await api.addMovie(movie);
      await fetchMovies();
      await fetchAnalytics();
    } catch (err) {
      throw err;
    }
  };

  const updateMovie = async (id, movie) => {
    try {
      await api.updateMovie(id, movie);
      await fetchMovies();
      await fetchAnalytics();
    } catch (err) {
      throw err;
    }
  };

  const deleteMovie = async (id) => {
    try {
      await api.deleteMovie(id);
      await fetchMovies();
      await fetchAnalytics();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchMovies();
    fetchAnalytics();
  }, []);

  return (
    <MovieContext.Provider value={{
      movies,
      analytics,
      loading,
      error,
      fetchMovies,
      addMovie,
      updateMovie,
      deleteMovie,
    }}>
      {children}
    </MovieContext.Provider>
  );
};

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
};