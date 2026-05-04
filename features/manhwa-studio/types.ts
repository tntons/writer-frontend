export type ManhwaStylePreset = "webtoon" | "ink" | "cinematic" | "shojo";
export type ManhwaAspectRatio = "9:16" | "4:5" | "1:1";

export type ManhwaForm = {
  title: string;
  sourceText: string;
  stylePreset: ManhwaStylePreset;
  aspectRatio: ManhwaAspectRatio;
  panelCount: number;
};

export type ManhwaProject = {
  id: string;
  title: string;
  stylePreset: ManhwaStylePreset;
  aspectRatio: ManhwaAspectRatio;
  status: string;
  panelCount: number;
  estimatedCredits: number;
  consumedCredits: number;
  createdAt: string;
  updatedAt: string;
};

export type ManhwaPanel = {
  id: string;
  projectId: string;
  order: number;
  sourceExcerpt: string;
  sceneSummary: string;
  dialogue: string[];
  imagePrompt: string;
  negativePrompt: string;
  camera: string;
  mood: string;
  characters: string[];
  setting: string;
  status: string;
  imageUrl: string;
  seed: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductionChecklistItem = {
  label: string;
  complete: boolean;
};

export type ManhwaProjectDetail = {
  project: ManhwaProject;
  panels: ManhwaPanel[];
  productionChecklist: ProductionChecklistItem[];
};
