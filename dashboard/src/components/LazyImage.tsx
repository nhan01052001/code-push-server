import React, { useState, useRef, useEffect } from 'react';
import { useIntersectionObserver } from '../utils/performance';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  width?: number | string;
  height?: number | string;
  objectFit?: React.CSSProperties['objectFit'];
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholderSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48L3N2Zz4=',
  width,
  height,
  objectFit = 'cover',
  threshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
  className,
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc);
  
  // Sử dụng Intersection Observer để kiểm tra khi nào element hiển thị trên viewport
  const imgRef = useRef<HTMLImageElement>(null);
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
  });
  
  // Gán ref từ useIntersectionObserver vào imgRef
  useEffect(() => {
    if (imgRef.current) {
      // @ts-ignore - Type inconsistency between useRef and useIntersectionObserver
      ref.current = imgRef.current;
    }
  }, [ref]);
  
  // Load hình ảnh khi element hiển thị trên viewport
  useEffect(() => {
    if (isIntersecting && !isLoaded) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setCurrentSrc(src);
        setIsLoaded(true);
        onLoad?.();
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${src}`);
        onError?.();
      };
    }
  }, [isIntersecting, src, isLoaded, onLoad, onError]);
  
  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={`lazy-image ${isLoaded ? 'loaded' : 'loading'} ${className || ''}`}
      style={{
        objectFit,
        transition: 'opacity 0.3s ease-in-out',
        opacity: isLoaded ? 1 : 0.5,
      }}
      loading="lazy" // Native lazy loading support for browsers that support it
      {...rest}
    />
  );
};

export default LazyImage; 