/**
 * Step 2 저장소 추상화 검증
 * 실행: npm run verify:step2
 */
import { writeFile } from "node:fs/promises";
import {
  createCandidateCompany,
  createLandscapeProject,
} from "../src/lib/factories";
import { LANDSCAPES_FILE_PATH } from "../src/lib/landscapesFile";
import {
  DuplicateProjectIdError,
  LandscapesFileError,
  ProjectNotFoundError,
} from "../src/lib/storage/errors";
import { LocalFileStorage } from "../src/lib/storage/localFileStorage";
import {
  landscapeStorage,
  resetLandscapeStorageForTests,
} from "../src/lib/storage/landscapeStorage";

async function main() {
  resetLandscapeStorageForTests();
  const storage = landscapeStorage;

  if (!(storage instanceof LocalFileStorage)) {
    throw new Error("v0.1 should use LocalFileStorage");
  }

  await storage.reset();

  const project = createLandscapeProject({
    companyName: "스토리지테스트",
    analysisPurpose: "VC Investment Review",
  });
  const candidate = createCandidateCompany({
    companyName: "후보 B",
    technology: "항체",
  });
  project.candidates.push(candidate);

  const created = await storage.create(project);
  if (created.id !== project.id) throw new Error("create id mismatch");

  const byId = await storage.getById(project.id);
  if (!byId) throw new Error("getById failed after create");

  await storage.update(project.id, {
    target: { ...byId.target, description: "업데이트됨" },
  });
  const updated = await storage.getById(project.id);
  if (updated?.target.description !== "업데이트됨") {
    throw new Error("update patch failed");
  }

  let duplicateCaught = false;
  try {
    await storage.create(project);
  } catch (error) {
    if (error instanceof DuplicateProjectIdError) duplicateCaught = true;
  }
  if (!duplicateCaught) throw new Error("duplicate create should fail");

  let notFoundCaught = false;
  try {
    await storage.delete("non-existent-id");
  } catch (error) {
    if (error instanceof ProjectNotFoundError) notFoundCaught = true;
  }
  if (!notFoundCaught) throw new Error("delete missing id should fail");

  await storage.delete(project.id);
  const afterDelete = await storage.getById(project.id);
  if (afterDelete !== null) throw new Error("delete should remove project");

  const all = await storage.getAll();
  if (all.length !== 0) throw new Error("getAll should be empty after delete");

  await writeFile(LANDSCAPES_FILE_PATH, "{ invalid json", "utf-8");
  let corruptCaught = false;
  try {
    await storage.getAll();
  } catch (error) {
    if (error instanceof LandscapesFileError) corruptCaught = true;
  }
  if (!corruptCaught) throw new Error("corrupted JSON should throw LandscapesFileError");

  await storage.reset();
  console.log("Step 2 verify: OK");
}

main().catch((error) => {
  console.error("Step 2 verify: FAILED", error);
  process.exit(1);
});
