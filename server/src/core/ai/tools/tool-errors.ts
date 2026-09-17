export class AIToolError extends Error {
  constructor(message: string, public readonly details?: unknown) {
    super(`[AIToolError] ${message}`);
    this.name = "AIToolError";
  }
}

export class AIToolNotFoundError extends AIToolError {
  constructor(toolName: string) {
    super(`Requested tool "${toolName}" is not registered in the allowlisted Tool Registry.`);
    this.name = "AIToolNotFoundError";
  }
}

export class AIToolValidationError extends AIToolError {
  constructor(message: string, details?: unknown) {
    super(`Tool input validation failed: ${message}`, details);
    this.name = "AIToolValidationError";
  }
}

export class AIToolOwnershipError extends AIToolError {
  constructor(message: string, details?: unknown) {
    super(`Candidate identity/ownership violation: ${message}`, details);
    this.name = "AIToolOwnershipError";
  }
}

export class AIToolExecutionError extends AIToolError {
  constructor(toolName: string, message: string, details?: unknown) {
    super(`Execution of tool "${toolName}" failed: ${message}`, details);
    this.name = "AIToolExecutionError";
  }
}

export class AIToolOutputValidationError extends AIToolError {
  constructor(toolName: string, message: string, details?: unknown) {
    super(`Output validation failed for tool "${toolName}": ${message}`, details);
    this.name = "AIToolOutputValidationError";
  }
}

export class AIToolTimeoutError extends AIToolError {
  constructor(toolName: string, message = "Execution timed out or was aborted by caller.") {
    super(`Tool "${toolName}" timed out: ${message}`);
    this.name = "AIToolTimeoutError";
  }
}

export class AIToolRegistryError extends AIToolError {
  constructor(message: string, details?: unknown) {
    super(`Registry configuration error: ${message}`, details);
    this.name = "AIToolRegistryError";
  }
}
