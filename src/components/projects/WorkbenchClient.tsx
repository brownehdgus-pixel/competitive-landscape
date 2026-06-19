"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createCandidateAction,
  deleteCandidateAction,
  updateCandidateAction,
} from "@/app/actions/candidates";
import { CandidateForm } from "@/components/projects/CandidateForm";
import { GenerateReportButton } from "@/components/projects/GenerateReportButton";
import { RunClassificationButton } from "@/components/projects/RunClassificationButton";
import { TargetSummaryPanel } from "@/components/projects/TargetSummaryPanel";
import { WorkbenchSummaryCards } from "@/components/projects/WorkbenchSummaryCards";
import { WorkbenchTabs } from "@/components/projects/WorkbenchTabs";
import {
  formatAnalysisPurpose,
  formatDateTime,
} from "@/lib/projects/formatters";
import type { CandidateCompany, LandscapeProject } from "@/types";
import Link from "next/link";

type WorkbenchClientProps = {
  project: LandscapeProject;
};

export function WorkbenchClient({ project }: WorkbenchClientProps) {
  const router = useRouter();
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<
    CandidateCompany | undefined
  >();
  const [initialTab, setInitialTab] = useState<string | undefined>();

  const openAddCandidate = () => {
    setEditingCandidate(undefined);
    setShowCandidateForm(true);
    setInitialTab("candidates");
  };

  const openEditCandidate = (candidate: CandidateCompany) => {
    setEditingCandidate(candidate);
    setShowCandidateForm(true);
    setInitialTab("candidates");
  };

  const closeCandidateForm = () => {
    setShowCandidateForm(false);
    setEditingCandidate(undefined);
  };

  const refresh = () => router.refresh();

  return (
    <>
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
          <button
            type="button"
            onClick={openAddCandidate}
            className="rounded-md border border-memo-accent bg-memo-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
          >
            Add Candidate
          </button>
          <RunClassificationButton
            projectId={project.id}
            unclassifiedCount={
              project.candidates.filter(
                (c) => c.candidateType === "Unclassified"
              ).length
            }
            onComplete={refresh}
          />
          <GenerateReportButton
            projectId={project.id}
            hasReport={!!project.report?.markdown}
            onComplete={refresh}
          />
          <button
            type="button"
            onClick={() => {
              setInitialTab("export");
            }}
            className="rounded-md border border-memo-border bg-memo-surface px-3 py-1.5 text-xs font-medium text-memo-ink hover:bg-memo-accent-light"
          >
            Export
          </button>
        </div>
      </div>

      <TargetSummaryPanel target={project.target} />
      <WorkbenchSummaryCards project={project} />

      {showCandidateForm && (
        <div className="mb-6">
          <CandidateForm
            projectId={project.id}
            candidate={editingCandidate}
            onCancel={closeCandidateForm}
            onSubmit={async (formData) => {
              if (editingCandidate) {
                await updateCandidateAction(
                  project.id,
                  editingCandidate.id,
                  formData
                );
              } else {
                await createCandidateAction(project.id, formData);
              }
              closeCandidateForm();
              refresh();
            }}
          />
        </div>
      )}

      <WorkbenchTabs
        project={project}
        initialTab={initialTab}
        onEditCandidate={openEditCandidate}
        onDeleteCandidate={async (candidateId) => {
          await deleteCandidateAction(project.id, candidateId);
          refresh();
        }}
        onEvidenceAdded={refresh}
        onClassified={refresh}
      />
    </>
  );
}
