import type { JsonField } from "@/domain/endpoint/models/JsonField";

/**
 * Converts a JSON object -> JsonField[] recursively.
 */
export function objectToJsonField(obj: unknown): JsonField[] {
  if (!isRecord(obj)) return [];
  const result: JsonField[] = [];

  for (const key of Object.keys(obj)) {
    const value = obj[key];

    // Determine type
    const isArray = Array.isArray(value);
    const isObject = isRecord(value);

    // CASE: OBJECT
    if (isObject) {
      result.push({
        property: key,
        schemaType: "object",
        example: undefined,
        description: "",
        children: objectToJsonField(value) // recurse
      });
      continue;
    }

    // CASE: ARRAY
    if (isArray) {
      // detect object array vs primitive array
      const first = value[0];

      if (typeof first === "object") {
        if (first === null) {
          result.push({
            property: key,
            schemaType: "array",
            example: value.map(String).join(", "),
            description: "",
            children: [],
          });
          continue;
        }
        result.push({
          property: key,
          schemaType: "array",
          example: "", // UI will ignore example when children exist
          description: "",
          children: objectToJsonField(first) // one sample object defines the shape
        });
      } else {
        result.push({
          property: key,
          schemaType: "array",
          example: value.join(", "), // primitive CSV
          description: "",
          children: [] // primitive array → no children
        });
      }

      continue;
    }

    // CASE: PRIMITIVE
    result.push({
      property: key,
      schemaType: detectPrimitiveType(value),
      example: value as JsonField['example'],
      description: "",
      children: []
    });
  }

  return result;
}

/** Helper to match your schemaType values */
function detectPrimitiveType(val: unknown): "string" | "integer" | "number" | "boolean" {
  if (typeof val === "number") {
    return Number.isInteger(val) ? "integer" : "number";
  }
  if (typeof val === "boolean") return "boolean";
  return "string";
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
