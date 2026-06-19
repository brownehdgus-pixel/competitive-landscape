/**
 * Step 9 export 검증 (OpenAI 호출 없음)
 * 실행: npm run verify:step9
 */
import * as XLSX from "xlsx";
import { buildCsvExport } from "../src/lib/export/csv";
import {
  ALL_CANDIDATE_HEADERS,
  SOURCE_HEADERS,
  XLSX_SHEET_NAMES,
  candidateToExportRow,
} from "../src/lib/export/exportData";
import { buildMarkdownExport, ExportError } from "../src/lib/export/markdown";
import { buildXlsxExport } from "../src/lib/export/xlsx";
import { buildReportMarkdown } from "../src/lib/report/reportGenerator";
import {
  createCandidateCompany,
  createLandscapeProject,
} from "../src/lib/factories";
import type { LandscapeProject } from "../src/types";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function buildSampleProject(): LandscapeProject {
  const project = createLandscapeProject({
    companyName: "Export 테스트바이오",
    description: "Step 9 검증",
    coreTechnology: "mRNA",
    analysisPurpose: "Both",
  });

  project.candidates.push(
    createCandidateCompany({
      companyName: "Direct 한글 Corp",
      country: "KR",
      listedStatus: "private",
      technology: "mRNA",
      candidateType: "Direct Competitor",
      reviewStatus: "Approved",
      llmClassification: {
        candidateType: "Direct Competitor",
        confidence: 0.8,
        rationale: "기술 유사",
        technologySimilarityScore: 80,
        marketSimilarityScore: 70,
        businessModelSimilarityScore: 60,
        stageSimilarityScore: 50,
        fundingMnaRelevanceScore: 40,
        strategicBuyerInvestorFitScore: 45,
        valuationUsabilityScore: 35,
        geographyRegulatorySimilarityScore: 55,
      },
      scores: {
        directCompetitorScore: 68,
        listedComparableScore: 55,
        vcExitComparableScore: 52,
        overallRelevanceScore: 60,
      },
      evidenceSources: [
        {
          id: "ev-1",
          sourceTitle: "뉴스 기사",
          sourceUrl: "https://example.com/news",
          evidenceSnippet: "한글 evidence snippet",
          sourceType: "news",
          confidenceLevel: "Medium",
          checkedAt: "2026-06-19T00:00:00.000Z",
        },
      ],
    })
  );

  project.report = {
    markdown: buildReportMarkdown({
      project,
      includePendingInAppendix: false,
      techSpecialImplication: "Mock tech implication.",
      vcImplication: "Mock VC implication.",
    }),
    generatedAt: "2026-06-19T00:00:00.000Z",
    includePendingInAppendix: false,
  };

  return project;
}

function testCandidateRowColumns() {
  const project = buildSampleProject();
  const row = candidateToExportRow(project.candidates[0]);
  assert(row.companyName === "Direct 한글 Corp", "company name");
  assert(row.technologySimilarityScore === 80, "sub-score");
  assert(row.directCompetitorScore === 68, "final score");
  assert(ALL_CANDIDATE_HEADERS.length === 30, "30 candidate columns");
}

function testMarkdownExport() {
  const project = buildSampleProject();
  const markdown = buildMarkdownExport(project);
  assert(markdown.includes("# Competitive Landscape Report"), "report markdown");

  const noReport = buildSampleProject();
  noReport.report = undefined;
  let threw = false;
  try {
    buildMarkdownExport(noReport);
  } catch (error) {
    threw = error instanceof ExportError;
  }
  assert(threw, "markdown requires report");
}

function testCsvBomAndKorean() {
  const project = buildSampleProject();
  const buffer = buildCsvExport(project);
  const text = buffer.toString("utf-8");

  assert(text.charCodeAt(0) === 0xfeff, "UTF-8 BOM");
  assert(text.includes("Direct 한글 Corp"), "korean company in csv");
  assert(text.includes("technologySimilarityScore"), "csv header");
  assert(text.includes("80"), "score in csv");
}

function testXlsxSheets() {
  const project = buildSampleProject();
  const buffer = buildXlsxExport(project);
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const names = workbook.SheetNames;

  assert(names.length === 8, "8 sheets");
  for (const expected of XLSX_SHEET_NAMES) {
    assert(names.includes(expected), `sheet ${expected}`);
  }

  const allCandidates = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    workbook.Sheets["All Candidates"],
    { defval: "" }
  );
  assert(allCandidates.length === 1, "one candidate row");
  assert(
    allCandidates[0].companyName === "Direct 한글 Corp",
    "korean in xlsx"
  );
  assert(allCandidates[0].technologySimilarityScore === 80, "sub-score in xlsx");

  const sources = XLSX.utils.sheet_to_json<Record<string, string>>(
    workbook.Sheets.Sources,
    { defval: "" }
  );
  assert(sources.length === 1, "one source row");
  assert(
    sources[0].candidateCompanyName === "Direct 한글 Corp",
    "source candidate name"
  );
  assert(SOURCE_HEADERS.length === 8, "8 source columns");

  const reportRows = XLSX.utils.sheet_to_json<Record<string, string>>(
    workbook.Sheets.Report,
    { defval: "" }
  );
  assert(reportRows.length === 1, "report row");
  assert(
    reportRows[0].content.includes("Competitive Landscape Report"),
    "report content in xlsx"
  );
}

function main() {
  testCandidateRowColumns();
  testMarkdownExport();
  testCsvBomAndKorean();
  testXlsxSheets();
  console.log("Step 9 verify: OK");
}

main();
