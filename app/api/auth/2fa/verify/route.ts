import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { verifySync } from 'otplib';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  }

  const body = await req.json();
  const { otp } = z.object({ otp: z.string().length(6) }).parse(body);

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.twoFactorSecret) {
    return NextResponse.json({ error: 'ยังไม่ได้ตั้งค่า 2FA กรุณาตั้งค่าก่อน' }, { status: 400 });
  }

  const isValid = verifySync({ token: otp, secret: user.twoFactorSecret });
  if (!isValid) {
    return NextResponse.json({ error: 'รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: true },
  });

  await prisma.auditLog.create({
    data: { userId: user.id, action: 'ENABLE_2FA', detail: '2FA enabled via TOTP' },
  });

  return NextResponse.json({ success: true, message: 'เปิดใช้งาน 2FA สำเร็จแล้ว' });
}
