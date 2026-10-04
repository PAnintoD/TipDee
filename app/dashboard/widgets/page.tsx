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
  { id: 'cat', name: '🐱 แมวดุ๊กดิ๊ก (Dancing Cat)', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z1anE4d2dmaHk4NXVycG43dnEycW10M2d4YWR0NmsyMzB5enFqdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/MDJ9IbxxvDUQM/giphy.gif' },
  { id: 'coins', name: '💰 เหรียญทองระเบิด (Gold Coins Explosion)', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2phdG1rZmd1cmY2ZHBqZ2R5M3N2NXE2aHFqZ3phdW81eHB1dzcxNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/l0Ex6kAKAoFRsFh6M/giphy.gif' },
  { id: 'anime', name: '✨ อนิเมะดีใจ (Anime Hype)', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWc1bXFxdXJ1aWpqZXNuZTh1M2JndWhrZXFwb3gwdm5xOWY4c2N5eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/artj92V8o75VPL7AeQ/giphy.gif' },
  { id: 'cheer', name: '🎉 ฉลองชัยชนะ (Victory Cheer)', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHpqdWZicTZoNmoxM3A5anF4MGRrOG95OTZ6OTd2dG14bjN2d29ybyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKSjRrfIPjeiVyM/giphy.gif' },
];

export default function WidgetsPage() {
  const { data: session } = useSession();
  const streamerId = (session?.user as any)?.username || (session?.user as any)?.streamerId || 'streamerza';
  const [activeTab, setActiveTab] = useState<'alert' | 'goal' | 'top' | 'recent'>('alert');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [recentMode, setRecentMode] = useState<'list' | 'ticker'>('list');

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
    textColor: '#ffffff',
    highlightColor: '#22c55e',
    fontFamily: 'Prompt, sans-serif',
  });

  // Goal settings state
  const [goalSettings, setGoalSettings] = useState({
    title: '🎯 เป้าหมาย: ซื้อการ์ดจอ RTX 4070',
    targetAmount: 20000,
    currentAmount: 8450,
    endDate: '2026-12-31',
    barColor: '#22c55e',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
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
        donorName: 'ผู้ชมตัวอย่าง ⭐',
        amount: 150,
        message: 'ทดสอบป๊อปอัปแจ้งเตือน TipDee สวยงาม 100%!',
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
              >
                {saveSuccess ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                <span>{isSaving ? 'กำลังบันทึก...' : saveSuccess ? 'บันทึกเรียบร้อย!' : 'บันทึกการตั้งค่า'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('alert')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'alert'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Bell className="h-4 w-4" />
              <span>กล่องแจ้งเตือน (Alert Box)</span>
            </button>

            <button
              onClick={() => setActiveTab('goal')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'goal'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Target className="h-4 w-4" />
              <span>แถบเป้าหมาย (Donation Goal)</span>
            </button>

            <button
              onClick={() => setActiveTab('top')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'top'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Trophy className="h-4 w-4" />
              <span>อันดับผู้บริจาค (Top Donors)</span>
            </button>

            <button
              onClick={() => setActiveTab('recent')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'recent'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>ผู้บริจาคล่าสุด (Recent Feed)</span>
            </button>
          </div>

          {/* TAB 1: Alert Box */}
          {activeTab === 'alert' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Settings Form */}
              <div className="lg:col-span-7 space-y-5">
                {/* OBS URL Box */}
                <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c1017] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Tv className="h-3.5 w-3.5 text-emerald-400" /> ลิงก์ URL สำหรับ OBS Browser Source
                    </span>
                    <span className="text-[10px] text-slate-400">ขนาดแนะนำ: 800 x 600 px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== 'undefined' ? `${window.location.origin}/widget/alert/${streamerId}` : `/widget/alert/${streamerId}`}
                      className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 text-xs font-mono text-slate-300 select-all focus:outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(`/widget/alert/${streamerId}`, 'alert-box')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors flex-shrink-0"
                    >
                      {copiedUrl === 'alert-box' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedUrl === 'alert-box' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                    </button>
                    <Link
                      href={`/widget/alert/${streamerId}`}
                      target="_blank"
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors flex-shrink-0"
                      title="เปิดหน้าต่างแยก"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
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
                      <h3 className="text-sm font-bold text-white">3. เสียงอ่านข้อความ (TTS - Text-to-Speech)</h3>
                      <p className="text-xs text-slate-400 mt-0.5">อ่านชื่อผู้บริจาคและข้อความภาษาไทยอัตโนมัติ</p>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
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
                      <label className="block text-xs text-slate-400 mb-1.5">สีเน้นไฮไลต์ (Highlight Color):</label>
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
                  </div>
                </div>
              </div>

              {/* Live Preview Column */}
              <div className="lg:col-span-5 space-y-4">
                <div className="sticky top-20 rounded-xl border border-white/[0.08] bg-[#0c1017] p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Tv className="h-4 w-4 text-emerald-400" />
                      <span>ตัวอย่างแสดงผลสด (Live Preview)</span>
                    </h3>
                    <button
                      onClick={handleTriggerTestAlert}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors shadow-sm"
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

                    {/* Pop-up Alert Preview Item */}
                    <div className="relative z-10 flex flex-col items-center space-y-3 animate-alert-pop">
                      {alertSettings.imageUrl && (
                        <img
                          src={alertSettings.imageUrl}
                          alt="Alert Animation"
                          className="h-24 w-24 object-contain"
                        />
                      )}

                      <div className="space-y-1">
                        <h4
                          className="text-base sm:text-lg font-bold tracking-wide"
                          style={{ color: alertSettings.textColor }}
                        >
                          <span style={{ color: alertSettings.highlightColor }}>
                            น้องมิว สายเปย์
                          </span>{' '}
                          โดเนท{' '}
                          <span style={{ color: alertSettings.highlightColor }} className="tabular-nums">
                            500 บาท
                          </span>
                        </h4>
                        <p className="text-xs text-slate-200 max-w-xs bg-black/60 px-3 py-1.5 rounded border border-white/[0.08]">
                          "เป็นกำลังใจให้พี่สตรีมเมอร์ สู้ๆ นะครับ!"
                        </p>
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
                {/* OBS URL */}
                <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c1017] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-emerald-400" /> ลิงก์ URL สำหรับ Goal Widget (OBS)
                    </span>
                    <span className="text-[10px] text-slate-400">ขนาดแนะนำ: 600 x 120 px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== 'undefined' ? `${window.location.origin}/widget/goal/${streamerId}` : `/widget/goal/${streamerId}`}
                      className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 text-xs font-mono text-slate-300 select-all focus:outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(`/widget/goal/${streamerId}`, 'goal-box')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors flex-shrink-0"
                    >
                      {copiedUrl === 'goal-box' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedUrl === 'goal-box' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                    </button>
                    <Link
                      href={`/widget/goal/${streamerId}`}
                      target="_blank"
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors flex-shrink-0"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0c1017] space-y-4">
                  <h3 className="text-sm font-bold text-white">ตั้งค่าเป้าหมายการระดมทุน (Donation Goal)</h3>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">หัวข้อเป้าหมาย:</label>
                    <input
                      type="text"
                      value={goalSettings.title}
                      onChange={(e) => setGoalSettings({ ...goalSettings, title: e.target.value })}
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
                      <label className="block text-xs text-slate-400 mb-1.5">สีแถบความคืบหน้า (Bar Color):</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={goalSettings.barColor}
                          onChange={(e) => setGoalSettings({ ...goalSettings, barColor: e.target.value })}
                          className="h-8 w-10 rounded cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={goalSettings.barColor}
                          onChange={(e) => setGoalSettings({ ...goalSettings, barColor: e.target.value })}
                          className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Goal Live Preview */}
              <div className="lg:col-span-5 space-y-4">
                <div className="sticky top-20 rounded-xl border border-white/[0.08] bg-[#0c1017] p-5 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Target className="h-4 w-4 text-emerald-400" />
                    <span>ตัวอย่าง Goal บน OBS</span>
                  </h3>

                  <div className="p-4 rounded-lg bg-[#07090e] border border-white/[0.08] space-y-2.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-white">
                      <span>{goalSettings.title}</span>
                      <span className="text-emerald-400 font-bold tabular-nums">{goalPercent}%</span>
                    </div>

                    <div className="h-3 w-full rounded-full bg-slate-850 overflow-hidden border border-white/[0.04]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${goalPercent}%`,
                          backgroundColor: goalSettings.barColor,
                        }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 font-medium tabular-nums">
                      <span>{goalSettings.currentAmount.toLocaleString('th-TH')} ฿</span>
                      <span>เป้าหมาย {goalSettings.targetAmount.toLocaleString('th-TH')} ฿</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Top Donors */}
          {activeTab === 'top' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c1017] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-emerald-400" /> ลิงก์ URL สำหรับ Top Donors Leaderboard (OBS)
                  </span>
                  <span className="text-[10px] text-slate-400">ขนาดแนะนำ: 400 x 500 px</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== 'undefined' ? `${window.location.origin}/widget/top-donors/${streamerId}` : `/widget/top-donors/${streamerId}`}
                    className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 text-xs font-mono text-slate-300 select-all focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(`/widget/top-donors/${streamerId}`, 'top-box')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors flex-shrink-0"
                  >
                    {copiedUrl === 'top-box' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedUrl === 'top-box' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                  <Link
                    href={`/widget/top-donors/${streamerId}`}
                    target="_blank"
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors flex-shrink-0"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
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
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-emerald-400" /> ลิงก์ URL สำหรับ Recent Donors (OBS)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {recentMode === 'ticker' ? 'ขนาดแนะนำ: 800 x 80 px (Ticker)' : 'ขนาดแนะนำ: 360 x 480 px (List)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={
                      typeof window !== 'undefined'
                        ? `${window.location.origin}/widget/recent-donors/${streamerId}?mode=${recentMode}&limit=5`
                        : `/widget/recent-donors/${streamerId}?mode=${recentMode}&limit=5`
                    }
                    className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 text-xs font-mono text-slate-300 select-all focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(`/widget/recent-donors/${streamerId}?mode=${recentMode}&limit=5`, 'recent-box')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors flex-shrink-0"
                  >
                    {copiedUrl === 'recent-box' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedUrl === 'recent-box' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                  <Link
                    href={`/widget/recent-donors/${streamerId}?mode=${recentMode}&limit=5`}
                    target="_blank"
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors flex-shrink-0"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0c1017] space-y-4 max-w-xl">
                <h3 className="text-sm font-bold text-white">รูปแบบการแสดงผล (Display Layout)</h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRecentMode('list')}
                    className={`p-3.5 rounded-lg border text-left transition-colors ${
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
                    className={`p-3.5 rounded-lg border text-left transition-colors ${
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
