import type { JSX } from 'react'
import type { AnnotationTarget } from './contracts'

export const ANNOTATION_TIPS: Record<AnnotationTarget, JSX.Element> = {
  'php-swagger': (
    <>
      Paste above your controller method.  
      If you’re using <code>l5-swagger</code>, keep method-level <code>@OA</code> annotations here.
    </>
  ),
  'js-jsdoc': (
    <>
      Paste above your route handler. If you’re using{' '}
      <code>swagger-jsdoc</code>, keep the <code>@openapi</code> block close to the endpoint definition.
    </>
  ),
  'openapi-json': (
    <>
      This is a native OpenAPI document. Save it as{' '}
      <code>openapi.json</code> and load it into Swagger UI, Postman,
      or use it to generate client SDKs.
    </>
  ),
}
