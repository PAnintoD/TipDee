import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = z
      .object({
        token: z.string(),
        password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
      })
      .parse(body);

    const resetToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.type !== 'PASSWORD_RESET' || resetToken.expires < new Date()) {
      return NextResponse.json({ error: 'ลิงก์รีเซ็ตรหัสผ่านหมดอายุแล้ว กรุณาขอใหม่' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: resetToken.userId! },
      data: { passwordHash },
    });

    // Log password change
    await prisma.auditLog.create({
      data: {
        userId: resetToken.userId,
        action: 'CHANGE_PASSWORD',
        detail: 'Password reset via email link',
      },
    });

    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json({ success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว' });
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
