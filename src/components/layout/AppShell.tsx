import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { isAdminAuthenticated } from "@/lib/auth";
import { storageDriver } from "@/lib/env";

type AppShellProps = {
  children: ReactNode;
  wide?: boolean;
};

export async function AppShell({ children, wide = false }: AppShellProps) {
  const authenticated = await isAdminAuthenticated();
  const storageLabel = storageDriver === "github" ? "GitHub" : "Local JSON";

  return (
    <div className="min-h-screen bg-memo-bg">
      <header className="border-b border-memo-border bg-memo-surface">
        <div
          className={
            wide
              ? "mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6"
              : "mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6"
          }
        >
          <Link
            href="/"
            className="text-sm font-semibold text-memo-ink hover:text-memo-highlight"
          >
            Competitive Landscape Builder
          </Link>
          <div className="flex items-center gap-4 text-sm text-memo-muted">
            <span>Storage: {storageLabel}</span>
            {authenticated ? (
              <>
                <span className="text-memo-ink">Admin</span>
                <LogoutButton />
              </>
            ) : (
              <Link
                href="/admin/login"
                className="hover:text-memo-highlight hover:underline"
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </header>
      <div
        className={
          wide
            ? "mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6"
            : "mx-auto w-full max-w-5xl px-4 py-6 sm:px-6"
        }
      >
        {children}
      </div>
    </div>
  );
}
