import { useState, useCallback, useRef, useEffect } from 'react';

// Hook để debouce các events 
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Hook để throttle các functions
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  const lastCall = useRef<number>(0);
  const lastCallArgs = useRef<Parameters<T>>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      lastCallArgs.current = args;
      
      if (now - lastCall.current > delay) {
        lastCall.current = now;
        return callback(...args);
      } else {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now();
          if (lastCallArgs.current) {
            callback(...lastCallArgs.current);
          }
        }, delay - (now - lastCall.current));
      }
    },
    [callback, delay]
  );
}

// Hook để kiểm tra component có đang hiển thị trên màn hình hay không (lazy loading)
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    
    observer.observe(ref.current);
    
    return () => {
      observer.disconnect();
    };
  }, [options]);
  
  return { ref, isIntersecting };
}

// Hook để đo lường hiệu suất của component
export function useComponentPerformance(componentName: string) {
  const startTimeRef = useRef<number>(0);
  
  useEffect(() => {
    startTimeRef.current = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTimeRef.current;
      console.log(`[Performance] ${componentName} rendered in ${duration.toFixed(2)}ms`);
    };
  }, [componentName]);
} 