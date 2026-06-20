# Goresto — Admin & Super-Admin QA Report

**Date:** 2026-06-20
**Environment:** Production — frontend `https://goresto.in`, API `https://api.goresto.in`
**Method:** Real-user end-to-end testing via Playwright, fresh restaurant created through the public registration flow. Screenshots in `test-artifacts/`.

---

## Test identity & data created (kept for cross-check)

| Item | Value |
|---|---|
| Restaurant | **QA Diner 0620** (`restaurantId: cmqm6wzul000gpngz8jefpnqh`) |
| Admin login | `qa.diner.0620@gmail.com` / `QaTest@12345` — role **Admin** |
| Kitchen PIN | `4321` |
| Menu item | Paneer Tikka — ₹250.00 (category *Starters*) |
| Table | Table 1 (4 seats, Indoor) — has QR |
| Orders | `#hn9ejyrx` (Accepted, admin-created) · `#2dwelwe5` (Pending, placed by customer "Hungry Customer" via table QR) |

Nothing was deleted. Super-admin: `superadmin@goresto.com` / `admin123`.

---

## Issues

| # | Area | Severity | What happened | Repro | Likely root cause | Shot |
|---|---|---|---|---|---|---|
| 1 | Orders (realtime) | **High — FIXED** | Creating one order briefly renders it **twice** (nav badge "2 Orders" for 1 order). Self-heals on reload → 1. | Admin → Orders → Create Order → submit | `src/pages/RestaurantAdminDashboard.jsx` create handler `setOrders(prev => [created, ...prev])` had **no dedup**, racing the socket `onOrderNew` handler. **Fix applied:** added `prev.find(o => o.id === created.id)` guard. | 06 |
| 2 | Tables | **Re-verified — not a bug** | Duplicate table number → server returns **409**. | Tables → Add Table → number `1` (exists) → Create | A `toast.error('Error saving table: …')` *does* fire (`handleSaveTable` catch) — it's transient and was missed during the run. Dialog correctly stays open. No change needed. | 05 |
| 3 | Menu Items | **Low (by design)** | "Dietary Type \*" marked required but selection isn't forced. | Menu Items → Add without picking dietary | Not a data bug: `MenuItemForm` defaults `dietary.type = 'veg'`, so an item always has a valid type. The `*` is cosmetic. Left as-is. | 04 |
| 4 | Analytics | **Medium — FIXED** | "Recent Activity" showed amounts in **`$`** ("Order from … - $250") while the whole app uses **₹**. | Analytics → Recent Activity | `server/services/analytics.service.js:77` hardcoded `$`. **Fix applied:** changed to `₹`. | 09 |
| 5 | Settings (Kitchen PIN) | **Low — FIXED** | A sub-4-digit PIN ("12") was accepted and **silently discarded** on Save (with a misleading "saved" toast). | Settings → Kitchen Display System → PIN `12` → Save | `src/pages/Settings.jsx` dropped invalid PIN with no feedback. **Fix applied:** validate `^\d{4}$` and `toast.warning` + abort save if a non-4-digit PIN was entered. | — |
| 6 | Orders | **Re-verified — not a bug** | Empty order (table, no items). | Create Order → pick table → Create (no items) | `OrderForm.jsx:96-98` already shows `toast.warning('Please add at least one item…')` — transient, missed during the run. No change needed. | — |
| 7 | Forms (global) | **Low** | Empty-form submits (Register, Add Restaurant, Add Menu Item) rely only on **native HTML5 `required`** — no styled MUI inline errors; native bubble clashes with the design. | Submit any empty form | Forms use `required` attr without field-level error rendering on submit. | — |
| 8 | Super Admin | **Low (UX)** | "Add Restaurant" can only **assign an existing** admin — no way to create a new admin login here, so a manually-added restaurant can't get fresh credentials. | Super Admin → Add Restaurant | Form has only name/phone/address/assign-admin (`SuperAdminDashboard.jsx`). | — |
| 9 | Super Admin | **Info (UX)** | A pending registration shows in **both** "Pending Registrations" **and** the "Restaurants" list (as *Pending*) — same entity in two places, potentially confusing. | Super Admin dashboard with a pending reg | Registration and Restaurant are the same record shown by two sections. | 03 |
| 10 | Login | **Info** | Right credentials + wrong role tab → "**Invalid credentials**" (creds are valid, only role is wrong). Acceptable for security but misleading. | Login as Admin account with "Super Admin" tab | Generic auth error. | — |
| 11 | Nav | **Info (UX)** | Settings & Profile open as a **modal** while the sidebar still highlights the previous tab (e.g. Orders). | Click Settings | Settings/Profile are dialogs, not routed views. | — |
| 12 | Tables (QR download) | **Medium — FIXED** | "Download QR Code" worked in Chrome but exported a **low-res 380×510 px** PNG (not HD); pixelated when printed. Also Safari/Firefox risk of blank QR via the SVG→canvas path. | Tables → QR Code → Download QR Code; inspect file | `src/components/QRCodeGenerator.jsx` `handleDownload` hardcoded `qrSize=300`, `padding=40`. **Fix applied:** added `SCALE=4`, scaling canvas/fonts/offsets → now exports **1520×2040 px** HD. | 11 |

---

## What works well (verified)

- **Registration → super-admin approval → restaurant-admin login** full lifecycle.
- **Role-based login**; wrong role and wrong PIN are correctly rejected with messages.
- **CRUD**: Menu item create (incl. new-category hint), Table create, Order create, order status transitions (Pending→Accepted→Start Preparing).
- **Price validation** ("must be greater than 0"); **duplicate table** rejected server-side (409).
- **Public menu**: correctly **gated on table QR** ("table required" + Place Order disabled without `?table=`); cart, quantity, customer order placement.
- **Call Staff** button (table context) and **customer → admin** order propagation with full customer details.
- **Kitchen Display**: PIN gate (wrong = "Invalid PIN", correct = access), live kanban (New/Preparing/Ready).
- **Analytics** computes real figures (orders, revenue ₹500, avg, popular items, status breakdown).
- **Responsive**: sidebar collapses to hamburger at 390px without layout break.
- Landing/login/register pages load with **0 console errors** (only expected 401 on the deliberate wrong-role test).

---

## Enhancement / feedback suggestions

1. **Dedup order state on create** (fixes #1) — guard `setOrders` on create the same way the socket handler does (`if (prev.find(o => o.id === created.id)) ...`).
2. **Consistent API-error surfacing** (fixes #2) — wrap create/update handlers so 409/400/500 always `toast.error(message)`.
3. **Enforce "required" fields in-form** (fixes #3, #5, #6, #7) — add dietary-type, PIN-length, and "≥1 item" to client validation with MUI inline errors instead of native bubbles.
4. **Currency from settings in analytics** (fixes #4) — use the restaurant's currency symbol, not `$`, in `analytics.service.js`.
5. **Bill generation discoverability** — during testing there was **no reachable "Generate Bill"** from the Billing tab or from an order (clicking an order opens *Edit*). Add an explicit "Generate Bill" action (likely for served/completed orders). *Billing generation, discounts, split-payment, and thermal/A4 invoices could not be exercised.*
6. **Super-admin: create-admin-on-add** — allow entering new admin email/password when manually adding a restaurant (#8).
7. **Registration hardening** — add password-strength meter and phone/email format checks (currently only `required`).
8. **Pending registration UX** (#9) — hide pending entries from the Restaurants list (or visually merge) to avoid the duplicate appearance.

---

## Coverage gaps (not exercised this pass)

- **Billing**: bill generation / discount presets / split payment / thermal & A4 invoices (generate action not discoverable).
- **Staff** create/edit and **Profile** save forms (forms exist; not driven end-to-end).
- **Image uploads** (menu/staff/profile) and the non-image-file rejection path.
- **Menu Preview** tab.
- **Delete flows** on sub-items — intentionally **not run** to preserve data for your cross-check (per instructions).
