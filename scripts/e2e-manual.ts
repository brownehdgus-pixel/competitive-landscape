/**
 * 수동 E2E 흐름 검증 (API Key 불필요)
 * 실행: npm run e2e:manual
 *
 * 프로젝트 생성 → 후보 추가 → mock 분류 → Approve 까지 서비스 레이어로 검증
 */
import { applyClassificationToCandidate } from "../src/lib/candidates/classifyService";
import { createCandidate } from "../src/lib/candidates/candidateService";
import { updateReviewStatus } from "../src/lib/candidates/reviewService";
import { parseLlmClassifyOutput } from "../src/lib/openai/classifySchema";
import { buildCsvExport } from "../src/lib/export/csv";
import { buildXlsxExport } from "../src/lib/export/xlsx";
import { createLandscapeProject } from "../src/lib/factories";
import { landscapeStorage } from "../src/lib/storage/landscapeStorage";
import { resetLandscapeStorageForTests } from "../src/lib/storage/landscapeStorage";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const LLM_JSON = JSON.stringify({
  candidateType: "Direct Competitor",
  confidence: 0.8,
  rationale: "E2E manual test rationale.",
  technologySimilarityScore: 75,
  marketSimilarityScore: 70,
  businessModelSimilarityScore: 65,
  stageSimilarityScore: 55,
  fundingMnaRelevanceScore: 45,
  strategicBuyerInvestorFitScore: 50,
  valuationUsabilityScore: 40,
  geographyRegulatorySimilarityScore: 60,
});

async function main() {
  resetLandscapeStorageForTests();
  const storage = landscapeStorage;
  if ("reset" in storage && typeof storage.reset === "function") {
    await (storage as { reset: () => Promise<void> }).reset();
  }

  const project = createLandscapeProject({
    companyName: "E2E Manual Test Co",
    coreTechnology: "ADC",
    indicationOrMarket: "Oncology",
    analysisPurpose: "Both",
  });
  await storage.create(project);
  assert((await storage.getById(project.id)) !== null, "project created");

  const formData = new FormData();
  formData.set("companyName", "Manual Rival");
  formData.set("listedStatus", "private");
  formData.set("technology", "ADC");
  formData.set("indicationOrMarket", "Oncology");
  formData.set("businessModel", "Biotech");
  formData.set("developmentStage", "Phase 1");
  formData.set("sourceUrl", "https://example.com/manual-rival");

  const candidate = await createCandidate(project.id, formData);
  assert(candidate.candidateType === "Unclassified", "default unclassified");
  assert(candidate.reviewStatus === "Pending", "default pending");

  const loaded = await storage.getById(project.id);
  const index = loaded!.candidates.findIndex((c) => c.id === candidate.id);
  const classified = applyClassificationToCandidate(
    loaded!.candidates[index],
    parseLlmClassifyOutput(LLM_JSON),
    project.target.analysisPurpose
  );
  const candidates = [...loaded!.candidates];
  candidates[index] = classified;
  await storage.update(project.id, { candidates });

  const approved = await updateReviewStatus(
    project.id,
    candidate.id,
    "Approved"
  );
  assert(approved.reviewStatus === "Approved", "approved");
  assert(approved.scores !== undefined, "scores computed");

  const finalProject = await storage.getById(project.id);
  const csv = buildCsvExport(finalProject!);
  const xlsx = buildXlsxExport(finalProject!);
  assert(csv.length > 0, "csv export");
  assert(xlsx.length > 0, "xlsx export");
  assert(
    csv.toString("utf-8").charCodeAt(0) === 0xfeff,
    "csv utf-8 bom"
  );

  if ("reset" in storage && typeof storage.reset === "function") {
    await (storage as { reset: () => Promise<void> }).reset();
  }

  console.log("E2E manual: OK");
  console.log("  Steps: project → candidate → classify(mock) → approve → export(csv/xlsx)");
}

main().catch((error) => {
  console.error("E2E manual: FAILED", error);
  process.exit(1);
});
