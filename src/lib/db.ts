import { PrismaClient } from '@prisma/client'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Resolves the SQLite database URL at runtime.
 *
 * Relative `file:` URLs are resolved against `process.cwd()` so the app
 * reliably finds `db/custom.db` in both the dev server and the standalone
 * production build (Prisma's own relative resolution is based on the schema
 * location, which is unreliable inside the bundled standalone output).
 * Absolute URLs (e.g. a platform-provided DATABASE_URL) pass through.
 */
function resolveDatabaseUrl(raw?: string): string {
  const value = (raw ?? '').trim()
  if (!value) {
    return `file:${path.join(process.cwd(), 'db', 'custom.db')}`
  }
  const match = value.match(/^file:(.+)$/i)
  if (match && !match[1].startsWith('/') && !/^[A-Za-z]:[\\/]/.test(match[1])) {
    return `file:${path.join(process.cwd(), match[1])}`
  }
  return value
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: resolveDatabaseUrl(process.env.DATABASE_URL) } },
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
