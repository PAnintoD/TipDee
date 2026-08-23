import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

const registerSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
  username: z
    .string()
    .min(3, 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร')
    .max(30)
    .regex(/^[a-z0-9_]+$/, 'ชื่อผู้ใช้ใช้ได้เฉพาะตัวเล็ก a-z, ตัวเลข 0-9 และ _'),
  displayName: z.string().min(1, 'กรุณาใส่ชื่อที่แสดง').max(50),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, username, displayName } = parsed.data;

    // Check existing email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 400 });
    }

    // Check existing username
    const existingUsername = await prisma.streamer.findUnique({ where: { username } });
    if (existingUsername) {
      return NextResponse.json({ error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user + streamer profile
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: displayName,
        role: 'STREAMER',
        streamer: {
          create: {
            username,
            displayName,
          },
        },
      },
    });

    // Create email verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        identifier: email,
        token,
        type: 'EMAIL_VERIFY',
        expires,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, displayName, token);

    return NextResponse.json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีของคุณ',
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
