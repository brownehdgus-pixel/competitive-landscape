import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkbenchClient } from "@/components/projects/WorkbenchClient";
import { landscapeStorage } from "@/lib/storage/landscapeStorage";
import { getStorageErrorMessage } from "@/lib/storage/storageErrorMessage";
import type { LandscapeProject } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type WorkbenchPageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorkbenchPage({ params }: WorkbenchPageProps) {
  const { id } = await params;

  let project: LandscapeProject | null = null;
  let loadError: string | null = null;

  try {
    project = await landscapeStorage.getById(id);
  } catch (error) {
    console.error("Failed to load project:", error);
    loadError = getStorageErrorMessage(error);
  }

  if (!loadError && !project) {
    notFound();
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-800">
          Project not found or failed to load.
        </p>
        <p className="mt-2 text-xs text-memo-muted">{loadError}</p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm text-memo-highlight hover:underline"
        >
          ← Back to Projects
        </Link>
      </div>
    );
  }

  return <WorkbenchClient project={project!} />;
}
