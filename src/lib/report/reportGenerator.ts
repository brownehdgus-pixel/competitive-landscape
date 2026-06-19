import type {
  AnalysisPurpose,
  CandidateCompany,
  CandidateType,
  LandscapeProject,
  TargetCompany,
} from "@/types";

export type ReportBuildInput = {
  project: LandscapeProject;
  includePendingInAppendix: boolean;
  techSpecialImplication?: string;
  vcImplication?: string;
};

function display(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "N/A";
  return String(value);
}

function score(value?: number): string {
  return value === undefined || value === null ? "N/A" : String(value);
}

function approvedCandidates(candidates: CandidateCompany[]): CandidateCompany[] {
  return candidates.filter((c) => c.reviewStatus === "Approved");
}

function approvedByType(
  candidates: CandidateCompany[],
  type: CandidateType
): CandidateCompany[] {
  return approvedCandidates(candidates).filter((c) => c.candidateType === type);
}

function pendingCandidates(candidates: CandidateCompany[]): CandidateCompany[] {
  return candidates.filter((c) => c.reviewStatus === "Pending");
}

function formatTargetSection(target: TargetCompany): string {
  return `## 1. Target Company Overview

| Field | Value |
|-------|-------|
| Company Name | ${display(target.companyName)} |
| Description | ${display(target.description)} |
| Core Technology | ${display(target.coreTechnology)} |
| Product / Service | ${display(target.productOrService)} |
| Indication / Market | ${display(target.indicationOrMarket)} |
| Customer Group | ${display(target.customerGroup)} |
| Business Model | ${display(target.businessModel)} |
| Development Stage | ${display(target.developmentStage)} |
| Analysis Purpose | ${display(target.analysisPurpose)} |`;
}

function formatClassificationSummary(candidates: CandidateCompany[]): string {
  const approved = approvedCandidates(candidates);

  if (approved.length === 0) {
    return `## 2. Classification Summary

_No approved candidates. Review and approve candidates before generating the report body._`;
  }

  const rows = approved
    .map((c) => {
      const s = c.scores;
      return `| ${c.companyName} | ${c.candidateType} | ${score(s?.directCompetitorScore)} | ${score(s?.listedComparableScore)} | ${score(s?.vcExitComparableScore)} | ${score(s?.overallRelevanceScore)} |`;
    })
    .join("\n");

  return `## 2. Classification Summary

| Company | Type | Direct | Listed | VC Exit | Overall |
|---------|------|--------|--------|---------|---------|
${rows}`;
}

function formatCandidateEntry(candidate: CandidateCompany): string {
  const lines = [
    `### ${candidate.companyName}`,
    "",
    `- **Country:** ${display(candidate.country)}`,
    `- **Listed Status:** ${display(candidate.listedStatus)}`,
    `- **Technology:** ${display(candidate.technology)}`,
    `- **Product:** ${display(candidate.product)}`,
    `- **Market:** ${display(candidate.indicationOrMarket)}`,
    `- **Stage:** ${display(candidate.developmentStage)}`,
    `- **Business Model:** ${display(candidate.businessModel)}`,
  ];

  if (candidate.scores) {
    lines.push(
      `- **Scores:** Direct ${score(candidate.scores.directCompetitorScore)}, Listed ${score(candidate.scores.listedComparableScore)}, VC Exit ${score(candidate.scores.vcExitComparableScore)}, Overall ${score(candidate.scores.overallRelevanceScore)}`
    );
  }

  if (candidate.llmClassification?.rationale) {
    lines.push(`- **Rationale:** ${candidate.llmClassification.rationale}`);
  }

  if (candidate.userNote) {
    lines.push(`- **Analyst Note:** ${candidate.userNote}`);
  }

  return lines.join("\n");
}

function formatTypeSection(
  sectionNumber: number,
  title: string,
  candidates: CandidateCompany[],
  type: CandidateType
): string {
  const filtered = approvedByType(candidates, type);
  const header = `## ${sectionNumber}. ${title}`;

  if (filtered.length === 0) {
    return `${header}

_No approved candidates in this category._`;
  }

  return `${header}

${filtered.map(formatCandidateEntry).join("\n\n")}`;
}

function implicationSection(
  sectionNumber: number,
  title: string,
  purpose: AnalysisPurpose,
  allowedPurposes: AnalysisPurpose[],
  content?: string
): string {
  const header = `## ${sectionNumber}. ${title}`;

  if (!allowedPurposes.includes(purpose)) {
    return `${header}

_Not applicable for analysis purpose "${purpose}."_`;
  }

  if (!content || content.trim() === "") {
    return `${header}

_No implication generated. Ensure OPENAI_API_KEY is configured and approved candidates with evidence exist._`;
  }

  return `${header}

${content.trim()}`;
}

function formatEvidenceAppendix(candidate: CandidateCompany): string {
  if (candidate.evidenceSources.length === 0) {
    return `- _No evidence sources recorded._`;
  }

  return candidate.evidenceSources
    .map((source, index) => {
      const parts = [
        `  ${index + 1}.`,
        source.sourceTitle && `**${source.sourceTitle}**`,
        source.sourceType && `(${source.sourceType})`,
        source.sourceUrl && `<${source.sourceUrl}>`,
        source.evidenceSnippet && `— ${source.evidenceSnippet}`,
      ].filter(Boolean);
      return `- ${parts.join(" ")}`;
    })
    .join("\n");
}

function formatCaveatsAppendix(candidates: CandidateCompany[]): string {
  const withCaveats = candidates.filter(
    (c) => c.llmClassification?.caveat?.trim()
  );

  if (withCaveats.length === 0) {
    return "_No caveats recorded._";
  }

  return withCaveats
    .map(
      (c) =>
        `- **${c.companyName}:** ${c.llmClassification!.caveat}`
    )
    .join("\n");
}

function formatAppendixSection(
  candidates: CandidateCompany[],
  includePendingInAppendix: boolean
): string {
  const approved = approvedCandidates(candidates);
  const caveatCandidates = includePendingInAppendix
    ? candidates.filter((c) => c.reviewStatus !== "Rejected")
    : approved;

  const evidenceCandidates = includePendingInAppendix
    ? candidates.filter((c) => c.reviewStatus !== "Rejected")
    : approved;

  const pending = pendingCandidates(candidates);

  let pendingBlock = "";
  if (includePendingInAppendix && pending.length > 0) {
    pendingBlock = `

### Pending Candidates (Appendix)

${pending
  .map(
    (c) =>
      `- **${c.companyName}** (${c.candidateType}) — review status: Pending`
  )
  .join("\n")}`;
  } else if (includePendingInAppendix) {
    pendingBlock = `

### Pending Candidates (Appendix)

_No pending candidates._`;
  }

  const evidenceBlocks = evidenceCandidates
    .map(
      (c) => `#### ${c.companyName}

${formatEvidenceAppendix(c)}`
    )
    .join("\n\n");

  return `## 9. Caveats & Source Appendix

### Caveats

${formatCaveatsAppendix(caveatCandidates)}
${pendingBlock}

### Evidence Sources

${evidenceBlocks || "_No evidence sources for included candidates._"}`;
}

export function buildReportMarkdown(input: ReportBuildInput): string {
  const { project, includePendingInAppendix, techSpecialImplication, vcImplication } =
    input;
  const { target, candidates } = project;
  const purpose = target.analysisPurpose;

  const sections = [
    "# Competitive Landscape Report",
    "",
    `_Generated for ${target.companyName} · Analysis Purpose: ${purpose}_`,
    "",
    formatTargetSection(target),
    "",
    formatClassificationSummary(candidates),
    "",
    formatTypeSection(3, "Direct Competitors", candidates, "Direct Competitor"),
    "",
    formatTypeSection(
      4,
      "Indirect Competitors",
      candidates,
      "Indirect Competitor"
    ),
    "",
    formatTypeSection(
      5,
      "Comparable Listed Companies",
      candidates,
      "Comparable Listed Company"
    ),
    "",
    formatTypeSection(
      6,
      "Comparable Private Companies",
      candidates,
      "Comparable Private Company"
    ),
    "",
    implicationSection(
      7,
      "Implication for Tech-Special Listing",
      purpose,
      ["Tech-Special Listing", "Both"],
      techSpecialImplication
    ),
    "",
    implicationSection(
      8,
      "Implication for VC Investment Review",
      purpose,
      ["VC Investment Review", "Both"],
      vcImplication
    ),
    "",
    formatAppendixSection(candidates, includePendingInAppendix),
  ];

  return sections.join("\n");
}

export function needsTechSpecialImplication(purpose: AnalysisPurpose): boolean {
  return purpose === "Tech-Special Listing" || purpose === "Both";
}

export function needsVcImplication(purpose: AnalysisPurpose): boolean {
  return purpose === "VC Investment Review" || purpose === "Both";
}
