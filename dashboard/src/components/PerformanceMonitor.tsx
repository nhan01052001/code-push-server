import React, { useEffect } from 'react';
import useWebVitals from '../hooks/useWebVitals';

/**
 * Component để theo dõi hiệu suất ứng dụng
 * Nó sẽ tự động theo dõi Web Vitals và resource loading
 */
export const PerformanceMonitor: React.FC = () => {
  // Sử dụng hook theo dõi Web Vitals
  useWebVitals();
  
  // Theo dõi thời gian tải tài nguyên
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window && 'PerformanceObserver' in window) {
      // Theo dõi network requests
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'resource' && entry instanceof PerformanceResourceTiming) {
              // Chỉ log resources lớn hơn 1MB hoặc tải thời gian hơn 1 giây
              const size = entry.transferSize / 1024 / 1024; // Convert to MB
              const timeToLoad = entry.duration; // in ms
              
              if (size > 1 || timeToLoad > 1000) {
                console.warn(`[Performance] Resource issue - ${entry.name}:
                  - Size: ${size.toFixed(2)}MB
                  - Load time: ${timeToLoad.toFixed(0)}ms`);
              }
            }
          });
        });
        
        observer.observe({ entryTypes: ['resource'] });
        
        return () => {
          observer.disconnect();
        };
      } catch (error) {
        console.error('PerformanceObserver error:', error);
      }
    }
  }, []);
  
  // Theo dõi long tasks (chặn main thread)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            console.warn(`[Performance] Long task detected: ${entry.duration}ms`);
          });
        });
        
        observer.observe({ entryTypes: ['longtask'] });
        
        return () => {
          observer.disconnect();
        };
      } catch (error) {
        // Long tasks API có thể không được hỗ trợ trong tất cả các trình duyệt
        console.log('Long Tasks API not supported');
      }
    }
  }, []);
  
  // Không render UI thực tế - đây là một utility component
  return null;
};

export default PerformanceMonitor; 