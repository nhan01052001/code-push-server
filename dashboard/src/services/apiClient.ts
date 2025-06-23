import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Tạo instance axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Intercept request để thêm token nếu cần
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor để xử lý lỗi và caching
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Thêm thông tin cache vào response
    if (response.config.method?.toLowerCase() === 'get') {
      response.headers['x-cache-timestamp'] = Date.now().toString();
    }
    return response;
  },
  (error: AxiosError) => {
    // Xử lý lỗi network
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject(new Error('Lỗi kết nối. Vui lòng kiểm tra kết nối mạng.'));
    }
    
    // Xử lý lỗi 401 Unauthorized
    if (error.response.status === 401) {
      localStorage.removeItem('auth_token');
      // Có thể thêm redirect về trang login
    }
    
    return Promise.reject(error);
  }
);

// Các hàm wrapper để simplify việc sử dụng axios
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => 
    apiClient.get<T>(url, config).then(response => response.data),
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.post<T>(url, data, config).then(response => response.data),
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.put<T>(url, data, config).then(response => response.data),
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
    apiClient.delete<T>(url, config).then(response => response.data),
};

export default apiClient; 