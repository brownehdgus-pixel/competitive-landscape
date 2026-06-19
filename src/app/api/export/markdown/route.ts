import { NextResponse } from "next/server";
import { buildMarkdownExport, ExportError } from "@/lib/export/markdown";
import { sanitizeExportFilename } from "@/lib/export/exportData";
import { ProjectNotFoundError } from "@/lib/storage/errors";
import { landscapeStorage } from "@/lib/storage/landscapeStorage";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  try {
    const project = await landscapeStorage.getById(projectId);
    if (!project) throw new ProjectNotFoundError(projectId);

    const markdown = buildMarkdownExport(project);
    const filename = sanitizeExportFilename(
      `${project.target.companyName}-report`,
      "md"
    );

    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof ExportError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof ProjectNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
