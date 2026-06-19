import { formatAnalysisPurpose } from "@/lib/projects/formatters";
import type { TargetCompany } from "@/types";

type TargetSummaryPanelProps = {
  target: TargetCompany;
};

const FIELDS: { key: keyof TargetCompany; label: string }[] = [
  { key: "companyName", label: "Company Name" },
  { key: "description", label: "Description" },
  { key: "coreTechnology", label: "Core Technology" },
  { key: "productOrService", label: "Product / Service" },
  { key: "indicationOrMarket", label: "Indication / Market" },
  { key: "customerGroup", label: "Customer Group" },
  { key: "businessModel", label: "Business Model" },
  { key: "developmentStage", label: "Development Stage" },
  { key: "analysisPurpose", label: "Analysis Purpose" },
];

export function TargetSummaryPanel({ target }: TargetSummaryPanelProps) {
  return (
    <section className="mb-6 rounded-lg border border-memo-border bg-memo-surface p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-memo-muted">
          Target Summary
        </h2>
        <button
          type="button"
          disabled
          title="Target edit coming in a later step"
          className="cursor-not-allowed text-xs text-memo-muted"
        >
          Edit Target
        </button>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map(({ key, label }) => {
          const raw = target[key];
          const value =
            key === "analysisPurpose"
              ? formatAnalysisPurpose(target.analysisPurpose)
              : (raw as string | undefined) ?? "-";
          return (
            <div key={key}>
              <dt className="text-xs font-medium text-memo-muted">{label}</dt>
              <dd className="mt-0.5 text-sm text-memo-ink">{value}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
