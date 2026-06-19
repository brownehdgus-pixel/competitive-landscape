import Link from "next/link";
import { DeleteProjectButton } from "@/components/projects/DeleteProjectButton";
import { Badge } from "@/components/ui/Badge";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  formatAnalysisPurpose,
  formatDateTime,
} from "@/lib/projects/formatters";
import { getProjectStats } from "@/lib/projects/projectStats";
import type { LandscapeProject } from "@/types";

type ProjectListTableProps = {
  projects: LandscapeProject[];
};

export function ProjectListTable({ projects }: ProjectListTableProps) {
  if (projects.length === 0) {
    return (
      <EmptyState
        message="No landscape projects yet."
        submessage="Create your first landscape project to start building a report-ready competitive landscape."
      />
    );
  }

  return (
    <DataTable>
      <DataTableHead>
        <DataTableHeaderCell>Project Name</DataTableHeaderCell>
        <DataTableHeaderCell>Analysis Purpose</DataTableHeaderCell>
        <DataTableHeaderCell>Target Technology</DataTableHeaderCell>
        <DataTableHeaderCell>Target Market</DataTableHeaderCell>
        <DataTableHeaderCell>Total Candidates</DataTableHeaderCell>
        <DataTableHeaderCell>Approved</DataTableHeaderCell>
        <DataTableHeaderCell>Pending</DataTableHeaderCell>
        <DataTableHeaderCell>Rejected</DataTableHeaderCell>
        <DataTableHeaderCell>Direct</DataTableHeaderCell>
        <DataTableHeaderCell>Indirect</DataTableHeaderCell>
        <DataTableHeaderCell>Listed</DataTableHeaderCell>
        <DataTableHeaderCell>Private</DataTableHeaderCell>
        <DataTableHeaderCell>Updated At</DataTableHeaderCell>
        <DataTableHeaderCell>Actions</DataTableHeaderCell>
      </DataTableHead>
      <DataTableBody>
        {projects.map((project) => {
          const stats = getProjectStats(project);
          return (
            <DataTableRow key={project.id}>
              <DataTableCell className="font-medium">
                {project.target.companyName}
              </DataTableCell>
              <DataTableCell>
                <Badge
                  label={formatAnalysisPurpose(project.target.analysisPurpose)}
                  variant="neutral"
                />
              </DataTableCell>
              <DataTableCell title={project.target.coreTechnology}>
                <span className="block max-w-[140px] truncate">
                  {project.target.coreTechnology ?? "-"}
                </span>
              </DataTableCell>
              <DataTableCell title={project.target.indicationOrMarket}>
                <span className="block max-w-[140px] truncate">
                  {project.target.indicationOrMarket ?? "-"}
                </span>
              </DataTableCell>
              <DataTableCell>{stats.totalCandidates}</DataTableCell>
              <DataTableCell>{stats.approved}</DataTableCell>
              <DataTableCell>{stats.pending}</DataTableCell>
              <DataTableCell>{stats.rejected}</DataTableCell>
              <DataTableCell>{stats.direct}</DataTableCell>
              <DataTableCell>{stats.indirect}</DataTableCell>
              <DataTableCell>{stats.listed}</DataTableCell>
              <DataTableCell>{stats.privateComparable}</DataTableCell>
              <DataTableCell>{formatDateTime(project.updatedAt)}</DataTableCell>
              <DataTableCell>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-sm font-medium text-memo-highlight hover:underline"
                  >
                    Open
                  </Link>
                  <DeleteProjectButton
                    projectId={project.id}
                    projectName={project.target.companyName}
                  />
                </div>
              </DataTableCell>
            </DataTableRow>
          );
        })}
      </DataTableBody>
    </DataTable>
  );
}
