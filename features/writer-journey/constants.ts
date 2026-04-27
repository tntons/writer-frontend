import type { ImportForm, Platform, StageId } from "./types";

export const sampleSource = `Chapter 1

ReadNovelFull.me

Mira Sol waited beneath Blackwater Gate while the rain turned the street silver. Kael had warned her that the Nightmare Spell never called the same name twice, but the old bell was already ringing.

"S.h.i.t," Mira whispered. "If the First Nightmare opens here, everyone in the Ashen Market will remember us."`;

export const initialImportForm: ImportForm = {
  title: "Night Market Trial",
  authorName: "Demo Author",
  synopsis: "A young courier reaches the market before a forbidden trial begins.",
  sourceLanguage: "en",
  targetLanguage: "es",
  sourceText: sampleSource,
  preferences: {
    tone: "faithful",
    audience: "general",
    preserveHonorifics: true,
    preserveNames: true,
    dialogueStyle: "natural",
  },
};

export const stages: Array<{ id: StageId; label: string; helper: string }> = [
  { id: "import", label: "Import", helper: "Clean source" },
  { id: "bible", label: "Story Bible", helper: "Lock names" },
  { id: "translate", label: "Translate", helper: "Draft chapters" },
  { id: "review", label: "Review", helper: "Edit segments" },
  { id: "qa", label: "QA", helper: "Catch issues" },
  { id: "export", label: "Export", helper: "Package files" },
];

export const platforms: Array<{ id: Platform; label: string }> = [
  { id: "webnovel", label: "Webnovel" },
  { id: "wattpad", label: "Wattpad" },
  { id: "royal-road", label: "Royal Road" },
  { id: "generic", label: "Generic ZIP" },
];

export const reviewFilters = [
  { id: "all", label: "All" },
  { id: "needs-review", label: "Needs review" },
  { id: "edited", label: "Edited" },
  { id: "approved", label: "Approved" },
  { id: "glossary", label: "Glossary hits" },
] as const;

export const toneOptions = [
  { id: "faithful", label: "Faithful" },
  { id: "cinematic", label: "Cinematic" },
  { id: "plain", label: "Plain" },
  { id: "dramatic", label: "Dramatic" },
] as const;
