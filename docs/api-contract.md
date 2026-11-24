# API Contract (Demo) — Museum Management System

A traditional **application-first** Express.js + TypeScript server owns the HTTP API (`/health`, `/api/v1/*`), all business logic, validation, authorization/RBAC, user provisioning, and orchestration via Drizzle ORM over `DATABASE_URL`. Postgres stores application data, **Supabase Auth** (`/auth/v1`) handles user authentication, and **Supabase Storage** holds uploaded media objects (see `docs/auth-guide.md` and `docs/database-design.md`).

> Keep this contract updated when adding or changing Express routes. Do not expose direct PostgREST (`/rest/v1`) data endpoints to clients.

## 0. Operational endpoints

| Method | Path | Who | Returns |
|---|---|---|---|
| GET | `/health` | public | `200` `{status, uptime, timestamp, supabase}` (`supabase` is `"configured"` or `"not_configured"`) |

## 1. Conventions

### Base URL and headers

Base: `<express-server-origin>/api/v1` (Auth endpoints are on Supabase: `https://<project-ref>.supabase.co/auth/v1`).

| Header | Required | Value |
|---|---|---|
| `Authorization` | Protected routes | `Bearer <supabase_access_token>` |
| `Content-Type` | JSON writes | `application/json` (`multipart/form-data` for media uploads) |

### Pagination & Query parameters

- List endpoints accept `limit` (default `24`, max `100`) and `offset` (default `0`).
- Responses wrap collections consistently as `{ data, pagination: { limit, offset, total } }` and single resources as `{ data }`.

### Data formats & Errors

- IDs are UUIDs; timestamps are ISO 8601 UTC; dates are `YYYY-MM-DD`; money is a decimal string/number in VND (`numeric(12, 2)`).
- Missing or invalid token → `401`; insufficient role or museum membership → `403`; missing or invisible resource → `404`; unique/FK conflict → `409`; validation or business rule failure → `400`; payload or file size exceeds limit → `413`.
- Error shape: `{"error": {"code": "<error_token>", "message": "<human_readable_message>", "details"?: ...}}`. Clients branch on `error.code`, not on `error.message`.
- Clients never send `user_id`, `created_at`, `updated_at`, `created_by`, generated columns (`line_total`, `total_amount`), `payment_status`, `entry_code`, or `shipping_fee`.

## 2. Auth endpoints (Supabase Auth)

Clients use `@supabase/supabase-js` (with the publishable key) against Supabase GoTrue (`/auth/v1`):

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/auth/v1/signup` | `{email, password}` | User, or session if email confirmation is disabled |
| POST | `/auth/v1/token?grant_type=password` | `{email, password}` | `{access_token, refresh_token, expires_in, user}` |
| POST | `/auth/v1/token?grant_type=refresh_token` | `{refresh_token}` | Same session shape |
| GET | `/auth/v1/user` | — | Current user |
| PUT | `/auth/v1/user` | `{password}` | Updated user |
| POST | `/auth/v1/logout` | — | `204` |
| POST | `/auth/v1/recover` | `{email}` | `200` |
| GET | `/auth/v1/verify?token=...&type=signup\|recovery` | — | Email-link redirect |

- Express lazily and idempotently provisions `public.users` and `user_roles(normal_user)` on the first authenticated request (`ensureUserProvisioned`), without relying on a DB signup trigger.
- Roles are not read from JWT claims; Express checks Postgres on each request so role changes apply immediately.

## 3. Profile, roles, memberships

| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/api/v1/me` | authenticated | Returns own profile (`id`, `display_name`, `phone`), `roles`, and active `managed_museums` (`museum_id`, `status`) |
| PATCH | `/api/v1/me` | authenticated | Body: `{display_name?, phone?}` only |
| GET | `/api/v1/admin/users` | `super_admin` | List all user profiles with roles and museum memberships |

No API endpoints exist to create/update/delete `user_roles` or `museum_admins`; provisioning is SQL (see `docs/auth-guide.md` §3). `users` has no delete endpoint.

## 4. Catalog — public reads

No token required. Only `published` museums and their `published` / available children are returned.

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/museums` | List published museums (`limit`, `offset`, ordered by `created_at` desc) |
| GET | `/api/v1/museums/:slug` | Published museum detail with embedded published `artifacts`, `souvenir_products`, and available `ticket_types` |
| GET | `/api/v1/museums/:museumId/artifacts` | Published artifacts of a published museum |
| GET | `/api/v1/artifacts/:id` | Published artifact detail (requires parent museum `published`) |
| GET | `/api/v1/museums/:museumId/products` | Published souvenir products of a published museum |
| GET | `/api/v1/products/:id` | Published souvenir product detail (requires parent museum `published`) |
| GET | `/api/v1/museums/:museumId/ticket-types` | Available ticket types of a published museum |
| GET | `/api/v1/media` | Query: `entity_type=artifact\|souvenir&entity_id=:id`; ordered by `sort_order` asc (requires parent museum & entity `published`) |

A published artifact or product inside a `draft` or `archived` museum returns `404` publicly.

## 5. Catalog & media — admin reads and writes

`admin_user` requires an `active` `museum_admins` row for the target museum; `super_admin` is unrestricted.

Admin reads include `draft` and `archived` rows for managed museums:

| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/api/v1/admin/museums` | admin | Managed museums (all statuses); `super_admin` sees all |
| POST | `/api/v1/admin/museums` | `super_admin` | `{name, slug, description?, address?, city?, cover_image_path?, status?}` |
| PATCH | `/api/v1/admin/museums/:id` | `super_admin` / museum admin | Mutable museum fields, including `status` |
| GET | `/api/v1/admin/museums/:museumId/artifacts` | admin | All statuses |
| POST | `/api/v1/admin/museums/:museumId/artifacts` | admin | `{name, description?, period?, inventory_code?, status?}` |
| PATCH | `/api/v1/admin/artifacts/:id` | admin | Same fields; `status` used to publish/archive |
| GET | `/api/v1/admin/museums/:museumId/products` | admin | All statuses, including `stock_quantity` |
| POST | `/api/v1/admin/museums/:museumId/products` | admin | `{name, description?, sku?, price, stock_quantity?, status?}` |
| PATCH | `/api/v1/admin/products/:id` | admin | Including `price`, `stock_quantity`, `status` (restock) |
| GET | `/api/v1/admin/museums/:museumId/ticket-types` | admin | Including unavailable types |
| POST | `/api/v1/admin/museums/:museumId/ticket-types` | admin | `{name, description?, price, is_available?}` |
| PATCH | `/api/v1/admin/ticket-types/:id` | admin | Including `price`, `is_available` |
| POST | `/api/v1/admin/media` | admin | `multipart/form-data`: `file` + `{museum_id, entity_type, entity_id, media_type, sort_order?, is_primary?}` |
| PATCH | `/api/v1/admin/media/:id` | admin | `{sort_order?, is_primary?}` |
| DELETE | `/api/v1/admin/media/:id` | admin | Deletes `media_assets` row + best-effort Storage object deletion |

- Catalog rows (`museums`, `artifacts`, `souvenir_products`, `ticket_types`) are archived via `PATCH` (`status: "archived"` or `is_available: false`), never hard-deleted. No DELETE endpoints exist for them.
- `museum_id` cannot be changed after creation. `created_by` is set server-side from the authenticated user.
- Price/stock edits do not affect existing orders or their snapshots.

## 6. Carts

All cart routes require authentication and operate only on the caller's own carts.

| Method | Path | Body / Query | Notes |
|---|---|---|---|
| GET | `/api/v1/carts` | — | Own `active` carts (one per museum) with `items` and product summary |
| POST | `/api/v1/carts` | `{museum_id}` | Creates active cart; duplicate active cart for same museum → `409` |
| PATCH | `/api/v1/carts/:id` | `{status: "abandoned"}` | Only `"abandoned"` is client-settable; `"converted"` is set by checkout |
| DELETE | `/api/v1/carts/:id` | — | Own non-`converted` cart (`converted` carts kept for order history) |
| POST | `/api/v1/carts/:cartId/items` | `{product_id, quantity}` | Duplicate product in same cart → `409`; product must belong to cart's museum (`400`) |
| PATCH | `/api/v1/carts/:cartId/items/:itemId` | `{quantity}` | Updates quantity (`> 0`) |
| DELETE | `/api/v1/carts/:cartId/items/:itemId` | — | Removes item |

Stock and price are re-checked at checkout, not when adding to the cart.

## 7. Ticket orders & invoices

No direct POST/PATCH/DELETE on invoices or order totals.

| Method | Path | Who | Notes |
|---|---|---|---|
| POST | `/api/v1/ticket-orders` | authenticated | Body: `{museum_id, visit_date, time_slot, items: [{ticket_type_id, quantity}]}`. Creates order + items from current prices, runs fake payment (`confirmed`/`paid`), generates `entry_code`, creates `TKT-` invoice. Returns order with items and invoice. |
| GET | `/api/v1/ticket-orders` | authenticated | Own ticket orders (`limit`, `offset`) |
| GET | `/api/v1/ticket-orders/:id` | owner / museum admin | Order detail with items and invoice |
| POST | `/api/v1/ticket-orders/:id/cancel` | owner / museum admin | Allowed while `confirmed` and before `visit_date` (`Asia/Ho_Chi_Minh`). Sets `cancelled`; no refund. |
| GET | `/api/v1/admin/museums/:museumId/ticket-orders` | admin | Gate list for managed museum (filterable by `visit_date`, `status`) |
| POST | `/api/v1/admin/ticket-orders/redeem` | admin | Body: `{entry_code}`. Requires active membership in order's museum, `status = confirmed`, and `visit_date` = today in `Asia/Ho_Chi_Minh`. Sets `used` / `used_at`. |

`POST /api/v1/ticket-orders` error codes: `museum_not_available`, `ticket_type_unavailable`, `invalid_time_slot`, `invalid_visit_date`, `invalid_items`.

`POST /api/v1/admin/ticket-orders/redeem` error codes: `entry_code_not_found`, `not_museum_admin`, `order_not_confirmed`, `wrong_visit_date`, `already_used`.

`POST /api/v1/ticket-orders/:id/cancel` error codes: `order_not_found`, `not_owner_or_admin`, `order_not_cancellable`, `visit_date_passed`.

## 8. Shop orders & invoices

| Method | Path | Who | Notes |
|---|---|---|---|
| POST | `/api/v1/carts/:cartId/checkout` | authenticated | Body: `{shipping_name, shipping_phone, shipping_address, shipping_city?}`. Locks cart & products, re-checks published status/stock using current product prices, applies server-side flat `shipping_fee` of 30,000 VND (`30000.00`), decrements stock, runs fake payment (`confirmed`/`paid`), creates `SHP-` invoice, marks cart `converted`. |
| GET | `/api/v1/shop-orders` | authenticated | Own shop orders (`limit`, `offset`) |
| GET | `/api/v1/shop-orders/:id` | owner / museum admin | Order detail with items and invoice |
| POST | `/api/v1/shop-orders/:id/cancel` | owner / museum admin | Allowed while `confirmed` and before `shipped`. Sets `cancelled` and restores `stock_quantity`; no refund. |
| GET | `/api/v1/admin/museums/:museumId/shop-orders` | admin | Fulfillment queue for managed museum (filterable by `status`) |
| PATCH | `/api/v1/admin/shop-orders/:id/fulfillment` | admin | Body: `{status: "shipped" \| "completed"}`. Allows `confirmed → shipped → completed`. |

`POST /api/v1/carts/:cartId/checkout` error codes: `cart_not_found`, `cart_not_active`, `cart_empty`, `product_unavailable`, `out_of_stock`.

`PATCH /api/v1/admin/shop-orders/:id/fulfillment` error codes: `order_not_found`, `not_museum_admin`, `invalid_transition`.

`POST /api/v1/shop-orders/:id/cancel` error codes: `order_not_found`, `not_owner_or_admin`, `order_not_cancellable`, `already_shipped`.

## 9. Storage

Buckets `museum-media` and `souvenir-media` are public. Object keys follow `{museum_id}/{entity_type}/{entity_id}/{random_filename}`.

- Admin uploads go through `POST /api/v1/admin/media` (`multipart/form-data`). Maximum file size is 10 MB (files exceeding limit return `413 payload_too_large`). Express validates museum admin scope, file size, binary signature, MIME type (`image/jpeg`, `image/png`, `image/webp`, `video/mp4`, `video/webm`), and matching extension before uploading to Supabase Storage (or S3-compatible endpoint) and inserting the `media_assets` row.
- Public reads use the bucket public URL (`GET /storage/v1/object/public/{bucket}/{path}`); signed URLs are not used in this demo.

## 10. Not provided

No endpoints for role/membership provisioning, real payments or webhooks, refunds, audit logs, account deletion, capacity checks, configurable slots, multi-museum carts/orders, per-person QR codes, search, or notifications. Catalog rows are never deleted, only archived; invoices are never modified.
