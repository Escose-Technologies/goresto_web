# Goresto — UI/UX Improvement Audit

_Generated from a full scan of the front-end (`src/`). Findings are grouped by
theme and ordered by impact. Each item lists the problem, where it lives, and a
concrete recommendation. Nothing here is changed yet — this is the plan._

---

## TL;DR — the 3 things you actually noticed

1. **Inputs have a "double" shadow/glow on focus.** A global `input:focus` rule
   in `global.css` paints a blue glow on *every* `<input>`, including the one
   MUI renders inside `<TextField>`. MUI already draws its own focus outline, so
   you get two focus treatments stacked. → **Stop the global input styles from
   leaking into MUI.** (§2)
2. **Buttons don't match.** There are **four** different button systems in use at
   once (MUI `<Button>`, custom `TouchButton`, raw `<button className>`, MUI
   `IconButton`). → **Standardize on MUI `<Button>`.** (§3)
3. **Close / cross buttons are all different.** Three implementations:
   Iconify `mdi:close`, hand-drawn inline `<svg>` X, and a literal `×` character —
   different sizes, hit-areas, and positions. → **One `<CloseButton>` component.** (§4)

---

## 1. Foundations: duplicated / competing design systems

There are **two** token sources and they are maintained separately:

- `src/theme/` — the real MUI theme (`createTheme`, palette, typography, shadows,
  `componentOverrides.js`). This is good and well-structured.
- `src/styles/theme.js` + `src/styles/global.css` `:root` vars — a **second,
  parallel** token set (colors, spacing, radius, shadows, z-index, fonts) used
  only by hand-written CSS files.

**Problems**
- Same values defined twice (e.g. primary `#3385F0`, radius scale, shadow scale).
  They happen to agree today; they will drift.
- Three different shadow scales: `theme/shadows.js`, `styles/theme.js.shadows`,
  `global.css --shadow-*`.
- Dark-mode tokens exist in `global.css` (`[data-theme="dark"]`) but the MUI theme
  has **no dark palette**, so dark mode is half-wired and effectively dead.

**Recommendation**
- Treat `src/theme/` (MUI) as the single source of truth.
- Reduce `global.css`/`styles/theme.js` to only what non-MUI pages truly need
  (the public menu, kitchen display), and have those read from the MUI theme where
  possible.
- Either implement a real MUI dark theme or remove the dead dark tokens.

---

## 2. Inputs — the shadow/glow problem (root cause)

`src/styles/global.css` resets bare elements and these rules **bleed into MUI**,
because MUI renders real `<input>`, `<button>`, `<select>` elements:

```css
/* global.css */
input, textarea, select {            /* lines ~174 */
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: ...; background: ...;
  min-height: 44px;                  /* fights MUI size="small" (1.625rem) */
}
input:focus, textarea:focus, select:focus {   /* lines ~208 */
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(51,133,240,0.15);  /* ← the glow you see */
}
```

MUI `<OutlinedInput>` already styles the border via `.MuiOutlinedInput-notchedOutline`
and changes border width on focus (`componentOverrides.js` lines 80–105). So an MUI
field gets **both** the notched outline *and* the global glow + a conflicting
`min-height: 44px` and extra border/padding on the inner input.

**Recommendation**
- Scope the global element resets so they don't touch MUI. Two clean options:
  1. Prefix them — only apply to bare inputs inside non-MUI containers
     (e.g. `.public-menu input`, `.kds input`), **not** globally; or
  2. Exclude MUI: `input:not(.MuiInputBase-input)` … (quick, but brittle).
- Remove the global `input:focus { box-shadow }` glow entirely; let MUI own focus.
- Drop `min-height: 44px` from the global `input` rule (keep touch-targets via MUI
  sizing instead).

**Also:** read-only fields use ad-hoc `sx={{ '& .MuiOutlinedInput-root': { bgcolor:
'grey.50' } }}` in several places (Settings, OrderForm, MenuItemForm). Make a single
`readOnlyFieldSx` (or a `<ReadOnlyField>` wrapper) so they look identical everywhere.

---

## 3. Buttons — four systems, pick one

| System | Where | Count |
|---|---|---|
| MUI `<Button variant="contained/outlined">` | most dashboard screens | ~27 files |
| Custom `TouchButton` (`components/ui/TouchButton.jsx` + own CSS) | billing, public | 7 files |
| Raw `<button className="...">` | MenuPreview, BillPreview, GenerateBillModal, BillCard, DiscountPresetManager, PublicMenu, KitchenDisplay | 7 files |
| MUI `IconButton` | everywhere | many |

Each has its own radius, height, hover, disabled, and color logic → they visibly
don't match. The MUI theme already gives `<Button>` good defaults
(`componentOverrides.js` 38–61: no-uppercase, 600 weight, radius 8, sane padding/sizes).

**Recommendation**
- Standardize on MUI `<Button>` (+ `IconButton`) as the default everywhere.
- For the billing/public components on raw `<button>`/`TouchButton`: either migrate
  them to MUI `<Button>`, or — if `TouchButton`'s big touch targets are wanted for
  POS/tablet — keep **one** `TouchButton` but reimplement it as a thin wrapper over
  MUI `<Button size="large">` so styling stays centralized.
- Delete the raw `<button className>` styling in favor of the above.

---

## 4. Close / cross buttons — standardize

Three implementations today:
- Iconify `mdi:close` — `StaffForm.jsx:223`, `MenuItemForm.jsx:439`,
  `OrderForm.jsx:249`, `OrdersSection.jsx:181`, `RestaurantProfileForm.jsx:164/214`,
  `SuperAdminDashboard.jsx:277`, plus Settings (removed when it became a tab).
- Hand-drawn inline `<svg>` X — `BillPreview.jsx:156`, `DiscountPresetManager.jsx:179`,
  `GenerateBillModal.jsx:237`.
- Literal `×` character — `SplitPaymentEditor.jsx:75`, `MenuPreview.jsx:188`.

They differ in icon size (13–22px), hit area, hover, and placement.

**Recommendation**
- Create `components/ui/CloseButton.jsx` = MUI `IconButton` + one icon
  (`material-symbols:close-rounded`), fixed 40px target, consistent top-right
  positioning and `aria-label="Close"`.
- Replace all three variants with it.

---

## 5. Iconography — mixed sets

Icons come from three sources: Iconify **Material Symbols**, Iconify **MDI**
(`mdi:*`), and **hand-rolled inline SVGs** (close, print, download, chevrons in
BillPreview). Different families = different stroke weights and metrics.

**Recommendation**
- Pick one Iconify set (Material Symbols rounded is already the majority) and map
  all `mdi:*` + inline SVGs to it. Centralize common ones in an `icons.js` map.

---

## 6. Border-radius drift

`sx={{ borderRadius: N }}` values found across the app: `0,1,2,3,4,6,8`.
Note MUI multiplies this by `shape.borderRadius` (8px), so `borderRadius: 8`
= **64px** — almost certainly a mistake where someone meant 8px. Cards are 12,
Paper 8, Settings panel uses 3 (=24px), chips 6.

**Recommendation**
- Define 2–3 named radii (e.g. control = 8, card = 12, pill = 999) and use those.
- Audit every `borderRadius: 8` in `sx` — they're likely meant to be `1` (8px).

---

## 7. Backgrounds & elevation

- `body` paints a gradient (`global.css:138` `linear-gradient(135deg,#F9FAFB,#F3F4F6)`)
  while the dashboard fills with `background.default`. Two competing canvases.
- Shadows are inconsistent: MUI `Dialog` has a custom soft shadow, Cards are flat
  (border only), but several `sx` blocks add ad-hoc `boxShadow: '0 20px 60px ...'`
  (e.g. staff-call cards). Pick an elevation scale and reuse it.

**Recommendation**
- Decide one app background (flat `grey.50` is cleanest for a SaaS dashboard) and
  remove the body gradient for authed screens.
- Replace ad-hoc `boxShadow` strings with `theme.shadows[n]`.

---

## 8. Accessibility / focus

- `global.css` `button { outline: none }` kills focus outlines globally; it's
  partly rescued by `:focus-visible` later, but the blanket `outline:none` on
  `button` is risky and can hide keyboard focus on custom buttons.
- Ensure every icon-only button (close, search-clear, collapse) has an
  `aria-label` — several inline SVG/`×` ones don't.

---

## 9. Smaller polish items

- **Toasts:** custom `components/ui/Toast` exists alongside themed MUI `Snackbar`/
  `Alert` overrides — confirm only one is used.
- **Typography:** font scale defined in both `theme/typography` and
  `styles/theme.js.fontSize`. Keep MUI's.
- **Spacing:** mix of `theme.spacing` and literal `px`/`rem` in `sx`. Prefer the
  spacing scale.
- **Select arrow:** custom SVG arrow in `global.css` applies to native selects and
  can double up with MUI `Select`'s own arrow on any bare `<select>`.

---

## Suggested order of work

1. **§2 input bleed** — biggest visible win, low risk (CSS scoping only).
2. **§4 CloseButton** — quick, high consistency payoff.
3. **§3 buttons** — standardize, retire `TouchButton`/raw buttons.
4. **§6 radius** + **§7 backgrounds/shadows** — visual coherence.
5. **§1 token consolidation** + **§5 icons** — larger cleanup, do incrementally.
6. **§8 a11y** — fold into the above as you touch each component.

## Optional: component libraries to lift the visual bar
If you want a more modern look while staying on MUI: **MUI Joy UI** (softer, same
API), **Tremor** (analytics cards/charts for the Analytics + Billing stats), or
copy-paste motion components from **Aceternity/Magic UI** for the landing page.
These layer on top of the cleanup above — fix the foundations first.
