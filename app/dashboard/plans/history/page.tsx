'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { History, ArrowLeft, Receipt, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function PlanHistoryPage() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || 'streamerza';

  const [history] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      <Navbar streamerId={username} />

      <div className="flex flex-1">
        <Sidebar streamerId={username} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/plans"
                className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
                  <History className="h-6 w-6 text-emerald-600" />
                  <span>ประวัติการสมัครแพลน (Subscription Billing History)</span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  ดูรายการใบเสร็จและประวัติการต่ออายุแพลนสตรีมเมอร์ของคุณ
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-4">
            {history.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Receipt className="h-12 w-12 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">ยังไม่มีประวัติการชำระเงินสำหรับแพลน</h3>
                <p className="text-xs text-slate-500">
                  คุณกำลังใช้งานแพลนพื้นฐานฟรี สามารถอัปเกรดเพื่อปลดล็อกฟังก์ชันเพิ่มเติมได้
                </p>
                <div className="pt-2">
                  <Link
                    href="/dashboard/plans"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xs"
                  >
                    <span>ดูแพลนทั้งหมด</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 font-bold">เลขที่ใบเสร็จ</th>
                      <th className="px-5 py-3.5 font-bold">แพลน</th>
                      <th className="px-5 py-3.5 font-bold">จำนวนเงิน</th>
                      <th className="px-5 py-3.5 font-bold">ช่องทางชำระ</th>
                      <th className="px-5 py-3.5 font-bold">สถานะ</th>
                      <th className="px-5 py-3.5 font-bold">วันที่ทำรายการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-emerald-600 font-bold">{item.id}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">{item.plan}</td>
                        <td className="px-5 py-3.5 font-black text-slate-900">{item.amount} ฿</td>
                        <td className="px-5 py-3.5 text-slate-600">{item.method}</td>
                        <td className="px-5 py-3.5 text-slate-500 font-mono">{item.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
