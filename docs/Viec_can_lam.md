# Công việc cần làm (phần code) — Sota

## Backend

- Đăng nhập / Đăng ký (Dễ) (Có OTP qua email, dùng Supabase Auth; đăng xuất; quên mật khẩu)
- Quản lý người dùng (Trung bình) (Sửa tên, đổi mật khẩu; admin xem danh sách, đổi vai trò Khách/Quản trị viên)
- CRUD Bảo tàng (Trung bình) (Tên, địa chỉ, giờ mở cửa, mô tả, ảnh, tọa độ cho bản đồ; không cho xóa bảo tàng đang có triển lãm hoặc vé đã bán, dùng xóa mềm)
- CRUD Triển lãm (Trung bình) (Ngày bắt đầu/kết thúc, gắn/gỡ hiện vật vào triển lãm)
- CRUD Suất vé (Trung bình) (Ngày giờ, giá, số lượng tối đa, số chỗ còn lại)
- CRUD Sản phẩm lưu niệm (Trung bình) (Giá, ảnh, tồn kho)
- CRUD Đơn hàng (Trung bình) (Tạo đơn từ giỏ hàng, địa chỉ giao hàng, đổi trạng thái xử lý/giao/hoàn tất, khách tự hủy đơn chưa giao)

Thêm vào so với bản nháp (các tính năng MVP trong `Bang_tinh_nang.md` chưa có ở trên):

- Đồng bộ hiện vật từ Smithsonian API (Khó) (Lưu vào CSDL, chống trùng, xử lý giới hạn số lần gọi)
- Thanh toán Stripe (Khó) (Thanh toán vé và đơn hàng, webhook cập nhật trạng thái sau khi trả tiền)
- Thống kê vé và doanh thu (Trung bình) (Theo bảo tàng, theo thời gian)
- Phân quyền trang quản trị (Dễ) (Chỉ Quản trị viên vào được `/admin`)

Thêm sau khi rà lại:

- Sửa schema trước khi migrate (Dễ) (`DonHang` thêm tên người nhận, số điện thoại, địa chỉ giao; `Ve` thêm mã vé và trạng thái "đã sử dụng"; bảo tàng thêm cờ xóa mềm)
- Chống bán quá số vé và tồn kho (Khó) (Giữ chỗ khi tạo phiên thanh toán, trả chỗ khi khách hủy hoặc hết hạn thanh toán)
- Giỏ hàng (Trung bình) (Lưu giỏ trong cookie hoặc CSDL, thêm/bớt/đổi số lượng, kiểm tra tồn kho)
- Upload ảnh (Dễ) (Ảnh bảo tàng và sản phẩm lên Supabase Storage)
- Mã vé QR và soát vé (Trung bình) (Sinh QR cho mỗi vé; nhân viên quét QR để đánh dấu vé đã dùng)
- Hủy vé (Trung bình) (Khách hủy vé chưa dùng, trả lại chỗ cho suất; hoàn tiền Stripe là tùy chọn)
- Quản lý hiện vật sau khi đồng bộ (Dễ) (Admin sửa hoặc ẩn hiện vật lỗi ảnh, sai thông tin)
- Email xác nhận (Dễ) (Bật biên lai tự động của Stripe cho vé và đơn hàng)

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
- Quên mật khẩu (Nhập email, đặt lại mật khẩu)
- Form địa chỉ giao hàng khi thanh toán đơn
- Mã QR trong trang vé của tôi, trang quét vé cho nhân viên
- Nút hủy vé, hủy đơn
- Admin: quản lý hiện vật (sửa, ẩn)

## Kiểm thử

- Test từng module theo test case, ghi lỗi lên GitHub Issues
- Test cả luồng trên bản deploy: đăng ký, đặt vé, mua quà, thanh toán, xem lịch sử, soát vé
- Test trên điện thoại
- Sửa lỗi theo Issues

## Nâng cao (làm nếu còn thời gian)

- Chỉ đường giữa 2 bảo tàng
- Tham quan online (ảnh 360°)
- Lưu hiện vật yêu thích

## Chuẩn bị (làm trước tiên)

- Tạo Supabase, Stripe, điền key vào `.env`, chạy `npx prisma migrate dev`
- Nối Vercel với GitHub để tự deploy
- Dữ liệu mẫu để test

## Cần chốt với nhóm trước khi làm

- Ngôn ngữ: dữ liệu Smithsonian là tiếng Anh, giao diện tiếng Việt. Hiển thị mô tả hiện vật bằng tiếng Anh hay dịch?
- Tiền tệ: schema đang để giá bằng USD (cent). Giữ USD hay đổi sang VND?
- Múi giờ: suất vé tính theo giờ Washington hay giờ Việt Nam?
