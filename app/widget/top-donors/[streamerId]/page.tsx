'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Crown, Trophy, Sparkles, Medal } from 'lucide-react';

interface TopDonor {
  name: string;
  totalAmount: number;
}

const DEMO_DONORS: TopDonor[] = [
  { name: 'Sompong_GamerZ', totalAmount: 3500 },
  { name: 'Kittisak_Pro', totalAmount: 1800 },
  { name: 'NongPrae_Ch', totalAmount: 950 },
  { name: 'Nonthawat_TH', totalAmount: 500 },
  { name: 'StreamSupporter_99', totalAmount: 300 },
];

function TopDonorsWidgetInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const streamerId = (params?.streamerId as string) || 'streamerza';

  // Crisp resolution sizing: sm, md (default), lg, xl
  const sizeParam = searchParams.get('size') || 'md';
  const customScale = searchParams.get('scale');
  const isDemo = searchParams.get('demo') === 'true';
  const themeOverride = searchParams.get('themeColor');

  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
  const [settings, setSettings] = useState({
    title: '🏆 ผู้สนับสนุนสูงสุด',
    period: 'month',
    limit: 5,
    themeColor: '#eab308',
    textColor: '#ffffff',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    style: 'card',
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

  const fetchTopDonors = () => {
    fetch(`/api/streamer?id=${streamerId}`)
      .then((res) => res.json())
      .then((streamerRes) => {
        const topSettings = streamerRes.data?.topDonorsSettings || {};
        setSettings((prev) => ({
          ...prev,
          ...topSettings,
          themeColor: themeOverride || topSettings.themeColor || '#eab308',
        }));

        const period = topSettings.period || 'month';
        const limit = topSettings.limit || 5;

        fetch(`/api/donations?streamerId=${streamerId}&type=top&period=${period}&limit=${limit}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.data)) {
              setTopDonors(data.data);
            }
          })
          .catch((e) => console.error(e));
      })
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    fetchTopDonors();

    const eventSource = new EventSource(`/api/realtime/${streamerId}`);
    eventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'donation' || payload.type === 'test_alert') {
          fetchTopDonors();
        }
      } catch (err) {
        console.error(err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [streamerId]);

  // Size configurations for ultra-crisp vector scaling in OBS
  const sizeStyles = {
    sm: {
      wrapper: 'max-w-[340px] p-3.5',
      headerTitle: 'text-sm font-black',
      headerBadge: 'text-[10px] px-2 py-0.5',
      icon: 'h-4 w-4',
      rowGap: 'space-y-1.5',
      rowPadding: 'py-1.5 px-2.5',
      avatarSize: 'h-7 w-7 text-xs',
      donorName: 'text-xs font-black',
      amountText: 'text-xs font-black',
      rankBadge: 'w-6 h-6 text-xs',
    },
    md: {
      wrapper: 'max-w-[420px] p-4 sm:p-5',
      headerTitle: 'text-base sm:text-lg font-black',
      headerBadge: 'text-xs px-2.5 py-0.5',
      icon: 'h-5 w-5',
      rowGap: 'space-y-2',
      rowPadding: 'py-2 px-3.5',
      avatarSize: 'h-9 w-9 text-sm',
      donorName: 'text-sm sm:text-base font-black',
      amountText: 'text-sm sm:text-base font-black',
      rankBadge: 'w-7 h-7 text-sm',
    },
    lg: {
      wrapper: 'max-w-[520px] p-6',
      headerTitle: 'text-xl sm:text-2xl font-black',
      headerBadge: 'text-sm px-3 py-1',
      icon: 'h-6 w-6',
      rowGap: 'space-y-2.5',
      rowPadding: 'py-3 px-4',
      avatarSize: 'h-11 w-11 text-base',
      donorName: 'text-base sm:text-lg font-black',
      amountText: 'text-base sm:text-lg font-black',
      rankBadge: 'w-8 h-8 text-base',
    },
    xl: {
      wrapper: 'max-w-[640px] p-7',
      headerTitle: 'text-2xl sm:text-3xl font-black',
      headerBadge: 'text-base px-3.5 py-1.5',
      icon: 'h-7 w-7',
      rowGap: 'space-y-3',
      rowPadding: 'py-3.5 px-5',
      avatarSize: 'h-13 w-13 text-lg',
      donorName: 'text-lg sm:text-xl font-black',
      amountText: 'text-lg sm:text-xl font-black',
      rankBadge: 'w-10 h-10 text-lg',
    },
  }[sizeParam as 'sm' | 'md' | 'lg' | 'xl'] || {
    wrapper: 'max-w-[420px] p-4 sm:p-5',
    headerTitle: 'text-base sm:text-lg font-black',
    headerBadge: 'text-xs px-2.5 py-0.5',
    icon: 'h-5 w-5',
    rowGap: 'space-y-2',
    rowPadding: 'py-2 px-3.5',
    avatarSize: 'h-9 w-9 text-sm',
    donorName: 'text-sm sm:text-base font-black',
    amountText: 'text-sm sm:text-base font-black',
    rankBadge: 'w-7 h-7 text-sm',
  };

  const displayedDonors =
    topDonors.length > 0 ? topDonors.slice(0, settings.limit || 5) : isDemo ? DEMO_DONORS.slice(0, settings.limit || 5) : [];

  const themeColor = themeOverride || settings.themeColor || '#eab308';

  const periodLabel =
    settings.period === 'day'
      ? 'วันนี้'
      : settings.period === 'week'
      ? 'สัปดาห์นี้'
      : settings.period === 'all_time'
      ? 'ตลอดกาล'
      : 'เดือนนี้';

  return (
    <div
      className="widget-overlay w-full h-full min-h-screen flex items-center justify-center p-3 select-none overflow-hidden !bg-transparent"
      style={{
        backgroundColor: 'transparent',
        transform: customScale ? `scale(${customScale})` : undefined,
        transformOrigin: 'center center',
      }}
    >
      <div
        className={`w-full ${sizeStyles.wrapper} rounded-3xl bg-[#0a0d14]/90 border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.85)] backdrop-blur-md flex flex-col`}
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
              <Crown className={`${sizeStyles.icon}`} style={{ color: themeColor }} />
            </div>
            <h2
              className={`text-white tracking-wide leading-tight ${sizeStyles.headerTitle}`}
              style={{
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 2px #000000',
              }}
            >
              {settings.title || '🏆 ผู้สนับสนุนสูงสุด'}
            </h2>
          </div>

          <span
            className={`font-black rounded-full uppercase tracking-wider ${sizeStyles.headerBadge}`}
            style={{
              backgroundColor: `${themeColor}20`,
              color: themeColor,
              border: `1px solid ${themeColor}50`,
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            }}
          >
            {periodLabel}
          </span>
        </div>

        {/* Donors List */}
        <div className={sizeStyles.rowGap}>
          {displayedDonors.length === 0 ? (
            <div className="py-6 text-center space-y-1">
              <Trophy className="h-8 w-8 text-white/30 mx-auto animate-pulse" />
              <p
                className="text-xs font-bold text-white/70"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
              >
                กำลังรอผู้สนับสนุนคนแรก...
              </p>
            </div>
          ) : (
            displayedDonors.map((donor, idx) => {
              const rank = idx + 1;
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              const isThird = rank === 3;

              // High-visibility, crisp stream styling for each tier
              const rowStyle = isFirst
                ? {
                    background: `linear-gradient(90deg, ${themeColor}33 0%, rgba(24, 24, 27, 0.95) 75%)`,
                    border: `1.5px solid ${themeColor}`,
                    boxShadow: `0 0 16px ${themeColor}33`,
                  }
                : isSecond
                ? {
                    background: 'linear-gradient(90deg, rgba(226, 232, 240, 0.22) 0%, rgba(24, 24, 27, 0.92) 75%)',
                    border: '1.5px solid rgba(226, 232, 240, 0.6)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  }
                : isThird
                ? {
                    background: 'linear-gradient(90deg, rgba(217, 119, 6, 0.22) 0%, rgba(24, 24, 27, 0.92) 75%)',
                    border: '1.5px solid rgba(217, 119, 6, 0.55)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  }
                : {
                    background: 'rgba(24, 24, 27, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  };

              const rankBadgeColor = isFirst
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-black font-black shadow-md'
                : isSecond
                ? 'bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-900 font-black shadow-md'
                : isThird
                ? 'bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-black shadow-md'
                : 'bg-white/10 text-white/80 font-bold border border-white/10';

              const amountColor = isFirst
                ? themeColor
                : isSecond
                ? '#f1f5f9'
                : isThird
                ? '#fbbf24'
                : '#38bdf8';

              return (
                <div
                  key={idx}
                  className={`rounded-2xl flex items-center justify-between ${sizeStyles.rowPadding} transition-all duration-300`}
                  style={rowStyle}
                >
                  {/* Left: Rank Badge + Donor Name */}
                  <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                    <div
                      className={`flex-shrink-0 ${sizeStyles.rankBadge} rounded-full flex items-center justify-center ${rankBadgeColor}`}
                    >
                      {isFirst ? '👑' : isSecond ? '2' : isThird ? '3' : `${rank}`}
                    </div>

                    <span
                      className={`text-white truncate ${sizeStyles.donorName}`}
                      style={{
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 2px #000000',
                      }}
                    >
                      {donor.name}
                    </span>
                  </div>

                  {/* Right: Donation Amount */}
                  <div className="flex-shrink-0 flex items-center gap-1">
                    <span
                      className={`${sizeStyles.amountText} tracking-tight stream-text-stroke-sm`}
                      style={{ color: amountColor }}
                    >
                      {donor.totalAmount.toLocaleString('th-TH')}฿
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function TopDonorsWidgetPage() {
  return (
    <Suspense fallback={null}>
      <TopDonorsWidgetInner />
    </Suspense>
  );
}
