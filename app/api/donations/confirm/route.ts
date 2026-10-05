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

    const streamer = await prisma.streamer.findUnique({ where: { userId: session.user.id } });
    if (!streamer) {
      return NextResponse.json({ success: false, error: 'Streamer not found' }, { status: 404 });
    }

    const { updated, alreadyCompleted } = await prisma.$transaction(
      async (tx) => {
        const donation = await tx.donation.findUnique({
          where: { id: donationId },
        });

        if (!donation) {
          throw new Error('NOT_FOUND');
        }

        if (streamer.id !== donation.streamerId) {
          throw new Error('FORBIDDEN');
        }

        // Idempotency: If already completed, do not increment goal or re-verify
        if (donation.status === 'completed') {
          return { updated: donation, alreadyCompleted: true };
        }

        const updatedDonation = await tx.donation.update({
          where: { id: donationId },
          data: {
            status: 'completed',
            verifiedAt: new Date(),
          },
        });

        // Atomically update goal amount
        await tx.goalSettings.updateMany({
          where: { streamerId: donation.streamerId },
          data: {
            currentAmount: {
              increment: donation.amount,
            },
          },
        });

        return { updated: updatedDonation, alreadyCompleted: false };
      },
      {
        timeout: 10000,
        maxWait: 5000,
      }
    );

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

    // Only broadcast if not previously completed
    if (!alreadyCompleted) {
      broadcastDonation(formattedDonation, updated.isTest);
    }

    return NextResponse.json({
      success: true,
      data: formattedDonation,
      message: alreadyCompleted ? 'รายการนี้ได้รับการยืนยันเรียบร้อยแล้ว' : 'ยืนยันการรับเงินสำเร็จ',
    });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      return NextResponse.json({ success: false, error: 'Donation not found' }, { status: 404 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
