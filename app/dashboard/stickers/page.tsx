'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  Smile,
  Upload,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export default function StickersLibraryPage() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || 'streamerza';

  const [selectedSticker, setSelectedSticker] = useState('cat_vibing');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  const stickers = [
    {
      id: 'mascot',
      name: '🎀 มาสคอตจิบิ TipDee (โปร่งใส 100%)',
      category: 'Official Mascot',
      url: '/mascot.svg',
      recommendedFor: 'ยอดนิยม (Recommended)',
    },
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

  useEffect(() => {
    fetch(`/api/streamer?id=${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.alertSettings?.imageUrl) {
          const currentUrl = data.data.alertSettings.imageUrl;
          const found = stickers.find((s) => s.url === currentUrl);
          if (found) setSelectedSticker(found.id);
        }
      })
      .catch((e) => console.error('Failed to load active sticker', e));
  }, [username]);

  const handleSelectSticker = async (sticker: (typeof stickers)[0]) => {
    setSelectedSticker(sticker.id);
    setSavingId(sticker.id);
    setSavedSuccessMsg('');

    try {
      const res = await fetch('/api/streamer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: username,
          alertSettings: {
            imageUrl: sticker.url,
          },
        }),
      });

      if (res.ok) {
        setSavedSuccessMsg(`ตั้งค่าสติกเกอร์ Alert Box เป็น "${sticker.name}" เรียบร้อยแล้ว`);
        setTimeout(() => setSavedSuccessMsg(''), 4000);
      }
    } catch (e) {
      console.error('Failed to save sticker', e);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col">
      <Navbar streamerId={username} />

      <div className="flex flex-1">
        <Sidebar streamerId={username} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
                <Smile className="h-6 w-6 text-emerald-600" />
                <span>คลังสติกเกอร์ & ดุ๊กดิ๊ก GIF (Stickers & Animations)</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                เลือกสติกเกอร์แอนิเมชันและ GIF ที่จะเด้งขึ้นบนจอ OBS Alert Box เมื่อมีผู้สนับสนุน
              </p>
            </div>

            <button
              onClick={() => alert('ฟีเจอร์อัปโหลด GIF ส่วนตัวจะเปิดให้ใช้งานในแพลน Pro')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-semibold border border-slate-200 shadow-2xs transition-all active:scale-[0.98]"
            >
              <Upload className="h-4 w-4 text-emerald-600" />
              <span>อัปโหลด GIF ส่วนตัว</span>
            </button>
          </div>

          {savedSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs sm:text-sm animate-alert-pop">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{savedSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stickers.map((s) => {
              const isSelected = selectedSticker === s.id;
              const isSaving = savingId === s.id;

              return (
                <div
                  key={s.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                    isSelected
                      ? 'bg-emerald-50/50 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="h-44 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-3 overflow-hidden">
                      <img
                        src={s.url}
                        alt={s.name}
                        className="max-h-full max-w-full object-contain rounded-lg"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold border border-slate-200/60">
                        {s.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-2">{s.name}</h3>
                      <p className="text-xs text-emerald-600 font-medium mt-0.5">
                        {s.recommendedFor}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectSticker(s)}
                    disabled={isSaving}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white border border-emerald-600 hover:bg-emerald-500'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isSelected ? (
                      '✓ ใช้งานอยู่'
                    ) : (
                      'เลือกใช้สติกเกอร์นี้'
                    )}
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
