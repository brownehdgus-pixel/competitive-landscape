export class DuplicateProjectIdError extends Error {
  constructor(id: string) {
    super(`Project with id "${id}" already exists`);
    this.name = "DuplicateProjectIdError";
  }
}

export class ProjectNotFoundError extends Error {
  constructor(id: string) {
    super(`Project with id "${id}" not found`);
    this.name = "ProjectNotFoundError";
  }
}

export class CandidateNotFoundError extends Error {
  constructor(id: string) {
    super(`Candidate with id "${id}" not found`);
    this.name = "CandidateNotFoundError";
  }
}

export class EvidenceNotFoundError extends Error {
  constructor(id: string) {
    super(`Evidence with id "${id}" not found`);
    this.name = "EvidenceNotFoundError";
  }
}

export class LandscapesFileError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "LandscapesFileError";
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}
