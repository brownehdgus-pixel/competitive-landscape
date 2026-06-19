import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDateTime } from "@/lib/projects/formatters";
import { landscapeStorage } from "@/lib/storage/landscapeStorage";

type ReportPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReportPreviewPage({ params }: ReportPageProps) {
  const { id } = await params;
  const project = await landscapeStorage.getById(id);

  if (!project) {
    notFound();
  }

  const report = project.report;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/projects/${id}`}
          className="text-sm text-memo-muted hover:text-memo-highlight hover:underline"
        >
          ← Back to Workbench
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-memo-ink">
          Report Preview — {project.target.companyName}
        </h1>
        {report ? (
          <p className="mt-1 text-sm text-memo-muted">
            Generated {formatDateTime(report.generatedAt)}
            {report.includePendingInAppendix
              ? " · Pending included in appendix"
              : ""}
          </p>
        ) : (
          <p className="mt-1 text-sm text-memo-muted">
            No report generated yet. Return to the workbench and click Generate
            Report.
          </p>
        )}
      </div>

      {report?.markdown ? (
        <article className="rounded-lg border border-memo-border bg-memo-surface p-6">
          <pre className="text-sm whitespace-pre-wrap text-memo-ink">
            {report.markdown}
          </pre>
        </article>
      ) : (
        <div className="rounded-lg border border-dashed border-memo-border bg-memo-surface p-8 text-center text-sm text-memo-muted">
          Report not available.
        </div>
      )}
    </div>
  );
}
