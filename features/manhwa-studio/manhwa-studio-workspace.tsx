"use client";

/* eslint-disable @next/next/no-img-element -- Generated previews can be backend SVG or data URLs. */

import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clipboard,
  Film,
  ImageIcon,
  Loader2,
  RefreshCcw,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { aspectOptions, startingSource, styleOptions } from "./constants";
import { apiBase, createManhwaProject, loadNightmareChapter, panelImageUrl, regeneratePanel } from "./lib/api";
import { createLocalManhwaProject } from "./lib/local-manhwa";
import type { ManhwaForm, ManhwaPanel, ManhwaProjectDetail } from "./types";

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "lime" | "rose" }) {
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

function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="text-xs font-medium text-zinc-500">{children}</span>;
}

function PanelPreview({
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

export function ManhwaStudioWorkspace() {
  const [form, setForm] = useState<ManhwaForm>({
    title: "Nightmare Begins",
    sourceText: startingSource,
    stylePreset: "cinematic",
    aspectRatio: "9:16",
    panelCount: 6,
  });
  const [detail, setDetail] = useState<ManhwaProjectDetail>(() => createLocalManhwaProject({
    title: "Nightmare Begins",
    sourceText: startingSource,
    stylePreset: "cinematic",
    aspectRatio: "9:16",
    panelCount: 6,
  }));
  const [selectedPanelId, setSelectedPanelId] = useState(detail.panels[0]?.id ?? "");
  const [message, setMessage] = useState("Local storyboard is ready. Generate to save it through the backend.");
  const [revisionPrompt, setRevisionPrompt] = useState("make the lighting colder and keep the character face consistent");
  const [copied, setCopied] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  const selectedPanel = useMemo(
    () => detail.panels.find((panel) => panel.id === selectedPanelId) ?? detail.panels[0],
    [detail.panels, selectedPanelId],
  );
  const detectedCharacters = useMemo(
    () => [...new Set(detail.panels.flatMap((panel) => panel.characters))],
    [detail.panels],
  );
  const hasBackendProject = !detail.project.id.startsWith("local-");

  function updateForm<Key extends keyof ManhwaForm>(key: Key, value: ManhwaForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function generateStoryboard() {
    setIsWorking(true);
    try {
      setMessage("Generating storyboard, prompts, and image previews...");
      const created = await createManhwaProject(form);
      setDetail(created);
      setSelectedPanelId(created.panels[0]?.id ?? "");
      setMessage("Backend storyboard created. Panels are saved and ready for review.");
    } catch (error) {
      const local = createLocalManhwaProject(form);
      setDetail(local);
      setSelectedPanelId(local.panels[0]?.id ?? "");
      setMessage(error instanceof Error ? `Backend unavailable, using local preview: ${error.message}` : "Backend unavailable, using local preview.");
    } finally {
      setIsWorking(false);
    }
  }

  async function loadSample() {
    setIsWorking(true);
    try {
      setMessage("Loading the long Nightmare sample...");
      const sourceText = await loadNightmareChapter();
      setForm((current) => ({ ...current, title: "Nightmare Begins", sourceText, panelCount: 8 }));
      setMessage("Full sample loaded. Generate when you are ready.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load sample.");
    } finally {
      setIsWorking(false);
    }
  }

  async function regenerateSelectedPanel() {
    if (!selectedPanel) return;
    setIsWorking(true);
    try {
      setMessage(`Regenerating panel ${selectedPanel.order}...`);
      if (!hasBackendProject) {
        const local = createLocalManhwaProject(form, { panelId: selectedPanel.id, prompt: revisionPrompt });
        setDetail(local);
        setMessage("Local panel variant regenerated.");
        return;
      }

      const updated = await regeneratePanel({
        projectId: detail.project.id,
        panelId: selectedPanel.id,
        variantPrompt: revisionPrompt,
      });
      setDetail(updated);
      setMessage(`Panel ${selectedPanel.order} regenerated and saved.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not regenerate panel.");
    } finally {
      setIsWorking(false);
    }
  }

  async function copyPrompt() {
    if (!selectedPanel) return;
    await navigator.clipboard?.writeText(selectedPanel.imagePrompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-100">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-white/10 bg-black lg:border-b-0 lg:border-r">
          <div className="sticky top-0 flex h-full flex-col gap-5 p-4">
            <div>
              <Link href="/" className="text-xs font-medium uppercase text-lime-200">
                WriterBridge
              </Link>
              <h1 className="mt-3 text-2xl font-semibold text-white">Manhwa Studio</h1>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Turn chapter prose into a panel plan, consistent image prompts, and editable comic previews.
              </p>
            </div>

            <nav className="grid gap-2">
              <Link
                href="/journey"
                className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-3 text-sm font-semibold text-zinc-200 hover:border-white/30"
              >
                Translation Journey
              </Link>
              <Link
                href="/chapter-mock"
                className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-3 text-sm font-semibold text-zinc-200 hover:border-white/30"
              >
                Chapter Review
              </Link>
            </nav>

            <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
              <p className="text-xs font-medium uppercase text-zinc-500">Production checklist</p>
              <div className="mt-4 grid gap-3">
                {detail.productionChecklist.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <CheckCircle2 className={classNames("mt-0.5 h-4 w-4", item.complete ? "text-lime-300" : "text-zinc-600")} />
                    <p className="text-sm leading-5 text-zinc-300">{item.label}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
              <p className="text-xs font-medium uppercase text-zinc-500">Character continuity</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {detectedCharacters.length ? (
                  detectedCharacters.slice(0, 8).map((name) => <Pill key={name}>{name}</Pill>)
                ) : (
                  <p className="text-sm leading-6 text-zinc-500">Generate panels to detect recurring cast names.</p>
                )}
              </div>
            </section>

            <div className="mt-auto rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
              <p className="text-xs font-medium uppercase text-zinc-500">Backend</p>
              <p className="mt-2 break-all text-xs text-zinc-500">{apiBase()}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{message}</p>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="border-b border-white/10 px-5 py-5 lg:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-zinc-500">Novel to comic workflow</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">{detail.project.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                  Writers need control before art cost explodes: scene beats, cast names, style, speech bubble intent, and prompts all stay visible.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Pill tone="lime">{detail.panels.length} panels</Pill>
                <Pill>{detail.project.stylePreset}</Pill>
                <Pill>{detail.project.consumedCredits} credits</Pill>
                <Pill tone={hasBackendProject ? "lime" : "rose"}>{hasBackendProject ? "saved" : "local preview"}</Pill>
              </div>
            </div>
          </header>

          <div className="grid gap-6 px-5 py-6 xl:grid-cols-[380px_minmax(0,1fr)_360px] lg:px-8">
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
                  {isWorking ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
                  Generate manhwa panels
                </button>
                <button
                  type="button"
                  onClick={loadSample}
                  disabled={isWorking}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 px-4 text-sm font-semibold text-zinc-200 hover:border-white/30 disabled:opacity-50"
                >
                  <Film className="h-4 w-4" />
                  Load full Nightmare sample
                </button>
              </div>
            </section>

            <section className="min-w-0">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase text-zinc-500">Storyboard</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">Select a panel to edit the prompt</h3>
                </div>
                <Pill>{detail.project.status.replace("_", " ")}</Pill>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {detail.panels.map((panel) => (
                  <PanelPreview
                    key={panel.id}
                    panel={panel}
                    selected={panel.id === selectedPanel?.id}
                    onSelect={() => setSelectedPanelId(panel.id)}
                  />
                ))}
              </div>
            </section>

            <aside className="space-y-5">
              {selectedPanel ? (
                <>
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
                        <Clipboard className="h-4 w-4" />
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
                      {isWorking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                      Regenerate selected panel
                    </button>
                  </section>
                </>
              ) : null}
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
