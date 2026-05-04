import { apiBase, requestJson } from "@/features/shared/lib/api-client";
import type { ManhwaForm, ManhwaProjectDetail } from "../types";

export { apiBase };

export async function createManhwaProject(form: ManhwaForm): Promise<ManhwaProjectDetail> {
  return requestJson<ManhwaProjectDetail>("/manhwa-projects", {
    method: "POST",
    body: JSON.stringify(form),
  });
}

export async function regeneratePanel(input: {
  projectId: string;
  panelId: string;
  variantPrompt: string;
}): Promise<ManhwaProjectDetail> {
  return requestJson<ManhwaProjectDetail>(
    `/manhwa-projects/${input.projectId}/panels/${input.panelId}/regenerate`,
    {
      method: "POST",
      body: JSON.stringify({ variantPrompt: input.variantPrompt }),
    },
  );
}

export async function loadNightmareChapter(): Promise<string> {
  const payload = await requestJson<{ chapter: { fullSourceText: string } }>("/demo/nightmare-chapter");
  return payload.chapter.fullSourceText;
}

export function panelImageUrl(path: string): string {
  if (path.startsWith("data:") || path.startsWith("http")) {
    return path;
  }
  return `${apiBase()}${path}`;
}
