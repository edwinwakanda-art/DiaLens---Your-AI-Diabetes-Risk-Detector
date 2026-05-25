import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config;
    if (status === 401 && typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const resp = await axios.post(`${api.defaults.baseURL}/health/refresh`, { refreshToken });
          const newToken = resp.data.token;
          const newRefresh = resp.data.refreshToken;
          if (newToken) {
            localStorage.setItem('token', newToken);
            if (newRefresh) localStorage.setItem('refreshToken', newRefresh);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        } catch (e) {
          // fallthrough to logout
        }
      }
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('refreshToken');
      try { window.location.href = '/login'; } catch (e) {}
    }
    return Promise.reject(error);
  }
);

export default api;
