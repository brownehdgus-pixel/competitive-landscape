"use client";

import { useState, useTransition } from "react";
import {
  reclassifyCandidateAction,
  resetToLlmClassificationAction,
  updateReviewStatusAction,
  updateUserNoteAction,
} from "@/app/actions/review";
import { Badge } from "@/components/ui/Badge";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { MANUAL_RECLASSIFY_TYPES } from "@/lib/candidates/reviewConstants";
import {
  candidateTypeToBadge,
  formatDateTime,
  getReportInclusion,
  reviewStatusToBadge,
  typeSourceToBadge,
} from "@/lib/projects/formatters";
import type { CandidateCompany, ReviewStatus } from "@/types";

const RECLASSIFY_LABELS: Record<(typeof MANUAL_RECLASSIFY_TYPES)[number], string> =
  {
    "Direct Competitor": "Direct",
    "Indirect Competitor": "Indirect",
    "Comparable Listed Company": "Listed",
    "Comparable Private Company": "Private",
  };

type ReviewTabProps = {
  projectId: string;
  candidates: CandidateCompany[];
  onReviewUpdated: () => void;
};

export function ReviewTab({
  projectId,
  candidates,
  onReviewUpdated,
}: ReviewTabProps) {
  const [isPending, startTransition] = useTransition();
  const [activeCandidateId, setActiveCandidateId] = useState<string | null>(
    null
  );
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const runAction = (action: () => Promise<void>) => {
    startTransition(async () => {
      await action();
      onReviewUpdated();
    });
  };

  const handleReviewStatus = (
    candidateId: string,
    reviewStatus: ReviewStatus
  ) => {
    runAction(() =>
      updateReviewStatusAction(projectId, candidateId, reviewStatus)
    );
  };

  const handleReclassify = (
    candidateId: string,
    type: (typeof MANUAL_RECLASSIFY_TYPES)[number]
  ) => {
    runAction(() =>
      reclassifyCandidateAction(projectId, candidateId, type)
    );
  };

  const handleResetToLlm = (candidateId: string) => {
    runAction(() =>
      resetToLlmClassificationAction(projectId, candidateId)
    );
  };

  const handleSaveNote = (candidateId: string) => {
    const note = noteDrafts[candidateId] ?? "";
    runAction(() =>
      updateUserNoteAction(projectId, candidateId, note)
    );
    setActiveCandidateId(null);
  };

  if (candidates.length === 0) {
    return (
      <EmptyState
        message="No candidates to review."
        submessage="Add and classify candidates first, then approve or reject them here."
      />
    );
  }

  return (
    <DataTable>
      <DataTableHead>
        <DataTableHeaderCell>Company</DataTableHeaderCell>
        <DataTableHeaderCell>LLM Type</DataTableHeaderCell>
        <DataTableHeaderCell>Current Type</DataTableHeaderCell>
        <DataTableHeaderCell>Type Source</DataTableHeaderCell>
        <DataTableHeaderCell>Review Status</DataTableHeaderCell>
        <DataTableHeaderCell>Report Inclusion</DataTableHeaderCell>
        <DataTableHeaderCell>User Note</DataTableHeaderCell>
        <DataTableHeaderCell>Updated At</DataTableHeaderCell>
        <DataTableHeaderCell>Actions</DataTableHeaderCell>
      </DataTableHead>
      <DataTableBody>
        {candidates.map((candidate) => {
          const review = reviewStatusToBadge(candidate.reviewStatus);
          const currentType = candidateTypeToBadge(candidate.candidateType);
          const llmType = candidate.llmClassification
            ? candidateTypeToBadge(
                candidate.llmClassification.candidateType
              )
            : null;
          const typeSource = typeSourceToBadge(candidate);
          const isEditingNote = activeCandidateId === candidate.id;
          const noteValue =
            noteDrafts[candidate.id] ?? candidate.userNote ?? "";

          return (
            <DataTableRow key={candidate.id}>
              <DataTableCell className="font-medium">
                {candidate.companyName}
              </DataTableCell>
              <DataTableCell>
                {llmType ? (
                  <Badge label={llmType.label} variant={llmType.variant} />
                ) : (
                  "-"
                )}
              </DataTableCell>
              <DataTableCell>
                <Badge
                  label={currentType.label}
                  variant={currentType.variant}
                />
              </DataTableCell>
              <DataTableCell>
                {typeSource.label === "-" ? (
                  "-"
                ) : (
                  <Badge
                    label={typeSource.label}
                    variant={typeSource.variant}
                  />
                )}
              </DataTableCell>
              <DataTableCell>
                <Badge label={review.label} variant={review.variant} />
              </DataTableCell>
              <DataTableCell>
                {getReportInclusion(candidate.reviewStatus)}
              </DataTableCell>
              <DataTableCell>
                {isEditingNote ? (
                  <div className="flex min-w-[200px] flex-col gap-1">
                    <textarea
                      value={noteValue}
                      onChange={(e) =>
                        setNoteDrafts((prev) => ({
                          ...prev,
                          [candidate.id]: e.target.value,
                        }))
                      }
                      rows={2}
                      className="w-full rounded border border-memo-border px-2 py-1 text-xs"
                      placeholder="Analyst note…"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleSaveNote(candidate.id)}
                        className="text-xs text-memo-highlight hover:underline disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCandidateId(null)}
                        className="text-xs text-memo-muted hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCandidateId(candidate.id);
                      setNoteDrafts((prev) => ({
                        ...prev,
                        [candidate.id]: candidate.userNote ?? "",
                      }));
                    }}
                    className="block max-w-[200px] truncate text-left text-xs hover:underline"
                    title={candidate.userNote}
                  >
                    {candidate.userNote ? (
                      <span className="text-memo-ink">
                        {candidate.userNote}
                      </span>
                    ) : (
                      <span className="text-memo-highlight">Add note</span>
                    )}
                  </button>
                )}
              </DataTableCell>
              <DataTableCell>
                {formatDateTime(candidate.updatedAt)}
              </DataTableCell>
              <DataTableCell>
                <div className="flex min-w-[280px] flex-col gap-2">
                  <div className="flex flex-wrap gap-1">
                    <ReviewActionButton
                      label="Approve"
                      disabled={isPending}
                      active={candidate.reviewStatus === "Approved"}
                      onClick={() =>
                        handleReviewStatus(candidate.id, "Approved")
                      }
                    />
                    <ReviewActionButton
                      label="Pending"
                      disabled={isPending}
                      active={candidate.reviewStatus === "Pending"}
                      onClick={() =>
                        handleReviewStatus(candidate.id, "Pending")
                      }
                    />
                    <ReviewActionButton
                      label="Reject"
                      disabled={isPending}
                      active={candidate.reviewStatus === "Rejected"}
                      onClick={() =>
                        handleReviewStatus(candidate.id, "Rejected")
                      }
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {MANUAL_RECLASSIFY_TYPES.map((type) => (
                      <ReviewActionButton
                        key={type}
                        label={RECLASSIFY_LABELS[type]}
                        disabled={isPending}
                        active={candidate.candidateType === type}
                        onClick={() => handleReclassify(candidate.id, type)}
                      />
                    ))}
                  </div>
                  {candidate.manuallyOverridden &&
                    candidate.llmClassification && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleResetToLlm(candidate.id)}
                        className="text-left text-xs text-memo-muted hover:text-memo-highlight hover:underline disabled:opacity-50"
                      >
                        Reset to LLM type
                      </button>
                    )}
                </div>
              </DataTableCell>
            </DataTableRow>
          );
        })}
      </DataTableBody>
    </DataTable>
  );
}

function ReviewActionButton({
  label,
  disabled,
  active,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded border px-2 py-0.5 text-xs font-medium disabled:opacity-50 ${
        active
          ? "border-memo-accent bg-memo-accent text-white"
          : "border-memo-border bg-memo-surface text-memo-ink hover:bg-memo-accent-light"
      }`}
    >
      {label}
    </button>
  );
}
