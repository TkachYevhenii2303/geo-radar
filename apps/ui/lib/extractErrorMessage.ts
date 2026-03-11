/**
 * Extracts a user-facing error message from an Axios error response.
 * Handles the NestJS global error filter's response shape:
 *   { statusCode, message: string | string[] }
 */
export function extractErrorMessage(err: unknown): string | null {
  if (!err || typeof err !== "object" || !("response" in err)) return null;

  const res = (err as { response?: { data?: { message?: unknown } } }).response;
  const msg = res?.data?.message;

  if (typeof msg === "string") return msg;
  if (Array.isArray(msg) && typeof msg[0] === "string") return msg[0];

  return null;
}
