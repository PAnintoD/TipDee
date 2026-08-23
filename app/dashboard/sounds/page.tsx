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
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      <Navbar streamerId={username} />

      <div className="flex flex-1">
        <Sidebar streamerId={username} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
                <Music className="h-6 w-6 text-brand-400" />
                <span>คลังเสียงแจ้งเตือน (Sound Library)</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                เลือกและทดลองฟังเสียงเอฟเฟกต์แจ้งเตือนก่อนยิงขึ้นจอ OBS Studio
              </p>
            </div>

            <button
              onClick={() => alert('ฟีเจอร์อัปโหลดเสียง MP3 ส่วนตัวจะเปิดให้ใช้งานในแพลน Pro')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-white/10 transition-all hover:scale-105"
            >
              <Upload className="h-4 w-4 text-brand-400" />
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
                  className={`p-5 rounded-3xl border transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-brand-950/40 via-slate-900/80 to-[#0e1219] border-brand-500/40 shadow-xl'
                      : 'bg-[#0e1219]/90 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-semibold">
                          {s.category}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">{s.duration}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white pt-1">{s.name}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {/* Play test button */}
                      <button
                        onClick={() => handleTestPlay(s.id)}
                        className={`p-3 rounded-2xl transition-all shadow-md ${
                          isPlaying
                            ? 'bg-brand-500 text-black scale-110'
                            : 'bg-slate-800 hover:bg-slate-700 text-white'
                        }`}
                        title="คลิกเพื่อทดลองฟังเสียง"
                      >
                        {isPlaying ? <Pause className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 text-brand-400 fill-brand-400" />}
                      </button>

                      {/* Select as active */}
                      <button
                        onClick={() => {
                          setSelectedSound(s.id);
                          alert(`ตั้งค่าเสียงเริ่มต้นเป็น "${s.name}" เรียบร้อยแล้ว`);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors ${
                          isSelected
                            ? 'bg-brand-500/20 text-brand-400 border-brand-500/30'
                            : 'bg-slate-800 text-slate-400 border-white/5 hover:text-white'
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
