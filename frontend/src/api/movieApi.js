const API_BASE = '/api';

export const api = {
  async getMovies(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/movies?${queryString}`);
    if (!response.ok) throw new Error('Failed to fetch movies');
    return response.json();
  },

  async addMovie(movie) {
    const response = await fetch(`${API_BASE}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movie),
    });
    if (!response.ok) throw new Error('Failed to add movie');
    return response.json();
  },

  async updateMovie(id, movie) {
    const response = await fetch(`${API_BASE}/movies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movie),
    });
    if (!response.ok) throw new Error('Failed to update movie');
    return response.json();
  },

  async deleteMovie(id) {
    const response = await fetch(`${API_BASE}/movies/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete movie');
    return response.json();
  },

  async getAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/analytics${queryString ? `?${queryString}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
  },
};