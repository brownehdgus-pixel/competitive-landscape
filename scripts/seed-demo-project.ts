/**
 * 데모 프로젝트 시드 — API Key 없이 UI E2E용
 * 실행: npm run seed:demo
 *
 * landscapes.json에 분류·승인된 샘플 프로젝트 1건을 주입합니다.
 * 브라우저에서 http://localhost:3000 → 데모 프로젝트 Workbench 확인.
 */
import { applyClassificationToCandidate } from "../src/lib/candidates/classifyService";
import { createCandidate } from "../src/lib/candidates/candidateService";
import { updateReviewStatus } from "../src/lib/candidates/reviewService";
import { parseLlmClassifyOutput } from "../src/lib/openai/classifySchema";
import { generateProjectReport } from "../src/lib/report/reportService";
import { createLandscapeProject } from "../src/lib/factories";
import { landscapeStorage } from "../src/lib/storage/landscapeStorage";

const DEMO_COMPANY = "Demo Target Bio (E2E)";

const DIRECT_JSON = JSON.stringify({
  candidateType: "Direct Competitor",
  confidence: 0.85,
  rationale: "Same mRNA modality and overlapping oncology market.",
  caveat: "Limited public pipeline detail.",
  technologySimilarityScore: 85,
  marketSimilarityScore: 80,
  businessModelSimilarityScore: 70,
  stageSimilarityScore: 60,
  fundingMnaRelevanceScore: 50,
  strategicBuyerInvestorFitScore: 55,
  valuationUsabilityScore: 45,
  geographyRegulatorySimilarityScore: 65,
});

const LISTED_JSON = JSON.stringify({
  candidateType: "Comparable Listed Company",
  confidence: 0.72,
  rationale: "Public oncology biotech useful as listed comparable.",
  technologySimilarityScore: 60,
  marketSimilarityScore: 70,
  businessModelSimilarityScore: 75,
  stageSimilarityScore: 80,
  fundingMnaRelevanceScore: 40,
  strategicBuyerInvestorFitScore: 50,
  valuationUsabilityScore: 90,
  geographyRegulatorySimilarityScore: 70,
});

async function addClassifiedCandidate(
  projectId: string,
  companyName: string,
  llmJson: string,
  reviewStatus: "Approved" | "Pending" = "Approved"
) {
  const formData = new FormData();
  formData.set("companyName", companyName);
  formData.set("listedStatus", "private");
  formData.set("country", "US");
  formData.set("technology", "mRNA");
  formData.set("indicationOrMarket", "Oncology");
  formData.set("businessModel", "Biotech");
  formData.set("developmentStage", "Phase 2");
  formData.set(
    "sourceUrl",
    `https://example.com/${companyName.toLowerCase().replace(/\s+/g, "-")}`
  );
  formData.set("evidenceSnippet", `${companyName} — demo evidence snippet`);

  const candidate = await createCandidate(projectId, formData);
  const project = await landscapeStorage.getById(projectId);
  if (!project) throw new Error("project not found");

  const classification = parseLlmClassifyOutput(llmJson);
  const index = project.candidates.findIndex((c) => c.id === candidate.id);
  if (index === -1) throw new Error("candidate not found after create");

  const classified = applyClassificationToCandidate(
    project.candidates[index],
    classification,
    project.target.analysisPurpose
  );

  const candidates = [...project.candidates];
  candidates[index] = classified;
  await landscapeStorage.update(projectId, { candidates });

  if (reviewStatus === "Approved") {
    await updateReviewStatus(projectId, candidate.id, "Approved");
  }

  return candidate.id;
}

async function main() {
  const existing = await landscapeStorage.getAll();
  const duplicate = existing.find(
    (p) => p.target.companyName === DEMO_COMPANY
  );
  if (duplicate) {
    await landscapeStorage.delete(duplicate.id);
    console.log(`Removed previous demo project (${duplicate.id})`);
  }

  const project = createLandscapeProject({
    companyName: DEMO_COMPANY,
    description: "데모용 타겟 — mRNA 기반 종양 치료 플랫폼",
    coreTechnology: "mRNA",
    productOrService: "Therapeutic cancer vaccine",
    indicationOrMarket: "Oncology",
    customerGroup: "Hospitals / oncology centers",
    businessModel: "Biotech R&D",
    developmentStage: "Phase 2",
    analysisPurpose: "Both",
  });

  await landscapeStorage.create(project);

  await addClassifiedCandidate(project.id, "Rival mRNA Corp", DIRECT_JSON);
  await addClassifiedCandidate(
    project.id,
    "Listed Oncology Inc",
    LISTED_JSON
  );
  await addClassifiedCandidate(
    project.id,
    "Pending Peer Ltd",
    DIRECT_JSON,
    "Pending"
  );

  await generateProjectReport(project.id, {
    includePendingInAppendix: true,
    skipImplications: true,
  });

  const loaded = await landscapeStorage.getById(project.id);
  const approved = loaded!.candidates.filter(
    (c) => c.reviewStatus === "Approved"
  ).length;

  console.log("Demo seed: OK");
  console.log(`  Project ID: ${project.id}`);
  console.log(`  Company:    ${DEMO_COMPANY}`);
  console.log(`  Candidates: ${loaded!.candidates.length} (${approved} approved)`);
  console.log(`  Report:     ${loaded!.report ? "generated" : "missing"}`);
  console.log("");
  console.log("Next: npm run dev → http://localhost:3000");
  console.log(`      Open workbench: /projects/${project.id}`);
}

main().catch((error) => {
  console.error("Demo seed: FAILED", error);
  process.exit(1);
});
