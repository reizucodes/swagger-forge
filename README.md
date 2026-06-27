# apispec-forge

A client-side tool for designing REST API endpoints and generating framework-ready annotations and OpenAPI specs — no backend, no sign-up, runs entirely in the browser.

**Live:** [api-spec.reizucodes.com](https://api-spec.reizucodes.com)

---

## What it does

Fill in your endpoint details — method, path, parameters, request body, responses — and get a ready-to-paste annotation for your framework of choice. Switch between output formats and spec versions without re-entering anything.

---

## Output formats

| Format | Target |
|---|---|
| PHP DocBlock | swagger-php / l5-swagger |
| PHP Attributes (PHP 8+) | swagger-php v4+ |
| OpenAPI JSON | Any OpenAPI-compatible tooling |
| JS JSDoc | swagger-jsdoc *(coming soon)* |

## Spec versions

| Version | Notes |
|---|---|
| Swagger 2.0 | Legacy format, still common in older Laravel setups |
| OpenAPI 3.0.3 | Current stable, widest tooling support |
| OpenAPI 3.1.0 | Latest, aligns with JSON Schema 2020-12 |

Each version produces structurally correct output — `requestBody` vs `in: body`, `components.securitySchemes` vs `securityDefinitions`, nullable type handling, etc.

---

## Development

```bash
npm install
npm run dev       # Vite dev server with HMR
npm run build     # Type-check + production bundle
npm run lint      # ESLint
npm run test      # Vitest
```

---

## Architecture

Clean Architecture — four layers, no framework lock-in:

```
src/
  domain/endpoint/        # Pure models and business rules
  application/endpoint/   # Use-case orchestration
  core/annotation/        # Generator infrastructure
    specs/                # Per-version spec definitions (JSON)
    generators/           # php/, openapi/, js/
    registry/             # Central generator lookup
  components/             # React UI
  hooks/                  # useEndpointForm
```

Adding a new output format: implement `AnnotationGenerator`, register in `generatorRegistry.ts`.

Adding a new spec version: add a JSON file to `src/core/annotation/specs/`, import it in `index.ts`.

---

## Format reference

See [`docs/formats/`](docs/formats/) for field-by-field documentation on each output format.
