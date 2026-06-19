export type AnalysisPurpose =
  | "Tech-Special Listing"
  | "VC Investment Review"
  | "Both";

/** LLM이 반환하는 5유형 (Unclassified 제외) */
export type LlmCandidateType =
  | "Direct Competitor"
  | "Indirect Competitor"
  | "Comparable Listed Company"
  | "Comparable Private Company"
  | "Not Relevant";

/** 시스템 분류값 — Unclassified는 후보 생성 시 초기값 */
export type CandidateType = LlmCandidateType | "Unclassified";

export type ReviewStatus = "Pending" | "Approved" | "Rejected";

export type ListedStatus = "listed" | "private" | "unknown";

export type EvidenceSourceType =
  | "company_site"
  | "news"
  | "clinicaltrial"
  | "paper"
  | "dart"
  | "sec"
  | "manual"
  | "other";

export type ConfidenceLevel = "High" | "Medium" | "Low";

export type TargetCompany = {
  companyName: string;
  description?: string;
  coreTechnology?: string;
  productOrService?: string;
  indicationOrMarket?: string;
  customerGroup?: string;
  businessModel?: string;
  developmentStage?: string;
  analysisPurpose: AnalysisPurpose;
};

export type EvidenceSource = {
  id: string;
  sourceTitle?: string;
  sourceUrl?: string;
  sourceDate?: string;
  sourceType?: EvidenceSourceType;
  evidenceSnippet?: string;
  confidenceLevel?: ConfidenceLevel;
  checkedAt?: string;
};

/** LLM 분류 출력 — 8종 sub-score (0–100) */
export type CandidateClassification = {
  candidateType: LlmCandidateType;
  confidence: number;
  rationale: string;
  caveat?: string;
  technologySimilarityScore: number;
  marketSimilarityScore: number;
  businessModelSimilarityScore: number;
  stageSimilarityScore: number;
  fundingMnaRelevanceScore: number;
  strategicBuyerInvestorFitScore: number;
  valuationUsabilityScore: number;
  geographyRegulatorySimilarityScore: number;
};

/** rule-based 최종 점수 (Step 6) */
export type CandidateScores = {
  directCompetitorScore: number;
  listedComparableScore: number;
  vcExitComparableScore: number;
  overallRelevanceScore: number;
};

export type CandidateCompany = {
  id: string;
  companyName: string;
  country?: string;
  listedStatus: ListedStatus;
  ticker?: string;
  exchange?: string;
  website?: string;
  technology?: string;
  product?: string;
  indicationOrMarket?: string;
  customerGroup?: string;
  businessModel?: string;
  developmentStage?: string;
  latestFundingRound?: string;
  keyInvestors?: string;
  recentEvent?: string;
  memo?: string;
  evidenceSources: EvidenceSource[];
  candidateType: CandidateType;
  reviewStatus: ReviewStatus;
  llmClassification?: CandidateClassification;
  scores?: CandidateScores;
  userNote?: string;
  manuallyOverridden?: boolean;
  manualOverrideAt?: string;
  createdAt: string;
  updatedAt: string;
  lastClassifiedAt?: string;
};

export type LandscapeReport = {
  markdown: string;
  generatedAt: string;
  includePendingInAppendix: boolean;
};

export type LandscapeProject = {
  id: string;
  target: TargetCompany;
  candidates: CandidateCompany[];
  report?: LandscapeReport;
  createdAt: string;
  updatedAt: string;
  lastReportGeneratedAt?: string;
};

export type LandscapesFile = {
  version: 1;
  projects: LandscapeProject[];
};
