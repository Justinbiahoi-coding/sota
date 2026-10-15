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

## 2026-10-15, 23:51 — Phát hiện deadline PA1 gấp, viết lại 3 tài liệu nộp thầy cho Sota

- **Thời gian làm việc:** 15/10/2026, ghi nhận lúc 23:51.
- **Làm việc gì:** Phát hiện PA0+PA1 (giai đoạn Inception) hạn chót 16/10/2026 — tức ngày mai — qua đọc lại đúng đề bài gốc (`PA0/PA0_Dang_ky_nhom_va_Thiet_lap_cong_cu.pdf`). Sửa lại tên thư mục (`PA01`→`PA0`, `PA02`→`PA1`) cho khớp đúng số thứ tự bài tập. Viết lại 3 tài liệu nộp thầy cho Sota (trước đó toàn bộ nội dung cũ viết cho FitDuel, không còn đúng): đề xuất dự án 1 trang, Software Development Plan, Vision Document.
- **Ứng dụng/module:** Tài liệu nộp môn học (không phải code sản phẩm).
- **Tác dụng:** Đổi ý tưởng dự án (FitDuel → Sota) nhưng quên mất 3 tài liệu PA0/PA1 vẫn đang mô tả FitDuel — nếu không viết lại kịp sẽ nộp sai dự án cho thầy.
- **Làm như thế nào:**
  - Đọc lại bản PDF đề xuất 1 trang cũ (`FitDuel/docs/De_xuat_du_an_1_trang.pdf`, nằm ở `/Users/buivanthien/Learn/FitDuel` — phát hiện thư mục FitDuel đã bị di chuyển ra ngoài `ITSE/` ở thời điểm nào đó giữa các buổi làm việc, không phải do thao tác trong phiên này) để lấy đúng cấu trúc 4 mục bắt buộc theo đề bài.
  - Viết script Python (`reportlab`, font Arial hệ thống để hiển thị đúng tiếng Việt có dấu) tạo `docs/De_xuat_du_an_1_trang.pdf` mới cho Sota — đủ 4 mục: thành viên, giới thiệu, người dùng mục tiêu, tính năng chính (9 tính năng chính rút từ `Bang_tinh_nang.md`). Xóa script tạm sau khi dùng xong.
  - Giao 2 subagent (fork, chạy nền song song) viết **Software Development Plan** và **Vision Document** — mỗi agent tự đọc file mẫu tương ứng trong `PA1/`, bản cũ của FitDuel để tham khảo cấu trúc/văn phong, và đọc trực tiếp `prisma/schema.prisma` + 3 file kế hoạch đã có (`Bang_phan_cong.md`, `Phan_cong_cong_viec.md`, `Bang_tinh_nang.md`) để lấy đúng dữ kiện thật, không bịa. Lưu thành `docs/PA1_SDP_Sota.docx` và `docs/PA1_Vision_Sota.docx`.
  - Cả 2 agent hoàn thành, đã verify file tồn tại + đúng định dạng Word, đã commit/push. **Lưu ý cần tự xem lại trước khi nộp**: phần Non-Functional Requirements trong Vision Document (vd "tải trang ≤ 3 giây") là agent tự đặt mục tiêu hợp lý, không phải số đo thật — cần nhóm chỉnh lại cho sát thực tế nếu muốn dùng số chính thức.
  - Phát hiện phụ: bản `PA02_SDP_FitDuel.docx` cũ bị lỗi XML trong các ô bảng (có thể do lúc tạo trước đây) — không sửa vì FitDuel đã ngưng, chỉ ghi nhận lại để biết nếu sau này cần mở lại file đó.

---

## 2026-10-16, 00:04 — Dọn văn phong AI khỏi tài liệu nộp thầy + thêm hook nhắc nhở tự động

- **Thời gian làm việc:** 16/10/2026, ghi nhận lúc 00:04.
- **Làm việc gì:** Áp dụng skill `humanizer`/`stop-slop` lên 3 tài liệu vừa viết (đề xuất 1 trang, SDP, Vision Document) để bỏ các dấu hiệu văn AI (dấu gạch ngang em dash, kiểu câu "không phải X mà là Y"...). Thêm 1 rule hookify tự động nhắc khi phát hiện dấu hiệu này trong các lần viết file `.md`/`.docx` sau này.
- **Ứng dụng/module:** Tài liệu nộp môn học.
- **Tác dụng:** Tài liệu do agent viết (kể cả agent đã được dặn viết đúng văn phong) vẫn dễ lẫn các tell văn AI quen thuộc — cần 1 lượt dọn riêng trước khi nộp, và nên có cảnh báo tự động để không phải nhớ chạy tay mỗi lần.
- **Làm như thế nào:**
  - Viết lại đoạn giới thiệu trong `docs/De_xuat_du_an_1_trang.pdf` (bỏ 3 dấu em dash, bỏ cấu trúc "không phải... mà là...", tách lại thành câu ngắn hơn), regenerate PDF.
  - Giao 2 subagent (fork) đọc trực tiếp `docs/PA1_SDP_Sota.docx` và `docs/PA1_Vision_Sota.docx`, áp cùng bộ quy tắc, chỉ sửa văn phong, giữ nguyên toàn bộ bảng/số liệu/cấu trúc.
  - Tạo `.claude/hookify.no-ai-writing-tells.local.md`: cảnh báo tự động khi phát hiện em dash hoặc cấu trúc "không phải X mà là Y" trong file `.md`/`.docx` mới viết/sửa. Thêm `.claude/*.local.md` vào `.gitignore` (rule cá nhân, không chia sẻ chung với nhóm, đúng khuyến nghị của skill `hookify`).

---
