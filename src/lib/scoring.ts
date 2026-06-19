import type {
  AnalysisPurpose,
  CandidateClassification,
  CandidateScores,
} from "@/types";

function clampScore(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function computeCandidateScores(
  classification: CandidateClassification,
  analysisPurpose: AnalysisPurpose
): CandidateScores {
  const t = classification.technologySimilarityScore;
  const m = classification.marketSimilarityScore;
  const bm = classification.businessModelSimilarityScore;
  const s = classification.stageSimilarityScore;
  const f = classification.fundingMnaRelevanceScore;
  const sb = classification.strategicBuyerInvestorFitScore;
  const v = classification.valuationUsabilityScore;
  const g = classification.geographyRegulatorySimilarityScore;

  const directCompetitorScore = clampScore(
    t * 0.35 + m * 0.35 + bm * 0.15 + s * 0.15
  );

  const listedComparableScore = clampScore(
    t * 0.15 + m * 0.1 + bm * 0.3 + s * 0.25 + v * 0.2
  );

  const vcExitComparableScore = clampScore(
    t * 0.2 +
      m * 0.1 +
      bm * 0.1 +
      s * 0.15 +
      f * 0.2 +
      sb * 0.15 +
      v * 0.05 +
      g * 0.05
  );

  let overallRelevanceScore: number;
  switch (analysisPurpose) {
    case "Tech-Special Listing":
      overallRelevanceScore = clampScore(
        listedComparableScore * 0.6 + directCompetitorScore * 0.4
      );
      break;
    case "VC Investment Review":
      overallRelevanceScore = clampScore(
        vcExitComparableScore * 0.6 + directCompetitorScore * 0.4
      );
      break;
    case "Both":
      overallRelevanceScore = clampScore(
        directCompetitorScore * 0.35 +
          listedComparableScore * 0.35 +
          vcExitComparableScore * 0.3
      );
      break;
  }

  return {
    directCompetitorScore,
    listedComparableScore,
    vcExitComparableScore,
    overallRelevanceScore,
  };
}
