import type { JsonField } from "@/domain/endpoint/models/JsonField";

export function flattenJsonFields(fields: JsonField[]): JsonField[] {
  return fields.map(f => ({
    property: f.property,
    schemaType: f.schemaType === "object" || f.schemaType === "array"
      ? "string"
      : f.schemaType,
    example: f.example ?? "",
    description: f.description ?? "",
    // dropped children
    children: []
  }));
}
