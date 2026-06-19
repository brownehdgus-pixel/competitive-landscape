export class OpenAIRateLimitError extends Error {
  constructor(message = "OpenAI rate limit exceeded. Please wait and retry.") {
    super(message);
    this.name = "OpenAIRateLimitError";
  }
}

export class OpenAIClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAIClientError";
  }
}

export class ClassifyParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClassifyParseError";
  }
}

export class ClassifyValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClassifyValidationError";
  }
}
