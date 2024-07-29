import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ceara-mais-cultural-api.up.railway.app',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export default api;
