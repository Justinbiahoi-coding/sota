# Sota (Space of the Art)

**Nền tảng web cho cụm bảo tàng** — showcase hiện vật, tham quan online, đặt vé, mua quà lưu niệm, chỉ đường giữa các bảo tàng trong cụm.

> Đồ án môn học Nhập môn Công nghệ phần mềm.

## Bối cảnh dự án

Dữ liệu hiện vật lấy thật từ [Smithsonian Open Access API](https://www.si.edu/openaccess) (21 bảo tàng tại Washington D.C., 5.1 triệu hiện vật số hóa, license CC0). Nghiệp vụ quản lý (triển lãm, vé, lưu niệm) do nhóm tự thiết kế, mô phỏng theo cách bảo tàng thật vận hành — tham khảo 2 ví dụ thật ở TPHCM: Bảo tàng Chứng tích Chiến tranh (đã có hệ thống bán vé online) và Bảo tàng Lịch sử TPHCM (đang thử nghiệm kho số hóa mở). Dự án không đại diện/hợp tác chính thức với Smithsonian hay bất kỳ bảo tàng nào — chỉ dùng dữ liệu mở công khai cho mục đích học tập.

## Trạng thái dự án

🚧 Mới khởi tạo khung dự án.

- [x] Dựng khung Next.js + TypeScript + Tailwind + shadcn/ui
- [x] Thiết lập Prisma schema (quan hệ: bảo tàng, hiện vật, triển lãm, vé, lưu niệm, đơn hàng, người dùng)
- [x] Cấu hình client Supabase (Auth + DB) và Stripe (thanh toán test mode)
- [ ] Đồng bộ dữ liệu thật từ Smithsonian API
- [ ] Các module CRUD + giao diện

## Tính năng chính

**Phía khách tham quan**
- Showcase hiện vật/tác phẩm (dữ liệu thật từ Smithsonian)
- Tham quan online (gallery ảnh 360° đơn giản — không làm full kiểu Google Arts & Culture vì cần thiết bị chuyên dụng)
- Đặt vé theo suất/ngày
- Mua quà lưu niệm
- Bản đồ + chỉ đường giữa các bảo tàng trong cụm
- Tài khoản: lưu tác phẩm yêu thích, xem lịch sử vé/đơn hàng

**Phía quản trị (CRUD cốt lõi)**
- Quản lý bảo tàng, triển lãm, vé, sản phẩm lưu niệm, người dùng

## Công nghệ

- **Frontend/Backend**: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL qua Supabase + Prisma ORM
- **Auth**: Supabase Auth
- **Thanh toán**: Stripe (chế độ test/sandbox trong suốt quá trình làm đồ án)
- **Deploy**: Vercel

## Bắt đầu phát triển

```bash
npm install
cp .env.example .env   # điền NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
                        # DATABASE_URL, STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
npx prisma migrate dev # tạo bảng theo prisma/schema.prisma
npm run dev
```

## Cấu trúc thư mục

```
sota/
├── prisma/
│   └── schema.prisma   # Toàn bộ model + quan hệ CSDL
├── src/
│   ├── app/            # Route Next.js (App Router)
│   ├── components/ui/  # Component shadcn/ui
│   └── lib/
│       ├── supabase/   # Client kết nối Supabase (browser + server)
│       └── stripe.ts   # Client Stripe phía server
```

Quy ước cấu trúc thư mục & tài liệu chi tiết hơn (mỗi thư mục con cần README riêng khi thêm module): xem `CONTRIBUTING.md`.
