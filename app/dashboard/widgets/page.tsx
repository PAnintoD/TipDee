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
  Crown,
  Heart,
  Clock,
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
  const { data: session, status } = useSession();
  const streamerId = (session?.user as any)?.username || (session?.user as any)?.streamerId || (status === 'unauthenticated' ? 'streamerza' : '');
  const [activeTab, setActiveTab] = useState<'alert' | 'goal' | 'top' | 'recent'>('alert');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [recentMode, setRecentMode] = useState<'list' | 'ticker'>('list');
  const [alertSize, setAlertSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [goalSize, setGoalSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [topSize, setTopSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [recentSize, setRecentSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');

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
    themeColor: '#eab308',
    textColor: '#ffffff',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    style: 'card' as 'card' | 'compact',
  });

  // Recent donors settings state
  const [recentSettings, setRecentSettings] = useState({
    title: 'ผู้สนับสนุนล่าสุด',
    mode: 'list' as 'list' | 'ticker',
    limit: 5,
    themeColor: '#22c55e',
    textColor: '#ffffff',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    showTime: true,
    showMessage: true,
  });

  // Fetch current settings
  useEffect(() => {
    if (status === 'loading') return;
    const targetId = streamerId || 'streamerza';
    fetch(`/api/streamer?id=${targetId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          if (data.data.alertSettings) setAlertSettings((prev) => ({ ...prev, ...data.data.alertSettings }));
          if (data.data.goalSettings) setGoalSettings((prev) => ({ ...prev, ...data.data.goalSettings }));
          if (data.data.topDonorsSettings) setTopSettings((prev) => ({ ...prev, ...data.data.topDonorsSettings }));
          if (data.data.recentDonorsSettings) setRecentSettings((prev) => ({ ...prev, ...data.data.recentDonorsSettings }));
        }
      })
      .catch((e) => console.error(e));
  }, [streamerId, status]);

  const copyToClipboard = (path: string, id: string) => {
    if (typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}${path}`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedUrl(id);
      setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      const res = await fetch('/api/streamer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: streamerId,
          alertSettings,
          goalSettings,
          topDonorsSettings: topSettings,
          recentDonorsSettings: recentSettings,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSaveSuccess(true);
        if (data.data?.alertSettings) setAlertSettings((prev) => ({ ...prev, ...data.data.alertSettings }));
        if (data.data?.goalSettings) setGoalSettings((prev) => ({ ...prev, ...data.data.goalSettings }));
        if (data.data?.topDonorsSettings) setTopSettings((prev) => ({ ...prev, ...data.data.topDonorsSettings }));
        if (data.data?.recentDonorsSettings) setRecentSettings((prev) => ({ ...prev, ...data.data.recentDonorsSettings }));
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(data.error || 'บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        setTimeout(() => setSaveError(null), 5000);
      }
    } catch (err: any) {
      console.error('Save settings error:', err);
      setSaveError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      setTimeout(() => setSaveError(null), 5000);
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      <Navbar streamerId={streamerId} />

      <div className="flex flex-1">
        <Sidebar streamerId={streamerId} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                <Tv className="h-5 w-5 text-emerald-600" />
                <span>วิดเจ็ตสตรีมเมอร์ (OBS Widgets Studio)</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                ปรับแต่งหน้าตา กล่องแจ้งเตือน เสียง เอฟเฟกต์ TTS และแถบเป้าหมายสำหรับใส่ใน OBS Studio
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {saveError && (
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 animate-shake">
                  ⚠️ {saveError}
                </span>
              )}
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              >
                {saveSuccess ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                <span>{isSaving ? 'กำลังบันทึก...' : saveSuccess ? 'บันทึกเรียบร้อย!' : 'บันทึกการตั้งค่า'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pb-3 border-b border-slate-200/80">
            <button
              onClick={() => setActiveTab('alert')}
              aria-pressed={activeTab === 'alert'}
              className={`h-11 w-full flex items-center justify-center gap-2 px-3 rounded-xl text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                activeTab === 'alert'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/60 border border-slate-200/50'
              }`}
            >
              <Bell className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">กล่องแจ้งเตือน (Alert Box)</span>
            </button>

            <button
              onClick={() => setActiveTab('goal')}
              aria-pressed={activeTab === 'goal'}
              className={`h-11 w-full flex items-center justify-center gap-2 px-3 rounded-xl text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                activeTab === 'goal'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/60 border border-slate-200/50'
              }`}
            >
              <Target className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">แถบเป้าหมาย (Donation Goal)</span>
            </button>

            <button
              onClick={() => setActiveTab('top')}
              aria-pressed={activeTab === 'top'}
              className={`h-11 w-full flex items-center justify-center gap-2 px-3 rounded-xl text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                activeTab === 'top'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/60 border border-slate-200/50'
              }`}
            >
              <Trophy className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">อันดับผู้บริจาค (Top Donors)</span>
            </button>

            <button
              onClick={() => setActiveTab('recent')}
              aria-pressed={activeTab === 'recent'}
              className={`h-11 w-full flex items-center justify-center gap-2 px-3 rounded-xl text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                activeTab === 'recent'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/60 border border-slate-200/50'
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
                <div className="p-5 rounded-xl border border-slate-200/80 bg-white space-y-3.5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <Tv className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" /> ลิงก์ URL สำหรับ Alert Box (OBS)
                    </span>
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
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
                      className="w-full flex-1 min-w-0 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-mono text-slate-700 select-all focus:outline-none focus:bg-white focus:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500"
                    />
                    <div className="flex items-center gap-1.5 flex-shrink-0 justify-end sm:justify-start">
                      <button
                        onClick={() =>
                          copyToClipboard(`/widget/alert/${streamerId}${alertSize !== 'md' ? `?size=${alertSize}` : ''}`, 'alert-box')
                        }
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                      >
                        {copiedUrl === 'alert-box' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedUrl === 'alert-box' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                      <Link
                        href={`/widget/alert/${streamerId}${alertSize !== 'md' ? `?size=${alertSize}` : ''}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 border border-slate-200/60 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                        title="เปิดหน้าต่างแยก"
                        aria-label="เปิดหน้าต่างวิดเจ็ตในแท็บใหม่"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Alert Size Selector */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-600">ขนาดความคมชัด (Resolution Size):</span>
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
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Media & Image Selection */}
                <div className="p-5 rounded-xl border border-slate-200/80 bg-white space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900">1. ภาพและแอนิเมชัน (Image / GIF)</h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {GIF_PRESETS.map((gif) => (
                      <button
                        key={gif.id}
                        type="button"
                        onClick={() => setAlertSettings({ ...alertSettings, imageUrl: gif.url })}
                        className={`p-2.5 rounded-lg border text-left transition-colors flex flex-col items-center gap-2 ${
                          alertSettings.imageUrl === gif.url
                            ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500 shadow-xs'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
                        }`}
                      >
                        <img src={gif.url} alt={gif.name} className="h-16 w-16 object-contain rounded" />
                        <span className="text-[10px] font-medium text-slate-700 text-center truncate w-full">
                          {gif.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">หรือระบุลิงก์รูปภาพ/GIF เอง (Custom URL):</label>
                    <input
                      type="text"
                      value={alertSettings.imageUrl}
                      onChange={(e) => setAlertSettings({ ...alertSettings, imageUrl: e.target.value })}
                      placeholder="https://.../my-gif.gif"
                      className="w-full rounded-lg bg-slate-50/50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Sound & Audio Settings */}
                <div className="p-5 rounded-xl border border-slate-200/80 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">2. เสียงแจ้งเตือน (Sound Effect)</h3>
                    <button
                      onClick={handlePreviewSound}
                      className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      <Play className="h-3.5 w-3.5" /> ทดลองฟังเสียง
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">เลือกเสียงเอฟเฟกต์:</label>
                      <select
                        value={alertSettings.soundUrl}
                        onChange={(e) => setAlertSettings({ ...alertSettings, soundUrl: e.target.value })}
                        className="w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      >
                        {SOUND_PRESETS.map((snd) => (
                          <option key={snd.id} value={snd.id}>
                            {snd.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                        <span>ระดับความดังเสียง (Volume):</span>
                        <span className="font-bold text-slate-900 tabular-nums">{alertSettings.soundVolume}%</span>
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
                <div className="p-5 rounded-xl border border-slate-200/80 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>3. เสียงอ่านสิริ (Siri Thai TTS)</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          เสียงสิริแท้ 100%
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">อ่านชื่อผู้บริจาคและข้อความภาษาไทยด้วยเสียงสิริยอดฮิตของสตรีมเมอร์</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alertSettings.ttsEnabled}
                        onChange={(e) => setAlertSettings({ ...alertSettings, ttsEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {alertSettings.ttsEnabled && (
                    <div className="space-y-4 pt-3 border-t border-slate-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                            <span>ความเร็วในการอ่าน (Speed):</span>
                            <span className="font-bold text-slate-900 tabular-nums">{alertSettings.ttsSpeed}x</span>
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
                          <label className="block text-xs font-medium text-slate-600 mb-1.5">ยอดเงินขั้นต่ำที่จะอ่านออกเสียง (บาท):</label>
                          <input
                            type="number"
                            value={alertSettings.minAmountForTTS}
                            onChange={(e) => setAlertSettings({ ...alertSettings, minAmountForTTS: Number(e.target.value) })}
                            className="w-full rounded-lg bg-slate-50/50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-medium text-slate-600">ทดสอบฟังเสียงสิริในหน้านี้:</span>
                        <button
                          type="button"
                          onClick={() => {
                            speakText('ผู้สนับสนุนใจดี โดเนท 100 บาท ข้อความ: ทดสอบเสียงสิริ TipDee สำเร็จแล้วครับ!', {
                              speed: alertSettings.ttsSpeed,
                              volume: 90,
                            });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 shadow-xs transition-colors"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                          <span>🔊 ทดสอบฟังเสียงสิริ</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Display & Text Customization */}
                <div className="p-5 rounded-xl border border-slate-200/80 bg-white space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900">4. ข้อความและสี (Text & Appearance)</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">ระยะเวลาแสดงผล (วินาที):</label>
                      <input
                        type="number"
                        min="3"
                        max="20"
                        value={alertSettings.duration}
                        onChange={(e) => setAlertSettings({ ...alertSettings, duration: Number(e.target.value) })}
                        className="w-full rounded-lg bg-slate-50/50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">สีชื่อผู้โดเนท (Donor Name Color):</label>
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
                          className="w-full rounded-lg bg-slate-50/50 border border-slate-200 px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">สีจำนวนเงิน (Amount Color):</label>
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
                          className="w-full rounded-lg bg-slate-50/50 border border-slate-200 px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Color Presets */}
                  <div className="pt-3 border-t border-slate-100">
                    <span className="block text-[11px] font-medium text-slate-500 mb-2">ชุดสียอดนิยม (Quick Color Presets):</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setAlertSettings({ ...alertSettings, highlightColor: '#ff9800', textColor: '#00e5ff' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ff9800]"></span>
                        <span className="h-2.5 w-2.5 rounded-full bg-[#00e5ff]"></span>
                        ⭐ สตรีมเมอร์โปร (ส้ม/ฟ้า)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAlertSettings({ ...alertSettings, highlightColor: '#ec4899', textColor: '#38bdf8' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ec4899]"></span>
                        <span className="h-2.5 w-2.5 rounded-full bg-[#38bdf8]"></span>
                        💎 Cyberpunk (ชมพู/ฟ้า)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAlertSettings({ ...alertSettings, highlightColor: '#22c55e', textColor: '#ffffff' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
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
                <div className="sticky top-20 rounded-xl border border-slate-200/80 bg-white p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Tv className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span>ตัวอย่างแสดงผลสด (Live Preview)</span>
                    </h3>
                    <button
                      onClick={handleTriggerTestAlert}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                    >
                      ยิงทดสอบทันที
                    </button>
                  </div>

                  {/* OBS Box Simulation Container */}
                  <div className="relative w-full aspect-video rounded-lg bg-[#07090e] border border-slate-900/60 flex flex-col items-center justify-center p-6 text-center overflow-hidden shadow-inner">
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

                  <p className="text-[11px] text-slate-500 text-center">
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
                <div className="p-5 rounded-xl border border-slate-200/80 bg-white space-y-3.5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" /> ลิงก์ URL สำหรับ Goal Widget (OBS)
                    </span>
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
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
                      className="w-full flex-1 min-w-0 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-mono text-slate-700 select-all focus:outline-none focus:bg-white focus:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500"
                    />
                    <div className="flex items-center gap-1.5 flex-shrink-0 justify-end sm:justify-start">
                      <button
                        onClick={() =>
                          copyToClipboard(`/widget/goal/${streamerId}${goalSize !== 'md' ? `?size=${goalSize}` : ''}`, 'goal-box')
                        }
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                      >
                        {copiedUrl === 'goal-box' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedUrl === 'goal-box' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                      <Link
                        href={`/widget/goal/${streamerId}${goalSize !== 'md' ? `?size=${goalSize}` : ''}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 border border-slate-200/60 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                        title="เปิดหน้าต่างแยก"
                        aria-label="เปิดหน้าต่างวิดเจ็ตในแท็บใหม่"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Goal Size Selector */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-600">ขนาดความคมชัด (Resolution Size):</span>
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
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* OBS Crispness Tip */}
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-[11px] text-slate-700 leading-relaxed">
                    💡 <strong className="text-emerald-950 font-bold">วิธีใส่ใน OBS ให้ภาพคมชัด ไม่แตกเบลอ:</strong> เพิ่ม Browser Source ใส่ Width และ Height ตามขนาดที่แนะนำด้านบน <span className="text-amber-700 font-semibold">ห้ามใช้เมาส์ดึงขยายกรอบสีแดงใน OBS</span> เพราะจะทำให้ภาพเบลอ หากต้องการแถบใหญ่ขึ้น ให้กดเลือกขนาด &quot;ใหญ่ (Large)&quot; ด้านบนเพื่อความคมชัดแบบเวกเตอร์ 100%!
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-slate-200/80 bg-white space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900">ตั้งค่าเป้าหมายการระดมทุน (Donation Goal)</h3>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">หัวข้อเป้าหมาย (Title):</label>
                    <input
                      type="text"
                      value={goalSettings.title}
                      onChange={(e) => setGoalSettings({ ...goalSettings, title: e.target.value })}
                      placeholder="เช่น ยำวุ้นเส้น หรือ ซื้อการ์ดจอ RTX 4070"
                      className="w-full rounded-lg bg-slate-50/50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">ยอดเป้าหมาย (บาท):</label>
                      <input
                        type="number"
                        value={goalSettings.targetAmount}
                        onChange={(e) => setGoalSettings({ ...goalSettings, targetAmount: Number(e.target.value) })}
                        className="w-full rounded-lg bg-slate-50/50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">ยอดปัจจุบันสะสม (บาท):</label>
                      <input
                        type="number"
                        value={goalSettings.currentAmount}
                        onChange={(e) => setGoalSettings({ ...goalSettings, currentAmount: Number(e.target.value) })}
                        className="w-full rounded-lg bg-slate-50/50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">วันสิ้นสุดเป้าหมาย (End Date):</label>
                      <input
                        type="date"
                        value={goalSettings.endDate || ''}
                        onChange={(e) => setGoalSettings({ ...goalSettings, endDate: e.target.value })}
                        className="w-full rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">สีแถบความคืบหน้า (Bar Color):</label>
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
                          className="w-full rounded-lg bg-slate-50/50 border border-slate-200 px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Goal Color Presets */}
                  <div className="pt-3 border-t border-slate-100">
                    <span className="block text-[11px] font-medium text-slate-500 mb-2">ชุดสียอดนิยมสำหรับแถบ Goal:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setGoalSettings({ ...goalSettings, barColor: '#00a8ff' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#00a8ff]"></span>
                        💧 ฟ้าสดใส (แบบรูปที่ 2)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoalSettings({ ...goalSettings, barColor: '#22c55e' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]"></span>
                        🌿 เขียวมรกต (Emerald Green)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoalSettings({ ...goalSettings, barColor: '#ec4899' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ec4899]"></span>
                        💖 ชมพูนีออน (Neon Pink)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoalSettings({ ...goalSettings, barColor: '#eab308' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
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
                <div className="sticky top-20 rounded-xl border border-slate-200/80 bg-white p-5 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Target className="h-4 w-4 text-emerald-600" />
                    <span>ตัวอย่าง Goal สไตล์ใหม่ (Live Preview)</span>
                  </h3>

                  {/* OBS Box Simulation Container */}
                  <div className="relative w-full aspect-video rounded-lg bg-[#07090e] border border-slate-900/60 flex flex-col items-center justify-center p-6 text-center overflow-hidden shadow-inner">
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

                  <p className="text-[11px] text-slate-500 text-center">
                    ตัวอย่างนี้จำลองการแสดงผล Goal สไตล์ใหม่บน OBS Studio (โปร่งใส 100% คมชัดระดับ 4K)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Top Donors Leaderboard */}
          {activeTab === 'top' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Settings Column */}
              <div className="lg:col-span-7 space-y-5">
                {/* OBS URL Box */}
                <div className="p-5 rounded-xl border border-slate-200/80 bg-white space-y-3.5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <Trophy className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" /> ลิงก์ URL สำหรับ Top Donors Leaderboard (OBS)
                    </span>
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      ขนาดแนะนำ: {topSize === 'sm' ? '340 x 440' : topSize === 'lg' ? '520 x 660' : topSize === 'xl' ? '640 x 800' : '420 x 540'} px
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={
                        typeof window !== 'undefined'
                          ? `${window.location.origin}/widget/top-donors/${streamerId}${topSize !== 'md' ? `?size=${topSize}` : ''}`
                          : `/widget/top-donors/${streamerId}${topSize !== 'md' ? `?size=${topSize}` : ''}`
                      }
                      className="w-full flex-1 min-w-0 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-mono text-slate-700 select-all focus:outline-none focus:bg-white focus:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500"
                    />
                    <div className="flex items-center gap-1.5 flex-shrink-0 justify-end sm:justify-start">
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `/widget/top-donors/${streamerId}${topSize !== 'md' ? `?size=${topSize}` : ''}`,
                            'top-box'
                          )
                        }
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                      >
                        {copiedUrl === 'top-box' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedUrl === 'top-box' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                      <Link
                        href={`/widget/top-donors/${streamerId}${topSize !== 'md' ? `?size=${topSize}` : ''}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 border border-slate-200/60 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                        title="เปิดหน้าต่างแยก"
                        aria-label="เปิดหน้าต่างวิดเจ็ตในแท็บใหม่"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Resolution Size Selector */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-600">ขนาดความคมชัด (Resolution Size):</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { id: 'sm', label: 'กะทัดรัด (340px)' },
                        { id: 'md', label: 'มาตรฐาน (420px)' },
                        { id: 'lg', label: 'ใหญ่ (520px)' },
                        { id: 'xl', label: 'ใหญ่พิเศษ 4K (640px)' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setTopSize(s.id as any)}
                          className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                            topSize === s.id
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* OBS Crispness Tip */}
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-[11px] text-slate-700 leading-relaxed">
                    💡 <strong className="text-emerald-950 font-bold">วิธีใส่ใน OBS ให้ภาพคมชัด ไม่แตกเบลอ:</strong> เพิ่ม Browser Source ใส่ Width และ Height ตามขนาดที่แนะนำด้านบน <span className="text-amber-700 font-semibold">ห้ามใช้เมาส์ดึงขยายกรอบสีแดงใน OBS</span> เพราะจะทำให้ภาพเบลอ หากต้องการบอร์ดใหญ่ขึ้น ให้เลือกขนาด &quot;ใหญ่ (Large)&quot; ด้านบนเพื่อความคมชัดแบบเวกเตอร์ 100%!
                  </div>
                </div>

                {/* Top Donors Settings Form */}
                <div className="p-5 rounded-xl border border-slate-200/80 bg-white space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900">ตั้งค่าบอร์ดอันดับผู้บริจาค (Leaderboard Settings)</h3>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">หัวข้อบอร์ด (Title):</label>
                    <input
                      type="text"
                      value={topSettings.title}
                      onChange={(e) => setTopSettings({ ...topSettings, title: e.target.value })}
                      placeholder="เช่น 🏆 ผู้สนับสนุนสูงสุดประจำเดือน"
                      className="w-full rounded-lg bg-slate-50/50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">ช่วงเวลาจัดอันดับ (Time Period):</label>
                      <select
                        value={topSettings.period}
                        onChange={(e) => setTopSettings({ ...topSettings, period: e.target.value as any })}
                        className="w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="month">ประจำเดือนปัจจุบัน (Monthly)</option>
                        <option value="week">ประจำสัปดาห์นี้ (Weekly)</option>
                        <option value="day">ประจำวันนี้ (Daily)</option>
                        <option value="all_time">ตลอดกาล (All-Time)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">จำนวนอันดับที่แสดง (Display Limit):</label>
                      <select
                        value={topSettings.limit}
                        onChange={(e) => setTopSettings({ ...topSettings, limit: Number(e.target.value) })}
                        className="w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value={3}>แสดง 3 อันดับแรก</option>
                        <option value={5}>แสดง 5 อันดับแรก (แนะนำ)</option>
                        <option value={10}>แสดง 10 อันดับแรก</option>
                      </select>
                    </div>
                  </div>

                  {/* Theme / Accent Color */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      สีธีม / แสงเรืองแสงอันดับ 1 (Theme Accent Color):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={topSettings.themeColor || '#eab308'}
                        onChange={(e) => setTopSettings({ ...topSettings, themeColor: e.target.value })}
                        className="h-8 w-10 rounded cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={topSettings.themeColor || '#eab308'}
                        onChange={(e) => setTopSettings({ ...topSettings, themeColor: e.target.value })}
                        className="w-full rounded-lg bg-slate-50/50 border border-slate-200 px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Quick Color Presets for Top Donors */}
                  <div className="pt-3 border-t border-slate-100">
                    <span className="block text-[11px] font-medium text-slate-500 mb-2">ชุดสียอดนิยมสำหรับ Top Donors:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setTopSettings({ ...topSettings, themeColor: '#eab308' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#eab308]"></span>
                        🏆 ทองคำแชมเปียน (Gold)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTopSettings({ ...topSettings, themeColor: '#00e5ff' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#00e5ff]"></span>
                        💎 คริสตัล ไซเบอร์ (Diamond Cyan)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTopSettings({ ...topSettings, themeColor: '#22c55e' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]"></span>
                        🌿 มรกต TipDee (Emerald)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTopSettings({ ...topSettings, themeColor: '#ec4899' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ec4899]"></span>
                        💖 นีออน ปาร์ตี้ (Neon Pink)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTopSettings({ ...topSettings, themeColor: '#a855f7' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#a855f7]"></span>
                        🔮 รอยัล ไวโอเลต (Purple)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Column */}
              <div className="lg:col-span-5 space-y-4">
                <div className="sticky top-20 rounded-xl border border-slate-200/80 bg-white p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span>ตัวอย่าง Top Donors (Live Preview)</span>
                    </h3>
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      แสดงผลสด 100%
                    </span>
                  </div>

                  {/* OBS Box Simulation Container */}
                  <div className="relative w-full min-h-[380px] rounded-lg bg-[#07090e] border border-slate-900/60 flex flex-col items-center justify-center p-4 sm:p-5 overflow-hidden shadow-inner">
                    {/* Background checkerboard for transparency preview */}
                    <div
                      className="absolute inset-0 opacity-15 pointer-events-none"
                      style={{
                        backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                      }}
                    />

                    {/* Top Donors Live Render Simulation */}
                    <div
                      className="relative z-10 w-full max-w-[340px] rounded-3xl bg-[#0a0d14]/90 border border-white/15 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.85)] flex flex-col select-none"
                      style={{
                        boxShadow: `0 0 20px ${(topSettings.themeColor || '#eab308')}22, 0 16px 40px rgba(0,0,0,0.85)`,
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2">
                        <div className="flex items-center gap-1.5 overflow-hidden pr-1">
                          <div
                            className="p-1 rounded-lg flex items-center justify-center shadow-sm"
                            style={{
                              backgroundColor: `${topSettings.themeColor || '#eab308'}25`,
                              border: `1px solid ${topSettings.themeColor || '#eab308'}60`,
                            }}
                          >
                            <Crown className="h-3.5 w-3.5" style={{ color: topSettings.themeColor || '#eab308' }} />
                          </div>
                          <span
                            className="font-black text-white text-xs sm:text-sm truncate"
                            style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 2px #000000' }}
                          >
                            {topSettings.title || '🏆 ผู้สนับสนุนสูงสุด'}
                          </span>
                        </div>

                        <span
                          className="text-[10px] font-black rounded-full px-2 py-0.5 uppercase tracking-wider flex-shrink-0"
                          style={{
                            backgroundColor: `${topSettings.themeColor || '#eab308'}20`,
                            color: topSettings.themeColor || '#eab308',
                            border: `1px solid ${topSettings.themeColor || '#eab308'}50`,
                          }}
                        >
                          {topSettings.period === 'day'
                            ? 'วันนี้'
                            : topSettings.period === 'week'
                            ? 'สัปดาห์นี้'
                            : topSettings.period === 'all_time'
                            ? 'ตลอดกาล'
                            : 'เดือนนี้'}
                        </span>
                      </div>

                      {/* Donors list preview */}
                      <div className="space-y-1.5">
                        {[
                          { name: 'Sompong_GamerZ', amount: 3500 },
                          { name: 'Kittisak_Pro', amount: 1800 },
                          { name: 'NongPrae_Ch', amount: 950 },
                          { name: 'Nonthawat_TH', amount: 500 },
                          { name: 'StreamSupporter_99', amount: 300 },
                        ]
                          .slice(0, topSettings.limit || 5)
                          .map((d, idx) => {
                            const rank = idx + 1;
                            const isFirst = rank === 1;
                            const isSecond = rank === 2;
                            const isThird = rank === 3;

                            const themeColor = topSettings.themeColor || '#eab308';
                            const rowStyle = isFirst
                              ? {
                                  background: `linear-gradient(90deg, ${themeColor}33 0%, rgba(24, 24, 27, 0.95) 75%)`,
                                  border: `1.5px solid ${themeColor}`,
                                  boxShadow: `0 0 14px ${themeColor}33`,
                                }
                              : isSecond
                              ? {
                                  background: 'linear-gradient(90deg, rgba(226, 232, 240, 0.22) 0%, rgba(24, 24, 27, 0.92) 75%)',
                                  border: '1.5px solid rgba(226, 232, 240, 0.6)',
                                }
                              : isThird
                              ? {
                                  background: 'linear-gradient(90deg, rgba(217, 119, 6, 0.22) 0%, rgba(24, 24, 27, 0.92) 75%)',
                                  border: '1.5px solid rgba(217, 119, 6, 0.55)',
                                }
                              : {
                                  background: 'rgba(24, 24, 27, 0.85)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                };

                            const rankBadgeColor = isFirst
                              ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-black font-black'
                              : isSecond
                              ? 'bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-900 font-black'
                              : isThird
                              ? 'bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-black'
                              : 'bg-white/10 text-white/80 font-bold border border-white/10';

                            const amountColor = isFirst
                              ? themeColor
                              : isSecond
                              ? '#f1f5f9'
                              : isThird
                              ? '#fbbf24'
                              : '#38bdf8';

                            return (
                              <div
                                key={idx}
                                className="rounded-xl flex items-center justify-between py-1.5 px-2.5 transition-all"
                                style={rowStyle}
                              >
                                <div className="flex items-center gap-2 overflow-hidden pr-2">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${rankBadgeColor}`}
                                  >
                                    {isFirst ? '👑' : isSecond ? '2' : isThird ? '3' : `${rank}`}
                                  </div>
                                  <span
                                    className="text-xs font-black text-white truncate"
                                    style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 2px #000000' }}
                                  >
                                    {d.name}
                                  </span>
                                </div>
                                <span
                                  className="text-xs font-black stream-text-stroke-sm flex-shrink-0"
                                  style={{ color: amountColor }}
                                >
                                  {d.amount.toLocaleString('th-TH')}฿
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 text-center">
                    ตัวอย่างนี้จำลองการแสดงผล Top Donors บน OBS Studio (โปร่งใส 100% คมชัดระดับ 4K)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Recent Donors Feed */}
          {activeTab === 'recent' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Settings Column */}
              <div className="lg:col-span-7 space-y-5">
                {/* OBS URL Box */}
                <div className="p-5 rounded-xl border border-slate-200/80 bg-white space-y-3.5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" /> ลิงก์ URL สำหรับ Recent Donors (OBS)
                    </span>
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      {recentSettings.mode === 'ticker'
                        ? `ขนาดแนะนำ: ${recentSize === 'sm' ? '750 x 75' : recentSize === 'lg' ? '1200 x 110' : recentSize === 'xl' ? '1500 x 135' : '950 x 90'} px`
                        : `ขนาดแนะนำ: ${recentSize === 'sm' ? '340 x 440' : recentSize === 'lg' ? '520 x 660' : recentSize === 'xl' ? '640 x 780' : '420 x 540'} px`}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={
                        typeof window !== 'undefined'
                          ? `${window.location.origin}/widget/recent-donors/${streamerId}?mode=${recentSettings.mode}&limit=${recentSettings.limit}${recentSize !== 'md' ? `&size=${recentSize}` : ''}`
                          : `/widget/recent-donors/${streamerId}?mode=${recentSettings.mode}&limit=${recentSettings.limit}${recentSize !== 'md' ? `&size=${recentSize}` : ''}`
                      }
                      className="w-full flex-1 min-w-0 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-mono text-slate-700 select-all focus:outline-none focus:bg-white focus:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500"
                    />
                    <div className="flex items-center gap-1.5 flex-shrink-0 justify-end sm:justify-start">
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `/widget/recent-donors/${streamerId}?mode=${recentSettings.mode}&limit=${recentSettings.limit}${recentSize !== 'md' ? `&size=${recentSize}` : ''}`,
                            'recent-box'
                          )
                        }
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                      >
                        {copiedUrl === 'recent-box' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedUrl === 'recent-box' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                      <Link
                        href={`/widget/recent-donors/${streamerId}?mode=${recentSettings.mode}&limit=${recentSettings.limit}${recentSize !== 'md' ? `&size=${recentSize}` : ''}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 border border-slate-200/60 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                        title="เปิดหน้าต่างแยก"
                        aria-label="เปิดหน้าต่างวิดเจ็ตในแท็บใหม่"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Resolution Size Selector */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-600">ขนาดความคมชัด (Resolution Size):</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { id: 'sm', label: 'กะทัดรัด (Compact)' },
                        { id: 'md', label: 'มาตรฐาน (Standard)' },
                        { id: 'lg', label: 'ใหญ่ (Large)' },
                        { id: 'xl', label: 'ใหญ่พิเศษ 4K (Ultra)' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setRecentSize(s.id as any)}
                          className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                            recentSize === s.id
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* OBS Crispness Tip */}
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-[11px] text-slate-700 leading-relaxed">
                    💡 <strong className="text-emerald-950 font-bold">วิธีใส่ใน OBS ให้ภาพคมชัด ไม่แตกเบลอ:</strong> เพิ่ม Browser Source ใส่ Width และ Height ตามขนาดที่แนะนำด้านบน <span className="text-amber-700 font-semibold">ห้ามใช้เมาส์ดึงขยายกรอบสีแดงใน OBS</span> เพราะจะทำให้ภาพเบลอ หากต้องการใหญ่ขึ้น ให้เลือกขนาด &quot;ใหญ่ (Large)&quot; ด้านบนเพื่อความคมชัดแบบเวกเตอร์ 100%!
                  </div>
                </div>

                {/* Display Layout Selector Card */}
                <div className="p-5 rounded-xl border border-slate-200/80 bg-white space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900">1. รูปแบบการจัดวาง (Display Layout)</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRecentSettings({ ...recentSettings, mode: 'list' })}
                      className={`p-3.5 rounded-lg border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                        recentSettings.mode === 'list'
                          ? 'border-emerald-500 bg-emerald-50/50 text-slate-900 font-semibold ring-1 ring-emerald-500 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="text-xs font-semibold mb-1 text-slate-900">แบบรายการแนวตั้ง (Vertical List)</div>
                      <p className="text-[11px] text-slate-500 font-normal">เหมาะสำหรับวางมุมซ้าย/ขวาของหน้าจอสตรีม</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRecentSettings({ ...recentSettings, mode: 'ticker' })}
                      className={`p-3.5 rounded-lg border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                        recentSettings.mode === 'ticker'
                          ? 'border-emerald-500 bg-emerald-50/50 text-slate-900 font-semibold ring-1 ring-emerald-500 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="text-xs font-semibold mb-1 text-slate-900">แถบวิ่งแนวนอน (Horizontal Ticker)</div>
                      <p className="text-[11px] text-slate-500 font-normal">เหมาะสำหรับวางชิดขอบบนหรือขอบล่างของหน้าจอ</p>
                    </button>
                  </div>
                </div>

                {/* Settings Form */}
                <div className="p-5 rounded-xl border border-slate-200/80 bg-white space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900">2. ตั้งค่าข้อความและสี (Appearance Settings)</h3>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">หัวข้อฟีด (Title):</label>
                    <input
                      type="text"
                      value={recentSettings.title}
                      onChange={(e) => setRecentSettings({ ...recentSettings, title: e.target.value })}
                      placeholder="เช่น ผู้สนับสนุนล่าสุด"
                      className="w-full rounded-lg bg-slate-50/50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">จำนวนรายการที่แสดง (Items Limit):</label>
                      <select
                        value={recentSettings.limit}
                        onChange={(e) => setRecentSettings({ ...recentSettings, limit: Number(e.target.value) })}
                        className="w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value={3}>แสดง 3 รายการล่าสุด</option>
                        <option value={5}>แสดง 5 รายการล่าสุด (แนะนำ)</option>
                        <option value={8}>แสดง 8 รายการล่าสุด</option>
                        <option value={10}>แสดง 10 รายการล่าสุด</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        สีไฮไลต์ยอดเงินและเรืองแสง (Accent Color):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={recentSettings.themeColor || '#22c55e'}
                          onChange={(e) => setRecentSettings({ ...recentSettings, themeColor: e.target.value })}
                          className="h-8 w-10 rounded cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={recentSettings.themeColor || '#22c55e'}
                          onChange={(e) => setRecentSettings({ ...recentSettings, themeColor: e.target.value })}
                          className="w-full rounded-lg bg-slate-50/50 border border-slate-200 px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Color Presets */}
                  <div className="pt-3 border-t border-slate-100">
                    <span className="block text-[11px] font-medium text-slate-500 mb-2">ชุดสียอดนิยม:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setRecentSettings({ ...recentSettings, themeColor: '#22c55e' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]"></span>
                        🌿 มรกต TipDee (Emerald)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecentSettings({ ...recentSettings, themeColor: '#00e5ff' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#00e5ff]"></span>
                        💧 ฟ้านีออน (Neon Cyan)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecentSettings({ ...recentSettings, themeColor: '#ec4899' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ec4899]"></span>
                        💖 ชมพูหวาน (Sweet Pink)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecentSettings({ ...recentSettings, themeColor: '#eab308' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#eab308]"></span>
                        ⭐ ทองสว่าง (Gold)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Column */}
              <div className="lg:col-span-5 space-y-4">
                <div className="sticky top-20 rounded-xl border border-slate-200/80 bg-white p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span>ตัวอย่าง Recent Donors (Live Preview)</span>
                    </h3>
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      {recentSettings.mode === 'ticker' ? 'โหมด Ticker' : 'โหมด List'}
                    </span>
                  </div>

                  {/* OBS Box Simulation Container */}
                  <div className="relative w-full min-h-[380px] rounded-lg bg-[#07090e] border border-slate-900/60 flex flex-col items-center justify-center p-4 sm:p-5 overflow-hidden shadow-inner">
                    {/* Background checkerboard for transparency preview */}
                    <div
                      className="absolute inset-0 opacity-15 pointer-events-none"
                      style={{
                        backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                      }}
                    />

                    {/* Recent Donors Simulation Content */}
                    {recentSettings.mode === 'ticker' ? (
                      /* Ticker Mode Preview */
                      <div
                        className="relative z-10 w-full rounded-full bg-[#0a0d14]/90 border border-white/15 py-2.5 px-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.85)] flex items-center gap-2.5 overflow-x-auto no-scrollbar select-none"
                        style={{
                          boxShadow: `0 0 20px ${(recentSettings.themeColor || '#22c55e')}22, 0 16px 40px rgba(0,0,0,0.85)`,
                        }}
                      >
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-black text-[11px] uppercase tracking-wider flex-shrink-0 shadow-sm"
                          style={{
                            backgroundColor: `${recentSettings.themeColor || '#22c55e'}25`,
                            color: recentSettings.themeColor || '#22c55e',
                            border: `1px solid ${recentSettings.themeColor || '#22c55e'}60`,
                          }}
                        >
                          <Heart className="h-3 w-3 fill-current animate-pulse" />
                          <span>โดเนทล่าสุด</span>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                          {[
                            { name: 'Chanon_Official', amount: 500 },
                            { name: 'Alice_Wonder', amount: 150 },
                            { name: 'Warut_Gamer', amount: 300 },
                          ].map((d, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-white/10 whitespace-nowrap flex-shrink-0 shadow-sm"
                            >
                              <span
                                className="text-white font-black text-xs"
                                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                              >
                                {d.name}
                              </span>
                              <span
                                className="font-black text-xs stream-text-stroke-sm"
                                style={{ color: recentSettings.themeColor || '#22c55e' }}
                              >
                                +{d.amount}฿
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* List Mode Preview */
                      <div
                        className="relative z-10 w-full max-w-[340px] rounded-3xl bg-[#0a0d14]/90 border border-white/15 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.85)] flex flex-col select-none"
                        style={{
                          boxShadow: `0 0 20px ${(recentSettings.themeColor || '#22c55e')}22, 0 16px 40px rgba(0,0,0,0.85)`,
                        }}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2">
                          <div className="flex items-center gap-1.5 overflow-hidden pr-1">
                            <div
                              className="p-1 rounded-lg flex items-center justify-center shadow-sm"
                              style={{
                                backgroundColor: `${recentSettings.themeColor || '#22c55e'}25`,
                                border: `1px solid ${recentSettings.themeColor || '#22c55e'}60`,
                              }}
                            >
                              <Clock className="h-3.5 w-3.5" style={{ color: recentSettings.themeColor || '#22c55e' }} />
                            </div>
                            <span
                              className="font-black text-white text-xs sm:text-sm truncate"
                              style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 2px #000000' }}
                            >
                              {recentSettings.title || 'ผู้สนับสนุนล่าสุด'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="relative flex h-2 w-2">
                              <span
                                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                                style={{ backgroundColor: recentSettings.themeColor || '#22c55e' }}
                              />
                              <span
                                className="relative inline-flex rounded-full h-2 w-2"
                                style={{ backgroundColor: recentSettings.themeColor || '#22c55e' }}
                              />
                            </span>
                            <span
                              className="text-[10px] font-black rounded-full px-2 py-0.5 uppercase tracking-wider"
                              style={{
                                backgroundColor: `${recentSettings.themeColor || '#22c55e'}20`,
                                color: recentSettings.themeColor || '#22c55e',
                                border: `1px solid ${recentSettings.themeColor || '#22c55e'}50`,
                              }}
                            >
                              LIVE FEED
                            </span>
                          </div>
                        </div>

                        {/* List preview */}
                        <div className="space-y-1.5">
                          {[
                            { name: 'Chanon_Official', amount: 500, time: 'เมื่อสักครู่', msg: 'สู้ๆ นะครับ สนุกมาก!' },
                            { name: 'Alice_Wonder', amount: 150, time: '8 น.ที่แล้ว', msg: 'ชอบคอนเทนต์นี้มากๆ เลยค่ะ' },
                            { name: 'Warut_Gamer', amount: 300, time: '15 น.ที่แล้ว', msg: '' },
                            { name: 'NongBaimon', amount: 1000, time: '30 น.ที่แล้ว', msg: 'ยินดีด้วยกับการอัปเกรดคอมใหม่ครับ' },
                            { name: 'Siravit_TH', amount: 50, time: '45 น.ที่แล้ว', msg: 'ค่าขนมครับ' },
                          ]
                            .slice(0, recentSettings.limit || 5)
                            .map((d, idx) => {
                              const themeColor = recentSettings.themeColor || '#22c55e';
                              return (
                                <div
                                  key={idx}
                                  className="rounded-xl bg-gradient-to-r from-slate-900/90 to-[#121620]/90 border border-white/10 p-2 flex items-center justify-between gap-2 shadow-sm"
                                >
                                  <div className="flex items-center gap-2 overflow-hidden pr-1">
                                    <div
                                      className="w-7 h-7 rounded-full flex items-center justify-center font-black text-white text-[11px] flex-shrink-0 shadow-sm"
                                      style={{
                                        background: `linear-gradient(135deg, ${themeColor}, #6366f1)`,
                                      }}
                                    >
                                      {d.name.slice(0, 1).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden space-y-0.5">
                                      <div className="flex items-center gap-1.5">
                                        <span
                                          className="text-xs font-black text-white truncate"
                                          style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 2px #000000' }}
                                        >
                                          {d.name}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium">{d.time}</span>
                                      </div>
                                      {d.msg && (
                                        <p
                                          className="text-[10px] text-slate-200/90 italic truncate"
                                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                                        >
                                          &quot;{d.msg}&quot;
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <span
                                    className="text-xs font-black stream-text-stroke-sm flex-shrink-0"
                                    style={{ color: themeColor }}
                                  >
                                    +{d.amount}฿
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 text-center">
                    ตัวอย่างนี้จำลองการแสดงผล Recent Donors บน OBS Studio (โปร่งใส 100% คมชัดระดับ 4K)
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
