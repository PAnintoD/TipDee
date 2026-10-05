import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

function getDatabaseUrl(): string {
  // If explicitly provided in environment and not a local Windows path, use it
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('C:/work/donate')) {
    return process.env.DATABASE_URL;
  }

  // On Vercel / serverless environment, the root file system is read-only.
  // SQLite cannot acquire write locks outside of /tmp.
  // We copy the bundled SQLite database to /tmp/dev.db if running on Vercel.
  if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/dev.db';
    try {
      if (!fs.existsSync(tmpDbPath)) {
        const candidatePaths = [
          path.join(process.cwd(), 'prisma', 'prisma', 'dev.db'),
          path.join(process.cwd(), 'prisma', 'dev.db'),
          path.resolve('./prisma/prisma/dev.db'),
          path.resolve('./prisma/dev.db'),
        ];
        for (const candidate of candidatePaths) {
          if (fs.existsSync(candidate)) {
            fs.copyFileSync(candidate, tmpDbPath);
            break;
          }
        }
      }
    } catch (e) {
      console.error('[Prisma] Error copying SQLite db to /tmp:', e);
    }

    if (fs.existsSync(tmpDbPath)) {
      return `file:${tmpDbPath}`;
    }
  }

  // Local development / fallback
  const localDb = path.join(process.cwd(), 'prisma', 'prisma', 'dev.db');
  return `file:${localDb}`;
}

const dbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// Enable SQLite Write-Ahead Logging (WAL) and 5000ms busy timeout to prevent SQLITE_BUSY under concurrent write spikes
if (!globalForPrisma.prisma && (dbUrl.startsWith('file:') || !process.env.DATABASE_URL?.includes('postgres'))) {
  prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;')
    .then(() => prisma.$queryRawUnsafe('PRAGMA busy_timeout = 5000;'))
    .then(() => prisma.$queryRawUnsafe('PRAGMA synchronous = NORMAL;'))
    .catch(() => {
      // In-memory or non-SQLite environment
    });
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

