import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing donation ID' }, { status: 400 });
    }

    await prisma.donation.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'ลบรายการโดเนทสำเร็จ',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
