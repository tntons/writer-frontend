import type { ImportForm, SegmentStatus, WorkflowReview } from "../types";
import { splitParagraphs, wordCount } from "./format";

function makeLocalId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cleanLocalSource(sourceText: string) {
  const watermarks = sourceText.match(/^\s*(?:ReadNovelFull\.me|readnovelfull\.me|webnovel\.com|wattpad\.com)\s*$/gim) ?? [];
  const dotted = sourceText.match(/\b[A-Za-z]+(?:\.[A-Za-z]+)+\b/g) ?? [];
  const cleanedText = sourceText
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => !/^\s*(?:ReadNovelFull\.me|readnovelfull\.me|webnovel\.com|wattpad\.com)\s*$/i.test(line))
    .join("\n")
    .replace(/\b[A-Za-z]+(?:\.[A-Za-z]+)+\b/g, (artifact) => artifact.replace(/\./g, ""))
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    cleanedText,
    cleaning: [
      ...(watermarks.length
        ? [
            {
              id: makeLocalId("clean"),
              severity: "warning" as const,
              title: "Possible source watermark",
              message: `Detected ${watermarks.length} standalone source label. It was removed in the local import.`,
            },
          ]
        : []),
      ...(dotted.length
        ? [
            {
              id: makeLocalId("clean"),
              severity: "warning" as const,
              title: "Filtered word artifacts",
              message: `Detected dotted words such as ${Array.from(new Set(dotted)).slice(0, 5).join(", ")}.`,
            },
          ]
        : []),
    ],
  };
}

function splitLocalSegments(text: string) {
  const paragraphs = splitParagraphs(text);
  return (paragraphs.length ? paragraphs : [text]).flatMap((paragraph) =>
    paragraph.length > 520 ? paragraph.split(/(?<=[.!?])\s+/).filter(Boolean) : [paragraph],
  );
}

function extractLocalStoryBible(text: string, novelId: string): WorkflowReview["storyBible"] {
  const stopWords = new Set([
    "A",
    "An",
    "And",
    "Chapter",
    "He",
    "Her",
    "His",
    "If",
    "In",
    "It",
    "No",
    "Oh",
    "She",
    "The",
    "Then",
    "They",
    "This",
    "What",
    "When",
    "With",
    "You",
  ]);
  const phrases = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b/g) ?? [];
  const names = Array.from(
    new Set(phrases.filter((phrase) => !stopWords.has(phrase) && !stopWords.has(phrase.split(/\s+/)[0] ?? ""))),
  ).slice(0, 14);

  return names.map((name) => {
    const lower = name.toLowerCase();
    const kind: WorkflowReview["storyBible"][number]["kind"] =
      /gate|market|keep|city|realm|station|lobby/.test(lower)
        ? "place"
        : /spell|nightmare|directive|aspect|attribute|memory|echo|trial/.test(lower)
          ? "term"
          : "character";
    const evidence = text.split(/(?<=[.!?])\s+/).find((sentence) => sentence.includes(name)) ?? text;
    return {
      id: `${novelId}-${name.toLowerCase().replace(/\W+/g, "-")}`,
      kind,
      name,
      canonicalName: name,
      description:
        kind === "place"
          ? `Place or location referenced in the source text. ${evidence.slice(0, 130)}`
          : kind === "term"
            ? `Recurring term or story object. ${evidence.slice(0, 130)}`
            : `Character referenced in the source text. ${evidence.slice(0, 130)}`,
      rule: evidence.slice(0, 150),
      locked: true,
      confidence: 0.72,
    };
  });
}

function localTranslate(sourceText: string, targetLanguage: string) {
  if (targetLanguage !== "es") return `[${targetLanguage} local draft] ${sourceText}`;
  const phraseMap: Array<[RegExp, string]> = [
    [/\bNightmare Spell\b/g, "Hechizo de la Pesadilla"],
    [/\bFirst Nightmare\b/g, "Primera Pesadilla"],
    [/\bDream Realm\b/g, "Reino de los Suenos"],
    [/\bNightmare Creature\b/g, "Criatura de Pesadilla"],
  ];
  const wordMap: Record<string, string> = {
    a: "un",
    and: "y",
    are: "son",
    black: "negro",
    chapter: "capitulo",
    city: "ciudad",
    coffee: "cafe",
    dark: "oscuro",
    first: "primera",
    he: "el",
    in: "en",
    name: "nombre",
    old: "viejo",
    spell: "hechizo",
    the: "el",
    to: "a",
    was: "estaba",
    with: "con",
  };
  let draft = sourceText;
  for (const [source, target] of phraseMap) draft = draft.replace(source, target);
  return draft.replace(/\b[A-Za-z][A-Za-z'-]*\b/g, (token) => wordMap[token.toLowerCase()] ?? token);
}

export function isLocalProject(projectId: string) {
  return projectId.startsWith("local-project");
}

export function createLocalId(prefix: string) {
  return makeLocalId(prefix);
}

export function buildLocalReview(form: ImportForm, translated = false): WorkflowReview {
  const novelId = makeLocalId("local-novel");
  const projectId = makeLocalId("local-project");
  const { cleanedText, cleaning } = cleanLocalSource(form.sourceText);
  const segmentTexts = splitLocalSegments(cleanedText);
  const storyBible = extractLocalStoryBible(cleanedText, novelId);
  const lockedTerms = storyBible.flatMap((item) => [item.canonicalName, item.name]);
  const estimatedCredits = Math.max(12, Math.ceil(wordCount(cleanedText) / 55));
  const segments = segmentTexts.map((sourceText, index) => ({
    id: `${projectId}-segment-${index + 1}`,
    order: index + 1,
    sourceText,
    translatedText: translated ? localTranslate(sourceText, form.targetLanguage) : "",
    status: (translated ? "translated" : "draft") as SegmentStatus,
    notes: translated ? "Local fallback translation. Review before approval." : "",
    lockedTerms,
  }));

  return {
    project: {
      novelId,
      projectId,
      title: form.title,
      authorName: form.authorName,
      sourceLanguage: form.sourceLanguage,
      targetLanguage: form.targetLanguage,
      targetLanguageLabel: form.targetLanguage === "es" ? "Spanish" : form.targetLanguage,
      status: translated ? "needs_review" : "draft",
      reviewState: translated ? "in_review" : "not_started",
      progress: translated ? 1 : 0,
      wordCount: wordCount(cleanedText),
      segmentCount: segments.length,
      creditEstimate: estimatedCredits,
      consumedCredits: translated ? estimatedCredits : 0,
      approvedSegments: 0,
      editedSegments: 0,
      qaOpen: cleaning.length,
      fullSourceText: cleanedText,
      fullTranslatedText: segments.map((segment) => segment.translatedText || segment.sourceText).join("\n\n"),
    },
    cleaning,
    storyBible,
    segments: segments.map((segment) => ({
      ...segment,
      notes: translated
        ? `${segment.notes} Tone: ${form.preferences.tone}. Dialogue: ${form.preferences.dialogueStyle}.`
        : segment.notes,
    })),
    qaFindings: cleaning.map((finding) => ({
      id: makeLocalId("qa"),
      severity: finding.severity,
      code: `LOCAL_${finding.title.toUpperCase().replace(/\W+/g, "_")}`,
      title: finding.title,
      message: finding.message,
      resolved: false,
    })),
    exports: [],
    exportBundle: {
      status: cleaning.length ? "blocked" : "preview",
      files: ["chapter.txt", "chapter.md", "story-bible.json", "qa-report.json", "platform-metadata.csv"],
    },
  };
}
