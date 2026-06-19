"use client";

import Link from "next/link";
import { useTransition } from "react";
import { createProjectAction } from "@/app/actions/projects";
import type { AnalysisPurpose } from "@/types";

const inputClass =
  "mt-1 w-full rounded-md border border-memo-border bg-white px-3 py-2 text-sm text-memo-ink focus:border-memo-accent focus:outline-none focus:ring-1 focus:ring-memo-accent";

const labelClass = "block text-sm font-medium text-memo-ink";

const ANALYSIS_PURPOSES: AnalysisPurpose[] = [
  "Tech-Special Listing",
  "VC Investment Review",
  "Both",
];

export function ProjectForm() {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4 rounded-lg border border-memo-border bg-memo-surface p-6 shadow-sm"
      action={(formData) => {
        startTransition(() => createProjectAction(formData));
      }}
    >
      <div>
        <label htmlFor="companyName" className={labelClass}>
          회사명 / Company Name <span className="text-red-500">*</span>
        </label>
        <input
          id="companyName"
          name="companyName"
          required
          className={inputClass}
          placeholder="Target company name"
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          회사 설명 / Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="coreTechnology" className={labelClass}>
            핵심 기술 / Core Technology
          </label>
          <input id="coreTechnology" name="coreTechnology" className={inputClass} />
        </div>
        <div>
          <label htmlFor="productOrService" className={labelClass}>
            제품·서비스 / Product or Service
          </label>
          <input
            id="productOrService"
            name="productOrService"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="indicationOrMarket" className={labelClass}>
            적응증·시장 / Indication or Market
          </label>
          <input
            id="indicationOrMarket"
            name="indicationOrMarket"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="customerGroup" className={labelClass}>
            고객군 / Customer Group
          </label>
          <input id="customerGroup" name="customerGroup" className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="businessModel" className={labelClass}>
            사업모델 / Business Model
          </label>
          <input id="businessModel" name="businessModel" className={inputClass} />
        </div>
        <div>
          <label htmlFor="developmentStage" className={labelClass}>
            개발·사업화 단계 / Development Stage
          </label>
          <input
            id="developmentStage"
            name="developmentStage"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="analysisPurpose" className={labelClass}>
          분석 목적 / Analysis Purpose
        </label>
        <select
          id="analysisPurpose"
          name="analysisPurpose"
          defaultValue="Both"
          className={inputClass}
        >
          {ANALYSIS_PURPOSES.map((purpose) => (
            <option key={purpose} value={purpose}>
              {purpose}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-memo-accent px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create Project"}
        </button>
        <Link
          href="/"
          className="text-sm text-memo-muted hover:text-memo-ink hover:underline"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
