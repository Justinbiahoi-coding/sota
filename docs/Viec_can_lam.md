# Công việc cần làm (phần code) — Sota

## Backend

- Đăng nhập / Đăng ký (Dễ) (Có OTP qua email, dùng Supabase Auth)
- Quản lý người dùng (Trung bình) (Sửa tên, đổi mật khẩu; admin xem danh sách, đổi vai trò Khách/Quản trị viên)
- CRUD Bảo tàng (Trung bình) (Tên, địa chỉ, giờ mở cửa, mô tả, ảnh, tọa độ cho bản đồ)
- CRUD Triển lãm (Trung bình) (Ngày bắt đầu/kết thúc, gắn/gỡ hiện vật vào triển lãm)
- CRUD Suất vé (Trung bình) (Ngày giờ, giá, số lượng tối đa, số chỗ còn lại)
- CRUD Sản phẩm lưu niệm (Trung bình) (Giá, ảnh, tồn kho)
- CRUD Đơn hàng (Trung bình) (Tạo đơn từ giỏ hàng, đổi trạng thái xử lý/giao/hoàn tất)

Thêm vào so với bản nháp (các tính năng MVP trong `Bang_tinh_nang.md` chưa có ở trên):

- Đồng bộ hiện vật từ Smithsonian API (Khó) (Lưu vào CSDL, chống trùng, xử lý giới hạn số lần gọi)
- Thanh toán Stripe (Khó) (Thanh toán vé và đơn hàng, webhook cập nhật trạng thái sau khi trả tiền)
- Thống kê vé và doanh thu (Trung bình) (Theo bảo tàng, theo thời gian)
- Phân quyền trang quản trị (Dễ) (Chỉ Quản trị viên vào được `/admin`)

## Frontend (Tự động Dễ)

- Đăng nhập / Đăng ký (Có ô nhập mã OTP)
- Trang tài khoản (Sửa tên, đổi mật khẩu, xem vé và đơn hàng đã mua)
- CRUD Bảo tàng, Triển lãm, Suất vé, Sản phẩm lưu niệm, Đơn hàng (Các trang quản trị)
- Giao diện đặt vé (Chọn bảo tàng, xem suất, chọn số lượng, thanh toán)
- Cửa hàng lưu niệm (Danh sách sản phẩm, giỏ hàng, thanh toán)
- Trang hiện vật (Danh sách, tìm kiếm, chi tiết)
- Trang bảo tàng và lịch triển lãm
- Bản đồ cụm bảo tàng
- Trang chủ và layout chung (Header, footer, responsive trên điện thoại)
- Trang thống kê cho admin (Biểu đồ)

## Nâng cao (làm nếu còn thời gian)

- Chỉ đường giữa 2 bảo tàng
- Tham quan online (ảnh 360°)
- Lưu hiện vật yêu thích

## Chuẩn bị (làm trước tiên)

- Tạo Supabase, Stripe, điền key vào `.env`, chạy `npx prisma migrate dev`
- Nối Vercel với GitHub để tự deploy
- Dữ liệu mẫu để test
