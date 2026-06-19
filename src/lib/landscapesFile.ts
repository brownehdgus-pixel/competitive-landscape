import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { LandscapesFileError } from "@/lib/storage/errors";
import type { LandscapesFile } from "@/types";

export const LANDSCAPES_FILE_PATH = path.join(
  process.cwd(),
  "data",
  "landscapes.json"
);

export function createEmptyLandscapesFile(): LandscapesFile {
  return { version: 1, projects: [] };
}

export function isLandscapesFile(value: unknown): value is LandscapesFile {
  if (!value || typeof value !== "object") return false;
  const file = value as LandscapesFile;
  return file.version === 1 && Array.isArray(file.projects);
}

export async function readLandscapesFile(): Promise<LandscapesFile> {
  try {
    const raw = await readFile(LANDSCAPES_FILE_PATH, "utf-8");
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new LandscapesFileError(
        "landscapes.json is corrupted (invalid JSON)",
        error
      );
    }
    if (!isLandscapesFile(parsed)) {
      throw new LandscapesFileError("Invalid landscapes.json structure");
    }
    return parsed;
  } catch (error) {
    if (error instanceof LandscapesFileError) {
      throw error;
    }
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      const empty = createEmptyLandscapesFile();
      await writeLandscapesFile(empty);
      return empty;
    }
    throw error;
  }
}

export async function writeLandscapesFile(file: LandscapesFile): Promise<void> {
  if (!isLandscapesFile(file)) {
    throw new LandscapesFileError("Cannot write invalid landscapes file");
  }
  const content = JSON.stringify(file, null, 2);
  await writeFile(LANDSCAPES_FILE_PATH, `${content}\n`, "utf-8");
}
