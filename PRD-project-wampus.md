# PRD — Project Wampus: Three Feature Patches
**Status:** Draft  
**Prepared for:** Project Wampus dev team  
**Scope:** Activities Page, Stripe Checkout, Delivery Permissions + Invite-Only Accounts

---

## Table of Contents
1. [Feature 1 — Volunteer / Activities Page](#feature-1)
2. [Feature 2 — Stripe Checkout for Merch Shop](#feature-2)
3. [Feature 3 — Delivery Logging Permissions + Invite-Only Accounts](#feature-3)
4. [Cross-Cutting Concerns](#cross-cutting)
5. [Open Dependencies & Blockers](#blockers)
6. [Suggested Implementation Order](#order)

---


<a name="feature-1"></a>
## Feature 1 — Volunteer / Activities Page

### Goal
Replace the no-op "Volunteer" button with a read-only Activities page that lists upcoming events (meetings, food drives, etc.) and shows a calendar view at the bottom. Admins and Owners can create and manage events through the existing admin panel.

### Non-Goals
- No RSVP or sign-up flow for events (read-only in this scope).
- No public calendar embed (e.g. Google Calendar sync) — all event data lives in the app DB.
- No attendee tracking.

### Database Changes

Add one new table to Supabase `public` schema:

```sql
CREATE TABLE public.events (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  title       text NOT NULL,
  description text,
  location    text,
  event_date  timestamptz NOT NULL,
  "All event_date values are stored in UTC. The frontend must convert to the user's local timezone for display."
  event_type  text,      "event_type must be one of ['general_meeting', 'food_drive', 'other']. Enforce with a CHECK constraint or validate in the controller before insert."
  created_by  uuid REFERENCES auth.users(id)
);
```

**RLS Policies:**
- `SELECT`: public (anyone can read, consistent with the rest of the site's open-read pattern).
- `INSERT / UPDATE / DELETE`: only users whose `user_roles.role` is `ADMIN` or `OWNER`.

```sql
-- Public read
CREATE POLICY "Anyone can read events"
  ON public.events FOR SELECT USING (true);

-- Admin/Owner write
CREATE POLICY "Admins and Owners can manage events"
  ON public.events FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles
      WHERE role = ANY(ARRAY['ADMIN'::app_role, 'OWNER'::app_role])
    )
  );
```

### Backend Changes

**New route file:** `pjw-backend/src/routes/eventsRoutes.js`  
**New controller file:** `pjw-backend/src/controllers/eventsController.js`

Endpoints:

| Method | Path | Auth required | Description |
|--------|------|---------------|-------------|
| `GET` | `/api/events` | None | List all events, ordered by `event_date ASC`. Support optional `?upcoming=true` filter to return only future events. Support ?limit (default 20) and ?offset (default 0) query params. ?upcoming=true can be combined with both.|
| `GET` | `/api/events/:id` | None | Get single event. |
| `POST` | `/api/events` | ADMIN or OWNER token | Create event. Body: `{ title, description?, location?, event_date, event_type? }`. |
| `PUT` | `/api/events/:id` | ADMIN or OWNER token | Update event fields. |
| `DELETE` | `/api/events/:id` | ADMIN or OWNER token | Delete event. |

Auth enforcement in write endpoints: decode the Bearer token from the `Authorization` header using the Supabase admin client, look up `user_roles` for the resolved `user_id`, and return `403` if the role is not `ADMIN` or `OWNER`. (This is the same pattern that should be used consistently across all gated routes — see Feature 3.)

Mount in `src/server.js`:
```js
const eventsRoutes = require('./routes/eventsRoutes');
app.use('/api/events', eventsRoutes);
```

### Frontend Changes

**New page:** `pjw-frontend/src/pages/Activities.tsx`

Layout:
1. **Hero / header** — page title ("Get Involved") and a short tagline.
2. **Event cards list** — one card per event returned by `GET /api/events?upcoming=true`. Each card shows: title, date/time, location, event type badge, description.
3. **Calendar widget** — at the bottom, render a monthly calendar (use `react-calendar` or similar lightweight library). Highlight dates that have events. Clicking a highlighted date filters the card list to show only events on that day. If multiple events share a date, all are shown.

Add `getEvents()` to `publicApi.ts`:
```ts
export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;   // ISO string
  event_type: string | null;
}

export async function getEvents(upcomingOnly = true): Promise<Event[]> {
  const url = upcomingOnly
    ? `${BASE_URL}/api/events?upcoming=true`
    : `${BASE_URL}/api/events`;
  return apiRequest<Event[]>(url);
}
```

**Wire up the Volunteer button:**  
In the router (`App.tsx`), add a route `/activities` pointing to `<Activities />`. Change the Volunteer button's `onClick` (or `href`) to navigate to `/activities`.

**Admin panel additions:**  
In the admin panel (wherever it lives), add an "Events" section with a form to create events and a table to edit/delete existing ones. The form fields map directly to the `POST /api/events` body above. Use the stored auth token (`pjw_auth_token`) as the Bearer token on these write requests.

---

<a name="feature-2"></a>
## Feature 2 — Stripe Checkout for Merch Shop

### Goal
Enable the merch shop to process real purchases, with revenue deposited into the organization's Stripe account.

### Hard Blocker — Org Owner Must Act First

> ⚠️ **This feature cannot be completed by the dev team alone.** The org owner must:
> 1. Create a Stripe account at [stripe.com](https://stripe.com) (free to create).
> 2. In the Stripe dashboard, create a Product and Price for each store item, and copy the resulting `price_id` (format: `price_xxx`) into the `store_items.product_id` column in Supabase for the matching item.
> 3. Provide the dev team with the **Secret Key** (`sk_live_...` for production, or `sk_test_...` for testing). This goes into the backend `.env` as `STRIPE_API_KEY`.
>
> Until these three things are done, no checkout can be wired up. The dev team can do all the code work in parallel against a test Stripe account and swap in the real key when the org is ready.

### Current State of the Backend

`checkoutController.js` already:
- Accepts `{ items: [{ id: number, qty: number }] }`
- Looks up `store_items.product_id` for each item
- Calls `stripe.products.list` and resolves `default_price`
- Creates a Stripe Checkout Session and returns `{ url }`

Two issues must be fixed:

**Issue 1 — ID type mismatch:**  
The frontend (`publicApi.ts`) converts `item_id` (BigInt) to a `string` when building `ShopItemCard`. But `checkoutController` expects `typeof item.id === 'number'` and rejects strings.

Fix options (pick one — recommend Option A):
- **Option A (preferred):** Update `checkoutController.js` to accept string or number, coercing with `BigInt(item.id)` for the DB query. No frontend change needed.
- **Option B:** Keep controller as-is and have the frontend send `parseInt(id)` in the checkout payload. Fragile for large BigInt IDs.

**Issue 2 — Hardcoded `success_url`:**  
`checkoutController` currently hardcodes `success_url: 'http://localhost:3001/'`. This must be replaced with an env var:

```js
// checkoutController.js
success_url: `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/shop?checkout=success`,
cancel_url:  `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/shop`,
```

Do NOT use stripe.products.list. Instead, use the price_id stored in store_items.product_id directly when creating the Stripe Checkout Session line items.

Add `FRONTEND_URL` to `pjw-backend/.env.example`.

### Frontend Changes

**Cart → Checkout flow:**  
The shop page (`Shop.tsx`) and cart state (`cart.tsx`) already exist. What's missing is the checkout button wiring.

1. Add a `checkout()` function to `publicApi.ts`:
```ts
export async function checkout(items: { id: number; qty: number }[]): Promise<{ url: string }> {
  return apiRequest<{ url: string }>(`${BASE_URL}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
}
```

2. In the cart UI, add a "Checkout" button that:
   - Calls `checkout()` with the current cart items (coercing string IDs to `number` if Option B is chosen, or leaving as-is for Option A).
   - On success, redirects the browser to `response.url` (the Stripe-hosted checkout page).
   - Shows a loading state and surfaces an error toast if the call fails.

3. On the `/shop` page, read the `?checkout=success` query param and show a confirmation banner when present.

### No Stripe Connect Needed

Since all revenue goes to one organization (not split across sellers), standard Stripe is sufficient. Stripe Connect (the marketplace model) is overkill here and should not be used.

---

<a name="feature-3"></a>
## Feature 3 — Delivery Logging Permissions + Invite-Only Accounts

### Goal
1. Lock down `POST /api/deliveries` so only authenticated organization members can log a delivery.
2. Replace open account creation with an invite-link system so only people the admin explicitly invites can register.

### 3A — Lock Down Delivery Logging

#### Why it's currently open
`POST /api/deliveries` has no auth check in the controller, and the Supabase RLS policy on `deliveries` only restricts INSERT to authenticated users but does not check role. Anyone with an account (or even no account if hitting the Express endpoint directly) can currently log a delivery.

#### Database (RLS change)

Tighten the INSERT policy on `public.deliveries` (and `public.delivery_logs`) to require a recognized member role:

```sql
-- Drop existing open insert policy
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.deliveries;

-- New: only USER, ADMIN, OWNER roles can insert
CREATE POLICY "Members can insert deliveries"
  ON public.deliveries FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles
      WHERE role = ANY(ARRAY['USER'::app_role, 'ADMIN'::app_role, 'OWNER'::app_role])
    )
  );
```

Apply the same change to `public.delivery_logs`.

Public reads are intentional — anyone can view delivery history for transparency. No change needed to the existing SELECT policies on deliveries or delivery_logs

#### Backend (controller change)

Add a token-verification middleware (see `verifyMember` below) and apply it to the delivery POST route:

```js
// pjw-backend/src/middleware/auth.js  (new file)
const supabase = require('../config/supabase');
const db = require('../db/db');

async function verifyMember(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  const userRole = await db.user_roles.findUnique({ where: { user_id: user.id } });
  if (!userRole) return res.status(403).json({ error: 'Not a member' });
  "If a user_roles row does not exist for a valid user, treat them as unauthorized (403). Do not auto-create the row. All valid members will have a row created at invite signup."

  req.user = { id: user.id, role: userRole.role };
  next();
}

async function verifyAdmin(req, res, next) {
  "verifyAdmin must not nest next() inside an async callback. Implement it as a standalone async function that calls verifyMember's logic directly, then checks role, then calls next() — all in a flat async/await chain."
}

module.exports = { verifyMember, verifyAdmin };
```

Apply in `deliveriesRoutes.js`:
```js
const { verifyMember } = require('../middleware/auth');
router.post('/', verifyMember, deliveriesController.createDelivery);
```

The same `verifyAdmin` middleware should be applied to the new events write routes (Feature 1) and the invite endpoints (below).

---

### 3B — Invite-Only Account Creation

#### Design Decision: Individual Email Invite Links

When an admin wants to bring on a new member, they generate a single-use invite link from the admin panel. The link is emailed to the person (by the admin, manually for now — see note on email below). The recipient clicks the link, lands on a `/join/:token` page, and registers. The token is consumed on use and expires after 72 hours.

This is the standard pattern used by most closed-membership platforms (Notion, Linear, Slack workspace invites, etc.).

#### Database

```sql
CREATE TABLE public.invite_tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid NOT NULL REFERENCES auth.users(id),
  email       text NOT NULL,       -- who the invite is intended for
  expires_at  timestamptz NOT NULL DEFAULT (now() + interval '72 hours'),
  used_at     timestamptz,         -- null = unused
  used_by     uuid REFERENCES auth.users(id)
);
```

**RLS Policies:**
- `INSERT`: ADMIN or OWNER only.
- `SELECT`: ADMIN or OWNER (to list pending invites in the admin panel); also allow the token owner to read their own row by `id` (needed for the public `/join/:token` validation step — match on `id`, not `email`, so no exposure).
- `UPDATE`: backend service role only (to mark `used_at`/`used_by` when consumed).

#### Backend Changes

**New route file:** `pjw-backend/src/routes/inviteRoutes.js`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/invite` | verifyAdmin | Generate an invite token. Body: `{ email: string }`. Creates a row in `invite_tokens`, returns `{ invite_url }` (e.g. `https://yoursite.com/join/:id`). Normalize all email addresses to lowercase before storing and before comparison.|
| `GET` | `/api/invite/:token` | None | Validate a token before the user fills out the signup form. Returns `{ valid: true, email }` or `{ valid: false, reason }`. Checks: token exists, `used_at` is null, `expires_at` is in the future. |
| `GET` | `/api/invite` | verifyAdmin | List all pending (unused, non-expired) invites. |
| `DELETE` | `/api/invite/:token` | verifyAdmin | Revoke an invite before it is used. |

**Modify signup (`authController.signUp`):**

The current open signup must be gated. New flow:

1. Require `invite_token` in the request body: `{ email, password, invite_token }`.
2. Before creating the Supabase user, validate the token: exists, unused, not expired, and `email` matches the token's `email` field.
3. Create the Supabase user (existing logic).
4. Mark the token as used: set `used_at = now()`, `used_by = new user.id`. Token consumption must be atomic. Use a conditional update (WHERE used_at IS NULL) so concurrent requests cannot both consume the same token. If the update affects 0 rows, return 400.
5. Create the `user_roles` row with role `USER` (existing logic).

Validate that the token is unused AND not expired at the time of signup — not just at the validation endpoint. Do not rely solely on the earlier GET /api/invite/:token check.

If any validation step fails, return `400` with a descriptive error.

> **Keep the existing `adminPermissionCode` path:** The current ADMIN signup via `adminPermissionCode` env var can remain as-is. This allows the org owner to bootstrap the first admin account without needing an invite.

#### Frontend Changes

**New page:** `pjw-frontend/src/pages/Join.tsx` (routed to `/join/:token`)

Flow:
1. On mount, call `GET /api/invite/:token`. If invalid/expired, show an error state ("This invite link is invalid or has expired. Contact your admin."). This endpoint must not reveal whether a token exists vs. is expired vs. has wrong email — return a generic { valid: false } for all failure cases to avoid enumeration.
2. If valid, show a registration form pre-filled with the email from the token response (email field is read-only).
3. On submit, call `POST /api/auth/signup` with `{ email, password, invite_token: token }`.
4. On success, redirect to the home page or a welcome screen.

**Admin panel additions:**
- "Invite Member" form: one input for the recipient's email, a "Generate Invite Link" button. "On success, display the generated URL in the admin panel only. The admin copies it from there and shares it however they choose. The link is never sent or stored outside the admin panel."
- Pending invites table: shows email, created date, expiry, and a Revoke button per row.

#### Note on Email Delivery
For now, the system generates the link and the admin copies and sends it themselves (e.g. via their own email client). If automated email sending is desired in the future, Supabase has a built-in email provider or the backend can use a transactional email service (Resend, SendGrid, etc.) — but this is out of scope for the current patch.

---

<a name="cross-cutting"></a>
## Cross-Cutting Concerns

### Auth Middleware Consolidation
All three features introduce or rely on token verification. The `verifyMember` / `verifyAdmin` middleware defined in Feature 3 should be written once in `pjw-backend/src/middleware/auth.js` and used across all routes that need it (events write, invite management, delivery POST). Do not duplicate the token-check logic in individual controllers.

Backend auth checks must be enforced independently of RLS. RLS is a second layer, not the primary gate.

### Prisma Schema Sync
The new `events` and `invite_tokens` tables need to be reflected in `pjw-backend/prisma/schema.prisma`. After adding them, run:
```bash
npx prisma db pull   # sync schema from Supabase
npx prisma generate  # regenerate client
```

Or write explicit Prisma model blocks matching the DDL above.

### Environment Variables
Add to `pjw-backend/.env.example`:
```
FRONTEND_URL=http://localhost:5173
```

---

<a name="blockers"></a>
## Open Dependencies & Blockers

| # | Blocker | Owner | Blocks |
|---|---------|-------|--------|
| 1 | Org owner must create Stripe account and provide `STRIPE_API_KEY` | Org owner | Feature 2 (production) |
| 2 | Org owner must add Stripe Products/Prices and update `store_items.product_id` | Org owner | Feature 2 (production) |

---

<a name="order"></a>
## Suggested Implementation Order

Start with Feature 3 (permissions), because it is a security fix that should not wait — and the auth middleware it creates is reused by Features 1 and 2.

1. **Feature 3A** — `verifyMember` middleware + tighten delivery RLS. Small, self-contained, high impact.
2. **Feature 3B** — Invite token table, invite endpoints, gate signup. This blocks new members from joining until the first admin uses the `adminPermissionCode` path to get in.
3. **Feature 1** — Activities page and events CRUD. Greenfield, no conflicts.
4. **Feature 2** — Stripe checkout wiring. Code can be done now; production deploy waits on org owner.
