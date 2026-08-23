import { NextRequest, NextResponse } from 'next/server';
import { verifySlipImage } from '@/lib/slipScanner';
import { addDonation } from '@/lib/db';
import { broadcastDonation } from '@/lib/events';
import { checkRateLimit, getClientIp, rateLimitExceededResponse } from '@/lib/rateLimit';
import { sanitizeDonorName, sanitizeMessage } from '@/lib/sanitize';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // Rate limit: max 8 verify requests per minute per IP
    const rateCheck = checkRateLimit(`slip:${ip}`, 8, 60);
    if (!rateCheck.success) {
      return rateLimitExceededResponse(rateCheck.resetInSeconds);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const rawStreamerId = (formData.get('streamerId') as string) || 'streamerza';
    const rawDonorName = (formData.get('donorName') as string) || 'ผู้ไม่ประสงค์ออกนาม';
    const amount = Number(formData.get('amount')) || 0;
    const rawMessage = (formData.get('message') as string) || '';
    const enableTTS = formData.get('enableTTS') === 'true';

    // Sanitize user inputs
    const donorName = sanitizeDonorName(rawDonorName);
    const message = sanitizeMessage(rawMessage);

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'กรุณาแนบไฟล์รูปภาพสลิป' },
        { status: 400 }
      );
    }

    // Check file size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'ไฟล์รูปภาพสลิปมีขนาดใหญ่เกินไป (จำกัดไม่เกิน 8MB)' },
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

    // Lookup streamer by username or id
    const streamer = await prisma.streamer.findFirst({
      where: {
        OR: [{ id: rawStreamerId }, { username: rawStreamerId }],
      },
    });

    const activeStreamerId = streamer?.id || rawStreamerId;

    // Verify slip
    const result = await verifySlipImage(buffer, amount, activeStreamerId);

    if (!result.success) {
      // Log suspicious / duplicate attempts
      try {
        await prisma.auditLog.create({
          data: {
            action: 'SLIP_VERIFICATION_FAILED',
            detail: `IP: ${ip} | Streamer: ${activeStreamerId} | Reason: ${result.error || 'Failed'}`,
            ipAddress: ip,
          },
        });
      } catch {}

      return NextResponse.json(
        { success: false, error: result.error || 'ตรวจสอบสลิปไม่สำเร็จ' },
        { status: 400 }
      );
    }

    // Create completed donation record
    const donation = await addDonation({
      streamerId: activeStreamerId,
      donorName,
      amount: Number(amount),
      message,
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
