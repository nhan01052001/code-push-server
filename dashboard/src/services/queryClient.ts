import { QueryClient } from 'react-query';

// Tạo query client với cấu hình tối ưu hiệu suất
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Giữ data trong cache trong 5 phút
      cacheTime: 5 * 60 * 1000,
      
      // Coi dữ liệu là tươi trong 1 phút trước khi refetch
      staleTime: 60 * 1000,
      
      // Thử lại 3 lần nếu request thất bại
      retry: 3,
      
      // Thời gian giữa các lần thử lại (ms)
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Bật prefetch data khi người dùng hover qua link
      refetchOnWindowFocus: false,
      
      // Khong refetch khi reconnect
      refetchOnReconnect: true,
      
      // Giảm thiểu số lượng network requests không cần thiết
      refetchOnMount: false,
    },
    mutations: {
      // Thử lại mutation 2 lần nếu thất bại
      retry: 2,
    },
  },
});

// Cấu hình để theo dõi trạng thái queries và hiệu suất
if (process.env.NODE_ENV === 'development') {
  queryClient.setDefaultOptions({
    queries: {
      // Bật log cho môi trường development
      onError: error => console.error('Query error:', error),
      onSuccess: data => console.log('Query success:', data),
    },
  });
}

export default queryClient; 