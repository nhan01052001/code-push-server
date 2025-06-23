import { useEffect, useRef } from 'react';

type MetricName = 'CLS' | 'FID' | 'LCP' | 'FCP' | 'TTFB';

interface WebVitalsMetric {
  name: MetricName;
  value: number;
  id: string;
}

interface Metric {
  id: string;
  name: string;
  value: number;
  delta?: number;
  entries: any[];
}

// Function để gửi metrics đến analytics
const sendToAnalytics = (metric: WebVitalsMetric) => {
  // Trong thực tế, bạn sẽ gửi dữ liệu đến một service analytics
  console.log(`[Web Vitals] ${metric.name}: ${metric.value}`);
  
  // Có thể gửi đến một endpoint API nếu cần
  // fetch('/api/analytics', {
  //   method: 'POST',
  //   body: JSON.stringify(metric),
  //   headers: { 'Content-Type': 'application/json' },
  // });
};

export function useWebVitals() {
  const isInitialized = useRef(false);
  
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    
    // Chỉ tải web-vitals trong môi trường browser
    if (typeof window !== 'undefined') {
      // Sử dụng dynamic import và thêm web-vitals vào dependencies
      // Cần thêm "web-vitals": "^3.0.0" vào package.json
      try {
        import('web-vitals') .then(({ getCLS, getFID, getLCP, getFCP, getTTFB }) => {
          // Cumulative Layout Shift
          getCLS((metric: Metric) => {
            sendToAnalytics({ name: 'CLS' as MetricName, value: metric.value, id: metric.id });
          });
          
          // First Input Delay
          getFID((metric: Metric) => {
            sendToAnalytics({ name: 'FID' as MetricName, value: metric.value, id: metric.id });
          });
          
          // Largest Contentful Paint
          getLCP((metric: Metric) => {
            sendToAnalytics({ name: 'LCP' as MetricName, value: metric.value, id: metric.id });
          });
          
          // First Contentful Paint
          getFCP((metric: Metric) => {
            sendToAnalytics({ name: 'FCP' as MetricName, value: metric.value, id: metric.id });
          });
          
          // Time to First Byte
          getTTFB((metric: Metric) => {
            sendToAnalytics({ name: 'TTFB' as MetricName, value: metric.value, id: metric.id });
          });
        }).catch(err => {
          console.error('Could not load web-vitals', err);
        });
      } catch (error) {
        console.error('Error initializing web-vitals', error);
      }
    }
  }, []);
  
  return null; // Hook không trả về gì, chỉ thực thi side effects
}

export default useWebVitals; 