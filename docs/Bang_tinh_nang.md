# Bảng tính năng chi tiết — Sota

## Phía khách tham quan

| STT | Tính năng | Mô tả chi tiết | Model Prisma liên quan | Độ ưu tiên | Người phụ trách |
|---|---|---|---|---|---|
| 1 | Xem danh sách hiện vật | Duyệt danh sách hiện vật, tìm kiếm theo tên/tác giả, lọc theo bảo tàng | `HienVat` | MVP | Người 1 |
| 2 | Xem chi tiết hiện vật | Ảnh, mô tả, tác giả, bảo tàng gốc, các triển lãm từng trưng bày | `HienVat`, `TrienLamHienVat` | MVP | Người 1 |
| 3 | Tham quan online | Gallery ảnh 360° đơn giản theo từng phòng/khu trưng bày | `HienVat` (ảnh liên quan) | Nâng cao | Người 1 |
| 4 | Xem danh sách & chi tiết bảo tàng | Tên, địa chỉ, giờ mở cửa, mô tả, danh sách triển lãm đang diễn ra | `BaoTang` | MVP | Người 3 |
| 5 | Xem lịch triển lãm | Danh sách triển lãm theo bảo tàng, ngày bắt đầu/kết thúc, hiện vật trưng bày | `TrienLam`, `TrienLamHienVat` | MVP | Người 3 |
| 6 | Bản đồ cụm bảo tàng | Hiển thị vị trí tất cả bảo tàng trên bản đồ | `BaoTang` (viDo/kinhDo) | MVP | Người 3 |
| 7 | Chỉ đường giữa 2 bảo tàng | Vẽ đường đi bộ, ước tính thời gian/khoảng cách | `BaoTang` (viDo/kinhDo) | Nâng cao | Người 3 |
| 8 | Đặt vé | Chọn bảo tàng → chọn suất/ngày → số lượng → thanh toán | `SuatVe`, `Ve` | MVP | Người 2 |
| 9 | Xem lịch sử vé đã đặt | Danh sách vé đã mua, trạng thái, QR/mã vé | `Ve` | MVP | Người 2 |
| 10 | Xem & mua lưu niệm | Danh sách sản phẩm, thêm giỏ hàng, đặt hàng, thanh toán | `SanPham`, `DonHang`, `DonHangSanPham` | MVP | Người 4 |
| 11 | Xem lịch sử đơn hàng | Danh sách đơn đã đặt, trạng thái xử lý/giao hàng | `DonHang` | MVP | Người 4 |
| 12 | Đăng ký/Đăng nhập | Qua Supabase Auth (email/mật khẩu) | `NguoiDung` | MVP | Người 4 |
| 13 | Lưu tác phẩm yêu thích | Đánh dấu hiện vật quan tâm để xem lại sau | `HienVat`, `NguoiDung` | Nâng cao | Người 4 |

## Phía quản trị

| STT | Tính năng | Mô tả chi tiết | Model Prisma liên quan | Độ ưu tiên | Người phụ trách |
|---|---|---|---|---|---|
| 14 | Đồng bộ dữ liệu hiện vật | Gọi Smithsonian Open Access API, lưu vào CSDL, tránh trùng lặp | `HienVat`, `BaoTang` | MVP | Người 1 |
| 15 | CRUD Bảo tàng | Thêm/sửa/xóa thông tin bảo tàng trong cụm | `BaoTang` | MVP | Người 3 |
| 16 | CRUD Triển lãm | Thêm/sửa/xóa triển lãm, gắn hiện vật vào triển lãm | `TrienLam`, `TrienLamHienVat` | MVP | Người 3 |
| 17 | CRUD Suất vé | Tạo suất vé theo ngày/giờ, đặt giá, giới hạn số lượng | `SuatVe` | MVP | Người 2 |
| 18 | Thống kê vé & doanh thu | Tổng lượt khách, doanh thu theo bảo tàng/thời gian | `Ve`, `SuatVe` | MVP | Người 2 |
| 19 | CRUD Sản phẩm lưu niệm | Thêm/sửa/xóa sản phẩm, quản lý tồn kho | `SanPham` | MVP | Người 4 |
| 20 | Quản lý đơn hàng | Cập nhật trạng thái đơn (xử lý/giao hàng/hoàn tất) | `DonHang` | MVP | Người 4 |
| 21 | Quản lý người dùng | Xem danh sách, phân quyền Khách/Quản trị viên | `NguoiDung` | MVP | Người 4 |

## Chú thích độ ưu tiên

- **MVP**: bắt buộc phải có, demo không được thiếu.
- **Nâng cao**: làm nếu còn thời gian sau khi MVP hoàn chỉnh, không bắt buộc cho demo chính.

Danh sách công việc cụ thể theo route/file: xem `docs/Phan_cong_cong_viec.md`. Bảng phân công theo người/tuần: xem `docs/Bang_phan_cong.md`.
