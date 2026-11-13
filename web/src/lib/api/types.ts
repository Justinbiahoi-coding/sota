// TypeScript types mirroring the backend API contract (docs/api-contract.md).
// Money fields are decimal strings (VND, e.g. "150000.00") — do not coerce to number.
// IDs are UUIDs. Timestamps are ISO 8601 UTC strings.

// ── Pagination ────────────────────────────────────────────────────────────────

export interface Pagination {
  limit: number
  offset: number
  total: number
}

export interface ApiResponse<T> {
  data: T
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
}

export interface ApiError {
  error: { code: string; message: string; details?: unknown }
}

// ── Enums ─────────────────────────────────────────────────────────────────────

export type PublicationStatus = "draft" | "published" | "archived"
export type TicketOrderStatus = "pending" | "confirmed" | "used" | "cancelled"
export type ShopOrderStatus = "pending" | "confirmed" | "shipped" | "completed" | "cancelled"
export type PaymentStatus = "unpaid" | "paid" | "failed"
export type CartStatus = "active" | "converted" | "abandoned"
export type AppRole = "normal_user" | "admin_user" | "super_admin"
export type MediaType = "image" | "video"
export type MediaEntityType = "artifact" | "souvenir"
export type TimeSlot = "09:00-11:00" | "11:00-13:00" | "14:00-16:00" | "16:00-18:00"

export const TIME_SLOTS: TimeSlot[] = ["09:00-11:00", "11:00-13:00", "14:00-16:00", "16:00-18:00"]

// ── Profile ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  display_name: string | null
  phone: string | null
  roles: AppRole[]
  managed_museums: Array<{ museum_id: string; status: string }>
}

// ── Museum ────────────────────────────────────────────────────────────────────

export interface Museum {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  city: string | null
  cover_image_path: string | null
  status: PublicationStatus
  created_at: string
  updated_at: string
}

// Detail endpoint embeds children
export interface MuseumDetail extends Museum {
  artifacts: Artifact[]
  souvenir_products: SouvenirProduct[]
  ticket_types: TicketType[]
}

// ── Artifact ──────────────────────────────────────────────────────────────────

export interface Artifact {
  id: string
  museum_id: string
  name: string
  description: string | null
  period: string | null
  inventory_code: string | null
  status: PublicationStatus
  created_at: string
  updated_at: string
}

// ── Souvenir product ──────────────────────────────────────────────────────────

export interface SouvenirProduct {
  id: string
  museum_id: string
  name: string
  description: string | null
  sku: string | null
  price: string         // VND decimal string e.g. "150000.00"
  currency: string
  stock_quantity: number
  status: PublicationStatus
  created_at: string
  updated_at: string
}

// ── Ticket type ───────────────────────────────────────────────────────────────

export interface TicketType {
  id: string
  museum_id: string
  name: string
  description: string | null
  price: string         // VND decimal string
  currency: string
  is_available: boolean
  created_at: string
  updated_at: string
}

// ── Media asset ───────────────────────────────────────────────────────────────

export interface MediaAsset {
  id: string
  museum_id: string
  entity_type: MediaEntityType
  entity_id: string
  media_type: MediaType
  storage_bucket: string
  storage_path: string
  mime_type: string
  sort_order: number
  is_primary: boolean
  created_at: string
  updated_at: string
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  quantity: number
  product?: SouvenirProduct
  created_at: string
  updated_at: string
}

export interface Cart {
  id: string
  user_id: string
  museum_id: string
  status: CartStatus
  items: CartItem[]
  created_at: string
  updated_at: string
}

// ── Ticket order ──────────────────────────────────────────────────────────────

export interface TicketOrderItem {
  id: string
  ticket_order_id: string
  ticket_type_id: string
  quantity: number
  unit_price: string
  line_total: string
  created_at: string
  updated_at: string
}

export interface TicketInvoice {
  id: string
  ticket_order_id: string
  invoice_number: string
  issued_at: string
  billing_name: string
  billing_email: string
  total_amount: string
  currency: string
}

export interface TicketOrder {
  id: string
  user_id: string
  museum_id: string
  visit_date: string        // YYYY-MM-DD
  time_slot: TimeSlot
  status: TicketOrderStatus
  payment_status: PaymentStatus
  total_amount: string
  currency: string
  entry_code: string | null
  used_at: string | null
  items?: TicketOrderItem[]
  invoice?: TicketInvoice
  created_at: string
  updated_at: string
}

// ── Shop order ────────────────────────────────────────────────────────────────

export interface ShopOrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  unit_price: string
  quantity: number
  line_total: string
  created_at: string
  updated_at: string
}

export interface ShopInvoice {
  id: string
  order_id: string
  invoice_number: string
  issued_at: string
  billing_name: string
  billing_email: string
  total_amount: string
  currency: string
}

export interface ShopOrder {
  id: string
  user_id: string
  museum_id: string
  status: ShopOrderStatus
  payment_status: PaymentStatus
  subtotal: string
  shipping_fee: string
  total_amount: string
  currency: string
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  shipping_city: string | null
  items?: ShopOrderItem[]
  invoice?: ShopInvoice
  created_at: string
  updated_at: string
}

// ── Request bodies ────────────────────────────────────────────────────────────

export interface TicketOrderRequest {
  museum_id: string
  visit_date: string        // YYYY-MM-DD
  time_slot: TimeSlot
  items: Array<{ ticket_type_id: string; quantity: number }>
}

export interface CheckoutRequest {
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  shipping_city?: string
}
