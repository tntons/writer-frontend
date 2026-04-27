"use client";

import { useMemo, useState } from "react";
import { initialImportForm, sampleSource } from "../constants";
import { requestJson } from "../lib/api";
import { buildLocalReview, createLocalId, isLocalProject } from "../lib/local-workflow";
import type {
  ImportForm,
  JourneyActionState,
  NextAction,
  Platform,
  ReadinessItem,
  ReviewFilter,
  StageId,
  WorkflowReview,
  WriterPreferences,
} from "../types";

export function useWriterJourney() {
  const [form, setForm] = useState<ImportForm>(initialImportForm);
  const [review, setReview] = useState<WorkflowReview | null>(null);
  const [activeStage, setActiveStage] = useState<StageId>("import");
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("webnovel");
  const [sourceView, setSourceView] = useState<"source" | "translation">("source");
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [reviewQuery, setReviewQuery] = useState("");
  const [actionState, setActionState] = useState<JourneyActionState>("idle");
  const [message, setMessage] = useState("Ready to import your first chapter.");

  const selectedSegment = useMemo(() => {
    if (!review) return null;
    return review.segments.find((segment) => segment.id === selectedSegmentId) ?? review.segments[0] ?? null;
  }, [review, selectedSegmentId]);

  const lockedCount = review?.storyBible.filter((item) => item.locked).length ?? 0;
  const translatedCount = review?.segments.filter((segment) => segment.translatedText.trim()).length ?? 0;
  const approvedCount = review?.segments.filter((segment) => segment.status === "approved").length ?? 0;
  const editedCount = review?.segments.filter((segment) => segment.status === "edited").length ?? 0;

  const completedStages = {
    import: Boolean(review),
    bible: Boolean(review && review.storyBible.length > 0 && lockedCount > 0),
    translate: Boolean(review && translatedCount > 0),
    review: Boolean(review && (review.project.editedSegments > 0 || approvedCount > 0)),
    qa: Boolean(review && review.qaFindings.length > 0),
    export: Boolean(review && review.exports.length > 0),
  } satisfies Record<StageId, boolean>;

  const visibleSegments = useMemo(() => {
    if (!review) return [];
    const query = reviewQuery.trim().toLowerCase();
    return review.segments.filter((segment) => {
      const matchesQuery =
        !query ||
        segment.sourceText.toLowerCase().includes(query) ||
        segment.translatedText.toLowerCase().includes(query) ||
        segment.lockedTerms.some((term) => term.toLowerCase().includes(query));
      const matchesFilter =
        reviewFilter === "all" ||
        (reviewFilter === "needs-review" && segment.status !== "approved") ||
        (reviewFilter === "edited" && segment.status === "edited") ||
        (reviewFilter === "approved" && segment.status === "approved") ||
        (reviewFilter === "glossary" && segment.lockedTerms.length > 0);
      return matchesQuery && matchesFilter;
    });
  }, [review, reviewFilter, reviewQuery]);

  const readinessItems = useMemo<ReadinessItem[]>(() => {
    if (!review) {
      return [
        { id: "source", label: "Chapter source", ready: Boolean(form.sourceText.trim()), detail: "Paste or upload a chapter" },
        { id: "bible", label: "Story bible", ready: false, detail: "Import to extract names" },
        { id: "translation", label: "Translation draft", ready: false, detail: "Generate a target-language draft" },
        { id: "qa", label: "QA check", ready: false, detail: "Run checks before posting" },
      ];
    }

    return [
      { id: "source", label: "Chapter source", ready: review.project.wordCount > 0, detail: `${review.project.wordCount} words` },
      { id: "bible", label: "Story bible", ready: lockedCount > 0, detail: `${lockedCount} locked terms` },
      { id: "translation", label: "Translation draft", ready: translatedCount === review.segments.length, detail: `${translatedCount}/${review.segments.length} drafted` },
      { id: "review", label: "Writer edits", ready: editedCount > 0 || approvedCount > 0, detail: `${editedCount} edited, ${approvedCount} approved` },
      { id: "qa", label: "QA check", ready: review.qaFindings.length > 0, detail: `${review.qaFindings.length} findings tracked` },
      { id: "export", label: "Export package", ready: review.exports.length > 0, detail: `${review.exports.length} package${review.exports.length === 1 ? "" : "s"}` },
    ];
  }, [approvedCount, editedCount, form.sourceText, lockedCount, review, translatedCount]);

  const nextAction = useMemo<NextAction>(() => {
    if (!review) {
      return {
        label: "Import chapter",
        detail: "Clean the text and build the first story bible.",
        stage: "import",
        action: "import",
      };
    }
    if (translatedCount === 0) {
      return {
        label: "Translate draft",
        detail: "Generate editable target-language segments with locked terms.",
        stage: "bible",
        action: "translate",
      };
    }
    if (editedCount === 0 && approvedCount === 0) {
      return {
        label: "Review first segment",
        detail: "Open the segment editor and make the translation sound like you.",
        stage: "review",
        action: "review",
      };
    }
    if (review.qaFindings.length === 0) {
      return {
        label: "Run QA",
        detail: "Check empty translations, cleanup issues, and glossary consistency.",
        stage: "review",
        action: "qa",
      };
    }
    return {
      label: review.exports.length ? "Create another export" : "Create export",
      detail: "Package the translated chapter, story bible, and platform metadata.",
      stage: "export",
      action: "export",
    };
  }, [approvedCount, editedCount, review, translatedCount]);

  function updateForm(field: keyof ImportForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updatePreference(field: keyof WriterPreferences, value: WriterPreferences[keyof WriterPreferences]) {
    setForm((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        [field]: value,
      },
    }));
  }

  function applyReview(payload: WorkflowReview, nextStage?: StageId) {
    setReview(payload);
    const firstSegment = payload.segments[0];
    setSelectedSegmentId((current) => current ?? firstSegment?.id ?? null);
    setDraftText((current) => current || firstSegment?.translatedText || "");
    if (nextStage) setActiveStage(nextStage);
  }

  async function perform(label: string, action: () => Promise<void>) {
    setActionState("working");
    setMessage(label);
    try {
      await action();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setActionState("idle");
    }
  }

  async function loadNightmareSample() {
    await perform("Loading the full chapter sample.", async () => {
      try {
        const payload = await requestJson<{
          chapter: { title: string; fullSourceText: string; targetLanguage: string };
        }>("/demo/nightmare-chapter");
        setForm((current) => ({
          ...current,
          title: payload.chapter.title,
          synopsis: "A frail young man surrenders as a carrier of the Nightmare Spell.",
          targetLanguage: payload.chapter.targetLanguage,
          sourceText: payload.chapter.fullSourceText,
        }));
        setMessage("Full chapter loaded into the import box.");
      } catch {
        setForm((current) => ({ ...current, sourceText: sampleSource }));
        setMessage("Backend sample was unavailable, so the local sample is loaded.");
      }
    });
  }

  async function importChapter() {
    await perform("Cleaning source and building the story bible.", async () => {
      try {
        const payload = await requestJson<WorkflowReview>("/writer-workflow/import", {
          method: "POST",
          body: JSON.stringify(form),
        });
        applyReview(payload, "bible");
        setMessage("Imported. Review the terms the AI recognized before translation.");
      } catch {
        const payload = buildLocalReview(form);
        applyReview(payload, "bible");
        setMessage("Backend unavailable. Local import is ready with fallback cleanup and story bible recognition.");
      }
    });
  }

  async function toggleStoryBible(itemId: string, locked: boolean) {
    if (review?.project.projectId && isLocalProject(review.project.projectId)) {
      const nextReview = {
        ...review,
        storyBible: review.storyBible.map((item) => (item.id === itemId ? { ...item, locked } : item)),
      };
      applyReview(nextReview);
      setMessage(locked ? "Term locked locally." : "Term unlocked locally.");
      return;
    }

    await perform("Updating story bible lock.", async () => {
      const payload = await requestJson<WorkflowReview>(`/writer-workflow/story-bible/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({ locked }),
      });
      applyReview(payload);
      setMessage(locked ? "Term locked for future drafts." : "Term unlocked.");
    });
  }

  async function translateProject() {
    if (!review) return;
    await perform("Creating editable translation drafts.", async () => {
      const local = isLocalProject(review.project.projectId);
      const payload = local
        ? buildLocalReview(form, true)
        : await requestJson<WorkflowReview>(`/writer-workflow/projects/${review.project.projectId}/translate`, {
            method: "POST",
          });
      applyReview(payload, "review");
      setDraftText(payload.segments[0]?.translatedText ?? "");
      setMessage(
        local
          ? "Local translation draft is ready. Edit the segments that need your voice."
          : "Translation draft is ready. Edit the segments that need your voice.",
      );
    });
  }

  async function saveSegment() {
    if (!review || !selectedSegment) return;
    await perform("Saving this segment.", async () => {
      const saved = isLocalProject(review.project.projectId)
        ? {
            ...selectedSegment,
            translatedText: draftText,
            status: "edited" as const,
            notes: "Edited in the local fallback workspace.",
          }
        : await requestJson<WorkflowReview["segments"][number]>(`/translation-segments/${selectedSegment.id}`, {
            method: "PATCH",
            body: JSON.stringify({
              translatedText: draftText,
              status: "edited",
              notes: "Edited in the writer journey workspace.",
            }),
          });
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
        project: {
          ...review.project,
          editedSegments: nextSegments.filter((segment) => segment.status === "edited").length,
          fullTranslatedText: nextSegments.map((segment) => segment.translatedText || segment.sourceText).join("\n\n"),
        },
      });
      setMessage("Segment saved.");
    });
  }

  async function runQa() {
    if (!review) return;
    await perform("Running QA checks.", async () => {
      const payload = isLocalProject(review.project.projectId)
        ? {
            ...review,
            qaFindings: [
              ...review.cleaning.map((finding) => ({
                id: createLocalId("qa"),
                severity: finding.severity,
                code: `LOCAL_${finding.title.toUpperCase().replace(/\W+/g, "_")}`,
                title: finding.title,
                message: finding.message,
                resolved: false,
              })),
              ...review.segments
                .filter((segment) => !segment.translatedText.trim())
                .map((segment) => ({
                  id: createLocalId("qa"),
                  severity: "error" as const,
                  code: "LOCAL_EMPTY_TRANSLATION",
                  title: `Segment ${segment.order} has no translation`,
                  message: "Generate a draft or add a translation before export.",
                  resolved: false,
                })),
            ],
          }
        : await requestJson<WorkflowReview>(`/writer-workflow/projects/${review.project.projectId}/qa`, {
            method: "POST",
          });
      applyReview(payload, "qa");
      setMessage("QA refreshed. Fix warnings or approve when you are comfortable.");
    });
  }

  async function approveAll() {
    if (!review) return;
    await perform("Approving translated segments.", async () => {
      const payload = isLocalProject(review.project.projectId)
        ? {
            ...review,
            segments: review.segments.map((segment) => ({ ...segment, status: "approved" as const })),
            project: {
              ...review.project,
              status: "completed",
              reviewState: "approved",
              approvedSegments: review.segments.length,
            },
          }
        : await requestJson<WorkflowReview>(`/writer-workflow/projects/${review.project.projectId}/approve-all`, {
            method: "POST",
          });
      applyReview(payload, "export");
      setMessage("All translated segments are approved.");
    });
  }

  async function createExport() {
    if (!review) return;
    await perform("Preparing export files.", async () => {
      const local = isLocalProject(review.project.projectId);
      const payload = local
        ? {
            ...review,
            exports: [
              {
                id: createLocalId("export"),
                platform: selectedPlatform,
                title: `${review.project.title} - ${review.project.targetLanguageLabel}`,
                status: "ready",
                downloadUrl: "#local-export-preview",
              },
            ],
            exportBundle: { ...review.exportBundle, status: "ready" as const },
          }
        : await requestJson<WorkflowReview>(`/writer-workflow/projects/${review.project.projectId}/export`, {
            method: "POST",
            body: JSON.stringify({ platform: selectedPlatform }),
          });
      applyReview(payload, "export");
      setMessage(
        local
          ? "Local export preview created. Connect the backend for real ZIP downloads."
          : "Export preview created. Download the ZIP from the export panel.",
      );
    });
  }

  async function handleTextFile(file: File | undefined) {
    if (!file) return;
    const sourceText = await file.text();
    setForm((current) => ({
      ...current,
      title: current.title || file.name.replace(/\.[^.]+$/, ""),
      sourceText,
    }));
    setMessage(`${file.name} loaded into the chapter source box.`);
  }

  function selectSegment(segment: WorkflowReview["segments"][number]) {
    setSelectedSegmentId(segment.id);
    setDraftText(segment.translatedText || segment.sourceText);
    setActiveStage("review");
  }

  async function runNextAction() {
    if (nextAction.action === "import") {
      await importChapter();
      return;
    }
    if (nextAction.action === "translate") {
      await translateProject();
      return;
    }
    if (nextAction.action === "review") {
      setActiveStage("review");
      return;
    }
    if (nextAction.action === "qa") {
      await runQa();
      return;
    }
    await createExport();
  }

  return {
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
  };
}
