import { NextRequest, NextResponse } from 'next/server';
import { getStreamer, updateStreamer, getDonationStats } from '@/lib/db';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streamerId = searchParams.get('id') || 'streamerza';
    const streamer = await getStreamer(streamerId);
    const stats = await getDonationStats(streamerId);

    const session = await auth();
    const ownedStreamer = session?.user?.id
      ? await prisma.streamer.findUnique({ where: { userId: session.user.id } })
      : null;
    const isOwner = ownedStreamer?.id === streamer.id;
    const { slipApiKey, slipBranchId, webhookUrl, widgetToken, ...publicStreamer } = streamer as any;

    return NextResponse.json({
      success: true,
      data: {
        ...(isOwner ? streamer : publicStreamer),
        stats,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch streamer data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const owner = await prisma.streamer.findUnique({ where: { userId: session.user.id } });
    if (!owner) return NextResponse.json({ success: false, error: 'Streamer not found' }, { status: 404 });
    const streamerId = owner.id;
    
    const updated = await updateStreamer(streamerId, body);
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update streamer data' },
      { status: 500 }
    );
  }
}
