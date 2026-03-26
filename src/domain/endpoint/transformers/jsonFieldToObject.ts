import type { JsonField } from "@/domain/endpoint/models/JsonField";

export function jsonFieldToObject(fields: JsonField[]): any {
    const result: Record<string, any> = {};

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
                result[property] = example ? String(example).split(",") : [];
            }
            continue;
        }

        // PRIMITIVES
        result[property] = example ?? null;
    }

    return result;
}
