"use client";

import { useState } from "react";
import type { GenerateCandidatesResult } from "@/lib/candidates/generateCandidatesService";

type GenerateCandidatesButtonProps = {
  projectId: string;
  onComplete: (result: GenerateCandidatesResult) => void;
};

export function GenerateCandidatesButton({
  projectId,
  onComplete,
}: GenerateCandidatesButtonProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const runGenerate = async () => {
    setIsRunning(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/generate-candidates`,
        { method: "POST" }
      );

      const data = (await response.json()) as GenerateCandidatesResult & {
        error?: string;
      };

      if (!response.ok) {
        setMessage(data.error ?? "Candidate generation failed");
        return;
      }

      setMessage(
        `Added ${data.addedCount} candidate(s), skipped ${data.skippedDuplicateCount} duplicate(s). AI-suggested candidates were added as Pending. Please verify sources before using them in a report.`
      );
      onComplete(data);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Candidate generation failed"
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={isRunning}
        onClick={runGenerate}
        title="Use OpenAI to suggest 12–20 candidate companies from the target profile"
        className="rounded-md border border-memo-border bg-memo-surface px-3 py-1.5 text-xs font-medium text-memo-ink hover:bg-memo-accent-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRunning ? "Generating…" : "Generate Candidates"}
      </button>
      {message && (
        <p className="max-w-xs text-right text-xs text-memo-muted">{message}</p>
      )}
    </div>
  );
}
