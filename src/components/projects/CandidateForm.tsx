"use client";

import { useTransition } from "react";
import type { CandidateCompany } from "@/types";

const inputClass =
  "mt-1 w-full rounded-md border border-memo-border bg-white px-3 py-2 text-sm text-memo-ink focus:border-memo-accent focus:outline-none focus:ring-1 focus:ring-memo-accent";

const labelClass = "block text-sm font-medium text-memo-ink";

type CandidateFormProps = {
  projectId: string;
  candidate?: CandidateCompany;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
};

export function CandidateForm({
  projectId,
  candidate,
  onSubmit,
  onCancel,
}: CandidateFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(candidate);

  return (
    <form
      className="space-y-4 rounded-lg border border-memo-border bg-memo-surface p-4"
      action={(formData) => {
        formData.set("projectId", projectId);
        startTransition(() => onSubmit(formData));
      }}
    >
      <h3 className="text-sm font-semibold text-memo-ink">
        {isEdit ? "Edit Candidate" : "Add Candidate"}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="companyName" className={labelClass}>
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            id="companyName"
            name="companyName"
            required
            defaultValue={candidate?.companyName}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="listedStatus" className={labelClass}>
            Listed Status <span className="text-red-500">*</span>
          </label>
          <select
            id="listedStatus"
            name="listedStatus"
            defaultValue={candidate?.listedStatus ?? "unknown"}
            className={inputClass}
          >
            <option value="listed">Listed</option>
            <option value="private">Private</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        <div>
          <label htmlFor="country" className={labelClass}>
            Country
          </label>
          <input
            id="country"
            name="country"
            defaultValue={candidate?.country}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="technology" className={labelClass}>
            Technology <span className="text-red-500">*</span>
          </label>
          <input
            id="technology"
            name="technology"
            defaultValue={candidate?.technology}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="product" className={labelClass}>
            Product
          </label>
          <input
            id="product"
            name="product"
            defaultValue={candidate?.product}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="indicationOrMarket" className={labelClass}>
            Indication / Market <span className="text-red-500">*</span>
          </label>
          <input
            id="indicationOrMarket"
            name="indicationOrMarket"
            defaultValue={candidate?.indicationOrMarket}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="customerGroup" className={labelClass}>
            Customer Group
          </label>
          <input
            id="customerGroup"
            name="customerGroup"
            defaultValue={candidate?.customerGroup}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="businessModel" className={labelClass}>
            Business Model <span className="text-red-500">*</span>
          </label>
          <input
            id="businessModel"
            name="businessModel"
            defaultValue={candidate?.businessModel}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="developmentStage" className={labelClass}>
            Development Stage <span className="text-red-500">*</span>
          </label>
          <input
            id="developmentStage"
            name="developmentStage"
            defaultValue={candidate?.developmentStage}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="ticker" className={labelClass}>
            Ticker
          </label>
          <input
            id="ticker"
            name="ticker"
            defaultValue={candidate?.ticker}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="exchange" className={labelClass}>
            Exchange
          </label>
          <input
            id="exchange"
            name="exchange"
            defaultValue={candidate?.exchange}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="website" className={labelClass}>
            Website
          </label>
          <input
            id="website"
            name="website"
            defaultValue={candidate?.website}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="latestFundingRound" className={labelClass}>
            Latest Funding Round
          </label>
          <input
            id="latestFundingRound"
            name="latestFundingRound"
            defaultValue={candidate?.latestFundingRound}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="keyInvestors" className={labelClass}>
            Key Investors
          </label>
          <input
            id="keyInvestors"
            name="keyInvestors"
            defaultValue={candidate?.keyInvestors}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="recentEvent" className={labelClass}>
            Recent Event
          </label>
          <input
            id="recentEvent"
            name="recentEvent"
            defaultValue={candidate?.recentEvent}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="memo" className={labelClass}>
            Memo / Evidence Note
          </label>
          <textarea
            id="memo"
            name="memo"
            rows={2}
            defaultValue={candidate?.memo}
            className={inputClass}
          />
        </div>
      </div>

      {!isEdit && (
        <div className="rounded-md border border-dashed border-memo-border p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-memo-muted">
            Initial Evidence (optional if memo provided above)
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
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
                <option value="">—</option>
                <option value="company_site">Company Site</option>
                <option value="news">News</option>
                <option value="clinicaltrial">Clinical Trial</option>
                <option value="paper">Paper</option>
                <option value="dart">DART</option>
                <option value="sec">SEC</option>
                <option value="manual">Manual</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="evidenceSnippet" className={labelClass}>
                Evidence Snippet
              </label>
              <textarea
                id="evidenceSnippet"
                name="evidenceSnippet"
                rows={2}
                className={inputClass}
              />
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
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-memo-accent px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {isPending ? "Saving..." : isEdit ? "Save Changes" : "Add Candidate"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-memo-muted hover:underline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
