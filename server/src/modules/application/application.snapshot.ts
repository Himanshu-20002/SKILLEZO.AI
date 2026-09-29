import crypto from "crypto";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

/**
 * Deterministically serializes a JSON-compatible value by sorting object keys recursively.
 * Guarantees that identical data produces an identical string and SHA-256 digest regardless of key ordering.
 * Enforces zero 'any' TypeScript contract.
 */
export function serializeDeterministicJson(value: JsonValue): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => serializeDeterministicJson(item as JsonValue)).join(",")}]`;
  }
  const obj = value as JsonObject;
  const sortedKeys = Object.keys(obj).sort();
  const serializedEntries = sortedKeys
    .filter((k) => obj[k] !== undefined)
    .map((k) => `${JSON.stringify(k)}:${serializeDeterministicJson(obj[k] as JsonValue)}`);
  return `{${serializedEntries.join(",")}}`;
}

/**
 * Computes a deterministic SHA-256 integrity hash for a resume document AST and its builder configuration.
 */
export function computeSnapshotHash(
  resumeDocument: unknown,
  builderConfig: unknown
): string {
  const payload = serializeDeterministicJson({
    doc: (resumeDocument as JsonValue) ?? null,
    config: (builderConfig as JsonValue) ?? null,
  });
  return crypto.createHash("sha256").update(payload).digest("hex");
}
