"use client";

import { useState, useTransition } from "react";
import { classifySingleCandidate } from "@/components/projects/RunClassificationButton";
import { CandidateMasterTable } from "@/components/projects/CandidateMasterTable";
import type { CandidateCompany } from "@/types";

type CandidatesTabProps = {
  projectId: string;
  candidates: CandidateCompany[];
  onEdit: (candidate: CandidateCompany) => void;
  onDelete: (candidateId: string) => Promise<void>;
  onClassified: () => void;
};

export function CandidatesTab({
  projectId,
  candidates,
  onEdit,
  onDelete,
  onClassified,
}: CandidatesTabProps) {
  const [isPending, startTransition] = useTransition();
  const [classifyingId, setClassifyingId] = useState<string | null>(null);

  const handleClassify = async (candidateId: string) => {
    setClassifyingId(candidateId);
    try {
      const result = await classifySingleCandidate(projectId, candidateId);
      const item = result.results[0];
      if (!item?.success) {
        window.alert(item?.error ?? result.stopReason ?? "Classification failed");
      } else {
        onClassified();
      }
    } finally {
      setClassifyingId(null);
    }
  };

  return (
    <CandidateMasterTable
      candidates={candidates}
      onEdit={onEdit}
      onClassify={handleClassify}
      classifyingId={classifyingId}
      onDelete={(candidateId, companyName) => {
        const confirmed = window.confirm(
          `Delete candidate "${companyName}"? This cannot be undone.`
        );
        if (!confirmed) return;
        startTransition(() => onDelete(candidateId));
      }}
      isDeleting={isPending}
    />
  );
}
