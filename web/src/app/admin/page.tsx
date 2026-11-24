"use client"

import React, { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from "react"
import Link from "next/link"
import {
  formatVND,
  getAdminDay,
  ADMIN_STATUS_LABELS,
  type AdminKind,
} from "@/lib/mock-data"
import { AdminBackendStore, type ConnectedOrder } from "./admin-api"
import { AdminAccess } from "./admin-access"
import { cn } from "@/lib/utils"

type PageId =
  | "home"
  | "museum"
  | "artifact"
  | "exhibit"
  | "ticket"
  | "gate"
  | "product"
  | "order"
  | "media"
  | "report"

const NAV_ITEMS: { id: PageId; label: string }[] = [
  { id: "home", label: "Tổng quan" },
  { id: "museum", label: "Bảo tàng" },
  { id: "artifact", label: "Hiện vật" },
  { id: "exhibit", label: "Triển lãm" },
  { id: "ticket", label: "Loại vé" },
  { id: "gate", label: "Soát vé" },
  { id: "product", label: "Lưu niệm" },
  { id: "order", label: "Đơn hàng" },
  { id: "media", label: "Thư viện media" },
  { id: "report", label: "Thống kê" },
]

export default function AdminPortalPage() {
  // Session states matching the original museum-admin logic
  const [adminStore] = useState(() => new AdminBackendStore())
  useSyncExternalStore(adminStore.subscribe, adminStore.snapshot, adminStore.snapshot)
  const role = adminStore.role
  const museumId = adminStore.selectedMuseum
  const [page, setPage] = useState<PageId>("home")
  const [version, setVersion] = useState(0)

  // Filters matching app.js
  const [filter, setFilter] = useState("")
  const [visitFilter, setVisitFilter] = useState("")
  const [reportFrom, setReportFrom] = useState(() => getAdminDay(-29))
  const [reportTo, setReportTo] = useState(() => getAdminDay())
  const [reportExhibit, setReportExhibit] = useState("")

  // Toast notice and Modals
  const [notice, setNotice] = useState<string | null>(null)
  const [modalType, setModalType] = useState<
    "edit-item" | "order-detail" | "redeem-ticket" | "upload-media" | "asset-detail" | "create-museum" | null
  >(null)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)

  useEffect(() => {
    void adminStore.initialize()
    const unsubscribe = adminStore.watchAuth()
    const unsubscribeStore = adminStore.subscribe(() => {
      if (!adminStore.profile) { setModalType(null); setSelectedItemId(null) }
    })
    const refresh = () => { void adminStore.revalidateAccess() }
    window.addEventListener("focus", refresh)
    return () => { unsubscribe(); unsubscribeStore(); window.removeEventListener("focus", refresh) }
  }, [adminStore])

  const showNotice = useCallback((msg: string) => {
    setNotice(msg)
    setTimeout(() => {
      setNotice((prev) => (prev === msg ? null : prev))
    }, 4500)
  }, [])

  const accessibleMuseums = useMemo(() => {
    return adminStore.museums()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, version, adminStore, adminStore.items])

  const activeMuseum = useMemo(() => {
    return accessibleMuseums.find((m) => m.id === museumId) || null
  }, [accessibleMuseums, museumId])

  const handleLogout = async () => {
    try { await adminStore.signOut(); setPage("home"); setModalType(null) }
    catch (error) { showNotice(error instanceof Error ? error.message : "Không đăng xuất được.") }
  }
  const handleRefresh = () => { setModalType(null); void adminStore.initialize() }

  // Pill badge helper matching museum-admin/style.css
  const renderPill = (status: string) => {
    const label = ADMIN_STATUS_LABELS[status] || status
    let style = "bg-[#e6eee5] text-[#32583d]" // default published/available/completed
    if (status === "draft" || status === "pending") {
      style = "bg-[#f6ead0] text-[#694a10]"
    } else if (status === "archived" || status === "cancelled" || status === "used") {
      style = "bg-[#ececea] text-[#4d504c]"
    } else if (status === "confirmed" || status === "shipped") {
      style = "bg-[#dbeafe] text-[#1e40af]"
    }
    return (
      <span className={cn("inline-block px-2.5 py-0.5 rounded-full text-[13px] font-medium tracking-normal", style)}>
        {label}
      </span>
    )
  }

  if (!adminStore.ready || adminStore.loading) {
    return <div className="p-10 bg-[#f7f6ef]" role="status">Đang tải quyền và dữ liệu quản trị…</div>
  }
  if (!adminStore.profile || !accessibleMuseums.length) {
    return <AdminAccess store={adminStore} />
  }

  return (
    <div className="min-h-screen bg-[#f7f6ef] text-[#202d2a] font-sans">
      {adminStore.saving && <div className="fixed inset-0 z-[100] bg-white/60 flex items-center justify-center" role="status">Đang xử lý…</div>}
      {adminStore.error && <p role="alert" className="p-4 bg-red-50 text-red-800">{adminStore.error} <button onClick={handleRefresh}>Thử lại</button></p>}
      {/* Notice Toast */}
      {notice && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[#203e33] text-white px-5 py-2.5 rounded text-sm max-w-[92vw]">
          {notice}
        </div>
      )}

      {/* Grid Shell matching style.css: .shell { display: grid; grid-template-columns: 235px 1fr; } */}
      <div className="grid grid-cols-1 md:grid-cols-[235px_1fr] min-h-screen">
        {/* Left Sidebar (aside) */}
        <aside className="bg-[#184c40] text-white p-6 flex flex-col gap-6 justify-between shrink-0">
          <div className="space-y-6">
            {/* Brand */}
            <div className="font-heading text-[40px] leading-[0.95] tracking-tight">
              SOTA
              <small className="block font-sans font-semibold text-[10px] tracking-[1.6px] mt-2 text-[#d4e2d7] uppercase">
                QUẢN TRỊ BẢO TÀNG
              </small>
            </div>

            {/* Nav Links */}
            <nav aria-label="Chức năng quản trị" className="grid gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = page === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={async () => {
                      setPage(item.id)
                      setFilter("")
                      setVisitFilter("")
                    }}
                    className={cn(
                      "w-full text-left py-2 px-3.5 rounded text-sm font-semibold cursor-pointer",
                      isActive
                        ? "bg-[#326656] text-white"
                        : "text-[#e8f0e8] hover:bg-[#326656]/70 hover:text-white"
                    )}
                  >
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Foot */}
          <div className="mt-8 pt-4 border-t border-[#749187]/40 text-[#d8e6dc] text-xs space-y-2">
            <p className="font-medium text-[0.85rem]">
              {role === "super_admin" ? "Quản trị hệ thống" : "Quản trị bảo tàng"}
            </p>
            <p className="leading-relaxed">
              {role === "super_admin"
                ? "Phạm vi quản lý: tất cả bảo tàng. Có quyền tạo bảo tàng mới."
                : "Phạm vi quản lý: các bảo tàng được phân công có quyền đang hoạt động."}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLogout}
                className="bg-transparent hover:bg-white/10 text-white border border-[#749187] rounded py-1 px-2.5 text-xs font-semibold cursor-pointer"
              >
                Đăng xuất
              </button>
              <Link
                href="/"
                className="bg-transparent hover:bg-white/10 text-[#d8e6dc] hover:text-white border border-[#749187] rounded py-1 px-2.5 text-xs font-semibold text-center"
              >
                Trang web ↗
              </Link>
            </div>
          </div>
        </aside>

        {/* Right Main Container (main) */}
        <main className="w-full max-w-[1520px] mx-auto py-7 px-4 sm:px-8 md:px-12 flex flex-col justify-between">
          <div>
            {/* Top Bar (.bar) */}
            <div className="flex items-center justify-between gap-3 flex-wrap pb-5 border-b border-[#d6ddd3] text-[#53685f] text-[0.9rem] mb-6">
              <label className="flex items-center gap-2 font-semibold">
                <span>Bảo tàng quản lý:</span>
                <select
                  id="museum-switch"
                  value={museumId}
                  onChange={(e) => {
                    setModalType(null)
                    void adminStore.selectMuseum(e.target.value)
                    setPage("home")
                    setFilter("")
                    setVisitFilter("")
                  }}
                  className="bg-transparent font-bold text-[#202d2a] border border-[#a8b6aa] rounded px-2.5 py-1 focus:outline-[#bb763c]"
                >
                  {accessibleMuseums.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.fields.city || "Việt Nam"})
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#587e54]" />
                  Đã kết nối Express
                </span>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="bg-white hover:bg-[#edf2eb] text-[#184c40] border border-[#d6ddd3] px-2.5 py-1 rounded text-xs cursor-pointer font-semibold"
                >
                  Tải lại dữ liệu
                </button>
              </div>
            </div>

            {/* Page Heading & Actions (.heading) */}
            <div className="flex items-end justify-between gap-3 flex-wrap my-6 pb-2 border-b border-[#d6ddd3]">
              <h1 className="font-heading text-[clamp(2rem,3.2vw,2.8rem)] leading-[1.1] tracking-tight">
                {NAV_ITEMS.find((n) => n.id === page)?.label}
              </h1>

              {/* Action buttons matching original app.js headingActions() */}
              <div className="flex items-center gap-2 flex-wrap">
                {page === "museum" && (
                  <>
                    {role === "super_admin" && (
                      <button
                        type="button"
                        onClick={async () => {
                          setSelectedItemId(null)
                          setModalType("create-museum")
                        }}
                        className="bg-white hover:bg-[#edf2eb] text-[#184c40] border border-[#d6ddd3] px-3.5 py-1.5 rounded text-xs font-semibold cursor-pointer"
                      >
                        Thêm bảo tàng
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        setSelectedItemId(museumId)
                        setModalType("edit-item")
                      }}
                      className="bg-[#184c40] hover:bg-[#143e34] text-white px-3.5 py-1.5 rounded text-xs font-semibold cursor-pointer"
                    >
                      Sửa thông tin
                    </button>
                  </>
                )}

                {page === "artifact" && (
                  <>
                    <button disabled title="Backend chưa có API nhập Smithsonian"
                      type="button"

                      className="bg-white hover:bg-[#edf2eb] text-[#184c40] border border-[#d6ddd3] px-3.5 py-1.5 rounded text-xs font-semibold cursor-pointer"
                    >
                      Nhập mẫu Smithsonian
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setSelectedItemId(null)
                        setModalType("edit-item")
                      }}
                      className="bg-[#184c40] hover:bg-[#143e34] text-white px-3.5 py-1.5 rounded text-xs font-semibold cursor-pointer"
                    >
                      Thêm hiện vật
                    </button>
                  </>
                )}

                {page === "exhibit" && (
                  <button disabled title="Backend chưa có API triển lãm"
                    type="button"
                    onClick={async () => {
                      setSelectedItemId(null)
                      setModalType("edit-item")
                    }}
                    className="bg-[#184c40] hover:bg-[#143e34] text-white px-3.5 py-1.5 rounded text-xs font-semibold cursor-pointer"
                  >
                    Thêm triển lãm
                  </button>
                )}

                {page === "ticket" && (
                  <button
                    type="button"
                    onClick={async () => {
                      setSelectedItemId(null)
                      setModalType("edit-item")
                    }}
                    className="bg-[#184c40] hover:bg-[#143e34] text-white px-3.5 py-1.5 rounded text-xs font-semibold cursor-pointer"
                  >
                    Thêm loại vé
                  </button>
                )}

                {page === "gate" && (
                  <button
                    type="button"
                    onClick={() => setModalType("redeem-ticket")}
                    className="bg-[#184c40] hover:bg-[#143e34] text-white px-3.5 py-1.5 rounded text-xs font-semibold cursor-pointer"
                  >
                    Nhập mã vé
                  </button>
                )}

                {page === "product" && (
                  <button
                    type="button"
                    onClick={async () => {
                      setSelectedItemId(null)
                      setModalType("edit-item")
                    }}
                    className="bg-[#184c40] hover:bg-[#143e34] text-white px-3.5 py-1.5 rounded text-xs font-semibold cursor-pointer"
                  >
                    Thêm sản phẩm
                  </button>
                )}

                {page === "media" && (
                  <button
                    type="button"
                    onClick={() => setModalType("upload-media")}
                    className="bg-[#184c40] hover:bg-[#143e34] text-white px-3.5 py-1.5 rounded text-xs font-semibold cursor-pointer"
                  >
                    Thêm tệp
                  </button>
                )}
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                PAGE BODIES (matching app.js home, catalog, orders, media, report)
            ────────────────────────────────────────────────────────────────── */}

            {page === "exhibit" && <p className="p-4 border">Backend chưa có API quản lý triển lãm.</p>}
            {page === "artifact" && <p className="mb-4 text-sm">Nhập Smithsonian đang chờ API backend.</p>}
            {page === "media" && <p className="mb-4 text-sm">Backend chưa có API liệt kê media quản trị. Danh sách này hiển thị các tệp được tải lên trong phiên hiện tại.</p>}
            {(page === "home" || page === "report") && <p className="mb-4 text-sm">Tổng hợp vé từ đơn hàng Express theo ngày tạo đơn (Asia/Ho_Chi_Minh). Thanh toán được backend mô phỏng.</p>}
            {/* 1. TỔNG QUAN (HOME) */}
            {page === "home" && activeMuseum && (
              <div className="space-y-6">
                {/* Hero block (.hero) */}
                <section className="bg-[#dce6d9] p-6 sm:p-7 text-[#143e34] border-l-4 border-l-[#79977a] rounded-sm">
                  <small className="text-[0.72rem] font-bold tracking-[0.13em] uppercase block">
                    {activeMuseum.fields.city || "Bảo tàng"}
                  </small>
                  <h2 className="font-heading text-[2.3rem] leading-tight my-2 font-normal">
                    {activeMuseum.name}
                  </h2>
                  <p className="text-[#53685f] text-sm">{activeMuseum.fields.address}</p>
                </section>

                {/* Section title */}
                <h2 className="text-[1.3rem] font-bold mt-6 mb-3">Hoạt động bảo tàng</h2>

                {/* KPIs grid (.kpis) */}
                {(() => {
                  const summary = adminStore.report(museumId, getAdminDay(-29), getAdminDay())
                  const pendingCount = adminStore
                    .queue(museumId)
                    .filter((o) => o.kind === "shop" && o.status === "confirmed").length

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <article className="bg-white border border-[#d6ddd3] rounded-[6px] p-4 sm:p-5">
                        <span className="text-[#53685f] text-xs font-semibold block">Số vé đã bán · 30 ngày</span>
                        <strong className="block font-sans lining-nums tabular-nums text-[clamp(1.45rem,2.4vw,2.35rem)] text-[#202d2a] font-normal mt-2">
                          {summary.qty}
                        </strong>
                      </article>

                      <article className="bg-white border border-[#d6ddd3] rounded-[6px] p-4 sm:p-5">
                        <span className="text-[#53685f] text-xs font-semibold block">Doanh thu vé · 30 ngày</span>
                        <strong className="block font-sans lining-nums tabular-nums text-[clamp(1.45rem,2.4vw,2.35rem)] text-[#202d2a] font-normal mt-2">
                          {formatVND(summary.total)}
                        </strong>
                      </article>

                      <article className="bg-white border border-[#d6ddd3] rounded-[6px] p-4 sm:p-5">
                        <span className="text-[#53685f] text-xs font-semibold block">Đơn chờ giao</span>
                        <strong className="block font-sans lining-nums tabular-nums text-[clamp(1.45rem,2.4vw,2.35rem)] text-[#202d2a] font-normal mt-2">
                          {pendingCount}
                        </strong>
                      </article>
                    </div>
                  )
                })()}

                {/* Shortcuts */}
                <h2 className="text-[1.3rem] font-bold mt-6 mb-3">Lối tắt nghiệp vụ</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPage("artifact")}
                    className="bg-white hover:bg-[#edf2eb] text-[#184c40] border border-[#d6ddd3] py-3.5 px-4 rounded font-semibold text-sm cursor-pointer"
                  >
                    Hiện vật →
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage("gate")}
                    className="bg-white hover:bg-[#edf2eb] text-[#184c40] border border-[#d6ddd3] py-3.5 px-4 rounded font-semibold text-sm cursor-pointer"
                  >
                    Soát vé →
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage("order")}
                    className="bg-white hover:bg-[#edf2eb] text-[#184c40] border border-[#d6ddd3] py-3.5 px-4 rounded font-semibold text-sm cursor-pointer"
                  >
                    Đơn hàng →
                  </button>
                </div>
              </div>
            )}

            {/* 2. CATALOG MODULES (BẢO TÀNG, HIỆN VẬT, TRIỂN LÃM, LOẠI VÉ, LƯU NIỆM) */}
            {["museum", "artifact", "exhibit", "ticket", "product"].includes(page) && (
              <div className="space-y-3">
                <h2 className="text-[1.3rem] font-bold mb-3">
                  {page === "artifact"
                    ? "Danh mục hiện vật"
                    : page === "exhibit"
                    ? "Lịch triển lãm"
                    : page === "ticket"
                    ? "Bảng giá vé"
                    : page === "product"
                    ? "Sản phẩm trong kho"
                    : "Thông tin bảo tàng"}
                </h2>

                {adminStore.list(museumId, page as AdminKind).map((item) => {
                  const details: string[] = []
                  if (item.fields.code) details.push(`Mã danh mục · ${item.fields.code}`)
                  if (item.fields.period) details.push(`Niên đại · ${item.fields.period}`)
                  if (item.fields.price) details.push(formatVND(Number(item.fields.price)))
                  if (item.fields.stock) details.push(`Tồn kho · ${item.fields.stock}`)
                  if (item.fields.start && item.fields.end) details.push(`${item.fields.start} đến ${item.fields.end}`)
                  if (page === "exhibit") details.push(`${item.links.length} hiện vật`)
                  if (item.source) details.push(item.source.code)

                  return (
                    <article
                      key={item.id}
                      className="bg-white border border-[#d6ddd3] rounded-[6px] p-3.5 sm:p-4 flex items-center justify-between gap-4 flex-wrap"
                    >
                      <div className="flex-1 min-w-[140px] space-y-1">
                        <h3 className="text-[1.06rem] font-bold text-[#202d2a]">{item.name}</h3>
                        {details.length > 0 && (
                          <p className="text-xs text-[#53685f]">{details.join("　/　")}</p>
                        )}
                        {item.fields.description && (
                          <p className="text-xs text-[#53685f] line-clamp-2">{item.fields.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {renderPill(item.status)}
                        {page !== "museum" && (
                          <button
                            type="button"
                            onClick={async () => {
                              setSelectedItemId(item.id)
                              setModalType("edit-item")
                            }}
                            className="bg-white hover:bg-[#edf2eb] text-[#184c40] border border-[#d6ddd3] py-1.5 px-3 rounded text-xs font-semibold cursor-pointer"
                          >
                            Chi tiết
                          </button>
                        )}
                      </div>
                    </article>
                  )
                })}

                {!adminStore.list(museumId, page as AdminKind).length && (
                  <p className="p-6 border border-dashed border-[#92a598] rounded text-[#53685f] text-sm text-center">
                    Chưa có bản ghi cho bảo tàng này.
                  </p>
                )}

                {page === "ticket" && (
                  <p className="text-[#53685f] text-xs mt-3">Vé bảo tàng dùng các khung giờ cố định.</p>
                )}
              </div>
            )}

            {/* 3. SOÁT VÉ (GATE) & ĐƠN HÀNG (ORDER) */}
            {(page === "gate" || page === "order") && (
              <div className="space-y-4">
                {/* Tools bar */}
                <div className="flex items-end gap-3 flex-wrap mb-4">
                  <label className="grid gap-1 text-xs font-semibold text-[#53685f]">
                    <span>Trạng thái</span>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-xs text-[#202d2a]"
                    >
                      <option value="">Tất cả</option>
                      {page === "gate" ? (
                        <>
                          <option value="confirmed">Đã xác nhận</option>
                          <option value="used">Đã sử dụng</option>
                          <option value="pending">Chờ thanh toán</option>
                          <option value="cancelled">Đã hủy</option>
                        </>
                      ) : (
                        <>
                          <option value="confirmed">Đã xác nhận</option>
                          <option value="shipped">Đang giao</option>
                          <option value="completed">Đã giao</option>
                          <option value="cancelled">Đã hủy</option>
                          <option value="pending">Chờ thanh toán</option>
                        </>
                      )}
                    </select>
                  </label>

                  {page === "gate" && (
                    <label className="grid gap-1 text-xs font-semibold text-[#53685f]">
                      <span>Ngày tham quan</span>
                      <input
                        type="date"
                        value={visitFilter}
                        onChange={(e) => setVisitFilter(e.target.value)}
                        className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-xs text-[#202d2a]"
                      />
                    </label>
                  )}
                </div>

                {/* Orders rows */}
                {adminStore
                  .queue(museumId)
                  .filter(
                    (o) =>
                      o.kind === (page === "gate" ? "ticket" : "shop") &&
                      (!filter || o.status === filter) &&
                      (page !== "gate" || !visitFilter || o.visit === visitFilter)
                  )
                  .map((o) => (
                    <article
                      key={o.id}
                      className="bg-white border border-[#d6ddd3] rounded-[6px] p-3.5 sm:p-4 flex items-center justify-between gap-4 flex-wrap"
                    >
                      <div className="flex-1 min-w-[140px] space-y-1">
                        <h3 className="text-[1.06rem] font-bold text-[#202d2a]">{o.code || o.id}</h3>
                        <p className="text-xs text-[#53685f]">
                          {page === "gate" ? `${o.visit} · ${o.slot}` : o.label} · {formatVND(Number(o.total))}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {renderPill(o.status)}
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await adminStore.details(museumId, o.id)
                              setSelectedItemId(o.id)
                              setModalType("order-detail")
                            } catch (error) {
                              showNotice(error instanceof Error ? error.message : "Cannot load order details.")
                            }
                          }}
                          className="bg-white hover:bg-[#edf2eb] text-[#184c40] border border-[#d6ddd3] py-1.5 px-3 rounded text-xs font-semibold cursor-pointer"
                        >
                          Chi tiết
                        </button>
                      </div>
                    </article>
                  ))}

                {!adminStore
                  .queue(museumId)
                  .some(
                    (o) =>
                      o.kind === (page === "gate" ? "ticket" : "shop") &&
                      (!filter || o.status === filter) &&
                      (page !== "gate" || !visitFilter || o.visit === visitFilter)
                  ) && (
                  <p className="p-6 border border-dashed border-[#92a598] rounded text-[#53685f] text-sm text-center">
                    Không có đơn phù hợp.
                  </p>
                )}
              </div>
            )}

            {/* 4. THƯ VIỆN MEDIA */}
            {page === "media" && (
              <div className="space-y-4">
                <p className="text-[#53685f] text-xs">Ảnh và video gắn với hiện vật hoặc sản phẩm của bảo tàng.</p>

                {adminStore.media(museumId).map((a) => {
                  const targetName = adminStore.items.find((x) => x.id === a.target)?.name || a.target
                  return (
                    <article
                      key={a.id}
                      className="bg-white border border-[#d6ddd3] rounded-[6px] p-3.5 sm:p-4 flex items-center justify-between gap-4 flex-wrap"
                    >
                      <div className="flex-1 min-w-[140px] space-y-1">
                        <h3 className="text-[1.06rem] font-bold text-[#202d2a]">{a.name}</h3>
                        <p className="text-xs text-[#53685f]">
                          {targetName} · Thứ tự {a.sequence} {a.primary ? "· Tệp chính" : ""}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          setSelectedItemId(a.id)
                          setModalType("asset-detail")
                        }}
                        className="bg-white hover:bg-[#edf2eb] text-[#184c40] border border-[#d6ddd3] py-1.5 px-3 rounded text-xs font-semibold cursor-pointer"
                      >
                        Xem tệp
                      </button>
                    </article>
                  )
                })}

                {!adminStore.media(museumId).length && (
                  <p className="p-6 border border-dashed border-[#92a598] rounded text-[#53685f] text-sm text-center">
                    Thư viện đang trống. Chọn Thêm tệp để thử với tệp trên máy.
                  </p>
                )}
              </div>
            )}

            {/* 5. THỐNG KÊ (REPORT) */}
            {page === "report" && (
              <div className="space-y-5">
                {/* Tools form */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    // Triggers re-render
                    setVersion((v) => v + 1)
                  }}
                  className="flex items-end gap-3 flex-wrap"
                >
                  <label className="grid gap-1 text-xs font-semibold text-[#53685f]">
                    <span>Từ ngày</span>
                    <input
                      type="date"
                      value={reportFrom}
                      onChange={(e) => setReportFrom(e.target.value)}
                      required
                      className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-xs text-[#202d2a]"
                    />
                  </label>

                  <label className="grid gap-1 text-xs font-semibold text-[#53685f]">
                    <span>Đến ngày</span>
                    <input
                      type="date"
                      value={reportTo}
                      onChange={(e) => setReportTo(e.target.value)}
                      required
                      className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-xs text-[#202d2a]"
                    />
                  </label>

                  <label className="grid gap-1 text-xs font-semibold text-[#53685f]">
                    <span>Triển lãm</span>
                    <select
                      value={reportExhibit}
                      disabled title="Backend chưa hỗ trợ thống kê triển lãm"
                      onChange={(e) => setReportExhibit(e.target.value)}
                      className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-xs text-[#202d2a]"
                    >
                      <option value="">Tất cả</option>
                      {adminStore.list(museumId, "exhibit").map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="submit"
                    className="bg-[#184c40] hover:bg-[#143e34] text-white px-4 py-1.5 rounded text-xs font-semibold cursor-pointer"
                  >
                    Áp dụng
                  </button>
                </form>

                <p className="text-[#53685f] text-xs">
                  Doanh thu vé mô phỏng theo ngày thanh toán, gồm giao dịch đã thu tiền.
                </p>

                {(() => {
                  let r = { rows: [] as ConnectedOrder[], qty: 0, total: 0 }
                  try {
                    r = adminStore.report(museumId, reportFrom, reportTo, reportExhibit)
                  } catch (err: unknown) {
                    return (
                      <p className="p-4 bg-[#fee2e2] text-[#991b1b] rounded text-xs">
                        {err instanceof Error ? err.message : String(err)}
                      </p>
                    )
                  }

                  const daily = new Map<string, [number, number]>()
                  for (const o of r.rows) {
                    const v = daily.get(o.date) || [0, 0]
                    v[0] += o.qty
                    v[1] += Number(o.total)
                    daily.set(o.date, v)
                  }
                  const maxVal = Math.max(1, ...Array.from(daily.values()).map((v) => v[0]))

                  return (
                    <>
                      {/* KPIs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                        <article className="bg-white border border-[#d6ddd3] rounded-[6px] p-4 sm:p-5">
                          <span className="text-[#53685f] text-xs font-semibold block">Vé đã bán</span>
                          <strong className="block font-sans lining-nums tabular-nums text-[clamp(1.45rem,2.4vw,2.35rem)] text-[#202d2a] font-normal mt-2">
                            {r.qty}
                          </strong>
                        </article>
                        <article className="bg-white border border-[#d6ddd3] rounded-[6px] p-4 sm:p-5">
                          <span className="text-[#53685f] text-xs font-semibold block">Doanh thu vé</span>
                          <strong className="block font-sans lining-nums tabular-nums text-[clamp(1.45rem,2.4vw,2.35rem)] text-[#202d2a] font-normal mt-2">
                            {formatVND(r.total)}
                          </strong>
                        </article>
                      </div>

                      {/* Daily breakdown table */}
                      {daily.size > 0 ? (
                        <div className="bg-white border border-[#d6ddd3] rounded-[6px] p-4 sm:p-5 overflow-x-auto">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="border-b border-[#d6ddd3] text-[#53685f]">
                                <th className="py-2.5 px-3">Ngày</th>
                                <th className="py-2.5 px-3">Số vé</th>
                                <th className="py-2.5 px-3">Doanh thu</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Array.from(daily.entries())
                                .sort((a, b) => a[0].localeCompare(b[0]))
                                .map(([d, v]) => (
                                  <tr key={d} className="border-b border-[#d6ddd3]/60">
                                    <td className="py-2.5 px-3 font-mono font-medium">{d}</td>
                                    <td className="py-2.5 px-3">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono w-6">{v[0]}</span>
                                        <div
                                          className="bg-[#51836e] h-[9px] min-w-[3px] rounded-sm"
                                          style={{ width: `${Math.round((100 * v[0]) / maxVal)}px` }}
                                        />
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3 font-mono font-semibold">{formatVND(v[1])}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="p-6 border border-dashed border-[#92a598] rounded text-[#53685f] text-sm text-center">
                          Chưa có giao dịch trong khoảng này.
                        </p>
                      )}
                    </>
                  )
                })()}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="mt-12 pt-4 border-t border-[#d6ddd3] text-xs text-[#53685f] flex items-center justify-between">
            <span>SOTA Admin </span>
            <span>Múi giờ Asia/Ho_Chi_Minh (UTC+7)</span>
          </div>
        </main>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          DIALOGS / MODALS (matching dialog#editor in style.css & app.js)
      ──────────────────────────────────────────────────────────────────────── */}

      {/* MODAL: CHỈNH SỬA / THÊM BẢN GHI (EDIT ITEM) */}
      {(modalType === "edit-item" || modalType === "create-museum") && (
        <div className="fixed inset-0 z-50 bg-[#162b25]/50 flex items-center justify-center p-4">
          {(() => {
            const kind: AdminKind = modalType === "create-museum" ? "museum" : (page as AdminKind)
            const item = selectedItemId ? adminStore.list(museumId, kind).find((x) => x.id === selectedItemId) : null
            const isEditing = Boolean(item)

            return (
              <div className="bg-white border border-[#d6ddd3] rounded-[8px] p-6 sm:p-7 max-w-[520px] w-[94vw] max-h-[90vh] overflow-y-auto">
                <h2 className="font-heading text-[1.85rem] leading-tight mb-4 font-normal">
                  {isEditing ? "Chỉnh sửa " : "Thêm "}
                  {kind === "museum"
                    ? "bảo tàng"
                    : kind === "artifact"
                    ? "hiện vật"
                    : kind === "exhibit"
                    ? "triển lãm"
                    : kind === "ticket"
                    ? "loại vé"
                    : "sản phẩm"}
                </h2>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setModalError(null)
                    const f = new FormData(e.currentTarget)
                    const name = String(f.get("name") || "").trim()
                    const status = String(f.get("status") || "draft")
                    const fields: Record<string, string> = {}

                    if (kind === "museum") {
                      fields.slug = String(f.get("slug") || "").trim()
                      fields.city = String(f.get("city") || "").trim()
                      fields.address = String(f.get("address") || "").trim()
                      fields.description = String(f.get("description") || "").trim()
                    } else if (kind === "artifact") {
                      fields.code = String(f.get("code") || "").trim()
                      fields.period = String(f.get("period") || "").trim()
                      fields.description = String(f.get("description") || "").trim()
                    } else if (kind === "exhibit") {
                      fields.start = String(f.get("start") || "").trim()
                      fields.end = String(f.get("end") || "").trim()
                      fields.description = String(f.get("description") || "").trim()
                    } else if (kind === "ticket") {
                      fields.price = String(f.get("price") || "").trim()
                      fields.description = String(f.get("description") || "").trim()
                    } else if (kind === "product") {
                      fields.code = String(f.get("code") || "").trim()
                      fields.price = String(f.get("price") || "").trim()
                      fields.stock = String(f.get("stock") || "").trim()
                      fields.description = String(f.get("description") || "").trim()
                    }



                    try {
                      await adminStore.save(
                        museumId,
                        kind,
                        item ? item.id : "",
                        name,
                        status,
                        fields
                      )

                      setVersion((v) => v + 1)
                      setModalType(null)
                      showNotice(`Đã lưu ${name}.`)
                    } catch (err: unknown) {
                      setModalError(err instanceof Error ? err.message : String(err))
                    }
                  }}
                  className="grid gap-3.5 text-xs"
                >
                  <label className="grid gap-1 font-semibold text-[0.91rem]">
                    Tên
                    <input
                      name="name"
                      type="text"
                      required
                      maxLength={160}
                      defaultValue={item?.name || ""}
                      className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-sm"
                    />
                  </label>

                  {kind === "museum" && (
                    <>
                      <label className="grid gap-1 font-semibold text-[0.91rem]">
                        Slug
                        <input
                          name="slug"
                          type="text"
                          required
                          defaultValue={item?.fields.slug || ""}
                          className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-sm font-mono"
                        />
                      </label>
                      <label className="grid gap-1 font-semibold text-[0.91rem]">
                        Thành phố
                        <input
                          name="city"
                          type="text"
                          defaultValue={item?.fields.city || ""}
                          className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-sm"
                        />
                      </label>
                      <label className="grid gap-1 font-semibold text-[0.91rem]">
                        Địa chỉ
                        <input
                          name="address"
                          type="text"
                          defaultValue={item?.fields.address || ""}
                          className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-sm"
                        />
                      </label>
                    </>
                  )}

                  {kind === "artifact" && (
                    <>
                      <label className="grid gap-1 font-semibold text-[0.91rem]">
                        Mã danh mục
                        <input
                          name="code"
                          type="text"
                          defaultValue={item?.fields.code || ""}
                          className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-sm font-mono"
                        />
                      </label>
                      <label className="grid gap-1 font-semibold text-[0.91rem]">
                        Niên đại
                        <input
                          name="period"
                          type="text"
                          defaultValue={item?.fields.period || ""}
                          className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-sm"
                        />
                      </label>
                    </>
                  )}

                  {kind === "exhibit" && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="grid gap-1 font-semibold text-[0.91rem]">
                          Ngày bắt đầu
                          <input
                            name="start"
                            type="date"
                            required
                            defaultValue={item?.fields.start || getAdminDay()}
                            className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-sm"
                          />
                        </label>
                        <label className="grid gap-1 font-semibold text-[0.91rem]">
                          Ngày kết thúc
                          <input
                            name="end"
                            type="date"
                            required
                            defaultValue={item?.fields.end || getAdminDay(30)}
                            className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-sm"
                          />
                        </label>
                      </div>

                      <fieldset className="border border-[#d6ddd3] rounded p-3 bg-white">
                        <legend className="text-xs font-semibold px-1 text-[#53685f]">Hiện vật liên kết</legend>
                        <div className="max-h-32 overflow-y-auto space-y-1 mt-1">
                          {adminStore
                            .list(museumId, "artifact")
                            .filter((a) => a.status === "published" || item?.links.includes(a.id))
                            .map((art) => (
                              <label key={art.id} className="flex items-center gap-2 cursor-pointer text-xs">
                                <input
                                  type="checkbox"
                                  name="links"
                                  value={art.id}
                                  defaultChecked={item?.links.includes(art.id)}
                                  className="w-4 h-4"
                                />
                                <span>{art.name} ({art.fields.code || art.id})</span>
                              </label>
                            ))}
                          {!adminStore.list(museumId, "artifact").length && (
                            <span className="text-[#53685f] text-xs">Chưa có hiện vật đã xuất bản.</span>
                          )}
                        </div>
                      </fieldset>
                    </>
                  )}

                  {kind === "ticket" && (
                    <label className="grid gap-1 font-semibold text-[0.91rem]">
                      Giá (VND)
                      <input
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        defaultValue={item?.fields.price || "60000"}
                        className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-sm font-mono"
                      />
                    </label>
                  )}

                  {kind === "product" && (
                    <>
                      <label className="grid gap-1 font-semibold text-[0.91rem]">
                        Mã danh mục (SKU)
                        <input
                          name="code"
                          type="text"
                          required
                          defaultValue={item?.fields.code || ""}
                          className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-sm font-mono"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="grid gap-1 font-semibold text-[0.91rem]">
                          Giá (VND)
                          <input
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            defaultValue={item?.fields.price || "45000"}
                            className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-sm font-mono"
                          />
                        </label>
                        <label className="grid gap-1 font-semibold text-[0.91rem]">
                          Tồn kho
                          <input
                            name="stock"
                            type="number"
                            min="0"
                            step="1"
                            required
                            defaultValue={item?.fields.stock || "10"}
                            className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-sm font-mono"
                          />
                        </label>
                      </div>
                    </>
                  )}

                  <label className="grid gap-1 font-semibold text-[0.91rem]">
                    Mô tả
                    <textarea
                      name="description"
                      rows={2}
                      defaultValue={item?.fields.description || ""}
                      className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-sm resize-y"
                    />
                  </label>

                  <label className="grid gap-1 font-semibold text-[0.91rem]">
                    Trạng thái
                    <select
                      name="status"
                      defaultValue={item?.status || (kind === "ticket" ? "available" : "published")}
                      className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-sm"
                    >
                      {kind === "ticket" ? (
                        <>
                          <option value="available">Đang bán</option>
                          <option value="unavailable">Ngừng bán</option>
                        </>
                      ) : (
                        <>
                          <option value="published">Đã xuất bản</option>
                          <option value="draft">Bản nháp</option>
                          <option value="archived">Đã lưu trữ</option>
                        </>
                      )}
                    </select>
                  </label>

                  {item?.source && (
                    <p className="text-[#53685f] text-xs leading-relaxed p-2.5 bg-[#edf2eb] rounded border border-[#d6ddd3]">
                      Nguồn mẫu Smithsonian · {item.source.code} · {item.source.rights}
                      <br />
                      {item.source.url}
                    </p>
                  )}

                  {modalError && (
                    <div id="form-error" className="text-[#9c3026] text-xs font-semibold">
                      {modalError}
                    </div>
                  )}

                  <footer className="flex items-center justify-end gap-2 pt-3 border-t border-[#d6ddd3]">
                    <button
                      type="button"
                      onClick={async () => {
                        setModalType(null)
                        setModalError(null)
                      }}
                      className="bg-white hover:bg-[#edf2eb] text-[#184c40] border border-[#d6ddd3] px-3.5 py-1.5 rounded text-xs font-semibold cursor-pointer"
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      className="bg-[#184c40] hover:bg-[#143e34] text-white px-4 py-1.5 rounded text-xs font-semibold cursor-pointer"
                    >
                      Lưu
                    </button>
                  </footer>
                </form>
              </div>
            )
          })()}
        </div>
      )}

      {/* MODAL: SOÁT VÉ VÀO CỬA */}
      {modalType === "redeem-ticket" && (
        <div className="fixed inset-0 z-50 bg-[#162b25]/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#d6ddd3] rounded-[8px] p-6 sm:p-7 max-w-[520px] w-[94vw]">
            <h2 className="font-heading text-[1.85rem] leading-tight mb-3 font-normal">Soát vé vào cửa</h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                const code = String(fd.get("code") || "").trim()
                try {
                  await adminStore.redeem(museumId, code)
                  setVersion((v) => v + 1)
                  setModalType(null)
                  showNotice("Đã ghi nhận vào cửa.")
                } catch (err: unknown) {
                  setModalError(err instanceof Error ? err.message : String(err))
                }
              }}
              className="grid gap-3.5"
            >
              <label className="grid gap-1 font-semibold text-[0.91rem]">
                Mã vào cửa
                <input
                  name="code"
                  type="text"
                  required
                  placeholder="SOTA-101"
                  className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-sm font-mono uppercase"
                />
              </label>

              {modalError && (
                <div className="text-[#9c3026] text-xs font-semibold">{modalError}</div>
              )}

              <footer className="flex items-center justify-end gap-2 pt-3 border-t border-[#d6ddd3]">
                <button
                  type="button"
                  onClick={async () => {
                    setModalType(null)
                    setModalError(null)
                  }}
                  className="bg-white hover:bg-[#edf2eb] text-[#184c40] border border-[#d6ddd3] px-3.5 py-1.5 rounded text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="bg-[#184c40] hover:bg-[#143e34] text-white px-4 py-1.5 rounded text-xs font-semibold cursor-pointer"
                >
                  Xác nhận vào cửa
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHI TIẾT ĐƠN HÀNG & THAO TÁC (matching detail() in app.js) */}
      {modalType === "order-detail" && selectedItemId && (
        <div className="fixed inset-0 z-50 bg-[#162b25]/50 flex items-center justify-center p-4">
          {(() => {
            const o = adminStore.queue(museumId).find((x) => x.id === selectedItemId)
            if (!o) return null

            const canCancel = o.status === "confirmed" && (o.kind === "shop" || o.visit > getAdminDay())
            const next =
              o.kind === "shop" && o.paid
                ? (({ confirmed: "shipped", shipped: "completed" } as Record<string, string>)[o.status] || "")
                : ""

            return (
              <div className="bg-white border border-[#d6ddd3] rounded-[8px] p-6 sm:p-7 max-w-[520px] w-[94vw] space-y-3">
                <h2 className="font-heading text-[1.85rem] leading-tight font-normal">{o.id}</h2>

                <div>{renderPill(o.status)}</div>

                <div className="text-sm space-y-1 text-[#202d2a]">
                  <p>
                    {o.lines.map((line, index) => (
                      <span className="block" key={index}>{line.name} × {line.quantity} · {formatVND(Number(line.price))} = {formatVND(Number(line.total))}</span>
                    ))}
                  </p>
                  {o.kind === "ticket" ? (
                    <p className="text-[#53685f]">Ngày tham quan · {o.visit} {o.slot}</p>
                  ) : (
                    <p className="text-[#53685f]">Phí giao hàng · {formatVND(o.fee)}</p>
                  )}
                  <p className="font-semibold">
                    {o.paid ? "Đã thanh toán mô phỏng" : "Chưa thanh toán"} · {formatVND(Number(o.total))}
                  </p>
                  {o.invoiceNumber && <p className="text-xs text-[#53685f]">Hóa đơn chỉ đọc · {o.invoiceNumber}</p>}
                  {o.shipping && <p>{o.shipping}</p>}
                  {o.usedAt && (
                    <p className="text-xs text-[#184c40] font-medium">
                      Đã soát · {new Date(o.usedAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                    </p>
                  )}
                </div>

                {modalError && (
                  <div className="text-[#9c3026] text-xs font-semibold">{modalError}</div>
                )}

                <div className="flex items-center justify-between gap-2 pt-4 border-t border-[#d6ddd3] flex-wrap">
                  <button
                    type="button"
                    onClick={async () => {
                      setModalType(null)
                      setModalError(null)
                    }}
                    className="bg-white hover:bg-[#edf2eb] text-[#184c40] border border-[#d6ddd3] px-3.5 py-1.5 rounded text-xs font-semibold cursor-pointer"
                  >
                    Đóng
                  </button>

                  <div className="flex items-center gap-2">
                    {canCancel && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await adminStore.advance(museumId, o.id, "cancelled")
                            setVersion((v) => v + 1)
                            setModalType(null)
                            showNotice("Đã cập nhật đơn.")
                          } catch (err: unknown) {
                            setModalError(err instanceof Error ? err.message : String(err))
                          }
                        }}
                        className="bg-white hover:bg-[#fee2e2] text-[#991b1b] border border-[#fecaca] px-3.5 py-1.5 rounded text-xs font-semibold cursor-pointer"
                      >
                        Hủy đơn
                      </button>
                    )}

                    {next && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await adminStore.advance(museumId, o.id, next)
                            setVersion((v) => v + 1)
                            setModalType(null)
                            showNotice("Đã cập nhật đơn.")
                          } catch (err: unknown) {
                            setModalError(err instanceof Error ? err.message : String(err))
                          }
                        }}
                        className="bg-[#184c40] hover:bg-[#143e34] text-white px-4 py-1.5 rounded text-xs font-semibold cursor-pointer"
                      >
                        Chuyển sang {ADMIN_STATUS_LABELS[next]}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* MODAL: THÊM TỆP MEDIA MÔ PHỎNG */}
      {modalType === "upload-media" && (
        <div className="fixed inset-0 z-50 bg-[#162b25]/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#d6ddd3] rounded-[8px] p-6 sm:p-7 max-w-[520px] w-[94vw]">
            <h2 className="font-heading text-[1.85rem] leading-tight mb-2 font-normal">Thêm tệp</h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                const target = String(fd.get("target") || "")
                const file = fd.get("file") as File
                try {
                  await adminStore.upload(museumId, target, file)
                  setVersion((v) => v + 1)
                  setModalType(null)
                  showNotice("Đã thêm tệp.")
                } catch (err: unknown) {
                  setModalError(err instanceof Error ? err.message : String(err))
                }
              }}
              className="grid gap-3.5 text-xs"
            >
              <label className="grid gap-1 font-semibold text-[0.91rem]">
                Đối tượng
                <select
                  name="target"
                  className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-sm"
                  required
                >
                  {adminStore
                    .list(museumId, "artifact")
                    .concat(adminStore.list(museumId, "product"))
                    .map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                </select>
              </label>

              <label className="grid gap-1 font-semibold text-[0.91rem]">
                Ảnh hoặc video
                <input
                  name="file"
                  type="file"
                  required
                  accept=".jpg,.jpeg,.png,.webp,.mp4,.webm"
                  className="border border-[#a8b6aa] rounded p-2 bg-white text-xs"
                />
              </label>

              <p className="text-[#53685f] text-xs">
                Ảnh tối đa 10 MB, video tối đa 10 MB. Tệp được tải lên qua Express.
              </p>

              {modalError && (
                <div className="text-[#9c3026] text-xs font-semibold">{modalError}</div>
              )}

              <footer className="flex items-center justify-end gap-2 pt-3 border-t border-[#d6ddd3]">
                <button
                  type="button"
                  onClick={async () => {
                    setModalType(null)
                    setModalError(null)
                  }}
                  className="bg-white hover:bg-[#edf2eb] text-[#184c40] border border-[#d6ddd3] px-3.5 py-1.5 rounded text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="bg-[#184c40] hover:bg-[#143e34] text-white px-4 py-1.5 rounded text-xs font-semibold cursor-pointer"
                >
                  Thêm tệp
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: XEM VÀ CHỈNH SỬA MEDIA ASSET */}
      {modalType === "asset-detail" && selectedItemId && (
        <div className="fixed inset-0 z-50 bg-[#162b25]/50 flex items-center justify-center p-4">
          {(() => {
            const a = adminStore.media(museumId).find((x) => x.id === selectedItemId)
            if (!a) return null

            return (
              <div className="bg-white border border-[#d6ddd3] rounded-[8px] p-6 sm:p-7 max-w-[520px] w-[94vw] space-y-3">
                <h2 className="font-heading text-[1.85rem] leading-tight font-normal">{a.name}</h2>

                <div className="max-h-[45vh] overflow-hidden flex items-center justify-center bg-[#edf2eb] rounded border border-[#d6ddd3]">
                  {a.mime.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.url} alt={a.name} className="max-w-full max-h-[45vh] object-contain" />
                  ) : (
                    <video src={a.url} controls className="max-w-full max-h-[45vh]" />
                  )}
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const fd = new FormData(e.currentTarget)
                    const seq = Number(fd.get("sequence"))
                    const isPrimary = fd.has("primary")
                    try {
                      await adminStore.updateMedia(museumId, a.id, seq, isPrimary)
                      setVersion((v) => v + 1)
                      setModalType(null)
                      showNotice("Đã lưu tệp.")
                    } catch (err: unknown) {
                      setModalError(err instanceof Error ? err.message : String(err))
                    }
                  }}
                  className="grid gap-3 text-xs"
                >
                  <label className="grid gap-1 font-semibold text-[0.91rem]">
                    Thứ tự
                    <input
                      name="sequence"
                      type="number"
                      min="0"
                      step="1"
                      required
                      defaultValue={a.sequence}
                      className="border border-[#a8b6aa] rounded px-2.5 py-1.5 bg-white text-sm font-mono"
                    />
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                    <input
                      name="primary"
                      type="checkbox"
                      defaultChecked={a.primary}
                      className="w-4.5 h-4.5"
                    />
                    <span>Tệp chính</span>
                  </label>

                  {modalError && (
                    <div className="text-[#9c3026] text-xs font-semibold">{modalError}</div>
                  )}

                  <footer className="flex items-center justify-between gap-2 pt-3 border-t border-[#d6ddd3]">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await adminStore.removeMedia(museumId, a.id)
                          setVersion((v) => v + 1)
                          setModalType(null)
                          showNotice("Đã xóa tệp.")
                        } catch (err: unknown) {
                          setModalError(err instanceof Error ? err.message : String(err))
                        }
                      }}
                      className="bg-white hover:bg-[#fee2e2] text-[#991b1b] border border-[#fecaca] px-3.5 py-1.5 rounded text-xs font-semibold cursor-pointer"
                    >
                      Xóa tệp
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          setModalType(null)
                          setModalError(null)
                        }}
                        className="bg-white hover:bg-[#edf2eb] text-[#184c40] border border-[#d6ddd3] px-3.5 py-1.5 rounded text-xs font-semibold cursor-pointer"
                      >
                        Đóng
                      </button>
                      <button
                        type="submit"
                        className="bg-[#184c40] hover:bg-[#143e34] text-white px-4 py-1.5 rounded text-xs font-semibold cursor-pointer"
                      >
                        Lưu
                      </button>
                    </div>
                  </footer>
                </form>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
