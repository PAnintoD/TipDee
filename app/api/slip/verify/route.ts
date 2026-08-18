import { NextRequest, NextResponse } from 'next/server';
import { verifySlipImage } from '@/lib/slipScanner';
import { addDonation } from '@/lib/db';
import { broadcastDonation } from '@/lib/events';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const streamerId = (formData.get('streamerId') as string) || 'streamerza';
    const donorName = (formData.get('donorName') as string) || 'ผู้ไม่ประสงค์ออกนาม';
    const amount = Number(formData.get('amount')) || 0;
    const message = (formData.get('message') as string) || '';
    const enableTTS = formData.get('enableTTS') === 'true';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'กรุณาแนบไฟล์รูปภาพสลิป' },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุจำนวนเงินที่ถูกต้อง' },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert to base64 for slip proof storage
    const mimeType = file.type || 'image/jpeg';
    const base64Image = `data:${mimeType};base64,${buffer.toString('base64')}`;

    // Verify slip
    const result = await verifySlipImage(buffer, amount, streamerId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'ตรวจสอบสลิปไม่สำเร็จ' },
        { status: 400 }
      );
    }

    // Create completed donation record
    const donation = await addDonation({
      streamerId,
      donorName: donorName.trim() || 'ผู้ไม่ประสงค์ออกนาม',
      amount: Number(amount),
      message: message.trim(),
      paymentMethod: 'slip',
      paymentRef: result.transRef,
      status: 'completed',
      enableTTS,
      isTest: false,
      slipImage: base64Image,
      slipRef: result.transRef,
      slipHash: result.slipHash,
    });

    // Broadcast to OBS and Dashboard immediately!
    broadcastDonation(donation, false);

    return NextResponse.json({
      success: true,
      data: {
        donation,
        slipInfo: result,
      },
      message: 'ตรวจสอบสลิปสำเร็จ แจ้งเตือนขึ้นหน้าจอ OBS เรียบร้อยแล้ว!',
    });
  } catch (error: any) {
    console.error('Slip verification error', error);
    return NextResponse.json(
      { success: false, error: error.message || 'เกิดข้อผิดพลาดในการประมวลผลสลิป' },
      { status: 500 }
    );
  }
}
