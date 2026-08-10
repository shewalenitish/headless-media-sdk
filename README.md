# Headless Media SDK — Pexels

A cross-platform, headless media SDK ecosystem: a framework-agnostic core,
thin platform wrappers (React + React Native), independent headless UI
component libraries per platform, a web app, and a React Native app that
wire the two platforms together. Built against the take-home spec in
`senior-react-dev-task-headless-media-sdk.md`.

**Live app:** https://headless-media-sdk.netlify.app/
**SDK docs:** https://gilded-longma-f9430d.netlify.app/
**Component docs:** https://velvety-toffee-307b82.netlify.app/
**AI chat used while building:** https://claude.ai/share/c3e809cb-1f44-4403-9005-287b0ff66c97 — a single ongoing session covering architecture, implementation, debugging, and both skill-doc verification tests described below.

## Architecture

```
Application (web)                         Application (native)
      │                                          │
      ├── media-react ──── media-ui-react        ├── media-native ──── media-ui-native
      │         │                                │         │
      │         ▼                                │         ▼
      │    media-core ◄────────────────────────────────media-core
      │    (same package, both platforms)
```

**Dependency direction, enforced per-package (not just by convention):**

- `media-core` imports no React, no React Native, no DOM APIs, no UI package.
- `media-react` / `media-native` are thin adapters — they depend on
  `media-core` only, contain no duplicated business logic, and are the
  *only* layer that imports `media-core`.
- `media-ui-react` / `media-ui-native` import neither `media-core` nor
  their platform's wrapper — they're generic over `T`, take data/callbacks
  purely as props, and don't know Pexels or the SDK exist.
- Wrappers and UI components never import each other.
- Applications are the only place both a wrapper and a UI library meet.

This is what lets `media-core` theoretically power a CLI, a server, or an
entirely different UI framework with zero changes.

### Packages

| Package | Status | Responsibility |
|---|---|---|
| `packages/media-core` | Built, typechecked, used by both platforms | Pure TypeScript Pexels client — auth, typed errors, response normalization (`MediaItem`), in-memory cache + request de-dupe, typed event emitter (`view`/`download`/`search`/`error`) with a default console logger. |
| `packages/media-react` | Built, typechecked | React `MediaProvider` + hooks (`useMediaList`, `useMediaItem`, `useMediaEvent`, `useMediaTracking`). |
| `packages/media-native` | Built, running on the native app | React Native wrapper following the same hook contract as `media-react` (`MediaProvider`, `useMediaList`, `useMediaItem`, `useMediaEvents`). |
| `packages/media-ui-react` | Built, typechecked, running in the live web app | Headless `Grid` / `Lightbox` / `ReelSwiper` — prop-getter pattern, zero baked-in styles. |
| `packages/media-ui-native` | Built, running on the native app | Native equivalents of `Grid` / `Lightbox` / `ReelSwiper`, same headless contract. |
| `apps/web-app` | Built, running live | Vite + React app — search → Grid → Lightbox, plus a Videos tab using ReelSwiper. |
| `apps/native-app` | Built (bare React Native CLI, not Expo), launched and verified running | Native consumer app wiring `media-native` + `media-ui-native`, confirmed working on an emulator/device. |
| `skills/` | Complete | Two `SKILL.md` docs for AI coding assistants. |

Both platforms share the same `media-core` package unchanged — the
practical proof of the "portable enough to power a CLI or a different UI
with zero changes" constraint, since the web and native wrappers each
adapt the identical core to their own platform's idioms.

## Setup — Web

```powershell
pnpm install
pnpm run build:packages   # builds media-core, media-react, media-ui-react in order
cd apps/web-app
copy .env.example .env    # then paste your Pexels API key into .env
cd ../..
pnpm run dev:web
```

Get a free Pexels API key at https://www.pexels.com/api/ (200 req/hour,
20,000/month on the free tier). `.env` is gitignored — never commit it.

## Setup — React Native

```powershell
pnpm install
pnpm run build:packages
cd apps/native-app
npm start        # start Metro, keep running
```
In a second terminal, from `apps/native-app`:
```powershell
npm run android   # or, on macOS: npm run ios (after bundle install && bundle exec pod install)
```
Requires the full React Native environment setup
(https://reactnative.dev/docs/environment-setup) and an Android/iOS
emulator or connected device.

## AI-assisted vs. hand-written

The web side (`media-core`, `media-react`, `media-ui-react`, `web-app`)
was built collaboratively with Claude in the linked ongoing chat session,
covering architecture, implementation, and debugging together — not a
one-shot "generate the whole repo" prompt. I ran it locally myself and
worked through real setup issues along the way, including a pnpm
workspace-detection bug that pulled in an unrelated project's
dependencies, and a missing-build-artifacts error from Vite before all
three packages had been built.

The native side (`media-native`, `media-ui-native`, `apps/native-app`) was
built in a separate session following the same architectural contract as
the web side, then launched and verified running.

The two `SKILL.md` docs were written to capture the actual hooks, props,
and gotchas exercised while building `web-app` — real constraints
discovered during implementation, not written speculatively first. I then
ran both skill docs against fresh follow-up prompts in the same linked
session — one testing whether `wiring-media-data/SKILL.md` alone steers
an AI toward debouncing search state correctly (rather than inside the
hook, which the doc explicitly warns against), and one testing whether
`using-media-components/SKILL.md` alone steers an AI toward keeping
styling in the app layer and multi-select accessible. Since both ran in
the same session as the original build rather than fully isolated fresh
chats, that's a real but imperfect test — noting that limitation rather
than overstating it.

What I did by hand: ran and verified every setup step for both the web
app and the native app locally, caught and reported the pnpm/Vite issues
above, made the scoping calls documented in this README, and reviewed the
code rather than accepting it uncritically.

## Scoping decisions

**Video-in-Lightbox was scoped down.** The spec marks it "if time allows"
— the web app's Lightbox currently handles photos; video playback is
covered instead by the dedicated Reels view, which is arguably the better
UX fit for video anyway.

**No design system / visual polish**, per the spec's explicit "visual
polish is not being scored." Styling is minimal, functional CSS on both
platforms.
