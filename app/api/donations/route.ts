import { NextRequest, NextResponse } from 'next/server';
import { getDonations, addDonation, getDonationStats, getTopDonors, getStreamer } from '@/lib/db';
import { broadcastDonation } from '@/lib/events';
import { generatePromptPayQRCode, generatePromptPayPayload } from '@/lib/promptpay';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp, rateLimitExceededResponse } from '@/lib/rateLimit';
import { sanitizeDonorName, sanitizeMessage } from '@/lib/sanitize';
import { triggerStreamerWebhook } from '@/lib/webhook';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedStreamerId = searchParams.get('streamerId');
    const type = searchParams.get('type');
    const period = (searchParams.get('period') as any) || 'month';
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50') || 50, 1), 100);
    const page = parseInt(searchParams.get('page') || '1');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');
    const search = searchParams.get('search');

    const streamer = requestedStreamerId
      ? await prisma.streamer.findFirst({ where: { OR: [{ id: requestedStreamerId }, { username: requestedStreamerId }] } })
      : null;
    const streamerId = streamer?.id;

    if (!streamerId) {
      return NextResponse.json({ success: false, error: 'Streamer not found' }, { status: 404 });
    }

    // Widgets may only read completed, presentation-safe donor information.
    if (type === 'top') {
      const top = await getTopDonors(streamerId, limit, period);
      return NextResponse.json({ success: true, data: top });
    }

    if (type === 'recent') {
      const donations = await prisma.donation.findMany({
        where: { streamerId, status: 'completed' },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, donorName: true, amount: true, message: true, createdAt: true },
      });
      return NextResponse.json({ success: true, data: donations });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const ownedStreamer = await prisma.streamer.findUnique({ where: { userId: session.user.id } });
    if (!ownedStreamer || ownedStreamer.id !== streamerId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    if (type === 'stats') {
      const stats = await getDonationStats(streamerId);
      return NextResponse.json({ success: true, data: stats });
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
    } = body;

    const donorName = sanitizeDonorName(rawDonorName);
    const message = sanitizeMessage(rawMessage);

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุจำนวนเงินที่ถูกต้อง' },
        { status: 400 }
      );
    }

    const streamerRecord = await prisma.streamer.findFirst({
      where: { OR: [{ id: streamerId }, { username: streamerId }] },
      select: { id: true },
    });
    if (!streamerRecord) {
      return NextResponse.json({ success: false, error: 'Streamer not found' }, { status: 404 });
    }
    const activeStreamerId = streamerRecord.id;
    const streamer = await getStreamer(activeStreamerId);
    if (amount < (streamer.minAmount || 1)) {
      return NextResponse.json(
        { success: false, error: `ยอดบริจาคขั้นต่ำคือ ${streamer.minAmount} บาท` },
        { status: 400 }
      );
    }

    let qrDataUrl = '';
    let qrPayload = '';
    let status: 'pending' = 'pending';

    if (paymentMethod === 'promptpay') {
      const target = streamer.promptpayTarget || '0812345678';
      qrPayload = generatePromptPayPayload(target, amount);
      qrDataUrl = await generatePromptPayQRCode(target, amount);
    } else if (paymentMethod === 'truemoney') {
      // A TrueMoney voucher must be verified by a trusted server-side provider.
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported payment method' }, { status: 400 });
    }

    const donation = await addDonation({
      streamerId: activeStreamerId,
      donorName: donorName.trim() || 'ผู้ไม่ประสงค์ออกนาม',
      amount: Number(amount),
      message: message.trim(),
      paymentMethod,
      status,
      enableTTS: Boolean(enableTTS),
      isTest: false,
    });

    // If completed, broadcast to OBS and Dashboard
    if (donation.status === 'completed') {
      broadcastDonation(donation, donation.isTest);

      // Fire Discord / Webhook asynchronously
      triggerStreamerWebhook(activeStreamerId, {
        id: donation.id,
        donorName: donation.donorName,
        amount: donation.amount,
        message: donation.message,
        paymentMethod: donation.paymentMethod,
        createdAt: donation.createdAt,
        isTest: donation.isTest,
      }).catch(() => {});
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
