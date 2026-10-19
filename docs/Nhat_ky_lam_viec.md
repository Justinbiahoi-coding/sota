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
  - Kết quả: Vision Document chỉ có 5 em dash cần sửa, không có tell nào khác. SDP có 13 chỗ cần sửa (10 em dash trong văn xuôi + 1 câu đối lập kiểu "không phải... mà là..." thừa) — riêng 9 dấu gạch ngang còn lại trong SDP là nhãn/tiêu đề bảng (vd "PA0 — Đề xuất dự án"), giữ nguyên theo đúng quy ước đã có từ trước (coi nhãn dữ liệu khác với văn xuôi). Cả 2 file verify lại mở đúng, số đoạn/bảng khớp, đã commit riêng từng file.

---

## 2026-10-16, 20:26 — Lập bảng công việc cần làm (phần code)

- **Thời gian làm việc:** 16/10/2026, ghi nhận lúc 20:26.
- **Làm việc gì:** Lập bảng các việc code còn phải làm, không gồm tài liệu.
- **Ứng dụng/module:** `docs/Viec_can_lam.md`.
- **Tác dụng:** Cả nhóm thấy thứ tự làm, ai làm việc gì và việc nào đang chặn việc khác (chưa có tài khoản Supabase/Stripe, chưa migrate).
- **Làm như thế nào:** Đối chiếu bảng tính năng và bảng phân công với code hiện có, chia thành 5 giai đoạn: chuẩn bị, khung giao diện và tài khoản, module MVP, kiểm thử, nâng cao; mỗi việc có người làm, số tính năng và cột trạng thái.

---

## 2026-10-16, 20:36 — Chia bảng công việc theo Backend và Frontend

- **Thời gian làm việc:** 16/10/2026, ghi nhận lúc 20:36.
- **Làm việc gì:** Bỏ tên người trong bảng công việc (để trống cho nhóm tự điền), rồi chia lại bảng theo Backend và Frontend.
- **Ứng dụng/module:** `docs/Viec_can_lam.md`.
- **Tác dụng:** Nhóm có thể chia người theo mảng server và giao diện thay vì theo module.
- **Làm như thế nào:** Tách mỗi tính năng có cả hai phía thành một việc Backend (Server Actions, Route Handlers, truy vấn Prisma, Stripe, Supabase) và một việc Frontend (trang, component); gom việc chuẩn bị vào Backend, kiểm thử và demo vào bảng Chung. Kết quả 28 việc Backend, 26 việc Frontend, 5 việc chung.

---

## 2026-10-16, 20:41 — Viết lại bảng công việc theo bản nháp của nhóm

- **Thời gian làm việc:** 16/10/2026, ghi nhận lúc 20:41.
- **Làm việc gì:** Viết lại `docs/Viec_can_lam.md` theo định dạng bản nháp Thiên gửi: danh sách Backend có ghi độ khó, Frontend mặc định là dễ.
- **Ứng dụng/module:** `docs/Viec_can_lam.md`.
- **Tác dụng:** Bảng gọn hơn, dễ chia việc theo độ khó.
- **Làm như thế nào:** Giữ nguyên các mục trong bản nháp, thêm chi tiết trong ngoặc; bổ sung các tính năng MVP mà bản nháp chưa có (đồng bộ Smithsonian, thanh toán Stripe, thống kê, phân quyền admin) thành một nhóm riêng có ghi độ khó; tách phần nâng cao và phần chuẩn bị ra cuối.

---

## 2026-10-16, 20:44 — Bổ sung các việc còn thiếu vào bảng công việc

- **Thời gian làm việc:** 16/10/2026, ghi nhận lúc 20:44.
- **Làm việc gì:** Rà bảng công việc với schema Prisma và bổ sung các việc còn thiếu.
- **Ứng dụng/module:** `docs/Viec_can_lam.md`.
- **Tác dụng:** Bảng phủ đủ các chỗ dễ vấp khi demo (đơn hàng chưa có địa chỉ giao, bán quá số vé) và các câu cần nhóm chốt.
- **Làm như thế nào:** Thêm vào Backend: sửa schema trước khi migrate, chống bán quá số vé và tồn kho, giỏ hàng, upload ảnh, QR và soát vé, hủy vé, quản lý hiện vật sau đồng bộ, email xác nhận; thêm đăng xuất/quên mật khẩu, xóa mềm bảo tàng, hủy đơn vào các mục sẵn có; thêm các trang Frontend tương ứng; thêm mục Kiểm thử và mục "Cần chốt với nhóm" (ngôn ngữ, tiền tệ, múi giờ).

---

## 2026-10-17, 13:26 — Dựng board Trello theo timeline của nhóm

- **Thời gian làm việc:** 17/10/2026, ghi nhận lúc 13:26.
- **Làm việc gì:** Đọc sheet "General Timeline IDK" (4 tab: Tổng quan, Chi tiết, Mốc kiểm tra, Rủi ro) và dựng board Trello "Sota" để nhóm phân công.
- **Ứng dụng/module:** Trello, board https://trello.com/b/UCuET94U (workspace "Trello Không gian làm việc").
- **Tác dụng:** Cả nhóm có một chỗ chung để nhận việc, kéo card qua "Đang làm" và "Xong", theo dõi mốc kiểm tra và rủi ro.
- **Làm như thế nào:** Đọc sheet qua trình duyệt; tạo board bằng phiên Trello đang đăng nhập (Trello MCP chưa xác thực được vì tài khoản lúc đầu chưa có workspace). Mỗi phase P0–P5 và Buffer là một cột, thêm cột Mốc kiểm tra, Rủi ro, Đang làm, Xong; 33 card việc có tên dạng "T<tuần> · <việc>", gắn nhãn Backend/Frontend/DevOps-Test và Ưu tiên 1–3; 7 card mốc kiểm tra và 5 card rủi ro kèm ảnh hưởng và đối sách. Chưa gán thành viên.

---

## 2026-10-17, 13:30 — Viết mô tả cho từng card trên board Trello

- **Thời gian làm việc:** 17/10/2026, ghi nhận lúc 13:30.
- **Làm việc gì:** Viết mô tả cho 33 card việc trên board Trello "Sota".
- **Ứng dụng/module:** Trello, board https://trello.com/b/UCuET94U.
- **Tác dụng:** Người nhận card biết phải làm gì và lúc nào thì được kéo card sang cột Xong, không phải hỏi lại.
- **Làm như thế nào:** Viết theo nguyên tắc của skill stop-slop và humanizer (câu ngắn, nói thẳng, không gạch ngang dài, không câu đệm). Mỗi mô tả gồm việc cần làm, dòng "Xong khi" có điều kiện kiểm tra được (kèm mốc M0 đến Demo ở card chốt mốc), và dòng phase, tuần, ưu tiên. Cập nhật qua phiên Trello đang đăng nhập trên Chrome; card mốc kiểm tra và rủi ro giữ nguyên mô tả cũ.

---

## 2026-10-17, 20:53 — Tạm gác phần game, tách ra nhánh riêng

- **Thời gian làm việc:** 17/10/2026, ghi nhận lúc 20:53.
- **Làm việc gì:** Tạm dừng phần game Vincent's Cats để tập trung làm frontend Sota; tách toàn bộ code game ra khỏi `main`.
- **Ứng dụng/module:** git, nhánh `game` và `main` của repo `sota`.
- **Tác dụng:** Push `main` lúc nào cũng không kéo theo game. Game giữ nguyên trên nhánh `game` (chưa push), làm xong mới push một lần.
- **Làm như thế nào:** Tạo nhánh `game` giữ nguyên 15 commit chưa push (8 commit game, 7 commit tài liệu và Trello). Dựng lại `main` từ `origin/main` bằng cách cherry-pick 7 commit tài liệu và Trello; file nhật ký bị xung đột thì chỉ ghép thêm các mục mới vào cuối. Kết quả: `main` không còn `/kham-pha` và `public/vincents-cats/`; các mục nhật ký về game nằm trên nhánh `game`. Muốn quay lại làm game: `git switch game`.

---

## 2026-10-17, 21:10 — Bỏ tính năng chỉ đường giữa các bảo tàng

- **Thời gian làm việc:** 17/10/2026, ghi nhận lúc 21:10.
- **Làm việc gì:** Bỏ tính năng chỉ đường giữa 2 bảo tàng khỏi phạm vi dự án theo quyết định của Thiên; vẫn giữ bản đồ cụm bảo tàng.
- **Ứng dụng/module:** `README.md`, `docs/Bang_tinh_nang.md`, `docs/Bang_phan_cong.md`, `docs/Phan_cong_cong_viec.md`, `docs/Viec_can_lam.md`.
- **Tác dụng:** Bớt một tính năng nâng cao phải gọi dịch vụ chỉ đường bên ngoài, nhóm tập trung vào trang lớn của từng bảo tàng.
- **Làm như thế nào:** Xóa các dòng về chỉ đường trong README, bảng phân công, danh sách việc; tính năng số 7 trong bảng tính năng được gạch đi và ghi "Đã bỏ" (giữ số thứ tự để khớp mã F07 trong tài liệu PA1). Không sửa hai file PA1 (.docx) vì đã nộp; board Trello không có card nào về chỉ đường.

---

## 2026-10-17, 21:17 — Bỏ chỉ đường khỏi cả hai tài liệu PA1

- **Thời gian làm việc:** 17/10/2026, ghi nhận lúc 21:17.
- **Làm việc gì:** Sửa nốt `PA1_SDP_Sota.docx` và `PA1_Vision_Sota.docx` cho khớp quyết định bỏ tính năng chỉ đường; đánh lại số tính năng.
- **Ứng dụng/module:** `docs/PA1_SDP_Sota.docx`, `docs/PA1_Vision_Sota.docx`, `docs/Bang_tinh_nang.md`.
- **Tác dụng:** Mọi tài liệu của nhóm thống nhất: còn 20 tính năng (17 MVP, 3 Nâng cao), có bản đồ cụm bảo tàng, không còn chỉ đường.
- **Làm như thế nào:** Giải nén từng file docx, thay chữ trực tiếp trong `word/document.xml` (mỗi đoạn chỉ có một run nên giữ nguyên định dạng): SDP sửa phần phân công, số tính năng (21 thành 20, 4 Nâng cao thành 3) và rủi ro; Vision sửa phần mở đầu, so sánh sản phẩm, nhu cầu (đổi "Tìm đường" thành "Biết vị trí các bảo tàng trong cụm"), giả định và phụ thuộc. Xóa dòng F07 trong bảng tính năng của Vision, đánh lại F08–F21 thành F07–F20, rồi đánh lại số tương ứng trong `Bang_tinh_nang.md` (bỏ dòng "Đã bỏ" ghi ở lần trước). Đóng gói lại và kiểm tra cấu trúc bảng bằng python-docx.

---

## 2026-10-18, 20:49 — Chốt hướng giao diện 3D, dời app vào web/

- **Thời gian làm việc:** 18/10/2026, ghi nhận lúc 20:49.
- **Làm việc gì:** Chốt hướng giao diện frontend (web có điểm nhấn 3D, mỗi bảo tàng một phòng trưng bày 3D, tông tường trắng gallery) và dời app Next.js vào thư mục `web/`.
- **Ứng dụng/module:** cấu trúc repo (`web/`), `.gitignore`, `README.md`, `CONTRIBUTING.md`.
- **Tác dụng:** Repo sẵn sàng cho cấu trúc `api/` (backend Express) và `web/` (frontend) như kế hoạch của nhóm; bên backend thêm `api/` mà không đụng phần frontend.
- **Làm như thế nào:** Thiên chọn mức 2 trong 3 mức 3D (trang chủ có cảnh 3D cụm bảo tàng, mỗi bảo tàng một phòng trưng bày 3D, đặt vé/giỏ hàng/admin giữ 2D) và tông sáng tường trắng. `git mv` toàn bộ phần app vào `web/`; giữ `docs/`, README, CONTRIBUTING ở gốc; đổi các mẫu trong `.gitignore` đang neo theo gốc (`/node_modules`, `/.next/`, `/src/generated/prisma`); sửa đường dẫn và lệnh trong README, CONTRIBUTING. Kiểm tra: `npm run build` trong `web/` chạy sạch.

---

## 2026-10-18, 20:59 — Dựng khung giao diện chung và trang chủ

- **Thời gian làm việc:** 18/10/2026, ghi nhận lúc 20:59.
- **Làm việc gì:** Làm card "Khởi tạo Next.js + theme chung + skeleton": bộ màu và font, header, footer, trang chủ dùng dữ liệu mẫu.
- **Ứng dụng/module:** `web/src/app/globals.css`, `web/src/app/layout.tsx`, `web/src/app/page.tsx`, `web/src/components/site/` (header, footer, menu), `web/src/components/home/iso-cluster.tsx`, `web/src/lib/mock-data.ts`.
- **Tác dụng:** Mọi trang sau dùng chung khung và theme; trang chủ đã có cảm giác 3D trước khi có cảnh React Three Fiber thật.
- **Làm như thế nào:**
  - Theme "white cube": nền trắng ngà có lớp hạt giấy rất nhẹ, chữ mực, viền mảnh; biến `--museum-accent` để mỗi bảo tàng có màu nhấn riêng (lớp Tailwind `bg-museum`, `text-museum`); tiện ích `placard` cho nhãn chữ nhỏ giãn rộng như thẻ ghi chú cạnh hiện vật.
  - Font Fraunces (tiêu đề) và Be Vietnam Pro (nội dung), đều có bộ tiếng Việt, tải qua `next/font`.
  - Header dính trên đầu, đánh dấu mục đang mở; menu điện thoại dùng thẻ `<details>` có sẵn của HTML, không cần JavaScript. Danh sách mục menu để ở `nav.ts` vì footer là server component, không import được dữ liệu từ file `"use client"`.
  - Trang chủ: hero với bản đồ isometric cụm bảo tàng bằng SVG (rê chuột khối nhà nhấc lên và đổi màu bảo tàng, bấm vào sang trang bảo tàng), danh sách "Hôm nay mở cửa", thẻ triển lãm. Dữ liệu mẫu gom ở `mock-data.ts` để sau đổi sang API.
  - Kiểm tra: build và lint sạch; xem trên trình duyệt ở khổ máy tính và khổ điện thoại 375px, sửa danh sách bảo tàng và tiêu đề mục bị chật trên điện thoại.

---

## 2026-10-19, 00:40 — Bản thử phần mở đầu "Hành trình của nghệ thuật"

- **Thời gian làm việc:** 19/10/2026, ghi nhận lúc 00:40.
- **Làm việc gì:** Làm bản thử phần mở đầu trang chủ: 6 cảnh kể sự tiến hóa của nghệ thuật (tiền sử, đồ đồng, mực trên lụa, chân dung sơn dầu, điêu khắc hiện đại, điểm ảnh), cuộn chuột thì camera lao vào chất liệu của thời kỳ này cho tới khi nó tan thành thời kỳ sau; kết bằng câu "Và giờ, nghệ thuật đến chỗ bạn. Sota."
- **Ứng dụng/module:** `web/src/components/home/intro/` (evolution-intro.tsx, textures.ts), `web/scripts/intro-art.ts`, `web/public/intro-art/*.webp`, `web/src/app/page.tsx`, `web/tsconfig.json`.
- **Tác dụng:** Phần mở đầu giới thiệu đúng tinh thần "Space of the Art" và dẫn vào trang chủ; ý tưởng lấy từ trang pear.no nhưng tránh được chỗ lag của trang đó.
- **Làm như thế nào:**
  - Mỗi cảnh là một ảnh, chỉ đổi `transform: scale` và `opacity` theo thanh cuộn (một vòng `requestAnimationFrame` làm mượt, không thư viện). Cảnh vào thì từ phóng to kết lại, cảnh ra thì phóng to tới ×7 rồi mờ đi. Có dòng thời gian bên phải, nút "Bỏ qua phần mở đầu", nhớ người đã xem (lần sau vào thẳng trang chính), và bản xếp tĩnh cho người bật giảm chuyển động.
  - Ảnh tạm vẽ bằng SVG (thớ đá có dấu tay, đồng có vòng đúc và gỉ, sóng mực có con dấu, chân dung trong khung vàng, điêu khắc treo, lưới điểm ảnh), render sang WebP bằng sharp (`node scripts/intro-art.ts`). Lần đầu dùng thẳng SVG thì trình duyệt treo, vì ảnh vector bị vẽ lại kèm bộ lọc ở mỗi mức phóng; ảnh bitmap thì chỉ phóng trên GPU. Tổng 6 ảnh khoảng 450 KB (pear.no tải 11,9 MB).
  - Đo khi cuộn hết 6 cảnh: không có tác vụ dài, khung hình khi cuộn bằng lúc đứng yên (cửa sổ Chrome tự động hóa bị giới hạn 30 fps cả lúc đứng yên). Xem ở khổ máy tính và điện thoại 375px; sửa chữ cảnh đầu không hiện, chữ trắng khó đọc trên nền lụa, giao diện trắng lẫn vào cảnh cuối nền sáng.
  - Lưu ý: chạy `npm run build` khi dev server đang bật làm hai bên giẫm thư mục `.next`, trang tự tải lại liên tục; phải tắt dev server, xóa `.next` rồi bật lại.
  - Còn lại: thay ảnh tạm bằng ảnh Smithsonian thật (cần API key), Thiên và nhóm duyệt lời dẫn 6 cảnh.

---

## 2026-10-19, 01:04 — Đổi phần mở đầu sang điều khiển từng bước

- **Thời gian làm việc:** 19/10/2026, ghi nhận lúc 01:04.
- **Làm việc gì:** Theo ý Thiên, đổi phần mở đầu từ "cuộn tới đâu chạy tới đó" sang "bấm một lần, chạy hết một đoạn chuyển cảnh rồi dừng".
- **Ứng dụng/module:** `web/src/components/home/intro/evolution-intro.tsx`.
- **Tác dụng:** Chuyển cảnh lúc nào cũng mượt dù người dùng cuộn giật cục; người xem dừng ở từng cảnh để đọc như lật trang.
- **Làm như thế nào:**
  - Mỗi bước là một đoạn hoạt ảnh cố định khoảng 1,9 giây với đường cong êm (ease in out); nhảy qua nhiều thời kỳ thì đoạn chuyển dài thêm một chút. Câu chuyện dừng ở chỗ chữ của mỗi cảnh hiện rõ nhất.
  - Bước tới: bấm hoặc chạm vào tranh, lăn chuột một nấc, vuốt lên, phím mũi tên xuống/phải, phím cách. Lùi: lăn ngược, vuốt xuống, mũi tên lên/trái. Các mốc trên dòng thời gian thành nút bấm để nhảy thẳng. Quán tính lăn của trackpad rơi vào đoạn chuyển cảnh đang chạy nên không bị nhảy hai bước.
  - Phần mở đầu chỉ giữ thao tác khi nó đang phủ màn hình và chưa tới cảnh cuối; ở cảnh cuối lăn chuột là xuống trang chính, bấm vào tranh cũng vào trang chính.
  - Sửa lỗi lăn chuột và phím không ăn: phần mở đầu nằm dưới header 64px nên phép kiểm tra "đang phủ màn hình" luôn sai; đẩy phần mở đầu lên nằm dưới header (`-mt-16`).
  - Thử trên trình duyệt: bấm, lăn chuột, phím mũi tên, nhảy qua dòng thời gian, cuộn qua cảnh cuối đều đúng.

---

## 2026-10-19, 02:03 — Làm lại phần mở đầu bằng tranh sống của Pear

- **Thời gian làm việc:** 19/10/2026, ghi nhận lúc 02:03.
- **Làm việc gì:** Bỏ bản mở đầu dùng ảnh tự vẽ; làm lại phần mở đầu theo trang pear.no, dùng hình ảnh và video của Pear (Pear cho phép, hình do AI tạo), điều khiển theo kiểu bấm một lần chạy một đoạn.
- **Ứng dụng/module:** `web/src/components/home/intro/evolution-intro.tsx`, `web/public/intro/` (9 video, 9 ảnh), `.gitignore`.
- **Tác dụng:** Phần mở đầu đẹp như trang Pear nhưng không lag: tải lần đầu chỉ video tấm rèm và video bước kế, mỗi bước là một đoạn video phát bình thường.
- **Làm như thế nào:**
  - Tìm hiểu trang Pear: phần lao xuyên cảnh là các chuỗi khung hình WebP (`films/tree`, `flysky`, `trans`, `model/v28`, `model/renaissance`...), vẽ lên canvas WebGL bằng thư viện OGL (mã nguồn mở, MIT) và tua theo thanh cuộn; các điểm dừng là video lặp "tranh sống". Tua từng khung theo thanh cuộn là lý do trang của họ lag.
  - Ghép các chuỗi khung hình thành 6 video H.264 ngắn (ffmpeg, 1440×810), nén lại 3 video lặp, tách 9 ảnh tĩnh làm khung dừng; tổng khoảng 29 MB.
  - Câu chuyện 8 điểm dừng: mở màn (kéo rèm), khu vườn, bầu trời, vun trồng, ngọn đuốc, ghép cành, trái chín, "Và giờ, nghệ thuật được chia cho mọi người. Sota." (lời dẫn viết tạm, Thiên sửa sau). Bấm, lăn chuột, vuốt, phím mũi tên để đi tới hoặc lùi; video phát chứ không tua; chỉ tải trước video của bước kế; video giữ khung cuối tới khi ảnh dừng (cùng khung) hiện xong để không chớp; ghi nguồn "Hình ảnh: Pear (pear.no), tạo bằng AI" ở góc dưới.
  - Hệ thống an toàn ở auto mode chặn việc đưa asset của bên thứ ba vào repo công khai; Thiên tự cho phép bằng cách tắt auto mode và duyệt từng lệnh. File ghi lời cho phép của Pear (và của Vincent's Cats) để riêng trên máy, không commit (`docs/Cho_phep_*.md` trong `.gitignore`), Thiên tự viết license sau.
  - Thử trên trình duyệt: đủ 7 bước tới, lùi, bấm ở cảnh cuối vào trang chính, trang không cuộn khi đang chuyển cảnh; sửa chữ trắng khó đọc ở cảnh nền sáng, dòng nhắc đè dòng ghi nguồn và cảnh mở màn bị cắt mất nhân vật trên điện thoại.

---

## 2026-10-19, 02:29 — Phần mở đầu thành màn chào toàn màn hình

- **Thời gian làm việc:** 19/10/2026, ghi nhận lúc 02:29.
- **Làm việc gì:** Theo ý Thiên, đổi phần mở đầu từ một khúc nằm trong trang chủ thành màn chào phủ kín toàn màn hình (đè lên cả header); xem xong hoặc bỏ qua thì nó mờ đi để lộ trang chủ.
- **Ứng dụng/module:** `web/src/components/home/intro/evolution-intro.tsx`, `web/src/app/page.tsx`.
- **Tác dụng:** Phần mở đầu là trải nghiệm riêng, không trộn với nội dung trang; trang chủ bắt đầu sạch sau khi thoát.
- **Làm như thế nào:**
  - Lớp phủ `fixed inset-0 z-50` (vai trò dialog), có chữ Sota ở góc trên thay cho header; trong lúc mở thì khóa cuộn trang phía dưới.
  - Thoát ra bằng: bấm hoặc cuộn tiếp ở cảnh cuối, nút "Bỏ qua phần mở đầu", phím Esc; lớp phủ mờ dần trong 0,7 giây rồi gỡ khỏi trang. Ghi nhớ đã xem để lần sau vào thẳng trang chủ.
  - Người bật "giảm chuyển động" không thấy phần mở đầu (bỏ bản xếp tĩnh). Đọc trạng thái đã xem/giảm chuyển động bằng `useSyncExternalStore` (server luôn coi là chưa xem, không phải gọi setState trong effect).
  - Thử trên trình duyệt: phủ kín màn hình, khóa cuộn, chuyển cảnh bằng chuột và phím, thoát bằng Esc, nút Bỏ qua và cảnh cuối; tải lại khi đã xem thì không hiện; khổ điện thoại 375px ổn.

---

## 2026-10-19, 03:06 — Sắp xếp lại phần mở đầu theo cấu trúc của Pear: 3 cảnh mở màn

- **Thời gian làm việc:** 19/10/2026, ghi nhận lúc 03:06.
- **Làm việc gì:** Thiên thấy trang pear.no có nhiều cảnh mở màn khác nhau; tìm hiểu cách họ làm rồi sắp xếp lại câu chuyện phần mở đầu cho hợp lý, kèm bố cục cảnh mở màn theo kiểu trang Pear.
- **Ứng dụng/module:** `web/src/components/home/intro/evolution-intro.tsx`, `web/public/intro/` (thêm `colossus`, `bridge-colossus`, `bridge-reveal`; đổi `graft.mp4` thành `bridge-signal.mp4`).
- **Tác dụng:** Mỗi lần vào trang là một cảnh mở màn khác (như Pear), câu chuyện sau đó liền mạch, không còn chỗ chen ngang.
- **Làm như thế nào:**
  - Đọc code của pear.no: có 3 cảnh mở màn chọn ngẫu nhiên (tượng cầm đuốc `signal`, quả lê vàng `colossus`, kéo rèm `reveal`), mỗi cảnh có một đoạn nối riêng (`v28`, `v51`, `v61`), cả ba đoạn nối cùng kết thúc ở cận cảnh đôi tay ghép cành.
  - Câu chuyện mới: mở màn ngẫu nhiên, đoạn nối, ghép cành, trái chín, chia đôi quả lê, khu vườn, bầu trời, vun trồng (video lặp đôi nam nữ, cảnh cuối, "Sota."). Cảnh mở màn được chọn ngay trên trình duyệt bằng `useSyncExternalStore` để không lệch giữa server và client.
  - Cảnh mở màn bố cục theo kiểu Pear: đường kẻ mảnh, dấu ✦, tiêu đề "Space of the Art.", dòng "Hai mươi mốt bảo tàng Smithsonian, một lối vào.", nút "Bắt đầu tham quan", nhãn và đoạn giới thiệu dưới đường kẻ (chữ của Sota). Danh sách chương ẩn ở cảnh mở màn để không đè lên tranh.
  - Sửa lỗi phím mũi tên không ăn sau khi bấm nút "Bắt đầu tham quan" (nút còn giữ focus, đoạn xử lý phím bỏ qua mọi phím khi focus ở nút; giờ chỉ bỏ qua Enter và phím cách). Thêm lớp tối nhẹ sau tiêu đề trên điện thoại, giảm cỡ chữ cảnh cuối để không che nhân vật.
  - Thử trên trình duyệt: tải lại ra đủ 3 cảnh mở màn; đi trọn mạch từ mở màn tới cảnh cuối rồi thoát ra trang chủ; khổ điện thoại 375px.

---

## 2026-10-19, 03:29 — Phần mở đầu dựng lại theo đúng bố cục trang Pear

- **Thời gian làm việc:** 19/10/2026, ghi nhận lúc 03:29.
- **Làm việc gì:** Theo ý Thiên, dựng lại phần mở đầu y như trang pear.no: cùng khung giao diện, cùng thứ tự cảnh, đổi nút "Apply" thành "Đăng nhập / Đăng ký", giữ cách điều khiển bấm một lần chạy một đoạn; đổi font cả web theo Pear.
- **Ứng dụng/module:** `web/src/components/home/intro/evolution-intro.tsx`, `web/src/app/layout.tsx`, `web/src/app/globals.css`, `web/public/intro/`.
- **Tác dụng:** Phần mở đầu là một trang giới thiệu đủ các tính năng của Sota (bộ sưu tập, phòng 3D, đặt vé, hỏi đáp, bản đồ), mỗi phần có nút dẫn tới trang tương ứng.
- **Làm như thế nào:**
  - Xem toàn bộ trang Pear: một câu chuyện liền mạch, mỗi cảnh tranh kèm một phần nội dung; khung chung gồm thanh dọc bên trái (ký hiệu, menu, vạch tiến độ), đường kẻ ngang ở đỉnh, nút ở góc phải; font Flecha và GT Standard (font trả phí của Grilli Type) nên thay bằng Newsreader, Hanken Grotesk, Geist Mono (có tiếng Việt).
  - Dựng lại giao diện bằng code của nhóm (không chép code hay chữ của Pear, vì lời cho phép chỉ nói về hình ảnh và video). Bảy phần: mở màn ngẫu nhiên, Bộ sưu tập (tán lá), Tham quan 3D (bản vẽ), Đặt vé (bản vẽ nhìn từ trên), Hỏi đáp (câu hỏi xếp quanh vòm lá, bấm để xem trả lời), Bản đồ (chòm sao), cảnh kết (chữ "sota." lớn trong khung, nút "Vào Sota"). Menu 4 chấm mở danh sách chương để nhảy tới; chữ đổi sang màu mực ở hai cảnh nền giấy.
  - Media: ghép đoạn nối của từng cảnh mở màn với đoạn mọc tán lá thành `hero-*-in.mp4`, thêm `coda.mp4`, `plan.mp4` và ảnh dừng; bỏ các đoạn không còn dùng (`bridge-*.mp4`, `harvest-*`); tổng khoảng 37 MB.
  - Lời dẫn và câu hỏi thường gặp viết tạm, Thiên sửa sau. Các đường dẫn /hien-vat, /bao-tang, /dat-ve, /ban-do, /dang-nhap chưa có trang.
  - Thử trên trình duyệt: đi hết bảy phần, mở câu trả lời, mở menu chương, thoát ra trang chủ (font mới), khổ điện thoại 375px (rút gọn nút đăng nhập, ẩn nhãn và đoạn mô tả nhỏ).

---

## 2026-10-19, 03:37 — Phần mở đầu: cuộn để lướt như Pear, bấm để tự chạy

- **Thời gian làm việc:** 19/10/2026, ghi nhận lúc 03:37.
- **Làm việc gì:** Theo ý Thiên, giữ lại kiểu lướt bằng cuộn chuột như trang Pear (phim chạy theo tay, tới lui, dừng ở đâu hình đứng ở đó) và vẫn có kiểu bấm một lần tự chạy tới cảnh sau.
- **Ứng dụng/module:** `web/src/components/home/intro/evolution-intro.tsx`, `web/public/intro/` (nén lại 8 phim chuyển cảnh).
- **Tác dụng:** Người xem chọn được cách đi qua phần mở đầu; cuộn vẫn mượt (60 khung hình/giây), không lag như trang gốc.
- **Làm như thế nào:**
  - Tiến độ câu chuyện là một số p từ 0 tới số cảnh trừ 1; mỗi số nguyên là một điểm dừng, mỗi khoảng giữa hai điểm dừng giữ ảnh dừng ở 14% đầu và cuối, phần giữa là phim. Cuộn chuột, trackpad, kéo trên điện thoại đổi đích đến của p, p trôi êm về đích, phim được tua tới đúng khung (mỗi lần chỉ tua khi lần trước xong). Bấm, chạm, phím mũi tên thì phim phát bình thường tới điểm dừng sau; cuộn giữa lúc đang phát thì chuyển sang tua ngay tại khung đó. Cuộn quá cảnh cuối thêm nửa đoạn thì thoát ra trang chủ. Phim có khung đầu khác ảnh dừng thì tự hiện dần lên (bỏ 6 ảnh khung đầu không còn cần).
  - Nén lại phim chuyển cảnh với khung đầy đủ cứ 3 khung một lần (ffmpeg `-g 3 -bf 0`), tua tới đâu chỉ cần giải mã tối đa 2 khung; mỗi phim nặng hơn khoảng 15%, cả thư mục khoảng 49 MB.
  - Đo khi tua liên tục qua một đoạn phim: 60 khung hình/giây (trung vị 16,7 ms, chậm nhất 18 ms), không có tác vụ dài. Thử thêm: cuộn tới, cuộn lùi, bấm để tự chạy tới cảnh sau, nhảy bằng menu, cuộn quá cảnh cuối để thoát.

---

## 2026-10-19, 19:10 — Phần mở đầu hiện ở mọi lần vào trang

- **Thời gian làm việc:** 19/10/2026, ghi nhận lúc 19:10.
- **Làm việc gì:** Theo ý Thiên, phần mở đầu hiện lại mỗi lần vào trang chủ như pear.no, thay vì chỉ hiện lần đầu.
- **Ứng dụng/module:** `web/src/components/home/intro/evolution-intro.tsx`.
- **Tác dụng:** Ai vào trang cũng thấy phần mở đầu; vẫn thoát được bằng cảnh cuối, nút "Bỏ qua" hoặc phím Esc. Máy bật chế độ giảm chuyển động thì bỏ qua luôn.
- **Làm như thế nào:** Bỏ khóa `sota-intro-seen` trong localStorage và hàm đánh dấu đã xem; điều kiện bỏ qua chỉ còn `prefers-reduced-motion`. Thử trên Chrome: tải trang, Esc đóng, tải lại thì phần mở đầu hiện lại.
