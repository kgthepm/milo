export const DEFAULT_GENRE_COLORS = {
  Action: '#ff006e',
  Comedy: '#ffbe0b',
  Drama: '#8338ec',
  'Sci-Fi': '#00d4ff',
  Horror: '#ef4444',
  Thriller: '#f97316',
  Romance: '#ec4899',
  Animation: '#22c55e',
  Documentary: '#3b82f6',
  Fantasy: '#a855f7',
};

export const GENRE_LIST = Object.keys(DEFAULT_GENRE_COLORS);

export function getGenreColor(genre, overrides = {}) {
  if (!genre) return null;
  return overrides[genre] || DEFAULT_GENRE_COLORS[genre] || null;
}

export function getGenreGlowStyle(genre, overrides = {}) {
  const color = getGenreColor(genre, overrides);
  if (!color) return { borderColor: 'rgba(255,255,255,0.2)' };
  return {
    borderColor: color,
    boxShadow: `0 0 12px ${color}66`,
  };
}
