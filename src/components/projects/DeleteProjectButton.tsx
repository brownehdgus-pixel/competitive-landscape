"use client";

import { useTransition } from "react";
import { deleteProjectAction } from "@/app/actions/projects";

type DeleteProjectButtonProps = {
  projectId: string;
  projectName: string;
};

export function DeleteProjectButton({
  projectId,
  projectName,
}: DeleteProjectButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        const confirmed = window.confirm(
          `Delete project "${projectName}"? This cannot be undone.`
        );
        if (!confirmed) return;
        startTransition(() => deleteProjectAction(projectId));
      }}
      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
