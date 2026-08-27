import { NextRequest, NextResponse } from 'next/server';
import { triggerStreamerWebhook } from '@/lib/webhook';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  streamerId: z.string(),
  donation: z.object({
    id: z.string(),
    donorName: z.string(),
    amount: z.number(),
    message: z.string().optional(),
    paymentMethod: z.string(),
    createdAt: z.string(),
    isTest: z.boolean().optional(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { streamerId, donation } = parsed.data;
    const streamer = await prisma.streamer.findUnique({ where: { userId: session.user.id } });
    if (!streamer || (streamer.id !== streamerId && streamer.username !== streamerId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const result = await triggerStreamerWebhook(streamerId, donation);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: `Webhook error: ${err.message}`,
      },
      { status: 500 }
    );
  }
}
