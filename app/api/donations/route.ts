import { NextRequest, NextResponse } from 'next/server';
import { getDonations, addDonation, getDonationStats, getTopDonors, getStreamer } from '@/lib/db';
import { broadcastDonation } from '@/lib/events';
import { generatePromptPayQRCode, generatePromptPayPayload } from '@/lib/promptpay';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streamerId = searchParams.get('streamerId') || 'streamerza';
    const type = searchParams.get('type');
    const period = (searchParams.get('period') as any) || 'month';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (type === 'stats') {
      const stats = await getDonationStats(streamerId);
      return NextResponse.json({ success: true, data: stats });
    }

    if (type === 'top') {
      const top = await getTopDonors(streamerId, limit, period);
      return NextResponse.json({ success: true, data: top });
    }

    const donations = await getDonations(streamerId);
    return NextResponse.json({
      success: true,
      data: donations,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      streamerId = 'streamerza',
      donorName = 'ผู้ไม่ประสงค์ออกนาม',
      amount,
      message = '',
      paymentMethod = 'promptpay',
      enableTTS = true,
      autoComplete = false,
      voucherUrl = '',
      slipImage = '',
      slipRef = '',
      slipHash = '',
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุจำนวนเงินที่ถูกต้อง' },
        { status: 400 }
      );
    }

    const streamer = await getStreamer(streamerId);
    if (amount < (streamer.minAmount || 1)) {
      return NextResponse.json(
        { success: false, error: `ยอดบริจาคขั้นต่ำคือ ${streamer.minAmount} บาท` },
        { status: 400 }
      );
    }

    let qrDataUrl = '';
    let qrPayload = '';
    let status: 'completed' | 'pending' = 'pending';

    if (paymentMethod === 'promptpay') {
      const target = streamer.promptpayTarget || '0812345678';
      qrPayload = generatePromptPayPayload(target, amount);
      qrDataUrl = await generatePromptPayQRCode(target, amount);
      
      if (autoComplete) {
        status = 'completed';
      }
    } else if (paymentMethod === 'slip') {
      // Slip verification was processed
      status = 'completed';
    } else if (paymentMethod === 'truemoney') {
      if (voucherUrl) {
        status = 'completed';
      } else {
        status = autoComplete ? 'completed' : 'pending';
      }
    } else if (paymentMethod === 'test') {
      status = 'completed';
    }

    const donation = await addDonation({
      streamerId,
      donorName: donorName.trim() || 'ผู้ไม่ประสงค์ออกนาม',
      amount: Number(amount),
      message: message.trim(),
      paymentMethod,
      status,
      enableTTS: Boolean(enableTTS),
      isTest: paymentMethod === 'test',
      slipImage: slipImage || undefined,
      slipRef: slipRef || undefined,
      slipHash: slipHash || undefined,
    });

    // If completed, broadcast to OBS and Dashboard
    if (donation.status === 'completed') {
      broadcastDonation(donation, donation.isTest);
    }

    return NextResponse.json({
      success: true,
      data: {
        donation,
        qrDataUrl,
        qrPayload,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process donation' },
      { status: 500 }
    );
  }
}
