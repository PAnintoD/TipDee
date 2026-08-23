import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });

  const streamer = await prisma.streamer.findUnique({
    where: { userId: session.user.id },
  });

  if (!streamer) return NextResponse.json({ error: 'ไม่พบข้อมูลสตรีมเมอร์' }, { status: 404 });

  return NextResponse.json({ success: true, data: streamer });
}

const patchSchema = z.object({
  promptpayTarget: z.string().optional(),
  promptpayName: z.string().optional(),
  bankName: z.string().optional(),
  truemoneyPhone: z.string().optional(),
  minAmount: z.number().min(1).optional(),
  presetAmounts: z.array(z.number()).optional(),
  enableAutoSlip: z.boolean().optional(),
  slipApiKey: z.string().optional(),
  slipBranchId: z.string().optional(),
  webhookUrl: z.string().url().optional().or(z.literal('')),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const data = parsed.data;
  const updateData: any = {};

  if (data.promptpayTarget !== undefined) updateData.promptpayTarget = data.promptpayTarget;
  if (data.promptpayName !== undefined) updateData.promptpayName = data.promptpayName;
  if (data.truemoneyPhone !== undefined) updateData.truemoneyPhone = data.truemoneyPhone;
  if (data.minAmount !== undefined) updateData.minAmount = data.minAmount;
  if (data.presetAmounts !== undefined) updateData.presetAmounts = JSON.stringify(data.presetAmounts);
  if (data.enableAutoSlip !== undefined) updateData.enableAutoSlip = data.enableAutoSlip;
  if (data.slipApiKey !== undefined) updateData.slipApiKey = data.slipApiKey;
  if (data.slipBranchId !== undefined) updateData.slipBranchId = data.slipBranchId;
  if (data.webhookUrl !== undefined) updateData.webhookUrl = data.webhookUrl || null;

  const streamer = await prisma.streamer.update({
    where: { userId: session.user.id },
    data: updateData,
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: 'CHANGE_PAYMENT_SETTINGS',
      detail: `Updated payment channels: ${Object.keys(updateData).join(', ')}`,
    },
  });

  return NextResponse.json({ success: true, data: streamer });
}
