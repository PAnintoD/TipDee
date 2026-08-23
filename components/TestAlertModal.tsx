'use client';

import React, { useState } from 'react';
import { Bell, Sparkles, X, Volume2, Send, CheckCircle2, Play } from 'lucide-react';
import { playAlertSound, SOUND_PRESETS } from '@/lib/soundEffects';
import { speakText } from '@/lib/ttsEngine';

interface TestAlertModalProps {
  streamerId?: string;
  onClose: () => void;
}

export function TestAlertModal({ streamerId = 'streamerza', onClose }: TestAlertModalProps) {
  const [donorName, setDonorName] = useState('Tester Gamer 🚀');
  const [amount, setAmount] = useState('100');
  const [message, setMessage] = useState('ทดสอบระบบแจ้งเตือน TipDee โดเนทสำเร็จ เสียง TTS และภาพแสดงผลปกติ!');
  const [enableTTS, setEnableTTS] = useState(true);
  const [selectedSound, setSelectedSound] = useState('levelup');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleTestAudioLocal = async () => {
    await playAlertSound(selectedSound, 80);
    if (enableTTS) {
      setTimeout(() => {
        speakText(`${donorName} โดเนท ${amount} บาท ข้อความ: ${message}`);
      }, 500);
    }
  };

  const handleSendToOBS = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setIsSuccess(false);

    try {
      const res = await fetch('/api/donations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamerId,
          donorName,
          amount: Number(amount) || 100,
          message,
          enableTTS,
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
        // Also play locally if previewing in dashboard
        handleTestAudioLocal();
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to trigger test alert', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#111622] border border-white/10 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ทดสอบการแจ้งเตือน (Test Alert)</h3>
              <p className="text-xs text-slate-400">ยิงสัญญาณแจ้งเตือนจำลองไปยัง OBS Browser Source ทันที</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSendToOBS} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">ชื่อผู้บริจาค (Donor Name)</label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="เช่น นายใจดี สายเปย์"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">จำนวนเงิน (Amount บาท)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="100"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">ข้อความโดเนท (Donation Message)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="w-full rounded-xl bg-slate-900 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
              placeholder="พิมพ์ข้อความที่ต้องการทดสอบ..."
            />
          </div>

          {/* Sound & TTS Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">เสียงแจ้งเตือน (Sound Effect)</label>
              <select
                value={selectedSound}
                onChange={(e) => setSelectedSound(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs text-white focus:border-brand-500 focus:outline-none"
              >
                {SOUND_PRESETS.map((snd) => (
                  <option key={snd.id} value={snd.id}>
                    {snd.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-white/10 cursor-pointer hover:bg-slate-800/80 transition-colors">
                <input
                  type="checkbox"
                  checked={enableTTS}
                  onChange={(e) => setEnableTTS(e.target.checked)}
                  className="rounded text-brand-500 focus:ring-0 h-4 w-4 bg-slate-800 border-slate-700"
                />
                <span className="text-xs font-medium text-slate-200">เปิดอ่านออกเสียง (TTS)</span>
              </label>
            </div>
          </div>

          {/* Status Message */}
          {isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-bounce-short">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>ส่งแจ้งเตือนไปยัง OBS และส่งสัญญาณเสียงเรียบร้อยแล้ว!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestAudioLocal}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-white/10 transition-all"
            >
              <Play className="h-3.5 w-3.5 text-brand-400" />
              <span>ฟังเสียงตัวอย่าง</span>
            </button>

            <button
              type="submit"
              disabled={isSending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-bold shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{isSending ? 'กำลังยิงสัญญาณ...' : 'ยิงแจ้งเตือนเข้า OBS'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
