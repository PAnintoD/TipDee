import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Shield, Users, AlertTriangle, Activity, Ban, CheckCircle } from 'lucide-react';

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [totalUsers, totalStreamers, recentLogs, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.streamer.count(),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20, include: { user: true } }),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { streamer: true } }),
  ]);

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-red-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-slate-400 text-sm">ระบบจัดการแพลตฟอร์ม TipDee</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'ผู้ใช้ทั้งหมด', value: totalUsers, icon: Users, color: 'text-blue-400' },
            { label: 'สตรีมเมอร์', value: totalStreamers, icon: Activity, color: 'text-brand-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-900 border border-white/10 rounded-xl p-5">
              <stat.icon className={`h-6 w-6 ${stat.color} mb-2`} />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-400" /> ผู้ใช้ล่าสุด
            </h2>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-2 border-b border-white/5">
                  <div>
                    <p className="text-sm text-white font-medium">{user.name ?? user.email}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    {user.streamer && <p className="text-xs text-brand-400">@{user.streamer.username}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${user.active ? 'bg-brand-500/20 text-brand-400' : 'bg-red-500/20 text-red-400'}`}>
                      {user.active ? 'Active' : 'Banned'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{user.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Log */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-yellow-400" /> Audit Log ล่าสุด
            </h2>
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-white/5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{log.action}</p>
                    <p className="text-xs text-slate-500 truncate">{log.detail}</p>
                    {log.user && <p className="text-xs text-brand-400">{log.user.email}</p>}
                  </div>
                  <p className="text-xs text-slate-600 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
