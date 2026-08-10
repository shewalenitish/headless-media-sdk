---
name: using-media-components
description: >
  Use this skill whenever writing or modifying UI that renders media using
  this monorepo's `media-ui-react` package — Grid, Lightbox, or ReelSwiper.
  Covers the headless prop-getter pattern, the styling contract (no baked-in
  CSS), and accessibility behavior already built in vs. what you still need
  to supply. Do NOT use this skill for fetching/pagination logic — see
  wiring-media-data for that.
---

# Using Media Components (`media-ui-react`)

## What this package is (and isn't)

`media-ui-react` is **headless**: it ships behavior (pagination triggers,
keyboard nav, focus management, active-item detection) but zero visual
styling and zero data-fetching. It does not import from `media-core` or
`media-react` — it doesn't know Pexels exists. Every component is generic
over `T`; you decide what `T` is by passing `items` (typically the
`MediaItem[]` you got from a `media-react` hook) and a `renderItem` function
that turns one `T` into markup.

**Rule for any code you write here:** never import `MediaItem` or anything
else from `media-core` inside a `media-ui-react` file. If a component needs
to know something about the data, that information must arrive as a prop
(usually already true, since `renderItem` receives the whole item) — don't
add a new import to work around it.

## The two ways to use each component

Each of Grid, Lightbox, and ReelSwiper ships both:
1. A **hook** (`useGrid`, `useLightbox`, `useReelSwiper`) — the actual
   headless primitive. Returns prop-getters (`getContainerProps`,
   `getItemProps`, ...) and state. Use this when you need full control over
   markup structure.
2. A **convenience component** (`Grid`, `Lightbox`, `ReelSwiper`) — a thin
   wrapper around the hook that also renders the DOM structure for you,
   driven by a `renderItem` render-prop. Use this unless you have a reason
   not to — it's what the demo app uses throughout.

Default to the component form. Drop to the hook only if the component's
fixed DOM shape doesn't fit (e.g. you need the sentinel element somewhere
non-standard in the layout).

## Styling contract — you must supply layout CSS

None of these components ship stylesheets. Concretely, for each:

- **Grid** — renders a `role="list"` container and `role="listitem"`
  wrappers with no layout CSS at all. You must supply `className`/`style`
  with actual grid CSS, e.g.:
  ```css
  .media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; }
  ```
- **Lightbox** — renders an overlay `div` (`role="dialog"`) with no
  position/backdrop styling. You must supply `position: fixed; inset: 0;`
  and a backdrop color via `className`/`style`, or it will render inline
  and look broken.
- **ReelSwiper** — the *only* one that injects minimal inline styles itself
  (`overflow-y: auto`, `scroll-snap-type: y mandatory`, `height: 100%` on
  the container; `scroll-snap-align: start`, `height: 100%` per item) —
  because scroll-snap paging doesn't work at all without these. Your
  `style` prop is merged *after* these, so you can override them, but don't
  remove `scroll-snap-*` unless you're replacing the paging mechanism
  entirely.

Don't add CSS class names or inline styles inside `media-ui-react` itself to
"make it look better" — that belongs in the app layer, in the `renderItem`
markup or in an app-level stylesheet.

## Accessibility already handled vs. what you still supply

**Already built in:**
- Grid: `role="list"`/`role="listitem"`, `aria-busy` while loading more.
- Lightbox: `role="dialog"` + `aria-modal`, Escape to close, ArrowLeft/Right
  to navigate, a basic focus trap (Tab cycles within the lightbox), and
  focus returns to the trigger element on close.
- ReelSwiper: active-item detection via IntersectionObserver (exposed as
  `isActive` in `renderItem`, useful for e.g. only autoplaying the active
  video).

**Still your job, every time you use these:**
- `alt` text on images (`renderItem` has the full item — use
  `item.alt ?? \`Photo by ${item.authorName}\`` as a sensible fallback, not
  an empty string).
- `aria-label` on any icon-only buttons you render inside `renderControls`
  or `renderItem` (prev/next/close arrows, etc.) — the components don't
  know what your buttons contain.
- Keyboard access to whatever trigger opens the Lightbox (e.g. render the
  Grid item as a real `<button>`, not a `<div onClick>`).

## Common mistakes to avoid

- ❌ Forgetting `keyExtractor` (required on `Grid`/`ReelSwiper`) or making it
  non-stable (e.g. `index` alone) — causes remounts and breaks the
  IntersectionObserver wiring these components depend on. Use the item's
  own `id`.
- ❌ Wrapping `Grid`'s sentinel or `ReelSwiper`'s per-item refs in extra
  conditional rendering that unmounts/remounts them on every render — the
  IntersectionObserver reattaches on ref change, so unnecessary
  remounts silently break active-item/load-more detection.
- ❌ Reaching into `item.raw` (the untouched Pexels API object) in app code
  — it's there for escape-hatch cases, but prefer the normalized
  `MediaItem` fields (`thumbnailUrl`, `previewUrl`, `fullUrl`, `authorName`,
  etc.) for anything that has one, so app code doesn't depend on Pexels'
  raw shape.
- ❌ Passing a brand-new `renderItem` function that closes over changing
  values without `useCallback` in a context where it matters for perf — not
  incorrect, just worth flagging if you're optimizing a large grid.
