import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ceara-mais-cultural-api.up.railway.app',
  // baseURL: 'http://192.168.0.8:8000',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

const setAuthToken = (token: string) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export { api, setAuthToken };
