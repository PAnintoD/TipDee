'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  Volume2,
  Play,
  Pause,
  Upload,
  Check,
  Sparkles,
  Music,
  Bell,
  Zap,
} from 'lucide-react';
import { playAlertSound } from '@/lib/soundEffects';

export default function SoundLibraryPage() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || 'streamerza';

  const [selectedSound, setSelectedSound] = useState('mythic_bell');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const soundList = [
    {
      id: 'mythic_bell',
      name: 'Mythic Chord Bell (เสียงระฆังพรีเมียม)',
      category: 'Bells & Chimes',
      duration: '2.5s',
      desc: 'เสียงระฆังประสาน 4 โน้ต เหมาะสำหรับยอดโดเนทปกติและยอดโดเนทใหญ่',
    },
    {
      id: 'retro_jump',
      name: '8-Bit Retro Coin (เสียงเหรียญมาริโอ้)',
      category: '8-Bit Gaming',
      duration: '1.2s',
      desc: 'เสียงเหรียญเกมยุค 90s สดใส น่ารัก คุ้นหูผู้ชมเกมเมอร์',
    },
    {
      id: 'super_star',
      name: 'Super Fanfare Victory (เสียงฉลองชัยชนะ)',
      category: 'Fanfares',
      duration: '3.0s',
      desc: 'เสียงเมโลดี้ฉลองความสำเร็จ เหมาะสำหรับยอดโดเนทระดับ 100-500 บาท',
    },
    {
      id: 'cyber_synth',
      name: 'Cyber Wave Pulse (เสียงไซเบอร์)',
      category: 'Sci-Fi Synth',
      duration: '2.0s',
      desc: 'เสียงสังเคราะห์สไตล์ Neon Sci-Fi สำหรับสตรีมเมอร์สายเทคและเกมยิง FPS',
    },
  ];

  const handleTestPlay = (id: string) => {
    setPlayingId(id);
    playAlertSound(id);
    setTimeout(() => setPlayingId(null), 3000);
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
                <Music className="h-6 w-6 text-emerald-600" />
                <span>คลังเสียงแจ้งเตือน (Sound Library)</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                เลือกและทดลองฟังเสียงเอฟเฟกต์แจ้งเตือนก่อนยิงขึ้นจอ OBS Studio
              </p>
            </div>

            <button
              onClick={() => alert('ฟีเจอร์อัปโหลดเสียง MP3 ส่วนตัวจะเปิดให้ใช้งานในแพลน Pro')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-semibold border border-slate-200 shadow-2xs transition-all active:scale-[0.98]"
            >
              <Upload className="h-4 w-4 text-emerald-600" />
              <span>อัปโหลดเสียง MP3 ส่วนตัว</span>
            </button>
          </div>

          {/* Sound list grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {soundList.map((s) => {
              const isSelected = selectedSound === s.id;
              const isPlaying = playingId === s.id;

              return (
                <div
                  key={s.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-emerald-50/50 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold border border-slate-200/60">
                          {s.category}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{s.duration}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 pt-1">{s.name}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {/* Play test button */}
                      <button
                        onClick={() => handleTestPlay(s.id)}
                        className={`p-3 rounded-xl transition-all shadow-2xs ${
                          isPlaying
                            ? 'bg-emerald-600 text-white scale-105 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                        title="คลิกเพื่อทดลองฟังเสียง"
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 text-emerald-600 fill-emerald-600" />
                        )}
                      </button>

                      {/* Select as active */}
                      <button
                        onClick={() => {
                          setSelectedSound(s.id);
                          alert(`ตั้งค่าเสียงเริ่มต้นเป็น "${s.name}" เรียบร้อยแล้ว`);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                        }`}
                      >
                        {isSelected ? '✓ ใช้งานอยู่' : 'เลือกใช้'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
