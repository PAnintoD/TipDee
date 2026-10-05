'use client';

import React, { Suspense, useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';

function GoalWidgetInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const streamerId = (params?.streamerId as string) || 'streamerza';

  // Support size query: sm, md (default), lg, xl
  const sizeParam = searchParams.get('size') || 'md';
  const customScale = searchParams.get('scale');

  const [goal, setGoal] = useState<any>({
    title: '🎯 ยำวุ้นเส้น',
    targetAmount: 200,
    currentAmount: 100,
    barColor: '#00a8ff',
    backgroundColor: 'rgba(24, 24, 27, 0.85)',
    textColor: '#ffffff',
    endDate: '',
  });

  const celebrationTriggered = useRef(false);

  const fetchGoal = () => {
    fetch(`/api/streamer?id=${streamerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.goalSettings) {
          setGoal((prev: any) => ({ ...prev, ...data.data.goalSettings }));
        }
      })
      .catch((e) => console.error(e));
  };

  // OBS 100% Transparency setup
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

  // Real-time donation listener
  useEffect(() => {
    fetchGoal();

    const eventSource = new EventSource(`/api/realtime/${streamerId}`);
    eventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'donation' || payload.type === 'test_alert') {
          fetchGoal();
        }
      } catch (err) {
        console.error(err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [streamerId]);

  const target = Math.max(1, Number(goal.targetAmount) || 1);
  const current = Number(goal.currentAmount) || 0;
  const percentage = Math.min(100, Math.round((current / target) * 100));

  // Trigger celebration on 100% completion
  useEffect(() => {
    if (percentage >= 100 && !celebrationTriggered.current) {
      celebrationTriggered.current = true;
      try {
        confetti({
          particleCount: 120,
          spread: 85,
          origin: { y: 0.5 },
        });
      } catch {}
    }
  }, [percentage]);

  // Compute remaining days
  const getRemainingDaysText = () => {
    if (!goal.endDate) return 'สิ้นสุดใน 30 วัน';
    try {
      const end = new Date(goal.endDate);
      if (isNaN(end.getTime())) return 'สิ้นสุดใน 30 วัน';
      const now = new Date();
      const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
      const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const diffDays = Math.ceil((endDay - nowDay) / (1000 * 60 * 60 * 24));
      if (diffDays > 1) return `สิ้นสุดใน ${diffDays} วัน`;
      if (diffDays === 1) return 'สิ้นสุดพรุ่งนี้';
      if (diffDays === 0) return 'สิ้นสุดวันนี้';
      return 'สิ้นสุดแล้ว';
    } catch {
      return 'สิ้นสุดใน 30 วัน';
    }
  };

  // Preset dimension configs for crisp rendering in OBS Studio
  const sizeStyles = {
    sm: {
      wrapper: 'max-w-[440px]',
      title: 'text-lg',
      barHeight: 'h-9',
      barText: 'text-sm font-black',
      footer: 'text-xs',
    },
    md: {
      wrapper: 'max-w-[580px]',
      title: 'text-xl sm:text-2xl',
      barHeight: 'h-11 sm:h-12',
      barText: 'text-base sm:text-lg font-black',
      footer: 'text-xs sm:text-sm',
    },
    lg: {
      wrapper: 'max-w-[720px]',
      title: 'text-2xl sm:text-3xl',
      barHeight: 'h-14 sm:h-16',
      barText: 'text-lg sm:text-xl font-black',
      footer: 'text-sm sm:text-base',
    },
    xl: {
      wrapper: 'max-w-[880px]',
      title: 'text-3xl sm:text-4xl',
      barHeight: 'h-16 sm:h-20',
      barText: 'text-xl sm:text-2xl font-black',
      footer: 'text-base sm:text-lg',
    },
  }[sizeParam as 'sm' | 'md' | 'lg' | 'xl'] || {
    wrapper: 'max-w-[580px]',
    title: 'text-xl sm:text-2xl',
    barHeight: 'h-11 sm:h-12',
    barText: 'text-base sm:text-lg font-black',
    footer: 'text-xs sm:text-sm',
  };

  const barColor = goal.barColor || '#00a8ff';

  return (
    <div
      className="widget-overlay w-full h-full min-h-screen flex items-center justify-center p-3 select-none overflow-hidden !bg-transparent"
      style={{
        backgroundColor: 'transparent',
        transform: customScale ? `scale(${customScale})` : undefined,
        transformOrigin: 'center center',
      }}
    >
      <div className={`w-full ${sizeStyles.wrapper} flex flex-col items-center !bg-transparent`}>
        {/* Title above bar (Matching Image 2: bold, white, centered, drop shadow) */}
        <h2
          className={`font-black text-white text-center mb-2 tracking-wide leading-tight ${sizeStyles.title}`}
          style={{
            textShadow: '0 2px 5px rgba(0, 0, 0, 0.95), 0 0 2px #000000',
          }}
        >
          {goal.title || 'ยำวุ้นเส้น'}
        </h2>

        {/* Pill Progress Bar (Matching Image 2: sleek dark track with cyan active fill) */}
        <div
          className={`relative w-full ${sizeStyles.barHeight} rounded-full bg-[#18181b]/85 border border-white/10 shadow-[inset_0_2px_5px_rgba(0,0,0,0.7)] overflow-hidden flex items-center`}
        >
          {/* Active Fill Bar */}
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: barColor,
              boxShadow: `0 0 16px ${barColor}66`,
            }}
          />

          {/* Centered Amount Text (e.g. 100฿ (50%)) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className={`text-white tracking-wide ${sizeStyles.barText}`}
              style={{
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 3px #000000',
              }}
            >
              {current.toLocaleString('th-TH')}฿ ({percentage}%)
            </span>
          </div>
        </div>

        {/* Sub Info Row (Left: จากเป้าหมาย ...฿, Right: สิ้นสุดใน ... วัน) */}
        <div
          className={`w-full flex justify-between items-center mt-2 px-1 font-bold text-white ${sizeStyles.footer}`}
          style={{
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.95), 0 0 2px #000000',
          }}
        >
          <span>จากเป้าหมาย {target.toLocaleString('th-TH')}฿</span>
          <span>{getRemainingDaysText()}</span>
        </div>
      </div>
    </div>
  );
}

export default function GoalWidgetPage() {
  return (
    <Suspense fallback={null}>
      <GoalWidgetInner />
    </Suspense>
  );
}
