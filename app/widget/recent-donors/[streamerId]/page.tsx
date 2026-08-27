'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Clock, Heart, Sparkles, MessageSquare } from 'lucide-react';

interface RecentDonation {
  id: string;
  donorName: string;
  amount: number;
  message?: string;
  createdAt: string;
  paymentMethod: string;
}

export default function RecentDonorsWidgetPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const streamerId = (params?.streamerId as string) || 'streamerza';
  const mode = searchParams.get('mode') || 'list'; // 'list' or 'ticker'
  const limit = parseInt(searchParams.get('limit') || '5');

  const [donations, setDonations] = useState<RecentDonation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecent = () => {
    fetch(`/api/donations?streamerId=${streamerId}&type=recent&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setDonations(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
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
  }, [streamerId, limit]);

  const formatRelativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'เมื่อสักครู่';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} ชม. ที่แล้ว`;
    return `${Math.floor(diffHr / 24)} วันที่แล้ว`;
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 select-none"
      style={{ backgroundColor: 'transparent' }}
    >
      {mode === 'ticker' ? (
        /* Horizontal Ticker Bar */
        <div className="w-full max-w-2xl px-4 py-2.5 rounded-full bg-slate-950/85 border border-white/10 shadow-2xl backdrop-blur-md flex items-center gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 text-xs font-black text-brand-400 flex-shrink-0">
            <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
            <span>โดเนทล่าสุด:</span>
          </div>
          <div className="flex items-center gap-3 flex-nowrap">
            {donations.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-white/10 text-xs text-white whitespace-nowrap flex-shrink-0 shadow-sm"
              >
                <span className="font-bold">{d.donorName}</span>
                <span className="font-black text-brand-400">+{d.amount.toLocaleString('th-TH')}฿</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Vertical List Box */
        <div className="w-full max-w-xs p-4 rounded-3xl bg-slate-950/85 border border-white/10 shadow-2xl backdrop-blur-md space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-white">
              <Clock className="h-4 w-4 text-brand-400" />
              <span>ผู้สนับสนุนล่าสุด</span>
            </div>
            <span className="text-[10px] text-brand-400 font-bold px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20">
              Live Feed
            </span>
          </div>

          {/* List */}
          <div className="space-y-1.5">
            {donations.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-500">ยังไม่มีรายการโดเนทล่าสุด</div>
            ) : (
              donations.map((d) => (
                <div
                  key={d.id}
                  className="p-2.5 rounded-2xl bg-slate-900/70 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-white text-[10px] flex-shrink-0 shadow-sm">
                      {d.donorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">{d.donorName}</p>
                      <p className="text-[10px] text-slate-400">{formatRelativeTime(d.createdAt)}</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-brand-400 flex-shrink-0">
                    +{d.amount.toLocaleString('th-TH')} ฿
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
