'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { StatCard } from '@/components/StatCard';
import { TestAlertModal } from '@/components/TestAlertModal';
import {
  Wallet,
  Calendar,
  TrendingUp,
  Award,
  Tv,
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
  Volume2,
  Bell,
  Sparkles,
  Zap,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session } = useSession();
  const streamerId = (session?.user as any)?.username || (session?.user as any)?.streamerId || 'streamerza';
  const [streamer, setStreamer] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    todayTotal: 0,
    weekTotal: 0,
    monthTotal: 0,
    allTimeTotal: 0,
    totalDonationsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [replayingId, setReplayingId] = useState<string | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [streamerRes, donationsRes] = await Promise.all([
        fetch(`/api/streamer?id=${streamerId}`),
        fetch(`/api/donations?streamerId=${streamerId}`),
      ]);

      const streamerData = await streamerRes.json();
      const donationsData = await donationsRes.json();

      if (streamerData.success) {
        setStreamer(streamerData.data);
        if (streamerData.data.stats) {
          setStats(streamerData.data.stats);
        }
      }

      if (donationsData.success) {
        setDonations(donationsData.data);
      }
    } catch (e) {
      console.error('Error fetching dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup SSE Realtime Connection
    const eventSource = new EventSource(`/api/realtime/${streamerId}`);

    eventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'donation' || payload.type === 'test_alert') {
          // Add donation to list
          if (payload.donation) {
            setDonations((prev) => [payload.donation, ...prev.filter((d) => d.id !== payload.donation.id)]);
            // Refresh stats
            fetchData();
          }
        }
      } catch (err) {
        console.error('SSE parse error', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [streamerId]);

  const copyToClipboard = (text: string, id: string) => {
    if (typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}${text}`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedUrl(id);
      setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  const handleReplay = async (donationId: string) => {
    setReplayingId(donationId);
    try {
      await fetch('/api/donations/replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId, streamerId }),
      });
      setTimeout(() => setReplayingId(null), 1000);
    } catch (err) {
      console.error(err);
      setReplayingId(null);
    }
  };

  const goal = streamer?.goalSettings || {
    title: 'เป้าหมาย: ซื้ออุปกรณ์สตรีมใหม่',
    targetAmount: 10000,
    currentAmount: 0,
  };
  const goalPercentage = Math.min(100, Math.round((goal.currentAmount / (goal.targetAmount || 1)) * 100));

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      <Navbar streamerId={streamerId} />

      <div className="flex flex-1">
        <Sidebar streamerId={streamerId} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-brand-950/60 via-slate-900/80 to-[#111622] p-6 sm:p-8 backdrop-blur-xl">
            <div className="absolute right-0 top-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-3">
                  <Zap className="h-3.5 w-3.5" />
                  <span>ระบบ TipDee พร้อมใช้งานแล้ว</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  ยินดีต้อนรับ, <span className="text-brand-400">{streamer?.displayName || 'StreamerZa TH'}</span> 👋
                </h1>
                <p className="mt-1.5 text-sm text-slate-400">
                  ตรวจสอบสถิติรายได้ ควบคุมวิดเจ็ต OBS และรับแจ้งเตือนแบบเรียลไทม์ได้ที่นี่
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setShowTestModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold border border-white/10 transition-all hover:scale-105 active:scale-95 shadow-md"
                >
                  <Bell className="h-4 w-4 text-brand-400" />
                  <span>ทดสอบยิงแจ้งเตือน</span>
                </button>
                <Link
                  href={`/u/${streamerId}`}
                  target="_blank"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-500/25 transition-all hover:scale-105 active:scale-95"
                >
                  <span>เปิดหน้าโดเนท</span>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="ยอดโดเนทวันนี้"
              value={stats.todayTotal || 0}
              subtitle="อัปเดตแบบเรียลไทม์"
              icon={TrendingUp}
              color="green"
              highlight={true}
            />
            <StatCard
              title="ยอดโดเนทสัปดาห์นี้"
              value={stats.weekTotal || 0}
              subtitle="7 วันที่ผ่านมา"
              icon={Calendar}
              color="blue"
            />
            <StatCard
              title="ยอดโดเนทเดือนนี้"
              value={stats.monthTotal || 0}
              subtitle="ประจำเดือนปัจจุบัน"
              icon={Award}
              color="purple"
            />
            <StatCard
              title="ยอดรวมทั้งหมด"
              value={stats.allTimeTotal || 0}
              subtitle={`จากทั้งหมด ${stats.totalDonationsCount || donations.length} รายการ`}
              icon={Wallet}
              color="amber"
            />
          </div>

          {/* Goal & OBS Widget Quick Setup Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Donation Goal Progress */}
            <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-[#0e1219]/80 p-5 backdrop-blur-md flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-400" />
                  <span>{goal.title || 'เป้าหมายโดเนท'}</span>
                </h3>
                <span className="text-xs font-bold text-brand-400 px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20">
                  {goalPercentage}%
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>ยอดสะสมปัจจุบัน</span>
                  <span className="font-semibold text-white">
                    {goal.currentAmount?.toLocaleString('th-TH')} / {goal.targetAmount?.toLocaleString('th-TH')} ฿
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-3.5 w-full rounded-full bg-slate-800/80 overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-400 transition-all duration-1000 glow-brand"
                    style={{ width: `${goalPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                <Link
                  href="/dashboard/widgets"
                  className="text-slate-400 hover:text-brand-400 font-medium transition-colors"
                >
                  ปรับแต่งเป้าหมาย &rarr;
                </Link>
                <button
                  onClick={() => copyToClipboard(`/widget/goal/${streamerId}`, 'goal')}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                >
                  {copiedUrl === 'goal' ? (
                    <span className="text-brand-400 flex items-center gap-1"><Check className="h-3 w-3" /> คัดลอกแล้ว</span>
                  ) : (
                    <span className="flex items-center gap-1"><Copy className="h-3 w-3" /> ลิงก์ Goal OBS</span>
                  )}
                </button>
              </div>
            </div>

            {/* OBS Widgets URLs Card */}
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#0e1219]/80 p-5 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Tv className="h-4 w-4 text-brand-400" />
                    <span>ลิงก์วิดเจ็ตสำหรับ OBS Studio / Streamlabs</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">ก๊อปปี้ URL เหล่านี้ไปใส่ใน OBS Browser Source (พื้นหลังใส 100%)</p>
                </div>
                <Link
                  href="/dashboard/widgets"
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                >
                  ดูทั้งหมด &rarr;
                </Link>
              </div>

              <div className="space-y-2.5">
                {/* Alert Box URL */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-white/5 text-xs">
                  <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-semibold text-slate-200">Alert Box (ป๊อปอัป + เสียง + TTS):</span>
                    <span className="text-slate-400 font-mono truncate">/widget/alert/{streamerId}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => copyToClipboard(`/widget/alert/${streamerId}`, 'alert')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1"
                      title="คัดลอก URL"
                    >
                      {copiedUrl === 'alert' ? <Check className="h-3.5 w-3.5 text-brand-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span className="text-[11px] hidden sm:inline">{copiedUrl === 'alert' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                    </button>
                    <Link
                      href={`/widget/alert/${streamerId}`}
                      target="_blank"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                      title="เปิดดูหน้า Widget"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Top Donors URL */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-white/5 text-xs">
                  <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                    <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                    <span className="font-semibold text-slate-200">Top Donors (อันดับผู้บริจาค):</span>
                    <span className="text-slate-400 font-mono truncate">/widget/top-donors/{streamerId}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => copyToClipboard(`/widget/top-donors/${streamerId}`, 'top')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1"
                      title="คัดลอก URL"
                    >
                      {copiedUrl === 'top' ? <Check className="h-3.5 w-3.5 text-brand-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span className="text-[11px] hidden sm:inline">{copiedUrl === 'top' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                    </button>
                    <Link
                      href={`/widget/top-donors/${streamerId}`}
                      target="_blank"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                      title="เปิดดูหน้า Widget"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Live Feed & Recent Donations */}
          <div className="rounded-2xl border border-white/10 bg-[#0e1219]/80 p-5 sm:p-6 backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-brand-400" />
                  <span>รายการโดเนทสดล่าสุด (Live Activity Feed)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">รับข้อความและยอดเงินสนับสนุนสดๆ อัปเดตทันทีแบบอัตโนมัติ</p>
              </div>

              <Link
                href="/dashboard/donations"
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
              >
                ดูประวัติทั้งหมด &rarr;
              </Link>
            </div>

            {/* Feed List */}
            {donations.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                ยังไม่มีรายการโดเนทเข้ามา ลองกดปุ่ม <strong>"ทดสอบแจ้งเตือน"</strong> ด้านบนเพื่อจำลองข้อมูล
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {donations.slice(0, 8).map((d) => {
                  const date = new Date(d.createdAt);
                  const timeFormatted = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
                  const isReplaying = replayingId === d.id;

                  return (
                    <div
                      key={d.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-white flex-shrink-0 text-sm shadow-sm">
                          {d.donorName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white">{d.donorName}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-bold border border-brand-500/20">
                              +{d.amount.toLocaleString('th-TH')} ฿
                            </span>
                            <span className="text-[11px] text-slate-500">{timeFormatted}</span>
                            {d.isTest && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                                TEST
                              </span>
                            )}
                          </div>
                          {d.message && (
                            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/5">
                              "{d.message}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleReplay(d.id)}
                          disabled={isReplaying}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-white/5 transition-all active:scale-95 disabled:opacity-50"
                          title="ยิงแจ้งเตือนรายการนี้ซ้ำขึ้น OBS"
                        >
                          <RotateCcw className={`h-3.5 w-3.5 text-brand-400 ${isReplaying ? 'animate-spin' : ''}`} />
                          <span>{isReplaying ? 'กำลังส่ง...' : 'เล่นซ้ำบน OBS'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {showTestModal && (
        <TestAlertModal streamerId={streamerId} onClose={() => setShowTestModal(false)} />
      )}
    </div>
  );
}
