import type { ManhwaForm, ManhwaPanel, ManhwaProjectDetail } from "../types";

function normalizeText(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function splitSentences(value: string) {
  return normalizeText(value).split(/(?<=[.!?])\s+/).map((line) => line.trim()).filter(Boolean);
}

function hashText(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function extractNames(value: string) {
  const matches = value.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g) ?? [];
  return [...new Set(matches.filter((name) => !["Chapter", "The", "Aspirant"].includes(name)))].slice(0, 4);
}

function extractDialogue(value: string) {
  return [...value.matchAll(/["“]([^"”]{1,140})["”]/g)].map((match) => match[1] ?? "").filter(Boolean).slice(0, 2);
}

function svgDataUrl(panel: Pick<ManhwaPanel, "order" | "sceneSummary" | "camera" | "mood" | "seed">, title: string) {
  const hue = panel.seed % 360;
  const escapedTitle = title.replace(/[<>&"]/g, "");
  const escapedSummary = panel.sceneSummary.replace(/[<>&"]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#050505"/><stop offset="1" stop-color="hsl(${hue} 70% 30%)"/></linearGradient></defs><rect width="900" height="1400" fill="url(#g)"/><circle cx="610" cy="210" r="190" fill="hsl(${hue} 90% 70%)" opacity=".45"/><ellipse cx="390" cy="650" rx="150" ry="310" fill="#080808" stroke="#f4f4f5" stroke-width="8"/><circle cx="390" cy="360" r="92" fill="#111" stroke="#f4f4f5" stroke-width="6"/><rect x="70" y="80" width="280" height="60" rx="8" fill="#f4f4f5"/><text x="100" y="120" font-family="Arial" font-weight="700" font-size="28" fill="#050505">PANEL ${panel.order}</text><rect x="70" y="1040" width="760" height="220" rx="8" fill="#f4f4f5"/><text x="105" y="1098" font-family="Arial" font-weight="700" font-size="28" fill="#050505">${escapedTitle}</text><text x="105" y="1150" font-family="Arial" font-size="26" fill="#18181b">${escapedSummary.slice(0, 52)}</text><text x="105" y="1200" font-family="Arial" font-size="24" fill="#3f3f46">${panel.camera} / ${panel.mood}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createLocalManhwaProject(form: ManhwaForm, variant?: { panelId: string; prompt: string }): ManhwaProjectDetail {
  const cleaned = normalizeText(form.sourceText);
  const sentences = splitSentences(cleaned);
  const panelTotal = Math.max(3, Math.min(form.panelCount, Math.max(3, sentences.length || 3)));
  const createdAt = new Date().toISOString();
  const projectId = "local-manhwa-project";
  const panels: ManhwaPanel[] = Array.from({ length: panelTotal }, (_, index) => {
    const order = index + 1;
    const sentence = sentences[index % Math.max(sentences.length, 1)] ?? cleaned;
    const dialogue = extractDialogue(sentence);
    const seed = hashText(`${form.title}:${order}:${sentence}:${variant?.prompt ?? ""}`);
    const panelId = `local-panel-${order}`;
    const sceneSummary = sentence.length > 160 ? `${sentence.slice(0, 157)}...` : sentence;
    const camera = ["wide establishing shot", "close-up reaction shot", "low angle reveal", "over-the-shoulder frame"][
      index % 4
    ] ?? "medium shot";
    const mood = ["tense", "ominous", "urgent", "quiet"][seed % 4] ?? "mysterious";

    return {
      id: panelId,
      projectId,
      order,
      sourceExcerpt: sentence,
      sceneSummary,
      dialogue,
      imagePrompt: [
        `${form.stylePreset} manhwa panel for ${form.title}`,
        sceneSummary,
        `Characters: ${extractNames(sentence).join(", ") || "novel cast"}.`,
        `Camera: ${camera}. Mood: ${mood}.`,
        variant?.panelId === panelId ? `Revision: ${variant.prompt}.` : "",
      ].join(" "),
      negativePrompt: "blurry, watermark, logo, unreadable text, distorted face",
      camera,
      mood,
      characters: extractNames(sentence),
      setting: sentence.toLowerCase().includes("police") ? "police station" : "novel scene",
      status: variant?.panelId === panelId ? "regenerated" : "image_ready",
      imageUrl: svgDataUrl({ order, sceneSummary, camera, mood, seed }, form.title),
      seed,
      createdAt,
      updatedAt: createdAt,
    };
  });

  return {
    project: {
      id: projectId,
      title: form.title,
      stylePreset: form.stylePreset,
      aspectRatio: form.aspectRatio,
      status: variant ? "needs_review" : "storyboard_ready",
      panelCount: panels.length,
      estimatedCredits: panels.length * 18,
      consumedCredits: panels.length * 18 + (variant ? 18 : 0),
      createdAt,
      updatedAt: createdAt,
    },
    panels,
    productionChecklist: [
      { label: "Character names detected", complete: panels.some((panel) => panel.characters.length > 0) },
      { label: "Panel prompts ready", complete: true },
      { label: "Dialogue extracted for bubbles", complete: panels.some((panel) => panel.dialogue.length > 0) },
      { label: "Image previews generated", complete: true },
    ],
  };
}
