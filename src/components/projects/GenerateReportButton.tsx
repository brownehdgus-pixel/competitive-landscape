"use client";

import Link from "next/link";
import { useState } from "react";
import { generateReportAction } from "@/app/actions/report";

type GenerateReportButtonProps = {
  projectId: string;
  hasReport: boolean;
  onComplete: () => void;
};

export function GenerateReportButton({
  projectId,
  hasReport,
  onComplete,
}: GenerateReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [includePending, setIncludePending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setMessage(null);

    try {
      await generateReportAction(projectId, includePending);
      setMessage("Report generated.");
      onComplete();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Report generation failed"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs text-memo-muted">
          <input
            type="checkbox"
            checked={includePending}
            onChange={(e) => setIncludePending(e.target.checked)}
            disabled={isGenerating}
            className="rounded border-memo-border"
          />
          Include Pending in Appendix
        </label>
        <button
          type="button"
          disabled={isGenerating}
          onClick={handleGenerate}
          className="rounded-md border border-memo-accent bg-memo-surface px-3 py-1.5 text-xs font-medium text-memo-ink hover:bg-memo-accent-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? "Generating…" : hasReport ? "Regenerate Report" : "Generate Report"}
        </button>
        {hasReport && (
          <Link
            href={`/projects/${projectId}/report`}
            className="rounded-md border border-memo-border bg-memo-surface px-3 py-1.5 text-xs font-medium text-memo-highlight hover:bg-memo-accent-light"
          >
            Full Preview
          </Link>
        )}
      </div>
      {message && (
        <p className="max-w-xs text-right text-xs text-memo-muted">{message}</p>
      )}
    </div>
  );
}
