"use client";

import { useTransition } from "react";
import type { CandidateCompany } from "@/types";

const inputClass =
  "mt-1 w-full rounded-md border border-memo-border bg-white px-3 py-2 text-sm text-memo-ink focus:border-memo-accent focus:outline-none focus:ring-1 focus:ring-memo-accent";

const labelClass = "block text-sm font-medium text-memo-ink";

type EvidenceFormProps = {
  projectId: string;
  candidates: CandidateCompany[];
  onSubmit: (candidateId: string, formData: FormData) => Promise<void>;
};

export function EvidenceForm({
  projectId,
  candidates,
  onSubmit,
}: EvidenceFormProps) {
  const [isPending, startTransition] = useTransition();

  if (candidates.length === 0) {
    return (
      <p className="text-sm text-memo-muted">
        Add candidates first before attaching evidence sources.
      </p>
    );
  }

  return (
    <form
      className="mb-6 space-y-4 rounded-lg border border-memo-border bg-memo-surface p-4"
      action={(formData) => {
        const candidateId = String(formData.get("candidateId") ?? "");
        if (!candidateId) return;
        formData.set("projectId", projectId);
        startTransition(() => onSubmit(candidateId, formData));
      }}
    >
      <h3 className="text-sm font-semibold text-memo-ink">Add Evidence Source</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="candidateId" className={labelClass}>
            Candidate <span className="text-red-500">*</span>
          </label>
          <select
            id="candidateId"
            name="candidateId"
            required
            className={inputClass}
            defaultValue={candidates[0]?.id}
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="sourceUrl" className={labelClass}>
            Source URL
          </label>
          <input id="sourceUrl" name="sourceUrl" className={inputClass} />
        </div>

        <div>
          <label htmlFor="sourceTitle" className={labelClass}>
            Source Title
          </label>
          <input id="sourceTitle" name="sourceTitle" className={inputClass} />
        </div>

        <div>
          <label htmlFor="sourceType" className={labelClass}>
            Source Type
          </label>
          <select id="sourceType" name="sourceType" className={inputClass}>
            <option value="manual">Manual</option>
            <option value="company_site">Company Site</option>
            <option value="news">News</option>
            <option value="clinicaltrial">Clinical Trial</option>
            <option value="paper">Paper</option>
            <option value="dart">DART</option>
            <option value="sec">SEC</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="sourceDate" className={labelClass}>
            Source Date
          </label>
          <input id="sourceDate" name="sourceDate" className={inputClass} />
        </div>

        <div>
          <label htmlFor="confidenceLevel" className={labelClass}>
            Confidence
          </label>
          <select
            id="confidenceLevel"
            name="confidenceLevel"
            className={inputClass}
          >
            <option value="">—</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="evidenceSnippet" className={labelClass}>
            Evidence Snippet
          </label>
          <textarea
            id="evidenceSnippet"
            name="evidenceSnippet"
            rows={3}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-memo-accent px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {isPending ? "Adding..." : "Add Evidence"}
      </button>
    </form>
  );
}
