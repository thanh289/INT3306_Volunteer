# Volunteer Hub - Nền Tảng Quản Lý Hoạt Động Tình Nguyện

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.5.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.17.1-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![DaisyUI](https://img.shields.io/badge/DaisyUI-5.3.10-5A0EF8?style=for-the-badge&logo=daisyui&logoColor=white)](https://daisyui.com/)

</div>

---

## Giới Thiệu

**Volunteer Hub** là nền tảng web được thiết kế để kết nối tình nguyện viên với các tổ chức và hoạt động tình nguyện. Hệ thống cung cấp giải pháp quản lý sự kiện, đăng ký, và tương tác một cách hiệu quả và chuyên nghiệp.

**Lớp học phần**: Phát triển ứng dụng Web - INT3306 2

**Giảng viên hướng dẫn**: Ts. Lê Đình Thanh

**Thành viên nhóm:**

1. Trần Duy Thành - 23021720
2. Dương Anh Tuấn - 23021704
3. Nguyễn Tuấn Nghĩa - 23021648

### Mục Tiêu Dự Án

- **Kết nối hiệu quả**: Tạo cầu nối giữa tình nguyện viên và các hoạt động thiện nguyện
- **Quản lý tập trung**: Cung cấp công cụ quản lý sự kiện và tình nguyện viên toàn diện
- **Trải nghiệm hiện đại**: Giao diện thân thiện, responsive và tối ưu hiệu năng
- **Tương tác cộng đồng**: Xây dựng không gian giao lưu và chia sẻ cho cộng đồng tình nguyện

### Điểm Nổi Bật

- **Hiệu năng cao** - Server-side rendering, caching thông minh, lazy loading
- **UI/UX hiện đại** - Responsive design, animations mượt mà, skeleton loading
- **Bảo mật tối ưu** - CSRF protection, rate limiting, role-based access control
- **Progressive Web App** - Web Push Notifications, offline capability
- **SEO-friendly** - Server components, metadata optimization
- **Đa vai trò** - Admin, Event Manager, Volunteer với quyền hạn phân biệt rõ ràng

---

## Tính Năng Chính

### Dashboard Thông Minh

- **Sự kiện xu hướng**: Hiển thị các sự kiện hot nhất dựa trên lượt đăng ký và tương tác
- **Bảng tin cá nhân hóa**: Feed tin tức từ sự kiện đã đăng ký theo dõi
- **Thống kê real-time**: Số liệu tham gia, hoạt động và đóng góp
- **Gợi ý thông minh**: Đề xuất sự kiện phù hợp dựa trên sở thích và lịch sử

### Event Wall - Kênh Trao Đổi Sự Kiện

Mạng xã hội mini cho từng sự kiện với đầy đủ tính năng:

- **Đăng bài**: Chia sẻ văn bản, hình ảnh, cập nhật hoạt động
- **Tương tác**: Comment, like/unlike với animation mượt mà
- **Quản lý nội dung**: Pin bài quan trọng, duyệt bài (nếu bật kiểm duyệt)
- **Upload media**: Hỗ trợ tải ảnh với validation và tối ưu dung lượng
- **Phân quyền rõ ràng**: Admin/Manager có thể kiểm duyệt và quản lý nội dung

### Quản Lý Sự Kiện

#### Cho Event Manager:

- **CRUD đầy đủ**: Tạo, chỉnh sửa, xóa (soft delete), hủy sự kiện
- **Form động**: Tùy chỉnh câu hỏi đăng ký cho từng sự kiện
- **Quản lý đội ngũ**: Thêm/xóa event managers
- **Xét duyệt đăng ký**: Phê duyệt hoặc từ chối tình nguyện viên
- **Đánh dấu hoàn thành**: Cập nhật trạng thái sau khi sự kiện kết thúc
- **Export dữ liệu**: Xuất danh sách tham gia ra CSV

#### Cho Volunteer:

- **Khám phá sự kiện**: Xem danh sách, lọc theo danh mục/thời gian/địa điểm
- **Đăng ký dễ dàng**: Form đăng ký tùy chỉnh với validation
- **Quản lý đăng ký**: Xem trạng thái, hủy đăng ký (trước khi bắt đầu)
- **Lịch sử tham gia**: Theo dõi các sự kiện đã và đang tham gia
- **Interested Events**: Lưu sự kiện yêu thích để theo dõi
- **Mời bạn bè**: Chia sẻ và mời người khác tham gia

### Hệ Thống Thông Báo

- **Web Push Notifications**: Nhận thông báo ngay cả khi không mở website
- **Thông báo in-app**: Badge hiển thị số lượng chưa đọc
- **Đa dạng loại thông báo**:
  - Đăng ký được duyệt/từ chối
  - Sự kiện được công bố
  - Bài viết được duyệt
  - Nhắc nhở sự kiện sắp diễn ra
  - Cập nhật quan trọng từ event manager
- **Quản lý thông báo**: Đánh dấu đã đọc, xóa thông báo

### Admin Panel

- **Quản lý người dùng**: Xem danh sách, khóa/mở tài khoản
- **Kiểm duyệt sự kiện**: Duyệt/từ chối sự kiện chờ phê duyệt
- **Giám sát hệ thống**: Dashboard với thống kê tổng quan
- **Export & Reporting**: Xuất dữ liệu người dùng, sự kiện, hoạt động
- **Quản lý nội dung**: Kiểm soát bài viết, comment trên toàn hệ thống

### Xác Thực & Bảo Mật

- **NextAuth.js Integration**: Quản lý session an toàn với JWT
- **Mã hóa mật khẩu**: Bcrypt với salt rounds tối ưu
- **CSRF Protection**: Bảo vệ khỏi Cross-Site Request Forgery
- **Rate Limiting**: Giới hạn request với Upstash Redis
- **Role-based Access Control**: Phân quyền chi tiết theo vai trò
- **Forgot Password**: Đặt lại mật khẩu qua email an toàn
- **Input Validation**: Zod schema validation trên cả client và server

---

## Công Nghệ Sử Dụng

### Frontend Stack

| Công Nghệ           | Phiên Bản | Mục Đích                                          |
| ------------------- | --------- | ------------------------------------------------- |
| **Next.js**         | 15.5.7    | React framework với App Router, Server Components |
| **React**           | 19.1.0    | UI library                                        |
| **TypeScript**      | 5.0+      | Type safety, improved developer experience        |
| **TailwindCSS**     | 4.0       | Utility-first CSS framework                       |
| **DaisyUI**         | 5.3.10    | Component library trên Tailwind                   |
| **Lucide React**    | 0.556.0   | Modern icon library                               |
| **React Hot Toast** | 2.6.0     | Toast notifications                               |
| **Axios**           | 1.12.2    | HTTP client với interceptors                      |
| **NextAuth.js**     | 4.24.11   | Authentication & session management               |
| **SWR**             | 2.3.6     | React Hooks for data fetching                     |

### Backend Stack

| Công Nghệ              | Phiên Bản | Mục Đích                     |
| ---------------------- | --------- | ---------------------------- |
| **Next.js API Routes** | 15.5.7    | RESTful API endpoints        |
| **Prisma ORM**         | 6.17.1    | Database ORM với type safety |
| **MongoDB**            | -         | NoSQL database               |
| **Bcrypt.js**          | 3.0.2     | Password hashing             |
| **Zod**                | 4.1.12    | Schema validation            |
| **Nodemailer**         | 7.0.11    | Email service                |
| **Web Push**           | 3.6.7     | Push notifications           |
| **Upstash Redis**      | 1.35.6    | Rate limiting & caching      |

### Công Cụ & DevOps

- **ESLint**: Code quality & linting
- **Prisma Studio**: Database GUI management
- **Git**: Version control
- **npm**: Package management
- **Turbopack**: Next.js dev & build optimization

---

## Các Design Patterns Được Sử Dụng

Dự án áp dụng nhiều design patterns hiện đại để đảm bảo code dễ bảo trì và mở rộng:

### 1. **Separation of Concerns (Tách biệt trách nhiệm)**

- Tách biệt rõ ràng giữa routing, UI components, business logic và database
- Components được tổ chức theo chức năng (features) và tái sử dụng (shared)
- Utilities và configurations được quản lý riêng biệt

### 2. **Repository Pattern**

- Sử dụng Prisma ORM như một lớp abstraction cho database
- Tất cả truy vấn database đều type-safe với TypeScript
- Centralized data access logic

### 3. **Provider Pattern**

- Context API để quản lý global state (Auth, CSRF, Service Worker)
- Wrap toàn bộ app với các providers cần thiết
- Dễ dàng truy cập shared data ở bất kỳ component nào

### 4. **Component Composition**

- **Server Components**: Xử lý data fetching phía server, tối ưu SEO
- **Client Components**: Xử lý interactivity và state management
- Tách biệt rõ ràng giữa logic và presentation

### 5. **RESTful API Structure**

- Endpoints tuân thủ chuẩn REST với HTTP methods
- Middleware chain cho authentication, authorization, validation
- Consistent error handling với HTTP status codes

### 6. **Factory Pattern**

- Tạo cache instances với TTL khác nhau cho từng use case
- Reusable factory functions cho common operations

### 7. **Observer Pattern**

- Service Worker lắng nghe push notifications
- Event listeners cho real-time updates

### 8. **Middleware Pattern**

- Next.js middleware cho authentication check toàn app
- Protected routes với automatic redirect

### 9. **Tối Ưu Hiệu Năng**

- **Caching Strategy**: Server-side và API caching với TTL phù hợp (giảm 80% queries)
- **Batch Fetching**: Gộp queries để giảm N+1 problem
- **Image Optimization**: Lazy loading, WebP format, responsive images
- **Code Splitting**: Dynamic imports và route-based splitting

### 10. **Bảo Mật**

- **Authentication**: NextAuth.js với JWT sessions, bcrypt password hashing
- **CSRF Protection**: Token validation cho mọi mutation request
- **RBAC**: Phân quyền chi tiết theo vai trò (Admin/Manager/Volunteer)
- **Input Validation**: Zod schemas cho tất cả user inputs
- **Rate Limiting**: Upstash Redis để ngăn chặn abuse

---

## Cài Đặt Dự Án

### Yêu Cầu Hệ Thống

- **Node.js**: 18.0+ hoặc mới hơn
- **npm**: 9.0+ hoặc yarn/pnpm
- **MongoDB**: 4.4+ (local hoặc MongoDB Atlas)
- **Git**: Cho version control

### Hướng Dẫn Cài Đặt Chi Tiết

#### Bước 1: Clone Repository

```bash
git clone https://github.com/your-username/INT3306_Volunteer.git
cd INT3306_Volunteer
```

#### Bước 2: Cài Đặt Dependencies

```bash
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

#### Bước 3: Cấu Hình Database

##### Option 1: MongoDB Local

Cài đặt MongoDB và khởi động service:

```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

##### Option 2: MongoDB Atlas (Khuyến nghị)

1. Tạo tài khoản miễn phí tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo cluster mới
3. Whitelist IP address của bạn
4. Lấy connection string

#### Bước 4: Cấu Hình Environment Variables

Tạo file `.env` trong thư mục gốc:

```env
# ==========================================
# DATABASE CONFIGURATION
# ==========================================
# MongoDB connection string
# Local: mongodb://localhost:27017/volunteer_hub
# Atlas: mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/volunteer_hub?retryWrites=true&w=majority
DATABASE_URL="mongodb://localhost:27017/volunteer_hub"

# ==========================================
# NEXTAUTH CONFIGURATION
# ==========================================
# Base URL của ứng dụng
NEXTAUTH_URL="http://localhost:3000"

# Secret key cho mã hóa JWT sessions
# Generate bằng: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-key-here"

# ==========================================
# EMAIL CONFIGURATION (Nodemailer)
# ==========================================
# SMTP server configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"  # true cho port 465, false cho 587

# Gmail credentials (sử dụng App Password, không phải password thường)
# Hướng dẫn tạo App Password: https://support.google.com/accounts/answer/185833
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="Volunteer Hub <noreply@volunteerhub.com>"

# ==========================================
# WEB PUSH NOTIFICATIONS (Optional)
# ==========================================
# Generate VAPID keys bằng: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-public-vapid-key"
VAPID_PRIVATE_KEY="your-private-vapid-key"
VAPID_SUBJECT="mailto:admin@volunteerhub.com"

# ==========================================
# RATE LIMITING (Upstash Redis - Optional)
# ==========================================
# Lấy tại: https://upstash.com
UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"

# ==========================================
# OAUTH PROVIDERS (Optional)
# ==========================================
# Google OAuth
# Lấy tại: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ==========================================
# APPLICATION SETTINGS
# ==========================================
# Base URL cho production
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Upload limits (bytes)
MAX_FILE_SIZE="5242880"  # 5MB
MAX_FILES_PER_UPLOAD="5"
```

#### Bước 5: Setup Database & Prisma

```bash
# Generate Prisma Client từ schema
npx prisma generate

# Push schema lên MongoDB (không cần migrations cho MongoDB)
npx prisma db push

# Mở Prisma Studio để xem database (optional)
npx prisma studio
```

#### Bước 6: Seed Database (Optional)

Tạo dữ liệu mẫu để test:

```bash
npm run seed
```

Dữ liệu mẫu bao gồm:

- 1 Admin account
- 2 Event Manager accounts
- 5 Volunteer accounts
- 10 Sample events
- Sample registrations, posts, comments

#### Bước 7: Chạy Development Server

```bash
npm run dev
# hoặc với turbopack
npm run dev -- --turbo
```

Truy cập: **http://localhost:3000**

### Test Accounts (sau khi seed)

| Role          | Email                   | Password    |
| ------------- | ----------------------- | ----------- |
| Admin         | admin@volunteer.com     | Admin@123   |
| Event Manager | manager@volunteer.com   | Manager@123 |
| Volunteer     | volunteer@volunteer.com | User@123    |

### Build Production

```bash
# Build ứng dụng
npm run build

# Chạy production server
npm start
```

---

## Thiết Kế UI/UX

### Triết Lý Thiết Kế

**Hiện đại, Gọn gàng và Thân thiện với người dùng**

- Thiết kế tối giản tập trung vào nội dung
- Bảng màu và kiểu chữ nhất quán
- Hiệu ứng chuyển động mượt mà
- Các nút hành động rõ ràng

### Responsive Design

```css
/* Breakpoints */
Mobile:  < 640px   (sm)
Tablet:  640-1024px (md, lg)
Desktop: > 1024px  (xl, 2xl)
```

**Phương pháp Mobile-First:**

- Thiết kế cho điện thoại trước
- Cải tiến dần cho màn hình lớn hơn
- Nút bấm dễ chạm (tối thiểu 44 x 44px)
- Điều hướng tối ưu cho màn hình nhỏ
