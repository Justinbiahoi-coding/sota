# Đóng góp vào Sota

## Quy ước cấu trúc thư mục & tài liệu

Dự án tổ chức theo **feature-first**: mỗi module nghiệp vụ (bảo tàng, triển lãm, vé, lưu niệm, người dùng...) nằm trong 1 thư mục route riêng dưới `src/app/`, không trộn lẫn logic nhiều module vào chung 1 file. Lý do: 5 người làm song song, mỗi người phụ trách 1 module, giảm xung đột merge.

**Bắt buộc:**
- Mỗi thư mục module mới trong `src/app/` phải có 1 file `README.md` giải thích: module này làm gì, các route/API chính, các bảng Prisma liên quan.
- Logic nghiệp vụ thuần (tính giá, kiểm tra tồn kho, tính khoảng cách giữa 2 bảo tàng...) viết thành hàm riêng trong `src/lib/`, viết unit test tương ứng — không nhúng thẳng vào component React (khó test, khó tái sử dụng).
- Mọi thay đổi `prisma/schema.prisma` phải kèm `npx prisma migrate dev` (tạo migration file) trong cùng commit, không sửa schema mà quên tạo migration.
- Khóa Stripe dùng trong suốt quá trình làm đồ án phải là khóa **test mode** (`sk_test_...`, `pk_test_...`) — không dùng khóa live.

## Quy trình

1. Tạo nhánh mới từ `main`, đặt tên theo module đang làm (vd `feature/quan-ly-ve`).
2. Code + test + cập nhật README module liên quan.
3. Chạy `npm run build` và `npx prisma validate` trước khi tạo PR — đảm bảo build sạch.
4. Tạo Pull Request, mô tả rõ thay đổi, gắn module liên quan.

## Trước khi commit

- [ ] `npm run build` chạy sạch, không lỗi TypeScript
- [ ] `npx prisma validate` hợp lệ (nếu có sửa schema)
- [ ] Đã thêm/cập nhật README của module đang sửa
- [ ] Không commit file `.env` (chỉ `.env.example`)
