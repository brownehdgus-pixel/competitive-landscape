/**
 * Step 5–6 classify schema + scoring 검증 (OpenAI 호출 없음)
 * 실행: npm run verify:step5
 */
import {
  applyClassificationToCandidate,
  recalculateScores,
} from "../src/lib/candidates/classifyService";
import { createCandidate } from "../src/lib/candidates/candidateService";
import { parseLlmClassifyOutput } from "../src/lib/openai/classifySchema";
import { computeCandidateScores } from "../src/lib/scoring";
import { createLandscapeProject } from "../src/lib/factories";
import { landscapeStorage } from "../src/lib/storage/landscapeStorage";
import { resetLandscapeStorageForTests } from "../src/lib/storage/landscapeStorage";
import type { CandidateClassification } from "../src/types";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const validLlmJson = JSON.stringify({
  candidateType: "Direct Competitor",
  confidence: 0.78,
  rationale: "Strong technology and market overlap.",
  caveat: "Limited public data on pipeline stage.",
  technologySimilarityScore: 80,
  marketSimilarityScore: 75,
  businessModelSimilarityScore: 60,
  stageSimilarityScore: 50,
  fundingMnaRelevanceScore: 45,
  strategicBuyerInvestorFitScore: 55,
  valuationUsabilityScore: 40,
  geographyRegulatorySimilarityScore: 70,
});

function testSchemaValidation() {
  const parsed = parseLlmClassifyOutput(validLlmJson);
  assert(parsed.candidateType === "Direct Competitor", "valid type parsed");
  assert(parsed.technologySimilarityScore === 80, "valid sub-score parsed");

  let threw = false;
  try {
    parseLlmClassifyOutput(
      JSON.stringify({
        candidateType: "Unclassified",
        confidence: 0.5,
        rationale: "x",
        technologySimilarityScore: 50,
        marketSimilarityScore: 50,
        businessModelSimilarityScore: 50,
        stageSimilarityScore: 50,
        fundingMnaRelevanceScore: 50,
        strategicBuyerInvestorFitScore: 50,
        valuationUsabilityScore: 50,
        geographyRegulatorySimilarityScore: 50,
      })
    );
  } catch {
    threw = true;
  }
  assert(threw, "Unclassified rejected by schema");

  threw = false;
  try {
    parseLlmClassifyOutput(
      JSON.stringify({
        candidateType: "Direct Competitor",
        confidence: 0.5,
        rationale: "x",
        technologySimilarityScore: 101,
        marketSimilarityScore: 50,
        businessModelSimilarityScore: 50,
        stageSimilarityScore: 50,
        fundingMnaRelevanceScore: 50,
        strategicBuyerInvestorFitScore: 50,
        valuationUsabilityScore: 50,
        geographyRegulatorySimilarityScore: 50,
      })
    );
  } catch {
    threw = true;
  }
  assert(threw, "out-of-range sub-score rejected");
}

function testScoringWeights() {
  const classification: CandidateClassification = {
    candidateType: "Direct Competitor",
    confidence: 0.9,
    rationale: "test",
    technologySimilarityScore: 80,
    marketSimilarityScore: 60,
    businessModelSimilarityScore: 40,
    stageSimilarityScore: 20,
    fundingMnaRelevanceScore: 10,
    strategicBuyerInvestorFitScore: 30,
    valuationUsabilityScore: 50,
    geographyRegulatorySimilarityScore: 70,
  };

  const direct = computeCandidateScores(classification, "Tech-Special Listing");
  assert(direct.directCompetitorScore === 58, "direct weighted score");
  assert(direct.listedComparableScore === 45, "listed weighted score");
  assert(direct.vcExitComparableScore === 42, "vc exit weighted score");
  assert(direct.overallRelevanceScore === 50, "tech-special overall");

  const vc = computeCandidateScores(classification, "VC Investment Review");
  assert(vc.overallRelevanceScore === 48, "vc overall");

  const both = computeCandidateScores(classification, "Both");
  assert(both.overallRelevanceScore === 49, "both overall");
}

async function testApplyAndRecalculate() {
  resetLandscapeStorageForTests();
  const storage = landscapeStorage;
  if ("reset" in storage && typeof storage.reset === "function") {
    await (storage as { reset: () => Promise<void> }).reset();
  }

  const project = createLandscapeProject({
    companyName: "Step5 Target",
    analysisPurpose: "Both",
  });
  await storage.create(project);

  const formData = new FormData();
  formData.set("companyName", "Rival Inc");
  formData.set("listedStatus", "private");
  formData.set("technology", "mRNA");
  formData.set("indicationOrMarket", "Oncology");
  formData.set("businessModel", "Biotech");
  formData.set("developmentStage", "Phase 2");
  formData.set("sourceUrl", "https://example.com/rival");

  const candidate = await createCandidate(project.id, formData);
  const classification = parseLlmClassifyOutput(validLlmJson);

  const updated = applyClassificationToCandidate(
    candidate,
    classification,
    project.target.analysisPurpose
  );

  assert(updated.candidateType === "Direct Competitor", "type synced");
  assert(updated.llmClassification !== undefined, "classification stored");
  assert(updated.scores !== undefined, "scores computed");
  assert(updated.lastClassifiedAt !== undefined, "lastClassifiedAt set");

  const loaded = await storage.getById(project.id);
  assert(loaded !== null, "project exists");
  loaded!.candidates[0] = updated;
  await storage.update(project.id, { candidates: loaded!.candidates });

  const { updated: count } = await recalculateScores(project.id);
  assert(count === 1, "recalculate updates classified candidate");

  if ("reset" in storage && typeof storage.reset === "function") {
    await (storage as { reset: () => Promise<void> }).reset();
  }
}

async function main() {
  testSchemaValidation();
  testScoringWeights();
  await testApplyAndRecalculate();
  console.log("Step 5 verify: OK");
}

main().catch((error) => {
  console.error("Step 5 verify: FAILED", error);
  process.exit(1);
});
