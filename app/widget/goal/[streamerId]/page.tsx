'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function GoalWidgetPage() {
  const params = useParams();
  const streamerId = (params?.streamerId as string) || 'streamerza';

  const [goal, setGoal] = useState<any>({
    title: '🎯 เป้าหมายโดเนท',
    targetAmount: 10000,
    currentAmount: 0,
    barColor: '#22c55e',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    textColor: '#ffffff',
  });

  const fetchGoal = () => {
    fetch(`/api/streamer?id=${streamerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.goalSettings) {
          setGoal(data.data.goalSettings);
        }
      })
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    fetchGoal();

    const eventSource = new EventSource(`/api/realtime/${streamerId}`);
    eventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'donation' || payload.type === 'test_alert') {
          // Re-fetch goal
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

  const percentage = Math.min(100, Math.round(((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100));

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 select-none"
      style={{ backgroundColor: 'transparent' }}
    >
      <div
        className="w-full max-w-md p-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md space-y-2.5"
        style={{ backgroundColor: goal.backgroundColor || 'rgba(15, 23, 42, 0.85)' }}
      >
        <div className="flex justify-between items-center text-sm font-black" style={{ color: goal.textColor || '#ffffff' }}>
          <span className="truncate pr-2">{goal.title}</span>
          <span className="text-brand-400 font-extrabold">{percentage}%</span>
        </div>

        {/* Progress Bar */}
        <div className="h-4 w-full rounded-full bg-black/50 overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${percentage}%`,
              backgroundColor: goal.barColor || '#22c55e',
              boxShadow: `0 0 15px ${goal.barColor || '#22c55e'}`,
            }}
          />
        </div>

        <div className="flex justify-between text-xs font-semibold text-slate-300">
          <span>{goal.currentAmount?.toLocaleString('th-TH')} ฿</span>
          <span>เป้าหมาย {goal.targetAmount?.toLocaleString('th-TH')} ฿</span>
        </div>
      </div>
    </div>
  );
}
