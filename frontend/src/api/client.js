import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const client = axios.create({ baseURL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('nt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    // Session expired or invalid — clear it so the UI can redirect to login.
    if (err.response?.status === 401) {
      localStorage.removeItem('nt_token');
      localStorage.removeItem('nt_user');
    }
    return Promise.reject(err);
  }
);

export const getErrorMessage = (err) =>
  err.response?.data?.message || err.message || 'Something went wrong. Please try again.';

export default client;
