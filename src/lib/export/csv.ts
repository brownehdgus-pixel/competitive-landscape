import {
  ALL_CANDIDATE_HEADERS,
  candidateToExportRow,
} from "@/lib/export/exportData";
import type { LandscapeProject } from "@/types";

const UTF8_BOM = "\uFEFF";

function csvEscape(value: string | number | boolean): string {
  const text = String(value);
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function rowToCsvLine(
  row: Record<string, string | number | boolean>
): string {
  return ALL_CANDIDATE_HEADERS.map((header) =>
    csvEscape(row[header] ?? "")
  ).join(",");
}

export function buildCsvExport(project: LandscapeProject): Buffer {
  const headerLine = ALL_CANDIDATE_HEADERS.join(",");
  const dataLines = project.candidates.map((candidate) =>
    rowToCsvLine(candidateToExportRow(candidate))
  );
  const content = [headerLine, ...dataLines].join("\n");
  return Buffer.from(`${UTF8_BOM}${content}`, "utf-8");
}
