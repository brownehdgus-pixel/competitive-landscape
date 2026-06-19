import { createCandidateCompany, createLandscapeProject } from "../src/lib/factories";
import { getProjectStats } from "../src/lib/projects/projectStats";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const project = createLandscapeProject({
  companyName: "Stats Test Co",
  analysisPurpose: "Both",
});

project.candidates.push(
  createCandidateCompany({
    companyName: "Direct A",
    candidateType: "Direct Competitor",
    reviewStatus: "Approved",
  }),
  createCandidateCompany({
    companyName: "Pending B",
    candidateType: "Unclassified",
    reviewStatus: "Pending",
  }),
  createCandidateCompany({
    companyName: "Listed C",
    candidateType: "Comparable Listed Company",
    reviewStatus: "Rejected",
  }),
  createCandidateCompany({
    companyName: "Private D",
    candidateType: "Comparable Private Company",
    reviewStatus: "Approved",
  })
);

const stats = getProjectStats(project);

assert(stats.totalCandidates === 4, "totalCandidates");
assert(stats.approved === 2, "approved");
assert(stats.pending === 1, "pending");
assert(stats.rejected === 1, "rejected");
assert(stats.direct === 1, "direct");
assert(stats.listed === 1, "listed");
assert(stats.privateComparable === 1, "privateComparable");
assert(stats.unclassified === 1, "unclassified");

console.log("Step 3 projectStats verify: OK");
