"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import {
  classNames,
  PanelPreview,
  Pill,
  SelectedPanelInspector,
  SourceChapterForm,
} from "./components";
import { apiBase } from "./lib/api";
import { useManhwaStudio } from "./hooks/use-manhwa-studio";

export function ManhwaStudioWorkspace() {
  const {
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
  } = useManhwaStudio();

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
            </nav>

            <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-4">
              <p className="text-xs font-medium uppercase text-zinc-500">Production checklist</p>
              <div className="mt-4 grid gap-3">
                {detail.productionChecklist.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <CheckCircle2
                      className={classNames("mt-0.5 h-4 w-4", item.complete ? "text-lime-300" : "text-zinc-600")}
                      aria-hidden="true"
                    />
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
              <p className="mt-3 text-sm leading-6 text-zinc-300" aria-live="polite">
                {message}
              </p>
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
            <SourceChapterForm
              form={form}
              isWorking={isWorking}
              generateStoryboard={generateStoryboard}
              loadSample={loadSample}
              updateForm={updateForm}
            />

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

            {selectedPanel ? (
              <SelectedPanelInspector
                copied={copied}
                isWorking={isWorking}
                revisionPrompt={revisionPrompt}
                selectedPanel={selectedPanel}
                copyPrompt={copyPrompt}
                regenerateSelectedPanel={regenerateSelectedPanel}
                setRevisionPrompt={setRevisionPrompt}
              />
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
