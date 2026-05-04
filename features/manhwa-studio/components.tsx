/* eslint-disable @next/next/no-img-element -- Generated previews can be backend SVG or data URLs. */

import {
  BookOpen,
  Clipboard,
  Film,
  ImageIcon,
  Loader2,
  RefreshCcw,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { aspectOptions, styleOptions } from "./constants";
import { panelImageUrl } from "./lib/api";
import type { ManhwaForm, ManhwaPanel } from "./types";

export function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "lime" | "rose" }) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
        tone === "lime"
          ? "border-lime-300/40 bg-lime-300/10 text-lime-100"
          : tone === "rose"
            ? "border-rose-300/40 bg-rose-300/10 text-rose-100"
            : "border-white/10 bg-white/[0.04] text-zinc-300",
      )}
    >
      {children}
    </span>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="text-xs font-medium text-zinc-500">{children}</span>;
}

export function PanelPreview({
  panel,
  selected,
  onSelect,
}: {
  panel: ManhwaPanel;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={classNames(
        "grid w-full gap-3 rounded-lg border bg-[#0d0d0d] p-3 text-left transition hover:border-white/30",
        selected ? "border-lime-300/60" : "border-white/10",
      )}
    >
      <div className="relative aspect-[9/14] overflow-hidden rounded-md border border-white/10 bg-black">
        <img src={panelImageUrl(panel.imageUrl)} alt={`Panel ${panel.order} preview`} className="h-full w-full object-cover" />
        <div className="absolute left-2 top-2 rounded-md bg-black/75 px-2 py-1 text-xs font-semibold text-white">
          Panel {panel.order}
        </div>
      </div>
      <div>
        <p className="line-clamp-2 text-sm font-semibold leading-5 text-white">{panel.sceneSummary}</p>
        <p className="mt-2 text-xs text-zinc-500">{panel.camera}</p>
      </div>
    </button>
  );
}

export function SourceChapterForm({
  form,
  isWorking,
  generateStoryboard,
  loadSample,
  updateForm,
}: {
  form: ManhwaForm;
  isWorking: boolean;
  generateStoryboard: () => void;
  loadSample: () => void;
  updateForm: <Key extends keyof ManhwaForm>(key: Key, value: ManhwaForm[Key]) => void;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-lime-200" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-white">Source Chapter</h3>
      </div>

      <label className="mt-5 block">
        <FieldLabel>Title</FieldLabel>
        <input
          value={form.title}
          onChange={(event) => updateForm("title", event.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-lime-300/60"
        />
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        <label className="block">
          <FieldLabel>Style</FieldLabel>
          <select
            value={form.stylePreset}
            onChange={(event) => updateForm("stylePreset", event.target.value as ManhwaForm["stylePreset"])}
            className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-lime-300/60"
          >
            {styleOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            {styleOptions.find((option) => option.id === form.stylePreset)?.helper}
          </p>
        </label>

        <label className="block">
          <FieldLabel>Canvas</FieldLabel>
          <select
            value={form.aspectRatio}
            onChange={(event) => updateForm("aspectRatio", event.target.value as ManhwaForm["aspectRatio"])}
            className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-lime-300/60"
          >
            {aspectOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 block">
        <FieldLabel>Panel count: {form.panelCount}</FieldLabel>
        <input
          type="range"
          min={3}
          max={12}
          value={form.panelCount}
          onChange={(event) => updateForm("panelCount", Number(event.target.value))}
          className="mt-3 w-full accent-lime-300"
        />
      </label>

      <label className="mt-4 block">
        <FieldLabel>Chapter prose</FieldLabel>
        <textarea
          value={form.sourceText}
          onChange={(event) => updateForm("sourceText", event.target.value)}
          className="mt-2 min-h-[340px] w-full resize-y rounded-md border border-white/10 bg-black p-3 font-mono text-sm leading-6 text-zinc-100 outline-none focus:border-lime-300/60"
        />
      </label>

      <div className="mt-4 grid gap-2">
        <button
          type="button"
          onClick={generateStoryboard}
          disabled={isWorking || !form.sourceText.trim()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-lime-300 px-4 text-sm font-semibold text-black hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isWorking ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <WandSparkles className="h-4 w-4" aria-hidden="true" />}
          Generate manhwa panels
        </button>
        <button
          type="button"
          onClick={loadSample}
          disabled={isWorking}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 px-4 text-sm font-semibold text-zinc-200 hover:border-white/30 disabled:opacity-50"
        >
          <Film className="h-4 w-4" aria-hidden="true" />
          Load full Nightmare sample
        </button>
      </div>
    </section>
  );
}

export function SelectedPanelInspector({
  copied,
  isWorking,
  revisionPrompt,
  selectedPanel,
  copyPrompt,
  regenerateSelectedPanel,
  setRevisionPrompt,
}: {
  copied: boolean;
  isWorking: boolean;
  revisionPrompt: string;
  selectedPanel: ManhwaPanel;
  copyPrompt: () => void;
  regenerateSelectedPanel: () => void;
  setRevisionPrompt: (value: string) => void;
}) {
  return (
    <aside className="space-y-5">
      <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-lime-200" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-white">Panel {selectedPanel.order}</h3>
          </div>
          <Pill>{selectedPanel.status}</Pill>
        </div>

        <div className="mt-4 overflow-hidden rounded-md border border-white/10 bg-black">
          <img
            src={panelImageUrl(selectedPanel.imageUrl)}
            alt={`Selected panel ${selectedPanel.order}`}
            className="aspect-[9/14] w-full object-cover"
          />
        </div>

        <div className="mt-4 grid gap-3 text-sm leading-6 text-zinc-300">
          <p>
            <span className="text-zinc-500">Scene:</span> {selectedPanel.sceneSummary}
          </p>
          <p>
            <span className="text-zinc-500">Setting:</span> {selectedPanel.setting}
          </p>
          <p>
            <span className="text-zinc-500">Mood:</span> {selectedPanel.mood}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-lime-200" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-white">Image Prompt</h3>
        </div>
        <textarea
          readOnly
          value={selectedPanel.imagePrompt}
          className="mt-4 min-h-44 w-full resize-y rounded-md border border-white/10 bg-black p-3 text-sm leading-6 text-zinc-100 outline-none"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyPrompt}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-sm font-semibold text-zinc-200 hover:border-white/30"
          >
            <Clipboard className="h-4 w-4" aria-hidden="true" />
            {copied ? "Copied" : "Copy prompt"}
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
        <div className="flex items-center gap-2">
          <RefreshCcw className="h-4 w-4 text-lime-200" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-white">Regenerate</h3>
        </div>
        <label className="mt-4 block">
          <FieldLabel>Revision note</FieldLabel>
          <textarea
            value={revisionPrompt}
            onChange={(event) => setRevisionPrompt(event.target.value)}
            className="mt-2 min-h-24 w-full resize-y rounded-md border border-white/10 bg-black p-3 text-sm leading-6 text-zinc-100 outline-none focus:border-lime-300/60"
          />
        </label>
        <button
          type="button"
          onClick={regenerateSelectedPanel}
          disabled={isWorking}
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
        >
          {isWorking ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCcw className="h-4 w-4" aria-hidden="true" />}
          Regenerate selected panel
        </button>
      </section>
    </aside>
  );
}
