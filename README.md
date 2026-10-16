# Pyraxis website

React 19 + TypeScript + Vite + Tailwind v4, deployed on Vercel.

```sh
npm install
npm run dev     # http://localhost:5173
npm run build
```

## Routes

| Path | Who | What |
| --- | --- | --- |
| `/` | everyone | Browser landing page with the 3D printing spotlight and instant quote |
| `/print` | everyone | 3D printing: technology, materials, solutions, quote → WhatsApp |
| `/shop` | everyone | PyKey shop |
| `/login` | everyone | Sign-in for premium customers and staff |
| `/portal` | premium | Instant booking, custom print calculator, order tracking, downloads, account |
| `/admin` | admin, moderator | Printing & accounts · Assets & downloads · Site settings (admin only) |

## Layout

```
src/api/            data layer: one module per area, written like request handlers
  store.ts          persistence (localStorage + IndexedDB for files) — the only file to swap for a real backend
  auth.ts           sessions, password hashing, requireActor(permission) guard
  permissions.ts    role → permission map
  public.ts         guest endpoints (config, public downloads)
  portal.ts         premium self-service endpoints
  admin/*.ts        staff endpoints (orders, accounts, coupons, templates, assets, analytics, settings)
src/lib/pricing.ts  pricing matrix + coupon rules (pure, shared by UI and API)
src/lib/files.ts    model upload validation + STL/OBJ measurement
src/features/premium/   premium portal (no admin imports)
src/features/admin/     admin panel (no premium imports)
```

## Pricing

Standard prints are tiered by the order's total weight (grams per piece × quantity):
≤150 g → ₹10/g, ≤250 g → ₹7/g, above → ₹5/g. Keychains are a flat ₹7/g.
Admins can switch between **slab** (whole order at its tier's rate, as published) and
**progressive** (each band at its own rate) under Site settings.

## Important: no server yet

All records live in the visitor's own browser. That makes the portal and admin panel fully
usable for demos and for running the shop from one machine, but:

- accounts, orders and uploads made on one device are **not visible on any other device**;
- role checks run in the browser, so they are **not a security boundary**.

Before real customers use the portal, replace `src/api/store.ts` (and the password hashing in
`auth.ts`) with calls to a backend that stores data and enforces the same permission checks
server-side. The service modules' function signatures are the API contract to implement.

Bootstrap admin login: `admin@pyraxis.local` / `pyraxis-admin` (must be changed at first sign-in
outside `npm run dev`). Dev builds also seed a moderator and a demo premium customer, listed on
the login page.
