import Stripe from "stripe";

/**
 * Stripe client phía server — dùng cho module Vé + Lưu niệm (tạo phiên
 * thanh toán, xác nhận đơn hàng). Chạy ở chế độ test/sandbox trong suốt
 * quá trình làm đồ án (khóa bắt đầu bằng sk_test_), không dùng khóa thật.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-09-30.endive",
});
