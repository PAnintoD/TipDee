import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const where: any = {};
    if (search.trim()) {
      where.OR = [
        { displayName: { contains: search } },
        { username: { contains: search } },
        { bio: { contains: search } },
      ];
    }

    const streamers = await prisma.streamer.findMany({
      where,
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        donations: {
          where: { status: 'completed' },
          select: { amount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const formatted = streamers.map((s) => {
      const totalAmount = s.donations.reduce((sum, d) => sum + d.amount, 0);
      return {
        id: s.id,
        username: s.username,
        displayName: s.displayName || s.username,
        bio: s.bio || 'ยินดีต้อนรับสู่หน้าโดเนทของฉันครับ',
        avatar: s.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${s.username}`,
        totalDonations: `${totalAmount.toLocaleString('th-TH')} ฿`,
        createdAt: s.createdAt,
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
