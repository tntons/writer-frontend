import type { ManhwaAspectRatio, ManhwaStylePreset } from "./types";

export const styleOptions: Array<{
  id: ManhwaStylePreset;
  label: string;
  helper: string;
}> = [
  { id: "webtoon", label: "Webtoon", helper: "Clean color panels for vertical reading" },
  { id: "cinematic", label: "Cinematic", helper: "Film lighting and dramatic framing" },
  { id: "ink", label: "Ink", helper: "Black and white shadows for tense scenes" },
  { id: "shojo", label: "Shojo", helper: "Elegant fantasy emotion and soft effects" },
];

export const aspectOptions: Array<{
  id: ManhwaAspectRatio;
  label: string;
}> = [
  { id: "9:16", label: "Vertical 9:16" },
  { id: "4:5", label: "Panel 4:5" },
  { id: "1:1", label: "Square 1:1" },
];

export const startingSource = `Chapter 1

Sunny stood outside the police station with a cup of expensive coffee in his hands.

"Ah! So bitter!"

The officer frowned when Sunny said he was a carrier of the Nightmare Spell. A moment later, the lobby erupted into panic.

Everything became black. In the darkness, a familiar voice rang out.

[Aspirant! Welcome to the Nightmare Spell. Prepare for your First Trial...]`;
