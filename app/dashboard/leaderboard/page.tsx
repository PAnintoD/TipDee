'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  Trophy,
  Crown,
  Medal,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Gift,
} from 'lucide-react';

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || 'streamerza';

  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'all'>('month');
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?streamerId=${username}&period=30days`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data?.topDonors) {
          setDonors(res.data.topDonors);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [username, period]);

  const mockDonors = donors.length > 0 ? donors : [
    { name: 'พี่เบิ้ม ใจสปอร์ต', amount: 5000, count: 12 },
    { name: 'น้องแมว ส้มจอมซน', amount: 3200, count: 8 },
    { name: 'สไนเปอร์ สายเปย์', amount: 1500, count: 4 },
    { name: 'FC ช่างแอร์ในตำนาน', amount: 900, count: 3 },
    { name: 'น้องนุ่น ยิ้มหวาน', amount: 500, count: 2 },
  ];

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      <Navbar streamerId={username} />

      <div className="flex flex-1">
        <Sidebar streamerId={username} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
                <Trophy className="h-6 w-6 text-amber-400" />
                <span>อันดับผู้โดเนท (Donation Leaderboard)</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                ทำเนียบอันดับผู้สนับสนุนสูงสุดประจำช่องของคุณ
              </p>
            </div>

            {/* Period Filter */}
            <div className="flex items-center gap-2">
              {[
                { id: 'day', label: 'วันนี้' },
                { id: 'week', label: 'สัปดาห์นี้' },
                { id: 'month', label: 'เดือนนี้' },
                { id: 'all', label: 'ตลอดกาล' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPeriod(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    period === tab.id
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Rank 2 */}
            <div className="order-2 md:order-1 p-6 rounded-3xl border border-white/10 bg-[#0e1219]/90 text-center space-y-3 flex flex-col justify-end">
              <div className="text-3xl">🥈</div>
              <div className="h-14 w-14 mx-auto rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center font-black text-lg text-white">
                {mockDonors[1]?.name?.slice(0, 2) || '2'}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400">อันดับ 2</span>
                <h3 className="text-sm font-bold text-white mt-0.5">{mockDonors[1]?.name || '-'}</h3>
                <p className="text-lg font-black text-slate-200 mt-1">
                  {(mockDonors[1]?.amount || 0).toLocaleString('th-TH')} ฿
                </p>
              </div>
            </div>

            {/* Rank 1 (Champion) */}
            <div className="order-1 md:order-2 p-7 rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-950/30 via-[#121622] to-[#0e1219] text-center space-y-3 shadow-2xl shadow-amber-500/10 scale-105">
              <div className="text-4xl animate-bounce">👑</div>
              <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 border-2 border-yellow-300 flex items-center justify-center font-black text-xl text-black shadow-lg">
                {mockDonors[0]?.name?.slice(0, 2) || '1'}
              </div>
              <div>
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  🥇 แชมป์เปย์สูงสุด
                </span>
                <h3 className="text-base font-extrabold text-white mt-0.5">{mockDonors[0]?.name || '-'}</h3>
                <p className="text-2xl font-black text-amber-300 mt-1">
                  {(mockDonors[0]?.amount || 0).toLocaleString('th-TH')} ฿
                </p>
              </div>
            </div>

            {/* Rank 3 */}
            <div className="order-3 md:order-3 p-6 rounded-3xl border border-white/10 bg-[#0e1219]/90 text-center space-y-3 flex flex-col justify-end">
              <div className="text-3xl">🥉</div>
              <div className="h-14 w-14 mx-auto rounded-full bg-slate-800 border-2 border-amber-700 flex items-center justify-center font-black text-lg text-white">
                {mockDonors[2]?.name?.slice(0, 2) || '3'}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400">อันดับ 3</span>
                <h3 className="text-sm font-bold text-white mt-0.5">{mockDonors[2]?.name || '-'}</h3>
                <p className="text-lg font-black text-slate-200 mt-1">
                  {(mockDonors[2]?.amount || 0).toLocaleString('th-TH')} ฿
                </p>
              </div>
            </div>
          </div>

          {/* Full Leaderboard Table */}
          <div className="p-6 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-2xl space-y-4">
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-white/5">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">อันดับ</th>
                    <th className="px-5 py-3.5 font-bold">ผู้สนับสนุน</th>
                    <th className="px-5 py-3.5 font-bold">จำนวนครั้ง</th>
                    <th className="px-5 py-3.5 font-bold text-right">ยอดโดเนทรวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {mockDonors.map((d, idx) => {
                    const medals = ['🥇 1', '🥈 2', '🥉 3', '4', '5'];
                    return (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5 font-black text-sm text-slate-300">{medals[idx]}</td>
                        <td className="px-5 py-3.5 font-bold text-white">{d.name}</td>
                        <td className="px-5 py-3.5 text-slate-400 font-mono">{d.count || 1} ครั้ง</td>
                        <td className="px-5 py-3.5 text-right font-black text-sm text-brand-400">
                          {d.amount.toLocaleString('th-TH')} ฿
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
