import type {
  ConfidenceLevel,
  EvidenceSourceType,
  ListedStatus,
} from "@/types";

export function optionalString(formData: FormData, key: string): string | undefined {
  const value = String(formData.get(key) ?? "").trim();
  return value || undefined;
}

export function requiredString(formData: FormData, key: string): string {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
}

export function parseListedStatus(value: string): ListedStatus {
  if (value === "listed" || value === "private" || value === "unknown") {
    return value;
  }
  return "unknown";
}

const EVIDENCE_SOURCE_TYPES: EvidenceSourceType[] = [
  "company_site",
  "news",
  "clinicaltrial",
  "paper",
  "dart",
  "sec",
  "manual",
  "other",
];

export function parseEvidenceSourceType(
  value: string | undefined
): EvidenceSourceType | undefined {
  if (!value) return undefined;
  if (EVIDENCE_SOURCE_TYPES.includes(value as EvidenceSourceType)) {
    return value as EvidenceSourceType;
  }
  return "other";
}

const CONFIDENCE_LEVELS: ConfidenceLevel[] = ["High", "Medium", "Low"];

export function parseConfidenceLevel(
  value: string | undefined
): ConfidenceLevel | undefined {
  if (!value) return undefined;
  if (CONFIDENCE_LEVELS.includes(value as ConfidenceLevel)) {
    return value as ConfidenceLevel;
  }
  return undefined;
}

export type CandidateFormFields = {
  companyName: string;
  listedStatus: ListedStatus;
  country?: string;
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
  sourceUrl?: string;
  sourceTitle?: string;
  evidenceSnippet?: string;
  sourceType?: EvidenceSourceType;
  confidenceLevel?: ConfidenceLevel;
};

export function parseCandidateForm(formData: FormData): CandidateFormFields {
  const companyName = requiredString(formData, "companyName");
  const listedStatus = parseListedStatus(
    String(formData.get("listedStatus") ?? "unknown")
  );
  const technology = optionalString(formData, "technology");
  const product = optionalString(formData, "product");
  const indicationOrMarket = optionalString(formData, "indicationOrMarket");
  const businessModel = optionalString(formData, "businessModel");
  const developmentStage = optionalString(formData, "developmentStage");
  const sourceUrl = optionalString(formData, "sourceUrl");
  const memo = optionalString(formData, "memo");

  if (!technology && !product) {
    throw new Error("Technology or Product is required");
  }
  if (!indicationOrMarket) {
    throw new Error("Indication or Market is required");
  }
  if (!businessModel) {
    throw new Error("Business Model is required");
  }
  if (!developmentStage) {
    throw new Error("Development Stage is required");
  }
  if (!sourceUrl && !memo) {
    throw new Error("Source URL or Memo is required");
  }

  return {
    companyName,
    listedStatus,
    country: optionalString(formData, "country"),
    ticker: optionalString(formData, "ticker"),
    exchange: optionalString(formData, "exchange"),
    website: optionalString(formData, "website"),
    technology,
    product,
    indicationOrMarket,
    customerGroup: optionalString(formData, "customerGroup"),
    businessModel,
    developmentStage,
    latestFundingRound: optionalString(formData, "latestFundingRound"),
    keyInvestors: optionalString(formData, "keyInvestors"),
    recentEvent: optionalString(formData, "recentEvent"),
    memo,
    sourceUrl,
    sourceTitle: optionalString(formData, "sourceTitle"),
    evidenceSnippet: optionalString(formData, "evidenceSnippet"),
    sourceType: parseEvidenceSourceType(
      optionalString(formData, "sourceType")
    ),
    confidenceLevel: parseConfidenceLevel(
      optionalString(formData, "confidenceLevel")
    ),
  };
}

export type EvidenceFormFields = {
  sourceUrl?: string;
  sourceTitle?: string;
  evidenceSnippet?: string;
  sourceType?: EvidenceSourceType;
  confidenceLevel?: ConfidenceLevel;
  sourceDate?: string;
};

export function parseEvidenceForm(formData: FormData): EvidenceFormFields {
  const sourceUrl = optionalString(formData, "sourceUrl");
  const evidenceSnippet = optionalString(formData, "evidenceSnippet");

  if (!sourceUrl && !evidenceSnippet) {
    throw new Error("Source URL or Evidence Snippet is required");
  }

  return {
    sourceUrl,
    sourceTitle: optionalString(formData, "sourceTitle"),
    evidenceSnippet,
    sourceType: parseEvidenceSourceType(
      optionalString(formData, "sourceType")
    ),
    confidenceLevel: parseConfidenceLevel(
      optionalString(formData, "confidenceLevel")
    ),
    sourceDate: optionalString(formData, "sourceDate"),
  };
}
