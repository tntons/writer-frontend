# WriterBridge Frontend

Black, focused author workspace for translating novels, editing AI drafts, managing a story bible, and preparing platform-ready export packages.

## Getting Started

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

The current version is usable in demo mode. It does not require Clerk, Stripe, OpenAI, or the backend server to click through the core author journey.

When `writer-backend` is running, the sidebar checks `http://127.0.0.1:4001/health` by default and shows the live demo counts. Override this with `NEXT_PUBLIC_API_URL`.

## Useful Docs

- `docs/PRODUCT_BRIEF.md`
- `docs/UI_SPEC.md`
- `docs/FRONTEND_ARCHITECTURE.md`
- `docs/AGENT_HANDOFF.md`

## Scripts

```bash
npm run dev
npm run lint
npm run build
```
