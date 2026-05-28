import { useState, useEffect, createContext, useContext } from 'react';
import { tvApi } from '../api/tvApi';

export const TVSeriesContext = createContext();

export const TVSeriesProvider = ({ children }) => {
  const [series, setSeries] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSeries = async (params = {}) => {
    try {
      setLoading(true);

      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined)
      );

      const data = await tvApi.getSeries(cleanParams);
      setSeries(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await tvApi.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch TV analytics:', err);
    }
  };

  const addSeries = async (tvSeries, defaultStatus = 'watched') => {
    try {
      await tvApi.addSeries({ ...tvSeries, status: tvSeries.status || defaultStatus });
      await fetchSeries();
      await fetchAnalytics();
    } catch (err) {
      throw err;
    }
  };

  const updateSeries = async (id, tvSeries) => {
    try {
      await tvApi.updateSeries(id, tvSeries);
      await fetchSeries();
      await fetchAnalytics();
    } catch (err) {
      throw err;
    }
  };

  const updateSeriesStatus = async (id, status) => {
    const s = series.find(x => x.id === id);
    if (!s) return;
    await updateSeries(id, { ...s, status });
  };

  const deleteSeries = async (id) => {
    try {
      await tvApi.deleteSeries(id);
      await fetchSeries();
      await fetchAnalytics();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchSeries();
    fetchAnalytics();
  }, []);

  return (
    <TVSeriesContext.Provider value={{
      series,
      analytics,
      loading,
      error,
      fetchSeries,
      addSeries,
      updateSeries,
      updateSeriesStatus,
      deleteSeries,
    }}>
      {children}
    </TVSeriesContext.Provider>
  );
};

export const useTVSeries = () => {
  const context = useContext(TVSeriesContext);
  if (!context) {
    throw new Error('useTVSeries must be used within a TVSeriesProvider');
  }
  return context;
};
