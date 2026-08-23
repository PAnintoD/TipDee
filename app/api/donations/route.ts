import { NextRequest, NextResponse } from 'next/server';
import { getDonations, addDonation, getDonationStats, getTopDonors, getStreamer } from '@/lib/db';
import { broadcastDonation } from '@/lib/events';
import { generatePromptPayQRCode, generatePromptPayPayload } from '@/lib/promptpay';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp, rateLimitExceededResponse } from '@/lib/rateLimit';
import { sanitizeDonorName, sanitizeMessage } from '@/lib/sanitize';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streamerId = searchParams.get('streamerId') || 'streamerza';
    const type = searchParams.get('type');
    const period = (searchParams.get('period') as any) || 'month';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');
    const search = searchParams.get('search');

    if (type === 'stats') {
      const stats = await getDonationStats(streamerId);
      return NextResponse.json({ success: true, data: stats });
    }

    if (type === 'top') {
      const top = await getTopDonors(streamerId, limit, period);
      return NextResponse.json({ success: true, data: top });
    }

    // Build where clause for filtered queries
    const where: any = { streamerId };
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (search) {
      where.OR = [
        { donorName: { contains: search } },
        { message: { contains: search } },
      ];
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const skip = (page - 1) * limit;
    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.donation.count({ where }),
    ]);

    // Aggregate stats for filtered set
    const agg = await prisma.donation.aggregate({
      where,
      _sum: { amount: true },
      _count: true,
    });

    return NextResponse.json({
      success: true,
      data: donations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      totalAmount: agg._sum.amount ?? 0,
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
    const ip = getClientIp(request);

    // Rate limit: max 20 donation submissions per minute per IP
    const rateCheck = checkRateLimit(`donate:${ip}`, 20, 60);
    if (!rateCheck.success) {
      return rateLimitExceededResponse(rateCheck.resetInSeconds);
    }

    const body = await request.json();
    const {
      streamerId = 'streamerza',
      donorName: rawDonorName = 'ผู้ไม่ประสงค์ออกนาม',
      amount,
      message: rawMessage = '',
      paymentMethod = 'promptpay',
      enableTTS = true,
      autoComplete = false,
      voucherUrl = '',
      slipImage = '',
      slipRef = '',
      slipHash = '',
    } = body;

    const donorName = sanitizeDonorName(rawDonorName);
    const message = sanitizeMessage(rawMessage);

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
