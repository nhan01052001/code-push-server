# CodePush API Server

Backend service chính của hệ thống Code Push Server, cung cấp REST API cho việc quản lý ứng dụng và phân phối cập nhật.

## 🚀 Công nghệ sử dụng

- **Node.js** (>= 16.x) với TypeScript
- **Express.js** - Web framework
- **Azure Storage** - Lưu trữ file bundles
- **Redis** - Cache và session management
- **Passport.js** - Authentication framework
- **JWT** - Token-based authentication
- **Multer** - File upload handling

## 🎯 Chức năng chính

### 1. Quản lý ứng dụng (App Management)
- Tạo, cập nhật, xóa ứng dụng
- Quản lý collaborators
- Transfer ownership

### 2. Deployment Management
- Tạo và quản lý các deployment environments
- Staging, Production environments
- Deployment keys và metrics

### 3. Release Management
- Upload và phân phối app bundles
- Rollback releases
- Phased rollout (từng phần)
- Release promotion giữa các environments

### 4. Authentication & Authorization
- Local authentication
- GitHub OAuth integration
- Access token management
- Role-based access control

### 5. Storage Integration
- Azure Blob Storage support
- Local file storage option
- CDN integration ready

## 📦 Cài đặt

### Yêu cầu
- Node.js >= 16.x
- Redis Server
- Azure Storage Account (optional)

### Cài đặt dependencies
```bash
npm install
```

### Build TypeScript
```bash
npm run build
```

## 🔧 Cấu hình

### Environment Variables

Tạo file `.env` trong thư mục `api`:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
SERVER_URL=http://localhost:3000

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Storage Configuration
STORAGE_TYPE=local # hoặc 'azure'
AZURE_STORAGE_CONNECTION_STRING=your-connection-string
LOCAL_STORAGE_PATH=./storage

# Authentication
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
SESSION_SECRET=your-session-secret

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs
```

### Storage Configuration

#### Local Storage
```env
STORAGE_TYPE=local
LOCAL_STORAGE_PATH=./storage
```

#### Azure Storage
```env
STORAGE_TYPE=azure
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_CONTAINER_NAME=codepush
```

## 🚀 Chạy ứng dụng

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Run Tests
```bash
npm test
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication
Tất cả API endpoints (trừ authentication) yêu cầu Bearer token:
```
Authorization: Bearer <your-access-token>
```

### Main Endpoints

#### Authentication
- `POST /auth/register` - Đăng ký tài khoản mới
- `POST /auth/login` - Đăng nhập
- `GET /auth/github` - GitHub OAuth login
- `POST /auth/logout` - Đăng xuất

#### Apps
- `GET /apps` - Lấy danh sách apps
- `POST /apps` - Tạo app mới
- `GET /apps/:appName` - Lấy thông tin app
- `PATCH /apps/:appName` - Cập nhật app
- `DELETE /apps/:appName` - Xóa app

#### Deployments
- `GET /apps/:appName/deployments` - Lấy danh sách deployments
- `POST /apps/:appName/deployments` - Tạo deployment mới
- `GET /apps/:appName/deployments/:deploymentName` - Lấy thông tin deployment
- `PATCH /apps/:appName/deployments/:deploymentName` - Cập nhật deployment
- `DELETE /apps/:appName/deployments/:deploymentName` - Xóa deployment

#### Releases
- `POST /apps/:appName/deployments/:deploymentName/release` - Upload release mới
- `PATCH /apps/:appName/deployments/:deploymentName/release` - Cập nhật release
- `POST /apps/:appName/deployments/:deploymentName/rollback` - Rollback release
- `POST /apps/:appName/deployments/:deploymentName/promote` - Promote release

#### Metrics
- `GET /apps/:appName/deployments/:deploymentName/metrics` - Lấy metrics
- `POST /apps/:appName/deployments/:deploymentName/metrics` - Report metrics

### Example API Calls

#### Tạo App mới
```bash
curl -X POST http://localhost:3000/apps \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MyApp",
    "os": "iOS",
    "platform": "React-Native"
  }'
```

#### Upload Release
```bash
curl -X POST http://localhost:3000/apps/MyApp/deployments/Staging/release \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "package=@bundle.zip" \
  -F "appVersion=1.0.0" \
  -F "description=Bug fixes" \
  -F "mandatory=false"
```

## 🏗️ Project Structure

```
api/
├── script/
│   ├── api.ts              # API route definitions
│   ├── server.ts           # Express server setup
│   ├── routes/             # Route handlers
│   │   ├── acquisition.ts  # Client SDK endpoints
│   │   ├── management.ts   # Management API
│   │   └── auth.ts         # Authentication routes
│   ├── storage/            # Storage implementations
│   │   ├── azure-storage.ts
│   │   └── local-storage.ts
│   └── utils/              # Utility functions
├── test/                   # Test files
├── package.json
└── tsconfig.json
```

## 🔒 Security Considerations

1. **JWT Secret**: Sử dụng secret key mạnh và unique
2. **HTTPS**: Luôn sử dụng HTTPS trong production
3. **Rate Limiting**: Implement rate limiting cho API endpoints
4. **Input Validation**: Validate tất cả user inputs
5. **File Upload**: Giới hạn file size và types

## 🐛 Troubleshooting

### Redis Connection Error
```bash
Error: Redis connection to localhost:6379 failed
```
**Solution**: Đảm bảo Redis server đang chạy

### Storage Permission Error
```bash
Error: EACCES: permission denied
```
**Solution**: Kiểm tra quyền write cho storage directory

### Port Already in Use
```bash
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Thay đổi PORT trong .env hoặc kill process đang sử dụng port

## 📄 License

MIT License - xem [LICENSE.txt](../LICENSE.txt)