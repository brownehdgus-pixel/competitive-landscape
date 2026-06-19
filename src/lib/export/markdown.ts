import type { LandscapeProject } from "@/types";

export class ExportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExportError";
  }
}

export function buildMarkdownExport(project: LandscapeProject): string {
  const markdown = project.report?.markdown;
  if (!markdown) {
    throw new ExportError(
      "No report generated. Generate a report before exporting Markdown."
    );
  }
  return markdown;
}
