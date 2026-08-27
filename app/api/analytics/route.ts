import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    let streamerId = searchParams.get('streamerId');
    const period = searchParams.get('period') || '30days'; // '7days', '30days', 'this_month', 'all'

    if (!streamerId) {
      const streamer = await prisma.streamer.findUnique({ where: { userId: session.user.id } });
      streamerId = streamer?.id || streamer?.username || 'streamerza';
    }

    // Resolve actual streamer ID
    const streamer = await prisma.streamer.findFirst({
      where: {
        OR: [{ id: streamerId }, { username: streamerId }],
      },
    });

    const activeStreamerId = streamer?.id || streamerId;
    const ownedStreamer = await prisma.streamer.findUnique({ where: { userId: session.user.id } });
    if (!ownedStreamer || ownedStreamer.id !== activeStreamerId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Calculate Date Range
    const now = new Date();
    let startDate = new Date();

    if (period === '7days') {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === '30days') {
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      // all time (e.g. 1 year)
      startDate = new Date(2020, 0, 1);
    }

    // Fetch all completed donations in period
    const donations = await prisma.donation.findMany({
      where: {
        streamerId: activeStreamerId,
        status: 'completed',
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Total metrics
    const totalRevenue = donations.reduce((sum, d) => sum + d.amount, 0);
    const totalTransactions = donations.length;
    const averageDonation = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;

    // Payment methods breakdown
    const methodCounts: Record<string, { amount: number; count: number }> = {
      promptpay: { amount: 0, count: 0 },
      slip: { amount: 0, count: 0 },
      truemoney: { amount: 0, count: 0 },
      test: { amount: 0, count: 0 },
    };

    // Hourly distribution
    const hourlyCounts = new Array(24).fill(0);

    // Daily breakdown for charts
    const dailyMap = new Map<string, { date: string; amount: number; count: number }>();

    // Initialize days in range if 7 or 30 days
    const dayCount = period === '7days' ? 7 : period === '30days' ? 30 : 14;
    for (let i = dayCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyMap.set(key, { date: key, amount: 0, count: 0 });
    }

    // Donor map for top supporters
    const donorMap = new Map<string, { name: string; amount: number; count: number }>();

    donations.forEach((d) => {
      // Method stats
      const method = d.paymentMethod || 'promptpay';
      if (!methodCounts[method]) methodCounts[method] = { amount: 0, count: 0 };
      methodCounts[method].amount += d.amount;
      methodCounts[method].count += 1;

      // Hourly stats
      const hour = new Date(d.createdAt).getHours();
      hourlyCounts[hour] += 1;

      // Daily stats
      const dateKey = new Date(d.createdAt).toISOString().slice(0, 10);
      const existing = dailyMap.get(dateKey) || { date: dateKey, amount: 0, count: 0 };
      existing.amount += d.amount;
      existing.count += 1;
      dailyMap.set(dateKey, existing);

      // Donor stats
      const donorKey = d.donorName || 'ผู้ไม่ประสงค์ออกนาม';
      const existingDonor = donorMap.get(donorKey) || { name: donorKey, amount: 0, count: 0 };
      existingDonor.amount += d.amount;
      existingDonor.count += 1;
      donorMap.set(donorKey, existingDonor);
    });

    // Top donors in period
    const topDonors = Array.from(donorMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Peak hour
    let peakHour = 0;
    let peakCount = 0;
    hourlyCounts.forEach((cnt, hr) => {
      if (cnt > peakCount) {
        peakCount = cnt;
        peakHour = hr;
      }
    });

    const methodDistribution = Object.entries(methodCounts).map(([method, data]) => ({
      method,
      amount: data.amount,
      count: data.count,
      percentage: totalRevenue > 0 ? Math.round((data.amount / totalRevenue) * 100) : 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        period,
        totalRevenue,
        totalTransactions,
        averageDonation,
        peakHourFormatted: `${String(peakHour).padStart(2, '0')}:00 - ${String((peakHour + 1) % 24).padStart(2, '0')}:00 น.`,
        dailyStats: Array.from(dailyMap.values()),
        methodDistribution,
        topDonors,
      },
    });
  } catch (error: any) {
    console.error('Analytics API error', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}
