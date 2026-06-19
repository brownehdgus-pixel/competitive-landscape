"use client";

import { useState } from "react";
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
  formatDateTime,
} from "@/lib/projects/formatters";
import type { CandidateCompany } from "@/types";

type ScoringTabProps = {
  projectId: string;
  candidates: CandidateCompany[];
  onRecalculated: () => void;
};

function scoreValue(value?: number): string {
  return value === undefined || value === null ? "-" : String(value);
}

export function ScoringTab({
  projectId,
  candidates,
  onRecalculated,
}: ScoringTabProps) {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalcMessage, setRecalcMessage] = useState<string | null>(null);

  const classifiedCount = candidates.filter(
    (c) => c.llmClassification
  ).length;

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    setRecalcMessage(null);

    try {
      const response = await fetch("/api/scoring/recalculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      const data = (await response.json()) as {
        updated?: number;
        error?: string;
      };

      if (!response.ok) {
        setRecalcMessage(data.error ?? "Recalculation failed");
        return;
      }

      setRecalcMessage(`Recalculated ${data.updated ?? 0} candidate(s)`);
      onRecalculated();
    } catch (error) {
      setRecalcMessage(
        error instanceof Error ? error.message : "Network error"
      );
    } finally {
      setIsRecalculating(false);
    }
  };

  if (candidates.length === 0) {
    return (
      <EmptyState
        message="No candidates to score."
        submessage="Scoring will be populated after classification."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-memo-muted">
          {classifiedCount} of {candidates.length} classified
        </p>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            disabled={isRecalculating || classifiedCount === 0}
            onClick={handleRecalculate}
            className="rounded-md border border-memo-border bg-memo-surface px-3 py-1.5 text-xs font-medium text-memo-ink hover:bg-memo-accent-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRecalculating ? "Recalculating…" : "Recalculate Scores"}
          </button>
          {recalcMessage && (
            <p className="text-xs text-memo-muted">{recalcMessage}</p>
          )}
        </div>
      </div>

      <DataTable>
        <DataTableHead>
          <DataTableHeaderCell>Company</DataTableHeaderCell>
          <DataTableHeaderCell>Type</DataTableHeaderCell>
          <DataTableHeaderCell>Tech Similarity</DataTableHeaderCell>
          <DataTableHeaderCell>Market Similarity</DataTableHeaderCell>
          <DataTableHeaderCell>Business Model Similarity</DataTableHeaderCell>
          <DataTableHeaderCell>Stage Similarity</DataTableHeaderCell>
          <DataTableHeaderCell>Funding/M&A Relevance</DataTableHeaderCell>
          <DataTableHeaderCell>Strategic Buyer/Investor Fit</DataTableHeaderCell>
          <DataTableHeaderCell>Valuation Usability</DataTableHeaderCell>
          <DataTableHeaderCell>Geography/Regulatory Similarity</DataTableHeaderCell>
          <DataTableHeaderCell>Direct Score</DataTableHeaderCell>
          <DataTableHeaderCell>Listed Score</DataTableHeaderCell>
          <DataTableHeaderCell>VC Exit Score</DataTableHeaderCell>
          <DataTableHeaderCell>Overall Score</DataTableHeaderCell>
          <DataTableHeaderCell>Last Classified At</DataTableHeaderCell>
        </DataTableHead>
        <DataTableBody>
          {candidates.map((candidate) => {
            const sub = candidate.llmClassification;
            const scores = candidate.scores;
            const type = candidateTypeToBadge(candidate.candidateType);
            return (
              <DataTableRow key={candidate.id}>
                <DataTableCell className="font-medium">
                  {candidate.companyName}
                </DataTableCell>
                <DataTableCell>
                  <Badge label={type.label} variant={type.variant} />
                </DataTableCell>
                <DataTableCell>
                  {scoreValue(sub?.technologySimilarityScore)}
                </DataTableCell>
                <DataTableCell>
                  {scoreValue(sub?.marketSimilarityScore)}
                </DataTableCell>
                <DataTableCell>
                  {scoreValue(sub?.businessModelSimilarityScore)}
                </DataTableCell>
                <DataTableCell>
                  {scoreValue(sub?.stageSimilarityScore)}
                </DataTableCell>
                <DataTableCell>
                  {scoreValue(sub?.fundingMnaRelevanceScore)}
                </DataTableCell>
                <DataTableCell>
                  {scoreValue(sub?.strategicBuyerInvestorFitScore)}
                </DataTableCell>
                <DataTableCell>
                  {scoreValue(sub?.valuationUsabilityScore)}
                </DataTableCell>
                <DataTableCell>
                  {scoreValue(sub?.geographyRegulatorySimilarityScore)}
                </DataTableCell>
                <DataTableCell>
                  {scoreValue(scores?.directCompetitorScore)}
                </DataTableCell>
                <DataTableCell>
                  {scoreValue(scores?.listedComparableScore)}
                </DataTableCell>
                <DataTableCell>
                  {scoreValue(scores?.vcExitComparableScore)}
                </DataTableCell>
                <DataTableCell>
                  {scoreValue(scores?.overallRelevanceScore)}
                </DataTableCell>
                <DataTableCell>
                  {formatDateTime(candidate.lastClassifiedAt)}
                </DataTableCell>
              </DataTableRow>
            );
          })}
        </DataTableBody>
      </DataTable>
    </div>
  );
}
