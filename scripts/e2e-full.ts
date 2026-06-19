/**
 * 전체 E2E 흐름 검증
 * 실행: npm run e2e:full
 *
 * - OPENAI_API_KEY 없음: mock 분류 + skipImplications 리포트 + 3종 export
 * - OPENAI_API_KEY 있음: 실제 LLM 분류 1건 + implication LLM 시도
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { classifyCandidates } from "../src/lib/candidates/classifyService";
import { createCandidate } from "../src/lib/candidates/candidateService";
import { updateReviewStatus } from "../src/lib/candidates/reviewService";
import { buildCsvExport } from "../src/lib/export/csv";
import { buildMarkdownExport } from "../src/lib/export/markdown";
import { buildXlsxExport } from "../src/lib/export/xlsx";
import { generateProjectReport } from "../src/lib/report/reportService";
import { createLandscapeProject } from "../src/lib/factories";
import { landscapeStorage } from "../src/lib/storage/landscapeStorage";
import { resetLandscapeStorageForTests } from "../src/lib/storage/landscapeStorage";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function loadEnvLocal(): Record<string, string> {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return {};
  const vars: Record<string, string> = {};
  for (const line of readFileSync(path, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

async function main() {
  const env = loadEnvLocal();
  const hasApiKey = Boolean(env.OPENAI_API_KEY || process.env.OPENAI_API_KEY);

  resetLandscapeStorageForTests();
  const storage = landscapeStorage;
  if ("reset" in storage && typeof storage.reset === "function") {
    await (storage as { reset: () => Promise<void> }).reset();
  }

  const project = createLandscapeProject({
    companyName: "E2E Full Test Bio",
    description: "Full workflow integration test",
    coreTechnology: "mRNA",
    productOrService: "Cancer vaccine",
    indicationOrMarket: "Oncology",
    customerGroup: "Hospitals",
    businessModel: "Biotech",
    developmentStage: "Phase 2",
    analysisPurpose: "Both",
  });
  await storage.create(project);

  const formData = new FormData();
  formData.set("companyName", "Full Flow Rival");
  formData.set("listedStatus", "private");
  formData.set("technology", "mRNA");
  formData.set("product", "Oncology therapeutic");
  formData.set("indicationOrMarket", "Oncology");
  formData.set("businessModel", "Biotech");
  formData.set("developmentStage", "Phase 2");
  formData.set("sourceUrl", "https://example.com/full-flow-rival");
  formData.set("evidenceSnippet", "Competing mRNA oncology program.");

  const candidate = await createCandidate(project.id, formData);

  if (hasApiKey) {
    if (!process.env.OPENAI_API_KEY && env.OPENAI_API_KEY) {
      process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;
    }
    console.log("  Using OPENAI_API_KEY for live classification...");
    const result = await classifyCandidates(project.id, {
      candidateIds: [candidate.id],
    });
    assert(result.results[0]?.success === true, "live classify succeeded");
  } else {
    console.log("  No OPENAI_API_KEY — using mock classification via seed pattern");
    const { applyClassificationToCandidate } = await import(
      "../src/lib/candidates/classifyService"
    );
    const { parseLlmClassifyOutput } = await import(
      "../src/lib/openai/classifySchema"
    );
    const loaded = await storage.getById(project.id);
    const idx = loaded!.candidates.findIndex((c) => c.id === candidate.id);
    const mockJson = JSON.stringify({
      candidateType: "Direct Competitor",
      confidence: 0.82,
      rationale: "Mock classification for full E2E without API key.",
      technologySimilarityScore: 78,
      marketSimilarityScore: 72,
      businessModelSimilarityScore: 64,
      stageSimilarityScore: 58,
      fundingMnaRelevanceScore: 48,
      strategicBuyerInvestorFitScore: 52,
      valuationUsabilityScore: 42,
      geographyRegulatorySimilarityScore: 62,
    });
    const classified = applyClassificationToCandidate(
      loaded!.candidates[idx],
      parseLlmClassifyOutput(mockJson),
      project.target.analysisPurpose
    );
    const next = [...loaded!.candidates];
    next[idx] = classified;
    await storage.update(project.id, { candidates: next });
  }

  await updateReviewStatus(project.id, candidate.id, "Approved");

  const report = await generateProjectReport(project.id, {
    includePendingInAppendix: false,
    skipImplications: !hasApiKey,
  });
  assert(report.markdown.includes("E2E Full Test Bio"), "report generated");

  const finalProject = await storage.getById(project.id);
  const markdown = buildMarkdownExport(finalProject!);
  const csv = buildCsvExport(finalProject!);
  const xlsx = buildXlsxExport(finalProject!);

  assert(markdown.includes("# Competitive Landscape Report"), "markdown export");
  assert(csv.length > 0, "csv export");
  assert(xlsx.length > 0, "xlsx export");

  if ("reset" in storage && typeof storage.reset === "function") {
    await (storage as { reset: () => Promise<void> }).reset();
  }

  console.log("E2E full: OK");
  console.log(
    hasApiKey
      ? "  Mode: live LLM classify + LLM implications attempted"
      : "  Mode: mock classify + fallback implications (no API key)"
  );
  console.log("  Steps: classify → approve → report → markdown/csv/xlsx export");
}

main().catch((error) => {
  console.error("E2E full: FAILED", error);
  process.exit(1);
});
