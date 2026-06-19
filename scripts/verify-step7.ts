/**
 * Step 7 review 검수·재분류·메모 검증 (OpenAI 호출 없음)
 * 실행: npm run verify:step7
 */
import { applyClassificationToCandidate } from "../src/lib/candidates/classifyService";
import { createCandidate } from "../src/lib/candidates/candidateService";
import {
  reclassifyCandidate,
  resetToLlmClassification,
  updateReviewStatus,
  updateUserNote,
} from "../src/lib/candidates/reviewService";
import { parseLlmClassifyOutput } from "../src/lib/openai/classifySchema";
import { createLandscapeProject } from "../src/lib/factories";
import { landscapeStorage } from "../src/lib/storage/landscapeStorage";
import { resetLandscapeStorageForTests } from "../src/lib/storage/landscapeStorage";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const validLlmJson = JSON.stringify({
  candidateType: "Indirect Competitor",
  confidence: 0.72,
  rationale: "Adjacent market overlap.",
  technologySimilarityScore: 70,
  marketSimilarityScore: 65,
  businessModelSimilarityScore: 55,
  stageSimilarityScore: 45,
  fundingMnaRelevanceScore: 40,
  strategicBuyerInvestorFitScore: 50,
  valuationUsabilityScore: 35,
  geographyRegulatorySimilarityScore: 60,
});

async function main() {
  resetLandscapeStorageForTests();
  const storage = landscapeStorage;
  if ("reset" in storage && typeof storage.reset === "function") {
    await (storage as { reset: () => Promise<void> }).reset();
  }

  const project = createLandscapeProject({
    companyName: "Step7 Target",
    analysisPurpose: "Both",
  });
  await storage.create(project);

  const formData = new FormData();
  formData.set("companyName", "Review Corp");
  formData.set("listedStatus", "private");
  formData.set("technology", "ADC");
  formData.set("indicationOrMarket", "Oncology");
  formData.set("businessModel", "Biotech");
  formData.set("developmentStage", "Phase 1");
  formData.set("sourceUrl", "https://example.com/review");

  const candidate = await createCandidate(project.id, formData);
  assert(candidate.reviewStatus === "Pending", "default review pending");

  const classification = parseLlmClassifyOutput(validLlmJson);
  const classified = applyClassificationToCandidate(
    candidate,
    classification,
    project.target.analysisPurpose
  );

  let loaded = await storage.getById(project.id);
  loaded!.candidates[0] = classified;
  await storage.update(project.id, { candidates: loaded!.candidates });

  const approved = await updateReviewStatus(
    project.id,
    candidate.id,
    "Approved"
  );
  assert(approved.reviewStatus === "Approved", "approve works");
  assert(
    approved.candidateType === "Indirect Competitor",
    "review does not change type"
  );

  const reclassified = await reclassifyCandidate(
    project.id,
    candidate.id,
    "Direct Competitor"
  );
  assert(reclassified.candidateType === "Direct Competitor", "reclassify type");
  assert(reclassified.manuallyOverridden === true, "manual override flag");
  assert(reclassified.manualOverrideAt !== undefined, "override timestamp");
  assert(
    reclassified.llmClassification?.candidateType === "Indirect Competitor",
    "LLM classification preserved"
  );
  assert(reclassified.reviewStatus === "Approved", "review status preserved");

  const noted = await updateUserNote(
    project.id,
    candidate.id,
    "Strong pipeline overlap per analyst review."
  );
  assert(
    noted.userNote?.includes("analyst review") === true,
    "user note saved"
  );

  const reset = await resetToLlmClassification(project.id, candidate.id);
  assert(reset.candidateType === "Indirect Competitor", "reset to LLM type");
  assert(reset.manuallyOverridden === false, "override cleared");

  const rejected = await updateReviewStatus(
    project.id,
    candidate.id,
    "Rejected"
  );
  assert(rejected.reviewStatus === "Rejected", "reject works");

  if ("reset" in storage && typeof storage.reset === "function") {
    await (storage as { reset: () => Promise<void> }).reset();
  }

  console.log("Step 7 verify: OK");
}

main().catch((error) => {
  console.error("Step 7 verify: FAILED", error);
  process.exit(1);
});
