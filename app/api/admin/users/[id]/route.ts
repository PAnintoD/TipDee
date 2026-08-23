import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { active, role, resetTwoFactor } = body;

    const dataToUpdate: any = {};
    if (active !== undefined) dataToUpdate.active = Boolean(active);
    if (role !== undefined && ['USER', 'ADMIN'].includes(role)) dataToUpdate.role = role;
    if (resetTwoFactor) {
      dataToUpdate.twoFactorEnabled = false;
      dataToUpdate.twoFactorSecret = null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'ADMIN_UPDATE_USER',
        detail: `Admin updated user ${params.id} (${updatedUser.email}): active=${updatedUser.active}, role=${updatedUser.role}`,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    // Protect admin self-deletion
    if (session.user.id === params.id) {
      return NextResponse.json({ error: 'ไม่สามารถลบบัญชีของตนเองได้' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: params.id } });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'ADMIN_DELETE_USER',
        detail: `Admin deleted user ${params.id} (${user.email})`,
      },
    });

    return NextResponse.json({ success: true, message: 'ลบผู้ใช้เรียบร้อยแล้ว' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 });
  }
}
