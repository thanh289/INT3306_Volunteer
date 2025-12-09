# Tính năng Quan tâm Sự kiện (Event Favorites)

## Tổng quan

Tính năng này cho phép người dùng đánh dấu các sự kiện họ quan tâm để theo dõi sau này.

## Các thành phần đã thêm

### 1. Database Schema (Prisma)

- **Model `InterestedEvent`**: Lưu trữ mối quan hệ giữa user và event mà họ quan tâm
  - Mỗi user chỉ có thể quan tâm một sự kiện một lần (unique constraint)
  - Tự động xóa khi user hoặc event bị xóa (CASCADE)
  - Có index để tối ưu truy vấn

### 2. API Routes

- **`/api/interested-events`**:
  - `GET`: Lấy danh sách sự kiện người dùng quan tâm
  - `POST`: Thêm sự kiện vào danh sách quan tâm
  - `DELETE`: Xóa sự kiện khỏi danh sách quan tâm
- **`/api/interested-events/check`**:
  - `GET`: Kiểm tra xem user có đang quan tâm một sự kiện cụ thể không

### 3. Components

#### `FavoriteEventButton`

Component có 2 chế độ:

- **Compact mode**: Nút nhỏ với icon trái tim (dùng trong event card)
- **Full mode**: Nút đầy đủ với text (dùng trong trang chi tiết)

Tính năng:

- ✅ Kiểm tra trạng thái đăng nhập
- ✅ Hiển thị thông báo nếu chưa đăng nhập
- ✅ Toggle trạng thái quan tâm
- ✅ Hiển thị loading state
- ✅ Toast notification khi thành công/thất bại

#### `InterestedEventList`

Hiển thị danh sách sự kiện quan tâm, chia làm 2 phần:

- Sự kiện sắp tới
- Sự kiện đã qua

### 4. Pages

- **`/interested-events`**: Trang hiển thị danh sách sự kiện người dùng quan tâm
  - Yêu cầu đăng nhập
  - Chỉ dành cho VOLUNTEER

### 5. Navigation Updates

- Thêm link "Quan tâm" vào navbar (desktop)
- Thêm link "Sự kiện quan tâm" vào mobile drawer
- Chỉ hiển thị cho role VOLUNTEER

## Cách sử dụng

### Đối với người dùng

1. **Thêm sự kiện quan tâm**:

   - Nhấn vào icon trái tim trên event card
   - Hoặc nhấn nút "Quan tâm" trong trang chi tiết sự kiện

2. **Xem danh sách sự kiện quan tâm**:

   - Nhấn vào link "Quan tâm" trên navbar
   - Hoặc truy cập `/interested-events`

3. **Xóa khỏi danh sách quan tâm**:
   - Nhấn lại vào icon trái tim (đã fill màu đỏ)
   - Hoặc nhấn nút "Đã quan tâm" trong trang chi tiết

### Đối với developer

1. **Chạy migration** (nếu cần):

   ```bash
   npx prisma generate
   ```

2. **Cài đặt dependencies** (nếu cần):

   ```bash
   npm install lucide-react
   ```

3. **Sử dụng component**:

   ```tsx
   // Compact mode (trong event card)
   <FavoriteEventButton eventId={event.id} compact />

   // Full mode (trong trang chi tiết)
   <FavoriteEventButton eventId={event.id} />
   ```

## Bảo mật

- ✅ Tất cả API routes đều kiểm tra authentication
- ✅ User chỉ có thể thao tác với danh sách quan tâm của chính họ
- ✅ Validation đầy đủ trên server-side

## Performance

- ✅ SWR caching cho danh sách sự kiện quan tâm
- ✅ Auto refresh mỗi 5 giây
- ✅ Database indexes cho query nhanh
- ✅ Lazy loading với skeleton screens

## Các file đã thay đổi

1. `prisma/schema.prisma` - Thêm model InterestedEvent
2. `app/api/interested-events/route.ts` - API endpoints
3. `app/api/interested-events/check/route.ts` - Check endpoint
4. `components/features/favorite-event-button.tsx` - Component nút favorite
5. `components/features/interested-event-list.tsx` - Component danh sách
6. `app/(main)/interested-events/page.tsx` - Trang hiển thị
7. `components/features/event-card.tsx` - Thêm nút favorite
8. `app/(main)/events/[eventId]/page.tsx` - Thêm nút favorite
9. `components/shared/navbar.tsx` - Thêm link
10. `components/shared/mobile-drawer.tsx` - Thêm link
