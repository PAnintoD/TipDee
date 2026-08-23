'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  Smile,
  Sparkles,
  Upload,
  CheckCircle2,
  ExternalLink,
  Layers,
} from 'lucide-react';

export default function StickersLibraryPage() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || 'streamerza';

  const [selectedSticker, setSelectedSticker] = useState('cat_vibing');

  const stickers = [
    {
      id: 'cat_vibing',
      name: 'Cat Vibing (แมวโยกหัวตามจังหวะ)',
      category: 'Meme Animals',
      url: 'https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/giphy.gif',
      recommendedFor: 'Bronze Tier (< 50฿)',
    },
    {
      id: 'popcat',
      name: 'Pop Cat (แมวอ้าปากรัวๆ)',
      category: 'Meme Animals',
      url: 'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif',
      recommendedFor: 'Silver Tier (50 - 299฿)',
    },
    {
      id: 'peepo_dance',
      name: 'Peepo Happy Dance (กบเต้นฉลอง)',
      category: 'Peepo & Twitch',
      url: 'https://media.giphy.com/media/bkcbX8SqTCXHG/giphy.gif',
      recommendedFor: 'Gold Tier (300 - 999฿)',
    },
    {
      id: 'coin_rain',
      name: 'Gold Coin Storm (ฝนเหรียญทองโปรยปราย)',
      category: 'Celebrations',
      url: 'https://media.giphy.com/media/l0Ex6kAKAoFRsFh6M/giphy.gif',
      recommendedFor: 'Diamond VIP (1000฿+)',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      <Navbar streamerId={username} />

      <div className="flex flex-1">
        <Sidebar streamerId={username} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
                <Smile className="h-6 w-6 text-brand-400" />
                <span>คลังสติกเกอร์ & ดุ๊กดิ๊ก GIF (Stickers & Animations)</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                เลือกสติกเกอร์แอนิเมชันและ GIF ที่จะเด้งขึ้นบนจอ OBS Alert Box
              </p>
            </div>

            <button
              onClick={() => alert('ฟีเจอร์อัปโหลด GIF ส่วนตัวจะเปิดให้ใช้งานในแพลน Pro')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-white/10 transition-all hover:scale-105"
            >
              <Upload className="h-4 w-4 text-brand-400" />
              <span>อัปโหลด GIF ส่วนตัว</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stickers.map((s) => {
              const isSelected = selectedSticker === s.id;
              return (
                <div
                  key={s.id}
                  className={`p-5 rounded-3xl border flex flex-col justify-between space-y-3 transition-all ${
                    isSelected
                      ? 'bg-gradient-to-b from-brand-950/40 via-slate-900/90 to-[#0e1219] border-brand-500/50 shadow-xl'
                      : 'bg-[#0e1219]/90 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="h-40 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-center p-3 overflow-hidden">
                      <img
                        src={s.url}
                        alt={s.name}
                        className="max-h-full max-w-full object-contain rounded-xl"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-semibold">
                        {s.category}
                      </span>
                      <h3 className="text-xs font-bold text-white mt-1.5">{s.name}</h3>
                      <p className="text-[11px] text-brand-400 font-medium mt-0.5">
                        {s.recommendedFor}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedSticker(s.id);
                      alert(`ตั้งสติกเกอร์เริ่มต้นเป็น "${s.name}" สำเร็จ`);
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${
                      isSelected
                        ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5'
                    }`}
                  >
                    {isSelected ? '✓ ใช้งานอยู่' : 'เลือกใช้สติกเกอร์นี้'}
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
