import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  wide?: boolean;
};

export function AppShell({ children, wide = false }: AppShellProps) {
  return (
    <div
      className={
        wide
          ? "mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6"
          : "mx-auto w-full max-w-5xl px-4 py-6 sm:px-6"
      }
    >
      {children}
    </div>
  );
}
