const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = process.env.VITE_DEV_SERVER_URL !== undefined;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, "../build-resources/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // nếu có preload
      nodeIntegration: false,
      contextIsolation: true,
    },
    // Thêm các tùy chọn UI cho cửa sổ
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#2f3241',
      symbolColor: '#74b1be',
      height: 30
    },
  });

  console.log("Current directory:", __dirname);
  const indexPath = path.join(__dirname, "../dist/index.html");
  console.log("Loading file from:", indexPath);

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    // Chỉ mở DevTools trong môi trường phát triển
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexPath);
  }
  
  // Bắt sự kiện lỗi
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });
  
  // Xử lý sự kiện khi người dùng cố gắng điều hướng đến một URL bên ngoài
  win.webContents.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url);
    const localFileProtocol = 'file:';
    
    // Nếu đây là một đường dẫn nội bộ và đang trong môi trường production
    if (!isDev && parsedUrl.protocol !== localFileProtocol) {
      // Ngăn chặn việc điều hướng mặc định
      event.preventDefault();
      // Tải lại ứng dụng
      win.loadFile(indexPath);
  }
  });
}

app.whenReady().then(createWindow);

// Xử lý thoát ứng dụng
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
