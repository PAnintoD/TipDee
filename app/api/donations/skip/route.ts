import { NextRequest, NextResponse } from 'next/server';
import { donationEmitter } from '@/lib/events';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const owner = await prisma.streamer.findUnique({ where: { userId: session.user.id } });
    if (!owner) return NextResponse.json({ success: false, error: 'Streamer not found' }, { status: 404 });
    const streamerId = owner.id;

    // Resolve both id and username
    const streamer = await prisma.streamer.findFirst({
      where: { OR: [{ id: streamerId }, { username: streamerId }] },
    });

    const eventData = {
      type: 'skip_alert',
      timestamp: new Date().toISOString(),
    };

    if (streamer) {
      donationEmitter.emit(`streamer:${streamer.id}`, eventData);
      donationEmitter.emit(`streamer:${streamer.username}`, eventData);
    } else {
      donationEmitter.emit(`streamer:${streamerId}`, eventData);
    }

    return NextResponse.json({ success: true, message: 'ส่งสัญญาณข้ามแจ้งเตือนไปยัง OBS เรียบร้อยแล้ว' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to skip alert' }, { status: 500 });
  }
}
