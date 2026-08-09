import { NextResponse } from 'next/server'
import type { ZodType } from 'zod'

/**
 * Returns a 401 response when the request is missing a valid API key.
 *
 * When `API_SECRET` is set, every mutating request must send an
 * `X-API-Key` header matching it. When `API_SECRET` is empty/unset the
 * guard is disabled (development mode) so the app keeps working out of
 * the box.
 */
export function requireApiKey(request: Request): NextResponse | null {
  const secret = process.env.API_SECRET
  if (!secret) return null

  const key = request.headers.get('x-api-key')
  if (key !== secret) {
    return NextResponse.json(
      { error: 'Unauthorized: a valid X-API-Key header is required for write operations.' },
      { status: 401 }
    )
  }
  return null
}

export function apiError(status: number, message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status })
}

type ParseResult<T> = { data: T; error: null } | { data: null; error: NextResponse }

/**
 * Validates an unknown body against a zod schema. Returns the parsed data
 * or a 400 error response with the validation details.
 */
export function parseBody<T>(
  schema: ZodType<T>,
  raw: unknown
): ParseResult<T> {
  const result = schema.safeParse(raw)
  if (result.success) {
    return { data: result.data, error: null }
  }
  return {
    data: null,
    error: NextResponse.json(
      { error: 'Invalid request body', details: result.error.flatten() },
      { status: 400 }
    ),
  }
}

/** Reads and JSON-parses a request body, returning null on malformed JSON. */
export async function readJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json()
  } catch {
    return null
  }
}
