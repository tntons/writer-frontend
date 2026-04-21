"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type View =
  | "dashboard"
  | "library"
  | "story"
  | "translation"
  | "export"
  | "billing"
  | "settings";

type BibleType = "Character" | "Place" | "Term" | "Style";

type StoryBibleItem = {
  id: string;
  type: BibleType;
  name: string;
  detail: string;
  rule: string;
  confidence: number;
  accepted: boolean;
};

type SegmentStatus = "Draft" | "Needs review" | "Approved";

type TranslationSegment = {
  id: string;
  chapter: string;
  source: string;
  translation: string;
  note: string;
  status: SegmentStatus;
};

const navItems: { id: View; label: string; helper: string }[] = [
  { id: "dashboard", label: "Dashboard", helper: "Today" },
  { id: "library", label: "Library", helper: "3 novels" },
  { id: "story", label: "Story Bible", helper: "18 items" },
  { id: "translation", label: "Translation", helper: "Spanish" },
  { id: "export", label: "Export", helper: "Ready" },
  { id: "billing", label: "Billing", helper: "Pro" },
  { id: "settings", label: "Settings", helper: "Defaults" },
];

const novels = [
  {
    id: "n-001",
    title: "Moonlit Sword Saint",
    language: "English",
    targets: ["Spanish", "Thai", "Indonesian"],
    chapters: 42,
    approved: 12,
    status: "Translating",
    updated: "Today, 01:16",
  },
  {
    id: "n-002",
    title: "The Alchemist's Second Dawn",
    language: "English",
    targets: ["Portuguese", "French"],
    chapters: 28,
    approved: 28,
    status: "Export ready",
    updated: "Yesterday",
  },
  {
    id: "n-003",
    title: "Glass City Reaper",
    language: "English",
    targets: ["Spanish"],
    chapters: 9,
    approved: 0,
    status: "Story bible",
    updated: "Apr 14",
  },
];

const initialBible: StoryBibleItem[] = [
  {
    id: "b-001",
    type: "Character",
    name: "Aren Vale",
    detail: "Main character. Former palace guard hiding under a merchant seal.",
    rule: "Keep full name unchanged in every language.",
    confidence: 97,
    accepted: true,
  },
  {
    id: "b-002",
    type: "Character",
    name: "Mira Sol",
    detail: "Healer, oath-bound to the Moonlit Order.",
    rule: "Do not translate Sol as sun.",
    confidence: 94,
    accepted: true,
  },
  {
    id: "b-003",
    type: "Place",
    name: "Blackwater Gate",
    detail: "Northern city gate where the first duel happens.",
    rule: "Translate meaning, keep title case.",
    confidence: 88,
    accepted: false,
  },
  {
    id: "b-004",
    type: "Term",
    name: "Moonlit Order",
    detail: "Religious knight order with silver tattoos.",
    rule: "Use one consistent localized term.",
    confidence: 91,
    accepted: true,
  },
  {
    id: "b-005",
    type: "Style",
    name: "Dialogue tone",
    detail: "Aren speaks formally when threatened and casually with Mira.",
    rule: "Preserve formality shifts.",
    confidence: 84,
    accepted: true,
  },
];

const initialSegments: TranslationSegment[] = [
  {
    id: "s-001",
    chapter: "Chapter 12",
    source:
      "Aren Vale stopped beneath Blackwater Gate and listened to the rain strike the old iron bells.",
    translation:
      "Aren Vale se detuvo bajo la Puerta de Aguas Negras y escucho la lluvia golpear las viejas campanas de hierro.",
    note: "Name preserved. Place localized.",
    status: "Approved",
  },
  {
    id: "s-002",
    chapter: "Chapter 12",
    source:
      "Mira Sol pressed a silver charm into his palm. \"If the Moonlit Order finds you, do not run.\"",
    translation:
      "Mira Sol le puso un amuleto de plata en la palma. \"Si la Orden de la Luz Lunar te encuentra, no corras.\"",
    note: "Check order glossary before approval.",
    status: "Needs review",
  },
  {
    id: "s-003",
    chapter: "Chapter 12",
    source:
      "He smiled because fear had always been easier to carry when someone gave it a name.",
    translation:
      "El sonrio porque el miedo siempre habia sido mas facil de cargar cuando alguien le daba un nombre.",
    note: "Tone looks stable.",
    status: "Draft",
  },
];

const platformRules = [
  "Title, synopsis, tags, and author note included",
  "Chapters exported as clean text and Markdown",
  "Character glossary attached for future translators",
  "Warnings included for manual platform posting",
];

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-md bg-white/10">
      <div
        className="h-full rounded-md bg-lime-300 transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function StatusBadge({ label }: { label: string }) {
  const color =
    label === "Approved" || label === "Export ready" || label === "Ready"
      ? "border-lime-300/40 bg-lime-300/10 text-lime-100"
      : label === "Needs review" || label === "Translating"
        ? "border-amber-300/40 bg-amber-300/10 text-amber-100"
        : "border-white/15 bg-white/5 text-zinc-300";

  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
        color,
      )}
    >
      {label}
    </span>
  );
}

export function DashboardWorkspace() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [storyBible, setStoryBible] = useState(initialBible);
  const [segments, setSegments] = useState(initialSegments);
  const [selectedSegmentId, setSelectedSegmentId] = useState("s-002");
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  const [apiStatus, setApiStatus] = useState<{
    state: "checking" | "online" | "offline";
    message: string;
  }>({ state: "checking", message: "Checking backend" });
  const [sourceDraft, setSourceDraft] = useState(
    "Aren Vale drew the moonlit blade. Mira Sol watched the old oath burn across the steel.",
  );
  const [exportState, setExportState] = useState("Ready to build");

  const selectedSegment =
    segments.find((segment) => segment.id === selectedSegmentId) ?? segments[0];

  const approvedCount = segments.filter(
    (segment) => segment.status === "Approved",
  ).length;

  const acceptedBibleCount = storyBible.filter((item) => item.accepted).length;

  useEffect(() => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
      "http://127.0.0.1:4001";

    const controller = new AbortController();

    fetch(`${apiUrl}/health`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Backend health check failed");
        }
        return response.json() as Promise<{
          counts?: { novels?: number; projects?: number };
        }>;
      })
      .then((payload) => {
        setApiStatus({
          state: "online",
          message: `${payload.counts?.novels ?? 0} novels, ${
            payload.counts?.projects ?? 0
          } projects`,
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setApiStatus({
          state: "offline",
          message: "Demo mode is active",
        });
      });

    return () => controller.abort();
  }, []);

  const packageScore = useMemo(() => {
    const segmentScore = Math.round((approvedCount / segments.length) * 50);
    const bibleScore = Math.round((acceptedBibleCount / storyBible.length) * 35);
    return segmentScore + bibleScore + 15;
  }, [acceptedBibleCount, approvedCount, segments.length, storyBible.length]);

  function updateSelectedTranslation(value: string) {
    setSegments((current) =>
      current.map((segment) =>
        segment.id === selectedSegment.id
          ? { ...segment, translation: value, status: "Needs review" }
          : segment,
      ),
    );
  }

  function approveSelectedSegment() {
    setSegments((current) =>
      current.map((segment) =>
        segment.id === selectedSegment.id
          ? { ...segment, status: "Approved" }
          : segment,
      ),
    );
  }

  function mockTranslateDraft() {
    const newSegment: TranslationSegment = {
      id: `s-${String(segments.length + 1).padStart(3, "0")}`,
      chapter: "Imported draft",
      source: sourceDraft,
      translation:
        targetLanguage === "Spanish"
          ? sourceDraft
              .replaceAll("moonlit blade", "hoja iluminada por la luna")
              .replaceAll("old oath", "viejo juramento")
              .replaceAll("watched", "observo")
          : `[${targetLanguage}] ${sourceDraft}`,
      note: "Demo translation. Real AI jobs run through the backend pipeline.",
      status: "Needs review",
    };

    setSegments((current) => [...current, newSegment]);
    setSelectedSegmentId(newSegment.id);
    setActiveView("translation");
  }

  function buildExportPackage() {
    setExportState("Package built");
    setActiveView("export");
  }

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-100">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-[#080808] px-4 py-4 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between lg:block">
            <div>
              <p className="text-xs font-semibold uppercase text-lime-200">
                WriterBridge
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white">
                Novel translation desk
              </h1>
            </div>
            <div className="rounded-md border border-lime-300/30 bg-lime-300/10 px-3 py-2 text-right lg:mt-6 lg:text-left">
              <p className="text-xs text-zinc-400">Credits</p>
              <p className="text-lg font-semibold text-lime-100">18,420</p>
            </div>
          </div>

          <nav className="mt-6 grid gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={classNames(
                  "flex min-h-12 items-center justify-between rounded-md border px-3 py-2 text-left transition",
                  activeView === item.id
                    ? "border-lime-300/50 bg-lime-300/10 text-white"
                    : "border-white/10 bg-white/[0.02] text-zinc-300 hover:border-white/25 hover:bg-white/[0.05]",
                )}
              >
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-zinc-500">{item.helper}</span>
              </button>
            ))}
          </nav>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-xs font-medium uppercase text-zinc-500">
              Current novel
            </p>
            <p className="mt-2 text-base font-semibold text-white">
              Moonlit Sword Saint
            </p>
            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                <span>Export readiness</span>
                <span>{packageScore}%</span>
              </div>
              <ProgressBar value={packageScore} />
            </div>
          </div>

          <div className="mt-6 rounded-md border border-white/10 bg-black p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase text-zinc-500">
                Backend
              </p>
              <span
                className={classNames(
                  "h-2 w-2 rounded-md",
                  apiStatus.state === "online"
                    ? "bg-lime-300"
                    : apiStatus.state === "checking"
                      ? "bg-amber-300"
                      : "bg-zinc-600",
                )}
              />
            </div>
            <p className="mt-2 text-sm text-zinc-300">{apiStatus.message}</p>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="flex flex-col gap-4 border-b border-white/10 bg-[#090909] px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-zinc-400">
                Source English to {targetLanguage}
              </p>
              <h2 className="mt-1 text-3xl font-semibold text-white">
                Make the next chapter ready for readers
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Spanish", "Thai", "Indonesian", "Portuguese"].map(
                (language) => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => setTargetLanguage(language)}
                    className={classNames(
                      "h-10 rounded-md border px-3 text-sm transition",
                      targetLanguage === language
                        ? "border-lime-300/50 bg-lime-300 text-black"
                        : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/30",
                    )}
                  >
                    {language}
                  </button>
                ),
              )}
            </div>
          </header>

          <div className="p-5">
            {activeView === "dashboard" && (
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_360px]">
                <section className="grid gap-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Metric
                      label="Chapters approved"
                      value="12"
                      helper="30 waiting"
                    />
                    <Metric
                      label="Story bible locked"
                      value={`${acceptedBibleCount}/${storyBible.length}`}
                      helper="Names and terms"
                    />
                    <Metric
                      label="Export packages"
                      value="4"
                      helper="Across 2 novels"
                    />
                  </div>

                  <div className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
                    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
                      <div>
                        <p className="text-xs font-medium uppercase text-zinc-500">
                          Fast import
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-white">
                          Paste a scene and create an editable translation
                        </h3>
                        <textarea
                          value={sourceDraft}
                          onChange={(event) => setSourceDraft(event.target.value)}
                          className="mt-4 min-h-36 w-full resize-y rounded-md border border-white/10 bg-black p-3 text-sm leading-6 text-zinc-100 outline-none focus:border-lime-300/60"
                        />
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={mockTranslateDraft}
                            className="h-11 rounded-md bg-lime-300 px-4 text-sm font-semibold text-black hover:bg-lime-200"
                          >
                            Create demo translation
                          </button>
                          <a
                            href="/chapter-mock"
                            className="grid h-11 place-items-center rounded-md bg-white px-4 text-sm font-semibold text-black hover:bg-zinc-200"
                          >
                            Open chapter mock
                          </a>
                          <a
                            href="/journey"
                            className="grid h-11 place-items-center rounded-md border border-white/10 px-4 text-sm font-semibold text-zinc-200 hover:border-white/30"
                          >
                            Open writer journey
                          </a>
                          <button
                            type="button"
                            onClick={() => setActiveView("story")}
                            className="h-11 rounded-md border border-white/10 px-4 text-sm font-semibold text-zinc-200 hover:border-white/30"
                          >
                            Review story bible
                          </button>
                        </div>
                      </div>
                      <div className="relative min-h-72 overflow-hidden rounded-lg border border-white/10">
                        <Image
                          src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80"
                          alt="Writer desk with manuscript pages"
                          fill
                          sizes="(min-width: 1024px) 300px, 100vw"
                          className="object-cover opacity-70"
                          priority
                        />
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-sm font-medium text-white">
                            Keep names steady across every chapter.
                          </p>
                          <p className="mt-2 text-xs leading-5 text-zinc-300">
                            Accepted terms become translation rules before the
                            next AI job starts.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase text-zinc-500">
                          Active chapter
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-white">
                          Chapter 12 review
                        </h3>
                      </div>
                      <StatusBadge label="Needs review" />
                    </div>
                    <div className="mt-4 grid gap-3">
                      {segments.slice(0, 3).map((segment) => (
                        <button
                          key={segment.id}
                          type="button"
                          onClick={() => {
                            setSelectedSegmentId(segment.id);
                            setActiveView("translation");
                          }}
                          className="rounded-md border border-white/10 bg-black p-3 text-left hover:border-lime-300/40"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-white">
                              {segment.chapter}
                            </p>
                            <StatusBadge label={segment.status} />
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">
                            {segment.source}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                <aside className="grid gap-5">
                  <PanelTitle
                    eyebrow="Run queue"
                    title="Pipeline"
                    body="Import, extract, translate, review, export."
                  />
                  <Timeline />
                  <PanelTitle
                    eyebrow="Billing"
                    title="Pro plan"
                    body="28,000 monthly credits. Top-ups enabled."
                  />
                  <button
                    type="button"
                    onClick={() => setActiveView("billing")}
                    className="h-11 rounded-md border border-white/10 text-sm font-semibold text-zinc-200 hover:border-white/30"
                  >
                    Manage credits
                  </button>
                </aside>
              </div>
            )}

            {activeView === "library" && (
              <div className="grid gap-4">
                <PageIntro
                  eyebrow="Library"
                  title="Novels moving through translation"
                  body="Each book keeps its own language targets, glossary, export packages, and billing usage."
                />
                <div className="grid gap-3">
                  {novels.map((novel) => (
                    <article
                      key={novel.id}
                      className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-semibold text-white">
                              {novel.title}
                            </h3>
                            <StatusBadge label={novel.status} />
                          </div>
                          <p className="mt-2 text-sm text-zinc-400">
                            {novel.language} source. {novel.chapters} chapters.
                            Updated {novel.updated}.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveView("translation")}
                          className="h-10 rounded-md bg-white px-4 text-sm font-semibold text-black hover:bg-zinc-200"
                        >
                          Open workspace
                        </button>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px]">
                        <div className="flex flex-wrap gap-2">
                          {novel.targets.map((target) => (
                            <span
                              key={target}
                              className="rounded-md border border-white/10 bg-black px-2 py-1 text-xs text-zinc-300"
                            >
                              {target}
                            </span>
                          ))}
                        </div>
                        <div>
                          <div className="mb-2 flex justify-between text-xs text-zinc-500">
                            <span>Approved</span>
                            <span>
                              {novel.approved}/{novel.chapters}
                            </span>
                          </div>
                          <ProgressBar
                            value={(novel.approved / novel.chapters) * 100}
                          />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {activeView === "story" && (
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                <section className="grid gap-4">
                  <PageIntro
                    eyebrow="Story bible"
                    title="Lock the names before translation"
                    body="Accepted items become instructions for every chapter job and every export package."
                  />
                  <div className="grid gap-3">
                    {storyBible.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-md border border-white/10 bg-black px-2 py-1 text-xs text-zinc-400">
                                {item.type}
                              </span>
                              <h3 className="text-lg font-semibold text-white">
                                {item.name}
                              </h3>
                              <span className="text-xs text-zinc-500">
                                {item.confidence}% confidence
                              </span>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-zinc-300">
                              {item.detail}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-lime-100">
                              Rule: {item.rule}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setStoryBible((current) =>
                                current.map((entry) =>
                                  entry.id === item.id
                                    ? { ...entry, accepted: !entry.accepted }
                                    : entry,
                                ),
                              )
                            }
                            className={classNames(
                              "h-10 rounded-md border px-4 text-sm font-semibold",
                              item.accepted
                                ? "border-lime-300/40 bg-lime-300 text-black"
                                : "border-white/10 text-zinc-300 hover:border-white/30",
                            )}
                          >
                            {item.accepted ? "Accepted" : "Accept"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
                <aside className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
                  <p className="text-xs font-medium uppercase text-zinc-500">
                    Translation rules
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-white">
                    What the AI receives
                  </h3>
                  <div className="mt-4 grid gap-3">
                    {storyBible
                      .filter((item) => item.accepted)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="rounded-md border border-white/10 bg-black p-3"
                        >
                          <p className="text-sm font-medium text-white">
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-zinc-400">
                            {item.rule}
                          </p>
                        </div>
                      ))}
                  </div>
                </aside>
              </div>
            )}

            {activeView === "translation" && (
              <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
                <aside className="rounded-lg border border-white/10 bg-[#0d0d0d] p-3">
                  <p className="px-1 text-xs font-medium uppercase text-zinc-500">
                    Segments
                  </p>
                  <div className="mt-3 grid gap-2">
                    {segments.map((segment) => (
                      <button
                        key={segment.id}
                        type="button"
                        onClick={() => setSelectedSegmentId(segment.id)}
                        className={classNames(
                          "rounded-md border p-3 text-left",
                          selectedSegment.id === segment.id
                            ? "border-lime-300/50 bg-lime-300/10"
                            : "border-white/10 bg-black hover:border-white/30",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-white">
                            {segment.id.toUpperCase()}
                          </span>
                          <StatusBadge label={segment.status} />
                        </div>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-400">
                          {segment.source}
                        </p>
                      </button>
                    ))}
                  </div>
                </aside>

                <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase text-zinc-500">
                        Translation studio
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-white">
                        {selectedSegment.chapter}
                      </h3>
                    </div>
                    <StatusBadge label={selectedSegment.status} />
                  </div>
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-zinc-300">
                        Source
                      </label>
                      <div className="mt-2 min-h-72 rounded-md border border-white/10 bg-black p-4 text-base leading-8 text-zinc-200">
                        {selectedSegment.source}
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="translation-editor"
                        className="text-sm font-medium text-zinc-300"
                      >
                        {targetLanguage} draft
                      </label>
                      <textarea
                        id="translation-editor"
                        value={selectedSegment.translation}
                        onChange={(event) =>
                          updateSelectedTranslation(event.target.value)
                        }
                        className="mt-2 min-h-72 w-full resize-y rounded-md border border-white/10 bg-black p-4 text-base leading-8 text-zinc-100 outline-none focus:border-lime-300/60"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={approveSelectedSegment}
                      className="h-11 rounded-md bg-lime-300 px-4 text-sm font-semibold text-black hover:bg-lime-200"
                    >
                      Approve segment
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateSelectedTranslation(
                          `${selectedSegment.translation}\n\n[Rewrite note] Keep the emotional rhythm, but smooth the sentence for ${targetLanguage} readers.`,
                        )
                      }
                      className="h-11 rounded-md border border-white/10 px-4 text-sm font-semibold text-zinc-200 hover:border-white/30"
                    >
                      Add AI rewrite note
                    </button>
                    <button
                      type="button"
                      onClick={buildExportPackage}
                      className="h-11 rounded-md border border-white/10 px-4 text-sm font-semibold text-zinc-200 hover:border-white/30"
                    >
                      Build export
                    </button>
                  </div>
                </section>

                <aside className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
                  <p className="text-xs font-medium uppercase text-zinc-500">
                    QA notes
                  </p>
                  <div className="mt-4 grid gap-3">
                    {[
                      "Aren Vale preserved",
                      "Mira Sol preserved",
                      "Moonlit Order has one localized term",
                      selectedSegment.note,
                    ].map((note) => (
                      <div
                        key={note}
                        className="rounded-md border border-white/10 bg-black p-3 text-sm leading-6 text-zinc-300"
                      >
                        {note}
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            )}

            {activeView === "export" && (
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <PageIntro
                      eyebrow="Export studio"
                      title="Platform-ready package"
                      body="Writers review the final text, then copy or download clean files for each target platform."
                    />
                    <StatusBadge label={exportState} />
                  </div>
                  <div className="mt-5 rounded-md border border-white/10 bg-black p-4">
                    <p className="text-xs font-medium uppercase text-zinc-500">
                      Metadata
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      Santo de la Espada Bajo la Luna
                    </h3>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">
                      A fallen guard, a healer bound by an ancient order, and a
                      city gate that remembers every oath. Export includes
                      localized tags, synopsis, author note, and glossary.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["fantasy", "cultivation", "slow burn", "duel"].map(
                        (tag) => (
                          <span
                            key={tag}
                            className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-zinc-300"
                          >
                            {tag}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                  <div className="mt-4 rounded-md border border-white/10 bg-black p-4">
                    <p className="text-xs font-medium uppercase text-zinc-500">
                      Chapter preview
                    </p>
                    <div className="mt-3 space-y-4 text-base leading-8 text-zinc-200">
                      {segments.map((segment) => (
                        <p key={segment.id}>{segment.translation}</p>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={buildExportPackage}
                      className="h-11 rounded-md bg-lime-300 px-4 text-sm font-semibold text-black hover:bg-lime-200"
                    >
                      Build package
                    </button>
                    <button
                      type="button"
                      className="h-11 rounded-md border border-white/10 px-4 text-sm font-semibold text-zinc-200 hover:border-white/30"
                    >
                      Copy chapter text
                    </button>
                  </div>
                </section>
                <aside className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
                  <p className="text-xs font-medium uppercase text-zinc-500">
                    Package contents
                  </p>
                  <div className="mt-4 grid gap-3">
                    {platformRules.map((rule) => (
                      <div
                        key={rule}
                        className="rounded-md border border-white/10 bg-black p-3 text-sm leading-6 text-zinc-300"
                      >
                        {rule}
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            )}

            {activeView === "billing" && (
              <div className="grid gap-5 xl:grid-cols-3">
                <section className="rounded-lg border border-lime-300/40 bg-lime-300/10 p-5 xl:col-span-2">
                  <p className="text-xs font-medium uppercase text-lime-100">
                    Current plan
                  </p>
                  <h3 className="mt-2 text-3xl font-semibold text-white">
                    Pro author
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
                    28,000 monthly credits, export packages, story bible memory,
                    and priority translation jobs. Credits reset on the next
                    billing cycle.
                  </p>
                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-sm text-zinc-300">
                      <span>Monthly credits used</span>
                      <span>9,580 / 28,000</span>
                    </div>
                    <ProgressBar value={34} />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button className="h-11 rounded-md bg-lime-300 px-4 text-sm font-semibold text-black hover:bg-lime-200">
                      Add 10,000 credits
                    </button>
                    <button className="h-11 rounded-md border border-white/10 px-4 text-sm font-semibold text-zinc-200 hover:border-white/30">
                      Open Stripe portal
                    </button>
                  </div>
                </section>
                {[
                  ["Starter", "8,000 credits", "$19/mo"],
                  ["Pro", "28,000 credits", "$59/mo"],
                  ["Studio", "90,000 credits", "$179/mo"],
                ].map(([plan, credits, price]) => (
                  <article
                    key={plan}
                    className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4"
                  >
                    <p className="text-lg font-semibold text-white">{plan}</p>
                    <p className="mt-2 text-sm text-zinc-400">{credits}</p>
                    <p className="mt-5 text-2xl font-semibold text-lime-100">
                      {price}
                    </p>
                  </article>
                ))}
              </div>
            )}

            {activeView === "settings" && (
              <div className="grid gap-5 xl:grid-cols-2">
                <SettingsPanel
                  title="Language defaults"
                  rows={[
                    ["Source language", "English"],
                    ["Primary target", targetLanguage],
                    ["Name policy", "Preserve accepted character names"],
                    ["Tone", "Cinematic, close third person"],
                  ]}
                />
                <SettingsPanel
                  title="Publishing defaults"
                  rows={[
                    ["Export template", "Webnovel style"],
                    ["Review gate", "Require approval before export"],
                    ["File bundle", "TXT, Markdown, metadata CSV"],
                    ["Automation", "Manual package first"],
                  ]}
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{helper}</p>
    </article>
  );
}

function PageIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-zinc-500">{eyebrow}</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">{body}</p>
    </div>
  );
}

function PanelTitle({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
      <p className="text-xs font-medium uppercase text-zinc-500">{eyebrow}</p>
      <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p>
    </section>
  );
}

function Timeline() {
  const steps = [
    ["Import", "Complete"],
    ["Story bible", "Complete"],
    ["Translate", "Running"],
    ["Human review", "Next"],
    ["Export", "Ready after review"],
  ];

  return (
    <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
      <div className="grid gap-3">
        {steps.map(([step, status], index) => (
          <div key={step} className="grid grid-cols-[28px_1fr] gap-3">
            <div className="flex flex-col items-center">
              <div
                className={classNames(
                  "grid h-7 w-7 place-items-center rounded-md border text-xs font-semibold",
                  index < 2
                    ? "border-lime-300/50 bg-lime-300 text-black"
                    : index === 2
                      ? "border-amber-300/50 bg-amber-300/20 text-amber-100"
                      : "border-white/10 bg-black text-zinc-500",
                )}
              >
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className="h-8 w-px bg-white/10" />
              )}
            </div>
            <div className="pb-3">
              <p className="text-sm font-medium text-white">{step}</p>
              <p className="text-xs text-zinc-500">{status}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SettingsPanel({
  title,
  rows,
}: {
  title: string;
  rows: string[][];
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <div className="mt-4 divide-y divide-white/10 rounded-md border border-white/10 bg-black">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid gap-2 px-3 py-3 text-sm md:grid-cols-[180px_1fr]"
          >
            <p className="text-zinc-500">{label}</p>
            <p className="font-medium text-zinc-200">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
