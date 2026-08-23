'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { Target, CheckCircle2, Flame } from 'lucide-react';

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
    template: 'neon', // classic, neon, compact, retro
    showPercentage: true,
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

  const percentage = Math.min(100, Math.round(((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100));

  // Trigger celebration on goal completion
  useEffect(() => {
    if (percentage >= 100 && !celebrationTriggered.current) {
      celebrationTriggered.current = true;
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [percentage]);

  const isCompleted = percentage >= 100;
  const template = goal.template || 'neon';

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 select-none"
      style={{ backgroundColor: 'transparent' }}
    >
      {/* 1. Compact Pill Template */}
      {template === 'compact' ? (
        <div
          className="px-4 py-2.5 rounded-full shadow-2xl border border-white/15 backdrop-blur-md flex items-center gap-3 max-w-sm w-full"
          style={{ backgroundColor: goal.backgroundColor || 'rgba(15, 23, 42, 0.9)' }}
        >
          <div className="p-1.5 rounded-full bg-brand-500/20 text-brand-400 flex-shrink-0">
            <Target className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-xs font-bold truncate mb-1" style={{ color: goal.textColor || '#ffffff' }}>
              <span className="truncate">{goal.title}</span>
              <span className="text-brand-400 ml-2">{percentage}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-black/50 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: goal.barColor || '#22c55e',
                  boxShadow: `0 0 10px ${goal.barColor || '#22c55e'}`,
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* 2. Neon / Classic Template */
        <div
          className={`w-full max-w-md p-5 rounded-3xl shadow-2xl border backdrop-blur-md space-y-3 ${
            template === 'neon'
              ? 'border-brand-500/30 ring-1 ring-brand-500/20 shadow-[0_0_35px_rgba(34,197,94,0.2)]'
              : 'border-white/10'
          }`}
          style={{ backgroundColor: goal.backgroundColor || 'rgba(15, 23, 42, 0.85)' }}
        >
          {/* Header */}
          <div className="flex justify-between items-center text-sm font-black" style={{ color: goal.textColor || '#ffffff' }}>
            <div className="flex items-center gap-2 truncate pr-2">
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4 text-brand-400 flex-shrink-0 animate-bounce" />
              ) : (
                <Target className="h-4 w-4 text-brand-400 flex-shrink-0" />
              )}
              <span className="truncate">{goal.title}</span>
            </div>
            <span className="text-brand-400 font-extrabold text-base flex-shrink-0">{percentage}%</span>
          </div>

          {/* Progress Bar Container */}
          <div className="h-5 w-full rounded-full bg-black/60 overflow-hidden p-0.5 border border-white/10 relative">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                template === 'neon' ? 'bg-gradient-to-r from-emerald-600 via-brand-500 to-green-300' : ''
              }`}
              style={{
                width: `${percentage}%`,
                backgroundColor: template === 'neon' ? undefined : goal.barColor || '#22c55e',
                boxShadow: `0 0 20px ${goal.barColor || '#22c55e'}`,
              }}
            />
          </div>

          {/* Amount footer */}
          <div className="flex justify-between items-center text-xs font-bold text-slate-300">
            <span className="text-brand-400 font-extrabold text-sm">
              {(goal.currentAmount || 0).toLocaleString('th-TH')} ฿
            </span>
            <span className="text-slate-400">
              เป้าหมาย {(goal.targetAmount || 0).toLocaleString('th-TH')} ฿
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
