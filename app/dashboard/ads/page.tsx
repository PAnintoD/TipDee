'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  Megaphone,
  Tv,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Image as ImageIcon,
  Clock,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export default function AdsPage() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || 'streamerza';

  const [ads, setAds] = useState([
    {
      id: '1',
      title: 'Gaming Gear Official Store',
      sponsorName: 'HyperX Thailand',
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
      slot: 'ล่างขวา (Bottom Right)',
      intervalSeconds: 60,
      active: true,
    },
    {
      id: '2',
      title: 'เครื่องดื่มชูกำลังสำหรับเกมเมอร์',
      sponsorName: 'Energy Drink TH',
      imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
      slot: 'มุมบนซ้าย (Top Left)',
      intervalSeconds: 120,
      active: false,
    },
  ]);

  const [copiedUrl, setCopiedUrl] = useState(false);
  const adsWidgetUrl = typeof window !== 'undefined' ? `${window.location.origin}/widget/ads/${username}` : `/widget/ads/${username}`;

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      <Navbar streamerId={username} />

      <div className="flex flex-1">
        <Sidebar streamerId={username} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
                <Megaphone className="h-6 w-6 text-brand-400" />
                <span>ลงโฆษณา & แบนเนอร์สปอนเซอร์ (Stream Ads & Sponsors)</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                จัดการแบนเนอร์สปอนเซอร์ โลโก้ผู้สนับสนุน และโฆษณาขึ้นหมุนเวียนบนจอสตรีม OBS
              </p>
            </div>

            <button
              onClick={() => alert('ฟอร์มเพิ่มสปอนเซอร์ใหม่')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-500/25 transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              <span>เพิ่มสปอนเซอร์ใหม่</span>
            </button>
          </div>

          {/* OBS Widget URL Card */}
          <div className="p-6 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tv className="h-5 w-5 text-brand-400" />
                <h3 className="text-sm font-bold text-white">OBS Browser Source URL สำหรับแสดงโฆษณา</h3>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <input
                type="text"
                value={adsWidgetUrl}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 font-mono text-xs text-slate-300"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(adsWidgetUrl);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black text-xs font-bold whitespace-nowrap transition-all shadow-md"
              >
                {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedUrl ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</span>
              </button>
            </div>
          </div>

          {/* Active Sponsors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ads.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-40 rounded-2xl bg-slate-900 border border-white/5 overflow-hidden relative">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-white font-semibold text-[10px]">
                      {item.slot}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-brand-400 font-semibold">{item.sponsorName}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                      <Clock className="h-3.5 w-3.5" />
                      <span>แสดงทุกๆ {item.intervalSeconds} วินาที</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className={`text-xs font-bold ${item.active ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {item.active ? '● กำลังแสดงบนสตรีม' : '○ ปิดการแสดง'}
                  </span>

                  <button
                    onClick={() => {
                      setAds(ads.map((x) => (x.id === item.id ? { ...x, active: !x.active } : x)));
                    }}
                    className="p-1 text-slate-300 hover:text-white"
                  >
                    {item.active ? (
                      <ToggleRight className="h-7 w-7 text-brand-400" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
