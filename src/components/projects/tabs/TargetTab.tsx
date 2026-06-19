import { Badge } from "@/components/ui/Badge";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/ui/DataTable";
import { formatAnalysisPurpose } from "@/lib/projects/formatters";
import type { TargetCompany } from "@/types";

type TargetTabProps = {
  target: TargetCompany;
};

const ROWS: { key: keyof TargetCompany; label: string }[] = [
  { key: "companyName", label: "Company Name" },
  { key: "description", label: "Description" },
  { key: "coreTechnology", label: "Core Technology" },
  { key: "productOrService", label: "Product / Service" },
  { key: "indicationOrMarket", label: "Indication / Market" },
  { key: "customerGroup", label: "Customer Group" },
  { key: "businessModel", label: "Business Model" },
  { key: "developmentStage", label: "Development Stage" },
  { key: "analysisPurpose", label: "Analysis Purpose" },
];

export function TargetTab({ target }: TargetTabProps) {
  return (
    <DataTable>
      <DataTableHead>
        <DataTableHeaderCell>Field</DataTableHeaderCell>
        <DataTableHeaderCell>Value</DataTableHeaderCell>
      </DataTableHead>
      <DataTableBody>
        {ROWS.map(({ key, label }) => {
          const raw = target[key];
          const value =
            key === "analysisPurpose" ? (
              <Badge
                label={formatAnalysisPurpose(target.analysisPurpose)}
                variant="neutral"
              />
            ) : (
              ((raw as string | undefined) ?? "-")
            );
          return (
            <DataTableRow key={key}>
              <DataTableCell className="font-medium text-memo-muted">
                {label}
              </DataTableCell>
              <DataTableCell className="whitespace-normal">
                {value}
              </DataTableCell>
            </DataTableRow>
          );
        })}
      </DataTableBody>
    </DataTable>
  );
}
