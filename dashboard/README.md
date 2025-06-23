# CodePush Dashboard

Web interface và Desktop application cho việc quản lý CodePush apps, deployments và releases với giao diện trực quan.

## 🚀 Công nghệ sử dụng

- **React** với TypeScript
- **Vite** - Build tool nhanh
- **React Query (TanStack Query)** - Data fetching và caching
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization
- **Electron** - Desktop application
- **Firebase Hosting** - Web deployment

## 🎯 Tính năng chính

### 1. App Management
- Xem danh sách tất cả apps
- Tạo app mới với UI trực quan
- Xem chi tiết app và deployments
- Quản lý collaborators

### 2. Deployment Management
- Xem danh sách deployments với metrics
- Tạo deployment mới
- Xem deployment keys
- Monitor deployment statistics

### 3. Release Management
- Upload releases qua web interface
- Xem release history
- Rollback releases
- Promote releases giữa environments
- Bulk update descriptions

### 4. QR Code Integration
- Tạo QR codes cho quick deployment
- Quản lý QR code campaigns
- Track QR code usage

### 5. Analytics & Metrics
- Real-time deployment metrics
- Installation statistics
- Rollback monitoring
- User adoption tracking

### 6. Desktop App (Electron)
- Native desktop experience
- System tray integration
- Auto-update support
- Offline capability

## 📦 Cài đặt

### Prerequisites
- Node.js >= 16.x
- npm hoặc yarn
- CodePush API Server đang chạy

### Installation
```bash
# Clone repository
git clone <repository-url>
cd dashboard

# Install dependencies
npm install
```

## 🔧 Cấu hình

### Environment Variables

Tạo file `.env.development` cho development:

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_QRCODE_API_URL=http://localhost:3001

# App Configuration
VITE_APP_NAME=CodePush Dashboard
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_QRCODE=true
VITE_ENABLE_ANALYTICS=true

# Firebase (optional)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
```

Tạo file `.env.production` cho production với các giá trị tương ứng.

## 🚀 Chạy ứng dụng

### Development Mode
```bash
# Web development server
npm run dev

# Electron development
npm run electron:dev
```

### Production Build

#### Web Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Firebase
npm run deploy
```

#### Desktop Build
```bash
# Build Electron app for current platform
npm run electron:build

# Build for specific platforms
npm run electron:build:mac
npm run electron:build:win
npm run electron:build:linux
```

## 📚 Sử dụng

### 1. Đăng nhập
- Truy cập dashboard tại `http://localhost:5173`
- Đăng nhập với access token từ CLI hoặc GitHub/Microsoft OAuth

### 2. Quản lý Apps
- Click "Create App" để tạo app mới
- Nhập tên app, chọn OS và platform
- App sẽ được tạo với Staging và Production deployments

### 3. Upload Release
- Vào app details
- Chọn deployment (Staging/Production)
- Click "Create Release"
- Upload bundle file hoặc drag & drop
- Điền thông tin release và submit

### 4. Monitor Deployments
- Xem real-time metrics trên dashboard
- Track active installs, pending updates
- Monitor rollback statistics

### 5. QR Code Management
- Vào QR Code section
- Tạo QR code cho specific deployment
- Download hoặc share QR code
- Track scans và installations

## 🏗️ Project Structure

```
dashboard/
├── src/
│   ├── components/         # Reusable components
│   │   ├── app/           # App-related components
│   │   ├── deployment/    # Deployment components
│   │   ├── layout/        # Layout components
│   │   ├── qrcode/        # QR code components
│   │   └── ui/            # UI components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── hooks/             # Custom React hooks
│   ├── context/           # React contexts
│   ├── utils/             # Utility functions
│   └── styles/            # Global styles
├── electron/              # Electron main process
├── public/                # Static assets
├── build-resources/       # Electron build resources
└── vite.config.ts         # Vite configuration
```

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Adaptive layouts cho tất cả screen sizes
- Touch-friendly interfaces

### Dark Mode
- Automatic theme detection
- Manual theme toggle
- Persistent theme preference

### Performance Optimizations
- Lazy loading components
- Image optimization
- Code splitting
- Service worker caching

### Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- High contrast mode

## 🔒 Security

1. **Authentication**: JWT-based với refresh tokens
2. **Authorization**: Role-based access control
3. **Data Encryption**: HTTPS everywhere
4. **Input Validation**: Client và server-side validation
5. **XSS Protection**: Content Security Policy

## 🐛 Troubleshooting

### Build Issues
```bash
# Clear cache và rebuild
rm -rf node_modules dist
npm install
npm run build
```

### API Connection Issues
- Kiểm tra API server đang chạy
- Verify VITE_API_URL trong .env
- Check CORS configuration

### Electron Issues
```bash
# Reset Electron cache
npm run electron:clean
npm run electron:rebuild
```

## 📱 Desktop App Features

### Auto-Update
- Automatic update checks
- Background downloads
- User notifications

### System Integration
- System tray support
- Native notifications
- File drag & drop
- Deep linking

### Offline Support
- Cached data access
- Queue offline actions
- Sync when online

## 🚢 Deployment

### Web Deployment (Firebase)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init

# Deploy
npm run deploy
```

### Desktop Distribution
- **macOS**: DMG file với code signing
- **Windows**: NSIS installer với auto-update
- **Linux**: AppImage, deb, rpm packages

## 📄 License

MIT License - xem [LICENSE.txt](../LICENSE.txt) 