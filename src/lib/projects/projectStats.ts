import type { LandscapeProject } from "@/types";

export type ProjectStats = {
  totalCandidates: number;
  approved: number;
  pending: number;
  rejected: number;
  direct: number;
  indirect: number;
  listed: number;
  privateComparable: number;
  notRelevant: number;
  unclassified: number;
};

export function getProjectStats(project: LandscapeProject): ProjectStats {
  const stats: ProjectStats = {
    totalCandidates: project.candidates.length,
    approved: 0,
    pending: 0,
    rejected: 0,
    direct: 0,
    indirect: 0,
    listed: 0,
    privateComparable: 0,
    notRelevant: 0,
    unclassified: 0,
  };

  for (const candidate of project.candidates) {
    switch (candidate.reviewStatus) {
      case "Approved":
        stats.approved++;
        break;
      case "Pending":
        stats.pending++;
        break;
      case "Rejected":
        stats.rejected++;
        break;
    }

    switch (candidate.candidateType) {
      case "Direct Competitor":
        stats.direct++;
        break;
      case "Indirect Competitor":
        stats.indirect++;
        break;
      case "Comparable Listed Company":
        stats.listed++;
        break;
      case "Comparable Private Company":
        stats.privateComparable++;
        break;
      case "Not Relevant":
        stats.notRelevant++;
        break;
      case "Unclassified":
        stats.unclassified++;
        break;
    }
  }

  return stats;
}
