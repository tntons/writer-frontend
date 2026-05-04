"use client";

import { useMemo, useState } from "react";
import { initialManhwaForm } from "../constants";
import { createManhwaProject, loadNightmareChapter, regeneratePanel } from "../lib/api";
import { createLocalManhwaProject } from "../lib/local-manhwa";
import type { ManhwaForm } from "../types";

export function useManhwaStudio() {
  const [form, setForm] = useState<ManhwaForm>(initialManhwaForm);
  const [detail, setDetail] = useState(() => createLocalManhwaProject(initialManhwaForm));
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
    if (!selectedPanel || typeof navigator === "undefined") return;
    await navigator.clipboard?.writeText(selectedPanel.imagePrompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return {
    copied,
    detail,
    detectedCharacters,
    form,
    hasBackendProject,
    isWorking,
    message,
    revisionPrompt,
    selectedPanel,
    copyPrompt,
    generateStoryboard,
    loadSample,
    regenerateSelectedPanel,
    setRevisionPrompt,
    setSelectedPanelId,
    updateForm,
  };
}
