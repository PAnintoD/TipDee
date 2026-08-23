'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  TrendingUp,
  Calendar,
  Wallet,
  Receipt,
  Users,
  Clock,
  Download,
  ArrowUpRight,
  QrCode,
  Gift,
  RefreshCw,
  Award,
  BarChart3,
  PieChart,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const streamerId = (session?.user as any)?.username || (session?.user as any)?.streamerId || 'streamerza';

  const [period, setPeriod] = useState<'7days' | '30days' | 'this_month' | 'all'>('30days');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = () => {
    setLoading(true);
    fetch(`/api/analytics?streamerId=${streamerId}&period=${period}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
  }, [streamerId, period]);

  // Export report
  const handleExportReport = () => {
    if (!data || !data.dailyStats) return;

    const headers = ['วันที่', 'ยอดเงินโดเนท(บาท)', 'จำนวนครั้ง'];
    const rows = data.dailyStats.map((d: any) => [`"${d.date}"`, d.amount, d.count].join(','));

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tipdee_analytics_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Find max daily amount for chart scale
  const maxDaily = data?.dailyStats
    ? Math.max(...data.dailyStats.map((d: any) => d.amount), 100)
    : 100;

  const methodNames: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    promptpay: { label: 'PromptPay QR', icon: QrCode, color: 'text-blue-400', bg: 'bg-blue-500' },
    slip: { label: 'สลิปธนาคาร (Auto Slip)', icon: Receipt, color: 'text-emerald-400', bg: 'bg-emerald-500' },
    truemoney: { label: 'TrueMoney Wallet', icon: Gift, color: 'text-amber-400', bg: 'bg-amber-500' },
    test: { label: 'การทดสอบ (Test Mode)', icon: Award, color: 'text-purple-400', bg: 'bg-purple-500' },
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      <Navbar streamerId={streamerId} />

      <div className="flex flex-1">
        <Sidebar streamerId={streamerId} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
                <TrendingUp className="h-6 w-6 text-brand-400" />
                <span>สถิติรายได้ & รายงานการเติบโต (Analytics & Reports)</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                วิเคราะห์ยอดโดเนท แนวโน้มรายรับ และสัดส่วนช่องทางการชำระเงินของช่องคุณ
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={fetchAnalytics}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="รีเฟรชข้อมูล"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={handleExportReport}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-white/10 transition-all hover:scale-105 active:scale-95"
              >
                <Download className="h-4 w-4 text-brand-400" />
                <span>ส่งออกรายงาน CSV</span>
              </button>
            </div>
          </div>

          {/* Period Filter Tabs */}
          <div className="flex items-center gap-2">
            {[
              { id: '7days', label: '7 วันล่าสุด' },
              { id: '30days', label: '30 วันล่าสุด' },
              { id: 'this_month', label: 'เดือนนี้' },
              { id: 'all', label: 'ทั้งหมด' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPeriod(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  period === tab.id
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="p-5 rounded-2xl border border-white/10 bg-[#0e1219]/90 backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>ยอดเงินโดเนททั้งหมด</span>
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
                  <Wallet className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-white">
                {(data?.totalRevenue || 0).toLocaleString('th-TH')}{' '}
                <span className="text-sm font-bold text-brand-400">฿</span>
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>สถานะสำเร็จ 100%</span>
              </div>
            </div>

            {/* Total Transactions */}
            <div className="p-5 rounded-2xl border border-white/10 bg-[#0e1219]/90 backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>จำนวนครั้งที่ได้รับ</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Receipt className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-white">
                {(data?.totalTransactions || 0).toLocaleString('th-TH')}{' '}
                <span className="text-sm font-bold text-slate-400">ครั้ง</span>
              </p>
              <p className="text-[11px] text-slate-500">บันทึกบนระบบ TipDee</p>
            </div>

            {/* Average Donation */}
            <div className="p-5 rounded-2xl border border-white/10 bg-[#0e1219]/90 backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>เฉลี่ยต่อรายการ</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <BarChart3 className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-white">
                {(data?.averageDonation || 0).toLocaleString('th-TH')}{' '}
                <span className="text-sm font-bold text-purple-400">฿</span>
              </p>
              <p className="text-[11px] text-slate-500">ยอดโดเนทต่อผู้ชมเฉลี่ย</p>
            </div>

            {/* Peak Hour */}
            <div className="p-5 rounded-2xl border border-white/10 bg-[#0e1219]/90 backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>ช่วงเวลาโดเนทสูงสุด</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <p className="text-lg sm:text-xl font-bold text-amber-300 truncate">
                {data?.peakHourFormatted || '19:00 - 21:00 น.'}
              </p>
              <p className="text-[11px] text-slate-500">ช่วงที่มีผู้ชมโดเนทคึกคักที่สุด</p>
            </div>
          </div>

          {/* Revenue Chart Section */}
          <div className="p-6 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-2xl backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand-400" />
                <h3 className="text-base font-bold text-white">แนวโน้มยอดเงินโดเนท (Revenue Trend)</h3>
              </div>
              <span className="text-xs text-slate-400">หน่วย: บาท (THB)</span>
            </div>

            {/* Custom Interactive SVG / Bar Chart */}
            <div className="pt-4 pb-2">
              <div className="h-48 sm:h-64 flex items-end gap-1.5 sm:gap-3 w-full">
                {data?.dailyStats?.map((item: any, idx: number) => {
                  const heightPercent = Math.max(8, Math.round((item.amount / maxDaily) * 100));
                  const dateShort = item.date.slice(5); // MM-DD
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 px-2.5 py-1.5 rounded-xl bg-black/90 border border-white/20 text-center pointer-events-none whitespace-nowrap shadow-xl">
                        <p className="text-[10px] text-slate-400">{item.date}</p>
                        <p className="text-xs font-black text-brand-400">{item.amount.toLocaleString()} ฿ ({item.count} ครั้ง)</p>
                      </div>

                      {/* Bar */}
                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-brand-700 via-brand-500 to-emerald-400 group-hover:brightness-125 transition-all shadow-lg shadow-brand-500/10 cursor-pointer"
                        style={{ height: `${heightPercent}%` }}
                      />

                      {/* Date Label */}
                      <span className="text-[10px] text-slate-500 group-hover:text-white transition-colors truncate max-w-[32px] sm:max-w-none">
                        {dateShort}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Two Columns: Payment Breakdown & Top Supporters */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Method Distribution */}
            <div className="p-6 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-brand-400" />
                  <h3 className="text-base font-bold text-white">สัดส่วนช่องทางชำระเงิน</h3>
                </div>
              </div>

              <div className="space-y-3.5 pt-1">
                {data?.methodDistribution?.map((item: any) => {
                  const meta = methodNames[item.method] || { label: item.method, icon: Wallet, color: 'text-white', bg: 'bg-brand-500' };
                  const Icon = meta.icon;
                  return (
                    <div key={item.method} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${meta.color}`} />
                          <span className="text-white">{meta.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">({item.count} ครั้ง)</span>
                          <span className="text-white font-bold">{item.amount.toLocaleString()} ฿</span>
                          <span className="text-brand-400 font-extrabold text-[11px] w-8 text-right">{item.percentage}%</span>
                        </div>
                      </div>

                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${meta.bg} transition-all duration-700`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Supporters Leaderboard */}
            <div className="p-6 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">ผู้สนับสนุนสูงสุดในช่วงนี้</h3>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {(!data?.topDonors || data.topDonors.length === 0) ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    ยังไม่มีข้อมูลผู้สนับสนุนในช่วงเวลานี้
                  </div>
                ) : (
                  data.topDonors.map((donor: any, idx: number) => {
                    const medals = ['🥇', '🥈', '🥉', '4', '5'];
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base font-bold w-6 text-center">{medals[idx]}</span>
                          <div>
                            <p className="text-xs font-bold text-white">{donor.name}</p>
                            <p className="text-[10px] text-slate-400">โดเนทสะสม {donor.count} ครั้ง</p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-brand-400">
                          {donor.amount.toLocaleString('th-TH')} ฿
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
