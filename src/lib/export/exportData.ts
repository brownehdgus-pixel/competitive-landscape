import type { CandidateCompany, CandidateType, LandscapeProject } from "@/types";

export const XLSX_SHEET_NAMES = [
  "Project Overview",
  "All Candidates",
  "Direct Competitors",
  "Indirect Competitors",
  "Listed Comparables",
  "Private Comparables",
  "Sources",
  "Report",
] as const;

export const ALL_CANDIDATE_HEADERS = [
  "companyName",
  "country",
  "listedStatus",
  "ticker",
  "exchange",
  "technology",
  "product",
  "indicationOrMarket",
  "businessModel",
  "developmentStage",
  "latestFundingRound",
  "keyInvestors",
  "candidateType",
  "reviewStatus",
  "manuallyOverridden",
  "technologySimilarityScore",
  "marketSimilarityScore",
  "businessModelSimilarityScore",
  "stageSimilarityScore",
  "fundingMnaRelevanceScore",
  "strategicBuyerInvestorFitScore",
  "valuationUsabilityScore",
  "geographyRegulatorySimilarityScore",
  "directCompetitorScore",
  "listedComparableScore",
  "vcExitComparableScore",
  "overallRelevanceScore",
  "rationale",
  "caveat",
  "userNote",
] as const;

export const SOURCE_HEADERS = [
  "candidateCompanyName",
  "sourceTitle",
  "sourceUrl",
  "sourceDate",
  "sourceType",
  "evidenceSnippet",
  "confidenceLevel",
  "checkedAt",
] as const;

export type CandidateExportRow = Record<
  (typeof ALL_CANDIDATE_HEADERS)[number],
  string | number | boolean
>;

export type SourceExportRow = Record<
  (typeof SOURCE_HEADERS)[number],
  string
>;

function cell(value?: string | number | boolean | null): string | number | boolean {
  if (value === undefined || value === null) return "";
  return value;
}

export function candidateToExportRow(
  candidate: CandidateCompany
): CandidateExportRow {
  const sub = candidate.llmClassification;
  const scores = candidate.scores;

  return {
    companyName: candidate.companyName,
    country: cell(candidate.country),
    listedStatus: candidate.listedStatus,
    ticker: cell(candidate.ticker),
    exchange: cell(candidate.exchange),
    technology: cell(candidate.technology),
    product: cell(candidate.product),
    indicationOrMarket: cell(candidate.indicationOrMarket),
    businessModel: cell(candidate.businessModel),
    developmentStage: cell(candidate.developmentStage),
    latestFundingRound: cell(candidate.latestFundingRound),
    keyInvestors: cell(candidate.keyInvestors),
    candidateType: candidate.candidateType,
    reviewStatus: candidate.reviewStatus,
    manuallyOverridden: candidate.manuallyOverridden ?? false,
    technologySimilarityScore: cell(sub?.technologySimilarityScore),
    marketSimilarityScore: cell(sub?.marketSimilarityScore),
    businessModelSimilarityScore: cell(sub?.businessModelSimilarityScore),
    stageSimilarityScore: cell(sub?.stageSimilarityScore),
    fundingMnaRelevanceScore: cell(sub?.fundingMnaRelevanceScore),
    strategicBuyerInvestorFitScore: cell(sub?.strategicBuyerInvestorFitScore),
    valuationUsabilityScore: cell(sub?.valuationUsabilityScore),
    geographyRegulatorySimilarityScore: cell(
      sub?.geographyRegulatorySimilarityScore
    ),
    directCompetitorScore: cell(scores?.directCompetitorScore),
    listedComparableScore: cell(scores?.listedComparableScore),
    vcExitComparableScore: cell(scores?.vcExitComparableScore),
    overallRelevanceScore: cell(scores?.overallRelevanceScore),
    rationale: cell(sub?.rationale),
    caveat: cell(sub?.caveat),
    userNote: cell(candidate.userNote),
  };
}

export function candidatesByType(
  candidates: CandidateCompany[],
  type: CandidateType
): CandidateCompany[] {
  return candidates.filter((c) => c.candidateType === type);
}

export function sourcesToExportRows(
  candidates: CandidateCompany[]
): SourceExportRow[] {
  const rows: SourceExportRow[] = [];

  for (const candidate of candidates) {
    for (const source of candidate.evidenceSources) {
      rows.push({
        candidateCompanyName: candidate.companyName,
        sourceTitle: source.sourceTitle ?? "",
        sourceUrl: source.sourceUrl ?? "",
        sourceDate: source.sourceDate ?? "",
        sourceType: source.sourceType ?? "",
        evidenceSnippet: source.evidenceSnippet ?? "",
        confidenceLevel: source.confidenceLevel ?? "",
        checkedAt: source.checkedAt ?? "",
      });
    }
  }

  return rows;
}

export function projectOverviewRows(
  project: LandscapeProject
): Array<{ field: string; value: string }> {
  const { target } = project;
  return [
    { field: "Project ID", value: project.id },
    { field: "Created At", value: project.createdAt },
    { field: "Updated At", value: project.updatedAt },
    {
      field: "Last Report Generated At",
      value: project.lastReportGeneratedAt ?? "",
    },
    { field: "Company Name", value: target.companyName },
    { field: "Description", value: target.description ?? "" },
    { field: "Core Technology", value: target.coreTechnology ?? "" },
    { field: "Product / Service", value: target.productOrService ?? "" },
    { field: "Indication / Market", value: target.indicationOrMarket ?? "" },
    { field: "Customer Group", value: target.customerGroup ?? "" },
    { field: "Business Model", value: target.businessModel ?? "" },
    { field: "Development Stage", value: target.developmentStage ?? "" },
    { field: "Analysis Purpose", value: target.analysisPurpose },
    {
      field: "Total Candidates",
      value: String(project.candidates.length),
    },
  ];
}

export function sanitizeExportFilename(name: string, ext: string): string {
  const base =
    name.replace(/[^a-zA-Z0-9가-힣._-]+/g, "_").replace(/_+/g, "_") ||
    "landscape-export";
  return `${base.slice(0, 80)}.${ext}`;
}
