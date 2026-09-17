export class EvidenceValidationError extends Error {
  constructor(message: string, public readonly details?: any) {
    super(`[EvidenceValidationError] ${message}`);
    this.name = "EvidenceValidationError";
  }
}

export class EvidenceOwnershipError extends Error {
  constructor(message: string, public readonly details?: any) {
    super(`[EvidenceOwnershipError] ${message}`);
    this.name = "EvidenceOwnershipError";
  }
}

export class EvidenceConflictError extends Error {
  constructor(message: string, public readonly details?: any) {
    super(`[EvidenceConflictError] ${message}`);
    this.name = "EvidenceConflictError";
  }
}
