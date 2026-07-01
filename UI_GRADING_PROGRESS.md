# UI Grading — Session Continuity File

> Read this file at the start of a new session to resume the `/impeccable` UI quality pass
> with zero context drop. Last updated: 2026-07-01 (end of session 2).

---

## Current Score

**24 / 40** (Acceptable → trending Good)
Last critique: `2026-07-01T04-04-17Z` — snapshot at `.impeccable/critique/2026-07-01T04-04-17Z__frontend-src-pages-home-jsx.md`
Detector: exit 0, zero findings (clean scan). Score held at 24 because remaining gaps are structural, not token-level.

---

## Setup — All One-Time Work Complete (do not re-run)

- `PRODUCT.md` — project root. Strategic context (who/why/register).
- `DESIGN.md` — project root. Full machine-readable design spec (YAML frontmatter + 6 sections).
- `.impeccable/design.json` — schema v2 sidecar. 8 component entries, tonal ramps, shadow/motion tokens.
- `.impeccable/config.json` — suppressed false positives (see table below).
- `.impeccable/critique/2026-07-01T04-04-17Z__frontend-src-pages-home-jsx.md` — critique snapshot.

---

## Suppressed False Positives in `.impeccable/config.json`

Do NOT re-open these — they are intentional design choices the detector flags incorrectly.

| Rule | Value | Reason |
|------|-------|--------|
| `overused-font` | Inter | Committed brand body font |
| `overused-font` | Space Grotesk | Committed brand display font |
| `design-system-color` | `#a87a2f` | Dark end-stop of brass CTA gradient (brass family) |
| `design-system-color` | `#F59E0B` | Leaflet map pin — Commercial category categorical |
| `design-system-color` | `#065F46` | Leaflet map pin — Villa category categorical |
| `design-system-color` | `#6D28D9` | Leaflet map pin — Premium category categorical |
| `design-system-color` | `rgba(0,0,0,0.15)` | Leaflet popup box-shadow (standard shadow, not a palette color) |
| `design-system-radius` | `3px` | Scrollbar thumb — browser-chrome styling |
| `design-system-radius` | `14px` | Leaflet popup border-radius — third-party override |
| `design-system-radius` | `12px` | Recharts tooltip radius — third-party override |

---

## All Completed Work (chronological)

### Session 1 — 2026-07-01

**P0 (Home.jsx + index.css)**
- `index.css` — `.text-gradient` class deleted (ABSOLUTE BAN — gradient text)
- `Home.jsx` — `text-gradient` → `text-brand-600` on hero h1 span
- `Home.jsx` — second `btn-cta` → `btn-brand` on AI Precision CTA (One Brass Rule restored)
- `index.css` — `transition: width` → `transform: scaleX()` on `.link-underline::after` (layout-reflow fix)
- `Home.jsx` — scroll indicator glow: teal `rgba(45,212,191,...)` → azure `rgba(90,160,224,...)`

**P1 (Home.jsx)**
- Eyebrow reduced: 7/9 sections → 3/9. Kept: How It Works, Stats, AI explanation. Removed: Discover, AI Precision, Trust, dark CTA.
- Reveal reduced: removed from Map header, Project Cards header + row items, AI Precision header + cards, Trust header + grid items.

**Teal sweep — Dealroom + Dashboard** (commit `4336490` + inline)
- Files: `Dealroom.jsx`, `ChatPanel.jsx`, `ConversationList.jsx`, `DashboardAnalytics.jsx`, `QuoteResponsePage.jsx`, `OnboardingChat.jsx`
- `animate-bounce` → `animate-pulse` in ChatPanel + OnboardingChat
- `DashboardAnalytics.jsx` — Export button + KPICard color prop: `teal-*` → `brand-*`
- `DashboardLayout.jsx` — mobile FAB: `bg-teal-600` → `bg-brand-600`; sidebar transition: `transition-[width]` → `transition-[max-width]`; added `overflow-hidden w-56`; width classes → `max-w-[3.5rem]`/`max-w-56`
- `DashboardSidebar.jsx` — active nav: `bg-teal-50` → `bg-brand-50 font-semibold`; removed 3px left accent stripe entirely
- `ConversationList.jsx` — removed `border-l-[3px] border-l-brand-500`; `bg-brand-50` is the active affordance
- `ChatPanel.jsx` — `bg-[#f8fafc]` → `bg-slate-50`
- `App.jsx` — toast side-stripes: `border-l-4 border-l-emerald/red-500` → `border border-emerald/red-200 bg-emerald/red-50`

**P2 fixes (Home.jsx)**
- Risk dimension added to `AI_DEMO_BREAKDOWN`: `{ key: 'risk', label: 'Risk', max: 10, value: 7 }`; score `77 → 84`
- Hero trust signal: `"45,000+ Verified Profiles"` → `"3,500+ Verified Profiles"` (matches stats section)
- Browse Projects: `btn-ghost` → `btn-outline-brand`
- Map/cards separator: `border-t border-slate-100 + pt-10` on project cards section
- Scroll indicator delay: `800ms` → `420ms`

**P3 + clarify + polish (Home.jsx)**
- Discover subheading corrected (removed "investors" from tab list copy)
- CTA wording unified: "Start Matching with AI" everywhere
- Map hint contrast: `text-slate-400` → `text-slate-500`
- Stats sub-labels on ink bg: `text-slate-500` → `text-slate-300`
- Dealroom definition added inline in How It Works copy
- Bottom CTA strip added after Trust section (ink bg, `btn-brand`, "Your next partnership starts here.")

**Harden (Home.jsx)**
- `viewport-fit=cover` added to `frontend/index.html` meta viewport
- Hero: `min-h-screen` → `min-h-[88dvh]` (iOS Safari URL bar compensation)
- Right-edge gradient affordance on project card scroll row (mobile scroll hint)
- `MapErrorBoundary` class component added inline in `Home.jsx`; wraps `<Suspense> → <ProjectsMap>`. On failure: `h-[420px]` fallback div with MapPin icon + "Map unavailable — view projects below"
- `MAP_ERROR_FALLBACK` constant defined at top of file

### Session 2 — 2026-07-01 (this session)

**Stats distill** (commit `ee766f7`)
- Replaced symmetric 4-up hero-metric grid (ABSOLUTE BAN) with asymmetric editorial layout
- `₹12,000 Cr+` is now dominant figure: `clamp(3.5rem,10vw,6rem)` brass-300, left `3fr` column
- Three subordinates (Builders, Investors, Success Rate) compact in right `1fr`: `text-azure text-xl`, 3-col row on mobile / stacked on lg
- Section header (Eyebrow + h2 + tagline) removed — the number IS the statement
- Ambient glow blobs removed (were decorative hero-metric accessories)
- `STATS` constant + 3 unused icon imports (`Building2`, `TrendingUp`, `IndianRupee`) deleted

**FilterBar custom listbox** (commit `dd51028`)
- `frontend/src/components/filters/FilterBar.jsx`
- Native `<select>` replaced with custom `FilterSelect` component: absolute `<ul>` listbox
- Selected item: `bg-brand-50 text-brand-700 font-semibold` + `Check` icon — no OS blue highlight
- Trigger: `rounded-xl bg-slate-50 border` with `ring-2 ring-brand-100` on open; chevron rotates 180° on open
- Panel: `rounded-xl border border-slate-200 shadow-lg py-1`, opens `mt-1.5` below trigger
- Click-outside closes via `mousedown` listener on document
- Full teal sweep: `focus:ring-teal-*` → `brand-*`, verified toggle `bg-teal-600` → `bg-brand-600`, view toggle `text-teal-700` → `text-brand-700`, hover borders `teal-300` → `brand-300`

---

## Open Backlog — Start Here Next Session

### 1. Builders.jsx teal sweep (QUICK — ~5 min)

File: `frontend/src/pages/Builders.jsx`
4 tokens remaining:

| Line | Current | Fix |
|------|---------|-----|
| 57 | `bg-gradient-to-b from-teal-50/60 to-slate-50` | `from-brand-50/60 to-slate-50` |
| 61 | `text-teal-700 hover:text-teal-800` | `text-brand-700 hover:text-brand-800` |
| 74 | `bg-teal-600` (Verified Builders chip) | `bg-brand-600` |
| 80 | `bg-teal-700` (Portfolio Value chip) | `bg-brand-700` |

### 2. Role bifurcation hero (MEDIUM — `/impeccable shape`)

**What:** Hero section of `Home.jsx` is identical for builders and investors. Logged-in users who have completed onboarding see no personalisation. Score gap: H3=2/4, H7=2/4.

**What to build:** After the hero trust signal row, add a two-button role toggle:
- "I'm a Builder" → CTA routes to `/dashboard` with builder context
- "I'm an Investor" → CTA routes to `/investor-dashboard` with investor context
- Unauthenticated users see both buttons; authenticated users see their active role highlighted
- Use `useAuth()` (`role`, `isAuthenticated`) from `AuthContext`
- Buttons: `btn-brand` for active role, `btn-outline-brand` for inactive

**Invoke:** `/impeccable shape Home.jsx role bifurcation hero` before implementing.

### 3. H9 — Discover "View All" auth wall (LOW — needs UX decision)

**What:** Discover section "View All" button on Builders tab routes to `/builders` which requires auth via `ProtectedRoute`. An unauthenticated visitor clicks "View All" → redirect to `/login` → jarring.

**Options:**
- A) Make `/builders` public (remove `ProtectedRoute` wrapper in `App.jsx`)
- B) Change "View All" CTA to "Sign up to explore all builders" linking to `/register`
- C) Show a teaser modal before redirecting

### 4. Dashboard sidebar WCAG contrast (LOW)

`text-slate-400` (#94a3b8) on `bg-red-50` (#fef2f2) ≈ 2.8:1 — WCAG AA fail for body text (need 4.5:1).
File: `DashboardSidebar.jsx` — check any error/alert state text using `text-slate-400` on tinted backgrounds.
Fix: bump to `text-slate-600` on tinted backgrounds, or use `text-red-700` on `bg-red-50`.

---

## Recommended Next Commands

```
# 1. Quick win — do this first (no decisions needed)
Fix Builders.jsx teal tokens (4 lines, see table above)

# 2. UX shape — discuss before implementing
/impeccable shape Home.jsx          # role bifurcation hero (Builder vs Investor toggle)

# 3. After role bifurcation is built
/impeccable critique Home.jsx       # re-score; expect 26-28/40 if H3+H7 gaps close

# 4. Broaden the pass
/impeccable audit dashboard         # DashboardAnalytics, MyInvestments, sidebar contrast
```

---

## Design System Files (do not overwrite without comparison)

| File | Role |
|------|------|
| `design-system/MASTER.md` | CSS source of truth — Tailwind tokens, component classes, hard rules |
| `DESIGN.md` | Machine-readable spec — YAML frontmatter, named rules, component HTML/CSS snippets |
| `PRODUCT.md` | Strategic context — who, why, register, anti-references, principles |
| `.impeccable/design.json` | Schema v2 sidecar — tonal ramps, component snippets with full CSS |

MASTER.md and DESIGN.md are complementary. MASTER.md answers "how it looks." DESIGN.md answers "what the rules are and why."

---

## Brand Quick Reference

| Token | Value | Usage |
|-------|-------|-------|
| `brand-600` / `steel-600` | `#2b5e93` | Primary brand — links, active states, icons |
| `ink` | `#0e1b2e` | Dark surfaces — stats section, dealroom bg |
| `brass` / `btn-cta` | `#c2954a` | **ONE per screen** — the primary conversion CTA |
| `azure` | `#5aa0e0` | Data only — chart accents, match scores |
| `btn-brand` | steel gradient | Standard primary button (not brass) |
| `btn-outline-brand` | 2px steel border | Secondary button on white/light bg |
| `btn-ghost` | white bg, slate border | **Only on dark surfaces** — not on white cards |

## Absolute Bans (never introduce these)

- Side-stripe borders `>1px` as colored accents on cards/list items
- Gradient text (`background-clip: text` + gradient)
- Hero-metric template (symmetric big-number grid, 4-up counter)
- Identical card grids (same icon + heading + text repeated)
- Eyebrow on every section (max 3 eyebrows per page)
- Numbered section markers (01/02/03) as scaffolding reflex
