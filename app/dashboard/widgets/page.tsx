'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  Tv,
  Bell,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  Copy,
  Check,
  ExternalLink,
  Play,
  Save,
  CheckCircle2,
  Target,
  Trophy,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import { SOUND_PRESETS, playAlertSound } from '@/lib/soundEffects';
import { speakText } from '@/lib/ttsEngine';

const GIF_PRESETS = [
  { id: 'mascot', name: '🎀 มาสคอตจิบิ TipDee (โปร่งใส 100%)', url: '/mascot.svg' },
  { id: 'anime_jump', name: '✨ อนิเมะจิบิ (Anime Mascot)', url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif' },
  { id: 'cat', name: '🐱 แมวดุ๊กดิ๊ก (Dancing Cat)', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z1anE4d2dmaHk4NXVycG43dnEycW10M2d4YWR0NmsyMzB5enFqdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/MDJ9IbxxvDUQM/giphy.gif' },
  { id: 'coins', name: '💰 เหรียญทองระเบิด (Gold Coins)', url: 'https://media.giphy.com/media/l0Ex6kAKAoFRsFh6M/giphy.gif' },
  { id: 'cheer', name: '🎉 ฉลองชัยชนะ (Victory Cheer)', url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif' },
];

export default function WidgetsPage() {
  const { data: session } = useSession();
  const streamerId = (session?.user as any)?.username || (session?.user as any)?.streamerId || 'streamerza';
  const [activeTab, setActiveTab] = useState<'alert' | 'goal' | 'top' | 'recent'>('alert');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [recentMode, setRecentMode] = useState<'list' | 'ticker'>('list');
  const [alertSize, setAlertSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [goalSize, setGoalSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');

  // Streamer alert settings state
  const [alertSettings, setAlertSettings] = useState({
    template: '{name} โดเนท {amount} บาท: {message}',
    minAmountForAlert: 5,
    minAmountForTTS: 10,
    duration: 7,
    soundUrl: 'levelup',
    soundVolume: 80,
    imageUrl: GIF_PRESETS[0].url,
    ttsEnabled: true,
    ttsVoice: 'th-TH',
    ttsSpeed: 1.0,
    ttsPitch: 1.0,
    ttsVolume: 90,
    textColor: '#00e5ff',
    highlightColor: '#ff9800',
    fontFamily: 'Prompt, sans-serif',
  });

  // Goal settings state (Image 2 style)
  const [goalSettings, setGoalSettings] = useState({
    title: '🎯 ยำวุ้นเส้น',
    targetAmount: 200,
    currentAmount: 100,
    endDate: '2026-12-31',
    barColor: '#00a8ff',
    backgroundColor: 'rgba(24, 24, 27, 0.85)',
    textColor: '#ffffff',
    showPercentage: true,
  });

  // Top donors settings state
  const [topSettings, setTopSettings] = useState({
    period: 'month' as 'all_time' | 'month' | 'week' | 'day',
    limit: 5,
    title: '🏆 ผู้สนับสนุนสูงสุดประจำเดือน',
  });

  // Fetch current settings
  useEffect(() => {
    fetch(`/api/streamer?id=${streamerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          if (data.data.alertSettings) setAlertSettings((prev) => ({ ...prev, ...data.data.alertSettings }));
          if (data.data.goalSettings) setGoalSettings((prev) => ({ ...prev, ...data.data.goalSettings }));
          if (data.data.topDonorsSettings) setTopSettings((prev) => ({ ...prev, ...data.data.topDonorsSettings }));
        }
      })
      .catch((e) => console.error(e));
  }, [streamerId]);

  const copyToClipboard = (path: string, id: string) => {
    if (typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}${path}`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedUrl(id);
      setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/streamer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: streamerId,
          alertSettings,
          goalSettings,
          topDonorsSettings: topSettings,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewSound = async () => {
    await playAlertSound(alertSettings.soundUrl, alertSettings.soundVolume);
    if (alertSettings.ttsEnabled) {
      setTimeout(() => {
        speakText('คุณใจดี โดเนท 100 บาท: ขอบคุณสำหรับสตรีมสนุกๆ ครับ', {
          speed: alertSettings.ttsSpeed,
          pitch: alertSettings.ttsPitch,
          volume: alertSettings.ttsVolume,
        });
      }, 600);
    }
  };

  const handleTriggerTestAlert = async () => {
    await fetch('/api/donations/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        streamerId,
        donorName: '039thanapoom_',
        amount: 500,
        message: 'ทดสอบป๊อปอัปแจ้งเตือน TipDee สวยงามคมชัด 100%!',
        enableTTS: alertSettings.ttsEnabled,
      }),
    });
    handlePreviewSound();
  };

  const goalPercent = Math.min(100, Math.round((goalSettings.currentAmount / (goalSettings.targetAmount || 1)) * 100));

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col">
      <Navbar streamerId={streamerId} />

      <div className="flex flex-1">
        <Sidebar streamerId={streamerId} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                <Tv className="h-5 w-5 text-emerald-400" />
                <span>วิดเจ็ตสตรีมเมอร์ (OBS Widgets Studio)</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                ปรับแต่งหน้าตา กล่องแจ้งเตือน เสียง เอฟเฟกต์ TTS และแถบเป้าหมายสำหรับใส่ใน OBS Studio
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              >
                {saveSuccess ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                <span>{isSaving ? 'กำลังบันทึก...' : saveSuccess ? 'บันทึกเรียบร้อย!' : 'บันทึกการตั้งค่า'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pb-3 border-b border-white/[0.06]">
            <button
              onClick={() => setActiveTab('alert')}
              aria-pressed={activeTab === 'alert'}
              className={`h-11 w-full flex items-center justify-center gap-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                activeTab === 'alert'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Bell className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">กล่องแจ้งเตือน (Alert Box)</span>
            </button>

            <button
              onClick={() => setActiveTab('goal')}
              aria-pressed={activeTab === 'goal'}
              className={`h-11 w-full flex items-center justify-center gap-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                activeTab === 'goal'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Target className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">แถบเป้าหมาย (Donation Goal)</span>
            </button>

            <button
              onClick={() => setActiveTab('top')}
              aria-pressed={activeTab === 'top'}
              className={`h-11 w-full flex items-center justify-center gap-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                activeTab === 'top'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Trophy className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">อันดับผู้บริจาค (Top Donors)</span>
            </button>

            <button
              onClick={() => setActiveTab('recent')}
              aria-pressed={activeTab === 'recent'}
              className={`h-11 w-full flex items-center justify-center gap-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                activeTab === 'recent'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Layers className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">ผู้บริจาคล่าสุด (Recent Feed)</span>
            </button>
          </div>

          {/* TAB 1: Alert Box */}
          {activeTab === 'alert' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Settings Form */}
              <div className="lg:col-span-7 space-y-5">
                {/* OBS URL Box */}
                <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c1017] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Tv className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" /> ลิงก์ URL สำหรับ Alert Box (OBS)
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400">
                      ขนาดแนะนำ: {alertSize === 'sm' ? '650 x 240' : alertSize === 'lg' ? '1000 x 380' : alertSize === 'xl' ? '1200 x 450' : '800 x 300'} px
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={
                        typeof window !== 'undefined'
                          ? `${window.location.origin}/widget/alert/${streamerId}${alertSize !== 'md' ? `?size=${alertSize}` : ''}`
                          : `/widget/alert/${streamerId}${alertSize !== 'md' ? `?size=${alertSize}` : ''}`
                      }
                      className="w-full flex-1 min-w-0 rounded-lg bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 text-xs font-mono text-slate-300 select-all focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                    />
                    <div className="flex items-center gap-1.5 flex-shrink-0 justify-end sm:justify-start">
                      <button
                        onClick={() =>
                          copyToClipboard(`/widget/alert/${streamerId}${alertSize !== 'md' ? `?size=${alertSize}` : ''}`, 'alert-box')
                        }
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                      >
                        {copiedUrl === 'alert-box' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedUrl === 'alert-box' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                      <Link
                        href={`/widget/alert/${streamerId}${alertSize !== 'md' ? `?size=${alertSize}` : ''}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                        title="เปิดหน้าต่างแยก"
                        aria-label="เปิดหน้าต่างวิดเจ็ตในแท็บใหม่"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Alert Size Selector */}
                  <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs text-slate-400">ขนาดความคมชัด (Resolution Size):</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { id: 'sm', label: 'กะทัดรัด (650px)' },
                        { id: 'md', label: 'มาตรฐาน (800px)' },
                        { id: 'lg', label: 'ใหญ่ (1000px)' },
                        { id: 'xl', label: 'ใหญ่พิเศษ 4K (1200px)' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setAlertSize(s.id as any)}
                          className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                            alertSize === s.id
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                              : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 border-white/[0.08]'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Media & Image Selection */}
                <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0c1017] space-y-4">
                  <h3 className="text-sm font-bold text-white">1. ภาพและแอนิเมชัน (Image / GIF)</h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {GIF_PRESETS.map((gif) => (
                      <button
                        key={gif.id}
                        type="button"
                        onClick={() => setAlertSettings({ ...alertSettings, imageUrl: gif.url })}
                        className={`p-2 rounded-lg border text-left transition-colors flex flex-col items-center gap-2 ${
                          alertSettings.imageUrl === gif.url
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                        }`}
                      >
                        <img src={gif.url} alt={gif.name} className="h-16 w-16 object-contain rounded" />
                        <span className="text-[10px] font-medium text-slate-300 text-center truncate w-full">
                          {gif.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">หรือระบุลิงก์รูปภาพ/GIF เอง (Custom URL):</label>
                    <input
                      type="text"
                      value={alertSettings.imageUrl}
                      onChange={(e) => setAlertSettings({ ...alertSettings, imageUrl: e.target.value })}
                      placeholder="https://.../my-gif.gif"
                      className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Sound & Audio Settings */}
                <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0c1017] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">2. เสียงแจ้งเตือน (Sound Effect)</h3>
                    <button
                      onClick={handlePreviewSound}
                      className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                    >
                      <Play className="h-3.5 w-3.5" /> ทดลองฟังเสียง
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">เลือกเสียงเอฟเฟกต์:</label>
                      <select
                        value={alertSettings.soundUrl}
                        onChange={(e) => setAlertSettings({ ...alertSettings, soundUrl: e.target.value })}
                        className="w-full rounded-lg bg-[#141822] border border-white/[0.08] px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        {SOUND_PRESETS.map((snd) => (
                          <option key={snd.id} value={snd.id}>
                            {snd.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                        <span>ระดับความดังเสียง (Volume):</span>
                        <span className="font-bold text-white tabular-nums">{alertSettings.soundVolume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={alertSettings.soundVolume}
                        onChange={(e) => setAlertSettings({ ...alertSettings, soundVolume: Number(e.target.value) })}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* TTS Speech Settings */}
                <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0c1017] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>3. เสียงอ่านสิริ (Siri Thai TTS)</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          เสียงสิริแท้ 100%
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">อ่านชื่อผู้บริจาคและข้อความภาษาไทยด้วยเสียงสิริยอดฮิตของสตรีมเมอร์</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alertSettings.ttsEnabled}
                        onChange={(e) => setAlertSettings({ ...alertSettings, ttsEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  {alertSettings.ttsEnabled && (
                    <div className="space-y-4 pt-2 border-t border-white/[0.06]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                            <span>ความเร็วในการอ่าน (Speed):</span>
                            <span className="font-bold text-white tabular-nums">{alertSettings.ttsSpeed}x</span>
                          </div>
                          <input
                            type="range"
                            min="0.7"
                            max="1.5"
                            step="0.1"
                            value={alertSettings.ttsSpeed}
                            onChange={(e) => setAlertSettings({ ...alertSettings, ttsSpeed: Number(e.target.value) })}
                            className="w-full accent-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 mb-1.5">ยอดเงินขั้นต่ำที่จะอ่านออกเสียง (บาท):</label>
                          <input
                            type="number"
                            value={alertSettings.minAmountForTTS}
                            onChange={(e) => setAlertSettings({ ...alertSettings, minAmountForTTS: Number(e.target.value) })}
                            className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-slate-400">ทดสอบฟังเสียงสิริในหน้านี้:</span>
                        <button
                          type="button"
                          onClick={() => {
                            speakText('ผู้สนับสนุนใจดี โดเนท 100 บาท ข้อความ: ทดสอบเสียงสิริ TipDee สำเร็จแล้วครับ!', {
                              speed: alertSettings.ttsSpeed,
                              volume: 90,
                            });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-colors"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                          <span>🔊 ทดสอบฟังเสียงสิริ</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Display & Text Customization */}
                <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0c1017] space-y-4">
                  <h3 className="text-sm font-bold text-white">4. ข้อความและสี (Text & Appearance)</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">ระยะเวลาแสดงผล (วินาที):</label>
                      <input
                        type="number"
                        min="3"
                        max="20"
                        value={alertSettings.duration}
                        onChange={(e) => setAlertSettings({ ...alertSettings, duration: Number(e.target.value) })}
                        className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">สีชื่อผู้โดเนท (Donor Name Color):</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={alertSettings.highlightColor}
                          onChange={(e) => setAlertSettings({ ...alertSettings, highlightColor: e.target.value })}
                          className="h-8 w-10 rounded cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={alertSettings.highlightColor}
                          onChange={(e) => setAlertSettings({ ...alertSettings, highlightColor: e.target.value })}
                          className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">สีจำนวนเงิน (Amount Color):</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={alertSettings.textColor}
                          onChange={(e) => setAlertSettings({ ...alertSettings, textColor: e.target.value })}
                          className="h-8 w-10 rounded cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={alertSettings.textColor}
                          onChange={(e) => setAlertSettings({ ...alertSettings, textColor: e.target.value })}
                          className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Color Presets */}
                  <div className="pt-2 border-t border-white/[0.06]">
                    <span className="block text-[11px] text-slate-400 mb-2">ชุดสียอดนิยม (Quick Color Presets):</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setAlertSettings({ ...alertSettings, highlightColor: '#ff9800', textColor: '#00e5ff' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ff9800]"></span>
                        <span className="h-2.5 w-2.5 rounded-full bg-[#00e5ff]"></span>
                        ⭐ สตรีมเมอร์โปร (ส้ม/ฟ้า)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAlertSettings({ ...alertSettings, highlightColor: '#ec4899', textColor: '#38bdf8' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ec4899]"></span>
                        <span className="h-2.5 w-2.5 rounded-full bg-[#38bdf8]"></span>
                        💎 Cyberpunk (ชมพู/ฟ้า)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAlertSettings({ ...alertSettings, highlightColor: '#22c55e', textColor: '#ffffff' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]"></span>
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ffffff]"></span>
                        🌿 Classic Emerald (เขียว/ขาว)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Column */}
              <div className="lg:col-span-5 space-y-4">
                <div className="sticky top-20 rounded-xl border border-white/[0.08] bg-[#0c1017] p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Tv className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span>ตัวอย่างแสดงผลสด (Live Preview)</span>
                    </h3>
                    <button
                      onClick={handleTriggerTestAlert}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                    >
                      ยิงทดสอบทันที
                    </button>
                  </div>

                  {/* OBS Box Simulation Container */}
                  <div className="relative w-full aspect-video rounded-lg bg-[#07090e] border border-white/[0.08] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                    {/* Background checkerboard for transparency preview */}
                    <div
                      className="absolute inset-0 opacity-15 pointer-events-none"
                      style={{
                        backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                      }}
                    />

                    {/* Pop-up Alert Preview Item (Side-by-side streamer layout matching Image 2) */}
                    <div className="relative z-10 flex items-center justify-center gap-3.5 sm:gap-5 animate-alert-pop p-2">
                      {alertSettings.imageUrl && (
                        <div className="flex-shrink-0 animate-character-bounce">
                          <img
                            src={alertSettings.imageUrl}
                            alt="Alert Animation"
                            className="h-20 w-20 sm:h-24 sm:w-24 object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)]"
                          />
                        </div>
                      )}

                      <div className="flex flex-col items-start text-left select-none space-y-0.5">
                        <div className="flex items-baseline flex-wrap gap-x-1.5 text-base sm:text-xl font-black leading-tight stream-text-stroke">
                          <span style={{ color: alertSettings.highlightColor || '#ff9800' }}>
                            039thanapoom_
                          </span>
                          <span className="text-white">
                            โดเนทมา
                          </span>
                        </div>
                        <div
                          className="text-2xl sm:text-3xl font-black tracking-tight leading-none my-0.5 stream-text-stroke"
                          style={{ color: alertSettings.textColor === '#ffffff' ? '#00e5ff' : alertSettings.textColor || '#00e5ff' }}
                        >
                          500฿
                        </div>
                        <span className="text-xs sm:text-sm font-black text-white stream-text-stroke-sm leading-snug mt-1 max-w-xs">
                          &quot;ทดสอบป๊อปอัปแจ้งเตือน TipDee สวยงามคมชัด 100%!&quot;
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    ตัวอย่างนี้จำลองการแสดงผลบน OBS Studio พร้อมเอฟเฟกต์สีและแอนิเมชัน
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Goal Bar */}
          {activeTab === 'goal' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-5">
                {/* OBS URL Box */}
                <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c1017] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" /> ลิงก์ URL สำหรับ Goal Widget (OBS)
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400">
                      ขนาดแนะนำ: {goalSize === 'sm' ? '450 x 100' : goalSize === 'lg' ? '750 x 160' : goalSize === 'xl' ? '900 x 190' : '600 x 130'} px
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={
                        typeof window !== 'undefined'
                          ? `${window.location.origin}/widget/goal/${streamerId}${goalSize !== 'md' ? `?size=${goalSize}` : ''}`
                          : `/widget/goal/${streamerId}${goalSize !== 'md' ? `?size=${goalSize}` : ''}`
                      }
                      className="w-full flex-1 min-w-0 rounded-lg bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 text-xs font-mono text-slate-300 select-all focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                    />
                    <div className="flex items-center gap-1.5 flex-shrink-0 justify-end sm:justify-start">
                      <button
                        onClick={() =>
                          copyToClipboard(`/widget/goal/${streamerId}${goalSize !== 'md' ? `?size=${goalSize}` : ''}`, 'goal-box')
                        }
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                      >
                        {copiedUrl === 'goal-box' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedUrl === 'goal-box' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                      <Link
                        href={`/widget/goal/${streamerId}${goalSize !== 'md' ? `?size=${goalSize}` : ''}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                        title="เปิดหน้าต่างแยก"
                        aria-label="เปิดหน้าต่างวิดเจ็ตในแท็บใหม่"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Goal Size Selector */}
                  <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs text-slate-400">ขนาดความคมชัด (Resolution Size):</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { id: 'sm', label: 'กะทัดรัด (450px)' },
                        { id: 'md', label: 'มาตรฐาน (600px)' },
                        { id: 'lg', label: 'ใหญ่ (750px)' },
                        { id: 'xl', label: 'ใหญ่พิเศษ 4K (900px)' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setGoalSize(s.id as any)}
                          className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                            goalSize === s.id
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                              : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 border-white/[0.08]'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* OBS Crispness Tip */}
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-slate-300 leading-relaxed">
                    💡 <strong className="text-white">วิธีใส่ใน OBS ให้ภาพคมชัด ไม่แตกเบลอ:</strong> เพิ่ม Browser Source ใส่ Width และ Height ตามขนาดที่แนะนำด้านบน <span className="text-amber-300 font-semibold">ห้ามใช้เมาส์ดึงขยายกรอบสีแดงใน OBS</span> เพราะจะทำให้ภาพเบลอ หากต้องการแถบใหญ่ขึ้น ให้กดเลือกขนาด &quot;ใหญ่ (Large)&quot; ด้านบนเพื่อความคมชัดแบบเวกเตอร์ 100%!
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0c1017] space-y-4">
                  <h3 className="text-sm font-bold text-white">ตั้งค่าเป้าหมายการระดมทุน (Donation Goal)</h3>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">หัวข้อเป้าหมาย (Title):</label>
                    <input
                      type="text"
                      value={goalSettings.title}
                      onChange={(e) => setGoalSettings({ ...goalSettings, title: e.target.value })}
                      placeholder="เช่น ยำวุ้นเส้น หรือ ซื้อการ์ดจอ RTX 4070"
                      className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">ยอดเป้าหมาย (บาท):</label>
                      <input
                        type="number"
                        value={goalSettings.targetAmount}
                        onChange={(e) => setGoalSettings({ ...goalSettings, targetAmount: Number(e.target.value) })}
                        className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">ยอดปัจจุบันสะสม (บาท):</label>
                      <input
                        type="number"
                        value={goalSettings.currentAmount}
                        onChange={(e) => setGoalSettings({ ...goalSettings, currentAmount: Number(e.target.value) })}
                        className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">วันสิ้นสุดเป้าหมาย (End Date):</label>
                      <input
                        type="date"
                        value={goalSettings.endDate || ''}
                        onChange={(e) => setGoalSettings({ ...goalSettings, endDate: e.target.value })}
                        className="w-full rounded-lg bg-[#141822] border border-white/[0.08] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">สีแถบความคืบหน้า (Bar Color):</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={goalSettings.barColor || '#00a8ff'}
                          onChange={(e) => setGoalSettings({ ...goalSettings, barColor: e.target.value })}
                          className="h-8 w-10 rounded cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={goalSettings.barColor || '#00a8ff'}
                          onChange={(e) => setGoalSettings({ ...goalSettings, barColor: e.target.value })}
                          className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Goal Color Presets */}
                  <div className="pt-2 border-t border-white/[0.06]">
                    <span className="block text-[11px] text-slate-400 mb-2">ชุดสียอดนิยมสำหรับแถบ Goal:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setGoalSettings({ ...goalSettings, barColor: '#00a8ff' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#00a8ff]"></span>
                        💧 ฟ้าสดใส (แบบรูปที่ 2)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoalSettings({ ...goalSettings, barColor: '#22c55e' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]"></span>
                        🌿 เขียวมรกต (Emerald Green)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoalSettings({ ...goalSettings, barColor: '#ec4899' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ec4899]"></span>
                        💖 ชมพูนีออน (Neon Pink)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoalSettings({ ...goalSettings, barColor: '#eab308' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#eab308]"></span>
                        ⭐ ทองสว่าง (Gold)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Goal Live Preview */}
              <div className="lg:col-span-5 space-y-4">
                <div className="sticky top-20 rounded-xl border border-white/[0.08] bg-[#0c1017] p-5 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Target className="h-4 w-4 text-emerald-400" />
                    <span>ตัวอย่าง Goal สไตล์ใหม่ (Live Preview)</span>
                  </h3>

                  {/* OBS Box Simulation Container */}
                  <div className="relative w-full aspect-video rounded-lg bg-[#07090e] border border-white/[0.08] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                    {/* Checkerboard for transparency indication */}
                    <div
                      className="absolute inset-0 opacity-15 pointer-events-none"
                      style={{
                        backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                      }}
                    />

                    {/* Image 2 Design Replication */}
                    <div className="relative z-10 w-full max-w-[360px] flex flex-col items-center select-none">
                      <h2
                        className="font-black text-white text-center text-lg sm:text-xl mb-2 tracking-wide"
                        style={{
                          textShadow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 2px #000000',
                        }}
                      >
                        {goalSettings.title || 'ยำวุ้นเส้น'}
                      </h2>

                      <div className="relative w-full h-10 sm:h-11 rounded-full bg-[#18181b]/90 border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] overflow-hidden flex items-center">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${goalPercent}%`,
                            backgroundColor: goalSettings.barColor || '#00a8ff',
                            boxShadow: `0 0 14px ${(goalSettings.barColor || '#00a8ff')}66`,
                          }}
                        />

                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span
                            className="font-black text-white text-sm sm:text-base tracking-wide"
                            style={{
                              textShadow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 3px #000000',
                            }}
                          >
                            {goalSettings.currentAmount.toLocaleString('th-TH')}฿ ({goalPercent}%)
                          </span>
                        </div>
                      </div>

                      <div
                        className="w-full flex justify-between items-center mt-2 px-1 text-xs font-bold text-white"
                        style={{
                          textShadow: '0 1px 3px rgba(0, 0, 0, 0.95), 0 0 2px #000000',
                        }}
                      >
                        <span>จากเป้าหมาย {goalSettings.targetAmount.toLocaleString('th-TH')}฿</span>
                        <span>สิ้นสุดใน 30 วัน</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    ตัวอย่างนี้จำลองการแสดงผล Goal สไตล์ใหม่บน OBS Studio (โปร่งใส 100% คมชัดระดับ 4K)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Top Donors */}
          {activeTab === 'top' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c1017] space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" /> ลิงก์ URL สำหรับ Top Donors Leaderboard (OBS)
                  </span>
                  <span className="text-[10px] text-slate-400">ขนาดแนะนำ: 400 x 500 px</span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== 'undefined' ? `${window.location.origin}/widget/top-donors/${streamerId}` : `/widget/top-donors/${streamerId}`}
                    className="w-full flex-1 min-w-0 rounded-lg bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 text-xs font-mono text-slate-300 select-all focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                  />
                  <div className="flex items-center gap-1.5 flex-shrink-0 justify-end sm:justify-start">
                    <button
                      onClick={() => copyToClipboard(`/widget/top-donors/${streamerId}`, 'top-box')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                    >
                      {copiedUrl === 'top-box' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedUrl === 'top-box' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                    </button>
                    <Link
                      href={`/widget/top-donors/${streamerId}`}
                      target="_blank"
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                      title="เปิดหน้าต่างแยก"
                      aria-label="เปิดหน้าต่างวิดเจ็ตในแท็บใหม่"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0c1017] space-y-4 max-w-xl">
                <h3 className="text-sm font-bold text-white">ตั้งค่าบอร์ดอันดับผู้บริจาค (Leaderboard)</h3>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">หัวข้อบอร์ด:</label>
                  <input
                    type="text"
                    value={topSettings.title}
                    onChange={(e) => setTopSettings({ ...topSettings, title: e.target.value })}
                    className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">ช่วงเวลาแสดงผล:</label>
                  <select
                    value={topSettings.period}
                    onChange={(e) => setTopSettings({ ...topSettings, period: e.target.value as any })}
                    className="w-full rounded-lg bg-[#141822] border border-white/[0.08] px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="month">ประจำเดือนปัจจุบัน (Monthly)</option>
                    <option value="week">ประจำสัปดาห์นี้ (Weekly)</option>
                    <option value="day">ประจำวันนี้ (Daily)</option>
                    <option value="all_time">ตลอดกาล (All-Time)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Recent Donors Feed */}
          {activeTab === 'recent' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c1017] space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" /> ลิงก์ URL สำหรับ Recent Donors (OBS)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {recentMode === 'ticker' ? 'ขนาดแนะนำ: 800 x 80 px (Ticker)' : 'ขนาดแนะนำ: 360 x 480 px (List)'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={
                      typeof window !== 'undefined'
                        ? `${window.location.origin}/widget/recent-donors/${streamerId}?mode=${recentMode}&limit=5`
                        : `/widget/recent-donors/${streamerId}?mode=${recentMode}&limit=5`
                    }
                    className="w-full flex-1 min-w-0 rounded-lg bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 text-xs font-mono text-slate-300 select-all focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                  />
                  <div className="flex items-center gap-1.5 flex-shrink-0 justify-end sm:justify-start">
                    <button
                      onClick={() => copyToClipboard(`/widget/recent-donors/${streamerId}?mode=${recentMode}&limit=5`, 'recent-box')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                    >
                      {copiedUrl === 'recent-box' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedUrl === 'recent-box' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                    </button>
                    <Link
                      href={`/widget/recent-donors/${streamerId}?mode=${recentMode}&limit=5`}
                      target="_blank"
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                      title="เปิดหน้าต่างแยก"
                      aria-label="เปิดหน้าต่างวิดเจ็ตในแท็บใหม่"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0c1017] space-y-4 max-w-xl">
                <h3 className="text-sm font-bold text-white">รูปแบบการแสดงผล (Display Layout)</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRecentMode('list')}
                    className={`p-3.5 rounded-lg border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                      recentMode === 'list'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white font-semibold'
                        : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1">แบบรายการแนวตั้ง (Vertical List)</div>
                    <p className="text-[11px] text-slate-400 font-normal">เหมาะสำหรับวางมุมซ้าย/ขวาของจอ</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecentMode('ticker')}
                    className={`p-3.5 rounded-lg border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                      recentMode === 'ticker'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white font-semibold'
                        : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1">แถบวิ่งแนวนอน (Horizontal Ticker)</div>
                    <p className="text-[11px] text-slate-400 font-normal">เหมาะสำหรับวางขอบบน/ล่างของจอ</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
