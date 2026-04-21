"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type TabId = "source" | "segments" | "translation" | "story" | "qa" | "export";

type ReviewSegment = {
  id: string;
  order: number;
  sourceText: string;
  translatedText: string;
  status: "draft" | "translated" | "edited" | "approved";
  notes: string;
  lockedTerms: string[];
};

type StoryBibleItem = {
  id: string;
  kind: "character" | "place" | "term" | "rule";
  name: string;
  canonicalName: string;
  description: string;
  rule: string;
  locked: boolean;
  confidence: number;
};

type QaFinding = {
  id: string;
  severity: "info" | "warning" | "error";
  code: string;
  title: string;
  message: string;
};

type ChapterReview = {
  chapter: {
    novelId: string;
    chapterId: string;
    projectId: string;
    title: string;
    sourceLanguage: string;
    targetLanguage: string;
    targetLanguageLabel: string;
    wordCount: number;
    segmentCount: number;
    creditEstimate: number;
    fullSourceText: string;
    fullTranslatedText: string;
    status: "needs_review";
  };
  storyBible: StoryBibleItem[];
  segments: ReviewSegment[];
  qaFindings: QaFinding[];
  exportBundle: {
    status: "preview";
    files: string[];
  };
};

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "source", label: "Full Source" },
  { id: "segments", label: "Segment Review" },
  { id: "translation", label: "Full Translation" },
  { id: "story", label: "Story Bible" },
  { id: "qa", label: "QA" },
  { id: "export", label: "Export" },
];

function apiBase() {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
    "http://127.0.0.1:4001"
  );
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function splitParagraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function statusClass(value: string) {
  if (value === "approved" || value === "Ready" || value === "Accepted") {
    return "border-lime-300/40 bg-lime-300/10 text-lime-100";
  }
  if (value === "edited" || value === "translated" || value === "warning") {
    return "border-amber-300/40 bg-amber-300/10 text-amber-100";
  }
  if (value === "error") {
    return "border-red-300/40 bg-red-300/10 text-red-100";
  }
  return "border-white/10 bg-white/[0.03] text-zinc-300";
}

export function ChapterReviewWorkspace() {
  const [review, setReview] = useState<ChapterReview | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("source");
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(
    null,
  );
  const [draftText, setDraftText] = useState("");
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  useEffect(() => {
    const controller = new AbortController();
    setLoadState("loading");

    fetch(`${apiBase()}/demo/nightmare-chapter`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load the full chapter review.");
        }
        return response.json() as Promise<ChapterReview>;
      })
      .then((payload) => {
        setReview(payload);
        const firstSegment = payload.segments[0];
        setSelectedSegmentId(firstSegment?.id ?? null);
        setDraftText(firstSegment?.translatedText ?? "");
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setLoadState("error");
      });

    return () => controller.abort();
  }, []);

  const selectedSegment = useMemo(() => {
    if (!review) return null;
    return (
      review.segments.find((segment) => segment.id === selectedSegmentId) ??
      review.segments[0] ??
      null
    );
  }, [review, selectedSegmentId]);

  function selectSegment(segment: ReviewSegment) {
    setSelectedSegmentId(segment.id);
    setDraftText(segment.translatedText);
    setSaveState("idle");
  }

  async function saveSegment() {
    if (!review || !selectedSegment) return;

    setSaveState("saving");
    try {
      const response = await fetch(`${apiBase()}/translation-segments/${selectedSegment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          translatedText: draftText,
          status: "edited",
          notes: "Edited from the full chapter review UI.",
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to save segment.");
      }

      const saved = (await response.json()) as ReviewSegment;
      const nextSegments = review.segments.map((segment) =>
        segment.id === saved.id
          ? {
              ...segment,
              translatedText: saved.translatedText,
              status: saved.status,
              notes: saved.notes,
            }
          : segment,
      );

      setReview({
        ...review,
        segments: nextSegments,
        chapter: {
          ...review.chapter,
          fullTranslatedText: nextSegments
            .map((segment) => segment.translatedText || segment.sourceText)
            .join("\n\n"),
        },
      });
      setSaveState("saved");
    } catch {
      setSaveState("idle");
    }
  }

  if (loadState === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#050505] px-5 text-zinc-100">
        <div className="max-w-md rounded-lg border border-white/10 bg-[#0d0d0d] p-5 text-center">
          <p className="text-xs font-medium uppercase text-lime-200">
            Loading backend
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-white">
            Preparing the full chapter workspace
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            The page is asking `writer-backend` for the full chapter, segments,
            glossary, QA findings, and mock translation.
          </p>
        </div>
      </main>
    );
  }

  if (loadState === "error" || !review) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#050505] px-5 text-zinc-100">
        <div className="max-w-lg rounded-lg border border-amber-300/30 bg-[#0d0d0d] p-5">
          <Link
            href="/"
            className="text-sm font-medium text-lime-200 hover:text-lime-100"
          >
            Back to workspace
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-white">
            Backend is required for the full chapter view
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Start `writer-backend` on `http://127.0.0.1:4001`, then refresh this
            page. This view intentionally loads the full chapter from the API
            instead of keeping a second copy in the frontend.
          </p>
        </div>
      </main>
    );
  }

  const sourceParagraphs = splitParagraphs(review.chapter.fullSourceText);
  const translationParagraphs = splitParagraphs(review.chapter.fullTranslatedText);
  const approvedCount = review.segments.filter(
    (segment) => segment.status === "approved",
  ).length;
  const editedCount = review.segments.filter(
    (segment) => segment.status === "edited",
  ).length;

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-100">
      <div className="border-b border-white/10 bg-[#080808] px-5 py-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/"
              className="text-sm font-medium text-lime-200 hover:text-lime-100"
            >
              Back to workspace
            </Link>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              {review.chapter.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              Full source, full mock {review.chapter.targetLanguageLabel} draft,
              editable segments, story bible, QA findings, and export files in
              one review space.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Metric label="Words" value={review.chapter.wordCount.toLocaleString()} />
            <Metric label="Segments" value={String(review.chapter.segmentCount)} />
            <Metric label="Credits" value={String(review.chapter.creditEstimate)} />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="grid gap-5 self-start xl:sticky xl:top-5">
          <section className="overflow-hidden rounded-lg border border-white/10 bg-[#0d0d0d]">
            <div className="relative h-56">
              <Image
                src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80"
                alt="Open book and coffee on a desk"
                fill
                sizes="320px"
                className="object-cover opacity-70"
                priority
              />
              <div className="absolute inset-0 bg-black/35" />
            </div>
            <div className="p-4">
              <p className="text-xs font-medium uppercase text-zinc-500">
                Backend review
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Full chapter loaded
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Source language {review.chapter.sourceLanguage}. Target language{" "}
                {review.chapter.targetLanguageLabel}. Writer approval required
                before export.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge label="Needs review" />
                <Badge label={`${editedCount} edited`} />
                <Badge label={`${approvedCount} approved`} />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
            <p className="text-xs font-medium uppercase text-zinc-500">
              Review tabs
            </p>
            <div className="mt-4 grid gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={classNames(
                    "h-11 rounded-md border px-3 text-left text-sm font-semibold transition",
                    activeTab === tab.id
                      ? "border-lime-300/50 bg-lime-300 text-black"
                      : "border-white/10 bg-black text-zinc-300 hover:border-white/30",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
            <p className="text-xs font-medium uppercase text-zinc-500">
              Export bundle
            </p>
            <div className="mt-4 grid gap-2">
              {review.exportBundle.files.map((file) => (
                <div
                  key={file}
                  className="rounded-md border border-white/10 bg-black px-3 py-2 font-mono text-xs text-zinc-300"
                >
                  {file}
                </div>
              ))}
            </div>
          </section>
        </aside>

        <section className="min-w-0">
          {activeTab === "source" && (
            <ReaderPanel
              eyebrow="Full source"
              title="The complete uploaded chapter"
              body="This is the full chapter stored in writer-backend, not a short excerpt."
              paragraphs={sourceParagraphs}
            />
          )}

          {activeTab === "segments" && selectedSegment && (
            <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
              <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-3">
                <p className="px-1 text-xs font-medium uppercase text-zinc-500">
                  All segments
                </p>
                <div className="mt-3 grid max-h-[720px] gap-2 overflow-auto pr-1">
                  {review.segments.map((segment) => (
                    <button
                      key={segment.id}
                      type="button"
                      onClick={() => selectSegment(segment)}
                      className={classNames(
                        "rounded-md border p-3 text-left transition",
                        selectedSegment.id === segment.id
                          ? "border-lime-300/50 bg-lime-300/10"
                          : "border-white/10 bg-black hover:border-white/30",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-zinc-500">
                          SEG {String(segment.order).padStart(2, "0")}
                        </span>
                        <Badge label={segment.status} />
                      </div>
                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-400">
                        {segment.sourceText}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase text-zinc-500">
                      Segment {selectedSegment.order}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Edit the translated draft
                    </h2>
                  </div>
                  <Badge label={selectedSegment.status} />
                </div>
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-zinc-300">
                      Source
                    </p>
                    <div className="mt-2 min-h-80 rounded-md border border-white/10 bg-black p-4 text-sm leading-7 text-zinc-200">
                      {selectedSegment.sourceText}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="segment-translation"
                      className="text-sm font-semibold text-zinc-300"
                    >
                      {review.chapter.targetLanguageLabel} draft
                    </label>
                    <textarea
                      id="segment-translation"
                      value={draftText}
                      onChange={(event) => {
                        setDraftText(event.target.value);
                        setSaveState("idle");
                      }}
                      className="mt-2 min-h-80 w-full resize-y rounded-md border border-white/10 bg-black p-4 text-sm leading-7 text-zinc-100 outline-none focus:border-lime-300/60"
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={saveSegment}
                    className="h-11 rounded-md bg-lime-300 px-4 text-sm font-semibold text-black hover:bg-lime-200"
                  >
                    {saveState === "saving"
                      ? "Saving..."
                      : saveState === "saved"
                        ? "Saved"
                        : "Save segment"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("translation")}
                    className="h-11 rounded-md border border-white/10 px-4 text-sm font-semibold text-zinc-200 hover:border-white/30"
                  >
                    See full translation
                  </button>
                </div>
                <div className="mt-4 rounded-md border border-white/10 bg-black p-3">
                  <p className="text-xs font-medium uppercase text-zinc-500">
                    Locked terms
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedSegment.lockedTerms.slice(0, 10).map((term) => (
                      <span
                        key={term}
                        className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-zinc-300"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "translation" && (
            <ReaderPanel
              eyebrow="Full translation"
              title={`Complete mock ${review.chapter.targetLanguageLabel} draft`}
              body="This is assembled from every backend translation segment. Edits saved in Segment Review update this full draft."
              paragraphs={translationParagraphs}
            />
          )}

          {activeTab === "story" && (
            <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase text-zinc-500">
                    Story bible
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Names, terms, and style rules detected
                  </h2>
                </div>
                <Badge label="Accepted" />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {review.storyBible.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-lg border border-white/10 bg-black p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs capitalize text-zinc-400">
                        {item.kind}
                      </span>
                      <h3 className="text-base font-semibold text-white">
                        {item.name}
                      </h3>
                      <span className="text-xs text-zinc-500">
                        {Math.round(item.confidence * 100)}%
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-zinc-300">
                      {item.description}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-lime-100">
                      Rule: {item.rule}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeTab === "qa" && (
            <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase text-zinc-500">
                    QA before export
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Issues the platform catches for you
                  </h2>
                </div>
                <Badge label="Needs review" />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {review.qaFindings.map((finding) => (
                  <article
                    key={finding.id}
                    className="rounded-lg border border-white/10 bg-black p-4"
                  >
                    <Badge label={finding.severity} />
                    <h3 className="mt-3 text-base font-semibold text-white">
                      {finding.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {finding.message}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeTab === "export" && (
            <section className="rounded-lg border border-lime-300/30 bg-lime-300/10 p-5">
              <p className="text-xs font-medium uppercase text-lime-100">
                Platform package
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Ready after human approval
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-zinc-300">
                The backend now has the complete source chapter, all editable
                translation segments, locked glossary terms, QA findings, and the
                package file list. The final production flow will disable export
                until every required issue is resolved.
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {review.exportBundle.files.map((file) => (
                  <div
                    key={file}
                    className="rounded-md border border-white/10 bg-black px-3 py-3 font-mono text-xs text-zinc-300"
                  >
                    {file}
                  </div>
                ))}
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-md border px-2 py-1 text-xs font-medium ${statusClass(
        label,
      )}`}
    >
      {label}
    </span>
  );
}

function ReaderPanel({
  eyebrow,
  title,
  body,
  paragraphs,
}: {
  eyebrow: string;
  title: string;
  body: string;
  paragraphs: string[];
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
      <p className="text-xs font-medium uppercase text-zinc-500">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-400">{body}</p>
      <div className="mt-5 max-h-[74vh] overflow-auto rounded-md border border-white/10 bg-black p-5">
        <div className="mx-auto max-w-3xl space-y-5 text-base leading-8 text-zinc-200">
          {paragraphs.map((paragraph, index) => {
            if (paragraph === "***") {
              return (
                <div
                  key={`${paragraph}-${index}`}
                  className="py-4 text-center text-zinc-500"
                >
                  ***
                </div>
              );
            }
            if (index === 0 && paragraph.toLowerCase().startsWith("chapter")) {
              return (
                <h3
                  key={`${paragraph}-${index}`}
                  className="text-2xl font-semibold text-white"
                >
                  {paragraph}
                </h3>
              );
            }
            return <p key={`${paragraph}-${index}`}>{paragraph}</p>;
          })}
        </div>
      </div>
    </section>
  );
}
