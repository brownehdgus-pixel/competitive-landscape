/**
 * Step 8 report generation 검증 (OpenAI 호출 없음 — deterministic sections)
 * 실행: npm run verify:step8
 */
import { applyClassificationToCandidate } from "../src/lib/candidates/classifyService";
import { createCandidate } from "../src/lib/candidates/candidateService";
import { updateReviewStatus } from "../src/lib/candidates/reviewService";
import { parseLlmClassifyOutput } from "../src/lib/openai/classifySchema";
import { buildFallbackImplication } from "../src/lib/openai/implications";
import {
  buildReportMarkdown,
  needsTechSpecialImplication,
  needsVcImplication,
} from "../src/lib/report/reportGenerator";
import { generateProjectReport } from "../src/lib/report/reportService";
import { createLandscapeProject } from "../src/lib/factories";
import { landscapeStorage } from "../src/lib/storage/landscapeStorage";
import { resetLandscapeStorageForTests } from "../src/lib/storage/landscapeStorage";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const directLlmJson = JSON.stringify({
  candidateType: "Direct Competitor",
  confidence: 0.85,
  rationale: "Same modality and oncology focus.",
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

const listedLlmJson = JSON.stringify({
  candidateType: "Comparable Listed Company",
  confidence: 0.7,
  rationale: "Public oncology biotech comparable.",
  technologySimilarityScore: 60,
  marketSimilarityScore: 70,
  businessModelSimilarityScore: 75,
  stageSimilarityScore: 80,
  fundingMnaRelevanceScore: 40,
  strategicBuyerInvestorFitScore: 50,
  valuationUsabilityScore: 90,
  geographyRegulatorySimilarityScore: 70,
});

async function seedProject() {
  const project = createLandscapeProject({
    companyName: "Step8 Target Bio",
    description: "mRNA oncology platform",
    coreTechnology: "mRNA",
    productOrService: "Therapeutic vaccine",
    indicationOrMarket: "Oncology",
    analysisPurpose: "Both",
  });
  await landscapeStorage.create(project);
  return project;
}

async function addClassifiedCandidate(
  projectId: string,
  companyName: string,
  llmJson: string,
  reviewStatus: "Approved" | "Pending" = "Approved"
) {
  const formData = new FormData();
  formData.set("companyName", companyName);
  formData.set("listedStatus", "private");
  formData.set("technology", "mRNA");
  formData.set("indicationOrMarket", "Oncology");
  formData.set("businessModel", "Biotech");
  formData.set("developmentStage", "Phase 2");
  formData.set("sourceUrl", `https://example.com/${companyName.toLowerCase().replace(/\s/g, "-")}`);
  formData.set("evidenceSnippet", `${companyName} pipeline data`);

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

function testReportGenerator() {
  const project = createLandscapeProject({
    companyName: "Gen Test Co",
    coreTechnology: "ADC",
    analysisPurpose: "Tech-Special Listing",
  });

  project.candidates.push(
    ...([
      {
        companyName: "Direct Co",
        candidateType: "Direct Competitor" as const,
        reviewStatus: "Approved" as const,
      },
      {
        companyName: "Pending Co",
        candidateType: "Indirect Competitor" as const,
        reviewStatus: "Pending" as const,
      },
    ].map((partial) => {
      const now = new Date().toISOString();
      return {
        id: partial.companyName,
        companyName: partial.companyName,
        listedStatus: "private" as const,
        evidenceSources: [],
        candidateType: partial.candidateType,
        reviewStatus: partial.reviewStatus,
        createdAt: now,
        updatedAt: now,
      };
    }))
  );

  const markdown = buildReportMarkdown({
    project,
    includePendingInAppendix: true,
    techSpecialImplication: "Mock tech implication.",
  });

  assert(markdown.includes("# Competitive Landscape Report"), "report title");
  assert(markdown.includes("## 1. Target Company Overview"), "section 1");
  assert(markdown.includes("## 2. Classification Summary"), "section 2");
  assert(markdown.includes("Direct Co"), "approved in summary");
  assert(!markdown.includes("Pending Co |"), "pending not in summary table");
  assert(markdown.includes("## 3. Direct Competitors"), "section 3");
  assert(markdown.includes("Mock tech implication"), "section 7 content");
  assert(
    markdown.includes("Not applicable") && markdown.includes("## 8."),
    "section 8 N/A for tech-special only"
  );
  assert(markdown.includes("Pending Co"), "pending in appendix when enabled");
  assert(needsTechSpecialImplication("Both"), "both needs tech");
  assert(needsVcImplication("Both"), "both needs vc");
}

async function testReportPersistence() {
  resetLandscapeStorageForTests();
  const storage = landscapeStorage;
  if ("reset" in storage && typeof storage.reset === "function") {
    await (storage as { reset: () => Promise<void> }).reset();
  }

  const project = await seedProject();
  await addClassifiedCandidate(project.id, "Direct Rival", directLlmJson);
  await addClassifiedCandidate(
    project.id,
    "Listed Comp",
    listedLlmJson
  );
  await addClassifiedCandidate(
    project.id,
    "Pending Peer",
    directLlmJson,
    "Pending"
  );

  const loaded = await storage.getById(project.id);
  const approved = loaded!.candidates.filter(
    (c) => c.reviewStatus === "Approved"
  );
  assert(approved.length === 2, `expected 2 approved, got ${approved.length}`);

  const report = await generateProjectReport(project.id, {
    includePendingInAppendix: true,
    skipImplications: true,
  });

  assert(report.markdown.includes("Step8 Target Bio"), "target in report");
  assert(report.markdown.includes("Direct Rival"), "approved direct");
  assert(report.markdown.includes("Listed Comp"), "approved listed");
  assert(report.markdown.includes("Pending Peer"), "pending in appendix");
  assert(
    report.markdown.includes("LLM implication not generated"),
    "fallback implication in report"
  );
  assert(report.includePendingInAppendix === true, "appendix flag saved");

  const saved = await storage.getById(project.id);
  assert(saved?.report?.markdown === report.markdown, "report persisted");
  assert(saved?.lastReportGeneratedAt !== undefined, "timestamp saved");

  const fallback = buildFallbackImplication("vc", saved!.candidates);
  assert(fallback.includes("approved candidate"), "fallback text");

  if ("reset" in storage && typeof storage.reset === "function") {
    await (storage as { reset: () => Promise<void> }).reset();
  }
}

async function main() {
  testReportGenerator();
  await testReportPersistence();
  console.log("Step 8 verify: OK");
}

main().catch((error) => {
  console.error("Step 8 verify: FAILED", error);
  process.exit(1);
});
