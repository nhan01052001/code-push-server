import React, { Suspense } from 'react';

// Lazy loading component wrapper
interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyLoadComponent: React.FC<LazyComponentProps> = ({ 
  children, 
  fallback = <div className="loading">Đang tải...</div> 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Utility function to create lazy components
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = React.lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => (
    <LazyLoadComponent fallback={fallback}>
      <LazyComponent {...props} />
    </LazyLoadComponent>
  );
} 