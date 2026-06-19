import { AppShell } from "@/components/layout/AppShell";

export default function WorkbenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell wide>{children}</AppShell>;
}
