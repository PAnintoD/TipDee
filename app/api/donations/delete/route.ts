import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing donation ID' }, { status: 400 });
    }

    const streamer = await prisma.streamer.findUnique({ where: { userId: session.user.id } });
    const donation = streamer && await prisma.donation.findFirst({ where: { id, streamerId: streamer.id } });
    if (!donation) return NextResponse.json({ success: false, error: 'Donation not found' }, { status: 404 });
    await prisma.donation.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'ลบรายการโดเนทสำเร็จ',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
