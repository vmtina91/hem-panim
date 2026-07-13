## Design refresh: electric blue accent, Manrope typography, remove "Control Room" subtitle

### 1. Accent color swap (orange → electric blue)
- In `src/styles.css`, replace `--accent: #FF6B35` with `#2563EB` and add `--accent-hover: #38BDF8`. Update any orange-referenced tokens (needle, active markers, focus rings, button hover) to use the new variables. Sweep any remaining `#FF6B35` / orange hex/rgb references in CSS.
- In `src/components/hem/energy.tsx`, change the default `accent = "#FF6B35"` to `#2563EB` and the hard-coded needle `fill="#FF6B35"` (line 174) to `#2563EB`.
- Grep the whole `src/` for any remaining `FF6B35`, `#ff6b35`, `orange`, and update to the blue tokens.

### 2. Typography: Manrope + heavier weights
- Load Manrope (weights 500/600/700) via `<link>` in `src/routes/__root.tsx` head (Tailwind v4 requires stylesheet links, not CSS `@import` for remote fonts).
- In `src/styles.css`:
  - Set base `font-family` to `'Manrope', system-ui, ...`.
  - Set `body` default `font-weight: 500`.
  - Page titles (`h1` / title utilities): `font-weight: 700`, `font-size: 30px`.
  - Section titles (`h2` / section utilities): `font-weight: 600`.
  - Ensure no rule sets weight `<500` (audit `font-light`, `font-normal (400)`, `font-weight: 300/400`).
  - Switch IBM Plex Mono default weight to **500** (Medium) — update `@import`/link to include 500, and set `.mono` / mono utilities to `font-weight: 500`.
- Sweep `src/` for `font-light`, `font-thin`, `font-normal` class usages and bump to `font-medium` (500) minimum.

### 3. Remove "Control Room" subtitle
- `src/components/hem/AppShell.tsx` line 111: remove the `HEM · Control Room` subtitle under the sidebar logo. Keep the PANIM logo; if a text label is needed, show "HEM PANIM".
- `src/routes/bejelentkezes.tsx` lines 145 & 183: remove the two "Control Room" mono subtitles on the login page.

### 4. Verification
- Visit dashboard (`/`), login page (`/bejelentkezes`), and a table-heavy page (`/szabalykatalogus`) via Playwright, screenshot, and confirm:
  - No orange remains; blue accent on active nav marker, primary buttons, ruler needle, focus rings.
  - Titles are 30px bold, body text visibly heavier, mono numbers medium weight.
  - No "Control Room" subtitle anywhere.

### Files touched (approx.)
- `src/styles.css`
- `src/routes/__root.tsx`
- `src/components/hem/AppShell.tsx`
- `src/components/hem/energy.tsx`
- `src/routes/bejelentkezes.tsx`
- Any component using `font-light|thin|normal` or hard-coded orange.