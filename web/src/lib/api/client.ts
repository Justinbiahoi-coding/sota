import { createClient } from "@/lib/supabase/client"
import type { ApiError, ApiResponse, PaginatedResponse } from "./types"

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

async function getToken(): Promise<string | null> {
  const { data } = await createClient().auth.getSession()
  return data.session?.access_token ?? null
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  auth = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  }

  if (auth) {
    const token = await getToken()
    if (token) headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}/api/v1${path}`, { ...init, headers })
  const json = await res.json()

  if (!res.ok) {
    const err = json as ApiError
    throw new ApiClientError(err.error.code, err.error.message, res.status, err.error.details)
  }

  return json as T
}

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message)
    this.name = "ApiClientError"
  }
}

// ── Public catalog ────────────────────────────────────────────────────────────

export const api = {
  museums: {
    list: (params?: { limit?: number; offset?: number }) => {
      const q = new URLSearchParams()
      if (params?.limit) q.set("limit", String(params.limit))
      if (params?.offset) q.set("offset", String(params.offset))
      return request<PaginatedResponse<import("./types").Museum>>(
        `/museums${q.size ? `?${q}` : ""}`,
      )
    },
    get: (slug: string) =>
      request<ApiResponse<import("./types").MuseumDetail>>(`/museums/${slug}`),
    artifacts: (museumId: string, params?: { limit?: number; offset?: number }) => {
      const q = new URLSearchParams()
      if (params?.limit) q.set("limit", String(params.limit))
      if (params?.offset) q.set("offset", String(params.offset))
      return request<PaginatedResponse<import("./types").Artifact>>(
        `/museums/${museumId}/artifacts${q.size ? `?${q}` : ""}`,
      )
    },
    products: (museumId: string) =>
      request<PaginatedResponse<import("./types").SouvenirProduct>>(`/museums/${museumId}/products`),
    ticketTypes: (museumId: string) =>
      request<PaginatedResponse<import("./types").TicketType>>(`/museums/${museumId}/ticket-types`),
  },

  artifacts: {
    get: (id: string) =>
      request<ApiResponse<import("./types").Artifact>>(`/artifacts/${id}`),
  },

  products: {
    get: (id: string) =>
      request<ApiResponse<import("./types").SouvenirProduct>>(`/products/${id}`),
  },

  media: (entityType: "artifact" | "souvenir", entityId: string) =>
    request<PaginatedResponse<import("./types").MediaAsset>>(
      `/media?entity_type=${entityType}&entity_id=${entityId}`,
    ),

  // ── Authenticated ──────────────────────────────────────────────────────────

  me: {
    get: () =>
      request<ApiResponse<import("./types").UserProfile>>("/me", {}, true),
    update: (body: { display_name?: string; phone?: string }) =>
      request<ApiResponse<import("./types").UserProfile>>("/me", {
        method: "PATCH", body: JSON.stringify(body),
      }, true),
  },

  carts: {
    list: () =>
      request<ApiResponse<import("./types").Cart[]>>("/carts", {}, true),
    create: (museumId: string) =>
      request<ApiResponse<import("./types").Cart>>("/carts", {
        method: "POST", body: JSON.stringify({ museum_id: museumId }),
      }, true),
    abandon: (cartId: string) =>
      request<ApiResponse<import("./types").Cart>>(`/carts/${cartId}`, {
        method: "PATCH", body: JSON.stringify({ status: "abandoned" }),
      }, true),
    delete: (cartId: string) =>
      request<void>(`/carts/${cartId}`, { method: "DELETE" }, true),
    addItem: (cartId: string, productId: string, quantity: number) =>
      request<ApiResponse<import("./types").CartItem>>(`/carts/${cartId}/items`, {
        method: "POST", body: JSON.stringify({ product_id: productId, quantity }),
      }, true),
    updateItem: (cartId: string, itemId: string, quantity: number) =>
      request<ApiResponse<import("./types").CartItem>>(`/carts/${cartId}/items/${itemId}`, {
        method: "PATCH", body: JSON.stringify({ quantity }),
      }, true),
    removeItem: (cartId: string, itemId: string) =>
      request<void>(`/carts/${cartId}/items/${itemId}`, { method: "DELETE" }, true),
    checkout: (cartId: string, shipping: import("./types").CheckoutRequest) =>
      request<ApiResponse<import("./types").ShopOrder>>(`/carts/${cartId}/checkout`, {
        method: "POST", body: JSON.stringify(shipping),
      }, true),
  },

  ticketOrders: {
    list: (params?: { limit?: number; offset?: number }) =>
      request<PaginatedResponse<import("./types").TicketOrder>>("/ticket-orders", {}, true),
    get: (id: string) =>
      request<ApiResponse<import("./types").TicketOrder>>(`/ticket-orders/${id}`, {}, true),
    create: (body: import("./types").TicketOrderRequest) =>
      request<ApiResponse<import("./types").TicketOrder>>("/ticket-orders", {
        method: "POST", body: JSON.stringify(body),
      }, true),
    cancel: (id: string) =>
      request<void>(`/ticket-orders/${id}/cancel`, { method: "POST" }, true),
  },

  shopOrders: {
    list: (params?: { limit?: number; offset?: number }) =>
      request<PaginatedResponse<import("./types").ShopOrder>>("/shop-orders", {}, true),
    get: (id: string) =>
      request<ApiResponse<import("./types").ShopOrder>>(`/shop-orders/${id}`, {}, true),
    cancel: (id: string) =>
      request<void>(`/shop-orders/${id}/cancel`, { method: "POST" }, true),
  },
}
