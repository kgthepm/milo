export const MILO_MODE = (import.meta.env.VITE_MILO_MODE || 'local').toLowerCase();
export const IS_CLOUD = MILO_MODE === 'cloud';
export const IS_LOCAL = !IS_CLOUD;
