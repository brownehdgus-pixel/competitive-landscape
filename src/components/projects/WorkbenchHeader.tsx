import Link from "next/link";
import {
  formatAnalysisPurpose,
  formatDateTime,
} from "@/lib/projects/formatters";
import type { LandscapeProject } from "@/types";

type WorkbenchHeaderProps = {
  project: LandscapeProject;
};

export function WorkbenchHeader({ project }: WorkbenchHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-memo-border pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <Link
          href="/"
          className="text-sm text-memo-muted hover:text-memo-highlight hover:underline"
        >
          ← Back to Projects
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-memo-ink">
          {project.target.companyName}
        </h1>
        <p className="mt-1 text-sm text-memo-muted">
          {formatAnalysisPurpose(project.target.analysisPurpose)} · Updated{" "}
          {formatDateTime(project.updatedAt)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <PlaceholderButton label="Add Candidate" step="Step 4" />
        <PlaceholderButton label="Run Classification" step="Step 5" />
        <PlaceholderButton label="Generate Report" step="Step 8" />
        <PlaceholderButton label="Export" step="Step 9" />
      </div>
    </div>
  );
}

function PlaceholderButton({
  label,
  step,
}: {
  label: string;
  step: string;
}) {
  return (
    <button
      type="button"
      disabled
      title={`Coming in ${step}`}
      className="cursor-not-allowed rounded-md border border-memo-border bg-memo-accent-light px-3 py-1.5 text-xs font-medium text-memo-muted"
    >
      {label}
    </button>
  );
}
