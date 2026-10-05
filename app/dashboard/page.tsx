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
  const { data: session, status } = useSession();
  const streamerId = (session?.user as any)?.username || (session?.user as any)?.streamerId || (status === 'unauthenticated' ? 'streamerza' : '');
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
    if (status === 'loading') return;
    const targetId = streamerId || 'streamerza';
    try {
      const [streamerRes, donationsRes] = await Promise.all([
        fetch(`/api/streamer?id=${targetId}`),
        fetch(`/api/donations?streamerId=${targetId}`),
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
    if (status === 'loading') return;
    const targetId = streamerId || 'streamerza';
    fetchData();

    // Setup SSE Realtime Connection
    const eventSource = new EventSource(`/api/realtime/${targetId}`);

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
  }, [streamerId, status]);

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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      <Navbar streamerId={streamerId} />

      <div className="flex flex-1">
        <Sidebar streamerId={streamerId} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium mb-2.5">
                  <Zap className="h-3 w-3" />
                  <span>ระบบ TipDee Studio พร้อมใช้งาน</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  ยินดีต้อนรับ, <span className="text-emerald-600">{streamer?.displayName || 'StreamerZa TH'}</span>
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  ตรวจสอบสถิติรายได้ ควบคุมวิดเจ็ต OBS และรับแจ้งเตือนแบบเรียลไทม์ได้ที่นี่
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setShowTestModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium border border-slate-200 transition-colors shadow-2xs"
                >
                  <Bell className="h-4 w-4 text-emerald-600" />
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
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs sm:text-sm font-medium border border-amber-200 transition-colors shadow-2xs"
                  title="หยุดเสียงและข้ามการแจ้งเตือนที่กำลังเล่นอยู่บน OBS ทันที"
                >
                  <Volume2 className="h-4 w-4 text-amber-600" />
                  <span>ข้ามแจ้งเตือน</span>
                </button>

                <Link
                  href={`/u/${streamerId}`}
                  target="_blank"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
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
            <div className="lg:col-span-1 rounded-xl border border-slate-200/80 bg-white p-5 flex flex-col justify-between space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-600" />
                  <span>{goal.title || 'เป้าหมายโดเนท'}</span>
                </h3>
                <span className="text-xs font-bold text-emerald-700 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 tabular-nums">
                  {goalPercentage}%
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-2 tabular-nums">
                  <span>ยอดสะสมปัจจุบัน</span>
                  <span className="font-semibold text-slate-900">
                    {goal.currentAmount?.toLocaleString('th-TH')} / {goal.targetAmount?.toLocaleString('th-TH')} ฿
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${goalPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <Link
                  href="/dashboard/widgets"
                  className="text-slate-600 hover:text-emerald-600 font-medium transition-colors"
                >
                  ปรับแต่งเป้าหมาย &rarr;
                </Link>
                <button
                  onClick={() => copyToClipboard(`/widget/goal/${streamerId}`, 'goal')}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {copiedUrl === 'goal' ? (
                    <span className="text-emerald-600 flex items-center gap-1"><Check className="h-3 w-3" /> คัดลอกแล้ว</span>
                  ) : (
                    <span className="flex items-center gap-1"><Copy className="h-3 w-3" /> ลิงก์ Goal OBS</span>
                  )}
                </button>
              </div>
            </div>

            {/* OBS Widgets URLs Card */}
            <div className="lg:col-span-2 rounded-xl border border-slate-200/80 bg-white p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Tv className="h-4 w-4 text-emerald-600" />
                    <span>ลิงก์วิดเจ็ตสำหรับ OBS Studio / Streamlabs</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">คัดลอก URL ไปใส่ใน OBS Browser Source (พื้นหลังโปร่งใส 100%)</p>
                </div>
                <Link
                  href="/dashboard/widgets"
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  ดูทั้งหมด &rarr;
                </Link>
              </div>

              <div className="space-y-2">
                {/* Alert Box URL */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span className="font-medium text-slate-800">Alert Box (ป๊อปอัป + เสียง + TTS):</span>
                    <span className="text-slate-500 font-mono truncate">/widget/alert/{streamerId}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => copyToClipboard(`/widget/alert/${streamerId}`, 'alert')}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1 text-[11px] shadow-2xs"
                      title="คัดลอก URL"
                    >
                      {copiedUrl === 'alert' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      <span className="hidden sm:inline">{copiedUrl === 'alert' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                    </button>
                    <Link
                      href={`/widget/alert/${streamerId}`}
                      target="_blank"
                      className="p-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
                      title="เปิดดูหน้า Widget"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Top Donors URL */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                    <span className="font-medium text-slate-800">Top Donors (อันดับผู้บริจาค):</span>
                    <span className="text-slate-500 font-mono truncate">/widget/top-donors/{streamerId}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => copyToClipboard(`/widget/top-donors/${streamerId}`, 'top')}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1 text-[11px] shadow-2xs"
                      title="คัดลอก URL"
                    >
                      {copiedUrl === 'top' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      <span className="hidden sm:inline">{copiedUrl === 'top' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                    </button>
                    <Link
                      href={`/widget/top-donors/${streamerId}`}
                      target="_blank"
                      className="p-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
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
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  <span>รายการโดเนทสดล่าสุด (Live Activity Feed)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">รับข้อความและยอดเงินสนับสนุนสดๆ อัปเดตทันทีแบบอัตโนมัติ</p>
              </div>

              <Link
                href="/dashboard/donations"
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                ดูประวัติทั้งหมด &rarr;
              </Link>
            </div>

            {/* Feed List */}
            {donations.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                ยังไม่มีรายการโดเนทเข้ามา ลองกดปุ่ม <strong>"ทดสอบยิงแจ้งเตือน"</strong> ด้านบนเพื่อจำลองข้อมูล
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {donations.slice(0, 8).map((d) => {
                  const date = new Date(d.createdAt);
                  const timeFormatted = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
                  const isReplaying = replayingId === d.id;

                  return (
                    <div
                      key={d.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-emerald-200">
                          {d.donorName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-900">{d.donorName}</span>
                            <span className="text-xs px-2 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 tabular-nums">
                              +{d.amount.toLocaleString('th-TH')} ฿
                            </span>
                            <span className="text-[11px] text-slate-400">{timeFormatted}</span>
                            {d.isTest && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                                TEST
                              </span>
                            )}
                          </div>
                          {d.message && (
                            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200/80">
                              "{d.message}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleReplay(d.id)}
                          disabled={isReplaying}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors disabled:opacity-50 shadow-2xs"
                          title="ยิงแจ้งเตือนรายการนี้ซ้ำขึ้น OBS"
                        >
                          <RotateCcw className={`h-3 w-3 text-emerald-600 ${isReplaying ? 'animate-spin' : ''}`} />
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
