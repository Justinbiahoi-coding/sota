# Auth Guide (Demo) — Museum Management System

How authentication and authorization work in the **application-first** Express backend with Supabase Auth and Postgres persistence. Endpoint shapes belong in `docs/api-contract.md`; schema details belong in `docs/database-design.md`.

## 1. Principles

1. **Authentication = Supabase Auth. Authorization & business logic = Express middleware + services.** Supabase Auth handles sign-up, login, password recovery, and JWT issuance; Express enforces all permissions and business rules on every API route. Postgres stores roles/memberships and domain data.
2. **Clients talk to Supabase Auth for sessions, and to Express (`/api/v1/*`) for application data.** Clients send `Authorization: Bearer <access_token>` to Express and never call PostgREST (`/rest/v1`) directly.
3. **Roles are stored in Postgres (`user_roles`, `museum_admins`), not in the JWT.** Express queries them per request so role/membership changes or revocations apply immediately.
4. **Never trust client-supplied identity or privileged fields.** `user_id` always comes from the verified Supabase Auth user, never from request body/query.
5. **Application-side idempotent user provisioning.** Express provisions `public.users` and `user_roles(normal_user)` with `ON CONFLICT DO NOTHING` on the user's first authenticated request (`ensureUserProvisioned`), rather than relying on a DB signup trigger.

## 2. Roles

| Role | Granted by | Scope |
|---|---|---|
| `normal_user` | Express provisioning on first authenticated request | Own profile, carts, orders, invoices |
| `admin_user` | `super_admin` (SQL) | Managed museums, and only while `museum_admins.status = 'active'` |
| `super_admin` | SQL only (first row inserted manually) | Everything |

- `admin_user` alone grants nothing. Management requires **both** the `admin_user` role and an `active` `museum_admins` row (`canManageMuseum(userId, museumId)`).
- `super_admin` is not self-service. Never expose an endpoint to grant it from the app.
- Revoking a membership takes effect on the very next Express request.
- Membership rows are reused on re-assignment; no history is kept.

## 3. Backend (Express + Postgres)

- **Verify tokens via Supabase Auth:** `requireAuth` extracts `Authorization: Bearer <token>` and validates it with `supabase.auth.getUser(token)`. Missing, expired, or invalid tokens return `401`.
- **Single authorization helper module:** Centralize `isSuperAdmin(userId)` and `canManageMuseum(userId, museumId)` in one auth/permission module used by all middleware and services. Do not scatter ad-hoc role queries across route handlers.
- **Do not write to `auth.users` from Express.** Supabase Auth owns `auth.users`. Application profile data lives in `public.users`.
- **Profiles:** only `display_name` and `phone` are updatable via `PATCH /api/v1/me`. Ignore or reject any other fields (`id`, timestamps, roles).
- **Orders, items, invoices, payments, totals, and `entry_code`s** are written only by Express transactional services (`db.transaction(...)`). Never accept totals, `shipping_fee`, `payment_status`, or `entry_code` from clients.
- **Invoices are immutable** — expose read-only endpoints only; never add update/delete routes.
- **Secrets stay on the server:** `DATABASE_URL` and any `SUPABASE_S3_*` / `SUPABASE_SECRET_KEY` credentials exist only in server `.env`, never in frontend config.
- **Admin provisioning** is handled via administrative CLI scripts or SQL seeds: use `npm run admin:create-super` for super admins, `npm run admin:create` for new museum admins, and `npm run admin:grant` to promote existing users. There is no client-facing API endpoint for provisioning privileged roles in this demo.

## 4. Frontend

- Create one Supabase client with the publishable key solely for **Auth** (`signUp`, `signInWithPassword`, `signOut`, `resetPasswordForEmail`, `onAuthStateChange`).
- **Calling Express:** attach `Authorization: Bearer <session.access_token>` to authenticated requests against Express (`/api/v1/*`). On `401`, refresh session or sign out and redirect to login.
- **Role-aware UI:** call `GET /api/v1/me` to fetch `roles` and active `managed_museums` on login/focus/reload. Route guards are UX only; Express enforces actual permissions and returns `403` when denied.
- **Admin UI is scoped to a museum.** Pick the museum first, then call museum-scoped `/api/v1/admin/...` endpoints.
- **Fake payment is server-side.** The client calls the checkout/purchase endpoint and renders the returned order + invoice.

## 5. Typical flows

1. **Sign up / sign in** — Frontend authenticates with Supabase Auth; gets `access_token`.
2. **Browse catalog as anonymous visitor** — Frontend calls public `GET /api/v1/museums`, etc. without a token; Express returns only `published` museums and their published/available children.
3. **Buy tickets / checkout** — Frontend calls `POST /api/v1/ticket-orders` or `POST /api/v1/carts/:cartId/checkout` with Bearer token; Express validates, computes totals, runs fake payment, and writes order + invoice in a transaction.
4. **Manage a museum** — `super_admin` grants `admin_user` and an `active` membership in SQL; the admin signs in via Supabase Auth and calls `/api/v1/admin/...` routes.
5. **Redeem an entry code** — Museum admin calls `POST /api/v1/admin/ticket-orders/redeem`; Express verifies `canManageMuseum()`.
6. **Sign out** — Frontend calls `supabase.auth.signOut()` and clears local user/role state.

## 6. Checklist

- [ ] No `DATABASE_URL`, `service_role`, or S3 secrets in the frontend or any public config.
- [ ] Every protected Express route verifies the Supabase JWT and enforces ownership or `canManageMuseum()` / `isSuperAdmin()`.
- [ ] Public catalog routes enforce `museums.status = 'published'` so a published artifact inside a draft museum is never exposed.
- [ ] No endpoint allows clients to set `user_id`, `roles`, `total_amount`, `shipping_fee`, `payment_status`, or `entry_code`, or modify/delete invoices.
- [ ] Test as anonymous, `normal_user`, `admin_user`, and `super_admin`; confirm `admin_user` loses access immediately when `museum_admins.status` is revoked.
