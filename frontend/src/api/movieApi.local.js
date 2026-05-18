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
    const response = await fetch(`${API_BASE}/movies/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete movie');
    return response.json();
  },

  async getAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/analytics${queryString ? `?${queryString}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
  },

  async getRecommendations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/recommendations${queryString ? `?${queryString}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    return response.json();
  },

  async getOllamaModels() {
    const response = await fetch(`${API_BASE}/ollama/models`);
    if (!response.ok) return { models: [] };
    return response.json();
  },

  async previewLetterboxd(file) {
    const formData = new FormData();
    formData.append('csvFile', file);
    const response = await fetch(`${API_BASE}/letterboxd/preview`, { method: 'POST', body: formData });
    if (!response.ok) throw new Error('Failed to preview Letterboxd data');
    return response.json();
  },

  async importLetterboxd(file) {
    const formData = new FormData();
    formData.append('csvFile', file);
    const response = await fetch(`${API_BASE}/letterboxd/import`, { method: 'POST', body: formData });
    if (!response.ok) throw new Error('Failed to import Letterboxd data');
    return response.json();
  },
};
