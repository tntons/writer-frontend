# WriterBridge UI Spec

## Visual System

- Base surface: near-black `#050505`.
- Panels: `#0d0d0d` with thin white alpha borders.
- Primary action: lime `#bef264`.
- Warning state: amber.
- Danger state: red only for destructive actions.
- Radius: 6-8px for panels and buttons.
- Typography: Geist Sans, with Geist Mono only for IDs or technical values.

## Layout

- Desktop uses a fixed left navigation rail and a flexible working area.
- Mobile stacks navigation above content.
- The main workspace avoids marketing hero patterns and starts with operational information.

## Navigation

Primary sections:

- Dashboard
- Library
- Story Bible
- Translation
- Export
- Billing
- Settings

## Key Screens

Dashboard:
- Credits, chapter progress, story-bible progress, quick import, active chapter, pipeline, billing shortcut.

Library:
- Novel list with language targets, chapter count, status, and approval progress.

Story Bible:
- AI-detected characters, places, terms, and style rules with accept controls.

Translation:
- Segment list, source text, editable translation textarea, QA notes, approve action.

Export:
- Localized metadata, chapter preview, package contents, build action.

Billing:
- Current plan, monthly credit usage, top-up action, Stripe portal placeholder.

Settings:
- Language defaults and publishing defaults.

## Interaction Rules

- Every AI draft remains editable.
- Accepted story-bible items are visibly separate from unaccepted items.
- Export can be built from demo content locally.
- No real publish action appears in V1.
