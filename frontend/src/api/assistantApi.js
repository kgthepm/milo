import { IS_CLOUD } from '../utils/mode';

let assistantApi;
if (IS_CLOUD) {
  const cloud = await import('./cloud');
  assistantApi = cloud.assistantApi;
} else {
  const local = await import('./assistantApi.local');
  assistantApi = local.assistantApi;
}

export { assistantApi };
