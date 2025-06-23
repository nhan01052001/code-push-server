// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Hiển thị thông báo khi script được tải
console.log('Preload script loaded successfully');
 
// Cung cấp API cho ứng dụng web
contextBridge.exposeInMainWorld('electron', {
  // Các API có thể thêm ở đây nếu cần
  platform: process.platform
}); 