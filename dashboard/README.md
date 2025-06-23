# CodePush Web Dashboard

Dashboard quản lý CodePush là một ứng dụng web giúp quản lý các bản cập nhật ứng dụng di động sử dụng CodePush Server. Ứng dụng cung cấp giao diện trực quan thay thế cho việc sử dụng CLI.

## Tính năng chính

- **Quản lý tài khoản**
  - Xem thông tin tài khoản
  - Quản lý Access Keys

- **Quản lý ứng dụng**
  - Xem danh sách ứng dụng
  - Tạo, chỉnh sửa và xóa ứng dụng
  - Xem chi tiết ứng dụng (tên, hệ điều hành, platform)

- **Quản lý deployment**
  - Tạo và quản lý các deployment (Production, Staging, Test...)
  - Xem lịch sử các phiên bản
  - Thực hiện rollback và promote giữa các deployment

- **Quản lý cộng tác viên**
  - Thêm và xóa cộng tác viên cho ứng dụng

## Cài đặt

### Yêu cầu
- Node.js (phiên bản 18 trở lên)
- npm (phiên bản 9 trở lên)
- CodePush Server đang chạy (thư mục `/api`)

### Các bước cài đặt

1. **Cài đặt dependencies**

```bash
cd dashboard
npm install
```

2. **Cấu hình môi trường**

Tạo file `.env` trong thư mục `dashboard` với nội dung sau:

```
VITE_SERVER_URL=http://localhost:3000  # URL của CodePush Server
VITE_API_PORT=3000                     # Port của CodePush Server
VITE_GITHUB_CLIENT_ID=your_github_id   # GitHub OAuth Client ID
VITE_SECONDARY_API_URL=http://localhost:3001  # URL của Secondary API (nếu có) => URL API của QRCode
```

3. **Khởi chạy ứng dụng trong môi trường phát triển**

```bash
npm run dev
```

4. **Xây dựng ứng dụng cho môi trường production**

```bash
npm run build
```

Sau khi build, các file tĩnh sẽ được tạo trong thư mục `dist` và có thể được triển khai trên bất kỳ web server nào.

## Tích hợp với CodePush Server

Dashboard kết nối với CodePush Server thông qua RESTful API. Đảm bảo CodePush Server đang chạy trước khi sử dụng dashboard.

### Cấu hình xác thực

1. **GitHub OAuth**
   - Đảm bảo CodePush Server đã được cấu hình với GitHub OAuth
   - Sử dụng cùng Client ID và Secret với CodePush Server

2. **Microsoft OAuth (nếu sử dụng)**
   - Đảm bảo cấu hình đúng các tham số cho Microsoft OAuth trong CodePush Server

## Cấu trúc mã nguồn

- `/src/components`: Các component UI tái sử dụng
- `/src/pages`: Các trang chính của ứng dụng
- `/src/hooks`: Custom hooks
- `/src/services`: Các service gọi API
- `/src/context`: Context API cho quản lý state
- `/src/utils`: Các tiện ích và helper functions
- `/src/features`: Các tính năng của ứng dụng được phân chia theo module
- `/src/layouts`: Các layout khác nhau của ứng dụng
- `/src/config`: Các file cấu hình và hằng số

## Quy trình phát triển

1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit các thay đổi (`git commit -m 'Add some amazing feature'`)
4. Push lên branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request 