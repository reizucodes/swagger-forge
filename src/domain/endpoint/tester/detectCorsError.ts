export function detectCorsError(err: unknown): boolean {
  return err instanceof TypeError
}
