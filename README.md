# Code Push Server

Hệ thống quản lý và phân phối cập nhật ứng dụng di động theo mô hình OTA (Over-The-Air) cho React Native và các framework khác.

## 📋 Tổng quan

Code Push Server là một giải pháp self-hosted thay thế cho Microsoft CodePush, cho phép các nhà phát triển triển khai cập nhật ứng dụng di động mà không cần phải qua App Store hoặc Google Play.

## 🏗️ Kiến trúc hệ thống

```
code-push-server/
├── api/          # Backend API Server
├── cli/          # Command Line Interface Tool
├── dashboard/    # Web Dashboard & Desktop App
└── QRCode/       # QR Code Management Service
```

## 🚀 Công nghệ sử dụng

### Backend (API)
- **Node.js** với TypeScript
- **Express.js** - Web framework
- **Azure Storage** - Lưu trữ file
- **Redis** - Cache và session management
- **Passport.js** - Authentication

### CLI Tool
- **Node.js** với TypeScript
- **Commander.js** - CLI framework
- **React Native CLI** integration

### Dashboard
- **React** với TypeScript
- **Vite** - Build tool
- **React Query** - Data fetching
- **Tailwind CSS** - Styling
- **Electron** - Desktop app

### QRCode Service
- **NestJS** - Node.js framework
- **TypeORM** - Database ORM
- **Canvas** - QR code generation
- **JWT** - Authentication

## 🎯 Tính năng chính

1. **Quản lý ứng dụng**
   - Tạo và quản lý nhiều ứng dụng
   - Quản lý deployment environments (Production, Staging, Development)
   - Access key management

2. **Phân phối cập nhật**
   - Upload và phân phối bundle updates
   - Rollback functionality
   - Phased rollout support

3. **QR Code Management**
   - Tạo QR code cho quick deployment
   - Tracking và analytics
   - Custom branding

4. **Dashboard**
   - Web interface cho quản lý
   - Desktop app với Electron
   - Real-time statistics

## 📦 Cài đặt và Chạy

### Yêu cầu hệ thống
- Node.js >= 16.x
- Redis Server
- Azure Storage Account (hoặc local storage)

### Cài đặt

1. Clone repository:
```bash
git clone https://github.com/your-repo/code-push-server.git
cd code-push-server
```

2. Cài đặt dependencies cho từng service:
```bash
# API Server
cd api && npm install

# CLI Tool
cd ../cli && npm install

# Dashboard
cd ../dashboard && npm install

# QRCode Service
cd ../QRCode && npm install
```

### Chạy các service

#### 1. API Server
```bash
cd api
npm run start
# Development mode
npm run dev
```

#### 2. Dashboard
```bash
cd dashboard
npm run dev
# Build production
npm run build
```

#### 3. QRCode Service
```bash
cd QRCode
npm run start:dev
# Production
npm run start:prod
```

#### 4. CLI Tool
```bash
cd cli
npm run build
npm link
# Sử dụng
code-push --help
```

## 🔧 Cấu hình

### Environment Variables

Tạo file `.env` trong mỗi thư mục service:

#### API Server (.env)
```env
NODE_ENV=development
PORT=3000
REDIS_URL=redis://localhost:6379
AZURE_STORAGE_CONNECTION_STRING=your-connection-string
JWT_SECRET=your-secret-key
```

#### Dashboard (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_QRCODE_API_URL=http://localhost:3001
```

#### QRCode Service (.env)
```env
PORT=3001
DATABASE_URL=your-database-url
JWT_SECRET=your-secret-key
```

## 📚 Documentation

- [API Documentation](./api/README.md)
- [CLI Documentation](./cli/README.md)
- [Dashboard Documentation](./dashboard/README.md)
- [QRCode Service Documentation](./QRCode/README.md)

## 🤝 Contributing

Xem [CONTRIBUTING.md](./CONTRIBUTING.md) để biết hướng dẫn đóng góp.

## 📄 License

Project này được phân phối dưới giấy phép [MIT License](./LICENSE.txt).

## 🔒 Security

Để báo cáo vấn đề bảo mật, vui lòng xem [SECURITY.md](./SECURITY.md).

## 📞 Support

- Issues: [GitHub Issues](https://github.com/your-repo/code-push-server/issues)
- Email: support@example.com
