# Frontend Agent Handoff

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verify

```bash
npm run lint
npm run build
```

## Current Usable Flow

1. Open the dashboard.
2. Paste or edit the source scene.
3. Click `Create demo translation`.
4. Edit the translated segment.
5. Click `Approve segment`.
6. Open `Story Bible` and accept or unaccept glossary rules.
7. Open `Export` and build the package preview.

## Next Frontend Work

- Connect Clerk auth.
- Replace local demo state with backend API calls.
- Add optimistic save for translation segments.
- Add file import UI for `.txt`, `.md`, and `.docx`.
- Add Playwright tests for the main author flow.
