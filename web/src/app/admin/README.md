# Administrator API integration

The Next.js `/admin` area obtains a Supabase Auth session and sends its access token to Express. Roles and active museum memberships come from `GET /api/v1/me` on entry, reload and window focus. An expired token is refreshed once after a 401 response. A denied request clears the administrator cache and requires permission revalidation.

The approved local backend origin is `http://localhost:3000`, configured through `NEXT_PUBLIC_API_URL` in the existing `web/.env`. The existing browser Supabase client uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Configuration values and credentials must refer to the same Supabase project as Express.

Use a different port for Next.js, such as 3001, while Express occupies 3000. The backend CORS allowlist must permit that frontend origin. Run the repository development script only with the permission required by the workspace instructions.

## Connected operations

- Read assigned museums. Create museums as `super_admin` and edit museum details and publication status.
- List, create and update museum artifacts, souvenir products and ticket types through their administrator endpoints.
- Load ticket and shop orders with pagination, then fetch order details for actual line quantities, snapshots and invoice numbers.
- Redeem an entry code through Express. Cancel eligible orders and advance shop fulfillment through confirmed, shipped and completed.
- Upload media with multipart form data, update its ordering or primary status and delete it. Express currently limits both images and videos to 10 MB.

Order totals, line prices and invoice identifiers are displayed from server responses. The interface never supplies payment state, user identity, order totals or invoice fields in a mutation.

## Backend coverage limits

Exhibition management and Smithsonian import controls are unavailable because their APIs are absent from the backend contract. Exhibition reporting is disabled.

The backend has media-write endpoints and a public catalog media-read endpoint. It has no administrator media-list endpoint. The administrator library therefore shows media uploaded during the current page session. Refreshing the page clears that local list while files remain in storage. A future administrator media-list endpoint is needed to browse existing files for draft or archived entities.

Statistics aggregate paid ticket orders returned by Express, using the complete paginated order list and server totals. They are grouped by order creation date in Asia/Ho_Chi_Minh because the API has no payment timestamp or statistics endpoint. The figures represent paid ticket-order amounts.

## Verification

From `web/`, run the focused checks.

```powershell
node --test tests/admin-api.test.mjs
.\node_modules\.bin\tsc.cmd --noEmit --incremental false
.\node_modules\.bin\eslint.cmd src/app/admin
```

The API checks use controlled responses against the actual administrator transport and store. They cover authorization, request mapping, order response shapes, server totals, multipart upload, session refresh and stale responses after sign-out. Live verification requires a running Express service and an existing account with backend-granted administrator membership.
