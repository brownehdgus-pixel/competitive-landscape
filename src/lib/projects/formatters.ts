import type {
  AnalysisPurpose,
  CandidateCompany,
  CandidateType,
  ListedStatus,
  ReviewStatus,
} from "@/types";

export function formatDateTime(iso?: string): string {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatListedStatus(status: ListedStatus): string {
  switch (status) {
    case "listed":
      return "Listed";
    case "private":
      return "Private";
    default:
      return "Unknown";
  }
}

export function formatAnalysisPurpose(purpose: AnalysisPurpose): string {
  return purpose;
}

export function getReportInclusion(reviewStatus: ReviewStatus): string {
  switch (reviewStatus) {
    case "Approved":
      return "Body";
    case "Pending":
      return "Appendix Optional";
    case "Rejected":
      return "Excluded";
  }
}

export function displayValue(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "-";
  return String(value);
}

export type BadgeVariant =
  | "approved"
  | "pending"
  | "rejected"
  | "direct"
  | "indirect"
  | "listed"
  | "private"
  | "notRelevant"
  | "unclassified"
  | "neutral"
  | "llm"
  | "manual";

export function reviewStatusToBadge(
  status: ReviewStatus
): { label: string; variant: BadgeVariant } {
  switch (status) {
    case "Approved":
      return { label: "Approved", variant: "approved" };
    case "Pending":
      return { label: "Pending", variant: "pending" };
    case "Rejected":
      return { label: "Rejected", variant: "rejected" };
  }
}

export function candidateTypeToBadge(
  type: CandidateType
): { label: string; variant: BadgeVariant } {
  switch (type) {
    case "Direct Competitor":
      return { label: "Direct", variant: "direct" };
    case "Indirect Competitor":
      return { label: "Indirect", variant: "indirect" };
    case "Comparable Listed Company":
      return { label: "Listed", variant: "listed" };
    case "Comparable Private Company":
      return { label: "Private", variant: "private" };
    case "Not Relevant":
      return { label: "Not Relevant", variant: "notRelevant" };
    case "Unclassified":
      return { label: "Unclassified", variant: "unclassified" };
  }
}

/** Current type source: LLM suggestion vs manual override */
export function typeSourceToBadge(
  candidate: CandidateCompany
): { label: string; variant: BadgeVariant } {
  if (candidate.manuallyOverridden) {
    return { label: "Manual", variant: "manual" };
  }
  if (candidate.llmClassification) {
    return { label: "LLM", variant: "llm" };
  }
  return { label: "-", variant: "neutral" };
}

export const BADGE_CLASSES: Record<BadgeVariant, string> = {
  approved: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
  direct: "bg-blue-100 text-blue-800",
  indirect: "bg-purple-100 text-purple-800",
  listed: "bg-indigo-100 text-indigo-800",
  private: "bg-cyan-100 text-cyan-800",
  notRelevant: "bg-gray-100 text-gray-700",
  unclassified: "bg-slate-100 text-slate-700",
  neutral: "bg-gray-100 text-gray-600",
  llm: "bg-sky-100 text-sky-800",
  manual: "bg-orange-100 text-orange-800",
};
