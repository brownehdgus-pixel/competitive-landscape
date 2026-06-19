import { generateId } from "@/lib/id";
import type {
  CandidateCompany,
  EvidenceSource,
  LandscapeProject,
  TargetCompany,
} from "@/types";

export function createEvidenceSource(
  partial?: Partial<EvidenceSource>
): EvidenceSource {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    checkedAt: now,
    ...partial,
  };
}

export function createCandidateCompany(
  partial: Pick<CandidateCompany, "companyName"> &
    Partial<Omit<CandidateCompany, "companyName">>
): CandidateCompany {
  const now = new Date().toISOString();
  const { id, createdAt, ...rest } = partial;
  return {
    listedStatus: "unknown",
    evidenceSources: [],
    candidateType: "Unclassified",
    reviewStatus: "Pending",
    ...rest,
    id: id ?? generateId(),
    createdAt: createdAt ?? now,
    updatedAt: rest.updatedAt ?? now,
  };
}

export function createLandscapeProject(
  target: TargetCompany,
  partial?: Partial<Omit<LandscapeProject, "id" | "target" | "candidates">>
): LandscapeProject {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    target,
    candidates: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}
