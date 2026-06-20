import { chatCompletionJson } from "@/lib/openai/client";
import {
  ClassifyParseError,
  ClassifyValidationError,
} from "@/lib/openai/errors";
import {
  parseAnalyzeTargetOutput,
  type AnalyzeTargetLlmOutput,
} from "@/lib/openai/analyzeTargetSchema";
import type { TargetCompany } from "@/types";

const SYSTEM_PROMPT = `You are an expert biotech/pharma analyst helping prepare a competitive landscape target company profile for report reference.

Given a target company name, optional website text, and any existing profile fields, infer missing profile fields.

Rules:
- Only infer fields you can reasonably support from the provided inputs.
- Do not invent clinical trial results, revenue figures, or regulatory approvals without evidence.
- Prefer concise, report-ready phrasing.
- Keep analysisPurpose unchanged — it is set by the user.
- Return confidence: High (strong website + clear signals), Medium (partial info), or Low (mostly guesswork).
- Include caveats array when website text is missing, incomplete, or inference is uncertain.

Return JSON only with keys:
description, coreTechnology, productOrService, indicationOrMarket, customerGroup, businessModel, developmentStage, confidence, caveats (optional string array).`;

function buildUserPrompt(
  target: TargetCompany,
  websiteText: string | null,
  websiteFetchError?: string
): string {
  const existing = `## Existing Target Profile
Company Name: ${target.companyName}
Website: ${target.website ?? "N/A"}
Description: ${target.description ?? "(empty)"}
Core Technology: ${target.coreTechnology ?? "(empty)"}
Product/Service: ${target.productOrService ?? "(empty)"}
Indication/Market: ${target.indicationOrMarket ?? "(empty)"}
Customer Group: ${target.customerGroup ?? "(empty)"}
Business Model: ${target.businessModel ?? "(empty)"}
Development Stage: ${target.developmentStage ?? "(empty)"}
Analysis Purpose: ${target.analysisPurpose}`;

  const websiteSection = websiteText
    ? `## Website Text (truncated)\n${websiteText}`
    : `## Website Text\nNot available.${websiteFetchError ? ` Fetch error: ${websiteFetchError}` : ""}`;

  return `${existing}\n\n${websiteSection}\n\nInfer missing target profile fields. Leave fields blank in JSON if you cannot infer them.`;
}

export async function analyzeTargetWithLlm(
  target: TargetCompany,
  websiteText: string | null,
  websiteFetchError?: string
): Promise<AnalyzeTargetLlmOutput> {
  const raw = await chatCompletionJson(
    SYSTEM_PROMPT,
    buildUserPrompt(target, websiteText, websiteFetchError)
  );

  try {
    return parseAnalyzeTargetOutput(raw);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.startsWith("Invalid JSON")) {
        throw new ClassifyParseError(error.message);
      }
      if (error.message.startsWith("Validation failed")) {
        throw new ClassifyValidationError(error.message);
      }
    }
    throw error;
  }
}

function isEmpty(value: string | undefined): boolean {
  return !value || value.trim() === "";
}

export function mergeTargetProfile(
  existing: TargetCompany,
  inferred: AnalyzeTargetLlmOutput
): TargetCompany {
  const pick = (current: string | undefined, next: string | undefined) =>
    isEmpty(current) && next ? next.trim() : current;

  return {
    ...existing,
    description: pick(existing.description, inferred.description),
    coreTechnology: pick(existing.coreTechnology, inferred.coreTechnology),
    productOrService: pick(existing.productOrService, inferred.productOrService),
    indicationOrMarket: pick(
      existing.indicationOrMarket,
      inferred.indicationOrMarket
    ),
    customerGroup: pick(existing.customerGroup, inferred.customerGroup),
    businessModel: pick(existing.businessModel, inferred.businessModel),
    developmentStage: pick(existing.developmentStage, inferred.developmentStage),
  };
}
