"use client";

import { useState } from "react";
import type { AnalyzeTargetResult } from "@/lib/target/analyzeTargetService";

type AnalyzeTargetButtonProps = {
  projectId: string;
  website?: string;
  onComplete: () => void;
};

export function AnalyzeTargetButton({
  projectId,
  website,
  onComplete,
}: AnalyzeTargetButtonProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [caveats, setCaveats] = useState<string[]>([]);

  const runAnalyze = async () => {
    setIsRunning(true);
    setMessage(null);
    setCaveats([]);

    let websiteOverride = website?.trim();
    if (!websiteOverride) {
      const entered = window.prompt(
        "Enter target company website URL (optional, improves analysis):"
      );
      if (entered === null) {
        setIsRunning(false);
        return;
      }
      websiteOverride = entered.trim() || undefined;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/analyze-target`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          websiteOverride ? { website: websiteOverride } : {}
        ),
      });

      const data = (await response.json()) as AnalyzeTargetResult & {
        error?: string;
      };

      if (!response.ok) {
        setMessage(data.error ?? "Target analysis failed");
        return;
      }

      setCaveats(data.caveats ?? []);
      setMessage(
        "Target analysis completed. Please review the target profile before generating candidates."
      );
      onComplete();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Target analysis failed"
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
        onClick={runAnalyze}
        title="Use OpenAI to infer missing target profile fields"
        className="rounded-md border border-memo-border bg-memo-surface px-3 py-1.5 text-xs font-medium text-memo-ink hover:bg-memo-accent-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRunning ? "Analyzing…" : "Analyze Target"}
      </button>
      {message && (
        <p className="max-w-xs text-right text-xs text-memo-muted">{message}</p>
      )}
      {caveats.length > 0 && (
        <ul className="max-w-xs list-inside list-disc text-right text-xs text-amber-700">
          {caveats.map((caveat) => (
            <li key={caveat}>{caveat}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
