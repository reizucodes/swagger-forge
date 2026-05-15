import type { JsonField } from "@/domain/endpoint/models/JsonField";

export function jsonFieldToObject(fields: JsonField[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const field of fields) {
        const { property, schemaType, example, children } = field;

        if (!property) continue;

        // OBJECT → recurse
        if (schemaType === "object") {
            result[property] = jsonFieldToObject(children || []);
            continue;
        }

        // ARRAY → determine primitive vs object array
        if (schemaType === "array") {
            if (children && children.length > 0) {
                result[property] = [jsonFieldToObject(children)];
            } else {
                result[property] = example
                  ? String(example)
                      .split(",")
                      .map((v) => v.trim())
                      .filter((v) => v !== "")
                  : [];
            }
            continue;
        }

        // PRIMITIVES
        result[property] = example ?? null;
    }

    return result;
}
