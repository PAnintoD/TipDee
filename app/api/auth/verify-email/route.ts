import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', req.url));
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return NextResponse.redirect(new URL('/login?error=token_expired', req.url));
  }

  if (verificationToken.type !== 'EMAIL_VERIFY') {
    return NextResponse.redirect(new URL('/login?error=invalid_token', req.url));
  }

  // Mark email as verified
  await prisma.user.update({
    where: { id: verificationToken.userId! },
    data: { emailVerified: new Date() },
  });

  // Delete used token
  await prisma.verificationToken.delete({ where: { token } });

  return NextResponse.redirect(new URL('/login?verified=1', req.url));
}
