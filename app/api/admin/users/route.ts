import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const active = searchParams.get('active');

    const where: any = {};
    if (role) where.role = role;
    if (active !== null && active !== undefined && active !== '') {
      where.active = active === 'true';
    }
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
        { streamer: { username: { contains: search } } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        streamer: {
          select: {
            id: true,
            username: true,
            displayName: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 });
  }
}
