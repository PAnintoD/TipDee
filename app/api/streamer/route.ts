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
    const body = await request.json();

    let targetStreamerId: string | null = null;

    if (session?.user?.id) {
      const owner = await prisma.streamer.findUnique({ where: { userId: session.user.id } });
      if (owner) {
        targetStreamerId = owner.id;
      }
    }

    // Fallback: If not found by userId, check body.id (username or streamerId)
    if (!targetStreamerId && body.id) {
      const byBodyId = await prisma.streamer.findFirst({
        where: {
          OR: [{ id: body.id }, { username: body.id }],
        },
      });
      if (byBodyId) {
        targetStreamerId = byBodyId.id;
      }
    }

    // Fallback for default streamer if not logged in
    if (!targetStreamerId && !session?.user?.id) {
      const defaultStreamer = await prisma.streamer.findFirst({ where: { username: 'streamerza' } });
      if (defaultStreamer) {
        targetStreamerId = defaultStreamer.id;
      } else {
        return NextResponse.json({ success: false, error: 'กรุณาเข้าสู่ระบบก่อนทำการบันทึก' }, { status: 401 });
      }
    }

    if (!targetStreamerId) {
      return NextResponse.json({ success: false, error: 'ไม่พบข้อมูลสตรีมเมอร์' }, { status: 404 });
    }

    const updated = await updateStreamer(targetStreamerId, body);
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error('POST /api/streamer error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update streamer data' },
      { status: 500 }
    );
  }
}
