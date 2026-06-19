import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectListTable } from "@/components/projects/ProjectListTable";
import { landscapeStorage } from "@/lib/storage/landscapeStorage";

export default async function HomePage() {
  const projects = await landscapeStorage.getAll();

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
      <ProjectListTable projects={projects} />
    </AppShell>
  );
}
