# Phân công công việc — Sota

Checklist cụ thể theo module, dựa trên `prisma/schema.prisma` đã có. Mỗi người tick khi xong, cập nhật README module tương ứng + ghi vào `docs/Nhat_ky_lam_viec.md` khi hoàn thành việc đáng kể.

## Người 1 — Võ Hoàng Phúc — Hiện vật & Đồng bộ Smithsonian API

- [ ] Đăng ký API key miễn phí tại [api.data.gov](https://api.data.gov) cho Smithsonian Open Access API
- [ ] Viết script đồng bộ (`scripts/sync-smithsonian.ts`): gọi `api.si.edu/openaccess/api/v1.0/search`, lọc hiện vật có ảnh CC0, parse `tieuDe`/`tacGia`/`anhUrl`/`moTa`/`smithsonianId`
- [ ] Map dữ liệu vào model `HienVat` qua Prisma Client; tạo/khớp `BaoTang` tương ứng theo unit code Smithsonian
- [ ] Xử lý trùng lặp (dựa vào `smithsonianId` unique), xử lý giới hạn rate limit (HTTP 429)
- [ ] Route `src/app/hien-vat/page.tsx` — danh sách hiện vật (tìm kiếm, lọc theo bảo tàng)
- [ ] Route `src/app/hien-vat/[id]/page.tsx` — chi tiết 1 hiện vật
- [ ] API route CRUD cho admin thêm ghi chú riêng (không sửa đè data gốc Smithsonian)
- [ ] README cho `src/app/hien-vat/`
- [ ] Unit test cho hàm parse/map dữ liệu từ response Smithsonian

## Người 2 — Nguyễn Đức Duy Tân — Vé & Thanh toán

- [ ] Lấy khóa Stripe test mode (`sk_test_...`, `pk_test_...`) từ Stripe Dashboard, điền `.env`
- [ ] CRUD `SuatVe` (admin tạo suất: ngày, giờ, giá, số lượng tối đa) — `src/app/admin/suat-ve/`
- [ ] Trang đặt vé phía khách `src/app/dat-ve/page.tsx` — chọn bảo tàng → chọn suất → số lượng
- [ ] Tạo Stripe Checkout Session khi khách xác nhận đặt vé
- [ ] Route webhook `src/app/api/webhooks/stripe/route.ts` — xác nhận thanh toán, cập nhật `Ve.trangThai`, tăng `SuatVe.soLuongDaDat`
- [ ] Trang lịch sử vé đã đặt (phía người dùng)
- [ ] Trang thống kê doanh thu/lượt khách (phía admin)
- [ ] README cho module + test cho logic tính tổng tiền / kiểm tra còn chỗ trống

## Người 3 — Bùi Văn Thiên — Bảo tàng, Triển lãm & Bản đồ

- [ ] CRUD `BaoTang` (admin) — `src/app/admin/bao-tang/`
- [ ] CRUD `TrienLam`, gắn `HienVat` qua bảng nối `TrienLamHienVat` — `src/app/admin/trien-lam/`
- [ ] Trang danh sách + chi tiết bảo tàng phía khách `src/app/bao-tang/`
- [ ] Lấy tọa độ thật của các bảo tàng Smithsonian (thông tin công khai) để seed `viDo`/`kinhDo`
- [ ] Tích hợp bản đồ (Mapbox GL JS hoặc Leaflet + OpenStreetMap) hiển thị vị trí cụm bảo tàng
- [ ] Gọi Directions API vẽ đường đi bộ giữa 2 bảo tàng được chọn
- [ ] README cho module + test cho logic phụ (nếu tự tính thêm khoảng cách/thời gian)

## Người 4 — Nguyễn Lê Anh Tuấn — Giao diện & Lưu niệm

- [ ] Hệ thống layout chính (Header/Footer/Navigation) dùng shadcn/ui
- [ ] Trang chủ `src/app/page.tsx` (thay trang mặc định create-next-app)
- [ ] CRUD `SanPham` (admin quản lý lưu niệm) — `src/app/admin/san-pham/`
- [ ] Trang danh sách sản phẩm + giỏ hàng
- [ ] Luồng checkout `DonHang`/`DonHangSanPham`, tích hợp Stripe (phối hợp Người 2 — cùng dùng `src/lib/stripe.ts`)
- [ ] Trang tài khoản (Supabase Auth: đăng ký/đăng nhập/đăng xuất)
- [ ] Responsive toàn site
- [ ] README cho các module giao diện/lưu niệm

## Người 5 — Cáp Hửu Duy — Kiểm thử & Tài liệu

- [ ] Viết lại SRS/đề cương theo ý tưởng Sota (docx)
- [ ] Use case cho từng module
- [ ] Soạn test case theo từng module (bắt đầu được khi module tương ứng có bản nháp)
- [ ] Kiểm thử tích hợp toàn hệ thống trước demo
- [ ] Viết báo cáo hoàn chỉnh

## Việc chung (phối hợp)

- [ ] Người 2 + Người 4 thống nhất format gọi Stripe chung (checkout session, webhook) để không làm trùng 2 kiểu khác nhau
- [ ] Người 1 làm xong đồng bộ data trước, các module còn lại (Triển lãm, Lưu niệm) phụ thuộc vào `HienVat` đã có data thật mới test được đầy đủ
- [ ] Cả nhóm: diễn tập + chuẩn bị demo (tuần cuối, xem `README.md` mục Gantt)
