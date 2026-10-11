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
