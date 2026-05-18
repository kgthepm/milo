import { IS_CLOUD } from '../utils/mode';

let tvApi;
if (IS_CLOUD) {
  const cloud = await import('./cloud');
  tvApi = cloud.tvApi;
} else {
  const local = await import('./tvApi.local');
  tvApi = local.tvApi;
}

export { tvApi };
