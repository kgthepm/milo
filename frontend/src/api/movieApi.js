const API_BASE = '/api';

async function parseApiResponse(response, fallbackMessage) {
  const responseText = await response.text();

  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { error: responseText };
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || fallbackMessage);
  }

  return data;
}

export const api = {
  async getMovies(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/movies?${queryString}`);
    return parseApiResponse(response, 'Failed to fetch movies');
  },

  async addMovie(movie) {
    const response = await fetch(`${API_BASE}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movie),
    });
    return parseApiResponse(response, 'Failed to add movie');
  },

  async updateMovie(id, movie) {
    const response = await fetch(`${API_BASE}/movies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movie),
    });
    return parseApiResponse(response, 'Failed to update movie');
  },

  async deleteMovie(id) {
    const response = await fetch(`${API_BASE}/movies/${id}`, {
      method: 'DELETE',
    });
    return parseApiResponse(response, 'Failed to delete movie');
  },

  async importMovies(files) {
    const response = await fetch(`${API_BASE}/movies/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(files),
    });

    return parseApiResponse(response, 'Failed to import Letterboxd movies');
  },

  async getAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/analytics${queryString ? `?${queryString}` : ''}`);
    return parseApiResponse(response, 'Failed to fetch analytics');
  },

  async getRecommendations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/recommendations${queryString ? `?${queryString}` : ''}`);
    return parseApiResponse(response, 'Failed to fetch recommendations');
  },

  async getOllamaModels() {
    const response = await fetch(`${API_BASE}/ollama/models`);
    if (!response.ok) return { models: [] };
    return parseApiResponse(response, 'Failed to fetch Ollama models');
  },
};
