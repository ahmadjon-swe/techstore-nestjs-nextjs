# TechStore Frontend — Techniques & Patterns

How the TechStore storefront is built: a **futuristic dark flagship** e-commerce frontend on
**Next.js 16 (App Router) + React 19**, server-first, with motion on every surface kept *restrained
and tasteful*. This doc is the reference for anyone extending it.

> TechStore is a **retail store, not a SaaS** — there are **no subscription tiers**. Every visitor
> sees the same interface. (Earlier revisions of this doc described a tiered SaaS; that concept does
> not apply here.)

---

## 1. Stack

| Concern | Choice |
|---|---|
| Framework | **Next.js 16** App Router, React 19, `output: standalone` |
| Language | TypeScript (strict) |
| Styling | **Tailwind CSS v4** — CSS-first, no `tailwind.config.js` |
| Motion | **Framer Motion** (`LazyMotion` + `m`) + **Lenis** smooth scroll + CSS keyframes |
| Server state | **TanStack React Query v5** (client islands only) |
| Client state | **Zustand v5** (cart drawer + optimistic count) |
| HTTP (server) | typed `fetch` client in `lib/api.ts`; web **route handlers** proxy + attach the httpOnly cookie |
| Toasts | **sonner** |
| Icons | **lucide-react** |
| Utilities | `cn()` = `clsx` + `tailwind-merge`; `date-fns`; `recharts` (admin) |

---

## 2. Rendering architecture — server-first

- **SEO/content pages are React Server Components**: home, catalog, product detail fetch on the
  server (`lib/api.ts`, cached with `next.revalidate`) for fast first paint, streaming, and crawler
  friendliness. Product pages set `revalidate = 60` (ISR) and emit **schema.org `Product`** JSON-LD.
- **Interactivity is isolated to small client islands**: `HeaderShell`, `CartButton`, `CartDrawer`,
  `QuickAdd`, `ProductDetailClient`, the auth/checkout forms. Everything else stays server-rendered.
- **Graceful degradation**: server pages wrap catalog fetches in `try/catch` (`safeList`,
  `.catch(() => [])`) so a momentarily-unreachable API renders an empty state instead of a 500.
- **App Router robustness**: route-level `loading.tsx` (layout-matched skeletons), global
  `error.tsx`, custom `not-found.tsx`, and a `(shop)/template.tsx` that gives every navigation a soft
  enter transition.

---

## 3. The design system (`app/globals.css`) — the interesting part

No `tailwind.config.js`. Everything is CSS-first via `@import "tailwindcss"` + `@theme`.

### Tokens
A single cohesive **dark** palette as CSS custom properties exposed to Tailwind through `@theme inline`
(`--color-bg`, `--color-surface`, `--color-elevated`, `--color-line`, `--color-fg`, `--color-muted`,
`--color-faint`, `--color-accent` indigo, `--color-accent-2` cyan, plus semantic `new/used/success/
danger/warning`). Use `bg-surface`, `text-muted`, `border-line`, `text-accent-2`, etc. in JSX.

### Motion language
- Easings as variables: `--ease-out: cubic-bezier(0.16,1,0.3,1)` (expo), `--ease-spring`,
  `--ease-in-out`; durations `--dur-fast/--dur/--dur-slow`.
- A single global rule transitions color/bg/border/shadow/transform/opacity on
  `a, button, [role=button], summary, .smooth` — so micro-motion is consistent and free.

### Registered custom properties (the trick that makes gradients animate)
```css
@property --angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
```
`--angle` is interpolatable, so the **conic-gradient hover border** (`.border-glow`) can spin
smoothly — you can't animate a raw `conic-gradient` angle otherwise.

### Utility classes worth reusing
- `.glass` — frosted translucent surface (`backdrop-filter: blur + saturate`).
- `.border-glow` — animated conic-gradient border that fades in on hover.
- `.text-gradient` — animated gradient clipped to glyphs.
- `.aurora` — ambient blurred accent blobs (decorative, `pointer-events:none`).
- `.grain` — fixed SVG film-grain overlay to kill banding on dark gradients.
- `.skeleton` — shimmer loading surface.

### Keyframes
`fade-up`, `fade-in`, `shimmer`, `float`, `glow-pulse`, `gradient-pan`, `border-spin`, `aurora`,
`marquee`.

### Accessibility
A `@media (prefers-reduced-motion: reduce)` block nukes animations/transitions and smooth scroll.
Framer Motion is additionally set to `MotionConfig reducedMotion="user"`, and Lenis is skipped when
reduced motion is requested.

---

## 4. Motion patterns

- **`components/motion/Reveal.tsx`** — `Reveal`, `RevealGroup`, `RevealItem`: fade + lift + de-blur
  as elements scroll into view (`whileInView`, `once`). Product rails use the stagger group.
- **Hero** — kinetic headline that builds line-by-line with blur-in, on an aurora + grid backdrop.
- **CartDrawer** — spring slide-over with backdrop blur; body scroll locked while open.
- **CartButton** — the count badge springs in via `AnimatePresence`, keyed on the value.
- **ProductCard** — image hover-zoom, sheen sweep, lift, animated glow border, and a `QuickAdd` that
  slides up on hover.
- **Performance**: `LazyMotion` with `domAnimation` + `strict` (so only `m.*` is used) keeps the
  motion bundle small.

---

## 5. UI primitives (`components/ui/`)

`forwardRef` components composed with `cn()`:
- **Button** — variant (`primary` gradient / `secondary` / `ghost` / `outline` / `danger`) × size
  maps, gradient glow shadow, `hover:-translate-y-0.5 active:scale-[0.98]`, focus-visible ring,
  loading spinner.
- **Card** (`glow` prop → `.border-glow`), **Badge** (toned: new/used/accent/success/danger),
  **Input** (label + error), **Skeleton** + **ProductCardSkeleton**.

Reach for these before raw markup.

---

## 6. Data flow & cart

- **Auth** — httpOnly cookies set by `app/api/auth/*` route handlers (login/register/refresh/logout);
  server components read the session via `lib/auth.ts`. The API JWT guards are the real authority.
- **Cart** — authoritative on the server; the client `useCartUI` Zustand store drives the drawer and
  an **optimistic** count badge (`bump(+1)` immediately, roll back on failure). `QuickAdd` /
  `ProductDetailClient` POST to `/api/cart/add`, toast, and open the drawer.
- Web route handlers (`/api/cart`, `/api/cart/count`, `/api/cart/items/[variantId]`, `/api/orders`,
  `/api/payments/[orderId]/initiate`) proxy to the NestJS API with the cookie token attached.

---

## 7. SEO & platform

- Per-page `generateMetadata`, OpenGraph/Twitter, `metadataBase`.
- `app/sitemap.ts` (products + categories + brands), `app/robots.ts` (disallows admin/api/checkout),
  `app/manifest.ts` (PWA, dark theme color).
- `viewport.themeColor` + `colorScheme: dark`.

---

## 8. Conventions cheat-sheet

- Server-first: keep pages RSC; add `'use client'` only for interactive islands.
- Style with the `globals.css` tokens + `ui/` primitives; use `cn()` to merge classes.
- All money is `BigInt` UZS from the API → formatted with `formatPrice` (mono, tabular-nums).
- Motion via `Reveal`/`m` + the global transition rule; always respect reduced motion.
- API base URL is `NEXT_PUBLIC_API_URL`; `output: standalone` for Docker.
- No subscription tiers, no per-user theming — one unified flagship interface.
