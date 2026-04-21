# Frontend Architecture

## Framework

The frontend uses Next.js App Router, React 19, TypeScript, and Tailwind CSS.

## Current Structure

- `app/page.tsx`: single-page demo workspace with local state.
- `app/layout.tsx`: metadata, fonts, root layout.
- `app/globals.css`: dark base theme and global element defaults.
- `next.config.ts`: remote image configuration.

## Future Structure

When the backend contract stabilizes, split `app/page.tsx` into:

- `components/navigation/sidebar.tsx`
- `components/dashboard/*`
- `components/library/*`
- `components/story-bible/*`
- `components/translation/*`
- `components/export/*`
- `components/billing/*`
- `lib/api/client.ts`
- `lib/demo-data.ts`

## API Strategy

Use `NEXT_PUBLIC_API_URL` for backend access. Keep demo data available when the backend is absent.

Current behavior: the sidebar probes `${NEXT_PUBLIC_API_URL}/health`, defaulting to `http://127.0.0.1:4001/health`, and displays live demo counts when the backend is online.

Planned calls:

- `GET /health`
- `GET /novels`
- `POST /novels`
- `POST /novels/:id/story-bible/extract`
- `GET /translation-projects/:id`
- `PATCH /translation-segments/:id`
- `POST /exports`
- `POST /billing/checkout`
- `POST /billing/portal`

## Auth Strategy

Use Clerk on the frontend. Protected pages should require a signed-in author, then pass Clerk JWTs to the backend.

## State Strategy

V1 can use local component state plus backend fetches. Add SWR or TanStack Query once live API calls replace demo data.
