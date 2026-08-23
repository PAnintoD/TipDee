import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  Shield,
  Users,
  Activity,
  Wallet,
  Receipt,
  CheckCircle2,
  Ban,
  ArrowLeft,
  Search,
  ExternalLink,
  ShieldAlert,
  Clock,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { AdminUserTable } from './AdminUserTable';

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Fetch overall platform metrics
  const [
    totalUsers,
    totalStreamers,
    totalDonationsCount,
    donationRevenueAgg,
    recentLogs,
    usersList,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.streamer.count(),
    prisma.donation.count({ where: { status: 'completed' } }),
    prisma.donation.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 25,
      include: { user: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        streamer: {
          select: {
            id: true,
            username: true,
            displayName: true,
            createdAt: true,
          },
        },
      },
    }),
  ]);

  const totalPlatformRevenue = donationRevenueAgg._sum.amount || 0;

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 shadow-lg shadow-red-500/10">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">Admin Backoffice</h1>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/30">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ระบบจัดการผู้ใช้ ความปลอดภัย และตรวจสอบกิจกรรมรวมทั้งแพลตฟอร์ม TipDee
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>กลับสู่หน้าแดชบอร์ด</span>
            </Link>
          </div>
        </div>

        {/* Platform Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>ยอดเงินรวมทั้งแพลตฟอร์ม</span>
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">
              {totalPlatformRevenue.toLocaleString('th-TH')}{' '}
              <span className="text-sm font-bold text-brand-400">฿</span>
            </p>
            <p className="text-[11px] text-emerald-400 font-medium">รวมทุกสตรีมเมอร์ในระบบ</p>
          </div>

          <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>รายการโดเนทสำเร็จ</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">
              {totalDonationsCount.toLocaleString('th-TH')}{' '}
              <span className="text-sm font-bold text-slate-400">รายการ</span>
            </p>
            <p className="text-[11px] text-slate-500">ผ่านการสแกนสลิป / QR Code</p>
          </div>

          <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>ผู้ใช้งานทั้งหมด (Users)</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">
              {totalUsers.toLocaleString('th-TH')}{' '}
              <span className="text-sm font-bold text-slate-400">บัญชี</span>
            </p>
            <p className="text-[11px] text-slate-500">บัญชีสมาชิกที่ลงทะเบียน</p>
          </div>

          <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>สตรีมเมอร์ (Channels)</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">
              {totalStreamers.toLocaleString('th-TH')}{' '}
              <span className="text-sm font-bold text-slate-400">ช่อง</span>
            </p>
            <p className="text-[11px] text-slate-500">ช่องที่เปิดรับโดเนท</p>
          </div>
        </div>

        {/* Interactive User Management Table Component */}
        <AdminUserTable initialUsers={usersList} currentUserId={session.user.id!} />

        {/* Audit Log Explorer */}
        <div className="p-6 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">บันทึกกิจกรรมความปลอดภัย (Security Audit Log)</h3>
            </div>
            <span className="text-xs text-slate-400">25 รายการล่าสุด</span>
          </div>

          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-xs font-mono font-bold">
                      {log.action}
                    </span>
                    {log.user && (
                      <span className="text-xs text-brand-400 font-semibold">{log.user.email}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-mono">{log.detail}</p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-shrink-0">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {new Date(log.createdAt).toLocaleString('th-TH', {
                      timeZone: 'Asia/Bangkok',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
