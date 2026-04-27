export type StageId = "import" | "bible" | "translate" | "review" | "qa" | "export";
export type SegmentStatus = "draft" | "translated" | "edited" | "approved";
export type Platform = "webnovel" | "wattpad" | "royal-road" | "generic";
export type Severity = "info" | "warning" | "error";
export type ReviewFilter = "all" | "needs-review" | "edited" | "approved" | "glossary";

export type WriterPreferences = {
  tone: "cinematic" | "plain" | "dramatic" | "faithful";
  audience: "teen" | "adult" | "general";
  preserveHonorifics: boolean;
  preserveNames: boolean;
  dialogueStyle: "natural" | "literal" | "localized";
};

export type WorkflowReview = {
  project: {
    novelId: string;
    projectId: string;
    title: string;
    authorName: string;
    sourceLanguage: string;
    targetLanguage: string;
    targetLanguageLabel: string;
    status: string;
    reviewState: string;
    progress: number;
    wordCount: number;
    segmentCount: number;
    creditEstimate: number;
    consumedCredits: number;
    approvedSegments: number;
    editedSegments: number;
    qaOpen: number;
    fullSourceText: string;
    fullTranslatedText: string;
  };
  cleaning: Array<{
    id: string;
    severity: Severity;
    title: string;
    message: string;
  }>;
  storyBible: Array<{
    id: string;
    kind: "character" | "place" | "term" | "rule";
    name: string;
    canonicalName: string;
    description: string;
    rule: string;
    locked: boolean;
    confidence: number;
  }>;
  segments: Array<{
    id: string;
    order: number;
    sourceText: string;
    translatedText: string;
    status: SegmentStatus;
    notes: string;
    lockedTerms: string[];
  }>;
  qaFindings: Array<{
    id: string;
    severity: Severity;
    code: string;
    title: string;
    message: string;
    resolved: boolean;
  }>;
  exports: Array<{
    id: string;
    platform: Platform;
    title: string;
    status: string;
    downloadUrl: string;
  }>;
  exportBundle: {
    status: "blocked" | "preview" | "ready";
    files: string[];
  };
};

export type ImportForm = {
  title: string;
  authorName: string;
  synopsis: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceText: string;
  preferences: WriterPreferences;
};

export type JourneyActionState = "idle" | "working";

export type ReadinessItem = {
  id: string;
  label: string;
  ready: boolean;
  detail: string;
};

export type NextAction = {
  label: string;
  detail: string;
  stage: StageId;
  action: "import" | "translate" | "review" | "qa" | "export";
};
