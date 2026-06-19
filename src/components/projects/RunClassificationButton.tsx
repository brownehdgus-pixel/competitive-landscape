"use client";

import { useState } from "react";
import type { ClassifyBatchResult } from "@/lib/candidates/classifyService";

type RunClassificationButtonProps = {
  projectId: string;
  unclassifiedCount: number;
  onComplete: () => void;
};

export function RunClassificationButton({
  projectId,
  unclassifiedCount,
  onComplete,
}: RunClassificationButtonProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<ClassifyBatchResult | null>(
    null
  );

  const runClassification = async (unclassifiedOnly: boolean) => {
    setIsRunning(true);
    setLastResult(null);

    try {
      const response = await fetch("/api/llm/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, unclassifiedOnly }),
      });

      const data = (await response.json()) as ClassifyBatchResult & {
        error?: string;
      };

      if (!response.ok) {
        setLastResult({
          results: [],
          stoppedEarly: true,
          stopReason: data.error ?? "Classification request failed",
        });
        return;
      }

      setLastResult(data);
      onComplete();
    } catch (error) {
      setLastResult({
        results: [],
        stoppedEarly: true,
        stopReason:
          error instanceof Error ? error.message : "Network error",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const successCount =
    lastResult?.results.filter((r) => r.success).length ?? 0;
  const failCount =
    lastResult?.results.filter((r) => !r.success).length ?? 0;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isRunning || unclassifiedCount === 0}
          onClick={() => runClassification(true)}
          title={
            unclassifiedCount === 0
              ? "No unclassified candidates"
              : `Classify up to 10 unclassified (${unclassifiedCount} pending)`
          }
          className="rounded-md border border-memo-accent bg-memo-surface px-3 py-1.5 text-xs font-medium text-memo-ink hover:bg-memo-accent-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRunning ? "Classifying…" : "Run Classification"}
        </button>
        <button
          type="button"
          disabled={isRunning}
          onClick={() => runClassification(false)}
          title="Reclassify up to 10 candidates (including already classified)"
          className="rounded-md border border-memo-border bg-memo-surface px-3 py-1.5 text-xs font-medium text-memo-muted hover:bg-memo-accent-light hover:text-memo-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reclassify Batch
        </button>
      </div>
      {lastResult && (
        <p className="max-w-xs text-right text-xs text-memo-muted">
          {lastResult.results.length === 0 && !lastResult.stopReason
            ? "No candidates to classify."
            : lastResult.stoppedEarly && lastResult.stopReason
              ? `${lastResult.stopReason} (${successCount} ok, ${failCount} failed)`
              : `Done: ${successCount} classified${failCount > 0 ? `, ${failCount} failed` : ""}`}
        </p>
      )}
    </div>
  );
}

export async function classifySingleCandidate(
  projectId: string,
  candidateId: string
): Promise<ClassifyBatchResult & { error?: string }> {
  const response = await fetch("/api/llm/classify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId,
      candidateIds: [candidateId],
      unclassifiedOnly: false,
    }),
  });

  const data = (await response.json()) as ClassifyBatchResult & {
    error?: string;
  };

  if (!response.ok) {
    return {
      results: [],
      stoppedEarly: true,
      stopReason: data.error ?? "Classification failed",
    };
  }

  return data;
}
