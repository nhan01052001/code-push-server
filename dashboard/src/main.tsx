import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Theme } from '@radix-ui/themes';
import { ThemeProvider } from 'next-themes';
import { SkeletonTheme } from 'react-loading-skeleton';
import App from './App';

import '@radix-ui/themes/styles.css';
import './styles/global.css';
import 'react-loading-skeleton/dist/skeleton.css';

// Hàm kiểm tra chế độ tối
const isDarkMode = () => {
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const htmlElement = document.documentElement;
  
  return darkModeMediaQuery.matches || 
    document.body.classList.contains('dark-theme') || 
    htmlElement.classList.contains('dark-theme') ||
    htmlElement.getAttribute('data-theme') === 'dark';
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Theme accentColor="blue" grayColor="slate" radius="medium" scaling="100%" appearance="inherit">
          <SkeletonTheme 
            baseColor={isDarkMode() ? '#333' : '#eee'} 
            highlightColor={isDarkMode() ? '#444' : '#f5f5f5'}
          >
            <Router>
              <App />
            </Router>
          </SkeletonTheme>
        </Theme>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);