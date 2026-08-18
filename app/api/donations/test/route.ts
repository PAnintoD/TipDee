import { NextRequest, NextResponse } from 'next/server';
import { addDonation } from '@/lib/db';
import { broadcastDonation } from '@/lib/events';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      streamerId = 'streamerza',
      donorName = 'Tester Gamer 🚀',
      amount = 100,
      message = 'ทดสอบระบบแจ้งเตือน EasyDonate โดเนทสำเร็จ เสียง TTS และภาพแสดงผลปกติ!',
      enableTTS = true,
    } = body;

    const testDonation = {
      id: `test_${Date.now()}`,
      streamerId,
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
