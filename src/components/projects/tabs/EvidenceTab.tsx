"use client";

import { useTransition } from "react";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { displayValue, formatDateTime } from "@/lib/projects/formatters";
import type { CandidateCompany } from "@/types";

type EvidenceRow = {
  candidateId: string;
  evidenceId: string;
  candidateName: string;
  sourceType?: string;
  sourceTitle?: string;
  sourceUrl?: string;
  sourceDate?: string;
  evidenceSnippet?: string;
  confidenceLevel?: string;
  checkedAt?: string;
};

function flattenEvidence(candidates: CandidateCompany[]): EvidenceRow[] {
  const rows: EvidenceRow[] = [];
  for (const candidate of candidates) {
    for (const source of candidate.evidenceSources) {
      rows.push({
        candidateId: candidate.id,
        evidenceId: source.id,
        candidateName: candidate.companyName,
        sourceType: source.sourceType,
        sourceTitle: source.sourceTitle,
        sourceUrl: source.sourceUrl,
        sourceDate: source.sourceDate,
        evidenceSnippet: source.evidenceSnippet,
        confidenceLevel: source.confidenceLevel,
        checkedAt: source.checkedAt,
      });
    }
  }
  return rows;
}

type EvidenceTabProps = {
  candidates: CandidateCompany[];
  onDeleteEvidence: (
    candidateId: string,
    evidenceId: string
  ) => Promise<void>;
};

export function EvidenceTab({
  candidates,
  onDeleteEvidence,
}: EvidenceTabProps) {
  const [isPending, startTransition] = useTransition();
  const rows = flattenEvidence(candidates);

  if (rows.length === 0) {
    return (
      <EmptyState
        message="No evidence sources yet."
        submessage="Use the form above to add evidence for a candidate."
      />
    );
  }

  return (
    <DataTable>
      <DataTableHead>
        <DataTableHeaderCell>Candidate</DataTableHeaderCell>
        <DataTableHeaderCell>Source Type</DataTableHeaderCell>
        <DataTableHeaderCell>Source Title</DataTableHeaderCell>
        <DataTableHeaderCell>Source URL</DataTableHeaderCell>
        <DataTableHeaderCell>Source Date</DataTableHeaderCell>
        <DataTableHeaderCell>Evidence Snippet</DataTableHeaderCell>
        <DataTableHeaderCell>Confidence</DataTableHeaderCell>
        <DataTableHeaderCell>Checked At</DataTableHeaderCell>
        <DataTableHeaderCell>Actions</DataTableHeaderCell>
      </DataTableHead>
      <DataTableBody>
        {rows.map((row) => (
          <DataTableRow key={row.evidenceId}>
            <DataTableCell className="font-medium">
              {row.candidateName}
            </DataTableCell>
            <DataTableCell>{displayValue(row.sourceType)}</DataTableCell>
            <DataTableCell title={row.sourceTitle}>
              <span className="block max-w-[160px] truncate">
                {displayValue(row.sourceTitle)}
              </span>
            </DataTableCell>
            <DataTableCell>
              {row.sourceUrl ? (
                <a
                  href={row.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-memo-highlight hover:underline"
                >
                  <span className="block max-w-[200px] truncate">
                    {row.sourceUrl}
                  </span>
                </a>
              ) : (
                "-"
              )}
            </DataTableCell>
            <DataTableCell>{displayValue(row.sourceDate)}</DataTableCell>
            <DataTableCell title={row.evidenceSnippet}>
              <span className="block max-w-[240px] truncate">
                {displayValue(row.evidenceSnippet)}
              </span>
            </DataTableCell>
            <DataTableCell>{displayValue(row.confidenceLevel)}</DataTableCell>
            <DataTableCell>{formatDateTime(row.checkedAt)}</DataTableCell>
            <DataTableCell>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  if (
                    !window.confirm("Delete this evidence source?")
                  ) {
                    return;
                  }
                  startTransition(() =>
                    onDeleteEvidence(row.candidateId, row.evidenceId)
                  );
                }}
                className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                Delete
              </button>
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  );
}
