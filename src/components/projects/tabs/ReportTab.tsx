import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/projects/formatters";
import type { LandscapeReport } from "@/types";

type ReportTabProps = {
  projectId: string;
  report?: LandscapeReport;
};

const REPORT_SECTIONS = [
  "1. Target Company Overview",
  "2. Classification Summary",
  "3. Direct Competitors",
  "4. Indirect Competitors",
  "5. Comparable Listed Companies",
  "6. Comparable Private Companies",
  "7. Implication for Tech-Special Listing",
  "8. Implication for VC Investment Review",
  "9. Caveats & Source Appendix",
];

export function ReportTab({ projectId, report }: ReportTabProps) {
  if (!report?.markdown) {
    return (
      <div className="space-y-4">
        <EmptyState
          message="No report generated yet."
          submessage='Click "Generate Report" in the header to create the 9-section Markdown report.'
        />
        <div className="rounded-lg border border-memo-border bg-memo-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-memo-muted">
            Report structure
          </p>
          <ul className="mt-2 list-inside list-disc text-sm text-memo-muted">
            {REPORT_SECTIONS.map((section) => (
              <li key={section}>{section}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const preview =
    report.markdown.length > 3000
      ? `${report.markdown.slice(0, 3000)}\n\n… [truncated — open Full Preview for complete report]`
      : report.markdown;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-memo-muted">
        <span>
          Generated {formatDateTime(report.generatedAt)}
          {report.includePendingInAppendix
            ? " · Pending included in appendix"
            : " · Approved only in appendix"}
        </span>
        <Link
          href={`/projects/${projectId}/report`}
          className="text-memo-highlight hover:underline"
        >
          Open full preview →
        </Link>
      </div>
      <pre className="overflow-x-auto rounded-lg border border-memo-border bg-memo-surface p-4 text-sm whitespace-pre-wrap text-memo-ink">
        {preview}
      </pre>
    </div>
  );
}
