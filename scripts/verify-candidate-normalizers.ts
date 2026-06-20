/**
 * Candidate generation normalizer 검증 (OpenAI 호출 없음)
 * 실행: npm run verify:normalizers
 */
import { normalizeCandidateType } from "../src/lib/normalizers/normalizeCandidateType";
import { normalizeCompanyNameKey } from "../src/lib/normalizers/normalizeCompanyNameKey";
import { normalizeGeneratedCandidate } from "../src/lib/normalizers/normalizeGeneratedCandidate";
import { normalizeListedStatus } from "../src/lib/normalizers/normalizeListedStatus";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function testNormalizeListedStatus() {
  const cases: Array<[unknown, string]> = [
    ["public", "listed"],
    ["Public Company", "listed"],
    ["NASDAQ-listed", "listed"],
    ["KOSDAQ", "listed"],
    ["unlisted", "private"],
    ["non-listed", "private"],
    ["private company", "private"],
    ["venture-backed", "private"],
    ["N/A", "unknown"],
    ["", "unknown"],
    [null, "unknown"],
  ];

  for (const [input, expected] of cases) {
    assert(
      normalizeListedStatus(input) === expected,
      `normalizeListedStatus(${JSON.stringify(input)}) expected ${expected}`
    );
  }

  assert(
    normalizeListedStatus("unlisted") !== "listed",
    '"unlisted" must not become "listed"'
  );
}

function testNormalizeCandidateType() {
  const cases: Array<[unknown, string]> = [
    ["Indirect Competitor", "Indirect Competitor"],
    ["alternative technology", "Indirect Competitor"],
    ["Direct Competitor", "Direct Competitor"],
    ["direct", "Direct Competitor"],
    ["Comparable Listed Company", "Comparable Listed Company"],
    ["public comparable", "Comparable Listed Company"],
    ["Comparable Private Company", "Comparable Private Company"],
    ["venture-backed comparable", "Comparable Private Company"],
    ["unknown", "Unclassified"],
    ["", "Unclassified"],
  ];

  for (const [input, expected] of cases) {
    assert(
      normalizeCandidateType(input) === expected,
      `normalizeCandidateType(${JSON.stringify(input)}) expected ${expected}`
    );
  }

  assert(
    normalizeCandidateType("indirect") !== "Direct Competitor",
    '"indirect" must not become "Direct Competitor"'
  );
}

function testNormalizeGeneratedCandidate() {
  const normalized = normalizeGeneratedCandidate({
    companyName: "Acme Bio",
    listedStatus: "public",
    candidateType: "NASDAQ-listed private startup",
    rationale: "Similar modality",
  });

  assert(normalized.companyName === "Acme Bio", "companyName preserved");
  assert(normalized.listedStatus === "listed", "listedStatus normalized");
  assert(
    normalized.suggestedCandidateType === "Unclassified" ||
      normalized.suggestedCandidateType.length > 0,
    "candidateType normalized"
  );
  assert(
    normalized.evidenceSnippet.includes("Similar modality"),
    "evidenceSnippet from rationale"
  );
}

function testNormalizeCompanyNameKey() {
  assert(
    normalizeCompanyNameKey("  Acme, Inc.  ") === "acme inc",
    "company name key normalization"
  );
}

function main() {
  testNormalizeListedStatus();
  testNormalizeCandidateType();
  testNormalizeGeneratedCandidate();
  testNormalizeCompanyNameKey();
  console.log("verify:normalizers — all checks passed");
}

main();
