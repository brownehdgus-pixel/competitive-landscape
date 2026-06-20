import {
  analyzeTargetWithLlm,
  mergeTargetProfile,
} from "@/lib/openai/analyzeTarget";
import {
  ClassifyParseError,
  ClassifyValidationError,
  OpenAIClientError,
  OpenAIRateLimitError,
} from "@/lib/openai/errors";
import { ProjectNotFoundError } from "@/lib/storage/errors";
import { landscapeStorage } from "@/lib/storage/landscapeStorage";
import { fetchWebsiteText } from "@/lib/website/fetchWebsiteText";
import type { ConfidenceLevel, TargetCompany } from "@/types";

export type AnalyzeTargetResult = {
  target: TargetCompany;
  caveats: string[];
  websiteFetched: boolean;
  confidence: ConfidenceLevel;
};

async function getProjectOrThrow(projectId: string) {
  const project = await landscapeStorage.getById(projectId);
  if (!project) throw new ProjectNotFoundError(projectId);
  return project;
}

export async function analyzeTargetProject(
  projectId: string,
  options?: { website?: string }
): Promise<AnalyzeTargetResult> {
  const project = await getProjectOrThrow(projectId);
  const caveats: string[] = [];

  let target = project.target;
  const websiteOverride = options?.website?.trim();
  if (websiteOverride && websiteOverride !== target.website) {
    target = { ...target, website: websiteOverride };
  }

  let websiteText: string | null = null;
  let websiteFetched = false;

  if (target.website) {
    const fetchResult = await fetchWebsiteText(target.website);
    if (fetchResult.text) {
      websiteText = fetchResult.text;
      websiteFetched = true;
    } else if (fetchResult.error) {
      caveats.push(`Website fetch failed: ${fetchResult.error}`);
    }
  } else {
    caveats.push(
      "No website URL on target profile. Analysis uses existing fields only."
    );
  }

  let llmOutput;
  try {
    llmOutput = await analyzeTargetWithLlm(
      target,
      websiteText,
      caveats.find((c) => c.startsWith("Website fetch failed"))
    );
  } catch (error) {
    if (error instanceof OpenAIRateLimitError) {
      throw error;
    }
    if (error instanceof OpenAIClientError) {
      throw error;
    }
    if (
      error instanceof ClassifyParseError ||
      error instanceof ClassifyValidationError
    ) {
      throw new OpenAIClientError(error.message);
    }
    throw error;
  }

  if (llmOutput.caveats?.length) {
    caveats.push(...llmOutput.caveats);
  }

  if (llmOutput.confidence === "Low") {
    caveats.push(
      "Target analysis confidence is Low. Please verify all inferred fields."
    );
  }

  const updatedTarget = mergeTargetProfile(target, llmOutput);

  await landscapeStorage.update(projectId, { target: updatedTarget });

  return {
    target: updatedTarget,
    caveats,
    websiteFetched,
    confidence: llmOutput.confidence,
  };
}
