import type { LandscapeProject } from "@/types";

export interface LandscapeStorage {
  getAll(): Promise<LandscapeProject[]>;
  getById(id: string): Promise<LandscapeProject | null>;
  create(project: LandscapeProject): Promise<LandscapeProject>;
  update(
    id: string,
    patch: Partial<LandscapeProject>
  ): Promise<LandscapeProject>;
  delete(id: string): Promise<void>;
}
