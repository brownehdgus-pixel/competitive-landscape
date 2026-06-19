import Link from "next/link";
import { XLSX_SHEET_NAMES } from "@/lib/export/exportData";

type ExportTabProps = {
  projectId: string;
  companyName: string;
  hasReport: boolean;
};

export function ExportTab({
  projectId,
  companyName,
  hasReport,
}: ExportTabProps) {
  const markdownUrl = `/api/export/markdown?projectId=${projectId}`;
  const xlsxUrl = `/api/export/xlsx?projectId=${projectId}`;
  const csvUrl = `/api/export/csv?projectId=${projectId}`;

  return (
    <div className="space-y-4">
      <p className="text-sm text-memo-muted">
        Export data for <span className="font-medium">{companyName}</span>.
        XLSX and CSV include all candidates; Markdown requires a generated
        report.
      </p>

      <div className="flex flex-wrap gap-3">
        <ExportLink
          href={markdownUrl}
          label="Download Markdown"
          disabled={!hasReport}
          disabledReason="Generate a report first"
        />
        <ExportLink href={xlsxUrl} label="Download XLSX" />
        <ExportLink href={csvUrl} label="Download CSV" />
      </div>

      <div className="rounded-lg border border-memo-border bg-memo-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-memo-muted">
          XLSX sheets ({XLSX_SHEET_NAMES.length})
        </p>
        <ul className="mt-2 list-inside list-disc text-sm text-memo-muted">
          {XLSX_SHEET_NAMES.map((sheet) => (
            <li key={sheet}>{sheet}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ExportLink({
  href,
  label,
  disabled,
  disabledReason,
}: {
  href: string;
  label: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  if (disabled) {
    return (
      <button
        type="button"
        disabled
        title={disabledReason}
        className="cursor-not-allowed rounded-md border border-memo-border bg-memo-accent-light px-4 py-2 text-sm font-medium text-memo-muted"
      >
        {label}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className="rounded-md border border-memo-accent bg-memo-surface px-4 py-2 text-sm font-medium text-memo-ink hover:bg-memo-accent-light"
    >
      {label}
    </Link>
  );
}
