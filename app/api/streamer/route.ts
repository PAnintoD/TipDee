import { NextRequest, NextResponse } from 'next/server';
import { getStreamer, updateStreamer, getDonationStats } from '@/lib/db';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await auth();
    const queryId = searchParams.get('id');

    // Determine streamerId: query param or logged in user username/streamerId or default
    const streamerId =
      queryId ||
      (session?.user as any)?.username ||
      (session?.user as any)?.streamerId ||
      'streamerza';

    const streamer = await getStreamer(streamerId);
    const stats = await getDonationStats(streamerId);

    let ownedStreamer = null;
    if (session?.user) {
      ownedStreamer = await prisma.streamer.findFirst({
        where: {
          OR: [
            ...(session.user.id ? [{ userId: session.user.id }, { id: session.user.id }] : []),
            ...((session.user as any).streamerId ? [{ id: (session.user as any).streamerId }] : []),
            ...((session.user as any).username ? [{ username: (session.user as any).username }] : []),
            ...(session.user.email ? [{ user: { email: session.user.email } }] : []),
          ],
        },
      });
    }

    const isOwner = ownedStreamer?.id === streamer.id || ownedStreamer?.username === streamer.username;
    const { slipApiKey, slipBranchId, webhookUrl, widgetToken, ...publicStreamer } = streamer as any;

    return NextResponse.json({
      success: true,
      data: {
        ...(isOwner ? streamer : publicStreamer),
        stats,
      },
    });
  } catch (error: any) {
    logger.error('GET /api/streamer error', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch streamer data' },
      { status: 500 }
    );
  }
}

async function handleStreamerUpdate(request: NextRequest) {
  try {
    const session = await auth();
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON request body' }, { status: 400 });
    }

    let targetStreamerId: string | null = null;

    if (session?.user) {
      const owner = await prisma.streamer.findFirst({
        where: {
          OR: [
            ...(session.user.id ? [{ userId: session.user.id }, { id: session.user.id }] : []),
            ...((session.user as any).streamerId ? [{ id: (session.user as any).streamerId }] : []),
            ...((session.user as any).username ? [{ username: (session.user as any).username }] : []),
            ...(session.user.email ? [{ user: { email: session.user.email } }] : []),
          ],
        },
      });

      if (owner) {
        targetStreamerId = owner.id;
      } else if (session.user.id) {
        // Auto-create streamer record if missing for authenticated user
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { id: session.user.id },
              ...(session.user.email ? [{ email: session.user.email }] : []),
            ],
          },
        });

        if (dbUser) {
          const baseName = (dbUser.name || dbUser.email?.split('@')[0] || 'streamer')
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '');
          let uniqueName = baseName || 'streamer';
          let count = 1;
          while (await prisma.streamer.findUnique({ where: { username: uniqueName } })) {
            uniqueName = `${baseName}${count++}`;
          }

          const createdStreamer = await prisma.streamer.create({
            data: {
              userId: dbUser.id,
              username: uniqueName,
              displayName: dbUser.name || uniqueName,
            },
          });
          targetStreamerId = createdStreamer.id;
        }
      }
    }

    // Fallback: If not found by session, check body.id (username or streamerId)
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
      return NextResponse.json({ success: false, error: 'ไม่พบข้อมูลสตรีมเมอร์ในระบบ' }, { status: 404 });
    }

    const updated = await updateStreamer(targetStreamerId, body);
    return NextResponse.json({
      success: true,
      message: 'บันทึกการตั้งค่าสตรีมเมอร์เรียบร้อยแล้ว',
      data: updated,
    });
  } catch (error: any) {
    logger.error('Streamer update handler error', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลสตรีมเมอร์ลงฐานข้อมูล',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return handleStreamerUpdate(request);
}

export async function PUT(request: NextRequest) {
  return handleStreamerUpdate(request);
}

export async function PATCH(request: NextRequest) {
  return handleStreamerUpdate(request);
}
