import { NextRequest, NextResponse } from 'next/server';
import { addDonation } from '@/lib/db';
import { broadcastDonation } from '@/lib/events';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const {
      donorName = 'Tester Gamer 🚀',
      amount = 100,
      message = 'ทดสอบระบบแจ้งเตือน TipDee โดเนทสำเร็จ เสียง TTS และภาพแสดงผลปกติ!',
      enableTTS = true,
    } = body;
    const streamer = await prisma.streamer.findUnique({ where: { userId: session.user.id } });
    if (!streamer) return NextResponse.json({ success: false, error: 'Streamer not found' }, { status: 404 });

    const testDonation = {
      id: `test_${Date.now()}`,
      streamerId: streamer.id,
      donorName: donorName || 'ผู้ทดสอบ',
      amount: Number(amount) || 100,
      message: message || 'ทดสอบระบบแจ้งเตือน OBS Alert',
      paymentMethod: 'test' as const,
      status: 'completed' as const,
      enableTTS: Boolean(enableTTS),
      isTest: true,
      createdAt: new Date().toISOString(),
    };

    // Broadcast test alert to all connected OBS widgets
    broadcastDonation(testDonation, true);

    return NextResponse.json({
      success: true,
      data: testDonation,
      message: 'ส่งการแจ้งเตือนทดสอบไปยัง OBS เรียบร้อยแล้ว',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send test alert' },
      { status: 500 }
    );
  }
}
