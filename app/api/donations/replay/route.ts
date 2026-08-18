import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { broadcastDonation } from '@/lib/events';

export async function POST(request: NextRequest) {
  try {
    const { donationId } = await request.json();
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
    });

    if (!donation) {
      return NextResponse.json({ success: false, error: 'Donation not found' }, { status: 404 });
    }

    const formattedDonation = {
      id: donation.id,
      streamerId: donation.streamerId,
      donorName: donation.donorName,
      amount: donation.amount,
      message: donation.message || '',
      paymentMethod: donation.paymentMethod as any,
      status: donation.status as any,
      enableTTS: donation.enableTTS,
      isTest: donation.isTest,
      slipImage: donation.slipImage || undefined,
      slipRef: donation.slipRef || undefined,
      slipHash: donation.slipHash || undefined,
      createdAt: donation.createdAt.toISOString(),
    };

    broadcastDonation(formattedDonation, donation.isTest);

    return NextResponse.json({
      success: true,
      message: 'Replayed alert to OBS successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to replay alert' },
      { status: 500 }
    );
  }
}
