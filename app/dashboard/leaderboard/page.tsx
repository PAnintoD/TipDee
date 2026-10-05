'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  Trophy,
  Crown,
  Calendar,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || 'streamerza';

  const [period, setPeriod] = useState<'7days' | '30days' | 'this_month' | 'all'>('30days');
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?streamerId=${username}&period=${period}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data?.topDonors)) {
          setDonors(res.data.topDonors);
        } else {
          setDonors([]);
        }
      })
      .catch((e) => {
        console.error(e);
        setDonors([]);
      })
      .finally(() => setLoading(false));
  }, [username, period]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <Navbar streamerId={username} />

      <div className="flex flex-1">
        <Sidebar streamerId={username} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
                <Trophy className="h-6 w-6 text-amber-500" />
                <span>อันดับผู้โดเนท (Donation Leaderboard)</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                ทำเนียบอันดับผู้สนับสนุนสูงสุดประจำช่องของคุณ
              </p>
            </div>

            {/* Period Filter */}
            <div className="flex items-center gap-2">
              {[
                { id: '7days', label: '7 วันล่าสุด' },
                { id: '30days', label: '30 วันล่าสุด' },
                { id: 'this_month', label: 'เดือนนี้' },
                { id: 'all', label: 'ตลอดกาล' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPeriod(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                    period === tab.id
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
              <span className="text-xs font-medium">กำลังโหลดอันดับผู้สนับสนุน...</span>
            </div>
          ) : donors.length === 0 ? (
            <div className="p-12 rounded-2xl border border-slate-200/80 bg-white text-center space-y-3 shadow-sm">
              <Trophy className="h-12 w-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">ยังไม่มีข้อมูลผู้สนับสนุนในช่วงเวลานี้</h3>
              <p className="text-xs text-slate-500">
                เมื่อมีผู้ชมโดเนทผ่านหน้าช่องของคุณ อันดับ Top Donors จะปรากฏขึ้นที่นี่อัตโนมัติ
              </p>
            </div>
          ) : (
            <>
              {/* Podium for top supporters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Rank 2 */}
                {donors[1] && (
                  <div className="order-2 md:order-1 p-6 rounded-2xl border border-slate-200/80 bg-white text-center space-y-3 flex flex-col justify-end shadow-sm">
                    <div className="text-3xl">🥈</div>
                    <div className="h-14 w-14 mx-auto rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center font-black text-lg text-slate-700 shadow-2xs">
                      {donors[1].name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400">อันดับ 2</span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{donors[1].name}</h3>
                      <p className="text-lg font-black text-slate-800 mt-1">
                        {donors[1].amount.toLocaleString('th-TH')} ฿
                      </p>
                    </div>
                  </div>
                )}

                {/* Rank 1 (Champion) */}
                {donors[0] && (
                  <div className="order-1 md:order-2 p-7 rounded-2xl border border-amber-300 bg-gradient-to-b from-amber-50/70 via-white to-white text-center space-y-3 shadow-md scale-105">
                    <div className="text-4xl animate-bounce">👑</div>
                    <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 border-2 border-yellow-200 flex items-center justify-center font-black text-xl text-white shadow-md">
                      {donors[0].name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
                        🥇 แชมป์เปย์สูงสุด
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{donors[0].name}</h3>
                      <p className="text-2xl font-black text-amber-600 mt-1">
                        {donors[0].amount.toLocaleString('th-TH')} ฿
                      </p>
                    </div>
                  </div>
                )}

                {/* Rank 3 */}
                {donors[2] && (
                  <div className="order-3 md:order-3 p-6 rounded-2xl border border-slate-200/80 bg-white text-center space-y-3 flex flex-col justify-end shadow-sm">
                    <div className="text-3xl">🥉</div>
                    <div className="h-14 w-14 mx-auto rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center font-black text-lg text-amber-800 shadow-2xs">
                      {donors[2].name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400">อันดับ 3</span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{donors[2].name}</h3>
                      <p className="text-lg font-black text-slate-800 mt-1">
                        {donors[2].amount.toLocaleString('th-TH')} ฿
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Full Leaderboard Table */}
              <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-4">
                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="px-5 py-3.5">อันดับ</th>
                        <th className="px-5 py-3.5">ผู้สนับสนุน</th>
                        <th className="px-5 py-3.5">จำนวนครั้ง</th>
                        <th className="px-5 py-3.5 text-right">ยอดโดเนทรวม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {donors.map((d, idx) => {
                        const medals = ['🥇 1', '🥈 2', '🥉 3', '4', '5', '6', '7', '8', '9', '10'];
                        return (
                          <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-5 py-3.5 font-bold text-sm text-slate-700">{medals[idx] || idx + 1}</td>
                            <td className="px-5 py-3.5 font-semibold text-slate-900">{d.name}</td>
                            <td className="px-5 py-3.5 text-slate-500 font-mono">{d.count} ครั้ง</td>
                            <td className="px-5 py-3.5 text-right font-black text-sm text-emerald-600">
                              {d.amount.toLocaleString('th-TH')} ฿
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
