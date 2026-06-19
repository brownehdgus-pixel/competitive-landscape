"use client";

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
import {
  candidateTypeToBadge,
  displayValue,
  formatDateTime,
  formatListedStatus,
  reviewStatusToBadge,
} from "@/lib/projects/formatters";
import type { CandidateCompany } from "@/types";

type CandidateMasterTableProps = {
  candidates: CandidateCompany[];
  onEdit: (candidate: CandidateCompany) => void;
  onDelete: (candidateId: string, companyName: string) => void;
  onClassify?: (candidateId: string) => Promise<void>;
  isDeleting?: boolean;
  classifyingId?: string | null;
};

export function CandidateMasterTable({
  candidates,
  onEdit,
  onDelete,
  onClassify,
  isDeleting,
  classifyingId,
}: CandidateMasterTableProps) {
  if (candidates.length === 0) {
    return (
      <EmptyState
        message="No candidates yet."
        submessage='Click "Add Candidate" in the header to add your first competitor or comparable company.'
      />
    );
  }

  return (
    <DataTable>
      <DataTableHead>
        <DataTableHeaderCell>Status</DataTableHeaderCell>
        <DataTableHeaderCell>Type</DataTableHeaderCell>
        <DataTableHeaderCell>Company</DataTableHeaderCell>
        <DataTableHeaderCell>Listed</DataTableHeaderCell>
        <DataTableHeaderCell>Country</DataTableHeaderCell>
        <DataTableHeaderCell>Ticker</DataTableHeaderCell>
        <DataTableHeaderCell>Exchange</DataTableHeaderCell>
        <DataTableHeaderCell>Technology</DataTableHeaderCell>
        <DataTableHeaderCell>Product</DataTableHeaderCell>
        <DataTableHeaderCell>Market</DataTableHeaderCell>
        <DataTableHeaderCell>Customer</DataTableHeaderCell>
        <DataTableHeaderCell>Business Model</DataTableHeaderCell>
        <DataTableHeaderCell>Stage</DataTableHeaderCell>
        <DataTableHeaderCell>Funding Round</DataTableHeaderCell>
        <DataTableHeaderCell>Key Investors</DataTableHeaderCell>
        <DataTableHeaderCell>Recent Event</DataTableHeaderCell>
        <DataTableHeaderCell>Memo</DataTableHeaderCell>
        <DataTableHeaderCell>Sources</DataTableHeaderCell>
        <DataTableHeaderCell>Updated At</DataTableHeaderCell>
        <DataTableHeaderCell>Actions</DataTableHeaderCell>
      </DataTableHead>
      <DataTableBody>
        {candidates.map((candidate) => {
          const review = reviewStatusToBadge(candidate.reviewStatus);
          const type = candidateTypeToBadge(candidate.candidateType);
          return (
            <DataTableRow key={candidate.id}>
              <DataTableCell>
                <Badge label={review.label} variant={review.variant} />
              </DataTableCell>
              <DataTableCell>
                <Badge label={type.label} variant={type.variant} />
              </DataTableCell>
              <DataTableCell className="font-medium">
                {candidate.companyName}
              </DataTableCell>
              <DataTableCell>
                {formatListedStatus(candidate.listedStatus)}
              </DataTableCell>
              <DataTableCell>{displayValue(candidate.country)}</DataTableCell>
              <DataTableCell>{displayValue(candidate.ticker)}</DataTableCell>
              <DataTableCell>{displayValue(candidate.exchange)}</DataTableCell>
              <DataTableCell title={candidate.technology}>
                <span className="block max-w-[160px] truncate">
                  {displayValue(candidate.technology)}
                </span>
              </DataTableCell>
              <DataTableCell title={candidate.product}>
                <span className="block max-w-[120px] truncate">
                  {displayValue(candidate.product)}
                </span>
              </DataTableCell>
              <DataTableCell title={candidate.indicationOrMarket}>
                <span className="block max-w-[120px] truncate">
                  {displayValue(candidate.indicationOrMarket)}
                </span>
              </DataTableCell>
              <DataTableCell>{displayValue(candidate.customerGroup)}</DataTableCell>
              <DataTableCell>{displayValue(candidate.businessModel)}</DataTableCell>
              <DataTableCell>
                {displayValue(candidate.developmentStage)}
              </DataTableCell>
              <DataTableCell>
                {displayValue(candidate.latestFundingRound)}
              </DataTableCell>
              <DataTableCell title={candidate.keyInvestors}>
                <span className="block max-w-[120px] truncate">
                  {displayValue(candidate.keyInvestors)}
                </span>
              </DataTableCell>
              <DataTableCell title={candidate.recentEvent}>
                <span className="block max-w-[120px] truncate">
                  {displayValue(candidate.recentEvent)}
                </span>
              </DataTableCell>
              <DataTableCell title={candidate.memo}>
                <span className="block max-w-[120px] truncate">
                  {displayValue(candidate.memo)}
                </span>
              </DataTableCell>
              <DataTableCell>
                {candidate.evidenceSources.length > 0 ? (
                  <span className="text-memo-highlight">
                    {candidate.evidenceSources.length}
                  </span>
                ) : (
                  "-"
                )}
              </DataTableCell>
              <DataTableCell>{formatDateTime(candidate.updatedAt)}</DataTableCell>
              <DataTableCell>
                <div className="flex items-center gap-2">
                  {onClassify && (
                    <button
                      type="button"
                      disabled={classifyingId === candidate.id}
                      onClick={() => onClassify(candidate.id)}
                      className="text-sm text-memo-highlight hover:underline disabled:opacity-50"
                    >
                      {classifyingId === candidate.id
                        ? "Classifying…"
                        : "Classify"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onEdit(candidate)}
                    className="text-sm text-memo-highlight hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() =>
                      onDelete(candidate.id, candidate.companyName)
                    }
                    className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </DataTableCell>
            </DataTableRow>
          );
        })}
      </DataTableBody>
    </DataTable>
  );
}
