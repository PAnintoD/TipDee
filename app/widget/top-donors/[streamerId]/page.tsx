'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Trophy, Award, Crown } from 'lucide-react';

export default function TopDonorsWidgetPage() {
  const params = useParams();
  const streamerId = (params?.streamerId as string) || 'streamerza';

  const [topDonors, setTopDonors] = useState<any[]>([]);
  const [title, setTitle] = useState('🏆 ผู้สนับสนุนสูงสุด');

  const fetchTopDonors = () => {
    fetch(`/api/donations?streamerId=${streamerId}&type=top&period=month&limit=5`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTopDonors(data.data || []);
        }
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

  const medals = ['🥇', '🥈', '🥉', '4', '5'];
  const rankColors = [
    'from-amber-500/20 to-slate-900/80 border-amber-500/40 text-amber-300',
    'from-slate-400/20 to-slate-900/80 border-slate-400/40 text-slate-200',
    'from-amber-700/20 to-slate-900/80 border-amber-700/40 text-amber-400',
    'from-slate-800/40 to-slate-900/80 border-white/5 text-slate-300',
    'from-slate-800/40 to-slate-900/80 border-white/5 text-slate-300',
  ];

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 select-none"
      style={{ backgroundColor: 'transparent' }}
    >
      <div className="w-full max-w-xs p-4 rounded-3xl bg-slate-950/85 border border-white/10 shadow-2xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-white">
            <Crown className="h-4 w-4 text-amber-400" />
            <span>{title}</span>
          </div>
          <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            Top Donors
          </span>
        </div>

        <div className="space-y-1.5">
          {topDonors.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-500">กำลังรอผู้สนับสนุนคนแรก...</div>
          ) : (
            topDonors.map((donor, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border bg-gradient-to-r ${rankColors[idx] || rankColors[3]} flex items-center justify-between shadow-sm`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-sm font-bold w-5 text-center flex-shrink-0">{medals[idx]}</span>
                  <span className="text-xs font-bold text-white truncate">{donor.name}</span>
                </div>
                <span className="text-xs font-extrabold text-brand-400 flex-shrink-0">
                  {donor.totalAmount.toLocaleString('th-TH')} ฿
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
