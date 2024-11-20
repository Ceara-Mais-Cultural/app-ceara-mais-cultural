import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ceara-mais-cultural-api.up.railway.app',
  // baseURL: 'http://192.168.0.10:8000',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

const setAuthToken = (token: string) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Token ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
export { setAuthToken };
