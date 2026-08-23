import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/donations/[id] - Get single donation detail
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const streamer = await prisma.streamer.findUnique({ where: { userId: session.user.id } });
  if (!streamer) return NextResponse.json({ error: 'ไม่พบข้อมูลสตรีมเมอร์' }, { status: 404 });

  const donation = await prisma.donation.findFirst({
    where: { id: params.id, streamerId: streamer.id },
  });

  if (!donation) return NextResponse.json({ error: 'ไม่พบรายการโดเนท' }, { status: 404 });

  return NextResponse.json({ success: true, data: donation });
}

// PATCH /api/donations/[id] - Update donation status (e.g. mark pending as completed)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const streamer = await prisma.streamer.findUnique({ where: { userId: session.user.id } });
  if (!streamer) return NextResponse.json({ error: 'ไม่พบสตรีมเมอร์' }, { status: 404 });

  const body = await req.json();
  const { status } = body;

  if (!['completed', 'pending', 'cancelled'].includes(status)) {
    return NextResponse.json({ error: 'สถานะไม่ถูกต้อง' }, { status: 400 });
  }

  const donation = await prisma.donation.findFirst({
    where: { id: params.id, streamerId: streamer.id },
  });
  if (!donation) return NextResponse.json({ error: 'ไม่พบรายการ' }, { status: 404 });

  const updated = await prisma.donation.update({
    where: { id: params.id },
    data: { status },
  });

  // If marking as completed, trigger broadcast
  if (status === 'completed') {
    const { broadcastDonation } = await import('@/lib/events');
    broadcastDonation(updated as any, false);
  }

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: 'UPDATE_DONATION_STATUS',
      detail: `Donation ${params.id} status changed to ${status}`,
    },
  });

  return NextResponse.json({ success: true, data: updated });
}

// DELETE /api/donations/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const streamer = await prisma.streamer.findUnique({ where: { userId: session.user.id } });
  if (!streamer) return NextResponse.json({ error: 'ไม่พบสตรีมเมอร์' }, { status: 404 });

  const donation = await prisma.donation.findFirst({
    where: { id: params.id, streamerId: streamer.id },
  });
  if (!donation) return NextResponse.json({ error: 'ไม่พบรายการ' }, { status: 404 });

  await prisma.donation.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: 'DELETE_DONATION',
      detail: `Deleted donation ${params.id} (${donation.donorName} / ${donation.amount}฿)`,
    },
  });

  return NextResponse.json({ success: true });
}
