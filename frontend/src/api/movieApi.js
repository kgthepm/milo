import { IS_CLOUD } from '../utils/mode';

let api;
if (IS_CLOUD) {
  const cloud = await import('./cloud');
  api = cloud.movieApi;
} else {
  const local = await import('./movieApi.local');
  api = local.api;
}

export { api };
