import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { broadcastDonation } from '@/lib/events';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const { donationId } = await request.json();
    if (!donationId) {
      return NextResponse.json({ success: false, error: 'Missing donationId' }, { status: 400 });
    }

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
    });

    if (!donation) {
      return NextResponse.json({ success: false, error: 'Donation not found' }, { status: 404 });
    }
    const streamer = await prisma.streamer.findUnique({ where: { userId: session.user.id } });
    if (!streamer || streamer.id !== donation.streamerId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.donation.update({
      where: { id: donationId },
      data: {
        status: 'completed',
        verifiedAt: new Date(),
      },
    });

    // Update goal amount
    try {
      await prisma.goalSettings.updateMany({
        where: { streamerId: donation.streamerId },
        data: {
          currentAmount: {
            increment: donation.amount,
          },
        },
      });
    } catch (e) {}

    const formattedDonation = {
      id: updated.id,
      streamerId: updated.streamerId,
      donorName: updated.donorName,
      amount: updated.amount,
      message: updated.message || '',
      paymentMethod: updated.paymentMethod as any,
      status: 'completed' as const,
      enableTTS: updated.enableTTS,
      isTest: updated.isTest,
      slipImage: updated.slipImage || undefined,
      slipRef: updated.slipRef || undefined,
      slipHash: updated.slipHash || undefined,
      createdAt: updated.createdAt.toISOString(),
    };

    broadcastDonation(formattedDonation, updated.isTest);

    return NextResponse.json({
      success: true,
      data: formattedDonation,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
