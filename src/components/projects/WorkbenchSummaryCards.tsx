import { getProjectStats } from "@/lib/projects/projectStats";
import type { LandscapeProject } from "@/types";

type WorkbenchSummaryCardsProps = {
  project: LandscapeProject;
};

const CARD_ITEMS: {
  key: keyof ReturnType<typeof getProjectStats>;
  label: string;
}[] = [
  { key: "totalCandidates", label: "Total Candidates" },
  { key: "approved", label: "Approved" },
  { key: "pending", label: "Pending" },
  { key: "rejected", label: "Rejected" },
  { key: "direct", label: "Direct Competitors" },
  { key: "indirect", label: "Indirect Competitors" },
  { key: "listed", label: "Listed Comparables" },
  { key: "privateComparable", label: "Private Comparables" },
  { key: "notRelevant", label: "Not Relevant" },
  { key: "unclassified", label: "Unclassified" },
];

export function WorkbenchSummaryCards({ project }: WorkbenchSummaryCardsProps) {
  const stats = getProjectStats(project);

  return (
    <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {CARD_ITEMS.map(({ key, label }) => (
        <div
          key={key}
          className="rounded-lg border border-memo-border bg-memo-surface px-3 py-3 shadow-sm"
        >
          <p className="text-xs text-memo-muted">{label}</p>
          <p className="mt-1 text-xl font-semibold text-memo-ink">
            {stats[key]}
          </p>
        </div>
      ))}
    </section>
  );
}
