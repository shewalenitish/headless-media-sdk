---
name: wiring-media-data
description: >
  Use this skill whenever writing or modifying React code that fetches, lists,
  paginates, or tracks Pexels media through this monorepo's `media-react`
  package. Covers MediaProvider setup, API key handling, the useMediaList /
  useMediaItem / useMediaEvent / useMediaTracking hooks, and the mistakes
  that break this SDK's dependency boundaries. Do NOT use this skill for
  styling or rendering components — see using-media-components for that.
---

# Wiring Media Data (`media-react`)

## What this package is (and isn't)

`media-react` is a **thin adapter**, not a place for business logic. It wraps
`media-core` (the framework-agnostic Pexels SDK) in React idioms — a
Provider and hooks. Every hook here ultimately delegates to a `MediaCore`
instance; none of them talk to Pexels directly.

**Rule for any code you write in this app:** if you need media data, use a
hook from `media-react`. Never `import` from `media-core` directly inside a
component, and never call `fetch` yourself for Pexels data. If you find
yourself doing either, stop — you're bypassing the SDK's auth handling,
caching, and event tracking, and you're violating the dependency direction
(`app → wrappers → core`; components/app should not reach past the wrapper).

## 1. Setup — `MediaProvider`

Exactly one `MediaProvider` should wrap the app, near the root:

```tsx
import { MediaProvider } from 'media-react';

<MediaProvider apiKey={import.meta.env.VITE_PEXELS_API_KEY}>
  <App />
</MediaProvider>
```

- The API key is read from an environment variable, never hardcoded.
- `.env` (or `.env.local`) holding the real key must stay in `.gitignore`.
  Only `.env.example` (with a placeholder) is committed.
- If you need a pre-built `MediaCore` instance instead (e.g. in tests), pass
  `instance={myMediaCore}` instead of `apiKey`.

## 2. Reading a single item — `useMediaItem`

```tsx
import { useMediaItem } from 'media-react';

const { item, loading, error } = useMediaItem(photoId, 'photo'); // or 'video'
```

Use this for a single deep-linked photo/video, not for lists.

## 3. Reading paginated lists — `useMediaList`

This is the hook that powers every Grid/ReelSwiper in the app. It takes a
`source` describing *what* to fetch, and returns everything a paginated UI
needs:

```tsx
import { useMediaList } from 'media-react';

const { items, loading, loadingMore, error, hasNextPage, loadMore, refetch } =
  useMediaList(
    query ? { kind: 'search-photos', query } : { kind: 'curated-photos' },
    { perPage: 24 }
  );
```

Valid `source.kind` values: `'search-photos'`, `'curated-photos'`,
`'search-videos'`, `'popular-videos'`. `search-*` sources require a
non-empty `query` — the hook returns an empty list without fetching if
`query` is blank, so you don't need to guard that yourself.

**Gotchas:**
- The hook **refetches automatically whenever `source` changes** (it's
  deep-compared internally). Don't build your own `useEffect` around it to
  "trigger a search" — just change the `query` state you pass in. If you
  want to avoid a network call on every keystroke, debounce the *state
  update* before it reaches this hook (e.g. debounce `setQuery`, don't
  debounce inside the hook itself — that's out of scope for this wrapper).
- Call `loadMore()` from an infinite-scroll trigger (see
  using-media-components for the `Grid` sentinel), not from a manual "next
  page" button loop — it already tracks `page` internally and is a no-op if
  a request is in flight or `hasNextPage` is false.
- Stale requests are already guarded against (switching queries fast won't
  let an old response clobber a newer one) — you don't need to cancel
  anything yourself.

## 4. Events — tracking views/downloads

The SDK emits `view`, `download`, `search`, and `error` events, and logs
them to the console by default. Two ways to hook in:

**A. Fire an event from a component** (e.g. when a lightbox opens, or a
download link is clicked):

```tsx
import { useMediaTracking } from 'media-react';

const { trackView, trackDownload } = useMediaTracking();
trackView(item);       // call when the user views an item
trackDownload(item);   // call when the user downloads/saves an item
```

**B. Subscribe independently** (e.g. app-level analytics, decoupled from
whichever component fired the event):

```tsx
import { useMediaEvent } from 'media-react';

useMediaEvent('download', (payload) => {
  analytics.track('media_download', { id: payload.item.id });
});
```

This subscription auto-cleans-up on unmount — don't manage the unsubscribe
function yourself.

## Anti-patterns to avoid

- ❌ `import { MediaCore } from 'media-core'` inside a component — always go
  through `useMediaCore()` (or a higher-level hook) instead.
- ❌ Constructing a second `MediaCore`/`MediaProvider` deeper in the tree —
  one Provider per app; nested providers create separate caches/event buses.
- ❌ Polling or re-fetching manually with `setInterval` — there's no
  subscription/live-update mechanism in this SDK; don't invent one inline.
- ❌ Passing a new object literal as `source` without it representing an
  actual query change — since `useMediaList` re-fetches on `source` change,
  an accidental new-object-every-render will cause a fetch loop. Derive
  `source` from state/props, not from an inline object built with
  non-deterministic values.
