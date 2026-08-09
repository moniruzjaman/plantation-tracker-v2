/**
 * Client-side helper for calling mutating API routes.
 *
 * When NEXT_PUBLIC_API_SECRET is set (the same value as the server-side
 * API_SECRET), the X-API-Key header is attached so the data-entry UI can
 * perform writes. Leave it empty in open/development mode.
 */
export function apiHeaders(): HeadersInit {
  const key = process.env.NEXT_PUBLIC_API_SECRET
  return {
    'Content-Type': 'application/json',
    ...(key ? { 'X-API-Key': key } : {}),
  }
}
