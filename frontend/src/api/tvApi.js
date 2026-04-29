const API_BASE = '/api/tv';

export const tvApi = {
  getSeries: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined)
    );
    const queryString = new URLSearchParams(cleanParams).toString();
    const response = await fetch(`${API_BASE}${queryString ? `?${queryString}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch TV series');
    return response.json();
  },

  addSeries: async (series) => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...series, type: 'tv' }),
    });
    if (!response.ok) throw new Error('Failed to add TV series');
    return response.json();
  },

  updateSeries: async (id, series) => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...series, type: 'tv' }),
    });
    if (!response.ok) throw new Error('Failed to update TV series');
    return response.json();
  },

  deleteSeries: async (id) => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete TV series');
    return response.json();
  },

  getAnalytics: async () => {
    const response = await fetch(`${API_BASE}/analytics`);
    if (!response.ok) throw new Error('Failed to fetch TV analytics');
    return response.json();
  },
};
