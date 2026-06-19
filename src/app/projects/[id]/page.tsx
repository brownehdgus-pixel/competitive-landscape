import { notFound } from "next/navigation";
import { WorkbenchClient } from "@/components/projects/WorkbenchClient";
import { landscapeStorage } from "@/lib/storage/landscapeStorage";

type WorkbenchPageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorkbenchPage({ params }: WorkbenchPageProps) {
  const { id } = await params;
  const project = await landscapeStorage.getById(id);

  if (!project) {
    notFound();
  }

  return <WorkbenchClient project={project} />;
}
