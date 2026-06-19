import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectForm } from "@/components/projects/ProjectForm";

export default function NewProjectPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-memo-muted hover:text-memo-highlight hover:underline"
        >
          ← Back to Projects
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-memo-ink">
          New Landscape Project
        </h1>
        <p className="mt-1 text-sm text-memo-muted">
          Enter Target Company information to start a competitive landscape
          analysis.
        </p>
      </div>
      <ProjectForm />
    </AppShell>
  );
}
