"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Download, FileText, ListChecks, Play, Search, Settings2, Upload } from "lucide-react";
import { platforms, reviewFilters, stages, toneOptions } from "./constants";
import { apiBase } from "./lib/api";
import { classNames, splitParagraphs } from "./lib/format";
import { useWriterJourney } from "./hooks/use-writer-journey";
import { Badge, Metric, StageButton } from "./components/common";
import type { Platform, ReviewFilter, WriterPreferences } from "./types";

export function WriterJourneyWorkspace() {
  const {
    form,
    review,
    activeStage,
    selectedSegment,
    draftText,
    selectedPlatform,
    sourceView,
    reviewFilter,
    reviewQuery,
    actionState,
    message,
    lockedCount,
    translatedCount,
    approvedCount,
    editedCount,
    completedStages,
    visibleSegments,
    readinessItems,
    nextAction,
    setActiveStage,
    setDraftText,
    setSelectedPlatform,
    setSourceView,
    setReviewFilter,
    setReviewQuery,
    updateForm,
    updatePreference,
    loadNightmareSample,
    importChapter,
    toggleStoryBible,
    translateProject,
    saveSegment,
    runQa,
    approveAll,
    createExport,
    handleTextFile,
    selectSegment,
    runNextAction,
  } = useWriterJourney();

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-100">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-white/10 bg-black lg:border-b-0 lg:border-r">
          <div className="sticky top-0 flex h-full flex-col gap-5 p-4">
            <div>
              <Link href="/" className="text-xs font-medium uppercase tracking-wide text-lime-200">
                WriterBridge
              </Link>
              <h1 className="mt-3 text-2xl font-semibold text-white">Writer Journey</h1>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Import one chapter, protect your canon, translate, edit, QA, and package it for posting.
              </p>
            </div>

            <div className="relative min-h-36 overflow-hidden rounded-lg border border-white/10">
              <Image
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80"
                alt="Desk with laptop and manuscript planning notes"
                fill
                sizes="280px"
                className="object-cover opacity-60"
                priority
              />
              <div className="absolute inset-0 bg-black/35" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-xs font-medium text-white">Source stays visible. Every AI draft stays editable.</p>
              </div>
            </div>

            <nav className="grid gap-2">
              {stages.map((stage) => (
                <StageButton
                  key={stage.id}
                  stage={stage}
                  active={activeStage === stage.id}
                  complete={completedStages[stage.id]}
                  onSelect={() => setActiveStage(stage.id)}
                />
              ))}
            </nav>

            <Link
              href="/manhwa"
              className="rounded-md border border-lime-300/30 bg-lime-300/10 px-3 py-3 text-sm font-semibold text-lime-100 hover:border-lime-300/60"
            >
              Turn this novel into manhwa
            </Link>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <Link
                href="/billing"
                className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-3 text-sm font-semibold text-zinc-200 hover:border-white/30"
              >
                Billing
              </Link>
              <Link
                href="/auth"
                className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-3 text-sm font-semibold text-zinc-200 hover:border-white/30"
              >
                Account
              </Link>
            </div>

            <div className="mt-auto rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
              <p className="text-xs font-medium uppercase text-zinc-500">Backend</p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{message}</p>
              <p className="mt-3 text-xs text-zinc-600">{apiBase()}</p>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="border-b border-white/10 px-5 py-5 lg:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-zinc-500">Novel translation workspace</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  {review?.project.title ?? form.title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                  A writer should always know what the AI changed, what canon it used, and what is ready to publish.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {review ? (
                  <>
                    <Badge value={review.project.status} />
                    <Badge value={`${review.project.creditEstimate} credits`} />
                    <Badge value={`${review.project.segmentCount} segments`} />
                  </>
                ) : (
                  <>
                    <Badge value="local backend" />
                    <Badge value="mock AI" />
                  </>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-lg border border-white/10 bg-[#0d0d0d] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-zinc-500">Next action</p>
                <p className="mt-1 text-sm font-semibold text-white">{nextAction.label}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">{nextAction.detail}</p>
              </div>
              <button
                type="button"
                onClick={runNextAction}
                disabled={actionState === "working"}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-lime-300 px-3 text-sm font-semibold text-black hover:bg-lime-200 disabled:opacity-50"
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                Continue
              </button>
            </div>
          </header>

          <div className="grid gap-6 px-5 py-6 xl:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
            <div className="min-w-0 space-y-6">
              {activeStage === "import" ? (
                <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase text-lime-200">Import & clean</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">Paste the chapter exactly as you have it</h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        The backend removes source labels, fixes common dotted-word artifacts, and extracts names before translation.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={loadNightmareSample}
                      disabled={actionState === "working"}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-sm font-semibold text-zinc-200 hover:border-white/30 disabled:opacity-50"
                    >
                      <FileText className="h-4 w-4" aria-hidden="true" />
                      Load full Nightmare sample
                    </button>
                  </div>

                  <label className="mt-5 flex cursor-pointer flex-col gap-2 rounded-lg border border-dashed border-white/15 bg-black p-4 hover:border-lime-300/50">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                      <Upload className="h-4 w-4" aria-hidden="true" />
                      Upload a .txt chapter
                    </span>
                    <span className="text-xs leading-5 text-zinc-500">
                      The text loads into the editor first, so you can clean or adjust it before importing.
                    </span>
                    <input
                      type="file"
                      accept=".txt,text/plain"
                      onChange={(event) => {
                        void handleTextFile(event.target.files?.[0]);
                        event.currentTarget.value = "";
                      }}
                      className="sr-only"
                    />
                  </label>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-medium text-zinc-500">Title</span>
                      <input
                        value={form.title}
                        onChange={(event) => updateForm("title", event.target.value)}
                        className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-lime-300/60"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-zinc-500">Author name</span>
                      <input
                        value={form.authorName}
                        onChange={(event) => updateForm("authorName", event.target.value)}
                        className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-lime-300/60"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-zinc-500">Source language</span>
                      <input
                        value={form.sourceLanguage}
                        onChange={(event) => updateForm("sourceLanguage", event.target.value)}
                        className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-lime-300/60"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-zinc-500">Target language</span>
                      <select
                        value={form.targetLanguage}
                        onChange={(event) => updateForm("targetLanguage", event.target.value)}
                        className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-lime-300/60"
                      >
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="pt">Portuguese</option>
                        <option value="id">Indonesian</option>
                        <option value="th">Thai</option>
                      </select>
                    </label>
                  </div>

                  <label className="mt-4 block">
                    <span className="text-xs font-medium text-zinc-500">Synopsis</span>
                    <textarea
                      value={form.synopsis}
                      onChange={(event) => updateForm("synopsis", event.target.value)}
                      className="mt-2 min-h-20 w-full resize-y rounded-md border border-white/10 bg-black p-3 text-sm leading-6 text-white outline-none focus:border-lime-300/60"
                    />
                  </label>

                  <label className="mt-4 block">
                    <span className="text-xs font-medium text-zinc-500">Chapter source</span>
                    <textarea
                      value={form.sourceText}
                      onChange={(event) => updateForm("sourceText", event.target.value)}
                      className="mt-2 min-h-[360px] w-full resize-y rounded-md border border-white/10 bg-black p-4 font-mono text-sm leading-6 text-zinc-100 outline-none focus:border-lime-300/60"
                    />
                  </label>

                  <div className="mt-4 rounded-lg border border-white/10 bg-black p-4">
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4 text-lime-200" aria-hidden="true" />
                      <p className="text-sm font-semibold text-white">Translation preferences</p>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className="text-xs font-medium text-zinc-500">Tone</span>
                        <select
                          value={form.preferences.tone}
                          onChange={(event) => updatePreference("tone", event.target.value as WriterPreferences["tone"])}
                          className="mt-2 h-10 w-full rounded-md border border-white/10 bg-[#050505] px-3 text-sm text-white outline-none focus:border-lime-300/60"
                        >
                          {toneOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-xs font-medium text-zinc-500">Dialogue</span>
                        <select
                          value={form.preferences.dialogueStyle}
                          onChange={(event) =>
                            updatePreference("dialogueStyle", event.target.value as WriterPreferences["dialogueStyle"])
                          }
                          className="mt-2 h-10 w-full rounded-md border border-white/10 bg-[#050505] px-3 text-sm text-white outline-none focus:border-lime-300/60"
                        >
                          <option value="natural">Natural</option>
                          <option value="literal">Literal</option>
                          <option value="localized">Localized</option>
                        </select>
                      </label>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <label className="flex items-center gap-2 text-sm text-zinc-300">
                        <input
                          type="checkbox"
                          checked={form.preferences.preserveNames}
                          onChange={(event) => updatePreference("preserveNames", event.target.checked)}
                          className="h-4 w-4 accent-lime-300"
                        />
                        Preserve character names
                      </label>
                      <label className="flex items-center gap-2 text-sm text-zinc-300">
                        <input
                          type="checkbox"
                          checked={form.preferences.preserveHonorifics}
                          onChange={(event) => updatePreference("preserveHonorifics", event.target.checked)}
                          className="h-4 w-4 accent-lime-300"
                        />
                        Preserve honorifics
                      </label>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={importChapter}
                      disabled={actionState === "working" || !form.sourceText.trim()}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-lime-300 px-4 text-sm font-semibold text-black hover:bg-lime-200 disabled:opacity-50"
                    >
                      <ListChecks className="h-4 w-4" aria-hidden="true" />
                      Import and recognize names
                    </button>
                    <Link
                      href="/chapter-mock"
                      className="grid h-11 place-items-center rounded-md border border-white/10 px-4 text-sm font-semibold text-zinc-200 hover:border-white/30"
                    >
                      View full chapter mock
                    </Link>
                  </div>
                </section>
              ) : null}

              {review && activeStage === "bible" ? (
                <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase text-lime-200">Story bible</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">Approve the canon before AI translates</h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        Locked terms are sent into the translation draft as names and glossary rules.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={translateProject}
                      disabled={actionState === "working"}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-lime-300 px-3 text-sm font-semibold text-black hover:bg-lime-200 disabled:opacity-50"
                    >
                      <Play className="h-4 w-4" aria-hidden="true" />
                      Translate with locked terms
                    </button>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {review.storyBible.map((item) => (
                      <article key={item.id} className="rounded-lg border border-white/10 bg-black p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-base font-semibold text-white">{item.canonicalName}</h4>
                              <Badge value={item.kind} />
                              <Badge value={`${Math.round(item.confidence * 100)}%`} />
                            </div>
                            <p className="mt-2 text-sm leading-6 text-zinc-400">{item.description}</p>
                            <p className="mt-2 text-xs leading-5 text-zinc-500">{item.rule}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleStoryBible(item.id, !item.locked)}
                            disabled={actionState === "working"}
                            className={classNames(
                              "h-10 min-w-28 rounded-md border px-3 text-sm font-semibold disabled:opacity-50",
                              item.locked
                                ? "border-lime-300/40 bg-lime-300/10 text-lime-100"
                                : "border-white/10 text-zinc-300 hover:border-white/30",
                            )}
                          >
                            {item.locked ? "Locked" : "Unlock"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {review && activeStage === "translate" ? (
                <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
                  <p className="text-xs font-medium uppercase text-lime-200">Translate</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">Create an editable draft</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    This uses mock AI locally today. In production, this is where OpenAI translation, chunking, and cost tracking plug in.
                  </p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <Metric label="Estimated credits" value={`${review.project.creditEstimate}`} helper="Mock local pricing" />
                    <Metric label="Locked terms" value={`${lockedCount}`} helper="Names and glossary" />
                    <Metric label="Segments" value={`${review.project.segmentCount}`} helper="Editable units" />
                  </div>
                  <button
                    type="button"
                    onClick={translateProject}
                    disabled={actionState === "working"}
                    className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-lime-300 px-4 text-sm font-semibold text-black hover:bg-lime-200 disabled:opacity-50"
                  >
                    <Play className="h-4 w-4" aria-hidden="true" />
                    Generate translation draft
                  </button>
                </section>
              ) : null}

              {review && activeStage === "review" ? (
                <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase text-lime-200">Segment review</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">Edit translation without losing the source</h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        Pick a segment, revise the target text, then save it back to the backend.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={runQa}
                        disabled={actionState === "working"}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-sm font-semibold text-zinc-200 hover:border-white/30 disabled:opacity-50"
                      >
                        <ListChecks className="h-4 w-4" aria-hidden="true" />
                        Run QA
                      </button>
                      <button
                        type="button"
                        onClick={approveAll}
                        disabled={actionState === "working"}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-lime-300 px-3 text-sm font-semibold text-black hover:bg-lime-200 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Approve all
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid min-h-[560px] gap-4 xl:grid-cols-[320px_1fr]">
                    <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
                      <div className="border-b border-white/10 p-3 text-xs font-medium uppercase text-zinc-500">
                        Segments
                      </div>
                      <div className="border-b border-white/10 p-3">
                        <label className="flex h-10 items-center gap-2 rounded-md border border-white/10 bg-[#050505] px-3">
                          <Search className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                          <input
                            value={reviewQuery}
                            onChange={(event) => setReviewQuery(event.target.value)}
                            placeholder="Search source, draft, terms"
                            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                          />
                        </label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {reviewFilters.map((filter) => (
                            <button
                              key={filter.id}
                              type="button"
                              onClick={() => setReviewFilter(filter.id as ReviewFilter)}
                              className={classNames(
                                "h-8 rounded-md border px-2 text-xs font-semibold",
                                reviewFilter === filter.id
                                  ? "border-lime-300/50 bg-lime-300/10 text-lime-100"
                                  : "border-white/10 text-zinc-400 hover:border-white/30",
                              )}
                            >
                              {filter.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="max-h-[520px] overflow-auto">
                        {visibleSegments.map((segment) => (
                          <button
                            key={segment.id}
                            type="button"
                            onClick={() => selectSegment(segment)}
                            className={classNames(
                              "block w-full border-b border-white/10 p-3 text-left transition hover:bg-white/[0.04]",
                              selectedSegment?.id === segment.id && "bg-lime-300/10",
                            )}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-semibold text-white">#{segment.order}</span>
                              <Badge value={segment.status} />
                            </div>
                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">{segment.sourceText}</p>
                          </button>
                        ))}
                        {!visibleSegments.length ? (
                          <div className="p-4 text-sm leading-6 text-zinc-500">No segments match this review filter.</div>
                        ) : null}
                      </div>
                    </div>

                    {selectedSegment ? (
                      <div className="grid gap-4">
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="rounded-lg border border-white/10 bg-black p-4">
                            <p className="text-xs font-medium uppercase text-zinc-500">Source</p>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-200">{selectedSegment.sourceText}</p>
                          </div>
                          <label className="block rounded-lg border border-white/10 bg-black p-4">
                            <span className="text-xs font-medium uppercase text-zinc-500">Translation</span>
                            <textarea
                              value={draftText}
                              onChange={(event) => setDraftText(event.target.value)}
                              className="mt-3 min-h-48 w-full resize-y rounded-md border border-white/10 bg-[#050505] p-3 text-sm leading-7 text-white outline-none focus:border-lime-300/60"
                            />
                          </label>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={saveSegment}
                            disabled={actionState === "working"}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-lime-300 px-4 text-sm font-semibold text-black hover:bg-lime-200 disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            Save segment
                          </button>
                          <Badge value={selectedSegment.status} />
                          {selectedSegment.lockedTerms.slice(0, 4).map((term, index) => (
                            <span key={`${term}-${index}`} className="rounded-md border border-white/10 px-2 py-1 text-xs text-zinc-400">
                              {term}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </section>
              ) : null}

              {review && activeStage === "qa" ? (
                <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase text-lime-200">Quality checks</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">Review blockers before posting</h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        QA checks empty drafts, cleanup warnings, and terminology consistency.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={runQa}
                      disabled={actionState === "working"}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-sm font-semibold text-zinc-200 hover:border-white/30 disabled:opacity-50"
                    >
                      <ListChecks className="h-4 w-4" aria-hidden="true" />
                      Refresh QA
                    </button>
                  </div>
                  <div className="mt-5 grid gap-3">
                    {review.qaFindings.length ? (
                      review.qaFindings.map((finding) => (
                        <article key={finding.id} className="rounded-lg border border-white/10 bg-black p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge value={finding.severity} />
                            <span className="text-xs text-zinc-500">{finding.code}</span>
                          </div>
                          <h4 className="mt-3 text-base font-semibold text-white">{finding.title}</h4>
                          <p className="mt-2 text-sm leading-6 text-zinc-400">{finding.message}</p>
                        </article>
                      ))
                    ) : (
                      <div className="rounded-lg border border-white/10 bg-black p-5 text-sm text-zinc-400">
                        No QA findings yet. Run QA after translation.
                      </div>
                    )}
                  </div>
                </section>
              ) : null}

              {review && activeStage === "export" ? (
                <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase text-lime-200">Export</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">Package files for the posting workflow</h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        Export gives you clean chapter text, metadata, story bible, and QA report in one archive.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={selectedPlatform}
                        onChange={(event) => setSelectedPlatform(event.target.value as Platform)}
                        className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-lime-300/60"
                      >
                        {platforms.map((platform) => (
                          <option key={platform.id} value={platform.id}>
                            {platform.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={createExport}
                        disabled={actionState === "working"}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-lime-300 px-3 text-sm font-semibold text-black hover:bg-lime-200 disabled:opacity-50"
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Create export
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-lg border border-white/10 bg-black p-4">
                      <p className="text-xs font-medium uppercase text-zinc-500">Files</p>
                      <div className="mt-3 grid gap-2">
                        {review.exportBundle.files.map((file) => (
                          <div key={file} className="flex items-center justify-between rounded-md bg-white/[0.03] px-3 py-2">
                            <span className="text-sm text-zinc-300">{file}</span>
                            <Badge value="included" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black p-4">
                      <p className="text-xs font-medium uppercase text-zinc-500">Downloads</p>
                      <div className="mt-3 grid gap-2">
                        {review.exports.length ? (
                          review.exports.map((item) => (
                            <a
                              key={item.id}
                              href={item.downloadUrl.startsWith("#") ? item.downloadUrl : `${apiBase()}${item.downloadUrl}`}
                              className="flex items-center justify-between rounded-md border border-white/10 px-3 py-3 text-sm text-zinc-200 hover:border-lime-300/50"
                            >
                              <span>{item.title}</span>
                              <Badge value={item.platform} />
                            </a>
                          ))
                        ) : (
                          <p className="text-sm leading-6 text-zinc-400">No export has been created yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}

              {review ? (
                <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase text-zinc-500">Full chapter</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">
                        {sourceView === "source" ? "Source manuscript" : "Translated manuscript"}
                      </h3>
                    </div>
                    <div className="flex rounded-md border border-white/10 bg-black p-1">
                      {(["source", "translation"] as const).map((view) => (
                        <button
                          key={view}
                          type="button"
                          onClick={() => setSourceView(view)}
                          className={classNames(
                            "h-9 rounded px-3 text-sm font-semibold capitalize",
                            sourceView === view ? "bg-white text-black" : "text-zinc-400 hover:text-white",
                          )}
                        >
                          {view}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 max-h-[520px] overflow-auto rounded-lg border border-white/10 bg-black p-5">
                    {splitParagraphs(
                      sourceView === "source" ? review.project.fullSourceText : review.project.fullTranslatedText,
                    ).map((paragraph, index) => (
                      <p key={`${sourceView}-${index}`} className="mb-5 whitespace-pre-wrap text-sm leading-7 text-zinc-300 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
                <p className="text-xs font-medium uppercase text-zinc-500">Progress</p>
                <div className="mt-4 space-y-4">
                  <Metric
                    label="Words"
                    value={`${review?.project.wordCount ?? form.sourceText.split(/\s+/).filter(Boolean).length}`}
                    helper="Current source"
                  />
                  <Metric
                    label="Story bible"
                    value={review ? `${lockedCount}/${review.storyBible.length}` : "0"}
                    helper="Locked terms"
                  />
                  <Metric
                    label="Translation"
                    value={review ? `${translatedCount}/${review.segments.length}` : "0"}
                    helper="Segments drafted"
                  />
                  <Metric
                    label="Approved"
                    value={review ? `${approvedCount}/${review.segments.length}` : "0"}
                    helper="Ready to post"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
                <p className="text-xs font-medium uppercase text-zinc-500">Platform readiness</p>
                <div className="mt-3 grid gap-2">
                  {readinessItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 rounded-md bg-black p-3">
                      <CheckCircle2
                        className={classNames("mt-0.5 h-4 w-4", item.ready ? "text-lime-300" : "text-zinc-600")}
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <p className="mt-1 text-xs leading-5 text-zinc-500">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
                <p className="text-xs font-medium uppercase text-zinc-500">Writer controls</p>
                <div className="mt-3 grid gap-2 text-sm text-zinc-300">
                  <div className="flex items-center justify-between gap-3 rounded-md bg-black px-3 py-2">
                    <span>Tone</span>
                    <span className="font-semibold text-white">{form.preferences.tone}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-md bg-black px-3 py-2">
                    <span>Dialogue</span>
                    <span className="font-semibold text-white">{form.preferences.dialogueStyle}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-md bg-black px-3 py-2">
                    <span>Edited</span>
                    <span className="font-semibold text-white">{editedCount}</span>
                  </div>
                </div>
              </div>

              {review?.cleaning.length ? (
                <div className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
                  <p className="text-xs font-medium uppercase text-zinc-500">Cleanup</p>
                  <div className="mt-3 grid gap-3">
                    {review.cleaning.map((finding) => (
                      <div key={finding.id} className="rounded-md border border-white/10 bg-black p-3">
                        <Badge value={finding.severity} />
                        <p className="mt-2 text-sm font-semibold text-white">{finding.title}</p>
                        <p className="mt-1 text-xs leading-5 text-zinc-500">{finding.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
                <p className="text-xs font-medium uppercase text-zinc-500">What a writer needs next</p>
                <div className="mt-3 grid gap-3 text-sm leading-6 text-zinc-400">
                  <p>Chapter memory across uploads, so recurring names do not drift after chapter 30.</p>
                  <p>Platform auto-posting should start as drafts first, then support scheduled publishing once trust is high.</p>
                  <p>Payment should be credit-based at launch, with subscription bundles for active authors.</p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
