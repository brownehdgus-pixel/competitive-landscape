import {
  buildFallbackImplication,
  generateTechSpecialImplication,
  generateVcImplication,
} from "@/lib/openai/implications";
import { OpenAIClientError } from "@/lib/openai/errors";
import {
  buildReportMarkdown,
  needsTechSpecialImplication,
  needsVcImplication,
} from "@/lib/report/reportGenerator";
import { ProjectNotFoundError } from "@/lib/storage/errors";
import { landscapeStorage } from "@/lib/storage/landscapeStorage";
import type { LandscapeReport } from "@/types";

export type GenerateReportOptions = {
  includePendingInAppendix?: boolean;
  /** verify 스크립트 등 — OpenAI implication 호출 생략 */
  skipImplications?: boolean;
};

export async function generateProjectReport(
  projectId: string,
  options: GenerateReportOptions = {}
): Promise<LandscapeReport> {
  const project = await landscapeStorage.getById(projectId);
  if (!project) throw new ProjectNotFoundError(projectId);

  const includePendingInAppendix = options.includePendingInAppendix ?? false;
  const purpose = project.target.analysisPurpose;

  let techSpecialImplication: string | undefined;
  let vcImplication: string | undefined;

  if (needsTechSpecialImplication(purpose)) {
    if (options.skipImplications) {
      techSpecialImplication = buildFallbackImplication(
        "tech-special",
        project.candidates
      );
    } else {
      try {
        techSpecialImplication = await generateTechSpecialImplication(
          project.target,
          project.candidates
        );
      } catch (error) {
        if (error instanceof OpenAIClientError) {
          techSpecialImplication = buildFallbackImplication(
            "tech-special",
            project.candidates
          );
        } else {
          throw error;
        }
      }
    }
  }

  if (needsVcImplication(purpose)) {
    if (options.skipImplications) {
      vcImplication = buildFallbackImplication("vc", project.candidates);
    } else {
      try {
        vcImplication = await generateVcImplication(
          project.target,
          project.candidates
        );
      } catch (error) {
        if (error instanceof OpenAIClientError) {
          vcImplication = buildFallbackImplication("vc", project.candidates);
        } else {
          throw error;
        }
      }
    }
  }

  const freshProject = await landscapeStorage.getById(projectId);
  if (!freshProject) throw new ProjectNotFoundError(projectId);

  const markdown = buildReportMarkdown({
    project: freshProject,
    includePendingInAppendix,
    techSpecialImplication,
    vcImplication,
  });

  const now = new Date().toISOString();
  const report: LandscapeReport = {
    markdown,
    generatedAt: now,
    includePendingInAppendix,
  };

  await landscapeStorage.update(projectId, {
    report,
    lastReportGeneratedAt: now,
  });

  return report;
}
