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
  Target,
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
    <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col">
      <Navbar streamerId={streamerId} />

      <div className="flex flex-1">
        <Sidebar streamerId={streamerId} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c1017] p-5 sm:p-6 shadow-sm">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-2.5">
                  <Zap className="h-3 w-3" />
                  <span>ระบบ TipDee Studio พร้อมใช้งาน</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  ยินดีต้อนรับ, <span className="text-emerald-400">{streamer?.displayName || 'StreamerZa TH'}</span>
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-400">
                  ตรวจสอบสถิติรายได้ ควบคุมวิดเจ็ต OBS และรับแจ้งเตือนแบบเรียลไทม์ได้ที่นี่
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setShowTestModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs sm:text-sm font-medium border border-white/[0.08] transition-colors"
                >
                  <Bell className="h-4 w-4 text-emerald-400" />
                  <span>ทดสอบยิงแจ้งเตือน</span>
                </button>

                <button
                  onClick={async () => {
                    await fetch('/api/donations/skip', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ streamerId }),
                    });
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-medium border border-white/[0.08] transition-colors"
                  title="หยุดเสียงและข้ามการแจ้งเตือนที่กำลังเล่นอยู่บน OBS ทันที"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>ข้ามแจ้งเตือน</span>
                </button>

                <Link
                  href={`/u/${streamerId}`}
                  target="_blank"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-semibold transition-colors shadow-sm"
                >
                  <span>เปิดหน้าโดเนท</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Donation Goal Progress */}
            <div className="lg:col-span-1 rounded-xl border border-white/[0.08] bg-[#0c1017] p-5 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-400" />
                  <span>{goal.title || 'เป้าหมายโดเนท'}</span>
                </h3>
                <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 tabular-nums">
                  {goalPercentage}%
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-2 tabular-nums">
                  <span>ยอดสะสมปัจจุบัน</span>
                  <span className="font-semibold text-white">
                    {goal.currentAmount?.toLocaleString('th-TH')} / {goal.targetAmount?.toLocaleString('th-TH')} ฿
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-2.5 w-full rounded-full bg-slate-800/80 overflow-hidden border border-white/[0.04]">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${goalPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                <Link
                  href="/dashboard/widgets"
                  className="text-slate-400 hover:text-emerald-400 font-medium transition-colors"
                >
                  ปรับแต่งเป้าหมาย &rarr;
                </Link>
                <button
                  onClick={() => copyToClipboard(`/widget/goal/${streamerId}`, 'goal')}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                >
                  {copiedUrl === 'goal' ? (
                    <span className="text-emerald-400 flex items-center gap-1"><Check className="h-3 w-3" /> คัดลอกแล้ว</span>
                  ) : (
                    <span className="flex items-center gap-1"><Copy className="h-3 w-3" /> ลิงก์ Goal OBS</span>
                  )}
                </button>
              </div>
            </div>

            {/* OBS Widgets URLs Card */}
            <div className="lg:col-span-2 rounded-xl border border-white/[0.08] bg-[#0c1017] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Tv className="h-4 w-4 text-emerald-400" />
                    <span>ลิงก์วิดเจ็ตสำหรับ OBS Studio / Streamlabs</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">คัดลอก URL ไปใส่ใน OBS Browser Source (พื้นหลังโปร่งใส 100%)</p>
                </div>
                <Link
                  href="/dashboard/widgets"
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  ดูทั้งหมด &rarr;
                </Link>
              </div>

              <div className="space-y-2">
                {/* Alert Box URL */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs">
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    <span className="font-medium text-slate-200">Alert Box (ป๊อปอัป + เสียง + TTS):</span>
                    <span className="text-slate-400 font-mono truncate">/widget/alert/{streamerId}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => copyToClipboard(`/widget/alert/${streamerId}`, 'alert')}
                      className="px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                      title="คัดลอก URL"
                    >
                      {copiedUrl === 'alert' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span className="hidden sm:inline">{copiedUrl === 'alert' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                    </button>
                    <Link
                      href={`/widget/alert/${streamerId}`}
                      target="_blank"
                      className="p-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors"
                      title="เปิดดูหน้า Widget"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Top Donors URL */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs">
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <span className="h-2 w-2 rounded-full bg-sky-400"></span>
                    <span className="font-medium text-slate-200">Top Donors (อันดับผู้บริจาค):</span>
                    <span className="text-slate-400 font-mono truncate">/widget/top-donors/{streamerId}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => copyToClipboard(`/widget/top-donors/${streamerId}`, 'top')}
                      className="px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                      title="คัดลอก URL"
                    >
                      {copiedUrl === 'top' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span className="hidden sm:inline">{copiedUrl === 'top' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                    </button>
                    <Link
                      href={`/widget/top-donors/${streamerId}`}
                      target="_blank"
                      className="p-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors"
                      title="เปิดดูหน้า Widget"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Live Feed & Recent Donations */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0c1017] p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3.5">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <span>รายการโดเนทสดล่าสุด (Live Activity Feed)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">รับข้อความและยอดเงินสนับสนุนสดๆ อัปเดตทันทีแบบอัตโนมัติ</p>
              </div>

              <Link
                href="/dashboard/donations"
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                ดูประวัติทั้งหมด &rarr;
              </Link>
            </div>

            {/* Feed List */}
            {donations.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                ยังไม่มีรายการโดเนทเข้ามา ลองกดปุ่ม <strong>"ทดสอบยิงแจ้งเตือน"</strong> ด้านบนเพื่อจำลองข้อมูล
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {donations.slice(0, 8).map((d) => {
                  const date = new Date(d.createdAt);
                  const timeFormatted = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
                  const isReplaying = replayingId === d.id;

                  return (
                    <div
                      key={d.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-lg bg-slate-800 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-white/[0.08]">
                          {d.donorName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white">{d.donorName}</span>
                            <span className="text-xs px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 tabular-nums">
                              +{d.amount.toLocaleString('th-TH')} ฿
                            </span>
                            <span className="text-[11px] text-slate-400">{timeFormatted}</span>
                            {d.isTest && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                                TEST
                              </span>
                            )}
                          </div>
                          {d.message && (
                            <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] px-2.5 py-1.5 rounded border border-white/[0.04]">
                              "{d.message}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleReplay(d.id)}
                          disabled={isReplaying}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-medium border border-white/[0.08] transition-colors disabled:opacity-50"
                          title="ยิงแจ้งเตือนรายการนี้ซ้ำขึ้น OBS"
                        >
                          <RotateCcw className={`h-3 w-3 text-emerald-400 ${isReplaying ? 'animate-spin' : ''}`} />
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
