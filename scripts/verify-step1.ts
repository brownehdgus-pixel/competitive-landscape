/**
 * Step 1 read/write 검증 스크립트
 * 실행: npm run verify:step1
 */
import {
  createCandidateCompany,
  createEvidenceSource,
  createLandscapeProject,
} from "../src/lib/factories";
import { getAllProjects, getProjectById } from "../src/lib/getLandscapes";
import {
  addProject,
  DuplicateProjectIdError,
  resetLandscapesFile,
  updateProject,
} from "../src/lib/saveLandscapes";

async function main() {
  await resetLandscapesFile();

  const project = createLandscapeProject({
    companyName: "테스트바이오",
    description: "Step 1 검증용 프로젝트",
    coreTechnology: "mRNA",
    analysisPurpose: "Both",
  });

  const evidence = createEvidenceSource({
    sourceUrl: "https://example.com/news",
    sourceTitle: "테스트 뉴스",
    evidenceSnippet: "경쟁사 관련 기사",
    sourceType: "news",
    confidenceLevel: "Medium",
  });

  const candidate = createCandidateCompany({
    companyName: "경쟁사 A",
    listedStatus: "private",
    technology: "mRNA 백신",
    indicationOrMarket: "감염병",
    businessModel: "신약개발",
    developmentStage: "임상 2상",
    evidenceSources: [evidence],
  });

  project.candidates.push(candidate);

  await addProject(project);

  const loaded = await getProjectById(project.id);
  if (!loaded) throw new Error("getProjectById failed");
  if (loaded.candidates.length !== 1) {
    throw new Error("candidate count mismatch");
  }
  if (loaded.candidates[0].candidateType !== "Unclassified") {
    throw new Error("default candidateType should be Unclassified");
  }
  if (loaded.candidates[0].reviewStatus !== "Pending") {
    throw new Error("default reviewStatus should be Pending");
  }
  if (loaded.candidates[0].evidenceSources.length !== 1) {
    throw new Error("evidenceSources not saved");
  }

  await updateProject(project.id, (p) => ({
    ...p,
    target: { ...p.target, description: "수정됨" },
  }));

  const updated = await getProjectById(project.id);
  if (updated?.target.description !== "수정됨") {
    throw new Error("updateProject failed");
  }

  let duplicateCaught = false;
  try {
    await addProject(project);
  } catch (error) {
    if (error instanceof DuplicateProjectIdError) duplicateCaught = true;
  }
  if (!duplicateCaught) throw new Error("duplicate ID should be rejected");

  const all = await getAllProjects();
  if (all.length !== 1) throw new Error("getAllProjects count mismatch");

  await resetLandscapesFile();
  console.log("Step 1 verify: OK");
}

main().catch((error) => {
  console.error("Step 1 verify: FAILED", error);
  process.exit(1);
});
