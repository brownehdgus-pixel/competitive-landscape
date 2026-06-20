import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectListTable } from "@/components/projects/ProjectListTable";
import { landscapeStorage } from "@/lib/storage/landscapeStorage";
import { getStorageErrorMessage } from "@/lib/storage/storageErrorMessage";
import type { LandscapeProject } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  let projects: LandscapeProject[] = [];
  let loadError: string | null = null;

  try {
    projects = await landscapeStorage.getAll();
  } catch (error) {
    console.error("Failed to load landscape projects:", error);
    loadError = getStorageErrorMessage(error);
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-memo-ink">
            Competitive Landscape Builder
          </h1>
          <p className="mt-1 text-sm text-memo-muted">
            보고서 참조용 경쟁사·비교기업 워크벤치
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center rounded-md bg-memo-accent px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          New Project
        </Link>
      </div>
      {loadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-medium text-red-800">
            Failed to load landscape projects.
          </p>
          <p className="mt-2 text-xs text-memo-muted">{loadError}</p>
        </div>
      ) : (
        <ProjectListTable projects={projects} />
      )}
    </AppShell>
  );
}
