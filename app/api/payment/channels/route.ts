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

export async function GET(req: NextRequest) {
  // Support dynamic QR preview via query param ?target=...
  const targetParam = req.nextUrl?.searchParams?.get('target');
  if (targetParam) {
    const cleaned = targetParam.trim().replace(/[^0-9]/g, '');
    if (cleaned.length === 10 || cleaned.length === 13 || cleaned.length === 15) {
      try {
        const qr = await generatePromptPayQRCode(cleaned);
        return NextResponse.json({ success: true, qr });
      } catch (e: any) {
        return NextResponse.json({ error: e.message || 'สร้าง QR Code ไม่สำเร็จ' }, { status: 400 });
      }
    }
    return NextResponse.json({ error: 'หมายเลขพร้อมเพย์ต้องเป็น 10, 13 หรือ 15 หลัก' }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  }

  const streamer = await findOrCreateSessionStreamer(session);
  if (!streamer) {
    return NextResponse.json({ error: 'ไม่พบข้อมูลสตรีมเมอร์' }, { status: 404 });
  }

  // Get user record to ensure synchronized data
  const user = session.user.id ? await prisma.user.findUnique({ where: { id: session.user.id } }) : null;

  // Real user data only - fallback to empty string, NEVER return mock data
  const promptpayId = streamer.promptpayId || streamer.promptpayTarget || user?.promptpayId || '';
  const promptpayTarget = promptpayId;
  const accountName = streamer.accountName || streamer.promptpayName || user?.accountName || user?.promptpayName || '';
  const promptpayName = accountName;
  const bankCode = streamer.bankCode || streamer.bankName || user?.bankCode || user?.bankName || '';
  const bankName = bankCode;
  const truemoneyPhone = streamer.truemoneyPhone || user?.truemoneyPhone || '';

  let promptpayQR: string | null = null;
  if (promptpayId) {
    try {
      promptpayQR = await generatePromptPayQRCode(promptpayId);
    } catch (e) {
      console.warn('GET /api/payment/channels: QR generation failed', e);
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      id: streamer.id,
      userId: streamer.userId,
      promptpayId,
      promptpayTarget,
      accountName,
      promptpayName,
      bankCode,
      bankName,
      truemoneyPhone,
      minAmount: streamer.minAmount ?? 5,
      presetAmounts: streamer.presetAmounts,
      enableAutoSlip: streamer.enableAutoSlip ?? true,
      slipApiKey: streamer.slipApiKey || '',
      slipBranchId: streamer.slipBranchId || '',
      webhookUrl: streamer.webhookUrl || '',
      promptpayQR,
    },
  });
}

const paymentSchema = z.object({
  promptpayId: z.string().optional().nullable(),
  promptpayTarget: z.string().optional().nullable(),
  accountName: z.string().optional().nullable(),
  promptpayName: z.string().optional().nullable(),
  bankCode: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  truemoneyPhone: z.string().optional().nullable(),
  minAmount: z.coerce.number().min(1).optional(),
  presetAmounts: z.union([z.array(z.coerce.number()), z.string()]).optional(),
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

async function handleSavePayment(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  }

  const streamer = await findOrCreateSessionStreamer(session);
  if (!streamer) {
    return NextResponse.json({ error: 'ไม่พบข้อมูลสตรีมเมอร์' }, { status: 404 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = paymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
  }

  const data = parsed.data;
  const updateData: any = {};

  const resolvedPromptPay = (data.promptpayId !== undefined ? data.promptpayId : data.promptpayTarget)?.trim() || null;
  const resolvedAccountName = (data.accountName !== undefined ? data.accountName : data.promptpayName)?.trim() || null;
  const resolvedBank = (data.bankCode !== undefined ? data.bankCode : data.bankName)?.trim() || null;
  const resolvedTrueMoney = data.truemoneyPhone !== undefined ? data.truemoneyPhone?.trim() || null : undefined;

  if (data.promptpayId !== undefined || data.promptpayTarget !== undefined) {
    updateData.promptpayId = resolvedPromptPay;
    updateData.promptpayTarget = resolvedPromptPay;
  }
  if (data.accountName !== undefined || data.promptpayName !== undefined) {
    updateData.accountName = resolvedAccountName;
    updateData.promptpayName = resolvedAccountName;
  }
  if (data.bankCode !== undefined || data.bankName !== undefined) {
    updateData.bankCode = resolvedBank;
    updateData.bankName = resolvedBank;
  }
  if (resolvedTrueMoney !== undefined) {
    updateData.truemoneyPhone = resolvedTrueMoney;
  }
  if (data.minAmount !== undefined) {
    updateData.minAmount = data.minAmount;
  }
  if (data.presetAmounts !== undefined) {
    updateData.presetAmounts = Array.isArray(data.presetAmounts)
      ? JSON.stringify(data.presetAmounts)
      : data.presetAmounts;
  }
  if (data.enableAutoSlip !== undefined) {
    updateData.enableAutoSlip = data.enableAutoSlip;
  }
  if (data.slipApiKey !== undefined) {
    updateData.slipApiKey = data.slipApiKey?.trim() || null;
  }
  if (data.slipBranchId !== undefined) {
    updateData.slipBranchId = data.slipBranchId?.trim() || null;
  }
  if (data.webhookUrl !== undefined) {
    updateData.webhookUrl = data.webhookUrl;
  }

  const updatedStreamer = await prisma.streamer.update({
    where: { id: streamer.id },
    data: updateData,
  });

  // Sync to User table if session.user.id exists
  const userId = session.user.id || streamer.userId;
  if (userId) {
    const userUpdateData: any = {};
    if (updateData.promptpayId !== undefined) {
      userUpdateData.promptpayId = updateData.promptpayId;
      userUpdateData.promptpayName = updateData.promptpayName;
      userUpdateData.accountName = updateData.accountName;
    }
    if (updateData.bankCode !== undefined) {
      userUpdateData.bankCode = updateData.bankCode;
      userUpdateData.bankName = updateData.bankName;
    }
    if (updateData.truemoneyPhone !== undefined) {
      userUpdateData.truemoneyPhone = updateData.truemoneyPhone;
    }

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
      }).catch((e) => console.warn('User payment sync warning:', e));
    }
  }

  // Audit log
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'CHANGE_PAYMENT_SETTINGS',
        detail: `Updated payment channels: ${Object.keys(updateData).join(', ')}`,
      },
    });
  } catch (err) {
    console.warn('AuditLog creation warning:', err);
  }

  let promptpayQR: string | null = null;
  const finalPromptPay = updatedStreamer.promptpayId || updatedStreamer.promptpayTarget;
  if (finalPromptPay) {
    try {
      promptpayQR = await generatePromptPayQRCode(finalPromptPay);
    } catch (e) {
      console.warn('handleSavePayment: QR generation failed', e);
    }
  }

  return NextResponse.json({
    success: true,
    message: 'บันทึกการตั้งค่าเรียบร้อยแล้ว',
    data: {
      ...updatedStreamer,
      promptpayId: updatedStreamer.promptpayId || updatedStreamer.promptpayTarget || '',
      promptpayTarget: updatedStreamer.promptpayTarget || updatedStreamer.promptpayId || '',
      accountName: updatedStreamer.accountName || updatedStreamer.promptpayName || '',
      promptpayName: updatedStreamer.promptpayName || updatedStreamer.accountName || '',
      bankCode: updatedStreamer.bankCode || updatedStreamer.bankName || '',
      bankName: updatedStreamer.bankName || updatedStreamer.bankCode || '',
      truemoneyPhone: updatedStreamer.truemoneyPhone || '',
      promptpayQR,
    },
  });
}

export async function POST(req: NextRequest) {
  return handleSavePayment(req);
}

export async function PUT(req: NextRequest) {
  return handleSavePayment(req);
}

export async function PATCH(req: NextRequest) {
  return handleSavePayment(req);
}
