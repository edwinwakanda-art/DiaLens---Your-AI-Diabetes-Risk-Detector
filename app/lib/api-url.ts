export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'https://dialens-backend-production.up.railway.app'
).replace(/\/$/, '');
