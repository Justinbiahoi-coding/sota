import { createClient } from "@/lib/supabase/client"
import type { AdminAsset, AdminFields, AdminItem, AdminKind, AdminOrder, AdminRole } from "@/lib/mock-data"
import type { ApiResponse, Artifact, MediaAsset, Museum, PaginatedResponse, ShopOrder, SouvenirProduct, TicketOrder, TicketType, UserProfile } from "@/lib/api/types"

export class AdminApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message)
    this.name = "AdminApiError"
  }
}

export type ConnectedOrder = AdminOrder & {
  total: string
  lines: Array<{ name: string; quantity: number; price: string; total: string }>
  invoiceNumber?: string
  shipping?: string
}

type CatalogRow = Museum | Artifact | SouvenirProduct | TicketType
const resources = { museum: "museums", artifact: "artifacts", product: "products", ticket: "ticket-types" } as const

function catalogItem(kind: Exclude<AdminKind, "exhibit">, row: CatalogRow): AdminItem {
  const fields: AdminFields = { description: row.description ?? "" }
  if (kind === "museum") {
    const m = row as Museum
    Object.assign(fields, { slug: m.slug, city: m.city ?? "", address: m.address ?? "" })
  } else if (kind === "artifact") {
    const a = row as Artifact
    Object.assign(fields, { code: a.inventory_code ?? "", period: a.period ?? "" })
  } else if (kind === "product") {
    const p = row as SouvenirProduct
    Object.assign(fields, { code: p.sku ?? "", price: String(p.price), stock: String(p.stock_quantity) })
  } else {
    fields.price = String((row as TicketType).price)
  }
  return {
    id: row.id, kind, museum: "museum_id" in row ? row.museum_id : row.id,
    name: row.name, fields, links: [],
    status: "is_available" in row ? (row.is_available ? "available" : "unavailable") : row.status,
  }
}

export class AdminBackendStore {
  role: AdminRole = "anon"
  profile: UserProfile | null = null
  items: AdminItem[] = []
  orders: ConnectedOrder[] = []
  assets: AdminAsset[] = []
  selectedMuseum = ""
  ready = false
  loading = false
  saving = false
  error = ""
  private revision = 0
  private generation = 0
  private listeners = new Set<() => void>()
  private supabase = createClient()
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }
  snapshot = () => this.revision
  private publish() { this.revision++; this.listeners.forEach(listener => listener()) }
  private clear() {
    this.profile = null; this.role = "anon"; this.items = []; this.orders = []; this.assets = []; this.selectedMuseum = ""
  }
  private deny(error: AdminApiError) {
    if (error.status === 401 || error.status === 403) {
      this.generation++
      this.clear()
      this.error = error.status === 401 ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." : "Quyền truy cập đã thay đổi. Vui lòng tải lại quyền quản lý."
      this.publish()
    }
  }
  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const generation = this.generation
    const base = process.env.NEXT_PUBLIC_API_URL
    if (!base) throw new Error("Chưa cấu hình địa chỉ Express cho trang quản trị.")
    const { data, error } = await this.supabase.auth.getSession()
    if (error) {
      const denied = new AdminApiError(401, "invalid_session", "Không xác thực được phiên đăng nhập.")
      this.deny(denied); throw denied
    }
    let token = data.session?.access_token
    if (!token) {
      const denied = new AdminApiError(401, "unauthenticated", "Vui lòng đăng nhập.")
      this.deny(denied); throw denied
    }
    const send = () => {
      const headers = new Headers(init.headers)
      headers.set("Authorization", "Bearer " + token)
      if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json")
      return fetch(base.replace(/\/$/, "") + "/api/v1" + path, { ...init, headers, cache: "no-store" })
    }
    let response: Response
    try {
      response = await send()
      if (response.status === 401) {
        const refreshed = await this.supabase.auth.refreshSession()
        token = refreshed.data.session?.access_token
        if (refreshed.error || !token) {
          const denied = new AdminApiError(401, "session_expired", "Phiên đăng nhập đã hết hạn.")
          this.deny(denied); throw denied
        }
        response = await send()
      }
    } catch (error) {
      if (error instanceof AdminApiError) throw error
      throw new Error("Không thể kết nối Express. Kiểm tra dịch vụ backend và cấu hình CORS.")
    }
    if (generation !== this.generation) throw new Error("Yêu cầu đã hết hiệu lực. Vui lòng tải lại.")
    const text = await response.text()
    if (generation !== this.generation) throw new Error("Yêu cầu đã hết hiệu lực. Vui lòng tải lại.")
    let payload: { error?: { code?: string; message?: string } } & Record<string, unknown> = {}
    if (text) {
      try { payload = JSON.parse(text) } catch {
        if (response.ok) throw new Error("Express trả về dữ liệu không hợp lệ. Kiểm tra địa chỉ backend.")
      }
    }
    if (!response.ok) {
      const error = new AdminApiError(response.status, payload.error?.code ?? "request_failed", payload.error?.message ?? "Không thực hiện được yêu cầu.")
      this.deny(error)
      throw error
    }
    return payload as T
  }

  private async orderDetails<T extends TicketOrder | ShopOrder>(orders: Array<{ id: string }>, resource: string) {
    const result: T[] = []
    for (let offset = 0; offset < orders.length; offset += 8) {
      const batch = await Promise.all(orders.slice(offset, offset + 8).map(order =>
        this.request<ApiResponse<T | { order: T; items: T["items"]; invoice: T["invoice"] }>>("/" + resource + "/" + order.id)))
      result.push(...batch.map(({ data }) => "order" in data
        ? { ...data.order, items: data.items, invoice: data.invoice } : data))
    }
    return result
  }
  private async all<T>(path: string) {
    const rows: T[] = []
    let offset = 0
    while (true) {
      const result = await this.request<PaginatedResponse<T>>(path + (path.includes("?") ? "&" : "?") + "limit=100&offset=" + offset)
      rows.push(...result.data)
      offset += result.data.length
      if (offset >= result.pagination.total) return rows
      if (!result.data.length) throw new Error("Danh sách trả về thiếu dữ liệu. Vui lòng tải lại.")
    }
  }
  async initialize() {
    if (this.saving) return
    const generation = ++this.generation
    this.loading = true; this.error = ""; this.publish()
    try {
      const { data, error } = await this.supabase.auth.getSession()
      if (error) throw error
      if (!data.session) { this.clear(); return }
      const { data: profile } = await this.request<ApiResponse<UserProfile>>("/me")
      const isSuper = profile.roles.includes("super_admin")
      if (!isSuper && !profile.roles.includes("admin_user")) {
        throw new AdminApiError(403, "not_admin", "Tài khoản này không có quyền quản trị.")
      }
      const museums = await this.all<Museum>("/admin/museums")
      if (generation !== this.generation) return
      const permitted = museums.filter(m => isSuper || profile.managed_museums.some(link => link.museum_id === m.id && link.status === "active"))
      this.profile = profile; this.role = isSuper ? "super_admin" : "admin_user"
      this.items = permitted.map(m => catalogItem("museum", m))
      this.orders = []
      this.assets = this.assets.filter(a => permitted.some(m => m.id === a.museum))
      const museum = permitted.find(m => m.id === this.selectedMuseum) ?? permitted[0]
      this.selectedMuseum = museum?.id ?? ""
      if (museum) await this.loadData(museum.id, generation)
    } catch (error) {
      if (generation !== this.generation) return
      this.clear(); this.error = error instanceof Error ? error.message : "Không tải được quyền quản trị."
    } finally {
      // Access denial also increments the generation and clears sensitive data.
      if (generation === this.generation || !this.profile) {
        this.ready = true; this.loading = false; this.publish()
      }
    }
  }
  async revalidateAccess() {
    if (this.saving || this.loading) return
    if (!this.profile) { await this.initialize(); return }
    try {
      const { data: profile } = await this.request<ApiResponse<UserProfile>>("/me")
      const superAdmin = profile.roles.includes("super_admin")
      const allowed = superAdmin || (profile.roles.includes("admin_user") && profile.managed_museums.some(m => m.museum_id === this.selectedMuseum && m.status === "active"))
      if (!allowed) {
        this.deny(new AdminApiError(403, "not_museum_admin", "Quyền truy cập đã thay đổi."))
        return
      }
      this.profile = profile
      this.role = superAdmin ? "super_admin" : "admin_user"
      this.items = this.items.filter(i => superAdmin || profile.managed_museums.some(m => m.museum_id === i.museum && m.status === "active"))
      this.publish()
    } catch (error) {
      if (this.profile) {
        this.generation++; this.clear()
        this.error = error instanceof Error ? error.message : "Không kiểm tra được quyền truy cập."
        this.publish()
      }
    }
  }
  private async loadData(museum: string, generation: number) {
    const [artifacts, products, tickets, admissions, shop] = await Promise.all([
      this.all<Artifact>("/admin/museums/" + museum + "/artifacts"),
      this.all<SouvenirProduct>("/admin/museums/" + museum + "/products"),
      this.all<TicketType>("/admin/museums/" + museum + "/ticket-types"),
      this.all<TicketOrder>("/admin/museums/" + museum + "/ticket-orders"),
      this.all<ShopOrder>("/admin/museums/" + museum + "/shop-orders"),
    ])
    const [ticketDetails, shopDetails] = await Promise.all([
      this.orderDetails<TicketOrder>(admissions, "ticket-orders"), this.orderDetails<ShopOrder>(shop, "shop-orders"),
    ])
    if (generation !== this.generation) return
    this.items = [
      ...this.items.filter(i => i.kind === "museum"),
      ...artifacts.map(a => catalogItem("artifact", a)), ...products.map(p => catalogItem("product", p)),
      ...tickets.map(t => catalogItem("ticket", t)),
    ]
    this.orders = [
      ...ticketDetails.map(o => this.order(o, "ticket")),
      ...shopDetails.map(o => this.order(o, "shop")),
    ]
  }
  private order(o: TicketOrder | ShopOrder, kind: "ticket" | "shop"): ConnectedOrder {
    const ticket = o as TicketOrder, shop = o as ShopOrder
    const lines = (o.items ?? []).map(item => ({
      name: "product_name" in item ? item.product_name : this.items.find(i => i.id === item.ticket_type_id)?.name ?? "Loại vé",
      quantity: item.quantity, price: String(item.unit_price), total: String(item.line_total),
    }))
    return {
      id: o.id, museum: o.museum_id, kind, date: new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(o.created_at)),
      visit: ticket.visit_date ?? "", slot: ticket.time_slot ?? "", code: ticket.entry_code ?? "",
      status: o.status, paid: o.payment_status === "paid", qty: lines.reduce((n, i) => n + i.quantity, 0),
      price: 0, fee: Number(shop.shipping_fee ?? 0), product: "", label: lines.map(i => i.name).join(", "),
      usedAt: ticket.used_at ?? undefined, total: String(o.total_amount), lines,
      invoiceNumber: o.invoice?.invoice_number,
      shipping: kind === "shop" ? [shop.shipping_name, shop.shipping_phone, shop.shipping_address, shop.shipping_city].filter(Boolean).join(" · ") : undefined,
    }
  }
  async selectMuseum(id: string) {
    if (this.loading || this.saving) return
    this.guard(id)
    const generation = ++this.generation
    this.selectedMuseum = id; this.orders = []; this.assets = this.assets.filter(a => a.museum === id)
    this.items = this.items.filter(i => i.kind === "museum")
    this.loading = true; this.error = ""; this.publish()
    try { await this.loadData(id, generation) } catch (error) {
      if (generation === this.generation) this.error = error instanceof Error ? error.message : "Không tải được dữ liệu."
    } finally { this.loading = false; this.publish() }
  }
  museums() { return this.items.filter(i => i.kind === "museum") }
  list(museum: string, kind: AdminKind) { return this.items.filter(i => i.museum === museum && i.kind === kind) }
  queue(museum: string) { return this.orders.filter(o => o.museum === museum) }
  media(museum: string) { return this.assets.filter(a => a.museum === museum).sort((a, b) => a.sequence - b.sequence) }
  private guard(museum: string) {
    if (!this.profile || !this.museums().some(m => m.id === museum)) throw new Error("Bạn không có quyền quản lý bảo tàng này.")
  }
  private async write<T>(operation: () => Promise<T>): Promise<T> {
    if (this.loading || this.saving) throw new Error("Vui lòng chờ thao tác hiện tại hoàn tất.")
    this.saving = true; this.publish()
    try { return await operation() } finally { this.saving = false; this.publish() }
  }
  async save(museum: string, kind: AdminKind, id: string, name: string, status: string, fields: AdminFields) {
    if (kind === "exhibit") throw new Error("Backend chưa hỗ trợ triển lãm.")
    if (id || kind !== "museum") this.guard(museum)
    return this.write(async () => {
      const body: Record<string, unknown> = { name, description: fields.description || null }
      if (kind === "museum") Object.assign(body, { slug: fields.slug, city: fields.city || null, address: fields.address || null, status })
      if (kind === "artifact") Object.assign(body, { inventory_code: fields.code || null, period: fields.period || null, status })
      if (kind === "product") Object.assign(body, { sku: fields.code || null, price: fields.price, stock_quantity: Number(fields.stock), status })
      if (kind === "ticket") Object.assign(body, { price: fields.price, is_available: status === "available" })
      const path = id ? "/admin/" + resources[kind] + "/" + id
        : kind === "museum" ? "/admin/museums" : "/admin/museums/" + museum + "/" + resources[kind]
      const result = await this.request<ApiResponse<CatalogRow>>(path, { method: id ? "PATCH" : "POST", body: JSON.stringify(body) })
      const item = catalogItem(kind, result.data)
      this.items = [...this.items.filter(i => i.id !== item.id), item]
      if (kind === "museum" && !id) this.selectedMuseum = item.id
      return item
    })
  }
  async redeem(museum: string, code: string) {
    this.guard(museum)
    return this.write(async () => {
      await this.request("/admin/ticket-orders/redeem", { method: "POST", body: JSON.stringify({ entry_code: code.trim() }) })
      this.orders = this.orders.map(o => o.kind === "ticket" && o.code === code.trim() ? { ...o, status: "used" } : o)
    })
  }
  async advance(museum: string, id: string, status: string) {
    this.guard(museum)
    const order = this.queue(museum).find(o => o.id === id)
    if (!order) throw new Error("Không tìm thấy đơn hàng.")
    return this.write(async () => {
      const path = status === "cancelled" ? "/" + (order.kind === "ticket" ? "ticket-orders" : "shop-orders") + "/" + id + "/cancel" : "/admin/shop-orders/" + id + "/fulfillment"
      await this.request(path, { method: status === "cancelled" ? "POST" : "PATCH", ...(status === "cancelled" ? {} : { body: JSON.stringify({ status }) }) })
      this.orders = this.orders.map(o => o.id === id ? { ...o, status } : o)
      if (status === "cancelled" && order.kind === "shop") {
        // Refresh stock after the successful server transaction without retrying the mutation.
        try {
          const products = await this.all<SouvenirProduct>("/admin/museums/" + museum + "/products")
          if (this.profile) this.items = [...this.items.filter(i => i.kind !== "product"), ...products.map(p => catalogItem("product", p))]
        } catch { this.error ||= "Đơn đã hủy. Hãy tải lại dữ liệu để cập nhật tồn kho." }
      }
    })
  }
  report(museum: string, from: string, to: string, exhibit = "") {
    if (!from || !to || from > to) throw new Error("Khoảng ngày không hợp lệ.")
    if (exhibit) throw new Error("Backend chưa hỗ trợ thống kê triển lãm.")
    const rows = this.queue(museum).filter(o => o.kind === "ticket" && o.paid && o.date >= from && o.date <= to)
    return { rows, qty: rows.reduce((n, o) => n + o.qty, 0), total: rows.reduce((n, o) => n + Number(o.total), 0) }
  }
  async details(museum: string, id: string) {
    this.guard(museum)
    return this.write(async () => {
      const order = this.queue(museum).find(o => o.id === id)
      if (!order) throw new Error("Không tìm thấy đơn hàng.")
      const [result] = await this.orderDetails<TicketOrder | ShopOrder>([order], order.kind === "ticket" ? "ticket-orders" : "shop-orders")
      const detail = this.order(result, order.kind)
      this.orders = this.orders.map(o => o.id === id ? detail : o)
    })
  }
  private asset(a: MediaAsset): AdminAsset {
    const path = a.storage_path.split("/").map(encodeURIComponent).join("/")
    return { id: a.id, museum: a.museum_id, target: a.entity_id, name: a.storage_path.split("/").pop() ?? a.id, primary: a.is_primary, sequence: a.sort_order, mime: a.mime_type,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/" + encodeURIComponent(a.storage_bucket) + "/" + path }
  }
  async upload(museum: string, target: string, file: File) {
    this.guard(museum)
    const item = this.items.find(i => i.id === target && i.museum === museum && (i.kind === "artifact" || i.kind === "product"))
    if (!item) throw new Error("Chọn hiện vật hoặc sản phẩm trong bảo tàng.")
    if (!file.size || file.size > 10 * 1024 * 1024) throw new Error("Tệp phải có dung lượng từ 1 byte đến 10 MB.")
    return this.write(async () => {
      const body = new FormData()
      body.set("file", file); body.set("museum_id", museum); body.set("entity_id", target)
      body.set("entity_type", item.kind === "artifact" ? "artifact" : "souvenir")
      body.set("media_type", file.type.startsWith("video/") ? "video" : "image")
      const { data } = await this.request<ApiResponse<MediaAsset>>("/admin/media", { method: "POST", body })
      this.assets = [...this.assets, this.asset(data)]
    })
  }
  async updateMedia(museum: string, id: string, sequence: number, primary: boolean) {
    this.guard(museum)
    return this.write(async () => {
      const { data } = await this.request<ApiResponse<MediaAsset>>("/admin/media/" + id, { method: "PATCH", body: JSON.stringify({ sort_order: sequence, is_primary: primary }) })
      this.assets = this.assets.map(a => a.id === id ? this.asset(data) : primary && a.target === data.entity_id ? { ...a, primary: false } : a)
    })
  }
  async removeMedia(museum: string, id: string) {
    this.guard(museum)
    return this.write(async () => {
      await this.request("/admin/media/" + id, { method: "DELETE" })
      this.assets = this.assets.filter(a => a.id !== id)
    })
  }
  async signIn(email: string, password: string) {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await this.initialize()
  }
  async signOut() {
    this.generation++
    this.clear(); this.publish()
    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }
  watchAuth() {
    const { data } = this.supabase.auth.onAuthStateChange(event => {
      if (event === "SIGNED_OUT") { this.generation++; this.clear(); this.loading = false; this.publish() }
    })
    return () => data.subscription.unsubscribe()
  }
}

