# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo Structure

This is a monorepo with two apps sharing the same Supabase backend:

- `apps/web/` — Next.js 16 web app (primary, deployed on Vercel)
- `apps/mobile/` — Expo 54 / React Native app (Expo Router)
- `supabase/migrations/` — SQL migrations run manually in Supabase SQL Editor

## Commands

All commands are run from within the app directory (e.g. `apps/web/` or `apps/mobile/`).

### Web (`apps/web/`)
```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

### Mobile (`apps/mobile/`)
```bash
npx expo start           # Start Expo dev server
npx expo start --android # Android emulator
npx expo start --ios     # iOS simulator
```

No automated test suite exists in either app.

## Architecture

### Web App (Next.js 16 + App Router)

**Supabase clients — two separate factories, never mix them:**
- `src/lib/supabase.ts` → `createClient()` — browser client, use in `'use client'` components
- `src/lib/supabase-server.ts` → `createServerSupabase()` — async server client using `next/headers` cookies, use in Server Components and Route Handlers

**Route layout (`src/app/`):**
- Turkish URL segments: `/giris` (login), `/profil`, `/mesajlar`, `/ilan-olustur`, `/ilanlar/[id]`, `/cikis`, `/hesap-sil`
- `auth/callback/route.ts` — OAuth PKCE code exchange handler (Google OAuth redirects here)
- `api/ping/route.ts` — Vercel cron keep-alive, runs daily at 06:00 UTC

**Middleware (`src/middleware.ts`):** Validates Supabase session and redirects unauthenticated users away from protected routes (`/profil`, `/mesajlar`, `/ilan-olustur`, `/hesap-sil`, `/cikis`).

**Components (`src/app/components/`):** All shared UI lives here — `Header`, `BottomNav`, `PetCard`, `Filtreler`, `ImageCarousel`, `FavoriButon`, `RaporlaModal`. `CookieConsent` is in `src/components/`.

**Data pattern:** Server Components fetch data directly with `createServerSupabase()`. Client components (`'use client'`) use `createClient()` and Supabase Realtime subscriptions (used in the messages page for live chat).

### Mobile App (Expo Router)

File-based routing under `apps/mobile/app/`:
- `(auth)/` — login flow
- `(tabs)/` — bottom-tab nav: home (`index`), create listing, messages, profile
- `ilanlar/[id].tsx` — listing detail
- `mesajlar/[listing_id].tsx` — chat thread

Shares the same Supabase project; uses `@supabase/supabase-js` directly with AsyncStorage for session persistence.

### Supabase / Database

**Key tables:** `users`, `corporate_profiles`, `listings`, `listing_media`, `applications`, `messages`, `favorites`, `reports`

**JSONB fields on `listings`:** `health_status` (`{vaccinated, neutered, dewormed, microchipped, vet_checked}`) and `traits` (`{friendly, indoor, good_with_kids, good_with_pets, trained, quiet}`)

**Storage buckets:** `listing-media` (5 MB, public) and `avatars` (2 MB, public)

RLS is enforced on all tables. Run migrations in order (001→007) in Supabase SQL Editor — there is no CLI migration runner wired up.

### Styling

Tailwind CSS v4 with a Material Design 3-inspired warm palette defined entirely in `globals.css` via `@theme inline`. Use the semantic color tokens (`text-primary`, `bg-surface-container`, `text-on-surface-variant`, etc.) rather than raw Tailwind colors. Icon font: Google Material Symbols Outlined (`<span className="material-symbols-outlined">`). Fonts: Plus Jakarta Sans (headings, `.font-headline`) and Inter (body).

## Required Environment Variables

Needed in `apps/web/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-side only
NEXT_PUBLIC_SITE_URL=        # canonical URL for OG tags
```

## Important Notes

- **Next.js version:** This project uses Next.js 16, which has breaking changes from 14/15. Check `node_modules/next/dist/docs/` before using unfamiliar APIs. `searchParams` and `params` in page components are now `Promise<...>` and must be awaited.
- The app targets the Turkish market — UI strings are in Turkish. Keep that consistent.
- Supabase auth uses Google OAuth; the callback URL must be registered in Google Cloud Console and Supabase Auth settings.
