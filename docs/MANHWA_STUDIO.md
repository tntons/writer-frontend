# Manhwa Studio

Manhwa Studio is the writer-facing workspace for turning a chapter into comic panels.

## What The Writer Can Do

1. Paste a chapter or load the Nightmare demo chapter.
2. Choose a visual style: webtoon, cinematic, ink, or shojo.
3. Choose an image shape: vertical, panel, or square.
4. Pick a panel count from 3 to 12.
5. Generate a storyboard through the backend.
6. Review each generated panel preview.
7. Inspect the exact image prompt, negative prompt, source excerpt, character names, setting, camera, and mood.
8. Copy a prompt for another tool.
9. Regenerate a selected panel with a revision note.

## Real Versus Local

- Real: `/manhwa` route, form state, generated panel grid, selected-panel editor, copy prompt, regenerate action, backend calls, and local fallback.
- Real: backend persistence when `writer-backend` is running.
- Local fallback: if the backend is offline, the UI still creates an in-browser storyboard preview.
- Mock image provider: the backend currently creates deterministic SVG panel previews instead of calling a paid image model.

## Files

- `app/manhwa/page.tsx`
- `features/manhwa-studio/manhwa-studio-workspace.tsx`
- `features/manhwa-studio/lib/api.ts`
- `features/manhwa-studio/lib/local-manhwa.ts`
- `features/manhwa-studio/types.ts`
