import * as XLSX from "xlsx";
import {
  ALL_CANDIDATE_HEADERS,
  SOURCE_HEADERS,
  XLSX_SHEET_NAMES,
  candidateToExportRow,
  candidatesByType,
  projectOverviewRows,
  sourcesToExportRows,
} from "@/lib/export/exportData";
import type { LandscapeProject } from "@/types";

function rowsToSheet<T extends Record<string, string | number | boolean>>(
  rows: T[],
  headers: readonly string[]
): XLSX.WorkSheet {
  const data = rows.map((row) =>
    headers.map((header) => row[header as keyof T] ?? "")
  );
  return XLSX.utils.aoa_to_sheet([headers as string[], ...data]);
}

function keyValueSheet(rows: Array<{ field: string; value: string }>): XLSX.WorkSheet {
  return XLSX.utils.aoa_to_sheet([
    ["field", "value"],
    ...rows.map((row) => [row.field, row.value]),
  ]);
}

function candidateSheet(candidates: LandscapeProject["candidates"]): XLSX.WorkSheet {
  const rows = candidates.map((c) => candidateToExportRow(c));
  return rowsToSheet(rows, ALL_CANDIDATE_HEADERS);
}

export function buildXlsxExport(project: LandscapeProject): Buffer {
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    keyValueSheet(projectOverviewRows(project)),
    XLSX_SHEET_NAMES[0]
  );

  XLSX.utils.book_append_sheet(
    workbook,
    candidateSheet(project.candidates),
    XLSX_SHEET_NAMES[1]
  );

  XLSX.utils.book_append_sheet(
    workbook,
    candidateSheet(candidatesByType(project.candidates, "Direct Competitor")),
    XLSX_SHEET_NAMES[2]
  );

  XLSX.utils.book_append_sheet(
    workbook,
    candidateSheet(
      candidatesByType(project.candidates, "Indirect Competitor")
    ),
    XLSX_SHEET_NAMES[3]
  );

  XLSX.utils.book_append_sheet(
    workbook,
    candidateSheet(
      candidatesByType(project.candidates, "Comparable Listed Company")
    ),
    XLSX_SHEET_NAMES[4]
  );

  XLSX.utils.book_append_sheet(
    workbook,
    candidateSheet(
      candidatesByType(project.candidates, "Comparable Private Company")
    ),
    XLSX_SHEET_NAMES[5]
  );

  const sourceRows = sourcesToExportRows(project.candidates);
  XLSX.utils.book_append_sheet(
    workbook,
    rowsToSheet(sourceRows, SOURCE_HEADERS),
    XLSX_SHEET_NAMES[6]
  );

  const reportMarkdown = project.report?.markdown ?? "";
  const reportSheet = XLSX.utils.aoa_to_sheet([
    ["section", "content"],
    ["Full Report", reportMarkdown],
  ]);
  XLSX.utils.book_append_sheet(workbook, reportSheet, XLSX_SHEET_NAMES[7]);

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
