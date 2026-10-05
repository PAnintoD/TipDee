import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const updateAccountSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
  twoFactorEnabled: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(session.user.id ? [{ id: session.user.id }] : []),
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
    include: { streamer: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'ไม่พบข้อมูลผู้ใช้' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.streamer?.username || '',
      displayName: user.streamer?.displayName || user.name || '',
      twoFactorEnabled: user.twoFactorEnabled,
      hasPassword: !!user.passwordHash,
      createdAt: user.createdAt,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(session.user.id ? [{ id: session.user.id }] : []),
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
    include: { streamer: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'ไม่พบข้อมูลผู้ใช้' }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { displayName, currentPassword, newPassword, twoFactorEnabled } = parsed.data;

  // 1. Password change
  if (newPassword) {
    if (user.passwordHash) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'กรุณากรอกรหัสผ่านปัจจุบัน' }, { status: 400 });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' }, { status: 400 });
      }
    }
    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CHANGE_PASSWORD',
        detail: 'User updated password',
      },
    });
  }

  // 2. Profile update (name / displayName)
  if (displayName) {
    await prisma.user.update({
      where: { id: user.id },
      data: { name: displayName },
    });

    if (user.streamer) {
      await prisma.streamer.update({
        where: { id: user.streamer.id },
        data: { displayName },
      });
    }
  }

  // 3. 2FA toggle
  if (twoFactorEnabled !== undefined) {
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled },
    });
  }

  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { streamer: true },
  });

  return NextResponse.json({
    success: true,
    data: {
      id: updatedUser?.id,
      email: updatedUser?.email,
      name: updatedUser?.name,
      username: updatedUser?.streamer?.username || '',
      displayName: updatedUser?.streamer?.displayName || updatedUser?.name || '',
      twoFactorEnabled: updatedUser?.twoFactorEnabled,
    },
    message: 'บันทึกข้อมูลเรียบร้อยแล้ว',
  });
}

export async function POST(req: NextRequest) {
  return PATCH(req);
}

export async function PUT(req: NextRequest) {
  return PATCH(req);
}
