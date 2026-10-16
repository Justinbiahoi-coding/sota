# Bảng công việc cần làm (phần code) — Sota

Tình trạng lúc lập bảng (16/10/2026): đã có khung Next.js, schema Prisma 10 bảng, file kết nối Supabase/Stripe, trang "Khám phá thêm" (game Vincent's Cats) và bản deploy rỗng trên Vercel. Chưa có tài khoản Supabase/Stripe, chưa chạy migration, chưa có trang chức năng nào.

Không gồm việc viết tài liệu (SRS, SDP, báo cáo...). Backend ở đây là phần chạy trên server của Next.js (Server Actions, Route Handlers, truy vấn Prisma, Stripe, Supabase); Frontend là các trang và component người dùng nhìn thấy.

## Backend

| STT | Công việc | Tính năng | Ưu tiên | Người làm | Trạng thái |
|---|---|---|---|---|---|
| B1 | Tạo project Supabase, điền `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL` vào `.env` | Chuẩn bị | MVP |  | Chưa |
| B2 | Chạy `npx prisma migrate dev` tạo 10 bảng trên Supabase | Chuẩn bị | MVP |  | Chưa |
| B3 | Tạo tài khoản Stripe (test mode), điền `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Chuẩn bị | MVP |  | Chưa |
| B4 | Thêm biến môi trường lên Vercel, nối Vercel với GitHub để tự deploy | Chuẩn bị | MVP |  | Chưa |
| B5 | Lấy API key Smithsonian (api.data.gov) | Chuẩn bị | MVP |  | Chưa |
| B6 | Viết seed dữ liệu mẫu (bảo tàng, suất vé, sản phẩm, 1 tài khoản admin) | Chuẩn bị | MVP |  | Chưa |
| B7 | Đăng ký/đăng nhập qua Supabase Auth; tạo bản ghi `NguoiDung` khi đăng ký | #12 | MVP |  | Chưa |
| B8 | Chặn route `/admin/*` và các action quản trị cho người không phải Quản trị viên | #21 | MVP |  | Chưa |
| B9 | Upload ảnh (bảo tàng, sản phẩm) lên Supabase Storage | Chung | MVP |  | Chưa |
| B10 | Script đồng bộ hiện vật từ Smithsonian vào `HienVat` (chống trùng theo `smithsonianId`, xử lý lỗi 429) | #14 | MVP |  | Chưa |
| B11 | Truy vấn danh sách hiện vật: tìm theo tên/tác giả, lọc theo bảo tàng, phân trang | #1 | MVP |  | Chưa |
| B12 | Truy vấn chi tiết hiện vật kèm các triển lãm từng trưng bày | #2 | MVP |  | Chưa |
| B13 | CRUD Bảo tàng (Server Actions + kiểm tra dữ liệu nhập) | #15 | MVP |  | Chưa |
| B14 | Truy vấn danh sách/chi tiết bảo tàng và tọa độ cho bản đồ | #4, #6 | MVP |  | Chưa |
| B15 | CRUD Triển lãm, gắn/gỡ hiện vật vào triển lãm | #16 | MVP |  | Chưa |
| B16 | Truy vấn lịch triển lãm theo bảo tàng và thời gian | #5 | MVP |  | Chưa |
| B17 | CRUD Suất vé: ngày giờ, giá, số lượng tối đa | #17 | MVP |  | Chưa |
| B18 | Tạo phiên Stripe Checkout cho vé (kiểm tra suất còn chỗ trước khi tạo) | #8 | MVP |  | Chưa |
| B19 | Webhook Stripe: thanh toán xong thì cập nhật trạng thái vé/đơn, trừ số chỗ và tồn kho | #8, #10 | MVP |  | Chưa |
| B20 | Truy vấn vé của tôi, sinh mã vé/QR | #9 | MVP |  | Chưa |
| B21 | Thống kê lượt khách và doanh thu theo bảo tàng/thời gian | #18 | MVP |  | Chưa |
| B22 | CRUD Sản phẩm lưu niệm, quản lý tồn kho | #19 | MVP |  | Chưa |
| B23 | Giỏ hàng và tạo đơn hàng, tạo phiên Stripe Checkout cho đơn | #10 | MVP |  | Chưa |
| B24 | Truy vấn đơn hàng của tôi | #11 | MVP |  | Chưa |
| B25 | Đổi trạng thái đơn hàng (xử lý/giao/hoàn tất) | #20 | MVP |  | Chưa |
| B26 | Danh sách người dùng, đổi vai trò Khách/Quản trị viên | #21 | MVP |  | Chưa |
| B27 | Tính đường đi bộ và thời gian giữa 2 bảo tàng (gọi dịch vụ chỉ đường) | #7 | Nâng cao |  | Chưa |
| B28 | Lưu/bỏ hiện vật yêu thích (thêm bảng mới vào schema) | #13 | Nâng cao |  | Chưa |

## Frontend

| STT | Công việc | Tính năng | Ưu tiên | Người làm | Trạng thái |
|---|---|---|---|---|---|
| F1 | Layout chung: header, menu, footer, theme màu và font | Chung | MVP |  | Chưa |
| F2 | Trang chủ: hero, hiện vật nổi bật, triển lãm đang diễn ra | Chung | MVP |  | Chưa |
| F3 | Trang đăng ký, đăng nhập, menu tài khoản | #12 | MVP |  | Chưa |
| F4 | Layout trang quản trị: sidebar, bảng dữ liệu và form dùng chung | Chung | MVP |  | Chưa |
| F5 | Trang danh sách hiện vật: ô tìm kiếm, bộ lọc, phân trang | #1 | MVP |  | Chưa |
| F6 | Trang chi tiết hiện vật | #2 | MVP |  | Chưa |
| F7 | Trang danh sách và chi tiết bảo tàng | #4 | MVP |  | Chưa |
| F8 | Trang lịch triển lãm | #5 | MVP |  | Chưa |
| F9 | Bản đồ cụm bảo tàng (ghim từng bảo tàng) | #6 | MVP |  | Chưa |
| F10 | Luồng đặt vé: chọn bảo tàng, suất, số lượng, chuyển sang thanh toán | #8 | MVP |  | Chưa |
| F11 | Trang thanh toán thành công/bị hủy | #8, #10 | MVP |  | Chưa |
| F12 | Trang vé của tôi (mã vé, QR, trạng thái) | #9 | MVP |  | Chưa |
| F13 | Cửa hàng: danh sách sản phẩm, chi tiết, giỏ hàng | #10 | MVP |  | Chưa |
| F14 | Trang đơn hàng của tôi | #11 | MVP |  | Chưa |
| F15 | Admin: quản lý bảo tàng | #15 | MVP |  | Chưa |
| F16 | Admin: quản lý triển lãm, chọn hiện vật gắn vào | #16 | MVP |  | Chưa |
| F17 | Admin: quản lý suất vé | #17 | MVP |  | Chưa |
| F18 | Admin: trang thống kê (biểu đồ lượt khách, doanh thu) | #18 | MVP |  | Chưa |
| F19 | Admin: quản lý sản phẩm lưu niệm | #19 | MVP |  | Chưa |
| F20 | Admin: quản lý đơn hàng | #20 | MVP |  | Chưa |
| F21 | Admin: quản lý người dùng | #21 | MVP |  | Chưa |
| F22 | Responsive: mọi trang không vỡ layout ở 375 px | Chung | MVP |  | Chưa |
| F23 | Gắn link "Khám phá thêm" (Vincent's Cats) lên trang chủ | Chung | MVP |  | Chưa |
| F24 | Giao diện chỉ đường giữa 2 bảo tàng trên bản đồ | #7 | Nâng cao |  | Chưa |
| F25 | Tham quan online: gallery ảnh 360° theo phòng | #3 | Nâng cao |  | Chưa |
| F26 | Nút yêu thích và trang hiện vật đã lưu | #13 | Nâng cao |  | Chưa |

## Chung: kiểm thử và demo

| STT | Công việc | Xong khi | Người làm | Trạng thái |
|---|---|---|---|---|
| C1 | Chạy thử từng module theo test case, ghi lỗi lên GitHub Issues | Mỗi module có ít nhất 1 lượt test |  | Chưa |
| C2 | Kiểm thử luồng xuyên suốt: đăng ký, đặt vé, mua quà, thanh toán, xem lịch sử | Cả luồng chạy không lỗi trên bản deploy |  | Chưa |
| C3 | Sửa lỗi theo Issues | Issues MVP đóng hết |  | Chưa |
| C4 | Nạp dữ liệu thật cho demo (hiện vật Smithsonian, triển lãm, suất vé) | Web có đủ dữ liệu để demo |  | Chưa |
| C5 | Diễn tập demo trên bản deploy | Chạy hết kịch bản demo không vấp |  | Chưa |

Thứ tự nên làm: B1 đến B6 trước (chặn mọi việc khác), song song F1 đến F4; sau đó từng cặp Backend/Frontend của cùng tính năng. Số tính năng (#) theo `docs/Bang_tinh_nang.md`.
