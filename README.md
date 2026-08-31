# FinTrack — Next.js

Full-stack Next.js 15 (App Router) port of the FinTrack personal finance manager
(originally Vite + React + wouter frontend with an Express + Mongoose backend).
One app now serves both the UI and the API.

## Run

```bash
npm install
cp .env.example .env.local   # fill in values (already done on this machine)
npm run dev                  # http://localhost:4000
npm run build && npm start   # production
```

## Data

Connects to the **same MongoDB database** (`MONGODB_URI`) with byte-identical
Mongoose schemas and the same collection names (`users`, `dailyexpenses`,
`dailytasks`, `emis`, `finances`, `goals`, `personalmemories`, `plans`,
`reminders`, `wishlists`). No migration of stored data is needed — existing
records, logins (JWT secret unchanged), and push subscriptions keep working.

## Structure

| Path | Origin |
|---|---|
| `app/` | Route shell: root layout (head/fonts/PWA/OneSignal), providers, auth gate at `/`, `(protected)/` layout (sidebar/mobile shell + auth guard), 11 page wrappers, `app/api/**` route handlers |
| `views/` | The original `client/src/pages/*` — byte-identical + `"use client"` (only `auth.tsx` swaps wouter for `next/navigation`) |
| `components/`, `hooks/`, `lib/`, `context/`, `shared/` | Copied from the original (`AppSidebar`/`MobileBottomNav` use `next/link`/`usePathname`; env reads renamed `VITE_*` → `NEXT_PUBLIC_*`) |
| `server/` | The original backend: `storage.ts`, `scheduler.ts`, `onesignal.ts` byte-identical; `models/*` with a hot-reload-safe registration guard; new `db.ts` (cached connection) and `auth.ts` (JWT verify, mirrors the Express authMiddleware) |
| `instrumentation.ts` | Starts the 60s reminder push scheduler on server boot (replaces the Express bootstrap) |
| `public/` | `manifest.json`, `OneSignalSDKWorker.js` (unified PWA+push worker at scope `/`), logo, favicon |

## Env vars

`MONGODB_URI`, `JWT_SECRET`, `ONESIGNAL_APP_ID`, `ONESIGNAL_REST_API_KEY`,
`NEXT_PUBLIC_ONESIGNAL_APP_ID` (was `VITE_ONESIGNAL_APP_ID`), and optional
`NEXT_PUBLIC_API_BASE_URL` (was `VITE_API_BASE_URL`; leave unset — the API is
same-origin at `/api`). `ALLOWED_ORIGINS`/CORS is no longer needed: frontend
and API share one origin. Deploy needs a Node server (`next start`) so the
scheduler can run — Render/Railway style, not static hosting.

## Verified parity

- 115-step API scenario run against the original Express server and this app
  side by side: identical statuses and response bodies everywhere except the
  known improvement below.
- Browser E2E (20/20): login, all 12 pages rendering data, theme toggle,
  client-side nav, logout confirmation, auth guards, 404.
- 85/102 source files byte-identical to the originals (rest differ only by the
  sanctioned mechanical transforms).

## Intentional deviations (all verified, nothing else differs)

1. **Validation errors actually work now.** The original used zod v4 but read
   `error.errors[0].message` (removed in zod 4), so every validation failure
   crashed into `500 {"message":"Server error"}`. This port reads
   `error.issues[0].message` and returns the intended
   `400 {"message":"<real message>"}` (e.g. "Invalid email").
2. Body-parsing edges: `application/x-www-form-urlencoded` request bodies are
   no longer accepted (the frontend only ever sends JSON); malformed JSON is
   treated as an empty body instead of a global 400 parse error.
3. The unused `VITE_ONESIGNAL_REST_API_KEY` browser exposure was dropped — the
   REST key now lives server-side only (no client code ever read it).
