export function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function statusClass(value: string) {
  if (["approved", "completed", "ready", "preview"].includes(value.toLowerCase())) {
    return "border-lime-300/40 bg-lime-300/10 text-lime-100";
  }
  if (["translated", "edited", "needs_review", "warning", "in_review"].includes(value.toLowerCase())) {
    return "border-amber-300/40 bg-amber-300/10 text-amber-100";
  }
  if (["error", "blocked"].includes(value.toLowerCase())) {
    return "border-red-300/40 bg-red-300/10 text-red-100";
  }
  return "border-white/10 bg-white/[0.03] text-zinc-300";
}

export function splitParagraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function wordCount(text: string) {
  return text.match(/\b[\w']+\b/g)?.length ?? 0;
}

