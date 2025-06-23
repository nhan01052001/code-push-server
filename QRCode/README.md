# QRCode Management System

Hệ thống quản lý QRCode sử dụng NestJS 11.x và SQL Server.

## Cài đặt

```bash
# Cài đặt dependencies
$ npm install

# Chạy ứng dụng ở chế độ development
$ npm run start:dev

# Chạy ứng dụng ở chế độ production
$ npm run start:prod
```

## Cấu trúc project

```
QRCode/
├── src/
│   ├── entity/                # Chứa các entity
│   │   ├── customer.entity.ts
│   │   ├── device.entity.ts
│   │   ├── log.entity.ts  
│   │   ├── user.entity.ts
│   │   └── upload-file.entity.ts
│   ├── module/                # Chứa các module
│   │   ├── auth/
│   │   ├── customer/
│   │   ├── device/ 
│   │   ├── log/
│   │   └── upload/
│   ├── controller/            # Chứa các controller
│   ├── service/               # Chứa các service
│   ├── middleware/            # Chứa các middleware
│   ├── repository/            # Chứa các repository
│   ├── constant/              # Chứa các hằng số
│   ├── util/                  # Chứa các tiện ích
│   ├── migrations/            # Chứa các migration
│   ├── app.module.ts          # Module chính của ứng dụng
│   ├── orm.config.ts          # Cấu hình kết nối TypeORM
│   └── main.ts                # Entry point của ứng dụng
├── .env                       # Biến môi trường
├── package.json               # Dependencies và scripts
└── tsconfig.json              # Cấu hình TypeScript
```

## Công nghệ sử dụng

- **NestJS** - Framework NodeJS hiện đại (phiên bản 11.x)
- **TypeORM** - ORM cho TypeScript và JavaScript (phiên bản 0.3.22)
- **SQL Server** - Hệ quản trị cơ sở dữ liệu (mssql 11.0.1)
- **TypeScript** - Ngôn ngữ lập trình chính (phiên bản 5.8.3)
- **JWT** - JSON Web Token cho xác thực (phiên bản 11.0.0)
- **Passport** - Chiến lược xác thực (phiên bản 11.0.5)
- **Multer** - Xử lý tải lên tệp (phiên bản 1.4.5-lts.2)

## Các thư viện chính

```json
"dependencies": {
  "@nestjs/common": "11.0.20",
  "@nestjs/config": "4.0.2",
  "@nestjs/core": "11.0.20",
  "@nestjs/jwt": "11.0.0",
  "@nestjs/passport": "11.0.5",
  "@nestjs/platform-express": "11.0.20",
  "@nestjs/typeorm": "11.0.0",
  "bcryptjs": "3.0.2",
  "class-validator": "0.14.1",
  "mssql": "11.0.1",
  "typeorm": "0.3.22"
}
```

## Các module chính

1. **Auth** - Xác thực và phân quyền
2. **Customer** - Quản lý thông tin khách hàng
3. **Device** - Quản lý thiết bị
4. **Log** - Quản lý log
5. **Upload** - Quản lý upload file

## Cấu hình database

Ứng dụng sử dụng SQL Server làm cơ sở dữ liệu. Bạn cần cấu hình thông tin kết nối trong file `.env`:

```
DB_TYPE=mssql
DB_HOST=ipaddress
DB_PORT=1433
DB_USERNAME=username
DB_PASSWORD=yourpassword
DB_DATABASE=qrcode_db
``` 