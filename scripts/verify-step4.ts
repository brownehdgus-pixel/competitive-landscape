/**
 * Step 4 candidate + evidence CRUD 검증
 * 실행: npm run verify:step4
 */
import {
  addEvidence,
  createCandidate,
  deleteCandidate,
} from "../src/lib/candidates/candidateService";
import { createLandscapeProject } from "../src/lib/factories";
import { landscapeStorage } from "../src/lib/storage/landscapeStorage";
import { resetLandscapeStorageForTests } from "../src/lib/storage/landscapeStorage";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  resetLandscapeStorageForTests();
  const storage = landscapeStorage;
  if ("reset" in storage && typeof storage.reset === "function") {
    await (storage as { reset: () => Promise<void> }).reset();
  }

  const project = createLandscapeProject({
    companyName: "Step4 Test Bio",
    analysisPurpose: "Both",
  });
  await storage.create(project);

  const formData = new FormData();
  formData.set("companyName", "Rival Corp");
  formData.set("listedStatus", "private");
  formData.set("technology", "mRNA");
  formData.set("indicationOrMarket", "Oncology");
  formData.set("businessModel", "Biotech");
  formData.set("developmentStage", "Phase 2");
  formData.set("sourceUrl", "https://example.com/rival");
  formData.set("sourceTitle", "Rival news");
  formData.set("evidenceSnippet", "Competing pipeline");
  formData.set("sourceType", "news");
  formData.set("confidenceLevel", "Medium");

  const candidate = await createCandidate(project.id, formData);

  let loaded = await storage.getById(project.id);
  assert(loaded?.candidates.length === 1, "candidate created");
  assert(candidate.candidateType === "Unclassified", "default type");
  assert(candidate.reviewStatus === "Pending", "default review");
  assert(candidate.evidenceSources.length === 1, "auto evidence on create");

  const evidenceForm = new FormData();
  evidenceForm.set("sourceUrl", "https://example.com/paper");
  evidenceForm.set("evidenceSnippet", "Published study");
  evidenceForm.set("sourceType", "paper");

  await addEvidence(project.id, candidate.id, evidenceForm);

  loaded = await storage.getById(project.id);
  assert(
    loaded?.candidates[0].evidenceSources.length === 2,
    "evidence added"
  );

  await deleteCandidate(project.id, candidate.id);
  loaded = await storage.getById(project.id);
  assert(loaded?.candidates.length === 0, "candidate deleted");

  if ("reset" in storage && typeof storage.reset === "function") {
    await (storage as { reset: () => Promise<void> }).reset();
  }

  console.log("Step 4 verify: OK");
}

main().catch((error) => {
  console.error("Step 4 verify: FAILED", error);
  process.exit(1);
});
