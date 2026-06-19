import {
  parseCandidateForm,
  parseEvidenceForm,
} from "@/lib/candidates/formHelpers";
import {
  createCandidateCompany,
  createEvidenceSource,
} from "@/lib/factories";
import {
  CandidateNotFoundError,
  EvidenceNotFoundError,
  ProjectNotFoundError,
} from "@/lib/storage/errors";
import { landscapeStorage } from "@/lib/storage/landscapeStorage";
import type { CandidateCompany } from "@/types";

async function getProjectOrThrow(projectId: string) {
  const project = await landscapeStorage.getById(projectId);
  if (!project) throw new ProjectNotFoundError(projectId);
  return project;
}

function buildCandidateFromForm(
  fields: ReturnType<typeof parseCandidateForm>,
  existing?: CandidateCompany
): CandidateCompany {
  const evidenceSources = existing?.evidenceSources ?? [];

  const candidate = createCandidateCompany({
    id: existing?.id,
    companyName: fields.companyName,
    listedStatus: fields.listedStatus,
    country: fields.country,
    ticker: fields.ticker,
    exchange: fields.exchange,
    website: fields.website,
    technology: fields.technology,
    product: fields.product,
    indicationOrMarket: fields.indicationOrMarket,
    customerGroup: fields.customerGroup,
    businessModel: fields.businessModel,
    developmentStage: fields.developmentStage,
    latestFundingRound: fields.latestFundingRound,
    keyInvestors: fields.keyInvestors,
    recentEvent: fields.recentEvent,
    memo: fields.memo,
    evidenceSources,
    candidateType: existing?.candidateType ?? "Unclassified",
    reviewStatus: existing?.reviewStatus ?? "Pending",
    llmClassification: existing?.llmClassification,
    scores: existing?.scores,
    userNote: existing?.userNote,
    manuallyOverridden: existing?.manuallyOverridden,
    manualOverrideAt: existing?.manualOverrideAt,
    createdAt: existing?.createdAt,
    lastClassifiedAt: existing?.lastClassifiedAt,
  });

  if (fields.sourceUrl && !existing) {
    candidate.evidenceSources.push(
      createEvidenceSource({
        sourceUrl: fields.sourceUrl,
        sourceTitle: fields.sourceTitle,
        evidenceSnippet: fields.evidenceSnippet ?? fields.memo,
        sourceType: fields.sourceType ?? "manual",
        confidenceLevel: fields.confidenceLevel,
      })
    );
  }

  return candidate;
}

export async function createCandidate(
  projectId: string,
  formData: FormData
): Promise<CandidateCompany> {
  const fields = parseCandidateForm(formData);
  const candidate = buildCandidateFromForm(fields);

  const latest = await getProjectOrThrow(projectId);
  await landscapeStorage.update(projectId, {
    candidates: [...latest.candidates, candidate],
  });

  return candidate;
}

export async function updateCandidate(
  projectId: string,
  candidateId: string,
  formData: FormData
): Promise<CandidateCompany> {
  const project = await getProjectOrThrow(projectId);
  const index = project.candidates.findIndex((c) => c.id === candidateId);
  if (index === -1) throw new CandidateNotFoundError(candidateId);

  const fields = parseCandidateForm(formData);
  const updated = buildCandidateFromForm(fields, project.candidates[index]);
  updated.updatedAt = new Date().toISOString();

  const candidates = [...project.candidates];
  candidates[index] = updated;

  await landscapeStorage.update(projectId, { candidates });
  return updated;
}

export async function deleteCandidate(
  projectId: string,
  candidateId: string
): Promise<void> {
  const project = await getProjectOrThrow(projectId);
  const next = project.candidates.filter((c) => c.id !== candidateId);
  if (next.length === project.candidates.length) {
    throw new CandidateNotFoundError(candidateId);
  }

  await landscapeStorage.update(projectId, { candidates: next });
}

export async function addEvidence(
  projectId: string,
  candidateId: string,
  formData: FormData
): Promise<void> {
  const project = await getProjectOrThrow(projectId);
  const index = project.candidates.findIndex((c) => c.id === candidateId);
  if (index === -1) throw new CandidateNotFoundError(candidateId);

  const fields = parseEvidenceForm(formData);
  const evidence = createEvidenceSource({
    sourceUrl: fields.sourceUrl,
    sourceTitle: fields.sourceTitle,
    evidenceSnippet: fields.evidenceSnippet,
    sourceType: fields.sourceType ?? "manual",
    confidenceLevel: fields.confidenceLevel,
    sourceDate: fields.sourceDate,
  });

  const candidates = [...project.candidates];
  const candidate = { ...candidates[index] };
  candidate.evidenceSources = [...candidate.evidenceSources, evidence];
  candidate.updatedAt = new Date().toISOString();
  candidates[index] = candidate;

  await landscapeStorage.update(projectId, { candidates });
}

export async function deleteEvidence(
  projectId: string,
  candidateId: string,
  evidenceId: string
): Promise<void> {
  const project = await getProjectOrThrow(projectId);
  const index = project.candidates.findIndex((c) => c.id === candidateId);
  if (index === -1) throw new CandidateNotFoundError(candidateId);

  const candidates = [...project.candidates];
  const candidate = { ...candidates[index] };
  const nextEvidence = candidate.evidenceSources.filter(
    (e) => e.id !== evidenceId
  );
  if (nextEvidence.length === candidate.evidenceSources.length) {
    throw new EvidenceNotFoundError(evidenceId);
  }

  candidate.evidenceSources = nextEvidence;
  candidate.updatedAt = new Date().toISOString();
  candidates[index] = candidate;

  await landscapeStorage.update(projectId, { candidates });
}
