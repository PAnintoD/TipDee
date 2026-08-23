import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Middleware uses ONLY edge-safe config (no Prisma, no bcrypt)
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
