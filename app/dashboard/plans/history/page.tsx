'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { History, ArrowLeft, CheckCircle2, Receipt, Download } from 'lucide-react';
import Link from 'next/link';

export default function PlanHistoryPage() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || 'streamerza';

  const history = [
    {
      id: 'INV-2026-08',
      plan: 'Streamer Pro',
      amount: 99,
      date: '2026-08-23',
      method: 'PromptPay QR',
      status: 'ชำระแล้ว',
      nextBilling: '2026-09-23',
    },
    {
      id: 'INV-2026-07',
      plan: 'Streamer Pro',
      amount: 99,
      date: '2026-07-23',
      method: 'PromptPay QR',
      status: 'ชำระแล้ว',
      nextBilling: '2026-08-23',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      <Navbar streamerId={username} />

      <div className="flex flex-1">
        <Sidebar streamerId={username} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/plans"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
                  <History className="h-6 w-6 text-brand-400" />
                  <span>ประวัติการสมัครแพลน (Subscription Billing History)</span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  ดูรายการใบเสร็จและประวัติการต่ออายุแพลนสตรีมเมอร์ของคุณ
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-2xl space-y-4">
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-white/5">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">เลขที่ใบเสร็จ</th>
                    <th className="px-5 py-3.5 font-bold">แพลน</th>
                    <th className="px-5 py-3.5 font-bold">จำนวนเงิน</th>
                    <th className="px-5 py-3.5 font-bold">ช่องทางชำระ</th>
                    <th className="px-5 py-3.5 font-bold">สถานะ</th>
                    <th className="px-5 py-3.5 font-bold">วันที่ทำรายการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 font-mono text-brand-400 font-bold">{item.id}</td>
                      <td className="px-5 py-3.5 font-bold text-white">{item.plan}</td>
                      <td className="px-5 py-3.5 font-black text-white">{item.amount} ฿</td>
                      <td className="px-5 py-3.5 text-slate-300">{item.method}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" /> {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 font-mono">{item.date}</td>
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
