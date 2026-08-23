import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  }

  // Generate TOTP secret
  const secret = generateSecret();
  const otpAuthUrl = generateURI({
    label: session.user.email ?? session.user.id,
    issuer: 'TipDee',
    secret,
  });

  // Save secret (not yet enabled)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorSecret: secret },
  });

  // Generate QR code as data URL
  const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl);

  return NextResponse.json({
    secret,
    otpAuthUrl,
    qrCode: qrCodeUrl,
  });
}
