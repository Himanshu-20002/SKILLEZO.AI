export class AIOrchestratorError extends Error {
  constructor(message: string, public readonly code: string = "AI_ORCHESTRATOR_ERROR") {
    super(message);
    this.name = "AIOrchestratorError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AIIntentClassificationError extends AIOrchestratorError {
  constructor(message: string) {
    super(message, "INTENT_CLASSIFICATION_ERROR");
    this.name = "AIIntentClassificationError";
  }
}

export class AIEvidencePlanningError extends AIOrchestratorError {
  constructor(message: string) {
    super(message, "EVIDENCE_PLANNING_ERROR");
    this.name = "AIEvidencePlanningError";
  }
}

export class AIResponseValidationError extends AIOrchestratorError {
  constructor(message: string, public readonly validationDetails?: unknown) {
    super(message, "RESPONSE_VALIDATION_ERROR");
    this.name = "AIResponseValidationError";
  }
}

export class AIMissingRequiredInputError extends AIOrchestratorError {
  constructor(public readonly missingField: string, message?: string) {
    super(
      message || `Required input "${missingField}" is missing for this orchestration intent.`,
      "MISSING_REQUIRED_INPUT"
    );
    this.name = "AIMissingRequiredInputError";
  }
}

export class AIOrchestratorTimeoutError extends AIOrchestratorError {
  constructor(message = "Orchestration request aborted or timed out.") {
    super(message, "ORCHESTRATOR_TIMEOUT");
    this.name = "AIOrchestratorTimeoutError";
  }
}
