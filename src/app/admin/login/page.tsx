import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AppShell } from "@/components/layout/AppShell";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-sm">
        <Link
          href="/"
          className="text-sm text-memo-muted hover:text-memo-highlight hover:underline"
        >
          ← Back to Projects
        </Link>
        <h1 className="mt-4 text-xl font-semibold text-memo-ink">Admin Login</h1>
        <p className="mt-1 text-sm text-memo-muted">
          Sign in to create or edit projects and candidates.
        </p>
        <div className="mt-6 rounded-lg border border-memo-border bg-memo-surface p-6">
          <AdminLoginForm />
        </div>
      </div>
    </AppShell>
  );
}
