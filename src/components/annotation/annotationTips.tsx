import type { JSX } from 'react'
import type { AnnotationTarget } from '@/core/annotation/contracts/AnnotationTarget'

export const ANNOTATION_TIPS: Record<AnnotationTarget, JSX.Element> = {
  'php-swagger': (
    <>
      Paste above your controller method.
      If you're using <code>l5-swagger</code>, keep method-level <code>@OA</code> annotations here.
    </>
  ),
  'php-attribute': (
    <>
      Paste above your controller method. Requires{' '}
      <code>swagger-php</code> v4+ and PHP 8.0+. No docblock needed.
    </>
  ),
  'js-jsdoc': (
    <>
      Paste above your route handler. Requires{' '}
      <code>swagger-jsdoc</code> — works with Express, Fastify, Koa, or any Node.js framework.
      Path uses OpenAPI syntax (<code>{'{id}'}</code>).
    </>
  ),
  'openapi-json': (
    <>
      This is a native OpenAPI document. Save it as{' '}
      <code>openapi.json</code> and load it into Swagger UI, Postman,
      or use it to generate client SDKs.
    </>
  ),
  'py-fastapi': (
    <>
      Paste into your router file. The Pydantic model captures the request body schema — add your handler function below the decorator.
    </>
  ),
}
