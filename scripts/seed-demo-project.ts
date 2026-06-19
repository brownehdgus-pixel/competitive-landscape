/**
 * 데모 프로젝트 시드 — 후보만 추가 (Unclassified)
 * 실행: npm run seed
 * 다음: npm run classify:seed
 */
import { createCandidate } from "../src/lib/candidates/candidateService";
import { createLandscapeProject } from "../src/lib/factories";
import { landscapeStorage } from "../src/lib/storage/landscapeStorage";
import { DEMO_CANDIDATES, DEMO_COMPANY } from "./demo-constants";

async function addRawCandidate(projectId: string, companyName: string) {
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

  return createCandidate(projectId, formData);
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

  for (const item of DEMO_CANDIDATES) {
    await addRawCandidate(project.id, item.companyName);
  }

  const loaded = await landscapeStorage.getById(project.id);

  console.log("Seed: OK");
  console.log(`  Project ID: ${project.id}`);
  console.log(`  Company:    ${DEMO_COMPANY}`);
  console.log(`  Candidates: ${loaded!.candidates.length} (all Unclassified)`);
  console.log("");
  console.log("Next: npm run classify:seed");
  console.log(`      npm run dev → /projects/${project.id}`);
}

main().catch((error) => {
  console.error("Seed: FAILED", error);
  process.exit(1);
});
