"use client";

import { useEffect, useState } from "react";
import { addEvidenceAction, deleteEvidenceAction } from "@/app/actions/candidates";
import { EvidenceForm } from "@/components/projects/EvidenceForm";
import { CandidatesTab } from "@/components/projects/tabs/CandidatesTab";
import { EvidenceTab } from "@/components/projects/tabs/EvidenceTab";
import { ExportTab } from "@/components/projects/tabs/ExportTab";
import { ReportTab } from "@/components/projects/tabs/ReportTab";
import { ReviewTab } from "@/components/projects/tabs/ReviewTab";
import { ScoringTab } from "@/components/projects/tabs/ScoringTab";
import { TargetTab } from "@/components/projects/tabs/TargetTab";
import type { CandidateCompany, LandscapeProject } from "@/types";

const TABS = [
  { id: "target", label: "Target" },
  { id: "candidates", label: "Candidates" },
  { id: "evidence", label: "Evidence" },
  { id: "scoring", label: "Scoring" },
  { id: "review", label: "Review" },
  { id: "report", label: "Report" },
  { id: "export", label: "Export" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type WorkbenchTabsProps = {
  project: LandscapeProject;
  initialTab?: string;
  onEditCandidate: (candidate: CandidateCompany) => void;
  onDeleteCandidate: (candidateId: string) => Promise<void>;
  onEvidenceAdded: () => void;
  onClassified: () => void;
};

export function WorkbenchTabs({
  project,
  initialTab,
  onEditCandidate,
  onDeleteCandidate,
  onEvidenceAdded,
  onClassified,
}: WorkbenchTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("target");

  useEffect(() => {
    if (
      initialTab &&
      TABS.some((t) => t.id === initialTab)
    ) {
      setActiveTab(initialTab as TabId);
    }
  }, [initialTab]);

  return (
    <section>
      <div className="mb-4 flex flex-wrap gap-1 border-b border-memo-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border border-b-0 border-memo-border bg-memo-surface text-memo-ink"
                : "text-memo-muted hover:bg-memo-accent-light hover:text-memo-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[200px]">
        {activeTab === "target" && <TargetTab target={project.target} />}
        {activeTab === "candidates" && (
          <CandidatesTab
            projectId={project.id}
            candidates={project.candidates}
            onEdit={onEditCandidate}
            onDelete={onDeleteCandidate}
            onClassified={onClassified}
          />
        )}
        {activeTab === "evidence" && (
          <div className="space-y-6">
            <EvidenceForm
              projectId={project.id}
              candidates={project.candidates}
              onSubmit={async (candidateId, formData) => {
                await addEvidenceAction(project.id, candidateId, formData);
                onEvidenceAdded();
              }}
            />
            <EvidenceTab
              candidates={project.candidates}
              onDeleteEvidence={async (candidateId, evidenceId) => {
                await deleteEvidenceAction(
                  project.id,
                  candidateId,
                  evidenceId
                );
                onEvidenceAdded();
              }}
            />
          </div>
        )}
        {activeTab === "scoring" && (
          <ScoringTab
            projectId={project.id}
            candidates={project.candidates}
            onRecalculated={onClassified}
          />
        )}
        {activeTab === "review" && (
          <ReviewTab
            projectId={project.id}
            candidates={project.candidates}
            onReviewUpdated={onClassified}
          />
        )}
        {activeTab === "report" && (
          <ReportTab projectId={project.id} report={project.report} />
        )}
        {activeTab === "export" && (
          <ExportTab
            projectId={project.id}
            companyName={project.target.companyName}
            hasReport={!!project.report?.markdown}
          />
        )}
      </div>
    </section>
  );
}
