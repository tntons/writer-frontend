# WriterBridge Product Brief

WriterBridge helps web novel authors translate and package their stories for new language markets.

## Audience

V1 is for solo authors who already own a novel and want to reach more readers without managing a full translation team.

## Core Journey

1. The author imports a novel or chapter.
2. The system extracts names, places, terms, tone rules, and glossary entries into a story bible.
3. The author accepts or edits those story-bible rules.
4. The AI translates chapters into target languages using the approved rules.
5. The author edits the bilingual segment draft.
6. The author approves chapters.
7. The system builds a platform-ready package for manual posting.
8. The author can open Manhwa Studio to convert prose into panel prompts, character-consistent storyboard images, and regeneration notes.
9. The author signs in through OAuth-ready backend sessions and manages a mock subscription/credit balance.

## V1 Scope

- Black author workspace with library, story bible, translation editor, export studio, billing, and settings.
- Demo-mode data so the interface is usable without backend credentials.
- Clear integration points for Clerk auth, Stripe billing, and backend translation jobs.
- OAuth-ready account page using backend HttpOnly cookies without committed provider secrets.
- Billing page for plans, mock checkout completion, portal preview, and credit top-ups.
- Platform-ready package flow before true external auto-posting.
- Manhwa Studio with style presets, panel count control, prompt copying, and per-panel regeneration.

## Later Scope

- Official platform publishing adapters.
- Team roles and assigned review tasks.
- EPUB import.
- Translation memory and vector search over prior chapters.
- Royalty and revenue analytics.
