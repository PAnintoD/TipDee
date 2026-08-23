import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  streamerId: z.string(),
  donation: z.object({
    id: z.string(),
    donorName: z.string(),
    amount: z.number(),
    message: z.string().optional(),
    paymentMethod: z.string(),
    createdAt: z.string(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { streamerId, donation } = parsed.data;

    const streamer = await prisma.streamer.findUnique({
      where: { id: streamerId },
      select: { webhookUrl: true },
    });

    if (!streamer?.webhookUrl) {
      return NextResponse.json({ success: false, message: 'ไม่ได้ตั้งค่า Webhook URL' });
    }

    const payload = {
      event: 'donation.completed',
      timestamp: new Date().toISOString(),
      donation,
    };

    const response = await fetch(streamer.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'TipDee-Webhook/1.0' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    return NextResponse.json({
      success: response.ok,
      statusCode: response.status,
      message: response.ok ? 'Webhook ส่งสำเร็จ' : `Webhook ตอบกลับ ${response.status}`,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: `Webhook error: ${err.message}`,
    }, { status: 500 });
  }
}
