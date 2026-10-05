import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton Configuration
 * 
 * - ป้องกันปัญหา Connection Exhaustion ในสภาพแวดล้อม Development (Next.js Fast Refresh)
 *   โดยการเก็บ instance ไว้ที่ globalThis
 * - รองรับ PostgreSQL Connection Pooling (Supabase Supavisor / PgBouncer พอร์ต 6543)
 *   และ Direct Connection (พอร์ต 5432)
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
