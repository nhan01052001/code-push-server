/**
 * Khai báo các hằng số sử dụng trong ứng dụng
 */

// CSS Variables
export const LAYOUT = {
  HEADER_HEIGHT: 'var(--header-height)',
  SIDEBAR_WIDTH: 'var(--sidebar-width)',
};

// Router paths
export const ROUTES = {
  LOGIN: '/login',
  APPS: '/apps',
  APP_DETAILS: '/apps/:appName',
  DEPLOYMENT_DETAILS: '/apps/:appName/deployments/:deploymentName',
  QRCODE: '/qrcode',
  SETTINGS: '/settings',
};

// Tabs trong sidebar
export const SIDEBAR_TABS = {
  APPS: 'apps',
  QR_CODE: 'qrcode',
  SETTINGS: 'settings',
};

// LocalStorage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  THEME: 'theme',
  USER: 'user',
};

// API endpoints
export const API_ENDPOINTS = {
  ACCOUNT: '/account',
  APPS: '/apps',
  DEPLOYMENTS: '/deployments',
  COLLABORATORS: '/collaborators',
};

// Các theme hỗ trợ
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
}; 