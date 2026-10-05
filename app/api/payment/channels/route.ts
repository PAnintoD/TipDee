import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generatePromptPayQRCode } from '@/lib/promptpay';

async function findOrCreateSessionStreamer(session: any) {
  if (!session?.user) return null;

  const userOrStreamerFilter = [
    ...(session.user.id ? [{ userId: session.user.id }, { id: session.user.id }] : []),
    ...(session.user.streamerId ? [{ id: session.user.streamerId }] : []),
    ...(session.user.username ? [{ username: session.user.username }] : []),
    ...(session.user.email ? [{ user: { email: session.user.email } }] : []),
  ];

  let streamer = await prisma.streamer.findFirst({
    where: { OR: userOrStreamerFilter },
    include: { widgetSettings: true, goalSettings: true },
  });

  if (!streamer && session.user.id) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: session.user.id },
          ...(session.user.email ? [{ email: session.user.email }] : []),
        ],
      },
    });

    if (user) {
      const baseName = (user.name || user.email?.split('@')[0] || 'streamer')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '');
      let uniqueUsername = baseName || 'streamer';
      let count = 1;
      while (await prisma.streamer.findUnique({ where: { username: uniqueUsername } })) {
        uniqueUsername = `${baseName}${count++}`;
      }

      streamer = await prisma.streamer.create({
        data: {
          userId: user.id,
          username: uniqueUsername,
          displayName: user.name || uniqueUsername,
        },
        include: { widgetSettings: true, goalSettings: true },
      });
    }
  }

  return streamer;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  }

  const streamer = await findOrCreateSessionStreamer(session);
  if (!streamer) {
    return NextResponse.json({ error: 'ไม่พบข้อมูลสตรีมเมอร์' }, { status: 404 });
  }

  let promptpayQR: string | null = null;
  if (streamer.promptpayTarget) {
    try {
      promptpayQR = await generatePromptPayQRCode(streamer.promptpayTarget);
    } catch (e) {
      console.warn('GET /api/payment/channels: QR generation failed', e);
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      ...streamer,
      promptpayQR,
    },
  });
}

const patchSchema = z.object({
  promptpayTarget: z.string().optional().nullable(),
  promptpayName: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  truemoneyPhone: z.string().optional().nullable(),
  minAmount: z.coerce.number().min(1).optional(),
  presetAmounts: z.array(z.coerce.number()).optional(),
  enableAutoSlip: z.boolean().optional(),
  slipApiKey: z.string().optional().nullable(),
  slipBranchId: z.string().optional().nullable(),
  webhookUrl: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || typeof val !== 'string') return null;
      const trimmed = val.trim();
      return trimmed.length > 0 ? trimmed : null;
    }),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  }

  const streamer = await findOrCreateSessionStreamer(session);
  if (!streamer) {
    return NextResponse.json({ error: 'ไม่พบข้อมูลสตรีมเมอร์' }, { status: 404 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const data = parsed.data;
  const updateData: any = {};

  if (data.promptpayTarget !== undefined) updateData.promptpayTarget = data.promptpayTarget?.trim() || null;
  if (data.promptpayName !== undefined) updateData.promptpayName = data.promptpayName?.trim() || null;
  if (data.bankName !== undefined) updateData.bankName = data.bankName || null;
  if (data.truemoneyPhone !== undefined) updateData.truemoneyPhone = data.truemoneyPhone?.trim() || null;
  if (data.minAmount !== undefined) updateData.minAmount = data.minAmount;
  if (data.presetAmounts !== undefined) updateData.presetAmounts = JSON.stringify(data.presetAmounts);
  if (data.enableAutoSlip !== undefined) updateData.enableAutoSlip = data.enableAutoSlip;
  if (data.slipApiKey !== undefined) updateData.slipApiKey = data.slipApiKey?.trim() || null;
  if (data.slipBranchId !== undefined) updateData.slipBranchId = data.slipBranchId?.trim() || null;
  if (data.webhookUrl !== undefined) updateData.webhookUrl = data.webhookUrl;

  const updatedStreamer = await prisma.streamer.update({
    where: { id: streamer.id },
    data: updateData,
  });

  // Audit log
  try {
    await prisma.auditLog.create({
      data: {
        userId: session.user.id || streamer.userId,
        action: 'CHANGE_PAYMENT_SETTINGS',
        detail: `Updated payment channels: ${Object.keys(updateData).join(', ')}`,
      },
    });
  } catch (err) {
    console.warn('AuditLog creation warning:', err);
  }

  let promptpayQR: string | null = null;
  if (updatedStreamer.promptpayTarget) {
    try {
      promptpayQR = await generatePromptPayQRCode(updatedStreamer.promptpayTarget);
    } catch (e) {
      console.warn('PATCH /api/payment/channels: QR generation failed', e);
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      ...updatedStreamer,
      promptpayQR,
    },
  });
}
