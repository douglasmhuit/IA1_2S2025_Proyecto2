import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.5:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const systemAPI = {
  // Estado del sistema
  getStatus: () => api.get('/status').then((res) => res.data),
  
  // Configuración
  getConfig: () => api.get('/config').then((res) => res.data),
  updateConfig: (config: any) => api.post('/config', config).then((res) => res.data),
  
  // Control
  start: () => api.post('/control/start').then((res) => res.data),
  pause: () => api.post('/control/pause').then((res) => res.data),
  stop: () => api.post('/control/stop').then((res) => res.data),
  
  // Métricas (necesitarás crear este endpoint)
  getMetrics: () => api.get('/metrics').then((res) => res.data),
  
  // Logs (necesitarás crear este endpoint)
  getLogs: () => api.get('/logs').then((res) => res.data),
};

export default api;