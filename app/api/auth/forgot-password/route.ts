import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { z } from 'zod';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = z.object({ email: z.string().email() }).parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Delete old reset tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email, type: 'PASSWORD_RESET' },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        identifier: email,
        token,
        type: 'PASSWORD_RESET',
        expires,
      },
    });

    await sendPasswordResetEmail(email, user.name ?? 'ผู้ใช้', token);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
