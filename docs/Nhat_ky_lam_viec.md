# Nhật ký làm việc

File này ghi lại mỗi lần làm việc với AI cho dự án Sota (Space of the Art) — mỗi mục trả lời 5 câu hỏi: **thời gian làm việc, làm việc gì, cho module/ứng dụng nào, để làm gì (tác dụng), và làm bằng cách nào**. Mục đích: cả nhóm (và bản thân sau này) xem lại được vì sao 1 quyết định/đoạn code tồn tại mà không phải đọc lại toàn bộ hội thoại.

**Về trường "Thời gian":** là thời điểm ghi nhật ký (lấy từ lệnh `date` thật lúc đó), không phải thời lượng đo chính xác task tốn bao lâu — AI không có cách đo chính xác thời gian thực ngồi làm, nên ghi thời điểm để ít nhất biết buổi làm việc diễn ra khi nào.

Ghi theo thứ tự thời gian, mục mới nhất ở cuối file.

---

## 2026-10-11, 21:17 — Đổi ý tưởng dự án (FitDuel → Sota) + dựng khung

_(Lúc dựng khung, dự án tạm đặt tên "MuseConnect" — đổi thành "Sota" ngay sau đó trong cùng buổi làm việc, trước khi tạo repo GitHub.)_

- **Thời gian làm việc:** 11/10/2026, ghi nhận lúc 21:17.
- **Làm việc gì:** Quyết định bỏ ý tưởng FitDuel (app thể dục dạng game), chuyển sang ý tưởng mới: nền tảng web cho cụm bảo tàng. Research chọn nguồn data (Smithsonian Open Access API), chọn tech stack, dựng khung dự án, lập lại Gantt 12 tuần.
- **Ứng dụng/module:** Toàn bộ dự án (khởi tạo lại từ đầu).
- **Tác dụng:** Thầy yêu cầu đổi sang app "doanh nghiệp cần, có CRUD", không khuyến khích làm game — FitDuel không còn phù hợp đề bài.
- **Làm như thế nào:**
  - Research xác nhận: các bảo tàng TPHCM/Hà Nội chưa có API/data mở công khai → chọn Smithsonian (Washington D.C., 21 bảo tàng, API mở thật, CC0) làm nguồn data chính, giữ bối cảnh Việt Nam (Bảo tàng Chứng tích Chiến tranh, Bảo tàng Lịch sử TPHCM) làm bằng chứng nhu cầu thật trong báo cáo.
  - Chốt tính năng: showcase hiện vật, tham quan online (gallery 360° rút gọn — không làm full kiểu Google Arts & Culture vì cần thiết bị chuyên dụng), đặt vé, mua lưu niệm, chỉ đường giữa các bảo tàng (Mapbox/OSM).
  - Chốt stack: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Supabase (Postgres + Auth) + Prisma (ORM) + Stripe (test mode) + Vercel — xác nhận đây là stack chuẩn production thật đang dùng (không phải chọn bừa).
  - Dựng khung: `create-next-app`, `shadcn init`, cài Prisma/Supabase/Stripe, viết `prisma/schema.prisma` (9 bảng: NguoiDung, BaoTang, HienVat, TrienLam, TrienLamHienVat, SuatVe, Ve, SanPham, DonHang, DonHangSanPham), client Supabase (`src/lib/supabase/`) + Stripe (`src/lib/stripe.ts`), verify bằng `npm run build` + `npx prisma validate` — cả 2 sạch. Viết lại README.md + CONTRIBUTING.md. Commit khung dự án.
  - Lập lại Gantt 12 tuần, giữ nguyên 5 thành viên, đổi vai trò cho khớp module mới (vd "Backend & đồng bộ" → "Bảo tàng, Triển lãm & Bản đồ").

---

## 2026-10-11, 21:47 — Bỏ dấu vết AI khỏi git + đổi tên dự án + tạo repo GitHub

- **Thời gian làm việc:** 11/10/2026, ghi nhận lúc 21:47.
- **Làm việc gì:** Đổi tên dự án MuseConnect → Sota (Space of the Art); xóa lịch sử git cũ (có dòng đồng tác giả AI) và khởi tạo lại sạch; tạo repo GitHub công khai và push.
- **Ứng dụng/module:** Toàn bộ dự án (branding + hạ tầng git).
- **Tác dụng:** Người dùng phát hiện commit có dòng `Co-Authored-By: Claude...` khiến AI hiện trong danh sách contributor trên GitHub — không phù hợp cho đồ án nhóm 5 người thầy có thể xem. Từ nay không thêm dòng này vào bất kỳ commit nào nữa.
- **Làm như thế nào:**
  - Đổi tên thư mục `museconnect` → `sota`, cập nhật `package.json`, `package-lock.json` (chạy lại `npm install`), và các nhắc tới tên cũ trong README.md/CONTRIBUTING.md/nhật ký này.
  - Vì repo local chưa từng push lên đâu (an toàn), xóa hẳn `.git` và `git init` lại, tạo 1 commit sạch duy nhất — không còn dòng đồng tác giả AI trong lịch sử.
  - `npm run build` + `npx prisma validate` lại lần cuối — vẫn sạch sau khi đổi tên.
  - Tạo repo GitHub public `Justinbiahoi-coding/sota` bằng `gh repo create`, push nhánh `main`. Xác minh qua GitHub API: commit chỉ đứng tên người dùng, không có đồng tác giả nào khác.

---
