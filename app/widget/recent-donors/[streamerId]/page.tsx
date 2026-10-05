'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Clock, Heart, Sparkles, Radio } from 'lucide-react';

interface RecentDonation {
  id: string;
  donorName: string;
  amount: number;
  message?: string;
  createdAt: string;
}

const DEMO_DONATIONS: RecentDonation[] = [
  { id: '1', donorName: 'Chanon_Official', amount: 500, message: 'สู้ๆ นะครับ สนุกมาก!', createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
  { id: '2', donorName: 'Alice_Wonder', amount: 150, message: 'ชอบคอนเทนต์นี้มากๆ เลยค่ะ', createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString() },
  { id: '3', donorName: 'Warut_Gamer', amount: 300, message: '', createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: '4', donorName: 'NongBaimon', amount: 1000, message: 'ยินดีด้วยกับการอัปเกรดคอมใหม่ครับ', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: '5', donorName: 'Siravit_TH', amount: 50, message: 'ค่าขนมครับ', createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
];

function RecentDonorsWidgetInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const streamerId = (params?.streamerId as string) || 'streamerza';

  const modeParam = (searchParams.get('mode') as 'list' | 'ticker') || 'list';
  const sizeParam = searchParams.get('size') || 'md';
  const limitParam = parseInt(searchParams.get('limit') || '5');
  const customScale = searchParams.get('scale');
  const isDemo = searchParams.get('demo') === 'true';
  const themeOverride = searchParams.get('themeColor');

  const [donations, setDonations] = useState<RecentDonation[]>([]);
  const [settings, setSettings] = useState({
    title: 'ผู้สนับสนุนล่าสุด',
    mode: modeParam,
    limit: limitParam,
    themeColor: '#22c55e',
    textColor: '#ffffff',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    showTime: true,
    showMessage: true,
  });

  // OBS Studio 100% Transparency setup
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('widget-route');
      document.body.classList.add('widget-route');
      document.documentElement.style.setProperty('background', 'transparent', 'important');
      document.documentElement.style.setProperty('background-color', 'transparent', 'important');
      document.body.style.setProperty('background', 'transparent', 'important');
      document.body.style.setProperty('background-color', 'transparent', 'important');
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('widget-route');
        document.body.classList.remove('widget-route');
      }
    };
  }, []);

  const fetchRecent = () => {
    fetch(`/api/streamer?id=${streamerId}`)
      .then((res) => res.json())
      .then((streamerRes) => {
        const recentSettings = streamerRes.data?.recentDonorsSettings || {};
        setSettings((prev) => ({
          ...prev,
          ...recentSettings,
          mode: modeParam || recentSettings.mode || 'list',
          themeColor: themeOverride || recentSettings.themeColor || '#22c55e',
        }));

        const limit = limitParam || recentSettings.limit || 5;

        fetch(`/api/donations?streamerId=${streamerId}&type=recent&limit=${limit}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.data)) {
              setDonations(data.data);
            }
          })
          .catch((err) => console.error(err));
      })
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    fetchRecent();

    const eventSource = new EventSource(`/api/realtime/${streamerId}`);
    eventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'donation' || payload.type === 'test_alert') {
          fetchRecent();
        }
      } catch (err) {
        console.error(err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [streamerId, limitParam, modeParam]);

  const formatRelativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'เมื่อสักครู่';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} น.ที่แล้ว`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} ชม.ที่แล้ว`;
    return `${Math.floor(diffHr / 24)} วันที่แล้ว`;
  };

  const themeColor = themeOverride || settings.themeColor || '#22c55e';
  const effectiveMode = modeParam || settings.mode || 'list';
  const displayedDonations =
    donations.length > 0 ? donations.slice(0, settings.limit || 5) : isDemo ? DEMO_DONATIONS.slice(0, settings.limit || 5) : [];

  // Size configurations for ultra-crisp vector scaling in OBS
  const sizeStyles = {
    sm: {
      listWrapper: 'max-w-[340px] p-3.5',
      tickerWrapper: 'max-w-2xl py-2 px-3',
      headerTitle: 'text-sm font-black',
      headerBadge: 'text-[10px] px-2 py-0.5',
      icon: 'h-4 w-4',
      avatarSize: 'h-7 w-7 text-xs',
      donorName: 'text-xs font-black',
      amountText: 'text-xs font-black',
      messageText: 'text-[11px]',
      timeText: 'text-[10px]',
      rowPadding: 'py-2 px-2.5',
    },
    md: {
      listWrapper: 'max-w-[420px] p-4 sm:p-5',
      tickerWrapper: 'max-w-4xl py-2.5 px-4',
      headerTitle: 'text-base sm:text-lg font-black',
      headerBadge: 'text-xs px-2.5 py-0.5',
      icon: 'h-5 w-5',
      avatarSize: 'h-9 w-9 text-sm',
      donorName: 'text-sm sm:text-base font-black',
      amountText: 'text-sm sm:text-base font-black',
      messageText: 'text-xs',
      timeText: 'text-[11px]',
      rowPadding: 'py-2.5 px-3.5',
    },
    lg: {
      listWrapper: 'max-w-[520px] p-6',
      tickerWrapper: 'max-w-5xl py-3 px-5',
      headerTitle: 'text-xl sm:text-2xl font-black',
      headerBadge: 'text-sm px-3 py-1',
      icon: 'h-6 w-6',
      avatarSize: 'h-11 w-11 text-base',
      donorName: 'text-base sm:text-lg font-black',
      amountText: 'text-base sm:text-lg font-black',
      messageText: 'text-sm',
      timeText: 'text-xs',
      rowPadding: 'py-3.5 px-4',
    },
    xl: {
      listWrapper: 'max-w-[640px] p-7',
      tickerWrapper: 'max-w-6xl py-4 px-6',
      headerTitle: 'text-2xl sm:text-3xl font-black',
      headerBadge: 'text-base px-3.5 py-1.5',
      icon: 'h-7 w-7',
      avatarSize: 'h-13 w-13 text-lg',
      donorName: 'text-lg sm:text-xl font-black',
      amountText: 'text-lg sm:text-xl font-black',
      messageText: 'text-base',
      timeText: 'text-sm',
      rowPadding: 'py-4 px-5',
    },
  }[sizeParam as 'sm' | 'md' | 'lg' | 'xl'] || {
    listWrapper: 'max-w-[420px] p-4 sm:p-5',
    tickerWrapper: 'max-w-4xl py-2.5 px-4',
    headerTitle: 'text-base sm:text-lg font-black',
    headerBadge: 'text-xs px-2.5 py-0.5',
    icon: 'h-5 w-5',
    avatarSize: 'h-9 w-9 text-sm',
    donorName: 'text-sm sm:text-base font-black',
    amountText: 'text-sm sm:text-base font-black',
    messageText: 'text-xs',
    timeText: 'text-[11px]',
    rowPadding: 'py-2.5 px-3.5',
  };

  return (
    <div
      className="widget-overlay w-full h-full min-h-screen flex items-center justify-center p-3 select-none overflow-hidden !bg-transparent"
      style={{
        backgroundColor: 'transparent',
        transform: customScale ? `scale(${customScale})` : undefined,
        transformOrigin: 'center center',
      }}
    >
      {effectiveMode === 'ticker' ? (
        /* ================= Horizontal Ticker Bar ================= */
        <div
          className={`w-full ${sizeStyles.tickerWrapper} rounded-full bg-[#0a0d14]/90 border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.85)] backdrop-blur-md flex items-center gap-3 overflow-x-auto no-scrollbar`}
          style={{
            boxShadow: `0 0 20px ${themeColor}22, 0 16px 40px rgba(0,0,0,0.85)`,
          }}
        >
          {/* Sticky Ticker Title Pill */}
          <div
            className="flex items-center gap-1.5 px-3.5 py-1 rounded-full font-black text-xs uppercase tracking-wider flex-shrink-0 shadow-sm"
            style={{
              backgroundColor: `${themeColor}25`,
              color: themeColor,
              border: `1.5px solid ${themeColor}60`,
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            }}
          >
            <Heart className="h-3.5 w-3.5 fill-current animate-pulse" />
            <span>โดเนทล่าสุด</span>
          </div>

          {/* Ticker Items */}
          <div className="flex items-center gap-3 flex-nowrap overflow-x-auto no-scrollbar py-0.5">
            {displayedDonations.length === 0 ? (
              <span className="text-xs font-bold text-white/50 px-3">ยังไม่มีรายการโดเนทล่าสุด</span>
            ) : (
              displayedDonations.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-slate-900/90 border border-white/10 whitespace-nowrap flex-shrink-0 shadow-sm hover:border-white/25 transition-all"
                >
                  <div
                    className="h-5 w-5 rounded-full flex items-center justify-center font-black text-[10px] text-white flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${themeColor}, #3b82f6)`,
                    }}
                  >
                    {d.donorName.slice(0, 1).toUpperCase()}
                  </div>

                  <span
                    className="text-white font-extrabold text-xs"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                  >
                    {d.donorName}
                  </span>

                  <span
                    className="font-black text-xs stream-text-stroke-sm"
                    style={{ color: themeColor }}
                  >
                    +{d.amount.toLocaleString('th-TH')}฿
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* ================= Vertical List Feed ================= */
        <div
          className={`w-full ${sizeStyles.listWrapper} rounded-3xl bg-[#0a0d14]/90 border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.85)] backdrop-blur-md flex flex-col`}
          style={{
            boxShadow: `0 0 24px ${themeColor}22, 0 16px 40px rgba(0,0,0,0.85)`,
          }}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-2.5">
            <div className="flex items-center gap-2">
              <div
                className="p-1.5 rounded-xl flex items-center justify-center shadow-sm"
                style={{
                  backgroundColor: `${themeColor}25`,
                  border: `1px solid ${themeColor}60`,
                }}
              >
                <Clock className={`${sizeStyles.icon}`} style={{ color: themeColor }} />
              </div>

              <h2
                className={`text-white tracking-wide leading-tight ${sizeStyles.headerTitle}`}
                style={{
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 2px #000000',
                }}
              >
                {settings.title || 'ผู้สนับสนุนล่าสุด'}
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: themeColor }}
                />
                <span
                  className="relative inline-flex rounded-full h-2.5 w-2.5"
                  style={{ backgroundColor: themeColor }}
                />
              </span>
              <span
                className={`font-black rounded-full uppercase tracking-wider ${sizeStyles.headerBadge}`}
                style={{
                  backgroundColor: `${themeColor}20`,
                  color: themeColor,
                  border: `1px solid ${themeColor}50`,
                }}
              >
                LIVE FEED
              </span>
            </div>
          </div>

          {/* Donations List */}
          <div className="space-y-2">
            {displayedDonations.length === 0 ? (
              <div className="py-6 text-center space-y-1">
                <Heart className="h-8 w-8 text-white/30 mx-auto animate-pulse" />
                <p
                  className="text-xs font-bold text-white/70"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                >
                  ยังไม่มีรายการโดเนทล่าสุด
                </p>
              </div>
            ) : (
              displayedDonations.map((d, idx) => (
                <div
                  key={d.id || idx}
                  className={`rounded-2xl bg-gradient-to-r from-slate-900/90 to-[#121620]/90 border border-white/10 hover:border-white/20 transition-all shadow-sm ${sizeStyles.rowPadding} flex items-center justify-between gap-3`}
                >
                  {/* Left: Avatar + Donor Details */}
                  <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                    <div
                      className={`flex-shrink-0 ${sizeStyles.avatarSize} rounded-full flex items-center justify-center font-black text-white shadow-md`}
                      style={{
                        background: `linear-gradient(135deg, ${themeColor}, #6366f1)`,
                      }}
                    >
                      {d.donorName.slice(0, 1).toUpperCase()}
                    </div>

                    <div className="overflow-hidden space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-white truncate ${sizeStyles.donorName}`}
                          style={{
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 2px #000000',
                          }}
                        >
                          {d.donorName}
                        </span>

                        <span className={`text-slate-400 font-medium ${sizeStyles.timeText}`}>
                          {formatRelativeTime(d.createdAt)}
                        </span>
                      </div>

                      {d.message && (
                        <p
                          className={`text-slate-200/90 italic truncate ${sizeStyles.messageText}`}
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                        >
                          &quot;{d.message}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Donation Amount */}
                  <div className="flex-shrink-0">
                    <span
                      className={`${sizeStyles.amountText} tracking-tight stream-text-stroke-sm`}
                      style={{ color: themeColor }}
                    >
                      +{d.amount.toLocaleString('th-TH')}฿
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecentDonorsWidgetPage() {
  return (
    <Suspense fallback={null}>
      <RecentDonorsWidgetInner />
    </Suspense>
  );
}
