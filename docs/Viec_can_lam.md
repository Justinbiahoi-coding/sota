# Bảng công việc cần làm (phần code) — Sota

Tình trạng lúc lập bảng (16/10/2026): đã có khung Next.js, schema Prisma 10 bảng, file kết nối Supabase/Stripe, trang "Khám phá thêm" (game Vincent's Cats) và bản deploy rỗng trên Vercel. Chưa có tài khoản Supabase/Stripe, chưa chạy migration, chưa có trang chức năng nào.

Không gồm việc viết tài liệu (SRS, SDP, báo cáo...).

## Giai đoạn 0: Chuẩn bị (làm trước, chặn mọi việc khác)

| STT | Công việc | Người làm | Xong khi | Trạng thái |
|---|---|---|---|---|
| 0.1 | Tạo project Supabase, điền `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL` vào `.env` | Thiên | `npx prisma db pull` kết nối được | Chưa |
| 0.2 | Chạy `npx prisma migrate dev` tạo 10 bảng trên Supabase | Thiên | Thấy đủ bảng trong Supabase Studio | Chưa |
| 0.3 | Tạo tài khoản Stripe (test mode), điền `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Tân | Gọi thử Stripe API không lỗi | Chưa |
| 0.4 | Thêm các biến môi trường lên Vercel, nối Vercel với GitHub để tự deploy | Thiên | Push lên `main` là web tự cập nhật | Chưa |
| 0.5 | Lấy API key Smithsonian (api.data.gov) | Phúc | Gọi thử 1 hiện vật trả về JSON | Chưa |
| 0.6 | Viết file seed dữ liệu mẫu (vài bảo tàng, suất vé, sản phẩm, 1 tài khoản admin) | Thiên | `npx prisma db seed` chạy được | Chưa |

## Giai đoạn 1: Khung giao diện và tài khoản

| STT | Công việc | Người làm | Tính năng | Ưu tiên | Trạng thái |
|---|---|---|---|---|---|
| 1.1 | Layout chung: header, menu, footer, theme màu và font | Tuấn | Chung | MVP | Chưa |
| 1.2 | Trang chủ: hero, hiện vật nổi bật, triển lãm đang diễn ra, link "Khám phá thêm" | Tuấn | Chung | MVP | Chưa |
| 1.3 | Đăng ký, đăng nhập, đăng xuất bằng Supabase Auth | Tuấn | #12 | MVP | Chưa |
| 1.4 | Chặn route `/admin/*` cho người không phải Quản trị viên (proxy/middleware) | Tuấn | #21 | MVP | Chưa |
| 1.5 | Layout trang quản trị (sidebar, bảng dữ liệu dùng chung) | Tuấn | Chung | MVP | Chưa |

## Giai đoạn 2: Các module MVP

| STT | Công việc | Người làm | Tính năng | Ưu tiên | Trạng thái |
|---|---|---|---|---|---|
| 2.1 | Script/route đồng bộ hiện vật từ Smithsonian vào bảng `HienVat` (chống trùng theo `smithsonianId`, xử lý lỗi 429) | Phúc | #14 | MVP | Chưa |
| 2.2 | Trang danh sách hiện vật: tìm theo tên/tác giả, lọc theo bảo tàng, phân trang | Phúc | #1 | MVP | Chưa |
| 2.3 | Trang chi tiết hiện vật | Phúc | #2 | MVP | Chưa |
| 2.4 | CRUD Bảo tàng (admin) | Thiên | #15 | MVP | Chưa |
| 2.5 | Trang danh sách và chi tiết bảo tàng | Thiên | #4 | MVP | Chưa |
| 2.6 | CRUD Triển lãm, gắn/gỡ hiện vật vào triển lãm (admin) | Thiên | #16 | MVP | Chưa |
| 2.7 | Trang lịch triển lãm | Thiên | #5 | MVP | Chưa |
| 2.8 | Bản đồ cụm bảo tàng (ghim từng bảo tàng theo vĩ độ/kinh độ) | Thiên | #6 | MVP | Chưa |
| 2.9 | CRUD Suất vé: ngày giờ, giá, số lượng tối đa (admin) | Tân | #17 | MVP | Chưa |
| 2.10 | Đặt vé: chọn bảo tàng, suất, số lượng, thanh toán Stripe Checkout | Tân | #8 | MVP | Chưa |
| 2.11 | Webhook Stripe: thanh toán xong thì đổi trạng thái vé, trừ số chỗ còn lại | Tân | #8 | MVP | Chưa |
| 2.12 | Trang vé của tôi (mã vé, QR, trạng thái) | Tân | #9 | MVP | Chưa |
| 2.13 | Thống kê lượt khách và doanh thu theo bảo tàng/thời gian (admin) | Tân | #18 | MVP | Chưa |
| 2.14 | CRUD Sản phẩm lưu niệm, quản lý tồn kho (admin) | Tuấn | #19 | MVP | Chưa |
| 2.15 | Cửa hàng: danh sách sản phẩm, giỏ hàng, đặt hàng, thanh toán Stripe | Tuấn | #10 | MVP | Chưa |
| 2.16 | Trang đơn hàng của tôi | Tuấn | #11 | MVP | Chưa |
| 2.17 | Quản lý đơn hàng: đổi trạng thái xử lý/giao/hoàn tất (admin) | Tuấn | #20 | MVP | Chưa |
| 2.18 | Quản lý người dùng: xem danh sách, đổi vai trò (admin) | Tuấn | #21 | MVP | Chưa |

## Giai đoạn 3: Kiểm thử và hoàn thiện

| STT | Công việc | Người làm | Xong khi | Trạng thái |
|---|---|---|---|---|
| 3.1 | Chạy thử từng module theo test case, ghi lỗi lên GitHub Issues | Duy | Mỗi module có ít nhất 1 lượt test | Chưa |
| 3.2 | Kiểm thử luồng xuyên suốt: đăng ký, đặt vé, mua quà, thanh toán, xem lịch sử | Duy | Cả luồng chạy không lỗi trên bản deploy | Chưa |
| 3.3 | Kiểm tra giao diện trên điện thoại (responsive) | Tuấn, Duy | Không vỡ layout ở 375 px | Chưa |
| 3.4 | Sửa lỗi theo Issues | Người làm module | Issues MVP đóng hết | Chưa |
| 3.5 | Nạp dữ liệu thật cho demo (hiện vật Smithsonian, triển lãm, suất vé) | Phúc, Thiên | Web có đủ dữ liệu để demo | Chưa |

## Giai đoạn 4: Nâng cao (chỉ làm khi MVP xong)

| STT | Công việc | Người làm | Tính năng | Trạng thái |
|---|---|---|---|---|
| 4.1 | Tham quan online: gallery ảnh 360° theo phòng | Phúc | #3 | Chưa |
| 4.2 | Chỉ đường đi bộ giữa 2 bảo tàng, ước tính thời gian | Thiên | #7 | Chưa |
| 4.3 | Lưu hiện vật yêu thích | Tuấn | #13 | Chưa |
| 4.4 | Gắn link "Khám phá thêm" (Vincent's Cats) lên trang chủ | Tuấn | Chung | Chưa |
| 4.5 | Diễn tập demo trên bản deploy | Cả nhóm | Chung | Chưa |

Số tính năng (#) theo `docs/Bang_tinh_nang.md`.
