'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  Building2,
  Users,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Award,
  Wallet,
  TrendingUp,
} from 'lucide-react';

export default function AgencyPage() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || 'streamerza';

  const [agencyName, setAgencyName] = useState('CyberStream Esports');
  const [streamers, setStreamers] = useState([
    { username: 'streamerza', name: 'StreamerZa TH', revShare: 10, totalIncome: 48500 },
    { username: 'panin_todd', name: 'PAnin_ToDD', revShare: 10, totalIncome: 25200 },
    { username: 'micky_pro', name: 'Micky Speedrunner', revShare: 10, totalIncome: 94000 },
  ]);

  const totalAgencyRevenue = streamers.reduce((sum, s) => sum + s.totalIncome, 0);

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      <Navbar streamerId={username} />

      <div className="flex flex-1">
        <Sidebar streamerId={username} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
                <Building2 className="h-6 w-6 text-brand-400" />
                <span>ขอเปิดสังกัด & จัดการสังกัด (Agency & Esports Teams)</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                ระบบดูแลสตรีมเมอร์ในสังกัด รวมยอดรายได้ และแบ่งส่วนแบ่งคอมมิชชัน
              </p>
            </div>

            <button
              onClick={() => alert('ฟอร์มเชิญสตรีมเมอร์เข้าสังกัด')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-500/25 transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              <span>เชิญสตรีมเมอร์เข้าสังกัด</span>
            </button>
          </div>

          {/* Agency Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-xl space-y-2">
              <span className="text-xs text-slate-400">ชื่อสังกัด</span>
              <p className="text-xl font-black text-white">{agencyName}</p>
              <p className="text-[11px] text-brand-400 font-semibold">สถานะ: ยืนยันทางการแล้ว (Verified)</p>
            </div>

            <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-xl space-y-2">
              <span className="text-xs text-slate-400">ยอดเงินรวมทุกช่องในสังกัด</span>
              <p className="text-2xl font-black text-white">
                {totalAgencyRevenue.toLocaleString('th-TH')} <span className="text-sm font-bold text-brand-400">฿</span>
              </p>
              <p className="text-[11px] text-emerald-400 font-medium">รวม 3 ช่องสตรีมเมอร์</p>
            </div>

            <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-xl space-y-2">
              <span className="text-xs text-slate-400">สตรีมเมอร์ในสังกัด</span>
              <p className="text-2xl font-black text-white">
                {streamers.length} <span className="text-sm font-bold text-slate-400">คน</span>
              </p>
              <p className="text-[11px] text-slate-500">สมาชิกสตรีมเมอร์</p>
            </div>
          </div>

          {/* Streamers in Agency Table */}
          <div className="p-6 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-400" />
                <h3 className="text-base font-bold text-white">รายชื่อสตรีมเมอร์ในสังกัด</h3>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-white/5">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">สตรีมเมอร์</th>
                    <th className="px-5 py-3.5 font-bold">Username</th>
                    <th className="px-5 py-3.5 font-bold">ส่วนแบ่งสังกัด (Rev Share)</th>
                    <th className="px-5 py-3.5 font-bold text-right">ยอดโดเนทสะสม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {streamers.map((s) => (
                    <tr key={s.username} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 font-bold text-white">{s.name}</td>
                      <td className="px-5 py-3.5 text-brand-400 font-mono">@{s.username}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-300">{s.revShare}%</td>
                      <td className="px-5 py-3.5 text-right font-black text-sm text-white">
                        {s.totalIncome.toLocaleString('th-TH')} ฿
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
