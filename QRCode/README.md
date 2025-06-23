# QRCode Service

Microservice quản lý QR Code cho hệ thống CodePush, cho phép tạo và quản lý QR codes để deploy ứng dụng nhanh chóng.

## 🚀 Công nghệ sử dụng

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **TypeORM** - Database ORM
- **PostgreSQL/MySQL** - Database
- **Redis** - Caching và session
- **JWT** - Authentication
- **Canvas** - QR code generation
- **Jimp** - Image processing
- **Swagger** - API documentation

## 🎯 Chức năng chính

### 1. QR Code Management
- Tạo QR codes cho deployments
- Custom branding với logo
- Multiple formats (PNG, SVG, PDF)
- Batch generation

### 2. Device Management
- Track devices qua QR scan
- Device registration
- Platform detection
- Version tracking

### 3. Customer Management
- Customer profiles
- Usage analytics
- Access control
- Billing integration

### 4. Configuration Service
- Dynamic configuration
- Environment-based settings
- Feature flags
- A/B testing support

### 5. Logging & Analytics
- Scan tracking
- Installation metrics
- Error logging
- Performance monitoring

### 6. Proxy Service
- External API integration
- Language file merging
- Configuration fetching
- Cache management

## 📦 Cài đặt

### Prerequisites
- Node.js >= 16.x
- PostgreSQL hoặc MySQL
- Redis Server
- ImageMagick (optional, for advanced image processing)

### Installation
```bash
# Clone repository
git clone <repository-url>
cd QRCode

# Install dependencies
npm install
```

## 🔧 Cấu hình

### Environment Variables

Tạo file `.env` trong thư mục `QRCode`:

```env
# Application
NODE_ENV=development
PORT=3001
APP_NAME=QRCode Service

# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=qrcode_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# CodePush Integration
CODEPUSH_API_URL=http://localhost:3000
CODEPUSH_ACCESS_TOKEN=your-access-token

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# QR Code Settings
QR_CODE_BASE_URL=https://your-domain.com/qr
QR_CODE_ERROR_CORRECTION=M
QR_CODE_SIZE=300

# Logging
LOG_LEVEL=debug
LOG_FILE_PATH=./logs

# Swagger
SWAGGER_ENABLED=true
SWAGGER_PATH=api-docs
```

### Database Setup

1. Tạo database:
```sql
CREATE DATABASE qrcode_db;
```

2. Run migrations:
```bash
npm run migration:run
```

## 🚀 Chạy ứng dụng

### Development Mode
```bash
# Watch mode
npm run start:dev

# Debug mode
npm run start:debug
```

### Production Mode
```bash
# Build
npm run build

# Start
npm run start:prod
```

### Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📚 API Documentation

### Swagger UI
Khi service đang chạy, truy cập Swagger documentation tại:
```
http://localhost:3001/api-docs
```

### Main Endpoints

#### Authentication
- `POST /auth/login` - Login với credentials
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout

#### QR Code
- `POST /qrcode/generate` - Tạo QR code mới
- `GET /qrcode/:id` - Lấy thông tin QR code
- `GET /qrcode/:id/image` - Download QR code image
- `POST /qrcode/batch` - Tạo nhiều QR codes
- `DELETE /qrcode/:id` - Xóa QR code

#### Device
- `POST /device/register` - Đăng ký device mới
- `GET /device/:id` - Lấy thông tin device
- `PUT /device/:id` - Cập nhật device
- `GET /device/list` - Danh sách devices

#### Customer
- `POST /customer` - Tạo customer mới
- `GET /customer/:id` - Lấy thông tin customer
- `PUT /customer/:id` - Cập nhật customer
- `GET /customer/list` - Danh sách customers

#### Configuration
- `GET /configuration` - Lấy configuration
- `PUT /configuration` - Cập nhật configuration
- `GET /configuration/:key` - Lấy config theo key

#### Proxy
- `GET /proxy/config` - Lấy config từ external source
- `GET /proxy/lang` - Lấy và merge language files

### Example API Calls

#### Tạo QR Code
```bash
curl -X POST http://localhost:3001/qrcode/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deploymentKey": "deployment-key-here",
    "appName": "MyApp",
    "platform": "ios",
    "customLogo": "base64-logo-data",
    "size": 400
  }'
```

#### Register Device
```bash
curl -X POST http://localhost:3001/device/register \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "unique-device-id",
    "platform": "iOS",
    "version": "14.5",
    "appVersion": "1.0.0"
  }'
```

## 🏗️ Project Structure

```
QRCode/
├── src/
│   ├── controller/         # API Controllers
│   ├── service/           # Business logic
│   ├── module/            # NestJS modules
│   ├── entity/            # Database entities
│   ├── dto/               # Data transfer objects
│   ├── middleware/        # Custom middleware
│   ├── auth/              # Authentication
│   ├── constant/          # Constants
│   ├── interface/         # TypeScript interfaces
│   ├── repository/        # Data repositories
│   ├── strategy/          # Auth strategies
│   └── util/              # Utility functions
├── test/                  # Test files
├── uploads/               # File uploads
├── logs/                  # Application logs
└── orm.config.ts          # TypeORM configuration
```

## 🔒 Security

1. **JWT Authentication**: Tất cả API endpoints yêu cầu authentication
2. **Rate Limiting**: Giới hạn requests để prevent abuse
3. **Input Validation**: Validate tất cả inputs với class-validator
4. **SQL Injection Protection**: Sử dụng parameterized queries
5. **File Upload Security**: Validate file types và sizes

## 🚀 Deployment

### Docker
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "run", "start:prod"]
```

### PM2
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/main.js --name qrcode-service

# Save PM2 config
pm2 save
pm2 startup
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check database status
psql -U username -d qrcode_db -c "SELECT 1"

# Verify connection string
echo $DB_HOST $DB_PORT $DB_DATABASE
```

### Redis Connection Issues
```bash
# Check Redis status
redis-cli ping

# Clear Redis cache
redis-cli FLUSHALL
```

### File Upload Issues
- Kiểm tra quyền write cho upload directory
- Verify MAX_FILE_SIZE configuration
- Check disk space

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3001/health
```

### Metrics Endpoint
```bash
curl http://localhost:3001/metrics
```

### Logging
- Application logs: `./logs/app.log`
- Error logs: `./logs/error.log`
- Access logs: `./logs/access.log`

## 🔄 Maintenance

### Database Backup
```bash
# Backup
pg_dump -U username qrcode_db > backup.sql

# Restore
psql -U username qrcode_db < backup.sql
```

### Clear Old Data
```bash
# Clear old QR codes (older than 30 days)
npm run cleanup:qrcodes

# Clear old logs
npm run cleanup:logs
```

## 📄 License

MIT License - xem [LICENSE.txt](../LICENSE.txt) 