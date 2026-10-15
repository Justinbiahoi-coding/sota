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

## 2026-10-15, 21:19 — Chia task cụ thể cho 5 người

- **Thời gian làm việc:** 15/10/2026, ghi nhận lúc 21:19.
- **Làm việc gì:** Viết checklist công việc cụ thể cho từng người, chi tiết hơn bản Gantt theo tuần đã có — gắn đúng vào route/model thật trong schema hiện tại thay vì mô tả chung chung.
- **Ứng dụng/module:** Toàn bộ 5 module + phần phối hợp chung.
- **Tác dụng:** Gantt theo tuần chỉ nói "làm gì ở tuần mấy", chưa đủ cụ thể để từng người biết chính xác phải tạo file nào, route nào, gọi API nào — checklist này để mỗi người bắt tay vào việc được ngay.
- **Làm như thế nào:** Tạo `docs/Phan_cong_cong_viec.md`, liệt kê task theo từng người, trỏ thẳng vào model Prisma và đường dẫn route cụ thể đã có sẵn trong schema. Thêm mục "Việc chung" ghi rõ 2 điểm phụ thuộc giữa các module (Người 2+4 cùng dùng Stripe; module Triển lãm/Lưu niệm phụ thuộc data hiện vật của Người 1).

---

## 2026-10-15, 22:11 — Lập bảng phân công nhiệm vụ (dạng bảng tóm tắt)

- **Thời gian làm việc:** 15/10/2026, ghi nhận lúc 22:11.
- **Làm việc gì:** Tạo bảng phân công tóm tắt (1 dòng/người: MSSV, vai trò, công việc chính, tuần thực hiện) — khác với `Phan_cong_cong_viec.md` (checklist chi tiết từng đầu việc kỹ thuật).
- **Ứng dụng/module:** Tài liệu dự án, dùng được cho đề cương/báo cáo nộp thầy.
- **Tác dụng:** Checklist chi tiết hợp để code theo, nhưng không gọn để đưa vào báo cáo/đề cương — cần 1 bảng tóm tắt dễ đọc, đúng định dạng "bảng phân công nhiệm vụ" thường thấy trong SRS.
- **Làm như thế nào:** Tạo `docs/Bang_phan_cong.md`, dùng đúng MSSV/tên thật 5 thành viên đã có sẵn, gộp thông tin từ Gantt (tuần) + checklist (vai trò/công việc chính) thành 1 bảng, trỏ ngược lại 2 file kia để ai cần chi tiết hơn thì xem thêm.

---

## 2026-10-15, 23:02 — Lập bảng tính năng chi tiết

- **Thời gian làm việc:** 15/10/2026, ghi nhận lúc 23:02.
- **Làm việc gì:** Tạo bảng đặc tả tính năng — liệt kê từng tính năng cụ thể (21 tính năng, chia 2 nhóm khách/quản trị), kèm mô tả, model Prisma liên quan, độ ưu tiên (MVP/Nâng cao), người phụ trách.
- **Ứng dụng/module:** Toàn bộ hệ thống — tài liệu dùng cho SRS/đề cương.
- **Tác dụng:** Bảng phân công (`Bang_phan_cong.md`) nói "ai làm module nào", nhưng không liệt kê rõ TỪNG tính năng cụ thể trong module đó — bảng này bổ sung đúng góc nhìn "hệ thống có bao nhiêu tính năng, cái nào bắt buộc (MVP) cái nào có thể bỏ nếu hết giờ (Nâng cao)".
- **Làm như thế nào:** Tạo `docs/Bang_tinh_nang.md`, rà lại toàn bộ tính năng đã thống nhất trong các buổi trước (showcase, tham quan online, đặt vé, lưu niệm, bản đồ/chỉ đường, các CRUD quản trị), gắn mỗi tính năng với đúng model trong `prisma/schema.prisma` và đúng người phụ trách theo `Bang_phan_cong.md`. Đánh dấu "Nâng cao" cho các phần đã từng bàn là rút gọn/mở rộng (tham quan online 360°, chỉ đường, lưu yêu thích) để không ai hiểu nhầm là bắt buộc.

---
